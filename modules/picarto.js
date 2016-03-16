var jsdom = require("jsdom");
var Promise = require("bluebird");

function getTokenFromHTML(body) {
    var func = body.match(/initChatVariables(.*);/)[0];
    var getLastApostrophe = func.lastIndexOf("'");
    var token = func.substring(func.lastIndexOf("'", getLastApostrophe - 1) + 1, getLastApostrophe);
    return token;
}

function getChannel(stream) {
    if (stream.indexOf("picarto.tv") !== -1) {
        stream = stream.substring(stream.lastIndexOf("/") + 1);
    }
    return stream
}

function getTokenForAccount(stream, username, password) {
    return new Promise(function (resolve, reject) {
        jsdom.env({
            url: "https://picarto.tv/" + getChannel(stream),
            features: {
                FetchExternalResources: ["script"],
                ProcessExternalResources: ["script"]
            },
            done: function (error, window) {
                if (error) {
                    console.log(error);
                    reject("jsdom error");
                }
                var $ = window.$;
                try {
                    $.post("process/login", {username: username, password: password, staylogged: false}, function (a) {
                        console.log(a);
                        if (a.loginstatus) {
                            $.get("/modules/channel-chat", function (a) {
                                $("#channel_chat").html(a);
                                resolve({
                                    token: getTokenFromHTML($("body").html()),
                                    readOnly: false
                                });
                            });
                        }
                        else {
                            reject("auth failure");
                        }
                    }, "json");
                } catch (e) {
                    reject("channelDoesNotExist");
                }
            }
        });
    });
}

function getToken(stream, name) {
    return new Promise(function (resolve, reject) {
        jsdom.env({
            url: "https://picarto.tv/" + getChannel(stream),
            features: {
                FetchExternalResources: ["script"],
                ProcessExternalResources: ["script"]
            },
            done: function (error, window) {
                if (error) { console.log(error); reject("jsdom error"); }
                var $ = window.$;
                if ($("#bottomLeft #chat_disabled_info").length) {
                    getROToken(stream).then(function (res) {
                        resolve({
                            token: res.token, 
                            readOnly: res.readOnly
                        });
                    }).catch(function (err) {
                        reject(err);
                    });
                    return;
                }
                var sock = window.socket;
                try {
                    sock.removeAllListeners("nameResp");
                    sock.on("nameResp", function (a) {
                        if (a === true) {
                            $.post("/process/channel", {
                                setusername: name
                            }).done(function (resp) {
                                if (resp === "ok") {
                                    sock.disconnect();
                                    $.get("/modules/channel-chat", function (a) {
                                        $("#channel_chat").html(a);
                                        resolve({
                                            token: getTokenFromHTML($("body").html()), 
                                            readOnly: false
                                        });
                                    });
                                } else {
                                    reject(resp);
                                }
                            });
                        } else {
                            reject(a);
                        }
                    });
                    sock.emit("setName", name);
                } catch (e) {
                    reject("channelDoesNotExist");
                }
            }
        });
    })
}

function getROToken(stream) {
    return new Promise(function (resolve, reject) {
        jsdom.env({
            url: "https://picarto.tv/" + getChannel(stream),
            features: {
                FetchExternalResources: ["script"],
                ProcessExternalResources: ["script"]
            },
            done: function (error, window) {
                if (error) { console.log(error); reject("jsdom error"); }
                try {
                    var $ = window.$;
                    resolve({
                        token: getTokenFromHTML($("body").html()), 
                        readOnly: true
                    });
                } catch (e) {
                    reject("channelDoesNotExist");
                }
            }
        });
    })
}

module.exports = {
    getTokenFromHTML: getTokenFromHTML,
    getChannel: getChannel,
    getTokenForAccount: getTokenForAccount,
    getToken: getToken,
    getROToken: getROToken
}
