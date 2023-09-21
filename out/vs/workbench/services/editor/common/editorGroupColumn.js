/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/workbench/services/editor/common/editorGroupsService", "vs/workbench/services/editor/common/editorService"], function (require, exports, editorGroupsService_1, editorService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.editorGroupToColumn = exports.columnToEditorGroup = void 0;
    function columnToEditorGroup(editorGroupService, configurationService, column = editorService_1.ACTIVE_GROUP) {
        if (column === editorService_1.ACTIVE_GROUP || column === editorService_1.SIDE_GROUP) {
            return column; // return early for when column is well known
        }
        let groupInColumn = editorGroupService.getGroups(2 /* GroupsOrder.GRID_APPEARANCE */)[column];
        // If a column is asked for that does not exist, we create up to 9 columns in accordance
        // to what `ViewColumn` provides and otherwise fallback to `SIDE_GROUP`.
        if (!groupInColumn && column < 9) {
            for (let i = 0; i <= column; i++) {
                const editorGroups = editorGroupService.getGroups(2 /* GroupsOrder.GRID_APPEARANCE */);
                if (!editorGroups[i]) {
                    editorGroupService.addGroup(editorGroups[i - 1], (0, editorGroupsService_1.preferredSideBySideGroupDirection)(configurationService));
                }
            }
            groupInColumn = editorGroupService.getGroups(2 /* GroupsOrder.GRID_APPEARANCE */)[column];
        }
        return groupInColumn?.id ?? editorService_1.SIDE_GROUP; // finally open to the side when group not found
    }
    exports.columnToEditorGroup = columnToEditorGroup;
    function editorGroupToColumn(editorGroupService, editorGroup) {
        const group = (typeof editorGroup === 'number') ? editorGroupService.getGroup(editorGroup) : editorGroup;
        return editorGroupService.getGroups(2 /* GroupsOrder.GRID_APPEARANCE */).indexOf(group ?? editorGroupService.activeGroup);
    }
    exports.editorGroupToColumn = editorGroupToColumn;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWRpdG9yR3JvdXBDb2x1bW4uanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvc2VydmljZXMvZWRpdG9yL2NvbW1vbi9lZGl0b3JHcm91cENvbHVtbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFjaEcsU0FBZ0IsbUJBQW1CLENBQUMsa0JBQXdDLEVBQUUsb0JBQTJDLEVBQUUsTUFBTSxHQUFHLDRCQUFZO1FBQy9JLElBQUksTUFBTSxLQUFLLDRCQUFZLElBQUksTUFBTSxLQUFLLDBCQUFVLEVBQUU7WUFDckQsT0FBTyxNQUFNLENBQUMsQ0FBQyw2Q0FBNkM7U0FDNUQ7UUFFRCxJQUFJLGFBQWEsR0FBRyxrQkFBa0IsQ0FBQyxTQUFTLHFDQUE2QixDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBRXRGLHdGQUF3RjtRQUN4Rix3RUFBd0U7UUFFeEUsSUFBSSxDQUFDLGFBQWEsSUFBSSxNQUFNLEdBQUcsQ0FBQyxFQUFFO1lBQ2pDLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsSUFBSSxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7Z0JBQ2pDLE1BQU0sWUFBWSxHQUFHLGtCQUFrQixDQUFDLFNBQVMscUNBQTZCLENBQUM7Z0JBQy9FLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLEVBQUU7b0JBQ3JCLGtCQUFrQixDQUFDLFFBQVEsQ0FBQyxZQUFZLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLElBQUEsdURBQWlDLEVBQUMsb0JBQW9CLENBQUMsQ0FBQyxDQUFDO2lCQUMxRzthQUNEO1lBRUQsYUFBYSxHQUFHLGtCQUFrQixDQUFDLFNBQVMscUNBQTZCLENBQUMsTUFBTSxDQUFDLENBQUM7U0FDbEY7UUFFRCxPQUFPLGFBQWEsRUFBRSxFQUFFLElBQUksMEJBQVUsQ0FBQyxDQUFDLGdEQUFnRDtJQUN6RixDQUFDO0lBdEJELGtEQXNCQztJQUVELFNBQWdCLG1CQUFtQixDQUFDLGtCQUF3QyxFQUFFLFdBQTJDO1FBQ3hILE1BQU0sS0FBSyxHQUFHLENBQUMsT0FBTyxXQUFXLEtBQUssUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLGtCQUFrQixDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUMsV0FBVyxDQUFDO1FBRXpHLE9BQU8sa0JBQWtCLENBQUMsU0FBUyxxQ0FBNkIsQ0FBQyxPQUFPLENBQUMsS0FBSyxJQUFJLGtCQUFrQixDQUFDLFdBQVcsQ0FBQyxDQUFDO0lBQ25ILENBQUM7SUFKRCxrREFJQyJ9