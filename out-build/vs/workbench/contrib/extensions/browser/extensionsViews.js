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
define(["require", "exports", "vs/nls!vs/workbench/contrib/extensions/browser/extensionsViews", "vs/base/common/lifecycle", "vs/base/common/event", "vs/base/common/errors", "vs/base/common/errorMessage", "vs/base/common/paging", "vs/workbench/services/extensionManagement/common/extensionManagement", "vs/workbench/services/extensionRecommendations/common/extensionRecommendations", "vs/platform/extensionManagement/common/extensionManagementUtil", "vs/platform/keybinding/common/keybinding", "vs/platform/contextview/browser/contextView", "vs/base/browser/dom", "vs/platform/instantiation/common/instantiation", "vs/workbench/contrib/extensions/browser/extensionsList", "vs/workbench/contrib/extensions/common/extensions", "vs/workbench/contrib/extensions/common/extensionQuery", "vs/workbench/services/extensions/common/extensions", "vs/platform/theme/common/themeService", "vs/platform/telemetry/common/telemetry", "vs/base/browser/ui/countBadge/countBadge", "vs/workbench/contrib/extensions/browser/extensionsActions", "vs/platform/list/browser/listService", "vs/platform/configuration/common/configuration", "vs/platform/notification/common/notification", "vs/workbench/browser/parts/views/viewPane", "vs/platform/workspace/common/workspace", "vs/base/common/arrays", "vs/base/browser/ui/aria/aria", "vs/base/common/cancellation", "vs/base/common/actions", "vs/platform/extensions/common/extensions", "vs/base/common/async", "vs/platform/product/common/productService", "vs/platform/severityIcon/browser/severityIcon", "vs/platform/contextkey/common/contextkey", "vs/workbench/common/theme", "vs/workbench/common/views", "vs/platform/opener/common/opener", "vs/workbench/services/preferences/common/preferences", "vs/platform/storage/common/storage", "vs/workbench/services/extensions/common/extensionManifestPropertiesService", "vs/platform/workspace/common/virtualWorkspace", "vs/platform/workspace/common/workspaceTrust", "vs/workbench/services/layout/browser/layoutService", "vs/platform/log/common/log", "vs/base/parts/request/common/request", "vs/platform/theme/browser/defaultStyles"], function (require, exports, nls_1, lifecycle_1, event_1, errors_1, errorMessage_1, paging_1, extensionManagement_1, extensionRecommendations_1, extensionManagementUtil_1, keybinding_1, contextView_1, dom_1, instantiation_1, extensionsList_1, extensions_1, extensionQuery_1, extensions_2, themeService_1, telemetry_1, countBadge_1, extensionsActions_1, listService_1, configuration_1, notification_1, viewPane_1, workspace_1, arrays_1, aria_1, cancellation_1, actions_1, extensions_3, async_1, productService_1, severityIcon_1, contextkey_1, theme_1, views_1, opener_1, preferences_1, storage_1, extensionManifestPropertiesService_1, virtualWorkspace_1, workspaceTrust_1, layoutService_1, log_1, request_1, defaultStyles_1) {
    "use strict";
    var $_Tb_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$sUb = exports.$rUb = exports.$qUb = exports.$pUb = exports.$oUb = exports.$nUb = exports.$mUb = exports.$lUb = exports.$kUb = exports.$jUb = exports.$iUb = exports.$hUb = exports.$gUb = exports.$fUb = exports.$eUb = exports.$dUb = exports.$cUb = exports.$bUb = exports.$aUb = exports.$_Tb = void 0;
    // Extensions that are automatically classified as Programming Language extensions, but should be Feature extensions
    const FORCE_FEATURE_EXTENSIONS = ['vscode.git', 'vscode.git-base', 'vscode.search-result'];
    class ExtensionsViewState extends lifecycle_1.$kc {
        constructor() {
            super(...arguments);
            this.a = this.B(new event_1.$fd());
            this.onFocus = this.a.event;
            this.b = this.B(new event_1.$fd());
            this.onBlur = this.b.event;
            this.f = [];
        }
        onFocusChange(extensions) {
            this.f.forEach(extension => this.b.fire(extension));
            this.f = extensions;
            this.f.forEach(extension => this.a.fire(extension));
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
    let $_Tb = class $_Tb extends viewPane_1.$Ieb {
        static { $_Tb_1 = this; }
        static { this.a = 7 * 24 * 60 * 60 * 1000; } // 7 days
        constructor(t, viewletViewOptions, L, keybindingService, contextMenuService, instantiationService, themeService, ab, sb, Wb, telemetryService, configurationService, Xb, Yb, Zb, $b, ac, bc, contextKeyService, viewDescriptorService, openerService, cc, dc, ec, fc, gc, hc) {
            super({
                ...viewletViewOptions,
                showActions: viewPane_1.ViewPaneShowActions.Always,
                maximumBodySize: t.flexibleHeight ? (dc.getNumber(`${viewletViewOptions.id}.size`, 0 /* StorageScope.PROFILE */, 0) ? undefined : 0) : undefined
            }, keybindingService, contextMenuService, configurationService, contextKeyService, viewDescriptorService, instantiationService, openerService, themeService, telemetryService);
            this.t = t;
            this.L = L;
            this.ab = ab;
            this.sb = sb;
            this.Wb = Wb;
            this.Xb = Xb;
            this.Yb = Yb;
            this.Zb = Zb;
            this.$b = $b;
            this.ac = ac;
            this.bc = bc;
            this.cc = cc;
            this.dc = dc;
            this.ec = ec;
            this.fc = fc;
            this.gc = gc;
            this.hc = hc;
            this.g = null;
            this.h = null;
            this.n = this.B(new actions_1.$hi());
            if (this.t.onDidChangeTitle) {
                this.B(this.t.onDidChangeTitle(title => this.Jb(title)));
            }
            this.B(this.n.onDidRun(({ error }) => error && this.L.error(error)));
            this.ic();
        }
        ic() { }
        S(container) {
            container.classList.add('extension-view-header');
            super.S(container);
            if (!this.t.hideBadge) {
                this.f = new countBadge_1.$nR((0, dom_1.$0O)(container, (0, dom_1.$)('.count-badge-wrapper')), {}, defaultStyles_1.$v2);
            }
        }
        U(container) {
            super.U(container);
            const extensionsList = (0, dom_1.$0O)(container, (0, dom_1.$)('.extensions-list'));
            const messageContainer = (0, dom_1.$0O)(container, (0, dom_1.$)('.message-container'));
            const messageSeverityIcon = (0, dom_1.$0O)(messageContainer, (0, dom_1.$)(''));
            const messageBox = (0, dom_1.$0O)(messageContainer, (0, dom_1.$)('.message'));
            const delegate = new extensionsList_1.$9Tb();
            const extensionsViewState = new ExtensionsViewState();
            const renderer = this.Bb.createInstance(extensionsList_1.$0Tb, extensionsViewState, { hoverOptions: { position: () => { return this.gc.getSideBarPosition() === 0 /* Position.LEFT */ ? 1 /* HoverPosition.RIGHT */ : 0 /* HoverPosition.LEFT */; } } });
            this.g = this.Bb.createInstance(listService_1.$q4, 'Extensions', extensionsList, delegate, [renderer], {
                multipleSelectionSupport: false,
                setRowLineHeight: false,
                horizontalScrolling: false,
                accessibilityProvider: {
                    getAriaLabel(extension) {
                        return $sUb(extension);
                    },
                    getWidgetAriaLabel() {
                        return (0, nls_1.localize)(0, null);
                    }
                },
                overrideStyles: {
                    listBackground: theme_1.$Iab
                },
                openOnSingleClick: true
            });
            this.B(this.g.onContextMenu(e => this.nc(e), this));
            this.B(this.g.onDidChangeFocus(e => extensionsViewState.onFocusChange((0, arrays_1.$Fb)(e.elements)), this));
            this.B(this.g);
            this.B(extensionsViewState);
            this.B(event_1.Event.debounce(event_1.Event.filter(this.g.onDidOpen, e => e.element !== null), (_, event) => event, 75, true)(options => {
                this.Vc(options.element, { sideByside: options.sideBySide, ...options.editorOptions });
            }));
            this.b = {
                extensionsList,
                messageBox,
                messageContainer,
                messageSeverityIcon
            };
            if (this.m) {
                this.Rc(this.m.model);
            }
        }
        W(height, width) {
            super.W(height, width);
            if (this.b) {
                this.b.extensionsList.style.height = height + 'px';
            }
            this.g?.layout(height, width);
        }
        async show(query, refresh) {
            if (this.h) {
                if (!refresh && this.h.query === query) {
                    return this.h.request;
                }
                this.h.request.cancel();
                this.h = null;
            }
            if (this.m) {
                this.m.disposables.dispose();
                this.m = undefined;
            }
            const parsedQuery = extensionQuery_1.$$Tb.parse(query);
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
            const request = (0, async_1.$ug)(async (token) => {
                try {
                    this.m = await this.oc(parsedQuery, options, token);
                    const model = this.m.model;
                    this.Rc(model);
                    if (this.m.onDidChangeModel) {
                        this.m.disposables.add(this.m.onDidChangeModel(model => {
                            if (this.m) {
                                this.m.model = model;
                                this.Sc(model);
                            }
                        }));
                    }
                    return model;
                }
                catch (e) {
                    const model = new paging_1.$Hn([]);
                    if (!(0, errors_1.$2)(e)) {
                        this.hc.error(e);
                        this.Rc(model, e);
                    }
                    return this.g ? this.g.model : model;
                }
            });
            request.finally(() => this.h = null);
            this.h = { query, request };
            return request;
        }
        count() {
            return this.m?.model.length ?? 0;
        }
        mc() {
            const emptyModel = new paging_1.$Hn([]);
            this.Rc(emptyModel);
            return Promise.resolve(emptyModel);
        }
        async nc(e) {
            if (e.element) {
                const disposables = new lifecycle_1.$jc();
                const manageExtensionAction = disposables.add(this.Bb.createInstance(extensionsActions_1.$Ghb));
                const extension = e.element ? this.sb.local.find(local => (0, extensionManagementUtil_1.$po)(local.identifier, e.element.identifier) && (!e.element.server || e.element.server === local.server)) || e.element
                    : e.element;
                manageExtensionAction.extension = extension;
                let groups = [];
                if (manageExtensionAction.enabled) {
                    groups = await manageExtensionAction.getActionGroups();
                }
                else if (extension) {
                    groups = await (0, extensionsActions_1.$Fhb)(extension, this.zb, this.Bb);
                    groups.forEach(group => group.forEach(extensionAction => {
                        if (extensionAction instanceof extensionsActions_1.$phb) {
                            extensionAction.extension = extension;
                        }
                    }));
                }
                let actions = [];
                for (const menuActions of groups) {
                    actions = [...actions, ...menuActions, new actions_1.$ii()];
                }
                actions.pop();
                this.xb.showContextMenu({
                    getAnchor: () => e.anchor,
                    getActions: () => actions,
                    actionRunner: this.n,
                    onHide: () => disposables.dispose()
                });
            }
        }
        async oc(query, options, token) {
            const idRegex = /@id:(([a-z0-9A-Z][a-z0-9\-A-Z]*)\.([a-z0-9A-Z][a-z0-9\-A-Z]*))/g;
            const ids = [];
            let idMatch;
            while ((idMatch = idRegex.exec(query.value)) !== null) {
                const name = idMatch[1];
                ids.push(name);
            }
            if (ids.length) {
                const model = await this.pc(ids, options, token);
                return { model, disposables: new lifecycle_1.$jc() };
            }
            if ($_Tb_1.isLocalExtensionsQuery(query.value, query.sortBy)) {
                return this.qc(query, options);
            }
            if ($_Tb_1.isSearchPopularQuery(query.value)) {
                query.value = query.value.replace('@popular', '');
                options.sortBy = !options.sortBy ? 4 /* GallerySortBy.InstallCount */ : options.sortBy;
            }
            else if ($_Tb_1.isSearchRecentlyPublishedQuery(query.value)) {
                query.value = query.value.replace('@recentlyPublished', '');
                options.sortBy = !options.sortBy ? 10 /* GallerySortBy.PublishedDate */ : options.sortBy;
            }
            const galleryQueryOptions = { ...options, sortBy: isLocalSortBy(options.sortBy) ? undefined : options.sortBy };
            const model = await this.Cc(query, galleryQueryOptions, token);
            return { model, disposables: new lifecycle_1.$jc() };
        }
        async pc(ids, options, token) {
            const idsSet = ids.reduce((result, id) => { result.add(id.toLowerCase()); return result; }, new Set());
            const result = (await this.sb.queryLocal(this.t.server))
                .filter(e => idsSet.has(e.identifier.id.toLowerCase()));
            const galleryIds = result.length ? ids.filter(id => result.every(r => !(0, extensionManagementUtil_1.$po)(r.identifier, { id }))) : ids;
            if (galleryIds.length) {
                const galleryResult = await this.sb.getExtensions(galleryIds.map(id => ({ id })), { source: 'queryById' }, token);
                result.push(...galleryResult);
            }
            return this.Xc(result);
        }
        async qc(query, options) {
            const local = await this.sb.queryLocal(this.t.server);
            let { extensions, canIncludeInstalledExtensions } = await this.rc(local, this.ab.extensions, query, options);
            const disposables = new lifecycle_1.$jc();
            const onDidChangeModel = disposables.add(new event_1.$fd());
            if (canIncludeInstalledExtensions) {
                let isDisposed = false;
                disposables.add((0, lifecycle_1.$ic)(() => isDisposed = true));
                disposables.add(event_1.Event.debounce(event_1.Event.any(event_1.Event.filter(this.sb.onChange, e => e?.state === 1 /* ExtensionState.Installed */), this.ab.onDidChangeExtensions), () => undefined)(async () => {
                    const local = this.t.server ? this.sb.installed.filter(e => e.server === this.t.server) : this.sb.local;
                    const { extensions: newExtensions } = await this.rc(local, this.ab.extensions, query, options);
                    if (!isDisposed) {
                        const mergedExtensions = this.Bc(extensions, newExtensions);
                        if (mergedExtensions) {
                            extensions = mergedExtensions;
                            onDidChangeModel.fire(new paging_1.$Hn(extensions));
                        }
                    }
                }));
            }
            return {
                model: new paging_1.$Hn(extensions),
                onDidChangeModel: onDidChangeModel.event,
                disposables
            };
        }
        async rc(local, runningExtensions, query, options) {
            const value = query.value;
            let extensions = [];
            let canIncludeInstalledExtensions = true;
            if (/@builtin/i.test(value)) {
                extensions = this.sc(local, query, options);
                canIncludeInstalledExtensions = false;
            }
            else if (/@installed/i.test(value)) {
                extensions = this.uc(local, runningExtensions, query, options);
            }
            else if (/@outdated/i.test(value)) {
                extensions = this.vc(local, query, options);
            }
            else if (/@disabled/i.test(value)) {
                extensions = this.wc(local, runningExtensions, query, options);
            }
            else if (/@enabled/i.test(value)) {
                extensions = this.xc(local, runningExtensions, query, options);
            }
            else if (/@workspaceUnsupported/i.test(value)) {
                extensions = this.yc(local, query, options);
            }
            else if (/@deprecated/i.test(query.value)) {
                extensions = await this.zc(local, query, options);
            }
            else if (/@recentlyUpdated/i.test(query.value)) {
                extensions = this.Ac(local, query, options);
            }
            return { extensions, canIncludeInstalledExtensions };
        }
        sc(local, query, options) {
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
                return this.Dc(themesExtensions, options);
            }
            const isLanguageBasicExtension = (e) => {
                return FORCE_FEATURE_EXTENSIONS.indexOf(e.identifier.id) === -1
                    && (Array.isArray(e.local?.manifest?.contributes?.grammars) && e.local.manifest.contributes.grammars.length > 0);
            };
            if (showBasicsOnly) {
                const basics = result.filter(isLanguageBasicExtension);
                return this.Dc(basics, options);
            }
            if (showFeaturesOnly) {
                const others = result.filter(e => {
                    return e.local
                        && e.local.manifest
                        && !isThemeExtension(e)
                        && !isLanguageBasicExtension(e);
                });
                return this.Dc(others, options);
            }
            return this.Dc(result, options);
        }
        tc(value) {
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
        uc(local, runningExtensions, query, options) {
            let { value, categories } = this.tc(query.value);
            value = value.replace(/@installed/g, '').replace(/@sort:(\w+)(-\w*)?/g, '').trim().toLowerCase();
            const matchingText = (e) => (e.name.toLowerCase().indexOf(value) > -1 || e.displayName.toLowerCase().indexOf(value) > -1)
                && (!categories.length || categories.some(category => (e.local && e.local.manifest.categories || []).some(c => c.toLowerCase() === category)));
            let result;
            if (options.sortBy !== undefined) {
                result = local.filter(e => !e.isBuiltin && matchingText(e));
                result = this.Dc(result, options);
            }
            else {
                result = local.filter(e => (!e.isBuiltin || e.outdated || e.reloadRequiredStatus !== undefined) && matchingText(e));
                const runningExtensionsById = runningExtensions.reduce((result, e) => { result.set(e.identifier.value, e); return result; }, new extensions_3.$Xl());
                const defaultSort = (e1, e2) => {
                    const running1 = runningExtensionsById.get(e1.identifier.id);
                    const isE1Running = !!running1 && this.Yb.getExtensionManagementServer((0, extensions_2.$TF)(running1)) === e1.server;
                    const running2 = runningExtensionsById.get(e2.identifier.id);
                    const isE2Running = running2 && this.Yb.getExtensionManagementServer((0, extensions_2.$TF)(running2)) === e2.server;
                    if ((isE1Running && isE2Running)) {
                        return e1.displayName.localeCompare(e2.displayName);
                    }
                    const isE1LanguagePackExtension = e1.local && (0, extensions_3.$Zl)(e1.local.manifest);
                    const isE2LanguagePackExtension = e2.local && (0, extensions_3.$Zl)(e2.local.manifest);
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
        vc(local, query, options) {
            let { value, categories } = this.tc(query.value);
            value = value.replace(/@outdated/g, '').replace(/@sort:(\w+)(-\w*)?/g, '').trim().toLowerCase();
            const result = local
                .sort((e1, e2) => e1.displayName.localeCompare(e2.displayName))
                .filter(extension => extension.outdated
                && (extension.name.toLowerCase().indexOf(value) > -1 || extension.displayName.toLowerCase().indexOf(value) > -1)
                && (!categories.length || categories.some(category => !!extension.local && extension.local.manifest.categories.some(c => c.toLowerCase() === category))));
            return this.Dc(result, options);
        }
        wc(local, runningExtensions, query, options) {
            let { value, categories } = this.tc(query.value);
            value = value.replace(/@disabled/g, '').replace(/@sort:(\w+)(-\w*)?/g, '').trim().toLowerCase();
            const result = local
                .sort((e1, e2) => e1.displayName.localeCompare(e2.displayName))
                .filter(e => runningExtensions.every(r => !(0, extensionManagementUtil_1.$po)({ id: r.identifier.value, uuid: r.uuid }, e.identifier))
                && (e.name.toLowerCase().indexOf(value) > -1 || e.displayName.toLowerCase().indexOf(value) > -1)
                && (!categories.length || categories.some(category => (e.local && e.local.manifest.categories || []).some(c => c.toLowerCase() === category))));
            return this.Dc(result, options);
        }
        xc(local, runningExtensions, query, options) {
            let { value, categories } = this.tc(query.value);
            value = value ? value.replace(/@enabled/g, '').replace(/@sort:(\w+)(-\w*)?/g, '').trim().toLowerCase() : '';
            local = local.filter(e => !e.isBuiltin);
            const result = local
                .sort((e1, e2) => e1.displayName.localeCompare(e2.displayName))
                .filter(e => runningExtensions.some(r => (0, extensionManagementUtil_1.$po)({ id: r.identifier.value, uuid: r.uuid }, e.identifier))
                && (e.name.toLowerCase().indexOf(value) > -1 || e.displayName.toLowerCase().indexOf(value) > -1)
                && (!categories.length || categories.some(category => (e.local && e.local.manifest.categories || []).some(c => c.toLowerCase() === category))));
            return this.Dc(result, options);
        }
        yc(local, query, options) {
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
                return extension.local && this.Zb.getExtensionVirtualWorkspaceSupportType(extension.local.manifest) === supportType;
            };
            const hasRestrictedSupportType = (extension, supportType) => {
                if (!extension.local) {
                    return false;
                }
                const enablementState = this.fc.getEnablementState(extension.local);
                if (enablementState !== 8 /* EnablementState.EnabledGlobally */ && enablementState !== 9 /* EnablementState.EnabledWorkspace */ &&
                    enablementState !== 0 /* EnablementState.DisabledByTrustRequirement */ && enablementState !== 5 /* EnablementState.DisabledByExtensionDependency */) {
                    return false;
                }
                if (this.Zb.getExtensionUntrustedWorkspaceSupportType(extension.local.manifest) === supportType) {
                    return true;
                }
                if (supportType === false) {
                    const dependencies = (0, extensionManagementUtil_1.$zo)(local.map(ext => ext.local), extension.local);
                    return dependencies.some(ext => this.Zb.getExtensionUntrustedWorkspaceSupportType(ext.manifest) === supportType);
                }
                return false;
            };
            const inVirtualWorkspace = (0, virtualWorkspace_1.$xJ)(this.ac.getWorkspace());
            const inRestrictedWorkspace = !this.ec.isWorkspaceTrusted();
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
            return this.Dc(local, options);
        }
        async zc(local, query, options) {
            const value = query.value.replace(/@deprecated/g, '').replace(/@sort:(\w+)(-\w*)?/g, '').trim().toLowerCase();
            const extensionsControlManifest = await this.$b.getExtensionsControlManifest();
            const deprecatedExtensionIds = Object.keys(extensionsControlManifest.deprecated);
            local = local.filter(e => deprecatedExtensionIds.includes(e.identifier.id) && (!value || e.name.toLowerCase().indexOf(value) > -1 || e.displayName.toLowerCase().indexOf(value) > -1));
            return this.Dc(local, options);
        }
        Ac(local, query, options) {
            let { value, categories } = this.tc(query.value);
            const currentTime = Date.now();
            local = local.filter(e => !e.isBuiltin && !e.outdated && e.local?.updated && e.local?.installedTimestamp !== undefined && currentTime - e.local.installedTimestamp < $_Tb_1.a);
            value = value.replace(/@recentlyUpdated/g, '').replace(/@sort:(\w+)(-\w*)?/g, '').trim().toLowerCase();
            const result = local.filter(e => (e.name.toLowerCase().indexOf(value) > -1 || e.displayName.toLowerCase().indexOf(value) > -1) &&
                (!categories.length || categories.some(category => (e.local && e.local.manifest.categories || []).some(c => c.toLowerCase() === category))));
            options.sortBy = options.sortBy ?? "UpdateDate" /* LocalSortBy.UpdateDate */;
            return this.Dc(result, options);
        }
        Bc(extensions, newExtensions) {
            const oldExtensions = [...extensions];
            const findPreviousExtensionIndex = (from) => {
                let index = -1;
                const previousExtensionInNew = newExtensions[from];
                if (previousExtensionInNew) {
                    index = oldExtensions.findIndex(e => (0, extensionManagementUtil_1.$po)(e.identifier, previousExtensionInNew.identifier));
                    if (index === -1) {
                        return findPreviousExtensionIndex(from - 1);
                    }
                }
                return index;
            };
            let hasChanged = false;
            for (let index = 0; index < newExtensions.length; index++) {
                const extension = newExtensions[index];
                if (extensions.every(r => !(0, extensionManagementUtil_1.$po)(r.identifier, extension.identifier))) {
                    hasChanged = true;
                    extensions.splice(findPreviousExtensionIndex(index - 1) + 1, 0, extension);
                }
            }
            return hasChanged ? extensions : undefined;
        }
        async Cc(query, options, token) {
            const hasUserDefinedSortOrder = options.sortBy !== undefined;
            if (!hasUserDefinedSortOrder && !query.value.trim()) {
                options.sortBy = 4 /* GallerySortBy.InstallCount */;
            }
            if (this.Ec(query)) {
                return this.Fc(query, options, token);
            }
            const text = query.value;
            if (/\bext:([^\s]+)\b/g.test(text)) {
                options.text = text;
                options.source = 'file-extension-tags';
                return this.sb.queryGallery(options, token).then(pager => this.Xc(pager));
            }
            let preferredResults = [];
            if (text) {
                options.text = text.substring(0, 350);
                options.source = 'searchText';
                if (!hasUserDefinedSortOrder) {
                    const manifest = await this.$b.getExtensionsControlManifest();
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
            const pager = await this.sb.queryGallery(options, token);
            let positionToUpdate = 0;
            for (const preferredResult of preferredResults) {
                for (let j = positionToUpdate; j < pager.firstPage.length; j++) {
                    if ((0, extensionManagementUtil_1.$po)(pager.firstPage[j].identifier, { id: preferredResult })) {
                        if (positionToUpdate !== j) {
                            const preferredExtension = pager.firstPage.splice(j, 1)[0];
                            pager.firstPage.splice(positionToUpdate, 0, preferredExtension);
                            positionToUpdate++;
                        }
                        break;
                    }
                }
            }
            return this.Xc(pager);
        }
        Dc(extensions, options) {
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
        Ec(query) {
            return $_Tb_1.isWorkspaceRecommendedExtensionsQuery(query.value)
                || $_Tb_1.isKeymapsRecommendedExtensionsQuery(query.value)
                || $_Tb_1.isLanguageRecommendedExtensionsQuery(query.value)
                || $_Tb_1.isExeRecommendedExtensionsQuery(query.value)
                || $_Tb_1.isRemoteRecommendedExtensionsQuery(query.value)
                || /@recommended:all/i.test(query.value)
                || $_Tb_1.isSearchRecommendedExtensionsQuery(query.value)
                || $_Tb_1.isRecommendedExtensionsQuery(query.value);
        }
        async Fc(query, options, token) {
            // Workspace recommendations
            if ($_Tb_1.isWorkspaceRecommendedExtensionsQuery(query.value)) {
                return this.Ic(query, options, token);
            }
            // Keymap recommendations
            if ($_Tb_1.isKeymapsRecommendedExtensionsQuery(query.value)) {
                return this.Jc(query, options, token);
            }
            // Language recommendations
            if ($_Tb_1.isLanguageRecommendedExtensionsQuery(query.value)) {
                return this.Kc(query, options, token);
            }
            // Exe recommendations
            if ($_Tb_1.isExeRecommendedExtensionsQuery(query.value)) {
                return this.Mc(query, options, token);
            }
            // Remote recommendations
            if ($_Tb_1.isRemoteRecommendedExtensionsQuery(query.value)) {
                return this.Lc(query, options, token);
            }
            // All recommendations
            if (/@recommended:all/i.test(query.value)) {
                return this.Pc(options, token);
            }
            // Search recommendations
            if ($_Tb_1.isSearchRecommendedExtensionsQuery(query.value) ||
                ($_Tb_1.isRecommendedExtensionsQuery(query.value) && options.sortBy !== undefined)) {
                return this.Qc(query, options, token);
            }
            // Other recommendations
            if ($_Tb_1.isRecommendedExtensionsQuery(query.value)) {
                return this.Nc(query, options, token);
            }
            return new paging_1.$Hn([]);
        }
        async Gc(recommendations, options, token) {
            const result = [];
            if (recommendations.length) {
                const extensions = await this.sb.getExtensions(recommendations.map(id => ({ id })), { source: options.source }, token);
                for (const extension of extensions) {
                    if (extension.gallery && !extension.deprecationInfo && (await this.$b.canInstall(extension.gallery))) {
                        result.push(extension);
                    }
                }
            }
            return result;
        }
        async Hc() {
            const recommendations = await this.Wb.getWorkspaceRecommendations();
            const { important } = await this.Wb.getConfigBasedRecommendations();
            for (const configBasedRecommendation of important) {
                if (!recommendations.find(extensionId => extensionId === configBasedRecommendation)) {
                    recommendations.push(configBasedRecommendation);
                }
            }
            return recommendations;
        }
        async Ic(query, options, token) {
            const recommendations = await this.Hc();
            const installableRecommendations = (await this.Gc(recommendations, { ...options, source: 'recommendations-workspace' }, token));
            const result = (0, arrays_1.$Fb)(recommendations.map(id => installableRecommendations.find(i => (0, extensionManagementUtil_1.$po)(i.identifier, { id }))));
            return new paging_1.$Hn(result);
        }
        async Jc(query, options, token) {
            const value = query.value.replace(/@recommended:keymaps/g, '').trim().toLowerCase();
            const recommendations = this.Wb.getKeymapRecommendations();
            const installableRecommendations = (await this.Gc(recommendations, { ...options, source: 'recommendations-keymaps' }, token))
                .filter(extension => extension.identifier.id.toLowerCase().indexOf(value) > -1);
            return new paging_1.$Hn(installableRecommendations);
        }
        async Kc(query, options, token) {
            const value = query.value.replace(/@recommended:languages/g, '').trim().toLowerCase();
            const recommendations = this.Wb.getLanguageRecommendations();
            const installableRecommendations = (await this.Gc(recommendations, { ...options, source: 'recommendations-languages' }, token))
                .filter(extension => extension.identifier.id.toLowerCase().indexOf(value) > -1);
            return new paging_1.$Hn(installableRecommendations);
        }
        async Lc(query, options, token) {
            const value = query.value.replace(/@recommended:remotes/g, '').trim().toLowerCase();
            const recommendations = this.Wb.getRemoteRecommendations();
            const installableRecommendations = (await this.Gc(recommendations, { ...options, source: 'recommendations-remotes' }, token))
                .filter(extension => extension.identifier.id.toLowerCase().indexOf(value) > -1);
            return new paging_1.$Hn(installableRecommendations);
        }
        async Mc(query, options, token) {
            const exe = query.value.replace(/@exe:/g, '').trim().toLowerCase();
            const { important, others } = await this.Wb.getExeBasedRecommendations(exe.startsWith('"') ? exe.substring(1, exe.length - 1) : exe);
            const installableRecommendations = await this.Gc([...important, ...others], { ...options, source: 'recommendations-exe' }, token);
            return new paging_1.$Hn(installableRecommendations);
        }
        async Nc(query, options, token) {
            const otherRecommendations = await this.Oc();
            const installableRecommendations = await this.Gc(otherRecommendations, { ...options, source: 'recommendations-other', sortBy: undefined }, token);
            const result = (0, arrays_1.$Fb)(otherRecommendations.map(id => installableRecommendations.find(i => (0, extensionManagementUtil_1.$po)(i.identifier, { id }))));
            return new paging_1.$Hn(result);
        }
        async Oc() {
            const local = (await this.sb.queryLocal(this.t.server))
                .map(e => e.identifier.id.toLowerCase());
            const workspaceRecommendations = (await this.Hc())
                .map(extensionId => extensionId.toLowerCase());
            return (0, arrays_1.$Kb)((0, arrays_1.$Pb)(await Promise.all([
                // Order is important
                this.Wb.getImportantRecommendations(),
                this.Wb.getFileBasedRecommendations(),
                this.Wb.getOtherRecommendations()
            ])).filter(extensionId => !local.includes(extensionId.toLowerCase()) && !workspaceRecommendations.includes(extensionId.toLowerCase())), extensionId => extensionId.toLowerCase());
        }
        // Get All types of recommendations, trimmed to show a max of 8 at any given time
        async Pc(options, token) {
            const local = (await this.sb.queryLocal(this.t.server)).map(e => e.identifier.id.toLowerCase());
            const allRecommendations = (0, arrays_1.$Kb)((0, arrays_1.$Pb)(await Promise.all([
                // Order is important
                this.Hc(),
                this.Wb.getImportantRecommendations(),
                this.Wb.getFileBasedRecommendations(),
                this.Wb.getOtherRecommendations()
            ])).filter(extensionId => !local.includes(extensionId.toLowerCase())), extensionId => extensionId.toLowerCase());
            const installableRecommendations = await this.Gc(allRecommendations, { ...options, source: 'recommendations-all', sortBy: undefined }, token);
            const result = (0, arrays_1.$Fb)(allRecommendations.map(id => installableRecommendations.find(i => (0, extensionManagementUtil_1.$po)(i.identifier, { id }))));
            return new paging_1.$Hn(result.slice(0, 8));
        }
        async Qc(query, options, token) {
            const value = query.value.replace(/@recommended/g, '').trim().toLowerCase();
            const recommendations = (0, arrays_1.$Kb)([...await this.Hc(), ...await this.Oc()]);
            const installableRecommendations = (await this.Gc(recommendations, { ...options, source: 'recommendations', sortBy: undefined }, token))
                .filter(extension => extension.identifier.id.toLowerCase().indexOf(value) > -1);
            const result = (0, arrays_1.$Fb)(recommendations.map(id => installableRecommendations.find(i => (0, extensionManagementUtil_1.$po)(i.identifier, { id }))));
            return new paging_1.$Hn(this.Dc(result, options));
        }
        Rc(model, error, donotResetScrollTop) {
            if (this.g) {
                this.g.model = new paging_1.$In(model);
                if (!donotResetScrollTop) {
                    this.g.scrollTop = 0;
                }
                this.Tc(error);
            }
            if (this.f) {
                this.f.setCount(this.count());
            }
        }
        Sc(model) {
            if (this.g) {
                this.g.model = new paging_1.$In(model);
                this.Tc();
            }
            if (this.f) {
                this.f.setCount(this.count());
            }
        }
        Tc(error) {
            if (this.b) {
                const count = this.count();
                this.b.extensionsList.classList.toggle('hidden', count === 0);
                this.b.messageContainer.classList.toggle('hidden', count > 0);
                if (count === 0 && this.isBodyVisible()) {
                    if (error) {
                        if ((0, request_1.$Kn)(error)) {
                            this.b.messageSeverityIcon.className = severityIcon_1.SeverityIcon.className(notification_1.Severity.Warning);
                            this.b.messageBox.textContent = (0, nls_1.localize)(1, null);
                        }
                        else {
                            this.b.messageSeverityIcon.className = severityIcon_1.SeverityIcon.className(notification_1.Severity.Error);
                            this.b.messageBox.textContent = (0, nls_1.localize)(2, null, (0, errors_1.$8)(error));
                        }
                    }
                    else {
                        this.b.messageSeverityIcon.className = '';
                        this.b.messageBox.textContent = (0, nls_1.localize)(3, null);
                    }
                    (0, aria_1.$$P)(this.b.messageBox.textContent);
                }
            }
            this.Uc();
        }
        Uc() {
            if (this.t.flexibleHeight) {
                this.maximumBodySize = this.g?.model.length ? Number.POSITIVE_INFINITY : 0;
                this.dc.store(`${this.id}.size`, this.g?.model.length || 0, 0 /* StorageScope.PROFILE */, 1 /* StorageTarget.MACHINE */);
            }
        }
        Vc(extension, options) {
            extension = this.sb.local.filter(e => (0, extensionManagementUtil_1.$po)(e.identifier, extension.identifier))[0] || extension;
            this.sb.open(extension, options).then(undefined, err => this.Wc(err));
        }
        Wc(err) {
            if ((0, errors_1.$2)(err)) {
                return;
            }
            const message = err && err.message || '';
            if (/ECONNREFUSED/.test(message)) {
                const error = (0, errorMessage_1.$oi)((0, nls_1.localize)(4, null), [
                    new actions_1.$gi('open user settings', (0, nls_1.localize)(5, null), undefined, true, () => this.cc.openUserSettings())
                ]);
                this.L.error(error);
                return;
            }
            this.L.error(err);
        }
        Xc(arg) {
            if (Array.isArray(arg)) {
                return new paging_1.$Hn(arg);
            }
            const pager = {
                total: arg.total,
                pageSize: arg.pageSize,
                firstPage: arg.firstPage,
                getPage: (pageIndex, cancellationToken) => arg.getPage(pageIndex, cancellationToken)
            };
            return new paging_1.$Hn(pager);
        }
        dispose() {
            super.dispose();
            if (this.h) {
                this.h.request.cancel();
                this.h = null;
            }
            if (this.m) {
                this.m.disposables.dispose();
                this.m = undefined;
            }
            this.g = null;
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
            if (!this.g) {
                return;
            }
            if (!(this.g.getFocus().length || this.g.getSelection().length)) {
                this.g.focusNext();
            }
            this.g.domFocus();
        }
    };
    exports.$_Tb = $_Tb;
    exports.$_Tb = $_Tb = $_Tb_1 = __decorate([
        __param(2, notification_1.$Yu),
        __param(3, keybinding_1.$2D),
        __param(4, contextView_1.$WZ),
        __param(5, instantiation_1.$Ah),
        __param(6, themeService_1.$gv),
        __param(7, extensions_2.$MF),
        __param(8, extensions_1.$Pfb),
        __param(9, extensionRecommendations_1.$9fb),
        __param(10, telemetry_1.$9k),
        __param(11, configuration_1.$8h),
        __param(12, workspace_1.$Kh),
        __param(13, extensionManagement_1.$fcb),
        __param(14, extensionManifestPropertiesService_1.$vcb),
        __param(15, extensionManagement_1.$hcb),
        __param(16, workspace_1.$Kh),
        __param(17, productService_1.$kj),
        __param(18, contextkey_1.$3i),
        __param(19, views_1.$_E),
        __param(20, opener_1.$NT),
        __param(21, preferences_1.$BE),
        __param(22, storage_1.$Vo),
        __param(23, workspaceTrust_1.$$z),
        __param(24, extensionManagement_1.$icb),
        __param(25, layoutService_1.$Meb),
        __param(26, log_1.$5i)
    ], $_Tb);
    class $aUb extends $_Tb {
        async show() {
            const query = this.Yb.webExtensionManagementServer && !this.Yb.localExtensionManagementServer && !this.Yb.remoteExtensionManagementServer ? '@web' : '';
            return super.show(query);
        }
    }
    exports.$aUb = $aUb;
    class $bUb extends $_Tb {
        async show(query) {
            query = query ? query : '@installed';
            if (!$_Tb.isLocalExtensionsQuery(query) || $_Tb.isSortInstalledExtensionsQuery(query)) {
                query = query += ' @installed';
            }
            return super.show(query.trim());
        }
    }
    exports.$bUb = $bUb;
    class $cUb extends $_Tb {
        async show(query) {
            query = query || '@enabled';
            return $_Tb.isEnabledExtensionsQuery(query) ? super.show(query) :
                $_Tb.isSortInstalledExtensionsQuery(query) ? super.show('@enabled ' + query) : this.mc();
        }
    }
    exports.$cUb = $cUb;
    class $dUb extends $_Tb {
        async show(query) {
            query = query || '@disabled';
            return $_Tb.isDisabledExtensionsQuery(query) ? super.show(query) :
                $_Tb.isSortInstalledExtensionsQuery(query) ? super.show('@disabled ' + query) : this.mc();
        }
    }
    exports.$dUb = $dUb;
    class $eUb extends $_Tb {
        async show(query) {
            query = query ? query : '@outdated';
            if ($_Tb.isSearchExtensionUpdatesQuery(query)) {
                query = query.replace('@updates', '@outdated');
            }
            const model = await super.show(query.trim());
            this.setExpanded(model.length > 0);
            return model;
        }
    }
    exports.$eUb = $eUb;
    class $fUb extends $_Tb {
        async show(query) {
            query = query ? query : '@recentlyUpdated';
            if ($_Tb.isSearchExtensionUpdatesQuery(query)) {
                query = query.replace('@updates', '@recentlyUpdated');
            }
            return super.show(query.trim());
        }
    }
    exports.$fUb = $fUb;
    class $gUb extends $_Tb {
        async show(query) {
            return (query && query.trim() !== '@builtin') ? this.mc() : super.show('@builtin:features');
        }
    }
    exports.$gUb = $gUb;
    class $hUb extends $_Tb {
        async show(query) {
            return (query && query.trim() !== '@builtin') ? this.mc() : super.show('@builtin:themes');
        }
    }
    exports.$hUb = $hUb;
    class $iUb extends $_Tb {
        async show(query) {
            return (query && query.trim() !== '@builtin') ? this.mc() : super.show('@builtin:basics');
        }
    }
    exports.$iUb = $iUb;
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
    class $jUb extends $_Tb {
        async show(query) {
            const updatedQuery = toSpecificWorkspaceUnsupportedQuery(query, 'untrusted');
            return updatedQuery ? super.show(updatedQuery) : this.mc();
        }
    }
    exports.$jUb = $jUb;
    class $kUb extends $_Tb {
        async show(query) {
            const updatedQuery = toSpecificWorkspaceUnsupportedQuery(query, 'untrustedPartial');
            return updatedQuery ? super.show(updatedQuery) : this.mc();
        }
    }
    exports.$kUb = $kUb;
    class $lUb extends $_Tb {
        async show(query) {
            const updatedQuery = toSpecificWorkspaceUnsupportedQuery(query, 'virtual');
            return updatedQuery ? super.show(updatedQuery) : this.mc();
        }
    }
    exports.$lUb = $lUb;
    class $mUb extends $_Tb {
        async show(query) {
            const updatedQuery = toSpecificWorkspaceUnsupportedQuery(query, 'virtualPartial');
            return updatedQuery ? super.show(updatedQuery) : this.mc();
        }
    }
    exports.$mUb = $mUb;
    class $nUb extends $_Tb {
        async show(query) {
            return $_Tb.isSearchDeprecatedExtensionsQuery(query) ? super.show(query) : this.mc();
        }
    }
    exports.$nUb = $nUb;
    class $oUb extends $_Tb {
        constructor() {
            super(...arguments);
            this.Yc = this.B(new async_1.$Eg(2000));
            this.Zc = Promise.resolve();
        }
        async show(query) {
            const queryPromise = super.show(query);
            this.Yc.trigger(() => this.$c());
            this.Zc = queryPromise.then(null, null);
            return queryPromise;
        }
        async $c() {
            await this.Zc;
            this.Eb.publicLog2('extensionsView:MarketplaceSearchFinished');
        }
    }
    exports.$oUb = $oUb;
    class $pUb extends $_Tb {
        constructor() {
            super(...arguments);
            this.Yc = '@recommended:all';
        }
        U(container) {
            super.U(container);
            this.B(this.Wb.onDidChangeRecommendations(() => {
                this.show('');
            }));
        }
        async show(query) {
            if (query && query.trim() !== this.Yc) {
                return this.mc();
            }
            const model = await super.show(this.Yc);
            if (!this.sb.local.some(e => !e.isBuiltin)) {
                // This is part of popular extensions view. Collapse if no installed extensions.
                this.setExpanded(model.length > 0);
            }
            return model;
        }
    }
    exports.$pUb = $pUb;
    class $qUb extends $_Tb {
        constructor() {
            super(...arguments);
            this.Yc = '@recommended';
        }
        U(container) {
            super.U(container);
            this.B(this.Wb.onDidChangeRecommendations(() => {
                this.show('');
            }));
        }
        async show(query) {
            return (query && query.trim() !== this.Yc) ? this.mc() : super.show(this.Yc);
        }
    }
    exports.$qUb = $qUb;
    class $rUb extends $_Tb {
        constructor() {
            super(...arguments);
            this.Yc = '@recommended:workspace';
        }
        U(container) {
            super.U(container);
            this.B(this.Wb.onDidChangeRecommendations(() => this.show(this.Yc)));
            this.B(this.Xb.onDidChangeWorkbenchState(() => this.show(this.Yc)));
        }
        async show(query) {
            const shouldShowEmptyView = query && query.trim() !== '@recommended' && query.trim() !== '@recommended:workspace';
            const model = await (shouldShowEmptyView ? this.mc() : super.show(this.Yc));
            this.setExpanded(model.length > 0);
            return model;
        }
        async $c() {
            const installed = (await this.sb.queryLocal())
                .filter(l => l.enablementState !== 1 /* EnablementState.DisabledByExtensionKind */); // Filter extensions disabled by kind
            const recommendations = (await this.Hc())
                .filter(extensionId => installed.every(local => !(0, extensionManagementUtil_1.$po)({ id: extensionId }, local.identifier)));
            return this.Gc(recommendations, { source: 'install-all-workspace-recommendations' }, cancellation_1.CancellationToken.None);
        }
        async installWorkspaceRecommendations() {
            const installableRecommendations = await this.$c();
            if (installableRecommendations.length) {
                await this.$b.installGalleryExtensions(installableRecommendations.map(i => ({ extension: i.gallery, options: {} })));
            }
            else {
                this.L.notify({
                    severity: notification_1.Severity.Info,
                    message: (0, nls_1.localize)(6, null)
                });
            }
        }
    }
    exports.$rUb = $rUb;
    function $sUb(extension) {
        if (!extension) {
            return '';
        }
        const publisher = extension.publisherDomain?.verified ? (0, nls_1.localize)(7, null, extension.publisherDisplayName) : (0, nls_1.localize)(8, null, extension.publisherDisplayName);
        const deprecated = extension?.deprecationInfo ? (0, nls_1.localize)(9, null) : '';
        const rating = extension?.rating ? (0, nls_1.localize)(10, null, extension.rating.toFixed(2), extension.ratingCount) : '';
        return `${extension.displayName}, ${deprecated ? `${deprecated}, ` : ''}${extension.version}, ${publisher}, ${extension.description} ${rating ? `, ${rating}` : ''}`;
    }
    exports.$sUb = $sUb;
});
//# sourceMappingURL=extensionsViews.js.map