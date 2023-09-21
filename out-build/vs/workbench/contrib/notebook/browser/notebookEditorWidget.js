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
define(["require", "exports", "vs/base/browser/browser", "vs/base/browser/dom", "vs/base/common/async", "vs/base/common/color", "vs/base/common/errors", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/platform", "vs/base/common/resources", "vs/base/common/uuid", "vs/editor/browser/config/fontMeasurements", "vs/editor/common/config/fontInfo", "vs/editor/common/core/range", "vs/editor/contrib/suggest/browser/suggestController", "vs/nls!vs/workbench/contrib/notebook/browser/notebookEditorWidget", "vs/platform/actions/common/actions", "vs/platform/configuration/common/configuration", "vs/platform/contextkey/common/contextkey", "vs/platform/contextview/browser/contextView", "vs/platform/instantiation/common/instantiation", "vs/platform/instantiation/common/serviceCollection", "vs/platform/layout/browser/layoutService", "vs/platform/layout/browser/zIndexRegistry", "vs/platform/progress/common/progress", "vs/platform/telemetry/common/telemetry", "vs/platform/theme/common/colorRegistry", "vs/workbench/common/theme", "vs/workbench/contrib/debug/browser/debugColors", "vs/workbench/contrib/notebook/browser/notebookBrowser", "vs/workbench/contrib/notebook/browser/notebookEditorExtensions", "vs/workbench/contrib/notebook/browser/services/notebookEditorService", "vs/workbench/contrib/notebook/browser/notebookLogger", "vs/workbench/contrib/notebook/browser/notebookViewEvents", "vs/workbench/contrib/notebook/browser/view/cellParts/cellContextKeys", "vs/workbench/contrib/notebook/browser/view/cellParts/cellDnd", "vs/workbench/contrib/notebook/browser/view/notebookCellList", "vs/workbench/contrib/notebook/browser/view/renderers/backLayerWebView", "vs/workbench/contrib/notebook/browser/view/renderers/cellRenderer", "vs/workbench/contrib/notebook/browser/viewModel/codeCellViewModel", "vs/workbench/contrib/notebook/browser/viewModel/eventDispatcher", "vs/workbench/contrib/notebook/browser/viewModel/markupCellViewModel", "vs/workbench/contrib/notebook/browser/viewModel/notebookViewModelImpl", "vs/workbench/contrib/notebook/browser/viewModel/viewContext", "vs/workbench/contrib/notebook/browser/viewParts/notebookEditorToolbar", "vs/workbench/contrib/notebook/browser/viewParts/notebookEditorWidgetContextKeys", "vs/workbench/contrib/notebook/browser/viewParts/notebookOverviewRuler", "vs/workbench/contrib/notebook/browser/viewParts/notebookTopCellToolbar", "vs/workbench/contrib/notebook/common/notebookCommon", "vs/workbench/contrib/notebook/common/notebookContextKeys", "vs/workbench/contrib/notebook/common/notebookExecutionService", "vs/workbench/contrib/notebook/common/notebookExecutionStateService", "vs/workbench/contrib/notebook/common/notebookKernelService", "vs/workbench/contrib/notebook/browser/notebookOptions", "vs/workbench/contrib/notebook/common/notebookRendererMessagingService", "vs/workbench/contrib/notebook/common/notebookService", "vs/editor/browser/editorExtensions", "vs/workbench/services/editor/common/editorGroupsService", "vs/workbench/contrib/notebook/browser/viewModel/cellEditorOptions", "vs/workbench/browser/codeeditor", "vs/workbench/contrib/notebook/browser/contrib/find/findModel", "vs/workbench/contrib/notebook/common/notebookLoggingService", "vs/base/common/network", "vs/editor/contrib/dropOrPasteInto/browser/dropIntoEditorController", "vs/editor/contrib/dropOrPasteInto/browser/copyPasteController", "vs/workbench/contrib/notebook/browser/viewParts/notebookEditorStickyScroll", "vs/workbench/contrib/notebook/browser/viewModel/notebookOutlineProvider", "vs/platform/keybinding/common/keybinding", "vs/css!./media/notebook", "vs/css!./media/notebookCellEditorHint", "vs/css!./media/notebookCellInsertToolbar", "vs/css!./media/notebookCellStatusBar", "vs/css!./media/notebookCellTitleToolbar", "vs/css!./media/notebookFocusIndicator", "vs/css!./media/notebookToolbar", "vs/css!./media/notebookDnd", "vs/css!./media/notebookFolding", "vs/css!./media/notebookCellOutput", "vs/css!./media/notebookEditorStickyScroll", "vs/css!./media/notebookKernelActionViewItem", "vs/css!./media/notebookOutline"], function (require, exports, browser_1, DOM, async_1, color_1, errors_1, event_1, lifecycle_1, platform_1, resources_1, uuid_1, fontMeasurements_1, fontInfo_1, range_1, suggestController_1, nls, actions_1, configuration_1, contextkey_1, contextView_1, instantiation_1, serviceCollection_1, layoutService_1, zIndexRegistry_1, progress_1, telemetry_1, colorRegistry_1, theme_1, debugColors_1, notebookBrowser_1, notebookEditorExtensions_1, notebookEditorService_1, notebookLogger_1, notebookViewEvents_1, cellContextKeys_1, cellDnd_1, notebookCellList_1, backLayerWebView_1, cellRenderer_1, codeCellViewModel_1, eventDispatcher_1, markupCellViewModel_1, notebookViewModelImpl_1, viewContext_1, notebookEditorToolbar_1, notebookEditorWidgetContextKeys_1, notebookOverviewRuler_1, notebookTopCellToolbar_1, notebookCommon_1, notebookContextKeys_1, notebookExecutionService_1, notebookExecutionStateService_1, notebookKernelService_1, notebookOptions_1, notebookRendererMessagingService_1, notebookService_1, editorExtensions_1, editorGroupsService_1, cellEditorOptions_1, codeeditor_1, findModel_1, notebookLoggingService_1, network_1, dropIntoEditorController_1, copyPasteController_1, notebookEditorStickyScroll_1, notebookOutlineProvider_1, keybinding_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Zrb = exports.$Yrb = exports.$Xrb = exports.$Wrb = exports.$Vrb = exports.$Urb = exports.$Trb = exports.$Srb = exports.$Rrb = exports.$Qrb = exports.$Prb = exports.$Orb = exports.$Nrb = exports.$Mrb = exports.$Lrb = exports.$Krb = exports.$Jrb = exports.$Irb = exports.$Hrb = exports.$Grb = exports.$Frb = exports.$Erb = exports.$Drb = exports.$Crb = exports.$Brb = void 0;
    const $ = DOM.$;
    function $Brb() {
        // We inlined the id to avoid loading comment contrib in tests
        const skipContributions = [
            'editor.contrib.review',
            codeeditor_1.$srb.ID,
            'editor.contrib.dirtydiff',
            'editor.contrib.testingOutputPeek',
            'editor.contrib.testingDecorations',
            'store.contrib.stickyScrollController',
            'editor.contrib.findController',
            'editor.contrib.emptyTextEditorHint'
        ];
        const contributions = editorExtensions_1.EditorExtensionsRegistry.getEditorContributions().filter(c => skipContributions.indexOf(c.id) === -1);
        return {
            menuIds: {
                notebookToolbar: actions_1.$Ru.NotebookToolbar,
                cellTitleToolbar: actions_1.$Ru.NotebookCellTitle,
                cellDeleteToolbar: actions_1.$Ru.NotebookCellDelete,
                cellInsertToolbar: actions_1.$Ru.NotebookCellBetween,
                cellTopInsertToolbar: actions_1.$Ru.NotebookCellListTop,
                cellExecuteToolbar: actions_1.$Ru.NotebookCellExecute,
                cellExecutePrimary: actions_1.$Ru.NotebookCellExecutePrimary,
            },
            cellEditorContributions: contributions
        };
    }
    exports.$Brb = $Brb;
    let $Crb = class $Crb extends lifecycle_1.$kc {
        get isVisible() {
            return this.Fb;
        }
        get isDisposed() {
            return this.Gb;
        }
        set viewModel(newModel) {
            this.h.fire(this.lb?.notebookDocument);
            this.lb = newModel;
            this.j.fire(newModel?.notebookDocument);
        }
        get viewModel() {
            return this.lb;
        }
        get textModel() {
            return this.lb?.notebookDocument;
        }
        get isReadOnly() {
            return this.lb?.options.isReadOnly ?? false;
        }
        get activeCodeEditor() {
            if (this.Gb) {
                return;
            }
            const [focused] = this.fb.getFocusedElements();
            return this.jb.get(focused);
        }
        get codeEditors() {
            return [...this.jb];
        }
        get visibleRanges() {
            return this.fb.visibleRanges || [];
        }
        get notebookOptions() {
            return this.Kb;
        }
        constructor(creationOptions, dimension, instantiationService, editorGroupsService, Mb, Nb, Ob, Pb, Qb, contextKeyService, Rb, Sb, Tb, Ub, notebookExecutionStateService, Vb, logService, keybindingService) {
            super();
            this.creationOptions = creationOptions;
            this.Mb = Mb;
            this.Nb = Nb;
            this.Ob = Ob;
            this.Pb = Pb;
            this.Qb = Qb;
            this.Rb = Rb;
            this.Sb = Sb;
            this.Tb = Tb;
            this.Ub = Ub;
            this.Vb = Vb;
            this.logService = logService;
            this.keybindingService = keybindingService;
            //#region Eventing
            this.f = this.B(new event_1.$fd());
            this.onDidChangeCellState = this.f.event;
            this.g = this.B(new event_1.$fd());
            this.onDidChangeViewCells = this.g.event;
            this.h = this.B(new event_1.$fd());
            this.onWillChangeModel = this.h.event;
            this.j = this.B(new event_1.$fd());
            this.onDidChangeModel = this.j.event;
            this.m = this.B(new event_1.$fd());
            this.onDidAttachViewModel = this.m.event;
            this.n = this.B(new event_1.$fd());
            this.onDidChangeOptions = this.n.event;
            this.r = this.B(new event_1.$fd());
            this.onDidChangeDecorations = this.r.event;
            this.t = this.B(new event_1.$fd());
            this.onDidScroll = this.t.event;
            this.u = this.B(new event_1.$fd());
            this.onDidChangeActiveCell = this.u.event;
            this.w = this.B(new event_1.$fd());
            this.onDidChangeSelection = this.w.event;
            this.y = this.B(new event_1.$fd());
            this.onDidChangeVisibleRanges = this.y.event;
            this.z = this.B(new event_1.$fd());
            this.onDidFocusWidget = this.z.event;
            this.C = this.B(new event_1.$fd());
            this.onDidBlurWidget = this.C.event;
            this.D = this.B(new event_1.$fd());
            this.onDidChangeActiveEditor = this.D.event;
            this.F = this.B(new event_1.$fd());
            this.onDidChangeActiveKernel = this.F.event;
            this.G = this.B(new event_1.$fd());
            this.onMouseUp = this.G.event;
            this.H = this.B(new event_1.$fd());
            this.onMouseDown = this.H.event;
            this.I = this.B(new event_1.$fd());
            this.onDidReceiveMessage = this.I.event;
            this.J = this.B(new event_1.$fd());
            this.L = this.J.event;
            this.M = this.B(new event_1.$fd());
            this.N = this.M.event;
            this.O = this.B(new event_1.$fd());
            this.onDidResizeOutput = this.O.event;
            this.bb = null;
            this.cb = null;
            this.db = null;
            this.eb = null;
            this.hb = null;
            this.ib = null;
            this.jb = new Map();
            this.mb = this.B(new lifecycle_1.$jc());
            this.nb = [];
            this.sb = null;
            this.yb = new Map();
            this.Ab = new async_1.$Cg();
            this.Bb = null;
            this.Cb = (0, uuid_1.$4f)();
            this.Eb = false;
            this.Fb = false;
            this.Gb = false;
            this.Hb = new Map();
            this.Wb = false;
            this.ic = false;
            this.tc = null;
            //#endregion
            //#region Cell operations/layout API
            this.Ic = new WeakMap();
            this.Rc = new Map();
            this.pb = dimension;
            this.isEmbedded = creationOptions.isEmbedded ?? false;
            this.Ib = creationOptions.isReadOnly ?? false;
            this.Kb = creationOptions.options ?? new notebookOptions_1.$Gbb(this.Qb, notebookExecutionStateService, this.Ib);
            this.B(this.Kb);
            this.kb = new viewContext_1.$Mnb(this.Kb, new eventDispatcher_1.$Lnb(), language => this.getBaseCellEditorOptions(language));
            this.B(this.kb.eventDispatcher.onDidChangeCellState(e => {
                this.f.fire(e);
            }));
            this.P = document.createElement('div');
            this.scopedContextKeyService = contextKeyService.createScoped(this.P);
            this.Jb = instantiationService.createChild(new serviceCollection_1.$zh([contextkey_1.$3i, this.scopedContextKeyService]));
            this.B(Pb.onDidChangeOutputRenderers(() => {
                this.hc();
            }));
            this.B(this.Jb.createInstance(notebookEditorWidgetContextKeys_1.$jrb, this));
            this._notebookOutline = this.B(this.Jb.createInstance(notebookOutlineProvider_1.$wrb, this, 4 /* OutlineTarget.QuickPick */));
            this.B(Ob.onDidChangeSelectedNotebooks(e => {
                if ((0, resources_1.$bg)(e.notebook, this.viewModel?.uri)) {
                    this.Hc();
                    this.F.fire();
                }
            }));
            this.zb = this.Qb.getValue('editor.scrollBeyondLastLine');
            this.B(this.Qb.onDidChangeConfiguration(e => {
                if (e.affectsConfiguration('editor.scrollBeyondLastLine')) {
                    this.zb = this.Qb.getValue('editor.scrollBeyondLastLine');
                    if (this.pb && this.Fb) {
                        this.layout(this.pb);
                    }
                }
            }));
            this.B(this.Kb.onDidChangeOptions(e => {
                if (e.cellStatusBarVisibility || e.cellToolbarLocation || e.cellToolbarInteraction) {
                    this.Yb();
                }
                if (e.fontFamily) {
                    this.Zb();
                }
                if (e.compactView
                    || e.focusIndicator
                    || e.insertToolbarPosition
                    || e.cellToolbarLocation
                    || e.dragAndDropEnabled
                    || e.fontSize
                    || e.markupFontSize
                    || e.fontFamily
                    || e.insertToolbarAlignment
                    || e.outputFontSize
                    || e.outputLineHeight
                    || e.outputFontFamily
                    || e.outputWordWrap
                    || e.outputScrolling) {
                    this.Z?.remove();
                    this.bc();
                    this.bb?.updateOptions({
                        ...this.notebookOptions.computeWebviewOptions(),
                        fontFamily: this.ac()
                    });
                }
                if (this.pb && this.Fb) {
                    this.layout(this.pb);
                }
            }));
            this.B(editorGroupsService.onDidScroll(e => {
                if (!this.rb || !this.Fb) {
                    return;
                }
                this.Cc(this.rb, this.pb);
                this.Dc(this.pb, this.qb);
            }));
            this.Nb.addNotebookEditor(this);
            const id = (0, uuid_1.$4f)();
            this.P.id = `notebook-${id}`;
            this.P.className = 'notebookOverlay';
            this.P.classList.add('notebook-editor');
            this.P.style.visibility = 'hidden';
            this.Rb.container.appendChild(this.P);
            this.$b(this.P);
            this.Zb();
            this.Fb = true;
            this.tb = notebookContextKeys_1.$Ynb.bindTo(this.scopedContextKeyService);
            this.ub = notebookContextKeys_1.$1nb.bindTo(this.scopedContextKeyService);
            this.xb = notebookContextKeys_1.$2nb.bindTo(this.scopedContextKeyService);
            this.vb = notebookContextKeys_1.$3nb.bindTo(this.scopedContextKeyService);
            this.wb = notebookContextKeys_1.$9nb.bindTo(this.scopedContextKeyService);
            this.vb.set(!creationOptions.isReadOnly);
            let contributions;
            if (Array.isArray(this.creationOptions.contributions)) {
                contributions = this.creationOptions.contributions;
            }
            else {
                contributions = notebookEditorExtensions_1.NotebookEditorExtensionsRegistry.getEditorContributions();
            }
            for (const desc of contributions) {
                let contribution;
                try {
                    contribution = this.Jb.createInstance(desc.ctor, this);
                }
                catch (err) {
                    (0, errors_1.$Y)(err);
                }
                if (contribution) {
                    if (!this.yb.has(desc.id)) {
                        this.yb.set(desc.id, contribution);
                    }
                    else {
                        contribution.dispose();
                        throw new Error(`DUPLICATE notebook editor contribution: '${desc.id}'`);
                    }
                }
            }
            this.Yb();
        }
        Xb(...args) {
            if (!this.Wb) {
                return;
            }
            (0, notebookLogger_1.$Gnb)(...args);
        }
        /**
         * EditorId
         */
        getId() {
            return this.Cb;
        }
        getViewModel() {
            return this.viewModel;
        }
        getLength() {
            return this.viewModel?.length ?? 0;
        }
        getSelections() {
            return this.viewModel?.getSelections() ?? [];
        }
        setSelections(selections) {
            if (!this.viewModel) {
                return;
            }
            const focus = this.viewModel.getFocus();
            this.viewModel.updateSelectionsState({
                kind: notebookCommon_1.SelectionStateType.Index,
                focus: focus,
                selections: selections
            });
        }
        getFocus() {
            return this.viewModel?.getFocus() ?? { start: 0, end: 0 };
        }
        setFocus(focus) {
            if (!this.viewModel) {
                return;
            }
            const selections = this.viewModel.getSelections();
            this.viewModel.updateSelectionsState({
                kind: notebookCommon_1.SelectionStateType.Index,
                focus: focus,
                selections: selections
            });
        }
        getSelectionViewModels() {
            if (!this.viewModel) {
                return [];
            }
            const cellsSet = new Set();
            return this.viewModel.getSelections().map(range => this.viewModel.viewCells.slice(range.start, range.end)).reduce((a, b) => {
                b.forEach(cell => {
                    if (!cellsSet.has(cell.handle)) {
                        cellsSet.add(cell.handle);
                        a.push(cell);
                    }
                });
                return a;
            }, []);
        }
        hasModel() {
            return !!this.lb;
        }
        showProgress() {
            this.Lb = this.Vb.show(true);
        }
        hideProgress() {
            if (this.Lb) {
                this.Lb.done();
                this.Lb = undefined;
            }
        }
        //#region Editor Core
        getBaseCellEditorOptions(language) {
            const existingOptions = this.Hb.get(language);
            if (existingOptions) {
                return existingOptions;
            }
            else {
                const options = new cellEditorOptions_1.$mrb(this, this.notebookOptions, this.Qb, language);
                this.Hb.set(language, options);
                return options;
            }
        }
        Yb() {
            if (!this.P) {
                return;
            }
            this.P.classList.remove('cell-title-toolbar-left');
            this.P.classList.remove('cell-title-toolbar-right');
            this.P.classList.remove('cell-title-toolbar-hidden');
            const cellToolbarLocation = this.Kb.computeCellToolbarLocation(this.viewModel?.viewType);
            this.P.classList.add(`cell-title-toolbar-${cellToolbarLocation}`);
            const cellToolbarInteraction = this.Kb.getLayoutConfiguration().cellToolbarInteraction;
            let cellToolbarInteractionState = 'hover';
            this.P.classList.remove('cell-toolbar-hover');
            this.P.classList.remove('cell-toolbar-click');
            if (cellToolbarInteraction === 'hover' || cellToolbarInteraction === 'click') {
                cellToolbarInteractionState = cellToolbarInteraction;
            }
            this.P.classList.add(`cell-toolbar-${cellToolbarInteractionState}`);
        }
        Zb() {
            const editorOptions = this.Qb.getValue('editor');
            this.ob = fontMeasurements_1.$zU.readFontInfo(fontInfo_1.$Rr.createFromRawSettings(editorOptions, browser_1.$WN.value));
        }
        $b(parent) {
            this.Q = document.createElement('div');
            this.Q.classList.add('notebook-toolbar-container');
            this.Q.style.display = 'none';
            DOM.$0O(parent, this.Q);
            this.S = document.createElement('div');
            this.S.classList.add('notebook-sticky-scroll-container');
            DOM.$0O(parent, this.S);
            this.Y = document.createElement('div');
            DOM.$0O(parent, this.Y);
            this.Y.classList.add('cell-list-container');
            this.bc();
            this.cc();
            this.W = document.createElement('div');
            this.W.classList.add('notebook-overview-ruler-container');
            this.fb.scrollableElement.appendChild(this.W);
            this.ec();
            this.ab = document.createElement('div');
            this.ab.classList.add('notebook-overflow-widget-container', 'monaco-editor');
            DOM.$0O(parent, this.ab);
        }
        ac() {
            return this.ob?.fontFamily ?? `"SF Mono", Monaco, Menlo, Consolas, "Ubuntu Mono", "Liberation Mono", "DejaVu Sans Mono", "Courier New", monospace`;
        }
        bc() {
            this.Z = DOM.$XO(this.Y);
            const { cellRightMargin, cellTopMargin, cellRunGutter, cellBottomMargin, codeCellLeftMargin, markdownCellGutter, markdownCellLeftMargin, markdownCellBottomMargin, markdownCellTopMargin, collapsedIndicatorHeight, compactView, focusIndicator, insertToolbarPosition, insertToolbarAlignment, fontSize, outputFontSize, focusIndicatorLeftMargin, focusIndicatorGap } = this.Kb.getLayoutConfiguration();
            const { bottomToolbarGap, bottomToolbarHeight } = this.Kb.computeBottomToolbarDimensions(this.viewModel?.viewType);
            const styleSheets = [];
            if (!this.ob) {
                this.Zb();
            }
            const fontFamily = this.ac();
            styleSheets.push(`
		.notebook-editor {
			--notebook-cell-output-font-size: ${outputFontSize}px;
			--notebook-cell-input-preview-font-size: ${fontSize}px;
			--notebook-cell-input-preview-font-family: ${fontFamily};
		}
		`);
            if (compactView) {
                styleSheets.push(`.notebookOverlay .cell-list-container > .monaco-list > .monaco-scrollable-element > .monaco-list-rows > .markdown-cell-row div.cell.code { margin-left: ${codeCellLeftMargin + cellRunGutter}px; }`);
            }
            else {
                styleSheets.push(`.notebookOverlay .cell-list-container > .monaco-list > .monaco-scrollable-element > .monaco-list-rows > .markdown-cell-row div.cell.code { margin-left: ${codeCellLeftMargin}px; }`);
            }
            // focus indicator
            if (focusIndicator === 'border') {
                styleSheets.push(`
			.monaco-workbench .notebookOverlay .monaco-list .monaco-list-row .cell-focus-indicator-top:before,
			.monaco-workbench .notebookOverlay .monaco-list .monaco-list-row .cell-focus-indicator-bottom:before,
			.monaco-workbench .notebookOverlay .monaco-list .markdown-cell-row .cell-inner-container:before,
			.monaco-workbench .notebookOverlay .monaco-list .markdown-cell-row .cell-inner-container:after {
				content: "";
				position: absolute;
				width: 100%;
				height: 1px;
			}

			.monaco-workbench .notebookOverlay .monaco-list .monaco-list-row .cell-focus-indicator-left:before,
			.monaco-workbench .notebookOverlay .monaco-list .monaco-list-row .cell-focus-indicator-right:before {
				content: "";
				position: absolute;
				width: 1px;
				height: 100%;
				z-index: 10;
			}

			/* top border */
			.monaco-workbench .notebookOverlay .monaco-list .monaco-list-row .cell-focus-indicator-top:before {
				border-top: 1px solid transparent;
			}

			/* left border */
			.monaco-workbench .notebookOverlay .monaco-list .monaco-list-row .cell-focus-indicator-left:before {
				border-left: 1px solid transparent;
			}

			/* bottom border */
			.monaco-workbench .notebookOverlay .monaco-list .monaco-list-row .cell-focus-indicator-bottom:before {
				border-bottom: 1px solid transparent;
			}

			/* right border */
			.monaco-workbench .notebookOverlay .monaco-list .monaco-list-row .cell-focus-indicator-right:before {
				border-right: 1px solid transparent;
			}
			`);
                // left and right border margins
                styleSheets.push(`
			.monaco-workbench .notebookOverlay .monaco-list .monaco-list-row.code-cell-row.focused .cell-focus-indicator-left:before,
			.monaco-workbench .notebookOverlay .monaco-list .monaco-list-row.code-cell-row.focused .cell-focus-indicator-right:before,
			.monaco-workbench .notebookOverlay .monaco-list.selection-multiple .monaco-list-row.code-cell-row.selected .cell-focus-indicator-left:before,
			.monaco-workbench .notebookOverlay .monaco-list.selection-multiple .monaco-list-row.code-cell-row.selected .cell-focus-indicator-right:before {
				top: -${cellTopMargin}px; height: calc(100% + ${cellTopMargin + cellBottomMargin}px)
			}`);
            }
            else {
                styleSheets.push(`
			.monaco-workbench .notebookOverlay .monaco-list .monaco-list-row .cell-focus-indicator-left .codeOutput-focus-indicator {
				border-left: 3px solid transparent;
				border-radius: 4px;
				width: 0px;
				margin-left: ${focusIndicatorLeftMargin}px;
				border-color: var(--vscode-notebook-inactiveFocusedCellBorder) !important;
			}

			.monaco-workbench .notebookOverlay .monaco-list .monaco-list-row.focused .cell-focus-indicator-left .codeOutput-focus-indicator-container,
			.monaco-workbench .notebookOverlay .monaco-list .monaco-list-row .cell-output-hover .cell-focus-indicator-left .codeOutput-focus-indicator-container,
			.monaco-workbench .notebookOverlay .monaco-list .monaco-list-row .markdown-cell-hover .cell-focus-indicator-left .codeOutput-focus-indicator-container,
			.monaco-workbench .notebookOverlay .monaco-list .monaco-list-row:hover .cell-focus-indicator-left .codeOutput-focus-indicator-container {
				display: block;
			}

			.monaco-workbench .notebookOverlay .monaco-list .monaco-list-row .cell-focus-indicator-left .codeOutput-focus-indicator-container:hover .codeOutput-focus-indicator {
				border-left: 5px solid transparent;
				margin-left: ${focusIndicatorLeftMargin - 1}px;
			}
			`);
                styleSheets.push(`
			.monaco-workbench .notebookOverlay .monaco-list .monaco-list-row.focused .cell-inner-container.cell-output-focus .cell-focus-indicator-left .codeOutput-focus-indicator,
			.monaco-workbench .notebookOverlay .monaco-list:focus-within .monaco-list-row.focused .cell-inner-container .cell-focus-indicator-left .codeOutput-focus-indicator {
				border-color: var(--vscode-notebook-focusedCellBorder) !important;
			}

			.monaco-workbench .notebookOverlay .monaco-list .monaco-list-row .cell-inner-container .cell-focus-indicator-left .output-focus-indicator {
				margin-top: ${focusIndicatorGap}px;
			}
			`);
            }
            // between cell insert toolbar
            if (insertToolbarPosition === 'betweenCells' || insertToolbarPosition === 'both') {
                styleSheets.push(`.monaco-workbench .notebookOverlay > .cell-list-container > .monaco-list > .monaco-scrollable-element > .monaco-list-rows > .monaco-list-row .cell-bottom-toolbar-container { display: flex; }`);
                styleSheets.push(`.monaco-workbench .notebookOverlay > .cell-list-container > .monaco-list > .monaco-scrollable-element > .monaco-list-rows > .cell-list-top-cell-toolbar-container { display: flex; }`);
            }
            else {
                styleSheets.push(`.monaco-workbench .notebookOverlay > .cell-list-container > .monaco-list > .monaco-scrollable-element > .monaco-list-rows > .monaco-list-row .cell-bottom-toolbar-container { display: none; }`);
                styleSheets.push(`.monaco-workbench .notebookOverlay > .cell-list-container > .monaco-list > .monaco-scrollable-element > .monaco-list-rows > .cell-list-top-cell-toolbar-container { display: none; }`);
            }
            if (insertToolbarAlignment === 'left') {
                styleSheets.push(`
			.monaco-workbench .notebookOverlay .cell-list-top-cell-toolbar-container .action-item:first-child,
			.monaco-workbench .notebookOverlay .cell-list-top-cell-toolbar-container .action-item:first-child, .monaco-workbench .notebookOverlay > .cell-list-container > .monaco-list > .monaco-scrollable-element > .monaco-list-rows > .monaco-list-row .cell-bottom-toolbar-container .action-item:first-child {
				margin-right: 0px !important;
			}`);
                styleSheets.push(`
			.monaco-workbench .notebookOverlay .cell-list-top-cell-toolbar-container .monaco-toolbar .action-label,
			.monaco-workbench .notebookOverlay .cell-list-top-cell-toolbar-container .monaco-toolbar .action-label, .monaco-workbench .notebookOverlay > .cell-list-container > .monaco-list > .monaco-scrollable-element > .monaco-list-rows > .monaco-list-row .cell-bottom-toolbar-container .monaco-toolbar .action-label {
				padding: 0px !important;
				justify-content: center;
				border-radius: 4px;
			}`);
                styleSheets.push(`
			.monaco-workbench .notebookOverlay .cell-list-top-cell-toolbar-container,
			.monaco-workbench .notebookOverlay .cell-list-top-cell-toolbar-container, .monaco-workbench .notebookOverlay > .cell-list-container > .monaco-list > .monaco-scrollable-element > .monaco-list-rows > .monaco-list-row .cell-bottom-toolbar-container {
				align-items: flex-start;
				justify-content: left;
				margin: 0 16px 0 ${8 + codeCellLeftMargin}px;
			}`);
                styleSheets.push(`
			.monaco-workbench .notebookOverlay .cell-list-top-cell-toolbar-container,
			.notebookOverlay .cell-bottom-toolbar-container .action-item {
				border: 0px;
			}`);
            }
            styleSheets.push(`.notebookOverlay .cell-list-container > .monaco-list > .monaco-scrollable-element > .monaco-list-rows > .code-cell-row div.cell.code { margin-left: ${codeCellLeftMargin + cellRunGutter}px; }`);
            styleSheets.push(`.notebookOverlay .cell-list-container > .monaco-list > .monaco-scrollable-element > .monaco-list-rows > .monaco-list-row div.cell { margin-right: ${cellRightMargin}px; }`);
            styleSheets.push(`.notebookOverlay .cell-list-container > .monaco-list > .monaco-scrollable-element > .monaco-list-rows > .monaco-list-row > .cell-inner-container { padding-top: ${cellTopMargin}px; }`);
            styleSheets.push(`.notebookOverlay .cell-list-container > .monaco-list > .monaco-scrollable-element > .monaco-list-rows > .markdown-cell-row > .cell-inner-container { padding-bottom: ${markdownCellBottomMargin}px; padding-top: ${markdownCellTopMargin}px; }`);
            styleSheets.push(`.notebookOverlay .cell-list-container > .monaco-list > .monaco-scrollable-element > .monaco-list-rows > .markdown-cell-row > .cell-inner-container.webview-backed-markdown-cell { padding: 0; }`);
            styleSheets.push(`.notebookOverlay .cell-list-container > .monaco-list > .monaco-scrollable-element > .monaco-list-rows > .markdown-cell-row > .webview-backed-markdown-cell.markdown-cell-edit-mode .cell.code { padding-bottom: ${markdownCellBottomMargin}px; padding-top: ${markdownCellTopMargin}px; }`);
            styleSheets.push(`.notebookOverlay .output { margin: 0px ${cellRightMargin}px 0px ${codeCellLeftMargin + cellRunGutter}px; }`);
            styleSheets.push(`.notebookOverlay .output { width: calc(100% - ${codeCellLeftMargin + cellRunGutter + cellRightMargin}px); }`);
            // comment
            styleSheets.push(`.notebookOverlay .cell-list-container > .monaco-list > .monaco-scrollable-element > .monaco-list-rows > .monaco-list-row .cell-comment-container { left: ${codeCellLeftMargin + cellRunGutter}px; }`);
            styleSheets.push(`.notebookOverlay .cell-list-container > .monaco-list > .monaco-scrollable-element > .monaco-list-rows > .monaco-list-row .cell-comment-container { width: calc(100% - ${codeCellLeftMargin + cellRunGutter + cellRightMargin}px); }`);
            // output collapse button
            styleSheets.push(`.monaco-workbench .notebookOverlay .output .output-collapse-container .expandButton { left: -${cellRunGutter}px; }`);
            styleSheets.push(`.monaco-workbench .notebookOverlay .output .output-collapse-container .expandButton {
			position: absolute;
			width: ${cellRunGutter}px;
			padding: 6px 0px;
		}`);
            // show more container
            styleSheets.push(`.notebookOverlay .output-show-more-container { margin: 0px ${cellRightMargin}px 0px ${codeCellLeftMargin + cellRunGutter}px; }`);
            styleSheets.push(`.notebookOverlay .output-show-more-container { width: calc(100% - ${codeCellLeftMargin + cellRunGutter + cellRightMargin}px); }`);
            styleSheets.push(`.notebookOverlay .cell-list-container > .monaco-list > .monaco-scrollable-element > .monaco-list-rows > .monaco-list-row div.cell.markdown { padding-left: ${cellRunGutter}px; }`);
            styleSheets.push(`.monaco-workbench .notebookOverlay > .cell-list-container .notebook-folding-indicator { left: ${(markdownCellGutter - 20) / 2 + markdownCellLeftMargin}px; }`);
            styleSheets.push(`.notebookOverlay > .cell-list-container .notebook-folded-hint { left: ${markdownCellGutter + markdownCellLeftMargin + 8}px; }`);
            styleSheets.push(`.notebookOverlay .monaco-list .monaco-list-row :not(.webview-backed-markdown-cell) .cell-focus-indicator-top { height: ${cellTopMargin}px; }`);
            styleSheets.push(`.notebookOverlay .monaco-list .monaco-list-row .cell-focus-indicator-side { bottom: ${bottomToolbarGap}px; }`);
            styleSheets.push(`.notebookOverlay .monaco-list .monaco-list-row.code-cell-row .cell-focus-indicator-left { width: ${codeCellLeftMargin + cellRunGutter}px; }`);
            styleSheets.push(`.notebookOverlay .monaco-list .monaco-list-row.markdown-cell-row .cell-focus-indicator-left { width: ${codeCellLeftMargin}px; }`);
            styleSheets.push(`.notebookOverlay .monaco-list .monaco-list-row .cell-focus-indicator.cell-focus-indicator-right { width: ${cellRightMargin}px; }`);
            styleSheets.push(`.notebookOverlay .monaco-list .monaco-list-row .cell-focus-indicator-bottom { height: ${cellBottomMargin}px; }`);
            styleSheets.push(`.notebookOverlay .monaco-list .monaco-list-row .cell-shadow-container-bottom { top: ${cellBottomMargin}px; }`);
            styleSheets.push(`
			.notebookOverlay .monaco-list .monaco-list-row:has(+ .monaco-list-row.selected) .cell-focus-indicator-bottom {
				height: ${bottomToolbarGap + cellBottomMargin}px;
			}
		`);
            styleSheets.push(`
			.monaco-workbench .notebookOverlay > .cell-list-container > .monaco-list > .monaco-scrollable-element > .monaco-list-rows > .monaco-list-row .input-collapse-container .cell-collapse-preview {
				line-height: ${collapsedIndicatorHeight}px;
			}

			.monaco-workbench .notebookOverlay > .cell-list-container > .monaco-list > .monaco-scrollable-element > .monaco-list-rows > .monaco-list-row .input-collapse-container .cell-collapse-preview .monaco-tokenized-source {
				max-height: ${collapsedIndicatorHeight}px;
			}
		`);
            styleSheets.push(`.monaco-workbench .notebookOverlay > .cell-list-container > .monaco-list > .monaco-scrollable-element > .monaco-list-rows > .monaco-list-row .cell-bottom-toolbar-container .monaco-toolbar { height: ${bottomToolbarHeight}px }`);
            styleSheets.push(`.monaco-workbench .notebookOverlay > .cell-list-container > .monaco-list > .monaco-scrollable-element > .monaco-list-rows > .cell-list-top-cell-toolbar-container .monaco-toolbar { height: ${bottomToolbarHeight}px }`);
            // cell toolbar
            styleSheets.push(`.monaco-workbench .notebookOverlay.cell-title-toolbar-right > .cell-list-container > .monaco-list > .monaco-scrollable-element > .monaco-list-rows > .monaco-list-row .cell-title-toolbar {
			right: ${cellRightMargin + 26}px;
		}
		.monaco-workbench .notebookOverlay.cell-title-toolbar-left > .cell-list-container > .monaco-list > .monaco-scrollable-element > .monaco-list-rows > .monaco-list-row .cell-title-toolbar {
			left: ${codeCellLeftMargin + cellRunGutter + 16}px;
		}
		.monaco-workbench .notebookOverlay.cell-title-toolbar-hidden > .cell-list-container > .monaco-list > .monaco-scrollable-element > .monaco-list-rows > .monaco-list-row .cell-title-toolbar {
			display: none;
		}`);
            // cell output innert container
            styleSheets.push(`
		.monaco-workbench .notebookOverlay .output > div.foreground.output-inner-container {
			padding: ${notebookOptions_1.$Fbb}px 8px;
		}
		.monaco-workbench .notebookOverlay > .cell-list-container > .monaco-list > .monaco-scrollable-element > .monaco-list-rows > .monaco-list-row .output-collapse-container {
			padding: ${notebookOptions_1.$Fbb}px 8px;
		}
		`);
            this.Z.textContent = styleSheets.join('\n');
        }
        cc() {
            this.Y.classList.add('cell-list-container');
            this.hb = this.B(new cellDnd_1.$Cob(this, this.Y));
            const getScopedContextKeyService = (container) => this.fb.contextKeyService.createScoped(container);
            const renderers = [
                this.Jb.createInstance(cellRenderer_1.$9qb, this, this.jb, this.hb, getScopedContextKeyService),
                this.Jb.createInstance(cellRenderer_1.$8qb, this, this.hb, this.jb, getScopedContextKeyService),
            ];
            renderers.forEach(renderer => {
                this.B(renderer);
            });
            this.eb = this.Jb.createInstance(cellRenderer_1.$7qb);
            this.B(this.eb);
            const createNotebookAriaLabel = () => {
                const keybinding = this.keybindingService.lookupKeybinding("editor.action.accessibilityHelp" /* AccessibilityCommandId.OpenAccessibilityHelp */)?.getLabel();
                if (this.Qb.getValue("accessibility.verbosity.notebook" /* AccessibilityVerbositySettingId.Notebook */)) {
                    return keybinding
                        ? nls.localize(0, null, keybinding)
                        : nls.localize(1, null, keybinding);
                }
                return nls.localize(2, null);
            };
            this.fb = this.Jb.createInstance(notebookCellList_1.$Gob, 'NotebookCellList', this.Y, this.kb.notebookOptions, this.eb, renderers, this.scopedContextKeyService, {
                setRowLineHeight: false,
                setRowHeight: false,
                supportDynamicHeights: true,
                horizontalScrolling: false,
                keyboardSupport: false,
                mouseSupport: true,
                multipleSelectionSupport: true,
                selectionNavigation: true,
                typeNavigationEnabled: true,
                paddingTop: this.Kb.computeTopInsertToolbarHeight(this.viewModel?.viewType),
                paddingBottom: 0,
                transformOptimization: false,
                initialSize: this.pb,
                styleController: (_suffix) => { return this.fb; },
                overrideStyles: {
                    listBackground: notebookEditorBackground,
                    listActiveSelectionBackground: notebookEditorBackground,
                    listActiveSelectionForeground: colorRegistry_1.$uv,
                    listFocusAndSelectionBackground: notebookEditorBackground,
                    listFocusAndSelectionForeground: colorRegistry_1.$uv,
                    listFocusBackground: notebookEditorBackground,
                    listFocusForeground: colorRegistry_1.$uv,
                    listHoverForeground: colorRegistry_1.$uv,
                    listHoverBackground: notebookEditorBackground,
                    listHoverOutline: colorRegistry_1.$zv,
                    listFocusOutline: colorRegistry_1.$zv,
                    listInactiveSelectionBackground: notebookEditorBackground,
                    listInactiveSelectionForeground: colorRegistry_1.$uv,
                    listInactiveFocusBackground: notebookEditorBackground,
                    listInactiveFocusOutline: notebookEditorBackground,
                },
                accessibilityProvider: {
                    getAriaLabel: (element) => {
                        if (!this.viewModel) {
                            return '';
                        }
                        const index = this.viewModel.getCellIndex(element);
                        if (index >= 0) {
                            return `Cell ${index}, ${element.cellKind === notebookCommon_1.CellKind.Markup ? 'markdown' : 'code'}  cell`;
                        }
                        return '';
                    },
                    getWidgetAriaLabel: createNotebookAriaLabel
                },
            });
            this.hb.setList(this.fb);
            // create Webview
            this.B(this.fb);
            this.gb = new notebookCellList_1.$Hob(this.fb);
            this.B(this.gb);
            this.B((0, lifecycle_1.$hc)(...renderers));
            // top cell toolbar
            this.ib = this.B(this.Jb.createInstance(notebookTopCellToolbar_1.$lrb, this, this.scopedContextKeyService, this.fb.rowsContainer));
            // transparent cover
            this.db = DOM.$0O(this.fb.rowsContainer, $('.webview-cover'));
            this.db.style.display = 'none';
            this.B(DOM.$pO(this.P, (e) => {
                if (e.target.classList.contains('slider') && this.db) {
                    this.db.style.display = 'block';
                }
            }));
            this.B(DOM.$qO(this.P, () => {
                if (this.db) {
                    // no matter when
                    this.db.style.display = 'none';
                }
            }));
            this.B(this.fb.onMouseDown(e => {
                if (e.element) {
                    this.H.fire({ event: e.browserEvent, target: e.element });
                }
            }));
            this.B(this.fb.onMouseUp(e => {
                if (e.element) {
                    this.G.fire({ event: e.browserEvent, target: e.element });
                }
            }));
            this.B(this.fb.onDidChangeFocus(_e => {
                this.D.fire(this);
                this.u.fire();
                this.wb.set(false);
            }));
            this.B(this.fb.onContextMenu(e => {
                this.dc(e);
            }));
            this.B(this.fb.onDidChangeVisibleRanges(() => {
                this.y.fire();
            }));
            this.B(this.fb.onDidScroll((e) => {
                this.t.fire();
                if (e.scrollTop !== e.oldScrollTop) {
                    this.Fc();
                }
            }));
            this.Db = this.B(DOM.$8O(this.getDomNode()));
            this.B(this.Db.onDidBlur(() => {
                this.tb.set(false);
                this.viewModel?.setEditorFocus(false);
                this.C.fire();
            }));
            this.B(this.Db.onDidFocus(() => {
                this.tb.set(true);
                this.viewModel?.setEditorFocus(true);
                this.z.fire();
            }));
            this.fc();
            this.gc();
            this.B(this.Qb.onDidChangeConfiguration(e => {
                if (e.affectsConfiguration("accessibility.verbosity.notebook" /* AccessibilityVerbositySettingId.Notebook */)) {
                    this.fb.ariaLabel = createNotebookAriaLabel();
                }
            }));
        }
        dc(e) {
            this.Sb.showContextMenu({
                menuId: actions_1.$Ru.NotebookCellTitle,
                contextKeyService: this.scopedContextKeyService,
                getAnchor: () => e.anchor
            });
        }
        ec() {
            this.X = this.B(this.Jb.createInstance(notebookOverviewRuler_1.$krb, this, this.W));
        }
        fc() {
            this.R = this.B(this.Jb.createInstance(notebookEditorToolbar_1.$grb, this, this.scopedContextKeyService, this.Kb, this.Q));
            this.B(this.R.onDidChangeVisibility(() => {
                if (this.pb && this.Fb) {
                    this.layout(this.pb);
                }
            }));
        }
        gc() {
            this.U = this.B(this.Jb.createInstance(notebookEditorStickyScroll_1.$zrb, this.S, this, this._notebookOutline, this.fb));
        }
        hc() {
            if (!this.viewModel || !this.bb) {
                return;
            }
            this.bb.updateOutputRenderers();
            this.viewModel.viewCells.forEach(cell => {
                cell.outputsViewModels.forEach(output => {
                    if (output.pickedMimeType?.rendererId === notebookCommon_1.$ZH) {
                        output.resetRenderer();
                    }
                });
            });
        }
        getDomNode() {
            return this.P;
        }
        getOverflowContainerDomNode() {
            return this.ab;
        }
        getInnerWebview() {
            return this.bb?.webview;
        }
        setEditorProgressService(editorProgressService) {
            this.Vb = editorProgressService;
        }
        setParentContextKeyService(parentContextKeyService) {
            this.scopedContextKeyService.updateParent(parentContextKeyService);
        }
        async setModel(textModel, viewState, perf) {
            if (this.viewModel === undefined || !this.viewModel.equal(textModel)) {
                const oldTopInsertToolbarHeight = this.Kb.computeTopInsertToolbarHeight(this.viewModel?.viewType);
                const oldBottomToolbarDimensions = this.Kb.computeBottomToolbarDimensions(this.viewModel?.viewType);
                this.nc();
                await this.rc(textModel, viewState, perf);
                const newTopInsertToolbarHeight = this.Kb.computeTopInsertToolbarHeight(this.viewModel?.viewType);
                const newBottomToolbarDimensions = this.Kb.computeBottomToolbarDimensions(this.viewModel?.viewType);
                if (oldTopInsertToolbarHeight !== newTopInsertToolbarHeight
                    || oldBottomToolbarDimensions.bottomToolbarGap !== newBottomToolbarDimensions.bottomToolbarGap
                    || oldBottomToolbarDimensions.bottomToolbarHeight !== newBottomToolbarDimensions.bottomToolbarHeight) {
                    this.Z?.remove();
                    this.bc();
                    this.bb?.updateOptions({
                        ...this.notebookOptions.computeWebviewOptions(),
                        fontFamily: this.ac()
                    });
                }
                this.Tb.publicLog2('notebook/editorOpened', {
                    scheme: textModel.uri.scheme,
                    ext: (0, resources_1.$gg)(textModel.uri),
                    viewType: textModel.viewType
                });
            }
            else {
                this.restoreListViewState(viewState);
            }
            this.zc(viewState);
            // load preloads for matching kernel
            this.Hc();
            // clear state
            this.hb?.clearGlobalDragState();
            this.mb.add(this.fb.onDidChangeFocus(() => {
                this.lc();
            }));
            this.lc();
            // render markdown top down on idle
            this.jc();
        }
        jc() {
            if (this.ic) {
                return;
            }
            this.ic = true;
            (0, async_1.$Wg)((deadline) => {
                this.kc(deadline);
            });
        }
        kc(deadline) {
            const endTime = Date.now() + deadline.timeRemaining();
            const execute = () => {
                try {
                    this.ic = true;
                    if (this.Gb) {
                        return;
                    }
                    if (!this.viewModel) {
                        return;
                    }
                    const firstMarkupCell = this.viewModel.viewCells.find(cell => cell.cellKind === notebookCommon_1.CellKind.Markup && !this.bb?.markupPreviewMapping.has(cell.id) && !this.Nc(cell));
                    if (!firstMarkupCell) {
                        return;
                    }
                    this.createMarkupPreview(firstMarkupCell);
                }
                finally {
                    this.ic = false;
                }
                if (Date.now() < endTime) {
                    (0, platform_1.$A)(execute);
                }
                else {
                    this.jc();
                }
            };
            execute();
        }
        lc() {
            if (!this.viewModel) {
                return;
            }
            const focused = this.fb.getFocusedElements()[0];
            if (focused) {
                if (!this.Bb) {
                    this.Bb = this.mb.add(this.Jb.createInstance(cellContextKeys_1.$tob, this, focused));
                }
                this.Bb.updateForElement(focused);
            }
        }
        async setOptions(options) {
            if (options?.isReadOnly !== undefined) {
                this.Ib = options?.isReadOnly;
            }
            if (!this.viewModel) {
                return;
            }
            this.viewModel.updateOptions({ isReadOnly: this.Ib });
            this.notebookOptions.updateOptions(this.Ib);
            // reveal cell if editor options tell to do so
            const cellOptions = options?.cellOptions ?? this.mc(options);
            if (cellOptions) {
                const cell = this.viewModel.viewCells.find(cell => cell.uri.toString() === cellOptions.resource.toString());
                if (cell) {
                    this.focusElement(cell);
                    const selection = cellOptions.options?.selection;
                    if (selection) {
                        cell.updateEditState(notebookBrowser_1.CellEditState.Editing, 'setOptions');
                        cell.focusMode = notebookBrowser_1.CellFocusMode.Editor;
                        await this.revealRangeInCenterIfOutsideViewportAsync(cell, new range_1.$ks(selection.startLineNumber, selection.startColumn, selection.endLineNumber || selection.startLineNumber, selection.endColumn || selection.startColumn));
                    }
                    else if (options?.cellRevealType === notebookBrowser_1.CellRevealType.NearTopIfOutsideViewport) {
                        await this.fb.revealCellAsync(cell, notebookBrowser_1.CellRevealType.NearTopIfOutsideViewport);
                    }
                    else {
                        await this.fb.revealCellAsync(cell, notebookBrowser_1.CellRevealType.CenterIfOutsideViewport);
                    }
                    const editor = this.jb.get(cell);
                    if (editor) {
                        if (cellOptions.options?.selection) {
                            const { selection } = cellOptions.options;
                            const editorSelection = new range_1.$ks(selection.startLineNumber, selection.startColumn, selection.endLineNumber || selection.startLineNumber, selection.endColumn || selection.startColumn);
                            editor.setSelection(editorSelection);
                            editor.revealPositionInCenterIfOutsideViewport({
                                lineNumber: selection.startLineNumber,
                                column: selection.startColumn
                            });
                            await this.revealRangeInCenterIfOutsideViewportAsync(cell, editorSelection);
                        }
                        if (!cellOptions.options?.preserveFocus) {
                            editor.focus();
                        }
                    }
                }
            }
            // select cells if options tell to do so
            // todo@rebornix https://github.com/microsoft/vscode/issues/118108 support selections not just focus
            // todo@rebornix support multipe selections
            if (options?.cellSelections) {
                const focusCellIndex = options.cellSelections[0].start;
                const focusedCell = this.viewModel.cellAt(focusCellIndex);
                if (focusedCell) {
                    this.viewModel.updateSelectionsState({
                        kind: notebookCommon_1.SelectionStateType.Index,
                        focus: { start: focusCellIndex, end: focusCellIndex + 1 },
                        selections: options.cellSelections
                    });
                    this.revealInCenterIfOutsideViewport(focusedCell);
                }
            }
            this.oc();
            this.n.fire();
        }
        mc(options) {
            if (options?.indexedCellOptions) {
                // convert index based selections
                const cell = this.cellAt(options.indexedCellOptions.index);
                if (cell) {
                    return {
                        resource: cell.uri,
                        options: {
                            selection: options.indexedCellOptions.selection,
                            preserveFocus: false
                        }
                    };
                }
            }
            return undefined;
        }
        nc() {
            this.mb.clear();
            (0, lifecycle_1.$fc)(this.nb);
            this.fb.detachViewModel();
            this.viewModel?.dispose();
            // avoid event
            this.viewModel = undefined;
            this.bb?.dispose();
            this.bb?.element.remove();
            this.bb = null;
            this.fb.clear();
        }
        oc() {
            if (!this.viewModel) {
                return;
            }
            this.vb.set(!this.viewModel.options.isReadOnly);
            this.ab.classList.toggle('notebook-editor-editable', !this.viewModel.options.isReadOnly);
            this.getDomNode().classList.toggle('notebook-editor-editable', !this.viewModel.options.isReadOnly);
        }
        async pc() {
            if (!this.textModel) {
                return null;
            }
            if (this.cb) {
                return this.cb;
            }
            if (!this.bb) {
                this.qc(this.getId(), this.textModel.viewType, this.textModel.uri);
            }
            this.cb = (async () => {
                if (!this.bb) {
                    throw new Error('Notebook output webview object is not created successfully.');
                }
                await this.bb.createWebview();
                if (!this.bb.webview) {
                    throw new Error('Notebook output webview element was not created successfully.');
                }
                this.mb.add(this.bb.webview.onDidBlur(() => {
                    this.ub.set(false);
                    this.Eb = false;
                    this.updateEditorFocus();
                    this.updateCellFocusMode();
                }));
                this.mb.add(this.bb.webview.onDidFocus(() => {
                    this.ub.set(true);
                    this.updateEditorFocus();
                    this.Eb = true;
                }));
                this.mb.add(this.bb.onMessage(e => {
                    this.I.fire(e);
                }));
                return this.bb;
            })();
            return this.cb;
        }
        qc(id, viewType, resource) {
            if (this.bb) {
                return;
            }
            const that = this;
            this.bb = this.Jb.createInstance(backLayerWebView_1.$2ob, {
                get creationOptions() { return that.creationOptions; },
                setScrollTop(scrollTop) { that.fb.scrollTop = scrollTop; },
                triggerScroll(event) { that.fb.triggerScrollFromMouseWheelEvent(event); },
                getCellByInfo: that.getCellByInfo.bind(that),
                getCellById: that.Tc.bind(that),
                toggleNotebookCellSelection: that.Jc.bind(that),
                focusNotebookCell: that.focusNotebookCell.bind(that),
                focusNextNotebookCell: that.focusNextNotebookCell.bind(that),
                updateOutputHeight: that.Qc.bind(that),
                scheduleOutputHeightAck: that.Sc.bind(that),
                updateMarkupCellHeight: that.Uc.bind(that),
                setMarkupCellEditState: that.Vc.bind(that),
                didStartDragMarkupCell: that.Wc.bind(that),
                didDragMarkupCell: that.Xc.bind(that),
                didDropMarkupCell: that.Yc.bind(that),
                didEndDragMarkupCell: that.Zc.bind(that),
                didResizeOutput: that.$c.bind(that),
                updatePerformanceMetadata: that.ad.bind(that),
                didFocusOutputInputChange: that._didFocusOutputInputChange.bind(that),
            }, id, viewType, resource, {
                ...this.Kb.computeWebviewOptions(),
                fontFamily: this.ac()
            }, this.Mb.getScoped(this.Cb));
            this.bb.element.style.width = '100%';
            // attach the webview container to the DOM tree first
            this.fb.attachWebview(this.bb.element);
        }
        async rc(textModel, viewState, perf) {
            this.qc(this.getId(), textModel.viewType, textModel.uri);
            this.viewModel = this.Jb.createInstance(notebookViewModelImpl_1.$zob, textModel.viewType, textModel, this.kb, this.getLayoutInfo(), { isReadOnly: this.Ib });
            this.kb.eventDispatcher.emit([new notebookViewEvents_1.$mbb({ width: true, fontInfo: true }, this.getLayoutInfo())]);
            this.notebookOptions.updateOptions(this.Ib);
            this.oc();
            this.Yb();
            // restore view states, including contributions
            {
                // restore view state
                this.viewModel.restoreEditorViewState(viewState);
                // contribution state restore
                const contributionsState = viewState?.contributionsState || {};
                for (const [id, contribution] of this.yb) {
                    if (typeof contribution.restoreViewState === 'function') {
                        contribution.restoreViewState(contributionsState[id]);
                    }
                }
            }
            this.mb.add(this.viewModel.onDidChangeViewCells(e => {
                this.g.fire(e);
            }));
            this.mb.add(this.viewModel.onDidChangeSelection(() => {
                this.w.fire();
                this.Oc();
            }));
            this.mb.add(this.fb.onWillScroll(e => {
                if (this.bb?.isResolved()) {
                    this.db.style.transform = `translateY(${e.scrollTop})`;
                }
            }));
            let hasPendingChangeContentHeight = false;
            this.mb.add(this.fb.onDidChangeContentHeight(() => {
                if (hasPendingChangeContentHeight) {
                    return;
                }
                hasPendingChangeContentHeight = true;
                this.mb.add(DOM.$vO(() => {
                    hasPendingChangeContentHeight = false;
                    this.Pc();
                }, 100));
            }));
            this.mb.add(this.fb.onDidRemoveOutputs(outputs => {
                outputs.forEach(output => this.removeInset(output));
            }));
            this.mb.add(this.fb.onDidHideOutputs(outputs => {
                outputs.forEach(output => this.hideInset(output));
            }));
            this.mb.add(this.fb.onDidRemoveCellsFromView(cells => {
                const hiddenCells = [];
                const deletedCells = [];
                for (const cell of cells) {
                    if (cell.cellKind === notebookCommon_1.CellKind.Markup) {
                        const mdCell = cell;
                        if (this.viewModel?.viewCells.find(cell => cell.handle === mdCell.handle)) {
                            // Cell has been folded but is still in model
                            hiddenCells.push(mdCell);
                        }
                        else {
                            // Cell was deleted
                            deletedCells.push(mdCell);
                        }
                    }
                }
                this.hideMarkupPreviews(hiddenCells);
                this.deleteMarkupPreviews(deletedCells);
            }));
            // init rendering
            await this.wc(this.viewModel, viewState);
            perf?.mark('customMarkdownLoaded');
            // model attached
            this.nb = this.viewModel.viewCells.map(cell => this.sc(cell));
            this.tc = this.viewModel.viewCells.find(viewCell => this.getActiveCell() === viewCell && viewCell.focusMode === notebookBrowser_1.CellFocusMode.Editor) ?? null;
            this.mb.add(this.viewModel.onDidChangeViewCells((e) => {
                if (this.Gb) {
                    return;
                }
                // update cell listener
                [...e.splices].reverse().forEach(splice => {
                    const [start, deleted, newCells] = splice;
                    const deletedCells = this.nb.splice(start, deleted, ...newCells.map(cell => this.sc(cell)));
                    (0, lifecycle_1.$fc)(deletedCells);
                });
                if (e.splices.some(s => s[2].some(cell => cell.cellKind === notebookCommon_1.CellKind.Markup))) {
                    this.jc();
                }
            }));
            if (this.pb) {
                this.fb.layout(this.Bc(this.pb.height), this.pb.width);
            }
            else {
                this.fb.layout();
            }
            this.hb?.clearGlobalDragState();
            // restore list state at last, it must be after list layout
            this.restoreListViewState(viewState);
        }
        sc(cell) {
            const store = new lifecycle_1.$jc();
            store.add(cell.onDidChangeLayout(e => {
                // e.totalHeight will be false it's not changed
                if (e.totalHeight || e.outerWidth) {
                    this.layoutNotebookCell(cell, cell.layoutInfo.totalHeight, e.context);
                }
            }));
            if (cell.cellKind === notebookCommon_1.CellKind.Code) {
                store.add(cell.onDidRemoveOutputs((outputs) => {
                    outputs.forEach(output => this.removeInset(output));
                }));
            }
            store.add(cell.onDidChangeState(e => {
                if (e.inputCollapsedChanged && cell.isInputCollapsed && cell.cellKind === notebookCommon_1.CellKind.Markup) {
                    this.hideMarkupPreviews([cell]);
                }
                if (e.outputCollapsedChanged && cell.isOutputCollapsed && cell.cellKind === notebookCommon_1.CellKind.Code) {
                    cell.outputsViewModels.forEach(output => this.hideInset(output));
                }
                if (e.focusModeChanged) {
                    this.uc(cell);
                }
            }));
            return store;
        }
        uc(cell) {
            if (cell.focusMode !== notebookBrowser_1.CellFocusMode.Editor) {
                return;
            }
            if (this.tc && this.tc !== cell) {
                this.tc.focusMode = notebookBrowser_1.CellFocusMode.Container;
            }
            this.tc = cell;
        }
        async wc(viewModel, viewState) {
            this.logService.debug('NotebookEditorWidget', 'warmup ' + this.viewModel?.uri.toString());
            await this.pc();
            this.logService.debug('NotebookEditorWidget', 'warmup - webview resolved');
            // make sure that the webview is not visible otherwise users will see pre-rendered markdown cells in wrong position as the list view doesn't have a correct `top` offset yet
            this.bb.element.style.visibility = 'hidden';
            // warm up can take around 200ms to load markdown libraries, etc.
            await this.xc(viewModel, viewState);
            this.logService.debug('NotebookEditorWidget', 'warmup - viewport warmed up');
            // todo@rebornix @mjbvz, is this too complicated?
            /* now the webview is ready, and requests to render markdown are fast enough
             * we can start rendering the list view
             * render
             *   - markdown cell -> request to webview to (10ms, basically just latency between UI and iframe)
             *   - code cell -> render in place
             */
            this.fb.layout(0, 0);
            this.fb.attachViewModel(viewModel);
            // now the list widget has a correct contentHeight/scrollHeight
            // setting scrollTop will work properly
            // after setting scroll top, the list view will update `top` of the scrollable element, e.g. `top: -584px`
            this.fb.scrollTop = viewState?.scrollPosition?.top ?? 0;
            this.Xb('finish initial viewport warmup and view state restore.');
            this.bb.element.style.visibility = 'visible';
            this.logService.debug('NotebookEditorWidget', 'warmup - list view model attached, set to visible');
            this.m.fire();
        }
        async xc(viewModel, viewState) {
            if (viewState && viewState.cellTotalHeights) {
                const totalHeightCache = viewState.cellTotalHeights;
                const scrollTop = viewState.scrollPosition?.top ?? 0;
                const scrollBottom = scrollTop + Math.max(this.pb?.height ?? 0, 1080);
                let offset = 0;
                const requests = [];
                for (let i = 0; i < viewModel.length; i++) {
                    const cell = viewModel.cellAt(i);
                    const cellHeight = totalHeightCache[i] ?? 0;
                    if (offset + cellHeight < scrollTop) {
                        offset += cellHeight;
                        continue;
                    }
                    if (cell.cellKind === notebookCommon_1.CellKind.Markup) {
                        requests.push([cell, offset]);
                    }
                    offset += cellHeight;
                    if (offset > scrollBottom) {
                        break;
                    }
                }
                await this.bb.initializeMarkup(requests.map(([model, offset]) => this.yc(model, offset)));
            }
            else {
                const initRequests = viewModel.viewCells
                    .filter(cell => cell.cellKind === notebookCommon_1.CellKind.Markup)
                    .slice(0, 5)
                    .map(cell => this.yc(cell, -10000));
                await this.bb.initializeMarkup(initRequests);
                // no cached view state so we are rendering the first viewport
                // after above async call, we already get init height for markdown cells, we can update their offset
                let offset = 0;
                const offsetUpdateRequests = [];
                const scrollBottom = Math.max(this.pb?.height ?? 0, 1080);
                for (const cell of viewModel.viewCells) {
                    if (cell.cellKind === notebookCommon_1.CellKind.Markup) {
                        offsetUpdateRequests.push({ id: cell.id, top: offset });
                    }
                    offset += cell.getHeight(this.getLayoutInfo().fontInfo.lineHeight);
                    if (offset > scrollBottom) {
                        break;
                    }
                }
                this.bb?.updateScrollTops([], offsetUpdateRequests);
            }
        }
        yc(model, offset) {
            return ({
                mime: model.mime,
                cellId: model.id,
                cellHandle: model.handle,
                content: model.getText(),
                offset: offset,
                visible: false,
                metadata: model.metadata,
            });
        }
        restoreListViewState(viewState) {
            if (!this.viewModel) {
                return;
            }
            if (viewState?.scrollPosition !== undefined) {
                this.fb.scrollTop = viewState.scrollPosition.top;
                this.fb.scrollLeft = viewState.scrollPosition.left;
            }
            else {
                this.fb.scrollTop = 0;
                this.fb.scrollLeft = 0;
            }
            const focusIdx = typeof viewState?.focus === 'number' ? viewState.focus : 0;
            if (focusIdx < this.viewModel.length) {
                const element = this.viewModel.cellAt(focusIdx);
                if (element) {
                    this.viewModel?.updateSelectionsState({
                        kind: notebookCommon_1.SelectionStateType.Handle,
                        primary: element.handle,
                        selections: [element.handle]
                    });
                }
            }
            else if (this.fb.length > 0) {
                this.viewModel.updateSelectionsState({
                    kind: notebookCommon_1.SelectionStateType.Index,
                    focus: { start: 0, end: 1 },
                    selections: [{ start: 0, end: 1 }]
                });
            }
            if (viewState?.editorFocused) {
                const cell = this.viewModel.cellAt(focusIdx);
                if (cell) {
                    cell.focusMode = notebookBrowser_1.CellFocusMode.Editor;
                }
            }
        }
        zc(viewState) {
            if (viewState?.selectedKernelId && this.textModel) {
                const matching = this.Ob.getMatchingKernel(this.textModel);
                const kernel = matching.all.find(k => k.id === viewState.selectedKernelId);
                // Selected kernel may have already been picked prior to the view state loading
                // If so, don't overwrite it with the saved kernel.
                if (kernel && !matching.selected) {
                    this.Ob.selectKernelForNotebook(kernel, this.textModel);
                }
            }
        }
        getEditorViewState() {
            const state = this.viewModel?.getEditorViewState();
            if (!state) {
                return {
                    editingCells: {},
                    cellLineNumberStates: {},
                    editorViewStates: {},
                    collapsedInputCells: {},
                    collapsedOutputCells: {},
                };
            }
            if (this.fb) {
                state.scrollPosition = { left: this.fb.scrollLeft, top: this.fb.scrollTop };
                const cellHeights = {};
                for (let i = 0; i < this.viewModel.length; i++) {
                    const elm = this.viewModel.cellAt(i);
                    cellHeights[i] = elm.layoutInfo.totalHeight;
                }
                state.cellTotalHeights = cellHeights;
                if (this.viewModel) {
                    const focusRange = this.viewModel.getFocus();
                    const element = this.viewModel.cellAt(focusRange.start);
                    if (element) {
                        const itemDOM = this.fb.domElementOfElement(element);
                        const editorFocused = element.getEditState() === notebookBrowser_1.CellEditState.Editing && !!(document.activeElement && itemDOM && itemDOM.contains(document.activeElement));
                        state.editorFocused = editorFocused;
                        state.focus = focusRange.start;
                    }
                }
            }
            // Save contribution view states
            const contributionsState = {};
            for (const [id, contribution] of this.yb) {
                if (typeof contribution.saveViewState === 'function') {
                    contributionsState[id] = contribution.saveViewState();
                }
            }
            state.contributionsState = contributionsState;
            if (this.textModel?.uri.scheme === network_1.Schemas.untitled) {
                state.selectedKernelId = this.activeKernel?.id;
            }
            return state;
        }
        Ac() {
            return this.zb && !this.isEmbedded;
        }
        Bc(dimensionHeight) {
            return Math.max(dimensionHeight - (this.R?.useGlobalToolbar ? /** Toolbar height */ 26 : 0), 0);
        }
        layout(dimension, shadowElement, position) {
            if (!shadowElement && this.sb === null) {
                this.pb = dimension;
                this.qb = position;
                return;
            }
            if (dimension.width <= 0 || dimension.height <= 0) {
                this.onWillHide();
                return;
            }
            if (shadowElement) {
                this.Cc(shadowElement, dimension, position);
            }
            if (this.sb && this.sb.width <= 0 && this.sb.height <= 0) {
                this.onWillHide();
                return;
            }
            this.pb = dimension;
            this.qb = position;
            const newBodyHeight = this.Bc(dimension.height);
            DOM.$DO(this.Y, dimension.width, newBodyHeight);
            const topInserToolbarHeight = this.Kb.computeTopInsertToolbarHeight(this.viewModel?.viewType);
            const newCellListHeight = newBodyHeight;
            if (this.fb.getRenderHeight() < newCellListHeight) {
                // the new dimension is larger than the list viewport, update its additional height first, otherwise the list view will move down a bit (as the `scrollBottom` will move down)
                this.fb.updateOptions({ paddingBottom: this.Ac() ? Math.max(0, (newCellListHeight - 50)) : 0, paddingTop: topInserToolbarHeight });
                this.fb.layout(newCellListHeight, dimension.width);
            }
            else {
                // the new dimension is smaller than the list viewport, if we update the additional height, the `scrollBottom` will move up, which moves the whole list view upwards a bit. So we run a layout first.
                this.fb.layout(newCellListHeight, dimension.width);
                this.fb.updateOptions({ paddingBottom: this.Ac() ? Math.max(0, (newCellListHeight - 50)) : 0, paddingTop: topInserToolbarHeight });
            }
            this.P.style.visibility = 'visible';
            this.P.style.display = 'block';
            this.P.style.position = 'absolute';
            this.P.style.overflow = 'hidden';
            this.Dc(dimension, position);
            if (this.db) {
                this.db.style.height = `${dimension.height}px`;
                this.db.style.width = `${dimension.width}px`;
            }
            this.R.layout(this.pb);
            this.X.layout();
            this.kb?.eventDispatcher.emit([new notebookViewEvents_1.$mbb({ width: true, fontInfo: true }, this.getLayoutInfo())]);
        }
        Cc(shadowElement, dimension, position) {
            this.rb = shadowElement;
            if (dimension && position) {
                this.sb = {
                    height: dimension.height,
                    width: dimension.width,
                    top: position.top,
                    left: position.left,
                };
            }
            else {
                // We have to recompute position and size ourselves (which is slow)
                const containerRect = shadowElement.getBoundingClientRect();
                this.sb = {
                    height: containerRect.height,
                    width: containerRect.width,
                    top: containerRect.top,
                    left: containerRect.left
                };
            }
        }
        Dc(dimension, position) {
            if (dimension && position) {
                this.P.style.top = `${position.top}px`;
                this.P.style.left = `${position.left}px`;
                this.P.style.width = `${dimension.width}px`;
                this.P.style.height = `${dimension.height}px`;
                return;
            }
            if (!this.sb) {
                return;
            }
            const elementContainerRect = this.P.parentElement?.getBoundingClientRect();
            this.P.style.top = `${this.sb.top - (elementContainerRect?.top || 0)}px`;
            this.P.style.left = `${this.sb.left - (elementContainerRect?.left || 0)}px`;
            this.P.style.width = `${dimension ? dimension.width : this.sb.width}px`;
            this.P.style.height = `${dimension ? dimension.height : this.sb.height}px`;
        }
        //#endregion
        //#region Focus tracker
        focus() {
            this.Fb = true;
            this.tb.set(true);
            if (this.Eb) {
                this.bb?.focusWebview();
            }
            else {
                if (this.viewModel) {
                    const focusRange = this.viewModel.getFocus();
                    const element = this.viewModel.cellAt(focusRange.start);
                    // The notebook editor doesn't have focus yet
                    if (!this.hasEditorFocus()) {
                        this.focusContainer();
                        // trigger editor to update as FocusTracker might not emit focus change event
                        this.updateEditorFocus();
                    }
                    if (element && element.focusMode === notebookBrowser_1.CellFocusMode.Editor) {
                        element.updateEditState(notebookBrowser_1.CellEditState.Editing, 'editorWidget.focus');
                        element.focusMode = notebookBrowser_1.CellFocusMode.Editor;
                        this.Ec(element);
                        return;
                    }
                }
                this.fb.domFocus();
            }
            if (this.Lb) {
                // The editor forces progress to hide when switching editors. So if progress should be visible, force it to show when the editor is focused.
                this.showProgress();
            }
        }
        onShow() {
            this.Fb = true;
        }
        Ec(activeElement) {
            for (const [element, editor] of this.jb.entries()) {
                if (element === activeElement) {
                    editor.focus();
                    return;
                }
            }
        }
        focusContainer() {
            if (this.Eb) {
                this.bb?.focusWebview();
            }
            else {
                this.fb.focusContainer();
            }
        }
        onWillHide() {
            this.Fb = false;
            this.tb.set(false);
            this.P.style.visibility = 'hidden';
            this.P.style.left = '-50000px';
            this.Q.style.display = 'none';
            this.Fc();
        }
        Fc() {
            this.jb.forEach((editor, cell) => {
                if (this.getActiveCell() === cell && editor) {
                    suggestController_1.$G6.get(editor)?.cancelSuggestWidget();
                    dropIntoEditorController_1.$r7.get(editor)?.clearWidgets();
                    copyPasteController_1.$i7.get(editor)?.clearWidgets();
                }
            });
        }
        Gc() {
            return DOM.$NO(document.activeElement, this.getDomNode());
        }
        updateEditorFocus() {
            // Note - focus going to the webview will fire 'blur', but the webview element will be
            // a descendent of the notebook editor root.
            this.Db.refreshState();
            const focused = this.Gc();
            this.tb.set(focused);
            this.viewModel?.setEditorFocus(focused);
        }
        updateCellFocusMode() {
            const activeCell = this.getActiveCell();
            if (activeCell?.focusMode === notebookBrowser_1.CellFocusMode.Output && !this.Eb) {
                // output previously has focus, but now it's blurred.
                activeCell.focusMode = notebookBrowser_1.CellFocusMode.Container;
            }
        }
        hasEditorFocus() {
            // _editorFocus is driven by the FocusTracker, which is only guaranteed to _eventually_ fire blur.
            // If we need to know whether we have focus at this instant, we need to check the DOM manually.
            this.updateEditorFocus();
            return this.Gc();
        }
        hasWebviewFocus() {
            return this.Eb;
        }
        hasOutputTextSelection() {
            if (!this.hasEditorFocus()) {
                return false;
            }
            const windowSelection = window.getSelection();
            if (windowSelection?.rangeCount !== 1) {
                return false;
            }
            const activeSelection = windowSelection.getRangeAt(0);
            if (activeSelection.startContainer === activeSelection.endContainer && activeSelection.endOffset - activeSelection.startOffset === 0) {
                return false;
            }
            let container = activeSelection.commonAncestorContainer;
            if (!this.Y.contains(container)) {
                return false;
            }
            while (container
                &&
                    container !== this.Y) {
                if (container.classList && container.classList.contains('output')) {
                    return true;
                }
                container = container.parentNode;
            }
            return false;
        }
        _didFocusOutputInputChange(hasFocus) {
            this.xb.set(hasFocus);
        }
        //#endregion
        //#region Editor Features
        focusElement(cell) {
            this.viewModel?.updateSelectionsState({
                kind: notebookCommon_1.SelectionStateType.Handle,
                primary: cell.handle,
                selections: [cell.handle]
            });
        }
        get scrollTop() {
            return this.fb.scrollTop;
        }
        getAbsoluteTopOfElement(cell) {
            return this.fb.getCellViewScrollTop(cell);
        }
        scrollToBottom() {
            this.fb.scrollToBottom();
        }
        setScrollTop(scrollTop) {
            this.fb.scrollTop = scrollTop;
        }
        revealCellRangeInView(range) {
            return this.fb.revealCellsInView(range);
        }
        revealInView(cell) {
            this.fb.revealCell(cell, 1 /* CellRevealSyncType.Default */);
        }
        revealInViewAtTop(cell) {
            this.fb.revealCell(cell, 2 /* CellRevealSyncType.Top */);
        }
        revealInCenter(cell) {
            this.fb.revealCell(cell, 3 /* CellRevealSyncType.Center */);
        }
        revealInCenterIfOutsideViewport(cell) {
            this.fb.revealCell(cell, 4 /* CellRevealSyncType.CenterIfOutsideViewport */);
        }
        revealFirstLineIfOutsideViewport(cell) {
            this.fb.revealCell(cell, 5 /* CellRevealSyncType.FirstLineIfOutsideViewport */);
        }
        async revealLineInViewAsync(cell, line) {
            return this.fb.revealCellRangeAsync(cell, new range_1.$ks(line, 1, line, 1), notebookBrowser_1.CellRevealRangeType.Default);
        }
        async revealLineInCenterAsync(cell, line) {
            return this.fb.revealCellRangeAsync(cell, new range_1.$ks(line, 1, line, 1), notebookBrowser_1.CellRevealRangeType.Center);
        }
        async revealLineInCenterIfOutsideViewportAsync(cell, line) {
            return this.fb.revealCellRangeAsync(cell, new range_1.$ks(line, 1, line, 1), notebookBrowser_1.CellRevealRangeType.CenterIfOutsideViewport);
        }
        async revealRangeInViewAsync(cell, range) {
            return this.fb.revealCellRangeAsync(cell, range, notebookBrowser_1.CellRevealRangeType.Default);
        }
        async revealRangeInCenterAsync(cell, range) {
            return this.fb.revealCellRangeAsync(cell, range, notebookBrowser_1.CellRevealRangeType.Center);
        }
        async revealRangeInCenterIfOutsideViewportAsync(cell, range) {
            return this.fb.revealCellRangeAsync(cell, range, notebookBrowser_1.CellRevealRangeType.CenterIfOutsideViewport);
        }
        async revealCellOffsetInCenterAsync(cell, offset) {
            return this.fb.revealCellOffsetInCenterAsync(cell, offset);
        }
        getViewIndexByModelIndex(index) {
            if (!this.gb) {
                return -1;
            }
            const cell = this.viewModel?.viewCells[index];
            if (!cell) {
                return -1;
            }
            return this.gb.getViewIndex(cell);
        }
        getViewHeight(cell) {
            if (!this.gb) {
                return -1;
            }
            return this.gb.getViewHeight(cell);
        }
        getCellRangeFromViewRange(startIndex, endIndex) {
            return this.gb.getCellRangeFromViewRange(startIndex, endIndex);
        }
        getCellsInRange(range) {
            return this.gb.getCellsInRange(range);
        }
        setCellEditorSelection(cell, range) {
            this.fb.setCellEditorSelection(cell, range);
        }
        setHiddenAreas(_ranges) {
            return this.fb.setHiddenAreas(_ranges, true);
        }
        getVisibleRangesPlusViewportAboveAndBelow() {
            return this.gb.getVisibleRangesPlusViewportAboveAndBelow();
        }
        //#endregion
        //#region Decorations
        deltaCellDecorations(oldDecorations, newDecorations) {
            const ret = this.viewModel?.deltaCellDecorations(oldDecorations, newDecorations) || [];
            this.r.fire();
            return ret;
        }
        deltaCellContainerClassNames(cellId, added, removed) {
            this.bb?.deltaCellContainerClassNames(cellId, added, removed);
        }
        changeModelDecorations(callback) {
            return this.viewModel?.changeModelDecorations(callback) || null;
        }
        //#endregion
        //#region Kernel/Execution
        async Hc() {
            if (!this.hasModel()) {
                return;
            }
            const { selected } = this.Ob.getMatchingKernel(this.textModel);
            if (!this.bb?.isResolved()) {
                await this.pc();
            }
            this.bb?.updateKernelPreloads(selected);
        }
        get activeKernel() {
            return this.textModel && this.Ob.getSelectedOrSuggestedKernel(this.textModel);
        }
        async cancelNotebookCells(cells) {
            if (!this.viewModel || !this.hasModel()) {
                return;
            }
            if (!cells) {
                cells = this.viewModel.viewCells;
            }
            return this.Ub.cancelNotebookCellHandles(this.textModel, Array.from(cells).map(cell => cell.handle));
        }
        async executeNotebookCells(cells) {
            if (!this.viewModel || !this.hasModel()) {
                this.logService.info('notebookEditorWidget', 'No NotebookViewModel, cannot execute cells');
                return;
            }
            if (!cells) {
                cells = this.viewModel.viewCells;
            }
            return this.Ub.executeNotebookCells(this.textModel, Array.from(cells).map(c => c.model), this.scopedContextKeyService);
        }
        async layoutNotebookCell(cell, height, context) {
            this.Xb('layout cell', cell.handle, height);
            const viewIndex = this.fb.getViewIndex(cell);
            if (viewIndex === undefined) {
                // the cell is hidden
                return;
            }
            if (this.Ic?.has(cell)) {
                this.Ic?.get(cell).dispose();
            }
            const deferred = new async_1.$2g();
            const doLayout = () => {
                if (this.Gb) {
                    return;
                }
                if (!this.viewModel?.hasCell(cell)) {
                    // Cell removed in the meantime?
                    return;
                }
                if (this.fb.elementHeight(cell) === height) {
                    return;
                }
                this.Ic?.delete(cell);
                if (!this.hasEditorFocus()) {
                    // Do not scroll inactive notebook
                    // https://github.com/microsoft/vscode/issues/145340
                    const cellIndex = this.viewModel?.getCellIndex(cell);
                    const visibleRanges = this.visibleRanges;
                    if (cellIndex !== undefined
                        && visibleRanges && visibleRanges.length && visibleRanges[0].start === cellIndex
                        // cell is partially visible
                        && this.fb.scrollTop > this.getAbsoluteTopOfElement(cell)) {
                        return this.fb.updateElementHeight2(cell, height, Math.min(cellIndex + 1, this.getLength() - 1));
                    }
                }
                this.fb.updateElementHeight2(cell, height);
                deferred.complete(undefined);
            };
            if (this.fb.inRenderingTransaction) {
                const layoutDisposable = DOM.$vO(doLayout);
                this.Ic?.set(cell, (0, lifecycle_1.$ic)(() => {
                    layoutDisposable.dispose();
                    deferred.complete(undefined);
                }));
            }
            else {
                doLayout();
            }
            return deferred.p;
        }
        getActiveCell() {
            const elements = this.fb.getFocusedElements();
            if (elements && elements.length) {
                return elements[0];
            }
            return undefined;
        }
        Jc(selectedCell, selectFromPrevious) {
            const currentSelections = this.fb.getSelectedElements();
            const isSelected = currentSelections.includes(selectedCell);
            const previousSelection = selectFromPrevious ? currentSelections[currentSelections.length - 1] ?? selectedCell : selectedCell;
            const selectedIndex = this.fb.getViewIndex(selectedCell);
            const previousIndex = this.fb.getViewIndex(previousSelection);
            const cellsInSelectionRange = this.Kc(selectedIndex, previousIndex);
            if (isSelected) {
                // Deselect
                this.fb.selectElements(currentSelections.filter(current => !cellsInSelectionRange.includes(current)));
            }
            else {
                // Add to selection
                this.focusElement(selectedCell);
                this.fb.selectElements([...currentSelections.filter(current => !cellsInSelectionRange.includes(current)), ...cellsInSelectionRange]);
            }
        }
        Kc(fromInclusive, toInclusive) {
            const selectedCellsInRange = [];
            for (let index = 0; index < this.fb.length; ++index) {
                const cell = this.fb.element(index);
                if (cell) {
                    if ((index >= fromInclusive && index <= toInclusive) || (index >= toInclusive && index <= fromInclusive)) {
                        selectedCellsInRange.push(cell);
                    }
                }
            }
            return selectedCellsInRange;
        }
        async focusNotebookCell(cell, focusItem, options) {
            if (this.Gb) {
                return;
            }
            if (focusItem === 'editor') {
                this.focusElement(cell);
                this.fb.focusView();
                cell.updateEditState(notebookBrowser_1.CellEditState.Editing, 'focusNotebookCell');
                cell.focusMode = notebookBrowser_1.CellFocusMode.Editor;
                if (!options?.skipReveal) {
                    if (typeof options?.focusEditorLine === 'number') {
                        this.wb.set(true);
                        await this.revealLineInViewAsync(cell, options.focusEditorLine);
                        const editor = this.jb.get(cell);
                        const focusEditorLine = options.focusEditorLine;
                        editor?.setSelection({
                            startLineNumber: focusEditorLine,
                            startColumn: 1,
                            endLineNumber: focusEditorLine,
                            endColumn: 1
                        });
                    }
                    else {
                        const selectionsStartPosition = cell.getSelectionsStartPosition();
                        if (selectionsStartPosition?.length) {
                            const firstSelectionPosition = selectionsStartPosition[0];
                            await this.revealRangeInCenterIfOutsideViewportAsync(cell, range_1.$ks.fromPositions(firstSelectionPosition, firstSelectionPosition));
                        }
                        else {
                            this.revealInCenterIfOutsideViewport(cell);
                        }
                    }
                }
            }
            else if (focusItem === 'output') {
                this.focusElement(cell);
                if (!this.hasEditorFocus()) {
                    this.fb.focusView();
                }
                if (!this.bb) {
                    return;
                }
                const focusElementId = options?.outputId ?? cell.id;
                this.bb.focusOutput(focusElementId, options?.altOutputId, this.Eb);
                cell.updateEditState(notebookBrowser_1.CellEditState.Preview, 'focusNotebookCell');
                cell.focusMode = notebookBrowser_1.CellFocusMode.Output;
                if (!options?.skipReveal) {
                    this.revealInCenterIfOutsideViewport(cell);
                }
            }
            else {
                // focus container
                const itemDOM = this.fb.domElementOfElement(cell);
                if (document.activeElement && itemDOM && itemDOM.contains(document.activeElement)) {
                    document.activeElement.blur();
                }
                cell.updateEditState(notebookBrowser_1.CellEditState.Preview, 'focusNotebookCell');
                cell.focusMode = notebookBrowser_1.CellFocusMode.Container;
                this.focusElement(cell);
                if (!options?.skipReveal) {
                    if (typeof options?.focusEditorLine === 'number') {
                        this.wb.set(true);
                        this.revealInView(cell);
                    }
                    else if (options?.revealBehavior === notebookBrowser_1.ScrollToRevealBehavior.fullCell) {
                        this.revealInView(cell);
                    }
                    else if (options?.revealBehavior === notebookBrowser_1.ScrollToRevealBehavior.firstLine) {
                        this.revealFirstLineIfOutsideViewport(cell);
                    }
                    else {
                        this.revealInCenterIfOutsideViewport(cell);
                    }
                }
                this.fb.focusView();
                this.updateEditorFocus();
            }
        }
        async focusNextNotebookCell(cell, focusItem) {
            const idx = this.viewModel?.getCellIndex(cell);
            if (typeof idx !== 'number') {
                return;
            }
            const newCell = this.viewModel?.cellAt(idx + 1);
            if (!newCell) {
                return;
            }
            await this.focusNotebookCell(newCell, focusItem);
        }
        //#endregion
        //#region Find
        async Lc(viewCell) {
            if (viewCell.isOutputCollapsed) {
                return;
            }
            const outputs = viewCell.outputsViewModels;
            for (const output of outputs.slice(0, codeCellViewModel_1.$Qnb)) {
                const [mimeTypes, pick] = output.resolveMimeTypes(this.textModel, undefined);
                if (!mimeTypes.find(mimeType => mimeType.isTrusted) || mimeTypes.length === 0) {
                    continue;
                }
                const pickedMimeTypeRenderer = mimeTypes[pick];
                if (!pickedMimeTypeRenderer) {
                    return;
                }
                const renderer = this.Pb.getRendererInfo(pickedMimeTypeRenderer.rendererId);
                if (!renderer) {
                    return;
                }
                const result = { type: 1 /* RenderOutputType.Extension */, renderer, source: output, mimeType: pickedMimeTypeRenderer.mimeType };
                const inset = this.bb?.insetMapping.get(result.source);
                if (!inset || !inset.initialized) {
                    const p = new Promise(resolve => {
                        this.B(event_1.Event.any(this.L, this.N)(e => {
                            if (e.model === result.source.model) {
                                resolve();
                            }
                        }));
                    });
                    this.createOutput(viewCell, result, 0, false);
                    await p;
                }
                else {
                    // request to update its visibility
                    this.createOutput(viewCell, result, 0, false);
                }
                return;
            }
        }
        async Mc(includeOutput) {
            if (!this.hasModel() || !this.viewModel) {
                return;
            }
            const cells = this.viewModel.viewCells;
            const requests = [];
            for (let i = 0; i < cells.length; i++) {
                if (cells[i].cellKind === notebookCommon_1.CellKind.Markup && !this.bb.markupPreviewMapping.has(cells[i].id)) {
                    requests.push(this.createMarkupPreview(cells[i]));
                }
            }
            if (includeOutput && this.fb) {
                for (let i = 0; i < this.fb.length; i++) {
                    const cell = this.fb.element(i);
                    if (cell?.cellKind === notebookCommon_1.CellKind.Code) {
                        requests.push(this.Lc(cell));
                    }
                }
            }
            return Promise.all(requests);
        }
        async find(query, options, token, skipWarmup = false, shouldGetSearchPreviewInfo = false, ownerID) {
            if (!this.lb) {
                return [];
            }
            if (!ownerID) {
                ownerID = this.getId();
            }
            const findMatches = this.lb.find(query, options).filter(match => match.length > 0);
            if (!options.includeMarkupPreview && !options.includeOutput) {
                this.bb?.findStop(ownerID);
                return findMatches;
            }
            // search in webview enabled
            const matchMap = {};
            findMatches.forEach(match => {
                matchMap[match.cell.id] = match;
            });
            if (this.bb) {
                // request all outputs to be rendered
                // measure perf
                const start = Date.now();
                await this.Mc(!!options.includeOutput);
                const end = Date.now();
                this.logService.debug('Find', `Warmup time: ${end - start}ms`);
                if (token.isCancellationRequested) {
                    return [];
                }
                const webviewMatches = await this.bb.find(query, { caseSensitive: options.caseSensitive, wholeWord: options.wholeWord, includeMarkup: !!options.includeMarkupPreview, includeOutput: !!options.includeOutput, shouldGetSearchPreviewInfo, ownerID });
                if (token.isCancellationRequested) {
                    return [];
                }
                // attach webview matches to model find matches
                webviewMatches.forEach(match => {
                    const cell = this.lb.viewCells.find(cell => cell.id === match.cellId);
                    if (!cell) {
                        return;
                    }
                    if (match.type === 'preview') {
                        // markup preview
                        if (cell.getEditState() === notebookBrowser_1.CellEditState.Preview && !options.includeMarkupPreview) {
                            return;
                        }
                        if (cell.getEditState() === notebookBrowser_1.CellEditState.Editing && options.includeMarkupInput) {
                            return;
                        }
                    }
                    else {
                        if (!options.includeOutput) {
                            // skip outputs if not included
                            return;
                        }
                    }
                    const exisitingMatch = matchMap[match.cellId];
                    if (exisitingMatch) {
                        exisitingMatch.webviewMatches.push(match);
                    }
                    else {
                        matchMap[match.cellId] = new findModel_1.$xob(this.lb.viewCells.find(cell => cell.id === match.cellId), this.lb.viewCells.findIndex(cell => cell.id === match.cellId), [], [match]);
                    }
                });
            }
            const ret = [];
            this.lb.viewCells.forEach((cell, index) => {
                if (matchMap[cell.id]) {
                    ret.push(new findModel_1.$xob(cell, index, matchMap[cell.id].contentMatches, matchMap[cell.id].webviewMatches));
                }
            });
            return ret;
        }
        async findHighlightCurrent(matchIndex, ownerID) {
            if (!this.bb) {
                return 0;
            }
            return this.bb?.findHighlightCurrent(matchIndex, ownerID ?? this.getId());
        }
        async findUnHighlightCurrent(matchIndex, ownerID) {
            if (!this.bb) {
                return;
            }
            return this.bb?.findUnHighlightCurrent(matchIndex, ownerID ?? this.getId());
        }
        findStop(ownerID) {
            this.bb?.findStop(ownerID ?? this.getId());
        }
        //#endregion
        //#region MISC
        getLayoutInfo() {
            if (!this.fb) {
                throw new Error('Editor is not initalized successfully');
            }
            if (!this.ob) {
                this.Zb();
            }
            return {
                width: this.pb?.width ?? 0,
                height: this.pb?.height ?? 0,
                scrollHeight: this.fb?.getScrollHeight() ?? 0,
                fontInfo: this.ob,
                stickyHeight: this.U?.getCurrentStickyHeight() ?? 0
            };
        }
        async createMarkupPreview(cell) {
            if (!this.bb) {
                return;
            }
            if (!this.bb.isResolved()) {
                await this.pc();
            }
            if (!this.bb || !this.fb.webviewElement) {
                return;
            }
            if (!this.viewModel || !this.fb.viewModel) {
                return;
            }
            if (this.viewModel.getCellIndex(cell) === -1) {
                return;
            }
            if (this.Nc(cell)) {
                return;
            }
            const webviewTop = parseInt(this.fb.webviewElement.domNode.style.top, 10);
            const top = !!webviewTop ? (0 - webviewTop) : 0;
            const cellTop = this.fb.getCellViewScrollTop(cell);
            await this.bb.showMarkupPreview({
                mime: cell.mime,
                cellHandle: cell.handle,
                cellId: cell.id,
                content: cell.getText(),
                offset: cellTop + top,
                visible: true,
                metadata: cell.metadata,
            });
        }
        Nc(cell) {
            const modelIndex = this.viewModel.getCellIndex(cell);
            const foldedRanges = this.viewModel.getHiddenRanges();
            return foldedRanges.some(range => modelIndex >= range.start && modelIndex <= range.end);
        }
        async unhideMarkupPreviews(cells) {
            if (!this.bb) {
                return;
            }
            if (!this.bb.isResolved()) {
                await this.pc();
            }
            await this.bb?.unhideMarkupPreviews(cells.map(cell => cell.id));
        }
        async hideMarkupPreviews(cells) {
            if (!this.bb || !cells.length) {
                return;
            }
            if (!this.bb.isResolved()) {
                await this.pc();
            }
            await this.bb?.hideMarkupPreviews(cells.map(cell => cell.id));
        }
        async deleteMarkupPreviews(cells) {
            if (!this.bb) {
                return;
            }
            if (!this.bb.isResolved()) {
                await this.pc();
            }
            await this.bb?.deleteMarkupPreviews(cells.map(cell => cell.id));
        }
        async Oc() {
            if (!this.bb) {
                return;
            }
            if (!this.bb.isResolved()) {
                await this.pc();
            }
            const selectedCells = this.getSelectionViewModels().map(cell => cell.id);
            // Only show selection when there is more than 1 cell selected
            await this.bb?.updateMarkupPreviewSelections(selectedCells.length > 1 ? selectedCells : []);
        }
        async createOutput(cell, output, offset, createWhenIdle) {
            this.Ab.queue(output.source.model.outputId, async () => {
                if (this.Gb || !this.bb) {
                    return;
                }
                if (!this.bb.isResolved()) {
                    await this.pc();
                }
                if (!this.bb) {
                    return;
                }
                if (!this.fb.webviewElement) {
                    return;
                }
                if (output.type === 1 /* RenderOutputType.Extension */) {
                    this.Mb.prepare(output.renderer.id);
                }
                const webviewTop = parseInt(this.fb.webviewElement.domNode.style.top, 10);
                const top = !!webviewTop ? (0 - webviewTop) : 0;
                const cellTop = this.fb.getCellViewScrollTop(cell) + top;
                const existingOutput = this.bb.insetMapping.get(output.source);
                if (!existingOutput
                    || (!existingOutput.renderer && output.type === 1 /* RenderOutputType.Extension */)) {
                    if (createWhenIdle) {
                        this.bb.requestCreateOutputWhenWebviewIdle({ cellId: cell.id, cellHandle: cell.handle, cellUri: cell.uri, executionId: cell.internalMetadata.executionId }, output, cellTop, offset);
                    }
                    else {
                        this.bb.createOutput({ cellId: cell.id, cellHandle: cell.handle, cellUri: cell.uri, executionId: cell.internalMetadata.executionId }, output, cellTop, offset);
                    }
                }
                else if (existingOutput.renderer
                    && output.type === 1 /* RenderOutputType.Extension */
                    && existingOutput.renderer.id !== output.renderer.id) {
                    // switch mimetype
                    this.bb.removeInsets([output.source]);
                    this.bb.createOutput({ cellId: cell.id, cellHandle: cell.handle, cellUri: cell.uri }, output, cellTop, offset);
                }
                else if (existingOutput.versionId !== output.source.model.versionId) {
                    this.bb.updateOutput({ cellId: cell.id, cellHandle: cell.handle, cellUri: cell.uri, executionId: cell.internalMetadata.executionId }, output, cellTop, offset);
                }
                else {
                    const outputIndex = cell.outputsViewModels.indexOf(output.source);
                    const outputOffset = cell.getOutputOffset(outputIndex);
                    this.bb.updateScrollTops([{
                            cell,
                            output: output.source,
                            cellTop,
                            outputOffset,
                            forceDisplay: !cell.isOutputCollapsed,
                        }], []);
                }
            });
        }
        async updateOutput(cell, output, offset) {
            this.Ab.queue(output.source.model.outputId, async () => {
                if (this.Gb || !this.bb) {
                    return;
                }
                if (!this.bb.isResolved()) {
                    await this.pc();
                }
                if (!this.bb || !this.fb.webviewElement) {
                    return;
                }
                if (!this.bb.insetMapping.has(output.source)) {
                    return this.createOutput(cell, output, offset, false);
                }
                if (output.type === 1 /* RenderOutputType.Extension */) {
                    this.Mb.prepare(output.renderer.id);
                }
                const webviewTop = parseInt(this.fb.webviewElement.domNode.style.top, 10);
                const top = !!webviewTop ? (0 - webviewTop) : 0;
                const cellTop = this.fb.getCellViewScrollTop(cell) + top;
                this.bb.updateOutput({ cellId: cell.id, cellHandle: cell.handle, cellUri: cell.uri }, output, cellTop, offset);
            });
        }
        async copyOutputImage(cellOutput) {
            this.bb?.copyImage(cellOutput);
        }
        removeInset(output) {
            this.Ab.queue(output.model.outputId, async () => {
                if (this.Gb || !this.bb) {
                    return;
                }
                if (this.bb?.isResolved()) {
                    this.bb.removeInsets([output]);
                }
                this.M.fire(output);
            });
        }
        hideInset(output) {
            this.Ab.queue(output.model.outputId, async () => {
                if (this.Gb || !this.bb) {
                    return;
                }
                if (this.bb?.isResolved()) {
                    this.bb.hideInset(output);
                }
            });
        }
        //#region --- webview IPC ----
        postMessage(message) {
            if (this.bb?.isResolved()) {
                this.bb.postKernelMessage(message);
            }
        }
        //#endregion
        addClassName(className) {
            this.P.classList.add(className);
        }
        removeClassName(className) {
            this.P.classList.remove(className);
        }
        cellAt(index) {
            return this.viewModel?.cellAt(index);
        }
        getCellByInfo(cellInfo) {
            const { cellHandle } = cellInfo;
            return this.viewModel?.viewCells.find(vc => vc.handle === cellHandle);
        }
        getCellByHandle(handle) {
            return this.viewModel?.getCellByHandle(handle);
        }
        getCellIndex(cell) {
            return this.viewModel?.getCellIndexByHandle(cell.handle);
        }
        getNextVisibleCellIndex(index) {
            return this.viewModel?.getNextVisibleCellIndex(index);
        }
        getPreviousVisibleCellIndex(index) {
            return this.viewModel?.getPreviousVisibleCellIndex(index);
        }
        Pc() {
            if (this.Gb || !this.bb?.isResolved()) {
                return;
            }
            if (!this.fb.webviewElement) {
                return;
            }
            const scrollHeight = this.fb.scrollHeight;
            this.bb.element.style.height = `${scrollHeight + notebookCellList_1.$Fob * 2}px`;
            const webviewTop = parseInt(this.fb.webviewElement.domNode.style.top, 10);
            const top = !!webviewTop ? (0 - webviewTop) : 0;
            const updateItems = [];
            const removedItems = [];
            this.bb?.insetMapping.forEach((value, key) => {
                const cell = this.viewModel?.getCellByHandle(value.cellInfo.cellHandle);
                if (!cell || !(cell instanceof codeCellViewModel_1.$Rnb)) {
                    return;
                }
                this.viewModel?.viewCells.find(cell => cell.handle === value.cellInfo.cellHandle);
                const viewIndex = this.fb.getViewIndex(cell);
                if (viewIndex === undefined) {
                    return;
                }
                if (cell.outputsViewModels.indexOf(key) < 0) {
                    // output is already gone
                    removedItems.push(key);
                }
                const cellTop = this.fb.getCellViewScrollTop(cell);
                const outputIndex = cell.outputsViewModels.indexOf(key);
                const outputOffset = cell.getOutputOffset(outputIndex);
                updateItems.push({
                    cell,
                    output: key,
                    cellTop: cellTop + top,
                    outputOffset,
                    forceDisplay: false,
                });
            });
            this.bb.removeInsets(removedItems);
            const markdownUpdateItems = [];
            for (const cellId of this.bb.markupPreviewMapping.keys()) {
                const cell = this.viewModel?.viewCells.find(cell => cell.id === cellId);
                if (cell) {
                    const cellTop = this.fb.getCellViewScrollTop(cell);
                    // markdownUpdateItems.push({ id: cellId, top: cellTop });
                    markdownUpdateItems.push({ id: cellId, top: cellTop + top });
                }
            }
            if (markdownUpdateItems.length || updateItems.length) {
                this.Xb('_list.onDidChangeContentHeight/markdown', markdownUpdateItems);
                this.bb?.updateScrollTops(updateItems, markdownUpdateItems);
            }
        }
        //#endregion
        //#region BacklayerWebview delegate
        Qc(cellInfo, output, outputHeight, isInit, source) {
            const cell = this.viewModel?.viewCells.find(vc => vc.handle === cellInfo.cellHandle);
            if (cell && cell instanceof codeCellViewModel_1.$Rnb) {
                const outputIndex = cell.outputsViewModels.indexOf(output);
                if (outputHeight !== 0) {
                    cell.updateOutputMinHeight(0);
                }
                this.Xb('update cell output', cell.handle, outputHeight);
                cell.updateOutputHeight(outputIndex, outputHeight, source);
                this.layoutNotebookCell(cell, cell.layoutInfo.totalHeight);
                if (isInit) {
                    this.J.fire(output);
                }
            }
        }
        Sc(cellInfo, outputId, height) {
            const wasEmpty = this.Rc.size === 0;
            this.Rc.set(outputId, { cellId: cellInfo.cellId, outputId, height });
            if (wasEmpty) {
                DOM.$vO(() => {
                    this.Xb('ack height');
                    this.Pc();
                    this.bb?.ackHeight([...this.Rc.values()]);
                    this.Rc.clear();
                }, -1); // -1 priority because this depends on calls to layoutNotebookCell, and that may be called multiple times before this runs
            }
        }
        Tc(cellId) {
            return this.viewModel?.viewCells.find(vc => vc.id === cellId);
        }
        Uc(cellId, height, isInit) {
            const cell = this.Tc(cellId);
            if (cell && cell instanceof markupCellViewModel_1.$Snb) {
                const { bottomToolbarGap } = this.Kb.computeBottomToolbarDimensions(this.viewModel?.viewType);
                this.Xb('updateMarkdownCellHeight', cell.handle, height + bottomToolbarGap, isInit);
                cell.renderedMarkdownHeight = height;
            }
        }
        Vc(cellId, editState) {
            const cell = this.Tc(cellId);
            if (cell instanceof markupCellViewModel_1.$Snb) {
                this.revealInView(cell);
                cell.updateEditState(editState, 'setMarkdownCellEditState');
            }
        }
        Wc(cellId, event) {
            const cell = this.Tc(cellId);
            if (cell instanceof markupCellViewModel_1.$Snb) {
                const webviewOffset = this.fb.webviewElement ? -parseInt(this.fb.webviewElement.domNode.style.top, 10) : 0;
                this.hb?.startExplicitDrag(cell, event.dragOffsetY - webviewOffset);
            }
        }
        Xc(cellId, event) {
            const cell = this.Tc(cellId);
            if (cell instanceof markupCellViewModel_1.$Snb) {
                const webviewOffset = this.fb.webviewElement ? -parseInt(this.fb.webviewElement.domNode.style.top, 10) : 0;
                this.hb?.explicitDrag(cell, event.dragOffsetY - webviewOffset);
            }
        }
        Yc(cellId, event) {
            const cell = this.Tc(cellId);
            if (cell instanceof markupCellViewModel_1.$Snb) {
                const webviewOffset = this.fb.webviewElement ? -parseInt(this.fb.webviewElement.domNode.style.top, 10) : 0;
                event.dragOffsetY -= webviewOffset;
                this.hb?.explicitDrop(cell, event);
            }
        }
        Zc(cellId) {
            const cell = this.Tc(cellId);
            if (cell instanceof markupCellViewModel_1.$Snb) {
                this.hb?.endExplicitDrag(cell);
            }
        }
        $c(cellId) {
            const cell = this.Tc(cellId);
            if (cell) {
                this.O.fire(cell);
            }
        }
        ad(cellId, executionId, duration, rendererId) {
            if (!this.hasModel()) {
                return;
            }
            const cell = this.Tc(cellId);
            const cellIndex = !cell ? undefined : this.getCellIndex(cell);
            if (cell?.internalMetadata.executionId === executionId && cellIndex !== undefined) {
                const renderDurationMap = cell.internalMetadata.renderDuration || {};
                renderDurationMap[rendererId] = (renderDurationMap[rendererId] ?? 0) + duration;
                this.textModel.applyEdits([
                    {
                        editType: 9 /* CellEditType.PartialInternalMetadata */,
                        index: cellIndex,
                        internalMetadata: {
                            executionId: executionId,
                            renderDuration: renderDurationMap
                        }
                    }
                ], true, undefined, () => undefined, undefined, false);
            }
        }
        //#endregion
        //#region Editor Contributions
        getContribution(id) {
            return (this.yb.get(id) || null);
        }
        //#endregion
        dispose() {
            this.Gb = true;
            // dispose webview first
            this.bb?.dispose();
            this.bb = null;
            this.Nb.removeNotebookEditor(this);
            (0, lifecycle_1.$fc)(this.yb.values());
            this.yb.clear();
            this.mb.clear();
            (0, lifecycle_1.$fc)(this.nb);
            this.fb.dispose();
            this.ib?.dispose();
            this.P.remove();
            this.viewModel?.dispose();
            this.jb.clear();
            this.Hb.forEach(v => v.dispose());
            this.Hb.clear();
            this.W.remove();
            super.dispose();
            // unref
            this.bb = null;
            this.cb = null;
            this.db = null;
            this.hb = null;
            this.ib = null;
            this.lb = undefined;
            this.Bb = null;
            this.R = null;
            this.fb = null;
            this.gb = null;
            this.Ic = null;
            this.eb = null;
        }
        toJSON() {
            return {
                notebookUri: this.viewModel?.uri,
            };
        }
    };
    exports.$Crb = $Crb;
    exports.$Crb = $Crb = __decorate([
        __param(2, instantiation_1.$Ah),
        __param(3, editorGroupsService_1.$5C),
        __param(4, notebookRendererMessagingService_1.$Uob),
        __param(5, notebookEditorService_1.$1rb),
        __param(6, notebookKernelService_1.$Bbb),
        __param(7, notebookService_1.$ubb),
        __param(8, configuration_1.$8h),
        __param(9, contextkey_1.$3i),
        __param(10, layoutService_1.$XT),
        __param(11, contextView_1.$WZ),
        __param(12, telemetry_1.$9k),
        __param(13, notebookExecutionService_1.$aI),
        __param(14, notebookExecutionStateService_1.$_H),
        __param(15, progress_1.$7u),
        __param(16, notebookLoggingService_1.$1ob),
        __param(17, keybinding_1.$2D)
    ], $Crb);
    (0, zIndexRegistry_1.$Smb)(zIndexRegistry_1.ZIndex.Base, 5, 'notebook-progress-bar');
    (0, zIndexRegistry_1.$Smb)(zIndexRegistry_1.ZIndex.Base, 10, 'notebook-list-insertion-indicator');
    (0, zIndexRegistry_1.$Smb)(zIndexRegistry_1.ZIndex.Base, 20, 'notebook-cell-editor-outline');
    (0, zIndexRegistry_1.$Smb)(zIndexRegistry_1.ZIndex.Base, 25, 'notebook-scrollbar');
    (0, zIndexRegistry_1.$Smb)(zIndexRegistry_1.ZIndex.Base, 26, 'notebook-cell-status');
    (0, zIndexRegistry_1.$Smb)(zIndexRegistry_1.ZIndex.Base, 26, 'notebook-folding-indicator');
    (0, zIndexRegistry_1.$Smb)(zIndexRegistry_1.ZIndex.Base, 27, 'notebook-output');
    (0, zIndexRegistry_1.$Smb)(zIndexRegistry_1.ZIndex.Base, 28, 'notebook-cell-bottom-toolbar-container');
    (0, zIndexRegistry_1.$Smb)(zIndexRegistry_1.ZIndex.Base, 29, 'notebook-run-button-container');
    (0, zIndexRegistry_1.$Smb)(zIndexRegistry_1.ZIndex.Base, 29, 'notebook-input-collapse-condicon');
    (0, zIndexRegistry_1.$Smb)(zIndexRegistry_1.ZIndex.Base, 30, 'notebook-cell-output-toolbar');
    (0, zIndexRegistry_1.$Smb)(zIndexRegistry_1.ZIndex.Base, 31, 'notebook-sticky-scroll');
    (0, zIndexRegistry_1.$Smb)(zIndexRegistry_1.ZIndex.Sash, 1, 'notebook-cell-expand-part-button');
    (0, zIndexRegistry_1.$Smb)(zIndexRegistry_1.ZIndex.Sash, 2, 'notebook-cell-toolbar');
    (0, zIndexRegistry_1.$Smb)(zIndexRegistry_1.ZIndex.Sash, 3, 'notebook-cell-toolbar-dropdown-active');
    exports.$Drb = (0, colorRegistry_1.$sv)('notebook.cellBorderColor', {
        dark: (0, colorRegistry_1.$1y)(colorRegistry_1.$Bx, 1),
        light: (0, colorRegistry_1.$1y)(colorRegistry_1.$Bx, 1),
        hcDark: theme_1.$M_,
        hcLight: theme_1.$M_
    }, nls.localize(3, null));
    exports.$Erb = (0, colorRegistry_1.$sv)('notebook.focusedEditorBorder', {
        light: colorRegistry_1.$zv,
        dark: colorRegistry_1.$zv,
        hcDark: colorRegistry_1.$zv,
        hcLight: colorRegistry_1.$zv
    }, nls.localize(4, null));
    exports.$Frb = (0, colorRegistry_1.$sv)('notebookStatusSuccessIcon.foreground', {
        light: debugColors_1.$Dnb,
        dark: debugColors_1.$Dnb,
        hcDark: debugColors_1.$Dnb,
        hcLight: debugColors_1.$Dnb
    }, nls.localize(5, null));
    exports.$Grb = (0, colorRegistry_1.$sv)('notebookEditorOverviewRuler.runningCellForeground', {
        light: debugColors_1.$Dnb,
        dark: debugColors_1.$Dnb,
        hcDark: debugColors_1.$Dnb,
        hcLight: debugColors_1.$Dnb
    }, nls.localize(6, null));
    exports.$Hrb = (0, colorRegistry_1.$sv)('notebookStatusErrorIcon.foreground', {
        light: colorRegistry_1.$wv,
        dark: colorRegistry_1.$wv,
        hcDark: colorRegistry_1.$wv,
        hcLight: colorRegistry_1.$wv
    }, nls.localize(7, null));
    exports.$Irb = (0, colorRegistry_1.$sv)('notebookStatusRunningIcon.foreground', {
        light: colorRegistry_1.$uv,
        dark: colorRegistry_1.$uv,
        hcDark: colorRegistry_1.$uv,
        hcLight: colorRegistry_1.$uv
    }, nls.localize(8, null));
    exports.$Jrb = (0, colorRegistry_1.$sv)('notebook.outputContainerBorderColor', {
        dark: null,
        light: null,
        hcDark: null,
        hcLight: null
    }, nls.localize(9, null));
    exports.$Krb = (0, colorRegistry_1.$sv)('notebook.outputContainerBackgroundColor', {
        dark: null,
        light: null,
        hcDark: null,
        hcLight: null
    }, nls.localize(10, null));
    // TODO@rebornix currently also used for toolbar border, if we keep all of this, pick a generic name
    exports.$Lrb = (0, colorRegistry_1.$sv)('notebook.cellToolbarSeparator', {
        dark: color_1.$Os.fromHex('#808080').transparent(0.35),
        light: color_1.$Os.fromHex('#808080').transparent(0.35),
        hcDark: colorRegistry_1.$Av,
        hcLight: colorRegistry_1.$Av
    }, nls.localize(11, null));
    exports.$Mrb = (0, colorRegistry_1.$sv)('notebook.focusedCellBackground', {
        dark: null,
        light: null,
        hcDark: null,
        hcLight: null
    }, nls.localize(12, null));
    exports.$Nrb = (0, colorRegistry_1.$sv)('notebook.selectedCellBackground', {
        dark: colorRegistry_1.$Bx,
        light: colorRegistry_1.$Bx,
        hcDark: null,
        hcLight: null
    }, nls.localize(13, null));
    exports.$Orb = (0, colorRegistry_1.$sv)('notebook.cellHoverBackground', {
        dark: (0, colorRegistry_1.$1y)(exports.$Mrb, .5),
        light: (0, colorRegistry_1.$1y)(exports.$Mrb, .7),
        hcDark: null,
        hcLight: null
    }, nls.localize(14, null));
    exports.$Prb = (0, colorRegistry_1.$sv)('notebook.selectedCellBorder', {
        dark: exports.$Drb,
        light: exports.$Drb,
        hcDark: colorRegistry_1.$Av,
        hcLight: colorRegistry_1.$Av
    }, nls.localize(15, null));
    exports.$Qrb = (0, colorRegistry_1.$sv)('notebook.inactiveSelectedCellBorder', {
        dark: null,
        light: null,
        hcDark: colorRegistry_1.$zv,
        hcLight: colorRegistry_1.$zv
    }, nls.localize(16, null));
    exports.$Rrb = (0, colorRegistry_1.$sv)('notebook.focusedCellBorder', {
        dark: colorRegistry_1.$zv,
        light: colorRegistry_1.$zv,
        hcDark: colorRegistry_1.$zv,
        hcLight: colorRegistry_1.$zv
    }, nls.localize(17, null));
    exports.$Srb = (0, colorRegistry_1.$sv)('notebook.inactiveFocusedCellBorder', {
        dark: exports.$Drb,
        light: exports.$Drb,
        hcDark: exports.$Drb,
        hcLight: exports.$Drb
    }, nls.localize(18, null));
    exports.$Trb = (0, colorRegistry_1.$sv)('notebook.cellStatusBarItemHoverBackground', {
        light: new color_1.$Os(new color_1.$Ls(0, 0, 0, 0.08)),
        dark: new color_1.$Os(new color_1.$Ls(255, 255, 255, 0.15)),
        hcDark: new color_1.$Os(new color_1.$Ls(255, 255, 255, 0.15)),
        hcLight: new color_1.$Os(new color_1.$Ls(0, 0, 0, 0.08)),
    }, nls.localize(19, null));
    exports.$Urb = (0, colorRegistry_1.$sv)('notebook.cellInsertionIndicator', {
        light: colorRegistry_1.$zv,
        dark: colorRegistry_1.$zv,
        hcDark: colorRegistry_1.$zv,
        hcLight: colorRegistry_1.$zv
    }, nls.localize(20, null));
    exports.$Vrb = (0, colorRegistry_1.$sv)('notebookScrollbarSlider.background', {
        dark: colorRegistry_1.$gw,
        light: colorRegistry_1.$gw,
        hcDark: colorRegistry_1.$gw,
        hcLight: colorRegistry_1.$gw
    }, nls.localize(21, null));
    exports.$Wrb = (0, colorRegistry_1.$sv)('notebookScrollbarSlider.hoverBackground', {
        dark: colorRegistry_1.$hw,
        light: colorRegistry_1.$hw,
        hcDark: colorRegistry_1.$hw,
        hcLight: colorRegistry_1.$hw
    }, nls.localize(22, null));
    exports.$Xrb = (0, colorRegistry_1.$sv)('notebookScrollbarSlider.activeBackground', {
        dark: colorRegistry_1.$iw,
        light: colorRegistry_1.$iw,
        hcDark: colorRegistry_1.$iw,
        hcLight: colorRegistry_1.$iw
    }, nls.localize(23, null));
    exports.$Yrb = (0, colorRegistry_1.$sv)('notebook.symbolHighlightBackground', {
        dark: color_1.$Os.fromHex('#ffffff0b'),
        light: color_1.$Os.fromHex('#fdff0033'),
        hcDark: null,
        hcLight: null
    }, nls.localize(24, null));
    exports.$Zrb = (0, colorRegistry_1.$sv)('notebook.cellEditorBackground', {
        light: theme_1.$Iab,
        dark: theme_1.$Iab,
        hcDark: null,
        hcLight: null
    }, nls.localize(25, null));
    const notebookEditorBackground = (0, colorRegistry_1.$sv)('notebook.editorBackground', {
        light: theme_1.$x_,
        dark: theme_1.$x_,
        hcDark: null,
        hcLight: null
    }, nls.localize(26, null));
});
//# sourceMappingURL=notebookEditorWidget.js.map