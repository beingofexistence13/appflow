/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/strings"], function (require, exports, strings) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$vi = exports.$ui = exports.$ti = exports.$si = exports.$ri = exports.$qi = exports.$pi = void 0;
    /**
     * Return a hash value for an object.
     */
    function $pi(obj) {
        return $qi(obj, 0);
    }
    exports.$pi = $pi;
    function $qi(obj, hashVal) {
        switch (typeof obj) {
            case 'object':
                if (obj === null) {
                    return $ri(349, hashVal);
                }
                else if (Array.isArray(obj)) {
                    return arrayHash(obj, hashVal);
                }
                return objectHash(obj, hashVal);
            case 'string':
                return $si(obj, hashVal);
            case 'boolean':
                return booleanHash(obj, hashVal);
            case 'number':
                return $ri(obj, hashVal);
            case 'undefined':
                return $ri(937, hashVal);
            default:
                return $ri(617, hashVal);
        }
    }
    exports.$qi = $qi;
    function $ri(val, initialHashVal) {
        return (((initialHashVal << 5) - initialHashVal) + val) | 0; // hashVal * 31 + ch, keep as int32
    }
    exports.$ri = $ri;
    function booleanHash(b, initialHashVal) {
        return $ri(b ? 433 : 863, initialHashVal);
    }
    function $si(s, hashVal) {
        hashVal = $ri(149417, hashVal);
        for (let i = 0, length = s.length; i < length; i++) {
            hashVal = $ri(s.charCodeAt(i), hashVal);
        }
        return hashVal;
    }
    exports.$si = $si;
    function arrayHash(arr, initialHashVal) {
        initialHashVal = $ri(104579, initialHashVal);
        return arr.reduce((hashVal, item) => $qi(item, hashVal), initialHashVal);
    }
    function objectHash(obj, initialHashVal) {
        initialHashVal = $ri(181387, initialHashVal);
        return Object.keys(obj).sort().reduce((hashVal, key) => {
            hashVal = $si(key, hashVal);
            return $qi(obj[key], hashVal);
        }, initialHashVal);
    }
    class $ti {
        constructor() {
            this.g = 0;
        }
        get value() {
            return this.g;
        }
        hash(obj) {
            this.g = $qi(obj, this.g);
            return this.g;
        }
    }
    exports.$ti = $ti;
    var SHA1Constant;
    (function (SHA1Constant) {
        SHA1Constant[SHA1Constant["BLOCK_SIZE"] = 64] = "BLOCK_SIZE";
        SHA1Constant[SHA1Constant["UNICODE_REPLACEMENT"] = 65533] = "UNICODE_REPLACEMENT";
    })(SHA1Constant || (SHA1Constant = {}));
    function leftRotate(value, bits, totalBits = 32) {
        // delta + bits = totalBits
        const delta = totalBits - bits;
        // All ones, expect `delta` zeros aligned to the right
        const mask = ~((1 << delta) - 1);
        // Join (value left-shifted `bits` bits) with (masked value right-shifted `delta` bits)
        return ((value << bits) | ((mask & value) >>> delta)) >>> 0;
    }
    function fill(dest, index = 0, count = dest.byteLength, value = 0) {
        for (let i = 0; i < count; i++) {
            dest[index + i] = value;
        }
    }
    function leftPad(value, length, char = '0') {
        while (value.length < length) {
            value = char + value;
        }
        return value;
    }
    function $ui(bufferOrValue, bitsize = 32) {
        if (bufferOrValue instanceof ArrayBuffer) {
            return Array.from(new Uint8Array(bufferOrValue)).map(b => b.toString(16).padStart(2, '0')).join('');
        }
        return leftPad((bufferOrValue >>> 0).toString(16), bitsize / 4);
    }
    exports.$ui = $ui;
    /**
     * A SHA1 implementation that works with strings and does not allocate.
     */
    class $vi {
        static { this.g = new DataView(new ArrayBuffer(320)); } // 80 * 4 = 320
        constructor() {
            this.h = 0x67452301;
            this.l = 0xEFCDAB89;
            this.m = 0x98BADCFE;
            this.n = 0x10325476;
            this.o = 0xC3D2E1F0;
            this.p = new Uint8Array(64 /* SHA1Constant.BLOCK_SIZE */ + 3 /* to fit any utf-8 */);
            this.q = new DataView(this.p.buffer);
            this.r = 0;
            this.t = 0;
            this.u = 0;
            this.v = false;
        }
        update(str) {
            const strLen = str.length;
            if (strLen === 0) {
                return;
            }
            const buff = this.p;
            let buffLen = this.r;
            let leftoverHighSurrogate = this.u;
            let charCode;
            let offset;
            if (leftoverHighSurrogate !== 0) {
                charCode = leftoverHighSurrogate;
                offset = -1;
                leftoverHighSurrogate = 0;
            }
            else {
                charCode = str.charCodeAt(0);
                offset = 0;
            }
            while (true) {
                let codePoint = charCode;
                if (strings.$Qe(charCode)) {
                    if (offset + 1 < strLen) {
                        const nextCharCode = str.charCodeAt(offset + 1);
                        if (strings.$Re(nextCharCode)) {
                            offset++;
                            codePoint = strings.$Se(charCode, nextCharCode);
                        }
                        else {
                            // illegal => unicode replacement character
                            codePoint = 65533 /* SHA1Constant.UNICODE_REPLACEMENT */;
                        }
                    }
                    else {
                        // last character is a surrogate pair
                        leftoverHighSurrogate = charCode;
                        break;
                    }
                }
                else if (strings.$Re(charCode)) {
                    // illegal => unicode replacement character
                    codePoint = 65533 /* SHA1Constant.UNICODE_REPLACEMENT */;
                }
                buffLen = this.w(buff, buffLen, codePoint);
                offset++;
                if (offset < strLen) {
                    charCode = str.charCodeAt(offset);
                }
                else {
                    break;
                }
            }
            this.r = buffLen;
            this.u = leftoverHighSurrogate;
        }
        w(buff, buffLen, codePoint) {
            if (codePoint < 0x0080) {
                buff[buffLen++] = codePoint;
            }
            else if (codePoint < 0x0800) {
                buff[buffLen++] = 0b11000000 | ((codePoint & 0b00000000000000000000011111000000) >>> 6);
                buff[buffLen++] = 0b10000000 | ((codePoint & 0b00000000000000000000000000111111) >>> 0);
            }
            else if (codePoint < 0x10000) {
                buff[buffLen++] = 0b11100000 | ((codePoint & 0b00000000000000001111000000000000) >>> 12);
                buff[buffLen++] = 0b10000000 | ((codePoint & 0b00000000000000000000111111000000) >>> 6);
                buff[buffLen++] = 0b10000000 | ((codePoint & 0b00000000000000000000000000111111) >>> 0);
            }
            else {
                buff[buffLen++] = 0b11110000 | ((codePoint & 0b00000000000111000000000000000000) >>> 18);
                buff[buffLen++] = 0b10000000 | ((codePoint & 0b00000000000000111111000000000000) >>> 12);
                buff[buffLen++] = 0b10000000 | ((codePoint & 0b00000000000000000000111111000000) >>> 6);
                buff[buffLen++] = 0b10000000 | ((codePoint & 0b00000000000000000000000000111111) >>> 0);
            }
            if (buffLen >= 64 /* SHA1Constant.BLOCK_SIZE */) {
                this.y();
                buffLen -= 64 /* SHA1Constant.BLOCK_SIZE */;
                this.t += 64 /* SHA1Constant.BLOCK_SIZE */;
                // take last 3 in case of UTF8 overflow
                buff[0] = buff[64 /* SHA1Constant.BLOCK_SIZE */ + 0];
                buff[1] = buff[64 /* SHA1Constant.BLOCK_SIZE */ + 1];
                buff[2] = buff[64 /* SHA1Constant.BLOCK_SIZE */ + 2];
            }
            return buffLen;
        }
        digest() {
            if (!this.v) {
                this.v = true;
                if (this.u) {
                    // illegal => unicode replacement character
                    this.u = 0;
                    this.r = this.w(this.p, this.r, 65533 /* SHA1Constant.UNICODE_REPLACEMENT */);
                }
                this.t += this.r;
                this.x();
            }
            return $ui(this.h) + $ui(this.l) + $ui(this.m) + $ui(this.n) + $ui(this.o);
        }
        x() {
            this.p[this.r++] = 0x80;
            fill(this.p, this.r);
            if (this.r > 56) {
                this.y();
                fill(this.p);
            }
            // this will fit because the mantissa can cover up to 52 bits
            const ml = 8 * this.t;
            this.q.setUint32(56, Math.floor(ml / 4294967296), false);
            this.q.setUint32(60, ml % 4294967296, false);
            this.y();
        }
        y() {
            const bigBlock32 = $vi.g;
            const data = this.q;
            for (let j = 0; j < 64 /* 16*4 */; j += 4) {
                bigBlock32.setUint32(j, data.getUint32(j, false), false);
            }
            for (let j = 64; j < 320 /* 80*4 */; j += 4) {
                bigBlock32.setUint32(j, leftRotate((bigBlock32.getUint32(j - 12, false) ^ bigBlock32.getUint32(j - 32, false) ^ bigBlock32.getUint32(j - 56, false) ^ bigBlock32.getUint32(j - 64, false)), 1), false);
            }
            let a = this.h;
            let b = this.l;
            let c = this.m;
            let d = this.n;
            let e = this.o;
            let f, k;
            let temp;
            for (let j = 0; j < 80; j++) {
                if (j < 20) {
                    f = (b & c) | ((~b) & d);
                    k = 0x5A827999;
                }
                else if (j < 40) {
                    f = b ^ c ^ d;
                    k = 0x6ED9EBA1;
                }
                else if (j < 60) {
                    f = (b & c) | (b & d) | (c & d);
                    k = 0x8F1BBCDC;
                }
                else {
                    f = b ^ c ^ d;
                    k = 0xCA62C1D6;
                }
                temp = (leftRotate(a, 5) + f + e + k + bigBlock32.getUint32(j * 4, false)) & 0xffffffff;
                e = d;
                d = c;
                c = leftRotate(b, 30);
                b = a;
                a = temp;
            }
            this.h = (this.h + a) & 0xffffffff;
            this.l = (this.l + b) & 0xffffffff;
            this.m = (this.m + c) & 0xffffffff;
            this.n = (this.n + d) & 0xffffffff;
            this.o = (this.o + e) & 0xffffffff;
        }
    }
    exports.$vi = $vi;
});
//# sourceMappingURL=hash.js.map