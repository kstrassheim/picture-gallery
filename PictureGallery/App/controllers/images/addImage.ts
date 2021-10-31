import base = require("App/base/base");
import svc = require("App/services/asyncimages");

function randColorFunc(m, s, c) { return (c ? arguments.callee(m, s, c - 1) : '#') + s[m.floor(m.random() * s.length)] };

export class AddImage extends base.Controller  {
    private scope;
    private listUrl = "/images";
    private svc: svc.AsyncImagesSvc;
    private location;
    public getRandomColor = randColorFunc(Math, '0123456789ABCDEF', 5)

    public Item: any = { Id: -1, Title: "", Color:this.getRandomColor, File: { Data: [], FileInfo: "" }, Render: { Id: -1, Left: 5, Top: 5, Width: 200, ZIndex: 5000 } };

    public Save() {
        function then(data) {
            // very strange
            // this is here the scope 
            // location has to be changed in Apply statement
            function changeLoc() { this.$parent.location.url(this.$parent.listUrl); }
            this.$apply(changeLoc.bind(this));
        }
        function fail(err) { console.log(err);  }
        // If no title provided set it to FileName
        if (!this.Item.Title || this.Item.Title == "") this.Item.Title = this.Item.Image.FileName;
        return this.svc.insert([this.Item]).then(then.bind(this)).fail(fail.bind(this));
    }

    public Cancel() {
        this.Item = null;
        this.location.url(this.listUrl);
    }

    constructor($scope, $location, $q, AsyncImagesSvc: svc.AsyncImagesSvc) {
        super();
        // public properties
        this.scope = $scope;
        this.svc = AsyncImagesSvc;
        this.location = $location;

        // Always copy everything you use in methods to scope
        this.copyClassToScope($scope, AddImage, this);
    }
} 