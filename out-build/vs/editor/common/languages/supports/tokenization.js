/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/color"], function (require, exports, color_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Rob = exports.$Qob = exports.$Pob = exports.$Oob = exports.$Nob = exports.$Mob = exports.$Lob = exports.$Kob = exports.$Job = exports.$Iob = void 0;
    class $Iob {
        constructor(token, index, fontStyle, foreground, background) {
            this._parsedThemeRuleBrand = undefined;
            this.token = token;
            this.index = index;
            this.fontStyle = fontStyle;
            this.foreground = foreground;
            this.background = background;
        }
    }
    exports.$Iob = $Iob;
    /**
     * Parse a raw theme into rules.
     */
    function $Job(source) {
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
            result[resultLen++] = new $Iob(entry.token || '', i, fontStyle, foreground, background);
        }
        return result;
    }
    exports.$Job = $Job;
    /**
     * Resolve rules (i.e. inheritance).
     */
    function resolveParsedTokenThemeRules(parsedThemeRules, customTokenColors) {
        // Sort rules lexicographically, and then by index if necessary
        parsedThemeRules.sort((a, b) => {
            const r = $Nob(a.token, b.token);
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
        const colorMap = new $Kob();
        // start with token colors from custom token themes
        for (const color of customTokenColors) {
            colorMap.getId(color);
        }
        const foregroundColorId = colorMap.getId(defaultForeground);
        const backgroundColorId = colorMap.getId(defaultBackground);
        const defaults = new $Oob(defaultFontStyle, foregroundColorId, backgroundColorId);
        const root = new $Qob(defaults);
        for (let i = 0, len = parsedThemeRules.length; i < len; i++) {
            const rule = parsedThemeRules[i];
            root.insert(rule.token, rule.fontStyle, colorMap.getId(rule.foreground), colorMap.getId(rule.background));
        }
        return new $Lob(colorMap, root);
    }
    const colorRegExp = /^#?([0-9A-Fa-f]{6})([0-9A-Fa-f]{2})?$/;
    class $Kob {
        constructor() {
            this.c = 0;
            this.d = [];
            this.e = new Map();
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
            let value = this.e.get(color);
            if (value) {
                return value;
            }
            value = ++this.c;
            this.e.set(color, value);
            this.d[value] = color_1.$Os.fromHex('#' + color);
            return value;
        }
        getColorMap() {
            return this.d.slice(0);
        }
    }
    exports.$Kob = $Kob;
    class $Lob {
        static createFromRawTokenTheme(source, customTokenColors) {
            return this.createFromParsedTokenTheme($Job(source), customTokenColors);
        }
        static createFromParsedTokenTheme(source, customTokenColors) {
            return resolveParsedTokenThemeRules(source, customTokenColors);
        }
        constructor(colorMap, root) {
            this.c = colorMap;
            this.d = root;
            this.e = new Map();
        }
        getColorMap() {
            return this.c.getColorMap();
        }
        /**
         * used for testing purposes
         */
        getThemeTrieElement() {
            return this.d.toExternalThemeTrieElement();
        }
        _match(token) {
            return this.d.match(token);
        }
        match(languageId, token) {
            // The cache contains the metadata without the language bits set.
            let result = this.e.get(token);
            if (typeof result === 'undefined') {
                const rule = this._match(token);
                const standardToken = $Mob(token);
                result = (rule.metadata
                    | (standardToken << 8 /* MetadataConsts.TOKEN_TYPE_OFFSET */)) >>> 0;
                this.e.set(token, result);
            }
            return (result
                | (languageId << 0 /* MetadataConsts.LANGUAGEID_OFFSET */)) >>> 0;
        }
    }
    exports.$Lob = $Lob;
    const STANDARD_TOKEN_TYPE_REGEXP = /\b(comment|string|regex|regexp)\b/;
    function $Mob(tokenType) {
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
    exports.$Mob = $Mob;
    function $Nob(a, b) {
        if (a < b) {
            return -1;
        }
        if (a > b) {
            return 1;
        }
        return 0;
    }
    exports.$Nob = $Nob;
    class $Oob {
        constructor(fontStyle, foreground, background) {
            this._themeTrieElementRuleBrand = undefined;
            this.c = fontStyle;
            this.d = foreground;
            this.e = background;
            this.metadata = ((this.c << 11 /* MetadataConsts.FONT_STYLE_OFFSET */)
                | (this.d << 15 /* MetadataConsts.FOREGROUND_OFFSET */)
                | (this.e << 24 /* MetadataConsts.BACKGROUND_OFFSET */)) >>> 0;
        }
        clone() {
            return new $Oob(this.c, this.d, this.e);
        }
        acceptOverwrite(fontStyle, foreground, background) {
            if (fontStyle !== -1 /* FontStyle.NotSet */) {
                this.c = fontStyle;
            }
            if (foreground !== 0 /* ColorId.None */) {
                this.d = foreground;
            }
            if (background !== 0 /* ColorId.None */) {
                this.e = background;
            }
            this.metadata = ((this.c << 11 /* MetadataConsts.FONT_STYLE_OFFSET */)
                | (this.d << 15 /* MetadataConsts.FOREGROUND_OFFSET */)
                | (this.e << 24 /* MetadataConsts.BACKGROUND_OFFSET */)) >>> 0;
        }
    }
    exports.$Oob = $Oob;
    class $Pob {
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
    exports.$Pob = $Pob;
    class $Qob {
        constructor(mainRule) {
            this._themeTrieElementBrand = undefined;
            this.c = mainRule;
            this.d = new Map();
        }
        /**
         * used for testing purposes
         */
        toExternalThemeTrieElement() {
            const children = new Map();
            this.d.forEach((element, index) => {
                children.set(index, element.toExternalThemeTrieElement());
            });
            return new $Pob(this.c, children);
        }
        match(token) {
            if (token === '') {
                return this.c;
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
            const child = this.d.get(head);
            if (typeof child !== 'undefined') {
                return child.match(tail);
            }
            return this.c;
        }
        insert(token, fontStyle, foreground, background) {
            if (token === '') {
                // Merge into the main rule
                this.c.acceptOverwrite(fontStyle, foreground, background);
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
            let child = this.d.get(head);
            if (typeof child === 'undefined') {
                child = new $Qob(this.c.clone());
                this.d.set(head, child);
            }
            child.insert(tail, fontStyle, foreground, background);
        }
    }
    exports.$Qob = $Qob;
    function $Rob(colorMap) {
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
    exports.$Rob = $Rob;
});
//# sourceMappingURL=tokenization.js.map