define(["require", "exports"], function(require, exports) {
    var ImagesSvc = (function () {
        function ImagesSvc() {
            this.url = '/api/Images';
        }
        ImagesSvc.prototype.runRESTCall = function (type, data, id) {
            var def = $.Deferred();
            $.ajax({
                type: type,
                contentType: "application/json; charset=utf-8",
                headers: { 'X-HTTP-Method-Override': type },
                url: this.url + (id ? "/" + id : ""),
                data: JSON.stringify(data),
                success: function (data) {
                    def.resolve(data);
                },
                error: function (err) {
                    def.reject(err);
                },
                dataType: "json"
            });
            return def.promise();
        };

        ImagesSvc.prototype.getList = function () {
            return this.runRESTCall("GET");
        };

        ImagesSvc.prototype.getById = function (id) {
            return this.runRESTCall("GET", null, id);
        };

        ImagesSvc.prototype.add = function (item) {
            return this.runRESTCall("POST", item);
        };

        ImagesSvc.prototype.update = function (item) {
            return this.runRESTCall("PUT", item);
        };

        ImagesSvc.prototype.deleteItem = function (id) {
            return this.runRESTCall("DELETE", null, id);
        };
        return ImagesSvc;
    })();
    exports.ImagesSvc = ImagesSvc;
});
//# sourceMappingURL=images.js.map
