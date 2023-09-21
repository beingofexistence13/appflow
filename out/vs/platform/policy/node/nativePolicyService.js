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
    exports.NativePolicyService = void 0;
    let NativePolicyService = class NativePolicyService extends policy_1.AbstractPolicyService {
        constructor(logService, productName) {
            super();
            this.logService = logService;
            this.productName = productName;
            this.throttler = new async_1.Throttler();
            this.watcher = this._register(new lifecycle_1.MutableDisposable());
        }
        async _updatePolicyDefinitions(policyDefinitions) {
            this.logService.trace(`NativePolicyService#_updatePolicyDefinitions - Found ${Object.keys(policyDefinitions).length} policy definitions`);
            await this.throttler.queue(() => new Promise((c, e) => {
                try {
                    this.watcher.value = (0, policy_watcher_1.createWatcher)(this.productName, policyDefinitions, update => {
                        this._onDidPolicyChange(update);
                        c();
                    });
                }
                catch (err) {
                    this.logService.error(`NativePolicyService#_updatePolicyDefinitions - Error creating watcher:`, err);
                    e(err);
                }
            }));
        }
        _onDidPolicyChange(update) {
            this.logService.trace(`NativePolicyService#_onDidPolicyChange - Updated policy values: ${JSON.stringify(update)}`);
            for (const key in update) {
                const value = update[key];
                if (value === undefined) {
                    this.policies.delete(key);
                }
                else {
                    this.policies.set(key, value);
                }
            }
            this._onDidChange.fire(Object.keys(update));
        }
    };
    exports.NativePolicyService = NativePolicyService;
    exports.NativePolicyService = NativePolicyService = __decorate([
        __param(0, log_1.ILogService)
    ], NativePolicyService);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmF0aXZlUG9saWN5U2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3BsYXRmb3JtL3BvbGljeS9ub2RlL25hdGl2ZVBvbGljeVNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBU3pGLElBQU0sbUJBQW1CLEdBQXpCLE1BQU0sbUJBQW9CLFNBQVEsOEJBQXFCO1FBSzdELFlBQ2MsVUFBd0MsRUFDcEMsV0FBbUI7WUFFcEMsS0FBSyxFQUFFLENBQUM7WUFIc0IsZUFBVSxHQUFWLFVBQVUsQ0FBYTtZQUNwQyxnQkFBVyxHQUFYLFdBQVcsQ0FBUTtZQUw3QixjQUFTLEdBQUcsSUFBSSxpQkFBUyxFQUFFLENBQUM7WUFDNUIsWUFBTyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSw2QkFBaUIsRUFBVyxDQUFDLENBQUM7UUFPbkUsQ0FBQztRQUVTLEtBQUssQ0FBQyx3QkFBd0IsQ0FBQyxpQkFBc0Q7WUFDOUYsSUFBSSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsd0RBQXdELE1BQU0sQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxNQUFNLHFCQUFxQixDQUFDLENBQUM7WUFFMUksTUFBTSxJQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxJQUFJLE9BQU8sQ0FBTyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRTtnQkFDM0QsSUFBSTtvQkFDSCxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssR0FBRyxJQUFBLDhCQUFhLEVBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxpQkFBaUIsRUFBRSxNQUFNLENBQUMsRUFBRTt3QkFDaEYsSUFBSSxDQUFDLGtCQUFrQixDQUFDLE1BQU0sQ0FBQyxDQUFDO3dCQUNoQyxDQUFDLEVBQUUsQ0FBQztvQkFDTCxDQUFDLENBQUMsQ0FBQztpQkFDSDtnQkFBQyxPQUFPLEdBQUcsRUFBRTtvQkFDYixJQUFJLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyx3RUFBd0UsRUFBRSxHQUFHLENBQUMsQ0FBQztvQkFDckcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO2lCQUNQO1lBQ0YsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNMLENBQUM7UUFFTyxrQkFBa0IsQ0FBQyxNQUF5RDtZQUNuRixJQUFJLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxtRUFBbUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLENBQUM7WUFFbkgsS0FBSyxNQUFNLEdBQUcsSUFBSSxNQUFNLEVBQUU7Z0JBQ3pCLE1BQU0sS0FBSyxHQUFHLE1BQU0sQ0FBQyxHQUFHLENBQVEsQ0FBQztnQkFFakMsSUFBSSxLQUFLLEtBQUssU0FBUyxFQUFFO29CQUN4QixJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQztpQkFDMUI7cUJBQU07b0JBQ04sSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxDQUFDO2lCQUM5QjthQUNEO1lBRUQsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO1FBQzdDLENBQUM7S0FDRCxDQUFBO0lBM0NZLGtEQUFtQjtrQ0FBbkIsbUJBQW1CO1FBTTdCLFdBQUEsaUJBQVcsQ0FBQTtPQU5ELG1CQUFtQixDQTJDL0IifQ==