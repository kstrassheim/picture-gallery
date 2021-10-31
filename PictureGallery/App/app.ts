interface IConfigSetting { bindName: string; path:string; className:string; }
interface IPage extends IConfigSetting { url: string; templateUrl: string; nav: boolean; title: string; isDefault: boolean; order: number; }
interface IConfig { appName: string; pages: IPage[]; directives: IConfigSetting[]; services: IConfigSetting[]; }

declare var config:IConfig;
declare var require: Function

function run(config:IConfig) {
    var app = angular.module(config.appName, ['ngRoute']);
    app.config(['$routeProvider', '$controllerProvider', function ($routeProvider, $controllerProvider) {
        (<any>app).controllerProvider = $controllerProvider;
        // Register Page Controllers
        for (var i = 0; i < config.pages.length; i++) {
            //var urli = urls[i];
            var loadControllerFunc = function (p: IPage) {
                return function ($q, $rootScope) {
                    var def = $q.defer();
                    require([p.path], function (controllerCode) {
                        $controllerProvider.register(p.bindName, controllerCode[p.className]);
                        $rootScope.$apply(function () { def.resolve(); });
                    });
                    return def.promise;
                };
            }
            var reg = {
                templateUrl: config.pages[i].templateUrl,
                controller: config.pages[i].bindName,
                resolve: { deps: loadControllerFunc(config.pages[i]) }
            }
           
            $routeProvider.when(config.pages[i].url, reg);
            if (config.pages[i].isDefault) $routeProvider.otherwise(reg);
        }
    }]);

    app.controller('NavigationCtrl', ['$scope', '$location', function ($scope, $location) {
        var navPages = config.pages.filter(function (value: IPage) { return value.nav; });
        $scope.list = navPages.sort(function (a, b) { return a.order < b.order ? -1 : 0; });
        $scope.click = function (url) {
            $location.path(url);
        }
        //Select default page
        var defaultPage: IPage[] = navPages.filter(function (value: IPage) { return value.isDefault; });
        if (defaultPage.length > 0) $location.path(defaultPage[0].url); 
    }]);


    function requireDefer(path:string, run: Function): JQueryPromise<any> {
        var def = $.Deferred(); try { require([path], function (obj) { run(obj, def); }); } catch (err) { def.reject(err); }; return def.promise();
    }

    function registerDirective(reg: IConfigSetting): JQueryPromise<any> {
        return requireDefer(reg.path, function (obj, def) {
            app.directive(reg.bindName, function () { return new obj[reg.className](); });
            def.resolve(true);
        });
    }
    // Register Service here
    function registerService(reg: IConfigSetting): JQueryPromise<any> {
        return requireDefer(reg.path, function (obj, def) {
            app.service(reg.bindName, obj[reg.className]); def.resolve(true);
        });
    }

    var promises: JQueryPromise<any>[] = new Array<JQueryPromise<any>>();

    for (var i = 0; i < config.directives.length; i++) promises.push(registerDirective(config.directives[i]));
    for (var i = 0; i < config.services.length; i++) promises.push(registerService(config.services[i]));

    function startApplication() { app.run(function () { }); angular.bootstrap($("html"), [config.appName]); }
    function fail(err) { console.log(err); }

    $.when.apply($, promises).then(startApplication).fail(fail);
}

if (config) run(config);
