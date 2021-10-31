export class ShowImage {
    public restrict: string = 'A';
    public replace: boolean = false;
    public template: string = '<img class="showImage" style="width:100%" />';
    public scope = { image: "=image" }
    public controller($scope, $element, $q) {  }

    public link(scope, elem, attrs) {
        var img:any = $(".showImage", elem)[0];
        scope.$watch('image', updateImage);
        function updateImage() {
            if (scope.image && scope.image.FileInfo && scope.image.Data)
                img.src = scope.image.FileInfo + "," + scope.image.Data;
        }
    }
}


