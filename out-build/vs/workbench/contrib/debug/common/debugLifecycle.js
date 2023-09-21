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
define(["require", "exports", "vs/nls!vs/workbench/contrib/debug/common/debugLifecycle", "vs/platform/configuration/common/configuration", "vs/platform/dialogs/common/dialogs", "vs/workbench/contrib/debug/common/debug", "vs/workbench/services/lifecycle/common/lifecycle"], function (require, exports, nls, configuration_1, dialogs_1, debug_1, lifecycle_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$sSb = void 0;
    let $sSb = class $sSb {
        constructor(lifecycleService, a, b, c) {
            this.a = a;
            this.b = b;
            this.c = c;
            lifecycleService.onBeforeShutdown(async (e) => e.veto(this.d(e.reason), 'veto.debug'));
        }
        d(_reason) {
            const rootSessions = this.a.getModel().getSessions().filter(s => s.parentSession === undefined);
            if (rootSessions.length === 0) {
                return false;
            }
            const shouldConfirmOnExit = this.b.getValue('debug').confirmOnExit;
            if (shouldConfirmOnExit === 'never') {
                return false;
            }
            return this.f(rootSessions.length);
        }
        async f(numSessions) {
            let message;
            if (numSessions === 1) {
                message = nls.localize(0, null);
            }
            else {
                message = nls.localize(1, null);
            }
            const res = await this.c.confirm({
                message,
                type: 'warning',
                primaryButton: nls.localize(2, null)
            });
            return !res.confirmed;
        }
    };
    exports.$sSb = $sSb;
    exports.$sSb = $sSb = __decorate([
        __param(0, lifecycle_1.$7y),
        __param(1, debug_1.$nH),
        __param(2, configuration_1.$8h),
        __param(3, dialogs_1.$oA)
    ], $sSb);
});
//# sourceMappingURL=debugLifecycle.js.map