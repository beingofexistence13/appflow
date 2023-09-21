/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/trustedTypes", "vs/base/common/errors", "vs/base/common/network", "vs/base/common/worker/simpleWorker"], function (require, exports, trustedTypes_1, errors_1, network_1, simpleWorker_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$WQ = exports.$VQ = exports.$UQ = void 0;
    const ttPolicy = (0, trustedTypes_1.$PQ)('defaultWorkerFactory', { createScriptURL: value => value });
    function $UQ(blobUrl, options) {
        if (!blobUrl.startsWith('blob:')) {
            throw new URIError('Not a blob-url: ' + blobUrl);
        }
        return new Worker(ttPolicy ? ttPolicy.createScriptURL(blobUrl) : blobUrl, options);
    }
    exports.$UQ = $UQ;
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
            const workerUrl = $VQ(workerMain, label);
            return new Worker(ttPolicy ? ttPolicy.createScriptURL(workerUrl) : workerUrl, { name: label });
        }
        // ESM-comment-end
        throw new Error(`You must define a function MonacoEnvironment.getWorkerUrl or MonacoEnvironment.getWorker`);
    }
    // ESM-comment-begin
    function $VQ(scriptPath, label) {
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
    exports.$VQ = $VQ;
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
            this.a = id;
            this.b = label;
            const workerOrPromise = getWorker(label);
            if (isPromiseLike(workerOrPromise)) {
                this.c = workerOrPromise;
            }
            else {
                this.c = Promise.resolve(workerOrPromise);
            }
            this.postMessage(moduleId, []);
            this.c.then((w) => {
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
            return this.a;
        }
        postMessage(message, transfer) {
            this.c?.then(w => {
                try {
                    w.postMessage(message, transfer);
                }
                catch (err) {
                    (0, errors_1.$Y)(err);
                    (0, errors_1.$Y)(new Error(`FAILED to post message to '${this.b}'-worker`, { cause: err }));
                }
            });
        }
        dispose() {
            this.c?.then(w => w.terminate());
            this.c = null;
        }
    }
    class $WQ {
        static { this.a = 0; }
        constructor(label) {
            this.b = label;
            this.c = false;
        }
        create(moduleId, onMessageCallback, onErrorCallback) {
            const workerId = (++$WQ.a);
            if (this.c) {
                throw this.c;
            }
            return new WebWorker(moduleId, workerId, this.b || 'anonymous' + workerId, onMessageCallback, (err) => {
                (0, simpleWorker_1.logOnceWebWorkerWarning)(err);
                this.c = err;
                onErrorCallback(err);
            });
        }
    }
    exports.$WQ = $WQ;
});
//# sourceMappingURL=defaultWorkerFactory.js.map