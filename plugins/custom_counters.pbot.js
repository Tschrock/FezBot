var api;
var storage;

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
                    sendMessage(data, "Created new counter '" + pars[1].toLowerCase() + "'", true);
                } else {
                    sendMessage(data, "Usage: !createcounter <trigger> <countMessage>", true);
                }
            } else {
                sendMessage(data, "Sorry, you don't have permission to use this command.", true);
            }
        } else if (cmd === '!deletecounter') {
            if (api.permissions_manager.userHasPermission(data, "cmd.deletecounter") || api.permissions_manager.isOwner(data)) {
                if (pars.length > 1) {
                    delete __countersCache[pars[1].toLowerCase()];
                    saveCounters();
                } else {
                    sendMessage(data, "Usage: !deletecounter <trigger>", true);
                }
            } else {
                sendMessage(data, "Sorry, you don't have permission to use this command.", true);
            }

            if (cmd === '!clearcounter') {
                if (api.permissions_manager.userHasPermission(data, "cmd.createcounter") || api.permissions_manager.isOwner(data)) {
                    if (pars.length > 3) {
                        getCounter(pars[1].toLowerCase()).count = 0;
                        saveCounters();
                        sendMessage(data, "Cleared counter '" + pars[1].toLowerCase() + "'", true);
                    } else {
                        sendMessage(data, "Usage: !clearcounter <trigger>", true);
                    }
                } else {
                    sendMessage(data, "Sorry, you don't have permission to use this command.", true);
                }

            } else if (cmd === '!listcounters') {
                if (api.permissions_manager.userHasPermission(data, "cmd.listcounters") || api.permissions_manager.isOwner(data)) {
                    var resp = "Saved counters:";
                    for (var cnt in __countersCache = storage.getItem("counters") || {}) {
                        resp = "'" + cnt + "' - " + __countersCache[cnt].msg.substr(0, 30) + (__countersCache[cnt].msg.length > 30 ? "..." : "") + "\n";
                    }
                    sendMessage(data, resp, data.whisper);
                } else {
                    sendMessage(data, "Sorry, you don't have permission to use this command.", true);
                }

            } else if (cmd === '!getcountercount') {
                if (api.permissions_manager.userHasPermission(data, "cmd.getcountercount") || api.permissions_manager.isOwner(data)) {
                    if (pars.length > 1) {
                        var cnt = getCounter(pars[1].toLowerCase());
                        sendMessage(data, cnt.msg.replace('$count', cnt.count || 0), data.whisper);
                    } else {
                        sendMessage(data, "Usage: !getcountercount <trigger>", true);
                    }
                } else {
                    sendMessage(data, "Sorry, you don't have permission to use this command.", true);
                }

            }
        } else /*if (data.username.toLowerCase() !== api.name.toLowerCase())*/ {
            for (var cnt in __countersCache = storage.getItem("counters") || {}) {
                if (data.msg.toLowerCase().indexOf(cnt) !== -1) {
                    __countersCache[cnt].count++;
                    saveCounters();
                }
            }
        }
    }
}

function sendMessage(uData, txt, whisper) {
    if (typeof whisper !== 'undefined' && whisper) {
        api.Messages.whisper(uData.username, txt, uData.channel);
    } else {
        api.Messages.send(txt, uData.channel);
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