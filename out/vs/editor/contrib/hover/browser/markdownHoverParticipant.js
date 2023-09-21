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
define(["require", "exports", "vs/base/browser/dom", "vs/base/common/arrays", "vs/base/common/async", "vs/base/common/htmlContent", "vs/base/common/lifecycle", "vs/editor/contrib/markdownRenderer/browser/markdownRenderer", "vs/editor/common/core/position", "vs/editor/common/core/range", "vs/editor/common/languages/language", "vs/editor/contrib/hover/browser/getHover", "vs/nls", "vs/platform/configuration/common/configuration", "vs/platform/opener/common/opener", "vs/editor/common/services/languageFeatures"], function (require, exports, dom, arrays_1, async_1, htmlContent_1, lifecycle_1, markdownRenderer_1, position_1, range_1, language_1, getHover_1, nls, configuration_1, opener_1, languageFeatures_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.renderMarkdownHovers = exports.MarkdownHoverParticipant = exports.MarkdownHover = void 0;
    const $ = dom.$;
    class MarkdownHover {
        constructor(owner, range, contents, isBeforeContent, ordinal) {
            this.owner = owner;
            this.range = range;
            this.contents = contents;
            this.isBeforeContent = isBeforeContent;
            this.ordinal = ordinal;
        }
        isValidForHoverAnchor(anchor) {
            return (anchor.type === 1 /* HoverAnchorType.Range */
                && this.range.startColumn <= anchor.range.startColumn
                && this.range.endColumn >= anchor.range.endColumn);
        }
    }
    exports.MarkdownHover = MarkdownHover;
    let MarkdownHoverParticipant = class MarkdownHoverParticipant {
        constructor(_editor, _languageService, _openerService, _configurationService, _languageFeaturesService) {
            this._editor = _editor;
            this._languageService = _languageService;
            this._openerService = _openerService;
            this._configurationService = _configurationService;
            this._languageFeaturesService = _languageFeaturesService;
            this.hoverOrdinal = 3;
        }
        createLoadingMessage(anchor) {
            return new MarkdownHover(this, anchor.range, [new htmlContent_1.MarkdownString().appendText(nls.localize('modesContentHover.loading', "Loading..."))], false, 2000);
        }
        computeSync(anchor, lineDecorations) {
            if (!this._editor.hasModel() || anchor.type !== 1 /* HoverAnchorType.Range */) {
                return [];
            }
            const model = this._editor.getModel();
            const lineNumber = anchor.range.startLineNumber;
            const maxColumn = model.getLineMaxColumn(lineNumber);
            const result = [];
            let index = 1000;
            const lineLength = model.getLineLength(lineNumber);
            const languageId = model.getLanguageIdAtPosition(anchor.range.startLineNumber, anchor.range.startColumn);
            const stopRenderingLineAfter = this._editor.getOption(116 /* EditorOption.stopRenderingLineAfter */);
            const maxTokenizationLineLength = this._configurationService.getValue('editor.maxTokenizationLineLength', {
                overrideIdentifier: languageId
            });
            let stopRenderingMessage = false;
            if (stopRenderingLineAfter >= 0 && lineLength > stopRenderingLineAfter && anchor.range.startColumn >= stopRenderingLineAfter) {
                stopRenderingMessage = true;
                result.push(new MarkdownHover(this, anchor.range, [{
                        value: nls.localize('stopped rendering', "Rendering paused for long line for performance reasons. This can be configured via `editor.stopRenderingLineAfter`.")
                    }], false, index++));
            }
            if (!stopRenderingMessage && typeof maxTokenizationLineLength === 'number' && lineLength >= maxTokenizationLineLength) {
                result.push(new MarkdownHover(this, anchor.range, [{
                        value: nls.localize('too many characters', "Tokenization is skipped for long lines for performance reasons. This can be configured via `editor.maxTokenizationLineLength`.")
                    }], false, index++));
            }
            let isBeforeContent = false;
            for (const d of lineDecorations) {
                const startColumn = (d.range.startLineNumber === lineNumber) ? d.range.startColumn : 1;
                const endColumn = (d.range.endLineNumber === lineNumber) ? d.range.endColumn : maxColumn;
                const hoverMessage = d.options.hoverMessage;
                if (!hoverMessage || (0, htmlContent_1.isEmptyMarkdownString)(hoverMessage)) {
                    continue;
                }
                if (d.options.beforeContentClassName) {
                    isBeforeContent = true;
                }
                const range = new range_1.Range(anchor.range.startLineNumber, startColumn, anchor.range.startLineNumber, endColumn);
                result.push(new MarkdownHover(this, range, (0, arrays_1.asArray)(hoverMessage), isBeforeContent, index++));
            }
            return result;
        }
        computeAsync(anchor, lineDecorations, token) {
            if (!this._editor.hasModel() || anchor.type !== 1 /* HoverAnchorType.Range */) {
                return async_1.AsyncIterableObject.EMPTY;
            }
            const model = this._editor.getModel();
            if (!this._languageFeaturesService.hoverProvider.has(model)) {
                return async_1.AsyncIterableObject.EMPTY;
            }
            const position = new position_1.Position(anchor.range.startLineNumber, anchor.range.startColumn);
            return (0, getHover_1.getHover)(this._languageFeaturesService.hoverProvider, model, position, token)
                .filter(item => !(0, htmlContent_1.isEmptyMarkdownString)(item.hover.contents))
                .map(item => {
                const rng = item.hover.range ? range_1.Range.lift(item.hover.range) : anchor.range;
                return new MarkdownHover(this, rng, item.hover.contents, false, item.ordinal);
            });
        }
        renderHoverParts(context, hoverParts) {
            return renderMarkdownHovers(context, hoverParts, this._editor, this._languageService, this._openerService);
        }
    };
    exports.MarkdownHoverParticipant = MarkdownHoverParticipant;
    exports.MarkdownHoverParticipant = MarkdownHoverParticipant = __decorate([
        __param(1, language_1.ILanguageService),
        __param(2, opener_1.IOpenerService),
        __param(3, configuration_1.IConfigurationService),
        __param(4, languageFeatures_1.ILanguageFeaturesService)
    ], MarkdownHoverParticipant);
    function renderMarkdownHovers(context, hoverParts, editor, languageService, openerService) {
        // Sort hover parts to keep them stable since they might come in async, out-of-order
        hoverParts.sort((a, b) => a.ordinal - b.ordinal);
        const disposables = new lifecycle_1.DisposableStore();
        for (const hoverPart of hoverParts) {
            for (const contents of hoverPart.contents) {
                if ((0, htmlContent_1.isEmptyMarkdownString)(contents)) {
                    continue;
                }
                const markdownHoverElement = $('div.hover-row.markdown-hover');
                const hoverContentsElement = dom.append(markdownHoverElement, $('div.hover-contents'));
                const renderer = disposables.add(new markdownRenderer_1.MarkdownRenderer({ editor }, languageService, openerService));
                disposables.add(renderer.onDidRenderAsync(() => {
                    hoverContentsElement.className = 'hover-contents code-hover-contents';
                    context.onContentsChanged();
                }));
                const renderedContents = disposables.add(renderer.render(contents));
                hoverContentsElement.appendChild(renderedContents.element);
                context.fragment.appendChild(markdownHoverElement);
            }
        }
        return disposables;
    }
    exports.renderMarkdownHovers = renderMarkdownHovers;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFya2Rvd25Ib3ZlclBhcnRpY2lwYW50LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvZWRpdG9yL2NvbnRyaWIvaG92ZXIvYnJvd3Nlci9tYXJrZG93bkhvdmVyUGFydGljaXBhbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBc0JoRyxNQUFNLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDO0lBRWhCLE1BQWEsYUFBYTtRQUV6QixZQUNpQixLQUE2QyxFQUM3QyxLQUFZLEVBQ1osUUFBMkIsRUFDM0IsZUFBd0IsRUFDeEIsT0FBZTtZQUpmLFVBQUssR0FBTCxLQUFLLENBQXdDO1lBQzdDLFVBQUssR0FBTCxLQUFLLENBQU87WUFDWixhQUFRLEdBQVIsUUFBUSxDQUFtQjtZQUMzQixvQkFBZSxHQUFmLGVBQWUsQ0FBUztZQUN4QixZQUFPLEdBQVAsT0FBTyxDQUFRO1FBQzVCLENBQUM7UUFFRSxxQkFBcUIsQ0FBQyxNQUFtQjtZQUMvQyxPQUFPLENBQ04sTUFBTSxDQUFDLElBQUksa0NBQTBCO21CQUNsQyxJQUFJLENBQUMsS0FBSyxDQUFDLFdBQVcsSUFBSSxNQUFNLENBQUMsS0FBSyxDQUFDLFdBQVc7bUJBQ2xELElBQUksQ0FBQyxLQUFLLENBQUMsU0FBUyxJQUFJLE1BQU0sQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUNqRCxDQUFDO1FBQ0gsQ0FBQztLQUNEO0lBakJELHNDQWlCQztJQUVNLElBQU0sd0JBQXdCLEdBQTlCLE1BQU0sd0JBQXdCO1FBSXBDLFlBQ29CLE9BQW9CLEVBQ3JCLGdCQUFtRCxFQUNyRCxjQUErQyxFQUN4QyxxQkFBNkQsRUFDMUQsd0JBQXFFO1lBSjVFLFlBQU8sR0FBUCxPQUFPLENBQWE7WUFDSixxQkFBZ0IsR0FBaEIsZ0JBQWdCLENBQWtCO1lBQ3BDLG1CQUFjLEdBQWQsY0FBYyxDQUFnQjtZQUN2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