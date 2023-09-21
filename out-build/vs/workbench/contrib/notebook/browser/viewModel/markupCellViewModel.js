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
    exports.$Snb = void 0;
    let $Snb = class $Snb extends baseCellViewModel_1.$Pnb {
        get renderedHtml() { return this.$; }
        set renderedHtml(value) {
            if (this.$ !== value) {
                this.$ = value;
                this.b.fire({ contentChanged: true });
            }
        }
        get layoutInfo() {
            return this.Z;
        }
        set renderedMarkdownHeight(newHeight) {
            this.ab = newHeight;
            this.jb(this.hb());
        }
        set editorHeight(newHeight) {
            this.bb = newHeight;
            this.cb = this.viewContext.notebookOptions.computeStatusBarHeight();
            this.jb(this.hb());
        }
        get editorHeight() {
            throw new Error('MarkdownCellViewModel.editorHeight is write only');
        }
        get foldingState() {
            return this.foldingDelegate.getFoldingState(this.foldingDelegate.getCellIndex(this));
        }
        get outputIsHovered() {
            return this.eb;
        }
        set outputIsHovered(v) {
            this.eb = v;
        }
        get outputIsFocused() {
            return this.fb;
        }
        set outputIsFocused(v) {
            this.fb = v;
        }
        get cellIsHovered() {
            return this.gb;
        }
        set cellIsHovered(v) {
            this.gb = v;
            this.b.fire({ cellIsHoveredChanged: true });
        }
        constructor(viewType, model, initialNotebookLayoutInfo, foldingDelegate, viewContext, configurationService, textModelService, undoRedoService, codeEditorService) {
            super(viewType, model, UUID.$4f(), viewContext, configurationService, textModelService, undoRedoService, codeEditorService);
            this.foldingDelegate = foldingDelegate;
            this.viewContext = viewContext;
            this.cellKind = notebookCommon_1.CellKind.Markup;
            this.ab = 0;
            this.bb = 0;
            this.cb = 0;
            this.db = this.B(new event_1.$fd());
            this.onDidChangeLayout = this.db.event;
            this.eb = false;
            this.fb = false;
            this.gb = false;
            /**
             * we put outputs stuff here to make compiler happy
             */
            this.outputsViewModels = [];
            this.lb = this.B(new event_1.$fd());
            this.hasFindResult = this.lb.event;
            const { bottomToolbarGap } = this.viewContext.notebookOptions.computeBottomToolbarDimensions(this.viewType);
            this.Z = {
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
            this.B(this.onDidChangeState(e => {
                this.viewContext.eventDispatcher.emit([new notebookViewEvents_1.$obb(e, this.model)]);
                if (e.foldingStateChanged) {
                    this.jb(this.hb(), notebookBrowser_1.CellLayoutContext.Fold);
                }
            }));
        }
        hb() {
            const layoutConfiguration = this.viewContext.notebookOptions.getLayoutConfiguration();
            const { bottomToolbarGap } = this.viewContext.notebookOptions.computeBottomToolbarDimensions(this.viewType);
            const foldHintHeight = this.ib();
            if (this.getEditState() === notebookBrowser_1.CellEditState.Editing) {
                return this.bb
                    + layoutConfiguration.markdownCellTopMargin
                    + layoutConfiguration.markdownCellBottomMargin
                    + bottomToolbarGap
                    + this.cb;
            }
            else {
                // @rebornix
                // On file open, the previewHeight + bottomToolbarGap for a cell out of viewport can be 0
                // When it's 0, the list view will never try to render it anymore even if we scroll the cell into view.
                // Thus we make sure it's greater than 0
                return Math.max(1, this.ab + bottomToolbarGap + foldHintHeight);
            }
        }
        ib() {
            return (this.getEditState() === notebookBrowser_1.CellEditState.Editing || this.foldingState !== 2 /* CellFoldingState.Collapsed */) ?
                0 : this.viewContext.notebookOptions.getLayoutConfiguration().markdownFoldHintHeight;
        }
        updateOptions(e) {
            if (e.cellStatusBarVisibility || e.insertToolbarPosition || e.cellToolbarLocation) {
                this.jb(this.hb());
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
            this.b.fire({ foldingStateChanged: true });
        }
        jb(newHeight, context) {
            if (newHeight !== this.layoutInfo.totalHeight) {
                this.layoutChange({ totalHeight: newHeight, context });
            }
        }
        layoutChange(state) {
            // recompute
            const foldHintHeight = this.ib();
            if (!this.isInputCollapsed) {
                const editorWidth = state.outerWidth !== undefined
                    ? this.viewContext.notebookOptions.computeMarkdownCellEditorWidth(state.outerWidth)
                    : this.Z.editorWidth;
                const totalHeight = state.totalHeight === undefined
                    ? (this.Z.layoutState === notebookBrowser_1.CellLayoutState.Uninitialized ? 100 : this.Z.totalHeight)
                    : state.totalHeight;
                const previewHeight = this.ab;
                this.Z = {
                    fontInfo: state.font || this.Z.fontInfo,
                    editorWidth,
                    previewHeight,
                    editorHeight: this.bb,
                    statusBarHeight: this.cb,
                    bottomToolbarOffset: this.viewContext.notebookOptions.computeBottomToolbarOffset(totalHeight, this.viewType),
                    totalHeight,
                    layoutState: notebookBrowser_1.CellLayoutState.Measured,
                    foldHintHeight
                };
            }
            else {
                const editorWidth = state.outerWidth !== undefined
                    ? this.viewContext.notebookOptions.computeMarkdownCellEditorWidth(state.outerWidth)
                    : this.Z.editorWidth;
                const totalHeight = this.viewContext.notebookOptions.computeCollapsedMarkdownCellHeight(this.viewType);
                state.totalHeight = totalHeight;
                this.Z = {
                    fontInfo: state.font || this.Z.fontInfo,
                    editorWidth,
                    editorHeight: this.bb,
                    statusBarHeight: this.cb,
                    previewHeight: this.ab,
                    bottomToolbarOffset: this.viewContext.notebookOptions.computeBottomToolbarOffset(totalHeight, this.viewType),
                    totalHeight,
                    layoutState: notebookBrowser_1.CellLayoutState.Measured,
                    foldHintHeight: 0
                };
            }
            this.db.fire(state);
        }
        restoreEditorViewState(editorViewStates, totalHeight) {
            super.restoreEditorViewState(editorViewStates);
            // we might already warmup the viewport so the cell has a total height computed
            if (totalHeight !== undefined && this.layoutInfo.layoutState === notebookBrowser_1.CellLayoutState.Uninitialized) {
                this.Z = {
                    fontInfo: this.Z.fontInfo,
                    editorWidth: this.Z.editorWidth,
                    previewHeight: this.Z.previewHeight,
                    bottomToolbarOffset: this.Z.bottomToolbarOffset,
                    totalHeight: totalHeight,
                    editorHeight: this.bb,
                    statusBarHeight: this.cb,
                    layoutState: notebookBrowser_1.CellLayoutState.FromCache,
                    foldHintHeight: this.Z.foldHintHeight
                };
                this.layoutChange({});
            }
        }
        getDynamicHeight() {
            return null;
        }
        getHeight(lineHeight) {
            if (this.Z.layoutState === notebookBrowser_1.CellLayoutState.Uninitialized) {
                return 100;
            }
            else {
                return this.Z.totalHeight;
            }
        }
        X() {
            this.b.fire({ contentChanged: true });
        }
        onDeselect() {
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
            this.foldingDelegate = null;
        }
    };
    exports.$Snb = $Snb;
    exports.$Snb = $Snb = __decorate([
        __param(5, configuration_1.$8h),
        __param(6, resolverService_1.$uA),
        __param(7, undoRedo_1.$wu),
        __param(8, codeEditorService_1.$nV)
    ], $Snb);
});
//# sourceMappingURL=markupCellViewModel.js.map