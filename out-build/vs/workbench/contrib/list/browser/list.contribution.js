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
define(["require", "exports", "vs/platform/contextkey/common/contextkey", "vs/platform/registry/common/platform", "vs/workbench/common/contributions"], function (require, exports, contextkey_1, platform_1, contributions_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$O1b = void 0;
    let $O1b = class $O1b {
        constructor(contextKeyService) {
            contextKeyService.createKey('listSupportsTypeNavigation', true);
            // @deprecated in favor of listSupportsTypeNavigation
            contextKeyService.createKey('listSupportsKeyboardNavigation', true);
        }
    };
    exports.$O1b = $O1b;
    exports.$O1b = $O1b = __decorate([
        __param(0, contextkey_1.$3i)
    ], $O1b);
    platform_1.$8m.as(contributions_1.Extensions.Workbench).registerWorkbenchContribution($O1b, 1 /* LifecyclePhase.Starting */);
});
//# sourceMappingURL=list.contribution.js.map