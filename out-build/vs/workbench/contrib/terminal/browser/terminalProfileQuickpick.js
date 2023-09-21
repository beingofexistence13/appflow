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
define(["require", "exports", "vs/base/common/codicons", "vs/platform/configuration/common/configuration", "vs/platform/quickinput/common/quickInput", "vs/workbench/contrib/terminal/browser/terminalIcon", "vs/workbench/contrib/terminal/browser/terminalIcons", "vs/nls!vs/workbench/contrib/terminal/browser/terminalProfileQuickpick", "vs/platform/theme/common/themeService", "vs/base/common/themables", "vs/workbench/contrib/terminal/common/terminal", "vs/platform/theme/common/iconRegistry", "vs/base/common/path", "vs/platform/notification/common/notification"], function (require, exports, codicons_1, configuration_1, quickInput_1, terminalIcon_1, terminalIcons_1, nls, themeService_1, themables_1, terminal_1, iconRegistry_1, path_1, notification_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$rVb = void 0;
    let $rVb = class $rVb {
        constructor(c, d, f, g, h, i) {
            this.c = c;
            this.d = d;
            this.f = f;
            this.g = g;
            this.h = h;
            this.i = i;
        }
        async showAndGetResult(type) {
            const platformKey = await this.c.getPlatformKey();
            const profilesKey = "terminal.integrated.profiles." /* TerminalSettingPrefix.Profiles */ + platformKey;
            const result = await this.j(type);
            const defaultProfileKey = `${"terminal.integrated.defaultProfile." /* TerminalSettingPrefix.DefaultProfile */}${platformKey}`;
            if (!result) {
                return;
            }
            if (type === 'setDefault') {
                if ('command' in result.profile) {
                    return; // Should never happen
                }
                else if ('id' in result.profile) {
                    // extension contributed profile
                    await this.f.updateValue(defaultProfileKey, result.profile.title, 2 /* ConfigurationTarget.USER */);
                    return {
                        config: {
                            extensionIdentifier: result.profile.extensionIdentifier,
                            id: result.profile.id,
                            title: result.profile.title,
                            options: {
                                color: result.profile.color,
                                icon: result.profile.icon
                            }
                        },
                        keyMods: result.keyMods
                    };
                }
                // Add the profile to settings if necessary
                if ('isAutoDetected' in result.profile) {
                    const profilesConfig = await this.f.getValue(profilesKey);
                    if (typeof profilesConfig === 'object') {
                        const newProfile = {
                            path: result.profile.path
                        };
                        if (result.profile.args) {
                            newProfile.args = result.profile.args;
                        }
                        profilesConfig[result.profile.profileName] = newProfile;
                    }
                    await this.f.updateValue(profilesKey, profilesConfig, 2 /* ConfigurationTarget.USER */);
                }
                // Set the default profile
                await this.f.updateValue(defaultProfileKey, result.profileName, 2 /* ConfigurationTarget.USER */);
            }
            else if (type === 'createInstance') {
                if ('id' in result.profile) {
                    return {
                        config: {
                            extensionIdentifier: result.profile.extensionIdentifier,
                            id: result.profile.id,
                            title: result.profile.title,
                            options: {
                                icon: result.profile.icon,
                                color: result.profile.color,
                            }
                        },
                        keyMods: result.keyMods
                    };
                }
                else {
                    return { config: result.profile, keyMods: result.keyMods };
                }
            }
            // for tests
            return 'profileName' in result.profile ? result.profile.profileName : result.profile.title;
        }
        async j(type) {
            const platformKey = await this.c.getPlatformKey();
            const profiles = this.c.availableProfiles;
            const profilesKey = "terminal.integrated.profiles." /* TerminalSettingPrefix.Profiles */ + platformKey;
            const defaultProfileName = this.c.getDefaultProfileName();
            let keyMods;
            const options = {
                placeHolder: type === 'createInstance' ? nls.localize(0, null) : nls.localize(1, null),
                onDidTriggerItemButton: async (context) => {
                    // Get the user's explicit permission to use a potentially unsafe path
                    if (!await this.k(context.item.profile)) {
                        return;
                    }
                    if ('command' in context.item.profile) {
                        return;
                    }
                    if ('id' in context.item.profile) {
                        return;
                    }
                    const configProfiles = this.f.getValue("terminal.integrated.profiles." /* TerminalSettingPrefix.Profiles */ + platformKey);
                    const existingProfiles = !!configProfiles ? Object.keys(configProfiles) : [];
                    const name = await this.g.input({
                        prompt: nls.localize(2, null),
                        value: context.item.profile.profileName,
                        validateInput: async (input) => {
                            if (existingProfiles.includes(input)) {
                                return nls.localize(3, null);
                            }
                            return undefined;
                        }
                    });
                    if (!name) {
                        return;
                    }
                    const newConfigValue = { ...configProfiles };
                    newConfigValue[name] = {
                        path: context.item.profile.path,
                        args: context.item.profile.args
                    };
                    await this.f.updateValue(profilesKey, newConfigValue, 2 /* ConfigurationTarget.USER */);
                },
                onKeyMods: mods => keyMods = mods
            };
            // Build quick pick items
            const quickPickItems = [];
            const configProfiles = profiles.filter(e => !e.isAutoDetected);
            const autoDetectedProfiles = profiles.filter(e => e.isAutoDetected);
            if (configProfiles.length > 0) {
                quickPickItems.push({ type: 'separator', label: nls.localize(4, null) });
                quickPickItems.push(...this.m(configProfiles.map(e => this.l(e)), defaultProfileName));
            }
            quickPickItems.push({ type: 'separator', label: nls.localize(5, null) });
            const contributedProfiles = [];
            for (const contributed of this.c.contributedProfiles) {
                let icon;
                if (typeof contributed.icon === 'string') {
                    if (contributed.icon.startsWith('$(')) {
                        icon = themables_1.ThemeIcon.fromString(contributed.icon);
                    }
                    else {
                        icon = themables_1.ThemeIcon.fromId(contributed.icon);
                    }
                }
                if (!icon || !(0, iconRegistry_1.$0u)().getIcon(icon.id)) {
                    icon = this.d.getDefaultIcon();
                }
                const uriClasses = (0, terminalIcon_1.$Xib)(contributed, this.h.getColorTheme().type, true);
                const colorClass = (0, terminalIcon_1.$Tib)(contributed);
                const iconClasses = [];
                if (uriClasses) {
                    iconClasses.push(...uriClasses);
                }
                if (colorClass) {
                    iconClasses.push(colorClass);
                }
                contributedProfiles.push({
                    label: `$(${icon.id}) ${contributed.title}`,
                    profile: {
                        extensionIdentifier: contributed.extensionIdentifier,
                        title: contributed.title,
                        icon: contributed.icon,
                        id: contributed.id,
                        color: contributed.color
                    },
                    profileName: contributed.title,
                    iconClasses
                });
            }
            if (contributedProfiles.length > 0) {
                quickPickItems.push(...this.m(contributedProfiles, defaultProfileName));
            }
            if (autoDetectedProfiles.length > 0) {
                quickPickItems.push({ type: 'separator', label: nls.localize(6, null) });
                quickPickItems.push(...this.m(autoDetectedProfiles.map(e => this.l(e)), defaultProfileName));
            }
            const styleElement = (0, terminalIcon_1.$Vib)(this.h.getColorTheme());
            document.body.appendChild(styleElement);
            const result = await this.g.pick(quickPickItems, options);
            document.body.removeChild(styleElement);
            if (!result) {
                return undefined;
            }
            if (!await this.k(result.profile)) {
                return undefined;
            }
            if (keyMods) {
                result.keyMods = keyMods;
            }
            return result;
        }
        async k(profile) {
            const isUnsafePath = 'isUnsafePath' in profile && profile.isUnsafePath;
            const requiresUnsafePath = 'requiresUnsafePath' in profile && profile.requiresUnsafePath;
            if (!isUnsafePath && !requiresUnsafePath) {
                return true;
            }
            // Get the user's explicit permission to use a potentially unsafe path
            return await new Promise(r => {
                const unsafePaths = [];
                if (isUnsafePath) {
                    unsafePaths.push(profile.path);
                }
                if (requiresUnsafePath) {
                    unsafePaths.push(requiresUnsafePath);
                }
                // Notify about unsafe path(s). At the time of writing, multiple unsafe paths isn't
                // possible so the message is optimized for a single path.
                const handle = this.i.prompt(notification_1.Severity.Warning, nls.localize(7, null, `"${unsafePaths.join(',')}"`), [{
                        label: nls.localize(8, null),
                        run: () => r(true)
                    }, {
                        label: nls.localize(9, null),
                        run: () => r(false)
                    }]);
                handle.onDidClose(() => r(false));
            });
        }
        l(profile) {
            const buttons = [{
                    iconClass: themables_1.ThemeIcon.asClassName(terminalIcons_1.$rib),
                    tooltip: nls.localize(10, null)
                }];
            const icon = (profile.icon && themables_1.ThemeIcon.isThemeIcon(profile.icon)) ? profile.icon : codicons_1.$Pj.terminal;
            const label = `$(${icon.id}) ${profile.profileName}`;
            const friendlyPath = profile.isFromPath ? (0, path_1.$ae)(profile.path) : profile.path;
            const colorClass = (0, terminalIcon_1.$Tib)(profile);
            const iconClasses = [];
            if (colorClass) {
                iconClasses.push(colorClass);
            }
            if (profile.args) {
                if (typeof profile.args === 'string') {
                    return { label, description: `${profile.path} ${profile.args}`, profile, profileName: profile.profileName, buttons, iconClasses };
                }
                const argsString = profile.args.map(e => {
                    if (e.includes(' ')) {
                        return `"${e.replace(/"/g, '\\"')}"`; // CodeQL [SM02383] js/incomplete-sanitization This is only used as a label on the UI so this isn't a problem
                    }
                    return e;
                }).join(' ');
                return { label, description: `${friendlyPath} ${argsString}`, profile, profileName: profile.profileName, buttons, iconClasses };
            }
            return { label, description: friendlyPath, profile, profileName: profile.profileName, buttons, iconClasses };
        }
        m(items, defaultProfileName) {
            return items.sort((a, b) => {
                if (b.profileName === defaultProfileName) {
                    return 1;
                }
                if (a.profileName === defaultProfileName) {
                    return -1;
                }
                return a.profileName.localeCompare(b.profileName);
            });
        }
    };
    exports.$rVb = $rVb;
    exports.$rVb = $rVb = __decorate([
        __param(0, terminal_1.$GM),
        __param(1, terminal_1.$EM),
        __param(2, configuration_1.$8h),
        __param(3, quickInput_1.$Gq),
        __param(4, themeService_1.$gv),
        __param(5, notification_1.$Yu)
    ], $rVb);
});
//# sourceMappingURL=terminalProfileQuickpick.js.map