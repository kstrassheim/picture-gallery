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
    exports.AddImage = void 0;
    function randColorFunc(m, s, c) { return (c ? arguments.callee(m, s, c - 1) : '#') + s[m.floor(m.random() * s.length)]; }
    ;
    var AddImage = /** @class */ (function (_super) {
        __extends(AddImage, _super);
        function AddImage($scope, $location, $q, AsyncImagesSvc) {
            var _this = _super.call(this) || this;
            _this.listUrl = "/images";
            _this.getRandomColor = randColorFunc(Math, '0123456789ABCDEF', 5);
            _this.Item = { Id: -1, Title: "", Color: _this.getRandomColor, File: { Data: [], FileInfo: "" }, Render: { Id: -1, Left: 5, Top: 5, Width: 200, ZIndex: 5000 } };
            // public properties
            _this.scope = $scope;
            _this.svc = AsyncImagesSvc;
            _this.location = $location;
            // Always copy everything you use in methods to scope
            _this.copyClassToScope($scope, AddImage, _this);
            return _this;
        }
        AddImage.prototype.Save = function () {
            function then(data) {
                // very strange
                // this is here the scope 
                // location has to be changed in Apply statement
                function changeLoc() { this.$parent.location.url(this.$parent.listUrl); }
                this.$apply(changeLoc.bind(this));
            }
            function fail(err) { console.log(err); }
            // If no title provided set it to FileName
            if (!this.Item.Title || this.Item.Title == "")
                this.Item.Title = this.Item.Image.FileName;
            return this.svc.insert([this.Item]).then(then.bind(this)).fail(fail.bind(this));
        };
        AddImage.prototype.Cancel = function () {
            this.Item = null;
            this.location.url(this.listUrl);
        };
        return AddImage;
    }(base.Controller));
    exports.AddImage = AddImage;
});
//# sourceMappingURL=addImage.js.map