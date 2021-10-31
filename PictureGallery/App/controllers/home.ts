import base = require("App/base/base");
import taskMgr = require("App/base/taskmanager");
import fileMgr = require("App/base/filemanager");
import svc = require("App/services/asyncimages");

function getRandomColorFunc() {
    const s = '0123456789ABCDEF';
    return '#' + s[Math.floor(Math.random() * s.length)] + s[Math.floor(Math.random() * s.length)] + s[Math.floor(Math.random() * s.length)] + s[Math.floor(Math.random() * s.length)] + s[Math.floor(Math.random() * s.length)] + s[Math.floor(Math.random() * s.length)];
}

export class Home extends base.Controller {
    private scope;
    private timeout;
    public List;
    private rootSelector = "#gallery";
    private itemClass = "item";
    private filesMgr = new fileMgr.FileManager(["jpg", "jpeg", "png", "gif"]);
    private currentInsertId = -1;
    private svc: svc.AsyncImagesSvc;
    private taskMgr: taskMgr.TaskManager = new taskMgr.TaskManager();

    public getRandomColor = getRandomColorFunc();


    private convertFilesToImages(files: fileMgr.IFile[]) {
        var def = $.Deferred(), len = files.length, images = new Array<any>(len);
        for (var i = 1; i < len + 1; i++) {
            images[i - 1] = { Id: this.currentInsertId, Title: files[i - 1].fileName, Color: this.getRandomColor, File: { FileInfo: files[i - 1].fileInfo, Data: files[i - 1].data } };
            this.currentInsertId--;
            def.notify(i / len * 100);
        }
        def.resolve(images);
        return def.promise();
    }

    public replaceIds(tempId, imageId, renderId) {
        var el = $("#" + tempId);
        el.attr("renderId", renderId).attr("id", imageId);
    }

    private added(imageId)
    {
        this.svc.getById(imageId).then(this.renderImages.bind(this));
    }

    private updated(Id, ZIndex, Width, Top, Left) {
        this.setRenderToElement({ Id: Id, ZIndex: ZIndex, Width: Width, Top: Top, Left: Left });
    }

    private deleted(id) {
        this.deleteImage($("#"+ id));
    }

    private updateRender(el) {
        this.svc.updateRender(this.getRenderFromElement(el));
    }

    private deleteImage(el) {
        var id = $(el).attr("id");
        this.svc.deleteViaHub(id);
        el.remove();
    }

    private getImageFromElement(el) {
        var data = $("img", el).attr("src");
        var id = el.attr("id");
        var title = el.attr("title");
        var color = el.css("border-color");
        var splitted = data.split(',');
        return { Id: id, Title: title, Color:color, File: { FileInfo: splitted[0], Data: splitted[1] }, Render: this.getRenderFromElement(el) };
    }

    private convertImageToHtml(image: any): string {
        var style = "z-index: " + image.Render.ZIndex + ";width: " + image.Render.Width + "px;top: " + image.Render.Top + "px;left: " + image.Render.Left + "px;position:relative; border-color:" + image.Color + ";";
        var html: string = "<div class='" + this.itemClass + "' id='" + image.Id + "' renderId='" + image.Id + "' style='" + style + "' title='" + image.Title + "'>";
        html += "<img src='" + image.File.FileInfo + "," + image.File.Data + "' />";
        html += "</div>";
        return html;
    }

    private getRenderFromElement(el) {
        return { Id: el.attr("renderId"), ZIndex: el.css("z-index"), Width: Math.floor(el.css("width").replace("px", "")), Top: Math.floor(el.css("top").replace("px", "")), Left: Math.floor(el.css("left").replace("px", "")) };
    }

    private setRenderToElement(render) {
        var el = $(".item[renderId='" + render.Id + "']");
        el.css("z-index", render.ZIndex).css("width", render.Width).css("top", render.Top).css("left", render.Left);
    }

    private GetDefaultRenderForImage(image: any, x: number, y: number) { return { Id: image.Id, Left: Math.floor(x), Top: Math.floor(y), Width: 200, ZIndex: 5000 }; }

    private renderImages(images: any[]) {
        let def = $.Deferred(), len = images.length;
        for (let i = 0; i < len; i++) {
            $(this.rootSelector).append(this.convertImageToHtml(images[i]));
            var element = $("#" + images[i].Id);
            var elementImage = $("#" + images[i].Id + " img");
            var jsel = document.getElementById(images[i].Id);
            // declare methods that are not available in event context
            var rsOffset = $(this.rootSelector).offset(), deleteImage = this.deleteImage.bind(this), updateRender = this.updateRender.bind(this);
            var start = () => { }
            const drag = (ev) => {
                // FF workaround
                let fadeSpeed = 'fast';
                let el = $(ev.target), offset = el.offset(), x = offset.left - rsOffset.left, y = offset.top - rsOffset.top;
                if (x < 0 && y < 0) el.css("animation", "blink 0.5s").css("animation-iteration-count", "infinite");
                else el.css("animation", "none").css("animation-iteration-count", "none");
                updateRender(el);
            }

            const stop = (ev) => {
                let el = $(ev.target), offset = el.offset(), x = offset.left - rsOffset.left, y = offset.top - rsOffset.top;
                el.css("animation", "none").css("animation-iteration-count", "none");
                if (x < 0 && y < 0) deleteImage(el);
            }
            const bringToFront = (ev) => {
                let highest = 5000;
                $(".item").each(function (i, o) {
                    // always use a radix when using parseInt
                    let index_current = parseInt($(o).css("z-index"), 10);
                    if (index_current > highest) {
                        highest = index_current;
                    }
                });
                let el = $(ev.target.parentNode);
                el.css("z-index", highest + 1);
                updateRender(el);
            }

            (<any>element).draggable({ drag: drag, start: start, stop: stop });
            (<any>element).resizable({ /*aspectRatio: element.width() / element.height() */});
            element.resize((evt: JQueryEventObject) => { updateRender($(evt.target)) });
            element.dblclick(bringToFront);
            // add double tap
            var tapTimeout;
            var lastTap = 0;
            jsel.addEventListener('touchend', function ( event) {
                let currentTime = new Date().getTime();
                let tapLength = currentTime - lastTap;
                clearTimeout(tapTimeout);
                if (tapLength < 350 && tapLength > 0) {
                    bringToFront(event);
                    event.preventDefault();
                } else {
                    //single tap
                    tapTimeout = setTimeout(function () {
                        clearTimeout(tapTimeout);
                    }, 350);
                }
                lastTap = currentTime;
            });
        }
        def.resolve(images);
        return def.promise();
    }

