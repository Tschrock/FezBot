var api;

//// Try to prevent responding to messages send before we connected
var startTime;
var msBeforeStart = 1000;
var previousMessages = [];
function checkMessage(data) {
    if (previousMessages.indexOf(data.id) === -1) {
        return true && Date.now() - startTime > msBeforeStart;
    } else {
        previousMessages.push(data.id);
        if (previousMessages.length > 50) {
            previousMessages.shift();
        }
        return false;
    }
}
////

function newMessage(data) {
    handleMessage(data, false);
}
function newWhisper(data) {
    handleMessage(getUser(data), true);
}

function getUser(data) {
    var d = currentUserData.filter(function (x) {
                        return x.username === data.username;
                    })[0];
    for (var attrname in d) { data[attrname] = d[attrname]; }
    return data;
}

var RANDOM_PERMISSIONS_USER = 1;
var RANDOM_PERMISSIONS_ADMIN = 2;
var RANDOM_PERMISSIONS_MOD = 4;
var RANDOM_PERMISSIONS_PICARTOADMIN = 8;

var currentUserData = [];
var perm = 6;
var conf = 9;
function handleMessage(data, whisper) {
    if (checkMessage(data)) {

        if (data.msg.toLowerCase().startsWith("!help random") ||
                data.msg.toLowerCase().startsWith("!randomhelp") ||
                data.msg.toLowerCase().startsWith("!random help")) {
            sendMessage("Usage:\n!random - get a random user from chat.\n!randomconf <add|remove> <users|mods|admins|padmins> - change who to include in the raffle.\n!randomperm <add|remove> <users|mods|admins|padmins> - change who is allowed to get a random user.", data.username);
        } else if (data.msg.toLowerCase().startsWith("!randomconf")) {
            if (data.mod || data.admin || data.ptvadmin || data.username.toLowerCase() === "cyberponthree") {
                var cmds = data.msg.split(' ');
                if (cmds[1] == "add") {
                    switch (cmds[2]) {
                        case "user":
                        case "users":
                            conf = conf | RANDOM_PERMISSIONS_USER;
                            break;
                        case "mod":
                        case "mods":
                            conf = conf | RANDOM_PERMISSIONS_MOD;
                            break;
                        case "admin":
                        case "admins":
                            conf = conf | RANDOM_PERMISSIONS_ADMIN;
                            break;
                        case "padmin":
                        case "padmins":
                            conf = conf | RANDOM_PERMISSIONS_PICARTOADMIN;
                            break;
                    }
                    sendMessage("Updated randomconf.", data.username);
                } else if (cmds[1] == "del" || cmds[1] == "rem" || cmds[1] == "remove") {
                    switch (cmds[2]) {
                        case "user":
                        case "users":
                            conf = conf ^ RANDOM_PERMISSIONS_USER;
                            break;
                        case "mod":
                        case "mods":
                            conf = conf ^ RANDOM_PERMISSIONS_MOD;
                            break;
                        case "admin":
                        case "admins":
                            conf = conf ^ RANDOM_PERMISSIONS_ADMIN;
                            break;
                        case "padmin":
                        case "padmins":
                            conf = conf ^ RANDOM_PERMISSIONS_PICARTOADMIN;
                            break;
                    }
                    sendMessage("Updated randomconf.", data.username);
                } else {
                    sendMessage("Usage: \n!randomconf <add|remove> <[username]|users|mods|admins|padmins> - change who to include in the raffle.", data.username);
                }
            } else {
                sendMessage("Sorry, you don't have permission to use this command.", data.username);
            }
        } else if (data.msg.toLowerCase().startsWith("!randomperm")) {
            if (data.mod || data.admin || data.ptvadmin || data.username.toLowerCase() === "cyberponthree") {
                var cmds = data.msg.split(' ');
                if (cmds[1] == "add") {
                    switch (cmds[2]) {
                        case "user":
                        case "users":
                            perm = perm | RANDOM_PERMISSIONS_USER;
                            break;
                        case "mod":
                        case "mods":
                            perm = perm | RANDOM_PERMISSIONS_MOD;
                            break;
                        case "admin":
                        case "admins":
                            perm = perm | RANDOM_PERMISSIONS_ADMIN;
                            break;
                        case "padmin":
                        case "padmins":
                            perm = perm | RANDOM_PERMISSIONS_PICARTOADMIN;
                            break;
                    }
                    sendMessage("Updated randomconf.", data.username);
                } else if (cmds[1] == "del" || cmds[1] == "rem" || cmds[1] == "remove") {
                    switch (cmds[2]) {
                        case "user":
                        case "users":
                            perm = perm ^ RANDOM_PERMISSIONS_USER;
                            break;
                        case "mod":
                        case "mods":
                            perm = perm ^ RANDOM_PERMISSIONS_MOD;
                            break;
                        case "admin":
                        case "admins":
                            perm = perm ^ RANDOM_PERMISSIONS_ADMIN;
                            break;
                        case "padmin":
                        case "padmins":
                            perm = perm ^ RANDOM_PERMISSIONS_PICARTOADMIN;
                            break;
                    }
                    sendMessage("Updated randomperm.", data.username);
                } else {
                    sendMessage("Usage: \n!randomconf <add|remove> <[username]|users|mods|admins|padmins> - change who to include in the raffle.", data.username);
                }
            } else {
                sendMessage("Sorry, you don't have permission to use this command.", data.username);
            }
        } else if (data.msg.toLowerCase().startsWith("!random")) {
            if (checkUserPerm(data) || data.username.toLowerCase() === "cyberponthree") {
                var userArr = currentUserData.filter(function (x) {
                        return checkUserConf(x) && x.username.toLowerCase() !== api.name.toLowerCase();
                    });
                var ritem = userArr[Math.floor(Math.random() * userArr.length)];
                if (typeof ritem !== 'undefined') {
                    sendMessage("Random user: *[" + ritem.username + "]", whisper ? data.username : undefined);
                } else {
                    console.log("Error getting random user from list!");
                }
            } else {
                sendMessage("Sorry, you don't have permission to use this command.", data.username);
            }
        }
    }
}
function checkUserPerm(data) {
    return (perm & ((!(data.mod || data.admin || data.ptvadmin) * RANDOM_PERMISSIONS_USER) +
            (data.admin * RANDOM_PERMISSIONS_ADMIN) +
            (data.mod * RANDOM_PERMISSIONS_MOD) +
            (data.ptvadmin * RANDOM_PERMISSIONS_PICARTOADMIN))) != 0;
}
function checkUserConf(data) {
    return (conf & ((!(data.mod || data.admin || data.ptvadmin) * RANDOM_PERMISSIONS_USER) +
            (data.admin * RANDOM_PERMISSIONS_ADMIN) +
            (data.mod * RANDOM_PERMISSIONS_MOD) +
            (data.ptvadmin * RANDOM_PERMISSIONS_PICARTOADMIN))) != 0;
}

function sendMessage(txt, whisperUser) {
    if (typeof whisperUser !== 'undefined') {
        api.Messages.whisper(whisperUser, txt);
    } else {
        api.Messages.send(txt);
    }
}

function userUpdate(data) {
    currentUserData = data;
}

module.exports = {
    meta_inf: {
        name: "Random User",
        version: "1.0.0",
        description: "Gets a random user.",
        author: "Tschrock (CyberPon3)"
    },
    load: function (_api) {
        api = _api;
    },
    start: function () {
        startTime = Date.now();
        api.Events.on("channelUsers", userUpdate);
        api.Events.on("userMsg", newMessage);
        api.Events.on("whisper", newWhisper);
    },
    stop: function () {
        api.Events.removeListener("channelUsers", userUpdate);
        api.Events.removeListener("userMsg", newMessage);
        api.Events.removeListener("whisper", newWhisper);
    }
}