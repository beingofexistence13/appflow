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
    exports.$_4b = exports.$$4b = void 0;
    const generatedProfileName = 'Generated';
    /*
     * Resolves terminal shell launch config and terminal profiles for the given operating system,
     * environment, and user configuration.
     */
    class $$4b {
        get defaultProfileName() { return this.c; }
        constructor(d, f, g, h, i, j, k, l) {
            this.d = d;
            this.f = f;
            this.g = g;
            this.h = h;
            this.i = i;
            this.j = j;
            this.k = k;
            this.l = l;
            this.b = (0, iconRegistry_1.$0u)();
            if (this.l.getConnection()) {
                this.l.getEnvironment().then(env => this.a = env?.os || platform_1.OS);
            }
            else {
                this.a = platform_1.OS;
            }
            this.f.onDidChangeConfiguration(e => {
                if (e.affectsConfiguration("terminal.integrated.defaultProfile.windows" /* TerminalSettingId.DefaultProfileWindows */) ||
                    e.affectsConfiguration("terminal.integrated.defaultProfile.osx" /* TerminalSettingId.DefaultProfileMacOs */) ||
                    e.affectsConfiguration("terminal.integrated.defaultProfile.linux" /* TerminalSettingId.DefaultProfileLinux */)) {
                    this.m();
                }
            });
            this.j.onDidChangeAvailableProfiles(() => this.m());
        }
        async m() {
            if (this.a) {
                this.c = (await this.getDefaultProfile({
                    remoteAuthority: this.l.getConnection()?.remoteAuthority,
                    os: this.a
                }))?.profileName;
            }
        }
        resolveIcon(shellLaunchConfig, os) {
            if (shellLaunchConfig.icon) {
                shellLaunchConfig.icon = this.n(shellLaunchConfig.icon) || this.getDefaultIcon();
                return;
            }
            if (shellLaunchConfig.customPtyImplementation) {
                shellLaunchConfig.icon = this.getDefaultIcon();
                return;
            }
            if (shellLaunchConfig.executable) {
                return;
            }
            const defaultProfile = this.r(os);
            if (defaultProfile) {
                shellLaunchConfig.icon = defaultProfile.icon;
            }
            if (!shellLaunchConfig.icon) {
                shellLaunchConfig.icon = this.getDefaultIcon();
            }
        }
        getDefaultIcon(resource) {
            return this.b.getIcon(this.f.getValue("terminal.integrated.tabs.defaultIcon" /* TerminalSettingId.TabsDefaultIcon */, { resource })) || codicons_1.$Pj.terminal;
        }
        async resolveShellLaunchConfig(shellLaunchConfig, options) {
            // Resolve the shell and shell args
            let resolvedProfile;
            if (shellLaunchConfig.executable) {
                resolvedProfile = await this.u({
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
            shellLaunchConfig.icon = this.n(shellLaunchConfig.icon)
                || this.n(resolvedProfile.icon)
                || this.getDefaultIcon(resource);
            // Override the name if specified
            if (resolvedProfile.overrideName) {
                shellLaunchConfig.name = resolvedProfile.profileName;
            }
            // Apply the color
            shellLaunchConfig.color = shellLaunchConfig.color
                || resolvedProfile.color
                || this.f.getValue("terminal.integrated.tabs.defaultColor" /* TerminalSettingId.TabsDefaultColor */, { resource });
            // Resolve useShellEnvironment based on the setting if it's not set
            if (shellLaunchConfig.useShellEnvironment === undefined) {
                shellLaunchConfig.useShellEnvironment = this.f.getValue("terminal.integrated.inheritEnv" /* TerminalSettingId.InheritEnv */);
            }
        }
        async getDefaultShell(options) {
            return (await this.getDefaultProfile(options)).path;
        }
        async getDefaultShellArgs(options) {
            return (await this.getDefaultProfile(options)).args || [];
        }
        async getDefaultProfile(options) {
            return this.u(await this.o(options), options);
        }
        getEnvironment(remoteAuthority) {
            return this.d.getEnvironment(remoteAuthority);
        }
        n(icon) {
            if (!icon) {
                return undefined;
            }
            if (typeof icon === 'string') {
                return themables_1.ThemeIcon.fromId(icon);
            }
            if (themables_1.ThemeIcon.isThemeIcon(icon)) {
                return icon;
            }
            if (uri_1.URI.isUri(icon) || (0, terminalProfiles_1.$8q)(icon)) {
                return uri_1.URI.revive(icon);
            }
            if (typeof icon === 'object' && 'light' in icon && 'dark' in icon) {
                const castedIcon = icon;
                if ((uri_1.URI.isUri(castedIcon.light) || (0, terminalProfiles_1.$8q)(castedIcon.light)) && (uri_1.URI.isUri(castedIcon.dark) || (0, terminalProfiles_1.$8q)(castedIcon.dark))) {
                    return { light: uri_1.URI.revive(castedIcon.light), dark: uri_1.URI.revive(castedIcon.dark) };
                }
            }
            return undefined;
        }
        async o(options) {
            // If automation shell is allowed, prefer that
            if (options.allowAutomationShell) {
                const automationShellProfile = this.t(options);
                if (automationShellProfile) {
                    return automationShellProfile;
                }
            }
            // Return the real default profile if it exists and is valid, wait for profiles to be ready
            // if the window just opened
            await this.j.profilesReady;
            const defaultProfile = this.r(options.os);
            if (defaultProfile) {
                return this.q(options, defaultProfile);
            }
            // If there is no real default profile, create a fallback default profile based on the shell
            // and shellArgs settings in addition to the current environment.
            return this.q(options, await this.s(options));
        }
        q(options, profile) {
            if (options.allowAutomationShell) {
                const profileClone = (0, objects_1.$Vm)(profile);
                profileClone.icon = codicons_1.$Pj.tools;
                return profileClone;
            }
            return profile;
        }
        r(os) {
            return this.j.getDefaultProfile(os);
        }
        async s(options) {
            const executable = await this.d.getDefaultSystemShell(options.remoteAuthority, options.os);
            // Try select an existing profile to fallback to, based on the default system shell, only do
            // this when it is NOT a local terminal in a remote window where the front and back end OS
            // differs (eg. Windows -> WSL, Mac -> Linux)
            if (options.os === platform_1.OS) {
                let existingProfile = this.j.availableProfiles.find(e => path.$de(e.path).name === path.$de(executable).name);
                if (existingProfile) {
                    if (options.allowAutomationShell) {
                        existingProfile = (0, objects_1.$Vm)(existingProfile);
                        existingProfile.icon = codicons_1.$Pj.tools;
                    }
                    return existingProfile;
                }
            }
            // Finally fallback to a generated profile
            let args;
            if (options.os === 2 /* OperatingSystem.Macintosh */ && path.$de(executable).name.match(/(zsh|bash)/)) {
                // macOS should launch a login shell by default
                args = ['--login'];
            }
            else {
                // Resolve undefined to []
                args = [];
            }
            const icon = this.x(executable);
            return {
                profileName: generatedProfileName,
                path: executable,
                args,
                icon,
                isDefault: false
            };
        }
        t(options) {
            const automationProfile = this.f.getValue(`terminal.integrated.automationProfile.${this.w(options.os)}`);
            if (this.z(automationProfile, options.os)) {
                automationProfile.icon = this.n(automationProfile.icon) || codicons_1.$Pj.tools;
                return automationProfile;
            }
            return undefined;
        }
        async u(profile, options) {
            const env = await this.d.getEnvironment(options.remoteAuthority);
            if (options.os === 1 /* OperatingSystem.Windows */) {
                // Change Sysnative to System32 if the OS is Windows but NOT WoW64. It's
                // safe to assume that this was used by accident as Sysnative does not
                // exist and will break the terminal in non-WoW64 environments.
                const isWoW64 = !!env.hasOwnProperty('PROCESSOR_ARCHITEW6432');
                const windir = env.windir;
                if (!isWoW64 && windir) {
                    const sysnativePath = path.$9d(windir, 'Sysnative').replace(/\//g, '\\').toLowerCase();
                    if (profile.path && profile.path.toLowerCase().indexOf(sysnativePath) === 0) {
                        profile.path = path.$9d(windir, 'System32', profile.path.substr(sysnativePath.length + 1));
                    }
                }
                // Convert / to \ on Windows for convenience
                if (profile.path) {
                    profile.path = profile.path.replace(/\//g, '\\');
                }
            }
            // Resolve path variables
            const activeWorkspaceRootUri = this.h.getLastActiveWorkspaceRoot(options.remoteAuthority ? network_1.Schemas.vscodeRemote : network_1.Schemas.file);
            const lastActiveWorkspace = activeWorkspaceRootUri ? this.k.getWorkspaceFolder(activeWorkspaceRootUri) ?? undefined : undefined;
            profile.path = await this.v(profile.path, env, lastActiveWorkspace);
            // Resolve args variables
            if (profile.args) {
                if (typeof profile.args === 'string') {
                    profile.args = await this.v(profile.args, env, lastActiveWorkspace);
                }
                else {
                    profile.args = await Promise.all(profile.args.map(arg => this.v(arg, env, lastActiveWorkspace)));
                }
            }
            return profile;
        }
        async v(value, env, lastActiveWorkspace) {
            try {
                value = await this.g.resolveWithEnvironment(env, lastActiveWorkspace, value);
            }
            catch (e) {
                this.i.error(`Could not resolve shell`, e);
            }
            return value;
        }
        w(os) {
            switch (os) {
                case 3 /* OperatingSystem.Linux */: return 'linux';
                case 2 /* OperatingSystem.Macintosh */: return 'osx';
                case 1 /* OperatingSystem.Windows */: return 'windows';
            }
        }
        x(shell) {
            const file = path.$de(shell).name;
            switch (file) {
                case 'bash':
                    return codicons_1.$Pj.terminalBash;
                case 'pwsh':
                case 'powershell':
                    return codicons_1.$Pj.terminalPowershell;
                case 'tmux':
                    return codicons_1.$Pj.terminalTmux;
                case 'cmd':
                    return codicons_1.$Pj.terminalCmd;
                default:
                    return undefined;
            }
        }
        y(shellArgs, os) {
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
            const detectedProfile = this.j.availableProfiles?.find(p => {
                if (p.path !== shell) {
                    return false;
                }
                if (p.args === undefined || typeof p.args === 'string') {
                    return p.args === shellArgs;
                }
                return p.path === shell && (0, arrays_1.$sb)(p.args, (shellArgs || []));
            });
            const fallbackProfile = (await this.getDefaultProfile({
                remoteAuthority: this.l.getConnection()?.remoteAuthority,
                os: this.a
            }));
            fallbackProfile.profileName = `${fallbackProfile.path} (migrated)`;
            const profile = detectedProfile || fallbackProfile;
            const args = this.y(shellArgs, this.a) ? shellArgs : profile.args;
            const createdProfile = {
                profileName: profile.profileName,
                path: profile.path,
                args,
                isDefault: true
            };
            if (detectedProfile && detectedProfile.profileName === createdProfile.profileName && detectedProfile.path === createdProfile.path && (0, terminalProfiles_1.$6q)(detectedProfile.args, createdProfile.args)) {
                return detectedProfile.profileName;
            }
            return createdProfile;
        }
        z(profile, os) {
            if (profile === null || profile === undefined || typeof profile !== 'object') {
                return false;
            }
            if ('path' in profile && typeof profile.path === 'string') {
                return true;
            }
            return false;
        }
    }
    exports.$$4b = $$4b;
    __decorate([
        (0, decorators_1.$7g)(200)
    ], $$4b.prototype, "m", null);
    let $_4b = class $_4b extends $$4b {
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
    exports.$_4b = $_4b;
    exports.$_4b = $_4b = __decorate([
        __param(0, configurationResolver_1.$NM),
        __param(1, configuration_1.$8h),
        __param(2, history_1.$SM),
        __param(3, terminal_1.$Zq),
        __param(4, terminal_3.$Pib),
        __param(5, terminal_2.$GM),
        __param(6, workspace_1.$Kh),
        __param(7, remoteAgentService_1.$jm)
    ], $_4b);
});
//# sourceMappingURL=terminalProfileResolverService.js.map