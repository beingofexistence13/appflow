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
define(["require", "exports", "vs/nls", "vs/base/common/arrays", "vs/base/common/platform", "vs/base/common/event", "vs/base/common/cache", "vs/base/common/actions", "vs/base/common/errors", "vs/base/common/lifecycle", "vs/base/browser/dom", "vs/workbench/browser/parts/editor/editorPane", "vs/platform/telemetry/common/telemetry", "vs/platform/instantiation/common/instantiation", "vs/workbench/services/extensionRecommendations/common/extensionRecommendations", "vs/platform/extensions/common/extensions", "vs/workbench/contrib/extensions/common/extensions", "vs/workbench/contrib/extensions/browser/extensionsWidgets", "vs/base/browser/ui/actionbar/actionbar", "vs/workbench/contrib/extensions/browser/extensionsActions", "vs/platform/keybinding/common/keybinding", "vs/base/browser/ui/scrollbar/scrollableElement", "vs/platform/opener/common/opener", "vs/platform/theme/common/themeService", "vs/base/common/themables", "vs/base/browser/ui/keybindingLabel/keybindingLabel", "vs/platform/contextkey/common/contextkey", "vs/workbench/services/editor/common/editorService", "vs/base/common/color", "vs/platform/notification/common/notification", "vs/base/common/cancellation", "vs/workbench/contrib/extensions/browser/extensionsViewer", "vs/workbench/contrib/update/common/update", "vs/platform/storage/common/storage", "vs/workbench/services/extensions/common/extensions", "vs/platform/configuration/common/configurationRegistry", "vs/base/common/types", "vs/workbench/contrib/webview/browser/webview", "vs/base/common/uuid", "vs/base/common/process", "vs/base/common/uri", "vs/base/common/network", "vs/workbench/contrib/markdown/browser/markdownDocumentRenderer", "vs/editor/common/languages/language", "vs/editor/common/languages", "vs/editor/common/languages/supports/tokenization", "vs/platform/theme/common/colorRegistry", "vs/platform/actions/common/actions", "vs/platform/contextview/browser/contextView", "vs/editor/common/editorContextKeys", "vs/workbench/contrib/extensions/browser/extensionsList", "vs/base/browser/markdownRenderer", "vs/platform/extensionManagement/common/extensionManagementUtil", "vs/workbench/contrib/extensions/browser/extensionsIcons", "vs/workbench/services/panecomposite/browser/panecomposite", "vs/platform/extensionManagement/common/extensionManagement", "vs/base/common/semver/semver", "vs/platform/theme/browser/defaultStyles", "vs/css!./media/extensionEditor"], function (require, exports, nls_1, arrays, platform_1, event_1, cache_1, actions_1, errors_1, lifecycle_1, dom_1, editorPane_1, telemetry_1, instantiation_1, extensionRecommendations_1, extensions_1, extensions_2, extensionsWidgets_1, actionbar_1, extensionsActions_1, keybinding_1, scrollableElement_1, opener_1, themeService_1, themables_1, keybindingLabel_1, contextkey_1, editorService_1, color_1, notification_1, cancellation_1, extensionsViewer_1, update_1, storage_1, extensions_3, configurationRegistry_1, types_1, webview_1, uuid_1, process_1, uri_1, network_1, markdownDocumentRenderer_1, language_1, languages_1, tokenization_1, colorRegistry_1, actions_2, contextView_1, editorContextKeys_1, extensionsList_1, markdownRenderer_1, extensionManagementUtil_1, extensionsIcons_1, panecomposite_1, extensionManagement_1, semver, defaultStyles_1) {
    "use strict";
    var ExtensionEditor_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ExtensionEditor = void 0;
    class NavBar extends lifecycle_1.Disposable {
        get onChange() { return this._onChange.event; }
        get currentId() { return this._currentId; }
        constructor(container) {
            super();
            this._onChange = this._register(new event_1.Emitter());
            this._currentId = null;
            const element = (0, dom_1.append)(container, (0, dom_1.$)('.navbar'));
            this.actions = [];
            this.actionbar = this._register(new actionbar_1.ActionBar(element, { animated: false }));
        }
        push(id, label, tooltip) {
            const action = new actions_1.Action(id, label, undefined, true, () => this.update(id, true));
            action.tooltip = tooltip;
            this.actions.push(action);
            this.actionbar.push(action);
            if (this.actions.length === 1) {
                this.update(id);
            }
        }
        clear() {
            this.actions = (0, lifecycle_1.dispose)(this.actions);
            this.actionbar.clear();
        }
        switch(id) {
            const action = this.actions.find(action => action.id === id);
            if (action) {
                action.run();
                return true;
            }
            return false;
        }
        update(id, focus) {
            this._currentId = id;
            this._onChange.fire({ id, focus: !!focus });
            this.actions.forEach(a => a.checked = a.id === id);
        }
    }
    var WebviewIndex;
    (function (WebviewIndex) {
        WebviewIndex[WebviewIndex["Readme"] = 0] = "Readme";
        WebviewIndex[WebviewIndex["Changelog"] = 1] = "Changelog";
    })(WebviewIndex || (WebviewIndex = {}));
    const CONTEXT_SHOW_PRE_RELEASE_VERSION = new contextkey_1.RawContextKey('showPreReleaseVersion', false);
    class ExtensionWithDifferentGalleryVersionWidget extends extensionsWidgets_1.ExtensionWidget {
        constructor() {
            super(...arguments);
            this._gallery = null;
        }
        get gallery() { return this._gallery; }
        set gallery(gallery) {
            if (this.extension && gallery && !(0, extensionManagementUtil_1.areSameExtensions)(this.extension.identifier, gallery.identifier)) {
                return;
            }
            this._gallery = gallery;
            this.update();
        }
    }
    class VersionWidget extends ExtensionWithDifferentGalleryVersionWidget {
        constructor(container) {
            super();
            this.element = (0, dom_1.append)(container, (0, dom_1.$)('code.version', { title: (0, nls_1.localize)('extension version', "Extension Version") }));
            this.render();
        }
        render() {
            if (!this.extension || !semver.valid(this.extension.version)) {
                return;
            }
            this.element.textContent = `v${this.gallery?.version ?? this.extension.version}`;
        }
    }
    class PreReleaseTextWidget extends ExtensionWithDifferentGalleryVersionWidget {
        constructor(container) {
            super();
            this.element = (0, dom_1.append)(container, (0, dom_1.$)('span.pre-release'));
            (0, dom_1.append)(this.element, (0, dom_1.$)('span' + themables_1.ThemeIcon.asCSSSelector(extensionsIcons_1.preReleaseIcon)));
            const textElement = (0, dom_1.append)(this.element, (0, dom_1.$)('span.pre-release-text'));
            textElement.textContent = (0, nls_1.localize)('preRelease', "Pre-Release");
            this.render();
        }
        render() {
            this.element.style.display = this.isPreReleaseVersion() ? 'inherit' : 'none';
        }
        isPreReleaseVersion() {
            if (!this.extension) {
                return false;
            }
            if (this.gallery) {
                return this.gallery.properties.isPreReleaseVersion;
            }
            return !!(this.extension.state === 1 /* ExtensionState.Installed */ ? this.extension.local?.isPreReleaseVersion : this.extension.gallery?.properties.isPreReleaseVersion);
        }
    }
    let ExtensionEditor = class ExtensionEditor extends editorPane_1.EditorPane {
        static { ExtensionEditor_1 = this; }
        static { this.ID = 'workbench.editor.extension'; }
        constructor(telemetryService, instantiationService, paneCompositeService, extensionsWorkbenchService, extensionGalleryService, themeService, keybindingService, notificationService, openerService, extensionRecommendationsService, storageService, extensionService, webviewService, languageService, contextMenuService, contextKeyService) {
            super(ExtensionEditor_1.ID, telemetryService, themeService, storageService);
            this.instantiationService = instantiationService;
            this.paneCompositeService = paneCompositeService;
            this.extensionsWorkbenchService = extensionsWorkbenchService;
            this.extensionGalleryService = extensionGalleryService;
            this.keybindingService = keybindingService;
            this.notificationService = notificationService;
            this.openerService = openerService;
            this.extensionRecommendationsService = extensionRecommendationsService;
            this.extensionService = extensionService;
            this.webviewService = webviewService;
            this.languageService = languageService;
            this.contextMenuService = contextMenuService;
            this.contextKeyService = contextKeyService;
            this._scopedContextKeyService = this._register(new lifecycle_1.MutableDisposable());
            // Some action bar items use a webview whose vertical scroll position we track in this map
            this.initialScrollProgress = new Map();
            // Spot when an ExtensionEditor instance gets reused for a different extension, in which case the vertical scroll positions must be zeroed
            this.currentIdentifier = '';
            this.layoutParticipants = [];
            this.contentDisposables = this._register(new lifecycle_1.DisposableStore());
            this.transientDisposables = this._register(new lifecycle_1.DisposableStore());
            this.activeElement = null;
            this.extensionReadme = null;
            this.extensionChangelog = null;
            this.extensionManifest = null;
        }
        get scopedContextKeyService() {
            return this._scopedContextKeyService.value;
        }
        createEditor(parent) {
            const root = (0, dom_1.append)(parent, (0, dom_1.$)('.extension-editor'));
            this._scopedContextKeyService.value = this.contextKeyService.createScoped(root);
            this._scopedContextKeyService.value.createKey('inExtensionEditor', true);
            this.showPreReleaseVersionContextKey = CONTEXT_SHOW_PRE_RELEASE_VERSION.bindTo(this._scopedContextKeyService.value);
            root.tabIndex = 0; // this is required for the focus tracker on the editor
            root.style.outline = 'none';
            root.setAttribute('role', 'document');
            const header = (0, dom_1.append)(root, (0, dom_1.$)('.header'));
            const iconContainer = (0, dom_1.append)(header, (0, dom_1.$)('.icon-container'));
            const icon = (0, dom_1.append)(iconContainer, (0, dom_1.$)('img.icon', { draggable: false, alt: '' }));
            const remoteBadge = this.instantiationService.createInstance(extensionsWidgets_1.RemoteBadgeWidget, iconContainer, true);
            const details = (0, dom_1.append)(header, (0, dom_1.$)('.details'));
            const title = (0, dom_1.append)(details, (0, dom_1.$)('.title'));
            const name = (0, dom_1.append)(title, (0, dom_1.$)('span.name.clickable', { title: (0, nls_1.localize)('name', "Extension name"), role: 'heading', tabIndex: 0 }));
            const versionWidget = new VersionWidget(title);
            const preReleaseWidget = new PreReleaseTextWidget(title);
            const preview = (0, dom_1.append)(title, (0, dom_1.$)('span.preview', { title: (0, nls_1.localize)('preview', "Preview") }));
            preview.textContent = (0, nls_1.localize)('preview', "Preview");
            const builtin = (0, dom_1.append)(title, (0, dom_1.$)('span.builtin'));
            builtin.textContent = (0, nls_1.localize)('builtin', "Built-in");
            const subtitle = (0, dom_1.append)(details, (0, dom_1.$)('.subtitle'));
            const publisher = (0, dom_1.append)((0, dom_1.append)(subtitle, (0, dom_1.$)('.subtitle-entry')), (0, dom_1.$)('.publisher.clickable', { title: (0, nls_1.localize)('publisher', "Publisher"), tabIndex: 0 }));
            publisher.setAttribute('role', 'button');
            const publisherDisplayName = (0, dom_1.append)(publisher, (0, dom_1.$)('.publisher-name'));
            const verifiedPublisherWidget = this.instantiationService.createInstance(extensionsWidgets_1.VerifiedPublisherWidget, (0, dom_1.append)(publisher, (0, dom_1.$)('.verified-publisher')), false);
            const installCount = (0, dom_1.append)((0, dom_1.append)(subtitle, (0, dom_1.$)('.subtitle-entry')), (0, dom_1.$)('span.install', { title: (0, nls_1.localize)('install count', "Install count"), tabIndex: 0 }));
            const installCountWidget = this.instantiationService.createInstance(extensionsWidgets_1.InstallCountWidget, installCount, false);
            const rating = (0, dom_1.append)((0, dom_1.append)(subtitle, (0, dom_1.$)('.subtitle-entry')), (0, dom_1.$)('span.rating.clickable', { title: (0, nls_1.localize)('rating', "Rating"), tabIndex: 0 }));
            rating.setAttribute('role', 'link'); // #132645
            const ratingsWidget = this.instantiationService.createInstance(extensionsWidgets_1.RatingsWidget, rating, false);
            const sponsorWidget = this.instantiationService.createInstance(extensionsWidgets_1.SponsorWidget, (0, dom_1.append)(subtitle, (0, dom_1.$)('.subtitle-entry')));
            const widgets = [
                remoteBadge,
                versionWidget,
                preReleaseWidget,
                verifiedPublisherWidget,
                installCountWidget,
                ratingsWidget,
                sponsorWidget,
            ];
            const description = (0, dom_1.append)(details, (0, dom_1.$)('.description'));
            const installAction = this.instantiationService.createInstance(extensionsActions_1.InstallDropdownAction);
            const actions = [
                this.instantiationService.createInstance(extensionsActions_1.ReloadAction),
                this.instantiationService.createInstance(extensionsActions_1.ExtensionStatusLabelAction),
                this.instantiationService.createInstance(extensionsActions_1.ActionWithDropDownAction, 'extensions.updateActions', '', [[this.instantiationService.createInstance(extensionsActions_1.UpdateAction, true)], [this.instantiationService.createInstance(extensionsActions_1.SkipUpdateAction)]]),
                this.instantiationService.createInstance(extensionsActions_1.SetColorThemeAction),
                this.instantiationService.createInstance(extensionsActions_1.SetFileIconThemeAction),
                this.instantiationService.createInstance(extensionsActions_1.SetProductIconThemeAction),
                this.instantiationService.createInstance(extensionsActions_1.SetLanguageAction),
                this.instantiationService.createInstance(extensionsActions_1.ClearLanguageAction),
                this.instantiationService.createInstance(extensionsActions_1.EnableDropDownAction),
                this.instantiationService.createInstance(extensionsActions_1.DisableDropDownAction),
                this.instantiationService.createInstance(extensionsActions_1.RemoteInstallAction, false),
                this.instantiationService.createInstance(extensionsActions_1.LocalInstallAction),
                this.instantiationService.createInstance(extensionsActions_1.WebInstallAction),
                installAction,
                this.instantiationService.createInstance(extensionsActions_1.InstallingLabelAction),
                this.instantiationService.createInstance(extensionsActions_1.ActionWithDropDownAction, 'extensions.uninstall', extensionsActions_1.UninstallAction.UninstallLabel, [
                    [
                        this.instantiationService.createInstance(extensionsActions_1.MigrateDeprecatedExtensionAction, false),
                        this.instantiationService.createInstance(extensionsActions_1.UninstallAction),
                        this.instantiationService.createInstance(extensionsActions_1.InstallAnotherVersionAction),
                    ]
                ]),
                this.instantiationService.createInstance(extensionsActions_1.SwitchToPreReleaseVersionAction, false),
                this.instantiationService.createInstance(extensionsActions_1.SwitchToReleasedVersionAction, false),
                this.instantiationService.createInstance(extensionsActions_1.ToggleSyncExtensionAction),
                new extensionsActions_1.ExtensionEditorManageExtensionAction(this.scopedContextKeyService || this.contextKeyService, this.instantiationService),
            ];
            const actionsAndStatusContainer = (0, dom_1.append)(details, (0, dom_1.$)('.actions-status-container'));
            const extensionActionBar = this._register(new actionbar_1.ActionBar(actionsAndStatusContainer, {
                animated: false,
                actionViewItemProvider: (action) => {
                    if (action instanceof extensionsActions_1.ExtensionDropDownAction) {
                        return action.createActionViewItem();
                    }
                    if (action instanceof extensionsActions_1.ActionWithDropDownAction) {
                        return new extensionsActions_1.ExtensionActionWithDropdownActionViewItem(action, { icon: true, label: true, menuActionsOrProvider: { getActions: () => action.menuActions }, menuActionClassNames: (action.class || '').split(' ') }, this.contextMenuService);
                    }
                    return undefined;
                },
                focusOnlyEnabledItems: true
            }));
            extensionActionBar.push(actions, { icon: true, label: true });
            extensionActionBar.setFocusable(true);
            // update focusable elements when the enablement of an action changes
            this._register(event_1.Event.any(...actions.map(a => event_1.Event.filter(a.onDidChange, e => e.enabled !== undefined)))(() => {
                extensionActionBar.setFocusable(false);
                extensionActionBar.setFocusable(true);
            }));
            const otherExtensionContainers = [];
            const extensionStatusAction = this.instantiationService.createInstance(extensionsActions_1.ExtensionStatusAction);
            const extensionStatusWidget = this._register(this.instantiationService.createInstance(extensionsWidgets_1.ExtensionStatusWidget, (0, dom_1.append)(actionsAndStatusContainer, (0, dom_1.$)('.status')), extensionStatusAction));
            otherExtensionContainers.push(extensionStatusAction, new class extends extensionsWidgets_1.ExtensionWidget {
                render() {
                    actionsAndStatusContainer.classList.toggle('list-layout', this.extension?.state === 1 /* ExtensionState.Installed */);
                }
            }());
            const recommendationWidget = this.instantiationService.createInstance(extensionsWidgets_1.ExtensionRecommendationWidget, (0, dom_1.append)(details, (0, dom_1.$)('.recommendation')));
            widgets.push(recommendationWidget);
            this._register(event_1.Event.any(extensionStatusWidget.onDidRender, recommendationWidget.onDidRender)(() => {
                if (this.dimension) {
                    this.layout(this.dimension);
                }
            }));
            const extensionContainers = this.instantiationService.createInstance(extensions_2.ExtensionContainers, [...actions, ...widgets, ...otherExtensionContainers]);
            for (const disposable of [...actions, ...widgets, ...otherExtensionContainers, extensionContainers]) {
                this._register(disposable);
            }
            const onError = event_1.Event.chain(extensionActionBar.onDidRun, $ => $.map(({ error }) => error)
                .filter(error => !!error));
            this._register(onError(this.onError, this));
            const body = (0, dom_1.append)(root, (0, dom_1.$)('.body'));
            const navbar = new NavBar(body);
            const content = (0, dom_1.append)(body, (0, dom_1.$)('.content'));
            content.id = (0, uuid_1.generateUuid)(); // An id is needed for the webview parent flow to
            this.template = {
                builtin,
                content,
                description,
                header,
                icon,
                iconContainer,
                installCount,
                name,
                navbar,
                preview,
                publisher,
                publisherDisplayName,
                rating,
                actionsAndStatusContainer,
                extensionActionBar,
                set extension(extension) {
                    extensionContainers.extension = extension;
                },
                set gallery(gallery) {
                    versionWidget.gallery = gallery;
                    preReleaseWidget.gallery = gallery;
                },
                set manifest(manifest) {
                    installAction.manifest = manifest;
                }
            };
        }
        async setInput(input, options, context, token) {
            await super.setInput(input, options, context, token);
            this.updatePreReleaseVersionContext();
            if (this.template) {
                await this.render(input.extension, this.template, !!options?.preserveFocus);
            }
        }
        setOptions(options) {
            const currentOptions = this.options;
            super.setOptions(options);
            this.updatePreReleaseVersionContext();
            if (this.input && this.template && currentOptions?.showPreReleaseVersion !== options?.showPreReleaseVersion) {
                this.render(this.input.extension, this.template, !!options?.preserveFocus);
            }
        }
        updatePreReleaseVersionContext() {
            let showPreReleaseVersion = this.options?.showPreReleaseVersion;
            if ((0, types_1.isUndefined)(showPreReleaseVersion)) {
                showPreReleaseVersion = !!this.input.extension.gallery?.properties.isPreReleaseVersion;
            }
            this.showPreReleaseVersionContextKey?.set(showPreReleaseVersion);
        }
        async openTab(tab) {
            if (!this.input || !this.template) {
                return;
            }
            if (this.template.navbar.switch(tab)) {
                return;
            }
            // Fallback to Readme tab if ExtensionPack tab does not exist
            if (tab === "extensionPack" /* ExtensionEditorTab.ExtensionPack */) {
                this.template.navbar.switch("readme" /* ExtensionEditorTab.Readme */);
            }
        }
        async getGalleryVersionToShow(extension, preRelease) {
            if ((0, types_1.isUndefined)(preRelease)) {
                return null;
            }
            if (preRelease === extension.gallery?.properties.isPreReleaseVersion) {
                return null;
            }
            if (preRelease && !extension.hasPreReleaseVersion) {
                return null;
            }
            if (!preRelease && !extension.hasReleaseVersion) {
                return null;
            }
            return (await this.extensionGalleryService.getExtensions([{ ...extension.identifier, preRelease, hasPreRelease: extension.hasPreReleaseVersion }], cancellation_1.CancellationToken.None))[0] || null;
        }
        async render(extension, template, preserveFocus) {
            this.activeElement = null;
            this.transientDisposables.clear();
            const token = this.transientDisposables.add(new cancellation_1.CancellationTokenSource()).token;
            const gallery = await this.getGalleryVersionToShow(extension, this.options?.showPreReleaseVersion);
            if (token.isCancellationRequested) {
                return;
            }
            this.extensionReadme = new cache_1.Cache(() => gallery ? this.extensionGalleryService.getReadme(gallery, token) : extension.getReadme(token));
            this.extensionChangelog = new cache_1.Cache(() => gallery ? this.extensionGalleryService.getChangelog(gallery, token) : extension.getChangelog(token));
            this.extensionManifest = new cache_1.Cache(() => gallery ? this.extensionGalleryService.getManifest(gallery, token) : extension.getManifest(token));
            template.extension = extension;
            template.gallery = gallery;
            template.manifest = null;
            this.transientDisposables.add((0, dom_1.addDisposableListener)(template.icon, 'error', () => template.icon.src = extension.iconUrlFallback, { once: true }));
            template.icon.src = extension.iconUrl;
            template.name.textContent = extension.displayName;
            template.name.classList.toggle('clickable', !!extension.url);
            template.name.classList.toggle('deprecated', !!extension.deprecationInfo);
            template.preview.style.display = extension.preview ? 'inherit' : 'none';
            template.builtin.style.display = extension.isBuiltin ? 'inherit' : 'none';
            template.description.textContent = extension.description;
            // subtitle
            template.publisher.classList.toggle('clickable', !!extension.url);
            template.publisherDisplayName.textContent = extension.publisherDisplayName;
            template.installCount.parentElement?.classList.toggle('hide', !extension.url);
            template.rating.parentElement?.classList.toggle('hide', !extension.url);
            template.rating.classList.toggle('clickable', !!extension.url);
            if (extension.url) {
                this.transientDisposables.add((0, extensionsWidgets_1.onClick)(template.name, () => this.openerService.open(uri_1.URI.parse(extension.url))));
                this.transientDisposables.add((0, extensionsWidgets_1.onClick)(template.rating, () => this.openerService.open(uri_1.URI.parse(`${extension.url}&ssr=false#review-details`))));
                this.transientDisposables.add((0, extensionsWidgets_1.onClick)(template.publisher, () => {
                    this.paneCompositeService.openPaneComposite(extensions_2.VIEWLET_ID, 0 /* ViewContainerLocation.Sidebar */, true)
                        .then(viewlet => viewlet?.getViewPaneContainer())
                        .then(viewlet => viewlet.search(`publisher:"${extension.publisherDisplayName}"`));
                }));
            }
            const manifest = await this.extensionManifest.get().promise;
            if (token.isCancellationRequested) {
                return;
            }
            if (manifest) {
                template.manifest = manifest;
            }
            this.renderNavbar(extension, manifest, template, preserveFocus);
            // report telemetry
            const extRecommendations = this.extensionRecommendationsService.getAllRecommendationsWithReason();
            let recommendationsData = {};
            if (extRecommendations[extension.identifier.id.toLowerCase()]) {
                recommendationsData = { recommendationReason: extRecommendations[extension.identifier.id.toLowerCase()].reasonId };
            }
            /* __GDPR__
            "extensionGallery:openExtension" : {
                "owner": "sandy081",
                "recommendationReason": { "classification": "SystemMetaData", "purpose": "FeatureInsight", "isMeasurement": true },
                "${include}": [
                    "${GalleryExtensionTelemetryData}"
                ]
            }
            */
            this.telemetryService.publicLog('extensionGallery:openExtension', { ...extension.telemetryData, ...recommendationsData });
        }
        renderNavbar(extension, manifest, template, preserveFocus) {
            template.content.innerText = '';
            template.navbar.clear();
            if (this.currentIdentifier !== extension.identifier.id) {
                this.initialScrollProgress.clear();
                this.currentIdentifier = extension.identifier.id;
            }
            if (extension.hasReadme()) {
                template.navbar.push("readme" /* ExtensionEditorTab.Readme */, (0, nls_1.localize)('details', "Details"), (0, nls_1.localize)('detailstooltip', "Extension details, rendered from the extension's 'README.md' file"));
            }
            if (manifest && manifest.contributes) {
                template.navbar.push("contributions" /* ExtensionEditorTab.Contributions */, (0, nls_1.localize)('contributions', "Feature Contributions"), (0, nls_1.localize)('contributionstooltip', "Lists contributions to VS Code by this extension"));
            }
            if (extension.hasChangelog()) {
                template.navbar.push("changelog" /* ExtensionEditorTab.Changelog */, (0, nls_1.localize)('changelog', "Changelog"), (0, nls_1.localize)('changelogtooltip', "Extension update history, rendered from the extension's 'CHANGELOG.md' file"));
            }
            if (extension.dependencies.length) {
                template.navbar.push("dependencies" /* ExtensionEditorTab.Dependencies */, (0, nls_1.localize)('dependencies', "Dependencies"), (0, nls_1.localize)('dependenciestooltip', "Lists extensions this extension depends on"));
            }
            if (manifest && manifest.extensionPack?.length && !this.shallRenderAsExtensionPack(manifest)) {
                template.navbar.push("extensionPack" /* ExtensionEditorTab.ExtensionPack */, (0, nls_1.localize)('extensionpack', "Extension Pack"), (0, nls_1.localize)('extensionpacktooltip', "Lists extensions those will be installed together with this extension"));
            }
            const addRuntimeStatusSection = () => template.navbar.push("runtimeStatus" /* ExtensionEditorTab.RuntimeStatus */, (0, nls_1.localize)('runtimeStatus', "Runtime Status"), (0, nls_1.localize)('runtimeStatus description', "Extension runtime status"));
            if (this.extensionsWorkbenchService.getExtensionStatus(extension)) {
                addRuntimeStatusSection();
            }
            else {
                const disposable = this.extensionService.onDidChangeExtensionsStatus(e => {
                    if (e.some(extensionIdentifier => (0, extensionManagementUtil_1.areSameExtensions)({ id: extensionIdentifier.value }, extension.identifier))) {
                        addRuntimeStatusSection();
                        disposable.dispose();
                    }
                }, this, this.transientDisposables);
            }
            if (template.navbar.currentId) {
                this.onNavbarChange(extension, { id: template.navbar.currentId, focus: !preserveFocus }, template);
            }
            template.navbar.onChange(e => this.onNavbarChange(extension, e, template), this, this.transientDisposables);
        }
        clearInput() {
            this.contentDisposables.clear();
            this.transientDisposables.clear();
            super.clearInput();
        }
        focus() {
            this.activeElement?.focus();
        }
        showFind() {
            this.activeWebview?.showFind();
        }
        runFindAction(previous) {
            this.activeWebview?.runFindAction(previous);
        }
        get activeWebview() {
            if (!this.activeElement || !this.activeElement.runFindAction) {
                return undefined;
            }
            return this.activeElement;
        }
        onNavbarChange(extension, { id, focus }, template) {
            this.contentDisposables.clear();
            template.content.innerText = '';
            this.activeElement = null;
            if (id) {
                const cts = new cancellation_1.CancellationTokenSource();
                this.contentDisposables.add((0, lifecycle_1.toDisposable)(() => cts.dispose(true)));
                this.open(id, extension, template, cts.token)
                    .then(activeElement => {
                    if (cts.token.isCancellationRequested) {
                        return;
                    }
                    this.activeElement = activeElement;
                    if (focus) {
                        this.focus();
                    }
                });
            }
        }
        open(id, extension, template, token) {
            switch (id) {
                case "readme" /* ExtensionEditorTab.Readme */: return this.openDetails(extension, template, token);
                case "contributions" /* ExtensionEditorTab.Contributions */: return this.openContributions(template, token);
                case "changelog" /* ExtensionEditorTab.Changelog */: return this.openChangelog(template, token);
                case "dependencies" /* ExtensionEditorTab.Dependencies */: return this.openExtensionDependencies(extension, template, token);
                case "extensionPack" /* ExtensionEditorTab.ExtensionPack */: return this.openExtensionPack(extension, template, token);
                case "runtimeStatus" /* ExtensionEditorTab.RuntimeStatus */: return this.openRuntimeStatus(extension, template, token);
            }
            return Promise.resolve(null);
        }
        async openMarkdown(cacheResult, noContentCopy, container, webviewIndex, title, token) {
            try {
                const body = await this.renderMarkdown(cacheResult, container, token);
                if (token.isCancellationRequested) {
                    return Promise.resolve(null);
                }
                const webview = this.contentDisposables.add(this.webviewService.createWebviewOverlay({
                    title,
                    options: {
                        enableFindWidget: true,
                        tryRestoreScrollPosition: true,
                        disableServiceWorker: true,
                    },
                    contentOptions: {},
                    extension: undefined,
                }));
                webview.initialScrollProgress = this.initialScrollProgress.get(webviewIndex) || 0;
                webview.claim(this, this.scopedContextKeyService);
                (0, dom_1.setParentFlowTo)(webview.container, container);
                webview.layoutWebviewOverElement(container);
                webview.setHtml(body);
                webview.claim(this, undefined);
                this.contentDisposables.add(webview.onDidFocus(() => this.fireOnDidFocus()));
                this.contentDisposables.add(webview.onDidScroll(() => this.initialScrollProgress.set(webviewIndex, webview.initialScrollProgress)));
                const removeLayoutParticipant = arrays.insert(this.layoutParticipants, {
                    layout: () => {
                        webview.layoutWebviewOverElement(container);
                    }
                });
                this.contentDisposables.add((0, lifecycle_1.toDisposable)(removeLayoutParticipant));
                let isDisposed = false;
                this.contentDisposables.add((0, lifecycle_1.toDisposable)(() => { isDisposed = true; }));
                this.contentDisposables.add(this.themeService.onDidColorThemeChange(async () => {
                    // Render again since syntax highlighting of code blocks may have changed
                    const body = await this.renderMarkdown(cacheResult, container);
                    if (!isDisposed) { // Make sure we weren't disposed of in the meantime
                        webview.setHtml(body);
                    }
                }));
                this.contentDisposables.add(webview.onDidClickLink(link => {
                    if (!link) {
                        return;
                    }
                    // Only allow links with specific schemes
                    if ((0, opener_1.matchesScheme)(link, network_1.Schemas.http) || (0, opener_1.matchesScheme)(link, network_1.Schemas.https) || (0, opener_1.matchesScheme)(link, network_1.Schemas.mailto)) {
                        this.openerService.open(link);
                    }
                    if ((0, opener_1.matchesScheme)(link, network_1.Schemas.command) && uri_1.URI.parse(link).path === update_1.ShowCurrentReleaseNotesActionId) {
                        this.openerService.open(link, { allowCommands: true }); // TODO@sandy081 use commands service
                    }
                }));
                return webview;
            }
            catch (e) {
                const p = (0, dom_1.append)(container, (0, dom_1.$)('p.nocontent'));
                p.textContent = noContentCopy;
                return p;
            }
        }
        async renderMarkdown(cacheResult, container, token) {
            const contents = await this.loadContents(() => cacheResult, container);
            if (token?.isCancellationRequested) {
                return '';
            }
            const content = await (0, markdownDocumentRenderer_1.renderMarkdownDocument)(contents, this.extensionService, this.languageService, true, false, token);
            if (token?.isCancellationRequested) {
                return '';
            }
            return this.renderBody(content);
        }
        renderBody(body) {
            const nonce = (0, uuid_1.generateUuid)();
            const colorMap = languages_1.TokenizationRegistry.getColorMap();
            const css = colorMap ? (0, tokenization_1.generateTokensCSSForColorMap)(colorMap) : '';
            return `<!DOCTYPE html>
		<html>
			<head>
				<meta http-equiv="Content-type" content="text/html;charset=UTF-8">
				<meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src https: data:; media-src https:; script-src 'none'; style-src 'nonce-${nonce}';">
				<style nonce="${nonce}">
					${markdownDocumentRenderer_1.DEFAULT_MARKDOWN_STYLES}

					/* prevent scroll-to-top button from blocking the body text */
					body {
						padding-bottom: 75px;
					}

					#scroll-to-top {
						position: fixed;
						width: 32px;
						height: 32px;
						right: 25px;
						bottom: 25px;
						background-color: var(--vscode-button-secondaryBackground);
						border-color: var(--vscode-button-border);
						border-radius: 50%;
						cursor: pointer;
						box-shadow: 1px 1px 1px rgba(0,0,0,.25);
						outline: none;
						display: flex;
						justify-content: center;
						align-items: center;
					}

					#scroll-to-top:hover {
						background-color: var(--vscode-button-secondaryHoverBackground);
						box-shadow: 2px 2px 2px rgba(0,0,0,.25);
					}

					body.vscode-high-contrast #scroll-to-top {
						border-width: 2px;
						border-style: solid;
						box-shadow: none;
					}

					#scroll-to-top span.icon::before {
						content: "";
						display: block;
						background: var(--vscode-button-secondaryForeground);
						/* Chevron up icon */
						webkit-mask-image: url('data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPCEtLSBHZW5lcmF0b3I6IEFkb2JlIElsbHVzdHJhdG9yIDE5LjIuMCwgU1ZHIEV4cG9ydCBQbHVnLUluIC4gU1ZHIFZlcnNpb246IDYuMDAgQnVpbGQgMCkgIC0tPgo8c3ZnIHZlcnNpb249IjEuMSIgaWQ9IkxheWVyXzEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4IgoJIHZpZXdCb3g9IjAgMCAxNiAxNiIgc3R5bGU9ImVuYWJsZS1iYWNrZ3JvdW5kOm5ldyAwIDAgMTYgMTY7IiB4bWw6c3BhY2U9InByZXNlcnZlIj4KPHN0eWxlIHR5cGU9InRleHQvY3NzIj4KCS5zdDB7ZmlsbDojRkZGRkZGO30KCS5zdDF7ZmlsbDpub25lO30KPC9zdHlsZT4KPHRpdGxlPnVwY2hldnJvbjwvdGl0bGU+CjxwYXRoIGNsYXNzPSJzdDAiIGQ9Ik04LDUuMWwtNy4zLDcuM0wwLDExLjZsOC04bDgsOGwtMC43LDAuN0w4LDUuMXoiLz4KPHJlY3QgY2xhc3M9InN0MSIgd2lkdGg9IjE2IiBoZWlnaHQ9IjE2Ii8+Cjwvc3ZnPgo=');
						-webkit-mask-image: url('data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPCEtLSBHZW5lcmF0b3I6IEFkb2JlIElsbHVzdHJhdG9yIDE5LjIuMCwgU1ZHIEV4cG9ydCBQbHVnLUluIC4gU1ZHIFZlcnNpb246IDYuMDAgQnVpbGQgMCkgIC0tPgo8c3ZnIHZlcnNpb249IjEuMSIgaWQ9IkxheWVyXzEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4IgoJIHZpZXdCb3g9IjAgMCAxNiAxNiIgc3R5bGU9ImVuYWJsZS1iYWNrZ3JvdW5kOm5ldyAwIDAgMTYgMTY7IiB4bWw6c3BhY2U9InByZXNlcnZlIj4KPHN0eWxlIHR5cGU9InRleHQvY3NzIj4KCS5zdDB7ZmlsbDojRkZGRkZGO30KCS5zdDF7ZmlsbDpub25lO30KPC9zdHlsZT4KPHRpdGxlPnVwY2hldnJvbjwvdGl0bGU+CjxwYXRoIGNsYXNzPSJzdDAiIGQ9Ik04LDUuMWwtNy4zLDcuM0wwLDExLjZsOC04bDgsOGwtMC43LDAuN0w4LDUuMXoiLz4KPHJlY3QgY2xhc3M9InN0MSIgd2lkdGg9IjE2IiBoZWlnaHQ9IjE2Ii8+Cjwvc3ZnPgo=');
						width: 16px;
						height: 16px;
					}
					${css}
				</style>
			</head>
			<body>
				<a id="scroll-to-top" role="button" aria-label="scroll to top" href="#"><span class="icon"></span></a>
				${body}
			</body>
		</html>`;
        }
        async openDetails(extension, template, token) {
            const details = (0, dom_1.append)(template.content, (0, dom_1.$)('.details'));
            const readmeContainer = (0, dom_1.append)(details, (0, dom_1.$)('.readme-container'));
            const additionalDetailsContainer = (0, dom_1.append)(details, (0, dom_1.$)('.additional-details-container'));
            const layout = () => details.classList.toggle('narrow', this.dimension && this.dimension.width < 500);
            layout();
            this.contentDisposables.add((0, lifecycle_1.toDisposable)(arrays.insert(this.layoutParticipants, { layout })));
            let activeElement = null;
            const manifest = await this.extensionManifest.get().promise;
            if (manifest && manifest.extensionPack?.length && this.shallRenderAsExtensionPack(manifest)) {
                activeElement = await this.openExtensionPackReadme(manifest, readmeContainer, token);
            }
            else {
                activeElement = await this.openMarkdown(this.extensionReadme.get(), (0, nls_1.localize)('noReadme', "No README available."), readmeContainer, 0 /* WebviewIndex.Readme */, (0, nls_1.localize)('Readme title', "Readme"), token);
            }
            this.renderAdditionalDetails(additionalDetailsContainer, extension);
            return activeElement;
        }
        shallRenderAsExtensionPack(manifest) {
            return !!(manifest.categories?.some(category => category.toLowerCase() === 'extension packs'));
        }
        async openExtensionPackReadme(manifest, container, token) {
            if (token.isCancellationRequested) {
                return Promise.resolve(null);
            }
            const extensionPackReadme = (0, dom_1.append)(container, (0, dom_1.$)('div', { class: 'extension-pack-readme' }));
            extensionPackReadme.style.margin = '0 auto';
            extensionPackReadme.style.maxWidth = '882px';
            const extensionPack = (0, dom_1.append)(extensionPackReadme, (0, dom_1.$)('div', { class: 'extension-pack' }));
            if (manifest.extensionPack.length <= 3) {
                extensionPackReadme.classList.add('one-row');
            }
            else if (manifest.extensionPack.length <= 6) {
                extensionPackReadme.classList.add('two-rows');
            }
            else if (manifest.extensionPack.length <= 9) {
                extensionPackReadme.classList.add('three-rows');
            }
            else {
                extensionPackReadme.classList.add('more-rows');
            }
            const extensionPackHeader = (0, dom_1.append)(extensionPack, (0, dom_1.$)('div.header'));
            extensionPackHeader.textContent = (0, nls_1.localize)('extension pack', "Extension Pack ({0})", manifest.extensionPack.length);
            const extensionPackContent = (0, dom_1.append)(extensionPack, (0, dom_1.$)('div', { class: 'extension-pack-content' }));
            extensionPackContent.setAttribute('tabindex', '0');
            (0, dom_1.append)(extensionPack, (0, dom_1.$)('div.footer'));
            const readmeContent = (0, dom_1.append)(extensionPackReadme, (0, dom_1.$)('div.readme-content'));
            await Promise.all([
                this.renderExtensionPack(manifest, extensionPackContent, token),
                this.openMarkdown(this.extensionReadme.get(), (0, nls_1.localize)('noReadme', "No README available."), readmeContent, 0 /* WebviewIndex.Readme */, (0, nls_1.localize)('Readme title', "Readme"), token),
            ]);
            return { focus: () => extensionPackContent.focus() };
        }
        renderAdditionalDetails(container, extension) {
            const content = (0, dom_1.$)('div', { class: 'additional-details-content', tabindex: '0' });
            const scrollableContent = new scrollableElement_1.DomScrollableElement(content, {});
            const layout = () => scrollableContent.scanDomNode();
            const removeLayoutParticipant = arrays.insert(this.layoutParticipants, { layout });
            this.contentDisposables.add((0, lifecycle_1.toDisposable)(removeLayoutParticipant));
            this.contentDisposables.add(scrollableContent);
            this.renderCategories(content, extension);
            this.renderExtensionResources(content, extension);
            this.renderMoreInfo(content, extension);
            (0, dom_1.append)(container, scrollableContent.getDomNode());
            scrollableContent.scanDomNode();
        }
        renderCategories(container, extension) {
            if (extension.categories.length) {
                const categoriesContainer = (0, dom_1.append)(container, (0, dom_1.$)('.categories-container.additional-details-element'));
                (0, dom_1.append)(categoriesContainer, (0, dom_1.$)('.additional-details-title', undefined, (0, nls_1.localize)('categories', "Categories")));
                const categoriesElement = (0, dom_1.append)(categoriesContainer, (0, dom_1.$)('.categories'));
                for (const category of extension.categories) {
                    this.transientDisposables.add((0, extensionsWidgets_1.onClick)((0, dom_1.append)(categoriesElement, (0, dom_1.$)('span.category', { tabindex: '0' }, category)), () => {
                        this.paneCompositeService.openPaneComposite(extensions_2.VIEWLET_ID, 0 /* ViewContainerLocation.Sidebar */, true)
                            .then(viewlet => viewlet?.getViewPaneContainer())
                            .then(viewlet => viewlet.search(`@category:"${category}"`));
                    }));
                }
            }
        }
        renderExtensionResources(container, extension) {
            const resources = [];
            if (extension.url) {
                resources.push([(0, nls_1.localize)('Marketplace', "Marketplace"), uri_1.URI.parse(extension.url)]);
            }
            if (extension.repository) {
                try {
                    resources.push([(0, nls_1.localize)('repository', "Repository"), uri_1.URI.parse(extension.repository)]);
                }
                catch (error) { /* Ignore */ }
            }
            if (extension.url && extension.licenseUrl) {
                try {
                    resources.push([(0, nls_1.localize)('license', "License"), uri_1.URI.parse(extension.licenseUrl)]);
                }
                catch (error) { /* Ignore */ }
            }
            if (extension.publisherUrl) {
                resources.push([extension.publisherDisplayName, extension.publisherUrl]);
            }
            if (resources.length || extension.publisherSponsorLink) {
                const extensionResourcesContainer = (0, dom_1.append)(container, (0, dom_1.$)('.resources-container.additional-details-element'));
                (0, dom_1.append)(extensionResourcesContainer, (0, dom_1.$)('.additional-details-title', undefined, (0, nls_1.localize)('resources', "Extension Resources")));
                const resourcesElement = (0, dom_1.append)(extensionResourcesContainer, (0, dom_1.$)('.resources'));
                for (const [label, uri] of resources) {
                    this.transientDisposables.add((0, extensionsWidgets_1.onClick)((0, dom_1.append)(resourcesElement, (0, dom_1.$)('a.resource', { title: uri.toString(), tabindex: '0' }, label)), () => this.openerService.open(uri)));
                }
            }
        }
        renderMoreInfo(container, extension) {
            const gallery = extension.gallery;
            const moreInfoContainer = (0, dom_1.append)(container, (0, dom_1.$)('.more-info-container.additional-details-element'));
            (0, dom_1.append)(moreInfoContainer, (0, dom_1.$)('.additional-details-title', undefined, (0, nls_1.localize)('Marketplace Info', "More Info")));
            const moreInfo = (0, dom_1.append)(moreInfoContainer, (0, dom_1.$)('.more-info'));
            const toDateString = (date) => `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}, ${date.toLocaleTimeString(platform_1.language, { hourCycle: 'h23' })}`;
            if (gallery) {
                (0, dom_1.append)(moreInfo, (0, dom_1.$)('.more-info-entry', undefined, (0, dom_1.$)('div', undefined, (0, nls_1.localize)('published', "Published")), (0, dom_1.$)('div', undefined, toDateString(new Date(gallery.releaseDate)))), (0, dom_1.$)('.more-info-entry', undefined, (0, dom_1.$)('div', undefined, (0, nls_1.localize)('last released', "Last released")), (0, dom_1.$)('div', undefined, toDateString(new Date(gallery.lastUpdated)))));
            }
            if (extension.local && extension.local.installedTimestamp) {
                (0, dom_1.append)(moreInfo, (0, dom_1.$)('.more-info-entry', undefined, (0, dom_1.$)('div', undefined, (0, nls_1.localize)('last updated', "Last updated")), (0, dom_1.$)('div', undefined, toDateString(new Date(extension.local.installedTimestamp)))));
            }
            (0, dom_1.append)(moreInfo, (0, dom_1.$)('.more-info-entry', undefined, (0, dom_1.$)('div', undefined, (0, nls_1.localize)('id', "Identifier")), (0, dom_1.$)('code', undefined, extension.identifier.id)));
        }
        openChangelog(template, token) {
            return this.openMarkdown(this.extensionChangelog.get(), (0, nls_1.localize)('noChangelog', "No Changelog available."), template.content, 1 /* WebviewIndex.Changelog */, (0, nls_1.localize)('Changelog title', "Changelog"), token);
        }
        openContributions(template, token) {
            const content = (0, dom_1.$)('div.subcontent.feature-contributions', { tabindex: '0' });
            return this.loadContents(() => this.extensionManifest.get(), template.content)
                .then(manifest => {
                if (token.isCancellationRequested) {
                    return null;
                }
                if (!manifest) {
                    return content;
                }
                const scrollableContent = new scrollableElement_1.DomScrollableElement(content, {});
                const layout = () => scrollableContent.scanDomNode();
                const removeLayoutParticipant = arrays.insert(this.layoutParticipants, { layout });
                this.contentDisposables.add((0, lifecycle_1.toDisposable)(removeLayoutParticipant));
                const renders = [
                    this.renderSettings(content, manifest, layout),
                    this.renderCommands(content, manifest, layout),
                    this.renderCodeActions(content, manifest, layout),
                    this.renderLanguages(content, manifest, layout),
                    this.renderColorThemes(content, manifest, layout),
                    this.renderIconThemes(content, manifest, layout),
                    this.renderProductIconThemes(content, manifest, layout),
                    this.renderColors(content, manifest, layout),
                    this.renderJSONValidation(content, manifest, layout),
                    this.renderDebuggers(content, manifest, layout),
                    this.renderViewContainers(content, manifest, layout),
                    this.renderViews(content, manifest, layout),
                    this.renderLocalizations(content, manifest, layout),
                    this.renderCustomEditors(content, manifest, layout),
                    this.renderNotebooks(content, manifest, layout),
                    this.renderNotebookRenderers(content, manifest, layout),
                    this.renderAuthentication(content, manifest, layout),
                    this.renderActivationEvents(content, manifest, layout),
                ];
                scrollableContent.scanDomNode();
                const isEmpty = !renders.some(x => x);
                if (isEmpty) {
                    (0, dom_1.append)(content, (0, dom_1.$)('p.nocontent')).textContent = (0, nls_1.localize)('noContributions', "No Contributions");
                    (0, dom_1.append)(template.content, content);
                }
                else {
                    (0, dom_1.append)(template.content, scrollableContent.getDomNode());
                    this.contentDisposables.add(scrollableContent);
                }
                return content;
            }, () => {
                if (token.isCancellationRequested) {
                    return null;
                }
                (0, dom_1.append)(content, (0, dom_1.$)('p.nocontent')).textContent = (0, nls_1.localize)('noContributions', "No Contributions");
                (0, dom_1.append)(template.content, content);
                return content;
            });
        }
        openExtensionDependencies(extension, template, token) {
            if (token.isCancellationRequested) {
                return Promise.resolve(null);
            }
            if (arrays.isFalsyOrEmpty(extension.dependencies)) {
                (0, dom_1.append)(template.content, (0, dom_1.$)('p.nocontent')).textContent = (0, nls_1.localize)('noDependencies', "No Dependencies");
                return Promise.resolve(template.content);
            }
            const content = (0, dom_1.$)('div', { class: 'subcontent' });
            const scrollableContent = new scrollableElement_1.DomScrollableElement(content, {});
            (0, dom_1.append)(template.content, scrollableContent.getDomNode());
            this.contentDisposables.add(scrollableContent);
            const dependenciesTree = this.instantiationService.createInstance(extensionsViewer_1.ExtensionsTree, new extensionsViewer_1.ExtensionData(extension, null, extension => extension.dependencies || [], this.extensionsWorkbenchService), content, {
                listBackground: colorRegistry_1.editorBackground
            });
            const layout = () => {
                scrollableContent.scanDomNode();
                const scrollDimensions = scrollableContent.getScrollDimensions();
                dependenciesTree.layout(scrollDimensions.height);
            };
            const removeLayoutParticipant = arrays.insert(this.layoutParticipants, { layout });
            this.contentDisposables.add((0, lifecycle_1.toDisposable)(removeLayoutParticipant));
            this.contentDisposables.add(dependenciesTree);
            scrollableContent.scanDomNode();
            return Promise.resolve({ focus() { dependenciesTree.domFocus(); } });
        }
        async openExtensionPack(extension, template, token) {
            if (token.isCancellationRequested) {
                return Promise.resolve(null);
            }
            const manifest = await this.loadContents(() => this.extensionManifest.get(), template.content);
            if (token.isCancellationRequested) {
                return null;
            }
            if (!manifest) {
                return null;
            }
            return this.renderExtensionPack(manifest, template.content, token);
        }
        async openRuntimeStatus(extension, template, token) {
            const content = (0, dom_1.$)('div', { class: 'subcontent', tabindex: '0' });
            const scrollableContent = new scrollableElement_1.DomScrollableElement(content, {});
            const layout = () => scrollableContent.scanDomNode();
            const removeLayoutParticipant = arrays.insert(this.layoutParticipants, { layout });
            this.contentDisposables.add((0, lifecycle_1.toDisposable)(removeLayoutParticipant));
            const updateContent = () => {
                scrollableContent.scanDomNode();
                (0, dom_1.reset)(content, this.renderRuntimeStatus(extension, layout));
            };
            updateContent();
            this.extensionService.onDidChangeExtensionsStatus(e => {
                if (e.some(extensionIdentifier => (0, extensionManagementUtil_1.areSameExtensions)({ id: extensionIdentifier.value }, extension.identifier))) {
                    updateContent();
                }
            }, this, this.contentDisposables);
            this.contentDisposables.add(scrollableContent);
            (0, dom_1.append)(template.content, scrollableContent.getDomNode());
            return content;
        }
        renderRuntimeStatus(extension, onDetailsToggle) {
            const extensionStatus = this.extensionsWorkbenchService.getExtensionStatus(extension);
            const element = (0, dom_1.$)('.runtime-status');
            if (extensionStatus?.activationTimes) {
                const activationTime = extensionStatus.activationTimes.codeLoadingTime + extensionStatus.activationTimes.activateCallTime;
                const activationElement = (0, dom_1.append)(element, (0, dom_1.$)('div.activation-details'));
                const activationReasonElement = (0, dom_1.append)(activationElement, (0, dom_1.$)('div.activation-element-entry'));
                (0, dom_1.append)(activationReasonElement, (0, dom_1.$)('span.activation-message-title', undefined, (0, nls_1.localize)('activation reason', "Activation Event:")));
                (0, dom_1.append)(activationReasonElement, (0, dom_1.$)('code', undefined, extensionStatus.activationTimes.activationReason.startup ? (0, nls_1.localize)('startup', "Startup") : extensionStatus.activationTimes.activationReason.activationEvent));
                const activationTimeElement = (0, dom_1.append)(activationElement, (0, dom_1.$)('div.activation-element-entry'));
                (0, dom_1.append)(activationTimeElement, (0, dom_1.$)('span.activation-message-title', undefined, (0, nls_1.localize)('activation time', "Activation Time:")));
                (0, dom_1.append)(activationTimeElement, (0, dom_1.$)('code', undefined, `${activationTime}ms`));
                if (extensions_1.ExtensionIdentifier.toKey(extensionStatus.activationTimes.activationReason.extensionId) !== extensions_1.ExtensionIdentifier.toKey(extension.identifier.id)) {
                    const activatedByElement = (0, dom_1.append)(activationElement, (0, dom_1.$)('div.activation-element-entry'));
                    (0, dom_1.append)(activatedByElement, (0, dom_1.$)('span.activation-message-title', undefined, (0, nls_1.localize)('activatedBy', "Activated By:")));
                    (0, dom_1.append)(activatedByElement, (0, dom_1.$)('span', undefined, extensionStatus.activationTimes.activationReason.extensionId.value));
                }
            }
            else if (extension.local && (extension.local.manifest.main || extension.local.manifest.browser)) {
                (0, dom_1.append)(element, (0, dom_1.$)('div.activation-message', undefined, (0, nls_1.localize)('not yet activated', "Not yet activated.")));
            }
            if (extensionStatus?.runtimeErrors.length) {
                (0, dom_1.append)(element, (0, dom_1.$)('details', { open: true, ontoggle: onDetailsToggle }, (0, dom_1.$)('summary', { tabindex: '0' }, (0, nls_1.localize)('uncaught errors', "Uncaught Errors ({0})", extensionStatus.runtimeErrors.length)), (0, dom_1.$)('div', undefined, ...extensionStatus.runtimeErrors.map(error => (0, dom_1.$)('div.message-entry', undefined, (0, dom_1.$)(`span${themables_1.ThemeIcon.asCSSSelector(extensionsIcons_1.errorIcon)}`, undefined), (0, dom_1.$)('span', undefined, (0, errors_1.getErrorMessage)(error)))))));
            }
            if (extensionStatus?.messages.length) {
                (0, dom_1.append)(element, (0, dom_1.$)('details', { open: true, ontoggle: onDetailsToggle }, (0, dom_1.$)('summary', { tabindex: '0' }, (0, nls_1.localize)('messages', "Messages ({0})", extensionStatus?.messages.length)), (0, dom_1.$)('div', undefined, ...extensionStatus.messages.sort((a, b) => b.type - a.type)
                    .map(message => (0, dom_1.$)('div.message-entry', undefined, (0, dom_1.$)(`span${themables_1.ThemeIcon.asCSSSelector(message.type === notification_1.Severity.Error ? extensionsIcons_1.errorIcon : message.type === notification_1.Severity.Warning ? extensionsIcons_1.warningIcon : extensionsIcons_1.infoIcon)}`, undefined), (0, dom_1.$)('span', undefined, message.message))))));
            }
            if (element.children.length === 0) {
                (0, dom_1.append)(element, (0, dom_1.$)('div.no-status-message')).textContent = (0, nls_1.localize)('noStatus', "No status available.");
            }
            return element;
        }
        async renderExtensionPack(manifest, parent, token) {
            if (token.isCancellationRequested) {
                return null;
            }
            const content = (0, dom_1.$)('div', { class: 'subcontent' });
            const scrollableContent = new scrollableElement_1.DomScrollableElement(content, { useShadows: false });
            (0, dom_1.append)(parent, scrollableContent.getDomNode());
            const extensionsGridView = this.instantiationService.createInstance(extensionsViewer_1.ExtensionsGridView, content, new extensionsList_1.Delegate());
            const extensions = await (0, extensionsViewer_1.getExtensions)(manifest.extensionPack, this.extensionsWorkbenchService);
            extensionsGridView.setExtensions(extensions);
            scrollableContent.scanDomNode();
            this.contentDisposables.add(scrollableContent);
            this.contentDisposables.add(extensionsGridView);
            this.contentDisposables.add((0, lifecycle_1.toDisposable)(arrays.insert(this.layoutParticipants, { layout: () => scrollableContent.scanDomNode() })));
            return content;
        }
        renderSettings(container, manifest, onDetailsToggle) {
            const configuration = manifest.contributes?.configuration;
            let properties = {};
            if (Array.isArray(configuration)) {
                configuration.forEach(config => {
                    properties = { ...properties, ...config.properties };
                });
            }
            else if (configuration) {
                properties = configuration.properties;
            }
            let contrib = properties ? Object.keys(properties) : [];
            // filter deprecated settings
            contrib = contrib.filter(key => {
                const config = properties[key];
                return !config.deprecationMessage && !config.markdownDeprecationMessage;
            });
            if (!contrib.length) {
                return false;
            }
            const details = (0, dom_1.$)('details', { open: true, ontoggle: onDetailsToggle }, (0, dom_1.$)('summary', { tabindex: '0' }, (0, nls_1.localize)('settings', "Settings ({0})", contrib.length)), (0, dom_1.$)('table', undefined, (0, dom_1.$)('tr', undefined, (0, dom_1.$)('th', undefined, (0, nls_1.localize)('setting name', "ID")), (0, dom_1.$)('th', undefined, (0, nls_1.localize)('description', "Description")), (0, dom_1.$)('th', undefined, (0, nls_1.localize)('default', "Default"))), ...contrib.map(key => {
                let description = properties[key].description || '';
                if (properties[key].markdownDescription) {
                    const { element, dispose } = (0, markdownRenderer_1.renderMarkdown)({ value: properties[key].markdownDescription }, { actionHandler: { callback: (content) => this.openerService.open(content).catch(errors_1.onUnexpectedError), disposables: this.contentDisposables } });
                    description = element;
                    this.contentDisposables.add((0, lifecycle_1.toDisposable)(dispose));
                }
                return (0, dom_1.$)('tr', undefined, (0, dom_1.$)('td', undefined, (0, dom_1.$)('code', undefined, key)), (0, dom_1.$)('td', undefined, description), (0, dom_1.$)('td', undefined, (0, dom_1.$)('code', undefined, `${(0, types_1.isUndefined)(properties[key].default) ? (0, configurationRegistry_1.getDefaultValue)(properties[key].type) : properties[key].default}`)));
            })));
            (0, dom_1.append)(container, details);
            return true;
        }
        renderDebuggers(container, manifest, onDetailsToggle) {
            const contrib = manifest.contributes?.debuggers || [];
            if (!contrib.length) {
                return false;
            }
            const details = (0, dom_1.$)('details', { open: true, ontoggle: onDetailsToggle }, (0, dom_1.$)('summary', { tabindex: '0' }, (0, nls_1.localize)('debuggers', "Debuggers ({0})", contrib.length)), (0, dom_1.$)('table', undefined, (0, dom_1.$)('tr', undefined, (0, dom_1.$)('th', undefined, (0, nls_1.localize)('debugger name', "Name")), (0, dom_1.$)('th', undefined, (0, nls_1.localize)('debugger type', "Type"))), ...contrib.map(d => (0, dom_1.$)('tr', undefined, (0, dom_1.$)('td', undefined, d.label), (0, dom_1.$)('td', undefined, d.type)))));
            (0, dom_1.append)(container, details);
            return true;
        }
        renderViewContainers(container, manifest, onDetailsToggle) {
            const contrib = manifest.contributes?.viewsContainers || {};
            const viewContainers = Object.keys(contrib).reduce((result, location) => {
                const viewContainersForLocation = contrib[location];
                result.push(...viewContainersForLocation.map(viewContainer => ({ ...viewContainer, location })));
                return result;
            }, []);
            if (!viewContainers.length) {
                return false;
            }
            const details = (0, dom_1.$)('details', { open: true, ontoggle: onDetailsToggle }, (0, dom_1.$)('summary', { tabindex: '0' }, (0, nls_1.localize)('viewContainers', "View Containers ({0})", viewContainers.length)), (0, dom_1.$)('table', undefined, (0, dom_1.$)('tr', undefined, (0, dom_1.$)('th', undefined, (0, nls_1.localize)('view container id', "ID")), (0, dom_1.$)('th', undefined, (0, nls_1.localize)('view container title', "Title")), (0, dom_1.$)('th', undefined, (0, nls_1.localize)('view container location', "Where"))), ...viewContainers.map(viewContainer => (0, dom_1.$)('tr', undefined, (0, dom_1.$)('td', undefined, viewContainer.id), (0, dom_1.$)('td', undefined, viewContainer.title), (0, dom_1.$)('td', undefined, viewContainer.location)))));
            (0, dom_1.append)(container, details);
            return true;
        }
        renderViews(container, manifest, onDetailsToggle) {
            const contrib = manifest.contributes?.views || {};
            const views = Object.keys(contrib).reduce((result, location) => {
                const viewsForLocation = contrib[location];
                result.push(...viewsForLocation.map(view => ({ ...view, location })));
                return result;
            }, []);
            if (!views.length) {
                return false;
            }
            const details = (0, dom_1.$)('details', { open: true, ontoggle: onDetailsToggle }, (0, dom_1.$)('summary', { tabindex: '0' }, (0, nls_1.localize)('views', "Views ({0})", views.length)), (0, dom_1.$)('table', undefined, (0, dom_1.$)('tr', undefined, (0, dom_1.$)('th', undefined, (0, nls_1.localize)('view id', "ID")), (0, dom_1.$)('th', undefined, (0, nls_1.localize)('view name', "Name")), (0, dom_1.$)('th', undefined, (0, nls_1.localize)('view location', "Where"))), ...views.map(view => (0, dom_1.$)('tr', undefined, (0, dom_1.$)('td', undefined, view.id), (0, dom_1.$)('td', undefined, view.name), (0, dom_1.$)('td', undefined, view.location)))));
            (0, dom_1.append)(container, details);
            return true;
        }
        renderLocalizations(container, manifest, onDetailsToggle) {
            const localizations = manifest.contributes?.localizations || [];
            if (!localizations.length) {
                return false;
            }
            const details = (0, dom_1.$)('details', { open: true, ontoggle: onDetailsToggle }, (0, dom_1.$)('summary', { tabindex: '0' }, (0, nls_1.localize)('localizations', "Localizations ({0})", localizations.length)), (0, dom_1.$)('table', undefined, (0, dom_1.$)('tr', undefined, (0, dom_1.$)('th', undefined, (0, nls_1.localize)('localizations language id', "Language ID")), (0, dom_1.$)('th', undefined, (0, nls_1.localize)('localizations language name', "Language Name")), (0, dom_1.$)('th', undefined, (0, nls_1.localize)('localizations localized language name', "Language Name (Localized)"))), ...localizations.map(localization => (0, dom_1.$)('tr', undefined, (0, dom_1.$)('td', undefined, localization.languageId), (0, dom_1.$)('td', undefined, localization.languageName || ''), (0, dom_1.$)('td', undefined, localization.localizedLanguageName || '')))));
            (0, dom_1.append)(container, details);
            return true;
        }
        renderCustomEditors(container, manifest, onDetailsToggle) {
            const webviewEditors = manifest.contributes?.customEditors || [];
            if (!webviewEditors.length) {
                return false;
            }
            const details = (0, dom_1.$)('details', { open: true, ontoggle: onDetailsToggle }, (0, dom_1.$)('summary', { tabindex: '0' }, (0, nls_1.localize)('customEditors', "Custom Editors ({0})", webviewEditors.length)), (0, dom_1.$)('table', undefined, (0, dom_1.$)('tr', undefined, (0, dom_1.$)('th', undefined, (0, nls_1.localize)('customEditors view type', "View Type")), (0, dom_1.$)('th', undefined, (0, nls_1.localize)('customEditors priority', "Priority")), (0, dom_1.$)('th', undefined, (0, nls_1.localize)('customEditors filenamePattern', "Filename Pattern"))), ...webviewEditors.map(webviewEditor => (0, dom_1.$)('tr', undefined, (0, dom_1.$)('td', undefined, webviewEditor.viewType), (0, dom_1.$)('td', undefined, webviewEditor.priority), (0, dom_1.$)('td', undefined, arrays.coalesce(webviewEditor.selector.map(x => x.filenamePattern)).join(', '))))));
            (0, dom_1.append)(container, details);
            return true;
        }
        renderCodeActions(container, manifest, onDetailsToggle) {
            const codeActions = manifest.contributes?.codeActions || [];
            if (!codeActions.length) {
                return false;
            }
            const flatActions = arrays.flatten(codeActions.map(contribution => contribution.actions.map(action => ({ ...action, languages: contribution.languages }))));
            const details = (0, dom_1.$)('details', { open: true, ontoggle: onDetailsToggle }, (0, dom_1.$)('summary', { tabindex: '0' }, (0, nls_1.localize)('codeActions', "Code Actions ({0})", flatActions.length)), (0, dom_1.$)('table', undefined, (0, dom_1.$)('tr', undefined, (0, dom_1.$)('th', undefined, (0, nls_1.localize)('codeActions.title', "Title")), (0, dom_1.$)('th', undefined, (0, nls_1.localize)('codeActions.kind', "Kind")), (0, dom_1.$)('th', undefined, (0, nls_1.localize)('codeActions.description', "Description")), (0, dom_1.$)('th', undefined, (0, nls_1.localize)('codeActions.languages', "Languages"))), ...flatActions.map(action => (0, dom_1.$)('tr', undefined, (0, dom_1.$)('td', undefined, action.title), (0, dom_1.$)('td', undefined, (0, dom_1.$)('code', undefined, action.kind)), (0, dom_1.$)('td', undefined, action.description ?? ''), (0, dom_1.$)('td', undefined, ...action.languages.map(language => (0, dom_1.$)('code', undefined, language)))))));
            (0, dom_1.append)(container, details);
            return true;
        }
        renderAuthentication(container, manifest, onDetailsToggle) {
            const authentication = manifest.contributes?.authentication || [];
            if (!authentication.length) {
                return false;
            }
            const details = (0, dom_1.$)('details', { open: true, ontoggle: onDetailsToggle }, (0, dom_1.$)('summary', { tabindex: '0' }, (0, nls_1.localize)('authentication', "Authentication ({0})", authentication.length)), (0, dom_1.$)('table', undefined, (0, dom_1.$)('tr', undefined, (0, dom_1.$)('th', undefined, (0, nls_1.localize)('authentication.label', "Label")), (0, dom_1.$)('th', undefined, (0, nls_1.localize)('authentication.id', "ID"))), ...authentication.map(action => (0, dom_1.$)('tr', undefined, (0, dom_1.$)('td', undefined, action.label), (0, dom_1.$)('td', undefined, action.id)))));
            (0, dom_1.append)(container, details);
            return true;
        }
        renderColorThemes(container, manifest, onDetailsToggle) {
            const contrib = manifest.contributes?.themes || [];
            if (!contrib.length) {
                return false;
            }
            const details = (0, dom_1.$)('details', { open: true, ontoggle: onDetailsToggle }, (0, dom_1.$)('summary', { tabindex: '0' }, (0, nls_1.localize)('colorThemes', "Color Themes ({0})", contrib.length)), (0, dom_1.$)('ul', undefined, ...contrib.map(theme => (0, dom_1.$)('li', undefined, theme.label))));
            (0, dom_1.append)(container, details);
            return true;
        }
        renderIconThemes(container, manifest, onDetailsToggle) {
            const contrib = manifest.contributes?.iconThemes || [];
            if (!contrib.length) {
                return false;
            }
            const details = (0, dom_1.$)('details', { open: true, ontoggle: onDetailsToggle }, (0, dom_1.$)('summary', { tabindex: '0' }, (0, nls_1.localize)('iconThemes', "File Icon Themes ({0})", contrib.length)), (0, dom_1.$)('ul', undefined, ...contrib.map(theme => (0, dom_1.$)('li', undefined, theme.label))));
            (0, dom_1.append)(container, details);
            return true;
        }
        renderProductIconThemes(container, manifest, onDetailsToggle) {
            const contrib = manifest.contributes?.productIconThemes || [];
            if (!contrib.length) {
                return false;
            }
            const details = (0, dom_1.$)('details', { open: true, ontoggle: onDetailsToggle }, (0, dom_1.$)('summary', { tabindex: '0' }, (0, nls_1.localize)('productThemes', "Product Icon Themes ({0})", contrib.length)), (0, dom_1.$)('ul', undefined, ...contrib.map(theme => (0, dom_1.$)('li', undefined, theme.label))));
            (0, dom_1.append)(container, details);
            return true;
        }
        renderColors(container, manifest, onDetailsToggle) {
            const colors = manifest.contributes?.colors || [];
            if (!colors.length) {
                return false;
            }
            function colorPreview(colorReference) {
                const result = [];
                if (colorReference && colorReference[0] === '#') {
                    const color = color_1.Color.fromHex(colorReference);
                    if (color) {
                        result.push((0, dom_1.$)('span', { class: 'colorBox', style: 'background-color: ' + color_1.Color.Format.CSS.format(color) }, ''));
                    }
                }
                result.push((0, dom_1.$)('code', undefined, colorReference));
                return result;
            }
            const details = (0, dom_1.$)('details', { open: true, ontoggle: onDetailsToggle }, (0, dom_1.$)('summary', { tabindex: '0' }, (0, nls_1.localize)('colors', "Colors ({0})", colors.length)), (0, dom_1.$)('table', undefined, (0, dom_1.$)('tr', undefined, (0, dom_1.$)('th', undefined, (0, nls_1.localize)('colorId', "ID")), (0, dom_1.$)('th', undefined, (0, nls_1.localize)('description', "Description")), (0, dom_1.$)('th', undefined, (0, nls_1.localize)('defaultDark', "Dark Default")), (0, dom_1.$)('th', undefined, (0, nls_1.localize)('defaultLight', "Light Default")), (0, dom_1.$)('th', undefined, (0, nls_1.localize)('defaultHC', "High Contrast Default"))), ...colors.map(color => (0, dom_1.$)('tr', undefined, (0, dom_1.$)('td', undefined, (0, dom_1.$)('code', undefined, color.id)), (0, dom_1.$)('td', undefined, color.description), (0, dom_1.$)('td', undefined, ...colorPreview(color.defaults.dark)), (0, dom_1.$)('td', undefined, ...colorPreview(color.defaults.light)), (0, dom_1.$)('td', undefined, ...colorPreview(color.defaults.highContrast))))));
            (0, dom_1.append)(container, details);
            return true;
        }
        renderJSONValidation(container, manifest, onDetailsToggle) {
            const contrib = manifest.contributes?.jsonValidation || [];
            if (!contrib.length) {
                return false;
            }
            const details = (0, dom_1.$)('details', { open: true, ontoggle: onDetailsToggle }, (0, dom_1.$)('summary', { tabindex: '0' }, (0, nls_1.localize)('JSON Validation', "JSON Validation ({0})", contrib.length)), (0, dom_1.$)('table', undefined, (0, dom_1.$)('tr', undefined, (0, dom_1.$)('th', undefined, (0, nls_1.localize)('fileMatch', "File Match")), (0, dom_1.$)('th', undefined, (0, nls_1.localize)('schema', "Schema"))), ...contrib.map(v => (0, dom_1.$)('tr', undefined, (0, dom_1.$)('td', undefined, (0, dom_1.$)('code', undefined, Array.isArray(v.fileMatch) ? v.fileMatch.join(', ') : v.fileMatch)), (0, dom_1.$)('td', undefined, v.url)))));
            (0, dom_1.append)(container, details);
            return true;
        }
        renderCommands(container, manifest, onDetailsToggle) {
            const rawCommands = manifest.contributes?.commands || [];
            const commands = rawCommands.map(c => ({
                id: c.command,
                title: c.title,
                keybindings: [],
                menus: []
            }));
            const byId = arrays.index(commands, c => c.id);
            const menus = manifest.contributes?.menus || {};
            for (const context in menus) {
                for (const menu of menus[context]) {
                    if (menu.command) {
                        let command = byId[menu.command];
                        if (command) {
                            command.menus.push(context);
                        }
                        else {
                            command = { id: menu.command, title: '', keybindings: [], menus: [context] };
                            byId[command.id] = command;
                            commands.push(command);
                        }
                    }
                }
            }
            const rawKeybindings = manifest.contributes?.keybindings ? (Array.isArray(manifest.contributes.keybindings) ? manifest.contributes.keybindings : [manifest.contributes.keybindings]) : [];
            rawKeybindings.forEach(rawKeybinding => {
                const keybinding = this.resolveKeybinding(rawKeybinding);
                if (!keybinding) {
                    return;
                }
                let command = byId[rawKeybinding.command];
                if (command) {
                    command.keybindings.push(keybinding);
                }
                else {
                    command = { id: rawKeybinding.command, title: '', keybindings: [keybinding], menus: [] };
                    byId[command.id] = command;
                    commands.push(command);
                }
            });
            if (!commands.length) {
                return false;
            }
            const renderKeybinding = (keybinding) => {
                const element = (0, dom_1.$)('');
                const kbl = new keybindingLabel_1.KeybindingLabel(element, platform_1.OS, defaultStyles_1.defaultKeybindingLabelStyles);
                kbl.set(keybinding);
                return element;
            };
            const details = (0, dom_1.$)('details', { open: true, ontoggle: onDetailsToggle }, (0, dom_1.$)('summary', { tabindex: '0' }, (0, nls_1.localize)('commands', "Commands ({0})", commands.length)), (0, dom_1.$)('table', undefined, (0, dom_1.$)('tr', undefined, (0, dom_1.$)('th', undefined, (0, nls_1.localize)('command name', "ID")), (0, dom_1.$)('th', undefined, (0, nls_1.localize)('command title', "Title")), (0, dom_1.$)('th', undefined, (0, nls_1.localize)('keyboard shortcuts', "Keyboard Shortcuts")), (0, dom_1.$)('th', undefined, (0, nls_1.localize)('menuContexts', "Menu Contexts"))), ...commands.map(c => (0, dom_1.$)('tr', undefined, (0, dom_1.$)('td', undefined, (0, dom_1.$)('code', undefined, c.id)), (0, dom_1.$)('td', undefined, typeof c.title === 'string' ? c.title : c.title.value), (0, dom_1.$)('td', undefined, ...c.keybindings.map(keybinding => renderKeybinding(keybinding))), (0, dom_1.$)('td', undefined, ...c.menus.map(context => (0, dom_1.$)('code', undefined, context)))))));
            (0, dom_1.append)(container, details);
            return true;
        }
        renderLanguages(container, manifest, onDetailsToggle) {
            const contributes = manifest.contributes;
            const rawLanguages = contributes?.languages || [];
            const languages = rawLanguages.map(l => ({
                id: l.id,
                name: (l.aliases || [])[0] || l.id,
                extensions: l.extensions || [],
                hasGrammar: false,
                hasSnippets: false
            }));
            const byId = arrays.index(languages, l => l.id);
            const grammars = contributes?.grammars || [];
            grammars.forEach(grammar => {
                let language = byId[grammar.language];
                if (language) {
                    language.hasGrammar = true;
                }
                else {
                    language = { id: grammar.language, name: grammar.language, extensions: [], hasGrammar: true, hasSnippets: false };
                    byId[language.id] = language;
                    languages.push(language);
                }
            });
            const snippets = contributes?.snippets || [];
            snippets.forEach(snippet => {
                let language = byId[snippet.language];
                if (language) {
                    language.hasSnippets = true;
                }
                else {
                    language = { id: snippet.language, name: snippet.language, extensions: [], hasGrammar: false, hasSnippets: true };
                    byId[language.id] = language;
                    languages.push(language);
                }
            });
            if (!languages.length) {
                return false;
            }
            const details = (0, dom_1.$)('details', { open: true, ontoggle: onDetailsToggle }, (0, dom_1.$)('summary', { tabindex: '0' }, (0, nls_1.localize)('languages', "Languages ({0})", languages.length)), (0, dom_1.$)('table', undefined, (0, dom_1.$)('tr', undefined, (0, dom_1.$)('th', undefined, (0, nls_1.localize)('language id', "ID")), (0, dom_1.$)('th', undefined, (0, nls_1.localize)('language name', "Name")), (0, dom_1.$)('th', undefined, (0, nls_1.localize)('file extensions', "File Extensions")), (0, dom_1.$)('th', undefined, (0, nls_1.localize)('grammar', "Grammar")), (0, dom_1.$)('th', undefined, (0, nls_1.localize)('snippets', "Snippets"))), ...languages.map(l => (0, dom_1.$)('tr', undefined, (0, dom_1.$)('td', undefined, l.id), (0, dom_1.$)('td', undefined, l.name), (0, dom_1.$)('td', undefined, ...(0, dom_1.join)(l.extensions.map(ext => (0, dom_1.$)('code', undefined, ext)), ' ')), (0, dom_1.$)('td', undefined, document.createTextNode(l.hasGrammar ? '✔︎' : '\u2014')), (0, dom_1.$)('td', undefined, document.createTextNode(l.hasSnippets ? '✔︎' : '\u2014'))))));
            (0, dom_1.append)(container, details);
            return true;
        }
        renderActivationEvents(container, manifest, onDetailsToggle) {
            const activationEvents = manifest.activationEvents || [];
            if (!activationEvents.length) {
                return false;
            }
            const details = (0, dom_1.$)('details', { open: true, ontoggle: onDetailsToggle }, (0, dom_1.$)('summary', { tabindex: '0' }, (0, nls_1.localize)('activation events', "Activation Events ({0})", activationEvents.length)), (0, dom_1.$)('ul', undefined, ...activationEvents.map(activationEvent => (0, dom_1.$)('li', undefined, (0, dom_1.$)('code', undefined, activationEvent)))));
            (0, dom_1.append)(container, details);
            return true;
        }
        renderNotebooks(container, manifest, onDetailsToggle) {
            const contrib = manifest.contributes?.notebooks || [];
            if (!contrib.length) {
                return false;
            }
            const details = (0, dom_1.$)('details', { open: true, ontoggle: onDetailsToggle }, (0, dom_1.$)('summary', { tabindex: '0' }, (0, nls_1.localize)('Notebooks', "Notebooks ({0})", contrib.length)), (0, dom_1.$)('table', undefined, (0, dom_1.$)('tr', undefined, (0, dom_1.$)('th', undefined, (0, nls_1.localize)('Notebook id', "ID")), (0, dom_1.$)('th', undefined, (0, nls_1.localize)('Notebook name', "Name"))), ...contrib.map(d => (0, dom_1.$)('tr', undefined, (0, dom_1.$)('td', undefined, d.type), (0, dom_1.$)('td', undefined, d.displayName)))));
            (0, dom_1.append)(container, details);
            return true;
        }
        renderNotebookRenderers(container, manifest, onDetailsToggle) {
            const contrib = manifest.contributes?.notebookRenderer || [];
            if (!contrib.length) {
                return false;
            }
            const details = (0, dom_1.$)('details', { open: true, ontoggle: onDetailsToggle }, (0, dom_1.$)('summary', { tabindex: '0' }, (0, nls_1.localize)('NotebookRenderers', "Notebook Renderers ({0})", contrib.length)), (0, dom_1.$)('table', undefined, (0, dom_1.$)('tr', undefined, (0, dom_1.$)('th', undefined, (0, nls_1.localize)('Notebook renderer name', "Name")), (0, dom_1.$)('th', undefined, (0, nls_1.localize)('Notebook mimetypes', "Mimetypes"))), ...contrib.map(d => (0, dom_1.$)('tr', undefined, (0, dom_1.$)('td', undefined, d.displayName), (0, dom_1.$)('td', undefined, d.mimeTypes.join(','))))));
            (0, dom_1.append)(container, details);
            return true;
        }
        resolveKeybinding(rawKeyBinding) {
            let key;
            switch (process_1.platform) {
                case 'win32':
                    key = rawKeyBinding.win;
                    break;
                case 'linux':
                    key = rawKeyBinding.linux;
                    break;
                case 'darwin':
                    key = rawKeyBinding.mac;
                    break;
            }
            return this.keybindingService.resolveUserBinding(key || rawKeyBinding.key)[0];
        }
        loadContents(loadingTask, container) {
            container.classList.add('loading');
            const result = this.contentDisposables.add(loadingTask());
            const onDone = () => container.classList.remove('loading');
            result.promise.then(onDone, onDone);
            return result.promise;
        }
        layout(dimension) {
            this.dimension = dimension;
            this.layoutParticipants.forEach(p => p.layout());
        }
        onError(err) {
            if ((0, errors_1.isCancellationError)(err)) {
                return;
            }
            this.notificationService.error(err);
        }
    };
    exports.ExtensionEditor = ExtensionEditor;
    exports.ExtensionEditor = ExtensionEditor = ExtensionEditor_1 = __decorate([
        __param(0, telemetry_1.ITelemetryService),
        __param(1, instantiation_1.IInstantiationService),
        __param(2, panecomposite_1.IPaneCompositePartService),
        __param(3, extensions_2.IExtensionsWorkbenchService),
        __param(4, extensionManagement_1.IExtensionGalleryService),
        __param(5, themeService_1.IThemeService),
        __param(6, keybinding_1.IKeybindingService),
        __param(7, notification_1.INotificationService),
        __param(8, opener_1.IOpenerService),
        __param(9, extensionRecommendations_1.IExtensionRecommendationsService),
        __param(10, storage_1.IStorageService),
        __param(11, extensions_3.IExtensionService),
        __param(12, webview_1.IWebviewService),
        __param(13, language_1.ILanguageService),
        __param(14, contextView_1.IContextMenuService),
        __param(15, contextkey_1.IContextKeyService)
    ], ExtensionEditor);
    const contextKeyExpr = contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.equals('activeEditor', ExtensionEditor.ID), editorContextKeys_1.EditorContextKeys.focus.toNegated());
    (0, actions_2.registerAction2)(class ShowExtensionEditorFindAction extends actions_2.Action2 {
        constructor() {
            super({
                id: 'editor.action.extensioneditor.showfind',
                title: (0, nls_1.localize)('find', "Find"),
                keybinding: {
                    when: contextKeyExpr,
                    weight: 100 /* KeybindingWeight.EditorContrib */,
                    primary: 2048 /* KeyMod.CtrlCmd */ | 36 /* KeyCode.KeyF */,
                }
            });
        }
        run(accessor) {
            const extensionEditor = getExtensionEditor(accessor);
            extensionEditor?.showFind();
        }
    });
    (0, actions_2.registerAction2)(class StartExtensionEditorFindNextAction extends actions_2.Action2 {
        constructor() {
            super({
                id: 'editor.action.extensioneditor.findNext',
                title: (0, nls_1.localize)('find next', "Find Next"),
                keybinding: {
                    when: contextkey_1.ContextKeyExpr.and(contextKeyExpr, webview_1.KEYBINDING_CONTEXT_WEBVIEW_FIND_WIDGET_FOCUSED),
                    primary: 3 /* KeyCode.Enter */,
                    weight: 100 /* KeybindingWeight.EditorContrib */
                }
            });
        }
        run(accessor) {
            const extensionEditor = getExtensionEditor(accessor);
            extensionEditor?.runFindAction(false);
        }
    });
    (0, actions_2.registerAction2)(class StartExtensionEditorFindPreviousAction extends actions_2.Action2 {
        constructor() {
            super({
                id: 'editor.action.extensioneditor.findPrevious',
                title: (0, nls_1.localize)('find previous', "Find Previous"),
                keybinding: {
                    when: contextkey_1.ContextKeyExpr.and(contextKeyExpr, webview_1.KEYBINDING_CONTEXT_WEBVIEW_FIND_WIDGET_FOCUSED),
                    primary: 1024 /* KeyMod.Shift */ | 3 /* KeyCode.Enter */,
                    weight: 100 /* KeybindingWeight.EditorContrib */
                }
            });
        }
        run(accessor) {
            const extensionEditor = getExtensionEditor(accessor);
            extensionEditor?.runFindAction(true);
        }
    });
    (0, themeService_1.registerThemingParticipant)((theme, collector) => {
        const link = theme.getColor(colorRegistry_1.textLinkForeground);
        if (link) {
            collector.addRule(`.monaco-workbench .extension-editor .content .details .additional-details-container .resources-container a.resource { color: ${link}; }`);
            collector.addRule(`.monaco-workbench .extension-editor .content .feature-contributions a { color: ${link}; }`);
        }
        const activeLink = theme.getColor(colorRegistry_1.textLinkActiveForeground);
        if (activeLink) {
            collector.addRule(`.monaco-workbench .extension-editor .content .details .additional-details-container .resources-container a.resource:hover,
			.monaco-workbench .extension-editor .content .details .additional-details-container .resources-container a.resource:active { color: ${activeLink}; }`);
            collector.addRule(`.monaco-workbench .extension-editor .content .feature-contributions a:hover,
			.monaco-workbench .extension-editor .content .feature-contributions a:active { color: ${activeLink}; }`);
        }
        const buttonHoverBackgroundColor = theme.getColor(colorRegistry_1.buttonHoverBackground);
        if (buttonHoverBackgroundColor) {
            collector.addRule(`.monaco-workbench .extension-editor .content > .details > .additional-details-container .categories-container > .categories > .category:hover { background-color: ${buttonHoverBackgroundColor}; border-color: ${buttonHoverBackgroundColor}; }`);
            collector.addRule(`.monaco-workbench .extension-editor .content > .details > .additional-details-container .tags-container > .tags > .tag:hover { background-color: ${buttonHoverBackgroundColor}; border-color: ${buttonHoverBackgroundColor}; }`);
        }
        const buttonForegroundColor = theme.getColor(colorRegistry_1.buttonForeground);
        if (buttonForegroundColor) {
            collector.addRule(`.monaco-workbench .extension-editor .content > .details > .additional-details-container .categories-container > .categories > .category:hover { color: ${buttonForegroundColor}; }`);
            collector.addRule(`.monaco-workbench .extension-editor .content > .details > .additional-details-container .tags-container > .tags > .tag:hover { color: ${buttonForegroundColor}; }`);
        }
    });
    function getExtensionEditor(accessor) {
        const activeEditorPane = accessor.get(editorService_1.IEditorService).activeEditorPane;
        if (activeEditorPane instanceof ExtensionEditor) {
            return activeEditorPane;
        }
        return null;
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0ZW5zaW9uRWRpdG9yLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvZXh0ZW5zaW9ucy9icm93c2VyL2V4dGVuc2lvbkVkaXRvci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7O0lBdUVoRyxNQUFNLE1BQU8sU0FBUSxzQkFBVTtRQUc5QixJQUFJLFFBQVEsS0FBbUQsT0FBTyxJQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7UUFHN0YsSUFBSSxTQUFTLEtBQW9CLE9BQU8sSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUM7UUFLMUQsWUFBWSxTQUFzQjtZQUNqQyxLQUFLLEVBQUUsQ0FBQztZQVZELGNBQVMsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksZUFBTyxFQUF5QyxDQUFDLENBQUM7WUFHakYsZUFBVSxHQUFrQixJQUFJLENBQUM7WUFReEMsTUFBTSxPQUFPLEdBQUcsSUFBQSxZQUFNLEVBQUMsU0FBUyxFQUFFLElBQUEsT0FBQyxFQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUM7WUFDaEQsSUFBSSxDQUFDLE9BQU8sR0FBRyxFQUFFLENBQUM7WUFDbEIsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUkscUJBQVMsQ0FBQyxPQUFPLEVBQUUsRUFBRSxRQUFRLEVBQUUsS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQzlFLENBQUM7UUFFRCxJQUFJLENBQUMsRUFBVSxFQUFFLEtBQWEsRUFBRSxPQUFlO1lBQzlDLE1BQU0sTUFBTSxHQUFHLElBQUksZ0JBQU0sQ0FBQyxFQUFFLEVBQUUsS0FBSyxFQUFFLFNBQVMsRUFBRSxJQUFJLEVBQUUsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUFFLEVBQUUsSUFBSSxDQUFD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LEVBQUMsT0FBTyxFQUFFLFNBQVMsRUFDbkIsSUFBQSxPQUFDLEVBQUMsSUFBSSxFQUFFLFNBQVMsRUFDaEIsSUFBQSxPQUFDLEVBQUMsSUFBSSxFQUFFLFNBQVMsRUFBRSxJQUFBLGNBQVEsRUFBQyxTQUFTLEVBQUUsSUFBSSxDQUFDLENBQUMsRUFDN0MsSUFBQSxPQUFDLEVBQUMsSUFBSSxFQUFFLFNBQVMsRUFBRSxJQUFBLGNBQVEsRUFBQyxhQUFhLEVBQUUsYUFBYSxDQUFDLENBQUMsRUFDMUQsSUFBQSxPQUFDLEVBQUMsSUFBSSxFQUFFLFNBQVMsRUFBRSxJQUFBLGNBQVEsRUFBQyxhQUFhLEVBQUUsY0FBYyxDQUFDLENBQUMsRUFDM0QsSUFBQSxPQUFDLEVBQUMsSUFBSSxFQUFFLFNBQVMsRUFBRSxJQUFBLGNBQVEsRUFBQyxjQUFjLEVBQUUsZUFBZSxDQUFDLENBQUMsRUFDN0QsSUFBQSxPQUFDLEVBQUMsSUFBSSxFQUFFLFNBQVMsRUFBRSxJQUFBLGNBQVEsRUFBQyxXQUFXLEVBQUUsdUJBQXVCLENBQUMsQ0FBQyxDQUNsRSxFQUNELEdBQUcsTUFBTSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLElBQUEsT0FBQyxFQUFDLElBQUksRUFBRSxTQUFTLEVBQ3ZDLElBQUEsT0FBQyxFQUFDLElBQUksRUFBRSxTQUFTLEVBQUUsSUFBQSxPQUFDLEVBQUMsTUFBTSxFQUFFLFNBQVMsRUFBRSxLQUFLLENBQUMsRUFBRSxDQUFDLENBQUMsRUFDbEQsSUFBQSxPQUFDLEVBQUMsSUFBSSxFQUFFLFNBQVMsRUFBRSxLQUFLLENBQUMsV0FBVyxDQUFDLEVBQ3JDLElBQUEsT0FBQyxFQUFDLElBQUksRUFBRSxTQUFTLEVBQUUsR0FBRyxZQUFZLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUN4RCxJQUFBLE9BQUMsRUFBQyxJQUFJLEVBQUUsU0FBUyxFQUFFLEdBQUcsWUFBWSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUMsRUFDekQs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