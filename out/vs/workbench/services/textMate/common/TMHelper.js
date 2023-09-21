/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ThemeRule = exports.findMatchingThemeRule = void 0;
    function findMatchingThemeRule(theme, scopes, onlyColorRules = true) {
        for (let i = scopes.length - 1; i >= 0; i--) {
            const parentScopes = scopes.slice(0, i);
            const scope = scopes[i];
            const r = findMatchingThemeRule2(theme, scope, parentScopes, onlyColorRules);
            if (r) {
                return r;
            }
        }
        return null;
    }
    exports.findMatchingThemeRule = findMatchingThemeRule;
    function findMatchingThemeRule2(theme, scope, parentScopes, onlyColorRules) {
        let result = null;
        // Loop backwards, to ensure the last most specific rule wins
        for (let i = theme.tokenColors.length - 1; i >= 0; i--) {
            const rule = theme.tokenColors[i];
            if (onlyColorRules && !rule.settings.foreground) {
                continue;
            }
            let selectors;
            if (typeof rule.scope === 'string') {
                selectors = rule.scope.split(/,/).map(scope => scope.trim());
            }
            else if (Array.isArray(rule.scope)) {
                selectors = rule.scope;
            }
            else {
                continue;
            }
            for (let j = 0, lenJ = selectors.length; j < lenJ; j++) {
                const rawSelector = selectors[j];
                const themeRule = new ThemeRule(rawSelector, rule.settings);
                if (themeRule.matches(scope, parentScopes)) {
                    if (themeRule.isMoreSpecific(result)) {
                        result = themeRule;
                    }
                }
            }
        }
        return result;
    }
    class ThemeRule {
        constructor(rawSelector, settings) {
            this.rawSelector = rawSelector;
            this.settings = settings;
            const rawSelectorPieces = this.rawSelector.split(/ /);
            this.scope = rawSelectorPieces[rawSelectorPieces.length - 1];
            this.parentScopes = rawSelectorPieces.slice(0, rawSelectorPieces.length - 1);
        }
        matches(scope, parentScopes) {
            return ThemeRule._matches(this.scope, this.parentScopes, scope, parentScopes);
        }
        static _cmp(a, b) {
            if (a === null && b === null) {
                return 0;
            }
            if (a === null) {
                // b > a
                return -1;
            }
            if (b === null) {
                // a > b
                return 1;
            }
            if (a.scope.length !== b.scope.length) {
                // longer scope length > shorter scope length
                return a.scope.length - b.scope.length;
            }
            const aParentScopesLen = a.parentScopes.length;
            const bParentScopesLen = b.parentScopes.length;
            if (aParentScopesLen !== bParentScopesLen) {
                // more parents > less parents
                return aParentScopesLen - bParentScopesLen;
            }
            for (let i = 0; i < aParentScopesLen; i++) {
                const aLen = a.parentScopes[i].length;
                const bLen = b.parentScopes[i].length;
                if (aLen !== bLen) {
                    return aLen - bLen;
                }
            }
            return 0;
        }
        isMoreSpecific(other) {
            return (ThemeRule._cmp(this, other) > 0);
        }
        static _matchesOne(selectorScope, scope) {
            const selectorPrefix = selectorScope + '.';
            if (selectorScope === scope || scope.substring(0, selectorPrefix.length) === selectorPrefix) {
                return true;
            }
            return false;
        }
        static _matches(selectorScope, selectorParentScopes, scope, parentScopes) {
            if (!this._matchesOne(selectorScope, scope)) {
                return false;
            }
            let selectorParentIndex = selectorParentScopes.length - 1;
            let parentIndex = parentScopes.length - 1;
            while (selectorParentIndex >= 0 && parentIndex >= 0) {
                if (this._matchesOne(selectorParentScopes[selectorParentIndex], parentScopes[parentIndex])) {
                    selectorParentIndex--;
                }
                parentIndex--;
            }
            if (selectorParentIndex === -1) {
                return true;
            }
            return false;
        }
    }
    exports.ThemeRule = ThemeRule;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVE1IZWxwZXIuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvc2VydmljZXMvdGV4dE1hdGUvY29tbW9uL1RNSGVscGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQWtCaEcsU0FBZ0IscUJBQXFCLENBQUMsS0FBa0IsRUFBRSxNQUFnQixFQUFFLGlCQUEwQixJQUFJO1FBQ3pHLEtBQUssSUFBSSxDQUFDLEdBQUcsTUFBTSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRTtZQUM1QyxNQUFNLFlBQVksR0FBRyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUN4QyxNQUFNLEtBQUssR0FBRyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDeEIsTUFBTSxDQUFDLEdBQUcsc0JBQXNCLENBQUMsS0FBSyxFQUFFLEtBQUssRUFBRSxZQUFZLEVBQUUsY0FBYyxDQUFDLENBQUM7WUFDN0UsSUFBSSxDQUFDLEVBQUU7Z0JBQ04sT0FBTyxDQUFDLENBQUM7YUFDVDtTQUNEO1FBQ0QsT0FBTyxJQUFJLENBQUM7SUFDYixDQUFDO0lBVkQsc0RBVUM7SUFFRCxTQUFTLHNCQUFzQixDQUFDLEtBQWtCLEVBQUUsS0FBYSxFQUFFLFlBQXNCLEVBQUUsY0FBdUI7UUFDakgsSUFBSSxNQUFNLEdBQXFCLElBQUksQ0FBQztRQUVwQyw2REFBNkQ7UUFDN0QsS0FBSyxJQUFJLENBQUMsR0FBRyxLQUFLLENBQUMsV0FBVyxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRTtZQUN2RCxNQUFNLElBQUksR0FBRyxLQUFLLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ2xDLElBQUksY0FBYyxJQUFJ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