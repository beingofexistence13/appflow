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
define(["require", "exports", "vs/base/common/network", "vs/base/common/process", "vs/platform/configuration/common/configuration", "vs/platform/workspace/common/workspace", "vs/workbench/services/configurationResolver/common/configurationResolver", "vs/workbench/services/history/common/history", "vs/base/common/platform", "vs/platform/terminal/common/terminal", "vs/workbench/contrib/terminal/common/terminal", "vs/base/common/path", "vs/base/common/codicons", "vs/platform/theme/common/iconRegistry", "vs/workbench/services/remote/common/remoteAgentService", "vs/base/common/decorators", "vs/base/common/themables", "vs/base/common/uri", "vs/base/common/arrays", "vs/base/common/objects", "vs/platform/terminal/common/terminalProfiles", "vs/workbench/contrib/terminal/browser/terminal"], function (require, exports, network_1, process_1, configuration_1, workspace_1, configurationResolver_1, history_1, platform_1, terminal_1, terminal_2, path, codicons_1, iconRegistry_1, remoteAgentService_1, decorators_1, themables_1, uri_1, arrays_1, objects_1, terminalProfiles_1, terminal_3) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.BrowserTerminalProfileResolverService = exports.BaseTerminalProfileResolverService = void 0;
    const generatedProfileName = 'Generated';
    /*
     * Resolves terminal shell launch config and terminal profiles for the given operating system,
     * environment, and user configuration.
     */
    class BaseTerminalProfileResolverService {
        get defaultProfileName() { return this._defaultProfileName; }
        constructor(_context, _configurationService, _configurationResolverService, _historyService, _logService, _terminalProfileService, _workspaceContextService, _remoteAgentService) {
            this._context = _context;
            this._configurationService = _configurationService;
            this._configurationResolverService = _configurationResolverService;
            this._historyService = _historyService;
            this._logService = _logService;
            this._terminalProfileService = _terminalProfileService;
            this._workspaceContextService = _workspaceContextService;
            this._remoteAgentService = _remoteAgentService;
            this._iconRegistry = (0, iconRegistry_1.getIconRegistry)();
            if (this._remoteAgentService.getConnection()) {
                this._remoteAgentService.getEnvironment().then(env => this._primaryBackendOs = env?.os || platform_1.OS);
            }
            else {
                this._primaryBackendOs = platform_1.OS;
            }
            this._configurationService.onDidChangeConfiguration(e => {
                if (e.affectsConfiguration("terminal.integrated.defaultProfile.windows" /* TerminalSettingId.DefaultProfileWindows */) ||
                    e.affectsConfiguration("terminal.integrated.defaultProfile.osx" /* TerminalSettingId.DefaultProfileMacOs */) ||
                    e.affectsConfiguration("terminal.integrated.defaultProfile.linux" /* TerminalSettingId.DefaultProfileLinux */)) {
                    this._refreshDefaultProfileName();
                }
            });
            this._terminalProfileService.onDidChangeAvailableProfiles(() => this._refreshDefaultProfileName());
        }
        async _refreshDefaultProfileName() {
            if (this._primaryBackendOs) {
                this._defaultProfileName = (await this.getDefaultProfile({
                    remoteAuthority: this._remoteAgentService.getConnection()?.remoteAuthority,
                    os: this._primaryBackendOs
                }))?.profileName;
            }
        }
        resolveIcon(shellLaunchConfig, os) {
            if (shellLaunchConfig.icon) {
                shellLaunchConfig.icon = this._getCustomIcon(shellLaunchConfig.icon) || this.getDefaultIcon();
                return;
            }
            if (shellLaunchConfig.customPtyImplementation) {
                shellLaunchConfig.icon = this.getDefaultIcon();
                return;
            }
            if (shellLaunchConfig.executable) {
                return;
            }
            const defaultProfile = this._getUnresolvedRealDefaultProfile(os);
            if (defaultProfile) {
                shellLaunchConfig.icon = defaultProfile.icon;
            }
            if (!shellLaunchConfig.icon) {
                shellLaunchConfig.icon = this.getDefaultIcon();
            }
        }
        getDefaultIcon(resource) {
            return this._iconRegistry.getIcon(this._configurationService.getValue("terminal.integrated.tabs.defaultIcon" /* TerminalSettingId.TabsDefaultIcon */, { resource })) || codicons_1.Codicon.terminal;
        }
        async resolveShellLaunchConfig(shellLaunchConfig, options) {
            // Resolve the shell and shell args
            let resolvedProfile;
            if (shellLaunchConfig.executable) {
                resolvedProfile = await this._resolveProfile({
                    path: shellLaunchConfig.executable,
                    args: shellLaunchConfig.args,
                    profileName: generatedProfileName,
                    isDefault: false
                }, options);
            }
            else {
                resolvedProfile = await this.getDefaultProfile(options);
            }
            shellLaunchConfig.executable = resolvedProfile.path;
            shellLaunchConfig.args = resolvedProfile.args;
            if (resolvedProfile.env) {
                if (shellLaunchConfig.env) {
                    shellLaunchConfig.env = { ...shellLaunchConfig.env, ...resolvedProfile.env };
                }
                else {
                    shellLaunchConfig.env = resolvedProfile.env;
                }
            }
            // Verify the icon is valid, and fallback correctly to the generic terminal id if there is
            // an issue
            const resource = shellLaunchConfig === undefined || typeof shellLaunchConfig.cwd === 'string' ? undefined : shellLaunchConfig.cwd;
            shellLaunchConfig.icon = this._getCustomIcon(shellLaunchConfig.icon)
                || this._getCustomIcon(resolvedProfile.icon)
                || this.getDefaultIcon(resource);
            // Override the name if specified
            if (resolvedProfile.overrideName) {
                shellLaunchConfig.name = resolvedProfile.profileName;
            }
            // Apply the color
            shellLaunchConfig.color = shellLaunchConfig.color
                || resolvedProfile.color
                || this._configurationService.getValue("terminal.integrated.tabs.defaultColor" /* TerminalSettingId.TabsDefaultColor */, { resource });
            // Resolve useShellEnvironment based on the setting if it's not set
            if (shellLaunchConfig.useShellEnvironment === undefined) {
                shellLaunchConfig.useShellEnvironment = this._configurationService.getValue("terminal.integrated.inheritEnv" /* TerminalSettingId.InheritEnv */);
            }
        }
        async getDefaultShell(options) {
            return (await this.getDefaultProfile(options)).path;
        }
        async getDefaultShellArgs(options) {
            return (await this.getDefaultProfile(options)).args || [];
        }
        async getDefaultProfile(options) {
            return this._resolveProfile(await this._getUnresolvedDefaultProfile(options), options);
        }
        getEnvironment(remoteAuthority) {
            return this._context.getEnvironment(remoteAuthority);
        }
        _getCustomIcon(icon) {
            if (!icon) {
                return undefined;
            }
            if (typeof icon === 'string') {
                return themables_1.ThemeIcon.fromId(icon);
            }
            if (themables_1.ThemeIcon.isThemeIcon(icon)) {
                return icon;
            }
            if (uri_1.URI.isUri(icon) || (0, terminalProfiles_1.isUriComponents)(icon)) {
                return uri_1.URI.revive(icon);
            }
            if (typeof icon === 'object' && 'light' in icon && 'dark' in icon) {
                const castedIcon = icon;
                if ((uri_1.URI.isUri(castedIcon.light) || (0, terminalProfiles_1.isUriComponents)(castedIcon.light)) && (uri_1.URI.isUri(castedIcon.dark) || (0, terminalProfiles_1.isUriComponents)(castedIcon.dark))) {
                    return { light: uri_1.URI.revive(castedIcon.light), dark: uri_1.URI.revive(castedIcon.dark) };
                }
            }
            return undefined;
        }
        async _getUnresolvedDefaultProfile(options) {
            // If automation shell is allowed, prefer that
            if (options.allowAutomationShell) {
                const automationShellProfile = this._getUnresolvedAutomationShellProfile(options);
                if (automationShellProfile) {
                    return automationShellProfile;
                }
            }
            // Return the real default profile if it exists and is valid, wait for profiles to be ready
            // if the window just opened
            await this._terminalProfileService.profilesReady;
            const defaultProfile = this._getUnresolvedRealDefaultProfile(options.os);
            if (defaultProfile) {
                return this._setIconForAutomation(options, defaultProfile);
            }
            // If there is no real default profile, create a fallback default profile based on the shell
            // and shellArgs settings in addition to the current environment.
            return this._setIconForAutomation(options, await this._getUnresolvedFallbackDefaultProfile(options));
        }
        _setIconForAutomation(options, profile) {
            if (options.allowAutomationShell) {
                const profileClone = (0, objects_1.deepClone)(profile);
                profileClone.icon = codicons_1.Codicon.tools;
                return profileClone;
            }
            return profile;
        }
        _getUnresolvedRealDefaultProfile(os) {
            return this._terminalProfileService.getDefaultProfile(os);
        }
        async _getUnresolvedFallbackDefaultProfile(options) {
            const executable = await this._context.getDefaultSystemShell(options.remoteAuthority, options.os);
            // Try select an existing profile to fallback to, based on the default system shell, only do
            // this when it is NOT a local terminal in a remote window where the front and back end OS
            // differs (eg. Windows -> WSL, Mac -> Linux)
            if (options.os === platform_1.OS) {
                let existingProfile = this._terminalProfileService.availableProfiles.find(e => path.parse(e.path).name === path.parse(executable).name);
                if (existingProfile) {
                    if (options.allowAutomationShell) {
                        existingProfile = (0, objects_1.deepClone)(existingProfile);
                        existingProfile.icon = codicons_1.Codicon.tools;
                    }
                    return existingProfile;
                }
            }
            // Finally fallback to a generated profile
            let args;
            if (options.os === 2 /* OperatingSystem.Macintosh */ && path.parse(executable).name.match(/(zsh|bash)/)) {
                // macOS should launch a login shell by default
                args = ['--login'];
            }
            else {
                // Resolve undefined to []
                args = [];
            }
            const icon = this._guessProfileIcon(executable);
            return {
                profileName: generatedProfileName,
                path: executable,
                args,
                icon,
                isDefault: false
            };
        }
        _getUnresolvedAutomationShellProfile(options) {
            const automationProfile = this._configurationService.getValue(`terminal.integrated.automationProfile.${this._getOsKey(options.os)}`);
            if (this._isValidAutomationProfile(automationProfile, options.os)) {
                automationProfile.icon = this._getCustomIcon(automationProfile.icon) || codicons_1.Codicon.tools;
                return automationProfile;
            }
            return undefined;
        }
        async _resolveProfile(profile, options) {
            const env = await this._context.getEnvironment(options.remoteAuthority);
            if (options.os === 1 /* OperatingSystem.Windows */) {
                // Change Sysnative to System32 if the OS is Windows but NOT WoW64. It's
                // safe to assume that this was used by accident as Sysnative does not
                // exist and will break the terminal in non-WoW64 environments.
                const isWoW64 = !!env.hasOwnProperty('PROCESSOR_ARCHITEW6432');
                const windir = env.windir;
                if (!isWoW64 && windir) {
                    const sysnativePath = path.join(windir, 'Sysnative').replace(/\//g, '\\').toLowerCase();
                    if (profile.path && profile.path.toLowerCase().indexOf(sysnativePath) === 0) {
                        profile.path = path.join(windir, 'System32', profile.path.substr(sysnativePath.length + 1));
                    }
                }
                // Convert / to \ on Windows for convenience
                if (profile.path) {
                    profile.path = profile.path.replace(/\//g, '\\');
                }
            }
            // Resolve path variables
            const activeWorkspaceRootUri = this._historyService.getLastActiveWorkspaceRoot(options.remoteAuthority ? network_1.Schemas.vscodeRemote : network_1.Schemas.file);
            const lastActiveWorkspace = activeWorkspaceRootUri ? this._workspaceContextService.getWorkspaceFolder(activeWorkspaceRootUri) ?? undefined : undefined;
            profile.path = await this._resolveVariables(profile.path, env, lastActiveWorkspace);
            // Resolve args variables
            if (profile.args) {
                if (typeof profile.args === 'string') {
                    profile.args = await this._resolveVariables(profile.args, env, lastActiveWorkspace);
                }
                else {
                    profile.args = await Promise.all(profile.args.map(arg => this._resolveVariables(arg, env, lastActiveWorkspace)));
                }
            }
            return profile;
        }
        async _resolveVariables(value, env, lastActiveWorkspace) {
            try {
                value = await this._configurationResolverService.resolveWithEnvironment(env, lastActiveWorkspace, value);
            }
            catch (e) {
                this._logService.error(`Could not resolve shell`, e);
            }
            return value;
        }
        _getOsKey(os) {
            switch (os) {
                case 3 /* OperatingSystem.Linux */: return 'linux';
                case 2 /* OperatingSystem.Macintosh */: return 'osx';
                case 1 /* OperatingSystem.Windows */: return 'windows';
            }
        }
        _guessProfileIcon(shell) {
            const file = path.parse(shell).name;
            switch (file) {
                case 'bash':
                    return codicons_1.Codicon.terminalBash;
                case 'pwsh':
                case 'powershell':
                    return codicons_1.Codicon.terminalPowershell;
                case 'tmux':
                    return codicons_1.Codicon.terminalTmux;
                case 'cmd':
                    return codicons_1.Codicon.terminalCmd;
                default:
                    return undefined;
            }
        }
        _isValidShellArgs(shellArgs, os) {
            if (shellArgs === undefined) {
                return true;
            }
            if (os === 1 /* OperatingSystem.Windows */ && typeof shellArgs === 'string') {
                return true;
            }
            if (Array.isArray(shellArgs) && shellArgs.every(e => typeof e === 'string')) {
                return true;
            }
            return false;
        }
        async createProfileFromShellAndShellArgs(shell, shellArgs) {
            const detectedProfile = this._terminalProfileService.availableProfiles?.find(p => {
                if (p.path !== shell) {
                    return false;
                }
                if (p.args === undefined || typeof p.args === 'string') {
                    return p.args === shellArgs;
                }
                return p.path === shell && (0, arrays_1.equals)(p.args, (shellArgs || []));
            });
            const fallbackProfile = (await this.getDefaultProfile({
                remoteAuthority: this._remoteAgentService.getConnection()?.remoteAuthority,
                os: this._primaryBackendOs
            }));
            fallbackProfile.profileName = `${fallbackProfile.path} (migrated)`;
            const profile = detectedProfile || fallbackProfile;
            const args = this._isValidShellArgs(shellArgs, this._primaryBackendOs) ? shellArgs : profile.args;
            const createdProfile = {
                profileName: profile.profileName,
                path: profile.path,
                args,
                isDefault: true
            };
            if (detectedProfile && detectedProfile.profileName === createdProfile.profileName && detectedProfile.path === createdProfile.path && (0, terminalProfiles_1.terminalProfileArgsMatch)(detectedProfile.args, createdProfile.args)) {
                return detectedProfile.profileName;
            }
            return createdProfile;
        }
        _isValidAutomationProfile(profile, os) {
            if (profile === null || profile === undefined || typeof profile !== 'object') {
                return false;
            }
            if ('path' in profile && typeof profile.path === 'string') {
                return true;
            }
            return false;
        }
    }
    exports.BaseTerminalProfileResolverService = BaseTerminalProfileResolverService;
    __decorate([
        (0, decorators_1.debounce)(200)
    ], BaseTerminalProfileResolverService.prototype, "_refreshDefaultProfileName", null);
    let BrowserTerminalProfileResolverService = class BrowserTerminalProfileResolverService extends BaseTerminalProfileResolverService {
        constructor(configurationResolverService, configurationService, historyService, logService, terminalInstanceService, terminalProfileService, workspaceContextService, remoteAgentService) {
            super({
                getDefaultSystemShell: async (remoteAuthority, os) => {
                    const backend = await terminalInstanceService.getBackend(remoteAuthority);
                    if (!remoteAuthority || !backend) {
                        // Just return basic values, this is only for serverless web and wouldn't be used
                        return os === 1 /* OperatingSystem.Windows */ ? 'pwsh' : 'bash';
                    }
                    return backend.getDefaultSystemShell(os);
                },
                getEnvironment: async (remoteAuthority) => {
                    const backend = await terminalInstanceService.getBackend(remoteAuthority);
                    if (!remoteAuthority || !backend) {
                        return process_1.env;
                    }
                    return backend.getEnvironment();
                }
            }, configurationService, configurationResolverService, historyService, logService, terminalProfileService, workspaceContextService, remoteAgentService);
        }
    };
    exports.BrowserTerminalProfileResolverService = BrowserTerminalProfileResolverService;
    exports.BrowserTerminalProfileResolverService = BrowserTerminalProfileResolverService = __decorate([
        __param(0, configurationResolver_1.IConfigurationResolverService),
        __param(1, configuration_1.IConfigurationService),
        __param(2, history_1.IHistoryService),
        __param(3, terminal_1.ITerminalLogService),
        __param(4, terminal_3.ITerminalInstanceService),
        __param(5, terminal_2.ITerminalProfileService),
        __param(6, workspace_1.IWorkspaceContextService),
        __param(7, remoteAgentService_1.IRemoteAgentService)
    ], BrowserTerminalProfileResolverService);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVybWluYWxQcm9maWxlUmVzb2x2ZXJTZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvdGVybWluYWwvYnJvd3Nlci90ZXJtaW5hbFByb2ZpbGVSZXNvbHZlclNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBNEJoRyxNQUFNLG9CQUFvQixHQUFHLFdBQVcsQ0FBQztJQUV6Qzs7O09BR0c7SUFDSCxNQUFzQixrQ0FBa0M7UUFRdkQsSUFBSSxrQkFBa0IsS0FBeUIsT0FBTyxJQUFJLENBQUMsbUJBQW1CLENBQUMsQ0FBQyxDQUFDO1FBRWpGLFlBQ2tCLFFBQWlDLEVBQ2pDLHFCQUE0QyxFQUM1Qyw2QkFBNEQsRUFDNUQsZUFBZ0MsRUFDaEMsV0FBZ0MsRUFDaEMsdUJBQWdELEVBQ2hELHdCQUFrRCxFQUNsRCxtQkFBd0M7WUFQeEMsYUFBUSxHQUFSLFFBQVEsQ0FBeUI7WUFDakMsMEJBQXFCLEdBQXJCLHFCQUFxQixDQUF1QjtZQUM1QyxrQ0FBNkIsR0FBN0IsNkJBQTZCLENBQStCO1lBQzVELG9CQUFlLEdBQWYsZUFBZSxDQUFpQjtZQUNoQyxnQkFBVyxHQUFYLFdBQVcsQ0FBcUI7WUFDaEMsNEJBQXVCLEdBQXZCLHVCQUF1QixDQUF5QjtZQUNoRCw2QkFBd0IsR0FBeEIsd0JBQXdCLENBQTBCO1lBQ2xELHdCQUFtQixHQUFuQixtQkFBbUIsQ0FBcUI7WUFiekMsa0JBQWEsR0FBa0IsSUFBQSw4QkFBZSxHQUFFLENBQUM7WUFlakUsSUFBSSxJQUFJLENBQUMsbUJBQW1CLENBQUMsYUFBYSxFQUFFLEVBQUU7Z0JBQzdDLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxjQUFjLEVBQUUsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsaUJBQWlCLEdBQUcsR0FB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