/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/registry/common/platform", "vs/nls!vs/workbench/electron-sandbox/desktop.contribution", "vs/platform/actions/common/actions", "vs/platform/configuration/common/configurationRegistry", "vs/base/common/platform", "vs/workbench/electron-sandbox/actions/developerActions", "vs/workbench/electron-sandbox/actions/windowActions", "vs/platform/contextkey/common/contextkey", "vs/platform/keybinding/common/keybindingsRegistry", "vs/platform/commands/common/commands", "vs/platform/contextkey/common/contextkeys", "vs/platform/native/common/native", "vs/platform/jsonschemas/common/jsonContributionRegistry", "vs/workbench/electron-sandbox/actions/installActions", "vs/workbench/common/contextkeys", "vs/platform/telemetry/common/telemetry", "vs/platform/configuration/common/configuration", "vs/workbench/electron-sandbox/window", "vs/base/browser/dom", "vs/workbench/common/configuration"], function (require, exports, platform_1, nls_1, actions_1, configurationRegistry_1, platform_2, developerActions_1, windowActions_1, contextkey_1, keybindingsRegistry_1, commands_1, contextkeys_1, native_1, jsonContributionRegistry_1, installActions_1, contextkeys_2, telemetry_1, configuration_1, window_1, dom_1, configuration_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    // Actions
    (function registerActions() {
        // Actions: Zoom
        (0, actions_1.$Xu)(windowActions_1.$i_b);
        (0, actions_1.$Xu)(windowActions_1.$j_b);
        (0, actions_1.$Xu)(windowActions_1.$k_b);
        // Actions: Window
        (0, actions_1.$Xu)(windowActions_1.$l_b);
        (0, actions_1.$Xu)(windowActions_1.$m_b);
        (0, actions_1.$Xu)(windowActions_1.$h_b);
        if (platform_2.$j) {
            // macOS: behave like other native apps that have documents
            // but can run without a document opened and allow to close
            // the window when the last document is closed
            // (https://github.com/microsoft/vscode/issues/126042)
            keybindingsRegistry_1.$Nu.registerKeybindingRule({
                id: windowActions_1.$h_b.ID,
                weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                when: contextkey_1.$Ii.and(contextkeys_2.$kdb.toNegated(), contextkeys_2.$jdb),
                primary: 2048 /* KeyMod.CtrlCmd */ | 53 /* KeyCode.KeyW */
            });
        }
        // Actions: Install Shell Script (macOS only)
        if (platform_2.$j) {
            (0, actions_1.$Xu)(installActions_1.$t_b);
            (0, actions_1.$Xu)(installActions_1.$u_b);
        }
        // Quit
        keybindingsRegistry_1.$Nu.registerCommandAndKeybindingRule({
            id: 'workbench.action.quit',
            weight: 200 /* KeybindingWeight.WorkbenchContrib */,
            async handler(accessor) {
                const nativeHostService = accessor.get(native_1.$05b);
                const configurationService = accessor.get(configuration_1.$8h);
                const confirmBeforeClose = configurationService.getValue('window.confirmBeforeClose');
                if (confirmBeforeClose === 'always' || (confirmBeforeClose === 'keyboardOnly' && dom_1.$xP.getInstance().isModifierPressed)) {
                    const confirmed = await window_1.$5$b.confirmOnShutdown(accessor, 2 /* ShutdownReason.QUIT */);
                    if (!confirmed) {
                        return; // quit prevented by user
                    }
                }
                nativeHostService.quit();
            },
            when: undefined,
            mac: { primary: 2048 /* KeyMod.CtrlCmd */ | 47 /* KeyCode.KeyQ */ },
            linux: { primary: 2048 /* KeyMod.CtrlCmd */ | 47 /* KeyCode.KeyQ */ }
        });
        // Actions: macOS Native Tabs
        if (platform_2.$j) {
            for (const command of [
                { handler: windowActions_1.$n_b, id: 'workbench.action.newWindowTab', title: { value: (0, nls_1.localize)(0, null), original: 'New Window Tab' } },
                { handler: windowActions_1.$o_b, id: 'workbench.action.showPreviousWindowTab', title: { value: (0, nls_1.localize)(1, null), original: 'Show Previous Window Tab' } },
                { handler: windowActions_1.$p_b, id: 'workbench.action.showNextWindowTab', title: { value: (0, nls_1.localize)(2, null), original: 'Show Next Window Tab' } },
                { handler: windowActions_1.$q_b, id: 'workbench.action.moveWindowTabToNewWindow', title: { value: (0, nls_1.localize)(3, null), original: 'Move Window Tab to New Window' } },
                { handler: windowActions_1.$r_b, id: 'workbench.action.mergeAllWindowTabs', title: { value: (0, nls_1.localize)(4, null), original: 'Merge All Windows' } },
                { handler: windowActions_1.$s_b, id: 'workbench.action.toggleWindowTabsBar', title: { value: (0, nls_1.localize)(5, null), original: 'Toggle Window Tabs Bar' } }
            ]) {
                commands_1.$Gr.registerCommand(command.id, command.handler);
                actions_1.$Tu.appendMenuItem(actions_1.$Ru.CommandPalette, {
                    command,
                    when: contextkey_1.$Ii.equals('config.window.nativeTabs', true)
                });
            }
        }
        // Actions: Developer
        (0, actions_1.$Xu)(developerActions_1.$f_b);
        (0, actions_1.$Xu)(developerActions_1.$e_b);
        (0, actions_1.$Xu)(developerActions_1.$d_b);
        (0, actions_1.$Xu)(developerActions_1.$g_b);
    })();
    // Menu
    (function registerMenu() {
        // Quit
        actions_1.$Tu.appendMenuItem(actions_1.$Ru.MenubarFileMenu, {
            group: 'z_Exit',
            command: {
                id: 'workbench.action.quit',
                title: (0, nls_1.localize)(6, null)
            },
            order: 1,
            when: contextkeys_1.$Y3.toNegated()
        });
    })();
    // Configuration
    (function registerConfiguration() {
        const registry = platform_1.$8m.as(configurationRegistry_1.$an.Configuration);
        // Application
        registry.registerConfiguration({
            ...configuration_2.$0y,
            'properties': {
                'application.shellEnvironmentResolutionTimeout': {
                    'type': 'number',
                    'default': 10,
                    'minimum': 1,
                    'maximum': 120,
                    'included': !platform_2.$i,
                    'scope': 1 /* ConfigurationScope.APPLICATION */,
                    'markdownDescription': (0, nls_1.localize)(7, null)
                }
            }
        });
        // Window
        registry.registerConfiguration({
            'id': 'window',
            'order': 8,
            'title': (0, nls_1.localize)(8, null),
            'type': 'object',
            'properties': {
                'window.openWithoutArgumentsInNewWindow': {
                    'type': 'string',
                    'enum': ['on', 'off'],
                    'enumDescriptions': [
                        (0, nls_1.localize)(9, null),
                        (0, nls_1.localize)(10, null)
                    ],
                    'default': platform_2.$j ? 'off' : 'on',
                    'scope': 1 /* ConfigurationScope.APPLICATION */,
                    'markdownDescription': (0, nls_1.localize)(11, null)
                },
                'window.restoreWindows': {
                    'type': 'string',
                    'enum': ['preserve', 'all', 'folders', 'one', 'none'],
                    'enumDescriptions': [
                        (0, nls_1.localize)(12, null),
                        (0, nls_1.localize)(13, null),
                        (0, nls_1.localize)(14, null),
                        (0, nls_1.localize)(15, null),
                        (0, nls_1.localize)(16, null)
                    ],
                    'default': 'all',
                    'scope': 1 /* ConfigurationScope.APPLICATION */,
                    'description': (0, nls_1.localize)(17, null)
                },
                'window.restoreFullscreen': {
                    'type': 'boolean',
                    'default': false,
                    'scope': 1 /* ConfigurationScope.APPLICATION */,
                    'description': (0, nls_1.localize)(18, null)
                },
                'window.zoomLevel': {
                    'type': 'number',
                    'default': 0,
                    'minimum': -5,
                    'description': (0, nls_1.localize)(19, null),
                    ignoreSync: true,
                    tags: ['accessibility']
                },
                'window.newWindowDimensions': {
                    'type': 'string',
                    'enum': ['default', 'inherit', 'offset', 'maximized', 'fullscreen'],
                    'enumDescriptions': [
                        (0, nls_1.localize)(20, null),
                        (0, nls_1.localize)(21, null),
                        (0, nls_1.localize)(22, null),
                        (0, nls_1.localize)(23, null),
                        (0, nls_1.localize)(24, null)
                    ],
                    'default': 'default',
                    'scope': 1 /* ConfigurationScope.APPLICATION */,
                    'description': (0, nls_1.localize)(25, null)
                },
                'window.closeWhenEmpty': {
                    'type': 'boolean',
                    'default': false,
                    'description': (0, nls_1.localize)(26, null)
                },
                'window.doubleClickIconToClose': {
                    'type': 'boolean',
                    'default': false,
                    'scope': 1 /* ConfigurationScope.APPLICATION */,
                    'markdownDescription': (0, nls_1.localize)(27, null)
                },
                'window.titleBarStyle': {
                    'type': 'string',
                    'enum': ['native', 'custom'],
                    'default': platform_2.$k ? 'native' : 'custom',
                    'scope': 1 /* ConfigurationScope.APPLICATION */,
                    'description': (0, nls_1.localize)(28, null)
                },
                'window.dialogStyle': {
                    'type': 'string',
                    'enum': ['native', 'custom'],
                    'default': 'native',
                    'scope': 1 /* ConfigurationScope.APPLICATION */,
                    'description': (0, nls_1.localize)(29, null)
                },
                'window.nativeTabs': {
                    'type': 'boolean',
                    'default': false,
                    'scope': 1 /* ConfigurationScope.APPLICATION */,
                    'description': (0, nls_1.localize)(30, null),
                    'included': platform_2.$j
                },
                'window.nativeFullScreen': {
                    'type': 'boolean',
                    'default': true,
                    'description': (0, nls_1.localize)(31, null),
                    'scope': 1 /* ConfigurationScope.APPLICATION */,
                    'included': platform_2.$j
                },
                'window.clickThroughInactive': {
                    'type': 'boolean',
                    'default': true,
                    'scope': 1 /* ConfigurationScope.APPLICATION */,
                    'description': (0, nls_1.localize)(32, null),
                    'included': platform_2.$j
                }
            }
        });
        // Telemetry
        registry.registerConfiguration({
            'id': 'telemetry',
            'order': 110,
            title: (0, nls_1.localize)(33, null),
            'type': 'object',
            'properties': {
                'telemetry.enableCrashReporter': {
                    'type': 'boolean',
                    'description': (0, nls_1.localize)(34, null),
                    'default': true,
                    'tags': ['usesOnlineServices', 'telemetry'],
                    'markdownDeprecationMessage': (0, nls_1.localize)(35, null, `\`#${telemetry_1.$dl}#\``),
                }
            }
        });
        // Keybinding
        registry.registerConfiguration({
            'id': 'keyboard',
            'order': 15,
            'type': 'object',
            'title': (0, nls_1.localize)(36, null),
            'properties': {
                'keyboard.touchbar.enabled': {
                    'type': 'boolean',
                    'default': true,
                    'description': (0, nls_1.localize)(37, null),
                    'included': platform_2.$j
                },
                'keyboard.touchbar.ignored': {
                    'type': 'array',
                    'items': {
                        'type': 'string'
                    },
                    'default': [],
                    'markdownDescription': (0, nls_1.localize)(38, null),
                    'included': platform_2.$j
                }
            }
        });
    })();
    // JSON Schemas
    (function registerJSONSchemas() {
        const argvDefinitionFileSchemaId = 'vscode://schemas/argv';
        const jsonRegistry = platform_1.$8m.as(jsonContributionRegistry_1.$9m.JSONContribution);
        const schema = {
            id: argvDefinitionFileSchemaId,
            allowComments: true,
            allowTrailingCommas: true,
            description: 'VSCode static command line definition file',
            type: 'object',
            additionalProperties: false,
            properties: {
                locale: {
                    type: 'string',
                    description: (0, nls_1.localize)(39, null)
                },
                'disable-hardware-acceleration': {
                    type: 'boolean',
                    description: (0, nls_1.localize)(40, null)
                },
                'force-color-profile': {
                    type: 'string',
                    markdownDescription: (0, nls_1.localize)(41, null)
                },
                'enable-crash-reporter': {
                    type: 'boolean',
                    markdownDescription: (0, nls_1.localize)(42, null)
                },
                'crash-reporter-id': {
                    type: 'string',
                    markdownDescription: (0, nls_1.localize)(43, null)
                },
                'enable-proposed-api': {
                    type: 'array',
                    description: (0, nls_1.localize)(44, null),
                    items: {
                        type: 'string'
                    }
                },
                'log-level': {
                    type: ['string', 'array'],
                    description: (0, nls_1.localize)(45, null)
                },
                'disable-chromium-sandbox': {
                    type: 'boolean',
                    description: (0, nls_1.localize)(46, null)
                }
            }
        };
        if (platform_2.$k) {
            schema.properties['force-renderer-accessibility'] = {
                type: 'boolean',
                description: (0, nls_1.localize)(47, null),
            };
        }
        jsonRegistry.registerSchema(argvDefinitionFileSchemaId, schema);
    })();
});
//# sourceMappingURL=desktop.contribution.js.map