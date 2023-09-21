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
define(["require", "exports", "vs/nls", "vs/base/common/path", "vs/platform/registry/common/platform", "vs/platform/configuration/common/configurationRegistry", "vs/workbench/common/contributions", "vs/workbench/common/editor", "vs/platform/files/common/files", "vs/workbench/contrib/files/common/files", "vs/workbench/contrib/files/browser/editors/textFileEditorTracker", "vs/workbench/contrib/files/browser/editors/textFileSaveErrorHandler", "vs/workbench/contrib/files/browser/editors/fileEditorInput", "vs/workbench/contrib/files/browser/editors/binaryFileEditor", "vs/platform/instantiation/common/descriptors", "vs/base/common/platform", "vs/workbench/contrib/files/browser/explorerViewlet", "vs/workbench/browser/editor", "vs/platform/label/common/label", "vs/platform/instantiation/common/extensions", "vs/workbench/contrib/files/browser/explorerService", "vs/workbench/services/textfile/common/encoding", "vs/base/common/network", "vs/workbench/contrib/files/browser/workspaceWatcher", "vs/editor/common/config/editorConfigurationSchema", "vs/workbench/contrib/files/common/dirtyFilesIndicator", "vs/editor/browser/editorExtensions", "vs/platform/undoRedo/common/undoRedo", "vs/workbench/contrib/files/browser/files", "vs/workbench/contrib/files/browser/editors/fileEditorHandler", "vs/editor/common/languages/modesRegistry", "vs/platform/configuration/common/configuration", "vs/workbench/contrib/files/browser/editors/textFileEditor"], function (require, exports, nls, path_1, platform_1, configurationRegistry_1, contributions_1, editor_1, files_1, files_2, textFileEditorTracker_1, textFileSaveErrorHandler_1, fileEditorInput_1, binaryFileEditor_1, descriptors_1, platform_2, explorerViewlet_1, editor_2, label_1, extensions_1, explorerService_1, encoding_1, network_1, workspaceWatcher_1, editorConfigurationSchema_1, dirtyFilesIndicator_1, editorExtensions_1, undoRedo_1, files_3, fileEditorHandler_1, modesRegistry_1, configuration_1, textFileEditor_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    let FileUriLabelContribution = class FileUriLabelContribution {
        constructor(labelService) {
            labelService.registerFormatter({
                scheme: network_1.Schemas.file,
                formatting: {
                    label: '${authority}${path}',
                    separator: path_1.sep,
                    tildify: !platform_2.isWindows,
                    normalizeDriveLetter: platform_2.isWindows,
                    authorityPrefix: path_1.sep + path_1.sep,
                    workspaceSuffix: ''
                }
            });
        }
    };
    FileUriLabelContribution = __decorate([
        __param(0, label_1.ILabelService)
    ], FileUriLabelContribution);
    (0, extensions_1.registerSingleton)(files_3.IExplorerService, explorerService_1.ExplorerService, 1 /* InstantiationType.Delayed */);
    // Register file editors
    platform_1.Registry.as(editor_1.EditorExtensions.EditorPane).registerEditorPane(editor_2.EditorPaneDescriptor.create(textFileEditor_1.TextFileEditor, textFileEditor_1.TextFileEditor.ID, nls.localize('textFileEditor', "Text File Editor")), [
        new descriptors_1.SyncDescriptor(fileEditorInput_1.FileEditorInput)
    ]);
    platform_1.Registry.as(editor_1.EditorExtensions.EditorPane).registerEditorPane(editor_2.EditorPaneDescriptor.create(binaryFileEditor_1.BinaryFileEditor, binaryFileEditor_1.BinaryFileEditor.ID, nls.localize('binaryFileEditor', "Binary File Editor")), [
        new descriptors_1.SyncDescriptor(fileEditorInput_1.FileEditorInput)
    ]);
    // Register default file input factory
    platform_1.Registry.as(editor_1.EditorExtensions.EditorFactory).registerFileEditorFactory({
        typeId: files_2.FILE_EDITOR_INPUT_ID,
        createFileEditor: (resource, preferredResource, preferredName, preferredDescription, preferredEncoding, preferredLanguageId, preferredContents, instantiationService) => {
            return instantiationService.createInstance(fileEditorInput_1.FileEditorInput, resource, preferredResource, preferredName, preferredDescription, preferredEncoding, preferredLanguageId, preferredContents);
        },
        isFileEditor: (obj) => {
            return obj instanceof fileEditorInput_1.FileEditorInput;
        }
    });
    // Register Editor Input Serializer & Handler
    platform_1.Registry.as(editor_1.EditorExtensions.EditorFactory).registerEditorSerializer(files_2.FILE_EDITOR_INPUT_ID, fileEditorHandler_1.FileEditorInputSerializer);
    platform_1.Registry.as(contributions_1.Extensions.Workbench).registerWorkbenchContribution(fileEditorHandler_1.FileEditorWorkingCopyEditorHandler, 2 /* LifecyclePhase.Ready */);
    // Register Explorer views
    platform_1.Registry.as(contributions_1.Extensions.Workbench).registerWorkbenchContribution(explorerViewlet_1.ExplorerViewletViewsContribution, 1 /* LifecyclePhase.Starting */);
    // Register Text File Editor Tracker
    platform_1.Registry.as(contributions_1.Extensions.Workbench).registerWorkbenchContribution(textFileEditorTracker_1.TextFileEditorTracker, 1 /* LifecyclePhase.Starting */);
    // Register Text File Save Error Handler
    platform_1.Registry.as(contributions_1.Extensions.Workbench).registerWorkbenchContribution(textFileSaveErrorHandler_1.TextFileSaveErrorHandler, 1 /* LifecyclePhase.Starting */);
    // Register uri display for file uris
    platform_1.Registry.as(contributions_1.Extensions.Workbench).registerWorkbenchContribution(FileUriLabelContribution, 1 /* LifecyclePhase.Starting */);
    // Register Workspace Watcher
    platform_1.Registry.as(contributions_1.Extensions.Workbench).registerWorkbenchContribution(workspaceWatcher_1.WorkspaceWatcher, 3 /* LifecyclePhase.Restored */);
    // Register Dirty Files Indicator
    platform_1.Registry.as(contributions_1.Extensions.Workbench).registerWorkbenchContribution(dirtyFilesIndicator_1.DirtyFilesIndicator, 1 /* LifecyclePhase.Starting */);
    // Configuration
    const configurationRegistry = platform_1.Registry.as(configurationRegistry_1.Extensions.Configuration);
    const hotExitConfiguration = platform_2.isNative ?
        {
            'type': 'string',
            'scope': 1 /* ConfigurationScope.APPLICATION */,
            'enum': [files_1.HotExitConfiguration.OFF, files_1.HotExitConfiguration.ON_EXIT, files_1.HotExitConfiguration.ON_EXIT_AND_WINDOW_CLOSE],
            'default': files_1.HotExitConfiguration.ON_EXIT,
            'markdownEnumDescriptions': [
                nls.localize('hotExit.off', 'Disable hot exit. A prompt will show when attempting to close a window with editors that have unsaved changes.'),
                nls.localize('hotExit.onExit', 'Hot exit will be triggered when the last window is closed on Windows/Linux or when the `workbench.action.quit` command is triggered (command palette, keybinding, menu). All windows without folders opened will be restored upon next launch. A list of previously opened windows with unsaved files can be accessed via `File > Open Recent > More...`'),
                nls.localize('hotExit.onExitAndWindowClose', 'Hot exit will be triggered when the last window is closed on Windows/Linux or when the `workbench.action.quit` command is triggered (command palette, keybinding, menu), and also for any window with a folder opened regardless of whether it\'s the last window. All windows without folders opened will be restored upon next launch. A list of previously opened windows with unsaved files can be accessed via `File > Open Recent > More...`')
            ],
            'markdownDescription': nls.localize('hotExit', "[Hot Exit](https://aka.ms/vscode-hot-exit) controls whether unsaved files are remembered between sessions, allowing the save prompt when exiting the editor to be skipped.", files_1.HotExitConfiguration.ON_EXIT, files_1.HotExitConfiguration.ON_EXIT_AND_WINDOW_CLOSE)
        } : {
        'type': 'string',
        'scope': 1 /* ConfigurationScope.APPLICATION */,
        'enum': [files_1.HotExitConfiguration.OFF, files_1.HotExitConfiguration.ON_EXIT_AND_WINDOW_CLOSE],
        'default': files_1.HotExitConfiguration.ON_EXIT_AND_WINDOW_CLOSE,
        'markdownEnumDescriptions': [
            nls.localize('hotExit.off', 'Disable hot exit. A prompt will show when attempting to close a window with editors that have unsaved changes.'),
            nls.localize('hotExit.onExitAndWindowCloseBrowser', 'Hot exit will be triggered when the browser quits or the window or tab is closed.')
        ],
        'markdownDescription': nls.localize('hotExit', "[Hot Exit](https://aka.ms/vscode-hot-exit) controls whether unsaved files are remembered between sessions, allowing the save prompt when exiting the editor to be skipped.", files_1.HotExitConfiguration.ON_EXIT, files_1.HotExitConfiguration.ON_EXIT_AND_WINDOW_CLOSE)
    };
    configurationRegistry.registerConfiguration({
        'id': 'files',
        'order': 9,
        'title': nls.localize('filesConfigurationTitle', "Files"),
        'type': 'object',
        'properties': {
            [files_1.FILES_EXCLUDE_CONFIG]: {
                'type': 'object',
                'markdownDescription': nls.localize('exclude', "Configure [glob patterns](https://aka.ms/vscode-glob-patterns) for excluding files and folders. For example, the File Explorer decides which files and folders to show or hide based on this setting. Refer to the `#search.exclude#` setting to define search-specific excludes. Refer to the `#explorer.excludeGitIgnore#` setting for ignoring files based on your `.gitignore`."),
                'default': {
                    ...{ '**/.git': true, '**/.svn': true, '**/.hg': true, '**/CVS': true, '**/.DS_Store': true, '**/Thumbs.db': true },
                    ...(platform_2.isWeb ? { '**/*.crswap': true /* filter out swap files used for local file access */ } : undefined)
                },
                'scope': 4 /* ConfigurationScope.RESOURCE */,
                'additionalProperties': {
                    'anyOf': [
                        {
                            'type': 'boolean',
                            'enum': [true, false],
                            'enumDescriptions': [nls.localize('trueDescription', "Enable the pattern."), nls.localize('falseDescription', "Disable the pattern.")],
                            'description': nls.localize('files.exclude.boolean', "The glob pattern to match file paths against. Set to true or false to enable or disable the pattern."),
                        },
                        {
                            'type': 'object',
                            'properties': {
                                'when': {
                                    'type': 'string',
                                    'pattern': '\\w*\\$\\(basename\\)\\w*',
                                    'default': '$(basename).ext',
                                    'markdownDescription': nls.localize({ key: 'files.exclude.when', comment: ['\\$(basename) should not be translated'] }, "Additional check on the siblings of a matching file. Use \\$(basename) as variable for the matching file name.")
                                }
                            }
                        }
                    ]
                }
            },
            [files_1.FILES_ASSOCIATIONS_CONFIG]: {
                'type': 'object',
                'markdownDescription': nls.localize('associations', "Configure [glob patterns](https://aka.ms/vscode-glob-patterns) of file associations to languages (for example `\"*.extension\": \"html\"`). Patterns will match on the absolute path of a file if they contain a path separator and will match on the name of the file otherwise. These have precedence over the default associations of the languages installed."),
                'additionalProperties': {
                    'type': 'string'
                }
            },
            'files.encoding': {
                'type': 'string',
                'enum': Object.keys(encoding_1.SUPPORTED_ENCODINGS),
                'default': 'utf8',
                'description': nls.localize('encoding', "The default character set encoding to use when reading and writing files. This setting can also be configured per language."),
                'scope': 5 /* ConfigurationScope.LANGUAGE_OVERRIDABLE */,
                'enumDescriptions': Object.keys(encoding_1.SUPPORTED_ENCODINGS).map(key => encoding_1.SUPPORTED_ENCODINGS[key].labelLong),
                'enumItemLabels': Object.keys(encoding_1.SUPPORTED_ENCODINGS).map(key => encoding_1.SUPPORTED_ENCODINGS[key].labelLong)
            },
            'files.autoGuessEncoding': {
                'type': 'boolean',
                'default': false,
                'markdownDescription': nls.localize('autoGuessEncoding', "When enabled, the editor will attempt to guess the character set encoding when opening files. This setting can also be configured per language. Note, this setting is not respected by text search. Only {0} is respected.", '`#files.encoding#`'),
                'scope': 5 /* ConfigurationScope.LANGUAGE_OVERRIDABLE */
            },
            'files.eol': {
                'type': 'string',
                'enum': [
                    '\n',
                    '\r\n',
                    'auto'
                ],
                'enumDescriptions': [
                    nls.localize('eol.LF', "LF"),
                    nls.localize('eol.CRLF', "CRLF"),
                    nls.localize('eol.auto', "Uses operating system specific end of line character.")
                ],
                'default': 'auto',
                'description': nls.localize('eol', "The default end of line character."),
                'scope': 5 /* ConfigurationScope.LANGUAGE_OVERRIDABLE */
            },
            'files.enableTrash': {
                'type': 'boolean',
                'default': true,
                'description': nls.localize('useTrash', "Moves files/folders to the OS trash (recycle bin on Windows) when deleting. Disabling this will delete files/folders permanently.")
            },
            'files.trimTrailingWhitespace': {
                'type': 'boolean',
                'default': false,
                'description': nls.localize('trimTrailingWhitespace', "When enabled, will trim trailing whitespace when saving a file."),
                'scope': 5 /* ConfigurationScope.LANGUAGE_OVERRIDABLE */
            },
            'files.insertFinalNewline': {
                'type': 'boolean',
                'default': false,
                'description': nls.localize('insertFinalNewline', "When enabled, insert a final new line at the end of the file when saving it."),
                'scope': 5 /* ConfigurationScope.LANGUAGE_OVERRIDABLE */
            },
            'files.trimFinalNewlines': {
                'type': 'boolean',
                'default': false,
                'description': nls.localize('trimFinalNewlines', "When enabled, will trim all new lines after the final new line at the end of the file when saving it."),
                scope: 5 /* ConfigurationScope.LANGUAGE_OVERRIDABLE */,
            },
            'files.autoSave': {
                'type': 'string',
                'enum': [files_1.AutoSaveConfiguration.OFF, files_1.AutoSaveConfiguration.AFTER_DELAY, files_1.AutoSaveConfiguration.ON_FOCUS_CHANGE, files_1.AutoSaveConfiguration.ON_WINDOW_CHANGE],
                'markdownEnumDescriptions': [
                    nls.localize({ comment: ['This is the description for a setting. Values surrounded by single quotes are not to be translated.'], key: 'files.autoSave.off' }, "An editor with changes is never automatically saved."),
                    nls.localize({ comment: ['This is the description for a setting. Values surrounded by single quotes are not to be translated.'], key: 'files.autoSave.afterDelay' }, "An editor with changes is automatically saved after the configured `#files.autoSaveDelay#`."),
                    nls.localize({ comment: ['This is the description for a setting. Values surrounded by single quotes are not to be translated.'], key: 'files.autoSave.onFocusChange' }, "An editor with changes is automatically saved when the editor loses focus."),
                    nls.localize({ comment: ['This is the description for a setting. Values surrounded by single quotes are not to be translated.'], key: 'files.autoSave.onWindowChange' }, "An editor with changes is automatically saved when the window loses focus.")
                ],
                'default': platform_2.isWeb ? files_1.AutoSaveConfiguration.AFTER_DELAY : files_1.AutoSaveConfiguration.OFF,
                'markdownDescription': nls.localize({ comment: ['This is the description for a setting. Values surrounded by single quotes are not to be translated.'], key: 'autoSave' }, "Controls [auto save](https://code.visualstudio.com/docs/editor/codebasics#_save-auto-save) of editors that have unsaved changes.", files_1.AutoSaveConfiguration.OFF, files_1.AutoSaveConfiguration.AFTER_DELAY, files_1.AutoSaveConfiguration.ON_FOCUS_CHANGE, files_1.AutoSaveConfiguration.ON_WINDOW_CHANGE, files_1.AutoSaveConfiguration.AFTER_DELAY)
            },
            'files.autoSaveDelay': {
                'type': 'number',
                'default': 1000,
                'minimum': 0,
                'markdownDescription': nls.localize({ comment: ['This is the description for a setting. Values surrounded by single quotes are not to be translated.'], key: 'autoSaveDelay' }, "Controls the delay in milliseconds after which an editor with unsaved changes is saved automatically. Only applies when `#files.autoSave#` is set to `{0}`.", files_1.AutoSaveConfiguration.AFTER_DELAY)
            },
            'files.watcherExclude': {
                'type': 'object',
                'patternProperties': {
                    '.*': { 'type': 'boolean' }
                },
                'default': { '**/.git/objects/**': true, '**/.git/subtree-cache/**': true, '**/node_modules/*/**': true, '**/.hg/store/**': true },
                'markdownDescription': nls.localize('watcherExclude', "Configure paths or [glob patterns](https://aka.ms/vscode-glob-patterns) to exclude from file watching. Paths can either be relative to the watched folder or absolute. Glob patterns are matched relative from the watched folder. When you experience the file watcher process consuming a lot of CPU, make sure to exclude large folders that are of less interest (such as build output folders)."),
                'scope': 4 /* ConfigurationScope.RESOURCE */
            },
            'files.watcherInclude': {
                'type': 'array',
                'items': {
                    'type': 'string'
                },
                'default': [],
                'description': nls.localize('watcherInclude', "Configure extra paths to watch for changes inside the workspace. By default, all workspace folders will be watched recursively, except for folders that are symbolic links. You can explicitly add absolute or relative paths to support watching folders that are symbolic links. Relative paths will be resolved to an absolute path using the currently opened workspace."),
                'scope': 4 /* ConfigurationScope.RESOURCE */
            },
            'files.hotExit': hotExitConfiguration,
            'files.defaultLanguage': {
                'type': 'string',
                'markdownDescription': nls.localize('defaultLanguage', "The default language identifier that is assigned to new files. If configured to `${activeEditorLanguage}`, will use the language identifier of the currently active text editor if any.")
            },
            [files_1.FILES_READONLY_INCLUDE_CONFIG]: {
                'type': 'object',
                'patternProperties': {
                    '.*': { 'type': 'boolean' }
                },
                'default': {},
                'markdownDescription': nls.localize('filesReadonlyInclude', "Configure paths or [glob patterns](https://aka.ms/vscode-glob-patterns) to mark as read-only. Glob patterns are always evaluated relative to the path of the workspace folder unless they are absolute paths. You can exclude matching paths via the `#files.readonlyExclude#` setting. Files from readonly file system providers will always be read-only independent of this setting."),
                'scope': 4 /* ConfigurationScope.RESOURCE */
            },
            [files_1.FILES_READONLY_EXCLUDE_CONFIG]: {
                'type': 'object',
                'patternProperties': {
                    '.*': { 'type': 'boolean' }
                },
                'default': {},
                'markdownDescription': nls.localize('filesReadonlyExclude', "Configure paths or [glob patterns](https://aka.ms/vscode-glob-patterns) to exclude from being marked as read-only if they match as a result of the `#files.readonlyInclude#` setting. Glob patterns are always evaluated relative to the path of the workspace folder unless they are absolute paths. Files from readonly file system providers will always be read-only independent of this setting."),
                'scope': 4 /* ConfigurationScope.RESOURCE */
            },
            [files_1.FILES_READONLY_FROM_PERMISSIONS_CONFIG]: {
                'type': 'boolean',
                'markdownDescription': nls.localize('filesReadonlyFromPermissions', "Marks files as read-only when their file permissions indicate as such. This can be overridden via `#files.readonlyInclude#` and `#files.readonlyExclude#` settings."),
                'default': false
            },
            'files.restoreUndoStack': {
                'type': 'boolean',
                'description': nls.localize('files.restoreUndoStack', "Restore the undo stack when a file is reopened."),
                'default': true
            },
            'files.saveConflictResolution': {
                'type': 'string',
                'enum': [
                    'askUser',
                    'overwriteFileOnDisk'
                ],
                'enumDescriptions': [
                    nls.localize('askUser', "Will refuse to save and ask for resolving the save conflict manually."),
                    nls.localize('overwriteFileOnDisk', "Will resolve the save conflict by overwriting the file on disk with the changes in the editor.")
                ],
                'description': nls.localize('files.saveConflictResolution', "A save conflict can occur when a file is saved to disk that was changed by another program in the meantime. To prevent data loss, the user is asked to compare the changes in the editor with the version on disk. This setting should only be changed if you frequently encounter save conflict errors and may result in data loss if used without caution."),
                'default': 'askUser',
                'scope': 5 /* ConfigurationScope.LANGUAGE_OVERRIDABLE */
            },
            'files.dialog.defaultPath': {
                'type': 'string',
                'pattern': '^((\\/|\\\\\\\\|[a-zA-Z]:\\\\).*)?$',
                'patternErrorMessage': nls.localize('defaultPathErrorMessage', "Default path for file dialogs must be an absolute path (e.g. C:\\\\myFolder or /myFolder)."),
                'description': nls.localize('fileDialogDefaultPath', "Default path for file dialogs, overriding user's home path. Only used in the absence of a context-specific path, such as most recently opened file or folder."),
                'scope': 2 /* ConfigurationScope.MACHINE */
            },
            'files.simpleDialog.enable': {
                'type': 'boolean',
                'description': nls.localize('files.simpleDialog.enable', "Enables the simple file dialog for opening and saving files and folders. The simple file dialog replaces the system file dialog when enabled."),
                'default': false
            },
            'files.participants.timeout': {
                type: 'number',
                default: 60000,
                markdownDescription: nls.localize('files.participants.timeout', "Timeout in milliseconds after which file participants for create, rename, and delete are cancelled. Use `0` to disable participants."),
            }
        }
    });
    configurationRegistry.registerConfiguration({
        ...editorConfigurationSchema_1.editorConfigurationBaseNode,
        properties: {
            'editor.formatOnSave': {
                'type': 'boolean',
                'description': nls.localize('formatOnSave', "Format a file on save. A formatter must be available, the file must not be saved after delay, and the editor must not be shutting down."),
                'scope': 5 /* ConfigurationScope.LANGUAGE_OVERRIDABLE */,
            },
            'editor.formatOnSaveMode': {
                'type': 'string',
                'default': 'file',
                'enum': [
                    'file',
                    'modifications',
                    'modificationsIfAvailable'
                ],
                'enumDescriptions': [
                    nls.localize({ key: 'everything', comment: ['This is the description of an option'] }, "Format the whole file."),
                    nls.localize({ key: 'modification', comment: ['This is the description of an option'] }, "Format modifications (requires source control)."),
                    nls.localize({ key: 'modificationIfAvailable', comment: ['This is the description of an option'] }, "Will attempt to format modifications only (requires source control). If source control can't be used, then the whole file will be formatted."),
                ],
                'markdownDescription': nls.localize('formatOnSaveMode', "Controls if format on save formats the whole file or only modifications. Only applies when `#editor.formatOnSave#` is enabled."),
                'scope': 5 /* ConfigurationScope.LANGUAGE_OVERRIDABLE */,
            },
        }
    });
    configurationRegistry.registerConfiguration({
        'id': 'explorer',
        'order': 10,
        'title': nls.localize('explorerConfigurationTitle', "File Explorer"),
        'type': 'object',
        'properties': {
            'explorer.openEditors.visible': {
                'type': 'number',
                'description': nls.localize({ key: 'openEditorsVisible', comment: ['Open is an adjective'] }, "The initial maximum number of editors shown in the Open Editors pane. Exceeding this limit will show a scroll bar and allow resizing the pane to display more items."),
                'default': 9,
                'minimum': 1
            },
            'explorer.openEditors.minVisible': {
                'type': 'number',
                'description': nls.localize({ key: 'openEditorsVisibleMin', comment: ['Open is an adjective'] }, "The minimum number of editor slots pre-allocated in the Open Editors pane. If set to 0 the Open Editors pane will dynamically resize based on the number of editors."),
                'default': 0,
                'minimum': 0
            },
            'explorer.openEditors.sortOrder': {
                'type': 'string',
                'enum': ['editorOrder', 'alphabetical', 'fullPath'],
                'description': nls.localize({ key: 'openEditorsSortOrder', comment: ['Open is an adjective'] }, "Controls the sorting order of editors in the Open Editors pane."),
                'enumDescriptions': [
                    nls.localize('sortOrder.editorOrder', 'Editors are ordered in the same order editor tabs are shown.'),
                    nls.localize('sortOrder.alphabetical', 'Editors are ordered alphabetically by tab name inside each editor group.'),
                    nls.localize('sortOrder.fullPath', 'Editors are ordered alphabetically by full path inside each editor group.')
                ],
                'default': 'editorOrder'
            },
            'explorer.autoReveal': {
                'type': ['boolean', 'string'],
                'enum': [true, false, 'focusNoScroll'],
                'default': true,
                'enumDescriptions': [
                    nls.localize('autoReveal.on', 'Files will be revealed and selected.'),
                    nls.localize('autoReveal.off', 'Files will not be revealed and selected.'),
                    nls.localize('autoReveal.focusNoScroll', 'Files will not be scrolled into view, but will still be focused.'),
                ],
                'description': nls.localize('autoReveal', "Controls whether the Explorer should automatically reveal and select files when opening them.")
            },
            'explorer.autoRevealExclude': {
                'type': 'object',
                'markdownDescription': nls.localize('autoRevealExclude', "Configure paths or [glob patterns](https://aka.ms/vscode-glob-patterns) for excluding files and folders from being revealed and selected in the Explorer when they are opened. Glob patterns are always evaluated relative to the path of the workspace folder unless they are absolute paths."),
                'default': { '**/node_modules': true, '**/bower_components': true },
                'additionalProperties': {
                    'anyOf': [
                        {
                            'type': 'boolean',
                            'description': nls.localize('explorer.autoRevealExclude.boolean', "The glob pattern to match file paths against. Set to true or false to enable or disable the pattern."),
                        },
                        {
                            type: 'object',
                            properties: {
                                when: {
                                    type: 'string',
                                    pattern: '\\w*\\$\\(basename\\)\\w*',
                                    default: '$(basename).ext',
                                    description: nls.localize('explorer.autoRevealExclude.when', 'Additional check on the siblings of a matching file. Use $(basename) as variable for the matching file name.')
                                }
                            }
                        }
                    ]
                }
            },
            'explorer.enableDragAndDrop': {
                'type': 'boolean',
                'description': nls.localize('enableDragAndDrop', "Controls whether the Explorer should allow to move files and folders via drag and drop. This setting only effects drag and drop from inside the Explorer."),
                'default': true
            },
            'explorer.confirmDragAndDrop': {
                'type': 'boolean',
                'description': nls.localize('confirmDragAndDrop', "Controls whether the Explorer should ask for confirmation to move files and folders via drag and drop."),
                'default': true
            },
            'explorer.confirmDelete': {
                'type': 'boolean',
                'description': nls.localize('confirmDelete', "Controls whether the Explorer should ask for confirmation when deleting a file via the trash."),
                'default': true
            },
            'explorer.enableUndo': {
                'type': 'boolean',
                'description': nls.localize('enableUndo', "Controls whether the Explorer should support undoing file and folder operations."),
                'default': true
            },
            'explorer.confirmUndo': {
                'type': 'string',
                'enum': ["verbose" /* UndoConfirmLevel.Verbose */, "default" /* UndoConfirmLevel.Default */, "light" /* UndoConfirmLevel.Light */],
                'description': nls.localize('confirmUndo', "Controls whether the Explorer should ask for confirmation when undoing."),
                'default': "default" /* UndoConfirmLevel.Default */,
                'enumDescriptions': [
                    nls.localize('enableUndo.verbose', 'Explorer will prompt before all undo operations.'),
                    nls.localize('enableUndo.default', 'Explorer will prompt before destructive undo operations.'),
                    nls.localize('enableUndo.light', 'Explorer will not prompt before undo operations when focused.'),
                ],
            },
            'explorer.expandSingleFolderWorkspaces': {
                'type': 'boolean',
                'description': nls.localize('expandSingleFolderWorkspaces', "Controls whether the Explorer should expand multi-root workspaces containing only one folder during initialization"),
                'default': true
            },
            'explorer.sortOrder': {
                'type': 'string',
                'enum': ["default" /* SortOrder.Default */, "mixed" /* SortOrder.Mixed */, "filesFirst" /* SortOrder.FilesFirst */, "type" /* SortOrder.Type */, "modified" /* SortOrder.Modified */, "foldersNestsFiles" /* SortOrder.FoldersNestsFiles */],
                'default': "default" /* SortOrder.Default */,
                'enumDescriptions': [
                    nls.localize('sortOrder.default', 'Files and folders are sorted by their names. Folders are displayed before files.'),
                    nls.localize('sortOrder.mixed', 'Files and folders are sorted by their names. Files are interwoven with folders.'),
                    nls.localize('sortOrder.filesFirst', 'Files and folders are sorted by their names. Files are displayed before folders.'),
                    nls.localize('sortOrder.type', 'Files and folders are grouped by extension type then sorted by their names. Folders are displayed before files.'),
                    nls.localize('sortOrder.modified', 'Files and folders are sorted by last modified date in descending order. Folders are displayed before files.'),
                    nls.localize('sortOrder.foldersNestsFiles', 'Files and folders are sorted by their names. Folders are displayed before files. Files with nested children are displayed before other files.')
                ],
                'markdownDescription': nls.localize('sortOrder', "Controls the property-based sorting of files and folders in the Explorer. When `#explorer.fileNesting.enabled#` is enabled, also controls sorting of nested files.")
            },
            'explorer.sortOrderLexicographicOptions': {
                'type': 'string',
                'enum': ["default" /* LexicographicOptions.Default */, "upper" /* LexicographicOptions.Upper */, "lower" /* LexicographicOptions.Lower */, "unicode" /* LexicographicOptions.Unicode */],
                'default': "default" /* LexicographicOptions.Default */,
                'enumDescriptions': [
                    nls.localize('sortOrderLexicographicOptions.default', 'Uppercase and lowercase names are mixed together.'),
                    nls.localize('sortOrderLexicographicOptions.upper', 'Uppercase names are grouped together before lowercase names.'),
                    nls.localize('sortOrderLexicographicOptions.lower', 'Lowercase names are grouped together before uppercase names.'),
                    nls.localize('sortOrderLexicographicOptions.unicode', 'Names are sorted in Unicode order.')
                ],
                'description': nls.localize('sortOrderLexicographicOptions', "Controls the lexicographic sorting of file and folder names in the Explorer.")
            },
            'explorer.decorations.colors': {
                type: 'boolean',
                description: nls.localize('explorer.decorations.colors', "Controls whether file decorations should use colors."),
                default: true
            },
            'explorer.decorations.badges': {
                type: 'boolean',
                description: nls.localize('explorer.decorations.badges', "Controls whether file decorations should use badges."),
                default: true
            },
            'explorer.incrementalNaming': {
                'type': 'string',
                enum: ['simple', 'smart', 'disabled'],
                enumDescriptions: [
                    nls.localize('simple', "Appends the word \"copy\" at the end of the duplicated name potentially followed by a number."),
                    nls.localize('smart', "Adds a number at the end of the duplicated name. If some number is already part of the name, tries to increase that number."),
                    nls.localize('disabled', "Disables incremental naming. If two files with the same name exist you will be prompted to overwrite the existing file.")
                ],
                description: nls.localize('explorer.incrementalNaming', "Controls what naming strategy to use when a giving a new name to a duplicated Explorer item on paste."),
                default: 'simple'
            },
            'explorer.compactFolders': {
                'type': 'boolean',
                'description': nls.localize('compressSingleChildFolders', "Controls whether the Explorer should render folders in a compact form. In such a form, single child folders will be compressed in a combined tree element. Useful for Java package structures, for example."),
                'default': true
            },
            'explorer.copyRelativePathSeparator': {
                'type': 'string',
                'enum': [
                    '/',
                    '\\',
                    'auto'
                ],
                'enumDescriptions': [
                    nls.localize('copyRelativePathSeparator.slash', "Use slash as path separation character."),
                    nls.localize('copyRelativePathSeparator.backslash', "Use backslash as path separation character."),
                    nls.localize('copyRelativePathSeparator.auto', "Uses operating system specific path separation character."),
                ],
                'description': nls.localize('copyRelativePathSeparator', "The path separation character used when copying relative file paths."),
                'default': 'auto'
            },
            'explorer.excludeGitIgnore': {
                type: 'boolean',
                markdownDescription: nls.localize('excludeGitignore', "Controls whether entries in .gitignore should be parsed and excluded from the Explorer. Similar to {0}.", '`#files.exclude#`'),
                default: false,
                scope: 4 /* ConfigurationScope.RESOURCE */
            },
            'explorer.fileNesting.enabled': {
                'type': 'boolean',
                scope: 4 /* ConfigurationScope.RESOURCE */,
                'markdownDescription': nls.localize('fileNestingEnabled', "Controls whether file nesting is enabled in the Explorer. File nesting allows for related files in a directory to be visually grouped together under a single parent file."),
                'default': false,
            },
            'explorer.fileNesting.expand': {
                'type': 'boolean',
                'markdownDescription': nls.localize('fileNestingExpand', "Controls whether file nests are automatically expanded. {0} must be set for this to take effect.", '`#explorer.fileNesting.enabled#`'),
                'default': true,
            },
            'explorer.fileNesting.patterns': {
                'type': 'object',
                scope: 4 /* ConfigurationScope.RESOURCE */,
                'markdownDescription': nls.localize('fileNestingPatterns', "Controls nesting of files in the Explorer. {0} must be set for this to take effect. Each __Item__ represents a parent pattern and may contain a single `*` character that matches any string. Each __Value__ represents a comma separated list of the child patterns that should be shown nested under a given parent. Child patterns may contain several special tokens:\n- `${capture}`: Matches the resolved value of the `*` from the parent pattern\n- `${basename}`: Matches the parent file's basename, the `file` in `file.ts`\n- `${extname}`: Matches the parent file's extension, the `ts` in `file.ts`\n- `${dirname}`: Matches the parent file's directory name, the `src` in `src/file.ts`\n- `*`:  Matches any string, may only be used once per child pattern", '`#explorer.fileNesting.enabled#`'),
                patternProperties: {
                    '^[^*]*\\*?[^*]*$': {
                        markdownDescription: nls.localize('fileNesting.description', "Each key pattern may contain a single `*` character which will match any string."),
                        type: 'string',
                        pattern: '^([^,*]*\\*?[^,*]*)(, ?[^,*]*\\*?[^,*]*)*$',
                    }
                },
                additionalProperties: false,
                'default': {
                    '*.ts': '${capture}.js',
                    '*.js': '${capture}.js.map, ${capture}.min.js, ${capture}.d.ts',
                    '*.jsx': '${capture}.js',
                    '*.tsx': '${capture}.ts',
                    'tsconfig.json': 'tsconfig.*.json',
                    'package.json': 'package-lock.json, yarn.lock, pnpm-lock.yaml',
                }
            }
        }
    });
    editorExtensions_1.UndoCommand.addImplementation(110, 'explorer', (accessor) => {
        const undoRedoService = accessor.get(undoRedo_1.IUndoRedoService);
        const explorerService = accessor.get(files_3.IExplorerService);
        const configurationService = accessor.get(configuration_1.IConfigurationService);
        const explorerCanUndo = configurationService.getValue().explorer.enableUndo;
        if (explorerService.hasViewFocus() && undoRedoService.canUndo(explorerService_1.UNDO_REDO_SOURCE) && explorerCanUndo) {
            undoRedoService.undo(explorerService_1.UNDO_REDO_SOURCE);
            return true;
        }
        return false;
    });
    editorExtensions_1.RedoCommand.addImplementation(110, 'explorer', (accessor) => {
        const undoRedoService = accessor.get(undoRedo_1.IUndoRedoService);
        const explorerService = accessor.get(files_3.IExplorerService);
        const configurationService = accessor.get(configuration_1.IConfigurationService);
        const explorerCanUndo = configurationService.getValue().explorer.enableUndo;
        if (explorerService.hasViewFocus() && undoRedoService.canRedo(explorerService_1.UNDO_REDO_SOURCE) && explorerCanUndo) {
            undoRedoService.redo(explorerService_1.UNDO_REDO_SOURCE);
            return true;
        }
        return false;
    });
    modesRegistry_1.ModesRegistry.registerLanguage({
        id: files_2.BINARY_TEXT_FILE_MODE,
        aliases: ['Binary'],
        mimetypes: ['text/x-code-binary']
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmlsZXMuY29udHJpYnV0aW9uLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvZmlsZXMvYnJvd3Nlci9maWxlcy5jb250cmlidXRpb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7SUFvQ2hHLElBQU0sd0JBQXdCLEdBQTlCLE1BQU0sd0JBQXdCO1FBRTdCLFlBQTJCLFlBQTJCO1lBQ3JELFlBQVksQ0FBQyxpQkFBaUIsQ0FBQztnQkFDOUIsTUFBTSxFQUFFLGlCQUFPLENBQUMsSUFBSTtnQkFDcEIsVUFBVSxFQUFFO29CQUNYLEtBQUssRUFBRSxxQkFBcUI7b0JBQzVCLFNBQVMsRUFBRSxVQUFHO29CQUNkLE9BQU8sRUFBRSxDQUFDLG9CQUFTO29CQUNuQixvQkFBb0IsRUFBRSxvQkFBUztvQkFDL0IsZUFBZSxFQUFFLFVBQUcsR0FBRyxVQUFHO29CQUMxQixlQUFlLEVBQUUsRUFBRTtpQkFDbkI7YUFDRCxDQUFDLENBQUM7UUFDSixDQUFDO0tBQ0QsQ0FBQTtJQWZLLHdCQUF3QjtRQUVoQixXQUFBLHFCQUFhLENBQUE7T0FGckIsd0JBQXdCLENBZTdCO0lBRUQsSUFBQSw4QkFBaUIsRUFBQyx3QkFBZ0IsRUFBRSxpQ0FBZSxvQ0FBNEIsQ0FBQztJQUVoRix3QkFBd0I7SUFFeEIsbUJBQVEsQ0FBQyxFQUFFLENBQXNCLHlCQUFnQixDQUFDLFVBQVUsQ0FBQyxDQUFDLGtCQUFrQixDQUMvRSw2QkFBb0IsQ0FBQyxNQUFNLENBQzFCLCtCQUFjLEVBQ2QsK0JBQWMsQ0FBQyxFQUFFLEVBQ2pCLEdBQUcsQ0FBQyxRQUFRLENBQUMsZ0JBQWdCLEVBQUUsa0JBQWtCLENBQUMsQ0FDbEQsRUFDRDtRQUNDLElBQUksNEJBQWMsQ0FBQyxpQ0FBZSxDQUFDO0tBQ25DLENBQ0QsQ0FBQztJQUVGLG1CQUFRLENBQUMsRUFB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