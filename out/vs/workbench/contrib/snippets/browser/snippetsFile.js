/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/json", "vs/nls", "vs/base/common/path", "vs/editor/contrib/snippet/browser/snippetParser", "vs/editor/contrib/snippet/browser/snippetVariables", "vs/base/common/async", "vs/base/common/resources", "vs/base/common/types", "vs/base/common/arrays", "vs/base/common/iterator"], function (require, exports, json_1, nls_1, path_1, snippetParser_1, snippetVariables_1, async_1, resources_1, types_1, arrays_1, iterator_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SnippetFile = exports.SnippetSource = exports.Snippet = void 0;
    class SnippetBodyInsights {
        constructor(body) {
            // init with defaults
            this.isBogous = false;
            this.isTrivial = false;
            this.usesClipboardVariable = false;
            this.usesSelectionVariable = false;
            this.codeSnippet = body;
            // check snippet...
            const textmateSnippet = new snippetParser_1.SnippetParser().parse(body, false);
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
                const last = (0, arrays_1.tail)(textmateSnippet.children);
                this.isTrivial = last instanceof snippetParser_1.Placeholder && last.isFinalTabstop;
            }
            const stack = [...textmateSnippet.children];
            while (stack.length > 0) {
                const marker = stack.shift();
                if (marker instanceof snippetParser_1.Variable) {
                    if (marker.children.length === 0 && !snippetVariables_1.KnownSnippetVariableNames[marker.name]) {
                        // a 'variable' without a default value and not being one of our supported
                        // variables is automatically turned into a placeholder. This is to restore
                        // a bug we had before. So `${foo}` becomes `${N:foo}`
                        const index = placeholders.has(marker.name) ? placeholders.get(marker.name) : ++placeholderMax;
                        placeholders.set(marker.name, index);
                        const synthetic = new snippetParser_1.Placeholder(index).appendChild(new snippetParser_1.Text(marker.name));
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
    class Snippet {
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
            this._bodyInsights = new async_1.IdleValue(() => new SnippetBodyInsights(this.body));
        }
        get codeSnippet() {
            return this._bodyInsights.value.codeSnippet;
        }
        get isBogous() {
            return this._bodyInsights.value.isBogous;
        }
        get isTrivial() {
            return this._bodyInsights.value.isTrivial;
        }
        get needsClipboard() {
            return this._bodyInsights.value.usesClipboardVariable;
        }
        get usesSelection() {
            return this._bodyInsights.value.usesSelectionVariable;
        }
    }
    exports.Snippet = Snippet;
    function isJsonSerializedSnippet(thing) {
        return (0, types_1.isObject)(thing) && Boolean(thing.body);
    }
    var SnippetSource;
    (function (SnippetSource) {
        SnippetSource[SnippetSource["User"] = 1] = "User";
        SnippetSource[SnippetSource["Workspace"] = 2] = "Workspace";
        SnippetSource[SnippetSource["Extension"] = 3] = "Extension";
    })(SnippetSource || (exports.SnippetSource = SnippetSource = {}));
    class SnippetFile {
        constructor(source, location, defaultScopes, _extension, _fileService, _extensionResourceLoaderService) {
            this.source = source;
            this.location = location;
            this.defaultScopes = defaultScopes;
            this._extension = _extension;
            this._fileService = _fileService;
            this._extensionResourceLoaderService = _extensionResourceLoaderService;
            this.data = [];
            this.isGlobalSnippets = (0, path_1.extname)(location.path) === '.code-snippets';
            this.isUserSnippets = !this._extension;
        }
        select(selector, bucket) {
            if (this.isGlobalSnippets || !this.isUserSnippets) {
                this._scopeSelect(selector, bucket);
            }
            else {
                this._filepathSelect(selector, bucket);
            }
        }
        _filepathSelect(selector, bucket) {
            // for `fooLang.json` files all snippets are accepted
            if (selector + '.json' === (0, path_1.basename)(this.location.path)) {
                bucket.push(...this.data);
            }
        }
        _scopeSelect(selector, bucket) {
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
                this._scopeSelect(selector.substring(0, idx), bucket);
            }
        }
        async _load() {
            if (this._extension) {
                return this._extensionResourceLoaderService.readExtensionResource(this.location);
            }
            else {
                const content = await this._fileService.readFile(this.location);
                return content.value.toString();
            }
        }
        load() {
            if (!this._loadPromise) {
                this._loadPromise = Promise.resolve(this._load()).then(content => {
                    const data = (0, json_1.parse)(content);
                    if ((0, json_1.getNodeType)(data) === 'object') {
                        for (const [name, scopeOrTemplate] of Object.entries(data)) {
                            if (isJsonSerializedSnippet(scopeOrTemplate)) {
                                this._parseSnippet(name, scopeOrTemplate, this.data);
                            }
                            else {
                                for (const [name, template] of Object.entries(scopeOrTemplate)) {
                                    this._parseSnippet(name, template, this.data);
                                }
                            }
                        }
                    }
                    return this;
                });
            }
            return this._loadPromise;
        }
        reset() {
            this._loadPromise = undefined;
            this.data.length = 0;
        }
        _parseSnippet(name, snippet, bucket) {
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
            if (this._extension) {
                // extension snippet -> show the name of the extension
                source = this._extension.displayName || this._extension.name;
            }
            else if (this.source === 2 /* SnippetSource.Workspace */) {
                // workspace -> only *.code-snippets files
                source = (0, nls_1.localize)('source.workspaceSnippetGlobal', "Workspace Snippet");
            }
            else {
                // user -> global (*.code-snippets) and language snippets
                if (this.isGlobalSnippets) {
                    source = (0, nls_1.localize)('source.userSnippetGlobal', "Global User Snippet");
                }
                else {
                    source = (0, nls_1.localize)('source.userSnippet', "User Snippet");
                }
            }
            for (const _prefix of iterator_1.Iterable.wrap(prefix)) {
                bucket.push(new Snippet(Boolean(isFileTemplate), scopes, name, _prefix, description, body, source, this.source, this._extension ? `${(0, resources_1.relativePath)(this._extension.extensionLocation, this.location)}/${name}` : `${(0, path_1.basename)(this.location.path)}/${name}`, this._extension?.identifier));
            }
        }
    }
    exports.SnippetFile = SnippetFile;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic25pcHBldHNGaWxlLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvc25pcHBldHMvYnJvd3Nlci9zbmlwcGV0c0ZpbGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBaUJoRyxNQUFNLG1CQUFtQjtRQWF4QixZQUFZLElBQVk7WUFFdkIscUJBQXFCO1lBQ3JCLElBQUksQ0FBQyxRQUFRLEdBQUcsS0FBSyxDQUFDO1lBQ3RCLElBQUksQ0FBQyxTQUFTLEdBQUcsS0FBSyxDQUFDO1lBQ3ZCLElBQUksQ0FBQyxxQkFBcUIsR0FBRyxLQUFLLENBQUM7WUFDbkMsSUFBSSxDQUFDLHFCQUFxQixHQUFHLEtBQUssQ0FBQztZQUNuQyxJQUFJLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQztZQUV4QixtQkFBbUI7WUFDbkIsTUFBTSxlQUFlLEdBQUcsSUFBSSw2QkFBYSxFQUFFLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsQ0FBQztZQUUvRCxNQUFNLFlBQVksR0FBRyxJQUFJLEdBQUcsRUFBa0IsQ0FBQztZQUMvQyxJQUFJLGNBQWMsR0FBRyxDQUFDLENBQUM7WUFDdkIsS0FBSyxNQUFNLFdBQVcsSUFBSSxlQUFlLENBQUMsWUFBWSxFQUFFO2dCQUN2RCxjQUFjLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxjQUFjLEVBQUUsV0FBVyxDQUFDLEtBQUssQ0FBQyxDQUFDO2FBQzdEO1lBRUQseUVBQXlFO1lBQ3pFLDhEQUE4RDtZQUM5RCxJQUFJLGVBQWUsQ0FBQyxZQUFZLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtnQkFDOUMsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUM7YUFDdEI7aUJBQU0sSUFBSSxjQUFjLEtBQUssQ0FBQyxFQUFFO2dCQUNoQyxNQUFNLElBQUksR0FBRyxJQUFBLGFBQUksRUFBQyxl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