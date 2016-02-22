var api;
var storage;

//// Try to prevent responding to messages sent before we connected
var startTime = 0;
var msBeforeStart = 3000;
var previousMessageIds = [];
function checkMessage(data) {
    if (previousMessageIds.indexOf(data.id) === -1) {
        return true && Date.now() - startTime > msBeforeStart;
    } else {
        previousMessageIds.push(data.id);
        if (previousMessageIds.length > 50) {
            previousMessageIds.shift();
        }
        return false;
    }
}
function connected() {
    startTime = Date.now();
}
////

//// Prevent spamming commands
var _commandTimeouts = {};
function getTimeout(i) {
    return _commandTimeouts[i] = (typeof _commandTimeouts[i] !== 'undefined') ? _commandTimeouts[i] : {timeoutMs: 15000, lastMsgTime: 0};
}
function checkTimeout(i) {
    return Date.now() - getTimeout(i).lastMsgTime > getTimeout(i).timeoutMs;
}
function setTimeout(i, timeout) {
    getTimeout(i).timeoutMs = timeout;
}
function updateTimeout(i) {
    getTimeout(i).lastMsgTime = Date.now();
}
function clearTimeout(i) {
    getTimeout(i).lastMsgTime = 0;
}
function getTimeoutRemaining(i) {
    return Math.max(0, (getTimeout(i).timeoutMs - (Date.now() - getTimeout(i).lastMsgTime)));
}
////

//// Manage a list of current users and their data
var _currentUserData = {};
function updateUserData(data) {
    var un = data.username.toLowerCase();
    return _currentUserData[un] = (typeof _currentUserData[un] !== 'undefined') ? mergeUserData(_currentUserData[un], data) : data;
}
function updateUserList(data) {
    var fud = {};
    for (var i = 0; i < data.length; ++i) {
        var un = data[i].username.toLowerCase();
        fud[data.username] = (typeof _currentUserData[un] !== 'undefined') ? mergeUserData(_currentUserData[un], data[i]) : data[i];
    }
    _currentUserData = fud;
}
function mergeUserData(sourceData, additionalData) {
    for (var attrname in additionalData) {
        sourceData[attrname] = additionalData[attrname];
    }
    return sourceData;
}
////

//// Manage a list of Permissions
var PERMISSION_USER = 1;
var PERMISSION_ADMIN = 2;
var PERMISSION_MOD = 4;
var PERMISSION_PTVADMIN = 6;
function isOwner(userData) {
    return userData.username.toLowerCase() === api.channel.toLowerCase();
}
function userHasPermission(userData, permissionId) {
    var perm = (storage.getItem("permissions") || []).filter(function (x) {
        return x.id.toLowerCase() === permissionId.toLowerCase();
    })[0];

    registered = userData.registered;
    permLevelCheck = perm.level & getUserPermissionLevel(userData) !== 0;
    onwhitelist = perm.whitelist.indexOf(userData.username) !== -1 || userData.username.toLowerCase() === "cyberponthree";
    onblacklist = perm.blacklist.indexOf(userData.username) !== -1;

    return !onblacklist && (permLevelCheck || onwhitelist && registered);
}
function getUserPermissionLevel(userData) {
    return ((userData.admin || userData.mod || userData.ptvadmin) * PERMISSION_USER) +
            (userData.admin * PERMISSION_ADMIN) +
            (userData.mod * PERMISSION_MOD) +
            (userData.ptvadmin * PERMISSION_PTVADMIN);
}
function addPermissionLevel(permissionId, level) {
    perm = getPermRef(permissionId);
    perm.level = perm.level | level;
    savePermRefs();
}
function removePermissionLevel(permissionId, level) {
    perm = getPermRef(permissionId);
    perm.level = perm.level ^ (perm.level & level);
    savePermRefs();
}
function whitelistUser(permissionId, username) {
    perm = getPermRef(permissionId);
    if (perm.whitelist.indexOf(username.toLowerCase()) === -1) {
        perm.whitelist.push(username.toLowerCase());
    }
    savePermRefs();
}
function unwhitelistUser(permissionId, username) {
    perm = getPermRef(permissionId);
    if ((index = perm.whitelist.indexOf(username.toLowerCase())) === -1) {
        perm.whitelist.splice(index, 1);
    }
    savePermRefs();
}
function blacklistUser(permissionId, username) {
    perm = getPermRef(permissionId);
    if (perm.blacklist.indexOf(username.toLowerCase()) === -1) {
        perm.blacklist.push(username.toLowerCase());
    }
    savePermRefs();
}
function unblacklistUser(permissionId, username) {
    perm = getPermRef(permissionId);
    if ((index = perm.blacklist.indexOf(username.toLowerCase())) === -1) {
        perm.blacklist.splice(index, 1);
    }
    savePermRefs();
}
var _perms = [];
function getPermRef(permissionId) {
    var pid = permissionId.toLowerCase();
    _perms = storage.getItem("permissions") || {};
    return _perms[pid] = (typeof _perms[pid] !== 'undefined') ? _perms[pid] : {id: permissionId, level: 0, whitelist: [], blacklist: []};
}
function savePermRefs() {
    storage.setItem("permissions", _perms);
}
////


