/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$ybb = void 0;
    class $ybb {
        constructor() {
            this.a = {};
        }
        get value() {
            return { ...this.a };
        }
        mark(name) {
            if (this.a[name]) {
                console.error(`Skipping overwrite of notebook perf value: ${name}`);
                return;
            }
            this.a[name] = Date.now();
        }
    }
    exports.$ybb = $ybb;
});
//# sourceMappingURL=notebookPerformance.js.map