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
            this.e = new Map();
            this.f = new async_1.$2g();
        }
        registerWorkbenchContribution(contribution, phase = 1 /* LifecyclePhase.Starting */) {
            // Instantiate directly if we are already matching the provided phase
            if (this.a && this.b && this.c && this.d && this.b.phase >= phase) {
                this.k(this.a, this.c, this.d, contribution, phase);
            }
            // Otherwise keep contributions by lifecycle phase
            else {
                let contributions = this.e.get(phase);
                if (!contributions) {
                    contributions = [];
                    this.e.set(phase, contributions);
                }
                contributions.push(contribution);
            }
        }
        start(accessor) {
            const instantiationService = this.a = accessor.get(instantiation_1.$Ah);
            const lifecycleService = this.b = accessor.get(lifecycle_1.$7y);
            const logService = this.c = accessor.get(log_1.$5i);
            const environmentService = this.d = accessor.get(environment_1.$Ih);
            for (const phase of [1 /* LifecyclePhase.Starting */, 2 /* LifecyclePhase.Ready */, 3 /* LifecyclePhase.Restored */, 4 /* LifecyclePhase.Eventually */]) {
                this.g(instantiationService, lifecycleService, logService, environmentService, phase);
            }
        }
        g(instantiationService, lifecycleService, logService, environmentService, phase) {
            // Instantiate contributions directly when phase is already reached
            if (lifecycleService.phase >= phase) {
                this.h(instantiationService, logService, environmentService, phase);
            }
            // Otherwise wait for phase to be reached
            else {
                lifecycleService.when(phase).then(() => this.h(instantiationService, logService, environmentService, phase));
            }
        }
        async h(instantiationService, logService, environmentService, phase) {
            const contributions = this.e.get(phase);
            if (contributions) {
                this.e.delete(phase);
                switch (phase) {
                    case 1 /* LifecyclePhase.Starting */:
                    case 2 /* LifecyclePhase.Ready */: {
                        // instantiate everything synchronously and blocking
                        // measure the time it takes as perf marks for diagnosis
                        (0, performance_1.mark)(`code/willCreateWorkbenchContributions/${phase}`);
                        for (const contribution of contributions) {
                            this.k(instantiationService, logService, environmentService, contribution, phase);
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
                            await this.f.p;
                        }
                        this.j(contributions, instantiationService, logService, environmentService, phase);
                        break;
                    }
                }
            }
        }
        j(contributions, instantiationService, logService, environmentService, phase) {
            (0, performance_1.mark)(`code/willCreateWorkbenchContributions/${phase}`);
            let i = 0;
            const forcedTimeout = phase === 4 /* LifecyclePhase.Eventually */ ? 3000 : 500;
            const instantiateSome = (idle) => {
                while (i < contributions.length) {
                    const contribution = contributions[i++];
                    this.k(instantiationService, logService, environmentService, contribution, phase);
                    if (idle.timeRemaining() < 1) {
                        // time is up -> reschedule
                        (0, async_1.$Wg)(instantiateSome, forcedTimeout);
                        break;
                    }
                }
                if (i === contributions.length) {
                    (0, performance_1.mark)(`code/didCreateWorkbenchContributions/${phase}`);
                    if (phase === 3 /* LifecyclePhase.Restored */) {
                        this.f.complete();
                    }
                }
            };
            (0, async_1.$Wg)(instantiateSome, forcedTimeout);
        }
        k(instantiationService, logService, environmentService, contribution, phase) {
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
    platform_1.$8m.add(Extensions.Workbench, new WorkbenchContributionsRegistry());
});
//# sourceMappingURL=contributions.js.map