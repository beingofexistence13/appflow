/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/cache"], function (require, exports, cache_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$lt = exports.$kt = exports.$jt = exports.$it = void 0;
    /**
     * Captures all bracket related configurations for a single language.
     * Immutable.
    */
    class $it {
        constructor(languageId, config) {
            this.languageId = languageId;
            const bracketPairs = config.brackets ? filterValidBrackets(config.brackets) : [];
            const openingBracketInfos = new cache_1.$je((bracket) => {
                const closing = new Set();
                return {
                    info: new $kt(this, bracket, closing),
                    closing,
                };
            });
            const closingBracketInfos = new cache_1.$je((bracket) => {
                const opening = new Set();
                const openingColorized = new Set();
                return {
                    info: new $lt(this, bracket, opening, openingColorized),
                    opening,
                    openingColorized,
                };
            });
            for (const [open, close] of bracketPairs) {
                const opening = openingBracketInfos.get(open);
                const closing = closingBracketInfos.get(close);
                opening.closing.add(closing.info);
                closing.opening.add(opening.info);
            }
            // Treat colorized brackets as brackets, and mark them as colorized.
            const colorizedBracketPairs = config.colorizedBracketPairs
                ? filterValidBrackets(config.colorizedBracketPairs)
                // If not configured: Take all brackets except `<` ... `>`
                // Many languages set < ... > as bracket pair, even though they also use it as comparison operator.
                // This leads to problems when colorizing this bracket, so we exclude it if not explicitly configured otherwise.
                // https://github.com/microsoft/vscode/issues/132476
                : bracketPairs.filter((p) => !(p[0] === '<' && p[1] === '>'));
            for (const [open, close] of colorizedBracketPairs) {
                const opening = openingBracketInfos.get(open);
                const closing = closingBracketInfos.get(close);
                opening.closing.add(closing.info);
                closing.openingColorized.add(opening.info);
                closing.opening.add(opening.info);
            }
            this.a = new Map([...openingBracketInfos.cachedValues].map(([k, v]) => [k, v.info]));
            this.b = new Map([...closingBracketInfos.cachedValues].map(([k, v]) => [k, v.info]));
        }
        /**
         * No two brackets have the same bracket text.
        */
        get openingBrackets() {
            return [...this.a.values()];
        }
        /**
         * No two brackets have the same bracket text.
        */
        get closingBrackets() {
            return [...this.b.values()];
        }
        getOpeningBracketInfo(bracketText) {
            return this.a.get(bracketText);
        }
        getClosingBracketInfo(bracketText) {
            return this.b.get(bracketText);
        }
        getBracketInfo(bracketText) {
            return this.getOpeningBracketInfo(bracketText) || this.getClosingBracketInfo(bracketText);
        }
    }
    exports.$it = $it;
    function filterValidBrackets(bracketPairs) {
        return bracketPairs.filter(([open, close]) => open !== '' && close !== '');
    }
    class $jt {
        constructor(a, bracketText) {
            this.a = a;
            this.bracketText = bracketText;
        }
        get languageId() {
            return this.a.languageId;
        }
    }
    exports.$jt = $jt;
    class $kt extends $jt {
        constructor(config, bracketText, openedBrackets) {
            super(config, bracketText);
            this.openedBrackets = openedBrackets;
            this.isOpeningBracket = true;
        }
    }
    exports.$kt = $kt;
    class $lt extends $jt {
        constructor(config, bracketText, 
        /**
         * Non empty array of all opening brackets this bracket closes.
        */
        openingBrackets, b) {
            super(config, bracketText);
            this.openingBrackets = openingBrackets;
            this.b = b;
            this.isOpeningBracket = false;
        }
        /**
         * Checks if this bracket closes the given other bracket.
         * If the bracket infos come from different configurations, this method will return false.
        */
        closes(other) {
            if (other['a'] !== this.a) {
                return false;
            }
            return this.openingBrackets.has(other);
        }
        closesColorized(other) {
            if (other['a'] !== this.a) {
                return false;
            }
            return this.b.has(other);
        }
        getOpeningBrackets() {
            return [...this.openingBrackets];
        }
    }
    exports.$lt = $lt;
});
//# sourceMappingURL=languageBracketsConfiguration.js.map