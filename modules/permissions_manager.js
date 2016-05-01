module.exports = function (storage) {

    var PERMISSIONS_STORAGEKEY = "permissions_";
    var GLOBALADMINS_STORAGEKEY = "admins";

    var pl = {
        PERMISSION_USER: 1,
        PERMISSION_ADMIN: 2,
        PERMISSION_MOD: 4,
        PERMISSION_PTVADMIN: 8,
        PERMISSION_NONE: 0,
        PERMISSION_ALL: 15
    };

    var globalDefaultPermissionLevel = pl.PERMISSION_ADMIN | pl.PERMISSION_MOD;
    var permRegex = new RegExp(PERMISSIONS_STORAGEKEY);

    function ifUndef(val, undefVal) {
        return typeof val !== 'undefined' ? val : undefVal;
    }

    function createPermission(id, level, whitelist, blacklist) {
        return {
            id: id,
            level: ifUndef(level, globalDefaultPermissionLevel),
            whitelist: whitelist || [],
            blacklist: blacklist || []
        };
    }

    function modPermission(channel, permissionId, modFunction) {
        var permissionObj = this.getPermission(channel, permissionId);
        modFunction(permissionObj);
        this.savePermission(channel, permissionObj);
    }

    function addToArr(array, item) {
        if (array.indexOf(item) === -1) {
            array.push(item);
        }
        return array;
    }

    function removeFromArr(array, item) {
        var index = array.indexOf(item);
        if (index !== -1) {
            array.splice(index, 1);
        }
        return array;
    }

    var module = {};
    module.permissions = pl;
    module.getAllPermissions = function () {
        return storage.valuesWithKeyMatch(permRegex);
    };
    
    module.getChannelPermissions = function (channel) {
        return storage.getItem(PERMISSIONS_STORAGEKEY + channel.toLowerCase()) || {channel: channel, permissions: {}};
    };
    
    module.getPermission = function (channel, permissionId, defaultPermissionLevel) {
        return this.getChannelPermissions(channel).permissions[permissionId] || this.savePermission(channel, createPermission(permissionId, defaultPermissionLevel));
    };
    
    module.savePermission = function (channel, permissionObj) {
        var channelPerms = this.getChannelPermissions(channel);
        channelPerms.permissions[permissionObj.id] = permissionObj;
        storage.setItem(PERMISSIONS_STORAGEKEY + channel.toLowerCase(), channelPerms);
        return permissionObj;
    };
    
    module.deletePermission = function (channel, permissionId) {
        var channelPerms = this.getChannelPermissions(channel);
        delete channelPerms.permissions[permissionId];
        storage.setItem(PERMISSIONS_STORAGEKEY + channel.toLowerCase(), channelPerms);
    };

    module.addPermissionLevel = function (channel, permissionId, permissionLevel) {
        modPermission(channel, permissionId, function (p) {
            p.level = p.level | permissionLevel;
        });
    };
    
    module.removePermissionLevel = function (channel, permissionId, permissionLevel) {
        modPermission(channel, permissionId, function (p) {
            p.level = p.level ^ (p.level & permissionLevel);
        });
    };
    
    module.whitelistUser = function (channel, permissionId, username) {
        modPermission(channel, permissionId, function (p) {
            p.whitelist = addToArr(p.whitelist, username.toLowerCase());
        });
    };
    
    module.unwhitelistUser = function (channel, permissionId, username) {
        modPermission(channel, permissionId, function (p) {
            p.whitelist = removeFromArr(p.whitelist, username.toLowerCase());
        });
    };
    
    module.blacklistUser = function (channel, permissionId, username) {
        modPermission(channel, permissionId, function (p) {
            p.blacklist = addToArr(p.blacklist, username.toLowerCase());
        });
    };
    
    module.unblacklistUser = function (channel, permissionId, username) {
        modPermission(channel, permissionId, function (p) {
            p.blacklist = removeFromArr(p.blacklist, username.toLowerCase());
        });
    };

    module.userHasPermission = function (user, permissionId, defaultPermissionLevel) { // !onblacklist && (permLevelCheck || (onwhitelist && registered))
        var p = this.getPermission(user.channel, permissionId, defaultPermissionLevel);
        return !(p.blacklist.indexOf(user.username) !== -1) && (((p.level & this.getUserPermissionLevel(user)) !== 0) || ((p.whitelist.indexOf(user.username.toLowerCase()) !== -1) && user.registered));
    };
    
    module.getUserPermissionLevel = function (user) {
        return !(user.admin || user.mod || user.ptvadmin) | user.admin << 1 | user.mod << 2 | user.ptvadmin << 3;
    };

    module.isOwner = function (user) {
        return user.username.toLowerCase() === user.channel.toLowerCase() || this.isGlobalAdmin(user);
    };
    
    module.isGlobalAdmin = function (user) {
        return (storage.getItem(GLOBALADMINS_STORAGEKEY) || []).indexOf(user.username.toLowerCase()) > -1;
    };
    
    module.getGlobalAdmins = function () {
        return storage.getItem(GLOBALADMINS_STORAGEKEY) || [];
    };
    
    module.addGlobalAdmin = function (username) {
        storage.setItem(GLOBALADMINS_STORAGEKEY, addToArr(this.getGlobalAdmins(), username.toLowerCase()));
    };
    
    module.removeGlobalAdmin = function (username) {
        storage.setItem(GLOBALADMINS_STORAGEKEY, removeFromArr(this.getGlobalAdmins(), username.toLowerCase()));
    };

    return module;
};