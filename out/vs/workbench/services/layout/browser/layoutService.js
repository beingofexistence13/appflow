/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/instantiation/common/instantiation", "vs/platform/layout/browser/layoutService"], function (require, exports, instantiation_1, layoutService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.panelOpensMaximizedFromString = exports.positionFromString = exports.positionToString = exports.PanelOpensMaximizedOptions = exports.Position = exports.Parts = exports.IWorkbenchLayoutService = void 0;
    exports.IWorkbenchLayoutService = (0, instantiation_1.refineServiceDecorator)(layoutService_1.ILayoutService);
    var Parts;
    (function (Parts) {
        Parts["TITLEBAR_PART"] = "workbench.parts.titlebar";
        Parts["BANNER_PART"] = "workbench.parts.banner";
        Parts["ACTIVITYBAR_PART"] = "workbench.parts.activitybar";
        Parts["SIDEBAR_PART"] = "workbench.parts.sidebar";
        Parts["PANEL_PART"] = "workbench.parts.panel";
        Parts["AUXILIARYBAR_PART"] = "workbench.parts.auxiliarybar";
        Parts["EDITOR_PART"] = "workbench.parts.editor";
        Parts["STATUSBAR_PART"] = "workbench.parts.statusbar";
    })(Parts || (exports.Parts = Parts = {}));
    var Position;
    (function (Position) {
        Position[Position["LEFT"] = 0] = "LEFT";
        Position[Position["RIGHT"] = 1] = "RIGHT";
        Position[Position["BOTTOM"] = 2] = "BOTTOM";
    })(Position || (exports.Position = Position = {}));
    var PanelOpensMaximizedOptions;
    (function (PanelOpensMaximizedOptions) {
        PanelOpensMaximizedOptions[PanelOpensMaximizedOptions["ALWAYS"] = 0] = "ALWAYS";
        PanelOpensMaximizedOptions[PanelOpensMaximizedOptions["NEVER"] = 1] = "NEVER";
        PanelOpensMaximizedOptions[PanelOpensMaximizedOptions["REMEMBER_LAST"] = 2] = "REMEMBER_LAST";
    })(PanelOpensMaximizedOptions || (exports.PanelOpensMaximizedOptions = PanelOpensMaximizedOptions = {}));
    function positionToString(position) {
        switch (position) {
            case 0 /* Position.LEFT */: return 'left';
            case 1 /* Position.RIGHT */: return 'right';
            case 2 /* Position.BOTTOM */: return 'bottom';
            default: return 'bottom';
        }
    }
    exports.positionToString = positionToString;
    const positionsByString = {
        [positionToString(0 /* Position.LEFT */)]: 0 /* Position.LEFT */,
        [positionToString(1 /* Position.RIGHT */)]: 1 /* Position.RIGHT */,
        [positionToString(2 /* Position.BOTTOM */)]: 2 /* Position.BOTTOM */
    };
    function positionFromString(str) {
        return positionsByString[str];
    }
    exports.positionFromString = positionFromString;
    function panelOpensMaximizedSettingToString(setting) {
        switch (setting) {
            case 0 /* PanelOpensMaximizedOptions.ALWAYS */: return 'always';
            case 1 /* PanelOpensMaximizedOptions.NEVER */: return 'never';
            case 2 /* PanelOpensMaximizedOptions.REMEMBER_LAST */: return 'preserve';
            default: return 'preserve';
        }
    }
    const panelOpensMaximizedByString = {
        [panelOpensMaximizedSettingToString(0 /* PanelOpensMaximizedOptions.ALWAYS */)]: 0 /* PanelOpensMaximizedOptions.ALWAYS */,
        [panelOpensMaximizedSettingToString(1 /* PanelOpensMaximizedOptions.NEVER */)]: 1 /* PanelOpensMaximizedOptions.NEVER */,
        [panelOpensMaximizedSettingToString(2 /* PanelOpensMaximizedOptions.REMEMBER_LAST */)]: 2 /* PanelOpensMaximizedOptions.REMEMBER_LAST */
    };
    function panelOpensMaximizedFromString(str) {
        return panelOpensMaximizedByString[str];
    }
    exports.panelOpensMaximizedFromString = panelOpensMaximizedFromString;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGF5b3V0U2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9zZXJ2aWNlcy9sYXlvdXQvYnJvd3Nlci9sYXlvdXRTZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQVNuRixRQUFBLHVCQUF1QixHQUFHLElBQUEsc0NBQXNCLEVBQTBDLDhCQUFjLENBQUMsQ0FBQztJQUV2SCxJQUFrQixLQVNqQjtJQVRELFdBQWtCLEtBQUs7UUFDdEIsbURBQTBDLENBQUE7UUFDMUMsK0NBQXNDLENBQUE7UUFDdEMseURBQWdELENBQUE7UUFDaEQsaURBQXdDLENBQUE7UUFDeEMsNkNBQW9DLENBQUE7UUFDcEMsMkRBQWtELENBQUE7UUFDbEQsK0NBQXNDLENBQUE7UUFDdEMscURBQTRDLENBQUE7SUFDN0MsQ0FBQyxFQVRpQixLQUFLLHFCQUFMLEtBQUssUUFTdEI7SUFFRCxJQUFrQixRQUlqQjtJQUpELFdBQWtCLFFBQVE7UUFDekIsdUNBQUksQ0FBQTtRQUNKLHlDQUFLLENBQUE7UUFDTCwyQ0FBTSxDQUFBO0lBQ1AsQ0FBQyxFQUppQixRQUFRLHdCQUFSLFFBQVEsUUFJekI7SUFFRCxJQUFrQiwwQkFJakI7SUFKRCxXQUFrQiwwQkFBMEI7UUFDM0MsK0VBQU0sQ0FBQTtRQUNOLDZFQUFLLENBQUE7UUFDTCw2RkFBYSxDQUFBO0lBQ2QsQ0FBQyxFQUppQiwwQkFBMEIsMENBQTFCLDBCQUEwQixRQUkzQztJQUlELFNBQWdCLGdCQUFnQixDQUFDLFFBQWtCO1FBQ2xELFFBQVEsUUFBUSxFQUFFO1lBQ2pCLDBCQUFrQixDQUFDLENBQUMsT0FBTyxNQUFNLENBQUM7WUFDbEMsMkJBQW1CLENBQUMsQ0FBQyxPQUFPLE9BQU8sQ0FBQztZQUNwQyw0QkFBb0IsQ0FBQyxDQUFDLE9BQU8sUUFBUSxDQUFDO1lBQ3RDLE9BQU8sQ0FBQyxDQUFDLE9BQU8sUUFBUSxDQUFDO1NBQ3pCO0lBQ0YsQ0FBQztJQVBELDRDQU9DO0lBRUQsTUFBTSxpQkFBaUIsR0FBZ0M7UUFDdEQsQ0FBQyxnQkFBZ0IsdUJBQWUsQ0FBQyx1QkFBZTtRQUNoRCxDQUFDLGdCQUFnQix3QkFBZ0IsQ0FBQyx3QkFBZ0I7UUFDbEQsQ0FBQyxnQkFBZ0IseUJBQWlCLENBQUMseUJBQWlCO0tBQ3BELENBQUM7SUFFRixTQUFnQixrQkFBa0IsQ0FBQyxHQUFXO1FBQzdDLE9BQU8saUJBQWlCLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDL0IsQ0FBQztJQUZELGdEQUVDO0lBRUQsU0FBUyxrQ0FBa0MsQ0FBQyxPQUFtQztRQUM5RSxRQUFRLE9BQU8sRUFBRTtZQUNoQiw4Q0FBc0MsQ0FBQyxDQUFDLE9BQU8sUUFBUSxDQUFDO1lBQ3hELDZDQUFxQyxDQUFDLENBQUMsT0FBTyxPQUFPLENBQUM7WUFDdEQscURBQTZDLENBQUMsQ0FBQyxPQUFPLFVBQVUsQ0FBQztZQUNqRSxPQUFPLENBQUMsQ0FBQyxPQUFPLFVBQVUsQ0FBQztTQUMzQjtJQUNGLENBQUM7SUFFRCxNQUFNLDJCQUEyQixHQUFrRDtRQUNsRixDQUFDLGtDQUFrQywyQ0FBbUMsQ0FBQywyQ0FBbUM7UUFDMUcsQ0FBQyxrQ0FBa0MsMENBQWtDLENBQUMsMENBQWtDO1FBQ3hHLENBQUMsa0NBQWtDLGtEQUEwQyxDQUFDLGtEQUEwQztLQUN4SCxDQUFDO0lBRUYsU0FBZ0IsNkJBQTZCLENBQUMsR0FBVztRQUN4RCxPQUFPLDJCQUEyQixDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQ3pDLENBQUM7SUFGRCxzRUFFQyJ9