import signalr = require("App/base/signalrhub");

export class AsyncImagesSvc {

    public url = '/api/AsyncImages';
    public hubName = 'notification';

    private hub: signalr.SignalRHub;

    private prepareData(type: string, sguid: string, hubClientId: string, paramField: string, param, addedGuid?):any {
        if (type == "POST" || type == "PUT" || type == "DELETE") {
            var ret = { subscriptionId: sguid, hubClientId: hubClientId };
            if (paramField) ret[paramField] = param;
            if (addedGuid) ret["addedGuid"] = addedGuid;
            return JSON.stringify(ret);
        }
        else {
            var str = "subscriptionId=" + sguid + "&hubClientId=" + this.hub.clientId;
            if (paramField) str += "&" + paramField + "=" + JSON.stringify(param);
            return <any>str;
        }
    }

    public runAsyncRestCall(type, paramField: string, param, addedGuid?): JQueryPromise<any> {
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
                if (addedGuid) this.hub.addedUnsubscribe(addedGuid);
                def.resolve(data);
            }
            function fail(err) {
                this.hub.unsubscribe(sguid);
                if (addedGuid) this.hub.addedUnsubscribe(addedGuid);
                def.reject(err);
            }
        }
        function fail(err) { def.reject(err); }
        this.hub.onready.done(ready.bind(this)).fail(fail.bind(this));
        return def.promise();
    }

    public getList() {
        return this.runAsyncRestCall("GET", "id", 0);
    }

    public getById(id) {
        return this.runAsyncRestCall("GET", "id", id);
    }

    public insert(items: any[], replaceIdsFunc?: Function) {
        // subscribe for added callback
        var addedGuid = this.hub.addedSubscribe(replaceIdsFunc ? replaceIdsFunc : function () { });
        // force realtime client id to be always provided at insert or Rest call will fail because of parameters
        return this.runAsyncRestCall("POST", "item", items,  addedGuid);
    }

    public update(item) {
        return this.runAsyncRestCall("PUT", "item", item);
    }

    public deleteItem(id) {
        return this.runAsyncRestCall("DELETE", "item", id);
    }

    // hub function
    public updateRender(render) {
        this.hub.hub.server.updateRender(render.Id, render.ZIndex, render.Width, render.Top, render.Left);
    }

    public deleteViaHub(id) {
        this.hub.hub.server.deleteItem(id);
    }

    // Event receivers
    // TODO add Event abo because this is a singleton and can be on many pages
    // For this version not required
    public added: Function;
    public updated: Function;
    public deleted: Function;

    public addedCall(imageId) {
        if (this.added) this.added(imageId);
    }

    public updatedCall(Id, ZIndex, Width, Top, Left) {
        if (this.updated) this.updated(Id, ZIndex, Width, Top, Left);
    }

    public deletedCall(imageId) {
        if (this.deleted) this.deleted(imageId);
    }

    constructor() {
        this.hub = new signalr.SignalRHub(this.hubName);
        this.hub.initialize(this.addedCall.bind(this), this.updatedCall.bind(this), this.deletedCall.bind(this));
    }
} 