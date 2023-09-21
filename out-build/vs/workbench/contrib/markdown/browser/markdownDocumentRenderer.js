/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/dompurify/dompurify", "vs/base/browser/markdownRenderer", "vs/base/common/marked/marked", "vs/base/common/network", "vs/editor/common/languages/textToHtmlTokenizer", "vs/base/common/strings"], function (require, exports, dom_1, dompurify, markdownRenderer_1, marked_1, network_1, textToHtmlTokenizer_1, strings_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$zUb = exports.$yUb = void 0;
    exports.$yUb = `
body {
	padding: 10px 20px;
	line-height: 22px;
	max-width: 882px;
	margin: 0 auto;
}

body *:last-child {
	margin-bottom: 0;
}

img {
	max-width: 100%;
	max-height: 100%;
}

a {
	text-decoration: none;
}

a:hover {
	text-decoration: underline;
}

a:focus,
input:focus,
select:focus,
textarea:focus {
	outline: 1px solid -webkit-focus-ring-color;
	outline-offset: -1px;
}

hr {
	border: 0;
	height: 2px;
	border-bottom: 2px solid;
}

h1 {
	padding-bottom: 0.3em;
	line-height: 1.2;
	border-bottom-width: 1px;
	border-bottom-style: solid;
}

h1, h2, h3 {
	font-weight: normal;
}

table {
	border-collapse: collapse;
}

th {
	text-align: left;
	border-bottom: 1px solid;
}

th,
td {
	padding: 5px 10px;
}

table > tbody > tr + tr > td {
	border-top-width: 1px;
	border-top-style: solid;
}

blockquote {
	margin: 0 7px 0 5px;
	padding: 0 16px 0 10px;
	border-left-width: 5px;
	border-left-style: solid;
}

code {
	font-family: "SF Mono", Monaco, Menlo, Consolas, "Ubuntu Mono", "Liberation Mono", "DejaVu Sans Mono", "Courier New", monospace;
}

pre {
	padding: 16px;
	border-radius: 3px;
	overflow: auto;
}

pre code {
	font-family: var(--vscode-editor-font-family);
	font-weight: var(--vscode-editor-font-weight);
	font-size: var(--vscode-editor-font-size);
	line-height: 1.5;
	color: var(--vscode-editor-foreground);
	tab-size: 4;
}

.monaco-tokenized-source {
	white-space: pre;
}

/** Theming */

.pre {
	background-color: var(--vscode-textCodeBlock-background);
}

.vscode-high-contrast h1 {
	border-color: rgb(0, 0, 0);
}

.vscode-light th {
	border-color: rgba(0, 0, 0, 0.69);
}

.vscode-dark th {
	border-color: rgba(255, 255, 255, 0.69);
}

.vscode-light h1,
.vscode-light hr,
.vscode-light td {
	border-color: rgba(0, 0, 0, 0.18);
}

.vscode-dark h1,
.vscode-dark hr,
.vscode-dark td {
	border-color: rgba(255, 255, 255, 0.18);
}

@media (forced-colors: active) and (prefers-color-scheme: light){
	body {
		forced-color-adjust: none;
	}
}

@media (forced-colors: active) and (prefers-color-scheme: dark){
	body {
		forced-color-adjust: none;
	}
}
`;
    const allowedProtocols = [network_1.Schemas.http, network_1.Schemas.https, network_1.Schemas.command];
    function sanitize(documentContent, allowUnknownProtocols) {
        const hook = (0, dom_1.$tP)(allowedProtocols, true);
        try {
            return dompurify.sanitize(documentContent, {
                ...{
                    ALLOWED_TAGS: [
                        ...dom_1.$uP,
                        'checkbox',
                        'checklist',
                    ],
                    ALLOWED_ATTR: [
                        ...markdownRenderer_1.$AQ,
                        'data-command', 'name', 'id', 'role', 'tabindex',
                        'x-dispatch',
                        'required', 'checked', 'placeholder', 'when-checked', 'checked-on',
                    ],
                },
                ...(allowUnknownProtocols ? { ALLOW_UNKNOWN_PROTOCOLS: true } : {}),
            });
        }
        finally {
            hook.dispose();
        }
    }
    /**
     * Renders a string of markdown as a document.
     *
     * Uses VS Code's syntax highlighting code blocks.
     */
    async function $zUb(text, extensionService, languageService, shouldSanitize = true, allowUnknownProtocols = false, token) {
        const highlight = (code, lang, callback) => {
            if (!callback) {
                return code;
            }
            if (typeof lang !== 'string') {
                callback(null, `<code>${(0, strings_1.$pe)(code)}</code>`);
                return '';
            }
            extensionService.whenInstalledExtensionsRegistered().then(async () => {
                if (token?.isCancellationRequested) {
                    callback(null, '');
                    return;
                }
                const languageId = languageService.getLanguageIdByLanguageName(lang);
                const html = await (0, textToHtmlTokenizer_1.$dY)(languageService, code, languageId);
                callback(null, `<code>${html}</code>`);
            });
            return '';
        };
        return new Promise((resolve, reject) => {
            (0, marked_1.marked)(text, { highlight }, (err, value) => err ? reject(err) : resolve(value));
        }).then(raw => {
            if (shouldSanitize) {
                return sanitize(raw, allowUnknownProtocols);
            }
            else {
                return raw;
            }
        });
    }
    exports.$zUb = $zUb;
});
//# sourceMappingURL=markdownDocumentRenderer.js.map