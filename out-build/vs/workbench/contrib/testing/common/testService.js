/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/cancellation", "vs/base/common/iterator", "vs/platform/instantiation/common/instantiation", "vs/workbench/contrib/testing/common/testId"], function (require, exports, cancellation_1, iterator_1, instantiation_1, testId_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$8sb = exports.$7sb = exports.$6sb = exports.$5sb = exports.$4sb = void 0;
    exports.$4sb = (0, instantiation_1.$Bh)('testService');
    const $5sb = (collection) => !iterator_1.Iterable.some(collection.rootItems, r => r.children.size > 0);
    exports.$5sb = $5sb;
    const $6sb = (collection, id) => {
        if (typeof id === 'string') {
            id = testId_1.$PI.fromString(id);
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
    exports.$6sb = $6sb;
    /**
     * Ensures the test with the given ID exists in the collection, if possible.
     * If cancellation is requested, or the test cannot be found, it will return
     * undefined.
     */
    const $7sb = async (collection, id, ct = cancellation_1.CancellationToken.None) => {
        const idPath = [...testId_1.$PI.fromString(id).idsFromRoot()];
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
    exports.$7sb = $7sb;
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
    const $8sb = async function* (testService, ident, uri, waitForIdle = true) {
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
    exports.$8sb = $8sb;
});
//# sourceMappingURL=testService.js.map