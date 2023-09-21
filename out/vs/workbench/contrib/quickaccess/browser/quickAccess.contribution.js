/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls", "vs/platform/quickinput/common/quickAccess", "vs/platform/registry/common/platform", "vs/platform/quickinput/browser/helpQuickAccess", "vs/workbench/contrib/quickaccess/browser/viewQuickAccess", "vs/workbench/contrib/quickaccess/browser/commandsQuickAccess", "vs/platform/actions/common/actions", "vs/platform/contextkey/common/contextkey", "vs/workbench/browser/quickaccess", "vs/platform/keybinding/common/keybindingsRegistry", "vs/editor/common/editorContextKeys"], function (require, exports, nls_1, quickAccess_1, platform_1, helpQuickAccess_1, viewQuickAccess_1, commandsQuickAccess_1, actions_1, contextkey_1, quickaccess_1, keybindingsRegistry_1, editorContextKeys_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    //#region Quick Access Proviers
    const quickAccessRegistry = platform_1.Registry.as(quickAccess_1.Extensions.Quickaccess);
    quickAccessRegistry.registerQuickAccessProvider({
        ctor: helpQuickAccess_1.HelpQuickAccessProvider,
        prefix: helpQuickAccess_1.HelpQuickAccessProvider.PREFIX,
        placeholder: (0, nls_1.localize)('helpQuickAccessPlaceholder', "Type '{0}' to get help on the actions you can take from here.", helpQuickAccess_1.HelpQuickAccessProvider.PREFIX),
        helpEntries: [{
                description: (0, nls_1.localize)('helpQuickAccess', "Show all Quick Access Providers"),
                commandCenterOrder: 70,
                commandCenterLabel: (0, nls_1.localize)('more', 'More')
            }]
    });
    quickAccessRegistry.registerQuickAccessProvider({
        ctor: viewQuickAccess_1.ViewQuickAccessProvider,
        prefix: viewQuickAccess_1.ViewQuickAccessProvider.PREFIX,
        contextKey: 'inViewsPicker',
        placeholder: (0, nls_1.localize)('viewQuickAccessPlaceholder', "Type the name of a view, output channel or terminal to open."),
        helpEntries: [{ description: (0, nls_1.localize)('viewQuickAccess', "Open View"), commandId: viewQuickAccess_1.OpenViewPickerAction.ID }]
    });
    quickAccessRegistry.registerQuickAccessProvider({
        ctor: commandsQuickAccess_1.CommandsQuickAccessProvider,
        prefix: commandsQuickAccess_1.CommandsQuickAccessProvider.PREFIX,
        contextKey: 'inCommandsPicker',
        placeholder: (0, nls_1.localize)('commandsQuickAccessPlaceholder', "Type the name of a command to run."),
        helpEntries: [{ description: (0, nls_1.localize)('commandsQuickAccess', "Show and Run Commands"), commandId: commandsQuickAccess_1.ShowAllCommandsAction.ID, commandCenterOrder: 20 }]
    });
    //#endregion
    //#region Menu contributions
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.MenubarViewMenu, {
        group: '1_open',
        command: {
            id: commandsQuickAccess_1.ShowAllCommandsAction.ID,
            title: (0, nls_1.localize)({ key: 'miCommandPalette', comment: ['&& denotes a mnemonic'] }, "&&Command Palette...")
        },
        order: 1
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.MenubarHelpMenu, {
        group: '1_welcome',
        command: {
            id: commandsQuickAccess_1.ShowAllCommandsAction.ID,
            title: (0, nls_1.localize)({ key: 'miShowAllCommands', comment: ['&& denotes a mnemonic'] }, "Show All Commands")
        },
        order: 2
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.MenubarViewMenu, {
        group: '1_open',
        command: {
            id: viewQuickAccess_1.OpenViewPickerAction.ID,
            title: (0, nls_1.localize)({ key: 'miOpenView', comment: ['&& denotes a mnemonic'] }, "&&Open View...")
        },
        order: 2
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.MenubarGoMenu, {
        group: '5_infile_nav',
        command: {
            id: 'workbench.action.gotoLine',
            title: (0, nls_1.localize)({ key: 'miGotoLine', comment: ['&& denotes a mnemonic'] }, "Go to &&Line/Column...")
        },
        order: 1
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.GlobalActivity, {
        group: '1_command',
        command: {
            id: commandsQuickAccess_1.ShowAllCommandsAction.ID,
            title: (0, nls_1.localize)('commandPalette', "Command Palette...")
        },
        order: 1
    });
    actions_1.MenuRegistry.appendMenuItem(actions_1.MenuId.EditorContext, {
        group: 'z_commands',
        when: editorContextKeys_1.EditorContextKeys.editorSimpleInput.toNegated(),
        command: {
            id: commandsQuickAccess_1.ShowAllCommandsAction.ID,
            title: (0, nls_1.localize)('commandPalette', "Command Palette..."),
        },
        order: 1
    });
    //#endregion
    //#region Workbench actions and commands
    (0, actions_1.registerAction2)(commandsQuickAccess_1.ClearCommandHistoryAction);
    (0, actions_1.registerAction2)(commandsQuickAccess_1.ShowAllCommandsAction);
    (0, actions_1.registerAction2)(viewQuickAccess_1.OpenViewPickerAction);
    (0, actions_1.registerAction2)(viewQuickAccess_1.QuickAccessViewPickerAction);
    const inViewsPickerContextKey = 'inViewsPicker';
    const inViewsPickerContext = contextkey_1.ContextKeyExpr.and(quickaccess_1.inQuickPickContext, contextkey_1.ContextKeyExpr.has(inViewsPickerContextKey));
    const viewPickerKeybinding = viewQuickAccess_1.QuickAccessViewPickerAction.KEYBINDING;
    const quickAccessNavigateNextInViewPickerId = 'workbench.action.quickOpenNavigateNextInViewPicker';
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: quickAccessNavigateNextInViewPickerId,
        weight: 200 /* KeybindingWeight.WorkbenchContrib */ + 50,
        handler: (0, quickaccess_1.getQuickNavigateHandler)(quickAccessNavigateNextInViewPickerId, true),
        when: inViewsPickerContext,
        primary: viewPickerKeybinding.primary,
        linux: viewPickerKeybinding.linux,
        mac: viewPickerKeybinding.mac
    });
    const quickAccessNavigatePreviousInViewPickerId = 'workbench.action.quickOpenNavigatePreviousInViewPicker';
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: quickAccessNavigatePreviousInViewPickerId,
        weight: 200 /* KeybindingWeight.WorkbenchContrib */ + 50,
        handler: (0, quickaccess_1.getQuickNavigateHandler)(quickAccessNavigatePreviousInViewPickerId, false),
        when: inViewsPickerContext,
        primary: viewPickerKeybinding.primary | 1024 /* KeyMod.Shift */,
        linux: viewPickerKeybinding.linux,
        mac: {
            primary: viewPickerKeybinding.mac.primary | 1024 /* KeyMod.Shift */
        }
    });
});
//#endregion
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicXVpY2tBY2Nlc3MuY29udHJpYnV0aW9uLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvcXVpY2thY2Nlc3MvYnJvd3Nlci9xdWlja0FjY2Vzcy5jb250cmlidXRpb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7SUFlaEcsK0JBQStCO0lBRS9CLE1BQU0sbUJBQW1CLEdBQUcsbUJBQVEsQ0FBQyxFQUFFLENBQXVCLHdCQUFVLENBQUMsV0FBVyxDQUFDLENBQUM7SUFFdEYsbUJBQW1CLENBQUMsMkJBQTJCLENBQUM7UUFDL0MsSUFBSSxFQUFFLHlDQUF1QjtRQUM3QixNQUFNLEVBQUUseUNBQXVCLENBQUMsTUFBTTtRQUN0QyxXQUFXLEVBQUUsSUFBQSxjQUFRLEVBQUMsNEJBQTRCLEVBQUUsK0RBQStELEVBQUUseUNBQXVCLENBQUMsTUFBTSxDQUFDO1FBQ3BKLFdBQVcsRUFBRSxDQUFDO2dCQUNiLFdBQVcsRUFBRSxJQUFBLGNBQVEsRUFBQyxpQkFBaUIsRUFBRSxpQ0FBaUMsQ0FBQztnQkFDM0Usa0JBQWtCLEVBQUUsRUFBRTtnQkFDdEIsa0JBQWtCLEVBQUUsSUFBQSxjQUFRLEVBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQzthQUM1QyxDQUFDO0tBQ0YsQ0FBQyxDQUFDO0lBRUgsbUJBQW1CLENBQUMsMkJBQTJCLENBQUM7UUFDL0MsSUFBSSxFQUFFLHlDQUF1QjtRQUM3QixNQUFNLEVBQUUseUNBQXVCLENBQUMsTUFBTTtRQUN0QyxVQUFVLEVBQUUsZUFBZTtRQUMzQixXQUFXLEVBQUUsSUFBQSxjQUFRLEVBQUMsNEJBQTRCLEVBQUUsOERBQThELENBQUM7UUFDbkgsV0FBVyxFQUFFLENBQUMsRUFBRSxXQUFXLEVBQUUsSUFBQSxjQUFRLEVBQUMsaUJBQWlCLEVBQUUsV0FBVyxDQUFDLEVBQUUsU0FBUyxFQUFFLHNDQUFv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