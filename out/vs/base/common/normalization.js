/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/map"], function (require, exports, map_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.removeAccents = exports.normalizeNFD = exports.normalizeNFC = void 0;
    const nfcCache = new map_1.LRUCache(10000); // bounded to 10000 elements
    function normalizeNFC(str) {
        return normalize(str, 'NFC', nfcCache);
    }
    exports.normalizeNFC = normalizeNFC;
    const nfdCache = new map_1.LRUCache(10000); // bounded to 10000 elements
    function normalizeNFD(str) {
        return normalize(str, 'NFD', nfdCache);
    }
    exports.normalizeNFD = normalizeNFD;
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
    exports.removeAccents = (function () {
        // transform into NFD form and remove accents
        // see: https://stackoverflow.com/questions/990904/remove-accents-diacritics-in-a-string-in-javascript/37511463#37511463
        const regex = /[\u0300-\u036f]/g;
        return function (str) {
            return normalizeNFD(str).replace(regex, '');
        };
    })();
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm9ybWFsaXphdGlvbi5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL2Jhc2UvY29tbW9uL25vcm1hbGl6YXRpb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBSWhHLE1BQU0sUUFBUSxHQUFHLElBQUksY0FBUSxDQUFpQixLQUFLLENBQUMsQ0FBQyxDQUFDLDRCQUE0QjtJQUNsRixTQUFnQixZQUFZLENBQUMsR0FBVztRQUN2QyxPQUFPLFNBQVMsQ0FBQyxHQUFHLEVBQUUsS0FBSyxFQUFFLFFBQVEsQ0FBQyxDQUFDO0lBQ3hDLENBQUM7SUFGRCxvQ0FFQztJQUVELE1BQU0sUUFBUSxHQUFHLElBQUksY0FBUSxDQUFpQixLQUFLLENBQUMsQ0FBQyxDQUFDLDRCQUE0QjtJQUNsRixTQUFnQixZQUFZLENBQUMsR0FBVztRQUN2QyxPQUFPLFNBQVMsQ0FBQyxHQUFHLEVBQUUsS0FBSyxFQUFFLFFBQVEsQ0FBQyxDQUFDO0lBQ3hDLENBQUM7SUFGRCxvQ0FFQztJQUVELE1BQU0seUJBQXlCLEdBQUcsa0JBQWtCLENBQUM7SUFDckQsU0FBUyxTQUFTLENBQUMsR0FBVyxFQUFFLElBQVksRUFBRSxlQUF5QztRQUN0RixJQUFJLENBQUMsR0FBRyxFQUFFO1lBQ1QsT0FBTyxHQUFHLENBQUM7U0FDWDtRQUVELE1BQU0sTUFBTSxHQUFHLGVBQWUsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDeEMsSUFBSSxNQUFNLEVBQUU7WUFDWCxPQUFPLE1BQU0sQ0FBQztTQUNkO1FBRUQsSUFBSSxHQUFXLENBQUM7UUFDaEIsSUFBSSx5QkFBeUIsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUU7WUFDeEMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUM7U0FDMUI7YUFBTTtZQUNOLEdBQUcsR0FBRyxHQUFHLENBQUM7U0FDVjtRQUVELGdDQUFnQztRQUNoQyxlQUFlLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQztRQUU5QixPQUFPLEdBQUcsQ0FBQztJQUNaLENBQUM7SUFFWSxRQUFBLGFBQWEsR0FBNEIsQ0FBQztRQUN0RCw2Q0FBNkM7UUFDN0Msd0hBQXdIO1FBQ3hILE1BQU0sS0FBSyxHQUFHLGtCQUFrQixDQUFDO1FBQ2pDLE9BQU8sVUFBVSxHQUFXO1lBQzNCLE9BQU8sWUFBWSxDQUFDLEdBQUcsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDN0MsQ0FBQyxDQUFDO0lBQ0gsQ0FBQyxDQUFDLEVBQUUsQ0FBQyJ9