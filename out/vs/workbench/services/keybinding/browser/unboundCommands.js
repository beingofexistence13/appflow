/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/commands/common/commands", "vs/base/common/arrays", "vs/editor/browser/editorExtensions", "vs/platform/actions/common/actions"], function (require, exports, commands_1, arrays_1, editorExtensions_1, actions_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getAllUnboundCommands = void 0;
    function getAllUnboundCommands(boundCommands) {
        const unboundCommands = [];
        const seenMap = new Map();
        const addCommand = (id, includeCommandWithArgs) => {
            if (seenMap.has(id)) {
                return;
            }
            seenMap.set(id, true);
            if (id[0] === '_' || id.indexOf('vscode.') === 0) { // private command
                return;
            }
            if (boundCommands.get(id) === true) {
                return;
            }
            if (!includeCommandWithArgs) {
                const command = commands_1.CommandsRegistry.getCommand(id);
                if (command && typeof command.description === 'object'
                    && (0, arrays_1.isNonEmptyArray)(command.description.args)) { // command with args
                    return;
                }
            }
            unboundCommands.push(id);
        };
        // Add all commands from Command Palette
        for (const menuItem of actions_1.MenuRegistry.getMenuItems(actions_1.MenuId.CommandPalette)) {
            if ((0, actions_1.isIMenuItem)(menuItem)) {
                addCommand(menuItem.command.id, true);
            }
        }
        // Add all editor actions
        for (const editorAction of editorExtensions_1.EditorExtensionsRegistry.getEditorActions()) {
            addCommand(editorAction.id, true);
        }
        for (const id of commands_1.CommandsRegistry.getCommands().keys()) {
            addCommand(id, false);
        }
        return unboundCommands;
    }
    exports.getAllUnboundCommands = getAllUnboundCommands;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidW5ib3VuZENvbW1hbmRzLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL3NlcnZpY2VzL2tleWJpbmRpbmcvYnJvd3Nlci91bmJvdW5kQ29tbWFuZHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBT2hHLFNBQWdCLHFCQUFxQixDQUFDLGFBQW1DO1FBQ3hFLE1BQU0sZUFBZSxHQUFhLEVBQUUsQ0FBQztRQUNyQyxNQUFNLE9BQU8sR0FBeUIsSUFBSSxHQUFHLEVBQW1CLENBQUM7UUFDakUsTUFBTSxVQUFVLEdBQUcsQ0FBQyxFQUFVLEVBQUUsc0JBQStCLEVBQUUsRUFBRTtZQUNsRSxJQUFJLE9BQU8sQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUU7Z0JBQ3BCLE9BQU87YUFDUDtZQUNELE9BQU8sQ0FBQyxHQUFHLENBQUMsRUFBRSxFQUFFLElBQUksQ0FBQyxDQUFDO1lBQ3RCLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQyxLQUFLLEdBQUcsSUFBSSxFQUFFLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsRUFBRSxFQUFFLGtCQUFrQjtnQkFDckUsT0FBTzthQUNQO1lBQ0QsSUFBSSxhQUFhLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxLQUFLLElBQUksRUFBRTtnQkFDbkMsT0FBTzthQUNQO1lBQ0QsSUFBSSxDQUFDLHNCQUFzQixFQUFFO2dCQUM1QixNQUFNLE9BQU8sR0FBRywyQkFBZ0IsQ0FBQyxVQUFVLENBQUMsRUFBRSxDQUFDLENBQUM7Z0JBQ2hELElBQUksT0FBTyxJQUFJLE9BQU8sT0FBTyxDQUFDLFdBQVcsS0FBSyxRQUFRO3VCQUNsRCxJQUFBLHdCQUFlLEVBQThCLE9BQU8sQ0FBQyxXQUFZLENBQUMsSUFBSSxDQUFDLEVBQUUsRUFBRSxvQkFBb0I7b0JBQ2xHLE9BQU87aUJBQ1A7YUFDRDtZQUNELGVBQWUsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDMUIsQ0FBQyxDQUFDO1FBRUYsd0NBQXdDO1FBQ3hDLEtBQUssTUFBTSxRQUFRLElBQUksc0JBQVksQ0FBQyxZQUFZLENBQUMsZ0JBQU0sQ0FBQyxjQUFjLENBQUMsRUFBRTtZQUN4RSxJQUFJLElBQUEscUJBQVcsRUFBQyxRQUFRLENBQUMsRUFBRTtnQkFDMUIsVUFBVSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsRUFBRSxFQUFFLElBQUksQ0FBQyxDQUFDO2FBQ3RDO1NBQ0Q7UUFFRCx5QkFBeUI7UUFDekIsS0FBSyxNQUFNLFlBQVksSUFBSSwyQ0FBd0IsQ0FBQyxnQkFBZ0IsRUFBRSxFQUFFO1lBQ3ZFLFVBQVUsQ0FBQyxZQUFZLENBQUMsRUFBRSxFQUFFLElBQUksQ0FBQyxDQUFDO1NBQ2xDO1FBRUQsS0FBSyxNQUFNLEVBQUUsSUFBSSwyQkFBZ0IsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxJQUFJLEVBQUUsRUFBRTtZQUN2RCxVQUFVLENBQUMsRUFBRSxFQUFFLEtBQUssQ0FBQyxDQUFDO1NBQ3RCO1FBRUQsT0FBTyxlQUFlLENBQUM7SUFDeEIsQ0FBQztJQXpDRCxzREF5Q0MifQ==