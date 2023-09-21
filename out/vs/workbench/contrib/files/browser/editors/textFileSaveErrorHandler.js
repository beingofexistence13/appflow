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
define(["require", "exports", "vs/nls", "vs/base/common/errorMessage", "vs/base/common/resources", "vs/base/common/actions", "vs/base/common/uri", "vs/workbench/services/textfile/common/textfiles", "vs/platform/instantiation/common/instantiation", "vs/base/common/lifecycle", "vs/editor/common/services/resolverService", "vs/base/common/map", "vs/workbench/common/editor/diffEditorInput", "vs/platform/contextkey/common/contextkey", "vs/workbench/contrib/files/common/files", "vs/workbench/contrib/files/browser/editors/fileEditorInput", "vs/workbench/contrib/files/browser/fileConstants", "vs/platform/notification/common/notification", "vs/platform/opener/common/opener", "vs/platform/storage/common/storage", "vs/platform/product/common/productService", "vs/base/common/event", "vs/workbench/services/editor/common/editorService", "vs/base/common/platform", "vs/base/common/network", "vs/workbench/services/preferences/common/preferences", "vs/workbench/common/editor", "vs/base/common/hash"], function (require, exports, nls_1, errorMessage_1, resources_1, actions_1, uri_1, textfiles_1, instantiation_1, lifecycle_1, resolverService_1, map_1, diffEditorInput_1, contextkey_1, files_1, fileEditorInput_1, fileConstants_1, notification_1, opener_1, storage_1, productService_1, event_1, editorService_1, platform_1, network_1, preferences_1, editor_1, hash_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.revertLocalChangesCommand = exports.acceptLocalChangesCommand = exports.TextFileSaveErrorHandler = exports.CONFLICT_RESOLUTION_SCHEME = exports.CONFLICT_RESOLUTION_CONTEXT = void 0;
    exports.CONFLICT_RESOLUTION_CONTEXT = 'saveConflictResolutionContext';
    exports.CONFLICT_RESOLUTION_SCHEME = 'conflictResolution';
    const LEARN_MORE_DIRTY_WRITE_IGNORE_KEY = 'learnMoreDirtyWriteError';
    const conflictEditorHelp = (0, nls_1.localize)('userGuide', "Use the actions in the editor tool bar to either undo your changes or overwrite the content of the file with your changes.");
    // A handler for text file save error happening with conflict resolution actions
    let TextFileSaveErrorHandler = class TextFileSaveErrorHandler extends lifecycle_1.Disposable {
        constructor(notificationService, textFileService, contextKeyService, editorService, textModelService, instantiationService, storageService) {
            super();
            this.notificationService = notificationService;
            this.textFileService = textFileService;
            this.contextKeyService = contextKeyService;
            this.editorService = editorService;
            this.instantiationService = instantiationService;
            this.storageService = storageService;
            this.messages = new map_1.ResourceMap();
            this.conflictResolutionContext = new contextkey_1.RawContextKey(exports.CONFLICT_RESOLUTION_CONTEXT, false, true).bindTo(this.contextKeyService);
            this.activeConflictResolutionResource = undefined;
            const provider = this._register(instantiationService.createInstance(files_1.TextFileContentProvider));
            this._register(textModelService.registerTextModelContentProvider(exports.CONFLICT_RESOLUTION_SCHEME, provider));
            // Set as save error handler to service for text files
            this.textFileService.files.saveErrorHandler = this;
            this.registerListeners();
        }
        registerListeners() {
            this._register(this.textFileService.files.onDidSave(e => this.onFileSavedOrReverted(e.model.resource)));
            this._register(this.textFileService.files.onDidRevert(model => this.onFileSavedOrReverted(model.resource)));
            this._register(this.editorService.onDidActiveEditorChange(() => this.onActiveEditorChanged()));
        }
        onActiveEditorChanged() {
            let isActiveEditorSaveConflictResolution = false;
            let activeConflictResolutionResource;
            const activeInput = this.editorService.activeEditor;
            if (activeInput instanceof diffEditorInput_1.DiffEditorInput) {
                const resource = activeInput.original.resource;
                if (resource?.scheme === exports.CONFLICT_RESOLUTION_SCHEME) {
                    isActiveEditorSaveConflictResolution = true;
                    activeConflictResolutionResource = activeInput.modified.resource;
                }
            }
            this.conflictResolutionContext.set(isActiveEditorSaveConflictResolution);
            this.activeConflictResolutionResource = activeConflictResolutionResource;
        }
        onFileSavedOrReverted(resource) {
            const messageHandle = this.messages.get(resource);
            if (messageHandle) {
                messageHandle.close();
                this.messages.delete(resource);
            }
        }
        onSaveError(error, model) {
            const fileOperationError = error;
            const resource = model.resource;
            let message;
            const primaryActions = [];
            const secondaryActions = [];
            // Dirty write prevention
            if (fileOperationError.fileOperationResult === 3 /* FileOperationResult.FILE_MODIFIED_SINCE */) {
                // If the user tried to save from the opened conflict editor, show its message again
                if (this.activeConflictResolutionResource && (0, resources_1.isEqual)(this.activeConflictResolutionResource, model.resource)) {
                    if (this.storageService.getBoolean(LEARN_MORE_DIRTY_WRITE_IGNORE_KEY, -1 /* StorageScope.APPLICATION */)) {
                        return; // return if this message is ignored
                    }
                    message = conflictEditorHelp;
                    primaryActions.push(this.instantiationService.createInstance(ResolveConflictLearnMoreAction));
                    secondaryActions.push(this.instantiationService.createInstance(DoNotShowResolveConflictLearnMoreAction));
                }
                // Otherwise show the message that will lead the user into the save conflict editor.
                else {
                    message = (0, nls_1.localize)('staleSaveError', "Failed to save '{0}': The content of the file is newer. Please compare your version with the file contents or overwrite the content of the file with your changes.", (0, resources_1.basename)(resource));
                    primaryActions.push(this.instantiationService.createInstance(ResolveSaveConflictAction, model));
                    primaryActions.push(this.instantiationService.createInstance(SaveModelIgnoreModifiedSinceAction, model));
                    secondaryActions.push(this.instantiationService.createInstance(ConfigureSaveConflictAction));
                }
            }
            // Any other save error
            else {
                const isWriteLocked = fileOperationError.fileOperationResult === 5 /* FileOperationResult.FILE_WRITE_LOCKED */;
                const triedToUnlock = isWriteLocked && fileOperationError.options?.unlock;
                const isPermissionDenied = fileOperationError.fileOperationResult === 6 /* FileOperationResult.FILE_PERMISSION_DENIED */;
                const canSaveElevated = resource.scheme === network_1.Schemas.file; // currently only supported for local schemes (https://github.com/microsoft/vscode/issues/48659)
                // Save Elevated
                if (canSaveElevated && (isPermissionDenied || triedToUnlock)) {
                    primaryActions.push(this.instantiationService.createInstance(SaveModelElevatedAction, model, !!triedToUnlock));
                }
                // Unlock
                else if (isWriteLocked) {
                    primaryActions.push(this.instantiationService.createInstance(UnlockModelAction, model));
                }
                // Retry
                else {
                    primaryActions.push(this.instantiationService.createInstance(RetrySaveModelAction, model));
                }
                // Save As
                primaryActions.push(this.instantiationService.createInstance(SaveModelAsAction, model));
                // Discard
                primaryActions.push(this.instantiationService.createInstance(DiscardModelAction, model));
                // Message
                if (isWriteLocked) {
                    if (triedToUnlock && canSaveElevated) {
                        message = platform_1.isWindows ? (0, nls_1.localize)('readonlySaveErrorAdmin', "Failed to save '{0}': File is read-only. Select 'Overwrite as Admin' to retry as administrator.", (0, resources_1.basename)(resource)) : (0, nls_1.localize)('readonlySaveErrorSudo', "Failed to save '{0}': File is read-only. Select 'Overwrite as Sudo' to retry as superuser.", (0, resources_1.basename)(resource));
                    }
                    else {
                        message = (0, nls_1.localize)('readonlySaveError', "Failed to save '{0}': File is read-only. Select 'Overwrite' to attempt to make it writeable.", (0, resources_1.basename)(resource));
                    }
                }
                else if (canSaveElevated && isPermissionDenied) {
                    message = platform_1.isWindows ? (0, nls_1.localize)('permissionDeniedSaveError', "Failed to save '{0}': Insufficient permissions. Select 'Retry as Admin' to retry as administrator.", (0, resources_1.basename)(resource)) : (0, nls_1.localize)('permissionDeniedSaveErrorSudo', "Failed to save '{0}': Insufficient permissions. Select 'Retry as Sudo' to retry as superuser.", (0, resources_1.basename)(resource));
                }
                else {
                    message = (0, nls_1.localize)({ key: 'genericSaveError', comment: ['{0} is the resource that failed to save and {1} the error message'] }, "Failed to save '{0}': {1}", (0, resources_1.basename)(resource), (0, errorMessage_1.toErrorMessage)(error, false));
                }
            }
            // Show message and keep function to hide in case the file gets saved/reverted
            const actions = { primary: primaryActions, secondary: secondaryActions };
            const handle = this.notificationService.notify({
                id: `${(0, hash_1.hash)(model.resource.toString())}`,
                severity: notification_1.Severity.Error,
                message,
                actions
            });
            event_1.Event.once(handle.onDidClose)(() => { (0, lifecycle_1.dispose)(primaryActions); (0, lifecycle_1.dispose)(secondaryActions); });
            this.messages.set(model.resource, handle);
        }
        dispose() {
            super.dispose();
            this.messages.clear();
        }
    };
    exports.TextFileSaveErrorHandler = TextFileSaveErrorHandler;
    exports.TextFileSaveErrorHandler = TextFileSaveErrorHandler = __decorate([
        __param(0, notification_1.INotificationService),
        __param(1, textfiles_1.ITextFileService),
        __param(2, contextkey_1.IContextKeyService),
        __param(3, editorService_1.IEditorService),
        __param(4, resolverService_1.ITextModelService),
        __param(5, instantiation_1.IInstantiationService),
        __param(6, storage_1.IStorageService)
    ], TextFileSaveErrorHandler);
    const pendingResolveSaveConflictMessages = [];
    function clearPendingResolveSaveConflictMessages() {
        while (pendingResolveSaveConflictMessages.length > 0) {
            const item = pendingResolveSaveConflictMessages.pop();
            item?.close();
        }
    }
    let ResolveConflictLearnMoreAction = class ResolveConflictLearnMoreAction extends actions_1.Action {
        constructor(openerService) {
            super('workbench.files.action.resolveConflictLearnMore', (0, nls_1.localize)('learnMore', "Learn More"));
            this.openerService = openerService;
        }
        async run() {
            await this.openerService.open(uri_1.URI.parse('https://go.microsoft.com/fwlink/?linkid=868264'));
        }
    };
    ResolveConflictLearnMoreAction = __decorate([
        __param(0, opener_1.IOpenerService)
    ], ResolveConflictLearnMoreAction);
    let DoNotShowResolveConflictLearnMoreAction = class DoNotShowResolveConflictLearnMoreAction extends actions_1.Action {
        constructor(storageService) {
            super('workbench.files.action.resolveConflictLearnMoreDoNotShowAgain', (0, nls_1.localize)('dontShowAgain', "Don't Show Again"));
            this.storageService = storageService;
        }
        async run(notification) {
            // Remember this as application state
            this.storageService.store(LEARN_MORE_DIRTY_WRITE_IGNORE_KEY, true, -1 /* StorageScope.APPLICATION */, 0 /* StorageTarget.USER */);
            // Hide notification
            notification.dispose();
        }
    };
    DoNotShowResolveConflictLearnMoreAction = __decorate([
        __param(0, storage_1.IStorageService)
    ], DoNotShowResolveConflictLearnMoreAction);
    let ResolveSaveConflictAction = class ResolveSaveConflictAction extends actions_1.Action {
        constructor(model, editorService, notificationService, instantiationService, productService) {
            super('workbench.files.action.resolveConflict', (0, nls_1.localize)('compareChanges', "Compare"));
            this.model = model;
            this.editorService = editorService;
            this.notificationService = notificationService;
            this.instantiationService = instantiationService;
            this.productService = productService;
        }
        async run() {
            if (!this.model.isDisposed()) {
                const resource = this.model.resource;
                const name = (0, resources_1.basename)(resource);
                const editorLabel = (0, nls_1.localize)('saveConflictDiffLabel', "{0} (in file) ↔ {1} (in {2}) - Resolve save conflict", name, name, this.productService.nameLong);
                await files_1.TextFileContentProvider.open(resource, exports.CONFLICT_RESOLUTION_SCHEME, editorLabel, this.editorService, { pinned: true });
                // Show additional help how to resolve the save conflict
                const actions = { primary: [this.instantiationService.createInstance(ResolveConflictLearnMoreAction)] };
                const handle = this.notificationService.notify({
                    id: `${(0, hash_1.hash)(resource.toString())}`,
                    severity: notification_1.Severity.Info,
                    message: conflictEditorHelp,
                    actions,
                    neverShowAgain: { id: LEARN_MORE_DIRTY_WRITE_IGNORE_KEY, isSecondary: true }
                });
                event_1.Event.once(handle.onDidClose)(() => (0, lifecycle_1.dispose)(actions.primary));
                pendingResolveSaveConflictMessages.push(handle);
            }
        }
    };
    ResolveSaveConflictAction = __decorate([
        __param(1, editorService_1.IEditorService),
        __param(2, notification_1.INotificationService),
        __param(3, instantiation_1.IInstantiationService),
        __param(4, productService_1.IProductService)
    ], ResolveSaveConflictAction);
    class SaveModelElevatedAction extends actions_1.Action {
        constructor(model, triedToUnlock) {
            super('workbench.files.action.saveModelElevated', triedToUnlock ? platform_1.isWindows ? (0, nls_1.localize)('overwriteElevated', "Overwrite as Admin...") : (0, nls_1.localize)('overwriteElevatedSudo', "Overwrite as Sudo...") : platform_1.isWindows ? (0, nls_1.localize)('saveElevated', "Retry as Admin...") : (0, nls_1.localize)('saveElevatedSudo', "Retry as Sudo..."));
            this.model = model;
            this.triedToUnlock = triedToUnlock;
        }
        async run() {
            if (!this.model.isDisposed()) {
                await this.model.save({
                    writeElevated: true,
                    writeUnlock: this.triedToUnlock,
                    reason: 1 /* SaveReason.EXPLICIT */
                });
            }
        }
    }
    class RetrySaveModelAction extends actions_1.Action {
        constructor(model) {
            super('workbench.files.action.saveModel', (0, nls_1.localize)('retry', "Retry"));
            this.model = model;
        }
        async run() {
            if (!this.model.isDisposed()) {
                await this.model.save({ reason: 1 /* SaveReason.EXPLICIT */ });
            }
        }
    }
    class DiscardModelAction extends actions_1.Action {
        constructor(model) {
            super('workbench.files.action.discardModel', (0, nls_1.localize)('discard', "Discard"));
            this.model = model;
        }
        async run() {
            if (!this.model.isDisposed()) {
                await this.model.revert();
            }
        }
    }
    let SaveModelAsAction = class SaveModelAsAction extends actions_1.Action {
        constructor(model, editorService) {
            super('workbench.files.action.saveModelAs', fileConstants_1.SAVE_FILE_AS_LABEL);
            this.model = model;
            this.editorService = editorService;
        }
        async run() {
            if (!this.model.isDisposed()) {
                const editor = this.findEditor();
                if (editor) {
                    await this.editorService.save(editor, { saveAs: true, reason: 1 /* SaveReason.EXPLICIT */ });
                }
            }
        }
        findEditor() {
            let preferredMatchingEditor;
            const editors = this.editorService.findEditors(this.model.resource, { supportSideBySide: editor_1.SideBySideEditor.PRIMARY });
            for (const identifier of editors) {
                if (identifier.editor instanceof fileEditorInput_1.FileEditorInput) {
                    // We prefer a `FileEditorInput` for "Save As", but it is possible
                    // that a custom editor is leveraging the text file model and as
                    // such we need to fallback to any other editor having the resource
                    // opened for running the save.
                    preferredMatchingEditor = identifier;
                    break;
                }
                else if (!preferredMatchingEditor) {
                    preferredMatchingEditor = identifier;
                }
            }
            return preferredMatchingEditor;
        }
    };
    SaveModelAsAction = __decorate([
        __param(1, editorService_1.IEditorService)
    ], SaveModelAsAction);
    class UnlockModelAction extends actions_1.Action {
        constructor(model) {
            super('workbench.files.action.unlock', (0, nls_1.localize)('overwrite', "Overwrite"));
            this.model = model;
        }
        async run() {
            if (!this.model.isDisposed()) {
                await this.model.save({ writeUnlock: true, reason: 1 /* SaveReason.EXPLICIT */ });
            }
        }
    }
    class SaveModelIgnoreModifiedSinceAction extends actions_1.Action {
        constructor(model) {
            super('workbench.files.action.saveIgnoreModifiedSince', (0, nls_1.localize)('overwrite', "Overwrite"));
            this.model = model;
        }
        async run() {
            if (!this.model.isDisposed()) {
                await this.model.save({ ignoreModifiedSince: true, reason: 1 /* SaveReason.EXPLICIT */ });
            }
        }
    }
    let ConfigureSaveConflictAction = class ConfigureSaveConflictAction extends actions_1.Action {
        constructor(preferencesService) {
            super('workbench.files.action.configureSaveConflict', (0, nls_1.localize)('configure', "Configure"));
            this.preferencesService = preferencesService;
        }
        async run() {
            this.preferencesService.openSettings({ query: 'files.saveConflictResolution' });
        }
    };
    ConfigureSaveConflictAction = __decorate([
        __param(0, preferences_1.IPreferencesService)
    ], ConfigureSaveConflictAction);
    const acceptLocalChangesCommand = (accessor, resource) => {
        return acceptOrRevertLocalChangesCommand(accessor, resource, true);
    };
    exports.acceptLocalChangesCommand = acceptLocalChangesCommand;
    const revertLocalChangesCommand = (accessor, resource) => {
        return acceptOrRevertLocalChangesCommand(accessor, resource, false);
    };
    exports.revertLocalChangesCommand = revertLocalChangesCommand;
    async function acceptOrRevertLocalChangesCommand(accessor, resource, accept) {
        const editorService = accessor.get(editorService_1.IEditorService);
        const editorPane = editorService.activeEditorPane;
        if (!editorPane) {
            return;
        }
        const editor = editorPane.input;
        const group = editorPane.group;
        // Hide any previously shown message about how to use these actions
        clearPendingResolveSaveConflictMessages();
        // Accept or revert
        if (accept) {
            const options = { ignoreModifiedSince: true, reason: 1 /* SaveReason.EXPLICIT */ };
            await editorService.save({ editor, groupId: group.id }, options);
        }
        else {
            await editorService.revert({ editor, groupId: group.id });
        }
        // Reopen original editor
        await editorService.openEditor({ resource }, group);
        // Clean up
        return group.closeEditor(editor);
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGV4dEZpbGVTYXZlRXJyb3JIYW5kbGVyLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvZmlsZXMvYnJvd3Nlci9lZGl0b3JzL3RleHRGaWxlU2F2ZUVycm9ySGFuZGxlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUErQm5GLFFBQUEsMkJBQTJCLEdBQUcsK0JBQStCLENBQUM7SUFDOUQsUUFBQSwwQkFBMEIsR0FBRyxvQkFBb0IsQ0FBQztJQUUvRCxNQUFNLGlDQUFpQyxHQUFHLDBCQUEwQixDQUFDO0lBRXJFLE1BQU0sa0JBQWtCLEdBQUcsSUFBQSxjQUFRLEVBQUMsV0FBVyxFQUFFLDRIQUE0SCxDQUFDLENBQUM7SUFFL0ssZ0ZBQWdGO0lBQ3pFLElBQU0sd0JBQXdCLEdBQTlCLE1BQU0sd0JBQXlCLFNBQVEsc0JBQVU7UUFNdkQsWUFDdUIsbUJBQTBELEVBQzlELGVBQWtELEVBQ2hELGlCQUE2QyxFQUNqRCxhQUE4QyxFQUMzQyxnQkFBbUMsRUFDL0Isb0JBQTRELEVBQ2xFLGNBQWdEO1lBRWpFLEtBQUssRUFBRSxDQUFDO1lBUitCLHdCQUFtQixHQUFuQixtQkFBbUIsQ0FBc0I7WUFDN0Msb0JBQWUsR0FBZixlQUFlLENBQWtCO1lBQ3hDLHNCQUFpQixHQUFqQixpQkFBaUIsQ0FBb0I7WUFDaEMsa0JBQWEsR0FBYixhQUFhLENBQWdCO1lBRXRCLHlCQUFvQixHQUFwQixvQkFBb0IsQ0FBdUI7WUFDakQsbUJBQWMsR0FBZCxjQUFjLENBQWlCO1lBWGpELGFBQVEsR0FBRyxJQUFJLGlCQUFXLEVBQXVCLENBQUM7WUFDbEQsOEJBQXlCLEdBQUcsSUFBSSwwQkFBYSxDQUFVLG1DQUEyQixFQUFFLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLENB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