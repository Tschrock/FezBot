
var fs = require("fs");

var api;

function servePage(req, res) {
    var path = req.url.split('/');
    if (path.length === 2 && path[1].toLowerCase() === 'favicon.ico') {
        try {
            fBuffer = fs.readFileSync(process.cwd() + '/favicon.ico');
            res.writeHead(200, {'Content-Type': 'image/x-icon'});
            res.write(fBuffer);
        } catch (e) {
            if (e.code !== 'ENOENT') throw e;
            api.jade.renderFile(process.cwd() + '/views/404.jade', null, function (err, html) {
                res.writeHead(404);
                res.write(html);
            });
        }
    }
}

module.exports = {
    meta_inf: {
        name: "HTTP Favicon",
        version: "1.0.1",
        description: "Provides a favicon for the server.",
        author: "Tschrock (CyberPon3)"
    },
    load: function (_api) {
        api = _api;
    },
    start: function () {
        api.events.on("http", servePage);
    },
    stop: function () {
        api.events.removeListener("http", servePage);
    }
}
