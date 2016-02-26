var api;

function newMessage(data) {
    handleMessage(data, false);
}
function newWhisper(data) {
    handleMessage(data, true);
}

function handleMessage(data, whisper) {
    if (data.msg.toLowerCase().startsWith("!random")) {
        if (api.permissions_manager.userHasPermission(data, "cmd.random") || api.permissions_manager.isOwner(data)) {
            var userArr = api.user_manager.__currentUserData.filter(function (x) {
                return api.permissions_manager.userHasPermission(data, "cmd.random.include", api.permissions_manager.PERMISSION_USER) /*&& x.username.toLowerCase() !== api.name.toLowerCase()*/;
            });
            var ritem = userArr[Math.floor(Math.random() * userArr.length)];
            if (typeof ritem !== 'undefined') {
                sendMessage("Random user: *[" + ritem.username + "]", whisper ? data.username : undefined);
            } else {
                sendMessage("Error getting random user from list!", data.username);
                console.log("Error getting random user from list!");
                console.log(userArr);
                console.log(ritem);
            }
        } else {
            sendMessage("Sorry, you don't have permission to use this command.", data.username);
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
        name: "Random User",
        version: "1.0.0",
        description: "Gets a random user.",
        author: "Tschrock (CyberPon3)"
    },
    load: function (_api) {
        api = _api;
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