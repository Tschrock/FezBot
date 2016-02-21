var api;
var storage;

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

minTimeBetweenMsg = 15000;
lastMsgTime = Date.now();

function newMessage(data) {
    handleMessage(data, false);
}
function newWhisper(data) {
    handleMessage(getUser(data), true);
}

var currentUserData = [];
function getUser(data) {
    var d = currentUserData.filter(function (x) {
        return x.username === data.username;
    })[0];
    for (var attrname in d) {
        data[attrname] = d[attrname];
    }
    return data;
}

function handleMessage(data, whisper) {
    if (checkMessage(data)) {

        if (data.msg.toLowerCase().startsWith("!contest") ||
                data.msg.toLowerCase().startsWith("!competition") ||
                data.msg.toLowerCase().startsWith("!challenge")) {
            if (whisper) {
                sendMessage(storage.getItem("message") || "Use !setchallenge to set this message.", whisper ? data.username : undefined);
            } else {
                if (Date.now() - lastMsgTime > minTimeBetweenMsg) {
                    lastMsgTime = Date.now();
                    sendMessage(storage.getItem("message") || "Use !setchallenge to set this message.", whisper ? data.username : undefined);
                } else {
                    sendMessage("Too soon, wait another " + ((minTimeBetweenMsg - (Date.now() - lastMsgTime)) / 1000) + " sec. and try again.", data.username);
                }
            }
        }
        if (data.msg.toLowerCase().startsWith("!setcontest") ||
                data.msg.toLowerCase().startsWith("!setcompetition") ||
                data.msg.toLowerCase().startsWith("!setchallenge")) {

            if (data.mod || data.admin || data.ptvadmin || data.username.toLowerCase() === "cyberponthree") {
                lastMsgTime = Date.now() - (minTimeBetweenMsg * 2); // ensure we can get the challenge right after setting it
                msgArr = data.msg.split(' ');
                storage.setItem("message", msgArr.slice(1).join(' '));
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
        startTime = Date.now();
        api.Events.on("userMsg", newMessage);
        api.Events.on("whisper", newWhisper);
    },
    stop: function () {
        api.Events.removeListener("userMsg", newMessage);
        api.Events.removeListener("whisper", newWhisper);
    }
}