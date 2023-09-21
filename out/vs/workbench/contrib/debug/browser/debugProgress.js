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
define(["require", "exports", "vs/base/common/event", "vs/workbench/contrib/debug/common/debug", "vs/platform/progress/common/progress", "vs/base/common/lifecycle", "vs/workbench/common/views", "vs/platform/notification/common/notification"], function (require, exports, event_1, debug_1, progress_1, lifecycle_1, views_1, notification_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.DebugProgressContribution = void 0;
    let DebugProgressContribution = class DebugProgressContribution {
        constructor(debugService, progressService, viewsService) {
            this.toDispose = [];
            let progressListener;
            const listenOnProgress = (session) => {
                if (progressListener) {
                    progressListener.dispose();
                    progressListener = undefined;
                }
                if (session) {
                    progressListener = session.onDidProgressStart(async (progressStartEvent) => {
                        const promise = new Promise(r => {
                            // Show progress until a progress end event comes or the session ends
                            const listener = event_1.Event.any(event_1.Event.filter(session.onDidProgressEnd, e => e.body.progressId === progressStartEvent.body.progressId), session.onDidEndAdapter)(() => {
                                listener.dispose();
                                r();
                            });
                        });
                        if (viewsService.isViewContainerVisible(debug_1.VIEWLET_ID)) {
                            progressService.withProgress({ location: debug_1.VIEWLET_ID }, () => promise);
                        }
                        const source = debugService.getAdapterManager().getDebuggerLabel(session.configuration.type);
                        progressService.withProgress({
                            location: 15 /* ProgressLocation.Notification */,
                            title: progressStartEvent.body.title,
                            cancellable: progressStartEvent.body.cancellable,
                            priority: notification_1.NotificationPriority.SILENT,
                            source,
                            delay: 500
                        }, progressStep => {
                            let total = 0;
                            const reportProgress = (progress) => {
                                let increment = undefined;
                                if (typeof progress.percentage === 'number') {
                                    increment = progress.percentage - total;
                                    total += increment;
                                }
                                progressStep.report({
                                    message: progress.message,
                                    increment,
                                    total: typeof increment === 'number' ? 100 : undefined,
                                });
                            };
                            if (progressStartEvent.body.message) {
                                reportProgress(progressStartEvent.body);
                            }
                            const progressUpdateListener = session.onDidProgressUpdate(e => {
                                if (e.body.progressId === progressStartEvent.body.progressId) {
                                    reportProgress(e.body);
                                }
                            });
                            return promise.then(() => progressUpdateListener.dispose());
                        }, () => session.cancel(progressStartEvent.body.progressId));
                    });
                }
            };
            this.toDispose.push(debugService.getViewModel().onDidFocusSession(listenOnProgress));
            listenOnProgress(debugService.getViewModel().focusedSession);
            this.toDispose.push(debugService.onWillNewSession(session => {
                if (!progressListener) {
                    listenOnProgress(session);
                }
            }));
        }
        dispose() {
            (0, lifecycle_1.dispose)(this.toDispose);
        }
    };
    exports.DebugProgressContribution = DebugProgressContribution;
    exports.DebugProgressContribution = DebugProgressContribution = __decorate([
        __param(0, debug_1.IDebugService),
        __param(1, progress_1.IProgressService),
        __param(2, views_1.IViewsService)
    ], DebugProgressContribution);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVidWdQcm9ncmVzcy5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL2RlYnVnL2Jyb3dzZXIvZGVidWdQcm9ncmVzcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUFVekYsSUFBTSx5QkFBeUIsR0FBL0IsTUFBTSx5QkFBeUI7UUFJckMsWUFDZ0IsWUFBMkIsRUFDeEIsZUFBaUMsRUFDcEMsWUFBMkI7WUFMbkMsY0FBUyxHQUFrQixFQUFFLENBQUM7WUFPckMsSUFBSSxnQkFBeUMsQ0FBQztZQUM5QyxNQUFNLGdCQUFnQixHQUFHLENBQUMsT0FBa0MsRUFBRSxFQUFFO2dCQUMvRCxJQUFJLGdCQUFnQixFQUFFO29CQUNyQixnQkFBZ0IsQ0FBQyxPQUFPLEVBQUUsQ0FBQztvQkFDM0IsZ0JBQWdCLEdBQUcsU0FBUyxDQUFDO2lCQUM3QjtnQkFDRCxJQUFJLE9BQU8sRUFBRTtvQkFDWixnQkFBZ0IsR0FBRyxPQUFPLENBQUMsa0JBQWtCLENBQUMsS0FBSyxFQUFDLGtCQUFrQixFQUFDLEVBQUU7d0JBQ3hFLE1BQU0sT0FBTyxHQUFHLElBQUksT0FBTyxDQUFPLENBQUMsQ0FBQyxFQUFFOzRCQUNyQyxxRUFBcUU7NEJBQ3JFLE1BQU0sUUFBUSxHQUFHLGFBQUssQ0FBQyxHQUFHLENBQUMsYUFBSyxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQVUsS0FBSyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLEVBQy9ILE9BQU8sQ0FBQyxlQUFlLENBQUMsQ0FBQyxHQUFHLEVBQUU7Z0NBQzdCLFFBQVEsQ0FBQyxPQUFPLEVBQUUsQ0FBQztnQ0FDbkIsQ0FBQyxFQUFFLENBQUM7NEJBQ0wsQ0FBQyxDQUFDLENB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