/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/event"], function (require, exports, event_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$y0b = void 0;
    class $y0b {
        constructor() {
            this.onDidChangeScreenReaderOptimized = event_1.Event.None;
            this.onDidChangeReducedMotion = event_1.Event.None;
        }
        isScreenReaderOptimized() { return false; }
        isMotionReduced() { return false; }
        alwaysUnderlineAccessKeys() { return Promise.resolve(false); }
        setAccessibilitySupport(accessibilitySupport) { }
        getAccessibilitySupport() { return 0 /* AccessibilitySupport.Unknown */; }
        alert(message) { }
    }
    exports.$y0b = $y0b;
});
//# sourceMappingURL=testAccessibilityService.js.map