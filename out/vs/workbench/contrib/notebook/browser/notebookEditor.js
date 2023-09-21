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
define(["require", "exports", "vs/base/browser/dom", "vs/base/common/actions", "vs/base/common/async", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/resources", "vs/base/common/uuid", "vs/editor/common/services/textResourceConfiguration", "vs/nls", "vs/platform/contextkey/common/contextkey", "vs/platform/files/common/files", "vs/platform/instantiation/common/instantiation", "vs/platform/storage/common/storage", "vs/platform/telemetry/common/telemetry", "vs/platform/theme/common/themeService", "vs/workbench/browser/parts/editor/editorPane", "vs/workbench/common/editor", "vs/workbench/contrib/notebook/browser/controller/coreActions", "vs/workbench/contrib/notebook/browser/services/notebookEditorService", "vs/workbench/contrib/notebook/browser/viewParts/notebookKernelView", "vs/workbench/contrib/notebook/common/notebookCommon", "vs/workbench/contrib/notebook/common/notebookEditorInput", "vs/workbench/contrib/notebook/common/notebookPerformance", "vs/workbench/services/editor/browser/editorDropService", "vs/workbench/services/editor/common/editorGroupsService", "vs/workbench/services/editor/common/editorService", "vs/platform/progress/common/progress", "vs/workbench/contrib/extensions/browser/extensionsActions", "vs/workbench/contrib/notebook/common/notebookService", "vs/workbench/contrib/extensions/common/extensions", "vs/workbench/services/workingCopy/common/workingCopyBackup", "vs/base/common/buffer", "vs/platform/log/common/log", "vs/workbench/contrib/notebook/common/services/notebookWorkerService"], function (require, exports, DOM, actions_1, async_1, event_1, lifecycle_1, resources_1, uuid_1, textResourceConfiguration_1, nls_1, contextkey_1, files_1, instantiation_1, storage_1, telemetry_1, themeService_1, editorPane_1, editor_1, coreActions_1, notebookEditorService_1, notebookKernelView_1, notebookCommon_1, notebookEditorInput_1, notebookPerformance_1, editorDropService_1, editorGroupsService_1, editorService_1, progress_1, extensionsActions_1, notebookService_1, extensions_1, workingCopyBackup_1, buffer_1, log_1, notebookWorkerService_1) {
    "use strict";
    var NotebookEditor_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.NotebookEditor = void 0;
    const NOTEBOOK_EDITOR_VIEW_STATE_PREFERENCE_KEY = 'NotebookEditorViewState';
    let NotebookEditor = class NotebookEditor extends editorPane_1.EditorPane {
        static { NotebookEditor_1 = this; }
        static { this.ID = notebookCommon_1.NOTEBOOK_EDITOR_ID; }
        get onDidFocus() { return this._onDidFocusWidget.event; }
        get onDidBlur() { return this._onDidBlurWidget.event; }
        constructor(telemetryService, themeService, _instantiationService, storageService, _editorService, _editorGroupService, _editorDropService, _notebookWidgetService, _contextKeyService, _fileService, configurationService, _editorProgressService, _notebookService, _extensionsWorkbenchService, _workingCopyBackupService, logService, _notebookEditorWorkerService) {
            super(NotebookEditor_1.ID, telemetryService, themeService, storageService);
            this._instantiationService = _instantiationService;
            this._editorService = _editorService;
            this._editorGroupService = _editorGroupService;
            this._editorDropService = _editorDropService;
            this._notebookWidgetService = _notebookWidgetService;
            this._contextKeyService = _contextKeyService;
            this._fileService = _fileService;
            this._editorProgressService = _editorProgressService;
            this._notebookService = _notebookService;
            this._extensionsWorkbenchService = _extensionsWorkbenchService;
            this._workingCopyBackupService = _workingCopyBackupService;
            this.logService = logService;
            this._notebookEditorWorkerService = _notebookEditorWorkerService;
            this._groupListener = this._register(new lifecycle_1.DisposableStore());
            this._widgetDisposableStore = this._register(new lifecycle_1.DisposableStore());
            this._widget = { value: undefined };
            this._inputListener = this._register(new lifecycle_1.MutableDisposable());
            // override onDidFocus and onDidBlur to be based on the NotebookEditorWidget element
            this._onDidFocusWidget = this._register(new event_1.Emitter());
            this._onDidBlurWidget = this._register(new event_1.Emitter());
            this._onDidChangeModel = this._register(new event_1.Emitter());
            this.onDidChangeModel = this._onDidChangeModel.event;
            this._onDidChangeSelection = this._register(new event_1.Emitter());
            this.onDidChangeSelection = this._onDidChangeSelection.event;
            this._editorMemento = this.getEditorMemento(_editorGroupService, configurationService, NOTEBOOK_EDITOR_VIEW_STATE_PREFERENCE_KEY);
            this._register(this._fileService.onDidChangeFileSystemProviderCapabilities(e => this._onDidChangeFileSystemProvider(e.scheme)));
            this._register(this._fileService.onDidChangeFileSystemProviderRegistrations(e => this._onDidChangeFileSystemProvider(e.scheme)));
        }
        _onDidChangeFileSystemProvider(scheme) {
            if (this.input instanceof notebookEditorInput_1.NotebookEditorInput && this.input.resource?.scheme === scheme) {
                this._updateReadonly(this.input);
            }
        }
        _onDidChangeInputCapabilities(input) {
            if (this.input === input) {
                this._updateReadonly(input);
            }
        }
        _updateReadonly(input) {
            this._widget.value?.setOptions({ isReadOnly: !!input.isReadonly() });
        }
        get textModel() {
            return this._widget.value?.textModel;
        }
        get minimumWidth() { return 220; }
        get maximumWidth() { return Number.POSITIVE_INFINITY; }
        // these setters need to exist because this extends from EditorPane
        set minimumWidth(value) { }
        set maximumWidth(value) { }
        //#region Editor Core
        get scopedContextKeyService() {
            return this._widget.value?.scopedContextKeyService;
        }
        createEditor(parent) {
            this._rootElement = DOM.append(parent, DOM.$('.notebook-editor'));
            this._rootElement.id = `notebook-editor-element-${(0, uuid_1.generateUuid)()}`;
        }
        getActionViewItem(action) {
            if (action.id === coreActions_1.SELECT_KERNEL_ID) {
                // this is being disposed by the consumer
                return this._instantiationService.createInstance(notebookKernelView_1.NotebooKernelActionViewItem, action, this);
            }
            return undefined;
        }
        getControl() {
            return this._widget.value;
        }
        setEditorVisible(visible, group) {
            super.setEditorVisible(visible, group);
            if (group) {
                this._groupListener.clear();
                this._groupListener.add(group.onWillCloseEditor(e => this._saveEditorViewState(e.editor)));
                this._groupListener.add(group.onDidModelChange(() => {
                    if (this._editorGroupService.activeGroup !== group) {
                        this._widget?.value?.updateEditorFocus();
                    }
                }));
            }
            if (!visible) {
                this._saveEditorViewState(this.input);
                if (this.input && this._widget.value) {
                    // the widget is not transfered to other editor inputs
                    this._widget.value.onWillHide();
                }
            }
        }
        focus() {
            super.focus();
            this._widget.value?.focus();
        }
        hasFocus() {
            const activeElement = document.activeElement;
            const value = this._widget.value;
            return !!value && (DOM.isAncestor(activeElement, value.getDomNode() || DOM.isAncestor(activeElement, value.getOverflowContainerDomNode())));
        }
        async setInput(input, options, context, token, noRetry) {
            try {
                let perfMarksCaptured = false;
                const fileOpenMonitor = (0, async_1.timeout)(10000);
                fileOpenMonitor.then(() => {
                    perfMarksCaptured = true;
                    this._handlePerfMark(perf, input);
                });
                const perf = new notebookPerformance_1.NotebookPerfMarks();
                perf.mark('startTime');
                const group = this.group;
                this._inputListener.value = input.onDidChangeCapabilities(() => this._onDidChangeInputCapabilities(input));
                this._widgetDisposableStore.clear();
                // there currently is a widget which we still own so
                // we need to hide it before getting a new widget
                this._widget.value?.onWillHide();
                this._widget = this._instantiationService.invokeFunction(this._notebookWidgetService.retrieveWidget, group, input, undefined, this._pagePosition?.dimension);
                if (this._rootElement && this._widget.value.getDomNode()) {
                    this._rootElement.setAttribute('aria-flowto', this._widget.value.getDomNode().id || '');
                    DOM.setParentFlowTo(this._widget.value.getDomNode(), this._rootElement);
                }
                this._widgetDisposableStore.add(this._widget.value.onDidChangeModel(() => this._onDidChangeModel.fire()));
                this._widgetDisposableStore.add(this._widget.value.onDidChangeActiveCell(() => this._onDidChangeSelection.fire({ reason: 2 /* EditorPaneSelectionChangeReason.USER */ })));
                if (this._pagePosition) {
                    this._widget.value.layout(this._pagePosition.dimension, this._rootElement, this._pagePosition.position);
                }
                // only now `setInput` and yield/await. this is AFTER the actual widget is ready. This is very important
                // so that others synchronously receive a notebook editor with the correct widget being set
                await super.setInput(input, options, context, token);
                const model = await input.resolve(options, perf);
                perf.mark('inputLoaded');
                // Check for cancellation
                if (token.isCancellationRequested) {
                    return undefined;
                }
                // The widget has been taken away again. This can happen when the tab has been closed while
                // loading was in progress, in particular when open the same resource as different view type.
                // When this happen, retry once
                if (!this._widget.value) {
                    if (noRetry) {
                        return undefined;
                    }
                    return this.setInput(input, options, context, token, true);
                }
                if (model === null) {
                    const knownProvider = this._notebookService.getViewTypeProvider(input.viewType);
                    if (!knownProvider) {
                        throw new Error((0, nls_1.localize)('fail.noEditor', "Cannot open resource with notebook editor type '{0}', please check if you have the right extension installed and enabled.", input.viewType));
                    }
                    await this._extensionsWorkbenchService.whenInitialized;
                    const extensionInfo = this._extensionsWorkbenchService.local.find(e => e.identifier.id === knownProvider);
                    throw (0, editor_1.createEditorOpenError)(new Error((0, nls_1.localize)('fail.noEditor.extensionMissing', "Cannot open resource with notebook editor type '{0}', please check if you have the right extension installed and enabled.", input.viewType)), [
                        (0, actions_1.toAction)({
                            id: 'workbench.notebook.action.installOrEnableMissing', label: extensionInfo
                                ? (0, nls_1.localize)('notebookOpenEnableMissingViewType', "Enable extension for '{0}'", input.viewType)
                                : (0, nls_1.localize)('notebookOpenInstallMissingViewType', "Install extension for '{0}'", input.viewType),
                            run: async () => {
                                const d = this._notebookService.onAddViewType(viewType => {
                                    if (viewType === input.viewType) {
                                        // serializer is registered, try to open again
                                        this._editorService.openEditor({ resource: input.resource });
                                        d.dispose();
                                    }
                                });
                                const extensionInfo = this._extensionsWorkbenchService.local.find(e => e.identifier.id === knownProvider);
                                try {
                                    if (extensionInfo) {
                                        await this._extensionsWorkbenchService.setEnablement(extensionInfo, extensionInfo.enablementState === 7 /* EnablementState.DisabledWorkspace */ ? 9 /* EnablementState.EnabledWorkspace */ : 8 /* EnablementState.EnabledGlobally */);
                                    }
                                    else {
                                        await this._instantiationService.createInstance(extensionsActions_1.InstallRecommendedExtensionAction, knownProvider).run();
                                    }
                                }
                                catch (ex) {
                                    this.logService.error(`Failed to install or enable extension ${knownProvider}`, ex);
                                    d.dispose();
                                }
                            }
                        }),
                        (0, actions_1.toAction)({
                            id: 'workbench.notebook.action.openAsText', label: (0, nls_1.localize)('notebookOpenAsText', "Open As Text"), run: async () => {
                                const backup = await this._workingCopyBackupService.resolve({ resource: input.resource, typeId: notebookCommon_1.NotebookWorkingCopyTypeIdentifier.create(input.viewType) });
                                if (backup) {
                                    // with a backup present, we must resort to opening the backup contents
                                    // as untitled text file to not show the wrong data to the user
                                    const contents = await (0, buffer_1.streamToBuffer)(backup.value);
                                    this._editorService.openEditor({ resource: undefined, contents: contents.toString() });
                                }
                                else {
                                    // without a backup present, we can open the original resource
                                    this._editorService.openEditor({ resource: input.resource, options: { override: editor_1.DEFAULT_EDITOR_ASSOCIATION.id, pinned: true } });
                                }
                            }
                        })
                    ], { allowDialog: true });
                }
                this._widgetDisposableStore.add(model.notebook.onDidChangeContent(() => this._onDidChangeSelection.fire({ reason: 3 /* EditorPaneSelectionChangeReason.EDIT */ })));
                const viewState = options?.viewState ?? this._loadNotebookEditorViewState(input);
                // We might be moving the notebook widget between groups, and these services are tied to the group
                this._widget.value.setParentContextKeyService(this._contextKeyService);
                this._widget.value.setEditorProgressService(this._editorProgressService);
                await this._widget.value.setModel(model.notebook, viewState, perf);
                const isReadOnly = !!input.isReadonly();
                await this._widget.value.setOptions({ ...options, isReadOnly });
                this._widgetDisposableStore.add(this._widget.value.onDidFocusWidget(() => this._onDidFocusWidget.fire()));
                this._widgetDisposableStore.add(this._widget.value.onDidBlurWidget(() => this._onDidBlurWidget.fire()));
                this._widgetDisposableStore.add(this._editorDropService.createEditorDropTarget(this._widget.value.getDomNode(), {
                    containsGroup: (group) => this.group?.id === group.id
                }));
                perf.mark('editorLoaded');
                fileOpenMonitor.cancel();
                if (perfMarksCaptured) {
                    return;
                }
                this._handlePerfMark(perf, input);
                this._handlePromptRecommendations(model.notebook);
            }
            catch (e) {
                this.logService.warn('NotebookEditorWidget#setInput failed', e);
                if ((0, editor_1.isEditorOpenError)(e)) {
                    throw e;
                }
                const error = (0, editor_1.createEditorOpenError)(e instanceof Error ? e : new Error((e ? e.message : '')), [
                    (0, actions_1.toAction)({
                        id: 'workbench.notebook.action.openInTextEditor', label: (0, nls_1.localize)('notebookOpenInTextEditor', "Open in Text Editor"), run: async () => {
                            const activeEditorPane = this._editorService.activeEditorPane;
                            if (!activeEditorPane) {
                                return;
                            }
                            const activeEditorResource = editor_1.EditorResourceAccessor.getCanonicalUri(activeEditorPane.input);
                            if (!activeEditorResource) {
                                return;
                            }
                            if (activeEditorResource.toString() === input.resource?.toString()) {
                                // Replace the current editor with the text editor
                                return this._editorService.openEditor({
                                    resource: activeEditorResource,
                                    options: {
                                        override: editor_1.DEFAULT_EDITOR_ASSOCIATION.id,
                                        pinned: true // new file gets pinned by default
                                    }
                                });
                            }
                            return;
                        }
                    })
                ], { allowDialog: true });
                throw error;
            }
        }
        _handlePerfMark(perf, input) {
            const perfMarks = perf.value;
            const startTime = perfMarks['startTime'];
            const extensionActivated = perfMarks['extensionActivated'];
            const inputLoaded = perfMarks['inputLoaded'];
            const customMarkdownLoaded = perfMarks['customMarkdownLoaded'];
            const editorLoaded = perfMarks['editorLoaded'];
            let extensionActivationTimespan = -1;
            let inputLoadingTimespan = -1;
            let webviewCommLoadingTimespan = -1;
            let customMarkdownLoadingTimespan = -1;
            let editorLoadingTimespan = -1;
            if (startTime !== undefined && extensionActivated !== undefined) {
                extensionActivationTimespan = extensionActivated - startTime;
                if (inputLoaded !== undefined) {
                    inputLoadingTimespan = inputLoaded - extensionActivated;
                    webviewCommLoadingTimespan = inputLoaded - extensionActivated; // TODO@rebornix, we don't track webview comm anymore
                }
                if (customMarkdownLoaded !== undefined) {
                    customMarkdownLoadingTimespan = customMarkdownLoaded - startTime;
                }
                if (editorLoaded !== undefined) {
                    editorLoadingTimespan = editorLoaded - startTime;
                }
            }
            this.telemetryService.publicLog2('notebook/editorOpenPerf', {
                scheme: input.resource.scheme,
                ext: (0, resources_1.extname)(input.resource),
                viewType: input.viewType,
                extensionActivated: extensionActivationTimespan,
                inputLoaded: inputLoadingTimespan,
                webviewCommLoaded: webviewCommLoadingTimespan,
                customMarkdownLoaded: customMarkdownLoadingTimespan,
                editorLoaded: editorLoadingTimespan
            });
        }
        _handlePromptRecommendations(model) {
            this._notebookEditorWorkerService.canPromptRecommendation(model.uri).then(shouldPrompt => {
                this.telemetryService.publicLog2('notebook/shouldPromptRecommendation', {
                    shouldPrompt: shouldPrompt
                });
            });
        }
        clearInput() {
            this._inputListener.clear();
            if (this._widget.value) {
                this._saveEditorViewState(this.input);
                this._widget.value.onWillHide();
            }
            super.clearInput();
        }
        setOptions(options) {
            this._widget.value?.setOptions(options);
            super.setOptions(options);
        }
        saveState() {
            this._saveEditorViewState(this.input);
            super.saveState();
        }
        getViewState() {
            const input = this.input;
            if (!(input instanceof notebookEditorInput_1.NotebookEditorInput)) {
                return undefined;
            }
            this._saveEditorViewState(input);
            return this._loadNotebookEditorViewState(input);
        }
        getSelection() {
            if (this._widget.value) {
                const activeCell = this._widget.value.getActiveCell();
                if (activeCell) {
                    const cellUri = activeCell.uri;
                    return new NotebookEditorSelection(cellUri, activeCell.getSelections());
                }
            }
            return undefined;
        }
        _saveEditorViewState(input) {
            if (this.group && this._widget.value && input instanceof notebookEditorInput_1.NotebookEditorInput) {
                if (this._widget.value.isDisposed) {
                    return;
                }
                const state = this._widget.value.getEditorViewState();
                this._editorMemento.saveEditorState(this.group, input.resource, state);
            }
        }
        _loadNotebookEditorViewState(input) {
            let result;
            if (this.group) {
                result = this._editorMemento.loadEditorState(this.group, input.resource);
            }
            if (result) {
                return result;
            }
            // when we don't have a view state for the group/input-tuple then we try to use an existing
            // editor for the same resource.
            for (const group of this._editorGroupService.getGroups(1 /* GroupsOrder.MOST_RECENTLY_ACTIVE */)) {
                if (group.activeEditorPane !== this && group.activeEditorPane instanceof NotebookEditor_1 && group.activeEditor?.matches(input)) {
                    return group.activeEditorPane._widget.value?.getEditorViewState();
                }
            }
            return;
        }
        layout(dimension, position) {
            this._rootElement.classList.toggle('mid-width', dimension.width < 1000 && dimension.width >= 600);
            this._rootElement.classList.toggle('narrow-width', dimension.width < 600);
            this._pagePosition = { dimension, position };
            if (!this._widget.value || !(this._input instanceof notebookEditorInput_1.NotebookEditorInput)) {
                return;
            }
            if (this._input.resource.toString() !== this.textModel?.uri.toString() && this._widget.value?.hasModel()) {
                // input and widget mismatch
                // this happens when
                // 1. open document A, pin the document
                // 2. open document B
                // 3. close document B
                // 4. a layout is triggered
                return;
            }
            this._widget.value.layout(dimension, this._rootElement, position);
        }
    };
    exports.NotebookEditor = NotebookEditor;
    exports.NotebookEditor = NotebookEditor = NotebookEditor_1 = __decorate([
        __param(0, telemetry_1.ITelemetryService),
        __param(1, themeService_1.IThemeService),
        __param(2, instantiation_1.IInstantiationService),
        __param(3, storage_1.IStorageService),
        __param(4, editorService_1.IEditorService),
        __param(5, editorGroupsService_1.IEditorGroupsService),
        __param(6, editorDropService_1.IEditorDropService),
        __param(7, notebookEditorService_1.INotebookEditorService),
        __param(8, contextkey_1.IContextKeyService),
        __param(9, files_1.IFileService),
        __param(10, textResourceConfiguration_1.ITextResourceConfigurationService),
        __param(11, progress_1.IEditorProgressService),
        __param(12, notebookService_1.INotebookService),
        __param(13, extensions_1.IExtensionsWorkbenchService),
        __param(14, workingCopyBackup_1.IWorkingCopyBackupService),
        __param(15, log_1.ILogService),
        __param(16, notebookWorkerService_1.INotebookEditorWorkerService)
    ], NotebookEditor);
    class NotebookEditorSelection {
        constructor(cellUri, selections) {
            this.cellUri = cellUri;
            this.selections = selections;
        }
        compare(other) {
            if (!(other instanceof NotebookEditorSelection)) {
                return 3 /* EditorPaneSelectionCompareResult.DIFFERENT */;
            }
            if ((0, resources_1.isEqual)(this.cellUri, other.cellUri)) {
                return 1 /* EditorPaneSelectionCompareResult.IDENTICAL */;
            }
            return 3 /* EditorPaneSelectionCompareResult.DIFFERENT */;
        }
        restore(options) {
            const notebookOptions = {
                cellOptions: {
                    resource: this.cellUri,
                    options: {
                        selection: this.selections[0]
                    }
                }
            };
            Object.assign(notebookOptions, options);
            return notebookOptions;
        }
        log() {
            return this.cellUri.fragment;
        }
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm90ZWJvb2tFZGl0b3IuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9ub3RlYm9vay9icm93c2VyL25vdGVib29rRWRpdG9yLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7Ozs7SUErQ2hHLE1BQU0seUNBQXlDLEdBQUcseUJBQXlCLENBQUM7SUFFckUsSUFBTSxjQUFjLEdBQXBCLE1BQU0sY0FBZSxTQUFRLHVCQUFVOztpQkFDN0IsT0FBRSxHQUFXLG1DQUFrQixBQUE3QixDQUE4QjtRQWFoRCxJQUFhLFVBQVUsS0FBa0IsT0FBTyxJQUFJLENBQUMsaUJBQWlCLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztRQUUvRSxJQUFhLFNBQVMsS0FBa0IsT0FBTyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztRQVE3RSxZQUNvQixnQkFBbUMsRUFDdkMsWUFBMkIsRUFDbkIscUJBQTZELEVBQ25FLGNBQStCLEVBQ2hDLGNBQStDLEVBQ3pDLG1CQUEwRCxFQUM1RCxrQkFBdUQsRUFDbkQsc0JBQStELEVBQ25FLGtCQUF1RCxFQUM3RCxZQUEyQyxFQUN0QixvQkFBdUQsRUFDbEUsc0JBQStELEVBQ3JFLGdCQUFtRCxFQUN4QywyQkFBeUUsRUFDM0UseUJBQXFFLEVBQ25GLFVBQXdDLEVBQ3ZCLDRCQUEyRTtZQUV6RyxLQUFLLENBQUMsZ0JBQWMsQ0FBQyxFQUFFLEVBQUUsZ0JBQWdCLEVBQUUsWUFBWSxFQUFFLGNBQWMsQ0FBQyxDQUFDO1lBaEJqQywwQkFBcUIsR0FBckIscUJBQXFCLENBQXVCO1lBRW5ELG1CQUFjLEdBQWQsY0FBYyxDQUFnQjtZQUN4Qix3QkFBbUIsR0FBbkIsbUJBQW1CLENBQXNCO1lBQzNDLHVCQUFrQixHQUFsQixrQkFBa0IsQ0FBb0I7WUFDbEMsMkJBQXNCLEdBQXRC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