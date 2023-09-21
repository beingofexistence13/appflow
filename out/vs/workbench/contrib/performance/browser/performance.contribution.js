/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls", "vs/platform/actions/common/actions", "vs/platform/instantiation/common/instantiation", "vs/platform/registry/common/platform", "vs/platform/action/common/actionCommonCategories", "vs/workbench/common/contributions", "vs/workbench/common/editor", "vs/workbench/contrib/performance/browser/perfviewEditor", "vs/workbench/services/editor/common/editorService", "vs/platform/instantiation/common/instantiationService", "vs/base/common/event", "vs/workbench/contrib/performance/browser/inputLatencyContrib"], function (require, exports, nls_1, actions_1, instantiation_1, platform_1, actionCommonCategories_1, contributions_1, editor_1, perfviewEditor_1, editorService_1, instantiationService_1, event_1, inputLatencyContrib_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    // -- startup performance view
    platform_1.Registry.as(contributions_1.Extensions.Workbench).registerWorkbenchContribution(perfviewEditor_1.PerfviewContrib, 2 /* LifecyclePhase.Ready */);
    platform_1.Registry.as(editor_1.EditorExtensions.EditorFactory).registerEditorSerializer(perfviewEditor_1.PerfviewInput.Id, class {
        canSerialize() {
            return true;
        }
        serialize() {
            return '';
        }
        deserialize(instantiationService) {
            return instantiationService.createInstance(perfviewEditor_1.PerfviewInput);
        }
    });
    (0, actions_1.registerAction2)(class extends actions_1.Action2 {
        constructor() {
            super({
                id: 'perfview.show',
                title: { value: (0, nls_1.localize)('show.label', "Startup Performance"), original: 'Startup Performance' },
                category: actionCommonCategories_1.Categories.Developer,
                f1: true
            });
        }
        run(accessor) {
            const editorService = accessor.get(editorService_1.IEditorService);
            const instaService = accessor.get(instantiation_1.IInstantiationService);
            return editorService.openEditor(instaService.createInstance(perfviewEditor_1.PerfviewInput), { pinned: true });
        }
    });
    (0, actions_1.registerAction2)(class PrintServiceCycles extends actions_1.Action2 {
        constructor() {
            super({
                id: 'perf.insta.printAsyncCycles',
                title: { value: (0, nls_1.localize)('cycles', "Print Service Cycles"), original: 'Print Service Cycles' },
                category: actionCommonCategories_1.Categories.Developer,
                f1: true
            });
        }
        run(accessor) {
            const instaService = accessor.get(instantiation_1.IInstantiationService);
            if (instaService instanceof instantiationService_1.InstantiationService) {
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
    (0, actions_1.registerAction2)(class PrintServiceTraces extends actions_1.Action2 {
        constructor() {
            super({
                id: 'perf.insta.printTraces',
                title: { value: (0, nls_1.localize)('insta.trace', "Print Service Traces"), original: 'Print Service Traces' },
                category: actionCommonCategories_1.Categories.Developer,
                f1: true
            });
        }
        run() {
            if (instantiationService_1.Trace.all.size === 0) {
                console.log('Enable via `instantiationService.ts#_enableAllTracing`');
                return;
            }
            for (const item of instantiationService_1.Trace.all) {
                console.log(item);
            }
        }
    });
    (0, actions_1.registerAction2)(class PrintEventProfiling extends actions_1.Action2 {
        constructor() {
            super({
                id: 'perf.event.profiling',
                title: { value: (0, nls_1.localize)('emitter', "Print Emitter Profiles"), original: 'Print Emitter Profiles' },
                category: actionCommonCategories_1.Categories.Developer,
                f1: true
            });
        }
        run() {
            if (event_1.EventProfiling.all.size === 0) {
                console.log('USE `EmitterOptions._profName` to enable profiling');
                return;
            }
            for (const item of event_1.EventProfiling.all) {
                console.log(`${item.name}: ${item.invocationCount} invocations COST ${item.elapsedOverall}ms, ${item.listenerCount} listeners, avg cost is ${item.durations.reduce((a, b) => a + b, 0) / item.durations.length}ms`);
            }
        }
    });
    // -- input latency
    platform_1.Registry.as(contributions_1.Extensions.Workbench).registerWorkbenchContribution(inputLatencyContrib_1.InputLatencyContrib, 4 /* LifecyclePhase.Eventually */);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGVyZm9ybWFuY2UuY29udHJpYnV0aW9uLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvcGVyZm9ybWFuY2UvYnJvd3Nlci9wZXJmb3JtYW5jZS5jb250cmlidXRpb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7SUFnQmhHLDhCQUE4QjtJQUU5QixtQkFBUSxDQUFDLEVBQUUsQ0FBa0MsMEJBQVUsQ0FBQyxTQUFTLENBQUMsQ0FBQyw2QkFBNkIsQ0FDL0YsZ0NBQWUsK0JBRWYsQ0FBQztJQUVGLG1CQUFRLENBQUMsRUFBRSxDQUF5Qix5QkFBZ0IsQ0FBQyxhQUFhLENBQUMsQ0FBQyx3QkFBd0IsQ0FDM0YsOEJBQWEsQ0FBQyxFQUFFLEVBQ2hCO1FBQ0MsWUFBWTtZQUNYLE9BQU8sSUFBSSxDQUFDO1FBQ2IsQ0FBQztRQUNELFNBQVM7WUFDUixPQUFPLEVBQUUsQ0FBQztRQUNYLENBQUM7UUFDRCxXQUFXLENBQUMsb0JBQTJDO1lBQ3RELE9BQU8sb0JBQW9CLENBQUMsY0FBYyxDQUFDLDhCQUFhLENBQUMsQ0FBQztRQUMzRCxDQUFDO0tBQ0QsQ0FDRCxDQUFDO0lBR0YsSUFBQSx5QkFBZSxFQUFDLEtBQU0sU0FBUSxpQkFBTztRQUVwQztZQUNDLEtBQUssQ0FBQztnQkFDTCxFQUFFLEVBQUUsZUFBZTtnQkFDbkIsS0FBSyxFQUFFLEVBQUUsS0FBSyxFQUFFLElBQUEsY0FBUSxFQUFDLFlBQVksRUFBRSxxQkFBcUIsQ0FBQyxFQUFFLFFBQVEsRUFBRSxxQkFBcUIsRUFBRTtnQkFDaEcsUUFBUSxFQUFFLG1DQUFVLENBQUMsU0FBUztnQkFDOUIsRUFBRSxFQUFFLElBQUk7YUFDUixDQUFDLENBQUM7UUFDSixDQUFDO1FBRUQsR0FBRyxDQUFDLFFBQTBCO1lBQzdCLE1BQU0sYUFBYSxHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMs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