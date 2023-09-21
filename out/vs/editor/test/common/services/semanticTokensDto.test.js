/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/editor/common/services/semanticTokensDto", "vs/base/common/buffer", "vs/base/test/common/utils"], function (require, exports, assert, semanticTokensDto_1, buffer_1, utils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('SemanticTokensDto', () => {
        (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
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
            const decoded = (0, semanticTokensDto_1.decodeSemanticTokensDto)((0, semanticTokensDto_1.encodeSemanticTokensDto)(value));
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
                return buffer_1.VSBuffer.wrap(wrapAndSliceUint8Arry(buff.buffer, prefixLength, suffixLength));
            }
            const dto = {
                id: 5,
                type: 'full',
                data: new Uint32Array([1, 2, 3, 4, 5])
            };
            const encoded = (0, semanticTokensDto_1.encodeSemanticTokensDto)(dto);
            // with misaligned prefix and misaligned suffix
            assertEqualFull((0, semanticTokensDto_1.decodeSemanticTokensDto)(wrapAndSlice(encoded, 1, 1)), dto);
            // with misaligned prefix and aligned suffix
            assertEqualFull((0, semanticTokensDto_1.decodeSemanticTokensDto)(wrapAndSlice(encoded, 1, 4)), dto);
            // with aligned prefix and misaligned suffix
            assertEqualFull((0, semanticTokensDto_1.decodeSemanticTokensDto)(wrapAndSlice(encoded, 4, 1)), dto);
            // with aligned prefix and aligned suffix
            assertEqualFull((0, semanticTokensDto_1.decodeSemanticTokensDto)(wrapAndSlice(encoded, 4, 4)), dto);
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VtYW50aWNUb2tlbnNEdG8udGVzdC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL2VkaXRvci90ZXN0L2NvbW1vbi9zZXJ2aWNlcy9zZW1hbnRpY1Rva2Vuc0R0by50ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7O0lBT2hHLEtBQUssQ0FBQyxtQkFBbUIsRUFBRSxHQUFHLEVBQUU7UUFFL0IsSUFBQSwrQ0FBdUMsR0FBRSxDQUFDO1FBRTFDLFNBQVMsS0FBSyxDQUFDLEdBQWdCO1lBQzlCLE1BQU0sTUFBTSxHQUFhLEVBQUUsQ0FBQztZQUM1QixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxHQUFHLEdBQUcsR0FBRyxDQUFDLE1BQU0sRUFBRSxDQUFDLEdBQUcsR0FBRyxFQUFFLENBQUMsRUFBRSxFQUFFO2dCQUMvQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO2FBQ25CO1lBQ0QsT0FBTyxNQUFNLENBQUM7UUFDZixDQUFDO1FBRUQsU0FBUyxlQUFlLENBQUMsTUFBOEIsRUFBRSxRQUFnQztZQUN4RixNQUFNLE9BQU8sR0FBRyxDQUFDLEdBQTJCLEVBQUUsRUFBRTtnQkFDL0MsT0FBTztvQkFDTixFQUFFLEVBQUUsR0FBRyxDQUFDLEVBQUU7b0JBQ1YsSUFBSSxFQUFFLEdBQUcsQ0FBQyxJQUFJO29CQUNkLElBQUksRUFBRSxLQUFLLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQztpQkFDckIsQ0FBQztZQUNILENBQUMsQ0FBQztZQUNGLE1BQU0sQ0FBQyxlQUFlLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxFQUFFLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO1FBQzVELENBQUM7UUFFRCxTQUFTLGdCQUFnQixDQUFDLE1BQStCLEVBQUUsUUFBaUM7WUFDM0YsTUFBTSxVQUFVLEdBQUcs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