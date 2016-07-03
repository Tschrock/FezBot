'use strict';

/**
 * Types of events
 * @readonly
 * @enum {number}
 */
var EventTypes = {
    
    // Channel Events
    
    /**
     * A channel got connected
     * @type {EventType}
     */
    CONNECT: "connect",
    /**
     * A channel got disconnected
     */
    DISCONNECT: "disconnect",
    /**
     * A channel got reconnected
     */
    RECONNECT: "reconnect",
    /**
     * A channel is attempting to reconnect
     */
    RECONNECTATTEMPT: "reconnect_attempt",
    /**
     * chatMode
     */
    CHATMODE: "chatMode",
    /**
     * A list of current users in a channel
     */
    CHANNELUSERS: "channelUsers",
    /**
     * A server message
     */
    SERVERMESSAGE: "srvMsg",
    /**
     * A user message
     */
    USERMESSAGE: "userMsg",
    /**
     * A /me message
     */
    MEMESSAGE: "meMsg",
    /**
     * A /me message
     */
    WHISPER: "whisper",
    /**
     * A global message
     */
    GLOBALMESSAGE: "globalMsg",
    /**
     * An instruction/request to clear chat history
     */
    CLEARCHAT: "clearChat",
    /**
     * A request for built-in command help
     */
    COMMANDHELP: "commandHelp",
    /**
     * Whether or not mod tools should be visible
     */
    MODTOOLSVISIBLE: "modToolsVisible",
    /**
     * A list of current mods in a channel
     */
    MODLIST: "modList",
    /**
     * The color of the bot's name in chat
     */
    COLOR: "color",
    /**
     * The online state of a stream
     */
    ONLINESTATE: "onlineState",
    /**
     * A list of users included in a raffle
     */
    RAFFLEUSERS: "raffleUsers",
    /**
     * The winner of a raffle
     */
    WONRAFFLE: "wonRaffle",
    /**
     * runPoll
     */
    RUNPOLL: "runPoll",
    /**
     * showPoll
     */
    SHOWPOLL: "showPoll",
    /**
     * pollVotes
     */
    POLLVOTES: "pollVotes",
    /**
     * voteResponse
     */
    VOTERESPONSE: "voteResponse",
    /**
     * finishPoll
     */
    FINISHPOLL: "finishPoll",
    /**
     * gameMode
     */
    GAMEMODE: "gameMode",
    /**
     * adultMode
     */
    ADULTMODE: "adultMode",
    /**
     * commissionsAvailable
     */
    COMMISSIONSAVAILABLE: "commissionsAvailable",
    /**
     * clearUser
     */
    CLEARUSER: "clearUser",
    /**
     * removeMsg
     */
    REMOVEMESSAGE: "removeMsg",
    /**
     * A PTVAdmin? warning that a channel has adult content but is not in adult mode.
     */
    WARNADULT: "warnAdult",
    /**
     * A PTVAdmin? warning that a channel has gaming content but is not in gaming mode.
     */
    WARNGAMING: "warnGaming",
    /**
     * A PTVAdmin? warning that a channel has movie content.
     */
    WARNMOVIES: "warnMovies",
    /**
     * The multistream status of a channel
     */
    MULTISTATUS: "multiStatus",
    /**
     * Emitted after replaying chat history
     */
    ENDHISTORY: "endHistory",
    /**
     * A list of people being ignored
     */
    IGNORES: "ignores",
    
    // Bot Events
    
    /**
     * The bot threw an exception
     */
    EXCEPTION: "exception",
    /**
     * A bot command
     */
    CHATCOMMAND: "chatCommand",
    /**
     * A console command
     */
    CONSOLECOMMAND: "consoleCommand",
    /**
     * A command needs completing
     */
    COMMANDCOMPLETION: "commandCompletion",
    /**
     * A plugin was loaded
     */
    PLUGINLOADED: "pluginLoaded",
    /**
     * A plugin was started
     */
    PLUGINSTARTED: "pluginStarted",
    /**
     * A plugin was loaded
     */
    PLUGINUNLOADED: "pluginUnloaded",
    /**
     * A plugin was started
     */
    PLUGINSTOPPED: "pluginStopped",
    /**
     * Used to query plugins if they want to add a cli option/flag
     */
    CLIOPTIONS: "CLIOptions"
};

module.exports = EventTypes;