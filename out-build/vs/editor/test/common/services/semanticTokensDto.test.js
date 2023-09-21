/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/editor/common/services/semanticTokensDto", "vs/base/common/buffer", "vs/base/test/common/utils"], function (require, exports, assert, semanticTokensDto_1, buffer_1, utils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('SemanticTokensDto', () => {
        (0, utils_1.$bT)();
        function toArr(arr) {
            const result = [];
            for (let i = 0, len = arr.length; i < len; i++) {
                result[i] = arr[i];
            }
            return result;
        }
        function assertEqualFull(actual, expected) {
            const convert = (dto) => {
                return {
                    id: dto.id,
                    type: dto.type,
                    data: toArr(dto.data)
                };
            };
            assert.deepStrictEqual(convert(actual), convert(expected));
        }
        function assertEqualDelta(actual, expected) {
            const convertOne = (delta) => {
                if (!delta.data) {
                    return delta;
                }
                return {
                    start: delta.start,
                    deleteCount: delta.deleteCount,
                    data: toArr(delta.data)
                };
            };
            const convert = (dto) => {
                return {
                    id: dto.id,
                    type: dto.type,
                    deltas: dto.deltas.map(convertOne)
                };
            };
            assert.deepStrictEqual(convert(actual), convert(expected));
        }
        function testRoundTrip(value) {
            const decoded = (0, semanticTokensDto_1.$w0)((0, semanticTokensDto_1.$v0)(value));
            if (value.type === 'full' && decoded.type === 'full') {
                assertEqualFull(decoded, value);
            }
            else if (value.type === 'delta' && decoded.type === 'delta') {
                assertEqualDelta(decoded, value);
            }
            else {
                assert.fail('wrong type');
            }
        }
        test('full encoding', () => {
            testRoundTrip({
                id: 12,
                type: 'full',
                data: new Uint32Array([(1 << 24) + (2 << 16) + (3 << 8) + 4])
            });
        });
        test('delta encoding', () => {
            testRoundTrip({
                id: 12,
                type: 'delta',
                deltas: [{
                        start: 0,
                        deleteCount: 4,
                        data: undefined
                    }, {
                        start: 15,
                        deleteCount: 0,
                        data: new Uint32Array([(1 << 24) + (2 << 16) + (3 << 8) + 4])
                    }, {
                        start: 27,
                        deleteCount: 5,
                        data: new Uint32Array([(1 << 24) + (2 << 16) + (3 << 8) + 4, 1, 2, 3, 4, 5, 6, 7, 8, 9])
                    }]
            });
        });
        test('partial array buffer', () => {
            const sharedArr = new Uint32Array([
                (1 << 24) + (2 << 16) + (3 << 8) + 4,
                1, 2, 3, 4, 5, (1 << 24) + (2 << 16) + (3 << 8) + 4
            ]);
            testRoundTrip({
                id: 12,
                type: 'delta',
                deltas: [{
                        start: 0,
                        deleteCount: 4,
                        data: sharedArr.subarray(0, 1)
                    }, {
                        start: 15,
                        deleteCount: 0,
                        data: sharedArr.subarray(1, sharedArr.length)
                    }]
            });
        });
        test('issue #94521: unusual backing array buffer', () => {
            function wrapAndSliceUint8Arry(buff, prefixLength, suffixLength) {
                const wrapped = new Uint8Array(prefixLength + buff.byteLength + suffixLength);
                wrapped.set(buff, prefixLength);
                return wrapped.subarray(prefixLength, prefixLength + buff.byteLength);
            }
            function wrapAndSlice(buff, prefixLength, suffixLength) {
                return buffer_1.$Fd.wrap(wrapAndSliceUint8Arry(buff.buffer, prefixLength, suffixLength));
            }
            const dto = {
                id: 5,
                type: 'full',
                data: new Uint32Array([1, 2, 3, 4, 5])
            };
            const encoded = (0, semanticTokensDto_1.$v0)(dto);
            // with misaligned prefix and misaligned suffix
            assertEqualFull((0, semanticTokensDto_1.$w0)(wrapAndSlice(encoded, 1, 1)), dto);
            // with misaligned prefix and aligned suffix
            assertEqualFull((0, semanticTokensDto_1.$w0)(wrapAndSlice(encoded, 1, 4)), dto);
            // with aligned prefix and misaligned suffix
            assertEqualFull((0, semanticTokensDto_1.$w0)(wrapAndSlice(encoded, 4, 1)), dto);
            // with aligned prefix and aligned suffix
            assertEqualFull((0, semanticTokensDto_1.$w0)(wrapAndSlice(encoded, 4, 4)), dto);
        });
    });
});
//# sourceMappingURL=semanticTokensDto.test.js.map