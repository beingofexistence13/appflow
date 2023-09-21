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
        (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
        setup(() => {
            onTestChanged = new event_1.Emitter();
            resultsService = {
                onResultsChanged: () => undefined,
                onTestChanged: onTestChanged.event,
                getStateById: () => ({ state: { state: 0 }, computedState: 0 }),
            };
            harness = new testObjectTree_1.TestTreeTestHarness(l => new listProjection_1.ListProjection({}, l, resultsService));
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
                item: { controllerId: 'ctrl2', expand: 3 /* TestItemExpandState.Expanded */, item: new testStubs_1.TestTestItem(new testId_1.TestId(['ctrl2']), 'root2').toTestItem() },
            }, {
                op: 0 /* TestDiffOpType.Add */,
                item: { controllerId: 'ctrl2', expand: 0 /* TestItemExpandState.NotExpandable */, item: new testStubs_1.TestTestItem(new testId_1.TestId(['ctrl2', 'id-c']), 'c', undefined).toTestItem() },
            });
            assert.deepStrictEqual(harness.flush(), [
                { e: 'root', children: [{ e: 'aa' }, { e: 'ab' }, { e: 'b' }] },
                { e: 'root2', children: [{ e: 'c' }] },
            ]);
        });
        test('updates nodes if they add children', async () => {
            harness.flush();
            harness.c.root.children.get('id-a').children.add(new testStubs_1.TestTestItem(new testId_1.TestId(['ctrlId', 'id-a', 'id-ac']), 'ac'));
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
            harness.c.root.children.get('id-b').children.add(new testStubs_1.TestTestItem(new testId_1.TestId(['ctrlId', 'id-b', 'id-ba']), 'ba'));
            assert.deepStrictEqual(harness.flush(), [
                { e: 'aa' },
                { e: 'ab' },
                { e: 'ba' },
            ]);
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaGllcmFyY2hhbEJ5TmFtZS50ZXN0LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvdGVzdGluZy90ZXN0L2Jyb3dzZXIvZXhwbG9yZXJQcm9qZWN0aW9ucy9oaWVyYXJjaGFsQnlOYW1lLnRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7SUFZaEcsS0FBSyxDQUFDLDREQUE0RCxFQUFFLEdBQUcsRUFBRTtRQUN4RSxJQUFJLE9BQTRDLENBQUM7UUFDakQsSUFBSSxhQUE0QyxDQUFDO1FBQ2pELElBQUksY0FBbUIsQ0FBQztRQUV4QixRQUFRLENBQUMsR0FBRyxFQUFFO1lBQ2IsT0FBTyxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBQ25CLENBQUMsQ0FBQyxDQUFDO1FBRUgsSUFBQSwrQ0FBdUMsR0FBRSxDQUFDO1FBRTFDLEtBQUssQ0FBQyxHQUFHLEVBQUU7WUFDVixhQUFhLEdBQUcsSUFBSSxlQUFPLEVBQUUsQ0FBQztZQUM5QixjQUFjLEdBQUc7Z0JBQ2hCLGdCQUFnQixFQUFFLEdBQUcsRUFBRSxDQUFDLFNBQVM7Z0JBQ2pDLGFBQWEsRUFBRSxhQUFhLENBQUMsS0FBSztnQkFDbEMsWUFBWSxFQUFFLEdBQUcsRUFBRSxDQUFDLENBQUMsRUFBRSxLQUFLLEVBQUUsRUFBRSxLQUFLLEVBQUUsQ0FBQyxFQUFFLEVBQUUsYUFBYSxFQUFFLENBQUMsRUFBRSxDQUFDO2FBQy9ELENBQUM7WUFFRixPQUFPLEdBQUcsSUFBSSxvQ0FBbUIsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUksK0JBQWMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLGNBQXFCLENBQUMsQ0FBQyxDQUFDO1FBQzFGLENBQUMsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLHNCQUFzQixFQUFFLEdBQUcsRUFBRTtZQUNqQyxPQUFPLENBQUMsS0FBSyxFQUFF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