var api;

function handleMessage(data) {
    if (data.msg.toLowerCase().startsWith("!")) {
        var pars = data.msg.split(' ');
        var cmd = pars[0].toLowerCase();

        if (cmd === '!settimeout') {
            if (api.permissions_manager.userHasPermission(data, "cmd.settimeout") || api.permissions_manager.isOwner(data)) {
                if (pars.length === 3 && isInt(pars[2])) {
                    api.timeout_manager.setTimeout(data.channel, pars[1], parseInt(pars[2]));
                    sendMessage(data, "Set timeout " + pars[1] + " to " + pars[2], true);
                } else {
                    sendMessage(data, "Usage: !settimeout <timeoutId> <timeoutMs>", true);
                }
            } else {
                sendMessage(data, "Sorry, you don't have permission to use this command.", true);
            }
        }
        if (cmd === '!resettimeout') {
            if (api.permissions_manager.userHasPermission(data, "cmd.resettimeout") || api.permissions_manager.isOwner(data)) {
                if (pars.length === 2) {
                    api.timeout_manager.clearTimeout(data.channel, pars[1]);
                    sendMessage(data, "Cleared timeout " + pars[1], true);
                } else {
                    sendMessage(data, "Usage: !settimeout <timeoutId>", true);
                }
            } else {
                sendMessage(data, "Sorry, you don't have permission to use this command.", true);
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

function servePage(req, res) {
    var path = req.url.split('/');
    if (path.length > 2 && path[1].toLowerCase() == "timeouts" && path[2] != '') {

        var timeouts = api.timeout_manager.getAllTimeoutMs();
        if (timeouts[path[2]]) {
            var timeoutList = [];

            for (var tId in timeouts[path[2]]) {
                var ms = timeouts[path[2]][tId];
                var tListObj = {};
                tListObj.timeoutId = tId;
                tListObj.ms = msToTime(ms);
                var curT = api.timeout_manager.__currentTimeoutsTimes[path[2].toLowerCase()] || {};
                var curMs = curT[tId] || 0;
                tListObj.remaining = msToTime(Math.max(0, (ms - (Date.now() - curMs))) / 1000);
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
    } else if (path[1].toLowerCase() == "timeouts") {
        var timeouts = api.timeout_manager.getAllTimeoutMs();
        var channels = [];
        for (var t in timeouts) {
            channels.push(t);
        }
        channels = channels.map(function (x) {
            return {channel: x};
        });

        api.jade.renderFile(process.cwd() + '/views/channels.jade', {url: '/timeouts/', channels: channels, page: {title: "Timeouts", breadcrumb: [["/", "Home"], ["/timeouts", "Timeouts"]]}}, function (err, html) {
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