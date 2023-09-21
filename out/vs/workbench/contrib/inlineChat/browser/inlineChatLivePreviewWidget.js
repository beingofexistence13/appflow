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
define(["require", "exports", "vs/base/browser/dom", "vs/base/common/lifecycle", "vs/base/common/types", "vs/editor/browser/widget/embeddedCodeEditorWidget", "vs/editor/common/core/range", "vs/editor/contrib/zoneWidget/browser/zoneWidget", "vs/platform/instantiation/common/instantiation", "vs/platform/theme/common/colorRegistry", "vs/editor/common/core/editorColorRegistry", "vs/platform/theme/common/themeService", "vs/workbench/contrib/inlineChat/common/inlineChat", "vs/editor/common/core/lineRange", "vs/editor/common/diff/rangeMapping", "vs/editor/common/core/position", "vs/editor/browser/editorExtensions", "vs/platform/log/common/log", "vs/workbench/contrib/inlineChat/browser/utils", "vs/workbench/browser/labels", "vs/platform/files/common/files", "vs/editor/common/services/model", "vs/editor/common/core/editOperation", "vs/editor/common/languages/language", "vs/editor/contrib/folding/browser/folding", "vs/editor/contrib/wordHighlighter/browser/wordHighlighter", "vs/platform/accessibility/common/accessibility"], function (require, exports, dom_1, lifecycle_1, types_1, embeddedCodeEditorWidget_1, range_1, zoneWidget_1, instantiation_1, colorRegistry, editorColorRegistry, themeService_1, inlineChat_1, lineRange_1, rangeMapping_1, position_1, editorExtensions_1, log_1, utils_1, labels_1, files_1, model_1, editOperation_1, language_1, folding_1, wordHighlighter_1, accessibility_1) {
    "use strict";
    var InlineChatLivePreviewWidget_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.InlineChatFileCreatePreviewWidget = exports.InlineChatLivePreviewWidget = void 0;
    let InlineChatLivePreviewWidget = class InlineChatLivePreviewWidget extends zoneWidget_1.ZoneWidget {
        static { InlineChatLivePreviewWidget_1 = this; }
        static { this._hideId = 'overlayDiff'; }
        constructor(editor, _session, instantiationService, themeService, _logService, accessibilityService) {
            super(editor, { showArrow: false, showFrame: false, isResizeable: false, isAccessible: true, allowUnlimitedHeight: true, showInHiddenAreas: true, ordinal: 10000 + 1 });
            this._session = _session;
            this._logService = _logService;
            this.accessibilityService = accessibilityService;
            this._elements = (0, dom_1.h)('div.inline-chat-diff-widget@domNode');
            this._sessionStore = this._disposables.add(new lifecycle_1.DisposableStore());
            this._isVisible = false;
            this._isDiffLocked = false;
            super.create();
            (0, types_1.assertType)(editor.hasModel());
            const diffContributions = editorExtensions_1.EditorExtensionsRegistry
                .getEditorContributions()
                .filter(c => c.id !== inlineChat_1.INLINE_CHAT_ID && c.id !== folding_1.FoldingController.ID);
            this._diffEditor = instantiationService.createInstance(embeddedCodeEditorWidget_1.EmbeddedDiffEditorWidget, this._elements.domNode, {
                scrollbar: { useShadows: false, alwaysConsumeMouseWheel: false },
                scrollBeyondLastLine: false,
                renderMarginRevertIcon: true,
                renderOverviewRuler: false,
                rulers: undefined,
                overviewRulerBorder: undefined,
                overviewRulerLanes: 0,
                diffAlgorithm: 'advanced',
                splitViewDefaultRatio: 0.35,
                padding: { top: 0, bottom: 0 },
                folding: false,
                diffCodeLens: false,
                stickyScroll: { enabled: false },
                minimap: { enabled: false },
                isInEmbeddedEditor: true,
                overflowWidgetsDomNode: editor.getOverflowWidgetsDomNode(),
                onlyShowAccessibleDiffViewer: this.accessibilityService.isScreenReaderOptimized(),
            }, {
                originalEditor: { contributions: diffContributions },
                modifiedEditor: { contributions: diffContributions }
            }, editor);
            this._disposables.add(this._diffEditor);
            this._diffEditor.setModel({ original: this._session.textModel0, modified: editor.getModel() });
            this._diffEditor.updateOptions({
                lineDecorationsWidth: editor.getLayoutInfo().decorationsWidth
            });
            const highlighter = wordHighlighter_1.WordHighlighterContribution.get(editor);
            if (highlighter) {
                this._disposables.add(highlighter.linkWordHighlighters(this._diffEditor.getModifiedEditor()));
            }
            const doStyle = () => {
                const theme = themeService.getColorTheme();
                const overrides = [
                    [colorRegistry.editorBackground, inlineChat_1.inlineChatRegionHighlight],
                    [editorColorRegistry.editorGutter, inlineChat_1.inlineChatRegionHighlight],
                    [colorRegistry.diffInsertedLine, inlineChat_1.inlineChatDiffInserted],
                    [colorRegistry.diffInserted, inlineChat_1.inlineChatDiffInserted],
                    [colorRegistry.diffRemovedLine, inlineChat_1.inlineChatDiffRemoved],
                    [colorRegistry.diffRemoved, inlineChat_1.inlineChatDiffRemoved],
                ];
                for (const [target, source] of overrides) {
                    const value = theme.getColor(source);
                    if (value) {
                        this._elements.domNode.style.setProperty(colorRegistry.asCssVariableName(target), String(value));
                    }
                }
            };
            doStyle();
            this._disposables.add(themeService.onDidColorThemeChange(doStyle));
        }
        _fillContainer(container) {
            container.appendChild(this._elements.domNode);
        }
        // --- show / hide --------------------
        get isVisible() {
            return this._isVisible;
        }
        hide() {
            this._cleanupFullDiff();
            this._sessionStore.clear();
            super.hide();
            this._isVisible = false;
        }
        show() {
            (0, types_1.assertType)(this.editor.hasModel());
            this._sessionStore.clear();
            this._isDiffLocked = false;
            this._isVisible = true;
            this._sessionStore.add(this._diffEditor.onDidUpdateDiff(() => {
                const result = this._diffEditor.getDiffComputationResult();
                const hasFocus = this._diffEditor.hasTextFocus();
                this._updateFromChanges(this._session.wholeRange.value, result?.changes2 ?? []);
                // TODO@jrieken find a better fix for this. this is the challenge:
                // the _doShowForChanges method invokes show of the zone widget which removes and adds the
                // zone and overlay parts. this dettaches and reattaches the dom nodes which means they lose
                // focus
                if (hasFocus) {
                    this._diffEditor.focus();
                }
            }));
            this._updateFromChanges(this._session.wholeRange.value, this._session.lastTextModelChanges);
        }
        lockToDiff() {
            this._isDiffLocked = true;
        }
        _updateFromChanges(range, changes) {
            (0, types_1.assertType)(this.editor.hasModel());
            if (this._isDiffLocked) {
                return;
            }
            if (changes.length === 0 || this._session.textModel0.getValueLength() === 0) {
                // no change or changes to an empty file
                this._logService.debug('[IE] livePreview-mode: no diff');
                this._cleanupFullDiff();
            }
            else {
                // complex changes
                this._logService.debug('[IE] livePreview-mode: full diff');
                this._renderChangesWithFullDiff(changes, range);
            }
        }
        // --- full diff
        _renderChangesWithFullDiff(changes, range) {
            const modified = this.editor.getModel();
            const ranges = this._computeHiddenRanges(modified, range, changes);
            this._hideEditorRanges(this.editor, [ranges.modifiedHidden]);
            this._hideEditorRanges(this._diffEditor.getOriginalEditor(), ranges.originalDiffHidden);
            this._hideEditorRanges(this._diffEditor.getModifiedEditor(), ranges.modifiedDiffHidden);
            this._diffEditor.revealLine(ranges.modifiedHidden.startLineNumber, 1 /* ScrollType.Immediate */);
            const lineCountModified = ranges.modifiedHidden.length;
            const lineCountOriginal = ranges.originalHidden.length;
            const lineHeightDiff = Math.max(lineCountModified, lineCountOriginal);
            const lineHeightPadding = (this.editor.getOption(66 /* EditorOption.lineHeight */) / 12) /* padding-top/bottom*/;
            const heightInLines = lineHeightDiff + lineHeightPadding;
            super.show(ranges.anchor, heightInLines);
            this._logService.debug(`[IE] diff SHOWING at ${ranges.anchor} with ${heightInLines} lines height`);
        }
        _cleanupFullDiff() {
            this.editor.setHiddenAreas([], InlineChatLivePreviewWidget_1._hideId);
            this._diffEditor.getOriginalEditor().setHiddenAreas([], InlineChatLivePreviewWidget_1._hideId);
            this._diffEditor.getModifiedEditor().setHiddenAreas([], InlineChatLivePreviewWidget_1._hideId);
            super.hide();
        }
        _computeHiddenRanges(model, range, changes) {
            if (changes.length === 0) {
                changes = [new rangeMapping_1.DetailedLineRangeMapping(lineRange_1.LineRange.fromRange(range), lineRange_1.LineRange.fromRange(range), undefined)];
            }
            let originalLineRange = changes[0].original;
            let modifiedLineRange = changes[0].modified;
            for (let i = 1; i < changes.length; i++) {
                originalLineRange = originalLineRange.join(changes[i].original);
                modifiedLineRange = modifiedLineRange.join(changes[i].modified);
            }
            const startDelta = modifiedLineRange.startLineNumber - range.startLineNumber;
            if (startDelta > 0) {
                modifiedLineRange = new lineRange_1.LineRange(modifiedLineRange.startLineNumber - startDelta, modifiedLineRange.endLineNumberExclusive);
                originalLineRange = new lineRange_1.LineRange(originalLineRange.startLineNumber - startDelta, originalLineRange.endLineNumberExclusive);
            }
            const endDelta = range.endLineNumber - (modifiedLineRange.endLineNumberExclusive - 1);
            if (endDelta > 0) {
                modifiedLineRange = new lineRange_1.LineRange(modifiedLineRange.startLineNumber, modifiedLineRange.endLineNumberExclusive + endDelta);
                originalLineRange = new lineRange_1.LineRange(originalLineRange.startLineNumber, originalLineRange.endLineNumberExclusive + endDelta);
            }
            const originalDiffHidden = (0, utils_1.invertLineRange)(originalLineRange, this._session.textModel0);
            const modifiedDiffHidden = (0, utils_1.invertLineRange)(modifiedLineRange, model);
            return {
                originalHidden: originalLineRange,
                originalDiffHidden,
                modifiedHidden: modifiedLineRange,
                modifiedDiffHidden,
                anchor: new position_1.Position(modifiedLineRange.endLineNumberExclusive - 1, Number.MAX_SAFE_INTEGER)
            };
        }
        _hideEditorRanges(editor, lineRanges) {
            (0, types_1.assertType)(editor.hasModel());
            lineRanges = lineRanges.filter(range => !range.isEmpty);
            if (lineRanges.length === 0) {
                // todo?
                this._logService.debug(`[IE] diff NOTHING to hide for ${editor.getId()} with ${String(editor.getModel()?.uri)}`);
                return;
            }
            let hiddenRanges;
            const hiddenLinesCount = lineRanges.reduce((p, c) => p + c.length, 0); // assumes no overlap
            if (hiddenLinesCount >= editor.getModel().getLineCount()) {
                // TODO: not every line can be hidden, keep the first line around
                hiddenRanges = [editor.getModel().getFullModelRange().delta(1)];
            }
            else {
                hiddenRanges = lineRanges.map(utils_1.lineRangeAsRange);
            }
            editor.setHiddenAreas(hiddenRanges, InlineChatLivePreviewWidget_1._hideId);
            this._logService.debug(`[IE] diff HIDING ${hiddenRanges} for ${editor.getId()} with ${String(editor.getModel()?.uri)}`);
        }
        revealRange(range, isLastLine) {
            // ignore
        }
        // --- layout -------------------------
        _onWidth(widthInPixel) {
            if (this._dim) {
                this._doLayout(this._dim.height, widthInPixel);
            }
        }
        _doLayout(heightInPixel, widthInPixel) {
            const newDim = new dom_1.Dimension(widthInPixel, heightInPixel);
            if (!dom_1.Dimension.equals(this._dim, newDim)) {
                this._dim = newDim;
                this._diffEditor.layout(this._dim.with(undefined, this._dim.height - 12 /* padding */));
                this._logService.debug('[IE] diff LAYOUT', this._dim);
            }
        }
    };
    exports.InlineChatLivePreviewWidget = InlineChatLivePreviewWidget;
    exports.InlineChatLivePreviewWidget = InlineChatLivePreviewWidget = InlineChatLivePreviewWidget_1 = __decorate([
        __param(2, instantiation_1.IInstantiationService),
        __param(3, themeService_1.IThemeService),
        __param(4, log_1.ILogService),
        __param(5, accessibility_1.IAccessibilityService)
    ], InlineChatLivePreviewWidget);
    let InlineChatFileCreatePreviewWidget = class InlineChatFileCreatePreviewWidget extends zoneWidget_1.ZoneWidget {
        constructor(parentEditor, instaService, _languageService, _modelService, themeService) {
            super(parentEditor, { showArrow: false, showFrame: false, isResizeable: false, isAccessible: true, showInHiddenAreas: true, ordinal: 10000 + 2 });
            this._languageService = _languageService;
            this._modelService = _modelService;
            this._elements = (0, dom_1.h)('div.inline-chat-newfile-widget@domNode', [
                (0, dom_1.h)('div.title@title', [
                    (0, dom_1.h)('span.name.show-file-icons@name'),
                    (0, dom_1.h)('span.detail@detail'),
                ]),
                (0, dom_1.h)('div.editor@editor'),
            ]);
            this._previewModel = new lifecycle_1.MutableDisposable();
            super.create();
            this._name = instaService.createInstance(labels_1.ResourceLabel, this._elements.name, { supportIcons: true });
            const contributions = editorExtensions_1.EditorExtensionsRegistry
                .getEditorContributions()
                .filter(c => c.id !== inlineChat_1.INLINE_CHAT_ID);
            this._previewEditor = instaService.createInstance(embeddedCodeEditorWidget_1.EmbeddedCodeEditorWidget, this._elements.editor, {
                scrollBeyondLastLine: false,
                stickyScroll: { enabled: false },
                readOnly: true,
                minimap: { enabled: false },
                scrollbar: { alwaysConsumeMouseWheel: false, useShadows: true },
            }, { isSimpleWidget: true, contributions }, parentEditor);
            const doStyle = () => {
                const theme = themeService.getColorTheme();
                const overrides = [
                    [colorRegistry.editorBackground, inlineChat_1.inlineChatRegionHighlight],
                    [editorColorRegistry.editorGutter, inlineChat_1.inlineChatRegionHighlight],
                ];
                for (const [target, source] of overrides) {
                    const value = theme.getColor(source);
                    if (value) {
                        this._elements.domNode.style.setProperty(colorRegistry.asCssVariableName(target), String(value));
                    }
                }
            };
            doStyle();
            this._disposables.add(themeService.onDidColorThemeChange(doStyle));
        }
        dispose() {
            this._name.dispose();
            this._previewEditor.dispose();
            this._previewModel.dispose();
            super.dispose();
        }
        _fillContainer(container) {
            container.appendChild(this._elements.domNode);
        }
        show() {
            throw new Error('Use showFileCreation');
        }
        showCreation(where, uri, edits) {
            this._name.element.setFile(uri, { fileKind: files_1.FileKind.FILE });
            const langSelection = this._languageService.createByFilepathOrFirstLine(uri, undefined);
            const model = this._modelService.createModel('', langSelection, undefined, true);
            model.applyEdits(edits.map(edit => editOperation_1.EditOperation.replace(range_1.Range.lift(edit.range), edit.text)));
            this._previewModel.value = model;
            this._previewEditor.setModel(model);
            const lineHeight = this.editor.getOption(66 /* EditorOption.lineHeight */);
            this._elements.title.style.height = `${lineHeight}px`;
            const maxLines = Math.max(4, Math.floor((this.editor.getLayoutInfo().height / lineHeight) / .33));
            const lines = Math.min(maxLines, model.getLineCount());
            const lineHeightPadding = (lineHeight / 12) /* padding-top/bottom*/;
            super.show(where, lines + 1 + lineHeightPadding);
        }
        // --- layout
        revealRange(range, isLastLine) {
            // ignore
        }
        _onWidth(widthInPixel) {
            if (this._dim) {
                this._doLayout(this._dim.height, widthInPixel);
            }
        }
        _doLayout(heightInPixel, widthInPixel) {
            const { lineNumbersLeft } = this.editor.getLayoutInfo();
            this._elements.title.style.marginLeft = `${lineNumbersLeft}px`;
            const newDim = new dom_1.Dimension(widthInPixel, heightInPixel);
            if (!dom_1.Dimension.equals(this._dim, newDim)) {
                this._dim = newDim;
                const oneLineHeightInPx = this.editor.getOption(66 /* EditorOption.lineHeight */);
                this._previewEditor.layout(this._dim.with(undefined, this._dim.height - oneLineHeightInPx /* title */));
            }
        }
    };
    exports.InlineChatFileCreatePreviewWidget = InlineChatFileCreatePreviewWidget;
    exports.InlineChatFileCreatePreviewWidget = InlineChatFileCreatePreviewWidget = __decorate([
        __param(1, instantiation_1.IInstantiationService),
        __param(2, language_1.ILanguageService),
        __param(3, model_1.IModelService),
        __param(4, themeService_1.IThemeService)
    ], InlineChatFileCreatePreviewWidget);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5saW5lQ2hhdExpdmVQcmV2aWV3V2lkZ2V0LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvaW5saW5lQ2hhdC9icm93c2VyL2lubGluZUNoYXRMaXZlUHJldmlld1dpZGdldC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7O0lBbUN6RixJQUFNLDJCQUEyQixHQUFqQyxNQUFNLDJCQUE0QixTQUFRLHVCQUFVOztpQkFFbEMsWUFBTyxHQUFHLGFBQWEsQUFBaEIsQ0FBaUI7UUFVaEQsWUFDQyxNQUFtQixFQUNGLFFBQWlCLEVBQ1gsb0JBQTJDLEVBQ25ELFlBQTJCLEVBQzdCLFdBQXlDLEVBQy9CLG9CQUE0RDtZQUVuRixLQUFLLENBQUMsTUFBTSxFQUFFLEVBQUUsU0FBUyxFQUFFLEtBQUssRUFBRSxTQUFTLEVBQUUsS0FBSyxFQUFFLFlBQVksRUFBRSxLQUFLLEVBQUUsWUFBWSxFQUFFLElBQUksRUFBRSxvQkFBb0IsRUFBRSxJQUFJLEVBQUUsaUJBQWlCLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSxLQUFLLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQztZQU52SixhQUFRLEdBQVIsUUFBUSxDQUFTO1lBR0osZ0JBQVcsR0FBWCxXQUFXLENBQWE7WUFDZCx5QkFBb0IsR0FBcEIsb0JBQW9CLENBQXVCO1lBZG5FLGNBQVMsR0FBRyxJQUFBLE9BQUMsRUFBQyxxQ0FBcUMsQ0FBQyxDQUFDO1lBRXJELGtCQUFhLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxHQUFHLENBQUMsSUFBSSwyQkFBZSxFQUFFLENBQUMsQ0FBQztZQUd0RSxlQUFVLEdBQVksS0FBSyxDQUFDO1lBQzVCLGtCQUFhLEdBQVksS0FBSyxDQUFDO1lBV3RDLEtBQUssQ0FBQyxNQUFNLEVBQUUsQ0FBQztZQUNmLElBQUEsa0JBQVUsRUFBQyxN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