/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/lifecycle", "vs/base/test/common/utils", "vs/workbench/services/progress/browser/progressIndicator"], function (require, exports, assert, lifecycle_1, utils_1, progressIndicator_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class TestProgressBar {
        constructor() {
            this.fTotal = 0;
            this.fWorked = 0;
            this.fInfinite = false;
            this.fDone = false;
        }
        infinite() {
            this.fDone = null;
            this.fInfinite = true;
            return this;
        }
        total(total) {
            this.fDone = null;
            this.fTotal = total;
            return this;
        }
        hasTotal() {
            return !!this.fTotal;
        }
        worked(worked) {
            this.fDone = null;
            if (this.fWorked) {
                this.fWorked += worked;
            }
            else {
                this.fWorked = worked;
            }
            return this;
        }
        done() {
            this.fDone = true;
            this.fInfinite = null;
            this.fWorked = null;
            this.fTotal = null;
            return this;
        }
        stop() {
            return this.done();
        }
        show() { }
        hide() { }
    }
    suite('Progress Indicator', () => {
        const disposables = new lifecycle_1.$jc();
        teardown(() => {
            disposables.clear();
        });
        test('ScopedProgressIndicator', async () => {
            const testProgressBar = new TestProgressBar();
            const progressScope = disposables.add(new class extends progressIndicator_1.$Eeb {
                constructor() { super('test.scopeId', true); }
                testOnScopeOpened(scopeId) { super.f(scopeId); }
                testOnScopeClosed(scopeId) { super.g(scopeId); }
            }());
            const testObject = disposables.add(new progressIndicator_1.$Deb(testProgressBar, progressScope));
            // Active: Show (Infinite)
            let fn = testObject.show(true);
            assert.strictEqual(true, testProgressBar.fInfinite);
            fn.done();
            assert.strictEqual(true, testProgressBar.fDone);
            // Active: Show (Total / Worked)
            fn = testObject.show(100);
            assert.strictEqual(false, !!testProgressBar.fInfinite);
            assert.strictEqual(100, testProgressBar.fTotal);
            fn.worked(20);
            assert.strictEqual(20, testProgressBar.fWorked);
            fn.total(80);
            assert.strictEqual(80, testProgressBar.fTotal);
            fn.done();
            assert.strictEqual(true, testProgressBar.fDone);
            // Inactive: Show (Infinite)
            progressScope.testOnScopeClosed('test.scopeId');
            testObject.show(true);
            assert.strictEqual(false, !!testProgressBar.fInfinite);
            progressScope.testOnScopeOpened('test.scopeId');
            assert.strictEqual(true, testProgressBar.fInfinite);
            // Inactive: Show (Total / Worked)
            progressScope.testOnScopeClosed('test.scopeId');
            fn = testObject.show(100);
            fn.total(80);
            fn.worked(20);
            assert.strictEqual(false, !!testProgressBar.fTotal);
            progressScope.testOnScopeOpened('test.scopeId');
            assert.strictEqual(20, testProgressBar.fWorked);
            assert.strictEqual(80, testProgressBar.fTotal);
            // Acive: Show While
            let p = Promise.resolve(null);
            await testObject.showWhile(p);
            assert.strictEqual(true, testProgressBar.fDone);
            progressScope.testOnScopeClosed('test.scopeId');
            p = Promise.resolve(null);
            await testObject.showWhile(p);
            assert.strictEqual(true, testProgressBar.fDone);
            progressScope.testOnScopeOpened('test.scopeId');
            assert.strictEqual(true, testProgressBar.fDone);
        });
        (0, utils_1.$bT)();
    });
});
//# sourceMappingURL=progressIndicator.test.js.map