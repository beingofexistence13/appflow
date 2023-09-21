/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls", "vs/platform/actions/common/actions", "vs/platform/keybinding/common/keybinding", "vs/platform/action/common/actionCommonCategories", "vs/platform/commands/common/commands", "vs/workbench/services/log/common/logConstants"], function (require, exports, nls, actions_1, keybinding_1, actionCommonCategories_1, commands_1, logConstants_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class ToggleKeybindingsLogAction extends actions_1.Action2 {
        constructor() {
            super({
                id: 'workbench.action.toggleKeybindingsLog',
                title: { value: nls.localize('toggleKeybindingsLog', "Toggle Keyboard Shortcuts Troubleshooting"), original: 'Toggle Keyboard Shortcuts Troubleshooting' },
                category: actionCommonCategories_1.Categories.Developer,
                f1: true
            });
        }
        run(accessor) {
            const logging = accessor.get(keybinding_1.IKeybindingService).toggleLogging();
            if (logging) {
                const commandService = accessor.get(commands_1.ICommandService);
                commandService.executeCommand(logConstants_1.showWindowLogActionId);
            }
        }
    }
    (0, actions_1.registerAction2)(ToggleKeybindingsLogAction);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoia2V5YmluZGluZ3MuY29udHJpYnV0aW9uLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIva2V5YmluZGluZ3MvYnJvd3Nlci9rZXliaW5kaW5ncy5jb250cmlidXRpb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7SUFVaEcsTUFBTSwwQkFBMkIsU0FBUSxpQkFBTztRQUUvQztZQUNDLEtBQUssQ0FBQztnQkFDTCxFQUFFLEVBQUUsdUNBQXVDO2dCQUMzQyxLQUFLLEVBQUUsRUFBRSxLQUFLLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQyxzQkFBc0IsRUFBRSwyQ0FBMkMsQ0FBQyxFQUFFLFFBQVEsRUFBRSwyQ0FBMkMsRUFBRTtnQkFDMUosUUFBUSxFQUFFLG1DQUFVLENBQUMsU0FBUztnQkFDOUIsRUFBRSxFQUFFLElBQUk7YUFDUixDQUFDLENBQUM7UUFDSixDQUFDO1FBRUQsR0FBRyxDQUFDLFFBQTBCO1lBQzdCLE1BQU0sT0FBTyxHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMsK0JBQWtCLENBQUMsQ0FBQyxhQUFhLEVBQUUsQ0FBQztZQUNqRSxJQUFJLE9BQU8sRUFBRTtnQkFDWixNQUFNLGNBQWMsR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLDBCQUFlLENBQUMsQ0FBQztnQkFDckQsY0FBYyxDQUFDLGNBQWMsQ0FBQyxvQ0FBcUIsQ0FBQyxDQUFDO2FBQ3JEO1FBQ0YsQ0FBQztLQUNEO0lBRUQsSUFBQSx5QkFBZSxFQUFDLDBCQUEwQixDQUFDLENBQUMifQ==