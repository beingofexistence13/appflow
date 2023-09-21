/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/instantiation/common/instantiation", "vs/workbench/services/lifecycle/common/lifecycle", "vs/platform/registry/common/platform", "vs/base/common/async", "vs/base/common/performance", "vs/platform/log/common/log", "vs/platform/environment/common/environment"], function (require, exports, instantiation_1, lifecycle_1, platform_1, async_1, performance_1, log_1, environment_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Extensions = void 0;
    var Extensions;
    (function (Extensions) {
        Extensions.Workbench = 'workbench.contributions.kind';
    })(Extensions || (exports.Extensions = Extensions = {}));
    class WorkbenchContributionsRegistry {
        constructor() {
            this.contributions = new Map();
            this.pendingRestoredContributions = new async_1.DeferredPromise();
        }
        registerWorkbenchContribution(contribution, phase = 1 /* LifecyclePhase.Starting */) {
            // Instantiate directly if we are already matching the provided phase
            if (this.instantiationService && this.lifecycleService && this.logService && this.environmentService && this.lifecycleService.phase >= phase) {
                this.safeCreateContribution(this.instantiationService, this.logService, this.environmentService, contribution, phase);
            }
            // Otherwise keep contributions by lifecycle phase
            else {
                let contributions = this.contributions.get(phase);
                if (!contributions) {
                    contributions = [];
                    this.contributions.set(phase, contributions);
                }
                contributions.push(contribution);
            }
        }
        start(accessor) {
            const instantiationService = this.instantiationService = accessor.get(instantiation_1.IInstantiationService);
            const lifecycleService = this.lifecycleService = accessor.get(lifecycle_1.ILifecycleService);
            const logService = this.logService = accessor.get(log_1.ILogService);
            const environmentService = this.environmentService = accessor.get(environment_1.IEnvironmentService);
            for (const phase of [1 /* LifecyclePhase.Starting */, 2 /* LifecyclePhase.Ready */, 3 /* LifecyclePhase.Restored */, 4 /* LifecyclePhase.Eventually */]) {
                this.instantiateByPhase(instantiationService, lifecycleService, logService, environmentService, phase);
            }
        }
        instantiateByPhase(instantiationService, lifecycleService, logService, environmentService, phase) {
            // Instantiate contributions directly when phase is already reached
            if (lifecycleService.phase >= phase) {
                this.doInstantiateByPhase(instantiationService, logService, environmentService, phase);
            }
            // Otherwise wait for phase to be reached
            else {
                lifecycleService.when(phase).then(() => this.doInstantiateByPhase(instantiationService, logService, environmentService, phase));
            }
        }
        async doInstantiateByPhase(instantiationService, logService, environmentService, phase) {
            const contributions = this.contributions.get(phase);
            if (contributions) {
                this.contributions.delete(phase);
                switch (phase) {
                    case 1 /* LifecyclePhase.Starting */:
                    case 2 /* LifecyclePhase.Ready */: {
                        // instantiate everything synchronously and blocking
                        // measure the time it takes as perf marks for diagnosis
                        (0, performance_1.mark)(`code/willCreateWorkbenchContributions/${phase}`);
                        for (const contribution of contributions) {
                            this.safeCreateContribution(instantiationService, logService, environmentService, contribution, phase);
                        }
                        (0, performance_1.mark)(`code/didCreateWorkbenchContributions/${phase}`);
                        break;
                    }
                    case 3 /* LifecyclePhase.Restored */:
                    case 4 /* LifecyclePhase.Eventually */: {
                        // for the Restored/Eventually-phase we instantiate contributions
                        // only when idle. this might take a few idle-busy-cycles but will
                        // finish within the timeouts
                        // given that, we must ensure to await the contributions from the
                        // Restored-phase before we instantiate the Eventually-phase
                        if (phase === 4 /* LifecyclePhase.Eventually */) {
                            await this.pendingRestoredContributions.p;
                        }
                        this.doInstantiateWhenIdle(contributions, instantiationService, logService, environmentService, phase);
                        break;
                    }
                }
            }
        }
        doInstantiateWhenIdle(contributions, instantiationService, logService, environmentService, phase) {
            (0, performance_1.mark)(`code/willCreateWorkbenchContributions/${phase}`);
            let i = 0;
            const forcedTimeout = phase === 4 /* LifecyclePhase.Eventually */ ? 3000 : 500;
            const instantiateSome = (idle) => {
                while (i < contributions.length) {
                    const contribution = contributions[i++];
                    this.safeCreateContribution(instantiationService, logService, environmentService, contribution, phase);
                    if (idle.timeRemaining() < 1) {
                        // time is up -> reschedule
                        (0, async_1.runWhenIdle)(instantiateSome, forcedTimeout);
                        break;
                    }
                }
                if (i === contributions.length) {
                    (0, performance_1.mark)(`code/didCreateWorkbenchContributions/${phase}`);
                    if (phase === 3 /* LifecyclePhase.Restored */) {
                        this.pendingRestoredContributions.complete();
                    }
                }
            };
            (0, async_1.runWhenIdle)(instantiateSome, forcedTimeout);
        }
        safeCreateContribution(instantiationService, logService, environmentService, contribution, phase) {
            const now = phase < 3 /* LifecyclePhase.Restored */ ? Date.now() : undefined;
            try {
                instantiationService.createInstance(contribution);
            }
            catch (error) {
                logService.error(`Unable to create workbench contribution ${contribution.name}.`, error);
            }
            if (typeof now === 'number' && !environmentService.isBuilt /* only log out of sources where we have good ctor names */) {
                const time = Date.now() - now;
                if (time > 20) {
                    logService.warn(`Workbench contribution ${contribution.name} blocked restore phase by ${time}ms.`);
                }
            }
        }
    }
    platform_1.Registry.add(Extensions.Workbench, new WorkbenchContributionsRegistry());
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29udHJpYnV0aW9ucy5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb21tb24vY29udHJpYnV0aW9ucy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFpQmhHLElBQWlCLFVBQVUsQ0FFMUI7SUFGRCxXQUFpQixVQUFVO1FBQ2Isb0JBQVMsR0FBRyw4QkFBOEIsQ0FBQztJQUN6RCxDQUFDLEVBRmdCLFVBQVUsMEJBQVYsVUFBVSxRQUUxQjtJQTBCRCxNQUFNLDhCQUE4QjtRQUFwQztZQU9rQixrQkFBYSxHQUFHLElBQUksR0FBRyxFQUFtRSxDQUFDO1lBQzNGLGlDQUE0QixHQUFHLElBQUksdUJBQWUsRUFBUSxDQUFDO1FBc0k3RSxDQUFDO1FBcElBLDZCQUE2QixDQUFDLFlBQTJELEVBQUUsdUNBQStDO1lBRXpJLHFFQUFxRTtZQUNyRSxJQUFJLElBQUksQ0FBQyxvQkFBb0IsSUFBSSxJQUFJLENBQUMsZ0JBQWdCLElBQUksSUFBSSxDQUFDLFVBQVUsSUFBSSxJQUFJLENBQUMsa0JBQWtCLElBQUksSUFBSSxDQUFDLGdCQUFnQixDQUFDLEtBQUssSUFBSSxLQUFLLEVBQUU7Z0JBQzdJLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxJQUFJLENBQUMsb0JBQW9CLEVBQUUsSUFBSSxDQUFDLFVBQVUsRUFBRSxJQUFJLENBQUMsa0JBQWtCLEVBQUUsWUFBWSxFQUFFLEtBQUssQ0FBQyxDQUFDO2FBQ3RIO1lBRUQsa0RBQWtEO2lCQUM3QztnQkFDSixJQUFJLGFBQWEsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQztnQkFDbEQsSUFBSSxDQUFDLGFBQWEsRUFBRTtvQkFDbkIsYUFBYSxHQUFHLEVBQUUsQ0FBQztvQkFDbkIsSUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsS0FBSyxFQUFFLGFBQWEs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