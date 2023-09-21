/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", "vs/base/common/lifecycle", "vs/platform/contextview/browser/contextView", "vs/platform/layout/browser/layoutService", "vs/platform/registry/common/platform", "vs/workbench/common/contributions"], function (require, exports, lifecycle_1, contextView_1, layoutService_1, platform_1, contributions_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    let ContextMenuContribution = class ContextMenuContribution {
        constructor(layoutService, contextMenuService) {
            this.a = new lifecycle_1.$jc();
            const update = (visible) => layoutService.container.classList.toggle('context-menu-visible', visible);
            contextMenuService.onDidShowContextMenu(() => update(true), null, this.a);
            contextMenuService.onDidHideContextMenu(() => update(false), null, this.a);
        }
    };
    ContextMenuContribution = __decorate([
        __param(0, layoutService_1.$XT),
        __param(1, contextView_1.$WZ)
    ], ContextMenuContribution);
    platform_1.$8m.as(contributions_1.Extensions.Workbench)
        .registerWorkbenchContribution(ContextMenuContribution, 4 /* LifecyclePhase.Eventually */);
});
//# sourceMappingURL=contextmenu.contribution.js.map