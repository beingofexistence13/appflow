/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls!vs/workbench/contrib/welcomeGettingStarted/common/gettingStartedContent", "vs/base/common/codicons", "vs/platform/theme/common/iconRegistry", "vs/workbench/contrib/notebook/common/notebookCommon", "vs/workbench/contrib/welcomeGettingStarted/common/media/theme_picker", "vs/workbench/contrib/welcomeGettingStarted/common/media/notebookProfile"], function (require, exports, nls_1, codicons_1, iconRegistry_1, notebookCommon_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$UXb = exports.$TXb = void 0;
    const setupIcon = (0, iconRegistry_1.$9u)('getting-started-setup', codicons_1.$Pj.zap, (0, nls_1.localize)(0, null));
    const beginnerIcon = (0, iconRegistry_1.$9u)('getting-started-beginner', codicons_1.$Pj.lightbulb, (0, nls_1.localize)(1, null));
    const intermediateIcon = (0, iconRegistry_1.$9u)('getting-started-intermediate', codicons_1.$Pj.mortarBoard, (0, nls_1.localize)(2, null));
    exports.$TXb = [
        {
            id: 'welcome.showNewFileEntries',
            title: (0, nls_1.localize)(3, null),
            description: (0, nls_1.localize)(4, null),
            icon: codicons_1.$Pj.newFile,
            content: {
                type: 'startEntry',
                command: 'command:welcome.showNewFileEntries',
            }
        },
        {
            id: 'topLevelOpenMac',
            title: (0, nls_1.localize)(5, null),
            description: (0, nls_1.localize)(6, null),
            icon: codicons_1.$Pj.folderOpened,
            when: '!isWeb && isMac',
            content: {
                type: 'startEntry',
                command: 'command:workbench.action.files.openFileFolder',
            }
        },
        {
            id: 'topLevelOpenFile',
            title: (0, nls_1.localize)(7, null),
            description: (0, nls_1.localize)(8, null),
            icon: codicons_1.$Pj.goToFile,
            when: 'isWeb || !isMac',
            content: {
                type: 'startEntry',
                command: 'command:workbench.action.files.openFile',
            }
        },
        {
            id: 'topLevelOpenFolder',
            title: (0, nls_1.localize)(9, null),
            description: (0, nls_1.localize)(10, null),
            icon: codicons_1.$Pj.folderOpened,
            when: '!isWeb && !isMac',
            content: {
                type: 'startEntry',
                command: 'command:workbench.action.files.openFolder',
            }
        },
        {
            id: 'topLevelOpenFolderWeb',
            title: (0, nls_1.localize)(11, null),
            description: (0, nls_1.localize)(12, null),
            icon: codicons_1.$Pj.folderOpened,
            when: '!openFolderWorkspaceSupport && workbenchState == \'workspace\'',
            content: {
                type: 'startEntry',
                command: 'command:workbench.action.files.openFolderViaWorkspace',
            }
        },
        {
            id: 'topLevelGitClone',
            title: (0, nls_1.localize)(13, null),
            description: (0, nls_1.localize)(14, null),
            when: 'config.git.enabled && !git.missing',
            icon: codicons_1.$Pj.sourceControl,
            content: {
                type: 'startEntry',
                command: 'command:git.clone',
            }
        },
        {
            id: 'topLevelGitOpen',
            title: (0, nls_1.localize)(15, null),
            description: (0, nls_1.localize)(16, null),
            when: 'workspacePlatform == \'webworker\'',
            icon: codicons_1.$Pj.sourceControl,
            content: {
                type: 'startEntry',
                command: 'command:remoteHub.openRepository',
            }
        },
        {
            id: 'topLevelShowWalkthroughs',
            title: (0, nls_1.localize)(17, null),
            description: (0, nls_1.localize)(18, null),
            icon: codicons_1.$Pj.checklist,
            when: 'allWalkthroughsHidden',
            content: {
                type: 'startEntry',
                command: 'command:welcome.showAllWalkthroughs',
            }
        },
        {
            id: 'topLevelRemoteOpen',
            title: (0, nls_1.localize)(19, null),
            description: (0, nls_1.localize)(20, null),
            when: '!isWeb',
            icon: codicons_1.$Pj.remote,
            content: {
                type: 'startEntry',
                command: 'command:workbench.action.remote.showMenu',
            }
        },
        {
            id: 'topLevelOpenTunnel',
            title: (0, nls_1.localize)(21, null),
            description: (0, nls_1.localize)(22, null),
            when: 'isWeb && showRemoteStartEntryInWeb',
            icon: codicons_1.$Pj.remote,
            content: {
                type: 'startEntry',
                command: 'command:workbench.action.remote.showWebStartEntryActions',
            }
        },
    ];
    const Button = (title, href) => `[${title}](${href})`;
    exports.$UXb = [
        {
            id: 'Setup',
            title: (0, nls_1.localize)(23, null),
            description: (0, nls_1.localize)(24, null),
            isFeatured: true,
            icon: setupIcon,
            when: '!isWeb',
            next: 'Beginner',
            content: {
                type: 'steps',
                steps: [
                    {
                        id: 'pickColorTheme',
                        title: (0, nls_1.localize)(25, null),
                        description: (0, nls_1.localize)(26, null, Button((0, nls_1.localize)(27, null), 'command:workbench.action.selectTheme')),
                        completionEvents: [
                            'onSettingChanged:workbench.colorTheme',
                            'onCommand:workbench.action.selectTheme'
                        ],
                        media: { type: 'markdown', path: 'theme_picker', }
                    },
                    {
                        id: 'settingsSync',
                        title: (0, nls_1.localize)(28, null),
                        description: (0, nls_1.localize)(29, null, Button((0, nls_1.localize)(30, null), 'command:workbench.userDataSync.actions.turnOn')),
                        when: 'syncStatus != uninitialized',
                        completionEvents: ['onEvent:sync-enabled'],
                        media: {
                            type: 'svg', altText: 'The "Turn on Sync" entry in the settings gear menu.', path: 'settingsSync.svg'
                        },
                    },
                    {
                        id: 'commandPaletteTask',
                        title: (0, nls_1.localize)(31, null),
                        description: (0, nls_1.localize)(32, null, Button((0, nls_1.localize)(33, null), 'command:workbench.action.showCommands')),
                        media: { type: 'svg', altText: 'Command Palette overlay for searching and executing commands.', path: 'commandPalette.svg' },
                    },
                    {
                        id: 'extensionsWeb',
                        title: (0, nls_1.localize)(34, null),
                        description: (0, nls_1.localize)(35, null, Button((0, nls_1.localize)(36, null), 'command:workbench.extensions.action.showPopularExtensions')),
                        when: 'workspacePlatform == \'webworker\'',
                        media: {
                            type: 'svg', altText: 'VS Code extension marketplace with featured language extensions', path: 'extensions-web.svg'
                        },
                    },
                    {
                        id: 'findLanguageExtensions',
                        title: (0, nls_1.localize)(37, null),
                        description: (0, nls_1.localize)(38, null, Button((0, nls_1.localize)(39, null), 'command:workbench.extensions.action.showLanguageExtensions')),
                        when: 'workspacePlatform != \'webworker\'',
                        media: {
                            type: 'svg', altText: 'Language extensions', path: 'languages.svg'
                        },
                    },
                    {
                        id: 'pickAFolderTask-Mac',
                        title: (0, nls_1.localize)(40, null),
                        description: (0, nls_1.localize)(41, null, Button((0, nls_1.localize)(42, null), 'command:workbench.action.files.openFileFolder')),
                        when: 'isMac && workspaceFolderCount == 0',
                        media: {
                            type: 'svg', altText: 'Explorer view showing buttons for opening folder and cloning repository.', path: 'openFolder.svg'
                        }
                    },
                    {
                        id: 'pickAFolderTask-Other',
                        title: (0, nls_1.localize)(43, null),
                        description: (0, nls_1.localize)(44, null, Button((0, nls_1.localize)(45, null), 'command:workbench.action.files.openFolder')),
                        when: '!isMac && workspaceFolderCount == 0',
                        media: {
                            type: 'svg', altText: 'Explorer view showing buttons for opening folder and cloning repository.', path: 'openFolder.svg'
                        }
                    },
                    {
                        id: 'quickOpen',
                        title: (0, nls_1.localize)(46, null),
                        description: (0, nls_1.localize)(47, null, Button((0, nls_1.localize)(48, null), 'command:toSide:workbench.action.quickOpen')),
                        when: 'workspaceFolderCount != 0',
                        media: {
                            type: 'svg', altText: 'Go to file in quick search.', path: 'search.svg'
                        }
                    }
                ]
            }
        },
        {
            id: 'SetupWeb',
            title: (0, nls_1.localize)(49, null),
            description: (0, nls_1.localize)(50, null),
            isFeatured: true,
            icon: setupIcon,
            when: 'isWeb',
            next: 'Beginner',
            content: {
                type: 'steps',
                steps: [
                    {
                        id: 'pickColorThemeWeb',
                        title: (0, nls_1.localize)(51, null),
                        description: (0, nls_1.localize)(52, null, Button((0, nls_1.localize)(53, null), 'command:workbench.action.selectTheme')),
                        completionEvents: [
                            'onSettingChanged:workbench.colorTheme',
                            'onCommand:workbench.action.selectTheme'
                        ],
                        media: { type: 'markdown', path: 'theme_picker', }
                    },
                    {
                        id: 'settingsSyncWeb',
                        title: (0, nls_1.localize)(54, null),
                        description: (0, nls_1.localize)(55, null, Button((0, nls_1.localize)(56, null), 'command:workbench.userDataSync.actions.turnOn')),
                        when: 'syncStatus != uninitialized',
                        completionEvents: ['onEvent:sync-enabled'],
                        media: {
                            type: 'svg', altText: 'The "Turn on Sync" entry in the settings gear menu.', path: 'settingsSync.svg'
                        },
                    },
                    {
                        id: 'commandPaletteTaskWeb',
                        title: (0, nls_1.localize)(57, null),
                        description: (0, nls_1.localize)(58, null, Button((0, nls_1.localize)(59, null), 'command:workbench.action.showCommands')),
                        media: { type: 'svg', altText: 'Command Palette overlay for searching and executing commands.', path: 'commandPalette.svg' },
                    },
                    {
                        id: 'menuBarWeb',
                        title: (0, nls_1.localize)(60, null),
                        description: (0, nls_1.localize)(61, null, Button((0, nls_1.localize)(62, null), 'command:workbench.action.toggleMenuBar')),
                        when: 'isWeb',
                        media: {
                            type: 'svg', altText: 'Comparing menu dropdown with the visible menu bar.', path: 'menuBar.svg'
                        },
                    },
                    {
                        id: 'extensionsWebWeb',
                        title: (0, nls_1.localize)(63, null),
                        description: (0, nls_1.localize)(64, null, Button((0, nls_1.localize)(65, null), 'command:workbench.extensions.action.showPopularExtensions')),
                        when: 'workspacePlatform == \'webworker\'',
                        media: {
                            type: 'svg', altText: 'VS Code extension marketplace with featured language extensions', path: 'extensions-web.svg'
                        },
                    },
                    {
                        id: 'findLanguageExtensionsWeb',
                        title: (0, nls_1.localize)(66, null),
                        description: (0, nls_1.localize)(67, null, Button((0, nls_1.localize)(68, null), 'command:workbench.extensions.action.showLanguageExtensions')),
                        when: 'workspacePlatform != \'webworker\'',
                        media: {
                            type: 'svg', altText: 'Language extensions', path: 'languages.svg'
                        },
                    },
                    {
                        id: 'pickAFolderTask-WebWeb',
                        title: (0, nls_1.localize)(69, null),
                        description: (0, nls_1.localize)(70, null, Button((0, nls_1.localize)(71, null), 'command:workbench.action.addRootFolder'), Button((0, nls_1.localize)(72, null), 'command:remoteHub.openRepository')),
                        when: 'workspaceFolderCount == 0',
                        media: {
                            type: 'svg', altText: 'Explorer view showing buttons for opening folder and cloning repository.', path: 'openFolder.svg'
                        }
                    },
                    {
                        id: 'quickOpenWeb',
                        title: (0, nls_1.localize)(73, null),
                        description: (0, nls_1.localize)(74, null, Button((0, nls_1.localize)(75, null), 'command:toSide:workbench.action.quickOpen')),
                        when: 'workspaceFolderCount != 0',
                        media: {
                            type: 'svg', altText: 'Go to file in quick search.', path: 'search.svg'
                        }
                    }
                ]
            }
        },
        {
            id: 'Beginner',
            title: (0, nls_1.localize)(76, null),
            icon: beginnerIcon,
            isFeatured: false,
            next: 'Intermediate',
            description: (0, nls_1.localize)(77, null),
            content: {
                type: 'steps',
                steps: [
                    {
                        id: 'playground',
                        title: (0, nls_1.localize)(78, null),
                        description: (0, nls_1.localize)(79, null, Button((0, nls_1.localize)(80, null), 'command:toSide:workbench.action.showInteractivePlayground')),
                        media: {
                            type: 'svg', altText: 'Editor Playground.', path: 'interactivePlayground.svg'
                        },
                    },
                    {
                        id: 'terminal',
                        title: (0, nls_1.localize)(81, null),
                        description: (0, nls_1.localize)(82, null, Button((0, nls_1.localize)(83, null), 'command:workbench.action.terminal.toggleTerminal')),
                        when: 'workspacePlatform != \'webworker\' && remoteName != codespaces && !terminalIsOpen',
                        media: {
                            type: 'svg', altText: 'Integrated terminal running a few npm commands', path: 'terminal.svg'
                        },
                    },
                    {
                        id: 'extensions',
                        title: (0, nls_1.localize)(84, null),
                        description: (0, nls_1.localize)(85, null, Button((0, nls_1.localize)(86, null), 'command:workbench.extensions.action.showRecommendedExtensions')),
                        when: 'workspacePlatform != \'webworker\'',
                        media: {
                            type: 'svg', altText: 'VS Code extension marketplace with featured language extensions', path: 'extensions.svg'
                        },
                    },
                    {
                        id: 'settings',
                        title: (0, nls_1.localize)(87, null),
                        description: (0, nls_1.localize)(88, null, Button((0, nls_1.localize)(89, null), 'command:toSide:workbench.action.openSettings')),
                        media: {
                            type: 'svg', altText: 'VS Code Settings', path: 'settings.svg'
                        },
                    },
                    {
                        id: 'profiles',
                        title: (0, nls_1.localize)(90, null),
                        description: (0, nls_1.localize)(91, null, Button((0, nls_1.localize)(92, null), 'command:workbench.profiles.actions.createProfile')),
                        media: {
                            type: 'svg', altText: 'VS Code Profiles', path: 'profiles.svg'
                        },
                    },
                    {
                        id: 'workspaceTrust',
                        title: (0, nls_1.localize)(93, null),
                        description: (0, nls_1.localize)(94, null, Button((0, nls_1.localize)(95, null), 'https://github.com/microsoft/vscode-docs/blob/workspaceTrust/docs/editor/workspace-trust.md'), Button((0, nls_1.localize)(96, null), 'command:toSide:workbench.action.manageTrustedDomain')),
                        when: 'workspacePlatform != \'webworker\' && !isWorkspaceTrusted && workspaceFolderCount == 0',
                        media: {
                            type: 'svg', altText: 'Workspace Trust editor in Restricted mode and a primary button for switching to Trusted mode.', path: 'workspaceTrust.svg'
                        },
                    },
                    {
                        id: 'videoTutorial',
                        title: (0, nls_1.localize)(97, null),
                        description: (0, nls_1.localize)(98, null, Button((0, nls_1.localize)(99, null), 'https://aka.ms/vscode-getting-started-video')),
                        media: { type: 'svg', altText: 'VS Code Settings', path: 'learn.svg' },
                    }
                ]
            }
        },
        {
            id: 'Intermediate',
            isFeatured: false,
            title: (0, nls_1.localize)(100, null),
            icon: intermediateIcon,
            description: (0, nls_1.localize)(101, null),
            content: {
                type: 'steps',
                steps: [
                    {
                        id: 'splitview',
                        title: (0, nls_1.localize)(102, null),
                        description: (0, nls_1.localize)(103, null, Button((0, nls_1.localize)(104, null), 'command:workbench.action.splitEditor')),
                        media: {
                            type: 'svg', altText: 'Multiple editors in split view.', path: 'sideBySide.svg',
                        },
                    },
                    {
                        id: 'debugging',
                        title: (0, nls_1.localize)(105, null),
                        description: (0, nls_1.localize)(106, null, Button((0, nls_1.localize)(107, null), 'command:workbench.action.debug.selectandstart')),
                        when: 'workspacePlatform != \'webworker\' && workspaceFolderCount != 0',
                        media: {
                            type: 'svg', altText: 'Run and debug view.', path: 'debug.svg',
                        },
                    },
                    {
                        id: 'scmClone',
                        title: (0, nls_1.localize)(108, null),
                        description: (0, nls_1.localize)(109, null, Button((0, nls_1.localize)(110, null), 'command:git.clone')),
                        when: 'config.git.enabled && !git.missing && workspaceFolderCount == 0',
                        media: {
                            type: 'svg', altText: 'Source Control view.', path: 'git.svg',
                        },
                    },
                    {
                        id: 'scmSetup',
                        title: (0, nls_1.localize)(111, null),
                        description: (0, nls_1.localize)(112, null, Button((0, nls_1.localize)(113, null), 'command:git.init')),
                        when: 'config.git.enabled && !git.missing && workspaceFolderCount != 0 && gitOpenRepositoryCount == 0',
                        media: {
                            type: 'svg', altText: 'Source Control view.', path: 'git.svg',
                        },
                    },
                    {
                        id: 'scm',
                        title: (0, nls_1.localize)(114, null),
                        description: (0, nls_1.localize)(115, null, Button((0, nls_1.localize)(116, null), 'command:workbench.view.scm')),
                        when: 'config.git.enabled && !git.missing && workspaceFolderCount != 0 && gitOpenRepositoryCount != 0 && activeViewlet != \'workbench.view.scm\'',
                        media: {
                            type: 'svg', altText: 'Source Control view.', path: 'git.svg',
                        },
                    },
                    {
                        id: 'installGit',
                        title: (0, nls_1.localize)(117, null),
                        description: (0, nls_1.localize)(118, null, Button((0, nls_1.localize)(119, null), 'https://aka.ms/vscode-install-git'), '[', '](command:workbench.action.reloadWindow)'),
                        when: 'git.missing',
                        media: {
                            type: 'svg', altText: 'Install Git.', path: 'git.svg',
                        },
                        completionEvents: [
                            'onContext:git.state == initialized'
                        ]
                    },
                    {
                        id: 'tasks',
                        title: (0, nls_1.localize)(120, null),
                        when: 'workspaceFolderCount != 0 && workspacePlatform != \'webworker\'',
                        description: (0, nls_1.localize)(121, null, Button((0, nls_1.localize)(122, null), 'command:workbench.action.tasks.runTask')),
                        media: {
                            type: 'svg', altText: 'Task runner.', path: 'runTask.svg',
                        },
                    },
                    {
                        id: 'shortcuts',
                        title: (0, nls_1.localize)(123, null),
                        description: (0, nls_1.localize)(124, null, Button((0, nls_1.localize)(125, null), 'command:toSide:workbench.action.openGlobalKeybindings')),
                        media: {
                            type: 'svg', altText: 'Interactive shortcuts.', path: 'shortcuts.svg',
                        }
                    }
                ]
            }
        },
        {
            id: 'notebooks',
            title: (0, nls_1.localize)(126, null),
            description: '',
            icon: setupIcon,
            isFeatured: false,
            when: `config.${notebookCommon_1.$7H.openGettingStarted} && userHasOpenedNotebook`,
            content: {
                type: 'steps',
                steps: [
                    {
                        completionEvents: ['onCommand:notebook.setProfile'],
                        id: 'notebookProfile',
                        title: (0, nls_1.localize)(127, null),
                        description: (0, nls_1.localize)(128, null),
                        when: 'userHasOpenedNotebook',
                        media: {
                            type: 'markdown', path: 'notebookProfile'
                        }
                    },
                ]
            }
        }
    ];
});
//# sourceMappingURL=gettingStartedContent.js.map