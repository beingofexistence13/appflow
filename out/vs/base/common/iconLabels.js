/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/filters", "vs/base/common/strings", "vs/base/common/themables"], function (require, exports, filters_1, strings_1, themables_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.matchesFuzzyIconAware = exports.parseLabelWithIcons = exports.getCodiconAriaLabel = exports.stripIcons = exports.markdownEscapeEscapedIcons = exports.escapeIcons = void 0;
    const iconStartMarker = '$(';
    const iconsRegex = new RegExp(`\\$\\(${themables_1.ThemeIcon.iconNameExpression}(?:${themables_1.ThemeIcon.iconModifierExpression})?\\)`, 'g'); // no capturing groups
    const escapeIconsRegex = new RegExp(`(\\\\)?${iconsRegex.source}`, 'g');
    function escapeIcons(text) {
        return text.replace(escapeIconsRegex, (match, escaped) => escaped ? match : `\\${match}`);
    }
    exports.escapeIcons = escapeIcons;
    const markdownEscapedIconsRegex = new RegExp(`\\\\${iconsRegex.source}`, 'g');
    function markdownEscapeEscapedIcons(text) {
        // Need to add an extra \ for escaping in markdown
        return text.replace(markdownEscapedIconsRegex, match => `\\${match}`);
    }
    exports.markdownEscapeEscapedIcons = markdownEscapeEscapedIcons;
    const stripIconsRegex = new RegExp(`(\\s)?(\\\\)?${iconsRegex.source}(\\s)?`, 'g');
    /**
     * Takes a label with icons (`$(iconId)xyz`)  and strips the icons out (`xyz`)
     */
    function stripIcons(text) {
        if (text.indexOf(iconStartMarker) === -1) {
            return text;
        }
        return text.replace(stripIconsRegex, (match, preWhitespace, escaped, postWhitespace) => escaped ? match : preWhitespace || postWhitespace || '');
    }
    exports.stripIcons = stripIcons;
    /**
     * Takes a label with icons (`$(iconId)xyz`), removes the icon syntax adds whitespace so that screen readers can read the text better.
     */
    function getCodiconAriaLabel(text) {
        if (!text) {
            return '';
        }
        return text.replace(/\$\((.*?)\)/g, (_match, codiconName) => ` ${codiconName} `).trim();
    }
    exports.getCodiconAriaLabel = getCodiconAriaLabel;
    const _parseIconsRegex = new RegExp(`\\$\\(${themables_1.ThemeIcon.iconNameCharacter}+\\)`, 'g');
    /**
     * Takes a label with icons (`abc $(iconId)xyz`) and returns the text (`abc xyz`) and the offsets of the icons (`[3]`)
     */
    function parseLabelWithIcons(input) {
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
    exports.parseLabelWithIcons = parseLabelWithIcons;
    function matchesFuzzyIconAware(query, target, enableSeparateSubstringMatching = false) {
        const { text, iconOffsets } = target;
        // Return early if there are no icon markers in the word to match against
        if (!iconOffsets || iconOffsets.length === 0) {
            return (0, filters_1.matchesFuzzy)(query, text, enableSeparateSubstringMatching);
        }
        // Trim the word to match against because it could have leading
        // whitespace now if the word started with an icon
        const wordToMatchAgainstWithoutIconsTrimmed = (0, strings_1.ltrim)(text, ' ');
        const leadingWhitespaceOffset = text.length - wordToMatchAgainstWithoutIconsTrimmed.length;
        // match on value without icon
        const matches = (0, filters_1.matchesFuzzy)(query, wordToMatchAgainstWithoutIconsTrimmed, enableSeparateSubstringMatching);
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
    exports.matchesFuzzyIconAware = matchesFuzzyIconAware;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaWNvbkxhYmVscy5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL2Jhc2UvY29tbW9uL2ljb25MYWJlbHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBTWhHLE1BQU0sZUFBZSxHQUFHLElBQUksQ0FBQztJQUU3QixNQUFNLFVBQVUsR0FBRyxJQUFJLE1BQU0sQ0FBQyxTQUFTLHFCQUFTLENBQUMsa0JBQWtCLE1BQU0scUJBQVMsQ0FBQyxzQkFBc0IsT0FBTyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsc0JBQXNCO0lBRTlJLE1BQU0sZ0JBQWdCLEdBQUcsSUFBSSxNQUFNLENBQUMsVUFBVSxVQUFVLENBQUMsTUFBTSxFQUFFLEVBQUUsR0FBRyxDQUFDLENBQUM7SUFDeEUsU0FBZ0IsV0FBVyxDQUFDLElBQVk7UUFDdkMsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLGdCQUFnQixFQUFFLENBQUMsS0FBSyxFQUFFLE9BQU8sRUFBRSxFQUFFLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEtBQUssS0FBSyxFQUFFLENBQUMsQ0FBQztJQUMzRixDQUFDO0lBRkQsa0NBRUM7SUFFRCxNQUFNLHlCQUF5QixHQUFHLElBQUksTUFBTSxDQUFDLE9BQU8sVUFBVSxDQUFDLE1BQU0sRUFBRSxFQUFFLEdBQUcsQ0FBQyxDQUFDO0lBQzlFLFNBQWdCLDBCQUEwQixDQUFDLElBQVk7UUFDdEQsa0RBQWtEO1FBQ2xELE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyx5QkFBeUIsRUFBRSxLQUFLLENBQUMsRUFBRSxDQUFDLEtBQUssS0FBSyxFQUFFLENBQUMsQ0FBQztJQUN2RSxDQUFDO0lBSEQsZ0VBR0M7SUFFRCxNQUFNLGVBQWUsR0FBRyxJQUFJLE1BQU0sQ0FBQyxnQkFBZ0IsVUFBVSxDQUFDLE1BQU0sUUFBUSxFQUFFLEdBQUcsQ0FB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