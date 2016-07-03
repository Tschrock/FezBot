var api;

function parsePermLevel(str) {
    lvl = 0;
    lvls = str.split(',').filter(function (v, i, s) {
        return s.indexOf(v) === i;
    });
    for (var i = 0; i < lvls.length; ++i) {
        switch (lvls[i]) {
            case "user":
            case "users":
                lvl += PermissionLevels.PERMISSION_USER;
                break;
            case "mod":
            case "mods":
                lvl += PermissionLevels.PERMISSION_MOD;
                break;
            case "admin":
            case "admins":
                lvl += PermissionLevels.PERMISSION_ADMIN;
                break;
            case "padmin":
            case "padmins":
            case "ptvadmin":
            case "ptvadmins":
                lvl += PermissionLevels.PERMISSION_PTVADMIN;
                break;
        }
    }
    return lvl;
}

var PermissionLevels = require('../modules/permissionlevels');
var MessageTypes = require('../modules/messagetypes');

function handleCommand(event) {
    var command = event.data;
    if (command.command === 'perm' && event.claim()) {
        if (!command.sender.hasPermission("cmd.perm")) {
            command.replyPrivate("Sorry, you don't have permission to use this command.");
        } else if (command.messageType === MessageTypes.PRIVATE && !command.channel.checkTimeout("cmd.perm")) {
            command.replyPrivate(command.channel.getTimeoutMessage("cmd.perm"));
        } else {

            var pars = command.parameters;

            if (pars.length === 3) {
                switch (pars[1]) {
                    case 'add':
                        var p = command.channel.permissions.Get(pars[0]);
                        p.level = p.level | parsePermLevel(pars[2]);
                        p.save();

                        command.reply("Added " + pars[2] + " to " + pars[0]);
                        break;
                    case 'del':
                    case 'rem':
                    case 'delete':
                    case 'remove':
                        var p = command.channel.permissions.Get(pars[0]);
                        p.level = (p.level ^ parsePermLevel(pars[2])) & p.level;
                        p.save();

                        command.reply("Removed " + pars[2] + " from " + pars[0]);
                        break;
                    case 'whitelist':
                        pars[2].split(',').forEach(function (un) {
                            var p = command.channel.permissions.Get(pars[0]);
                            p.whitelist(un);
                            p.save();
                        });
                        command.reply("Whitelisted " + pars[2] + " for " + pars[0]);
                        break;
                    case 'unwhitelist':
                        pars[2].split(',').forEach(function (un) {
                            var p = command.channel.permissions.Get(pars[0]);
                            p.unwhitelist(un);
                            p.save();
                        });
                        command.reply("Unwhitelisted " + pars[2] + " for " + pars[0]);
                        break;
                    case 'blacklist':
                        pars[2].split(',').forEach(function (un) {
                            var p = command.channel.permissions.Get(pars[0]);
                            p.blacklist(un);
                            p.save();
                        });
                        command.reply("Blacklisted " + pars[2] + " for " + pars[0]);
                        break;
                    case 'unblacklist':
                        pars[2].split(',').forEach(function (un) {
                            var p = command.channel.permissions.Get(pars[0]);
                            p.unblacklist(un);
                            p.save();
                        });
                        command.reply("Unblacklisted " + pars[2] + " for " + pars[0]);
                        break;
                }
            } else {
                command.reply("Usage: !perm <permId> <add|del> <permLevel>  |  !perm <permId> <(un)whitelist|(un)blacklist> <username>");
            }
        }
    }
}

var PERMISSIONS_STORAGE_PREFIX = "permissions_";
var permRegex = new RegExp(PERMISSIONS_STORAGE_PREFIX);
var GetAllStores = function () {
    return api.mainAppStorage.valuesWithKeyMatch(permRegex);
};

function servePage(req, res) {
    var path = req.url.split('/');
    if (path[1].toLowerCase() === "permissions") {
        if (path.length > 2 && path[2] !== '') {


            var stores = GetAllStores();
            var channelStore = false;

            for (var t in stores) {
                if (stores[t].channel.toLowerCase() === path[2].toLowerCase()) {
                    channelStore = stores[t];
                }
            }

            if (channelStore) {
                var permissionList = [];
                var channel = api.channels.GetByName(path[2]);
                
                for (var perm in channelStore.permissions) {
                    var p = channelStore.permissions[perm];
                    permissionList.push({
                        permissionId: p.id,
                        allowedRoles: (((p.level & PermissionLevels.PERMISSION_USER) ? "Users, " : "") +
                                ((p.level & PermissionLevels.PERMISSION_ADMIN) ? "Admins, " : "") +
                                ((p.level & PermissionLevels.PERMISSION_MOD) ? "Mods, " : "") +
                                ((p.level & PermissionLevels.PERMISSION_PTVADMIN) ? "PTVAdmins, " : "")).replace(/, $/, ""),
                        whitelist: Object.getOwnPropertyNames(p.whitelist).join(", "),
                        blacklist: Object.getOwnPropertyNames(p.blacklist).join(", ")

                    });
                }

                permissionList.sort(function (a, b) {
                    return a.permissionId.localeCompare(b.permissionId);
                });

                api.jade.renderFile(process.cwd() + '/views/list.jade', {listHeader: ["PermissionId", "Allowed Roles", "Whitelist", "Blacklist"], list: permissionList, page: {title: path[2] + "'s Channel Permissions", subheader: path[2] + "'s Channel Permissions", breadcrumb: [["/", "Home"], ["/permissions", "Permissions"], ["/" + path[2], path[2]]]}}, function (err, html) {
                    res.write(html);
                });
            } else {
                api.jade.renderFile(process.cwd() + '/views/404.jade', null, function (err, html) {
                    res.write(html);
                });
            }
        } else {
            var stores = GetAllStores();

            api.jade.renderFile(process.cwd() + '/views/channels.jade', {url: '/permissions/', channels: stores, page: {title: "Permissions", breadcrumb: [["/", "Home"], ["/permissions", "Permissions"]]}}, function (err, html) {
                res.write(html);
            });
        }
    } else {
        if (req.collection === null)
            req.collection = [];
        req.collection.push(["Permissions", "/permissions/", "View permissions for the bot."]);
    }
}

module.exports = {
    meta_inf: {
        name: "Permissions Manager",
        version: "1.0.0",
        description: "Manages Permissions",
        author: "Tschrock (CyberPon3)",
        pluginurl: "/permissions",
        commandhelp: [
            {command: "!perm", usage: "!perm <permissionId> <add | del> {users,mods,admins,padmins}", description: "Add or remove a Rank from a permission.", permission: "cmd.perm"},
            {command: "!perm", usage: "!perm <permissionId> <whitelist | unwhitelist | blacklist | unblacklist> <username>", description: "Add/Remove a person from the white/blacklist of a permission.", permission: "cmd.perm"}
        ]
    },
    load: function (_api) {
        api = _api;
    },
    start: function () {
        api.events.on("chatCommand", handleCommand);
        api.events.on("consoleCommand", handleCommand);
        api.events.on("http", servePage);
    },
    stop: function () {
        api.events.removeListener("chatCommand", handleCommand);
        api.events.removeListener("consoleCommand", handleCommand);
        api.events.removeListener("http", servePage);
    }
}