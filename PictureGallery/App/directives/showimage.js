define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ShowImage = void 0;
    var ShowImage = /** @class */ (function () {
        function ShowImage() {
            this.restrict = 'A';
            this.replace = false;
            this.template = '<img class="showImage" style="width:100%" />';
            this.scope = { image: "=image" };
        }
        ShowImage.prototype.controller = function ($scope, $element, $q) { };
        ShowImage.prototype.link = function (scope, elem, attrs) {
            var img = $(".showImage", elem)[0];
            scope.$watch('image', updateImage);
            function updateImage() {
                if (scope.image && scope.image.FileInfo && scope.image.Data)
                    img.src = scope.image.FileInfo + "," + scope.image.Data;
            }
        };
        return ShowImage;
    }());
    exports.ShowImage = ShowImage;
});
//# sourceMappingURL=showimage.js.map