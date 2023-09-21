/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/event", "vs/base/test/common/utils", "vs/workbench/contrib/testing/browser/explorerProjections/listProjection", "vs/workbench/contrib/testing/common/testId", "vs/workbench/contrib/testing/test/browser/testObjectTree", "vs/workbench/contrib/testing/test/common/testStubs"], function (require, exports, assert, event_1, utils_1, listProjection_1, testId_1, testObjectTree_1, testStubs_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('Workbench - Testing Explorer Hierarchal by Name Projection', () => {
        let harness;
        let onTestChanged;
        let resultsService;
        teardown(() => {
            harness.dispose();
        });
        (0, utils_1.$bT)();
        setup(() => {
            onTestChanged = new event_1.$fd();
            resultsService = {
                onResultsChanged: () => undefined,
                onTestChanged: onTestChanged.event,
                getStateById: () => ({ state: { state: 0 }, computedState: 0 }),
            };
            harness = new testObjectTree_1.$_fc(l => new listProjection_1.$wKb({}, l, resultsService));
        });
        test('renders initial tree', () => {
            harness.flush();
            assert.deepStrictEqual(harness.tree.getRendered(), [
                { e: 'aa' }, { e: 'ab' }, { e: 'b' }
            ]);
        });
        test('updates render if second test provider appears', async () => {
            harness.flush();
            harness.pushDiff({
                op: 0 /* TestDiffOpType.Add */,
                item: { controllerId: 'ctrl2', expand: 3 /* TestItemExpandState.Expanded */, item: new testStubs_1.$8fc(new testId_1.$PI(['ctrl2']), 'root2').toTestItem() },
            }, {
                op: 0 /* TestDiffOpType.Add */,
                item: { controllerId: 'ctrl2', expand: 0 /* TestItemExpandState.NotExpandable */, item: new testStubs_1.$8fc(new testId_1.$PI(['ctrl2', 'id-c']), 'c', undefined).toTestItem() },
            });
            assert.deepStrictEqual(harness.flush(), [
                { e: 'root', children: [{ e: 'aa' }, { e: 'ab' }, { e: 'b' }] },
                { e: 'root2', children: [{ e: 'c' }] },
            ]);
        });
        test('updates nodes if they add children', async () => {
            harness.flush();
            harness.c.root.children.get('id-a').children.add(new testStubs_1.$8fc(new testId_1.$PI(['ctrlId', 'id-a', 'id-ac']), 'ac'));
            assert.deepStrictEqual(harness.flush(), [
                { e: 'aa' },
                { e: 'ab' },
                { e: 'ac' },
                { e: 'b' }
            ]);
        });
        test('updates nodes if they remove children', async () => {
            harness.flush();
            harness.c.root.children.get('id-a').children.delete('id-ab');
            assert.deepStrictEqual(harness.flush(), [
                { e: 'aa' },
                { e: 'b' }
            ]);
        });
        test('swaps when node is no longer leaf', async () => {
            harness.flush();
            harness.c.root.children.get('id-b').children.add(new testStubs_1.$8fc(new testId_1.$PI(['ctrlId', 'id-b', 'id-ba']), 'ba'));
            assert.deepStrictEqual(harness.flush(), [
                { e: 'aa' },
                { e: 'ab' },
                { e: 'ba' },
            ]);
        });
    });
});
//# sourceMappingURL=hierarchalByName.test.js.map