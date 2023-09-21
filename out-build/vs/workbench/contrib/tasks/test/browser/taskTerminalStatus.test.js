/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/test/common/utils", "vs/platform/configuration/test/common/testConfigurationService", "vs/platform/instantiation/test/common/instantiationServiceMock", "vs/workbench/contrib/tasks/browser/taskTerminalStatus", "vs/workbench/contrib/tasks/common/tasks", "vs/workbench/contrib/terminal/browser/terminalStatusList"], function (require, exports, assert_1, event_1, lifecycle_1, utils_1, testConfigurationService_1, instantiationServiceMock_1, taskTerminalStatus_1, tasks_1, terminalStatusList_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class TestTaskService {
        constructor() {
            this.a = new event_1.$fd();
        }
        get onDidStateChange() {
            return this.a.event;
        }
        triggerStateChange(event) {
            this.a.fire(event);
        }
    }
    class TestAudioCueService {
        async playAudioCue(cue) {
            return;
        }
    }
    class TestTerminal {
        constructor() {
            this.statusList = new terminalStatusList_1.$lfb(new testConfigurationService_1.$G0b());
        }
    }
    class TestTask extends tasks_1.$dG {
        constructor() {
            super('test', undefined, undefined, {}, {}, { kind: '', label: '' });
        }
        d() {
            throw new Error('Method not implemented.');
        }
        f(object) {
            throw new Error('Method not implemented.');
        }
    }
    class TestProblemCollector {
        constructor() {
            this.a = new event_1.$fd();
            this.onDidFindFirstMatch = this.a.event;
            this.b = new event_1.$fd();
            this.onDidFindErrors = this.b.event;
            this.c = new event_1.$fd();
            this.onDidRequestInvalidateLastMarker = this.c.event;
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
            store = new lifecycle_1.$jc();
            instantiationService = new instantiationServiceMock_1.$L0b();
            taskService = new TestTaskService();
            audioCueService = new TestAudioCueService();
            taskTerminalStatus = new taskTerminalStatus_1.$CXb(taskService, audioCueService);
            testTerminal = instantiationService.createInstance(TestTerminal);
            testTask = instantiationService.createInstance(TestTask);
            problemCollector = instantiationService.createInstance(TestProblemCollector);
            store.add(instantiationService);
            store.add(taskTerminalStatus);
        });
        teardown(() => {
            store.clear();
        });
        (0, utils_1.$bT)();
        test('Should add failed status when there is an exit code on task end', async () => {
            taskTerminalStatus.addTerminal(testTask, testTerminal, problemCollector);
            taskService.triggerStateChange({ kind: "processStarted" /* TaskEventKind.ProcessStarted */ });
            assertStatus(testTerminal.statusList, taskTerminalStatus_1.$zXb);
            taskService.triggerStateChange({ kind: "inactive" /* TaskEventKind.Inactive */ });
            assertStatus(testTerminal.statusList, taskTerminalStatus_1.$AXb);
            taskService.triggerStateChange({ kind: "end" /* TaskEventKind.End */ });
            await poll(async () => Promise.resolve(), () => testTerminal?.statusList.primary?.id === taskTerminalStatus_1.$BXb.id, 'terminal status should be updated');
        });
        test('Should add active status when a non-background task is run for a second time in the same terminal', () => {
            taskTerminalStatus.addTerminal(testTask, testTerminal, problemCollector);
            taskService.triggerStateChange({ kind: "processStarted" /* TaskEventKind.ProcessStarted */ });
            assertStatus(testTerminal.statusList, taskTerminalStatus_1.$zXb);
            taskService.triggerStateChange({ kind: "inactive" /* TaskEventKind.Inactive */ });
            assertStatus(testTerminal.statusList, taskTerminalStatus_1.$AXb);
            taskService.triggerStateChange({ kind: "processStarted" /* TaskEventKind.ProcessStarted */, runType: "singleRun" /* TaskRunType.SingleRun */ });
            assertStatus(testTerminal.statusList, taskTerminalStatus_1.$zXb);
            taskService.triggerStateChange({ kind: "inactive" /* TaskEventKind.Inactive */ });
            assertStatus(testTerminal.statusList, taskTerminalStatus_1.$AXb);
        });
        test('Should drop status when a background task exits', async () => {
            taskTerminalStatus.addTerminal(testTask, testTerminal, problemCollector);
            taskService.triggerStateChange({ kind: "processStarted" /* TaskEventKind.ProcessStarted */, runType: "background" /* TaskRunType.Background */ });
            assertStatus(testTerminal.statusList, taskTerminalStatus_1.$zXb);
            taskService.triggerStateChange({ kind: "inactive" /* TaskEventKind.Inactive */ });
            assertStatus(testTerminal.statusList, taskTerminalStatus_1.$AXb);
            taskService.triggerStateChange({ kind: "processEnded" /* TaskEventKind.ProcessEnded */, exitCode: 0 });
            await poll(async () => Promise.resolve(), () => testTerminal?.statusList.statuses?.includes(taskTerminalStatus_1.$AXb) === false, 'terminal should have dropped status');
        });
        test('Should add succeeded status when a non-background task exits', () => {
            taskTerminalStatus.addTerminal(testTask, testTerminal, problemCollector);
            taskService.triggerStateChange({ kind: "processStarted" /* TaskEventKind.ProcessStarted */, runType: "singleRun" /* TaskRunType.SingleRun */ });
            assertStatus(testTerminal.statusList, taskTerminalStatus_1.$zXb);
            taskService.triggerStateChange({ kind: "inactive" /* TaskEventKind.Inactive */ });
            assertStatus(testTerminal.statusList, taskTerminalStatus_1.$AXb);
            taskService.triggerStateChange({ kind: "processEnded" /* TaskEventKind.ProcessEnded */, exitCode: 0 });
            assertStatus(testTerminal.statusList, taskTerminalStatus_1.$AXb);
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
//# sourceMappingURL=taskTerminalStatus.test.js.map