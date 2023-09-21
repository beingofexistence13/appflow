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
    var MarkdownRenderer_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.openLinkFromMarkdown = exports.MarkdownRenderer = void 0;
    /**
     * Markdown renderer that can render codeblocks with the editor mechanics. This
     * renderer should always be preferred.
     */
    let MarkdownRenderer = class MarkdownRenderer {
        static { MarkdownRenderer_1 = this; }
        static { this._ttpTokenizer = (0, trustedTypes_1.createTrustedTypesPolicy)('tokenizeToString', {
            createHTML(html) {
                return html;
            }
        }); }
        constructor(_options, _languageService, _openerService) {
            this._options = _options;
            this._languageService = _languageService;
            this._openerService = _openerService;
            this._onDidRenderAsync = new event_1.Emitter();
            this.onDidRenderAsync = this._onDidRenderAsync.event;
        }
        dispose() {
            this._onDidRenderAsync.dispose();
        }
        render(markdown, options, markedOptions) {
            if (!markdown) {
                const element = document.createElement('span');
                return { element, dispose: () => { } };
            }
            const disposables = new lifecycle_1.DisposableStore();
            const rendered = disposables.add((0, markdownRenderer_1.renderMarkdown)(markdown, { ...this._getRenderOptions(markdown, disposables), ...options }, markedOptions));
            rendered.element.classList.add('rendered-markdown');
            return {
                element: rendered.element,
                dispose: () => disposables.dispose()
            };
        }
        _getRenderOptions(markdown, disposables) {
            return {
                codeBlockRenderer: async (languageAlias, value) => {
                    // In markdown,
                    // it is possible that we stumble upon language aliases (e.g.js instead of javascript)
                    // it is possible no alias is given in which case we fall back to the current editor lang
                    let languageId;
                    if (languageAlias) {
                        languageId = this._languageService.getLanguageIdByLanguageName(languageAlias);
                    }
                    else if (this._options.editor) {
                        languageId = this._options.editor.getModel()?.getLanguageId();
                    }
                    if (!languageId) {
                        languageId = modesRegistry_1.PLAINTEXT_LANGUAGE_ID;
                    }
                    const html = await (0, textToHtmlTokenizer_1.tokenizeToString)(this._languageService, value, languageId);
                    const element = document.createElement('span');
                    element.innerHTML = (MarkdownRenderer_1._ttpTokenizer?.createHTML(html) ?? html);
                    // use "good" font
                    if (this._options.editor) {
                        const fontInfo = this._options.editor.getOption(50 /* EditorOption.fontInfo */);
                        (0, domFontInfo_1.applyFontInfo)(element, fontInfo);
                    }
                    else if (this._options.codeBlockFontFamily) {
                        element.style.fontFamily = this._options.codeBlockFontFamily;
                    }
                    if (this._options.codeBlockFontSize !== undefined) {
                        element.style.fontSize = this._options.codeBlockFontSize;
                    }
                    return element;
                },
                asyncRenderCallback: () => this._onDidRenderAsync.fire(),
                actionHandler: {
                    callback: (link) => openLinkFromMarkdown(this._openerService, link, markdown.isTrusted),
                    disposables: disposables
                }
            };
        }
    };
    exports.MarkdownRenderer = MarkdownRenderer;
    exports.MarkdownRenderer = MarkdownRenderer = MarkdownRenderer_1 = __decorate([
        __param(1, language_1.ILanguageService),
        __param(2, opener_1.IOpenerService)
    ], MarkdownRenderer);
    async function openLinkFromMarkdown(openerService, link, isTrusted) {
        try {
            return await openerService.open(link, {
                fromUserGesture: true,
                allowContributedOpeners: true,
                allowCommands: toAllowCommandsOption(isTrusted),
            });
        }
        catch (e) {
            (0, errors_1.onUnexpectedError)(e);
            return false;
        }
    }
    exports.openLinkFromMarkdown = openLinkFromMarkdown;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFya2Rvd25SZW5kZXJlci5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL2VkaXRvci9jb250cmliL21hcmtkb3duUmVuZGVyZXIvYnJvd3Nlci9tYXJrZG93blJlbmRlcmVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7Ozs7SUEyQmhHOzs7T0FHRztJQUNJLElBQU0sZ0JBQWdCLEdBQXRCLE1BQU0sZ0JBQWdCOztpQkFFYixrQkFBYSxHQUFHLElBQUEsdUNBQXdCLEVBQUMsa0JBQWtCLEVBQUU7WUFDM0UsVUFBVSxDQUFDLElBQVk7Z0JBQ3RCLE9BQU8sSUFBSSxDQUFDO1lBQ2IsQ0FBQztTQUNELENBQUMsQUFKMEIsQ0FJekI7UUFLSCxZQUNrQixRQUFrQyxFQUNqQyxnQkFBbUQsRUFDckQsY0FBK0M7WUFGOUMsYUFBUSxHQUFSLFFBQVEsQ0FBMEI7WUFDaEIscUJBQWdCLEdBQWhCLGdCQUFnQixDQUFrQjtZQUNwQyxtQkFBYyxHQUFkLGNBQWMsQ0FBZ0I7WUFOL0Msc0JBQWlCLEdBQUcsSUFBSSxlQUFPLEVBQVEsQ0FBQztZQUNoRCxxQkFBZ0IsR0FBRyxJQUFJLENBQUMsaUJBQWlCLENBQUMsS0FBSyxDQUFDO1FBTXJELENBQUM7UUFFTCxPQUFPO1lBQ04sSUFBSSxDQUFDLGlCQUFpQixDQUFDLE9BQU8sRUFBRSxDQUFDO1FBQ2xDLENBQUM7UUFFRCxNQUFNLENBQUMsUUFBcUMsRUFBRSxPQUErQixFQUFFLGFBQTZCO1lBQzNHLElBQUksQ0FBQyxRQUFRLEVBQUU7Z0JBQ2QsTUFBTSxPQUFPLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxNQUFNLENBQUMsQ0FBQztnQkFDL0MsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxFQUFFLENBQUM7YUFDdkM7WUFFRCxNQUFNLFdBQVcsR0FBRyxJQUFJLDJCQUFlLEVBQUUsQ0FBQztZQUMxQyxNQUFNLFFBQVEsR0FBRyxXQUFXLENBQUMsR0FBRyxDQUFDLElBQUEsaUNBQWMsRUFBQyxRQUFRLEVBQUUsRUFBRSxHQUFHLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxRQUFRLEVBQUUsV0FBVyxDQUFDLEVBQUUsR0FBRyxPQUFPLEVBQUUsRUFBRSxhQUFhLENBQUMsQ0FBQyxDQUFDO1lBQzVJLFFBQVEsQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDO1lBQ3BELE9BQU87Z0JBQ04sT0FBTyxFQUFFLFFBQVEsQ0FBQyxPQUFPO2dCQUN6QixPQUFPLEVBQUUsR0FBRyxFQUFFLENBQUMsV0FBVyxDQUFDLE9BQU8sRUFBRTthQUNwQyxDQUFDO1FBQ0gsQ0FBQztRQUVTLGlCQUFpQixDQUFDLFFBQXlCLEVBQUUsV0FBNEI7WUFDbEYsT0FBTztnQkFDTixpQkFBaUIsRUFBRSxLQUFLLEVBQUUsYUFBYSxFQUFFLEtBQUssRUFBRSxFQUFFO29CQUNqRCxlQUFlO29CQUNmLHNGQUFzRjtvQkFDdEYseUZBQXlGO29CQUN6RixJQUFJLFVBQXFDLENBQUM7b0JBQzFDLElBQUksYUFBYSxFQUFFO3dCQUNsQixVQUFVLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixDQUFDLDJCQUEyQixDQUFDLGFBQWEsQ0FBQyxDQUFDO3FCQUM5RTt5QkFBTSxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxFQUFFO3dCQUNoQyxVQUFVLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsUUFBUSxFQUFFLEVBQUUsYUFBYSxFQUFFLENBQUM7cUJBQzlEO29CQUNELElBQUksQ0FBQyxVQUFVLEVBQUU7d0JBQ2hCLFVBQVUsR0FBRyxxQ0FBcUIsQ0FBQztxQkFDbkM7b0JBQ0QsTUFBTSxJQUFJLEdBQUcsTUFBTSxJQUFBLHNDQUFnQixFQUFDLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxLQUFLLEVBQUUsVUFBVSxDQUFDLENBQUM7b0JBRTlFLE1BQU0sT0FBTyxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsTUFBTSxDQUFDLENBQUM7b0JBRS9DLE9BQU8sQ0FBQyxTQUFTLEdBQUcsQ0FBQyxrQkFBZ0IsQ0FBQyxhQUFhLEVBQUUsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLElBQUksQ0FBVyxDQUFDO29CQUV6RixrQkFBa0I7b0JBQ2xCLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLEVBQUU7d0JBQ3pCLE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLFNBQVMsZ0NBQXVCLENBQUM7d0JBQ3ZFLElBQUEsMkJBQWEsRUFBQyxPQUFPLEVBQUUsUUFBUSxDQUFDLENBQUM7cUJBQ2pDO3lCQUFNLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxtQkFBbUIsRUFBRTt3QkFDN0MsT0FBTyxDQUFDLEtBQUssQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxtQkFBbUIsQ0FBQztxQkFDN0Q7b0JBRUQsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLGlCQUFpQixLQUFLLFNBQVMsRUFBRTt3QkFDbEQsT0FBTyxDQUFDLEtBQUssQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxpQkFBaUIsQ0FBQztxQkFDekQ7b0JBRUQsT0FBTyxPQUFPLENBQUM7Z0JBQ2hCLENBQUM7Z0JBQ0QsbUJBQW1CLEVBQUUsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLElBQUksRUFBRTtnQkFDeEQsYUFBYSxFQUFFO29CQUNkLFFBQVEsRUFBRSxDQUFDLElBQUksRUFBRSxFQUFFLENBQUMsb0JBQW9CLENBQUMsSUFBSSxDQUFDLGNBQWMsRUFBRSxJQUFJLEVBQUUsUUFBUSxDQUFDLFNBQVMsQ0FBQztvQkFDdkYsV0FBVyxFQUFFLFdBQVc7aUJBQ3hCO2FBQ0QsQ0FBQztRQUNILENBQUM7O0lBN0VXLDRDQUFnQjsrQkFBaEIsZ0JBQWdCO1FBYTFCLFdBQUEsMkJBQWdCLENBQUE7UUFDaEIsV0FBQSx1QkFBYyxDQUFBO09BZEosZ0JBQWdCLENBOEU1QjtJQUVNLEtBQUssVUFBVSxvQkFBb0IsQ0FBQyxhQUE2QixFQUFFLElBQVksRUFBRSxTQUE2RDtRQUNwSixJQUFJO1lBQ0gsT0FBTyxNQUFNLGFBQWEsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFO2dCQUNyQyxlQUFlLEVBQUUsSUFBSTtnQkFDckIsdUJBQXVCLEVBQUUsSUFBSTtnQkFDN0IsYUFBYSxFQUFFLHFCQUFxQixDQUFDLFNBQVMsQ0FBQzthQUMvQyxDQUFDLENBQUM7U0FDSDtRQUFDLE9BQU8sQ0FBQyxFQUFFO1lBQ1gsSUFBQSwwQkFBaUIsRUFBQyxDQUFDLENBQUMsQ0FBQztZQUNyQixPQUFPLEtBQUssQ0FBQztTQUNiO0lBQ0YsQ0FBQztJQVhELG9EQVdDO0lBRUQsU0FBUyxxQkFBcUIsQ0FBQyxTQUE2RDtRQUMzRixJQUFJLFNBQVMsS0FBSyxJQUFJLEVBQUU7WUFDdkIsT0FBTyxJQUFJLENBQUMsQ0FBQyxxQkFBcUI7U0FDbEM7UUFFRCxJQUFJLFNBQVMsSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxlQUFlLENBQUMsRUFBRTtZQUMxRCxPQUFPLFNBQVMsQ0FBQyxlQUFlLENBQUMsQ0FBQywyQkFBMkI7U0FDN0Q7UUFFRCxPQUFPLEtBQUssQ0FBQyxDQUFDLGlCQUFpQjtJQUNoQyxDQUFDIn0=