var api;
var storage;

function setTimeLimit(channel, raffleName, timeLimit) {
    var limits = storage.getItem("timelimit_" + channel) || {};
    limits[raffleName] = timeLimit;
    storage.setItem("timelimit_" + channel, limits);
}

function setDrawingLimit(channel, raffleName, drawingLimit) {
    var limits = storage.getItem("drawinglimit_" + channel) || {};
    limits[raffleName] = drawingLimit;
    storage.setItem("drawinglimit_" + channel, limits);
}

function getTimeLimit(channel, raffleName) {
    var limits = storage.getItem("timelimit_" + channel) || {};
    return limits[raffleName] || 0;
}

function getDrawingLimit(channel, raffleName) {
    var limits = storage.getItem("drawinglimit_" + channel) || {};
    return limits[raffleName] || 0;
}

function handleMessage(data) {

    var pars = data.msg.toLowerCase().split(' ');
    if (pars[0] === "!raffle") {

        var cmd = "raffle";
        var raffle = false;
        var value = false;

        if (pars.length >= 4) {
            if (pars[2] === "settimelimit" && isInt(pars[3])) {
                cmd = "settimelimit";
                raffle = pars[1];
                value = parseInt(pars[3]);
            } else if (pars[2] === "setdrawinglimit" && isInt(pars[3])) {
                cmd = "setdrawinglimit";
                raffle = pars[1];
                value = parseInt(pars[3]);
            } else {
                cmd = false;
                sendMessage(data, "Usage: !raffle [rafflename] <setTimeLimit | setDrawingLimit> <milliseconds | times>", true);
            }
        } else if (pars.length >= 3) {
            if (pars[1] === "settimelimit" && isInt(pars[2])) {
                cmd = "settimelimit";
                value = parseInt(pars[2]);
            } else if (pars[2] === "setdrawinglimit" && isInt(pars[2])) {
                cmd = "setdrawinglimit";
                value = parseInt(pars[2]);
            } else {
                sendMessage(data, "Usage: !raffle [rafflename] <setTimeLimit | setDrawingLimit> <milliseconds | times>", true);
            }
        }

        switch (cmd) {
            case "settimelimit":
                if (api.permissions_manager.userHasPermission(data, "cmd.raffle.settimelimit") || api.permissions_manager.isOwner(data)) {
                    setTimeLimit(data.channel, raffle, value);
                    sendMessage(data, "Set time limit" + (raffle ? " for '" + raffle + "'" : "") + " to " + value + "ms.", data.whisper);
                } else {
                    sendMessage(data, "Sorry, you don't have permission to use this command.", true);
                }
                break;
            case "setdrawinglimit":
                if (api.permissions_manager.userHasPermission(data, "cmd.raffle.setdrawinglimit") || api.permissions_manager.isOwner(data)) {
                    setDrawingLimit(data.channel, raffle, value);
                    sendMessage(data, "Set drawing limit" + (raffle ? " for '" + raffle + "'" : "") + " to " + value + " times.", data.whisper);
                } else {
                    sendMessage(data, "Sorry, you don't have permission to use this command.", true);
                }
                break;
            case "raffle":
                if (api.permissions_manager.userHasPermission(data, "cmd.raffle") || api.permissions_manager.isOwner(data)) {

                    var currentUserList = api.user_manager.__currentUserData[data.channel.toLowerCase()] || {};

                    var userArr = [];
                    for (var userId in currentUserList) {
                        var user = currentUserList[userId];
                        if (api.permissions_manager.userHasPermission(user, "cmd.raffle.include", api.permissions_manager.PERMISSION_USER)) {
                            userArr.push(user);
                        }
                    }

                    var winnerLogs = storage.getItem("winnerLog_" + data.channel) || {};
                    winnerLog = winnerLogs[raffle ? raffle : "default"] || [];
                    var previousWinners = [];
                    var wlLen = winnerLog.length;
                    winnerLog.forEach(function (x, i) {
                        previousWinners[x.username] = {time: x.time, drawsAgo: i - (wlLen - 2)};
                    });

                    var allowedUserArr = [];
                    var timeLimit = Date.now() - getTimeLimit(data.channel, raffle);
                    var drawingLimit = getDrawingLimit(data.channel, raffle);

                    userArr.forEach(function (x) {
                        var uName = x.username.toLowerCase();
                        if (!previousWinners[uName] || (previousWinners[uName].time < timeLimit && previousWinners[uName].drawsAgo > drawingLimit)) {
                            allowedUserArr.push(x);
                        }
                    });

                    if (allowedUserArr.length === 0) {
                        sendMessage(data, "No eligible users :(", data.whisper);
                    } else {
                        var randomUser = allowedUserArr[Math.floor(Math.random() * allowedUserArr.length)];

                        if (typeof randomUser !== 'undefined') {
                            winnerLog.push({time: Date.now(), username: randomUser.username.toLowerCase()});
                            winnerLogs[raffle ? raffle : "default"] = winnerLog;
                            storage.setItem("winnerLog_" + data.channel, winnerLogs);
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

var pluginTitle = "Raffle";
var pluginUrl = "raffle";
var pluginUrlAbs = "/" + pluginUrl + "/";
var messages_regex = new RegExp("winnerLog_.*");

                function prettyDate(dateString){
                    var date =  new Date(dateString);
                    var d = date.getDate();
                    var monthNames = [ "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec" ];
                    var m = monthNames[date.getMonth()];
                    var y = date.getFullYear();
                    var h = date.getHours();
                    var min = date.getMinutes();
                    var s = date.getSeconds();
                    return y+"  -  "+m+" "+d+", "+h+':'+min;
                } 
function servePage(req, res) {

    var path = req.url.split('/');

    if (path.length > 2 && path[1].toLowerCase() == pluginUrl && path[2] != '') {

        var winners = storage.getItem("winnerLog_" + path[2]) || false;
        if (winners) {
            var winnerList = [];
            for(var raffle in winners) {
                winnerList.push({raffle: raffle, time: "", username: ""});
                winners[raffle].forEach(function (x) { 
                    winnerList.push({raffle: "", time: prettyDate(x.time), username: x.username});
                });
            }
            api.jade.renderFile(
                    process.cwd() + '/views/list.jade',
                    {
                        listHeader: ["Raffle", "Time", "User"],
                        list: winnerList,
                        page: {
                            title: path[2] + " " + pluginTitle,
                            subheader: path[2] + "'s " + pluginTitle + "s:",
                            breadcrumb: [
                                ["/", "Home"],
                                [pluginUrlAbs, pluginTitle],
                                ["", path[2]]
                            ]
                        }
                    },
                    function (err, html) {
                        res.write(html);
                    }
            );
        } else {
            api.jade.renderFile(process.cwd() + '/views/404.jade', null, function (err, html) {
                res.write(html);
            });
        }
    } else if (path[1].toLowerCase() === pluginUrl) {

        var channels = storage.keys().filter(function (x) {
            return messages_regex.test(x);
        }).map(function (x) {
            return {channel: x.replace("winnerLog_", "")};
        });

        api.jade.renderFile(
                process.cwd() + '/views/channels.jade',
                {
                    url: pluginUrlAbs,
                    channels: channels,
                    page: {
                        title: pluginTitle,
                        breadcrumb: [
                            ["/", "Home"],
                            [pluginUrlAbs, pluginTitle]
                        ]
                    }
                },
                function (err, html) {
                    res.write(html);
                });
    } else {
        if (req.collection == null)
            req.collection = [];
        req.collection.push([pluginTitle, pluginUrlAbs, pluginTitle]);
    }
}

module.exports = {
    meta_inf: {
        name: "Raffle",
        version: "1.0.0",
        description: "Gets a random user.",
        author: "Tschrock (CyberPon3)",
        pluginurl: "/raffle",
        commandhelp: [
            {command: "!raffle", usage: "!raffle [raffleName]", description: "Gets a random user in chat who has not already won the last x times or in the last x ms.", permission: "cmd.raffle"},
            {command: "!raffle", usage: "!raffle [raffleName] setTimeLimit <milliseconds>", description: "Sets the amount of time after a user wins before they can win again.", permission: "cmd.raffle.settimelimit"},
            {command: "!raffle", usage: "!raffle [raffleName] setDrawingLimit <times>", description: "Sets the number of drawings that must be done after a user wins before they can win again.", permission: "cmd.raffle.setdrawinglimit"}
        ]
    },
    load: function (_api, _storage) {
        api = _api;
        storage = _storage;
    },
    start: function () {
        api.Events.on("userMsg", handleMessage);
        api.Events.on("whisper", handleMessage);
        api.Events.on("http", servePage);
    },
    stop: function () {
        api.Events.removeListener("userMsg", handleMessage);
        api.Events.removeListener("whisper", handleMessage);
        api.Events.removeListener("http", servePage);
    }
}