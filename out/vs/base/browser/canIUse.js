/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/browser", "vs/base/common/platform"], function (require, exports, browser, platform) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.BrowserFeatures = exports.KeyboardSupport = void 0;
    var KeyboardSupport;
    (function (KeyboardSupport) {
        KeyboardSupport[KeyboardSupport["Always"] = 0] = "Always";
        KeyboardSupport[KeyboardSupport["FullScreen"] = 1] = "FullScreen";
        KeyboardSupport[KeyboardSupport["None"] = 2] = "None";
    })(KeyboardSupport || (exports.KeyboardSupport = KeyboardSupport = {}));
    /**
     * Browser feature we can support in current platform, browser and environment.
     */
    exports.BrowserFeatures = {
        clipboard: {
            writeText: (platform.isNative
                || (document.queryCommandSupported && document.queryCommandSupported('copy'))
                || !!(navigator && navigator.clipboard && navigator.clipboard.writeText)),
            readText: (platform.isNative
                || !!(navigator && navigator.clipboard && navigator.clipboard.readText))
        },
        keyboard: (() => {
            if (platform.isNative || browser.isStandalone()) {
                return 0 /* KeyboardSupport.Always */;
            }
            if (navigator.keyboard || browser.isSafari) {
                return 1 /* KeyboardSupport.FullScreen */;
            }
            return 2 /* KeyboardSupport.None */;
        })(),
        // 'ontouchstart' in window always evaluates to true with typescript's modern typings. This causes `window` to be
        // `never` later in `window.navigator`. That's why we need the explicit `window as Window` cast
        touch: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
        pointerEvents: window.PointerEvent && ('ontouchstart' in window || window.navigator.maxTouchPoints > 0 || navigator.maxTouchPoints > 0)
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2FuSVVzZS5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL2Jhc2UvYnJvd3Nlci9jYW5JVXNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQUtoRyxJQUFrQixlQUlqQjtJQUpELFdBQWtCLGVBQWU7UUFDaEMseURBQU0sQ0FBQTtRQUNOLGlFQUFVLENBQUE7UUFDVixxREFBSSxDQUFBO0lBQ0wsQ0FBQyxFQUppQixlQUFlLCtCQUFmLGVBQWUsUUFJaEM7SUFFRDs7T0FFRztJQUNVLFFBQUEsZUFBZSxHQUFHO1FBQzlCLFNBQVMsRUFBRTtZQUNWLFNBQVMsRUFBRSxDQUNWLFFBQVEsQ0FBQyxRQUFRO21CQUNkLENBQUMsUUFBUSxDQUFDLHFCQUFxQixJQUFJLFFBQVEsQ0FBQyxxQkFBcUIsQ0FBQyxNQUFNLENBQUMsQ0FBQzttQkFDMUUsQ0FBQyxDQUFDLENBQUMsU0FBUyxJQUFJLFNBQVMsQ0FBQyxTQUFTLElBQUksU0FBUyxDQUFDLFNBQVMsQ0FBQyxTQUFTLENBQUMsQ0FDeEU7WUFDRCxRQUFRLEVBQUUsQ0FDVCxRQUFRLENBQUMsUUFBUTttQkFDZCxDQUFDLENBQUMsQ0FBQyxTQUFTLElBQUksU0FBUyxDQUFDLFNBQVMsSUFBSSxTQUFTLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxDQUN2RTtTQUNEO1FBQ0QsUUFBUSxFQUFFLENBQUMsR0FBRyxFQUFFO1lBQ2YsSUFBSSxRQUFRLENBQUMsUUFBUSxJQUFJLE9BQU8sQ0FBQyxZQUFZLEVBQUUsRUFBRTtnQkFDaEQsc0NBQThCO2FBQzlCO1lBRUQsSUFBVSxTQUFVLENBQUMsUUFBUSxJQUFJLE9BQU8sQ0FBQyxRQUFRLEVBQUU7Z0JBQ2xELDBDQUFrQzthQUNsQztZQUVELG9DQUE0QjtRQUM3QixDQUFDLENBQUMsRUFBRTtRQUVKLGlIQUFpSDtRQUNqSCwrRkFBK0Y7UUFDL0YsS0FBSyxFQUFFLGNBQWMsSUFBSSxNQUFNLElBQUksU0FBUyxDQUFDLGNBQWMsR0FBRyxDQUFDO1FBQy9ELGFBQWEsRUFBRSxNQUFNLENBQUMsWUFBWSxJQUFJLENBQUMsY0FBYyxJQUFJLE1BQU0sSUFBSyxNQUFpQixDQUFDLFNBQVMsQ0FBQyxjQUFjLEdBQUcsQ0FBQyxJQUFJLFNBQVMsQ0FBQyxjQUFjLEdBQUcsQ0FBQyxDQUFDO0tBQ25KLENBQUMifQ==