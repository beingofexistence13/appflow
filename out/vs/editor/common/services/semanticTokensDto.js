/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/buffer", "vs/base/common/platform"], function (require, exports, buffer_1, platform) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.decodeSemanticTokensDto = exports.encodeSemanticTokensDto = void 0;
    var EncodedSemanticTokensType;
    (function (EncodedSemanticTokensType) {
        EncodedSemanticTokensType[EncodedSemanticTokensType["Full"] = 1] = "Full";
        EncodedSemanticTokensType[EncodedSemanticTokensType["Delta"] = 2] = "Delta";
    })(EncodedSemanticTokensType || (EncodedSemanticTokensType = {}));
    function reverseEndianness(arr) {
        for (let i = 0, len = arr.length; i < len; i += 4) {
            // flip bytes 0<->3 and 1<->2
            const b0 = arr[i + 0];
            const b1 = arr[i + 1];
            const b2 = arr[i + 2];
            const b3 = arr[i + 3];
            arr[i + 0] = b3;
            arr[i + 1] = b2;
            arr[i + 2] = b1;
            arr[i + 3] = b0;
        }
    }
    function toLittleEndianBuffer(arr) {
        const uint8Arr = new Uint8Array(arr.buffer, arr.byteOffset, arr.length * 4);
        if (!platform.isLittleEndian()) {
            // the byte order must be changed
            reverseEndianness(uint8Arr);
        }
        return buffer_1.VSBuffer.wrap(uint8Arr);
    }
    function fromLittleEndianBuffer(buff) {
        const uint8Arr = buff.buffer;
        if (!platform.isLittleEndian()) {
            // the byte order must be changed
            reverseEndianness(uint8Arr);
        }
        if (uint8Arr.byteOffset % 4 === 0) {
            return new Uint32Array(uint8Arr.buffer, uint8Arr.byteOffset, uint8Arr.length / 4);
        }
        else {
            // unaligned memory access doesn't work on all platforms
            const data = new Uint8Array(uint8Arr.byteLength);
            data.set(uint8Arr);
            return new Uint32Array(data.buffer, data.byteOffset, data.length / 4);
        }
    }
    function encodeSemanticTokensDto(semanticTokens) {
        const dest = new Uint32Array(encodeSemanticTokensDtoSize(semanticTokens));
        let offset = 0;
        dest[offset++] = semanticTokens.id;
        if (semanticTokens.type === 'full') {
            dest[offset++] = 1 /* EncodedSemanticTokensType.Full */;
            dest[offset++] = semanticTokens.data.length;
            dest.set(semanticTokens.data, offset);
            offset += semanticTokens.data.length;
        }
        else {
            dest[offset++] = 2 /* EncodedSemanticTokensType.Delta */;
            dest[offset++] = semanticTokens.deltas.length;
            for (const delta of semanticTokens.deltas) {
                dest[offset++] = delta.start;
                dest[offset++] = delta.deleteCount;
                if (delta.data) {
                    dest[offset++] = delta.data.length;
                    dest.set(delta.data, offset);
                    offset += delta.data.length;
                }
                else {
                    dest[offset++] = 0;
                }
            }
        }
        return toLittleEndianBuffer(dest);
    }
    exports.encodeSemanticTokensDto = encodeSemanticTokensDto;
    function encodeSemanticTokensDtoSize(semanticTokens) {
        let result = 0;
        result += (+1 // id
            + 1 // type
        );
        if (semanticTokens.type === 'full') {
            result += (+1 // data length
                + semanticTokens.data.length);
        }
        else {
            result += (+1 // delta count
            );
            result += (+1 // start
                + 1 // deleteCount
                + 1 // data length
            ) * semanticTokens.deltas.length;
            for (const delta of semanticTokens.deltas) {
                if (delta.data) {
                    result += delta.data.length;
                }
            }
        }
        return result;
    }
    function decodeSemanticTokensDto(_buff) {
        const src = fromLittleEndianBuffer(_buff);
        let offset = 0;
        const id = src[offset++];
        const type = src[offset++];
        if (type === 1 /* EncodedSemanticTokensType.Full */) {
            const length = src[offset++];
            const data = src.subarray(offset, offset + length);
            offset += length;
            return {
                id: id,
                type: 'full',
                data: data
            };
        }
        const deltaCount = src[offset++];
        const deltas = [];
        for (let i = 0; i < deltaCount; i++) {
            const start = src[offset++];
            const deleteCount = src[offset++];
            const length = src[offset++];
            let data;
            if (length > 0) {
                data = src.subarray(offset, offset + length);
                offset += length;
            }
            deltas[i] = { start, deleteCount, data };
        }
        return {
            id: id,
            type: 'delta',
            deltas: deltas
        };
    }
    exports.decodeSemanticTokensDto = decodeSemanticTokensDto;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VtYW50aWNUb2tlbnNEdG8uanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9lZGl0b3IvY29tbW9uL3NlcnZpY2VzL3NlbWFudGljVG9rZW5zRHRvLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQW1CaEcsSUFBVyx5QkFHVjtJQUhELFdBQVcseUJBQXlCO1FBQ25DLHlFQUFRLENBQUE7UUFDUiwyRUFBUyxDQUFBO0lBQ1YsQ0FBQyxFQUhVLHlCQUF5QixLQUF6Qix5QkFBeUIsUUFHbkM7SUFFRCxTQUFTLGlCQUFpQixDQUFDLEdBQWU7UUFDekMsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsR0FBRyxHQUFHLEdBQUcsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxHQUFHLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxFQUFFO1lBQ2xELDZCQUE2QjtZQUM3QixNQUFNLEVBQUUsR0FBRyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO1lBQ3RCLE1BQU0sRUFBRSxHQUFHLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDdEIsTUFBTSxFQUFFLEdBQUcsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUN0QixNQUFNLEVBQUUsR0FBRyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO1lBQ3RCLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDO1lBQ2hCLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDO1lBQ2hCLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDO1lBQ2hCLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDO1NBQ2hCO0lBQ0YsQ0FBQztJQUVELFNBQVMs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