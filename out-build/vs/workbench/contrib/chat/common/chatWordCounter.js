/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Gqb = exports.$Fqb = void 0;
    const wordSeparatorCharPattern = /[\s\|\-]/;
    function $Fqb(str, numWordsToCount) {
        let wordCount = numWordsToCount;
        let i = 0;
        while (i < str.length && wordCount > 0) {
            // Consume word separator chars
            while (i < str.length && str[i].match(wordSeparatorCharPattern)) {
                i++;
            }
            // Consume word chars
            while (i < str.length && !str[i].match(wordSeparatorCharPattern)) {
                i++;
            }
            wordCount--;
        }
        const value = str.substring(0, i);
        return {
            value,
            actualWordCount: numWordsToCount - wordCount,
            isFullString: i >= str.length
        };
    }
    exports.$Fqb = $Fqb;
    function $Gqb(str) {
        const result = $Fqb(str, Number.MAX_SAFE_INTEGER);
        return result.actualWordCount;
    }
    exports.$Gqb = $Gqb;
});
//# sourceMappingURL=chatWordCounter.js.map