export class ImageUpload {
    public restrict: string = 'EA';
    public replace: boolean = false;
    public file: any; 
    public template: string = '<span><input class="ImageUploadSelection" type="file" /><img class="ImagePreview" /></span>';
    // parameters
    public scope = { 'image': '=' };

    public controller($scope, $element, $q) {
        $scope.text = "imageImage";
    }

    public link(scope, elem, attrs) {
        var img: any = $(".ImagePreview", elem)[0];
        var input: JQuery = $(".ImageUploadSelection", elem);
        input.change(uploadFile);
        // add event listener on image argument
        scope.$watch('image', updatePreview);
        updatePreview();
        function updatePreview() {
            if (scope.image && scope.image.FileInfo && scope.image.Data)
            img.src = scope.image.FileInfo + "," + scope.image.Data;
        }

        function uploadFile() {
            var input: any = $(".ImageUploadSelection", elem)[0];
            var file: any = input.files[0];
            var fileReader: FileReader = new FileReader();
            fileReader.onload = receivedText.bind(this);
            //fr.readAsText(file);
            fileReader.readAsDataURL(file);

            function receivedText() {
                var splitted = (<any>fileReader.result).split(',')
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
    }
}