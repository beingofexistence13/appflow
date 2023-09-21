/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/filters", "vs/base/common/strings", "vs/base/common/themables"], function (require, exports, filters_1, strings_1, themables_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Wj = exports.$Vj = exports.$Uj = exports.$Tj = exports.$Sj = exports.$Rj = void 0;
    const iconStartMarker = '$(';
    const iconsRegex = new RegExp(`\\$\\(${themables_1.ThemeIcon.iconNameExpression}(?:${themables_1.ThemeIcon.iconModifierExpression})?\\)`, 'g'); // no capturing groups
    const escapeIconsRegex = new RegExp(`(\\\\)?${iconsRegex.source}`, 'g');
    function $Rj(text) {
        return text.replace(escapeIconsRegex, (match, escaped) => escaped ? match : `\\${match}`);
    }
    exports.$Rj = $Rj;
    const markdownEscapedIconsRegex = new RegExp(`\\\\${iconsRegex.source}`, 'g');
    function $Sj(text) {
        // Need to add an extra \ for escaping in markdown
        return text.replace(markdownEscapedIconsRegex, match => `\\${match}`);
    }
    exports.$Sj = $Sj;
    const stripIconsRegex = new RegExp(`(\\s)?(\\\\)?${iconsRegex.source}(\\s)?`, 'g');
    /**
     * Takes a label with icons (`$(iconId)xyz`)  and strips the icons out (`xyz`)
     */
    function $Tj(text) {
        if (text.indexOf(iconStartMarker) === -1) {
            return text;
        }
        return text.replace(stripIconsRegex, (match, preWhitespace, escaped, postWhitespace) => escaped ? match : preWhitespace || postWhitespace || '');
    }
    exports.$Tj = $Tj;
    /**
     * Takes a label with icons (`$(iconId)xyz`), removes the icon syntax adds whitespace so that screen readers can read the text better.
     */
    function $Uj(text) {
        if (!text) {
            return '';
        }
        return text.replace(/\$\((.*?)\)/g, (_match, codiconName) => ` ${codiconName} `).trim();
    }
    exports.$Uj = $Uj;
    const _parseIconsRegex = new RegExp(`\\$\\(${themables_1.ThemeIcon.iconNameCharacter}+\\)`, 'g');
    /**
     * Takes a label with icons (`abc $(iconId)xyz`) and returns the text (`abc xyz`) and the offsets of the icons (`[3]`)
     */
    function $Vj(input) {
        _parseIconsRegex.lastIndex = 0;
        let text = '';
        const iconOffsets = [];
        let iconsOffset = 0;
        while (true) {
            const pos = _parseIconsRegex.lastIndex;
            const match = _parseIconsRegex.exec(input);
            const chars = input.substring(pos, match?.index);
            if (chars.length > 0) {
                text += chars;
                for (let i = 0; i < chars.length; i++) {
                    iconOffsets.push(iconsOffset);
                }
            }
            if (!match) {
                break;
            }
            iconsOffset += match[0].length;
        }
        return { text, iconOffsets };
    }
    exports.$Vj = $Vj;
    function $Wj(query, target, enableSeparateSubstringMatching = false) {
        const { text, iconOffsets } = target;
        // Return early if there are no icon markers in the word to match against
        if (!iconOffsets || iconOffsets.length === 0) {
            return (0, filters_1.$Ej)(query, text, enableSeparateSubstringMatching);
        }
        // Trim the word to match against because it could have leading
        // whitespace now if the word started with an icon
        const wordToMatchAgainstWithoutIconsTrimmed = (0, strings_1.$ue)(text, ' ');
        const leadingWhitespaceOffset = text.length - wordToMatchAgainstWithoutIconsTrimmed.length;
        // match on value without icon
        const matches = (0, filters_1.$Ej)(query, wordToMatchAgainstWithoutIconsTrimmed, enableSeparateSubstringMatching);
        // Map matches back to offsets with icon and trimming
        if (matches) {
            for (const match of matches) {
                const iconOffset = iconOffsets[match.start + leadingWhitespaceOffset] /* icon offsets at index */ + leadingWhitespaceOffset /* overall leading whitespace offset */;
                match.start += iconOffset;
                match.end += iconOffset;
            }
        }
        return matches;
    }
    exports.$Wj = $Wj;
});
//# sourceMappingURL=iconLabels.js.map