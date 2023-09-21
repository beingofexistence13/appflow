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
define(["require", "exports", "vs/base/common/lifecycle", "vs/platform/files/common/files", "vs/workbench/services/extensions/common/extHostCustomers", "../common/extHost.protocol", "vs/nls", "vs/workbench/services/workingCopy/common/workingCopyFileService", "vs/editor/browser/services/bulkEditService", "vs/platform/progress/common/progress", "vs/base/common/async", "vs/base/common/cancellation", "vs/platform/dialogs/common/dialogs", "vs/base/common/severity", "vs/platform/storage/common/storage", "vs/platform/actions/common/actions", "vs/platform/log/common/log", "vs/platform/environment/common/environment", "vs/platform/uriIdentity/common/uriIdentity", "vs/workbench/api/browser/mainThreadBulkEdits"], function (require, exports, lifecycle_1, files_1, extHostCustomers_1, extHost_protocol_1, nls_1, workingCopyFileService_1, bulkEditService_1, progress_1, async_1, cancellation_1, dialogs_1, severity_1, storage_1, actions_1, log_1, environment_1, uriIdentity_1, mainThreadBulkEdits_1) {
    "use strict";
    var MainThreadFileSystemEventService_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MainThreadFileSystemEventService = void 0;
    let MainThreadFileSystemEventService = class MainThreadFileSystemEventService {
        static { MainThreadFileSystemEventService_1 = this; }
        static { this.MementoKeyAdditionalEdits = `file.particpants.additionalEdits`; }
        constructor(extHostContext, fileService, workingCopyFileService, bulkEditService, progressService, dialogService, storageService, logService, envService, uriIdentService) {
            this._listener = new lifecycle_1.DisposableStore();
            const proxy = extHostContext.getProxy(extHost_protocol_1.ExtHostContext.ExtHostFileSystemEventService);
            this._listener.add(fileService.onDidFilesChange(event => {
                proxy.$onFileEvent({
                    created: event.rawAdded,
                    changed: event.rawUpdated,
                    deleted: event.rawDeleted
                });
            }));
            const fileOperationParticipant = new class {
                async participate(files, operation, undoInfo, timeout, token) {
                    if (undoInfo?.isUndoing) {
                        return;
                    }
                    const cts = new cancellation_1.CancellationTokenSource(token);
                    const timer = setTimeout(() => cts.cancel(), timeout);
                    const data = await progressService.withProgress({
                        location: 15 /* ProgressLocation.Notification */,
                        title: this._progressLabel(operation),
                        cancellable: true,
                        delay: Math.min(timeout / 2, 3000)
                    }, () => {
                        // race extension host event delivery against timeout AND user-cancel
                        const onWillEvent = proxy.$onWillRunFileOperation(operation, files, timeout, cts.token);
                        return (0, async_1.raceCancellation)(onWillEvent, cts.token);
                    }, () => {
                        // user-cancel
                        cts.cancel();
                    }).finally(() => {
                        cts.dispose();
                        clearTimeout(timer);
                    });
                    if (!data || data.edit.edits.length === 0) {
                        // cancelled, no reply, or no edits
                        return;
                    }
                    const needsConfirmation = data.edit.edits.some(edit => edit.metadata?.needsConfirmation);
                    let showPreview = storageService.getBoolean(MainThreadFileSystemEventService_1.MementoKeyAdditionalEdits, 0 /* StorageScope.PROFILE */);
                    if (envService.extensionTestsLocationURI) {
                        // don't show dialog in tests
                        showPreview = false;
                    }
                    if (showPreview === undefined) {
                        // show a user facing message
                        let message;
                        if (data.extensionNames.length === 1) {
                            if (operation === 0 /* FileOperation.CREATE */) {
                                message = (0, nls_1.localize)('ask.1.create', "Extension '{0}' wants to make refactoring changes with this file creation", data.extensionNames[0]);
                            }
                            else if (operation === 3 /* FileOperation.COPY */) {
                                message = (0, nls_1.localize)('ask.1.copy', "Extension '{0}' wants to make refactoring changes with this file copy", data.extensionNames[0]);
                            }
                            else if (operation === 2 /* FileOperation.MOVE */) {
                                message = (0, nls_1.localize)('ask.1.move', "Extension '{0}' wants to make refactoring changes with this file move", data.extensionNames[0]);
                            }
                            else /* if (operation === FileOperation.DELETE) */ {
                                message = (0, nls_1.localize)('ask.1.delete', "Extension '{0}' wants to make refactoring changes with this file deletion", data.extensionNames[0]);
                            }
                        }
                        else {
                            if (operation === 0 /* FileOperation.CREATE */) {
                                message = (0, nls_1.localize)({ key: 'ask.N.create', comment: ['{0} is a number, e.g "3 extensions want..."'] }, "{0} extensions want to make refactoring changes with this file creation", data.extensionNames.length);
                            }
                            else if (operation === 3 /* FileOperation.COPY */) {
                                message = (0, nls_1.localize)({ key: 'ask.N.copy', comment: ['{0} is a number, e.g "3 extensions want..."'] }, "{0} extensions want to make refactoring changes with this file copy", data.extensionNames.length);
                            }
                            else if (operation === 2 /* FileOperation.MOVE */) {
                                message = (0, nls_1.localize)({ key: 'ask.N.move', comment: ['{0} is a number, e.g "3 extensions want..."'] }, "{0} extensions want to make refactoring changes with this file move", data.extensionNames.length);
                            }
                            else /* if (operation === FileOperation.DELETE) */ {
                                message = (0, nls_1.localize)({ key: 'ask.N.delete', comment: ['{0} is a number, e.g "3 extensions want..."'] }, "{0} extensions want to make refactoring changes with this file deletion", data.extensionNames.length);
                            }
                        }
                        if (needsConfirmation) {
                            // edit which needs confirmation -> always show dialog
                            const { confirmed } = await dialogService.confirm({
                                type: severity_1.default.Info,
                                message,
                                primaryButton: (0, nls_1.localize)('preview', "Show &&Preview"),
                                cancelButton: (0, nls_1.localize)('cancel', "Skip Changes")
                            });
                            showPreview = true;
                            if (!confirmed) {
                                // no changes wanted
                                return;
                            }
                        }
                        else {
                            // choice
                            let Choice;
                            (function (Choice) {
                                Choice[Choice["OK"] = 0] = "OK";
                                Choice[Choice["Preview"] = 1] = "Preview";
                                Choice[Choice["Cancel"] = 2] = "Cancel";
                            })(Choice || (Choice = {}));
                            const { result, checkboxChecked } = await dialogService.prompt({
                                type: severity_1.default.Info,
                                message,
                                buttons: [
                                    {
                                        label: (0, nls_1.localize)({ key: 'ok', comment: ['&& denotes a mnemonic'] }, "&&OK"),
                                        run: () => Choice.OK
                                    },
                                    {
                                        label: (0, nls_1.localize)({ key: 'preview', comment: ['&& denotes a mnemonic'] }, "Show &&Preview"),
                                        run: () => Choice.Preview
                                    }
                                ],
                                cancelButton: {
                                    label: (0, nls_1.localize)('cancel', "Skip Changes"),
                                    run: () => Choice.Cancel
                                },
                                checkbox: { label: (0, nls_1.localize)('again', "Don't ask again") }
                            });
                            if (result === Choice.Cancel) {
                                // no changes wanted, don't persist cancel option
                                return;
                            }
                            showPreview = result === Choice.Preview;
                            if (checkboxChecked) {
                                storageService.store(MainThreadFileSystemEventService_1.MementoKeyAdditionalEdits, showPreview, 0 /* StorageScope.PROFILE */, 0 /* StorageTarget.USER */);
                            }
                        }
                    }
                    logService.info('[onWill-handler] applying additional workspace edit from extensions', data.extensionNames);
                    await bulkEditService.apply((0, mainThreadBulkEdits_1.reviveWorkspaceEditDto)(data.edit, uriIdentService), { undoRedoGroupId: undoInfo?.undoRedoGroupId, showPreview });
                }
                _progressLabel(operation) {
                    switch (operation) {
                        case 0 /* FileOperation.CREATE */:
                            return (0, nls_1.localize)('msg-create', "Running 'File Create' participants...");
                        case 2 /* FileOperation.MOVE */:
                            return (0, nls_1.localize)('msg-rename', "Running 'File Rename' participants...");
                        case 3 /* FileOperation.COPY */:
                            return (0, nls_1.localize)('msg-copy', "Running 'File Copy' participants...");
                        case 1 /* FileOperation.DELETE */:
                            return (0, nls_1.localize)('msg-delete', "Running 'File Delete' participants...");
                        case 4 /* FileOperation.WRITE */:
                            return (0, nls_1.localize)('msg-write', "Running 'File Write' participants...");
                    }
                }
            };
            // BEFORE file operation
            this._listener.add(workingCopyFileService.addFileOperationParticipant(fileOperationParticipant));
            // AFTER file operation
            this._listener.add(workingCopyFileService.onDidRunWorkingCopyFileOperation(e => proxy.$onDidRunFileOperation(e.operation, e.files)));
        }
        dispose() {
            this._listener.dispose();
        }
    };
    exports.MainThreadFileSystemEventService = MainThreadFileSystemEventService;
    exports.MainThreadFileSystemEventService = MainThreadFileSystemEventService = MainThreadFileSystemEventService_1 = __decorate([
        extHostCustomers_1.extHostCustomer,
        __param(1, files_1.IFileService),
        __param(2, workingCopyFileService_1.IWorkingCopyFileService),
        __param(3, bulkEditService_1.IBulkEditService),
        __param(4, progress_1.IProgressService),
        __param(5, dialogs_1.IDialogService),
        __param(6, storage_1.IStorageService),
        __param(7, log_1.ILogService),
        __param(8, environment_1.IEnvironmentService),
        __param(9, uriIdentity_1.IUriIdentityService)
    ], MainThreadFileSystemEventService);
    (0, actions_1.registerAction2)(class ResetMemento extends actions_1.Action2 {
        constructor() {
            super({
                id: 'files.participants.resetChoice',
                title: {
                    value: (0, nls_1.localize)('label', "Reset choice for 'File operation needs preview'"),
                    original: `Reset choice for 'File operation needs preview'`
                },
                f1: true
            });
        }
        run(accessor) {
            accessor.get(storage_1.IStorageService).remove(MainThreadFileSystemEventService.MementoKeyAdditionalEdits, 0 /* StorageScope.PROFILE */);
        }
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpblRocmVhZEZpbGVTeXN0ZW1FdmVudFNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvYXBpL2Jyb3dzZXIvbWFpblRocmVhZEZpbGVTeXN0ZW1FdmVudFNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7OztJQXVCekYsSUFBTSxnQ0FBZ0MsR0FBdEMsTUFBTSxnQ0FBZ0M7O2lCQUU1Qiw4QkFBeUIsR0FBRyxrQ0FBa0MsQUFBckMsQ0FBc0M7UUFJL0UsWUFDQyxjQUErQixFQUNqQixXQUF5QixFQUNkLHNCQUErQyxFQUN0RCxlQUFpQyxFQUNqQyxlQUFpQyxFQUNuQyxhQUE2QixFQUM1QixjQUErQixFQUNuQyxVQUF1QixFQUNmLFVBQStCLEVBQy9CLGVBQW9DO1lBWnpDLGNBQVMsR0FBRyxJQUFJLDJCQUFlLEVBQUUsQ0FBQztZQWVsRCxNQUFNLEtBQUssR0FBRyxjQUFjLENBQUMsUUFBUSxDQUFDLGlDQUFjLENBQUMsNkJBQTZCLENBQUMsQ0FBQztZQUVwRixJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsZ0JBQWdCLENBQUMsS0FBSyxDQUFDLEVBQUU7Z0JBQ3ZELEtBQUssQ0FBQyxZQUFZLENBQUM7b0JBQ2xCLE9BQU8sRUFBRSxLQUFLLENBQUMsUUFBUTtvQkFDdkIsT0FBTyxFQUFFLEtBQUssQ0FBQyxVQUFVO29CQUN6QixPQUFPLEVBQUUsS0FBSyxDQUFDLFVBQVU7aUJBQ3pCLENBQUMsQ0FBQztZQUNKLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFFSixNQUFNLHdCQUF3QixHQUFHLElBQUk7Z0JBQ3BDLEtBQUssQ0FBQyxXQUFXLENBQUMsS0FBeUIsRUFBRSxTQUF3QixFQUFFLFFBQWdELEVBQUUsT0FBZSxFQUFFLEtBQXdCO29CQUNqSyxJQUFJLFFBQVEsRUFBRSxT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