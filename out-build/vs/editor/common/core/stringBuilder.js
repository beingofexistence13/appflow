/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/strings", "vs/base/common/platform", "vs/base/common/buffer"], function (require, exports, strings, platform, buffer) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Es = exports.$Ds = exports.$Cs = void 0;
    let _utf16LE_TextDecoder;
    function getUTF16LE_TextDecoder() {
        if (!_utf16LE_TextDecoder) {
            _utf16LE_TextDecoder = new TextDecoder('UTF-16LE');
        }
        return _utf16LE_TextDecoder;
    }
    let _utf16BE_TextDecoder;
    function getUTF16BE_TextDecoder() {
        if (!_utf16BE_TextDecoder) {
            _utf16BE_TextDecoder = new TextDecoder('UTF-16BE');
        }
        return _utf16BE_TextDecoder;
    }
    let _platformTextDecoder;
    function $Cs() {
        if (!_platformTextDecoder) {
            _platformTextDecoder = platform.$C() ? getUTF16LE_TextDecoder() : getUTF16BE_TextDecoder();
        }
        return _platformTextDecoder;
    }
    exports.$Cs = $Cs;
    function $Ds(source, offset, len) {
        const view = new Uint16Array(source.buffer, offset, len);
        if (len > 0 && (view[0] === 0xFEFF || view[0] === 0xFFFE)) {
            // UTF16 sometimes starts with a BOM https://de.wikipedia.org/wiki/Byte_Order_Mark
            // It looks like TextDecoder.decode will eat up a leading BOM (0xFEFF or 0xFFFE)
            // We don't want that behavior because we know the string is UTF16LE and the BOM should be maintained
            // So we use the manual decoder
            return compatDecodeUTF16LE(source, offset, len);
        }
        return getUTF16LE_TextDecoder().decode(view);
    }
    exports.$Ds = $Ds;
    function compatDecodeUTF16LE(source, offset, len) {
        const result = [];
        let resultLen = 0;
        for (let i = 0; i < len; i++) {
            const charCode = buffer.$Hd(source, offset);
            offset += 2;
            result[resultLen++] = String.fromCharCode(charCode);
        }
        return result.join('');
    }
    class $Es {
        constructor(capacity) {
            this.a = capacity | 0;
            this.b = new Uint16Array(this.a);
            this.c = null;
            this.d = 0;
        }
        reset() {
            this.c = null;
            this.d = 0;
        }
        build() {
            if (this.c !== null) {
                this.f();
                return this.c.join('');
            }
            return this.e();
        }
        e() {
            if (this.d === 0) {
                return '';
            }
            const view = new Uint16Array(this.b.buffer, 0, this.d);
            return $Cs().decode(view);
        }
        f() {
            const bufferString = this.e();
            this.d = 0;
            if (this.c === null) {
                this.c = [bufferString];
            }
            else {
                this.c[this.c.length] = bufferString;
            }
        }
        /**
         * Append a char code (<2^16)
         */
        appendCharCode(charCode) {
            const remainingSpace = this.a - this.d;
            if (remainingSpace <= 1) {
                if (remainingSpace === 0 || strings.$Qe(charCode)) {
                    this.f();
                }
            }
            this.b[this.d++] = charCode;
        }
        /**
         * Append an ASCII char code (<2^8)
         */
        appendASCIICharCode(charCode) {
            if (this.d === this.a) {
                // buffer is full
                this.f();
            }
            this.b[this.d++] = charCode;
        }
        appendString(str) {
            const strLen = str.length;
            if (this.d + strLen >= this.a) {
                // This string does not fit in the remaining buffer space
                this.f();
                this.c[this.c.length] = str;
                return;
            }
            for (let i = 0; i < strLen; i++) {
                this.b[this.d++] = str.charCodeAt(i);
            }
        }
    }
    exports.$Es = $Es;
});
//# sourceMappingURL=stringBuilder.js.map