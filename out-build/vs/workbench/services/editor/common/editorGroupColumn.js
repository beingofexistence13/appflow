/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/workbench/services/editor/common/editorGroupsService", "vs/workbench/services/editor/common/editorService"], function (require, exports, editorGroupsService_1, editorService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$5I = exports.$4I = void 0;
    function $4I(editorGroupService, configurationService, column = editorService_1.$0C) {
        if (column === editorService_1.$0C || column === editorService_1.$$C) {
            return column; // return early for when column is well known
        }
        let groupInColumn = editorGroupService.getGroups(2 /* GroupsOrder.GRID_APPEARANCE */)[column];
        // If a column is asked for that does not exist, we create up to 9 columns in accordance
        // to what `ViewColumn` provides and otherwise fallback to `SIDE_GROUP`.
        if (!groupInColumn && column < 9) {
            for (let i = 0; i <= column; i++) {
                const editorGroups = editorGroupService.getGroups(2 /* GroupsOrder.GRID_APPEARANCE */);
                if (!editorGroups[i]) {
                    editorGroupService.addGroup(editorGroups[i - 1], (0, editorGroupsService_1.$8C)(configurationService));
                }
            }
            groupInColumn = editorGroupService.getGroups(2 /* GroupsOrder.GRID_APPEARANCE */)[column];
        }
        return groupInColumn?.id ?? editorService_1.$$C; // finally open to the side when group not found
    }
    exports.$4I = $4I;
    function $5I(editorGroupService, editorGroup) {
        const group = (typeof editorGroup === 'number') ? editorGroupService.getGroup(editorGroup) : editorGroup;
        return editorGroupService.getGroups(2 /* GroupsOrder.GRID_APPEARANCE */).indexOf(group ?? editorGroupService.activeGroup);
    }
    exports.$5I = $5I;
});
//# sourceMappingURL=editorGroupColumn.js.map