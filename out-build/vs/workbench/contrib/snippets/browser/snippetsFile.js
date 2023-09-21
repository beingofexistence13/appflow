/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/json", "vs/nls!vs/workbench/contrib/snippets/browser/snippetsFile", "vs/base/common/path", "vs/editor/contrib/snippet/browser/snippetParser", "vs/editor/contrib/snippet/browser/snippetVariables", "vs/base/common/async", "vs/base/common/resources", "vs/base/common/types", "vs/base/common/arrays", "vs/base/common/iterator"], function (require, exports, json_1, nls_1, path_1, snippetParser_1, snippetVariables_1, async_1, resources_1, types_1, arrays_1, iterator_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$_lb = exports.SnippetSource = exports.$$lb = void 0;
    class SnippetBodyInsights {
        constructor(body) {
            // init with defaults
            this.isBogous = false;
            this.isTrivial = false;
            this.usesClipboardVariable = false;
            this.usesSelectionVariable = false;
            this.codeSnippet = body;
            // check snippet...
            const textmateSnippet = new snippetParser_1.$G5().parse(body, false);
            const placeholders = new Map();
            let placeholderMax = 0;
            for (const placeholder of textmateSnippet.placeholders) {
                placeholderMax = Math.max(placeholderMax, placeholder.index);
            }
            // mark snippet as trivial when there is no placeholders or when the only
            // placeholder is the final tabstop and it is at the very end.
            if (textmateSnippet.placeholders.length === 0) {
                this.isTrivial = true;
            }
            else if (placeholderMax === 0) {
                const last = (0, arrays_1.$qb)(textmateSnippet.children);
                this.isTrivial = last instanceof snippetParser_1.$A5 && last.isFinalTabstop;
            }
            const stack = [...textmateSnippet.children];
            while (stack.length > 0) {
                const marker = stack.shift();
                if (marker instanceof snippetParser_1.$E5) {
                    if (marker.children.length === 0 && !snippetVariables_1.$b6[marker.name]) {
                        // a 'variable' without a default value and not being one of our supported
                        // variables is automatically turned into a placeholder. This is to restore
                        // a bug we had before. So `${foo}` becomes `${N:foo}`
                        const index = placeholders.has(marker.name) ? placeholders.get(marker.name) : ++placeholderMax;
                        placeholders.set(marker.name, index);
                        const synthetic = new snippetParser_1.$A5(index).appendChild(new snippetParser_1.$y5(marker.name));
                        textmateSnippet.replace(marker, [synthetic]);
                        this.isBogous = true;
                    }
                    switch (marker.name) {
                        case 'CLIPBOARD':
                            this.usesClipboardVariable = true;
                            break;
                        case 'SELECTION':
                        case 'TM_SELECTED_TEXT':
                            this.usesSelectionVariable = true;
                            break;
                    }
                }
                else {
                    // recurse
                    stack.push(...marker.children);
                }
            }
            if (this.isBogous) {
                this.codeSnippet = textmateSnippet.toTextmateString();
            }
        }
    }
    class $$lb {
        constructor(isFileTemplate, scopes, name, prefix, description, body, source, snippetSource, snippetIdentifier, extensionId) {
            this.isFileTemplate = isFileTemplate;
            this.scopes = scopes;
            this.name = name;
            this.prefix = prefix;
            this.description = description;
            this.body = body;
            this.source = source;
            this.snippetSource = snippetSource;
            this.snippetIdentifier = snippetIdentifier;
            this.extensionId = extensionId;
            this.prefixLow = prefix.toLowerCase();
            this.a = new async_1.$Xg(() => new SnippetBodyInsights(this.body));
        }
        get codeSnippet() {
            return this.a.value.codeSnippet;
        }
        get isBogous() {
            return this.a.value.isBogous;
        }
        get isTrivial() {
            return this.a.value.isTrivial;
        }
        get needsClipboard() {
            return this.a.value.usesClipboardVariable;
        }
        get usesSelection() {
            return this.a.value.usesSelectionVariable;
        }
    }
    exports.$$lb = $$lb;
    function isJsonSerializedSnippet(thing) {
        return (0, types_1.$lf)(thing) && Boolean(thing.body);
    }
    var SnippetSource;
    (function (SnippetSource) {
        SnippetSource[SnippetSource["User"] = 1] = "User";
        SnippetSource[SnippetSource["Workspace"] = 2] = "Workspace";
        SnippetSource[SnippetSource["Extension"] = 3] = "Extension";
    })(SnippetSource || (exports.SnippetSource = SnippetSource = {}));
    class $_lb {
        constructor(source, location, defaultScopes, b, c, d) {
            this.source = source;
            this.location = location;
            this.defaultScopes = defaultScopes;
            this.b = b;
            this.c = c;
            this.d = d;
            this.data = [];
            this.isGlobalSnippets = (0, path_1.$be)(location.path) === '.code-snippets';
            this.isUserSnippets = !this.b;
        }
        select(selector, bucket) {
            if (this.isGlobalSnippets || !this.isUserSnippets) {
                this.f(selector, bucket);
            }
            else {
                this.e(selector, bucket);
            }
        }
        e(selector, bucket) {
            // for `fooLang.json` files all snippets are accepted
            if (selector + '.json' === (0, path_1.$ae)(this.location.path)) {
                bucket.push(...this.data);
            }
        }
        f(selector, bucket) {
            // for `my.code-snippets` files we need to look at each snippet
            for (const snippet of this.data) {
                const len = snippet.scopes.length;
                if (len === 0) {
                    // always accept
                    bucket.push(snippet);
                }
                else {
                    for (let i = 0; i < len; i++) {
                        // match
                        if (snippet.scopes[i] === selector) {
                            bucket.push(snippet);
                            break; // match only once!
                        }
                    }
                }
            }
            const idx = selector.lastIndexOf('.');
            if (idx >= 0) {
                this.f(selector.substring(0, idx), bucket);
            }
        }
        async g() {
            if (this.b) {
                return this.d.readExtensionResource(this.location);
            }
            else {
                const content = await this.c.readFile(this.location);
                return content.value.toString();
            }
        }
        load() {
            if (!this.a) {
                this.a = Promise.resolve(this.g()).then(content => {
                    const data = (0, json_1.$Lm)(content);
                    if ((0, json_1.$Um)(data) === 'object') {
                        for (const [name, scopeOrTemplate] of Object.entries(data)) {
                            if (isJsonSerializedSnippet(scopeOrTemplate)) {
                                this.h(name, scopeOrTemplate, this.data);
                            }
                            else {
                                for (const [name, template] of Object.entries(scopeOrTemplate)) {
                                    this.h(name, template, this.data);
                                }
                            }
                        }
                    }
                    return this;
                });
            }
            return this.a;
        }
        reset() {
            this.a = undefined;
            this.data.length = 0;
        }
        h(name, snippet, bucket) {
            let { isFileTemplate, prefix, body, description } = snippet;
            if (!prefix) {
                prefix = '';
            }
            if (Array.isArray(body)) {
                body = body.join('\n');
            }
            if (typeof body !== 'string') {
                return;
            }
            if (Array.isArray(description)) {
                description = description.join('\n');
            }
            let scopes;
            if (this.defaultScopes) {
                scopes = this.defaultScopes;
            }
            else if (typeof snippet.scope === 'string') {
                scopes = snippet.scope.split(',').map(s => s.trim()).filter(Boolean);
            }
            else {
                scopes = [];
            }
            let source;
            if (this.b) {
                // extension snippet -> show the name of the extension
                source = this.b.displayName || this.b.name;
            }
            else if (this.source === 2 /* SnippetSource.Workspace */) {
                // workspace -> only *.code-snippets files
                source = (0, nls_1.localize)(0, null);
            }
            else {
                // user -> global (*.code-snippets) and language snippets
                if (this.isGlobalSnippets) {
                    source = (0, nls_1.localize)(1, null);
                }
                else {
                    source = (0, nls_1.localize)(2, null);
                }
            }
            for (const _prefix of iterator_1.Iterable.wrap(prefix)) {
                bucket.push(new $$lb(Boolean(isFileTemplate), scopes, name, _prefix, description, body, source, this.source, this.b ? `${(0, resources_1.$kg)(this.b.extensionLocation, this.location)}/${name}` : `${(0, path_1.$ae)(this.location.path)}/${name}`, this.b?.identifier));
            }
        }
    }
    exports.$_lb = $_lb;
});
//# sourceMappingURL=snippetsFile.js.map