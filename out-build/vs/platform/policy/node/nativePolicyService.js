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
define(["require", "exports", "vs/platform/policy/common/policy", "vs/base/common/async", "@vscode/policy-watcher", "vs/base/common/lifecycle", "vs/platform/log/common/log"], function (require, exports, policy_1, async_1, policy_watcher_1, lifecycle_1, log_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$l7b = void 0;
    let $l7b = class $l7b extends policy_1.$$m {
        constructor(m, n) {
            super();
            this.m = m;
            this.n = n;
            this.a = new async_1.$Ag();
            this.b = this.B(new lifecycle_1.$lc());
        }
        async j(policyDefinitions) {
            this.m.trace(`NativePolicyService#_updatePolicyDefinitions - Found ${Object.keys(policyDefinitions).length} policy definitions`);
            await this.a.queue(() => new Promise((c, e) => {
                try {
                    this.b.value = (0, policy_watcher_1.createWatcher)(this.n, policyDefinitions, update => {
                        this.t(update);
                        c();
                    });
                }
                catch (err) {
                    this.m.error(`NativePolicyService#_updatePolicyDefinitions - Error creating watcher:`, err);
                    e(err);
                }
            }));
        }
        t(update) {
            this.m.trace(`NativePolicyService#_onDidPolicyChange - Updated policy values: ${JSON.stringify(update)}`);
            for (const key in update) {
                const value = update[key];
                if (value === undefined) {
                    this.g.delete(key);
                }
                else {
                    this.g.set(key, value);
                }
            }
            this.h.fire(Object.keys(update));
        }
    };
    exports.$l7b = $l7b;
    exports.$l7b = $l7b = __decorate([
        __param(0, log_1.$5i)
    ], $l7b);
});
//# sourceMappingURL=nativePolicyService.js.map