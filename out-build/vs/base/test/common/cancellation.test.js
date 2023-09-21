define(["require", "exports", "assert", "vs/base/common/cancellation", "vs/base/test/common/utils"], function (require, exports, assert, cancellation_1, utils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('CancellationToken', function () {
        const store = (0, utils_1.$bT)();
        test('None', () => {
            assert.strictEqual(cancellation_1.CancellationToken.None.isCancellationRequested, false);
            assert.strictEqual(typeof cancellation_1.CancellationToken.None.onCancellationRequested, 'function');
        });
        test('cancel before token', function () {
            const source = new cancellation_1.$pd();
            assert.strictEqual(source.token.isCancellationRequested, false);
            source.cancel();
            assert.strictEqual(source.token.isCancellationRequested, true);
            return new Promise(resolve => {
                source.token.onCancellationRequested(() => resolve());
            });
        });
        test('cancel happens only once', function () {
            const source = new cancellation_1.$pd();
            assert.strictEqual(source.token.isCancellationRequested, false);
            let cancelCount = 0;
            function onCancel() {
                cancelCount += 1;
            }
            store.add(source.token.onCancellationRequested(onCancel));
            source.cancel();
            source.cancel();
            assert.strictEqual(cancelCount, 1);
        });
        test('cancel calls all listeners', function () {
            let count = 0;
            const source = new cancellation_1.$pd();
            store.add(source.token.onCancellationRequested(() => count++));
            store.add(source.token.onCancellationRequested(() => count++));
            store.add(source.token.onCancellationRequested(() => count++));
            source.cancel();
            assert.strictEqual(count, 3);
        });
        test('token stays the same', function () {
            let source = new cancellation_1.$pd();
            let token = source.token;
            assert.ok(token === source.token); // doesn't change on get
            source.cancel();
            assert.ok(token === source.token); // doesn't change after cancel
            source.cancel();
            assert.ok(token === source.token); // doesn't change after 2nd cancel
            source = new cancellation_1.$pd();
            source.cancel();
            token = source.token;
            assert.ok(token === source.token); // doesn't change on get
        });
        test('dispose calls no listeners', function () {
            let count = 0;
            const source = new cancellation_1.$pd();
            store.add(source.token.onCancellationRequested(() => count++));
            source.dispose();
            source.cancel();
            assert.strictEqual(count, 0);
        });
        test('dispose calls no listeners (unless told to cancel)', function () {
            let count = 0;
            const source = new cancellation_1.$pd();
            store.add(source.token.onCancellationRequested(() => count++));
            source.dispose(true);
            // source.cancel();
            assert.strictEqual(count, 1);
        });
        test('dispose does not cancel', function () {
            const source = new cancellation_1.$pd();
            source.dispose();
            assert.strictEqual(source.token.isCancellationRequested, false);
        });
        test('parent cancels child', function () {
            const parent = new cancellation_1.$pd();
            const child = new cancellation_1.$pd(parent.token);
            let count = 0;
            store.add(child.token.onCancellationRequested(() => count++));
            parent.cancel();
            assert.strictEqual(count, 1);
            assert.strictEqual(child.token.isCancellationRequested, true);
            assert.strictEqual(parent.token.isCancellationRequested, true);
            child.dispose();
            parent.dispose();
        });
    });
});
//# sourceMappingURL=cancellation.test.js.map