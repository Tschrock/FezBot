var api;
var storage;

function checkCommand(command, person, isWhisper, defaultTimeoutMs, defaultCmdPermission) {
    if (isWhisper || api.timeout_manager.checkTimeout("cmd." + command, defaultTimeoutMs) || api.permissions_manager.userHasPermission(person, "timeoutbypass.global") || api.permissions_manager.userHasPermission(person, "timeoutbypass.cmd." + command)) {
        if (api.permissions_manager.userHasPermission(person, "cmd." + command, defaultCmdPermission) || api.permissions_manager.isOwner(person)) {
            return true;
        } else {
            sendMessage("Sorry, you don't have permission to use this command.", person.username);
        }
    } else {
        sendMessage("Too soon, wait another " + api.timeout_manager.getTimeoutRemaining("command." + command) / 1000 + " sec. and try again (or whisper me).", person.username);
    }
    return false;
}

__countersCache = {};
function getCounter(trigger) {
    __countersCache = storage.getItem("counters") || {};
    return __countersCache[trigger] = (typeof __countersCache[trigger] !== 'undefined') ? __countersCache[trigger] : {count: 0, msg: "Chat has said '" + trigger + "' $count times."};
}

function saveCounters() {
    storage.setItem("counters", __countersCache);
}


function newMessage(data) {
    handleMessage(data, false);
}
function newWhisper(data) {
    handleMessage(data, true);
}
function handleMessage(data, whisper) {
    if (data.msg.startsWith("!")) {
        var pars = data.msg.split(' ');
        var cmd = pars[0].toLowerCase();

        if (cmd === '!createcounter') {
            if (api.permissions_manager.userHasPermission(data, "cmd.createcounter") || api.permissions_manager.isOwner(data)) {
                if (pars.length > 3) {
                    getCounter(pars[1].toLowerCase()).msg = pars.slice(2).join(' ');
                    saveCounters();
                    sendMessage("Created new counter '" + pars[1].toLowerCase() + "'", data.username);
                } else {
                    sendMessage("Usage: !createcounter <trigger> <countMessage>", data.username);
                }
            } else {
                sendMessage("Sorry, you don't have permission to use this command.", data.username);
            }
        } else if (cmd === '!deletecounter') {
            if (api.permissions_manager.userHasPermission(data, "cmd.deletecounter") || api.permissions_manager.isOwner(data)) {
                if (pars.length > 1) {
                    delete __countersCache[pars[1].toLowerCase()];
                    saveCounters();
                } else {
                    sendMessage("Usage: !deletecounter <trigger>", data.username);
                }
            } else {
                sendMessage("Sorry, you don't have permission to use this command.", data.username);
            }
            
        if (cmd === '!clearcounter') {
            if (api.permissions_manager.userHasPermission(data, "cmd.createcounter") || api.permissions_manager.isOwner(data)) {
                if (pars.length > 3) {
                    getCounter(pars[1].toLowerCase()).count = 0;
                    saveCounters();
                    sendMessage("Cleared counter '" + pars[1].toLowerCase() + "'", data.username);
                } else {
                    sendMessage("Usage: !clearcounter <trigger>", data.username);
                }
            } else {
                sendMessage("Sorry, you don't have permission to use this command.", data.username);
            }

        } else if (cmd === '!listcounters') {
            if (api.permissions_manager.userHasPermission(data, "cmd.listcounters") || api.permissions_manager.isOwner(data)) {
                var resp = "Saved counters:";
                for (var cnt in __countersCache = storage.getItem("counters") || {}) {
                    resp = "'" + cnt + "' - " + __countersCache[cnt].msg.substr(0, 30) + (__countersCache[cnt].msg.length > 30 ? "..." : "") + "\n";
                }
                sendMessage(resp, whisper ? data.username : undefined);
            } else {
                sendMessage("Sorry, you don't have permission to use this command.", data.username);
            }

        } else if (cmd === '!getcountercount') {
            if (api.permissions_manager.userHasPermission(data, "cmd.getcountercount") || api.permissions_manager.isOwner(data)) {
                if (pars.length > 1) {
                    var cnt = getCounter(pars[1].toLowerCase());
                    sendMessage(cnt.msg.replace('$count', cnt.count || 0), whisper ? data.username : undefined);
                } else {
                    sendMessage("Usage: !getcountercount <trigger>", data.username);
                }
            } else {
                sendMessage("Sorry, you don't have permission to use this command.", data.username);
            }

        }
    } else if(data.username.toLowerCase() !== api.name.toLowerCase()) {
        for (var cnt in __countersCache = storage.getItem("counters") || {}) {
            if(data.msg.toLowerCase().indexOf(cnt) !== -1) {
                __countersCache[cnt].count++;
                saveCounters();
            }
        }
    }
}

function sendMessage(txt, whisperUser) {
    if (typeof whisperUser !== 'undefined') {
        api.Messages.whisper(whisperUser, txt);
    } else {
        api.Messages.send(txt);
    }
}

module.exports = {
    meta_inf: {
        name: "Custom Counters",
        version: "1.0.0",
        description: "Allows to create counters",
        author: "Tschrock (CyberPon3)"
    },
    load: function (_api, _storage) {
        api = _api;
        storage = _storage;
    },
    start: function () {
        api.Events.on("userMsg", newMessage);
        api.Events.on("whisper", newWhisper);
    },
    stop: function () {
        api.Events.removeListener("userMsg", newMessage);
        api.Events.removeListener("whisper", newWhisper);
    }
}