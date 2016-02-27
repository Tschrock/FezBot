var api;

function handleMessage(data) {
    if (data.msg.toLowerCase().startsWith("!random")) {
        if (api.permissions_manager.userHasPermission(data, "cmd.random") || api.permissions_manager.isOwner(data)) {
            var cData = api.user_manager.__currentUserData || {};
            var uData = cData[data.channel.toLowerCase()] || {};
            var userArr = [];
            for(var dat in uData) {
                if (api.permissions_manager.userHasPermission(uData[dat], "cmd.random.include", api.permissions_manager.PERMISSION_USER) && !api.user_manager.isBot(data)) {
                    userArr.push(uData[dat]);
                }
            }
            var ritem = userArr[Math.floor(Math.random() * userArr.length)];
            
            if (typeof ritem !== 'undefined') {
                sendMessage(data, "Random user: *[" + ritem.username + "]", data.whisper);
            } else {
                sendMessage(data, "Error getting random user from list!", data.whisper);
                console.log("Error getting random user from list!");
                console.log(userArr);
                console.log(ritem);
            }
        } else {
            sendMessage(data, "Sorry, you don't have permission to use this command.", true);
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
        name: "Random User",
        version: "1.0.0",
        description: "Gets a random user.",
        author: "Tschrock (CyberPon3)"
    },
    load: function (_api) {
        api = _api;
    },
    start: function () {
        api.Events.on("userMsg", handleMessage);
        api.Events.on("whisper", handleMessage);
    },
    stop: function () {
        api.Events.removeListener("userMsg", handleMessage);
        api.Events.removeListener("whisper", handleMessage);
    }
}