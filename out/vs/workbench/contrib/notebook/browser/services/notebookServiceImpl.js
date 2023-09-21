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
define(["require", "exports", "vs/nls", "vs/base/common/actions", "vs/base/common/errorMessage", "vs/base/browser/browser", "vs/base/common/event", "vs/base/common/iterator", "vs/base/common/lazy", "vs/base/common/lifecycle", "vs/base/common/map", "vs/base/common/network", "vs/base/common/types", "vs/base/common/uri", "vs/editor/browser/services/codeEditorService", "vs/editor/common/config/fontInfo", "vs/platform/accessibility/common/accessibility", "vs/platform/configuration/common/configuration", "vs/platform/files/common/files", "vs/platform/instantiation/common/instantiation", "vs/platform/storage/common/storage", "vs/workbench/common/memento", "vs/workbench/contrib/notebook/browser/notebookExtensionPoint", "vs/workbench/contrib/notebook/common/notebookDiffEditorInput", "vs/workbench/contrib/notebook/common/model/notebookTextModel", "vs/workbench/contrib/notebook/common/notebookCommon", "vs/workbench/contrib/notebook/common/notebookEditorInput", "vs/workbench/contrib/notebook/common/notebookEditorModelResolverService", "vs/workbench/contrib/notebook/browser/notebookOptions", "vs/workbench/contrib/notebook/common/notebookOutputRenderer", "vs/workbench/contrib/notebook/common/notebookProvider", "vs/workbench/contrib/notebook/common/notebookService", "vs/workbench/services/editor/common/editorResolverService", "vs/workbench/services/extensions/common/extensions", "vs/workbench/contrib/extensions/browser/extensionsActions"], function (require, exports, nls_1, actions_1, errorMessage_1, browser_1, event_1, iterator_1, lazy_1, lifecycle_1, map_1, network_1, types_1, uri_1, codeEditorService_1, fontInfo_1, accessibility_1, configuration_1, files_1, instantiation_1, storage_1, memento_1, notebookExtensionPoint_1, notebookDiffEditorInput_1, notebookTextModel_1, notebookCommon_1, notebookEditorInput_1, notebookEditorModelResolverService_1, notebookOptions_1, notebookOutputRenderer_1, notebookProvider_1, notebookService_1, editorResolverService_1, extensions_1, extensionsActions_1) {
    "use strict";
    var NotebookProviderInfoStore_1, NotebookService_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.NotebookService = exports.NotebookOutputRendererInfoStore = exports.NotebookProviderInfoStore = void 0;
    let NotebookProviderInfoStore = class NotebookProviderInfoStore extends lifecycle_1.Disposable {
        static { NotebookProviderInfoStore_1 = this; }
        static { this.CUSTOM_EDITORS_STORAGE_ID = 'notebookEditors'; }
        static { this.CUSTOM_EDITORS_ENTRY_ID = 'editors'; }
        constructor(storageService, extensionService, _editorResolverService, _configurationService, _accessibilityService, _instantiationService, _fileService, _notebookEditorModelResolverService) {
            super();
            this._editorResolverService = _editorResolverService;
            this._configurationService = _configurationService;
            this._accessibilityService = _accessibilityService;
            this._instantiationService = _instantiationService;
            this._fileService = _fileService;
            this._notebookEditorModelResolverService = _notebookEditorModelResolverService;
            this._handled = false;
            this._contributedEditors = new Map();
            this._contributedEditorDisposables = this._register(new lifecycle_1.DisposableStore());
            this._memento = new memento_1.Memento(NotebookProviderInfoStore_1.CUSTOM_EDITORS_STORAGE_ID, storageService);
            const mementoObject = this._memento.getMemento(0 /* StorageScope.PROFILE */, 1 /* StorageTarget.MACHINE */);
            // Process the notebook contributions but buffer changes from the resolver
            this._editorResolverService.bufferChangeEvents(() => {
                for (const info of (mementoObject[NotebookProviderInfoStore_1.CUSTOM_EDITORS_ENTRY_ID] || [])) {
                    this.add(new notebookProvider_1.NotebookProviderInfo(info));
                }
            });
            this._register(extensionService.onDidRegisterExtensions(() => {
                if (!this._handled) {
                    // there is no extension point registered for notebook content provider
                    // clear the memento and cache
                    this._clear();
                    mementoObject[NotebookProviderInfoStore_1.CUSTOM_EDITORS_ENTRY_ID] = [];
                    this._memento.saveMemento();
                }
            }));
            notebookExtensionPoint_1.notebooksExtensionPoint.setHandler(extensions => this._setupHandler(extensions));
        }
        dispose() {
            this._clear();
            super.dispose();
        }
        _setupHandler(extensions) {
            this._handled = true;
            const builtins = [...this._contributedEditors.values()].filter(info => !info.extension);
            this._clear();
            const builtinProvidersFromCache = new Map();
            builtins.forEach(builtin => {
                builtinProvidersFromCache.set(builtin.id, this.add(builtin));
            });
            for (const extension of extensions) {
                for (const notebookContribution of extension.value) {
                    if (!notebookContribution.type) {
                        extension.collector.error(`Notebook does not specify type-property`);
                        continue;
                    }
                    const existing = this.get(notebookContribution.type);
                    if (existing) {
                        if (!existing.extension && extension.description.isBuiltin && builtins.find(builtin => builtin.id === notebookContribution.type)) {
                            // we are registering an extension which is using the same view type which is already cached
                            builtinProvidersFromCache.get(notebookContribution.type)?.dispose();
                        }
                        else {
                            extension.collector.error(`Notebook type '${notebookContribution.type}' already used`);
                            continue;
                        }
                    }
                    this.add(new notebookProvider_1.NotebookProviderInfo({
                        extension: extension.description.identifier,
                        id: notebookContribution.type,
                        displayName: notebookContribution.displayName,
                        selectors: notebookContribution.selector || [],
                        priority: this._convertPriority(notebookContribution.priority),
                        providerDisplayName: extension.description.displayName ?? extension.description.identifier.value,
                        exclusive: false
                    }));
                }
            }
            const mementoObject = this._memento.getMemento(0 /* StorageScope.PROFILE */, 1 /* StorageTarget.MACHINE */);
            mementoObject[NotebookProviderInfoStore_1.CUSTOM_EDITORS_ENTRY_ID] = Array.from(this._contributedEditors.values());
            this._memento.saveMemento();
        }
        clearEditorCache() {
            const mementoObject = this._memento.getMemento(0 /* StorageScope.PROFILE */, 1 /* StorageTarget.MACHINE */);
            mementoObject[NotebookProviderInfoStore_1.CUSTOM_EDITORS_ENTRY_ID] = [];
            this._memento.saveMemento();
        }
        _convertPriority(priority) {
            if (!priority) {
                return editorResolverService_1.RegisteredEditorPriority.default;
            }
            if (priority === notebookCommon_1.NotebookEditorPriority.default) {
                return editorResolverService_1.RegisteredEditorPriority.default;
            }
            return editorResolverService_1.RegisteredEditorPriority.option;
        }
        _registerContributionPoint(notebookProviderInfo) {
            const disposables = new lifecycle_1.DisposableStore();
            for (const selector of notebookProviderInfo.selectors) {
                const globPattern = selector.include || selector;
                const notebookEditorInfo = {
                    id: notebookProviderInfo.id,
                    label: notebookProviderInfo.displayName,
                    detail: notebookProviderInfo.providerDisplayName,
                    priority: notebookProviderInfo.exclusive ? editorResolverService_1.RegisteredEditorPriority.exclusive : notebookProviderInfo.priority,
                };
                const notebookEditorOptions = {
                    canHandleDiff: () => !!this._configurationService.getValue(notebookCommon_1.NotebookSetting.textDiffEditorPreview) && !this._accessibilityService.isScreenReaderOptimized(),
                    canSupportResource: (resource) => resource.scheme === network_1.Schemas.untitled || resource.scheme === network_1.Schemas.vscodeNotebookCell || this._fileService.hasProvider(resource)
                };
                const notebookEditorInputFactory = ({ resource, options }) => {
                    const data = notebookCommon_1.CellUri.parse(resource);
                    let notebookUri = resource;
                    let cellOptions;
                    if (data) {
                        notebookUri = data.notebook;
                        cellOptions = { resource, options };
                    }
                    if (!cellOptions) {
                        cellOptions = options?.cellOptions;
                    }
                    const notebookOptions = { ...options, cellOptions };
                    return { editor: notebookEditorInput_1.NotebookEditorInput.create(this._instantiationService, notebookUri, notebookProviderInfo.id), options: notebookOptions };
                };
                const notebookUntitledEditorFactory = async ({ resource, options }) => {
                    const ref = await this._notebookEditorModelResolverService.resolve({ untitledResource: resource }, notebookProviderInfo.id);
                    // untitled notebooks are disposed when they get saved. we should not hold a reference
                    // to such a disposed notebook and therefore dispose the reference as well
                    ref.object.notebook.onWillDispose(() => {
                        ref.dispose();
                    });
                    return { editor: notebookEditorInput_1.NotebookEditorInput.create(this._instantiationService, ref.object.resource, notebookProviderInfo.id), options };
                };
                const notebookDiffEditorInputFactory = ({ modified, original, label, description }) => {
                    return { editor: notebookDiffEditorInput_1.NotebookDiffEditorInput.create(this._instantiationService, modified.resource, label, description, original.resource, notebookProviderInfo.id) };
                };
                const notebookFactoryObject = {
                    createEditorInput: notebookEditorInputFactory,
                    createDiffEditorInput: notebookDiffEditorInputFactory,
                    createUntitledEditorInput: notebookUntitledEditorFactory,
                };
                const notebookCellFactoryObject = {
                    createEditorInput: notebookEditorInputFactory,
                    createDiffEditorInput: notebookDiffEditorInputFactory,
                };
                // TODO @lramos15 find a better way to toggle handling diff editors than needing these listeners for every registration
                // This is a lot of event listeners especially if there are many notebooks
                disposables.add(this._configurationService.onDidChangeConfiguration(e => {
                    if (e.affectsConfiguration(notebookCommon_1.NotebookSetting.textDiffEditorPreview)) {
                        const canHandleDiff = !!this._configurationService.getValue(notebookCommon_1.NotebookSetting.textDiffEditorPreview) && !this._accessibilityService.isScreenReaderOptimized();
                        if (canHandleDiff) {
                            notebookFactoryObject.createDiffEditorInput = notebookDiffEditorInputFactory;
                            notebookCellFactoryObject.createDiffEditorInput = notebookDiffEditorInputFactory;
                        }
                        else {
                            notebookFactoryObject.createDiffEditorInput = undefined;
                            notebookCellFactoryObject.createDiffEditorInput = undefined;
                        }
                    }
                }));
                disposables.add(this._accessibilityService.onDidChangeScreenReaderOptimized(() => {
                    const canHandleDiff = !!this._configurationService.getValue(notebookCommon_1.NotebookSetting.textDiffEditorPreview) && !this._accessibilityService.isScreenReaderOptimized();
                    if (canHandleDiff) {
                        notebookFactoryObject.createDiffEditorInput = notebookDiffEditorInputFactory;
                        notebookCellFactoryObject.createDiffEditorInput = notebookDiffEditorInputFactory;
                    }
                    else {
                        notebookFactoryObject.createDiffEditorInput = undefined;
                        notebookCellFactoryObject.createDiffEditorInput = undefined;
                    }
                }));
                // Register the notebook editor
                disposables.add(this._editorResolverService.registerEditor(globPattern, notebookEditorInfo, notebookEditorOptions, notebookFactoryObject));
                // Then register the schema handler as exclusive for that notebook
                disposables.add(this._editorResolverService.registerEditor(`${network_1.Schemas.vscodeNotebookCell}:/**/${globPattern}`, { ...notebookEditorInfo, priority: editorResolverService_1.RegisteredEditorPriority.exclusive }, notebookEditorOptions, notebookCellFactoryObject));
            }
            return disposables;
        }
        _clear() {
            this._contributedEditors.clear();
            this._contributedEditorDisposables.clear();
        }
        get(viewType) {
            return this._contributedEditors.get(viewType);
        }
        add(info) {
            if (this._contributedEditors.has(info.id)) {
                throw new Error(`notebook type '${info.id}' ALREADY EXISTS`);
            }
            this._contributedEditors.set(info.id, info);
            let editorRegistration;
            // built-in notebook providers contribute their own editors
            if (info.extension) {
                editorRegistration = this._registerContributionPoint(info);
                this._contributedEditorDisposables.add(editorRegistration);
            }
            const mementoObject = this._memento.getMemento(0 /* StorageScope.PROFILE */, 1 /* StorageTarget.MACHINE */);
            mementoObject[NotebookProviderInfoStore_1.CUSTOM_EDITORS_ENTRY_ID] = Array.from(this._contributedEditors.values());
            this._memento.saveMemento();
            return this._register((0, lifecycle_1.toDisposable)(() => {
                const mementoObject = this._memento.getMemento(0 /* StorageScope.PROFILE */, 1 /* StorageTarget.MACHINE */);
                mementoObject[NotebookProviderInfoStore_1.CUSTOM_EDITORS_ENTRY_ID] = Array.from(this._contributedEditors.values());
                this._memento.saveMemento();
                editorRegistration?.dispose();
                this._contributedEditors.delete(info.id);
            }));
        }
        getContributedNotebook(resource) {
            const result = [];
            for (const info of this._contributedEditors.values()) {
                if (info.matches(resource)) {
                    result.push(info);
                }
            }
            if (result.length === 0 && resource.scheme === network_1.Schemas.untitled) {
                // untitled resource and no path-specific match => all providers apply
                return Array.from(this._contributedEditors.values());
            }
            return result;
        }
        [Symbol.iterator]() {
            return this._contributedEditors.values();
        }
    };
    exports.NotebookProviderInfoStore = NotebookProviderInfoStore;
    exports.NotebookProviderInfoStore = NotebookProviderInfoStore = NotebookProviderInfoStore_1 = __decorate([
        __param(0, storage_1.IStorageService),
        __param(1, extensions_1.IExtensionService),
        __param(2, editorResolverService_1.IEditorResolverService),
        __param(3, configuration_1.IConfigurationService),
        __param(4, accessibility_1.IAccessibilityService),
        __param(5, instantiation_1.IInstantiationService),
        __param(6, files_1.IFileService),
        __param(7, notebookEditorModelResolverService_1.INotebookEditorModelResolverService)
    ], NotebookProviderInfoStore);
    let NotebookOutputRendererInfoStore = class NotebookOutputRendererInfoStore {
        constructor(storageService) {
            this.contributedRenderers = new Map();
            this.preferredMimetype = new lazy_1.Lazy(() => this.preferredMimetypeMemento.getMemento(1 /* StorageScope.WORKSPACE */, 1 /* StorageTarget.MACHINE */));
            this.preferredMimetypeMemento = new memento_1.Memento('workbench.editor.notebook.preferredRenderer2', storageService);
        }
        clear() {
            this.contributedRenderers.clear();
        }
        get(rendererId) {
            return this.contributedRenderers.get(rendererId);
        }
        getAll() {
            return Array.from(this.contributedRenderers.values());
        }
        add(info) {
            if (this.contributedRenderers.has(info.id)) {
                return;
            }
            this.contributedRenderers.set(info.id, info);
        }
        /** Update and remember the preferred renderer for the given mimetype in this workspace */
        setPreferred(notebookProviderInfo, mimeType, rendererId) {
            const mementoObj = this.preferredMimetype.value;
            const forNotebook = mementoObj[notebookProviderInfo.id];
            if (forNotebook) {
                forNotebook[mimeType] = rendererId;
            }
            else {
                mementoObj[notebookProviderInfo.id] = { [mimeType]: rendererId };
            }
            this.preferredMimetypeMemento.saveMemento();
        }
        findBestRenderers(notebookProviderInfo, mimeType, kernelProvides) {
            let ReuseOrder;
            (function (ReuseOrder) {
                ReuseOrder[ReuseOrder["PreviouslySelected"] = 256] = "PreviouslySelected";
                ReuseOrder[ReuseOrder["SameExtensionAsNotebook"] = 512] = "SameExtensionAsNotebook";
                ReuseOrder[ReuseOrder["OtherRenderer"] = 768] = "OtherRenderer";
                ReuseOrder[ReuseOrder["BuiltIn"] = 1024] = "BuiltIn";
            })(ReuseOrder || (ReuseOrder = {}));
            const preferred = notebookProviderInfo && this.preferredMimetype.value[notebookProviderInfo.id]?.[mimeType];
            const notebookExtId = notebookProviderInfo?.extension?.value;
            const notebookId = notebookProviderInfo?.id;
            const renderers = Array.from(this.contributedRenderers.values())
                .map(renderer => {
                const ownScore = kernelProvides === undefined
                    ? renderer.matchesWithoutKernel(mimeType)
                    : renderer.matches(mimeType, kernelProvides);
                if (ownScore === 3 /* NotebookRendererMatch.Never */) {
                    return undefined;
                }
                const rendererExtId = renderer.extensionId.value;
                const reuseScore = preferred === renderer.id
                    ? 256 /* ReuseOrder.PreviouslySelected */
                    : rendererExtId === notebookExtId || notebookCommon_1.RENDERER_EQUIVALENT_EXTENSIONS.get(rendererExtId)?.has(notebookId)
                        ? 512 /* ReuseOrder.SameExtensionAsNotebook */
                        : renderer.isBuiltin ? 1024 /* ReuseOrder.BuiltIn */ : 768 /* ReuseOrder.OtherRenderer */;
                return {
                    ordered: { mimeType, rendererId: renderer.id, isTrusted: true },
                    score: reuseScore | ownScore,
                };
            }).filter(types_1.isDefined);
            if (renderers.length === 0) {
                return [{ mimeType, rendererId: notebookCommon_1.RENDERER_NOT_AVAILABLE, isTrusted: true }];
            }
            return renderers.sort((a, b) => a.score - b.score).map(r => r.ordered);
        }
    };
    exports.NotebookOutputRendererInfoStore = NotebookOutputRendererInfoStore;
    exports.NotebookOutputRendererInfoStore = NotebookOutputRendererInfoStore = __decorate([
        __param(0, storage_1.IStorageService)
    ], NotebookOutputRendererInfoStore);
    class ModelData {
        constructor(model, onWillDispose) {
            this.model = model;
            this._modelEventListeners = new lifecycle_1.DisposableStore();
            this._modelEventListeners.add(model.onWillDispose(() => onWillDispose(model)));
        }
        dispose() {
            this._modelEventListeners.dispose();
        }
    }
    let NotebookService = class NotebookService extends lifecycle_1.Disposable {
        static { NotebookService_1 = this; }
        static { this._storageNotebookViewTypeProvider = 'notebook.viewTypeProvider'; }
        get notebookProviderInfoStore() {
            if (!this._notebookProviderInfoStore) {
                this._notebookProviderInfoStore = this._register(this._instantiationService.createInstance(NotebookProviderInfoStore));
            }
            return this._notebookProviderInfoStore;
        }
        constructor(_extensionService, _configurationService, _accessibilityService, _instantiationService, _codeEditorService, configurationService, _storageService) {
            super();
            this._extensionService = _extensionService;
            this._configurationService = _configurationService;
            this._accessibilityService = _accessibilityService;
            this._instantiationService = _instantiationService;
            this._codeEditorService = _codeEditorService;
            this.configurationService = configurationService;
            this._storageService = _storageService;
            this._notebookProviders = new Map();
            this._notebookProviderInfoStore = undefined;
            this._notebookRenderersInfoStore = this._instantiationService.createInstance(NotebookOutputRendererInfoStore);
            this._onDidChangeOutputRenderers = this._register(new event_1.Emitter());
            this.onDidChangeOutputRenderers = this._onDidChangeOutputRenderers.event;
            this._notebookStaticPreloadInfoStore = new Set();
            this._models = new map_1.ResourceMap();
            this._onWillAddNotebookDocument = this._register(new event_1.Emitter());
            this._onDidAddNotebookDocument = this._register(new event_1.Emitter());
            this._onWillRemoveNotebookDocument = this._register(new event_1.Emitter());
            this._onDidRemoveNotebookDocument = this._register(new event_1.Emitter());
            this.onWillAddNotebookDocument = this._onWillAddNotebookDocument.event;
            this.onDidAddNotebookDocument = this._onDidAddNotebookDocument.event;
            this.onDidRemoveNotebookDocument = this._onDidRemoveNotebookDocument.event;
            this.onWillRemoveNotebookDocument = this._onWillRemoveNotebookDocument.event;
            this._onAddViewType = this._register(new event_1.Emitter());
            this.onAddViewType = this._onAddViewType.event;
            this._onWillRemoveViewType = this._register(new event_1.Emitter());
            this.onWillRemoveViewType = this._onWillRemoveViewType.event;
            this._onDidChangeEditorTypes = this._register(new event_1.Emitter());
            this.onDidChangeEditorTypes = this._onDidChangeEditorTypes.event;
            this._lastClipboardIsCopy = true;
            notebookExtensionPoint_1.notebookRendererExtensionPoint.setHandler((renderers) => {
                this._notebookRenderersInfoStore.clear();
                for (const extension of renderers) {
                    for (const notebookContribution of extension.value) {
                        if (!notebookContribution.entrypoint) { // avoid crashing
                            extension.collector.error(`Notebook renderer does not specify entry point`);
                            continue;
                        }
                        const id = notebookContribution.id;
                        if (!id) {
                            extension.collector.error(`Notebook renderer does not specify id-property`);
                            continue;
                        }
                        this._notebookRenderersInfoStore.add(new notebookOutputRenderer_1.NotebookOutputRendererInfo({
                            id,
                            extension: extension.description,
                            entrypoint: notebookContribution.entrypoint,
                            displayName: notebookContribution.displayName,
                            mimeTypes: notebookContribution.mimeTypes || [],
                            dependencies: notebookContribution.dependencies,
                            optionalDependencies: notebookContribution.optionalDependencies,
                            requiresMessaging: notebookContribution.requiresMessaging,
                        }));
                    }
                }
                this._onDidChangeOutputRenderers.fire();
            });
            notebookExtensionPoint_1.notebookPreloadExtensionPoint.setHandler(extensions => {
                this._notebookStaticPreloadInfoStore.clear();
                for (const extension of extensions) {
                    if (!(0, extensions_1.isProposedApiEnabled)(extension.description, 'contribNotebookStaticPreloads')) {
                        continue;
                    }
                    for (const notebookContribution of extension.value) {
                        if (!notebookContribution.entrypoint) { // avoid crashing
                            extension.collector.error(`Notebook preload does not specify entry point`);
                            continue;
                        }
                        const type = notebookContribution.type;
                        if (!type) {
                            extension.collector.error(`Notebook preload does not specify type-property`);
                            continue;
                        }
                        this._notebookStaticPreloadInfoStore.add(new notebookOutputRenderer_1.NotebookStaticPreloadInfo({
                            type,
                            extension: extension.description,
                            entrypoint: notebookContribution.entrypoint,
                            localResourceRoots: notebookContribution.localResourceRoots ?? [],
                        }));
                    }
                }
            });
            const updateOrder = () => {
                this._displayOrder = new notebookCommon_1.MimeTypeDisplayOrder(this._configurationService.getValue(notebookCommon_1.NotebookSetting.displayOrder) || [], this._accessibilityService.isScreenReaderOptimized()
                    ? notebookCommon_1.ACCESSIBLE_NOTEBOOK_DISPLAY_ORDER
                    : notebookCommon_1.NOTEBOOK_DISPLAY_ORDER);
            };
            updateOrder();
            this._register(this._configurationService.onDidChangeConfiguration(e => {
                if (e.affectsConfiguration(notebookCommon_1.NotebookSetting.displayOrder)) {
                    updateOrder();
                }
            }));
            this._register(this._accessibilityService.onDidChangeScreenReaderOptimized(() => {
                updateOrder();
            }));
            let decorationTriggeredAdjustment = false;
            const decorationCheckSet = new Set();
            const onDidAddDecorationType = (e) => {
                if (decorationTriggeredAdjustment) {
                    return;
                }
                if (decorationCheckSet.has(e)) {
                    return;
                }
                const options = this._codeEditorService.resolveDecorationOptions(e, true);
                if (options.afterContentClassName || options.beforeContentClassName) {
                    const cssRules = this._codeEditorService.resolveDecorationCSSRules(e);
                    if (cssRules !== null) {
                        for (let i = 0; i < cssRules.length; i++) {
                            // The following ways to index into the list are equivalent
                            if ((cssRules[i].selectorText.endsWith('::after') || cssRules[i].selectorText.endsWith('::after'))
                                && cssRules[i].cssText.indexOf('top:') > -1) {
                                // there is a `::before` or `::after` text decoration whose position is above or below current line
                                // we at least make sure that the editor top padding is at least one line
                                const editorOptions = this.configurationService.getValue('editor');
                                (0, notebookOptions_1.updateEditorTopPadding)(fontInfo_1.BareFontInfo.createFromRawSettings(editorOptions, browser_1.PixelRatio.value).lineHeight + 2);
                                decorationTriggeredAdjustment = true;
                                break;
                            }
                        }
                    }
                }
                decorationCheckSet.add(e);
            };
            this._register(this._codeEditorService.onDecorationTypeRegistered(onDidAddDecorationType));
            this._codeEditorService.listDecorationTypes().forEach(onDidAddDecorationType);
            this._memento = new memento_1.Memento(NotebookService_1._storageNotebookViewTypeProvider, this._storageService);
            this._viewTypeCache = this._memento.getMemento(1 /* StorageScope.WORKSPACE */, 1 /* StorageTarget.MACHINE */);
        }
        getEditorTypes() {
            return [...this.notebookProviderInfoStore].map(info => ({
                id: info.id,
                displayName: info.displayName,
                providerDisplayName: info.providerDisplayName
            }));
        }
        clearEditorCache() {
            this.notebookProviderInfoStore.clearEditorCache();
        }
        _postDocumentOpenActivation(viewType) {
            // send out activations on notebook text model creation
            this._extensionService.activateByEvent(`onNotebook:${viewType}`);
            this._extensionService.activateByEvent(`onNotebook:*`);
        }
        async canResolve(viewType) {
            if (this._notebookProviders.has(viewType)) {
                return true;
            }
            await this._extensionService.whenInstalledExtensionsRegistered();
            await this._extensionService.activateByEvent(`onNotebookSerializer:${viewType}`);
            return this._notebookProviders.has(viewType);
        }
        registerContributedNotebookType(viewType, data) {
            const info = new notebookProvider_1.NotebookProviderInfo({
                extension: data.extension,
                id: viewType,
                displayName: data.displayName,
                providerDisplayName: data.providerDisplayName,
                exclusive: data.exclusive,
                priority: editorResolverService_1.RegisteredEditorPriority.default,
                selectors: []
            });
            info.update({ selectors: data.filenamePattern });
            const reg = this.notebookProviderInfoStore.add(info);
            this._onDidChangeEditorTypes.fire();
            return (0, lifecycle_1.toDisposable)(() => {
                reg.dispose();
                this._onDidChangeEditorTypes.fire();
            });
        }
        _registerProviderData(viewType, data) {
            if (this._notebookProviders.has(viewType)) {
                throw new Error(`notebook provider for viewtype '${viewType}' already exists`);
            }
            this._notebookProviders.set(viewType, data);
            this._onAddViewType.fire(viewType);
            return (0, lifecycle_1.toDisposable)(() => {
                this._onWillRemoveViewType.fire(viewType);
                this._notebookProviders.delete(viewType);
            });
        }
        registerNotebookSerializer(viewType, extensionData, serializer) {
            this.notebookProviderInfoStore.get(viewType)?.update({ options: serializer.options });
            this._viewTypeCache[viewType] = extensionData.id.value;
            this._persistMementos();
            return this._registerProviderData(viewType, new notebookService_1.SimpleNotebookProviderInfo(viewType, serializer, extensionData));
        }
        async withNotebookDataProvider(viewType) {
            const selected = this.notebookProviderInfoStore.get(viewType);
            if (!selected) {
                const knownProvider = this.getViewTypeProvider(viewType);
                const actions = knownProvider ? [
                    (0, actions_1.toAction)({
                        id: 'workbench.notebook.action.installMissingViewType', label: (0, nls_1.localize)('notebookOpenInstallMissingViewType', "Install extension for '{0}'", viewType), run: async () => {
                            await this._instantiationService.createInstance(extensionsActions_1.InstallRecommendedExtensionAction, knownProvider).run();
                        }
                    })
                ] : [];
                throw (0, errorMessage_1.createErrorWithActions)(`UNKNOWN notebook type '${viewType}'`, actions);
            }
            await this.canResolve(selected.id);
            const result = this._notebookProviders.get(selected.id);
            if (!result) {
                throw new Error(`NO provider registered for view type: '${selected.id}'`);
            }
            return result;
        }
        _persistMementos() {
            this._memento.saveMemento();
        }
        getViewTypeProvider(viewType) {
            return this._viewTypeCache[viewType];
        }
        getRendererInfo(rendererId) {
            return this._notebookRenderersInfoStore.get(rendererId);
        }
        updateMimePreferredRenderer(viewType, mimeType, rendererId, otherMimetypes) {
            const info = this.notebookProviderInfoStore.get(viewType);
            if (info) {
                this._notebookRenderersInfoStore.setPreferred(info, mimeType, rendererId);
            }
            this._displayOrder.prioritize(mimeType, otherMimetypes);
        }
        saveMimeDisplayOrder(target) {
            this._configurationService.updateValue(notebookCommon_1.NotebookSetting.displayOrder, this._displayOrder.toArray(), target);
        }
        getRenderers() {
            return this._notebookRenderersInfoStore.getAll();
        }
        *getStaticPreloads(viewType) {
            for (const preload of this._notebookStaticPreloadInfoStore) {
                if (preload.type === viewType) {
                    yield preload;
                }
            }
        }
        // --- notebook documents: create, destory, retrieve, enumerate
        createNotebookTextModel(viewType, uri, data, transientOptions) {
            if (this._models.has(uri)) {
                throw new Error(`notebook for ${uri} already exists`);
            }
            const notebookModel = this._instantiationService.createInstance(notebookTextModel_1.NotebookTextModel, viewType, uri, data.cells, data.metadata, transientOptions);
            this._models.set(uri, new ModelData(notebookModel, this._onWillDisposeDocument.bind(this)));
            this._onWillAddNotebookDocument.fire(notebookModel);
            this._onDidAddNotebookDocument.fire(notebookModel);
            this._postDocumentOpenActivation(viewType);
            return notebookModel;
        }
        getNotebookTextModel(uri) {
            return this._models.get(uri)?.model;
        }
        getNotebookTextModels() {
            return iterator_1.Iterable.map(this._models.values(), data => data.model);
        }
        listNotebookDocuments() {
            return [...this._models].map(e => e[1].model);
        }
        _onWillDisposeDocument(model) {
            const modelData = this._models.get(model.uri);
            if (modelData) {
                this._onWillRemoveNotebookDocument.fire(modelData.model);
                this._models.delete(model.uri);
                modelData.dispose();
                this._onDidRemoveNotebookDocument.fire(modelData.model);
            }
        }
        getOutputMimeTypeInfo(textModel, kernelProvides, output) {
            const sorted = this._displayOrder.sort(new Set(output.outputs.map(op => op.mime)));
            const notebookProviderInfo = this.notebookProviderInfoStore.get(textModel.viewType);
            return sorted
                .flatMap(mimeType => this._notebookRenderersInfoStore.findBestRenderers(notebookProviderInfo, mimeType, kernelProvides))
                .sort((a, b) => (a.rendererId === notebookCommon_1.RENDERER_NOT_AVAILABLE ? 1 : 0) - (b.rendererId === notebookCommon_1.RENDERER_NOT_AVAILABLE ? 1 : 0));
        }
        getContributedNotebookTypes(resource) {
            if (resource) {
                return this.notebookProviderInfoStore.getContributedNotebook(resource);
            }
            return [...this.notebookProviderInfoStore];
        }
        getContributedNotebookType(viewType) {
            return this.notebookProviderInfoStore.get(viewType);
        }
        getNotebookProviderResourceRoots() {
            const ret = [];
            this._notebookProviders.forEach(val => {
                if (val.extensionData.location) {
                    ret.push(uri_1.URI.revive(val.extensionData.location));
                }
            });
            return ret;
        }
        // --- copy & paste
        setToCopy(items, isCopy) {
            this._cutItems = items;
            this._lastClipboardIsCopy = isCopy;
        }
        getToCopy() {
            if (this._cutItems) {
                return { items: this._cutItems, isCopy: this._lastClipboardIsCopy };
            }
            return undefined;
        }
    };
    exports.NotebookService = NotebookService;
    exports.NotebookService = NotebookService = NotebookService_1 = __decorate([
        __param(0, extensions_1.IExtensionService),
        __param(1, configuration_1.IConfigurationService),
        __param(2, accessibility_1.IAccessibilityService),
        __param(3, instantiation_1.IInstantiationService),
        __param(4, codeEditorService_1.ICodeEditorService),
        __param(5, configuration_1.IConfigurationService),
        __param(6, storage_1.IStorageService)
    ], NotebookService);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm90ZWJvb2tTZXJ2aWNlSW1wbC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL25vdGVib29rL2Jyb3dzZXIvc2VydmljZXMvbm90ZWJvb2tTZXJ2aWNlSW1wbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7O0lBMEN6RixJQUFNLHlCQUF5QixHQUEvQixNQUFNLHlCQUEwQixTQUFRLHNCQUFVOztpQkFFaEMsOEJBQXlCLEdBQUcsaUJBQWlCLEFBQXBCLENBQXFCO2lCQUM5Qyw0QkFBdUIsR0FBRyxTQUFTLEFBQVosQ0FBYTtRQVE1RCxZQUNrQixjQUErQixFQUM3QixnQkFBbUMsRUFDOUIsc0JBQStELEVBQ2hFLHFCQUE2RCxFQUM3RCxxQkFBNkQsRUFDN0QscUJBQTZELEVBQ3RFLFlBQTJDLEVBQ3BCLG1DQUF5RjtZQUU5SCxLQUFLLEVBQUUsQ0FBQztZQVBpQywyQkFBc0IsR0FBdEIsc0JBQXNCLENBQXdCO1lBQy9DLDBCQUFxQixHQUFyQixxQkFBcUIsQ0FBdUI7WUFDNUMsMEJBQXFCLEdBQXJCLHFCQUFxQixDQUF1QjtZQUM1QywwQkFBcUIsR0FBckIscUJBQXFCLENBQXVCO1lBQ3JELGlCQUFZLEdBQVosWUFBWSxDQUFjO1lBQ0gsd0NBQW1DLEdBQW5DLG1DQUFtQyxDQUFxQztZQWJ2SCxhQUFRLEdBQVksS0FBSyxDQUFDO1lBRWpCLHdCQUFtQixHQUFHLElBQUksR0FBRyxFQUFnQyxDQUFDO1lBQzlELGtDQUE2QixHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSwyQkFBZSxFQUFFLENBQUMsQ0FBQztZQWN0RixJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksaUJBQU8sQ0FBQywyQkFBeUIsQ0FBQyx5QkFBeUIsRUFBRSxjQUFjLENBQUMsQ0FBQztZQUVqRyxNQUFNLGFBQWEsR0FBRyxJQUFJLENB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