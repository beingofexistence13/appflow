define(["require", "exports", "assert", "vs/base/common/uuid"], function (require, exports, assert, uuid) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('UUID', () => {
        test('generation', () => {
            const asHex = uuid.$4f();
            assert.strictEqual(asHex.length, 36);
            assert.strictEqual(asHex[14], '4');
            assert.ok(asHex[19] === '8' || asHex[19] === '9' || asHex[19] === 'a' || asHex[19] === 'b');
        });
        test('self-check', function () {
            const t1 = Date.now();
            while (Date.now() - t1 < 50) {
                const value = uuid.$4f();
                assert.ok(uuid.$3f(value));
            }
        });
    });
});
//# sourceMappingURL=uuid.test.js.map