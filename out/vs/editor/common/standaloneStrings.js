/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls"], function (require, exports, nls) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.StandaloneServicesNLS = exports.ToggleHighContrastNLS = exports.StandaloneCodeEditorNLS = exports.QuickOutlineNLS = exports.QuickCommandNLS = exports.QuickHelpNLS = exports.GoToLineNLS = exports.InspectTokensNLS = exports.AccessibilityHelpNLS = void 0;
    var AccessibilityHelpNLS;
    (function (AccessibilityHelpNLS) {
        AccessibilityHelpNLS.accessibilityHelpTitle = nls.localize('accessibilityHelpTitle', "Accessibility Help");
        AccessibilityHelpNLS.openingDocs = nls.localize("openingDocs", "Now opening the Accessibility documentation page.");
        AccessibilityHelpNLS.readonlyDiffEditor = nls.localize("readonlyDiffEditor", "You are in a read-only pane of a diff editor.");
        AccessibilityHelpNLS.editableDiffEditor = nls.localize("editableDiffEditor", "You are in a pane of a diff editor.");
        AccessibilityHelpNLS.readonlyEditor = nls.localize("readonlyEditor", "You are in a read-only code editor.");
        AccessibilityHelpNLS.editableEditor = nls.localize("editableEditor", "You are in a code editor.");
        AccessibilityHelpNLS.changeConfigToOnMac = nls.localize("changeConfigToOnMac", "To configure the application to be optimized for usage with a Screen Reader press Command+E now.");
        AccessibilityHelpNLS.changeConfigToOnWinLinux = nls.localize("changeConfigToOnWinLinux", "To configure the application to be optimized for usage with a Screen Reader press Control+E now.");
        AccessibilityHelpNLS.auto_on = nls.localize("auto_on", "The application is configured to be optimized for usage with a Screen Reader.");
        AccessibilityHelpNLS.auto_off = nls.localize("auto_off", "The application is configured to never be optimized for usage with a Screen Reader.");
        AccessibilityHelpNLS.screenReaderModeEnabled = nls.localize("screenReaderModeEnabled", "Screen Reader Optimized Mode enabled.");
        AccessibilityHelpNLS.screenReaderModeDisabled = nls.localize("screenReaderModeDisabled", "Screen Reader Optimized Mode disabled.");
        AccessibilityHelpNLS.tabFocusModeOnMsg = nls.localize("tabFocusModeOnMsg", "Pressing Tab in the current editor will move focus to the next focusable element. Toggle this behavior by pressing {0}.");
        AccessibilityHelpNLS.tabFocusModeOnMsgNoKb = nls.localize("tabFocusModeOnMsgNoKb", "Pressing Tab in the current editor will move focus to the next focusable element. The command {0} is currently not triggerable by a keybinding.");
        AccessibilityHelpNLS.stickScrollKb = nls.localize("stickScrollKb", "Run the command: Focus Sticky Scroll ({0}) to focus the currently nested scopes.");
        AccessibilityHelpNLS.stickScrollNoKb = nls.localize("stickScrollNoKb", "Run the command: Focus Sticky Scroll to focus the currently nested scopes. It is currently not triggerable by a keybinding.");
        AccessibilityHelpNLS.tabFocusModeOffMsg = nls.localize("tabFocusModeOffMsg", "Pressing Tab in the current editor will insert the tab character. Toggle this behavior by pressing {0}.");
        AccessibilityHelpNLS.tabFocusModeOffMsgNoKb = nls.localize("tabFocusModeOffMsgNoKb", "Pressing Tab in the current editor will insert the tab character. The command {0} is currently not triggerable by a keybinding.");
        AccessibilityHelpNLS.showAccessibilityHelpAction = nls.localize("showAccessibilityHelpAction", "Show Accessibility Help");
    })(AccessibilityHelpNLS || (exports.AccessibilityHelpNLS = AccessibilityHelpNLS = {}));
    var InspectTokensNLS;
    (function (InspectTokensNLS) {
        InspectTokensNLS.inspectTokensAction = nls.localize('inspectTokens', "Developer: Inspect Tokens");
    })(InspectTokensNLS || (exports.InspectTokensNLS = InspectTokensNLS = {}));
    var GoToLineNLS;
    (function (GoToLineNLS) {
        GoToLineNLS.gotoLineActionLabel = nls.localize('gotoLineActionLabel', "Go to Line/Column...");
    })(GoToLineNLS || (exports.GoToLineNLS = GoToLineNLS = {}));
    var QuickHelpNLS;
    (function (QuickHelpNLS) {
        QuickHelpNLS.helpQuickAccessActionLabel = nls.localize('helpQuickAccess', "Show all Quick Access Providers");
    })(QuickHelpNLS || (exports.QuickHelpNLS = QuickHelpNLS = {}));
    var QuickCommandNLS;
    (function (QuickCommandNLS) {
        QuickCommandNLS.quickCommandActionLabel = nls.localize('quickCommandActionLabel', "Command Palette");
        QuickCommandNLS.quickCommandHelp = nls.localize('quickCommandActionHelp', "Show And Run Commands");
    })(QuickCommandNLS || (exports.QuickCommandNLS = QuickCommandNLS = {}));
    var QuickOutlineNLS;
    (function (QuickOutlineNLS) {
        QuickOutlineNLS.quickOutlineActionLabel = nls.localize('quickOutlineActionLabel', "Go to Symbol...");
        QuickOutlineNLS.quickOutlineByCategoryActionLabel = nls.localize('quickOutlineByCategoryActionLabel', "Go to Symbol by Category...");
    })(QuickOutlineNLS || (exports.QuickOutlineNLS = QuickOutlineNLS = {}));
    var StandaloneCodeEditorNLS;
    (function (StandaloneCodeEditorNLS) {
        StandaloneCodeEditorNLS.editorViewAccessibleLabel = nls.localize('editorViewAccessibleLabel', "Editor content");
        StandaloneCodeEditorNLS.accessibilityHelpMessage = nls.localize('accessibilityHelpMessage', "Press Alt+F1 for Accessibility Options.");
    })(StandaloneCodeEditorNLS || (exports.StandaloneCodeEditorNLS = StandaloneCodeEditorNLS = {}));
    var ToggleHighContrastNLS;
    (function (ToggleHighContrastNLS) {
        ToggleHighContrastNLS.toggleHighContrast = nls.localize('toggleHighContrast', "Toggle High Contrast Theme");
    })(ToggleHighContrastNLS || (exports.ToggleHighContrastNLS = ToggleHighContrastNLS = {}));
    var StandaloneServicesNLS;
    (function (StandaloneServicesNLS) {
        StandaloneServicesNLS.bulkEditServiceSummary = nls.localize('bulkEditServiceSummary', "Made {0} edits in {1} files");
    })(StandaloneServicesNLS || (exports.StandaloneServicesNLS = StandaloneServicesNLS = {}));
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RhbmRhbG9uZVN0cmluZ3MuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9lZGl0b3IvY29tbW9uL3N0YW5kYWxvbmVTdHJpbmdzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQUloRyxJQUFpQixvQkFBb0IsQ0FvQnBDO0lBcEJELFdBQWlCLG9CQUFvQjtRQUN2QiwyQ0FBc0IsR0FBRyxHQUFHLENBQUMsUUFBUSxDQUFDLHdCQUF3QixFQUFFLG9CQUFvQixDQUFDLENBQUM7UUFDdEYsZ0NBQVcsR0FBRyxHQUFHLENBQUMsUUFBUSxDQUFDLGFBQWEsRUFBRSxtREFBbUQsQ0FBQyxDQUFDO1FBQy9GLHVDQUFrQixHQUFHLEdBQUcsQ0FBQyxRQUFRLENBQUMsb0JBQW9CLEVBQUUsK0NBQStDLENBQUMsQ0FBQztRQUN6Ryx1Q0FBa0IsR0FBRyxHQUFHLENBQUMsUUFBUSxDQUFDLG9CQUFvQixFQUFFLHFDQUFxQyxDQUFDLENBQUM7UUFDL0YsbUNBQWMsR0FBRyxHQUFHLENBQUMsUUFBUSxDQUFDLGdCQUFnQixFQUFFLHFDQUFxQyxDQUFDLENBQUM7UUFDdkYsbUNBQWMsR0FBRyxHQUFHLENBQUMsUUFBUSxDQUFDLGdCQUFnQixFQUFFLDJCQUEyQixDQUFDLENBQUM7UUFDN0Usd0NBQW1CLEdBQUcsR0FBRyxDQUFDLFFBQVEsQ0FBQyxxQkFBcUIsRUFBRSxrR0FBa0csQ0FBQyxDQUFDO1FBQzlKLDZDQUF3QixHQUFHLEdBQUcsQ0FBQyxRQUFRLENBQUMsMEJBQTBCLEVBQUUsa0dBQWtHLENBQUMsQ0FBQztRQUN4Syw0QkFBTyxHQUFHLEdBQUcsQ0FBQyxRQUFRLENBQUMsU0FBUyxFQUFFLCtFQUErRSxDQUFDLENBQUM7UUFDbkgsNkJBQVEsR0FBRyxHQUFHLENBQUMsUUFBUSxDQUFDLFVBQVUsRUFBRSxxRkFBcUYsQ0FBQyxDQUFDO1FBQzNILDRDQUF1QixH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