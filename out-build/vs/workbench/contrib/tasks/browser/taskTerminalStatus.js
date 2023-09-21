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
define(["require", "exports", "vs/nls!vs/workbench/contrib/tasks/browser/taskTerminalStatus", "vs/base/common/codicons", "vs/base/common/lifecycle", "vs/base/common/severity", "vs/workbench/contrib/tasks/common/problemCollectors", "vs/workbench/contrib/tasks/common/taskService", "vs/platform/markers/common/markers", "vs/platform/theme/common/iconRegistry", "vs/platform/audioCues/browser/audioCueService"], function (require, exports, nls, codicons_1, lifecycle_1, severity_1, problemCollectors_1, taskService_1, markers_1, iconRegistry_1, audioCueService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$CXb = exports.$BXb = exports.$AXb = exports.$zXb = void 0;
    const TASK_TERMINAL_STATUS_ID = 'task_terminal_status';
    exports.$zXb = { id: TASK_TERMINAL_STATUS_ID, icon: iconRegistry_1.$dv, severity: severity_1.default.Info, tooltip: nls.localize(0, null) };
    exports.$AXb = { id: TASK_TERMINAL_STATUS_ID, icon: codicons_1.$Pj.check, severity: severity_1.default.Info, tooltip: nls.localize(1, null) };
    const SUCCEEDED_INACTIVE_TASK_STATUS = { id: TASK_TERMINAL_STATUS_ID, icon: codicons_1.$Pj.check, severity: severity_1.default.Info, tooltip: nls.localize(2, null) };
    exports.$BXb = { id: TASK_TERMINAL_STATUS_ID, icon: codicons_1.$Pj.error, severity: severity_1.default.Error, tooltip: nls.localize(3, null) };
    const FAILED_INACTIVE_TASK_STATUS = { id: TASK_TERMINAL_STATUS_ID, icon: codicons_1.$Pj.error, severity: severity_1.default.Error, tooltip: nls.localize(4, null) };
    const WARNING_TASK_STATUS = { id: TASK_TERMINAL_STATUS_ID, icon: codicons_1.$Pj.warning, severity: severity_1.default.Warning, tooltip: nls.localize(5, null) };
    const WARNING_INACTIVE_TASK_STATUS = { id: TASK_TERMINAL_STATUS_ID, icon: codicons_1.$Pj.warning, severity: severity_1.default.Warning, tooltip: nls.localize(6, null) };
    const INFO_TASK_STATUS = { id: TASK_TERMINAL_STATUS_ID, icon: codicons_1.$Pj.info, severity: severity_1.default.Info, tooltip: nls.localize(7, null) };
    const INFO_INACTIVE_TASK_STATUS = { id: TASK_TERMINAL_STATUS_ID, icon: codicons_1.$Pj.info, severity: severity_1.default.Info, tooltip: nls.localize(8, null) };
    let $CXb = class $CXb extends lifecycle_1.$kc {
        constructor(taskService, c) {
            super();
            this.c = c;
            this.a = new Map();
            this.B(taskService.onDidStateChange((event) => {
                switch (event.kind) {
                    case "processStarted" /* TaskEventKind.ProcessStarted */:
                    case "active" /* TaskEventKind.Active */:
                        this.j(event);
                        break;
                    case "inactive" /* TaskEventKind.Inactive */:
                        this.h(event);
                        break;
                    case "processEnded" /* TaskEventKind.ProcessEnded */:
                        this.g(event);
                        break;
                }
            }));
        }
        addTerminal(task, terminal, problemMatcher) {
            const status = { id: TASK_TERMINAL_STATUS_ID, severity: severity_1.default.Info };
            terminal.statusList.add(status);
            this.B(problemMatcher.onDidFindFirstMatch(() => {
                this.b = terminal.registerMarker();
            }));
            this.B(problemMatcher.onDidFindErrors(() => {
                if (this.b) {
                    terminal.addBufferMarker({ marker: this.b, hoverMessage: nls.localize(9, null), disableCommandStorage: true });
                }
            }));
            this.B(problemMatcher.onDidRequestInvalidateLastMarker(() => {
                this.b?.dispose();
                this.b = undefined;
            }));
            this.a.set(terminal.instanceId, { terminal, task, status, problemMatcher, taskRunEnded: false });
        }
        f(event) {
            if (!('terminalId' in event) || !event.terminalId) {
                return undefined;
            }
            return this.a.get(event.terminalId);
        }
        g(event) {
            const terminalData = this.f(event);
            if (!terminalData) {
                return;
            }
            terminalData.taskRunEnded = true;
            terminalData.terminal.statusList.remove(terminalData.status);
            if ((event.exitCode === 0) && (terminalData.problemMatcher.numberOfMatches === 0)) {
                this.c.playAudioCue(audioCueService_1.$wZ.taskCompleted);
                if (terminalData.task.configurationProperties.isBackground) {
                    for (const status of terminalData.terminal.statusList.statuses) {
                        terminalData.terminal.statusList.remove(status);
                    }
                }
                else {
                    terminalData.terminal.statusList.add(exports.$AXb);
                }
            }
            else if (event.exitCode || terminalData.problemMatcher.maxMarkerSeverity === markers_1.MarkerSeverity.Error) {
                this.c.playAudioCue(audioCueService_1.$wZ.taskFailed);
                terminalData.terminal.statusList.add(exports.$BXb);
            }
            else if (terminalData.problemMatcher.maxMarkerSeverity === markers_1.MarkerSeverity.Warning) {
                terminalData.terminal.statusList.add(WARNING_TASK_STATUS);
            }
            else if (terminalData.problemMatcher.maxMarkerSeverity === markers_1.MarkerSeverity.Info) {
                terminalData.terminal.statusList.add(INFO_TASK_STATUS);
            }
        }
        h(event) {
            const terminalData = this.f(event);
            if (!terminalData || !terminalData.problemMatcher || terminalData.taskRunEnded) {
                return;
            }
            terminalData.terminal.statusList.remove(terminalData.status);
            if (terminalData.problemMatcher.numberOfMatches === 0) {
                this.c.playAudioCue(audioCueService_1.$wZ.taskCompleted);
                terminalData.terminal.statusList.add(SUCCEEDED_INACTIVE_TASK_STATUS);
            }
            else if (terminalData.problemMatcher.maxMarkerSeverity === markers_1.MarkerSeverity.Error) {
                this.c.playAudioCue(audioCueService_1.$wZ.taskFailed);
                terminalData.terminal.statusList.add(FAILED_INACTIVE_TASK_STATUS);
            }
            else if (terminalData.problemMatcher.maxMarkerSeverity === markers_1.MarkerSeverity.Warning) {
                terminalData.terminal.statusList.add(WARNING_INACTIVE_TASK_STATUS);
            }
            else if (terminalData.problemMatcher.maxMarkerSeverity === markers_1.MarkerSeverity.Info) {
                terminalData.terminal.statusList.add(INFO_INACTIVE_TASK_STATUS);
            }
        }
        j(event) {
            const terminalData = this.f(event);
            if (!terminalData) {
                return;
            }
            if (!terminalData.disposeListener) {
                terminalData.disposeListener = terminalData.terminal.onDisposed(() => {
                    if (!event.terminalId) {
                        return;
                    }
                    this.a.delete(event.terminalId);
                    terminalData.disposeListener?.dispose();
                });
            }
            terminalData.taskRunEnded = false;
            terminalData.terminal.statusList.remove(terminalData.status);
            // We don't want to show an infinite status for a background task that doesn't have a problem matcher.
            if ((terminalData.problemMatcher instanceof problemCollectors_1.$xXb) || (terminalData.problemMatcher?.problemMatchers.length > 0) || event.runType === "singleRun" /* TaskRunType.SingleRun */) {
                terminalData.terminal.statusList.add(exports.$zXb);
            }
        }
    };
    exports.$CXb = $CXb;
    exports.$CXb = $CXb = __decorate([
        __param(0, taskService_1.$osb),
        __param(1, audioCueService_1.$sZ)
    ], $CXb);
});
//# sourceMappingURL=taskTerminalStatus.js.map