/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/dom", "vs/base/common/buffer", "vs/base/common/errors", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/map", "vs/base/common/mime", "vs/base/common/uri", "vs/base/test/common/mock", "vs/base/test/common/timeTravelScheduler", "vs/editor/common/languages/language", "vs/editor/common/languages/languageConfigurationRegistry", "vs/editor/common/services/languageService", "vs/editor/common/services/model", "vs/editor/common/services/modelService", "vs/editor/common/services/resolverService", "vs/editor/test/common/modes/testLanguageConfigurationService", "vs/platform/clipboard/common/clipboardService", "vs/platform/clipboard/test/common/testClipboardService", "vs/platform/configuration/common/configuration", "vs/platform/configuration/test/common/testConfigurationService", "vs/platform/contextkey/browser/contextKeyService", "vs/platform/contextkey/common/contextkey", "vs/platform/instantiation/test/common/instantiationServiceMock", "vs/platform/keybinding/common/keybinding", "vs/platform/keybinding/test/common/mockKeybindingService", "vs/platform/layout/browser/layoutService", "vs/platform/list/browser/listService", "vs/platform/log/common/log", "vs/platform/storage/common/storage", "vs/platform/theme/common/themeService", "vs/platform/theme/test/common/testThemeService", "vs/platform/undoRedo/common/undoRedo", "vs/platform/undoRedo/common/undoRedoService", "vs/platform/workspace/common/workspaceTrust", "vs/workbench/common/editor/editorModel", "vs/workbench/contrib/notebook/browser/services/notebookCellStatusBarServiceImpl", "vs/workbench/contrib/notebook/browser/view/notebookCellList", "vs/workbench/contrib/notebook/browser/viewModel/eventDispatcher", "vs/workbench/contrib/notebook/browser/viewModel/notebookViewModelImpl", "vs/workbench/contrib/notebook/browser/viewModel/viewContext", "vs/workbench/contrib/notebook/common/model/notebookCellTextModel", "vs/workbench/contrib/notebook/common/model/notebookTextModel", "vs/workbench/contrib/notebook/common/notebookCellStatusBarService", "vs/workbench/contrib/notebook/common/notebookCommon", "vs/workbench/contrib/notebook/common/notebookExecutionStateService", "vs/workbench/contrib/notebook/browser/notebookOptions", "vs/workbench/services/textmodelResolver/common/textModelResolverService", "vs/workbench/test/browser/workbenchTestServices", "vs/workbench/test/common/workbenchTestServices", "vs/editor/common/config/fontInfo", "vs/editor/common/config/editorOptions"], function (require, exports, DOM, buffer_1, errors_1, event_1, lifecycle_1, map_1, mime_1, uri_1, mock_1, timeTravelScheduler_1, language_1, languageConfigurationRegistry_1, languageService_1, model_1, modelService_1, resolverService_1, testLanguageConfigurationService_1, clipboardService_1, testClipboardService_1, configuration_1, testConfigurationService_1, contextKeyService_1, contextkey_1, instantiationServiceMock_1, keybinding_1, mockKeybindingService_1, layoutService_1, listService_1, log_1, storage_1, themeService_1, testThemeService_1, undoRedo_1, undoRedoService_1, workspaceTrust_1, editorModel_1, notebookCellStatusBarServiceImpl_1, notebookCellList_1, eventDispatcher_1, notebookViewModelImpl_1, viewContext_1, notebookCellTextModel_1, notebookTextModel_1, notebookCellStatusBarService_1, notebookCommon_1, notebookExecutionStateService_1, notebookOptions_1, textModelResolverService_1, workbenchTestServices_1, workbenchTestServices_2, fontInfo_1, editorOptions_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.valueBytesFromString = exports.createNotebookCellList = exports.withTestNotebook = exports.withTestNotebookDiffModel = exports.createTestNotebookEditor = exports.setupInstantiationService = exports.NotebookEditorTestModel = exports.TestCell = void 0;
    class TestCell extends notebookCellTextModel_1.NotebookCellTextModel {
        constructor(viewType, handle, source, language, cellKind, outputs, languageService) {
            super(notebookCommon_1.CellUri.generate(uri_1.URI.parse('test:///fake/notebook'), handle), handle, source, language, mime_1.Mimes.text, cellKind, outputs, undefined, undefined, undefined, { transientCellMetadata: {}, transientDocumentMetadata: {}, transientOutputs: false, cellContentMetadata: {} }, languageService);
            this.viewType = viewType;
            this.source = source;
        }
    }
    exports.TestCell = TestCell;
    class NotebookEditorTestModel extends editorModel_1.EditorModel {
        get viewType() {
            return this._notebook.viewType;
        }
        get resource() {
            return this._notebook.uri;
        }
        get notebook() {
            return this._notebook;
        }
        constructor(_notebook) {
            super();
            this._notebook = _notebook;
            this._dirty = false;
            this._onDidSave = this._register(new event_1.Emitter());
            this.onDidSave = this._onDidSave.event;
            this._onDidChangeDirty = this._register(new event_1.Emitter());
            this.onDidChangeDirty = this._onDidChangeDirty.event;
            this.onDidChangeOrphaned = event_1.Event.None;
            this.onDidChangeReadonly = event_1.Event.None;
            this.onDidRevertUntitled = event_1.Event.None;
            this._onDidChangeContent = this._register(new event_1.Emitter());
            this.onDidChangeContent = this._onDidChangeContent.event;
            if (_notebook && _notebook.onDidChangeContent) {
                this._register(_notebook.onDidChangeContent(() => {
                    this._dirty = true;
                    this._onDidChangeDirty.fire();
                    this._onDidChangeContent.fire();
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
            return this._dirty;
        }
        get hasErrorState() {
            return false;
        }
        isModified() {
            return this._dirty;
        }
        getNotebook() {
            return this._notebook;
        }
        async load() {
            return this;
        }
        async save() {
            if (this._notebook) {
                this._dirty = false;
                this._onDidChangeDirty.fire();
                this._onDidSave.fire({});
                // todo, flush all states
                return true;
            }
            return false;
        }
        saveAs() {
            throw new errors_1.NotImplementedError();
        }
        revert() {
            throw new errors_1.NotImplementedError();
        }
    }
    exports.NotebookEditorTestModel = NotebookEditorTestModel;
    function setupInstantiationService(disposables) {
        const instantiationService = disposables.add(new instantiationServiceMock_1.TestInstantiationService());
        instantiationService.stub(language_1.ILanguageService, disposables.add(new languageService_1.LanguageService()));
        instantiationService.stub(undoRedo_1.IUndoRedoService, instantiationService.createInstance(undoRedoService_1.UndoRedoService));
        instantiationService.stub(configuration_1.IConfigurationService, new testConfigurationService_1.TestConfigurationService());
        instantiationService.stub(themeService_1.IThemeService, new testThemeService_1.TestThemeService());
        instantiationService.stub(languageConfigurationRegistry_1.ILanguageConfigurationService, disposables.add(new testLanguageConfigurationService_1.TestLanguageConfigurationService()));
        instantiationService.stub(model_1.IModelService, disposables.add(instantiationService.createInstance(modelService_1.ModelService)));
        instantiationService.stub(resolverService_1.ITextModelService, disposables.add(instantiationService.createInstance(textModelResolverService_1.TextModelResolverService)));
        instantiationService.stub(contextkey_1.IContextKeyService, disposables.add(instantiationService.createInstance(contextKeyService_1.ContextKeyService)));
        instantiationService.stub(listService_1.IListService, disposables.add(instantiationService.createInstance(listService_1.ListService)));
        instantiationService.stub(layoutService_1.ILayoutService, new workbenchTestServices_1.TestLayoutService());
        instantiationService.stub(log_1.ILogService, new log_1.NullLogService());
        instantiationService.stub(clipboardService_1.IClipboardService, testClipboardService_1.TestClipboardService);
        instantiationService.stub(storage_1.IStorageService, disposables.add(new workbenchTestServices_2.TestStorageService()));
        instantiationService.stub(workspaceTrust_1.IWorkspaceTrustRequestService, disposables.add(new workbenchTestServices_2.TestWorkspaceTrustRequestService(true)));
        instantiationService.stub(notebookExecutionStateService_1.INotebookExecutionStateService, new TestNotebookExecutionStateService());
        instantiationService.stub(keybinding_1.IKeybindingService, new mockKeybindingService_1.MockKeybindingService());
        instantiationService.stub(notebookCellStatusBarService_1.INotebookCellStatusBarService, disposables.add(new notebookCellStatusBarServiceImpl_1.NotebookCellStatusBarService()));
        return instantiationService;
    }
    exports.setupInstantiationService = setupInstantiationService;
    function _createTestNotebookEditor(instantiationService, disposables, cells) {
        const viewType = 'notebook';
        const notebook = disposables.add(instantiationService.createInstance(notebookTextModel_1.NotebookTextModel, viewType, uri_1.URI.parse('test'), cells.map((cell) => {
            return {
                source: cell[0],
                mime: undefined,
                language: cell[1],
                cellKind: cell[2],
                outputs: cell[3] ?? [],
                metadata: cell[4]
            };
        }), {}, { transientCellMetadata: {}, transientDocumentMetadata: {}, cellContentMetadata: {}, transientOutputs: false }));
        const model = disposables.add(new NotebookEditorTestModel(notebook));
        const notebookOptions = disposables.add(new notebookOptions_1.NotebookOptions(instantiationService.get(configuration_1.IConfigurationService), instantiationService.get(notebookExecutionStateService_1.INotebookExecutionStateService), false));
        const viewContext = new viewContext_1.ViewContext(notebookOptions, disposables.add(new eventDispatcher_1.NotebookEventDispatcher()), () => ({}));
        const viewModel = disposables.add(instantiationService.createInstance(notebookViewModelImpl_1.NotebookViewModel, viewType, model.notebook, viewContext, null, { isReadOnly: false }));
        const cellList = disposables.add(createNotebookCellList(instantiationService, disposables, viewContext));
        cellList.attachViewModel(viewModel);
        const listViewInfoAccessor = disposables.add(new notebookCellList_1.ListViewInfoAccessor(cellList));
        let visibleRanges = [{ start: 0, end: 100 }];
        const notebookEditor = new class extends (0, mock_1.mock)() {
            constructor() {
                super(...arguments);
                this.notebookOptions = notebookOptions;
                this.onDidChangeModel = new event_1.Emitter().event;
                this.onDidChangeCellState = new event_1.Emitter().event;
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
                    fontInfo: new fontInfo_1.FontInfo({
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
    function createTestNotebookEditor(instantiationService, disposables, cells) {
        return _createTestNotebookEditor(instantiationService, disposables, cells);
    }
    exports.createTestNotebookEditor = createTestNotebookEditor;
    async function withTestNotebookDiffModel(originalCells, modifiedCells, callback) {
        const disposables = new lifecycle_1.DisposableStore();
        const instantiationService = setupInstantiationService(disposables);
        const originalNotebook = createTestNotebookEditor(instantiationService, disposables, originalCells);
        const modifiedNotebook = createTestNotebookEditor(instantiationService, disposables, modifiedCells);
        const originalResource = new class extends (0, mock_1.mock)() {
            get notebook() {
                return originalNotebook.viewModel.notebookDocument;
            }
        };
        const modifiedResource = new class extends (0, mock_1.mock)() {
            get notebook() {
                return modifiedNotebook.viewModel.notebookDocument;
            }
        };
        const model = new class extends (0, mock_1.mock)() {
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
    exports.withTestNotebookDiffModel = withTestNotebookDiffModel;
    async function withTestNotebook(cells, callback, accessor) {
        const disposables = new lifecycle_1.DisposableStore();
        const instantiationService = accessor ?? setupInstantiationService(disposables);
        const notebookEditor = _createTestNotebookEditor(instantiationService, disposables, cells);
        return (0, timeTravelScheduler_1.runWithFakedTimers)({ useFakeTimers: true }, async () => {
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
    exports.withTestNotebook = withTestNotebook;
    function createNotebookCellList(instantiationService, disposables, viewContext) {
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
            : disposables.add(new notebookOptions_1.NotebookOptions(instantiationService.get(configuration_1.IConfigurationService), instantiationService.get(notebookExecutionStateService_1.INotebookExecutionStateService), false));
        const cellList = disposables.add(instantiationService.createInstance(notebookCellList_1.NotebookCellList, 'NotebookCellList', DOM.$('container'), notebookOptions, delegate, [renderer], instantiationService.get(contextkey_1.IContextKeyService), {
            supportDynamicHeights: true,
            multipleSelectionSupport: true,
        }));
        return cellList;
    }
    exports.createNotebookCellList = createNotebookCellList;
    function valueBytesFromString(value) {
        return buffer_1.VSBuffer.fromString(value);
    }
    exports.valueBytesFromString = valueBytesFromString;
    class TestCellExecution {
        constructor(notebook, cellHandle, onComplete) {
            this.notebook = notebook;
            this.cellHandle = cellHandle;
            this.onComplete = onComplete;
            this.state = notebookCommon_1.NotebookCellExecutionState.Unconfirmed;
            this.didPause = false;
            this.isPaused = false;
        }
        confirm() {
        }
        update(updates) {
        }
        complete(complete) {
            this.onComplete();
        }
    }
    class TestNotebookExecutionStateService {
        constructor() {
            this._executions = new map_1.ResourceMap();
            this.onDidChangeExecution = new event_1.Emitter().event;
            this.onDidChangeLastRunFailState = new event_1.Emitter().event;
        }
        forceCancelNotebookExecutions(notebookUri) {
        }
        getCellExecutionsForNotebook(notebook) {
            return [];
        }
        getCellExecution(cellUri) {
            return this._executions.get(cellUri);
        }
        createCellExecution(notebook, cellHandle) {
            const onComplete = () => this._executions.delete(notebookCommon_1.CellUri.generate(notebook, cellHandle));
            const exe = new TestCellExecution(notebook, cellHandle, onComplete);
            this._executions.set(notebookCommon_1.CellUri.generate(notebook, cellHandle), exe);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdE5vdGVib29rRWRpdG9yLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvbm90ZWJvb2svdGVzdC9icm93c2VyL3Rlc3ROb3RlYm9va0VkaXRvci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUE4RGhHLE1BQWEsUUFBUyxTQUFRLDZDQUFxQjtRQUNsRCxZQUNRLFFBQWdCLEVBQ3ZCLE1BQWMsRUFDUCxNQUFjLEVBQ3JCLFFBQWdCLEVBQ2hCLFFBQWtCLEVBQ2xCLE9BQXFCLEVBQ3JCLGVBQWlDO1lBRWpDLEtBQUssQ0FBQyx3QkFBTyxDQUFDLFFBQVEsQ0FBQyxTQUFHLENBQUMsS0FBSyxDQUFDLHVCQUF1QixDQUFDLEVBQUUsTUFBTSxDQUFDLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRSxRQUFRLEVBQUUsWUFBSyxDQUFDLElBQUksRUFBRSxRQUFRLEVBQUUsT0FBTyxFQUFFLFNBQVMsRUFBRSxTQUFTLEVBQUUsU0FBUyxFQUFFLEVBQUUscUJBQXFCLEVBQUUsRUFBRSxFQUFFLHlCQUF5QixFQUFFLEVBQUUsRUFBRSxnQkFBZ0IsRUFBRSxLQUFLLEVBQUUsbUJBQW1CLEVBQUUsRUFBRSxFQUFFLEVBQUUsZUFBZSxDQUFDLENBQUM7WUFSeFIsYUFBUSxHQUFSLFFBQVEsQ0FBUTtZQUVoQixXQUFNLEdBQU4sTUFBTSxDQUFRO1FBT3RCLENBQUM7S0FDRDtJQVpELDRCQVlDO0lBRUQsTUFBYSx1QkFBd0IsU0FBUSx5QkFBVztRQWlCdkQsSUFBSSxRQUFRO1lBQ1gsT0FBTyxJQUFJLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQztRQUNoQyxDQUFDO1FBRUQsSUFBSSxRQUFRO1lBQ1gsT0FBTyxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQztRQUMzQixDQUFDO1FBRUQsSUFBSSxRQUFRO1lBQ1gsT0FBTyxJQUFJLENB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