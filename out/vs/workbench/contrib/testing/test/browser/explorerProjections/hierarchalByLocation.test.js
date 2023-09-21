/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/test/common/utils", "vs/workbench/contrib/testing/browser/explorerProjections/treeProjection", "vs/workbench/contrib/testing/common/testId", "vs/workbench/contrib/testing/test/browser/testObjectTree", "vs/workbench/contrib/testing/test/common/testStubs"], function (require, exports, assert, event_1, lifecycle_1, utils_1, treeProjection_1, testId_1, testObjectTree_1, testStubs_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class TestHierarchicalByLocationProjection extends treeProjection_1.TreeProjection {
    }
    suite('Workbench - Testing Explorer Hierarchal by Location Projection', () => {
        let harness;
        let onTestChanged;
        let resultsService;
        let ds;
        teardown(() => {
            ds.dispose();
        });
        (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
        setup(() => {
            ds = new lifecycle_1.DisposableStore();
            onTestChanged = ds.add(new event_1.Emitter());
            resultsService = {
                results: [],
                onResultsChanged: () => undefined,
                onTestChanged: onTestChanged.event,
                getStateById: () => ({ state: { state: 0 }, computedState: 0 }),
            };
            harness = ds.add(new testObjectTree_1.TestTreeTestHarness(l => new TestHierarchicalByLocationProjection({}, l, resultsService)));
        });
        test('renders initial tree', async () => {
            harness.flush();
            assert.deepStrictEqual(harness.tree.getRendered(), [
                { e: 'a' }, { e: 'b' }
            ]);
        });
        test('expands children', async () => {
            harness.flush();
            harness.tree.expand(harness.projection.getElementByTestId(new testId_1.TestId(['ctrlId', 'id-a']).toString()));
            assert.deepStrictEqual(harness.flush(), [
                { e: 'a', children: [{ e: 'aa' }, { e: 'ab' }] }, { e: 'b' }
            ]);
        });
        test('updates render if second test provider appears', async () => {
            harness.flush();
            harness.pushDiff({
                op: 0 /* TestDiffOpType.Add */,
                item: { controllerId: 'ctrl2', expand: 3 /* TestItemExpandState.Expanded */, item: new testStubs_1.TestTestItem(new testId_1.TestId(['ctrlId2']), 'c').toTestItem() },
            }, {
                op: 0 /* TestDiffOpType.Add */,
                item: { controllerId: 'ctrl2', expand: 0 /* TestItemExpandState.NotExpandable */, item: new testStubs_1.TestTestItem(new testId_1.TestId(['ctrlId2', 'id-c']), 'ca').toTestItem() },
            });
            assert.deepStrictEqual(harness.flush(), [
                { e: 'c', children: [{ e: 'ca' }] },
                { e: 'root', children: [{ e: 'a' }, { e: 'b' }] }
            ]);
        });
        test('updates nodes if they add children', async () => {
            harness.flush();
            harness.tree.expand(harness.projection.getElementByTestId(new testId_1.TestId(['ctrlId', 'id-a']).toString()));
            assert.deepStrictEqual(harness.flush(), [
                { e: 'a', children: [{ e: 'aa' }, { e: 'ab' }] },
                { e: 'b' }
            ]);
            harness.c.root.children.get('id-a').children.add(new testStubs_1.TestTestItem(new testId_1.TestId(['ctrlId', 'id-a', 'id-ac']), 'ac'));
            assert.deepStrictEqual(harness.flush(), [
                { e: 'a', children: [{ e: 'aa' }, { e: 'ab' }, { e: 'ac' }] },
                { e: 'b' }
            ]);
        });
        test('updates nodes if they remove children', async () => {
            harness.flush();
            harness.tree.expand(harness.projection.getElementByTestId(new testId_1.TestId(['ctrlId', 'id-a']).toString()));
            assert.deepStrictEqual(harness.flush(), [
                { e: 'a', children: [{ e: 'aa' }, { e: 'ab' }] },
                { e: 'b' }
            ]);
            harness.c.root.children.get('id-a').children.delete('id-ab');
            assert.deepStrictEqual(harness.flush(), [
                { e: 'a', children: [{ e: 'aa' }] },
                { e: 'b' }
            ]);
        });
        test('applies state changes', async () => {
            harness.flush();
            const resultInState = (state) => ({
                item: {
                    extId: new testId_1.TestId(['ctrlId', 'id-a']).toString(),
                    busy: false,
                    description: null,
                    error: null,
                    label: 'a',
                    range: null,
                    sortText: null,
                    tags: [],
                    uri: undefined,
                },
                tasks: [],
                ownComputedState: state,
                computedState: state,
                expand: 0,
                controllerId: 'ctrl',
            });
            // Applies the change:
            resultsService.getStateById = () => [undefined, resultInState(1 /* TestResultState.Queued */)];
            onTestChanged.fire({
                reason: 1 /* TestResultItemChangeReason.OwnStateChange */,
                result: null,
                previousState: 0 /* TestResultState.Unset */,
                item: resultInState(1 /* TestResultState.Queued */),
                previousOwnDuration: undefined,
            });
            harness.projection.applyTo(harness.tree);
            assert.deepStrictEqual(harness.tree.getRendered('state'), [
                { e: 'a', data: String(1 /* TestResultState.Queued */) },
                { e: 'b', data: String(0 /* TestResultState.Unset */) }
            ]);
            // Falls back if moved into unset state:
            resultsService.getStateById = () => [undefined, resultInState(4 /* TestResultState.Failed */)];
            onTestChanged.fire({
                reason: 1 /* TestResultItemChangeReason.OwnStateChange */,
                result: null,
                previousState: 1 /* TestResultState.Queued */,
                item: resultInState(0 /* TestResultState.Unset */),
                previousOwnDuration: undefined,
            });
            harness.projection.applyTo(harness.tree);
            assert.deepStrictEqual(harness.tree.getRendered('state'), [
                { e: 'a', data: String(4 /* TestResultState.Failed */) },
                { e: 'b', data: String(0 /* TestResultState.Unset */) }
            ]);
        });
        test('applies test changes (resort)', async () => {
            harness.flush();
            harness.tree.expand(harness.projection.getElementByTestId(new testId_1.TestId(['ctrlId', 'id-a']).toString()));
            assert.deepStrictEqual(harness.flush(), [
                { e: 'a', children: [{ e: 'aa' }, { e: 'ab' }] }, { e: 'b' }
            ]);
            // sortText causes order to change
            harness.pushDiff({
                op: 1 /* TestDiffOpType.Update */,
                item: { extId: new testId_1.TestId(['ctrlId', 'id-a', 'id-aa']).toString(), item: { sortText: "z" } }
            }, {
                op: 1 /* TestDiffOpType.Update */,
                item: { extId: new testId_1.TestId(['ctrlId', 'id-a', 'id-ab']).toString(), item: { sortText: "a" } }
            });
            assert.deepStrictEqual(harness.flush(), [
                { e: 'a', children: [{ e: 'ab' }, { e: 'aa' }] }, { e: 'b' }
            ]);
            // label causes order to change
            harness.pushDiff({
                op: 1 /* TestDiffOpType.Update */,
                item: { extId: new testId_1.TestId(['ctrlId', 'id-a', 'id-aa']).toString(), item: { sortText: undefined, label: "z" } }
            }, {
                op: 1 /* TestDiffOpType.Update */,
                item: { extId: new testId_1.TestId(['ctrlId', 'id-a', 'id-ab']).toString(), item: { sortText: undefined, label: "a" } }
            });
            assert.deepStrictEqual(harness.flush(), [
                { e: 'a', children: [{ e: 'a' }, { e: 'z' }] }, { e: 'b' }
            ]);
            harness.pushDiff({
                op: 1 /* TestDiffOpType.Update */,
                item: { extId: new testId_1.TestId(['ctrlId', 'id-a', 'id-aa']).toString(), item: { label: "a2" } }
            }, {
                op: 1 /* TestDiffOpType.Update */,
                item: { extId: new testId_1.TestId(['ctrlId', 'id-a', 'id-ab']).toString(), item: { label: "z2" } }
            });
            assert.deepStrictEqual(harness.flush(), [
                { e: 'a', children: [{ e: 'a2' }, { e: 'z2' }] }, { e: 'b' }
            ]);
        });
        test('applies test changes (error)', async () => {
            harness.flush();
            assert.deepStrictEqual(harness.flush(), [
                { e: 'a' }, { e: 'b' }
            ]);
            // sortText causes order to change
            harness.pushDiff({
                op: 1 /* TestDiffOpType.Update */,
                item: { extId: new testId_1.TestId(['ctrlId', 'id-a']).toString(), item: { error: "bad" } }
            });
            assert.deepStrictEqual(harness.flush(), [
                { e: 'a' }, { e: 'b' }
            ]);
            harness.tree.expand(harness.projection.getElementByTestId(new testId_1.TestId(['ctrlId', 'id-a']).toString()));
            assert.deepStrictEqual(harness.flush(), [
                { e: 'a', children: [{ e: 'bad' }, { e: 'aa' }, { e: 'ab' }] }, { e: 'b' }
            ]);
            harness.pushDiff({
                op: 1 /* TestDiffOpType.Update */,
                item: { extId: new testId_1.TestId(['ctrlId', 'id-a']).toString(), item: { error: "badder" } }
            });
            assert.deepStrictEqual(harness.flush(), [
                { e: 'a', children: [{ e: 'badder' }, { e: 'aa' }, { e: 'ab' }] }, { e: 'b' }
            ]);
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaGllcmFyY2hhbEJ5TG9jYXRpb24udGVzdC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL3Rlc3RpbmcvdGVzdC9icm93c2VyL2V4cGxvcmVyUHJvamVjdGlvbnMvaGllcmFyY2hhbEJ5TG9jYXRpb24udGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7OztJQWFoRyxNQUFNLG9DQUFxQyxTQUFRLCtCQUFjO0tBQ2hFO0lBRUQsS0FBSyxDQUFDLGdFQUFnRSxFQUFFLEdBQUcsRUFBRTtRQUM1RSxJQUFJLE9BQWtFLENBQUM7UUFDdkUsSUFBSSxhQUE0QyxDQUFDO1FBQ2pELElBQUksY0FBbUIsQ0FBQztRQUN4QixJQUFJLEVBQW1CLENBQUM7UUFFeEIsUUFBUSxDQUFDLEdBQUcsRUFBRTtZQUNiLEVBQUUsQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUNkLENBQUMsQ0FBQyxDQUFDO1FBRUgsSUFBQSwrQ0FBdUMsR0FBRSxDQUFDO1FBRTFDLEtBQUssQ0FBQyxHQUFHLEVBQUU7WUFDVixFQUFFLEdBQUcsSUFBSSwyQkFBZSxFQUFFLENBQUM7WUFDM0IsYUFBYSxHQUFHLEVBQUUsQ0FBQyxHQUFHLENBQUMsSUFBSSxlQUFPLEVBQUUsQ0FBQyxDQUFDO1lBQ3RDLGNBQWMsR0FBRztnQkFDaEIsT0FBTyxFQUFFLEVBQUU7Z0JBQ1gsZ0JBQWdCLEVBQUUsR0FBRyxFQUFFLENBQUMsU0FBUztnQkFDakMsYUFBYSxFQUFFLGFBQWEsQ0FBQyxLQUFLO2dCQUNsQyxZQUFZLEVBQUUsR0FBRyxFQUFFLENBQUMsQ0FBQyxFQUFFLEtBQUssRUFBRSxFQUFFLEtBQUssRUFBRSxDQUFDLEVBQUUsRUFBRSxhQUFhLEVBQUUsQ0FBQyxFQUFFLENBQUM7YUFDL0QsQ0FBQztZQUVGLE9BQU8sR0FBRyxFQUFFLENBQUMsR0FBRyxDQUFDLElBQUksb0NBQW1C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