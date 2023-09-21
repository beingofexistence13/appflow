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
    exports.$mWb = void 0;
    /*
     * Links TerminalService with TerminalProfileResolverService
     * and keeps the available terminal profiles updated
     */
    let $mWb = class $mWb extends lifecycle_1.$kc {
        get onDidChangeAvailableProfiles() { return this.n.event; }
        get profilesReady() { return this.c; }
        get availableProfiles() {
            if (!this.j) {
                this.refreshAvailableProfiles();
            }
            return this.f || [];
        }
        get contributedProfiles() {
            return this.g || [];
        }
        constructor(r, s, t, u, w, y, z) {
            super();
            this.r = r;
            this.s = s;
            this.t = t;
            this.u = u;
            this.w = w;
            this.y = y;
            this.z = z;
            this.g = [];
            this.j = false;
            this.m = new Map();
            this.n = this.B(new event_1.$fd());
            // in web, we don't want to show the dropdown unless there's a web extension
            // that contributes a profile
            this.u.onDidChangeExtensions(() => this.refreshAvailableProfiles());
            this.a = terminalContextKey_1.TerminalContextKeys.webExtensionContributedProfile.bindTo(this.r);
            this.I();
            this.c = this.w.getEnvironment()
                .then(() => {
                // Wait up to 20 seconds for profiles to be ready so it's assured that we know the actual
                // default terminal before launching the first terminal. This isn't expected to ever take
                // this long.
                this.b = new async_1.$Gg(20000);
                return this.b.wait().then(() => { });
            });
            this.refreshAvailableProfiles();
            this.C();
        }
        async C() {
            const platformKey = await this.getPlatformKey();
            this.s.onDidChangeConfiguration(async (e) => {
                if (e.affectsConfiguration("terminal.integrated.defaultProfile." /* TerminalSettingPrefix.DefaultProfile */ + platformKey) ||
                    e.affectsConfiguration("terminal.integrated.profiles." /* TerminalSettingPrefix.Profiles */ + platformKey) ||
                    e.affectsConfiguration("terminal.integrated.useWslProfiles" /* TerminalSettingId.UseWslProfiles */)) {
                    if (e.source !== 7 /* ConfigurationTarget.DEFAULT */) {
                        // when _refreshPlatformConfig is called within refreshAvailableProfiles
                        // on did change configuration is fired. this can lead to an infinite recursion
                        this.refreshAvailableProfiles();
                        this.j = false;
                    }
                    else {
                        this.j = true;
                    }
                }
            });
        }
        getDefaultProfileName() {
            return this.h;
        }
        getDefaultProfile(os) {
            let defaultProfileName;
            if (os) {
                defaultProfileName = this.s.getValue(`${"terminal.integrated.defaultProfile." /* TerminalSettingPrefix.DefaultProfile */}${this.D(os)}`);
                if (!defaultProfileName || typeof defaultProfileName !== 'string') {
                    return undefined;
                }
            }
            else {
                defaultProfileName = this.h;
            }
            if (!defaultProfileName) {
                return undefined;
            }
            // IMPORTANT: Only allow the default profile name to find non-auto detected profiles as
            // to avoid unsafe path profiles being picked up.
            return this.availableProfiles.find(e => e.profileName === defaultProfileName && !e.isAutoDetected);
        }
        D(os) {
            switch (os) {
                case 3 /* OperatingSystem.Linux */: return 'linux';
                case 2 /* OperatingSystem.Macintosh */: return 'osx';
                case 1 /* OperatingSystem.Windows */: return 'windows';
            }
        }
        refreshAvailableProfiles() {
            this.F();
        }
        async F() {
            const profiles = await this.H(true);
            const profilesChanged = !((0, arrays_1.$sb)(profiles, this.f, profilesEqual));
            const contributedProfilesChanged = await this.G();
            if (profilesChanged || contributedProfilesChanged) {
                this.f = profiles;
                this.n.fire(this.f);
                this.b.open();
                this.I();
                await this.J(this.f);
            }
        }
        async G() {
            const platformKey = await this.getPlatformKey();
            const excludedContributedProfiles = [];
            const configProfiles = this.s.getValue("terminal.integrated.profiles." /* TerminalSettingPrefix.Profiles */ + platformKey);
            for (const [profileName, value] of Object.entries(configProfiles)) {
                if (value === null) {
                    excludedContributedProfiles.push(profileName);
                }
            }
            const filteredContributedProfiles = Array.from(this.t.terminalProfiles.filter(p => !excludedContributedProfiles.includes(p.title)));
            const contributedProfilesChanged = !(0, arrays_1.$sb)(filteredContributedProfiles, this.g, contributedProfilesEqual);
            this.g = filteredContributedProfiles;
            return contributedProfilesChanged;
        }
        getContributedProfileProvider(extensionIdentifier, id) {
            const extMap = this.m.get(extensionIdentifier);
            return extMap?.get(id);
        }
        async H(includeDetectedProfiles) {
            const primaryBackend = await this.z.getBackend(this.y.remoteAuthority);
            if (!primaryBackend) {
                return this.f || [];
            }
            const platform = await this.getPlatformKey();
            this.h = this.s.getValue(`${"terminal.integrated.defaultProfile." /* TerminalSettingPrefix.DefaultProfile */}${platform}`) ?? undefined;
            return primaryBackend.getProfiles(this.s.getValue(`${"terminal.integrated.profiles." /* TerminalSettingPrefix.Profiles */}${platform}`), this.h, includeDetectedProfiles);
        }
        I() {
            this.a.set(platform_1.$o && this.g.length > 0);
        }
        async J(profiles) {
            const env = await this.w.getEnvironment();
            (0, terminalPlatformConfiguration_1.$_q)({ os: env?.os || platform_1.OS, profiles }, this.g);
            (0, terminalActions_1.$MVb)(profiles);
        }
        async getPlatformKey() {
            const env = await this.w.getEnvironment();
            if (env) {
                return env.os === 1 /* OperatingSystem.Windows */ ? 'windows' : (env.os === 2 /* OperatingSystem.Macintosh */ ? 'osx' : 'linux');
            }
            return platform_1.$i ? 'windows' : (platform_1.$j ? 'osx' : 'linux');
        }
        registerTerminalProfileProvider(extensionIdentifier, id, profileProvider) {
            let extMap = this.m.get(extensionIdentifier);
            if (!extMap) {
                extMap = new Map();
                this.m.set(extensionIdentifier, extMap);
            }
            extMap.set(id, profileProvider);
            return (0, lifecycle_1.$ic)(() => this.m.delete(id));
        }
        async registerContributedProfile(args) {
            const platformKey = await this.getPlatformKey();
            const profilesConfig = await this.s.getValue(`${"terminal.integrated.profiles." /* TerminalSettingPrefix.Profiles */}${platformKey}`);
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
            await this.s.updateValue(`${"terminal.integrated.profiles." /* TerminalSettingPrefix.Profiles */}${platformKey}`, profilesConfig, 2 /* ConfigurationTarget.USER */);
            return;
        }
        async getContributedDefaultProfile(shellLaunchConfig) {
            // prevents recursion with the MainThreadTerminalService call to create terminal
            // and defers to the provided launch config when an executable is provided
            if (shellLaunchConfig && !shellLaunchConfig.extHostTerminalId && !('executable' in shellLaunchConfig)) {
                const key = await this.getPlatformKey();
                const defaultProfileName = this.s.getValue(`${"terminal.integrated.defaultProfile." /* TerminalSettingPrefix.DefaultProfile */}${key}`);
                const contributedDefaultProfile = this.contributedProfiles.find(p => p.title === defaultProfileName);
                return contributedDefaultProfile;
            }
            return undefined;
        }
    };
    exports.$mWb = $mWb;
    __decorate([
        (0, decorators_1.$8g)(2000)
    ], $mWb.prototype, "refreshAvailableProfiles", null);
    exports.$mWb = $mWb = __decorate([
        __param(0, contextkey_1.$3i),
        __param(1, configuration_1.$8h),
        __param(2, terminalExtensionPoints_1.$kWb),
        __param(3, extensions_1.$MF),
        __param(4, remoteAgentService_1.$jm),
        __param(5, environmentService_1.$hJ),
        __param(6, terminal_1.$Pib)
    ], $mWb);
    function profilesEqual(one, other) {
        return one.profileName === other.profileName &&
            (0, terminalProfiles_1.$6q)(one.args, other.args) &&
            one.color === other.color &&
            (0, terminalProfiles_1.$7q)(one.icon, other.icon) &&
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
//# sourceMappingURL=terminalProfileService.js.map