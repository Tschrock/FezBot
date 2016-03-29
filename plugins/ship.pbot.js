var api;

function handleMessage(data) {
    if (data.msg.toLowerCase().split(' ')[0] === "!ship") {
        if (api.permissions_manager.userHasPermission(data, "cmd.ship", api.permissions_manager.PERMISSION_ADMIN | api.permissions_manager.PERMISSION_MOD | api.permissions_manager.PERMISSION_PTVADMIN | api.permissions_manager.PERMISSION_USER) || api.permissions_manager.isOwner(data)) {
            if (data.whisper || api.timeout_manager.checkTimeout(data.channel, "cmd.ship", 20000) || api.permissions_manager.userHasPermission(data, "timeoutbypass.global") || api.permissions_manager.userHasPermission(data, "timeoutbypass.cmd.ship")) {


                var currentUserList = api.user_manager.__currentUserData[data.channel.toLowerCase()] || {};

                var userArr = [];
                for (var userId in currentUserList) {
                    var user = currentUserList[userId];
                    if (api.permissions_manager.userHasPermission(user, "cmd.ship.include", api.permissions_manager.PERMISSION_USER)) {
                        userArr.push(user);
                    }
                }

                var pars = data.msg.split(' ');

                if (pars.length > 1) {
                    var randomUser1 = userArr[Math.floor(Math.random() * userArr.length)];

                    if (typeof randomUser1 !== 'undefined' && typeof randomUser1 !== 'undefined') {
                        sendMessage(data, pars.slice(1).join(' ') + " ❤ " + randomUser1.username, data.whisper);
                    } else {
                        sendMessage(data, "Error getting random user from list!", data.whisper);
                        console.log("Error getting random user from list!");
                        console.log(userArr);
                        console.log(randomUser1);
                    }
                } else {
                    var randomUser1 = userArr[Math.floor(Math.random() * userArr.length)];
                    var randomUser2 = userArr[Math.floor(Math.random() * userArr.length)];

                    if (typeof randomUser1 !== 'undefined' && typeof randomUser1 !== 'undefined') {
                        sendMessage(data, randomUser1.username + " ❤ " + randomUser2.username, data.whisper);
                    } else {
                        sendMessage(data, "Error getting random user from list!", data.whisper);
                        console.log("Error getting random user from list!");
                        console.log(userArr);
                        console.log(randomUser1);
                        console.log(randomUser2);
                    }
                }
            } else {
                sendMessage(data, "Too soon, wait another " + (api.timeout_manager.getTimeRemaining(data.channel, "cmd.ship") / 1000) + " sec. and try again (Or whisper me).", true);
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
        name: "Shipping",
        version: "1.0.0",
        description: "Ships 2 random users.",
        author: "Tschrock (CyberPon3)",
        commandhelp: [
            {command: "!ship", usage: "!ship", description: "Ships 2 random users in chat.", permission: "cmd.ship"},
            {command: "!ship", usage: "!ship <something...>", description: "Ships something with a random user in chat.", permission: "cmd.ship"}
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