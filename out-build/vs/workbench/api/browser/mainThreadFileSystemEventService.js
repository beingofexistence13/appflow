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
define(["require", "exports", "vs/base/common/lifecycle", "vs/platform/files/common/files", "vs/workbench/services/extensions/common/extHostCustomers", "../common/extHost.protocol", "vs/nls!vs/workbench/api/browser/mainThreadFileSystemEventService", "vs/workbench/services/workingCopy/common/workingCopyFileService", "vs/editor/browser/services/bulkEditService", "vs/platform/progress/common/progress", "vs/base/common/async", "vs/base/common/cancellation", "vs/platform/dialogs/common/dialogs", "vs/base/common/severity", "vs/platform/storage/common/storage", "vs/platform/actions/common/actions", "vs/platform/log/common/log", "vs/platform/environment/common/environment", "vs/platform/uriIdentity/common/uriIdentity", "vs/workbench/api/browser/mainThreadBulkEdits"], function (require, exports, lifecycle_1, files_1, extHostCustomers_1, extHost_protocol_1, nls_1, workingCopyFileService_1, bulkEditService_1, progress_1, async_1, cancellation_1, dialogs_1, severity_1, storage_1, actions_1, log_1, environment_1, uriIdentity_1, mainThreadBulkEdits_1) {
    "use strict";
    var $qkb_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$qkb = void 0;
    let $qkb = class $qkb {
        static { $qkb_1 = this; }
        static { this.MementoKeyAdditionalEdits = `file.particpants.additionalEdits`; }
        constructor(extHostContext, fileService, workingCopyFileService, bulkEditService, progressService, dialogService, storageService, logService, envService, uriIdentService) {
            this.a = new lifecycle_1.$jc();
            const proxy = extHostContext.getProxy(extHost_protocol_1.$2J.ExtHostFileSystemEventService);
            this.a.add(fileService.onDidFilesChange(event => {
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
                    const cts = new cancellation_1.$pd(token);
                    const timer = setTimeout(() => cts.cancel(), timeout);
                    const data = await progressService.withProgress({
                        location: 15 /* ProgressLocation.Notification */,
                        title: this.a(operation),
                        cancellable: true,
                        delay: Math.min(timeout / 2, 3000)
                    }, () => {
                        // race extension host event delivery against timeout AND user-cancel
                        const onWillEvent = proxy.$onWillRunFileOperation(operation, files, timeout, cts.token);
                        return (0, async_1.$vg)(onWillEvent, cts.token);
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
                    let showPreview = storageService.getBoolean($qkb_1.MementoKeyAdditionalEdits, 0 /* StorageScope.PROFILE */);
                    if (envService.extensionTestsLocationURI) {
                        // don't show dialog in tests
                        showPreview = false;
                    }
                    if (showPreview === undefined) {
                        // show a user facing message
                        let message;
                        if (data.extensionNames.length === 1) {
                            if (operation === 0 /* FileOperation.CREATE */) {
                                message = (0, nls_1.localize)(0, null, data.extensionNames[0]);
                            }
                            else if (operation === 3 /* FileOperation.COPY */) {
                                message = (0, nls_1.localize)(1, null, data.extensionNames[0]);
                            }
                            else if (operation === 2 /* FileOperation.MOVE */) {
                                message = (0, nls_1.localize)(2, null, data.extensionNames[0]);
                            }
                            else /* if (operation === FileOperation.DELETE) */ {
                                message = (0, nls_1.localize)(3, null, data.extensionNames[0]);
                            }
                        }
                        else {
                            if (operation === 0 /* FileOperation.CREATE */) {
                                message = (0, nls_1.localize)(4, null, data.extensionNames.length);
                            }
                            else if (operation === 3 /* FileOperation.COPY */) {
                                message = (0, nls_1.localize)(5, null, data.extensionNames.length);
                            }
                            else if (operation === 2 /* FileOperation.MOVE */) {
                                message = (0, nls_1.localize)(6, null, data.extensionNames.length);
                            }
                            else /* if (operation === FileOperation.DELETE) */ {
                                message = (0, nls_1.localize)(7, null, data.extensionNames.length);
                            }
                        }
                        if (needsConfirmation) {
                            // edit which needs confirmation -> always show dialog
                            const { confirmed } = await dialogService.confirm({
                                type: severity_1.default.Info,
                                message,
                                primaryButton: (0, nls_1.localize)(8, null),
                                cancelButton: (0, nls_1.localize)(9, null)
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
                                        label: (0, nls_1.localize)(10, null),
                                        run: () => Choice.OK
                                    },
                                    {
                                        label: (0, nls_1.localize)(11, null),
                                        run: () => Choice.Preview
                                    }
                                ],
                                cancelButton: {
                                    label: (0, nls_1.localize)(12, null),
                                    run: () => Choice.Cancel
                                },
                                checkbox: { label: (0, nls_1.localize)(13, null) }
                            });
                            if (result === Choice.Cancel) {
                                // no changes wanted, don't persist cancel option
                                return;
                            }
                            showPreview = result === Choice.Preview;
                            if (checkboxChecked) {
                                storageService.store($qkb_1.MementoKeyAdditionalEdits, showPreview, 0 /* StorageScope.PROFILE */, 0 /* StorageTarget.USER */);
                            }
                        }
                    }
                    logService.info('[onWill-handler] applying additional workspace edit from extensions', data.extensionNames);
                    await bulkEditService.apply((0, mainThreadBulkEdits_1.$6bb)(data.edit, uriIdentService), { undoRedoGroupId: undoInfo?.undoRedoGroupId, showPreview });
                }
                a(operation) {
                    switch (operation) {
                        case 0 /* FileOperation.CREATE */:
                            return (0, nls_1.localize)(14, null);
                        case 2 /* FileOperation.MOVE */:
                            return (0, nls_1.localize)(15, null);
                        case 3 /* FileOperation.COPY */:
                            return (0, nls_1.localize)(16, null);
                        case 1 /* FileOperation.DELETE */:
                            return (0, nls_1.localize)(17, null);
                        case 4 /* FileOperation.WRITE */:
                            return (0, nls_1.localize)(18, null);
                    }
                }
            };
            // BEFORE file operation
            this.a.add(workingCopyFileService.addFileOperationParticipant(fileOperationParticipant));
            // AFTER file operation
            this.a.add(workingCopyFileService.onDidRunWorkingCopyFileOperation(e => proxy.$onDidRunFileOperation(e.operation, e.files)));
        }
        dispose() {
            this.a.dispose();
        }
    };
    exports.$qkb = $qkb;
    exports.$qkb = $qkb = $qkb_1 = __decorate([
        extHostCustomers_1.$kbb,
        __param(1, files_1.$6j),
        __param(2, workingCopyFileService_1.$HD),
        __param(3, bulkEditService_1.$n1),
        __param(4, progress_1.$2u),
        __param(5, dialogs_1.$oA),
        __param(6, storage_1.$Vo),
        __param(7, log_1.$5i),
        __param(8, environment_1.$Ih),
        __param(9, uriIdentity_1.$Ck)
    ], $qkb);
    (0, actions_1.$Xu)(class ResetMemento extends actions_1.$Wu {
        constructor() {
            super({
                id: 'files.participants.resetChoice',
                title: {
                    value: (0, nls_1.localize)(19, null),
                    original: `Reset choice for 'File operation needs preview'`
                },
                f1: true
            });
        }
        run(accessor) {
            accessor.get(storage_1.$Vo).remove($qkb.MementoKeyAdditionalEdits, 0 /* StorageScope.PROFILE */);
        }
    });
});
//# sourceMappingURL=mainThreadFileSystemEventService.js.map