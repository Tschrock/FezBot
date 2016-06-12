'use strict';

var MessageType = require('./messagetypes');
var NiceList = require('./nicelist');
var BotEvent = require('./botevent');
var CommandMessage = require('./commandmessage');

/**
 * Common key codes
 * @enum {String}
 * @private
 */
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

/**
 * Turns a string into an array of char codes
 * @private
 * @param {String} str
 * @returns {Integer[]}
 */
function strToCodeArr(str) {
    var arr = [];
    for (var i = 0; i < str.length; ++i) {
        arr.push(str.charCodeAt(i));
    }
    return arr;
}

function showConsoleHelp() {

}


/**
 * Gets a prefix common to all strings in a NiceList
 * @private
 * @param {NiceList} strings
 * @returns {String}
 */
function getCommonStringPrefix(strings) {
    var pos = 0;
    var first = strings.First();
    while (strings.All(function (curString) {
        return curString.length > pos && curString.charAt(pos) === first.charAt(pos);
    })) {
        ++pos;
    }
    return first.substring(0, pos);
}

/**
 * A custom-made cli
 * @constructor
 * @param {InputStream} stdin
 * @param {OutputStream} stdout
 * @param {EventEmiter} eventEmiter
 * @param {User} stdinUser
 * @returns {NiceCli}
 */
var NiceCLI = function (stdin, stdout, eventEmiter, stdinUser) {
    this.inputBuffer = "";
    this.inputCursor = 0;
    this.commandHistory = [];
    this.historyBuffer = "";
    this.historyCursor = 0;
    this.prompt = "ChatBot> ";
    this.moveStdOut = false;
    this.eventEmiter = eventEmiter;
    this.stdinUser = stdinUser;

    this.stdin = stdin;
    this.stdout = stdout;

    this.stdin.setRawMode(true);
    this.stdin.setEncoding('utf8');
    this.stdin.resume();

    var self = this;

    this.real_stdout_write = this.stdout.write;
    this.stdout.write = function () {
        if (self.moveStdOut) {
            self.moveStdOut = false;
            self.clearLine();
            self.cursorTo(0);
            self.real_stdout_write.apply(self.stdout, arguments);
            self.showPrompt();
            self.moveStdOut = true;
        } else {
            self.real_stdout_write.apply(self.stdout, arguments);
        }
    };

    this.stdin.on('data', function (key) {
        self.handleData(key);
    });

    this.moveStdOut = false;
    this.showPrompt();
    this.moveStdOut = true;
};


NiceCLI.prototype.clearLine = function () {
    this.stdout.write('\x1b[2K');
};

NiceCLI.prototype.cursorTo = function (x, y) {
    if (typeof x !== 'number')
        throw new Error('Can\'t set cursor row without also setting it\'s column');

    if (typeof y !== 'number') {
        this.stdout.write('\x1b[' + (x + 1) + 'G');
    } else {
        this.stdout.write('\x1b[' + (y + 1) + ';' + (x + 1) + 'H');
    }
};

NiceCLI.prototype.moveCursor = function (dx, dy) {
    if (dx < 0) {
        this.stdout.write('\x1b[' + (-dx) + 'D');
    } else if (dx > 0) {
        this.stdout.write('\x1b[' + dx + 'C');
    }

    if (dy < 0) {
        this.stdout.write('\x1b[' + (-dy) + 'A');
    } else if (dy > 0) {
        this.stdout.write('\x1b[' + dy + 'B');
    }
};

NiceCLI.prototype.showPrompt = function () {
    this.clearLine();
    this.cursorTo(0);
    this.stdout.write(this.prompt + this.inputBuffer);
    this.cursorTo(this.prompt.length + this.inputCursor);
};

NiceCLI.prototype.historyUp = function () {
    if (this.historyCursor === 0) {
        this.historyBuffer = this.inputBuffer;
    }
    if (this.historyCursor++ < this.commandHistory.length) {
        this.inputBuffer = this.commandHistory[this.commandHistory.length - this.historyCursor];
        this.inputCursor = this.inputBuffer.length;
        this.showPrompt();
    } else {
        this.historyCursor = this.commandHistory.length;
    }
};

NiceCLI.prototype.historyDown = function () {
    if (this.historyCursor-- >= 0) {
        if (this.historyCursor <= 0) {
            this.historyCursor = 0;
            this.inputBuffer = this.historyBuffer;
        } else {
            this.inputBuffer = this.commandHistory[this.commandHistory.length - this.historyCursor];
        }
        this.inputCursor = this.inputBuffer.length;
        this.showPrompt();
    } else {
        this.historyCursor = 0;
    }
};

