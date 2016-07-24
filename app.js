#!/usr/bin/env node
'use strict';

var commander = require("commander");
var storage = require("node-persist");
var EventEmitter = require("events");

var NiceList = require('./modules/nicelist');
var PluginLoader = require('./modules/pluginloader_old');
var ChannelManager = require('./modules/channelmanager');
var ConsoleChannel = require('./modules/consolechannel');
var NiceCLI = require('./modules/nicecli');
var EventTypes = require('./modules/eventtypes');
var BotEvent = require('./modules/botevent');
var MessageType = require('./modules/messagetypes');
var CommandMessage = require('./modules/commandmessage');

var API = function () {
    this.version = "2.0.0";
    this.events = new EventEmitter();
    this.channels = new ChannelManager(this);
    this.events.setMaxListeners(0);
    this.sharedStorage = storage.create({dir: process.cwd() + "/storage/shared_storage"});
    this.sharedStorage.initSync();
    this.mainAppStorage = storage.create({dir: process.cwd() + "/storage/main_app"});
    this.mainAppStorage.initSync();
    this.pluginLoader = new PluginLoader(this, storage.create({dir: process.cwd() + "/storage/plugin_loader"}));
    this.chatProviders = new NiceList();
    this.cliparameters = new NiceList();
};

API.prototype.registerChatProvider = function (id, provider) {
    this.chatProviders.Set(id, provider);
};
API.prototype.degisterChatProvider = function (id) {
    this.chatProviders.RemoveById(id);
};
API.prototype.registerCliParameters = function (id, parameter) {
    this.cliparameters.Set(id, parameter);
};
API.prototype.degisterCliParameters = function (id) {
    this.cliparameters.RemoveById(id);
};

var api = new API();

api.events.on(EventTypes.CONNECT, function (event) {
    console.log("Connected to " + event.source.channelName);
});
api.events.on(EventTypes.DISCONNECT, function (event) {
    console.log("Disconnected from " + event.source.channelName);
});
api.events.on(EventTypes.EXCEPTION, function (event) {
    if (event.data.channel)
        event.data.channel.sendMessage("(╯°□°）╯︵ uoᴉʇdǝɔxƎ");
    console.log(event);
});
api.events.on(EventTypes.CONSOLECOMMAND, function (event) {
    if (event.data.command === "quit" || event.data.command === "exit" || event.data.command === "stop") {
        cli.moveStdOut = false;
        process.stdout.write('\n');
        process.exit();
    }
});

api.registerCliParameters('url', {
    name: "Url",
    description: "An url",
    flag: "-u"
});

// Load all Plugins in the ./plugins directory
var quiet_loading = true;
api.pluginLoader.listPlugins().forEach(function (item) {
    var plugin_state = api.pluginLoader.getInitialPluginState(item);
    if (!plugin_state) {
        plugin_state = "running";
    }
    if (plugin_state === "running" || plugin_state === "loaded") {
        api.pluginLoader.loadPlugin(item, quiet_loading);
    }
    if (plugin_state === "running") {
        api.pluginLoader.startPlugin(item, quiet_loading);
    }
});

console.log("Loaded plugins:", api.pluginLoader.getLoadedPlugins().join(", "));
console.log("Started plugins:", api.pluginLoader.getStartedPlugins().join(", "));

var globalConfig = {};
var connectConfigs = [];
var parseGlobals = true;
var currentConnectConfig = false;
var readReturn = false;
var readBuffer = "";
var args = process.argv.slice(2);
for (var i = 0; i < args.length; ++i) {
    var arg = args[i];
    console.log(arg);
    if (arg.indexOf('+') === 0 && process.env[arg.slice(1)] && process.env[arg.slice(1)].indexOf("-") !== 0) {
        arg = process.env[arg.slice(1)];
    }

    if (arg.indexOf("-") !== 0) {
        if (readReturn) {
            readBuffer += " " + arg;
        }
    } else {
        if (readReturn) {
            readReturn.call(null, readBuffer.slice(1));
            var readReturn = false;
            var readBuffer = "";
        }

        var globalFlag = false;
        if (parseGlobals) {
            api.cliparameters.ForEach(function (par, parId) {
                if (arg === par.flag || arg === "--" + parId) {
                    globalFlag = parId;
                }
            });
        }

        if (globalFlag) {
            readReturn = function (val) {
                globalConfig[globalFlag] = val;
            };
        } else {
            if (currentConnectConfig !== false) {
                var options = currentConnectConfig.provider.ConnectOptions;
                var option = false;
                for (var opt in options) {
                    if (arg === options[opt].flag || arg === "--" + opt) {
                        option = opt;
                        break;
                    }
                }
                if (option !== false) {
                    readReturn = function (val) {
                        currentConnectConfig[option] = val;
                    };
                } else {
                    currentConnectConfig = false;
                }
            }
            if (currentConnectConfig === false) {
                var channel = api.chatProviders.Where(function (provider, id) {
                    return arg === "--" + id;
                }).First();
                if (channel) {
                    currentConnectConfig = {
                        provider: channel
                    };
                    connectConfigs.push(currentConnectConfig);
                } else {
                    console.error("Unknown chat provider or option:" + arg);
                }
            }
        }
    }
}

