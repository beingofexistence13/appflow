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
define(["require", "exports", "vs/nls!vs/workbench/contrib/files/browser/files.contribution", "vs/base/common/path", "vs/platform/registry/common/platform", "vs/platform/configuration/common/configurationRegistry", "vs/workbench/common/contributions", "vs/workbench/common/editor", "vs/platform/files/common/files", "vs/workbench/contrib/files/common/files", "vs/workbench/contrib/files/browser/editors/textFileEditorTracker", "vs/workbench/contrib/files/browser/editors/textFileSaveErrorHandler", "vs/workbench/contrib/files/browser/editors/fileEditorInput", "vs/workbench/contrib/files/browser/editors/binaryFileEditor", "vs/platform/instantiation/common/descriptors", "vs/base/common/platform", "vs/workbench/contrib/files/browser/explorerViewlet", "vs/workbench/browser/editor", "vs/platform/label/common/label", "vs/platform/instantiation/common/extensions", "vs/workbench/contrib/files/browser/explorerService", "vs/workbench/services/textfile/common/encoding", "vs/base/common/network", "vs/workbench/contrib/files/browser/workspaceWatcher", "vs/editor/common/config/editorConfigurationSchema", "vs/workbench/contrib/files/common/dirtyFilesIndicator", "vs/editor/browser/editorExtensions", "vs/platform/undoRedo/common/undoRedo", "vs/workbench/contrib/files/browser/files", "vs/workbench/contrib/files/browser/editors/fileEditorHandler", "vs/editor/common/languages/modesRegistry", "vs/platform/configuration/common/configuration", "vs/workbench/contrib/files/browser/editors/textFileEditor"], function (require, exports, nls, path_1, platform_1, configurationRegistry_1, contributions_1, editor_1, files_1, files_2, textFileEditorTracker_1, textFileSaveErrorHandler_1, fileEditorInput_1, binaryFileEditor_1, descriptors_1, platform_2, explorerViewlet_1, editor_2, label_1, extensions_1, explorerService_1, encoding_1, network_1, workspaceWatcher_1, editorConfigurationSchema_1, dirtyFilesIndicator_1, editorExtensions_1, undoRedo_1, files_3, fileEditorHandler_1, modesRegistry_1, configuration_1, textFileEditor_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    let FileUriLabelContribution = class FileUriLabelContribution {
        constructor(labelService) {
            labelService.registerFormatter({
                scheme: network_1.Schemas.file,
                formatting: {
                    label: '${authority}${path}',
                    separator: path_1.sep,
                    tildify: !platform_2.$i,
                    normalizeDriveLetter: platform_2.$i,
                    authorityPrefix: path_1.sep + path_1.sep,
                    workspaceSuffix: ''
                }
            });
        }
    };
    FileUriLabelContribution = __decorate([
        __param(0, label_1.$Vz)
    ], FileUriLabelContribution);
    (0, extensions_1.$mr)(files_3.$xHb, explorerService_1.$8Lb, 1 /* InstantiationType.Delayed */);
    // Register file editors
    platform_1.$8m.as(editor_1.$GE.EditorPane).registerEditorPane(editor_2.$_T.create(textFileEditor_1.$aMb, textFileEditor_1.$aMb.ID, nls.localize(0, null)), [
        new descriptors_1.$yh(fileEditorInput_1.$ULb)
    ]);
    platform_1.$8m.as(editor_1.$GE.EditorPane).registerEditorPane(editor_2.$_T.create(binaryFileEditor_1.$6Lb, binaryFileEditor_1.$6Lb.ID, nls.localize(1, null)), [
        new descriptors_1.$yh(fileEditorInput_1.$ULb)
    ]);
    // Register default file input factory
    platform_1.$8m.as(editor_1.$GE.EditorFactory).registerFileEditorFactory({
        typeId: files_2.$8db,
        createFileEditor: (resource, preferredResource, preferredName, preferredDescription, preferredEncoding, preferredLanguageId, preferredContents, instantiationService) => {
            return instantiationService.createInstance(fileEditorInput_1.$ULb, resource, preferredResource, preferredName, preferredDescription, preferredEncoding, preferredLanguageId, preferredContents);
        },
        isFileEditor: (obj) => {
            return obj instanceof fileEditorInput_1.$ULb;
        }
    });
    // Register Editor Input Serializer & Handler
    platform_1.$8m.as(editor_1.$GE.EditorFactory).registerEditorSerializer(files_2.$8db, fileEditorHandler_1.$$Lb);
    platform_1.$8m.as(contributions_1.Extensions.Workbench).registerWorkbenchContribution(fileEditorHandler_1.$_Lb, 2 /* LifecyclePhase.Ready */);
    // Register Explorer views
    platform_1.$8m.as(contributions_1.Extensions.Workbench).registerWorkbenchContribution(explorerViewlet_1.$RLb, 1 /* LifecyclePhase.Starting */);
    // Register Text File Editor Tracker
    platform_1.$8m.as(contributions_1.Extensions.Workbench).registerWorkbenchContribution(textFileEditorTracker_1.$5Lb, 1 /* LifecyclePhase.Starting */);
    // Register Text File Save Error Handler
    platform_1.$8m.as(contributions_1.Extensions.Workbench).registerWorkbenchContribution(textFileSaveErrorHandler_1.$XLb, 1 /* LifecyclePhase.Starting */);
    // Register uri display for file uris
    platform_1.$8m.as(contributions_1.Extensions.Workbench).registerWorkbenchContribution(FileUriLabelContribution, 1 /* LifecyclePhase.Starting */);
    // Register Workspace Watcher
    platform_1.$8m.as(contributions_1.Extensions.Workbench).registerWorkbenchContribution(workspaceWatcher_1.$9Lb, 3 /* LifecyclePhase.Restored */);
    // Register Dirty Files Indicator
    platform_1.$8m.as(contributions_1.Extensions.Workbench).registerWorkbenchContribution(dirtyFilesIndicator_1.$0Lb, 1 /* LifecyclePhase.Starting */);
    // Configuration
    const configurationRegistry = platform_1.$8m.as(configurationRegistry_1.$an.Configuration);
    const hotExitConfiguration = platform_2.$m ?
        {
            'type': 'string',
            'scope': 1 /* ConfigurationScope.APPLICATION */,
            'enum': [files_1.$rk.OFF, files_1.$rk.ON_EXIT, files_1.$rk.ON_EXIT_AND_WINDOW_CLOSE],
            'default': files_1.$rk.ON_EXIT,
            'markdownEnumDescriptions': [
                nls.localize(2, null),
                nls.localize(3, null),
                nls.localize(4, null)
            ],
            'markdownDescription': nls.localize(5, null, files_1.$rk.ON_EXIT, files_1.$rk.ON_EXIT_AND_WINDOW_CLOSE)
        } : {
        'type': 'string',
        'scope': 1 /* ConfigurationScope.APPLICATION */,
        'enum': [files_1.$rk.OFF, files_1.$rk.ON_EXIT_AND_WINDOW_CLOSE],
        'default': files_1.$rk.ON_EXIT_AND_WINDOW_CLOSE,
        'markdownEnumDescriptions': [
            nls.localize(6, null),
            nls.localize(7, null)
        ],
        'markdownDescription': nls.localize(8, null, files_1.$rk.ON_EXIT, files_1.$rk.ON_EXIT_AND_WINDOW_CLOSE)
    };
    configurationRegistry.registerConfiguration({
        'id': 'files',
        'order': 9,
        'title': nls.localize(9, null),
        'type': 'object',
        'properties': {
            [files_1.$tk]: {
                'type': 'object',
                'markdownDescription': nls.localize(10, null),
                'default': {
                    ...{ '**/.git': true, '**/.svn': true, '**/.hg': true, '**/CVS': true, '**/.DS_Store': true, '**/Thumbs.db': true },
                    ...(platform_2.$o ? { '**/*.crswap': true /* filter out swap files used for local file access */ } : undefined)
                },
                'scope': 4 /* ConfigurationScope.RESOURCE */,
                'additionalProperties': {
                    'anyOf': [
                        {
                            'type': 'boolean',
                            'enum': [true, false],
                            'enumDescriptions': [nls.localize(11, null), nls.localize(12, null)],
                            'description': nls.localize(13, null),
                        },
                        {
                            'type': 'object',
                            'properties': {
                                'when': {
                                    'type': 'string',
                                    'pattern': '\\w*\\$\\(basename\\)\\w*',
                                    'default': '$(basename).ext',
                                    'markdownDescription': nls.localize(14, null)
                                }
                            }
                        }
                    ]
                }
            },
            [files_1.$sk]: {
                'type': 'object',
                'markdownDescription': nls.localize(15, null),
                'additionalProperties': {
                    'type': 'string'
                }
            },
            'files.encoding': {
                'type': 'string',
                'enum': Object.keys(encoding_1.$rD),
                'default': 'utf8',
                'description': nls.localize(16, null),
                'scope': 5 /* ConfigurationScope.LANGUAGE_OVERRIDABLE */,
                'enumDescriptions': Object.keys(encoding_1.$rD).map(key => encoding_1.$rD[key].labelLong),
                'enumItemLabels': Object.keys(encoding_1.$rD).map(key => encoding_1.$rD[key].labelLong)
            },
            'files.autoGuessEncoding': {
                'type': 'boolean',
                'default': false,
                'markdownDescription': nls.localize(17, null, '`#files.encoding#`'),
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
                    nls.localize(18, null),
                    nls.localize(19, null),
                    nls.localize(20, null)
                ],
                'default': 'auto',
                'description': nls.localize(21, null),
                'scope': 5 /* ConfigurationScope.LANGUAGE_OVERRIDABLE */
            },
            'files.enableTrash': {
                'type': 'boolean',
                'default': true,
                'description': nls.localize(22, null)
            },
            'files.trimTrailingWhitespace': {
                'type': 'boolean',
                'default': false,
                'description': nls.localize(23, null),
                'scope': 5 /* ConfigurationScope.LANGUAGE_OVERRIDABLE */
            },
            'files.insertFinalNewline': {
                'type': 'boolean',
                'default': false,
                'description': nls.localize(24, null),
                'scope': 5 /* ConfigurationScope.LANGUAGE_OVERRIDABLE */
            },
            'files.trimFinalNewlines': {
                'type': 'boolean',
                'default': false,
                'description': nls.localize(25, null),
                scope: 5 /* ConfigurationScope.LANGUAGE_OVERRIDABLE */,
            },
            'files.autoSave': {
                'type': 'string',
                'enum': [files_1.$qk.OFF, files_1.$qk.AFTER_DELAY, files_1.$qk.ON_FOCUS_CHANGE, files_1.$qk.ON_WINDOW_CHANGE],
                'markdownEnumDescriptions': [
                    nls.localize(26, null),
                    nls.localize(27, null),
                    nls.localize(28, null),
                    nls.localize(29, null)
                ],
                'default': platform_2.$o ? files_1.$qk.AFTER_DELAY : files_1.$qk.OFF,
                'markdownDescription': nls.localize(30, null, files_1.$qk.OFF, files_1.$qk.AFTER_DELAY, files_1.$qk.ON_FOCUS_CHANGE, files_1.$qk.ON_WINDOW_CHANGE, files_1.$qk.AFTER_DELAY)
            },
            'files.autoSaveDelay': {
                'type': 'number',
                'default': 1000,
                'minimum': 0,
                'markdownDescription': nls.localize(31, null, files_1.$qk.AFTER_DELAY)
            },
            'files.watcherExclude': {
                'type': 'object',
                'patternProperties': {
                    '.*': { 'type': 'boolean' }
                },
                'default': { '**/.git/objects/**': true, '**/.git/subtree-cache/**': true, '**/node_modules/*/**': true, '**/.hg/store/**': true },
                'markdownDescription': nls.localize(32, null),
                'scope': 4 /* ConfigurationScope.RESOURCE */
            },
            'files.watcherInclude': {
                'type': 'array',
                'items': {
                    'type': 'string'
                },
                'default': [],
                'description': nls.localize(33, null),
                'scope': 4 /* ConfigurationScope.RESOURCE */
            },
            'files.hotExit': hotExitConfiguration,
            'files.defaultLanguage': {
                'type': 'string',
                'markdownDescription': nls.localize(34, null)
            },
            [files_1.$uk]: {
                'type': 'object',
                'patternProperties': {
                    '.*': { 'type': 'boolean' }
                },
                'default': {},
                'markdownDescription': nls.localize(35, null),
                'scope': 4 /* ConfigurationScope.RESOURCE */
            },
            [files_1.$vk]: {
                'type': 'object',
                'patternProperties': {
                    '.*': { 'type': 'boolean' }
                },
                'default': {},
                'markdownDescription': nls.localize(36, null),
                'scope': 4 /* ConfigurationScope.RESOURCE */
            },
            [files_1.$wk]: {
                'type': 'boolean',
                'markdownDescription': nls.localize(37, null),
                'default': false
            },
            'files.restoreUndoStack': {
                'type': 'boolean',
                'description': nls.localize(38, null),
                'default': true
            },
            'files.saveConflictResolution': {
                'type': 'string',
                'enum': [
                    'askUser',
                    'overwriteFileOnDisk'
                ],
                'enumDescriptions': [
                    nls.localize(39, null),
                    nls.localize(40, null)
                ],
                'description': nls.localize(41, null),
                'default': 'askUser',
                'scope': 5 /* ConfigurationScope.LANGUAGE_OVERRIDABLE */
            },
            'files.dialog.defaultPath': {
                'type': 'string',
                'pattern': '^((\\/|\\\\\\\\|[a-zA-Z]:\\\\).*)?$',
                'patternErrorMessage': nls.localize(42, null),
                'description': nls.localize(43, null),
                'scope': 2 /* ConfigurationScope.MACHINE */
            },
            'files.simpleDialog.enable': {
                'type': 'boolean',
                'description': nls.localize(44, null),
                'default': false
            },
            'files.participants.timeout': {
                type: 'number',
                default: 60000,
                markdownDescription: nls.localize(45, null),
            }
        }
    });
    configurationRegistry.registerConfiguration({
        ...editorConfigurationSchema_1.$k1,
        properties: {
            'editor.formatOnSave': {
                'type': 'boolean',
                'description': nls.localize(46, null),
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
                    nls.localize(47, null),
                    nls.localize(48, null),
                    nls.localize(49, null),
                ],
                'markdownDescription': nls.localize(50, null),
                'scope': 5 /* ConfigurationScope.LANGUAGE_OVERRIDABLE */,
            },
        }
    });
    configurationRegistry.registerConfiguration({
        'id': 'explorer',
        'order': 10,
        'title': nls.localize(51, null),
        'type': 'object',
        'properties': {
            'explorer.openEditors.visible': {
                'type': 'number',
                'description': nls.localize(52, null),
                'default': 9,
                'minimum': 1
            },
            'explorer.openEditors.minVisible': {
                'type': 'number',
                'description': nls.localize(53, null),
                'default': 0,
                'minimum': 0
            },
            'explorer.openEditors.sortOrder': {
                'type': 'string',
                'enum': ['editorOrder', 'alphabetical', 'fullPath'],
                'description': nls.localize(54, null),
                'enumDescriptions': [
                    nls.localize(55, null),
                    nls.localize(56, null),
                    nls.localize(57, null)
                ],
                'default': 'editorOrder'
            },
            'explorer.autoReveal': {
                'type': ['boolean', 'string'],
                'enum': [true, false, 'focusNoScroll'],
                'default': true,
                'enumDescriptions': [
                    nls.localize(58, null),
                    nls.localize(59, null),
                    nls.localize(60, null),
                ],
                'description': nls.localize(61, null)
            },
            'explorer.autoRevealExclude': {
                'type': 'object',
                'markdownDescription': nls.localize(62, null),
                'default': { '**/node_modules': true, '**/bower_components': true },
                'additionalProperties': {
                    'anyOf': [
                        {
                            'type': 'boolean',
                            'description': nls.localize(63, null),
                        },
                        {
                            type: 'object',
                            properties: {
                                when: {
                                    type: 'string',
                                    pattern: '\\w*\\$\\(basename\\)\\w*',
                                    default: '$(basename).ext',
                                    description: nls.localize(64, null)
                                }
                            }
                        }
                    ]
                }
            },
            'explorer.enableDragAndDrop': {
                'type': 'boolean',
                'description': nls.localize(65, null),
                'default': true
            },
            'explorer.confirmDragAndDrop': {
                'type': 'boolean',
                'description': nls.localize(66, null),
                'default': true
            },
            'explorer.confirmDelete': {
                'type': 'boolean',
                'description': nls.localize(67, null),
                'default': true
            },
            'explorer.enableUndo': {
                'type': 'boolean',
                'description': nls.localize(68, null),
                'default': true
            },
            'explorer.confirmUndo': {
                'type': 'string',
                'enum': ["verbose" /* UndoConfirmLevel.Verbose */, "default" /* UndoConfirmLevel.Default */, "light" /* UndoConfirmLevel.Light */],
                'description': nls.localize(69, null),
                'default': "default" /* UndoConfirmLevel.Default */,
                'enumDescriptions': [
                    nls.localize(70, null),
                    nls.localize(71, null),
                    nls.localize(72, null),
                ],
            },
            'explorer.expandSingleFolderWorkspaces': {
                'type': 'boolean',
                'description': nls.localize(73, null),
                'default': true
            },
            'explorer.sortOrder': {
                'type': 'string',
                'enum': ["default" /* SortOrder.Default */, "mixed" /* SortOrder.Mixed */, "filesFirst" /* SortOrder.FilesFirst */, "type" /* SortOrder.Type */, "modified" /* SortOrder.Modified */, "foldersNestsFiles" /* SortOrder.FoldersNestsFiles */],
                'default': "default" /* SortOrder.Default */,
                'enumDescriptions': [
                    nls.localize(74, null),
                    nls.localize(75, null),
                    nls.localize(76, null),
                    nls.localize(77, null),
                    nls.localize(78, null),
                    nls.localize(79, null)
                ],
                'markdownDescription': nls.localize(80, null)
            },
            'explorer.sortOrderLexicographicOptions': {
                'type': 'string',
                'enum': ["default" /* LexicographicOptions.Default */, "upper" /* LexicographicOptions.Upper */, "lower" /* LexicographicOptions.Lower */, "unicode" /* LexicographicOptions.Unicode */],
                'default': "default" /* LexicographicOptions.Default */,
                'enumDescriptions': [
                    nls.localize(81, null),
                    nls.localize(82, null),
                    nls.localize(83, null),
                    nls.localize(84, null)
                ],
                'description': nls.localize(85, null)
            },
            'explorer.decorations.colors': {
                type: 'boolean',
                description: nls.localize(86, null),
                default: true
            },
            'explorer.decorations.badges': {
                type: 'boolean',
                description: nls.localize(87, null),
                default: true
            },
            'explorer.incrementalNaming': {
                'type': 'string',
                enum: ['simple', 'smart', 'disabled'],
                enumDescriptions: [
                    nls.localize(88, null),
                    nls.localize(89, null),
                    nls.localize(90, null)
                ],
                description: nls.localize(91, null),
                default: 'simple'
            },
            'explorer.compactFolders': {
                'type': 'boolean',
                'description': nls.localize(92, null),
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
                    nls.localize(93, null),
                    nls.localize(94, null),
                    nls.localize(95, null),
                ],
                'description': nls.localize(96, null),
                'default': 'auto'
            },
            'explorer.excludeGitIgnore': {
                type: 'boolean',
                markdownDescription: nls.localize(97, null, '`#files.exclude#`'),
                default: false,
                scope: 4 /* ConfigurationScope.RESOURCE */
            },
            'explorer.fileNesting.enabled': {
                'type': 'boolean',
                scope: 4 /* ConfigurationScope.RESOURCE */,
                'markdownDescription': nls.localize(98, null),
                'default': false,
            },
            'explorer.fileNesting.expand': {
                'type': 'boolean',
                'markdownDescription': nls.localize(99, null, '`#explorer.fileNesting.enabled#`'),
                'default': true,
            },
            'explorer.fileNesting.patterns': {
                'type': 'object',
                scope: 4 /* ConfigurationScope.RESOURCE */,
                'markdownDescription': nls.localize(100, null, '`#explorer.fileNesting.enabled#`'),
                patternProperties: {
                    '^[^*]*\\*?[^*]*$': {
                        markdownDescription: nls.localize(101, null),
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
    editorExtensions_1.$CV.addImplementation(110, 'explorer', (accessor) => {
        const undoRedoService = accessor.get(undoRedo_1.$wu);
        const explorerService = accessor.get(files_3.$xHb);
        const configurationService = accessor.get(configuration_1.$8h);
        const explorerCanUndo = configurationService.getValue().explorer.enableUndo;
        if (explorerService.hasViewFocus() && undoRedoService.canUndo(explorerService_1.$7Lb) && explorerCanUndo) {
            undoRedoService.undo(explorerService_1.$7Lb);
            return true;
        }
        return false;
    });
    editorExtensions_1.$DV.addImplementation(110, 'explorer', (accessor) => {
        const undoRedoService = accessor.get(undoRedo_1.$wu);
        const explorerService = accessor.get(files_3.$xHb);
        const configurationService = accessor.get(configuration_1.$8h);
        const explorerCanUndo = configurationService.getValue().explorer.enableUndo;
        if (explorerService.hasViewFocus() && undoRedoService.canRedo(explorerService_1.$7Lb) && explorerCanUndo) {
            undoRedoService.redo(explorerService_1.$7Lb);
            return true;
        }
        return false;
    });
    modesRegistry_1.$Xt.registerLanguage({
        id: files_2.$0db,
        aliases: ['Binary'],
        mimetypes: ['text/x-code-binary']
    });
});
//# sourceMappingURL=files.contribution.js.map