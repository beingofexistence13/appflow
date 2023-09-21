/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls", "vs/platform/contextkey/common/contextkey"], function (require, exports, nls_1, contextkey_1) {
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
        TerminalContextKeys.isOpen = new contextkey_1.RawContextKey("terminalIsOpen" /* TerminalContextKeyStrings.IsOpen */, false, true);
        /** Whether the terminal is focused. */
        TerminalContextKeys.focus = new contextkey_1.RawContextKey("terminalFocus" /* TerminalContextKeyStrings.Focus */, false, (0, nls_1.localize)('terminalFocusContextKey', "Whether the terminal is focused."));
        /** Whether any terminal is focused, including detached terminals used in other UI. */
        TerminalContextKeys.focusInAny = new contextkey_1.RawContextKey("terminalFocusInAny" /* TerminalContextKeyStrings.FocusInAny */, false, (0, nls_1.localize)('terminalFocusInAnyContextKey', "Whether any terminal is focused, including detached terminals used in other UI."));
        /** Whether a terminal in the editor area is focused. */
        TerminalContextKeys.editorFocus = new contextkey_1.RawContextKey("terminalEditorFocus" /* TerminalContextKeyStrings.EditorFocus */, false, (0, nls_1.localize)('terminalEditorFocusContextKey', "Whether a terminal in the editor area is focused."));
        /** The current number of terminals. */
        TerminalContextKeys.count = new contextkey_1.RawContextKey("terminalCount" /* TerminalContextKeyStrings.Count */, 0, (0, nls_1.localize)('terminalCountContextKey', "The current number of terminals."));
        /** The current number of terminal groups. */
        TerminalContextKeys.groupCount = new contextkey_1.RawContextKey("terminalGroupCount" /* TerminalContextKeyStrings.GroupCount */, 0, true);
        /** Whether the terminal tabs view is narrow. */
        TerminalContextKeys.tabsNarrow = new contextkey_1.RawContextKey("isTerminalTabsNarrow" /* TerminalContextKeyStrings.TabsNarrow */, false, true);
        /** Whether the terminal tabs view is narrow. */
        TerminalContextKeys.terminalHasFixedWidth = new contextkey_1.RawContextKey("terminalHasFixedWidth" /* TerminalContextKeyStrings.HasFixedWidth */, false, true);
        /** Whether the terminal tabs widget is focused. */
        TerminalContextKeys.tabsFocus = new contextkey_1.RawContextKey("terminalTabsFocus" /* TerminalContextKeyStrings.TabsFocus */, false, (0, nls_1.localize)('terminalTabsFocusContextKey', "Whether the terminal tabs widget is focused."));
        /** Whether a web extension has contributed a profile */
        TerminalContextKeys.webExtensionContributedProfile = new contextkey_1.RawContextKey("terminalWebExtensionContributedProfile" /* TerminalContextKeyStrings.WebExtensionContributedProfile */, false, true);
        /** Whether at least one terminal has been created */
        TerminalContextKeys.terminalHasBeenCreated = new contextkey_1.RawContextKey("terminalHasBeenCreated" /* TerminalContextKeyStrings.TerminalHasBeenCreated */, false, true);
        /** Whether at least one terminal has been created */
        TerminalContextKeys.terminalEditorActive = new contextkey_1.RawContextKey("terminalEditorActive" /* TerminalContextKeyStrings.TerminalEditorActive */, false, true);
        /** Whether the mouse is within the terminal tabs list. */
        TerminalContextKeys.tabsMouse = new contextkey_1.RawContextKey("terminalTabsMouse" /* TerminalContextKeyStrings.TabsMouse */, false, true);
        /** The shell type of the active terminal, this is set to the last known value when no terminals exist. */
        TerminalContextKeys.shellType = new contextkey_1.RawContextKey("terminalShellType" /* TerminalContextKeyStrings.ShellType */, undefined, { type: 'string', description: (0, nls_1.localize)('terminalShellTypeContextKey', "The shell type of the active terminal, this is set to the last known value when no terminals exist.") });
        /** Whether the terminal's alt buffer is active. */
        TerminalContextKeys.altBufferActive = new contextkey_1.RawContextKey("terminalAltBufferActive" /* TerminalContextKeyStrings.AltBufferActive */, false, (0, nls_1.localize)('terminalAltBufferActive', "Whether the terminal's alt buffer is active."));
        /** Whether the terminal's suggest widget is visible. */
        TerminalContextKeys.suggestWidgetVisible = new contextkey_1.RawContextKey("terminalSuggestWidgetVisible" /* TerminalContextKeyStrings.SuggestWidgetVisible */, false, (0, nls_1.localize)('terminalSuggestWidgetVisible', "Whether the terminal's suggest widget is visible."));
        /** Whether the terminal is NOT focused. */
        TerminalContextKeys.notFocus = TerminalContextKeys.focus.toNegated();
        /** Whether the terminal view is showing. */
        TerminalContextKeys.viewShowing = new contextkey_1.RawContextKey("terminalViewShowing" /* TerminalContextKeyStrings.ViewShowing */, false, (0, nls_1.localize)('terminalViewShowing', "Whether the terminal view is showing"));
        /** Whether text is selected in the active terminal. */
        TerminalContextKeys.textSelected = new contextkey_1.RawContextKey("terminalTextSelected" /* TerminalContextKeyStrings.TextSelected */, false, (0, nls_1.localize)('terminalTextSelectedContextKey', "Whether text is selected in the active terminal."));
        /** Whether text is selected in a focused terminal. `textSelected` counts text selected in an active in a terminal view or an editor, where `textSelectedInFocused` simply counts text in an element with DOM focus. */
        TerminalContextKeys.textSelectedInFocused = new contextkey_1.RawContextKey("terminalTextSelectedInFocused" /* TerminalContextKeyStrings.TextSelectedInFocused */, false, (0, nls_1.localize)('terminalTextSelectedInFocusedContextKey', "Whether text is selected in a focused terminal."));
        /** Whether text is NOT selected in the active terminal. */
        TerminalContextKeys.notTextSelected = TerminalContextKeys.textSelected.toNegated();
        /** Whether the active terminal's find widget is visible. */
        TerminalContextKeys.findVisible = new contextkey_1.RawContextKey("terminalFindVisible" /* TerminalContextKeyStrings.FindVisible */, false, true);
        /** Whether the active terminal's find widget is NOT visible. */
        TerminalContextKeys.notFindVisible = TerminalContextKeys.findVisible.toNegated();
        /** Whether the active terminal's find widget text input is focused. */
        TerminalContextKeys.findInputFocus = new contextkey_1.RawContextKey("terminalFindInputFocused" /* TerminalContextKeyStrings.FindInputFocused */, false, true);
        /** Whether an element within the active terminal's find widget is focused. */
        TerminalContextKeys.findFocus = new contextkey_1.RawContextKey("terminalFindFocused" /* TerminalContextKeyStrings.FindFocused */, false, true);
        /** Whether NO elements within the active terminal's find widget is focused. */
        TerminalContextKeys.notFindFocus = TerminalContextKeys.findInputFocus.toNegated();
        /** Whether terminal processes can be launched in the current workspace. */
        TerminalContextKeys.processSupported = new contextkey_1.RawContextKey("terminalProcessSupported" /* TerminalContextKeyStrings.ProcessSupported */, false, (0, nls_1.localize)('terminalProcessSupportedContextKey', "Whether terminal processes can be launched in the current workspace."));
        /** Whether one terminal is selected in the terminal tabs list. */
        TerminalContextKeys.tabsSingularSelection = new contextkey_1.RawContextKey("terminalTabsSingularSelection" /* TerminalContextKeyStrings.TabsSingularSelection */, false, (0, nls_1.localize)('terminalTabsSingularSelectedContextKey', "Whether one terminal is selected in the terminal tabs list."));
        /** Whether the focused tab's terminal is a split terminal. */
        TerminalContextKeys.splitTerminal = new contextkey_1.RawContextKey("terminalSplitTerminal" /* TerminalContextKeyStrings.SplitTerminal */, false, (0, nls_1.localize)('isSplitTerminalContextKey', "Whether the focused tab's terminal is a split terminal."));
        /** Whether the terminal run command picker is currently open. */
        TerminalContextKeys.inTerminalRunCommandPicker = new contextkey_1.RawContextKey("inTerminalRunCommandPicker" /* TerminalContextKeyStrings.InTerminalRunCommandPicker */, false, (0, nls_1.localize)('inTerminalRunCommandPickerContextKey', "Whether the terminal run command picker is currently open."));
        /** Whether shell integration is enabled in the active terminal. This only considers full VS Code shell integration. */
        TerminalContextKeys.terminalShellIntegrationEnabled = new contextkey_1.RawContextKey("terminalShellIntegrationEnabled" /* TerminalContextKeyStrings.TerminalShellIntegrationEnabled */, false, (0, nls_1.localize)('terminalShellIntegrationEnabled', "Whether shell integration is enabled in the active terminal"));
    })(TerminalContextKeys || (exports.TerminalContextKeys = TerminalContextKeys = {}));
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVybWluYWxDb250ZXh0S2V5LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvdGVybWluYWwvY29tbW9uL3Rlcm1pbmFsQ29udGV4dEtleS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFLaEcsSUFBa0IseUJBK0JqQjtJQS9CRCxXQUFrQix5QkFBeUI7UUFDMUMsc0RBQXlCLENBQUE7UUFDekIsb0RBQXVCLENBQUE7UUFDdkIsOERBQWlDLENBQUE7UUFDakMsZ0VBQW1DLENBQUE7UUFDbkMsb0VBQXVDLENBQUE7UUFDdkMsMEVBQTZDLENBQUE7UUFDN0Msb0RBQXVCLENBQUE7UUFDdkIsOERBQWlDLENBQUE7UUFDakMsb0ZBQXVELENBQUE7UUFDdkQsOEZBQWlFLENBQUE7UUFDakUsZ0VBQW1DLENBQUE7UUFDbkMsNERBQStCLENBQUE7UUFDL0Isc0dBQXlFLENBQUE7UUFDekUsOEVBQWlELENBQUE7UUFDakQsMEVBQTZDLENBQUE7UUFDN0MsNERBQStCLENBQUE7UUFDL0Isd0VBQTJDLENBQUE7UUFDM0Msa0ZBQXFELENBQUE7UUFDckQsb0VBQXVDLENBQUE7UUFDdkMsZ0VBQW1DLENBQUE7UUFDbkMsa0VBQXFDLENBQUE7UUFDckMsb0ZBQXVELENBQUE7UUFDdkQsZ0VBQW1DLENBQUE7UUFDbkMsMEVBQTZDLENBQUE7UUFDN0MsZ0VBQW1DLENBQUE7UUFDbkMsb0ZBQXVELENBQUE7UUFDdkQsb0VBQXVDLENBQUE7UUFDdkMsNERBQStCLENBQUE7UUFDL0Isc0ZBQXlELENBQUE7UUFDekQsZ0dBQW1FLENBQUE7SUFDcEUsQ0FBQyxFQS9CaUIseUJBQXlCLHlDQUF6Qix5QkFBeUIsUUErQjFDO0lBRUQsSUFBaUIsbUJBQW1CLENBNkZuQztJQTdGRCxXQUFpQixtQkFBbUI7UUFDbkMscURBQXFEO1FBQ3hDLDBCQUFNLEdB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