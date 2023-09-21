/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/dom", "vs/base/common/buffer", "vs/base/common/errors", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/map", "vs/base/common/mime", "vs/base/common/uri", "vs/base/test/common/mock", "vs/base/test/common/timeTravelScheduler", "vs/editor/common/languages/language", "vs/editor/common/languages/languageConfigurationRegistry", "vs/editor/common/services/languageService", "vs/editor/common/services/model", "vs/editor/common/services/modelService", "vs/editor/common/services/resolverService", "vs/editor/test/common/modes/testLanguageConfigurationService", "vs/platform/clipboard/common/clipboardService", "vs/platform/clipboard/test/common/testClipboardService", "vs/platform/configuration/common/configuration", "vs/platform/configuration/test/common/testConfigurationService", "vs/platform/contextkey/browser/contextKeyService", "vs/platform/contextkey/common/contextkey", "vs/platform/instantiation/test/common/instantiationServiceMock", "vs/platform/keybinding/common/keybinding", "vs/platform/keybinding/test/common/mockKeybindingService", "vs/platform/layout/browser/layoutService", "vs/platform/list/browser/listService", "vs/platform/log/common/log", "vs/platform/storage/common/storage", "vs/platform/theme/common/themeService", "vs/platform/theme/test/common/testThemeService", "vs/platform/undoRedo/common/undoRedo", "vs/platform/undoRedo/common/undoRedoService", "vs/platform/workspace/common/workspaceTrust", "vs/workbench/common/editor/editorModel", "vs/workbench/contrib/notebook/browser/services/notebookCellStatusBarServiceImpl", "vs/workbench/contrib/notebook/browser/view/notebookCellList", "vs/workbench/contrib/notebook/browser/viewModel/eventDispatcher", "vs/workbench/contrib/notebook/browser/viewModel/notebookViewModelImpl", "vs/workbench/contrib/notebook/browser/viewModel/viewContext", "vs/workbench/contrib/notebook/common/model/notebookCellTextModel", "vs/workbench/contrib/notebook/common/model/notebookTextModel", "vs/workbench/contrib/notebook/common/notebookCellStatusBarService", "vs/workbench/contrib/notebook/common/notebookCommon", "vs/workbench/contrib/notebook/common/notebookExecutionStateService", "vs/workbench/contrib/notebook/browser/notebookOptions", "vs/workbench/services/textmodelResolver/common/textModelResolverService", "vs/workbench/test/browser/workbenchTestServices", "vs/workbench/test/common/workbenchTestServices", "vs/editor/common/config/fontInfo", "vs/editor/common/config/editorOptions"], function (require, exports, DOM, buffer_1, errors_1, event_1, lifecycle_1, map_1, mime_1, uri_1, mock_1, timeTravelScheduler_1, language_1, languageConfigurationRegistry_1, languageService_1, model_1, modelService_1, resolverService_1, testLanguageConfigurationService_1, clipboardService_1, testClipboardService_1, configuration_1, testConfigurationService_1, contextKeyService_1, contextkey_1, instantiationServiceMock_1, keybinding_1, mockKeybindingService_1, layoutService_1, listService_1, log_1, storage_1, themeService_1, testThemeService_1, undoRedo_1, undoRedoService_1, workspaceTrust_1, editorModel_1, notebookCellStatusBarServiceImpl_1, notebookCellList_1, eventDispatcher_1, notebookViewModelImpl_1, viewContext_1, notebookCellTextModel_1, notebookTextModel_1, notebookCellStatusBarService_1, notebookCommon_1, notebookExecutionStateService_1, notebookOptions_1, textModelResolverService_1, workbenchTestServices_1, workbenchTestServices_2, fontInfo_1, editorOptions_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Nfc = exports.$Mfc = exports.$Lfc = exports.$Kfc = exports.$Jfc = exports.$Ifc = exports.$Hfc = exports.$Gfc = void 0;
    class $Gfc extends notebookCellTextModel_1.$HH {
        constructor(viewType, handle, source, language, cellKind, outputs, languageService) {
            super(notebookCommon_1.CellUri.generate(uri_1.URI.parse('test:///fake/notebook'), handle), handle, source, language, mime_1.$Hr.text, cellKind, outputs, undefined, undefined, undefined, { transientCellMetadata: {}, transientDocumentMetadata: {}, transientOutputs: false, cellContentMetadata: {} }, languageService);
            this.viewType = viewType;
            this.source = source;
        }
    }
    exports.$Gfc = $Gfc;
    class $Hfc extends editorModel_1.$xA {
        get viewType() {
            return this.m.viewType;
        }
        get resource() {
            return this.m.uri;
        }
        get notebook() {
            return this.m;
        }
        constructor(m) {
            super();
            this.m = m;
            this.a = false;
            this.b = this.B(new event_1.$fd());
            this.onDidSave = this.b.event;
            this.c = this.B(new event_1.$fd());
            this.onDidChangeDirty = this.c.event;
            this.onDidChangeOrphaned = event_1.Event.None;
            this.onDidChangeReadonly = event_1.Event.None;
            this.onDidRevertUntitled = event_1.Event.None;
            this.g = this.B(new event_1.$fd());
            this.onDidChangeContent = this.g.event;
            if (m && m.onDidChangeContent) {
                this.B(m.onDidChangeContent(() => {
                    this.a = true;
                    this.c.fire();
                    this.g.fire();
                }));
            }
        }
        isReadonly() {
            return false;
        }
        isOrphaned() {
            return false;
        }
        hasAssociatedFilePath() {
            return false;
        }
        isDirty() {
            return this.a;
        }
        get hasErrorState() {
            return false;
        }
        isModified() {
            return this.a;
        }
        getNotebook() {
            return this.m;
        }
        async load() {
            return this;
        }
        async save() {
            if (this.m) {
                this.a = false;
                this.c.fire();
                this.b.fire({});
                // todo, flush all states
                return true;
            }
            return false;
        }
        saveAs() {
            throw new errors_1.$9();
        }
        revert() {
            throw new errors_1.$9();
        }
    }
    exports.$Hfc = $Hfc;
    function $Ifc(disposables) {
        const instantiationService = disposables.add(new instantiationServiceMock_1.$L0b());
        instantiationService.stub(language_1.$ct, disposables.add(new languageService_1.$jmb()));
        instantiationService.stub(undoRedo_1.$wu, instantiationService.createInstance(undoRedoService_1.$myb));
        instantiationService.stub(configuration_1.$8h, new testConfigurationService_1.$G0b());
        instantiationService.stub(themeService_1.$gv, new testThemeService_1.$K0b());
        instantiationService.stub(languageConfigurationRegistry_1.$2t, disposables.add(new testLanguageConfigurationService_1.$D0b()));
        instantiationService.stub(model_1.$yA, disposables.add(instantiationService.createInstance(modelService_1.$4yb)));
        instantiationService.stub(resolverService_1.$uA, disposables.add(instantiationService.createInstance(textModelResolverService_1.$Jyb)));
        instantiationService.stub(contextkey_1.$3i, disposables.add(instantiationService.createInstance(contextKeyService_1.$xtb)));
        instantiationService.stub(listService_1.$03, disposables.add(instantiationService.createInstance(listService_1.$$3)));
        instantiationService.stub(layoutService_1.$XT, new workbenchTestServices_1.$wec());
        instantiationService.stub(log_1.$5i, new log_1.$fj());
        instantiationService.stub(clipboardService_1.$UZ, testClipboardService_1.$R0b);
        instantiationService.stub(storage_1.$Vo, disposables.add(new workbenchTestServices_2.$7dc()));
        instantiationService.stub(workspaceTrust_1.$_z, disposables.add(new workbenchTestServices_2.$gec(true)));
        instantiationService.stub(notebookExecutionStateService_1.$_H, new TestNotebookExecutionStateService());
        instantiationService.stub(keybinding_1.$2D, new mockKeybindingService_1.$U0b());
        instantiationService.stub(notebookCellStatusBarService_1.$Qmb, disposables.add(new notebookCellStatusBarServiceImpl_1.$5Eb()));
        return instantiationService;
    }
    exports.$Ifc = $Ifc;
    function _createTestNotebookEditor(instantiationService, disposables, cells) {
        const viewType = 'notebook';
        const notebook = disposables.add(instantiationService.createInstance(notebookTextModel_1.$MH, viewType, uri_1.URI.parse('test'), cells.map((cell) => {
            return {
                source: cell[0],
                mime: undefined,
                language: cell[1],
                cellKind: cell[2],
                outputs: cell[3] ?? [],
                metadata: cell[4]
            };
        }), {}, { transientCellMetadata: {}, transientDocumentMetadata: {}, cellContentMetadata: {}, transientOutputs: false }));
        const model = disposables.add(new $Hfc(notebook));
        const notebookOptions = disposables.add(new notebookOptions_1.$Gbb(instantiationService.get(configuration_1.$8h), instantiationService.get(notebookExecutionStateService_1.$_H), false));
        const viewContext = new viewContext_1.$Mnb(notebookOptions, disposables.add(new eventDispatcher_1.$Lnb()), () => ({}));
        const viewModel = disposables.add(instantiationService.createInstance(notebookViewModelImpl_1.$zob, viewType, model.notebook, viewContext, null, { isReadOnly: false }));
        const cellList = disposables.add($Mfc(instantiationService, disposables, viewContext));
        cellList.attachViewModel(viewModel);
        const listViewInfoAccessor = disposables.add(new notebookCellList_1.$Hob(cellList));
        let visibleRanges = [{ start: 0, end: 100 }];
        const notebookEditor = new class extends (0, mock_1.$rT)() {
            constructor() {
                super(...arguments);
                this.notebookOptions = notebookOptions;
                this.onDidChangeModel = new event_1.$fd().event;
                this.onDidChangeCellState = new event_1.$fd().event;
                this.textModel = viewModel.notebookDocument;
                this.onDidChangeVisibleRanges = event_1.Event.None;
            }
            dispose() {
                viewModel.dispose();
            }
            getViewModel() {
                return viewModel;
            }
            hasModel() {
                return !!viewModel;
            }
            getLength() { return viewModel.length; }
            getFocus() { return viewModel.getFocus(); }
            getSelections() { return viewModel.getSelections(); }
            setFocus(focus) {
                viewModel.updateSelectionsState({
                    kind: notebookCommon_1.SelectionStateType.Index,
                    focus: focus,
                    selections: viewModel.getSelections()
                });
            }
            setSelections(selections) {
                viewModel.updateSelectionsState({
                    kind: notebookCommon_1.SelectionStateType.Index,
                    focus: viewModel.getFocus(),
                    selections: selections
                });
            }
            getViewIndexByModelIndex(index) { return listViewInfoAccessor.getViewIndex(viewModel.viewCells[index]); }
            getCellRangeFromViewRange(startIndex, endIndex) { return listViewInfoAccessor.getCellRangeFromViewRange(startIndex, endIndex); }
            revealCellRangeInView() { }
            setHiddenAreas(_ranges) {
                return cellList.setHiddenAreas(_ranges, true);
            }
            getActiveCell() {
                const elements = cellList.getFocusedElements();
                if (elements && elements.length) {
                    return elements[0];
                }
                return undefined;
            }
            hasOutputTextSelection() {
                return false;
            }
            changeModelDecorations() { return null; }
            focusElement() { }
            setCellEditorSelection() { }
            async revealRangeInCenterIfOutsideViewportAsync() { }
            async layoutNotebookCell() { }
            async removeInset() { }
            async focusNotebookCell() { }
            cellAt(index) { return viewModel.cellAt(index); }
            getCellIndex(cell) { return viewModel.getCellIndex(cell); }
            getCellsInRange(range) { return viewModel.getCellsInRange(range); }
            getCellByHandle(handle) { return viewModel.getCellByHandle(handle); }
            getNextVisibleCellIndex(index) { return viewModel.getNextVisibleCellIndex(index); }
            getControl() { return this; }
            get onDidChangeSelection() { return viewModel.onDidChangeSelection; }
            get onDidChangeOptions() { return viewModel.onDidChangeOptions; }
            get onDidChangeViewCells() { return viewModel.onDidChangeViewCells; }
            async find(query, options) {
                const findMatches = viewModel.find(query, options).filter(match => match.length > 0);
                return findMatches;
            }
            deltaCellDecorations() { return []; }
            get visibleRanges() {
                return visibleRanges;
            }
            set visibleRanges(_ranges) {
                visibleRanges = _ranges;
            }
            getId() { return ''; }
            setScrollTop(scrollTop) {
                cellList.scrollTop = scrollTop;
            }
            get scrollTop() {
                return cellList.scrollTop;
            }
            getLayoutInfo() {
                return {
                    width: 0,
                    height: 0,
                    scrollHeight: cellList.getScrollHeight(),
                    fontInfo: new fontInfo_1.$Tr({
                        pixelRatio: 1,
                        fontFamily: 'mockFont',
                        fontWeight: 'normal',
                        fontSize: 14,
                        fontFeatureSettings: editorOptions_1.EditorFontLigatures.OFF,
                        fontVariationSettings: editorOptions_1.EditorFontVariations.OFF,
                        lineHeight: 19,
                        letterSpacing: 1.5,
                        isMonospace: true,
                        typicalHalfwidthCharacterWidth: 10,
                        typicalFullwidthCharacterWidth: 20,
                        canUseHalfwidthRightwardsArrow: true,
                        spaceWidth: 10,
                        middotWidth: 10,
                        wsmiddotWidth: 10,
                        maxDigitWidth: 10,
                    }, true),
                    stickyHeight: 0
                };
            }
        };
        return { editor: notebookEditor, viewModel };
    }
    function $Jfc(instantiationService, disposables, cells) {
        return _createTestNotebookEditor(instantiationService, disposables, cells);
    }
    exports.$Jfc = $Jfc;
    async function $Kfc(originalCells, modifiedCells, callback) {
        const disposables = new lifecycle_1.$jc();
        const instantiationService = $Ifc(disposables);
        const originalNotebook = $Jfc(instantiationService, disposables, originalCells);
        const modifiedNotebook = $Jfc(instantiationService, disposables, modifiedCells);
        const originalResource = new class extends (0, mock_1.$rT)() {
            get notebook() {
                return originalNotebook.viewModel.notebookDocument;
            }
        };
        const modifiedResource = new class extends (0, mock_1.$rT)() {
            get notebook() {
                return modifiedNotebook.viewModel.notebookDocument;
            }
        };
        const model = new class extends (0, mock_1.$rT)() {
            get original() {
                return originalResource;
            }
            get modified() {
                return modifiedResource;
            }
        };
        const res = await callback(model, disposables, instantiationService);
        if (res instanceof Promise) {
            res.finally(() => {
                originalNotebook.editor.dispose();
                originalNotebook.viewModel.dispose();
                modifiedNotebook.editor.dispose();
                modifiedNotebook.viewModel.dispose();
                disposables.dispose();
            });
        }
        else {
            originalNotebook.editor.dispose();
            originalNotebook.viewModel.dispose();
            modifiedNotebook.editor.dispose();
            modifiedNotebook.viewModel.dispose();
            disposables.dispose();
        }
        return res;
    }
    exports.$Kfc = $Kfc;
    async function $Lfc(cells, callback, accessor) {
        const disposables = new lifecycle_1.$jc();
        const instantiationService = accessor ?? $Ifc(disposables);
        const notebookEditor = _createTestNotebookEditor(instantiationService, disposables, cells);
        return (0, timeTravelScheduler_1.$kT)({ useFakeTimers: true }, async () => {
            const res = await callback(notebookEditor.editor, notebookEditor.viewModel, disposables, instantiationService);
            if (res instanceof Promise) {
                res.finally(() => {
                    notebookEditor.editor.dispose();
                    notebookEditor.viewModel.dispose();
                    notebookEditor.editor.textModel.dispose();
                    disposables.dispose();
                });
            }
            else {
                notebookEditor.editor.dispose();
                notebookEditor.viewModel.dispose();
                notebookEditor.editor.textModel.dispose();
                disposables.dispose();
            }
            return res;
        });
    }
    exports.$Lfc = $Lfc;
    function $Mfc(instantiationService, disposables, viewContext) {
        const delegate = {
            getHeight(element) { return element.getHeight(17); },
            getTemplateId() { return 'template'; }
        };
        const renderer = {
            templateId: 'template',
            renderTemplate() { return {}; },
            renderElement() { },
            disposeTemplate() { }
        };
        const notebookOptions = !!viewContext ? viewContext.notebookOptions
            : disposables.add(new notebookOptions_1.$Gbb(instantiationService.get(configuration_1.$8h), instantiationService.get(notebookExecutionStateService_1.$_H), false));
        const cellList = disposables.add(instantiationService.createInstance(notebookCellList_1.$Gob, 'NotebookCellList', DOM.$('container'), notebookOptions, delegate, [renderer], instantiationService.get(contextkey_1.$3i), {
            supportDynamicHeights: true,
            multipleSelectionSupport: true,
        }));
        return cellList;
    }
    exports.$Mfc = $Mfc;
    function $Nfc(value) {
        return buffer_1.$Fd.fromString(value);
    }
    exports.$Nfc = $Nfc;
    class TestCellExecution {
        constructor(notebook, cellHandle, a) {
            this.notebook = notebook;
            this.cellHandle = cellHandle;
            this.a = a;
            this.state = notebookCommon_1.NotebookCellExecutionState.Unconfirmed;
            this.didPause = false;
            this.isPaused = false;
        }
        confirm() {
        }
        update(updates) {
        }
        complete(complete) {
            this.a();
        }
    }
    class TestNotebookExecutionStateService {
        constructor() {
            this.a = new map_1.$zi();
            this.onDidChangeExecution = new event_1.$fd().event;
            this.onDidChangeLastRunFailState = new event_1.$fd().event;
        }
        forceCancelNotebookExecutions(notebookUri) {
        }
        getCellExecutionsForNotebook(notebook) {
            return [];
        }
        getCellExecution(cellUri) {
            return this.a.get(cellUri);
        }
        createCellExecution(notebook, cellHandle) {
            const onComplete = () => this.a.delete(notebookCommon_1.CellUri.generate(notebook, cellHandle));
            const exe = new TestCellExecution(notebook, cellHandle, onComplete);
            this.a.set(notebookCommon_1.CellUri.generate(notebook, cellHandle), exe);
            return exe;
        }
        getCellExecutionsByHandleForNotebook(notebook) {
            return;
        }
        getLastFailedCellForNotebook(notebook) {
            return;
        }
        getExecution(notebook) {
            return;
        }
        createExecution(notebook) {
            throw new Error('Method not implemented.');
        }
    }
});
//# sourceMappingURL=testNotebookEditor.js.map