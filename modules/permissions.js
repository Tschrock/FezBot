module.exports = function (storage) {
    var exports = {
        PERMISSION_USER: 1,
        PERMISSION_ADMIN: 2,
        PERMISSION_MOD: 4,
        PERMISSION_PTVADMIN: 8,
        PERMISSION_NONE: 0,
        PERMISSION_ALL: -1
    };
    
    return exports;
};