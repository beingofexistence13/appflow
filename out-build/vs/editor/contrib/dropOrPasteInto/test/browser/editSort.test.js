define(["require", "exports", "assert", "vs/editor/contrib/dropOrPasteInto/browser/edit"], function (require, exports, assert, edit_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function createTestEdit(providerId, args) {
        return {
            label: '',
            insertText: '',
            providerId,
            ...args,
        };
    }
    suite('sortEditsByYieldTo', () => {
        test('Should noop for empty edits', () => {
            const edits = [];
            assert.deepStrictEqual((0, edit_1.$d7)(edits), []);
        });
        test('Yielded to edit should get sorted after target', () => {
            const edits = [
                createTestEdit('a', { yieldTo: [{ providerId: 'b' }] }),
                createTestEdit('b'),
            ];
            assert.deepStrictEqual((0, edit_1.$d7)(edits).map(x => x.providerId), ['b', 'a']);
        });
        test('Should handle chain of yield to', () => {
            {
                const edits = [
                    createTestEdit('c', { yieldTo: [{ providerId: 'a' }] }),
                    createTestEdit('a', { yieldTo: [{ providerId: 'b' }] }),
                    createTestEdit('b'),
                ];
                assert.deepStrictEqual((0, edit_1.$d7)(edits).map(x => x.providerId), ['b', 'a', 'c']);
            }
            {
                const edits = [
                    createTestEdit('a', { yieldTo: [{ providerId: 'b' }] }),
                    createTestEdit('c', { yieldTo: [{ providerId: 'a' }] }),
                    createTestEdit('b'),
                ];
                assert.deepStrictEqual((0, edit_1.$d7)(edits).map(x => x.providerId), ['b', 'a', 'c']);
            }
        });
        test(`Should not reorder when yield to isn't used`, () => {
            const edits = [
                createTestEdit('c', { yieldTo: [{ providerId: 'x' }] }),
                createTestEdit('a', { yieldTo: [{ providerId: 'y' }] }),
                createTestEdit('b'),
            ];
            assert.deepStrictEqual((0, edit_1.$d7)(edits).map(x => x.providerId), ['c', 'a', 'b']);
        });
    });
});
//# sourceMappingURL=editSort.test.js.map