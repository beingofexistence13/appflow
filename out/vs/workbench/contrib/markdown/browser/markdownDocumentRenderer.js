/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/dompurify/dompurify", "vs/base/browser/markdownRenderer", "vs/base/common/marked/marked", "vs/base/common/network", "vs/editor/common/languages/textToHtmlTokenizer", "vs/base/common/strings"], function (require, exports, dom_1, dompurify, markdownRenderer_1, marked_1, network_1, textToHtmlTokenizer_1, strings_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.renderMarkdownDocument = exports.DEFAULT_MARKDOWN_STYLES = void 0;
    exports.DEFAULT_MARKDOWN_STYLES = `
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
        const hook = (0, dom_1.hookDomPurifyHrefAndSrcSanitizer)(allowedProtocols, true);
        try {
            return dompurify.sanitize(documentContent, {
                ...{
                    ALLOWED_TAGS: [
                        ...dom_1.basicMarkupHtmlTags,
                        'checkbox',
                        'checklist',
                    ],
                    ALLOWED_ATTR: [
                        ...markdownRenderer_1.allowedMarkdownAttr,
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
    async function renderMarkdownDocument(text, extensionService, languageService, shouldSanitize = true, allowUnknownProtocols = false, token) {
        const highlight = (code, lang, callback) => {
            if (!callback) {
                return code;
            }
            if (typeof lang !== 'string') {
                callback(null, `<code>${(0, strings_1.escape)(code)}</code>`);
                return '';
            }
            extensionService.whenInstalledExtensionsRegistered().then(async () => {
                if (token?.isCancellationRequested) {
                    callback(null, '');
                    return;
                }
                const languageId = languageService.getLanguageIdByLanguageName(lang);
                const html = await (0, textToHtmlTokenizer_1.tokenizeToString)(languageService, code, languageId);
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
    exports.renderMarkdownDocument = renderMarkdownDocument;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFya2Rvd25Eb2N1bWVudFJlbmRlcmVyLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvbWFya2Rvd24vYnJvd3Nlci9tYXJrZG93bkRvY3VtZW50UmVuZGVyZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBYW5GLFFBQUEsdUJBQXVCLEdBQUc7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0NBNEl0QyxDQUFDO0lBRUYsTUFBTSxnQkFBZ0IsR0FBRyxDQUFDLGlCQUFPLENBQUMsSUFBSSxFQUFFLGlCQUFPLENBQUMsS0FBSyxFQUFFLGlCQUFPLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDeEUsU0FBUyxRQUFRLENBQUMsZUFBdUIsRUFBRSxxQkFBOEI7UUFFeEUsTUFBTSxJQUFJLEdBQUcsSUFBQSxzQ0FBZ0MsRUFBQyxnQkFBZ0IsRUFBRSxJQUFJLENBQUMsQ0FBQztRQUV0RSxJQUFJO1lBQ0gsT0FBTyxTQUFTLENBQUMsUUFBUSxDQUFDLGVBQWUsRUFBRTtnQkFDMUMsR0FBRztvQkFDRixZQUFZLEVBQUU7d0JBQ2IsR0FBRyx5QkFBbUI7d0JBQ3RCLFVBQVU7d0JBQ1YsV0FBVztxQkFDWDtvQkFDRCxZQUFZLEVBQUU7d0JBQ2IsR0FBRyxzQ0FBbUI7d0JBQ3RCLGNBQWMsRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRSxVQUFVO3dCQUNoRCxZQUFZO3dCQUNaLFVBQVUsRUFBRSxTQUFTLEVBQUUsYUFBYSxFQUFFLGNBQWMsRUFBRSxZQUFZO3FCQUNsRTtpQkFDRDtnQkFDRCxHQUFHLENBQUMscUJBQXFCLENBQUMsQ0FBQyxDQUFDLEVBQUUsdUJBQXVCLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQzthQUNuRSxDQUFDLENBQUM7U0FDSDtnQkFBUztZQUNULElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQztTQUNmO0lBQ0YsQ0FBQztJQUVEOzs7O09BSUc7SUFDSSxLQUFLLFVBQVUsc0JBQXNCLENBQzNDLElBQVksRUFDWixnQkFBbUMsRUFDbkMsZUFBaUMsRUFDakMsaUJBQTBCLElBQUksRUFDOUIsd0JBQWlDLEtBQUssRUFDdEMsS0FBeUI7UUFHekIsTUFBTSxTQUFTLEdBQUcsQ0FBQyxJQUFZLEVBQUUsSUFBd0IsRUFBRSxRQUEwRCxFQUFPLEVBQUU7WUFDN0gsSUFBSSxDQUFDLFFBQVEsRUFBRTtnQkFDZCxPQUFPLElBQUksQ0FBQzthQUNaO1lBRUQsSUFBSSxPQUFPLElBQUksS0FBSyxRQUFRLEVBQUU7Z0JBQzdCLFFBQVEsQ0FBQyxJQUFJLEVBQUUsU0FBUyxJQUFBLGdCQUFNLEVBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO2dCQUMvQyxPQUFPLEVBQUUsQ0FBQzthQUNWO1lBRUQsZ0JBQWdCLENBQUMsaUNBQWlDLEVBQUUsQ0FBQyxJQUFJLENBQUMsS0FBSyxJQUFJLEVBQUU7Z0JBQ3BFLElBQUksS0FBSyxFQUFFLHVCQUF1QixFQUFFO29CQUNuQyxRQUFRLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQyxDQUFDO29CQUNuQixPQUFPO2lCQUNQO2dCQUVELE1BQU0sVUFBVSxHQUFHLGVBQWUsQ0FBQywyQkFBMkIsQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFDckUsTUFBTSxJQUFJLEdBQUcsTUFBTSxJQUFBLHNDQUFnQixFQUFDLGVBQWUsRUFBRSxJQUFJLEVBQUUsVUFBVSxDQUFDLENBQUM7Z0JBQ3ZFLFFBQVEsQ0FBQyxJQUFJLEVBQUUsU0FBUyxJQUFJLFNBQVMsQ0FBQyxDQUFDO1lBQ3hDLENBQUMsQ0FBQyxDQUFDO1lBQ0gsT0FBTyxFQUFFLENBQUM7UUFDWCxDQUFDLENBQUM7UUFFRixPQUFPLElBQUksT0FBTyxDQUFTLENBQUMsT0FBTyxFQUFFLE1BQU0sRUFBRSxFQUFFO1lBQzlDLElBQUEsZUFBTSxFQUFDLElBQUksRUFBRSxFQUFFLFNBQVMsRUFBRSxFQUFFLENBQUMsR0FBRyxFQUFFLEtBQUssRUFBRSxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO1FBQ2pGLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRTtZQUNiLElBQUksY0FBYyxFQUFFO2dCQUNuQixPQUFPLFFBQVEsQ0FBQyxHQUFHLEVBQUUscUJBQXFCLENBQUMsQ0FBQzthQUM1QztpQkFBTTtnQkFDTixPQUFPLEdBQUcsQ0FBQzthQUNYO1FBQ0YsQ0FBQyxDQUFDLENBQUM7SUFDSixDQUFDO0lBekNELHdEQXlDQyJ9