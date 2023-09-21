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
define(["require", "exports", "vs/base/browser/dom", "vs/base/common/arrays", "vs/base/common/async", "vs/base/common/htmlContent", "vs/base/common/lifecycle", "vs/editor/contrib/markdownRenderer/browser/markdownRenderer", "vs/editor/common/core/position", "vs/editor/common/core/range", "vs/editor/common/languages/language", "vs/editor/contrib/hover/browser/getHover", "vs/nls!vs/editor/contrib/hover/browser/markdownHoverParticipant", "vs/platform/configuration/common/configuration", "vs/platform/opener/common/opener", "vs/editor/common/services/languageFeatures"], function (require, exports, dom, arrays_1, async_1, htmlContent_1, lifecycle_1, markdownRenderer_1, position_1, range_1, language_1, getHover_1, nls, configuration_1, opener_1, languageFeatures_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$$4 = exports.$04 = exports.$94 = void 0;
    const $ = dom.$;
    class $94 {
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
    exports.$94 = $94;
    let $04 = class $04 {
        constructor(c, e, f, g, h) {
            this.c = c;
            this.e = e;
            this.f = f;
            this.g = g;
            this.h = h;
            this.hoverOrdinal = 3;
        }
        createLoadingMessage(anchor) {
            return new $94(this, anchor.range, [new htmlContent_1.$Xj().appendText(nls.localize(0, null))], false, 2000);
        }
        computeSync(anchor, lineDecorations) {
            if (!this.c.hasModel() || anchor.type !== 1 /* HoverAnchorType.Range */) {
                return [];
            }
            const model = this.c.getModel();
            const lineNumber = anchor.range.startLineNumber;
            const maxColumn = model.getLineMaxColumn(lineNumber);
            const result = [];
            let index = 1000;
            const lineLength = model.getLineLength(lineNumber);
            const languageId = model.getLanguageIdAtPosition(anchor.range.startLineNumber, anchor.range.startColumn);
            const stopRenderingLineAfter = this.c.getOption(116 /* EditorOption.stopRenderingLineAfter */);
            const maxTokenizationLineLength = this.g.getValue('editor.maxTokenizationLineLength', {
                overrideIdentifier: languageId
            });
            let stopRenderingMessage = false;
            if (stopRenderingLineAfter >= 0 && lineLength > stopRenderingLineAfter && anchor.range.startColumn >= stopRenderingLineAfter) {
                stopRenderingMessage = true;
                result.push(new $94(this, anchor.range, [{
                        value: nls.localize(1, null)
                    }], false, index++));
            }
            if (!stopRenderingMessage && typeof maxTokenizationLineLength === 'number' && lineLength >= maxTokenizationLineLength) {
                result.push(new $94(this, anchor.range, [{
                        value: nls.localize(2, null)
                    }], false, index++));
            }
            let isBeforeContent = false;
            for (const d of lineDecorations) {
                const startColumn = (d.range.startLineNumber === lineNumber) ? d.range.startColumn : 1;
                const endColumn = (d.range.endLineNumber === lineNumber) ? d.range.endColumn : maxColumn;
                const hoverMessage = d.options.hoverMessage;
                if (!hoverMessage || (0, htmlContent_1.$Yj)(hoverMessage)) {
                    continue;
                }
                if (d.options.beforeContentClassName) {
                    isBeforeContent = true;
                }
                const range = new range_1.$ks(anchor.range.startLineNumber, startColumn, anchor.range.startLineNumber, endColumn);
                result.push(new $94(this, range, (0, arrays_1.$1b)(hoverMessage), isBeforeContent, index++));
            }
            return result;
        }
        computeAsync(anchor, lineDecorations, token) {
            if (!this.c.hasModel() || anchor.type !== 1 /* HoverAnchorType.Range */) {
                return async_1.$3g.EMPTY;
            }
            const model = this.c.getModel();
            if (!this.h.hoverProvider.has(model)) {
                return async_1.$3g.EMPTY;
            }
            const position = new position_1.$js(anchor.range.startLineNumber, anchor.range.startColumn);
            return (0, getHover_1.$74)(this.h.hoverProvider, model, position, token)
                .filter(item => !(0, htmlContent_1.$Yj)(item.hover.contents))
                .map(item => {
                const rng = item.hover.range ? range_1.$ks.lift(item.hover.range) : anchor.range;
                return new $94(this, rng, item.hover.contents, false, item.ordinal);
            });
        }
        renderHoverParts(context, hoverParts) {
            return $$4(context, hoverParts, this.c, this.e, this.f);
        }
    };
    exports.$04 = $04;
    exports.$04 = $04 = __decorate([
        __param(1, language_1.$ct),
        __param(2, opener_1.$NT),
        __param(3, configuration_1.$8h),
        __param(4, languageFeatures_1.$hF)
    ], $04);
    function $$4(context, hoverParts, editor, languageService, openerService) {
        // Sort hover parts to keep them stable since they might come in async, out-of-order
        hoverParts.sort((a, b) => a.ordinal - b.ordinal);
        const disposables = new lifecycle_1.$jc();
        for (const hoverPart of hoverParts) {
            for (const contents of hoverPart.contents) {
                if ((0, htmlContent_1.$Yj)(contents)) {
                    continue;
                }
                const markdownHoverElement = $('div.hover-row.markdown-hover');
                const hoverContentsElement = dom.$0O(markdownHoverElement, $('div.hover-contents'));
                const renderer = disposables.add(new markdownRenderer_1.$K2({ editor }, languageService, openerService));
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
    exports.$$4 = $$4;
});
//# sourceMappingURL=markdownHoverParticipant.js.map