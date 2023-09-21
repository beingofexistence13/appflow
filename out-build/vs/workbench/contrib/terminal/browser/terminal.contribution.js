/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls!vs/workbench/contrib/terminal/browser/terminal.contribution", "vs/base/common/uri", "vs/platform/commands/common/commands", "vs/platform/contextkey/common/contextkey", "vs/platform/keybinding/common/keybindingsRegistry", "vs/platform/registry/common/platform", "vs/workbench/browser/quickaccess", "vs/workbench/common/views", "vs/platform/dnd/browser/dnd", "vs/workbench/contrib/terminal/browser/terminalActions", "vs/workbench/contrib/terminal/browser/terminalView", "vs/workbench/contrib/terminal/common/terminal", "vs/workbench/contrib/terminal/common/terminalColorRegistry", "vs/workbench/contrib/terminal/browser/terminalCommands", "vs/workbench/contrib/terminal/browser/terminalService", "vs/platform/instantiation/common/extensions", "vs/workbench/contrib/terminal/browser/terminal", "vs/platform/instantiation/common/descriptors", "vs/workbench/browser/parts/views/viewPaneContainer", "vs/platform/quickinput/common/quickAccess", "vs/workbench/contrib/terminal/browser/terminalQuickAccess", "vs/workbench/contrib/terminal/common/terminalConfiguration", "vs/platform/accessibility/common/accessibility", "vs/workbench/contrib/terminal/browser/terminalIcons", "vs/platform/terminal/common/terminal", "vs/base/common/platform", "vs/workbench/contrib/terminal/browser/terminalMenus", "vs/workbench/contrib/terminal/browser/terminalInstanceService", "vs/platform/terminal/common/terminalPlatformConfiguration", "vs/workbench/common/editor", "vs/workbench/browser/editor", "vs/workbench/contrib/terminal/browser/terminalEditor", "vs/workbench/contrib/terminal/browser/terminalEditorInput", "vs/workbench/contrib/terminal/common/terminalStrings", "vs/workbench/contrib/terminal/browser/terminalEditorService", "vs/workbench/contrib/terminal/browser/terminalEditorSerializer", "vs/workbench/contrib/terminal/browser/terminalGroupService", "vs/workbench/contrib/terminal/common/terminalContextKey", "vs/workbench/contrib/terminal/browser/terminalProfileService", "vs/workbench/common/contributions", "vs/workbench/contrib/terminal/browser/remoteTerminalBackend", "vs/workbench/contrib/terminal/browser/terminalMainContribution", "vs/base/common/network", "vs/platform/terminal/common/terminalLogService", "vs/css!./media/scrollbar", "vs/css!./media/widgets", "vs/css!./media/xterm", "vs/css!./media/terminal"], function (require, exports, nls, uri_1, commands_1, contextkey_1, keybindingsRegistry_1, platform_1, quickaccess_1, views_1, dnd_1, terminalActions_1, terminalView_1, terminal_1, terminalColorRegistry_1, terminalCommands_1, terminalService_1, extensions_1, terminal_2, descriptors_1, viewPaneContainer_1, quickAccess_1, terminalQuickAccess_1, terminalConfiguration_1, accessibility_1, terminalIcons_1, terminal_3, platform_2, terminalMenus_1, terminalInstanceService_1, terminalPlatformConfiguration_1, editor_1, editor_2, terminalEditor_1, terminalEditorInput_1, terminalStrings_1, terminalEditorService_1, terminalEditorSerializer_1, terminalGroupService_1, terminalContextKey_1, terminalProfileService_1, contributions_1, remoteTerminalBackend_1, terminalMainContribution_1, network_1, terminalLogService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    // Register services
    (0, extensions_1.$mr)(terminal_3.$Zq, terminalLogService_1.$rWb, 1 /* InstantiationType.Delayed */);
    (0, extensions_1.$mr)(terminal_2.$Mib, terminalService_1.$cWb, 1 /* InstantiationType.Delayed */);
    (0, extensions_1.$mr)(terminal_2.$Nib, terminalEditorService_1.$gWb, 1 /* InstantiationType.Delayed */);
    (0, extensions_1.$mr)(terminal_2.$Oib, terminalGroupService_1.$jWb, 1 /* InstantiationType.Delayed */);
    (0, extensions_1.$mr)(terminal_2.$Pib, terminalInstanceService_1.$eWb, 1 /* InstantiationType.Delayed */);
    (0, extensions_1.$mr)(terminal_1.$GM, terminalProfileService_1.$mWb, 1 /* InstantiationType.Delayed */);
    // Register quick accesses
    const quickAccessRegistry = (platform_1.$8m.as(quickAccess_1.$8p.Quickaccess));
    const inTerminalsPicker = 'inTerminalPicker';
    quickAccessRegistry.registerQuickAccessProvider({
        ctor: terminalQuickAccess_1.$qVb,
        prefix: terminalQuickAccess_1.$qVb.PREFIX,
        contextKey: inTerminalsPicker,
        placeholder: nls.localize(0, null),
        helpEntries: [{ description: nls.localize(1, null), commandId: "workbench.action.quickOpenTerm" /* TerminalCommandId.QuickOpenTerm */ }]
    });
    const quickAccessNavigateNextInTerminalPickerId = 'workbench.action.quickOpenNavigateNextInTerminalPicker';
    commands_1.$Gr.registerCommand({ id: quickAccessNavigateNextInTerminalPickerId, handler: (0, quickaccess_1.$Ytb)(quickAccessNavigateNextInTerminalPickerId, true) });
    const quickAccessNavigatePreviousInTerminalPickerId = 'workbench.action.quickOpenNavigatePreviousInTerminalPicker';
    commands_1.$Gr.registerCommand({ id: quickAccessNavigatePreviousInTerminalPickerId, handler: (0, quickaccess_1.$Ytb)(quickAccessNavigatePreviousInTerminalPickerId, false) });
    // Register workbench contributions
    const workbenchRegistry = platform_1.$8m.as(contributions_1.Extensions.Workbench);
    workbenchRegistry.registerWorkbenchContribution(terminalMainContribution_1.$qWb, 3 /* LifecyclePhase.Restored */);
    workbenchRegistry.registerWorkbenchContribution(remoteTerminalBackend_1.$pWb, 3 /* LifecyclePhase.Restored */);
    // Register configurations
    (0, terminalPlatformConfiguration_1.$$q)();
    (0, terminalConfiguration_1.$dWb)();
    // Register editor/dnd contributions
    platform_1.$8m.as(editor_1.$GE.EditorFactory).registerEditorSerializer(terminalEditorInput_1.$Zib.ID, terminalEditorSerializer_1.$hWb);
    platform_1.$8m.as(editor_1.$GE.EditorPane).registerEditorPane(editor_2.$_T.create(terminalEditor_1.$fWb, terminal_2.$Sib, terminalStrings_1.$pVb.terminal), [
        new descriptors_1.$yh(terminalEditorInput_1.$Zib)
    ]);
    platform_1.$8m.as(dnd_1.$$6.DragAndDropContribution).register({
        dataFormatKey: "Terminals" /* TerminalDataTransfers.Terminals */,
        getEditorInputs(data) {
            const editors = [];
            try {
                const terminalEditors = JSON.parse(data);
                for (const terminalEditor of terminalEditors) {
                    editors.push({ resource: uri_1.URI.parse(terminalEditor) });
                }
            }
            catch (error) {
                // Invalid transfer
            }
            return editors;
        },
        setData(resources, event) {
            const terminalResources = resources.filter(({ resource }) => resource.scheme === network_1.Schemas.vscodeTerminal);
            if (terminalResources.length) {
                event.dataTransfer?.setData("Terminals" /* TerminalDataTransfers.Terminals */, JSON.stringify(terminalResources.map(({ resource }) => resource.toString())));
            }
        }
    });
    // Register views
    const VIEW_CONTAINER = platform_1.$8m.as(views_1.Extensions.ViewContainersRegistry).registerViewContainer({
        id: terminal_1.$tM,
        title: { value: nls.localize(2, null), original: 'Terminal' },
        icon: terminalIcons_1.$nib,
        ctorDescriptor: new descriptors_1.$yh(viewPaneContainer_1.$Seb, [terminal_1.$tM, { mergeViewWithContainerWhenSingleView: true }]),
        storageId: terminal_1.$tM,
        hideIfEmpty: true,
        order: 3,
    }, 1 /* ViewContainerLocation.Panel */, { doNotRegisterOpenCommand: true, isDefault: true });
    platform_1.$8m.as(views_1.Extensions.ViewsRegistry).registerViews([{
            id: terminal_1.$tM,
            name: nls.localize(3, null),
            containerIcon: terminalIcons_1.$nib,
            canToggleVisibility: false,
            canMoveView: true,
            ctorDescriptor: new descriptors_1.$yh(terminalView_1.$1Vb),
            openCommandActionDescriptor: {
                id: "workbench.action.terminal.toggleTerminal" /* TerminalCommandId.Toggle */,
                mnemonicTitle: nls.localize(4, null),
                keybindings: {
                    primary: 2048 /* KeyMod.CtrlCmd */ | 91 /* KeyCode.Backquote */,
                    mac: { primary: 256 /* KeyMod.WinCtrl */ | 91 /* KeyCode.Backquote */ }
                },
                order: 3
            }
        }], VIEW_CONTAINER);
    // Register actions
    (0, terminalActions_1.$KVb)();
    function registerSendSequenceKeybinding(text, rule) {
        keybindingsRegistry_1.$Nu.registerCommandAndKeybindingRule({
            id: "workbench.action.terminal.sendSequence" /* TerminalCommandId.SendSequence */,
            weight: 200 /* KeybindingWeight.WorkbenchContrib */,
            when: rule.when || terminalContextKey_1.TerminalContextKeys.focus,
            primary: rule.primary,
            mac: rule.mac,
            linux: rule.linux,
            win: rule.win,
            handler: terminalActions_1.$FVb,
            args: { text }
        });
    }
    var Constants;
    (function (Constants) {
        /** The text representation of `^<letter>` is `'A'.charCodeAt(0) + 1`. */
        Constants[Constants["CtrlLetterOffset"] = 64] = "CtrlLetterOffset";
    })(Constants || (Constants = {}));
    // An extra Windows-only ctrl+v keybinding is used for pwsh that sends ctrl+v directly to the
    // shell, this gets handled by PSReadLine which properly handles multi-line pastes. This is
    // disabled in accessibility mode as PowerShell does not run PSReadLine when it detects a screen
    // reader. This works even when clipboard.readText is not supported.
    if (platform_2.$i) {
        registerSendSequenceKeybinding(String.fromCharCode('V'.charCodeAt(0) - 64 /* Constants.CtrlLetterOffset */), {
            when: contextkey_1.$Ii.and(terminalContextKey_1.TerminalContextKeys.focus, contextkey_1.$Ii.equals("terminalShellType" /* TerminalContextKeyStrings.ShellType */, "pwsh" /* WindowsShellType.PowerShell */), accessibility_1.$2r.negate()),
            primary: 2048 /* KeyMod.CtrlCmd */ | 52 /* KeyCode.KeyV */
        });
    }
    // Map certain keybindings in pwsh to unused keys which get handled by PSReadLine handlers in the
    // shell integration script. This allows keystrokes that cannot be sent via VT sequences to work.
    // See https://github.com/microsoft/terminal/issues/879#issuecomment-497775007
    registerSendSequenceKeybinding('\x1b[24~a', {
        when: contextkey_1.$Ii.and(terminalContextKey_1.TerminalContextKeys.focus, contextkey_1.$Ii.equals("terminalShellType" /* TerminalContextKeyStrings.ShellType */, "pwsh" /* WindowsShellType.PowerShell */), terminalContextKey_1.TerminalContextKeys.terminalShellIntegrationEnabled, accessibility_1.$2r.negate()),
        primary: 2048 /* KeyMod.CtrlCmd */ | 10 /* KeyCode.Space */,
        mac: { primary: 256 /* KeyMod.WinCtrl */ | 10 /* KeyCode.Space */ }
    });
    registerSendSequenceKeybinding('\x1b[24~b', {
        when: contextkey_1.$Ii.and(terminalContextKey_1.TerminalContextKeys.focus, contextkey_1.$Ii.equals("terminalShellType" /* TerminalContextKeyStrings.ShellType */, "pwsh" /* WindowsShellType.PowerShell */), terminalContextKey_1.TerminalContextKeys.terminalShellIntegrationEnabled, accessibility_1.$2r.negate()),
        primary: 512 /* KeyMod.Alt */ | 10 /* KeyCode.Space */
    });
    registerSendSequenceKeybinding('\x1b[24~c', {
        when: contextkey_1.$Ii.and(terminalContextKey_1.TerminalContextKeys.focus, contextkey_1.$Ii.equals("terminalShellType" /* TerminalContextKeyStrings.ShellType */, "pwsh" /* WindowsShellType.PowerShell */), terminalContextKey_1.TerminalContextKeys.terminalShellIntegrationEnabled, accessibility_1.$2r.negate()),
        primary: 1024 /* KeyMod.Shift */ | 3 /* KeyCode.Enter */
    });
    registerSendSequenceKeybinding('\x1b[24~d', {
        when: contextkey_1.$Ii.and(terminalContextKey_1.TerminalContextKeys.focus, contextkey_1.$Ii.equals("terminalShellType" /* TerminalContextKeyStrings.ShellType */, "pwsh" /* WindowsShellType.PowerShell */), terminalContextKey_1.TerminalContextKeys.terminalShellIntegrationEnabled, accessibility_1.$2r.negate()),
        mac: { primary: 1024 /* KeyMod.Shift */ | 2048 /* KeyMod.CtrlCmd */ | 17 /* KeyCode.RightArrow */ }
    });
    registerSendSequenceKeybinding('\x1b[24~e', {
        when: contextkey_1.$Ii.and(terminalContextKey_1.TerminalContextKeys.focus, contextkey_1.$Ii.equals("terminalShellType" /* TerminalContextKeyStrings.ShellType */, "pwsh" /* WindowsShellType.PowerShell */), terminalContextKey_1.TerminalContextKeys.terminalShellIntegrationEnabled, accessibility_1.$2r.negate(), contextkey_1.$Ii.equals(`config.${"terminal.integrated.shellIntegration.suggestEnabled" /* TerminalSettingId.ShellIntegrationSuggestEnabled */}`, true)),
        primary: 2048 /* KeyMod.CtrlCmd */ | 10 /* KeyCode.Space */,
        mac: { primary: 256 /* KeyMod.WinCtrl */ | 10 /* KeyCode.Space */ }
    });
    // Always on pwsh keybindings
    registerSendSequenceKeybinding('\x1b[1;2H', {
        when: contextkey_1.$Ii.and(terminalContextKey_1.TerminalContextKeys.focus, contextkey_1.$Ii.equals("terminalShellType" /* TerminalContextKeyStrings.ShellType */, "pwsh" /* WindowsShellType.PowerShell */)),
        mac: { primary: 1024 /* KeyMod.Shift */ | 2048 /* KeyMod.CtrlCmd */ | 15 /* KeyCode.LeftArrow */ }
    });
    // Map ctrl+alt+r -> ctrl+r when in accessibility mode due to default run recent command keybinding
    registerSendSequenceKeybinding('\x12', {
        when: contextkey_1.$Ii.and(terminalContextKey_1.TerminalContextKeys.focus, accessibility_1.$2r),
        primary: 2048 /* KeyMod.CtrlCmd */ | 512 /* KeyMod.Alt */ | 48 /* KeyCode.KeyR */,
        mac: { primary: 256 /* KeyMod.WinCtrl */ | 512 /* KeyMod.Alt */ | 48 /* KeyCode.KeyR */ }
    });
    // Map ctrl+alt+g -> ctrl+g due to default go to recent directory keybinding
    registerSendSequenceKeybinding('\x07', {
        when: terminalContextKey_1.TerminalContextKeys.focus,
        primary: 2048 /* KeyMod.CtrlCmd */ | 512 /* KeyMod.Alt */ | 37 /* KeyCode.KeyG */,
        mac: { primary: 256 /* KeyMod.WinCtrl */ | 512 /* KeyMod.Alt */ | 37 /* KeyCode.KeyG */ }
    });
    // send ctrl+c to the iPad when the terminal is focused and ctrl+c is pressed to kill the process (work around for #114009)
    if (platform_2.$q) {
        registerSendSequenceKeybinding(String.fromCharCode('C'.charCodeAt(0) - 64 /* Constants.CtrlLetterOffset */), {
            when: contextkey_1.$Ii.and(terminalContextKey_1.TerminalContextKeys.focus),
            primary: 256 /* KeyMod.WinCtrl */ | 33 /* KeyCode.KeyC */
        });
    }
    // Delete word left: ctrl+w
    registerSendSequenceKeybinding(String.fromCharCode('W'.charCodeAt(0) - 64 /* Constants.CtrlLetterOffset */), {
        primary: 2048 /* KeyMod.CtrlCmd */ | 1 /* KeyCode.Backspace */,
        mac: { primary: 512 /* KeyMod.Alt */ | 1 /* KeyCode.Backspace */ }
    });
    if (platform_2.$i) {
        // Delete word left: ctrl+h
        // Windows cmd.exe requires ^H to delete full word left
        registerSendSequenceKeybinding(String.fromCharCode('H'.charCodeAt(0) - 64 /* Constants.CtrlLetterOffset */), {
            when: contextkey_1.$Ii.and(terminalContextKey_1.TerminalContextKeys.focus, contextkey_1.$Ii.equals("terminalShellType" /* TerminalContextKeyStrings.ShellType */, "cmd" /* WindowsShellType.CommandPrompt */)),
            primary: 2048 /* KeyMod.CtrlCmd */ | 1 /* KeyCode.Backspace */,
        });
    }
    // Delete word right: alt+d [27, 100]
    registerSendSequenceKeybinding('\u001bd', {
        primary: 2048 /* KeyMod.CtrlCmd */ | 20 /* KeyCode.Delete */,
        mac: { primary: 512 /* KeyMod.Alt */ | 20 /* KeyCode.Delete */ }
    });
    // Delete to line start: ctrl+u
    registerSendSequenceKeybinding('\u0015', {
        mac: { primary: 2048 /* KeyMod.CtrlCmd */ | 1 /* KeyCode.Backspace */ }
    });
    // Move to line start: ctrl+A
    registerSendSequenceKeybinding(String.fromCharCode('A'.charCodeAt(0) - 64), {
        mac: { primary: 2048 /* KeyMod.CtrlCmd */ | 15 /* KeyCode.LeftArrow */ }
    });
    // Move to line end: ctrl+E
    registerSendSequenceKeybinding(String.fromCharCode('E'.charCodeAt(0) - 64), {
        mac: { primary: 2048 /* KeyMod.CtrlCmd */ | 17 /* KeyCode.RightArrow */ }
    });
    // NUL: ctrl+shift+2
    registerSendSequenceKeybinding('\u0000', {
        primary: 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 23 /* KeyCode.Digit2 */,
        mac: { primary: 256 /* KeyMod.WinCtrl */ | 1024 /* KeyMod.Shift */ | 23 /* KeyCode.Digit2 */ }
    });
    // RS: ctrl+shift+6
    registerSendSequenceKeybinding('\u001e', {
        primary: 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 27 /* KeyCode.Digit6 */,
        mac: { primary: 256 /* KeyMod.WinCtrl */ | 1024 /* KeyMod.Shift */ | 27 /* KeyCode.Digit6 */ }
    });
    // US (Undo): ctrl+/
    registerSendSequenceKeybinding('\u001f', {
        primary: 2048 /* KeyMod.CtrlCmd */ | 90 /* KeyCode.Slash */,
        mac: { primary: 256 /* KeyMod.WinCtrl */ | 90 /* KeyCode.Slash */ }
    });
    (0, terminalCommands_1.$2Vb)();
    (0, terminalMenus_1.$YVb)();
    (0, terminalColorRegistry_1.$Jfb)();
});
//# sourceMappingURL=terminal.contribution.js.map