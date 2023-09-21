/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/browser/hash", "vs/base/common/hash"], function (require, exports, assert, hash_1, hash_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('Hash', () => {
        test('string', () => {
            assert.strictEqual((0, hash_2.$pi)('hello'), (0, hash_2.$pi)('hello'));
            assert.notStrictEqual((0, hash_2.$pi)('hello'), (0, hash_2.$pi)('world'));
            assert.notStrictEqual((0, hash_2.$pi)('hello'), (0, hash_2.$pi)('olleh'));
            assert.notStrictEqual((0, hash_2.$pi)('hello'), (0, hash_2.$pi)('Hello'));
            assert.notStrictEqual((0, hash_2.$pi)('hello'), (0, hash_2.$pi)('Hello '));
            assert.notStrictEqual((0, hash_2.$pi)('h'), (0, hash_2.$pi)('H'));
            assert.notStrictEqual((0, hash_2.$pi)('-'), (0, hash_2.$pi)('_'));
        });
        test('number', () => {
            assert.strictEqual((0, hash_2.$pi)(1), (0, hash_2.$pi)(1));
            assert.notStrictEqual((0, hash_2.$pi)(0), (0, hash_2.$pi)(1));
            assert.notStrictEqual((0, hash_2.$pi)(1), (0, hash_2.$pi)(-1));
            assert.notStrictEqual((0, hash_2.$pi)(0x12345678), (0, hash_2.$pi)(0x123456789));
        });
        test('boolean', () => {
            assert.strictEqual((0, hash_2.$pi)(true), (0, hash_2.$pi)(true));
            assert.notStrictEqual((0, hash_2.$pi)(true), (0, hash_2.$pi)(false));
        });
        test('array', () => {
            assert.strictEqual((0, hash_2.$pi)([1, 2, 3]), (0, hash_2.$pi)([1, 2, 3]));
            assert.strictEqual((0, hash_2.$pi)(['foo', 'bar']), (0, hash_2.$pi)(['foo', 'bar']));
            assert.strictEqual((0, hash_2.$pi)([]), (0, hash_2.$pi)([]));
            assert.strictEqual((0, hash_2.$pi)([]), (0, hash_2.$pi)(new Array()));
            assert.notStrictEqual((0, hash_2.$pi)(['foo', 'bar']), (0, hash_2.$pi)(['bar', 'foo']));
            assert.notStrictEqual((0, hash_2.$pi)(['foo', 'bar']), (0, hash_2.$pi)(['bar', 'foo', null]));
            assert.notStrictEqual((0, hash_2.$pi)(['foo', 'bar', null]), (0, hash_2.$pi)(['bar', 'foo', null]));
            assert.notStrictEqual((0, hash_2.$pi)(['foo', 'bar']), (0, hash_2.$pi)(['bar', 'foo', undefined]));
            assert.notStrictEqual((0, hash_2.$pi)(['foo', 'bar', undefined]), (0, hash_2.$pi)(['bar', 'foo', undefined]));
            assert.notStrictEqual((0, hash_2.$pi)(['foo', 'bar', null]), (0, hash_2.$pi)(['foo', 'bar', undefined]));
        });
        test('object', () => {
            assert.strictEqual((0, hash_2.$pi)({}), (0, hash_2.$pi)({}));
            assert.strictEqual((0, hash_2.$pi)({}), (0, hash_2.$pi)(Object.create(null)));
            assert.strictEqual((0, hash_2.$pi)({ 'foo': 'bar' }), (0, hash_2.$pi)({ 'foo': 'bar' }));
            assert.strictEqual((0, hash_2.$pi)({ 'foo': 'bar', 'foo2': undefined }), (0, hash_2.$pi)({ 'foo2': undefined, 'foo': 'bar' }));
            assert.notStrictEqual((0, hash_2.$pi)({ 'foo': 'bar' }), (0, hash_2.$pi)({ 'foo': 'bar2' }));
            assert.notStrictEqual((0, hash_2.$pi)({}), (0, hash_2.$pi)([]));
        });
        test('array - unexpected collision', function () {
            const a = (0, hash_2.$pi)([undefined, undefined, undefined, undefined, undefined]);
            const b = (0, hash_2.$pi)([undefined, undefined, 'HHHHHH', [{ line: 0, character: 0 }, { line: 0, character: 0 }], undefined]);
            assert.notStrictEqual(a, b);
        });
        test('all different', () => {
            const candidates = [
                null, undefined, {}, [], 0, false, true, '', ' ', [null], [undefined], [undefined, undefined], { '': undefined }, { [' ']: undefined },
                'ab', 'ba', ['ab']
            ];
            const hashes = candidates.map(hash_2.$pi);
            for (let i = 0; i < hashes.length; i++) {
                assert.strictEqual(hashes[i], (0, hash_2.$pi)(candidates[i])); // verify that repeated invocation returns the same hash
                for (let k = i + 1; k < hashes.length; k++) {
                    assert.notStrictEqual(hashes[i], hashes[k], `Same hash ${hashes[i]} for ${JSON.stringify(candidates[i])} and ${JSON.stringify(candidates[k])}`);
                }
            }
        });
        async function checkSHA1(str, expected) {
            // Test with StringSHA1
            const hash = new hash_2.$vi();
            hash.update(str);
            let actual = hash.digest();
            assert.strictEqual(actual, expected);
            // Test with crypto.subtle
            actual = await (0, hash_1.$1Q)(str);
            assert.strictEqual(actual, expected);
        }
        test('sha1-1', () => {
            return checkSHA1('\udd56', '9bdb77276c1852e1fb067820472812fcf6084024');
        });
        test('sha1-2', () => {
            return checkSHA1('\udb52', '9bdb77276c1852e1fb067820472812fcf6084024');
        });
        test('sha1-3', () => {
            return checkSHA1('\uda02ꑍ', '9b483a471f22fe7e09d83f221871a987244bbd3f');
        });
        test('sha1-4', () => {
            return checkSHA1('hello', 'aaf4c61ddcc5e8a2dabede0f3b482cd9aea9434d');
        });
    });
});
//# sourceMappingURL=hash.test.js.map