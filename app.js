#!/usr/bin/env node
'use strict';

var commander = require("commander");
var storage = require("node-persist");
var EventEmitter = require("events");

var NiceList = require('./modules/nicelist');
var PicartoAuth = require('./modules/picarto-auth');
var BotUtil = require('./modules/botutil');
var Channel = require('./modules/channel');
var MessageType = require('./modules/messagetype');
var Message = require('./modules/message');
var User = require('./modules/user');
var BotEvent = require('./modules/botevent');

var store = storage.create({dir: process.cwd() + "/storage/main_app"});
store.initSync();

var plugin_loader = false;
var API = function () {
    this.version = "2.0.0";
    this.events = new EventEmitter();
    this.channels = new ChannelManager(this);
    this.events.setMaxListeners(0);
    this.permissions = require('./modules/permissions_manager')(store);
    this.timeouts = require('./modules/timeout_manager')(store);
    this.plugins = new PluginLoader(this);
    this.sharedStorage = storage.create({dir: process.cwd() + "/storage/shared_storage"});
    this.sharedStorage.initSync();
    this.jade = require('jade');
};

var api = new API();

api.events.on("connect", function (event) {
    console.log("Connected to " + event.source.channelName);
});
api.events.on("disconnect", function () {
    console.log("Disconnected from " + event.source.channelName);
});

// Load all Plugins in the ./plugins directory
var quiet_loading = true;
plugin_loader.listPlugins().forEach(function (item) {
    var plugin_state = plugin_loader.getInitialPluginState(item);
    if (plugin_state === "running" || plugin_state === "loaded") {
        plugin_loader.loadPlugin(item, quiet_loading);
    }
    if (plugin_state === "running") {
        plugin_loader.startPlugin(item, quiet_loading);
    }
});

console.log("Loded plugins:", plugin_loader.getLoadedPlugins().join(", "));
console.log("Started plugins:", plugin_loader.getStartedPlugins().join(", "));

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


var ConsoleChannel = BotUtil.extendObj(Channel, function (api, stdin, stdout) {
    this._api = api;
    this._token = "";
    this.channelName = "Console";
    this.accountname = "Console";
    this.onlineUsers = new UserManager(this);
    this.stdinUser = new ConsoleUser(this.onlineUsers);
    this.onlineUsers.Add(this.stdinUser);
    this._stdin = stdin;
    this._stdout = stdout;
    this.permissions = {
        getUserPermissionLevel: function () {
            return -1;
        }
    };
});

ConsoleChannel.prototype.connect = function () {
    console.error("Error: cannot 'connect()' console channel.");
    return false;
};
ConsoleChannel.prototype.disconnect = function () {
    console.error("Error: cannot 'disconnect()' console channel.");
    return false;
};
ConsoleChannel.prototype.isConnected = function () {
    return true;
};
ConsoleChannel.prototype.isMuted = function () {
    return false;
};
ConsoleChannel.prototype.sendMessage = function (messageType, content) {
    this._stdout.write(content + "\n");
    return true;
};
ConsoleChannel.prototype.checkTimeout = function () {
    return true;
};

var ConsoleUser = BotUtil.extendObj(User, function () {
    User.apply(this, arguments);
    this.username = "Console";
    this.privilegeLevel = -1;
});

var CONSOLE_CHANNEL = new ConsoleChannel(api, process.stdin, process.stdout);

var readline = require('readline');
var imputBuffer = "";

process.stdin.setRawMode(true);
process.stdin.setEncoding('utf8');
process.stdin.resume();

var KEYS = {
    UP: String.fromCharCode(27, 91, 65),
    DOWN: String.fromCharCode(27, 91, 66),
    RIGHT: String.fromCharCode(27, 91, 67),
    LEFT: String.fromCharCode(27, 91, 68),
    ENTER: String.fromCharCode(13),
    BACKSPACE: String.fromCharCode(127),
    DELETE: String.fromCharCode(27, 91, 51, 126),
    TAB: String.fromCharCode(9),
    ESC: String.fromCharCode(27),
    HOME: String.fromCharCode(27, 91, 72),
    END: String.fromCharCode(27, 91, 70),
    CTRL_C: String.fromCharCode(3)
};

function strToCodeArr(str) {
    var arr = [];
    for (var i = 0; i < str.length; ++i) {
        arr.push(str.charCodeAt(i));
    }
    return arr;
}

function showConsoleHelp() {

}

var outputbuffer = "";

var commandHistory = [];
var historyPosition = 0;
var historyOriginalLine = "";
var prompt = "ChatBot> ";
var inputbuffer = "";
var cursorpos = 0;

