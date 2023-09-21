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
define(["require", "exports", "vs/nls", "vs/base/common/async", "vs/base/common/errors", "vs/base/common/errorMessage", "vs/base/common/lifecycle", "vs/base/common/event", "vs/base/common/actions", "vs/base/browser/dom", "vs/platform/telemetry/common/telemetry", "vs/platform/instantiation/common/instantiation", "vs/workbench/services/extensions/common/extensions", "../common/extensions", "vs/workbench/contrib/extensions/browser/extensionsActions", "vs/platform/extensionManagement/common/extensionManagement", "vs/workbench/services/extensionManagement/common/extensionManagement", "vs/workbench/contrib/extensions/common/extensionsInput", "vs/workbench/contrib/extensions/browser/extensionsViews", "vs/platform/progress/common/progress", "vs/workbench/services/editor/common/editorGroupsService", "vs/base/common/severity", "vs/workbench/services/activity/common/activity", "vs/platform/theme/common/themeService", "vs/platform/configuration/common/configuration", "vs/workbench/common/views", "vs/platform/storage/common/storage", "vs/platform/workspace/common/workspace", "vs/platform/contextkey/common/contextkey", "vs/platform/contextview/browser/contextView", "vs/platform/log/common/log", "vs/platform/notification/common/notification", "vs/workbench/services/host/browser/host", "vs/workbench/services/layout/browser/layoutService", "vs/workbench/browser/parts/views/viewPaneContainer", "vs/workbench/contrib/extensions/common/extensionQuery", "vs/workbench/contrib/codeEditor/browser/suggestEnabledInput/suggestEnabledInput", "vs/base/browser/ui/aria/aria", "vs/platform/registry/common/platform", "vs/platform/label/common/label", "vs/platform/instantiation/common/descriptors", "vs/workbench/services/preferences/common/preferences", "vs/workbench/common/theme", "vs/workbench/services/environment/common/environmentService", "vs/workbench/common/contextkeys", "vs/platform/commands/common/commands", "vs/workbench/contrib/extensions/browser/extensionsIcons", "vs/platform/actions/common/actions", "vs/workbench/services/panecomposite/browser/panecomposite", "vs/base/common/arrays", "vs/platform/dnd/browser/dnd", "vs/base/common/resources", "vs/platform/extensionManagement/common/extensionManagementUtil", "vs/workbench/browser/actions/widgetNavigationCommands", "vs/css!./media/extensionsViewlet"], function (require, exports, nls_1, async_1, errors_1, errorMessage_1, lifecycle_1, event_1, actions_1, dom_1, telemetry_1, instantiation_1, extensions_1, extensions_2, extensionsActions_1, extensionManagement_1, extensionManagement_2, extensionsInput_1, extensionsViews_1, progress_1, editorGroupsService_1, severity_1, activity_1, themeService_1, configuration_1, views_1, storage_1, workspace_1, contextkey_1, contextView_1, log_1, notification_1, host_1, layoutService_1, viewPaneContainer_1, extensionQuery_1, suggestEnabledInput_1, aria_1, platform_1, label_1, descriptors_1, preferences_1, theme_1, environmentService_1, contextkeys_1, commands_1, extensionsIcons_1, actions_2, panecomposite_1, arrays_1, dnd_1, resources_1, extensionManagementUtil_1, widgetNavigationCommands_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MaliciousExtensionChecker = exports.StatusUpdater = exports.ExtensionsViewPaneContainer = exports.ExtensionsViewletViewsContribution = exports.RecommendedExtensionsContext = exports.BuiltInExtensionsContext = exports.SearchHasTextContext = exports.SearchMarketplaceExtensionsContext = exports.ExtensionsSortByContext = exports.DefaultViewsContext = void 0;
    exports.DefaultViewsContext = new contextkey_1.RawContextKey('defaultExtensionViews', true);
    exports.ExtensionsSortByContext = new contextkey_1.RawContextKey('extensionsSortByValue', '');
    exports.SearchMarketplaceExtensionsContext = new contextkey_1.RawContextKey('searchMarketplaceExtensions', false);
    exports.SearchHasTextContext = new contextkey_1.RawContextKey('extensionSearchHasText', false);
    const SearchInstalledExtensionsContext = new contextkey_1.RawContextKey('searchInstalledExtensions', false);
    const SearchRecentlyUpdatedExtensionsContext = new contextkey_1.RawContextKey('searchRecentlyUpdatedExtensions', false);
    const SearchExtensionUpdatesContext = new contextkey_1.RawContextKey('searchExtensionUpdates', false);
    const SearchOutdatedExtensionsContext = new contextkey_1.RawContextKey('searchOutdatedExtensions', false);
    const SearchEnabledExtensionsContext = new contextkey_1.RawContextKey('searchEnabledExtensions', false);
    const SearchDisabledExtensionsContext = new contextkey_1.RawContextKey('searchDisabledExtensions', false);
    const HasInstalledExtensionsContext = new contextkey_1.RawContextKey('hasInstalledExtensions', true);
    exports.BuiltInExtensionsContext = new contextkey_1.RawContextKey('builtInExtensions', false);
    const SearchBuiltInExtensionsContext = new contextkey_1.RawContextKey('searchBuiltInExtensions', false);
    const SearchUnsupportedWorkspaceExtensionsContext = new contextkey_1.RawContextKey('searchUnsupportedWorkspaceExtensions', false);
    const SearchDeprecatedExtensionsContext = new contextkey_1.RawContextKey('searchDeprecatedExtensions', false);
    exports.RecommendedExtensionsContext = new contextkey_1.RawContextKey('recommendedExtensions', false);
    const SortByUpdateDateContext = new contextkey_1.RawContextKey('sortByUpdateDate', false);
    const REMOTE_CATEGORY = { value: (0, nls_1.localize)({ key: 'remote', comment: ['Remote as in remote machine'] }, "Remote"), original: 'Remote' };
    let ExtensionsViewletViewsContribution = class ExtensionsViewletViewsContribution {
        constructor(extensionManagementServerService, labelService, viewDescriptorService, contextKeyService) {
            this.extensionManagementServerService = extensionManagementServerService;
            this.labelService = labelService;
            this.contextKeyService = contextKeyService;
            this.container = viewDescriptorService.getViewContainerById(extensions_2.VIEWLET_ID);
            this.registerViews();
        }
        registerViews() {
            const viewDescriptors = [];
            /* Default views */
            viewDescriptors.push(...this.createDefaultExtensionsViewDescriptors());
            /* Search views */
            viewDescriptors.push(...this.createSearchExtensionsViewDescriptors());
            /* Recommendations views */
            viewDescriptors.push(...this.createRecommendedExtensionsViewDescriptors());
            /* Built-in extensions views */
            viewDescriptors.push(...this.createBuiltinExtensionsViewDescriptors());
            /* Trust Required extensions views */
            viewDescriptors.push(...this.createUnsupportedWorkspaceExtensionsViewDescriptors());
            /* Other Local Filtered extensions views */
            viewDescriptors.push(...this.createOtherLocalFilteredExtensionsViewDescriptors());
            platform_1.Registry.as(views_1.Extensions.ViewsRegistry).registerViews(viewDescriptors, this.container);
        }
        createDefaultExtensionsViewDescriptors() {
            const viewDescriptors = [];
            /*
             * Default installed extensions views - Shows all user installed extensions.
             */
            const servers = [];
            if (this.extensionManagementServerService.localExtensionManagementServer) {
                servers.push(this.extensionManagementServerService.localExtensionManagementServer);
            }
            if (this.extensionManagementServerService.remoteExtensionManagementServer) {
                servers.push(this.extensionManagementServerService.remoteExtensionManagementServer);
            }
            if (this.extensionManagementServerService.webExtensionManagementServer) {
                servers.push(this.extensionManagementServerService.webExtensionManagementServer);
            }
            const getViewName = (viewTitle, server) => {
                return servers.length > 1 ? `${server.label} - ${viewTitle}` : viewTitle;
            };
            let installedWebExtensionsContextChangeEvent = event_1.Event.None;
            if (this.extensionManagementServerService.webExtensionManagementServer && this.extensionManagementServerService.remoteExtensionManagementServer) {
                const interestingContextKeys = new Set();
                interestingContextKeys.add('hasInstalledWebExtensions');
                installedWebExtensionsContextChangeEvent = event_1.Event.filter(this.contextKeyService.onDidChangeContext, e => e.affectsSome(interestingContextKeys));
            }
            const serverLabelChangeEvent = event_1.Event.any(this.labelService.onDidChangeFormatters, installedWebExtensionsContextChangeEvent);
            for (const server of servers) {
                const getInstalledViewName = () => getViewName((0, nls_1.localize)('installed', "Installed"), server);
                const onDidChangeTitle = event_1.Event.map(serverLabelChangeEvent, () => getInstalledViewName());
                const id = servers.length > 1 ? `workbench.views.extensions.${server.id}.installed` : `workbench.views.extensions.installed`;
                /* Installed extensions view */
                viewDescriptors.push({
                    id,
                    get name() { return getInstalledViewName(); },
                    weight: 100,
                    order: 1,
                    when: contextkey_1.ContextKeyExpr.and(exports.DefaultViewsContext),
                    ctorDescriptor: new descriptors_1.SyncDescriptor(extensionsViews_1.ServerInstalledExtensionsView, [{ server, flexibleHeight: true, onDidChangeTitle }]),
                    /* Installed extensions views shall not be allowed to hidden when there are more than one server */
                    canToggleVisibility: servers.length === 1
                });
                if (server === this.extensionManagementServerService.remoteExtensionManagementServer && this.extensionManagementServerService.localExtensionManagementServer) {
                    (0, actions_2.registerAction2)(class InstallLocalExtensionsInRemoteAction2 extends actions_2.Action2 {
                        constructor() {
                            super({
                                id: 'workbench.extensions.installLocalExtensions',
                                get title() {
                                    return {
                                        value: (0, nls_1.localize)('select and install local extensions', "Install Local Extensions in '{0}'...", server.label),
                                        original: `Install Local Extensions in '${server.label}'...`,
                                    };
                                },
                                category: REMOTE_CATEGORY,
                                icon: extensionsIcons_1.installLocalInRemoteIcon,
                                f1: true,
                                menu: {
                                    id: actions_2.MenuId.ViewTitle,
                                    when: contextkey_1.ContextKeyExpr.equals('view', id),
                                    group: 'navigation',
                                }
                            });
                        }
                        run(accessor) {
                            return accessor.get(instantiation_1.IInstantiationService).createInstance(extensionsActions_1.InstallLocalExtensionsInRemoteAction).run();
                        }
                    });
                }
            }
            if (this.extensionManagementServerService.localExtensionManagementServer && this.extensionManagementServerService.remoteExtensionManagementServer) {
                (0, actions_2.registerAction2)(class InstallRemoteExtensionsInLocalAction2 extends actions_2.Action2 {
                    constructor() {
                        super({
                            id: 'workbench.extensions.actions.installLocalExtensionsInRemote',
                            title: { value: (0, nls_1.localize)('install remote in local', "Install Remote Extensions Locally..."), original: 'Install Remote Extensions Locally...' },
                            category: REMOTE_CATEGORY,
                            f1: true
                        });
                    }
                    run(accessor) {
                        return accessor.get(instantiation_1.IInstantiationService).createInstance(extensionsActions_1.InstallRemoteExtensionsInLocalAction, 'workbench.extensions.actions.installLocalExtensionsInRemote').run();
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
                name: (0, nls_1.localize)('popularExtensions', "Popular"),
                ctorDescriptor: new descriptors_1.SyncDescriptor(extensionsViews_1.DefaultPopularExtensionsView, [{ hideBadge: true }]),
                when: contextkey_1.ContextKeyExpr.and(exports.DefaultViewsContext, contextkey_1.ContextKeyExpr.not('hasInstalledExtensions'), extensions_2.CONTEXT_HAS_GALLERY),
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
                name: (0, nls_1.localize)('recommendedExtensions', "Recommended"),
                ctorDescriptor: new descriptors_1.SyncDescriptor(extensionsViews_1.DefaultRecommendedExtensionsView, [{ flexibleHeight: true }]),
                when: contextkey_1.ContextKeyExpr.and(exports.DefaultViewsContext, SortByUpdateDateContext.negate(), contextkey_1.ContextKeyExpr.not('config.extensions.showRecommendationsOnlyOnDemand'), extensions_2.CONTEXT_HAS_GALLERY),
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
                    name: (0, nls_1.localize)('enabledExtensions', "Enabled"),
                    ctorDescriptor: new descriptors_1.SyncDescriptor(extensionsViews_1.EnabledExtensionsView, [{}]),
                    when: contextkey_1.ContextKeyExpr.and(exports.DefaultViewsContext, contextkey_1.ContextKeyExpr.has('hasInstalledExtensions')),
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
                    name: (0, nls_1.localize)('disabledExtensions', "Disabled"),
                    ctorDescriptor: new descriptors_1.SyncDescriptor(extensionsViews_1.DisabledExtensionsView, [{}]),
                    when: contextkey_1.ContextKeyExpr.and(exports.DefaultViewsContext, contextkey_1.ContextKeyExpr.has('hasInstalledExtensions')),
                    hideByDefault: true,
                    weight: 10,
                    order: 5,
                    canToggleVisibility: true
                });
            }
            return viewDescriptors;
        }
        createSearchExtensionsViewDescriptors() {
            const viewDescriptors = [];
            /*
             * View used for searching Marketplace
             */
            viewDescriptors.push({
                id: 'workbench.views.extensions.marketplace',
                name: (0, nls_1.localize)('marketPlace', "Marketplace"),
                ctorDescriptor: new descriptors_1.SyncDescriptor(extensionsViews_1.SearchMarketplaceExtensionsView, [{}]),
                when: contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.has('searchMarketplaceExtensions')),
            });
            /*
             * View used for searching all installed extensions
             */
            viewDescriptors.push({
                id: 'workbench.views.extensions.searchInstalled',
                name: (0, nls_1.localize)('installed', "Installed"),
                ctorDescriptor: new descriptors_1.SyncDescriptor(extensionsViews_1.ExtensionsListView, [{}]),
                when: contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.has('searchInstalledExtensions')),
            });
            /*
             * View used for searching recently updated extensions
             */
            viewDescriptors.push({
                id: 'workbench.views.extensions.searchRecentlyUpdated',
                name: (0, nls_1.localize)('recently updated', "Recently Updated"),
                ctorDescriptor: new descriptors_1.SyncDescriptor(extensionsViews_1.RecentlyUpdatedExtensionsView, [{}]),
                when: contextkey_1.ContextKeyExpr.or(SearchExtensionUpdatesContext, contextkey_1.ContextKeyExpr.has('searchRecentlyUpdatedExtensions')),
                order: 2,
            });
            /*
             * View used for searching enabled extensions
             */
            viewDescriptors.push({
                id: 'workbench.views.extensions.searchEnabled',
                name: (0, nls_1.localize)('enabled', "Enabled"),
                ctorDescriptor: new descriptors_1.SyncDescriptor(extensionsViews_1.ExtensionsListView, [{}]),
                when: contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.has('searchEnabledExtensions')),
            });
            /*
             * View used for searching disabled extensions
             */
            viewDescriptors.push({
                id: 'workbench.views.extensions.searchDisabled',
                name: (0, nls_1.localize)('disabled', "Disabled"),
                ctorDescriptor: new descriptors_1.SyncDescriptor(extensionsViews_1.ExtensionsListView, [{}]),
                when: contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.has('searchDisabledExtensions')),
            });
            /*
             * View used for searching outdated extensions
             */
            viewDescriptors.push({
                id: extensions_2.OUTDATED_EXTENSIONS_VIEW_ID,
                name: (0, nls_1.localize)('availableUpdates', "Available Updates"),
                ctorDescriptor: new descriptors_1.SyncDescriptor(extensionsViews_1.OutdatedExtensionsView, [{}]),
                when: contextkey_1.ContextKeyExpr.or(SearchExtensionUpdatesContext, contextkey_1.ContextKeyExpr.has('searchOutdatedExtensions')),
                order: 1,
            });
            /*
             * View used for searching builtin extensions
             */
            viewDescriptors.push({
                id: 'workbench.views.extensions.searchBuiltin',
                name: (0, nls_1.localize)('builtin', "Builtin"),
                ctorDescriptor: new descriptors_1.SyncDescriptor(extensionsViews_1.ExtensionsListView, [{}]),
                when: contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.has('searchBuiltInExtensions')),
            });
            /*
             * View used for searching workspace unsupported extensions
             */
            viewDescriptors.push({
                id: 'workbench.views.extensions.searchWorkspaceUnsupported',
                name: (0, nls_1.localize)('workspaceUnsupported', "Workspace Unsupported"),
                ctorDescriptor: new descriptors_1.SyncDescriptor(extensionsViews_1.ExtensionsListView, [{}]),
                when: contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.has('searchWorkspaceUnsupportedExtensions')),
            });
            return viewDescriptors;
        }
        createRecommendedExtensionsViewDescriptors() {
            const viewDescriptors = [];
            viewDescriptors.push({
                id: extensions_2.WORKSPACE_RECOMMENDATIONS_VIEW_ID,
                name: (0, nls_1.localize)('workspaceRecommendedExtensions', "Workspace Recommendations"),
                ctorDescriptor: new descriptors_1.SyncDescriptor(extensionsViews_1.WorkspaceRecommendedExtensionsView, [{}]),
                when: contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.has('recommendedExtensions'), contextkeys_1.WorkbenchStateContext.notEqualsTo('empty')),
                order: 1
            });
            viewDescriptors.push({
                id: 'workbench.views.extensions.otherRecommendations',
                name: (0, nls_1.localize)('otherRecommendedExtensions', "Other Recommendations"),
                ctorDescriptor: new descriptors_1.SyncDescriptor(extensionsViews_1.RecommendedExtensionsView, [{}]),
                when: contextkey_1.ContextKeyExpr.has('recommendedExtensions'),
                order: 2
            });
            return viewDescriptors;
        }
        createBuiltinExtensionsViewDescriptors() {
            const viewDescriptors = [];
            viewDescriptors.push({
                id: 'workbench.views.extensions.builtinFeatureExtensions',
                name: (0, nls_1.localize)('builtinFeatureExtensions', "Features"),
                ctorDescriptor: new descriptors_1.SyncDescriptor(extensionsViews_1.BuiltInFeatureExtensionsView, [{}]),
                when: contextkey_1.ContextKeyExpr.has('builtInExtensions'),
            });
            viewDescriptors.push({
                id: 'workbench.views.extensions.builtinThemeExtensions',
                name: (0, nls_1.localize)('builtInThemesExtensions', "Themes"),
                ctorDescriptor: new descriptors_1.SyncDescriptor(extensionsViews_1.BuiltInThemesExtensionsView, [{}]),
                when: contextkey_1.ContextKeyExpr.has('builtInExtensions'),
            });
            viewDescriptors.push({
                id: 'workbench.views.extensions.builtinProgrammingLanguageExtensions',
                name: (0, nls_1.localize)('builtinProgrammingLanguageExtensions', "Programming Languages"),
                ctorDescriptor: new descriptors_1.SyncDescriptor(extensionsViews_1.BuiltInProgrammingLanguageExtensionsView, [{}]),
                when: contextkey_1.ContextKeyExpr.has('builtInExtensions'),
            });
            return viewDescriptors;
        }
        createUnsupportedWorkspaceExtensionsViewDescriptors() {
            const viewDescriptors = [];
            viewDescriptors.push({
                id: 'workbench.views.extensions.untrustedUnsupportedExtensions',
                name: (0, nls_1.localize)('untrustedUnsupportedExtensions', "Disabled in Restricted Mode"),
                ctorDescriptor: new descriptors_1.SyncDescriptor(extensionsViews_1.UntrustedWorkspaceUnsupportedExtensionsView, [{}]),
                when: contextkey_1.ContextKeyExpr.and(SearchUnsupportedWorkspaceExtensionsContext),
            });
            viewDescriptors.push({
                id: 'workbench.views.extensions.untrustedPartiallySupportedExtensions',
                name: (0, nls_1.localize)('untrustedPartiallySupportedExtensions', "Limited in Restricted Mode"),
                ctorDescriptor: new descriptors_1.SyncDescriptor(extensionsViews_1.UntrustedWorkspacePartiallySupportedExtensionsView, [{}]),
                when: contextkey_1.ContextKeyExpr.and(SearchUnsupportedWorkspaceExtensionsContext),
            });
            viewDescriptors.push({
                id: 'workbench.views.extensions.virtualUnsupportedExtensions',
                name: (0, nls_1.localize)('virtualUnsupportedExtensions', "Disabled in Virtual Workspaces"),
                ctorDescriptor: new descriptors_1.SyncDescriptor(extensionsViews_1.VirtualWorkspaceUnsupportedExtensionsView, [{}]),
                when: contextkey_1.ContextKeyExpr.and(contextkeys_1.VirtualWorkspaceContext, SearchUnsupportedWorkspaceExtensionsContext),
            });
            viewDescriptors.push({
                id: 'workbench.views.extensions.virtualPartiallySupportedExtensions',
                name: (0, nls_1.localize)('virtualPartiallySupportedExtensions', "Limited in Virtual Workspaces"),
                ctorDescriptor: new descriptors_1.SyncDescriptor(extensionsViews_1.VirtualWorkspacePartiallySupportedExtensionsView, [{}]),
                when: contextkey_1.ContextKeyExpr.and(contextkeys_1.VirtualWorkspaceContext, SearchUnsupportedWorkspaceExtensionsContext),
            });
            return viewDescriptors;
        }
        createOtherLocalFilteredExtensionsViewDescriptors() {
            const viewDescriptors = [];
            viewDescriptors.push({
                id: 'workbench.views.extensions.deprecatedExtensions',
                name: (0, nls_1.localize)('deprecated', "Deprecated"),
                ctorDescriptor: new descriptors_1.SyncDescriptor(extensionsViews_1.DeprecatedExtensionsView, [{}]),
                when: contextkey_1.ContextKeyExpr.and(SearchDeprecatedExtensionsContext),
            });
            return viewDescriptors;
        }
    };
    exports.ExtensionsViewletViewsContribution = ExtensionsViewletViewsContribution;
    exports.ExtensionsViewletViewsContribution = ExtensionsViewletViewsContribution = __decorate([
        __param(0, extensionManagement_2.IExtensionManagementServerService),
        __param(1, label_1.ILabelService),
        __param(2, views_1.IViewDescriptorService),
        __param(3, contextkey_1.IContextKeyService)
    ], ExtensionsViewletViewsContribution);
    let ExtensionsViewPaneContainer = class ExtensionsViewPaneContainer extends viewPaneContainer_1.ViewPaneContainer {
        constructor(layoutService, telemetryService, progressService, instantiationService, editorGroupService, extensionsWorkbenchService, extensionManagementServerService, notificationService, paneCompositeService, themeService, configurationService, storageService, contextService, contextKeyService, contextMenuService, extensionService, viewDescriptorService, preferencesService, commandService) {
            super(extensions_2.VIEWLET_ID, { mergeViewWithContainerWhenSingleView: true }, instantiationService, configurationService, layoutService, contextMenuService, telemetryService, extensionService, themeService, storageService, contextService, viewDescriptorService);
            this.progressService = progressService;
            this.editorGroupService = editorGroupService;
            this.extensionsWorkbenchService = extensionsWorkbenchService;
            this.extensionManagementServerService = extensionManagementServerService;
            this.notificationService = notificationService;
            this.paneCompositeService = paneCompositeService;
            this.contextKeyService = contextKeyService;
            this.preferencesService = preferencesService;
            this.commandService = commandService;
            this.searchDelayer = new async_1.Delayer(500);
            this.defaultViewsContextKey = exports.DefaultViewsContext.bindTo(contextKeyService);
            this.sortByContextKey = exports.ExtensionsSortByContext.bindTo(contextKeyService);
            this.searchMarketplaceExtensionsContextKey = exports.SearchMarketplaceExtensionsContext.bindTo(contextKeyService);
            this.searchHasTextContextKey = exports.SearchHasTextContext.bindTo(contextKeyService);
            this.sortByUpdateDateContextKey = SortByUpdateDateContext.bindTo(contextKeyService);
            this.searchInstalledExtensionsContextKey = SearchInstalledExtensionsContext.bindTo(contextKeyService);
            this.searchRecentlyUpdatedExtensionsContextKey = SearchRecentlyUpdatedExtensionsContext.bindTo(contextKeyService);
            this.searchExtensionUpdatesContextKey = SearchExtensionUpdatesContext.bindTo(contextKeyService);
            this.searchWorkspaceUnsupportedExtensionsContextKey = SearchUnsupportedWorkspaceExtensionsContext.bindTo(contextKeyService);
            this.searchDeprecatedExtensionsContextKey = SearchDeprecatedExtensionsContext.bindTo(contextKeyService);
            this.searchOutdatedExtensionsContextKey = SearchOutdatedExtensionsContext.bindTo(contextKeyService);
            this.searchEnabledExtensionsContextKey = SearchEnabledExtensionsContext.bindTo(contextKeyService);
            this.searchDisabledExtensionsContextKey = SearchDisabledExtensionsContext.bindTo(contextKeyService);
            this.hasInstalledExtensionsContextKey = HasInstalledExtensionsContext.bindTo(contextKeyService);
            this.builtInExtensionsContextKey = exports.BuiltInExtensionsContext.bindTo(contextKeyService);
            this.searchBuiltInExtensionsContextKey = SearchBuiltInExtensionsContext.bindTo(contextKeyService);
            this.recommendedExtensionsContextKey = exports.RecommendedExtensionsContext.bindTo(contextKeyService);
            this._register(this.paneCompositeService.onDidPaneCompositeOpen(e => { if (e.viewContainerLocation === 0 /* ViewContainerLocation.Sidebar */) {
                this.onViewletOpen(e.composite);
            } }, this));
            this._register(extensionsWorkbenchService.onReset(() => this.refresh()));
            this.searchViewletState = this.getMemento(1 /* StorageScope.WORKSPACE */, 1 /* StorageTarget.MACHINE */);
        }
        get searchValue() {
            return this.searchBox?.getValue();
        }
        create(parent) {
            parent.classList.add('extensions-viewlet');
            this.root = parent;
            const overlay = (0, dom_1.append)(this.root, (0, dom_1.$)('.overlay'));
            const overlayBackgroundColor = this.getColor(theme_1.SIDE_BAR_DRAG_AND_DROP_BACKGROUND) ?? '';
            overlay.style.backgroundColor = overlayBackgroundColor;
            (0, dom_1.hide)(overlay);
            const header = (0, dom_1.append)(this.root, (0, dom_1.$)('.header'));
            const placeholder = (0, nls_1.localize)('searchExtensions', "Search Extensions in Marketplace");
            const searchValue = this.searchViewletState['query.value'] ? this.searchViewletState['query.value'] : '';
            this.searchBox = this._register(this.instantiationService.createInstance(suggestEnabledInput_1.SuggestEnabledInput, `${extensions_2.VIEWLET_ID}.searchbox`, header, {
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
                provideResults: (query) => extensionQuery_1.Query.suggestions(query)
            }, placeholder, 'extensions:searchinput', { placeholderText: placeholder, value: searchValue }));
            this.updateInstalledExtensionsContexts();
            if (this.searchBox.getValue()) {
                this.triggerSearch();
            }
            this._register(this.searchBox.onInputDidChange(() => {
                this.sortByContextKey.set(extensionQuery_1.Query.parse(this.searchBox.getValue() || '').sortBy);
                this.triggerSearch();
            }, this));
            this._register(this.searchBox.onShouldFocusResults(() => this.focusListView(), this));
            // Register DragAndDrop support
            this._register(new dom_1.DragAndDropObserver(this.root, {
                onDragEnd: (e) => undefined,
                onDragEnter: (e) => {
                    if (this.isSupportedDragElement(e)) {
                        (0, dom_1.show)(overlay);
                    }
                },
                onDragLeave: (e) => {
                    if (this.isSupportedDragElement(e)) {
                        (0, dom_1.hide)(overlay);
                    }
                },
                onDragOver: (e) => {
                    if (this.isSupportedDragElement(e)) {
                        e.dataTransfer.dropEffect = 'copy';
                    }
                },
                onDrop: async (e) => {
                    if (this.isSupportedDragElement(e)) {
                        (0, dom_1.hide)(overlay);
                        const vsixs = (0, arrays_1.coalesce)((await this.instantiationService.invokeFunction(accessor => (0, dnd_1.extractEditorsAndFilesDropData)(accessor, e)))
                            .map(editor => editor.resource && (0, resources_1.extname)(editor.resource) === '.vsix' ? editor.resource : undefined));
                        if (vsixs.length > 0) {
                            try {
                                // Attempt to install the extension(s)
                                await this.commandService.executeCommand(extensions_2.INSTALL_EXTENSION_FROM_VSIX_COMMAND_ID, vsixs);
                            }
                            catch (err) {
                                this.notificationService.error(err);
                            }
                        }
                    }
                }
            }));
            super.create((0, dom_1.append)(this.root, (0, dom_1.$)('.extensions')));
            const focusTracker = this._register((0, dom_1.trackFocus)(this.root));
            const isSearchBoxFocused = () => this.searchBox?.inputWidget.hasWidgetFocus();
            this._register((0, widgetNavigationCommands_1.registerNavigableContainer)({
                focusNotifiers: [focusTracker],
                focusNextWidget: () => {
                    if (isSearchBoxFocused()) {
                        this.focusListView();
                    }
                },
                focusPreviousWidget: () => {
                    if (!isSearchBoxFocused()) {
                        this.searchBox?.focus();
                    }
                }
            }));
        }
        focus() {
            this.searchBox?.focus();
        }
        layout(dimension) {
            if (this.root) {
                this.root.classList.toggle('narrow', dimension.width <= 250);
                this.root.classList.toggle('mini', dimension.width <= 200);
            }
            this.searchBox?.layout(new dom_1.Dimension(dimension.width - 34 - /*padding*/ 8, 20));
            super.layout(new dom_1.Dimension(dimension.width, dimension.height - 41));
        }
        getOptimalWidth() {
            return 400;
        }
        search(value) {
            if (this.searchBox && this.searchBox.getValue() !== value) {
                this.searchBox.setValue(value);
            }
        }
        async refresh() {
            await this.updateInstalledExtensionsContexts();
            this.doSearch(true);
            if (this.configurationService.getValue(extensions_2.AutoCheckUpdatesConfigurationKey)) {
                this.extensionsWorkbenchService.checkForUpdates();
            }
        }
        async updateInstalledExtensionsContexts() {
            const result = await this.extensionsWorkbenchService.queryLocal();
            this.hasInstalledExtensionsContextKey.set(result.some(r => !r.isBuiltin));
        }
        triggerSearch() {
            this.searchDelayer.trigger(() => this.doSearch(), this.searchBox && this.searchBox.getValue() ? 500 : 0).then(undefined, err => this.onError(err));
        }
        normalizedQuery() {
            return this.searchBox
                ? this.searchBox.getValue()
                    .trim()
                    .replace(/@category/g, 'category')
                    .replace(/@tag:/g, 'tag:')
                    .replace(/@ext:/g, 'ext:')
                    .replace(/@featured/g, 'featured')
                    .replace(/@popular/g, this.extensionManagementServerService.webExtensionManagementServer && !this.extensionManagementServerService.localExtensionManagementServer && !this.extensionManagementServerService.remoteExtensionManagementServer ? '@web' : '@popular')
                : '';
        }
        saveState() {
            const value = this.searchBox ? this.searchBox.getValue() : '';
            if (extensionsViews_1.ExtensionsListView.isLocalExtensionsQuery(value)) {
                this.searchViewletState['query.value'] = value;
            }
            else {
                this.searchViewletState['query.value'] = '';
            }
            super.saveState();
        }
        doSearch(refresh) {
            const value = this.normalizedQuery();
            this.contextKeyService.bufferChangeEvents(() => {
                const isRecommendedExtensionsQuery = extensionsViews_1.ExtensionsListView.isRecommendedExtensionsQuery(value);
                this.searchHasTextContextKey.set(value.trim() !== '');
                this.searchInstalledExtensionsContextKey.set(extensionsViews_1.ExtensionsListView.isInstalledExtensionsQuery(value));
                this.searchRecentlyUpdatedExtensionsContextKey.set(extensionsViews_1.ExtensionsListView.isSearchRecentlyUpdatedQuery(value) && !extensionsViews_1.ExtensionsListView.isSearchExtensionUpdatesQuery(value));
                this.searchOutdatedExtensionsContextKey.set(extensionsViews_1.ExtensionsListView.isOutdatedExtensionsQuery(value) && !extensionsViews_1.ExtensionsListView.isSearchExtensionUpdatesQuery(value));
                this.searchExtensionUpdatesContextKey.set(extensionsViews_1.ExtensionsListView.isSearchExtensionUpdatesQuery(value));
                this.searchEnabledExtensionsContextKey.set(extensionsViews_1.ExtensionsListView.isEnabledExtensionsQuery(value));
                this.searchDisabledExtensionsContextKey.set(extensionsViews_1.ExtensionsListView.isDisabledExtensionsQuery(value));
                this.searchBuiltInExtensionsContextKey.set(extensionsViews_1.ExtensionsListView.isSearchBuiltInExtensionsQuery(value));
                this.searchWorkspaceUnsupportedExtensionsContextKey.set(extensionsViews_1.ExtensionsListView.isSearchWorkspaceUnsupportedExtensionsQuery(value));
                this.searchDeprecatedExtensionsContextKey.set(extensionsViews_1.ExtensionsListView.isSearchDeprecatedExtensionsQuery(value));
                this.builtInExtensionsContextKey.set(extensionsViews_1.ExtensionsListView.isBuiltInExtensionsQuery(value));
                this.recommendedExtensionsContextKey.set(isRecommendedExtensionsQuery);
                this.searchMarketplaceExtensionsContextKey.set(!!value && !extensionsViews_1.ExtensionsListView.isLocalExtensionsQuery(value) && !isRecommendedExtensionsQuery);
                this.sortByUpdateDateContextKey.set(extensionsViews_1.ExtensionsListView.isSortUpdateDateQuery(value));
                this.defaultViewsContextKey.set(!value || extensionsViews_1.ExtensionsListView.isSortInstalledExtensionsQuery(value));
            });
            return this.progress(Promise.all(this.panes.map(view => view.show(this.normalizedQuery(), refresh)
                .then(model => this.alertSearchResult(model.length, view.id))))).then(() => undefined);
        }
        onDidAddViewDescriptors(added) {
            const addedViews = super.onDidAddViewDescriptors(added);
            this.progress(Promise.all(addedViews.map(addedView => addedView.show(this.normalizedQuery())
                .then(model => this.alertSearchResult(model.length, addedView.id)))));
            return addedViews;
        }
        alertSearchResult(count, viewId) {
            const view = this.viewContainerModel.visibleViewDescriptors.find(view => view.id === viewId);
            switch (count) {
                case 0:
                    break;
                case 1:
                    if (view) {
                        (0, aria_1.alert)((0, nls_1.localize)('extensionFoundInSection', "1 extension found in the {0} section.", view.name));
                    }
                    else {
                        (0, aria_1.alert)((0, nls_1.localize)('extensionFound', "1 extension found."));
                    }
                    break;
                default:
                    if (view) {
                        (0, aria_1.alert)((0, nls_1.localize)('extensionsFoundInSection', "{0} extensions found in the {1} section.", count, view.name));
                    }
                    else {
                        (0, aria_1.alert)((0, nls_1.localize)('extensionsFound', "{0} extensions found.", count));
                    }
                    break;
            }
        }
        getFirstExpandedPane() {
            for (const pane of this.panes) {
                if (pane.isExpanded() && pane instanceof extensionsViews_1.ExtensionsListView) {
                    return pane;
                }
            }
            return undefined;
        }
        focusListView() {
            const pane = this.getFirstExpandedPane();
            if (pane && pane.count() > 0) {
                pane.focus();
            }
        }
        onViewletOpen(viewlet) {
            if (!viewlet || viewlet.getId() === extensions_2.VIEWLET_ID) {
                return;
            }
            if (this.configurationService.getValue(extensions_2.CloseExtensionDetailsOnViewChangeKey)) {
                const promises = this.editorGroupService.groups.map(group => {
                    const editors = group.editors.filter(input => input instanceof extensionsInput_1.ExtensionsInput);
                    return group.closeEditors(editors);
                });
                Promise.all(promises);
            }
        }
        progress(promise) {
            return this.progressService.withProgress({ location: 5 /* ProgressLocation.Extensions */ }, () => promise);
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
        isSupportedDragElement(e) {
            if (e.dataTransfer) {
                const typesLowerCase = e.dataTransfer.types.map(t => t.toLocaleLowerCase());
                return typesLowerCase.indexOf('files') !== -1;
            }
            return false;
        }
    };
    exports.ExtensionsViewPaneContainer = ExtensionsViewPaneContainer;
    exports.ExtensionsViewPaneContainer = ExtensionsViewPaneContainer = __decorate([
        __param(0, layoutService_1.IWorkbenchLayoutService),
        __param(1, telemetry_1.ITelemetryService),
        __param(2, progress_1.IProgressService),
        __param(3, instantiation_1.IInstantiationService),
        __param(4, editorGroupsService_1.IEditorGroupsService),
        __param(5, extensions_2.IExtensionsWorkbenchService),
        __param(6, extensionManagement_2.IExtensionManagementServerService),
        __param(7, notification_1.INotificationService),
        __param(8, panecomposite_1.IPaneCompositePartService),
        __param(9, themeService_1.IThemeService),
        __param(10, configuration_1.IConfigurationService),
        __param(11, storage_1.IStorageService),
        __param(12, workspace_1.IWorkspaceContextService),
        __param(13, contextkey_1.IContextKeyService),
        __param(14, contextView_1.IContextMenuService),
        __param(15, extensions_1.IExtensionService),
        __param(16, views_1.IViewDescriptorService),
        __param(17, preferences_1.IPreferencesService),
        __param(18, commands_1.ICommandService)
    ], ExtensionsViewPaneContainer);
    let StatusUpdater = class StatusUpdater extends lifecycle_1.Disposable {
        constructor(activityService, extensionsWorkbenchService, extensionEnablementService) {
            super();
            this.activityService = activityService;
            this.extensionsWorkbenchService = extensionsWorkbenchService;
            this.extensionEnablementService = extensionEnablementService;
            this.badgeHandle = this._register(new lifecycle_1.MutableDisposable());
            this.onServiceChange();
            this._register(event_1.Event.debounce(extensionsWorkbenchService.onChange, () => undefined, 100, undefined, undefined, undefined, this._store)(this.onServiceChange, this));
        }
        onServiceChange() {
            this.badgeHandle.clear();
            const extensionsReloadRequired = this.extensionsWorkbenchService.installed.filter(e => e.reloadRequiredStatus !== undefined);
            const outdated = this.extensionsWorkbenchService.outdated.reduce((r, e) => r + (this.extensionEnablementService.isEnabled(e.local) && !e.pinned && !extensionsReloadRequired.includes(e) ? 1 : 0), 0);
            const newBadgeNumber = outdated + extensionsReloadRequired.length;
            if (newBadgeNumber > 0) {
                let msg = '';
                if (outdated) {
                    msg += outdated === 1 ? (0, nls_1.localize)('extensionToUpdate', '{0} requires update', outdated) : (0, nls_1.localize)('extensionsToUpdate', '{0} require update', outdated);
                }
                if (outdated > 0 && extensionsReloadRequired.length > 0) {
                    msg += ', ';
                }
                if (extensionsReloadRequired.length) {
                    msg += extensionsReloadRequired.length === 1 ? (0, nls_1.localize)('extensionToReload', '{0} requires reload', extensionsReloadRequired.length) : (0, nls_1.localize)('extensionsToReload', '{0} require reload', extensionsReloadRequired.length);
                }
                const badge = new activity_1.NumberBadge(newBadgeNumber, () => msg);
                this.badgeHandle.value = this.activityService.showViewContainerActivity(extensions_2.VIEWLET_ID, { badge, clazz: 'extensions-badge count-badge' });
            }
        }
    };
    exports.StatusUpdater = StatusUpdater;
    exports.StatusUpdater = StatusUpdater = __decorate([
        __param(0, activity_1.IActivityService),
        __param(1, extensions_2.IExtensionsWorkbenchService),
        __param(2, extensionManagement_2.IWorkbenchExtensionEnablementService)
    ], StatusUpdater);
    let MaliciousExtensionChecker = class MaliciousExtensionChecker {
        constructor(extensionsManagementService, hostService, logService, notificationService, environmentService) {
            this.extensionsManagementService = extensionsManagementService;
            this.hostService = hostService;
            this.logService = logService;
            this.notificationService = notificationService;
            this.environmentService = environmentService;
            if (!this.environmentService.disableExtensions) {
                this.loopCheckForMaliciousExtensions();
            }
        }
        loopCheckForMaliciousExtensions() {
            this.checkForMaliciousExtensions()
                .then(() => (0, async_1.timeout)(1000 * 60 * 5)) // every five minutes
                .then(() => this.loopCheckForMaliciousExtensions());
        }
        checkForMaliciousExtensions() {
            return this.extensionsManagementService.getExtensionsControlManifest().then(extensionsControlManifest => {
                return this.extensionsManagementService.getInstalled(1 /* ExtensionType.User */).then(installed => {
                    const maliciousExtensions = installed
                        .filter(e => extensionsControlManifest.malicious.some(identifier => (0, extensionManagementUtil_1.areSameExtensions)(e.identifier, identifier)));
                    if (maliciousExtensions.length) {
                        return async_1.Promises.settled(maliciousExtensions.map(e => this.extensionsManagementService.uninstall(e).then(() => {
                            this.notificationService.prompt(severity_1.default.Warning, (0, nls_1.localize)('malicious warning', "We have uninstalled '{0}' which was reported to be problematic.", e.identifier.id), [{
                                    label: (0, nls_1.localize)('reloadNow', "Reload Now"),
                                    run: () => this.hostService.reload()
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
            }, err => this.logService.error(err));
        }
    };
    exports.MaliciousExtensionChecker = MaliciousExtensionChecker;
    exports.MaliciousExtensionChecker = MaliciousExtensionChecker = __decorate([
        __param(0, extensionManagement_1.IExtensionManagementService),
        __param(1, host_1.IHostService),
        __param(2, log_1.ILogService),
        __param(3, notification_1.INotificationService),
        __param(4, environmentService_1.IWorkbenchEnvironmentService)
    ], MaliciousExtensionChecker);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0ZW5zaW9uc1ZpZXdsZXQuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9leHRlbnNpb25zL2Jyb3dzZXIvZXh0ZW5zaW9uc1ZpZXdsZXQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBOERuRixRQUFBLG1CQUFtQixHQUFHLElBQUksMEJBQWEsQ0FBVSx1QkFBdUIsRUFBRSxJQUFJLENBQUMsQ0FBQztJQUNoRixRQUFBLHVCQUF1QixHQUFHLElBQUksMEJBQWEsQ0FBUyx1QkFBdUIsRUFBRSxFQUFFLENBQUMsQ0FBQztJQUNqRixRQUFBLGtDQUFrQyxHQUFHLElBQUksMEJBQWEsQ0FBVSw2QkFBNkIsRUFBRSxLQUFLLENBQUMsQ0FBQztJQUN0RyxRQUFBLG9CQUFvQixHQUFHLElBQUksMEJBQWEsQ0FBVSx3QkFBd0IsRUFBRSxLQUFLLENBQUMsQ0FBQztJQUNoRyxNQUFNLGdDQUFnQyxHQUFHLElBQUksMEJBQWEsQ0FBVSwyQkFBMkIsRUFBRSxLQUFLLENBQUMsQ0FBQztJQUN4RyxNQUFNLHNDQUFzQyxHQUFHLElBQUksMEJBQWEsQ0FBVSxpQ0FBaUMsRUFBRSxLQUFLLENBQUMsQ0FBQztJQUNwSCxNQUFNLDZCQUE2QixHQUFHLElBQUksMEJBQWEsQ0FBVSx3QkFBd0IsRUFBRSxLQUFLLENBQUMsQ0FBQztJQUNsRyxNQUFNLCtCQUErQixHQUFHLElBQUksMEJBQWEsQ0FBVSwwQkFBMEIsRUFBRSxLQUFLLENBQUMsQ0FBQztJQUN0RyxNQUFNLDhCQUE4QixHQUFHLElBQUksMEJBQWEsQ0FBVSx5QkFBeUIsRUFBRSxLQUFLLENBQUMsQ0FBQztJQUNwRyxNQUFNLCtCQUErQixHQUFHLElBQUksMEJBQWEsQ0FBVSwwQkFBMEIsRUFBRSxLQUFLLENBQUMsQ0FBQztJQUN0RyxNQUFNLDZCQUE2QixHQUFHLElB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