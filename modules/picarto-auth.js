'use strict';

var request = require("request");
var io = require("socket.io-client");

var accountCache = {};

/**
 * Auth service for getting chat tokens from picarto
 */
var PicartoAuth = {
    /**
     * Extracts the chat token from an html document
     * @param {String} body
     * @returns {String}
     */
    getTokenFromHTML: function (body) {
        var func = body.match(/initChatVariables(.*);/)[0];
        var getLastApostrophe = func.lastIndexOf("'");
        var token = func.substring(func.lastIndexOf("'", getLastApostrophe - 1) + 1, getLastApostrophe);
        return token;
    },
    /**
     * Gets an authenticated cookie jar for a Picarto account
     * @param {String} account
     * @param {String} password
     * @param {Function} callback
     * @returns {undefined}
     */
    getAuthedCookieJar: function (account, password, callback) {
        if (accountCache[account.toLowerCase()]) {
            callback(false, accountCache[account.toLowerCase()]);
        } else {
            var cookieJar = request.jar();
            request({
                uri: 'https://picarto.tv/process/login',
                method: 'POST',
                form: {username: account, password: password, staylogged: false},
                jar: cookieJar,
                headers: {'Referer': 'https://www.picarto.tv/live/index.php'}
            }, function (error, response, body) {
                if (response && response.statusCode !== 200) {
                    if (!error)
                        error = new Error('Unexpected status code while logging in: ' + response.statusCode);
                }
                if (!error) {
                    var json = JSON.parse(body);
                    if (json.loginstatus) {
                        accountCache[account.toLowerCase()] = cookieJar;
                        callback(error, cookieJar);
                    } else {
                        error = new Error('Failed to login: ' + body);
                    }
                }
                if (error) {
                    callback(error);
                }
            });
        }
    },
    /**
     * Gets a chat token using the given cookie jar
     * @param {String} channel
     * @param {Object=} cookiejar
     * @param {Function} callback
     * @returns {undefined}
     */
    getTokenWithCookiejar: function (channel, cookiejar, callback) {
        var self = this;
        var jar = cookiejar || request.jar();
        request({
            uri: 'https://picarto.tv/' + channel,
            jar: jar,
            headers: {'Referer': 'https://www.picarto.tv/live/index.php'}
        }, function (error, response, body) {
            if (response && !error) {
                var status = response.statusCode;
                if (status !== 200 && status !== 302) {
                    error = new Error('Unexpected status code while fetching auth token: ' + status);
                }
            }
            if (!error) {
                var authToken = self.getTokenFromHTML(body);
                if (!authToken) {
                    error = new Error('Error parsing auth token');
                } else {
                    callback(error, authToken);
                }
            }
            if (error) {
                callback(error);
            }
        });
    },
    /**
     * Gets a read-only chat token
     * @param {String} channel
     * @param {Function} callback
     * @returns {undefined}
     */
    getReadOnlyToken: function (channel, callback) {
        this.getTokenWithCookiejar(channel, false, callback);
    },
    /**
     * Gets a anonomous chat token
     * @param {String} channel
     * @param {String} account
     * @param {Function} callback
     * @returns {undefined}
     */
    getAnonToken: function (channel, account, callback) {
        var self = this;
        var jar = request.jar();
        this.getTokenWithCookiejar(channel, jar, function (error, token) {
            if (!error) {
                var socket = io.connect("https://nd1.picarto.tv:443", {
                    secure: true,
                    forceNew: true,
                    query: "token=" + token
                });
                socket.on("nameResp", function (ok) {
                    if (ok) {
                        request({
                            uri: 'https://picarto.tv/process/channel',
                            method: 'POST',
                            form: {setusername: account},
                            jar: jar,
                            headers: {'Referer': 'https://www.picarto.tv/live/index.php'}
                        }, function (error, response, body) {
                            if (response && response.statusCode !== 200) {
                                if (!error)
                                    error = new Error('Unexpected status code while setting name: ' + response.statusCode);
                            }
                            if (!error) {
                                if ("userNameRegEx" === body) {
                                    error = new Error('Username has invalid characters!');
                                } else if ("userNameExists" === body) {
                                    error = new Error('Username is already in use!');
                                } else if ("userNameTooLong" === body) {
                                    error = new Error('Username is too long!');
                                } else if ("ok" === body) {
                                    request({
                                        uri: 'https://picarto.tv/process/channel',
                                        method: 'POST',
                                        form: {getuidchat: channel},
                                        jar: jar,
                                        headers: {'Referer': 'https://www.picarto.tv/live/index.php'}
                                    }, function (error, response, body) {
                                        if (response && response.statusCode !== 200) {
                                            if (!error)
                                                error = new Error('Unexpected status code while setting channel id : ' + response.statusCode);
                                        }
                                        if (!error) {
                                            if ("idset" === body) {
                                                socket.disconnect();
                                                request({
                                                    uri: 'https://picarto.tv/modules/channel-chat',
                                                    jar: jar,
                                                    headers: {'Referer': 'https://www.picarto.tv/live/index.php'}
                                                }, function (error, response, body) {
                                                    if (response && !error) {
                                                        var status = response.statusCode;
                                                        if (status !== 200 && status !== 302) {
                                                            error = new Error('Unexpected status code while fetching auth token: ' + status);
                                                        }
                                                    }
                                                    if (!error) {
                                                        var authToken = self.getTokenFromHTML(body);
                                                        if (!authToken) {
                                                            error = new Error('Error parsing auth token');
                                                        } else {
                                                            callback(error, authToken);
                                                        }
                                                    }
                                                    if (error) {
                                                        callback(error);
                                                    }
                                                });
                                            } else {
                                                error = new Error('Unexpected response when setting channel id: ' + body);
                                            }
                                        }
                                        if (error) {
                                            socket.disconnect();
                                            callback(error);
                                        }
                                    });
                                } else {
                                    error = new Error('Unexpected response when setting name: ' + body);
                                }
                            }
                            if (error) {
                                socket.disconnect();
                                callback(error);
                            }
                        });
                    } else {
                        console.log(ok);
                        socket.disconnect();
                        callback(new Error('Failed response from initial socket!'));
                    }
                });
                socket.emit("setName", account);
            } else {
                callback(error);
            }
        });
    },
    /**
     * Gets an authorized chat token using the given picarto acount
     * @param {String} channel
     * @param {String} account
     * @param {String} password
     * @param {Function} callback
     * @returns {undefined}
     */
    getAuthedToken: function (channel, account, password, callback) {
        var self = this;
        this.getAuthedCookieJar(account, password, function (error, jar) {
            if (!error) {
                self.getTokenWithCookiejar(channel, jar, callback);
            } else {
                callback(error);
            }
        });
    }
};

module.exports = PicartoAuth;