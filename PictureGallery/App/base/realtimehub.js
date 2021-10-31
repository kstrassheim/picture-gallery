var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", "App/base/signalrhub"], function(require, exports, hub) {
    var RealTimeHub = (function (_super) {
        __extends(RealTimeHub, _super);
        function RealTimeHub(hubName, added, updated, deleted, replaceIds) {
            _super.call(this, hubName);
            this.added = added;
            this.updated = updated;
            this.deleted = deleted, this.replaceIds = replaceIds;
            this.initialize();
        }
        RealTimeHub.prototype.update = function (render) {
            this.hub.server.update(render);
        };

        RealTimeHub.prototype.deleteItem = function (imageId) {
            this.hub.server.deleteItem(imageId);
        };

        RealTimeHub.prototype.addOtherCallMethodsOnStart = function (hub) {
            hub.client.added = this.added;
            hub.client.updated = this.updated;
            hub.client.deleted = this.deleted;
            //this.hub.client.replaceIds = this.replaceIds;
        };
        return RealTimeHub;
    })(hub.SignalRHub);
    exports.RealTimeHub = RealTimeHub;
});
//# sourceMappingURL=realtimehub.js.map
