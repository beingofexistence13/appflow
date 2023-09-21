/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls!vs/workbench/browser/actions/quickAccessActions", "vs/platform/actions/common/actions", "vs/platform/keybinding/common/keybindingsRegistry", "vs/platform/quickinput/common/quickInput", "vs/platform/keybinding/common/keybinding", "vs/platform/commands/common/commands", "vs/workbench/browser/quickaccess", "vs/base/common/codicons"], function (require, exports, nls_1, actions_1, keybindingsRegistry_1, quickInput_1, keybinding_1, commands_1, quickaccess_1, codicons_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    //#region Quick access management commands and keys
    const globalQuickAccessKeybinding = {
        primary: 2048 /* KeyMod.CtrlCmd */ | 46 /* KeyCode.KeyP */,
        secondary: [2048 /* KeyMod.CtrlCmd */ | 35 /* KeyCode.KeyE */],
        mac: { primary: 2048 /* KeyMod.CtrlCmd */ | 46 /* KeyCode.KeyP */, secondary: undefined }
    };
    keybindingsRegistry_1.$Nu.registerCommandAndKeybindingRule({
        id: 'workbench.action.closeQuickOpen',
        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
        when: quickaccess_1.$Vtb,
        primary: 9 /* KeyCode.Escape */, secondary: [1024 /* KeyMod.Shift */ | 9 /* KeyCode.Escape */],
        handler: accessor => {
            const quickInputService = accessor.get(quickInput_1.$Gq);
            return quickInputService.cancel();
        }
    });
    keybindingsRegistry_1.$Nu.registerCommandAndKeybindingRule({
        id: 'workbench.action.acceptSelectedQuickOpenItem',
        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
        when: quickaccess_1.$Vtb,
        primary: 0,
        handler: accessor => {
            const quickInputService = accessor.get(quickInput_1.$Gq);
            return quickInputService.accept();
        }
    });
    keybindingsRegistry_1.$Nu.registerCommandAndKeybindingRule({
        id: 'workbench.action.alternativeAcceptSelectedQuickOpenItem',
        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
        when: quickaccess_1.$Vtb,
        primary: 0,
        handler: accessor => {
            const quickInputService = accessor.get(quickInput_1.$Gq);
            return quickInputService.accept({ ctrlCmd: true, alt: false });
        }
    });
    keybindingsRegistry_1.$Nu.registerCommandAndKeybindingRule({
        id: 'workbench.action.focusQuickOpen',
        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
        when: quickaccess_1.$Vtb,
        primary: 0,
        handler: accessor => {
            const quickInputService = accessor.get(quickInput_1.$Gq);
            quickInputService.focus();
        }
    });
    const quickAccessNavigateNextInFilePickerId = 'workbench.action.quickOpenNavigateNextInFilePicker';
    keybindingsRegistry_1.$Nu.registerCommandAndKeybindingRule({
        id: quickAccessNavigateNextInFilePickerId,
        weight: 200 /* KeybindingWeight.WorkbenchContrib */ + 50,
        handler: (0, quickaccess_1.$Ytb)(quickAccessNavigateNextInFilePickerId, true),
        when: quickaccess_1.$Xtb,
        primary: globalQuickAccessKeybinding.primary,
        secondary: globalQuickAccessKeybinding.secondary,
        mac: globalQuickAccessKeybinding.mac
    });
    const quickAccessNavigatePreviousInFilePickerId = 'workbench.action.quickOpenNavigatePreviousInFilePicker';
    keybindingsRegistry_1.$Nu.registerCommandAndKeybindingRule({
        id: quickAccessNavigatePreviousInFilePickerId,
        weight: 200 /* KeybindingWeight.WorkbenchContrib */ + 50,
        handler: (0, quickaccess_1.$Ytb)(quickAccessNavigatePreviousInFilePickerId, false),
        when: quickaccess_1.$Xtb,
        primary: globalQuickAccessKeybinding.primary | 1024 /* KeyMod.Shift */,
        secondary: [globalQuickAccessKeybinding.secondary[0] | 1024 /* KeyMod.Shift */],
        mac: {
            primary: globalQuickAccessKeybinding.mac.primary | 1024 /* KeyMod.Shift */,
            secondary: undefined
        }
    });
    keybindingsRegistry_1.$Nu.registerCommandAndKeybindingRule({
        id: 'workbench.action.quickPickManyToggle',
        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
        when: quickaccess_1.$Vtb,
        primary: 0,
        handler: accessor => {
            const quickInputService = accessor.get(quickInput_1.$Gq);
            quickInputService.toggle();
        }
    });
    keybindingsRegistry_1.$Nu.registerCommandAndKeybindingRule({
        id: 'workbench.action.quickInputBack',
        weight: 200 /* KeybindingWeight.WorkbenchContrib */ + 50,
        when: quickaccess_1.$Vtb,
        primary: 0,
        win: { primary: 512 /* KeyMod.Alt */ | 15 /* KeyCode.LeftArrow */ },
        mac: { primary: 256 /* KeyMod.WinCtrl */ | 88 /* KeyCode.Minus */ },
        linux: { primary: 2048 /* KeyMod.CtrlCmd */ | 512 /* KeyMod.Alt */ | 88 /* KeyCode.Minus */ },
        handler: accessor => {
            const quickInputService = accessor.get(quickInput_1.$Gq);
            quickInputService.back();
        }
    });
    (0, actions_1.$Xu)(class QuickAccessAction extends actions_1.$Wu {
        constructor() {
            super({
                id: 'workbench.action.quickOpen',
                title: {
                    value: (0, nls_1.localize)(0, null),
                    original: 'Go to File...'
                },
                description: {
                    description: `Quick access`,
                    args: [{
                            name: 'prefix',
                            schema: {
                                'type': 'string'
                            }
                        }]
                },
                keybinding: {
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    primary: globalQuickAccessKeybinding.primary,
                    secondary: globalQuickAccessKeybinding.secondary,
                    mac: globalQuickAccessKeybinding.mac
                },
                f1: true
            });
        }
        run(accessor, prefix) {
            const quickInputService = accessor.get(quickInput_1.$Gq);
            quickInputService.quickAccess.show(typeof prefix === 'string' ? prefix : undefined, { preserveValue: typeof prefix === 'string' /* preserve as is if provided */ });
        }
    });
    (0, actions_1.$Xu)(class QuickAccessAction extends actions_1.$Wu {
        constructor() {
            super({
                id: 'workbench.action.quickOpenWithModes',
                title: (0, nls_1.localize)(1, null),
                icon: codicons_1.$Pj.search,
                menu: {
                    id: actions_1.$Ru.CommandCenterCenter,
                    order: 100
                }
            });
        }
        run(accessor) {
            const quickInputService = accessor.get(quickInput_1.$Gq);
            quickInputService.quickAccess.show(undefined, {
                preserveValue: true,
                providerOptions: {
                    includeHelp: true,
                    from: 'commandCenter',
                }
            });
        }
    });
    commands_1.$Gr.registerCommand('workbench.action.quickOpenPreviousEditor', async (accessor) => {
        const quickInputService = accessor.get(quickInput_1.$Gq);
        quickInputService.quickAccess.show('', { itemActivation: quickInput_1.ItemActivation.SECOND });
    });
    //#endregion
    //#region Workbench actions
    class BaseQuickAccessNavigateAction extends actions_1.$Wu {
        constructor(a, title, b, c, keybinding) {
            super({ id: a, title, f1: true, keybinding });
            this.a = a;
            this.b = b;
            this.c = c;
        }
        async run(accessor) {
            const keybindingService = accessor.get(keybinding_1.$2D);
            const quickInputService = accessor.get(quickInput_1.$Gq);
            const keys = keybindingService.lookupKeybindings(this.a);
            const quickNavigate = this.c ? { keybindings: keys } : undefined;
            quickInputService.navigate(this.b, quickNavigate);
        }
    }
    class QuickAccessNavigateNextAction extends BaseQuickAccessNavigateAction {
        constructor() {
            super('workbench.action.quickOpenNavigateNext', { value: (0, nls_1.localize)(2, null), original: 'Navigate Next in Quick Open' }, true, true);
        }
    }
    class QuickAccessNavigatePreviousAction extends BaseQuickAccessNavigateAction {
        constructor() {
            super('workbench.action.quickOpenNavigatePrevious', { value: (0, nls_1.localize)(3, null), original: 'Navigate Previous in Quick Open' }, false, true);
        }
    }
    class QuickAccessSelectNextAction extends BaseQuickAccessNavigateAction {
        constructor() {
            super('workbench.action.quickOpenSelectNext', { value: (0, nls_1.localize)(4, null), original: 'Select Next in Quick Open' }, true, false, {
                weight: 200 /* KeybindingWeight.WorkbenchContrib */ + 50,
                when: quickaccess_1.$Vtb,
                primary: 0,
                mac: { primary: 256 /* KeyMod.WinCtrl */ | 44 /* KeyCode.KeyN */ }
            });
        }
    }
    class QuickAccessSelectPreviousAction extends BaseQuickAccessNavigateAction {
        constructor() {
            super('workbench.action.quickOpenSelectPrevious', { value: (0, nls_1.localize)(5, null), original: 'Select Previous in Quick Open' }, false, false, {
                weight: 200 /* KeybindingWeight.WorkbenchContrib */ + 50,
                when: quickaccess_1.$Vtb,
                primary: 0,
                mac: { primary: 256 /* KeyMod.WinCtrl */ | 46 /* KeyCode.KeyP */ }
            });
        }
    }
    (0, actions_1.$Xu)(QuickAccessSelectNextAction);
    (0, actions_1.$Xu)(QuickAccessSelectPreviousAction);
    (0, actions_1.$Xu)(QuickAccessNavigateNextAction);
    (0, actions_1.$Xu)(QuickAccessNavigatePreviousAction);
});
//#endregion
//# sourceMappingURL=quickAccessActions.js.map