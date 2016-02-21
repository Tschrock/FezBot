var api;
var storage;

﻿var minTimeBetweenMsg = 30000;
﻿var lastMsgTime = 0;

﻿var minTimeBetweenMsg4 = 40000;
﻿var lastMsgTime4 = 0;

﻿var minTimeBetweenMsg2 = 60000;
﻿var lastMsgTime2 = 0;

﻿var minTimeBetweenMsg3 = 20000;
﻿var lastMsgTime3 = 0;

function handleMsg(data) {
    if (data.msg.toLowerCase().indexOf("skittle") !== -1) {
        if (Date.now() - lastMsgTime > minTimeBetweenMsg) {
            lastMsgTime = Date.now();
            api.Messages.send("TASTE THE RAINBOW!");
        }
    }
    if (data.msg.toLowerCase().indexOf("boop") !== -1) {
        if (data.msg.toLowerCase().startsWith("!boops")) {
            if (Date.now() - lastMsgTime3 > minTimeBetweenMsg3) {
                lastMsgTime3 = Date.now();
                api.Messages.send("Chat has been booped " + (storage.getItem("message") || 0) + " times");
            } else {
                sendMessage("Too soon, wait another " + ((minTimeBetweenMsg3 - (Date.now() - lastMsgTime3)) / 1000) + " sec. and try again.", data.username);
            }
        } else {
            var msgs = storage.getItem("message") || 0;
            msgs++;
            storage.setItem("boops", msgs);
            if (Date.now() - lastMsgTime2 > minTimeBetweenMsg2) {
                lastMsgTime2 = Date.now();
                api.Messages.send("boop");
            }
        }
    }
    if (data.msg.toLowerCase().indexOf("wake me up inside") !== -1) {
        if (Date.now() - lastMsgTime4 > minTimeBetweenMsg4) {
            lastMsgTime4 = Date.now();
            api.Messages.send("Save me from the nothing I've become.");
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
        name: "textCatcher",
        version: "1.0.0",
        description: "Does stuff",
        author: "Tschrock (CyberPon3)"
    },
    load: function (_api, _storage) {
        api = _api;
        storage = _storage;
    },
    start: function () {
        api.Events.on("userMsg", handleMsg);
    },
    stop: function () {
        api.Events.removeListener("userMsg", handleMsg);
    }
}
