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
define(["require", "exports", "vs/platform/registry/common/platform", "vs/platform/action/common/actionCommonCategories", "vs/platform/actions/common/actions", "vs/workbench/contrib/logs/common/logsActions", "vs/workbench/common/contributions", "vs/base/common/lifecycle", "vs/platform/instantiation/common/instantiation", "vs/workbench/contrib/logs/common/logsDataCleaner"], function (require, exports, platform_1, actionCommonCategories_1, actions_1, logsActions_1, contributions_1, lifecycle_1, instantiation_1, logsDataCleaner_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    let WebLogOutputChannels = class WebLogOutputChannels extends lifecycle_1.$kc {
        constructor(a) {
            super();
            this.a = a;
            this.b();
        }
        b() {
            this.a.createInstance(logsDataCleaner_1.$R4b);
            (0, actions_1.$Xu)(class extends actions_1.$Wu {
                constructor() {
                    super({
                        id: logsActions_1.$ELb.ID,
                        title: logsActions_1.$ELb.TITLE,
                        category: actionCommonCategories_1.$Nl.Developer,
                        f1: true
                    });
                }
                run(servicesAccessor) {
                    return servicesAccessor.get(instantiation_1.$Ah).createInstance(logsActions_1.$ELb, logsActions_1.$ELb.ID, logsActions_1.$ELb.TITLE.value).run();
                }
            });
        }
    };
    WebLogOutputChannels = __decorate([
        __param(0, instantiation_1.$Ah)
    ], WebLogOutputChannels);
    platform_1.$8m.as(contributions_1.Extensions.Workbench).registerWorkbenchContribution(WebLogOutputChannels, 3 /* LifecyclePhase.Restored */);
});
//# sourceMappingURL=logs.contribution.js.map