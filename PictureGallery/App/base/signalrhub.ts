// a class to manage the real time send and receive methods
export class SignalRHub {

    public clientId: string;
    public hub: any;
    public subscribers: any = new Object();
    public addedSubscribers: any = new Object();
    public onready: any;

    public subscribe(func:Function):string {
        var guid = this.guid();
        this.subscribers[guid] = func;
        return guid;
    }

    public unsubscribe(guid:string) {
        this.subscribers[guid] = null;
    }

    public addedSubscribe(func: Function): string {
        var guid = this.guid();
        this.addedSubscribers[guid] = func;
        return guid;
    }

    public addedUnsubscribe(guid: string) {
        this.addedSubscribers[guid] = null;
    }

    // Events called from server

    public receive(guid: string, data: string) {
        if (this.subscribers[guid]) this.subscribers[guid](data);
    }

    public addedReceive(guid: string, tempId: number, imageId: number, renderId: number) {
        // this added event is received from 
        if (this.addedSubscribers[guid]) this.addedSubscribers[guid](tempId, imageId, renderId);
    }

    public guid() {
        function s4() { return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1); }
        return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
    }

    public initialize(added?:Function, updated?:Function, deleted?:Function) {
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
            this.clientId = (<any>$).connection.hub.id;
            def.resolve(this.clientId);
        }
        (<any>$).connection.hub.start().done(initId.bind(this)).fail(function (err) { def.reject(err); });
    }

    constructor(hubName: string) {
        var hub = (<any>$).connection[hubName];
        this.hub = hub;
    }
} 