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
define(["require", "exports", "vs/base/common/cancellation", "vs/base/common/lifecycle", "vs/base/common/linkedList", "vs/base/common/map", "vs/editor/browser/editorBrowser", "vs/editor/browser/services/bulkEditService", "vs/nls", "vs/platform/configuration/common/configuration", "vs/platform/configuration/common/configurationRegistry", "vs/platform/dialogs/common/dialogs", "vs/platform/instantiation/common/extensions", "vs/platform/instantiation/common/instantiation", "vs/platform/log/common/log", "vs/platform/progress/common/progress", "vs/platform/registry/common/platform", "vs/platform/undoRedo/common/undoRedo", "vs/workbench/contrib/bulkEdit/browser/bulkCellEdits", "vs/workbench/contrib/bulkEdit/browser/bulkFileEdits", "vs/workbench/contrib/bulkEdit/browser/bulkTextEdits", "vs/workbench/services/editor/common/editorService", "vs/workbench/services/lifecycle/common/lifecycle", "vs/workbench/services/workingCopy/common/workingCopyService"], function (require, exports, cancellation_1, lifecycle_1, linkedList_1, map_1, editorBrowser_1, bulkEditService_1, nls_1, configuration_1, configurationRegistry_1, dialogs_1, extensions_1, instantiation_1, log_1, progress_1, platform_1, undoRedo_1, bulkCellEdits_1, bulkFileEdits_1, bulkTextEdits_1, editorService_1, lifecycle_2, workingCopyService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.BulkEditService = void 0;
    function liftEdits(edits) {
        return edits.map(edit => {
            if (bulkEditService_1.ResourceTextEdit.is(edit)) {
                return bulkEditService_1.ResourceTextEdit.lift(edit);
            }
            if (bulkEditService_1.ResourceFileEdit.is(edit)) {
                return bulkEditService_1.ResourceFileEdit.lift(edit);
            }
            if (bulkCellEdits_1.ResourceNotebookCellEdit.is(edit)) {
                return bulkCellEdits_1.ResourceNotebookCellEdit.lift(edit);
            }
            throw new Error('Unsupported edit');
        });
    }
    let BulkEdit = class BulkEdit {
        constructor(_label, _code, _editor, _progress, _token, _edits, _undoRedoGroup, _undoRedoSource, _confirmBeforeUndo, _instaService, _logService) {
            this._label = _label;
            this._code = _code;
            this._editor = _editor;
            this._progress = _progress;
            this._token = _token;
            this._edits = _edits;
            this._undoRedoGroup = _undoRedoGroup;
            this._undoRedoSource = _undoRedoSource;
            this._confirmBeforeUndo = _confirmBeforeUndo;
            this._instaService = _instaService;
            this._logService = _logService;
        }
        ariaMessage() {
            const otherResources = new map_1.ResourceMap();
            const textEditResources = new map_1.ResourceMap();
            let textEditCount = 0;
            for (const edit of this._edits) {
                if (edit instanceof bulkEditService_1.ResourceTextEdit) {
                    textEditCount += 1;
                    textEditResources.set(edit.resource, true);
                }
                else if (edit instanceof bulkEditService_1.ResourceFileEdit) {
                    otherResources.set(edit.oldResource ?? edit.newResource, true);
                }
            }
            if (this._edits.length === 0) {
                return (0, nls_1.localize)('summary.0', "Made no edits");
            }
            else if (otherResources.size === 0) {
                if (textEditCount > 1 && textEditResources.size > 1) {
                    return (0, nls_1.localize)('summary.nm', "Made {0} text edits in {1} files", textEditCount, textEditResources.size);
                }
                else {
                    return (0, nls_1.localize)('summary.n0', "Made {0} text edits in one file", textEditCount);
                }
            }
            else {
                return (0, nls_1.localize)('summary.textFiles', "Made {0} text edits in {1} files, also created or deleted {2} files", textEditCount, textEditResources.size, otherResources.size);
            }
        }
        async perform() {
            if (this._edits.length === 0) {
                return [];
            }
            const ranges = [1];
            for (let i = 1; i < this._edits.length; i++) {
                if (Object.getPrototypeOf(this._edits[i - 1]) === Object.getPrototypeOf(this._edits[i])) {
                    ranges[ranges.length - 1]++;
                }
                else {
                    ranges.push(1);
                }
            }
            // Show infinte progress when there is only 1 item since we do not know how long it takes
            const increment = this._edits.length > 1 ? 0 : undefined;
            this._progress.report({ increment, total: 100 });
            // Increment by percentage points since progress API expects that
            const progress = { report: _ => this._progress.report({ increment: 100 / this._edits.length }) };
            const resources = [];
            let index = 0;
            for (const range of ranges) {
                if (this._token.isCancellationRequested) {
                    break;
                }
                const group = this._edits.slice(index, index + range);
                if (group[0] instanceof bulkEditService_1.ResourceFileEdit) {
                    resources.push(await this._performFileEdits(group, this._undoRedoGroup, this._undoRedoSource, this._confirmBeforeUndo, progress));
                }
                else if (group[0] instanceof bulkEditService_1.ResourceTextEdit) {
                    resources.push(await this._performTextEdits(group, this._undoRedoGroup, this._undoRedoSource, progress));
                }
                else if (group[0] instanceof bulkCellEdits_1.ResourceNotebookCellEdit) {
                    resources.push(await this._performCellEdits(group, this._undoRedoGroup, this._undoRedoSource, progress));
                }
                else {
                    console.log('UNKNOWN EDIT');
                }
                index = index + range;
            }
            return resources.flat();
        }
        async _performFileEdits(edits, undoRedoGroup, undoRedoSource, confirmBeforeUndo, progress) {
            this._logService.debug('_performFileEdits', JSON.stringify(edits));
            const model = this._instaService.createInstance(bulkFileEdits_1.BulkFileEdits, this._label || (0, nls_1.localize)('workspaceEdit', "Workspace Edit"), this._code || 'undoredo.workspaceEdit', undoRedoGroup, undoRedoSource, confirmBeforeUndo, progress, this._token, edits);
            return await model.apply();
        }
        async _performTextEdits(edits, undoRedoGroup, undoRedoSource, progress) {
            this._logService.debug('_performTextEdits', JSON.stringify(edits));
            const model = this._instaService.createInstance(bulkTextEdits_1.BulkTextEdits, this._label || (0, nls_1.localize)('workspaceEdit', "Workspace Edit"), this._code || 'undoredo.workspaceEdit', this._editor, undoRedoGroup, undoRedoSource, progress, this._token, edits);
            return await model.apply();
        }
        async _performCellEdits(edits, undoRedoGroup, undoRedoSource, progress) {
            this._logService.debug('_performCellEdits', JSON.stringify(edits));
            const model = this._instaService.createInstance(bulkCellEdits_1.BulkCellEdits, undoRedoGroup, undoRedoSource, progress, this._token, edits);
            return await model.apply();
        }
    };
    BulkEdit = __decorate([
        __param(9, instantiation_1.IInstantiationService),
        __param(10, log_1.ILogService)
    ], BulkEdit);
    let BulkEditService = class BulkEditService {
        constructor(_instaService, _logService, _editorService, _lifecycleService, _dialogService, _workingCopyService, _configService) {
            this._instaService = _instaService;
            this._logService = _logService;
            this._editorService = _editorService;
            this._lifecycleService = _lifecycleService;
            this._dialogService = _dialogService;
            this._workingCopyService = _workingCopyService;
            this._configService = _configService;
            this._activeUndoRedoGroups = new linkedList_1.LinkedList();
        }
        setPreviewHandler(handler) {
            this._previewHandler = handler;
            return (0, lifecycle_1.toDisposable)(() => {
                if (this._previewHandler === handler) {
                    this._previewHandler = undefined;
                }
            });
        }
        hasPreviewHandler() {
            return Boolean(this._previewHandler);
        }
        async apply(editsIn, options) {
            let edits = liftEdits(Array.isArray(editsIn) ? editsIn : editsIn.edits);
            if (edits.length === 0) {
                return { ariaSummary: (0, nls_1.localize)('nothing', "Made no edits"), isApplied: false };
            }
            if (this._previewHandler && (options?.showPreview || edits.some(value => value.metadata?.needsConfirmation))) {
                edits = await this._previewHandler(edits, options);
            }
            let codeEditor = options?.editor;
            // try to find code editor
            if (!codeEditor) {
                const candidate = this._editorService.activeTextEditorControl;
                if ((0, editorBrowser_1.isCodeEditor)(candidate)) {
                    codeEditor = candidate;
                }
                else if ((0, editorBrowser_1.isDiffEditor)(candidate)) {
                    codeEditor = candidate.getModifiedEditor();
                }
            }
            if (codeEditor && codeEditor.getOption(90 /* EditorOption.readOnly */)) {
                // If the code editor is readonly still allow bulk edits to be applied #68549
                codeEditor = undefined;
            }
            // undo-redo-group: if a group id is passed then try to find it
            // in the list of active edits. otherwise (or when not found)
            // create a separate undo-redo-group
            let undoRedoGroup;
            let undoRedoGroupRemove = () => { };
            if (typeof options?.undoRedoGroupId === 'number') {
                for (const candidate of this._activeUndoRedoGroups) {
                    if (candidate.id === options.undoRedoGroupId) {
                        undoRedoGroup = candidate;
                        break;
                    }
                }
            }
            if (!undoRedoGroup) {
                undoRedoGroup = new undoRedo_1.UndoRedoGroup();
                undoRedoGroupRemove = this._activeUndoRedoGroups.push(undoRedoGroup);
            }
            const label = options?.quotableLabel || options?.label;
            const bulkEdit = this._instaService.createInstance(BulkEdit, label, options?.code, codeEditor, options?.progress ?? progress_1.Progress.None, options?.token ?? cancellation_1.CancellationToken.None, edits, undoRedoGroup, options?.undoRedoSource, !!options?.confirmBeforeUndo);
            let listener;
            try {
                listener = this._lifecycleService.onBeforeShutdown(e => e.veto(this._shouldVeto(label, e.reason), 'veto.blukEditService'));
                const resources = await bulkEdit.perform();
                // when enabled (option AND setting) loop over all dirty working copies and trigger save
                // for those that were involved in this bulk edit operation.
                if (options?.respectAutoSaveConfig && this._configService.getValue(autoSaveSetting) === true && resources.length > 1) {
                    await this._saveAll(resources);
                }
                return { ariaSummary: bulkEdit.ariaMessage(), isApplied: edits.length > 0 };
            }
            catch (err) {
                // console.log('apply FAILED');
                // console.log(err);
                this._logService.error(err);
                throw err;
            }
            finally {
                listener?.dispose();
                undoRedoGroupRemove();
            }
        }
        async _saveAll(resources) {
            const set = new map_1.ResourceSet(resources);
            const saves = this._workingCopyService.dirtyWorkingCopies.map(async (copy) => {
                if (set.has(copy.resource)) {
                    await copy.save();
                }
            });
            const result = await Promise.allSettled(saves);
            for (const item of result) {
                if (item.status === 'rejected') {
                    this._logService.warn(item.reason);
                }
            }
        }
        async _shouldVeto(label, reason) {
            let message;
            let primaryButton;
            switch (reason) {
                case 1 /* ShutdownReason.CLOSE */:
                    message = (0, nls_1.localize)('closeTheWindow.message', "Are you sure you want to close the window?");
                    primaryButton = (0, nls_1.localize)({ key: 'closeTheWindow', comment: ['&& denotes a mnemonic'] }, "&&Close Window");
                    break;
                case 4 /* ShutdownReason.LOAD */:
                    message = (0, nls_1.localize)('changeWorkspace.message', "Are you sure you want to change the workspace?");
                    primaryButton = (0, nls_1.localize)({ key: 'changeWorkspace', comment: ['&& denotes a mnemonic'] }, "Change &&Workspace");
                    break;
                case 3 /* ShutdownReason.RELOAD */:
                    message = (0, nls_1.localize)('reloadTheWindow.message', "Are you sure you want to reload the window?");
                    primaryButton = (0, nls_1.localize)({ key: 'reloadTheWindow', comment: ['&& denotes a mnemonic'] }, "&&Reload Window");
                    break;
                default:
                    message = (0, nls_1.localize)('quit.message', "Are you sure you want to quit?");
                    primaryButton = (0, nls_1.localize)({ key: 'quit', comment: ['&& denotes a mnemonic'] }, "&&Quit");
                    break;
            }
            const result = await this._dialogService.confirm({
                message,
                detail: (0, nls_1.localize)('areYouSureQuiteBulkEdit.detail', "'{0}' is in progress.", label || (0, nls_1.localize)('fileOperation', "File operation")),
                primaryButton
            });
            return !result.confirmed;
        }
    };
    exports.BulkEditService = BulkEditService;
    exports.BulkEditService = BulkEditService = __decorate([
        __param(0, instantiation_1.IInstantiationService),
        __param(1, log_1.ILogService),
        __param(2, editorService_1.IEditorService),
        __param(3, lifecycle_2.ILifecycleService),
        __param(4, dialogs_1.IDialogService),
        __param(5, workingCopyService_1.IWorkingCopyService),
        __param(6, configuration_1.IConfigurationService)
    ], BulkEditService);
    (0, extensions_1.registerSingleton)(bulkEditService_1.IBulkEditService, BulkEditService, 1 /* InstantiationType.Delayed */);
    const autoSaveSetting = 'files.refactoring.autoSave';
    platform_1.Registry.as(configurationRegistry_1.Extensions.Configuration).registerConfiguration({
        id: 'files',
        properties: {
            [autoSaveSetting]: {
                description: (0, nls_1.localize)('refactoring.autoSave', "Controls if files that were part of a refactoring are saved automatically"),
                default: true,
                type: 'boolean'
            }
        }
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVsa0VkaXRTZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvYnVsa0VkaXQvYnJvd3Nlci9idWxrRWRpdFNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBNEJoRyxTQUFTLFNBQVMsQ0FBQyxLQUFxQjtRQUN2QyxPQUFPLEtBQUssQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUU7WUFDdkIsSUFBSSxrQ0FBZ0IsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLEVBQUU7Z0JBQzlCLE9BQU8sa0NBQWdCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO2FBQ25DO1lBQ0QsSUFBSSxrQ0FBZ0IsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLEVBQUU7Z0JBQzlCLE9BQU8sa0NBQWdCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO2FBQ25DO1lBQ0QsSUFBSSx3Q0FBd0IsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLEVBQUU7Z0JBQ3RDLE9BQU8sd0NBQXdCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO2FBQzNDO1lBQ0QsTUFBTSxJQUFJLEtBQUssQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO1FBQ3JDLENBQUMsQ0FBQyxDQUFDO0lBQ0osQ0FBQztJQUVELElBQU0sUUFBUSxHQUFkLE1BQU0sUUFBUTtRQUViLFlBQ2tCLE1BQTBCLEVBQzFCLEtBQXlCLEVBQ3pCLE9BQWdDLEVBQ2hDLFNBQW1DLEVBQ25DLE1BQXlCLEVBQ3pCLE1BQXNCLEVBQ3RCLGNBQTZCLEVBQzdCLGVBQTJDLEVBQzNDLGtCQUEyQixFQUNKLGFBQW9DLEVBQzlDLFdBQXdCO1lBVnJDLFdBQU0sR0FBTixNQUFNLENBQW9CO1lBQzFCLFVBQUssR0FBTCxLQUFLLENBQW9CO1lBQ3pCLFlBQU8sR0FBUCxP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