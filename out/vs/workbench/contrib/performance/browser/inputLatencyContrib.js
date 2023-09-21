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
define(["require", "exports", "vs/base/browser/performance", "vs/base/common/async", "vs/base/common/event", "vs/base/common/lifecycle", "vs/platform/telemetry/common/telemetry", "vs/workbench/services/editor/common/editorService"], function (require, exports, performance_1, async_1, event_1, lifecycle_1, telemetry_1, editorService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.InputLatencyContrib = void 0;
    let InputLatencyContrib = class InputLatencyContrib extends lifecycle_1.Disposable {
        constructor(_editorService, _telemetryService) {
            super();
            this._editorService = _editorService;
            this._telemetryService = _telemetryService;
            this._listener = this._register(new lifecycle_1.MutableDisposable());
            // The current sampling strategy is when the active editor changes, start sampling and
            // report the results after 60 seconds. It's done this way as we don't want to sample
            // everything, just somewhat randomly, and using an interval would utilize CPU when the
            // application is inactive.
            this._scheduler = this._register(new async_1.RunOnceScheduler(() => {
                this._logSamples();
                this._setupListener();
            }, 60000));
            this._setupListener();
        }
        _setupListener() {
            this._listener.value = event_1.Event.once(this._editorService.onDidActiveEditorChange)(() => this._scheduler.schedule());
        }
        _logSamples() {
            const measurements = performance_1.inputLatency.getAndClearMeasurements();
            if (!measurements) {
                return;
            }
            this._telemetryService.publicLog2('performance.inputLatency', {
                keydown: measurements.keydown,
                input: measurements.input,
                render: measurements.render,
                total: measurements.total,
                sampleCount: measurements.sampleCount
            });
        }
    };
    exports.InputLatencyContrib = InputLatencyContrib;
    exports.InputLatencyContrib = InputLatencyContrib = __decorate([
        __param(0, editorService_1.IEditorService),
        __param(1, telemetry_1.ITelemetryService)
    ], InputLatencyContrib);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5wdXRMYXRlbmN5Q29udHJpYi5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL3BlcmZvcm1hbmNlL2Jyb3dzZXIvaW5wdXRMYXRlbmN5Q29udHJpYi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUFVekYsSUFBTSxtQkFBbUIsR0FBekIsTUFBTSxtQkFBb0IsU0FBUSxzQkFBVTtRQUlsRCxZQUNpQixjQUErQyxFQUM1QyxpQkFBcUQ7WUFFeEUsS0FBSyxFQUFFLENBQUM7WUFIeUIsbUJBQWMsR0FBZCxjQUFjLENBQWdCO1lBQzNCLHNCQUFpQixHQUFqQixpQkFBaUIsQ0FBbUI7WUFMeEQsY0FBUyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSw2QkFBaUIsRUFBRSxDQUFDLENBQUM7WUFTcEUsc0ZBQXNGO1lBQ3RGLHFGQUFxRjtZQUNyRix1RkFBdUY7WUFDdkYsMkJBQTJCO1lBQzNCLElBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLHdCQUFnQixDQUFDLEdBQUcsRUFBRTtnQkFDMUQsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDO2dCQUNuQixJQUFJLENBQUMsY0FBYyxFQUFFLENBQUM7WUFDdkIsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUM7WUFFWCxJQUFJLENBQUMsY0FBYyxFQUFFLENBQUM7UUFDdkIsQ0FBQztRQUVPLGNBQWM7WUFDckIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLEdBQUcsYUFBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLHVCQUF1QixDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDO1FBQ2xILENBQUM7UUFFTyxXQUFXO1lBQ2xCLE1BQU0sWUFBWSxHQUFHLDBCQUFZLENBQUMsdUJBQXVCLEVBQUUsQ0FBQztZQUM1RCxJQUFJLENBQUMsWUFBWSxFQUFFO2dCQUNsQixPQUFPO2FBQ1A7WUFzQkQsSUFBSSxDQUFDLGlCQUFpQixDQUFDLFVBQVUsQ0FBc0UsMEJBQTBCLEVBQUU7Z0JBQ2xJLE9BQU8sRUFBRSxZQUFZLENBQUMsT0FBTztnQkFDN0IsS0FBSyxFQUFFLFlBQVksQ0FBQyxLQUFLO2dCQUN6QixNQUFNLEVBQUUsWUFBWSxDQUFDLE1BQU07Z0JBQzNCLEtBQUssRUFBRSxZQUFZLENBQUMsS0FBSztnQkFDekIsV0FBVyxFQUFFLFlBQVksQ0FBQyxXQUFXO2FBQ3JDLENBQUMsQ0FBQztRQUNKLENBQUM7S0FDRCxDQUFBO0lBNURZLGtEQUFtQjtrQ0FBbkIsbUJBQW1CO1FBSzdCLFdBQUEsOEJBQWMsQ0FBQTtRQUNkLFdBQUEsNkJBQWlCLENBQUE7T0FOUCxtQkFBbUIsQ0E0RC9CIn0=