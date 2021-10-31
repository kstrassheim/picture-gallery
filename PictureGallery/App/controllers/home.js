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
    exports.Home = void 0;
    function getRandomColorFunc() {
        var s = '0123456789ABCDEF';
        return '#' + s[Math.floor(Math.random() * s.length)] + s[Math.floor(Math.random() * s.length)] + s[Math.floor(Math.random() * s.length)] + s[Math.floor(Math.random() * s.length)] + s[Math.floor(Math.random() * s.length)] + s[Math.floor(Math.random() * s.length)];
    }
    var Home = /** @class */ (function (_super) {
        __extends(Home, _super);
        function Home($scope, $timeout, AsyncImagesSvc) {
            var _this = _super.call(this) || this;
            _this.rootSelector = "#gallery";
            _this.itemClass = "item";
            _this.filesMgr = new fileMgr.FileManager(["jpg", "jpeg", "png", "gif"]);
            _this.currentInsertId = -1;
            _this.taskMgr = new taskMgr.TaskManager();
            _this.getRandomColor = getRandomColorFunc();
            _this.scope = $scope;
            _this.timeout = $timeout;
            _this.showLoading();
            // add event receivers for hub
            _this.svc = AsyncImagesSvc;
            _this.svc.added = _this.added.bind(_this);
            _this.svc.updated = _this.updated.bind(_this);
            _this.svc.deleted = _this.deleted.bind(_this);
            _this.NotifyLoadStatus(10);
            _this.Refresh().done(_this.hideLoading.bind(_this)).fail(_this.hideLoading.bind(_this)).progress(_this.NotifyLoadStatus.bind(_this));
            _this.registerEventHandlers();
            return _this;
        }
        Home.prototype.convertFilesToImages = function (files) {
            var def = $.Deferred(), len = files.length, images = new Array(len);
            for (var i = 1; i < len + 1; i++) {
                images[i - 1] = { Id: this.currentInsertId, Title: files[i - 1].fileName, Color: this.getRandomColor, File: { FileInfo: files[i - 1].fileInfo, Data: files[i - 1].data } };
                this.currentInsertId--;
                def.notify(i / len * 100);
            }
            def.resolve(images);
            return def.promise();
        };
        Home.prototype.replaceIds = function (tempId, imageId, renderId) {
            var el = $("#" + tempId);
            el.attr("renderId", renderId).attr("id", imageId);
        };
        Home.prototype.added = function (imageId) {
            this.svc.getById(imageId).then(this.renderImages.bind(this));
        };
        Home.prototype.updated = function (Id, ZIndex, Width, Top, Left) {
            this.setRenderToElement({ Id: Id, ZIndex: ZIndex, Width: Width, Top: Top, Left: Left });
        };
        Home.prototype.deleted = function (id) {
            this.deleteImage($("#" + id));
        };
        Home.prototype.updateRender = function (el) {
            this.svc.updateRender(this.getRenderFromElement(el));
        };
        Home.prototype.deleteImage = function (el) {
            var id = $(el).attr("id");
            this.svc.deleteViaHub(id);
            el.remove();
        };
        Home.prototype.getImageFromElement = function (el) {
            var data = $("img", el).attr("src");
            var id = el.attr("id");
            var title = el.attr("title");
            var color = el.css("border-color");
            var splitted = data.split(',');
            return { Id: id, Title: title, Color: color, File: { FileInfo: splitted[0], Data: splitted[1] }, Render: this.getRenderFromElement(el) };
        };
        Home.prototype.convertImageToHtml = function (image) {
            var style = "z-index: " + image.Render.ZIndex + ";width: " + image.Render.Width + "px;top: " + image.Render.Top + "px;left: " + image.Render.Left + "px;position:relative; border-color:" + image.Color + ";";
            var html = "<div class='" + this.itemClass + "' id='" + image.Id + "' renderId='" + image.Id + "' style='" + style + "' title='" + image.Title + "'>";
            html += "<img src='" + image.File.FileInfo + "," + image.File.Data + "' />";
            html += "</div>";
            return html;
        };
        Home.prototype.getRenderFromElement = function (el) {
            return { Id: el.attr("renderId"), ZIndex: el.css("z-index"), Width: Math.floor(el.css("width").replace("px", "")), Top: Math.floor(el.css("top").replace("px", "")), Left: Math.floor(el.css("left").replace("px", "")) };
        };
        Home.prototype.setRenderToElement = function (render) {
            var el = $(".item[renderId='" + render.Id + "']");
            el.css("z-index", render.ZIndex).css("width", render.Width).css("top", render.Top).css("left", render.Left);
        };
        Home.prototype.GetDefaultRenderForImage = function (image, x, y) { return { Id: image.Id, Left: Math.floor(x), Top: Math.floor(y), Width: 200, ZIndex: 5000 }; };
        Home.prototype.renderImages = function (images) {
            var def = $.Deferred(), len = images.length;
            var _loop_1 = function (i) {
                $(this_1.rootSelector).append(this_1.convertImageToHtml(images[i]));
                element = $("#" + images[i].Id);
                elementImage = $("#" + images[i].Id + " img");
                jsel = document.getElementById(images[i].Id);
                // declare methods that are not available in event context
                rsOffset = $(this_1.rootSelector).offset(), deleteImage = this_1.deleteImage.bind(this_1), updateRender = this_1.updateRender.bind(this_1);
                start = function () { };
                var drag = function (ev) {
                    // FF workaround
                    var fadeSpeed = 'fast';
                    var el = $(ev.target), offset = el.offset(), x = offset.left - rsOffset.left, y = offset.top - rsOffset.top;
                    if (x < 0 && y < 0)
                        el.css("animation", "blink 0.5s").css("animation-iteration-count", "infinite");
                    else
                        el.css("animation", "none").css("animation-iteration-count", "none");
                    updateRender(el);
                };
                var stop_1 = function (ev) {
                    var el = $(ev.target), offset = el.offset(), x = offset.left - rsOffset.left, y = offset.top - rsOffset.top;
                    el.css("animation", "none").css("animation-iteration-count", "none");
                    if (x < 0 && y < 0)
                        deleteImage(el);
                };
                var bringToFront = function (ev) {
                    var highest = 5000;
                    $(".item").each(function (i, o) {
                        // always use a radix when using parseInt
                        var index_current = parseInt($(o).css("z-index"), 10);
                        if (index_current > highest) {
                            highest = index_current;
                        }
                    });
                    var el = $(ev.target.parentNode);
                    el.css("z-index", highest + 1);
                    updateRender(el);
                };
                element.draggable({ drag: drag, start: start, stop: stop_1 });
                element.resizable({ /*aspectRatio: element.width() / element.height() */});
                element.resize(function (evt) { updateRender($(evt.target)); });
                element.dblclick(bringToFront);
                lastTap = 0;
                jsel.addEventListener('touchend', function (event) {
                    var currentTime = new Date().getTime();
                    var tapLength = currentTime - lastTap;
                    clearTimeout(tapTimeout);
                    if (tapLength < 350 && tapLength > 0) {
                        bringToFront(event);
                        event.preventDefault();
                    }
                    else {
                        //single tap
                        tapTimeout = setTimeout(function () {
                            clearTimeout(tapTimeout);
                        }, 350);
                    }
                    lastTap = currentTime;
                });
            };
            var this_1 = this, element, elementImage, jsel, rsOffset, deleteImage, updateRender, start, tapTimeout, lastTap;
            for (var i = 0; i < len; i++) {
                _loop_1(i);
            }
            def.resolve(images);
            return def.promise();
        };
        Home.prototype.NotifyLoadStatus = function (data) {
            this.changeLoadingText(Math.ceil(data).toString());
        };
        Home.prototype.onAddFileDropped = function (e, files, obj) {
            var _this = this;
            var x, y;
            if (files.length > 0) {
                // get drop offset to insert
                if (e.view && e.view.event) {
                    x = e.offsetX ? e.offsetX : e.view.event.offsetX;
                    y = e.offsetY ? e.offsetY : e.view.event.offsetY;
                }
                else {
                    x = e.originalEvent.layerX;
                    y = e.originalEvent.layerY;
                }
                this.showLoading();
                var initImagesPosition = function (images) {
                    var def = $.Deferred(), len = images.length;
                    for (var i = 0; i < len; i++) {
                        // dont put multiple images on the same place
                        if (i > 0) {
                            x = x + Math.floor(Math.random() * 100 * (Math.random() % 2 * -1));
                            y = y + Math.floor(Math.random() * 100 * (Math.random() % 2 * -1));
                        }
                        images[i].Render = _this.GetDefaultRenderForImage(images[i], x, y);
                    }
                    def.resolve(images);
                    return def.promise();
                };
                // add hub client id to insert method to allow notifications
                var insertRealtime = function (images) {
                    return _this.svc.insert(images, _this.replaceIds.bind(_this));
                };
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
        };
        Home.prototype.Refresh = function () {
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
        };
        Home.prototype.touchyPinchItem = function (e, $target, data) {
            var item = $target.parent();
            var width = parseInt(item.css("width").replace("px", ""));
            var oldWidth = width / data.previousScale;
            var newWidth = Math.floor(oldWidth * data.scale);
            item.css('width', newWidth + "px");
            this.updateRender(item);
        };
        Home.prototype.registerGesturesForItems = function () {
            $(".item").draggable();
            $(".item img").bind('touchy-pinch', this.touchyPinchItem.bind(this));
        };
        Home.prototype.registerEventHandlers = function () {
            var obj = $(this.rootSelector);
            obj.on('dragenter', function (e) { e.stopPropagation(); e.preventDefault(); });
            obj.on('dragover', function (e) { e.stopPropagation(); e.preventDefault(); });
            obj.on('drop', drop.bind(this));
            function drop(e) { e.preventDefault(); this.onAddFileDropped(e, e.originalEvent.dataTransfer.files, obj); }
        };
        return Home;
    }(base.Controller));
    exports.Home = Home;
});
//# sourceMappingURL=home.js.map