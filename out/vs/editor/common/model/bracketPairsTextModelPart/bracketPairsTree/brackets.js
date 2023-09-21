define(["require", "exports", "vs/base/common/strings", "./ast", "./length", "./smallImmutableSet", "./tokenizer"], function (require, exports, strings_1, ast_1, length_1, smallImmutableSet_1, tokenizer_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.LanguageAgnosticBracketTokens = exports.BracketTokens = void 0;
    class BracketTokens {
        static createFromLanguage(configuration, denseKeyProvider) {
            function getId(bracketInfo) {
                return denseKeyProvider.getKey(`${bracketInfo.languageId}:::${bracketInfo.bracketText}`);
            }
            const map = new Map();
            for (const openingBracket of configuration.bracketsNew.openingBrackets) {
                const length = (0, length_1.toLength)(0, openingBracket.bracketText.length);
                const openingTextId = getId(openingBracket);
                const bracketIds = smallImmutableSet_1.SmallImmutableSet.getEmpty().add(openingTextId, smallImmutableSet_1.identityKeyProvider);
                map.set(openingBracket.bracketText, new tokenizer_1.Token(length, 1 /* TokenKind.OpeningBracket */, openingTextId, bracketIds, ast_1.BracketAstNode.create(length, openingBracket, bracketIds)));
            }
            for (const closingBracket of configuration.bracketsNew.closingBrackets) {
                const length = (0, length_1.toLength)(0, closingBracket.bracketText.length);
                let bracketIds = smallImmutableSet_1.SmallImmutableSet.getEmpty();
                const closingBrackets = closingBracket.getOpeningBrackets();
                for (const bracket of closingBrackets) {
                    bracketIds = bracketIds.add(getId(bracket), smallImmutableSet_1.identityKeyProvider);
                }
                map.set(closingBracket.bracketText, new tokenizer_1.Token(length, 2 /* TokenKind.ClosingBracket */, getId(closingBrackets[0]), bracketIds, ast_1.BracketAstNode.create(length, closingBracket, bracketIds)));
            }
            return new BracketTokens(map);
        }
        constructor(map) {
            this.map = map;
            this.hasRegExp = false;
            this._regExpGlobal = null;
        }
        getRegExpStr() {
            if (this.isEmpty) {
                return null;
            }
            else {
                const keys = [...this.map.keys()];
                keys.sort();
                keys.reverse();
                return keys.map(k => prepareBracketForRegExp(k)).join('|');
            }
        }
        /**
         * Returns null if there is no such regexp (because there are no brackets).
        */
        get regExpGlobal() {
            if (!this.hasRegExp) {
                const regExpStr = this.getRegExpStr();
                this._regExpGlobal = regExpStr ? new RegExp(regExpStr, 'gi') : null;
                this.hasRegExp = true;
            }
            return this._regExpGlobal;
        }
        getToken(value) {
            return this.map.get(value.toLowerCase());
        }
        findClosingTokenText(openingBracketIds) {
            for (const [closingText, info] of this.map) {
                if (info.kind === 2 /* TokenKind.ClosingBracket */ && info.bracketIds.intersects(openingBracketIds)) {
                    return closingText;
                }
            }
            return undefined;
        }
        get isEmpty() {
            return this.map.size === 0;
        }
    }
    exports.BracketTokens = BracketTokens;
    function prepareBracketForRegExp(str) {
        let escaped = (0, strings_1.escapeRegExpCharacters)(str);
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
    class LanguageAgnosticBracketTokens {
        constructor(denseKeyProvider, getLanguageConfiguration) {
            this.denseKeyProvider = denseKeyProvider;
            this.getLanguageConfiguration = getLanguageConfiguration;
            this.languageIdToBracketTokens = new Map();
        }
        didLanguageChange(languageId) {
            // Report a change whenever the language configuration updates.
            return this.languageIdToBracketTokens.has(languageId);
        }
        getSingleLanguageBracketTokens(languageId) {
            let singleLanguageBracketTokens = this.languageIdToBracketTokens.get(languageId);
            if (!singleLanguageBracketTokens) {
                singleLanguageBracketTokens = BracketTokens.createFromLanguage(this.getLanguageConfiguration(languageId), this.denseKeyProvider);
                this.languageIdToBracketTokens.set(languageId, singleLanguageBracketTokens);
            }
            return singleLanguageBracketTokens;
        }
        getToken(value, languageId) {
            const singleLanguageBracketTokens = this.getSingleLanguageBracketTokens(languageId);
            return singleLanguageBracketTokens.getToken(value);
        }
    }
    exports.LanguageAgnosticBracketTokens = LanguageAgnosticBracketTokens;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnJhY2tldHMuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9lZGl0b3IvY29tbW9uL21vZGVsL2JyYWNrZXRQYWlyc1RleHRNb2RlbFBhcnQvYnJhY2tldFBhaXJzVHJlZS9icmFja2V0cy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7O0lBWUEsTUFBYSxhQUFhO1FBQ3pCLE1BQU0sQ0FBQyxrQkFBa0IsQ0FBQyxhQUE0QyxFQUFFLGdCQUEwQztZQUNqSCxTQUFTLEtBQUssQ0FBQyxXQUF3QjtnQkFDdEMsT0FBTyxnQkFBZ0IsQ0FBQyxNQUFNLENBQUMsR0FBRyxXQUFXLENBQUMsVUFBVSxNQUFNLFdBQVcsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDO1lBQzFGLENBQUM7WUFFRCxNQUFNLEdBQUcsR0FBRyxJQUFJLEdBQUcsRUFBaUIsQ0FBQztZQUNyQyxLQUFLLE1BQU0sY0FBYyxJQUFJLGFBQWEsQ0FBQyxXQUFXLENBQUMsZUFBZSxFQUFFO2dCQUN2RSxNQUFNLE1BQU0sR0FBRyxJQUFBLGlCQUFRLEVBQUMsQ0FBQyxFQUFFLGNBQWMsQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLENBQUM7Z0JBQzlELE1BQU0sYUFBYSxHQUFHLEtBQUssQ0FBQyxjQUFjLENBQUMsQ0FBQztnQkFDNUMsTUFBTSxVQUFVLEdBQUcscUNBQWlCLENBQUMsUUFBUSxFQUFFLENBQUMsR0FBRyxDQUFDLGFBQWEsRUFBRSx1Q0FBbUIsQ0FBQyxDQUFDO2dCQUN4RixHQUFHLENBQUMsR0FBRyxDQUFDLGNBQWMsQ0FBQyxXQUFXLEVBQUUsSUFBSSxpQkFBSyxDQUM1QyxNQUFNLG9DQUVOLGFBQWEsRUFDYixVQUFVLEVBQ1Ysb0JBQWMsQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFLGNBQWMsRUFBRSxVQUFVLENBQUMsQ0FDekQsQ0FBQyxDQUFDO2FBQ0g7WUFFRCxLQUFLLE1BQU0sY0FBYyxJQUFJLGFBQWEsQ0FB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