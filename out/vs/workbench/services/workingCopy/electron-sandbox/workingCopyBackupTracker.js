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
define(["require", "exports", "vs/nls", "vs/workbench/services/workingCopy/common/workingCopyBackup", "vs/workbench/services/filesConfiguration/common/filesConfigurationService", "vs/workbench/services/workingCopy/common/workingCopyService", "vs/workbench/services/lifecycle/common/lifecycle", "vs/platform/dialogs/common/dialogs", "vs/platform/workspace/common/workspace", "vs/base/common/platform", "vs/platform/files/common/files", "vs/platform/native/common/native", "vs/workbench/services/workingCopy/common/workingCopyBackupTracker", "vs/platform/log/common/log", "vs/workbench/services/editor/common/editorService", "vs/platform/environment/common/environment", "vs/base/common/cancellation", "vs/platform/progress/common/progress", "vs/base/common/async", "vs/workbench/services/workingCopy/common/workingCopyEditorService", "vs/workbench/services/editor/common/editorGroupsService"], function (require, exports, nls_1, workingCopyBackup_1, filesConfigurationService_1, workingCopyService_1, lifecycle_1, dialogs_1, workspace_1, platform_1, files_1, native_1, workingCopyBackupTracker_1, log_1, editorService_1, environment_1, cancellation_1, progress_1, async_1, workingCopyEditorService_1, editorGroupsService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.NativeWorkingCopyBackupTracker = void 0;
    let NativeWorkingCopyBackupTracker = class NativeWorkingCopyBackupTracker extends workingCopyBackupTracker_1.WorkingCopyBackupTracker {
        constructor(workingCopyBackupService, filesConfigurationService, workingCopyService, lifecycleService, fileDialogService, dialogService, contextService, nativeHostService, logService, environmentService, progressService, workingCopyEditorService, editorService, editorGroupService) {
            super(workingCopyBackupService, workingCopyService, logService, lifecycleService, filesConfigurationService, workingCopyEditorService, editorService, editorGroupService);
            this.fileDialogService = fileDialogService;
            this.dialogService = dialogService;
            this.contextService = contextService;
            this.nativeHostService = nativeHostService;
            this.environmentService = environmentService;
            this.progressService = progressService;
        }
        async onFinalBeforeShutdown(reason) {
            // Important: we are about to shutdown and handle modified working copies
            // and backups. We do not want any pending backup ops to interfer with
            // this because there is a risk of a backup being scheduled after we have
            // acknowledged to shutdown and then might end up with partial backups
            // written to disk, or even empty backups or deletes after writes.
            // (https://github.com/microsoft/vscode/issues/138055)
            this.cancelBackupOperations();
            // For the duration of the shutdown handling, suspend backup operations
            // and only resume after we have handled backups. Similar to above, we
            // do not want to trigger backup tracking during our shutdown handling
            // but we must resume, in case of a veto afterwards.
            const { resume } = this.suspendBackupOperations();
            try {
                // Modified working copies need treatment on shutdown
                const modifiedWorkingCopies = this.workingCopyService.modifiedWorkingCopies;
                if (modifiedWorkingCopies.length) {
                    return await this.onBeforeShutdownWithModified(reason, modifiedWorkingCopies);
                }
                // No modified working copies
                else {
                    return await this.onBeforeShutdownWithoutModified();
                }
            }
            finally {
                resume();
            }
        }
        async onBeforeShutdownWithModified(reason, modifiedWorkingCopies) {
            // If auto save is enabled, save all non-untitled working copies
            // and then check again for modified copies
            if (this.filesConfigurationService.getAutoSaveMode() !== 0 /* AutoSaveMode.OFF */) {
                // Save all modified working copies that can be auto-saved
                try {
                    const workingCopiesToSave = modifiedWorkingCopies.filter(wc => !(wc.capabilities & 2 /* WorkingCopyCapabilities.Untitled */));
                    await this.doSaveAllBeforeShutdown(workingCopiesToSave, 2 /* SaveReason.AUTO */);
                }
                catch (error) {
                    this.logService.error(`[backup tracker] error saving modified working copies: ${error}`); // guard against misbehaving saves, we handle remaining modified below
                }
                // If we still have modified working copies, we either have untitled ones or working copies that cannot be saved
                const remainingModifiedWorkingCopies = this.workingCopyService.modifiedWorkingCopies;
                if (remainingModifiedWorkingCopies.length) {
                    return this.handleModifiedBeforeShutdown(remainingModifiedWorkingCopies, reason);
                }
                return this.noVeto([...modifiedWorkingCopies]); // no veto (modified auto-saved)
            }
            // Auto save is not enabled
            return this.handleModifiedBeforeShutdown(modifiedWorkingCopies, reason);
        }
        async handleModifiedBeforeShutdown(modifiedWorkingCopies, reason) {
            // Trigger backup if configured and enabled for shutdown reason
            let backups = [];
            let backupError = undefined;
            const modifiedWorkingCopiesToBackup = await this.shouldBackupBeforeShutdown(reason, modifiedWorkingCopies);
            if (modifiedWorkingCopiesToBackup.length > 0) {
                try {
                    const backupResult = await this.backupBeforeShutdown(modifiedWorkingCopiesToBackup);
                    backups = backupResult.backups;
                    backupError = backupResult.error;
                    if (backups.length === modifiedWorkingCopies.length) {
                        return false; // no veto (backup was successful for all working copies)
                    }
                }
                catch (error) {
                    backupError = error;
                }
            }
            const remainingModifiedWorkingCopies = modifiedWorkingCopies.filter(workingCopy => !backups.includes(workingCopy));
            // We ran a backup but received an error that we show to the user
            if (backupError) {
                if (this.environmentService.isExtensionDevelopment) {
                    this.logService.error(`[backup tracker] error creating backups: ${backupError}`);
                    return false; // do not block shutdown during extension development (https://github.com/microsoft/vscode/issues/115028)
                }
                this.showErrorDialog((0, nls_1.localize)('backupTrackerBackupFailed', "The following editors with unsaved changes could not be saved to the back up location."), remainingModifiedWorkingCopies, backupError);
                return true; // veto (the backup failed)
            }
            // Since a backup did not happen, we have to confirm for
            // the working copies that did not successfully backup
            try {
                return await this.confirmBeforeShutdown(remainingModifiedWorkingCopies);
            }
            catch (error) {
                if (this.environmentService.isExtensionDevelopment) {
                    this.logService.error(`[backup tracker] error saving or reverting modified working copies: ${error}`);
                    return false; // do not block shutdown during extension development (https://github.com/microsoft/vscode/issues/115028)
                }
                this.showErrorDialog((0, nls_1.localize)('backupTrackerConfirmFailed', "The following editors with unsaved changes could not be saved or reverted."), remainingModifiedWorkingCopies, error);
                return true; // veto (save or revert failed)
            }
        }
        async shouldBackupBeforeShutdown(reason, modifiedWorkingCopies) {
            if (!this.filesConfigurationService.isHotExitEnabled) {
                return []; // never backup when hot exit is disabled via settings
            }
            if (this.environmentService.isExtensionDevelopment) {
                return modifiedWorkingCopies; // always backup closing extension development window without asking to speed up debugging
            }
            switch (reason) {
                // Window Close
                case 1 /* ShutdownReason.CLOSE */:
                    if (this.contextService.getWorkbenchState() !== 1 /* WorkbenchState.EMPTY */ && this.filesConfigurationService.hotExitConfiguration === files_1.HotExitConfiguration.ON_EXIT_AND_WINDOW_CLOSE) {
                        return modifiedWorkingCopies; // backup if a workspace/folder is open and onExitAndWindowClose is configured
                    }
                    if (platform_1.isMacintosh || await this.nativeHostService.getWindowCount() > 1) {
                        if (this.contextService.getWorkbenchState() !== 1 /* WorkbenchState.EMPTY */) {
                            return modifiedWorkingCopies.filter(modifiedWorkingCopy => modifiedWorkingCopy.capabilities & 4 /* WorkingCopyCapabilities.Scratchpad */); // backup scratchpads automatically to avoid user confirmation
                        }
                        return []; // do not backup if a window is closed that does not cause quitting of the application
                    }
                    return modifiedWorkingCopies; // backup if last window is closed on win/linux where the application quits right after
                // Application Quit
                case 2 /* ShutdownReason.QUIT */:
                    return modifiedWorkingCopies; // backup because next start we restore all backups
                // Window Reload
                case 3 /* ShutdownReason.RELOAD */:
                    return modifiedWorkingCopies; // backup because after window reload, backups restore
                // Workspace Change
                case 4 /* ShutdownReason.LOAD */:
                    if (this.contextService.getWorkbenchState() !== 1 /* WorkbenchState.EMPTY */) {
                        if (this.filesConfigurationService.hotExitConfiguration === files_1.HotExitConfiguration.ON_EXIT_AND_WINDOW_CLOSE) {
                            return modifiedWorkingCopies; // backup if a workspace/folder is open and onExitAndWindowClose is configured
                        }
                        return modifiedWorkingCopies.filter(modifiedWorkingCopy => modifiedWorkingCopy.capabilities & 4 /* WorkingCopyCapabilities.Scratchpad */); // backup scratchpads automatically to avoid user confirmation
                    }
                    return []; // do not backup because we are switching contexts with no workspace/folder open
            }
        }
        showErrorDialog(msg, workingCopies, error) {
            const modifiedWorkingCopies = workingCopies.filter(workingCopy => workingCopy.isModified());
            const advice = (0, nls_1.localize)('backupErrorDetails', "Try saving or reverting the editors with unsaved changes first and then try again.");
            const detail = modifiedWorkingCopies.length
                ? (0, dialogs_1.getFileNamesMessage)(modifiedWorkingCopies.map(x => x.name)) + '\n' + advice
                : advice;
            this.dialogService.error(msg, detail);
            this.logService.error(error ? `[backup tracker] ${msg}: ${error}` : `[backup tracker] ${msg}`);
        }
        async backupBeforeShutdown(modifiedWorkingCopies) {
            const backups = [];
            let error = undefined;
            await this.withProgressAndCancellation(async (token) => {
                // Perform a backup of all modified working copies unless a backup already exists
                try {
                    await async_1.Promises.settled(modifiedWorkingCopies.map(async (workingCopy) => {
                        // Backup exists
                        const contentVersion = this.getContentVersion(workingCopy);
                        if (this.workingCopyBackupService.hasBackupSync(workingCopy, contentVersion)) {
                            backups.push(workingCopy);
                        }
                        // Backup does not exist
                        else {
                            const backup = await workingCopy.backup(token);
                            if (token.isCancellationRequested) {
                                return;
                            }
                            await this.workingCopyBackupService.backup(workingCopy, backup.content, contentVersion, backup.meta, token);
                            if (token.isCancellationRequested) {
                                return;
                            }
                            backups.push(workingCopy);
                        }
                    }));
                }
                catch (backupError) {
                    error = backupError;
                }
            }, (0, nls_1.localize)('backupBeforeShutdownMessage', "Backing up editors with unsaved changes is taking a bit longer..."), (0, nls_1.localize)('backupBeforeShutdownDetail', "Click 'Cancel' to stop waiting and to save or revert editors with unsaved changes."));
            return { backups, error };
        }
        async confirmBeforeShutdown(modifiedWorkingCopies) {
            // Save
            const confirm = await this.fileDialogService.showSaveConfirm(modifiedWorkingCopies.map(workingCopy => workingCopy.name));
            if (confirm === 0 /* ConfirmResult.SAVE */) {
                const modifiedCountBeforeSave = this.workingCopyService.modifiedCount;
                try {
                    await this.doSaveAllBeforeShutdown(modifiedWorkingCopies, 1 /* SaveReason.EXPLICIT */);
                }
                catch (error) {
                    this.logService.error(`[backup tracker] error saving modified working copies: ${error}`); // guard against misbehaving saves, we handle remaining modified below
                }
                const savedWorkingCopies = modifiedCountBeforeSave - this.workingCopyService.modifiedCount;
                if (savedWorkingCopies < modifiedWorkingCopies.length) {
                    return true; // veto (save failed or was canceled)
                }
                return this.noVeto(modifiedWorkingCopies); // no veto (modified saved)
            }
            // Don't Save
            else if (confirm === 1 /* ConfirmResult.DONT_SAVE */) {
                try {
                    await this.doRevertAllBeforeShutdown(modifiedWorkingCopies);
                }
                catch (error) {
                    this.logService.error(`[backup tracker] error reverting modified working copies: ${error}`); // do not block the shutdown on errors from revert
                }
                return this.noVeto(modifiedWorkingCopies); // no veto (modified reverted)
            }
            // Cancel
            return true; // veto (user canceled)
        }
        doSaveAllBeforeShutdown(workingCopies, reason) {
            return this.withProgressAndCancellation(async () => {
                // Skip save participants on shutdown for performance reasons
                const saveOptions = { skipSaveParticipants: true, reason };
                // First save through the editor service if we save all to benefit
                // from some extras like switching to untitled modified editors before saving.
                let result = undefined;
                if (workingCopies.length === this.workingCopyService.modifiedCount) {
                    result = (await this.editorService.saveAll({
                        includeUntitled: { includeScratchpad: true },
                        ...saveOptions
                    })).success;
                }
                // If we still have modified working copies, save those directly
                // unless the save was not successful (e.g. cancelled)
                if (result !== false) {
                    await async_1.Promises.settled(workingCopies.map(workingCopy => workingCopy.isModified() ? workingCopy.save(saveOptions) : Promise.resolve(true)));
                }
            }, (0, nls_1.localize)('saveBeforeShutdown', "Saving editors with unsaved changes is taking a bit longer..."));
        }
        doRevertAllBeforeShutdown(modifiedWorkingCopies) {
            return this.withProgressAndCancellation(async () => {
                // Soft revert is good enough on shutdown
                const revertOptions = { soft: true };
                // First revert through the editor service if we revert all
                if (modifiedWorkingCopies.length === this.workingCopyService.modifiedCount) {
                    await this.editorService.revertAll(revertOptions);
                }
                // If we still have modified working copies, revert those directly
                await async_1.Promises.settled(modifiedWorkingCopies.map(workingCopy => workingCopy.isModified() ? workingCopy.revert(revertOptions) : Promise.resolve()));
            }, (0, nls_1.localize)('revertBeforeShutdown', "Reverting editors with unsaved changes is taking a bit longer..."));
        }
        onBeforeShutdownWithoutModified() {
            // We are about to shutdown without modified editors
            // and will discard any backups that are still
            // around that have not been handled depending
            // on the window state.
            //
            // Empty window: discard even unrestored backups to
            // prevent empty windows from restoring that cannot
            // be closed (workaround for not having implemented
            // https://github.com/microsoft/vscode/issues/127163
            // and a fix for what users have reported in issue
            // https://github.com/microsoft/vscode/issues/126725)
            //
            // Workspace/Folder window: do not discard unrestored
            // backups to give a chance to restore them in the
            // future. Since we do not restore workspace/folder
            // windows with backups, this is fine.
            return this.noVeto({ except: this.contextService.getWorkbenchState() === 1 /* WorkbenchState.EMPTY */ ? [] : Array.from(this.unrestoredBackups) });
        }
        async noVeto(arg1) {
            // Discard backups from working copies the
            // user either saved or reverted
            await this.discardBackupsBeforeShutdown(arg1);
            return false; // no veto (no modified)
        }
        async discardBackupsBeforeShutdown(arg1) {
            // We never discard any backups before we are ready
            // and have resolved all backups that exist. This
            // is important to not loose backups that have not
            // been handled.
            if (!this.isReady) {
                return;
            }
            await this.withProgressAndCancellation(async () => {
                // When we shutdown either with no modified working copies left
                // or with some handled, we start to discard these backups
                // to free them up. This helps to get rid of stale backups
                // as reported in https://github.com/microsoft/vscode/issues/92962
                //
                // However, we never want to discard backups that we know
                // were not restored in the session.
                try {
                    if (Array.isArray(arg1)) {
                        await async_1.Promises.settled(arg1.map(workingCopy => this.workingCopyBackupService.discardBackup(workingCopy)));
                    }
                    else {
                        await this.workingCopyBackupService.discardBackups(arg1);
                    }
                }
                catch (error) {
                    this.logService.error(`[backup tracker] error discarding backups: ${error}`);
                }
            }, (0, nls_1.localize)('discardBackupsBeforeShutdown', "Discarding backups is taking a bit longer..."));
        }
        withProgressAndCancellation(promiseFactory, title, detail) {
            const cts = new cancellation_1.CancellationTokenSource();
            return this.progressService.withProgress({
                location: 20 /* ProgressLocation.Dialog */,
                cancellable: true,
                delay: 800,
                title,
                detail
            }, () => (0, async_1.raceCancellation)(promiseFactory(cts.token), cts.token), () => cts.dispose(true));
        }
    };
    exports.NativeWorkingCopyBackupTracker = NativeWorkingCopyBackupTracker;
    exports.NativeWorkingCopyBackupTracker = NativeWorkingCopyBackupTracker = __decorate([
        __param(0, workingCopyBackup_1.IWorkingCopyBackupService),
        __param(1, filesConfigurationService_1.IFilesConfigurationService),
        __param(2, workingCopyService_1.IWorkingCopyService),
        __param(3, lifecycle_1.ILifecycleService),
        __param(4, dialogs_1.IFileDialogService),
        __param(5, dialogs_1.IDialogService),
        __param(6, workspace_1.IWorkspaceContextService),
        __param(7, native_1.INativeHostService),
        __param(8, log_1.ILogService),
        __param(9, environment_1.IEnvironmentService),
        __param(10, progress_1.IProgressService),
        __param(11, workingCopyEditorService_1.IWorkingCopyEditorService),
        __param(12, editorService_1.IEditorService),
        __param(13, editorGroupsService_1.IEditorGroupsService)
    ], NativeWorkingCopyBackupTracker);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid29ya2luZ0NvcHlCYWNrdXBUcmFja2VyLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL3NlcnZpY2VzL3dvcmtpbmdDb3B5L2VsZWN0cm9uLXNhbmRib3gvd29ya2luZ0NvcHlCYWNrdXBUcmFja2VyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQXlCekYsSUFBTSw4QkFBOEIsR0FBcEMsTUFBTSw4QkFBK0IsU0FBUSxtREFBd0I7UUFFM0UsWUFDNEIsd0JBQW1ELEVBQ2xELHlCQUFxRCxFQUM1RCxrQkFBdUMsRUFDekMsZ0JBQW1DLEVBQ2pCLGlCQUFxQyxFQUN6QyxhQUE2QixFQUNuQixjQUF3QyxFQUM5QyxpQkFBcUMsRUFDN0QsVUFBdUIsRUFDRSxrQkFBdUMsRUFDMUMsZUFBaUMsRUFDekMsd0JBQW1ELEVBQzlELGFBQTZCLEVBQ3ZCLGtCQUF3QztZQUU5RCxLQUFLLENBQUMsd0JBQXdCLEVBQUUsa0JBQWtCLEVBQUUsVUFBVSxFQUFFLGdCQUFnQixFQUFFLHlCQUF5QixFQUFFLHdCQUF3QixFQUFFLGFBQWEsRUFBRSxrQkFBa0IsQ0FBQyxDQUFDO1lBWHJJLHNCQUFpQixHQUFqQixpQkFBaUIsQ0FBb0I7WUFDekMsa0JBQWEsR0FBYixhQUFhLENBQWdCO1lBQ25CLG1CQUFjLEdBQWQsY0FBYyxDQUEwQjtZQUM5QyxzQkFBaUIsR0FBakIsaUJBQWlCLENBQW9CO1lBRXBDLHVCQUFrQixHQUFsQixrQkFBa0IsQ0FBcUI7WUFDMUMsb0JBQWUsR0FBZixlQUFlLENBQWtCO1FBTXJFLENBQUM7UUFFUyxLQUFLLENBQUMscUJBQXFCLENBQUMsTUFBc0I7WUFFM0QseUVBQXlFO1lBQ3pFLHNFQUFzRTtZQUN0RSx5RUFBeUU7WUFDekUsc0VBQXNFO1lBQ3RFLGtFQUFrRTtZQUNsRSxzREFBc0Q7WUFFdEQsSUFBSSxDQUFD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