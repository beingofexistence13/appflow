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
define(["require", "exports", "vs/nls!vs/workbench/contrib/extensions/browser/extensionsViewlet", "vs/base/common/async", "vs/base/common/errors", "vs/base/common/errorMessage", "vs/base/common/lifecycle", "vs/base/common/event", "vs/base/common/actions", "vs/base/browser/dom", "vs/platform/telemetry/common/telemetry", "vs/platform/instantiation/common/instantiation", "vs/workbench/services/extensions/common/extensions", "../common/extensions", "vs/workbench/contrib/extensions/browser/extensionsActions", "vs/platform/extensionManagement/common/extensionManagement", "vs/workbench/services/extensionManagement/common/extensionManagement", "vs/workbench/contrib/extensions/common/extensionsInput", "vs/workbench/contrib/extensions/browser/extensionsViews", "vs/platform/progress/common/progress", "vs/workbench/services/editor/common/editorGroupsService", "vs/base/common/severity", "vs/workbench/services/activity/common/activity", "vs/platform/theme/common/themeService", "vs/platform/configuration/common/configuration", "vs/workbench/common/views", "vs/platform/storage/common/storage", "vs/platform/workspace/common/workspace", "vs/platform/contextkey/common/contextkey", "vs/platform/contextview/browser/contextView", "vs/platform/log/common/log", "vs/platform/notification/common/notification", "vs/workbench/services/host/browser/host", "vs/workbench/services/layout/browser/layoutService", "vs/workbench/browser/parts/views/viewPaneContainer", "vs/workbench/contrib/extensions/common/extensionQuery", "vs/workbench/contrib/codeEditor/browser/suggestEnabledInput/suggestEnabledInput", "vs/base/browser/ui/aria/aria", "vs/platform/registry/common/platform", "vs/platform/label/common/label", "vs/platform/instantiation/common/descriptors", "vs/workbench/services/preferences/common/preferences", "vs/workbench/common/theme", "vs/workbench/services/environment/common/environmentService", "vs/workbench/common/contextkeys", "vs/platform/commands/common/commands", "vs/workbench/contrib/extensions/browser/extensionsIcons", "vs/platform/actions/common/actions", "vs/workbench/services/panecomposite/browser/panecomposite", "vs/base/common/arrays", "vs/platform/dnd/browser/dnd", "vs/base/common/resources", "vs/platform/extensionManagement/common/extensionManagementUtil", "vs/workbench/browser/actions/widgetNavigationCommands", "vs/css!./media/extensionsViewlet"], function (require, exports, nls_1, async_1, errors_1, errorMessage_1, lifecycle_1, event_1, actions_1, dom_1, telemetry_1, instantiation_1, extensions_1, extensions_2, extensionsActions_1, extensionManagement_1, extensionManagement_2, extensionsInput_1, extensionsViews_1, progress_1, editorGroupsService_1, severity_1, activity_1, themeService_1, configuration_1, views_1, storage_1, workspace_1, contextkey_1, contextView_1, log_1, notification_1, host_1, layoutService_1, viewPaneContainer_1, extensionQuery_1, suggestEnabledInput_1, aria_1, platform_1, label_1, descriptors_1, preferences_1, theme_1, environmentService_1, contextkeys_1, commands_1, extensionsIcons_1, actions_2, panecomposite_1, arrays_1, dnd_1, resources_1, extensionManagementUtil_1, widgetNavigationCommands_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$KUb = exports.$JUb = exports.$IUb = exports.$HUb = exports.$GUb = exports.$FUb = exports.$EUb = exports.$DUb = exports.$CUb = exports.$BUb = void 0;
    exports.$BUb = new contextkey_1.$2i('defaultExtensionViews', true);
    exports.$CUb = new contextkey_1.$2i('extensionsSortByValue', '');
    exports.$DUb = new contextkey_1.$2i('searchMarketplaceExtensions', false);
    exports.$EUb = new contextkey_1.$2i('extensionSearchHasText', false);
    const SearchInstalledExtensionsContext = new contextkey_1.$2i('searchInstalledExtensions', false);
    const SearchRecentlyUpdatedExtensionsContext = new contextkey_1.$2i('searchRecentlyUpdatedExtensions', false);
    const SearchExtensionUpdatesContext = new contextkey_1.$2i('searchExtensionUpdates', false);
    const SearchOutdatedExtensionsContext = new contextkey_1.$2i('searchOutdatedExtensions', false);
    const SearchEnabledExtensionsContext = new contextkey_1.$2i('searchEnabledExtensions', false);
    const SearchDisabledExtensionsContext = new contextkey_1.$2i('searchDisabledExtensions', false);
    const HasInstalledExtensionsContext = new contextkey_1.$2i('hasInstalledExtensions', true);
    exports.$FUb = new contextkey_1.$2i('builtInExtensions', false);
    const SearchBuiltInExtensionsContext = new contextkey_1.$2i('searchBuiltInExtensions', false);
    const SearchUnsupportedWorkspaceExtensionsContext = new contextkey_1.$2i('searchUnsupportedWorkspaceExtensions', false);
    const SearchDeprecatedExtensionsContext = new contextkey_1.$2i('searchDeprecatedExtensions', false);
    exports.$GUb = new contextkey_1.$2i('recommendedExtensions', false);
    const SortByUpdateDateContext = new contextkey_1.$2i('sortByUpdateDate', false);
    const REMOTE_CATEGORY = { value: (0, nls_1.localize)(0, null), original: 'Remote' };
    let $HUb = class $HUb {
        constructor(b, c, viewDescriptorService, d) {
            this.b = b;
            this.c = c;
            this.d = d;
            this.a = viewDescriptorService.getViewContainerById(extensions_2.$Ofb);
            this.f();
        }
        f() {
            const viewDescriptors = [];
            /* Default views */
            viewDescriptors.push(...this.g());
            /* Search views */
            viewDescriptors.push(...this.h());
            /* Recommendations views */
            viewDescriptors.push(...this.i());
            /* Built-in extensions views */
            viewDescriptors.push(...this.j());
            /* Trust Required extensions views */
            viewDescriptors.push(...this.k());
            /* Other Local Filtered extensions views */
            viewDescriptors.push(...this.l());
            platform_1.$8m.as(views_1.Extensions.ViewsRegistry).registerViews(viewDescriptors, this.a);
        }
        g() {
            const viewDescriptors = [];
            /*
             * Default installed extensions views - Shows all user installed extensions.
             */
            const servers = [];
            if (this.b.localExtensionManagementServer) {
                servers.push(this.b.localExtensionManagementServer);
            }
            if (this.b.remoteExtensionManagementServer) {
                servers.push(this.b.remoteExtensionManagementServer);
            }
            if (this.b.webExtensionManagementServer) {
                servers.push(this.b.webExtensionManagementServer);
            }
            const getViewName = (viewTitle, server) => {
                return servers.length > 1 ? `${server.label} - ${viewTitle}` : viewTitle;
            };
            let installedWebExtensionsContextChangeEvent = event_1.Event.None;
            if (this.b.webExtensionManagementServer && this.b.remoteExtensionManagementServer) {
                const interestingContextKeys = new Set();
                interestingContextKeys.add('hasInstalledWebExtensions');
                installedWebExtensionsContextChangeEvent = event_1.Event.filter(this.d.onDidChangeContext, e => e.affectsSome(interestingContextKeys));
            }
            const serverLabelChangeEvent = event_1.Event.any(this.c.onDidChangeFormatters, installedWebExtensionsContextChangeEvent);
            for (const server of servers) {
                const getInstalledViewName = () => getViewName((0, nls_1.localize)(1, null), server);
                const onDidChangeTitle = event_1.Event.map(serverLabelChangeEvent, () => getInstalledViewName());
                const id = servers.length > 1 ? `workbench.views.extensions.${server.id}.installed` : `workbench.views.extensions.installed`;
                /* Installed extensions view */
                viewDescriptors.push({
                    id,
                    get name() { return getInstalledViewName(); },
                    weight: 100,
                    order: 1,
                    when: contextkey_1.$Ii.and(exports.$BUb),
                    ctorDescriptor: new descriptors_1.$yh(extensionsViews_1.$bUb, [{ server, flexibleHeight: true, onDidChangeTitle }]),
                    /* Installed extensions views shall not be allowed to hidden when there are more than one server */
                    canToggleVisibility: servers.length === 1
                });
                if (server === this.b.remoteExtensionManagementServer && this.b.localExtensionManagementServer) {
                    (0, actions_2.$Xu)(class InstallLocalExtensionsInRemoteAction2 extends actions_2.$Wu {
                        constructor() {
                            super({
                                id: 'workbench.extensions.installLocalExtensions',
                                get title() {
                                    return {
                                        value: (0, nls_1.localize)(2, null, server.label),
                                        original: `Install Local Extensions in '${server.label}'...`,
                                    };
                                },
                                category: REMOTE_CATEGORY,
                                icon: extensionsIcons_1.$4gb,
                                f1: true,
                                menu: {
                                    id: actions_2.$Ru.ViewTitle,
                                    when: contextkey_1.$Ii.equals('view', id),
                                    group: 'navigation',
                                }
                            });
                        }
                        run(accessor) {
                            return accessor.get(instantiation_1.$Ah).createInstance(extensionsActions_1.$aib).run();
                        }
                    });
                }
            }
            if (this.b.localExtensionManagementServer && this.b.remoteExtensionManagementServer) {
                (0, actions_2.$Xu)(class InstallRemoteExtensionsInLocalAction2 extends actions_2.$Wu {
                    constructor() {
                        super({
                            id: 'workbench.extensions.actions.installLocalExtensionsInRemote',
                            title: { value: (0, nls_1.localize)(3, null), original: 'Install Remote Extensions Locally...' },
                            category: REMOTE_CATEGORY,
                            f1: true
                        });
                    }
                    run(accessor) {
                        return accessor.get(instantiation_1.$Ah).createInstance(extensionsActions_1.$bib, 'workbench.extensions.actions.installLocalExtensionsInRemote').run();
                    }
                });
            }
            /*
             * Default popular extensions view
             * Separate view for popular extensions required as we need to show popular and recommended sections
             * in the default view when there is no search text, and user has no installed extensions.
             */
            viewDescriptors.push({
                id: 'workbench.views.extensions.popular',
                name: (0, nls_1.localize)(4, null),
                ctorDescriptor: new descriptors_1.$yh(extensionsViews_1.$aUb, [{ hideBadge: true }]),
                when: contextkey_1.$Ii.and(exports.$BUb, contextkey_1.$Ii.not('hasInstalledExtensions'), extensions_2.$3fb),
                weight: 60,
                order: 2,
                canToggleVisibility: false
            });
            /*
             * Default recommended extensions view
             * When user has installed extensions, this is shown along with the views for enabled & disabled extensions
             * When user has no installed extensions, this is shown along with the view for popular extensions
             */
            viewDescriptors.push({
                id: 'extensions.recommendedList',
                name: (0, nls_1.localize)(5, null),
                ctorDescriptor: new descriptors_1.$yh(extensionsViews_1.$pUb, [{ flexibleHeight: true }]),
                when: contextkey_1.$Ii.and(exports.$BUb, SortByUpdateDateContext.negate(), contextkey_1.$Ii.not('config.extensions.showRecommendationsOnlyOnDemand'), extensions_2.$3fb),
                weight: 40,
                order: 3,
                canToggleVisibility: true
            });
            /* Installed views shall be default in multi server window  */
            if (servers.length === 1) {
                /*
                 * Default enabled extensions view - Shows all user installed enabled extensions.
                 * Hidden by default
                 */
                viewDescriptors.push({
                    id: 'workbench.views.extensions.enabled',
                    name: (0, nls_1.localize)(6, null),
                    ctorDescriptor: new descriptors_1.$yh(extensionsViews_1.$cUb, [{}]),
                    when: contextkey_1.$Ii.and(exports.$BUb, contextkey_1.$Ii.has('hasInstalledExtensions')),
                    hideByDefault: true,
                    weight: 40,
                    order: 4,
                    canToggleVisibility: true
                });
                /*
                 * Default disabled extensions view - Shows all disabled extensions.
                 * Hidden by default
                 */
                viewDescriptors.push({
                    id: 'workbench.views.extensions.disabled',
                    name: (0, nls_1.localize)(7, null),
                    ctorDescriptor: new descriptors_1.$yh(extensionsViews_1.$dUb, [{}]),
                    when: contextkey_1.$Ii.and(exports.$BUb, contextkey_1.$Ii.has('hasInstalledExtensions')),
                    hideByDefault: true,
                    weight: 10,
                    order: 5,
                    canToggleVisibility: true
                });
            }
            return viewDescriptors;
        }
        h() {
            const viewDescriptors = [];
            /*
             * View used for searching Marketplace
             */
            viewDescriptors.push({
                id: 'workbench.views.extensions.marketplace',
                name: (0, nls_1.localize)(8, null),
                ctorDescriptor: new descriptors_1.$yh(extensionsViews_1.$oUb, [{}]),
                when: contextkey_1.$Ii.and(contextkey_1.$Ii.has('searchMarketplaceExtensions')),
            });
            /*
             * View used for searching all installed extensions
             */
            viewDescriptors.push({
                id: 'workbench.views.extensions.searchInstalled',
                name: (0, nls_1.localize)(9, null),
                ctorDescriptor: new descriptors_1.$yh(extensionsViews_1.$_Tb, [{}]),
                when: contextkey_1.$Ii.and(contextkey_1.$Ii.has('searchInstalledExtensions')),
            });
            /*
             * View used for searching recently updated extensions
             */
            viewDescriptors.push({
                id: 'workbench.views.extensions.searchRecentlyUpdated',
                name: (0, nls_1.localize)(10, null),
                ctorDescriptor: new descriptors_1.$yh(extensionsViews_1.$fUb, [{}]),
                when: contextkey_1.$Ii.or(SearchExtensionUpdatesContext, contextkey_1.$Ii.has('searchRecentlyUpdatedExtensions')),
                order: 2,
            });
            /*
             * View used for searching enabled extensions
             */
            viewDescriptors.push({
                id: 'workbench.views.extensions.searchEnabled',
                name: (0, nls_1.localize)(11, null),
                ctorDescriptor: new descriptors_1.$yh(extensionsViews_1.$_Tb, [{}]),
                when: contextkey_1.$Ii.and(contextkey_1.$Ii.has('searchEnabledExtensions')),
            });
            /*
             * View used for searching disabled extensions
             */
            viewDescriptors.push({
                id: 'workbench.views.extensions.searchDisabled',
                name: (0, nls_1.localize)(12, null),
                ctorDescriptor: new descriptors_1.$yh(extensionsViews_1.$_Tb, [{}]),
                when: contextkey_1.$Ii.and(contextkey_1.$Ii.has('searchDisabledExtensions')),
            });
            /*
             * View used for searching outdated extensions
             */
            viewDescriptors.push({
                id: extensions_2.$Wfb,
                name: (0, nls_1.localize)(13, null),
                ctorDescriptor: new descriptors_1.$yh(extensionsViews_1.$eUb, [{}]),
                when: contextkey_1.$Ii.or(SearchExtensionUpdatesContext, contextkey_1.$Ii.has('searchOutdatedExtensions')),
                order: 1,
            });
            /*
             * View used for searching builtin extensions
             */
            viewDescriptors.push({
                id: 'workbench.views.extensions.searchBuiltin',
                name: (0, nls_1.localize)(14, null),
                ctorDescriptor: new descriptors_1.$yh(extensionsViews_1.$_Tb, [{}]),
                when: contextkey_1.$Ii.and(contextkey_1.$Ii.has('searchBuiltInExtensions')),
            });
            /*
             * View used for searching workspace unsupported extensions
             */
            viewDescriptors.push({
                id: 'workbench.views.extensions.searchWorkspaceUnsupported',
                name: (0, nls_1.localize)(15, null),
                ctorDescriptor: new descriptors_1.$yh(extensionsViews_1.$_Tb, [{}]),
                when: contextkey_1.$Ii.and(contextkey_1.$Ii.has('searchWorkspaceUnsupportedExtensions')),
            });
            return viewDescriptors;
        }
        i() {
            const viewDescriptors = [];
            viewDescriptors.push({
                id: extensions_2.$Vfb,
                name: (0, nls_1.localize)(16, null),
                ctorDescriptor: new descriptors_1.$yh(extensionsViews_1.$rUb, [{}]),
                when: contextkey_1.$Ii.and(contextkey_1.$Ii.has('recommendedExtensions'), contextkeys_1.$Pcb.notEqualsTo('empty')),
                order: 1
            });
            viewDescriptors.push({
                id: 'workbench.views.extensions.otherRecommendations',
                name: (0, nls_1.localize)(17, null),
                ctorDescriptor: new descriptors_1.$yh(extensionsViews_1.$qUb, [{}]),
                when: contextkey_1.$Ii.has('recommendedExtensions'),
                order: 2
            });
            return viewDescriptors;
        }
        j() {
            const viewDescriptors = [];
            viewDescriptors.push({
                id: 'workbench.views.extensions.builtinFeatureExtensions',
                name: (0, nls_1.localize)(18, null),
                ctorDescriptor: new descriptors_1.$yh(extensionsViews_1.$gUb, [{}]),
                when: contextkey_1.$Ii.has('builtInExtensions'),
            });
            viewDescriptors.push({
                id: 'workbench.views.extensions.builtinThemeExtensions',
                name: (0, nls_1.localize)(19, null),
                ctorDescriptor: new descriptors_1.$yh(extensionsViews_1.$hUb, [{}]),
                when: contextkey_1.$Ii.has('builtInExtensions'),
            });
            viewDescriptors.push({
                id: 'workbench.views.extensions.builtinProgrammingLanguageExtensions',
                name: (0, nls_1.localize)(20, null),
                ctorDescriptor: new descriptors_1.$yh(extensionsViews_1.$iUb, [{}]),
                when: contextkey_1.$Ii.has('builtInExtensions'),
            });
            return viewDescriptors;
        }
        k() {
            const viewDescriptors = [];
            viewDescriptors.push({
                id: 'workbench.views.extensions.untrustedUnsupportedExtensions',
                name: (0, nls_1.localize)(21, null),
                ctorDescriptor: new descriptors_1.$yh(extensionsViews_1.$jUb, [{}]),
                when: contextkey_1.$Ii.and(SearchUnsupportedWorkspaceExtensionsContext),
            });
            viewDescriptors.push({
                id: 'workbench.views.extensions.untrustedPartiallySupportedExtensions',
                name: (0, nls_1.localize)(22, null),
                ctorDescriptor: new descriptors_1.$yh(extensionsViews_1.$kUb, [{}]),
                when: contextkey_1.$Ii.and(SearchUnsupportedWorkspaceExtensionsContext),
            });
            viewDescriptors.push({
                id: 'workbench.views.extensions.virtualUnsupportedExtensions',
                name: (0, nls_1.localize)(23, null),
                ctorDescriptor: new descriptors_1.$yh(extensionsViews_1.$lUb, [{}]),
                when: contextkey_1.$Ii.and(contextkeys_1.$Wcb, SearchUnsupportedWorkspaceExtensionsContext),
            });
            viewDescriptors.push({
                id: 'workbench.views.extensions.virtualPartiallySupportedExtensions',
                name: (0, nls_1.localize)(24, null),
                ctorDescriptor: new descriptors_1.$yh(extensionsViews_1.$mUb, [{}]),
                when: contextkey_1.$Ii.and(contextkeys_1.$Wcb, SearchUnsupportedWorkspaceExtensionsContext),
            });
            return viewDescriptors;
        }
        l() {
            const viewDescriptors = [];
            viewDescriptors.push({
                id: 'workbench.views.extensions.deprecatedExtensions',
                name: (0, nls_1.localize)(25, null),
                ctorDescriptor: new descriptors_1.$yh(extensionsViews_1.$nUb, [{}]),
                when: contextkey_1.$Ii.and(SearchDeprecatedExtensionsContext),
            });
            return viewDescriptors;
        }
    };
    exports.$HUb = $HUb;
    exports.$HUb = $HUb = __decorate([
        __param(0, extensionManagement_2.$fcb),
        __param(1, label_1.$Vz),
        __param(2, views_1.$_E),
        __param(3, contextkey_1.$3i)
    ], $HUb);
    let $IUb = class $IUb extends viewPaneContainer_1.$Seb {
        constructor(layoutService, telemetryService, Tb, instantiationService, Ub, Vb, Wb, Xb, Yb, themeService, configurationService, storageService, contextService, Zb, contextMenuService, extensionService, viewDescriptorService, $b, ac) {
            super(extensions_2.$Ofb, { mergeViewWithContainerWhenSingleView: true }, instantiationService, configurationService, layoutService, contextMenuService, telemetryService, extensionService, themeService, storageService, contextService, viewDescriptorService);
            this.Tb = Tb;
            this.Ub = Ub;
            this.Vb = Vb;
            this.Wb = Wb;
            this.Xb = Xb;
            this.Yb = Yb;
            this.Zb = Zb;
            this.$b = $b;
            this.ac = ac;
            this.Pb = new async_1.$Dg(500);
            this.yb = exports.$BUb.bindTo(Zb);
            this.zb = exports.$CUb.bindTo(Zb);
            this.Ab = exports.$DUb.bindTo(Zb);
            this.Bb = exports.$EUb.bindTo(Zb);
            this.Cb = SortByUpdateDateContext.bindTo(Zb);
            this.Db = SearchInstalledExtensionsContext.bindTo(Zb);
            this.Eb = SearchRecentlyUpdatedExtensionsContext.bindTo(Zb);
            this.Fb = SearchExtensionUpdatesContext.bindTo(Zb);
            this.Mb = SearchUnsupportedWorkspaceExtensionsContext.bindTo(Zb);
            this.Nb = SearchDeprecatedExtensionsContext.bindTo(Zb);
            this.Gb = SearchOutdatedExtensionsContext.bindTo(Zb);
            this.Hb = SearchEnabledExtensionsContext.bindTo(Zb);
            this.Ib = SearchDisabledExtensionsContext.bindTo(Zb);
            this.Jb = HasInstalledExtensionsContext.bindTo(Zb);
            this.Kb = exports.$FUb.bindTo(Zb);
            this.Lb = SearchBuiltInExtensionsContext.bindTo(Zb);
            this.Ob = exports.$GUb.bindTo(Zb);
            this.B(this.Yb.onDidPaneCompositeOpen(e => { if (e.viewContainerLocation === 0 /* ViewContainerLocation.Sidebar */) {
                this.kc(e.composite);
            } }, this));
            this.B(Vb.onReset(() => this.refresh()));
            this.Sb = this.F(1 /* StorageScope.WORKSPACE */, 1 /* StorageTarget.MACHINE */);
        }
        get searchValue() {
            return this.Rb?.getValue();
        }
        create(parent) {
            parent.classList.add('extensions-viewlet');
            this.Qb = parent;
            const overlay = (0, dom_1.$0O)(this.Qb, (0, dom_1.$)('.overlay'));
            const overlayBackgroundColor = this.z(theme_1.$Mab) ?? '';
            overlay.style.backgroundColor = overlayBackgroundColor;
            (0, dom_1.$eP)(overlay);
            const header = (0, dom_1.$0O)(this.Qb, (0, dom_1.$)('.header'));
            const placeholder = (0, nls_1.localize)(26, null);
            const searchValue = this.Sb['query.value'] ? this.Sb['query.value'] : '';
            this.Rb = this.B(this.Z.createInstance(suggestEnabledInput_1.$VCb, `${extensions_2.$Ofb}.searchbox`, header, {
                triggerCharacters: ['@'],
                sortKey: (item) => {
                    if (item.indexOf(':') === -1) {
                        return 'a';
                    }
                    else if (/ext:/.test(item) || /id:/.test(item) || /tag:/.test(item)) {
                        return 'b';
                    }
                    else if (/sort:/.test(item)) {
                        return 'c';
                    }
                    else {
                        return 'd';
                    }
                },
                provideResults: (query) => extensionQuery_1.$$Tb.suggestions(query)
            }, placeholder, 'extensions:searchinput', { placeholderText: placeholder, value: searchValue }));
            this.bc();
            if (this.Rb.getValue()) {
                this.cc();
            }
            this.B(this.Rb.onInputDidChange(() => {
                this.zb.set(extensionQuery_1.$$Tb.parse(this.Rb.getValue() || '').sortBy);
                this.cc();
            }, this));
            this.B(this.Rb.onShouldFocusResults(() => this.jc(), this));
            // Register DragAndDrop support
            this.B(new dom_1.$zP(this.Qb, {
                onDragEnd: (e) => undefined,
                onDragEnter: (e) => {
                    if (this.nc(e)) {
                        (0, dom_1.$dP)(overlay);
                    }
                },
                onDragLeave: (e) => {
                    if (this.nc(e)) {
                        (0, dom_1.$eP)(overlay);
                    }
                },
                onDragOver: (e) => {
                    if (this.nc(e)) {
                        e.dataTransfer.dropEffect = 'copy';
                    }
                },
                onDrop: async (e) => {
                    if (this.nc(e)) {
                        (0, dom_1.$eP)(overlay);
                        const vsixs = (0, arrays_1.$Fb)((await this.Z.invokeFunction(accessor => (0, dnd_1.$76)(accessor, e)))
                            .map(editor => editor.resource && (0, resources_1.$gg)(editor.resource) === '.vsix' ? editor.resource : undefined));
                        if (vsixs.length > 0) {
                            try {
                                // Attempt to install the extension(s)
                                await this.ac.executeCommand(extensions_2.$Zfb, vsixs);
                            }
                            catch (err) {
                                this.Xb.error(err);
                            }
                        }
                    }
                }
            }));
            super.create((0, dom_1.$0O)(this.Qb, (0, dom_1.$)('.extensions')));
            const focusTracker = this.B((0, dom_1.$8O)(this.Qb));
            const isSearchBoxFocused = () => this.Rb?.inputWidget.hasWidgetFocus();
            this.B((0, widgetNavigationCommands_1.$Cmb)({
                focusNotifiers: [focusTracker],
                focusNextWidget: () => {
                    if (isSearchBoxFocused()) {
                        this.jc();
                    }
                },
                focusPreviousWidget: () => {
                    if (!isSearchBoxFocused()) {
                        this.Rb?.focus();
                    }
                }
            }));
        }
        focus() {
            this.Rb?.focus();
        }
        layout(dimension) {
            if (this.Qb) {
                this.Qb.classList.toggle('narrow', dimension.width <= 250);
                this.Qb.classList.toggle('mini', dimension.width <= 200);
            }
            this.Rb?.layout(new dom_1.$BO(dimension.width - 34 - /*padding*/ 8, 20));
            super.layout(new dom_1.$BO(dimension.width, dimension.height - 41));
        }
        getOptimalWidth() {
            return 400;
        }
        search(value) {
            if (this.Rb && this.Rb.getValue() !== value) {
                this.Rb.setValue(value);
            }
        }
        async refresh() {
            await this.bc();
            this.fc(true);
            if (this.ab.getValue(extensions_2.$Sfb)) {
                this.Vb.checkForUpdates();
            }
        }
        async bc() {
            const result = await this.Vb.queryLocal();
            this.Jb.set(result.some(r => !r.isBuiltin));
        }
        cc() {
            this.Pb.trigger(() => this.fc(), this.Rb && this.Rb.getValue() ? 500 : 0).then(undefined, err => this.mc(err));
        }
        dc() {
            return this.Rb
                ? this.Rb.getValue()
                    .trim()
                    .replace(/@category/g, 'category')
                    .replace(/@tag:/g, 'tag:')
                    .replace(/@ext:/g, 'ext:')
                    .replace(/@featured/g, 'featured')
                    .replace(/@popular/g, this.Wb.webExtensionManagementServer && !this.Wb.localExtensionManagementServer && !this.Wb.remoteExtensionManagementServer ? '@web' : '@popular')
                : '';
        }
        G() {
            const value = this.Rb ? this.Rb.getValue() : '';
            if (extensionsViews_1.$_Tb.isLocalExtensionsQuery(value)) {
                this.Sb['query.value'] = value;
            }
            else {
                this.Sb['query.value'] = '';
            }
            super.G();
        }
        fc(refresh) {
            const value = this.dc();
            this.Zb.bufferChangeEvents(() => {
                const isRecommendedExtensionsQuery = extensionsViews_1.$_Tb.isRecommendedExtensionsQuery(value);
                this.Bb.set(value.trim() !== '');
                this.Db.set(extensionsViews_1.$_Tb.isInstalledExtensionsQuery(value));
                this.Eb.set(extensionsViews_1.$_Tb.isSearchRecentlyUpdatedQuery(value) && !extensionsViews_1.$_Tb.isSearchExtensionUpdatesQuery(value));
                this.Gb.set(extensionsViews_1.$_Tb.isOutdatedExtensionsQuery(value) && !extensionsViews_1.$_Tb.isSearchExtensionUpdatesQuery(value));
                this.Fb.set(extensionsViews_1.$_Tb.isSearchExtensionUpdatesQuery(value));
                this.Hb.set(extensionsViews_1.$_Tb.isEnabledExtensionsQuery(value));
                this.Ib.set(extensionsViews_1.$_Tb.isDisabledExtensionsQuery(value));
                this.Lb.set(extensionsViews_1.$_Tb.isSearchBuiltInExtensionsQuery(value));
                this.Mb.set(extensionsViews_1.$_Tb.isSearchWorkspaceUnsupportedExtensionsQuery(value));
                this.Nb.set(extensionsViews_1.$_Tb.isSearchDeprecatedExtensionsQuery(value));
                this.Kb.set(extensionsViews_1.$_Tb.isBuiltInExtensionsQuery(value));
                this.Ob.set(isRecommendedExtensionsQuery);
                this.Ab.set(!!value && !extensionsViews_1.$_Tb.isLocalExtensionsQuery(value) && !isRecommendedExtensionsQuery);
                this.Cb.set(extensionsViews_1.$_Tb.isSortUpdateDateQuery(value));
                this.yb.set(!value || extensionsViews_1.$_Tb.isSortInstalledExtensionsQuery(value));
            });
            return this.lc(Promise.all(this.panes.map(view => view.show(this.dc(), refresh)
                .then(model => this.hc(model.length, view.id))))).then(() => undefined);
        }
        rb(added) {
            const addedViews = super.rb(added);
            this.lc(Promise.all(addedViews.map(addedView => addedView.show(this.dc())
                .then(model => this.hc(model.length, addedView.id)))));
            return addedViews;
        }
        hc(count, viewId) {
            const view = this.M.visibleViewDescriptors.find(view => view.id === viewId);
            switch (count) {
                case 0:
                    break;
                case 1:
                    if (view) {
                        (0, aria_1.$$P)((0, nls_1.localize)(27, null, view.name));
                    }
                    else {
                        (0, aria_1.$$P)((0, nls_1.localize)(28, null));
                    }
                    break;
                default:
                    if (view) {
                        (0, aria_1.$$P)((0, nls_1.localize)(29, null, count, view.name));
                    }
                    else {
                        (0, aria_1.$$P)((0, nls_1.localize)(30, null, count));
                    }
                    break;
            }
        }
        ic() {
            for (const pane of this.panes) {
                if (pane.isExpanded() && pane instanceof extensionsViews_1.$_Tb) {
                    return pane;
                }
            }
            return undefined;
        }
        jc() {
            const pane = this.ic();
            if (pane && pane.count() > 0) {
                pane.focus();
            }
        }
        kc(viewlet) {
            if (!viewlet || viewlet.getId() === extensions_2.$Ofb) {
                return;
            }
            if (this.ab.getValue(extensions_2.$Tfb)) {
                const promises = this.Ub.groups.map(group => {
                    const editors = group.editors.filter(input => input instanceof extensionsInput_1.$Nfb);
                    return group.closeEditors(editors);
                });
                Promise.all(promises);
            }
        }
        lc(promise) {
            return this.Tb.withProgress({ location: 5 /* ProgressLocation.Extensions */ }, () => promise);
        }
        mc(err) {
            if ((0, errors_1.$2)(err)) {
                return;
            }
            const message = err && err.message || '';
            if (/ECONNREFUSED/.test(message)) {
                const error = (0, errorMessage_1.$oi)((0, nls_1.localize)(31, null), [
                    new actions_1.$gi('open user settings', (0, nls_1.localize)(32, null), undefined, true, () => this.$b.openUserSettings())
                ]);
                this.Xb.error(error);
                return;
            }
            this.Xb.error(err);
        }
        nc(e) {
            if (e.dataTransfer) {
                const typesLowerCase = e.dataTransfer.types.map(t => t.toLocaleLowerCase());
                return typesLowerCase.indexOf('files') !== -1;
            }
            return false;
        }
    };
    exports.$IUb = $IUb;
    exports.$IUb = $IUb = __decorate([
        __param(0, layoutService_1.$Meb),
        __param(1, telemetry_1.$9k),
        __param(2, progress_1.$2u),
        __param(3, instantiation_1.$Ah),
        __param(4, editorGroupsService_1.$5C),
        __param(5, extensions_2.$Pfb),
        __param(6, extensionManagement_2.$fcb),
        __param(7, notification_1.$Yu),
        __param(8, panecomposite_1.$Yeb),
        __param(9, themeService_1.$gv),
        __param(10, configuration_1.$8h),
        __param(11, storage_1.$Vo),
        __param(12, workspace_1.$Kh),
        __param(13, contextkey_1.$3i),
        __param(14, contextView_1.$WZ),
        __param(15, extensions_1.$MF),
        __param(16, views_1.$_E),
        __param(17, preferences_1.$BE),
        __param(18, commands_1.$Fr)
    ], $IUb);
    let $JUb = class $JUb extends lifecycle_1.$kc {
        constructor(b, c, f) {
            super();
            this.b = b;
            this.c = c;
            this.f = f;
            this.a = this.B(new lifecycle_1.$lc());
            this.g();
            this.B(event_1.Event.debounce(c.onChange, () => undefined, 100, undefined, undefined, undefined, this.q)(this.g, this));
        }
        g() {
            this.a.clear();
            const extensionsReloadRequired = this.c.installed.filter(e => e.reloadRequiredStatus !== undefined);
            const outdated = this.c.outdated.reduce((r, e) => r + (this.f.isEnabled(e.local) && !e.pinned && !extensionsReloadRequired.includes(e) ? 1 : 0), 0);
            const newBadgeNumber = outdated + extensionsReloadRequired.length;
            if (newBadgeNumber > 0) {
                let msg = '';
                if (outdated) {
                    msg += outdated === 1 ? (0, nls_1.localize)(33, null, outdated) : (0, nls_1.localize)(34, null, outdated);
                }
                if (outdated > 0 && extensionsReloadRequired.length > 0) {
                    msg += ', ';
                }
                if (extensionsReloadRequired.length) {
                    msg += extensionsReloadRequired.length === 1 ? (0, nls_1.localize)(35, null, extensionsReloadRequired.length) : (0, nls_1.localize)(36, null, extensionsReloadRequired.length);
                }
                const badge = new activity_1.$IV(newBadgeNumber, () => msg);
                this.a.value = this.b.showViewContainerActivity(extensions_2.$Ofb, { badge, clazz: 'extensions-badge count-badge' });
            }
        }
    };
    exports.$JUb = $JUb;
    exports.$JUb = $JUb = __decorate([
        __param(0, activity_1.$HV),
        __param(1, extensions_2.$Pfb),
        __param(2, extensionManagement_2.$icb)
    ], $JUb);
    let $KUb = class $KUb {
        constructor(a, b, c, d, f) {
            this.a = a;
            this.b = b;
            this.c = c;
            this.d = d;
            this.f = f;
            if (!this.f.disableExtensions) {
                this.g();
            }
        }
        g() {
            this.h()
                .then(() => (0, async_1.$Hg)(1000 * 60 * 5)) // every five minutes
                .then(() => this.g());
        }
        h() {
            return this.a.getExtensionsControlManifest().then(extensionsControlManifest => {
                return this.a.getInstalled(1 /* ExtensionType.User */).then(installed => {
                    const maliciousExtensions = installed
                        .filter(e => extensionsControlManifest.malicious.some(identifier => (0, extensionManagementUtil_1.$po)(e.identifier, identifier)));
                    if (maliciousExtensions.length) {
                        return async_1.Promises.settled(maliciousExtensions.map(e => this.a.uninstall(e).then(() => {
                            this.d.prompt(severity_1.default.Warning, (0, nls_1.localize)(37, null, e.identifier.id), [{
                                    label: (0, nls_1.localize)(38, null),
                                    run: () => this.b.reload()
                                }], {
                                sticky: true,
                                priority: notification_1.NotificationPriority.URGENT
                            });
                        })));
                    }
                    else {
                        return Promise.resolve(undefined);
                    }
                }).then(() => undefined);
            }, err => this.c.error(err));
        }
    };
    exports.$KUb = $KUb;
    exports.$KUb = $KUb = __decorate([
        __param(0, extensionManagement_1.$2n),
        __param(1, host_1.$VT),
        __param(2, log_1.$5i),
        __param(3, notification_1.$Yu),
        __param(4, environmentService_1.$hJ)
    ], $KUb);
});
//# sourceMappingURL=extensionsViewlet.js.map