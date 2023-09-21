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
define(["require", "exports", "vs/nls!vs/workbench/contrib/notebook/browser/diff/notebookDiffEditor", "vs/base/browser/dom", "vs/base/common/arraysFind", "vs/platform/storage/common/storage", "vs/platform/telemetry/common/telemetry", "vs/platform/theme/common/themeService", "vs/workbench/contrib/notebook/browser/notebookEditorWidget", "vs/base/common/cancellation", "vs/workbench/contrib/notebook/browser/diff/diffElementViewModel", "vs/platform/instantiation/common/instantiation", "vs/workbench/contrib/notebook/browser/diff/notebookDiffList", "vs/platform/contextkey/common/contextkey", "vs/platform/theme/common/colorRegistry", "vs/workbench/contrib/notebook/common/services/notebookWorkerService", "vs/platform/configuration/common/configuration", "vs/editor/common/config/fontInfo", "vs/base/browser/browser", "vs/workbench/contrib/notebook/browser/diff/notebookDiffEditorBrowser", "vs/base/common/event", "vs/base/common/lifecycle", "vs/workbench/browser/parts/editor/editorPane", "vs/workbench/contrib/notebook/common/notebookCommon", "vs/base/common/async", "vs/base/common/uuid", "vs/workbench/contrib/notebook/browser/diff/diffNestedCellViewModel", "vs/workbench/contrib/notebook/browser/view/renderers/backLayerWebView", "vs/workbench/contrib/notebook/browser/diff/eventDispatcher", "vs/editor/browser/config/fontMeasurements", "vs/workbench/contrib/notebook/browser/notebookOptions", "vs/workbench/contrib/notebook/common/notebookExecutionStateService", "vs/workbench/contrib/notebook/common/notebookRange", "vs/workbench/contrib/notebook/browser/diff/notebookDiffOverviewRuler", "vs/platform/layout/browser/zIndexRegistry"], function (require, exports, nls, DOM, arraysFind_1, storage_1, telemetry_1, themeService_1, notebookEditorWidget_1, cancellation_1, diffElementViewModel_1, instantiation_1, notebookDiffList_1, contextkey_1, colorRegistry_1, notebookWorkerService_1, configuration_1, fontInfo_1, browser_1, notebookDiffEditorBrowser_1, event_1, lifecycle_1, editorPane_1, notebookCommon_1, async_1, uuid_1, diffNestedCellViewModel_1, backLayerWebView_1, eventDispatcher_1, fontMeasurements_1, notebookOptions_1, notebookExecutionStateService_1, notebookRange_1, notebookDiffOverviewRuler_1, zIndexRegistry_1) {
    "use strict";
    var $1Eb_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$1Eb = void 0;
    const $ = DOM.$;
    class NotebookDiffEditorSelection {
        constructor(c) {
            this.c = c;
        }
        compare(other) {
            if (!(other instanceof NotebookDiffEditorSelection)) {
                return 3 /* EditorPaneSelectionCompareResult.DIFFERENT */;
            }
            if (this.c.length !== other.c.length) {
                return 3 /* EditorPaneSelectionCompareResult.DIFFERENT */;
            }
            for (let i = 0; i < this.c.length; i++) {
                if (this.c[i] !== other.c[i]) {
                    return 3 /* EditorPaneSelectionCompareResult.DIFFERENT */;
                }
            }
            return 1 /* EditorPaneSelectionCompareResult.IDENTICAL */;
        }
        restore(options) {
            const notebookOptions = {
                cellSelections: (0, notebookRange_1.$OH)(this.c)
            };
            Object.assign(notebookOptions, options);
            return notebookOptions;
        }
    }
    let $1Eb = class $1Eb extends editorPane_1.$0T {
        static { $1Eb_1 = this; }
        static { this.ENTIRE_DIFF_OVERVIEW_WIDTH = 30; }
        static { this.ID = notebookCommon_1.$UH; }
        get textModel() {
            return this.ob?.modified.notebook;
        }
        get notebookOptions() {
            return this.tb;
        }
        get isDisposed() {
            return this.xb;
        }
        constructor(yb, themeService, zb, Ab, Bb, telemetryService, storageService, notebookExecutionStateService) {
            super($1Eb_1.ID, telemetryService, themeService, storageService);
            this.yb = yb;
            this.zb = zb;
            this.Ab = Ab;
            this.Bb = Bb;
            this.creationOptions = (0, notebookEditorWidget_1.$Brb)();
            this.u = null;
            this.eb = [];
            this.gb = null;
            this.hb = null;
            this.ib = null;
            this.kb = this.B(new event_1.$fd());
            this.onMouseUp = this.kb.event;
            this.lb = this.B(new event_1.$fd());
            this.onDidScroll = this.lb.event;
            this.ob = null;
            this.pb = this.B(new lifecycle_1.$jc());
            this.rb = new async_1.$Cg();
            this.sb = this.B(new event_1.$fd());
            this.onDidDynamicOutputRendered = this.sb.event;
            this.ub = this.B(new lifecycle_1.$jc());
            this.wb = this.B(new event_1.$fd());
            this.onDidChangeSelection = this.wb.event;
            this.xb = false;
            this.Mb = new WeakMap();
            this.tb = new notebookOptions_1.$Gbb(this.Bb, notebookExecutionStateService, false);
            this.B(this.tb);
            const editorOptions = this.Bb.getValue('editor');
            this.jb = fontMeasurements_1.$zU.readFontInfo(fontInfo_1.$Rr.createFromRawSettings(editorOptions, browser_1.$WN.value));
            this.qb = true;
        }
        Cb() {
            return this.Bb.getValue(notebookCommon_1.$7H.diffOverviewRuler) ?? false;
        }
        getSelection() {
            const selections = this.fb.getFocus();
            return new NotebookDiffEditorSelection(selections);
        }
        toggleNotebookCellSelection(cell) {
            // throw new Error('Method not implemented.');
        }
        updatePerformanceMetadata(cellId, executionId, duration, rendererId) {
            // throw new Error('Method not implemented.');
        }
        async focusNotebookCell(cell, focus) {
            // throw new Error('Method not implemented.');
        }
        async focusNextNotebookCell(cell, focus) {
            // throw new Error('Method not implemented.');
        }
        didFocusOutputInputChange(inputFocused) {
            // noop
        }
        getScrollTop() {
            return this.fb?.scrollTop ?? 0;
        }
        getScrollHeight() {
            return this.fb?.scrollHeight ?? 0;
        }
        delegateVerticalScrollbarPointerDown(browserEvent) {
            this.fb?.delegateVerticalScrollbarPointerDown(browserEvent);
        }
        updateOutputHeight(cellInfo, output, outputHeight, isInit) {
            const diffElement = cellInfo.diffElement;
            const cell = this.getCellByInfo(cellInfo);
            const outputIndex = cell.outputsViewModels.indexOf(output);
            if (diffElement instanceof diffElementViewModel_1.$IEb) {
                const info = notebookCommon_1.CellUri.parse(cellInfo.cellUri);
                if (!info) {
                    return;
                }
                diffElement.updateOutputHeight(info.notebook.toString() === this.ob?.original.resource.toString() ? notebookDiffEditorBrowser_1.DiffSide.Original : notebookDiffEditorBrowser_1.DiffSide.Modified, outputIndex, outputHeight);
            }
            else {
                diffElement.updateOutputHeight(diffElement.type === 'insert' ? notebookDiffEditorBrowser_1.DiffSide.Modified : notebookDiffEditorBrowser_1.DiffSide.Original, outputIndex, outputHeight);
            }
            if (isInit) {
                this.sb.fire({ cell, output });
            }
        }
        setMarkupCellEditState(cellId, editState) {
            // throw new Error('Method not implemented.');
        }
        didStartDragMarkupCell(cellId, event) {
            // throw new Error('Method not implemented.');
        }
        didDragMarkupCell(cellId, event) {
            // throw new Error('Method not implemented.');
        }
        didEndDragMarkupCell(cellId) {
            // throw new Error('Method not implemented.');
        }
        didDropMarkupCell(cellId) {
            // throw new Error('Method not implemented.');
        }
        didResizeOutput(cellId) {
            // throw new Error('Method not implemented.');
        }
        ab(parent) {
            this.c = DOM.$0O(parent, DOM.$('.notebook-text-diff-editor'));
            this.g = document.createElement('div');
            this.g.classList.add('notebook-overflow-widget-container', 'monaco-editor');
            DOM.$0O(parent, this.g);
            const renderers = [
                this.yb.createInstance(notebookDiffList_1.$VEb, this),
                this.yb.createInstance(notebookDiffList_1.$WEb, this),
            ];
            this.f = DOM.$0O(this.c, DOM.$('.notebook-diff-list-view'));
            this.fb = this.yb.createInstance(notebookDiffList_1.$YEb, 'NotebookTextDiff', this.f, this.yb.createInstance(notebookDiffList_1.$UEb), renderers, this.zb, {
                setRowLineHeight: false,
                setRowHeight: false,
                supportDynamicHeights: true,
                horizontalScrolling: false,
                keyboardSupport: false,
                mouseSupport: true,
                multipleSelectionSupport: false,
                typeNavigationEnabled: true,
                paddingBottom: 0,
                // transformOptimization: (isMacintosh && isNative) || getTitleBarStyle(this.configurationService, this.environmentService) === 'native',
                styleController: (_suffix) => { return this.fb; },
                overrideStyles: {
                    listBackground: colorRegistry_1.$ww,
                    listActiveSelectionBackground: colorRegistry_1.$ww,
                    listActiveSelectionForeground: colorRegistry_1.$uv,
                    listFocusAndSelectionBackground: colorRegistry_1.$ww,
                    listFocusAndSelectionForeground: colorRegistry_1.$uv,
                    listFocusBackground: colorRegistry_1.$ww,
                    listFocusForeground: colorRegistry_1.$uv,
                    listHoverForeground: colorRegistry_1.$uv,
                    listHoverBackground: colorRegistry_1.$ww,
                    listHoverOutline: colorRegistry_1.$zv,
                    listFocusOutline: colorRegistry_1.$zv,
                    listInactiveSelectionBackground: colorRegistry_1.$ww,
                    listInactiveSelectionForeground: colorRegistry_1.$uv,
                    listInactiveFocusBackground: colorRegistry_1.$ww,
                    listInactiveFocusOutline: colorRegistry_1.$ww,
                },
                accessibilityProvider: {
                    getAriaLabel() { return null; },
                    getWidgetAriaLabel() {
                        return nls.localize(0, null);
                    }
                },
                // focusNextPreviousDelegate: {
                // 	onFocusNext: (applyFocusNext: () => void) => this._updateForCursorNavigationMode(applyFocusNext),
                // 	onFocusPrevious: (applyFocusPrevious: () => void) => this._updateForCursorNavigationMode(applyFocusPrevious),
                // }
            });
            this.B(this.fb);
            this.B(this.fb.onMouseUp(e => {
                if (e.element) {
                    this.kb.fire({ event: e.browserEvent, target: e.element });
                }
            }));
            this.B(this.fb.onDidScroll(() => {
                this.lb.fire();
            }));
            this.B(this.fb.onDidChangeFocus(() => this.wb.fire({ reason: 2 /* EditorPaneSelectionChangeReason.USER */ })));
            this.m = document.createElement('div');
            this.m.classList.add('notebook-overview-ruler-container');
            this.c.appendChild(this.m);
            this.Eb();
            // transparent cover
            this.ib = DOM.$0O(this.fb.rowsContainer, $('.webview-cover'));
            this.ib.style.display = 'none';
            this.B(DOM.$pO(this.g, (e) => {
                if (e.target.classList.contains('slider') && this.ib) {
                    this.ib.style.display = 'block';
                }
            }));
            this.B(DOM.$qO(this.g, () => {
                if (this.ib) {
                    // no matter when
                    this.ib.style.display = 'none';
                }
            }));
            this.B(this.fb.onDidScroll(e => {
                this.ib.style.top = `${e.scrollTop}px`;
            }));
        }
        Eb() {
            this.s = this.B(this.yb.createInstance(notebookDiffOverviewRuler_1.$ZEb, this, $1Eb_1.ENTIRE_DIFF_OVERVIEW_WIDTH, this.m));
        }
        Fb(scrollTop, scrollHeight, activeWebview, getActiveNestedCell, diffSide) {
            activeWebview.element.style.height = `${scrollHeight}px`;
            if (activeWebview.insetMapping) {
                const updateItems = [];
                const removedItems = [];
                activeWebview.insetMapping.forEach((value, key) => {
                    const cell = getActiveNestedCell(value.cellInfo.diffElement);
                    if (!cell) {
                        return;
                    }
                    const viewIndex = this.fb.indexOf(value.cellInfo.diffElement);
                    if (viewIndex === undefined) {
                        return;
                    }
                    if (cell.outputsViewModels.indexOf(key) < 0) {
                        // output is already gone
                        removedItems.push(key);
                    }
                    else {
                        const cellTop = this.fb.getCellViewScrollTop(value.cellInfo.diffElement);
                        const outputIndex = cell.outputsViewModels.indexOf(key);
                        const outputOffset = value.cellInfo.diffElement.getOutputOffsetInCell(diffSide, outputIndex);
                        updateItems.push({
                            cell,
                            output: key,
                            cellTop: cellTop,
                            outputOffset: outputOffset,
                            forceDisplay: false
                        });
                    }
                });
                activeWebview.removeInsets(removedItems);
                if (updateItems.length) {
                    activeWebview.updateScrollTops(updateItems, []);
                }
            }
        }
        async setInput(input, options, context, token) {
            await super.setInput(input, options, context, token);
            const model = await input.resolve();
            if (this.ob !== model) {
                this.Gb();
                this.ob = model;
                this.Hb();
            }
            this.ob = model;
            if (this.ob === null) {
                return;
            }
            this.qb = true;
            this.pb.clear();
            this.vb = new cancellation_1.$pd();
            this.pb.add(event_1.Event.any(this.ob.original.notebook.onDidChangeContent, this.ob.modified.notebook.onDidChangeContent)(e => {
                if (this.ob !== null) {
                    this.vb?.dispose();
                    this.vb = new cancellation_1.$pd();
                    this.updateLayout(this.vb.token);
                }
            }));
            await this.Jb((0, uuid_1.$4f)(), this.ob.original.viewType, this.ob.original.resource);
            if (this.hb) {
                this.pb.add(this.hb);
            }
            await this.Ib((0, uuid_1.$4f)(), this.ob.modified.viewType, this.ob.modified.resource);
            if (this.gb) {
                this.pb.add(this.gb);
            }
            await this.updateLayout(this.vb.token, options?.cellSelections ? (0, notebookRange_1.$PH)(options.cellSelections) : undefined);
        }
        Gb() {
            this.ub.clear();
            this.hb?.dispose();
            this.hb?.element.remove();
            this.hb = null;
            this.gb?.dispose();
            this.gb?.element.remove();
            this.gb = null;
            this.pb.clear();
            this.fb.clear();
        }
        Hb() {
            this.mb = new eventDispatcher_1.$FEb();
            const updateInsets = () => {
                DOM.$vO(() => {
                    if (this.xb) {
                        return;
                    }
                    if (this.gb) {
                        this.Fb(this.fb.scrollTop, this.fb.scrollHeight, this.gb, (diffElement) => {
                            return diffElement.modified;
                        }, notebookDiffEditorBrowser_1.DiffSide.Modified);
                    }
                    if (this.hb) {
                        this.Fb(this.fb.scrollTop, this.fb.scrollHeight, this.hb, (diffElement) => {
                            return diffElement.original;
                        }, notebookDiffEditorBrowser_1.DiffSide.Original);
                    }
                });
            };
            this.ub.add(this.fb.onDidChangeContentHeight(() => {
                updateInsets();
            }));
            this.ub.add(this.mb.onDidChangeCellLayout(() => {
                updateInsets();
            }));
        }
        async Ib(id, viewType, resource) {
            this.gb?.dispose();
            this.gb = this.yb.createInstance(backLayerWebView_1.$2ob, this, id, viewType, resource, {
                ...this.tb.computeDiffWebviewOptions(),
                fontFamily: this._generateFontFamily()
            }, undefined);
            // attach the webview container to the DOM tree first
            this.fb.rowsContainer.insertAdjacentElement('afterbegin', this.gb.element);
            this.gb.createWebview();
            this.gb.element.style.width = `calc(50% - 16px)`;
            this.gb.element.style.left = `calc(50%)`;
        }
        _generateFontFamily() {
            return this.jb?.fontFamily ?? `"SF Mono", Monaco, Menlo, Consolas, "Ubuntu Mono", "Liberation Mono", "DejaVu Sans Mono", "Courier New", monospace`;
        }
        async Jb(id, viewType, resource) {
            this.hb?.dispose();
            this.hb = this.yb.createInstance(backLayerWebView_1.$2ob, this, id, viewType, resource, {
                ...this.tb.computeDiffWebviewOptions(),
                fontFamily: this._generateFontFamily()
            }, undefined);
            // attach the webview container to the DOM tree first
            this.fb.rowsContainer.insertAdjacentElement('afterbegin', this.hb.element);
            this.hb.createWebview();
            this.hb.element.style.width = `calc(50% - 16px)`;
            this.hb.element.style.left = `16px`;
        }
        setOptions(options) {
            const selections = options?.cellSelections ? (0, notebookRange_1.$PH)(options.cellSelections) : undefined;
            if (selections) {
                this.fb.setFocus(selections);
            }
        }
        async updateLayout(token, selections) {
            if (!this.ob) {
                return;
            }
            const diffResult = await this.Ab.computeDiff(this.ob.original.resource, this.ob.modified.resource);
            if (token.isCancellationRequested) {
                // after await the editor might be disposed.
                return;
            }
            $1Eb_1.prettyChanges(this.ob, diffResult.cellsDiff);
            const { viewModels, firstChangeIndex } = $1Eb_1.computeDiff(this.yb, this.Bb, this.ob, this.mb, diffResult, this.jb);
            const isSame = this.Kb(viewModels);
            if (!isSame) {
                this.hb?.removeInsets([...this.hb?.insetMapping.keys()]);
                this.gb?.removeInsets([...this.gb?.insetMapping.keys()]);
                this.Lb(viewModels);
            }
            // this._diffElementViewModels = viewModels;
            // this._list.splice(0, this._list.length, this._diffElementViewModels);
            if (this.qb && firstChangeIndex !== -1 && firstChangeIndex < this.fb.length) {
                this.qb = false;
                this.fb.setFocus([firstChangeIndex]);
                this.fb.reveal(firstChangeIndex, 0.3);
            }
            if (selections) {
                this.fb.setFocus(selections);
            }
        }
        Kb(viewModels) {
            let isSame = true;
            if (this.eb.length === viewModels.length) {
                for (let i = 0; i < viewModels.length; i++) {
                    const a = this.eb[i];
                    const b = viewModels[i];
                    if (a.original?.textModel.getHashValue() !== b.original?.textModel.getHashValue()
                        || a.modified?.textModel.getHashValue() !== b.modified?.textModel.getHashValue()) {
                        isSame = false;
                        break;
                    }
                }
            }
            else {
                isSame = false;
            }
            return isSame;
        }
        Lb(viewModels) {
            this.eb = viewModels;
            this.fb.splice(0, this.fb.length, this.eb);
            if (this.Cb()) {
                this.s.updateViewModels(this.eb, this.mb);
            }
        }
        /**
         * making sure that swapping cells are always translated to `insert+delete`.
         */
        static prettyChanges(model, diffResult) {
            const changes = diffResult.changes;
            for (let i = 0; i < diffResult.changes.length - 1; i++) {
                // then we know there is another change after current one
                const curr = changes[i];
                const next = changes[i + 1];
                const x = curr.originalStart;
                const y = curr.modifiedStart;
                if (curr.originalLength === 1
                    && curr.modifiedLength === 0
                    && next.originalStart === x + 2
                    && next.originalLength === 0
                    && next.modifiedStart === y + 1
                    && next.modifiedLength === 1
                    && model.original.notebook.cells[x].getHashValue() === model.modified.notebook.cells[y + 1].getHashValue()
                    && model.original.notebook.cells[x + 1].getHashValue() === model.modified.notebook.cells[y].getHashValue()) {
                    // this is a swap
                    curr.originalStart = x;
                    curr.originalLength = 0;
                    curr.modifiedStart = y;
                    curr.modifiedLength = 1;
                    next.originalStart = x + 1;
                    next.originalLength = 1;
                    next.modifiedStart = y + 2;
                    next.modifiedLength = 0;
                    i++;
                }
            }
        }
        static computeDiff(instantiationService, configurationService, model, eventDispatcher, diffResult, fontInfo) {
            const cellChanges = diffResult.cellsDiff.changes;
            const diffElementViewModels = [];
            const originalModel = model.original.notebook;
            const modifiedModel = model.modified.notebook;
            let originalCellIndex = 0;
            let modifiedCellIndex = 0;
            let firstChangeIndex = -1;
            const initData = {
                metadataStatusHeight: configurationService.getValue('notebook.diff.ignoreMetadata') ? 0 : 25,
                outputStatusHeight: configurationService.getValue('notebook.diff.ignoreOutputs') || !!(modifiedModel.transientOptions.transientOutputs) ? 0 : 25,
                fontInfo
            };
            for (let i = 0; i < cellChanges.length; i++) {
                const change = cellChanges[i];
                // common cells
                for (let j = 0; j < change.originalStart - originalCellIndex; j++) {
                    const originalCell = originalModel.cells[originalCellIndex + j];
                    const modifiedCell = modifiedModel.cells[modifiedCellIndex + j];
                    if (originalCell.getHashValue() === modifiedCell.getHashValue()) {
                        diffElementViewModels.push(new diffElementViewModel_1.$IEb(model.modified.notebook, model.original.notebook, instantiationService.createInstance(diffNestedCellViewModel_1.$CEb, originalCell), instantiationService.createInstance(diffNestedCellViewModel_1.$CEb, modifiedCell), 'unchanged', eventDispatcher, initData));
                    }
                    else {
                        if (firstChangeIndex === -1) {
                            firstChangeIndex = diffElementViewModels.length;
                        }
                        diffElementViewModels.push(new diffElementViewModel_1.$IEb(model.modified.notebook, model.original.notebook, instantiationService.createInstance(diffNestedCellViewModel_1.$CEb, originalCell), instantiationService.createInstance(diffNestedCellViewModel_1.$CEb, modifiedCell), 'modified', eventDispatcher, initData));
                    }
                }
                const modifiedLCS = $1Eb_1.computeModifiedLCS(instantiationService, change, originalModel, modifiedModel, eventDispatcher, initData);
                if (modifiedLCS.length && firstChangeIndex === -1) {
                    firstChangeIndex = diffElementViewModels.length;
                }
                diffElementViewModels.push(...modifiedLCS);
                originalCellIndex = change.originalStart + change.originalLength;
                modifiedCellIndex = change.modifiedStart + change.modifiedLength;
            }
            for (let i = originalCellIndex; i < originalModel.cells.length; i++) {
                diffElementViewModels.push(new diffElementViewModel_1.$IEb(model.modified.notebook, model.original.notebook, instantiationService.createInstance(diffNestedCellViewModel_1.$CEb, originalModel.cells[i]), instantiationService.createInstance(diffNestedCellViewModel_1.$CEb, modifiedModel.cells[i - originalCellIndex + modifiedCellIndex]), 'unchanged', eventDispatcher, initData));
            }
            return {
                viewModels: diffElementViewModels,
                firstChangeIndex
            };
        }
        static computeModifiedLCS(instantiationService, change, originalModel, modifiedModel, eventDispatcher, initData) {
            const result = [];
            // modified cells
            const modifiedLen = Math.min(change.originalLength, change.modifiedLength);
            for (let j = 0; j < modifiedLen; j++) {
                const isTheSame = originalModel.cells[change.originalStart + j].equal(modifiedModel.cells[change.modifiedStart + j]);
                result.push(new diffElementViewModel_1.$IEb(modifiedModel, originalModel, instantiationService.createInstance(diffNestedCellViewModel_1.$CEb, originalModel.cells[change.originalStart + j]), instantiationService.createInstance(diffNestedCellViewModel_1.$CEb, modifiedModel.cells[change.modifiedStart + j]), isTheSame ? 'unchanged' : 'modified', eventDispatcher, initData));
            }
            for (let j = modifiedLen; j < change.originalLength; j++) {
                // deletion
                result.push(new diffElementViewModel_1.$JEb(originalModel, modifiedModel, instantiationService.createInstance(diffNestedCellViewModel_1.$CEb, originalModel.cells[change.originalStart + j]), undefined, 'delete', eventDispatcher, initData));
            }
            for (let j = modifiedLen; j < change.modifiedLength; j++) {
                // insertion
                result.push(new diffElementViewModel_1.$JEb(modifiedModel, originalModel, undefined, instantiationService.createInstance(diffNestedCellViewModel_1.$CEb, modifiedModel.cells[change.modifiedStart + j]), 'insert', eventDispatcher, initData));
            }
            return result;
        }
        scheduleOutputHeightAck(cellInfo, outputId, height) {
            const diffElement = cellInfo.diffElement;
            // const activeWebview = diffSide === DiffSide.Modified ? this._modifiedWebview : this._originalWebview;
            let diffSide = notebookDiffEditorBrowser_1.DiffSide.Original;
            if (diffElement instanceof diffElementViewModel_1.$IEb) {
                const info = notebookCommon_1.CellUri.parse(cellInfo.cellUri);
                if (!info) {
                    return;
                }
                diffSide = info.notebook.toString() === this.ob?.original.resource.toString() ? notebookDiffEditorBrowser_1.DiffSide.Original : notebookDiffEditorBrowser_1.DiffSide.Modified;
            }
            else {
                diffSide = diffElement.type === 'insert' ? notebookDiffEditorBrowser_1.DiffSide.Modified : notebookDiffEditorBrowser_1.DiffSide.Original;
            }
            const webview = diffSide === notebookDiffEditorBrowser_1.DiffSide.Modified ? this.gb : this.hb;
            DOM.$vO(() => {
                webview?.ackHeight([{ cellId: cellInfo.cellId, outputId, height }]);
            }, 10);
        }
        layoutNotebookCell(cell, height) {
            const relayout = (cell, height) => {
                this.fb.updateElementHeight2(cell, height);
            };
            if (this.Mb.has(cell)) {
                this.Mb.get(cell).dispose();
            }
            let r;
            const layoutDisposable = DOM.$vO(() => {
                this.Mb.delete(cell);
                relayout(cell, height);
                r();
            });
            this.Mb.set(cell, (0, lifecycle_1.$ic)(() => {
                layoutDisposable.dispose();
                r();
            }));
            return new Promise(resolve => { r = resolve; });
        }
        setScrollTop(scrollTop) {
            this.fb.scrollTop = scrollTop;
        }
        triggerScroll(event) {
            this.fb.triggerScrollFromMouseWheelEvent(event);
        }
        previousChange() {
            let currFocus = this.fb.getFocus()[0];
            if (isNaN(currFocus) || currFocus < 0) {
                currFocus = 0;
            }
            // find the index of previous change
            let prevChangeIndex = currFocus - 1;
            while (prevChangeIndex >= 0) {
                const vm = this.eb[prevChangeIndex];
                if (vm.type !== 'unchanged') {
                    break;
                }
                prevChangeIndex--;
            }
            if (prevChangeIndex >= 0) {
                this.fb.setFocus([prevChangeIndex]);
                this.fb.reveal(prevChangeIndex);
            }
            else {
                // go to the last one
                const index = (0, arraysFind_1.$eb)(this.eb, vm => vm.type !== 'unchanged');
                if (index >= 0) {
                    this.fb.setFocus([index]);
                    this.fb.reveal(index);
                }
            }
        }
        nextChange() {
            let currFocus = this.fb.getFocus()[0];
            if (isNaN(currFocus) || currFocus < 0) {
                currFocus = 0;
            }
            // find the index of next change
            let nextChangeIndex = currFocus + 1;
            while (nextChangeIndex < this.eb.length) {
                const vm = this.eb[nextChangeIndex];
                if (vm.type !== 'unchanged') {
                    break;
                }
                nextChangeIndex++;
            }
            if (nextChangeIndex < this.eb.length) {
                this.fb.setFocus([nextChangeIndex]);
                this.fb.reveal(nextChangeIndex);
            }
            else {
                // go to the first one
                const index = this.eb.findIndex(vm => vm.type !== 'unchanged');
                if (index >= 0) {
                    this.fb.setFocus([index]);
                    this.fb.reveal(index);
                }
            }
        }
        createOutput(cellDiffViewModel, cellViewModel, output, getOffset, diffSide) {
            this.rb.queue(output.source.model.outputId + (diffSide === notebookDiffEditorBrowser_1.DiffSide.Modified ? '-right' : 'left'), async () => {
                const activeWebview = diffSide === notebookDiffEditorBrowser_1.DiffSide.Modified ? this.gb : this.hb;
                if (!activeWebview) {
                    return;
                }
                if (!activeWebview.insetMapping.has(output.source)) {
                    const cellTop = this.fb.getCellViewScrollTop(cellDiffViewModel);
                    await activeWebview.createOutput({ diffElement: cellDiffViewModel, cellHandle: cellViewModel.handle, cellId: cellViewModel.id, cellUri: cellViewModel.uri }, output, cellTop, getOffset());
                }
                else {
                    const cellTop = this.fb.getCellViewScrollTop(cellDiffViewModel);
                    const outputIndex = cellViewModel.outputsViewModels.indexOf(output.source);
                    const outputOffset = cellDiffViewModel.getOutputOffsetInCell(diffSide, outputIndex);
                    activeWebview.updateScrollTops([{
                            cell: cellViewModel,
                            output: output.source,
                            cellTop,
                            outputOffset,
                            forceDisplay: true
                        }], []);
                }
            });
        }
        updateMarkupCellHeight() {
            // TODO
        }
        getCellByInfo(cellInfo) {
            return cellInfo.diffElement.getCellByUri(cellInfo.cellUri);
        }
        getCellById(cellId) {
            throw new Error('Not implemented');
        }
        removeInset(cellDiffViewModel, cellViewModel, displayOutput, diffSide) {
            this.rb.queue(displayOutput.model.outputId + (diffSide === notebookDiffEditorBrowser_1.DiffSide.Modified ? '-right' : 'left'), async () => {
                const activeWebview = diffSide === notebookDiffEditorBrowser_1.DiffSide.Modified ? this.gb : this.hb;
                if (!activeWebview) {
                    return;
                }
                if (!activeWebview.insetMapping.has(displayOutput)) {
                    return;
                }
                activeWebview.removeInsets([displayOutput]);
            });
        }
        showInset(cellDiffViewModel, cellViewModel, displayOutput, diffSide) {
            this.rb.queue(displayOutput.model.outputId + (diffSide === notebookDiffEditorBrowser_1.DiffSide.Modified ? '-right' : 'left'), async () => {
                const activeWebview = diffSide === notebookDiffEditorBrowser_1.DiffSide.Modified ? this.gb : this.hb;
                if (!activeWebview) {
                    return;
                }
                if (!activeWebview.insetMapping.has(displayOutput)) {
                    return;
                }
                const cellTop = this.fb.getCellViewScrollTop(cellDiffViewModel);
                const outputIndex = cellViewModel.outputsViewModels.indexOf(displayOutput);
                const outputOffset = cellDiffViewModel.getOutputOffsetInCell(diffSide, outputIndex);
                activeWebview.updateScrollTops([{
                        cell: cellViewModel,
                        output: displayOutput,
                        cellTop,
                        outputOffset,
                        forceDisplay: true,
                    }], []);
            });
        }
        hideInset(cellDiffViewModel, cellViewModel, output) {
            this.gb?.hideInset(output);
            this.hb?.hideInset(output);
        }
        // private async _resolveWebview(rightEditor: boolean): Promise<BackLayerWebView | null> {
        // 	if (rightEditor) {
        // 	}
        // }
        getDomNode() {
            return this.c;
        }
        getOverflowContainerDomNode() {
            return this.g;
        }
        getControl() {
            return this;
        }
        bb(visible, group) {
            super.bb(visible, group);
        }
        focus() {
            super.focus();
        }
        clearInput() {
            super.clearInput();
            this.pb.clear();
            this.fb?.splice(0, this.fb?.length || 0);
            this.ob = null;
            this.eb.forEach(vm => vm.dispose());
            this.eb = [];
        }
        deltaCellOutputContainerClassNames(diffSide, cellId, added, removed) {
            if (diffSide === notebookDiffEditorBrowser_1.DiffSide.Original) {
                this.hb?.deltaCellContainerClassNames(cellId, added, removed);
            }
            else {
                this.gb?.deltaCellContainerClassNames(cellId, added, removed);
            }
        }
        getLayoutInfo() {
            if (!this.fb) {
                throw new Error('Editor is not initalized successfully');
            }
            return {
                width: this.u.width,
                height: this.u.height,
                fontInfo: this.jb,
                scrollHeight: this.fb?.getScrollHeight() ?? 0,
                stickyHeight: 0,
            };
        }
        getCellOutputLayoutInfo(nestedCell) {
            if (!this.ob) {
                throw new Error('Editor is not attached to model yet');
            }
            const documentModel = notebookCommon_1.CellUri.parse(nestedCell.uri);
            if (!documentModel) {
                throw new Error('Nested cell in the diff editor has wrong Uri');
            }
            const belongToOriginalDocument = this.ob.original.notebook.uri.toString() === documentModel.notebook.toString();
            const viewModel = this.eb.find(element => {
                const textModel = belongToOriginalDocument ? element.original : element.modified;
                if (!textModel) {
                    return false;
                }
                if (textModel.uri.toString() === nestedCell.uri.toString()) {
                    return true;
                }
                return false;
            });
            if (!viewModel) {
                throw new Error('Nested cell in the diff editor does not match any diff element');
            }
            if (viewModel.type === 'unchanged') {
                return this.getLayoutInfo();
            }
            if (viewModel.type === 'insert' || viewModel.type === 'delete') {
                return {
                    width: this.u.width / 2,
                    height: this.u.height / 2,
                    fontInfo: this.jb
                };
            }
            if (viewModel.checkIfOutputsModified()) {
                return {
                    width: this.u.width / 2,
                    height: this.u.height / 2,
                    fontInfo: this.jb
                };
            }
            else {
                return this.getLayoutInfo();
            }
        }
        layout(dimension, _position) {
            this.c.classList.toggle('mid-width', dimension.width < 1000 && dimension.width >= 600);
            this.c.classList.toggle('narrow-width', dimension.width < 600);
            const overviewRulerEnabled = this.Cb();
            this.u = dimension.with(dimension.width - (overviewRulerEnabled ? $1Eb_1.ENTIRE_DIFF_OVERVIEW_WIDTH : 0));
            this.f.style.height = `${dimension.height}px`;
            this.f.style.width = `${this.u.width}px`;
            this.fb?.layout(this.u.height, this.u.width);
            if (this.gb) {
                this.gb.element.style.width = `calc(50% - 16px)`;
                this.gb.element.style.left = `calc(50%)`;
            }
            if (this.hb) {
                this.hb.element.style.width = `calc(50% - 16px)`;
                this.hb.element.style.left = `16px`;
            }
            if (this.ib) {
                this.ib.style.height = `${this.u.height}px`;
                this.ib.style.width = `${this.u.width}px`;
            }
            if (overviewRulerEnabled) {
                this.s.layout();
            }
            this.mb?.emit([new eventDispatcher_1.$DEb({ width: true, fontInfo: true }, this.getLayoutInfo())]);
        }
        dispose() {
            this.xb = true;
            this.vb?.dispose();
            this.Gb();
            super.dispose();
        }
    };
    exports.$1Eb = $1Eb;
    exports.$1Eb = $1Eb = $1Eb_1 = __decorate([
        __param(0, instantiation_1.$Ah),
        __param(1, themeService_1.$gv),
        __param(2, contextkey_1.$3i),
        __param(3, notebookWorkerService_1.$kEb),
        __param(4, configuration_1.$8h),
        __param(5, telemetry_1.$9k),
        __param(6, storage_1.$Vo),
        __param(7, notebookExecutionStateService_1.$_H)
    ], $1Eb);
    (0, zIndexRegistry_1.$Smb)(zIndexRegistry_1.ZIndex.Base, 10, 'notebook-diff-view-viewport-slider');
    (0, themeService_1.$mv)((theme, collector) => {
        const diffDiagonalFillColor = theme.getColor(colorRegistry_1.$qx);
        collector.addRule(`
	.notebook-text-diff-editor .diagonal-fill {
		background-image: linear-gradient(
			-45deg,
			${diffDiagonalFillColor} 12.5%,
			#0000 12.5%, #0000 50%,
			${diffDiagonalFillColor} 50%, ${diffDiagonalFillColor} 62.5%,
			#0000 62.5%, #0000 100%
		);
		background-size: 8px 8px;
	}
	`);
        collector.addRule(`.notebook-text-diff-editor .cell-body { margin: ${notebookDiffEditorBrowser_1.$yEb}px; }`);
    });
});
//# sourceMappingURL=notebookDiffEditor.js.map