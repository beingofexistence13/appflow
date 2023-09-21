/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/mouseEvent", "vs/base/common/actions", "vs/base/common/arrays", "vs/platform/actions/browser/menuEntryActionViewItem"], function (require, exports, mouseEvent_1, actions_1, arrays_1, menuEntryActionViewItem_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.openContextMenu = void 0;
    class InstanceContext {
        constructor(instance) {
            this._instanceId = instance.instanceId;
        }
        toJSON() {
            return {
                $mid: 15 /* MarshalledId.TerminalContext */,
                instanceId: this._instanceId
            };
        }
    }
    class TerminalContextActionRunner extends actions_1.ActionRunner {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        async runAction(action, context) {
            if (Array.isArray(context) && context.every(e => e instanceof InstanceContext)) {
                // arg1: The (first) focused instance
                // arg2: All selected instances
                await action.run(context?.[0], context);
                return;
            }
            return super.runAction(action, context);
        }
    }
    function openContextMenu(event, contextInstances, menu, contextMenuService, extraActions) {
        const standardEvent = new mouseEvent_1.StandardMouseEvent(event);
        const actions = [];
        (0, menuEntryActionViewItem_1.createAndFillInContextMenuActions)(menu, { shouldForwardArgs: true }, actions);
        if (extraActions) {
            actions.push(...extraActions);
        }
        const context = contextInstances ? (0, arrays_1.asArray)(contextInstances).map(e => new InstanceContext(e)) : [];
        contextMenuService.showContextMenu({
            actionRunner: new TerminalContextActionRunner(),
            getAnchor: () => standardEvent,
            getActions: () => actions,
            getActionsContext: () => context,
        });
    }
    exports.openContextMenu = openContextMenu;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVybWluYWxDb250ZXh0TWVudS5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL3Rlcm1pbmFsL2Jyb3dzZXIvdGVybWluYWxDb250ZXh0TWVudS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFhaEcsTUFBTSxlQUFlO1FBR3BCLFlBQVksUUFBMkI7WUFDdEMsSUFBSSxDQUFDLFdBQVcsR0FBRyxRQUFRLENBQUMsVUFBVSxDQUFDO1FBQ3hDLENBQUM7UUFFRCxNQUFNO1lBQ0wsT0FBTztnQkFDTixJQUFJLHVDQUE4QjtnQkFDbEMsVUFBVSxFQUFFLElBQUksQ0FBQyxXQUFXO2FBQzVCLENBQUM7UUFDSCxDQUFDO0tBQ0Q7SUFFRCxNQUFNLDJCQUE0QixTQUFRLHNCQUFZO1FBRXJELGdFQUFnRTtRQUM3QyxLQUFLLENBQUMsU0FBUyxDQUFDLE1BQWUsRUFBRSxPQUF5QjtZQUM1RSxJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLElBQUksT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsWUFBWSxlQUFlLENBQUMsRUFBRTtnQkFDL0UscUNBQXFDO2dCQUNyQywrQkFBK0I7Z0JBQy9CLE1BQU0sTUFBTSxDQUFDLEdBQUcsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxPQUFPLENBQUMsQ0FBQztnQkFDeEMsT0FBTzthQUNQO1lBQ0QsT0FBTyxLQUFLLENBQUMsU0FBUyxDQUFDLE1BQU0sRUFBRSxPQUFPLENBQUMsQ0FBQztRQUN6QyxDQUFDO0tBQ0Q7SUFFRCxTQUFnQixlQUFlLENBQUMsS0FBaUIsRUFBRSxnQkFBNkQsRUFBRSxJQUFXLEVBQUUsa0JBQXVDLEVBQUUsWUFBd0I7UUFDL0wsTUFBTSxhQUFhLEdBQUcsSUFBSSwrQkFBa0IsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUVwRCxNQUFNLE9BQU8sR0FBYyxFQUFFLENBQUM7UUFFOUIsSUFBQSwyREFBaUMsRUFBQyxJQUFJLEVBQUUsRUFBRSxpQkFBaUIsRUFBRSxJQUFJLEVBQUUsRUFBRSxPQUFPLENBQUMsQ0FBQztRQUU5RSxJQUFJLFlBQVksRUFBRTtZQUNqQixPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsWUFBWSxDQUFDLENBQUM7U0FDOUI7UUFFRCxNQUFNLE9BQU8sR0FBc0IsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDLElBQUEsZ0JBQU8sRUFBQyxnQkFBZ0IsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUksZUFBZSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztRQUV0SCxrQkFBa0IsQ0FBQyxlQUFlLENBQUM7WUFDbEMsWUFBWSxFQUFFLElBQUksMkJBQTJCLEVBQUU7WUFDL0MsU0FBUyxFQUFFLEdBQUcsRUFBRSxDQUFDLGFBQWE7WUFDOUIsVUFBVSxFQUFFLEdBQUcsRUFBRSxDQUFDLE9BQU87WUFDekIsaUJBQWlCLEVBQUUsR0FBRyxFQUFFLENBQUMsT0FBTztTQUNoQyxDQUFDLENBQUM7SUFDSixDQUFDO0lBbkJELDBDQW1CQyJ9