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
define(["require", "exports", "vs/nls", "vs/base/common/codicons", "vs/base/common/lifecycle", "vs/base/common/severity", "vs/workbench/contrib/tasks/common/problemCollectors", "vs/workbench/contrib/tasks/common/taskService", "vs/platform/markers/common/markers", "vs/platform/theme/common/iconRegistry", "vs/platform/audioCues/browser/audioCueService"], function (require, exports, nls, codicons_1, lifecycle_1, severity_1, problemCollectors_1, taskService_1, markers_1, iconRegistry_1, audioCueService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TaskTerminalStatus = exports.FAILED_TASK_STATUS = exports.SUCCEEDED_TASK_STATUS = exports.ACTIVE_TASK_STATUS = void 0;
    const TASK_TERMINAL_STATUS_ID = 'task_terminal_status';
    exports.ACTIVE_TASK_STATUS = { id: TASK_TERMINAL_STATUS_ID, icon: iconRegistry_1.spinningLoading, severity: severity_1.default.Info, tooltip: nls.localize('taskTerminalStatus.active', "Task is running") };
    exports.SUCCEEDED_TASK_STATUS = { id: TASK_TERMINAL_STATUS_ID, icon: codicons_1.Codicon.check, severity: severity_1.default.Info, tooltip: nls.localize('taskTerminalStatus.succeeded', "Task succeeded") };
    const SUCCEEDED_INACTIVE_TASK_STATUS = { id: TASK_TERMINAL_STATUS_ID, icon: codicons_1.Codicon.check, severity: severity_1.default.Info, tooltip: nls.localize('taskTerminalStatus.succeededInactive', "Task succeeded and waiting...") };
    exports.FAILED_TASK_STATUS = { id: TASK_TERMINAL_STATUS_ID, icon: codicons_1.Codicon.error, severity: severity_1.default.Error, tooltip: nls.localize('taskTerminalStatus.errors', "Task has errors") };
    const FAILED_INACTIVE_TASK_STATUS = { id: TASK_TERMINAL_STATUS_ID, icon: codicons_1.Codicon.error, severity: severity_1.default.Error, tooltip: nls.localize('taskTerminalStatus.errorsInactive', "Task has errors and is waiting...") };
    const WARNING_TASK_STATUS = { id: TASK_TERMINAL_STATUS_ID, icon: codicons_1.Codicon.warning, severity: severity_1.default.Warning, tooltip: nls.localize('taskTerminalStatus.warnings', "Task has warnings") };
    const WARNING_INACTIVE_TASK_STATUS = { id: TASK_TERMINAL_STATUS_ID, icon: codicons_1.Codicon.warning, severity: severity_1.default.Warning, tooltip: nls.localize('taskTerminalStatus.warningsInactive', "Task has warnings and is waiting...") };
    const INFO_TASK_STATUS = { id: TASK_TERMINAL_STATUS_ID, icon: codicons_1.Codicon.info, severity: severity_1.default.Info, tooltip: nls.localize('taskTerminalStatus.infos', "Task has infos") };
    const INFO_INACTIVE_TASK_STATUS = { id: TASK_TERMINAL_STATUS_ID, icon: codicons_1.Codicon.info, severity: severity_1.default.Info, tooltip: nls.localize('taskTerminalStatus.infosInactive', "Task has infos and is waiting...") };
    let TaskTerminalStatus = class TaskTerminalStatus extends lifecycle_1.Disposable {
        constructor(taskService, _audioCueService) {
            super();
            this._audioCueService = _audioCueService;
            this.terminalMap = new Map();
            this._register(taskService.onDidStateChange((event) => {
                switch (event.kind) {
                    case "processStarted" /* TaskEventKind.ProcessStarted */:
                    case "active" /* TaskEventKind.Active */:
                        this.eventActive(event);
                        break;
                    case "inactive" /* TaskEventKind.Inactive */:
                        this.eventInactive(event);
                        break;
                    case "processEnded" /* TaskEventKind.ProcessEnded */:
                        this.eventEnd(event);
                        break;
                }
            }));
        }
        addTerminal(task, terminal, problemMatcher) {
            const status = { id: TASK_TERMINAL_STATUS_ID, severity: severity_1.default.Info };
            terminal.statusList.add(status);
            this._register(problemMatcher.onDidFindFirstMatch(() => {
                this._marker = terminal.registerMarker();
            }));
            this._register(problemMatcher.onDidFindErrors(() => {
                if (this._marker) {
                    terminal.addBufferMarker({ marker: this._marker, hoverMessage: nls.localize('task.watchFirstError', "Beginning of detected errors for this run"), disableCommandStorage: true });
                }
            }));
            this._register(problemMatcher.onDidRequestInvalidateLastMarker(() => {
                this._marker?.dispose();
                this._marker = undefined;
            }));
            this.terminalMap.set(terminal.instanceId, { terminal, task, status, problemMatcher, taskRunEnded: false });
        }
        terminalFromEvent(event) {
            if (!('terminalId' in event) || !event.terminalId) {
                return undefined;
            }
            return this.terminalMap.get(event.terminalId);
        }
        eventEnd(event) {
            const terminalData = this.terminalFromEvent(event);
            if (!terminalData) {
                return;
            }
            terminalData.taskRunEnded = true;
            terminalData.terminal.statusList.remove(terminalData.status);
            if ((event.exitCode === 0) && (terminalData.problemMatcher.numberOfMatches === 0)) {
                this._audioCueService.playAudioCue(audioCueService_1.AudioCue.taskCompleted);
                if (terminalData.task.configurationProperties.isBackground) {
                    for (const status of terminalData.terminal.statusList.statuses) {
                        terminalData.terminal.statusList.remove(status);
                    }
                }
                else {
                    terminalData.terminal.statusList.add(exports.SUCCEEDED_TASK_STATUS);
                }
            }
            else if (event.exitCode || terminalData.problemMatcher.maxMarkerSeverity === markers_1.MarkerSeverity.Error) {
                this._audioCueService.playAudioCue(audioCueService_1.AudioCue.taskFailed);
                terminalData.terminal.statusList.add(exports.FAILED_TASK_STATUS);
            }
            else if (terminalData.problemMatcher.maxMarkerSeverity === markers_1.MarkerSeverity.Warning) {
                terminalData.terminal.statusList.add(WARNING_TASK_STATUS);
            }
            else if (terminalData.problemMatcher.maxMarkerSeverity === markers_1.MarkerSeverity.Info) {
                terminalData.terminal.statusList.add(INFO_TASK_STATUS);
            }
        }
        eventInactive(event) {
            const terminalData = this.terminalFromEvent(event);
            if (!terminalData || !terminalData.problemMatcher || terminalData.taskRunEnded) {
                return;
            }
            terminalData.terminal.statusList.remove(terminalData.status);
            if (terminalData.problemMatcher.numberOfMatches === 0) {
                this._audioCueService.playAudioCue(audioCueService_1.AudioCue.taskCompleted);
                terminalData.terminal.statusList.add(SUCCEEDED_INACTIVE_TASK_STATUS);
            }
            else if (terminalData.problemMatcher.maxMarkerSeverity === markers_1.MarkerSeverity.Error) {
                this._audioCueService.playAudioCue(audioCueService_1.AudioCue.taskFailed);
                terminalData.terminal.statusList.add(FAILED_INACTIVE_TASK_STATUS);
            }
            else if (terminalData.problemMatcher.maxMarkerSeverity === markers_1.MarkerSeverity.Warning) {
                terminalData.terminal.statusList.add(WARNING_INACTIVE_TASK_STATUS);
            }
            else if (terminalData.problemMatcher.maxMarkerSeverity === markers_1.MarkerSeverity.Info) {
                terminalData.terminal.statusList.add(INFO_INACTIVE_TASK_STATUS);
            }
        }
        eventActive(event) {
            const terminalData = this.terminalFromEvent(event);
            if (!terminalData) {
                return;
            }
            if (!terminalData.disposeListener) {
                terminalData.disposeListener = terminalData.terminal.onDisposed(() => {
                    if (!event.terminalId) {
                        return;
                    }
                    this.terminalMap.delete(event.terminalId);
                    terminalData.disposeListener?.dispose();
                });
            }
            terminalData.taskRunEnded = false;
            terminalData.terminal.statusList.remove(terminalData.status);
            // We don't want to show an infinite status for a background task that doesn't have a problem matcher.
            if ((terminalData.problemMatcher instanceof problemCollectors_1.StartStopProblemCollector) || (terminalData.problemMatcher?.problemMatchers.length > 0) || event.runType === "singleRun" /* TaskRunType.SingleRun */) {
                terminalData.terminal.statusList.add(exports.ACTIVE_TASK_STATUS);
            }
        }
    };
    exports.TaskTerminalStatus = TaskTerminalStatus;
    exports.TaskTerminalStatus = TaskTerminalStatus = __decorate([
        __param(0, taskService_1.ITaskService),
        __param(1, audioCueService_1.IAudioCueService)
    ], TaskTerminalStatus);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGFza1Rlcm1pbmFsU3RhdHVzLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvdGFza3MvYnJvd3Nlci90YXNrVGVybWluYWxTdGF0dXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBeUJoRyxNQUFNLHVCQUF1QixHQUFHLHNCQUFzQixDQUFDO0lBQzFDLFFBQUEsa0JBQWtCLEdBQW9CLEVBQUUsRUFBRSxFQUFFLHVCQUF1QixFQUFFLElBQUksRUFBRSw4QkFBZSxFQUFFLFFBQVEsRUFBRSxrQkFBUSxDQUFDLElBQUksRUFBRSxPQUFPLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQywyQkFBMkIsRUFBRSxpQkFBaUIsQ0FBQyxFQUFFLENBQUM7SUFDN0wsUUFBQSxxQkFBcUIsR0FBb0IsRUFBRSxFQUFFLEVBQUUsdUJBQXVCLEVBQUUsSUFBSSxFQUFFLGtCQUFPLENBQUMsS0FBSyxFQUFFLFFBQVEsRUFBRSxrQkFBUSxDQUFDLElBQUksRUFBRSxPQUFPLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQyw4QkFBOEIsRUFBRSxnQkFBZ0IsQ0FBQyxFQUFFLENBQUM7SUFDN00sTUFBTSw4QkFBOEIsR0FBb0IsRUFBRSxFQUFFLEVBQUUsdUJBQXVCLEVBQUUsSUFBSSxFQUFFLGtCQUFPLENBQUMsS0FBSyxFQUFFLFFBQVEsRUFBRSxrQkFBUSxDQUFDLElBQUksRUFBRSxPQUFPLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQyxzQ0FBc0MsRUFBRSwrQkFBK0IsQ0FBQyxFQUFFLENBQUM7SUFDek4sUUFBQSxrQkFBa0IsR0FBb0IsRUFBRSxFQUFFLEVBQUUsdUJBQXVCLEVBQUUsSUFBSSxFQUFFLGtCQUFPLENBQUMsS0FBSyxFQUFFLFFBQVEsRUFBRSxrQkFBUSxDQUFDLEtBQUssRUFBRSxPQUFPLEVBQUUsR0FBRyxDQUFD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