var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
define(["require", "exports", "App/base/base"], function (require, exports, base) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.EditImage = void 0;
    var EditImage = /** @class */ (function (_super) {
        __extends(EditImage, _super);
        function EditImage($scope, $location, $routeParams, $q, AsyncImagesSvc) {
            var _this = _super.call(this) || this;
            _this.listUrl = "/images";
            _this.svc = AsyncImagesSvc;
            _this.location = $location;
            _this.copyClassToScope($scope, EditImage, _this);
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
            _this.svc.getById(parseInt($routeParams.id)).then(then.bind(_this)).fail(fail.bind(_this));
            return _this;
        }
        EditImage.prototype.Save = function () {
            function then() {
                // very strange
                // this is here the scope 
                // location has to be changed in Apply statement
                function changeLoc() { this.$parent.location.url(this.$parent.listUrl); }
                this.$apply(changeLoc.bind(this));
            }
            function fail(err) { }
            return this.svc.update(this.Item).then(then.bind(this));
        };
        EditImage.prototype.Cancel = function () {
            this.Item = null;
            this.location.url(this.listUrl);
        };
        return EditImage;
    }(base.Controller));
    exports.EditImage = EditImage;
});
//# sourceMappingURL=editImage.js.map