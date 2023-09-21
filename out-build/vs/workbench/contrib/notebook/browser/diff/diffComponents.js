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
define(["require", "exports", "vs/base/browser/dom", "vs/base/common/lifecycle", "vs/base/common/network", "vs/platform/instantiation/common/instantiation", "vs/workbench/contrib/notebook/browser/diff/diffElementViewModel", "vs/workbench/contrib/notebook/browser/diff/notebookDiffEditorBrowser", "vs/editor/browser/widget/codeEditorWidget", "vs/editor/common/services/model", "vs/editor/common/languages/language", "vs/workbench/contrib/notebook/common/notebookCommon", "vs/platform/contextview/browser/contextView", "vs/platform/actions/common/actions", "vs/platform/keybinding/common/keybinding", "vs/platform/notification/common/notification", "vs/platform/actions/browser/menuEntryActionViewItem", "vs/platform/contextkey/common/contextkey", "vs/workbench/contrib/notebook/browser/view/cellParts/cellActionView", "vs/workbench/contrib/notebook/browser/notebookIcons", "vs/workbench/contrib/notebook/browser/diff/diffElementOutputs", "vs/editor/browser/editorExtensions", "vs/editor/contrib/contextmenu/browser/contextmenu", "vs/editor/contrib/snippet/browser/snippetController2", "vs/editor/contrib/suggest/browser/suggestController", "vs/workbench/contrib/codeEditor/browser/menuPreventer", "vs/workbench/contrib/codeEditor/browser/selectionClipboard", "vs/workbench/contrib/snippets/browser/tabCompletion", "vs/base/browser/ui/iconLabel/iconLabels", "vs/editor/common/services/resolverService", "vs/platform/configuration/common/configuration", "vs/platform/theme/common/themeService", "vs/platform/actions/browser/toolbar", "vs/platform/telemetry/common/telemetry", "vs/workbench/contrib/notebook/browser/diff/diffCellEditorOptions", "vs/platform/accessibility/common/accessibility", "vs/editor/browser/widget/diffEditor/diffEditorWidget"], function (require, exports, DOM, lifecycle_1, network_1, instantiation_1, diffElementViewModel_1, notebookDiffEditorBrowser_1, codeEditorWidget_1, model_1, language_1, notebookCommon_1, contextView_1, actions_1, keybinding_1, notification_1, menuEntryActionViewItem_1, contextkey_1, cellActionView_1, notebookIcons_1, diffElementOutputs_1, editorExtensions_1, contextmenu_1, snippetController2_1, suggestController_1, menuPreventer_1, selectionClipboard_1, tabCompletion_1, iconLabels_1, resolverService_1, configuration_1, themeService_1, toolbar_1, telemetry_1, diffCellEditorOptions_1, accessibility_1, diffEditorWidget_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$TEb = exports.$SEb = exports.$REb = exports.$QEb = void 0;
    function $QEb() {
        return {
            isSimpleWidget: false,
            contributions: editorExtensions_1.EditorExtensionsRegistry.getSomeEditorContributions([
                menuPreventer_1.$0lb.ID,
                selectionClipboard_1.$tqb,
                contextmenu_1.$X6.ID,
                suggestController_1.$G6.ID,
                snippetController2_1.$05.ID,
                tabCompletion_1.$qmb.ID,
            ])
        };
    }
    exports.$QEb = $QEb;
    let PropertyHeader = class PropertyHeader extends lifecycle_1.$kc {
        constructor(cell, propertyHeaderContainer, notebookEditor, accessor, j, m, n, r, s, t, u, w) {
            super();
            this.cell = cell;
            this.propertyHeaderContainer = propertyHeaderContainer;
            this.notebookEditor = notebookEditor;
            this.accessor = accessor;
            this.j = j;
            this.m = m;
            this.n = n;
            this.r = r;
            this.s = s;
            this.t = t;
            this.u = u;
            this.w = w;
        }
        buildHeader() {
            const metadataChanged = this.accessor.checkIfModified(this.cell);
            this.a = DOM.$0O(this.propertyHeaderContainer, DOM.$('.property-folding-indicator'));
            this.a.classList.add(this.accessor.prefix);
            this.y();
            const metadataStatus = DOM.$0O(this.propertyHeaderContainer, DOM.$('div.property-status'));
            this.b = DOM.$0O(metadataStatus, DOM.$('span'));
            this.c = DOM.$0O(metadataStatus, DOM.$('span.property-description'));
            if (metadataChanged) {
                this.b.textContent = this.accessor.changedLabel;
                this.b.style.fontWeight = 'bold';
                if (metadataChanged.reason) {
                    this.c.textContent = metadataChanged.reason;
                }
                this.propertyHeaderContainer.classList.add('modified');
            }
            else {
                this.b.textContent = this.accessor.unChangedLabel;
                this.c.textContent = '';
                this.propertyHeaderContainer.classList.remove('modified');
            }
            const cellToolbarContainer = DOM.$0O(this.propertyHeaderContainer, DOM.$('div.property-toolbar'));
            this.f = new toolbar_1.$L6(cellToolbarContainer, {
                actionViewItemProvider: action => {
                    if (action instanceof actions_1.$Vu) {
                        const item = new cellActionView_1.$lpb(action, undefined, this.m, this.n, this.s, this.t, this.j, this.w);
                        return item;
                    }
                    return undefined;
                }
            }, this.r, this.s, this.j, this.m, this.u);
            this.B(this.f);
            this.f.context = {
                cell: this.cell
            };
            const scopedContextKeyService = this.s.createScoped(cellToolbarContainer);
            this.B(scopedContextKeyService);
            const propertyChanged = notebookDiffEditorBrowser_1.$AEb.bindTo(scopedContextKeyService);
            propertyChanged.set(!!metadataChanged);
            this.h = notebookDiffEditorBrowser_1.$BEb.bindTo(scopedContextKeyService);
            this.g = this.r.createMenu(this.accessor.menuId, scopedContextKeyService);
            this.B(this.g);
            const actions = [];
            (0, menuEntryActionViewItem_1.$B3)(this.g, { shouldForwardArgs: true }, actions);
            this.f.setActions(actions);
            this.B(this.g.onDidChange(() => {
                const actions = [];
                (0, menuEntryActionViewItem_1.$B3)(this.g, { shouldForwardArgs: true }, actions);
                this.f.setActions(actions);
            }));
            this.B(this.notebookEditor.onMouseUp(e => {
                if (!e.event.target) {
                    return;
                }
                const target = e.event.target;
                if (target.classList.contains('codicon-notebook-collapsed') || target.classList.contains('codicon-notebook-expanded')) {
                    const parent = target.parentElement;
                    if (!parent) {
                        return;
                    }
                    if (!parent.classList.contains(this.accessor.prefix)) {
                        return;
                    }
                    if (!parent.classList.contains('property-folding-indicator')) {
                        return;
                    }
                    // folding icon
                    const cellViewModel = e.target;
                    if (cellViewModel === this.cell) {
                        const oldFoldingState = this.accessor.getFoldingState(this.cell);
                        this.accessor.updateFoldingState(this.cell, oldFoldingState === diffElementViewModel_1.PropertyFoldingState.Expanded ? diffElementViewModel_1.PropertyFoldingState.Collapsed : diffElementViewModel_1.PropertyFoldingState.Expanded);
                        this.y();
                        this.accessor.updateInfoRendering(this.cell.renderOutput);
                    }
                }
                return;
            }));
            this.y();
            this.accessor.updateInfoRendering(this.cell.renderOutput);
        }
        refresh() {
            const metadataChanged = this.accessor.checkIfModified(this.cell);
            if (metadataChanged) {
                this.b.textContent = this.accessor.changedLabel;
                this.b.style.fontWeight = 'bold';
                if (metadataChanged.reason) {
                    this.c.textContent = metadataChanged.reason;
                }
                this.propertyHeaderContainer.classList.add('modified');
                const actions = [];
                (0, menuEntryActionViewItem_1.$B3)(this.g, undefined, actions);
                this.f.setActions(actions);
            }
            else {
                this.b.textContent = this.accessor.unChangedLabel;
                this.b.style.fontWeight = 'normal';
                this.c.textContent = '';
                this.propertyHeaderContainer.classList.remove('modified');
                this.f.setActions([]);
            }
        }
        y() {
            if (this.accessor.getFoldingState(this.cell) === diffElementViewModel_1.PropertyFoldingState.Collapsed) {
                DOM.$_O(this.a, (0, iconLabels_1.$yQ)(notebookIcons_1.$Kpb));
                this.h?.set(false);
            }
            else {
                DOM.$_O(this.a, (0, iconLabels_1.$yQ)(notebookIcons_1.$Lpb));
                this.h?.set(true);
            }
        }
    };
    PropertyHeader = __decorate([
        __param(4, contextView_1.$WZ),
        __param(5, keybinding_1.$2D),
        __param(6, notification_1.$Yu),
        __param(7, actions_1.$Su),
        __param(8, contextkey_1.$3i),
        __param(9, themeService_1.$gv),
        __param(10, telemetry_1.$9k),
        __param(11, accessibility_1.$1r)
    ], PropertyHeader);
    class AbstractElementRenderer extends lifecycle_1.$kc {
        constructor(notebookEditor, cell, templateData, style, P, Q, R, S, U, W, X, Y, Z, ab) {
            super();
            this.notebookEditor = notebookEditor;
            this.cell = cell;
            this.templateData = templateData;
            this.style = style;
            this.P = P;
            this.Q = Q;
            this.R = R;
            this.S = S;
            this.U = U;
            this.W = W;
            this.X = X;
            this.Y = Y;
            this.Z = Z;
            this.ab = ab;
            this.a = this.B(new lifecycle_1.$jc());
            this.b = this.B(new lifecycle_1.$jc());
            this.c = false;
            this.f = false;
            // init
            this.O = false;
            this.n = this.B(new lifecycle_1.$jc());
            this.I = this.B(new lifecycle_1.$jc());
            this.B(cell.onDidLayoutChange(e => this.layout(e)));
            this.B(cell.onDidLayoutChange(e => this.updateBorders()));
            this.init();
            this.buildBody();
            this.B(cell.onDidStateChange(() => {
                this.updateOutputRendering(this.cell.renderOutput);
            }));
        }
        buildBody() {
            const body = this.templateData.body;
            this.M = this.templateData.diffEditorContainer;
            body.classList.remove('left', 'right', 'full');
            switch (this.style) {
                case 'left':
                    body.classList.add('left');
                    break;
                case 'right':
                    body.classList.add('right');
                    break;
                default:
                    body.classList.add('full');
                    break;
            }
            this.styleContainer(this.M);
            this.updateSourceEditor();
            this.c = this.ab.getValue('notebook.diff.ignoreMetadata');
            if (this.c) {
                this._disposeMetadata();
            }
            else {
                this._buildMetadata();
            }
            this.f = this.ab.getValue('notebook.diff.ignoreOutputs') || !!(this.notebookEditor.textModel?.transientOptions.transientOutputs);
            if (this.f) {
                this._disposeOutput();
            }
            else {
                this._buildOutput();
            }
            this.B(this.ab.onDidChangeConfiguration(e => {
                let metadataLayoutChange = false;
                let outputLayoutChange = false;
                if (e.affectsConfiguration('notebook.diff.ignoreMetadata')) {
                    const newValue = this.ab.getValue('notebook.diff.ignoreMetadata');
                    if (newValue !== undefined && this.c !== newValue) {
                        this.c = newValue;
                        this.a.clear();
                        if (this.ab.getValue('notebook.diff.ignoreMetadata')) {
                            this._disposeMetadata();
                        }
                        else {
                            this.cell.metadataStatusHeight = 25;
                            this._buildMetadata();
                            this.updateMetadataRendering();
                            metadataLayoutChange = true;
                        }
                    }
                }
                if (e.affectsConfiguration('notebook.diff.ignoreOutputs')) {
                    const newValue = this.ab.getValue('notebook.diff.ignoreOutputs');
                    if (newValue !== undefined && this.f !== (newValue || this.notebookEditor.textModel?.transientOptions.transientOutputs)) {
                        this.f = newValue || !!(this.notebookEditor.textModel?.transientOptions.transientOutputs);
                        this.b.clear();
                        if (this.f) {
                            this._disposeOutput();
                        }
                        else {
                            this.cell.outputStatusHeight = 25;
                            this._buildOutput();
                            outputLayoutChange = true;
                        }
                    }
                }
                if (metadataLayoutChange || outputLayoutChange) {
                    this.layout({ metadataHeight: metadataLayoutChange, outputTotalHeight: outputLayoutChange });
                }
            }));
        }
        updateMetadataRendering() {
            if (this.cell.metadataFoldingState === diffElementViewModel_1.PropertyFoldingState.Expanded) {
                // we should expand the metadata editor
                this.j.style.display = 'block';
                if (!this.m || !this.r) {
                    // create editor
                    this.m = DOM.$0O(this.j, DOM.$('.metadata-editor-container'));
                    this.hb();
                }
                else {
                    this.cell.metadataHeight = this.r.getContentHeight();
                }
            }
            else {
                // we should collapse the metadata editor
                this.j.style.display = 'none';
                // this._metadataEditorDisposeStore.clear();
                this.cell.metadataHeight = 0;
            }
        }
        updateOutputRendering(renderRichOutput) {
            if (this.cell.outputFoldingState === diffElementViewModel_1.PropertyFoldingState.Expanded) {
                this.u.style.display = 'block';
                if (renderRichOutput) {
                    this.eb();
                    this._buildOutputRendererContainer();
                    this._showOutputsRenderer();
                    this.db();
                }
                else {
                    this._hideOutputsRenderer();
                    this.bb();
                    this.cb();
                }
            }
            else {
                this.u.style.display = 'none';
                this.eb();
                this._hideOutputsRenderer();
                this.fb();
            }
        }
        bb() {
            if (!this.w) {
                this.w = DOM.$0O(this.u, DOM.$('.output-editor-container'));
                this.ib();
            }
        }
        cb() {
            if (this.w) {
                this.w.style.display = 'block';
                this.cell.rawOutputHeight = this.J.getContentHeight();
            }
        }
        db() {
            this.cell.layoutChange();
        }
        eb() {
            if (this.w) {
                this.w.style.display = 'none';
                this.cell.rawOutputHeight = 0;
            }
        }
        fb() {
            this.cell.layoutChange();
        }
        gb(currentMetadata, newMetadata) {
            const result = {};
            try {
                const newMetadataObj = JSON.parse(newMetadata);
                const keys = new Set([...Object.keys(newMetadataObj)]);
                for (const key of keys) {
                    switch (key) {
                        case 'inputCollapsed':
                        case 'outputCollapsed':
                            // boolean
                            if (typeof newMetadataObj[key] === 'boolean') {
                                result[key] = newMetadataObj[key];
                            }
                            else {
                                result[key] = currentMetadata[key];
                            }
                            break;
                        default:
                            result[key] = newMetadataObj[key];
                            break;
                    }
                }
                const index = this.notebookEditor.textModel.cells.indexOf(this.cell.modified.textModel);
                if (index < 0) {
                    return;
                }
                this.notebookEditor.textModel.applyEdits([
                    { editType: 3 /* CellEditType.Metadata */, index, metadata: result }
                ], true, undefined, () => undefined, undefined, true);
            }
            catch {
            }
        }
        async hb() {
            this.n.clear();
            if (this.cell instanceof diffElementViewModel_1.$IEb) {
                this.r = this.P.createInstance(diffEditorWidget_1.$6Z, this.m, {
                    ...diffCellEditorOptions_1.$xEb,
                    overflowWidgetsDomNode: this.notebookEditor.getOverflowContainerDomNode(),
                    readOnly: false,
                    originalEditable: false,
                    ignoreTrimWhitespace: false,
                    automaticLayout: false,
                    dimension: {
                        height: this.cell.layoutInfo.metadataHeight,
                        width: this.cell.getComputedCellContainerWidth(this.notebookEditor.getLayoutInfo(), true, true)
                    }
                }, {
                    originalEditor: $QEb(),
                    modifiedEditor: $QEb()
                });
                this.layout({ metadataHeight: true });
                this.n.add(this.r);
                this.m?.classList.add('diff');
                const originalMetadataModel = await this.S.createModelReference(notebookCommon_1.CellUri.generateCellPropertyUri(this.cell.originalDocument.uri, this.cell.original.handle, network_1.Schemas.vscodeNotebookCellMetadata));
                const modifiedMetadataModel = await this.S.createModelReference(notebookCommon_1.CellUri.generateCellPropertyUri(this.cell.modifiedDocument.uri, this.cell.modified.handle, network_1.Schemas.vscodeNotebookCellMetadata));
                this.r.setModel({
                    original: originalMetadataModel.object.textEditorModel,
                    modified: modifiedMetadataModel.object.textEditorModel
                });
                this.n.add(originalMetadataModel);
                this.n.add(modifiedMetadataModel);
                this.cell.metadataHeight = this.r.getContentHeight();
                this.n.add(this.r.onDidContentSizeChange((e) => {
                    if (e.contentHeightChanged && this.cell.metadataFoldingState === diffElementViewModel_1.PropertyFoldingState.Expanded) {
                        this.cell.metadataHeight = e.contentHeight;
                    }
                }));
                let respondingToContentChange = false;
                this.n.add(modifiedMetadataModel.object.textEditorModel.onDidChangeContent(() => {
                    respondingToContentChange = true;
                    const value = modifiedMetadataModel.object.textEditorModel.getValue();
                    this.gb(this.cell.modified.metadata, value);
                    this.h.refresh();
                    respondingToContentChange = false;
                }));
                this.n.add(this.cell.modified.textModel.onDidChangeMetadata(() => {
                    if (respondingToContentChange) {
                        return;
                    }
                    const modifiedMetadataSource = (0, diffElementViewModel_1.$LEb)(this.notebookEditor.textModel, this.cell.modified?.metadata || {}, this.cell.modified?.language);
                    modifiedMetadataModel.object.textEditorModel.setValue(modifiedMetadataSource);
                }));
                return;
            }
            else {
                this.r = this.P.createInstance(codeEditorWidget_1.$uY, this.m, {
                    ...diffCellEditorOptions_1.$wEb,
                    dimension: {
                        width: this.cell.getComputedCellContainerWidth(this.notebookEditor.getLayoutInfo(), false, true),
                        height: this.cell.layoutInfo.metadataHeight
                    },
                    overflowWidgetsDomNode: this.notebookEditor.getOverflowContainerDomNode(),
                    readOnly: false
                }, {});
                this.layout({ metadataHeight: true });
                this.n.add(this.r);
                const mode = this.Q.createById('jsonc');
                const originalMetadataSource = (0, diffElementViewModel_1.$LEb)(this.notebookEditor.textModel, this.cell.type === 'insert'
                    ? this.cell.modified.metadata || {}
                    : this.cell.original.metadata || {});
                const uri = this.cell.type === 'insert'
                    ? this.cell.modified.uri
                    : this.cell.original.uri;
                const handle = this.cell.type === 'insert'
                    ? this.cell.modified.handle
                    : this.cell.original.handle;
                const modelUri = notebookCommon_1.CellUri.generateCellPropertyUri(uri, handle, network_1.Schemas.vscodeNotebookCellMetadata);
                const metadataModel = this.R.createModel(originalMetadataSource, mode, modelUri, false);
                this.r.setModel(metadataModel);
                this.n.add(metadataModel);
                this.cell.metadataHeight = this.r.getContentHeight();
                this.n.add(this.r.onDidContentSizeChange((e) => {
                    if (e.contentHeightChanged && this.cell.metadataFoldingState === diffElementViewModel_1.PropertyFoldingState.Expanded) {
                        this.cell.metadataHeight = e.contentHeight;
                    }
                }));
            }
        }
        ib() {
            this.I.clear();
            if ((this.cell.type === 'modified' || this.cell.type === 'unchanged') && !this.notebookEditor.textModel.transientOptions.transientOutputs) {
                const originalOutputsSource = (0, diffElementViewModel_1.$NEb)(this.cell.original?.outputs || []);
                const modifiedOutputsSource = (0, diffElementViewModel_1.$NEb)(this.cell.modified?.outputs || []);
                if (originalOutputsSource !== modifiedOutputsSource) {
                    const mode = this.Q.createById('json');
                    const originalModel = this.R.createModel(originalOutputsSource, mode, undefined, true);
                    const modifiedModel = this.R.createModel(modifiedOutputsSource, mode, undefined, true);
                    this.I.add(originalModel);
                    this.I.add(modifiedModel);
                    const lineHeight = this.notebookEditor.getLayoutInfo().fontInfo.lineHeight || 17;
                    const lineCount = Math.max(originalModel.getLineCount(), modifiedModel.getLineCount());
                    this.J = this.P.createInstance(diffEditorWidget_1.$6Z, this.w, {
                        ...diffCellEditorOptions_1.$xEb,
                        overflowWidgetsDomNode: this.notebookEditor.getOverflowContainerDomNode(),
                        readOnly: true,
                        ignoreTrimWhitespace: false,
                        automaticLayout: false,
                        dimension: {
                            height: Math.min(diffElementViewModel_1.$GEb, this.cell.layoutInfo.rawOutputHeight || lineHeight * lineCount),
                            width: this.cell.getComputedCellContainerWidth(this.notebookEditor.getLayoutInfo(), false, true)
                        },
                        accessibilityVerbose: this.ab.getValue("accessibility.verbosity.diffEditor" /* AccessibilityVerbositySettingId.DiffEditor */) ?? false
                    }, {
                        originalEditor: $QEb(),
                        modifiedEditor: $QEb()
                    });
                    this.I.add(this.J);
                    this.w?.classList.add('diff');
                    this.J.setModel({
                        original: originalModel,
                        modified: modifiedModel
                    });
                    this.J.restoreViewState(this.cell.getOutputEditorViewState());
                    this.cell.rawOutputHeight = this.J.getContentHeight();
                    this.I.add(this.J.onDidContentSizeChange((e) => {
                        if (e.contentHeightChanged && this.cell.outputFoldingState === diffElementViewModel_1.PropertyFoldingState.Expanded) {
                            this.cell.rawOutputHeight = e.contentHeight;
                        }
                    }));
                    this.I.add(this.cell.modified.textModel.onDidChangeOutputs(() => {
                        const modifiedOutputsSource = (0, diffElementViewModel_1.$NEb)(this.cell.modified?.outputs || []);
                        modifiedModel.setValue(modifiedOutputsSource);
                        this.t.refresh();
                    }));
                    return;
                }
            }
            this.J = this.P.createInstance(codeEditorWidget_1.$uY, this.w, {
                ...diffCellEditorOptions_1.$wEb,
                dimension: {
                    width: Math.min(diffElementViewModel_1.$GEb, this.cell.getComputedCellContainerWidth(this.notebookEditor.getLayoutInfo(), false, this.cell.type === 'unchanged' || this.cell.type === 'modified') - 32),
                    height: this.cell.layoutInfo.rawOutputHeight
                },
                overflowWidgetsDomNode: this.notebookEditor.getOverflowContainerDomNode()
            }, {});
            this.I.add(this.J);
            const mode = this.Q.createById('json');
            const originaloutputSource = (0, diffElementViewModel_1.$NEb)(this.notebookEditor.textModel.transientOptions.transientOutputs
                ? []
                : this.cell.type === 'insert'
                    ? this.cell.modified.outputs || []
                    : this.cell.original.outputs || []);
            const outputModel = this.R.createModel(originaloutputSource, mode, undefined, true);
            this.I.add(outputModel);
            this.J.setModel(outputModel);
            this.J.restoreViewState(this.cell.getOutputEditorViewState());
            this.cell.rawOutputHeight = this.J.getContentHeight();
            this.I.add(this.J.onDidContentSizeChange((e) => {
                if (e.contentHeightChanged && this.cell.outputFoldingState === diffElementViewModel_1.PropertyFoldingState.Expanded) {
                    this.cell.rawOutputHeight = e.contentHeight;
                }
            }));
        }
        jb() {
            this.notebookEditor.layoutNotebookCell(this.cell, this.cell.layoutInfo.totalHeight);
        }
        updateBorders() {
            this.templateData.leftBorder.style.height = `${this.cell.layoutInfo.totalHeight - 32}px`;
            this.templateData.rightBorder.style.height = `${this.cell.layoutInfo.totalHeight - 32}px`;
            this.templateData.bottomBorder.style.top = `${this.cell.layoutInfo.totalHeight - 32}px`;
        }
        dispose() {
            if (this.J) {
                this.cell.saveOutputEditorViewState(this.J.saveViewState());
            }
            if (this.r) {
                this.cell.saveMetadataEditorViewState(this.r.saveViewState());
            }
            this.n.dispose();
            this.I.dispose();
            this.O = true;
            super.dispose();
        }
    }
    class SingleSideDiffElement extends AbstractElementRenderer {
        constructor(notebookEditor, cell, templateData, style, instantiationService, languageService, modelService, textModelService, contextMenuService, keybindingService, notificationService, menuService, contextKeyService, configurationService) {
            super(notebookEditor, cell, templateData, style, instantiationService, languageService, modelService, textModelService, contextMenuService, keybindingService, notificationService, menuService, contextKeyService, configurationService);
            this.cell = cell;
            this.templateData = templateData;
        }
        init() {
            this.N = this.templateData.diagonalFill;
        }
        buildBody() {
            const body = this.templateData.body;
            this.M = this.templateData.diffEditorContainer;
            body.classList.remove('left', 'right', 'full');
            switch (this.style) {
                case 'left':
                    body.classList.add('left');
                    break;
                case 'right':
                    body.classList.add('right');
                    break;
                default:
                    body.classList.add('full');
                    break;
            }
            this.styleContainer(this.M);
            this.updateSourceEditor();
            if (this.ab.getValue('notebook.diff.ignoreMetadata')) {
                this._disposeMetadata();
            }
            else {
                this._buildMetadata();
            }
            if (this.ab.getValue('notebook.diff.ignoreOutputs') || this.notebookEditor.textModel?.transientOptions.transientOutputs) {
                this._disposeOutput();
            }
            else {
                this._buildOutput();
            }
            this.B(this.ab.onDidChangeConfiguration(e => {
                let metadataLayoutChange = false;
                let outputLayoutChange = false;
                if (e.affectsConfiguration('notebook.diff.ignoreMetadata')) {
                    this.a.clear();
                    if (this.ab.getValue('notebook.diff.ignoreMetadata')) {
                        this._disposeMetadata();
                    }
                    else {
                        this.cell.metadataStatusHeight = 25;
                        this._buildMetadata();
                        this.updateMetadataRendering();
                        metadataLayoutChange = true;
                    }
                }
                if (e.affectsConfiguration('notebook.diff.ignoreOutputs')) {
                    this.b.clear();
                    if (this.ab.getValue('notebook.diff.ignoreOutputs') || this.notebookEditor.textModel?.transientOptions.transientOutputs) {
                        this._disposeOutput();
                    }
                    else {
                        this.cell.outputStatusHeight = 25;
                        this._buildOutput();
                        outputLayoutChange = true;
                    }
                }
                if (metadataLayoutChange || outputLayoutChange) {
                    this.layout({ metadataHeight: metadataLayoutChange, outputTotalHeight: outputLayoutChange });
                }
            }));
        }
        _disposeMetadata() {
            this.cell.metadataStatusHeight = 0;
            this.cell.metadataHeight = 0;
            this.templateData.metadataHeaderContainer.style.display = 'none';
            this.templateData.metadataInfoContainer.style.display = 'none';
            this.r = undefined;
        }
        _buildMetadata() {
            this.g = this.templateData.metadataHeaderContainer;
            this.j = this.templateData.metadataInfoContainer;
            this.g.style.display = 'flex';
            this.j.style.display = 'block';
            this.g.innerText = '';
            this.j.innerText = '';
            this.h = this.P.createInstance(PropertyHeader, this.cell, this.g, this.notebookEditor, {
                updateInfoRendering: this.updateMetadataRendering.bind(this),
                checkIfModified: (cell) => {
                    return cell.checkMetadataIfModified();
                },
                getFoldingState: (cell) => {
                    return cell.metadataFoldingState;
                },
                updateFoldingState: (cell, state) => {
                    cell.metadataFoldingState = state;
                },
                unChangedLabel: 'Metadata',
                changedLabel: 'Metadata changed',
                prefix: 'metadata',
                menuId: actions_1.$Ru.NotebookDiffCellMetadataTitle
            });
            this.a.add(this.h);
            this.h.buildHeader();
        }
        _buildOutput() {
            this.templateData.outputHeaderContainer.style.display = 'flex';
            this.templateData.outputInfoContainer.style.display = 'block';
            this.s = this.templateData.outputHeaderContainer;
            this.u = this.templateData.outputInfoContainer;
            this.s.innerText = '';
            this.u.innerText = '';
            this.t = this.P.createInstance(PropertyHeader, this.cell, this.s, this.notebookEditor, {
                updateInfoRendering: this.updateOutputRendering.bind(this),
                checkIfModified: (cell) => {
                    return cell.checkIfOutputsModified();
                },
                getFoldingState: (cell) => {
                    return cell.outputFoldingState;
                },
                updateFoldingState: (cell, state) => {
                    cell.outputFoldingState = state;
                },
                unChangedLabel: 'Outputs',
                changedLabel: 'Outputs changed',
                prefix: 'output',
                menuId: actions_1.$Ru.NotebookDiffCellOutputsTitle
            });
            this.b.add(this.t);
            this.t.buildHeader();
        }
        _disposeOutput() {
            this.eb();
            this._hideOutputsRenderer();
            this.fb();
            this.cell.rawOutputHeight = 0;
            this.cell.outputStatusHeight = 0;
            this.templateData.outputHeaderContainer.style.display = 'none';
            this.templateData.outputInfoContainer.style.display = 'none';
            this.y = undefined;
        }
    }
    let $REb = class $REb extends SingleSideDiffElement {
        constructor(notebookEditor, cell, templateData, languageService, modelService, textModelService, instantiationService, contextMenuService, keybindingService, notificationService, menuService, contextKeyService, configurationService) {
            super(notebookEditor, cell, templateData, 'left', instantiationService, languageService, modelService, textModelService, contextMenuService, keybindingService, notificationService, menuService, contextKeyService, configurationService);
        }
        styleContainer(container) {
            container.classList.remove('inserted');
            container.classList.add('removed');
        }
        updateSourceEditor() {
            const originalCell = this.cell.original;
            const lineCount = originalCell.textModel.textBuffer.getLineCount();
            const lineHeight = this.notebookEditor.getLayoutInfo().fontInfo.lineHeight || 17;
            const editorHeight = lineCount * lineHeight + diffCellEditorOptions_1.$vEb.top + diffCellEditorOptions_1.$vEb.bottom;
            this.kb = this.templateData.sourceEditor;
            this.kb.layout({
                width: (this.notebookEditor.getLayoutInfo().width - 2 * notebookDiffEditorBrowser_1.$yEb) / 2 - 18,
                height: editorHeight
            });
            this.cell.editorHeight = editorHeight;
            this.B(this.kb.onDidContentSizeChange((e) => {
                if (e.contentHeightChanged && this.cell.layoutInfo.editorHeight !== e.contentHeight) {
                    this.cell.editorHeight = e.contentHeight;
                }
            }));
            this.S.createModelReference(originalCell.uri).then(ref => {
                if (this.O) {
                    return;
                }
                this.B(ref);
                const textModel = ref.object.textEditorModel;
                this.kb.setModel(textModel);
                this.cell.editorHeight = this.kb.getContentHeight();
            });
        }
        layout(state) {
            DOM.$vO(() => {
                if (state.editorHeight || state.outerWidth) {
                    this.kb.layout({
                        width: this.cell.getComputedCellContainerWidth(this.notebookEditor.getLayoutInfo(), false, false),
                        height: this.cell.layoutInfo.editorHeight
                    });
                }
                if (state.metadataHeight || state.outerWidth) {
                    this.r?.layout({
                        width: this.cell.getComputedCellContainerWidth(this.notebookEditor.getLayoutInfo(), false, false),
                        height: this.cell.layoutInfo.metadataHeight
                    });
                }
                if (state.outputTotalHeight || state.outerWidth) {
                    this.J?.layout({
                        width: this.cell.getComputedCellContainerWidth(this.notebookEditor.getLayoutInfo(), false, false),
                        height: this.cell.layoutInfo.outputTotalHeight
                    });
                }
                if (this.N) {
                    this.N.style.height = `${this.cell.layoutInfo.totalHeight - 32}px`;
                }
                this.jb();
            });
        }
        _buildOutputRendererContainer() {
            if (!this.y) {
                this.y = DOM.$0O(this.u, DOM.$('.output-view-container'));
                this.F = DOM.$0O(this.y, DOM.$('.output-empty-view'));
                const span = DOM.$0O(this.F, DOM.$('span'));
                span.innerText = 'No outputs to render';
                if (this.cell.original.outputs.length === 0) {
                    this.F.style.display = 'block';
                }
                else {
                    this.F.style.display = 'none';
                }
                this.cell.layoutChange();
                this.G = this.P.createInstance(diffElementOutputs_1.$PEb, this.notebookEditor, this.notebookEditor.textModel, this.cell, this.cell.original, notebookDiffEditorBrowser_1.DiffSide.Original, this.y);
                this.B(this.G);
                this.G.render();
                const removedOutputRenderListener = this.notebookEditor.onDidDynamicOutputRendered(e => {
                    if (e.cell.uri.toString() === this.cell.original.uri.toString()) {
                        this.notebookEditor.deltaCellOutputContainerClassNames(notebookDiffEditorBrowser_1.DiffSide.Original, this.cell.original.id, ['nb-cellDeleted'], []);
                        removedOutputRenderListener.dispose();
                    }
                });
                this.B(removedOutputRenderListener);
            }
            this.y.style.display = 'block';
        }
        _decorate() {
            this.notebookEditor.deltaCellOutputContainerClassNames(notebookDiffEditorBrowser_1.DiffSide.Original, this.cell.original.id, ['nb-cellDeleted'], []);
        }
        _showOutputsRenderer() {
            if (this.y) {
                this.y.style.display = 'block';
                this.G?.showOutputs();
                this._decorate();
            }
        }
        _hideOutputsRenderer() {
            if (this.y) {
                this.y.style.display = 'none';
                this.G?.hideOutputs();
            }
        }
        dispose() {
            if (this.kb) {
                this.cell.saveSpirceEditorViewState(this.kb.saveViewState());
            }
            super.dispose();
        }
    };
    exports.$REb = $REb;
    exports.$REb = $REb = __decorate([
        __param(3, language_1.$ct),
        __param(4, model_1.$yA),
        __param(5, resolverService_1.$uA),
        __param(6, instantiation_1.$Ah),
        __param(7, contextView_1.$WZ),
        __param(8, keybinding_1.$2D),
        __param(9, notification_1.$Yu),
        __param(10, actions_1.$Su),
        __param(11, contextkey_1.$3i),
        __param(12, configuration_1.$8h)
    ], $REb);
    let $SEb = class $SEb extends SingleSideDiffElement {
        constructor(notebookEditor, cell, templateData, instantiationService, languageService, modelService, textModelService, contextMenuService, keybindingService, notificationService, menuService, contextKeyService, configurationService) {
            super(notebookEditor, cell, templateData, 'right', instantiationService, languageService, modelService, textModelService, contextMenuService, keybindingService, notificationService, menuService, contextKeyService, configurationService);
        }
        styleContainer(container) {
            container.classList.remove('removed');
            container.classList.add('inserted');
        }
        updateSourceEditor() {
            const modifiedCell = this.cell.modified;
            const lineCount = modifiedCell.textModel.textBuffer.getLineCount();
            const lineHeight = this.notebookEditor.getLayoutInfo().fontInfo.lineHeight || 17;
            const editorHeight = lineCount * lineHeight + diffCellEditorOptions_1.$vEb.top + diffCellEditorOptions_1.$vEb.bottom;
            this.kb = this.templateData.sourceEditor;
            this.kb.layout({
                width: (this.notebookEditor.getLayoutInfo().width - 2 * notebookDiffEditorBrowser_1.$yEb) / 2 - 18,
                height: editorHeight
            });
            this.kb.updateOptions({ readOnly: false });
            this.cell.editorHeight = editorHeight;
            this.B(this.kb.onDidContentSizeChange((e) => {
                if (e.contentHeightChanged && this.cell.layoutInfo.editorHeight !== e.contentHeight) {
                    this.cell.editorHeight = e.contentHeight;
                }
            }));
            this.S.createModelReference(modifiedCell.uri).then(ref => {
                if (this.O) {
                    return;
                }
                this.B(ref);
                const textModel = ref.object.textEditorModel;
                this.kb.setModel(textModel);
                this.kb.restoreViewState(this.cell.getSourceEditorViewState());
                this.cell.editorHeight = this.kb.getContentHeight();
            });
        }
        _buildOutputRendererContainer() {
            if (!this.y) {
                this.y = DOM.$0O(this.u, DOM.$('.output-view-container'));
                this.F = DOM.$0O(this.y, DOM.$('.output-empty-view'));
                this.F.innerText = 'No outputs to render';
                if (this.cell.modified.outputs.length === 0) {
                    this.F.style.display = 'block';
                }
                else {
                    this.F.style.display = 'none';
                }
                this.cell.layoutChange();
                this.H = this.P.createInstance(diffElementOutputs_1.$PEb, this.notebookEditor, this.notebookEditor.textModel, this.cell, this.cell.modified, notebookDiffEditorBrowser_1.DiffSide.Modified, this.y);
                this.B(this.H);
                this.H.render();
                const insertOutputRenderListener = this.notebookEditor.onDidDynamicOutputRendered(e => {
                    if (e.cell.uri.toString() === this.cell.modified.uri.toString()) {
                        this.notebookEditor.deltaCellOutputContainerClassNames(notebookDiffEditorBrowser_1.DiffSide.Modified, this.cell.modified.id, ['nb-cellAdded'], []);
                        insertOutputRenderListener.dispose();
                    }
                });
                this.B(insertOutputRenderListener);
            }
            this.y.style.display = 'block';
        }
        _decorate() {
            this.notebookEditor.deltaCellOutputContainerClassNames(notebookDiffEditorBrowser_1.DiffSide.Modified, this.cell.modified.id, ['nb-cellAdded'], []);
        }
        _showOutputsRenderer() {
            if (this.y) {
                this.y.style.display = 'block';
                this.H?.showOutputs();
                this._decorate();
            }
        }
        _hideOutputsRenderer() {
            if (this.y) {
                this.y.style.display = 'none';
                this.H?.hideOutputs();
            }
        }
        layout(state) {
            DOM.$vO(() => {
                if (state.editorHeight || state.outerWidth) {
                    this.kb.layout({
                        width: this.cell.getComputedCellContainerWidth(this.notebookEditor.getLayoutInfo(), false, false),
                        height: this.cell.layoutInfo.editorHeight
                    });
                }
                if (state.metadataHeight || state.outerWidth) {
                    this.r?.layout({
                        width: this.cell.getComputedCellContainerWidth(this.notebookEditor.getLayoutInfo(), false, true),
                        height: this.cell.layoutInfo.metadataHeight
                    });
                }
                if (state.outputTotalHeight || state.outerWidth) {
                    this.J?.layout({
                        width: this.cell.getComputedCellContainerWidth(this.notebookEditor.getLayoutInfo(), false, false),
                        height: this.cell.layoutInfo.outputTotalHeight
                    });
                }
                this.jb();
                if (this.N) {
                    this.N.style.height = `${this.cell.layoutInfo.editorHeight + this.cell.layoutInfo.editorMargin + this.cell.layoutInfo.metadataStatusHeight + this.cell.layoutInfo.metadataHeight + this.cell.layoutInfo.outputTotalHeight + this.cell.layoutInfo.outputStatusHeight}px`;
                }
            });
        }
        dispose() {
            if (this.kb) {
                this.cell.saveSpirceEditorViewState(this.kb.saveViewState());
            }
            super.dispose();
        }
    };
    exports.$SEb = $SEb;
    exports.$SEb = $SEb = __decorate([
        __param(3, instantiation_1.$Ah),
        __param(4, language_1.$ct),
        __param(5, model_1.$yA),
        __param(6, resolverService_1.$uA),
        __param(7, contextView_1.$WZ),
        __param(8, keybinding_1.$2D),
        __param(9, notification_1.$Yu),
        __param(10, actions_1.$Su),
        __param(11, contextkey_1.$3i),
        __param(12, configuration_1.$8h)
    ], $SEb);
    let $TEb = class $TEb extends AbstractElementRenderer {
        constructor(notebookEditor, cell, templateData, instantiationService, languageService, modelService, textModelService, contextMenuService, keybindingService, notificationService, menuService, contextKeyService, configurationService) {
            super(notebookEditor, cell, templateData, 'full', instantiationService, languageService, modelService, textModelService, contextMenuService, keybindingService, notificationService, menuService, contextKeyService, configurationService);
            this.cell = cell;
            this.templateData = templateData;
            this.lb = false;
        }
        init() { }
        styleContainer(container) {
            container.classList.remove('inserted', 'removed');
        }
        _disposeMetadata() {
            this.cell.metadataStatusHeight = 0;
            this.cell.metadataHeight = 0;
            this.templateData.metadataHeaderContainer.style.display = 'none';
            this.templateData.metadataInfoContainer.style.display = 'none';
            this.r = undefined;
        }
        _buildMetadata() {
            this.g = this.templateData.metadataHeaderContainer;
            this.j = this.templateData.metadataInfoContainer;
            this.g.style.display = 'flex';
            this.j.style.display = 'block';
            this.g.innerText = '';
            this.j.innerText = '';
            this.h = this.P.createInstance(PropertyHeader, this.cell, this.g, this.notebookEditor, {
                updateInfoRendering: this.updateMetadataRendering.bind(this),
                checkIfModified: (cell) => {
                    return cell.checkMetadataIfModified();
                },
                getFoldingState: (cell) => {
                    return cell.metadataFoldingState;
                },
                updateFoldingState: (cell, state) => {
                    cell.metadataFoldingState = state;
                },
                unChangedLabel: 'Metadata',
                changedLabel: 'Metadata changed',
                prefix: 'metadata',
                menuId: actions_1.$Ru.NotebookDiffCellMetadataTitle
            });
            this.a.add(this.h);
            this.h.buildHeader();
        }
        _disposeOutput() {
            this.eb();
            this._hideOutputsRenderer();
            this.fb();
            this.cell.rawOutputHeight = 0;
            this.cell.outputStatusHeight = 0;
            this.templateData.outputHeaderContainer.style.display = 'none';
            this.templateData.outputInfoContainer.style.display = 'none';
            this.y = undefined;
        }
        _buildOutput() {
            this.templateData.outputHeaderContainer.style.display = 'flex';
            this.templateData.outputInfoContainer.style.display = 'block';
            this.s = this.templateData.outputHeaderContainer;
            this.u = this.templateData.outputInfoContainer;
            this.s.innerText = '';
            this.u.innerText = '';
            if (this.cell.checkIfOutputsModified()) {
                this.u.classList.add('modified');
            }
            else {
                this.u.classList.remove('modified');
            }
            this.t = this.P.createInstance(PropertyHeader, this.cell, this.s, this.notebookEditor, {
                updateInfoRendering: this.updateOutputRendering.bind(this),
                checkIfModified: (cell) => {
                    return cell.checkIfOutputsModified();
                },
                getFoldingState: (cell) => {
                    return cell.outputFoldingState;
                },
                updateFoldingState: (cell, state) => {
                    cell.outputFoldingState = state;
                },
                unChangedLabel: 'Outputs',
                changedLabel: 'Outputs changed',
                prefix: 'output',
                menuId: actions_1.$Ru.NotebookDiffCellOutputsTitle
            });
            this.b.add(this.t);
            this.t.buildHeader();
        }
        _buildOutputRendererContainer() {
            if (!this.y) {
                this.y = DOM.$0O(this.u, DOM.$('.output-view-container'));
                this.F = DOM.$0O(this.y, DOM.$('.output-empty-view'));
                this.F.innerText = 'No outputs to render';
                if (!this.cell.checkIfOutputsModified() && this.cell.modified.outputs.length === 0) {
                    this.F.style.display = 'block';
                }
                else {
                    this.F.style.display = 'none';
                }
                this.cell.layoutChange();
                this.B(this.cell.modified.textModel.onDidChangeOutputs(() => {
                    // currently we only allow outputs change to the modified cell
                    if (!this.cell.checkIfOutputsModified() && this.cell.modified.outputs.length === 0) {
                        this.F.style.display = 'block';
                    }
                    else {
                        this.F.style.display = 'none';
                    }
                    this._decorate();
                }));
                this.z = DOM.$0O(this.y, DOM.$('.output-view-container-left'));
                this.C = DOM.$0O(this.y, DOM.$('.output-view-container-right'));
                this.D = DOM.$0O(this.y, DOM.$('.output-view-container-metadata'));
                const outputModified = this.cell.checkIfOutputsModified();
                const outputMetadataChangeOnly = outputModified
                    && outputModified.kind === 1 /* OutputComparison.Metadata */
                    && this.cell.original.outputs.length === 1
                    && this.cell.modified.outputs.length === 1
                    && (0, diffElementViewModel_1.$KEb)(this.cell.original.outputs[0], this.cell.modified.outputs[0]) === 1 /* OutputComparison.Metadata */;
                if (outputModified && !outputMetadataChangeOnly) {
                    const originalOutputRenderListener = this.notebookEditor.onDidDynamicOutputRendered(e => {
                        if (e.cell.uri.toString() === this.cell.original.uri.toString() && this.cell.checkIfOutputsModified()) {
                            this.notebookEditor.deltaCellOutputContainerClassNames(notebookDiffEditorBrowser_1.DiffSide.Original, this.cell.original.id, ['nb-cellDeleted'], []);
                            originalOutputRenderListener.dispose();
                        }
                    });
                    const modifiedOutputRenderListener = this.notebookEditor.onDidDynamicOutputRendered(e => {
                        if (e.cell.uri.toString() === this.cell.modified.uri.toString() && this.cell.checkIfOutputsModified()) {
                            this.notebookEditor.deltaCellOutputContainerClassNames(notebookDiffEditorBrowser_1.DiffSide.Modified, this.cell.modified.id, ['nb-cellAdded'], []);
                            modifiedOutputRenderListener.dispose();
                        }
                    });
                    this.B(originalOutputRenderListener);
                    this.B(modifiedOutputRenderListener);
                }
                // We should use the original text model here
                this.G = this.P.createInstance(diffElementOutputs_1.$PEb, this.notebookEditor, this.notebookEditor.textModel, this.cell, this.cell.original, notebookDiffEditorBrowser_1.DiffSide.Original, this.z);
                this.G.render();
                this.B(this.G);
                this.H = this.P.createInstance(diffElementOutputs_1.$PEb, this.notebookEditor, this.notebookEditor.textModel, this.cell, this.cell.modified, notebookDiffEditorBrowser_1.DiffSide.Modified, this.C);
                this.H.render();
                this.B(this.H);
                if (outputModified && !outputMetadataChangeOnly) {
                    this._decorate();
                }
                if (outputMetadataChangeOnly) {
                    this.D.style.top = `${this.cell.layoutInfo.rawOutputHeight}px`;
                    // single output, metadata change, let's render a diff editor for metadata
                    this.L = this.P.createInstance(diffEditorWidget_1.$6Z, this.D, {
                        ...diffCellEditorOptions_1.$xEb,
                        overflowWidgetsDomNode: this.notebookEditor.getOverflowContainerDomNode(),
                        readOnly: true,
                        ignoreTrimWhitespace: false,
                        automaticLayout: false,
                        dimension: {
                            height: diffElementViewModel_1.$GEb,
                            width: this.cell.getComputedCellContainerWidth(this.notebookEditor.getLayoutInfo(), false, true)
                        }
                    }, {
                        originalEditor: $QEb(),
                        modifiedEditor: $QEb()
                    });
                    this.B(this.L);
                    const originalOutputMetadataSource = JSON.stringify(this.cell.original.outputs[0].metadata ?? {}, undefined, '\t');
                    const modifiedOutputMetadataSource = JSON.stringify(this.cell.modified.outputs[0].metadata ?? {}, undefined, '\t');
                    const mode = this.Q.createById('json');
                    const originalModel = this.R.createModel(originalOutputMetadataSource, mode, undefined, true);
                    const modifiedModel = this.R.createModel(modifiedOutputMetadataSource, mode, undefined, true);
                    this.L.setModel({
                        original: originalModel,
                        modified: modifiedModel
                    });
                    this.cell.outputMetadataHeight = this.L.getContentHeight();
                    this.B(this.L.onDidContentSizeChange((e) => {
                        this.cell.outputMetadataHeight = e.contentHeight;
                    }));
                }
            }
            this.y.style.display = 'block';
        }
        _decorate() {
            if (this.cell.checkIfOutputsModified()) {
                this.notebookEditor.deltaCellOutputContainerClassNames(notebookDiffEditorBrowser_1.DiffSide.Original, this.cell.original.id, ['nb-cellDeleted'], []);
                this.notebookEditor.deltaCellOutputContainerClassNames(notebookDiffEditorBrowser_1.DiffSide.Modified, this.cell.modified.id, ['nb-cellAdded'], []);
            }
            else {
                this.notebookEditor.deltaCellOutputContainerClassNames(notebookDiffEditorBrowser_1.DiffSide.Original, this.cell.original.id, [], ['nb-cellDeleted']);
                this.notebookEditor.deltaCellOutputContainerClassNames(notebookDiffEditorBrowser_1.DiffSide.Modified, this.cell.modified.id, [], ['nb-cellAdded']);
            }
        }
        _showOutputsRenderer() {
            if (this.y) {
                this.y.style.display = 'block';
                this.G?.showOutputs();
                this.H?.showOutputs();
                this.L?.layout();
                this._decorate();
            }
        }
        _hideOutputsRenderer() {
            if (this.y) {
                this.y.style.display = 'none';
                this.G?.hideOutputs();
                this.H?.hideOutputs();
            }
        }
        updateSourceEditor() {
            const modifiedCell = this.cell.modified;
            const lineCount = modifiedCell.textModel.textBuffer.getLineCount();
            const lineHeight = this.notebookEditor.getLayoutInfo().fontInfo.lineHeight || 17;
            const editorHeight = this.cell.layoutInfo.editorHeight !== 0 ? this.cell.layoutInfo.editorHeight : lineCount * lineHeight + diffCellEditorOptions_1.$vEb.top + diffCellEditorOptions_1.$vEb.bottom;
            this.mb = this.templateData.editorContainer;
            this.kb = this.templateData.sourceEditor;
            this.mb.classList.add('diff');
            this.kb.layout({
                width: this.notebookEditor.getLayoutInfo().width - 2 * notebookDiffEditorBrowser_1.$yEb,
                height: editorHeight
            });
            this.mb.style.height = `${editorHeight}px`;
            this.B(this.kb.onDidContentSizeChange((e) => {
                if (e.contentHeightChanged && this.cell.layoutInfo.editorHeight !== e.contentHeight) {
                    this.cell.editorHeight = e.contentHeight;
                }
            }));
            this.qb();
            const scopedContextKeyService = this.Z.createScoped(this.templateData.inputToolbarContainer);
            this.B(scopedContextKeyService);
            const inputChanged = notebookDiffEditorBrowser_1.$zEb.bindTo(scopedContextKeyService);
            this.nb = this.templateData.inputToolbarContainer;
            this.ob = this.templateData.toolbar;
            this.ob.context = {
                cell: this.cell
            };
            if (this.cell.modified.textModel.getValue() !== this.cell.original.textModel.getValue()) {
                this.nb.style.display = 'block';
                inputChanged.set(true);
            }
            else {
                this.nb.style.display = 'none';
                inputChanged.set(false);
            }
            this.B(this.cell.modified.textModel.onDidChangeContent(() => {
                if (this.cell.modified.textModel.getValue() !== this.cell.original.textModel.getValue()) {
                    this.nb.style.display = 'block';
                    inputChanged.set(true);
                }
                else {
                    this.nb.style.display = 'none';
                    inputChanged.set(false);
                }
            }));
            const menu = this.Y.createMenu(actions_1.$Ru.NotebookDiffCellInputTitle, scopedContextKeyService);
            const actions = [];
            (0, menuEntryActionViewItem_1.$B3)(menu, { shouldForwardArgs: true }, actions);
            this.ob.setActions(actions);
            menu.dispose();
        }
        async qb() {
            const originalCell = this.cell.original;
            const modifiedCell = this.cell.modified;
            const originalRef = await this.S.createModelReference(originalCell.uri);
            const modifiedRef = await this.S.createModelReference(modifiedCell.uri);
            if (this.O) {
                return;
            }
            const textModel = originalRef.object.textEditorModel;
            const modifiedTextModel = modifiedRef.object.textEditorModel;
            this.B(originalRef);
            this.B(modifiedRef);
            this.kb.setModel({
                original: textModel,
                modified: modifiedTextModel
            });
            const handleViewStateChange = () => {
                this.lb = true;
            };
            const handleScrollChange = (e) => {
                if (e.scrollTopChanged || e.scrollLeftChanged) {
                    this.lb = true;
                }
            };
            this.B(this.kb.getOriginalEditor().onDidChangeCursorSelection(handleViewStateChange));
            this.B(this.kb.getOriginalEditor().onDidScrollChange(handleScrollChange));
            this.B(this.kb.getModifiedEditor().onDidChangeCursorSelection(handleViewStateChange));
            this.B(this.kb.getModifiedEditor().onDidScrollChange(handleScrollChange));
            const editorViewState = this.cell.getSourceEditorViewState();
            if (editorViewState) {
                this.kb.restoreViewState(editorViewState);
            }
            const contentHeight = this.kb.getContentHeight();
            this.cell.editorHeight = contentHeight;
        }
        layout(state) {
            DOM.$vO(() => {
                if (state.editorHeight) {
                    this.mb.style.height = `${this.cell.layoutInfo.editorHeight}px`;
                    this.kb.layout({
                        width: this.kb.getViewWidth(),
                        height: this.cell.layoutInfo.editorHeight
                    });
                }
                if (state.outerWidth) {
                    this.mb.style.height = `${this.cell.layoutInfo.editorHeight}px`;
                    this.kb.layout();
                }
                if (state.metadataHeight || state.outerWidth) {
                    if (this.m) {
                        this.m.style.height = `${this.cell.layoutInfo.metadataHeight}px`;
                        this.r?.layout();
                    }
                }
                if (state.outputTotalHeight || state.outerWidth) {
                    if (this.w) {
                        this.w.style.height = `${this.cell.layoutInfo.outputTotalHeight}px`;
                        this.J?.layout();
                    }
                    if (this.D) {
                        this.D.style.height = `${this.cell.layoutInfo.outputMetadataHeight}px`;
                        this.D.style.top = `${this.cell.layoutInfo.outputTotalHeight - this.cell.layoutInfo.outputMetadataHeight}px`;
                        this.L?.layout();
                    }
                }
                this.jb();
            });
        }
        dispose() {
            if (this.kb && this.lb) {
                this.cell.saveSpirceEditorViewState(this.kb.saveViewState());
            }
            super.dispose();
        }
    };
    exports.$TEb = $TEb;
    exports.$TEb = $TEb = __decorate([
        __param(3, instantiation_1.$Ah),
        __param(4, language_1.$ct),
        __param(5, model_1.$yA),
        __param(6, resolverService_1.$uA),
        __param(7, contextView_1.$WZ),
        __param(8, keybinding_1.$2D),
        __param(9, notification_1.$Yu),
        __param(10, actions_1.$Su),
        __param(11, contextkey_1.$3i),
        __param(12, configuration_1.$8h)
    ], $TEb);
});
//# sourceMappingURL=diffComponents.js.map