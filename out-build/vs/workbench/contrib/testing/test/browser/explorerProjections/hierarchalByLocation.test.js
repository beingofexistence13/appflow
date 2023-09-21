/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/test/common/utils", "vs/workbench/contrib/testing/browser/explorerProjections/treeProjection", "vs/workbench/contrib/testing/common/testId", "vs/workbench/contrib/testing/test/browser/testObjectTree", "vs/workbench/contrib/testing/test/common/testStubs"], function (require, exports, assert, event_1, lifecycle_1, utils_1, treeProjection_1, testId_1, testObjectTree_1, testStubs_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class TestHierarchicalByLocationProjection extends treeProjection_1.$yKb {
    }
    suite('Workbench - Testing Explorer Hierarchal by Location Projection', () => {
        let harness;
        let onTestChanged;
        let resultsService;
        let ds;
        teardown(() => {
            ds.dispose();
        });
        (0, utils_1.$bT)();
        setup(() => {
            ds = new lifecycle_1.$jc();
            onTestChanged = ds.add(new event_1.$fd());
            resultsService = {
                results: [],
                onResultsChanged: () => undefined,
                onTestChanged: onTestChanged.event,
                getStateById: () => ({ state: { state: 0 }, computedState: 0 }),
            };
            harness = ds.add(new testObjectTree_1.$_fc(l => new TestHierarchicalByLocationProjection({}, l, resultsService)));
        });
        test('renders initial tree', async () => {
            harness.flush();
            assert.deepStrictEqual(harness.tree.getRendered(), [
                { e: 'a' }, { e: 'b' }
            ]);
        });
        test('expands children', async () => {
            harness.flush();
            harness.tree.expand(harness.projection.getElementByTestId(new testId_1.$PI(['ctrlId', 'id-a']).toString()));
            assert.deepStrictEqual(harness.flush(), [
                { e: 'a', children: [{ e: 'aa' }, { e: 'ab' }] }, { e: 'b' }
            ]);
        });
        test('updates render if second test provider appears', async () => {
            harness.flush();
            harness.pushDiff({
                op: 0 /* TestDiffOpType.Add */,
                item: { controllerId: 'ctrl2', expand: 3 /* TestItemExpandState.Expanded */, item: new testStubs_1.$8fc(new testId_1.$PI(['ctrlId2']), 'c').toTestItem() },
            }, {
                op: 0 /* TestDiffOpType.Add */,
                item: { controllerId: 'ctrl2', expand: 0 /* TestItemExpandState.NotExpandable */, item: new testStubs_1.$8fc(new testId_1.$PI(['ctrlId2', 'id-c']), 'ca').toTestItem() },
            });
            assert.deepStrictEqual(harness.flush(), [
                { e: 'c', children: [{ e: 'ca' }] },
                { e: 'root', children: [{ e: 'a' }, { e: 'b' }] }
            ]);
        });
        test('updates nodes if they add children', async () => {
            harness.flush();
            harness.tree.expand(harness.projection.getElementByTestId(new testId_1.$PI(['ctrlId', 'id-a']).toString()));
            assert.deepStrictEqual(harness.flush(), [
                { e: 'a', children: [{ e: 'aa' }, { e: 'ab' }] },
                { e: 'b' }
            ]);
            harness.c.root.children.get('id-a').children.add(new testStubs_1.$8fc(new testId_1.$PI(['ctrlId', 'id-a', 'id-ac']), 'ac'));
            assert.deepStrictEqual(harness.flush(), [
                { e: 'a', children: [{ e: 'aa' }, { e: 'ab' }, { e: 'ac' }] },
                { e: 'b' }
            ]);
        });
        test('updates nodes if they remove children', async () => {
            harness.flush();
            harness.tree.expand(harness.projection.getElementByTestId(new testId_1.$PI(['ctrlId', 'id-a']).toString()));
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
                    extId: new testId_1.$PI(['ctrlId', 'id-a']).toString(),
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
            harness.tree.expand(harness.projection.getElementByTestId(new testId_1.$PI(['ctrlId', 'id-a']).toString()));
            assert.deepStrictEqual(harness.flush(), [
                { e: 'a', children: [{ e: 'aa' }, { e: 'ab' }] }, { e: 'b' }
            ]);
            // sortText causes order to change
            harness.pushDiff({
                op: 1 /* TestDiffOpType.Update */,
                item: { extId: new testId_1.$PI(['ctrlId', 'id-a', 'id-aa']).toString(), item: { sortText: "z" } }
            }, {
                op: 1 /* TestDiffOpType.Update */,
                item: { extId: new testId_1.$PI(['ctrlId', 'id-a', 'id-ab']).toString(), item: { sortText: "a" } }
            });
            assert.deepStrictEqual(harness.flush(), [
                { e: 'a', children: [{ e: 'ab' }, { e: 'aa' }] }, { e: 'b' }
            ]);
            // label causes order to change
            harness.pushDiff({
                op: 1 /* TestDiffOpType.Update */,
                item: { extId: new testId_1.$PI(['ctrlId', 'id-a', 'id-aa']).toString(), item: { sortText: undefined, label: "z" } }
            }, {
                op: 1 /* TestDiffOpType.Update */,
                item: { extId: new testId_1.$PI(['ctrlId', 'id-a', 'id-ab']).toString(), item: { sortText: undefined, label: "a" } }
            });
            assert.deepStrictEqual(harness.flush(), [
                { e: 'a', children: [{ e: 'a' }, { e: 'z' }] }, { e: 'b' }
            ]);
            harness.pushDiff({
                op: 1 /* TestDiffOpType.Update */,
                item: { extId: new testId_1.$PI(['ctrlId', 'id-a', 'id-aa']).toString(), item: { label: "a2" } }
            }, {
                op: 1 /* TestDiffOpType.Update */,
                item: { extId: new testId_1.$PI(['ctrlId', 'id-a', 'id-ab']).toString(), item: { label: "z2" } }
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
                item: { extId: new testId_1.$PI(['ctrlId', 'id-a']).toString(), item: { error: "bad" } }
            });
            assert.deepStrictEqual(harness.flush(), [
                { e: 'a' }, { e: 'b' }
            ]);
            harness.tree.expand(harness.projection.getElementByTestId(new testId_1.$PI(['ctrlId', 'id-a']).toString()));
            assert.deepStrictEqual(harness.flush(), [
                { e: 'a', children: [{ e: 'bad' }, { e: 'aa' }, { e: 'ab' }] }, { e: 'b' }
            ]);
            harness.pushDiff({
                op: 1 /* TestDiffOpType.Update */,
                item: { extId: new testId_1.$PI(['ctrlId', 'id-a']).toString(), item: { error: "badder" } }
            });
            assert.deepStrictEqual(harness.flush(), [
                { e: 'a', children: [{ e: 'badder' }, { e: 'aa' }, { e: 'ab' }] }, { e: 'b' }
            ]);
        });
    });
});
//# sourceMappingURL=hierarchalByLocation.test.js.map