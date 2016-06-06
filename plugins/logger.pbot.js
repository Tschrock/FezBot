var api;
var storage;

function handleMessage(event) {
    var message = event.data;
    var key = message.channel.channelName + "_" + message.recieveDate.getDate() + "_" + (message.recieveDate.getMonth() + 1) + "_" + message.recieveDate.getFullYear();
    var record = storage.getItem(key) || {
        channel: message.channel.channelName,
        date: message.recieveDate.getDate() + "/" + (message.recieveDate.getMonth() + 1) + "/" + message.recieveDate.getFullYear(),
        messages: []
    };
    record.messages.push({username: message.sender.username, color: message.extraData.color, msg: message.content, timestamp: message.recieveDate.getTime()});
    storage.setItem(key, record);
}

function servePage(req, res) {
    var path = req.url.split('/');
    if (path.length > 3 && path[1].toLowerCase() == "logger" && path[3] != '') {
        var record = storage.getItem(path[2] + "_" + path[3]) || false;
        if (record) {
            api.jade.renderFile(process.cwd() + '/views/chatLog.jade', {record: record, page: {title: record.channel + " " + record.date, breadcrumb: [["/", "Home"], ["/logger", "Chat Logger"], ["/logger/" + record.channel, record.channel], ["", record.date]]}}, function (err, html) {
                res.write(html);
            });
        } else {
            api.jade.renderFile(process.cwd() + '/views/404.jade', null, function (err, html) {
                res.write(html);
            });
        }
    } else if (path.length > 2 && path[1].toLowerCase() == "logger" && path[2] != '') {
        var regex = new RegExp("^" + path[2]);
        var records = storage.valuesWithKeyMatch(regex).sort(function (x, y) {
            return reorgDate(x.date).localeCompare(reorgDate(y.date));
        });
        if (records.length > 0) {
            api.jade.renderFile(process.cwd() + '/views/chatLogDateList.jade', {records: records, page: {title: records[0].channel + " Chat Logs", breadcrumb: [["/", "Home"], ["/logger", "Chat Logger"], ["", records[0].channel]]}}, function (err, html) {
                res.write(html);
            });
        } else {
            api.jade.renderFile(process.cwd() + '/views/404.jade', null, function (err, html) {
                res.write(html);
            });
        }
    } else if (path[1].toLowerCase() == "logger") {
        var allRecords = storage.values() || [];
        var channels = {};
        for (record in allRecords) {
            if (channels.hasOwnProperty(allRecords[record].channel)) {
                channels[allRecords[record].channel].records++;
                if (new Date(allRecords[record].date) > new Date(channels[allRecords[record].channel].date)) {
                    channels[allRecords[record].channel].date = allRecords[record].date();
                }
            } else {
                channels[allRecords[record].channel] = {channel: allRecords[record].channel, date: allRecords[record].date, records: 1};
            }
        }
        api.jade.renderFile(process.cwd() + '/views/channels.jade', {url: '/logger/', channels: channels, page: {title: "Chat Logs", breadcrumb: [["/", "Home"], ["/logger", "Chat Logger"]]}}, function (err, html) {
            res.write(html);
        });
    } else {
        if (req.collection == null)
            req.collection = [];
        req.collection.push(["Logger", "/logger/", "The logger subsection of the site."]);
    }
}

function handleStatUpdate(event) {
    var edata = event.data;
    var now = new Date();
    var key = event.source.channelName + "_" + now.getDate() + "_" + (now.getMonth() + 1) + "_" + now.getFullYear();
    var record = storage.getItem(key) || {
        channel: event.source.channelName,
        date: now.getDate() + "/" + (now.getMonth() + 1) + "/" + now.getFullYear(),
        messages: []
    };
    record.messages.push({username: edata.sender.username, color: edata.extraData.color, msg: edata.content, timestamp: edata.recieveDate.getTime()});
    switch (event.type) {
        case "connected":
            record.messages.push({type: 'update', msg: 'Connected to ' + edata, timestamp: now.getTime()});
            break;
        case "disconnected":
            record.messages.push({type: 'update', msg: 'Disconnected from ' + edata.channel + " (" + edata.reason + ")", timestamp: now.getTime()});
            break;
        case "reconnected":
            record.messages.push({type: 'update', msg: 'Reconnected to ' + edata, timestamp: now.getTime()});
            break;
        default:
            return;
    }
    storage.setItem(key, record);
}

function reorgDate(date) {
    var a = date.split("/");
    return a[2] + "/" + ("00" + a[1]).substr(-2, 2) + "/" + ("00" + a[0]).substr(-2, 2);
}

module.exports = {
    meta_inf: {
        name: "Logger",
        version: "1.0.1",
        description: "Logs picarto chats.",
        author: "Amm & Tschrock (CyberPon3)",
        storage_options: {
            interval: 5000
        }
    },
    load: function (_api, _storage) {
        api = _api;
        storage = _storage;
    },
    start: function () {
        api.events.on("userMsg", handleMessage);
        api.events.on("meMsg", handleMessage);
        api.events.on("chatCommand", handleMessage);
        api.events.on("http", servePage);
        api.events.on("connected", handleStatUpdate);
        api.events.on("disconnected", handleStatUpdate);
        api.events.on("reconnected", handleStatUpdate);
    },
    stop: function () {
        api.events.removeListener("userMsg", handleMessage);
        api.events.removeListener("meMsg", handleMessage);
        api.events.removeListener("chatCommand", handleMessage);
        api.events.removeListener("http", servePage);
        api.events.removeListener("connected", handleStatUpdate);
        api.events.removeListener("disconnected", handleStatUpdate);
        api.events.removeListener("reconnected", handleStatUpdate);
    }
};