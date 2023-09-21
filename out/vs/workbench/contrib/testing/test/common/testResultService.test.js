/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/async", "vs/base/common/buffer", "vs/base/common/cancellation", "vs/base/test/common/utils", "vs/platform/keybinding/test/common/mockKeybindingService", "vs/platform/log/common/log", "vs/workbench/contrib/testing/common/testId", "vs/workbench/contrib/testing/common/testProfileService", "vs/workbench/contrib/testing/common/testResult", "vs/workbench/contrib/testing/common/testResultService", "vs/workbench/contrib/testing/common/testResultStorage", "vs/workbench/contrib/testing/common/testingStates", "vs/workbench/contrib/testing/test/common/testStubs", "vs/workbench/test/common/workbenchTestServices"], function (require, exports, assert, async_1, buffer_1, cancellation_1, utils_1, mockKeybindingService_1, log_1, testId_1, testProfileService_1, testResult_1, testResultService_1, testResultStorage_1, testingStates_1, testStubs_1, workbenchTestServices_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('Workbench - Test Results Service', () => {
        const getLabelsIn = (it) => [...it].map(t => t.item.label).sort();
        const getChangeSummary = () => [...changed]
            .map(c => ({ reason: c.reason, label: c.item.item.label }));
        let r;
        let changed = new Set();
        let tests;
        const defaultOpts = (testIds) => ({
            targets: [{
                    profileGroup: 2 /* TestRunProfileBitset.Run */,
                    profileId: 0,
                    controllerId: 'ctrlId',
                    testIds,
                }]
        });
        class TestLiveTestResult extends testResult_1.LiveTestResult {
            constructor(id, persist, request) {
                super(id, persist, request);
                ds.add(this);
            }
            setAllToStatePublic(state, taskId, when) {
                this.setAllToState(state, taskId, when);
            }
        }
        const ds = (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
        setup(async () => {
            changed = new Set();
            r = ds.add(new TestLiveTestResult('foo', true, defaultOpts(['id-a'])));
            ds.add(r.onChange(e => changed.add(e)));
            r.addTask({ id: 't', name: undefined, running: true });
            tests = ds.add(testStubs_1.testStubs.nested());
            const cts = ds.add(new cancellation_1.CancellationTokenSource());
            const ok = await Promise.race([
                Promise.resolve(tests.expand(tests.root.id, Infinity)).then(() => true),
                (0, async_1.timeout)(1000, cts.token).then(() => false),
            ]);
            cts.cancel();
            // todo@connor4312: debug for tests #137853:
            if (!ok) {
                throw new Error('timed out while expanding, diff: ' + JSON.stringify(tests.collectDiff()));
            }
            r.addTestChainToRun('ctrlId', [
                tests.root.toTestItem(),
                tests.root.children.get('id-a').toTestItem(),
                tests.root.children.get('id-a').children.get('id-aa').toTestItem(),
            ]);
            r.addTestChainToRun('ctrlId', [
                tests.root.children.get('id-a').toTestItem(),
                tests.root.children.get('id-a').children.get('id-ab').toTestItem(),
            ]);
        });
        // ensureNoDisposablesAreLeakedInTestSuite(); todo@connor4312
        suite('LiveTestResult', () => {
            test('is empty if no tests are yet present', async () => {
                assert.deepStrictEqual(getLabelsIn(new TestLiveTestResult('foo', false, defaultOpts(['id-a'])).tests), []);
            });
            test('initially queues nothing', () => {
                assert.deepStrictEqual(getChangeSummary(), []);
            });
            test('initializes with the subtree of requested tests', () => {
                assert.deepStrictEqual(getLabelsIn(r.tests), ['a', 'aa', 'ab', 'root']);
            });
            test('initializes with valid counts', () => {
                const c = (0, testingStates_1.makeEmptyCounts)();
                c[0 /* TestResultState.Unset */] = 4;
                assert.deepStrictEqual(r.counts, c);
            });
            test('setAllToState', () => {
                changed.clear();
                r.setAllToStatePublic(1 /* TestResultState.Queued */, 't', (_, t) => t.item.label !== 'root');
                const c = (0, testingStates_1.makeEmptyCounts)();
                c[0 /* TestResultState.Unset */] = 1;
                c[1 /* TestResultState.Queued */] = 3;
                assert.deepStrictEqual(r.counts, c);
                r.setAllToStatePublic(4 /* TestResultState.Failed */, 't', (_, t) => t.item.label !== 'root');
                const c2 = (0, testingStates_1.makeEmptyCounts)();
                c2[0 /* TestResultState.Unset */] = 1;
                c2[4 /* TestResultState.Failed */] = 3;
                assert.deepStrictEqual(r.counts, c2);
                assert.deepStrictEqual(r.getStateById(new testId_1.TestId(['ctrlId', 'id-a']).toString())?.ownComputedState, 4 /* TestResultState.Failed */);
                assert.deepStrictEqual(r.getStateById(new testId_1.TestId(['ctrlId', 'id-a']).toString())?.tasks[0].state, 4 /* TestResultState.Failed */);
                assert.deepStrictEqual(getChangeSummary(), [
                    { label: 'a', reason: 1 /* TestResultItemChangeReason.OwnStateChange */ },
                    { label: 'root', reason: 0 /* TestResultItemChangeReason.ComputedStateChange */ },
                    { label: 'aa', reason: 1 /* TestResultItemChangeReason.OwnStateChange */ },
                    { label: 'ab', reason: 1 /* TestResultItemChangeReason.OwnStateChange */ },
                    { label: 'a', reason: 1 /* TestResultItemChangeReason.OwnStateChange */ },
                    { label: 'root', reason: 0 /* TestResultItemChangeReason.ComputedStateChange */ },
                    { label: 'aa', reason: 1 /* TestResultItemChangeReason.OwnStateChange */ },
                    { label: 'ab', reason: 1 /* TestResultItemChangeReason.OwnStateChange */ },
                ]);
            });
            test('updateState', () => {
                changed.clear();
                const testId = new testId_1.TestId(['ctrlId', 'id-a', 'id-aa']).toString();
                r.updateState(testId, 't', 2 /* TestResultState.Running */);
                const c = (0, testingStates_1.makeEmptyCounts)();
                c[2 /* TestResultState.Running */] = 1;
                c[0 /* TestResultState.Unset */] = 3;
                assert.deepStrictEqual(r.counts, c);
                assert.deepStrictEqual(r.getStateById(testId)?.ownComputedState, 2 /* TestResultState.Running */);
                // update computed state:
                assert.deepStrictEqual(r.getStateById(tests.root.id)?.computedState, 2 /* TestResultState.Running */);
                assert.deepStrictEqual(getChangeSummary(), [
                    { label: 'aa', reason: 1 /* TestResultItemChangeReason.OwnStateChange */ },
                    { label: 'a', reason: 0 /* TestResultItemChangeReason.ComputedStateChange */ },
                    { label: 'root', reason: 0 /* TestResultItemChangeReason.ComputedStateChange */ },
                ]);
                r.updateState(testId, 't', 3 /* TestResultState.Passed */);
                assert.deepStrictEqual(r.getStateById(testId)?.ownComputedState, 3 /* TestResultState.Passed */);
                r.updateState(testId, 't', 6 /* TestResultState.Errored */);
                assert.deepStrictEqual(r.getStateById(testId)?.ownComputedState, 6 /* TestResultState.Errored */);
                r.updateState(testId, 't', 3 /* TestResultState.Passed */);
                assert.deepStrictEqual(r.getStateById(testId)?.ownComputedState, 6 /* TestResultState.Errored */);
            });
            test('ignores outside run', () => {
                changed.clear();
                r.updateState(new testId_1.TestId(['ctrlId', 'id-b']).toString(), 't', 2 /* TestResultState.Running */);
                const c = (0, testingStates_1.makeEmptyCounts)();
                c[0 /* TestResultState.Unset */] = 4;
                assert.deepStrictEqual(r.counts, c);
                assert.deepStrictEqual(r.getStateById(new testId_1.TestId(['ctrlId', 'id-b']).toString()), undefined);
            });
            test('markComplete', () => {
                r.setAllToStatePublic(1 /* TestResultState.Queued */, 't', () => true);
                r.updateState(new testId_1.TestId(['ctrlId', 'id-a', 'id-aa']).toString(), 't', 3 /* TestResultState.Passed */);
                changed.clear();
                r.markComplete();
                const c = (0, testingStates_1.makeEmptyCounts)();
                c[0 /* TestResultState.Unset */] = 3;
                c[3 /* TestResultState.Passed */] = 1;
                assert.deepStrictEqual(r.counts, c);
                assert.deepStrictEqual(r.getStateById(tests.root.id)?.ownComputedState, 0 /* TestResultState.Unset */);
                assert.deepStrictEqual(r.getStateById(new testId_1.TestId(['ctrlId', 'id-a', 'id-aa']).toString())?.ownComputedState, 3 /* TestResultState.Passed */);
            });
        });
        suite('service', () => {
            let storage;
            let results;
            class TestTestResultService extends testResultService_1.TestResultService {
                constructor() {
                    super(...arguments);
                    this.persistScheduler = { schedule: () => this.persistImmediately() };
                }
            }
            setup(() => {
                storage = ds.add(new testResultStorage_1.InMemoryResultStorage(ds.add(new workbenchTestServices_1.TestStorageService()), new log_1.NullLogService()));
                results = ds.add(new TestTestResultService(new mockKeybindingService_1.MockContextKeyService(), storage, ds.add(new testProfileService_1.TestProfileService(new mockKeybindingService_1.MockContextKeyService(), ds.add(new workbenchTestServices_1.TestStorageService())))));
            });
            test('pushes new result', () => {
                results.push(r);
                assert.deepStrictEqual(results.results, [r]);
            });
            test('serializes and re-hydrates', async () => {
                results.push(r);
                r.updateState(new testId_1.TestId(['ctrlId', 'id-a', 'id-aa']).toString(), 't', 3 /* TestResultState.Passed */, 42);
                r.markComplete();
                await (0, async_1.timeout)(10); // allow persistImmediately async to happen
                results = ds.add(new testResultService_1.TestResultService(new mockKeybindingService_1.MockContextKeyService(), storage, ds.add(new testProfileService_1.TestProfileService(new mockKeybindingService_1.MockContextKeyService(), ds.add(new workbenchTestServices_1.TestStorageService())))));
                assert.strictEqual(0, results.results.length);
                await (0, async_1.timeout)(10); // allow load promise to resolve
                assert.strictEqual(1, results.results.length);
                const [rehydrated, actual] = results.getStateById(tests.root.id);
                const expected = { ...r.getStateById(tests.root.id) };
                expected.item.uri = actual.item.uri;
                expected.item.children = undefined;
                expected.retired = true;
                delete expected.children;
                assert.deepStrictEqual(actual, { ...expected });
                assert.deepStrictEqual(rehydrated.counts, r.counts);
                assert.strictEqual(typeof rehydrated.completedAt, 'number');
            });
            test('clears results but keeps ongoing tests', async () => {
                results.push(r);
                r.markComplete();
                const r2 = results.push(new testResult_1.LiveTestResult('', false, defaultOpts([])));
                results.clear();
                assert.deepStrictEqual(results.results, [r2]);
            });
            test('keeps ongoing tests on top', async () => {
                results.push(r);
                const r2 = results.push(new testResult_1.LiveTestResult('', false, defaultOpts([])));
                assert.deepStrictEqual(results.results, [r2, r]);
                r2.markComplete();
                assert.deepStrictEqual(results.results, [r, r2]);
                r.markComplete();
                assert.deepStrictEqual(results.results, [r, r2]);
            });
            const makeHydrated = async (completedAt = 42, state = 3 /* TestResultState.Passed */) => new testResult_1.HydratedTestResult({
                completedAt,
                id: 'some-id',
                tasks: [{ id: 't', name: undefined }],
                name: 'hello world',
                request: defaultOpts([]),
                items: [{
                        ...(await (0, testStubs_1.getInitializedMainTestCollection)()).getNodeById(new testId_1.TestId(['ctrlId', 'id-a']).toString()),
                        tasks: [{ state, duration: 0, messages: [] }],
                        computedState: state,
                        ownComputedState: state,
                    }]
            });
            test('pushes hydrated results', async () => {
                results.push(r);
                const hydrated = await makeHydrated();
                results.push(hydrated);
                assert.deepStrictEqual(results.results, [r, hydrated]);
            });
            test('inserts in correct order', async () => {
                results.push(r);
                const hydrated1 = await makeHydrated();
                results.push(hydrated1);
                assert.deepStrictEqual(results.results, [r, hydrated1]);
            });
            test('inserts in correct order 2', async () => {
                results.push(r);
                const hydrated1 = await makeHydrated();
                results.push(hydrated1);
                const hydrated2 = await makeHydrated(30);
                results.push(hydrated2);
                assert.deepStrictEqual(results.results, [r, hydrated1, hydrated2]);
            });
        });
        test('resultItemParents', function () {
            assert.deepStrictEqual([...(0, testResult_1.resultItemParents)(r, r.getStateById(new testId_1.TestId(['ctrlId', 'id-a', 'id-aa']).toString()))], [
                r.getStateById(new testId_1.TestId(['ctrlId', 'id-a', 'id-aa']).toString()),
                r.getStateById(new testId_1.TestId(['ctrlId', 'id-a']).toString()),
                r.getStateById(new testId_1.TestId(['ctrlId']).toString()),
            ]);
            assert.deepStrictEqual([...(0, testResult_1.resultItemParents)(r, r.getStateById(tests.root.id))], [
                r.getStateById(tests.root.id),
            ]);
        });
        suite('output controller', () => {
            test('reads live output ranges', async () => {
                const ctrl = new testResult_1.TaskRawOutput();
                ctrl.append(buffer_1.VSBuffer.fromString('12345'));
                ctrl.append(buffer_1.VSBuffer.fromString('67890'));
                ctrl.append(buffer_1.VSBuffer.fromString('12345'));
                ctrl.append(buffer_1.VSBuffer.fromString('67890'));
                assert.deepStrictEqual(ctrl.getRange(0, 5), buffer_1.VSBuffer.fromString('12345'));
                assert.deepStrictEqual(ctrl.getRange(5, 5), buffer_1.VSBuffer.fromString('67890'));
                assert.deepStrictEqual(ctrl.getRange(7, 6), buffer_1.VSBuffer.fromString('890123'));
                assert.deepStrictEqual(ctrl.getRange(15, 5), buffer_1.VSBuffer.fromString('67890'));
                assert.deepStrictEqual(ctrl.getRange(15, 10), buffer_1.VSBuffer.fromString('67890'));
            });
            test('corrects offsets for marked ranges', async () => {
                const ctrl = new testResult_1.TaskRawOutput();
                const a1 = ctrl.append(buffer_1.VSBuffer.fromString('12345'), 1);
                const a2 = ctrl.append(buffer_1.VSBuffer.fromString('67890'), 1234);
                const a3 = ctrl.append(buffer_1.VSBuffer.fromString('with new line\r\n'), 4);
                assert.deepStrictEqual(ctrl.getRange(a1.offset, a1.length), buffer_1.VSBuffer.fromString('\x1b]633;SetMark;Id=s1;Hidden\x0712345\x1b]633;SetMark;Id=e1;Hidden\x07'));
                assert.deepStrictEqual(ctrl.getRange(a2.offset, a2.length), buffer_1.VSBuffer.fromString('\x1b]633;SetMark;Id=s1234;Hidden\x0767890\x1b]633;SetMark;Id=e1234;Hidden\x07'));
                assert.deepStrictEqual(ctrl.getRange(a3.offset, a3.length), buffer_1.VSBuffer.fromString('\x1b]633;SetMark;Id=s4;Hidden\x07with new line\x1b]633;SetMark;Id=e4;Hidden\x07\r\n'));
            });
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdFJlc3VsdFNlcnZpY2UudGVzdC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL3Rlc3RpbmcvdGVzdC9jb21tb24vdGVzdFJlc3VsdFNlcnZpY2UudGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7OztJQW1CaEcsS0FBSyxDQUFDLGtDQUFrQyxFQUFFLEdBQUcsRUFBRTtRQUM5QyxNQUFNLFdBQVcsR0FBRyxDQUFDLEVBQTRCLEVBQUUsRUFBRSxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDO1FBQzVGLE1BQU0sZ0JBQWdCLEdBQUcsR0FBRyxFQUFFLENBQUMsQ0FBQyxHQUFHLE9BQU8sQ0FBQzthQUN6QyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsTUFBTSxFQUFFLENBQUMsQ0FBQyxNQUFNLEVBQUUsS0FBSyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsQ0FBQztRQUU3RCxJQUFJLENBQXFCLENBQUM7UUFDMUIsSUFBSSxPQUFPLEdBQUcsSUFBSSxHQUFHLEVBQXdCLENBQUM7UUFDOUMsSUFBSSxLQUF5QixDQUFDO1FBRTlCLE1BQU0sV0FBVyxHQUFHLENBQUMsT0FBaUIsRUFBMEIsRUFBRSxDQUFDLENBQUM7WUFDbkUsT0FBTyxFQUFFLENBQUM7b0JBQ1QsWUFBWSxrQ0FBMEI7b0JBQ3RDLFNBQVMsRUFBRSxDQUFDO29CQUNaLFlBQVksRUFBRSxRQUFRO29CQUN0QixPQUFPO2lCQUNQLENBQUM7U0FDRixDQUFDLENBQUM7UUFFSCxNQUFNLGtCQUFtQixTQUFRLDJCQUFjO1lBQzlDLFlB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YSxFQUFFLENBQUM7Z0JBRWpDLElBQUksQ0FBQyxNQUFNLENBQUMsaUJBQVEsQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztnQkFDMUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxpQkFBUSxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO2dCQUMxQyxJQUFJLENBQUMsTUFBTSxDQUFDLGlCQUFRLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7Z0JBQzFDLElBQUksQ0FBQyxNQUFNLENBQUMsaUJBQVEsQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztnQkFFMUMsTUFBTSxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxpQkFBUSxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO2dCQUMxRSxNQUFNLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLGlCQUFRLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7Z0JBQzFFLE1BQU0sQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsaUJBQVEsQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztnQkFDM0UsTUFBTSxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsRUFBRSxpQkFBUSxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO2dCQUMzRSxNQUFNLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLGlCQUFRLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7WUFDN0UsQ0FBQyxDQUFDLENBQUM7WUFFSCxJQUFJLENBQUMsb0NBQW9DLEVBQUUsS0FBSyxJQUFJLEVBQUU7Z0JBQ3JELE1BQU0sSUFBSSxHQUFHLElBQUksMEJBQWEsRUFBRSxDQUFDO2dCQUVqQyxNQUFNLEVBQUUsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLGlCQUFRLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO2dCQUN4RCxNQUFNLEVBQUUsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLGlCQUFRLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDO2dCQUMzRCxNQUFNLEVBQUUsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLGlCQUFRLENBQUMsVUFBVSxDQUFDLG1CQUFtQixDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7Z0JBRXBFLE1BQU0sQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsTUFBTSxFQUFFLEVBQUUsQ0FBQyxNQUFNLENBQUMsRUFBRSxpQkFBUSxDQUFDLFVBQVUsQ0FBQyx5RUFBeUUsQ0FBQyxDQUFDLENBQUM7Z0JBQzVKLE1BQU0sQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsTUFBTSxFQUFFLEVBQUUsQ0FBQyxNQUFNLENBQUMsRUFBRSxpQkFBUSxDQUFDLFVBQVUsQ0FBQywrRUFBK0UsQ0FBQyxDQUFDLENBQUM7Z0JBQ2xLLE1BQU0sQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsTUFBTSxFQUFFLEVBQUUsQ0FBQyxNQUFNLENBQUMsRUFBRSxpQkFBUSxDQUFDLFVBQVUsQ0FBQyxxRkFBcUYsQ0FBQyxDQUFDLENBQUM7WUFDekssQ0FBQyxDQUFDLENBQUM7UUFDSixDQUFDLENBQUMsQ0FBQztJQUNKLENBQUMsQ0FBQyxDQUFDIn0=