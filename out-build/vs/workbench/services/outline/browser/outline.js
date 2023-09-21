/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/instantiation/common/instantiation"], function (require, exports, instantiation_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.OutlineConfigCollapseItemsValues = exports.OutlineConfigKeys = exports.OutlineTarget = exports.$trb = void 0;
    exports.$trb = (0, instantiation_1.$Bh)('IOutlineService');
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
//# sourceMappingURL=outline.js.map