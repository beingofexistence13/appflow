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
define(["require", "exports", "vs/nls!vs/workbench/contrib/extensions/browser/extensionEditor", "vs/base/common/arrays", "vs/base/common/platform", "vs/base/common/event", "vs/base/common/cache", "vs/base/common/actions", "vs/base/common/errors", "vs/base/common/lifecycle", "vs/base/browser/dom", "vs/workbench/browser/parts/editor/editorPane", "vs/platform/telemetry/common/telemetry", "vs/platform/instantiation/common/instantiation", "vs/workbench/services/extensionRecommendations/common/extensionRecommendations", "vs/platform/extensions/common/extensions", "vs/workbench/contrib/extensions/common/extensions", "vs/workbench/contrib/extensions/browser/extensionsWidgets", "vs/base/browser/ui/actionbar/actionbar", "vs/workbench/contrib/extensions/browser/extensionsActions", "vs/platform/keybinding/common/keybinding", "vs/base/browser/ui/scrollbar/scrollableElement", "vs/platform/opener/common/opener", "vs/platform/theme/common/themeService", "vs/base/common/themables", "vs/base/browser/ui/keybindingLabel/keybindingLabel", "vs/platform/contextkey/common/contextkey", "vs/workbench/services/editor/common/editorService", "vs/base/common/color", "vs/platform/notification/common/notification", "vs/base/common/cancellation", "vs/workbench/contrib/extensions/browser/extensionsViewer", "vs/workbench/contrib/update/common/update", "vs/platform/storage/common/storage", "vs/workbench/services/extensions/common/extensions", "vs/platform/configuration/common/configurationRegistry", "vs/base/common/types", "vs/workbench/contrib/webview/browser/webview", "vs/base/common/uuid", "vs/base/common/process", "vs/base/common/uri", "vs/base/common/network", "vs/workbench/contrib/markdown/browser/markdownDocumentRenderer", "vs/editor/common/languages/language", "vs/editor/common/languages", "vs/editor/common/languages/supports/tokenization", "vs/platform/theme/common/colorRegistry", "vs/platform/actions/common/actions", "vs/platform/contextview/browser/contextView", "vs/editor/common/editorContextKeys", "vs/workbench/contrib/extensions/browser/extensionsList", "vs/base/browser/markdownRenderer", "vs/platform/extensionManagement/common/extensionManagementUtil", "vs/workbench/contrib/extensions/browser/extensionsIcons", "vs/workbench/services/panecomposite/browser/panecomposite", "vs/platform/extensionManagement/common/extensionManagement", "vs/base/common/semver/semver", "vs/platform/theme/browser/defaultStyles", "vs/css!./media/extensionEditor"], function (require, exports, nls_1, arrays, platform_1, event_1, cache_1, actions_1, errors_1, lifecycle_1, dom_1, editorPane_1, telemetry_1, instantiation_1, extensionRecommendations_1, extensions_1, extensions_2, extensionsWidgets_1, actionbar_1, extensionsActions_1, keybinding_1, scrollableElement_1, opener_1, themeService_1, themables_1, keybindingLabel_1, contextkey_1, editorService_1, color_1, notification_1, cancellation_1, extensionsViewer_1, update_1, storage_1, extensions_3, configurationRegistry_1, types_1, webview_1, uuid_1, process_1, uri_1, network_1, markdownDocumentRenderer_1, language_1, languages_1, tokenization_1, colorRegistry_1, actions_2, contextView_1, editorContextKeys_1, extensionsList_1, markdownRenderer_1, extensionManagementUtil_1, extensionsIcons_1, panecomposite_1, extensionManagement_1, semver, defaultStyles_1) {
    "use strict";
    var $AUb_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$AUb = void 0;
    class NavBar extends lifecycle_1.$kc {
        get onChange() { return this.f.event; }
        get currentId() { return this.g; }
        constructor(container) {
            super();
            this.f = this.B(new event_1.$fd());
            this.g = null;
            const element = (0, dom_1.$0O)(container, (0, dom_1.$)('.navbar'));
            this.h = [];
            this.j = this.B(new actionbar_1.$1P(element, { animated: false }));
        }
        push(id, label, tooltip) {
            const action = new actions_1.$gi(id, label, undefined, true, () => this.m(id, true));
            action.tooltip = tooltip;
            this.h.push(action);
            this.j.push(action);
            if (this.h.length === 1) {
                this.m(id);
            }
        }
        clear() {
            this.h = (0, lifecycle_1.$fc)(this.h);
            this.j.clear();
        }
        switch(id) {
            const action = this.h.find(action => action.id === id);
            if (action) {
                action.run();
                return true;
            }
            return false;
        }
        m(id, focus) {
            this.g = id;
            this.f.fire({ id, focus: !!focus });
            this.h.forEach(a => a.checked = a.id === id);
        }
    }
    var WebviewIndex;
    (function (WebviewIndex) {
        WebviewIndex[WebviewIndex["Readme"] = 0] = "Readme";
        WebviewIndex[WebviewIndex["Changelog"] = 1] = "Changelog";
    })(WebviewIndex || (WebviewIndex = {}));
    const CONTEXT_SHOW_PRE_RELEASE_VERSION = new contextkey_1.$2i('showPreReleaseVersion', false);
    class ExtensionWithDifferentGalleryVersionWidget extends extensionsWidgets_1.$PTb {
        constructor() {
            super(...arguments);
            this.g = null;
        }
        get gallery() { return this.g; }
        set gallery(gallery) {
            if (this.extension && gallery && !(0, extensionManagementUtil_1.$po)(this.extension.identifier, gallery.identifier)) {
                return;
            }
            this.g = gallery;
            this.update();
        }
    }
    class VersionWidget extends ExtensionWithDifferentGalleryVersionWidget {
        constructor(container) {
            super();
            this.h = (0, dom_1.$0O)(container, (0, dom_1.$)('code.version', { title: (0, nls_1.localize)(0, null) }));
            this.render();
        }
        render() {
            if (!this.extension || !semver.valid(this.extension.version)) {
                return;
            }
            this.h.textContent = `v${this.gallery?.version ?? this.extension.version}`;
        }
    }
    class PreReleaseTextWidget extends ExtensionWithDifferentGalleryVersionWidget {
        constructor(container) {
            super();
            this.h = (0, dom_1.$0O)(container, (0, dom_1.$)('span.pre-release'));
            (0, dom_1.$0O)(this.h, (0, dom_1.$)('span' + themables_1.ThemeIcon.asCSSSelector(extensionsIcons_1.$ahb)));
            const textElement = (0, dom_1.$0O)(this.h, (0, dom_1.$)('span.pre-release-text'));
            textElement.textContent = (0, nls_1.localize)(1, null);
            this.render();
        }
        render() {
            this.h.style.display = this.j() ? 'inherit' : 'none';
        }
        j() {
            if (!this.extension) {
                return false;
            }
            if (this.gallery) {
                return this.gallery.properties.isPreReleaseVersion;
            }
            return !!(this.extension.state === 1 /* ExtensionState.Installed */ ? this.extension.local?.isPreReleaseVersion : this.extension.gallery?.properties.isPreReleaseVersion);
        }
    }
    let $AUb = class $AUb extends editorPane_1.$0T {
        static { $AUb_1 = this; }
        static { this.ID = 'workbench.editor.extension'; }
        constructor(telemetryService, jb, kb, lb, mb, themeService, nb, ob, pb, qb, storageService, rb, sb, tb, ub, vb) {
            super($AUb_1.ID, telemetryService, themeService, storageService);
            this.jb = jb;
            this.kb = kb;
            this.lb = lb;
            this.mb = mb;
            this.nb = nb;
            this.ob = ob;
            this.pb = pb;
            this.qb = qb;
            this.rb = rb;
            this.sb = sb;
            this.tb = tb;
            this.ub = ub;
            this.vb = vb;
            this.f = this.B(new lifecycle_1.$lc());
            // Some action bar items use a webview whose vertical scroll position we track in this map
            this.s = new Map();
            // Spot when an ExtensionEditor instance gets reused for a different extension, in which case the vertical scroll positions must be zeroed
            this.u = '';
            this.y = [];
            this.eb = this.B(new lifecycle_1.$jc());
            this.fb = this.B(new lifecycle_1.$jc());
            this.gb = null;
            this.j = null;
            this.m = null;
            this.r = null;
        }
        get scopedContextKeyService() {
            return this.f.value;
        }
        ab(parent) {
            const root = (0, dom_1.$0O)(parent, (0, dom_1.$)('.extension-editor'));
            this.f.value = this.vb.createScoped(root);
            this.f.value.createKey('inExtensionEditor', true);
            this.ib = CONTEXT_SHOW_PRE_RELEASE_VERSION.bindTo(this.f.value);
            root.tabIndex = 0; // this is required for the focus tracker on the editor
            root.style.outline = 'none';
            root.setAttribute('role', 'document');
            const header = (0, dom_1.$0O)(root, (0, dom_1.$)('.header'));
            const iconContainer = (0, dom_1.$0O)(header, (0, dom_1.$)('.icon-container'));
            const icon = (0, dom_1.$0O)(iconContainer, (0, dom_1.$)('img.icon', { draggable: false, alt: '' }));
            const remoteBadge = this.jb.createInstance(extensionsWidgets_1.$XTb, iconContainer, true);
            const details = (0, dom_1.$0O)(header, (0, dom_1.$)('.details'));
            const title = (0, dom_1.$0O)(details, (0, dom_1.$)('.title'));
            const name = (0, dom_1.$0O)(title, (0, dom_1.$)('span.name.clickable', { title: (0, nls_1.localize)(2, null), role: 'heading', tabIndex: 0 }));
            const versionWidget = new VersionWidget(title);
            const preReleaseWidget = new PreReleaseTextWidget(title);
            const preview = (0, dom_1.$0O)(title, (0, dom_1.$)('span.preview', { title: (0, nls_1.localize)(3, null) }));
            preview.textContent = (0, nls_1.localize)(4, null);
            const builtin = (0, dom_1.$0O)(title, (0, dom_1.$)('span.builtin'));
            builtin.textContent = (0, nls_1.localize)(5, null);
            const subtitle = (0, dom_1.$0O)(details, (0, dom_1.$)('.subtitle'));
            const publisher = (0, dom_1.$0O)((0, dom_1.$0O)(subtitle, (0, dom_1.$)('.subtitle-entry')), (0, dom_1.$)('.publisher.clickable', { title: (0, nls_1.localize)(6, null), tabIndex: 0 }));
            publisher.setAttribute('role', 'button');
            const publisherDisplayName = (0, dom_1.$0O)(publisher, (0, dom_1.$)('.publisher-name'));
            const verifiedPublisherWidget = this.jb.createInstance(extensionsWidgets_1.$TTb, (0, dom_1.$0O)(publisher, (0, dom_1.$)('.verified-publisher')), false);
            const installCount = (0, dom_1.$0O)((0, dom_1.$0O)(subtitle, (0, dom_1.$)('.subtitle-entry')), (0, dom_1.$)('span.install', { title: (0, nls_1.localize)(7, null), tabIndex: 0 }));
            const installCountWidget = this.jb.createInstance(extensionsWidgets_1.$RTb, installCount, false);
            const rating = (0, dom_1.$0O)((0, dom_1.$0O)(subtitle, (0, dom_1.$)('.subtitle-entry')), (0, dom_1.$)('span.rating.clickable', { title: (0, nls_1.localize)(8, null), tabIndex: 0 }));
            rating.setAttribute('role', 'link'); // #132645
            const ratingsWidget = this.jb.createInstance(extensionsWidgets_1.$STb, rating, false);
            const sponsorWidget = this.jb.createInstance(extensionsWidgets_1.$UTb, (0, dom_1.$0O)(subtitle, (0, dom_1.$)('.subtitle-entry')));
            const widgets = [
                remoteBadge,
                versionWidget,
                preReleaseWidget,
                verifiedPublisherWidget,
                installCountWidget,
                ratingsWidget,
                sponsorWidget,
            ];
            const description = (0, dom_1.$0O)(details, (0, dom_1.$)('.description'));
            const installAction = this.jb.createInstance(extensionsActions_1.$shb);
            const actions = [
                this.jb.createInstance(extensionsActions_1.$Shb),
                this.jb.createInstance(extensionsActions_1.$7hb),
                this.jb.createInstance(extensionsActions_1.$qhb, 'extensions.updateActions', '', [[this.jb.createInstance(extensionsActions_1.$zhb, true)], [this.jb.createInstance(extensionsActions_1.$Ahb)]]),
                this.jb.createInstance(extensionsActions_1.$Thb),
                this.jb.createInstance(extensionsActions_1.$Uhb),
                this.jb.createInstance(extensionsActions_1.$Vhb),
                this.jb.createInstance(extensionsActions_1.$Whb),
                this.jb.createInstance(extensionsActions_1.$Xhb),
                this.jb.createInstance(extensionsActions_1.$Qhb),
                this.jb.createInstance(extensionsActions_1.$Rhb),
                this.jb.createInstance(extensionsActions_1.$vhb, false),
                this.jb.createInstance(extensionsActions_1.$whb),
                this.jb.createInstance(extensionsActions_1.$xhb),
                installAction,
                this.jb.createInstance(extensionsActions_1.$thb),
                this.jb.createInstance(extensionsActions_1.$qhb, 'extensions.uninstall', extensionsActions_1.$yhb.UninstallLabel, [
                    [
                        this.jb.createInstance(extensionsActions_1.$Bhb, false),
                        this.jb.createInstance(extensionsActions_1.$yhb),
                        this.jb.createInstance(extensionsActions_1.$Lhb),
                    ]
                ]),
                this.jb.createInstance(extensionsActions_1.$Jhb, false),
                this.jb.createInstance(extensionsActions_1.$Khb, false),
                this.jb.createInstance(extensionsActions_1.$8hb),
                new extensionsActions_1.$Hhb(this.scopedContextKeyService || this.vb, this.jb),
            ];
            const actionsAndStatusContainer = (0, dom_1.$0O)(details, (0, dom_1.$)('.actions-status-container'));
            const extensionActionBar = this.B(new actionbar_1.$1P(actionsAndStatusContainer, {
                animated: false,
                actionViewItemProvider: (action) => {
                    if (action instanceof extensionsActions_1.$Dhb) {
                        return action.createActionViewItem();
                    }
                    if (action instanceof extensionsActions_1.$qhb) {
                        return new extensionsActions_1.$Chb(action, { icon: true, label: true, menuActionsOrProvider: { getActions: () => action.menuActions }, menuActionClassNames: (action.class || '').split(' ') }, this.ub);
                    }
                    return undefined;
                },
                focusOnlyEnabledItems: true
            }));
            extensionActionBar.push(actions, { icon: true, label: true });
            extensionActionBar.setFocusable(true);
            // update focusable elements when the enablement of an action changes
            this.B(event_1.Event.any(...actions.map(a => event_1.Event.filter(a.onDidChange, e => e.enabled !== undefined)))(() => {
                extensionActionBar.setFocusable(false);
                extensionActionBar.setFocusable(true);
            }));
            const otherExtensionContainers = [];
            const extensionStatusAction = this.jb.createInstance(extensionsActions_1.$9hb);
            const extensionStatusWidget = this.B(this.jb.createInstance(extensionsWidgets_1.$3Tb, (0, dom_1.$0O)(actionsAndStatusContainer, (0, dom_1.$)('.status')), extensionStatusAction));
            otherExtensionContainers.push(extensionStatusAction, new class extends extensionsWidgets_1.$PTb {
                render() {
                    actionsAndStatusContainer.classList.toggle('list-layout', this.extension?.state === 1 /* ExtensionState.Installed */);
                }
            }());
            const recommendationWidget = this.jb.createInstance(extensionsWidgets_1.$4Tb, (0, dom_1.$0O)(details, (0, dom_1.$)('.recommendation')));
            widgets.push(recommendationWidget);
            this.B(event_1.Event.any(extensionStatusWidget.onDidRender, recommendationWidget.onDidRender)(() => {
                if (this.hb) {
                    this.layout(this.hb);
                }
            }));
            const extensionContainers = this.jb.createInstance(extensions_2.$Ufb, [...actions, ...widgets, ...otherExtensionContainers]);
            for (const disposable of [...actions, ...widgets, ...otherExtensionContainers, extensionContainers]) {
                this.B(disposable);
            }
            const onError = event_1.Event.chain(extensionActionBar.onDidRun, $ => $.map(({ error }) => error)
                .filter(error => !!error));
            this.B(onError(this.nc, this));
            const body = (0, dom_1.$0O)(root, (0, dom_1.$)('.body'));
            const navbar = new NavBar(body);
            const content = (0, dom_1.$0O)(body, (0, dom_1.$)('.content'));
            content.id = (0, uuid_1.$4f)(); // An id is needed for the webview parent flow to
            this.g = {
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
            this.xb();
            if (this.g) {
                await this.zb(input.extension, this.g, !!options?.preserveFocus);
            }
        }
        setOptions(options) {
            const currentOptions = this.options;
            super.setOptions(options);
            this.xb();
            if (this.input && this.g && currentOptions?.showPreReleaseVersion !== options?.showPreReleaseVersion) {
                this.zb(this.input.extension, this.g, !!options?.preserveFocus);
            }
        }
        xb() {
            let showPreReleaseVersion = this.options?.showPreReleaseVersion;
            if ((0, types_1.$qf)(showPreReleaseVersion)) {
                showPreReleaseVersion = !!this.input.extension.gallery?.properties.isPreReleaseVersion;
            }
            this.ib?.set(showPreReleaseVersion);
        }
        async openTab(tab) {
            if (!this.input || !this.g) {
                return;
            }
            if (this.g.navbar.switch(tab)) {
                return;
            }
            // Fallback to Readme tab if ExtensionPack tab does not exist
            if (tab === "extensionPack" /* ExtensionEditorTab.ExtensionPack */) {
                this.g.navbar.switch("readme" /* ExtensionEditorTab.Readme */);
            }
        }
        async yb(extension, preRelease) {
            if ((0, types_1.$qf)(preRelease)) {
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
            return (await this.mb.getExtensions([{ ...extension.identifier, preRelease, hasPreRelease: extension.hasPreReleaseVersion }], cancellation_1.CancellationToken.None))[0] || null;
        }
        async zb(extension, template, preserveFocus) {
            this.gb = null;
            this.fb.clear();
            const token = this.fb.add(new cancellation_1.$pd()).token;
            const gallery = await this.yb(extension, this.options?.showPreReleaseVersion);
            if (token.isCancellationRequested) {
                return;
            }
            this.j = new cache_1.$he(() => gallery ? this.mb.getReadme(gallery, token) : extension.getReadme(token));
            this.m = new cache_1.$he(() => gallery ? this.mb.getChangelog(gallery, token) : extension.getChangelog(token));
            this.r = new cache_1.$he(() => gallery ? this.mb.getManifest(gallery, token) : extension.getManifest(token));
            template.extension = extension;
            template.gallery = gallery;
            template.manifest = null;
            this.fb.add((0, dom_1.$nO)(template.icon, 'error', () => template.icon.src = extension.iconUrlFallback, { once: true }));
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
                this.fb.add((0, extensionsWidgets_1.$QTb)(template.name, () => this.pb.open(uri_1.URI.parse(extension.url))));
                this.fb.add((0, extensionsWidgets_1.$QTb)(template.rating, () => this.pb.open(uri_1.URI.parse(`${extension.url}&ssr=false#review-details`))));
                this.fb.add((0, extensionsWidgets_1.$QTb)(template.publisher, () => {
                    this.kb.openPaneComposite(extensions_2.$Ofb, 0 /* ViewContainerLocation.Sidebar */, true)
                        .then(viewlet => viewlet?.getViewPaneContainer())
                        .then(viewlet => viewlet.search(`publisher:"${extension.publisherDisplayName}"`));
                }));
            }
            const manifest = await this.r.get().promise;
            if (token.isCancellationRequested) {
                return;
            }
            if (manifest) {
                template.manifest = manifest;
            }
            this.Ab(extension, manifest, template, preserveFocus);
            // report telemetry
            const extRecommendations = this.qb.getAllRecommendationsWithReason();
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
            this.P.publicLog('extensionGallery:openExtension', { ...extension.telemetryData, ...recommendationsData });
        }
        Ab(extension, manifest, template, preserveFocus) {
            template.content.innerText = '';
            template.navbar.clear();
            if (this.u !== extension.identifier.id) {
                this.s.clear();
                this.u = extension.identifier.id;
            }
            if (extension.hasReadme()) {
                template.navbar.push("readme" /* ExtensionEditorTab.Readme */, (0, nls_1.localize)(9, null), (0, nls_1.localize)(10, null));
            }
            if (manifest && manifest.contributes) {
                template.navbar.push("contributions" /* ExtensionEditorTab.Contributions */, (0, nls_1.localize)(11, null), (0, nls_1.localize)(12, null));
            }
            if (extension.hasChangelog()) {
                template.navbar.push("changelog" /* ExtensionEditorTab.Changelog */, (0, nls_1.localize)(13, null), (0, nls_1.localize)(14, null));
            }
            if (extension.dependencies.length) {
                template.navbar.push("dependencies" /* ExtensionEditorTab.Dependencies */, (0, nls_1.localize)(15, null), (0, nls_1.localize)(16, null));
            }
            if (manifest && manifest.extensionPack?.length && !this.Hb(manifest)) {
                template.navbar.push("extensionPack" /* ExtensionEditorTab.ExtensionPack */, (0, nls_1.localize)(17, null), (0, nls_1.localize)(18, null));
            }
            const addRuntimeStatusSection = () => template.navbar.push("runtimeStatus" /* ExtensionEditorTab.RuntimeStatus */, (0, nls_1.localize)(19, null), (0, nls_1.localize)(20, null));
            if (this.lb.getExtensionStatus(extension)) {
                addRuntimeStatusSection();
            }
            else {
                const disposable = this.rb.onDidChangeExtensionsStatus(e => {
                    if (e.some(extensionIdentifier => (0, extensionManagementUtil_1.$po)({ id: extensionIdentifier.value }, extension.identifier))) {
                        addRuntimeStatusSection();
                        disposable.dispose();
                    }
                }, this, this.fb);
            }
            if (template.navbar.currentId) {
                this.Bb(extension, { id: template.navbar.currentId, focus: !preserveFocus }, template);
            }
            template.navbar.onChange(e => this.Bb(extension, e, template), this, this.fb);
        }
        clearInput() {
            this.eb.clear();
            this.fb.clear();
            super.clearInput();
        }
        focus() {
            this.gb?.focus();
        }
        showFind() {
            this.activeWebview?.showFind();
        }
        runFindAction(previous) {
            this.activeWebview?.runFindAction(previous);
        }
        get activeWebview() {
            if (!this.gb || !this.gb.runFindAction) {
                return undefined;
            }
            return this.gb;
        }
        Bb(extension, { id, focus }, template) {
            this.eb.clear();
            template.content.innerText = '';
            this.gb = null;
            if (id) {
                const cts = new cancellation_1.$pd();
                this.eb.add((0, lifecycle_1.$ic)(() => cts.dispose(true)));
                this.Cb(id, extension, template, cts.token)
                    .then(activeElement => {
                    if (cts.token.isCancellationRequested) {
                        return;
                    }
                    this.gb = activeElement;
                    if (focus) {
                        this.focus();
                    }
                });
            }
        }
        Cb(id, extension, template, token) {
            switch (id) {
                case "readme" /* ExtensionEditorTab.Readme */: return this.Gb(extension, template, token);
                case "contributions" /* ExtensionEditorTab.Contributions */: return this.Ob(template, token);
                case "changelog" /* ExtensionEditorTab.Changelog */: return this.Nb(template, token);
                case "dependencies" /* ExtensionEditorTab.Dependencies */: return this.Pb(extension, template, token);
                case "extensionPack" /* ExtensionEditorTab.ExtensionPack */: return this.Qb(extension, template, token);
                case "runtimeStatus" /* ExtensionEditorTab.RuntimeStatus */: return this.Rb(extension, template, token);
            }
            return Promise.resolve(null);
        }
        async Db(cacheResult, noContentCopy, container, webviewIndex, title, token) {
            try {
                const body = await this.Eb(cacheResult, container, token);
                if (token.isCancellationRequested) {
                    return Promise.resolve(null);
                }
                const webview = this.eb.add(this.sb.createWebviewOverlay({
                    title,
                    options: {
                        enableFindWidget: true,
                        tryRestoreScrollPosition: true,
                        disableServiceWorker: true,
                    },
                    contentOptions: {},
                    extension: undefined,
                }));
                webview.initialScrollProgress = this.s.get(webviewIndex) || 0;
                webview.claim(this, this.scopedContextKeyService);
                (0, dom_1.$OO)(webview.container, container);
                webview.layoutWebviewOverElement(container);
                webview.setHtml(body);
                webview.claim(this, undefined);
                this.eb.add(webview.onDidFocus(() => this.I()));
                this.eb.add(webview.onDidScroll(() => this.s.set(webviewIndex, webview.initialScrollProgress)));
                const removeLayoutParticipant = arrays.$Sb(this.y, {
                    layout: () => {
                        webview.layoutWebviewOverElement(container);
                    }
                });
                this.eb.add((0, lifecycle_1.$ic)(removeLayoutParticipant));
                let isDisposed = false;
                this.eb.add((0, lifecycle_1.$ic)(() => { isDisposed = true; }));
                this.eb.add(this.n.onDidColorThemeChange(async () => {
                    // Render again since syntax highlighting of code blocks may have changed
                    const body = await this.Eb(cacheResult, container);
                    if (!isDisposed) { // Make sure we weren't disposed of in the meantime
                        webview.setHtml(body);
                    }
                }));
                this.eb.add(webview.onDidClickLink(link => {
                    if (!link) {
                        return;
                    }
                    // Only allow links with specific schemes
                    if ((0, opener_1.$OT)(link, network_1.Schemas.http) || (0, opener_1.$OT)(link, network_1.Schemas.https) || (0, opener_1.$OT)(link, network_1.Schemas.mailto)) {
                        this.pb.open(link);
                    }
                    if ((0, opener_1.$OT)(link, network_1.Schemas.command) && uri_1.URI.parse(link).path === update_1.$xUb) {
                        this.pb.open(link, { allowCommands: true }); // TODO@sandy081 use commands service
                    }
                }));
                return webview;
            }
            catch (e) {
                const p = (0, dom_1.$0O)(container, (0, dom_1.$)('p.nocontent'));
                p.textContent = noContentCopy;
                return p;
            }
        }
        async Eb(cacheResult, container, token) {
            const contents = await this.mc(() => cacheResult, container);
            if (token?.isCancellationRequested) {
                return '';
            }
            const content = await (0, markdownDocumentRenderer_1.$zUb)(contents, this.rb, this.tb, true, false, token);
            if (token?.isCancellationRequested) {
                return '';
            }
            return this.Fb(content);
        }
        Fb(body) {
            const nonce = (0, uuid_1.$4f)();
            const colorMap = languages_1.$bt.getColorMap();
            const css = colorMap ? (0, tokenization_1.$Rob)(colorMap) : '';
            return `<!DOCTYPE html>
		<html>
			<head>
				<meta http-equiv="Content-type" content="text/html;charset=UTF-8">
				<meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src https: data:; media-src https:; script-src 'none'; style-src 'nonce-${nonce}';">
				<style nonce="${nonce}">
					${markdownDocumentRenderer_1.$yUb}

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
        async Gb(extension, template, token) {
            const details = (0, dom_1.$0O)(template.content, (0, dom_1.$)('.details'));
            const readmeContainer = (0, dom_1.$0O)(details, (0, dom_1.$)('.readme-container'));
            const additionalDetailsContainer = (0, dom_1.$0O)(details, (0, dom_1.$)('.additional-details-container'));
            const layout = () => details.classList.toggle('narrow', this.hb && this.hb.width < 500);
            layout();
            this.eb.add((0, lifecycle_1.$ic)(arrays.$Sb(this.y, { layout })));
            let activeElement = null;
            const manifest = await this.r.get().promise;
            if (manifest && manifest.extensionPack?.length && this.Hb(manifest)) {
                activeElement = await this.Ib(manifest, readmeContainer, token);
            }
            else {
                activeElement = await this.Db(this.j.get(), (0, nls_1.localize)(21, null), readmeContainer, 0 /* WebviewIndex.Readme */, (0, nls_1.localize)(22, null), token);
            }
            this.Jb(additionalDetailsContainer, extension);
            return activeElement;
        }
        Hb(manifest) {
            return !!(manifest.categories?.some(category => category.toLowerCase() === 'extension packs'));
        }
        async Ib(manifest, container, token) {
            if (token.isCancellationRequested) {
                return Promise.resolve(null);
            }
            const extensionPackReadme = (0, dom_1.$0O)(container, (0, dom_1.$)('div', { class: 'extension-pack-readme' }));
            extensionPackReadme.style.margin = '0 auto';
            extensionPackReadme.style.maxWidth = '882px';
            const extensionPack = (0, dom_1.$0O)(extensionPackReadme, (0, dom_1.$)('div', { class: 'extension-pack' }));
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
            const extensionPackHeader = (0, dom_1.$0O)(extensionPack, (0, dom_1.$)('div.header'));
            extensionPackHeader.textContent = (0, nls_1.localize)(23, null, manifest.extensionPack.length);
            const extensionPackContent = (0, dom_1.$0O)(extensionPack, (0, dom_1.$)('div', { class: 'extension-pack-content' }));
            extensionPackContent.setAttribute('tabindex', '0');
            (0, dom_1.$0O)(extensionPack, (0, dom_1.$)('div.footer'));
            const readmeContent = (0, dom_1.$0O)(extensionPackReadme, (0, dom_1.$)('div.readme-content'));
            await Promise.all([
                this.Tb(manifest, extensionPackContent, token),
                this.Db(this.j.get(), (0, nls_1.localize)(24, null), readmeContent, 0 /* WebviewIndex.Readme */, (0, nls_1.localize)(25, null), token),
            ]);
            return { focus: () => extensionPackContent.focus() };
        }
        Jb(container, extension) {
            const content = (0, dom_1.$)('div', { class: 'additional-details-content', tabindex: '0' });
            const scrollableContent = new scrollableElement_1.$UP(content, {});
            const layout = () => scrollableContent.scanDomNode();
            const removeLayoutParticipant = arrays.$Sb(this.y, { layout });
            this.eb.add((0, lifecycle_1.$ic)(removeLayoutParticipant));
            this.eb.add(scrollableContent);
            this.Kb(content, extension);
            this.Lb(content, extension);
            this.Mb(content, extension);
            (0, dom_1.$0O)(container, scrollableContent.getDomNode());
            scrollableContent.scanDomNode();
        }
        Kb(container, extension) {
            if (extension.categories.length) {
                const categoriesContainer = (0, dom_1.$0O)(container, (0, dom_1.$)('.categories-container.additional-details-element'));
                (0, dom_1.$0O)(categoriesContainer, (0, dom_1.$)('.additional-details-title', undefined, (0, nls_1.localize)(26, null)));
                const categoriesElement = (0, dom_1.$0O)(categoriesContainer, (0, dom_1.$)('.categories'));
                for (const category of extension.categories) {
                    this.fb.add((0, extensionsWidgets_1.$QTb)((0, dom_1.$0O)(categoriesElement, (0, dom_1.$)('span.category', { tabindex: '0' }, category)), () => {
                        this.kb.openPaneComposite(extensions_2.$Ofb, 0 /* ViewContainerLocation.Sidebar */, true)
                            .then(viewlet => viewlet?.getViewPaneContainer())
                            .then(viewlet => viewlet.search(`@category:"${category}"`));
                    }));
                }
            }
        }
        Lb(container, extension) {
            const resources = [];
            if (extension.url) {
                resources.push([(0, nls_1.localize)(27, null), uri_1.URI.parse(extension.url)]);
            }
            if (extension.repository) {
                try {
                    resources.push([(0, nls_1.localize)(28, null), uri_1.URI.parse(extension.repository)]);
                }
                catch (error) { /* Ignore */ }
            }
            if (extension.url && extension.licenseUrl) {
                try {
                    resources.push([(0, nls_1.localize)(29, null), uri_1.URI.parse(extension.licenseUrl)]);
                }
                catch (error) { /* Ignore */ }
            }
            if (extension.publisherUrl) {
                resources.push([extension.publisherDisplayName, extension.publisherUrl]);
            }
            if (resources.length || extension.publisherSponsorLink) {
                const extensionResourcesContainer = (0, dom_1.$0O)(container, (0, dom_1.$)('.resources-container.additional-details-element'));
                (0, dom_1.$0O)(extensionResourcesContainer, (0, dom_1.$)('.additional-details-title', undefined, (0, nls_1.localize)(30, null)));
                const resourcesElement = (0, dom_1.$0O)(extensionResourcesContainer, (0, dom_1.$)('.resources'));
                for (const [label, uri] of resources) {
                    this.fb.add((0, extensionsWidgets_1.$QTb)((0, dom_1.$0O)(resourcesElement, (0, dom_1.$)('a.resource', { title: uri.toString(), tabindex: '0' }, label)), () => this.pb.open(uri)));
                }
            }
        }
        Mb(container, extension) {
            const gallery = extension.gallery;
            const moreInfoContainer = (0, dom_1.$0O)(container, (0, dom_1.$)('.more-info-container.additional-details-element'));
            (0, dom_1.$0O)(moreInfoContainer, (0, dom_1.$)('.additional-details-title', undefined, (0, nls_1.localize)(31, null)));
            const moreInfo = (0, dom_1.$0O)(moreInfoContainer, (0, dom_1.$)('.more-info'));
            const toDateString = (date) => `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}, ${date.toLocaleTimeString(platform_1.$v, { hourCycle: 'h23' })}`;
            if (gallery) {
                (0, dom_1.$0O)(moreInfo, (0, dom_1.$)('.more-info-entry', undefined, (0, dom_1.$)('div', undefined, (0, nls_1.localize)(32, null)), (0, dom_1.$)('div', undefined, toDateString(new Date(gallery.releaseDate)))), (0, dom_1.$)('.more-info-entry', undefined, (0, dom_1.$)('div', undefined, (0, nls_1.localize)(33, null)), (0, dom_1.$)('div', undefined, toDateString(new Date(gallery.lastUpdated)))));
            }
            if (extension.local && extension.local.installedTimestamp) {
                (0, dom_1.$0O)(moreInfo, (0, dom_1.$)('.more-info-entry', undefined, (0, dom_1.$)('div', undefined, (0, nls_1.localize)(34, null)), (0, dom_1.$)('div', undefined, toDateString(new Date(extension.local.installedTimestamp)))));
            }
            (0, dom_1.$0O)(moreInfo, (0, dom_1.$)('.more-info-entry', undefined, (0, dom_1.$)('div', undefined, (0, nls_1.localize)(35, null)), (0, dom_1.$)('code', undefined, extension.identifier.id)));
        }
        Nb(template, token) {
            return this.Db(this.m.get(), (0, nls_1.localize)(36, null), template.content, 1 /* WebviewIndex.Changelog */, (0, nls_1.localize)(37, null), token);
        }
        Ob(template, token) {
            const content = (0, dom_1.$)('div.subcontent.feature-contributions', { tabindex: '0' });
            return this.mc(() => this.r.get(), template.content)
                .then(manifest => {
                if (token.isCancellationRequested) {
                    return null;
                }
                if (!manifest) {
                    return content;
                }
                const scrollableContent = new scrollableElement_1.$UP(content, {});
                const layout = () => scrollableContent.scanDomNode();
                const removeLayoutParticipant = arrays.$Sb(this.y, { layout });
                this.eb.add((0, lifecycle_1.$ic)(removeLayoutParticipant));
                const renders = [
                    this.Ub(content, manifest, layout),
                    this.gc(content, manifest, layout),
                    this.$b(content, manifest, layout),
                    this.hc(content, manifest, layout),
                    this.bc(content, manifest, layout),
                    this.cc(content, manifest, layout),
                    this.dc(content, manifest, layout),
                    this.ec(content, manifest, layout),
                    this.fc(content, manifest, layout),
                    this.Vb(content, manifest, layout),
                    this.Wb(content, manifest, layout),
                    this.Xb(content, manifest, layout),
                    this.Yb(content, manifest, layout),
                    this.Zb(content, manifest, layout),
                    this.jc(content, manifest, layout),
                    this.kc(content, manifest, layout),
                    this.ac(content, manifest, layout),
                    this.ic(content, manifest, layout),
                ];
                scrollableContent.scanDomNode();
                const isEmpty = !renders.some(x => x);
                if (isEmpty) {
                    (0, dom_1.$0O)(content, (0, dom_1.$)('p.nocontent')).textContent = (0, nls_1.localize)(38, null);
                    (0, dom_1.$0O)(template.content, content);
                }
                else {
                    (0, dom_1.$0O)(template.content, scrollableContent.getDomNode());
                    this.eb.add(scrollableContent);
                }
                return content;
            }, () => {
                if (token.isCancellationRequested) {
                    return null;
                }
                (0, dom_1.$0O)(content, (0, dom_1.$)('p.nocontent')).textContent = (0, nls_1.localize)(39, null);
                (0, dom_1.$0O)(template.content, content);
                return content;
            });
        }
        Pb(extension, template, token) {
            if (token.isCancellationRequested) {
                return Promise.resolve(null);
            }
            if (arrays.$Ib(extension.dependencies)) {
                (0, dom_1.$0O)(template.content, (0, dom_1.$)('p.nocontent')).textContent = (0, nls_1.localize)(40, null);
                return Promise.resolve(template.content);
            }
            const content = (0, dom_1.$)('div', { class: 'subcontent' });
            const scrollableContent = new scrollableElement_1.$UP(content, {});
            (0, dom_1.$0O)(template.content, scrollableContent.getDomNode());
            this.eb.add(scrollableContent);
            const dependenciesTree = this.jb.createInstance(extensionsViewer_1.$uUb, new extensionsViewer_1.$vUb(extension, null, extension => extension.dependencies || [], this.lb), content, {
                listBackground: colorRegistry_1.$ww
            });
            const layout = () => {
                scrollableContent.scanDomNode();
                const scrollDimensions = scrollableContent.getScrollDimensions();
                dependenciesTree.layout(scrollDimensions.height);
            };
            const removeLayoutParticipant = arrays.$Sb(this.y, { layout });
            this.eb.add((0, lifecycle_1.$ic)(removeLayoutParticipant));
            this.eb.add(dependenciesTree);
            scrollableContent.scanDomNode();
            return Promise.resolve({ focus() { dependenciesTree.domFocus(); } });
        }
        async Qb(extension, template, token) {
            if (token.isCancellationRequested) {
                return Promise.resolve(null);
            }
            const manifest = await this.mc(() => this.r.get(), template.content);
            if (token.isCancellationRequested) {
                return null;
            }
            if (!manifest) {
                return null;
            }
            return this.Tb(manifest, template.content, token);
        }
        async Rb(extension, template, token) {
            const content = (0, dom_1.$)('div', { class: 'subcontent', tabindex: '0' });
            const scrollableContent = new scrollableElement_1.$UP(content, {});
            const layout = () => scrollableContent.scanDomNode();
            const removeLayoutParticipant = arrays.$Sb(this.y, { layout });
            this.eb.add((0, lifecycle_1.$ic)(removeLayoutParticipant));
            const updateContent = () => {
                scrollableContent.scanDomNode();
                (0, dom_1.$_O)(content, this.Sb(extension, layout));
            };
            updateContent();
            this.rb.onDidChangeExtensionsStatus(e => {
                if (e.some(extensionIdentifier => (0, extensionManagementUtil_1.$po)({ id: extensionIdentifier.value }, extension.identifier))) {
                    updateContent();
                }
            }, this, this.eb);
            this.eb.add(scrollableContent);
            (0, dom_1.$0O)(template.content, scrollableContent.getDomNode());
            return content;
        }
        Sb(extension, onDetailsToggle) {
            const extensionStatus = this.lb.getExtensionStatus(extension);
            const element = (0, dom_1.$)('.runtime-status');
            if (extensionStatus?.activationTimes) {
                const activationTime = extensionStatus.activationTimes.codeLoadingTime + extensionStatus.activationTimes.activateCallTime;
                const activationElement = (0, dom_1.$0O)(element, (0, dom_1.$)('div.activation-details'));
                const activationReasonElement = (0, dom_1.$0O)(activationElement, (0, dom_1.$)('div.activation-element-entry'));
                (0, dom_1.$0O)(activationReasonElement, (0, dom_1.$)('span.activation-message-title', undefined, (0, nls_1.localize)(41, null)));
                (0, dom_1.$0O)(activationReasonElement, (0, dom_1.$)('code', undefined, extensionStatus.activationTimes.activationReason.startup ? (0, nls_1.localize)(42, null) : extensionStatus.activationTimes.activationReason.activationEvent));
                const activationTimeElement = (0, dom_1.$0O)(activationElement, (0, dom_1.$)('div.activation-element-entry'));
                (0, dom_1.$0O)(activationTimeElement, (0, dom_1.$)('span.activation-message-title', undefined, (0, nls_1.localize)(43, null)));
                (0, dom_1.$0O)(activationTimeElement, (0, dom_1.$)('code', undefined, `${activationTime}ms`));
                if (extensions_1.$Vl.toKey(extensionStatus.activationTimes.activationReason.extensionId) !== extensions_1.$Vl.toKey(extension.identifier.id)) {
                    const activatedByElement = (0, dom_1.$0O)(activationElement, (0, dom_1.$)('div.activation-element-entry'));
                    (0, dom_1.$0O)(activatedByElement, (0, dom_1.$)('span.activation-message-title', undefined, (0, nls_1.localize)(44, null)));
                    (0, dom_1.$0O)(activatedByElement, (0, dom_1.$)('span', undefined, extensionStatus.activationTimes.activationReason.extensionId.value));
                }
            }
            else if (extension.local && (extension.local.manifest.main || extension.local.manifest.browser)) {
                (0, dom_1.$0O)(element, (0, dom_1.$)('div.activation-message', undefined, (0, nls_1.localize)(45, null)));
            }
            if (extensionStatus?.runtimeErrors.length) {
                (0, dom_1.$0O)(element, (0, dom_1.$)('details', { open: true, ontoggle: onDetailsToggle }, (0, dom_1.$)('summary', { tabindex: '0' }, (0, nls_1.localize)(46, null, extensionStatus.runtimeErrors.length)), (0, dom_1.$)('div', undefined, ...extensionStatus.runtimeErrors.map(error => (0, dom_1.$)('div.message-entry', undefined, (0, dom_1.$)(`span${themables_1.ThemeIcon.asCSSSelector(extensionsIcons_1.$fhb)}`, undefined), (0, dom_1.$)('span', undefined, (0, errors_1.$8)(error)))))));
            }
            if (extensionStatus?.messages.length) {
                (0, dom_1.$0O)(element, (0, dom_1.$)('details', { open: true, ontoggle: onDetailsToggle }, (0, dom_1.$)('summary', { tabindex: '0' }, (0, nls_1.localize)(47, null, extensionStatus?.messages.length)), (0, dom_1.$)('div', undefined, ...extensionStatus.messages.sort((a, b) => b.type - a.type)
                    .map(message => (0, dom_1.$)('div.message-entry', undefined, (0, dom_1.$)(`span${themables_1.ThemeIcon.asCSSSelector(message.type === notification_1.Severity.Error ? extensionsIcons_1.$fhb : message.type === notification_1.Severity.Warning ? extensionsIcons_1.$ghb : extensionsIcons_1.$hhb)}`, undefined), (0, dom_1.$)('span', undefined, message.message))))));
            }
            if (element.children.length === 0) {
                (0, dom_1.$0O)(element, (0, dom_1.$)('div.no-status-message')).textContent = (0, nls_1.localize)(48, null);
            }
            return element;
        }
        async Tb(manifest, parent, token) {
            if (token.isCancellationRequested) {
                return null;
            }
            const content = (0, dom_1.$)('div', { class: 'subcontent' });
            const scrollableContent = new scrollableElement_1.$UP(content, { useShadows: false });
            (0, dom_1.$0O)(parent, scrollableContent.getDomNode());
            const extensionsGridView = this.jb.createInstance(extensionsViewer_1.$tUb, content, new extensionsList_1.$9Tb());
            const extensions = await (0, extensionsViewer_1.$wUb)(manifest.extensionPack, this.lb);
            extensionsGridView.setExtensions(extensions);
            scrollableContent.scanDomNode();
            this.eb.add(scrollableContent);
            this.eb.add(extensionsGridView);
            this.eb.add((0, lifecycle_1.$ic)(arrays.$Sb(this.y, { layout: () => scrollableContent.scanDomNode() })));
            return content;
        }
        Ub(container, manifest, onDetailsToggle) {
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
            const details = (0, dom_1.$)('details', { open: true, ontoggle: onDetailsToggle }, (0, dom_1.$)('summary', { tabindex: '0' }, (0, nls_1.localize)(49, null, contrib.length)), (0, dom_1.$)('table', undefined, (0, dom_1.$)('tr', undefined, (0, dom_1.$)('th', undefined, (0, nls_1.localize)(50, null)), (0, dom_1.$)('th', undefined, (0, nls_1.localize)(51, null)), (0, dom_1.$)('th', undefined, (0, nls_1.localize)(52, null))), ...contrib.map(key => {
                let description = properties[key].description || '';
                if (properties[key].markdownDescription) {
                    const { element, dispose } = (0, markdownRenderer_1.$zQ)({ value: properties[key].markdownDescription }, { actionHandler: { callback: (content) => this.pb.open(content).catch(errors_1.$Y), disposables: this.eb } });
                    description = element;
                    this.eb.add((0, lifecycle_1.$ic)(dispose));
                }
                return (0, dom_1.$)('tr', undefined, (0, dom_1.$)('td', undefined, (0, dom_1.$)('code', undefined, key)), (0, dom_1.$)('td', undefined, description), (0, dom_1.$)('td', undefined, (0, dom_1.$)('code', undefined, `${(0, types_1.$qf)(properties[key].default) ? (0, configurationRegistry_1.$nn)(properties[key].type) : properties[key].default}`)));
            })));
            (0, dom_1.$0O)(container, details);
            return true;
        }
        Vb(container, manifest, onDetailsToggle) {
            const contrib = manifest.contributes?.debuggers || [];
            if (!contrib.length) {
                return false;
            }
            const details = (0, dom_1.$)('details', { open: true, ontoggle: onDetailsToggle }, (0, dom_1.$)('summary', { tabindex: '0' }, (0, nls_1.localize)(53, null, contrib.length)), (0, dom_1.$)('table', undefined, (0, dom_1.$)('tr', undefined, (0, dom_1.$)('th', undefined, (0, nls_1.localize)(54, null)), (0, dom_1.$)('th', undefined, (0, nls_1.localize)(55, null))), ...contrib.map(d => (0, dom_1.$)('tr', undefined, (0, dom_1.$)('td', undefined, d.label), (0, dom_1.$)('td', undefined, d.type)))));
            (0, dom_1.$0O)(container, details);
            return true;
        }
        Wb(container, manifest, onDetailsToggle) {
            const contrib = manifest.contributes?.viewsContainers || {};
            const viewContainers = Object.keys(contrib).reduce((result, location) => {
                const viewContainersForLocation = contrib[location];
                result.push(...viewContainersForLocation.map(viewContainer => ({ ...viewContainer, location })));
                return result;
            }, []);
            if (!viewContainers.length) {
                return false;
            }
            const details = (0, dom_1.$)('details', { open: true, ontoggle: onDetailsToggle }, (0, dom_1.$)('summary', { tabindex: '0' }, (0, nls_1.localize)(56, null, viewContainers.length)), (0, dom_1.$)('table', undefined, (0, dom_1.$)('tr', undefined, (0, dom_1.$)('th', undefined, (0, nls_1.localize)(57, null)), (0, dom_1.$)('th', undefined, (0, nls_1.localize)(58, null)), (0, dom_1.$)('th', undefined, (0, nls_1.localize)(59, null))), ...viewContainers.map(viewContainer => (0, dom_1.$)('tr', undefined, (0, dom_1.$)('td', undefined, viewContainer.id), (0, dom_1.$)('td', undefined, viewContainer.title), (0, dom_1.$)('td', undefined, viewContainer.location)))));
            (0, dom_1.$0O)(container, details);
            return true;
        }
        Xb(container, manifest, onDetailsToggle) {
            const contrib = manifest.contributes?.views || {};
            const views = Object.keys(contrib).reduce((result, location) => {
                const viewsForLocation = contrib[location];
                result.push(...viewsForLocation.map(view => ({ ...view, location })));
                return result;
            }, []);
            if (!views.length) {
                return false;
            }
            const details = (0, dom_1.$)('details', { open: true, ontoggle: onDetailsToggle }, (0, dom_1.$)('summary', { tabindex: '0' }, (0, nls_1.localize)(60, null, views.length)), (0, dom_1.$)('table', undefined, (0, dom_1.$)('tr', undefined, (0, dom_1.$)('th', undefined, (0, nls_1.localize)(61, null)), (0, dom_1.$)('th', undefined, (0, nls_1.localize)(62, null)), (0, dom_1.$)('th', undefined, (0, nls_1.localize)(63, null))), ...views.map(view => (0, dom_1.$)('tr', undefined, (0, dom_1.$)('td', undefined, view.id), (0, dom_1.$)('td', undefined, view.name), (0, dom_1.$)('td', undefined, view.location)))));
            (0, dom_1.$0O)(container, details);
            return true;
        }
        Yb(container, manifest, onDetailsToggle) {
            const localizations = manifest.contributes?.localizations || [];
            if (!localizations.length) {
                return false;
            }
            const details = (0, dom_1.$)('details', { open: true, ontoggle: onDetailsToggle }, (0, dom_1.$)('summary', { tabindex: '0' }, (0, nls_1.localize)(64, null, localizations.length)), (0, dom_1.$)('table', undefined, (0, dom_1.$)('tr', undefined, (0, dom_1.$)('th', undefined, (0, nls_1.localize)(65, null)), (0, dom_1.$)('th', undefined, (0, nls_1.localize)(66, null)), (0, dom_1.$)('th', undefined, (0, nls_1.localize)(67, null))), ...localizations.map(localization => (0, dom_1.$)('tr', undefined, (0, dom_1.$)('td', undefined, localization.languageId), (0, dom_1.$)('td', undefined, localization.languageName || ''), (0, dom_1.$)('td', undefined, localization.localizedLanguageName || '')))));
            (0, dom_1.$0O)(container, details);
            return true;
        }
        Zb(container, manifest, onDetailsToggle) {
            const webviewEditors = manifest.contributes?.customEditors || [];
            if (!webviewEditors.length) {
                return false;
            }
            const details = (0, dom_1.$)('details', { open: true, ontoggle: onDetailsToggle }, (0, dom_1.$)('summary', { tabindex: '0' }, (0, nls_1.localize)(68, null, webviewEditors.length)), (0, dom_1.$)('table', undefined, (0, dom_1.$)('tr', undefined, (0, dom_1.$)('th', undefined, (0, nls_1.localize)(69, null)), (0, dom_1.$)('th', undefined, (0, nls_1.localize)(70, null)), (0, dom_1.$)('th', undefined, (0, nls_1.localize)(71, null))), ...webviewEditors.map(webviewEditor => (0, dom_1.$)('tr', undefined, (0, dom_1.$)('td', undefined, webviewEditor.viewType), (0, dom_1.$)('td', undefined, webviewEditor.priority), (0, dom_1.$)('td', undefined, arrays.$Fb(webviewEditor.selector.map(x => x.filenamePattern)).join(', '))))));
            (0, dom_1.$0O)(container, details);
            return true;
        }
        $b(container, manifest, onDetailsToggle) {
            const codeActions = manifest.contributes?.codeActions || [];
            if (!codeActions.length) {
                return false;
            }
            const flatActions = arrays.$Pb(codeActions.map(contribution => contribution.actions.map(action => ({ ...action, languages: contribution.languages }))));
            const details = (0, dom_1.$)('details', { open: true, ontoggle: onDetailsToggle }, (0, dom_1.$)('summary', { tabindex: '0' }, (0, nls_1.localize)(72, null, flatActions.length)), (0, dom_1.$)('table', undefined, (0, dom_1.$)('tr', undefined, (0, dom_1.$)('th', undefined, (0, nls_1.localize)(73, null)), (0, dom_1.$)('th', undefined, (0, nls_1.localize)(74, null)), (0, dom_1.$)('th', undefined, (0, nls_1.localize)(75, null)), (0, dom_1.$)('th', undefined, (0, nls_1.localize)(76, null))), ...flatActions.map(action => (0, dom_1.$)('tr', undefined, (0, dom_1.$)('td', undefined, action.title), (0, dom_1.$)('td', undefined, (0, dom_1.$)('code', undefined, action.kind)), (0, dom_1.$)('td', undefined, action.description ?? ''), (0, dom_1.$)('td', undefined, ...action.languages.map(language => (0, dom_1.$)('code', undefined, language)))))));
            (0, dom_1.$0O)(container, details);
            return true;
        }
        ac(container, manifest, onDetailsToggle) {
            const authentication = manifest.contributes?.authentication || [];
            if (!authentication.length) {
                return false;
            }
            const details = (0, dom_1.$)('details', { open: true, ontoggle: onDetailsToggle }, (0, dom_1.$)('summary', { tabindex: '0' }, (0, nls_1.localize)(77, null, authentication.length)), (0, dom_1.$)('table', undefined, (0, dom_1.$)('tr', undefined, (0, dom_1.$)('th', undefined, (0, nls_1.localize)(78, null)), (0, dom_1.$)('th', undefined, (0, nls_1.localize)(79, null))), ...authentication.map(action => (0, dom_1.$)('tr', undefined, (0, dom_1.$)('td', undefined, action.label), (0, dom_1.$)('td', undefined, action.id)))));
            (0, dom_1.$0O)(container, details);
            return true;
        }
        bc(container, manifest, onDetailsToggle) {
            const contrib = manifest.contributes?.themes || [];
            if (!contrib.length) {
                return false;
            }
            const details = (0, dom_1.$)('details', { open: true, ontoggle: onDetailsToggle }, (0, dom_1.$)('summary', { tabindex: '0' }, (0, nls_1.localize)(80, null, contrib.length)), (0, dom_1.$)('ul', undefined, ...contrib.map(theme => (0, dom_1.$)('li', undefined, theme.label))));
            (0, dom_1.$0O)(container, details);
            return true;
        }
        cc(container, manifest, onDetailsToggle) {
            const contrib = manifest.contributes?.iconThemes || [];
            if (!contrib.length) {
                return false;
            }
            const details = (0, dom_1.$)('details', { open: true, ontoggle: onDetailsToggle }, (0, dom_1.$)('summary', { tabindex: '0' }, (0, nls_1.localize)(81, null, contrib.length)), (0, dom_1.$)('ul', undefined, ...contrib.map(theme => (0, dom_1.$)('li', undefined, theme.label))));
            (0, dom_1.$0O)(container, details);
            return true;
        }
        dc(container, manifest, onDetailsToggle) {
            const contrib = manifest.contributes?.productIconThemes || [];
            if (!contrib.length) {
                return false;
            }
            const details = (0, dom_1.$)('details', { open: true, ontoggle: onDetailsToggle }, (0, dom_1.$)('summary', { tabindex: '0' }, (0, nls_1.localize)(82, null, contrib.length)), (0, dom_1.$)('ul', undefined, ...contrib.map(theme => (0, dom_1.$)('li', undefined, theme.label))));
            (0, dom_1.$0O)(container, details);
            return true;
        }
        ec(container, manifest, onDetailsToggle) {
            const colors = manifest.contributes?.colors || [];
            if (!colors.length) {
                return false;
            }
            function colorPreview(colorReference) {
                const result = [];
                if (colorReference && colorReference[0] === '#') {
                    const color = color_1.$Os.fromHex(colorReference);
                    if (color) {
                        result.push((0, dom_1.$)('span', { class: 'colorBox', style: 'background-color: ' + color_1.$Os.Format.CSS.format(color) }, ''));
                    }
                }
                result.push((0, dom_1.$)('code', undefined, colorReference));
                return result;
            }
            const details = (0, dom_1.$)('details', { open: true, ontoggle: onDetailsToggle }, (0, dom_1.$)('summary', { tabindex: '0' }, (0, nls_1.localize)(83, null, colors.length)), (0, dom_1.$)('table', undefined, (0, dom_1.$)('tr', undefined, (0, dom_1.$)('th', undefined, (0, nls_1.localize)(84, null)), (0, dom_1.$)('th', undefined, (0, nls_1.localize)(85, null)), (0, dom_1.$)('th', undefined, (0, nls_1.localize)(86, null)), (0, dom_1.$)('th', undefined, (0, nls_1.localize)(87, null)), (0, dom_1.$)('th', undefined, (0, nls_1.localize)(88, null))), ...colors.map(color => (0, dom_1.$)('tr', undefined, (0, dom_1.$)('td', undefined, (0, dom_1.$)('code', undefined, color.id)), (0, dom_1.$)('td', undefined, color.description), (0, dom_1.$)('td', undefined, ...colorPreview(color.defaults.dark)), (0, dom_1.$)('td', undefined, ...colorPreview(color.defaults.light)), (0, dom_1.$)('td', undefined, ...colorPreview(color.defaults.highContrast))))));
            (0, dom_1.$0O)(container, details);
            return true;
        }
        fc(container, manifest, onDetailsToggle) {
            const contrib = manifest.contributes?.jsonValidation || [];
            if (!contrib.length) {
                return false;
            }
            const details = (0, dom_1.$)('details', { open: true, ontoggle: onDetailsToggle }, (0, dom_1.$)('summary', { tabindex: '0' }, (0, nls_1.localize)(89, null, contrib.length)), (0, dom_1.$)('table', undefined, (0, dom_1.$)('tr', undefined, (0, dom_1.$)('th', undefined, (0, nls_1.localize)(90, null)), (0, dom_1.$)('th', undefined, (0, nls_1.localize)(91, null))), ...contrib.map(v => (0, dom_1.$)('tr', undefined, (0, dom_1.$)('td', undefined, (0, dom_1.$)('code', undefined, Array.isArray(v.fileMatch) ? v.fileMatch.join(', ') : v.fileMatch)), (0, dom_1.$)('td', undefined, v.url)))));
            (0, dom_1.$0O)(container, details);
            return true;
        }
        gc(container, manifest, onDetailsToggle) {
            const rawCommands = manifest.contributes?.commands || [];
            const commands = rawCommands.map(c => ({
                id: c.command,
                title: c.title,
                keybindings: [],
                menus: []
            }));
            const byId = arrays.$Rb(commands, c => c.id);
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
                const keybinding = this.lc(rawKeybinding);
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
                const kbl = new keybindingLabel_1.$TR(element, platform_1.OS, defaultStyles_1.$g2);
                kbl.set(keybinding);
                return element;
            };
            const details = (0, dom_1.$)('details', { open: true, ontoggle: onDetailsToggle }, (0, dom_1.$)('summary', { tabindex: '0' }, (0, nls_1.localize)(92, null, commands.length)), (0, dom_1.$)('table', undefined, (0, dom_1.$)('tr', undefined, (0, dom_1.$)('th', undefined, (0, nls_1.localize)(93, null)), (0, dom_1.$)('th', undefined, (0, nls_1.localize)(94, null)), (0, dom_1.$)('th', undefined, (0, nls_1.localize)(95, null)), (0, dom_1.$)('th', undefined, (0, nls_1.localize)(96, null))), ...commands.map(c => (0, dom_1.$)('tr', undefined, (0, dom_1.$)('td', undefined, (0, dom_1.$)('code', undefined, c.id)), (0, dom_1.$)('td', undefined, typeof c.title === 'string' ? c.title : c.title.value), (0, dom_1.$)('td', undefined, ...c.keybindings.map(keybinding => renderKeybinding(keybinding))), (0, dom_1.$)('td', undefined, ...c.menus.map(context => (0, dom_1.$)('code', undefined, context)))))));
            (0, dom_1.$0O)(container, details);
            return true;
        }
        hc(container, manifest, onDetailsToggle) {
            const contributes = manifest.contributes;
            const rawLanguages = contributes?.languages || [];
            const languages = rawLanguages.map(l => ({
                id: l.id,
                name: (l.aliases || [])[0] || l.id,
                extensions: l.extensions || [],
                hasGrammar: false,
                hasSnippets: false
            }));
            const byId = arrays.$Rb(languages, l => l.id);
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
            const details = (0, dom_1.$)('details', { open: true, ontoggle: onDetailsToggle }, (0, dom_1.$)('summary', { tabindex: '0' }, (0, nls_1.localize)(97, null, languages.length)), (0, dom_1.$)('table', undefined, (0, dom_1.$)('tr', undefined, (0, dom_1.$)('th', undefined, (0, nls_1.localize)(98, null)), (0, dom_1.$)('th', undefined, (0, nls_1.localize)(99, null)), (0, dom_1.$)('th', undefined, (0, nls_1.localize)(100, null)), (0, dom_1.$)('th', undefined, (0, nls_1.localize)(101, null)), (0, dom_1.$)('th', undefined, (0, nls_1.localize)(102, null))), ...languages.map(l => (0, dom_1.$)('tr', undefined, (0, dom_1.$)('td', undefined, l.id), (0, dom_1.$)('td', undefined, l.name), (0, dom_1.$)('td', undefined, ...(0, dom_1.$bP)(l.extensions.map(ext => (0, dom_1.$)('code', undefined, ext)), ' ')), (0, dom_1.$)('td', undefined, document.createTextNode(l.hasGrammar ? '✔︎' : '\u2014')), (0, dom_1.$)('td', undefined, document.createTextNode(l.hasSnippets ? '✔︎' : '\u2014'))))));
            (0, dom_1.$0O)(container, details);
            return true;
        }
        ic(container, manifest, onDetailsToggle) {
            const activationEvents = manifest.activationEvents || [];
            if (!activationEvents.length) {
                return false;
            }
            const details = (0, dom_1.$)('details', { open: true, ontoggle: onDetailsToggle }, (0, dom_1.$)('summary', { tabindex: '0' }, (0, nls_1.localize)(103, null, activationEvents.length)), (0, dom_1.$)('ul', undefined, ...activationEvents.map(activationEvent => (0, dom_1.$)('li', undefined, (0, dom_1.$)('code', undefined, activationEvent)))));
            (0, dom_1.$0O)(container, details);
            return true;
        }
        jc(container, manifest, onDetailsToggle) {
            const contrib = manifest.contributes?.notebooks || [];
            if (!contrib.length) {
                return false;
            }
            const details = (0, dom_1.$)('details', { open: true, ontoggle: onDetailsToggle }, (0, dom_1.$)('summary', { tabindex: '0' }, (0, nls_1.localize)(104, null, contrib.length)), (0, dom_1.$)('table', undefined, (0, dom_1.$)('tr', undefined, (0, dom_1.$)('th', undefined, (0, nls_1.localize)(105, null)), (0, dom_1.$)('th', undefined, (0, nls_1.localize)(106, null))), ...contrib.map(d => (0, dom_1.$)('tr', undefined, (0, dom_1.$)('td', undefined, d.type), (0, dom_1.$)('td', undefined, d.displayName)))));
            (0, dom_1.$0O)(container, details);
            return true;
        }
        kc(container, manifest, onDetailsToggle) {
            const contrib = manifest.contributes?.notebookRenderer || [];
            if (!contrib.length) {
                return false;
            }
            const details = (0, dom_1.$)('details', { open: true, ontoggle: onDetailsToggle }, (0, dom_1.$)('summary', { tabindex: '0' }, (0, nls_1.localize)(107, null, contrib.length)), (0, dom_1.$)('table', undefined, (0, dom_1.$)('tr', undefined, (0, dom_1.$)('th', undefined, (0, nls_1.localize)(108, null)), (0, dom_1.$)('th', undefined, (0, nls_1.localize)(109, null))), ...contrib.map(d => (0, dom_1.$)('tr', undefined, (0, dom_1.$)('td', undefined, d.displayName), (0, dom_1.$)('td', undefined, d.mimeTypes.join(','))))));
            (0, dom_1.$0O)(container, details);
            return true;
        }
        lc(rawKeyBinding) {
            let key;
            switch (process_1.$3d) {
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
            return this.nb.resolveUserBinding(key || rawKeyBinding.key)[0];
        }
        mc(loadingTask, container) {
            container.classList.add('loading');
            const result = this.eb.add(loadingTask());
            const onDone = () => container.classList.remove('loading');
            result.promise.then(onDone, onDone);
            return result.promise;
        }
        layout(dimension) {
            this.hb = dimension;
            this.y.forEach(p => p.layout());
        }
        nc(err) {
            if ((0, errors_1.$2)(err)) {
                return;
            }
            this.ob.error(err);
        }
    };
    exports.$AUb = $AUb;
    exports.$AUb = $AUb = $AUb_1 = __decorate([
        __param(0, telemetry_1.$9k),
        __param(1, instantiation_1.$Ah),
        __param(2, panecomposite_1.$Yeb),
        __param(3, extensions_2.$Pfb),
        __param(4, extensionManagement_1.$Zn),
        __param(5, themeService_1.$gv),
        __param(6, keybinding_1.$2D),
        __param(7, notification_1.$Yu),
        __param(8, opener_1.$NT),
        __param(9, extensionRecommendations_1.$9fb),
        __param(10, storage_1.$Vo),
        __param(11, extensions_3.$MF),
        __param(12, webview_1.$Lbb),
        __param(13, language_1.$ct),
        __param(14, contextView_1.$WZ),
        __param(15, contextkey_1.$3i)
    ], $AUb);
    const contextKeyExpr = contextkey_1.$Ii.and(contextkey_1.$Ii.equals('activeEditor', $AUb.ID), editorContextKeys_1.EditorContextKeys.focus.toNegated());
    (0, actions_2.$Xu)(class ShowExtensionEditorFindAction extends actions_2.$Wu {
        constructor() {
            super({
                id: 'editor.action.extensioneditor.showfind',
                title: (0, nls_1.localize)(110, null),
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
    (0, actions_2.$Xu)(class StartExtensionEditorFindNextAction extends actions_2.$Wu {
        constructor() {
            super({
                id: 'editor.action.extensioneditor.findNext',
                title: (0, nls_1.localize)(111, null),
                keybinding: {
                    when: contextkey_1.$Ii.and(contextKeyExpr, webview_1.$Jbb),
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
    (0, actions_2.$Xu)(class StartExtensionEditorFindPreviousAction extends actions_2.$Wu {
        constructor() {
            super({
                id: 'editor.action.extensioneditor.findPrevious',
                title: (0, nls_1.localize)(112, null),
                keybinding: {
                    when: contextkey_1.$Ii.and(contextKeyExpr, webview_1.$Jbb),
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
    (0, themeService_1.$mv)((theme, collector) => {
        const link = theme.getColor(colorRegistry_1.$Ev);
        if (link) {
            collector.addRule(`.monaco-workbench .extension-editor .content .details .additional-details-container .resources-container a.resource { color: ${link}; }`);
            collector.addRule(`.monaco-workbench .extension-editor .content .feature-contributions a { color: ${link}; }`);
        }
        const activeLink = theme.getColor(colorRegistry_1.$Fv);
        if (activeLink) {
            collector.addRule(`.monaco-workbench .extension-editor .content .details .additional-details-container .resources-container a.resource:hover,
			.monaco-workbench .extension-editor .content .details .additional-details-container .resources-container a.resource:active { color: ${activeLink}; }`);
            collector.addRule(`.monaco-workbench .extension-editor .content .feature-contributions a:hover,
			.monaco-workbench .extension-editor .content .feature-contributions a:active { color: ${activeLink}; }`);
        }
        const buttonHoverBackgroundColor = theme.getColor(colorRegistry_1.$$v);
        if (buttonHoverBackgroundColor) {
            collector.addRule(`.monaco-workbench .extension-editor .content > .details > .additional-details-container .categories-container > .categories > .category:hover { background-color: ${buttonHoverBackgroundColor}; border-color: ${buttonHoverBackgroundColor}; }`);
            collector.addRule(`.monaco-workbench .extension-editor .content > .details > .additional-details-container .tags-container > .tags > .tag:hover { background-color: ${buttonHoverBackgroundColor}; border-color: ${buttonHoverBackgroundColor}; }`);
        }
        const buttonForegroundColor = theme.getColor(colorRegistry_1.$8v);
        if (buttonForegroundColor) {
            collector.addRule(`.monaco-workbench .extension-editor .content > .details > .additional-details-container .categories-container > .categories > .category:hover { color: ${buttonForegroundColor}; }`);
            collector.addRule(`.monaco-workbench .extension-editor .content > .details > .additional-details-container .tags-container > .tags > .tag:hover { color: ${buttonForegroundColor}; }`);
        }
    });
    function getExtensionEditor(accessor) {
        const activeEditorPane = accessor.get(editorService_1.$9C).activeEditorPane;
        if (activeEditorPane instanceof $AUb) {
            return activeEditorPane;
        }
        return null;
    }
});
//# sourceMappingURL=extensionEditor.js.map