/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls", "vs/base/common/codicons", "vs/platform/theme/common/iconRegistry", "vs/workbench/contrib/notebook/common/notebookCommon", "vs/workbench/contrib/welcomeGettingStarted/common/media/theme_picker", "vs/workbench/contrib/welcomeGettingStarted/common/media/notebookProfile"], function (require, exports, nls_1, codicons_1, iconRegistry_1, notebookCommon_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.walkthroughs = exports.startEntries = void 0;
    const setupIcon = (0, iconRegistry_1.registerIcon)('getting-started-setup', codicons_1.Codicon.zap, (0, nls_1.localize)('getting-started-setup-icon', "Icon used for the setup category of welcome page"));
    const beginnerIcon = (0, iconRegistry_1.registerIcon)('getting-started-beginner', codicons_1.Codicon.lightbulb, (0, nls_1.localize)('getting-started-beginner-icon', "Icon used for the beginner category of welcome page"));
    const intermediateIcon = (0, iconRegistry_1.registerIcon)('getting-started-intermediate', codicons_1.Codicon.mortarBoard, (0, nls_1.localize)('getting-started-intermediate-icon', "Icon used for the intermediate category of welcome page"));
    exports.startEntries = [
        {
            id: 'welcome.showNewFileEntries',
            title: (0, nls_1.localize)('gettingStarted.newFile.title', "New File..."),
            description: (0, nls_1.localize)('gettingStarted.newFile.description', "Open a new untitled text file, notebook, or custom editor."),
            icon: codicons_1.Codicon.newFile,
            content: {
                type: 'startEntry',
                command: 'command:welcome.showNewFileEntries',
            }
        },
        {
            id: 'topLevelOpenMac',
            title: (0, nls_1.localize)('gettingStarted.openMac.title', "Open..."),
            description: (0, nls_1.localize)('gettingStarted.openMac.description', "Open a file or folder to start working"),
            icon: codicons_1.Codicon.folderOpened,
            when: '!isWeb && isMac',
            content: {
                type: 'startEntry',
                command: 'command:workbench.action.files.openFileFolder',
            }
        },
        {
            id: 'topLevelOpenFile',
            title: (0, nls_1.localize)('gettingStarted.openFile.title', "Open File..."),
            description: (0, nls_1.localize)('gettingStarted.openFile.description', "Open a file to start working"),
            icon: codicons_1.Codicon.goToFile,
            when: 'isWeb || !isMac',
            content: {
                type: 'startEntry',
                command: 'command:workbench.action.files.openFile',
            }
        },
        {
            id: 'topLevelOpenFolder',
            title: (0, nls_1.localize)('gettingStarted.openFolder.title', "Open Folder..."),
            description: (0, nls_1.localize)('gettingStarted.openFolder.description', "Open a folder to start working"),
            icon: codicons_1.Codicon.folderOpened,
            when: '!isWeb && !isMac',
            content: {
                type: 'startEntry',
                command: 'command:workbench.action.files.openFolder',
            }
        },
        {
            id: 'topLevelOpenFolderWeb',
            title: (0, nls_1.localize)('gettingStarted.openFolder.title', "Open Folder..."),
            description: (0, nls_1.localize)('gettingStarted.openFolder.description', "Open a folder to start working"),
            icon: codicons_1.Codicon.folderOpened,
            when: '!openFolderWorkspaceSupport && workbenchState == \'workspace\'',
            content: {
                type: 'startEntry',
                command: 'command:workbench.action.files.openFolderViaWorkspace',
            }
        },
        {
            id: 'topLevelGitClone',
            title: (0, nls_1.localize)('gettingStarted.topLevelGitClone.title', "Clone Git Repository..."),
            description: (0, nls_1.localize)('gettingStarted.topLevelGitClone.description', "Clone a remote repository to a local folder"),
            when: 'config.git.enabled && !git.missing',
            icon: codicons_1.Codicon.sourceControl,
            content: {
                type: 'startEntry',
                command: 'command:git.clone',
            }
        },
        {
            id: 'topLevelGitOpen',
            title: (0, nls_1.localize)('gettingStarted.topLevelGitOpen.title', "Open Repository..."),
            description: (0, nls_1.localize)('gettingStarted.topLevelGitOpen.description', "Connect to a remote repository or pull request to browse, search, edit, and commit"),
            when: 'workspacePlatform == \'webworker\'',
            icon: codicons_1.Codicon.sourceControl,
            content: {
                type: 'startEntry',
                command: 'command:remoteHub.openRepository',
            }
        },
        {
            id: 'topLevelShowWalkthroughs',
            title: (0, nls_1.localize)('gettingStarted.topLevelShowWalkthroughs.title', "Open a Walkthrough..."),
            description: (0, nls_1.localize)('gettingStarted.topLevelShowWalkthroughs.description', "View a walkthrough on the editor or an extension"),
            icon: codicons_1.Codicon.checklist,
            when: 'allWalkthroughsHidden',
            content: {
                type: 'startEntry',
                command: 'command:welcome.showAllWalkthroughs',
            }
        },
        {
            id: 'topLevelRemoteOpen',
            title: (0, nls_1.localize)('gettingStarted.topLevelRemoteOpen.title', "Connect to..."),
            description: (0, nls_1.localize)('gettingStarted.topLevelRemoteOpen.description', "Connect to remote development workspaces."),
            when: '!isWeb',
            icon: codicons_1.Codicon.remote,
            content: {
                type: 'startEntry',
                command: 'command:workbench.action.remote.showMenu',
            }
        },
        {
            id: 'topLevelOpenTunnel',
            title: (0, nls_1.localize)('gettingStarted.topLevelOpenTunnel.title', "Open Tunnel..."),
            description: (0, nls_1.localize)('gettingStarted.topLevelOpenTunnel.description', "Connect to a remote machine through a Tunnel"),
            when: 'isWeb && showRemoteStartEntryInWeb',
            icon: codicons_1.Codicon.remote,
            content: {
                type: 'startEntry',
                command: 'command:workbench.action.remote.showWebStartEntryActions',
            }
        },
    ];
    const Button = (title, href) => `[${title}](${href})`;
    exports.walkthroughs = [
        {
            id: 'Setup',
            title: (0, nls_1.localize)('gettingStarted.setup.title', "Get Started with VS Code"),
            description: (0, nls_1.localize)('gettingStarted.setup.description', "Discover the best customizations to make VS Code yours."),
            isFeatured: true,
            icon: setupIcon,
            when: '!isWeb',
            next: 'Beginner',
            content: {
                type: 'steps',
                steps: [
                    {
                        id: 'pickColorTheme',
                        title: (0, nls_1.localize)('gettingStarted.pickColor.title', "Choose the look you want"),
                        description: (0, nls_1.localize)('gettingStarted.pickColor.description.interpolated', "The right color palette helps you focus on your code, is easy on your eyes, and is simply more fun to use.\n{0}", Button((0, nls_1.localize)('titleID', "Browse Color Themes"), 'command:workbench.action.selectTheme')),
                        completionEvents: [
                            'onSettingChanged:workbench.colorTheme',
                            'onCommand:workbench.action.selectTheme'
                        ],
                        media: { type: 'markdown', path: 'theme_picker', }
                    },
                    {
                        id: 'settingsSync',
                        title: (0, nls_1.localize)('gettingStarted.settingsSync.title', "Sync to and from other devices"),
                        description: (0, nls_1.localize)('gettingStarted.settingsSync.description.interpolated', "Keep your essential VS Code customizations backed up and updated across all your devices.\n{0}", Button((0, nls_1.localize)('enableSync', "Enable Settings Sync"), 'command:workbench.userDataSync.actions.turnOn')),
                        when: 'syncStatus != uninitialized',
                        completionEvents: ['onEvent:sync-enabled'],
                        media: {
                            type: 'svg', altText: 'The "Turn on Sync" entry in the settings gear menu.', path: 'settingsSync.svg'
                        },
                    },
                    {
                        id: 'commandPaletteTask',
                        title: (0, nls_1.localize)('gettingStarted.commandPalette.title', "One shortcut to access everything"),
                        description: (0, nls_1.localize)('gettingStarted.commandPalette.description.interpolated', "Commands are the keyboard way to accomplish any task in VS Code. **Practice** by looking up your frequent ones to save time.\n{0}\n__Try searching for 'view toggle'.__", Button((0, nls_1.localize)('commandPalette', "Open Command Palette"), 'command:workbench.action.showCommands')),
                        media: { type: 'svg', altText: 'Command Palette overlay for searching and executing commands.', path: 'commandPalette.svg' },
                    },
                    {
                        id: 'extensionsWeb',
                        title: (0, nls_1.localize)('gettingStarted.extensions.title', "Limitless extensibility"),
                        description: (0, nls_1.localize)('gettingStarted.extensionsWeb.description.interpolated', "Extensions are VS Code's power-ups. A growing number are becoming available in the web.\n{0}", Button((0, nls_1.localize)('browsePopular', "Browse Popular Web Extensions"), 'command:workbench.extensions.action.showPopularExtensions')),
                        when: 'workspacePlatform == \'webworker\'',
                        media: {
                            type: 'svg', altText: 'VS Code extension marketplace with featured language extensions', path: 'extensions-web.svg'
                        },
                    },
                    {
                        id: 'findLanguageExtensions',
                        title: (0, nls_1.localize)('gettingStarted.findLanguageExts.title', "Rich support for all your languages"),
                        description: (0, nls_1.localize)('gettingStarted.findLanguageExts.description.interpolated', "Code smarter with syntax highlighting, code completion, linting and debugging. While many languages are built-in, many more can be added as extensions.\n{0}", Button((0, nls_1.localize)('browseLangExts', "Browse Language Extensions"), 'command:workbench.extensions.action.showLanguageExtensions')),
                        when: 'workspacePlatform != \'webworker\'',
                        media: {
                            type: 'svg', altText: 'Language extensions', path: 'languages.svg'
                        },
                    },
                    {
                        id: 'pickAFolderTask-Mac',
                        title: (0, nls_1.localize)('gettingStarted.setup.OpenFolder.title', "Open up your code"),
                        description: (0, nls_1.localize)('gettingStarted.setup.OpenFolder.description.interpolated', "You're all set to start coding. Open a project folder to get your files into VS Code.\n{0}", Button((0, nls_1.localize)('pickFolder', "Pick a Folder"), 'command:workbench.action.files.openFileFolder')),
                        when: 'isMac && workspaceFolderCount == 0',
                        media: {
                            type: 'svg', altText: 'Explorer view showing buttons for opening folder and cloning repository.', path: 'openFolder.svg'
                        }
                    },
                    {
                        id: 'pickAFolderTask-Other',
                        title: (0, nls_1.localize)('gettingStarted.setup.OpenFolder.title', "Open up your code"),
                        description: (0, nls_1.localize)('gettingStarted.setup.OpenFolder.description.interpolated', "You're all set to start coding. Open a project folder to get your files into VS Code.\n{0}", Button((0, nls_1.localize)('pickFolder', "Pick a Folder"), 'command:workbench.action.files.openFolder')),
                        when: '!isMac && workspaceFolderCount == 0',
                        media: {
                            type: 'svg', altText: 'Explorer view showing buttons for opening folder and cloning repository.', path: 'openFolder.svg'
                        }
                    },
                    {
                        id: 'quickOpen',
                        title: (0, nls_1.localize)('gettingStarted.quickOpen.title', "Quickly navigate between your files"),
                        description: (0, nls_1.localize)('gettingStarted.quickOpen.description.interpolated', "Navigate between files in an instant with one keystroke. Tip: Open multiple files by pressing the right arrow key.\n{0}", Button((0, nls_1.localize)('quickOpen', "Quick Open a File"), 'command:toSide:workbench.action.quickOpen')),
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
            title: (0, nls_1.localize)('gettingStarted.setupWeb.title', "Get Started with VS Code for the Web"),
            description: (0, nls_1.localize)('gettingStarted.setupWeb.description', "Discover the best customizations to make VS Code for the Web yours."),
            isFeatured: true,
            icon: setupIcon,
            when: 'isWeb',
            next: 'Beginner',
            content: {
                type: 'steps',
                steps: [
                    {
                        id: 'pickColorThemeWeb',
                        title: (0, nls_1.localize)('gettingStarted.pickColor.title', "Choose the look you want"),
                        description: (0, nls_1.localize)('gettingStarted.pickColor.description.interpolated', "The right color palette helps you focus on your code, is easy on your eyes, and is simply more fun to use.\n{0}", Button((0, nls_1.localize)('titleID', "Browse Color Themes"), 'command:workbench.action.selectTheme')),
                        completionEvents: [
                            'onSettingChanged:workbench.colorTheme',
                            'onCommand:workbench.action.selectTheme'
                        ],
                        media: { type: 'markdown', path: 'theme_picker', }
                    },
                    {
                        id: 'settingsSyncWeb',
                        title: (0, nls_1.localize)('gettingStarted.settingsSync.title', "Sync to and from other devices"),
                        description: (0, nls_1.localize)('gettingStarted.settingsSync.description.interpolated', "Keep your essential VS Code customizations backed up and updated across all your devices.\n{0}", Button((0, nls_1.localize)('enableSync', "Enable Settings Sync"), 'command:workbench.userDataSync.actions.turnOn')),
                        when: 'syncStatus != uninitialized',
                        completionEvents: ['onEvent:sync-enabled'],
                        media: {
                            type: 'svg', altText: 'The "Turn on Sync" entry in the settings gear menu.', path: 'settingsSync.svg'
                        },
                    },
                    {
                        id: 'commandPaletteTaskWeb',
                        title: (0, nls_1.localize)('gettingStarted.commandPalette.title', "One shortcut to access everything"),
                        description: (0, nls_1.localize)('gettingStarted.commandPalette.description.interpolated', "Commands are the keyboard way to accomplish any task in VS Code. **Practice** by looking up your frequent ones to save time.\n{0}\n__Try searching for 'view toggle'.__", Button((0, nls_1.localize)('commandPalette', "Open Command Palette"), 'command:workbench.action.showCommands')),
                        media: { type: 'svg', altText: 'Command Palette overlay for searching and executing commands.', path: 'commandPalette.svg' },
                    },
                    {
                        id: 'menuBarWeb',
                        title: (0, nls_1.localize)('gettingStarted.menuBar.title', "Just the right amount of UI"),
                        description: (0, nls_1.localize)('gettingStarted.menuBar.description.interpolated', "The full menu bar is available in the dropdown menu to make room for your code. Toggle its appearance for faster access. \n{0}", Button((0, nls_1.localize)('toggleMenuBar', "Toggle Menu Bar"), 'command:workbench.action.toggleMenuBar')),
                        when: 'isWeb',
                        media: {
                            type: 'svg', altText: 'Comparing menu dropdown with the visible menu bar.', path: 'menuBar.svg'
                        },
                    },
                    {
                        id: 'extensionsWebWeb',
                        title: (0, nls_1.localize)('gettingStarted.extensions.title', "Limitless extensibility"),
                        description: (0, nls_1.localize)('gettingStarted.extensionsWeb.description.interpolated', "Extensions are VS Code's power-ups. A growing number are becoming available in the web.\n{0}", Button((0, nls_1.localize)('browsePopular', "Browse Popular Web Extensions"), 'command:workbench.extensions.action.showPopularExtensions')),
                        when: 'workspacePlatform == \'webworker\'',
                        media: {
                            type: 'svg', altText: 'VS Code extension marketplace with featured language extensions', path: 'extensions-web.svg'
                        },
                    },
                    {
                        id: 'findLanguageExtensionsWeb',
                        title: (0, nls_1.localize)('gettingStarted.findLanguageExts.title', "Rich support for all your languages"),
                        description: (0, nls_1.localize)('gettingStarted.findLanguageExts.description.interpolated', "Code smarter with syntax highlighting, code completion, linting and debugging. While many languages are built-in, many more can be added as extensions.\n{0}", Button((0, nls_1.localize)('browseLangExts', "Browse Language Extensions"), 'command:workbench.extensions.action.showLanguageExtensions')),
                        when: 'workspacePlatform != \'webworker\'',
                        media: {
                            type: 'svg', altText: 'Language extensions', path: 'languages.svg'
                        },
                    },
                    {
                        id: 'pickAFolderTask-WebWeb',
                        title: (0, nls_1.localize)('gettingStarted.setup.OpenFolder.title', "Open up your code"),
                        description: (0, nls_1.localize)('gettingStarted.setup.OpenFolderWeb.description.interpolated', "You're all set to start coding. You can open a local project or a remote repository to get your files into VS Code.\n{0}\n{1}", Button((0, nls_1.localize)('openFolder', "Open Folder"), 'command:workbench.action.addRootFolder'), Button((0, nls_1.localize)('openRepository', "Open Repository"), 'command:remoteHub.openRepository')),
                        when: 'workspaceFolderCount == 0',
                        media: {
                            type: 'svg', altText: 'Explorer view showing buttons for opening folder and cloning repository.', path: 'openFolder.svg'
                        }
                    },
                    {
                        id: 'quickOpenWeb',
                        title: (0, nls_1.localize)('gettingStarted.quickOpen.title', "Quickly navigate between your files"),
                        description: (0, nls_1.localize)('gettingStarted.quickOpen.description.interpolated', "Navigate between files in an instant with one keystroke. Tip: Open multiple files by pressing the right arrow key.\n{0}", Button((0, nls_1.localize)('quickOpen', "Quick Open a File"), 'command:toSide:workbench.action.quickOpen')),
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
            title: (0, nls_1.localize)('gettingStarted.beginner.title', "Learn the Fundamentals"),
            icon: beginnerIcon,
            isFeatured: false,
            next: 'Intermediate',
            description: (0, nls_1.localize)('gettingStarted.beginner.description', "Jump right into VS Code and get an overview of the must-have features."),
            content: {
                type: 'steps',
                steps: [
                    {
                        id: 'playground',
                        title: (0, nls_1.localize)('gettingStarted.playground.title', "Redefine your editing skills"),
                        description: (0, nls_1.localize)('gettingStarted.playground.description.interpolated', "Want to code faster and smarter? Practice powerful code editing features in the interactive playground.\n{0}", Button((0, nls_1.localize)('openEditorPlayground', "Open Editor Playground"), 'command:toSide:workbench.action.showInteractivePlayground')),
                        media: {
                            type: 'svg', altText: 'Editor Playground.', path: 'interactivePlayground.svg'
                        },
                    },
                    {
                        id: 'terminal',
                        title: (0, nls_1.localize)('gettingStarted.terminal.title', "Convenient built-in terminal"),
                        description: (0, nls_1.localize)('gettingStarted.terminal.description.interpolated', "Quickly run shell commands and monitor build output, right next to your code.\n{0}", Button((0, nls_1.localize)('showTerminal', "Show Terminal Panel"), 'command:workbench.action.terminal.toggleTerminal')),
                        when: 'workspacePlatform != \'webworker\' && remoteName != codespaces && !terminalIsOpen',
                        media: {
                            type: 'svg', altText: 'Integrated terminal running a few npm commands', path: 'terminal.svg'
                        },
                    },
                    {
                        id: 'extensions',
                        title: (0, nls_1.localize)('gettingStarted.extensions.title', "Limitless extensibility"),
                        description: (0, nls_1.localize)('gettingStarted.extensions.description.interpolated', "Extensions are VS Code's power-ups. They range from handy productivity hacks, expanding out-of-the-box features, to adding completely new capabilities.\n{0}", Button((0, nls_1.localize)('browseRecommended', "Browse Recommended Extensions"), 'command:workbench.extensions.action.showRecommendedExtensions')),
                        when: 'workspacePlatform != \'webworker\'',
                        media: {
                            type: 'svg', altText: 'VS Code extension marketplace with featured language extensions', path: 'extensions.svg'
                        },
                    },
                    {
                        id: 'settings',
                        title: (0, nls_1.localize)('gettingStarted.settings.title', "Tune your settings"),
                        description: (0, nls_1.localize)('gettingStarted.settings.description.interpolated', "Tweak every aspect of VS Code and your extensions to your liking. Commonly used settings are listed first to get you started.\n{0}", Button((0, nls_1.localize)('tweakSettings', "Tweak my Settings"), 'command:toSide:workbench.action.openSettings')),
                        media: {
                            type: 'svg', altText: 'VS Code Settings', path: 'settings.svg'
                        },
                    },
                    {
                        id: 'profiles',
                        title: (0, nls_1.localize)('gettingStarted.profiles.title', "Customize VS Code with Profiles"),
                        description: (0, nls_1.localize)('gettingStarted.profiles.description.interpolated', "Profiles let you create sets of VS Code customizations that include settings, extensions and UI state. Create your own profile from scratch or use the predefined set of profile templates for your specific workflow.\n{0}", Button((0, nls_1.localize)('tryProfiles', "Try Profiles"), 'command:workbench.profiles.actions.createProfile')),
                        media: {
                            type: 'svg', altText: 'VS Code Profiles', path: 'profiles.svg'
                        },
                    },
                    {
                        id: 'workspaceTrust',
                        title: (0, nls_1.localize)('gettingStarted.workspaceTrust.title', "Safely browse and edit code"),
                        description: (0, nls_1.localize)('gettingStarted.workspaceTrust.description.interpolated', "{0} lets you decide whether your project folders should **allow or restrict** automatic code execution __(required for extensions, debugging, etc)__.\nOpening a file/folder will prompt to grant trust. You can always {1} later.", Button((0, nls_1.localize)('workspaceTrust', "Workspace Trust"), 'https://github.com/microsoft/vscode-docs/blob/workspaceTrust/docs/editor/workspace-trust.md'), Button((0, nls_1.localize)('enableTrust', "enable trust"), 'command:toSide:workbench.action.manageTrustedDomain')),
                        when: 'workspacePlatform != \'webworker\' && !isWorkspaceTrusted && workspaceFolderCount == 0',
                        media: {
                            type: 'svg', altText: 'Workspace Trust editor in Restricted mode and a primary button for switching to Trusted mode.', path: 'workspaceTrust.svg'
                        },
                    },
                    {
                        id: 'videoTutorial',
                        title: (0, nls_1.localize)('gettingStarted.videoTutorial.title', "Lean back and learn"),
                        description: (0, nls_1.localize)('gettingStarted.videoTutorial.description.interpolated', "Watch the first in a series of short & practical video tutorials for VS Code's key features.\n{0}", Button((0, nls_1.localize)('watch', "Watch Tutorial"), 'https://aka.ms/vscode-getting-started-video')),
                        media: { type: 'svg', altText: 'VS Code Settings', path: 'learn.svg' },
                    }
                ]
            }
        },
        {
            id: 'Intermediate',
            isFeatured: false,
            title: (0, nls_1.localize)('gettingStarted.intermediate.title', "Boost your Productivity"),
            icon: intermediateIcon,
            description: (0, nls_1.localize)('gettingStarted.intermediate.description', "Optimize your development workflow with these tips & tricks."),
            content: {
                type: 'steps',
                steps: [
                    {
                        id: 'splitview',
                        title: (0, nls_1.localize)('gettingStarted.splitview.title', "Side by side editing"),
                        description: (0, nls_1.localize)('gettingStarted.splitview.description.interpolated', "Make the most of your screen estate by opening files side by side, vertically and horizontally.\n{0}", Button((0, nls_1.localize)('splitEditor', "Split Editor"), 'command:workbench.action.splitEditor')),
                        media: {
                            type: 'svg', altText: 'Multiple editors in split view.', path: 'sideBySide.svg',
                        },
                    },
                    {
                        id: 'debugging',
                        title: (0, nls_1.localize)('gettingStarted.debug.title', "Watch your code in action"),
                        description: (0, nls_1.localize)('gettingStarted.debug.description.interpolated', "Accelerate your edit, build, test, and debug loop by setting up a launch configuration.\n{0}", Button((0, nls_1.localize)('runProject', "Run your Project"), 'command:workbench.action.debug.selectandstart')),
                        when: 'workspacePlatform != \'webworker\' && workspaceFolderCount != 0',
                        media: {
                            type: 'svg', altText: 'Run and debug view.', path: 'debug.svg',
                        },
                    },
                    {
                        id: 'scmClone',
                        title: (0, nls_1.localize)('gettingStarted.scm.title', "Track your code with Git"),
                        description: (0, nls_1.localize)('gettingStarted.scmClone.description.interpolated', "Set up the built-in version control for your project to track your changes and collaborate with others.\n{0}", Button((0, nls_1.localize)('cloneRepo', "Clone Repository"), 'command:git.clone')),
                        when: 'config.git.enabled && !git.missing && workspaceFolderCount == 0',
                        media: {
                            type: 'svg', altText: 'Source Control view.', path: 'git.svg',
                        },
                    },
                    {
                        id: 'scmSetup',
                        title: (0, nls_1.localize)('gettingStarted.scm.title', "Track your code with Git"),
                        description: (0, nls_1.localize)('gettingStarted.scmSetup.description.interpolated', "Set up the built-in version control for your project to track your changes and collaborate with others.\n{0}", Button((0, nls_1.localize)('initRepo', "Initialize Git Repository"), 'command:git.init')),
                        when: 'config.git.enabled && !git.missing && workspaceFolderCount != 0 && gitOpenRepositoryCount == 0',
                        media: {
                            type: 'svg', altText: 'Source Control view.', path: 'git.svg',
                        },
                    },
                    {
                        id: 'scm',
                        title: (0, nls_1.localize)('gettingStarted.scm.title', "Track your code with Git"),
                        description: (0, nls_1.localize)('gettingStarted.scm.description.interpolated', "No more looking up Git commands! Git and GitHub workflows are seamlessly integrated.\n{0}", Button((0, nls_1.localize)('openSCM', "Open Source Control"), 'command:workbench.view.scm')),
                        when: 'config.git.enabled && !git.missing && workspaceFolderCount != 0 && gitOpenRepositoryCount != 0 && activeViewlet != \'workbench.view.scm\'',
                        media: {
                            type: 'svg', altText: 'Source Control view.', path: 'git.svg',
                        },
                    },
                    {
                        id: 'installGit',
                        title: (0, nls_1.localize)('gettingStarted.installGit.title', "Install Git"),
                        description: (0, nls_1.localize)({ key: 'gettingStarted.installGit.description.interpolated', comment: ['The placeholders are command link items should not be translated'] }, "Install Git to track changes in your projects.\n{0}\n{1}Reload window{2} after installation to complete Git setup.", Button((0, nls_1.localize)('installGit', "Install Git"), 'https://aka.ms/vscode-install-git'), '[', '](command:workbench.action.reloadWindow)'),
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
                        title: (0, nls_1.localize)('gettingStarted.tasks.title', "Automate your project tasks"),
                        when: 'workspaceFolderCount != 0 && workspacePlatform != \'webworker\'',
                        description: (0, nls_1.localize)('gettingStarted.tasks.description.interpolated', "Create tasks for your common workflows and enjoy the integrated experience of running scripts and automatically checking results.\n{0}", Button((0, nls_1.localize)('runTasks', "Run Auto-detected Tasks"), 'command:workbench.action.tasks.runTask')),
                        media: {
                            type: 'svg', altText: 'Task runner.', path: 'runTask.svg',
                        },
                    },
                    {
                        id: 'shortcuts',
                        title: (0, nls_1.localize)('gettingStarted.shortcuts.title', "Customize your shortcuts"),
                        description: (0, nls_1.localize)('gettingStarted.shortcuts.description.interpolated', "Once you have discovered your favorite commands, create custom keyboard shortcuts for instant access.\n{0}", Button((0, nls_1.localize)('keyboardShortcuts', "Keyboard Shortcuts"), 'command:toSide:workbench.action.openGlobalKeybindings')),
                        media: {
                            type: 'svg', altText: 'Interactive shortcuts.', path: 'shortcuts.svg',
                        }
                    }
                ]
            }
        },
        {
            id: 'notebooks',
            title: (0, nls_1.localize)('gettingStarted.notebook.title', "Customize Notebooks"),
            description: '',
            icon: setupIcon,
            isFeatured: false,
            when: `config.${notebookCommon_1.NotebookSetting.openGettingStarted} && userHasOpenedNotebook`,
            content: {
                type: 'steps',
                steps: [
                    {
                        completionEvents: ['onCommand:notebook.setProfile'],
                        id: 'notebookProfile',
                        title: (0, nls_1.localize)('gettingStarted.notebookProfile.title', "Select the layout for your notebooks"),
                        description: (0, nls_1.localize)('gettingStarted.notebookProfile.description', "Get notebooks to feel just the way you prefer"),
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2V0dGluZ1N0YXJ0ZWRDb250ZW50LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvd2VsY29tZUdldHRpbmdTdGFydGVkL2NvbW1vbi9nZXR0aW5nU3RhcnRlZENvbnRlbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBV2hHLE1BQU0sU0FBUyxHQUFHLElBQUEsMkJBQVksRUFBQyx1QkFBdUIsRUFBRSxrQkFBTyxDQUFDLEdBQUcsRUFBRSxJQUFBLGNBQVEsRUFBQyw0QkFBNEIsRUFBRSxrREFBa0QsQ0FBQyxDQUFDLENBQUM7SUFDakssTUFBTSxZQUFZLEdBQUcsSUFBQSwyQkFBWSxFQUFDLDBCQUEwQixFQUFFLGtCQUFPLENBQUMsU0FBUyxFQUFFLElBQUEsY0FBUSxFQUFDLCtCQUErQixFQUFFLHFEQUFxRCxDQUFDLENBQUMsQ0FBQztJQUNuTCxNQUFNLGdCQUFnQixHQUFHLElBQUEsMkJBQVksRUFBQyw4QkFBOEIsRUFBRSxrQkFBTyxDQUFDLFdBQVcsRUFBRSxJQUFBLGNBQVEsRUFBQyxtQ0FBbUMsRUFBRSx5REFBeUQsQ0FBQyxDQUFDLENBQUM7SUF3Q3hMLFFBQUEsWUFBWSxHQUFvQztRQUM1RDtZQUNDLEVBQUUsRUFBRSw0QkFBNEI7WUFDaEMsS0FBSyxFQUFFLElBQUEsY0FBUSxFQUFDLDhCQUE4QixFQUFFLGFBQWEsQ0FBQztZQUM5RCxXQUFXLEVBQUUsSUFBQSxjQUFRLEVBQUMsb0NBQW9DLEVBQUUsNERBQTRELENBQUM7WUFDekgsSUFBSSxFQUFFLGtCQUFPLENBQUMsT0FBTztZQUNyQixPQUFPLEVBQUU7Z0JBQ1IsSUFBSSxFQUFFLFlBQVk7Z0JBQ2xCLE9BQU8sRUFBRSxvQ0FBb0M7YUFDN0M7U0FDRDtRQUNEO1lBQ0MsRUFBRSxFQUFFLGlCQUFpQjtZQUNyQixLQUFLLEVBQUUsSUFBQSxjQUFRLEVB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