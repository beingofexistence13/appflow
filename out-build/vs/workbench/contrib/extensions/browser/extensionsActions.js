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
define(["require", "exports", "vs/nls!vs/workbench/contrib/extensions/browser/extensionsActions", "vs/base/common/actions", "vs/base/common/async", "vs/base/browser/dom", "vs/base/common/event", "vs/base/common/json", "vs/platform/contextview/browser/contextView", "vs/base/common/lifecycle", "vs/workbench/contrib/extensions/common/extensions", "vs/workbench/contrib/extensions/common/extensionsFileTemplate", "vs/platform/extensionManagement/common/extensionManagement", "vs/workbench/services/extensionManagement/common/extensionManagement", "vs/workbench/services/extensionRecommendations/common/extensionRecommendations", "vs/platform/extensionManagement/common/extensionManagementUtil", "vs/platform/extensions/common/extensions", "vs/platform/instantiation/common/instantiation", "vs/platform/files/common/files", "vs/platform/workspace/common/workspace", "vs/workbench/services/host/browser/host", "vs/workbench/services/extensions/common/extensions", "vs/base/common/uri", "vs/platform/commands/common/commands", "vs/platform/configuration/common/configuration", "vs/platform/theme/common/themeService", "vs/base/common/themables", "vs/platform/theme/common/colorRegistry", "vs/workbench/services/configuration/common/jsonEditing", "vs/editor/common/services/resolverService", "vs/platform/contextkey/common/contextkey", "vs/platform/actions/common/actions", "vs/workbench/browser/actions/workspaceCommands", "vs/platform/notification/common/notification", "vs/platform/opener/common/opener", "vs/workbench/services/editor/common/editorService", "vs/platform/quickinput/common/quickInput", "vs/base/common/cancellation", "vs/base/browser/ui/aria/aria", "vs/workbench/services/themes/common/workbenchThemeService", "vs/platform/label/common/label", "vs/workbench/services/textfile/common/textfiles", "vs/platform/product/common/productService", "vs/platform/dialogs/common/dialogs", "vs/platform/progress/common/progress", "vs/base/browser/ui/actionbar/actionViewItems", "vs/workbench/services/extensionRecommendations/common/workspaceExtensionsConfig", "vs/base/common/errors", "vs/platform/userDataSync/common/userDataSync", "vs/base/browser/ui/dropdown/dropdownActionViewItem", "vs/platform/log/common/log", "vs/workbench/contrib/extensions/browser/extensionsIcons", "vs/base/common/platform", "vs/workbench/services/extensions/common/extensionManifestPropertiesService", "vs/platform/workspace/common/workspaceTrust", "vs/platform/workspace/common/virtualWorkspace", "vs/base/common/htmlContent", "vs/workbench/services/panecomposite/browser/panecomposite", "vs/base/common/arrays", "vs/base/common/date", "vs/workbench/services/preferences/common/preferences", "vs/platform/languagePacks/common/languagePacks", "vs/workbench/services/localization/common/locale", "vs/base/common/types", "vs/workbench/services/log/common/logConstants", "vs/platform/telemetry/common/telemetry", "vs/css!./media/extensionActions"], function (require, exports, nls_1, actions_1, async_1, DOM, event_1, json, contextView_1, lifecycle_1, extensions_1, extensionsFileTemplate_1, extensionManagement_1, extensionManagement_2, extensionRecommendations_1, extensionManagementUtil_1, extensions_2, instantiation_1, files_1, workspace_1, host_1, extensions_3, uri_1, commands_1, configuration_1, themeService_1, themables_1, colorRegistry_1, jsonEditing_1, resolverService_1, contextkey_1, actions_2, workspaceCommands_1, notification_1, opener_1, editorService_1, quickInput_1, cancellation_1, aria_1, workbenchThemeService_1, label_1, textfiles_1, productService_1, dialogs_1, progress_1, actionViewItems_1, workspaceExtensionsConfig_1, errors_1, userDataSync_1, dropdownActionViewItem_1, log_1, extensionsIcons_1, platform_1, extensionManifestPropertiesService_1, workspaceTrust_1, virtualWorkspace_1, htmlContent_1, panecomposite_1, arrays_1, date_1, preferences_1, languagePacks_1, locale_1, types_1, logConstants_1, telemetry_1) {
    "use strict";
    var $rhb_1, $uhb_1, $yhb_1, $Bhb_1, $Ghb_1, $Jhb_1, $Khb_1, $Lhb_1, $Mhb_1, $Nhb_1, $Ohb_1, $Phb_1, $Shb_1, $Thb_1, $Uhb_1, $Vhb_1, $Whb_1, $Xhb_1, $Yhb_1, $Zhb_1, $1hb_1, $2hb_1, $7hb_1, $8hb_1, $9hb_1, $0hb_1, $$hb_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$cib = exports.$bib = exports.$aib = exports.$_hb = exports.$$hb = exports.$0hb = exports.$9hb = exports.$8hb = exports.$7hb = exports.$6hb = exports.$5hb = exports.$4hb = exports.$3hb = exports.$2hb = exports.$1hb = exports.$Zhb = exports.$Yhb = exports.$Xhb = exports.$Whb = exports.$Vhb = exports.$Uhb = exports.$Thb = exports.$Shb = exports.$Rhb = exports.$Qhb = exports.$Phb = exports.$Ohb = exports.$Nhb = exports.$Mhb = exports.$Lhb = exports.$Khb = exports.$Jhb = exports.$Ihb = exports.$Hhb = exports.$Ghb = exports.$Fhb = exports.$Ehb = exports.$Dhb = exports.$Chb = exports.$Bhb = exports.$Ahb = exports.$zhb = exports.$yhb = exports.$xhb = exports.$whb = exports.$vhb = exports.$uhb = exports.$thb = exports.$shb = exports.$rhb = exports.$qhb = exports.$phb = exports.$ohb = void 0;
    let $ohb = class $ohb extends actions_1.$gi {
        constructor(b, f, g, s, t, J, L, M, N, O, P, Q, R, S) {
            super('extension.promptExtensionInstallFailure');
            this.b = b;
            this.f = f;
            this.g = g;
            this.s = s;
            this.t = t;
            this.J = J;
            this.L = L;
            this.M = M;
            this.N = N;
            this.O = O;
            this.P = P;
            this.Q = Q;
            this.R = R;
            this.S = S;
        }
        async run() {
            if ((0, errors_1.$2)(this.s)) {
                return;
            }
            this.O.error(this.s);
            if (this.s.name === extensionManagement_1.ExtensionManagementErrorCode.Unsupported) {
                const productName = platform_1.$o ? (0, nls_1.localize)(0, null, this.t.nameLong) : this.t.nameLong;
                const message = (0, nls_1.localize)(1, null, this.b.displayName || this.b.identifier.id, productName);
                const { confirmed } = await this.M.confirm({
                    type: notification_1.Severity.Info,
                    message,
                    primaryButton: (0, nls_1.localize)(2, null),
                    cancelButton: (0, nls_1.localize)(3, null)
                });
                if (confirmed) {
                    this.J.open(platform_1.$o ? uri_1.URI.parse('https://aka.ms/vscode-web-extensions-guide') : uri_1.URI.parse('https://aka.ms/vscode-remote'));
                }
                return;
            }
            if ([extensionManagement_1.ExtensionManagementErrorCode.Incompatible, extensionManagement_1.ExtensionManagementErrorCode.IncompatibleTargetPlatform, extensionManagement_1.ExtensionManagementErrorCode.Malicious, extensionManagement_1.ExtensionManagementErrorCode.ReleaseVersionNotFound, extensionManagement_1.ExtensionManagementErrorCode.Deprecated].includes(this.s.name)) {
                await this.M.info((0, errors_1.$8)(this.s));
                return;
            }
            if (extensionManagement_1.ExtensionManagementErrorCode.Signature === this.s.name) {
                await this.M.prompt({
                    type: 'error',
                    message: (0, nls_1.localize)(4, null, this.t.nameLong, this.b.displayName || this.b.identifier.id),
                    buttons: [{
                            label: (0, nls_1.localize)(5, null),
                            run: () => {
                                const installAction = this.Q.createInstance($rhb, { donotVerifySignature: true });
                                installAction.extension = this.b;
                                return installAction.run();
                            }
                        }],
                    cancelButton: (0, nls_1.localize)(6, null)
                });
                return;
            }
            const operationMessage = this.g === 3 /* InstallOperation.Update */ ? (0, nls_1.localize)(7, null, this.b.displayName || this.b.identifier.id)
                : (0, nls_1.localize)(8, null, this.b.displayName || this.b.identifier.id);
            let additionalMessage;
            const promptChoices = [];
            const downloadUrl = await this.U();
            if (downloadUrl) {
                additionalMessage = (0, nls_1.localize)(9, null, `command:${logConstants_1.$nhb}`);
                promptChoices.push({
                    label: (0, nls_1.localize)(10, null),
                    run: () => this.J.open(downloadUrl).then(() => {
                        this.L.prompt(notification_1.Severity.Info, (0, nls_1.localize)(11, null, this.b.identifier.id), [{
                                label: (0, nls_1.localize)(12, null),
                                run: () => this.N.executeCommand(extensions_1.$Yfb)
                            }]);
                    })
                });
            }
            const message = `${operationMessage}${additionalMessage ? ` ${additionalMessage}` : ''}`;
            this.L.prompt(notification_1.Severity.Error, message, promptChoices);
        }
        async U() {
            if (platform_1.$q) {
                return undefined;
            }
            if (!this.b.gallery) {
                return undefined;
            }
            if (!this.t.extensionsGallery) {
                return undefined;
            }
            if (!this.P.localExtensionManagementServer && !this.P.remoteExtensionManagementServer) {
                return undefined;
            }
            let targetPlatform = this.b.gallery.properties.targetPlatform;
            if (targetPlatform !== "universal" /* TargetPlatform.UNIVERSAL */ && targetPlatform !== "undefined" /* TargetPlatform.UNDEFINED */ && this.P.remoteExtensionManagementServer) {
                try {
                    const manifest = await this.R.getManifest(this.b.gallery, cancellation_1.CancellationToken.None);
                    if (manifest && this.S.prefersExecuteOnWorkspace(manifest)) {
                        targetPlatform = await this.P.remoteExtensionManagementServer.extensionManagementService.getTargetPlatform();
                    }
                }
                catch (error) {
                    this.O.error(error);
                    return undefined;
                }
            }
            if (targetPlatform === "unknown" /* TargetPlatform.UNKNOWN */) {
                return undefined;
            }
            return uri_1.URI.parse(`${this.t.extensionsGallery.serviceUrl}/publishers/${this.b.publisher}/vsextensions/${this.b.name}/${this.f}/vspackage${targetPlatform !== "undefined" /* TargetPlatform.UNDEFINED */ ? `?targetPlatform=${targetPlatform}` : ''}`);
        }
    };
    exports.$ohb = $ohb;
    exports.$ohb = $ohb = __decorate([
        __param(4, productService_1.$kj),
        __param(5, opener_1.$NT),
        __param(6, notification_1.$Yu),
        __param(7, dialogs_1.$oA),
        __param(8, commands_1.$Fr),
        __param(9, log_1.$5i),
        __param(10, extensionManagement_2.$fcb),
        __param(11, instantiation_1.$Ah),
        __param(12, extensionManagement_1.$Zn),
        __param(13, extensionManifestPropertiesService_1.$vcb)
    ], $ohb);
    class $phb extends actions_1.$gi {
        constructor() {
            super(...arguments);
            this.b = null;
        }
        static { this.EXTENSION_ACTION_CLASS = 'extension-action'; }
        static { this.TEXT_ACTION_CLASS = `${$phb.EXTENSION_ACTION_CLASS} text`; }
        static { this.LABEL_ACTION_CLASS = `${$phb.EXTENSION_ACTION_CLASS} label`; }
        static { this.ICON_ACTION_CLASS = `${$phb.EXTENSION_ACTION_CLASS} icon`; }
        get extension() { return this.b; }
        set extension(extension) { this.b = extension; this.update(); }
    }
    exports.$phb = $phb;
    class $qhb extends $phb {
        get menuActions() { return [...this.g]; }
        get extension() {
            return super.extension;
        }
        set extension(extension) {
            this.s.forEach(a => a.extension = extension);
            super.extension = extension;
        }
        constructor(id, label, t) {
            super(id, label);
            this.t = t;
            this.g = [];
            this.s = (0, arrays_1.$Pb)(t);
            this.update();
            this.B(event_1.Event.any(...this.s.map(a => a.onDidChange))(() => this.update(true)));
            this.s.forEach(a => this.B(a));
        }
        update(donotUpdateActions) {
            if (!donotUpdateActions) {
                this.s.forEach(a => a.update());
            }
            const enabledActionsGroups = this.t.map(actionsGroup => actionsGroup.filter(a => a.enabled));
            let actions = [];
            for (const enabledActions of enabledActionsGroups) {
                if (enabledActions.length) {
                    actions = [...actions, ...enabledActions, new actions_1.$ii()];
                }
            }
            actions = actions.length ? actions.slice(0, actions.length - 1) : actions;
            this.f = actions[0];
            this.g = actions.length > 1 ? actions : [];
            this.enabled = !!this.f;
            if (this.f) {
                this.label = this.J(this.f);
                this.tooltip = this.f.tooltip;
            }
            let clazz = (this.f || this.s[0])?.class || '';
            clazz = clazz ? `${clazz} action-dropdown` : 'action-dropdown';
            if (this.g.length === 0) {
                clazz += ' action-dropdown';
            }
            this.class = clazz;
        }
        run() {
            const enabledActions = this.s.filter(a => a.enabled);
            return enabledActions[0].run();
        }
        J(action) {
            return action.label;
        }
    }
    exports.$qhb = $qhb;
    let $rhb = class $rhb extends $phb {
        static { $rhb_1 = this; }
        static { this.Class = `${$phb.LABEL_ACTION_CLASS} prominent install`; }
        set manifest(manifest) {
            this.f = manifest;
            this.W();
        }
        constructor(options, s, t, J, L, M, N, O, P) {
            super('extensions.install', (0, nls_1.localize)(13, null), $rhb_1.Class, false);
            this.s = s;
            this.t = t;
            this.J = J;
            this.L = L;
            this.M = M;
            this.N = N;
            this.O = O;
            this.P = P;
            this.f = null;
            this.g = new async_1.$Ag();
            this.options = { ...options, isMachineScoped: false };
            this.update();
            this.B(this.M.onDidChangeFormatters(() => this.W(), this));
        }
        update() {
            this.g.queue(() => this.Q());
        }
        async Q() {
            this.enabled = false;
            if (!this.extension) {
                return;
            }
            if (this.extension.isBuiltin) {
                return;
            }
            if (this.s.canSetLanguage(this.extension)) {
                return;
            }
            if (this.extension.state === 3 /* ExtensionState.Uninstalled */ && await this.s.canInstall(this.extension)) {
                this.enabled = this.options.installPreReleaseVersion ? this.extension.hasPreReleaseVersion : this.extension.hasReleaseVersion;
                this.W();
            }
        }
        async run() {
            if (!this.extension) {
                return;
            }
            if (this.extension.deprecationInfo) {
                let detail = (0, nls_1.localize)(14, null);
                let DeprecationChoice;
                (function (DeprecationChoice) {
                    DeprecationChoice[DeprecationChoice["InstallAnyway"] = 0] = "InstallAnyway";
                    DeprecationChoice[DeprecationChoice["ShowAlternateExtension"] = 1] = "ShowAlternateExtension";
                    DeprecationChoice[DeprecationChoice["ConfigureSettings"] = 2] = "ConfigureSettings";
                    DeprecationChoice[DeprecationChoice["Cancel"] = 3] = "Cancel";
                })(DeprecationChoice || (DeprecationChoice = {}));
                const buttons = [
                    {
                        label: (0, nls_1.localize)(15, null),
                        run: () => DeprecationChoice.InstallAnyway
                    }
                ];
                if (this.extension.deprecationInfo.extension) {
                    detail = (0, nls_1.localize)(16, null, this.extension.deprecationInfo.extension.displayName);
                    const alternateExtension = this.extension.deprecationInfo.extension;
                    buttons.push({
                        label: (0, nls_1.localize)(17, null, this.extension.deprecationInfo.extension.displayName),
                        run: async () => {
                            const [extension] = await this.s.getExtensions([{ id: alternateExtension.id, preRelease: alternateExtension.preRelease }], cancellation_1.CancellationToken.None);
                            await this.s.open(extension);
                            return DeprecationChoice.ShowAlternateExtension;
                        }
                    });
                }
                else if (this.extension.deprecationInfo.settings) {
                    detail = (0, nls_1.localize)(18, null);
                    const settings = this.extension.deprecationInfo.settings;
                    buttons.push({
                        label: (0, nls_1.localize)(19, null),
                        run: async () => {
                            await this.O.openSettings({ query: settings.map(setting => `@id:${setting}`).join(' ') });
                            return DeprecationChoice.ConfigureSettings;
                        }
                    });
                }
                else if (this.extension.deprecationInfo.additionalInfo) {
                    detail = new htmlContent_1.$Xj(`${detail} ${this.extension.deprecationInfo.additionalInfo}`);
                }
                const { result } = await this.N.prompt({
                    type: notification_1.Severity.Warning,
                    message: (0, nls_1.localize)(20, null, this.extension.displayName),
                    detail: (0, types_1.$jf)(detail) ? detail : undefined,
                    custom: (0, types_1.$jf)(detail) ? undefined : {
                        markdownDetails: [{
                                markdown: detail
                            }]
                    },
                    buttons,
                    cancelButton: {
                        run: () => DeprecationChoice.Cancel
                    }
                });
                if (result !== DeprecationChoice.InstallAnyway) {
                    return;
                }
            }
            this.s.open(this.extension, { showPreReleaseVersion: this.options.installPreReleaseVersion });
            (0, aria_1.$$P)((0, nls_1.localize)(21, null, this.extension.displayName));
            /* __GDPR__
                "extensions:action:install" : {
                    "owner": "sandy081",
                    "actionId" : { "classification": "SystemMetaData", "purpose": "FeatureInsight" },
                    "${include}": [
                        "${GalleryExtensionTelemetryData}"
                    ]
                }
            */
            this.P.publicLog('extensions:action:install', { ...this.extension.telemetryData, actionId: this.id });
            const extension = await this.S(this.extension);
            if (extension?.local) {
                (0, aria_1.$$P)((0, nls_1.localize)(22, null, this.extension.displayName));
                const runningExtension = await this.U(extension.local);
                if (runningExtension && !(runningExtension.activationEvents && runningExtension.activationEvents.some(activationEent => activationEent.startsWith('onLanguage')))) {
                    const action = await this.R(extension);
                    if (action) {
                        action.extension = extension;
                        try {
                            return action.run({ showCurrentTheme: true, ignoreFocusLost: true });
                        }
                        finally {
                            action.dispose();
                        }
                    }
                }
            }
        }
        async R(extension) {
            const colorThemes = await this.L.getColorThemes();
            if (colorThemes.some(theme => isThemeFromExtension(theme, extension))) {
                return this.t.createInstance($Thb);
            }
            const fileIconThemes = await this.L.getFileIconThemes();
            if (fileIconThemes.some(theme => isThemeFromExtension(theme, extension))) {
                return this.t.createInstance($Uhb);
            }
            const productIconThemes = await this.L.getProductIconThemes();
            if (productIconThemes.some(theme => isThemeFromExtension(theme, extension))) {
                return this.t.createInstance($Vhb);
            }
            return undefined;
        }
        async S(extension) {
            try {
                return await this.s.install(extension, this.options);
            }
            catch (error) {
                await this.t.createInstance($ohb, extension, extension.latestVersion, 2 /* InstallOperation.Install */, error).run();
                return undefined;
            }
        }
        async U(extension) {
            const runningExtension = await this.J.getExtension(extension.identifier.id);
            if (runningExtension) {
                return runningExtension;
            }
            if (this.J.canAddExtension((0, extensions_3.$UF)(extension))) {
                return new Promise((c, e) => {
                    const disposable = this.J.onDidChangeExtensions(async () => {
                        const runningExtension = await this.J.getExtension(extension.identifier.id);
                        if (runningExtension) {
                            disposable.dispose();
                            c(runningExtension);
                        }
                    });
                });
            }
            return null;
        }
        W() {
            this.label = this.getLabel();
        }
        getLabel(primary) {
            /* install pre-release version */
            if (this.options.installPreReleaseVersion && this.extension?.hasPreReleaseVersion) {
                return primary ? (0, nls_1.localize)(23, null) : (0, nls_1.localize)(24, null);
            }
            /* install released version that has a pre release version */
            if (this.extension?.hasPreReleaseVersion) {
                return primary ? (0, nls_1.localize)(25, null) : (0, nls_1.localize)(26, null);
            }
            return (0, nls_1.localize)(27, null);
        }
    };
    exports.$rhb = $rhb;
    exports.$rhb = $rhb = $rhb_1 = __decorate([
        __param(1, extensions_1.$Pfb),
        __param(2, instantiation_1.$Ah),
        __param(3, extensions_3.$MF),
        __param(4, workbenchThemeService_1.$egb),
        __param(5, label_1.$Vz),
        __param(6, dialogs_1.$oA),
        __param(7, preferences_1.$BE),
        __param(8, telemetry_1.$9k)
    ], $rhb);
    let $shb = class $shb extends $qhb {
        set manifest(manifest) {
            this.s.forEach(a => a.manifest = manifest);
            this.update();
        }
        constructor(instantiationService, extensionsWorkbenchService) {
            super(`extensions.installActions`, '', [
                [
                    instantiationService.createInstance($rhb, { installPreReleaseVersion: extensionsWorkbenchService.preferPreReleases }),
                    instantiationService.createInstance($rhb, { installPreReleaseVersion: !extensionsWorkbenchService.preferPreReleases }),
                ]
            ]);
        }
        J(action) {
            return action.getLabel(true);
        }
    };
    exports.$shb = $shb;
    exports.$shb = $shb = __decorate([
        __param(0, instantiation_1.$Ah),
        __param(1, extensions_1.$Pfb)
    ], $shb);
    class $thb extends $phb {
        static { this.f = (0, nls_1.localize)(28, null); }
        static { this.g = `${$phb.LABEL_ACTION_CLASS} install installing`; }
        constructor() {
            super('extension.installing', $thb.f, $thb.g, false);
        }
        update() {
            this.class = `${$thb.g}${this.extension && this.extension.state === 0 /* ExtensionState.Installing */ ? '' : ' hide'}`;
        }
    }
    exports.$thb = $thb;
    let $uhb = class $uhb extends $phb {
        static { $uhb_1 = this; }
        static { this.f = (0, nls_1.localize)(29, null); }
        static { this.g = (0, nls_1.localize)(30, null); }
        static { this.s = `${$phb.LABEL_ACTION_CLASS} prominent install`; }
        static { this.t = `${$phb.LABEL_ACTION_CLASS} install installing`; }
        constructor(id, J, L, M, N, O) {
            super(id, $uhb_1.f, $uhb_1.s, false);
            this.J = J;
            this.L = L;
            this.M = M;
            this.N = N;
            this.O = O;
            this.updateWhenCounterExtensionChanges = true;
            this.update();
        }
        update() {
            this.enabled = false;
            this.class = $uhb_1.s;
            if (this.P()) {
                const extensionInOtherServer = this.M.installed.filter(e => (0, extensionManagementUtil_1.$po)(e.identifier, this.extension.identifier) && e.server === this.J)[0];
                if (extensionInOtherServer) {
                    // Getting installed in other server
                    if (extensionInOtherServer.state === 0 /* ExtensionState.Installing */ && !extensionInOtherServer.local) {
                        this.enabled = true;
                        this.label = $uhb_1.g;
                        this.class = $uhb_1.t;
                    }
                }
                else {
                    // Not installed in other server
                    this.enabled = true;
                    this.label = this.Q();
                }
            }
        }
        P() {
            // Disable if extension is not installed or not an user extension
            if (!this.extension
                || !this.J
                || !this.extension.local
                || this.extension.state !== 1 /* ExtensionState.Installed */
                || this.extension.type !== 1 /* ExtensionType.User */
                || this.extension.enablementState === 2 /* EnablementState.DisabledByEnvironment */ || this.extension.enablementState === 0 /* EnablementState.DisabledByTrustRequirement */ || this.extension.enablementState === 4 /* EnablementState.DisabledByVirtualWorkspace */) {
                return false;
            }
            if ((0, extensions_2.$Zl)(this.extension.local.manifest)) {
                return true;
            }
            // Prefers to run on UI
            if (this.J === this.N.localExtensionManagementServer && this.O.prefersExecuteOnUI(this.extension.local.manifest)) {
                return true;
            }
            // Prefers to run on Workspace
            if (this.J === this.N.remoteExtensionManagementServer && this.O.prefersExecuteOnWorkspace(this.extension.local.manifest)) {
                return true;
            }
            // Prefers to run on Web
            if (this.J === this.N.webExtensionManagementServer && this.O.prefersExecuteOnWeb(this.extension.local.manifest)) {
                return true;
            }
            if (this.L) {
                // Can run on UI
                if (this.J === this.N.localExtensionManagementServer && this.O.canExecuteOnUI(this.extension.local.manifest)) {
                    return true;
                }
                // Can run on Workspace
                if (this.J === this.N.remoteExtensionManagementServer && this.O.canExecuteOnWorkspace(this.extension.local.manifest)) {
                    return true;
                }
            }
            return false;
        }
        async run() {
            if (!this.extension?.local) {
                return;
            }
            if (!this.extension?.server) {
                return;
            }
            if (!this.J) {
                return;
            }
            this.M.open(this.extension);
            (0, aria_1.$$P)((0, nls_1.localize)(31, null, this.extension.displayName));
            return this.M.installInServer(this.extension, this.J);
        }
    };
    exports.$uhb = $uhb;
    exports.$uhb = $uhb = $uhb_1 = __decorate([
        __param(3, extensions_1.$Pfb),
        __param(4, extensionManagement_2.$fcb),
        __param(5, extensionManifestPropertiesService_1.$vcb)
    ], $uhb);
    let $vhb = class $vhb extends $uhb {
        constructor(canInstallAnyWhere, extensionsWorkbenchService, extensionManagementServerService, extensionManifestPropertiesService) {
            super(`extensions.remoteinstall`, extensionManagementServerService.remoteExtensionManagementServer, canInstallAnyWhere, extensionsWorkbenchService, extensionManagementServerService, extensionManifestPropertiesService);
        }
        Q() {
            return this.N.remoteExtensionManagementServer
                ? (0, nls_1.localize)(32, null, this.N.remoteExtensionManagementServer.label)
                : $uhb.f;
        }
    };
    exports.$vhb = $vhb;
    exports.$vhb = $vhb = __decorate([
        __param(1, extensions_1.$Pfb),
        __param(2, extensionManagement_2.$fcb),
        __param(3, extensionManifestPropertiesService_1.$vcb)
    ], $vhb);
    let $whb = class $whb extends $uhb {
        constructor(extensionsWorkbenchService, extensionManagementServerService, extensionManifestPropertiesService) {
            super(`extensions.localinstall`, extensionManagementServerService.localExtensionManagementServer, false, extensionsWorkbenchService, extensionManagementServerService, extensionManifestPropertiesService);
        }
        Q() {
            return (0, nls_1.localize)(33, null);
        }
    };
    exports.$whb = $whb;
    exports.$whb = $whb = __decorate([
        __param(0, extensions_1.$Pfb),
        __param(1, extensionManagement_2.$fcb),
        __param(2, extensionManifestPropertiesService_1.$vcb)
    ], $whb);
    let $xhb = class $xhb extends $uhb {
        constructor(extensionsWorkbenchService, extensionManagementServerService, extensionManifestPropertiesService) {
            super(`extensions.webInstall`, extensionManagementServerService.webExtensionManagementServer, false, extensionsWorkbenchService, extensionManagementServerService, extensionManifestPropertiesService);
        }
        Q() {
            return (0, nls_1.localize)(34, null);
        }
    };
    exports.$xhb = $xhb;
    exports.$xhb = $xhb = __decorate([
        __param(0, extensions_1.$Pfb),
        __param(1, extensionManagement_2.$fcb),
        __param(2, extensionManifestPropertiesService_1.$vcb)
    ], $xhb);
    let $yhb = class $yhb extends $phb {
        static { $yhb_1 = this; }
        static { this.UninstallLabel = (0, nls_1.localize)(35, null); }
        static { this.f = (0, nls_1.localize)(36, null); }
        static { this.g = `${$phb.LABEL_ACTION_CLASS} uninstall`; }
        static { this.s = `${$phb.LABEL_ACTION_CLASS} uninstall uninstalling`; }
        constructor(t) {
            super('extensions.uninstall', $yhb_1.UninstallLabel, $yhb_1.g, false);
            this.t = t;
            this.update();
        }
        update() {
            if (!this.extension) {
                this.enabled = false;
                return;
            }
            const state = this.extension.state;
            if (state === 2 /* ExtensionState.Uninstalling */) {
                this.label = $yhb_1.f;
                this.class = $yhb_1.s;
                this.enabled = false;
                return;
            }
            this.label = $yhb_1.UninstallLabel;
            this.class = $yhb_1.g;
            this.tooltip = $yhb_1.UninstallLabel;
            if (state !== 1 /* ExtensionState.Installed */) {
                this.enabled = false;
                return;
            }
            if (this.extension.isBuiltin) {
                this.enabled = false;
                return;
            }
            this.enabled = true;
        }
        async run() {
            if (!this.extension) {
                return;
            }
            (0, aria_1.$$P)((0, nls_1.localize)(37, null, this.extension.displayName));
            return this.t.uninstall(this.extension).then(() => {
                (0, aria_1.$$P)((0, nls_1.localize)(38, null, this.extension.displayName));
            });
        }
    };
    exports.$yhb = $yhb;
    exports.$yhb = $yhb = $yhb_1 = __decorate([
        __param(0, extensions_1.$Pfb)
    ], $yhb);
    class AbstractUpdateAction extends $phb {
        static { this.f = `${$phb.LABEL_ACTION_CLASS} prominent update`; }
        static { this.g = `${AbstractUpdateAction.f} disabled`; }
        constructor(id, label, t) {
            super(id, label, AbstractUpdateAction.g, false);
            this.t = t;
            this.s = new async_1.$Ag();
            this.update();
        }
        update() {
            this.s.queue(() => this.J());
        }
        async J() {
            this.enabled = false;
            this.class = $zhb.g;
            if (!this.extension) {
                return;
            }
            if (this.extension.deprecationInfo) {
                return;
            }
            const canInstall = await this.t.canInstall(this.extension);
            const isInstalled = this.extension.state === 1 /* ExtensionState.Installed */;
            this.enabled = canInstall && isInstalled && this.extension.outdated;
            this.class = this.enabled ? AbstractUpdateAction.f : AbstractUpdateAction.g;
        }
    }
    let $zhb = class $zhb extends AbstractUpdateAction {
        constructor(L, extensionsWorkbenchService, M) {
            super(`extensions.update`, (0, nls_1.localize)(39, null), extensionsWorkbenchService);
            this.L = L;
            this.M = M;
        }
        update() {
            super.update();
            if (this.extension) {
                this.label = this.L ? (0, nls_1.localize)(40, null, this.extension.latestVersion) : (0, nls_1.localize)(41, null);
            }
        }
        async run() {
            if (!this.extension) {
                return;
            }
            (0, aria_1.$$P)((0, nls_1.localize)(42, null, this.extension.displayName, this.extension.latestVersion));
            return this.N(this.extension);
        }
        async N(extension) {
            try {
                await this.t.install(extension, extension.local?.preRelease ? { installPreReleaseVersion: true } : undefined);
                (0, aria_1.$$P)((0, nls_1.localize)(43, null, extension.displayName, extension.latestVersion));
            }
            catch (err) {
                this.M.createInstance($ohb, extension, extension.latestVersion, 3 /* InstallOperation.Update */, err).run();
            }
        }
    };
    exports.$zhb = $zhb;
    exports.$zhb = $zhb = __decorate([
        __param(1, extensions_1.$Pfb),
        __param(2, instantiation_1.$Ah)
    ], $zhb);
    let $Ahb = class $Ahb extends AbstractUpdateAction {
        constructor(extensionsWorkbenchService) {
            super(`extensions.ignoreUpdates`, (0, nls_1.localize)(44, null), extensionsWorkbenchService);
        }
        update() {
            if (!this.extension) {
                return;
            }
            if (this.extension.isBuiltin) {
                this.enabled = false;
                return;
            }
            super.update();
            this.z = this.extension.pinned;
        }
        async run() {
            if (!this.extension) {
                return;
            }
            (0, aria_1.$$P)((0, nls_1.localize)(45, null, this.extension.displayName));
            const newIgnoresAutoUpdates = !this.extension.pinned;
            await this.t.pinExtension(this.extension, newIgnoresAutoUpdates);
        }
    };
    exports.$Ahb = $Ahb;
    exports.$Ahb = $Ahb = __decorate([
        __param(0, extensions_1.$Pfb)
    ], $Ahb);
    let $Bhb = class $Bhb extends $phb {
        static { $Bhb_1 = this; }
        static { this.f = `${$phb.LABEL_ACTION_CLASS} migrate`; }
        static { this.g = `${$Bhb_1.f} disabled`; }
        constructor(s, t) {
            super('extensionsAction.migrateDeprecatedExtension', (0, nls_1.localize)(46, null), $Bhb_1.g, false);
            this.s = s;
            this.t = t;
            this.update();
        }
        update() {
            this.enabled = false;
            this.class = $Bhb_1.g;
            if (!this.extension?.local) {
                return;
            }
            if (this.extension.state !== 1 /* ExtensionState.Installed */) {
                return;
            }
            if (!this.extension.deprecationInfo?.extension) {
                return;
            }
            const id = this.extension.deprecationInfo.extension.id;
            if (this.t.local.some(e => (0, extensionManagementUtil_1.$po)(e.identifier, { id }))) {
                return;
            }
            this.enabled = true;
            this.class = $Bhb_1.f;
            this.tooltip = (0, nls_1.localize)(47, null, this.extension.deprecationInfo.extension.displayName);
            this.label = this.s ? (0, nls_1.localize)(48, null) : this.tooltip;
        }
        async run() {
            if (!this.extension?.deprecationInfo?.extension) {
                return;
            }
            const local = this.extension.local;
            await this.t.uninstall(this.extension);
            const [extension] = await this.t.getExtensions([{ id: this.extension.deprecationInfo.extension.id, preRelease: this.extension.deprecationInfo?.extension?.preRelease }], cancellation_1.CancellationToken.None);
            await this.t.install(extension, { isMachineScoped: local?.isMachineScoped });
        }
    };
    exports.$Bhb = $Bhb;
    exports.$Bhb = $Bhb = $Bhb_1 = __decorate([
        __param(1, extensions_1.$Pfb)
    ], $Bhb);
    class $Chb extends dropdownActionViewItem_1.$DR {
        constructor(action, options, contextMenuProvider) {
            super(null, action, options, contextMenuProvider);
        }
        render(container) {
            super.render(container);
            this.F();
        }
        F() {
            super.F();
            if (this.element && this.b && this.b.element) {
                this.element.classList.toggle('empty', this._action.menuActions.length === 0);
                this.b.element.classList.toggle('hide', this._action.menuActions.length === 0);
            }
        }
    }
    exports.$Chb = $Chb;
    let $Dhb = class $Dhb extends $phb {
        constructor(id, label, cssClass, enabled, f) {
            super(id, label, cssClass, enabled);
            this.f = f;
            this.g = null;
        }
        createActionViewItem() {
            this.g = this.f.createInstance($Ehb, this);
            return this.g;
        }
        run({ actionGroups, disposeActionsOnHide }) {
            this.g?.showMenu(actionGroups, disposeActionsOnHide);
            return Promise.resolve();
        }
    };
    exports.$Dhb = $Dhb;
    exports.$Dhb = $Dhb = __decorate([
        __param(4, instantiation_1.$Ah)
    ], $Dhb);
    let $Ehb = class $Ehb extends actionViewItems_1.$NQ {
        constructor(action, b) {
            super(null, action, { icon: true, label: true });
            this.b = b;
        }
        showMenu(menuActionGroups, disposeActionsOnHide) {
            if (this.element) {
                const actions = this.g(menuActionGroups);
                const elementPosition = DOM.$FO(this.element);
                const anchor = { x: elementPosition.left, y: elementPosition.top + elementPosition.height + 10 };
                this.b.showContextMenu({
                    getAnchor: () => anchor,
                    getActions: () => actions,
                    actionRunner: this.actionRunner,
                    onHide: () => { if (disposeActionsOnHide) {
                        (0, lifecycle_1.$gc)(actions);
                    } }
                });
            }
        }
        g(menuActionGroups) {
            let actions = [];
            for (const menuActions of menuActionGroups) {
                actions = [...actions, ...menuActions, new actions_1.$ii()];
            }
            return actions.length ? actions.slice(0, actions.length - 1) : actions;
        }
    };
    exports.$Ehb = $Ehb;
    exports.$Ehb = $Ehb = __decorate([
        __param(1, contextView_1.$WZ)
    ], $Ehb);
    async function getContextMenuActionsGroups(extension, contextKeyService, instantiationService) {
        return instantiationService.invokeFunction(async (accessor) => {
            const extensionsWorkbenchService = accessor.get(extensions_1.$Pfb);
            const menuService = accessor.get(actions_2.$Su);
            const extensionRecommendationsService = accessor.get(extensionRecommendations_1.$9fb);
            const extensionIgnoredRecommendationsService = accessor.get(extensionRecommendations_1.$0fb);
            const workbenchThemeService = accessor.get(workbenchThemeService_1.$egb);
            const cksOverlay = [];
            if (extension) {
                cksOverlay.push(['extension', extension.identifier.id]);
                cksOverlay.push(['isBuiltinExtension', extension.isBuiltin]);
                cksOverlay.push(['isDefaultApplicationScopedExtension', extension.local && (0, extensions_2.$Yl)(extension.local.manifest)]);
                cksOverlay.push(['isApplicationScopedExtension', extension.local && extension.local.isApplicationScoped]);
                cksOverlay.push(['extensionHasConfiguration', extension.local && !!extension.local.manifest.contributes && !!extension.local.manifest.contributes.configuration]);
                cksOverlay.push(['extensionHasKeybindings', extension.local && !!extension.local.manifest.contributes && !!extension.local.manifest.contributes.keybindings]);
                cksOverlay.push(['extensionHasCommands', extension.local && !!extension.local.manifest.contributes && !!extension.local.manifest.contributes?.commands]);
                cksOverlay.push(['isExtensionRecommended', !!extensionRecommendationsService.getAllRecommendationsWithReason()[extension.identifier.id.toLowerCase()]]);
                cksOverlay.push(['isExtensionWorkspaceRecommended', extensionRecommendationsService.getAllRecommendationsWithReason()[extension.identifier.id.toLowerCase()]?.reasonId === 0 /* ExtensionRecommendationReason.Workspace */]);
                cksOverlay.push(['isUserIgnoredRecommendation', extensionIgnoredRecommendationsService.globalIgnoredRecommendations.some(e => e === extension.identifier.id.toLowerCase())]);
                if (extension.state === 1 /* ExtensionState.Installed */) {
                    cksOverlay.push(['extensionStatus', 'installed']);
                }
                cksOverlay.push(['installedExtensionIsPreReleaseVersion', !!extension.local?.isPreReleaseVersion]);
                cksOverlay.push(['installedExtensionIsOptedTpPreRelease', !!extension.local?.preRelease]);
                cksOverlay.push(['galleryExtensionIsPreReleaseVersion', !!extension.gallery?.properties.isPreReleaseVersion]);
                cksOverlay.push(['extensionHasPreReleaseVersion', extension.hasPreReleaseVersion]);
                cksOverlay.push(['extensionHasReleaseVersion', extension.hasReleaseVersion]);
                const [colorThemes, fileIconThemes, productIconThemes] = await Promise.all([workbenchThemeService.getColorThemes(), workbenchThemeService.getFileIconThemes(), workbenchThemeService.getProductIconThemes()]);
                cksOverlay.push(['extensionHasColorThemes', colorThemes.some(theme => isThemeFromExtension(theme, extension))]);
                cksOverlay.push(['extensionHasFileIconThemes', fileIconThemes.some(theme => isThemeFromExtension(theme, extension))]);
                cksOverlay.push(['extensionHasProductIconThemes', productIconThemes.some(theme => isThemeFromExtension(theme, extension))]);
                cksOverlay.push(['canSetLanguage', extensionsWorkbenchService.canSetLanguage(extension)]);
                cksOverlay.push(['isActiveLanguagePackExtension', extension.gallery && platform_1.$v === (0, languagePacks_1.$Hq)(extension.gallery)]);
            }
            const menu = menuService.createMenu(actions_2.$Ru.ExtensionContext, contextKeyService.createOverlay(cksOverlay));
            const actionsGroups = menu.getActions({ shouldForwardArgs: true });
            menu.dispose();
            return actionsGroups;
        });
    }
    function toActions(actionsGroups, instantiationService) {
        const result = [];
        for (const [, actions] of actionsGroups) {
            result.push(actions.map(action => {
                if (action instanceof actions_1.$ji) {
                    return action;
                }
                return instantiationService.createInstance($Ihb, action);
            }));
        }
        return result;
    }
    async function $Fhb(extension, contextKeyService, instantiationService) {
        const actionsGroups = await getContextMenuActionsGroups(extension, contextKeyService, instantiationService);
        return toActions(actionsGroups, instantiationService);
    }
    exports.$Fhb = $Fhb;
    let $Ghb = class $Ghb extends $Dhb {
        static { $Ghb_1 = this; }
        static { this.ID = 'extensions.manage'; }
        static { this.s = `${$phb.ICON_ACTION_CLASS} manage ` + themables_1.ThemeIcon.asClassName(extensionsIcons_1.$Zgb); }
        static { this.t = `${$Ghb_1.s} hide`; }
        constructor(instantiationService, J, L) {
            super($Ghb_1.ID, '', '', true, instantiationService);
            this.J = J;
            this.L = L;
            this.tooltip = (0, nls_1.localize)(49, null);
            this.update();
        }
        async getActionGroups() {
            const groups = [];
            const contextMenuActionsGroups = await getContextMenuActionsGroups(this.extension, this.L, this.f);
            const themeActions = [], installActions = [], otherActionGroups = [];
            for (const [group, actions] of contextMenuActionsGroups) {
                if (group === extensions_1.$5fb) {
                    installActions.push(...toActions([[group, actions]], this.f)[0]);
                }
                else if (group === extensions_1.$4fb) {
                    themeActions.push(...toActions([[group, actions]], this.f)[0]);
                }
                else {
                    otherActionGroups.push(...toActions([[group, actions]], this.f));
                }
            }
            if (themeActions.length) {
                groups.push(themeActions);
            }
            groups.push([
                this.f.createInstance($Nhb),
                this.f.createInstance($Mhb)
            ]);
            groups.push([
                this.f.createInstance($Phb),
                this.f.createInstance($Ohb)
            ]);
            groups.push([
                ...(installActions.length ? installActions : []),
                this.f.createInstance($Lhb),
                this.f.createInstance($yhb),
            ]);
            otherActionGroups.forEach(actions => groups.push(actions));
            groups.forEach(group => group.forEach(extensionAction => {
                if (extensionAction instanceof $phb) {
                    extensionAction.extension = this.extension;
                }
            }));
            return groups;
        }
        async run() {
            await this.J.whenInstalledExtensionsRegistered();
            return super.run({ actionGroups: await this.getActionGroups(), disposeActionsOnHide: true });
        }
        update() {
            this.class = $Ghb_1.t;
            this.enabled = false;
            if (this.extension) {
                const state = this.extension.state;
                this.enabled = state === 1 /* ExtensionState.Installed */;
                this.class = this.enabled || state === 2 /* ExtensionState.Uninstalling */ ? $Ghb_1.s : $Ghb_1.t;
            }
        }
    };
    exports.$Ghb = $Ghb;
    exports.$Ghb = $Ghb = $Ghb_1 = __decorate([
        __param(0, instantiation_1.$Ah),
        __param(1, extensions_3.$MF),
        __param(2, contextkey_1.$3i)
    ], $Ghb);
    class $Hhb extends $Dhb {
        constructor(s, instantiationService) {
            super('extensionEditor.manageExtension', '', `${$phb.ICON_ACTION_CLASS} manage ${themables_1.ThemeIcon.asClassName(extensionsIcons_1.$Zgb)}`, true, instantiationService);
            this.s = s;
            this.tooltip = (0, nls_1.localize)(50, null);
        }
        update() { }
        async run() {
            const actionGroups = [];
            (await $Fhb(this.extension, this.s, this.f)).forEach(actions => actionGroups.push(actions));
            actionGroups.forEach(group => group.forEach(extensionAction => {
                if (extensionAction instanceof $phb) {
                    extensionAction.extension = this.extension;
                }
            }));
            return super.run({ actionGroups, disposeActionsOnHide: true });
        }
    }
    exports.$Hhb = $Hhb;
    let $Ihb = class $Ihb extends $phb {
        constructor(f, g) {
            super(f.id, f.label);
            this.f = f;
            this.g = g;
        }
        update() {
            if (!this.extension) {
                return;
            }
            if (this.f.id === extensions_1.$Xfb) {
                this.checked = !this.g.isExtensionIgnoredToSync(this.extension);
            }
            else {
                this.checked = this.f.checked;
            }
        }
        async run() {
            if (this.extension) {
                await this.f.run(this.extension.local ? (0, extensionManagementUtil_1.$so)(this.extension.local.manifest.publisher, this.extension.local.manifest.name)
                    : this.extension.gallery ? (0, extensionManagementUtil_1.$so)(this.extension.gallery.publisher, this.extension.gallery.name)
                        : this.extension.identifier.id);
            }
        }
    };
    exports.$Ihb = $Ihb;
    exports.$Ihb = $Ihb = __decorate([
        __param(1, extensions_1.$Pfb)
    ], $Ihb);
    let $Jhb = class $Jhb extends $phb {
        static { $Jhb_1 = this; }
        static { this.ID = 'workbench.extensions.action.switchToPreReleaseVersion'; }
        static { this.TITLE = { value: (0, nls_1.localize)(51, null), original: 'Switch to  Pre-Release Version' }; }
        constructor(icon, f) {
            super($Jhb_1.ID, icon ? '' : $Jhb_1.TITLE.value, `${icon ? $phb.ICON_ACTION_CLASS + ' ' + themables_1.ThemeIcon.asClassName(extensionsIcons_1.$ahb) : $phb.LABEL_ACTION_CLASS} hide-when-disabled switch-to-prerelease`, true);
            this.f = f;
            this.tooltip = (0, nls_1.localize)(52, null);
            this.update();
        }
        update() {
            this.enabled = !!this.extension && !this.extension.isBuiltin && !this.extension.local?.isPreReleaseVersion && !this.extension.local?.preRelease && this.extension.hasPreReleaseVersion && this.extension.state === 1 /* ExtensionState.Installed */;
        }
        async run() {
            if (!this.enabled) {
                return;
            }
            return this.f.executeCommand($Jhb_1.ID, this.extension?.identifier.id);
        }
    };
    exports.$Jhb = $Jhb;
    exports.$Jhb = $Jhb = $Jhb_1 = __decorate([
        __param(1, commands_1.$Fr)
    ], $Jhb);
    let $Khb = class $Khb extends $phb {
        static { $Khb_1 = this; }
        static { this.ID = 'workbench.extensions.action.switchToReleaseVersion'; }
        static { this.TITLE = { value: (0, nls_1.localize)(53, null), original: 'Switch to Release Version' }; }
        constructor(icon, f) {
            super($Khb_1.ID, icon ? '' : $Khb_1.TITLE.value, `${icon ? $phb.ICON_ACTION_CLASS + ' ' + themables_1.ThemeIcon.asClassName(extensionsIcons_1.$ahb) : $phb.LABEL_ACTION_CLASS} hide-when-disabled switch-to-released`);
            this.f = f;
            this.tooltip = (0, nls_1.localize)(54, null);
            this.update();
        }
        update() {
            this.enabled = !!this.extension && !this.extension.isBuiltin && this.extension.state === 1 /* ExtensionState.Installed */ && !!this.extension.local?.isPreReleaseVersion && !!this.extension.hasReleaseVersion;
        }
        async run() {
            if (!this.enabled) {
                return;
            }
            return this.f.executeCommand($Khb_1.ID, this.extension?.identifier.id);
        }
    };
    exports.$Khb = $Khb;
    exports.$Khb = $Khb = $Khb_1 = __decorate([
        __param(1, commands_1.$Fr)
    ], $Khb);
    let $Lhb = class $Lhb extends $phb {
        static { $Lhb_1 = this; }
        static { this.ID = 'workbench.extensions.action.install.anotherVersion'; }
        static { this.LABEL = (0, nls_1.localize)(55, null); }
        constructor(f, g, s, t, J) {
            super($Lhb_1.ID, $Lhb_1.LABEL, $phb.LABEL_ACTION_CLASS);
            this.f = f;
            this.g = g;
            this.s = s;
            this.t = t;
            this.J = J;
            this.update();
        }
        update() {
            this.enabled = !!this.extension && !this.extension.isBuiltin && !!this.extension.gallery && !!this.extension.local && !!this.extension.server && this.extension.state === 1 /* ExtensionState.Installed */ && !this.extension.deprecationInfo;
        }
        async run() {
            if (!this.enabled) {
                return;
            }
            const targetPlatform = await this.extension.server.extensionManagementService.getTargetPlatform();
            const allVersions = await this.g.getAllCompatibleVersions(this.extension.gallery, this.extension.local.preRelease, targetPlatform);
            if (!allVersions.length) {
                await this.J.info((0, nls_1.localize)(56, null));
                return;
            }
            const picks = allVersions.map((v, i) => {
                return {
                    id: v.version,
                    label: v.version,
                    description: `${(0, date_1.$6l)(new Date(Date.parse(v.date)), true)}${v.isPreReleaseVersion ? ` (${(0, nls_1.localize)(57, null)})` : ''}${v.version === this.extension.version ? ` (${(0, nls_1.localize)(58, null)})` : ''}`,
                    latest: i === 0,
                    ariaLabel: `${v.isPreReleaseVersion ? 'Pre-Release version' : 'Release version'} ${v.version}`,
                    isPreReleaseVersion: v.isPreReleaseVersion
                };
            });
            const pick = await this.s.pick(picks, {
                placeHolder: (0, nls_1.localize)(59, null),
                matchOnDetail: true
            });
            if (pick) {
                if (this.extension.version === pick.id) {
                    return;
                }
                try {
                    if (pick.latest) {
                        await this.f.install(this.extension, { installPreReleaseVersion: pick.isPreReleaseVersion });
                    }
                    else {
                        await this.f.installVersion(this.extension, pick.id, { installPreReleaseVersion: pick.isPreReleaseVersion });
                    }
                }
                catch (error) {
                    this.t.createInstance($ohb, this.extension, pick.latest ? this.extension.latestVersion : pick.id, 2 /* InstallOperation.Install */, error).run();
                }
            }
            return null;
        }
    };
    exports.$Lhb = $Lhb;
    exports.$Lhb = $Lhb = $Lhb_1 = __decorate([
        __param(0, extensions_1.$Pfb),
        __param(1, extensionManagement_1.$Zn),
        __param(2, quickInput_1.$Gq),
        __param(3, instantiation_1.$Ah),
        __param(4, dialogs_1.$oA)
    ], $Lhb);
    let $Mhb = class $Mhb extends $phb {
        static { $Mhb_1 = this; }
        static { this.ID = 'extensions.enableForWorkspace'; }
        static { this.LABEL = (0, nls_1.localize)(60, null); }
        constructor(f, g) {
            super($Mhb_1.ID, $Mhb_1.LABEL, $phb.LABEL_ACTION_CLASS);
            this.f = f;
            this.g = g;
            this.tooltip = (0, nls_1.localize)(61, null);
            this.update();
        }
        update() {
            this.enabled = false;
            if (this.extension && this.extension.local) {
                this.enabled = this.extension.state === 1 /* ExtensionState.Installed */
                    && !this.g.isEnabled(this.extension.local)
                    && this.g.canChangeWorkspaceEnablement(this.extension.local);
            }
        }
        async run() {
            if (!this.extension) {
                return;
            }
            return this.f.setEnablement(this.extension, 9 /* EnablementState.EnabledWorkspace */);
        }
    };
    exports.$Mhb = $Mhb;
    exports.$Mhb = $Mhb = $Mhb_1 = __decorate([
        __param(0, extensions_1.$Pfb),
        __param(1, extensionManagement_2.$icb)
    ], $Mhb);
    let $Nhb = class $Nhb extends $phb {
        static { $Nhb_1 = this; }
        static { this.ID = 'extensions.enableGlobally'; }
        static { this.LABEL = (0, nls_1.localize)(62, null); }
        constructor(f, g) {
            super($Nhb_1.ID, $Nhb_1.LABEL, $phb.LABEL_ACTION_CLASS);
            this.f = f;
            this.g = g;
            this.tooltip = (0, nls_1.localize)(63, null);
            this.update();
        }
        update() {
            this.enabled = false;
            if (this.extension && this.extension.local) {
                this.enabled = this.extension.state === 1 /* ExtensionState.Installed */
                    && this.g.isDisabledGlobally(this.extension.local)
                    && this.g.canChangeEnablement(this.extension.local);
            }
        }
        async run() {
            if (!this.extension) {
                return;
            }
            return this.f.setEnablement(this.extension, 8 /* EnablementState.EnabledGlobally */);
        }
    };
    exports.$Nhb = $Nhb;
    exports.$Nhb = $Nhb = $Nhb_1 = __decorate([
        __param(0, extensions_1.$Pfb),
        __param(1, extensionManagement_2.$icb)
    ], $Nhb);
    let $Ohb = class $Ohb extends $phb {
        static { $Ohb_1 = this; }
        static { this.ID = 'extensions.disableForWorkspace'; }
        static { this.LABEL = (0, nls_1.localize)(64, null); }
        constructor(f, g, s, t) {
            super($Ohb_1.ID, $Ohb_1.LABEL, $phb.LABEL_ACTION_CLASS);
            this.f = f;
            this.g = g;
            this.s = s;
            this.t = t;
            this.tooltip = (0, nls_1.localize)(65, null);
            this.update();
            this.B(this.t.onDidChangeExtensions(() => this.update()));
        }
        update() {
            this.enabled = false;
            if (this.extension && this.extension.local && this.t.extensions.some(e => (0, extensionManagementUtil_1.$po)({ id: e.identifier.value, uuid: e.uuid }, this.extension.identifier) && this.f.getWorkbenchState() !== 1 /* WorkbenchState.EMPTY */)) {
                this.enabled = this.extension.state === 1 /* ExtensionState.Installed */
                    && (this.extension.enablementState === 8 /* EnablementState.EnabledGlobally */ || this.extension.enablementState === 9 /* EnablementState.EnabledWorkspace */)
                    && this.s.canChangeWorkspaceEnablement(this.extension.local);
            }
        }
        async run() {
            if (!this.extension) {
                return;
            }
            return this.g.setEnablement(this.extension, 7 /* EnablementState.DisabledWorkspace */);
        }
    };
    exports.$Ohb = $Ohb;
    exports.$Ohb = $Ohb = $Ohb_1 = __decorate([
        __param(0, workspace_1.$Kh),
        __param(1, extensions_1.$Pfb),
        __param(2, extensionManagement_2.$icb),
        __param(3, extensions_3.$MF)
    ], $Ohb);
    let $Phb = class $Phb extends $phb {
        static { $Phb_1 = this; }
        static { this.ID = 'extensions.disableGlobally'; }
        static { this.LABEL = (0, nls_1.localize)(66, null); }
        constructor(f, g, s) {
            super($Phb_1.ID, $Phb_1.LABEL, $phb.LABEL_ACTION_CLASS);
            this.f = f;
            this.g = g;
            this.s = s;
            this.tooltip = (0, nls_1.localize)(67, null);
            this.update();
            this.B(this.s.onDidChangeExtensions(() => this.update()));
        }
        update() {
            this.enabled = false;
            if (this.extension && this.extension.local && this.s.extensions.some(e => (0, extensionManagementUtil_1.$po)({ id: e.identifier.value, uuid: e.uuid }, this.extension.identifier))) {
                this.enabled = this.extension.state === 1 /* ExtensionState.Installed */
                    && (this.extension.enablementState === 8 /* EnablementState.EnabledGlobally */ || this.extension.enablementState === 9 /* EnablementState.EnabledWorkspace */)
                    && this.g.canChangeEnablement(this.extension.local);
            }
        }
        async run() {
            if (!this.extension) {
                return;
            }
            return this.f.setEnablement(this.extension, 6 /* EnablementState.DisabledGlobally */);
        }
    };
    exports.$Phb = $Phb;
    exports.$Phb = $Phb = $Phb_1 = __decorate([
        __param(0, extensions_1.$Pfb),
        __param(1, extensionManagement_2.$icb),
        __param(2, extensions_3.$MF)
    ], $Phb);
    let $Qhb = class $Qhb extends $qhb {
        constructor(instantiationService) {
            super('extensions.enable', (0, nls_1.localize)(68, null), [
                [
                    instantiationService.createInstance($Nhb),
                    instantiationService.createInstance($Mhb)
                ]
            ]);
        }
    };
    exports.$Qhb = $Qhb;
    exports.$Qhb = $Qhb = __decorate([
        __param(0, instantiation_1.$Ah)
    ], $Qhb);
    let $Rhb = class $Rhb extends $qhb {
        constructor(instantiationService) {
            super('extensions.disable', (0, nls_1.localize)(69, null), [[
                    instantiationService.createInstance($Phb),
                    instantiationService.createInstance($Ohb)
                ]]);
        }
    };
    exports.$Rhb = $Rhb;
    exports.$Rhb = $Rhb = __decorate([
        __param(0, instantiation_1.$Ah)
    ], $Rhb);
    let $Shb = class $Shb extends $phb {
        static { $Shb_1 = this; }
        static { this.f = `${$phb.LABEL_ACTION_CLASS} reload`; }
        static { this.g = `${$Shb_1.f} disabled`; }
        constructor(s, t) {
            super('extensions.reload', (0, nls_1.localize)(70, null), $Shb_1.g, false);
            this.s = s;
            this.t = t;
            this.updateWhenCounterExtensionChanges = true;
            this.B(this.t.onDidChangeExtensions(() => this.update()));
            this.update();
        }
        update() {
            this.enabled = false;
            this.tooltip = '';
            if (!this.extension) {
                return;
            }
            const state = this.extension.state;
            if (state === 0 /* ExtensionState.Installing */ || state === 2 /* ExtensionState.Uninstalling */) {
                return;
            }
            if (this.extension.local && this.extension.local.manifest && this.extension.local.manifest.contributes && this.extension.local.manifest.contributes.localizations && this.extension.local.manifest.contributes.localizations.length > 0) {
                return;
            }
            const reloadTooltip = this.extension.reloadRequiredStatus;
            this.enabled = reloadTooltip !== undefined;
            this.label = reloadTooltip !== undefined ? (0, nls_1.localize)(71, null) : '';
            this.tooltip = reloadTooltip !== undefined ? reloadTooltip : '';
            this.class = this.enabled ? $Shb_1.f : $Shb_1.g;
        }
        run() {
            return Promise.resolve(this.s.reload());
        }
    };
    exports.$Shb = $Shb;
    exports.$Shb = $Shb = $Shb_1 = __decorate([
        __param(0, host_1.$VT),
        __param(1, extensions_3.$MF)
    ], $Shb);
    function isThemeFromExtension(theme, extension) {
        return !!(extension && theme.extensionData && extensions_2.$Vl.equals(theme.extensionData.extensionId, extension.identifier.id));
    }
    function getQuickPickEntries(themes, currentTheme, extension, showCurrentTheme) {
        const picks = [];
        for (const theme of themes) {
            if (isThemeFromExtension(theme, extension) && !(showCurrentTheme && theme === currentTheme)) {
                picks.push({ label: theme.label, id: theme.id });
            }
        }
        if (showCurrentTheme) {
            picks.push({ type: 'separator', label: (0, nls_1.localize)(72, null) });
            picks.push({ label: currentTheme.label, id: currentTheme.id });
        }
        return picks;
    }
    let $Thb = class $Thb extends $phb {
        static { $Thb_1 = this; }
        static { this.ID = 'workbench.extensions.action.setColorTheme'; }
        static { this.TITLE = { value: (0, nls_1.localize)(73, null), original: 'Set Color Theme' }; }
        static { this.f = `${$phb.LABEL_ACTION_CLASS} theme`; }
        static { this.g = `${$Thb_1.f} disabled`; }
        constructor(extensionService, s, t, J) {
            super($Thb_1.ID, $Thb_1.TITLE.value, $Thb_1.g, false);
            this.s = s;
            this.t = t;
            this.J = J;
            this.B(event_1.Event.any(extensionService.onDidChangeExtensions, s.onDidColorThemeChange)(() => this.update(), this));
            this.update();
        }
        update() {
            this.s.getColorThemes().then(colorThemes => {
                this.enabled = this.L(colorThemes);
                this.class = this.enabled ? $Thb_1.f : $Thb_1.g;
            });
        }
        L(colorThemes) {
            return !!this.extension && this.extension.state === 1 /* ExtensionState.Installed */ && this.J.isEnabledEnablementState(this.extension.enablementState) && colorThemes.some(th => isThemeFromExtension(th, this.extension));
        }
        async run({ showCurrentTheme, ignoreFocusLost } = { showCurrentTheme: false, ignoreFocusLost: false }) {
            const colorThemes = await this.s.getColorThemes();
            if (!this.L(colorThemes)) {
                return;
            }
            const currentTheme = this.s.getColorTheme();
            const delayer = new async_1.$Dg(100);
            const picks = getQuickPickEntries(colorThemes, currentTheme, this.extension, showCurrentTheme);
            const pickedTheme = await this.t.pick(picks, {
                placeHolder: (0, nls_1.localize)(74, null),
                onDidFocus: item => delayer.trigger(() => this.s.setColorTheme(item.id, undefined)),
                ignoreFocusLost
            });
            return this.s.setColorTheme(pickedTheme ? pickedTheme.id : currentTheme.id, 'auto');
        }
    };
    exports.$Thb = $Thb;
    exports.$Thb = $Thb = $Thb_1 = __decorate([
        __param(0, extensions_3.$MF),
        __param(1, workbenchThemeService_1.$egb),
        __param(2, quickInput_1.$Gq),
        __param(3, extensionManagement_2.$icb)
    ], $Thb);
    let $Uhb = class $Uhb extends $phb {
        static { $Uhb_1 = this; }
        static { this.ID = 'workbench.extensions.action.setFileIconTheme'; }
        static { this.TITLE = { value: (0, nls_1.localize)(75, null), original: 'Set File Icon Theme' }; }
        static { this.f = `${$phb.LABEL_ACTION_CLASS} theme`; }
        static { this.g = `${$Uhb_1.f} disabled`; }
        constructor(extensionService, s, t, J) {
            super($Uhb_1.ID, $Uhb_1.TITLE.value, $Uhb_1.g, false);
            this.s = s;
            this.t = t;
            this.J = J;
            this.B(event_1.Event.any(extensionService.onDidChangeExtensions, s.onDidFileIconThemeChange)(() => this.update(), this));
            this.update();
        }
        update() {
            this.s.getFileIconThemes().then(fileIconThemes => {
                this.enabled = this.L(fileIconThemes);
                this.class = this.enabled ? $Uhb_1.f : $Uhb_1.g;
            });
        }
        L(colorThemfileIconThemess) {
            return !!this.extension && this.extension.state === 1 /* ExtensionState.Installed */ && this.J.isEnabledEnablementState(this.extension.enablementState) && colorThemfileIconThemess.some(th => isThemeFromExtension(th, this.extension));
        }
        async run({ showCurrentTheme, ignoreFocusLost } = { showCurrentTheme: false, ignoreFocusLost: false }) {
            const fileIconThemes = await this.s.getFileIconThemes();
            if (!this.L(fileIconThemes)) {
                return;
            }
            const currentTheme = this.s.getFileIconTheme();
            const delayer = new async_1.$Dg(100);
            const picks = getQuickPickEntries(fileIconThemes, currentTheme, this.extension, showCurrentTheme);
            const pickedTheme = await this.t.pick(picks, {
                placeHolder: (0, nls_1.localize)(76, null),
                onDidFocus: item => delayer.trigger(() => this.s.setFileIconTheme(item.id, undefined)),
                ignoreFocusLost
            });
            return this.s.setFileIconTheme(pickedTheme ? pickedTheme.id : currentTheme.id, 'auto');
        }
    };
    exports.$Uhb = $Uhb;
    exports.$Uhb = $Uhb = $Uhb_1 = __decorate([
        __param(0, extensions_3.$MF),
        __param(1, workbenchThemeService_1.$egb),
        __param(2, quickInput_1.$Gq),
        __param(3, extensionManagement_2.$icb)
    ], $Uhb);
    let $Vhb = class $Vhb extends $phb {
        static { $Vhb_1 = this; }
        static { this.ID = 'workbench.extensions.action.setProductIconTheme'; }
        static { this.TITLE = { value: (0, nls_1.localize)(77, null), original: 'Set Product Icon Theme' }; }
        static { this.f = `${$phb.LABEL_ACTION_CLASS} theme`; }
        static { this.g = `${$Vhb_1.f} disabled`; }
        constructor(extensionService, s, t, J) {
            super($Vhb_1.ID, $Vhb_1.TITLE.value, $Vhb_1.g, false);
            this.s = s;
            this.t = t;
            this.J = J;
            this.B(event_1.Event.any(extensionService.onDidChangeExtensions, s.onDidProductIconThemeChange)(() => this.update(), this));
            this.update();
        }
        update() {
            this.s.getProductIconThemes().then(productIconThemes => {
                this.enabled = this.L(productIconThemes);
                this.class = this.enabled ? $Vhb_1.f : $Vhb_1.g;
            });
        }
        L(productIconThemes) {
            return !!this.extension && this.extension.state === 1 /* ExtensionState.Installed */ && this.J.isEnabledEnablementState(this.extension.enablementState) && productIconThemes.some(th => isThemeFromExtension(th, this.extension));
        }
        async run({ showCurrentTheme, ignoreFocusLost } = { showCurrentTheme: false, ignoreFocusLost: false }) {
            const productIconThemes = await this.s.getProductIconThemes();
            if (!this.L(productIconThemes)) {
                return;
            }
            const currentTheme = this.s.getProductIconTheme();
            const delayer = new async_1.$Dg(100);
            const picks = getQuickPickEntries(productIconThemes, currentTheme, this.extension, showCurrentTheme);
            const pickedTheme = await this.t.pick(picks, {
                placeHolder: (0, nls_1.localize)(78, null),
                onDidFocus: item => delayer.trigger(() => this.s.setProductIconTheme(item.id, undefined)),
                ignoreFocusLost
            });
            return this.s.setProductIconTheme(pickedTheme ? pickedTheme.id : currentTheme.id, 'auto');
        }
    };
    exports.$Vhb = $Vhb;
    exports.$Vhb = $Vhb = $Vhb_1 = __decorate([
        __param(0, extensions_3.$MF),
        __param(1, workbenchThemeService_1.$egb),
        __param(2, quickInput_1.$Gq),
        __param(3, extensionManagement_2.$icb)
    ], $Vhb);
    let $Whb = class $Whb extends $phb {
        static { $Whb_1 = this; }
        static { this.ID = 'workbench.extensions.action.setDisplayLanguage'; }
        static { this.TITLE = { value: (0, nls_1.localize)(79, null), original: 'Set Display Language' }; }
        static { this.f = `${$phb.LABEL_ACTION_CLASS} language`; }
        static { this.g = `${$Whb_1.f} disabled`; }
        constructor(s) {
            super($Whb_1.ID, $Whb_1.TITLE.value, $Whb_1.g, false);
            this.s = s;
            this.update();
        }
        update() {
            this.enabled = false;
            this.class = $Whb_1.g;
            if (!this.extension) {
                return;
            }
            if (!this.s.canSetLanguage(this.extension)) {
                return;
            }
            if (this.extension.gallery && platform_1.$v === (0, languagePacks_1.$Hq)(this.extension.gallery)) {
                return;
            }
            this.enabled = true;
            this.class = $Whb_1.f;
        }
        async run() {
            return this.extension && this.s.setLanguage(this.extension);
        }
    };
    exports.$Whb = $Whb;
    exports.$Whb = $Whb = $Whb_1 = __decorate([
        __param(0, extensions_1.$Pfb)
    ], $Whb);
    let $Xhb = class $Xhb extends $phb {
        static { $Xhb_1 = this; }
        static { this.ID = 'workbench.extensions.action.clearLanguage'; }
        static { this.TITLE = { value: (0, nls_1.localize)(80, null), original: 'Clear Display Language' }; }
        static { this.f = `${$phb.LABEL_ACTION_CLASS} language`; }
        static { this.g = `${$Xhb_1.f} disabled`; }
        constructor(s, t) {
            super($Xhb_1.ID, $Xhb_1.TITLE.value, $Xhb_1.g, false);
            this.s = s;
            this.t = t;
            this.update();
        }
        update() {
            this.enabled = false;
            this.class = $Xhb_1.g;
            if (!this.extension) {
                return;
            }
            if (!this.s.canSetLanguage(this.extension)) {
                return;
            }
            if (this.extension.gallery && platform_1.$v !== (0, languagePacks_1.$Hq)(this.extension.gallery)) {
                return;
            }
            this.enabled = true;
            this.class = $Xhb_1.f;
        }
        async run() {
            return this.extension && this.t.clearLocalePreference();
        }
    };
    exports.$Xhb = $Xhb;
    exports.$Xhb = $Xhb = $Xhb_1 = __decorate([
        __param(0, extensions_1.$Pfb),
        __param(1, locale_1.$khb)
    ], $Xhb);
    let $Yhb = class $Yhb extends actions_1.$gi {
        static { $Yhb_1 = this; }
        static { this.ID = 'workbench.extensions.action.showRecommendedExtension'; }
        static { this.LABEL = (0, nls_1.localize)(81, null); }
        constructor(extensionId, f, g) {
            super($Yhb_1.ID, $Yhb_1.LABEL, undefined, false);
            this.f = f;
            this.g = g;
            this.b = extensionId;
        }
        async run() {
            const paneComposite = await this.f.openPaneComposite(extensions_1.$Ofb, 0 /* ViewContainerLocation.Sidebar */, true);
            const paneContainer = paneComposite?.getViewPaneContainer();
            paneContainer.search(`@id:${this.b}`);
            paneContainer.focus();
            const [extension] = await this.g.getExtensions([{ id: this.b }], { source: 'install-recommendation' }, cancellation_1.CancellationToken.None);
            if (extension) {
                return this.g.open(extension);
            }
            return null;
        }
    };
    exports.$Yhb = $Yhb;
    exports.$Yhb = $Yhb = $Yhb_1 = __decorate([
        __param(1, panecomposite_1.$Yeb),
        __param(2, extensions_1.$Pfb)
    ], $Yhb);
    let $Zhb = class $Zhb extends actions_1.$gi {
        static { $Zhb_1 = this; }
        static { this.ID = 'workbench.extensions.action.installRecommendedExtension'; }
        static { this.LABEL = (0, nls_1.localize)(82, null); }
        constructor(extensionId, f, g, s) {
            super($Zhb_1.ID, $Zhb_1.LABEL, undefined, false);
            this.f = f;
            this.g = g;
            this.s = s;
            this.b = extensionId;
        }
        async run() {
            const viewlet = await this.f.openPaneComposite(extensions_1.$Ofb, 0 /* ViewContainerLocation.Sidebar */, true);
            const viewPaneContainer = viewlet?.getViewPaneContainer();
            viewPaneContainer.search(`@id:${this.b}`);
            viewPaneContainer.focus();
            const [extension] = await this.s.getExtensions([{ id: this.b }], { source: 'install-recommendation' }, cancellation_1.CancellationToken.None);
            if (extension) {
                await this.s.open(extension);
                try {
                    await this.s.install(extension);
                }
                catch (err) {
                    this.g.createInstance($ohb, extension, extension.latestVersion, 2 /* InstallOperation.Install */, err).run();
                }
            }
        }
    };
    exports.$Zhb = $Zhb;
    exports.$Zhb = $Zhb = $Zhb_1 = __decorate([
        __param(1, panecomposite_1.$Yeb),
        __param(2, instantiation_1.$Ah),
        __param(3, extensions_1.$Pfb)
    ], $Zhb);
    let $1hb = class $1hb extends actions_1.$gi {
        static { $1hb_1 = this; }
        static { this.ID = 'extensions.ignore'; }
        static { this.b = `${$phb.LABEL_ACTION_CLASS} ignore`; }
        constructor(f, g) {
            super($1hb_1.ID, 'Ignore Recommendation');
            this.f = f;
            this.g = g;
            this.class = $1hb_1.b;
            this.tooltip = (0, nls_1.localize)(83, null);
            this.enabled = true;
        }
        run() {
            this.g.toggleGlobalIgnoredRecommendation(this.f.identifier.id, true);
            return Promise.resolve();
        }
    };
    exports.$1hb = $1hb;
    exports.$1hb = $1hb = $1hb_1 = __decorate([
        __param(1, extensionRecommendations_1.$0fb)
    ], $1hb);
    let $2hb = class $2hb extends actions_1.$gi {
        static { $2hb_1 = this; }
        static { this.ID = 'extensions.ignore'; }
        static { this.b = `${$phb.LABEL_ACTION_CLASS} undo-ignore`; }
        constructor(f, g) {
            super($2hb_1.ID, 'Undo');
            this.f = f;
            this.g = g;
            this.class = $2hb_1.b;
            this.tooltip = (0, nls_1.localize)(84, null);
            this.enabled = true;
        }
        run() {
            this.g.toggleGlobalIgnoredRecommendation(this.f.identifier.id, false);
            return Promise.resolve();
        }
    };
    exports.$2hb = $2hb;
    exports.$2hb = $2hb = $2hb_1 = __decorate([
        __param(1, extensionRecommendations_1.$0fb)
    ], $2hb);
    let $3hb = class $3hb extends actions_1.$gi {
        constructor(b, f) {
            super('extensions.searchExtensions', (0, nls_1.localize)(85, null), undefined, true);
            this.b = b;
            this.f = f;
        }
        async run() {
            const viewPaneContainer = (await this.f.openPaneComposite(extensions_1.$Ofb, 0 /* ViewContainerLocation.Sidebar */, true))?.getViewPaneContainer();
            viewPaneContainer.search(this.b);
            viewPaneContainer.focus();
        }
    };
    exports.$3hb = $3hb;
    exports.$3hb = $3hb = __decorate([
        __param(1, panecomposite_1.$Yeb)
    ], $3hb);
    let $4hb = class $4hb extends actions_1.$gi {
        constructor(id, label, b, f, g, s, t, J) {
            super(id, label);
            this.b = b;
            this.f = f;
            this.g = g;
            this.s = s;
            this.t = t;
            this.J = J;
        }
        L(extensionsFileResource) {
            return this.P(extensionsFileResource)
                .then(({ created, content }) => this.O(content, extensionsFileResource, ['recommendations'])
                .then(selection => this.s.openEditor({
                resource: extensionsFileResource,
                options: {
                    pinned: created,
                    selection
                }
            })), error => Promise.reject(new Error((0, nls_1.localize)(86, null, error))));
        }
        M(workspaceConfigurationFile) {
            return this.N(workspaceConfigurationFile)
                .then(content => this.O(content.value.toString(), content.resource, ['extensions', 'recommendations']))
                .then(selection => this.s.openEditor({
                resource: workspaceConfigurationFile,
                options: {
                    selection,
                    forceReload: true // because content has changed
                }
            }));
        }
        N(workspaceConfigurationFile) {
            return Promise.resolve(this.f.readFile(workspaceConfigurationFile))
                .then(content => {
                const workspaceRecommendations = json.$Lm(content.value.toString())['extensions'];
                if (!workspaceRecommendations || !workspaceRecommendations.recommendations) {
                    return this.t.write(workspaceConfigurationFile, [{ path: ['extensions'], value: { recommendations: [] } }], true)
                        .then(() => this.f.readFile(workspaceConfigurationFile));
                }
                return content;
            });
        }
        O(content, resource, path) {
            const tree = json.$Mm(content);
            const node = json.$Nm(tree, path);
            if (node && node.parent && node.parent.children) {
                const recommendationsValueNode = node.parent.children[1];
                const lastExtensionNode = recommendationsValueNode.children && recommendationsValueNode.children.length ? recommendationsValueNode.children[recommendationsValueNode.children.length - 1] : null;
                const offset = lastExtensionNode ? lastExtensionNode.offset + lastExtensionNode.length : recommendationsValueNode.offset + 1;
                return Promise.resolve(this.J.createModelReference(resource))
                    .then(reference => {
                    const position = reference.object.textEditorModel.getPositionAt(offset);
                    reference.dispose();
                    return {
                        startLineNumber: position.lineNumber,
                        startColumn: position.column,
                        endLineNumber: position.lineNumber,
                        endColumn: position.column,
                    };
                });
            }
            return Promise.resolve(undefined);
        }
        P(extensionsFileResource) {
            return Promise.resolve(this.f.readFile(extensionsFileResource)).then(content => {
                return { created: false, extensionsFileResource, content: content.value.toString() };
            }, err => {
                return this.g.write(extensionsFileResource, extensionsFileTemplate_1.$8fb).then(() => {
                    return { created: true, extensionsFileResource, content: extensionsFileTemplate_1.$8fb };
                });
            });
        }
    };
    exports.$4hb = $4hb;
    exports.$4hb = $4hb = __decorate([
        __param(2, workspace_1.$Kh),
        __param(3, files_1.$6j),
        __param(4, textfiles_1.$JD),
        __param(5, editorService_1.$9C),
        __param(6, jsonEditing_1.$$fb),
        __param(7, resolverService_1.$uA)
    ], $4hb);
    let $5hb = class $5hb extends $4hb {
        static { this.ID = 'workbench.extensions.action.configureWorkspaceRecommendedExtensions'; }
        static { this.LABEL = (0, nls_1.localize)(87, null); }
        constructor(id, label, fileService, textFileService, contextService, editorService, jsonEditingService, textModelResolverService) {
            super(id, label, contextService, fileService, textFileService, editorService, jsonEditingService, textModelResolverService);
            this.B(this.b.onDidChangeWorkbenchState(() => this.Q(), this));
            this.Q();
        }
        Q() {
            this.enabled = this.b.getWorkbenchState() !== 1 /* WorkbenchState.EMPTY */;
        }
        run() {
            switch (this.b.getWorkbenchState()) {
                case 2 /* WorkbenchState.FOLDER */:
                    return this.L(this.b.getWorkspace().folders[0].toResource(workspaceExtensionsConfig_1.$pgb));
                case 3 /* WorkbenchState.WORKSPACE */:
                    return this.M(this.b.getWorkspace().configuration);
            }
            return Promise.resolve();
        }
    };
    exports.$5hb = $5hb;
    exports.$5hb = $5hb = __decorate([
        __param(2, files_1.$6j),
        __param(3, textfiles_1.$JD),
        __param(4, workspace_1.$Kh),
        __param(5, editorService_1.$9C),
        __param(6, jsonEditing_1.$$fb),
        __param(7, resolverService_1.$uA)
    ], $5hb);
    let $6hb = class $6hb extends $4hb {
        static { this.ID = 'workbench.extensions.action.configureWorkspaceFolderRecommendedExtensions'; }
        static { this.LABEL = (0, nls_1.localize)(88, null); }
        constructor(id, label, fileService, textFileService, contextService, editorService, jsonEditingService, textModelResolverService, Q) {
            super(id, label, contextService, fileService, textFileService, editorService, jsonEditingService, textModelResolverService);
            this.Q = Q;
        }
        run() {
            const folderCount = this.b.getWorkspace().folders.length;
            const pickFolderPromise = folderCount === 1 ? Promise.resolve(this.b.getWorkspace().folders[0]) : this.Q.executeCommand(workspaceCommands_1.$dgb);
            return Promise.resolve(pickFolderPromise)
                .then(workspaceFolder => {
                if (workspaceFolder) {
                    return this.L(workspaceFolder.toResource(workspaceExtensionsConfig_1.$pgb));
                }
                return null;
            });
        }
    };
    exports.$6hb = $6hb;
    exports.$6hb = $6hb = __decorate([
        __param(2, files_1.$6j),
        __param(3, textfiles_1.$JD),
        __param(4, workspace_1.$Kh),
        __param(5, editorService_1.$9C),
        __param(6, jsonEditing_1.$$fb),
        __param(7, resolverService_1.$uA),
        __param(8, commands_1.$Fr)
    ], $6hb);
    let $7hb = class $7hb extends actions_1.$gi {
        static { $7hb_1 = this; }
        static { this.b = `${$phb.TEXT_ACTION_CLASS} extension-status-label`; }
        static { this.f = `${$7hb_1.b} hide`; }
        get extension() { return this.L; }
        set extension(extension) {
            if (!(this.L && extension && (0, extensionManagementUtil_1.$po)(this.L.identifier, extension.identifier))) {
                // Different extension. Reset
                this.g = null;
                this.s = null;
                this.J = null;
            }
            this.L = extension;
            this.update();
        }
        constructor(M, N, O) {
            super('extensions.action.statusLabel', '', $7hb_1.f, false);
            this.M = M;
            this.N = N;
            this.O = O;
            this.g = null;
            this.s = null;
            this.t = null;
            this.J = null;
            this.L = null;
        }
        update() {
            const label = this.P();
            this.label = label || '';
            this.class = label ? $7hb_1.b : $7hb_1.f;
        }
        P() {
            if (!this.extension) {
                return null;
            }
            const currentStatus = this.s;
            const currentVersion = this.t;
            const currentEnablementState = this.J;
            this.s = this.extension.state;
            this.t = this.extension.version;
            if (this.g === null) {
                this.g = this.s;
            }
            this.J = this.extension.enablementState;
            const canAddExtension = () => {
                const runningExtension = this.M.extensions.filter(e => (0, extensionManagementUtil_1.$po)({ id: e.identifier.value, uuid: e.uuid }, this.extension.identifier))[0];
                if (this.extension.local) {
                    if (runningExtension && this.extension.version === runningExtension.version) {
                        return true;
                    }
                    return this.M.canAddExtension((0, extensions_3.$UF)(this.extension.local));
                }
                return false;
            };
            const canRemoveExtension = () => {
                if (this.extension.local) {
                    if (this.M.extensions.every(e => !((0, extensionManagementUtil_1.$po)({ id: e.identifier.value, uuid: e.uuid }, this.extension.identifier) && this.extension.server === this.N.getExtensionManagementServer((0, extensions_3.$TF)(e))))) {
                        return true;
                    }
                    return this.M.canRemoveExtension((0, extensions_3.$UF)(this.extension.local));
                }
                return false;
            };
            if (currentStatus !== null) {
                if (currentStatus === 0 /* ExtensionState.Installing */ && this.s === 1 /* ExtensionState.Installed */) {
                    return canAddExtension() ? this.g === 1 /* ExtensionState.Installed */ && this.t !== currentVersion ? (0, nls_1.localize)(89, null) : (0, nls_1.localize)(90, null) : null;
                }
                if (currentStatus === 2 /* ExtensionState.Uninstalling */ && this.s === 3 /* ExtensionState.Uninstalled */) {
                    this.g = this.s;
                    return canRemoveExtension() ? (0, nls_1.localize)(91, null) : null;
                }
            }
            if (currentEnablementState !== null) {
                const currentlyEnabled = this.O.isEnabledEnablementState(currentEnablementState);
                const enabled = this.O.isEnabledEnablementState(this.J);
                if (!currentlyEnabled && enabled) {
                    return canAddExtension() ? (0, nls_1.localize)(92, null) : null;
                }
                if (currentlyEnabled && !enabled) {
                    return canRemoveExtension() ? (0, nls_1.localize)(93, null) : null;
                }
            }
            return null;
        }
        run() {
            return Promise.resolve();
        }
    };
    exports.$7hb = $7hb;
    exports.$7hb = $7hb = $7hb_1 = __decorate([
        __param(0, extensions_3.$MF),
        __param(1, extensionManagement_2.$fcb),
        __param(2, extensionManagement_2.$icb)
    ], $7hb);
    let $8hb = class $8hb extends $Dhb {
        static { $8hb_1 = this; }
        static { this.s = `${$phb.ICON_ACTION_CLASS} extension-sync ${themables_1.ThemeIcon.asClassName(extensionsIcons_1.$8gb)}`; }
        static { this.t = `${$8hb_1.ICON_ACTION_CLASS} extension-sync ${themables_1.ThemeIcon.asClassName(extensionsIcons_1.$7gb)}`; }
        constructor(J, L, M, instantiationService) {
            super('extensions.sync', '', $8hb_1.t, false, instantiationService);
            this.J = J;
            this.L = L;
            this.M = M;
            this.B(event_1.Event.filter(this.J.onDidChangeConfiguration, e => e.affectsConfiguration('settingsSync.ignoredExtensions'))(() => this.update()));
            this.B(M.onDidChangeEnablement(() => this.update()));
            this.update();
        }
        update() {
            this.enabled = !!this.extension && this.M.isEnabled() && this.extension.state === 1 /* ExtensionState.Installed */;
            if (this.extension) {
                const isIgnored = this.L.isExtensionIgnoredToSync(this.extension);
                this.class = isIgnored ? $8hb_1.s : $8hb_1.t;
                this.tooltip = isIgnored ? (0, nls_1.localize)(94, null) : (0, nls_1.localize)(95, null);
            }
        }
        async run() {
            return super.run({
                actionGroups: [
                    [
                        new actions_1.$gi('extensions.syncignore', this.L.isExtensionIgnoredToSync(this.extension) ? (0, nls_1.localize)(96, null) : (0, nls_1.localize)(97, null), undefined, true, () => this.L.toggleExtensionIgnoredToSync(this.extension))
                    ]
                ], disposeActionsOnHide: true
            });
        }
    };
    exports.$8hb = $8hb;
    exports.$8hb = $8hb = $8hb_1 = __decorate([
        __param(0, configuration_1.$8h),
        __param(1, extensions_1.$Pfb),
        __param(2, userDataSync_1.$Pgb),
        __param(3, instantiation_1.$Ah)
    ], $8hb);
    let $9hb = class $9hb extends $phb {
        static { $9hb_1 = this; }
        static { this.f = `${$phb.ICON_ACTION_CLASS} extension-status`; }
        get status() { return this.g; }
        constructor(J, L, M, N, O, P, Q, R, S, U, W) {
            super('extensions.status', '', `${$9hb_1.f} hide`, false);
            this.J = J;
            this.L = L;
            this.M = M;
            this.N = N;
            this.O = O;
            this.P = P;
            this.Q = Q;
            this.R = R;
            this.S = S;
            this.U = U;
            this.W = W;
            this.updateWhenCounterExtensionChanges = true;
            this.s = this.B(new event_1.$fd());
            this.onDidChangeStatus = this.s.event;
            this.t = new async_1.$Ag();
            this.B(this.L.onDidChangeFormatters(() => this.update(), this));
            this.B(this.Q.onDidChangeExtensions(() => this.update()));
            this.update();
        }
        update() {
            this.t.queue(() => this.X());
        }
        async X() {
            this.Y(undefined, true);
            this.enabled = false;
            if (!this.extension) {
                return;
            }
            if (this.extension.isMalicious) {
                this.Y({ icon: extensionsIcons_1.$ghb, message: new htmlContent_1.$Xj((0, nls_1.localize)(98, null)) }, true);
                return;
            }
            if (this.extension.deprecationInfo) {
                if (this.extension.deprecationInfo.extension) {
                    const link = `[${this.extension.deprecationInfo.extension.displayName}](${uri_1.URI.parse(`command:extension.open?${encodeURIComponent(JSON.stringify([this.extension.deprecationInfo.extension.id]))}`)})`;
                    this.Y({ icon: extensionsIcons_1.$ghb, message: new htmlContent_1.$Xj((0, nls_1.localize)(99, null, link)) }, true);
                }
                else if (this.extension.deprecationInfo.settings) {
                    const link = `[${(0, nls_1.localize)(100, null)}](${uri_1.URI.parse(`command:workbench.action.openSettings?${encodeURIComponent(JSON.stringify([this.extension.deprecationInfo.settings.map(setting => `@id:${setting}`).join(' ')]))}`)})`;
                    this.Y({ icon: extensionsIcons_1.$ghb, message: new htmlContent_1.$Xj((0, nls_1.localize)(101, null, link)) }, true);
                }
                else {
                    const message = new htmlContent_1.$Xj((0, nls_1.localize)(102, null));
                    if (this.extension.deprecationInfo.additionalInfo) {
                        message.appendMarkdown(` ${this.extension.deprecationInfo.additionalInfo}`);
                    }
                    this.Y({ icon: extensionsIcons_1.$ghb, message }, true);
                }
                return;
            }
            if (this.P.canSetLanguage(this.extension)) {
                return;
            }
            if (this.extension.gallery && this.extension.state === 3 /* ExtensionState.Uninstalled */ && !await this.P.canInstall(this.extension)) {
                if (this.J.localExtensionManagementServer || this.J.remoteExtensionManagementServer) {
                    const targetPlatform = await (this.J.localExtensionManagementServer ? this.J.localExtensionManagementServer.extensionManagementService.getTargetPlatform() : this.J.remoteExtensionManagementServer.extensionManagementService.getTargetPlatform());
                    const message = new htmlContent_1.$Xj(`${(0, nls_1.localize)(103, null, this.extension.displayName || this.extension.identifier.id, this.U.nameLong, (0, extensionManagement_1.$Sn)(targetPlatform))} [${(0, nls_1.localize)(104, null)}](https://aka.ms/vscode-platform-specific-extensions)`);
                    this.Y({ icon: extensionsIcons_1.$ghb, message }, true);
                    return;
                }
                if (this.J.webExtensionManagementServer) {
                    const productName = (0, nls_1.localize)(105, null, this.U.nameLong);
                    const message = new htmlContent_1.$Xj(`${(0, nls_1.localize)(106, null, this.extension.displayName || this.extension.identifier.id, productName)} [${(0, nls_1.localize)(107, null)}](https://aka.ms/vscode-web-extensions-guide)`);
                    this.Y({ icon: extensionsIcons_1.$ghb, message }, true);
                    return;
                }
            }
            if (!this.extension.local ||
                !this.extension.server ||
                this.extension.state !== 1 /* ExtensionState.Installed */) {
                return;
            }
            // Extension is disabled by environment
            if (this.extension.enablementState === 2 /* EnablementState.DisabledByEnvironment */) {
                this.Y({ message: new htmlContent_1.$Xj((0, nls_1.localize)(108, null)) }, true);
                return;
            }
            // Extension is enabled by environment
            if (this.extension.enablementState === 3 /* EnablementState.EnabledByEnvironment */) {
                this.Y({ message: new htmlContent_1.$Xj((0, nls_1.localize)(109, null)) }, true);
                return;
            }
            // Extension is disabled by virtual workspace
            if (this.extension.enablementState === 4 /* EnablementState.DisabledByVirtualWorkspace */) {
                const details = (0, extensions_2.$Tl)(this.extension.local.manifest.capabilities?.virtualWorkspaces);
                this.Y({ icon: extensionsIcons_1.$hhb, message: new htmlContent_1.$Xj(details ? (0, htmlContent_1.$2j)(details) : (0, nls_1.localize)(110, null)) }, true);
                return;
            }
            // Limited support in Virtual Workspace
            if ((0, virtualWorkspace_1.$xJ)(this.S.getWorkspace())) {
                const virtualSupportType = this.R.getExtensionVirtualWorkspaceSupportType(this.extension.local.manifest);
                const details = (0, extensions_2.$Tl)(this.extension.local.manifest.capabilities?.virtualWorkspaces);
                if (virtualSupportType === 'limited' || details) {
                    this.Y({ icon: extensionsIcons_1.$ghb, message: new htmlContent_1.$Xj(details ? (0, htmlContent_1.$2j)(details) : (0, nls_1.localize)(111, null)) }, true);
                    return;
                }
            }
            // Extension is disabled by untrusted workspace
            if (this.extension.enablementState === 0 /* EnablementState.DisabledByTrustRequirement */ ||
                // All disabled dependencies of the extension are disabled by untrusted workspace
                (this.extension.enablementState === 5 /* EnablementState.DisabledByExtensionDependency */ && this.W.getDependenciesEnablementStates(this.extension.local).every(([, enablementState]) => this.W.isEnabledEnablementState(enablementState) || enablementState === 0 /* EnablementState.DisabledByTrustRequirement */))) {
                this.enabled = true;
                const untrustedDetails = (0, extensions_2.$Tl)(this.extension.local.manifest.capabilities?.untrustedWorkspaces);
                this.Y({ icon: extensionsIcons_1.$ihb, message: new htmlContent_1.$Xj(untrustedDetails ? (0, htmlContent_1.$2j)(untrustedDetails) : (0, nls_1.localize)(112, null)) }, true);
                return;
            }
            // Limited support in Untrusted Workspace
            if (this.N.isWorkspaceTrustEnabled() && !this.O.isWorkspaceTrusted()) {
                const untrustedSupportType = this.R.getExtensionUntrustedWorkspaceSupportType(this.extension.local.manifest);
                const untrustedDetails = (0, extensions_2.$Tl)(this.extension.local.manifest.capabilities?.untrustedWorkspaces);
                if (untrustedSupportType === 'limited' || untrustedDetails) {
                    this.enabled = true;
                    this.Y({ icon: extensionsIcons_1.$ihb, message: new htmlContent_1.$Xj(untrustedDetails ? (0, htmlContent_1.$2j)(untrustedDetails) : (0, nls_1.localize)(113, null)) }, true);
                    return;
                }
            }
            // Extension is disabled by extension kind
            if (this.extension.enablementState === 1 /* EnablementState.DisabledByExtensionKind */) {
                if (!this.P.installed.some(e => (0, extensionManagementUtil_1.$po)(e.identifier, this.extension.identifier) && e.server !== this.extension.server)) {
                    let message;
                    // Extension on Local Server
                    if (this.J.localExtensionManagementServer === this.extension.server) {
                        if (this.R.prefersExecuteOnWorkspace(this.extension.local.manifest)) {
                            if (this.J.remoteExtensionManagementServer) {
                                message = new htmlContent_1.$Xj(`${(0, nls_1.localize)(114, null, this.J.remoteExtensionManagementServer.label)} [${(0, nls_1.localize)(115, null)}](https://aka.ms/vscode-remote/developing-extensions/architecture)`);
                            }
                        }
                    }
                    // Extension on Remote Server
                    else if (this.J.remoteExtensionManagementServer === this.extension.server) {
                        if (this.R.prefersExecuteOnUI(this.extension.local.manifest)) {
                            if (this.J.localExtensionManagementServer) {
                                message = new htmlContent_1.$Xj(`${(0, nls_1.localize)(116, null, this.J.remoteExtensionManagementServer.label)} [${(0, nls_1.localize)(117, null)}](https://aka.ms/vscode-remote/developing-extensions/architecture)`);
                            }
                            else if (platform_1.$o) {
                                message = new htmlContent_1.$Xj(`${(0, nls_1.localize)(118, null, this.U.nameLong)} [${(0, nls_1.localize)(119, null)}](https://aka.ms/vscode-remote/developing-extensions/architecture)`);
                            }
                        }
                    }
                    // Extension on Web Server
                    else if (this.J.webExtensionManagementServer === this.extension.server) {
                        message = new htmlContent_1.$Xj(`${(0, nls_1.localize)(120, null, this.U.nameLong)} [${(0, nls_1.localize)(121, null)}](https://aka.ms/vscode-remote/developing-extensions/architecture)`);
                    }
                    if (message) {
                        this.Y({ icon: extensionsIcons_1.$ghb, message }, true);
                    }
                    return;
                }
            }
            // Remote Workspace
            if (this.J.remoteExtensionManagementServer) {
                if ((0, extensions_2.$Zl)(this.extension.local.manifest)) {
                    if (!this.P.installed.some(e => (0, extensionManagementUtil_1.$po)(e.identifier, this.extension.identifier) && e.server !== this.extension.server)) {
                        const message = this.extension.server === this.J.localExtensionManagementServer
                            ? new htmlContent_1.$Xj((0, nls_1.localize)(122, null, this.J.remoteExtensionManagementServer.label))
                            : new htmlContent_1.$Xj((0, nls_1.localize)(123, null));
                        this.Y({ icon: extensionsIcons_1.$hhb, message }, true);
                    }
                    return;
                }
                const runningExtension = this.Q.extensions.filter(e => (0, extensionManagementUtil_1.$po)({ id: e.identifier.value, uuid: e.uuid }, this.extension.identifier))[0];
                const runningExtensionServer = runningExtension ? this.J.getExtensionManagementServer((0, extensions_3.$TF)(runningExtension)) : null;
                if (this.extension.server === this.J.localExtensionManagementServer && runningExtensionServer === this.J.remoteExtensionManagementServer) {
                    if (this.R.prefersExecuteOnWorkspace(this.extension.local.manifest)) {
                        this.Y({ icon: extensionsIcons_1.$hhb, message: new htmlContent_1.$Xj(`${(0, nls_1.localize)(124, null)} [${(0, nls_1.localize)(125, null)}](https://aka.ms/vscode-remote/developing-extensions/architecture)`) }, true);
                    }
                    return;
                }
                if (this.extension.server === this.J.remoteExtensionManagementServer && runningExtensionServer === this.J.localExtensionManagementServer) {
                    if (this.R.prefersExecuteOnUI(this.extension.local.manifest)) {
                        this.Y({ icon: extensionsIcons_1.$hhb, message: new htmlContent_1.$Xj(`${(0, nls_1.localize)(126, null)} [${(0, nls_1.localize)(127, null)}](https://aka.ms/vscode-remote/developing-extensions/architecture)`) }, true);
                    }
                    return;
                }
                if (this.extension.server === this.J.remoteExtensionManagementServer && runningExtensionServer === this.J.webExtensionManagementServer) {
                    if (this.R.canExecuteOnWeb(this.extension.local.manifest)) {
                        this.Y({ icon: extensionsIcons_1.$hhb, message: new htmlContent_1.$Xj(`${(0, nls_1.localize)(128, null)} [${(0, nls_1.localize)(129, null)}](https://aka.ms/vscode-remote/developing-extensions/architecture)`) }, true);
                    }
                    return;
                }
            }
            // Extension is disabled by its dependency
            if (this.extension.enablementState === 5 /* EnablementState.DisabledByExtensionDependency */) {
                this.Y({ icon: extensionsIcons_1.$ghb, message: new htmlContent_1.$Xj((0, nls_1.localize)(130, null)) }, true);
                return;
            }
            const isEnabled = this.W.isEnabled(this.extension.local);
            const isRunning = this.Q.extensions.some(e => (0, extensionManagementUtil_1.$po)({ id: e.identifier.value, uuid: e.uuid }, this.extension.identifier));
            if (isEnabled && isRunning) {
                if (this.J.localExtensionManagementServer && this.J.remoteExtensionManagementServer) {
                    if (this.extension.server === this.J.remoteExtensionManagementServer) {
                        this.Y({ message: new htmlContent_1.$Xj((0, nls_1.localize)(131, null, this.extension.server.label)) }, true);
                        return;
                    }
                }
                if (this.extension.enablementState === 8 /* EnablementState.EnabledGlobally */) {
                    this.Y({ message: new htmlContent_1.$Xj((0, nls_1.localize)(132, null)) }, true);
                    return;
                }
                if (this.extension.enablementState === 9 /* EnablementState.EnabledWorkspace */) {
                    this.Y({ message: new htmlContent_1.$Xj((0, nls_1.localize)(133, null)) }, true);
                    return;
                }
            }
            if (!isEnabled && !isRunning) {
                if (this.extension.enablementState === 6 /* EnablementState.DisabledGlobally */) {
                    this.Y({ message: new htmlContent_1.$Xj((0, nls_1.localize)(134, null)) }, true);
                    return;
                }
                if (this.extension.enablementState === 7 /* EnablementState.DisabledWorkspace */) {
                    this.Y({ message: new htmlContent_1.$Xj((0, nls_1.localize)(135, null)) }, true);
                    return;
                }
            }
            if (isEnabled && !isRunning && !this.extension.local.isValid) {
                const errors = this.extension.local.validations.filter(([severity]) => severity === notification_1.Severity.Error).map(([, message]) => message);
                this.Y({ icon: extensionsIcons_1.$fhb, message: new htmlContent_1.$Xj(errors.join(' ').trim()) }, true);
            }
        }
        Y(status, updateClass) {
            if (this.g === status) {
                return;
            }
            if (this.g && status && this.g.message === status.message && this.g.icon?.id === status.icon?.id) {
                return;
            }
            this.g = status;
            if (updateClass) {
                if (this.g?.icon === extensionsIcons_1.$fhb) {
                    this.class = `${$9hb_1.f} extension-status-error ${themables_1.ThemeIcon.asClassName(extensionsIcons_1.$fhb)}`;
                }
                else if (this.g?.icon === extensionsIcons_1.$ghb) {
                    this.class = `${$9hb_1.f} extension-status-warning ${themables_1.ThemeIcon.asClassName(extensionsIcons_1.$ghb)}`;
                }
                else if (this.g?.icon === extensionsIcons_1.$hhb) {
                    this.class = `${$9hb_1.f} extension-status-info ${themables_1.ThemeIcon.asClassName(extensionsIcons_1.$hhb)}`;
                }
                else if (this.g?.icon === extensionsIcons_1.$ihb) {
                    this.class = `${$9hb_1.f} ${themables_1.ThemeIcon.asClassName(extensionsIcons_1.$ihb)}`;
                }
                else {
                    this.class = `${$9hb_1.f} hide`;
                }
            }
            this.s.fire();
        }
        async run() {
            if (this.g?.icon === extensionsIcons_1.$ihb) {
                return this.M.executeCommand('workbench.trust.manage');
            }
        }
    };
    exports.$9hb = $9hb;
    exports.$9hb = $9hb = $9hb_1 = __decorate([
        __param(0, extensionManagement_2.$fcb),
        __param(1, label_1.$Vz),
        __param(2, commands_1.$Fr),
        __param(3, workspaceTrust_1.$0z),
        __param(4, workspaceTrust_1.$$z),
        __param(5, extensions_1.$Pfb),
        __param(6, extensions_3.$MF),
        __param(7, extensionManifestPropertiesService_1.$vcb),
        __param(8, workspace_1.$Kh),
        __param(9, productService_1.$kj),
        __param(10, extensionManagement_2.$icb)
    ], $9hb);
    let $0hb = class $0hb extends actions_1.$gi {
        static { $0hb_1 = this; }
        static { this.ID = 'workbench.extensions.action.reinstall'; }
        static { this.LABEL = (0, nls_1.localize)(136, null); }
        constructor(id = $0hb_1.ID, label = $0hb_1.LABEL, b, f, g, s, t, J, L) {
            super(id, label);
            this.b = b;
            this.f = f;
            this.g = g;
            this.s = s;
            this.t = t;
            this.J = J;
            this.L = L;
        }
        get enabled() {
            return this.b.local.filter(l => !l.isBuiltin && l.local).length > 0;
        }
        run() {
            return this.g.pick(this.M(), { placeHolder: (0, nls_1.localize)(137, null) })
                .then(pick => pick && this.N(pick.extension));
        }
        M() {
            return this.b.queryLocal()
                .then(local => {
                const entries = local
                    .filter(extension => !extension.isBuiltin && extension.server !== this.f.webExtensionManagementServer)
                    .map(extension => {
                    return {
                        id: extension.identifier.id,
                        label: extension.displayName,
                        description: extension.identifier.id,
                        extension,
                    };
                });
                return entries;
            });
        }
        N(extension) {
            return this.J.createInstance($3hb, '@installed ').run()
                .then(() => {
                return this.b.reinstall(extension)
                    .then(extension => {
                    const requireReload = !(extension.local && this.L.canAddExtension((0, extensions_3.$UF)(extension.local)));
                    const message = requireReload ? (0, nls_1.localize)(138, null, extension.identifier.id)
                        : (0, nls_1.localize)(139, null, extension.identifier.id);
                    const actions = requireReload ? [{
                            label: (0, nls_1.localize)(140, null),
                            run: () => this.t.reload()
                        }] : [];
                    this.s.prompt(notification_1.Severity.Info, message, actions, { sticky: true });
                }, error => this.s.error(error));
            });
        }
    };
    exports.$0hb = $0hb;
    exports.$0hb = $0hb = $0hb_1 = __decorate([
        __param(2, extensions_1.$Pfb),
        __param(3, extensionManagement_2.$fcb),
        __param(4, quickInput_1.$Gq),
        __param(5, notification_1.$Yu),
        __param(6, host_1.$VT),
        __param(7, instantiation_1.$Ah),
        __param(8, extensions_3.$MF)
    ], $0hb);
    let $$hb = class $$hb extends actions_1.$gi {
        static { $$hb_1 = this; }
        static { this.ID = 'workbench.extensions.action.install.specificVersion'; }
        static { this.LABEL = (0, nls_1.localize)(141, null); }
        constructor(id = $$hb_1.ID, label = $$hb_1.LABEL, b, f, g, s) {
            super(id, label);
            this.b = b;
            this.f = f;
            this.g = g;
            this.s = s;
        }
        get enabled() {
            return this.b.local.some(l => this.t(l));
        }
        async run() {
            const extensionPick = await this.f.pick(this.J(), { placeHolder: (0, nls_1.localize)(142, null), matchOnDetail: true });
            if (extensionPick && extensionPick.extension) {
                const action = this.g.createInstance($Lhb);
                action.extension = extensionPick.extension;
                await action.run();
                await this.g.createInstance($3hb, extensionPick.extension.identifier.id).run();
            }
        }
        t(extension) {
            const action = this.g.createInstance($Lhb);
            action.extension = extension;
            return action.enabled && !!extension.local && this.s.isEnabled(extension.local);
        }
        async J() {
            const installed = await this.b.queryLocal();
            const entries = [];
            for (const extension of installed) {
                if (this.t(extension)) {
                    entries.push({
                        id: extension.identifier.id,
                        label: extension.displayName || extension.identifier.id,
                        description: extension.identifier.id,
                        extension,
                    });
                }
            }
            return entries.sort((e1, e2) => e1.extension.displayName.localeCompare(e2.extension.displayName));
        }
    };
    exports.$$hb = $$hb;
    exports.$$hb = $$hb = $$hb_1 = __decorate([
        __param(2, extensions_1.$Pfb),
        __param(3, quickInput_1.$Gq),
        __param(4, instantiation_1.$Ah),
        __param(5, extensionManagement_2.$icb)
    ], $$hb);
    let $_hb = class $_hb extends actions_1.$gi {
        constructor(id, f, g, s, t) {
            super(id);
            this.f = f;
            this.g = g;
            this.s = s;
            this.t = t;
            this.b = undefined;
            this.L();
            this.f.queryLocal().then(() => this.J());
            this.B(this.f.onChange(() => {
                if (this.b) {
                    this.J();
                }
            }));
        }
        J() {
            this.b = this.f.local;
            this.L();
        }
        L() {
            this.enabled = !!this.b && this.Q(this.b).length > 0;
            this.tooltip = this.label;
        }
        async run() {
            return this.N();
        }
        async M() {
            const local = await this.f.queryLocal();
            return this.Q(local);
        }
        async N() {
            const quickPick = this.g.createQuickPick();
            quickPick.busy = true;
            const disposable = quickPick.onDidAccept(() => {
                disposable.dispose();
                quickPick.hide();
                quickPick.dispose();
                this.O(quickPick.selectedItems);
            });
            quickPick.show();
            const localExtensionsToInstall = await this.M();
            quickPick.busy = false;
            if (localExtensionsToInstall.length) {
                quickPick.title = this.P();
                quickPick.placeholder = (0, nls_1.localize)(143, null);
                quickPick.canSelectMany = true;
                localExtensionsToInstall.sort((e1, e2) => e1.displayName.localeCompare(e2.displayName));
                quickPick.items = localExtensionsToInstall.map(extension => ({ extension, label: extension.displayName, description: extension.version }));
            }
            else {
                quickPick.hide();
                quickPick.dispose();
                this.s.notify({
                    severity: notification_1.Severity.Info,
                    message: (0, nls_1.localize)(144, null)
                });
            }
        }
        async O(selectedItems) {
            if (selectedItems.length) {
                const localExtensionsToInstall = selectedItems.filter(r => !!r.extension).map(r => r.extension);
                if (localExtensionsToInstall.length) {
                    await this.t.withProgress({
                        location: 15 /* ProgressLocation.Notification */,
                        title: (0, nls_1.localize)(145, null)
                    }, () => this.R(localExtensionsToInstall));
                    this.s.info((0, nls_1.localize)(146, null));
                }
            }
        }
    };
    exports.$_hb = $_hb;
    exports.$_hb = $_hb = __decorate([
        __param(1, extensions_1.$Pfb),
        __param(2, quickInput_1.$Gq),
        __param(3, notification_1.$Yu),
        __param(4, progress_1.$2u)
    ], $_hb);
    let $aib = class $aib extends $_hb {
        constructor(extensionsWorkbenchService, quickInputService, progressService, notificationService, S, U, W, X, Y) {
            super('workbench.extensions.actions.installLocalExtensionsInRemote', extensionsWorkbenchService, quickInputService, notificationService, progressService);
            this.S = S;
            this.U = U;
            this.W = W;
            this.X = X;
            this.Y = Y;
        }
        get label() {
            if (this.S && this.S.remoteExtensionManagementServer) {
                return (0, nls_1.localize)(147, null, this.S.remoteExtensionManagementServer.label);
            }
            return '';
        }
        P() {
            return (0, nls_1.localize)(148, null, this.S.remoteExtensionManagementServer.label);
        }
        Q(local) {
            return local.filter(extension => {
                const action = this.W.createInstance($vhb, true);
                action.extension = extension;
                return action.enabled;
            });
        }
        async R(localExtensionsToInstall) {
            const galleryExtensions = [];
            const vsixs = [];
            const targetPlatform = await this.S.remoteExtensionManagementServer.extensionManagementService.getTargetPlatform();
            await async_1.Promises.settled(localExtensionsToInstall.map(async (extension) => {
                if (this.U.isEnabled()) {
                    const gallery = (await this.U.getExtensions([{ ...extension.identifier, preRelease: !!extension.local?.preRelease }], { targetPlatform, compatible: true }, cancellation_1.CancellationToken.None))[0];
                    if (gallery) {
                        galleryExtensions.push(gallery);
                        return;
                    }
                }
                const vsix = await this.S.localExtensionManagementServer.extensionManagementService.zip(extension.local);
                vsixs.push(vsix);
            }));
            await async_1.Promises.settled(galleryExtensions.map(gallery => this.S.remoteExtensionManagementServer.extensionManagementService.installFromGallery(gallery)));
            try {
                await async_1.Promises.settled(vsixs.map(vsix => this.S.remoteExtensionManagementServer.extensionManagementService.install(vsix)));
            }
            finally {
                try {
                    await Promise.allSettled(vsixs.map(vsix => this.X.del(vsix)));
                }
                catch (error) {
                    this.Y.error(error);
                }
            }
        }
    };
    exports.$aib = $aib;
    exports.$aib = $aib = __decorate([
        __param(0, extensions_1.$Pfb),
        __param(1, quickInput_1.$Gq),
        __param(2, progress_1.$2u),
        __param(3, notification_1.$Yu),
        __param(4, extensionManagement_2.$fcb),
        __param(5, extensionManagement_1.$Zn),
        __param(6, instantiation_1.$Ah),
        __param(7, files_1.$6j),
        __param(8, log_1.$5i)
    ], $aib);
    let $bib = class $bib extends $_hb {
        constructor(id, extensionsWorkbenchService, quickInputService, progressService, notificationService, S, U, W, X) {
            super(id, extensionsWorkbenchService, quickInputService, notificationService, progressService);
            this.S = S;
            this.U = U;
            this.W = W;
            this.X = X;
        }
        get label() {
            return (0, nls_1.localize)(149, null);
        }
        P() {
            return (0, nls_1.localize)(150, null);
        }
        Q(local) {
            return local.filter(extension => extension.type === 1 /* ExtensionType.User */ && extension.server !== this.S.localExtensionManagementServer
                && !this.f.installed.some(e => e.server === this.S.localExtensionManagementServer && (0, extensionManagementUtil_1.$po)(e.identifier, extension.identifier)));
        }
        async R(extensions) {
            const galleryExtensions = [];
            const vsixs = [];
            const targetPlatform = await this.S.localExtensionManagementServer.extensionManagementService.getTargetPlatform();
            await async_1.Promises.settled(extensions.map(async (extension) => {
                if (this.U.isEnabled()) {
                    const gallery = (await this.U.getExtensions([{ ...extension.identifier, preRelease: !!extension.local?.preRelease }], { targetPlatform, compatible: true }, cancellation_1.CancellationToken.None))[0];
                    if (gallery) {
                        galleryExtensions.push(gallery);
                        return;
                    }
                }
                const vsix = await this.S.remoteExtensionManagementServer.extensionManagementService.zip(extension.local);
                vsixs.push(vsix);
            }));
            await async_1.Promises.settled(galleryExtensions.map(gallery => this.S.localExtensionManagementServer.extensionManagementService.installFromGallery(gallery)));
            try {
                await async_1.Promises.settled(vsixs.map(vsix => this.S.localExtensionManagementServer.extensionManagementService.install(vsix)));
            }
            finally {
                try {
                    await Promise.allSettled(vsixs.map(vsix => this.W.del(vsix)));
                }
                catch (error) {
                    this.X.error(error);
                }
            }
        }
    };
    exports.$bib = $bib;
    exports.$bib = $bib = __decorate([
        __param(1, extensions_1.$Pfb),
        __param(2, quickInput_1.$Gq),
        __param(3, progress_1.$2u),
        __param(4, notification_1.$Yu),
        __param(5, extensionManagement_2.$fcb),
        __param(6, extensionManagement_1.$Zn),
        __param(7, files_1.$6j),
        __param(8, log_1.$5i)
    ], $bib);
    commands_1.$Gr.registerCommand('workbench.extensions.action.showExtensionsForLanguage', function (accessor, fileExtension) {
        const paneCompositeService = accessor.get(panecomposite_1.$Yeb);
        return paneCompositeService.openPaneComposite(extensions_1.$Ofb, 0 /* ViewContainerLocation.Sidebar */, true)
            .then(viewlet => viewlet?.getViewPaneContainer())
            .then(viewlet => {
            viewlet.search(`ext:${fileExtension.replace(/^\./, '')}`);
            viewlet.focus();
        });
    });
    commands_1.$Gr.registerCommand('workbench.extensions.action.showExtensionsWithIds', function (accessor, extensionIds) {
        const paneCompositeService = accessor.get(panecomposite_1.$Yeb);
        return paneCompositeService.openPaneComposite(extensions_1.$Ofb, 0 /* ViewContainerLocation.Sidebar */, true)
            .then(viewlet => viewlet?.getViewPaneContainer())
            .then(viewlet => {
            const query = extensionIds
                .map(id => `@id:${id}`)
                .join(' ');
            viewlet.search(query);
            viewlet.focus();
        });
    });
    (0, colorRegistry_1.$sv)('extensionButton.background', {
        dark: colorRegistry_1.$0v,
        light: colorRegistry_1.$0v,
        hcDark: null,
        hcLight: null
    }, (0, nls_1.localize)(151, null));
    (0, colorRegistry_1.$sv)('extensionButton.foreground', {
        dark: colorRegistry_1.$8v,
        light: colorRegistry_1.$8v,
        hcDark: null,
        hcLight: null
    }, (0, nls_1.localize)(152, null));
    (0, colorRegistry_1.$sv)('extensionButton.hoverBackground', {
        dark: colorRegistry_1.$$v,
        light: colorRegistry_1.$$v,
        hcDark: null,
        hcLight: null
    }, (0, nls_1.localize)(153, null));
    (0, colorRegistry_1.$sv)('extensionButton.separator', {
        dark: colorRegistry_1.$9v,
        light: colorRegistry_1.$9v,
        hcDark: colorRegistry_1.$9v,
        hcLight: colorRegistry_1.$9v
    }, (0, nls_1.localize)(154, null));
    exports.$cib = (0, colorRegistry_1.$sv)('extensionButton.prominentBackground', {
        dark: colorRegistry_1.$0v,
        light: colorRegistry_1.$0v,
        hcDark: null,
        hcLight: null
    }, (0, nls_1.localize)(155, null));
    (0, colorRegistry_1.$sv)('extensionButton.prominentForeground', {
        dark: colorRegistry_1.$8v,
        light: colorRegistry_1.$8v,
        hcDark: null,
        hcLight: null
    }, (0, nls_1.localize)(156, null));
    (0, colorRegistry_1.$sv)('extensionButton.prominentHoverBackground', {
        dark: colorRegistry_1.$$v,
        light: colorRegistry_1.$$v,
        hcDark: null,
        hcLight: null
    }, (0, nls_1.localize)(157, null));
    (0, themeService_1.$mv)((theme, collector) => {
        const errorColor = theme.getColor(colorRegistry_1.$lw);
        if (errorColor) {
            collector.addRule(`.extension-editor .header .actions-status-container > .status ${themables_1.ThemeIcon.asCSSSelector(extensionsIcons_1.$fhb)} { color: ${errorColor}; }`);
            collector.addRule(`.extension-editor .body .subcontent .runtime-status ${themables_1.ThemeIcon.asCSSSelector(extensionsIcons_1.$fhb)} { color: ${errorColor}; }`);
            collector.addRule(`.monaco-hover.extension-hover .markdown-hover .hover-contents ${themables_1.ThemeIcon.asCSSSelector(extensionsIcons_1.$fhb)} { color: ${errorColor}; }`);
        }
        const warningColor = theme.getColor(colorRegistry_1.$ow);
        if (warningColor) {
            collector.addRule(`.extension-editor .header .actions-status-container > .status ${themables_1.ThemeIcon.asCSSSelector(extensionsIcons_1.$ghb)} { color: ${warningColor}; }`);
            collector.addRule(`.extension-editor .body .subcontent .runtime-status ${themables_1.ThemeIcon.asCSSSelector(extensionsIcons_1.$ghb)} { color: ${warningColor}; }`);
            collector.addRule(`.monaco-hover.extension-hover .markdown-hover .hover-contents ${themables_1.ThemeIcon.asCSSSelector(extensionsIcons_1.$ghb)} { color: ${warningColor}; }`);
        }
        const infoColor = theme.getColor(colorRegistry_1.$rw);
        if (infoColor) {
            collector.addRule(`.extension-editor .header .actions-status-container > .status ${themables_1.ThemeIcon.asCSSSelector(extensionsIcons_1.$hhb)} { color: ${infoColor}; }`);
            collector.addRule(`.extension-editor .body .subcontent .runtime-status ${themables_1.ThemeIcon.asCSSSelector(extensionsIcons_1.$hhb)} { color: ${infoColor}; }`);
            collector.addRule(`.monaco-hover.extension-hover .markdown-hover .hover-contents ${themables_1.ThemeIcon.asCSSSelector(extensionsIcons_1.$hhb)} { color: ${infoColor}; }`);
        }
    });
});
//# sourceMappingURL=extensionsActions.js.map