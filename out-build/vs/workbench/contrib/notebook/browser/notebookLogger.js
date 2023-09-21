/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Gnb = void 0;
    // import * as DOM from 'vs/base/browser/dom';
    class NotebookLogger {
        constructor() {
            this.a = 0;
            this.b();
        }
        b() {
            // DOM.scheduleAtNextAnimationFrame(() => {
            // 	this._frameId++;
            // 	this._domFrameLog();
            // }, 1000000);
        }
        debug(...args) {
            const date = new Date();
            console.log(`${date.getSeconds()}:${date.getMilliseconds().toString().padStart(3, '0')}`, `frame #${this.a}: `, ...args);
        }
    }
    const instance = new NotebookLogger();
    function $Gnb(...args) {
        instance.debug(...args);
    }
    exports.$Gnb = $Gnb;
});
//# sourceMappingURL=notebookLogger.js.map