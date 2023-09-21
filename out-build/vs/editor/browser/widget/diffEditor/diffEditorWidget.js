var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", "vs/base/browser/dom", "vs/base/common/arraysFind", "vs/base/common/errors", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/observable", "vs/editor/browser/editorExtensions", "vs/editor/browser/services/codeEditorService", "vs/editor/browser/widget/codeEditorWidget", "vs/editor/browser/widget/diffEditor/accessibleDiffViewer", "vs/editor/browser/widget/diffEditor/diffEditorDecorations", "vs/editor/browser/widget/diffEditor/diffEditorSash", "vs/editor/browser/widget/diffEditor/hideUnchangedRegionsFeature", "vs/editor/browser/widget/diffEditor/lineAlignment", "vs/editor/browser/widget/diffEditor/movedBlocksLines", "vs/editor/browser/widget/diffEditor/overviewRulerPart", "vs/editor/browser/widget/diffEditor/utils", "vs/editor/common/core/position", "vs/editor/common/core/range", "vs/editor/common/editorCommon", "vs/editor/common/editorContextKeys", "vs/editor/common/model/bracketPairsTextModelPart/bracketPairsTree/length", "vs/platform/audioCues/browser/audioCueService", "vs/platform/contextkey/common/contextkey", "vs/platform/instantiation/common/instantiation", "vs/platform/instantiation/common/serviceCollection", "vs/platform/progress/common/progress", "./delegatingEditorImpl", "./diffEditorEditors", "./diffEditorOptions", "./diffEditorViewModel", "vs/css!./style", "./colors"], function (require, exports, dom_1, arraysFind_1, errors_1, event_1, lifecycle_1, observable_1, editorExtensions_1, codeEditorService_1, codeEditorWidget_1, accessibleDiffViewer_1, diffEditorDecorations_1, diffEditorSash_1, hideUnchangedRegionsFeature_1, lineAlignment_1, movedBlocksLines_1, overviewRulerPart_1, utils_1, position_1, range_1, editorCommon_1, editorContextKeys_1, length_1, audioCueService_1, contextkey_1, instantiation_1, serviceCollection_1, progress_1, delegatingEditorImpl_1, diffEditorEditors_1, diffEditorOptions_1, diffEditorViewModel_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$6Z = void 0;
    let $6Z = class $6Z extends delegatingEditorImpl_1.$5Z {
        static { this.ENTIRE_DIFF_OVERVIEW_WIDTH = overviewRulerPart_1.$qZ.ENTIRE_DIFF_OVERVIEW_WIDTH; }
        get onDidContentSizeChange() { return this.J.onDidContentSizeChange; }
        get collapseUnchangedRegions() { return this.I.hideUnchangedRegions.get(); }
        constructor(M, options, codeEditorWidgetOptions, N, O, codeEditorService, P, Q) {
            super();
            this.M = M;
            this.N = N;
            this.O = O;
            this.P = P;
            this.Q = Q;
            this.j = (0, dom_1.h)('div.monaco-diff-editor.side-by-side', { style: { position: 'relative', height: '100%' } }, [
                (0, dom_1.h)('div.noModificationsOverlay@overlay', { style: { position: 'absolute', height: '100%', visibility: 'hidden', } }, [(0, dom_1.$)('span', {}, 'No Changes')]),
                (0, dom_1.h)('div.editor.original@original', { style: { position: 'absolute', height: '100%' } }),
                (0, dom_1.h)('div.editor.modified@modified', { style: { position: 'absolute', height: '100%' } }),
                (0, dom_1.h)('div.accessibleDiffViewer@accessibleDiffViewer', { style: { position: 'absolute', height: '100%' } }),
            ]);
            this.n = this.B((0, observable_1.disposableObservableValue)('diffModel', undefined));
            this.onDidChangeModel = event_1.Event.fromObservableLight(this.n);
            this.t = this.B(this.N.createScoped(this.M));
            this.u = this.O.createChild(new serviceCollection_1.$zh([contextkey_1.$3i, this.t]));
            this.C = (0, observable_1.observableValue)(this, undefined);
            this.F = (0, observable_1.observableValue)(this, false);
            this.G = (0, observable_1.derived)(this, reader => this.I.onlyShowAccessibleDiffViewer.read(reader)
                ? true
                : this.F.read(reader));
            this.L = (0, observable_1.observableValue)(this, undefined);
            this.S = (0, observable_1.derived)(this, reader => {
                const width = this.y.width.read(reader);
                const height = this.y.height.read(reader);
                const sashLeft = this.z.read(reader)?.sashLeft.read(reader);
                const originalWidth = sashLeft ?? Math.max(5, this.J.original.getLayoutInfo().decorationsLeft);
                const modifiedWidth = width - originalWidth - (this.I.renderOverviewRuler.read(reader) ? overviewRulerPart_1.$qZ.ENTIRE_DIFF_OVERVIEW_WIDTH : 0);
                const movedBlocksLinesWidth = this.L.read(reader)?.width.read(reader) ?? 0;
                const originalWidthWithoutMovedBlockLines = originalWidth - movedBlocksLinesWidth;
                this.j.original.style.width = originalWidthWithoutMovedBlockLines + 'px';
                this.j.original.style.left = '0px';
                this.j.modified.style.width = modifiedWidth + 'px';
                this.j.modified.style.left = originalWidth + 'px';
                this.J.original.layout({ width: originalWidthWithoutMovedBlockLines, height });
                this.J.modified.layout({ width: modifiedWidth, height });
                return {
                    modifiedEditor: this.J.modified.getLayoutInfo(),
                    originalEditor: this.J.original.getLayoutInfo(),
                };
            });
            this.X = this.n.map((m, r) => m?.diff.read(r));
            this.onDidUpdateDiff = event_1.Event.fromObservableLight(this.X);
            codeEditorService.willCreateDiffEditor();
            this.t.createKey('isInDiffEditor', true);
            this.M.appendChild(this.j.root);
            this.B((0, lifecycle_1.$ic)(() => this.M.removeChild(this.j.root)));
            this.y = this.B(new utils_1.$_Y(this.j.root, options.dimension));
            this.y.setAutomaticLayout(options.automaticLayout ?? false);
            this.I = new diffEditorOptions_1.$lZ(options, this.y.width);
            this.t.createKey(editorContextKeys_1.EditorContextKeys.isEmbeddedDiffEditor.key, false);
            const isEmbeddedDiffEditorKey = editorContextKeys_1.EditorContextKeys.isEmbeddedDiffEditor.bindTo(this.t);
            this.B((0, observable_1.autorun)(reader => {
                /** @description update isEmbeddedDiffEditorKey */
                isEmbeddedDiffEditorKey.set(this.I.isInEmbeddedEditor.read(reader));
            }));
            const comparingMovedCodeKey = editorContextKeys_1.EditorContextKeys.comparingMovedCode.bindTo(this.t);
            this.B((0, observable_1.autorun)(reader => {
                /** @description update comparingMovedCodeKey */
                comparingMovedCodeKey.set(!!this.n.read(reader)?.movedTextToCompare.read(reader));
            }));
            const diffEditorRenderSideBySideInlineBreakpointReachedContextKeyValue = editorContextKeys_1.EditorContextKeys.diffEditorRenderSideBySideInlineBreakpointReached.bindTo(this.t);
            this.B((0, observable_1.autorun)(reader => {
                /** @description update accessibleDiffViewerVisible context key */
                diffEditorRenderSideBySideInlineBreakpointReachedContextKeyValue.set(this.I.couldShowInlineViewBecauseOfSize.read(reader));
            }));
            this.J = this.B(this.u.createInstance(diffEditorEditors_1.$rZ, this.j.original, this.j.modified, this.I, codeEditorWidgetOptions, (i, c, o, o2) => this.R(i, c, o, o2)));
            this.z = (0, observable_1.derivedWithStore)(this, (reader, store) => {
                const showSash = this.I.renderSideBySide.read(reader);
                this.j.root.classList.toggle('side-by-side', showSash);
                if (!showSash) {
                    return undefined;
                }
                const result = store.add(new diffEditorSash_1.$NZ(this.I, this.j.root, {
                    height: this.y.height,
                    width: this.y.width.map((w, reader) => w - (this.I.renderOverviewRuler.read(reader) ? overviewRulerPart_1.$qZ.ENTIRE_DIFF_OVERVIEW_WIDTH : 0)),
                }));
                store.add((0, observable_1.autorun)(reader => {
                    /** @description setBoundarySashes */
                    const boundarySashes = this.C.read(reader);
                    if (boundarySashes) {
                        result.setBoundarySashes(boundarySashes);
                    }
                }));
                return result;
            });
            this.B((0, observable_1.recomputeInitiallyAndOnChange)(this.z));
            this.B((0, observable_1.autorunWithStore)((reader, store) => {
                /** @description UnchangedRangesFeature */
                this.D = store.add(this.u.createInstance((0, utils_1.$gZ)(hideUnchangedRegionsFeature_1.$SZ, reader), this.J, this.n, this.I));
            }));
            this.B((0, observable_1.autorunWithStore)((reader, store) => {
                /** @description DiffEditorDecorations */
                store.add(new ((0, utils_1.$gZ)(diffEditorDecorations_1.$MZ, reader))(this.J, this.n, this.I));
            }));
            this.B((0, observable_1.autorunWithStore)((reader, store) => {
                /** @description ViewZoneManager */
                store.add(this.u.createInstance((0, utils_1.$gZ)(lineAlignment_1.$2Z, reader), this.J, this.n, this.I, this, () => this.D.isUpdatingViewZones));
            }));
            this.B((0, observable_1.autorunWithStore)((reader, store) => {
                /** @description OverviewRulerPart */
                store.add(this.u.createInstance((0, utils_1.$gZ)(overviewRulerPart_1.$qZ, reader), this.J, this.j.root, this.n, this.y.width, this.y.height, this.S.map(i => i.modifiedEditor), this.I));
            }));
            this.B((0, observable_1.autorunWithStore)((reader, store) => {
                /** @description _accessibleDiffViewer */
                this.H = store.add(this.B(this.u.createInstance((0, utils_1.$gZ)(accessibleDiffViewer_1.$xZ, reader), this.j.accessibleDiffViewer, this.G, (visible, tx) => this.F.set(visible, tx), this.I.onlyShowAccessibleDiffViewer.map(v => !v), this.y.width, this.y.height, this.n.map((m, r) => m?.diff.read(r)?.mappings.map(m => m.lineRangeMapping)), this.J)));
            }));
            const visibility = this.G.map(v => v ? 'hidden' : 'visible');
            this.B((0, utils_1.$fZ)(this.j.modified, { visibility }));
            this.B((0, utils_1.$fZ)(this.j.original, { visibility }));
            this.U();
            codeEditorService.addDiffEditor(this);
            this.B((0, observable_1.recomputeInitiallyAndOnChange)(this.S));
            this.B((0, observable_1.autorunWithStore)((reader, store) => {
                this.L.set(store.add(new ((0, utils_1.$gZ)(movedBlocksLines_1.$LZ, reader))(this.j.root, this.n, this.S.map(i => i.originalEditor), this.S.map(i => i.modifiedEditor), this.J)), undefined);
            }));
            this.B((0, utils_1.$fZ)(this.j.overlay, {
                width: this.S.map((i, r) => i.originalEditor.width + (this.I.renderSideBySide.read(r) ? 0 : i.modifiedEditor.width)),
                visibility: (0, observable_1.derived)(reader => /** @description visibility */ (this.I.hideUnchangedRegions.read(reader) && this.n.read(reader)?.diff.read(reader)?.mappings.length === 0)
                    ? 'visible' : 'hidden'),
            }));
            // Revert change when an arrow is clicked.
            this.B(this.J.modified.onMouseDown(event => {
                if (!event.event.rightButton && event.target.position && event.target.element?.className.includes('arrow-revert-change')) {
                    const lineNumber = event.target.position.lineNumber;
                    const viewZone = event.target;
                    const model = this.n.get();
                    if (!model) {
                        return;
                    }
                    const diffs = model.diff.get()?.mappings;
                    if (!diffs) {
                        return;
                    }
                    const diff = diffs.find(d => viewZone?.detail.afterLineNumber === d.lineRangeMapping.modified.startLineNumber - 1 ||
                        d.lineRangeMapping.modified.startLineNumber === lineNumber);
                    if (!diff) {
                        return;
                    }
                    this.revert(diff.lineRangeMapping);
                    event.event.stopPropagation();
                }
            }));
            this.B(event_1.Event.runAndSubscribe(this.J.modified.onDidChangeCursorPosition, (e) => {
                if (e?.reason === 3 /* CursorChangeReason.Explicit */) {
                    const diff = this.n.get()?.diff.get()?.mappings.find(m => m.lineRangeMapping.modified.contains(e.position.lineNumber));
                    if (diff?.lineRangeMapping.modified.isEmpty) {
                        this.P.playAudioCue(audioCueService_1.$wZ.diffLineDeleted, { source: 'diffEditor.cursorPositionChanged' });
                    }
                    else if (diff?.lineRangeMapping.original.isEmpty) {
                        this.P.playAudioCue(audioCueService_1.$wZ.diffLineInserted, { source: 'diffEditor.cursorPositionChanged' });
                    }
                    else if (diff) {
                        this.P.playAudioCue(audioCueService_1.$wZ.diffLineModified, { source: 'diffEditor.cursorPositionChanged' });
                    }
                }
            }));
            const isDiffUpToDate = this.n.map((m, reader) => m?.isDiffUpToDate.read(reader));
            this.B((0, observable_1.autorunWithStore)((reader, store) => {
                if (isDiffUpToDate.read(reader) === false) {
                    const r = this.Q.show(true, 1000);
                    store.add((0, lifecycle_1.$ic)(() => r.done()));
                }
            }));
        }
        getViewWidth() {
            return this.y.width.get();
        }
        getContentHeight() {
            return this.J.modified.getContentHeight();
        }
        R(instantiationService, container, options, editorWidgetOptions) {
            const editor = instantiationService.createInstance(codeEditorWidget_1.$uY, container, options, editorWidgetOptions);
            return editor;
        }
        U() {
            const contributions = editorExtensions_1.EditorExtensionsRegistry.getDiffEditorContributions();
            for (const desc of contributions) {
                try {
                    this.B(this.u.createInstance(desc.ctor, this));
                }
                catch (err) {
                    (0, errors_1.$Y)(err);
                }
            }
        }
        get g() { return this.J.modified; }
        getEditorType() { return editorCommon_1.EditorType.IDiffEditor; }
        onVisible() {
            // TODO: Only compute diffs when diff editor is visible
            this.J.original.onVisible();
            this.J.modified.onVisible();
        }
        onHide() {
            this.J.original.onHide();
            this.J.modified.onHide();
        }
        layout(dimension) { this.y.observe(dimension); }
        hasTextFocus() { return this.J.original.hasTextFocus() || this.J.modified.hasTextFocus(); }
        saveViewState() {
            const originalViewState = this.J.original.saveViewState();
            const modifiedViewState = this.J.modified.saveViewState();
            return {
                original: originalViewState,
                modified: modifiedViewState,
                modelState: this.n.get()?.serializeState(),
            };
        }
        restoreViewState(s) {
            if (s && s.original && s.modified) {
                const diffEditorState = s;
                this.J.original.restoreViewState(diffEditorState.original);
                this.J.modified.restoreViewState(diffEditorState.modified);
                if (diffEditorState.modelState) {
                    this.n.get()?.restoreSerializedState(diffEditorState.modelState);
                }
            }
        }
        createViewModel(model) {
            return this.u.createInstance(diffEditorViewModel_1.$mZ, model, this.I, this);
        }
        getModel() { return this.n.get()?.model ?? null; }
        setModel(model) {
            if (!model && this.n.get()) {
                // Transitioning from a model to no-model
                this.H.close();
            }
            const vm = model ? ('model' in model) ? model : this.createViewModel(model) : undefined;
            this.J.original.setModel(vm ? vm.model.original : null);
            this.J.modified.setModel(vm ? vm.model.modified : null);
            (0, observable_1.transaction)(tx => {
                this.n.set(vm, tx);
            });
        }
        /**
         * @param changedOptions Only has values for top-level options that have actually changed.
         */
        updateOptions(changedOptions) {
            this.I.updateOptions(changedOptions);
        }
        getContainerDomNode() { return this.M; }
        getOriginalEditor() { return this.J.original; }
        getModifiedEditor() { return this.J.modified; }
        setBoundarySashes(sashes) {
            this.C.set(sashes, undefined);
        }
        get ignoreTrimWhitespace() { return this.I.ignoreTrimWhitespace.get(); }
        get maxComputationTime() { return this.I.maxComputationTimeMs.get(); }
        get renderSideBySide() { return this.I.renderSideBySide.get(); }
        /**
         * @deprecated Use `this.getDiffComputationResult().changes2` instead.
         */
        getLineChanges() {
            const diffState = this.n.get()?.diff.get();
            if (!diffState) {
                return null;
            }
            return toLineChanges(diffState);
        }
        getDiffComputationResult() {
            const diffState = this.n.get()?.diff.get();
            if (!diffState) {
                return null;
            }
            return {
                changes: this.getLineChanges(),
                changes2: diffState.mappings.map(m => m.lineRangeMapping),
                identical: diffState.identical,
                quitEarly: diffState.quitEarly,
            };
        }
        revert(diff) {
            const model = this.n.get()?.model;
            if (!model) {
                return;
            }
            const changes = diff.innerChanges
                ? diff.innerChanges.map(c => ({
                    range: c.modifiedRange,
                    text: model.original.getValueInRange(c.originalRange)
                }))
                : [
                    {
                        range: diff.modified.toExclusiveRange(),
                        text: model.original.getValueInRange(diff.original.toExclusiveRange())
                    }
                ];
            this.J.modified.executeEdits('diffEditor', changes);
        }
        Y(diff) {
            this.J.modified.setPosition(new position_1.$js(diff.lineRangeMapping.modified.startLineNumber, 1));
            this.J.modified.revealRangeInCenter(diff.lineRangeMapping.modified.toExclusiveRange());
        }
        goToDiff(target) {
            const diffs = this.n.get()?.diff.get()?.mappings;
            if (!diffs || diffs.length === 0) {
                return;
            }
            const curLineNumber = this.J.modified.getPosition().lineNumber;
            let diff;
            if (target === 'next') {
                diff = diffs.find(d => d.lineRangeMapping.modified.startLineNumber > curLineNumber) ?? diffs[0];
            }
            else {
                diff = (0, arraysFind_1.$db)(diffs, d => d.lineRangeMapping.modified.startLineNumber < curLineNumber) ?? diffs[diffs.length - 1];
            }
            this.Y(diff);
            if (diff.lineRangeMapping.modified.isEmpty) {
                this.P.playAudioCue(audioCueService_1.$wZ.diffLineDeleted, { source: 'diffEditor.goToDiff' });
            }
            else if (diff.lineRangeMapping.original.isEmpty) {
                this.P.playAudioCue(audioCueService_1.$wZ.diffLineInserted, { source: 'diffEditor.goToDiff' });
            }
            else if (diff) {
                this.P.playAudioCue(audioCueService_1.$wZ.diffLineModified, { source: 'diffEditor.goToDiff' });
            }
        }
        revealFirstDiff() {
            const diffModel = this.n.get();
            if (!diffModel) {
                return;
            }
            // wait for the diff computation to finish
            this.waitForDiff().then(() => {
                const diffs = diffModel.diff.get()?.mappings;
                if (!diffs || diffs.length === 0) {
                    return;
                }
                this.Y(diffs[0]);
            });
        }
        accessibleDiffViewerNext() { this.H.next(); }
        accessibleDiffViewerPrev() { this.H.prev(); }
        async waitForDiff() {
            const diffModel = this.n.get();
            if (!diffModel) {
                return;
            }
            await diffModel.waitForDiff();
        }
        mapToOtherSide() {
            const isModifiedFocus = this.J.modified.hasWidgetFocus();
            const source = isModifiedFocus ? this.J.modified : this.J.original;
            const destination = isModifiedFocus ? this.J.original : this.J.modified;
            let destinationSelection;
            const sourceSelection = source.getSelection();
            if (sourceSelection) {
                const mappings = this.n.get()?.diff.get()?.mappings.map(m => isModifiedFocus ? m.lineRangeMapping.flip() : m.lineRangeMapping);
                if (mappings) {
                    const newRange1 = translatePosition(sourceSelection.getStartPosition(), mappings);
                    const newRange2 = translatePosition(sourceSelection.getEndPosition(), mappings);
                    destinationSelection = range_1.$ks.plusRange(newRange1, newRange2);
                }
            }
            return { destination, destinationSelection };
        }
        switchSide() {
            const { destination, destinationSelection } = this.mapToOtherSide();
            destination.focus();
            if (destinationSelection) {
                destination.setSelection(destinationSelection);
            }
        }
        exitCompareMove() {
            const model = this.n.get();
            if (!model) {
                return;
            }
            model.movedTextToCompare.set(undefined, undefined);
        }
        collapseAllUnchangedRegions() {
            const unchangedRegions = this.n.get()?.unchangedRegions.get();
            if (!unchangedRegions) {
                return;
            }
            (0, observable_1.transaction)(tx => {
                for (const region of unchangedRegions) {
                    region.collapseAll(tx);
                }
            });
        }
        showAllUnchangedRegions() {
            const unchangedRegions = this.n.get()?.unchangedRegions.get();
            if (!unchangedRegions) {
                return;
            }
            (0, observable_1.transaction)(tx => {
                for (const region of unchangedRegions) {
                    region.showAll(tx);
                }
            });
        }
    };
    exports.$6Z = $6Z;
    exports.$6Z = $6Z = __decorate([
        __param(3, contextkey_1.$3i),
        __param(4, instantiation_1.$Ah),
        __param(5, codeEditorService_1.$nV),
        __param(6, audioCueService_1.$sZ),
        __param(7, progress_1.$7u)
    ], $6Z);
    function translatePosition(posInOriginal, mappings) {
        const mapping = (0, arraysFind_1.$db)(mappings, m => m.original.startLineNumber <= posInOriginal.lineNumber);
        if (!mapping) {
            // No changes before the position
            return range_1.$ks.fromPositions(posInOriginal);
        }
        if (mapping.original.endLineNumberExclusive <= posInOriginal.lineNumber) {
            const newLineNumber = posInOriginal.lineNumber - mapping.original.endLineNumberExclusive + mapping.modified.endLineNumberExclusive;
            return range_1.$ks.fromPositions(new position_1.$js(newLineNumber, posInOriginal.column));
        }
        if (!mapping.innerChanges) {
            // Only for legacy algorithm
            return range_1.$ks.fromPositions(new position_1.$js(mapping.modified.startLineNumber, 1));
        }
        const innerMapping = (0, arraysFind_1.$db)(mapping.innerChanges, m => m.originalRange.getStartPosition().isBeforeOrEqual(posInOriginal));
        if (!innerMapping) {
            const newLineNumber = posInOriginal.lineNumber - mapping.original.startLineNumber + mapping.modified.startLineNumber;
            return range_1.$ks.fromPositions(new position_1.$js(newLineNumber, posInOriginal.column));
        }
        if (innerMapping.originalRange.containsPosition(posInOriginal)) {
            return innerMapping.modifiedRange;
        }
        else {
            const l = lengthBetweenPositions(innerMapping.originalRange.getEndPosition(), posInOriginal);
            return range_1.$ks.fromPositions(addLength(innerMapping.modifiedRange.getEndPosition(), l));
        }
    }
    function lengthBetweenPositions(position1, position2) {
        if (position1.lineNumber === position2.lineNumber) {
            return new length_1.$nt(0, position2.column - position1.column);
        }
        else {
            return new length_1.$nt(position2.lineNumber - position1.lineNumber, position2.column - 1);
        }
    }
    function addLength(position, length) {
        if (length.lineCount === 0) {
            return new position_1.$js(position.lineNumber, position.column + length.columnCount);
        }
        else {
            return new position_1.$js(position.lineNumber + length.lineCount, length.columnCount + 1);
        }
    }
    function toLineChanges(state) {
        return state.mappings.map(x => {
            const m = x.lineRangeMapping;
            let originalStartLineNumber;
            let originalEndLineNumber;
            let modifiedStartLineNumber;
            let modifiedEndLineNumber;
            let innerChanges = m.innerChanges;
            if (m.original.isEmpty) {
                // Insertion
                originalStartLineNumber = m.original.startLineNumber - 1;
                originalEndLineNumber = 0;
                innerChanges = undefined;
            }
            else {
                originalStartLineNumber = m.original.startLineNumber;
                originalEndLineNumber = m.original.endLineNumberExclusive - 1;
            }
            if (m.modified.isEmpty) {
                // Deletion
                modifiedStartLineNumber = m.modified.startLineNumber - 1;
                modifiedEndLineNumber = 0;
                innerChanges = undefined;
            }
            else {
                modifiedStartLineNumber = m.modified.startLineNumber;
                modifiedEndLineNumber = m.modified.endLineNumberExclusive - 1;
            }
            return {
                originalStartLineNumber,
                originalEndLineNumber,
                modifiedStartLineNumber,
                modifiedEndLineNumber,
                charChanges: innerChanges?.map(m => ({
                    originalStartLineNumber: m.originalRange.startLineNumber,
                    originalStartColumn: m.originalRange.startColumn,
                    originalEndLineNumber: m.originalRange.endLineNumber,
                    originalEndColumn: m.originalRange.endColumn,
                    modifiedStartLineNumber: m.modifiedRange.startLineNumber,
                    modifiedStartColumn: m.modifiedRange.startColumn,
                    modifiedEndLineNumber: m.modifiedRange.endLineNumber,
                    modifiedEndColumn: m.modifiedRange.endColumn,
                }))
            };
        });
    }
});
//# sourceMappingURL=diffEditorWidget.js.map