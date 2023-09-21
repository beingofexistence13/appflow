define(["require", "exports", "vs/base/common/strings", "./ast", "./length", "./smallImmutableSet", "./tokenizer"], function (require, exports, strings_1, ast_1, length_1, smallImmutableSet_1, tokenizer_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$0t = exports.$9t = void 0;
    class $9t {
        static createFromLanguage(configuration, denseKeyProvider) {
            function getId(bracketInfo) {
                return denseKeyProvider.getKey(`${bracketInfo.languageId}:::${bracketInfo.bracketText}`);
            }
            const map = new Map();
            for (const openingBracket of configuration.bracketsNew.openingBrackets) {
                const length = (0, length_1.$rt)(0, openingBracket.bracketText.length);
                const openingTextId = getId(openingBracket);
                const bracketIds = smallImmutableSet_1.$Lt.getEmpty().add(openingTextId, smallImmutableSet_1.$Mt);
                map.set(openingBracket.bracketText, new tokenizer_1.$$t(length, 1 /* TokenKind.OpeningBracket */, openingTextId, bracketIds, ast_1.$eu.create(length, openingBracket, bracketIds)));
            }
            for (const closingBracket of configuration.bracketsNew.closingBrackets) {
                const length = (0, length_1.$rt)(0, closingBracket.bracketText.length);
                let bracketIds = smallImmutableSet_1.$Lt.getEmpty();
                const closingBrackets = closingBracket.getOpeningBrackets();
                for (const bracket of closingBrackets) {
                    bracketIds = bracketIds.add(getId(bracket), smallImmutableSet_1.$Mt);
                }
                map.set(closingBracket.bracketText, new tokenizer_1.$$t(length, 2 /* TokenKind.ClosingBracket */, getId(closingBrackets[0]), bracketIds, ast_1.$eu.create(length, closingBracket, bracketIds)));
            }
            return new $9t(map);
        }
        constructor(c) {
            this.c = c;
            this.a = false;
            this.b = null;
        }
        getRegExpStr() {
            if (this.isEmpty) {
                return null;
            }
            else {
                const keys = [...this.c.keys()];
                keys.sort();
                keys.reverse();
                return keys.map(k => prepareBracketForRegExp(k)).join('|');
            }
        }
        /**
         * Returns null if there is no such regexp (because there are no brackets).
        */
        get regExpGlobal() {
            if (!this.a) {
                const regExpStr = this.getRegExpStr();
                this.b = regExpStr ? new RegExp(regExpStr, 'gi') : null;
                this.a = true;
            }
            return this.b;
        }
        getToken(value) {
            return this.c.get(value.toLowerCase());
        }
        findClosingTokenText(openingBracketIds) {
            for (const [closingText, info] of this.c) {
                if (info.kind === 2 /* TokenKind.ClosingBracket */ && info.bracketIds.intersects(openingBracketIds)) {
                    return closingText;
                }
            }
            return undefined;
        }
        get isEmpty() {
            return this.c.size === 0;
        }
    }
    exports.$9t = $9t;
    function prepareBracketForRegExp(str) {
        let escaped = (0, strings_1.$qe)(str);
        // These bracket pair delimiters start or end with letters
        // see https://github.com/microsoft/vscode/issues/132162 https://github.com/microsoft/vscode/issues/150440
        if (/^[\w ]+/.test(str)) {
            escaped = `\\b${escaped}`;
        }
        if (/[\w ]+$/.test(str)) {
            escaped = `${escaped}\\b`;
        }
        return escaped;
    }
    class $0t {
        constructor(b, c) {
            this.b = b;
            this.c = c;
            this.a = new Map();
        }
        didLanguageChange(languageId) {
            // Report a change whenever the language configuration updates.
            return this.a.has(languageId);
        }
        getSingleLanguageBracketTokens(languageId) {
            let singleLanguageBracketTokens = this.a.get(languageId);
            if (!singleLanguageBracketTokens) {
                singleLanguageBracketTokens = $9t.createFromLanguage(this.c(languageId), this.b);
                this.a.set(languageId, singleLanguageBracketTokens);
            }
            return singleLanguageBracketTokens;
        }
        getToken(value, languageId) {
            const singleLanguageBracketTokens = this.getSingleLanguageBracketTokens(languageId);
            return singleLanguageBracketTokens.getToken(value);
        }
    }
    exports.$0t = $0t;
});
//# sourceMappingURL=brackets.js.map