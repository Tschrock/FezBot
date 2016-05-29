'use strict';
var windows = process.platform.indexOf("win") === 0;
module.exports = {
    /**
     * Returns whether or not an object is undefined
     * @param {Object} val
     * @returns {Boolean}
     */
    isDef: function (val) {
        return typeof val !== 'undefined';
    },
    /**
     * Returns (val), or `other` if [val] is undefined
     * @param {Object} val
     * @param {Object} other
     * @returns {Object}
     */
    ifDef: function (val, other) {
        return this.isDef(val) ? val : other;
    },
    /**
     * Sets the `prop` property of `obj` to `val` if `val` is defined
     * @param {Object} val
     * @param {Object} obj
     * @param {String} prop
     * @returns {undefined}
     */
    setIfDef: function (val, obj, prop) {
        if (this.isDef(val))
            obj[prop] = val;
    },
    /**
     * The callback for a socket event
     * @callback BotUtil~socketEventCallback
     * @param {Object} eventdata
     */

    /**
     * Intercepts socket events for `socket`, calling `callback` for each event
     * @param {Socket} socket
     * @param {BotUtil~socketEventCallback} callback
     * @returns {Socket}
     */
    interceptSocketEvents: function (socket, callback) {
        if (!socket._$onevent) {
            socket._$onevent = socket.onevent;
        }
        socket.onevent = function (x) {
            if (callback)
                callback.apply(this, arguments);
            this._$onevent.apply(this, arguments);
        };
        return socket;
    },
    /**
     * Creates a shallow copy of `obj`, skipping any properites in `props`
     * @param {Object} obj
     * @param {String[]} props
     * @returns {Object}
     */
    copyObjectWithout: function (obj, props) {
        var rtn = {};
        for (var key in obj) {
            if (obj.hasOwnProperty(key) && props.indexOf(key) === -1) {
                rtn[key] = obj.key;
            }
        }
        return rtn;
    },
    /**
     * Merges all properties of `obj2` into `obj1`
     * @param {Object} obj1
     * @param {Object} obj2
     * @returns {Object}
     */
    mergeObjects: function (obj1, obj2) {
        for (var attrname in obj2) {
            if (obj2.hasOwnProperty(attrname))
                obj1[attrname] = obj2[attrname];
        }
        return obj1;
    },
    /**
     * Merges all properties of `obj2` into `obj1`, skipping any properites in `props`
     * @param {Object} obj1
     * @param {Object} obj2
     * @param {String[]} props
     * @returns {Object}
     */
    mergeObjectsWithout: function (obj1, obj2, props) {
        for (var key in obj2) {
            if (obj2.hasOwnProperty(key) && props.indexOf(key) === -1) {
                obj1[key] = obj2.key;
            }
        }
        return obj1;
    },
    /**
     * Creates a new class extending `obj` using `constructor` 
     * @param {Object} obj
     * @param {Function} constructor
     * @returns {Function}
     */
    extendObj: function (obj, constructor) {
        var newObj = function () {
            constructor.apply(this, arguments);
        };
        newObj.prototype = Object.create(obj.prototype);
        newObj.prototype.constructor = obj;
        return newObj;
    },
    /**
     * Repeats `pattern` `count` times
     * @param {String} pattern
     * @param {Integer} count
     * @returns {String}
     */
    repeatStr: function (pattern, count) {
        if (count < 1)
            return '';
        var result = '';
        while (count > 1) {
            if (count & 1)
                result += pattern;
            count >>= 1, pattern += pattern;
        }
        return result + pattern;
    },
    /**
     * Clears stdout
     * @returns {undefined}
     */
    clearStdOut: function () {
        process.stdout.write(windows ? this.repeatStr("\r\n", process.stdout.getWindowSize()[1]) : "\x1B[2J") + "\x1B[0f";
    }
};