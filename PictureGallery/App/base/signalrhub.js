define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SignalRHub = void 0;
    // a class to manage the real time send and receive methods
    var SignalRHub = /** @class */ (function () {
        function SignalRHub(hubName) {
            this.subscribers = new Object();
            this.addedSubscribers = new Object();
            var hub = $.connection[hubName];
            this.hub = hub;
        }
        SignalRHub.prototype.subscribe = function (func) {
            var guid = this.guid();
            this.subscribers[guid] = func;
            return guid;
        };
        SignalRHub.prototype.unsubscribe = function (guid) {
            this.subscribers[guid] = null;
        };
        SignalRHub.prototype.addedSubscribe = function (func) {
            var guid = this.guid();
            this.addedSubscribers[guid] = func;
            return guid;
        };
        SignalRHub.prototype.addedUnsubscribe = function (guid) {
            this.addedSubscribers[guid] = null;
        };
        // Events called from server
        SignalRHub.prototype.receive = function (guid, data) {
            if (this.subscribers[guid])
                this.subscribers[guid](data);
        };
        SignalRHub.prototype.addedReceive = function (guid, tempId, imageId, renderId) {
            // this added event is received from 
            if (this.addedSubscribers[guid])
                this.addedSubscribers[guid](tempId, imageId, renderId);
        };
        SignalRHub.prototype.guid = function () {
            function s4() { return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1); }
            return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
        };
        SignalRHub.prototype.initialize = function (added, updated, deleted) {
            var def = $.Deferred();
            this.onready = def.promise();
            // Create a function that the hub can call to broadcast messages.
            this.hub.client.receive = this.receive.bind(this);
            this.hub.client.addedReceive = this.addedReceive.bind(this);
            // add event receivers
            this.hub.client.added = added;
            this.hub.client.updated = updated;
            this.hub.client.deleted = deleted;
            function initId() {
                this.clientId = $.connection.hub.id;
                def.resolve(this.clientId);
            }
            $.connection.hub.start().done(initId.bind(this)).fail(function (err) { def.reject(err); });
        };
        return SignalRHub;
    }());
    exports.SignalRHub = SignalRHub;
});
//# sourceMappingURL=signalrhub.js.map