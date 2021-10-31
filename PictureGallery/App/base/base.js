define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Controller = void 0;
    var Controller = /** @class */ (function () {
        function Controller() {
        }
        Controller.prototype.changeLoadingText = function (text) {
            $(".loading-message").html(text + "%");
        };
        Controller.prototype.showLoading = function () {
            this.changeLoadingText("Loading");
            $(".loading").show();
        };
        Controller.prototype.hideLoading = function () {
            $(".loading").hide();
        };
        // Copy all properties and methods to the $scope
        Controller.prototype.copyClassToScope = function ($scope, type, instance) {
            var varNames = Object.getOwnPropertyNames(instance);
            var funcNames = Object.getOwnPropertyNames(type.prototype);
            for (var i in varNames)
                if (varNames[i] != "scope")
                    $scope[varNames[i]] = instance[varNames[i]];
            for (var i in funcNames)
                if (funcNames[i] != "constructor" && funcNames[i] != "copyClassToScope")
                    $scope[funcNames[i]] = type.prototype[funcNames[i]];
        };
        return Controller;
    }());
    exports.Controller = Controller;
});
//# sourceMappingURL=base.js.map