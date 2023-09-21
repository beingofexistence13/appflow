/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/mouseEvent", "vs/base/common/actions", "vs/base/common/arrays", "vs/platform/actions/browser/menuEntryActionViewItem"], function (require, exports, mouseEvent_1, actions_1, arrays_1, menuEntryActionViewItem_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$WVb = void 0;
    class InstanceContext {
        constructor(instance) {
            this.a = instance.instanceId;
        }
        toJSON() {
            return {
                $mid: 15 /* MarshalledId.TerminalContext */,
                instanceId: this.a
            };
        }
    }
    class TerminalContextActionRunner extends actions_1.$hi {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        async u(action, context) {
            if (Array.isArray(context) && context.every(e => e instanceof InstanceContext)) {
                // arg1: The (first) focused instance
                // arg2: All selected instances
                await action.run(context?.[0], context);
                return;
            }
            return super.u(action, context);
        }
    }
    function $WVb(event, contextInstances, menu, contextMenuService, extraActions) {
        const standardEvent = new mouseEvent_1.$eO(event);
        const actions = [];
        (0, menuEntryActionViewItem_1.$A3)(menu, { shouldForwardArgs: true }, actions);
        if (extraActions) {
            actions.push(...extraActions);
        }
        const context = contextInstances ? (0, arrays_1.$1b)(contextInstances).map(e => new InstanceContext(e)) : [];
        contextMenuService.showContextMenu({
            actionRunner: new TerminalContextActionRunner(),
            getAnchor: () => standardEvent,
            getActions: () => actions,
            getActionsContext: () => context,
        });
    }
    exports.$WVb = $WVb;
});
//# sourceMappingURL=terminalContextMenu.js.map