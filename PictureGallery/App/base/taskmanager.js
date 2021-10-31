define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TaskManager = exports.Task = void 0;
    // A class to run chanining promise functions with one parameter data
    // calculates every tasks percentage status in common status
    var Task = /** @class */ (function () {
        function Task(func, runFromPercentage, runToPercentage) {
            this.runFromPercentage = 0;
            this.runToPercentage = 100;
            this.range = 100;
            this.initPercentages(runFromPercentage, runToPercentage);
            this.func = func;
        }
        Task.prototype.calculateStatus = function (status, currentStatus) {
            return currentStatus + status / 100 * this.range;
        };
        Task.prototype.run = function (data, currentStatus, nextTask) {
            if (nextTask)
                this.initPercentages(null, nextTask.runFromPercentage);
            var def = $.Deferred();
            currentStatus = this.runFromPercentage;
            def.notify(currentStatus);
            function then(val) { def.resolve(val); }
            function progress(val) {
                def.notify(this.calculateStatus(val, currentStatus));
            }
            function fail(err) { def.reject(err); }
            this.func(data).progress(progress.bind(this)).done(then.bind(this)).fail(fail.bind(this));
            return def.promise();
        };
        Task.prototype.initPercentages = function (runFromPercentage, runToPercentage) {
            if (runFromPercentage && runFromPercentage > 0 && runFromPercentage < 100)
                this.runFromPercentage = runFromPercentage;
            else
                this.runFromPercentage = 0;
            if (runToPercentage && runToPercentage > 0 && runToPercentage < 100)
                this.runToPercentage = runToPercentage;
            else
                this.runToPercentage = 100;
            this.range = this.runToPercentage - this.runFromPercentage;
        };
        return Task;
    }());
    exports.Task = Task;
    var TaskManager = /** @class */ (function () {
        function TaskManager() {
        }
        TaskManager.prototype.runSerial = function (promises) {
            var def = $.Deferred();
            var results = new Array(promises.length);
            // Go recursive through all files and upload them
            function call(funcs, i) {
                if (i >= funcs.length)
                    def.resolve(results);
                else {
                    var done = function (res) { results[i] = res; call(funcs, i + 1); };
                    funcs[i](i).done(done).fail(def.reject);
                }
                return def.promise();
            }
            return call(promises, 0);
        };
        TaskManager.prototype.runTasksSerial = function (data, tasks) {
            var def = $.Deferred();
            var results = new Array(tasks.length);
            // Go recursive through all files and upload them
            function call(res, ts, i, currentStatus) {
                if (i >= ts.length)
                    def.resolve(results);
                else {
                    var done = function (res) { results[i] = res; call(res, ts, i + 1, currentStatus); };
                    var next = ((i < ts.length - 1) ? ts[i + 1] : null);
                    ts[i].run(res, currentStatus, next).progress(def.notify).done(done).fail(def.reject);
                }
                return def.promise();
            }
            return call(data, tasks, 0, 0);
        };
        return TaskManager;
    }());
    exports.TaskManager = TaskManager;
});
//# sourceMappingURL=taskmanager.js.map