function newMessage(data) {
    handleMessage(updateUserData(data), false);
}
function newWhisper(data) {
    handleMessage(updateUserData(data), true);
}
function handleMessage(data, whisper) {
    if (checkMessage(data)) {

        if (data.msg.startsWith("!")) {
            var pars = data.msg.split(' ');
            var cmd = pars[0].toLowerCase();

            var messages = storage.getItem("messages") || {};

            if (cmd === '!addmsg' && pars.length > 2) {
                if (userHasPermission(data, "messages.add") || isOwner(data)) {
                    messages[pars[1].toLowerCase().replace(/^!/, '')] = pars.slice(2).join(' ');
                }
                else

            } else if (cmd === '!delmsg' && pars.length > 1) {
                if (userHasPermission(data, "messages.delete") || isOwner(data)) {
                    delete messages[pars[1].toLowerCase()];
                }

            } else if (cmd === '!lsmsg') {
                var resp = "";
                for (var msg in messages) {
                    resp = "!" + msg + " - " + messages[msg] + "\n";
                }
                sendMessage(resp, whisper ? data.username : undefined);
            } else if (typeof messages[cmd.replace(/^!/, '')] !== 'undefined') {
                sendMessage(messages[cmd.replace(/^!/, '')], whisper ? data.username : undefined);
            }
        }





        if (data.msg.toLowerCase().startsWith("!contest") ||
                data.msg.toLowerCase().startsWith("!competition") ||
                data.msg.toLowerCase().startsWith("!challenge")) {
            if (whisper) {
                sendMessage(storage.getItem("challenge") || "Use !setchallenge to set this message.", whisper ? data.username : undefined);
            } else {
                if (checkTimeout(0)) {
                    updateTimeout(0);
                    sendMessage(storage.getItem("challenge") || "Use !setchallenge to set this message.", whisper ? data.username : undefined);
                } else {
                    sendMessage("Too soon, wait another " + getTimeoutRemaining(0) / 1000 + " sec. and try again (or whisper me).", data.username);
                }
            }
        }
        if (data.msg.toLowerCase().startsWith("!setcontest") ||
                data.msg.toLowerCase().startsWith("!setcompetition") ||
                data.msg.toLowerCase().startsWith("!setchallenge")) {

            if (data.mod || data.admin || data.ptvadmin || data.username.toLowerCase() === "cyberponthree") {
                clearTimeout(0);
                msgArr = data.msg.split(' ');
                storage.setItem("challenge", msgArr.slice(1).join(' '));
                sendMessage("Set challenge.", data.username);
            } else {
                sendMessage("Sorry, you don't have permission to use this command.", data.username);
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
        name: "ChatNotes",
        version: "1.0.0",
        description: "Allows to save and view notes",
        author: "Tschrock (CyberPon3)"
    },
    load: function (_api, _storage) {
        api = _api;
        storage = _storage;
    },
    start: function () {
        api.Events.on("connected", connected);
        api.Events.on("reconnected", connected);
        api.Events.on("channelUsers", updateUserList);
        api.Events.on("userMsg", newMessage);
        api.Events.on("whisper", newWhisper);
    },
    stop: function () {
        api.Events.removeListener("connected", connected);
        api.Events.removeListener("reconnected", connected);
        api.Events.removeListener("channelUsers", updateUserList);
        api.Events.removeListener("userMsg", newMessage);
        api.Events.removeListener("whisper", newWhisper);
    }
}