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

minTimeBetweenMsg = 10000;
lastMsgTime = Date.now();

function newMessage(data) {
    handleMessage(data, false);
}
function newWhisper(data) {
    handleMessage(data, true);
}

function handleMessage(data, whisper) {
    if (checkMessage(data)) {

        if (data.msg.toLowerCase().startsWith("!contest") ||
                data.msg.toLowerCase().startsWith("!competition") ||
                data.msg.toLowerCase().startsWith("!challenge")) {
            if (Date.now() - lastMsgTime > minTimeBetweenMsg) {
                lastMsgTime = Date.now();
                sendMessage("Stream Challenge: Make something for the theme 'Gaming' - It can be something quick, silly, funny, just for fun, and we'll choose our favorite at the end of the stream, the winner will get a guaranteed spot in next week's stream pic", whisper ? data.username : undefined);
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
    load: function (_api) {
        api = _api;
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