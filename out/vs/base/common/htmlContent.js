/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/errors", "vs/base/common/iconLabels", "vs/base/common/resources", "vs/base/common/strings", "vs/base/common/uri"], function (require, exports, errors_1, iconLabels_1, resources_1, strings_1, uri_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.parseHrefAndDimensions = exports.removeMarkdownEscapes = exports.escapeDoubleQuotes = exports.escapeMarkdownSyntaxTokens = exports.markdownStringEqual = exports.isMarkdownString = exports.isEmptyMarkdownString = exports.MarkdownString = exports.MarkdownStringTextNewlineStyle = void 0;
    var MarkdownStringTextNewlineStyle;
    (function (MarkdownStringTextNewlineStyle) {
        MarkdownStringTextNewlineStyle[MarkdownStringTextNewlineStyle["Paragraph"] = 0] = "Paragraph";
        MarkdownStringTextNewlineStyle[MarkdownStringTextNewlineStyle["Break"] = 1] = "Break";
    })(MarkdownStringTextNewlineStyle || (exports.MarkdownStringTextNewlineStyle = MarkdownStringTextNewlineStyle = {}));
    class MarkdownString {
        constructor(value = '', isTrustedOrOptions = false) {
            this.value = value;
            if (typeof this.value !== 'string') {
                throw (0, errors_1.illegalArgument)('value');
            }
            if (typeof isTrustedOrOptions === 'boolean') {
                this.isTrusted = isTrustedOrOptions;
                this.supportThemeIcons = false;
                this.supportHtml = false;
            }
            else {
                this.isTrusted = isTrustedOrOptions.isTrusted ?? undefined;
                this.supportThemeIcons = isTrustedOrOptions.supportThemeIcons ?? false;
                this.supportHtml = isTrustedOrOptions.supportHtml ?? false;
            }
        }
        appendText(value, newlineStyle = 0 /* MarkdownStringTextNewlineStyle.Paragraph */) {
            this.value += escapeMarkdownSyntaxTokens(this.supportThemeIcons ? (0, iconLabels_1.escapeIcons)(value) : value)
                .replace(/([ \t]+)/g, (_match, g1) => '&nbsp;'.repeat(g1.length)) // CodeQL [SM02383] The Markdown is fully sanitized after being rendered.
                .replace(/\>/gm, '\\>') // CodeQL [SM02383] The Markdown is fully sanitized after being rendered.
                .replace(/\n/g, newlineStyle === 1 /* MarkdownStringTextNewlineStyle.Break */ ? '\\\n' : '\n\n'); // CodeQL [SM02383] The Markdown is fully sanitized after being rendered.
            return this;
        }
        appendMarkdown(value) {
            this.value += value;
            return this;
        }
        appendCodeblock(langId, code) {
            this.value += '\n```';
            this.value += langId;
            this.value += '\n';
            this.value += code;
            this.value += '\n```\n';
            return this;
        }
        appendLink(target, label, title) {
            this.value += '[';
            this.value += this._escape(label, ']');
            this.value += '](';
            this.value += this._escape(String(target), ')');
            if (title) {
                this.value += ` "${this._escape(this._escape(title, '"'), ')')}"`;
            }
            this.value += ')';
            return this;
        }
        _escape(value, ch) {
            const r = new RegExp((0, strings_1.escapeRegExpCharacters)(ch), 'g');
            return value.replace(r, (match, offset) => {
                if (value.charAt(offset - 1) !== '\\') {
                    return `\\${match}`;
                }
                else {
                    return match;
                }
            });
        }
    }
    exports.MarkdownString = MarkdownString;
    function isEmptyMarkdownString(oneOrMany) {
        if (isMarkdownString(oneOrMany)) {
            return !oneOrMany.value;
        }
        else if (Array.isArray(oneOrMany)) {
            return oneOrMany.every(isEmptyMarkdownString);
        }
        else {
            return true;
        }
    }
    exports.isEmptyMarkdownString = isEmptyMarkdownString;
    function isMarkdownString(thing) {
        if (thing instanceof MarkdownString) {
            return true;
        }
        else if (thing && typeof thing === 'object') {
            return typeof thing.value === 'string'
                && (typeof thing.isTrusted === 'boolean' || typeof thing.isTrusted === 'object' || thing.isTrusted === undefined)
                && (typeof thing.supportThemeIcons === 'boolean' || thing.supportThemeIcons === undefined);
        }
        return false;
    }
    exports.isMarkdownString = isMarkdownString;
    function markdownStringEqual(a, b) {
        if (a === b) {
            return true;
        }
        else if (!a || !b) {
            return false;
        }
        else {
            return a.value === b.value
                && a.isTrusted === b.isTrusted
                && a.supportThemeIcons === b.supportThemeIcons
                && a.supportHtml === b.supportHtml
                && (a.baseUri === b.baseUri || !!a.baseUri && !!b.baseUri && (0, resources_1.isEqual)(uri_1.URI.from(a.baseUri), uri_1.URI.from(b.baseUri)));
        }
    }
    exports.markdownStringEqual = markdownStringEqual;
    function escapeMarkdownSyntaxTokens(text) {
        // escape markdown syntax tokens: http://daringfireball.net/projects/markdown/syntax#backslash
        return text.replace(/[\\`*_{}[\]()#+\-!~]/g, '\\$&'); // CodeQL [SM02383] Backslash is escaped in the character class
    }
    exports.escapeMarkdownSyntaxTokens = escapeMarkdownSyntaxTokens;
    function escapeDoubleQuotes(input) {
        return input.replace(/"/g, '&quot;');
    }
    exports.escapeDoubleQuotes = escapeDoubleQuotes;
    function removeMarkdownEscapes(text) {
        if (!text) {
            return text;
        }
        return text.replace(/\\([\\`*_{}[\]()#+\-.!~])/g, '$1');
    }
    exports.removeMarkdownEscapes = removeMarkdownEscapes;
    function parseHrefAndDimensions(href) {
        const dimensions = [];
        const splitted = href.split('|').map(s => s.trim());
        href = splitted[0];
        const parameters = splitted[1];
        if (parameters) {
            const heightFromParams = /height=(\d+)/.exec(parameters);
            const widthFromParams = /width=(\d+)/.exec(parameters);
            const height = heightFromParams ? heightFromParams[1] : '';
            const width = widthFromParams ? widthFromParams[1] : '';
            const widthIsFinite = isFinite(parseInt(width));
            const heightIsFinite = isFinite(parseInt(height));
            if (widthIsFinite) {
                dimensions.push(`width="${width}"`);
            }
            if (heightIsFinite) {
                dimensions.push(`height="${height}"`);
            }
        }
        return { href, dimensions };
    }
    exports.parseHrefAndDimensions = parseHrefAndDimensions;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaHRtbENvbnRlbnQuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9iYXNlL2NvbW1vbi9odG1sQ29udGVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFxQmhHLElBQWtCLDhCQUdqQjtJQUhELFdBQWtCLDhCQUE4QjtRQUMvQyw2RkFBYSxDQUFBO1FBQ2IscUZBQVMsQ0FBQTtJQUNWLENBQUMsRUFIaUIsOEJBQThCLDhDQUE5Qiw4QkFBOEIsUUFHL0M7SUFFRCxNQUFhLGNBQWM7UUFRMUIsWUFDQyxRQUFnQixFQUFFLEVBQ2xCLHFCQUEySSxLQUFLO1lBRWhKLElBQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO1lBQ25CLElBQUksT0FBTyxJQUFJLENBQUMsS0FBSyxLQUFLLFFBQVEsRUFBRTtnQkFDbkMsTUFBTSxJQUFBLHdCQUFlLEVBQUMsT0FBTyxDQUFDLENBQUM7YUFDL0I7WUFFRCxJQUFJLE9BQU8sa0JBQWtCLEtBQUssU0FBUyxFQUFFO2dCQUM1QyxJQUFJLENBQUMsU0FBUyxHQUFHLGtCQUFrQixDQUFDO2dCQUNwQyxJQUFJLENBQUMsaUJBQWlCLEdBQUcsS0FBSyxDQUFDO2dCQUMvQixJQUFJLENBQUMsV0FBVyxHQUFHLEtBQUssQ0FBQzthQUN6QjtpQkFDSTtnQkFDSixJQUFJLENBQUMsU0FBUyxHQUFHLGtCQUFrQixDQUFDLFNBQVMsSUFBSSxTQUFTLENBQUM7Z0JBQzNELElBQUksQ0FBQyxpQkFBaUIsR0FBRyxrQkFBa0IsQ0FBQyxpQkFBaUIsSUFBSSxLQUFLLENBQUM7Z0JBQ3ZFLElBQUksQ0FBQyxXQUFXLEdBQUcsa0JBQWtCLENBQUMsV0FBVyxJQUFJLEtBQUssQ0FBQzthQUMzRDtRQUNGLENBQUM7UUFFRCxVQUFVLENBQUMsS0FBYSxFQUFFLCtEQUF1RjtZQUNoSCxJQUFJLENBQUMsS0FBSyxJQUFJLDBCQUEwQixDQUFDLElB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