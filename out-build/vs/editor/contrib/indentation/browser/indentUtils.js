/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$88 = exports.$78 = void 0;
    function $78(str, tabSize) {
        let spacesCnt = 0;
        for (let i = 0; i < str.length; i++) {
            if (str.charAt(i) === '\t') {
                spacesCnt += tabSize;
            }
            else {
                spacesCnt++;
            }
        }
        return spacesCnt;
    }
    exports.$78 = $78;
    function $88(spacesCnt, tabSize, insertSpaces) {
        spacesCnt = spacesCnt < 0 ? 0 : spacesCnt;
        let result = '';
        if (!insertSpaces) {
            const tabsCnt = Math.floor(spacesCnt / tabSize);
            spacesCnt = spacesCnt % tabSize;
            for (let i = 0; i < tabsCnt; i++) {
                result += '\t';
            }
        }
        for (let i = 0; i < spacesCnt; i++) {
            result += ' ';
        }
        return result;
    }
    exports.$88 = $88;
});
//# sourceMappingURL=indentUtils.js.map