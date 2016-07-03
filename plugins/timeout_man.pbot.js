var api;
var PermissionLevels = require('../modules/permissionlevels');
var MessageTypes = require('../modules/messagetypes');

function handleCommand(event) {
    var command = event.data;
    var pars = command.parameters;
    if (command.command === 'settimeout' && event.claim()) {
        if (!command.sender.hasPermission("cmd.settimeout")) {
            command.replyPrivate("Sorry, you don't have permission to use this command.");
        } else if (command.messageType === MessageTypes.PRIVATE && !command.channel.checkTimeout("cmd.settimeout")) {
            command.replyPrivate(command.channel.getTimeoutMessage("cmd.settimeout"));
        } else {
            if (pars.length === 2 && isInt(pars[1])) {
                
                var t = command.channel.getTimeout(pars[0], parseInt(pars[1]));
                t.ms = parseInt(pars[1]);
                t.Save();
                
                command.reply("Set timeout " + pars[1] + " to " + pars[2]);
            } else {
                command.replyPrivate("Usage: !settimeout <timeoutId> <timeoutMs>");
            }
        }
    } else if (command.command === 'resettimeout' && event.claim()) {
        if (!command.sender.hasPermission("cmd.resettimeout")) {
            command.replyPrivate("Sorry, you don't have permission to use this command.");
        } else if (command.messageType === MessageTypes.PRIVATE && !command.channel.checkTimeout("cmd.resettimeout")) {
            command.replyPrivate(command.channel.getTimeoutMessage("cmd.resettimeout"));
        } else {
            if (pars.length === 2 && isInt(pars[1])) {
                
                var t = command.channel.getTimeout(pars[0], parseInt(pars[1]));
                t.lastDateTime = false;
                t.Save();
                
                command.reply("Set timeout " + pars[1] + " to " + pars[2]);
            } else {
                command.replyPrivate("Usage: !settimeout <timeoutId> <timeoutMs>");
            }
        }
    }
}

function isInt(value) {
    return !isNaN(value) && (function (x) {
        return (x | 0) === x;
    })(parseFloat(value));
}

function sendMessage(uData, txt, whisper) {
    if (typeof whisper !== 'undefined' && whisper) {
        api.Messages.whisper(uData.username, txt, uData.channel);
    } else {
        api.Messages.send(txt, uData.channel);
    }
}


var TIMEOUTS_STORAGE_PREFIX = "timeouts_";
var permRegex = new RegExp(TIMEOUTS_STORAGE_PREFIX);
var GetAllStores = function () {
    return api.mainAppStorage.valuesWithKeyMatch(permRegex);
};


function servePage(req, res) {
    var path = req.url.split('/');
    if (path.length > 2 && path[1].toLowerCase() == "timeouts" && path[2] != '') {
        
        
        var stores = GetAllStores();
        var channelStore = false;
        
        for (var t in stores) {
            if(stores[t].channel.toLowerCase() === path[2].toLowerCase()){
                channelStore = stores[t];
            }
        }
        
        if (channelStore) {
            var timeoutList = [];
            var channel = api.channels.GetByName(path[2]);
                
            for (var tId in channelStore.timeouts) {
                var t = channelStore.timeouts[tId];
                
                var tListObj = {};
                tListObj.timeoutId = tId;
                tListObj.ms = t.ms ? msToTime(t.ms) : ( t.defaultMs ? t.defaultMs : (channel ? msToTime(channel.getTimeout(tId).defaultMs) : "Default"));
                tListObj.remaining =  channel ? msToTime(channel.getTimeout(tId).remaining()) : "0s";
                timeoutList.push(tListObj);
            }

            timeoutList.sort(function (a, b) {
                return a.timeoutId.localeCompare(b.timeoutId);
            })

            api.jade.renderFile(process.cwd() + '/views/list.jade', {listHeader: ["TimeoutId", "Timeout Milliseconds", "Time Remaining"], list: timeoutList, page: {title: path[2] + "'s Channel Timeouts", subheader: path[2] + "'s Channel Timeouts", breadcrumb: [["/", "Home"], ["/timeouts", "Timeouts"], ["/" + path[2], path[2]]]}}, function (err, html) {
                res.write(html);
            });
        } else {
            api.jade.renderFile(process.cwd() + '/views/404.jade', null, function (err, html) {
                res.write(html);
            });
        }
    } else if (path[1].toLowerCase() === "timeouts") {
        var stores = GetAllStores();

        api.jade.renderFile(process.cwd() + '/views/channels.jade', {url: '/timeouts/', channels: stores, page: {title: "Timeouts", breadcrumb: [["/", "Home"], ["/timeouts", "Timeouts"]]}}, function (err, html) {
            res.write(html);
        });
    } else {
        if (req.collection == null)
            req.collection = [];
        req.collection.push(["Timeouts", "/timeouts/", "View timeouts for the bot."]);
    }
}

function msToTime(duration) {
    var milliseconds = parseInt((duration % 1000) / 100)
            , seconds = parseInt((duration / 1000) % 60)
            , minutes = parseInt((duration / (1000 * 60)) % 60)
            , hours = parseInt((duration / (1000 * 60 * 60)) % 24);

    var timeStr = ((hours > 0 ? hours + "hr " : "") +
            (minutes > 0 ? minutes + "m " : "") +
            (seconds > 0 ? seconds + "s " : "")/* +
             (milliseconds > 0 ? milliseconds + "ms " : "")*/).trim();

    return timeStr != "" ? timeStr : "0s";
}

module.exports = {
    meta_inf: {
        name: "Timeout Manager",
        version: "1.0.0",
        description: "Manages Timeouts",
        author: "Tschrock (CyberPon3)",
        pluginurl: "/timeouts",
        commandhelp: [
            {command: "!settimeout", usage: "!settimeout <timeoutId> <milisecconds>", description: "Sets a timeout/cooldown.", permission: "cmd.settimeout"},
            {command: "!resettimeout", usage: "!resettimeout <timeoutId>", description: "Clears the time remaining for a timeout/cooldown.", permission: "cmd.resettimeout"}
        ]
    },
    load: function (_api) {
        api = _api;
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