export interface ITask {
    func: Function;
    run(data, currentStatus: number, nextTask?: Task): JQueryPromise<any>
}

// A class to run chanining promise functions with one parameter data
// calculates every tasks percentage status in common status
export class Task implements ITask {
    public runFromPercentage: number = 0;
    public runToPercentage: number = 100;
    public range: number = 100;

    public func: Function;

    public calculateStatus(status: number, currentStatus:number):number {
        return currentStatus + status / 100 * this.range;
    }

    public run(data, currentStatus: number, nextTask?: Task): JQueryPromise<any> {
       
        if (nextTask) this.initPercentages(null, nextTask.runFromPercentage);
        var def = $.Deferred();
        currentStatus = this.runFromPercentage;
        def.notify(currentStatus);
        function then(val) { def.resolve(val); }
        function progress(val: number) {
            def.notify(this.calculateStatus(val, currentStatus));
        }
        function fail(err) { def.reject(err); }
        (<JQueryPromise<any>>this.func(data)).progress(progress.bind(this)).done(then.bind(this)).fail(fail.bind(this))
        return def.promise();
    }

    public initPercentages(runFromPercentage?: number, runToPercentage?: number) {
        if (runFromPercentage && runFromPercentage > 0 && runFromPercentage < 100) this.runFromPercentage = runFromPercentage;
        else this.runFromPercentage = 0;
        if (runToPercentage && runToPercentage > 0 && runToPercentage < 100) this.runToPercentage = runToPercentage;
        else this.runToPercentage = 100;
        
        this.range = this.runToPercentage - this.runFromPercentage; 
    }

    constructor(func: Function, runFromPercentage?: number, runToPercentage?: number) {
        this.initPercentages(runFromPercentage, runToPercentage);
        this.func = func;
    }
}

export class TaskManager {

    public runSerial(promises: JQueryPromise<any>[]) {
        var def = $.Deferred();
        var results = new Array<any>(promises.length);

        // Go recursive through all files and upload them
        function call(funcs, i) {
            if (i >= funcs.length) def.resolve(results);
            else {
                var done = (res) => { results[i] = res; call(funcs, i + 1) }
                funcs[i](i).done(done).fail(def.reject);

            }
            return def.promise();
        }

        return call(promises, 0);
    }

    public runTasksSerial(data: any, tasks: Task[]) {
        var def = $.Deferred();
        var results = new Array<any>(tasks.length);
        
        // Go recursive through all files and upload them
        function call(res:any, ts:Task[], i, currentStatus) {
            if (i >= ts.length) def.resolve(results);
            else {
                var done = (res) => { results[i] = res; call(res, ts, i + 1, currentStatus); }
                var next = ((i < ts.length - 1) ? ts[i + 1] : null);
                ts[i].run(res, currentStatus, next).progress(def.notify).done(done).fail(def.reject);

            }
            return def.promise();
        }

        return call(data, tasks, 0, 0);
    }
}