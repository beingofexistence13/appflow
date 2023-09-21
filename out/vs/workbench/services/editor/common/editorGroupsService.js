/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/instantiation/common/instantiation", "vs/workbench/common/editor"], function (require, exports, instantiation_1, editor_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.preferredSideBySideGroupDirection = exports.isEditorGroup = exports.OpenEditorContext = exports.GroupsOrder = exports.isEditorReplacement = exports.MergeGroupMode = exports.GroupsArrangement = exports.GroupLocation = exports.GroupOrientation = exports.GroupDirection = exports.IEditorGroupsService = void 0;
    exports.IEditorGroupsService = (0, instantiation_1.createDecorator)('editorGroupsService');
    var GroupDirection;
    (function (GroupDirection) {
        GroupDirection[GroupDirection["UP"] = 0] = "UP";
        GroupDirection[GroupDirection["DOWN"] = 1] = "DOWN";
        GroupDirection[GroupDirection["LEFT"] = 2] = "LEFT";
        GroupDirection[GroupDirection["RIGHT"] = 3] = "RIGHT";
    })(GroupDirection || (exports.GroupDirection = GroupDirection = {}));
    var GroupOrientation;
    (function (GroupOrientation) {
        GroupOrientation[GroupOrientation["HORIZONTAL"] = 0] = "HORIZONTAL";
        GroupOrientation[GroupOrientation["VERTICAL"] = 1] = "VERTICAL";
    })(GroupOrientation || (exports.GroupOrientation = GroupOrientation = {}));
    var GroupLocation;
    (function (GroupLocation) {
        GroupLocation[GroupLocation["FIRST"] = 0] = "FIRST";
        GroupLocation[GroupLocation["LAST"] = 1] = "LAST";
        GroupLocation[GroupLocation["NEXT"] = 2] = "NEXT";
        GroupLocation[GroupLocation["PREVIOUS"] = 3] = "PREVIOUS";
    })(GroupLocation || (exports.GroupLocation = GroupLocation = {}));
    var GroupsArrangement;
    (function (GroupsArrangement) {
        /**
         * Make the current active group consume the maximum
         * amount of space possible.
         */
        GroupsArrangement[GroupsArrangement["MAXIMIZE"] = 0] = "MAXIMIZE";
        /**
         * Size all groups evenly.
         */
        GroupsArrangement[GroupsArrangement["EVEN"] = 1] = "EVEN";
        /**
         * Will behave like MINIMIZE_OTHERS if the active
         * group is not already maximized and EVEN otherwise
         */
        GroupsArrangement[GroupsArrangement["TOGGLE"] = 2] = "TOGGLE";
    })(GroupsArrangement || (exports.GroupsArrangement = GroupsArrangement = {}));
    var MergeGroupMode;
    (function (MergeGroupMode) {
        MergeGroupMode[MergeGroupMode["COPY_EDITORS"] = 0] = "COPY_EDITORS";
        MergeGroupMode[MergeGroupMode["MOVE_EDITORS"] = 1] = "MOVE_EDITORS";
    })(MergeGroupMode || (exports.MergeGroupMode = MergeGroupMode = {}));
    function isEditorReplacement(replacement) {
        const candidate = replacement;
        return (0, editor_1.isEditorInput)(candidate?.editor) && (0, editor_1.isEditorInput)(candidate?.replacement);
    }
    exports.isEditorReplacement = isEditorReplacement;
    var GroupsOrder;
    (function (GroupsOrder) {
        /**
         * Groups sorted by creation order (oldest one first)
         */
        GroupsOrder[GroupsOrder["CREATION_TIME"] = 0] = "CREATION_TIME";
        /**
         * Groups sorted by most recent activity (most recent active first)
         */
        GroupsOrder[GroupsOrder["MOST_RECENTLY_ACTIVE"] = 1] = "MOST_RECENTLY_ACTIVE";
        /**
         * Groups sorted by grid widget order
         */
        GroupsOrder[GroupsOrder["GRID_APPEARANCE"] = 2] = "GRID_APPEARANCE";
    })(GroupsOrder || (exports.GroupsOrder = GroupsOrder = {}));
    var OpenEditorContext;
    (function (OpenEditorContext) {
        OpenEditorContext[OpenEditorContext["NEW_EDITOR"] = 1] = "NEW_EDITOR";
        OpenEditorContext[OpenEditorContext["MOVE_EDITOR"] = 2] = "MOVE_EDITOR";
        OpenEditorContext[OpenEditorContext["COPY_EDITOR"] = 3] = "COPY_EDITOR";
    })(OpenEditorContext || (exports.OpenEditorContext = OpenEditorContext = {}));
    function isEditorGroup(obj) {
        const group = obj;
        return !!group && typeof group.id === 'number' && Array.isArray(group.editors);
    }
    exports.isEditorGroup = isEditorGroup;
    //#region Editor Group Helpers
    function preferredSideBySideGroupDirection(configurationService) {
        const openSideBySideDirection = configurationService.getValue('workbench.editor.openSideBySideDirection');
        if (openSideBySideDirection === 'down') {
            return 1 /* GroupDirection.DOWN */;
        }
        return 3 /* GroupDirection.RIGHT */;
    }
    exports.preferredSideBySideGroupDirection = preferredSideBySideGroupDirection;
});
//#endregion
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWRpdG9yR3JvdXBzU2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9zZXJ2aWNlcy9lZGl0b3IvY29tbW9uL2VkaXRvckdyb3Vwc1NlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBY25GLFFBQUEsb0JBQW9CLEdBQUcsSUFBQSwrQkFBZSxFQUF1QixxQkFBcUIsQ0FBQyxDQUFDO0lBRWpHLElBQWtCLGNBS2pCO0lBTEQsV0FBa0IsY0FBYztRQUMvQiwrQ0FBRSxDQUFBO1FBQ0YsbURBQUksQ0FBQTtRQUNKLG1EQUFJLENBQUE7UUFDSixxREFBSyxDQUFBO0lBQ04sQ0FBQyxFQUxpQixjQUFjLDhCQUFkLGNBQWMsUUFLL0I7SUFFRCxJQUFrQixnQkFHakI7SUFIRCxXQUFrQixnQkFBZ0I7UUFDakMsbUVBQVUsQ0FBQTtRQUNWLCtEQUFRLENBQUE7SUFDVCxDQUFDLEVBSGlCLGdCQUFnQixnQ0FBaEIsZ0JBQWdCLFFBR2pDO0lBRUQsSUFBa0IsYUFLakI7SUFMRCxXQUFrQixhQUFhO1FBQzlCLG1EQUFLLENBQUE7UUFDTCxpREFBSSxDQUFBO1FBQ0osaURBQUksQ0FBQTtRQUNKLHlEQUFRLENBQUE7SUFDVCxDQUFDLEVBTGlCLGFBQWEsNkJBQWIsYUFBYSxRQUs5QjtJQU9ELElBQWtCLGlCQWtCakI7SUFsQkQsV0FBa0IsaUJBQWlCO1FBRWxDOzs7V0FHRztRQUNILGlFQUFRLENBQUE7UUFFUjs7V0FFRztRQUNILHlEQUFJLENBQUE7UUFFSjs7O1dBR0c7UUFDSCw2REFBTSxDQUFBO0lBQ1AsQ0FBQyxFQWxCaUIsaUJBQWlCLGlDQUFqQixpQkFBaUIsUUFrQmxDO0lBZ0NELElBQWtCLGNBR2pCO0lBSEQsV0FBa0IsY0FBYztRQUMvQixtRUFBWSxDQUFBO1FBQ1osbUVBQVksQ0FBQTtJQUNiLENBQUMsRUFIaUIsY0FBYyw4QkFBZCxjQUFjLFFBRy9CO0lBa0NELFNBQWdCLG1CQUFtQixDQUFDLFdBQW9CO1FBQ3ZELE1BQU0sU0FBUyxHQUFHLFdBQTZDLENBQUM7UUFFaEUsT0FBTyxJQUFBLHNCQUFhLEVBQUMsU0FBUyxFQUFFLE1BQU0sQ0FBQyxJQUFJLElBQUEsc0JBQWEsRUFBQyxTQUFTLEVBQUUsV0FBVyxDQUFDLENBQUM7SUFDbEYsQ0FBQztJQUpELGtEQUlDO0lBRUQsSUFBa0IsV0FnQmpCO0lBaEJELFdBQWtCLFdBQVc7UUFFNUI7O1dBRUc7UUFDSCwrREFBYSxDQUFBO1FBRWI7O1dBRUc7UUFDSCw2RUFBb0IsQ0FBQTtRQUVwQjs7V0FFRztRQUNILG1FQUFlLENBQUE7SUFDaEIsQ0FBQyxFQWhCaUIsV0FBVywyQkFBWCxXQUFXLFFBZ0I1QjtJQStRRCxJQUFrQixpQkFJakI7SUFKRCxXQUFrQixpQkFBaUI7UUFDbEMscUVBQWMsQ0FBQTtRQUNkLHVFQUFlLENBQUE7UUFDZix1RUFBZSxDQUFBO0lBQ2hCLENBQUMsRUFKaUIsaUJBQWlCLGlDQUFqQixpQkFBaUIsUUFJbEM7SUFnVEQsU0FBZ0IsYUFBYSxDQUFDLEdBQVk7UUFDekMsTUFBTSxLQUFLLEdBQUcsR0FBK0IsQ0FBQztRQUU5QyxPQUFPLENBQUMsQ0FBQyxLQUFLLElBQUksT0FBTyxLQUFLLENBQUMsRUFBRSxLQUFLLFFBQVEsSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUNoRixDQUFDO0lBSkQsc0NBSUM7SUFFRCw4QkFBOEI7SUFFOUIsU0FBZ0IsaUNBQWlDLENBQUMsb0JBQTJDO1FBQzVGLE1BQU0sdUJBQXVCLEdBQUcsb0JBQW9CLENBQUMsUUFBUSxDQUFDLDBDQUEwQyxDQUFDLENBQUM7UUFFMUcsSUFBSSx1QkFBdUIsS0FBSyxNQUFNLEVBQUU7WUFDdkMsbUNBQTJCO1NBQzNCO1FBRUQsb0NBQTRCO0lBQzdCLENBQUM7SUFSRCw4RUFRQzs7QUFFRCxZQUFZIn0=