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
define(["require", "exports", "vs/nls!vs/workbench/contrib/files/browser/editors/textFileSaveErrorHandler", "vs/base/common/errorMessage", "vs/base/common/resources", "vs/base/common/actions", "vs/base/common/uri", "vs/workbench/services/textfile/common/textfiles", "vs/platform/instantiation/common/instantiation", "vs/base/common/lifecycle", "vs/editor/common/services/resolverService", "vs/base/common/map", "vs/workbench/common/editor/diffEditorInput", "vs/platform/contextkey/common/contextkey", "vs/workbench/contrib/files/common/files", "vs/workbench/contrib/files/browser/editors/fileEditorInput", "vs/workbench/contrib/files/browser/fileConstants", "vs/platform/notification/common/notification", "vs/platform/opener/common/opener", "vs/platform/storage/common/storage", "vs/platform/product/common/productService", "vs/base/common/event", "vs/workbench/services/editor/common/editorService", "vs/base/common/platform", "vs/base/common/network", "vs/workbench/services/preferences/common/preferences", "vs/workbench/common/editor", "vs/base/common/hash"], function (require, exports, nls_1, errorMessage_1, resources_1, actions_1, uri_1, textfiles_1, instantiation_1, lifecycle_1, resolverService_1, map_1, diffEditorInput_1, contextkey_1, files_1, fileEditorInput_1, fileConstants_1, notification_1, opener_1, storage_1, productService_1, event_1, editorService_1, platform_1, network_1, preferences_1, editor_1, hash_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$ZLb = exports.$YLb = exports.$XLb = exports.$WLb = exports.$VLb = void 0;
    exports.$VLb = 'saveConflictResolutionContext';
    exports.$WLb = 'conflictResolution';
    const LEARN_MORE_DIRTY_WRITE_IGNORE_KEY = 'learnMoreDirtyWriteError';
    const conflictEditorHelp = (0, nls_1.localize)(0, null);
    // A handler for text file save error happening with conflict resolution actions
    let $XLb = class $XLb extends lifecycle_1.$kc {
        constructor(f, g, h, j, textModelService, m, n) {
            super();
            this.f = f;
            this.g = g;
            this.h = h;
            this.j = j;
            this.m = m;
            this.n = n;
            this.a = new map_1.$zi();
            this.b = new contextkey_1.$2i(exports.$VLb, false, true).bindTo(this.h);
            this.c = undefined;
            const provider = this.B(m.createInstance(files_1.$$db));
            this.B(textModelService.registerTextModelContentProvider(exports.$WLb, provider));
            // Set as save error handler to service for text files
            this.g.files.saveErrorHandler = this;
            this.r();
        }
        r() {
            this.B(this.g.files.onDidSave(e => this.t(e.model.resource)));
            this.B(this.g.files.onDidRevert(model => this.t(model.resource)));
            this.B(this.j.onDidActiveEditorChange(() => this.s()));
        }
        s() {
            let isActiveEditorSaveConflictResolution = false;
            let activeConflictResolutionResource;
            const activeInput = this.j.activeEditor;
            if (activeInput instanceof diffEditorInput_1.$3eb) {
                const resource = activeInput.original.resource;
                if (resource?.scheme === exports.$WLb) {
                    isActiveEditorSaveConflictResolution = true;
                    activeConflictResolutionResource = activeInput.modified.resource;
                }
            }
            this.b.set(isActiveEditorSaveConflictResolution);
            this.c = activeConflictResolutionResource;
        }
        t(resource) {
            const messageHandle = this.a.get(resource);
            if (messageHandle) {
                messageHandle.close();
                this.a.delete(resource);
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
                if (this.c && (0, resources_1.$bg)(this.c, model.resource)) {
                    if (this.n.getBoolean(LEARN_MORE_DIRTY_WRITE_IGNORE_KEY, -1 /* StorageScope.APPLICATION */)) {
                        return; // return if this message is ignored
                    }
                    message = conflictEditorHelp;
                    primaryActions.push(this.m.createInstance(ResolveConflictLearnMoreAction));
                    secondaryActions.push(this.m.createInstance(DoNotShowResolveConflictLearnMoreAction));
                }
                // Otherwise show the message that will lead the user into the save conflict editor.
                else {
                    message = (0, nls_1.localize)(1, null, (0, resources_1.$fg)(resource));
                    primaryActions.push(this.m.createInstance(ResolveSaveConflictAction, model));
                    primaryActions.push(this.m.createInstance(SaveModelIgnoreModifiedSinceAction, model));
                    secondaryActions.push(this.m.createInstance(ConfigureSaveConflictAction));
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
                    primaryActions.push(this.m.createInstance(SaveModelElevatedAction, model, !!triedToUnlock));
                }
                // Unlock
                else if (isWriteLocked) {
                    primaryActions.push(this.m.createInstance(UnlockModelAction, model));
                }
                // Retry
                else {
                    primaryActions.push(this.m.createInstance(RetrySaveModelAction, model));
                }
                // Save As
                primaryActions.push(this.m.createInstance(SaveModelAsAction, model));
                // Discard
                primaryActions.push(this.m.createInstance(DiscardModelAction, model));
                // Message
                if (isWriteLocked) {
                    if (triedToUnlock && canSaveElevated) {
                        message = platform_1.$i ? (0, nls_1.localize)(2, null, (0, resources_1.$fg)(resource)) : (0, nls_1.localize)(3, null, (0, resources_1.$fg)(resource));
                    }
                    else {
                        message = (0, nls_1.localize)(4, null, (0, resources_1.$fg)(resource));
                    }
                }
                else if (canSaveElevated && isPermissionDenied) {
                    message = platform_1.$i ? (0, nls_1.localize)(5, null, (0, resources_1.$fg)(resource)) : (0, nls_1.localize)(6, null, (0, resources_1.$fg)(resource));
                }
                else {
                    message = (0, nls_1.localize)(7, null, (0, resources_1.$fg)(resource), (0, errorMessage_1.$mi)(error, false));
                }
            }
            // Show message and keep function to hide in case the file gets saved/reverted
            const actions = { primary: primaryActions, secondary: secondaryActions };
            const handle = this.f.notify({
                id: `${(0, hash_1.$pi)(model.resource.toString())}`,
                severity: notification_1.Severity.Error,
                message,
                actions
            });
            event_1.Event.once(handle.onDidClose)(() => { (0, lifecycle_1.$fc)(primaryActions); (0, lifecycle_1.$fc)(secondaryActions); });
            this.a.set(model.resource, handle);
        }
        dispose() {
            super.dispose();
            this.a.clear();
        }
    };
    exports.$XLb = $XLb;
    exports.$XLb = $XLb = __decorate([
        __param(0, notification_1.$Yu),
        __param(1, textfiles_1.$JD),
        __param(2, contextkey_1.$3i),
        __param(3, editorService_1.$9C),
        __param(4, resolverService_1.$uA),
        __param(5, instantiation_1.$Ah),
        __param(6, storage_1.$Vo)
    ], $XLb);
    const pendingResolveSaveConflictMessages = [];
    function clearPendingResolveSaveConflictMessages() {
        while (pendingResolveSaveConflictMessages.length > 0) {
            const item = pendingResolveSaveConflictMessages.pop();
            item?.close();
        }
    }
    let ResolveConflictLearnMoreAction = class ResolveConflictLearnMoreAction extends actions_1.$gi {
        constructor(a) {
            super('workbench.files.action.resolveConflictLearnMore', (0, nls_1.localize)(8, null));
            this.a = a;
        }
        async run() {
            await this.a.open(uri_1.URI.parse('https://go.microsoft.com/fwlink/?linkid=868264'));
        }
    };
    ResolveConflictLearnMoreAction = __decorate([
        __param(0, opener_1.$NT)
    ], ResolveConflictLearnMoreAction);
    let DoNotShowResolveConflictLearnMoreAction = class DoNotShowResolveConflictLearnMoreAction extends actions_1.$gi {
        constructor(a) {
            super('workbench.files.action.resolveConflictLearnMoreDoNotShowAgain', (0, nls_1.localize)(9, null));
            this.a = a;
        }
        async run(notification) {
            // Remember this as application state
            this.a.store(LEARN_MORE_DIRTY_WRITE_IGNORE_KEY, true, -1 /* StorageScope.APPLICATION */, 0 /* StorageTarget.USER */);
            // Hide notification
            notification.dispose();
        }
    };
    DoNotShowResolveConflictLearnMoreAction = __decorate([
        __param(0, storage_1.$Vo)
    ], DoNotShowResolveConflictLearnMoreAction);
    let ResolveSaveConflictAction = class ResolveSaveConflictAction extends actions_1.$gi {
        constructor(a, b, c, f, g) {
            super('workbench.files.action.resolveConflict', (0, nls_1.localize)(10, null));
            this.a = a;
            this.b = b;
            this.c = c;
            this.f = f;
            this.g = g;
        }
        async run() {
            if (!this.a.isDisposed()) {
                const resource = this.a.resource;
                const name = (0, resources_1.$fg)(resource);
                const editorLabel = (0, nls_1.localize)(11, null, name, name, this.g.nameLong);
                await files_1.$$db.open(resource, exports.$WLb, editorLabel, this.b, { pinned: true });
                // Show additional help how to resolve the save conflict
                const actions = { primary: [this.f.createInstance(ResolveConflictLearnMoreAction)] };
                const handle = this.c.notify({
                    id: `${(0, hash_1.$pi)(resource.toString())}`,
                    severity: notification_1.Severity.Info,
                    message: conflictEditorHelp,
                    actions,
                    neverShowAgain: { id: LEARN_MORE_DIRTY_WRITE_IGNORE_KEY, isSecondary: true }
                });
                event_1.Event.once(handle.onDidClose)(() => (0, lifecycle_1.$fc)(actions.primary));
                pendingResolveSaveConflictMessages.push(handle);
            }
        }
    };
    ResolveSaveConflictAction = __decorate([
        __param(1, editorService_1.$9C),
        __param(2, notification_1.$Yu),
        __param(3, instantiation_1.$Ah),
        __param(4, productService_1.$kj)
    ], ResolveSaveConflictAction);
    class SaveModelElevatedAction extends actions_1.$gi {
        constructor(a, b) {
            super('workbench.files.action.saveModelElevated', b ? platform_1.$i ? (0, nls_1.localize)(12, null) : (0, nls_1.localize)(13, null) : platform_1.$i ? (0, nls_1.localize)(14, null) : (0, nls_1.localize)(15, null));
            this.a = a;
            this.b = b;
        }
        async run() {
            if (!this.a.isDisposed()) {
                await this.a.save({
                    writeElevated: true,
                    writeUnlock: this.b,
                    reason: 1 /* SaveReason.EXPLICIT */
                });
            }
        }
    }
    class RetrySaveModelAction extends actions_1.$gi {
        constructor(a) {
            super('workbench.files.action.saveModel', (0, nls_1.localize)(16, null));
            this.a = a;
        }
        async run() {
            if (!this.a.isDisposed()) {
                await this.a.save({ reason: 1 /* SaveReason.EXPLICIT */ });
            }
        }
    }
    class DiscardModelAction extends actions_1.$gi {
        constructor(a) {
            super('workbench.files.action.discardModel', (0, nls_1.localize)(17, null));
            this.a = a;
        }
        async run() {
            if (!this.a.isDisposed()) {
                await this.a.revert();
            }
        }
    }
    let SaveModelAsAction = class SaveModelAsAction extends actions_1.$gi {
        constructor(a, b) {
            super('workbench.files.action.saveModelAs', fileConstants_1.$8Gb);
            this.a = a;
            this.b = b;
        }
        async run() {
            if (!this.a.isDisposed()) {
                const editor = this.c();
                if (editor) {
                    await this.b.save(editor, { saveAs: true, reason: 1 /* SaveReason.EXPLICIT */ });
                }
            }
        }
        c() {
            let preferredMatchingEditor;
            const editors = this.b.findEditors(this.a.resource, { supportSideBySide: editor_1.SideBySideEditor.PRIMARY });
            for (const identifier of editors) {
                if (identifier.editor instanceof fileEditorInput_1.$ULb) {
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
        __param(1, editorService_1.$9C)
    ], SaveModelAsAction);
    class UnlockModelAction extends actions_1.$gi {
        constructor(a) {
            super('workbench.files.action.unlock', (0, nls_1.localize)(18, null));
            this.a = a;
        }
        async run() {
            if (!this.a.isDisposed()) {
                await this.a.save({ writeUnlock: true, reason: 1 /* SaveReason.EXPLICIT */ });
            }
        }
    }
    class SaveModelIgnoreModifiedSinceAction extends actions_1.$gi {
        constructor(a) {
            super('workbench.files.action.saveIgnoreModifiedSince', (0, nls_1.localize)(19, null));
            this.a = a;
        }
        async run() {
            if (!this.a.isDisposed()) {
                await this.a.save({ ignoreModifiedSince: true, reason: 1 /* SaveReason.EXPLICIT */ });
            }
        }
    }
    let ConfigureSaveConflictAction = class ConfigureSaveConflictAction extends actions_1.$gi {
        constructor(a) {
            super('workbench.files.action.configureSaveConflict', (0, nls_1.localize)(20, null));
            this.a = a;
        }
        async run() {
            this.a.openSettings({ query: 'files.saveConflictResolution' });
        }
    };
    ConfigureSaveConflictAction = __decorate([
        __param(0, preferences_1.$BE)
    ], ConfigureSaveConflictAction);
    const $YLb = (accessor, resource) => {
        return acceptOrRevertLocalChangesCommand(accessor, resource, true);
    };
    exports.$YLb = $YLb;
    const $ZLb = (accessor, resource) => {
        return acceptOrRevertLocalChangesCommand(accessor, resource, false);
    };
    exports.$ZLb = $ZLb;
    async function acceptOrRevertLocalChangesCommand(accessor, resource, accept) {
        const editorService = accessor.get(editorService_1.$9C);
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
//# sourceMappingURL=textFileSaveErrorHandler.js.map