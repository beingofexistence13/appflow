/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/browser", "vs/base/common/platform"], function (require, exports, browser, platform) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$bO = exports.KeyboardSupport = void 0;
    var KeyboardSupport;
    (function (KeyboardSupport) {
        KeyboardSupport[KeyboardSupport["Always"] = 0] = "Always";
        KeyboardSupport[KeyboardSupport["FullScreen"] = 1] = "FullScreen";
        KeyboardSupport[KeyboardSupport["None"] = 2] = "None";
    })(KeyboardSupport || (exports.KeyboardSupport = KeyboardSupport = {}));
    /**
     * Browser feature we can support in current platform, browser and environment.
     */
    exports.$bO = {
        clipboard: {
            writeText: (platform.$m
                || (document.queryCommandSupported && document.queryCommandSupported('copy'))
                || !!(navigator && navigator.clipboard && navigator.clipboard.writeText)),
            readText: (platform.$m
                || !!(navigator && navigator.clipboard && navigator.clipboard.readText))
        },
        keyboard: (() => {
            if (platform.$m || browser.$_N()) {
                return 0 /* KeyboardSupport.Always */;
            }
            if (navigator.keyboard || browser.$8N) {
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
//# sourceMappingURL=canIUse.js.map