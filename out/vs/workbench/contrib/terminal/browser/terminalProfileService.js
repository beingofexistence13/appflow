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
define(["require", "exports", "vs/base/common/arrays", "vs/base/common/async", "vs/base/common/decorators", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/platform", "vs/platform/configuration/common/configuration", "vs/platform/contextkey/common/contextkey", "vs/platform/terminal/common/terminalPlatformConfiguration", "vs/platform/terminal/common/terminalProfiles", "vs/workbench/contrib/terminal/browser/terminal", "vs/workbench/contrib/terminal/browser/terminalActions", "vs/workbench/contrib/terminal/common/terminalContextKey", "vs/workbench/contrib/terminal/common/terminalExtensionPoints", "vs/workbench/services/environment/common/environmentService", "vs/workbench/services/extensions/common/extensions", "vs/workbench/services/remote/common/remoteAgentService"], function (require, exports, arrays_1, async_1, decorators_1, event_1, lifecycle_1, platform_1, configuration_1, contextkey_1, terminalPlatformConfiguration_1, terminalProfiles_1, terminal_1, terminalActions_1, terminalContextKey_1, terminalExtensionPoints_1, environmentService_1, extensions_1, remoteAgentService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TerminalProfileService = void 0;
    /*
     * Links TerminalService with TerminalProfileResolverService
     * and keeps the available terminal profiles updated
     */
    let TerminalProfileService = class TerminalProfileService extends lifecycle_1.Disposable {
        get onDidChangeAvailableProfiles() { return this._onDidChangeAvailableProfiles.event; }
        get profilesReady() { return this._profilesReadyPromise; }
        get availableProfiles() {
            if (!this._platformConfigJustRefreshed) {
                this.refreshAvailableProfiles();
            }
            return this._availableProfiles || [];
        }
        get contributedProfiles() {
            return this._contributedProfiles || [];
        }
        constructor(_contextKeyService, _configurationService, _terminalContributionService, _extensionService, _remoteAgentService, _environmentService, _terminalInstanceService) {
            super();
            this._contextKeyService = _contextKeyService;
            this._configurationService = _configurationService;
            this._terminalContributionService = _terminalContributionService;
            this._extensionService = _extensionService;
            this._remoteAgentService = _remoteAgentService;
            this._environmentService = _environmentService;
            this._terminalInstanceService = _terminalInstanceService;
            this._contributedProfiles = [];
            this._platformConfigJustRefreshed = false;
            this._profileProviders = new Map();
            this._onDidChangeAvailableProfiles = this._register(new event_1.Emitter());
            // in web, we don't want to show the dropdown unless there's a web extension
            // that contributes a profile
            this._extensionService.onDidChangeExtensions(() => this.refreshAvailableProfiles());
            this._webExtensionContributedProfileContextKey = terminalContextKey_1.TerminalContextKeys.webExtensionContributedProfile.bindTo(this._contextKeyService);
            this._updateWebContextKey();
            this._profilesReadyPromise = this._remoteAgentService.getEnvironment()
                .then(() => {
                // Wait up to 20 seconds for profiles to be ready so it's assured that we know the actual
                // default terminal before launching the first terminal. This isn't expected to ever take
                // this long.
                this._profilesReadyBarrier = new async_1.AutoOpenBarrier(20000);
                return this._profilesReadyBarrier.wait().then(() => { });
            });
            this.refreshAvailableProfiles();
            this._setupConfigListener();
        }
        async _setupConfigListener() {
            const platformKey = await this.getPlatformKey();
            this._configurationService.onDidChangeConfiguration(async (e) => {
                if (e.affectsConfiguration("terminal.integrated.defaultProfile." /* TerminalSettingPrefix.DefaultProfile */ + platformKey) ||
                    e.affectsConfiguration("terminal.integrated.profiles." /* TerminalSettingPrefix.Profiles */ + platformKey) ||
                    e.affectsConfiguration("terminal.integrated.useWslProfiles" /* TerminalSettingId.UseWslProfiles */)) {
                    if (e.source !== 7 /* ConfigurationTarget.DEFAULT */) {
                        // when _refreshPlatformConfig is called within refreshAvailableProfiles
                        // on did change configuration is fired. this can lead to an infinite recursion
                        this.refreshAvailableProfiles();
                        this._platformConfigJustRefreshed = false;
                    }
                    else {
                        this._platformConfigJustRefreshed = true;
                    }
                }
            });
        }
        getDefaultProfileName() {
            return this._defaultProfileName;
        }
        getDefaultProfile(os) {
            let defaultProfileName;
            if (os) {
                defaultProfileName = this._configurationService.getValue(`${"terminal.integrated.defaultProfile." /* TerminalSettingPrefix.DefaultProfile */}${this._getOsKey(os)}`);
                if (!defaultProfileName || typeof defaultProfileName !== 'string') {
                    return undefined;
                }
            }
            else {
                defaultProfileName = this._defaultProfileName;
            }
            if (!defaultProfileName) {
                return undefined;
            }
            // IMPORTANT: Only allow the default profile name to find non-auto detected profiles as
            // to avoid unsafe path profiles being picked up.
            return this.availableProfiles.find(e => e.profileName === defaultProfileName && !e.isAutoDetected);
        }
        _getOsKey(os) {
            switch (os) {
                case 3 /* OperatingSystem.Linux */: return 'linux';
                case 2 /* OperatingSystem.Macintosh */: return 'osx';
                case 1 /* OperatingSystem.Windows */: return 'windows';
            }
        }
        refreshAvailableProfiles() {
            this._refreshAvailableProfilesNow();
        }
        async _refreshAvailableProfilesNow() {
            const profiles = await this._detectProfiles(true);
            const profilesChanged = !((0, arrays_1.equals)(profiles, this._availableProfiles, profilesEqual));
            const contributedProfilesChanged = await this._updateContributedProfiles();
            if (profilesChanged || contributedProfilesChanged) {
                this._availableProfiles = profiles;
                this._onDidChangeAvailableProfiles.fire(this._availableProfiles);
                this._profilesReadyBarrier.open();
                this._updateWebContextKey();
                await this._refreshPlatformConfig(this._availableProfiles);
            }
        }
        async _updateContributedProfiles() {
            const platformKey = await this.getPlatformKey();
            const excludedContributedProfiles = [];
            const configProfiles = this._configurationService.getValue("terminal.integrated.profiles." /* TerminalSettingPrefix.Profiles */ + platformKey);
            for (const [profileName, value] of Object.entries(configProfiles)) {
                if (value === null) {
                    excludedContributedProfiles.push(profileName);
                }
            }
            const filteredContributedProfiles = Array.from(this._terminalContributionService.terminalProfiles.filter(p => !excludedContributedProfiles.includes(p.title)));
            const contributedProfilesChanged = !(0, arrays_1.equals)(filteredContributedProfiles, this._contributedProfiles, contributedProfilesEqual);
            this._contributedProfiles = filteredContributedProfiles;
            return contributedProfilesChanged;
        }
        getContributedProfileProvider(extensionIdentifier, id) {
            const extMap = this._profileProviders.get(extensionIdentifier);
            return extMap?.get(id);
        }
        async _detectProfiles(includeDetectedProfiles) {
            const primaryBackend = await this._terminalInstanceService.getBackend(this._environmentService.remoteAuthority);
            if (!primaryBackend) {
                return this._availableProfiles || [];
            }
            const platform = await this.getPlatformKey();
            this._defaultProfileName = this._configurationService.getValue(`${"terminal.integrated.defaultProfile." /* TerminalSettingPrefix.DefaultProfile */}${platform}`) ?? undefined;
            return primaryBackend.getProfiles(this._configurationService.getValue(`${"terminal.integrated.profiles." /* TerminalSettingPrefix.Profiles */}${platform}`), this._defaultProfileName, includeDetectedProfiles);
        }
        _updateWebContextKey() {
            this._webExtensionContributedProfileContextKey.set(platform_1.isWeb && this._contributedProfiles.length > 0);
        }
        async _refreshPlatformConfig(profiles) {
            const env = await this._remoteAgentService.getEnvironment();
            (0, terminalPlatformConfiguration_1.registerTerminalDefaultProfileConfiguration)({ os: env?.os || platform_1.OS, profiles }, this._contributedProfiles);
            (0, terminalActions_1.refreshTerminalActions)(profiles);
        }
        async getPlatformKey() {
            const env = await this._remoteAgentService.getEnvironment();
            if (env) {
                return env.os === 1 /* OperatingSystem.Windows */ ? 'windows' : (env.os === 2 /* OperatingSystem.Macintosh */ ? 'osx' : 'linux');
            }
            return platform_1.isWindows ? 'windows' : (platform_1.isMacintosh ? 'osx' : 'linux');
        }
        registerTerminalProfileProvider(extensionIdentifier, id, profileProvider) {
            let extMap = this._profileProviders.get(extensionIdentifier);
            if (!extMap) {
                extMap = new Map();
                this._profileProviders.set(extensionIdentifier, extMap);
            }
            extMap.set(id, profileProvider);
            return (0, lifecycle_1.toDisposable)(() => this._profileProviders.delete(id));
        }
        async registerContributedProfile(args) {
            const platformKey = await this.getPlatformKey();
            const profilesConfig = await this._configurationService.getValue(`${"terminal.integrated.profiles." /* TerminalSettingPrefix.Profiles */}${platformKey}`);
            if (typeof profilesConfig === 'object') {
                const newProfile = {
                    extensionIdentifier: args.extensionIdentifier,
                    icon: args.options.icon,
                    id: args.id,
                    title: args.title,
                    color: args.options.color
                };
                profilesConfig[args.title] = newProfile;
            }
            await this._configurationService.updateValue(`${"terminal.integrated.profiles." /* TerminalSettingPrefix.Profiles */}${platformKey}`, profilesConfig, 2 /* ConfigurationTarget.USER */);
            return;
        }
        async getContributedDefaultProfile(shellLaunchConfig) {
            // prevents recursion with the MainThreadTerminalService call to create terminal
            // and defers to the provided launch config when an executable is provided
            if (shellLaunchConfig && !shellLaunchConfig.extHostTerminalId && !('executable' in shellLaunchConfig)) {
                const key = await this.getPlatformKey();
                const defaultProfileName = this._configurationService.getValue(`${"terminal.integrated.defaultProfile." /* TerminalSettingPrefix.DefaultProfile */}${key}`);
                const contributedDefaultProfile = this.contributedProfiles.find(p => p.title === defaultProfileName);
                return contributedDefaultProfile;
            }
            return undefined;
        }
    };
    exports.TerminalProfileService = TerminalProfileService;
    __decorate([
        (0, decorators_1.throttle)(2000)
    ], TerminalProfileService.prototype, "refreshAvailableProfiles", null);
    exports.TerminalProfileService = TerminalProfileService = __decorate([
        __param(0, contextkey_1.IContextKeyService),
        __param(1, configuration_1.IConfigurationService),
        __param(2, terminalExtensionPoints_1.ITerminalContributionService),
        __param(3, extensions_1.IExtensionService),
        __param(4, remoteAgentService_1.IRemoteAgentService),
        __param(5, environmentService_1.IWorkbenchEnvironmentService),
        __param(6, terminal_1.ITerminalInstanceService)
    ], TerminalProfileService);
    function profilesEqual(one, other) {
        return one.profileName === other.profileName &&
            (0, terminalProfiles_1.terminalProfileArgsMatch)(one.args, other.args) &&
            one.color === other.color &&
            (0, terminalProfiles_1.terminalIconsEqual)(one.icon, other.icon) &&
            one.isAutoDetected === other.isAutoDetected &&
            one.isDefault === other.isDefault &&
            one.overrideName === other.overrideName &&
            one.path === other.path;
    }
    function contributedProfilesEqual(one, other) {
        return one.extensionIdentifier === other.extensionIdentifier &&
            one.color === other.color &&
            one.icon === other.icon &&
            one.id === other.id &&
            one.title === other.title;
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVybWluYWxQcm9maWxlU2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL3Rlcm1pbmFsL2Jyb3dzZXIvdGVybWluYWxQcm9maWxlU2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUFzQmhHOzs7T0FHRztJQUNJLElBQU0sc0JBQXNCLEdBQTVCLE1BQU0sc0JBQXVCLFNBQVEsc0JBQVU7UUFhckQsSUFBSSw0QkFBNEIsS0FBZ0MsT0FBTyxJQUFJLENBQUMsNkJBQTZCLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztRQUVsSCxJQUFJLGFBQWEsS0FBb0IsT0FBTyxJQUFJLENBQUMscUJBQXFCLENBQUMsQ0FBQyxDQUFDO1FBQ3pFLElBQUksaUJBQWlCO1lBQ3BCLElBQUksQ0FBQyxJQUFJLENBQUMsNEJBQTRCLEVBQUU7Z0JBQ3ZDLElBQUksQ0FBQyx3QkFBd0IsRUFBRSxDQUFDO2FBQ2hDO1lBQ0QsT0FBTyxJQUFJLENBQUMsa0JBQWtCLElBQUksRUFBRSxDQUFDO1FBQ3RDLENBQUM7UUFDRCxJQUFJLG1CQUFtQjtZQUN0QixPQUFPLElBQUksQ0FBQyxvQkFBb0IsSUFBSSxFQUFFLENBQUM7UUFDeEMsQ0FBQztRQUVELFlBQ3FCLGtCQUF1RCxFQUNwRCxxQkFBNkQsRUFDdEQsNEJBQTJFLEVBQ3RGLGlCQUFxRCxFQUNuRCxtQkFBZ0QsRUFDdkMsbUJBQWtFLEVBQ3RFLHdCQUFtRTtZQUU3RixLQUFLLEVBQUUsQ0FBQztZQVI2Qix1QkFBa0IsR0FBbEIsa0JBQWtCLENBQW9CO1lBQ25DLDBCQUFxQixHQUFyQixxQkFBcUIsQ0FBdUI7WUFDckMsaUNBQTRCLEdBQTVCLDRCQUE0QixDQUE4QjtZQUNyRSxzQkFBaUIsR0FBakIsaUJBQWlCLENBQW1CO1lBQzNDLHdCQUFtQixHQUFuQixtQkFB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