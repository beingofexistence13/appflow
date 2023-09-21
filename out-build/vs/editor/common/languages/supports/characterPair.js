/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/editor/common/languages/languageConfiguration"], function (require, exports, languageConfiguration_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Ot = void 0;
    class $Ot {
        static { this.DEFAULT_AUTOCLOSE_BEFORE_LANGUAGE_DEFINED_QUOTES = ';:.,=}])> \n\t'; }
        static { this.DEFAULT_AUTOCLOSE_BEFORE_LANGUAGE_DEFINED_BRACKETS = '\'"`;:.,=}])> \n\t'; }
        static { this.DEFAULT_AUTOCLOSE_BEFORE_WHITESPACE = ' \n\t'; }
        constructor(config) {
            if (config.autoClosingPairs) {
                this.a = config.autoClosingPairs.map(el => new languageConfiguration_1.$gt(el));
            }
            else if (config.brackets) {
                this.a = config.brackets.map(b => new languageConfiguration_1.$gt({ open: b[0], close: b[1] }));
            }
            else {
                this.a = [];
            }
            if (config.__electricCharacterSupport && config.__electricCharacterSupport.docComment) {
                const docComment = config.__electricCharacterSupport.docComment;
                // IDocComment is legacy, only partially supported
                this.a.push(new languageConfiguration_1.$gt({ open: docComment.open, close: docComment.close || '' }));
            }
            this.d = typeof config.autoCloseBefore === 'string' ? config.autoCloseBefore : $Ot.DEFAULT_AUTOCLOSE_BEFORE_LANGUAGE_DEFINED_QUOTES;
            this.e = typeof config.autoCloseBefore === 'string' ? config.autoCloseBefore : $Ot.DEFAULT_AUTOCLOSE_BEFORE_LANGUAGE_DEFINED_BRACKETS;
            this.c = config.surroundingPairs || this.a;
        }
        getAutoClosingPairs() {
            return this.a;
        }
        getAutoCloseBeforeSet(forQuotes) {
            return (forQuotes ? this.d : this.e);
        }
        getSurroundingPairs() {
            return this.c;
        }
    }
    exports.$Ot = $Ot;
});
//# sourceMappingURL=characterPair.js.map