define(["require", "exports", "assert", "vs/base/test/common/utils", "vs/editor/common/core/characterClassifier"], function (require, exports, assert, utils_1, characterClassifier_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('CharacterClassifier', () => {
        (0, utils_1.$bT)();
        test('works', () => {
            const classifier = new characterClassifier_1.$Hs(0);
            assert.strictEqual(classifier.get(-1), 0);
            assert.strictEqual(classifier.get(0), 0);
            assert.strictEqual(classifier.get(97 /* CharCode.a */), 0);
            assert.strictEqual(classifier.get(98 /* CharCode.b */), 0);
            assert.strictEqual(classifier.get(122 /* CharCode.z */), 0);
            assert.strictEqual(classifier.get(255), 0);
            assert.strictEqual(classifier.get(1000), 0);
            assert.strictEqual(classifier.get(2000), 0);
            classifier.set(97 /* CharCode.a */, 1);
            classifier.set(122 /* CharCode.z */, 2);
            classifier.set(1000, 3);
            assert.strictEqual(classifier.get(-1), 0);
            assert.strictEqual(classifier.get(0), 0);
            assert.strictEqual(classifier.get(97 /* CharCode.a */), 1);
            assert.strictEqual(classifier.get(98 /* CharCode.b */), 0);
            assert.strictEqual(classifier.get(122 /* CharCode.z */), 2);
            assert.strictEqual(classifier.get(255), 0);
            assert.strictEqual(classifier.get(1000), 3);
            assert.strictEqual(classifier.get(2000), 0);
        });
    });
});
//# sourceMappingURL=characterClassifier.test.js.map