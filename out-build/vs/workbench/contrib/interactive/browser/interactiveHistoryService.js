/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/history", "vs/base/common/lifecycle", "vs/base/common/map", "vs/platform/instantiation/common/instantiation"], function (require, exports, history_1, lifecycle_1, map_1, instantiation_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$4ib = exports.$3ib = void 0;
    exports.$3ib = (0, instantiation_1.$Bh)('IInteractiveHistoryService');
    class $4ib extends lifecycle_1.$kc {
        constructor() {
            super();
            this._history = new map_1.$zi();
        }
        addToHistory(uri, value) {
            if (!this._history.has(uri)) {
                this._history.set(uri, new history_1.$qR([value], 50));
                return;
            }
            const history = this._history.get(uri);
            history.resetCursor();
            if (history?.current() !== value) {
                history?.add(value);
            }
        }
        getPreviousValue(uri) {
            const history = this._history.get(uri);
            return history?.previous() ?? null;
        }
        getNextValue(uri) {
            const history = this._history.get(uri);
            return history?.next() ?? null;
        }
        replaceLast(uri, value) {
            if (!this._history.has(uri)) {
                this._history.set(uri, new history_1.$qR([value], 50));
                return;
            }
            else {
                const history = this._history.get(uri);
                if (history?.current() !== value) {
                    history?.replaceLast(value);
                }
            }
        }
        clearHistory(uri) {
            this._history.delete(uri);
        }
        has(uri) {
            return this._history.has(uri) ? true : false;
        }
    }
    exports.$4ib = $4ib;
});
//# sourceMappingURL=interactiveHistoryService.js.map