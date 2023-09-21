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
define(["require", "exports", "vs/nls!vs/workbench/contrib/notebook/browser/services/notebookServiceImpl", "vs/base/common/actions", "vs/base/common/errorMessage", "vs/base/browser/browser", "vs/base/common/event", "vs/base/common/iterator", "vs/base/common/lazy", "vs/base/common/lifecycle", "vs/base/common/map", "vs/base/common/network", "vs/base/common/types", "vs/base/common/uri", "vs/editor/browser/services/codeEditorService", "vs/editor/common/config/fontInfo", "vs/platform/accessibility/common/accessibility", "vs/platform/configuration/common/configuration", "vs/platform/files/common/files", "vs/platform/instantiation/common/instantiation", "vs/platform/storage/common/storage", "vs/workbench/common/memento", "vs/workbench/contrib/notebook/browser/notebookExtensionPoint", "vs/workbench/contrib/notebook/common/notebookDiffEditorInput", "vs/workbench/contrib/notebook/common/model/notebookTextModel", "vs/workbench/contrib/notebook/common/notebookCommon", "vs/workbench/contrib/notebook/common/notebookEditorInput", "vs/workbench/contrib/notebook/common/notebookEditorModelResolverService", "vs/workbench/contrib/notebook/browser/notebookOptions", "vs/workbench/contrib/notebook/common/notebookOutputRenderer", "vs/workbench/contrib/notebook/common/notebookProvider", "vs/workbench/contrib/notebook/common/notebookService", "vs/workbench/services/editor/common/editorResolverService", "vs/workbench/services/extensions/common/extensions", "vs/workbench/contrib/extensions/browser/extensionsActions"], function (require, exports, nls_1, actions_1, errorMessage_1, browser_1, event_1, iterator_1, lazy_1, lifecycle_1, map_1, network_1, types_1, uri_1, codeEditorService_1, fontInfo_1, accessibility_1, configuration_1, files_1, instantiation_1, storage_1, memento_1, notebookExtensionPoint_1, notebookDiffEditorInput_1, notebookTextModel_1, notebookCommon_1, notebookEditorInput_1, notebookEditorModelResolverService_1, notebookOptions_1, notebookOutputRenderer_1, notebookProvider_1, notebookService_1, editorResolverService_1, extensions_1, extensionsActions_1) {
    "use strict";
    var $sEb_1, $uEb_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$uEb = exports.$tEb = exports.$sEb = void 0;
    let $sEb = class $sEb extends lifecycle_1.$kc {
        static { $sEb_1 = this; }
        static { this.c = 'notebookEditors'; }
        static { this.f = 'editors'; }
        constructor(storageService, extensionService, n, s, t, u, w, y) {
            super();
            this.n = n;
            this.s = s;
            this.t = t;
            this.u = u;
            this.w = w;
            this.y = y;
            this.h = false;
            this.j = new Map();
            this.m = this.B(new lifecycle_1.$jc());
            this.g = new memento_1.$YT($sEb_1.c, storageService);
            const mementoObject = this.g.getMemento(0 /* StorageScope.PROFILE */, 1 /* StorageTarget.MACHINE */);
            // Process the notebook contributions but buffer changes from the resolver
            this.n.bufferChangeEvents(() => {
                for (const info of (mementoObject[$sEb_1.f] || [])) {
                    this.add(new notebookProvider_1.$tbb(info));
                }
            });
            this.B(extensionService.onDidRegisterExtensions(() => {
                if (!this.h) {
                    // there is no extension point registered for notebook content provider
                    // clear the memento and cache
                    this.F();
                    mementoObject[$sEb_1.f] = [];
                    this.g.saveMemento();
                }
            }));
            notebookExtensionPoint_1.$mEb.setHandler(extensions => this.z(extensions));
        }
        dispose() {
            this.F();
            super.dispose();
        }
        z(extensions) {
            this.h = true;
            const builtins = [...this.j.values()].filter(info => !info.extension);
            this.F();
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
                    this.add(new notebookProvider_1.$tbb({
                        extension: extension.description.identifier,
                        id: notebookContribution.type,
                        displayName: notebookContribution.displayName,
                        selectors: notebookContribution.selector || [],
                        priority: this.C(notebookContribution.priority),
                        providerDisplayName: extension.description.displayName ?? extension.description.identifier.value,
                        exclusive: false
                    }));
                }
            }
            const mementoObject = this.g.getMemento(0 /* StorageScope.PROFILE */, 1 /* StorageTarget.MACHINE */);
            mementoObject[$sEb_1.f] = Array.from(this.j.values());
            this.g.saveMemento();
        }
        clearEditorCache() {
            const mementoObject = this.g.getMemento(0 /* StorageScope.PROFILE */, 1 /* StorageTarget.MACHINE */);
            mementoObject[$sEb_1.f] = [];
            this.g.saveMemento();
        }
        C(priority) {
            if (!priority) {
                return editorResolverService_1.RegisteredEditorPriority.default;
            }
            if (priority === notebookCommon_1.NotebookEditorPriority.default) {
                return editorResolverService_1.RegisteredEditorPriority.default;
            }
            return editorResolverService_1.RegisteredEditorPriority.option;
        }
        D(notebookProviderInfo) {
            const disposables = new lifecycle_1.$jc();
            for (const selector of notebookProviderInfo.selectors) {
                const globPattern = selector.include || selector;
                const notebookEditorInfo = {
                    id: notebookProviderInfo.id,
                    label: notebookProviderInfo.displayName,
                    detail: notebookProviderInfo.providerDisplayName,
                    priority: notebookProviderInfo.exclusive ? editorResolverService_1.RegisteredEditorPriority.exclusive : notebookProviderInfo.priority,
                };
                const notebookEditorOptions = {
                    canHandleDiff: () => !!this.s.getValue(notebookCommon_1.$7H.textDiffEditorPreview) && !this.t.isScreenReaderOptimized(),
                    canSupportResource: (resource) => resource.scheme === network_1.Schemas.untitled || resource.scheme === network_1.Schemas.vscodeNotebookCell || this.w.hasProvider(resource)
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
                    return { editor: notebookEditorInput_1.$zbb.create(this.u, notebookUri, notebookProviderInfo.id), options: notebookOptions };
                };
                const notebookUntitledEditorFactory = async ({ resource, options }) => {
                    const ref = await this.y.resolve({ untitledResource: resource }, notebookProviderInfo.id);
                    // untitled notebooks are disposed when they get saved. we should not hold a reference
                    // to such a disposed notebook and therefore dispose the reference as well
                    ref.object.notebook.onWillDispose(() => {
                        ref.dispose();
                    });
                    return { editor: notebookEditorInput_1.$zbb.create(this.u, ref.object.resource, notebookProviderInfo.id), options };
                };
                const notebookDiffEditorInputFactory = ({ modified, original, label, description }) => {
                    return { editor: notebookDiffEditorInput_1.$pEb.create(this.u, modified.resource, label, description, original.resource, notebookProviderInfo.id) };
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
                disposables.add(this.s.onDidChangeConfiguration(e => {
                    if (e.affectsConfiguration(notebookCommon_1.$7H.textDiffEditorPreview)) {
                        const canHandleDiff = !!this.s.getValue(notebookCommon_1.$7H.textDiffEditorPreview) && !this.t.isScreenReaderOptimized();
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
                disposables.add(this.t.onDidChangeScreenReaderOptimized(() => {
                    const canHandleDiff = !!this.s.getValue(notebookCommon_1.$7H.textDiffEditorPreview) && !this.t.isScreenReaderOptimized();
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
                disposables.add(this.n.registerEditor(globPattern, notebookEditorInfo, notebookEditorOptions, notebookFactoryObject));
                // Then register the schema handler as exclusive for that notebook
                disposables.add(this.n.registerEditor(`${network_1.Schemas.vscodeNotebookCell}:/**/${globPattern}`, { ...notebookEditorInfo, priority: editorResolverService_1.RegisteredEditorPriority.exclusive }, notebookEditorOptions, notebookCellFactoryObject));
            }
            return disposables;
        }
        F() {
            this.j.clear();
            this.m.clear();
        }
        get(viewType) {
            return this.j.get(viewType);
        }
        add(info) {
            if (this.j.has(info.id)) {
                throw new Error(`notebook type '${info.id}' ALREADY EXISTS`);
            }
            this.j.set(info.id, info);
            let editorRegistration;
            // built-in notebook providers contribute their own editors
            if (info.extension) {
                editorRegistration = this.D(info);
                this.m.add(editorRegistration);
            }
            const mementoObject = this.g.getMemento(0 /* StorageScope.PROFILE */, 1 /* StorageTarget.MACHINE */);
            mementoObject[$sEb_1.f] = Array.from(this.j.values());
            this.g.saveMemento();
            return this.B((0, lifecycle_1.$ic)(() => {
                const mementoObject = this.g.getMemento(0 /* StorageScope.PROFILE */, 1 /* StorageTarget.MACHINE */);
                mementoObject[$sEb_1.f] = Array.from(this.j.values());
                this.g.saveMemento();
                editorRegistration?.dispose();
                this.j.delete(info.id);
            }));
        }
        getContributedNotebook(resource) {
            const result = [];
            for (const info of this.j.values()) {
                if (info.matches(resource)) {
                    result.push(info);
                }
            }
            if (result.length === 0 && resource.scheme === network_1.Schemas.untitled) {
                // untitled resource and no path-specific match => all providers apply
                return Array.from(this.j.values());
            }
            return result;
        }
        [Symbol.iterator]() {
            return this.j.values();
        }
    };
    exports.$sEb = $sEb;
    exports.$sEb = $sEb = $sEb_1 = __decorate([
        __param(0, storage_1.$Vo),
        __param(1, extensions_1.$MF),
        __param(2, editorResolverService_1.$pbb),
        __param(3, configuration_1.$8h),
        __param(4, accessibility_1.$1r),
        __param(5, instantiation_1.$Ah),
        __param(6, files_1.$6j),
        __param(7, notebookEditorModelResolverService_1.$wbb)
    ], $sEb);
    let $tEb = class $tEb {
        constructor(storageService) {
            this.c = new Map();
            this.f = new lazy_1.$T(() => this.d.getMemento(1 /* StorageScope.WORKSPACE */, 1 /* StorageTarget.MACHINE */));
            this.d = new memento_1.$YT('workbench.editor.notebook.preferredRenderer2', storageService);
        }
        clear() {
            this.c.clear();
        }
        get(rendererId) {
            return this.c.get(rendererId);
        }
        getAll() {
            return Array.from(this.c.values());
        }
        add(info) {
            if (this.c.has(info.id)) {
                return;
            }
            this.c.set(info.id, info);
        }
        /** Update and remember the preferred renderer for the given mimetype in this workspace */
        setPreferred(notebookProviderInfo, mimeType, rendererId) {
            const mementoObj = this.f.value;
            const forNotebook = mementoObj[notebookProviderInfo.id];
            if (forNotebook) {
                forNotebook[mimeType] = rendererId;
            }
            else {
                mementoObj[notebookProviderInfo.id] = { [mimeType]: rendererId };
            }
            this.d.saveMemento();
        }
        findBestRenderers(notebookProviderInfo, mimeType, kernelProvides) {
            let ReuseOrder;
            (function (ReuseOrder) {
                ReuseOrder[ReuseOrder["PreviouslySelected"] = 256] = "PreviouslySelected";
                ReuseOrder[ReuseOrder["SameExtensionAsNotebook"] = 512] = "SameExtensionAsNotebook";
                ReuseOrder[ReuseOrder["OtherRenderer"] = 768] = "OtherRenderer";
                ReuseOrder[ReuseOrder["BuiltIn"] = 1024] = "BuiltIn";
            })(ReuseOrder || (ReuseOrder = {}));
            const preferred = notebookProviderInfo && this.f.value[notebookProviderInfo.id]?.[mimeType];
            const notebookExtId = notebookProviderInfo?.extension?.value;
            const notebookId = notebookProviderInfo?.id;
            const renderers = Array.from(this.c.values())
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
                    : rendererExtId === notebookExtId || notebookCommon_1.$YH.get(rendererExtId)?.has(notebookId)
                        ? 512 /* ReuseOrder.SameExtensionAsNotebook */
                        : renderer.isBuiltin ? 1024 /* ReuseOrder.BuiltIn */ : 768 /* ReuseOrder.OtherRenderer */;
                return {
                    ordered: { mimeType, rendererId: renderer.id, isTrusted: true },
                    score: reuseScore | ownScore,
                };
            }).filter(types_1.$rf);
            if (renderers.length === 0) {
                return [{ mimeType, rendererId: notebookCommon_1.$ZH, isTrusted: true }];
            }
            return renderers.sort((a, b) => a.score - b.score).map(r => r.ordered);
        }
    };
    exports.$tEb = $tEb;
    exports.$tEb = $tEb = __decorate([
        __param(0, storage_1.$Vo)
    ], $tEb);
    class ModelData {
        constructor(model, onWillDispose) {
            this.model = model;
            this.c = new lifecycle_1.$jc();
            this.c.add(model.onWillDispose(() => onWillDispose(model)));
        }
        dispose() {
            this.c.dispose();
        }
    }
    let $uEb = class $uEb extends lifecycle_1.$kc {
        static { $uEb_1 = this; }
        static { this.c = 'notebook.viewTypeProvider'; }
        get m() {
            if (!this.j) {
                this.j = this.B(this.O.createInstance($sEb));
            }
            return this.j;
        }
        constructor(L, M, N, O, P, Q, R) {
            super();
            this.L = L;
            this.M = M;
            this.N = N;
            this.O = O;
            this.P = P;
            this.Q = Q;
            this.R = R;
            this.h = new Map();
            this.j = undefined;
            this.n = this.O.createInstance($tEb);
            this.s = this.B(new event_1.$fd());
            this.onDidChangeOutputRenderers = this.s.event;
            this.t = new Set();
            this.u = new map_1.$zi();
            this.w = this.B(new event_1.$fd());
            this.y = this.B(new event_1.$fd());
            this.z = this.B(new event_1.$fd());
            this.C = this.B(new event_1.$fd());
            this.onWillAddNotebookDocument = this.w.event;
            this.onDidAddNotebookDocument = this.y.event;
            this.onDidRemoveNotebookDocument = this.C.event;
            this.onWillRemoveNotebookDocument = this.z.event;
            this.D = this.B(new event_1.$fd());
            this.onAddViewType = this.D.event;
            this.F = this.B(new event_1.$fd());
            this.onWillRemoveViewType = this.F.event;
            this.G = this.B(new event_1.$fd());
            this.onDidChangeEditorTypes = this.G.event;
            this.I = true;
            notebookExtensionPoint_1.$nEb.setHandler((renderers) => {
                this.n.clear();
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
                        this.n.add(new notebookOutputRenderer_1.$qEb({
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
                this.s.fire();
            });
            notebookExtensionPoint_1.$oEb.setHandler(extensions => {
                this.t.clear();
                for (const extension of extensions) {
                    if (!(0, extensions_1.$PF)(extension.description, 'contribNotebookStaticPreloads')) {
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
                        this.t.add(new notebookOutputRenderer_1.$rEb({
                            type,
                            extension: extension.description,
                            entrypoint: notebookContribution.entrypoint,
                            localResourceRoots: notebookContribution.localResourceRoots ?? [],
                        }));
                    }
                }
            });
            const updateOrder = () => {
                this.J = new notebookCommon_1.$1H(this.M.getValue(notebookCommon_1.$7H.displayOrder) || [], this.N.isScreenReaderOptimized()
                    ? notebookCommon_1.$XH
                    : notebookCommon_1.$WH);
            };
            updateOrder();
            this.B(this.M.onDidChangeConfiguration(e => {
                if (e.affectsConfiguration(notebookCommon_1.$7H.displayOrder)) {
                    updateOrder();
                }
            }));
            this.B(this.N.onDidChangeScreenReaderOptimized(() => {
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
                const options = this.P.resolveDecorationOptions(e, true);
                if (options.afterContentClassName || options.beforeContentClassName) {
                    const cssRules = this.P.resolveDecorationCSSRules(e);
                    if (cssRules !== null) {
                        for (let i = 0; i < cssRules.length; i++) {
                            // The following ways to index into the list are equivalent
                            if ((cssRules[i].selectorText.endsWith('::after') || cssRules[i].selectorText.endsWith('::after'))
                                && cssRules[i].cssText.indexOf('top:') > -1) {
                                // there is a `::before` or `::after` text decoration whose position is above or below current line
                                // we at least make sure that the editor top padding is at least one line
                                const editorOptions = this.Q.getValue('editor');
                                (0, notebookOptions_1.$Dbb)(fontInfo_1.$Rr.createFromRawSettings(editorOptions, browser_1.$WN.value).lineHeight + 2);
                                decorationTriggeredAdjustment = true;
                                break;
                            }
                        }
                    }
                }
                decorationCheckSet.add(e);
            };
            this.B(this.P.onDecorationTypeRegistered(onDidAddDecorationType));
            this.P.listDecorationTypes().forEach(onDidAddDecorationType);
            this.f = new memento_1.$YT($uEb_1.c, this.R);
            this.g = this.f.getMemento(1 /* StorageScope.WORKSPACE */, 1 /* StorageTarget.MACHINE */);
        }
        getEditorTypes() {
            return [...this.m].map(info => ({
                id: info.id,
                displayName: info.displayName,
                providerDisplayName: info.providerDisplayName
            }));
        }
        clearEditorCache() {
            this.m.clearEditorCache();
        }
        S(viewType) {
            // send out activations on notebook text model creation
            this.L.activateByEvent(`onNotebook:${viewType}`);
            this.L.activateByEvent(`onNotebook:*`);
        }
        async canResolve(viewType) {
            if (this.h.has(viewType)) {
                return true;
            }
            await this.L.whenInstalledExtensionsRegistered();
            await this.L.activateByEvent(`onNotebookSerializer:${viewType}`);
            return this.h.has(viewType);
        }
        registerContributedNotebookType(viewType, data) {
            const info = new notebookProvider_1.$tbb({
                extension: data.extension,
                id: viewType,
                displayName: data.displayName,
                providerDisplayName: data.providerDisplayName,
                exclusive: data.exclusive,
                priority: editorResolverService_1.RegisteredEditorPriority.default,
                selectors: []
            });
            info.update({ selectors: data.filenamePattern });
            const reg = this.m.add(info);
            this.G.fire();
            return (0, lifecycle_1.$ic)(() => {
                reg.dispose();
                this.G.fire();
            });
        }
        U(viewType, data) {
            if (this.h.has(viewType)) {
                throw new Error(`notebook provider for viewtype '${viewType}' already exists`);
            }
            this.h.set(viewType, data);
            this.D.fire(viewType);
            return (0, lifecycle_1.$ic)(() => {
                this.F.fire(viewType);
                this.h.delete(viewType);
            });
        }
        registerNotebookSerializer(viewType, extensionData, serializer) {
            this.m.get(viewType)?.update({ options: serializer.options });
            this.g[viewType] = extensionData.id.value;
            this.W();
            return this.U(viewType, new notebookService_1.$vbb(viewType, serializer, extensionData));
        }
        async withNotebookDataProvider(viewType) {
            const selected = this.m.get(viewType);
            if (!selected) {
                const knownProvider = this.getViewTypeProvider(viewType);
                const actions = knownProvider ? [
                    (0, actions_1.$li)({
                        id: 'workbench.notebook.action.installMissingViewType', label: (0, nls_1.localize)(0, null, viewType), run: async () => {
                            await this.O.createInstance(extensionsActions_1.$Zhb, knownProvider).run();
                        }
                    })
                ] : [];
                throw (0, errorMessage_1.$oi)(`UNKNOWN notebook type '${viewType}'`, actions);
            }
            await this.canResolve(selected.id);
            const result = this.h.get(selected.id);
            if (!result) {
                throw new Error(`NO provider registered for view type: '${selected.id}'`);
            }
            return result;
        }
        W() {
            this.f.saveMemento();
        }
        getViewTypeProvider(viewType) {
            return this.g[viewType];
        }
        getRendererInfo(rendererId) {
            return this.n.get(rendererId);
        }
        updateMimePreferredRenderer(viewType, mimeType, rendererId, otherMimetypes) {
            const info = this.m.get(viewType);
            if (info) {
                this.n.setPreferred(info, mimeType, rendererId);
            }
            this.J.prioritize(mimeType, otherMimetypes);
        }
        saveMimeDisplayOrder(target) {
            this.M.updateValue(notebookCommon_1.$7H.displayOrder, this.J.toArray(), target);
        }
        getRenderers() {
            return this.n.getAll();
        }
        *getStaticPreloads(viewType) {
            for (const preload of this.t) {
                if (preload.type === viewType) {
                    yield preload;
                }
            }
        }
        // --- notebook documents: create, destory, retrieve, enumerate
        createNotebookTextModel(viewType, uri, data, transientOptions) {
            if (this.u.has(uri)) {
                throw new Error(`notebook for ${uri} already exists`);
            }
            const notebookModel = this.O.createInstance(notebookTextModel_1.$MH, viewType, uri, data.cells, data.metadata, transientOptions);
            this.u.set(uri, new ModelData(notebookModel, this.X.bind(this)));
            this.w.fire(notebookModel);
            this.y.fire(notebookModel);
            this.S(viewType);
            return notebookModel;
        }
        getNotebookTextModel(uri) {
            return this.u.get(uri)?.model;
        }
        getNotebookTextModels() {
            return iterator_1.Iterable.map(this.u.values(), data => data.model);
        }
        listNotebookDocuments() {
            return [...this.u].map(e => e[1].model);
        }
        X(model) {
            const modelData = this.u.get(model.uri);
            if (modelData) {
                this.z.fire(modelData.model);
                this.u.delete(model.uri);
                modelData.dispose();
                this.C.fire(modelData.model);
            }
        }
        getOutputMimeTypeInfo(textModel, kernelProvides, output) {
            const sorted = this.J.sort(new Set(output.outputs.map(op => op.mime)));
            const notebookProviderInfo = this.m.get(textModel.viewType);
            return sorted
                .flatMap(mimeType => this.n.findBestRenderers(notebookProviderInfo, mimeType, kernelProvides))
                .sort((a, b) => (a.rendererId === notebookCommon_1.$ZH ? 1 : 0) - (b.rendererId === notebookCommon_1.$ZH ? 1 : 0));
        }
        getContributedNotebookTypes(resource) {
            if (resource) {
                return this.m.getContributedNotebook(resource);
            }
            return [...this.m];
        }
        getContributedNotebookType(viewType) {
            return this.m.get(viewType);
        }
        getNotebookProviderResourceRoots() {
            const ret = [];
            this.h.forEach(val => {
                if (val.extensionData.location) {
                    ret.push(uri_1.URI.revive(val.extensionData.location));
                }
            });
            return ret;
        }
        // --- copy & paste
        setToCopy(items, isCopy) {
            this.H = items;
            this.I = isCopy;
        }
        getToCopy() {
            if (this.H) {
                return { items: this.H, isCopy: this.I };
            }
            return undefined;
        }
    };
    exports.$uEb = $uEb;
    exports.$uEb = $uEb = $uEb_1 = __decorate([
        __param(0, extensions_1.$MF),
        __param(1, configuration_1.$8h),
        __param(2, accessibility_1.$1r),
        __param(3, instantiation_1.$Ah),
        __param(4, codeEditorService_1.$nV),
        __param(5, configuration_1.$8h),
        __param(6, storage_1.$Vo)
    ], $uEb);
});
//# sourceMappingURL=notebookServiceImpl.js.map