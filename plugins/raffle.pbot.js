var api;
var storage;

function handleMessage(data) {

    var pars = data.msg.toLowerCase().split(' ');
    if (pars[0] === "!raffle") {

        if (pars[1] && pars[1] === "settimelimit") {
            if (api.permissions_manager.userHasPermission(data, "cmd.raffle.settimelimit") || api.permissions_manager.isOwner(data)) {
                if(pars[2] && isInt(pars[2])) {
                    storage.setItem("timelimit", parseInt(pars[2]));
                    sendMessage(data, "Set time limit to " + parseInt(pars[2]) + "ms.", data.whisper);
                }
                else {
                    sendMessage(data, "Usage: !raffle setTimeLimit <milliseconds>", true);
                }
            } else {
                sendMessage(data, "Sorry, you don't have permission to use this command.", true);
            }
        } else if (pars[1] && pars[1] === "setdrawinglimit") {
            if (api.permissions_manager.userHasPermission(data, "cmd.raffle.setdrawinglimit") || api.permissions_manager.isOwner(data)) {
                if(pars[2] && isInt(pars[2])) {
                    storage.setItem("drawinglimit", parseInt(pars[2]));
                    sendMessage(data, "Set drawing limit to " + parseInt(pars[2]) + "times.", data.whisper);
                }
                else {
                    sendMessage(data, "Usage: !raffle setDrawingLimit <times>", true);
                }
            } else {
                sendMessage(data, "Sorry, you don't have permission to use this command.", true);
            }
        } else {
            if (api.permissions_manager.userHasPermission(data, "cmd.raffle") || api.permissions_manager.isOwner(data)) {

                var currentUserList = api.user_manager.__currentUserData[data.channel.toLowerCase()] || {};

                var userArr = [];
                for (var userId in currentUserList) {
                    var user = currentUserList[userId];
                    if (api.permissions_manager.userHasPermission(user, "cmd.raffle.include", api.permissions_manager.PERMISSION_USER)) {
                        userArr.push(user);
                    }
                }
                
                var winnerLog = storage.getItem("winnerLog") || [];
                var previousWinners = [];
                var wlLen = winnerLog.length;
                winnerLog.forEach(function (x, i) {
                   previousWinners[x.username] = {time: x.time, drawsAgo: i - (wlLen - 2)};
                });
                        
                var allowedUserArr = [];
                var timeLimit = Date.now() - storage.getItem("timelimit");
                var drawingLimit = storage.getItem("drawinglimit");
                
                userArr.forEach(function (x) {
                    var uName = x.username.toLowerCase();
                    if(!previousWinners[uName] || (previousWinners[uName].time < timeLimit && previousWinners[uName].drawsAgo > drawingLimit)) {
                        allowedUserArr.push(x);
                    }
                });
                
                if (allowedUserArr.length === 0) {
                    sendMessage(data, "No eligible users :(", data.whisper);
                } else {
                    var randomUser = allowedUserArr[Math.floor(Math.random() * allowedUserArr.length)];

                    if (typeof randomUser !== 'undefined') {
                        winnerLog.push({time: Date.now(), username: randomUser.username.toLowerCase()});
                        storage.setItem("winnerLog", winnerLog);
                        sendMessage(data, "Winner: *[" + randomUser.username + "]", data.whisper);
                    } else {
                        sendMessage(data, "Error getting random user from list!", data.whisper);
                        console.log("Error getting random user from list!");
                        console.log(userArr);
                        console.log(previousWinners);
                        console.log(allowedUserArr);
                        console.log(randomUser);
                    }
                }
            } else {
                sendMessage(data, "Sorry, you don't have permission to use this command.", true);
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

function isInt(value) {
    return !isNaN(value) && (function (x) {
        return (x | 0) === x;
    })(parseFloat(value));
}

module.exports = {
    meta_inf: {
        name: "Raffle",
        version: "1.0.0",
        description: "Gets a random user.",
        author: "Tschrock (CyberPon3)",
        commandhelp: [
            {command: "!raffle", usage: "!raffle", description: "Gets a random user in chat who has not already won the last x times or in the last x ms.", permission: "cmd.raffle"},
            {command: "!raffle setTimeLimit", usage: "!raffle setTimeLimit <milliseconds>", description: "Sets the amount of time after a user wins before they can win again.", permission: "cmd.raffle.settimelimit"},
            {command: "!raffle setDrawingLimit", usage: "!raffle setDrawingLimit <times>", description: "Sets the number of drawings that must be done after a user wins before they can win again.", permission: "cmd.raffle.setdrawinglimit"}
        ]
    },
    load: function (_api, _storage) {
        api = _api;
        storage = _storage;
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