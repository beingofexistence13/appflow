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
define(["require", "exports", "vs/base/common/codicons", "vs/platform/configuration/common/configuration", "vs/platform/quickinput/common/quickInput", "vs/workbench/contrib/terminal/browser/terminalIcon", "vs/workbench/contrib/terminal/browser/terminalIcons", "vs/nls", "vs/platform/theme/common/themeService", "vs/base/common/themables", "vs/workbench/contrib/terminal/common/terminal", "vs/platform/theme/common/iconRegistry", "vs/base/common/path", "vs/platform/notification/common/notification"], function (require, exports, codicons_1, configuration_1, quickInput_1, terminalIcon_1, terminalIcons_1, nls, themeService_1, themables_1, terminal_1, iconRegistry_1, path_1, notification_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TerminalProfileQuickpick = void 0;
    let TerminalProfileQuickpick = class TerminalProfileQuickpick {
        constructor(_terminalProfileService, _terminalProfileResolverService, _configurationService, _quickInputService, _themeService, _notificationService) {
            this._terminalProfileService = _terminalProfileService;
            this._terminalProfileResolverService = _terminalProfileResolverService;
            this._configurationService = _configurationService;
            this._quickInputService = _quickInputService;
            this._themeService = _themeService;
            this._notificationService = _notificationService;
        }
        async showAndGetResult(type) {
            const platformKey = await this._terminalProfileService.getPlatformKey();
            const profilesKey = "terminal.integrated.profiles." /* TerminalSettingPrefix.Profiles */ + platformKey;
            const result = await this._createAndShow(type);
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
                    await this._configurationService.updateValue(defaultProfileKey, result.profile.title, 2 /* ConfigurationTarget.USER */);
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
                    const profilesConfig = await this._configurationService.getValue(profilesKey);
                    if (typeof profilesConfig === 'object') {
                        const newProfile = {
                            path: result.profile.path
                        };
                        if (result.profile.args) {
                            newProfile.args = result.profile.args;
                        }
                        profilesConfig[result.profile.profileName] = newProfile;
                    }
                    await this._configurationService.updateValue(profilesKey, profilesConfig, 2 /* ConfigurationTarget.USER */);
                }
                // Set the default profile
                await this._configurationService.updateValue(defaultProfileKey, result.profileName, 2 /* ConfigurationTarget.USER */);
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
        async _createAndShow(type) {
            const platformKey = await this._terminalProfileService.getPlatformKey();
            const profiles = this._terminalProfileService.availableProfiles;
            const profilesKey = "terminal.integrated.profiles." /* TerminalSettingPrefix.Profiles */ + platformKey;
            const defaultProfileName = this._terminalProfileService.getDefaultProfileName();
            let keyMods;
            const options = {
                placeHolder: type === 'createInstance' ? nls.localize('terminal.integrated.selectProfileToCreate', "Select the terminal profile to create") : nls.localize('terminal.integrated.chooseDefaultProfile', "Select your default terminal profile"),
                onDidTriggerItemButton: async (context) => {
                    // Get the user's explicit permission to use a potentially unsafe path
                    if (!await this._isProfileSafe(context.item.profile)) {
                        return;
                    }
                    if ('command' in context.item.profile) {
                        return;
                    }
                    if ('id' in context.item.profile) {
                        return;
                    }
                    const configProfiles = this._configurationService.getValue("terminal.integrated.profiles." /* TerminalSettingPrefix.Profiles */ + platformKey);
                    const existingProfiles = !!configProfiles ? Object.keys(configProfiles) : [];
                    const name = await this._quickInputService.input({
                        prompt: nls.localize('enterTerminalProfileName', "Enter terminal profile name"),
                        value: context.item.profile.profileName,
                        validateInput: async (input) => {
                            if (existingProfiles.includes(input)) {
                                return nls.localize('terminalProfileAlreadyExists', "A terminal profile already exists with that name");
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
                    await this._configurationService.updateValue(profilesKey, newConfigValue, 2 /* ConfigurationTarget.USER */);
                },
                onKeyMods: mods => keyMods = mods
            };
            // Build quick pick items
            const quickPickItems = [];
            const configProfiles = profiles.filter(e => !e.isAutoDetected);
            const autoDetectedProfiles = profiles.filter(e => e.isAutoDetected);
            if (configProfiles.length > 0) {
                quickPickItems.push({ type: 'separator', label: nls.localize('terminalProfiles', "profiles") });
                quickPickItems.push(...this._sortProfileQuickPickItems(configProfiles.map(e => this._createProfileQuickPickItem(e)), defaultProfileName));
            }
            quickPickItems.push({ type: 'separator', label: nls.localize('ICreateContributedTerminalProfileOptions', "contributed") });
            const contributedProfiles = [];
            for (const contributed of this._terminalProfileService.contributedProfiles) {
                let icon;
                if (typeof contributed.icon === 'string') {
                    if (contributed.icon.startsWith('$(')) {
                        icon = themables_1.ThemeIcon.fromString(contributed.icon);
                    }
                    else {
                        icon = themables_1.ThemeIcon.fromId(contributed.icon);
                    }
                }
                if (!icon || !(0, iconRegistry_1.getIconRegistry)().getIcon(icon.id)) {
                    icon = this._terminalProfileResolverService.getDefaultIcon();
                }
                const uriClasses = (0, terminalIcon_1.getUriClasses)(contributed, this._themeService.getColorTheme().type, true);
                const colorClass = (0, terminalIcon_1.getColorClass)(contributed);
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
                quickPickItems.push(...this._sortProfileQuickPickItems(contributedProfiles, defaultProfileName));
            }
            if (autoDetectedProfiles.length > 0) {
                quickPickItems.push({ type: 'separator', label: nls.localize('terminalProfiles.detected', "detected") });
                quickPickItems.push(...this._sortProfileQuickPickItems(autoDetectedProfiles.map(e => this._createProfileQuickPickItem(e)), defaultProfileName));
            }
            const styleElement = (0, terminalIcon_1.getColorStyleElement)(this._themeService.getColorTheme());
            document.body.appendChild(styleElement);
            const result = await this._quickInputService.pick(quickPickItems, options);
            document.body.removeChild(styleElement);
            if (!result) {
                return undefined;
            }
            if (!await this._isProfileSafe(result.profile)) {
                return undefined;
            }
            if (keyMods) {
                result.keyMods = keyMods;
            }
            return result;
        }
        async _isProfileSafe(profile) {
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
                const handle = this._notificationService.prompt(notification_1.Severity.Warning, nls.localize('unsafePathWarning', 'This terminal profile uses a potentially unsafe path that can be modified by another user: {0}. Are you sure you want to use it?', `"${unsafePaths.join(',')}"`), [{
                        label: nls.localize('yes', 'Yes'),
                        run: () => r(true)
                    }, {
                        label: nls.localize('cancel', 'Cancel'),
                        run: () => r(false)
                    }]);
                handle.onDidClose(() => r(false));
            });
        }
        _createProfileQuickPickItem(profile) {
            const buttons = [{
                    iconClass: themables_1.ThemeIcon.asClassName(terminalIcons_1.configureTerminalProfileIcon),
                    tooltip: nls.localize('createQuickLaunchProfile', "Configure Terminal Profile")
                }];
            const icon = (profile.icon && themables_1.ThemeIcon.isThemeIcon(profile.icon)) ? profile.icon : codicons_1.Codicon.terminal;
            const label = `$(${icon.id}) ${profile.profileName}`;
            const friendlyPath = profile.isFromPath ? (0, path_1.basename)(profile.path) : profile.path;
            const colorClass = (0, terminalIcon_1.getColorClass)(profile);
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
        _sortProfileQuickPickItems(items, defaultProfileName) {
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
    exports.TerminalProfileQuickpick = TerminalProfileQuickpick;
    exports.TerminalProfileQuickpick = TerminalProfileQuickpick = __decorate([
        __param(0, terminal_1.ITerminalProfileService),
        __param(1, terminal_1.ITerminalProfileResolverService),
        __param(2, configuration_1.IConfigurationService),
        __param(3, quickInput_1.IQuickInputService),
        __param(4, themeService_1.IThemeService),
        __param(5, notification_1.INotificationService)
    ], TerminalProfileQuickpick);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVybWluYWxQcm9maWxlUXVpY2twaWNrLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvdGVybWluYWwvYnJvd3Nlci90ZXJtaW5hbFByb2ZpbGVRdWlja3BpY2sudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBb0J6RixJQUFNLHdCQUF3QixHQUE5QixNQUFNLHdCQUF3QjtRQUNwQyxZQUMyQyx1QkFBZ0QsRUFDeEMsK0JBQWdFLEVBQzFFLHFCQUE0QyxFQUMvQyxrQkFBc0MsRUFDM0MsYUFBNEIsRUFDckIsb0JBQTBDO1lBTHZDLDRCQUF1QixHQUF2Qix1QkFBdUIsQ0FBeUI7WUFDeEMsb0NBQStCLEdBQS9CLCtCQUErQixDQUFpQztZQUMxRSwwQkFBcUIsR0FBckIscUJBQXFCLENBQXVCO1lBQy9DLHVCQUFrQixHQUFsQixrQkFBa0IsQ0FBb0I7WUFDM0Msa0JBQWEsR0FBYixhQUFhLENBQWU7WUFDckIseUJBQW9CLEdBQXBCLG9CQUFvQixDQUFzQjtRQUM5RSxDQUFDO1FBRUwsS0FBSyxDQUFDLGdCQUFnQixDQUFDLElBQXFDO1lBQzNELE1BQU0sV0FBVyxHQUFHLE1BQU0sSUFBSSxDQUFDLHVCQUF1QixDQUFDLGNBQWMsRUFBRSxDQUFDO1lBQ3hFLE1BQU0sV0FBVyxHQUFHLHVFQUFpQyxXQUFXLENBQUM7WUFDakUsTUFBTSxNQUFNLEdBQUcsTUFBTSxJQUFJLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQy9DLE1BQU0saUJBQWlCLEdBQUcsR0FBRyxnRkFBb0MsR0FBRyxXQUFXLEVBQUUsQ0FBQztZQUNsRixJQUFJLENBQUMsTUFBTSxFQUFFO2dCQUNaLE9BQU87YUFDUDtZQUNELElBQUksSUFBSSxLQUFLLFlBQVksRUFBRTtnQkFDMUIsSUFBSSxTQUFTLElBQUksTUFBTSxDQUFDLE9B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