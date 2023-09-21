/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/cancellation", "vs/base/common/iterator", "vs/platform/instantiation/common/instantiation", "vs/workbench/contrib/testing/common/testId"], function (require, exports, cancellation_1, iterator_1, instantiation_1, testId_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.testsInFile = exports.expandAndGetTestById = exports.getContextForTestItem = exports.testCollectionIsEmpty = exports.ITestService = void 0;
    exports.ITestService = (0, instantiation_1.createDecorator)('testService');
    const testCollectionIsEmpty = (collection) => !iterator_1.Iterable.some(collection.rootItems, r => r.children.size > 0);
    exports.testCollectionIsEmpty = testCollectionIsEmpty;
    const getContextForTestItem = (collection, id) => {
        if (typeof id === 'string') {
            id = testId_1.TestId.fromString(id);
        }
        if (id.isRoot) {
            return { controller: id.toString() };
        }
        const context = { $mid: 16 /* MarshalledId.TestItemContext */, tests: [] };
        for (const i of id.idsFromRoot()) {
            if (!i.isRoot) {
                const test = collection.getNodeById(i.toString());
                if (test) {
                    context.tests.push(test);
                }
            }
        }
        return context;
    };
    exports.getContextForTestItem = getContextForTestItem;
    /**
     * Ensures the test with the given ID exists in the collection, if possible.
     * If cancellation is requested, or the test cannot be found, it will return
     * undefined.
     */
    const expandAndGetTestById = async (collection, id, ct = cancellation_1.CancellationToken.None) => {
        const idPath = [...testId_1.TestId.fromString(id).idsFromRoot()];
        let expandToLevel = 0;
        for (let i = idPath.length - 1; !ct.isCancellationRequested && i >= expandToLevel;) {
            const id = idPath[i].toString();
            const existing = collection.getNodeById(id);
            if (!existing) {
                i--;
                continue;
            }
            if (i === idPath.length - 1) {
                return existing;
            }
            // expand children only if it looks like it's necessary
            if (!existing.children.has(idPath[i + 1].toString())) {
                await collection.expand(id, 0);
            }
            expandToLevel = i + 1; // avoid an infinite loop if the test does not exist
            i = idPath.length - 1;
        }
        return undefined;
    };
    exports.expandAndGetTestById = expandAndGetTestById;
    /**
     * Waits for the test to no longer be in the "busy" state.
     */
    const waitForTestToBeIdle = (testService, test) => {
        if (!test.item.busy) {
            return;
        }
        return new Promise(resolve => {
            const l = testService.onDidProcessDiff(() => {
                if (testService.collection.getNodeById(test.item.extId)?.item.busy !== true) {
                    resolve(); // removed, or no longer busy
                    l.dispose();
                }
            });
        });
    };
    /**
     * Iterator that expands to and iterates through tests in the file. Iterates
     * in strictly descending order.
     */
    const testsInFile = async function* (testService, ident, uri, waitForIdle = true) {
        for (const test of testService.collection.all) {
            if (!test.item.uri) {
                continue;
            }
            if (ident.extUri.isEqual(uri, test.item.uri)) {
                yield test;
            }
            if (ident.extUri.isEqualOrParent(uri, test.item.uri)) {
                if (test.expand === 1 /* TestItemExpandState.Expandable */) {
                    await testService.collection.expand(test.item.extId, 1);
                }
                if (waitForIdle) {
                    await waitForTestToBeIdle(testService, test);
                }
            }
        }
    };
    exports.testsInFile = testsInFile;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdFNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi90ZXN0aW5nL2NvbW1vbi90ZXN0U2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFnQm5GLFFBQUEsWUFBWSxHQUFHLElBQUEsK0JBQWUsRUFBZSxhQUFhLENBQUMsQ0FBQztJQThEbEUsTUFBTSxxQkFBcUIsR0FBRyxDQUFDLFVBQXFDLEVBQUUsRUFBRSxDQUM5RSxDQUFDLG1CQUFRLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxTQUFTLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLElBQUksR0FBRyxDQUFDLENBQUMsQ0FBQztJQURuRCxRQUFBLHFCQUFxQix5QkFDOEI7SUFFekQsTUFBTSxxQkFBcUIsR0FBRyxDQUFDLFVBQXFDLEVBQUUsRUFBbUIsRUFBRSxFQUFFO1FBQ25HLElBQUksT0FBTyxFQUFFLEtBQUssUUFBUSxFQUFFO1lBQzNCLEVBQUUsR0FBRyxlQUFNLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1NBQzNCO1FBRUQsSUFBSSxFQUFFLENBQUMsTUFBTSxFQUFFO1lBQ2QsT0FBTyxFQUFFLFVBQVUsRUFBRSxFQUFFLENBQUMsUUFBUSxFQUFFLEVBQUUsQ0FBQztTQUNyQztRQUVELE1BQU0sT0FBTyxHQUFxQixFQUFFLElBQUksdUNBQThCLEVBQUUsS0FBSyxFQUFFLEVBQUUsRUFBRSxDQUFDO1FBQ3BGLEtBQUssTUFBTSxDQUFDLElBQUksRUFBRSxDQUFDLFdBQVcsRUFBRSxFQUFFO1lBQ2pDLElBQUksQ0FBQyxDQUFDLENBQUMsTUFBTSxFQUFFO2dCQUNkLE1BQU0sSUFBSSxHQUFHLFVBQVUsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUM7Z0JBQ2xE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