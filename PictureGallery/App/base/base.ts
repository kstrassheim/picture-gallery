export class Controller {

    public changeLoadingText(text) {
        $(".loading-message").html(text+"%");
    }

    public showLoading() {
        this.changeLoadingText("Loading");
        $(".loading").show();
    }

    public hideLoading() {
        $(".loading").hide();
    }

     // Copy all properties and methods to the $scope
    public copyClassToScope($scope, type, instance) {
        var varNames = Object.getOwnPropertyNames(instance);
        var funcNames = Object.getOwnPropertyNames(type.prototype);
        for (var i in varNames) if (varNames[i] != "scope") $scope[varNames[i]] = instance[varNames[i]];
        for (var i in funcNames) if (funcNames[i] != "constructor" && funcNames[i] != "copyClassToScope") $scope[funcNames[i]] = type.prototype[funcNames[i]];
    }
}