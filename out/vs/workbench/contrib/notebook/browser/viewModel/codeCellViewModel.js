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
    exports.CodeCellViewModel = exports.outputDisplayLimit = void 0;
    exports.outputDisplayLimit = 500;
    let CodeCellViewModel = class CodeCellViewModel extends baseCellViewModel_1.BaseCellViewModel {
        set editorHeight(height) {
            if (this._editorHeight === height) {
                return;
            }
            this._editorHeight = height;
            this.layoutChange({ editorHeight: true }, 'CodeCellViewModel#editorHeight');
        }
        get editorHeight() {
            throw new Error('editorHeight is write-only');
        }
        set commentHeight(height) {
            if (this._commentHeight === height) {
                return;
            }
            this._commentHeight = height;
            this.layoutChange({ commentHeight: true }, 'CodeCellViewModel#commentHeight');
        }
        get outputIsHovered() {
            return this._hoveringOutput;
        }
        set outputIsHovered(v) {
            this._hoveringOutput = v;
            this._onDidChangeState.fire({ outputIsHoveredChanged: true });
        }
        get outputIsFocused() {
            return this._focusOnOutput;
        }
        set outputIsFocused(v) {
            this._focusOnOutput = v;
            this._onDidChangeState.fire({ outputIsFocusedChanged: true });
        }
        get outputMinHeight() {
            return this._outputMinHeight;
        }
        /**
         * The minimum height of the output region. It's only set to non-zero temporarily when replacing an output with a new one.
         * It's reset to 0 when the new output is rendered, or in one second.
         */
        set outputMinHeight(newMin) {
            this._outputMinHeight = newMin;
        }
        get layoutInfo() {
            return this._layoutInfo;
        }
        get outputsViewModels() {
            return this._outputViewModels;
        }
        constructor(viewType, model, initialNotebookLayoutInfo, viewContext, configurationService, _notebookService, modelService, undoRedoService, codeEditorService) {
            super(viewType, model, UUID.generateUuid(), viewContext, configurationService, modelService, undoRedoService, codeEditorService);
            this.viewContext = viewContext;
            this._notebookService = _notebookService;
            this.cellKind = notebookCommon_1.CellKind.Code;
            this._onLayoutInfoRead = this._register(new event_1.Emitter());
            this.onLayoutInfoRead = this._onLayoutInfoRead.event;
            this._onDidStartExecution = this._register(new event_1.Emitter());
            this.onDidStartExecution = this._onDidStartExecution.event;
            this._onDidStopExecution = this._register(new event_1.Emitter());
            this.onDidStopExecution = this._onDidStopExecution.event;
            this._onDidChangeOutputs = this._register(new event_1.Emitter());
            this.onDidChangeOutputs = this._onDidChangeOutputs.event;
            this._onDidRemoveOutputs = this._register(new event_1.Emitter());
            this.onDidRemoveOutputs = this._onDidRemoveOutputs.event;
            this._outputCollection = [];
            this._outputsTop = null;
            this._pauseableEmitter = this._register(new event_1.PauseableEmitter());
            this.onDidChangeLayout = this._pauseableEmitter.event;
            this._editorHeight = 0;
            this._commentHeight = 0;
            this._hoveringOutput = false;
            this._focusOnOutput = false;
            this._outputMinHeight = 0;
            this._hasFindResult = this._register(new event_1.Emitter());
            this.hasFindResult = this._hasFindResult.event;
            this._outputViewModels = this.model.outputs.map(output => new cellOutputViewModel_1.CellOutputViewModel(this, output, this._notebookService));
            this._register(this.model.onDidChangeOutputs((splice) => {
                const removedOutputs = [];
                let outputLayoutChange = false;
                for (let i = splice.start; i < splice.start + splice.deleteCount; i++) {
                    if (this._outputCollection[i] !== undefined && this._outputCollection[i] !== 0) {
                        outputLayoutChange = true;
                    }
                }
                this._outputCollection.splice(splice.start, splice.deleteCount, ...splice.newOutputs.map(() => 0));
                removedOutputs.push(...this._outputViewModels.splice(splice.start, splice.deleteCount, ...splice.newOutputs.map(output => new cellOutputViewModel_1.CellOutputViewModel(this, output, this._notebookService))));
                this._outputsTop = null;
                this._onDidChangeOutputs.fire(splice);
                this._onDidRemoveOutputs.fire(removedOutputs);
                if (outputLayoutChange) {
                    this.layoutChange({ outputHeight: true }, 'CodeCellViewModel#model.onDidChangeOutputs');
                }
                (0, lifecycle_1.dispose)(removedOutputs);
            }));
            this._outputCollection = new Array(this.model.outputs.length);
            this._layoutInfo = {
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
                totalHeight: this.computeTotalHeight(17, 0, 0),
                codeIndicatorHeight: 0,
                outputIndicatorHeight: 0,
                bottomToolbarOffset: 0,
                layoutState: notebookBrowser_1.CellLayoutState.Uninitialized,
                estimatedHasHorizontalScrolling: false
            };
        }
        updateExecutionState(e) {
            if (e.changed) {
                this._onDidStartExecution.fire(e);
            }
            else {
                this._onDidStopExecution.fire(e);
            }
        }
        updateOptions(e) {
            if (e.cellStatusBarVisibility || e.insertToolbarPosition || e.cellToolbarLocation) {
                this.layoutChange({});
            }
        }
        pauseLayout() {
            this._pauseableEmitter.pause();
        }
        resumeLayout() {
            this._pauseableEmitter.resume();
        }
        layoutChange(state, source) {
            // recompute
            this._ensureOutputsTop();
            const notebookLayoutConfiguration = this.viewContext.notebookOptions.getLayoutConfiguration();
            const bottomToolbarDimensions = this.viewContext.notebookOptions.computeBottomToolbarDimensions(this.viewType);
            const outputShowMoreContainerHeight = state.outputShowMoreContainerHeight ? state.outputShowMoreContainerHeight : this._layoutInfo.outputShowMoreContainerHeight;
            const outputTotalHeight = Math.max(this._outputMinHeight, this.isOutputCollapsed ? notebookLayoutConfiguration.collapsedIndicatorHeight : this._outputsTop.getTotalSum());
            const commentHeight = state.commentHeight ? this._commentHeight : this._layoutInfo.commentHeight;
            const originalLayout = this.layoutInfo;
            if (!this.isInputCollapsed) {
                let newState;
                let editorHeight;
                let totalHeight;
                let hasHorizontalScrolling = false;
                if (!state.editorHeight && this._layoutInfo.layoutState === notebookBrowser_1.CellLayoutState.FromCache && !state.outputHeight) {
                    // No new editorHeight info - keep cached totalHeight and estimate editorHeight
                    const estimate = this.estimateEditorHeight(state.font?.lineHeight ?? this._layoutInfo.fontInfo?.lineHeight);
                    editorHeight = estimate.editorHeight;
                    hasHorizontalScrolling = estimate.hasHorizontalScrolling;
                    totalHeight = this._layoutInfo.totalHeight;
                    newState = notebookBrowser_1.CellLayoutState.FromCache;
                }
                else if (state.editorHeight || this._layoutInfo.layoutState === notebookBrowser_1.CellLayoutState.Measured) {
                    // Editor has been measured
                    editorHeight = this._editorHeight;
                    totalHeight = this.computeTotalHeight(this._editorHeight, outputTotalHeight, outputShowMoreContainerHeight);
                    newState = notebookBrowser_1.CellLayoutState.Measured;
                    hasHorizontalScrolling = this._layoutInfo.estimatedHasHorizontalScrolling;
                }
                else {
                    const estimate = this.estimateEditorHeight(state.font?.lineHeight ?? this._layoutInfo.fontInfo?.lineHeight);
                    editorHeight = estimate.editorHeight;
                    hasHorizontalScrolling = estimate.hasHorizontalScrolling;
                    totalHeight = this.computeTotalHeight(editorHeight, outputTotalHeight, outputShowMoreContainerHeight);
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
                    : this._layoutInfo?.editorWidth;
                this._layoutInfo = {
                    fontInfo: state.font ?? this._layoutInfo.fontInfo ?? null,
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
                    : this._layoutInfo?.editorWidth;
                this._layoutInfo = {
                    fontInfo: state.font ?? this._layoutInfo.fontInfo ?? null,
                    editorHeight: this._layoutInfo.editorHeight,
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
                    layoutState: this._layoutInfo.layoutState,
                    estimatedHasHorizontalScrolling: false
                };
            }
            this._fireOnDidChangeLayout({
                ...state,
                totalHeight: this.layoutInfo.totalHeight !== originalLayout.totalHeight,
                source,
            });
        }
        _fireOnDidChangeLayout(state) {
            this._pauseableEmitter.fire(state);
        }
        restoreEditorViewState(editorViewStates, totalHeight) {
            super.restoreEditorViewState(editorViewStates);
            if (totalHeight !== undefined && this._layoutInfo.layoutState !== notebookBrowser_1.CellLayoutState.Measured) {
                this._layoutInfo = {
                    fontInfo: this._layoutInfo.fontInfo,
                    editorHeight: this._layoutInfo.editorHeight,
                    editorWidth: this._layoutInfo.editorWidth,
                    statusBarHeight: this.layoutInfo.statusBarHeight,
                    commentHeight: this.layoutInfo.commentHeight,
                    outputContainerOffset: this._layoutInfo.outputContainerOffset,
                    outputTotalHeight: this._layoutInfo.outputTotalHeight,
                    outputShowMoreContainerHeight: this._layoutInfo.outputShowMoreContainerHeight,
                    outputShowMoreContainerOffset: this._layoutInfo.outputShowMoreContainerOffset,
                    totalHeight: totalHeight,
                    codeIndicatorHeight: this._layoutInfo.codeIndicatorHeight,
                    outputIndicatorHeight: this._layoutInfo.outputIndicatorHeight,
                    bottomToolbarOffset: this._layoutInfo.bottomToolbarOffset,
                    layoutState: notebookBrowser_1.CellLayoutState.FromCache,
                    estimatedHasHorizontalScrolling: this._layoutInfo.estimatedHasHorizontalScrolling
                };
            }
        }
        getDynamicHeight() {
            this._onLayoutInfoRead.fire();
            return this._layoutInfo.totalHeight;
        }
        getHeight(lineHeight) {
            if (this._layoutInfo.layoutState === notebookBrowser_1.CellLayoutState.Uninitialized) {
                const estimate = this.estimateEditorHeight(lineHeight);
                return this.computeTotalHeight(estimate.editorHeight, 0, 0);
            }
            else {
                return this._layoutInfo.totalHeight;
            }
        }
        estimateEditorHeight(lineHeight = 20) {
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
        computeTotalHeight(editorHeight, outputsTotalHeight, outputShowMoreContainerHeight) {
            const layoutConfiguration = this.viewContext.notebookOptions.getLayoutConfiguration();
            const { bottomToolbarGap } = this.viewContext.notebookOptions.computeBottomToolbarDimensions(this.viewType);
            return layoutConfiguration.editorToolbarHeight
                + layoutConfiguration.cellTopMargin
                + editorHeight
                + this.viewContext.notebookOptions.computeEditorStatusbarHeight(this.internalMetadata, this.uri)
                + this._commentHeight
                + outputsTotalHeight
                + outputShowMoreContainerHeight
                + bottomToolbarGap
                + layoutConfiguration.cellBottomMargin;
        }
        onDidChangeTextModelContent() {
            if (this.getEditState() !== notebookBrowser_1.CellEditState.Editing) {
                this.updateEditState(notebookBrowser_1.CellEditState.Editing, 'onDidChangeTextModelContent');
                this._onDidChangeState.fire({ contentChanged: true });
            }
        }
        onDeselect() {
            this.updateEditState(notebookBrowser_1.CellEditState.Preview, 'onDeselect');
        }
        updateOutputShowMoreContainerHeight(height) {
            this.layoutChange({ outputShowMoreContainerHeight: height }, 'CodeCellViewModel#updateOutputShowMoreContainerHeight');
        }
        updateOutputMinHeight(height) {
            this.outputMinHeight = height;
        }
        unlockOutputHeight() {
            this.outputMinHeight = 0;
            this.layoutChange({ outputHeight: true });
        }
        updateOutputHeight(index, height, source) {
            if (index >= this._outputCollection.length) {
                throw new Error('Output index out of range!');
            }
            this._ensureOutputsTop();
            if (height < 28 && this._outputViewModels[index].hasMultiMimeType()) {
                height = 28;
            }
            this._outputCollection[index] = height;
            if (this._outputsTop.setValue(index, height)) {
                this.layoutChange({ outputHeight: true }, source);
            }
        }
        getOutputOffsetInContainer(index) {
            this._ensureOutputsTop();
            if (index >= this._outputCollection.length) {
                throw new Error('Output index out of range!');
            }
            return this._outputsTop.getPrefixSum(index - 1);
        }
        getOutputOffset(index) {
            return this.layoutInfo.outputContainerOffset + this.getOutputOffsetInContainer(index);
        }
        spliceOutputHeights(start, deleteCnt, heights) {
            this._ensureOutputsTop();
            this._outputsTop.removeValues(start, deleteCnt);
            if (heights.length) {
                const values = new Uint32Array(heights.length);
                for (let i = 0; i < heights.length; i++) {
                    values[i] = heights[i];
                }
                this._outputsTop.insertValues(start, values);
            }
            this.layoutChange({ outputHeight: true }, 'CodeCellViewModel#spliceOutputs');
        }
        _ensureOutputsTop() {
            if (!this._outputsTop) {
                const values = new Uint32Array(this._outputCollection.length);
                for (let i = 0; i < this._outputCollection.length; i++) {
                    values[i] = this._outputCollection[i];
                }
                this._outputsTop = new prefixSumComputer_1.PrefixSumComputer(values);
            }
        }
        startFind(value, options) {
            const matches = super.cellStartFind(value, options);
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
            this._outputCollection = [];
            this._outputsTop = null;
            (0, lifecycle_1.dispose)(this._outputViewModels);
        }
    };
    exports.CodeCellViewModel = CodeCellViewModel;
    exports.CodeCellViewModel = CodeCellViewModel = __decorate([
        __param(4, configuration_1.IConfigurationService),
        __param(5, notebookService_1.INotebookService),
        __param(6, resolverService_1.ITextModelService),
        __param(7, undoRedo_1.IUndoRedoService),
        __param(8, codeEditorService_1.ICodeEditorService)
    ], CodeCellViewModel);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29kZUNlbGxWaWV3TW9kZWwuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9ub3RlYm9vay9icm93c2VyL3ZpZXdNb2RlbC9jb2RlQ2VsbFZpZXdNb2RlbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUFzQm5GLFFBQUEsa0JBQWtCLEdBQUcsR0FBRyxDQUFDO0lBRS9CLElBQU0saUJBQWlCLEdBQXZCLE1BQU0saUJBQWtCLFNBQVEscUNBQWlCO1FBMEJ2RCxJQUFJLFlBQVksQ0FBQyxNQUFjO1lBQzlCLElBQUksSUFBSSxDQUFDLGFBQWEsS0FBSyxNQUFNLEVBQUU7Z0JBQ2xDLE9BQU87YUFDUDtZQUVELElBQUksQ0FBQyxhQUFhLEdBQUcsTUFBTSxDQUFDO1lBQzVCLElBQUksQ0FBQyxZQUFZLENBQUMsRUFBRSxZQUFZLEVBQUUsSUFBSSxFQUFFLEVBQUUsZ0NBQWdDLENBQUMsQ0FBQztRQUM3RSxDQUFDO1FBRUQsSUFBSSxZQUFZO1lBQ2YsTUFBTSxJQUFJLEtBQUssQ0FBQyw0QkFBNEIsQ0FBQyxDQUFDO1FBQy9DLENBQUM7UUFJRCxJQUFJLGFBQWEsQ0FBQyxNQUFjO1lBQy9CLElBQUksSUFBSSxDQUFDLGNBQWMsS0FBSyxNQUFNLEVBQUU7Z0JBQ25DLE9BQU87YUFDUDtZQUNELElBQUksQ0FBQyxjQUFjLEdBQUcsTUFBTSxDQUFDO1lBQzdCLElBQUksQ0FBQyxZQUFZLENBQUMsRUFBRSxhQUFhLEVBQUUsSUFBSSxFQUFFLEVBQUUsaUNBQWlDLENBQUMsQ0FBQztRQUMvRSxDQUFDO1FBR0QsSUFBVyxlQUFlO1lBQ3pCLE9BQU8sSUFBSSxDQUFDLGVBQWUsQ0FBQztRQUM3QixDQUFDO1FBRUQsSUFBVyxlQUFlLENBQUMsQ0FBVTtZQUNwQyxJQUFJLENBQUMsZUFBZSxHQUFHLENBQUMsQ0FBQztZQUN6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