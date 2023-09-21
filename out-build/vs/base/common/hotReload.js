/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/process"], function (require, exports, process_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$uS = exports.$tS = void 0;
    function $tS() {
        return !!process_1.env['VSCODE_DEV'];
    }
    exports.$tS = $tS;
    function $uS(handler) {
        if (!$tS()) {
            return { dispose() { } };
        }
        else {
            const handlers = registerGlobalHotReloadHandler();
            handlers.add(handler);
            return {
                dispose() { handlers.delete(handler); }
            };
        }
    }
    exports.$uS = $uS;
    function registerGlobalHotReloadHandler() {
        if (!hotReloadHandlers) {
            hotReloadHandlers = new Set();
        }
        const g = globalThis;
        if (!g.$hotReload_applyNewExports) {
            g.$hotReload_applyNewExports = oldExports => {
                for (const h of hotReloadHandlers) {
                    const result = h(oldExports);
                    if (result) {
                        return result;
                    }
                }
                return undefined;
            };
        }
        return hotReloadHandlers;
    }
    let hotReloadHandlers = undefined;
});
//# sourceMappingURL=hotReload.js.map