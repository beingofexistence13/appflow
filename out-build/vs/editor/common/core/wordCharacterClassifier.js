/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/editor/common/core/characterClassifier"], function (require, exports, characterClassifier_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Ks = exports.$Js = exports.WordCharacterClass = void 0;
    var WordCharacterClass;
    (function (WordCharacterClass) {
        WordCharacterClass[WordCharacterClass["Regular"] = 0] = "Regular";
        WordCharacterClass[WordCharacterClass["Whitespace"] = 1] = "Whitespace";
        WordCharacterClass[WordCharacterClass["WordSeparator"] = 2] = "WordSeparator";
    })(WordCharacterClass || (exports.WordCharacterClass = WordCharacterClass = {}));
    class $Js extends characterClassifier_1.$Hs {
        constructor(wordSeparators) {
            super(0 /* WordCharacterClass.Regular */);
            for (let i = 0, len = wordSeparators.length; i < len; i++) {
                this.set(wordSeparators.charCodeAt(i), 2 /* WordCharacterClass.WordSeparator */);
            }
            this.set(32 /* CharCode.Space */, 1 /* WordCharacterClass.Whitespace */);
            this.set(9 /* CharCode.Tab */, 1 /* WordCharacterClass.Whitespace */);
        }
    }
    exports.$Js = $Js;
    function once(computeFn) {
        const cache = {}; // TODO@Alex unbounded cache
        return (input) => {
            if (!cache.hasOwnProperty(input)) {
                cache[input] = computeFn(input);
            }
            return cache[input];
        };
    }
    exports.$Ks = once((input) => new $Js(input));
});
//# sourceMappingURL=wordCharacterClassifier.js.map