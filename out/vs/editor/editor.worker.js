/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/worker/simpleWorker", "vs/editor/common/services/editorSimpleWorker"], function (require, exports, simpleWorker_1, editorSimpleWorker_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.initialize = void 0;
    let initialized = false;
    function initialize(foreignModule) {
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
    exports.initialize = initialize;
    globalThis.onmessage = (e) => {
        // Ignore first message in this case and initialize if not yet initialized
        if (!initialized) {
            initialize(null);
        }
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWRpdG9yLndvcmtlci5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL2VkaXRvci9lZGl0b3Iud29ya2VyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQU1oRyxJQUFJLFdBQVcsR0FBRyxLQUFLLENBQUM7SUFFeEIsU0FBZ0IsVUFBVSxDQUFDLGFBQWtCO1FBQzVDLElBQUksV0FBVyxFQUFFO1lBQ2hCLE9BQU87U0FDUDtRQUNELFdBQVcsR0FBRyxJQUFJLENBQUM7UUFFbkIsTUFBTSxZQUFZLEdBQUcsSUFBSSxpQ0FBa0IsQ0FBQyxDQUFDLEdBQUcsRUFBRSxFQUFFO1lBQ25ELFVBQVUsQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDN0IsQ0FBQyxFQUFFLENBQUMsSUFBdUIsRUFBRSxFQUFFLENBQUMsSUFBSSx1Q0FBa0IsQ0FBQyxJQUFJLEVBQUUsYUFBYSxDQUFDLENBQUMsQ0FBQztRQUU3RSxVQUFVLENBQUMsU0FBUyxHQUFHLENBQUMsQ0FBZSxFQUFFLEVBQUU7WUFDMUMsWUFBWSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDaEMsQ0FBQyxDQUFDO0lBQ0gsQ0FBQztJQWJELGdDQWFDO0lBRUQsVUFBVSxDQUFDLFNBQVMsR0FBRyxDQUFDLENBQWUsRUFBRSxFQUFFO1FBQzFDLDBFQUEwRTtRQUMxRSxJQUFJLENBQUMsV0FBVyxFQUFFO1lBQ2pCLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQztTQUNqQjtJQUNGLENBQUMsQ0FBQyJ9