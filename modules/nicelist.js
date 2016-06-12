'use strict';

/**
 * A mapped list with extras
 * @constructor
 * @returns {NiceList}
 */
var NiceList = function () {
    /**
     * @field
     * @type Object
     */
    this.items = {};
};
NiceList.prototype.getId = function (val) {
    return val.id || false;
};
/**
 * Gets an item by it's id
 * @param {String} id
 * @returns {Object|Boolean}
 */
NiceList.prototype.Get = function (id) {
    return typeof this.items['$' + id] !== 'undefined' ? this.items['$' + id] : false;
};
/**
 * Sets an item with the given id
 * @param {String} id
 * @param {Object} value
 * @returns {undefined}
 */
NiceList.prototype.Set = function (id, value) {
    this.items['$' + id] = value;
};
/**
 * Adds an item
 * @param {Object} value
 * @returns {String} The item's id
 */
NiceList.prototype.Add = function (value) {
    var id;
    if ((id = this.getId(value)) === false) {
        id = this.Count();
    }
    this.items['$' + id] = value;
    return id;
};
/**
 * Runs a callback function for each item in the list
 * @param {Function} callback
 * @returns {undefined}
 */
NiceList.prototype.ForEach = function (callback) {
    for (var id in this.items) {
        callback.call(null, this.items[id], id.slice(1));
    }
};
/**
 * Returns a NiceList of all items for which `callback` returns `true`
 * @param {Function} callback
 * @returns {NiceList}
 */
NiceList.prototype.Where = function (callback) {
    var rtn = new NiceList();
    for (var id in this.items) {
        if (callback.call(null, this.items[id], id.slice(1)))
            rtn.Set(id.slice(1), this.items[id]);
    }
    return rtn;
};
/**
 * Returns a NiceList of the result of `callback` for each item
 * @param {Function} callback
 * @returns {NiceList}
 */
NiceList.prototype.Select = function (callback) {
    var rtn = new NiceList();
    for (var id in this.items) {
        rtn.Set(id.slice(1), callback.call(null, this.items[id], id.slice(1)));
    }
    return rtn;
};
/**
 * Checks if any result of `callback` returns `true`
 * @param {Function} callback
 * @returns {Boolean}
 */
NiceList.prototype.Any = function (callback) {
    for (var id in this.items) {
        if (!callback || callback.call(null, this.items[id], id.slice(1)))
            return true;
    }
    return false;
};
/**
 * Checks if all results of `callback` return `true`
 * @param {Function} callback
 * @returns {Boolean}
 */
NiceList.prototype.All = function (callback) {
    for (var id in this.items) {
        if (!callback || !callback.call(null, this.items[id], id.slice(1)))
            return false;
    }
    return true;
};
/**
 * Returns the length of the list
 * @returns {Integer}
 */
NiceList.prototype.Count = function () {
    return Object.keys(this.items).length;
};
/**
 * Returns the first item in the list. No guarentees!
 * @returns {NiceList}
 */
NiceList.prototype.First = function () {
    for (var id in this.items) {
        return this.items[id];
    }
};
/**
 * Returns the list as an array
 * @returns {Object[]}
 */
NiceList.prototype.AsArray = function () {
    var rtn = [];
    for (var id in this.items) {
        rtn.push(this.items[id]);
    }
    return rtn;
};
/**
 * Returns a random item from the list
 * @returns {Object}
 */
NiceList.prototype.Random = function () {
    var rand = Math.floor(Math.random() * this.Count());
    var i = -1;
    for (var id in this.items) {
        if (++i === rand) {
            return this.items[id];
        }
    }
};

module.exports = NiceList;