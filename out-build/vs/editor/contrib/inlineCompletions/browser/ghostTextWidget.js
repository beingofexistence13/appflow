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
define(["require", "exports", "vs/base/browser/trustedTypes", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/observable", "vs/base/common/strings", "vs/editor/browser/config/domFontInfo", "vs/editor/common/config/editorOptions", "vs/editor/common/core/position", "vs/editor/common/core/range", "vs/editor/common/core/stringBuilder", "vs/editor/common/languages/language", "vs/editor/common/model", "vs/editor/common/tokens/lineTokens", "vs/editor/common/viewLayout/lineDecorations", "vs/editor/common/viewLayout/viewLineRenderer", "vs/editor/contrib/inlineCompletions/browser/ghostText", "vs/editor/contrib/inlineCompletions/browser/utils", "vs/css!./ghostText"], function (require, exports, trustedTypes_1, event_1, lifecycle_1, observable_1, strings, domFontInfo_1, editorOptions_1, position_1, range_1, stringBuilder_1, language_1, model_1, lineTokens_1, lineDecorations_1, viewLineRenderer_1, ghostText_1, utils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$U8 = exports.$T8 = void 0;
    exports.$T8 = 'ghost-text';
    let $U8 = class $U8 extends lifecycle_1.$kc {
        constructor(c, f, g) {
            super();
            this.c = c;
            this.f = f;
            this.g = g;
            this.a = (0, observable_1.observableValue)(this, false);
            this.b = (0, observable_1.observableFromEvent)(this.c.onDidChangeModel, () => this.c.getModel());
            this.h = (0, observable_1.derived)(this, reader => {
                if (this.a.read(reader)) {
                    return undefined;
                }
                const textModel = this.b.read(reader);
                if (textModel !== this.f.targetTextModel.read(reader)) {
                    return undefined;
                }
                const ghostText = this.f.ghostText.read(reader);
                if (!ghostText) {
                    return undefined;
                }
                const replacedRange = ghostText instanceof ghostText_1.$s5 ? ghostText.columnRange : undefined;
                const inlineTexts = [];
                const additionalLines = [];
                function addToAdditionalLines(lines, className) {
                    if (additionalLines.length > 0) {
                        const lastLine = additionalLines[additionalLines.length - 1];
                        if (className) {
                            lastLine.decorations.push(new lineDecorations_1.$MW(lastLine.content.length + 1, lastLine.content.length + 1 + lines[0].length, className, 0 /* InlineDecorationType.Regular */));
                        }
                        lastLine.content += lines[0];
                        lines = lines.slice(1);
                    }
                    for (const line of lines) {
                        additionalLines.push({
                            content: line,
                            decorations: className ? [new lineDecorations_1.$MW(1, line.length + 1, className, 0 /* InlineDecorationType.Regular */)] : []
                        });
                    }
                }
                const textBufferLine = textModel.getLineContent(ghostText.lineNumber);
                let hiddenTextStartColumn = undefined;
                let lastIdx = 0;
                for (const part of ghostText.parts) {
                    let lines = part.lines;
                    if (hiddenTextStartColumn === undefined) {
                        inlineTexts.push({
                            column: part.column,
                            text: lines[0],
                            preview: part.preview,
                        });
                        lines = lines.slice(1);
                    }
                    else {
                        addToAdditionalLines([textBufferLine.substring(lastIdx, part.column - 1)], undefined);
                    }
                    if (lines.length > 0) {
                        addToAdditionalLines(lines, exports.$T8);
                        if (hiddenTextStartColumn === undefined && part.column <= textBufferLine.length) {
                            hiddenTextStartColumn = part.column;
                        }
                    }
                    lastIdx = part.column - 1;
                }
                if (hiddenTextStartColumn !== undefined) {
                    addToAdditionalLines([textBufferLine.substring(lastIdx)], undefined);
                }
                const hiddenRange = hiddenTextStartColumn !== undefined ? new utils_1.$m5(hiddenTextStartColumn, textBufferLine.length + 1) : undefined;
                return {
                    replacedRange,
                    inlineTexts,
                    additionalLines,
                    hiddenRange,
                    lineNumber: ghostText.lineNumber,
                    additionalReservedLineCount: this.f.minReservedLineCount.read(reader),
                    targetTextModel: textModel,
                };
            });
            this.j = (0, observable_1.derived)(this, reader => {
                const uiState = this.h.read(reader);
                if (!uiState) {
                    return [];
                }
                const decorations = [];
                if (uiState.replacedRange) {
                    decorations.push({
                        range: uiState.replacedRange.toRange(uiState.lineNumber),
                        options: { inlineClassName: 'inline-completion-text-to-replace', description: 'GhostTextReplacement' }
                    });
                }
                if (uiState.hiddenRange) {
                    decorations.push({
                        range: uiState.hiddenRange.toRange(uiState.lineNumber),
                        options: { inlineClassName: 'ghost-text-hidden', description: 'ghost-text-hidden', }
                    });
                }
                for (const p of uiState.inlineTexts) {
                    decorations.push({
                        range: range_1.$ks.fromPositions(new position_1.$js(uiState.lineNumber, p.column)),
                        options: {
                            description: exports.$T8,
                            after: { content: p.text, inlineClassName: p.preview ? 'ghost-text-decoration-preview' : 'ghost-text-decoration', cursorStops: model_1.InjectedTextCursorStops.Left },
                            showIfCollapsed: true,
                        }
                    });
                }
                return decorations;
            });
            this.m = this.B(new AdditionalLinesWidget(this.c, this.g.languageIdCodec, (0, observable_1.derived)(reader => {
                /** @description lines */
                const uiState = this.h.read(reader);
                return uiState ? {
                    lineNumber: uiState.lineNumber,
                    additionalLines: uiState.additionalLines,
                    minReservedLineCount: uiState.additionalReservedLineCount,
                    targetTextModel: uiState.targetTextModel,
                } : undefined;
            })));
            this.B((0, lifecycle_1.$ic)(() => { this.a.set(true, undefined); }));
            this.B((0, utils_1.$n5)(this.c, this.j));
        }
        ownsViewZone(viewZoneId) {
            return this.m.viewZoneId === viewZoneId;
        }
    };
    exports.$U8 = $U8;
    exports.$U8 = $U8 = __decorate([
        __param(2, language_1.$ct)
    ], $U8);
    class AdditionalLinesWidget extends lifecycle_1.$kc {
        get viewZoneId() { return this.a; }
        constructor(c, f, g) {
            super();
            this.c = c;
            this.f = f;
            this.g = g;
            this.a = undefined;
            this.b = (0, observable_1.observableSignalFromEvent)('editorOptionChanged', event_1.Event.filter(this.c.onDidChangeConfiguration, e => e.hasChanged(33 /* EditorOption.disableMonospaceOptimizations */)
                || e.hasChanged(116 /* EditorOption.stopRenderingLineAfter */)
                || e.hasChanged(98 /* EditorOption.renderWhitespace */)
                || e.hasChanged(93 /* EditorOption.renderControlCharacters */)
                || e.hasChanged(51 /* EditorOption.fontLigatures */)
                || e.hasChanged(50 /* EditorOption.fontInfo */)
                || e.hasChanged(66 /* EditorOption.lineHeight */)));
            this.B((0, observable_1.autorun)(reader => {
                /** @description update view zone */
                const lines = this.g.read(reader);
                this.b.read(reader);
                if (lines) {
                    this.j(lines.lineNumber, lines.additionalLines, lines.minReservedLineCount);
                }
                else {
                    this.h();
                }
            }));
        }
        dispose() {
            super.dispose();
            this.h();
        }
        h() {
            this.c.changeViewZones((changeAccessor) => {
                if (this.a) {
                    changeAccessor.removeZone(this.a);
                    this.a = undefined;
                }
            });
        }
        j(lineNumber, additionalLines, minReservedLineCount) {
            const textModel = this.c.getModel();
            if (!textModel) {
                return;
            }
            const { tabSize } = textModel.getOptions();
            this.c.changeViewZones((changeAccessor) => {
                if (this.a) {
                    changeAccessor.removeZone(this.a);
                    this.a = undefined;
                }
                const heightInLines = Math.max(additionalLines.length, minReservedLineCount);
                if (heightInLines > 0) {
                    const domNode = document.createElement('div');
                    renderLines(domNode, tabSize, additionalLines, this.c.getOptions(), this.f);
                    this.a = changeAccessor.addZone({
                        afterLineNumber: lineNumber,
                        heightInLines: heightInLines,
                        domNode,
                        afterColumnAffinity: 1 /* PositionAffinity.Right */
                    });
                }
            });
        }
    }
    function renderLines(domNode, tabSize, lines, opts, languageIdCodec) {
        const disableMonospaceOptimizations = opts.get(33 /* EditorOption.disableMonospaceOptimizations */);
        const stopRenderingLineAfter = opts.get(116 /* EditorOption.stopRenderingLineAfter */);
        // To avoid visual confusion, we don't want to render visible whitespace
        const renderWhitespace = 'none';
        const renderControlCharacters = opts.get(93 /* EditorOption.renderControlCharacters */);
        const fontLigatures = opts.get(51 /* EditorOption.fontLigatures */);
        const fontInfo = opts.get(50 /* EditorOption.fontInfo */);
        const lineHeight = opts.get(66 /* EditorOption.lineHeight */);
        const sb = new stringBuilder_1.$Es(10000);
        sb.appendString('<div class="suggest-preview-text">');
        for (let i = 0, len = lines.length; i < len; i++) {
            const lineData = lines[i];
            const line = lineData.content;
            sb.appendString('<div class="view-line');
            sb.appendString('" style="top:');
            sb.appendString(String(i * lineHeight));
            sb.appendString('px;width:1000000px;">');
            const isBasicASCII = strings.$2e(line);
            const containsRTL = strings.$1e(line);
            const lineTokens = lineTokens_1.$Xs.createEmpty(line, languageIdCodec);
            (0, viewLineRenderer_1.$UW)(new viewLineRenderer_1.$QW((fontInfo.isMonospace && !disableMonospaceOptimizations), fontInfo.canUseHalfwidthRightwardsArrow, line, false, isBasicASCII, containsRTL, 0, lineTokens, lineData.decorations, tabSize, 0, fontInfo.spaceWidth, fontInfo.middotWidth, fontInfo.wsmiddotWidth, stopRenderingLineAfter, renderWhitespace, renderControlCharacters, fontLigatures !== editorOptions_1.EditorFontLigatures.OFF, null), sb);
            sb.appendString('</div>');
        }
        sb.appendString('</div>');
        (0, domFontInfo_1.$vU)(domNode, fontInfo);
        const html = sb.build();
        const trustedhtml = ttPolicy ? ttPolicy.createHTML(html) : html;
        domNode.innerHTML = trustedhtml;
    }
    const ttPolicy = (0, trustedTypes_1.$PQ)('editorGhostText', { createHTML: value => value });
});
//# sourceMappingURL=ghostTextWidget.js.map