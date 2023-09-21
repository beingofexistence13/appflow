/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", "vs/base/common/lifecycle", "vs/base/common/strings", "vs/nls", "vs/platform/accessibility/common/accessibility", "vs/platform/commands/common/commands", "vs/platform/contextkey/common/contextkey", "vs/platform/instantiation/common/instantiation", "vs/platform/keybinding/common/keybinding", "vs/workbench/contrib/accessibility/browser/accessibilityConfiguration"], function (require, exports, lifecycle_1, strings_1, nls_1, accessibility_1, commands_1, contextkey_1, instantiation_1, keybinding_1, accessibilityConfiguration_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TerminalAccessibleContentProvider = exports.ClassName = void 0;
    var ClassName;
    (function (ClassName) {
        ClassName["Active"] = "active";
        ClassName["EditorTextArea"] = "textarea";
    })(ClassName || (exports.ClassName = ClassName = {}));
    let TerminalAccessibleContentProvider = class TerminalAccessibleContentProvider extends lifecycle_1.Disposable {
        onClose() {
            const expr = contextkey_1.ContextKeyExpr.and(accessibilityConfiguration_1.accessibleViewIsShown, contextkey_1.ContextKeyExpr.equals(accessibilityConfiguration_1.accessibleViewCurrentProviderId.key, "terminal" /* AccessibleViewProviderId.Terminal */));
            if (expr?.evaluate(this._contextKeyService.getContext(null))) {
                this._commandService.executeCommand("workbench.action.terminal.focusAccessibleBuffer" /* TerminalCommandId.FocusAccessibleBuffer */);
            }
            else {
                this._instance.focus();
            }
            this.dispose();
        }
        constructor(_instance, _xterm, _instantiationService, _keybindingService, _contextKeyService, _commandService, _accessibilityService) {
            super();
            this._instance = _instance;
            this._keybindingService = _keybindingService;
            this._contextKeyService = _contextKeyService;
            this._commandService = _commandService;
            this._accessibilityService = _accessibilityService;
            this._hasShellIntegration = false;
            this.options = {
                type: "help" /* AccessibleViewType.Help */,
                readMoreUrl: 'https://code.visualstudio.com/docs/editor/accessibility#_terminal-accessibility'
            };
            this.verbositySettingKey = "accessibility.verbosity.terminal" /* AccessibilityVerbositySettingId.Terminal */;
            this._hasShellIntegration = _xterm.shellIntegration.status === 2 /* ShellIntegrationStatus.VSCode */;
        }
        _descriptionForCommand(commandId, msg, noKbMsg) {
            if (commandId === "workbench.action.terminal.runRecentCommand" /* TerminalCommandId.RunRecentCommand */) {
                const kb = this._keybindingService.lookupKeybindings(commandId);
                // Run recent command has multiple keybindings. lookupKeybinding just returns the first one regardless of the when context.
                // Thus, we have to check if accessibility mode is enabled to determine which keybinding to use.
                const isScreenReaderOptimized = this._accessibilityService.isScreenReaderOptimized();
                if (isScreenReaderOptimized && kb[1]) {
                    (0, strings_1.format)(msg, kb[1].getAriaLabel());
                }
                else if (kb[0]) {
                    (0, strings_1.format)(msg, kb[0].getAriaLabel());
                }
                else {
                    return (0, strings_1.format)(noKbMsg, commandId);
                }
            }
            const kb = this._keybindingService.lookupKeybinding(commandId, this._contextKeyService)?.getAriaLabel();
            return !kb ? (0, strings_1.format)(noKbMsg, commandId) : (0, strings_1.format)(msg, kb);
        }
        provideContent() {
            const content = [];
            content.push(this._descriptionForCommand("workbench.action.terminal.focusAccessibleBuffer" /* TerminalCommandId.FocusAccessibleBuffer */, (0, nls_1.localize)('focusAccessibleBuffer', 'The Focus Accessible Buffer ({0}) command enables screen readers to read terminal contents.'), (0, nls_1.localize)('focusAccessibleBufferNoKb', 'The Focus Accessible Buffer command enables screen readers to read terminal contents and is currently not triggerable by a keybinding.')));
            if (this._instance.shellType === "cmd" /* WindowsShellType.CommandPrompt */) {
                content.push((0, nls_1.localize)('commandPromptMigration', "Consider using powershell instead of command prompt for an improved experience"));
            }
            if (this._hasShellIntegration) {
                const shellIntegrationCommandList = [];
                shellIntegrationCommandList.push((0, nls_1.localize)('shellIntegration', "The terminal has a feature called shell integration that offers an enhanced experience and provides useful commands for screen readers such as:"));
                shellIntegrationCommandList.push('- ' + this._descriptionForCommand("workbench.action.terminal.accessibleBufferGoToNextCommand" /* TerminalCommandId.AccessibleBufferGoToNextCommand */, (0, nls_1.localize)('goToNextCommand', 'Go to Next Command ({0})'), (0, nls_1.localize)('goToNextCommandNoKb', 'Go to Next Command is currently not triggerable by a keybinding.')));
                shellIntegrationCommandList.push('- ' + this._descriptionForCommand("workbench.action.terminal.accessibleBufferGoToPreviousCommand" /* TerminalCommandId.AccessibleBufferGoToPreviousCommand */, (0, nls_1.localize)('goToPreviousCommand', 'Go to Previous Command ({0})'), (0, nls_1.localize)('goToPreviousCommandNoKb', 'Go to Previous Command is currently not triggerable by a keybinding.')));
                shellIntegrationCommandList.push('- ' + this._descriptionForCommand("editor.action.accessibleViewGoToSymbol" /* AccessibilityCommandId.GoToSymbol */, (0, nls_1.localize)('goToSymbol', 'Go to Symbol ({0})'), (0, nls_1.localize)('goToSymbolNoKb', 'Go to symbol is currently not triggerable by a keybinding.')));
                shellIntegrationCommandList.push('- ' + this._descriptionForCommand("workbench.action.terminal.runRecentCommand" /* TerminalCommandId.RunRecentCommand */, (0, nls_1.localize)('runRecentCommand', 'Run Recent Command ({0})'), (0, nls_1.localize)('runRecentCommandNoKb', 'Run Recent Command is currently not triggerable by a keybinding.')));
                shellIntegrationCommandList.push('- ' + this._descriptionForCommand("workbench.action.terminal.goToRecentDirectory" /* TerminalCommandId.GoToRecentDirectory */, (0, nls_1.localize)('goToRecentDirectory', 'Go to Recent Directory ({0})'), (0, nls_1.localize)('goToRecentDirectoryNoKb', 'Go to Recent Directory is currently not triggerable by a keybinding.')));
                content.push(shellIntegrationCommandList.join('\n'));
            }
            else {
                content.push(this._descriptionForCommand("workbench.action.terminal.runRecentCommand" /* TerminalCommandId.RunRecentCommand */, (0, nls_1.localize)('goToRecentDirectoryNoShellIntegration', 'The Go to Recent Directory command ({0}) enables screen readers to easily navigate to a directory that has been used in the terminal.'), (0, nls_1.localize)('goToRecentDirectoryNoKbNoShellIntegration', 'The Go to Recent Directory command enables screen readers to easily navigate to a directory that has been used in the terminal and is currently not triggerable by a keybinding.')));
            }
            content.push(this._descriptionForCommand("workbench.action.terminal.openDetectedLink" /* TerminalCommandId.OpenDetectedLink */, (0, nls_1.localize)('openDetectedLink', 'The Open Detected Link ({0}) command enables screen readers to easily open links found in the terminal.'), (0, nls_1.localize)('openDetectedLinkNoKb', 'The Open Detected Link command enables screen readers to easily open links found in the terminal and is currently not triggerable by a keybinding.')));
            content.push(this._descriptionForCommand("workbench.action.terminal.newWithProfile" /* TerminalCommandId.NewWithProfile */, (0, nls_1.localize)('newWithProfile', 'The Create New Terminal (With Profile) ({0}) command allows for easy terminal creation using a specific profile.'), (0, nls_1.localize)('newWithProfileNoKb', 'The Create New Terminal (With Profile) command allows for easy terminal creation using a specific profile and is currently not triggerable by a keybinding.')));
            content.push((0, nls_1.localize)('focusAfterRun', 'Configure what gets focused after running selected text in the terminal with `{0}`.', "terminal.integrated.focusAfterRun" /* TerminalSettingId.FocusAfterRun */));
            content.push((0, nls_1.localize)('accessibilitySettings', 'Access accessibility settings such as `terminal.integrated.tabFocusMode` via the Preferences: Open Accessibility Settings command.'));
            return content.join('\n\n');
        }
    };
    exports.TerminalAccessibleContentProvider = TerminalAccessibleContentProvider;
    exports.TerminalAccessibleContentProvider = TerminalAccessibleContentProvider = __decorate([
        __param(2, instantiation_1.IInstantiationService),
        __param(3, keybinding_1.IKeybindingService),
        __param(4, contextkey_1.IContextKeyService),
        __param(5, commands_1.ICommandService),
        __param(6, accessibility_1.IAccessibilityService)
    ], TerminalAccessibleContentProvider);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVybWluYWxBY2Nlc3NpYmlsaXR5SGVscC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL3Rlcm1pbmFsQ29udHJpYi9hY2Nlc3NpYmlsaXR5L2Jyb3dzZXIvdGVybWluYWxBY2Nlc3NpYmlsaXR5SGVscC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUFrQmhHLElBQWtCLFNBR2pCO0lBSEQsV0FBa0IsU0FBUztRQUMxQiw4QkFBaUIsQ0FBQTtRQUNqQix3Q0FBMkIsQ0FBQTtJQUM1QixDQUFDLEVBSGlCLFNBQVMseUJBQVQsU0FBUyxRQUcxQjtJQUVNLElBQU0saUNBQWlDLEdBQXZDLE1BQU0saUNBQWtDLFNBQVEsc0JBQVU7UUFJaEUsT0FBTztZQUNOLE1BQU0sSUFBSSxHQUFHLDJCQUFjLENBQUMsR0FBRyxDQUFDLGtEQUFxQixFQUFFLDJCQUFjLENBQUMsTUFBTSxDQUFDLDREQUErQixDQUFDLEdBQUcscURBQW9DLENBQUMsQ0FBQztZQUN0SixJQUFJLElBQUksRUFBRSxRQUFRLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFO2dCQUM3RCxJQUFJLENBQUMsZUFBZSxDQUFDLGNBQWMsaUdBQXlDLENBQUM7YUFDN0U7aUJBQU07Z0JBQ04sSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLEVBQUUsQ0FBQzthQUN2QjtZQUNELElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUNoQixDQUFDO1FBT0QsWUFDa0IsU0FBNkcsRUFDOUgsTUFBZ0YsRUFDekQscUJBQTRDLEVBQy9DLGtCQUF1RCxFQUN2RCxrQkFBdUQsRUFDMUQsZUFBaUQsRUFDM0MscUJBQTZEO1lBRXBGLEtBQUssRUFBRSxDQUFDO1lBUlMsY0FBUyxHQUFULFNBQVMsQ0FBb0c7WUFHekYsdUJB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