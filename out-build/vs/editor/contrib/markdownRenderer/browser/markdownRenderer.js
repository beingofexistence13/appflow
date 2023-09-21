/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", "vs/base/browser/markdownRenderer", "vs/base/browser/trustedTypes", "vs/base/common/errors", "vs/base/common/event", "vs/base/common/lifecycle", "vs/editor/browser/config/domFontInfo", "vs/editor/common/languages/language", "vs/editor/common/languages/modesRegistry", "vs/editor/common/languages/textToHtmlTokenizer", "vs/platform/opener/common/opener", "vs/css!./renderedMarkdown"], function (require, exports, markdownRenderer_1, trustedTypes_1, errors_1, event_1, lifecycle_1, domFontInfo_1, language_1, modesRegistry_1, textToHtmlTokenizer_1, opener_1) {
    "use strict";
    var $K2_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$L2 = exports.$K2 = void 0;
    /**
     * Markdown renderer that can render codeblocks with the editor mechanics. This
     * renderer should always be preferred.
     */
    let $K2 = class $K2 {
        static { $K2_1 = this; }
        static { this.a = (0, trustedTypes_1.$PQ)('tokenizeToString', {
            createHTML(html) {
                return html;
            }
        }); }
        constructor(c, d, f) {
            this.c = c;
            this.d = d;
            this.f = f;
            this.b = new event_1.$fd();
            this.onDidRenderAsync = this.b.event;
        }
        dispose() {
            this.b.dispose();
        }
        render(markdown, options, markedOptions) {
            if (!markdown) {
                const element = document.createElement('span');
                return { element, dispose: () => { } };
            }
            const disposables = new lifecycle_1.$jc();
            const rendered = disposables.add((0, markdownRenderer_1.$zQ)(markdown, { ...this.g(markdown, disposables), ...options }, markedOptions));
            rendered.element.classList.add('rendered-markdown');
            return {
                element: rendered.element,
                dispose: () => disposables.dispose()
            };
        }
        g(markdown, disposables) {
            return {
                codeBlockRenderer: async (languageAlias, value) => {
                    // In markdown,
                    // it is possible that we stumble upon language aliases (e.g.js instead of javascript)
                    // it is possible no alias is given in which case we fall back to the current editor lang
                    let languageId;
                    if (languageAlias) {
                        languageId = this.d.getLanguageIdByLanguageName(languageAlias);
                    }
                    else if (this.c.editor) {
                        languageId = this.c.editor.getModel()?.getLanguageId();
                    }
                    if (!languageId) {
                        languageId = modesRegistry_1.$Yt;
                    }
                    const html = await (0, textToHtmlTokenizer_1.$dY)(this.d, value, languageId);
                    const element = document.createElement('span');
                    element.innerHTML = ($K2_1.a?.createHTML(html) ?? html);
                    // use "good" font
                    if (this.c.editor) {
                        const fontInfo = this.c.editor.getOption(50 /* EditorOption.fontInfo */);
                        (0, domFontInfo_1.$vU)(element, fontInfo);
                    }
                    else if (this.c.codeBlockFontFamily) {
                        element.style.fontFamily = this.c.codeBlockFontFamily;
                    }
                    if (this.c.codeBlockFontSize !== undefined) {
                        element.style.fontSize = this.c.codeBlockFontSize;
                    }
                    return element;
                },
                asyncRenderCallback: () => this.b.fire(),
                actionHandler: {
                    callback: (link) => $L2(this.f, link, markdown.isTrusted),
                    disposables: disposables
                }
            };
        }
    };
    exports.$K2 = $K2;
    exports.$K2 = $K2 = $K2_1 = __decorate([
        __param(1, language_1.$ct),
        __param(2, opener_1.$NT)
    ], $K2);
    async function $L2(openerService, link, isTrusted) {
        try {
            return await openerService.open(link, {
                fromUserGesture: true,
                allowContributedOpeners: true,
                allowCommands: toAllowCommandsOption(isTrusted),
            });
        }
        catch (e) {
            (0, errors_1.$Y)(e);
            return false;
        }
    }
    exports.$L2 = $L2;
    function toAllowCommandsOption(isTrusted) {
        if (isTrusted === true) {
            return true; // Allow all commands
        }
        if (isTrusted && Array.isArray(isTrusted.enabledCommands)) {
            return isTrusted.enabledCommands; // Allow subset of commands
        }
        return false; // Block commands
    }
});
//# sourceMappingURL=markdownRenderer.js.map