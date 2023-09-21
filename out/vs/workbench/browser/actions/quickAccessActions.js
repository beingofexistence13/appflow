/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls", "vs/platform/actions/common/actions", "vs/platform/keybinding/common/keybindingsRegistry", "vs/platform/quickinput/common/quickInput", "vs/platform/keybinding/common/keybinding", "vs/platform/commands/common/commands", "vs/workbench/browser/quickaccess", "vs/base/common/codicons"], function (require, exports, nls_1, actions_1, keybindingsRegistry_1, quickInput_1, keybinding_1, commands_1, quickaccess_1, codicons_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    //#region Quick access management commands and keys
    const globalQuickAccessKeybinding = {
        primary: 2048 /* KeyMod.CtrlCmd */ | 46 /* KeyCode.KeyP */,
        secondary: [2048 /* KeyMod.CtrlCmd */ | 35 /* KeyCode.KeyE */],
        mac: { primary: 2048 /* KeyMod.CtrlCmd */ | 46 /* KeyCode.KeyP */, secondary: undefined }
    };
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: 'workbench.action.closeQuickOpen',
        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
        when: quickaccess_1.inQuickPickContext,
        primary: 9 /* KeyCode.Escape */, secondary: [1024 /* KeyMod.Shift */ | 9 /* KeyCode.Escape */],
        handler: accessor => {
            const quickInputService = accessor.get(quickInput_1.IQuickInputService);
            return quickInputService.cancel();
        }
    });
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: 'workbench.action.acceptSelectedQuickOpenItem',
        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
        when: quickaccess_1.inQuickPickContext,
        primary: 0,
        handler: accessor => {
            const quickInputService = accessor.get(quickInput_1.IQuickInputService);
            return quickInputService.accept();
        }
    });
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: 'workbench.action.alternativeAcceptSelectedQuickOpenItem',
        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
        when: quickaccess_1.inQuickPickContext,
        primary: 0,
        handler: accessor => {
            const quickInputService = accessor.get(quickInput_1.IQuickInputService);
            return quickInputService.accept({ ctrlCmd: true, alt: false });
        }
    });
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: 'workbench.action.focusQuickOpen',
        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
        when: quickaccess_1.inQuickPickContext,
        primary: 0,
        handler: accessor => {
            const quickInputService = accessor.get(quickInput_1.IQuickInputService);
            quickInputService.focus();
        }
    });
    const quickAccessNavigateNextInFilePickerId = 'workbench.action.quickOpenNavigateNextInFilePicker';
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: quickAccessNavigateNextInFilePickerId,
        weight: 200 /* KeybindingWeight.WorkbenchContrib */ + 50,
        handler: (0, quickaccess_1.getQuickNavigateHandler)(quickAccessNavigateNextInFilePickerId, true),
        when: quickaccess_1.defaultQuickAccessContext,
        primary: globalQuickAccessKeybinding.primary,
        secondary: globalQuickAccessKeybinding.secondary,
        mac: globalQuickAccessKeybinding.mac
    });
    const quickAccessNavigatePreviousInFilePickerId = 'workbench.action.quickOpenNavigatePreviousInFilePicker';
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: quickAccessNavigatePreviousInFilePickerId,
        weight: 200 /* KeybindingWeight.WorkbenchContrib */ + 50,
        handler: (0, quickaccess_1.getQuickNavigateHandler)(quickAccessNavigatePreviousInFilePickerId, false),
        when: quickaccess_1.defaultQuickAccessContext,
        primary: globalQuickAccessKeybinding.primary | 1024 /* KeyMod.Shift */,
        secondary: [globalQuickAccessKeybinding.secondary[0] | 1024 /* KeyMod.Shift */],
        mac: {
            primary: globalQuickAccessKeybinding.mac.primary | 1024 /* KeyMod.Shift */,
            secondary: undefined
        }
    });
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: 'workbench.action.quickPickManyToggle',
        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
        when: quickaccess_1.inQuickPickContext,
        primary: 0,
        handler: accessor => {
            const quickInputService = accessor.get(quickInput_1.IQuickInputService);
            quickInputService.toggle();
        }
    });
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: 'workbench.action.quickInputBack',
        weight: 200 /* KeybindingWeight.WorkbenchContrib */ + 50,
        when: quickaccess_1.inQuickPickContext,
        primary: 0,
        win: { primary: 512 /* KeyMod.Alt */ | 15 /* KeyCode.LeftArrow */ },
        mac: { primary: 256 /* KeyMod.WinCtrl */ | 88 /* KeyCode.Minus */ },
        linux: { primary: 2048 /* KeyMod.CtrlCmd */ | 512 /* KeyMod.Alt */ | 88 /* KeyCode.Minus */ },
        handler: accessor => {
            const quickInputService = accessor.get(quickInput_1.IQuickInputService);
            quickInputService.back();
        }
    });
    (0, actions_1.registerAction2)(class QuickAccessAction extends actions_1.Action2 {
        constructor() {
            super({
                id: 'workbench.action.quickOpen',
                title: {
                    value: (0, nls_1.localize)('quickOpen', "Go to File..."),
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
            const quickInputService = accessor.get(quickInput_1.IQuickInputService);
            quickInputService.quickAccess.show(typeof prefix === 'string' ? prefix : undefined, { preserveValue: typeof prefix === 'string' /* preserve as is if provided */ });
        }
    });
    (0, actions_1.registerAction2)(class QuickAccessAction extends actions_1.Action2 {
        constructor() {
            super({
                id: 'workbench.action.quickOpenWithModes',
                title: (0, nls_1.localize)('quickOpenWithModes', "Quick Open"),
                icon: codicons_1.Codicon.search,
                menu: {
                    id: actions_1.MenuId.CommandCenterCenter,
                    order: 100
                }
            });
        }
        run(accessor) {
            const quickInputService = accessor.get(quickInput_1.IQuickInputService);
            quickInputService.quickAccess.show(undefined, {
                preserveValue: true,
                providerOptions: {
                    includeHelp: true,
                    from: 'commandCenter',
                }
            });
        }
    });
    commands_1.CommandsRegistry.registerCommand('workbench.action.quickOpenPreviousEditor', async (accessor) => {
        const quickInputService = accessor.get(quickInput_1.IQuickInputService);
        quickInputService.quickAccess.show('', { itemActivation: quickInput_1.ItemActivation.SECOND });
    });
    //#endregion
    //#region Workbench actions
    class BaseQuickAccessNavigateAction extends actions_1.Action2 {
        constructor(id, title, next, quickNavigate, keybinding) {
            super({ id, title, f1: true, keybinding });
            this.id = id;
            this.next = next;
            this.quickNavigate = quickNavigate;
        }
        async run(accessor) {
            const keybindingService = accessor.get(keybinding_1.IKeybindingService);
            const quickInputService = accessor.get(quickInput_1.IQuickInputService);
            const keys = keybindingService.lookupKeybindings(this.id);
            const quickNavigate = this.quickNavigate ? { keybindings: keys } : undefined;
            quickInputService.navigate(this.next, quickNavigate);
        }
    }
    class QuickAccessNavigateNextAction extends BaseQuickAccessNavigateAction {
        constructor() {
            super('workbench.action.quickOpenNavigateNext', { value: (0, nls_1.localize)('quickNavigateNext', "Navigate Next in Quick Open"), original: 'Navigate Next in Quick Open' }, true, true);
        }
    }
    class QuickAccessNavigatePreviousAction extends BaseQuickAccessNavigateAction {
        constructor() {
            super('workbench.action.quickOpenNavigatePrevious', { value: (0, nls_1.localize)('quickNavigatePrevious', "Navigate Previous in Quick Open"), original: 'Navigate Previous in Quick Open' }, false, true);
        }
    }
    class QuickAccessSelectNextAction extends BaseQuickAccessNavigateAction {
        constructor() {
            super('workbench.action.quickOpenSelectNext', { value: (0, nls_1.localize)('quickSelectNext', "Select Next in Quick Open"), original: 'Select Next in Quick Open' }, true, false, {
                weight: 200 /* KeybindingWeight.WorkbenchContrib */ + 50,
                when: quickaccess_1.inQuickPickContext,
                primary: 0,
                mac: { primary: 256 /* KeyMod.WinCtrl */ | 44 /* KeyCode.KeyN */ }
            });
        }
    }
    class QuickAccessSelectPreviousAction extends BaseQuickAccessNavigateAction {
        constructor() {
            super('workbench.action.quickOpenSelectPrevious', { value: (0, nls_1.localize)('quickSelectPrevious', "Select Previous in Quick Open"), original: 'Select Previous in Quick Open' }, false, false, {
                weight: 200 /* KeybindingWeight.WorkbenchContrib */ + 50,
                when: quickaccess_1.inQuickPickContext,
                primary: 0,
                mac: { primary: 256 /* KeyMod.WinCtrl */ | 46 /* KeyCode.KeyP */ }
            });
        }
    }
    (0, actions_1.registerAction2)(QuickAccessSelectNextAction);
    (0, actions_1.registerAction2)(QuickAccessSelectPreviousAction);
    (0, actions_1.registerAction2)(QuickAccessNavigateNextAction);
    (0, actions_1.registerAction2)(QuickAccessNavigatePreviousAction);
});
//#endregion
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicXVpY2tBY2Nlc3NBY3Rpb25zLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2Jyb3dzZXIvYWN0aW9ucy9xdWlja0FjY2Vzc0FjdGlvbnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7SUFlaEcsbURBQW1EO0lBRW5ELE1BQU0sMkJBQTJCLEdBQUc7UUFDbkMsT0FBTyxFQUFFLGlEQUE2QjtRQUN0QyxTQUFTLEVBQUUsQ0FBQyxpREFBNkIsQ0FBQztRQUMxQyxHQUFHLEVBQUUsRUFBRSxPQUFPLEVBQUUsaURBQTZCLEVBQUUsU0FBUyxFQUFFLFNBQVMsRUFBRTtLQUNyRSxDQUFDO0lBRUYseUNBQW1CLENBQUMsZ0NBQWdDLENBQUM7UUFDcEQsRUFBRSxFQUFFLGlDQUFpQztRQUNyQyxNQUFNLDZDQUFtQztRQUN6QyxJQUFJLEVBQUUsZ0NBQWtCO1FBQ3hCLE9BQU8sd0JBQWdCLEVBQUUsU0FBUyxFQUFFLENBQUMsZ0RBQTZCLENBQUM7UUFDbkUsT0FBTyxFQUFFLFFBQVEsQ0FBQyxFQUFFO1lBQ25CLE1BQU0saUJBQWlCLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQywrQkFBa0IsQ0FBQyxDQUFDO1lBQzNELE9BQU8saUJBQWlCLENBQUMsTUFBTSxFQUFFLENBQUM7UUFDbkMsQ0FBQztLQUNELENBQUMsQ0FBQztJQUVILHlDQUFtQixDQUFDLGdDQUFnQyxDQUFDO1FBQ3BELEVBQUUsRUFBRSw4Q0FBOEM7UUFDbEQsTUFBTSw2Q0FBbUM7UUFDekMsSUFBSSxFQUFFLGdDQUFrQjtRQUN4QixPQUFPLEVBQUUsQ0FBQztRQUNWLE9BQU8sRUFBRSxRQUFRLENBQUMsRUFBRTtZQUNuQixNQUFNLGlCQUFpQixHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMsK0JBQWtCLENBQUMsQ0FBQztZQUMzRCxPQUFPLGlCQUFpQixDQUFDLE1BQU0sRUFBRSxDQUFDO1FBQ25DLENBQUM7S0FDRCxDQUFDLENBQUM7SUFFSCx5Q0FBbUIsQ0FBQyxnQ0FBZ0MsQ0FBQztRQUNwRCxFQUFFLEVBQUUseURBQXlEO1FBQzdELE1BQU0sNkNBQW1DO1FBQ3pDLElBQUksRUFBRSxnQ0FBa0I7UUFDeEIsT0FBTyxFQUFFLENBQUM7UUFDVixPQUFPLEVBQUUsUUFBUSxDQUFDLEVBQUU7WUFDbkIsTUFBTSxpQkFBaUIsR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLCtCQUFrQixDQUFDLENBQUM7WUFDM0QsT0FBTyxpQkFBaUIsQ0FBQyxNQUFNLENBQUMsRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLEdBQUcsRUFBRSxLQUFLLEVBQUUsQ0FBQyxDQUFDO1FBQ2hFLENBQUM7S0FDRCxDQUFDLENBQUM7SUFFSCx5Q0FBbUIsQ0FBQyxnQ0FBZ0MsQ0FBQztRQUNwRCxFQUFFLEVBQUUsaUNBQWlDO1FBQ3JDLE1BQU0sNkNBQW1DO1FBQ3pDLElBQUksRUFBRSxnQ0FBa0I7UUFDeEIsT0FBTyxFQUFFLENBQUM7UUFDVixPQUFPLEVBQUUsUUFBUSxDQUFDLEVBQUU7WUFDbkIsTUFBTSxpQkFBaUIsR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLCtCQUFrQixDQUFDLENBQUM7WUFDM0QsaUJBQWlCLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDM0IsQ0FBQztLQUNELENBQUMsQ0FBQztJQUVILE1BQU0scUNBQXFDLEdBQUcsb0RBQW9ELENBQUM7SUFDbkcseUNBQW1CLENBQUMsZ0NBQWdDLENBQUM7UUFDcEQsRUFBRSxFQUFFLHFDQUFxQztRQUN6QyxNQUFNLEVBQUUsOENBQW9DLEVBQUU7UUFDOUMsT0FBTyxFQUFFLElBQUEscUNBQXVCLEVBQUMscUNBQXFDLEVBQUUsSUFBSSxDQUFDO1FBQzdFLElBQUksRUFBRSx1Q0FBeUI7UUFDL0IsT0FBTyxFQUFFLDJCQUEyQixDQUFDLE9BQU87UUFDNUMsU0FBUyxFQUFFLDJCQUEyQixDQUFDLFNBQVM7UUFDaEQsR0FBRyxFQUFFLDJCQUEyQixDQUFDLEdBQUc7S0FDcEMsQ0FBQyxDQUFDO0lBRUgsTUFBTSx5Q0FBeUMsR0FBRyx3REFBd0QsQ0FBQztJQUMzRyx5Q0FBbUIsQ0FBQyxnQ0FBZ0MsQ0FBQztRQUNwRCxFQUFFLEVBQUUseUNBQXlDO1FBQzdDLE1BQU0sRUFBRSw4Q0FBb0MsRUFBRTtRQUM5QyxPQUFPLEVBQUUsSUFBQSxxQ0FBdUIsRUFBQyx5Q0FBeUMsRUFBRSxLQUFLLENBQUM7UUFDbEYsSUFBSSxFQUFFLHVDQUF5QjtRQUMvQixPQUFPLEVBQUUsMkJBQTJCLENBQUMsT0FBTywwQkFBZTtRQUMzRCxTQUFTLEVBQUUsQ0FBQywyQkFBMkIsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLDBCQUFlLENBQUM7UUFDcEUsR0FBRyxFQUFFO1lBQ0osT0FBTyxFQUFFLDJCQUEyQixDQUFDLEdBQUcsQ0FBQyxPQUFPLDBCQUFlO1lBQy9ELFNBQVMsRUFBRSxTQUFTO1NBQ3BCO0tBQ0QsQ0FBQyxDQUFDO0lBRUgseUNBQW1CLENBQUMsZ0NBQWdDLENBQUM7UUFDcEQsRUFBRSxFQUFFLHNDQUFzQztRQUMxQyxNQUFNLDZDQUFtQztRQUN6QyxJQUFJLEVBQUUsZ0NBQWtCO1FBQ3hCLE9BQU8sRUFBRSxDQUFDO1FBQ1YsT0FBTyxFQUFFLFFBQVEsQ0FBQyxFQUFFO1lBQ25CLE1BQU0saUJBQWlCLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQywrQkFBa0IsQ0FBQyxDQUFDO1lBQzNELGlCQUFpQixDQUFDLE1BQU0sRUFBRSxDQUFDO1FBQzVCLENBQUM7S0FDRCxDQUFDLENBQUM7SUFFSCx5Q0FBbUIsQ0FBQyxnQ0FBZ0MsQ0FBQztRQUNwRCxFQUFFLEVBQUUsaUNBQWlDO1FBQ3JDLE1BQU0sRUFBRSw4Q0FBb0MsRUFBRTtRQUM5QyxJQUFJLEVBQUUsZ0NBQWtCO1FBQ3hCLE9BQU8sRUFBRSxDQUFDO1FBQ1YsR0FBRyxFQUFFLEVBQUUsT0FBTyxFQUFFLGlEQUE4QixFQUFFO1FBQ2hELEdBQUcsRUFBRSxFQUFFLE9BQU8sRUFBRSxpREFBOEIsRUFBRTtRQUNoRCxLQUFLLEVBQUUsRUFBRSxPQUFPLEVBQUUsZ0RBQTJCLHlCQUFnQixFQUFFO1FBQy9ELE9BQU8sRUFBRSxRQUFRLENBQUMsRUFBRTtZQUNuQixNQUFNLGlCQUFpQixHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMsK0JBQWtCLENBQUMsQ0FBQztZQUMzRCxpQkFBaUIsQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUMxQixDQUFDO0tBQ0QsQ0FBQyxDQUFDO0lBRUgsSUFBQSx5QkFBZSxFQUFDLE1BQU0saUJBQWtCLFNBQVEsaUJBQU87UUFDdEQ7WUFDQyxLQUFLLENBQUM7Z0JBQ0wsRUFBRSxFQUFFLDRCQUE0QjtnQkFDaEMsS0FBSyxFQUFFO29CQUNOLEtBQUssRUFBRSxJQUFBLGNBQVEsRUFBQyxXQUFXLEVBQUUsZUFBZSxDQUFDO29CQUM3QyxRQUFRLEVBQUUsZUFBZTtpQkFDekI7Z0JBQ0QsV0FBVyxFQUFFO29CQUNaLFdBQVcsRUFBRSxjQUFjO29CQUMzQixJQUFJLEVBQUUsQ0FBQzs0QkFDTixJQUFJLEVBQUUsUUFBUTs0QkFDZCxNQUFNLEVBQUU7Z0NBQ1AsTUFBTSxFQUFFLFFBQVE7NkJBQ2hCO3lCQUNELENBQUM7aUJBQ0Y7Z0JBQ0QsVUFBVSxFQUFFO29CQUNYLE1BQU0sNkNBQW1DO29CQUN6QyxPQUFPLEVBQUUsMkJBQTJCLENBQUMsT0FBTztvQkFDNUMsU0FBUyxFQUFFLDJCQUEyQixDQUFDLFNBQVM7b0JBQ2hELEdBQUcsRUFBRSwyQkFBMkIsQ0FBQyxHQUFHO2lCQUNwQztnQkFDRCxFQUFFLEVBQUUsSUFBSTthQUNSLENBQUMsQ0FBQztRQUNKLENBQUM7UUFFRCxHQUFHLENBQUMsUUFBMEIsRUFBRSxNQUFpQjtZQUNoRCxNQUFNLGlCQUFpQixHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMsK0JBQWtCLENBQUMsQ0FBQztZQUMzRCxpQkFBaUIsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLE9BQU8sTUFBTSxLQUFLLFFBQVEsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxTQUFTLEVBQUUsRUFBRSxhQUFhLEVBQUUsT0FBTyxNQUFNLEtBQUssUUFBUSxDQUFDLGdDQUFnQyxFQUFFLENBQUMsQ0FBQztRQUNySyxDQUFDO0tBQ0QsQ0FBQyxDQUFDO0lBRUgsSUFBQSx5QkFBZSxFQUFDLE1BQU0saUJBQWtCLFNBQVEsaUJBQU87UUFDdEQ7WUFDQyxLQUFLLENBQUM7Z0JBQ0wsRUFBRSxFQUFFLHFDQUFxQztnQkFDekMsS0FBSyxFQUFFLElBQUEsY0FBUSxFQUFDLG9CQUFvQixFQUFFLFlBQVksQ0FBQztnQkFDbkQsSUFBSSxFQUFFLGtCQUFPLENBQUMsTUFBTTtnQkFDcEIsSUFBSSxFQUFFO29CQUNMLEVBQUUsRUFBRSxnQkFBTSxDQUFDLG1CQUFtQjtvQkFDOUIsS0FBSyxFQUFFLEdBQUc7aUJBQ1Y7YUFDRCxDQUFDLENBQUM7UUFDSixDQUFDO1FBRUQsR0FBRyxDQUFDLFFBQTBCO1lBQzdCLE1BQU0saUJBQWlCLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQywrQkFBa0IsQ0FBQyxDQUFDO1lBQzNELGlCQUFpQixDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFO2dCQUM3QyxhQUFhLEVBQUUsSUFBSTtnQkFDbkIsZUFBZSxFQUFFO29CQUNoQixXQUFXLEVBQUUsSUFBSTtvQkFDakIsSUFBSSxFQUFFLGVBQWU7aUJBQ29CO2FBQzFDLENBQUMsQ0FBQztRQUNKLENBQUM7S0FDRCxDQUFDLENBQUM7SUFFSCwyQkFBZ0IsQ0FBQyxlQUFlLENBQUMsMENBQTBDLEVBQUUsS0FBSyxFQUFDLFFBQVEsRUFBQyxFQUFFO1FBQzdGLE1BQU0saUJBQWlCLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQywrQkFBa0IsQ0FBQyxDQUFDO1FBRTNELGlCQUFpQixDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsRUFBRSxFQUFFLEVBQUUsY0FBYyxFQUFFLDJCQUFjLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQztJQUNuRixDQUFDLENBQUMsQ0FBQztJQUVILFlBQVk7SUFFWiwyQkFBMkI7SUFFM0IsTUFBTSw2QkFBOEIsU0FBUSxpQkFBTztRQUVsRCxZQUNTLEVBQVUsRUFDbEIsS0FBdUIsRUFDZixJQUFhLEVBQ2IsYUFBc0IsRUFDOUIsVUFBd0M7WUFFeEMsS0FBSyxDQUFDLEVBQUUsRUFBRSxFQUFFLEtBQUssRUFBRSxFQUFFLEVBQUUsSUFBSSxFQUFFLFVBQVUsRUFBRSxDQUFDLENBQUM7WUFObkMsT0FBRSxHQUFGLEVBQUUsQ0FBUTtZQUVWLFNBQUksR0FBSixJQUFJLENBQVM7WUFDYixrQkFBYSxHQUFiLGFBQWEsQ0FBUztRQUkvQixDQUFDO1FBRUQsS0FBSyxDQUFDLEdBQUcsQ0FBQyxRQUEwQjtZQUNuQyxNQUFNLGlCQUFpQixHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMsK0JBQWtCLENBQUMsQ0FBQztZQUMzRCxNQUFNLGlCQUFpQixHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMsK0JBQWtCLENBQUMsQ0FBQztZQUUzRCxNQUFNLElBQUksR0FBRyxpQkFBaUIsQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7WUFDMUQsTUFBTSxhQUFhLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUMsRUFBRSxXQUFXLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQztZQUU3RSxpQkFBaUIsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxhQUFhLENBQUMsQ0FBQztRQUN0RCxDQUFDO0tBQ0Q7SUFFRCxNQUFNLDZCQUE4QixTQUFRLDZCQUE2QjtRQUV4RTtZQUNDLEtBQUssQ0FBQyx3Q0FBd0MsRUFBRSxFQUFFLEtBQUssRUFBRSxJQUFBLGNBQVEsRUFBQyxtQkFBbUIsRUFBRSw2QkFBNkIsQ0FBQyxFQUFFLFFBQVEsRUFBRSw2QkFBNkIsRUFBRSxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQztRQUMvSyxDQUFDO0tBQ0Q7SUFFRCxNQUFNLGlDQUFrQyxTQUFRLDZCQUE2QjtRQUU1RTtZQUNDLEtBQUssQ0FBQyw0Q0FBNEMsRUFBRSxFQUFFLEtBQUssRUFBRSxJQUFBLGNBQVEsRUFBQyx1QkFBdUIsRUFBRSxpQ0FBaUMsQ0FBQyxFQUFFLFFBQVEsRUFBRSxpQ0FBaUMsRUFBRSxFQUFFLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQztRQUNoTSxDQUFDO0tBQ0Q7SUFFRCxNQUFNLDJCQUE0QixTQUFRLDZCQUE2QjtRQUV0RTtZQUNDLEtBQUssQ0FDSixzQ0FBc0MsRUFDdEMsRUFBRSxLQUFLLEVBQUUsSUFBQSxjQUFRLEVBQUMsaUJBQWlCLEVBQUUsMkJBQTJCLENBQUMsRUFBRSxRQUFRLEVBQUUsMkJBQTJCLEVBQUUsRUFDMUcsSUFBSSxFQUNKLEtBQUssRUFDTDtnQkFDQyxNQUFNLEVBQUUsOENBQW9DLEVBQUU7Z0JBQzlDLElBQUksRUFBRSxnQ0FBa0I7Z0JBQ3hCLE9BQU8sRUFBRSxDQUFDO2dCQUNWLEdBQUcsRUFBRSxFQUFFLE9BQU8sRUFBRSxnREFBNkIsRUFBRTthQUMvQyxDQUNELENBQUM7UUFDSCxDQUFDO0tBQ0Q7SUFFRCxNQUFNLCtCQUFnQyxTQUFRLDZCQUE2QjtRQUUxRTtZQUNDLEtBQUssQ0FDSiwwQ0FBMEMsRUFDMUMsRUFBRSxLQUFLLEVBQUUsSUFBQSxjQUFRLEVBQUMscUJBQXFCLEVBQUUsK0JBQStCLENBQUMsRUFBRSxRQUFRLEVBQUUsK0JBQStCLEVBQUUsRUFDdEgsS0FBSyxFQUNMLEtBQUssRUFDTDtnQkFDQyxNQUFNLEVBQUUsOENBQW9DLEVBQUU7Z0JBQzlDLElBQUksRUFBRSxnQ0FBa0I7Z0JBQ3hCLE9BQU8sRUFBRSxDQUFDO2dCQUNWLEdBQUcsRUFBRSxFQUFFLE9BQU8sRUFBRSxnREFBNkIsRUFBRTthQUMvQyxDQUNELENBQUM7UUFDSCxDQUFDO0tBQ0Q7SUFFRCxJQUFBLHlCQUFlLEVBQUMsMkJBQTJCLENBQUMsQ0FBQztJQUM3QyxJQUFBLHlCQUFlLEVBQUMsK0JBQStCLENBQUMsQ0FBQztJQUNqRCxJQUFBLHlCQUFlLEVBQUMsNkJBQTZCLENBQUMsQ0FBQztJQUMvQyxJQUFBLHlCQUFlLEVBQUMsaUNBQWlDLENBQUMsQ0FBQzs7QUFFbkQsWUFBWSJ9