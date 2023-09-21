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
    exports.DiffEditorWidget = void 0;
    let DiffEditorWidget = class DiffEditorWidget extends delegatingEditorImpl_1.DelegatingEditor {
        static { this.ENTIRE_DIFF_OVERVIEW_WIDTH = overviewRulerPart_1.OverviewRulerPart.ENTIRE_DIFF_OVERVIEW_WIDTH; }
        get onDidContentSizeChange() { return this._editors.onDidContentSizeChange; }
        get collapseUnchangedRegions() { return this._options.hideUnchangedRegions.get(); }
        constructor(_domElement, options, codeEditorWidgetOptions, _parentContextKeyService, _parentInstantiationService, codeEditorService, _audioCueService, _editorProgressService) {
            super();
            this._domElement = _domElement;
            this._parentContextKeyService = _parentContextKeyService;
            this._parentInstantiationService = _parentInstantiationService;
            this._audioCueService = _audioCueService;
            this._editorProgressService = _editorProgressService;
            this.elements = (0, dom_1.h)('div.monaco-diff-editor.side-by-side', { style: { position: 'relative', height: '100%' } }, [
                (0, dom_1.h)('div.noModificationsOverlay@overlay', { style: { position: 'absolute', height: '100%', visibility: 'hidden', } }, [(0, dom_1.$)('span', {}, 'No Changes')]),
                (0, dom_1.h)('div.editor.original@original', { style: { position: 'absolute', height: '100%' } }),
                (0, dom_1.h)('div.editor.modified@modified', { style: { position: 'absolute', height: '100%' } }),
                (0, dom_1.h)('div.accessibleDiffViewer@accessibleDiffViewer', { style: { position: 'absolute', height: '100%' } }),
            ]);
            this._diffModel = this._register((0, observable_1.disposableObservableValue)('diffModel', undefined));
            this.onDidChangeModel = event_1.Event.fromObservableLight(this._diffModel);
            this._contextKeyService = this._register(this._parentContextKeyService.createScoped(this._domElement));
            this._instantiationService = this._parentInstantiationService.createChild(new serviceCollection_1.ServiceCollection([contextkey_1.IContextKeyService, this._contextKeyService]));
            this._boundarySashes = (0, observable_1.observableValue)(this, undefined);
            this._accessibleDiffViewerShouldBeVisible = (0, observable_1.observableValue)(this, false);
            this._accessibleDiffViewerVisible = (0, observable_1.derived)(this, reader => this._options.onlyShowAccessibleDiffViewer.read(reader)
                ? true
                : this._accessibleDiffViewerShouldBeVisible.read(reader));
            this.movedBlocksLinesPart = (0, observable_1.observableValue)(this, undefined);
            this._layoutInfo = (0, observable_1.derived)(this, reader => {
                const width = this._rootSizeObserver.width.read(reader);
                const height = this._rootSizeObserver.height.read(reader);
                const sashLeft = this._sash.read(reader)?.sashLeft.read(reader);
                const originalWidth = sashLeft ?? Math.max(5, this._editors.original.getLayoutInfo().decorationsLeft);
                const modifiedWidth = width - originalWidth - (this._options.renderOverviewRuler.read(reader) ? overviewRulerPart_1.OverviewRulerPart.ENTIRE_DIFF_OVERVIEW_WIDTH : 0);
                const movedBlocksLinesWidth = this.movedBlocksLinesPart.read(reader)?.width.read(reader) ?? 0;
                const originalWidthWithoutMovedBlockLines = originalWidth - movedBlocksLinesWidth;
                this.elements.original.style.width = originalWidthWithoutMovedBlockLines + 'px';
                this.elements.original.style.left = '0px';
                this.elements.modified.style.width = modifiedWidth + 'px';
                this.elements.modified.style.left = originalWidth + 'px';
                this._editors.original.layout({ width: originalWidthWithoutMovedBlockLines, height });
                this._editors.modified.layout({ width: modifiedWidth, height });
                return {
                    modifiedEditor: this._editors.modified.getLayoutInfo(),
                    originalEditor: this._editors.original.getLayoutInfo(),
                };
            });
            this._diffValue = this._diffModel.map((m, r) => m?.diff.read(r));
            this.onDidUpdateDiff = event_1.Event.fromObservableLight(this._diffValue);
            codeEditorService.willCreateDiffEditor();
            this._contextKeyService.createKey('isInDiffEditor', true);
            this._domElement.appendChild(this.elements.root);
            this._register((0, lifecycle_1.toDisposable)(() => this._domElement.removeChild(this.elements.root)));
            this._rootSizeObserver = this._register(new utils_1.ObservableElementSizeObserver(this.elements.root, options.dimension));
            this._rootSizeObserver.setAutomaticLayout(options.automaticLayout ?? false);
            this._options = new diffEditorOptions_1.DiffEditorOptions(options, this._rootSizeObserver.width);
            this._contextKeyService.createKey(editorContextKeys_1.EditorContextKeys.isEmbeddedDiffEditor.key, false);
            const isEmbeddedDiffEditorKey = editorContextKeys_1.EditorContextKeys.isEmbeddedDiffEditor.bindTo(this._contextKeyService);
            this._register((0, observable_1.autorun)(reader => {
                /** @description update isEmbeddedDiffEditorKey */
                isEmbeddedDiffEditorKey.set(this._options.isInEmbeddedEditor.read(reader));
            }));
            const comparingMovedCodeKey = editorContextKeys_1.EditorContextKeys.comparingMovedCode.bindTo(this._contextKeyService);
            this._register((0, observable_1.autorun)(reader => {
                /** @description update comparingMovedCodeKey */
                comparingMovedCodeKey.set(!!this._diffModel.read(reader)?.movedTextToCompare.read(reader));
            }));
            const diffEditorRenderSideBySideInlineBreakpointReachedContextKeyValue = editorContextKeys_1.EditorContextKeys.diffEditorRenderSideBySideInlineBreakpointReached.bindTo(this._contextKeyService);
            this._register((0, observable_1.autorun)(reader => {
                /** @description update accessibleDiffViewerVisible context key */
                diffEditorRenderSideBySideInlineBreakpointReachedContextKeyValue.set(this._options.couldShowInlineViewBecauseOfSize.read(reader));
            }));
            this._editors = this._register(this._instantiationService.createInstance(diffEditorEditors_1.DiffEditorEditors, this.elements.original, this.elements.modified, this._options, codeEditorWidgetOptions, (i, c, o, o2) => this._createInnerEditor(i, c, o, o2)));
            this._sash = (0, observable_1.derivedWithStore)(this, (reader, store) => {
                const showSash = this._options.renderSideBySide.read(reader);
                this.elements.root.classList.toggle('side-by-side', showSash);
                if (!showSash) {
                    return undefined;
                }
                const result = store.add(new diffEditorSash_1.DiffEditorSash(this._options, this.elements.root, {
                    height: this._rootSizeObserver.height,
                    width: this._rootSizeObserver.width.map((w, reader) => w - (this._options.renderOverviewRuler.read(reader) ? overviewRulerPart_1.OverviewRulerPart.ENTIRE_DIFF_OVERVIEW_WIDTH : 0)),
                }));
                store.add((0, observable_1.autorun)(reader => {
                    /** @description setBoundarySashes */
                    const boundarySashes = this._boundarySashes.read(reader);
                    if (boundarySashes) {
                        result.setBoundarySashes(boundarySashes);
                    }
                }));
                return result;
            });
            this._register((0, observable_1.recomputeInitiallyAndOnChange)(this._sash));
            this._register((0, observable_1.autorunWithStore)((reader, store) => {
                /** @description UnchangedRangesFeature */
                this.unchangedRangesFeature = store.add(this._instantiationService.createInstance((0, utils_1.readHotReloadableExport)(hideUnchangedRegionsFeature_1.HideUnchangedRegionsFeature, reader), this._editors, this._diffModel, this._options));
            }));
            this._register((0, observable_1.autorunWithStore)((reader, store) => {
                /** @description DiffEditorDecorations */
                store.add(new ((0, utils_1.readHotReloadableExport)(diffEditorDecorations_1.DiffEditorDecorations, reader))(this._editors, this._diffModel, this._options));
            }));
            this._register((0, observable_1.autorunWithStore)((reader, store) => {
                /** @description ViewZoneManager */
                store.add(this._instantiationService.createInstance((0, utils_1.readHotReloadableExport)(lineAlignment_1.ViewZoneManager, reader), this._editors, this._diffModel, this._options, this, () => this.unchangedRangesFeature.isUpdatingViewZones));
            }));
            this._register((0, observable_1.autorunWithStore)((reader, store) => {
                /** @description OverviewRulerPart */
                store.add(this._instantiationService.createInstance((0, utils_1.readHotReloadableExport)(overviewRulerPart_1.OverviewRulerPart, reader), this._editors, this.elements.root, this._diffModel, this._rootSizeObserver.width, this._rootSizeObserver.height, this._layoutInfo.map(i => i.modifiedEditor), this._options));
            }));
            this._register((0, observable_1.autorunWithStore)((reader, store) => {
                /** @description _accessibleDiffViewer */
                this._accessibleDiffViewer = store.add(this._register(this._instantiationService.createInstance((0, utils_1.readHotReloadableExport)(accessibleDiffViewer_1.AccessibleDiffViewer, reader), this.elements.accessibleDiffViewer, this._accessibleDiffViewerVisible, (visible, tx) => this._accessibleDiffViewerShouldBeVisible.set(visible, tx), this._options.onlyShowAccessibleDiffViewer.map(v => !v), this._rootSizeObserver.width, this._rootSizeObserver.height, this._diffModel.map((m, r) => m?.diff.read(r)?.mappings.map(m => m.lineRangeMapping)), this._editors)));
            }));
            const visibility = this._accessibleDiffViewerVisible.map(v => v ? 'hidden' : 'visible');
            this._register((0, utils_1.applyStyle)(this.elements.modified, { visibility }));
            this._register((0, utils_1.applyStyle)(this.elements.original, { visibility }));
            this._createDiffEditorContributions();
            codeEditorService.addDiffEditor(this);
            this._register((0, observable_1.recomputeInitiallyAndOnChange)(this._layoutInfo));
            this._register((0, observable_1.autorunWithStore)((reader, store) => {
                this.movedBlocksLinesPart.set(store.add(new ((0, utils_1.readHotReloadableExport)(movedBlocksLines_1.MovedBlocksLinesPart, reader))(this.elements.root, this._diffModel, this._layoutInfo.map(i => i.originalEditor), this._layoutInfo.map(i => i.modifiedEditor), this._editors)), undefined);
            }));
            this._register((0, utils_1.applyStyle)(this.elements.overlay, {
                width: this._layoutInfo.map((i, r) => i.originalEditor.width + (this._options.renderSideBySide.read(r) ? 0 : i.modifiedEditor.width)),
                visibility: (0, observable_1.derived)(reader => /** @description visibility */ (this._options.hideUnchangedRegions.read(reader) && this._diffModel.read(reader)?.diff.read(reader)?.mappings.length === 0)
                    ? 'visible' : 'hidden'),
            }));
            // Revert change when an arrow is clicked.
            this._register(this._editors.modified.onMouseDown(event => {
                if (!event.event.rightButton && event.target.position && event.target.element?.className.includes('arrow-revert-change')) {
                    const lineNumber = event.target.position.lineNumber;
                    const viewZone = event.target;
                    const model = this._diffModel.get();
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
            this._register(event_1.Event.runAndSubscribe(this._editors.modified.onDidChangeCursorPosition, (e) => {
                if (e?.reason === 3 /* CursorChangeReason.Explicit */) {
                    const diff = this._diffModel.get()?.diff.get()?.mappings.find(m => m.lineRangeMapping.modified.contains(e.position.lineNumber));
                    if (diff?.lineRangeMapping.modified.isEmpty) {
                        this._audioCueService.playAudioCue(audioCueService_1.AudioCue.diffLineDeleted, { source: 'diffEditor.cursorPositionChanged' });
                    }
                    else if (diff?.lineRangeMapping.original.isEmpty) {
                        this._audioCueService.playAudioCue(audioCueService_1.AudioCue.diffLineInserted, { source: 'diffEditor.cursorPositionChanged' });
                    }
                    else if (diff) {
                        this._audioCueService.playAudioCue(audioCueService_1.AudioCue.diffLineModified, { source: 'diffEditor.cursorPositionChanged' });
                    }
                }
            }));
            const isDiffUpToDate = this._diffModel.map((m, reader) => m?.isDiffUpToDate.read(reader));
            this._register((0, observable_1.autorunWithStore)((reader, store) => {
                if (isDiffUpToDate.read(reader) === false) {
                    const r = this._editorProgressService.show(true, 1000);
                    store.add((0, lifecycle_1.toDisposable)(() => r.done()));
                }
            }));
        }
        getViewWidth() {
            return this._rootSizeObserver.width.get();
        }
        getContentHeight() {
            return this._editors.modified.getContentHeight();
        }
        _createInnerEditor(instantiationService, container, options, editorWidgetOptions) {
            const editor = instantiationService.createInstance(codeEditorWidget_1.CodeEditorWidget, container, options, editorWidgetOptions);
            return editor;
        }
        _createDiffEditorContributions() {
            const contributions = editorExtensions_1.EditorExtensionsRegistry.getDiffEditorContributions();
            for (const desc of contributions) {
                try {
                    this._register(this._instantiationService.createInstance(desc.ctor, this));
                }
                catch (err) {
                    (0, errors_1.onUnexpectedError)(err);
                }
            }
        }
        get _targetEditor() { return this._editors.modified; }
        getEditorType() { return editorCommon_1.EditorType.IDiffEditor; }
        onVisible() {
            // TODO: Only compute diffs when diff editor is visible
            this._editors.original.onVisible();
            this._editors.modified.onVisible();
        }
        onHide() {
            this._editors.original.onHide();
            this._editors.modified.onHide();
        }
        layout(dimension) { this._rootSizeObserver.observe(dimension); }
        hasTextFocus() { return this._editors.original.hasTextFocus() || this._editors.modified.hasTextFocus(); }
        saveViewState() {
            const originalViewState = this._editors.original.saveViewState();
            const modifiedViewState = this._editors.modified.saveViewState();
            return {
                original: originalViewState,
                modified: modifiedViewState,
                modelState: this._diffModel.get()?.serializeState(),
            };
        }
        restoreViewState(s) {
            if (s && s.original && s.modified) {
                const diffEditorState = s;
                this._editors.original.restoreViewState(diffEditorState.original);
                this._editors.modified.restoreViewState(diffEditorState.modified);
                if (diffEditorState.modelState) {
                    this._diffModel.get()?.restoreSerializedState(diffEditorState.modelState);
                }
            }
        }
        createViewModel(model) {
            return this._instantiationService.createInstance(diffEditorViewModel_1.DiffEditorViewModel, model, this._options, this);
        }
        getModel() { return this._diffModel.get()?.model ?? null; }
        setModel(model) {
            if (!model && this._diffModel.get()) {
                // Transitioning from a model to no-model
                this._accessibleDiffViewer.close();
            }
            const vm = model ? ('model' in model) ? model : this.createViewModel(model) : undefined;
            this._editors.original.setModel(vm ? vm.model.original : null);
            this._editors.modified.setModel(vm ? vm.model.modified : null);
            (0, observable_1.transaction)(tx => {
                this._diffModel.set(vm, tx);
            });
        }
        /**
         * @param changedOptions Only has values for top-level options that have actually changed.
         */
        updateOptions(changedOptions) {
            this._options.updateOptions(changedOptions);
        }
        getContainerDomNode() { return this._domElement; }
        getOriginalEditor() { return this._editors.original; }
        getModifiedEditor() { return this._editors.modified; }
        setBoundarySashes(sashes) {
            this._boundarySashes.set(sashes, undefined);
        }
        get ignoreTrimWhitespace() { return this._options.ignoreTrimWhitespace.get(); }
        get maxComputationTime() { return this._options.maxComputationTimeMs.get(); }
        get renderSideBySide() { return this._options.renderSideBySide.get(); }
        /**
         * @deprecated Use `this.getDiffComputationResult().changes2` instead.
         */
        getLineChanges() {
            const diffState = this._diffModel.get()?.diff.get();
            if (!diffState) {
                return null;
            }
            return toLineChanges(diffState);
        }
        getDiffComputationResult() {
            const diffState = this._diffModel.get()?.diff.get();
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
            const model = this._diffModel.get()?.model;
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
            this._editors.modified.executeEdits('diffEditor', changes);
        }
        _goTo(diff) {
            this._editors.modified.setPosition(new position_1.Position(diff.lineRangeMapping.modified.startLineNumber, 1));
            this._editors.modified.revealRangeInCenter(diff.lineRangeMapping.modified.toExclusiveRange());
        }
        goToDiff(target) {
            const diffs = this._diffModel.get()?.diff.get()?.mappings;
            if (!diffs || diffs.length === 0) {
                return;
            }
            const curLineNumber = this._editors.modified.getPosition().lineNumber;
            let diff;
            if (target === 'next') {
                diff = diffs.find(d => d.lineRangeMapping.modified.startLineNumber > curLineNumber) ?? diffs[0];
            }
            else {
                diff = (0, arraysFind_1.findLast)(diffs, d => d.lineRangeMapping.modified.startLineNumber < curLineNumber) ?? diffs[diffs.length - 1];
            }
            this._goTo(diff);
            if (diff.lineRangeMapping.modified.isEmpty) {
                this._audioCueService.playAudioCue(audioCueService_1.AudioCue.diffLineDeleted, { source: 'diffEditor.goToDiff' });
            }
            else if (diff.lineRangeMapping.original.isEmpty) {
                this._audioCueService.playAudioCue(audioCueService_1.AudioCue.diffLineInserted, { source: 'diffEditor.goToDiff' });
            }
            else if (diff) {
                this._audioCueService.playAudioCue(audioCueService_1.AudioCue.diffLineModified, { source: 'diffEditor.goToDiff' });
            }
        }
        revealFirstDiff() {
            const diffModel = this._diffModel.get();
            if (!diffModel) {
                return;
            }
            // wait for the diff computation to finish
            this.waitForDiff().then(() => {
                const diffs = diffModel.diff.get()?.mappings;
                if (!diffs || diffs.length === 0) {
                    return;
                }
                this._goTo(diffs[0]);
            });
        }
        accessibleDiffViewerNext() { this._accessibleDiffViewer.next(); }
        accessibleDiffViewerPrev() { this._accessibleDiffViewer.prev(); }
        async waitForDiff() {
            const diffModel = this._diffModel.get();
            if (!diffModel) {
                return;
            }
            await diffModel.waitForDiff();
        }
        mapToOtherSide() {
            const isModifiedFocus = this._editors.modified.hasWidgetFocus();
            const source = isModifiedFocus ? this._editors.modified : this._editors.original;
            const destination = isModifiedFocus ? this._editors.original : this._editors.modified;
            let destinationSelection;
            const sourceSelection = source.getSelection();
            if (sourceSelection) {
                const mappings = this._diffModel.get()?.diff.get()?.mappings.map(m => isModifiedFocus ? m.lineRangeMapping.flip() : m.lineRangeMapping);
                if (mappings) {
                    const newRange1 = translatePosition(sourceSelection.getStartPosition(), mappings);
                    const newRange2 = translatePosition(sourceSelection.getEndPosition(), mappings);
                    destinationSelection = range_1.Range.plusRange(newRange1, newRange2);
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
            const model = this._diffModel.get();
            if (!model) {
                return;
            }
            model.movedTextToCompare.set(undefined, undefined);
        }
        collapseAllUnchangedRegions() {
            const unchangedRegions = this._diffModel.get()?.unchangedRegions.get();
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
            const unchangedRegions = this._diffModel.get()?.unchangedRegions.get();
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
    exports.DiffEditorWidget = DiffEditorWidget;
    exports.DiffEditorWidget = DiffEditorWidget = __decorate([
        __param(3, contextkey_1.IContextKeyService),
        __param(4, instantiation_1.IInstantiationService),
        __param(5, codeEditorService_1.ICodeEditorService),
        __param(6, audioCueService_1.IAudioCueService),
        __param(7, progress_1.IEditorProgressService)
    ], DiffEditorWidget);
    function translatePosition(posInOriginal, mappings) {
        const mapping = (0, arraysFind_1.findLast)(mappings, m => m.original.startLineNumber <= posInOriginal.lineNumber);
        if (!mapping) {
            // No changes before the position
            return range_1.Range.fromPositions(posInOriginal);
        }
        if (mapping.original.endLineNumberExclusive <= posInOriginal.lineNumber) {
            const newLineNumber = posInOriginal.lineNumber - mapping.original.endLineNumberExclusive + mapping.modified.endLineNumberExclusive;
            return range_1.Range.fromPositions(new position_1.Position(newLineNumber, posInOriginal.column));
        }
        if (!mapping.innerChanges) {
            // Only for legacy algorithm
            return range_1.Range.fromPositions(new position_1.Position(mapping.modified.startLineNumber, 1));
        }
        const innerMapping = (0, arraysFind_1.findLast)(mapping.innerChanges, m => m.originalRange.getStartPosition().isBeforeOrEqual(posInOriginal));
        if (!innerMapping) {
            const newLineNumber = posInOriginal.lineNumber - mapping.original.startLineNumber + mapping.modified.startLineNumber;
            return range_1.Range.fromPositions(new position_1.Position(newLineNumber, posInOriginal.column));
        }
        if (innerMapping.originalRange.containsPosition(posInOriginal)) {
            return innerMapping.modifiedRange;
        }
        else {
            const l = lengthBetweenPositions(innerMapping.originalRange.getEndPosition(), posInOriginal);
            return range_1.Range.fromPositions(addLength(innerMapping.modifiedRange.getEndPosition(), l));
        }
    }
    function lengthBetweenPositions(position1, position2) {
        if (position1.lineNumber === position2.lineNumber) {
            return new length_1.LengthObj(0, position2.column - position1.column);
        }
        else {
            return new length_1.LengthObj(position2.lineNumber - position1.lineNumber, position2.column - 1);
        }
    }
    function addLength(position, length) {
        if (length.lineCount === 0) {
            return new position_1.Position(position.lineNumber, position.column + length.columnCount);
        }
        else {
            return new position_1.Position(position.lineNumber + length.lineCount, length.columnCount + 1);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGlmZkVkaXRvcldpZGdldC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL2VkaXRvci9icm93c2VyL3dpZGdldC9kaWZmRWRpdG9yL2RpZmZFZGl0b3JXaWRnZXQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7OztJQW9ETyxJQUFNLGdCQUFnQixHQUF0QixNQUFNLGdCQUFpQixTQUFRLHVDQUFnQjtpQkFDdkMsK0JBQTBCLEdBQUcscUNBQWlCLENBQUMsMEJBQTBCLEFBQS9DLENBQWdEO1FBV3hGLElBQVcsc0JBQXNCLEtBQUssT0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDLHNCQUFzQixDQUFDLENBQUMsQ0FBQztRQXlCcEYsSUFBVyx3QkFBd0IsS0FBSyxPQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsb0JBQW9CLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBRTFGLFlBQ2tCLFdBQXdCLEVBQ3pDLE9BQWlELEVBQ2pELHVCQUFxRCxFQUNqQyx3QkFBNkQsRUFDMUQsMkJBQW1FLEVBQ3RFLGlCQUFxQyxFQUN2QyxnQkFBbUQsRUFDN0Msc0JBQStEO1lBRXZGLEtBQUssRUFBRSxDQUFDO1lBVFMsZ0JBQVcsR0FBWCxXQUFXLENBQWE7WUFHSiw2QkFBd0IsR0FBeEIsd0JBQXdCLENBQW9CO1lBQ3pDLGdDQUEyQixHQUEzQiwyQkFBMkIsQ0FBdUI7WUFFdkQscUJBQWdCLEdBQWhCLGdCQUFnQixDQUFrQjtZQUM1QiwyQkFBc0IsR0FBdEIsc0JBQXNCLENBQXdCO1lBNUN2RSxhQUFRLEdBQUcsSUFBQSxPQUFDLEVBQUMscUNBQXFDLEVBQUUsRUFBRSxLQUFLLEVBQUUsRUFBRSxRQUFRLEVBQUUsVUFBVSxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsRUFBRSxFQUFFO2dCQUN6SCxJQUFBLE9BQUMsRUFBQyxvQ0FBb0MsRUFBRSxFQUFFLEtBQUssRUFBRSxFQUFFLFFB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