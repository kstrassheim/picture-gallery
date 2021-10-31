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
define(["require", "exports", "App/base/base", "App/base/taskmanager", "App/base/filemanager"], function (require, exports, base, taskMgr, fileMgr) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Images = void 0;
    var Images = /** @class */ (function (_super) {
        __extends(Images, _super);
        function Images($scope, $location, $q, $timeout, AsyncImagesSvc) {
            var _this = _super.call(this) || this;
            _this.addUrl = "#/images/addImage";
            _this.editUrl = "#/images/editImage/";
            _this.filesMgr = new fileMgr.FileManager(["jpg", "jpeg", "png", "gif"]);
            _this.taskMgr = new taskMgr.TaskManager();
            _this.showLoading();
            // public properties
            //this.List = new Array();
            _this.scope = $scope;
            _this.timeout = $timeout;
            _this.asyncsvc = AsyncImagesSvc;
            _this.location = $location;
            _this.copyClassToScope($scope, Images, _this);
            _this.Refresh().then(_this.hideLoading.bind(_this)).fail(_this.hideLoading.bind(_this)).progress(_this.NotifyLoadStatus.bind(_this));
            _this.registerEventHandlers();
            return _this;
        }
        Images.prototype.NotifyLoadStatus = function (data) {
            this.changeLoadingText(Math.ceil(data).toString());
        };
        Images.prototype.Refresh = function () {
            var def = $.Deferred();
            // Load and set list
            function then(data) {
                function update() {
                    // setting before is not possible
                    this.scope.List = this.List = data;
                    // Since i have no event available after ng-repeat binds data i use this timeout solution
                    function timeout() {
                        def.notify(99);
                        this.registerDragableItems();
                        def.resolve(data);
                    }
                    this.timeout(timeout.bind(this), 1000);
                }
                def.notify(70);
                this.scope.$apply(update.bind(this));
            }
            function fail(err) { def.reject(err); }
            def.notify(10);
            this.asyncsvc.getList().progress(def.notify.bind(this)).then(then.bind(this)).fail(fail.bind(this));
            return def.promise();
        };
        Images.prototype.convertFilesToImages = function (files) {
            var def = $.Deferred(), len = files.length, images = new Array(len);
            for (var i = 0; i < len; i++) {
                images[i] = { Id: -1, Title: files[i].fileName, File: { FileInfo: files[i].fileInfo, Data: files[i].data }, Render: { Id: -1, Left: 5, Top: 5, Width: 200, ZIndex: 5000 } };
                def.notify(i / len * 100);
            }
            def.resolve(images);
            return def.promise();
        };
        Images.prototype.onRemoveDropped = function (id) {
            this.asyncsvc.deleteItem(parseInt(id)).then(this.Refresh.bind(this));
        };
        Images.prototype.onAddFileDropped = function (files, obj) {
            this.showLoading();
            this.taskMgr.runTasksSerial(files, [
                new taskMgr.Task(this.filesMgr.ReadFiles.bind(this.filesMgr)),
                new taskMgr.Task(this.convertFilesToImages.bind(this), 20),
                new taskMgr.Task(this.asyncsvc.insert.bind(this.asyncsvc), 25),
                new taskMgr.Task(this.Refresh.bind(this), 80)
            ]).progress(this.NotifyLoadStatus.bind(this))
                .then(this.hideLoading.bind(this))
                .fail(this.hideLoading.bind(this));
        };
        Images.prototype.registerEventHandlers = function () {
            // register add drop event with STANDARD Jquery
            var obj = $(".dropAdd");
            obj.on('dragenter', function (e) { e.stopPropagation(); e.preventDefault(); });
            obj.on('dragover', function (e) { e.stopPropagation(); e.preventDefault(); });
            obj.on('drop', drop.bind(this));
            function drop(e) { e.preventDefault(); this.onAddFileDropped(e.originalEvent.dataTransfer.files, obj); }
            // register remove drop event with JQUERY UI
            var removeDropFunc = this.onRemoveDropped.bind(this);
            $(".dropRemove").droppable({
                drop: function (e, ui) { removeDropFunc($(ui.draggable).attr("itemid")); }
            });
            // draggable items are registered after data bind of ng-repeat
        };
        Images.prototype.registerDragableItems = function () { $(".listItem").draggable(); };
        return Images;
    }(base.Controller));
    exports.Images = Images;
});
//# sourceMappingURL=images.js.map