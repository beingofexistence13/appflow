/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/errors", "vs/base/common/iconLabels", "vs/base/common/resources", "vs/base/common/strings", "vs/base/common/uri"], function (require, exports, errors_1, iconLabels_1, resources_1, strings_1, uri_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$5j = exports.$4j = exports.$3j = exports.$2j = exports.$1j = exports.$Zj = exports.$Yj = exports.$Xj = exports.MarkdownStringTextNewlineStyle = void 0;
    var MarkdownStringTextNewlineStyle;
    (function (MarkdownStringTextNewlineStyle) {
        MarkdownStringTextNewlineStyle[MarkdownStringTextNewlineStyle["Paragraph"] = 0] = "Paragraph";
        MarkdownStringTextNewlineStyle[MarkdownStringTextNewlineStyle["Break"] = 1] = "Break";
    })(MarkdownStringTextNewlineStyle || (exports.MarkdownStringTextNewlineStyle = MarkdownStringTextNewlineStyle = {}));
    class $Xj {
        constructor(value = '', isTrustedOrOptions = false) {
            this.value = value;
            if (typeof this.value !== 'string') {
                throw (0, errors_1.$5)('value');
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
            this.value += $2j(this.supportThemeIcons ? (0, iconLabels_1.$Rj)(value) : value)
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
            this.value += this.c(label, ']');
            this.value += '](';
            this.value += this.c(String(target), ')');
            if (title) {
                this.value += ` "${this.c(this.c(title, '"'), ')')}"`;
            }
            this.value += ')';
            return this;
        }
        c(value, ch) {
            const r = new RegExp((0, strings_1.$qe)(ch), 'g');
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
    exports.$Xj = $Xj;
    function $Yj(oneOrMany) {
        if ($Zj(oneOrMany)) {
            return !oneOrMany.value;
        }
        else if (Array.isArray(oneOrMany)) {
            return oneOrMany.every($Yj);
        }
        else {
            return true;
        }
    }
    exports.$Yj = $Yj;
    function $Zj(thing) {
        if (thing instanceof $Xj) {
            return true;
        }
        else if (thing && typeof thing === 'object') {
            return typeof thing.value === 'string'
                && (typeof thing.isTrusted === 'boolean' || typeof thing.isTrusted === 'object' || thing.isTrusted === undefined)
                && (typeof thing.supportThemeIcons === 'boolean' || thing.supportThemeIcons === undefined);
        }
        return false;
    }
    exports.$Zj = $Zj;
    function $1j(a, b) {
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
                && (a.baseUri === b.baseUri || !!a.baseUri && !!b.baseUri && (0, resources_1.$bg)(uri_1.URI.from(a.baseUri), uri_1.URI.from(b.baseUri)));
        }
    }
    exports.$1j = $1j;
    function $2j(text) {
        // escape markdown syntax tokens: http://daringfireball.net/projects/markdown/syntax#backslash
        return text.replace(/[\\`*_{}[\]()#+\-!~]/g, '\\$&'); // CodeQL [SM02383] Backslash is escaped in the character class
    }
    exports.$2j = $2j;
    function $3j(input) {
        return input.replace(/"/g, '&quot;');
    }
    exports.$3j = $3j;
    function $4j(text) {
        if (!text) {
            return text;
        }
        return text.replace(/\\([\\`*_{}[\]()#+\-.!~])/g, '$1');
    }
    exports.$4j = $4j;
    function $5j(href) {
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
    exports.$5j = $5j;
});
//# sourceMappingURL=htmlContent.js.map