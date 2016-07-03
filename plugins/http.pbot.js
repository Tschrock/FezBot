var api;

var EventTypes = require('../modules/eventtypes');
var http = require('http');
var jade = require('jade');
var cliopts = {};
var server = false;

function initServer(url) {
    if(server) return;
    

    var config = require("../config.json") || {};
    var httpConfig = {
        url: cliopts.url || ((config.http) ? config.http.url : false) || "localhost",
        port: cliopts.port || ((config.http) ? config.http.port : false) || 8080
    };
    
    var httpConfig = {
        url: "localhost",
        port: 8080
    };

    if (httpConfig.url.indexOf("://") === -1)
        httpConfig.url = "http://" + httpConfig.url;

    if (typeof config.http.enabled === 'undefined' || config.http.enabled) {
        console.log(api.url,  httpConfig);
        server = http.createServer(function (req, res) {
            res.writeHead(200);
            try {
                api.events.emit("http", req, res);
            } catch (e) {
                console.log(e);
                console.log(e.stack);
            }

            var path = req.url.split('/');
            if (path.length < 3 && path[1] == '') {
                api.jade.renderFile(process.cwd() + '/views/index.jade', {
                    urls: req.collection.sort(function (a, b) {
                        if (a[0] < b[0])
                            return -1;
                        if (a[0] > b[0])
                            return 1;
                        return 0;
                    })
                }, function (err, html) {
                    res.write(html);
                });
            }
            res.end();
        });

        server.listen(httpConfig.port, function (error) {
            if (error) {
                console.error("Unable to listen on port", httpConfig.port, error);
                return;
            } else {
                api.url = httpConfig;
                console.log("Enter " + httpConfig.url + ":" + httpConfig.port + " in a browser to access web functions.");
            }
        });
    }
}

function closeServer() {
    server.close();
    server = false;
}

function cliOpts(event) {
    (cliopts = event.data).option("-p, --port <Port>", "Set a custom port")
            .option("-u, --url <URL>", "Set a custom URL");
}

module.exports = {
    meta_inf: {
        name: "HTTP Server",
        version: "1.0.0",
        description: "Runs a web interface for the bot.",
        author: "Tschrock (CyberPon3)"
    },
    load: function (_api) {
        api = _api;
        api.jade = jade;
        api.events.on(EventTypes.CLIOPTIONS, cliOpts);
    },
    start: function () {
        initServer();
    },
    stop: function () {
        closeServer();
        api.events.removeListener(EventTypes.CLIOPTIONS, cliOpts);
    }
};