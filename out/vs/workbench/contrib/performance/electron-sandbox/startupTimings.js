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
define(["require", "exports", "vs/base/common/async", "vs/base/common/errors", "vs/workbench/services/environment/electron-sandbox/environmentService", "vs/workbench/services/lifecycle/common/lifecycle", "vs/platform/product/common/productService", "vs/platform/telemetry/common/telemetry", "vs/platform/update/common/update", "vs/platform/native/common/native", "vs/workbench/services/editor/common/editorService", "vs/workbench/services/timer/browser/timerService", "vs/platform/files/common/files", "vs/base/common/uri", "vs/base/common/buffer", "vs/platform/workspace/common/workspaceTrust", "vs/workbench/services/panecomposite/browser/panecomposite", "vs/workbench/contrib/performance/browser/startupTimings"], function (require, exports, async_1, errors_1, environmentService_1, lifecycle_1, productService_1, telemetry_1, update_1, native_1, editorService_1, timerService_1, files_1, uri_1, buffer_1, workspaceTrust_1, panecomposite_1, startupTimings_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.NativeStartupTimings = void 0;
    let NativeStartupTimings = class NativeStartupTimings extends startupTimings_1.StartupTimings {
        constructor(_fileService, _timerService, _nativeHostService, editorService, paneCompositeService, _telemetryService, lifecycleService, updateService, _environmentService, _productService, workspaceTrustService) {
            super(editorService, paneCompositeService, lifecycleService, updateService, workspaceTrustService);
            this._fileService = _fileService;
            this._timerService = _timerService;
            this._nativeHostService = _nativeHostService;
            this._telemetryService = _telemetryService;
            this._environmentService = _environmentService;
            this._productService = _productService;
            this._report().catch(errors_1.onUnexpectedError);
        }
        async _report() {
            const standardStartupError = await this._isStandardStartup();
            this._appendStartupTimes(standardStartupError).catch(errors_1.onUnexpectedError);
        }
        async _appendStartupTimes(standardStartupError) {
            const appendTo = this._environmentService.args['prof-append-timers'];
            const durationMarkers = this._environmentService.args['prof-duration-markers'];
            const durationMarkersFile = this._environmentService.args['prof-duration-markers-file'];
            if (!appendTo && !durationMarkers) {
                // nothing to do
                return;
            }
            try {
                await Promise.all([
                    this._timerService.whenReady(),
                    (0, async_1.timeout)(15000), // wait: cached data creation, telemetry sending
                ]);
                const perfBaseline = await this._timerService.perfBaseline;
                if (appendTo) {
                    const content = `${this._timerService.startupMetrics.ellapsed}\t${this._productService.nameShort}\t${(this._productService.commit || '').slice(0, 10) || '0000000000'}\t${this._telemetryService.sessionId}\t${standardStartupError === undefined ? 'standard_start' : 'NO_standard_start : ' + standardStartupError}\t${String(perfBaseline).padStart(4, '0')}ms\n`;
                    await this.appendContent(uri_1.URI.file(appendTo), content);
                }
                if (durationMarkers?.length) {
                    const durations = [];
                    for (const durationMarker of durationMarkers) {
                        let duration = 0;
                        if (durationMarker === 'ellapsed') {
                            duration = this._timerService.startupMetrics.ellapsed;
                        }
                        else if (durationMarker.indexOf('-') !== -1) {
                            const markers = durationMarker.split('-');
                            if (markers.length === 2) {
                                duration = this._timerService.getDuration(markers[0], markers[1]);
                            }
                        }
                        if (duration) {
                            durations.push(durationMarker);
                            durations.push(`${duration}`);
                        }
                    }
                    const durationsContent = `${durations.join('\t')}\n`;
                    if (durationMarkersFile) {
                        await this.appendContent(uri_1.URI.file(durationMarkersFile), durationsContent);
                    }
                    else {
                        console.log(durationsContent);
                    }
                }
            }
            catch (err) {
                console.error(err);
            }
            finally {
                this._nativeHostService.exit(0);
            }
        }
        async _isStandardStartup() {
            const windowCount = await this._nativeHostService.getWindowCount();
            if (windowCount !== 1) {
                return `Expected window count : 1, Actual : ${windowCount}`;
            }
            return super._isStandardStartup();
        }
        async appendContent(file, content) {
            const chunks = [];
            if (await this._fileService.exists(file)) {
                chunks.push((await this._fileService.readFile(file)).value);
            }
            chunks.push(buffer_1.VSBuffer.fromString(content));
            await this._fileService.writeFile(file, buffer_1.VSBuffer.concat(chunks));
        }
    };
    exports.NativeStartupTimings = NativeStartupTimings;
    exports.NativeStartupTimings = NativeStartupTimings = __decorate([
        __param(0, files_1.IFileService),
        __param(1, timerService_1.ITimerService),
        __param(2, native_1.INativeHostService),
        __param(3, editorService_1.IEditorService),
        __param(4, panecomposite_1.IPaneCompositePartService),
        __param(5, telemetry_1.ITelemetryService),
        __param(6, lifecycle_1.ILifecycleService),
        __param(7, update_1.IUpdateService),
        __param(8, environmentService_1.INativeWorkbenchEnvironmentService),
        __param(9, productService_1.IProductService),
        __param(10, workspaceTrust_1.IWorkspaceTrustManagementService)
    ], NativeStartupTimings);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RhcnR1cFRpbWluZ3MuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9wZXJmb3JtYW5jZS9lbGVjdHJvbi1zYW5kYm94L3N0YXJ0dXBUaW1pbmdzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQW9CekYsSUFBTSxvQkFBb0IsR0FBMUIsTUFBTSxvQkFBcUIsU0FBUSwrQkFBYztRQUV2RCxZQUNnQyxZQUEwQixFQUN6QixhQUE0QixFQUN2QixrQkFBc0MsRUFDM0QsYUFBNkIsRUFDbEIsb0JBQStDLEVBQ3RDLGlCQUFvQyxFQUNyRCxnQkFBbUMsRUFDdEMsYUFBNkIsRUFDUSxtQkFBdUQsRUFDMUUsZUFBZ0MsRUFDaEMscUJBQXVEO1lBRXpGLEtBQUssQ0FBQyxhQUFhLEVBQUUsb0JBQW9CLEVBQUUsZ0JBQWdCLEVBQUUsYUFBYSxFQUFFLHFCQUFxQixDQUFDLENBQUM7WUFacEUsaUJBQVksR0FBWixZQUFZLENBQWM7WUFDekIsa0JBQWEsR0FBYixhQUFhLENBQWU7WUFDdkIsdUJBQWtCLEdBQWxCLGtCQUFrQixDQUFvQjtZQUd2QyxzQkFBaUIsR0FBakIsaUJBQWlCLENBQW1CO1lBR25CLHdCQUFtQixHQUFuQixtQkFBbUIsQ0FBb0M7WUFDMUUsb0JBQWUsR0FBZixlQUFlLENBQWlCO1lBS2xFLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQyxLQUFLLENBQUMsMEJBQWlCLENBQUMsQ0FBQztRQUN6QyxDQUFDO1FBRU8sS0FBSyxDQUFDLE9BQU87WUFDcEIsTUFBTSxvQkFBb0IsR0FBRyxNQUFNLElBQUksQ0FBQyxrQkFBa0IsRUFBRSxDQUFDO1lBQzdELElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDLEtBQUssQ0FBQywwQkFBaUIsQ0FBQyxDQUFDO1FBQ3pFLENBQUM7UUFFTyxLQUFLLENBQUMsbUJBQW1CLENBQUMsb0JBQXdDO1lBQ3pFLE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxJQUFJLENBQUMsb0JBQW9CLENBQUMsQ0FBQztZQUNyRSxNQUFNLGVBQWUsR0FBRyxJQUFJLENBQUMsbUJBQW1CLENBQUMsSUFBSSxDQUFDLHVCQUF1QixDQUFDLENBQUM7WUFDL0UsTUFBTSxtQkFBbUIsR0FBRyxJQUFJLENBQUMsbUJBQW1CLENBQUMsSUFBSSxDQUFDLDRCQUE0QixDQUFDLENBQUM7WUFDeEYsSUFBSSxDQUFDLFFBQVEsSUFBSSxDQUFDLGVBQWUsRUFBRTtnQkFDbEMsZ0JBQWdCO2dCQUNoQixPQUFPO2FBQ1A7WUFFRCxJQUFJO2dCQUNILE1BQU0sT0FBTyxDQUFDLEdBQUcsQ0FBQztvQkFDakIsSUFBSSxDQUFDLGFBQWEsQ0FBQyxTQUFTLEVBQUU7b0JBQzlCLElBQUEsZUFBTyxFQUFDLEtBQUssQ0FBQyxFQUFFLGdEQUFnRDtpQkFDaEUsQ0FBQyxDQUFDO2dCQUVILE1BQU0sWUFBWSxHQUFHLE1BQU0sSUFBSSxDQUFDLGFBQWEsQ0FBQyxZQUFZLENBQUM7Z0JBRTNELElBQUksUUFBUSxFQUFFO29CQUNiLE1BQU0sT0FBTyxHQUFHLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxjQUFjLENBQUMsUUFBUSxLQUFLLElBQUksQ0FBQyxlQUFlLENBQUMsU0FBUyxLQUFLLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxNQUFNLElBQUksRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsSUFBSSxZQUFZLEtBQUssSUFBSSxDQUFDLGlCQUFpQixDQUFDLFNBQVMsS0FBSyxvQkFBb0IsS0FBSyxTQUFTLENBQUMsQ0FBQyxDQUFDLGdCQUFnQixDQUFDLENBQUMsQ0FBQyxzQkFBc0IsR0FBRyxvQkFBb0IsS0FBSyxNQUFNLENBQUMsWUFBWSxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsTUFBTSxDQUFDO29CQUNyVyxNQUFNLElBQUksQ0FBQyxhQUFhLENBQUMsU0FBRyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsRUFBRSxPQUFPLENBQUMsQ0FBQztpQkFDdEQ7Z0JBRUQsSUFBSSxlQUFlLEVBQUUsTUFBTSxFQUFFO29CQUM1QixNQUFNLFNBQVMsR0FBYSxFQUFFLENBQUM7b0JBQy9CLEtBQUssTUFBTSxjQUFjLElBQUksZUFBZSxFQUFFO3dCQUM3QyxJQUFJLFFBQVEsR0FBVyxDQUFDLENBQUM7d0JBQ3pCLElBQUksY0FBYyxLQUFLLFVBQVUsRUFBRTs0QkFDbEMsUUFBUSxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsY0FBYyxDQUFDLFFBQVEsQ0FBQzt5QkFDdEQ7NkJBQU0sSUFBSSxjQUFjLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFOzRCQUM5QyxNQUFNLE9BQU8sR0FBRyxjQUFjLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDOzRCQUMxQyxJQUFJLE9BQU8sQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO2dDQUN6QixRQUFRLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxFQUFFLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDOzZCQUNsRTt5QkFDRDt3QkFDRCxJQUFJLFFBQVEsRUFBRTs0QkFDYixTQUFTLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDOzRCQUMvQixTQUFTLENBQUMsSUFBSSxDQUFDLEdBQUcsUUFBUSxFQUFFLENBQUMsQ0FBQzt5QkFDOUI7cUJBQ0Q7b0JBRUQsTUFBTSxnQkFBZ0IsR0FBRyxHQUFHLFNBQVMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQztvQkFDckQsSUFBSSxtQkFBbUIsRUFBRTt3QkFDeEIsTUFBTSxJQUFJLENBQUMsYUFBYSxDQUFDLFNBQUcsQ0FBQyxJQUFJLENBQUMsbUJBQW1CLENBQUMsRUFBRSxnQkFBZ0IsQ0FBQyxDQUFDO3FCQUMxRTt5QkFBTTt3QkFDTixPQUFPLENBQUMsR0FBRyxDQUFDLGdCQUFnQixDQUFDLENBQUM7cUJBQzlCO2lCQUNEO2FBRUQ7WUFBQyxPQUFPLEdBQUcsRUFBRTtnQkFDYixPQUFPLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO2FBQ25CO29CQUFTO2dCQUNULElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7YUFDaEM7UUFDRixDQUFDO1FBRWtCLEtBQUssQ0FBQyxrQkFBa0I7WUFDMUMsTUFBTSxXQUFXLEdBQUcsTUFBTSxJQUFJLENBQUMsa0JBQWtCLENBQUMsY0FBYyxFQUFFLENBQUM7WUFDbkUsSUFBSSxXQUFXLEtBQUssQ0FBQyxFQUFFO2dCQUN0QixPQUFPLHVDQUF1QyxXQUFXLEVBQUUsQ0FBQzthQUM1RDtZQUNELE9BQU8sS0FBSyxDQUFDLGtCQUFrQixFQUFFLENBQUM7UUFDbkMsQ0FBQztRQUVPLEtBQUssQ0FBQyxhQUFhLENBQUMsSUFBUyxFQUFFLE9BQWU7WUFDckQsTUFBTSxNQUFNLEdBQWUsRUFBRSxDQUFDO1lBQzlCLElBQUksTUFBTSxJQUFJLENBQUMsWUFBWSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRTtnQkFDekMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLE1BQU0sSUFBSSxDQUFDLFlBQVksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQzthQUM1RDtZQUNELE1BQU0sQ0FBQyxJQUFJLENBQUMsaUJBQVEsQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztZQUMxQyxNQUFNLElBQUksQ0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDLElBQUksRUFBRSxpQkFBUSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO1FBQ2xFLENBQUM7S0FDRCxDQUFBO0lBaEdZLG9EQUFvQjttQ0FBcEIsb0JBQW9CO1FBRzlCLFdBQUEsb0JBQVksQ0FBQTtRQUNaLFdBQUEsNEJBQWEsQ0FBQTtRQUNiLFdBQUEsMkJBQWtCLENBQUE7UUFDbEIsV0FBQSw4QkFBYyxDQUFBO1FBQ2QsV0FBQSx5Q0FBeUIsQ0FBQTtRQUN6QixXQUFBLDZCQUFpQixDQUFBO1FBQ2pCLFdBQUEsNkJBQWlCLENBQUE7UUFDakIsV0FBQSx1QkFBYyxDQUFBO1FBQ2QsV0FBQSx1REFBa0MsQ0FBQTtRQUNsQyxXQUFBLGdDQUFlLENBQUE7UUFDZixZQUFBLGlEQUFnQyxDQUFBO09BYnRCLG9CQUFvQixDQWdHaEMifQ==