var api;

function handleMessage(data) {
    if (data.msg.toLowerCase().split(' ')[0] === "!random") {
        if (api.permissions_manager.userHasPermission(data, "cmd.random") || api.permissions_manager.isOwner(data)) {

            var currentUserList = api.user_manager.__currentUserData[data.channel.toLowerCase()] || {};

            var userArr = [];
            for (var userId in currentUserList) {
                var user = currentUserList[userId];
                if (api.permissions_manager.userHasPermission(user, "cmd.random.include", api.permissions_manager.PERMISSION_USER) && !api.user_manager.isBot(user)) {
                    userArr.push(user);
                }
            }

            if (userArr.length === 0) {
                sendMessage(data, "No eligible users :(", data.whisper);
            } else {
                var randomUser = userArr[Math.floor(Math.random() * userArr.length)];

                if (typeof randomUser !== 'undefined') {
                    sendMessage(data, "Random user: *[" + randomUser.username + "]", data.whisper);
                } else {
                    sendMessage(data, "Error getting random user from list!", data.whisper);
                    console.log("Error getting random user from list!");
                    console.log(userArr);
                    console.log(randomUser);
                }
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
        author: "Tschrock (CyberPon3)",
        commandhelp: [
            {command: "!random", usage: "!random", description: "Gets a random user in chat.", permission: "cmd.random"}
        ]
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