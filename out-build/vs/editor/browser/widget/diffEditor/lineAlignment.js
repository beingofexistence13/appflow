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
    exports.$2Z = void 0;
    /**
     * Ensures both editors have the same height by aligning unchanged lines.
     * In inline view mode, inserts viewzones to show deleted code from the original text model in the modified code editor.
     * Synchronizes scrolling.
     */
    let $2Z = class $2Z extends lifecycle_1.$kc {
        constructor(u, y, C, D, F, G, H) {
            super();
            this.u = u;
            this.y = y;
            this.C = C;
            this.D = D;
            this.F = F;
            this.G = G;
            this.H = H;
            this.b = (0, observable_1.observableValue)(this, 0);
            this.g = (0, observable_1.observableValue)(this, 0);
            this.h = (0, utils_1.$aZ)(this.g, this.q);
            this.j = (0, observable_1.observableValue)(this, 0);
            this.s = (0, observable_1.observableValue)(this, 0);
            this.t = (0, utils_1.$aZ)(this.s, this.q);
            let isChangingViewZones = false;
            const state = (0, observable_1.observableValue)('state', 0);
            const updateImmediately = this.B(new async_1.$Sg(() => {
                state.set(state.get() + 1, undefined);
            }, 0));
            this.B(this.u.original.onDidChangeViewZones((_args) => { if (!isChangingViewZones && !this.F()) {
                updateImmediately.schedule();
            } }));
            this.B(this.u.modified.onDidChangeViewZones((_args) => { if (!isChangingViewZones && !this.F()) {
                updateImmediately.schedule();
            } }));
            this.B(this.u.original.onDidChangeConfiguration((args) => {
                if (args.hasChanged(144 /* EditorOption.wrappingInfo */) || args.hasChanged(66 /* EditorOption.lineHeight */)) {
                    updateImmediately.schedule();
                }
            }));
            this.B(this.u.modified.onDidChangeConfiguration((args) => {
                if (args.hasChanged(144 /* EditorOption.wrappingInfo */) || args.hasChanged(66 /* EditorOption.lineHeight */)) {
                    updateImmediately.schedule();
                }
            }));
            const originalModelTokenizationCompleted = this.y.map(m => m ? (0, observable_1.observableFromEvent)(m.model.original.onDidChangeTokens, () => m.model.original.tokenization.backgroundTokenizationState === 2 /* BackgroundTokenizationState.Completed */) : undefined).map((m, reader) => m?.read(reader));
            const alignmentViewZoneIdsOrig = new Set();
            const alignmentViewZoneIdsMod = new Set();
            const alignments = (0, observable_1.derived)((reader) => {
                /** @description alignments */
                const diffModel = this.y.read(reader);
                const diff = diffModel?.diff.read(reader);
                if (!diffModel || !diff) {
                    return null;
                }
                state.read(reader);
                const renderSideBySide = this.C.renderSideBySide.read(reader);
                const innerHunkAlignment = renderSideBySide;
                return computeRangeAlignment(this.u.original, this.u.modified, diff.mappings, alignmentViewZoneIdsOrig, alignmentViewZoneIdsMod, innerHunkAlignment);
            });
            const alignmentsSyncedMovedText = (0, observable_1.derived)((reader) => {
                /** @description alignments */
                const syncedMovedText = this.y.read(reader)?.movedTextToCompare.read(reader);
                if (!syncedMovedText) {
                    return null;
                }
                state.read(reader);
                const mappings = syncedMovedText.changes.map(c => new diffEditorViewModel_1.$oZ(c));
                // TODO dont include alignments outside syncedMovedText
                return computeRangeAlignment(this.u.original, this.u.modified, mappings, alignmentViewZoneIdsOrig, alignmentViewZoneIdsMod, true);
            });
            function createFakeLinesDiv() {
                const r = document.createElement('div');
                r.className = 'diagonal-fill';
                return r;
            }
            const alignmentViewZonesDisposables = this.B(new lifecycle_1.$jc());
            const alignmentViewZones = (0, observable_1.derived)((reader) => {
                /** @description alignment viewzones */
                alignmentViewZonesDisposables.clear();
                const alignmentsVal = alignments.read(reader) || [];
                const origViewZones = [];
                const modViewZones = [];
                const modifiedTopPaddingVal = this.j.read(reader);
                if (modifiedTopPaddingVal > 0) {
                    modViewZones.push({
                        afterLineNumber: 0,
                        domNode: document.createElement('div'),
                        heightInPx: modifiedTopPaddingVal,
                        showInHiddenAreas: true,
                    });
                }
                const originalTopPaddingVal = this.b.read(reader);
                if (originalTopPaddingVal > 0) {
                    origViewZones.push({
                        afterLineNumber: 0,
                        domNode: document.createElement('div'),
                        heightInPx: originalTopPaddingVal,
                        showInHiddenAreas: true,
                    });
                }
                const renderSideBySide = this.C.renderSideBySide.read(reader);
                const deletedCodeLineBreaksComputer = !renderSideBySide ? this.u.modified._getViewModel()?.createLineBreaksComputer() : undefined;
                if (deletedCodeLineBreaksComputer) {
                    for (const a of alignmentsVal) {
                        if (a.diff) {
                            for (let i = a.originalRange.startLineNumber; i < a.originalRange.endLineNumberExclusive; i++) {
                                deletedCodeLineBreaksComputer?.addRequest(this.u.original.getModel().getLineContent(i), null, null);
                            }
                        }
                    }
                }
                const lineBreakData = deletedCodeLineBreaksComputer?.finalize() ?? [];
                let lineBreakDataIdx = 0;
                const modLineHeight = this.u.modified.getOption(66 /* EditorOption.lineHeight */);
                const syncedMovedText = this.y.read(reader)?.movedTextToCompare.read(reader);
                const mightContainNonBasicASCII = this.u.original.getModel()?.mightContainNonBasicASCII() ?? false;
                const mightContainRTL = this.u.original.getModel()?.mightContainRTL() ?? false;
                const renderOptions = renderLines_1.$1Z.fromEditor(this.u.modified);
                for (const a of alignmentsVal) {
                    if (a.diff && !renderSideBySide) {
                        if (!a.originalRange.isEmpty) {
                            originalModelTokenizationCompleted.read(reader); // Update view-zones once tokenization completes
                            const deletedCodeDomNode = document.createElement('div');
                            deletedCodeDomNode.classList.add('view-lines', 'line-delete', 'monaco-mouse-cursor-text');
                            const source = new renderLines_1.$ZZ(a.originalRange.mapToLineArray(l => this.u.original.getModel().tokenization.getLineTokens(l)), a.originalRange.mapToLineArray(_ => lineBreakData[lineBreakDataIdx++]), mightContainNonBasicASCII, mightContainRTL);
                            const decorations = [];
                            for (const i of a.diff.innerChanges || []) {
                                decorations.push(new viewModel_1.$bV(i.originalRange.delta(-(a.diff.original.startLineNumber - 1)), decorations_1.$HZ.className, 0 /* InlineDecorationType.Regular */));
                            }
                            const result = (0, renderLines_1.$YZ)(source, renderOptions, decorations, deletedCodeDomNode);
                            const marginDomNode = document.createElement('div');
                            marginDomNode.className = 'inline-deleted-margin-view-zone';
                            (0, domFontInfo_1.$vU)(marginDomNode, renderOptions.fontInfo);
                            if (this.C.renderIndicators.read(reader)) {
                                for (let i = 0; i < result.heightInLines; i++) {
                                    const marginElement = document.createElement('div');
                                    marginElement.className = `delete-sign ${themables_1.ThemeIcon.asClassName(decorations_1.$zZ)}`;
                                    marginElement.setAttribute('style', `position:absolute;top:${i * modLineHeight}px;width:${renderOptions.lineDecorationsWidth}px;height:${modLineHeight}px;right:0;`);
                                    marginDomNode.appendChild(marginElement);
                                }
                            }
                            let zoneId = undefined;
                            alignmentViewZonesDisposables.add(new inlineDiffDeletedCodeMargin_1.$XZ(() => (0, types_1.$uf)(zoneId), marginDomNode, this.u.modified, a.diff, this.D, result.viewLineCounts, this.u.original.getModel(), this.H, this.G));
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
                                arrow.className = 'arrow-revert-change ' + themables_1.ThemeIcon.asClassName(codicons_1.$Pj.arrowRight);
                                return (0, dom_1.$)('div', {}, arrow);
                            }
                            let marginDomNode = undefined;
                            if (a.diff && a.diff.modified.isEmpty && this.C.shouldRenderRevertArrows.read(reader)) {
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
            this.B((0, observable_1.autorunWithStore)((reader) => {
                /** @description alignment viewzones */
                const scrollState = stableEditorScroll_1.$TZ.capture(this.u.modified);
                const alignmentViewZones_ = alignmentViewZones.read(reader);
                isChangingViewZones = true;
                this.u.original.changeViewZones((aOrig) => {
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
                this.u.modified.changeViewZones(aMod => {
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
                scrollState.restore(this.u.modified);
            }));
            this.B((0, lifecycle_1.$ic)(() => {
                this.u.original.changeViewZones((a) => {
                    for (const id of alignmentViewZoneIdsOrig) {
                        a.removeZone(id);
                    }
                    alignmentViewZoneIdsOrig.clear();
                });
                this.u.modified.changeViewZones((a) => {
                    for (const id of alignmentViewZoneIdsMod) {
                        a.removeZone(id);
                    }
                    alignmentViewZoneIdsMod.clear();
                });
            }));
            let ignoreChange = false;
            this.B(this.u.original.onDidScrollChange(e => {
                if (e.scrollLeftChanged && !ignoreChange) {
                    ignoreChange = true;
                    this.u.modified.setScrollLeft(e.scrollLeft);
                    ignoreChange = false;
                }
            }));
            this.B(this.u.modified.onDidScrollChange(e => {
                if (e.scrollLeftChanged && !ignoreChange) {
                    ignoreChange = true;
                    this.u.original.setScrollLeft(e.scrollLeft);
                    ignoreChange = false;
                }
            }));
            this.f = (0, observable_1.observableFromEvent)(this.u.original.onDidScrollChange, () => this.u.original.getScrollTop());
            this.n = (0, observable_1.observableFromEvent)(this.u.modified.onDidScrollChange, () => this.u.modified.getScrollTop());
            // origExtraHeight + origOffset - origScrollTop = modExtraHeight + modOffset - modScrollTop
            // origScrollTop = origExtraHeight + origOffset - modExtraHeight - modOffset + modScrollTop
            // modScrollTop = modExtraHeight + modOffset - origExtraHeight - origOffset + origScrollTop
            // origOffset - modOffset = heightOfLines(1..Y) - heightOfLines(1..X)
            // origScrollTop >= 0, modScrollTop >= 0
            this.B((0, observable_1.autorun)(reader => {
                /** @description update scroll modified */
                const newScrollTopModified = this.f.read(reader)
                    - (this.h.get() - this.t.read(reader))
                    - (this.b.get() - this.j.read(reader));
                if (newScrollTopModified !== this.u.modified.getScrollTop()) {
                    this.u.modified.setScrollTop(newScrollTopModified, 1 /* ScrollType.Immediate */);
                }
            }));
            this.B((0, observable_1.autorun)(reader => {
                /** @description update scroll original */
                const newScrollTopOriginal = this.n.read(reader)
                    - (this.t.get() - this.h.read(reader))
                    - (this.j.get() - this.b.read(reader));
                if (newScrollTopOriginal !== this.u.original.getScrollTop()) {
                    this.u.original.setScrollTop(newScrollTopOriginal, 1 /* ScrollType.Immediate */);
                }
            }));
            this.B((0, observable_1.autorun)(reader => {
                /** @description update editor top offsets */
                const m = this.y.read(reader)?.movedTextToCompare.read(reader);
                let deltaOrigToMod = 0;
                if (m) {
                    const trueTopOriginal = this.u.original.getTopForLineNumber(m.lineRangeMapping.original.startLineNumber, true) - this.b.get();
                    const trueTopModified = this.u.modified.getTopForLineNumber(m.lineRangeMapping.modified.startLineNumber, true) - this.j.get();
                    deltaOrigToMod = trueTopModified - trueTopOriginal;
                }
                if (deltaOrigToMod > 0) {
                    this.j.set(0, undefined);
                    this.b.set(deltaOrigToMod, undefined);
                }
                else if (deltaOrigToMod < 0) {
                    this.j.set(-deltaOrigToMod, undefined);
                    this.b.set(0, undefined);
                }
                else {
                    setTimeout(() => {
                        this.j.set(0, undefined);
                        this.b.set(0, undefined);
                    }, 400);
                }
                if (this.u.modified.hasTextFocus()) {
                    this.g.set(this.s.get() - deltaOrigToMod, undefined, true);
                }
                else {
                    this.s.set(this.g.get() + deltaOrigToMod, undefined, true);
                }
            }));
        }
    };
    exports.$2Z = $2Z;
    exports.$2Z = $2Z = __decorate([
        __param(5, clipboardService_1.$UZ),
        __param(6, contextView_1.$WZ)
    ], $2Z);
    function computeRangeAlignment(originalEditor, modifiedEditor, diffs, originalEditorAlignmentViewZones, modifiedEditorAlignmentViewZones, innerHunkAlignment) {
        const originalLineHeightOverrides = new arrays_1.$0b(getAdditionalLineHeights(originalEditor, originalEditorAlignmentViewZones));
        const modifiedLineHeightOverrides = new arrays_1.$0b(getAdditionalLineHeights(modifiedEditor, modifiedEditorAlignmentViewZones));
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
                    originalRange: lineRange_1.$ts.ofLength(origNext.lineNumber, 1),
                    modifiedRange: lineRange_1.$ts.ofLength(modNext.lineNumber, 1),
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
                const originalRange = new lineRange_1.$ts(lastOrigLineNumber, origLineNumberExclusive);
                const modifiedRange = new lineRange_1.$ts(lastModLineNumber, modLineNumberExclusive);
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
            const modelLineNumber = w.afterLineNumber === 0 ? 0 : coordinatesConverter.convertViewPositionToModelPosition(new position_1.$js(w.afterLineNumber, 1)).lineNumber;
            viewZoneHeights.push({ lineNumber: modelLineNumber, heightInPx: w.height });
        }
        const result = (0, utils_1.$8Y)(viewZoneHeights, wrappingZoneHeights, v => v.lineNumber, (v1, v2) => ({ lineNumber: v1.lineNumber, heightInPx: v1.heightInPx + v2.heightInPx }));
        return result;
    }
});
//# sourceMappingURL=lineAlignment.js.map