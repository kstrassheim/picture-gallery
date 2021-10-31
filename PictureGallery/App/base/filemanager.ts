//import taskMgr = require("App/base/taskmanager");
export interface IFile { fileName: string; extension: string; fileInfo: string; size: number; data } 
export class FileManager {

    public allowedExtensions: Array<string>;

    // Read the files given in array
    public ReadFiles(files: File[]): any {
        //var tasks = new taskMgr.TaskManager();
       
        function GetFile(i: number): JQueryPromise<any> {
            var fileReader = new FileReader();
            var def = $.Deferred<any>();
            var file = files[i], fileName = file.name.split('.')[0], fileExtension = file.name.split('.')[1];
            // check if file extension is allowerd
            if (!this.allowedExtensions || this.allowedExtensions.filter(function (a) { return a.toLowerCase() == fileExtension.toLowerCase(); }).length > 0) {
                fileReader.onerror = function (err) { def.reject(err); }
                var onReceivedFileData = (e) => {
                    var splitted = e.target.result.split(',');
                    if (splitted.length > 1) def.resolve({ fileName: fileName, extension: fileExtension, fileInfo: splitted[0], size: file.size, data: splitted[1] });
                    else def.reject("FileManager - ReadFiles - wrong result at file:" + file.name);
                };
                fileReader.onload = onReceivedFileData.bind(this);
                try
                {
                    fileReader.readAsDataURL(file);
                }
                catch (err) {
                    def.reject(err);
                }
            }
            else def.reject();

            return def.promise();
        }
        var promises = new Array<JQueryPromise<any>>();
        for (var i = 0; i < files.length; i++) promises.push(GetFile.bind(this));

        //return tasks.runSerial(promises);
        var def = $.Deferred();
        var results = new Array<any>(promises.length);

        // Go recursive through all files and upload them
        function call(funcs, i) {
            if (i >= funcs.length) def.resolve(results);
            else {
                var done = (res) => {
                    def.notify(i / promises.length * 100);
                    results[i] = res; call(funcs, i + 1)
                }
                funcs[i](i).done(done).fail(def.reject);

            }
            return def.promise();
        }

        return call(promises, 0);

    }

    constructor(allowedExtensions?: Array<string>) {
        this.allowedExtensions = allowedExtensions;
    }
}