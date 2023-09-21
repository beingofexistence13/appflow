/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/dompurify/dompurify", "vs/base/browser/event", "vs/base/browser/formattedTextRenderer", "vs/base/browser/keyboardEvent", "vs/base/browser/mouseEvent", "vs/base/browser/ui/iconLabel/iconLabels", "vs/base/common/errors", "vs/base/common/event", "vs/base/common/htmlContent", "vs/base/common/iconLabels", "vs/base/common/idGenerator", "vs/base/common/lazy", "vs/base/common/lifecycle", "vs/base/common/marked/marked", "vs/base/common/marshalling", "vs/base/common/network", "vs/base/common/objects", "vs/base/common/resources", "vs/base/common/strings", "vs/base/common/uri"], function (require, exports, DOM, dompurify, event_1, formattedTextRenderer_1, keyboardEvent_1, mouseEvent_1, iconLabels_1, errors_1, event_2, htmlContent_1, iconLabels_2, idGenerator_1, lazy_1, lifecycle_1, marked_1, marshalling_1, network_1, objects_1, resources_1, strings_1, uri_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.fillInIncompleteTokens = exports.renderMarkdownAsPlaintext = exports.renderStringAsPlaintext = exports.allowedMarkdownAttr = exports.renderMarkdown = void 0;
    const defaultMarkedRenderers = Object.freeze({
        image: (href, title, text) => {
            let dimensions = [];
            let attributes = [];
            if (href) {
                ({ href, dimensions } = (0, htmlContent_1.parseHrefAndDimensions)(href));
                attributes.push(`src="${(0, htmlContent_1.escapeDoubleQuotes)(href)}"`);
            }
            if (text) {
                attributes.push(`alt="${(0, htmlContent_1.escapeDoubleQuotes)(text)}"`);
            }
            if (title) {
                attributes.push(`title="${(0, htmlContent_1.escapeDoubleQuotes)(title)}"`);
            }
            if (dimensions.length) {
                attributes = attributes.concat(dimensions);
            }
            return '<img ' + attributes.join(' ') + '>';
        },
        paragraph: (text) => {
            return `<p>${text}</p>`;
        },
        link: (href, title, text) => {
            if (typeof href !== 'string') {
                return '';
            }
            // Remove markdown escapes. Workaround for https://github.com/chjj/marked/issues/829
            if (href === text) { // raw link case
                text = (0, htmlContent_1.removeMarkdownEscapes)(text);
            }
            title = typeof title === 'string' ? (0, htmlContent_1.escapeDoubleQuotes)((0, htmlContent_1.removeMarkdownEscapes)(title)) : '';
            href = (0, htmlContent_1.removeMarkdownEscapes)(href);
            // HTML Encode href
            href = href.replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#39;');
            return `<a href="${href}" title="${title || href}">${text}</a>`;
        },
    });
    /**
     * Low-level way create a html element from a markdown string.
     *
     * **Note** that for most cases you should be using [`MarkdownRenderer`](./src/vs/editor/contrib/markdownRenderer/browser/markdownRenderer.ts)
     * which comes with support for pretty code block rendering and which uses the default way of handling links.
     */
    function renderMarkdown(markdown, options = {}, markedOptions = {}) {
        const disposables = new lifecycle_1.DisposableStore();
        let isDisposed = false;
        const element = (0, formattedTextRenderer_1.createElement)(options);
        const _uriMassage = function (part) {
            let data;
            try {
                data = (0, marshalling_1.parse)(decodeURIComponent(part));
            }
            catch (e) {
                // ignore
            }
            if (!data) {
                return part;
            }
            data = (0, objects_1.cloneAndChange)(data, value => {
                if (markdown.uris && markdown.uris[value]) {
                    return uri_1.URI.revive(markdown.uris[value]);
                }
                else {
                    return undefined;
                }
            });
            return encodeURIComponent(JSON.stringify(data));
        };
        const _href = function (href, isDomUri) {
            const data = markdown.uris && markdown.uris[href];
            let uri = uri_1.URI.revive(data);
            if (isDomUri) {
                if (href.startsWith(network_1.Schemas.data + ':')) {
                    return href;
                }
                if (!uri) {
                    uri = uri_1.URI.parse(href);
                }
                // this URI will end up as "src"-attribute of a dom node
                // and because of that special rewriting needs to be done
                // so that the URI uses a protocol that's understood by
                // browsers (like http or https)
                return network_1.FileAccess.uriToBrowserUri(uri).toString(true);
            }
            if (!uri) {
                return href;
            }
            if (uri_1.URI.parse(href).toString() === uri.toString()) {
                return href; // no transformation performed
            }
            if (uri.query) {
                uri = uri.with({ query: _uriMassage(uri.query) });
            }
            return uri.toString();
        };
        const renderer = new marked_1.marked.Renderer();
        renderer.image = defaultMarkedRenderers.image;
        renderer.link = defaultMarkedRenderers.link;
        renderer.paragraph = defaultMarkedRenderers.paragraph;
        // Will collect [id, renderedElement] tuples
        const codeBlocks = [];
        const syncCodeBlocks = [];
        if (options.codeBlockRendererSync) {
            renderer.code = (code, lang) => {
                const id = idGenerator_1.defaultGenerator.nextId();
                const value = options.codeBlockRendererSync(postProcessCodeBlockLanguageId(lang), code);
                syncCodeBlocks.push([id, value]);
                return `<div class="code" data-code="${id}">${(0, strings_1.escape)(code)}</div>`;
            };
        }
        else if (options.codeBlockRenderer) {
            renderer.code = (code, lang) => {
                const id = idGenerator_1.defaultGenerator.nextId();
                const value = options.codeBlockRenderer(postProcessCodeBlockLanguageId(lang), code);
                codeBlocks.push(value.then(element => [id, element]));
                return `<div class="code" data-code="${id}">${(0, strings_1.escape)(code)}</div>`;
            };
        }
        if (options.actionHandler) {
            const _activateLink = function (event) {
                let target = event.target;
                if (target.tagName !== 'A') {
                    target = target.parentElement;
                    if (!target || target.tagName !== 'A') {
                        return;
                    }
                }
                try {
                    let href = target.dataset['href'];
                    if (href) {
                        if (markdown.baseUri) {
                            href = resolveWithBaseUri(uri_1.URI.from(markdown.baseUri), href);
                        }
                        options.actionHandler.callback(href, event);
                    }
                }
                catch (err) {
                    (0, errors_1.onUnexpectedError)(err);
                }
                finally {
                    event.preventDefault();
                }
            };
            const onClick = options.actionHandler.disposables.add(new event_1.DomEmitter(element, 'click'));
            const onAuxClick = options.actionHandler.disposables.add(new event_1.DomEmitter(element, 'auxclick'));
            options.actionHandler.disposables.add(event_2.Event.any(onClick.event, onAuxClick.event)(e => {
                const mouseEvent = new mouseEvent_1.StandardMouseEvent(e);
                if (!mouseEvent.leftButton && !mouseEvent.middleButton) {
                    return;
                }
                _activateLink(mouseEvent);
            }));
            options.actionHandler.disposables.add(DOM.addDisposableListener(element, 'keydown', (e) => {
                const keyboardEvent = new keyboardEvent_1.StandardKeyboardEvent(e);
                if (!keyboardEvent.equals(10 /* KeyCode.Space */) && !keyboardEvent.equals(3 /* KeyCode.Enter */)) {
                    return;
                }
                _activateLink(keyboardEvent);
            }));
        }
        if (!markdown.supportHtml) {
            // TODO: Can we deprecated this in favor of 'supportHtml'?
            // Use our own sanitizer so that we can let through only spans.
            // Otherwise, we'd be letting all html be rendered.
            // If we want to allow markdown permitted tags, then we can delete sanitizer and sanitize.
            // We always pass the output through dompurify after this so that we don't rely on
            // marked for sanitization.
            markedOptions.sanitizer = (html) => {
                const match = markdown.isTrusted ? html.match(/^(<span[^>]+>)|(<\/\s*span>)$/) : undefined;
                return match ? html : '';
            };
            markedOptions.sanitize = true;
            markedOptions.silent = true;
        }
        markedOptions.renderer = renderer;
        // values that are too long will freeze the UI
        let value = markdown.value ?? '';
        if (value.length > 100000) {
            value = `${value.substr(0, 100000)}…`;
        }
        // escape theme icons
        if (markdown.supportThemeIcons) {
            value = (0, iconLabels_2.markdownEscapeEscapedIcons)(value);
        }
        let renderedMarkdown;
        if (options.fillInIncompleteTokens) {
            // The defaults are applied by parse but not lexer()/parser(), and they need to be present
            const opts = {
                ...marked_1.marked.defaults,
                ...markedOptions
            };
            const tokens = marked_1.marked.lexer(value, opts);
            const newTokens = fillInIncompleteTokens(tokens);
            renderedMarkdown = marked_1.marked.parser(newTokens, opts);
        }
        else {
            renderedMarkdown = marked_1.marked.parse(value, markedOptions);
        }
        // Rewrite theme icons
        if (markdown.supportThemeIcons) {
            const elements = (0, iconLabels_1.renderLabelWithIcons)(renderedMarkdown);
            renderedMarkdown = elements.map(e => typeof e === 'string' ? e : e.outerHTML).join('');
        }
        const htmlParser = new DOMParser();
        const markdownHtmlDoc = htmlParser.parseFromString(sanitizeRenderedMarkdown(markdown, renderedMarkdown), 'text/html');
        markdownHtmlDoc.body.querySelectorAll('img')
            .forEach(img => {
            const src = img.getAttribute('src'); // Get the raw 'src' attribute value as text, not the resolved 'src'
            if (src) {
                let href = src;
                try {
                    if (markdown.baseUri) { // absolute or relative local path, or file: uri
                        href = resolveWithBaseUri(uri_1.URI.from(markdown.baseUri), href);
                    }
                }
                catch (err) { }
                img.src = _href(href, true);
            }
        });
        markdownHtmlDoc.body.querySelectorAll('a')
            .forEach(a => {
            const href = a.getAttribute('href'); // Get the raw 'href' attribute value as text, not the resolved 'href'
            a.setAttribute('href', ''); // Clear out href. We use the `data-href` for handling clicks instead
            if (!href
                || /^data:|javascript:/i.test(href)
                || (/^command:/i.test(href) && !markdown.isTrusted)
                || /^command:(\/\/\/)?_workbench\.downloadResource/i.test(href)) {
                // drop the link
                a.replaceWith(...a.childNodes);
            }
            else {
                let resolvedHref = _href(href, false);
                if (markdown.baseUri) {
                    resolvedHref = resolveWithBaseUri(uri_1.URI.from(markdown.baseUri), href);
                }
                a.dataset.href = resolvedHref;
            }
        });
        element.innerHTML = sanitizeRenderedMarkdown(markdown, markdownHtmlDoc.body.innerHTML);
        if (codeBlocks.length > 0) {
            Promise.all(codeBlocks).then((tuples) => {
                if (isDisposed) {
                    return;
                }
                const renderedElements = new Map(tuples);
                const placeholderElements = element.querySelectorAll(`div[data-code]`);
                for (const placeholderElement of placeholderElements) {
                    const renderedElement = renderedElements.get(placeholderElement.dataset['code'] ?? '');
                    if (renderedElement) {
                        DOM.reset(placeholderElement, renderedElement);
                    }
                }
                options.asyncRenderCallback?.();
            });
        }
        else if (syncCodeBlocks.length > 0) {
            const renderedElements = new Map(syncCodeBlocks);
            const placeholderElements = element.querySelectorAll(`div[data-code]`);
            for (const placeholderElement of placeholderElements) {
                const renderedElement = renderedElements.get(placeholderElement.dataset['code'] ?? '');
                if (renderedElement) {
                    DOM.reset(placeholderElement, renderedElement);
                }
            }
        }
        // signal size changes for image tags
        if (options.asyncRenderCallback) {
            for (const img of element.getElementsByTagName('img')) {
                const listener = disposables.add(DOM.addDisposableListener(img, 'load', () => {
                    listener.dispose();
                    options.asyncRenderCallback();
                }));
            }
        }
        return {
            element,
            dispose: () => {
                isDisposed = true;
                disposables.dispose();
            }
        };
    }
    exports.renderMarkdown = renderMarkdown;
    function postProcessCodeBlockLanguageId(lang) {
        if (!lang) {
            return '';
        }
        const parts = lang.split(/[\s+|:|,|\{|\?]/, 1);
        if (parts.length) {
            return parts[0];
        }
        return lang;
    }
    function resolveWithBaseUri(baseUri, href) {
        const hasScheme = /^\w[\w\d+.-]*:/.test(href);
        if (hasScheme) {
            return href;
        }
        if (baseUri.path.endsWith('/')) {
            return (0, resources_1.resolvePath)(baseUri, href).toString();
        }
        else {
            return (0, resources_1.resolvePath)((0, resources_1.dirname)(baseUri), href).toString();
        }
    }
    function sanitizeRenderedMarkdown(options, renderedMarkdown) {
        const { config, allowedSchemes } = getSanitizerOptions(options);
        dompurify.addHook('uponSanitizeAttribute', (element, e) => {
            if (e.attrName === 'style' || e.attrName === 'class') {
                if (element.tagName === 'SPAN') {
                    if (e.attrName === 'style') {
                        e.keepAttr = /^(color\:(#[0-9a-fA-F]+|var\(--vscode(-[a-zA-Z]+)+\));)?(background-color\:(#[0-9a-fA-F]+|var\(--vscode(-[a-zA-Z]+)+\));)?$/.test(e.attrValue);
                        return;
                    }
                    else if (e.attrName === 'class') {
                        e.keepAttr = /^codicon codicon-[a-z\-]+( codicon-modifier-[a-z\-]+)?$/.test(e.attrValue);
                        return;
                    }
                }
                e.keepAttr = false;
                return;
            }
        });
        const hook = DOM.hookDomPurifyHrefAndSrcSanitizer(allowedSchemes);
        try {
            return dompurify.sanitize(renderedMarkdown, { ...config, RETURN_TRUSTED_TYPE: true });
        }
        finally {
            dompurify.removeHook('uponSanitizeAttribute');
            hook.dispose();
        }
    }
    exports.allowedMarkdownAttr = [
        'align',
        'autoplay',
        'alt',
        'class',
        'controls',
        'data-code',
        'data-href',
        'height',
        'href',
        'loop',
        'muted',
        'playsinline',
        'poster',
        'src',
        'style',
        'target',
        'title',
        'width',
        'start',
    ];
    function getSanitizerOptions(options) {
        const allowedSchemes = [
            network_1.Schemas.http,
            network_1.Schemas.https,
            network_1.Schemas.mailto,
            network_1.Schemas.data,
            network_1.Schemas.file,
            network_1.Schemas.vscodeFileResource,
            network_1.Schemas.vscodeRemote,
            network_1.Schemas.vscodeRemoteResource,
        ];
        if (options.isTrusted) {
            allowedSchemes.push(network_1.Schemas.command);
        }
        return {
            config: {
                // allowedTags should included everything that markdown renders to.
                // Since we have our own sanitize function for marked, it's possible we missed some tag so let dompurify make sure.
                // HTML tags that can result from markdown are from reading https://spec.commonmark.org/0.29/
                // HTML table tags that can result from markdown are from https://github.github.com/gfm/#tables-extension-
                ALLOWED_TAGS: [...DOM.basicMarkupHtmlTags],
                ALLOWED_ATTR: exports.allowedMarkdownAttr,
                ALLOW_UNKNOWN_PROTOCOLS: true,
            },
            allowedSchemes
        };
    }
    /**
     * Strips all markdown from `string`, if it's an IMarkdownString. For example
     * `# Header` would be output as `Header`. If it's not, the string is returned.
     */
    function renderStringAsPlaintext(string) {
        return typeof string === 'string' ? string : renderMarkdownAsPlaintext(string);
    }
    exports.renderStringAsPlaintext = renderStringAsPlaintext;
    /**
     * Strips all markdown from `markdown`. For example `# Header` would be output as `Header`.
     */
    function renderMarkdownAsPlaintext(markdown) {
        // values that are too long will freeze the UI
        let value = markdown.value ?? '';
        if (value.length > 100000) {
            value = `${value.substr(0, 100000)}…`;
        }
        const html = marked_1.marked.parse(value, { renderer: plainTextRenderer.value }).replace(/&(#\d+|[a-zA-Z]+);/g, m => unescapeInfo.get(m) ?? m);
        return sanitizeRenderedMarkdown({ isTrusted: false }, html).toString();
    }
    exports.renderMarkdownAsPlaintext = renderMarkdownAsPlaintext;
    const unescapeInfo = new Map([
        ['&quot;', '"'],
        ['&nbsp;', ' '],
        ['&amp;', '&'],
        ['&#39;', '\''],
        ['&lt;', '<'],
        ['&gt;', '>'],
    ]);
    const plainTextRenderer = new lazy_1.Lazy(() => {
        const renderer = new marked_1.marked.Renderer();
        renderer.code = (code) => {
            return code;
        };
        renderer.blockquote = (quote) => {
            return quote;
        };
        renderer.html = (_html) => {
            return '';
        };
        renderer.heading = (text, _level, _raw) => {
            return text + '\n';
        };
        renderer.hr = () => {
            return '';
        };
        renderer.list = (body, _ordered) => {
            return body;
        };
        renderer.listitem = (text) => {
            return text + '\n';
        };
        renderer.paragraph = (text) => {
            return text + '\n';
        };
        renderer.table = (header, body) => {
            return header + body + '\n';
        };
        renderer.tablerow = (content) => {
            return content;
        };
        renderer.tablecell = (content, _flags) => {
            return content + ' ';
        };
        renderer.strong = (text) => {
            return text;
        };
        renderer.em = (text) => {
            return text;
        };
        renderer.codespan = (code) => {
            return code;
        };
        renderer.br = () => {
            return '\n';
        };
        renderer.del = (text) => {
            return text;
        };
        renderer.image = (_href, _title, _text) => {
            return '';
        };
        renderer.text = (text) => {
            return text;
        };
        renderer.link = (_href, _title, text) => {
            return text;
        };
        return renderer;
    });
    function mergeRawTokenText(tokens) {
        let mergedTokenText = '';
        tokens.forEach(token => {
            mergedTokenText += token.raw;
        });
        return mergedTokenText;
    }
    function completeSingleLinePattern(token) {
        for (const subtoken of token.tokens) {
            if (subtoken.type === 'text') {
                const lines = subtoken.raw.split('\n');
                const lastLine = lines[lines.length - 1];
                if (lastLine.includes('`')) {
                    return completeCodespan(token);
                }
                else if (lastLine.includes('**')) {
                    return completeDoublestar(token);
                }
                else if (lastLine.match(/\*\w/)) {
                    return completeStar(token);
                }
                else if (lastLine.match(/(^|\s)__\w/)) {
                    return completeDoubleUnderscore(token);
                }
                else if (lastLine.match(/(^|\s)_\w/)) {
                    return completeUnderscore(token);
                }
                else if (lastLine.match(/(^|\s)\[.*\]\(\w*/)) {
                    return completeLinkTarget(token);
                }
                else if (lastLine.match(/(^|\s)\[\w/)) {
                    return completeLinkText(token);
                }
            }
        }
        return undefined;
    }
    // function completeListItemPattern(token: marked.Tokens.List): marked.Tokens.List | undefined {
    // 	// Patch up this one list item
    // 	const lastItem = token.items[token.items.length - 1];
    // 	const newList = completeSingleLinePattern(lastItem);
    // 	if (!newList || newList.type !== 'list') {
    // 		// Nothing to fix, or not a pattern we were expecting
    // 		return;
    // 	}
    // 	// Re-parse the whole list with the last item replaced
    // 	const completeList = marked.lexer(mergeRawTokenText(token.items.slice(0, token.items.length - 1)) + newList.items[0].raw);
    // 	if (completeList.length === 1 && completeList[0].type === 'list') {
    // 		return completeList[0];
    // 	}
    // 	// Not a pattern we were expecting
    // 	return undefined;
    // }
    function fillInIncompleteTokens(tokens) {
        let i;
        let newTokens;
        for (i = 0; i < tokens.length; i++) {
            const token = tokens[i];
            if (token.type === 'paragraph' && token.raw.match(/(\n|^)```/)) {
                // If the code block was complete, it would be in a type='code'
                newTokens = completeCodeBlock(tokens.slice(i));
                break;
            }
            if (token.type === 'paragraph' && token.raw.match(/(\n|^)\|/)) {
                newTokens = completeTable(tokens.slice(i));
                break;
            }
            // if (i === tokens.length - 1 && token.type === 'list') {
            // 	const newListToken = completeListItemPattern(token);
            // 	if (newListToken) {
            // 		newTokens = [newListToken];
            // 		break;
            // 	}
            // }
            if (i === tokens.length - 1 && token.type === 'paragraph') {
                // Only operates on a single token, because any newline that follows this should break these patterns
                const newToken = completeSingleLinePattern(token);
                if (newToken) {
                    newTokens = [newToken];
                    break;
                }
            }
        }
        if (newTokens) {
            const newTokensList = [
                ...tokens.slice(0, i),
                ...newTokens
            ];
            newTokensList.links = tokens.links;
            return newTokensList;
        }
        return tokens;
    }
    exports.fillInIncompleteTokens = fillInIncompleteTokens;
    function completeCodeBlock(tokens) {
        const mergedRawText = mergeRawTokenText(tokens);
        return marked_1.marked.lexer(mergedRawText + '\n```');
    }
    function completeCodespan(token) {
        return completeWithString(token, '`');
    }
    function completeStar(tokens) {
        return completeWithString(tokens, '*');
    }
    function completeUnderscore(tokens) {
        return completeWithString(tokens, '_');
    }
    function completeLinkTarget(tokens) {
        return completeWithString(tokens, ')');
    }
    function completeLinkText(tokens) {
        return completeWithString(tokens, '](about:blank)');
    }
    function completeDoublestar(tokens) {
        return completeWithString(tokens, '**');
    }
    function completeDoubleUnderscore(tokens) {
        return completeWithString(tokens, '__');
    }
    function completeWithString(tokens, closingString) {
        const mergedRawText = mergeRawTokenText(Array.isArray(tokens) ? tokens : [tokens]);
        // If it was completed correctly, this should be a single token.
        // Expecting either a Paragraph or a List
        return marked_1.marked.lexer(mergedRawText + closingString)[0];
    }
    function completeTable(tokens) {
        const mergedRawText = mergeRawTokenText(tokens);
        const lines = mergedRawText.split('\n');
        let numCols; // The number of line1 col headers
        let hasSeparatorRow = false;
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (typeof numCols === 'undefined' && line.match(/^\s*\|/)) {
                const line1Matches = line.match(/(\|[^\|]+)(?=\||$)/g);
                if (line1Matches) {
                    numCols = line1Matches.length;
                }
            }
            else if (typeof numCols === 'number') {
                if (line.match(/^\s*\|/)) {
                    if (i !== lines.length - 1) {
                        // We got the line1 header row, and the line2 separator row, but there are more lines, and it wasn't parsed as a table!
                        // That's strange and means that the table is probably malformed in the source, so I won't try to patch it up.
                        return undefined;
                    }
                    // Got a line2 separator row- partial or complete, doesn't matter, we'll replace it with a correct one
                    hasSeparatorRow = true;
                }
                else {
                    // The line after the header row isn't a valid separator row, so the table is malformed, don't fix it up
                    return undefined;
                }
            }
        }
        if (typeof numCols === 'number' && numCols > 0) {
            const prefixText = hasSeparatorRow ? lines.slice(0, -1).join('\n') : mergedRawText;
            const line1EndsInPipe = !!prefixText.match(/\|\s*$/);
            const newRawText = prefixText + (line1EndsInPipe ? '' : '|') + `\n|${' --- |'.repeat(numCols)}`;
            return marked_1.marked.lexer(newRawText);
        }
        return undefined;
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFya2Rvd25SZW5kZXJlci5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL2Jhc2UvYnJvd3Nlci9tYXJrZG93blJlbmRlcmVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQW9DaEcsTUFBTSxzQkFBc0IsR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDO1FBQzVDLEtBQUssRUFBRSxDQUFDLElBQW1CLEVBQUUsS0FBb0IsRUFBRSxJQUFZLEVBQVUsRUFBRTtZQUMxRSxJQUFJLFVBQVUsR0FBYSxFQUFFLENBQUM7WUFDOUIsSUFBSSxVQUFVLEdBQWEsRUFBRSxDQUFDO1lBQzlCLElBQUksSUFBSSxFQUFFO2dCQUNULENBQUMsRUFBRSxJQUFJLEVBQUUsVUFBVSxFQUFFLEdBQUcsSUFBQSxvQ0FBc0IsRUFBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO2dCQUN0RCxVQUFVLENBQUMsSUFBSSxDQUFDLFFBQVEsSUFBQSxnQ0FBa0IsRUFBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7YUFDckQ7WUFDRCxJQUFJLElBQUksRUFBRTtnQkFDVCxVQUFVLENBQUMsSUFBSSxDQUFDLFFBQVEsSUFBQSxnQ0FBa0IsRUFBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7YUFDckQ7WUFDRCxJQUFJLEtBQUssRUFBRTtnQkFDVixVQUFVLENBQUMsSUFBSSxDQUFDLFVBQVUsSUFBQSxnQ0FBa0IsRUFBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7YUFDeEQ7WUFDRCxJQUFJLFVBQVUsQ0FBQyxNQUFNLEVBQUU7Z0JBQ3RCLFVBQVUsR0FBRyxVQUFVLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxDQUFDO2FBQzNDO1lBQ0QsT0FBTyxPQUFPLEdBQUcsVUFBVSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxHQUFHLENBQUM7UUFDN0MsQ0FBQztRQUVELFNBQVMsRUFBRSxD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