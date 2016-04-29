var api;

function newMessage(data) {
    handleMessage(data, false);
}
function newWhisper(data) {
    handleMessage(data, true);
}

function parsePermLevel(str) {
    lvl = 0;
    lvls = str.split(',').filter(function (v, i, s) {
        return s.indexOf(v) === i;
    });
    for (var i = 0; i < lvls.length; ++i) {
        switch (lvls[i]) {
            case "user":
            case "users":
                lvl += api.permissions.PERMISSION_USER;
                break;
            case "mod":
            case "mods":
                lvl += api.permissions.PERMISSION_MOD;
                break;
            case "admin":
            case "admins":
                lvl += api.permissions.PERMISSION_ADMIN;
                break;
            case "padmin":
            case "padmins":
            case "ptvadmin":
            case "ptvadmins":
                lvl += api.permissions.PERMISSION_PTVADMIN;
                break;
        }
    }
    return lvl;
}

function handleMessage(data, whisper) {
    if (data.msg.toLowerCase().startsWith("!")) {
        var pars = data.msg.split(' ');
        var cmd = pars[0].toLowerCase();
        if (cmd === '!perm') {
            if (api.permissions_manager.userHasPermission(data, "cmd.perm") || api.permissions_manager.isOwner(data)) {
                if (pars.length === 4) {
                    switch (pars[2]) {
                        case 'add':
                            api.permissions_manager.addPermissionLevel(data.channel, pars[1], parsePermLevel(pars[3]));
                            sendMessage("Added " + pars[3] + " to " + pars[1], whisper ? data.username : undefined, data.channel);
                            break;
                        case 'del':
                        case 'rem':
                        case 'delete':
                        case 'remove':
                            api.permissions_manager.removePermissionLevel(data.channel, pars[1], parsePermLevel(pars[3]));
                            sendMessage("Removed " + pars[3] + " from " + pars[1], whisper ? data.username : undefined, data.channel);
                            break;
                        case 'whitelist':
                            pars[3].split(',').forEach(function (un) {
                                api.permissions_manager.whitelistUser(data.channel, pars[1], un);
                            });
                            sendMessage("Whitelisted " + pars[3] + " for " + pars[1], whisper ? data.username : undefined, data.channel);
                            break;
                        case 'unwhitelist':
                            pars[3].split(',').forEach(function (un) {
                                api.permissions_manager.unwhitelistUser(data.channel, pars[1], un);
                            });
                            sendMessage("Unwhitelisted " + pars[3] + " for " + pars[1], whisper ? data.username : undefined, data.channel);
                            break;
                        case 'blacklist':
                            pars[3].split(',').forEach(function (un) {
                                api.permissions_manager.blacklistUser(data.channel, pars[1], un);
                            });
                            sendMessage("Blacklisted " + pars[3] + " for " + pars[1], whisper ? data.username : undefined, data.channel);
                            break;
                        case 'unblacklist':
                            pars[3].split(',').forEach(function (un) {
                                api.permissions_manager.unblacklistUser(data.channel, pars[1], un);
                            });
                            sendMessage("Unblacklisted " + pars[3] + " for " + pars[1], whisper ? data.username : undefined, data.channel);
                            break;
                    }
                } else {
                    sendMessage("Usage: !perm <permId> <add|del> <permLevel>  |  !perm <permId> <(un)whitelist|(un)blacklist> <username>  ", data.username, data.channel);
                }
            } else {
                sendMessage("Sorry, you don't have permission to use this command.", data.username, data.channel);
            }
        }
    }
}

function sendMessage(txt, whisperUser, channel) {
    if (typeof whisperUser !== 'undefined') {
        api.Messages.whisper(whisperUser, txt, channel);
    } else {
        api.Messages.send(txt, channel);
    }
}

function servePage(req, res) {
    var path = req.url.split('/');
    if (path[1].toLowerCase() === "permissions") {
        if (path.length > 2 && path[2] !== '') {

            var permissions = api.permissions_manager.getChannelPermissions(path[2]).permissions;
            var permissionList = [];

            for (var perm in permissions) {
                var p = permissions[perm];
                permissionList.push({
                    permissionId: p.id,
                    allowedRoles: (((p.level & api.permissions.PERMISSION_USER) ? "Users, " : "") +
                            ((p.level & api.permissions.PERMISSION_ADMIN) ? "Admins, " : "") +
                            ((p.level & api.permissions.PERMISSION_MOD) ? "Mods, " : "") +
                            ((p.level & api.permissions.PERMISSION_PTVADMIN) ? "PTVAdmins, " : "")).replace(/, $/, ""),
                    whitelist: p.whitelist.join(", "),
                    blacklist: p.blacklist.join(", ")

                });
            }

            permissionList.sort(function (a, b) {
                return a.permissionId.localeCompare(b.permissionId);
            });

            api.jade.renderFile(process.cwd() + '/views/list.jade', {listHeader: ["PermissionId", "Allowed Roles", "Whitelist", "Blacklist"], list: permissionList, page: {title: path[2] + "'s Channel Permissions", subheader: path[2] + "'s Channel Permissions", breadcrumb: [["/", "Home"], ["/permissions", "Permissions"], ["/" + path[2], path[2]]]}}, function (err, html) {
                res.write(html);
            });
        } else {
            var channels = api.permissions_manager.getAllPermissions().map(function (p) { return { channel: p.channel }; });

            api.jade.renderFile(process.cwd() + '/views/channels.jade', {url: '/permissions/', channels: channels, page: {title: "Permissions", breadcrumb: [["/", "Home"], ["/permissions", "Permissions"]]}}, function (err, html) {
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
        api.Events.on("userMsg", newMessage);
        api.Events.on("whisper", newWhisper);
        api.Events.on("http", servePage);
    },
    stop: function () {
        api.Events.removeListener("userMsg", newMessage);
        api.Events.removeListener("whisper", newWhisper);
        api.Events.removeListener("http", servePage);
    }
}