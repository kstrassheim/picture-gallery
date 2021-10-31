define(["require", "exports", "App/base/signalrhub"], function (require, exports, signalr) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.AsyncImagesSvc = void 0;
    var AsyncImagesSvc = /** @class */ (function () {
        function AsyncImagesSvc() {
            this.url = '/api/AsyncImages';
            this.hubName = 'notification';
            this.hub = new signalr.SignalRHub(this.hubName);
            this.hub.initialize(this.addedCall.bind(this), this.updatedCall.bind(this), this.deletedCall.bind(this));
        }
        AsyncImagesSvc.prototype.prepareData = function (type, sguid, hubClientId, paramField, param, addedGuid) {
            if (type == "POST" || type == "PUT" || type == "DELETE") {
                var ret = { subscriptionId: sguid, hubClientId: hubClientId };
                if (paramField)
                    ret[paramField] = param;
                if (addedGuid)
                    ret["addedGuid"] = addedGuid;
                return JSON.stringify(ret);
            }
            else {
                var str = "subscriptionId=" + sguid + "&hubClientId=" + this.hub.clientId;
                if (paramField)
                    str += "&" + paramField + "=" + JSON.stringify(param);
                return str;
            }
        };
        AsyncImagesSvc.prototype.runAsyncRestCall = function (type, paramField, param, addedGuid) {
            var def = $.Deferred();
            function ready() {
                var sguid = this.hub.subscribe(def.notify);
                var data = this.prepareData(type, sguid, this.hub.clientId, paramField, param, addedGuid);
                $.ajax({
                    type: type,
                    contentType: "application/json; charset=utf-8",
                    headers: { 'X-HTTP-Method-Override': type },
                    url: this.url,
                    data: data,
                    success: success.bind(this),
                    error: fail.bind(this),
                    dataType: "json"
                });
                function success(data) {
                    this.hub.unsubscribe(sguid);
                    if (addedGuid)
                        this.hub.addedUnsubscribe(addedGuid);
                    def.resolve(data);
                }
                function fail(err) {
                    this.hub.unsubscribe(sguid);
                    if (addedGuid)
                        this.hub.addedUnsubscribe(addedGuid);
                    def.reject(err);
                }
            }
            function fail(err) { def.reject(err); }
            this.hub.onready.done(ready.bind(this)).fail(fail.bind(this));
            return def.promise();
        };
        AsyncImagesSvc.prototype.getList = function () {
            return this.runAsyncRestCall("GET", "id", 0);
        };
        AsyncImagesSvc.prototype.getById = function (id) {
            return this.runAsyncRestCall("GET", "id", id);
        };
        AsyncImagesSvc.prototype.insert = function (items, replaceIdsFunc) {
            // subscribe for added callback
            var addedGuid = this.hub.addedSubscribe(replaceIdsFunc ? replaceIdsFunc : function () { });
            // force realtime client id to be always provided at insert or Rest call will fail because of parameters
            return this.runAsyncRestCall("POST", "item", items, addedGuid);
        };
        AsyncImagesSvc.prototype.update = function (item) {
            return this.runAsyncRestCall("PUT", "item", item);
        };
        AsyncImagesSvc.prototype.deleteItem = function (id) {
            return this.runAsyncRestCall("DELETE", "item", id);
        };
        // hub function
        AsyncImagesSvc.prototype.updateRender = function (render) {
            this.hub.hub.server.updateRender(render.Id, render.ZIndex, render.Width, render.Top, render.Left);
        };
        AsyncImagesSvc.prototype.deleteViaHub = function (id) {
            this.hub.hub.server.deleteItem(id);
        };
        AsyncImagesSvc.prototype.addedCall = function (imageId) {
            if (this.added)
                this.added(imageId);
        };
        AsyncImagesSvc.prototype.updatedCall = function (Id, ZIndex, Width, Top, Left) {
            if (this.updated)
                this.updated(Id, ZIndex, Width, Top, Left);
        };
        AsyncImagesSvc.prototype.deletedCall = function (imageId) {
            if (this.deleted)
                this.deleted(imageId);
        };
        return AsyncImagesSvc;
    }());
    exports.AsyncImagesSvc = AsyncImagesSvc;
});
//# sourceMappingURL=asyncimages.js.map