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
define(["require", "exports", "vs/base/common/semver/semver", "vs/base/common/lifecycle", "vs/workbench/contrib/extensions/common/extensions", "vs/base/browser/dom", "vs/base/common/platform", "vs/nls!vs/workbench/contrib/extensions/browser/extensionsWidgets", "vs/workbench/services/extensionManagement/common/extensionManagement", "vs/workbench/services/extensionRecommendations/common/extensionRecommendations", "vs/platform/label/common/label", "vs/workbench/contrib/extensions/browser/extensionsActions", "vs/platform/theme/common/themeService", "vs/base/common/themables", "vs/workbench/common/theme", "vs/base/common/event", "vs/platform/instantiation/common/instantiation", "vs/base/browser/ui/countBadge/countBadge", "vs/platform/configuration/common/configuration", "vs/platform/userDataSync/common/userDataSync", "vs/workbench/contrib/extensions/browser/extensionsIcons", "vs/platform/theme/common/colorRegistry", "vs/workbench/services/hover/browser/hover", "vs/base/common/htmlContent", "vs/base/common/uri", "vs/workbench/services/extensions/common/extensions", "vs/platform/extensionManagement/common/extensionManagementUtil", "vs/base/common/severity", "vs/base/browser/ui/iconLabel/iconLabelHover", "vs/base/common/color", "vs/base/browser/markdownRenderer", "vs/platform/opener/common/opener", "vs/base/common/errors", "vs/base/browser/ui/iconLabel/iconLabels", "vs/base/browser/keyboardEvent", "vs/platform/telemetry/common/telemetry", "vs/platform/theme/browser/defaultStyles", "vs/css!./media/extensionsWidgets"], function (require, exports, semver, lifecycle_1, extensions_1, dom_1, platform, nls_1, extensionManagement_1, extensionRecommendations_1, label_1, extensionsActions_1, themeService_1, themables_1, theme_1, event_1, instantiation_1, countBadge_1, configuration_1, userDataSync_1, extensionsIcons_1, colorRegistry_1, hover_1, htmlContent_1, uri_1, extensions_2, extensionManagementUtil_1, severity_1, iconLabelHover_1, color_1, markdownRenderer_1, opener_1, errors_1, iconLabels_1, keyboardEvent_1, telemetry_1, defaultStyles_1) {
    "use strict";
    var $2Tb_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$8Tb = exports.$7Tb = exports.$6Tb = exports.$5Tb = exports.$4Tb = exports.$3Tb = exports.$2Tb = exports.$1Tb = exports.$ZTb = exports.$YTb = exports.$XTb = exports.$WTb = exports.$VTb = exports.$UTb = exports.$TTb = exports.$STb = exports.$RTb = exports.$QTb = exports.$PTb = void 0;
    class $PTb extends lifecycle_1.$kc {
        constructor() {
            super(...arguments);
            this.f = null;
        }
        get extension() { return this.f; }
        set extension(extension) { this.f = extension; this.update(); }
        update() { this.render(); }
    }
    exports.$PTb = $PTb;
    function $QTb(element, callback) {
        const disposables = new lifecycle_1.$jc();
        disposables.add((0, dom_1.$nO)(element, dom_1.$3O.CLICK, (0, dom_1.$gP)(callback)));
        disposables.add((0, dom_1.$nO)(element, dom_1.$3O.KEY_UP, e => {
            const keyboardEvent = new keyboardEvent_1.$jO(e);
            if (keyboardEvent.equals(10 /* KeyCode.Space */) || keyboardEvent.equals(3 /* KeyCode.Enter */)) {
                e.preventDefault();
                e.stopPropagation();
                callback();
            }
        }));
        return disposables;
    }
    exports.$QTb = $QTb;
    class $RTb extends $PTb {
        constructor(a, b) {
            super();
            this.a = a;
            this.b = b;
            a.classList.add('extension-install-count');
            this.render();
        }
        render() {
            this.a.innerText = '';
            if (!this.extension) {
                return;
            }
            if (this.b && this.extension.state === 1 /* ExtensionState.Installed */) {
                return;
            }
            const installLabel = $RTb.getInstallLabel(this.extension, this.b);
            if (!installLabel) {
                return;
            }
            (0, dom_1.$0O)(this.a, (0, dom_1.$)('span' + themables_1.ThemeIcon.asCSSSelector(extensionsIcons_1.$0gb)));
            const count = (0, dom_1.$0O)(this.a, (0, dom_1.$)('span.count'));
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
                installLabel = installCount.toLocaleString(platform.$v);
            }
            return installLabel;
        }
    }
    exports.$RTb = $RTb;
    class $STb extends $PTb {
        constructor(a, b) {
            super();
            this.a = a;
            this.b = b;
            a.classList.add('extension-ratings');
            if (this.b) {
                a.classList.add('small');
            }
            this.render();
        }
        render() {
            this.a.innerText = '';
            this.a.title = '';
            if (!this.extension) {
                return;
            }
            if (this.b && this.extension.state === 1 /* ExtensionState.Installed */) {
                return;
            }
            if (this.extension.rating === undefined) {
                return;
            }
            if (this.b && !this.extension.ratingCount) {
                return;
            }
            const rating = Math.round(this.extension.rating * 2) / 2;
            this.a.title = (0, nls_1.localize)(0, null, rating);
            if (this.b) {
                (0, dom_1.$0O)(this.a, (0, dom_1.$)('span' + themables_1.ThemeIcon.asCSSSelector(extensionsIcons_1.$chb)));
                const count = (0, dom_1.$0O)(this.a, (0, dom_1.$)('span.count'));
                count.textContent = String(rating);
            }
            else {
                for (let i = 1; i <= 5; i++) {
                    if (rating >= i) {
                        (0, dom_1.$0O)(this.a, (0, dom_1.$)('span' + themables_1.ThemeIcon.asCSSSelector(extensionsIcons_1.$chb)));
                    }
                    else if (rating >= i - 0.5) {
                        (0, dom_1.$0O)(this.a, (0, dom_1.$)('span' + themables_1.ThemeIcon.asCSSSelector(extensionsIcons_1.$dhb)));
                    }
                    else {
                        (0, dom_1.$0O)(this.a, (0, dom_1.$)('span' + themables_1.ThemeIcon.asCSSSelector(extensionsIcons_1.$ehb)));
                    }
                }
                if (this.extension.ratingCount) {
                    const ratingCountElemet = (0, dom_1.$0O)(this.a, (0, dom_1.$)('span', undefined, ` (${this.extension.ratingCount})`));
                    ratingCountElemet.style.paddingLeft = '1px';
                }
            }
        }
    }
    exports.$STb = $STb;
    let $TTb = class $TTb extends $PTb {
        constructor(b, c, g) {
            super();
            this.b = b;
            this.c = c;
            this.g = g;
            this.a = this.B(new lifecycle_1.$jc());
            this.render();
        }
        render() {
            (0, dom_1.$_O)(this.b);
            this.a.clear();
            if (!this.extension?.publisherDomain?.verified) {
                return;
            }
            const publisherDomainLink = uri_1.URI.parse(this.extension.publisherDomain.link);
            const verifiedPublisher = (0, dom_1.$0O)(this.b, (0, dom_1.$)('span.extension-verified-publisher.clickable'));
            (0, dom_1.$0O)(verifiedPublisher, (0, iconLabels_1.$yQ)(extensionsIcons_1.$_gb));
            if (!this.c) {
                verifiedPublisher.tabIndex = 0;
                verifiedPublisher.title = this.extension.publisherDomain.link;
                verifiedPublisher.setAttribute('role', 'link');
                (0, dom_1.$0O)(verifiedPublisher, (0, dom_1.$)('span.extension-verified-publisher-domain', undefined, publisherDomainLink.authority.startsWith('www.') ? publisherDomainLink.authority.substring(4) : publisherDomainLink.authority));
                this.a.add($QTb(verifiedPublisher, () => this.g.open(publisherDomainLink)));
            }
        }
    };
    exports.$TTb = $TTb;
    exports.$TTb = $TTb = __decorate([
        __param(2, opener_1.$NT)
    ], $TTb);
    let $UTb = class $UTb extends $PTb {
        constructor(b, c, g) {
            super();
            this.b = b;
            this.c = c;
            this.g = g;
            this.a = this.B(new lifecycle_1.$jc());
            this.render();
        }
        render() {
            (0, dom_1.$_O)(this.b);
            this.a.clear();
            if (!this.extension?.publisherSponsorLink) {
                return;
            }
            const sponsor = (0, dom_1.$0O)(this.b, (0, dom_1.$)('span.sponsor.clickable', { tabIndex: 0, title: this.extension?.publisherSponsorLink }));
            sponsor.setAttribute('role', 'link'); // #132645
            const sponsorIconElement = (0, iconLabels_1.$yQ)(extensionsIcons_1.$bhb);
            const label = (0, dom_1.$)('span', undefined, (0, nls_1.localize)(1, null));
            (0, dom_1.$0O)(sponsor, sponsorIconElement, label);
            this.a.add($QTb(sponsor, () => {
                this.g.publicLog2('extensionsAction.sponsorExtension', { extensionId: this.extension.identifier.id });
                this.c.open(this.extension.publisherSponsorLink);
            }));
        }
    };
    exports.$UTb = $UTb;
    exports.$UTb = $UTb = __decorate([
        __param(1, opener_1.$NT),
        __param(2, telemetry_1.$9k)
    ], $UTb);
    let $VTb = class $VTb extends $PTb {
        constructor(c, g) {
            super();
            this.c = c;
            this.g = g;
            this.b = this.B(new lifecycle_1.$jc());
            this.render();
            this.B((0, lifecycle_1.$ic)(() => this.h()));
            this.B(this.g.onDidChangeRecommendations(() => this.render()));
        }
        h() {
            if (this.a) {
                this.c.removeChild(this.a);
            }
            this.a = undefined;
            this.b.clear();
        }
        render() {
            this.h();
            if (!this.extension || this.extension.state === 1 /* ExtensionState.Installed */ || this.extension.deprecationInfo) {
                return;
            }
            const extRecommendations = this.g.getAllRecommendationsWithReason();
            if (extRecommendations[this.extension.identifier.id.toLowerCase()]) {
                this.a = (0, dom_1.$0O)(this.c, (0, dom_1.$)('div.extension-bookmark'));
                const recommendation = (0, dom_1.$0O)(this.a, (0, dom_1.$)('.recommendation'));
                (0, dom_1.$0O)(recommendation, (0, dom_1.$)('span' + themables_1.ThemeIcon.asCSSSelector(extensionsIcons_1.$$gb)));
            }
        }
    };
    exports.$VTb = $VTb;
    exports.$VTb = $VTb = __decorate([
        __param(1, extensionRecommendations_1.$9fb)
    ], $VTb);
    class $WTb extends $PTb {
        constructor(c) {
            super();
            this.c = c;
            this.b = this.B(new lifecycle_1.$jc());
            this.render();
            this.B((0, lifecycle_1.$ic)(() => this.g()));
        }
        g() {
            if (this.a) {
                this.c.removeChild(this.a);
            }
            this.a = undefined;
            this.b.clear();
        }
        render() {
            this.g();
            if (!this.extension) {
                return;
            }
            if (!this.extension.hasPreReleaseVersion) {
                return;
            }
            if (this.extension.state === 1 /* ExtensionState.Installed */ && !this.extension.local?.isPreReleaseVersion) {
                return;
            }
            this.a = (0, dom_1.$0O)(this.c, (0, dom_1.$)('div.extension-bookmark'));
            const preRelease = (0, dom_1.$0O)(this.a, (0, dom_1.$)('.pre-release'));
            (0, dom_1.$0O)(preRelease, (0, dom_1.$)('span' + themables_1.ThemeIcon.asCSSSelector(extensionsIcons_1.$ahb)));
        }
    }
    exports.$WTb = $WTb;
    let $XTb = class $XTb extends $PTb {
        constructor(parent, c, g, h) {
            super();
            this.c = c;
            this.g = g;
            this.h = h;
            this.a = this.B(new lifecycle_1.$lc());
            this.b = (0, dom_1.$0O)(parent, (0, dom_1.$)('.extension-remote-badge-container'));
            this.render();
            this.B((0, lifecycle_1.$ic)(() => this.j()));
        }
        j() {
            if (this.a.value) {
                this.b.removeChild(this.a.value.element);
            }
            this.a.clear();
        }
        render() {
            this.j();
            if (!this.extension || !this.extension.local || !this.extension.server || !(this.g.localExtensionManagementServer && this.g.remoteExtensionManagementServer) || this.extension.server !== this.g.remoteExtensionManagementServer) {
                return;
            }
            this.a.value = this.h.createInstance(RemoteBadge, this.c);
            (0, dom_1.$0O)(this.b, this.a.value.element);
        }
    };
    exports.$XTb = $XTb;
    exports.$XTb = $XTb = __decorate([
        __param(2, extensionManagement_1.$fcb),
        __param(3, instantiation_1.$Ah)
    ], $XTb);
    let RemoteBadge = class RemoteBadge extends lifecycle_1.$kc {
        constructor(a, b, c, f) {
            super();
            this.a = a;
            this.b = b;
            this.c = c;
            this.f = f;
            this.element = (0, dom_1.$)('div.extension-badge.extension-remote-badge');
            this.g();
        }
        g() {
            (0, dom_1.$0O)(this.element, (0, dom_1.$)('span' + themables_1.ThemeIcon.asCSSSelector(extensionsIcons_1.$9gb)));
            const applyBadgeStyle = () => {
                if (!this.element) {
                    return;
                }
                const bgColor = this.c.getColorTheme().getColor(theme_1.$Gab);
                const fgColor = this.c.getColorTheme().getColor(theme_1.$Hab);
                this.element.style.backgroundColor = bgColor ? bgColor.toString() : '';
                this.element.style.color = fgColor ? fgColor.toString() : '';
            };
            applyBadgeStyle();
            this.B(this.c.onDidColorThemeChange(() => applyBadgeStyle()));
            if (this.a) {
                const updateTitle = () => {
                    if (this.element && this.f.remoteExtensionManagementServer) {
                        this.element.title = (0, nls_1.localize)(2, null, this.f.remoteExtensionManagementServer.label);
                    }
                };
                this.B(this.b.onDidChangeFormatters(() => updateTitle()));
                updateTitle();
            }
        }
    };
    RemoteBadge = __decorate([
        __param(1, label_1.$Vz),
        __param(2, themeService_1.$gv),
        __param(3, extensionManagement_1.$fcb)
    ], RemoteBadge);
    class $YTb extends $PTb {
        constructor(b) {
            super();
            this.b = b;
            this.render();
            this.B((0, lifecycle_1.$ic)(() => this.c()));
        }
        c() {
            this.a?.remove();
        }
        render() {
            this.c();
            if (!this.extension || !(this.extension.categories?.some(category => category.toLowerCase() === 'extension packs')) || !this.extension.extensionPack.length) {
                return;
            }
            this.a = (0, dom_1.$0O)(this.b, (0, dom_1.$)('.extension-badge.extension-pack-badge'));
            const countBadge = new countBadge_1.$nR(this.a, {}, defaultStyles_1.$v2);
            countBadge.setCount(this.extension.extensionPack.length);
        }
    }
    exports.$YTb = $YTb;
    let $ZTb = class $ZTb extends $PTb {
        constructor(a, b, c, g) {
            super();
            this.a = a;
            this.b = b;
            this.c = c;
            this.g = g;
            this.B(event_1.Event.filter(this.b.onDidChangeConfiguration, e => e.affectsConfiguration('settingsSync.ignoredExtensions'))(() => this.render()));
            this.B(g.onDidChangeEnablement(() => this.update()));
            this.render();
        }
        render() {
            this.a.innerText = '';
            if (this.extension && this.extension.state === 1 /* ExtensionState.Installed */ && this.g.isEnabled() && this.c.isExtensionIgnoredToSync(this.extension)) {
                const element = (0, dom_1.$0O)(this.a, (0, dom_1.$)('span.extension-sync-ignored' + themables_1.ThemeIcon.asCSSSelector(extensionsIcons_1.$8gb)));
                element.title = (0, nls_1.localize)(3, null);
                element.classList.add(...themables_1.ThemeIcon.asClassNameArray(extensionsIcons_1.$8gb));
            }
        }
    };
    exports.$ZTb = $ZTb;
    exports.$ZTb = $ZTb = __decorate([
        __param(1, configuration_1.$8h),
        __param(2, extensions_1.$Pfb),
        __param(3, userDataSync_1.$Pgb)
    ], $ZTb);
    let $1Tb = class $1Tb extends $PTb {
        constructor(a, b, extensionService, c) {
            super();
            this.a = a;
            this.b = b;
            this.c = c;
            this.B(extensionService.onDidChangeExtensionsStatus(extensions => {
                if (this.extension && extensions.some(e => (0, extensionManagementUtil_1.$po)({ id: e.value }, this.extension.identifier))) {
                    this.update();
                }
            }));
        }
        render() {
            this.a.innerText = '';
            if (!this.extension) {
                return;
            }
            const extensionStatus = this.c.getExtensionStatus(this.extension);
            if (!extensionStatus || !extensionStatus.activationTimes) {
                return;
            }
            const activationTime = extensionStatus.activationTimes.codeLoadingTime + extensionStatus.activationTimes.activateCallTime;
            if (this.b) {
                (0, dom_1.$0O)(this.a, (0, dom_1.$)('span' + themables_1.ThemeIcon.asCSSSelector(extensionsIcons_1.$jhb)));
                const activationTimeElement = (0, dom_1.$0O)(this.a, (0, dom_1.$)('span.activationTime'));
                activationTimeElement.textContent = `${activationTime}ms`;
            }
            else {
                const activationTimeElement = (0, dom_1.$0O)(this.a, (0, dom_1.$)('span.activationTime'));
                activationTimeElement.textContent = `${(0, nls_1.localize)(4, null)}${extensionStatus.activationTimes.activationReason.startup ? ` (${(0, nls_1.localize)(5, null)})` : ''} : ${activationTime}ms`;
            }
        }
    };
    exports.$1Tb = $1Tb;
    exports.$1Tb = $1Tb = __decorate([
        __param(2, extensions_2.$MF),
        __param(3, extensions_1.$Pfb)
    ], $1Tb);
    let $2Tb = $2Tb_1 = class $2Tb extends $PTb {
        constructor(b, c, g, h, j, m, n) {
            super();
            this.b = b;
            this.c = c;
            this.g = g;
            this.h = h;
            this.j = j;
            this.m = m;
            this.n = n;
            this.a = this.B(new lifecycle_1.$lc());
        }
        render() {
            this.a.value = undefined;
            if (this.extension) {
                this.a.value = (0, iconLabelHover_1.$ZP)({
                    delay: this.j.getValue('workbench.hover.delay'),
                    showHover: (options) => {
                        return this.h.showHover({
                            ...options,
                            hoverPosition: this.b.position(),
                            forcePosition: true,
                            additionalClasses: ['extension-hover']
                        });
                    },
                    placement: 'element'
                }, this.b.target, { markdown: () => Promise.resolve(this.r()), markdownNotSupportedFallback: undefined });
            }
        }
        r() {
            if (!this.extension) {
                return undefined;
            }
            const markdown = new htmlContent_1.$Xj('', { isTrusted: true, supportThemeIcons: true });
            markdown.appendMarkdown(`**${this.extension.displayName}**`);
            if (semver.valid(this.extension.version)) {
                markdown.appendMarkdown(`&nbsp;<span style="background-color:#8080802B;">**&nbsp;_v${this.extension.version}_**&nbsp;</span>`);
            }
            if (this.extension.state === 1 /* ExtensionState.Installed */ ? this.extension.local?.isPreReleaseVersion : this.extension.gallery?.properties.isPreReleaseVersion) {
                const extensionPreReleaseIcon = this.n.getColorTheme().getColor(exports.$7Tb);
                markdown.appendMarkdown(`**&nbsp;**&nbsp;<span style="color:#ffffff;background-color:${extensionPreReleaseIcon ? color_1.$Os.Format.CSS.formatHex(extensionPreReleaseIcon) : '#ffffff'};">&nbsp;$(${extensionsIcons_1.$ahb.id})&nbsp;${(0, nls_1.localize)(6, null)}&nbsp;</span>`);
            }
            markdown.appendText(`\n`);
            if (this.extension.state === 1 /* ExtensionState.Installed */) {
                let addSeparator = false;
                const installLabel = $RTb.getInstallLabel(this.extension, true);
                if (installLabel) {
                    if (addSeparator) {
                        markdown.appendText(`  |  `);
                    }
                    markdown.appendMarkdown(`$(${extensionsIcons_1.$0gb.id}) ${installLabel}`);
                    addSeparator = true;
                }
                if (this.extension.rating) {
                    if (addSeparator) {
                        markdown.appendText(`  |  `);
                    }
                    const rating = Math.round(this.extension.rating * 2) / 2;
                    markdown.appendMarkdown(`$(${extensionsIcons_1.$chb.id}) [${rating}](${this.extension.url}&ssr=false#review-details)`);
                    addSeparator = true;
                }
                if (this.extension.publisherSponsorLink) {
                    if (addSeparator) {
                        markdown.appendText(`  |  `);
                    }
                    markdown.appendMarkdown(`$(${extensionsIcons_1.$bhb.id}) [${(0, nls_1.localize)(7, null)}](${this.extension.publisherSponsorLink})`);
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
                const bgColor = this.n.getColorTheme().getColor(exports.$6Tb);
                const publisherVerifiedTooltip = (0, nls_1.localize)(8, null, `[${uri_1.URI.parse(this.extension.publisherDomain.link).authority}](${this.extension.publisherDomain.link})`);
                markdown.appendMarkdown(`<span style="color:${bgColor ? color_1.$Os.Format.CSS.formatHex(bgColor) : '#ffffff'};">$(${extensionsIcons_1.$_gb.id})</span>&nbsp;${publisherVerifiedTooltip}`);
                markdown.appendText(`\n`);
            }
            if (this.extension.outdated) {
                markdown.appendMarkdown((0, nls_1.localize)(9, null));
                markdown.appendMarkdown(`&nbsp;<span style="background-color:#8080802B;">**&nbsp;_v${this.extension.latestVersion}_**&nbsp;</span>`);
                markdown.appendText(`\n`);
            }
            const preReleaseMessage = $2Tb_1.getPreReleaseMessage(this.extension);
            const extensionRuntimeStatus = this.g.getExtensionStatus(this.extension);
            const extensionStatus = this.c.status;
            const reloadRequiredMessage = this.extension.reloadRequiredStatus;
            const recommendationMessage = this.s(this.extension);
            if (extensionRuntimeStatus || extensionStatus || reloadRequiredMessage || recommendationMessage || preReleaseMessage) {
                markdown.appendMarkdown(`---`);
                markdown.appendText(`\n`);
                if (extensionRuntimeStatus) {
                    if (extensionRuntimeStatus.activationTimes) {
                        const activationTime = extensionRuntimeStatus.activationTimes.codeLoadingTime + extensionRuntimeStatus.activationTimes.activateCallTime;
                        markdown.appendMarkdown(`${(0, nls_1.localize)(10, null)}${extensionRuntimeStatus.activationTimes.activationReason.startup ? ` (${(0, nls_1.localize)(11, null)})` : ''}: \`${activationTime}ms\``);
                        markdown.appendText(`\n`);
                    }
                    if (extensionRuntimeStatus.runtimeErrors.length || extensionRuntimeStatus.messages.length) {
                        const hasErrors = extensionRuntimeStatus.runtimeErrors.length || extensionRuntimeStatus.messages.some(message => message.type === severity_1.default.Error);
                        const hasWarnings = extensionRuntimeStatus.messages.some(message => message.type === severity_1.default.Warning);
                        const errorsLink = extensionRuntimeStatus.runtimeErrors.length ? `[${extensionRuntimeStatus.runtimeErrors.length === 1 ? (0, nls_1.localize)(12, null) : (0, nls_1.localize)(13, null, extensionRuntimeStatus.runtimeErrors.length)}](${uri_1.URI.parse(`command:extension.open?${encodeURIComponent(JSON.stringify([this.extension.identifier.id, "runtimeStatus" /* ExtensionEditorTab.RuntimeStatus */]))}`)})` : undefined;
                        const messageLink = extensionRuntimeStatus.messages.length ? `[${extensionRuntimeStatus.messages.length === 1 ? (0, nls_1.localize)(14, null) : (0, nls_1.localize)(15, null, extensionRuntimeStatus.messages.length)}](${uri_1.URI.parse(`command:extension.open?${encodeURIComponent(JSON.stringify([this.extension.identifier.id, "runtimeStatus" /* ExtensionEditorTab.RuntimeStatus */]))}`)})` : undefined;
                        markdown.appendMarkdown(`$(${hasErrors ? extensionsIcons_1.$fhb.id : hasWarnings ? extensionsIcons_1.$ghb.id : extensionsIcons_1.$hhb.id}) This extension has reported `);
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
                        markdown.appendMarkdown(`&nbsp;[${(0, nls_1.localize)(16, null)}](${uri_1.URI.parse(`command:extension.open?${encodeURIComponent(JSON.stringify([this.extension.identifier.id, "dependencies" /* ExtensionEditorTab.Dependencies */]))}`)})`);
                    }
                    markdown.appendText(`\n`);
                }
                if (reloadRequiredMessage) {
                    markdown.appendMarkdown(`$(${extensionsIcons_1.$hhb.id})&nbsp;`);
                    markdown.appendMarkdown(`${reloadRequiredMessage}`);
                    markdown.appendText(`\n`);
                }
                if (preReleaseMessage) {
                    const extensionPreReleaseIcon = this.n.getColorTheme().getColor(exports.$7Tb);
                    markdown.appendMarkdown(`<span style="color:${extensionPreReleaseIcon ? color_1.$Os.Format.CSS.formatHex(extensionPreReleaseIcon) : '#ffffff'};">$(${extensionsIcons_1.$ahb.id})</span>&nbsp;${preReleaseMessage}`);
                    markdown.appendText(`\n`);
                }
                if (recommendationMessage) {
                    markdown.appendMarkdown(recommendationMessage);
                    markdown.appendText(`\n`);
                }
            }
            return markdown;
        }
        s(extension) {
            if (extension.state === 1 /* ExtensionState.Installed */) {
                return undefined;
            }
            if (extension.deprecationInfo) {
                return undefined;
            }
            const recommendation = this.m.getAllRecommendationsWithReason()[extension.identifier.id.toLowerCase()];
            if (!recommendation?.reasonText) {
                return undefined;
            }
            const bgColor = this.n.getColorTheme().getColor(extensionsActions_1.$cib);
            return `<span style="color:${bgColor ? color_1.$Os.Format.CSS.formatHex(bgColor) : '#ffffff'};">$(${extensionsIcons_1.$ehb.id})</span>&nbsp;${recommendation.reasonText}`;
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
            const preReleaseVersionLink = `[${(0, nls_1.localize)(17, null)}](${uri_1.URI.parse(`command:workbench.extensions.action.showPreReleaseVersion?${encodeURIComponent(JSON.stringify([extension.identifier.id]))}`)})`;
            return (0, nls_1.localize)(18, null, preReleaseVersionLink);
        }
    };
    exports.$2Tb = $2Tb;
    exports.$2Tb = $2Tb = $2Tb_1 = __decorate([
        __param(2, extensions_1.$Pfb),
        __param(3, hover_1.$zib),
        __param(4, configuration_1.$8h),
        __param(5, extensionRecommendations_1.$9fb),
        __param(6, themeService_1.$gv)
    ], $2Tb);
    let $3Tb = class $3Tb extends $PTb {
        constructor(c, g, h) {
            super();
            this.c = c;
            this.g = g;
            this.h = h;
            this.a = this.B(new lifecycle_1.$jc());
            this.b = this.B(new event_1.$fd());
            this.onDidRender = this.b.event;
            this.render();
            this.B(g.onDidChangeStatus(() => this.render()));
        }
        render() {
            (0, dom_1.$_O)(this.c);
            const extensionStatus = this.g.status;
            if (extensionStatus) {
                const markdown = new htmlContent_1.$Xj('', { isTrusted: true, supportThemeIcons: true });
                if (extensionStatus.icon) {
                    markdown.appendMarkdown(`$(${extensionStatus.icon.id})&nbsp;`);
                }
                markdown.appendMarkdown(extensionStatus.message.value);
                const rendered = this.a.add((0, markdownRenderer_1.$zQ)(markdown, {
                    actionHandler: {
                        callback: (content) => {
                            this.h.open(content, { allowCommands: true }).catch(errors_1.$Y);
                        },
                        disposables: this.a
                    }
                }));
                (0, dom_1.$0O)(this.c, rendered.element);
            }
            this.b.fire();
        }
    };
    exports.$3Tb = $3Tb;
    exports.$3Tb = $3Tb = __decorate([
        __param(2, opener_1.$NT)
    ], $3Tb);
    let $4Tb = class $4Tb extends $PTb {
        constructor(b, c, g) {
            super();
            this.b = b;
            this.c = c;
            this.g = g;
            this.a = this.B(new event_1.$fd());
            this.onDidRender = this.a.event;
            this.render();
            this.B(this.c.onDidChangeRecommendations(() => this.render()));
        }
        render() {
            (0, dom_1.$_O)(this.b);
            const recommendationStatus = this.h();
            if (recommendationStatus) {
                if (recommendationStatus.icon) {
                    (0, dom_1.$0O)(this.b, (0, dom_1.$)(`div${themables_1.ThemeIcon.asCSSSelector(recommendationStatus.icon)}`));
                }
                (0, dom_1.$0O)(this.b, (0, dom_1.$)(`div.recommendation-text`, undefined, recommendationStatus.message));
            }
            this.a.fire();
        }
        h() {
            if (!this.extension
                || this.extension.deprecationInfo
                || this.extension.state === 1 /* ExtensionState.Installed */) {
                return undefined;
            }
            const extRecommendations = this.c.getAllRecommendationsWithReason();
            if (extRecommendations[this.extension.identifier.id.toLowerCase()]) {
                const reasonText = extRecommendations[this.extension.identifier.id.toLowerCase()].reasonText;
                if (reasonText) {
                    return { icon: extensionsIcons_1.$ehb, message: reasonText };
                }
            }
            else if (this.g.globalIgnoredRecommendations.indexOf(this.extension.identifier.id.toLowerCase()) !== -1) {
                return { icon: undefined, message: (0, nls_1.localize)(19, null) };
            }
            return undefined;
        }
    };
    exports.$4Tb = $4Tb;
    exports.$4Tb = $4Tb = __decorate([
        __param(1, extensionRecommendations_1.$9fb),
        __param(2, extensionRecommendations_1.$0fb)
    ], $4Tb);
    exports.$5Tb = (0, colorRegistry_1.$sv)('extensionIcon.starForeground', { light: '#DF6100', dark: '#FF8E00', hcDark: '#FF8E00', hcLight: colorRegistry_1.$Ev }, (0, nls_1.localize)(20, null), true);
    exports.$6Tb = (0, colorRegistry_1.$sv)('extensionIcon.verifiedForeground', { dark: colorRegistry_1.$Ev, light: colorRegistry_1.$Ev, hcDark: colorRegistry_1.$Ev, hcLight: colorRegistry_1.$Ev }, (0, nls_1.localize)(21, null), true);
    exports.$7Tb = (0, colorRegistry_1.$sv)('extensionIcon.preReleaseForeground', { dark: '#1d9271', light: '#1d9271', hcDark: '#1d9271', hcLight: colorRegistry_1.$Ev }, (0, nls_1.localize)(22, null), true);
    exports.$8Tb = (0, colorRegistry_1.$sv)('extensionIcon.sponsorForeground', { light: '#B51E78', dark: '#D758B3', hcDark: null, hcLight: '#B51E78' }, (0, nls_1.localize)(23, null), true);
    (0, themeService_1.$mv)((theme, collector) => {
        const extensionRatingIcon = theme.getColor(exports.$5Tb);
        if (extensionRatingIcon) {
            collector.addRule(`.extension-ratings .codicon-extensions-star-full, .extension-ratings .codicon-extensions-star-half { color: ${extensionRatingIcon}; }`);
            collector.addRule(`.monaco-hover.extension-hover .markdown-hover .hover-contents ${themables_1.ThemeIcon.asCSSSelector(extensionsIcons_1.$chb)} { color: ${extensionRatingIcon}; }`);
        }
        const extensionVerifiedPublisherIcon = theme.getColor(exports.$6Tb);
        if (extensionVerifiedPublisherIcon) {
            collector.addRule(`${themables_1.ThemeIcon.asCSSSelector(extensionsIcons_1.$_gb)} { color: ${extensionVerifiedPublisherIcon}; }`);
        }
        collector.addRule(`.monaco-hover.extension-hover .markdown-hover .hover-contents ${themables_1.ThemeIcon.asCSSSelector(extensionsIcons_1.$bhb)} { color: var(--vscode-extensionIcon-sponsorForeground); }`);
        collector.addRule(`.extension-editor > .header > .details > .subtitle .sponsor ${themables_1.ThemeIcon.asCSSSelector(extensionsIcons_1.$bhb)} { color: var(--vscode-extensionIcon-sponsorForeground); }`);
    });
});
//# sourceMappingURL=extensionsWidgets.js.map