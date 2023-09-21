/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/registry/common/platform", "vs/nls", "vs/platform/configuration/common/configurationRegistry", "vs/base/common/platform", "vs/workbench/common/configuration", "vs/base/browser/browser", "vs/workbench/common/contributions"], function (require, exports, platform_1, nls_1, configurationRegistry_1, platform_2, configuration_1, browser_1, contributions_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const registry = platform_1.Registry.as(configurationRegistry_1.Extensions.Configuration);
    // Configuration
    (function registerConfiguration() {
        // Migration support
        platform_1.Registry.as(contributions_1.Extensions.Workbench).registerWorkbenchContribution(configuration_1.ConfigurationMigrationWorkbenchContribution, 4 /* LifecyclePhase.Eventually */);
        // Dynamic Configuration
        platform_1.Registry.as(contributions_1.Extensions.Workbench).registerWorkbenchContribution(configuration_1.DynamicWorkbenchConfigurationWorkbenchContribution, 2 /* LifecyclePhase.Ready */);
        // Workbench
        registry.registerConfiguration({
            ...configuration_1.workbenchConfigurationNodeBase,
            'properties': {
                'workbench.editor.titleScrollbarSizing': {
                    type: 'string',
                    enum: ['default', 'large'],
                    enumDescriptions: [
                        (0, nls_1.localize)('workbench.editor.titleScrollbarSizing.default', "The default size."),
                        (0, nls_1.localize)('workbench.editor.titleScrollbarSizing.large', "Increases the size, so it can be grabbed more easily with the mouse.")
                    ],
                    description: (0, nls_1.localize)('tabScrollbarHeight', "Controls the height of the scrollbars used for tabs and breadcrumbs in the editor title area."),
                    default: 'default',
                },
                'workbench.editor.showTabs': {
                    'type': 'boolean',
                    'description': (0, nls_1.localize)('showEditorTabs', "Controls whether opened editors should show in tabs or not."),
                    'default': true
                },
                'workbench.editor.wrapTabs': {
                    'type': 'boolean',
                    'markdownDescription': (0, nls_1.localize)('wrapTabs', "Controls whether tabs should be wrapped over multiple lines when exceeding available space or whether a scrollbar should appear instead. This value is ignored when `#workbench.editor.showTabs#` is disabled."),
                    'default': false
                },
                'workbench.editor.scrollToSwitchTabs': {
                    'type': 'boolean',
                    'markdownDescription': (0, nls_1.localize)({ comment: ['This is the description for a setting. Values surrounded by single quotes are not to be translated.'], key: 'scrollToSwitchTabs' }, "Controls whether scrolling over tabs will open them or not. By default tabs will only reveal upon scrolling, but not open. You can press and hold the Shift-key while scrolling to change this behavior for that duration. This value is ignored when `#workbench.editor.showTabs#` is disabled."),
                    'default': false
                },
                'workbench.editor.highlightModifiedTabs': {
                    'type': 'boolean',
                    'markdownDescription': (0, nls_1.localize)('highlightModifiedTabs', "Controls whether a top border is drawn on tabs for editors that have unsaved changes. This value is ignored when `#workbench.editor.showTabs#` is disabled."),
                    'default': false
                },
                'workbench.editor.decorations.badges': {
                    'type': 'boolean',
                    'markdownDescription': (0, nls_1.localize)('decorations.badges', "Controls whether editor file decorations should use badges."),
                    'default': true
                },
                'workbench.editor.decorations.colors': {
                    'type': 'boolean',
                    'markdownDescription': (0, nls_1.localize)('decorations.colors', "Controls whether editor file decorations should use colors."),
                    'default': true
                },
                'workbench.editor.labelFormat': {
                    'type': 'string',
                    'enum': ['default', 'short', 'medium', 'long'],
                    'enumDescriptions': [
                        (0, nls_1.localize)('workbench.editor.labelFormat.default', "Show the name of the file. When tabs are enabled and two files have the same name in one group the distinguishing sections of each file's path are added. When tabs are disabled, the path relative to the workspace folder is shown if the editor is active."),
                        (0, nls_1.localize)('workbench.editor.labelFormat.short', "Show the name of the file followed by its directory name."),
                        (0, nls_1.localize)('workbench.editor.labelFormat.medium', "Show the name of the file followed by its path relative to the workspace folder."),
                        (0, nls_1.localize)('workbench.editor.labelFormat.long', "Show the name of the file followed by its absolute path.")
                    ],
                    'default': 'default',
                    'description': (0, nls_1.localize)({
                        comment: ['This is the description for a setting. Values surrounded by parenthesis are not to be translated.'],
                        key: 'tabDescription'
                    }, "Controls the format of the label for an editor."),
                },
                'workbench.editor.untitled.labelFormat': {
                    'type': 'string',
                    'enum': ['content', 'name'],
                    'enumDescriptions': [
                        (0, nls_1.localize)('workbench.editor.untitled.labelFormat.content', "The name of the untitled file is derived from the contents of its first line unless it has an associated file path. It will fallback to the name in case the line is empty or contains no word characters."),
                        (0, nls_1.localize)('workbench.editor.untitled.labelFormat.name', "The name of the untitled file is not derived from the contents of the file."),
                    ],
                    'default': 'content',
                    'description': (0, nls_1.localize)({
                        comment: ['This is the description for a setting. Values surrounded by parenthesis are not to be translated.'],
                        key: 'untitledLabelFormat'
                    }, "Controls the format of the label for an untitled editor."),
                },
                'workbench.editor.empty.hint': {
                    'type': 'string',
                    'enum': ['text', 'hidden'],
                    'default': 'text',
                    'markdownDescription': (0, nls_1.localize)({ comment: ['This is the description for a setting. Values surrounded by single quotes are not to be translated.'], key: 'emptyEditorHint' }, "Controls if the empty editor text hint should be visible in the editor.")
                },
                'workbench.editor.languageDetection': {
                    type: 'boolean',
                    default: true,
                    description: (0, nls_1.localize)('workbench.editor.languageDetection', "Controls whether the language in a text editor is automatically detected unless the language has been explicitly set by the language picker. This can also be scoped by language so you can specify which languages you do not want to be switched off of. This is useful for languages like Markdown that often contain other languages that might trick language detection into thinking it's the embedded language and not Markdown."),
                    scope: 5 /* ConfigurationScope.LANGUAGE_OVERRIDABLE */
                },
                'workbench.editor.historyBasedLanguageDetection': {
                    type: 'boolean',
                    default: true,
                    tags: ['experimental'],
                    description: (0, nls_1.localize)('workbench.editor.historyBasedLanguageDetection', "Enables use of editor history in language detection. This causes automatic language detection to favor languages that have been recently opened and allows for automatic language detection to operate with smaller inputs."),
                },
                'workbench.editor.preferHistoryBasedLanguageDetection': {
                    type: 'boolean',
                    default: false,
                    tags: ['experimental'],
                    description: (0, nls_1.localize)('workbench.editor.preferBasedLanguageDetection', "When enabled, a language detection model that takes into account editor history will be given higher precedence."),
                },
                'workbench.editor.languageDetectionHints': {
                    type: 'object',
                    default: { 'untitledEditors': true, 'notebookEditors': true },
                    tags: ['experimental'],
                    description: (0, nls_1.localize)('workbench.editor.showLanguageDetectionHints', "When enabled, shows a Status bar Quick Fix when the editor language doesn't match detected content language."),
                    additionalProperties: false,
                    properties: {
                        untitledEditors: {
                            type: 'boolean',
                            description: (0, nls_1.localize)('workbench.editor.showLanguageDetectionHints.editors', "Show in untitled text editors"),
                        },
                        notebookEditors: {
                            type: 'boolean',
                            description: (0, nls_1.localize)('workbench.editor.showLanguageDetectionHints.notebook', "Show in notebook editors"),
                        }
                    }
                },
                'workbench.editor.tabCloseButton': {
                    'type': 'string',
                    'enum': ['left', 'right', 'off'],
                    'default': 'right',
                    'markdownDescription': (0, nls_1.localize)({ comment: ['This is the description for a setting. Values surrounded by single quotes are not to be translated.'], key: 'editorTabCloseButton' }, "Controls the position of the editor's tabs close buttons, or disables them when set to 'off'. This value is ignored when `#workbench.editor.showTabs#` is disabled.")
                },
                'workbench.editor.tabSizing': {
                    'type': 'string',
                    'enum': ['fit', 'shrink', 'fixed'],
                    'default': 'fit',
                    'enumDescriptions': [
                        (0, nls_1.localize)('workbench.editor.tabSizing.fit', "Always keep tabs large enough to show the full editor label."),
                        (0, nls_1.localize)('workbench.editor.tabSizing.shrink', "Allow tabs to get smaller when the available space is not enough to show all tabs at once."),
                        (0, nls_1.localize)('workbench.editor.tabSizing.fixed', "Make all tabs the same size, while allowing them to get smaller when the available space is not enough to show all tabs at once.")
                    ],
                    'markdownDescription': (0, nls_1.localize)({ comment: ['This is the description for a setting. Values surrounded by single quotes are not to be translated.'], key: 'tabSizing' }, "Controls the size of editor tabs. This value is ignored when `#workbench.editor.showTabs#` is disabled.")
                },
                'workbench.editor.tabSizingFixedMinWidth': {
                    'type': 'number',
                    'default': 50,
                    'minimum': 38,
                    'markdownDescription': (0, nls_1.localize)({ comment: ['This is the description for a setting. Values surrounded by single quotes are not to be translated.'], key: 'workbench.editor.tabSizingFixedMinWidth' }, "Controls the minimum width of tabs when `#workbench.editor.tabSizing#` size is set to `fixed`.")
                },
                'workbench.editor.tabSizingFixedMaxWidth': {
                    'type': 'number',
                    'default': 160,
                    'minimum': 38,
                    'markdownDescription': (0, nls_1.localize)({ comment: ['This is the description for a setting. Values surrounded by single quotes are not to be translated.'], key: 'workbench.editor.tabSizingFixedMaxWidth' }, "Controls the maximum width of tabs when `#workbench.editor.tabSizing#` size is set to `fixed`.")
                },
                'workbench.editor.tabHeight': {
                    'type': 'string',
                    'enum': ['normal', 'compact'],
                    'default': 'normal',
                    'markdownDescription': (0, nls_1.localize)({ comment: ['This is the description for a setting. Values surrounded by single quotes are not to be translated.'], key: 'workbench.editor.tabHeight' }, "Controls the height of editor tabs. Also applies to the title control bar when `#workbench.editor.showTabs#` is disabled.")
                },
                'workbench.editor.pinnedTabSizing': {
                    'type': 'string',
                    'enum': ['normal', 'compact', 'shrink'],
                    'default': 'normal',
                    'enumDescriptions': [
                        (0, nls_1.localize)('workbench.editor.pinnedTabSizing.normal', "A pinned tab inherits the look of non pinned tabs."),
                        (0, nls_1.localize)('workbench.editor.pinnedTabSizing.compact', "A pinned tab will show in a compact form with only icon or first letter of the editor name."),
                        (0, nls_1.localize)('workbench.editor.pinnedTabSizing.shrink', "A pinned tab shrinks to a compact fixed size showing parts of the editor name.")
                    ],
                    'markdownDescription': (0, nls_1.localize)({ comment: ['This is the description for a setting. Values surrounded by single quotes are not to be translated.'], key: 'pinnedTabSizing' }, "Controls the size of pinned editor tabs. Pinned tabs are sorted to the beginning of all opened tabs and typically do not close until unpinned. This value is ignored when `#workbench.editor.showTabs#` is disabled.")
                },
                'workbench.editor.preventPinnedEditorClose': {
                    'type': 'string',
                    'enum': ['keyboardAndMouse', 'keyboard', 'mouse', 'never'],
                    'default': 'keyboardAndMouse',
                    'enumDescriptions': [
                        (0, nls_1.localize)('workbench.editor.preventPinnedEditorClose.always', "Always prevent closing the pinned editor when using mouse middle click or keyboard."),
                        (0, nls_1.localize)('workbench.editor.preventPinnedEditorClose.onlyKeyboard', "Prevent closing the pinned editor when using the keyboard."),
                        (0, nls_1.localize)('workbench.editor.preventPinnedEditorClose.onlyMouse', "Prevent closing the pinned editor when using mouse middle click."),
                        (0, nls_1.localize)('workbench.editor.preventPinnedEditorClose.never', "Never prevent closing a pinned editor.")
                    ],
                    description: (0, nls_1.localize)('workbench.editor.preventPinnedEditorClose', "Controls whether pinned editors should close when keyboard or middle mouse click is used for closing."),
                },
                'workbench.editor.splitSizing': {
                    'type': 'string',
                    'enum': ['auto', 'distribute', 'split'],
                    'default': 'auto',
                    'enumDescriptions': [
                        (0, nls_1.localize)('workbench.editor.splitSizingAuto', "Splits the active editor group to equal parts, unless all editor groups are already in equal parts. In that case, splits all the editor groups to equal parts."),
                        (0, nls_1.localize)('workbench.editor.splitSizingDistribute', "Splits all the editor groups to equal parts."),
                        (0, nls_1.localize)('workbench.editor.splitSizingSplit', "Splits the active editor group to equal parts.")
                    ],
                    'description': (0, nls_1.localize)({ comment: ['This is the description for a setting. Values surrounded by single quotes are not to be translated.'], key: 'splitSizing' }, "Controls the size of editor groups when splitting them.")
                },
                'workbench.editor.splitOnDragAndDrop': {
                    'type': 'boolean',
                    'default': true,
                    'description': (0, nls_1.localize)('splitOnDragAndDrop', "Controls if editor groups can be split from drag and drop operations by dropping an editor or file on the edges of the editor area.")
                },
                'workbench.editor.focusRecentEditorAfterClose': {
                    'type': 'boolean',
                    'description': (0, nls_1.localize)('focusRecentEditorAfterClose', "Controls whether editors are closed in most recently used order or from left to right."),
                    'default': true
                },
                'workbench.editor.showIcons': {
                    'type': 'boolean',
                    'description': (0, nls_1.localize)('showIcons', "Controls whether opened editors should show with an icon or not. This requires a file icon theme to be enabled as well."),
                    'default': true
                },
                'workbench.editor.enablePreview': {
                    'type': 'boolean',
                    'description': (0, nls_1.localize)('enablePreview', "Controls whether opened editors show as preview editors. Preview editors do not stay open, are reused until explicitly set to be kept open (via double-click or editing), and show file names in italics."),
                    'default': true
                },
                'workbench.editor.enablePreviewFromQuickOpen': {
                    'type': 'boolean',
                    'markdownDescription': (0, nls_1.localize)('enablePreviewFromQuickOpen', "Controls whether editors opened from Quick Open show as preview editors. Preview editors do not stay open, and are reused until explicitly set to be kept open (via double-click or editing). When enabled, hold Ctrl before selection to open an editor as a non-preview. This value is ignored when `#workbench.editor.enablePreview#` is disabled."),
                    'default': false
                },
                'workbench.editor.enablePreviewFromCodeNavigation': {
                    'type': 'boolean',
                    'markdownDescription': (0, nls_1.localize)('enablePreviewFromCodeNavigation', "Controls whether editors remain in preview when a code navigation is started from them. Preview editors do not stay open, and are reused until explicitly set to be kept open (via double-click or editing). This value is ignored when `#workbench.editor.enablePreview#` is disabled."),
                    'default': false
                },
                'workbench.editor.closeOnFileDelete': {
                    'type': 'boolean',
                    'description': (0, nls_1.localize)('closeOnFileDelete', "Controls whether editors showing a file that was opened during the session should close automatically when getting deleted or renamed by some other process. Disabling this will keep the editor open  on such an event. Note that deleting from within the application will always close the editor and that editors with unsaved changes will never close to preserve your data."),
                    'default': false
                },
                'workbench.editor.openPositioning': {
                    'type': 'string',
                    'enum': ['left', 'right', 'first', 'last'],
                    'default': 'right',
                    'markdownDescription': (0, nls_1.localize)({ comment: ['This is the description for a setting. Values surrounded by single quotes are not to be translated.'], key: 'editorOpenPositioning' }, "Controls where editors open. Select `left` or `right` to open editors to the left or right of the currently active one. Select `first` or `last` to open editors independently from the currently active one.")
                },
                'workbench.editor.openSideBySideDirection': {
                    'type': 'string',
                    'enum': ['right', 'down'],
                    'default': 'right',
                    'markdownDescription': (0, nls_1.localize)('sideBySideDirection', "Controls the default direction of editors that are opened side by side (for example, from the Explorer). By default, editors will open on the right hand side of the currently active one. If changed to `down`, the editors will open below the currently active one.")
                },
                'workbench.editor.closeEmptyGroups': {
                    'type': 'boolean',
                    'description': (0, nls_1.localize)('closeEmptyGroups', "Controls the behavior of empty editor groups when the last tab in the group is closed. When enabled, empty groups will automatically close. When disabled, empty groups will remain part of the grid."),
                    'default': true
                },
                'workbench.editor.revealIfOpen': {
                    'type': 'boolean',
                    'description': (0, nls_1.localize)('revealIfOpen', "Controls whether an editor is revealed in any of the visible groups if opened. If disabled, an editor will prefer to open in the currently active editor group. If enabled, an already opened editor will be revealed instead of opened again in the currently active editor group. Note that there are some cases where this setting is ignored, such as when forcing an editor to open in a specific group or to the side of the currently active group."),
                    'default': false
                },
                'workbench.editor.mouseBackForwardToNavigate': {
                    'type': 'boolean',
                    'description': (0, nls_1.localize)('mouseBackForwardToNavigate', "Enables the use of mouse buttons four and five for commands 'Go Back' and 'Go Forward'."),
                    'default': true
                },
                'workbench.editor.navigationScope': {
                    'type': 'string',
                    'enum': ['default', 'editorGroup', 'editor'],
                    'default': 'default',
                    'markdownDescription': (0, nls_1.localize)('navigationScope', "Controls the scope of history navigation in editors for commands such as 'Go Back' and 'Go Forward'."),
                    'enumDescriptions': [
                        (0, nls_1.localize)('workbench.editor.navigationScopeDefault', "Navigate across all opened editors and editor groups."),
                        (0, nls_1.localize)('workbench.editor.navigationScopeEditorGroup', "Navigate only in editors of the active editor group."),
                        (0, nls_1.localize)('workbench.editor.navigationScopeEditor', "Navigate only in the active editor.")
                    ],
                },
                'workbench.editor.restoreViewState': {
                    'type': 'boolean',
                    'markdownDescription': (0, nls_1.localize)('restoreViewState', "Restores the last editor view state (such as scroll position) when re-opening editors after they have been closed. Editor view state is stored per editor group and discarded when a group closes. Use the {0} setting to use the last known view state across all editor groups in case no previous view state was found for a editor group.", '`#workbench.editor.sharedViewState#`'),
                    'default': true,
                    'scope': 5 /* ConfigurationScope.LANGUAGE_OVERRIDABLE */
                },
                'workbench.editor.sharedViewState': {
                    'type': 'boolean',
                    'description': (0, nls_1.localize)('sharedViewState', "Preserves the most recent editor view state (such as scroll position) across all editor groups and restores that if no specific editor view state is found for the editor group."),
                    'default': false
                },
                'workbench.editor.splitInGroupLayout': {
                    'type': 'string',
                    'enum': ['vertical', 'horizontal'],
                    'default': 'horizontal',
                    'markdownDescription': (0, nls_1.localize)('splitInGroupLayout', "Controls the layout for when an editor is split in an editor group to be either vertical or horizontal."),
                    'enumDescriptions': [
                        (0, nls_1.localize)('workbench.editor.splitInGroupLayoutVertical', "Editors are positioned from top to bottom."),
                        (0, nls_1.localize)('workbench.editor.splitInGroupLayoutHorizontal', "Editors are positioned from left to right.")
                    ]
                },
                'workbench.editor.centeredLayoutAutoResize': {
                    'type': 'boolean',
                    'default': true,
                    'description': (0, nls_1.localize)('centeredLayoutAutoResize', "Controls if the centered layout should automatically resize to maximum width when more than one group is open. Once only one group is open it will resize back to the original centered width.")
                },
                'workbench.editor.centeredLayoutFixedWidth': {
                    'type': 'boolean',
                    'default': false,
                    'description': (0, nls_1.localize)('centeredLayoutDynamicWidth', "Controls whether the centered layout tries to maintain constant width when the window is resized.")
                },
                'workbench.editor.doubleClickTabToToggleEditorGroupSizes': {
                    'type': 'boolean',
                    'default': true,
                    'markdownDescription': (0, nls_1.localize)({ comment: ['This is the description for a setting. Values surrounded by single quotes are not to be translated.'], key: 'doubleClickTabToToggleEditorGroupSizes' }, "Controls whether to maximize/restore the editor group when double clicking on a tab. This value is ignored when `#workbench.editor.showTabs#` is disabled.")
                },
                'workbench.editor.limit.enabled': {
                    'type': 'boolean',
                    'default': false,
                    'description': (0, nls_1.localize)('limitEditorsEnablement', "Controls if the number of opened editors should be limited or not. When enabled, less recently used editors will close to make space for newly opening editors.")
                },
                'workbench.editor.limit.value': {
                    'type': 'number',
                    'default': 10,
                    'exclusiveMinimum': 0,
                    'markdownDescription': (0, nls_1.localize)('limitEditorsMaximum', "Controls the maximum number of opened editors. Use the {0} setting to control this limit per editor group or across all groups.", '`#workbench.editor.limit.perEditorGroup#`')
                },
                'workbench.editor.limit.excludeDirty': {
                    'type': 'boolean',
                    'default': false,
                    'description': (0, nls_1.localize)('limitEditorsExcludeDirty', "Controls if the maximum number of opened editors should exclude dirty editors for counting towards the configured limit.")
                },
                'workbench.editor.limit.perEditorGroup': {
                    'type': 'boolean',
                    'default': false,
                    'description': (0, nls_1.localize)('perEditorGroup', "Controls if the limit of maximum opened editors should apply per editor group or across all editor groups.")
                },
                'workbench.localHistory.enabled': {
                    'type': 'boolean',
                    'default': true,
                    'description': (0, nls_1.localize)('localHistoryEnabled', "Controls whether local file history is enabled. When enabled, the file contents of an editor that is saved will be stored to a backup location to be able to restore or review the contents later. Changing this setting has no effect on existing local file history entries."),
                    'scope': 4 /* ConfigurationScope.RESOURCE */
                },
                'workbench.localHistory.maxFileSize': {
                    'type': 'number',
                    'default': 256,
                    'minimum': 1,
                    'description': (0, nls_1.localize)('localHistoryMaxFileSize', "Controls the maximum size of a file (in KB) to be considered for local file history. Files that are larger will not be added to the local file history. Changing this setting has no effect on existing local file history entries."),
                    'scope': 4 /* ConfigurationScope.RESOURCE */
                },
                'workbench.localHistory.maxFileEntries': {
                    'type': 'number',
                    'default': 50,
                    'minimum': 0,
                    'description': (0, nls_1.localize)('localHistoryMaxFileEntries', "Controls the maximum number of local file history entries per file. When the number of local file history entries exceeds this number for a file, the oldest entries will be discarded."),
                    'scope': 4 /* ConfigurationScope.RESOURCE */
                },
                'workbench.localHistory.exclude': {
                    'type': 'object',
                    'patternProperties': {
                        '.*': { 'type': 'boolean' }
                    },
                    'markdownDescription': (0, nls_1.localize)('exclude', "Configure paths or [glob patterns](https://aka.ms/vscode-glob-patterns) for excluding files from the local file history. Glob patterns are always evaluated relative to the path of the workspace folder unless they are absolute paths. Changing this setting has no effect on existing local file history entries."),
                    'scope': 4 /* ConfigurationScope.RESOURCE */
                },
                'workbench.localHistory.mergeWindow': {
                    'type': 'number',
                    'default': 10,
                    'minimum': 1,
                    'markdownDescription': (0, nls_1.localize)('mergeWindow', "Configure an interval in seconds during which the last entry in local file history is replaced with the entry that is being added. This helps reduce the overall number of entries that are added, for example when auto save is enabled. This setting is only applied to entries that have the same source of origin. Changing this setting has no effect on existing local file history entries."),
                    'scope': 4 /* ConfigurationScope.RESOURCE */
                },
                'workbench.commandPalette.history': {
                    'type': 'number',
                    'description': (0, nls_1.localize)('commandHistory', "Controls the number of recently used commands to keep in history for the command palette. Set to 0 to disable command history."),
                    'default': 50,
                    'minimum': 0
                },
                'workbench.commandPalette.preserveInput': {
                    'type': 'boolean',
                    'description': (0, nls_1.localize)('preserveInput', "Controls whether the last typed input to the command palette should be restored when opening it the next time."),
                    'default': false
                },
                'workbench.commandPalette.experimental.suggestCommands': {
                    'type': 'boolean',
                    tags: ['experimental'],
                    'description': (0, nls_1.localize)('suggestCommands', "Controls whether the command palette should have a list of commonly used commands."),
                    'default': false
                },
                'workbench.commandPalette.experimental.askChatLocation': {
                    'type': 'string',
                    tags: ['experimental'],
                    'description': (0, nls_1.localize)('askChatLocation', "Controls where the command palette should ask chat questions."),
                    'default': 'chatView',
                    enum: ['chatView', 'quickChat'],
                    enumDescriptions: [
                        (0, nls_1.localize)('askChatLocation.chatView', "Ask chat questions in the Chat view."),
                        (0, nls_1.localize)('askChatLocation.quickChat', "Ask chat questions in Quick Chat.")
                    ]
                },
                'workbench.commandPalette.experimental.enableNaturalLanguageSearch': {
                    'type': 'boolean',
                    tags: ['experimental'],
                    'description': (0, nls_1.localize)('enableNaturalLanguageSearch', "Controls whether the command palette should include similar commands. You must have an extension installed that provides Natural Language support."),
                    'default': true
                },
                'workbench.quickOpen.closeOnFocusLost': {
                    'type': 'boolean',
                    'description': (0, nls_1.localize)('closeOnFocusLost', "Controls whether Quick Open should close automatically once it loses focus."),
                    'default': true
                },
                'workbench.quickOpen.preserveInput': {
                    'type': 'boolean',
                    'description': (0, nls_1.localize)('workbench.quickOpen.preserveInput', "Controls whether the last typed input to Quick Open should be restored when opening it the next time."),
                    'default': false
                },
                'workbench.settings.openDefaultSettings': {
                    'type': 'boolean',
                    'description': (0, nls_1.localize)('openDefaultSettings', "Controls whether opening settings also opens an editor showing all default settings."),
                    'default': false
                },
                'workbench.settings.useSplitJSON': {
                    'type': 'boolean',
                    'markdownDescription': (0, nls_1.localize)('useSplitJSON', "Controls whether to use the split JSON editor when editing settings as JSON."),
                    'default': false
                },
                'workbench.settings.openDefaultKeybindings': {
                    'type': 'boolean',
                    'description': (0, nls_1.localize)('openDefaultKeybindings', "Controls whether opening keybinding settings also opens an editor showing all default keybindings."),
                    'default': false
                },
                'workbench.sideBar.location': {
                    'type': 'string',
                    'enum': ['left', 'right'],
                    'default': 'left',
                    'description': (0, nls_1.localize)('sideBarLocation', "Controls the location of the primary side bar and activity bar. They can either show on the left or right of the workbench. The secondary side bar will show on the opposite side of the workbench.")
                },
                'workbench.panel.defaultLocation': {
                    'type': 'string',
                    'enum': ['left', 'bottom', 'right'],
                    'default': 'bottom',
                    'description': (0, nls_1.localize)('panelDefaultLocation', "Controls the default location of the panel (Terminal, Debug Console, Output, Problems) in a new workspace. It can either show at the bottom, right, or left of the editor area."),
                },
                'workbench.panel.opensMaximized': {
                    'type': 'string',
                    'enum': ['always', 'never', 'preserve'],
                    'default': 'preserve',
                    'description': (0, nls_1.localize)('panelOpensMaximized', "Controls whether the panel opens maximized. It can either always open maximized, never open maximized, or open to the last state it was in before being closed."),
                    'enumDescriptions': [
                        (0, nls_1.localize)('workbench.panel.opensMaximized.always', "Always maximize the panel when opening it."),
                        (0, nls_1.localize)('workbench.panel.opensMaximized.never', "Never maximize the panel when opening it. The panel will open un-maximized."),
                        (0, nls_1.localize)('workbench.panel.opensMaximized.preserve', "Open the panel to the state that it was in, before it was closed.")
                    ]
                },
                'workbench.statusBar.visible': {
                    'type': 'boolean',
                    'default': true,
                    'description': (0, nls_1.localize)('statusBarVisibility', "Controls the visibility of the status bar at the bottom of the workbench.")
                },
                'workbench.activityBar.visible': {
                    'type': 'boolean',
                    'default': true,
                    'description': (0, nls_1.localize)('activityBarVisibility', "Controls the visibility of the activity bar in the workbench.")
                },
                'workbench.activityBar.iconClickBehavior': {
                    'type': 'string',
                    'enum': ['toggle', 'focus'],
                    'default': 'toggle',
                    'description': (0, nls_1.localize)('activityBarIconClickBehavior', "Controls the behavior of clicking an activity bar icon in the workbench."),
                    'enumDescriptions': [
                        (0, nls_1.localize)('workbench.activityBar.iconClickBehavior.toggle', "Hide the side bar if the clicked item is already visible."),
                        (0, nls_1.localize)('workbench.activityBar.iconClickBehavior.focus', "Focus side bar if the clicked item is already visible.")
                    ]
                },
                'workbench.view.alwaysShowHeaderActions': {
                    'type': 'boolean',
                    'default': false,
                    'description': (0, nls_1.localize)('viewVisibility', "Controls the visibility of view header actions. View header actions may either be always visible, or only visible when that view is focused or hovered over.")
                },
                'workbench.fontAliasing': {
                    'type': 'string',
                    'enum': ['default', 'antialiased', 'none', 'auto'],
                    'default': 'default',
                    'description': (0, nls_1.localize)('fontAliasing', "Controls font aliasing method in the workbench."),
                    'enumDescriptions': [
                        (0, nls_1.localize)('workbench.fontAliasing.default', "Sub-pixel font smoothing. On most non-retina displays this will give the sharpest text."),
                        (0, nls_1.localize)('workbench.fontAliasing.antialiased', "Smooth the font on the level of the pixel, as opposed to the subpixel. Can make the font appear lighter overall."),
                        (0, nls_1.localize)('workbench.fontAliasing.none', "Disables font smoothing. Text will show with jagged sharp edges."),
                        (0, nls_1.localize)('workbench.fontAliasing.auto', "Applies `default` or `antialiased` automatically based on the DPI of displays.")
                    ],
                    'included': platform_2.isMacintosh
                },
                'workbench.settings.editor': {
                    'type': 'string',
                    'enum': ['ui', 'json'],
                    'enumDescriptions': [
                        (0, nls_1.localize)('settings.editor.ui', "Use the settings UI editor."),
                        (0, nls_1.localize)('settings.editor.json', "Use the JSON file editor."),
                    ],
                    'description': (0, nls_1.localize)('settings.editor.desc', "Determines which settings editor to use by default."),
                    'default': 'ui',
                    'scope': 3 /* ConfigurationScope.WINDOW */
                },
                'workbench.hover.delay': {
                    'type': 'number',
                    'description': (0, nls_1.localize)('workbench.hover.delay', "Controls the delay in milliseconds after which the hover is shown for workbench items (ex. some extension provided tree view items). Already visible items may require a refresh before reflecting this setting change."),
                    // Testing has indicated that on Windows and Linux 500 ms matches the native hovers most closely.
                    // On Mac, the delay is 1500.
                    'default': platform_2.isMacintosh ? 1500 : 500,
                    'minimum': 0
                },
                'workbench.reduceMotion': {
                    type: 'string',
                    description: (0, nls_1.localize)('workbench.reduceMotion', "Controls whether the workbench should render with fewer animations."),
                    'enumDescriptions': [
                        (0, nls_1.localize)('workbench.reduceMotion.on', "Always render with reduced motion."),
                        (0, nls_1.localize)('workbench.reduceMotion.off', "Do not render with reduced motion"),
                        (0, nls_1.localize)('workbench.reduceMotion.auto', "Render with reduced motion based on OS configuration."),
                    ],
                    default: 'auto',
                    tags: ['accessibility'],
                    enum: ['on', 'off', 'auto']
                },
                'workbench.layoutControl.enabled': {
                    'type': 'boolean',
                    'default': true,
                    'markdownDescription': platform_2.isWeb ?
                        (0, nls_1.localize)('layoutControlEnabledWeb', "Controls whether the layout control in the title bar is shown.") :
                        (0, nls_1.localize)({ key: 'layoutControlEnabled', comment: ['{0} is a placeholder for a setting identifier.'] }, "Controls whether the layout control is shown in the custom title bar. This setting only has an effect when {0} is set to {1}.", '`#window.titleBarStyle#`', '`custom`')
                },
                'workbench.layoutControl.type': {
                    'type': 'string',
                    'enum': ['menu', 'toggles', 'both'],
                    'enumDescriptions': [
                        (0, nls_1.localize)('layoutcontrol.type.menu', "Shows a single button with a dropdown of layout options."),
                        (0, nls_1.localize)('layoutcontrol.type.toggles', "Shows several buttons for toggling the visibility of the panels and side bar."),
                        (0, nls_1.localize)('layoutcontrol.type.both', "Shows both the dropdown and toggle buttons."),
                    ],
                    'default': 'both',
                    'description': (0, nls_1.localize)('layoutControlType', "Controls whether the layout control in the custom title bar is displayed as a single menu button or with multiple UI toggles."),
                },
                'workbench.tips.enabled': {
                    'type': 'boolean',
                    'default': true,
                    'description': (0, nls_1.localize)('tips.enabled', "When enabled, will show the watermark tips when no editor is open.")
                },
            }
        });
        // Window
        let windowTitleDescription = (0, nls_1.localize)('windowTitle', "Controls the window title based on the current context such as the opened workspace or active editor. Variables are substituted based on the context:");
        windowTitleDescription += '\n- ' + [
            (0, nls_1.localize)('activeEditorShort', "`${activeEditorShort}`: the file name (e.g. myFile.txt)."),
            (0, nls_1.localize)('activeEditorMedium', "`${activeEditorMedium}`: the path of the file relative to the workspace folder (e.g. myFolder/myFileFolder/myFile.txt)."),
            (0, nls_1.localize)('activeEditorLong', "`${activeEditorLong}`: the full path of the file (e.g. /Users/Development/myFolder/myFileFolder/myFile.txt)."),
            (0, nls_1.localize)('activeFolderShort', "`${activeFolderShort}`: the name of the folder the file is contained in (e.g. myFileFolder)."),
            (0, nls_1.localize)('activeFolderMedium', "`${activeFolderMedium}`: the path of the folder the file is contained in, relative to the workspace folder (e.g. myFolder/myFileFolder)."),
            (0, nls_1.localize)('activeFolderLong', "`${activeFolderLong}`: the full path of the folder the file is contained in (e.g. /Users/Development/myFolder/myFileFolder)."),
            (0, nls_1.localize)('folderName', "`${folderName}`: name of the workspace folder the file is contained in (e.g. myFolder)."),
            (0, nls_1.localize)('folderPath', "`${folderPath}`: file path of the workspace folder the file is contained in (e.g. /Users/Development/myFolder)."),
            (0, nls_1.localize)('rootName', "`${rootName}`: name of the workspace with optional remote name and workspace indicator if applicable (e.g. myFolder, myRemoteFolder [SSH] or myWorkspace (Workspace))."),
            (0, nls_1.localize)('rootNameShort', "`${rootNameShort}`: shortened name of the workspace without suffixes (e.g. myFolder, myRemoteFolder or myWorkspace)."),
            (0, nls_1.localize)('rootPath', "`${rootPath}`: file path of the opened workspace or folder (e.g. /Users/Development/myWorkspace)."),
            (0, nls_1.localize)('profileName', "`${profileName}`: name of the profile in which the workspace is opened (e.g. Data Science (Profile)). Ignored if default profile is used."),
            (0, nls_1.localize)('appName', "`${appName}`: e.g. VS Code."),
            (0, nls_1.localize)('remoteName', "`${remoteName}`: e.g. SSH"),
            (0, nls_1.localize)('dirty', "`${dirty}`: an indicator for when the active editor has unsaved changes."),
            (0, nls_1.localize)('focusedView', "`${focusedView}`: the name of the view that is currently focused."),
            (0, nls_1.localize)('separator', "`${separator}`: a conditional separator (\" - \") that only shows when surrounded by variables with values or static text.")
        ].join('\n- '); // intentionally concatenated to not produce a string that is too long for translations
        registry.registerConfiguration({
            'id': 'window',
            'order': 8,
            'title': (0, nls_1.localize)('windowConfigurationTitle', "Window"),
            'type': 'object',
            'properties': {
                'window.title': {
                    'type': 'string',
                    'default': (() => {
                        if (platform_2.isMacintosh && platform_2.isNative) {
                            return '${activeEditorShort}${separator}${rootName}${separator}${profileName}'; // macOS has native dirty indicator
                        }
                        const base = '${dirty}${activeEditorShort}${separator}${rootName}${separator}${profileName}${separator}${appName}';
                        if (platform_2.isWeb) {
                            return base + '${separator}${remoteName}'; // Web: always show remote name
                        }
                        return base;
                    })(),
                    'markdownDescription': windowTitleDescription
                },
                'window.titleSeparator': {
                    'type': 'string',
                    'default': platform_2.isMacintosh ? ' \u2014 ' : ' - ',
                    'markdownDescription': (0, nls_1.localize)("window.titleSeparator", "Separator used by {0}.", '`#window.title#`')
                },
                'window.commandCenter': {
                    type: 'boolean',
                    default: true,
                    markdownDescription: platform_2.isWeb ?
                        (0, nls_1.localize)('window.commandCenterWeb', "Show command launcher together with the window title.") :
                        (0, nls_1.localize)({ key: 'window.commandCenter', comment: ['{0} is a placeholder for a setting identifier.'] }, "Show command launcher together with the window title. This setting only has an effect when {0} is set to {1}.", '`#window.titleBarStyle#`', '`custom`')
                },
                'window.menuBarVisibility': {
                    'type': 'string',
                    'enum': ['classic', 'visible', 'toggle', 'hidden', 'compact'],
                    'markdownEnumDescriptions': [
                        (0, nls_1.localize)('window.menuBarVisibility.classic', "Menu is displayed at the top of the window and only hidden in full screen mode."),
                        (0, nls_1.localize)('window.menuBarVisibility.visible', "Menu is always visible at the top of the window even in full screen mode."),
                        platform_2.isMacintosh ?
                            (0, nls_1.localize)('window.menuBarVisibility.toggle.mac', "Menu is hidden but can be displayed at the top of the window by executing the `Focus Application Menu` command.") :
                            (0, nls_1.localize)('window.menuBarVisibility.toggle', "Menu is hidden but can be displayed at the top of the window via the Alt key."),
                        (0, nls_1.localize)('window.menuBarVisibility.hidden', "Menu is always hidden."),
                        platform_2.isWeb ?
                            (0, nls_1.localize)('window.menuBarVisibility.compact.web', "Menu is displayed as a compact button in the side bar.") :
                            (0, nls_1.localize)({ key: 'window.menuBarVisibility.compact', comment: ['{0} is a placeholder for a setting identifier.'] }, "Menu is displayed as a compact button in the side bar. This value is ignored when {0} is {1}.", '`#window.titleBarStyle#`', '`native`')
                    ],
                    'default': platform_2.isWeb ? 'compact' : 'classic',
                    'scope': 1 /* ConfigurationScope.APPLICATION */,
                    'markdownDescription': platform_2.isMacintosh ?
                        (0, nls_1.localize)('menuBarVisibility.mac', "Control the visibility of the menu bar. A setting of 'toggle' means that the menu bar is hidden and executing `Focus Application Menu` will show it. A setting of 'compact' will move the menu into the side bar.") :
                        (0, nls_1.localize)('menuBarVisibility', "Control the visibility of the menu bar. A setting of 'toggle' means that the menu bar is hidden and a single press of the Alt key will show it. A setting of 'compact' will move the menu into the side bar."),
                    'included': platform_2.isWindows || platform_2.isLinux || platform_2.isWeb
                },
                'window.enableMenuBarMnemonics': {
                    'type': 'boolean',
                    'default': true,
                    'scope': 1 /* ConfigurationScope.APPLICATION */,
                    'description': (0, nls_1.localize)('enableMenuBarMnemonics', "Controls whether the main menus can be opened via Alt-key shortcuts. Disabling mnemonics allows to bind these Alt-key shortcuts to editor commands instead."),
                    'included': platform_2.isWindows || platform_2.isLinux
                },
                'window.customMenuBarAltFocus': {
                    'type': 'boolean',
                    'default': true,
                    'scope': 1 /* ConfigurationScope.APPLICATION */,
                    'markdownDescription': (0, nls_1.localize)('customMenuBarAltFocus', "Controls whether the menu bar will be focused by pressing the Alt-key. This setting has no effect on toggling the menu bar with the Alt-key."),
                    'included': platform_2.isWindows || platform_2.isLinux
                },
                'window.openFilesInNewWindow': {
                    'type': 'string',
                    'enum': ['on', 'off', 'default'],
                    'enumDescriptions': [
                        (0, nls_1.localize)('window.openFilesInNewWindow.on', "Files will open in a new window."),
                        (0, nls_1.localize)('window.openFilesInNewWindow.off', "Files will open in the window with the files' folder open or the last active window."),
                        platform_2.isMacintosh ?
                            (0, nls_1.localize)('window.openFilesInNewWindow.defaultMac', "Files will open in the window with the files' folder open or the last active window unless opened via the Dock or from Finder.") :
                            (0, nls_1.localize)('window.openFilesInNewWindow.default', "Files will open in a new window unless picked from within the application (e.g. via the File menu).")
                    ],
                    'default': 'off',
                    'scope': 1 /* ConfigurationScope.APPLICATION */,
                    'markdownDescription': platform_2.isMacintosh ?
                        (0, nls_1.localize)('openFilesInNewWindowMac', "Controls whether files should open in a new window when using a command line or file dialog.\nNote that there can still be cases where this setting is ignored (e.g. when using the `--new-window` or `--reuse-window` command line option).") :
                        (0, nls_1.localize)('openFilesInNewWindow', "Controls whether files should open in a new window when using a command line or file dialog.\nNote that there can still be cases where this setting is ignored (e.g. when using the `--new-window` or `--reuse-window` command line option).")
                },
                'window.openFoldersInNewWindow': {
                    'type': 'string',
                    'enum': ['on', 'off', 'default'],
                    'enumDescriptions': [
                        (0, nls_1.localize)('window.openFoldersInNewWindow.on', "Folders will open in a new window."),
                        (0, nls_1.localize)('window.openFoldersInNewWindow.off', "Folders will replace the last active window."),
                        (0, nls_1.localize)('window.openFoldersInNewWindow.default', "Folders will open in a new window unless a folder is picked from within the application (e.g. via the File menu).")
                    ],
                    'default': 'default',
                    'scope': 1 /* ConfigurationScope.APPLICATION */,
                    'markdownDescription': (0, nls_1.localize)('openFoldersInNewWindow', "Controls whether folders should open in a new window or replace the last active window.\nNote that there can still be cases where this setting is ignored (e.g. when using the `--new-window` or `--reuse-window` command line option).")
                },
                'window.confirmBeforeClose': {
                    'type': 'string',
                    'enum': ['always', 'keyboardOnly', 'never'],
                    'enumDescriptions': [
                        platform_2.isWeb ?
                            (0, nls_1.localize)('window.confirmBeforeClose.always.web', "Always try to ask for confirmation. Note that browsers may still decide to close a tab or window without confirmation.") :
                            (0, nls_1.localize)('window.confirmBeforeClose.always', "Always ask for confirmation."),
                        platform_2.isWeb ?
                            (0, nls_1.localize)('window.confirmBeforeClose.keyboardOnly.web', "Only ask for confirmation if a keybinding was used to close the window. Note that detection may not be possible in some cases.") :
                            (0, nls_1.localize)('window.confirmBeforeClose.keyboardOnly', "Only ask for confirmation if a keybinding was used."),
                        platform_2.isWeb ?
                            (0, nls_1.localize)('window.confirmBeforeClose.never.web', "Never explicitly ask for confirmation unless data loss is imminent.") :
                            (0, nls_1.localize)('window.confirmBeforeClose.never', "Never explicitly ask for confirmation.")
                    ],
                    'default': (platform_2.isWeb && !(0, browser_1.isStandalone)()) ? 'keyboardOnly' : 'never',
                    'markdownDescription': platform_2.isWeb ?
                        (0, nls_1.localize)('confirmBeforeCloseWeb', "Controls whether to show a confirmation dialog before closing the browser tab or window. Note that even if enabled, browsers may still decide to close a tab or window without confirmation and that this setting is only a hint that may not work in all cases.") :
                        (0, nls_1.localize)('confirmBeforeClose', "Controls whether to show a confirmation dialog before closing the window or quitting the application."),
                    'scope': 1 /* ConfigurationScope.APPLICATION */
                }
            }
        });
        // Zen Mode
        registry.registerConfiguration({
            'id': 'zenMode',
            'order': 9,
            'title': (0, nls_1.localize)('zenModeConfigurationTitle', "Zen Mode"),
            'type': 'object',
            'properties': {
                'zenMode.fullScreen': {
                    'type': 'boolean',
                    'default': true,
                    'description': (0, nls_1.localize)('zenMode.fullScreen', "Controls whether turning on Zen Mode also puts the workbench into full screen mode.")
                },
                'zenMode.centerLayout': {
                    'type': 'boolean',
                    'default': true,
                    'description': (0, nls_1.localize)('zenMode.centerLayout', "Controls whether turning on Zen Mode also centers the layout.")
                },
                'zenMode.hideTabs': {
                    'type': 'boolean',
                    'default': true,
                    'description': (0, nls_1.localize)('zenMode.hideTabs', "Controls whether turning on Zen Mode also hides workbench tabs.")
                },
                'zenMode.hideStatusBar': {
                    'type': 'boolean',
                    'default': true,
                    'description': (0, nls_1.localize)('zenMode.hideStatusBar', "Controls whether turning on Zen Mode also hides the status bar at the bottom of the workbench.")
                },
                'zenMode.hideActivityBar': {
                    'type': 'boolean',
                    'default': true,
                    'description': (0, nls_1.localize)('zenMode.hideActivityBar', "Controls whether turning on Zen Mode also hides the activity bar either at the left or right of the workbench.")
                },
                'zenMode.hideLineNumbers': {
                    'type': 'boolean',
                    'default': true,
                    'description': (0, nls_1.localize)('zenMode.hideLineNumbers', "Controls whether turning on Zen Mode also hides the editor line numbers.")
                },
                'zenMode.restore': {
                    'type': 'boolean',
                    'default': true,
                    'description': (0, nls_1.localize)('zenMode.restore', "Controls whether a window should restore to Zen Mode if it was exited in Zen Mode.")
                },
                'zenMode.silentNotifications': {
                    'type': 'boolean',
                    'default': true,
                    'description': (0, nls_1.localize)('zenMode.silentNotifications', "Controls whether notifications do not disturb mode should be enabled while in Zen Mode. If true, only error notifications will pop out.")
                }
            }
        });
    })();
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid29ya2JlbmNoLmNvbnRyaWJ1dGlvbi5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9icm93c2VyL3dvcmtiZW5jaC5jb250cmlidXRpb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7SUFXaEcsTUFBTSxRQUFRLEdBQUcsbUJBQVEsQ0FBQyxFQUFFLENBQXlCLGtDQUF1QixDQUFDLGFBQWEsQ0FBQyxDQUFDO0lBRTVGLGdCQUFnQjtJQUNoQixDQUFDLFNBQVMscUJBQXFCO1FBRTlCLG9CQUFvQjtRQUNwQixtQkFBUSxDQUFDLEVBQUUsQ0FBa0MsMEJBQW1CLENBQUMsU0FBUyxDQUFDLENBQUMsNkJBQTZCLENBQUMsMkRBQTJDLG9DQUE0QixDQUFDO1FBRWxMLHdCQUF3QjtRQUN4QixtQkFBUSxDQUFDLEVBQUUsQ0FBa0MsMEJBQW1CLENBQUMsU0FBUyxDQUFDLENBQUMsNkJBQTZCLENBQUMsa0VBQWtELCtCQUF1QixDQUFDO1FBRXBMLFlBQVk7UUFDWixRQUFRLENBQUMscUJBQXFCLENBQUM7WUFDOUIsR0FBRyw4Q0FBOEI7WUFDakMsWUFBWSxFQUFFO2dCQUNiLHVDQUF1QyxFQUFFO29CQUN4QyxJQUFJLEVBQUUsUUFBUTtvQkFDZCxJQUFJLEVBQUUsQ0FBQyxTQUFTLEVBQUUsT0FBTyxDQUFDO29CQUMxQixnQkFBZ0IsRUFBRTt3QkFDakIsSUFBQSxjQUFRLEVBQUMsK0NBQStDLEVBQUUsbUJBQW1CLENBQUM7d0JBQzlFLElBQUEsY0FBUSxFQUFDLDZDQUE2QyxFQUFFLHNFQUFzRSxDQUFDO3FCQUMvSDtvQkFDRCxXQUFXLEVBQUUsSUFBQSxjQUFRLEVBQUMsb0JBQW9CLEVBQUUsK0ZBQStGLENBQUM7b0JBQzVJLE9BQU8sRUFBRSxTQUFTO2lCQUNsQjtnQkFDRCwyQkFBMkIsRUFBRTtvQkFDNUIsTUFBTSxFQUFFLFNBQVM7b0JBQ2pC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