import base = require("App/base/base");
import svc = require("App/services/asyncimages");

export class EditImage extends base.Controller {
    private listUrl = "/images";
    private svc: svc.AsyncImagesSvc;
    private location;
    public Item: any;

    public Save() {
        function then() {
            // very strange
            // this is here the scope 
            // location has to be changed in Apply statement
            function changeLoc() { this.$parent.location.url(this.$parent.listUrl); }
            this.$apply(changeLoc.bind(this));
        }
        function fail(err) { }
        return this.svc.update(this.Item).then(then.bind(this));
    }

    public Cancel() {
        this.Item = null;
        this.location.url(this.listUrl);
    }

    constructor($scope, $location, $routeParams, $q, AsyncImagesSvc: svc.AsyncImagesSvc) {
        super();
        this.svc = AsyncImagesSvc;
        this.location = $location;
        this.copyClassToScope($scope, EditImage, this);

        function then(data) {
            function update() {
                $scope.Item = this.Item = data[0];
                $scope.Item.File = this.Item.File;
            }
            $scope.$apply(update.bind(this));
        }
        function fail(err) {
            var i = err;
        }
        this.svc.getById(parseInt($routeParams.id)).then(then.bind(this)).fail(fail.bind(this));
    }
}  