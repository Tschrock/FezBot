module.exports = function (storage) {

    var TIMEOUTS_STORAGEKEY = "timeouts";

    var timeCache = {};
    var defaultTimeoutMs = 15000;

    function ifUndef(val, undefVal) {
        return typeof val !== 'undefined' ? val : undefVal;
    }

    var module = {};
    module.getAllTimeoutMs = function () {
        return storage.getItem(TIMEOUTS_STORAGEKEY) || {};
    };
    module.getChannelTimeoutMs = function (channel) {
        return this.getAllTimeoutMs(channel) || { channel: channel, timeoutMs: {}};
    };
    module.getTimeoutMs = function (channel, timeoutId, defaultMs) {
        return this.getChannelTimeoutMs(channel).timeoutMs[timeoutId.toLowerCase()] || this.setTimeoutMs(channel, timeoutId, ifUndef(defaultMs, defaultTimeoutMs));
    };
    module.setTimeoutMs = function (channel, timeoutId, timeoutMs) {
        var tStore = (storage.getItem(TIMEOUTS_STORAGEKEY) || {});
        var cTStore = this.getChannelTimeoutMs(channel);
        cTStore.timeoutMs[timeoutId.toLowerCase()] = timeoutMs;
        tStore[channel.toLowerCase()] = cTStore;
        storage.setItem(TIMEOUTS_STORAGEKEY, tStore);
        return timeoutMs;
    }
    module.getTimeoutTime = function (channel, timeoutId) {
        return (timeCache[channel.toLowerCase()] || {})[timeoutId.toLowerCase()] || 0;
    };
    module.getTimeRemaining = function (channel, timeoutId, defaultMs) {
        return Math.max(0, (this.getTimeoutMs(channel, timeoutId, defaultMs) - (Date.now() - this.getTime(channel, timeoutId))));
    };
    module.clearTimeout = function (channel, timeoutId) {
        (timeCache[channel] || (timeCache[channel.toLowerCase()] = {}))[timeoutId.toLowerCase()] = 0
    };
    module.checkTimeout = function (channel, timeoutId, defaultMs) {
        if (this.getTimeRemaining(channel, timeoutId, defaultMs) > 0) {
            return false;
        }
        (timeCache[channel] || (timeCache[channel.toLowerCase()] = {}))[timeoutId.toLowerCase()] = Date.now();
        return true;
    };
    return module;
};
/*
    getTimeoutMs
    getTimeoutTime
    checkTimeout
    getTimeRemaining
    setTimeout
    clearTimeout
    getAllTimeoutMs
*/