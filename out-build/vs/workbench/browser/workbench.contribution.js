/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/registry/common/platform", "vs/nls!vs/workbench/browser/workbench.contribution", "vs/platform/configuration/common/configurationRegistry", "vs/base/common/platform", "vs/workbench/common/configuration", "vs/base/browser/browser", "vs/workbench/common/contributions"], function (require, exports, platform_1, nls_1, configurationRegistry_1, platform_2, configuration_1, browser_1, contributions_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const registry = platform_1.$8m.as(configurationRegistry_1.$an.Configuration);
    // Configuration
    (function registerConfiguration() {
        // Migration support
        platform_1.$8m.as(contributions_1.Extensions.Workbench).registerWorkbenchContribution(configuration_1.$bz, 4 /* LifecyclePhase.Eventually */);
        // Dynamic Configuration
        platform_1.$8m.as(contributions_1.Extensions.Workbench).registerWorkbenchContribution(configuration_1.$cz, 2 /* LifecyclePhase.Ready */);
        // Workbench
        registry.registerConfiguration({
            ...configuration_1.$$y,
            'properties': {
                'workbench.editor.titleScrollbarSizing': {
                    type: 'string',
                    enum: ['default', 'large'],
                    enumDescriptions: [
                        (0, nls_1.localize)(0, null),
                        (0, nls_1.localize)(1, null)
                    ],
                    description: (0, nls_1.localize)(2, null),
                    default: 'default',
                },
                'workbench.editor.showTabs': {
                    'type': 'boolean',
                    'description': (0, nls_1.localize)(3, null),
                    'default': true
                },
                'workbench.editor.wrapTabs': {
                    'type': 'boolean',
                    'markdownDescription': (0, nls_1.localize)(4, null),
                    'default': false
                },
                'workbench.editor.scrollToSwitchTabs': {
                    'type': 'boolean',
                    'markdownDescription': (0, nls_1.localize)(5, null),
                    'default': false
                },
                'workbench.editor.highlightModifiedTabs': {
                    'type': 'boolean',
                    'markdownDescription': (0, nls_1.localize)(6, null),
                    'default': false
                },
                'workbench.editor.decorations.badges': {
                    'type': 'boolean',
                    'markdownDescription': (0, nls_1.localize)(7, null),
                    'default': true
                },
                'workbench.editor.decorations.colors': {
                    'type': 'boolean',
                    'markdownDescription': (0, nls_1.localize)(8, null),
                    'default': true
                },
                'workbench.editor.labelFormat': {
                    'type': 'string',
                    'enum': ['default', 'short', 'medium', 'long'],
                    'enumDescriptions': [
                        (0, nls_1.localize)(9, null),
                        (0, nls_1.localize)(10, null),
                        (0, nls_1.localize)(11, null),
                        (0, nls_1.localize)(12, null)
                    ],
                    'default': 'default',
                    'description': (0, nls_1.localize)(13, null),



                },
                'workbench.editor.untitled.labelFormat': {
                    'type': 'string',
                    'enum': ['content', 'name'],
                    'enumDescriptions': [
                        (0, nls_1.localize)(14, null),
                        (0, nls_1.localize)(15, null),
                    ],
                    'default': 'content',
                    'description': (0, nls_1.localize)(16, null),



                },
                'workbench.editor.empty.hint': {
                    'type': 'string',
                    'enum': ['text', 'hidden'],
                    'default': 'text',
                    'markdownDescription': (0, nls_1.localize)(17, null)
                },
                'workbench.editor.languageDetection': {
                    type: 'boolean',
                    default: true,
                    description: (0, nls_1.localize)(18, null),
                    scope: 5 /* ConfigurationScope.LANGUAGE_OVERRIDABLE */
                },
                'workbench.editor.historyBasedLanguageDetection': {
                    type: 'boolean',
                    default: true,
                    tags: ['experimental'],
                    description: (0, nls_1.localize)(19, null),
                },
                'workbench.editor.preferHistoryBasedLanguageDetection': {
                    type: 'boolean',
                    default: false,
                    tags: ['experimental'],
                    description: (0, nls_1.localize)(20, null),
                },
                'workbench.editor.languageDetectionHints': {
                    type: 'object',
                    default: { 'untitledEditors': true, 'notebookEditors': true },
                    tags: ['experimental'],
                    description: (0, nls_1.localize)(21, null),
                    additionalProperties: false,
                    properties: {
                        untitledEditors: {
                            type: 'boolean',
                            description: (0, nls_1.localize)(22, null),
                        },
                        notebookEditors: {
                            type: 'boolean',
                            description: (0, nls_1.localize)(23, null),
                        }
                    }
                },
                'workbench.editor.tabCloseButton': {
                    'type': 'string',
                    'enum': ['left', 'right', 'off'],
                    'default': 'right',
                    'markdownDescription': (0, nls_1.localize)(24, null)
                },
                'workbench.editor.tabSizing': {
                    'type': 'string',
                    'enum': ['fit', 'shrink', 'fixed'],
                    'default': 'fit',
                    'enumDescriptions': [
                        (0, nls_1.localize)(25, null),
                        (0, nls_1.localize)(26, null),
                        (0, nls_1.localize)(27, null)
                    ],
                    'markdownDescription': (0, nls_1.localize)(28, null)
                },
                'workbench.editor.tabSizingFixedMinWidth': {
                    'type': 'number',
                    'default': 50,
                    'minimum': 38,
                    'markdownDescription': (0, nls_1.localize)(29, null)
                },
                'workbench.editor.tabSizingFixedMaxWidth': {
                    'type': 'number',
                    'default': 160,
                    'minimum': 38,
                    'markdownDescription': (0, nls_1.localize)(30, null)
                },
                'workbench.editor.tabHeight': {
                    'type': 'string',
                    'enum': ['normal', 'compact'],
                    'default': 'normal',
                    'markdownDescription': (0, nls_1.localize)(31, null)
                },
                'workbench.editor.pinnedTabSizing': {
                    'type': 'string',
                    'enum': ['normal', 'compact', 'shrink'],
                    'default': 'normal',
                    'enumDescriptions': [
                        (0, nls_1.localize)(32, null),
                        (0, nls_1.localize)(33, null),
                        (0, nls_1.localize)(34, null)
                    ],
                    'markdownDescription': (0, nls_1.localize)(35, null)
                },
                'workbench.editor.preventPinnedEditorClose': {
                    'type': 'string',
                    'enum': ['keyboardAndMouse', 'keyboard', 'mouse', 'never'],
                    'default': 'keyboardAndMouse',
                    'enumDescriptions': [
                        (0, nls_1.localize)(36, null),
                        (0, nls_1.localize)(37, null),
                        (0, nls_1.localize)(38, null),
                        (0, nls_1.localize)(39, null)
                    ],
                    description: (0, nls_1.localize)(40, null),
                },
                'workbench.editor.splitSizing': {
                    'type': 'string',
                    'enum': ['auto', 'distribute', 'split'],
                    'default': 'auto',
                    'enumDescriptions': [
                        (0, nls_1.localize)(41, null),
                        (0, nls_1.localize)(42, null),
                        (0, nls_1.localize)(43, null)
                    ],
                    'description': (0, nls_1.localize)(44, null)
                },
                'workbench.editor.splitOnDragAndDrop': {
                    'type': 'boolean',
                    'default': true,
                    'description': (0, nls_1.localize)(45, null)
                },
                'workbench.editor.focusRecentEditorAfterClose': {
                    'type': 'boolean',
                    'description': (0, nls_1.localize)(46, null),
                    'default': true
                },
                'workbench.editor.showIcons': {
                    'type': 'boolean',
                    'description': (0, nls_1.localize)(47, null),
                    'default': true
                },
                'workbench.editor.enablePreview': {
                    'type': 'boolean',
                    'description': (0, nls_1.localize)(48, null),
                    'default': true
                },
                'workbench.editor.enablePreviewFromQuickOpen': {
                    'type': 'boolean',
                    'markdownDescription': (0, nls_1.localize)(49, null),
                    'default': false
                },
                'workbench.editor.enablePreviewFromCodeNavigation': {
                    'type': 'boolean',
                    'markdownDescription': (0, nls_1.localize)(50, null),
                    'default': false
                },
                'workbench.editor.closeOnFileDelete': {
                    'type': 'boolean',
                    'description': (0, nls_1.localize)(51, null),
                    'default': false
                },
                'workbench.editor.openPositioning': {
                    'type': 'string',
                    'enum': ['left', 'right', 'first', 'last'],
                    'default': 'right',
                    'markdownDescription': (0, nls_1.localize)(52, null)
                },
                'workbench.editor.openSideBySideDirection': {
                    'type': 'string',
                    'enum': ['right', 'down'],
                    'default': 'right',
                    'markdownDescription': (0, nls_1.localize)(53, null)
                },
                'workbench.editor.closeEmptyGroups': {
                    'type': 'boolean',
                    'description': (0, nls_1.localize)(54, null),
                    'default': true
                },
                'workbench.editor.revealIfOpen': {
                    'type': 'boolean',
                    'description': (0, nls_1.localize)(55, null),
                    'default': false
                },
                'workbench.editor.mouseBackForwardToNavigate': {
                    'type': 'boolean',
                    'description': (0, nls_1.localize)(56, null),
                    'default': true
                },
                'workbench.editor.navigationScope': {
                    'type': 'string',
                    'enum': ['default', 'editorGroup', 'editor'],
                    'default': 'default',
                    'markdownDescription': (0, nls_1.localize)(57, null),
                    'enumDescriptions': [
                        (0, nls_1.localize)(58, null),
                        (0, nls_1.localize)(59, null),
                        (0, nls_1.localize)(60, null)
                    ],
                },
                'workbench.editor.restoreViewState': {
                    'type': 'boolean',
                    'markdownDescription': (0, nls_1.localize)(61, null, '`#workbench.editor.sharedViewState#`'),
                    'default': true,
                    'scope': 5 /* ConfigurationScope.LANGUAGE_OVERRIDABLE */
                },
                'workbench.editor.sharedViewState': {
                    'type': 'boolean',
                    'description': (0, nls_1.localize)(62, null),
                    'default': false
                },
                'workbench.editor.splitInGroupLayout': {
                    'type': 'string',
                    'enum': ['vertical', 'horizontal'],
                    'default': 'horizontal',
                    'markdownDescription': (0, nls_1.localize)(63, null),
                    'enumDescriptions': [
                        (0, nls_1.localize)(64, null),
                        (0, nls_1.localize)(65, null)
                    ]
                },
                'workbench.editor.centeredLayoutAutoResize': {
                    'type': 'boolean',
                    'default': true,
                    'description': (0, nls_1.localize)(66, null)
                },
                'workbench.editor.centeredLayoutFixedWidth': {
                    'type': 'boolean',
                    'default': false,
                    'description': (0, nls_1.localize)(67, null)
                },
                'workbench.editor.doubleClickTabToToggleEditorGroupSizes': {
                    'type': 'boolean',
                    'default': true,
                    'markdownDescription': (0, nls_1.localize)(68, null)
                },
                'workbench.editor.limit.enabled': {
                    'type': 'boolean',
                    'default': false,
                    'description': (0, nls_1.localize)(69, null)
                },
                'workbench.editor.limit.value': {
                    'type': 'number',
                    'default': 10,
                    'exclusiveMinimum': 0,
                    'markdownDescription': (0, nls_1.localize)(70, null, '`#workbench.editor.limit.perEditorGroup#`')
                },
                'workbench.editor.limit.excludeDirty': {
                    'type': 'boolean',
                    'default': false,
                    'description': (0, nls_1.localize)(71, null)
                },
                'workbench.editor.limit.perEditorGroup': {
                    'type': 'boolean',
                    'default': false,
                    'description': (0, nls_1.localize)(72, null)
                },
                'workbench.localHistory.enabled': {
                    'type': 'boolean',
                    'default': true,
                    'description': (0, nls_1.localize)(73, null),
                    'scope': 4 /* ConfigurationScope.RESOURCE */
                },
                'workbench.localHistory.maxFileSize': {
                    'type': 'number',
                    'default': 256,
                    'minimum': 1,
                    'description': (0, nls_1.localize)(74, null),
                    'scope': 4 /* ConfigurationScope.RESOURCE */
                },
                'workbench.localHistory.maxFileEntries': {
                    'type': 'number',
                    'default': 50,
                    'minimum': 0,
                    'description': (0, nls_1.localize)(75, null),
                    'scope': 4 /* ConfigurationScope.RESOURCE */
                },
                'workbench.localHistory.exclude': {
                    'type': 'object',
                    'patternProperties': {
                        '.*': { 'type': 'boolean' }
                    },
                    'markdownDescription': (0, nls_1.localize)(76, null),
                    'scope': 4 /* ConfigurationScope.RESOURCE */
                },
                'workbench.localHistory.mergeWindow': {
                    'type': 'number',
                    'default': 10,
                    'minimum': 1,
                    'markdownDescription': (0, nls_1.localize)(77, null),
                    'scope': 4 /* ConfigurationScope.RESOURCE */
                },
                'workbench.commandPalette.history': {
                    'type': 'number',
                    'description': (0, nls_1.localize)(78, null),
                    'default': 50,
                    'minimum': 0
                },
                'workbench.commandPalette.preserveInput': {
                    'type': 'boolean',
                    'description': (0, nls_1.localize)(79, null),
                    'default': false
                },
                'workbench.commandPalette.experimental.suggestCommands': {
                    'type': 'boolean',
                    tags: ['experimental'],
                    'description': (0, nls_1.localize)(80, null),
                    'default': false
                },
                'workbench.commandPalette.experimental.askChatLocation': {
                    'type': 'string',
                    tags: ['experimental'],
                    'description': (0, nls_1.localize)(81, null),
                    'default': 'chatView',
                    enum: ['chatView', 'quickChat'],
                    enumDescriptions: [
                        (0, nls_1.localize)(82, null),
                        (0, nls_1.localize)(83, null)
                    ]
                },
                'workbench.commandPalette.experimental.enableNaturalLanguageSearch': {
                    'type': 'boolean',
                    tags: ['experimental'],
                    'description': (0, nls_1.localize)(84, null),
                    'default': true
                },
                'workbench.quickOpen.closeOnFocusLost': {
                    'type': 'boolean',
                    'description': (0, nls_1.localize)(85, null),
                    'default': true
                },
                'workbench.quickOpen.preserveInput': {
                    'type': 'boolean',
                    'description': (0, nls_1.localize)(86, null),
                    'default': false
                },
                'workbench.settings.openDefaultSettings': {
                    'type': 'boolean',
                    'description': (0, nls_1.localize)(87, null),
                    'default': false
                },
                'workbench.settings.useSplitJSON': {
                    'type': 'boolean',
                    'markdownDescription': (0, nls_1.localize)(88, null),
                    'default': false
                },
                'workbench.settings.openDefaultKeybindings': {
                    'type': 'boolean',
                    'description': (0, nls_1.localize)(89, null),
                    'default': false
                },
                'workbench.sideBar.location': {
                    'type': 'string',
                    'enum': ['left', 'right'],
                    'default': 'left',
                    'description': (0, nls_1.localize)(90, null)
                },
                'workbench.panel.defaultLocation': {
                    'type': 'string',
                    'enum': ['left', 'bottom', 'right'],
                    'default': 'bottom',
                    'description': (0, nls_1.localize)(91, null),
                },
                'workbench.panel.opensMaximized': {
                    'type': 'string',
                    'enum': ['always', 'never', 'preserve'],
                    'default': 'preserve',
                    'description': (0, nls_1.localize)(92, null),
                    'enumDescriptions': [
                        (0, nls_1.localize)(93, null),
                        (0, nls_1.localize)(94, null),
                        (0, nls_1.localize)(95, null)
                    ]
                },
                'workbench.statusBar.visible': {
                    'type': 'boolean',
                    'default': true,
                    'description': (0, nls_1.localize)(96, null)
                },
                'workbench.activityBar.visible': {
                    'type': 'boolean',
                    'default': true,
                    'description': (0, nls_1.localize)(97, null)
                },
                'workbench.activityBar.iconClickBehavior': {
                    'type': 'string',
                    'enum': ['toggle', 'focus'],
                    'default': 'toggle',
                    'description': (0, nls_1.localize)(98, null),
                    'enumDescriptions': [
                        (0, nls_1.localize)(99, null),
                        (0, nls_1.localize)(100, null)
                    ]
                },
                'workbench.view.alwaysShowHeaderActions': {
                    'type': 'boolean',
                    'default': false,
                    'description': (0, nls_1.localize)(101, null)
                },
                'workbench.fontAliasing': {
                    'type': 'string',
                    'enum': ['default', 'antialiased', 'none', 'auto'],
                    'default': 'default',
                    'description': (0, nls_1.localize)(102, null),
                    'enumDescriptions': [
                        (0, nls_1.localize)(103, null),
                        (0, nls_1.localize)(104, null),
                        (0, nls_1.localize)(105, null),
                        (0, nls_1.localize)(106, null)
                    ],
                    'included': platform_2.$j
                },
                'workbench.settings.editor': {
                    'type': 'string',
                    'enum': ['ui', 'json'],
                    'enumDescriptions': [
                        (0, nls_1.localize)(107, null),
                        (0, nls_1.localize)(108, null),
                    ],
                    'description': (0, nls_1.localize)(109, null),
                    'default': 'ui',
                    'scope': 3 /* ConfigurationScope.WINDOW */
                },
                'workbench.hover.delay': {
                    'type': 'number',
                    'description': (0, nls_1.localize)(110, null),
                    // Testing has indicated that on Windows and Linux 500 ms matches the native hovers most closely.
                    // On Mac, the delay is 1500.
                    'default': platform_2.$j ? 1500 : 500,
                    'minimum': 0
                },
                'workbench.reduceMotion': {
                    type: 'string',
                    description: (0, nls_1.localize)(111, null),
                    'enumDescriptions': [
                        (0, nls_1.localize)(112, null),
                        (0, nls_1.localize)(113, null),
                        (0, nls_1.localize)(114, null),
                    ],
                    default: 'auto',
                    tags: ['accessibility'],
                    enum: ['on', 'off', 'auto']
                },
                'workbench.layoutControl.enabled': {
                    'type': 'boolean',
                    'default': true,
                    'markdownDescription': platform_2.$o ?
                        (0, nls_1.localize)(115, null) :
                        (0, nls_1.localize)(116, null, '`#window.titleBarStyle#`', '`custom`')
                },
                'workbench.layoutControl.type': {
                    'type': 'string',
                    'enum': ['menu', 'toggles', 'both'],
                    'enumDescriptions': [
                        (0, nls_1.localize)(117, null),
                        (0, nls_1.localize)(118, null),
                        (0, nls_1.localize)(119, null),
                    ],
                    'default': 'both',
                    'description': (0, nls_1.localize)(120, null),
                },
                'workbench.tips.enabled': {
                    'type': 'boolean',
                    'default': true,
                    'description': (0, nls_1.localize)(121, null)
                },
            }
        });
        // Window
        let windowTitleDescription = (0, nls_1.localize)(122, null);
        windowTitleDescription += '\n- ' + [
            (0, nls_1.localize)(123, null),
            (0, nls_1.localize)(124, null),
            (0, nls_1.localize)(125, null),
            (0, nls_1.localize)(126, null),
            (0, nls_1.localize)(127, null),
            (0, nls_1.localize)(128, null),
            (0, nls_1.localize)(129, null),
            (0, nls_1.localize)(130, null),
            (0, nls_1.localize)(131, null),
            (0, nls_1.localize)(132, null),
            (0, nls_1.localize)(133, null),
            (0, nls_1.localize)(134, null),
            (0, nls_1.localize)(135, null),
            (0, nls_1.localize)(136, null),
            (0, nls_1.localize)(137, null),
            (0, nls_1.localize)(138, null),
            (0, nls_1.localize)(139, null)
        ].join('\n- '); // intentionally concatenated to not produce a string that is too long for translations
        registry.registerConfiguration({
            'id': 'window',
            'order': 8,
            'title': (0, nls_1.localize)(140, null),
            'type': 'object',
            'properties': {
                'window.title': {
                    'type': 'string',
                    'default': (() => {
                        if (platform_2.$j && platform_2.$m) {
                            return '${activeEditorShort}${separator}${rootName}${separator}${profileName}'; // macOS has native dirty indicator
                        }
                        const base = '${dirty}${activeEditorShort}${separator}${rootName}${separator}${profileName}${separator}${appName}';
                        if (platform_2.$o) {
                            return base + '${separator}${remoteName}'; // Web: always show remote name
                        }
                        return base;
                    })(),
                    'markdownDescription': windowTitleDescription
                },
                'window.titleSeparator': {
                    'type': 'string',
                    'default': platform_2.$j ? ' \u2014 ' : ' - ',
                    'markdownDescription': (0, nls_1.localize)(141, null, '`#window.title#`')
                },
                'window.commandCenter': {
                    type: 'boolean',
                    default: true,
                    markdownDescription: platform_2.$o ?
                        (0, nls_1.localize)(142, null) :
                        (0, nls_1.localize)(143, null, '`#window.titleBarStyle#`', '`custom`')
                },
                'window.menuBarVisibility': {
                    'type': 'string',
                    'enum': ['classic', 'visible', 'toggle', 'hidden', 'compact'],
                    'markdownEnumDescriptions': [
                        (0, nls_1.localize)(144, null),
                        (0, nls_1.localize)(145, null),
                        platform_2.$j ?
                            (0, nls_1.localize)(146, null) :
                            (0, nls_1.localize)(147, null),
                        (0, nls_1.localize)(148, null),
                        platform_2.$o ?
                            (0, nls_1.localize)(149, null) :
                            (0, nls_1.localize)(150, null, '`#window.titleBarStyle#`', '`native`')
                    ],
                    'default': platform_2.$o ? 'compact' : 'classic',
                    'scope': 1 /* ConfigurationScope.APPLICATION */,
                    'markdownDescription': platform_2.$j ?
                        (0, nls_1.localize)(151, null) :
                        (0, nls_1.localize)(152, null),
                    'included': platform_2.$i || platform_2.$k || platform_2.$o
                },
                'window.enableMenuBarMnemonics': {
                    'type': 'boolean',
                    'default': true,
                    'scope': 1 /* ConfigurationScope.APPLICATION */,
                    'description': (0, nls_1.localize)(153, null),
                    'included': platform_2.$i || platform_2.$k
                },
                'window.customMenuBarAltFocus': {
                    'type': 'boolean',
                    'default': true,
                    'scope': 1 /* ConfigurationScope.APPLICATION */,
                    'markdownDescription': (0, nls_1.localize)(154, null),
                    'included': platform_2.$i || platform_2.$k
                },
                'window.openFilesInNewWindow': {
                    'type': 'string',
                    'enum': ['on', 'off', 'default'],
                    'enumDescriptions': [
                        (0, nls_1.localize)(155, null),
                        (0, nls_1.localize)(156, null),
                        platform_2.$j ?
                            (0, nls_1.localize)(157, null) :
                            (0, nls_1.localize)(158, null)
                    ],
                    'default': 'off',
                    'scope': 1 /* ConfigurationScope.APPLICATION */,
                    'markdownDescription': platform_2.$j ?
                        (0, nls_1.localize)(159, null) :
                        (0, nls_1.localize)(160, null)
                },
                'window.openFoldersInNewWindow': {
                    'type': 'string',
                    'enum': ['on', 'off', 'default'],
                    'enumDescriptions': [
                        (0, nls_1.localize)(161, null),
                        (0, nls_1.localize)(162, null),
                        (0, nls_1.localize)(163, null)
                    ],
                    'default': 'default',
                    'scope': 1 /* ConfigurationScope.APPLICATION */,
                    'markdownDescription': (0, nls_1.localize)(164, null)
                },
                'window.confirmBeforeClose': {
                    'type': 'string',
                    'enum': ['always', 'keyboardOnly', 'never'],
                    'enumDescriptions': [
                        platform_2.$o ?
                            (0, nls_1.localize)(165, null) :
                            (0, nls_1.localize)(166, null),
                        platform_2.$o ?
                            (0, nls_1.localize)(167, null) :
                            (0, nls_1.localize)(168, null),
                        platform_2.$o ?
                            (0, nls_1.localize)(169, null) :
                            (0, nls_1.localize)(170, null)
                    ],
                    'default': (platform_2.$o && !(0, browser_1.$_N)()) ? 'keyboardOnly' : 'never',
                    'markdownDescription': platform_2.$o ?
                        (0, nls_1.localize)(171, null) :
                        (0, nls_1.localize)(172, null),
                    'scope': 1 /* ConfigurationScope.APPLICATION */
                }
            }
        });
        // Zen Mode
        registry.registerConfiguration({
            'id': 'zenMode',
            'order': 9,
            'title': (0, nls_1.localize)(173, null),
            'type': 'object',
            'properties': {
                'zenMode.fullScreen': {
                    'type': 'boolean',
                    'default': true,
                    'description': (0, nls_1.localize)(174, null)
                },
                'zenMode.centerLayout': {
                    'type': 'boolean',
                    'default': true,
                    'description': (0, nls_1.localize)(175, null)
                },
                'zenMode.hideTabs': {
                    'type': 'boolean',
                    'default': true,
                    'description': (0, nls_1.localize)(176, null)
                },
                'zenMode.hideStatusBar': {
                    'type': 'boolean',
                    'default': true,
                    'description': (0, nls_1.localize)(177, null)
                },
                'zenMode.hideActivityBar': {
                    'type': 'boolean',
                    'default': true,
                    'description': (0, nls_1.localize)(178, null)
                },
                'zenMode.hideLineNumbers': {
                    'type': 'boolean',
                    'default': true,
                    'description': (0, nls_1.localize)(179, null)
                },
                'zenMode.restore': {
                    'type': 'boolean',
                    'default': true,
                    'description': (0, nls_1.localize)(180, null)
                },
                'zenMode.silentNotifications': {
                    'type': 'boolean',
                    'default': true,
                    'description': (0, nls_1.localize)(181, null)
                }
            }
        });
    })();
});
//# sourceMappingURL=workbench.contribution.js.map