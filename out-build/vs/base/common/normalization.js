/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/map"], function (require, exports, map_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$jl = exports.$il = exports.$hl = void 0;
    const nfcCache = new map_1.$Ci(10000); // bounded to 10000 elements
    function $hl(str) {
        return normalize(str, 'NFC', nfcCache);
    }
    exports.$hl = $hl;
    const nfdCache = new map_1.$Ci(10000); // bounded to 10000 elements
    function $il(str) {
        return normalize(str, 'NFD', nfdCache);
    }
    exports.$il = $il;
    const nonAsciiCharactersPattern = /[^\u0000-\u0080]/;
    function normalize(str, form, normalizedCache) {
        if (!str) {
            return str;
        }
        const cached = normalizedCache.get(str);
        if (cached) {
            return cached;
        }
        let res;
        if (nonAsciiCharactersPattern.test(str)) {
            res = str.normalize(form);
        }
        else {
            res = str;
        }
        // Use the cache for fast lookup
        normalizedCache.set(str, res);
        return res;
    }
    exports.$jl = (function () {
        // transform into NFD form and remove accents
        // see: https://stackoverflow.com/questions/990904/remove-accents-diacritics-in-a-string-in-javascript/37511463#37511463
        const regex = /[\u0300-\u036f]/g;
        return function (str) {
            return $il(str).replace(regex, '');
        };
    })();
});
//# sourceMappingURL=normalization.js.map