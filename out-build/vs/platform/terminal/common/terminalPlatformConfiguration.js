/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/codicons", "vs/base/common/platform", "vs/nls!vs/platform/terminal/common/terminalPlatformConfiguration", "vs/platform/configuration/common/configurationRegistry", "vs/platform/registry/common/platform", "vs/platform/terminal/common/terminalProfiles"], function (require, exports, codicons_1, platform_1, nls_1, configurationRegistry_1, platform_2, terminalProfiles_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$_q = exports.$$q = exports.$0q = exports.$9q = void 0;
    exports.$9q = {
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
    exports.$0q = {
        type: 'string',
        enum: Array.from((0, codicons_1.$Oj)(), icon => icon.id),
        markdownEnumDescriptions: Array.from((0, codicons_1.$Oj)(), icon => `$(${icon.id})`),
    };
    const terminalProfileBaseProperties = {
        args: {
            description: (0, nls_1.localize)(0, null),
            type: 'array',
            items: {
                type: 'string'
            }
        },
        overrideName: {
            description: (0, nls_1.localize)(1, null),
            type: 'boolean'
        },
        icon: {
            description: (0, nls_1.localize)(2, null),
            ...exports.$0q
        },
        color: {
            description: (0, nls_1.localize)(3, null),
            ...exports.$9q
        },
        env: {
            markdownDescription: (0, nls_1.localize)(4, null),
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
                description: (0, nls_1.localize)(5, null),
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
                description: (0, nls_1.localize)(6, null),
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
        return (0, nls_1.localize)(7, null, (0, platform_1.$h)(platform), '```json\n"terminal.integrated.profile.' + key + '": {\n  "bash": null\n}\n```', '[', '](https://code.visualstudio.com/docs/terminal/profiles)');



    }
    const terminalPlatformConfiguration = {
        id: 'terminal',
        order: 100,
        title: (0, nls_1.localize)(8, null),
        type: 'object',
        properties: {
            ["terminal.integrated.automationProfile.linux" /* TerminalSettingId.AutomationProfileLinux */]: {
                restricted: true,
                markdownDescription: (0, nls_1.localize)(9, null),
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
                markdownDescription: (0, nls_1.localize)(10, null),
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
                markdownDescription: (0, nls_1.localize)(11, null, '`terminal.integrated.automationShell.windows`'),
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
                                    description: (0, nls_1.localize)(12, null),
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
                                    description: (0, nls_1.localize)(13, null),
                                    type: 'string'
                                },
                                id: {
                                    description: (0, nls_1.localize)(14, null),
                                    type: 'string'
                                },
                                title: {
                                    description: (0, nls_1.localize)(15, null),
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
                                    description: (0, nls_1.localize)(16, null),
                                    type: 'string'
                                },
                                id: {
                                    description: (0, nls_1.localize)(17, null),
                                    type: 'string'
                                },
                                title: {
                                    description: (0, nls_1.localize)(18, null),
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
                                    description: (0, nls_1.localize)(19, null),
                                    type: 'string'
                                },
                                id: {
                                    description: (0, nls_1.localize)(20, null),
                                    type: 'string'
                                },
                                title: {
                                    description: (0, nls_1.localize)(21, null),
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
                description: (0, nls_1.localize)(22, null),
                type: 'boolean',
                default: true
            },
            ["terminal.integrated.inheritEnv" /* TerminalSettingId.InheritEnv */]: {
                scope: 1 /* ConfigurationScope.APPLICATION */,
                description: (0, nls_1.localize)(23, null),
                type: 'boolean',
                default: true
            },
            ["terminal.integrated.persistentSessionScrollback" /* TerminalSettingId.PersistentSessionScrollback */]: {
                scope: 1 /* ConfigurationScope.APPLICATION */,
                markdownDescription: (0, nls_1.localize)(24, null),
                type: 'number',
                default: 100
            },
            ["terminal.integrated.showLinkHover" /* TerminalSettingId.ShowLinkHover */]: {
                scope: 1 /* ConfigurationScope.APPLICATION */,
                description: (0, nls_1.localize)(25, null),
                type: 'boolean',
                default: true
            },
            ["terminal.integrated.ignoreProcessNames" /* TerminalSettingId.IgnoreProcessNames */]: {
                markdownDescription: (0, nls_1.localize)(26, null, '`#terminal.integrated.confirmOnKill#`'),
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
    function $$q() {
        platform_2.$8m.as(configurationRegistry_1.$an.Configuration).registerConfiguration(terminalPlatformConfiguration);
        $_q();
    }
    exports.$$q = $$q;
    let defaultProfilesConfiguration;
    function $_q(detectedProfiles, extensionContributedProfiles) {
        const registry = platform_2.$8m.as(configurationRegistry_1.$an.Configuration);
        let profileEnum;
        if (detectedProfiles) {
            profileEnum = (0, terminalProfiles_1.$5q)(detectedProfiles?.profiles, extensionContributedProfiles);
        }
        const oldDefaultProfilesConfiguration = defaultProfilesConfiguration;
        defaultProfilesConfiguration = {
            id: 'terminal',
            order: 100,
            title: (0, nls_1.localize)(27, null),
            type: 'object',
            properties: {
                ["terminal.integrated.defaultProfile.linux" /* TerminalSettingId.DefaultProfileLinux */]: {
                    restricted: true,
                    markdownDescription: (0, nls_1.localize)(28, null),
                    type: ['string', 'null'],
                    default: null,
                    enum: detectedProfiles?.os === 3 /* OperatingSystem.Linux */ ? profileEnum?.values : undefined,
                    markdownEnumDescriptions: detectedProfiles?.os === 3 /* OperatingSystem.Linux */ ? profileEnum?.markdownDescriptions : undefined
                },
                ["terminal.integrated.defaultProfile.osx" /* TerminalSettingId.DefaultProfileMacOs */]: {
                    restricted: true,
                    markdownDescription: (0, nls_1.localize)(29, null),
                    type: ['string', 'null'],
                    default: null,
                    enum: detectedProfiles?.os === 2 /* OperatingSystem.Macintosh */ ? profileEnum?.values : undefined,
                    markdownEnumDescriptions: detectedProfiles?.os === 2 /* OperatingSystem.Macintosh */ ? profileEnum?.markdownDescriptions : undefined
                },
                ["terminal.integrated.defaultProfile.windows" /* TerminalSettingId.DefaultProfileWindows */]: {
                    restricted: true,
                    markdownDescription: (0, nls_1.localize)(30, null),
                    type: ['string', 'null'],
                    default: null,
                    enum: detectedProfiles?.os === 1 /* OperatingSystem.Windows */ ? profileEnum?.values : undefined,
                    markdownEnumDescriptions: detectedProfiles?.os === 1 /* OperatingSystem.Windows */ ? profileEnum?.markdownDescriptions : undefined
                },
            }
        };
        registry.updateConfigurations({ add: [defaultProfilesConfiguration], remove: oldDefaultProfilesConfiguration ? [oldDefaultProfilesConfiguration] : [] });
    }
    exports.$_q = $_q;
});
//# sourceMappingURL=terminalPlatformConfiguration.js.map