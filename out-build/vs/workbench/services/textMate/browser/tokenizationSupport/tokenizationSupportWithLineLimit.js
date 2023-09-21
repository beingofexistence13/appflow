/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/editor/common/languages/nullTokenize", "vs/base/common/lifecycle", "vs/base/common/observable"], function (require, exports, nullTokenize_1, lifecycle_1, observable_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$sBb = void 0;
    class $sBb extends lifecycle_1.$kc {
        get backgroundTokenizerShouldOnlyVerifyTokens() {
            return this.b.backgroundTokenizerShouldOnlyVerifyTokens;
        }
        constructor(a, b, c) {
            super();
            this.a = a;
            this.b = b;
            this.c = c;
            this.B((0, observable_1.keepObserved)(this.c));
        }
        getInitialState() {
            return this.b.getInitialState();
        }
        tokenize(line, hasEOL, state) {
            throw new Error('Not supported!');
        }
        tokenizeEncoded(line, hasEOL, state) {
            // Do not attempt to tokenize if a line is too long
            if (line.length >= this.c.get()) {
                return (0, nullTokenize_1.$wC)(this.a, state);
            }
            return this.b.tokenizeEncoded(line, hasEOL, state);
        }
        createBackgroundTokenizer(textModel, store) {
            if (this.b.createBackgroundTokenizer) {
                return this.b.createBackgroundTokenizer(textModel, store);
            }
            else {
                return undefined;
            }
        }
    }
    exports.$sBb = $sBb;
});
//# sourceMappingURL=tokenizationSupportWithLineLimit.js.map