var moveStdIO = true;
var real_stdout_write = process.stdout.write;
process.stdout.write = function () {
    if (moveStdIO) {
        moveStdIO = false;
        //console.error({ ob: outputbuffer});
        readline.clearLine(process.stdout, 0);
        readline.cursorTo(process.stdout, 0, null);
        //if (outputbuffer.length > 0) {
        //    readline.moveCursor(process.stdout, 0, -1);
        //}
        //outputbuffer += arguments[0];
        //arguments[0] = outputbuffer;
        //outputbuffer = outputbuffer.split("\n").slice(-1)[0] || "";
        //if (outputbuffer.length > 0) {
        //    arguments[0] += "\n";
        //}
        //console.error({ ob: outputbuffer , args: arguments});
        real_stdout_write.apply(process.stdout, arguments);

        showPrompt();

        moveStdIO = true;
    } else {
        //console.error({ args: arguments});
        real_stdout_write.apply(process.stdout, arguments);
    }
};

function showPrompt() {
    readline.clearLine(process.stdout, 0);
    readline.cursorTo(process.stdout, 0, null);
    process.stdout.write(prompt + inputbuffer);
    readline.cursorTo(process.stdout, prompt.length + cursorpos, null);
}

process.stdin.on('data', function (key) {
    moveStdIO = false;
    switch (key) {
        case KEYS.UP:
            //console.log("UP");
            if (historyPosition === 0) {
                historyOriginalLine = inputbuffer;
            }
            if (historyPosition++ < commandHistory.length) {
                inputbuffer = commandHistory[commandHistory.length - historyPosition];
                cursorpos = inputbuffer.length;
                readline.clearLine(process.stdout, 0);
                readline.cursorTo(process.stdout, 0, null);
                process.stdout.write(prompt + inputbuffer);
            } else {
                historyPosition = commandHistory.length;
            }
            break;
        case KEYS.DOWN:
            //console.log("DOWN");
            if (historyPosition-- >= 0) {
                if (historyPosition <= 0) {
                    historyPosition = 0;
                    inputbuffer = historyOriginalLine;
                } else {
                    inputbuffer = commandHistory[commandHistory.length - historyPosition];
                }
                cursorpos = inputbuffer.length;
                readline.clearLine(process.stdout, 0);
                readline.cursorTo(process.stdout, 0, null);
                process.stdout.write(prompt + inputbuffer);
            } else {
                historyPosition = 0;
            }
            break;
        case KEYS.RIGHT:
            //console.log("RIGHT");
            if (cursorpos++ < inputbuffer.length) {
                process.stdout.write(key);
            } else {
                cursorpos = inputbuffer.length;
            }
            break;
        case KEYS.LEFT:
            //console.log("LEFT");
            if (cursorpos-- > 0) {
                process.stdout.write(key);
            } else {
                cursorpos = 0;
            }
            break;
        case KEYS.ENTER:
            //console.log("ENTER");
            process.stdout.write('\n');
            if (outputbuffer.length > 0) {
                process.stdout.write('\n');
            }
            if (inputbuffer !== "") {
                commandHistory.push(inputbuffer);
                historyPosition = 0;
                moveStdIO = true;
                var ccEvt = new BotEvent("consoleCommand", CONSOLE_CHANNEL, new CommandMessage(CONSOLE_CHANNEL, new Date(), CONSOLE_CHANNEL.stdinUser, inputbuffer, Math.random(), MESSAGE_TYPES.GENERIC));
                ccEvt.cmdHelp = new NiceList();
                api.events.emit("consoleCommand", ccEvt);
                if (!ccEvt.claimed) {
                    showConsoleHelp(ccEvt.cmdHelp);
                }
                moveStdIO = false;
            }
            inputbuffer = "";
            cursorpos = 0;
            showPrompt();
            break;
        case KEYS.BACKSPACE:
            //console.log("BACKSPACE");
            cursorpos--;
            if (cursorpos >= 0) {
                var afterTxt = inputbuffer.slice(cursorpos + 1, inputbuffer.length);
                inputbuffer = inputbuffer.slice(0, cursorpos) + afterTxt;
                showPrompt();
            } else {
                cursorpos = 0;
            }
            break;
        case KEYS.DELETE:
            //console.log("DELETE");
            if (cursorpos >= 0) {
                var afterTxt = inputbuffer.slice(cursorpos + 1, inputbuffer.length);
                inputbuffer = inputbuffer.slice(0, cursorpos) + afterTxt;
                showPrompt();
            } else {
                cursorpos = 0;
            }
            break;
        case KEYS.TAB:
            //console.log("TAB");
            break;
        case KEYS.ESC:
            //console.log("ESC");
            break;
        case KEYS.HOME:
            //console.log("ESC");
            cursorpos = 0;
            readline.cursorTo(process.stdout, prompt.length + cursorpos, null);
            break;
        case KEYS.END:
            //console.log("ESC");
            cursorpos = inputbuffer.length;
            readline.cursorTo(process.stdout, prompt.length + cursorpos, null);
            break;
        case KEYS.CTRL_C:
            process.stdout.write('\n');
            process.exit();
            break;
        default:
            if (/^[\u0020-\u007e\u00a0-\u00ff]*$/.test(key)) {
                inputbuffer = inputbuffer.slice(0, cursorpos) + key + inputbuffer.slice(cursorpos);
                cursorpos += key.length;
                showPrompt();
            } else {
                console.log(strToCodeArr(key));
            }
    }
    moveStdIO = true;
});

moveStdIO = false;
showPrompt();
moveStdIO = true;