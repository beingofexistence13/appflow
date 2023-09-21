/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/event"], function (require, exports, event_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TestAccessibilityService = void 0;
    class TestAccessibilityService {
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
    exports.TestAccessibilityService = TestAccessibilityService;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdEFjY2Vzc2liaWxpdHlTZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvcGxhdGZvcm0vYWNjZXNzaWJpbGl0eS90ZXN0L2NvbW1vbi90ZXN0QWNjZXNzaWJpbGl0eVNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBS2hHLE1BQWEsd0JBQXdCO1FBQXJDO1lBSUMscUNBQWdDLEdBQUcsYUFBSyxDQUFDLElBQUksQ0FBQztZQUM5Qyw2QkFBd0IsR0FBRyxhQUFLLENBQUMsSUFBSSxDQUFDO1FBUXZDLENBQUM7UUFOQSx1QkFBdUIsS0FBYyxPQUFPLEtBQUssQ0FBQyxDQUFDLENBQUM7UUFDcEQsZUFBZSxLQUFjLE9BQU8sS0FBSyxDQUFDLENBQUMsQ0FBQztRQUM1Qyx5QkFBeUIsS0FBdUIsT0FBTyxPQUFPLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNoRix1QkFBdUIsQ0FBQyxvQkFBMEMsSUFBVSxDQUFDO1FBQzdFLHVCQUF1QixLQUEyQiw0Q0FBb0MsQ0FBQyxDQUFDO1FBQ3hGLEtBQUssQ0FBQyxPQUFlLElBQVUsQ0FBQztLQUNoQztJQWJELDREQWFDIn0=