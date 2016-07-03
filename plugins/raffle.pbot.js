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

var PermissionLevels = require('../modules/permissionlevels');
var MessageTypes = require('../modules/messagetypes');

function handleCommand(event) {
    var command = event.data;
    if (command.command === 'raffle' && event.claim()) {
        if (!command.sender.hasPermission("cmd.raffle")) {
            command.replyPrivate("Sorry, you don't have permission to use this command.");

        } else if (command.messageType === MessageTypes.PRIVATE && !command.channel.checkTimeout("cmd.raffle")) {
            command.replyPrivate(command.channel.getTimeoutMessage("cmd.raffle"));
        } else {

            var pars = command.parameters;

            var cmd = "raffle";
            var raffle = false;
            var value = false;

            if (pars.length >= 3) {
                if (pars[1] === "settimelimit" && isInt(pars[2])) {
                    cmd = "settimelimit";
                    raffle = pars[0];
                    value = parseInt(pars[2]);
                } else if (pars[1] === "setdrawinglimit" && isInt(pars[2])) {
                    cmd = "setdrawinglimit";
                    raffle = pars[0];
                    value = parseInt(pars[2]);
                } else {
                    cmd = false;
                    command.replyPrivate("Usage: !raffle [rafflename] <setTimeLimit | setDrawingLimit> <milliseconds | times>");
                }
            } else if (pars.length >= 2) {
                if (pars[1] === "settimelimit" && isInt(pars[1])) {
                    cmd = "settimelimit";
                    value = parseInt(pars[1]);
                } else if (pars[1] === "setdrawinglimit" && isInt(pars[1])) {
                    cmd = "setdrawinglimit";
                    value = parseInt(pars[1]);
                } else {
                    command.replyPrivate("Usage: !raffle [rafflename] <setTimeLimit | setDrawingLimit> <milliseconds | times>");
                }
            } else if (pars.length >= 1) {
                raffle = pars[1];
            }

            switch (cmd) {
                case "settimelimit":
                    setTimeLimit(command.channel.channelName, raffle ? raffle : 'default', value);
                    command.reply("Set time limit" + (raffle ? " for '" + raffle + "'" : "") + " to " + value + "ms.");
                    break;
                case "setdrawinglimit":
                    setDrawingLimit(command.channel.channelName, raffle ? raffle : 'default', value);
                    command.reply("Set drawing limit" + (raffle ? " for '" + raffle + "'" : "") + " to " + value + "ms.");
                    break;
                case "raffle":


                    var winnerLogs = storage.getItem("winnerLog_" + command.channel.channelName) || {};
                    winnerLog = winnerLogs[raffle ? raffle : "default"] || [];
                    var previousWinners = [];
                    var wlLen = winnerLog.length;
                    winnerLog.forEach(function (x, i) {
                        previousWinners[x.username] = {time: x.time, drawsAgo: i - (wlLen - 2)};
                    });

                    var allowedUserArr = [];
                    var timeLimit = Date.now() - getTimeLimit(command.channel.channelName, raffle ? raffle : 'default');
                    var drawingLimit = getDrawingLimit(command.channel.channelName, raffle ? raffle : 'default');


                    var userList = command.channel.onlineUsers.Where(function (u) {
                        var uName = u.username.toLowerCase();
                        return !u.extraData.banned &&
                                u.hasPermission("cmd.raffle." + (raffle ? raffle : 'default') + ".include", PermissionLevels.PERMISSION_USER) &&
                                (!previousWinners[uName] || (previousWinners[uName].time < timeLimit && previousWinners[uName].drawsAgo > drawingLimit));
                    });

                    if (userList.Count() === 0) {
                        command.reply("No eligible users :(");
                    } else {
                        var randomUser = userList.Random();

                        if (typeof randomUser !== 'undefined') {
                            winnerLog.push({time: Date.now(), username: randomUser.username.toLowerCase()});
                            winnerLogs[raffle ? raffle : "default"] = winnerLog;
                            storage.setItem("winnerLog_" + command.channel.channelName, winnerLogs);
                            command.reply("Winner: *[" + randomUser.username + "]");
                        } else {
                            command.reply("Error getting random user from list!");
                            console.log("Error getting random user from list!");
                            console.log(previousWinners);
                            console.log(allowedUserArr);
                            console.log(randomUser);
                        }
                    }
            }
        }
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

function prettyDate(dateString) {
    var date = new Date(dateString);
    var d = date.getDate();
    var monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    var m = monthNames[date.getMonth()];
    var y = date.getFullYear();
    var h = date.getHours();
    var min = date.getMinutes();
    var s = date.getSeconds();
    return y + "  -  " + m + " " + d + ", " + h + ':' + min;
}
function servePage(req, res) {

    var path = req.url.split('/');

    if (path.length > 2 && path[1].toLowerCase() == pluginUrl && path[2] != '') {

        var winners = storage.getItem("winnerLog_" + path[2]) || false;
        if (winners) {
            var winnerList = [];
            for (var raffle in winners) {
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
        api.events.on("chatCommand", handleCommand);
        api.events.on("consoleCommand", handleCommand);
        api.events.on("http", servePage);
    },
    stop: function () {
        api.events.removeListener("chatCommand", handleCommand);
        api.events.removeListener("consoleCommand", handleCommand);
        api.events.removeListener("http", servePage);
    }
};