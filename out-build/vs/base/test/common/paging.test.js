/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/async", "vs/base/common/cancellation", "vs/base/common/errors", "vs/base/common/paging", "vs/base/test/common/utils"], function (require, exports, assert, async_1, cancellation_1, errors_1, paging_1, utils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function getPage(pageIndex, cancellationToken) {
        if (cancellationToken.isCancellationRequested) {
            return Promise.reject(new errors_1.$3());
        }
        return Promise.resolve([0, 1, 2, 3, 4].map(i => i + (pageIndex * 5)));
    }
    class TestPager {
        constructor(getPageFn) {
            this.firstPage = [0, 1, 2, 3, 4];
            this.pageSize = 5;
            this.total = 100;
            this.getPage = getPageFn || getPage;
        }
    }
    suite('PagedModel', () => {
        const store = (0, utils_1.$bT)();
        test('isResolved', () => {
            const pager = new TestPager();
            const model = new paging_1.$Hn(pager);
            assert(model.isResolved(0));
            assert(model.isResolved(1));
            assert(model.isResolved(2));
            assert(model.isResolved(3));
            assert(model.isResolved(4));
            assert(!model.isResolved(5));
            assert(!model.isResolved(6));
            assert(!model.isResolved(7));
            assert(!model.isResolved(8));
            assert(!model.isResolved(9));
            assert(!model.isResolved(10));
            assert(!model.isResolved(99));
        });
        test('resolve single', async () => {
            const pager = new TestPager();
            const model = new paging_1.$Hn(pager);
            assert(!model.isResolved(5));
            await model.resolve(5, cancellation_1.CancellationToken.None);
            assert(model.isResolved(5));
        });
        test('resolve page', async () => {
            const pager = new TestPager();
            const model = new paging_1.$Hn(pager);
            assert(!model.isResolved(5));
            assert(!model.isResolved(6));
            assert(!model.isResolved(7));
            assert(!model.isResolved(8));
            assert(!model.isResolved(9));
            assert(!model.isResolved(10));
            await model.resolve(5, cancellation_1.CancellationToken.None);
            assert(model.isResolved(5));
            assert(model.isResolved(6));
            assert(model.isResolved(7));
            assert(model.isResolved(8));
            assert(model.isResolved(9));
            assert(!model.isResolved(10));
        });
        test('resolve page 2', async () => {
            const pager = new TestPager();
            const model = new paging_1.$Hn(pager);
            assert(!model.isResolved(5));
            assert(!model.isResolved(6));
            assert(!model.isResolved(7));
            assert(!model.isResolved(8));
            assert(!model.isResolved(9));
            assert(!model.isResolved(10));
            await model.resolve(10, cancellation_1.CancellationToken.None);
            assert(!model.isResolved(5));
            assert(!model.isResolved(6));
            assert(!model.isResolved(7));
            assert(!model.isResolved(8));
            assert(!model.isResolved(9));
            assert(model.isResolved(10));
        });
        test('preemptive cancellation works', async function () {
            const pager = new TestPager(() => {
                assert(false);
            });
            const model = new paging_1.$Hn(pager);
            try {
                await model.resolve(5, cancellation_1.CancellationToken.Cancelled);
                return assert(false);
            }
            catch (err) {
                return assert((0, errors_1.$2)(err));
            }
        });
        test('cancellation works', function () {
            const pager = new TestPager((_, token) => new Promise((_, e) => {
                store.add(token.onCancellationRequested(() => e(new errors_1.$3())));
            }));
            const model = new paging_1.$Hn(pager);
            const tokenSource = store.add(new cancellation_1.$pd());
            const promise = model.resolve(5, tokenSource.token).then(() => assert(false), err => assert((0, errors_1.$2)(err)));
            setTimeout(() => tokenSource.cancel(), 10);
            return promise;
        });
        test('same page cancellation works', function () {
            let state = 'idle';
            const pager = new TestPager((pageIndex, token) => {
                state = 'resolving';
                return new Promise((_, e) => {
                    store.add(token.onCancellationRequested(() => {
                        state = 'idle';
                        e(new errors_1.$3());
                    }));
                });
            });
            const model = new paging_1.$Hn(pager);
            assert.strictEqual(state, 'idle');
            const tokenSource1 = new cancellation_1.$pd();
            const promise1 = model.resolve(5, tokenSource1.token).then(() => assert(false), err => assert((0, errors_1.$2)(err)));
            assert.strictEqual(state, 'resolving');
            const tokenSource2 = new cancellation_1.$pd();
            const promise2 = model.resolve(6, tokenSource2.token).then(() => assert(false), err => assert((0, errors_1.$2)(err)));
            assert.strictEqual(state, 'resolving');
            store.add((0, async_1.$Ig)(() => {
                assert.strictEqual(state, 'resolving');
                tokenSource1.cancel();
                assert.strictEqual(state, 'resolving');
                store.add((0, async_1.$Ig)(() => {
                    assert.strictEqual(state, 'resolving');
                    tokenSource2.cancel();
                    assert.strictEqual(state, 'idle');
                }, 10));
            }, 10));
            return Promise.all([promise1, promise2]);
        });
    });
});
//# sourceMappingURL=paging.test.js.map