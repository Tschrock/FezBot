#!/usr/bin/env node
'use strict';

var commander = require("commander");
var storage = require("node-persist");
var EventEmitter = require("events");

var NiceList = require('./modules/nicelist');
var PicartoAuth = require('./modules/picarto-auth');
var PluginLoader = require('./modules/pluginloader_old');

var ChannelManager = require('./modules/channelmanager');
var ConsoleChannel = require('./modules/consolechannel');

var NiceCLI = require('./modules/nicecli');

var store = storage.create({dir: process.cwd() + "/storage/main_app"});
store.initSync();

var API = function () {
    this.version = "2.0.0";
    this.events = new EventEmitter();
    this.channels = new ChannelManager(this);
    this.events.setMaxListeners(0);
    this.plugins = new PluginLoader(this);
    this.sharedStorage = storage.create({dir: process.cwd() + "/storage/shared_storage"});
    this.sharedStorage.initSync();
    this.jade = require('jade');
    this.mainAppStorage = store;
    this.pluginLoader = new PluginLoader(this, storage.create({dir: process.cwd() + "/storage/plugin_loader"}));
};

var api = new API();

api.events.on("connect", function (event) {
    console.log("Connected to " + event.source.channelName);
});
api.events.on("disconnect", function (event) {
    console.log("Disconnected from " + event.source.channelName);
});
api.events.on("consoleCommand", function (event) {
    if (event.data.command === "quit" || event.data.command === "exit" || event.data.command === "stop") {
        cli.moveStdOut = false;
        process.stdout.write('\n');
        process.exit();
    }
});
api.events.on("exception", function (event) {
    if(event.data.channel)
        event.data.channel.sendMessage("(╯°□°）╯︵ uoᴉʇdǝɔxƎ");
    console.log(event);
});

// Load all Plugins in the ./plugins directory
var quiet_loading = true;
api.pluginLoader.listPlugins().forEach(function (item) {
    var plugin_state = api.pluginLoader.getInitialPluginState(item);
    if (plugin_state === "running" || plugin_state === "loaded") {
        api.pluginLoader.loadPlugin(item, quiet_loading);
    }
    if (plugin_state === "running") {
        api.pluginLoader.startPlugin(item, quiet_loading);
    }
});

console.log("Loded plugins:", api.pluginLoader.getLoadedPlugins().join(", "));
console.log("Started plugins:", api.pluginLoader.getStartedPlugins().join(", "));

/**
 * Returns an id for a name
 * @returns {String}
 */
var idFromName = function () {
    return this.name.toLowerCase();
};

// Startup channel connections
function ChannelConfiguration(name, account, token) {
    this.name = name;
    this.account = account || false;
    this.token = token || false;
    Object.defineProperty(this, "id", {get: idFromName});
}

function AccountConfiguration(name, password) {
    this.name = name;
    this.password = password || false;
    Object.defineProperty(this, "id", {get: idFromName});
}

var channelsToConnect = new NiceList();
var definedAccounts = new NiceList();

// Load commandline args and env variables
commander.version(api.version).usage("[options]")
        .option("-c, --channel <Picarto Channel>", "Set channel to connect to.")
        .option("-n, --botname <Bot name>", "Set the bot's name.")
        .option("-t, --token <Token>", "Use an already existing token to login")
        .option("-p, --port <Port>", "Set a custom port")
        .option("-u, --url <URL>", "Set a custom URL")
        .option("-l, --password <Password>", "Use the given password.")
        .parse(process.argv);

var startupOptions = {
    token: commander.token || process.env.PICARTO_TOKEN || false,
    accountname: commander.botname || process.env.PICARTO_NAME || false,
    channel: commander.channel || process.env.PICARTO_CHANNEL || false,
    password: commander.password || process.env.PICARTO_PASSWORD || false
};

if (startupOptions.channel) {
    channelsToConnect.Add(new ChannelConfiguration(startupOptions.channel, startupOptions.accountname, startupOptions.token));
}

if (startupOptions.accountname && startupOptions.password) {
    definedAccounts.Add(new AccountConfiguration(startupOptions.accountname, startupOptions.password));
}

// Load config
var config = require("./config.json") || {};

if (config.channels && config.channels.length) {
    config.channels.forEach(function (channel) {
        if (channel.enabled !== false) {
            if (channel.channel) {
                var conf = channelsToConnect.Get(channel.channel.toLowerCase());
                if (!conf) {
                    channelsToConnect.Add(conf = new ChannelConfiguration(channel.channel));
                }
                conf.account = channel.channel;
                conf.token = channel.token;
            }
            if (channel.name) {
                var conf = definedAccounts.Get(channel.name.toLowerCase());
                if (!conf) {
                    definedAccounts.Add(conf = new AccountConfiguration(channel.name));
                }
                if (channel.password)
                    conf.password = channel.password;
            }
        }
    });
}

console.log("Channels:", channelsToConnect.items);
console.log("Accounts:", definedAccounts.Select(function (x) {
    return x.name;
}).items);

channelsToConnect.ForEach(function (channel) {
    if (!channel.account && startupOptions.accountname) {
        channel.account = startupOptions.accountname;
    }
    if (!channel.account || channel.account === '+') {
        // promt for account
        console.log("Need account");
    }
    if (!channel.token) {
        var account = definedAccounts.Get(channel.account.toLowerCase());
        if (!account) {
            definedAccounts.Add(account = new AccountConfiguration(channel.account));
        }
        if (!account.password && startupOptions.password) {
            account.password = startupOptions.password;
        }
        if (!account.password || account.password === '+') {
            // promt for account password
            console.log("Need password");
        }
        var finishConnection = function (error, token) {
            if (!error) {
                api.channels.newChannel(token, channel.name, channel.account);
            } else {
                console.log("Error connecting to '" + channel.name + "': " + error.message);
            }
        };
        if (!account.password || account.password === '-') {
            channel.token = PicartoAuth.getAnonToken(channel.name, account.name, finishConnection);
        } else {
            channel.token = PicartoAuth.getAuthedToken(channel.name, account.name, account.password, finishConnection);
        }
    } else {
        api.channels.newChannel(channel.token, channel.name, channel.account);
    }
});


var CONSOLE_CHANNEL = new ConsoleChannel(api, process.stdin, process.stdout);

var cli = new NiceCLI(process.stdin, process.stdout, api.events, CONSOLE_CHANNEL.stdinUser);