NiceCLI.prototype.handleData = function (key) {
    this.moveStdOut = false;
    switch (key) {
        case KEYS.CTRL_C:
            this.stdout.write('\n');
            process.exit();
            break;
        case KEYS.UP:
            //this.moveHistory(1);
            this.historyUp();
            break;
        case KEYS.DOWN:
            //this.moveHistory(-1);
            this.historyDown();
            break;
        case KEYS.RIGHT:
            if (this.inputCursor++ < this.inputBuffer.length) {
                this.stdout.write(key);
            } else {
                this.inputCursor = this.inputBuffer.length;
            }
            break;
        case KEYS.LEFT:
            if (this.inputCursor-- > 0) {
                this.stdout.write(key);
            } else {
                this.inputCursor = 0;
            }
            break;
        case KEYS.ENTER:
            this.stdout.write('\n');
            if (this.inputBuffer !== "") {
                if (this.commandHistory[this.commandHistory.length - 1] !== this.inputBuffer) {
                    this.commandHistory.push(this.inputBuffer);
                }
                this.historyCursor = 0;
                this.moveStdOut = true;
                var ccEvt = new BotEvent("consoleCommand", this.stdinUser.channel, new CommandMessage(this.stdinUser.channel, new Date(), this.stdinUser, this.inputBuffer, Math.random(), MessageType.GENERIC));
                ccEvt.cmdHelp = new NiceList();
                this.eventEmiter.emit("consoleCommand", ccEvt);
                if (!ccEvt.claimed) {
                    console.log("Command '" + ccEvt.data.command + "' could not be found!");
                    showConsoleHelp(ccEvt.cmdHelp);
                }
                this.moveStdOut = false;
            }
            this.inputBuffer = "";
            this.inputCursor = 0;
            this.showPrompt();
            break;
        case KEYS.BACKSPACE:
            this.inputCursor--;
            if (this.inputCursor >= 0) {
                var afterTxt = this.inputBuffer.slice(this.inputCursor + 1, this.inputBuffer.length);
                this.inputBuffer = this.inputBuffer.slice(0, this.inputCursor) + afterTxt;
                this.showPrompt();
            } else {
                this.inputCursor = 0;
            }
            break;
        case KEYS.DELETE:
            if (this.inputCursor >= 0) {
                var afterTxt = this.inputBuffer.slice(this.inputCursor + 1, this.inputBuffer.length);
                this.inputBuffer = this.inputBuffer.slice(0, this.inputCursor) + afterTxt;
                this.showPrompt();
            } else {
                this.inputCursor = 0;
            }
            break;
        case KEYS.TAB:
            if (this.inputBuffer !== "") {
                this.moveStdOut = true;
                var ccEvt = new BotEvent("commandCompletion", this.stdinUser.channel, new CommandMessage(this.stdinUser.channel, new Date(), this.stdinUser, this.inputBuffer, Math.random(), MessageType.GENERIC));
                this.eventEmiter.emit("commandCompletion", ccEvt);
                if (ccEvt.data.completionList.Count() > 0) {
                    var common = getCommonStringPrefix(ccEvt.data.completionList);

                    if (this.inputBuffer.length < common.length || ccEvt.data.completionList.Count() === 1) {
                        this.inputBuffer = common;
                        this.inputCursor = this.inputBuffer.length;
                    } else {
                        console.log(ccEvt.data.completionList.AsArray().join("        "));
                    }
                }
                this.moveStdOut = false;
            }
            this.showPrompt();
            break;
        case KEYS.ESC:
            break;
        case KEYS.HOME:
            this.inputCursor = 0;
            this.cursorTo(this.prompt.length + this.inputCursor);
            break;
        case KEYS.END:
            this.inputCursor = this.inputBuffer.length;
            this.cursorTo(this.prompt.length + this.inputCursor);
            break;
        default:
            if (/^[\u0020-\u007e\u00a0-\u00ff]*$/.test(key)) {
                this.inputBuffer = this.inputBuffer.slice(0, this.inputCursor) + key + this.inputBuffer.slice(this.inputCursor);
                this.inputCursor += key.length;
                this.showPrompt();
            } else {
                console.log(strToCodeArr(key));
            }
    }
    this.moveStdOut = true;
};

module.exports = NiceCLI;