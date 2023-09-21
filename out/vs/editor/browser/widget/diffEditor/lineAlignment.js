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
define(["require", "exports", "vs/base/browser/dom", "vs/base/common/arrays", "vs/base/common/async", "vs/base/common/codicons", "vs/base/common/lifecycle", "vs/base/common/observable", "vs/base/common/themables", "vs/base/common/types", "vs/editor/browser/config/domFontInfo", "vs/editor/browser/stableEditorScroll", "vs/editor/browser/widget/diffEditor/decorations", "vs/editor/browser/widget/diffEditor/diffEditorViewModel", "vs/editor/browser/widget/diffEditor/inlineDiffDeletedCodeMargin", "vs/editor/browser/widget/diffEditor/renderLines", "vs/editor/browser/widget/diffEditor/utils", "vs/editor/common/core/lineRange", "vs/editor/common/core/position", "vs/editor/common/viewModel", "vs/platform/clipboard/common/clipboardService", "vs/platform/contextview/browser/contextView"], function (require, exports, dom_1, arrays_1, async_1, codicons_1, lifecycle_1, observable_1, themables_1, types_1, domFontInfo_1, stableEditorScroll_1, decorations_1, diffEditorViewModel_1, inlineDiffDeletedCodeMargin_1, renderLines_1, utils_1, lineRange_1, position_1, viewModel_1, clipboardService_1, contextView_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ViewZoneManager = void 0;
    /**
     * Ensures both editors have the same height by aligning unchanged lines.
     * In inline view mode, inserts viewzones to show deleted code from the original text model in the modified code editor.
     * Synchronizes scrolling.
     */
    let ViewZoneManager = class ViewZoneManager extends lifecycle_1.Disposable {
        constructor(_editors, _diffModel, _options, _diffEditorWidget, _canIgnoreViewZoneUpdateEvent, _clipboardService, _contextMenuService) {
            super();
            this._editors = _editors;
            this._diffModel = _diffModel;
            this._options = _options;
            this._diffEditorWidget = _diffEditorWidget;
            this._canIgnoreViewZoneUpdateEvent = _canIgnoreViewZoneUpdateEvent;
            this._clipboardService = _clipboardService;
            this._contextMenuService = _contextMenuService;
            this._originalTopPadding = (0, observable_1.observableValue)(this, 0);
            this._originalScrollOffset = (0, observable_1.observableValue)(this, 0);
            this._originalScrollOffsetAnimated = (0, utils_1.animatedObservable)(this._originalScrollOffset, this._store);
            this._modifiedTopPadding = (0, observable_1.observableValue)(this, 0);
            this._modifiedScrollOffset = (0, observable_1.observableValue)(this, 0);
            this._modifiedScrollOffsetAnimated = (0, utils_1.animatedObservable)(this._modifiedScrollOffset, this._store);
            let isChangingViewZones = false;
            const state = (0, observable_1.observableValue)('state', 0);
            const updateImmediately = this._register(new async_1.RunOnceScheduler(() => {
                state.set(state.get() + 1, undefined);
            }, 0));
            this._register(this._editors.original.onDidChangeViewZones((_args) => { if (!isChangingViewZones && !this._canIgnoreViewZoneUpdateEvent()) {
                updateImmediately.schedule();
            } }));
            this._register(this._editors.modified.onDidChangeViewZones((_args) => { if (!isChangingViewZones && !this._canIgnoreViewZoneUpdateEvent()) {
                updateImmediately.schedule();
            } }));
            this._register(this._editors.original.onDidChangeConfiguration((args) => {
                if (args.hasChanged(144 /* EditorOption.wrappingInfo */) || args.hasChanged(66 /* EditorOption.lineHeight */)) {
                    updateImmediately.schedule();
                }
            }));
            this._register(this._editors.modified.onDidChangeConfiguration((args) => {
                if (args.hasChanged(144 /* EditorOption.wrappingInfo */) || args.hasChanged(66 /* EditorOption.lineHeight */)) {
                    updateImmediately.schedule();
                }
            }));
            const originalModelTokenizationCompleted = this._diffModel.map(m => m ? (0, observable_1.observableFromEvent)(m.model.original.onDidChangeTokens, () => m.model.original.tokenization.backgroundTokenizationState === 2 /* BackgroundTokenizationState.Completed */) : undefined).map((m, reader) => m?.read(reader));
            const alignmentViewZoneIdsOrig = new Set();
            const alignmentViewZoneIdsMod = new Set();
            const alignments = (0, observable_1.derived)((reader) => {
                /** @description alignments */
                const diffModel = this._diffModel.read(reader);
                const diff = diffModel?.diff.read(reader);
                if (!diffModel || !diff) {
                    return null;
                }
                state.read(reader);
                const renderSideBySide = this._options.renderSideBySide.read(reader);
                const innerHunkAlignment = renderSideBySide;
                return computeRangeAlignment(this._editors.original, this._editors.modified, diff.mappings, alignmentViewZoneIdsOrig, alignmentViewZoneIdsMod, innerHunkAlignment);
            });
            const alignmentsSyncedMovedText = (0, observable_1.derived)((reader) => {
                /** @description alignments */
                const syncedMovedText = this._diffModel.read(reader)?.movedTextToCompare.read(reader);
                if (!syncedMovedText) {
                    return null;
                }
                state.read(reader);
                const mappings = syncedMovedText.changes.map(c => new diffEditorViewModel_1.DiffMapping(c));
                // TODO dont include alignments outside syncedMovedText
                return computeRangeAlignment(this._editors.original, this._editors.modified, mappings, alignmentViewZoneIdsOrig, alignmentViewZoneIdsMod, true);
            });
            function createFakeLinesDiv() {
                const r = document.createElement('div');
                r.className = 'diagonal-fill';
                return r;
            }
            const alignmentViewZonesDisposables = this._register(new lifecycle_1.DisposableStore());
            const alignmentViewZones = (0, observable_1.derived)((reader) => {
                /** @description alignment viewzones */
                alignmentViewZonesDisposables.clear();
                const alignmentsVal = alignments.read(reader) || [];
                const origViewZones = [];
                const modViewZones = [];
                const modifiedTopPaddingVal = this._modifiedTopPadding.read(reader);
                if (modifiedTopPaddingVal > 0) {
                    modViewZones.push({
                        afterLineNumber: 0,
                        domNode: document.createElement('div'),
                        heightInPx: modifiedTopPaddingVal,
                        showInHiddenAreas: true,
                    });
                }
                const originalTopPaddingVal = this._originalTopPadding.read(reader);
                if (originalTopPaddingVal > 0) {
                    origViewZones.push({
                        afterLineNumber: 0,
                        domNode: document.createElement('div'),
                        heightInPx: originalTopPaddingVal,
                        showInHiddenAreas: true,
                    });
                }
                const renderSideBySide = this._options.renderSideBySide.read(reader);
                const deletedCodeLineBreaksComputer = !renderSideBySide ? this._editors.modified._getViewModel()?.createLineBreaksComputer() : undefined;
                if (deletedCodeLineBreaksComputer) {
                    for (const a of alignmentsVal) {
                        if (a.diff) {
                            for (let i = a.originalRange.startLineNumber; i < a.originalRange.endLineNumberExclusive; i++) {
                                deletedCodeLineBreaksComputer?.addRequest(this._editors.original.getModel().getLineContent(i), null, null);
                            }
                        }
                    }
                }
                const lineBreakData = deletedCodeLineBreaksComputer?.finalize() ?? [];
                let lineBreakDataIdx = 0;
                const modLineHeight = this._editors.modified.getOption(66 /* EditorOption.lineHeight */);
                const syncedMovedText = this._diffModel.read(reader)?.movedTextToCompare.read(reader);
                const mightContainNonBasicASCII = this._editors.original.getModel()?.mightContainNonBasicASCII() ?? false;
                const mightContainRTL = this._editors.original.getModel()?.mightContainRTL() ?? false;
                const renderOptions = renderLines_1.RenderOptions.fromEditor(this._editors.modified);
                for (const a of alignmentsVal) {
                    if (a.diff && !renderSideBySide) {
                        if (!a.originalRange.isEmpty) {
                            originalModelTokenizationCompleted.read(reader); // Update view-zones once tokenization completes
                            const deletedCodeDomNode = document.createElement('div');
                            deletedCodeDomNode.classList.add('view-lines', 'line-delete', 'monaco-mouse-cursor-text');
                            const source = new renderLines_1.LineSource(a.originalRange.mapToLineArray(l => this._editors.original.getModel().tokenization.getLineTokens(l)), a.originalRange.mapToLineArray(_ => lineBreakData[lineBreakDataIdx++]), mightContainNonBasicASCII, mightContainRTL);
                            const decorations = [];
                            for (const i of a.diff.innerChanges || []) {
                                decorations.push(new viewModel_1.InlineDecoration(i.originalRange.delta(-(a.diff.original.startLineNumber - 1)), decorations_1.diffDeleteDecoration.className, 0 /* InlineDecorationType.Regular */));
                            }
                            const result = (0, renderLines_1.renderLines)(source, renderOptions, decorations, deletedCodeDomNode);
                            const marginDomNode = document.createElement('div');
                            marginDomNode.className = 'inline-deleted-margin-view-zone';
                            (0, domFontInfo_1.applyFontInfo)(marginDomNode, renderOptions.fontInfo);
                            if (this._options.renderIndicators.read(reader)) {
                                for (let i = 0; i < result.heightInLines; i++) {
                                    const marginElement = document.createElement('div');
                                    marginElement.className = `delete-sign ${themables_1.ThemeIcon.asClassName(decorations_1.diffRemoveIcon)}`;
                                    marginElement.setAttribute('style', `position:absolute;top:${i * modLineHeight}px;width:${renderOptions.lineDecorationsWidth}px;height:${modLineHeight}px;right:0;`);
                                    marginDomNode.appendChild(marginElement);
                                }
                            }
                            let zoneId = undefined;
                            alignmentViewZonesDisposables.add(new inlineDiffDeletedCodeMargin_1.InlineDiffDeletedCodeMargin(() => (0, types_1.assertIsDefined)(zoneId), marginDomNode, this._editors.modified, a.diff, this._diffEditorWidget, result.viewLineCounts, this._editors.original.getModel(), this._contextMenuService, this._clipboardService));
                            for (let i = 0; i < result.viewLineCounts.length; i++) {
                                const count = result.viewLineCounts[i];
                                // Account for wrapped lines in the (collapsed) original editor (which doesn't wrap lines).
                                if (count > 1) {
                                    origViewZones.push({
                                        afterLineNumber: a.originalRange.startLineNumber + i,
                                        domNode: createFakeLinesDiv(),
                                        heightInPx: (count - 1) * modLineHeight,
                                        showInHiddenAreas: true,
                                    });
                                }
                            }
                            modViewZones.push({
                                afterLineNumber: a.modifiedRange.startLineNumber - 1,
                                domNode: deletedCodeDomNode,
                                heightInPx: result.heightInLines * modLineHeight,
                                minWidthInPx: result.minWidthInPx,
                                marginDomNode,
                                setZoneId(id) { zoneId = id; },
                                showInHiddenAreas: true,
                            });
                        }
                        const marginDomNode = document.createElement('div');
                        marginDomNode.className = 'gutter-delete';
                        origViewZones.push({
                            afterLineNumber: a.originalRange.endLineNumberExclusive - 1,
                            domNode: createFakeLinesDiv(),
                            heightInPx: a.modifiedHeightInPx,
                            marginDomNode,
                            showInHiddenAreas: true,
                        });
                    }
                    else {
                        const delta = a.modifiedHeightInPx - a.originalHeightInPx;
                        if (delta > 0) {
                            if (syncedMovedText?.lineRangeMapping.original.delta(-1).deltaLength(2).contains(a.originalRange.endLineNumberExclusive - 1)) {
                                continue;
                            }
                            origViewZones.push({
                                afterLineNumber: a.originalRange.endLineNumberExclusive - 1,
                                domNode: createFakeLinesDiv(),
                                heightInPx: delta,
                                showInHiddenAreas: true,
                            });
                        }
                        else {
                            if (syncedMovedText?.lineRangeMapping.modified.delta(-1).deltaLength(2).contains(a.modifiedRange.endLineNumberExclusive - 1)) {
                                continue;
                            }
                            function createViewZoneMarginArrow() {
                                const arrow = document.createElement('div');
                                arrow.className = 'arrow-revert-change ' + themables_1.ThemeIcon.asClassName(codicons_1.Codicon.arrowRight);
                                return (0, dom_1.$)('div', {}, arrow);
                            }
                            let marginDomNode = undefined;
                            if (a.diff && a.diff.modified.isEmpty && this._options.shouldRenderRevertArrows.read(reader)) {
                                marginDomNode = createViewZoneMarginArrow();
                            }
                            modViewZones.push({
                                afterLineNumber: a.modifiedRange.endLineNumberExclusive - 1,
                                domNode: createFakeLinesDiv(),
                                heightInPx: -delta,
                                marginDomNode,
                                showInHiddenAreas: true,
                            });
                        }
                    }
                }
                for (const a of alignmentsSyncedMovedText.read(reader) ?? []) {
                    if (!syncedMovedText?.lineRangeMapping.original.intersect(a.originalRange)
                        || !syncedMovedText?.lineRangeMapping.modified.intersect(a.modifiedRange)) {
                        // ignore unrelated alignments outside the synced moved text
                        continue;
                    }
                    const delta = a.modifiedHeightInPx - a.originalHeightInPx;
                    if (delta > 0) {
                        origViewZones.push({
                            afterLineNumber: a.originalRange.endLineNumberExclusive - 1,
                            domNode: createFakeLinesDiv(),
                            heightInPx: delta,
                            showInHiddenAreas: true,
                        });
                    }
                    else {
                        modViewZones.push({
                            afterLineNumber: a.modifiedRange.endLineNumberExclusive - 1,
                            domNode: createFakeLinesDiv(),
                            heightInPx: -delta,
                            showInHiddenAreas: true,
                        });
                    }
                }
                return { orig: origViewZones, mod: modViewZones };
            });
            this._register((0, observable_1.autorunWithStore)((reader) => {
                /** @description alignment viewzones */
                const scrollState = stableEditorScroll_1.StableEditorScrollState.capture(this._editors.modified);
                const alignmentViewZones_ = alignmentViewZones.read(reader);
                isChangingViewZones = true;
                this._editors.original.changeViewZones((aOrig) => {
                    for (const id of alignmentViewZoneIdsOrig) {
                        aOrig.removeZone(id);
                    }
                    alignmentViewZoneIdsOrig.clear();
                    for (const z of alignmentViewZones_.orig) {
                        const id = aOrig.addZone(z);
                        if (z.setZoneId) {
                            z.setZoneId(id);
                        }
                        alignmentViewZoneIdsOrig.add(id);
                    }
                });
                this._editors.modified.changeViewZones(aMod => {
                    for (const id of alignmentViewZoneIdsMod) {
                        aMod.removeZone(id);
                    }
                    alignmentViewZoneIdsMod.clear();
                    for (const z of alignmentViewZones_.mod) {
                        const id = aMod.addZone(z);
                        if (z.setZoneId) {
                            z.setZoneId(id);
                        }
                        alignmentViewZoneIdsMod.add(id);
                    }
                });
                isChangingViewZones = false;
                scrollState.restore(this._editors.modified);
            }));
            this._register((0, lifecycle_1.toDisposable)(() => {
                this._editors.original.changeViewZones((a) => {
                    for (const id of alignmentViewZoneIdsOrig) {
                        a.removeZone(id);
                    }
                    alignmentViewZoneIdsOrig.clear();
                });
                this._editors.modified.changeViewZones((a) => {
                    for (const id of alignmentViewZoneIdsMod) {
                        a.removeZone(id);
                    }
                    alignmentViewZoneIdsMod.clear();
                });
            }));
            let ignoreChange = false;
            this._register(this._editors.original.onDidScrollChange(e => {
                if (e.scrollLeftChanged && !ignoreChange) {
                    ignoreChange = true;
                    this._editors.modified.setScrollLeft(e.scrollLeft);
                    ignoreChange = false;
                }
            }));
            this._register(this._editors.modified.onDidScrollChange(e => {
                if (e.scrollLeftChanged && !ignoreChange) {
                    ignoreChange = true;
                    this._editors.original.setScrollLeft(e.scrollLeft);
                    ignoreChange = false;
                }
            }));
            this._originalScrollTop = (0, observable_1.observableFromEvent)(this._editors.original.onDidScrollChange, () => this._editors.original.getScrollTop());
            this._modifiedScrollTop = (0, observable_1.observableFromEvent)(this._editors.modified.onDidScrollChange, () => this._editors.modified.getScrollTop());
            // origExtraHeight + origOffset - origScrollTop = modExtraHeight + modOffset - modScrollTop
            // origScrollTop = origExtraHeight + origOffset - modExtraHeight - modOffset + modScrollTop
            // modScrollTop = modExtraHeight + modOffset - origExtraHeight - origOffset + origScrollTop
            // origOffset - modOffset = heightOfLines(1..Y) - heightOfLines(1..X)
            // origScrollTop >= 0, modScrollTop >= 0
            this._register((0, observable_1.autorun)(reader => {
                /** @description update scroll modified */
                const newScrollTopModified = this._originalScrollTop.read(reader)
                    - (this._originalScrollOffsetAnimated.get() - this._modifiedScrollOffsetAnimated.read(reader))
                    - (this._originalTopPadding.get() - this._modifiedTopPadding.read(reader));
                if (newScrollTopModified !== this._editors.modified.getScrollTop()) {
                    this._editors.modified.setScrollTop(newScrollTopModified, 1 /* ScrollType.Immediate */);
                }
            }));
            this._register((0, observable_1.autorun)(reader => {
                /** @description update scroll original */
                const newScrollTopOriginal = this._modifiedScrollTop.read(reader)
                    - (this._modifiedScrollOffsetAnimated.get() - this._originalScrollOffsetAnimated.read(reader))
                    - (this._modifiedTopPadding.get() - this._originalTopPadding.read(reader));
                if (newScrollTopOriginal !== this._editors.original.getScrollTop()) {
                    this._editors.original.setScrollTop(newScrollTopOriginal, 1 /* ScrollType.Immediate */);
                }
            }));
            this._register((0, observable_1.autorun)(reader => {
                /** @description update editor top offsets */
                const m = this._diffModel.read(reader)?.movedTextToCompare.read(reader);
                let deltaOrigToMod = 0;
                if (m) {
                    const trueTopOriginal = this._editors.original.getTopForLineNumber(m.lineRangeMapping.original.startLineNumber, true) - this._originalTopPadding.get();
                    const trueTopModified = this._editors.modified.getTopForLineNumber(m.lineRangeMapping.modified.startLineNumber, true) - this._modifiedTopPadding.get();
                    deltaOrigToMod = trueTopModified - trueTopOriginal;
                }
                if (deltaOrigToMod > 0) {
                    this._modifiedTopPadding.set(0, undefined);
                    this._originalTopPadding.set(deltaOrigToMod, undefined);
                }
                else if (deltaOrigToMod < 0) {
                    this._modifiedTopPadding.set(-deltaOrigToMod, undefined);
                    this._originalTopPadding.set(0, undefined);
                }
                else {
                    setTimeout(() => {
                        this._modifiedTopPadding.set(0, undefined);
                        this._originalTopPadding.set(0, undefined);
                    }, 400);
                }
                if (this._editors.modified.hasTextFocus()) {
                    this._originalScrollOffset.set(this._modifiedScrollOffset.get() - deltaOrigToMod, undefined, true);
                }
                else {
                    this._modifiedScrollOffset.set(this._originalScrollOffset.get() + deltaOrigToMod, undefined, true);
                }
            }));
        }
    };
    exports.ViewZoneManager = ViewZoneManager;
    exports.ViewZoneManager = ViewZoneManager = __decorate([
        __param(5, clipboardService_1.IClipboardService),
        __param(6, contextView_1.IContextMenuService)
    ], ViewZoneManager);
    function computeRangeAlignment(originalEditor, modifiedEditor, diffs, originalEditorAlignmentViewZones, modifiedEditorAlignmentViewZones, innerHunkAlignment) {
        const originalLineHeightOverrides = new arrays_1.ArrayQueue(getAdditionalLineHeights(originalEditor, originalEditorAlignmentViewZones));
        const modifiedLineHeightOverrides = new arrays_1.ArrayQueue(getAdditionalLineHeights(modifiedEditor, modifiedEditorAlignmentViewZones));
        const origLineHeight = originalEditor.getOption(66 /* EditorOption.lineHeight */);
        const modLineHeight = modifiedEditor.getOption(66 /* EditorOption.lineHeight */);
        const result = [];
        let lastOriginalLineNumber = 0;
        let lastModifiedLineNumber = 0;
        function handleAlignmentsOutsideOfDiffs(untilOriginalLineNumberExclusive, untilModifiedLineNumberExclusive) {
            while (true) {
                let origNext = originalLineHeightOverrides.peek();
                let modNext = modifiedLineHeightOverrides.peek();
                if (origNext && origNext.lineNumber >= untilOriginalLineNumberExclusive) {
                    origNext = undefined;
                }
                if (modNext && modNext.lineNumber >= untilModifiedLineNumberExclusive) {
                    modNext = undefined;
                }
                if (!origNext && !modNext) {
                    break;
                }
                const distOrig = origNext ? origNext.lineNumber - lastOriginalLineNumber : Number.MAX_VALUE;
                const distNext = modNext ? modNext.lineNumber - lastModifiedLineNumber : Number.MAX_VALUE;
                if (distOrig < distNext) {
                    originalLineHeightOverrides.dequeue();
                    modNext = {
                        lineNumber: origNext.lineNumber - lastOriginalLineNumber + lastModifiedLineNumber,
                        heightInPx: 0,
                    };
                }
                else if (distOrig > distNext) {
                    modifiedLineHeightOverrides.dequeue();
                    origNext = {
                        lineNumber: modNext.lineNumber - lastModifiedLineNumber + lastOriginalLineNumber,
                        heightInPx: 0,
                    };
                }
                else {
                    originalLineHeightOverrides.dequeue();
                    modifiedLineHeightOverrides.dequeue();
                }
                result.push({
                    originalRange: lineRange_1.LineRange.ofLength(origNext.lineNumber, 1),
                    modifiedRange: lineRange_1.LineRange.ofLength(modNext.lineNumber, 1),
                    originalHeightInPx: origLineHeight + origNext.heightInPx,
                    modifiedHeightInPx: modLineHeight + modNext.heightInPx,
                    diff: undefined,
                });
            }
        }
        for (const m of diffs) {
            const c = m.lineRangeMapping;
            handleAlignmentsOutsideOfDiffs(c.original.startLineNumber, c.modified.startLineNumber);
            let first = true;
            let lastModLineNumber = c.modified.startLineNumber;
            let lastOrigLineNumber = c.original.startLineNumber;
            function emitAlignment(origLineNumberExclusive, modLineNumberExclusive) {
                if (origLineNumberExclusive < lastOrigLineNumber || modLineNumberExclusive < lastModLineNumber) {
                    return;
                }
                if (first) {
                    first = false;
                }
                else if (origLineNumberExclusive === lastOrigLineNumber || modLineNumberExclusive === lastModLineNumber) {
                    return;
                }
                const originalRange = new lineRange_1.LineRange(lastOrigLineNumber, origLineNumberExclusive);
                const modifiedRange = new lineRange_1.LineRange(lastModLineNumber, modLineNumberExclusive);
                if (originalRange.isEmpty && modifiedRange.isEmpty) {
                    return;
                }
                const originalAdditionalHeight = originalLineHeightOverrides
                    .takeWhile(v => v.lineNumber < origLineNumberExclusive)
                    ?.reduce((p, c) => p + c.heightInPx, 0) ?? 0;
                const modifiedAdditionalHeight = modifiedLineHeightOverrides
                    .takeWhile(v => v.lineNumber < modLineNumberExclusive)
                    ?.reduce((p, c) => p + c.heightInPx, 0) ?? 0;
                result.push({
                    originalRange,
                    modifiedRange,
                    originalHeightInPx: originalRange.length * origLineHeight + originalAdditionalHeight,
                    modifiedHeightInPx: modifiedRange.length * modLineHeight + modifiedAdditionalHeight,
                    diff: m.lineRangeMapping,
                });
                lastOrigLineNumber = origLineNumberExclusive;
                lastModLineNumber = modLineNumberExclusive;
            }
            if (innerHunkAlignment) {
                for (const i of c.innerChanges || []) {
                    if (i.originalRange.startColumn > 1 && i.modifiedRange.startColumn > 1) {
                        // There is some unmodified text on this line before the diff
                        emitAlignment(i.originalRange.startLineNumber, i.modifiedRange.startLineNumber);
                    }
                    if (i.originalRange.endColumn < originalEditor.getModel().getLineMaxColumn(i.originalRange.endLineNumber)) {
                        // // There is some unmodified text on this line after the diff
                        emitAlignment(i.originalRange.endLineNumber, i.modifiedRange.endLineNumber);
                    }
                }
            }
            emitAlignment(c.original.endLineNumberExclusive, c.modified.endLineNumberExclusive);
            lastOriginalLineNumber = c.original.endLineNumberExclusive;
            lastModifiedLineNumber = c.modified.endLineNumberExclusive;
        }
        handleAlignmentsOutsideOfDiffs(Number.MAX_VALUE, Number.MAX_VALUE);
        return result;
    }
    function getAdditionalLineHeights(editor, viewZonesToIgnore) {
        const viewZoneHeights = [];
        const wrappingZoneHeights = [];
        const hasWrapping = editor.getOption(144 /* EditorOption.wrappingInfo */).wrappingColumn !== -1;
        const coordinatesConverter = editor._getViewModel().coordinatesConverter;
        const editorLineHeight = editor.getOption(66 /* EditorOption.lineHeight */);
        if (hasWrapping) {
            for (let i = 1; i <= editor.getModel().getLineCount(); i++) {
                const lineCount = coordinatesConverter.getModelLineViewLineCount(i);
                if (lineCount > 1) {
                    wrappingZoneHeights.push({ lineNumber: i, heightInPx: editorLineHeight * (lineCount - 1) });
                }
            }
        }
        for (const w of editor.getWhitespaces()) {
            if (viewZonesToIgnore.has(w.id)) {
                continue;
            }
            const modelLineNumber = w.afterLineNumber === 0 ? 0 : coordinatesConverter.convertViewPositionToModelPosition(new position_1.Position(w.afterLineNumber, 1)).lineNumber;
            viewZoneHeights.push({ lineNumber: modelLineNumber, heightInPx: w.height });
        }
        const result = (0, utils_1.joinCombine)(viewZoneHeights, wrappingZoneHeights, v => v.lineNumber, (v1, v2) => ({ lineNumber: v1.lineNumber, heightInPx: v1.heightInPx + v2.heightInPx }));
        return result;
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGluZUFsaWdubWVudC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL2VkaXRvci9icm93c2VyL3dpZGdldC9kaWZmRWRpdG9yL2xpbmVBbGlnbm1lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBZ0NoRzs7OztPQUlHO0lBQ0ksSUFBTSxlQUFlLEdBQXJCLE1BQU0sZUFBZ0IsU0FBUSxzQkFBVTtRQVc5QyxZQUNrQixRQUEyQixFQUMzQixVQUF3RCxFQUN4RCxRQUEyQixFQUMzQixpQkFBbUMsRUFDbkMsNkJBQTRDLEVBQzFDLGlCQUFxRCxFQUNuRCxtQkFBeUQ7WUFFOUUsS0FBSyxFQUFFLENBQUM7WUFSUyxhQUFRLEdBQVIsUUFBUSxDQUFtQjtZQUMzQixlQUFVLEdBQVYsVUFBVSxDQUE4QztZQUN4RCxhQUFRLEdBQVIsUUFBUSxDQUFtQjtZQUMzQixzQkFBaUIsR0FBakIsaUJBQWlCLENBQWtCO1lBQ25DLGtDQUE2QixHQUE3Qiw2QkFBNkIsQ0FBZTtZQUN6QixzQkFBaUIsR0FBakIsaUJBQWlCLENBQW1CO1lBQ2xDLHdCQUFtQixHQUFuQixtQkFBbUIsQ0FBcUI7WUFqQjlELHdCQUFtQixHQUFHLElBQUEsNEJBQWUsRUFBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFFL0MsMEJBQXFCLEdBQUcsSUFBQSw0QkFBZSxFQUFrQixJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDbEUsa0NBQTZCLEdBQUcsSUFBQSwwQkFBa0IsRUFBQyxJQUFJLENBQUMscUJBQXFCLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBRTVGLHdCQUFtQixHQUFHLElBQUEsNEJBQWUsRUFBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFFL0MsMEJBQXFCLEdBQUcsSUFBQSw0QkFBZSxFQUFrQixJQUFJLEVBQUUsQ0FBQyxDQUFDLENB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