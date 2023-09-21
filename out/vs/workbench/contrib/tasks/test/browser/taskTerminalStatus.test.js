/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/test/common/utils", "vs/platform/configuration/test/common/testConfigurationService", "vs/platform/instantiation/test/common/instantiationServiceMock", "vs/workbench/contrib/tasks/browser/taskTerminalStatus", "vs/workbench/contrib/tasks/common/tasks", "vs/workbench/contrib/terminal/browser/terminalStatusList"], function (require, exports, assert_1, event_1, lifecycle_1, utils_1, testConfigurationService_1, instantiationServiceMock_1, taskTerminalStatus_1, tasks_1, terminalStatusList_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class TestTaskService {
        constructor() {
            this._onDidStateChange = new event_1.Emitter();
        }
        get onDidStateChange() {
            return this._onDidStateChange.event;
        }
        triggerStateChange(event) {
            this._onDidStateChange.fire(event);
        }
    }
    class TestAudioCueService {
        async playAudioCue(cue) {
            return;
        }
    }
    class TestTerminal {
        constructor() {
            this.statusList = new terminalStatusList_1.TerminalStatusList(new testConfigurationService_1.TestConfigurationService());
        }
    }
    class TestTask extends tasks_1.CommonTask {
        constructor() {
            super('test', undefined, undefined, {}, {}, { kind: '', label: '' });
        }
        getFolderId() {
            throw new Error('Method not implemented.');
        }
        fromObject(object) {
            throw new Error('Method not implemented.');
        }
    }
    class TestProblemCollector {
        constructor() {
            this._onDidFindFirstMatch = new event_1.Emitter();
            this.onDidFindFirstMatch = this._onDidFindFirstMatch.event;
            this._onDidFindErrors = new event_1.Emitter();
            this.onDidFindErrors = this._onDidFindErrors.event;
            this._onDidRequestInvalidateLastMarker = new event_1.Emitter();
            this.onDidRequestInvalidateLastMarker = this._onDidRequestInvalidateLastMarker.event;
        }
    }
    suite('Task Terminal Status', () => {
        let store;
        let instantiationService;
        let taskService;
        let taskTerminalStatus;
        let testTerminal;
        let testTask;
        let problemCollector;
        let audioCueService;
        setup(() => {
            store = new lifecycle_1.DisposableStore();
            instantiationService = new instantiationServiceMock_1.TestInstantiationService();
            taskService = new TestTaskService();
            audioCueService = new TestAudioCueService();
            taskTerminalStatus = new taskTerminalStatus_1.TaskTerminalStatus(taskService, audioCueService);
            testTerminal = instantiationService.createInstance(TestTerminal);
            testTask = instantiationService.createInstance(TestTask);
            problemCollector = instantiationService.createInstance(TestProblemCollector);
            store.add(instantiationService);
            store.add(taskTerminalStatus);
        });
        teardown(() => {
            store.clear();
        });
        (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
        test('Should add failed status when there is an exit code on task end', async () => {
            taskTerminalStatus.addTerminal(testTask, testTerminal, problemCollector);
            taskService.triggerStateChange({ kind: "processStarted" /* TaskEventKind.ProcessStarted */ });
            assertStatus(testTerminal.statusList, taskTerminalStatus_1.ACTIVE_TASK_STATUS);
            taskService.triggerStateChange({ kind: "inactive" /* TaskEventKind.Inactive */ });
            assertStatus(testTerminal.statusList, taskTerminalStatus_1.SUCCEEDED_TASK_STATUS);
            taskService.triggerStateChange({ kind: "end" /* TaskEventKind.End */ });
            await poll(async () => Promise.resolve(), () => testTerminal?.statusList.primary?.id === taskTerminalStatus_1.FAILED_TASK_STATUS.id, 'terminal status should be updated');
        });
        test('Should add active status when a non-background task is run for a second time in the same terminal', () => {
            taskTerminalStatus.addTerminal(testTask, testTerminal, problemCollector);
            taskService.triggerStateChange({ kind: "processStarted" /* TaskEventKind.ProcessStarted */ });
            assertStatus(testTerminal.statusList, taskTerminalStatus_1.ACTIVE_TASK_STATUS);
            taskService.triggerStateChange({ kind: "inactive" /* TaskEventKind.Inactive */ });
            assertStatus(testTerminal.statusList, taskTerminalStatus_1.SUCCEEDED_TASK_STATUS);
            taskService.triggerStateChange({ kind: "processStarted" /* TaskEventKind.ProcessStarted */, runType: "singleRun" /* TaskRunType.SingleRun */ });
            assertStatus(testTerminal.statusList, taskTerminalStatus_1.ACTIVE_TASK_STATUS);
            taskService.triggerStateChange({ kind: "inactive" /* TaskEventKind.Inactive */ });
            assertStatus(testTerminal.statusList, taskTerminalStatus_1.SUCCEEDED_TASK_STATUS);
        });
        test('Should drop status when a background task exits', async () => {
            taskTerminalStatus.addTerminal(testTask, testTerminal, problemCollector);
            taskService.triggerStateChange({ kind: "processStarted" /* TaskEventKind.ProcessStarted */, runType: "background" /* TaskRunType.Background */ });
            assertStatus(testTerminal.statusList, taskTerminalStatus_1.ACTIVE_TASK_STATUS);
            taskService.triggerStateChange({ kind: "inactive" /* TaskEventKind.Inactive */ });
            assertStatus(testTerminal.statusList, taskTerminalStatus_1.SUCCEEDED_TASK_STATUS);
            taskService.triggerStateChange({ kind: "processEnded" /* TaskEventKind.ProcessEnded */, exitCode: 0 });
            await poll(async () => Promise.resolve(), () => testTerminal?.statusList.statuses?.includes(taskTerminalStatus_1.SUCCEEDED_TASK_STATUS) === false, 'terminal should have dropped status');
        });
        test('Should add succeeded status when a non-background task exits', () => {
            taskTerminalStatus.addTerminal(testTask, testTerminal, problemCollector);
            taskService.triggerStateChange({ kind: "processStarted" /* TaskEventKind.ProcessStarted */, runType: "singleRun" /* TaskRunType.SingleRun */ });
            assertStatus(testTerminal.statusList, taskTerminalStatus_1.ACTIVE_TASK_STATUS);
            taskService.triggerStateChange({ kind: "inactive" /* TaskEventKind.Inactive */ });
            assertStatus(testTerminal.statusList, taskTerminalStatus_1.SUCCEEDED_TASK_STATUS);
            taskService.triggerStateChange({ kind: "processEnded" /* TaskEventKind.ProcessEnded */, exitCode: 0 });
            assertStatus(testTerminal.statusList, taskTerminalStatus_1.SUCCEEDED_TASK_STATUS);
        });
    });
    function assertStatus(actual, expected) {
        (0, assert_1.ok)(actual.statuses.length === 1, '# of statuses');
        (0, assert_1.ok)(actual.primary?.id === expected.id, 'ID');
        (0, assert_1.ok)(actual.primary?.severity === expected.severity, 'Severity');
    }
    async function poll(fn, acceptFn, timeoutMessage, retryCount = 200, retryInterval = 10 // millis
    ) {
        let trial = 1;
        let lastError = '';
        while (true) {
            if (trial > retryCount) {
                throw new Error(`Timeout: ${timeoutMessage} after ${(retryCount * retryInterval) / 1000} seconds.\r${lastError}`);
            }
            let result;
            try {
                result = await fn();
                if (acceptFn(result)) {
                    return result;
                }
                else {
                    lastError = 'Did not pass accept function';
                }
            }
            catch (e) {
                lastError = Array.isArray(e.stack) ? e.stack.join('\n') : e.stack;
            }
            await new Promise(resolve => setTimeout(resolve, retryInterval));
            trial++;
        }
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGFza1Rlcm1pbmFsU3RhdHVzLnRlc3QuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi90YXNrcy90ZXN0L2Jyb3dzZXIvdGFza1Rlcm1pbmFsU3RhdHVzLnRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7SUFpQmhHLE1BQU0sZUFBZTtRQUFyQjtZQUNrQixzQkFBaUIsR0FBd0IsSUFBSSxlQUFPLEVBQUUsQ0FBQztRQU96RSxDQUFDO1FBTkEsSUFBVyxnQkFBZ0I7WUFDMUIsT0FBTyxJQUFJLENBQUMsaUJBQWlCLENBQUMsS0FBSyxDQUFDO1FBQ3JDLENBQUM7UUFDTSxrQkFBa0IsQ0FBQyxLQUEwQjtZQUNuRCxJQUFJLENBQUMsaUJBQWlCLENBQUMsSUFBSSxDQUFDLEtBQW1CLENBQUMsQ0FBQztRQUNsRCxDQUFDO0tBQ0Q7SUFFRCxNQUFNLG1CQUFtQjtRQUN4QixLQUFLLENBQUMsWUFBWSxDQUFDLEdBQWE7WUFDL0IsT0FBTztRQUNSLENBQUM7S0FDRDtJQUVELE1BQU0sWUFBWTtRQUFsQjtZQUNDLGVBQVUsR0FBdUIsSUFBSSx1Q0FBa0IsQ0FBQyxJQUFJLG1EQUF3QixFQUFFLENBQUMsQ0FBQztRQUN6RixDQUFDO0tBQUE7SUFFRCxNQUFNLFFBQVMsU0FBUSxrQkFBVTtRQUVoQztZQUNDLEtBQUssQ0FBQyxNQUFNLEVBQUUsU0FBUyxFQUFFLFNBQVMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsSUFBSSxFQUFFLEVBQUUsRUFBRSxLQUFLLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUN0RSxDQUFDO1FBRVMsV0FBVztZQUNwQixNQUFNLElBQUksS0FBSyxDQUFDLHlCQUF5QixDQUFDLENBQUM7UUFDNUMsQ0FBQztRQUNTLFVBQVUsQ0FBQyxNQUFXO1lBQy9CLE1BQU0sSUFBSSxLQUFLLENBQUMseUJB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