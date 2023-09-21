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
define(["require", "exports", "vs/nls", "vs/base/common/event", "vs/base/common/async", "vs/base/common/cancellation", "vs/base/common/lifecycle", "vs/base/common/resources", "vs/base/common/uri", "vs/platform/dialogs/common/dialogs", "vs/platform/files/common/files", "vs/workbench/common/editor", "vs/workbench/services/environment/common/environmentService", "vs/workbench/services/path/common/pathService", "vs/platform/uriIdentity/common/uriIdentity", "vs/workbench/services/workingCopy/common/storedFileWorkingCopyManager", "vs/workbench/services/workingCopy/common/untitledFileWorkingCopy", "vs/workbench/services/workingCopy/common/untitledFileWorkingCopyManager", "vs/workbench/services/workingCopy/common/workingCopyFileService", "vs/platform/label/common/label", "vs/platform/log/common/log", "vs/platform/notification/common/notification", "vs/workbench/services/editor/common/editorService", "vs/workbench/services/files/common/elevatedFileService", "vs/workbench/services/filesConfiguration/common/filesConfigurationService", "vs/workbench/services/lifecycle/common/lifecycle", "vs/workbench/services/workingCopy/common/workingCopyBackup", "vs/workbench/services/workingCopy/common/workingCopyEditorService", "vs/workbench/services/workingCopy/common/workingCopyService", "vs/base/common/network", "vs/workbench/services/decorations/common/decorations", "vs/base/common/codicons", "vs/platform/theme/common/colorRegistry"], function (require, exports, nls_1, event_1, async_1, cancellation_1, lifecycle_1, resources_1, uri_1, dialogs_1, files_1, editor_1, environmentService_1, pathService_1, uriIdentity_1, storedFileWorkingCopyManager_1, untitledFileWorkingCopy_1, untitledFileWorkingCopyManager_1, workingCopyFileService_1, label_1, log_1, notification_1, editorService_1, elevatedFileService_1, filesConfigurationService_1, lifecycle_2, workingCopyBackup_1, workingCopyEditorService_1, workingCopyService_1, network_1, decorations_1, codicons_1, colorRegistry_1) {
    "use strict";
    var FileWorkingCopyManager_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.FileWorkingCopyManager = void 0;
    let FileWorkingCopyManager = class FileWorkingCopyManager extends lifecycle_1.Disposable {
        static { FileWorkingCopyManager_1 = this; }
        static { this.FILE_WORKING_COPY_SAVE_CREATE_SOURCE = editor_1.SaveSourceRegistry.registerSource('fileWorkingCopyCreate.source', (0, nls_1.localize)('fileWorkingCopyCreate.source', "File Created")); }
        static { this.FILE_WORKING_COPY_SAVE_REPLACE_SOURCE = editor_1.SaveSourceRegistry.registerSource('fileWorkingCopyReplace.source', (0, nls_1.localize)('fileWorkingCopyReplace.source', "File Replaced")); }
        constructor(workingCopyTypeId, storedWorkingCopyModelFactory, untitledWorkingCopyModelFactory, fileService, lifecycleService, labelService, logService, workingCopyFileService, workingCopyBackupService, uriIdentityService, fileDialogService, filesConfigurationService, workingCopyService, notificationService, workingCopyEditorService, editorService, elevatedFileService, pathService, environmentService, dialogService, decorationsService) {
            super();
            this.workingCopyTypeId = workingCopyTypeId;
            this.storedWorkingCopyModelFactory = storedWorkingCopyModelFactory;
            this.untitledWorkingCopyModelFactory = untitledWorkingCopyModelFactory;
            this.fileService = fileService;
            this.logService = logService;
            this.workingCopyFileService = workingCopyFileService;
            this.uriIdentityService = uriIdentityService;
            this.fileDialogService = fileDialogService;
            this.pathService = pathService;
            this.environmentService = environmentService;
            this.dialogService = dialogService;
            this.decorationsService = decorationsService;
            // Stored file working copies manager
            this.stored = this._register(new storedFileWorkingCopyManager_1.StoredFileWorkingCopyManager(this.workingCopyTypeId, this.storedWorkingCopyModelFactory, fileService, lifecycleService, labelService, logService, workingCopyFileService, workingCopyBackupService, uriIdentityService, filesConfigurationService, workingCopyService, notificationService, workingCopyEditorService, editorService, elevatedFileService));
            // Untitled file working copies manager
            this.untitled = this._register(new untitledFileWorkingCopyManager_1.UntitledFileWorkingCopyManager(this.workingCopyTypeId, this.untitledWorkingCopyModelFactory, async (workingCopy, options) => {
                const result = await this.saveAs(workingCopy.resource, undefined, options);
                return result ? true : false;
            }, fileService, labelService, logService, workingCopyBackupService, workingCopyService));
            // Events
            this.onDidCreate = event_1.Event.any(this.stored.onDidCreate, this.untitled.onDidCreate);
            // Decorations
            this.provideDecorations();
        }
        //#region decorations
        provideDecorations() {
            // File working copy decorations
            const provider = this._register(new class extends lifecycle_1.Disposable {
                constructor(stored) {
                    super();
                    this.stored = stored;
                    this.label = (0, nls_1.localize)('fileWorkingCopyDecorations', "File Working Copy Decorations");
                    this._onDidChange = this._register(new event_1.Emitter());
                    this.onDidChange = this._onDidChange.event;
                    this.registerListeners();
                }
                registerListeners() {
                    // Creates
                    this._register(this.stored.onDidResolve(workingCopy => {
                        if (workingCopy.isReadonly() || workingCopy.hasState(4 /* StoredFileWorkingCopyState.ORPHAN */)) {
                            this._onDidChange.fire([workingCopy.resource]);
                        }
                    }));
                    // Removals: once a stored working copy is no longer
                    // under our control, make sure to signal this as
                    // decoration change because from this point on we
                    // have no way of updating the decoration anymore.
                    this._register(this.stored.onDidRemove(workingCopyUri => this._onDidChange.fire([workingCopyUri])));
                    // Changes
                    this._register(this.stored.onDidChangeReadonly(workingCopy => this._onDidChange.fire([workingCopy.resource])));
                    this._register(this.stored.onDidChangeOrphaned(workingCopy => this._onDidChange.fire([workingCopy.resource])));
                }
                provideDecorations(uri) {
                    const workingCopy = this.stored.get(uri);
                    if (!workingCopy || workingCopy.isDisposed()) {
                        return undefined;
                    }
                    const isReadonly = workingCopy.isReadonly();
                    const isOrphaned = workingCopy.hasState(4 /* StoredFileWorkingCopyState.ORPHAN */);
                    // Readonly + Orphaned
                    if (isReadonly && isOrphaned) {
                        return {
                            color: colorRegistry_1.listErrorForeground,
                            letter: codicons_1.Codicon.lockSmall,
                            strikethrough: true,
                            tooltip: (0, nls_1.localize)('readonlyAndDeleted', "Deleted, Read-only"),
                        };
                    }
                    // Readonly
                    else if (isReadonly) {
                        return {
                            letter: codicons_1.Codicon.lockSmall,
                            tooltip: (0, nls_1.localize)('readonly', "Read-only"),
                        };
                    }
                    // Orphaned
                    else if (isOrphaned) {
                        return {
                            color: colorRegistry_1.listErrorForeground,
                            strikethrough: true,
                            tooltip: (0, nls_1.localize)('deleted', "Deleted"),
                        };
                    }
                    return undefined;
                }
            }(this.stored));
            this._register(this.decorationsService.registerDecorationsProvider(provider));
        }
        //#endregin
        //#region get / get all
        get workingCopies() {
            return [...this.stored.workingCopies, ...this.untitled.workingCopies];
        }
        get(resource) {
            return this.stored.get(resource) ?? this.untitled.get(resource);
        }
        resolve(arg1, arg2) {
            if (uri_1.URI.isUri(arg1)) {
                // Untitled: via untitled manager
                if (arg1.scheme === network_1.Schemas.untitled) {
                    return this.untitled.resolve({ untitledResource: arg1 });
                }
                // else: via stored file manager
                else {
                    return this.stored.resolve(arg1, arg2);
                }
            }
            return this.untitled.resolve(arg1);
        }
        //#endregion
        //#region Save
        async saveAs(source, target, options) {
            // Get to target resource
            if (!target) {
                const workingCopy = this.get(source);
                if (workingCopy instanceof untitledFileWorkingCopy_1.UntitledFileWorkingCopy && workingCopy.hasAssociatedFilePath) {
                    target = await this.suggestSavePath(source);
                }
                else {
                    target = await this.fileDialogService.pickFileToSave(await this.suggestSavePath(options?.suggestedTarget ?? source), options?.availableFileSystems);
                }
            }
            if (!target) {
                return; // user canceled
            }
            // Just save if target is same as working copies own resource
            // and we are not saving an untitled file working copy
            if (this.fileService.hasProvider(source) && (0, resources_1.isEqual)(source, target)) {
                return this.doSave(source, { ...options, force: true /* force to save, even if not dirty (https://github.com/microsoft/vscode/issues/99619) */ });
            }
            // If the target is different but of same identity, we
            // move the source to the target, knowing that the
            // underlying file system cannot have both and then save.
            // However, this will only work if the source exists
            // and is not orphaned, so we need to check that too.
            if (this.fileService.hasProvider(source) && this.uriIdentityService.extUri.isEqual(source, target) && (await this.fileService.exists(source))) {
                // Move via working copy file service to enable participants
                await this.workingCopyFileService.move([{ file: { source, target } }], cancellation_1.CancellationToken.None);
                // At this point we don't know whether we have a
                // working copy for the source or the target URI so we
                // simply try to save with both resources.
                return (await this.doSave(source, options)) ?? (await this.doSave(target, options));
            }
            // Perform normal "Save As"
            return this.doSaveAs(source, target, options);
        }
        async doSave(resource, options) {
            // Save is only possible with stored file working copies,
            // any other have to go via `saveAs` flow.
            const storedFileWorkingCopy = this.stored.get(resource);
            if (storedFileWorkingCopy) {
                const success = await storedFileWorkingCopy.save(options);
                if (success) {
                    return storedFileWorkingCopy;
                }
            }
            return undefined;
        }
        async doSaveAs(source, target, options) {
            let sourceContents;
            // If the source is an existing file working copy, we can directly
            // use that to copy the contents to the target destination
            const sourceWorkingCopy = this.get(source);
            if (sourceWorkingCopy?.isResolved()) {
                sourceContents = await sourceWorkingCopy.model.snapshot(cancellation_1.CancellationToken.None);
            }
            // Otherwise we resolve the contents from the underlying file
            else {
                sourceContents = (await this.fileService.readFileStream(source)).value;
            }
            // Resolve target
            const { targetFileExists, targetStoredFileWorkingCopy } = await this.doResolveSaveTarget(source, target);
            // Confirm to overwrite if we have an untitled file working copy with associated path where
            // the file actually exists on disk and we are instructed to save to that file path.
            // This can happen if the file was created after the untitled file was opened.
            // See https://github.com/microsoft/vscode/issues/67946
            if (sourceWorkingCopy instanceof untitledFileWorkingCopy_1.UntitledFileWorkingCopy &&
                sourceWorkingCopy.hasAssociatedFilePath &&
                targetFileExists &&
                this.uriIdentityService.extUri.isEqual(target, (0, resources_1.toLocalResource)(sourceWorkingCopy.resource, this.environmentService.remoteAuthority, this.pathService.defaultUriScheme))) {
                const overwrite = await this.confirmOverwrite(target);
                if (!overwrite) {
                    return undefined;
                }
            }
            // Take over content from source to target
            await targetStoredFileWorkingCopy.model?.update(sourceContents, cancellation_1.CancellationToken.None);
            // Set source options depending on target exists or not
            if (!options?.source) {
                options = {
                    ...options,
                    source: targetFileExists ? FileWorkingCopyManager_1.FILE_WORKING_COPY_SAVE_REPLACE_SOURCE : FileWorkingCopyManager_1.FILE_WORKING_COPY_SAVE_CREATE_SOURCE
                };
            }
            // Save target
            const success = await targetStoredFileWorkingCopy.save({ ...options, force: true /* force to save, even if not dirty (https://github.com/microsoft/vscode/issues/99619) */ });
            if (!success) {
                return undefined;
            }
            // Revert the source
            try {
                await sourceWorkingCopy?.revert();
            }
            catch (error) {
                // It is possible that reverting the source fails, for example
                // when a remote is disconnected and we cannot read it anymore.
                // However, this should not interrupt the "Save As" flow, so
                // we gracefully catch the error and just log it.
                this.logService.error(error);
            }
            return targetStoredFileWorkingCopy;
        }
        async doResolveSaveTarget(source, target) {
            // Prefer an existing stored file working copy if it is already resolved
            // for the given target resource
            let targetFileExists = false;
            let targetStoredFileWorkingCopy = this.stored.get(target);
            if (targetStoredFileWorkingCopy?.isResolved()) {
                targetFileExists = true;
            }
            // Otherwise create the target working copy empty if
            // it does not exist already and resolve it from there
            else {
                targetFileExists = await this.fileService.exists(target);
                // Create target file adhoc if it does not exist yet
                if (!targetFileExists) {
                    await this.workingCopyFileService.create([{ resource: target }], cancellation_1.CancellationToken.None);
                }
                // At this point we need to resolve the target working copy
                // and we have to do an explicit check if the source URI
                // equals the target via URI identity. If they match and we
                // have had an existing working copy with the source, we
                // prefer that one over resolving the target. Otherwise we
                // would potentially introduce a
                if (this.uriIdentityService.extUri.isEqual(source, target) && this.get(source)) {
                    targetStoredFileWorkingCopy = await this.stored.resolve(source);
                }
                else {
                    targetStoredFileWorkingCopy = await this.stored.resolve(target);
                }
            }
            return { targetFileExists, targetStoredFileWorkingCopy };
        }
        async confirmOverwrite(resource) {
            const { confirmed } = await this.dialogService.confirm({
                type: 'warning',
                message: (0, nls_1.localize)('confirmOverwrite', "'{0}' already exists. Do you want to replace it?", (0, resources_1.basename)(resource)),
                detail: (0, nls_1.localize)('irreversible', "A file or folder with the name '{0}' already exists in the folder '{1}'. Replacing it will overwrite its current contents.", (0, resources_1.basename)(resource), (0, resources_1.basename)((0, resources_1.dirname)(resource))),
                primaryButton: (0, nls_1.localize)({ key: 'replaceButtonLabel', comment: ['&& denotes a mnemonic'] }, "&&Replace")
            });
            return confirmed;
        }
        async suggestSavePath(resource) {
            // 1.) Just take the resource as is if the file service can handle it
            if (this.fileService.hasProvider(resource)) {
                return resource;
            }
            // 2.) Pick the associated file path for untitled working copies if any
            const workingCopy = this.get(resource);
            if (workingCopy instanceof untitledFileWorkingCopy_1.UntitledFileWorkingCopy && workingCopy.hasAssociatedFilePath) {
                return (0, resources_1.toLocalResource)(resource, this.environmentService.remoteAuthority, this.pathService.defaultUriScheme);
            }
            const defaultFilePath = await this.fileDialogService.defaultFilePath();
            // 3.) Pick the working copy name if valid joined with default path
            if (workingCopy) {
                const candidatePath = (0, resources_1.joinPath)(defaultFilePath, workingCopy.name);
                if (await this.pathService.hasValidBasename(candidatePath, workingCopy.name)) {
                    return candidatePath;
                }
            }
            // 4.) Finally fallback to the name of the resource joined with default path
            return (0, resources_1.joinPath)(defaultFilePath, (0, resources_1.basename)(resource));
        }
        //#endregion
        //#region Lifecycle
        async destroy() {
            await async_1.Promises.settled([
                this.stored.destroy(),
                this.untitled.destroy()
            ]);
        }
    };
    exports.FileWorkingCopyManager = FileWorkingCopyManager;
    exports.FileWorkingCopyManager = FileWorkingCopyManager = FileWorkingCopyManager_1 = __decorate([
        __param(3, files_1.IFileService),
        __param(4, lifecycle_2.ILifecycleService),
        __param(5, label_1.ILabelService),
        __param(6, log_1.ILogService),
        __param(7, workingCopyFileService_1.IWorkingCopyFileService),
        __param(8, workingCopyBackup_1.IWorkingCopyBackupService),
        __param(9, uriIdentity_1.IUriIdentityService),
        __param(10, dialogs_1.IFileDialogService),
        __param(11, filesConfigurationService_1.IFilesConfigurationService),
        __param(12, workingCopyService_1.IWorkingCopyService),
        __param(13, notification_1.INotificationService),
        __param(14, workingCopyEditorService_1.IWorkingCopyEditorService),
        __param(15, editorService_1.IEditorService),
        __param(16, elevatedFileService_1.IElevatedFileService),
        __param(17, pathService_1.IPathService),
        __param(18, environmentService_1.IWorkbenchEnvironmentService),
        __param(19, dialogs_1.IDialogService),
        __param(20, decorations_1.IDecorationsService)
    ], FileWorkingCopyManager);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmlsZVdvcmtpbmdDb3B5TWFuYWdlci5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9zZXJ2aWNlcy93b3JraW5nQ29weS9jb21tb24vZmlsZVdvcmtpbmdDb3B5TWFuYWdlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7O0lBa0l6RixJQUFNLHNCQUFzQixHQUE1QixNQUFNLHNCQUF1RyxTQUFRLHNCQUFVOztpQkFJN0cseUNBQW9DLEdBQUcsMkJBQWtCLENBQUMsY0FBYyxDQUFDLDhCQUE4QixFQUFFLElBQUEsY0FBUSxFQUFDLDhCQUE4QixFQUFFLGNBQWMsQ0FBQyxDQUFDLEFBQTlILENBQStIO2lCQUNuSywwQ0FBcUMsR0FBRywyQkFBa0IsQ0FBQyxjQUFjLENBQUMsK0JBQStCLEVBQUUsSUFBQSxjQUFRLEVBQUMsK0JBQStCLEVBQUUsZUFBZSxDQUFDLENBQUMsQUFBakksQ0FBa0k7UUFLL0wsWUFDa0IsaUJBQXlCLEVBQ3pCLDZCQUFvRSxFQUNwRSwrQkFBd0UsRUFDMUQsV0FBeUIsRUFDckMsZ0JBQW1DLEVBQ3ZDLFlBQTJCLEVBQ1osVUFBdUIsRUFDWCxzQkFBK0MsRUFDOUQsd0JBQW1ELEVBQ3hDLGtCQUF1QyxFQUN4QyxpQkFBcUMsRUFDOUMseUJBQXFELEVBQzVELGtCQUF1QyxFQUN0QyxtQkFBeUMsRUFDcEMsd0JBQW1ELEVBQzlELGFBQTZCLEVBQ3ZCLG1CQUF5QyxFQUNoQyxXQUF5QixFQUNULGtCQUFnRCxFQUM5RCxhQUE2QixFQUN4QixrQkFBdUM7WUFFN0UsS0FBSyxFQUFFLENBQUM7WUF0QlMsc0JBQWlCLEdBQWpCLGlCQUFpQixDQUFRO1lBQ3pCLGtDQUE2QixHQUE3Qiw2QkFBNkIsQ0FBdUM7WUFDcEUsb0NBQStCLEdBQS9CLCtCQUErQixDQUF5QztZQUMxRCxnQkFBVyxHQUFYLFdBQVcsQ0FBYztZQUcxQixlQUFVLEdBQVYsVUFBVSxDQUFhO1lBQ1gsMkJBQXNCLEdBQXRCLHNCQUFzQixDQUF5QjtZQUVuRCx1QkFBa0IsR0FBbEIsa0JBQWtCLENBQXFCO1lBQ3hDLHNCQUFpQixHQUFqQixpQkFBaUIsQ0FBb0I7WUFPM0MsZ0JBQVcsR0FBWCxXQUFXLENBQWM7WUFDVCx1QkFBa0IsR0FBbEIsa0JBQWtCLENBQThCO1lBQzlELGtCQUFhLEdBQWIsYUFBYSxDQUFnQjtZQUN4Qix1QkFBa0IsR0FBbEIsa0JBQWtCLENBQXFCO1lBSTdFLHFDQUFxQztZQUNyQyxJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSwyREFBNEIsQ0FDNUQsSUFBSSxDQUFDLGlCQUFpQixFQUN0QixJQUFJLENBQUMsNkJBQTZCLEVBQ2xDLFdBQVcsRUFBRSxnQkFBZ0IsRUFBRSxZQUFZLEVBQUUsVUFBVSxFQUFFLHNCQUFzQixFQUMvRSx3QkFBd0IsRUFBRSxrQkFBa0IsRUFBRSx5QkFBeUIsRUFBRSxrQkFBa0IsRUFDM0YsbUJBQW1CLEVBQUUsd0JBQXdCLEVBQUUsYUFBYSxFQUFFLG1CQUFtQixDQUNqRixDQUFDLENBQUM7WUFFSCx1Q0FBdUM7WUFDdkMsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksK0RBQThCLENBQ2hFLElBQUksQ0FBQyxpQkFBaUIsRUFDdEIsSUFBSSxDQUFDLCtCQUErQixFQUNwQyxLQUFLLEVBQUUsV0FBVyxFQUFFLE9BQU8sRUFBRSxFQUFFO2dCQUM5QixNQUFNLE1BQU0sR0FBRyxNQUFNLElBQUksQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLFFBQVEsRUFBRSxTQUFTLEVBQUUsT0FBTyxDQUFDLENBQUM7Z0JBRTNFLE9BQU8sTUFBTSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQztZQUM5QixDQUFDLEVBQ0QsV0FBVyxFQUFFLFlBQVksRUFBRSxVQUFVLEVBQUUsd0JBQXdCLEVBQUUsa0JBQWtCLENBQ25GLENBQUMsQ0FBQztZQUVILFNBQVM7WUFDVCxJQUFJLENBQUMsV0FBVyxHQUFHLGFBQUssQ0FBQyxHQUFHLENBQTBCLElBQUksQ0FBQyxNQUFNLENBQUMsV0FBVyxFQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsV0FBVyxDQUFDLENBQUM7WUFFMUcsY0FBYztZQUNkLElBQUksQ0FBQyxrQkFBa0IsRUFBRSxDQUFDO1FBQzNCLENBQUM7UUFFRCxxQkFBcUI7UUFFYixrQkFBa0I7WUFFekIsZ0NBQWdDO1lBQ2hDLE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxLQUFNLFNBQVEsc0JBQVU7Z0JBTzNELFlBQTZCLE1BQXdDO29CQUNwRSxLQUFLLEVBQUUsQ0FBQztvQkFEb0IsV0FBTSxHQUFOLE1BQU0sQ0FBa0M7b0JBTDVELFVBQUssR0FBRyxJQUFBLGNBQVEsRUFBQyw0QkFBNEIsRUFBRSwrQkFBK0IsQ0FBQyxDQUFDO29CQUV4RSxpQkFBWSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxlQUFPLEVBQVMsQ0FBQyxDQUFDO29CQUM1RCxnQkFBVyxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsS0FBSyxDQUFDO29CQUs5QyxJQUFJLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztnQkFDMUIsQ0FBQztnQkFFTyxpQkFBaUI7b0JBRXhCLFVBQVU7b0JBQ1YsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLFlBQVksQ0FBQyxXQUFXLENBQUMsRUFBRTt3QkFDckQsSUFBSSxXQUFXLENBQUMsVUFBVSxFQUFFLElBQUksV0FBVyxDQUFDLFFBQVEsMkNBQW1DLEVBQUU7NEJBQ3hGLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7eUJBQy9DO29CQUNGLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBRUosb0RBQW9EO29CQUNwRCxpREFBaUQ7b0JBQ2pELGtEQUFrRDtvQkFDbEQsa0RBQWtEO29CQUNsRCxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLGNBQWMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFFcEcsVUFBVTtvQkFDVixJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsbUJBQW1CLENBQUMsV0FBVyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFDL0csSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLG1CQUFtQixDQUFDLFdBQVcsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ2hILENBQUM7Z0JBRUQsa0JBQWtCLENBQUMsR0FBUTtvQkFDMUIsTUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7b0JBQ3pDLElBQUksQ0FBQyxXQUFXLElBQUksV0FBVyxDQUFDLFVBQVUsRUFBRSxFQUFFO3dCQUM3QyxPQUFPLFNBQVMsQ0FBQztxQkFDakI7b0JBRUQsTUFBTSxVQUFVLEdBQUcsV0FBVyxDQUFDLFVBQVUsRUFBRSxDQUFDO29CQUM1QyxNQUFNLFVBQVUsR0FBRyxXQUFXLENBQUMsUUFBUSwyQ0FBbUMsQ0FBQztvQkFFM0Usc0JBQXNCO29CQUN0QixJQUFJLFVBQVUsSUFBSSxVQUFVLEVBQUU7d0JBQzdCLE9BQU87NEJBQ04sS0FBSyxFQUFFLG1DQUFtQjs0QkFDMUIsTUFBTSxFQUFFLGtCQUFPLENBQUMsU0FBUzs0QkFDekIsYUFBYSxFQUFFLElBQUk7NEJBQ25CLE9BQU8sRUFBRSxJQUFBLGNBQVEsRUFBQyxvQkFBb0IsRUFBRSxvQkFBb0IsQ0FBQzt5QkFDN0QsQ0FBQztxQkFDRjtvQkFFRCxXQUFXO3lCQUNOLElBQUksVUFBVSxFQUFFO3dCQUNwQixPQUFPOzRCQUNOLE1BQU0sRUFBRSxrQkFBTyxDQUFDLFNBQVM7NEJBQ3pCLE9BQU8sRUFBRSxJQUFBLGNBQVEsRUFBQyxVQUFVLEVBQUUsV0FBVyxDQUFDO3lCQUMxQyxDQUFDO3FCQUNGO29CQUVELFdBQVc7eUJBQ04sSUFBSSxVQUFVLEVBQUU7d0JBQ3BCLE9BQU87NEJBQ04sS0FBSyxFQUFFLG1DQUFtQjs0QkFDMUIsYUFBYSxFQUFFLElBQUk7NEJBQ25CLE9BQU8sRUFBRSxJQUFBLGNBQVEsRUFBQyxTQUFTLEVBQUUsU0FBUyxDQUFDO3lCQUN2QyxDQUFDO3FCQUNGO29CQUVELE9BQU8sU0FBUyxDQUFDO2dCQUNsQixDQUFDO2FBQ0QsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztZQUVoQixJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQywyQkFBMkIsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO1FBQy9FLENBQUM7UUFFRCxXQUFXO1FBRVgsdUJBQXVCO1FBRXZCLElBQUksYUFBYTtZQUNoQixPQUFPLENBQUMsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLGFBQWEsRUFBRSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsYUFBYSxDQUFDLENBQUM7UUFDdkUsQ0FBQztRQUVELEdBQUcsQ0FBQyxRQUFhO1lBQ2hCLE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDakUsQ0FBQztRQVVELE9BQU8sQ0FBQyxJQUF5SixFQUFFLElBQTJDO1lBQzdNLElBQUksU0FBRyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsRUFBRTtnQkFFcEIsaUNBQWlDO2dCQUNqQyxJQUFJLElBQUksQ0FBQyxNQUFNLEtBQUssaUJBQU8sQ0FBQyxRQUFRLEVBQUU7b0JBQ3JDLE9BQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsRUFBRSxnQkFBZ0IsRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDO2lCQUN6RDtnQkFFRCxnQ0FBZ0M7cUJBQzNCO29CQUNKLE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO2lCQUN2QzthQUNEO1lBRUQsT0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNwQyxDQUFDO1FBRUQsWUFBWTtRQUVaLGNBQWM7UUFFZCxLQUFLLENBQUMsTUFBTSxDQUFDLE1BQVcsRUFBRSxNQUFZLEVBQUUsT0FBdUM7WUFFOUUseUJBQXlCO1lBQ3pCLElBQUksQ0FBQyxNQUFNLEVBQUU7Z0JBQ1osTUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQztnQkFDckMsSUFBSSxXQUFXLFlBQVksaURBQXVCLElBQUksV0FBVyxDQUFDLHFCQUFxQixFQUFFO29CQUN4RixNQUFNLEdBQUcsTUFBTSxJQUFJLENBQUMsZUFBZSxDQUFDLE1BQU0sQ0FBQyxDQUFDO2lCQUM1QztxQkFBTTtvQkFDTixNQUFNLEdBQUcsTUFBTSxJQUFJLENBQUMsaUJBQWlCLENBQUMsY0FBYyxDQUFDLE1BQU0sSUFBSSxDQUFDLGVBQWUsQ0FBQyxPQUFPLEVBQUUsZUFBZSxJQUFJLE1BQU0sQ0FBQyxFQUFFLE9BQU8sRUFBRSxvQkFBb0IsQ0FBQyxDQUFDO2lCQUNwSjthQUNEO1lBRUQsSUFBSSxDQUFDLE1BQU0sRUFBRTtnQkFDWixPQUFPLENBQUMsZ0JBQWdCO2FBQ3hCO1lBRUQsNkRBQTZEO1lBQzdELHNEQUFzRDtZQUN0RCxJQUFJLElBQUksQ0FBQyxXQUFXLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxJQUFJLElBQUEsbUJBQU8sRUFBQyxNQUFNLEVBQUUsTUFBTSxDQUFDLEVBQUU7Z0JBQ3BFLE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLEVBQUUsRUFBRSxHQUFHLE9BQU8sRUFBRSxLQUFLLEVBQUUsSUFBSSxDQUFFLHlGQUF5RixFQUFFLENBQUMsQ0FBQzthQUNuSjtZQUVELHNEQUFzRDtZQUN0RCxrREFBa0Q7WUFDbEQseURBQXlEO1lBQ3pELG9EQUFvRDtZQUNwRCxxREFBcUQ7WUFDckQsSUFBSSxJQUFJLENBQUMsV0FBVyxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsSUFBSSxJQUFJLENBQUMsa0JBQWtCLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLElBQUksQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUU7Z0JBRTlJLDREQUE0RDtnQkFDNUQsTUFBTSxJQUFJLENBQUMsc0JBQXNCLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBRSxJQUFJLEVBQUUsRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFFLEVBQUUsQ0FBQyxFQUFFLGdDQUFpQixDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUUvRixnREFBZ0Q7Z0JBQ2hELHNEQUFzRDtnQkFDdEQsMENBQTBDO2dCQUMxQyxPQUFPLENBQUMsTUFBTSxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sRUFBRSxPQUFPLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sRUFBRSxPQUFPLENBQUMsQ0FBQyxDQUFDO2FBQ3BGO1lBRUQsMkJBQTJCO1lBQzNCLE9BQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLEVBQUUsTUFBTSxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBQy9DLENBQUM7UUFFTyxLQUFLLENBQUMsTUFBTSxDQUFDLFFBQWEsRUFBRSxPQUFzQjtZQUV6RCx5REFBeUQ7WUFDekQsMENBQTBDO1lBQzFDLE1BQU0scUJBQXFCLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDeEQsSUFBSSxxQkFBcUIsRUFBRTtnQkFDMUIsTUFBTSxPQUFPLEdBQUcsTUFBTSxxQkFBcUIsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7Z0JBQzFELElBQUksT0FBTyxFQUFFO29CQUNaLE9BQU8scUJBQXFCLENBQUM7aUJBQzdCO2FBQ0Q7WUFFRCxPQUFPLFNBQVMsQ0FBQztRQUNsQixDQUFDO1FBRU8sS0FBSyxDQUFDLFFBQVEsQ0FBQyxNQUFXLEVBQUUsTUFBVyxFQUFFLE9BQXVDO1lBQ3ZGLElBQUksY0FBc0MsQ0FBQztZQUUzQyxrRUFBa0U7WUFDbEUsMERBQTBEO1lBQzFELE1BQU0saUJBQWlCLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUMzQyxJQUFJLGlCQUFpQixFQUFFLFVBQVUsRUFBRSxFQUFFO2dCQUNwQyxjQUFjLEdBQUcsTUFBTSxpQkFBaUIsQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLGdDQUFpQixDQUFDLElBQUksQ0FBQyxDQUFDO2FBQ2hGO1lBRUQsNkRBQTZEO2lCQUN4RDtnQkFDSixjQUFjLEdBQUcsQ0FBQyxNQUFNLElBQUksQ0FBQyxXQUFXLENBQUMsY0FBYyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDO2FBQ3ZFO1lBRUQsaUJBQWlCO1lBQ2pCLE1BQU0sRUFBRSxnQkFBZ0IsRUFBRSwyQkFBMkIsRUFBRSxHQUFHLE1BQU0sSUFBSSxDQUFDLG1CQUFtQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUMsQ0FBQztZQUV6RywyRkFBMkY7WUFDM0Ysb0ZBQW9GO1lBQ3BGLDhFQUE4RTtZQUM5RSx1REFBdUQ7WUFDdkQsSUFDQyxpQkFBaUIsWUFBWSxpREFBdUI7Z0JBQ3BELGlCQUFpQixDQUFDLHFCQUFxQjtnQkFDdkMsZ0JBQWdCO2dCQUNoQixJQUFJLENBQUMsa0JBQWtCLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUUsSUFBQSwyQkFBZSxFQUFDLGlCQUFpQixDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsa0JBQWtCLENBQUMsZUFBZSxFQUFFLElBQUksQ0FBQyxXQUFXLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxFQUN0SztnQkFDRCxNQUFNLFNBQVMsR0FBRyxNQUFNLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxNQUFNLENBQUMsQ0FBQztnQkFDdEQsSUFBSSxDQUFDLFNBQVMsRUFBRTtvQkFDZixPQUFPLFNBQVMsQ0FBQztpQkFDakI7YUFDRDtZQUVELDBDQUEwQztZQUMxQyxNQUFNLDJCQUEyQixDQUFDLEtBQUssRUFBRSxNQUFNLENBQUMsY0FBYyxFQUFFLGdDQUFpQixDQUFDLElBQUksQ0FBQyxDQUFDO1lBRXhGLHVEQUF1RDtZQUN2RCxJQUFJLENBQUMsT0FBTyxFQUFFLE1BQU0sRUFBRTtnQkFDckIsT0FBTyxHQUFHO29CQUNULEdBQUcsT0FBTztvQkFDVixNQUFNLEVBQUUsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDLHdCQUFzQixDQUFDLHFDQUFxQyxDQUFDLENBQUMsQ0FBQyx3QkFBc0IsQ0FBQyxvQ0FBb0M7aUJBQ3JKLENBQUM7YUFDRjtZQUVELGNBQWM7WUFDZCxNQUFNLE9BQU8sR0FBRyxNQUFNLDJCQUEyQixDQUFDLElBQUksQ0FBQyxFQUFFLEdBQUcsT0FBTyxFQUFFLEtBQUssRUFBRSxJQUFJLENBQUUseUZBQXlGLEVBQUUsQ0FBQyxDQUFDO1lBQy9LLElBQUksQ0FBQyxPQUFPLEVBQUU7Z0JBQ2IsT0FBTyxTQUFTLENBQUM7YUFDakI7WUFFRCxvQkFBb0I7WUFDcEIsSUFBSTtnQkFDSCxNQUFNLGlCQUFpQixFQUFFLE1BQU0sRUFBRSxDQUFDO2FBQ2xDO1lBQUMsT0FBTyxLQUFLLEVBQUU7Z0JBRWYsOERBQThEO2dCQUM5RCwrREFBK0Q7Z0JBQy9ELDREQUE0RDtnQkFDNUQsaURBQWlEO2dCQUVqRCxJQUFJLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQzthQUM3QjtZQUVELE9BQU8sMkJBQTJCLENBQUM7UUFDcEMsQ0FBQztRQUVPLEtBQUssQ0FBQyxtQkFBbUIsQ0FBQyxNQUFXLEVBQUUsTUFBVztZQUV6RCx3RUFBd0U7WUFDeEUsZ0NBQWdDO1lBQ2hDLElBQUksZ0JBQWdCLEdBQUcsS0FBSyxDQUFDO1lBQzdCLElBQUksMkJBQTJCLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDMUQsSUFBSSwyQkFBMkIsRUFBRSxVQUFVLEVBQUUsRUFBRTtnQkFDOUMsZ0JBQWdCLEdBQUcsSUFBSSxDQUFDO2FBQ3hCO1lBRUQsb0RBQW9EO1lBQ3BELHNEQUFzRDtpQkFDakQ7Z0JBQ0osZ0JBQWdCLEdBQUcsTUFBTSxJQUFJLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQztnQkFFekQsb0RBQW9EO2dCQUNwRCxJQUFJLENBQUMsZ0JBQWdCLEVBQUU7b0JBQ3RCLE1BQU0sSUFBSSxDQUFDLHNCQUFzQixDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsUUFBUSxFQUFFLE1BQU0sRUFBRSxDQUFDLEVBQUUsZ0NBQWlCLENBQUMsSUFBSSxDQUFDLENBQUM7aUJBQ3pGO2dCQUVELDJEQUEyRDtnQkFDM0Qsd0RBQXdEO2dCQUN4RCwyREFBMkQ7Z0JBQzNELHdEQUF3RDtnQkFDeEQsMERBQTBEO2dCQUMxRCxnQ0FBZ0M7Z0JBQ2hDLElBQUksSUFBSSxDQUFDLGtCQUFrQixDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQyxJQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLEVBQUU7b0JBQy9FLDJCQUEyQixHQUFHLE1BQU0sSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUM7aUJBQ2hFO3FCQUFNO29CQUNOLDJCQUEyQixHQUFHLE1BQU0sSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUM7aUJBQ2hFO2FBQ0Q7WUFFRCxPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsMkJBQTJCLEVBQUUsQ0FBQztRQUMxRCxDQUFDO1FBRU8sS0FBSyxDQUFDLGdCQUFnQixDQUFDLFFBQWE7WUFDM0MsTUFBTSxFQUFFLFNBQVMsRUFBRSxHQUFHLE1BQU0sSUFBSSxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUM7Z0JBQ3RELElBQUksRUFBRSxTQUFTO2dCQUNmLE9BQU8sRUFBRSxJQUFBLGNBQVEsRUFBQyxrQkFBa0IsRUFBRSxrREFBa0QsRUFBRSxJQUFBLG9CQUFRLEVBQUMsUUFBUSxDQUFDLENBQUM7Z0JBQzdHLE1BQU0sRUFBRSxJQUFBLGNBQVEsRUFBQyxjQUFjLEVBQUUsNEhBQTRILEVBQUUsSUFBQSxvQkFBUSxFQUFDLFFBQVEsQ0FBQyxFQUFFLElBQUEsb0JBQVEsRUFBQyxJQUFBLG1CQUFPLEVBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztnQkFDL00sYUFBYSxFQUFFLElBQUEsY0FBUSxFQUFDLEVBQUUsR0FBRyxFQUFFLG9CQUFvQixFQUFFLE9BQU8sRUFBRSxDQUFDLHVCQUF1QixDQUFDLEVBQUUsRUFBRSxXQUFXLENBQUM7YUFDdkcsQ0FBQyxDQUFDO1lBRUgsT0FBTyxTQUFTLENBQUM7UUFDbEIsQ0FBQztRQUVPLEtBQUssQ0FBQyxlQUFlLENBQUMsUUFBYTtZQUUxQyxxRUFBcUU7WUFDckUsSUFBSSxJQUFJLENBQUMsV0FBVyxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUMsRUFBRTtnQkFDM0MsT0FBTyxRQUFRLENBQUM7YUFDaEI7WUFFRCx1RUFBdUU7WUFDdkUsTUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUN2QyxJQUFJLFdBQVcsWUFBWSxpREFBdUIsSUFBSSxXQUFXLENBQUMscUJBQXFCLEVBQUU7Z0JBQ3hGLE9BQU8sSUFBQSwyQkFBZSxFQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsa0JBQWtCLENBQUMsZUFBZSxFQUFFLElBQUksQ0FBQyxXQUFXLENBQUMsZ0JBQWdCLENBQUMsQ0FBQzthQUM3RztZQUVELE1BQU0sZUFBZSxHQUFHLE1BQU0sSUFBSSxDQUFDLGlCQUFpQixDQUFDLGVBQWUsRUFBRSxDQUFDO1lBRXZFLG1FQUFtRTtZQUNuRSxJQUFJLFdBQVcsRUFBRTtnQkFDaEIsTUFBTSxhQUFhLEdBQUcsSUFBQSxvQkFBUSxFQUFDLGVBQWUsRUFBRSxXQUFXLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ2xFLElBQUksTUFBTSxJQUFJLENBQUMsV0FBVyxDQUFDLGdCQUFnQixDQUFDLGFBQWEsRUFBRSxXQUFXLENBQUMsSUFBSSxDQUFDLEVBQUU7b0JBQzdFLE9BQU8sYUFBYSxDQUFDO2lCQUNyQjthQUNEO1lBRUQsNEVBQTRFO1lBQzVFLE9BQU8sSUFBQSxvQkFBUSxFQUFDLGVBQWUsRUFBRSxJQUFBLG9CQUFRLEVBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztRQUN0RCxDQUFDO1FBRUQsWUFBWTtRQUVaLG1CQUFtQjtRQUVuQixLQUFLLENBQUMsT0FBTztZQUNaLE1BQU0sZ0JBQVEsQ0FBQyxPQUFPLENBQUM7Z0JBQ3RCLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxFQUFFO2dCQUNyQixJQUFJLENBQUMsUUFBUSxDQUFDLE9BQU8sRUFBRTthQUN2QixDQUFDLENBQUM7UUFDSixDQUFDOztJQXhZVyx3REFBc0I7cUNBQXRCLHNCQUFzQjtRQWNoQyxXQUFBLG9CQUFZLENBQUE7UUFDWixXQUFBLDZCQUFpQixDQUFBO1FBQ2pCLFdBQUEscUJBQWEsQ0FBQTtRQUNiLFdBQUEsaUJBQVcsQ0FBQTtRQUNYLFdBQUEsZ0RBQXVCLENBQUE7UUFDdkIsV0FBQSw2Q0FBeUIsQ0FBQTtRQUN6QixXQUFBLGlDQUFtQixDQUFBO1FBQ25CLFlBQUEsNEJBQWtCLENBQUE7UUFDbEIsWUFBQSxzREFBMEIsQ0FBQTtRQUMxQixZQUFBLHdDQUFtQixDQUFBO1FBQ25CLFlBQUEsbUNBQW9CLENBQUE7UUFDcEIsWUFBQSxvREFBeUIsQ0FBQTtRQUN6QixZQUFBLDhCQUFjLENBQUE7UUFDZCxZQUFBLDBDQUFvQixDQUFBO1FBQ3BCLFlBQUEsMEJBQVksQ0FBQTtRQUNaLFlBQUEsaURBQTRCLENBQUE7UUFDNUIsWUFBQSx3QkFBYyxDQUFBO1FBQ2QsWUFBQSxpQ0FBbUIsQ0FBQTtPQS9CVCxzQkFBc0IsQ0EyWWxDIn0=