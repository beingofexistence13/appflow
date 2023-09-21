/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/instantiation/common/instantiation"], function (require, exports, instantiation_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.OutlineConfigCollapseItemsValues = exports.OutlineConfigKeys = exports.OutlineTarget = exports.IOutlineService = void 0;
    exports.IOutlineService = (0, instantiation_1.createDecorator)('IOutlineService');
    var OutlineTarget;
    (function (OutlineTarget) {
        OutlineTarget[OutlineTarget["OutlinePane"] = 1] = "OutlinePane";
        OutlineTarget[OutlineTarget["Breadcrumbs"] = 2] = "Breadcrumbs";
        OutlineTarget[OutlineTarget["QuickPick"] = 4] = "QuickPick";
    })(OutlineTarget || (exports.OutlineTarget = OutlineTarget = {}));
    var OutlineConfigKeys;
    (function (OutlineConfigKeys) {
        OutlineConfigKeys["icons"] = "outline.icons";
        OutlineConfigKeys["collapseItems"] = "outline.collapseItems";
        OutlineConfigKeys["problemsEnabled"] = "outline.problems.enabled";
        OutlineConfigKeys["problemsColors"] = "outline.problems.colors";
        OutlineConfigKeys["problemsBadges"] = "outline.problems.badges";
    })(OutlineConfigKeys || (exports.OutlineConfigKeys = OutlineConfigKeys = {}));
    var OutlineConfigCollapseItemsValues;
    (function (OutlineConfigCollapseItemsValues) {
        OutlineConfigCollapseItemsValues["Collapsed"] = "alwaysCollapse";
        OutlineConfigCollapseItemsValues["Expanded"] = "alwaysExpand";
    })(OutlineConfigCollapseItemsValues || (exports.OutlineConfigCollapseItemsValues = OutlineConfigCollapseItemsValues = {}));
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib3V0bGluZS5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9zZXJ2aWNlcy9vdXRsaW5lL2Jyb3dzZXIvb3V0bGluZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFjbkYsUUFBQSxlQUFlLEdBQUcsSUFBQSwrQkFBZSxFQUFrQixpQkFBaUIsQ0FBQyxDQUFDO0lBRW5GLElBQWtCLGFBSWpCO0lBSkQsV0FBa0IsYUFBYTtRQUM5QiwrREFBZSxDQUFBO1FBQ2YsK0RBQWUsQ0FBQTtRQUNmLDJEQUFhLENBQUE7SUFDZCxDQUFDLEVBSmlCLGFBQWEsNkJBQWIsYUFBYSxRQUk5QjtJQXFFRCxJQUFrQixpQkFNakI7SUFORCxXQUFrQixpQkFBaUI7UUFDbEMsNENBQXlCLENBQUE7UUFDekIsNERBQXlDLENBQUE7UUFDekMsaUVBQThDLENBQUE7UUFDOUMsK0RBQTRDLENBQUE7UUFDNUMsK0RBQTRDLENBQUE7SUFDN0MsQ0FBQyxFQU5pQixpQkFBaUIsaUNBQWpCLGlCQUFpQixRQU1sQztJQUVELElBQWtCLGdDQUdqQjtJQUhELFdBQWtCLGdDQUFnQztRQUNqRCxnRUFBNEIsQ0FBQTtRQUM1Qiw2REFBeUIsQ0FBQTtJQUMxQixDQUFDLEVBSGlCLGdDQUFnQyxnREFBaEMsZ0NBQWdDLFFBR2pEIn0=