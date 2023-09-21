/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/registry/common/platform", "vs/workbench/common/contributions", "./startupProfiler", "./startupTimings", "vs/workbench/contrib/performance/electron-sandbox/rendererAutoProfiler", "vs/platform/configuration/common/configurationRegistry", "vs/nls", "vs/workbench/common/configuration"], function (require, exports, platform_1, contributions_1, startupProfiler_1, startupTimings_1, rendererAutoProfiler_1, configurationRegistry_1, nls_1, configuration_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    // -- auto profiler
    platform_1.Registry.as(contributions_1.Extensions.Workbench).registerWorkbenchContribution(rendererAutoProfiler_1.RendererProfiling, 4 /* LifecyclePhase.Eventually */);
    // -- startup profiler
    platform_1.Registry.as(contributions_1.Extensions.Workbench).registerWorkbenchContribution(startupProfiler_1.StartupProfiler, 3 /* LifecyclePhase.Restored */);
    // -- startup timings
    platform_1.Registry.as(contributions_1.Extensions.Workbench).registerWorkbenchContribution(startupTimings_1.NativeStartupTimings, 4 /* LifecyclePhase.Eventually */);
    platform_1.Registry.as(configurationRegistry_1.Extensions.Configuration).registerConfiguration({
        ...configuration_1.applicationConfigurationNodeBase,
        'properties': {
            'application.experimental.rendererProfiling': {
                type: 'boolean',
                default: false,
                tags: ['experimental'],
                markdownDescription: (0, nls_1.localize)('experimental.rendererProfiling', "When enabled slow renderers are automatically profiled")
            }
        }
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGVyZm9ybWFuY2UuY29udHJpYnV0aW9uLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvcGVyZm9ybWFuY2UvZWxlY3Ryb24tc2FuZGJveC9wZXJmb3JtYW5jZS5jb250cmlidXRpb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7SUFZaEcsbUJBQW1CO0lBRW5CLG1CQUFRLENBQUMsRUFBRSxDQUFrQywwQkFBVSxDQUFDLFNBQVMsQ0FBQyxDQUFDLDZCQUE2QixDQUMvRix3Q0FBaUIsb0NBRWpCLENBQUM7SUFFRixzQkFBc0I7SUFFdEIsbUJBQVEsQ0FBQyxFQUFFLENBQWtDLDBCQUFVLENBQUMsU0FBUyxDQUFDLENBQUMsNkJBQTZCLENBQy9GLGlDQUFlLGtDQUVmLENBQUM7SUFFRixxQkFBcUI7SUFFckIsbUJBQVEsQ0FBQyxFQUFFLENBQWtDLDBCQUFVLENBQUMsU0FBUyxDQUFDLENBQUMsNkJBQTZCLENBQy9GLHFDQUFvQixvQ0FFcEIsQ0FBQztJQUVGLG1CQUFRLENBQUMsRUFBRSxDQUF5QixrQ0FBUyxDQUFDLGFBQWEsQ0FBQyxDQUFDLHFCQUFxQixDQUFDO1FBQ2xGLEdBQUcsZ0RBQWdDO1FBQ25DLFlBQVksRUFBRTtZQUNiLDRDQUE0QyxFQUFFO2dCQUM3QyxJQUFJLEVBQUUsU0FBUztnQkFDZixPQUFPLEVBQUUsS0FBSztnQkFDZCxJQUFJLEVBQUUsQ0FBQyxjQUFjLENBQUM7Z0JBQ3RCLG1CQUFtQixFQUFFLElBQUEsY0FBUSxFQUFDLGdDQUFnQyxFQUFFLHdEQUF3RCxDQUFDO2FBQ3pIO1NBQ0Q7S0FDRCxDQUFDLENBQUMifQ==