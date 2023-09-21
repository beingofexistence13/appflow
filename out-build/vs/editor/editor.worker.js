/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/worker/simpleWorker", "vs/editor/common/services/editorSimpleWorker"], function (require, exports, simpleWorker_1, editorSimpleWorker_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$v0b = void 0;
    let initialized = false;
    function $v0b(foreignModule) {
        if (initialized) {
            return;
        }
        initialized = true;
        const simpleWorker = new simpleWorker_1.SimpleWorkerServer((msg) => {
            globalThis.postMessage(msg);
        }, (host) => new editorSimpleWorker_1.EditorSimpleWorker(host, foreignModule));
        globalThis.onmessage = (e) => {
            simpleWorker.onmessage(e.data);
        };
    }
    exports.$v0b = $v0b;
    globalThis.onmessage = (e) => {
        // Ignore first message in this case and initialize if not yet initialized
        if (!initialized) {
            $v0b(null);
        }
    };
});
//# sourceMappingURL=editor.worker.js.map