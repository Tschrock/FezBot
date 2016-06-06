'use strict';

var fs = require("fs");
var reload = require("require-reload");
var node_persist = require("node-persist");

var PluginLoader = function (pluginDir, storage) {
    this.pluginDir = pluginDir;
    this.storage = storage;
};

module.exports = PluginLoader;