/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/lifecycle"], function (require, exports, lifecycle_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$AT = exports.$zT = exports.$yT = exports.$xT = void 0;
    class DisposableTracker {
        constructor() {
            this.allDisposables = [];
        }
        trackDisposable(x) {
            this.allDisposables.push([x, new Error().stack]);
        }
        setParent(child, parent) {
            for (let idx = 0; idx < this.allDisposables.length; idx++) {
                if (this.allDisposables[idx][0] === child) {
                    this.allDisposables.splice(idx, 1);
                    return;
                }
            }
        }
        markAsDisposed(x) {
            for (let idx = 0; idx < this.allDisposables.length; idx++) {
                if (this.allDisposables[idx][0] === x) {
                    this.allDisposables.splice(idx, 1);
                    return;
                }
            }
        }
        markAsSingleton(disposable) {
            // noop
        }
    }
    let currentTracker = null;
    function $xT() {
        currentTracker = new DisposableTracker();
        (0, lifecycle_1.$ac)(currentTracker);
    }
    exports.$xT = $xT;
    function $yT() {
        if (currentTracker) {
            (0, lifecycle_1.$ac)(null);
            console.log(currentTracker.allDisposables.map(e => `${e[0]}\n${e[1]}`).join('\n\n'));
            currentTracker = null;
        }
    }
    exports.$yT = $yT;
    function $zT(withStacks = false) {
        self.beginLoggingFS?.(withStacks);
    }
    exports.$zT = $zT;
    function $AT() {
        self.endLoggingFS?.();
    }
    exports.$AT = $AT;
});
//# sourceMappingURL=troubleshooting.js.map