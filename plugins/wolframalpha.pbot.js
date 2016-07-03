var api;
var WolframClient = require('node-wolfram');
var Wolfram = false;

var PermissionLevels = require('../modules/permissionlevels');
var MessageTypes = require('../modules/messagetypes');

function handleCommand(event) {
    var command = event.data;
    if (command.command === 'wa' && event.claim()) {
        if (!command.sender.hasPermission("cmd.wa")) {
            command.replyPrivate("Sorry, you don't have permission to use this command.");

        } else if (command.messageType !== MessageTypes.PRIVATE && !command.channel.checkTimeout("cmd.wa")) {
            command.replyPrivate(command.channel.getTimeoutMessage("cmd.wa"));

        } else {


            if (command.parameters.length > 0) {
                Wolfram.query(command.parameters.join(" "), function (err, result) {
                    if (err || result == null) {
                        console.log(err, result);
                        command.reply("There was an error talking to WolframAlpha.");
                    } else {
                        if (result["queryresult"] && result["queryresult"]["pod"])
                            var resultPods = result.queryresult.pod;
                        var primaryResultPods = resultPods.filter(function (pod) {
                            return pod.$.primary;
                        });

                        var results = [];

                        for (var a = 0; a < primaryResultPods.length; a++)
                        {
                            var pod = primaryResultPods[a];
                            var subPods = pod.subpod;


                            //console.log(pod.$.title, ": ");
                            results.push(pod.$.title + ": ");
                            var subresults = [];
                            for (var b = 0; b < subPods.length; b++) {

                                var subpod = subPods[b];
                                for (var c = 0; c < subpod.plaintext.length; c++)
                                {
                                    var text = subpod.plaintext[c];
                                    //console.log('\t', text);
                                    if (pod.$.primary) {
                                        subresults.push(subpod.plaintext);
                                    }
                                }
                            }
                            results.push(subresults.join(" | "));
                        }
                        if (results.length > 0) {
                            command.reply(results.join("  "));
                        } else {
                            command.reply("No parseable results found.");
                        }
                    }
                });
            }
        }
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
        var config = require("../config.json");
        if (config.plugins && config.plugins.wolframalpha && config.plugins.wolframalpha.apikey)
            Wolfram = new WolframClient(config.plugins.wolframalpha.apikey);
        api.events.on("chatCommand", handleCommand);
        api.events.on("consoleCommand", handleCommand);
    },
    stop: function () {
        api.events.removeListener("chatCommand", handleCommand);
        api.events.removeListener("consoleCommand", handleCommand);
    }
}