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
define(["require", "exports", "vs/base/common/event", "vs/base/common/uuid", "vs/platform/configuration/common/configuration", "vs/workbench/contrib/notebook/browser/notebookBrowser", "vs/workbench/contrib/notebook/browser/viewModel/baseCellViewModel", "vs/workbench/contrib/notebook/common/notebookCommon", "vs/editor/common/services/resolverService", "vs/platform/undoRedo/common/undoRedo", "vs/editor/browser/services/codeEditorService", "vs/workbench/contrib/notebook/browser/notebookViewEvents"], function (require, exports, event_1, UUID, configuration_1, notebookBrowser_1, baseCellViewModel_1, notebookCommon_1, resolverService_1, undoRedo_1, codeEditorService_1, notebookViewEvents_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MarkupCellViewModel = void 0;
    let MarkupCellViewModel = class MarkupCellViewModel extends baseCellViewModel_1.BaseCellViewModel {
        get renderedHtml() { return this._renderedHtml; }
        set renderedHtml(value) {
            if (this._renderedHtml !== value) {
                this._renderedHtml = value;
                this._onDidChangeState.fire({ contentChanged: true });
            }
        }
        get layoutInfo() {
            return this._layoutInfo;
        }
        set renderedMarkdownHeight(newHeight) {
            this._previewHeight = newHeight;
            this._updateTotalHeight(this._computeTotalHeight());
        }
        set editorHeight(newHeight) {
            this._editorHeight = newHeight;
            this._statusBarHeight = this.viewContext.notebookOptions.computeStatusBarHeight();
            this._updateTotalHeight(this._computeTotalHeight());
        }
        get editorHeight() {
            throw new Error('MarkdownCellViewModel.editorHeight is write only');
        }
        get foldingState() {
            return this.foldingDelegate.getFoldingState(this.foldingDelegate.getCellIndex(this));
        }
        get outputIsHovered() {
            return this._hoveringOutput;
        }
        set outputIsHovered(v) {
            this._hoveringOutput = v;
        }
        get outputIsFocused() {
            return this._focusOnOutput;
        }
        set outputIsFocused(v) {
            this._focusOnOutput = v;
        }
        get cellIsHovered() {
            return this._hoveringCell;
        }
        set cellIsHovered(v) {
            this._hoveringCell = v;
            this._onDidChangeState.fire({ cellIsHoveredChanged: true });
        }
        constructor(viewType, model, initialNotebookLayoutInfo, foldingDelegate, viewContext, configurationService, textModelService, undoRedoService, codeEditorService) {
            super(viewType, model, UUID.generateUuid(), viewContext, configurationService, textModelService, undoRedoService, codeEditorService);
            this.foldingDelegate = foldingDelegate;
            this.viewContext = viewContext;
            this.cellKind = notebookCommon_1.CellKind.Markup;
            this._previewHeight = 0;
            this._editorHeight = 0;
            this._statusBarHeight = 0;
            this._onDidChangeLayout = this._register(new event_1.Emitter());
            this.onDidChangeLayout = this._onDidChangeLayout.event;
            this._hoveringOutput = false;
            this._focusOnOutput = false;
            this._hoveringCell = false;
            /**
             * we put outputs stuff here to make compiler happy
             */
            this.outputsViewModels = [];
            this._hasFindResult = this._register(new event_1.Emitter());
            this.hasFindResult = this._hasFindResult.event;
            const { bottomToolbarGap } = this.viewContext.notebookOptions.computeBottomToolbarDimensions(this.viewType);
            this._layoutInfo = {
                editorHeight: 0,
                previewHeight: 0,
                fontInfo: initialNotebookLayoutInfo?.fontInfo || null,
                editorWidth: initialNotebookLayoutInfo?.width
                    ? this.viewContext.notebookOptions.computeMarkdownCellEditorWidth(initialNotebookLayoutInfo.width)
                    : 0,
                bottomToolbarOffset: bottomToolbarGap,
                totalHeight: 100,
                layoutState: notebookBrowser_1.CellLayoutState.Uninitialized,
                foldHintHeight: 0,
                statusBarHeight: 0
            };
            this._register(this.onDidChangeState(e => {
                this.viewContext.eventDispatcher.emit([new notebookViewEvents_1.NotebookCellStateChangedEvent(e, this.model)]);
                if (e.foldingStateChanged) {
                    this._updateTotalHeight(this._computeTotalHeight(), notebookBrowser_1.CellLayoutContext.Fold);
                }
            }));
        }
        _computeTotalHeight() {
            const layoutConfiguration = this.viewContext.notebookOptions.getLayoutConfiguration();
            const { bottomToolbarGap } = this.viewContext.notebookOptions.computeBottomToolbarDimensions(this.viewType);
            const foldHintHeight = this._computeFoldHintHeight();
            if (this.getEditState() === notebookBrowser_1.CellEditState.Editing) {
                return this._editorHeight
                    + layoutConfiguration.markdownCellTopMargin
                    + layoutConfiguration.markdownCellBottomMargin
                    + bottomToolbarGap
                    + this._statusBarHeight;
            }
            else {
                // @rebornix
                // On file open, the previewHeight + bottomToolbarGap for a cell out of viewport can be 0
                // When it's 0, the list view will never try to render it anymore even if we scroll the cell into view.
                // Thus we make sure it's greater than 0
                return Math.max(1, this._previewHeight + bottomToolbarGap + foldHintHeight);
            }
        }
        _computeFoldHintHeight() {
            return (this.getEditState() === notebookBrowser_1.CellEditState.Editing || this.foldingState !== 2 /* CellFoldingState.Collapsed */) ?
                0 : this.viewContext.notebookOptions.getLayoutConfiguration().markdownFoldHintHeight;
        }
        updateOptions(e) {
            if (e.cellStatusBarVisibility || e.insertToolbarPosition || e.cellToolbarLocation) {
                this._updateTotalHeight(this._computeTotalHeight());
            }
        }
        getOutputOffset(index) {
            // throw new Error('Method not implemented.');
            return -1;
        }
        updateOutputHeight(index, height) {
            // throw new Error('Method not implemented.');
        }
        triggerFoldingStateChange() {
            this._onDidChangeState.fire({ foldingStateChanged: true });
        }
        _updateTotalHeight(newHeight, context) {
            if (newHeight !== this.layoutInfo.totalHeight) {
                this.layoutChange({ totalHeight: newHeight, context });
            }
        }
        layoutChange(state) {
            // recompute
            const foldHintHeight = this._computeFoldHintHeight();
            if (!this.isInputCollapsed) {
                const editorWidth = state.outerWidth !== undefined
                    ? this.viewContext.notebookOptions.computeMarkdownCellEditorWidth(state.outerWidth)
                    : this._layoutInfo.editorWidth;
                const totalHeight = state.totalHeight === undefined
                    ? (this._layoutInfo.layoutState === notebookBrowser_1.CellLayoutState.Uninitialized ? 100 : this._layoutInfo.totalHeight)
                    : state.totalHeight;
                const previewHeight = this._previewHeight;
                this._layoutInfo = {
                    fontInfo: state.font || this._layoutInfo.fontInfo,
                    editorWidth,
                    previewHeight,
                    editorHeight: this._editorHeight,
                    statusBarHeight: this._statusBarHeight,
                    bottomToolbarOffset: this.viewContext.notebookOptions.computeBottomToolbarOffset(totalHeight, this.viewType),
                    totalHeight,
                    layoutState: notebookBrowser_1.CellLayoutState.Measured,
                    foldHintHeight
                };
            }
            else {
                const editorWidth = state.outerWidth !== undefined
                    ? this.viewContext.notebookOptions.computeMarkdownCellEditorWidth(state.outerWidth)
                    : this._layoutInfo.editorWidth;
                const totalHeight = this.viewContext.notebookOptions.computeCollapsedMarkdownCellHeight(this.viewType);
                state.totalHeight = totalHeight;
                this._layoutInfo = {
                    fontInfo: state.font || this._layoutInfo.fontInfo,
                    editorWidth,
                    editorHeight: this._editorHeight,
                    statusBarHeight: this._statusBarHeight,
                    previewHeight: this._previewHeight,
                    bottomToolbarOffset: this.viewContext.notebookOptions.computeBottomToolbarOffset(totalHeight, this.viewType),
                    totalHeight,
                    layoutState: notebookBrowser_1.CellLayoutState.Measured,
                    foldHintHeight: 0
                };
            }
            this._onDidChangeLayout.fire(state);
        }
        restoreEditorViewState(editorViewStates, totalHeight) {
            super.restoreEditorViewState(editorViewStates);
            // we might already warmup the viewport so the cell has a total height computed
            if (totalHeight !== undefined && this.layoutInfo.layoutState === notebookBrowser_1.CellLayoutState.Uninitialized) {
                this._layoutInfo = {
                    fontInfo: this._layoutInfo.fontInfo,
                    editorWidth: this._layoutInfo.editorWidth,
                    previewHeight: this._layoutInfo.previewHeight,
                    bottomToolbarOffset: this._layoutInfo.bottomToolbarOffset,
                    totalHeight: totalHeight,
                    editorHeight: this._editorHeight,
                    statusBarHeight: this._statusBarHeight,
                    layoutState: notebookBrowser_1.CellLayoutState.FromCache,
                    foldHintHeight: this._layoutInfo.foldHintHeight
                };
                this.layoutChange({});
            }
        }
        getDynamicHeight() {
            return null;
        }
        getHeight(lineHeight) {
            if (this._layoutInfo.layoutState === notebookBrowser_1.CellLayoutState.Uninitialized) {
                return 100;
            }
            else {
                return this._layoutInfo.totalHeight;
            }
        }
        onDidChangeTextModelContent() {
            this._onDidChangeState.fire({ contentChanged: true });
        }
        onDeselect() {
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
            this.foldingDelegate = null;
        }
    };
    exports.MarkupCellViewModel = MarkupCellViewModel;
    exports.MarkupCellViewModel = MarkupCellViewModel = __decorate([
        __param(5, configuration_1.IConfigurationService),
        __param(6, resolverService_1.ITextModelService),
        __param(7, undoRedo_1.IUndoRedoService),
        __param(8, codeEditorService_1.ICodeEditorService)
    ], MarkupCellViewModel);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFya3VwQ2VsbFZpZXdNb2RlbC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL25vdGVib29rL2Jyb3dzZXIvdmlld01vZGVsL21hcmt1cENlbGxWaWV3TW9kZWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBaUJ6RixJQUFNLG1CQUFtQixHQUF6QixNQUFNLG1CQUFvQixTQUFRLHFDQUFpQjtRQVF6RCxJQUFXLFlBQVksS0FBeUIsT0FBTyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQztRQUM1RSxJQUFXLFlBQVksQ0FBQyxLQUF5QjtZQUNoRCxJQUFJLElBQUksQ0FBQyxhQUFhLEtBQUssS0FBSyxFQUFFO2dCQUNqQyxJQUFJLENBQUMsYUFBYSxHQUFHLEtBQUssQ0FBQztnQkFDM0IsSUFBSSxDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQyxFQUFFLGNBQWMsRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDO2FBQ3REO1FBQ0YsQ0FBQztRQUVELElBQUksVUFBVTtZQUNiLE9BQU8sSUFBSSxDQUFDLFdBQVcsQ0FBQztRQUN6QixDQUFDO1FBSUQsSUFBSSxzQkFBc0IsQ0FBQyxTQUFpQjtZQUMzQyxJQUFJLENBQUMsY0FBYyxHQUFHLFNBQVMsQ0FBQztZQUNoQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLG1CQUFtQixFQUFFLENBQUMsQ0FBQztRQUNyRCxDQUFDO1FBSUQsSUFBSSxZQUFZLENBQUMsU0FBaUI7WUFDakMsSUFBSSxDQUFDLGFBQWEsR0FBRyxTQUFTLENBQUM7WUFDL0IsSUFBSSxDQUFDLGdCQUFnQixHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsZUFBZSxDQUFDLHNCQUFzQixFQUFFLENBQUM7WUFDbEYsSUFBSSxDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxtQkFBbUIs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