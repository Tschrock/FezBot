var api;

var MessageTypes = require('../modules/messagetypes');
var EventTypes = require('../modules/eventtypes');
var ColorUtils = require('../modules/consolecolorcodes');

function userMsg (event) {
    var message = event.data;
    var colorcode, colorname, hexcolor = message.extraData.color;
    if(hexcolor) {
        colorname = ColorUtils.getClosest(hexcolor);
    }
    if(colorname && ColorUtils.ConsoleColorCodes['Fg' + colorname]) {
        colorcode = ColorUtils.ConsoleColorCodes['Fg' + colorname];
    }
    
    console.log((colorcode ? colorcode : "") + message.channel.channelName + "/" + message.sender.username + ( message.type === MessageTypes.PRIVATE ? " -> " : "") + ": " + (colorcode ? ColorUtils.ConsoleColorCodes.Reset : "") + message.content);
}

module.exports = {
    meta_inf: {
        name: "Message Output",
        version: "1.0.0",
        description: "Read the chat from the bot console.",
        author: "Wolvan & Tschrock (CyberPon3)"
    },
    load: function (_api) {
        api = _api;
    },
    start: function () {
        api.events.on(EventTypes.USERMESSAGE, userMsg);
        api.events.on(EventTypes.MEMESSAGE, userMsg);
        api.events.on(EventTypes.WHISPER, userMsg);
        api.events.on(EventTypes.CHATCOMMAND, userMsg);
    },
    stop: function () {
        api.events.removeListener(EventTypes.USERMESSAGE, userMsg);
        api.events.removeListener(EventTypes.MEMESSAGE, userMsg);
        api.events.removeListener(EventTypes.WHISPER, userMsg);
        api.events.removeListener(EventTypes.CHATCOMMAND, userMsg);
    }
};
