/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls!vs/workbench/contrib/terminal/common/terminalContextKey", "vs/platform/contextkey/common/contextkey"], function (require, exports, nls_1, contextkey_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TerminalContextKeys = exports.TerminalContextKeyStrings = void 0;
    var TerminalContextKeyStrings;
    (function (TerminalContextKeyStrings) {
        TerminalContextKeyStrings["IsOpen"] = "terminalIsOpen";
        TerminalContextKeyStrings["Count"] = "terminalCount";
        TerminalContextKeyStrings["GroupCount"] = "terminalGroupCount";
        TerminalContextKeyStrings["TabsNarrow"] = "isTerminalTabsNarrow";
        TerminalContextKeyStrings["HasFixedWidth"] = "terminalHasFixedWidth";
        TerminalContextKeyStrings["ProcessSupported"] = "terminalProcessSupported";
        TerminalContextKeyStrings["Focus"] = "terminalFocus";
        TerminalContextKeyStrings["FocusInAny"] = "terminalFocusInAny";
        TerminalContextKeyStrings["AccessibleBufferFocus"] = "terminalAccessibleBufferFocus";
        TerminalContextKeyStrings["AccessibleBufferOnLastLine"] = "terminalAccessibleBufferOnLastLine";
        TerminalContextKeyStrings["EditorFocus"] = "terminalEditorFocus";
        TerminalContextKeyStrings["TabsFocus"] = "terminalTabsFocus";
        TerminalContextKeyStrings["WebExtensionContributedProfile"] = "terminalWebExtensionContributedProfile";
        TerminalContextKeyStrings["TerminalHasBeenCreated"] = "terminalHasBeenCreated";
        TerminalContextKeyStrings["TerminalEditorActive"] = "terminalEditorActive";
        TerminalContextKeyStrings["TabsMouse"] = "terminalTabsMouse";
        TerminalContextKeyStrings["AltBufferActive"] = "terminalAltBufferActive";
        TerminalContextKeyStrings["SuggestWidgetVisible"] = "terminalSuggestWidgetVisible";
        TerminalContextKeyStrings["A11yTreeFocus"] = "terminalA11yTreeFocus";
        TerminalContextKeyStrings["ViewShowing"] = "terminalViewShowing";
        TerminalContextKeyStrings["TextSelected"] = "terminalTextSelected";
        TerminalContextKeyStrings["TextSelectedInFocused"] = "terminalTextSelectedInFocused";
        TerminalContextKeyStrings["FindVisible"] = "terminalFindVisible";
        TerminalContextKeyStrings["FindInputFocused"] = "terminalFindInputFocused";
        TerminalContextKeyStrings["FindFocused"] = "terminalFindFocused";
        TerminalContextKeyStrings["TabsSingularSelection"] = "terminalTabsSingularSelection";
        TerminalContextKeyStrings["SplitTerminal"] = "terminalSplitTerminal";
        TerminalContextKeyStrings["ShellType"] = "terminalShellType";
        TerminalContextKeyStrings["InTerminalRunCommandPicker"] = "inTerminalRunCommandPicker";
        TerminalContextKeyStrings["TerminalShellIntegrationEnabled"] = "terminalShellIntegrationEnabled";
    })(TerminalContextKeyStrings || (exports.TerminalContextKeyStrings = TerminalContextKeyStrings = {}));
    var TerminalContextKeys;
    (function (TerminalContextKeys) {
        /** Whether there is at least one opened terminal. */
        TerminalContextKeys.isOpen = new contextkey_1.$2i("terminalIsOpen" /* TerminalContextKeyStrings.IsOpen */, false, true);
        /** Whether the terminal is focused. */
        TerminalContextKeys.focus = new contextkey_1.$2i("terminalFocus" /* TerminalContextKeyStrings.Focus */, false, (0, nls_1.localize)(0, null));
        /** Whether any terminal is focused, including detached terminals used in other UI. */
        TerminalContextKeys.focusInAny = new contextkey_1.$2i("terminalFocusInAny" /* TerminalContextKeyStrings.FocusInAny */, false, (0, nls_1.localize)(1, null));
        /** Whether a terminal in the editor area is focused. */
        TerminalContextKeys.editorFocus = new contextkey_1.$2i("terminalEditorFocus" /* TerminalContextKeyStrings.EditorFocus */, false, (0, nls_1.localize)(2, null));
        /** The current number of terminals. */
        TerminalContextKeys.count = new contextkey_1.$2i("terminalCount" /* TerminalContextKeyStrings.Count */, 0, (0, nls_1.localize)(3, null));
        /** The current number of terminal groups. */
        TerminalContextKeys.groupCount = new contextkey_1.$2i("terminalGroupCount" /* TerminalContextKeyStrings.GroupCount */, 0, true);
        /** Whether the terminal tabs view is narrow. */
        TerminalContextKeys.tabsNarrow = new contextkey_1.$2i("isTerminalTabsNarrow" /* TerminalContextKeyStrings.TabsNarrow */, false, true);
        /** Whether the terminal tabs view is narrow. */
        TerminalContextKeys.terminalHasFixedWidth = new contextkey_1.$2i("terminalHasFixedWidth" /* TerminalContextKeyStrings.HasFixedWidth */, false, true);
        /** Whether the terminal tabs widget is focused. */
        TerminalContextKeys.tabsFocus = new contextkey_1.$2i("terminalTabsFocus" /* TerminalContextKeyStrings.TabsFocus */, false, (0, nls_1.localize)(4, null));
        /** Whether a web extension has contributed a profile */
        TerminalContextKeys.webExtensionContributedProfile = new contextkey_1.$2i("terminalWebExtensionContributedProfile" /* TerminalContextKeyStrings.WebExtensionContributedProfile */, false, true);
        /** Whether at least one terminal has been created */
        TerminalContextKeys.terminalHasBeenCreated = new contextkey_1.$2i("terminalHasBeenCreated" /* TerminalContextKeyStrings.TerminalHasBeenCreated */, false, true);
        /** Whether at least one terminal has been created */
        TerminalContextKeys.terminalEditorActive = new contextkey_1.$2i("terminalEditorActive" /* TerminalContextKeyStrings.TerminalEditorActive */, false, true);
        /** Whether the mouse is within the terminal tabs list. */
        TerminalContextKeys.tabsMouse = new contextkey_1.$2i("terminalTabsMouse" /* TerminalContextKeyStrings.TabsMouse */, false, true);
        /** The shell type of the active terminal, this is set to the last known value when no terminals exist. */
        TerminalContextKeys.shellType = new contextkey_1.$2i("terminalShellType" /* TerminalContextKeyStrings.ShellType */, undefined, { type: 'string', description: (0, nls_1.localize)(5, null) });
        /** Whether the terminal's alt buffer is active. */
        TerminalContextKeys.altBufferActive = new contextkey_1.$2i("terminalAltBufferActive" /* TerminalContextKeyStrings.AltBufferActive */, false, (0, nls_1.localize)(6, null));
        /** Whether the terminal's suggest widget is visible. */
        TerminalContextKeys.suggestWidgetVisible = new contextkey_1.$2i("terminalSuggestWidgetVisible" /* TerminalContextKeyStrings.SuggestWidgetVisible */, false, (0, nls_1.localize)(7, null));
        /** Whether the terminal is NOT focused. */
        TerminalContextKeys.notFocus = TerminalContextKeys.focus.toNegated();
        /** Whether the terminal view is showing. */
        TerminalContextKeys.viewShowing = new contextkey_1.$2i("terminalViewShowing" /* TerminalContextKeyStrings.ViewShowing */, false, (0, nls_1.localize)(8, null));
        /** Whether text is selected in the active terminal. */
        TerminalContextKeys.textSelected = new contextkey_1.$2i("terminalTextSelected" /* TerminalContextKeyStrings.TextSelected */, false, (0, nls_1.localize)(9, null));
        /** Whether text is selected in a focused terminal. `textSelected` counts text selected in an active in a terminal view or an editor, where `textSelectedInFocused` simply counts text in an element with DOM focus. */
        TerminalContextKeys.textSelectedInFocused = new contextkey_1.$2i("terminalTextSelectedInFocused" /* TerminalContextKeyStrings.TextSelectedInFocused */, false, (0, nls_1.localize)(10, null));
        /** Whether text is NOT selected in the active terminal. */
        TerminalContextKeys.notTextSelected = TerminalContextKeys.textSelected.toNegated();
        /** Whether the active terminal's find widget is visible. */
        TerminalContextKeys.findVisible = new contextkey_1.$2i("terminalFindVisible" /* TerminalContextKeyStrings.FindVisible */, false, true);
        /** Whether the active terminal's find widget is NOT visible. */
        TerminalContextKeys.notFindVisible = TerminalContextKeys.findVisible.toNegated();
        /** Whether the active terminal's find widget text input is focused. */
        TerminalContextKeys.findInputFocus = new contextkey_1.$2i("terminalFindInputFocused" /* TerminalContextKeyStrings.FindInputFocused */, false, true);
        /** Whether an element within the active terminal's find widget is focused. */
        TerminalContextKeys.findFocus = new contextkey_1.$2i("terminalFindFocused" /* TerminalContextKeyStrings.FindFocused */, false, true);
        /** Whether NO elements within the active terminal's find widget is focused. */
        TerminalContextKeys.notFindFocus = TerminalContextKeys.findInputFocus.toNegated();
        /** Whether terminal processes can be launched in the current workspace. */
        TerminalContextKeys.processSupported = new contextkey_1.$2i("terminalProcessSupported" /* TerminalContextKeyStrings.ProcessSupported */, false, (0, nls_1.localize)(11, null));
        /** Whether one terminal is selected in the terminal tabs list. */
        TerminalContextKeys.tabsSingularSelection = new contextkey_1.$2i("terminalTabsSingularSelection" /* TerminalContextKeyStrings.TabsSingularSelection */, false, (0, nls_1.localize)(12, null));
        /** Whether the focused tab's terminal is a split terminal. */
        TerminalContextKeys.splitTerminal = new contextkey_1.$2i("terminalSplitTerminal" /* TerminalContextKeyStrings.SplitTerminal */, false, (0, nls_1.localize)(13, null));
        /** Whether the terminal run command picker is currently open. */
        TerminalContextKeys.inTerminalRunCommandPicker = new contextkey_1.$2i("inTerminalRunCommandPicker" /* TerminalContextKeyStrings.InTerminalRunCommandPicker */, false, (0, nls_1.localize)(14, null));
        /** Whether shell integration is enabled in the active terminal. This only considers full VS Code shell integration. */
        TerminalContextKeys.terminalShellIntegrationEnabled = new contextkey_1.$2i("terminalShellIntegrationEnabled" /* TerminalContextKeyStrings.TerminalShellIntegrationEnabled */, false, (0, nls_1.localize)(15, null));
    })(TerminalContextKeys || (exports.TerminalContextKeys = TerminalContextKeys = {}));
});
//# sourceMappingURL=terminalContextKey.js.map