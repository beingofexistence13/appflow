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
        class TestLiveTestResult extends testResult_1.$2sb {
            constructor(id, persist, request) {
                super(id, persist, request);
                ds.add(this);
            }
            setAllToStatePublic(state, taskId, when) {
                this.w(state, taskId, when);
            }
        }
        const ds = (0, utils_1.$bT)();
        setup(async () => {
            changed = new Set();
            r = ds.add(new TestLiveTestResult('foo', true, defaultOpts(['id-a'])));
            ds.add(r.onChange(e => changed.add(e)));
            r.addTask({ id: 't', name: undefined, running: true });
            tests = ds.add(testStubs_1.$$fc.nested());
            const cts = ds.add(new cancellation_1.$pd());
            const ok = await Promise.race([
                Promise.resolve(tests.expand(tests.root.id, Infinity)).then(() => true),
                (0, async_1.$Hg)(1000, cts.token).then(() => false),
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
                const c = (0, testingStates_1.$Wsb)();
                c[0 /* TestResultState.Unset */] = 4;
                assert.deepStrictEqual(r.counts, c);
            });
            test('setAllToState', () => {
                changed.clear();
                r.setAllToStatePublic(1 /* TestResultState.Queued */, 't', (_, t) => t.item.label !== 'root');
                const c = (0, testingStates_1.$Wsb)();
                c[0 /* TestResultState.Unset */] = 1;
                c[1 /* TestResultState.Queued */] = 3;
                assert.deepStrictEqual(r.counts, c);
                r.setAllToStatePublic(4 /* TestResultState.Failed */, 't', (_, t) => t.item.label !== 'root');
                const c2 = (0, testingStates_1.$Wsb)();
                c2[0 /* TestResultState.Unset */] = 1;
                c2[4 /* TestResultState.Failed */] = 3;
                assert.deepStrictEqual(r.counts, c2);
                assert.deepStrictEqual(r.getStateById(new testId_1.$PI(['ctrlId', 'id-a']).toString())?.ownComputedState, 4 /* TestResultState.Failed */);
                assert.deepStrictEqual(r.getStateById(new testId_1.$PI(['ctrlId', 'id-a']).toString())?.tasks[0].state, 4 /* TestResultState.Failed */);
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
                const testId = new testId_1.$PI(['ctrlId', 'id-a', 'id-aa']).toString();
                r.updateState(testId, 't', 2 /* TestResultState.Running */);
                const c = (0, testingStates_1.$Wsb)();
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
                r.updateState(new testId_1.$PI(['ctrlId', 'id-b']).toString(), 't', 2 /* TestResultState.Running */);
                const c = (0, testingStates_1.$Wsb)();
                c[0 /* TestResultState.Unset */] = 4;
                assert.deepStrictEqual(r.counts, c);
                assert.deepStrictEqual(r.getStateById(new testId_1.$PI(['ctrlId', 'id-b']).toString()), undefined);
            });
            test('markComplete', () => {
                r.setAllToStatePublic(1 /* TestResultState.Queued */, 't', () => true);
                r.updateState(new testId_1.$PI(['ctrlId', 'id-a', 'id-aa']).toString(), 't', 3 /* TestResultState.Passed */);
                changed.clear();
                r.markComplete();
                const c = (0, testingStates_1.$Wsb)();
                c[0 /* TestResultState.Unset */] = 3;
                c[3 /* TestResultState.Passed */] = 1;
                assert.deepStrictEqual(r.counts, c);
                assert.deepStrictEqual(r.getStateById(tests.root.id)?.ownComputedState, 0 /* TestResultState.Unset */);
                assert.deepStrictEqual(r.getStateById(new testId_1.$PI(['ctrlId', 'id-a', 'id-aa']).toString())?.ownComputedState, 3 /* TestResultState.Passed */);
            });
        });
        suite('service', () => {
            let storage;
            let results;
            class TestTestResultService extends testResultService_1.$gtb {
                constructor() {
                    super(...arguments);
                    this.u = { schedule: () => this.F() };
                }
            }
            setup(() => {
                storage = ds.add(new testResultStorage_1.$dtb(ds.add(new workbenchTestServices_1.$7dc()), new log_1.$fj()));
                results = ds.add(new TestTestResultService(new mockKeybindingService_1.$S0b(), storage, ds.add(new testProfileService_1.$_sb(new mockKeybindingService_1.$S0b(), ds.add(new workbenchTestServices_1.$7dc())))));
            });
            test('pushes new result', () => {
                results.push(r);
                assert.deepStrictEqual(results.results, [r]);
            });
            test('serializes and re-hydrates', async () => {
                results.push(r);
                r.updateState(new testId_1.$PI(['ctrlId', 'id-a', 'id-aa']).toString(), 't', 3 /* TestResultState.Passed */, 42);
                r.markComplete();
                await (0, async_1.$Hg)(10); // allow persistImmediately async to happen
                results = ds.add(new testResultService_1.$gtb(new mockKeybindingService_1.$S0b(), storage, ds.add(new testProfileService_1.$_sb(new mockKeybindingService_1.$S0b(), ds.add(new workbenchTestServices_1.$7dc())))));
                assert.strictEqual(0, results.results.length);
                await (0, async_1.$Hg)(10); // allow load promise to resolve
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
                const r2 = results.push(new testResult_1.$2sb('', false, defaultOpts([])));
                results.clear();
                assert.deepStrictEqual(results.results, [r2]);
            });
            test('keeps ongoing tests on top', async () => {
                results.push(r);
                const r2 = results.push(new testResult_1.$2sb('', false, defaultOpts([])));
                assert.deepStrictEqual(results.results, [r2, r]);
                r2.markComplete();
                assert.deepStrictEqual(results.results, [r, r2]);
                r.markComplete();
                assert.deepStrictEqual(results.results, [r, r2]);
            });
            const makeHydrated = async (completedAt = 42, state = 3 /* TestResultState.Passed */) => new testResult_1.$3sb({
                completedAt,
                id: 'some-id',
                tasks: [{ id: 't', name: undefined }],
                name: 'hello world',
                request: defaultOpts([]),
                items: [{
                        ...(await (0, testStubs_1.$0fc)()).getNodeById(new testId_1.$PI(['ctrlId', 'id-a']).toString()),
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
            assert.deepStrictEqual([...(0, testResult_1.$Zsb)(r, r.getStateById(new testId_1.$PI(['ctrlId', 'id-a', 'id-aa']).toString()))], [
                r.getStateById(new testId_1.$PI(['ctrlId', 'id-a', 'id-aa']).toString()),
                r.getStateById(new testId_1.$PI(['ctrlId', 'id-a']).toString()),
                r.getStateById(new testId_1.$PI(['ctrlId']).toString()),
            ]);
            assert.deepStrictEqual([...(0, testResult_1.$Zsb)(r, r.getStateById(tests.root.id))], [
                r.getStateById(tests.root.id),
            ]);
        });
        suite('output controller', () => {
            test('reads live output ranges', async () => {
                const ctrl = new testResult_1.$Ysb();
                ctrl.append(buffer_1.$Fd.fromString('12345'));
                ctrl.append(buffer_1.$Fd.fromString('67890'));
                ctrl.append(buffer_1.$Fd.fromString('12345'));
                ctrl.append(buffer_1.$Fd.fromString('67890'));
                assert.deepStrictEqual(ctrl.getRange(0, 5), buffer_1.$Fd.fromString('12345'));
                assert.deepStrictEqual(ctrl.getRange(5, 5), buffer_1.$Fd.fromString('67890'));
                assert.deepStrictEqual(ctrl.getRange(7, 6), buffer_1.$Fd.fromString('890123'));
                assert.deepStrictEqual(ctrl.getRange(15, 5), buffer_1.$Fd.fromString('67890'));
                assert.deepStrictEqual(ctrl.getRange(15, 10), buffer_1.$Fd.fromString('67890'));
            });
            test('corrects offsets for marked ranges', async () => {
                const ctrl = new testResult_1.$Ysb();
                const a1 = ctrl.append(buffer_1.$Fd.fromString('12345'), 1);
                const a2 = ctrl.append(buffer_1.$Fd.fromString('67890'), 1234);
                const a3 = ctrl.append(buffer_1.$Fd.fromString('with new line\r\n'), 4);
                assert.deepStrictEqual(ctrl.getRange(a1.offset, a1.length), buffer_1.$Fd.fromString('\x1b]633;SetMark;Id=s1;Hidden\x0712345\x1b]633;SetMark;Id=e1;Hidden\x07'));
                assert.deepStrictEqual(ctrl.getRange(a2.offset, a2.length), buffer_1.$Fd.fromString('\x1b]633;SetMark;Id=s1234;Hidden\x0767890\x1b]633;SetMark;Id=e1234;Hidden\x07'));
                assert.deepStrictEqual(ctrl.getRange(a3.offset, a3.length), buffer_1.$Fd.fromString('\x1b]633;SetMark;Id=s4;Hidden\x07with new line\x1b]633;SetMark;Id=e4;Hidden\x07\r\n'));
            });
        });
    });
});
//# sourceMappingURL=testResultService.test.js.map