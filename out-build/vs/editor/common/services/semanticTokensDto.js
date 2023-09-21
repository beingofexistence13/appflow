/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/buffer", "vs/base/common/platform"], function (require, exports, buffer_1, platform) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$w0 = exports.$v0 = void 0;
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
        if (!platform.$C()) {
            // the byte order must be changed
            reverseEndianness(uint8Arr);
        }
        return buffer_1.$Fd.wrap(uint8Arr);
    }
    function fromLittleEndianBuffer(buff) {
        const uint8Arr = buff.buffer;
        if (!platform.$C()) {
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
    function $v0(semanticTokens) {
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
    exports.$v0 = $v0;
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
    function $w0(_buff) {
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
    exports.$w0 = $w0;
});
//# sourceMappingURL=semanticTokensDto.js.map