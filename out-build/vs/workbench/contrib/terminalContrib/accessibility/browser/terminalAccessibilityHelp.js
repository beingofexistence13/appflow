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
define(["require", "exports", "vs/base/common/lifecycle", "vs/base/common/strings", "vs/nls!vs/workbench/contrib/terminalContrib/accessibility/browser/terminalAccessibilityHelp", "vs/platform/accessibility/common/accessibility", "vs/platform/commands/common/commands", "vs/platform/contextkey/common/contextkey", "vs/platform/instantiation/common/instantiation", "vs/platform/keybinding/common/keybinding", "vs/workbench/contrib/accessibility/browser/accessibilityConfiguration"], function (require, exports, lifecycle_1, strings_1, nls_1, accessibility_1, commands_1, contextkey_1, instantiation_1, keybinding_1, accessibilityConfiguration_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$uWb = exports.ClassName = void 0;
    var ClassName;
    (function (ClassName) {
        ClassName["Active"] = "active";
        ClassName["EditorTextArea"] = "textarea";
    })(ClassName || (exports.ClassName = ClassName = {}));
    let $uWb = class $uWb extends lifecycle_1.$kc {
        onClose() {
            const expr = contextkey_1.$Ii.and(accessibilityConfiguration_1.$jqb, contextkey_1.$Ii.equals(accessibilityConfiguration_1.$oqb.key, "terminal" /* AccessibleViewProviderId.Terminal */));
            if (expr?.evaluate(this.f.getContext(null))) {
                this.g.executeCommand("workbench.action.terminal.focusAccessibleBuffer" /* TerminalCommandId.FocusAccessibleBuffer */);
            }
            else {
                this.b.focus();
            }
            this.dispose();
        }
        constructor(b, _xterm, _instantiationService, c, f, g, h) {
            super();
            this.b = b;
            this.c = c;
            this.f = f;
            this.g = g;
            this.h = h;
            this.a = false;
            this.options = {
                type: "help" /* AccessibleViewType.Help */,
                readMoreUrl: 'https://code.visualstudio.com/docs/editor/accessibility#_terminal-accessibility'
            };
            this.verbositySettingKey = "accessibility.verbosity.terminal" /* AccessibilityVerbositySettingId.Terminal */;
            this.a = _xterm.shellIntegration.status === 2 /* ShellIntegrationStatus.VSCode */;
        }
        j(commandId, msg, noKbMsg) {
            if (commandId === "workbench.action.terminal.runRecentCommand" /* TerminalCommandId.RunRecentCommand */) {
                const kb = this.c.lookupKeybindings(commandId);
                // Run recent command has multiple keybindings. lookupKeybinding just returns the first one regardless of the when context.
                // Thus, we have to check if accessibility mode is enabled to determine which keybinding to use.
                const isScreenReaderOptimized = this.h.isScreenReaderOptimized();
                if (isScreenReaderOptimized && kb[1]) {
                    (0, strings_1.$ne)(msg, kb[1].getAriaLabel());
                }
                else if (kb[0]) {
                    (0, strings_1.$ne)(msg, kb[0].getAriaLabel());
                }
                else {
                    return (0, strings_1.$ne)(noKbMsg, commandId);
                }
            }
            const kb = this.c.lookupKeybinding(commandId, this.f)?.getAriaLabel();
            return !kb ? (0, strings_1.$ne)(noKbMsg, commandId) : (0, strings_1.$ne)(msg, kb);
        }
        provideContent() {
            const content = [];
            content.push(this.j("workbench.action.terminal.focusAccessibleBuffer" /* TerminalCommandId.FocusAccessibleBuffer */, (0, nls_1.localize)(0, null), (0, nls_1.localize)(1, null)));
            if (this.b.shellType === "cmd" /* WindowsShellType.CommandPrompt */) {
                content.push((0, nls_1.localize)(2, null));
            }
            if (this.a) {
                const shellIntegrationCommandList = [];
                shellIntegrationCommandList.push((0, nls_1.localize)(3, null));
                shellIntegrationCommandList.push('- ' + this.j("workbench.action.terminal.accessibleBufferGoToNextCommand" /* TerminalCommandId.AccessibleBufferGoToNextCommand */, (0, nls_1.localize)(4, null), (0, nls_1.localize)(5, null)));
                shellIntegrationCommandList.push('- ' + this.j("workbench.action.terminal.accessibleBufferGoToPreviousCommand" /* TerminalCommandId.AccessibleBufferGoToPreviousCommand */, (0, nls_1.localize)(6, null), (0, nls_1.localize)(7, null)));
                shellIntegrationCommandList.push('- ' + this.j("editor.action.accessibleViewGoToSymbol" /* AccessibilityCommandId.GoToSymbol */, (0, nls_1.localize)(8, null), (0, nls_1.localize)(9, null)));
                shellIntegrationCommandList.push('- ' + this.j("workbench.action.terminal.runRecentCommand" /* TerminalCommandId.RunRecentCommand */, (0, nls_1.localize)(10, null), (0, nls_1.localize)(11, null)));
                shellIntegrationCommandList.push('- ' + this.j("workbench.action.terminal.goToRecentDirectory" /* TerminalCommandId.GoToRecentDirectory */, (0, nls_1.localize)(12, null), (0, nls_1.localize)(13, null)));
                content.push(shellIntegrationCommandList.join('\n'));
            }
            else {
                content.push(this.j("workbench.action.terminal.runRecentCommand" /* TerminalCommandId.RunRecentCommand */, (0, nls_1.localize)(14, null), (0, nls_1.localize)(15, null)));
            }
            content.push(this.j("workbench.action.terminal.openDetectedLink" /* TerminalCommandId.OpenDetectedLink */, (0, nls_1.localize)(16, null), (0, nls_1.localize)(17, null)));
            content.push(this.j("workbench.action.terminal.newWithProfile" /* TerminalCommandId.NewWithProfile */, (0, nls_1.localize)(18, null), (0, nls_1.localize)(19, null)));
            content.push((0, nls_1.localize)(20, null, "terminal.integrated.focusAfterRun" /* TerminalSettingId.FocusAfterRun */));
            content.push((0, nls_1.localize)(21, null));
            return content.join('\n\n');
        }
    };
    exports.$uWb = $uWb;
    exports.$uWb = $uWb = __decorate([
        __param(2, instantiation_1.$Ah),
        __param(3, keybinding_1.$2D),
        __param(4, contextkey_1.$3i),
        __param(5, commands_1.$Fr),
        __param(6, accessibility_1.$1r)
    ], $uWb);
});
//# sourceMappingURL=terminalAccessibilityHelp.js.map