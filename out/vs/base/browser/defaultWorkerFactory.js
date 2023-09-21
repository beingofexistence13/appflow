/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/trustedTypes", "vs/base/common/errors", "vs/base/common/network", "vs/base/common/worker/simpleWorker"], function (require, exports, trustedTypes_1, errors_1, network_1, simpleWorker_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.DefaultWorkerFactory = exports.getWorkerBootstrapUrl = exports.createBlobWorker = void 0;
    const ttPolicy = (0, trustedTypes_1.createTrustedTypesPolicy)('defaultWorkerFactory', { createScriptURL: value => value });
    function createBlobWorker(blobUrl, options) {
        if (!blobUrl.startsWith('blob:')) {
            throw new URIError('Not a blob-url: ' + blobUrl);
        }
        return new Worker(ttPolicy ? ttPolicy.createScriptURL(blobUrl) : blobUrl, options);
    }
    exports.createBlobWorker = createBlobWorker;
    function getWorker(label) {
        const monacoEnvironment = globalThis.MonacoEnvironment;
        if (monacoEnvironment) {
            if (typeof monacoEnvironment.getWorker === 'function') {
                return monacoEnvironment.getWorker('workerMain.js', label);
            }
            if (typeof monacoEnvironment.getWorkerUrl === 'function') {
                const workerUrl = monacoEnvironment.getWorkerUrl('workerMain.js', label);
                return new Worker(ttPolicy ? ttPolicy.createScriptURL(workerUrl) : workerUrl, { name: label });
            }
        }
        // ESM-comment-begin
        if (typeof require === 'function') {
            // check if the JS lives on a different origin
            const workerMain = require.toUrl('vs/base/worker/workerMain.js'); // explicitly using require.toUrl(), see https://github.com/microsoft/vscode/issues/107440#issuecomment-698982321
            const workerUrl = getWorkerBootstrapUrl(workerMain, label);
            return new Worker(ttPolicy ? ttPolicy.createScriptURL(workerUrl) : workerUrl, { name: label });
        }
        // ESM-comment-end
        throw new Error(`You must define a function MonacoEnvironment.getWorkerUrl or MonacoEnvironment.getWorker`);
    }
    // ESM-comment-begin
    function getWorkerBootstrapUrl(scriptPath, label) {
        if (/^((http:)|(https:)|(file:))/.test(scriptPath) && scriptPath.substring(0, globalThis.origin.length) !== globalThis.origin) {
            // this is the cross-origin case
            // i.e. the webpage is running at a different origin than where the scripts are loaded from
            const myPath = 'vs/base/worker/defaultWorkerFactory.js';
            const workerBaseUrl = require.toUrl(myPath).slice(0, -myPath.length); // explicitly using require.toUrl(), see https://github.com/microsoft/vscode/issues/107440#issuecomment-698982321
            const js = `/*${label}*/globalThis.MonacoEnvironment={baseUrl: '${workerBaseUrl}'};const ttPolicy = globalThis.trustedTypes?.createPolicy('defaultWorkerFactory', { createScriptURL: value => value });importScripts(ttPolicy?.createScriptURL('${scriptPath}') ?? '${scriptPath}');/*${label}*/`;
            const blob = new Blob([js], { type: 'application/javascript' });
            return URL.createObjectURL(blob);
        }
        const start = scriptPath.lastIndexOf('?');
        const end = scriptPath.lastIndexOf('#', start);
        const params = start > 0
            ? new URLSearchParams(scriptPath.substring(start + 1, ~end ? end : undefined))
            : new URLSearchParams();
        network_1.COI.addSearchParam(params, true, true);
        const search = params.toString();
        if (!search) {
            return `${scriptPath}#${label}`;
        }
        else {
            return `${scriptPath}?${params.toString()}#${label}`;
        }
    }
    exports.getWorkerBootstrapUrl = getWorkerBootstrapUrl;
    // ESM-comment-end
    function isPromiseLike(obj) {
        if (typeof obj.then === 'function') {
            return true;
        }
        return false;
    }
    /**
     * A worker that uses HTML5 web workers so that is has
     * its own global scope and its own thread.
     */
    class WebWorker {
        constructor(moduleId, id, label, onMessageCallback, onErrorCallback) {
            this.id = id;
            this.label = label;
            const workerOrPromise = getWorker(label);
            if (isPromiseLike(workerOrPromise)) {
                this.worker = workerOrPromise;
            }
            else {
                this.worker = Promise.resolve(workerOrPromise);
            }
            this.postMessage(moduleId, []);
            this.worker.then((w) => {
                w.onmessage = function (ev) {
                    onMessageCallback(ev.data);
                };
                w.onmessageerror = onErrorCallback;
                if (typeof w.addEventListener === 'function') {
                    w.addEventListener('error', onErrorCallback);
                }
            });
        }
        getId() {
            return this.id;
        }
        postMessage(message, transfer) {
            this.worker?.then(w => {
                try {
                    w.postMessage(message, transfer);
                }
                catch (err) {
                    (0, errors_1.onUnexpectedError)(err);
                    (0, errors_1.onUnexpectedError)(new Error(`FAILED to post message to '${this.label}'-worker`, { cause: err }));
                }
            });
        }
        dispose() {
            this.worker?.then(w => w.terminate());
            this.worker = null;
        }
    }
    class DefaultWorkerFactory {
        static { this.LAST_WORKER_ID = 0; }
        constructor(label) {
            this._label = label;
            this._webWorkerFailedBeforeError = false;
        }
        create(moduleId, onMessageCallback, onErrorCallback) {
            const workerId = (++DefaultWorkerFactory.LAST_WORKER_ID);
            if (this._webWorkerFailedBeforeError) {
                throw this._webWorkerFailedBeforeError;
            }
            return new WebWorker(moduleId, workerId, this._label || 'anonymous' + workerId, onMessageCallback, (err) => {
                (0, simpleWorker_1.logOnceWebWorkerWarning)(err);
                this._webWorkerFailedBeforeError = err;
                onErrorCallback(err);
            });
        }
    }
    exports.DefaultWorkerFactory = DefaultWorkerFactory;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVmYXVsdFdvcmtlckZhY3RvcnkuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9iYXNlL2Jyb3dzZXIvZGVmYXVsdFdvcmtlckZhY3RvcnkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBT2hHLE1BQU0sUUFBUSxHQUFHLElBQUEsdUNBQXdCLEVBQUMsc0JBQXNCLEVBQUUsRUFBRSxlQUFlLEVBQUUsS0FBSyxDQUFDLEVBQUUsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDO0lBRXZHLFNBQWdCLGdCQUFnQixDQUFDLE9BQWUsRUFBRSxPQUF1QjtRQUN4RSxJQUFJLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsRUFBRTtZQUNqQyxNQUFNLElBQUksUUFBUSxDQUFDLGtCQUFrQixHQUFHLE9BQU8sQ0FBQyxDQUFDO1NBQ2pEO1FBQ0QsT0FBTyxJQUFJLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxlQUFlLENBQUMsT0FBTyxDQUFzQixDQUFDLENBQUMsQ0FBQyxPQUFPLEVBQUUsT0FBTyxDQUFDLENBQUM7SUFDekcsQ0FBQztJQUxELDRDQUtDO0lBRUQsU0FBUyxTQUFTLENBQUMsS0FBYTtRQU0vQixNQUFNLGlCQUFpQixHQUFvQyxVQUFrQixDQUFDLGlCQUFpQixDQUFDO1FBQ2hHLElBQUksaUJBQWlCLEVBQUU7WUFDdEIsSUFBSSxPQUFPLGlCQUFpQixDQUFDLFNBQVMsS0FBSyxVQUFVLEVBQUU7Z0JBQ3RELE9BQU8saUJBQWlCLENBQUMsU0FBUyxDQUFDLGVBQWUsRUFBRSxLQUFLLENBQUMsQ0FBQzthQUMzRDtZQUNELElBQUksT0FBTyxpQkFBaUIsQ0FBQyxZQUFZLEtBQUssVUFBVSxFQUFFO2dCQUN6RCxNQUFNLFNBQVMsR0FBRyxpQkFBaUIsQ0FBQyxZQUFZLENBQUMsZUFBZSxFQUFFLEtBQUssQ0FBQyxD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