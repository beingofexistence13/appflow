/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/dompurify/dompurify", "vs/base/browser/event", "vs/base/browser/formattedTextRenderer", "vs/base/browser/keyboardEvent", "vs/base/browser/mouseEvent", "vs/base/browser/ui/iconLabel/iconLabels", "vs/base/common/errors", "vs/base/common/event", "vs/base/common/htmlContent", "vs/base/common/iconLabels", "vs/base/common/idGenerator", "vs/base/common/lazy", "vs/base/common/lifecycle", "vs/base/common/marked/marked", "vs/base/common/marshalling", "vs/base/common/network", "vs/base/common/objects", "vs/base/common/resources", "vs/base/common/strings", "vs/base/common/uri"], function (require, exports, DOM, dompurify, event_1, formattedTextRenderer_1, keyboardEvent_1, mouseEvent_1, iconLabels_1, errors_1, event_2, htmlContent_1, iconLabels_2, idGenerator_1, lazy_1, lifecycle_1, marked_1, marshalling_1, network_1, objects_1, resources_1, strings_1, uri_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$DQ = exports.$CQ = exports.$BQ = exports.$AQ = exports.$zQ = void 0;
    const defaultMarkedRenderers = Object.freeze({
        image: (href, title, text) => {
            let dimensions = [];
            let attributes = [];
            if (href) {
                ({ href, dimensions } = (0, htmlContent_1.$5j)(href));
                attributes.push(`src="${(0, htmlContent_1.$3j)(href)}"`);
            }
            if (text) {
                attributes.push(`alt="${(0, htmlContent_1.$3j)(text)}"`);
            }
            if (title) {
                attributes.push(`title="${(0, htmlContent_1.$3j)(title)}"`);
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
                text = (0, htmlContent_1.$4j)(text);
            }
            title = typeof title === 'string' ? (0, htmlContent_1.$3j)((0, htmlContent_1.$4j)(title)) : '';
            href = (0, htmlContent_1.$4j)(href);
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
    function $zQ(markdown, options = {}, markedOptions = {}) {
        const disposables = new lifecycle_1.$jc();
        let isDisposed = false;
        const element = (0, formattedTextRenderer_1.$8P)(options);
        const _uriMassage = function (part) {
            let data;
            try {
                data = (0, marshalling_1.$0g)(decodeURIComponent(part));
            }
            catch (e) {
                // ignore
            }
            if (!data) {
                return part;
            }
            data = (0, objects_1.$Xm)(data, value => {
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
                return network_1.$2f.uriToBrowserUri(uri).toString(true);
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
                const id = idGenerator_1.$8L.nextId();
                const value = options.codeBlockRendererSync(postProcessCodeBlockLanguageId(lang), code);
                syncCodeBlocks.push([id, value]);
                return `<div class="code" data-code="${id}">${(0, strings_1.$pe)(code)}</div>`;
            };
        }
        else if (options.codeBlockRenderer) {
            renderer.code = (code, lang) => {
                const id = idGenerator_1.$8L.nextId();
                const value = options.codeBlockRenderer(postProcessCodeBlockLanguageId(lang), code);
                codeBlocks.push(value.then(element => [id, element]));
                return `<div class="code" data-code="${id}">${(0, strings_1.$pe)(code)}</div>`;
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
                    (0, errors_1.$Y)(err);
                }
                finally {
                    event.preventDefault();
                }
            };
            const onClick = options.actionHandler.disposables.add(new event_1.$9P(element, 'click'));
            const onAuxClick = options.actionHandler.disposables.add(new event_1.$9P(element, 'auxclick'));
            options.actionHandler.disposables.add(event_2.Event.any(onClick.event, onAuxClick.event)(e => {
                const mouseEvent = new mouseEvent_1.$eO(e);
                if (!mouseEvent.leftButton && !mouseEvent.middleButton) {
                    return;
                }
                _activateLink(mouseEvent);
            }));
            options.actionHandler.disposables.add(DOM.$nO(element, 'keydown', (e) => {
                const keyboardEvent = new keyboardEvent_1.$jO(e);
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
            value = (0, iconLabels_2.$Sj)(value);
        }
        let renderedMarkdown;
        if (options.fillInIncompleteTokens) {
            // The defaults are applied by parse but not lexer()/parser(), and they need to be present
            const opts = {
                ...marked_1.marked.defaults,
                ...markedOptions
            };
            const tokens = marked_1.marked.lexer(value, opts);
            const newTokens = $DQ(tokens);
            renderedMarkdown = marked_1.marked.parser(newTokens, opts);
        }
        else {
            renderedMarkdown = marked_1.marked.parse(value, markedOptions);
        }
        // Rewrite theme icons
        if (markdown.supportThemeIcons) {
            const elements = (0, iconLabels_1.$xQ)(renderedMarkdown);
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
                        DOM.$_O(placeholderElement, renderedElement);
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
                    DOM.$_O(placeholderElement, renderedElement);
                }
            }
        }
        // signal size changes for image tags
        if (options.asyncRenderCallback) {
            for (const img of element.getElementsByTagName('img')) {
                const listener = disposables.add(DOM.$nO(img, 'load', () => {
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
    exports.$zQ = $zQ;
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
            return (0, resources_1.$lg)(baseUri, href).toString();
        }
        else {
            return (0, resources_1.$lg)((0, resources_1.$hg)(baseUri), href).toString();
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
        const hook = DOM.$tP(allowedSchemes);
        try {
            return dompurify.sanitize(renderedMarkdown, { ...config, RETURN_TRUSTED_TYPE: true });
        }
        finally {
            dompurify.removeHook('uponSanitizeAttribute');
            hook.dispose();
        }
    }
    exports.$AQ = [
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
                ALLOWED_TAGS: [...DOM.$uP],
                ALLOWED_ATTR: exports.$AQ,
                ALLOW_UNKNOWN_PROTOCOLS: true,
            },
            allowedSchemes
        };
    }
    /**
     * Strips all markdown from `string`, if it's an IMarkdownString. For example
     * `# Header` would be output as `Header`. If it's not, the string is returned.
     */
    function $BQ(string) {
        return typeof string === 'string' ? string : $CQ(string);
    }
    exports.$BQ = $BQ;
    /**
     * Strips all markdown from `markdown`. For example `# Header` would be output as `Header`.
     */
    function $CQ(markdown) {
        // values that are too long will freeze the UI
        let value = markdown.value ?? '';
        if (value.length > 100000) {
            value = `${value.substr(0, 100000)}…`;
        }
        const html = marked_1.marked.parse(value, { renderer: plainTextRenderer.value }).replace(/&(#\d+|[a-zA-Z]+);/g, m => unescapeInfo.get(m) ?? m);
        return sanitizeRenderedMarkdown({ isTrusted: false }, html).toString();
    }
    exports.$CQ = $CQ;
    const unescapeInfo = new Map([
        ['&quot;', '"'],
        ['&nbsp;', ' '],
        ['&amp;', '&'],
        ['&#39;', '\''],
        ['&lt;', '<'],
        ['&gt;', '>'],
    ]);
    const plainTextRenderer = new lazy_1.$T(() => {
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
    function $DQ(tokens) {
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
    exports.$DQ = $DQ;
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
//# sourceMappingURL=markdownRenderer.js.map