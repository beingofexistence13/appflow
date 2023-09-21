/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls!vs/workbench/contrib/performance/browser/performance.contribution", "vs/platform/actions/common/actions", "vs/platform/instantiation/common/instantiation", "vs/platform/registry/common/platform", "vs/platform/action/common/actionCommonCategories", "vs/workbench/common/contributions", "vs/workbench/common/editor", "vs/workbench/contrib/performance/browser/perfviewEditor", "vs/workbench/services/editor/common/editorService", "vs/platform/instantiation/common/instantiationService", "vs/base/common/event", "vs/workbench/contrib/performance/browser/inputLatencyContrib"], function (require, exports, nls_1, actions_1, instantiation_1, platform_1, actionCommonCategories_1, contributions_1, editor_1, perfviewEditor_1, editorService_1, instantiationService_1, event_1, inputLatencyContrib_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    // -- startup performance view
    platform_1.$8m.as(contributions_1.Extensions.Workbench).registerWorkbenchContribution(perfviewEditor_1.$gEb, 2 /* LifecyclePhase.Ready */);
    platform_1.$8m.as(editor_1.$GE.EditorFactory).registerEditorSerializer(perfviewEditor_1.$hEb.Id, class {
        canSerialize() {
            return true;
        }
        serialize() {
            return '';
        }
        deserialize(instantiationService) {
            return instantiationService.createInstance(perfviewEditor_1.$hEb);
        }
    });
    (0, actions_1.$Xu)(class extends actions_1.$Wu {
        constructor() {
            super({
                id: 'perfview.show',
                title: { value: (0, nls_1.localize)(0, null), original: 'Startup Performance' },
                category: actionCommonCategories_1.$Nl.Developer,
                f1: true
            });
        }
        run(accessor) {
            const editorService = accessor.get(editorService_1.$9C);
            const instaService = accessor.get(instantiation_1.$Ah);
            return editorService.openEditor(instaService.createInstance(perfviewEditor_1.$hEb), { pinned: true });
        }
    });
    (0, actions_1.$Xu)(class PrintServiceCycles extends actions_1.$Wu {
        constructor() {
            super({
                id: 'perf.insta.printAsyncCycles',
                title: { value: (0, nls_1.localize)(1, null), original: 'Print Service Cycles' },
                category: actionCommonCategories_1.$Nl.Developer,
                f1: true
            });
        }
        run(accessor) {
            const instaService = accessor.get(instantiation_1.$Ah);
            if (instaService instanceof instantiationService_1.$6p) {
                const cycle = instaService._globalGraph?.findCycleSlow();
                if (cycle) {
                    console.warn(`CYCLE`, cycle);
                }
                else {
                    console.warn(`YEAH, no more cycles`);
                }
            }
        }
    });
    (0, actions_1.$Xu)(class PrintServiceTraces extends actions_1.$Wu {
        constructor() {
            super({
                id: 'perf.insta.printTraces',
                title: { value: (0, nls_1.localize)(2, null), original: 'Print Service Traces' },
                category: actionCommonCategories_1.$Nl.Developer,
                f1: true
            });
        }
        run() {
            if (instantiationService_1.$7p.all.size === 0) {
                console.log('Enable via `instantiationService.ts#_enableAllTracing`');
                return;
            }
            for (const item of instantiationService_1.$7p.all) {
                console.log(item);
            }
        }
    });
    (0, actions_1.$Xu)(class PrintEventProfiling extends actions_1.$Wu {
        constructor() {
            super({
                id: 'perf.event.profiling',
                title: { value: (0, nls_1.localize)(3, null), original: 'Print Emitter Profiles' },
                category: actionCommonCategories_1.$Nl.Developer,
                f1: true
            });
        }
        run() {
            if (event_1.$dd.all.size === 0) {
                console.log('USE `EmitterOptions._profName` to enable profiling');
                return;
            }
            for (const item of event_1.$dd.all) {
                console.log(`${item.name}: ${item.invocationCount} invocations COST ${item.elapsedOverall}ms, ${item.listenerCount} listeners, avg cost is ${item.durations.reduce((a, b) => a + b, 0) / item.durations.length}ms`);
            }
        }
    });
    // -- input latency
    platform_1.$8m.as(contributions_1.Extensions.Workbench).registerWorkbenchContribution(inputLatencyContrib_1.$iEb, 4 /* LifecyclePhase.Eventually */);
});
//# sourceMappingURL=performance.contribution.js.map