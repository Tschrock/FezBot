function NiceList() {
    this.items = {};
}
NiceList.prototype.getId = function (val) {
    return val.id || false;
};
NiceList.prototype.Get = function (id) {
    return typeof this.items['$' + id] !== 'undefined' ? this.items['$' + id] : false;
};
NiceList.prototype.Set = function (id, value) {
    this.items['$' + id] = value;
};
NiceList.prototype.Add = function (value) {
    var id;
    if ((id = this.getId(value)) === false) {
        id = this.Count();
    }
    this.items['$' + id] = value;
    return id;
};
NiceList.prototype.ForEach = function (callback) {
    for (var id in this.items) {
        callback.call(null, this.items[id], id.slice(1));
    }
};
NiceList.prototype.Where = function (callback) {
    var rtn = new NiceList();
    for (var id in this.items) {
        if (callback.call(null, this.items[id], id.slice(1)))
            rtn.Set(id.slice(1), this.items[id]);
    }
    return rtn;
};
NiceList.prototype.Select = function (callback) {
    var rtn = new NiceList();
    for (var id in this.items) {
        rtn.Set(id.slice(1), callback.call(null, this.items[id], id.slice(1)));
    }
    return rtn;
};
NiceList.prototype.Any = function (callback) {
    for (var id in this.items) {
        if (!callback || callback.call(null, this.items[id], id.slice(1)))
            return true;
    }
    return false;
};
NiceList.prototype.Count = function () {
    return Object.keys(this.items).length;
};
NiceList.prototype.First = function () {
    for (var id in this.items) {
        return this.items[id];
    }
};
module.exports = NiceList;