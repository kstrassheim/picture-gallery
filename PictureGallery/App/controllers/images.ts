import base = require("App/base/base");
import taskMgr = require("App/base/taskmanager");
import fileMgr = require("App/base/filemanager");
import asvc = require("App/services/asyncimages");

export class Images extends base.Controller {
    private scope;
    private timeout;
    private addUrl = "#/images/addImage";
    private editUrl = "#/images/editImage/";
    private asyncsvc: asvc.AsyncImagesSvc;
    private filesMgr = new fileMgr.FileManager(["jpg", "jpeg", "png", "gif"]);
    private taskMgr: taskMgr.TaskManager = new taskMgr.TaskManager();
    private location;

    public List;

    public NotifyLoadStatus(data: number) {
        this.changeLoadingText(Math.ceil(data).toString());
    }

    public Refresh() {
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
    }

    private convertFilesToImages(files: fileMgr.IFile[]) {
        var def = $.Deferred(), len = files.length, images = new Array<any>(len);
        for (var i = 0; i < len; i++) {
            images[i] = { Id: -1, Title: files[i].fileName, File: { FileInfo: files[i].fileInfo, Data: files[i].data }, Render: { Id: -1, Left: 5, Top: 5, Width: 200, ZIndex: 5000 } };
            def.notify(i / len * 100);
        }
        def.resolve(images);
        return def.promise();
    }


    public onRemoveDropped(id) {
        this.asyncsvc.deleteItem(parseInt(id)).then(this.Refresh.bind(this));
    }

    public onAddFileDropped(files, obj) {
        this.showLoading();
        this.taskMgr.runTasksSerial(files, [
            new taskMgr.Task(this.filesMgr.ReadFiles.bind(this.filesMgr)),
            new taskMgr.Task(this.convertFilesToImages.bind(this), 20),
            new taskMgr.Task(this.asyncsvc.insert.bind(this.asyncsvc), 25),
            new taskMgr.Task(this.Refresh.bind(this), 80)
        ]).progress(this.NotifyLoadStatus.bind(this))
            .then(this.hideLoading.bind(this))
            .fail(this.hideLoading.bind(this));
    }

    private registerEventHandlers() {
        // register add drop event with STANDARD Jquery
        var obj = $(".dropAdd");
        obj.on('dragenter', function (e) { e.stopPropagation(); e.preventDefault(); });
        obj.on('dragover', function (e) { e.stopPropagation(); e.preventDefault(); });
        obj.on('drop', drop.bind(this));
        function drop(e) { e.preventDefault(); this.onAddFileDropped((<any>e.originalEvent).dataTransfer.files, obj); }

        // register remove drop event with JQUERY UI
        var removeDropFunc = this.onRemoveDropped.bind(this);
        (<any>$(".dropRemove")).droppable({
            drop: function (e, ui) { removeDropFunc($(ui.draggable).attr("itemid")); }
        });
        // draggable items are registered after data bind of ng-repeat
    }

    public registerDragableItems() { (<any>$(".listItem")).draggable(); }


    constructor($scope, $location, $q, $timeout, AsyncImagesSvc:asvc.AsyncImagesSvc) {
        super();
        this.showLoading();
        // public properties
        //this.List = new Array();
        this.scope = $scope;
        this.timeout = $timeout;
        this.asyncsvc = AsyncImagesSvc;
        this.location = $location;
        this.copyClassToScope($scope, Images, this);
        this.Refresh().then(this.hideLoading.bind(this)).fail(this.hideLoading.bind(this)).progress(this.NotifyLoadStatus.bind(this));
        this.registerEventHandlers();
    }
}