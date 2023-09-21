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
define(["require", "exports", "vs/nls", "vs/base/common/lifecycle", "vs/base/common/event", "vs/base/common/errors", "vs/base/common/errorMessage", "vs/base/common/paging", "vs/workbench/services/extensionManagement/common/extensionManagement", "vs/workbench/services/extensionRecommendations/common/extensionRecommendations", "vs/platform/extensionManagement/common/extensionManagementUtil", "vs/platform/keybinding/common/keybinding", "vs/platform/contextview/browser/contextView", "vs/base/browser/dom", "vs/platform/instantiation/common/instantiation", "vs/workbench/contrib/extensions/browser/extensionsList", "vs/workbench/contrib/extensions/common/extensions", "vs/workbench/contrib/extensions/common/extensionQuery", "vs/workbench/services/extensions/common/extensions", "vs/platform/theme/common/themeService", "vs/platform/telemetry/common/telemetry", "vs/base/browser/ui/countBadge/countBadge", "vs/workbench/contrib/extensions/browser/extensionsActions", "vs/platform/list/browser/listService", "vs/platform/configuration/common/configuration", "vs/platform/notification/common/notification", "vs/workbench/browser/parts/views/viewPane", "vs/platform/workspace/common/workspace", "vs/base/common/arrays", "vs/base/browser/ui/aria/aria", "vs/base/common/cancellation", "vs/base/common/actions", "vs/platform/extensions/common/extensions", "vs/base/common/async", "vs/platform/product/common/productService", "vs/platform/severityIcon/browser/severityIcon", "vs/platform/contextkey/common/contextkey", "vs/workbench/common/theme", "vs/workbench/common/views", "vs/platform/opener/common/opener", "vs/workbench/services/preferences/common/preferences", "vs/platform/storage/common/storage", "vs/workbench/services/extensions/common/extensionManifestPropertiesService", "vs/platform/workspace/common/virtualWorkspace", "vs/platform/workspace/common/workspaceTrust", "vs/workbench/services/layout/browser/layoutService", "vs/platform/log/common/log", "vs/base/parts/request/common/request", "vs/platform/theme/browser/defaultStyles"], function (require, exports, nls_1, lifecycle_1, event_1, errors_1, errorMessage_1, paging_1, extensionManagement_1, extensionRecommendations_1, extensionManagementUtil_1, keybinding_1, contextView_1, dom_1, instantiation_1, extensionsList_1, extensions_1, extensionQuery_1, extensions_2, themeService_1, telemetry_1, countBadge_1, extensionsActions_1, listService_1, configuration_1, notification_1, viewPane_1, workspace_1, arrays_1, aria_1, cancellation_1, actions_1, extensions_3, async_1, productService_1, severityIcon_1, contextkey_1, theme_1, views_1, opener_1, preferences_1, storage_1, extensionManifestPropertiesService_1, virtualWorkspace_1, workspaceTrust_1, layoutService_1, log_1, request_1, defaultStyles_1) {
    "use strict";
    var ExtensionsListView_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getAriaLabelForExtension = exports.WorkspaceRecommendedExtensionsView = exports.RecommendedExtensionsView = exports.DefaultRecommendedExtensionsView = exports.SearchMarketplaceExtensionsView = exports.DeprecatedExtensionsView = exports.VirtualWorkspacePartiallySupportedExtensionsView = exports.VirtualWorkspaceUnsupportedExtensionsView = exports.UntrustedWorkspacePartiallySupportedExtensionsView = exports.UntrustedWorkspaceUnsupportedExtensionsView = exports.BuiltInProgrammingLanguageExtensionsView = exports.BuiltInThemesExtensionsView = exports.BuiltInFeatureExtensionsView = exports.RecentlyUpdatedExtensionsView = exports.OutdatedExtensionsView = exports.DisabledExtensionsView = exports.EnabledExtensionsView = exports.ServerInstalledExtensionsView = exports.DefaultPopularExtensionsView = exports.ExtensionsListView = void 0;
    // Extensions that are automatically classified as Programming Language extensions, but should be Feature extensions
    const FORCE_FEATURE_EXTENSIONS = ['vscode.git', 'vscode.git-base', 'vscode.search-result'];
    class ExtensionsViewState extends lifecycle_1.Disposable {
        constructor() {
            super(...arguments);
            this._onFocus = this._register(new event_1.Emitter());
            this.onFocus = this._onFocus.event;
            this._onBlur = this._register(new event_1.Emitter());
            this.onBlur = this._onBlur.event;
            this.currentlyFocusedItems = [];
        }
        onFocusChange(extensions) {
            this.currentlyFocusedItems.forEach(extension => this._onBlur.fire(extension));
            this.currentlyFocusedItems = extensions;
            this.currentlyFocusedItems.forEach(extension => this._onFocus.fire(extension));
        }
    }
    var LocalSortBy;
    (function (LocalSortBy) {
        LocalSortBy["UpdateDate"] = "UpdateDate";
    })(LocalSortBy || (LocalSortBy = {}));
    function isLocalSortBy(value) {
        switch (value) {
            case "UpdateDate" /* LocalSortBy.UpdateDate */: return true;
        }
    }
    let ExtensionsListView = class ExtensionsListView extends viewPane_1.ViewPane {
        static { ExtensionsListView_1 = this; }
        static { this.RECENT_UPDATE_DURATION = 7 * 24 * 60 * 60 * 1000; } // 7 days
        constructor(options, viewletViewOptions, notificationService, keybindingService, contextMenuService, instantiationService, themeService, extensionService, extensionsWorkbenchService, extensionRecommendationsService, telemetryService, configurationService, contextService, extensionManagementServerService, extensionManifestPropertiesService, extensionManagementService, workspaceService, productService, contextKeyService, viewDescriptorService, openerService, preferencesService, storageService, workspaceTrustManagementService, extensionEnablementService, layoutService, logService) {
            super({
                ...viewletViewOptions,
                showActions: viewPane_1.ViewPaneShowActions.Always,
                maximumBodySize: options.flexibleHeight ? (storageService.getNumber(`${viewletViewOptions.id}.size`, 0 /* StorageScope.PROFILE */, 0) ? undefined : 0) : undefined
            }, keybindingService, contextMenuService, configurationService, contextKeyService, viewDescriptorService, instantiationService, openerService, themeService, telemetryService);
            this.options = options;
            this.notificationService = notificationService;
            this.extensionService = extensionService;
            this.extensionsWorkbenchService = extensionsWorkbenchService;
            this.extensionRecommendationsService = extensionRecommendationsService;
            this.contextService = contextService;
            this.extensionManagementServerService = extensionManagementServerService;
            this.extensionManifestPropertiesService = extensionManifestPropertiesService;
            this.extensionManagementService = extensionManagementService;
            this.workspaceService = workspaceService;
            this.productService = productService;
            this.preferencesService = preferencesService;
            this.storageService = storageService;
            this.workspaceTrustManagementService = workspaceTrustManagementService;
            this.extensionEnablementService = extensionEnablementService;
            this.layoutService = layoutService;
            this.logService = logService;
            this.list = null;
            this.queryRequest = null;
            this.contextMenuActionRunner = this._register(new actions_1.ActionRunner());
            if (this.options.onDidChangeTitle) {
                this._register(this.options.onDidChangeTitle(title => this.updateTitle(title)));
            }
            this._register(this.contextMenuActionRunner.onDidRun(({ error }) => error && this.notificationService.error(error)));
            this.registerActions();
        }
        registerActions() { }
        renderHeader(container) {
            container.classList.add('extension-view-header');
            super.renderHeader(container);
            if (!this.options.hideBadge) {
                this.badge = new countBadge_1.CountBadge((0, dom_1.append)(container, (0, dom_1.$)('.count-badge-wrapper')), {}, defaultStyles_1.defaultCountBadgeStyles);
            }
        }
        renderBody(container) {
            super.renderBody(container);
            const extensionsList = (0, dom_1.append)(container, (0, dom_1.$)('.extensions-list'));
            const messageContainer = (0, dom_1.append)(container, (0, dom_1.$)('.message-container'));
            const messageSeverityIcon = (0, dom_1.append)(messageContainer, (0, dom_1.$)(''));
            const messageBox = (0, dom_1.append)(messageContainer, (0, dom_1.$)('.message'));
            const delegate = new extensionsList_1.Delegate();
            const extensionsViewState = new ExtensionsViewState();
            const renderer = this.instantiationService.createInstance(extensionsList_1.Renderer, extensionsViewState, { hoverOptions: { position: () => { return this.layoutService.getSideBarPosition() === 0 /* Position.LEFT */ ? 1 /* HoverPosition.RIGHT */ : 0 /* HoverPosition.LEFT */; } } });
            this.list = this.instantiationService.createInstance(listService_1.WorkbenchPagedList, 'Extensions', extensionsList, delegate, [renderer], {
                multipleSelectionSupport: false,
                setRowLineHeight: false,
                horizontalScrolling: false,
                accessibilityProvider: {
                    getAriaLabel(extension) {
                        return getAriaLabelForExtension(extension);
                    },
                    getWidgetAriaLabel() {
                        return (0, nls_1.localize)('extensions', "Extensions");
                    }
                },
                overrideStyles: {
                    listBackground: theme_1.SIDE_BAR_BACKGROUND
                },
                openOnSingleClick: true
            });
            this._register(this.list.onContextMenu(e => this.onContextMenu(e), this));
            this._register(this.list.onDidChangeFocus(e => extensionsViewState.onFocusChange((0, arrays_1.coalesce)(e.elements)), this));
            this._register(this.list);
            this._register(extensionsViewState);
            this._register(event_1.Event.debounce(event_1.Event.filter(this.list.onDidOpen, e => e.element !== null), (_, event) => event, 75, true)(options => {
                this.openExtension(options.element, { sideByside: options.sideBySide, ...options.editorOptions });
            }));
            this.bodyTemplate = {
                extensionsList,
                messageBox,
                messageContainer,
                messageSeverityIcon
            };
            if (this.queryResult) {
                this.setModel(this.queryResult.model);
            }
        }
        layoutBody(height, width) {
            super.layoutBody(height, width);
            if (this.bodyTemplate) {
                this.bodyTemplate.extensionsList.style.height = height + 'px';
            }
            this.list?.layout(height, width);
        }
        async show(query, refresh) {
            if (this.queryRequest) {
                if (!refresh && this.queryRequest.query === query) {
                    return this.queryRequest.request;
                }
                this.queryRequest.request.cancel();
                this.queryRequest = null;
            }
            if (this.queryResult) {
                this.queryResult.disposables.dispose();
                this.queryResult = undefined;
            }
            const parsedQuery = extensionQuery_1.Query.parse(query);
            const options = {
                sortOrder: 0 /* SortOrder.Default */
            };
            switch (parsedQuery.sortBy) {
                case 'installs':
                    options.sortBy = 4 /* GallerySortBy.InstallCount */;
                    break;
                case 'rating':
                    options.sortBy = 12 /* GallerySortBy.WeightedRating */;
                    break;
                case 'name':
                    options.sortBy = 2 /* GallerySortBy.Title */;
                    break;
                case 'publishedDate':
                    options.sortBy = 10 /* GallerySortBy.PublishedDate */;
                    break;
                case 'updateDate':
                    options.sortBy = "UpdateDate" /* LocalSortBy.UpdateDate */;
                    break;
            }
            const request = (0, async_1.createCancelablePromise)(async (token) => {
                try {
                    this.queryResult = await this.query(parsedQuery, options, token);
                    const model = this.queryResult.model;
                    this.setModel(model);
                    if (this.queryResult.onDidChangeModel) {
                        this.queryResult.disposables.add(this.queryResult.onDidChangeModel(model => {
                            if (this.queryResult) {
                                this.queryResult.model = model;
                                this.updateModel(model);
                            }
                        }));
                    }
                    return model;
                }
                catch (e) {
                    const model = new paging_1.PagedModel([]);
                    if (!(0, errors_1.isCancellationError)(e)) {
                        this.logService.error(e);
                        this.setModel(model, e);
                    }
                    return this.list ? this.list.model : model;
                }
            });
            request.finally(() => this.queryRequest = null);
            this.queryRequest = { query, request };
            return request;
        }
        count() {
            return this.queryResult?.model.length ?? 0;
        }
        showEmptyModel() {
            const emptyModel = new paging_1.PagedModel([]);
            this.setModel(emptyModel);
            return Promise.resolve(emptyModel);
        }
        async onContextMenu(e) {
            if (e.element) {
                const disposables = new lifecycle_1.DisposableStore();
                const manageExtensionAction = disposables.add(this.instantiationService.createInstance(extensionsActions_1.ManageExtensionAction));
                const extension = e.element ? this.extensionsWorkbenchService.local.find(local => (0, extensionManagementUtil_1.areSameExtensions)(local.identifier, e.element.identifier) && (!e.element.server || e.element.server === local.server)) || e.element
                    : e.element;
                manageExtensionAction.extension = extension;
                let groups = [];
                if (manageExtensionAction.enabled) {
                    groups = await manageExtensionAction.getActionGroups();
                }
                else if (extension) {
                    groups = await (0, extensionsActions_1.getContextMenuActions)(extension, this.contextKeyService, this.instantiationService);
                    groups.forEach(group => group.forEach(extensionAction => {
                        if (extensionAction instanceof extensionsActions_1.ExtensionAction) {
                            extensionAction.extension = extension;
                        }
                    }));
                }
                let actions = [];
                for (const menuActions of groups) {
                    actions = [...actions, ...menuActions, new actions_1.Separator()];
                }
                actions.pop();
                this.contextMenuService.showContextMenu({
                    getAnchor: () => e.anchor,
                    getActions: () => actions,
                    actionRunner: this.contextMenuActionRunner,
                    onHide: () => disposables.dispose()
                });
            }
        }
        async query(query, options, token) {
            const idRegex = /@id:(([a-z0-9A-Z][a-z0-9\-A-Z]*)\.([a-z0-9A-Z][a-z0-9\-A-Z]*))/g;
            const ids = [];
            let idMatch;
            while ((idMatch = idRegex.exec(query.value)) !== null) {
                const name = idMatch[1];
                ids.push(name);
            }
            if (ids.length) {
                const model = await this.queryByIds(ids, options, token);
                return { model, disposables: new lifecycle_1.DisposableStore() };
            }
            if (ExtensionsListView_1.isLocalExtensionsQuery(query.value, query.sortBy)) {
                return this.queryLocal(query, options);
            }
            if (ExtensionsListView_1.isSearchPopularQuery(query.value)) {
                query.value = query.value.replace('@popular', '');
                options.sortBy = !options.sortBy ? 4 /* GallerySortBy.InstallCount */ : options.sortBy;
            }
            else if (ExtensionsListView_1.isSearchRecentlyPublishedQuery(query.value)) {
                query.value = query.value.replace('@recentlyPublished', '');
                options.sortBy = !options.sortBy ? 10 /* GallerySortBy.PublishedDate */ : options.sortBy;
            }
            const galleryQueryOptions = { ...options, sortBy: isLocalSortBy(options.sortBy) ? undefined : options.sortBy };
            const model = await this.queryGallery(query, galleryQueryOptions, token);
            return { model, disposables: new lifecycle_1.DisposableStore() };
        }
        async queryByIds(ids, options, token) {
            const idsSet = ids.reduce((result, id) => { result.add(id.toLowerCase()); return result; }, new Set());
            const result = (await this.extensionsWorkbenchService.queryLocal(this.options.server))
                .filter(e => idsSet.has(e.identifier.id.toLowerCase()));
            const galleryIds = result.length ? ids.filter(id => result.every(r => !(0, extensionManagementUtil_1.areSameExtensions)(r.identifier, { id }))) : ids;
            if (galleryIds.length) {
                const galleryResult = await this.extensionsWorkbenchService.getExtensions(galleryIds.map(id => ({ id })), { source: 'queryById' }, token);
                result.push(...galleryResult);
            }
            return this.getPagedModel(result);
        }
        async queryLocal(query, options) {
            const local = await this.extensionsWorkbenchService.queryLocal(this.options.server);
            let { extensions, canIncludeInstalledExtensions } = await this.filterLocal(local, this.extensionService.extensions, query, options);
            const disposables = new lifecycle_1.DisposableStore();
            const onDidChangeModel = disposables.add(new event_1.Emitter());
            if (canIncludeInstalledExtensions) {
                let isDisposed = false;
                disposables.add((0, lifecycle_1.toDisposable)(() => isDisposed = true));
                disposables.add(event_1.Event.debounce(event_1.Event.any(event_1.Event.filter(this.extensionsWorkbenchService.onChange, e => e?.state === 1 /* ExtensionState.Installed */), this.extensionService.onDidChangeExtensions), () => undefined)(async () => {
                    const local = this.options.server ? this.extensionsWorkbenchService.installed.filter(e => e.server === this.options.server) : this.extensionsWorkbenchService.local;
                    const { extensions: newExtensions } = await this.filterLocal(local, this.extensionService.extensions, query, options);
                    if (!isDisposed) {
                        const mergedExtensions = this.mergeAddedExtensions(extensions, newExtensions);
                        if (mergedExtensions) {
                            extensions = mergedExtensions;
                            onDidChangeModel.fire(new paging_1.PagedModel(extensions));
                        }
                    }
                }));
            }
            return {
                model: new paging_1.PagedModel(extensions),
                onDidChangeModel: onDidChangeModel.event,
                disposables
            };
        }
        async filterLocal(local, runningExtensions, query, options) {
            const value = query.value;
            let extensions = [];
            let canIncludeInstalledExtensions = true;
            if (/@builtin/i.test(value)) {
                extensions = this.filterBuiltinExtensions(local, query, options);
                canIncludeInstalledExtensions = false;
            }
            else if (/@installed/i.test(value)) {
                extensions = this.filterInstalledExtensions(local, runningExtensions, query, options);
            }
            else if (/@outdated/i.test(value)) {
                extensions = this.filterOutdatedExtensions(local, query, options);
            }
            else if (/@disabled/i.test(value)) {
                extensions = this.filterDisabledExtensions(local, runningExtensions, query, options);
            }
            else if (/@enabled/i.test(value)) {
                extensions = this.filterEnabledExtensions(local, runningExtensions, query, options);
            }
            else if (/@workspaceUnsupported/i.test(value)) {
                extensions = this.filterWorkspaceUnsupportedExtensions(local, query, options);
            }
            else if (/@deprecated/i.test(query.value)) {
                extensions = await this.filterDeprecatedExtensions(local, query, options);
            }
            else if (/@recentlyUpdated/i.test(query.value)) {
                extensions = this.filterRecentlyUpdatedExtensions(local, query, options);
            }
            return { extensions, canIncludeInstalledExtensions };
        }
        filterBuiltinExtensions(local, query, options) {
            let value = query.value;
            const showThemesOnly = /@builtin:themes/i.test(value);
            if (showThemesOnly) {
                value = value.replace(/@builtin:themes/g, '');
            }
            const showBasicsOnly = /@builtin:basics/i.test(value);
            if (showBasicsOnly) {
                value = value.replace(/@builtin:basics/g, '');
            }
            const showFeaturesOnly = /@builtin:features/i.test(value);
            if (showFeaturesOnly) {
                value = value.replace(/@builtin:features/g, '');
            }
            value = value.replace(/@builtin/g, '').replace(/@sort:(\w+)(-\w*)?/g, '').trim().toLowerCase();
            const result = local
                .filter(e => e.isBuiltin && (e.name.toLowerCase().indexOf(value) > -1 || e.displayName.toLowerCase().indexOf(value) > -1));
            const isThemeExtension = (e) => {
                return (Array.isArray(e.local?.manifest?.contributes?.themes) && e.local.manifest.contributes.themes.length > 0)
                    || (Array.isArray(e.local?.manifest?.contributes?.iconThemes) && e.local.manifest.contributes.iconThemes.length > 0);
            };
            if (showThemesOnly) {
                const themesExtensions = result.filter(isThemeExtension);
                return this.sortExtensions(themesExtensions, options);
            }
            const isLanguageBasicExtension = (e) => {
                return FORCE_FEATURE_EXTENSIONS.indexOf(e.identifier.id) === -1
                    && (Array.isArray(e.local?.manifest?.contributes?.grammars) && e.local.manifest.contributes.grammars.length > 0);
            };
            if (showBasicsOnly) {
                const basics = result.filter(isLanguageBasicExtension);
                return this.sortExtensions(basics, options);
            }
            if (showFeaturesOnly) {
                const others = result.filter(e => {
                    return e.local
                        && e.local.manifest
                        && !isThemeExtension(e)
                        && !isLanguageBasicExtension(e);
                });
                return this.sortExtensions(others, options);
            }
            return this.sortExtensions(result, options);
        }
        parseCategories(value) {
            const categories = [];
            value = value.replace(/\bcategory:("([^"]*)"|([^"]\S*))(\s+|\b|$)/g, (_, quotedCategory, category) => {
                const entry = (category || quotedCategory || '').toLowerCase();
                if (categories.indexOf(entry) === -1) {
                    categories.push(entry);
                }
                return '';
            });
            return { value, categories };
        }
        filterInstalledExtensions(local, runningExtensions, query, options) {
            let { value, categories } = this.parseCategories(query.value);
            value = value.replace(/@installed/g, '').replace(/@sort:(\w+)(-\w*)?/g, '').trim().toLowerCase();
            const matchingText = (e) => (e.name.toLowerCase().indexOf(value) > -1 || e.displayName.toLowerCase().indexOf(value) > -1)
                && (!categories.length || categories.some(category => (e.local && e.local.manifest.categories || []).some(c => c.toLowerCase() === category)));
            let result;
            if (options.sortBy !== undefined) {
                result = local.filter(e => !e.isBuiltin && matchingText(e));
                result = this.sortExtensions(result, options);
            }
            else {
                result = local.filter(e => (!e.isBuiltin || e.outdated || e.reloadRequiredStatus !== undefined) && matchingText(e));
                const runningExtensionsById = runningExtensions.reduce((result, e) => { result.set(e.identifier.value, e); return result; }, new extensions_3.ExtensionIdentifierMap());
                const defaultSort = (e1, e2) => {
                    const running1 = runningExtensionsById.get(e1.identifier.id);
                    const isE1Running = !!running1 && this.extensionManagementServerService.getExtensionManagementServer((0, extensions_2.toExtension)(running1)) === e1.server;
                    const running2 = runningExtensionsById.get(e2.identifier.id);
                    const isE2Running = running2 && this.extensionManagementServerService.getExtensionManagementServer((0, extensions_2.toExtension)(running2)) === e2.server;
                    if ((isE1Running && isE2Running)) {
                        return e1.displayName.localeCompare(e2.displayName);
                    }
                    const isE1LanguagePackExtension = e1.local && (0, extensions_3.isLanguagePackExtension)(e1.local.manifest);
                    const isE2LanguagePackExtension = e2.local && (0, extensions_3.isLanguagePackExtension)(e2.local.manifest);
                    if (!isE1Running && !isE2Running) {
                        if (isE1LanguagePackExtension) {
                            return -1;
                        }
                        if (isE2LanguagePackExtension) {
                            return 1;
                        }
                        return e1.displayName.localeCompare(e2.displayName);
                    }
                    if ((isE1Running && isE2LanguagePackExtension) || (isE2Running && isE1LanguagePackExtension)) {
                        return e1.displayName.localeCompare(e2.displayName);
                    }
                    return isE1Running ? -1 : 1;
                };
                const outdated = [];
                const reloadRequired = [];
                const noActionRequired = [];
                result.forEach(e => {
                    if (e.outdated && !e.pinned) {
                        outdated.push(e);
                    }
                    else if (e.reloadRequiredStatus) {
                        reloadRequired.push(e);
                    }
                    else {
                        noActionRequired.push(e);
                    }
                });
                result = [...outdated.sort(defaultSort), ...reloadRequired.sort(defaultSort), ...noActionRequired.sort(defaultSort)];
            }
            return result;
        }
        filterOutdatedExtensions(local, query, options) {
            let { value, categories } = this.parseCategories(query.value);
            value = value.replace(/@outdated/g, '').replace(/@sort:(\w+)(-\w*)?/g, '').trim().toLowerCase();
            const result = local
                .sort((e1, e2) => e1.displayName.localeCompare(e2.displayName))
                .filter(extension => extension.outdated
                && (extension.name.toLowerCase().indexOf(value) > -1 || extension.displayName.toLowerCase().indexOf(value) > -1)
                && (!categories.length || categories.some(category => !!extension.local && extension.local.manifest.categories.some(c => c.toLowerCase() === category))));
            return this.sortExtensions(result, options);
        }
        filterDisabledExtensions(local, runningExtensions, query, options) {
            let { value, categories } = this.parseCategories(query.value);
            value = value.replace(/@disabled/g, '').replace(/@sort:(\w+)(-\w*)?/g, '').trim().toLowerCase();
            const result = local
                .sort((e1, e2) => e1.displayName.localeCompare(e2.displayName))
                .filter(e => runningExtensions.every(r => !(0, extensionManagementUtil_1.areSameExtensions)({ id: r.identifier.value, uuid: r.uuid }, e.identifier))
                && (e.name.toLowerCase().indexOf(value) > -1 || e.displayName.toLowerCase().indexOf(value) > -1)
                && (!categories.length || categories.some(category => (e.local && e.local.manifest.categories || []).some(c => c.toLowerCase() === category))));
            return this.sortExtensions(result, options);
        }
        filterEnabledExtensions(local, runningExtensions, query, options) {
            let { value, categories } = this.parseCategories(query.value);
            value = value ? value.replace(/@enabled/g, '').replace(/@sort:(\w+)(-\w*)?/g, '').trim().toLowerCase() : '';
            local = local.filter(e => !e.isBuiltin);
            const result = local
                .sort((e1, e2) => e1.displayName.localeCompare(e2.displayName))
                .filter(e => runningExtensions.some(r => (0, extensionManagementUtil_1.areSameExtensions)({ id: r.identifier.value, uuid: r.uuid }, e.identifier))
                && (e.name.toLowerCase().indexOf(value) > -1 || e.displayName.toLowerCase().indexOf(value) > -1)
                && (!categories.length || categories.some(category => (e.local && e.local.manifest.categories || []).some(c => c.toLowerCase() === category))));
            return this.sortExtensions(result, options);
        }
        filterWorkspaceUnsupportedExtensions(local, query, options) {
            // shows local extensions which are restricted or disabled in the current workspace because of the extension's capability
            const queryString = query.value; // @sortby is already filtered out
            const match = queryString.match(/^\s*@workspaceUnsupported(?::(untrusted|virtual)(Partial)?)?(?:\s+([^\s]*))?/i);
            if (!match) {
                return [];
            }
            const type = match[1]?.toLowerCase();
            const partial = !!match[2];
            const nameFilter = match[3]?.toLowerCase();
            if (nameFilter) {
                local = local.filter(extension => extension.name.toLowerCase().indexOf(nameFilter) > -1 || extension.displayName.toLowerCase().indexOf(nameFilter) > -1);
            }
            const hasVirtualSupportType = (extension, supportType) => {
                return extension.local && this.extensionManifestPropertiesService.getExtensionVirtualWorkspaceSupportType(extension.local.manifest) === supportType;
            };
            const hasRestrictedSupportType = (extension, supportType) => {
                if (!extension.local) {
                    return false;
                }
                const enablementState = this.extensionEnablementService.getEnablementState(extension.local);
                if (enablementState !== 8 /* EnablementState.EnabledGlobally */ && enablementState !== 9 /* EnablementState.EnabledWorkspace */ &&
                    enablementState !== 0 /* EnablementState.DisabledByTrustRequirement */ && enablementState !== 5 /* EnablementState.DisabledByExtensionDependency */) {
                    return false;
                }
                if (this.extensionManifestPropertiesService.getExtensionUntrustedWorkspaceSupportType(extension.local.manifest) === supportType) {
                    return true;
                }
                if (supportType === false) {
                    const dependencies = (0, extensionManagementUtil_1.getExtensionDependencies)(local.map(ext => ext.local), extension.local);
                    return dependencies.some(ext => this.extensionManifestPropertiesService.getExtensionUntrustedWorkspaceSupportType(ext.manifest) === supportType);
                }
                return false;
            };
            const inVirtualWorkspace = (0, virtualWorkspace_1.isVirtualWorkspace)(this.workspaceService.getWorkspace());
            const inRestrictedWorkspace = !this.workspaceTrustManagementService.isWorkspaceTrusted();
            if (type === 'virtual') {
                // show limited and disabled extensions unless disabled because of a untrusted workspace
                local = local.filter(extension => inVirtualWorkspace && hasVirtualSupportType(extension, partial ? 'limited' : false) && !(inRestrictedWorkspace && hasRestrictedSupportType(extension, false)));
            }
            else if (type === 'untrusted') {
                // show limited and disabled extensions unless disabled because of a virtual workspace
                local = local.filter(extension => hasRestrictedSupportType(extension, partial ? 'limited' : false) && !(inVirtualWorkspace && hasVirtualSupportType(extension, false)));
            }
            else {
                // show extensions that are restricted or disabled in the current workspace
                local = local.filter(extension => inVirtualWorkspace && !hasVirtualSupportType(extension, true) || inRestrictedWorkspace && !hasRestrictedSupportType(extension, true));
            }
            return this.sortExtensions(local, options);
        }
        async filterDeprecatedExtensions(local, query, options) {
            const value = query.value.replace(/@deprecated/g, '').replace(/@sort:(\w+)(-\w*)?/g, '').trim().toLowerCase();
            const extensionsControlManifest = await this.extensionManagementService.getExtensionsControlManifest();
            const deprecatedExtensionIds = Object.keys(extensionsControlManifest.deprecated);
            local = local.filter(e => deprecatedExtensionIds.includes(e.identifier.id) && (!value || e.name.toLowerCase().indexOf(value) > -1 || e.displayName.toLowerCase().indexOf(value) > -1));
            return this.sortExtensions(local, options);
        }
        filterRecentlyUpdatedExtensions(local, query, options) {
            let { value, categories } = this.parseCategories(query.value);
            const currentTime = Date.now();
            local = local.filter(e => !e.isBuiltin && !e.outdated && e.local?.updated && e.local?.installedTimestamp !== undefined && currentTime - e.local.installedTimestamp < ExtensionsListView_1.RECENT_UPDATE_DURATION);
            value = value.replace(/@recentlyUpdated/g, '').replace(/@sort:(\w+)(-\w*)?/g, '').trim().toLowerCase();
            const result = local.filter(e => (e.name.toLowerCase().indexOf(value) > -1 || e.displayName.toLowerCase().indexOf(value) > -1) &&
                (!categories.length || categories.some(category => (e.local && e.local.manifest.categories || []).some(c => c.toLowerCase() === category))));
            options.sortBy = options.sortBy ?? "UpdateDate" /* LocalSortBy.UpdateDate */;
            return this.sortExtensions(result, options);
        }
        mergeAddedExtensions(extensions, newExtensions) {
            const oldExtensions = [...extensions];
            const findPreviousExtensionIndex = (from) => {
                let index = -1;
                const previousExtensionInNew = newExtensions[from];
                if (previousExtensionInNew) {
                    index = oldExtensions.findIndex(e => (0, extensionManagementUtil_1.areSameExtensions)(e.identifier, previousExtensionInNew.identifier));
                    if (index === -1) {
                        return findPreviousExtensionIndex(from - 1);
                    }
                }
                return index;
            };
            let hasChanged = false;
            for (let index = 0; index < newExtensions.length; index++) {
                const extension = newExtensions[index];
                if (extensions.every(r => !(0, extensionManagementUtil_1.areSameExtensions)(r.identifier, extension.identifier))) {
                    hasChanged = true;
                    extensions.splice(findPreviousExtensionIndex(index - 1) + 1, 0, extension);
                }
            }
            return hasChanged ? extensions : undefined;
        }
        async queryGallery(query, options, token) {
            const hasUserDefinedSortOrder = options.sortBy !== undefined;
            if (!hasUserDefinedSortOrder && !query.value.trim()) {
                options.sortBy = 4 /* GallerySortBy.InstallCount */;
            }
            if (this.isRecommendationsQuery(query)) {
                return this.queryRecommendations(query, options, token);
            }
            const text = query.value;
            if (/\bext:([^\s]+)\b/g.test(text)) {
                options.text = text;
                options.source = 'file-extension-tags';
                return this.extensionsWorkbenchService.queryGallery(options, token).then(pager => this.getPagedModel(pager));
            }
            let preferredResults = [];
            if (text) {
                options.text = text.substring(0, 350);
                options.source = 'searchText';
                if (!hasUserDefinedSortOrder) {
                    const manifest = await this.extensionManagementService.getExtensionsControlManifest();
                    const search = manifest.search;
                    if (Array.isArray(search)) {
                        for (const s of search) {
                            if (s.query && s.query.toLowerCase() === text.toLowerCase() && Array.isArray(s.preferredResults)) {
                                preferredResults = s.preferredResults;
                                break;
                            }
                        }
                    }
                }
            }
            else {
                options.source = 'viewlet';
            }
            const pager = await this.extensionsWorkbenchService.queryGallery(options, token);
            let positionToUpdate = 0;
            for (const preferredResult of preferredResults) {
                for (let j = positionToUpdate; j < pager.firstPage.length; j++) {
                    if ((0, extensionManagementUtil_1.areSameExtensions)(pager.firstPage[j].identifier, { id: preferredResult })) {
                        if (positionToUpdate !== j) {
                            const preferredExtension = pager.firstPage.splice(j, 1)[0];
                            pager.firstPage.splice(positionToUpdate, 0, preferredExtension);
                            positionToUpdate++;
                        }
                        break;
                    }
                }
            }
            return this.getPagedModel(pager);
        }
        sortExtensions(extensions, options) {
            switch (options.sortBy) {
                case 4 /* GallerySortBy.InstallCount */:
                    extensions = extensions.sort((e1, e2) => typeof e2.installCount === 'number' && typeof e1.installCount === 'number' ? e2.installCount - e1.installCount : NaN);
                    break;
                case "UpdateDate" /* LocalSortBy.UpdateDate */:
                    extensions = extensions.sort((e1, e2) => typeof e2.local?.installedTimestamp === 'number' && typeof e1.local?.installedTimestamp === 'number' ? e2.local.installedTimestamp - e1.local.installedTimestamp :
                        typeof e2.local?.installedTimestamp === 'number' ? 1 :
                            typeof e1.local?.installedTimestamp === 'number' ? -1 : NaN);
                    break;
                case 6 /* GallerySortBy.AverageRating */:
                case 12 /* GallerySortBy.WeightedRating */:
                    extensions = extensions.sort((e1, e2) => typeof e2.rating === 'number' && typeof e1.rating === 'number' ? e2.rating - e1.rating : NaN);
                    break;
                default:
                    extensions = extensions.sort((e1, e2) => e1.displayName.localeCompare(e2.displayName));
                    break;
            }
            if (options.sortOrder === 2 /* SortOrder.Descending */) {
                extensions = extensions.reverse();
            }
            return extensions;
        }
        isRecommendationsQuery(query) {
            return ExtensionsListView_1.isWorkspaceRecommendedExtensionsQuery(query.value)
                || ExtensionsListView_1.isKeymapsRecommendedExtensionsQuery(query.value)
                || ExtensionsListView_1.isLanguageRecommendedExtensionsQuery(query.value)
                || ExtensionsListView_1.isExeRecommendedExtensionsQuery(query.value)
                || ExtensionsListView_1.isRemoteRecommendedExtensionsQuery(query.value)
                || /@recommended:all/i.test(query.value)
                || ExtensionsListView_1.isSearchRecommendedExtensionsQuery(query.value)
                || ExtensionsListView_1.isRecommendedExtensionsQuery(query.value);
        }
        async queryRecommendations(query, options, token) {
            // Workspace recommendations
            if (ExtensionsListView_1.isWorkspaceRecommendedExtensionsQuery(query.value)) {
                return this.getWorkspaceRecommendationsModel(query, options, token);
            }
            // Keymap recommendations
            if (ExtensionsListView_1.isKeymapsRecommendedExtensionsQuery(query.value)) {
                return this.getKeymapRecommendationsModel(query, options, token);
            }
            // Language recommendations
            if (ExtensionsListView_1.isLanguageRecommendedExtensionsQuery(query.value)) {
                return this.getLanguageRecommendationsModel(query, options, token);
            }
            // Exe recommendations
            if (ExtensionsListView_1.isExeRecommendedExtensionsQuery(query.value)) {
                return this.getExeRecommendationsModel(query, options, token);
            }
            // Remote recommendations
            if (ExtensionsListView_1.isRemoteRecommendedExtensionsQuery(query.value)) {
                return this.getRemoteRecommendationsModel(query, options, token);
            }
            // All recommendations
            if (/@recommended:all/i.test(query.value)) {
                return this.getAllRecommendationsModel(options, token);
            }
            // Search recommendations
            if (ExtensionsListView_1.isSearchRecommendedExtensionsQuery(query.value) ||
                (ExtensionsListView_1.isRecommendedExtensionsQuery(query.value) && options.sortBy !== undefined)) {
                return this.searchRecommendations(query, options, token);
            }
            // Other recommendations
            if (ExtensionsListView_1.isRecommendedExtensionsQuery(query.value)) {
                return this.getOtherRecommendationsModel(query, options, token);
            }
            return new paging_1.PagedModel([]);
        }
        async getInstallableRecommendations(recommendations, options, token) {
            const result = [];
            if (recommendations.length) {
                const extensions = await this.extensionsWorkbenchService.getExtensions(recommendations.map(id => ({ id })), { source: options.source }, token);
                for (const extension of extensions) {
                    if (extension.gallery && !extension.deprecationInfo && (await this.extensionManagementService.canInstall(extension.gallery))) {
                        result.push(extension);
                    }
                }
            }
            return result;
        }
        async getWorkspaceRecommendations() {
            const recommendations = await this.extensionRecommendationsService.getWorkspaceRecommendations();
            const { important } = await this.extensionRecommendationsService.getConfigBasedRecommendations();
            for (const configBasedRecommendation of important) {
                if (!recommendations.find(extensionId => extensionId === configBasedRecommendation)) {
                    recommendations.push(configBasedRecommendation);
                }
            }
            return recommendations;
        }
        async getWorkspaceRecommendationsModel(query, options, token) {
            const recommendations = await this.getWorkspaceRecommendations();
            const installableRecommendations = (await this.getInstallableRecommendations(recommendations, { ...options, source: 'recommendations-workspace' }, token));
            const result = (0, arrays_1.coalesce)(recommendations.map(id => installableRecommendations.find(i => (0, extensionManagementUtil_1.areSameExtensions)(i.identifier, { id }))));
            return new paging_1.PagedModel(result);
        }
        async getKeymapRecommendationsModel(query, options, token) {
            const value = query.value.replace(/@recommended:keymaps/g, '').trim().toLowerCase();
            const recommendations = this.extensionRecommendationsService.getKeymapRecommendations();
            const installableRecommendations = (await this.getInstallableRecommendations(recommendations, { ...options, source: 'recommendations-keymaps' }, token))
                .filter(extension => extension.identifier.id.toLowerCase().indexOf(value) > -1);
            return new paging_1.PagedModel(installableRecommendations);
        }
        async getLanguageRecommendationsModel(query, options, token) {
            const value = query.value.replace(/@recommended:languages/g, '').trim().toLowerCase();
            const recommendations = this.extensionRecommendationsService.getLanguageRecommendations();
            const installableRecommendations = (await this.getInstallableRecommendations(recommendations, { ...options, source: 'recommendations-languages' }, token))
                .filter(extension => extension.identifier.id.toLowerCase().indexOf(value) > -1);
            return new paging_1.PagedModel(installableRecommendations);
        }
        async getRemoteRecommendationsModel(query, options, token) {
            const value = query.value.replace(/@recommended:remotes/g, '').trim().toLowerCase();
            const recommendations = this.extensionRecommendationsService.getRemoteRecommendations();
            const installableRecommendations = (await this.getInstallableRecommendations(recommendations, { ...options, source: 'recommendations-remotes' }, token))
                .filter(extension => extension.identifier.id.toLowerCase().indexOf(value) > -1);
            return new paging_1.PagedModel(installableRecommendations);
        }
        async getExeRecommendationsModel(query, options, token) {
            const exe = query.value.replace(/@exe:/g, '').trim().toLowerCase();
            const { important, others } = await this.extensionRecommendationsService.getExeBasedRecommendations(exe.startsWith('"') ? exe.substring(1, exe.length - 1) : exe);
            const installableRecommendations = await this.getInstallableRecommendations([...important, ...others], { ...options, source: 'recommendations-exe' }, token);
            return new paging_1.PagedModel(installableRecommendations);
        }
        async getOtherRecommendationsModel(query, options, token) {
            const otherRecommendations = await this.getOtherRecommendations();
            const installableRecommendations = await this.getInstallableRecommendations(otherRecommendations, { ...options, source: 'recommendations-other', sortBy: undefined }, token);
            const result = (0, arrays_1.coalesce)(otherRecommendations.map(id => installableRecommendations.find(i => (0, extensionManagementUtil_1.areSameExtensions)(i.identifier, { id }))));
            return new paging_1.PagedModel(result);
        }
        async getOtherRecommendations() {
            const local = (await this.extensionsWorkbenchService.queryLocal(this.options.server))
                .map(e => e.identifier.id.toLowerCase());
            const workspaceRecommendations = (await this.getWorkspaceRecommendations())
                .map(extensionId => extensionId.toLowerCase());
            return (0, arrays_1.distinct)((0, arrays_1.flatten)(await Promise.all([
                // Order is important
                this.extensionRecommendationsService.getImportantRecommendations(),
                this.extensionRecommendationsService.getFileBasedRecommendations(),
                this.extensionRecommendationsService.getOtherRecommendations()
            ])).filter(extensionId => !local.includes(extensionId.toLowerCase()) && !workspaceRecommendations.includes(extensionId.toLowerCase())), extensionId => extensionId.toLowerCase());
        }
        // Get All types of recommendations, trimmed to show a max of 8 at any given time
        async getAllRecommendationsModel(options, token) {
            const local = (await this.extensionsWorkbenchService.queryLocal(this.options.server)).map(e => e.identifier.id.toLowerCase());
            const allRecommendations = (0, arrays_1.distinct)((0, arrays_1.flatten)(await Promise.all([
                // Order is important
                this.getWorkspaceRecommendations(),
                this.extensionRecommendationsService.getImportantRecommendations(),
                this.extensionRecommendationsService.getFileBasedRecommendations(),
                this.extensionRecommendationsService.getOtherRecommendations()
            ])).filter(extensionId => !local.includes(extensionId.toLowerCase())), extensionId => extensionId.toLowerCase());
            const installableRecommendations = await this.getInstallableRecommendations(allRecommendations, { ...options, source: 'recommendations-all', sortBy: undefined }, token);
            const result = (0, arrays_1.coalesce)(allRecommendations.map(id => installableRecommendations.find(i => (0, extensionManagementUtil_1.areSameExtensions)(i.identifier, { id }))));
            return new paging_1.PagedModel(result.slice(0, 8));
        }
        async searchRecommendations(query, options, token) {
            const value = query.value.replace(/@recommended/g, '').trim().toLowerCase();
            const recommendations = (0, arrays_1.distinct)([...await this.getWorkspaceRecommendations(), ...await this.getOtherRecommendations()]);
            const installableRecommendations = (await this.getInstallableRecommendations(recommendations, { ...options, source: 'recommendations', sortBy: undefined }, token))
                .filter(extension => extension.identifier.id.toLowerCase().indexOf(value) > -1);
            const result = (0, arrays_1.coalesce)(recommendations.map(id => installableRecommendations.find(i => (0, extensionManagementUtil_1.areSameExtensions)(i.identifier, { id }))));
            return new paging_1.PagedModel(this.sortExtensions(result, options));
        }
        setModel(model, error, donotResetScrollTop) {
            if (this.list) {
                this.list.model = new paging_1.DelayedPagedModel(model);
                if (!donotResetScrollTop) {
                    this.list.scrollTop = 0;
                }
                this.updateBody(error);
            }
            if (this.badge) {
                this.badge.setCount(this.count());
            }
        }
        updateModel(model) {
            if (this.list) {
                this.list.model = new paging_1.DelayedPagedModel(model);
                this.updateBody();
            }
            if (this.badge) {
                this.badge.setCount(this.count());
            }
        }
        updateBody(error) {
            if (this.bodyTemplate) {
                const count = this.count();
                this.bodyTemplate.extensionsList.classList.toggle('hidden', count === 0);
                this.bodyTemplate.messageContainer.classList.toggle('hidden', count > 0);
                if (count === 0 && this.isBodyVisible()) {
                    if (error) {
                        if ((0, request_1.isOfflineError)(error)) {
                            this.bodyTemplate.messageSeverityIcon.className = severityIcon_1.SeverityIcon.className(notification_1.Severity.Warning);
                            this.bodyTemplate.messageBox.textContent = (0, nls_1.localize)('offline error', "Unable to search the Marketplace when offline, please check your network connection.");
                        }
                        else {
                            this.bodyTemplate.messageSeverityIcon.className = severityIcon_1.SeverityIcon.className(notification_1.Severity.Error);
                            this.bodyTemplate.messageBox.textContent = (0, nls_1.localize)('error', "Error while fetching extensions. {0}", (0, errors_1.getErrorMessage)(error));
                        }
                    }
                    else {
                        this.bodyTemplate.messageSeverityIcon.className = '';
                        this.bodyTemplate.messageBox.textContent = (0, nls_1.localize)('no extensions found', "No extensions found.");
                    }
                    (0, aria_1.alert)(this.bodyTemplate.messageBox.textContent);
                }
            }
            this.updateSize();
        }
        updateSize() {
            if (this.options.flexibleHeight) {
                this.maximumBodySize = this.list?.model.length ? Number.POSITIVE_INFINITY : 0;
                this.storageService.store(`${this.id}.size`, this.list?.model.length || 0, 0 /* StorageScope.PROFILE */, 1 /* StorageTarget.MACHINE */);
            }
        }
        openExtension(extension, options) {
            extension = this.extensionsWorkbenchService.local.filter(e => (0, extensionManagementUtil_1.areSameExtensions)(e.identifier, extension.identifier))[0] || extension;
            this.extensionsWorkbenchService.open(extension, options).then(undefined, err => this.onError(err));
        }
        onError(err) {
            if ((0, errors_1.isCancellationError)(err)) {
                return;
            }
            const message = err && err.message || '';
            if (/ECONNREFUSED/.test(message)) {
                const error = (0, errorMessage_1.createErrorWithActions)((0, nls_1.localize)('suggestProxyError', "Marketplace returned 'ECONNREFUSED'. Please check the 'http.proxy' setting."), [
                    new actions_1.Action('open user settings', (0, nls_1.localize)('open user settings', "Open User Settings"), undefined, true, () => this.preferencesService.openUserSettings())
                ]);
                this.notificationService.error(error);
                return;
            }
            this.notificationService.error(err);
        }
        getPagedModel(arg) {
            if (Array.isArray(arg)) {
                return new paging_1.PagedModel(arg);
            }
            const pager = {
                total: arg.total,
                pageSize: arg.pageSize,
                firstPage: arg.firstPage,
                getPage: (pageIndex, cancellationToken) => arg.getPage(pageIndex, cancellationToken)
            };
            return new paging_1.PagedModel(pager);
        }
        dispose() {
            super.dispose();
            if (this.queryRequest) {
                this.queryRequest.request.cancel();
                this.queryRequest = null;
            }
            if (this.queryResult) {
                this.queryResult.disposables.dispose();
                this.queryResult = undefined;
            }
            this.list = null;
        }
        static isLocalExtensionsQuery(query, sortBy) {
            return this.isInstalledExtensionsQuery(query)
                || this.isOutdatedExtensionsQuery(query)
                || this.isEnabledExtensionsQuery(query)
                || this.isDisabledExtensionsQuery(query)
                || this.isBuiltInExtensionsQuery(query)
                || this.isSearchBuiltInExtensionsQuery(query)
                || this.isBuiltInGroupExtensionsQuery(query)
                || this.isSearchDeprecatedExtensionsQuery(query)
                || this.isSearchWorkspaceUnsupportedExtensionsQuery(query)
                || this.isSearchRecentlyUpdatedQuery(query)
                || this.isSearchExtensionUpdatesQuery(query)
                || this.isSortInstalledExtensionsQuery(query, sortBy);
        }
        static isSearchBuiltInExtensionsQuery(query) {
            return /@builtin\s.+/i.test(query);
        }
        static isBuiltInExtensionsQuery(query) {
            return /^\s*@builtin$/i.test(query.trim());
        }
        static isBuiltInGroupExtensionsQuery(query) {
            return /^\s*@builtin:.+$/i.test(query.trim());
        }
        static isSearchWorkspaceUnsupportedExtensionsQuery(query) {
            return /^\s*@workspaceUnsupported(:(untrusted|virtual)(Partial)?)?(\s|$)/i.test(query);
        }
        static isInstalledExtensionsQuery(query) {
            return /@installed/i.test(query);
        }
        static isOutdatedExtensionsQuery(query) {
            return /@outdated/i.test(query);
        }
        static isEnabledExtensionsQuery(query) {
            return /@enabled/i.test(query);
        }
        static isDisabledExtensionsQuery(query) {
            return /@disabled/i.test(query);
        }
        static isSearchDeprecatedExtensionsQuery(query) {
            return /@deprecated\s?.*/i.test(query);
        }
        static isRecommendedExtensionsQuery(query) {
            return /^@recommended$/i.test(query.trim());
        }
        static isSearchRecommendedExtensionsQuery(query) {
            return /@recommended\s.+/i.test(query);
        }
        static isWorkspaceRecommendedExtensionsQuery(query) {
            return /@recommended:workspace/i.test(query);
        }
        static isExeRecommendedExtensionsQuery(query) {
            return /@exe:.+/i.test(query);
        }
        static isRemoteRecommendedExtensionsQuery(query) {
            return /@recommended:remotes/i.test(query);
        }
        static isKeymapsRecommendedExtensionsQuery(query) {
            return /@recommended:keymaps/i.test(query);
        }
        static isLanguageRecommendedExtensionsQuery(query) {
            return /@recommended:languages/i.test(query);
        }
        static isSortInstalledExtensionsQuery(query, sortBy) {
            return (sortBy !== undefined && sortBy !== '' && query === '') || (!sortBy && /^@sort:\S*$/i.test(query));
        }
        static isSearchPopularQuery(query) {
            return /@popular/i.test(query);
        }
        static isSearchRecentlyPublishedQuery(query) {
            return /@recentlyPublished/i.test(query);
        }
        static isSearchRecentlyUpdatedQuery(query) {
            return /@recentlyUpdated/i.test(query);
        }
        static isSearchExtensionUpdatesQuery(query) {
            return /@updates/i.test(query);
        }
        static isSortUpdateDateQuery(query) {
            return /@sort:updateDate/i.test(query);
        }
        focus() {
            super.focus();
            if (!this.list) {
                return;
            }
            if (!(this.list.getFocus().length || this.list.getSelection().length)) {
                this.list.focusNext();
            }
            this.list.domFocus();
        }
    };
    exports.ExtensionsListView = ExtensionsListView;
    exports.ExtensionsListView = ExtensionsListView = ExtensionsListView_1 = __decorate([
        __param(2, notification_1.INotificationService),
        __param(3, keybinding_1.IKeybindingService),
        __param(4, contextView_1.IContextMenuService),
        __param(5, instantiation_1.IInstantiationService),
        __param(6, themeService_1.IThemeService),
        __param(7, extensions_2.IExtensionService),
        __param(8, extensions_1.IExtensionsWorkbenchService),
        __param(9, extensionRecommendations_1.IExtensionRecommendationsService),
        __param(10, telemetry_1.ITelemetryService),
        __param(11, configuration_1.IConfigurationService),
        __param(12, workspace_1.IWorkspaceContextService),
        __param(13, extensionManagement_1.IExtensionManagementServerService),
        __param(14, extensionManifestPropertiesService_1.IExtensionManifestPropertiesService),
        __param(15, extensionManagement_1.IWorkbenchExtensionManagementService),
        __param(16, workspace_1.IWorkspaceContextService),
        __param(17, productService_1.IProductService),
        __param(18, contextkey_1.IContextKeyService),
        __param(19, views_1.IViewDescriptorService),
        __param(20, opener_1.IOpenerService),
        __param(21, preferences_1.IPreferencesService),
        __param(22, storage_1.IStorageService),
        __param(23, workspaceTrust_1.IWorkspaceTrustManagementService),
        __param(24, extensionManagement_1.IWorkbenchExtensionEnablementService),
        __param(25, layoutService_1.IWorkbenchLayoutService),
        __param(26, log_1.ILogService)
    ], ExtensionsListView);
    class DefaultPopularExtensionsView extends ExtensionsListView {
        async show() {
            const query = this.extensionManagementServerService.webExtensionManagementServer && !this.extensionManagementServerService.localExtensionManagementServer && !this.extensionManagementServerService.remoteExtensionManagementServer ? '@web' : '';
            return super.show(query);
        }
    }
    exports.DefaultPopularExtensionsView = DefaultPopularExtensionsView;
    class ServerInstalledExtensionsView extends ExtensionsListView {
        async show(query) {
            query = query ? query : '@installed';
            if (!ExtensionsListView.isLocalExtensionsQuery(query) || ExtensionsListView.isSortInstalledExtensionsQuery(query)) {
                query = query += ' @installed';
            }
            return super.show(query.trim());
        }
    }
    exports.ServerInstalledExtensionsView = ServerInstalledExtensionsView;
    class EnabledExtensionsView extends ExtensionsListView {
        async show(query) {
            query = query || '@enabled';
            return ExtensionsListView.isEnabledExtensionsQuery(query) ? super.show(query) :
                ExtensionsListView.isSortInstalledExtensionsQuery(query) ? super.show('@enabled ' + query) : this.showEmptyModel();
        }
    }
    exports.EnabledExtensionsView = EnabledExtensionsView;
    class DisabledExtensionsView extends ExtensionsListView {
        async show(query) {
            query = query || '@disabled';
            return ExtensionsListView.isDisabledExtensionsQuery(query) ? super.show(query) :
                ExtensionsListView.isSortInstalledExtensionsQuery(query) ? super.show('@disabled ' + query) : this.showEmptyModel();
        }
    }
    exports.DisabledExtensionsView = DisabledExtensionsView;
    class OutdatedExtensionsView extends ExtensionsListView {
        async show(query) {
            query = query ? query : '@outdated';
            if (ExtensionsListView.isSearchExtensionUpdatesQuery(query)) {
                query = query.replace('@updates', '@outdated');
            }
            const model = await super.show(query.trim());
            this.setExpanded(model.length > 0);
            return model;
        }
    }
    exports.OutdatedExtensionsView = OutdatedExtensionsView;
    class RecentlyUpdatedExtensionsView extends ExtensionsListView {
        async show(query) {
            query = query ? query : '@recentlyUpdated';
            if (ExtensionsListView.isSearchExtensionUpdatesQuery(query)) {
                query = query.replace('@updates', '@recentlyUpdated');
            }
            return super.show(query.trim());
        }
    }
    exports.RecentlyUpdatedExtensionsView = RecentlyUpdatedExtensionsView;
    class BuiltInFeatureExtensionsView extends ExtensionsListView {
        async show(query) {
            return (query && query.trim() !== '@builtin') ? this.showEmptyModel() : super.show('@builtin:features');
        }
    }
    exports.BuiltInFeatureExtensionsView = BuiltInFeatureExtensionsView;
    class BuiltInThemesExtensionsView extends ExtensionsListView {
        async show(query) {
            return (query && query.trim() !== '@builtin') ? this.showEmptyModel() : super.show('@builtin:themes');
        }
    }
    exports.BuiltInThemesExtensionsView = BuiltInThemesExtensionsView;
    class BuiltInProgrammingLanguageExtensionsView extends ExtensionsListView {
        async show(query) {
            return (query && query.trim() !== '@builtin') ? this.showEmptyModel() : super.show('@builtin:basics');
        }
    }
    exports.BuiltInProgrammingLanguageExtensionsView = BuiltInProgrammingLanguageExtensionsView;
    function toSpecificWorkspaceUnsupportedQuery(query, qualifier) {
        if (!query) {
            return '@workspaceUnsupported:' + qualifier;
        }
        const match = query.match(new RegExp(`@workspaceUnsupported(:${qualifier})?(\\s|$)`, 'i'));
        if (match) {
            if (!match[1]) {
                return query.replace(/@workspaceUnsupported/gi, '@workspaceUnsupported:' + qualifier);
            }
            return query;
        }
        return undefined;
    }
    class UntrustedWorkspaceUnsupportedExtensionsView extends ExtensionsListView {
        async show(query) {
            const updatedQuery = toSpecificWorkspaceUnsupportedQuery(query, 'untrusted');
            return updatedQuery ? super.show(updatedQuery) : this.showEmptyModel();
        }
    }
    exports.UntrustedWorkspaceUnsupportedExtensionsView = UntrustedWorkspaceUnsupportedExtensionsView;
    class UntrustedWorkspacePartiallySupportedExtensionsView extends ExtensionsListView {
        async show(query) {
            const updatedQuery = toSpecificWorkspaceUnsupportedQuery(query, 'untrustedPartial');
            return updatedQuery ? super.show(updatedQuery) : this.showEmptyModel();
        }
    }
    exports.UntrustedWorkspacePartiallySupportedExtensionsView = UntrustedWorkspacePartiallySupportedExtensionsView;
    class VirtualWorkspaceUnsupportedExtensionsView extends ExtensionsListView {
        async show(query) {
            const updatedQuery = toSpecificWorkspaceUnsupportedQuery(query, 'virtual');
            return updatedQuery ? super.show(updatedQuery) : this.showEmptyModel();
        }
    }
    exports.VirtualWorkspaceUnsupportedExtensionsView = VirtualWorkspaceUnsupportedExtensionsView;
    class VirtualWorkspacePartiallySupportedExtensionsView extends ExtensionsListView {
        async show(query) {
            const updatedQuery = toSpecificWorkspaceUnsupportedQuery(query, 'virtualPartial');
            return updatedQuery ? super.show(updatedQuery) : this.showEmptyModel();
        }
    }
    exports.VirtualWorkspacePartiallySupportedExtensionsView = VirtualWorkspacePartiallySupportedExtensionsView;
    class DeprecatedExtensionsView extends ExtensionsListView {
        async show(query) {
            return ExtensionsListView.isSearchDeprecatedExtensionsQuery(query) ? super.show(query) : this.showEmptyModel();
        }
    }
    exports.DeprecatedExtensionsView = DeprecatedExtensionsView;
    class SearchMarketplaceExtensionsView extends ExtensionsListView {
        constructor() {
            super(...arguments);
            this.reportSearchFinishedDelayer = this._register(new async_1.ThrottledDelayer(2000));
            this.searchWaitPromise = Promise.resolve();
        }
        async show(query) {
            const queryPromise = super.show(query);
            this.reportSearchFinishedDelayer.trigger(() => this.reportSearchFinished());
            this.searchWaitPromise = queryPromise.then(null, null);
            return queryPromise;
        }
        async reportSearchFinished() {
            await this.searchWaitPromise;
            this.telemetryService.publicLog2('extensionsView:MarketplaceSearchFinished');
        }
    }
    exports.SearchMarketplaceExtensionsView = SearchMarketplaceExtensionsView;
    class DefaultRecommendedExtensionsView extends ExtensionsListView {
        constructor() {
            super(...arguments);
            this.recommendedExtensionsQuery = '@recommended:all';
        }
        renderBody(container) {
            super.renderBody(container);
            this._register(this.extensionRecommendationsService.onDidChangeRecommendations(() => {
                this.show('');
            }));
        }
        async show(query) {
            if (query && query.trim() !== this.recommendedExtensionsQuery) {
                return this.showEmptyModel();
            }
            const model = await super.show(this.recommendedExtensionsQuery);
            if (!this.extensionsWorkbenchService.local.some(e => !e.isBuiltin)) {
                // This is part of popular extensions view. Collapse if no installed extensions.
                this.setExpanded(model.length > 0);
            }
            return model;
        }
    }
    exports.DefaultRecommendedExtensionsView = DefaultRecommendedExtensionsView;
    class RecommendedExtensionsView extends ExtensionsListView {
        constructor() {
            super(...arguments);
            this.recommendedExtensionsQuery = '@recommended';
        }
        renderBody(container) {
            super.renderBody(container);
            this._register(this.extensionRecommendationsService.onDidChangeRecommendations(() => {
                this.show('');
            }));
        }
        async show(query) {
            return (query && query.trim() !== this.recommendedExtensionsQuery) ? this.showEmptyModel() : super.show(this.recommendedExtensionsQuery);
        }
    }
    exports.RecommendedExtensionsView = RecommendedExtensionsView;
    class WorkspaceRecommendedExtensionsView extends ExtensionsListView {
        constructor() {
            super(...arguments);
            this.recommendedExtensionsQuery = '@recommended:workspace';
        }
        renderBody(container) {
            super.renderBody(container);
            this._register(this.extensionRecommendationsService.onDidChangeRecommendations(() => this.show(this.recommendedExtensionsQuery)));
            this._register(this.contextService.onDidChangeWorkbenchState(() => this.show(this.recommendedExtensionsQuery)));
        }
        async show(query) {
            const shouldShowEmptyView = query && query.trim() !== '@recommended' && query.trim() !== '@recommended:workspace';
            const model = await (shouldShowEmptyView ? this.showEmptyModel() : super.show(this.recommendedExtensionsQuery));
            this.setExpanded(model.length > 0);
            return model;
        }
        async getInstallableWorkspaceRecommendations() {
            const installed = (await this.extensionsWorkbenchService.queryLocal())
                .filter(l => l.enablementState !== 1 /* EnablementState.DisabledByExtensionKind */); // Filter extensions disabled by kind
            const recommendations = (await this.getWorkspaceRecommendations())
                .filter(extensionId => installed.every(local => !(0, extensionManagementUtil_1.areSameExtensions)({ id: extensionId }, local.identifier)));
            return this.getInstallableRecommendations(recommendations, { source: 'install-all-workspace-recommendations' }, cancellation_1.CancellationToken.None);
        }
        async installWorkspaceRecommendations() {
            const installableRecommendations = await this.getInstallableWorkspaceRecommendations();
            if (installableRecommendations.length) {
                await this.extensionManagementService.installGalleryExtensions(installableRecommendations.map(i => ({ extension: i.gallery, options: {} })));
            }
            else {
                this.notificationService.notify({
                    severity: notification_1.Severity.Info,
                    message: (0, nls_1.localize)('no local extensions', "There are no extensions to install.")
                });
            }
        }
    }
    exports.WorkspaceRecommendedExtensionsView = WorkspaceRecommendedExtensionsView;
    function getAriaLabelForExtension(extension) {
        if (!extension) {
            return '';
        }
        const publisher = extension.publisherDomain?.verified ? (0, nls_1.localize)('extension.arialabel.verifiedPublisher', "Verified Publisher {0}", extension.publisherDisplayName) : (0, nls_1.localize)('extension.arialabel.publisher', "Publisher {0}", extension.publisherDisplayName);
        const deprecated = extension?.deprecationInfo ? (0, nls_1.localize)('extension.arialabel.deprecated', "Deprecated") : '';
        const rating = extension?.rating ? (0, nls_1.localize)('extension.arialabel.rating', "Rated {0} out of 5 stars by {1} users", extension.rating.toFixed(2), extension.ratingCount) : '';
        return `${extension.displayName}, ${deprecated ? `${deprecated}, ` : ''}${extension.version}, ${publisher}, ${extension.description} ${rating ? `, ${rating}` : ''}`;
    }
    exports.getAriaLabelForExtension = getAriaLabelForExtension;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0ZW5zaW9uc1ZpZXdzLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvZXh0ZW5zaW9ucy9icm93c2VyL2V4dGVuc2lvbnNWaWV3cy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7O0lBdURoRyxvSEFBb0g7SUFDcEgsTUFBTSx3QkFBd0IsR0FBRyxDQUFDLFlBQVksRUFBRSxpQkFBaUIsRUFBRSxzQkFBc0IsQ0FBQyxDQUFDO0lBRTNGLE1BQU0sbUJBQW9CLFNBQVEsc0JBQVU7UUFBNUM7O1lBRWtCLGFBQVEsR0FBd0IsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLGVBQU8sRUFBYyxDQUFDLENBQUM7WUFDbEYsWUFBTyxHQUFzQixJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQztZQUV6QyxZQUFPLEdBQXdCLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxlQUFPLEVBQWMsQ0FBQyxDQUFDO1lBQ2pGLFdBQU0sR0FBc0IsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUM7WUFFaEQsMEJBQXFCLEdBQWlCLEVBQUUsQ0FBQztRQU9sRCxDQUFDO1FBTEEsYUFBYSxDQUFDLFVBQXdCO1lBQ3JDLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDO1lBQzlFLElBQUksQ0FBQyxxQkFBcUIsR0FBRyxVQUFVLENBQUM7WUFDeEMsSUFBSSxDQUFDLHFCQUFxQixDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUM7UUFDaEYsQ0FBQztLQUNEO0lBZUQsSUFBVyxXQUVWO0lBRkQsV0FB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