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
define(["require", "exports", "vs/nls!vs/workbench/services/workingCopy/electron-sandbox/workingCopyBackupTracker", "vs/workbench/services/workingCopy/common/workingCopyBackup", "vs/workbench/services/filesConfiguration/common/filesConfigurationService", "vs/workbench/services/workingCopy/common/workingCopyService", "vs/workbench/services/lifecycle/common/lifecycle", "vs/platform/dialogs/common/dialogs", "vs/platform/workspace/common/workspace", "vs/base/common/platform", "vs/platform/files/common/files", "vs/platform/native/common/native", "vs/workbench/services/workingCopy/common/workingCopyBackupTracker", "vs/platform/log/common/log", "vs/workbench/services/editor/common/editorService", "vs/platform/environment/common/environment", "vs/base/common/cancellation", "vs/platform/progress/common/progress", "vs/base/common/async", "vs/workbench/services/workingCopy/common/workingCopyEditorService", "vs/workbench/services/editor/common/editorGroupsService"], function (require, exports, nls_1, workingCopyBackup_1, filesConfigurationService_1, workingCopyService_1, lifecycle_1, dialogs_1, workspace_1, platform_1, files_1, native_1, workingCopyBackupTracker_1, log_1, editorService_1, environment_1, cancellation_1, progress_1, async_1, workingCopyEditorService_1, editorGroupsService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$4_b = void 0;
    let $4_b = class $4_b extends workingCopyBackupTracker_1.$k4b {
        constructor(workingCopyBackupService, filesConfigurationService, workingCopyService, lifecycleService, Y, Z, $, ab, logService, bb, cb, workingCopyEditorService, editorService, editorGroupService) {
            super(workingCopyBackupService, workingCopyService, logService, lifecycleService, filesConfigurationService, workingCopyEditorService, editorService, editorGroupService);
            this.Y = Y;
            this.Z = Z;
            this.$ = $;
            this.ab = ab;
            this.bb = bb;
            this.cb = cb;
        }
        async r(reason) {
            // Important: we are about to shutdown and handle modified working copies
            // and backups. We do not want any pending backup ops to interfer with
            // this because there is a risk of a backup being scheduled after we have
            // acknowledged to shutdown and then might end up with partial backups
            // written to disk, or even empty backups or deletes after writes.
            // (https://github.com/microsoft/vscode/issues/138055)
            this.O();
            // For the duration of the shutdown handling, suspend backup operations
            // and only resume after we have handled backups. Similar to above, we
            // do not want to trigger backup tracking during our shutdown handling
            // but we must resume, in case of a veto afterwards.
            const { resume } = this.P();
            try {
                // Modified working copies need treatment on shutdown
                const modifiedWorkingCopies = this.b.modifiedWorkingCopies;
                if (modifiedWorkingCopies.length) {
                    return await this.eb(reason, modifiedWorkingCopies);
                }
                // No modified working copies
                else {
                    return await this.mb();
                }
            }
            finally {
                resume();
            }
        }
        async eb(reason, modifiedWorkingCopies) {
            // If auto save is enabled, save all non-untitled working copies
            // and then check again for modified copies
            if (this.g.getAutoSaveMode() !== 0 /* AutoSaveMode.OFF */) {
                // Save all modified working copies that can be auto-saved
                try {
                    const workingCopiesToSave = modifiedWorkingCopies.filter(wc => !(wc.capabilities & 2 /* WorkingCopyCapabilities.Untitled */));
                    await this.kb(workingCopiesToSave, 2 /* SaveReason.AUTO */);
                }
                catch (error) {
                    this.c.error(`[backup tracker] error saving modified working copies: ${error}`); // guard against misbehaving saves, we handle remaining modified below
                }
                // If we still have modified working copies, we either have untitled ones or working copies that cannot be saved
                const remainingModifiedWorkingCopies = this.b.modifiedWorkingCopies;
                if (remainingModifiedWorkingCopies.length) {
                    return this.fb(remainingModifiedWorkingCopies, reason);
                }
                return this.nb([...modifiedWorkingCopies]); // no veto (modified auto-saved)
            }
            // Auto save is not enabled
            return this.fb(modifiedWorkingCopies, reason);
        }
        async fb(modifiedWorkingCopies, reason) {
            // Trigger backup if configured and enabled for shutdown reason
            let backups = [];
            let backupError = undefined;
            const modifiedWorkingCopiesToBackup = await this.gb(reason, modifiedWorkingCopies);
            if (modifiedWorkingCopiesToBackup.length > 0) {
                try {
                    const backupResult = await this.ib(modifiedWorkingCopiesToBackup);
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
                if (this.bb.isExtensionDevelopment) {
                    this.c.error(`[backup tracker] error creating backups: ${backupError}`);
                    return false; // do not block shutdown during extension development (https://github.com/microsoft/vscode/issues/115028)
                }
                this.hb((0, nls_1.localize)(0, null), remainingModifiedWorkingCopies, backupError);
                return true; // veto (the backup failed)
            }
            // Since a backup did not happen, we have to confirm for
            // the working copies that did not successfully backup
            try {
                return await this.jb(remainingModifiedWorkingCopies);
            }
            catch (error) {
                if (this.bb.isExtensionDevelopment) {
                    this.c.error(`[backup tracker] error saving or reverting modified working copies: ${error}`);
                    return false; // do not block shutdown during extension development (https://github.com/microsoft/vscode/issues/115028)
                }
                this.hb((0, nls_1.localize)(1, null), remainingModifiedWorkingCopies, error);
                return true; // veto (save or revert failed)
            }
        }
        async gb(reason, modifiedWorkingCopies) {
            if (!this.g.isHotExitEnabled) {
                return []; // never backup when hot exit is disabled via settings
            }
            if (this.bb.isExtensionDevelopment) {
                return modifiedWorkingCopies; // always backup closing extension development window without asking to speed up debugging
            }
            switch (reason) {
                // Window Close
                case 1 /* ShutdownReason.CLOSE */:
                    if (this.$.getWorkbenchState() !== 1 /* WorkbenchState.EMPTY */ && this.g.hotExitConfiguration === files_1.$rk.ON_EXIT_AND_WINDOW_CLOSE) {
                        return modifiedWorkingCopies; // backup if a workspace/folder is open and onExitAndWindowClose is configured
                    }
                    if (platform_1.$j || await this.ab.getWindowCount() > 1) {
                        if (this.$.getWorkbenchState() !== 1 /* WorkbenchState.EMPTY */) {
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
                    if (this.$.getWorkbenchState() !== 1 /* WorkbenchState.EMPTY */) {
                        if (this.g.hotExitConfiguration === files_1.$rk.ON_EXIT_AND_WINDOW_CLOSE) {
                            return modifiedWorkingCopies; // backup if a workspace/folder is open and onExitAndWindowClose is configured
                        }
                        return modifiedWorkingCopies.filter(modifiedWorkingCopy => modifiedWorkingCopy.capabilities & 4 /* WorkingCopyCapabilities.Scratchpad */); // backup scratchpads automatically to avoid user confirmation
                    }
                    return []; // do not backup because we are switching contexts with no workspace/folder open
            }
        }
        hb(msg, workingCopies, error) {
            const modifiedWorkingCopies = workingCopies.filter(workingCopy => workingCopy.isModified());
            const advice = (0, nls_1.localize)(2, null);
            const detail = modifiedWorkingCopies.length
                ? (0, dialogs_1.$rA)(modifiedWorkingCopies.map(x => x.name)) + '\n' + advice
                : advice;
            this.Z.error(msg, detail);
            this.c.error(error ? `[backup tracker] ${msg}: ${error}` : `[backup tracker] ${msg}`);
        }
        async ib(modifiedWorkingCopies) {
            const backups = [];
            let error = undefined;
            await this.pb(async (token) => {
                // Perform a backup of all modified working copies unless a backup already exists
                try {
                    await async_1.Promises.settled(modifiedWorkingCopies.map(async (workingCopy) => {
                        // Backup exists
                        const contentVersion = this.I(workingCopy);
                        if (this.a.hasBackupSync(workingCopy, contentVersion)) {
                            backups.push(workingCopy);
                        }
                        // Backup does not exist
                        else {
                            const backup = await workingCopy.backup(token);
                            if (token.isCancellationRequested) {
                                return;
                            }
                            await this.a.backup(workingCopy, backup.content, contentVersion, backup.meta, token);
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
            }, (0, nls_1.localize)(3, null), (0, nls_1.localize)(4, null));
            return { backups, error };
        }
        async jb(modifiedWorkingCopies) {
            // Save
            const confirm = await this.Y.showSaveConfirm(modifiedWorkingCopies.map(workingCopy => workingCopy.name));
            if (confirm === 0 /* ConfirmResult.SAVE */) {
                const modifiedCountBeforeSave = this.b.modifiedCount;
                try {
                    await this.kb(modifiedWorkingCopies, 1 /* SaveReason.EXPLICIT */);
                }
                catch (error) {
                    this.c.error(`[backup tracker] error saving modified working copies: ${error}`); // guard against misbehaving saves, we handle remaining modified below
                }
                const savedWorkingCopies = modifiedCountBeforeSave - this.b.modifiedCount;
                if (savedWorkingCopies < modifiedWorkingCopies.length) {
                    return true; // veto (save failed or was canceled)
                }
                return this.nb(modifiedWorkingCopies); // no veto (modified saved)
            }
            // Don't Save
            else if (confirm === 1 /* ConfirmResult.DONT_SAVE */) {
                try {
                    await this.lb(modifiedWorkingCopies);
                }
                catch (error) {
                    this.c.error(`[backup tracker] error reverting modified working copies: ${error}`); // do not block the shutdown on errors from revert
                }
                return this.nb(modifiedWorkingCopies); // no veto (modified reverted)
            }
            // Cancel
            return true; // veto (user canceled)
        }
        kb(workingCopies, reason) {
            return this.pb(async () => {
                // Skip save participants on shutdown for performance reasons
                const saveOptions = { skipSaveParticipants: true, reason };
                // First save through the editor service if we save all to benefit
                // from some extras like switching to untitled modified editors before saving.
                let result = undefined;
                if (workingCopies.length === this.b.modifiedCount) {
                    result = (await this.j.saveAll({
                        includeUntitled: { includeScratchpad: true },
                        ...saveOptions
                    })).success;
                }
                // If we still have modified working copies, save those directly
                // unless the save was not successful (e.g. cancelled)
                if (result !== false) {
                    await async_1.Promises.settled(workingCopies.map(workingCopy => workingCopy.isModified() ? workingCopy.save(saveOptions) : Promise.resolve(true)));
                }
            }, (0, nls_1.localize)(5, null));
        }
        lb(modifiedWorkingCopies) {
            return this.pb(async () => {
                // Soft revert is good enough on shutdown
                const revertOptions = { soft: true };
                // First revert through the editor service if we revert all
                if (modifiedWorkingCopies.length === this.b.modifiedCount) {
                    await this.j.revertAll(revertOptions);
                }
                // If we still have modified working copies, revert those directly
                await async_1.Promises.settled(modifiedWorkingCopies.map(workingCopy => workingCopy.isModified() ? workingCopy.revert(revertOptions) : Promise.resolve()));
            }, (0, nls_1.localize)(6, null));
        }
        mb() {
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
            return this.nb({ except: this.$.getWorkbenchState() === 1 /* WorkbenchState.EMPTY */ ? [] : Array.from(this.Q) });
        }
        async nb(arg1) {
            // Discard backups from working copies the
            // user either saved or reverted
            await this.ob(arg1);
            return false; // no veto (no modified)
        }
        async ob(arg1) {
            // We never discard any backups before we are ready
            // and have resolved all backups that exist. This
            // is important to not loose backups that have not
            // been handled.
            if (!this.U) {
                return;
            }
            await this.pb(async () => {
                // When we shutdown either with no modified working copies left
                // or with some handled, we start to discard these backups
                // to free them up. This helps to get rid of stale backups
                // as reported in https://github.com/microsoft/vscode/issues/92962
                //
                // However, we never want to discard backups that we know
                // were not restored in the session.
                try {
                    if (Array.isArray(arg1)) {
                        await async_1.Promises.settled(arg1.map(workingCopy => this.a.discardBackup(workingCopy)));
                    }
                    else {
                        await this.a.discardBackups(arg1);
                    }
                }
                catch (error) {
                    this.c.error(`[backup tracker] error discarding backups: ${error}`);
                }
            }, (0, nls_1.localize)(7, null));
        }
        pb(promiseFactory, title, detail) {
            const cts = new cancellation_1.$pd();
            return this.cb.withProgress({
                location: 20 /* ProgressLocation.Dialog */,
                cancellable: true,
                delay: 800,
                title,
                detail
            }, () => (0, async_1.$vg)(promiseFactory(cts.token), cts.token), () => cts.dispose(true));
        }
    };
    exports.$4_b = $4_b;
    exports.$4_b = $4_b = __decorate([
        __param(0, workingCopyBackup_1.$EA),
        __param(1, filesConfigurationService_1.$yD),
        __param(2, workingCopyService_1.$TC),
        __param(3, lifecycle_1.$7y),
        __param(4, dialogs_1.$qA),
        __param(5, dialogs_1.$oA),
        __param(6, workspace_1.$Kh),
        __param(7, native_1.$05b),
        __param(8, log_1.$5i),
        __param(9, environment_1.$Ih),
        __param(10, progress_1.$2u),
        __param(11, workingCopyEditorService_1.$AD),
        __param(12, editorService_1.$9C),
        __param(13, editorGroupsService_1.$5C)
    ], $4_b);
});
//# sourceMappingURL=workingCopyBackupTracker.js.map