var api;
var storage;

function handleMsg(data) {
    var now = new Date();
    var key = data.channel + "_" + now.getDate() + "_" + (now.getMonth() + 1) + "_" + now.getFullYear();
    var record = storage.getItem(key) || {channel: data.channel, date: now.getDate() + "/" + (now.getMonth() + 1) + "/" + now.getFullYear(), messages: []};
    record.messages.push({username: data.username, color: data.color, msg: data.msg, timestamp: now.getTime()});
    storage.setItem(key, record);

    if (data.msg.toLowerCase().startsWith("!randquote")) {
        if (api.permissions_manager.userHasPermission(data, "cmd.randquote", api.permissions.PERMISSION_ALL) || api.permissions_manager.isOwner(data)) {
            if (api.timeout_manager.checkTimeout(data.channel, "cmd.randquote") || api.permissions_manager.userHasPermission(data, "timeoutbypass.global") || api.permissions_manager.userHasPermission(data, "timeoutbypass.cmd.randquote") || api.permissions_manager.isOwner(data)) {
                var cmds = data.msg.toLowerCase().split(' ');
                var record = storage.getItem(data.channel + "_" + now.getDate() + "_" + (now.getMonth() + 1) + "_" + now.getFullYear()) || false;
                if (record) {
                    if (cmds.length === 2) {
                        var messages = record.messages.filter(function (x) {
                            return x.username.toLowerCase() == cmds[1].toLowerCase();
                        });
                        if (messages.length > 0) {
                            var randMsg = messages[Math.floor(Math.random() * messages.length)];
                            sendMessage(data, randMsg.username + ": " + randMsg.msg, data.whisper);
                        } else {
                            sendMessage(data, "No chats by that user found :(", data.whisper);
                        }
                    } else {
                        var messages = record.messages
                        if (messages.length > 0) {
                            var randMsg = messages[Math.floor(Math.random() * messages.length)];
                            sendMessage(data, randMsg.username + ": " + randMsg.msg, data.whisper);
                        } else {
                            sendMessage(data, "No chats found :(", data.whisper);
                        }
                    }
                } else {
                    sendMessage(data, "No chat logs found :(", data.whisper);
                }
            } else {
                sendMessage(data, "Too soon, wait another " + (api.timeout_manager.getTimeRemaining(data.channel, "cmd.randquote") / 1000) + " sec. and try again.", true);
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
        name: "User Quote",
        version: "1.0.0",
        description: "Quotes a random user.",
        author: "Tschrock (CyberPon3)",
        commandhelp: [
            {command: "!randquote", usage: "!randquote", description: "Says a random quote from chat.", permission: "cmd.randquote"},
            {command: "!randquote <user>", usage: "!randquote [id]", description: "Says a random quote from a user.", permission: "cmd.randquote"}
        ]
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
