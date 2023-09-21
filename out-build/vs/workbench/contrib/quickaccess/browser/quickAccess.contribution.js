/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls!vs/workbench/contrib/quickaccess/browser/quickAccess.contribution", "vs/platform/quickinput/common/quickAccess", "vs/platform/registry/common/platform", "vs/platform/quickinput/browser/helpQuickAccess", "vs/workbench/contrib/quickaccess/browser/viewQuickAccess", "vs/workbench/contrib/quickaccess/browser/commandsQuickAccess", "vs/platform/actions/common/actions", "vs/platform/contextkey/common/contextkey", "vs/workbench/browser/quickaccess", "vs/platform/keybinding/common/keybindingsRegistry", "vs/editor/common/editorContextKeys"], function (require, exports, nls_1, quickAccess_1, platform_1, helpQuickAccess_1, viewQuickAccess_1, commandsQuickAccess_1, actions_1, contextkey_1, quickaccess_1, keybindingsRegistry_1, editorContextKeys_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    //#region Quick Access Proviers
    const quickAccessRegistry = platform_1.$8m.as(quickAccess_1.$8p.Quickaccess);
    quickAccessRegistry.registerQuickAccessProvider({
        ctor: helpQuickAccess_1.$FLb,
        prefix: helpQuickAccess_1.$FLb.PREFIX,
        placeholder: (0, nls_1.localize)(0, null, helpQuickAccess_1.$FLb.PREFIX),
        helpEntries: [{
                description: (0, nls_1.localize)(1, null),
                commandCenterOrder: 70,
                commandCenterLabel: (0, nls_1.localize)(2, null)
            }]
    });
    quickAccessRegistry.registerQuickAccessProvider({
        ctor: viewQuickAccess_1.$GLb,
        prefix: viewQuickAccess_1.$GLb.PREFIX,
        contextKey: 'inViewsPicker',
        placeholder: (0, nls_1.localize)(3, null),
        helpEntries: [{ description: (0, nls_1.localize)(4, null), commandId: viewQuickAccess_1.$HLb.ID }]
    });
    quickAccessRegistry.registerQuickAccessProvider({
        ctor: commandsQuickAccess_1.$MLb,
        prefix: commandsQuickAccess_1.$MLb.PREFIX,
        contextKey: 'inCommandsPicker',
        placeholder: (0, nls_1.localize)(5, null),
        helpEntries: [{ description: (0, nls_1.localize)(6, null), commandId: commandsQuickAccess_1.$NLb.ID, commandCenterOrder: 20 }]
    });
    //#endregion
    //#region Menu contributions
    actions_1.$Tu.appendMenuItem(actions_1.$Ru.MenubarViewMenu, {
        group: '1_open',
        command: {
            id: commandsQuickAccess_1.$NLb.ID,
            title: (0, nls_1.localize)(7, null)
        },
        order: 1
    });
    actions_1.$Tu.appendMenuItem(actions_1.$Ru.MenubarHelpMenu, {
        group: '1_welcome',
        command: {
            id: commandsQuickAccess_1.$NLb.ID,
            title: (0, nls_1.localize)(8, null)
        },
        order: 2
    });
    actions_1.$Tu.appendMenuItem(actions_1.$Ru.MenubarViewMenu, {
        group: '1_open',
        command: {
            id: viewQuickAccess_1.$HLb.ID,
            title: (0, nls_1.localize)(9, null)
        },
        order: 2
    });
    actions_1.$Tu.appendMenuItem(actions_1.$Ru.MenubarGoMenu, {
        group: '5_infile_nav',
        command: {
            id: 'workbench.action.gotoLine',
            title: (0, nls_1.localize)(10, null)
        },
        order: 1
    });
    actions_1.$Tu.appendMenuItem(actions_1.$Ru.GlobalActivity, {
        group: '1_command',
        command: {
            id: commandsQuickAccess_1.$NLb.ID,
            title: (0, nls_1.localize)(11, null)
        },
        order: 1
    });
    actions_1.$Tu.appendMenuItem(actions_1.$Ru.EditorContext, {
        group: 'z_commands',
        when: editorContextKeys_1.EditorContextKeys.editorSimpleInput.toNegated(),
        command: {
            id: commandsQuickAccess_1.$NLb.ID,
            title: (0, nls_1.localize)(12, null),
        },
        order: 1
    });
    //#endregion
    //#region Workbench actions and commands
    (0, actions_1.$Xu)(commandsQuickAccess_1.$OLb);
    (0, actions_1.$Xu)(commandsQuickAccess_1.$NLb);
    (0, actions_1.$Xu)(viewQuickAccess_1.$HLb);
    (0, actions_1.$Xu)(viewQuickAccess_1.$ILb);
    const inViewsPickerContextKey = 'inViewsPicker';
    const inViewsPickerContext = contextkey_1.$Ii.and(quickaccess_1.$Vtb, contextkey_1.$Ii.has(inViewsPickerContextKey));
    const viewPickerKeybinding = viewQuickAccess_1.$ILb.KEYBINDING;
    const quickAccessNavigateNextInViewPickerId = 'workbench.action.quickOpenNavigateNextInViewPicker';
    keybindingsRegistry_1.$Nu.registerCommandAndKeybindingRule({
        id: quickAccessNavigateNextInViewPickerId,
        weight: 200 /* KeybindingWeight.WorkbenchContrib */ + 50,
        handler: (0, quickaccess_1.$Ytb)(quickAccessNavigateNextInViewPickerId, true),
        when: inViewsPickerContext,
        primary: viewPickerKeybinding.primary,
        linux: viewPickerKeybinding.linux,
        mac: viewPickerKeybinding.mac
    });
    const quickAccessNavigatePreviousInViewPickerId = 'workbench.action.quickOpenNavigatePreviousInViewPicker';
    keybindingsRegistry_1.$Nu.registerCommandAndKeybindingRule({
        id: quickAccessNavigatePreviousInViewPickerId,
        weight: 200 /* KeybindingWeight.WorkbenchContrib */ + 50,
        handler: (0, quickaccess_1.$Ytb)(quickAccessNavigatePreviousInViewPickerId, false),
        when: inViewsPickerContext,
        primary: viewPickerKeybinding.primary | 1024 /* KeyMod.Shift */,
        linux: viewPickerKeybinding.linux,
        mac: {
            primary: viewPickerKeybinding.mac.primary | 1024 /* KeyMod.Shift */
        }
    });
});
//#endregion
//# sourceMappingURL=quickAccess.contribution.js.map