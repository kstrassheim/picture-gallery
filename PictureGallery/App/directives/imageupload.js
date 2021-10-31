define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ImageUpload = void 0;
    var ImageUpload = /** @class */ (function () {
        function ImageUpload() {
            this.restrict = 'EA';
            this.replace = false;
            this.template = '<span><input class="ImageUploadSelection" type="file" /><img class="ImagePreview" /></span>';
            // parameters
            this.scope = { 'image': '=' };
        }
        ImageUpload.prototype.controller = function ($scope, $element, $q) {
            $scope.text = "imageImage";
        };
        ImageUpload.prototype.link = function (scope, elem, attrs) {
            var img = $(".ImagePreview", elem)[0];
            var input = $(".ImageUploadSelection", elem);
            input.change(uploadFile);
            // add event listener on image argument
            scope.$watch('image', updatePreview);
            updatePreview();
            function updatePreview() {
                if (scope.image && scope.image.FileInfo && scope.image.Data)
                    img.src = scope.image.FileInfo + "," + scope.image.Data;
            }
            function uploadFile() {
                var input = $(".ImageUploadSelection", elem)[0];
                var file = input.files[0];
                var fileReader = new FileReader();
                fileReader.onload = receivedText.bind(this);
                //fr.readAsText(file);
                fileReader.readAsDataURL(file);
                function receivedText() {
                    var splitted = fileReader.result.split(',');
                    if (splitted.length > 1 && scope.image) {
                        scope.$apply(function () {
                            scope.image.FileInfo = splitted[0];
                            scope.image.Data = splitted[1];
                            scope.image.FileName = file.name.split('.')[0];
                            scope.image.FileExtension = file.name.split('.')[1];
                            updatePreview();
                        });
                    }
                }
            }
        };
        return ImageUpload;
    }());
    exports.ImageUpload = ImageUpload;
});
//# sourceMappingURL=imageupload.js.map