if (readReturn) {
    readReturn.call(null, readBuffer.slice(1));
    var readReturn = false;
    var readBuffer = "";
}

// Load config
var config = require("./config.json") || {};
if (config.channels && config.channels.length) {
    config.channels.forEach(function (channel) {
        if (channel.enabled !== false) {
            var provider = api.chatProviders.Get(channel.provider);
            if(provider) {
                channel.provider = provider;
                connectConfigs.push(channel);
            }
        }
    });
}

console.log(globalConfig);
console.log(connectConfigs);

for (var i = 0; i < connectConfigs.length; ++i) {
    var con = connectConfigs[i];
    api.channels.Add(new con.provider.Channel(api, con));
}

console.log();

var CONSOLE_CHANNEL = new ConsoleChannel(api, process.stdin, process.stdout);

var cli = new NiceCLI(process.stdin, process.stdout);

cli.events.on(EventTypes.CONSOLECOMMAND, function (command) {
    var ccEvt = new BotEvent(EventTypes.CONSOLECOMMAND, CONSOLE_CHANNEL.stdinUser.channel, new CommandMessage(CONSOLE_CHANNEL.stdinUser.channel, new Date(), CONSOLE_CHANNEL.stdinUser, command, Math.random(), MessageType.GENERIC));
    ccEvt.cmdHelp = new NiceList();
    api.events.emit("consoleCommand", ccEvt);
    if (!ccEvt.claimed) {
        console.log("Command '" + ccEvt.data.command + "' could not be found!");
        //showConsoleHelp(ccEvt.cmdHelp);
    }
});

cli.events.on(EventTypes.COMMANDCOMPLETION, function (completionData) {
    var ccEvt = new BotEvent(EventTypes.COMMANDCOMPLETION, CONSOLE_CHANNEL.stdinUser.channel, new CommandMessage(CONSOLE_CHANNEL.stdinUser.channel, new Date(), CONSOLE_CHANNEL.stdinUser, completionData.input, Math.random(), MessageType.GENERIC));
    ccEvt.data.completionList = completionData.suggestions;
    api.events.emit(EventTypes.COMMANDCOMPLETION, ccEvt);
});

function askForChannel(returnFunc) {
    cli.prompt("Channel: ", returnFunc);
}
function askForAccount(returnFunc) {
    cli.prompt("Account: ", returnFunc);
}
function askForPasswordFor(accountName, returnFunc) {
    cli.prompt("Password for '" + accountName + "': ", returnFunc, true);
}

api.events.on(EventTypes.CONSOLECOMMAND, function (event) {
    var command = event.data;
    if ((command.command === 'pluginloader' || command.command === 'pl') && event.claim()) {
        var subcommand = command.parameters.shift();
        switch (subcommand) {
            case 'load':
                api.pluginLoader.loadPlugin(event.data.parameters.join(' '), false);
                break;
            case 'start':
                api.pluginLoader.startPlugin(event.data.parameters.join(' '), false);
                break;
            case 'stop':
                api.pluginLoader.stopPlugin(event.data.parameters.join(' '), false);
                break;
            case 'unload':
                api.pluginLoader.unloadPlugin(event.data.parameters.join(' '), false);
                break;
            case 'reload':
                api.pluginLoader.stopPlugin(event.data.parameters.join(' '), false);
                api.pluginLoader.unloadPlugin(event.data.parameters.join(' '), false);
                api.pluginLoader.loadPlugin(event.data.parameters.join(' '), false);
                api.pluginLoader.startPlugin(event.data.parameters.join(' '), false);
                break;
        }
    } else if (command.command === 'connect' && event.claim()) {
        if (command.parameters.length > 0) {
            var channel = command.parameters[0];
            var acctIndex = command.parameters.indexOf("-a");
            var account = (acctIndex !== -1 && command.parameters.length > acctIndex) ? command.parameters[acctIndex + 1] : false;
            var passIndex = command.parameters.indexOf("-p");
            var password = (passIndex !== -1 && command.parameters.length > passIndex) ? command.parameters[passIndex + 1] : false;


        } else {
            command.reply("Usage: connect <Channel> -a <BotAccount> -p <BotAccountPassword>");
        }
    } else if (command.command === 'reconnect' && event.claim()) {
    } else if (command.command === 'disconnect' && event.claim()) {
    }
});
