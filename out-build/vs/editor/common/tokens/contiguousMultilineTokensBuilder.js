/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/buffer", "vs/editor/common/tokens/contiguousMultilineTokens"], function (require, exports, buffer_1, contiguousMultilineTokens_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$yC = void 0;
    class $yC {
        static deserialize(buff) {
            let offset = 0;
            const count = (0, buffer_1.$Jd)(buff, offset);
            offset += 4;
            const result = [];
            for (let i = 0; i < count; i++) {
                offset = contiguousMultilineTokens_1.$2s.deserialize(buff, offset, result);
            }
            return result;
        }
        constructor() {
            this.a = [];
        }
        add(lineNumber, lineTokens) {
            if (this.a.length > 0) {
                const last = this.a[this.a.length - 1];
                if (last.endLineNumber + 1 === lineNumber) {
                    // append
                    last.appendLineTokens(lineTokens);
                    return;
                }
            }
            this.a.push(new contiguousMultilineTokens_1.$2s(lineNumber, [lineTokens]));
        }
        finalize() {
            return this.a;
        }
        serialize() {
            const size = this.b();
            const result = new Uint8Array(size);
            this.c(result);
            return result;
        }
        b() {
            let result = 0;
            result += 4; // 4 bytes for the count
            for (let i = 0; i < this.a.length; i++) {
                result += this.a[i].serializeSize();
            }
            return result;
        }
        c(destination) {
            let offset = 0;
            (0, buffer_1.$Kd)(destination, this.a.length, offset);
            offset += 4;
            for (let i = 0; i < this.a.length; i++) {
                offset = this.a[i].serialize(destination, offset);
            }
        }
    }
    exports.$yC = $yC;
});
//# sourceMappingURL=contiguousMultilineTokensBuilder.js.map