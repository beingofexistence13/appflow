/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.AccessibilityCommandId = void 0;
    var AccessibilityCommandId;
    (function (AccessibilityCommandId) {
        AccessibilityCommandId["OpenAccessibleView"] = "editor.action.accessibleView";
        AccessibilityCommandId["OpenAccessibilityHelp"] = "editor.action.accessibilityHelp";
        AccessibilityCommandId["DisableVerbosityHint"] = "editor.action.accessibleViewDisableHint";
        AccessibilityCommandId["GoToSymbol"] = "editor.action.accessibleViewGoToSymbol";
        AccessibilityCommandId["ShowNext"] = "editor.action.accessibleViewNext";
        AccessibilityCommandId["ShowPrevious"] = "editor.action.accessibleViewPrevious";
        AccessibilityCommandId["AccessibleViewAcceptInlineCompletion"] = "editor.action.accessibleViewAcceptInlineCompletion";
    })(AccessibilityCommandId || (exports.AccessibilityCommandId = AccessibilityCommandId = {}));
});
//# sourceMappingURL=accessibilityCommands.js.map