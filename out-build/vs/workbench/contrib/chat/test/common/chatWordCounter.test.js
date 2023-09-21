/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/workbench/contrib/chat/common/chatWordCounter"], function (require, exports, assert, chatWordCounter_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('ChatWordCounter', () => {
        function doTest(str, nWords, resultStr) {
            const result = (0, chatWordCounter_1.$Fqb)(str, nWords);
            assert.strictEqual(result.value, resultStr);
            assert.strictEqual(result.actualWordCount, nWords);
        }
        test('getNWords, matching actualWordCount', () => {
            const cases = [
                ['hello world', 1, 'hello'],
                ['hello', 1, 'hello'],
                ['hello world', 0, ''],
                ['here\'s, some.   punctuation?', 3, 'here\'s, some.   punctuation?'],
                ['| markdown | _table_ | header |', 3, '| markdown | _table_ | header'],
                ['| --- | --- | --- |', 1, '| --- | --- | --- |'],
                [' \t some \n whitespace     \n\n\nhere   ', 3, ' \t some \n whitespace     \n\n\nhere'],
            ];
            cases.forEach(([str, nWords, result]) => doTest(str, nWords, result));
        });
    });
});
//# sourceMappingURL=chatWordCounter.test.js.map