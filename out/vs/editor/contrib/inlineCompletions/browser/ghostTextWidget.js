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
    exports.GhostTextWidget = exports.GHOST_TEXT_DESCRIPTION = void 0;
    exports.GHOST_TEXT_DESCRIPTION = 'ghost-text';
    let GhostTextWidget = class GhostTextWidget extends lifecycle_1.Disposable {
        constructor(editor, model, languageService) {
            super();
            this.editor = editor;
            this.model = model;
            this.languageService = languageService;
            this.isDisposed = (0, observable_1.observableValue)(this, false);
            this.currentTextModel = (0, observable_1.observableFromEvent)(this.editor.onDidChangeModel, () => this.editor.getModel());
            this.uiState = (0, observable_1.derived)(this, reader => {
                if (this.isDisposed.read(reader)) {
                    return undefined;
                }
                const textModel = this.currentTextModel.read(reader);
                if (textModel !== this.model.targetTextModel.read(reader)) {
                    return undefined;
                }
                const ghostText = this.model.ghostText.read(reader);
                if (!ghostText) {
                    return undefined;
                }
                const replacedRange = ghostText instanceof ghostText_1.GhostTextReplacement ? ghostText.columnRange : undefined;
                const inlineTexts = [];
                const additionalLines = [];
                function addToAdditionalLines(lines, className) {
                    if (additionalLines.length > 0) {
                        const lastLine = additionalLines[additionalLines.length - 1];
                        if (className) {
                            lastLine.decorations.push(new lineDecorations_1.LineDecoration(lastLine.content.length + 1, lastLine.content.length + 1 + lines[0].length, className, 0 /* InlineDecorationType.Regular */));
                        }
                        lastLine.content += lines[0];
                        lines = lines.slice(1);
                    }
                    for (const line of lines) {
                        additionalLines.push({
                            content: line,
                            decorations: className ? [new lineDecorations_1.LineDecoration(1, line.length + 1, className, 0 /* InlineDecorationType.Regular */)] : []
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
                        addToAdditionalLines(lines, exports.GHOST_TEXT_DESCRIPTION);
                        if (hiddenTextStartColumn === undefined && part.column <= textBufferLine.length) {
                            hiddenTextStartColumn = part.column;
                        }
                    }
                    lastIdx = part.column - 1;
                }
                if (hiddenTextStartColumn !== undefined) {
                    addToAdditionalLines([textBufferLine.substring(lastIdx)], undefined);
                }
                const hiddenRange = hiddenTextStartColumn !== undefined ? new utils_1.ColumnRange(hiddenTextStartColumn, textBufferLine.length + 1) : undefined;
                return {
                    replacedRange,
                    inlineTexts,
                    additionalLines,
                    hiddenRange,
                    lineNumber: ghostText.lineNumber,
                    additionalReservedLineCount: this.model.minReservedLineCount.read(reader),
                    targetTextModel: textModel,
                };
            });
            this.decorations = (0, observable_1.derived)(this, reader => {
                const uiState = this.uiState.read(reader);
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
                        range: range_1.Range.fromPositions(new position_1.Position(uiState.lineNumber, p.column)),
                        options: {
                            description: exports.GHOST_TEXT_DESCRIPTION,
                            after: { content: p.text, inlineClassName: p.preview ? 'ghost-text-decoration-preview' : 'ghost-text-decoration', cursorStops: model_1.InjectedTextCursorStops.Left },
                            showIfCollapsed: true,
                        }
                    });
                }
                return decorations;
            });
            this.additionalLinesWidget = this._register(new AdditionalLinesWidget(this.editor, this.languageService.languageIdCodec, (0, observable_1.derived)(reader => {
                /** @description lines */
                const uiState = this.uiState.read(reader);
                return uiState ? {
                    lineNumber: uiState.lineNumber,
                    additionalLines: uiState.additionalLines,
                    minReservedLineCount: uiState.additionalReservedLineCount,
                    targetTextModel: uiState.targetTextModel,
                } : undefined;
            })));
            this._register((0, lifecycle_1.toDisposable)(() => { this.isDisposed.set(true, undefined); }));
            this._register((0, utils_1.applyObservableDecorations)(this.editor, this.decorations));
        }
        ownsViewZone(viewZoneId) {
            return this.additionalLinesWidget.viewZoneId === viewZoneId;
        }
    };
    exports.GhostTextWidget = GhostTextWidget;
    exports.GhostTextWidget = GhostTextWidget = __decorate([
        __param(2, language_1.ILanguageService)
    ], GhostTextWidget);
    class AdditionalLinesWidget extends lifecycle_1.Disposable {
        get viewZoneId() { return this._viewZoneId; }
        constructor(editor, languageIdCodec, lines) {
            super();
            this.editor = editor;
            this.languageIdCodec = languageIdCodec;
            this.lines = lines;
            this._viewZoneId = undefined;
            this.editorOptionsChanged = (0, observable_1.observableSignalFromEvent)('editorOptionChanged', event_1.Event.filter(this.editor.onDidChangeConfiguration, e => e.hasChanged(33 /* EditorOption.disableMonospaceOptimizations */)
                || e.hasChanged(116 /* EditorOption.stopRenderingLineAfter */)
                || e.hasChanged(98 /* EditorOption.renderWhitespace */)
                || e.hasChanged(93 /* EditorOption.renderControlCharacters */)
                || e.hasChanged(51 /* EditorOption.fontLigatures */)
                || e.hasChanged(50 /* EditorOption.fontInfo */)
                || e.hasChanged(66 /* EditorOption.lineHeight */)));
            this._register((0, observable_1.autorun)(reader => {
                /** @description update view zone */
                const lines = this.lines.read(reader);
                this.editorOptionsChanged.read(reader);
                if (lines) {
                    this.updateLines(lines.lineNumber, lines.additionalLines, lines.minReservedLineCount);
                }
                else {
                    this.clear();
                }
            }));
        }
        dispose() {
            super.dispose();
            this.clear();
        }
        clear() {
            this.editor.changeViewZones((changeAccessor) => {
                if (this._viewZoneId) {
                    changeAccessor.removeZone(this._viewZoneId);
                    this._viewZoneId = undefined;
                }
            });
        }
        updateLines(lineNumber, additionalLines, minReservedLineCount) {
            const textModel = this.editor.getModel();
            if (!textModel) {
                return;
            }
            const { tabSize } = textModel.getOptions();
            this.editor.changeViewZones((changeAccessor) => {
                if (this._viewZoneId) {
                    changeAccessor.removeZone(this._viewZoneId);
                    this._viewZoneId = undefined;
                }
                const heightInLines = Math.max(additionalLines.length, minReservedLineCount);
                if (heightInLines > 0) {
                    const domNode = document.createElement('div');
                    renderLines(domNode, tabSize, additionalLines, this.editor.getOptions(), this.languageIdCodec);
                    this._viewZoneId = changeAccessor.addZone({
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
        const sb = new stringBuilder_1.StringBuilder(10000);
        sb.appendString('<div class="suggest-preview-text">');
        for (let i = 0, len = lines.length; i < len; i++) {
            const lineData = lines[i];
            const line = lineData.content;
            sb.appendString('<div class="view-line');
            sb.appendString('" style="top:');
            sb.appendString(String(i * lineHeight));
            sb.appendString('px;width:1000000px;">');
            const isBasicASCII = strings.isBasicASCII(line);
            const containsRTL = strings.containsRTL(line);
            const lineTokens = lineTokens_1.LineTokens.createEmpty(line, languageIdCodec);
            (0, viewLineRenderer_1.renderViewLine)(new viewLineRenderer_1.RenderLineInput((fontInfo.isMonospace && !disableMonospaceOptimizations), fontInfo.canUseHalfwidthRightwardsArrow, line, false, isBasicASCII, containsRTL, 0, lineTokens, lineData.decorations, tabSize, 0, fontInfo.spaceWidth, fontInfo.middotWidth, fontInfo.wsmiddotWidth, stopRenderingLineAfter, renderWhitespace, renderControlCharacters, fontLigatures !== editorOptions_1.EditorFontLigatures.OFF, null), sb);
            sb.appendString('</div>');
        }
        sb.appendString('</div>');
        (0, domFontInfo_1.applyFontInfo)(domNode, fontInfo);
        const html = sb.build();
        const trustedhtml = ttPolicy ? ttPolicy.createHTML(html) : html;
        domNode.innerHTML = trustedhtml;
    }
    const ttPolicy = (0, trustedTypes_1.createTrustedTypesPolicy)('editorGhostText', { createHTML: value => value });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2hvc3RUZXh0V2lkZ2V0LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvZWRpdG9yL2NvbnRyaWIvaW5saW5lQ29tcGxldGlvbnMvYnJvd3Nlci9naG9zdFRleHRXaWRnZXQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBd0JuRixRQUFBLHNCQUFzQixHQUFHLFlBQVksQ0FBQztJQU81QyxJQUFNLGVBQWUsR0FBckIsTUFBTSxlQUFnQixTQUFRLHNCQUFVO1FBSTlDLFlBQ2tCLE1BQW1CLEVBQ25CLEtBQTRCLEVBQzNCLGVBQWtEO1lBRXBFLEtBQUssRUFBRSxDQUFDO1lBSlMsV0FBTSxHQUFOLE1BQU0sQ0FBYTtZQUNuQixVQUFLLEdBQUwsS0FBSyxDQUF1QjtZQUNWLG9CQUFlLEdBQWYsZUFBZSxDQUFrQjtZQU5wRCxlQUFVLEdBQUcsSUFBQSw0QkFBZSxFQUFDLElBQUksRUFBRSxLQUFLLENBQUMsQ0FBQztZQUMxQyxxQkFBZ0IsR0FBRyxJQUFBLGdDQUFtQixFQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsZ0JBQWdCLEVBQUUsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDO1lBYW5HLFlBQU8sR0FBRyxJQUFBLG9CQUFPLEVBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxFQUFFO2dCQUNqRCxJQUFJLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUFFO29CQUNqQyxPQUFPLFNBQVMsQ0FBQztpQkFDakI7Z0JBQ0QsTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztnQkFDckQsSUFBSSxTQUFTLEtBQUssSUFBSSxDQUFDLEtBQUssQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUFF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