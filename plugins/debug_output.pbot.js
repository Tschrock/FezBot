var api;

function cEvt1 (data) { console.log("connect:"); console.log(data); }
function cEvt2 (data) { console.log("disconnect:"); console.log(data); }
function cEvt3 (data) { console.log("reconnect:"); console.log(data); }
function cEvt4 (data) { console.log("reconnect_attempt:"); console.log(data); }
function cEvt5 (data) { console.log("chatMode:"); console.log(data); }
function cEvt6 (data) { console.log("srvMsg:"); console.log(data); }
function cEvt7 (data) { console.log("channelUsers:"); console.log(data); }
function cEvt8 (data) { console.log("userMsg:"); console.log(data); }
function cEvt9 (data) { console.log("meMsg:"); console.log(data); }
function cEvt10 (data) { console.log("globalMsg:"); console.log(data); }
function cEvt11 (data) { console.log("clearChat:"); console.log(data); }
function cEvt12 (data) { console.log("commandHelp:"); console.log(data); }
function cEvt13 (data) { console.log("modToolsVisible:"); console.log(data); }
function cEvt14 (data) { console.log("modList:"); console.log(data); }
function cEvt15 (data) { console.log("whisper:"); console.log(data); }
function cEvt16 (data) { console.log("color:"); console.log(data); }
function cEvt17 (data) { console.log("onlineState:"); console.log(data); }
function cEvt18 (data) { console.log("raffleUsers:"); console.log(data); }
function cEvt19 (data) { console.log("wonRaffle:"); console.log(data); }
function cEvt20 (data) { console.log("runPoll:"); console.log(data); }
function cEvt21 (data) { console.log("showPoll:"); console.log(data); }
function cEvt22 (data) { console.log("pollVotes:"); console.log(data); }
function cEvt23 (data) { console.log("voteResponse:"); console.log(data); }
function cEvt24 (data) { console.log("finishPoll:"); console.log(data); }
function cEvt25 (data) { console.log("gameMode:"); console.log(data); }
function cEvt26 (data) { console.log("adultMode:"); console.log(data); }
function cEvt27 (data) { console.log("commissionsAvailable:"); console.log(data); }
function cEvt28 (data) { console.log("clearUser:"); console.log(data); }
function cEvt29 (data) { console.log("removeMsg:"); console.log(data); }
function cEvt30 (data) { console.log("warnAdult:"); console.log(data); }
function cEvt31 (data) { console.log("warnGaming:"); console.log(data); }
function cEvt32 (data) { console.log("warnMovies:"); console.log(data); }
function cEvt33 (data) { console.log("multiStatus:"); console.log(data); }

module.exports = {
    meta_inf: {
        name: "Debug Output",
        version: "1.0.0",
        description: "Posts all events to the bot console.",
        author: "Tschrock (CyberPon3)"
    },
    load: function (_api) {
        api = _api;
    },
    start: function () {
        api.Events.on("connect", cEvt1);
        api.Events.on("disconnect", cEvt2);
        api.Events.on("reconnect", cEvt3);
        api.Events.on("reconnect_attempt", cEvt4);
        api.Events.on("chatMode", cEvt5);
        api.Events.on("srvMsg", cEvt6);
        api.Events.on("channelUsers", cEvt7);
        api.Events.on("userMsg", cEvt8);
        api.Events.on("meMsg", cEvt9);
        api.Events.on("globalMsg", cEvt10);
        api.Events.on("clearChat", cEvt11);
        api.Events.on("commandHelp", cEvt12);
        api.Events.on("modToolsVisible", cEvt13);
        api.Events.on("modList", cEvt14);
        api.Events.on("whisper", cEvt15);
        api.Events.on("color", cEvt16);
        api.Events.on("onlineState", cEvt17);
        api.Events.on("raffleUsers", cEvt18);
        api.Events.on("wonRaffle", cEvt19);
        api.Events.on("runPoll", cEvt20);
        api.Events.on("showPoll", cEvt21);
        api.Events.on("pollVotes", cEvt22);
        api.Events.on("voteResponse", cEvt23);
        api.Events.on("finishPoll", cEvt24);
        api.Events.on("gameMode", cEvt25);
        api.Events.on("adultMode", cEvt26);
        api.Events.on("commissionsAvailable", cEvt27);
        api.Events.on("clearUser", cEvt28);
        api.Events.on("removeMsg", cEvt29);
        api.Events.on("warnAdult", cEvt30);
        api.Events.on("warnGaming", cEvt31);
        api.Events.on("warnMovies", cEvt32);
        api.Events.on("multiStatus", cEvt33);
    },
    stop: function () {
        api.Events.removeListener("connect", cEvt1);
        api.Events.removeListener("disconnect", cEvt2);
        api.Events.removeListener("reconnect", cEvt3);
        api.Events.removeListener("reconnect_attempt", cEvt4);
        api.Events.removeListener("chatMode", cEvt5);
        api.Events.removeListener("srvMsg", cEvt6);
        api.Events.removeListener("channelUsers", cEvt7);
        api.Events.removeListener("userMsg", cEvt8);
        api.Events.removeListener("meMsg", cEvt9);
        api.Events.removeListener("globalMsg", cEvt10);
        api.Events.removeListener("clearChat", cEvt11);
        api.Events.removeListener("commandHelp", cEvt12);
        api.Events.removeListener("modToolsVisible", cEvt13);
        api.Events.removeListener("modList", cEvt14);
        api.Events.removeListener("whisper", cEvt15);
        api.Events.removeListener("color", cEvt16);
        api.Events.removeListener("onlineState", cEvt17);
        api.Events.removeListener("raffleUsers", cEvt18);
        api.Events.removeListener("wonRaffle", cEvt19);
        api.Events.removeListener("runPoll", cEvt20);
        api.Events.removeListener("showPoll", cEvt21);
        api.Events.removeListener("pollVotes", cEvt22);
        api.Events.removeListener("voteResponse", cEvt23);
        api.Events.removeListener("finishPoll", cEvt24);
        api.Events.removeListener("gameMode", cEvt25);
        api.Events.removeListener("adultMode", cEvt26);
        api.Events.removeListener("commissionsAvailable", cEvt27);
        api.Events.removeListener("clearUser", cEvt28);
        api.Events.removeListener("removeMsg", cEvt29);
        api.Events.removeListener("warnAdult", cEvt30);
        api.Events.removeListener("warnGaming", cEvt31);
        api.Events.removeListener("warnMovies", cEvt32);
        api.Events.removeListener("multiStatus", cEvt33);
    }
}