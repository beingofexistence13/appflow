/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/arrays", "vs/base/common/iterator", "vs/base/common/uuid"], function (require, exports, arrays_1, iterator_1, uuid_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Ts = exports.$Ss = exports.$Rs = exports.$Qs = exports.$Ps = void 0;
    function $Ps(stringOrPromise) {
        return {
            asString: async () => stringOrPromise,
            asFile: () => undefined,
            value: typeof stringOrPromise === 'string' ? stringOrPromise : undefined,
        };
    }
    exports.$Ps = $Ps;
    function $Qs(fileName, uri, data) {
        const file = { id: (0, uuid_1.$4f)(), name: fileName, uri, data };
        return {
            asString: async () => '',
            asFile: () => file,
            value: undefined,
        };
    }
    exports.$Qs = $Qs;
    class $Rs {
        constructor() {
            this.a = new Map();
        }
        get size() {
            let size = 0;
            for (const _ of this.a) {
                size++;
            }
            return size;
        }
        has(mimeType) {
            return this.a.has(this.b(mimeType));
        }
        matches(pattern) {
            const mimes = [...this.a.keys()];
            if (iterator_1.Iterable.some(this, ([_, item]) => item.asFile())) {
                mimes.push('files');
            }
            return matchesMimeType_normalized(normalizeMimeType(pattern), mimes);
        }
        get(mimeType) {
            return this.a.get(this.b(mimeType))?.[0];
        }
        /**
         * Add a new entry to this data transfer.
         *
         * This does not replace existing entries for `mimeType`.
         */
        append(mimeType, value) {
            const existing = this.a.get(mimeType);
            if (existing) {
                existing.push(value);
            }
            else {
                this.a.set(this.b(mimeType), [value]);
            }
        }
        /**
         * Set the entry for a given mime type.
         *
         * This replaces all existing entries for `mimeType`.
         */
        replace(mimeType, value) {
            this.a.set(this.b(mimeType), [value]);
        }
        /**
         * Remove all entries for `mimeType`.
         */
        delete(mimeType) {
            this.a.delete(this.b(mimeType));
        }
        /**
         * Iterate over all `[mime, item]` pairs in this data transfer.
         *
         * There may be multiple entries for each mime type.
         */
        *[Symbol.iterator]() {
            for (const [mine, items] of this.a) {
                for (const item of items) {
                    yield [mine, item];
                }
            }
        }
        b(mimeType) {
            return normalizeMimeType(mimeType);
        }
    }
    exports.$Rs = $Rs;
    function normalizeMimeType(mimeType) {
        return mimeType.toLowerCase();
    }
    function $Ss(pattern, mimeTypes) {
        return matchesMimeType_normalized(normalizeMimeType(pattern), mimeTypes.map(normalizeMimeType));
    }
    exports.$Ss = $Ss;
    function matchesMimeType_normalized(normalizedPattern, normalizedMimeTypes) {
        // Anything wildcard
        if (normalizedPattern === '*/*') {
            return normalizedMimeTypes.length > 0;
        }
        // Exact match
        if (normalizedMimeTypes.includes(normalizedPattern)) {
            return true;
        }
        // Wildcard, such as `image/*`
        const wildcard = normalizedPattern.match(/^([a-z]+)\/([a-z]+|\*)$/i);
        if (!wildcard) {
            return false;
        }
        const [_, type, subtype] = wildcard;
        if (subtype === '*') {
            return normalizedMimeTypes.some(mime => mime.startsWith(type + '/'));
        }
        return false;
    }
    exports.$Ts = Object.freeze({
        // http://amundsen.com/hypermedia/urilist/
        create: (entries) => {
            return (0, arrays_1.$Kb)(entries.map(x => x.toString())).join('\r\n');
        },
        split: (str) => {
            return str.split('\r\n');
        },
        parse: (str) => {
            return exports.$Ts.split(str).filter(value => !value.startsWith('#'));
        }
    });
});
//# sourceMappingURL=dataTransfer.js.map