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
define(["require", "exports", "vs/base/common/semver/semver", "vs/base/common/lifecycle", "vs/workbench/contrib/extensions/common/extensions", "vs/base/browser/dom", "vs/base/common/platform", "vs/nls", "vs/workbench/services/extensionManagement/common/extensionManagement", "vs/workbench/services/extensionRecommendations/common/extensionRecommendations", "vs/platform/label/common/label", "vs/workbench/contrib/extensions/browser/extensionsActions", "vs/platform/theme/common/themeService", "vs/base/common/themables", "vs/workbench/common/theme", "vs/base/common/event", "vs/platform/instantiation/common/instantiation", "vs/base/browser/ui/countBadge/countBadge", "vs/platform/configuration/common/configuration", "vs/platform/userDataSync/common/userDataSync", "vs/workbench/contrib/extensions/browser/extensionsIcons", "vs/platform/theme/common/colorRegistry", "vs/workbench/services/hover/browser/hover", "vs/base/common/htmlContent", "vs/base/common/uri", "vs/workbench/services/extensions/common/extensions", "vs/platform/extensionManagement/common/extensionManagementUtil", "vs/base/common/severity", "vs/base/browser/ui/iconLabel/iconLabelHover", "vs/base/common/color", "vs/base/browser/markdownRenderer", "vs/platform/opener/common/opener", "vs/base/common/errors", "vs/base/browser/ui/iconLabel/iconLabels", "vs/base/browser/keyboardEvent", "vs/platform/telemetry/common/telemetry", "vs/platform/theme/browser/defaultStyles", "vs/css!./media/extensionsWidgets"], function (require, exports, semver, lifecycle_1, extensions_1, dom_1, platform, nls_1, extensionManagement_1, extensionRecommendations_1, label_1, extensionsActions_1, themeService_1, themables_1, theme_1, event_1, instantiation_1, countBadge_1, configuration_1, userDataSync_1, extensionsIcons_1, colorRegistry_1, hover_1, htmlContent_1, uri_1, extensions_2, extensionManagementUtil_1, severity_1, iconLabelHover_1, color_1, markdownRenderer_1, opener_1, errors_1, iconLabels_1, keyboardEvent_1, telemetry_1, defaultStyles_1) {
    "use strict";
    var ExtensionHoverWidget_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.extensionSponsorIconColor = exports.extensionPreReleaseIconColor = exports.extensionVerifiedPublisherIconColor = exports.extensionRatingIconColor = exports.ExtensionRecommendationWidget = exports.ExtensionStatusWidget = exports.ExtensionHoverWidget = exports.ExtensionActivationStatusWidget = exports.SyncIgnoredWidget = exports.ExtensionPackCountWidget = exports.RemoteBadgeWidget = exports.PreReleaseBookmarkWidget = exports.RecommendationWidget = exports.SponsorWidget = exports.VerifiedPublisherWidget = exports.RatingsWidget = exports.InstallCountWidget = exports.onClick = exports.ExtensionWidget = void 0;
    class ExtensionWidget extends lifecycle_1.Disposable {
        constructor() {
            super(...arguments);
            this._extension = null;
        }
        get extension() { return this._extension; }
        set extension(extension) { this._extension = extension; this.update(); }
        update() { this.render(); }
    }
    exports.ExtensionWidget = ExtensionWidget;
    function onClick(element, callback) {
        const disposables = new lifecycle_1.DisposableStore();
        disposables.add((0, dom_1.addDisposableListener)(element, dom_1.EventType.CLICK, (0, dom_1.finalHandler)(callback)));
        disposables.add((0, dom_1.addDisposableListener)(element, dom_1.EventType.KEY_UP, e => {
            const keyboardEvent = new keyboardEvent_1.StandardKeyboardEvent(e);
            if (keyboardEvent.equals(10 /* KeyCode.Space */) || keyboardEvent.equals(3 /* KeyCode.Enter */)) {
                e.preventDefault();
                e.stopPropagation();
                callback();
            }
        }));
        return disposables;
    }
    exports.onClick = onClick;
    class InstallCountWidget extends ExtensionWidget {
        constructor(container, small) {
            super();
            this.container = container;
            this.small = small;
            container.classList.add('extension-install-count');
            this.render();
        }
        render() {
            this.container.innerText = '';
            if (!this.extension) {
                return;
            }
            if (this.small && this.extension.state === 1 /* ExtensionState.Installed */) {
                return;
            }
            const installLabel = InstallCountWidget.getInstallLabel(this.extension, this.small);
            if (!installLabel) {
                return;
            }
            (0, dom_1.append)(this.container, (0, dom_1.$)('span' + themables_1.ThemeIcon.asCSSSelector(extensionsIcons_1.installCountIcon)));
            const count = (0, dom_1.append)(this.container, (0, dom_1.$)('span.count'));
            count.textContent = installLabel;
        }
        static getInstallLabel(extension, small) {
            const installCount = extension.installCount;
            if (installCount === undefined) {
                return undefined;
            }
            let installLabel;
            if (small) {
                if (installCount > 1000000) {
                    installLabel = `${Math.floor(installCount / 100000) / 10}M`;
                }
                else if (installCount > 1000) {
                    installLabel = `${Math.floor(installCount / 1000)}K`;
                }
                else {
                    installLabel = String(installCount);
                }
            }
            else {
                installLabel = installCount.toLocaleString(platform.language);
            }
            return installLabel;
        }
    }
    exports.InstallCountWidget = InstallCountWidget;
    class RatingsWidget extends ExtensionWidget {
        constructor(container, small) {
            super();
            this.container = container;
            this.small = small;
            container.classList.add('extension-ratings');
            if (this.small) {
                container.classList.add('small');
            }
            this.render();
        }
        render() {
            this.container.innerText = '';
            this.container.title = '';
            if (!this.extension) {
                return;
            }
            if (this.small && this.extension.state === 1 /* ExtensionState.Installed */) {
                return;
            }
            if (this.extension.rating === undefined) {
                return;
            }
            if (this.small && !this.extension.ratingCount) {
                return;
            }
            const rating = Math.round(this.extension.rating * 2) / 2;
            this.container.title = (0, nls_1.localize)('ratedLabel', "Average rating: {0} out of 5", rating);
            if (this.small) {
                (0, dom_1.append)(this.container, (0, dom_1.$)('span' + themables_1.ThemeIcon.asCSSSelector(extensionsIcons_1.starFullIcon)));
                const count = (0, dom_1.append)(this.container, (0, dom_1.$)('span.count'));
                count.textContent = String(rating);
            }
            else {
                for (let i = 1; i <= 5; i++) {
                    if (rating >= i) {
                        (0, dom_1.append)(this.container, (0, dom_1.$)('span' + themables_1.ThemeIcon.asCSSSelector(extensionsIcons_1.starFullIcon)));
                    }
                    else if (rating >= i - 0.5) {
                        (0, dom_1.append)(this.container, (0, dom_1.$)('span' + themables_1.ThemeIcon.asCSSSelector(extensionsIcons_1.starHalfIcon)));
                    }
                    else {
                        (0, dom_1.append)(this.container, (0, dom_1.$)('span' + themables_1.ThemeIcon.asCSSSelector(extensionsIcons_1.starEmptyIcon)));
                    }
                }
                if (this.extension.ratingCount) {
                    const ratingCountElemet = (0, dom_1.append)(this.container, (0, dom_1.$)('span', undefined, ` (${this.extension.ratingCount})`));
                    ratingCountElemet.style.paddingLeft = '1px';
                }
            }
        }
    }
    exports.RatingsWidget = RatingsWidget;
    let VerifiedPublisherWidget = class VerifiedPublisherWidget extends ExtensionWidget {
        constructor(container, small, openerService) {
            super();
            this.container = container;
            this.small = small;
            this.openerService = openerService;
            this.disposables = this._register(new lifecycle_1.DisposableStore());
            this.render();
        }
        render() {
            (0, dom_1.reset)(this.container);
            this.disposables.clear();
            if (!this.extension?.publisherDomain?.verified) {
                return;
            }
            const publisherDomainLink = uri_1.URI.parse(this.extension.publisherDomain.link);
            const verifiedPublisher = (0, dom_1.append)(this.container, (0, dom_1.$)('span.extension-verified-publisher.clickable'));
            (0, dom_1.append)(verifiedPublisher, (0, iconLabels_1.renderIcon)(extensionsIcons_1.verifiedPublisherIcon));
            if (!this.small) {
                verifiedPublisher.tabIndex = 0;
                verifiedPublisher.title = this.extension.publisherDomain.link;
                verifiedPublisher.setAttribute('role', 'link');
                (0, dom_1.append)(verifiedPublisher, (0, dom_1.$)('span.extension-verified-publisher-domain', undefined, publisherDomainLink.authority.startsWith('www.') ? publisherDomainLink.authority.substring(4) : publisherDomainLink.authority));
                this.disposables.add(onClick(verifiedPublisher, () => this.openerService.open(publisherDomainLink)));
            }
        }
    };
    exports.VerifiedPublisherWidget = VerifiedPublisherWidget;
    exports.VerifiedPublisherWidget = VerifiedPublisherWidget = __decorate([
        __param(2, opener_1.IOpenerService)
    ], VerifiedPublisherWidget);
    let SponsorWidget = class SponsorWidget extends ExtensionWidget {
        constructor(container, openerService, telemetryService) {
            super();
            this.container = container;
            this.openerService = openerService;
            this.telemetryService = telemetryService;
            this.disposables = this._register(new lifecycle_1.DisposableStore());
            this.render();
        }
        render() {
            (0, dom_1.reset)(this.container);
            this.disposables.clear();
            if (!this.extension?.publisherSponsorLink) {
                return;
            }
            const sponsor = (0, dom_1.append)(this.container, (0, dom_1.$)('span.sponsor.clickable', { tabIndex: 0, title: this.extension?.publisherSponsorLink }));
            sponsor.setAttribute('role', 'link'); // #132645
            const sponsorIconElement = (0, iconLabels_1.renderIcon)(extensionsIcons_1.sponsorIcon);
            const label = (0, dom_1.$)('span', undefined, (0, nls_1.localize)('sponsor', "Sponsor"));
            (0, dom_1.append)(sponsor, sponsorIconElement, label);
            this.disposables.add(onClick(sponsor, () => {
                this.telemetryService.publicLog2('extensionsAction.sponsorExtension', { extensionId: this.extension.identifier.id });
                this.openerService.open(this.extension.publisherSponsorLink);
            }));
        }
    };
    exports.SponsorWidget = SponsorWidget;
    exports.SponsorWidget = SponsorWidget = __decorate([
        __param(1, opener_1.IOpenerService),
        __param(2, telemetry_1.ITelemetryService)
    ], SponsorWidget);
    let RecommendationWidget = class RecommendationWidget extends ExtensionWidget {
        constructor(parent, extensionRecommendationsService) {
            super();
            this.parent = parent;
            this.extensionRecommendationsService = extensionRecommendationsService;
            this.disposables = this._register(new lifecycle_1.DisposableStore());
            this.render();
            this._register((0, lifecycle_1.toDisposable)(() => this.clear()));
            this._register(this.extensionRecommendationsService.onDidChangeRecommendations(() => this.render()));
        }
        clear() {
            if (this.element) {
                this.parent.removeChild(this.element);
            }
            this.element = undefined;
            this.disposables.clear();
        }
        render() {
            this.clear();
            if (!this.extension || this.extension.state === 1 /* ExtensionState.Installed */ || this.extension.deprecationInfo) {
                return;
            }
            const extRecommendations = this.extensionRecommendationsService.getAllRecommendationsWithReason();
            if (extRecommendations[this.extension.identifier.id.toLowerCase()]) {
                this.element = (0, dom_1.append)(this.parent, (0, dom_1.$)('div.extension-bookmark'));
                const recommendation = (0, dom_1.append)(this.element, (0, dom_1.$)('.recommendation'));
                (0, dom_1.append)(recommendation, (0, dom_1.$)('span' + themables_1.ThemeIcon.asCSSSelector(extensionsIcons_1.ratingIcon)));
            }
        }
    };
    exports.RecommendationWidget = RecommendationWidget;
    exports.RecommendationWidget = RecommendationWidget = __decorate([
        __param(1, extensionRecommendations_1.IExtensionRecommendationsService)
    ], RecommendationWidget);
    class PreReleaseBookmarkWidget extends ExtensionWidget {
        constructor(parent) {
            super();
            this.parent = parent;
            this.disposables = this._register(new lifecycle_1.DisposableStore());
            this.render();
            this._register((0, lifecycle_1.toDisposable)(() => this.clear()));
        }
        clear() {
            if (this.element) {
                this.parent.removeChild(this.element);
            }
            this.element = undefined;
            this.disposables.clear();
        }
        render() {
            this.clear();
            if (!this.extension) {
                return;
            }
            if (!this.extension.hasPreReleaseVersion) {
                return;
            }
            if (this.extension.state === 1 /* ExtensionState.Installed */ && !this.extension.local?.isPreReleaseVersion) {
                return;
            }
            this.element = (0, dom_1.append)(this.parent, (0, dom_1.$)('div.extension-bookmark'));
            const preRelease = (0, dom_1.append)(this.element, (0, dom_1.$)('.pre-release'));
            (0, dom_1.append)(preRelease, (0, dom_1.$)('span' + themables_1.ThemeIcon.asCSSSelector(extensionsIcons_1.preReleaseIcon)));
        }
    }
    exports.PreReleaseBookmarkWidget = PreReleaseBookmarkWidget;
    let RemoteBadgeWidget = class RemoteBadgeWidget extends ExtensionWidget {
        constructor(parent, tooltip, extensionManagementServerService, instantiationService) {
            super();
            this.tooltip = tooltip;
            this.extensionManagementServerService = extensionManagementServerService;
            this.instantiationService = instantiationService;
            this.remoteBadge = this._register(new lifecycle_1.MutableDisposable());
            this.element = (0, dom_1.append)(parent, (0, dom_1.$)('.extension-remote-badge-container'));
            this.render();
            this._register((0, lifecycle_1.toDisposable)(() => this.clear()));
        }
        clear() {
            if (this.remoteBadge.value) {
                this.element.removeChild(this.remoteBadge.value.element);
            }
            this.remoteBadge.clear();
        }
        render() {
            this.clear();
            if (!this.extension || !this.extension.local || !this.extension.server || !(this.extensionManagementServerService.localExtensionManagementServer && this.extensionManagementServerService.remoteExtensionManagementServer) || this.extension.server !== this.extensionManagementServerService.remoteExtensionManagementServer) {
                return;
            }
            this.remoteBadge.value = this.instantiationService.createInstance(RemoteBadge, this.tooltip);
            (0, dom_1.append)(this.element, this.remoteBadge.value.element);
        }
    };
    exports.RemoteBadgeWidget = RemoteBadgeWidget;
    exports.RemoteBadgeWidget = RemoteBadgeWidget = __decorate([
        __param(2, extensionManagement_1.IExtensionManagementServerService),
        __param(3, instantiation_1.IInstantiationService)
    ], RemoteBadgeWidget);
    let RemoteBadge = class RemoteBadge extends lifecycle_1.Disposable {
        constructor(tooltip, labelService, themeService, extensionManagementServerService) {
            super();
            this.tooltip = tooltip;
            this.labelService = labelService;
            this.themeService = themeService;
            this.extensionManagementServerService = extensionManagementServerService;
            this.element = (0, dom_1.$)('div.extension-badge.extension-remote-badge');
            this.render();
        }
        render() {
            (0, dom_1.append)(this.element, (0, dom_1.$)('span' + themables_1.ThemeIcon.asCSSSelector(extensionsIcons_1.remoteIcon)));
            const applyBadgeStyle = () => {
                if (!this.element) {
                    return;
                }
                const bgColor = this.themeService.getColorTheme().getColor(theme_1.EXTENSION_BADGE_REMOTE_BACKGROUND);
                const fgColor = this.themeService.getColorTheme().getColor(theme_1.EXTENSION_BADGE_REMOTE_FOREGROUND);
                this.element.style.backgroundColor = bgColor ? bgColor.toString() : '';
                this.element.style.color = fgColor ? fgColor.toString() : '';
            };
            applyBadgeStyle();
            this._register(this.themeService.onDidColorThemeChange(() => applyBadgeStyle()));
            if (this.tooltip) {
                const updateTitle = () => {
                    if (this.element && this.extensionManagementServerService.remoteExtensionManagementServer) {
                        this.element.title = (0, nls_1.localize)('remote extension title', "Extension in {0}", this.extensionManagementServerService.remoteExtensionManagementServer.label);
                    }
                };
                this._register(this.labelService.onDidChangeFormatters(() => updateTitle()));
                updateTitle();
            }
        }
    };
    RemoteBadge = __decorate([
        __param(1, label_1.ILabelService),
        __param(2, themeService_1.IThemeService),
        __param(3, extensionManagement_1.IExtensionManagementServerService)
    ], RemoteBadge);
    class ExtensionPackCountWidget extends ExtensionWidget {
        constructor(parent) {
            super();
            this.parent = parent;
            this.render();
            this._register((0, lifecycle_1.toDisposable)(() => this.clear()));
        }
        clear() {
            this.element?.remove();
        }
        render() {
            this.clear();
            if (!this.extension || !(this.extension.categories?.some(category => category.toLowerCase() === 'extension packs')) || !this.extension.extensionPack.length) {
                return;
            }
            this.element = (0, dom_1.append)(this.parent, (0, dom_1.$)('.extension-badge.extension-pack-badge'));
            const countBadge = new countBadge_1.CountBadge(this.element, {}, defaultStyles_1.defaultCountBadgeStyles);
            countBadge.setCount(this.extension.extensionPack.length);
        }
    }
    exports.ExtensionPackCountWidget = ExtensionPackCountWidget;
    let SyncIgnoredWidget = class SyncIgnoredWidget extends ExtensionWidget {
        constructor(container, configurationService, extensionsWorkbenchService, userDataSyncEnablementService) {
            super();
            this.container = container;
            this.configurationService = configurationService;
            this.extensionsWorkbenchService = extensionsWorkbenchService;
            this.userDataSyncEnablementService = userDataSyncEnablementService;
            this._register(event_1.Event.filter(this.configurationService.onDidChangeConfiguration, e => e.affectsConfiguration('settingsSync.ignoredExtensions'))(() => this.render()));
            this._register(userDataSyncEnablementService.onDidChangeEnablement(() => this.update()));
            this.render();
        }
        render() {
            this.container.innerText = '';
            if (this.extension && this.extension.state === 1 /* ExtensionState.Installed */ && this.userDataSyncEnablementService.isEnabled() && this.extensionsWorkbenchService.isExtensionIgnoredToSync(this.extension)) {
                const element = (0, dom_1.append)(this.container, (0, dom_1.$)('span.extension-sync-ignored' + themables_1.ThemeIcon.asCSSSelector(extensionsIcons_1.syncIgnoredIcon)));
                element.title = (0, nls_1.localize)('syncingore.label', "This extension is ignored during sync.");
                element.classList.add(...themables_1.ThemeIcon.asClassNameArray(extensionsIcons_1.syncIgnoredIcon));
            }
        }
    };
    exports.SyncIgnoredWidget = SyncIgnoredWidget;
    exports.SyncIgnoredWidget = SyncIgnoredWidget = __decorate([
        __param(1, configuration_1.IConfigurationService),
        __param(2, extensions_1.IExtensionsWorkbenchService),
        __param(3, userDataSync_1.IUserDataSyncEnablementService)
    ], SyncIgnoredWidget);
    let ExtensionActivationStatusWidget = class ExtensionActivationStatusWidget extends ExtensionWidget {
        constructor(container, small, extensionService, extensionsWorkbenchService) {
            super();
            this.container = container;
            this.small = small;
            this.extensionsWorkbenchService = extensionsWorkbenchService;
            this._register(extensionService.onDidChangeExtensionsStatus(extensions => {
                if (this.extension && extensions.some(e => (0, extensionManagementUtil_1.areSameExtensions)({ id: e.value }, this.extension.identifier))) {
                    this.update();
                }
            }));
        }
        render() {
            this.container.innerText = '';
            if (!this.extension) {
                return;
            }
            const extensionStatus = this.extensionsWorkbenchService.getExtensionStatus(this.extension);
            if (!extensionStatus || !extensionStatus.activationTimes) {
                return;
            }
            const activationTime = extensionStatus.activationTimes.codeLoadingTime + extensionStatus.activationTimes.activateCallTime;
            if (this.small) {
                (0, dom_1.append)(this.container, (0, dom_1.$)('span' + themables_1.ThemeIcon.asCSSSelector(extensionsIcons_1.activationTimeIcon)));
                const activationTimeElement = (0, dom_1.append)(this.container, (0, dom_1.$)('span.activationTime'));
                activationTimeElement.textContent = `${activationTime}ms`;
            }
            else {
                const activationTimeElement = (0, dom_1.append)(this.container, (0, dom_1.$)('span.activationTime'));
                activationTimeElement.textContent = `${(0, nls_1.localize)('activation', "Activation time")}${extensionStatus.activationTimes.activationReason.startup ? ` (${(0, nls_1.localize)('startup', "Startup")})` : ''} : ${activationTime}ms`;
            }
        }
    };
    exports.ExtensionActivationStatusWidget = ExtensionActivationStatusWidget;
    exports.ExtensionActivationStatusWidget = ExtensionActivationStatusWidget = __decorate([
        __param(2, extensions_2.IExtensionService),
        __param(3, extensions_1.IExtensionsWorkbenchService)
    ], ExtensionActivationStatusWidget);
    let ExtensionHoverWidget = ExtensionHoverWidget_1 = class ExtensionHoverWidget extends ExtensionWidget {
        constructor(options, extensionStatusAction, extensionsWorkbenchService, hoverService, configurationService, extensionRecommendationsService, themeService) {
            super();
            this.options = options;
            this.extensionStatusAction = extensionStatusAction;
            this.extensionsWorkbenchService = extensionsWorkbenchService;
            this.hoverService = hoverService;
            this.configurationService = configurationService;
            this.extensionRecommendationsService = extensionRecommendationsService;
            this.themeService = themeService;
            this.hover = this._register(new lifecycle_1.MutableDisposable());
        }
        render() {
            this.hover.value = undefined;
            if (this.extension) {
                this.hover.value = (0, iconLabelHover_1.setupCustomHover)({
                    delay: this.configurationService.getValue('workbench.hover.delay'),
                    showHover: (options) => {
                        return this.hoverService.showHover({
                            ...options,
                            hoverPosition: this.options.position(),
                            forcePosition: true,
                            additionalClasses: ['extension-hover']
                        });
                    },
                    placement: 'element'
                }, this.options.target, { markdown: () => Promise.resolve(this.getHoverMarkdown()), markdownNotSupportedFallback: undefined });
            }
        }
        getHoverMarkdown() {
            if (!this.extension) {
                return undefined;
            }
            const markdown = new htmlContent_1.MarkdownString('', { isTrusted: true, supportThemeIcons: true });
            markdown.appendMarkdown(`**${this.extension.displayName}**`);
            if (semver.valid(this.extension.version)) {
                markdown.appendMarkdown(`&nbsp;<span style="background-color:#8080802B;">**&nbsp;_v${this.extension.version}_**&nbsp;</span>`);
            }
            if (this.extension.state === 1 /* ExtensionState.Installed */ ? this.extension.local?.isPreReleaseVersion : this.extension.gallery?.properties.isPreReleaseVersion) {
                const extensionPreReleaseIcon = this.themeService.getColorTheme().getColor(exports.extensionPreReleaseIconColor);
                markdown.appendMarkdown(`**&nbsp;**&nbsp;<span style="color:#ffffff;background-color:${extensionPreReleaseIcon ? color_1.Color.Format.CSS.formatHex(extensionPreReleaseIcon) : '#ffffff'};">&nbsp;$(${extensionsIcons_1.preReleaseIcon.id})&nbsp;${(0, nls_1.localize)('pre-release-label', "Pre-Release")}&nbsp;</span>`);
            }
            markdown.appendText(`\n`);
            if (this.extension.state === 1 /* ExtensionState.Installed */) {
                let addSeparator = false;
                const installLabel = InstallCountWidget.getInstallLabel(this.extension, true);
                if (installLabel) {
                    if (addSeparator) {
                        markdown.appendText(`  |  `);
                    }
                    markdown.appendMarkdown(`$(${extensionsIcons_1.installCountIcon.id}) ${installLabel}`);
                    addSeparator = true;
                }
                if (this.extension.rating) {
                    if (addSeparator) {
                        markdown.appendText(`  |  `);
                    }
                    const rating = Math.round(this.extension.rating * 2) / 2;
                    markdown.appendMarkdown(`$(${extensionsIcons_1.starFullIcon.id}) [${rating}](${this.extension.url}&ssr=false#review-details)`);
                    addSeparator = true;
                }
                if (this.extension.publisherSponsorLink) {
                    if (addSeparator) {
                        markdown.appendText(`  |  `);
                    }
                    markdown.appendMarkdown(`$(${extensionsIcons_1.sponsorIcon.id}) [${(0, nls_1.localize)('sponsor', "Sponsor")}](${this.extension.publisherSponsorLink})`);
                    addSeparator = true;
                }
                if (addSeparator) {
                    markdown.appendText(`\n`);
                }
            }
            if (this.extension.description) {
                markdown.appendMarkdown(`${this.extension.description}`);
                markdown.appendText(`\n`);
            }
            if (this.extension.publisherDomain?.verified) {
                const bgColor = this.themeService.getColorTheme().getColor(exports.extensionVerifiedPublisherIconColor);
                const publisherVerifiedTooltip = (0, nls_1.localize)('publisher verified tooltip', "This publisher has verified ownership of {0}", `[${uri_1.URI.parse(this.extension.publisherDomain.link).authority}](${this.extension.publisherDomain.link})`);
                markdown.appendMarkdown(`<span style="color:${bgColor ? color_1.Color.Format.CSS.formatHex(bgColor) : '#ffffff'};">$(${extensionsIcons_1.verifiedPublisherIcon.id})</span>&nbsp;${publisherVerifiedTooltip}`);
                markdown.appendText(`\n`);
            }
            if (this.extension.outdated) {
                markdown.appendMarkdown((0, nls_1.localize)('updateRequired', "Latest version:"));
                markdown.appendMarkdown(`&nbsp;<span style="background-color:#8080802B;">**&nbsp;_v${this.extension.latestVersion}_**&nbsp;</span>`);
                markdown.appendText(`\n`);
            }
            const preReleaseMessage = ExtensionHoverWidget_1.getPreReleaseMessage(this.extension);
            const extensionRuntimeStatus = this.extensionsWorkbenchService.getExtensionStatus(this.extension);
            const extensionStatus = this.extensionStatusAction.status;
            const reloadRequiredMessage = this.extension.reloadRequiredStatus;
            const recommendationMessage = this.getRecommendationMessage(this.extension);
            if (extensionRuntimeStatus || extensionStatus || reloadRequiredMessage || recommendationMessage || preReleaseMessage) {
                markdown.appendMarkdown(`---`);
                markdown.appendText(`\n`);
                if (extensionRuntimeStatus) {
                    if (extensionRuntimeStatus.activationTimes) {
                        const activationTime = extensionRuntimeStatus.activationTimes.codeLoadingTime + extensionRuntimeStatus.activationTimes.activateCallTime;
                        markdown.appendMarkdown(`${(0, nls_1.localize)('activation', "Activation time")}${extensionRuntimeStatus.activationTimes.activationReason.startup ? ` (${(0, nls_1.localize)('startup', "Startup")})` : ''}: \`${activationTime}ms\``);
                        markdown.appendText(`\n`);
                    }
                    if (extensionRuntimeStatus.runtimeErrors.length || extensionRuntimeStatus.messages.length) {
                        const hasErrors = extensionRuntimeStatus.runtimeErrors.length || extensionRuntimeStatus.messages.some(message => message.type === severity_1.default.Error);
                        const hasWarnings = extensionRuntimeStatus.messages.some(message => message.type === severity_1.default.Warning);
                        const errorsLink = extensionRuntimeStatus.runtimeErrors.length ? `[${extensionRuntimeStatus.runtimeErrors.length === 1 ? (0, nls_1.localize)('uncaught error', '1 uncaught error') : (0, nls_1.localize)('uncaught errors', '{0} uncaught errors', extensionRuntimeStatus.runtimeErrors.length)}](${uri_1.URI.parse(`command:extension.open?${encodeURIComponent(JSON.stringify([this.extension.identifier.id, "runtimeStatus" /* ExtensionEditorTab.RuntimeStatus */]))}`)})` : undefined;
                        const messageLink = extensionRuntimeStatus.messages.length ? `[${extensionRuntimeStatus.messages.length === 1 ? (0, nls_1.localize)('message', '1 message') : (0, nls_1.localize)('messages', '{0} messages', extensionRuntimeStatus.messages.length)}](${uri_1.URI.parse(`command:extension.open?${encodeURIComponent(JSON.stringify([this.extension.identifier.id, "runtimeStatus" /* ExtensionEditorTab.RuntimeStatus */]))}`)})` : undefined;
                        markdown.appendMarkdown(`$(${hasErrors ? extensionsIcons_1.errorIcon.id : hasWarnings ? extensionsIcons_1.warningIcon.id : extensionsIcons_1.infoIcon.id}) This extension has reported `);
                        if (errorsLink && messageLink) {
                            markdown.appendMarkdown(`${errorsLink} and ${messageLink}`);
                        }
                        else {
                            markdown.appendMarkdown(`${errorsLink || messageLink}`);
                        }
                        markdown.appendText(`\n`);
                    }
                }
                if (extensionStatus) {
                    if (extensionStatus.icon) {
                        markdown.appendMarkdown(`$(${extensionStatus.icon.id})&nbsp;`);
                    }
                    markdown.appendMarkdown(extensionStatus.message.value);
                    if (this.extension.enablementState === 5 /* EnablementState.DisabledByExtensionDependency */ && this.extension.local) {
                        markdown.appendMarkdown(`&nbsp;[${(0, nls_1.localize)('dependencies', "Show Dependencies")}](${uri_1.URI.parse(`command:extension.open?${encodeURIComponent(JSON.stringify([this.extension.identifier.id, "dependencies" /* ExtensionEditorTab.Dependencies */]))}`)})`);
                    }
                    markdown.appendText(`\n`);
                }
                if (reloadRequiredMessage) {
                    markdown.appendMarkdown(`$(${extensionsIcons_1.infoIcon.id})&nbsp;`);
                    markdown.appendMarkdown(`${reloadRequiredMessage}`);
                    markdown.appendText(`\n`);
                }
                if (preReleaseMessage) {
                    const extensionPreReleaseIcon = this.themeService.getColorTheme().getColor(exports.extensionPreReleaseIconColor);
                    markdown.appendMarkdown(`<span style="color:${extensionPreReleaseIcon ? color_1.Color.Format.CSS.formatHex(extensionPreReleaseIcon) : '#ffffff'};">$(${extensionsIcons_1.preReleaseIcon.id})</span>&nbsp;${preReleaseMessage}`);
                    markdown.appendText(`\n`);
                }
                if (recommendationMessage) {
                    markdown.appendMarkdown(recommendationMessage);
                    markdown.appendText(`\n`);
                }
            }
            return markdown;
        }
        getRecommendationMessage(extension) {
            if (extension.state === 1 /* ExtensionState.Installed */) {
                return undefined;
            }
            if (extension.deprecationInfo) {
                return undefined;
            }
            const recommendation = this.extensionRecommendationsService.getAllRecommendationsWithReason()[extension.identifier.id.toLowerCase()];
            if (!recommendation?.reasonText) {
                return undefined;
            }
            const bgColor = this.themeService.getColorTheme().getColor(extensionsActions_1.extensionButtonProminentBackground);
            return `<span style="color:${bgColor ? color_1.Color.Format.CSS.formatHex(bgColor) : '#ffffff'};">$(${extensionsIcons_1.starEmptyIcon.id})</span>&nbsp;${recommendation.reasonText}`;
        }
        static getPreReleaseMessage(extension) {
            if (!extension.hasPreReleaseVersion) {
                return undefined;
            }
            if (extension.isBuiltin) {
                return undefined;
            }
            if (extension.local?.isPreReleaseVersion || extension.gallery?.properties.isPreReleaseVersion) {
                return undefined;
            }
            const preReleaseVersionLink = `[${(0, nls_1.localize)('Show prerelease version', "Pre-Release version")}](${uri_1.URI.parse(`command:workbench.extensions.action.showPreReleaseVersion?${encodeURIComponent(JSON.stringify([extension.identifier.id]))}`)})`;
            return (0, nls_1.localize)('has prerelease', "This extension has a {0} available", preReleaseVersionLink);
        }
    };
    exports.ExtensionHoverWidget = ExtensionHoverWidget;
    exports.ExtensionHoverWidget = ExtensionHoverWidget = ExtensionHoverWidget_1 = __decorate([
        __param(2, extensions_1.IExtensionsWorkbenchService),
        __param(3, hover_1.IHoverService),
        __param(4, configuration_1.IConfigurationService),
        __param(5, extensionRecommendations_1.IExtensionRecommendationsService),
        __param(6, themeService_1.IThemeService)
    ], ExtensionHoverWidget);
    let ExtensionStatusWidget = class ExtensionStatusWidget extends ExtensionWidget {
        constructor(container, extensionStatusAction, openerService) {
            super();
            this.container = container;
            this.extensionStatusAction = extensionStatusAction;
            this.openerService = openerService;
            this.renderDisposables = this._register(new lifecycle_1.DisposableStore());
            this._onDidRender = this._register(new event_1.Emitter());
            this.onDidRender = this._onDidRender.event;
            this.render();
            this._register(extensionStatusAction.onDidChangeStatus(() => this.render()));
        }
        render() {
            (0, dom_1.reset)(this.container);
            const extensionStatus = this.extensionStatusAction.status;
            if (extensionStatus) {
                const markdown = new htmlContent_1.MarkdownString('', { isTrusted: true, supportThemeIcons: true });
                if (extensionStatus.icon) {
                    markdown.appendMarkdown(`$(${extensionStatus.icon.id})&nbsp;`);
                }
                markdown.appendMarkdown(extensionStatus.message.value);
                const rendered = this.renderDisposables.add((0, markdownRenderer_1.renderMarkdown)(markdown, {
                    actionHandler: {
                        callback: (content) => {
                            this.openerService.open(content, { allowCommands: true }).catch(errors_1.onUnexpectedError);
                        },
                        disposables: this.renderDisposables
                    }
                }));
                (0, dom_1.append)(this.container, rendered.element);
            }
            this._onDidRender.fire();
        }
    };
    exports.ExtensionStatusWidget = ExtensionStatusWidget;
    exports.ExtensionStatusWidget = ExtensionStatusWidget = __decorate([
        __param(2, opener_1.IOpenerService)
    ], ExtensionStatusWidget);
    let ExtensionRecommendationWidget = class ExtensionRecommendationWidget extends ExtensionWidget {
        constructor(container, extensionRecommendationsService, extensionIgnoredRecommendationsService) {
            super();
            this.container = container;
            this.extensionRecommendationsService = extensionRecommendationsService;
            this.extensionIgnoredRecommendationsService = extensionIgnoredRecommendationsService;
            this._onDidRender = this._register(new event_1.Emitter());
            this.onDidRender = this._onDidRender.event;
            this.render();
            this._register(this.extensionRecommendationsService.onDidChangeRecommendations(() => this.render()));
        }
        render() {
            (0, dom_1.reset)(this.container);
            const recommendationStatus = this.getRecommendationStatus();
            if (recommendationStatus) {
                if (recommendationStatus.icon) {
                    (0, dom_1.append)(this.container, (0, dom_1.$)(`div${themables_1.ThemeIcon.asCSSSelector(recommendationStatus.icon)}`));
                }
                (0, dom_1.append)(this.container, (0, dom_1.$)(`div.recommendation-text`, undefined, recommendationStatus.message));
            }
            this._onDidRender.fire();
        }
        getRecommendationStatus() {
            if (!this.extension
                || this.extension.deprecationInfo
                || this.extension.state === 1 /* ExtensionState.Installed */) {
                return undefined;
            }
            const extRecommendations = this.extensionRecommendationsService.getAllRecommendationsWithReason();
            if (extRecommendations[this.extension.identifier.id.toLowerCase()]) {
                const reasonText = extRecommendations[this.extension.identifier.id.toLowerCase()].reasonText;
                if (reasonText) {
                    return { icon: extensionsIcons_1.starEmptyIcon, message: reasonText };
                }
            }
            else if (this.extensionIgnoredRecommendationsService.globalIgnoredRecommendations.indexOf(this.extension.identifier.id.toLowerCase()) !== -1) {
                return { icon: undefined, message: (0, nls_1.localize)('recommendationHasBeenIgnored', "You have chosen not to receive recommendations for this extension.") };
            }
            return undefined;
        }
    };
    exports.ExtensionRecommendationWidget = ExtensionRecommendationWidget;
    exports.ExtensionRecommendationWidget = ExtensionRecommendationWidget = __decorate([
        __param(1, extensionRecommendations_1.IExtensionRecommendationsService),
        __param(2, extensionRecommendations_1.IExtensionIgnoredRecommendationsService)
    ], ExtensionRecommendationWidget);
    exports.extensionRatingIconColor = (0, colorRegistry_1.registerColor)('extensionIcon.starForeground', { light: '#DF6100', dark: '#FF8E00', hcDark: '#FF8E00', hcLight: colorRegistry_1.textLinkForeground }, (0, nls_1.localize)('extensionIconStarForeground', "The icon color for extension ratings."), true);
    exports.extensionVerifiedPublisherIconColor = (0, colorRegistry_1.registerColor)('extensionIcon.verifiedForeground', { dark: colorRegistry_1.textLinkForeground, light: colorRegistry_1.textLinkForeground, hcDark: colorRegistry_1.textLinkForeground, hcLight: colorRegistry_1.textLinkForeground }, (0, nls_1.localize)('extensionIconVerifiedForeground', "The icon color for extension verified publisher."), true);
    exports.extensionPreReleaseIconColor = (0, colorRegistry_1.registerColor)('extensionIcon.preReleaseForeground', { dark: '#1d9271', light: '#1d9271', hcDark: '#1d9271', hcLight: colorRegistry_1.textLinkForeground }, (0, nls_1.localize)('extensionPreReleaseForeground', "The icon color for pre-release extension."), true);
    exports.extensionSponsorIconColor = (0, colorRegistry_1.registerColor)('extensionIcon.sponsorForeground', { light: '#B51E78', dark: '#D758B3', hcDark: null, hcLight: '#B51E78' }, (0, nls_1.localize)('extensionIcon.sponsorForeground', "The icon color for extension sponsor."), true);
    (0, themeService_1.registerThemingParticipant)((theme, collector) => {
        const extensionRatingIcon = theme.getColor(exports.extensionRatingIconColor);
        if (extensionRatingIcon) {
            collector.addRule(`.extension-ratings .codicon-extensions-star-full, .extension-ratings .codicon-extensions-star-half { color: ${extensionRatingIcon}; }`);
            collector.addRule(`.monaco-hover.extension-hover .markdown-hover .hover-contents ${themables_1.ThemeIcon.asCSSSelector(extensionsIcons_1.starFullIcon)} { color: ${extensionRatingIcon}; }`);
        }
        const extensionVerifiedPublisherIcon = theme.getColor(exports.extensionVerifiedPublisherIconColor);
        if (extensionVerifiedPublisherIcon) {
            collector.addRule(`${themables_1.ThemeIcon.asCSSSelector(extensionsIcons_1.verifiedPublisherIcon)} { color: ${extensionVerifiedPublisherIcon}; }`);
        }
        collector.addRule(`.monaco-hover.extension-hover .markdown-hover .hover-contents ${themables_1.ThemeIcon.asCSSSelector(extensionsIcons_1.sponsorIcon)} { color: var(--vscode-extensionIcon-sponsorForeground); }`);
        collector.addRule(`.extension-editor > .header > .details > .subtitle .sponsor ${themables_1.ThemeIcon.asCSSSelector(extensionsIcons_1.sponsorIcon)} { color: var(--vscode-extensionIcon-sponsorForeground); }`);
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0ZW5zaW9uc1dpZGdldHMuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9leHRlbnNpb25zL2Jyb3dzZXIvZXh0ZW5zaW9uc1dpZGdldHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7OztJQXlDaEcsTUFBc0IsZUFBZ0IsU0FBUSxzQkFBVTtRQUF4RDs7WUFDUyxlQUFVLEdBQXNCLElBQUksQ0FBQztRQUs5QyxDQUFDO1FBSkEsSUFBSSxTQUFTLEtBQXdCLE9BQU8sSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUM7UUFDOUQsSUFBSSxTQUFTLENBQUMsU0FBNEIsSUFBSSxJQUFJLENBQUMsVUFBVSxHQUFHLFNBQVMsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDM0YsTUFBTSxLQUFXLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDLENBQUM7S0FFakM7SUFORCwwQ0FNQztJQUVELFNBQWdCLE9BQU8sQ0FBQyxPQUFvQixFQUFFLFFBQW9CO1FBQ2pFLE1BQU0sV0FBVyxHQUFvQixJQUFJLDJCQUFlLEVBQUUsQ0FBQztRQUMzRCxXQUFXLENBQUMsR0FBRyxDQUFDLElBQUEsMkJBQXFCLEVBQUMsT0FBTyxFQUFFLGVBQVMsQ0FBQyxLQUFLLEVBQUUsSUFBQSxrQkFBWSxFQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUN6RixXQUFXLENBQUMsR0FBRyxDQUFDLElBQUEsMkJBQXFCLEVBQUMsT0FBTyxFQUFFLGVBQVMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDLEVBQUU7WUFDcEUsTUFBTSxhQUFhLEdBQUcsSUFBSSxxQ0FBcUIsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNuRCxJQUFJLGFBQWEsQ0FBQyxNQUFNLHdCQUFlLElBQUksYUFBYSxDQUFDLE1BQU0sdUJBQWUsRUFBRTtnQkFDL0UsQ0FBQyxDQUFDLGNBQWMsRUFBRSxDQUFDO2dCQUNuQixDQUFDLENBQUMsZUFBZSxFQUFFLENBQUM7Z0JBQ3BCLFFBQVEsRUFBRSxDQUFDO2FBQ1g7UUFDRixDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ0osT0FBTyxXQUFXLENBQUM7SUFDcEIsQ0FBQztJQVpELDBCQVlDO0lBRUQsTUFBYSxrQkFBbUIsU0FBUSxlQUFlO1FBRXRELFlBQ1MsU0FBc0IsRUFDdEIsS0FBYztZQUV0QixLQUFLLEVBQUUsQ0FBQztZQUhBLGNBQVMsR0FBVCxTQUFTLENBQWE7WUFDdEIsVUFBSyxHQUFMLEtBQUssQ0FBUztZQUd0QixTQUFTLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDO1lBQ25ELElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztRQUNmLENBQUM7UUFFRCxNQUFNO1lBQ0wsSUFBSSxDQUFDLFNBQVMsQ0FBQyxTQUFTLEdBQUcsRUFBRSxDQUFDO1lBRTlCLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFO2dCQUNwQixPQUFPO2FBQ1A7WUFFRCxJQUFJLElBQUksQ0FBQyxLQUFLLElBQUksSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLHFDQUE2QixFQUFFO2dCQUNwRSxPQUFPO2FBQ1A7WUFFRCxNQUFNLFlBQVksR0FBRyxrQkFBa0IsQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDcEYsSUFBSSxDQUFDLFlBQVksRUFBRTtnQkFDbEIsT0FBTzthQUNQO1lBRUQsSUFBQSxZQUFNLEVBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxJQUFBLE9BQUMsRUFBQyxNQUFNLEdBQUcscUJBQVMsQ0FBQyxhQUFhLENBQUMsa0NBQWdCLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDOUUsTUFBTSxLQUFLLEdBQUcsSUFBQSxZQUFNLEVBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxJQUFBLE9BQUMsRUFBQyxZQUFZLENBQUMsQ0FBQyxDQUFDO1lBQ3RELEtBQUssQ0FBQyxXQUFXLEdBQUcsWUFBWSxDQUFDO1FBQ2xDLENBQUM7UUFFRCxNQUFNLENBQUMsZUFBZSxDQUFDLFNBQXFCLEVBQUUsS0FBYztZQUMzRCxNQUFNLFlBQVksR0FBRyxTQUFTLENBQUMsWUFBWSxDQUFDO1lBRTVDLElBQUksWUFBWSxLQUFLLFNBQVMsRUFBRTtnQkFDL0IsT0FBTyxTQUFTLENBQUM7YUFDakI7WUFFRCxJQUFJLFlBQW9CLENBQUM7WUFFekIsSUFBSSxLQUFLLEVBQUU7Z0JBQ1YsSUFBSSxZQUFZLEdBQUcsT0FBTyxFQUFFO29CQUMzQixZQUFZLEdBQUcsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLFlBQVksR0FBRyxNQUFNLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQztpQkFDNUQ7cUJBQU0sSUFBSSxZQUFZLEdBQUcsSUFBSSxFQUFFO29CQUMvQixZQUFZLEdBQUcsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLFlBQVksR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDO2lCQUNyRDtxQkFBTTtvQkFDTixZQUFZLEdBQUcsTUFBTSxDQUFDLFlBQVksQ0FBQyxDQUFDO2lCQUNwQzthQUNEO2lCQUNJO2dCQUNKLFlBQVksR0FBRyxZQUFZLENBQUMsY0FBYyxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQzthQUM5RDtZQUVELE9BQU8sWUFBWSxDQUFDO1FBQ3JCLENBQUM7S0FDRDtJQXhERCxnREF3REM7SUFFRCxNQUFhLGFBQWMsU0FBUSxlQUFlO1FBRWpELFlBQ1MsU0FBc0IsRUFDdEIsS0FBYztZQUV0QixLQUFLLEVBQUUsQ0FBQztZQUhBLGNBQVMsR0FBVCxTQUFTLENBQWE7WUFDdEIsVUFBSyxHQUFMLEtBQUssQ0FBUztZQUd0QixTQUFTLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDO1lBRTdDLElBQUksSUFBSSxDQUFDLEtBQUssRUFBRTtnQkFDZixTQUFTLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQzthQUNqQztZQUVELElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztRQUNmLENBQUM7UUFFRCxNQUFNO1lBQ0wsSUFBSSxDQUFDLFNBQVMsQ0FBQyxTQUFTLEdBQUcsRUFBRSxDQUFDO1lBQzlCLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxHQUFHLEVBQUUsQ0FBQztZQUUxQixJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRTtnQkFDcEIsT0FBTzthQUNQO1lBRUQsSUFBSSxJQUFJLENBQUMsS0FBSyxJQUFJLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxxQ0FBNkIsRUFBRTtnQkFDcEUsT0FBTzthQUNQO1lBRUQsSUFBSSxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sS0FBSyxTQUFTLEVBQUU7Z0JBQ3hDLE9BQU87YUFDUDtZQUVELElBQUksSUFBSSxDQUFDLEtBQUssSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsV0FBVyxFQUFFO2dCQUM5QyxPQUFPO2FBQ1A7WUFFRCxNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUN6RCxJQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssR0FBRyxJQUFBLGNBQVEsRUFBQyxZQUFZLEVBQUUsOEJBQThCLEVBQUUsTUFBTSxDQUFDLENBQUM7WUFDdEYsSUFBSSxJQUFJLENBQUMsS0FBSyxFQUFFO2dCQUNmLElBQUEsWUFBTSxFQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsSUFBQSxPQUFDLEVBQUMsTUFBTSxHQUFHLHFCQUFTLENBQUMsYUFBYSxDQUFDLDhCQUFZLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBRTFFLE1BQU0sS0FBSyxHQUFHLElBQUEsWUFBTSxFQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsSUFBQSxPQUFDLEVBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQztnQkFDdEQsS0FBSyxDQUFDLFdBQVcsR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUM7YUFDbkM7aUJBQU07Z0JBQ04sS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRTtvQkFDNUIsSUFBSSxNQUFNLElBQUksQ0FBQyxFQUFFO3dCQUNoQixJQUFBLFlBQU0sRUFBQyxJQUFJLENBQUMsU0FBUyxFQUFFLElBQUEsT0FBQyxFQUFDLE1BQU0sR0FBRyxxQkFBUyxDQUFDLGFBQWEsQ0FBQyw4QkFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDO3FCQUMxRTt5QkFBTSxJQUFJLE1BQU0sSUFBSSxDQUFDLEdBQUcsR0FBRyxFQUFFO3dCQUM3QixJQUFBLFlBQU0sRUFBQyxJQUFJLENBQUMsU0FBUyxFQUFFLElBQUEsT0FBQyxFQUFDLE1BQU0sR0FBRyxxQkFBUyxDQUFDLGFBQWEsQ0FBQyw4QkFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDO3FCQUMxRTt5QkFBTTt3QkFDTixJQUFBLFlBQU0sRUFBQyxJQUFJLENBQUMsU0FBUyxFQUFFLElBQUEsT0FBQyxFQUFDLE1BQU0sR0FBRyxxQkFBUyxDQUFDLGFBQWEsQ0FBQywrQkFBYSxDQUFDLENBQUMsQ0FBQyxDQUFDO3FCQUMzRTtpQkFDRDtnQkFDRCxJQUFJLElBQUksQ0FBQyxTQUFTLENBQUMsV0FBVyxFQUFFO29CQUMvQixNQUFNLGlCQUFpQixHQUFHLElBQUEsWUFBTSxFQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsSUFBQSxPQUFDLEVBQUMsTUFBTSxFQUFFLFNBQVMsRUFBRSxLQUFLLElBQUksQ0FBQyxTQUFTLENBQUMsV0FBVyxHQUFHLENBQUMsQ0FBQyxDQUFDO29CQUMzRyxpQkFBaUIsQ0FBQyxLQUFLLENBQUMsV0FBVyxHQUFHLEtBQUssQ0FBQztpQkFDNUM7YUFDRDtRQUNGLENBQUM7S0FDRDtJQTNERCxzQ0EyREM7SUFFTSxJQUFNLHVCQUF1QixHQUE3QixNQUFNLHVCQUF3QixTQUFRLGVBQWU7UUFJM0QsWUFDUyxTQUFzQixFQUN0QixLQUFjLEVBQ04sYUFBOEM7WUFFOUQsS0FBSyxFQUFFLENBQUM7WUFKQSxjQUFTLEdBQVQsU0FBUyxDQUFhO1lBQ3RCLFVBQUssR0FBTCxLQUFLLENBQVM7WUFDVyxrQkFBYSxHQUFiLGFBQWEsQ0FBZ0I7WUFMdkQsZ0JBQVcsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksMkJBQWUsRUFBRSxDQUFDLENBQUM7WUFRM0QsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO1FBQ2YsQ0FBQztRQUVELE1BQU07WUFDTCxJQUFBLFdBQUssRUFBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7WUFDdEIsSUFBSSxDQUFDLFdBQVcsQ0FBQyxLQUFLLEVBQUUsQ0FBQztZQUN6QixJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxlQUFlLEVBQUUsUUFBUSxFQUFFO2dCQUMvQyxPQUFPO2FBQ1A7WUFFRCxNQUFNLG1CQUFtQixHQUFHLFNBQUcsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDM0UsTUFBTSxpQkFBaUIsR0FBRyxJQUFBLFlBQU0sRUFBQyxJQUFJLENBQUMsU0FBUyxFQUFFLElBQUEsT0FBQyxFQUFDLDZDQUE2QyxDQUFDLENBQUMsQ0FBQztZQUNuRyxJQUFBLFlBQU0sRUFBQyxpQkFBaUIsRUFBRSxJQUFBLHVCQUFVLEVBQUMsdUNBQXFCLENBQUMsQ0FBQyxDQUFDO1lBRTdELElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFO2dCQUNoQixpQkFBaUIsQ0FBQyxRQUFRLEdBQUcsQ0FBQyxDQUFDO2dCQUMvQixpQkFBaUIsQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDO2dCQUM5RCxpQkFBaUIsQ0FBQyxZQUFZLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQyxDQUFDO2dCQUUvQyxJQUFBLFlBQU0sRUFBQyxpQkFBaUIsRUFBRSxJQUFBLE9BQUMsRUFBQywwQ0FBMEMsRUFBRSxTQUFTLEVBQUUsbUJBQW1CLENBQUMsU0FBUyxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsbUJBQW1CLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsbUJBQW1CLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQztnQkFDbk4sSUFBSSxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLGlCQUFpQixFQUFFLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLG1CQUFtQixDQUFDLENBQUMsQ0FBQyxDQUFDO2FBQ3JHO1FBRUYsQ0FBQztLQUNELENBQUE7SUFsQ1ksMERBQXVCO3NDQUF2Qix1QkFBdUI7UUFPakMsV0FBQSx1QkFBYyxDQUFBO09BUEosdUJBQXVCLENBa0NuQztJQUVNLElBQU0sYUFBYSxHQUFuQixNQUFNLGFBQWMsU0FBUSxlQUFlO1FBSWpELFlBQ1MsU0FBc0IsRUFDZCxhQUE4QyxFQUMzQyxnQkFBb0Q7WUFFdkUsS0FBSyxFQUFFLENBQUM7WUFKQSxjQUFTLEdBQVQsU0FBUyxDQUFhO1lBQ0csa0JBQWEsR0FBYixhQUFhLENBQWdCO1lBQzFCLHFCQUFnQixHQUFoQixnQkFBZ0IsQ0FBbUI7WUFMaEUsZ0JBQVcsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksMkJBQWUsRUFBRSxDQUFDLENBQUM7WUFRM0QsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO1FBQ2YsQ0FBQztRQUVELE1BQU07WUFDTCxJQUFBLFdBQUssRUFBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7WUFDdEIsSUFBSSxDQUFDLFdBQVcsQ0FBQyxLQUFLLEVBQUUsQ0FBQztZQUN6QixJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxvQkFBb0IsRUFBRTtnQkFDMUMsT0FBTzthQUNQO1lBRUQsTUFBTSxPQUFPLEdBQUcsSUFBQSxZQUFNLEVBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxJQUFBLE9BQUMsRUFBQyx3QkFBd0IsRUFBRSxFQUFFLFFBQVEsRUFBRSxDQUFDLEVBQUUsS0FBSyxFQUFFLElBQUksQ0FBQyxTQUFTLEVBQUUsb0JBQW9CLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDbEksT0FBTyxDQUFDLFlBQVksQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQyxVQUFVO1lBQ2hELE1BQU0sa0JBQWtCLEdBQUcsSUFBQSx1QkFBVSxFQUFDLDZCQUFXLENBQUMsQ0FBQztZQUNuRCxNQUFNLEtBQUssR0FBRyxJQUFBLE9BQUMsRUFBQyxNQUFNLEVBQUUsU0FBUyxFQUFFLElBQUEsY0FBUSxFQUFDLFNBQVMsRUFBRSxTQUFTLENBQUMsQ0FBQyxDQUFDO1lBQ25FLElBQUEsWUFBTSxFQUFDLE9BQU8sRUFBRSxrQkFBa0IsRUFBRSxLQUFLLENBQUMsQ0FBQztZQUMzQyxJQUFJLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsT0FBTyxFQUFFLEdBQUcsRUFBRTtnQkFTMUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLFVBQVUsQ0FBd0QsbUNBQW1DLEVBQUUsRUFBRSxXQUFXLEVBQUUsSUFBSSxDQUFDLFNBQVUsQ0FBQyxVQUFVLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztnQkFDN0ssSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVUsQ0FBQyxvQkFBcUIsQ0FBQyxDQUFDO1lBQ2hFLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDTCxDQUFDO0tBQ0QsQ0FBQTtJQXRDWSxzQ0FBYTs0QkFBYixhQUFhO1FBTXZCLFdBQUEsdUJBQWMsQ0FBQTtRQUNkLFdBQUEsNkJBQWlCLENBQUE7T0FQUCxhQUFhLENBc0N6QjtJQUVNLElBQU0sb0JBQW9CLEdBQTFCLE1BQU0sb0JBQXFCLFNBQVEsZUFBZTtRQUt4RCxZQUNTLE1BQW1CLEVBQ08sK0JBQWtGO1lBRXBILEtBQUssRUFBRSxDQUFDO1lBSEEsV0FBTSxHQUFOLE1BQU0sQ0FBYTtZQUN3QixvQ0FBK0IsR0FBL0IsK0JBQStCLENBQWtDO1lBSnBHLGdCQUFXLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLDJCQUFlLEVBQUUsQ0FBQyxDQUFDO1lBT3BFLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztZQUNkLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBQSx3QkFBWSxFQUFDLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDakQsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsK0JBQStCLENBQUMsMEJBQTBCLENBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUMsQ0FBQztRQUN0RyxDQUFDO1FBRU8sS0FBSztZQUNaLElBQUksSUFBSSxDQUFDLE9BQU8sRUFBRTtnQkFDakIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO2FBQ3RDO1lBQ0QsSUFBSSxDQUFDLE9BQU8sR0FBRyxTQUFTLENBQUM7WUFDekIsSUFBSSxDQUFDLFdBQVcsQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUMxQixDQUFDO1FBRUQsTUFBTTtZQUNMLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQztZQUNiLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxJQUFJLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxxQ0FBNkIsSUFBSSxJQUFJLENBQUMsU0FBUyxDQUFDLGVBQWUsRUFBRTtnQkFDM0csT0FBTzthQUNQO1lBQ0QsTUFBTSxrQkFBa0IsR0FBRyxJQUFJLENBQUMsK0JBQStCLENBQUMsK0JBQStCLEVBQUUsQ0FBQztZQUNsRyxJQUFJLGtCQUFrQixDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxFQUFFO2dCQUNuRSxJQUFJLENBQUMsT0FBTyxHQUFHLElBQUEsWUFBTSxFQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsSUFBQSxPQUFDLEVBQUMsd0JBQXdCLENBQUMsQ0FBQyxDQUFDO2dCQUNoRSxNQUFNLGNBQWMsR0FBRyxJQUFBLFlBQU0sRUFBQyxJQUFJLENBQUMsT0FBTyxFQUFFLElBQUEsT0FBQyxFQUFDLGlCQUFpQixDQUFDLENBQUMsQ0FBQztnQkFDbEUsSUFBQSxZQUFNLEVBQUMsY0FBYyxFQUFFLElBQUEsT0FBQyxFQUFDLE1BQU0sR0FBRyxxQkFBUyxDQUFDLGFBQWEsQ0FBQyw0QkFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDO2FBQ3hFO1FBQ0YsQ0FBQztLQUVELENBQUE7SUFwQ1ksb0RBQW9CO21DQUFwQixvQkFBb0I7UUFPOUIsV0FBQSwyREFBZ0MsQ0FBQTtPQVB0QixvQkFBb0IsQ0FvQ2hDO0lBRUQsTUFBYSx3QkFBeUIsU0FBUSxlQUFlO1FBSzVELFlBQ1MsTUFBbUI7WUFFM0IsS0FBSyxFQUFFLENBQUM7WUFGQSxXQUFNLEdBQU4sTUFBTSxDQUFhO1lBSFgsZ0JBQVcsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksMkJBQWUsRUFBRSxDQUFDLENBQUM7WUFNcEUsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO1lBQ2QsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFBLHdCQUFZLEVBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsQ0FBQztRQUNsRCxDQUFDO1FBRU8sS0FBSztZQUNaLElBQUksSUFBSSxDQUFDLE9BQU8sRUFBRTtnQkFDakIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO2FBQ3RDO1lBQ0QsSUFBSSxDQUFDLE9BQU8sR0FBRyxTQUFTLENBQUM7WUFDekIsSUFBSSxDQUFDLFdBQVcsQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUMxQixDQUFDO1FBRUQsTUFBTTtZQUNMLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQztZQUNiLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFO2dCQUNwQixPQUFPO2FBQ1A7WUFDRCxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxvQkFBb0IsRUFBRTtnQkFDekMsT0FBTzthQUNQO1lBQ0QsSUFBSSxJQUFJLENBQUMsU0FBUyxDQUFDLEtBQUsscUNBQTZCLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssRUFBRSxtQkFBbUIsRUFBRTtnQkFDcEcsT0FBTzthQUNQO1lBQ0QsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFBLFlBQU0sRUFBQyxJQUFJLENBQUMsTUFBTSxFQUFFLElBQUEsT0FBQyxFQUFDLHdCQUF3QixDQUFDLENBQUMsQ0FBQztZQUNoRSxNQUFNLFVBQVUsR0FBRyxJQUFBLFlBQU0sRUFBQyxJQUFJLENBQUMsT0FBTyxFQUFFLElBQUEsT0FBQyxFQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUM7WUFDM0QsSUFBQSxZQUFNLEVBQUMsVUFBVSxFQUFFLElBQUEsT0FBQyxFQUFDLE1BQU0sR0FBRyxxQkFBUyxDQUFDLGFBQWEsQ0FBQyxnQ0FBYyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3pFLENBQUM7S0FFRDtJQXJDRCw0REFxQ0M7SUFFTSxJQUFNLGlCQUFpQixHQUF2QixNQUFNLGlCQUFrQixTQUFRLGVBQWU7UUFNckQsWUFDQyxNQUFtQixFQUNGLE9BQWdCLEVBQ0UsZ0NBQW9GLEVBQ2hHLG9CQUE0RDtZQUVuRixLQUFLLEVBQUUsQ0FBQztZQUpTLFlBQU8sR0FBUCxPQUFPLENBQVM7WUFDbUIscUNBQWdDLEdBQWhDLGdDQUFnQyxDQUFtQztZQUMvRSx5QkFBb0IsR0FBcEIsb0JBQW9CLENBQXVCO1lBUm5FLGdCQUFXLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLDZCQUFpQixFQUFlLENBQUMsQ0FBQztZQVduRixJQUFJLENBQUMsT0FBTyxHQUFHLElBQUEsWUFBTSxFQUFDLE1BQU0sRUFBRSxJQUFBLE9BQUMsRUFBQyxtQ0FBbUMsQ0FBQyxDQUFDLENBQUM7WUFDdEUsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO1lBQ2QsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFBLHdCQUFZLEVBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsQ0FBQztRQUNsRCxDQUFDO1FBRU8sS0FBSztZQUNaLElBQUksSUFBSSxDQUFDLFdBQVcsQ0FBQyxLQUFLLEVBQUU7Z0JBQzNCLElBQUksQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDO2FBQ3pEO1lBQ0QsSUFBSSxDQUFDLFdBQVcsQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUMxQixDQUFDO1FBRUQsTUFBTTtZQUNMLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQztZQUNiLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLGdDQUFnQyxDQUFDLDhCQUE4QixJQUFJLElBQUksQ0FBQyxnQ0FBZ0MsQ0FBQywrQkFBK0IsQ0FBQyxJQUFJLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxLQUFLLElBQUksQ0FBQyxnQ0FBZ0MsQ0FBQywrQkFBK0IsRUFBRTtnQkFDOVQsT0FBTzthQUNQO1lBQ0QsSUFBSSxDQUFDLFdBQVcsQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLG9CQUFvQixDQUFDLGNBQWMsQ0FBQyxXQUFXLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQzdGLElBQUEsWUFBTSxFQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDdEQsQ0FBQztLQUNELENBQUE7SUFqQ1ksOENBQWlCO2dDQUFqQixpQkFBaUI7UUFTM0IsV0FBQSx1REFBaUMsQ0FBQTtRQUNqQyxXQUFBLHFDQUFxQixDQUFBO09BVlgsaUJBQWlCLENBaUM3QjtJQUVELElBQU0sV0FBVyxHQUFqQixNQUFNLFdBQVksU0FBUSxzQkFBVTtRQUluQyxZQUNrQixPQUFnQixFQUNELFlBQTJCLEVBQzNCLFlBQTJCLEVBQ1AsZ0NBQW1FO1lBRXZILEtBQUssRUFBRSxDQUFDO1lBTFMsWUFBTyxHQUFQLE9BQU8sQ0FBUztZQUNELGlCQUFZLEdBQVosWUFBWSxDQUFlO1lBQzNCLGlCQUFZLEdBQVosWUFBWSxDQUFlO1lBQ1AscUNBQWdDLEdBQWhDLGdDQUFnQyxDQUFtQztZQUd2SCxJQUFJLENBQUMsT0FBTyxHQUFHLElBQUEsT0FBQyxFQUFDLDRDQUE0QyxDQUFDLENBQUM7WUFDL0QsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO1FBQ2YsQ0FBQztRQUVPLE1BQU07WUFDYixJQUFBLFlBQU0sRUFBQyxJQUFJLENBQUMsT0FBTyxFQUFFLElBQUEsT0FBQyxFQUFDLE1BQU0sR0FBRyxxQkFBUyxDQUFDLGFBQWEsQ0FBQyw0QkFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBRXRFLE1BQU0sZUFBZSxHQUFHLEdBQUcsRUFBRTtnQkFDNUIsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUU7b0JBQ2xCLE9BQU87aUJBQ1A7Z0JBQ0QsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxhQUFhLEVBQUUsQ0FBQyxRQUFRLENBQUMseUNBQWlDLENBQUMsQ0FBQztnQkFDOUYsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxhQUFhLEVBQUUsQ0FBQyxRQUFRLENBQUMseUNBQWlDLENBQUMsQ0FBQztnQkFDOUYsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsZUFBZSxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7Z0JBQ3ZFLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLEtBQUssR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDO1lBQzlELENBQUMsQ0FBQztZQUNGLGVBQWUsRUFBRSxDQUFDO1lBQ2xCLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxxQkFBcUIsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxlQUFlLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFFakYsSUFBSSxJQUFJLENBQUMsT0FBTyxFQUFFO2dCQUNqQixNQUFNLFdBQVcsR0FBRyxHQUFHLEVBQUU7b0JBQ3hCLElBQUksSUFBSSxDQUFDLE9BQU8sSUFBSSxJQUFJLENBQUMsZ0NBQWdDLENBQUMsK0JBQStCLEVBQUU7d0JBQzFGLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxHQUFHLElBQUEsY0FBUSxFQUFDLHdCQUF3QixFQUFFLGtCQUFrQixFQUFFLElBQUksQ0FBQyxnQ0FBZ0MsQ0FBQywrQkFBK0IsQ0FBQyxLQUFLLENBQUMsQ0FBQztxQkFDeko7Z0JBQ0YsQ0FBQyxDQUFDO2dCQUNGLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxxQkFBcUIsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDLENBQUM7Z0JBQzdFLFdBQVcsRUFBRSxDQUFDO2FBQ2Q7UUFDRixDQUFDO0tBQ0QsQ0FBQTtJQXhDSyxXQUFXO1FBTWQsV0FBQSxxQkFBYSxDQUFBO1FBQ2IsV0FBQSw0QkFBYSxDQUFBO1FBQ2IsV0FBQSx1REFBaUMsQ0FBQTtPQVI5QixXQUFXLENBd0NoQjtJQUVELE1BQWEsd0JBQXlCLFNBQVEsZUFBZTtRQUk1RCxZQUNrQixNQUFtQjtZQUVwQyxLQUFLLEVBQUUsQ0FBQztZQUZTLFdBQU0sR0FBTixNQUFNLENBQWE7WUFHcEMsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO1lBQ2QsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFBLHdCQUFZLEVBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsQ0FBQztRQUNsRCxDQUFDO1FBRU8sS0FBSztZQUNaLElBQUksQ0FBQyxPQUFPLEVBQUUsTUFBTSxFQUFFLENBQUM7UUFDeEIsQ0FBQztRQUVELE1BQU07WUFDTCxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7WUFDYixJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxVQUFVLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsUUFBUSxDQUFDLFdBQVcsRUFBRSxLQUFLLGlCQUFpQixDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsYUFBYSxDQUFDLE1BQU0sRUFBRTtnQkFDNUosT0FBTzthQUNQO1lBQ0QsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFBLFlBQU0sRUFBQyxJQUFJLENBQUMsTUFBTSxFQUFFLElBQUEsT0FBQyxFQUFDLHVDQUF1QyxDQUFDLENBQUMsQ0FBQztZQUMvRSxNQUFNLFVBQVUsR0FBRyxJQUFJLHVCQUFVLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxFQUFFLEVBQUUsdUNBQXVCLENBQUMsQ0FBQztZQUM3RSxVQUFVLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQzFELENBQUM7S0FDRDtJQXpCRCw0REF5QkM7SUFFTSxJQUFNLGlCQUFpQixHQUF2QixNQUFNLGlCQUFrQixTQUFRLGVBQWU7UUFFckQsWUFDa0IsU0FBc0IsRUFDQyxvQkFBMkMsRUFDckMsMEJBQXVELEVBQ3BELDZCQUE2RDtZQUU5RyxLQUFLLEVBQUUsQ0FBQztZQUxTLGNBQVMsR0FBVCxTQUFTLENBQWE7WUFDQyx5QkFBb0IsR0FBcEIsb0JBQW9CLENBQXVCO1lBQ3JDLCtCQUEwQixHQUExQiwwQkFBMEIsQ0FBNkI7WUFDcEQsa0NBQTZCLEdBQTdCLDZCQUE2QixDQUFnQztZQUc5RyxJQUFJLENBQUMsU0FBUyxDQUFDLGFBQUssQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLG9CQUFvQixDQUFDLHdCQUF3QixFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLG9CQUFvQixDQUFDLGdDQUFnQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ3JLLElBQUksQ0FBQyxTQUFTLENBQUMsNkJBQTZCLENBQUMscUJBQXFCLENBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUMsQ0FBQztZQUN6RixJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7UUFDZixDQUFDO1FBRUQsTUFBTTtZQUNMLElBQUksQ0FBQyxTQUFTLENBQUMsU0FBUyxHQUFHLEVBQUUsQ0FBQztZQUU5QixJQUFJLElBQUksQ0FBQyxTQUFTLElBQUksSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLHFDQUE2QixJQUFJLElBQUksQ0FBQyw2QkFBNkIsQ0FBQyxTQUFTLEVBQUUsSUFBSSxJQUFJLENBQUMsMEJBQTBCLENBQUMsd0JBQXdCLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxFQUFFO2dCQUN0TSxNQUFNLE9BQU8sR0FBRyxJQUFBLFlBQU0sRUFBQyxJQUFJLENBQUMsU0FBUyxFQUFFLElBQUEsT0FBQyxFQUFDLDZCQUE2QixHQUFHLHFCQUFTLENBQUMsYUFBYSxDQUFDLGlDQUFlLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ3BILE9BQU8sQ0FBQyxLQUFLLEdBQUcsSUFBQSxjQUFRLEVBQUMsa0JBQWtCLEVBQUUsd0NBQXdDLENBQUMsQ0FBQztnQkFDdkYsT0FBTyxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsR0FBRyxxQkFBUyxDQUFDLGdCQUFnQixDQUFDLGlDQUFlLENBQUMsQ0FBQyxDQUFDO2FBQ3RFO1FBQ0YsQ0FBQztLQUNELENBQUE7SUF2QlksOENBQWlCO2dDQUFqQixpQkFBaUI7UUFJM0IsV0FBQSxxQ0FBcUIsQ0FBQTtRQUNyQixXQUFBLHdDQUEyQixDQUFBO1FBQzNCLFdBQUEsNkNBQThCLENBQUE7T0FOcEIsaUJBQWlCLENBdUI3QjtJQUVNLElBQU0sK0JBQStCLEdBQXJDLE1BQU0sK0JBQWdDLFNBQVEsZUFBZTtRQUVuRSxZQUNrQixTQUFzQixFQUN0QixLQUFjLEVBQ1osZ0JBQW1DLEVBQ1IsMEJBQXVEO1lBRXJHLEtBQUssRUFBRSxDQUFDO1lBTFMsY0FBUyxHQUFULFNBQVMsQ0FBYTtZQUN0QixVQUFLLEdBQUwsS0FBSyxDQUFTO1lBRWUsK0JBQTBCLEdBQTFCLDBCQUEwQixDQUE2QjtZQUdyRyxJQUFJLENBQUMsU0FBUyxDQUFDLGdCQUFnQixDQUFDLDJCQUEyQixDQUFDLFVBQVUsQ0FBQyxFQUFFO2dCQUN4RSxJQUFJLElBQUksQ0FBQyxTQUFTLElBQUksVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUEsMkNBQWlCLEVBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDLEtBQUssRUFBRSxFQUFFLElBQUksQ0FBQyxTQUFVLENBQUMsVUFBVSxDQUFDLENBQUMsRUFBRTtvQkFDM0csSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO2lCQUNkO1lBQ0YsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNMLENBQUM7UUFFRCxNQUFNO1lBQ0wsSUFBSSxDQUFDLFNBQVMsQ0FBQyxTQUFTLEdBQUcsRUFBRSxDQUFDO1lBRTlCLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFO2dCQUNwQixPQUFPO2FBQ1A7WUFFRCxNQUFNLGVBQWUsR0FBRyxJQUFJLENBQUMsMEJBQTBCLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBQzNGLElBQUksQ0FBQyxlQUFlLElBQUksQ0FBQyxlQUFlLENBQUMsZUFBZSxFQUFFO2dCQUN6RCxPQUFPO2FBQ1A7WUFFRCxNQUFNLGNBQWMsR0FBRyxlQUFlLENBQUMsZUFBZSxDQUFDLGVBQWUsR0FBRyxlQUFlLENBQUMsZUFBZSxDQUFDLGdCQUFnQixDQUFDO1lBQzFILElBQUksSUFBSSxDQUFDLEtBQUssRUFBRTtnQkFDZixJQUFBLFlBQU0sRUFBQyxJQUFJLENBQUMsU0FBUyxFQUFFLElBQUEsT0FBQyxFQUFDLE1BQU0sR0FBRyxxQkFBUyxDQUFDLGFBQWEsQ0FBQyxvQ0FBa0IsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDaEYsTUFBTSxxQkFBcUIsR0FBRyxJQUFBLFlBQU0sRUFBQyxJQUFJLENBQUMsU0FBUyxFQUFFLElBQUEsT0FBQyxFQUFDLHFCQUFxQixDQUFDLENBQUMsQ0FBQztnQkFDL0UscUJBQXFCLENBQUMsV0FBVyxHQUFHLEdBQUcsY0FBYyxJQUFJLENBQUM7YUFDMUQ7aUJBQU07Z0JBQ04sTUFBTSxxQkFBcUIsR0FBRyxJQUFBLFlBQU0sRUFBQyxJQUFJLENBQUMsU0FBUyxFQUFFLElBQUEsT0FBQyxFQUFDLHFCQUFxQixDQUFDLENBQUMsQ0FBQztnQkFDL0UscUJBQXFCLENBQUMsV0FBVyxHQUFHLEdBQUcsSUFBQSxjQUFRLEVBQUMsWUFBWSxFQUFFLGlCQUFpQixDQUFDLEdBQUcsZUFBZSxDQUFDLGVBQWUsQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEtBQUssSUFBQSxjQUFRLEVBQUMsU0FBUyxFQUFFLFNBQVMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsTUFBTSxjQUFjLElBQUksQ0FBQzthQUNsTjtRQUVGLENBQUM7S0FFRCxDQUFBO0lBeENZLDBFQUErQjs4Q0FBL0IsK0JBQStCO1FBS3pDLFdBQUEsOEJBQWlCLENBQUE7UUFDakIsV0FBQSx3Q0FBMkIsQ0FBQTtPQU5qQiwrQkFBK0IsQ0F3QzNDO0lBT00sSUFBTSxvQkFBb0IsNEJBQTFCLE1BQU0sb0JBQXFCLFNBQVEsZUFBZTtRQUl4RCxZQUNrQixPQUE4QixFQUM5QixxQkFBNEMsRUFDaEMsMEJBQXdFLEVBQ3RGLFlBQTRDLEVBQ3BDLG9CQUE0RCxFQUNqRCwrQkFBa0YsRUFDckcsWUFBNEM7WUFFM0QsS0FBSyxFQUFFLENBQUM7WUFSUyxZQUFPLEdBQVAsT0FBTyxDQUF1QjtZQUM5QiwwQkFBcUIsR0FBckIscUJBQXFCLENBQXVCO1lBQ2YsK0JBQTBCLEdBQTFCLDBCQUEwQixDQUE2QjtZQUNyRSxpQkFBWSxHQUFaLFlBQVksQ0FBZTtZQUNuQix5QkFBb0IsR0FBcEIsb0JBQW9CLENBQXVCO1lBQ2hDLG9DQUErQixHQUEvQiwrQkFBK0IsQ0FBa0M7WUFDcEYsaUJBQVksR0FBWixZQUFZLENBQWU7WUFUM0MsVUFBSyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSw2QkFBaUIsRUFBZSxDQUFDLENBQUM7UUFZOUUsQ0FBQztRQUVELE1BQU07WUFDTCxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssR0FBRyxTQUFTLENBQUM7WUFDN0IsSUFBSSxJQUFJLENBQUMsU0FBUyxFQUFFO2dCQUNuQixJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssR0FBRyxJQUFBLGlDQUFnQixFQUFDO29CQUNuQyxLQUFLLEVBQUUsSUFBSSxDQUFDLG9CQUFvQixDQUFDLFFBQVEsQ0FBUyx1QkFBdUIsQ0FBQztvQkFDMUUsU0FBUyxFQUFFLENBQUMsT0FBTyxFQUFFLEVBQUU7d0JBQ3RCLE9BQU8sSUFBSSxDQUFDLFlBQVksQ0FBQyxTQUFTLENBQUM7NEJBQ2xDLEdBQUcsT0FBTzs0QkFDVixhQUFhLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLEVBQUU7NEJBQ3RDLGFBQWEsRUFBRSxJQUFJOzRCQUNuQixpQkFBaUIsRUFBRSxDQUFDLGlCQUFpQixDQUFDO3lCQUN0QyxDQUFDLENBQUM7b0JBQ0osQ0FBQztvQkFDRCxTQUFTLEVBQUUsU0FBUztpQkFDcEIsRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBRSxFQUFFLFFBQVEsRUFBRSxHQUFHLEVBQUUsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDLEVBQUUsNEJBQTRCLEVBQUUsU0FBUyxFQUFFLENBQUMsQ0FBQzthQUMvSDtRQUNGLENBQUM7UUFFTyxnQkFBZ0I7WUFDdkIsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUU7Z0JBQ3BCLE9BQU8sU0FBUyxDQUFDO2FBQ2pCO1lBQ0QsTUFBTSxRQUFRLEdBQUcsSUFBSSw0QkFBYyxDQUFDLEVBQUUsRUFBRSxFQUFFLFNBQVMsRUFBRSxJQUFJLEVBQUUsaUJBQWlCLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQztZQUV0RixRQUFRLENBQUMsY0FBYyxDQUFDLEtBQUssSUFBSSxDQUFDLFNBQVMsQ0FBQyxXQUFXLElBQUksQ0FBQyxDQUFDO1lBQzdELElBQUksTUFBTSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxFQUFFO2dCQUN6QyxRQUFRLENBQUMsY0FBYyxDQUFDLDZEQUE2RCxJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sa0JBQWtCLENBQUMsQ0FBQzthQUMvSDtZQUNELElBQUksSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLHFDQUE2QixDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssRUFBRSxtQkFBbUIsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLEVBQUUsVUFBVSxDQUFDLG1CQUFtQixFQUFFO2dCQUMzSixNQUFNLHVCQUF1QixHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsYUFBYSxFQUFFLENBQUMsUUFBUSxDQUFDLG9DQUE0QixDQUFDLENBQUM7Z0JBQ3pHLFFBQVEsQ0FBQyxjQUFjLENBQUMsK0RBQStELHVCQUF1QixDQUFDLENBQUMsQ0FBQyxhQUFLLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsdUJBQXVCLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxjQUFjLGdDQUFjLENBQUMsRUFBRSxVQUFVLElBQUEsY0FBUSxFQUFDLG1CQUFtQixFQUFFLGFBQWEsQ0FBQyxlQUFlLENBQUMsQ0FBQzthQUN0UjtZQUNELFFBQVEsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUM7WUFFMUIsSUFBSSxJQUFJLENBQUMsU0FBUyxDQUFDLEtBQUsscUNBQTZCLEVBQUU7Z0JBQ3RELElBQUksWUFBWSxHQUFHLEtBQUssQ0FBQztnQkFDekIsTUFBTSxZQUFZLEdBQUcsa0JBQWtCLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDLENBQUM7Z0JBQzlFLElBQUksWUFBWSxFQUFFO29CQUNqQixJQUFJLFlBQVksRUFBRTt3QkFDakIsUUFBUSxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsQ0FBQztxQkFDN0I7b0JBQ0QsUUFBUSxDQUFDLGNBQWMsQ0FBQyxLQUFLLGtDQUFnQixDQUFDLEVBQUUsS0FBSyxZQUFZLEVBQUUsQ0FBQyxDQUFDO29CQUNyRSxZQUFZLEdBQUcsSUFBSSxDQUFDO2lCQUNwQjtnQkFDRCxJQUFJLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxFQUFFO29CQUMxQixJQUFJLFlBQVksRUFBRTt3QkFDakIsUUFBUSxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsQ0FBQztxQkFDN0I7b0JBQ0QsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7b0JBQ3pELFFBQVEsQ0FBQyxjQUFjLENBQUMsS0FBSyw4QkFBWSxDQUFDLEVBQUUsTUFBTSxNQUFNLEtBQUssSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLDRCQUE0QixDQUFDLENBQUM7b0JBQzdHLFlBQVksR0FBRyxJQUFJLENBQUM7aUJBQ3BCO2dCQUNELElBQUksSUFBSSxDQUFDLFNBQVMsQ0FBQyxvQkFBb0IsRUFBRTtvQkFDeEMsSUFBSSxZQUFZLEVBQUU7d0JBQ2pCLFFBQVEsQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLENBQUM7cUJBQzdCO29CQUNELFFBQVEsQ0FBQyxjQUFjLENBQUMsS0FBSyw2QkFBVyxDQUFDLEVBQUUsTUFBTSxJQUFBLGNBQVEsRUFBQyxTQUFTLEVBQUUsU0FBUyxDQUFDLEtBQUssSUFBSSxDQUFDLFNBQVMsQ0FBQyxvQkFBb0IsR0FBRyxDQUFDLENBQUM7b0JBQzVILFlBQVksR0FBRyxJQUFJLENBQUM7aUJBQ3BCO2dCQUNELElBQUksWUFBWSxFQUFFO29CQUNqQixRQUFRLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDO2lCQUMxQjthQUNEO1lBRUQsSUFBSSxJQUFJLENBQUMsU0FBUyxDQUFDLFdBQVcsRUFBRTtnQkFDL0IsUUFBUSxDQUFDLGNBQWMsQ0FBQyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQztnQkFDekQsUUFBUSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQzthQUMxQjtZQUVELElBQUksSUFBSSxDQUFDLFNBQVMsQ0FBQyxlQUFlLEVBQUUsUUFBUSxFQUFFO2dCQUM3QyxNQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLGFBQWEsRUFBRSxDQUFDLFFBQVEsQ0FBQywyQ0FBbUMsQ0FBQyxDQUFDO2dCQUNoRyxNQUFNLHdCQUF3QixHQUFHLElBQUEsY0FBUSxFQUFDLDRCQUE0QixFQUFFLDhDQUE4QyxFQUFFLElBQUksU0FBRyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxTQUFTLEtBQUssSUFBSSxDQUFDLFNBQVMsQ0FBQyxlQUFlLENBQUMsSUFBSSxHQUFHLENBQUMsQ0FBQztnQkFDak8sUUFBUSxDQUFDLGNBQWMsQ0FBQyxzQkFBc0IsT0FBTyxDQUFDLENBQUMsQ0FBQyxhQUFLLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsUUFBUSx1Q0FBcUIsQ0FBQyxFQUFFLGlCQUFpQix3QkFBd0IsRUFBRSxDQUFDLENBQUM7Z0JBQ3BMLFFBQVEsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUM7YUFDMUI7WUFFRCxJQUFJLElBQUksQ0FBQyxTQUFTLENBQUMsUUFBUSxFQUFFO2dCQUM1QixRQUFRLENBQUMsY0FBYyxDQUFDLElBQUEsY0FBUSxFQUFDLGdCQUFnQixFQUFFLGlCQUFpQixDQUFDLENBQUMsQ0FBQztnQkFDdkUsUUFBUSxDQUFDLGNBQWMsQ0FBQyw2REFBNkQsSUFBSSxDQUFDLFNBQVMsQ0FBQyxhQUFhLGtCQUFrQixDQUFDLENBQUM7Z0JBQ3JJLFFBQVEsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUM7YUFDMUI7WUFFRCxNQUFNLGlCQUFpQixHQUFHLHNCQUFvQixDQUFDLG9CQUFvQixDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUNwRixNQUFNLHNCQUFzQixHQUFHLElBQUksQ0FBQywwQkFBMEIsQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7WUFDbEcsTUFBTSxlQUFlLEdBQUcsSUFBSSxDQUFDLHFCQUFxQixDQUFDLE1BQU0sQ0FBQztZQUMxRCxNQUFNLHFCQUFxQixHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsb0JBQW9CLENBQUM7WUFDbEUsTUFBTSxxQkFBcUIsR0FBRyxJQUFJLENBQUMsd0JBQXdCLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBRTVFLElBQUksc0JBQXNCLElBQUksZUFBZSxJQUFJLHFCQUFxQixJQUFJLHFCQUFxQixJQUFJLGlCQUFpQixFQUFFO2dCQUVySCxRQUFRLENBQUMsY0FBYyxDQUFDLEtBQUssQ0FBQyxDQUFDO2dCQUMvQixRQUFRLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUUxQixJQUFJLHNCQUFzQixFQUFFO29CQUMzQixJQUFJLHNCQUFzQixDQUFDLGVBQWUsRUFBRTt3QkFDM0MsTUFBTSxjQUFjLEdBQUcsc0JBQXNCLENBQUMsZUFBZSxDQUFDLGVBQWUsR0FBRyxzQkFBc0IsQ0FBQyxlQUFlLENBQUMsZ0JBQWdCLENBQUM7d0JBQ3hJLFFBQVEsQ0FBQyxjQUFjLENBQUMsR0FBRyxJQUFBLGNBQVEsRUFBQyxZQUFZLEVBQUUsaUJBQWlCLENBQUMsR0FBRyxzQkFBc0IsQ0FBQyxlQUFlLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxLQUFLLElBQUEsY0FBUSxFQUFDLFNBQVMsRUFBRSxTQUFTLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLE9BQU8sY0FBYyxNQUFNLENBQUMsQ0FBQzt3QkFDak4sUUFBUSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQztxQkFDMUI7b0JBQ0QsSUFBSSxzQkFBc0IsQ0FBQyxhQUFhLENBQUMsTUFBTSxJQUFJLHNCQUFzQixDQUFDLFFBQVEsQ0FBQyxNQUFNLEVBQUU7d0JBQzFGLE1BQU0sU0FBUyxHQUFHLHNCQUFzQixDQUFDLGFBQWEsQ0FBQyxNQUFNLElBQUksc0JBQXNCLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxJQUFJLEtBQUssa0JBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQzt3QkFDbEosTUFBTSxXQUFXLEdBQUcsc0JBQXNCLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxJQUFJLEtBQUssa0JBQVEsQ0FBQyxPQUFPLENBQUMsQ0FBQzt3QkFDdkcsTUFBTSxVQUFVLEdBQUcsc0JBQXNCLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsSUFBSSxzQkFBc0IsQ0FBQyxhQUFhLENBQUMsTUFBTSxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBQSxjQUFRLEVBQUMsZ0JBQWdCLEVBQUUsa0JBQWtCLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBQSxjQUFRLEVBQUMsaUJBQWlCLEVBQUUscUJBQXFCLEVBQUUsc0JBQXNCLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBQyxLQUFLLFNBQUcsQ0FBQyxLQUFLLENBQUMsMEJBQTBCLGtCQUFrQixDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLFVBQVUsQ0FBQyxFQUFFLHlEQUFtQyxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDO3dCQUN6YSxNQUFNLFdBQVcsR0FBRyxzQkFBc0IsQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxJQUFJLHNCQUFzQixDQUFDLFFBQVEsQ0FBQyxNQUFNLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFBLGNBQVEsRUFBQyxTQUFTLEVBQUUsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUEsY0FBUSxFQUFDLFVBQVUsRUFBRSxjQUFjLEVBQUUsc0JBQXNCLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxLQUFLLFNBQUcsQ0FBQyxLQUFLLENBQUMsMEJBQTBCLGtCQUFrQixDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLFVBQVUsQ0FBQyxFQUFFLHlEQUFtQyxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDO3dCQUMvWCxRQUFRLENBQUMsY0FBYyxDQUFDLEtBQUssU0FBUyxDQUFDLENBQUMsQ0FBQywyQkFBUyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyw2QkFBVyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsMEJBQVEsQ0FBQyxFQUFFLGdDQUFnQyxDQUFDLENBQUM7d0JBQ3BJLElBQUksVUFBVSxJQUFJLFdBQVcsRUFBRTs0QkFDOUIsUUFBUSxDQUFDLGNBQWMsQ0FBQyxHQUFHLFVBQVUsUUFBUSxXQUFXLEVBQUUsQ0FBQyxDQUFDO3lCQUM1RDs2QkFBTTs0QkFDTixRQUFRLENBQUMsY0FBYyxDQUFDLEdBQUcsVUFBVSxJQUFJLFdBQVcsRUFBRSxDQUFDLENBQUM7eUJBQ3hEO3dCQUNELFFBQVEsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUM7cUJBQzFCO2lCQUNEO2dCQUVELElBQUksZUFBZSxFQUFFO29CQUNwQixJQUFJLGVBQWUsQ0FBQyxJQUFJLEVBQUU7d0JBQ3pCLFFBQVEsQ0FBQyxjQUFjLENBQUMsS0FBSyxlQUFlLENBQUMsSUFBSSxDQUFDLEVBQUUsU0FBUyxDQUFDLENBQUM7cUJBQy9EO29CQUNELFFBQVEsQ0FBQyxjQUFjLENBQUMsZUFBZSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQztvQkFDdkQsSUFBSSxJQUFJLENBQUMsU0FBUyxDQUFDLGVBQWUsMERBQWtELElBQUksSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLEVBQUU7d0JBQzdHLFFBQVEsQ0FBQyxjQUFjLENBQUMsVUFBVSxJQUFBLGNBQVEsRUFBQyxjQUFjLEVBQUUsbUJBQW1CLENBQUMsS0FBSyxTQUFHLENBQUMsS0FBSyxDQUFDLDBCQUEwQixrQkFBa0IsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUMsRUFBRSx1REFBa0MsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQztxQkFDbk87b0JBQ0QsUUFBUSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQztpQkFDMUI7Z0JBRUQsSUFBSSxxQkFBcUIsRUFBRTtvQkFDMUIsUUFBUSxDQUFDLGNBQWMsQ0FBQyxLQUFLLDBCQUFRLENBQUMsRUFBRSxTQUFTLENBQUMsQ0FBQztvQkFDbkQsUUFBUSxDQUFDLGNBQWMsQ0FBQyxHQUFHLHFCQUFxQixFQUFFLENBQUMsQ0FBQztvQkFDcEQsUUFBUSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQztpQkFDMUI7Z0JBRUQsSUFBSSxpQkFBaUIsRUFBRTtvQkFDdEIsTUFBTSx1QkFBdUIsR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLGFBQWEsRUFBRSxDQUFDLFFBQVEsQ0FBQyxvQ0FBNEIsQ0FBQyxDQUFDO29CQUN6RyxRQUFRLENBQUMsY0FBYyxDQUFDLHNCQUFzQix1QkFBdUIsQ0FBQyxDQUFDLENBQUMsYUFBSyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLHVCQUF1QixDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsUUFBUSxnQ0FBYyxDQUFDLEVBQUUsaUJBQWlCLGlCQUFpQixFQUFFLENBQUMsQ0FBQztvQkFDdE0sUUFBUSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQztpQkFDMUI7Z0JBRUQsSUFBSSxxQkFBcUIsRUFBRTtvQkFDMUIsUUFBUSxDQUFDLGNBQWMsQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDO29CQUMvQyxRQUFRLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDO2lCQUMxQjthQUNEO1lBRUQsT0FBTyxRQUFRLENBQUM7UUFDakIsQ0FBQztRQUVPLHdCQUF3QixDQUFDLFNBQXFCO1lBQ3JELElBQUksU0FBUyxDQUFDLEtBQUsscUNBQTZCLEVBQUU7Z0JBQ2pELE9BQU8sU0FBUyxDQUFDO2FBQ2pCO1lBQ0QsSUFBSSxTQUFTLENBQUMsZUFBZSxFQUFFO2dCQUM5QixPQUFPLFNBQVMsQ0FBQzthQUNqQjtZQUNELE1BQU0sY0FBYyxHQUFHLElBQUksQ0FBQywrQkFBK0IsQ0FBQywrQkFBK0IsRUFBRSxDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUMsRUFBRSxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUM7WUFDckksSUFBSSxDQUFDLGNBQWMsRUFBRSxVQUFVLEVBQUU7Z0JBQ2hDLE9BQU8sU0FBUyxDQUFDO2FBQ2pCO1lBQ0QsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxhQUFhLEVBQUUsQ0FBQyxRQUFRLENBQUMsc0RBQWtDLENBQUMsQ0FBQztZQUMvRixPQUFPLHNCQUFzQixPQUFPLENBQUMsQ0FBQyxDQUFDLGFBQUssQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxRQUFRLCtCQUFhLENBQUMsRUFBRSxpQkFBaUIsY0FBYyxDQUFDLFVBQVUsRUFBRSxDQUFDO1FBQzVKLENBQUM7UUFFRCxNQUFNLENBQUMsb0JBQW9CLENBQUMsU0FBcUI7WUFDaEQsSUFBSSxDQUFDLFNBQVMsQ0FBQyxvQkFBb0IsRUFBRTtnQkFDcEMsT0FBTyxTQUFTLENBQUM7YUFDakI7WUFDRCxJQUFJLFNBQVMsQ0FBQyxTQUFTLEVBQUU7Z0JBQ3hCLE9BQU8sU0FBUyxDQUFDO2FBQ2pCO1lBQ0QsSUFBSSxTQUFTLENBQUMsS0FBSyxFQUFFLG1CQUFtQixJQUFJLFNBQVMsQ0FBQyxPQUFPLEVBQUUsVUFBVSxDQUFDLG1CQUFtQixFQUFFO2dCQUM5RixPQUFPLFNBQVMsQ0FBQzthQUNqQjtZQUNELE1BQU0scUJBQXFCLEdBQUcsSUFBSSxJQUFBLGNBQVEsRUFBQyx5QkFBeUIsRUFBRSxxQkFBcUIsQ0FBQyxLQUFLLFNBQUcsQ0FBQyxLQUFLLENBQUMsNkRBQTZELGtCQUFrQixDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxTQUFTLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQztZQUM1TyxPQUFPLElBQUEsY0FBUSxFQUFDLGdCQUFnQixFQUFFLG9DQUFvQyxFQUFFLHFCQUFxQixDQUFDLENBQUM7UUFDaEcsQ0FBQztLQUVELENBQUE7SUEvTFksb0RBQW9CO21DQUFwQixvQkFBb0I7UUFPOUIsV0FBQSx3Q0FBMkIsQ0FBQTtRQUMzQixXQUFBLHFCQUFhLENBQUE7UUFDYixXQUFBLHFDQUFxQixDQUFBO1FBQ3JCLFdBQUEsMkRBQWdDLENBQUE7UUFDaEMsV0FBQSw0QkFBYSxDQUFBO09BWEgsb0JBQW9CLENBK0xoQztJQUVNLElBQU0scUJBQXFCLEdBQTNCLE1BQU0scUJBQXNCLFNBQVEsZUFBZTtRQU96RCxZQUNrQixTQUFzQixFQUN0QixxQkFBNEMsRUFDN0MsYUFBOEM7WUFFOUQsS0FBSyxFQUFFLENBQUM7WUFKUyxjQUFTLEdBQVQsU0FBUyxDQUFhO1lBQ3RCLDBCQUFxQixHQUFyQixxQkFBcUIsQ0FBdUI7WUFDNUIsa0JBQWEsR0FBYixhQUFhLENBQWdCO1lBUjlDLHNCQUFpQixHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSwyQkFBZSxFQUFFLENBQUMsQ0FBQztZQUUxRCxpQkFBWSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxlQUFPLEVBQVEsQ0FBQyxDQUFDO1lBQzNELGdCQUFXLEdBQWdCLElBQUksQ0FBQyxZQUFZLENBQUMsS0FBSyxDQUFDO1lBUTNELElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztZQUNkLElBQUksQ0FBQyxTQUFTLENBQUMscUJBQXFCLENBQUMsaUJBQWlCLENBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUMsQ0FBQztRQUM5RSxDQUFDO1FBRUQsTUFBTTtZQUNMLElBQUEsV0FBSyxFQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUN0QixNQUFNLGVBQWUsR0FBRyxJQUFJLENBQUMscUJBQXFCLENBQUMsTUFBTSxDQUFDO1lBQzFELElBQUksZUFBZSxFQUFFO2dCQUNwQixNQUFNLFFBQVEsR0FBRyxJQUFJLDRCQUFjLENBQUMsRUFBRSxFQUFFLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBRSxpQkFBaUIsRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDO2dCQUN0RixJQUFJLGVBQWUsQ0FBQyxJQUFJLEVBQUU7b0JBQ3pCLFFBQVEsQ0FBQyxjQUFjLENBQUMsS0FBSyxlQUFlLENBQUMsSUFBSSxDQUFDLEVBQUUsU0FBUyxDQUFDLENBQUM7aUJBQy9EO2dCQUNELFFBQVEsQ0FBQyxjQUFjLENBQUMsZUFBZSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQztnQkFDdkQsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLGlCQUFpQixDQUFDLEdBQUcsQ0FBQyxJQUFBLGlDQUFjLEVBQUMsUUFBUSxFQUFFO29CQUNwRSxhQUFhLEVBQUU7d0JBQ2QsUUFBUSxFQUFFLENBQUMsT0FBTyxFQUFFLEVBQUU7NEJBQ3JCLElBQUksQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxFQUFFLGFBQWEsRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQywwQkFBaUIsQ0FBQyxDQUFDO3dCQUNwRixDQUFDO3dCQUNELFdBQVcsRUFBRSxJQUFJLENBQUMsaUJBQWlCO3FCQUNuQztpQkFDRCxDQUFDLENBQUMsQ0FBQztnQkFDSixJQUFBLFlBQU0sRUFBQyxJQUFJLENBQUMsU0FBUyxFQUFFLFFBQVEsQ0FBQyxPQUFPLENBQUMsQ0FBQzthQUN6QztZQUNELElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxFQUFFLENBQUM7UUFDMUIsQ0FBQztLQUNELENBQUE7SUF0Q1ksc0RBQXFCO29DQUFyQixxQkFBcUI7UUFVL0IsV0FBQSx1QkFBYyxDQUFBO09BVkoscUJBQXFCLENBc0NqQztJQUVNLElBQU0sNkJBQTZCLEdBQW5DLE1BQU0sNkJBQThCLFNBQVEsZUFBZTtRQUtqRSxZQUNrQixTQUFzQixFQUNMLCtCQUFrRixFQUMzRSxzQ0FBZ0c7WUFFekksS0FBSyxFQUFFLENBQUM7WUFKUyxjQUFTLEdBQVQsU0FBUyxDQUFhO1lBQ1ksb0NBQStCLEdBQS9CLCtCQUErQixDQUFrQztZQUMxRCwyQ0FBc0MsR0FBdEMsc0NBQXNDLENBQXlDO1lBTnpILGlCQUFZLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLGVBQU8sRUFBUSxDQUFDLENBQUM7WUFDM0QsZ0JBQVcsR0FBZ0IsSUFBSSxDQUFDLFlBQVksQ0FBQyxLQUFLLENBQUM7WUFRM0QsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO1lBQ2QsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsK0JBQStCLENBQUMsMEJBQTBCLENBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUMsQ0FBQztRQUN0RyxDQUFDO1FBRUQsTUFBTTtZQUNMLElBQUEsV0FBSyxFQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUN0QixNQUFNLG9CQUFvQixHQUFHLElBQUksQ0FBQyx1QkFBdUIsRUFBRSxDQUFDO1lBQzVELElBQUksb0JBQW9CLEVBQUU7Z0JBQ3pCLElBQUksb0JBQW9CLENBQUMsSUFBSSxFQUFFO29CQUM5QixJQUFBLFlBQU0sRUFBQyxJQUFJLENBQUMsU0FBUyxFQUFFLElBQUEsT0FBQyxFQUFDLE1BQU0scUJBQVMsQ0FBQyxhQUFhLENBQUMsb0JBQW9CLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7aUJBQ3RGO2dCQUNELElBQUEsWUFBTSxFQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsSUFBQSxPQUFDLEVBQUMseUJBQXlCLEVBQUUsU0FBUyxFQUFFLG9CQUFvQixDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7YUFDOUY7WUFDRCxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksRUFBRSxDQUFDO1FBQzFCLENBQUM7UUFFTyx1QkFBdUI7WUFDOUIsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTO21CQUNmLElBQUksQ0FBQyxTQUFTLENBQUMsZUFBZTttQkFDOUIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLHFDQUE2QixFQUNuRDtnQkFDRCxPQUFPLFNBQVMsQ0FBQzthQUNqQjtZQUNELE1BQU0sa0JBQWtCLEdBQUcsSUFBSSxDQUFDLCtCQUErQixDQUFDLCtCQUErQixFQUFFLENBQUM7WUFDbEcsSUFBSSxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUMsV0FBVyxFQUFFLENBQUMsRUFBRTtnQkFDbkUsTUFBTSxVQUFVLEdBQUcsa0JBQWtCLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUMsRUFBRSxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUMsVUFBVSxDQUFDO2dCQUM3RixJQUFJLFVBQVUsRUFBRTtvQkFDZixPQUFPLEVBQUUsSUFBSSxFQUFFLCtCQUFhLEVBQUUsT0FBTyxFQUFFLFVBQVUsRUFBRSxDQUFDO2lCQUNwRDthQUNEO2lCQUFNLElBQUksSUFBSSxDQUFDLHNDQUFzQyxDQUFDLDRCQUE0QixDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUMsV0FBVyxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRTtnQkFDL0ksT0FBTyxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUUsT0FBTyxFQUFFLElBQUEsY0FBUSxFQUFDLDhCQUE4QixFQUFFLG9FQUFvRSxDQUFDLEVBQUUsQ0FBQzthQUNwSjtZQUNELE9BQU8sU0FBUyxDQUFDO1FBQ2xCLENBQUM7S0FDRCxDQUFBO0lBN0NZLHNFQUE2Qjs0Q0FBN0IsNkJBQTZCO1FBT3ZDLFdBQUEsMkRBQWdDLENBQUE7UUFDaEMsV0FBQSxrRUFBdUMsQ0FBQTtPQVI3Qiw2QkFBNkIsQ0E2Q3pDO0lBRVksUUFBQSx3QkFBd0IsR0FBRyxJQUFBLDZCQUFhLEVBQUMsOEJBQThCLEVBQUUsRUFBRSxLQUFLLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUUsTUFBTSxFQUFFLFNBQVMsRUFBRSxPQUFPLEVBQUUsa0NBQWtCLEVBQUUsRUFBRSxJQUFBLGNBQVEsRUFBQyw2QkFBNkIsRUFBRSx1Q0FBdUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQ3hQLFFBQUEsbUNBQW1DLEdBQUcsSUFBQSw2QkFBYSxFQUFDLGtDQUFrQyxFQUFFLEVBQUUsSUFBSSxFQUFFLGtDQUFrQixFQUFFLEtBQUssRUFBRSxrQ0FBa0IsRUFBRSxNQUFNLEVBQUUsa0NBQWtCLEVBQUUsT0FBTyxFQUFFLGtDQUFrQixFQUFFLEVBQUUsSUFBQSxjQUFRLEVBQUMsaUNBQWlDLEVBQUUsa0RBQWtELENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQztJQUNqVCxRQUFBLDRCQUE0QixHQUFHLElBQUEsNkJBQWEsRUFBQyxvQ0FBb0MsRUFBRSxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUUsS0FBSyxFQUFFLFNBQVMsRUFBRSxNQUFNLEVBQUUsU0FBUyxFQUFFLE9BQU8sRUFBRSxrQ0FBa0IsRUFBRSxFQUFFLElBQUEsY0FBUSxFQUFDLCtCQUErQixFQUFFLDJDQUEyQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDeFEsUUFBQSx5QkFBeUIsR0FBRyxJQUFBLDZCQUFhLEVBQUMsaUNBQWlDLEVBQUUsRUFBRSxLQUFLLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRSxPQUFPLEVBQUUsU0FBUyxFQUFFLEVBQUUsSUFBQSxjQUFRLEVBQUMsaUNBQWlDLEVBQUUsdUNBQXVDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQztJQUUvUCxJQUFBLHlDQUEwQixFQUFDLENBQUMsS0FBSyxFQUFFLFNBQVMsRUFBRSxFQUFFO1FBQy9DLE1BQU0sbUJBQW1CLEdBQUcsS0FBSyxDQUFDLFFBQVEsQ0FBQyxnQ0FBd0IsQ0FBQyxDQUFDO1FBQ3JFLElBQUksbUJBQW1CLEVBQUU7WUFDeEIsU0FBUyxDQUFDLE9BQU8sQ0FBQywrR0FBK0csbUJBQW1CLEtBQUssQ0FBQyxDQUFDO1lBQzNKLFNBQVMsQ0FBQyxPQUFPLENBQUMsaUVBQWlFLHFCQUFTLENBQUMsYUFBYSxDQUFDLDhCQUFZLENBQUMsYUFBYSxtQkFBbUIsS0FBSyxDQUFDLENBQUM7U0FDL0o7UUFFRCxNQUFNLDhCQUE4QixHQUFHLEtBQUssQ0FBQyxRQUFRLENBQUMsMkNBQW1DLENBQUMsQ0FBQztRQUMzRixJQUFJLDhCQUE4QixFQUFFO1lBQ25DLFNBQVMsQ0FBQyxPQUFPLENBQUMsR0FBRyxxQkFBUyxDQUFDLGFBQWEsQ0FBQyx1Q0FBcUIsQ0FBQyxhQUFhLDhCQUE4QixLQUFLLENBQUMsQ0FBQztTQUNySDtRQUVELFNBQVMsQ0FBQyxPQUFPLENBQUMsaUVBQWlFLHFCQUFTLENBQUMsYUFBYSxDQUFDLDZCQUFXLENBQUMsNERBQTRELENBQUMsQ0FBQztRQUNyTCxTQUFTLENBQUMsT0FBTyxDQUFDLCtEQUErRCxxQkFBUyxDQUFDLGFBQWEsQ0FBQyw2QkFBVyxDQUFDLDREQUE0RCxDQUFDLENBQUM7SUFDcEwsQ0FBQyxDQUFDLENBQUMifQ==