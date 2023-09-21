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
define(["require", "exports", "vs/workbench/common/editor", "vs/platform/files/common/files", "vs/platform/contextkey/common/contextkey", "vs/base/common/lifecycle", "vs/editor/common/services/model", "vs/editor/common/languages/language", "vs/workbench/services/textfile/common/textfiles", "vs/platform/contextkey/common/contextkeys", "vs/base/common/functional", "vs/nls"], function (require, exports, editor_1, files_1, contextkey_1, lifecycle_1, model_1, language_1, textfiles_1, contextkeys_1, functional_1, nls_1) {
    "use strict";
    var TextFileContentProvider_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.OpenEditor = exports.TextFileContentProvider = exports.LexicographicOptions = exports.UndoConfirmLevel = exports.SortOrder = exports.BINARY_TEXT_FILE_MODE = exports.BINARY_FILE_EDITOR_ID = exports.FILE_EDITOR_INPUT_ID = exports.TEXT_FILE_EDITOR_ID = exports.ExplorerFocusCondition = exports.FilesExplorerFocusCondition = exports.ViewHasSomeCollapsibleRootItemContext = exports.ExplorerCompressedLastFocusContext = exports.ExplorerCompressedFirstFocusContext = exports.ExplorerCompressedFocusContext = exports.ExplorerFocusedContext = exports.OpenEditorsFocusedContext = exports.FilesExplorerFocusedContext = exports.ExplorerResourceMoveableToTrash = exports.ExplorerResourceCut = exports.ExplorerRootContext = exports.ExplorerResourceAvailableEditorIdsContext = exports.ExplorerResourceNotReadonlyContext = exports.ExplorerResourceReadonlyContext = exports.ExplorerFolderContext = exports.FoldersViewVisibleContext = exports.ExplorerViewletVisibleContext = exports.VIEW_ID = exports.VIEWLET_ID = void 0;
    /**
     * Explorer viewlet id.
     */
    exports.VIEWLET_ID = 'workbench.view.explorer';
    /**
     * Explorer file view id.
     */
    exports.VIEW_ID = 'workbench.explorer.fileView';
    /**
     * Context Keys to use with keybindings for the Explorer and Open Editors view
     */
    exports.ExplorerViewletVisibleContext = new contextkey_1.RawContextKey('explorerViewletVisible', true, { type: 'boolean', description: (0, nls_1.localize)('explorerViewletVisible', "True when the EXPLORER viewlet is visible.") });
    exports.FoldersViewVisibleContext = new contextkey_1.RawContextKey('foldersViewVisible', true, { type: 'boolean', description: (0, nls_1.localize)('foldersViewVisible', "True when the FOLDERS view (the file tree within the explorer view container) is visible.") });
    exports.ExplorerFolderContext = new contextkey_1.RawContextKey('explorerResourceIsFolder', false, { type: 'boolean', description: (0, nls_1.localize)('explorerResourceIsFolder', "True when the focused item in the EXPLORER is a folder.") });
    exports.ExplorerResourceReadonlyContext = new contextkey_1.RawContextKey('explorerResourceReadonly', false, { type: 'boolean', description: (0, nls_1.localize)('explorerResourceReadonly', "True when the focused item in the EXPLORER is read-only.") });
    exports.ExplorerResourceNotReadonlyContext = exports.ExplorerResourceReadonlyContext.toNegated();
    /**
     * Comma separated list of editor ids that can be used for the selected explorer resource.
     */
    exports.ExplorerResourceAvailableEditorIdsContext = new contextkey_1.RawContextKey('explorerResourceAvailableEditorIds', '');
    exports.ExplorerRootContext = new contextkey_1.RawContextKey('explorerResourceIsRoot', false, { type: 'boolean', description: (0, nls_1.localize)('explorerResourceIsRoot', "True when the focused item in the EXPLORER is a root folder.") });
    exports.ExplorerResourceCut = new contextkey_1.RawContextKey('explorerResourceCut', false, { type: 'boolean', description: (0, nls_1.localize)('explorerResourceCut', "True when an item in the EXPLORER has been cut for cut and paste.") });
    exports.ExplorerResourceMoveableToTrash = new contextkey_1.RawContextKey('explorerResourceMoveableToTrash', false, { type: 'boolean', description: (0, nls_1.localize)('explorerResourceMoveableToTrash', "True when the focused item in the EXPLORER can be moved to trash.") });
    exports.FilesExplorerFocusedContext = new contextkey_1.RawContextKey('filesExplorerFocus', true, { type: 'boolean', description: (0, nls_1.localize)('filesExplorerFocus', "True when the focus is inside the EXPLORER view.") });
    exports.OpenEditorsFocusedContext = new contextkey_1.RawContextKey('openEditorsFocus', true, { type: 'boolean', description: (0, nls_1.localize)('openEditorsFocus', "True when the focus is inside the OPEN EDITORS view.") });
    exports.ExplorerFocusedContext = new contextkey_1.RawContextKey('explorerViewletFocus', true, { type: 'boolean', description: (0, nls_1.localize)('explorerViewletFocus', "True when the focus is inside the EXPLORER viewlet.") });
    // compressed nodes
    exports.ExplorerCompressedFocusContext = new contextkey_1.RawContextKey('explorerViewletCompressedFocus', true, { type: 'boolean', description: (0, nls_1.localize)('explorerViewletCompressedFocus', "True when the focused item in the EXPLORER view is a compact item.") });
    exports.ExplorerCompressedFirstFocusContext = new contextkey_1.RawContextKey('explorerViewletCompressedFirstFocus', true, { type: 'boolean', description: (0, nls_1.localize)('explorerViewletCompressedFirstFocus', "True when the focus is inside a compact item's first part in the EXPLORER view.") });
    exports.ExplorerCompressedLastFocusContext = new contextkey_1.RawContextKey('explorerViewletCompressedLastFocus', true, { type: 'boolean', description: (0, nls_1.localize)('explorerViewletCompressedLastFocus', "True when the focus is inside a compact item's last part in the EXPLORER view.") });
    exports.ViewHasSomeCollapsibleRootItemContext = new contextkey_1.RawContextKey('viewHasSomeCollapsibleItem', false, { type: 'boolean', description: (0, nls_1.localize)('viewHasSomeCollapsibleItem', "True when a workspace in the EXPLORER view has some collapsible root child.") });
    exports.FilesExplorerFocusCondition = contextkey_1.ContextKeyExpr.and(exports.FoldersViewVisibleContext, exports.FilesExplorerFocusedContext, contextkey_1.ContextKeyExpr.not(contextkeys_1.InputFocusedContextKey));
    exports.ExplorerFocusCondition = contextkey_1.ContextKeyExpr.and(exports.FoldersViewVisibleContext, exports.ExplorerFocusedContext, contextkey_1.ContextKeyExpr.not(contextkeys_1.InputFocusedContextKey));
    /**
     * Text file editor id.
     */
    exports.TEXT_FILE_EDITOR_ID = 'workbench.editors.files.textFileEditor';
    /**
     * File editor input id.
     */
    exports.FILE_EDITOR_INPUT_ID = 'workbench.editors.files.fileEditorInput';
    /**
     * Binary file editor id.
     */
    exports.BINARY_FILE_EDITOR_ID = 'workbench.editors.files.binaryFileEditor';
    /**
     * Language identifier for binary files opened as text.
     */
    exports.BINARY_TEXT_FILE_MODE = 'code-text-binary';
    var SortOrder;
    (function (SortOrder) {
        SortOrder["Default"] = "default";
        SortOrder["Mixed"] = "mixed";
        SortOrder["FilesFirst"] = "filesFirst";
        SortOrder["Type"] = "type";
        SortOrder["Modified"] = "modified";
        SortOrder["FoldersNestsFiles"] = "foldersNestsFiles";
    })(SortOrder || (exports.SortOrder = SortOrder = {}));
    var UndoConfirmLevel;
    (function (UndoConfirmLevel) {
        UndoConfirmLevel["Verbose"] = "verbose";
        UndoConfirmLevel["Default"] = "default";
        UndoConfirmLevel["Light"] = "light";
    })(UndoConfirmLevel || (exports.UndoConfirmLevel = UndoConfirmLevel = {}));
    var LexicographicOptions;
    (function (LexicographicOptions) {
        LexicographicOptions["Default"] = "default";
        LexicographicOptions["Upper"] = "upper";
        LexicographicOptions["Lower"] = "lower";
        LexicographicOptions["Unicode"] = "unicode";
    })(LexicographicOptions || (exports.LexicographicOptions = LexicographicOptions = {}));
    let TextFileContentProvider = TextFileContentProvider_1 = class TextFileContentProvider extends lifecycle_1.Disposable {
        constructor(textFileService, fileService, languageService, modelService) {
            super();
            this.textFileService = textFileService;
            this.fileService = fileService;
            this.languageService = languageService;
            this.modelService = modelService;
            this.fileWatcherDisposable = this._register(new lifecycle_1.MutableDisposable());
        }
        static async open(resource, scheme, label, editorService, options) {
            await editorService.openEditor({
                original: { resource: TextFileContentProvider_1.resourceToTextFile(scheme, resource) },
                modified: { resource },
                label,
                options
            });
        }
        static resourceToTextFile(scheme, resource) {
            return resource.with({ scheme, query: JSON.stringify({ scheme: resource.scheme, query: resource.query }) });
        }
        static textFileToResource(resource) {
            const { scheme, query } = JSON.parse(resource.query);
            return resource.with({ scheme, query });
        }
        async provideTextContent(resource) {
            if (!resource.query) {
                // We require the URI to use the `query` to transport the original scheme and query
                // as done by `resourceToTextFile`
                return null;
            }
            const savedFileResource = TextFileContentProvider_1.textFileToResource(resource);
            // Make sure our text file is resolved up to date
            const codeEditorModel = await this.resolveEditorModel(resource);
            // Make sure to keep contents up to date when it changes
            if (!this.fileWatcherDisposable.value) {
                const disposables = new lifecycle_1.DisposableStore();
                this.fileWatcherDisposable.value = disposables;
                disposables.add(this.fileService.onDidFilesChange(changes => {
                    if (changes.contains(savedFileResource, 0 /* FileChangeType.UPDATED */)) {
                        this.resolveEditorModel(resource, false /* do not create if missing */); // update model when resource changes
                    }
                }));
                if (codeEditorModel) {
                    disposables.add((0, functional_1.once)(codeEditorModel.onWillDispose)(() => this.fileWatcherDisposable.clear()));
                }
            }
            return codeEditorModel;
        }
        async resolveEditorModel(resource, createAsNeeded = true) {
            const savedFileResource = TextFileContentProvider_1.textFileToResource(resource);
            const content = await this.textFileService.readStream(savedFileResource);
            let codeEditorModel = this.modelService.getModel(resource);
            if (codeEditorModel) {
                this.modelService.updateModel(codeEditorModel, content.value);
            }
            else if (createAsNeeded) {
                const textFileModel = this.modelService.getModel(savedFileResource);
                let languageSelector;
                if (textFileModel) {
                    languageSelector = this.languageService.createById(textFileModel.getLanguageId());
                }
                else {
                    languageSelector = this.languageService.createByFilepathOrFirstLine(savedFileResource);
                }
                codeEditorModel = this.modelService.createModel(content.value, languageSelector, resource);
            }
            return codeEditorModel;
        }
    };
    exports.TextFileContentProvider = TextFileContentProvider;
    exports.TextFileContentProvider = TextFileContentProvider = TextFileContentProvider_1 = __decorate([
        __param(0, textfiles_1.ITextFileService),
        __param(1, files_1.IFileService),
        __param(2, language_1.ILanguageService),
        __param(3, model_1.IModelService)
    ], TextFileContentProvider);
    class OpenEditor {
        static { this.COUNTER = 0; }
        constructor(_editor, _group) {
            this._editor = _editor;
            this._group = _group;
            this.id = OpenEditor.COUNTER++;
        }
        get editor() {
            return this._editor;
        }
        get group() {
            return this._group;
        }
        get groupId() {
            return this._group.id;
        }
        getId() {
            return `openeditor:${this.groupId}:${this.id}`;
        }
        isPreview() {
            return !this._group.isPinned(this.editor);
        }
        isSticky() {
            return this._group.isSticky(this.editor);
        }
        getResource() {
            return editor_1.EditorResourceAccessor.getOriginalUri(this.editor, { supportSideBySide: editor_1.SideBySideEditor.PRIMARY });
        }
    }
    exports.OpenEditor = OpenEditor;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmlsZXMuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9maWxlcy9jb21tb24vZmlsZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7OztJQXNCaEc7O09BRUc7SUFDVSxRQUFBLFVBQVUsR0FBRyx5QkFBeUIsQ0FBQztJQUVwRDs7T0FFRztJQUNVLFFBQUEsT0FBTyxHQUFHLDZCQUE2QixDQUFDO0lBRXJEOztPQUVHO0lBQ1UsUUFBQSw2QkFBNkIsR0FBRyxJQUFJLDBCQUFhLENBQVUsd0JBQXdCLEVBQUUsSUFBSSxFQUFFLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRSxXQUFXLEVBQUUsSUFBQSxjQUFRLEVBQUMsd0JBQXdCLEVBQUUsNENBQTRDLENBQUMsRUFBRSxDQUFDLENBQUM7SUFDL00sUUFBQSx5QkFBeUIsR0FBRyxJQUFJLDBCQUFhLENBQVUsb0JBQW9CLEVBQUUsSUFBSSxFQUFFLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRSxXQUFXLEVBQUUsSUFBQSxjQUFRLEVBQUMsb0JBQW9CLEVBQUUsMkZBQTJGLENBQUMsRUFBRSxDQUFDLENBQUM7SUFDbFAsUUFBQSxxQkFBcUIsR0FBRyxJQUFJLDBCQUFhLENBQVUsMEJBQTBCLEVBQUUsS0FBSyxFQUFFLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRSxXQUFXLEVBQUUsSUFBQSxjQUFRLEVBQUMsMEJBQTBCLEVBQUUseURBQXlELENBQUMsRUFBRSxDQUFDLENBQUM7SUFDek4sUUFBQSwrQkFBK0IsR0FBRyxJQUFJLDBCQUFhLENBQVUsMEJBQTBCLEVBQUUsS0FBSyxFQUFFLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRSxXQUFXLEVBQUUsSUFBQSxjQUFRLEVBQUMsMEJBQTBCLEVBQUUsMERBQTBELENBQUMsRUFBRSxDQUFDLENBQUM7SUFDcE8sUUFBQSxrQ0FB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