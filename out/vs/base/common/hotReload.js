/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/process"], function (require, exports, process_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.registerHotReloadHandler = exports.isHotReloadEnabled = void 0;
    function isHotReloadEnabled() {
        return !!process_1.env['VSCODE_DEV'];
    }
    exports.isHotReloadEnabled = isHotReloadEnabled;
    function registerHotReloadHandler(handler) {
        if (!isHotReloadEnabled()) {
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
    exports.registerHotReloadHandler = registerHotReloadHandler;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaG90UmVsb2FkLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvYmFzZS9jb21tb24vaG90UmVsb2FkLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQUtoRyxTQUFnQixrQkFBa0I7UUFDakMsT0FBTyxDQUFDLENBQUMsYUFBRyxDQUFDLFlBQVksQ0FBQyxDQUFDO0lBQzVCLENBQUM7SUFGRCxnREFFQztJQUNELFNBQWdCLHdCQUF3QixDQUFDLE9BQXlCO1FBQ2pFLElBQUksQ0FBQyxrQkFBa0IsRUFBRSxFQUFFO1lBQzFCLE9BQU8sRUFBRSxPQUFPLEtBQUssQ0FBQyxFQUFFLENBQUM7U0FDekI7YUFBTTtZQUNOLE1BQU0sUUFBUSxHQUFHLDhCQUE4QixFQUFFLENBQUM7WUFFbEQsUUFBUSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUN0QixPQUFPO2dCQUNOLE9BQU8sS0FBSyxRQUFRLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQzthQUN2QyxDQUFDO1NBQ0Y7SUFDRixDQUFDO0lBWEQsNERBV0M7SUFXRCxTQUFTLDhCQUE4QjtRQUN0QyxJQUFJLENBQUMsaUJBQWlCLEVBQUU7WUFDdkIsaUJBQWlCLEdBQUcsSUFBSSxHQUFHLEVBQUUsQ0FBQztTQUM5QjtRQUVELE1BQU0sQ0FBQyxHQUFHLFVBQTJDLENBQUM7UUFDdEQsSUFBSSxDQUFDLENBQUMsQ0FBQywwQkFBMEIsRUFBRTtZQUNsQyxDQUFDLENBQUMsMEJBQTBCLEdBQUcsVUFBVSxDQUFDLEVBQUU7Z0JBQzNDLEtBQUssTUFBTSxDQUFDLElBQUksaUJBQWtCLEVBQUU7b0JBQ25DLE1BQU0sTUFBTSxHQUFHLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQztvQkFDN0IsSUFBSSxNQUFNLEVBQUU7d0JBQUUsT0FBTyxNQUFNLENBQUM7cUJBQUU7aUJBQzlCO2dCQUNELE9BQU8sU0FBUyxDQUFDO1lBQ2xCLENBQUMsQ0FBQztTQUNGO1FBRUQsT0FBTyxpQkFBaUIsQ0FBQztJQUMxQixDQUFDO0lBRUQsSUFBSSxpQkFBaUIsR0FBNkYsU0FBUyxDQUFDIn0=