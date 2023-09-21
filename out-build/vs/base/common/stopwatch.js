/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$bd = void 0;
    const hasPerformanceNow = (globalThis.performance && typeof globalThis.performance.now === 'function');
    class $bd {
        static create(highResolution) {
            return new $bd(highResolution);
        }
        constructor(highResolution) {
            this.c = hasPerformanceNow && highResolution === false ? Date.now : globalThis.performance.now.bind(globalThis.performance);
            this.a = this.c();
            this.b = -1;
        }
        stop() {
            this.b = this.c();
        }
        reset() {
            this.a = this.c();
            this.b = -1;
        }
        elapsed() {
            if (this.b !== -1) {
                return this.b - this.a;
            }
            return this.c() - this.a;
        }
    }
    exports.$bd = $bd;
});
//# sourceMappingURL=stopwatch.js.map