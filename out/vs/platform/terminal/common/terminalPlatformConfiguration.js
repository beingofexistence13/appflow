/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/codicons", "vs/base/common/platform", "vs/nls", "vs/platform/configuration/common/configurationRegistry", "vs/platform/registry/common/platform", "vs/platform/terminal/common/terminalProfiles"], function (require, exports, codicons_1, platform_1, nls_1, configurationRegistry_1, platform_2, terminalProfiles_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.registerTerminalDefaultProfileConfiguration = exports.registerTerminalPlatformConfiguration = exports.terminalIconSchema = exports.terminalColorSchema = void 0;
    exports.terminalColorSchema = {
        type: ['string', 'null'],
        enum: [
            'terminal.ansiBlack',
            'terminal.ansiRed',
            'terminal.ansiGreen',
            'terminal.ansiYellow',
            'terminal.ansiBlue',
            'terminal.ansiMagenta',
            'terminal.ansiCyan',
            'terminal.ansiWhite'
        ],
        default: null
    };
    exports.terminalIconSchema = {
        type: 'string',
        enum: Array.from((0, codicons_1.getAllCodicons)(), icon => icon.id),
        markdownEnumDescriptions: Array.from((0, codicons_1.getAllCodicons)(), icon => `$(${icon.id})`),
    };
    const terminalProfileBaseProperties = {
        args: {
            description: (0, nls_1.localize)('terminalProfile.args', 'An optional set of arguments to run the shell executable with.'),
            type: 'array',
            items: {
                type: 'string'
            }
        },
        overrideName: {
            description: (0, nls_1.localize)('terminalProfile.overrideName', 'Controls whether or not the profile name overrides the auto detected one.'),
            type: 'boolean'
        },
        icon: {
            description: (0, nls_1.localize)('terminalProfile.icon', 'A codicon ID to associate with the terminal icon.'),
            ...exports.terminalIconSchema
        },
        color: {
            description: (0, nls_1.localize)('terminalProfile.color', 'A theme color ID to associate with the terminal icon.'),
            ...exports.terminalColorSchema
        },
        env: {
            markdownDescription: (0, nls_1.localize)('terminalProfile.env', "An object with environment variables that will be added to the terminal profile process. Set to `null` to delete environment variables from the base environment."),
            type: 'object',
            additionalProperties: {
                type: ['string', 'null']
            },
            default: {}
        }
    };
    const terminalProfileSchema = {
        type: 'object',
        required: ['path'],
        properties: {
            path: {
                description: (0, nls_1.localize)('terminalProfile.path', 'A single path to a shell executable or an array of paths that will be used as fallbacks when one fails.'),
                type: ['string', 'array'],
                items: {
                    type: 'string'
                }
            },
            ...terminalProfileBaseProperties
        }
    };
    const terminalAutomationProfileSchema = {
        type: 'object',
        required: ['path'],
        properties: {
            path: {
                description: (0, nls_1.localize)('terminalAutomationProfile.path', 'A single path to a shell executable.'),
                type: ['string'],
                items: {
                    type: 'string'
                }
            },
            ...terminalProfileBaseProperties
        }
    };
    function createTerminalProfileMarkdownDescription(platform) {
        const key = platform === 2 /* Platform.Linux */ ? 'linux' : platform === 1 /* Platform.Mac */ ? 'osx' : 'windows';
        return (0, nls_1.localize)({
            key: 'terminal.integrated.profile',
            comment: ['{0} is the platform, {1} is a code block, {2} and {3} are a link start and end']
        }, "A set of terminal profile customizations for {0} which allows adding, removing or changing how terminals are launched. Profiles are made up of a mandatory path, optional arguments and other presentation options.\n\nTo override an existing profile use its profile name as the key, for example:\n\n{1}\n\n{2}Read more about configuring profiles{3}.", (0, platform_1.PlatformToString)(platform), '```json\n"terminal.integrated.profile.' + key + '": {\n  "bash": null\n}\n```', '[', '](https://code.visualstudio.com/docs/terminal/profiles)');
    }
    const terminalPlatformConfiguration = {
        id: 'terminal',
        order: 100,
        title: (0, nls_1.localize)('terminalIntegratedConfigurationTitle', "Integrated Terminal"),
        type: 'object',
        properties: {
            ["terminal.integrated.automationProfile.linux" /* TerminalSettingId.AutomationProfileLinux */]: {
                restricted: true,
                markdownDescription: (0, nls_1.localize)('terminal.integrated.automationProfile.linux', "The terminal profile to use on Linux for automation-related terminal usage like tasks and debug."),
                type: ['object', 'null'],
                default: null,
                'anyOf': [
                    { type: 'null' },
                    terminalAutomationProfileSchema
                ],
                defaultSnippets: [
                    {
                        body: {
                            path: '${1}',
                            icon: '${2}'
                        }
                    }
                ]
            },
            ["terminal.integrated.automationProfile.osx" /* TerminalSettingId.AutomationProfileMacOs */]: {
                restricted: true,
                markdownDescription: (0, nls_1.localize)('terminal.integrated.automationProfile.osx', "The terminal profile to use on macOS for automation-related terminal usage like tasks and debug."),
                type: ['object', 'null'],
                default: null,
                'anyOf': [
                    { type: 'null' },
                    terminalAutomationProfileSchema
                ],
                defaultSnippets: [
                    {
                        body: {
                            path: '${1}',
                            icon: '${2}'
                        }
                    }
                ]
            },
            ["terminal.integrated.automationProfile.windows" /* TerminalSettingId.AutomationProfileWindows */]: {
                restricted: true,
                markdownDescription: (0, nls_1.localize)('terminal.integrated.automationProfile.windows', "The terminal profile to use for automation-related terminal usage like tasks and debug. This setting will currently be ignored if {0} (now deprecated) is set.", '`terminal.integrated.automationShell.windows`'),
                type: ['object', 'null'],
                default: null,
                'anyOf': [
                    { type: 'null' },
                    terminalAutomationProfileSchema
                ],
                defaultSnippets: [
                    {
                        body: {
                            path: '${1}',
                            icon: '${2}'
                        }
                    }
                ]
            },
            ["terminal.integrated.profiles.windows" /* TerminalSettingId.ProfilesWindows */]: {
                restricted: true,
                markdownDescription: createTerminalProfileMarkdownDescription(3 /* Platform.Windows */),
                type: 'object',
                default: {
                    'PowerShell': {
                        source: 'PowerShell',
                        icon: 'terminal-powershell'
                    },
                    'Command Prompt': {
                        path: [
                            '${env:windir}\\Sysnative\\cmd.exe',
                            '${env:windir}\\System32\\cmd.exe'
                        ],
                        args: [],
                        icon: 'terminal-cmd'
                    },
                    'Git Bash': {
                        source: 'Git Bash'
                    }
                },
                additionalProperties: {
                    'anyOf': [
                        {
                            type: 'object',
                            required: ['source'],
                            properties: {
                                source: {
                                    description: (0, nls_1.localize)('terminalProfile.windowsSource', 'A profile source that will auto detect the paths to the shell. Note that non-standard executable locations are not supported and must be created manually in a new profile.'),
                                    enum: ['PowerShell', 'Git Bash']
                                },
                                ...terminalProfileBaseProperties
                            }
                        },
                        {
                            type: 'object',
                            required: ['extensionIdentifier', 'id', 'title'],
                            properties: {
                                extensionIdentifier: {
                                    description: (0, nls_1.localize)('terminalProfile.windowsExtensionIdentifier', 'The extension that contributed this profile.'),
                                    type: 'string'
                                },
                                id: {
                                    description: (0, nls_1.localize)('terminalProfile.windowsExtensionId', 'The id of the extension terminal'),
                                    type: 'string'
                                },
                                title: {
                                    description: (0, nls_1.localize)('terminalProfile.windowsExtensionTitle', 'The name of the extension terminal'),
                                    type: 'string'
                                },
                                ...terminalProfileBaseProperties
                            }
                        },
                        { type: 'null' },
                        terminalProfileSchema
                    ]
                }
            },
            ["terminal.integrated.profiles.osx" /* TerminalSettingId.ProfilesMacOs */]: {
                restricted: true,
                markdownDescription: createTerminalProfileMarkdownDescription(1 /* Platform.Mac */),
                type: 'object',
                default: {
                    'bash': {
                        path: 'bash',
                        args: ['-l'],
                        icon: 'terminal-bash'
                    },
                    'zsh': {
                        path: 'zsh',
                        args: ['-l']
                    },
                    'fish': {
                        path: 'fish',
                        args: ['-l']
                    },
                    'tmux': {
                        path: 'tmux',
                        icon: 'terminal-tmux'
                    },
                    'pwsh': {
                        path: 'pwsh',
                        icon: 'terminal-powershell'
                    }
                },
                additionalProperties: {
                    'anyOf': [
                        {
                            type: 'object',
                            required: ['extensionIdentifier', 'id', 'title'],
                            properties: {
                                extensionIdentifier: {
                                    description: (0, nls_1.localize)('terminalProfile.osxExtensionIdentifier', 'The extension that contributed this profile.'),
                                    type: 'string'
                                },
                                id: {
                                    description: (0, nls_1.localize)('terminalProfile.osxExtensionId', 'The id of the extension terminal'),
                                    type: 'string'
                                },
                                title: {
                                    description: (0, nls_1.localize)('terminalProfile.osxExtensionTitle', 'The name of the extension terminal'),
                                    type: 'string'
                                },
                                ...terminalProfileBaseProperties
                            }
                        },
                        { type: 'null' },
                        terminalProfileSchema
                    ]
                }
            },
            ["terminal.integrated.profiles.linux" /* TerminalSettingId.ProfilesLinux */]: {
                restricted: true,
                markdownDescription: createTerminalProfileMarkdownDescription(2 /* Platform.Linux */),
                type: 'object',
                default: {
                    'bash': {
                        path: 'bash',
                        icon: 'terminal-bash'
                    },
                    'zsh': {
                        path: 'zsh'
                    },
                    'fish': {
                        path: 'fish'
                    },
                    'tmux': {
                        path: 'tmux',
                        icon: 'terminal-tmux'
                    },
                    'pwsh': {
                        path: 'pwsh',
                        icon: 'terminal-powershell'
                    }
                },
                additionalProperties: {
                    'anyOf': [
                        {
                            type: 'object',
                            required: ['extensionIdentifier', 'id', 'title'],
                            properties: {
                                extensionIdentifier: {
                                    description: (0, nls_1.localize)('terminalProfile.linuxExtensionIdentifier', 'The extension that contributed this profile.'),
                                    type: 'string'
                                },
                                id: {
                                    description: (0, nls_1.localize)('terminalProfile.linuxExtensionId', 'The id of the extension terminal'),
                                    type: 'string'
                                },
                                title: {
                                    description: (0, nls_1.localize)('terminalProfile.linuxExtensionTitle', 'The name of the extension terminal'),
                                    type: 'string'
                                },
                                ...terminalProfileBaseProperties
                            }
                        },
                        { type: 'null' },
                        terminalProfileSchema
                    ]
                }
            },
            ["terminal.integrated.useWslProfiles" /* TerminalSettingId.UseWslProfiles */]: {
                description: (0, nls_1.localize)('terminal.integrated.useWslProfiles', 'Controls whether or not WSL distros are shown in the terminal dropdown'),
                type: 'boolean',
                default: true
            },
            ["terminal.integrated.inheritEnv" /* TerminalSettingId.InheritEnv */]: {
                scope: 1 /* ConfigurationScope.APPLICATION */,
                description: (0, nls_1.localize)('terminal.integrated.inheritEnv', "Whether new shells should inherit their environment from VS Code, which may source a login shell to ensure $PATH and other development variables are initialized. This has no effect on Windows."),
                type: 'boolean',
                default: true
            },
            ["terminal.integrated.persistentSessionScrollback" /* TerminalSettingId.PersistentSessionScrollback */]: {
                scope: 1 /* ConfigurationScope.APPLICATION */,
                markdownDescription: (0, nls_1.localize)('terminal.integrated.persistentSessionScrollback', "Controls the maximum amount of lines that will be restored when reconnecting to a persistent terminal session. Increasing this will restore more lines of scrollback at the cost of more memory and increase the time it takes to connect to terminals on start up. This setting requires a restart to take effect and should be set to a value less than or equal to `#terminal.integrated.scrollback#`."),
                type: 'number',
                default: 100
            },
            ["terminal.integrated.showLinkHover" /* TerminalSettingId.ShowLinkHover */]: {
                scope: 1 /* ConfigurationScope.APPLICATION */,
                description: (0, nls_1.localize)('terminal.integrated.showLinkHover', "Whether to show hovers for links in the terminal output."),
                type: 'boolean',
                default: true
            },
            ["terminal.integrated.ignoreProcessNames" /* TerminalSettingId.IgnoreProcessNames */]: {
                markdownDescription: (0, nls_1.localize)('terminal.integrated.confirmIgnoreProcesses', "A set of process names to ignore when using the {0} setting.", '`#terminal.integrated.confirmOnKill#`'),
                type: 'array',
                items: {
                    type: 'string',
                    uniqueItems: true
                },
                default: [
                    // Popular prompt programs, these should not count as child processes
                    'starship',
                    'oh-my-posh',
                    // Git bash may runs a subprocess of itself (bin\bash.exe -> usr\bin\bash.exe)
                    'bash',
                    'zsh',
                ]
            }
        }
    };
    /**
     * Registers terminal configurations required by shared process and remote server.
     */
    function registerTerminalPlatformConfiguration() {
        platform_2.Registry.as(configurationRegistry_1.Extensions.Configuration).registerConfiguration(terminalPlatformConfiguration);
        registerTerminalDefaultProfileConfiguration();
    }
    exports.registerTerminalPlatformConfiguration = registerTerminalPlatformConfiguration;
    let defaultProfilesConfiguration;
    function registerTerminalDefaultProfileConfiguration(detectedProfiles, extensionContributedProfiles) {
        const registry = platform_2.Registry.as(configurationRegistry_1.Extensions.Configuration);
        let profileEnum;
        if (detectedProfiles) {
            profileEnum = (0, terminalProfiles_1.createProfileSchemaEnums)(detectedProfiles?.profiles, extensionContributedProfiles);
        }
        const oldDefaultProfilesConfiguration = defaultProfilesConfiguration;
        defaultProfilesConfiguration = {
            id: 'terminal',
            order: 100,
            title: (0, nls_1.localize)('terminalIntegratedConfigurationTitle', "Integrated Terminal"),
            type: 'object',
            properties: {
                ["terminal.integrated.defaultProfile.linux" /* TerminalSettingId.DefaultProfileLinux */]: {
                    restricted: true,
                    markdownDescription: (0, nls_1.localize)('terminal.integrated.defaultProfile.linux', "The default terminal profile on Linux."),
                    type: ['string', 'null'],
                    default: null,
                    enum: detectedProfiles?.os === 3 /* OperatingSystem.Linux */ ? profileEnum?.values : undefined,
                    markdownEnumDescriptions: detectedProfiles?.os === 3 /* OperatingSystem.Linux */ ? profileEnum?.markdownDescriptions : undefined
                },
                ["terminal.integrated.defaultProfile.osx" /* TerminalSettingId.DefaultProfileMacOs */]: {
                    restricted: true,
                    markdownDescription: (0, nls_1.localize)('terminal.integrated.defaultProfile.osx', "The default terminal profile on macOS."),
                    type: ['string', 'null'],
                    default: null,
                    enum: detectedProfiles?.os === 2 /* OperatingSystem.Macintosh */ ? profileEnum?.values : undefined,
                    markdownEnumDescriptions: detectedProfiles?.os === 2 /* OperatingSystem.Macintosh */ ? profileEnum?.markdownDescriptions : undefined
                },
                ["terminal.integrated.defaultProfile.windows" /* TerminalSettingId.DefaultProfileWindows */]: {
                    restricted: true,
                    markdownDescription: (0, nls_1.localize)('terminal.integrated.defaultProfile.windows', "The default terminal profile on Windows."),
                    type: ['string', 'null'],
                    default: null,
                    enum: detectedProfiles?.os === 1 /* OperatingSystem.Windows */ ? profileEnum?.values : undefined,
                    markdownEnumDescriptions: detectedProfiles?.os === 1 /* OperatingSystem.Windows */ ? profileEnum?.markdownDescriptions : undefined
                },
            }
        };
        registry.updateConfigurations({ add: [defaultProfilesConfiguration], remove: oldDefaultProfilesConfiguration ? [oldDefaultProfilesConfiguration] : [] });
    }
    exports.registerTerminalDefaultProfileConfiguration = registerTerminalDefaultProfileConfiguration;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVybWluYWxQbGF0Zm9ybUNvbmZpZ3VyYXRpb24uanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9wbGF0Zm9ybS90ZXJtaW5hbC9jb21tb24vdGVybWluYWxQbGF0Zm9ybUNvbmZpZ3VyYXRpb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBV25GLFFBQUEsbUJBQW1CLEdBQWdCO1FBQy9DLElBQUksRUFBRSxDQUFDLFFBQVEsRUFBRSxNQUFNLENBQUM7UUFDeEIsSUFBSSxFQUFFO1lBQ0wsb0JBQW9CO1lBQ3BCLGtCQUFrQjtZQUNsQixvQkFBb0I7WUFDcEIscUJBQXFCO1lBQ3JCLG1CQUFtQjtZQUNuQixzQkFBc0I7WUFDdEIsbUJBQW1CO1lBQ25CLG9CQUFvQjtTQUNwQjtRQUNELE9BQU8sRUFBRSxJQUFJO0tBQ2IsQ0FBQztJQUVXLFFBQUEsa0JBQWtCLEdBQWdCO1FBQzlDLElBQUksRUFBRSxRQUFRO1FBQ2QsSUFBSSxFQUFFLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBQSx5QkFBYyxHQUFFLEVBQUUsSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDO1FBQ25ELHdCQUF3QixFQUFFLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBQSx5QkFBYyxHQUFFLEVBQUUsSUFBSSxDQUFDLEVBQUUsQ0FBQyxLQUFLLElBQUksQ0FBQyxFQUFFLEdBQUcsQ0FBQztLQUMvRSxDQUFDO0lBRUYsTUFBTSw2QkFBNkIsR0FBbUI7UUFDckQsSUFBSSxFQUFFO1lBQ0wsV0FBVyxFQUFFLElBQUEsY0FBUSxFQUFDLHNCQUFzQixFQUFFLGdFQUFnRSxDQUFDO1lBQy9HLElBQUksRUFBRSxPQUFPO1lBQ2IsS0FBSyxFQUFFO2dCQUNOLElBQUksRUFBRSxRQUFRO2FBQ2Q7U0FDRDtRQUNELFlBQVksRUFBRTtZQUNiLFdBQVcsRUFBRSxJQUFBLGNBQVEsRUFB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