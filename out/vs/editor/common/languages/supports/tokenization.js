/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/color"], function (require, exports, color_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.generateTokensCSSForColorMap = exports.ThemeTrieElement = exports.ExternalThemeTrieElement = exports.ThemeTrieElementRule = exports.strcmp = exports.toStandardTokenType = exports.TokenTheme = exports.ColorMap = exports.parseTokenTheme = exports.ParsedTokenThemeRule = void 0;
    class ParsedTokenThemeRule {
        constructor(token, index, fontStyle, foreground, background) {
            this._parsedThemeRuleBrand = undefined;
            this.token = token;
            this.index = index;
            this.fontStyle = fontStyle;
            this.foreground = foreground;
            this.background = background;
        }
    }
    exports.ParsedTokenThemeRule = ParsedTokenThemeRule;
    /**
     * Parse a raw theme into rules.
     */
    function parseTokenTheme(source) {
        if (!source || !Array.isArray(source)) {
            return [];
        }
        const result = [];
        let resultLen = 0;
        for (let i = 0, len = source.length; i < len; i++) {
            const entry = source[i];
            let fontStyle = -1 /* FontStyle.NotSet */;
            if (typeof entry.fontStyle === 'string') {
                fontStyle = 0 /* FontStyle.None */;
                const segments = entry.fontStyle.split(' ');
                for (let j = 0, lenJ = segments.length; j < lenJ; j++) {
                    const segment = segments[j];
                    switch (segment) {
                        case 'italic':
                            fontStyle = fontStyle | 1 /* FontStyle.Italic */;
                            break;
                        case 'bold':
                            fontStyle = fontStyle | 2 /* FontStyle.Bold */;
                            break;
                        case 'underline':
                            fontStyle = fontStyle | 4 /* FontStyle.Underline */;
                            break;
                        case 'strikethrough':
                            fontStyle = fontStyle | 8 /* FontStyle.Strikethrough */;
                            break;
                    }
                }
            }
            let foreground = null;
            if (typeof entry.foreground === 'string') {
                foreground = entry.foreground;
            }
            let background = null;
            if (typeof entry.background === 'string') {
                background = entry.background;
            }
            result[resultLen++] = new ParsedTokenThemeRule(entry.token || '', i, fontStyle, foreground, background);
        }
        return result;
    }
    exports.parseTokenTheme = parseTokenTheme;
    /**
     * Resolve rules (i.e. inheritance).
     */
    function resolveParsedTokenThemeRules(parsedThemeRules, customTokenColors) {
        // Sort rules lexicographically, and then by index if necessary
        parsedThemeRules.sort((a, b) => {
            const r = strcmp(a.token, b.token);
            if (r !== 0) {
                return r;
            }
            return a.index - b.index;
        });
        // Determine defaults
        let defaultFontStyle = 0 /* FontStyle.None */;
        let defaultForeground = '000000';
        let defaultBackground = 'ffffff';
        while (parsedThemeRules.length >= 1 && parsedThemeRules[0].token === '') {
            const incomingDefaults = parsedThemeRules.shift();
            if (incomingDefaults.fontStyle !== -1 /* FontStyle.NotSet */) {
                defaultFontStyle = incomingDefaults.fontStyle;
            }
            if (incomingDefaults.foreground !== null) {
                defaultForeground = incomingDefaults.foreground;
            }
            if (incomingDefaults.background !== null) {
                defaultBackground = incomingDefaults.background;
            }
        }
        const colorMap = new ColorMap();
        // start with token colors from custom token themes
        for (const color of customTokenColors) {
            colorMap.getId(color);
        }
        const foregroundColorId = colorMap.getId(defaultForeground);
        const backgroundColorId = colorMap.getId(defaultBackground);
        const defaults = new ThemeTrieElementRule(defaultFontStyle, foregroundColorId, backgroundColorId);
        const root = new ThemeTrieElement(defaults);
        for (let i = 0, len = parsedThemeRules.length; i < len; i++) {
            const rule = parsedThemeRules[i];
            root.insert(rule.token, rule.fontStyle, colorMap.getId(rule.foreground), colorMap.getId(rule.background));
        }
        return new TokenTheme(colorMap, root);
    }
    const colorRegExp = /^#?([0-9A-Fa-f]{6})([0-9A-Fa-f]{2})?$/;
    class ColorMap {
        constructor() {
            this._lastColorId = 0;
            this._id2color = [];
            this._color2id = new Map();
        }
        getId(color) {
            if (color === null) {
                return 0;
            }
            const match = color.match(colorRegExp);
            if (!match) {
                throw new Error('Illegal value for token color: ' + color);
            }
            color = match[1].toUpperCase();
            let value = this._color2id.get(color);
            if (value) {
                return value;
            }
            value = ++this._lastColorId;
            this._color2id.set(color, value);
            this._id2color[value] = color_1.Color.fromHex('#' + color);
            return value;
        }
        getColorMap() {
            return this._id2color.slice(0);
        }
    }
    exports.ColorMap = ColorMap;
    class TokenTheme {
        static createFromRawTokenTheme(source, customTokenColors) {
            return this.createFromParsedTokenTheme(parseTokenTheme(source), customTokenColors);
        }
        static createFromParsedTokenTheme(source, customTokenColors) {
            return resolveParsedTokenThemeRules(source, customTokenColors);
        }
        constructor(colorMap, root) {
            this._colorMap = colorMap;
            this._root = root;
            this._cache = new Map();
        }
        getColorMap() {
            return this._colorMap.getColorMap();
        }
        /**
         * used for testing purposes
         */
        getThemeTrieElement() {
            return this._root.toExternalThemeTrieElement();
        }
        _match(token) {
            return this._root.match(token);
        }
        match(languageId, token) {
            // The cache contains the metadata without the language bits set.
            let result = this._cache.get(token);
            if (typeof result === 'undefined') {
                const rule = this._match(token);
                const standardToken = toStandardTokenType(token);
                result = (rule.metadata
                    | (standardToken << 8 /* MetadataConsts.TOKEN_TYPE_OFFSET */)) >>> 0;
                this._cache.set(token, result);
            }
            return (result
                | (languageId << 0 /* MetadataConsts.LANGUAGEID_OFFSET */)) >>> 0;
        }
    }
    exports.TokenTheme = TokenTheme;
    const STANDARD_TOKEN_TYPE_REGEXP = /\b(comment|string|regex|regexp)\b/;
    function toStandardTokenType(tokenType) {
        const m = tokenType.match(STANDARD_TOKEN_TYPE_REGEXP);
        if (!m) {
            return 0 /* StandardTokenType.Other */;
        }
        switch (m[1]) {
            case 'comment':
                return 1 /* StandardTokenType.Comment */;
            case 'string':
                return 2 /* StandardTokenType.String */;
            case 'regex':
                return 3 /* StandardTokenType.RegEx */;
            case 'regexp':
                return 3 /* StandardTokenType.RegEx */;
        }
        throw new Error('Unexpected match for standard token type!');
    }
    exports.toStandardTokenType = toStandardTokenType;
    function strcmp(a, b) {
        if (a < b) {
            return -1;
        }
        if (a > b) {
            return 1;
        }
        return 0;
    }
    exports.strcmp = strcmp;
    class ThemeTrieElementRule {
        constructor(fontStyle, foreground, background) {
            this._themeTrieElementRuleBrand = undefined;
            this._fontStyle = fontStyle;
            this._foreground = foreground;
            this._background = background;
            this.metadata = ((this._fontStyle << 11 /* MetadataConsts.FONT_STYLE_OFFSET */)
                | (this._foreground << 15 /* MetadataConsts.FOREGROUND_OFFSET */)
                | (this._background << 24 /* MetadataConsts.BACKGROUND_OFFSET */)) >>> 0;
        }
        clone() {
            return new ThemeTrieElementRule(this._fontStyle, this._foreground, this._background);
        }
        acceptOverwrite(fontStyle, foreground, background) {
            if (fontStyle !== -1 /* FontStyle.NotSet */) {
                this._fontStyle = fontStyle;
            }
            if (foreground !== 0 /* ColorId.None */) {
                this._foreground = foreground;
            }
            if (background !== 0 /* ColorId.None */) {
                this._background = background;
            }
            this.metadata = ((this._fontStyle << 11 /* MetadataConsts.FONT_STYLE_OFFSET */)
                | (this._foreground << 15 /* MetadataConsts.FOREGROUND_OFFSET */)
                | (this._background << 24 /* MetadataConsts.BACKGROUND_OFFSET */)) >>> 0;
        }
    }
    exports.ThemeTrieElementRule = ThemeTrieElementRule;
    class ExternalThemeTrieElement {
        constructor(mainRule, children = new Map()) {
            this.mainRule = mainRule;
            if (children instanceof Map) {
                this.children = children;
            }
            else {
                this.children = new Map();
                for (const key in children) {
                    this.children.set(key, children[key]);
                }
            }
        }
    }
    exports.ExternalThemeTrieElement = ExternalThemeTrieElement;
    class ThemeTrieElement {
        constructor(mainRule) {
            this._themeTrieElementBrand = undefined;
            this._mainRule = mainRule;
            this._children = new Map();
        }
        /**
         * used for testing purposes
         */
        toExternalThemeTrieElement() {
            const children = new Map();
            this._children.forEach((element, index) => {
                children.set(index, element.toExternalThemeTrieElement());
            });
            return new ExternalThemeTrieElement(this._mainRule, children);
        }
        match(token) {
            if (token === '') {
                return this._mainRule;
            }
            const dotIndex = token.indexOf('.');
            let head;
            let tail;
            if (dotIndex === -1) {
                head = token;
                tail = '';
            }
            else {
                head = token.substring(0, dotIndex);
                tail = token.substring(dotIndex + 1);
            }
            const child = this._children.get(head);
            if (typeof child !== 'undefined') {
                return child.match(tail);
            }
            return this._mainRule;
        }
        insert(token, fontStyle, foreground, background) {
            if (token === '') {
                // Merge into the main rule
                this._mainRule.acceptOverwrite(fontStyle, foreground, background);
                return;
            }
            const dotIndex = token.indexOf('.');
            let head;
            let tail;
            if (dotIndex === -1) {
                head = token;
                tail = '';
            }
            else {
                head = token.substring(0, dotIndex);
                tail = token.substring(dotIndex + 1);
            }
            let child = this._children.get(head);
            if (typeof child === 'undefined') {
                child = new ThemeTrieElement(this._mainRule.clone());
                this._children.set(head, child);
            }
            child.insert(tail, fontStyle, foreground, background);
        }
    }
    exports.ThemeTrieElement = ThemeTrieElement;
    function generateTokensCSSForColorMap(colorMap) {
        const rules = [];
        for (let i = 1, len = colorMap.length; i < len; i++) {
            const color = colorMap[i];
            rules[i] = `.mtk${i} { color: ${color}; }`;
        }
        rules.push('.mtki { font-style: italic; }');
        rules.push('.mtkb { font-weight: bold; }');
        rules.push('.mtku { text-decoration: underline; text-underline-position: under; }');
        rules.push('.mtks { text-decoration: line-through; }');
        rules.push('.mtks.mtku { text-decoration: underline line-through; text-underline-position: under; }');
        return rules.join('\n');
    }
    exports.generateTokensCSSForColorMap = generateTokensCSSForColorMap;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidG9rZW5pemF0aW9uLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvZWRpdG9yL2NvbW1vbi9sYW5ndWFnZXMvc3VwcG9ydHMvdG9rZW5pemF0aW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQVloRyxNQUFhLG9CQUFvQjtRQWFoQyxZQUNDLEtBQWEsRUFDYixLQUFhLEVBQ2IsU0FBaUIsRUFDakIsVUFBeUIsRUFDekIsVUFBeUI7WUFqQjFCLDBCQUFxQixHQUFTLFNBQVMsQ0FBQztZQW1CdkMsSUFBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7WUFDbkIsSUFBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7WUFDbkIsSUFBSSxDQUFDLFNBQVMsR0FBRyxTQUFTLENBQUM7WUFDM0IsSUFBSSxDQUFDLFVBQVUsR0FBRyxVQUFVLENBQUM7WUFDN0IsSUFBSSxDQUFDLFVBQVUsR0FBRyxVQUFVLENBQUM7UUFDOUIsQ0FBQztLQUNEO0lBMUJELG9EQTBCQztJQUVEOztPQUVHO0lBQ0gsU0FBZ0IsZUFBZSxDQUFDLE1BQXlCO1FBQ3hELElBQUksQ0FBQyxNQUFNLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxFQUFFO1lBQ3RDLE9BQU8sRUFBRSxDQUFDO1NBQ1Y7UUFDRCxNQUFNLE1BQU0sR0FBMkIsRUFBRSxDQUFDO1FBQzFDLElBQUksU0FBUyxHQUFHLENBQUMsQ0FBQztRQUNsQixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxHQUFHLEdBQUcsTUFBTSxDQUFDLE1BQU0sRUFBRSxDQUFDLEdBQUcsR0FBRyxFQUFFLENBQUMsRUFBRSxFQUFFO1lBQ2xELE1BQU0sS0FBSyxHQUFHLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUV4QixJQUFJLFNBQVMsNEJBQTJCLENBQUM7WUFDekMsSUFBSSxPQUFPLEtBQUssQ0FB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