    private NotifyLoadStatus(data: number) {
        this.changeLoadingText(Math.ceil(data).toString());
    }

    public onAddFileDropped(e, files, obj) {
        var x: number, y: number; 
        if (files.length > 0) {
            // get drop offset to insert
            if (e.view && e.view.event) { x = e.offsetX ? e.offsetX : e.view.event.offsetX; y = e.offsetY ? e.offsetY : e.view.event.offsetY; }
            else {  x = e.originalEvent.layerX; y = e.originalEvent.layerY; }
            this.showLoading();
           
            var initImagesPosition = (images: any[]) => {
                var def = $.Deferred(), len = images.length;
                for (var i = 0; i < len; i++) {
                    // dont put multiple images on the same place
                    if (i > 0) { x = x + Math.floor(Math.random() * 100 * (Math.random() % 2 * -1)); y = y + Math.floor(Math.random() * 100 * (Math.random() % 2 * -1)); }
                    images[i].Render = this.GetDefaultRenderForImage(images[i], x, y);
                }
                def.resolve(images);
                return def.promise();
            }

            // add hub client id to insert method to allow notifications
            var insertRealtime = (images: any[]) => {
                return this.svc.insert(images, this.replaceIds.bind(this));
            }
            
            this.taskMgr.runTasksSerial.bind(this.taskMgr)(files, [
                new taskMgr.Task(this.filesMgr.ReadFiles.bind(this.filesMgr)),
                new taskMgr.Task(this.convertFilesToImages.bind(this), 20),
                new taskMgr.Task(initImagesPosition.bind(this), 40),
                new taskMgr.Task(this.renderImages.bind(this), 50),
                new taskMgr.Task(insertRealtime.bind(this), 70)
            ]).progress(this.NotifyLoadStatus.bind(this))
                .then(this.hideLoading.bind(this))
                .fail(this.hideLoading.bind(this));
        }
    }

    public Refresh() {
        var def = $.Deferred();
        // Load and set list
        function then(data) {
            function update() {
                // setting before is not possible
                // Since i have no event available after ng-repeat binds data i use this timeout solution
                function timeout() {
                    def.notify(90);
                    function fin() { this.registerGesturesForItems(); def.notify(99); def.resolve(data); }
                    this.renderImages(data).then(fin.bind(this)).fail(fail.bind(this));
                }
                this.timeout(timeout.bind(this), 1000);
            }
            def.notify(70);
            this.scope.$apply(update.bind(this));
        }
        function fail(err) { def.reject(err); }
        def.notify(20);
        this.svc.getList().progress(def.notify.bind(this)).then(then.bind(this)).fail(fail.bind(this));
        return def.promise();
    }

    public touchyPinchItem(e: JQueryEventObject, $target?, data?) {
        var item = $target.parent();
        var width = parseInt(item.css("width").replace("px", ""));
        var oldWidth = width / data.previousScale;
        var newWidth = Math.floor(oldWidth * data.scale);
        item.css('width', newWidth + "px"); 
        this.updateRender(item);
    }

    public registerGesturesForItems() {
        (<any>$(".item")).draggable();
        $(".item img").bind('touchy-pinch', this.touchyPinchItem.bind(this));
    }

    private registerEventHandlers() {
        var obj = $(this.rootSelector);
        obj.on('dragenter', function (e) { e.stopPropagation(); e.preventDefault(); });
        obj.on('dragover', function (e) { e.stopPropagation(); e.preventDefault(); });
        obj.on('drop', drop.bind(this));
        function drop(e) { e.preventDefault(); this.onAddFileDropped(e, (<any>e.originalEvent).dataTransfer.files, obj); }
    }

    constructor($scope, $timeout, AsyncImagesSvc) {
        super();
        this.scope = $scope;
        this.timeout = $timeout;
        this.showLoading();
        // add event receivers for hub
        this.svc = AsyncImagesSvc;
        this.svc.added = this.added.bind(this);
        this.svc.updated = this.updated.bind(this);
        this.svc.deleted = this.deleted.bind(this);
        
        this.NotifyLoadStatus(10);
        this.Refresh().done(this.hideLoading.bind(this)).fail(this.hideLoading.bind(this)).progress(this.NotifyLoadStatus.bind(this));
        this.registerEventHandlers();
    }
}