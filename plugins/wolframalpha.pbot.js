var api;
var WolframClient = require('node-wolfram');
var Wolfram = new WolframClient('< WolframAlpha API Key >');  // You need to get your own API key and put it here!

function handleMessage(data) {
    if (data.msg.toLowerCase().startsWith("!wa")) {
        if (api.permissions_manager.userHasPermission(data, "cmd.wa", api.permissions.PERMISSION_ALL) || api.permissions_manager.isOwner(data)) {
            if (api.timeout_manager.checkTimeout(data.channel, "cmd.wa", 10000) || api.permissions_manager.userHasPermission(data, "timeoutbypass.global") || api.permissions_manager.userHasPermission(data, "timeoutbypass.cmd.wa")) {
                var cmds = data.msg.toLowerCase().split(' ');
                if (cmds.length > 1) {
                    Wolfram.query(cmds.slice(1).join(" "), function (err, result) {
                        if (err) {
                            console.log(err);
                            sendMessage(data, "There was an error talking to WolframAlpha.", data.whisper);
                        } else
                        {
                            if (result["queryresult"] && result["queryresult"]["pod"]) {
                                var results = [];
                                for (var a = 0; a < result.queryresult.pod.length; a++)
                                {
                                    var pod = result.queryresult.pod[a];
                                    console.log(pod.$.title, ": ");
                                    for (var b = 0; b < pod.subpod.length; b++) {

                                        if (pod.$.primary) {
                                            results.push(pod.$.title + ": ");
                                        }
                                        var subpod = pod.subpod[b];
                                        for (var c = 0; c < subpod.plaintext.length; c++)
                                        {
                                            var text = subpod.plaintext[c];
                                            console.log('\t', text);
                                            if (pod.$.primary) {
                                                results.push(subpod.plaintext + " | ");
                                            }
                                        }
                                    }
                                }
                                if (results.length > 0) {
                                    sendMessage(data, results.join(""), data.whisper);
                                } else {
                                    sendMessage(data, "No parseable results found.", data.whisper);
                                }
                            } else {
                                sendMessage(data, "There was an error getting results from WolframAlpha.", data.whisper);
                            }
                        }
                    });
                }
            } else {
                sendMessage(data, "Too soon, wait another " + (api.timeout_manager.getTimeRemaining(data.channel, "cmd.wa") / 1000) + " sec. and try again.", true);
            }
        } else {
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
        name: "Wolframn Alpha",
        version: "1.0.0",
        description: "Asks WolframAlpha something.",
        author: "Tschrock (CyberPon3)",
        commandhelp: [
            {command: "!wa", usage: "!wa <question...>", description: "Asks WolframAlpha something.", permission: "cmd.wa"}
        ],
        dependencies: {
            "node-wolfram": "^0.0.1"
        }
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