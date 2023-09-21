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
define(["require", "exports", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/uuid", "vs/editor/browser/services/codeEditorService", "vs/editor/common/services/resolverService", "vs/editor/common/model/prefixSumComputer", "vs/platform/configuration/common/configuration", "vs/platform/undoRedo/common/undoRedo", "vs/workbench/contrib/notebook/browser/notebookBrowser", "vs/workbench/contrib/notebook/browser/viewModel/cellOutputViewModel", "vs/workbench/contrib/notebook/common/notebookCommon", "vs/workbench/contrib/notebook/common/notebookService", "./baseCellViewModel"], function (require, exports, event_1, lifecycle_1, UUID, codeEditorService_1, resolverService_1, prefixSumComputer_1, configuration_1, undoRedo_1, notebookBrowser_1, cellOutputViewModel_1, notebookCommon_1, notebookService_1, baseCellViewModel_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Rnb = exports.$Qnb = void 0;
    exports.$Qnb = 500;
    let $Rnb = class $Rnb extends baseCellViewModel_1.$Pnb {
        set editorHeight(height) {
            if (this.gb === height) {
                return;
            }
            this.gb = height;
            this.layoutChange({ editorHeight: true }, 'CodeCellViewModel#editorHeight');
        }
        get editorHeight() {
            throw new Error('editorHeight is write-only');
        }
        set commentHeight(height) {
            if (this.hb === height) {
                return;
            }
            this.hb = height;
            this.layoutChange({ commentHeight: true }, 'CodeCellViewModel#commentHeight');
        }
        get outputIsHovered() {
            return this.ib;
        }
        set outputIsHovered(v) {
            this.ib = v;
            this.b.fire({ outputIsHoveredChanged: true });
        }
        get outputIsFocused() {
            return this.jb;
        }
        set outputIsFocused(v) {
            this.jb = v;
            this.b.fire({ outputIsFocusedChanged: true });
        }
        get lb() {
            return this.kb;
        }
        /**
         * The minimum height of the output region. It's only set to non-zero temporarily when replacing an output with a new one.
         * It's reset to 0 when the new output is rendered, or in one second.
         */
        set lb(newMin) {
            this.kb = newMin;
        }
        get layoutInfo() {
            return this.mb;
        }
        get outputsViewModels() {
            return this.nb;
        }
        constructor(viewType, model, initialNotebookLayoutInfo, viewContext, configurationService, ob, modelService, undoRedoService, codeEditorService) {
            super(viewType, model, UUID.$4f(), viewContext, configurationService, modelService, undoRedoService, codeEditorService);
            this.viewContext = viewContext;
            this.ob = ob;
            this.cellKind = notebookCommon_1.CellKind.Code;
            this.Z = this.B(new event_1.$fd());
            this.onLayoutInfoRead = this.Z.event;
            this.$ = this.B(new event_1.$fd());
            this.onDidStartExecution = this.$.event;
            this.ab = this.B(new event_1.$fd());
            this.onDidStopExecution = this.ab.event;
            this.bb = this.B(new event_1.$fd());
            this.onDidChangeOutputs = this.bb.event;
            this.cb = this.B(new event_1.$fd());
            this.onDidRemoveOutputs = this.cb.event;
            this.db = [];
            this.eb = null;
            this.fb = this.B(new event_1.$id());
            this.onDidChangeLayout = this.fb.event;
            this.gb = 0;
            this.hb = 0;
            this.ib = false;
            this.jb = false;
            this.kb = 0;
            this.ub = this.B(new event_1.$fd());
            this.hasFindResult = this.ub.event;
            this.nb = this.model.outputs.map(output => new cellOutputViewModel_1.$Knb(this, output, this.ob));
            this.B(this.model.onDidChangeOutputs((splice) => {
                const removedOutputs = [];
                let outputLayoutChange = false;
                for (let i = splice.start; i < splice.start + splice.deleteCount; i++) {
                    if (this.db[i] !== undefined && this.db[i] !== 0) {
                        outputLayoutChange = true;
                    }
                }
                this.db.splice(splice.start, splice.deleteCount, ...splice.newOutputs.map(() => 0));
                removedOutputs.push(...this.nb.splice(splice.start, splice.deleteCount, ...splice.newOutputs.map(output => new cellOutputViewModel_1.$Knb(this, output, this.ob))));
                this.eb = null;
                this.bb.fire(splice);
                this.cb.fire(removedOutputs);
                if (outputLayoutChange) {
                    this.layoutChange({ outputHeight: true }, 'CodeCellViewModel#model.onDidChangeOutputs');
                }
                (0, lifecycle_1.$fc)(removedOutputs);
            }));
            this.db = new Array(this.model.outputs.length);
            this.mb = {
                fontInfo: initialNotebookLayoutInfo?.fontInfo || null,
                editorHeight: 0,
                editorWidth: initialNotebookLayoutInfo
                    ? this.viewContext.notebookOptions.computeCodeCellEditorWidth(initialNotebookLayoutInfo.width)
                    : 0,
                statusBarHeight: 0,
                commentHeight: 0,
                outputContainerOffset: 0,
                outputTotalHeight: 0,
                outputShowMoreContainerHeight: 0,
                outputShowMoreContainerOffset: 0,
                totalHeight: this.rb(17, 0, 0),
                codeIndicatorHeight: 0,
                outputIndicatorHeight: 0,
                bottomToolbarOffset: 0,
                layoutState: notebookBrowser_1.CellLayoutState.Uninitialized,
                estimatedHasHorizontalScrolling: false
            };
        }
        updateExecutionState(e) {
            if (e.changed) {
                this.$.fire(e);
            }
            else {
                this.ab.fire(e);
            }
        }
        updateOptions(e) {
            if (e.cellStatusBarVisibility || e.insertToolbarPosition || e.cellToolbarLocation) {
                this.layoutChange({});
            }
        }
        pauseLayout() {
            this.fb.pause();
        }
        resumeLayout() {
            this.fb.resume();
        }
        layoutChange(state, source) {
            // recompute
            this.tb();
            const notebookLayoutConfiguration = this.viewContext.notebookOptions.getLayoutConfiguration();
            const bottomToolbarDimensions = this.viewContext.notebookOptions.computeBottomToolbarDimensions(this.viewType);
            const outputShowMoreContainerHeight = state.outputShowMoreContainerHeight ? state.outputShowMoreContainerHeight : this.mb.outputShowMoreContainerHeight;
            const outputTotalHeight = Math.max(this.kb, this.isOutputCollapsed ? notebookLayoutConfiguration.collapsedIndicatorHeight : this.eb.getTotalSum());
            const commentHeight = state.commentHeight ? this.hb : this.mb.commentHeight;
            const originalLayout = this.layoutInfo;
            if (!this.isInputCollapsed) {
                let newState;
                let editorHeight;
                let totalHeight;
                let hasHorizontalScrolling = false;
                if (!state.editorHeight && this.mb.layoutState === notebookBrowser_1.CellLayoutState.FromCache && !state.outputHeight) {
                    // No new editorHeight info - keep cached totalHeight and estimate editorHeight
                    const estimate = this.qb(state.font?.lineHeight ?? this.mb.fontInfo?.lineHeight);
                    editorHeight = estimate.editorHeight;
                    hasHorizontalScrolling = estimate.hasHorizontalScrolling;
                    totalHeight = this.mb.totalHeight;
                    newState = notebookBrowser_1.CellLayoutState.FromCache;
                }
                else if (state.editorHeight || this.mb.layoutState === notebookBrowser_1.CellLayoutState.Measured) {
                    // Editor has been measured
                    editorHeight = this.gb;
                    totalHeight = this.rb(this.gb, outputTotalHeight, outputShowMoreContainerHeight);
                    newState = notebookBrowser_1.CellLayoutState.Measured;
                    hasHorizontalScrolling = this.mb.estimatedHasHorizontalScrolling;
                }
                else {
                    const estimate = this.qb(state.font?.lineHeight ?? this.mb.fontInfo?.lineHeight);
                    editorHeight = estimate.editorHeight;
                    hasHorizontalScrolling = estimate.hasHorizontalScrolling;
                    totalHeight = this.rb(editorHeight, outputTotalHeight, outputShowMoreContainerHeight);
                    newState = notebookBrowser_1.CellLayoutState.Estimated;
                }
                const statusBarHeight = this.viewContext.notebookOptions.computeEditorStatusbarHeight(this.internalMetadata, this.uri);
                const codeIndicatorHeight = editorHeight + statusBarHeight;
                const outputIndicatorHeight = outputTotalHeight + outputShowMoreContainerHeight;
                const outputContainerOffset = notebookLayoutConfiguration.editorToolbarHeight
                    + notebookLayoutConfiguration.cellTopMargin // CELL_TOP_MARGIN
                    + editorHeight
                    + statusBarHeight;
                const outputShowMoreContainerOffset = totalHeight
                    - bottomToolbarDimensions.bottomToolbarGap
                    - bottomToolbarDimensions.bottomToolbarHeight / 2
                    - outputShowMoreContainerHeight;
                const bottomToolbarOffset = this.viewContext.notebookOptions.computeBottomToolbarOffset(totalHeight, this.viewType);
                const editorWidth = state.outerWidth !== undefined
                    ? this.viewContext.notebookOptions.computeCodeCellEditorWidth(state.outerWidth)
                    : this.mb?.editorWidth;
                this.mb = {
                    fontInfo: state.font ?? this.mb.fontInfo ?? null,
                    editorHeight,
                    editorWidth,
                    statusBarHeight,
                    commentHeight,
                    outputContainerOffset,
                    outputTotalHeight,
                    outputShowMoreContainerHeight,
                    outputShowMoreContainerOffset,
                    totalHeight,
                    codeIndicatorHeight,
                    outputIndicatorHeight,
                    bottomToolbarOffset,
                    layoutState: newState,
                    estimatedHasHorizontalScrolling: hasHorizontalScrolling
                };
            }
            else {
                const codeIndicatorHeight = notebookLayoutConfiguration.collapsedIndicatorHeight;
                const outputIndicatorHeight = outputTotalHeight + outputShowMoreContainerHeight;
                const outputContainerOffset = notebookLayoutConfiguration.cellTopMargin + notebookLayoutConfiguration.collapsedIndicatorHeight;
                const totalHeight = notebookLayoutConfiguration.cellTopMargin
                    + notebookLayoutConfiguration.collapsedIndicatorHeight
                    + notebookLayoutConfiguration.cellBottomMargin //CELL_BOTTOM_MARGIN
                    + bottomToolbarDimensions.bottomToolbarGap //BOTTOM_CELL_TOOLBAR_GAP
                    + commentHeight
                    + outputTotalHeight + outputShowMoreContainerHeight;
                const outputShowMoreContainerOffset = totalHeight
                    - bottomToolbarDimensions.bottomToolbarGap
                    - bottomToolbarDimensions.bottomToolbarHeight / 2
                    - outputShowMoreContainerHeight;
                const bottomToolbarOffset = this.viewContext.notebookOptions.computeBottomToolbarOffset(totalHeight, this.viewType);
                const editorWidth = state.outerWidth !== undefined
                    ? this.viewContext.notebookOptions.computeCodeCellEditorWidth(state.outerWidth)
                    : this.mb?.editorWidth;
                this.mb = {
                    fontInfo: state.font ?? this.mb.fontInfo ?? null,
                    editorHeight: this.mb.editorHeight,
                    editorWidth,
                    statusBarHeight: 0,
                    commentHeight,
                    outputContainerOffset,
                    outputTotalHeight,
                    outputShowMoreContainerHeight,
                    outputShowMoreContainerOffset,
                    totalHeight,
                    codeIndicatorHeight,
                    outputIndicatorHeight,
                    bottomToolbarOffset,
                    layoutState: this.mb.layoutState,
                    estimatedHasHorizontalScrolling: false
                };
            }
            this.pb({
                ...state,
                totalHeight: this.layoutInfo.totalHeight !== originalLayout.totalHeight,
                source,
            });
        }
        pb(state) {
            this.fb.fire(state);
        }
        restoreEditorViewState(editorViewStates, totalHeight) {
            super.restoreEditorViewState(editorViewStates);
            if (totalHeight !== undefined && this.mb.layoutState !== notebookBrowser_1.CellLayoutState.Measured) {
                this.mb = {
                    fontInfo: this.mb.fontInfo,
                    editorHeight: this.mb.editorHeight,
                    editorWidth: this.mb.editorWidth,
                    statusBarHeight: this.layoutInfo.statusBarHeight,
                    commentHeight: this.layoutInfo.commentHeight,
                    outputContainerOffset: this.mb.outputContainerOffset,
                    outputTotalHeight: this.mb.outputTotalHeight,
                    outputShowMoreContainerHeight: this.mb.outputShowMoreContainerHeight,
                    outputShowMoreContainerOffset: this.mb.outputShowMoreContainerOffset,
                    totalHeight: totalHeight,
                    codeIndicatorHeight: this.mb.codeIndicatorHeight,
                    outputIndicatorHeight: this.mb.outputIndicatorHeight,
                    bottomToolbarOffset: this.mb.bottomToolbarOffset,
                    layoutState: notebookBrowser_1.CellLayoutState.FromCache,
                    estimatedHasHorizontalScrolling: this.mb.estimatedHasHorizontalScrolling
                };
            }
        }
        getDynamicHeight() {
            this.Z.fire();
            return this.mb.totalHeight;
        }
        getHeight(lineHeight) {
            if (this.mb.layoutState === notebookBrowser_1.CellLayoutState.Uninitialized) {
                const estimate = this.qb(lineHeight);
                return this.rb(estimate.editorHeight, 0, 0);
            }
            else {
                return this.mb.totalHeight;
            }
        }
        qb(lineHeight = 20) {
            let hasHorizontalScrolling = false;
            const cellEditorOptions = this.viewContext.getBaseCellEditorOptions(this.language);
            if (this.layoutInfo.fontInfo && cellEditorOptions.value.wordWrap === 'off') {
                for (let i = 0; i < this.lineCount; i++) {
                    const max = this.textBuffer.getLineLastNonWhitespaceColumn(i + 1);
                    const estimatedWidth = max * (this.layoutInfo.fontInfo.typicalHalfwidthCharacterWidth + this.layoutInfo.fontInfo.letterSpacing);
                    if (estimatedWidth > this.layoutInfo.editorWidth) {
                        hasHorizontalScrolling = true;
                        break;
                    }
                }
            }
            const verticalScrollbarHeight = hasHorizontalScrolling ? 12 : 0; // take zoom level into account
            const editorPadding = this.viewContext.notebookOptions.computeEditorPadding(this.internalMetadata, this.uri);
            const editorHeight = this.lineCount * lineHeight
                + editorPadding.top
                + editorPadding.bottom // EDITOR_BOTTOM_PADDING
                + verticalScrollbarHeight;
            return {
                editorHeight,
                hasHorizontalScrolling
            };
        }
        rb(editorHeight, outputsTotalHeight, outputShowMoreContainerHeight) {
            const layoutConfiguration = this.viewContext.notebookOptions.getLayoutConfiguration();
            const { bottomToolbarGap } = this.viewContext.notebookOptions.computeBottomToolbarDimensions(this.viewType);
            return layoutConfiguration.editorToolbarHeight
                + layoutConfiguration.cellTopMargin
                + editorHeight
                + this.viewContext.notebookOptions.computeEditorStatusbarHeight(this.internalMetadata, this.uri)
                + this.hb
                + outputsTotalHeight
                + outputShowMoreContainerHeight
                + bottomToolbarGap
                + layoutConfiguration.cellBottomMargin;
        }
        X() {
            if (this.getEditState() !== notebookBrowser_1.CellEditState.Editing) {
                this.updateEditState(notebookBrowser_1.CellEditState.Editing, 'onDidChangeTextModelContent');
                this.b.fire({ contentChanged: true });
            }
        }
        onDeselect() {
            this.updateEditState(notebookBrowser_1.CellEditState.Preview, 'onDeselect');
        }
        updateOutputShowMoreContainerHeight(height) {
            this.layoutChange({ outputShowMoreContainerHeight: height }, 'CodeCellViewModel#updateOutputShowMoreContainerHeight');
        }
        updateOutputMinHeight(height) {
            this.lb = height;
        }
        unlockOutputHeight() {
            this.lb = 0;
            this.layoutChange({ outputHeight: true });
        }
        updateOutputHeight(index, height, source) {
            if (index >= this.db.length) {
                throw new Error('Output index out of range!');
            }
            this.tb();
            if (height < 28 && this.nb[index].hasMultiMimeType()) {
                height = 28;
            }
            this.db[index] = height;
            if (this.eb.setValue(index, height)) {
                this.layoutChange({ outputHeight: true }, source);
            }
        }
        getOutputOffsetInContainer(index) {
            this.tb();
            if (index >= this.db.length) {
                throw new Error('Output index out of range!');
            }
            return this.eb.getPrefixSum(index - 1);
        }
        getOutputOffset(index) {
            return this.layoutInfo.outputContainerOffset + this.getOutputOffsetInContainer(index);
        }
        spliceOutputHeights(start, deleteCnt, heights) {
            this.tb();
            this.eb.removeValues(start, deleteCnt);
            if (heights.length) {
                const values = new Uint32Array(heights.length);
                for (let i = 0; i < heights.length; i++) {
                    values[i] = heights[i];
                }
                this.eb.insertValues(start, values);
            }
            this.layoutChange({ outputHeight: true }, 'CodeCellViewModel#spliceOutputs');
        }
        tb() {
            if (!this.eb) {
                const values = new Uint32Array(this.db.length);
                for (let i = 0; i < this.db.length; i++) {
                    values[i] = this.db[i];
                }
                this.eb = new prefixSumComputer_1.$Ju(values);
            }
        }
        startFind(value, options) {
            const matches = super.Y(value, options);
            if (matches === null) {
                return null;
            }
            return {
                cell: this,
                contentMatches: matches
            };
        }
        dispose() {
            super.dispose();
            this.db = [];
            this.eb = null;
            (0, lifecycle_1.$fc)(this.nb);
        }
    };
    exports.$Rnb = $Rnb;
    exports.$Rnb = $Rnb = __decorate([
        __param(4, configuration_1.$8h),
        __param(5, notebookService_1.$ubb),
        __param(6, resolverService_1.$uA),
        __param(7, undoRedo_1.$wu),
        __param(8, codeEditorService_1.$nV)
    ], $Rnb);
});
//# sourceMappingURL=codeCellViewModel.js.map