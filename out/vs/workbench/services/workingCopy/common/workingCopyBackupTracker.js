/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/lifecycle", "vs/base/common/cancellation", "vs/base/common/async"], function (require, exports, lifecycle_1, cancellation_1, async_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.WorkingCopyBackupTracker = void 0;
    /**
     * The working copy backup tracker deals with:
     * - restoring backups that exist
     * - creating backups for modified working copies
     * - deleting backups for saved working copies
     * - handling backups on shutdown
     */
    class WorkingCopyBackupTracker extends lifecycle_1.Disposable {
        constructor(workingCopyBackupService, workingCopyService, logService, lifecycleService, filesConfigurationService, workingCopyEditorService, editorService, editorGroupService) {
            super();
            this.workingCopyBackupService = workingCopyBackupService;
            this.workingCopyService = workingCopyService;
            this.logService = logService;
            this.lifecycleService = lifecycleService;
            this.filesConfigurationService = filesConfigurationService;
            this.workingCopyEditorService = workingCopyEditorService;
            this.editorService = editorService;
            this.editorGroupService = editorGroupService;
            // A map from working copy to a version ID we compute on each content
            // change. This version ID allows to e.g. ask if a backup for a specific
            // content has been made before closing.
            this.mapWorkingCopyToContentVersion = new Map();
            // A map of scheduled pending backup operations for working copies
            // Given https://github.com/microsoft/vscode/issues/158038, we explicitly
            // do not store `IWorkingCopy` but the identifier in the map, since it
            // looks like GC is not running for the working copy otherwise.
            this.pendingBackupOperations = new Map();
            this.suspended = false;
            //#endregion
            //#region Backup Restorer
            this.unrestoredBackups = new Set();
            this.whenReady = this.resolveBackupsToRestore();
            this._isReady = false;
            // Fill in initial modified working copies
            for (const workingCopy of this.workingCopyService.modifiedWorkingCopies) {
                this.onDidRegister(workingCopy);
            }
            this.registerListeners();
        }
        registerListeners() {
            // Working Copy events
            this._register(this.workingCopyService.onDidRegister(workingCopy => this.onDidRegister(workingCopy)));
            this._register(this.workingCopyService.onDidUnregister(workingCopy => this.onDidUnregister(workingCopy)));
            this._register(this.workingCopyService.onDidChangeDirty(workingCopy => this.onDidChangeDirty(workingCopy)));
            this._register(this.workingCopyService.onDidChangeContent(workingCopy => this.onDidChangeContent(workingCopy)));
            // Lifecycle
            this._register(this.lifecycleService.onBeforeShutdown(event => event.finalVeto(() => this.onFinalBeforeShutdown(event.reason), 'veto.backups')));
            this._register(this.lifecycleService.onWillShutdown(() => this.onWillShutdown()));
            // Once a handler registers, restore backups
            this._register(this.workingCopyEditorService.onDidRegisterHandler(handler => this.restoreBackups(handler)));
        }
        onWillShutdown() {
            // Here we know that we will shutdown. Any backup operation that is
            // already scheduled or being scheduled from this moment on runs
            // at the risk of corrupting a backup because the backup operation
            // might terminate at any given time now. As such, we need to disable
            // this tracker from performing more backups by cancelling pending
            // operations and suspending the tracker without resuming.
            this.cancelBackupOperations();
            this.suspendBackupOperations();
        }
        //#region Backup Creator
        // Delay creation of backups when content changes to avoid too much
        // load on the backup service when the user is typing into the editor
        // Since we always schedule a backup, even when auto save is on, we
        // have different scheduling delays based on auto save. This helps to
        // avoid a (not critical but also not really wanted) race between saving
        // (after 1s per default) and making a backup of the working copy.
        static { this.DEFAULT_BACKUP_SCHEDULE_DELAYS = {
            [0 /* AutoSaveMode.OFF */]: 1000,
            [3 /* AutoSaveMode.ON_FOCUS_CHANGE */]: 1000,
            [4 /* AutoSaveMode.ON_WINDOW_CHANGE */]: 1000,
            [1 /* AutoSaveMode.AFTER_SHORT_DELAY */]: 2000,
            [2 /* AutoSaveMode.AFTER_LONG_DELAY */]: 1000
        }; }
        onDidRegister(workingCopy) {
            if (this.suspended) {
                this.logService.warn(`[backup tracker] suspended, ignoring register event`, workingCopy.resource.toString(), workingCopy.typeId);
                return;
            }
            if (workingCopy.isModified()) {
                this.scheduleBackup(workingCopy);
            }
        }
        onDidUnregister(workingCopy) {
            // Remove from content version map
            this.mapWorkingCopyToContentVersion.delete(workingCopy);
            // Check suspended
            if (this.suspended) {
                this.logService.warn(`[backup tracker] suspended, ignoring unregister event`, workingCopy.resource.toString(), workingCopy.typeId);
                return;
            }
            // Discard backup
            this.discardBackup(workingCopy);
        }
        onDidChangeDirty(workingCopy) {
            if (this.suspended) {
                this.logService.warn(`[backup tracker] suspended, ignoring dirty change event`, workingCopy.resource.toString(), workingCopy.typeId);
                return;
            }
            if (workingCopy.isDirty()) {
                this.scheduleBackup(workingCopy);
            }
            else {
                this.discardBackup(workingCopy);
            }
        }
        onDidChangeContent(workingCopy) {
            // Increment content version ID
            const contentVersionId = this.getContentVersion(workingCopy);
            this.mapWorkingCopyToContentVersion.set(workingCopy, contentVersionId + 1);
            // Check suspended
            if (this.suspended) {
                this.logService.warn(`[backup tracker] suspended, ignoring content change event`, workingCopy.resource.toString(), workingCopy.typeId);
                return;
            }
            // Schedule backup for modified working copies
            if (workingCopy.isModified()) {
                // this listener will make sure that the backup is
                // pushed out for as long as the user is still changing
                // the content of the working copy.
                this.scheduleBackup(workingCopy);
            }
        }
        scheduleBackup(workingCopy) {
            // Clear any running backup operation
            this.cancelBackupOperation(workingCopy);
            this.logService.trace(`[backup tracker] scheduling backup`, workingCopy.resource.toString(), workingCopy.typeId);
            // Schedule new backup
            const workingCopyIdentifier = { resource: workingCopy.resource, typeId: workingCopy.typeId };
            const cts = new cancellation_1.CancellationTokenSource();
            const handle = setTimeout(async () => {
                if (cts.token.isCancellationRequested) {
                    return;
                }
                // Backup if modified
                if (workingCopy.isModified()) {
                    this.logService.trace(`[backup tracker] creating backup`, workingCopy.resource.toString(), workingCopy.typeId);
                    try {
                        const backup = await workingCopy.backup(cts.token);
                        if (cts.token.isCancellationRequested) {
                            return;
                        }
                        if (workingCopy.isModified()) {
                            this.logService.trace(`[backup tracker] storing backup`, workingCopy.resource.toString(), workingCopy.typeId);
                            await this.workingCopyBackupService.backup(workingCopy, backup.content, this.getContentVersion(workingCopy), backup.meta, cts.token);
                        }
                    }
                    catch (error) {
                        this.logService.error(error);
                    }
                }
                // Clear disposable unless we got canceled which would
                // indicate another operation has started meanwhile
                if (!cts.token.isCancellationRequested) {
                    this.doClearPendingBackupOperation(workingCopyIdentifier);
                }
            }, this.getBackupScheduleDelay(workingCopy));
            // Keep in map for disposal as needed
            this.pendingBackupOperations.set(workingCopyIdentifier, {
                cancel: () => {
                    this.logService.trace(`[backup tracker] clearing pending backup creation`, workingCopy.resource.toString(), workingCopy.typeId);
                    cts.cancel();
                },
                disposable: (0, lifecycle_1.toDisposable)(() => {
                    cts.dispose();
                    clearTimeout(handle);
                })
            });
        }
        getBackupScheduleDelay(workingCopy) {
            if (typeof workingCopy.backupDelay === 'number') {
                return workingCopy.backupDelay; // respect working copy override
            }
            let autoSaveMode = this.filesConfigurationService.getAutoSaveMode();
            if (workingCopy.capabilities & 2 /* WorkingCopyCapabilities.Untitled */) {
                autoSaveMode = 0 /* AutoSaveMode.OFF */; // auto-save is never on for untitled working copies
            }
            return WorkingCopyBackupTracker.DEFAULT_BACKUP_SCHEDULE_DELAYS[autoSaveMode];
        }
        getContentVersion(workingCopy) {
            return this.mapWorkingCopyToContentVersion.get(workingCopy) || 0;
        }
        discardBackup(workingCopy) {
            // Clear any running backup operation
            this.cancelBackupOperation(workingCopy);
            // Schedule backup discard asap
            const workingCopyIdentifier = { resource: workingCopy.resource, typeId: workingCopy.typeId };
            const cts = new cancellation_1.CancellationTokenSource();
            this.doDiscardBackup(workingCopyIdentifier, cts);
            // Keep in map for disposal as needed
            this.pendingBackupOperations.set(workingCopyIdentifier, {
                cancel: () => {
                    this.logService.trace(`[backup tracker] clearing pending backup discard`, workingCopy.resource.toString(), workingCopy.typeId);
                    cts.cancel();
                },
                disposable: cts
            });
        }
        async doDiscardBackup(workingCopyIdentifier, cts) {
            this.logService.trace(`[backup tracker] discarding backup`, workingCopyIdentifier.resource.toString(), workingCopyIdentifier.typeId);
            // Discard backup
            try {
                await this.workingCopyBackupService.discardBackup(workingCopyIdentifier, cts.token);
            }
            catch (error) {
                this.logService.error(error);
            }
            // Clear disposable unless we got canceled which would
            // indicate another operation has started meanwhile
            if (!cts.token.isCancellationRequested) {
                this.doClearPendingBackupOperation(workingCopyIdentifier);
            }
        }
        cancelBackupOperation(workingCopy) {
            // Given a working copy we want to find the matching
            // identifier in our pending operations map because
            // we cannot use the working copy directly, as the
            // identifier might have different object identity.
            let workingCopyIdentifier = undefined;
            for (const [identifier] of this.pendingBackupOperations) {
                if (identifier.resource.toString() === workingCopy.resource.toString() && identifier.typeId === workingCopy.typeId) {
                    workingCopyIdentifier = identifier;
                    break;
                }
            }
            if (workingCopyIdentifier) {
                this.doClearPendingBackupOperation(workingCopyIdentifier, { cancel: true });
            }
        }
        doClearPendingBackupOperation(workingCopyIdentifier, options) {
            const pendingBackupOperation = this.pendingBackupOperations.get(workingCopyIdentifier);
            if (!pendingBackupOperation) {
                return;
            }
            if (options?.cancel) {
                pendingBackupOperation.cancel();
            }
            pendingBackupOperation.disposable.dispose();
            this.pendingBackupOperations.delete(workingCopyIdentifier);
        }
        cancelBackupOperations() {
            for (const [, operation] of this.pendingBackupOperations) {
                operation.cancel();
                operation.disposable.dispose();
            }
            this.pendingBackupOperations.clear();
        }
        suspendBackupOperations() {
            this.suspended = true;
            return { resume: () => this.suspended = false };
        }
        get isReady() { return this._isReady; }
        async resolveBackupsToRestore() {
            // Wait for resolving backups until we are restored to reduce startup pressure
            await this.lifecycleService.when(3 /* LifecyclePhase.Restored */);
            // Remember each backup that needs to restore
            for (const backup of await this.workingCopyBackupService.getBackups()) {
                this.unrestoredBackups.add(backup);
            }
            this._isReady = true;
        }
        async restoreBackups(handler) {
            // Wait for backups to be resolved
            await this.whenReady;
            // Figure out already opened editors for backups vs
            // non-opened.
            const openedEditorsForBackups = new Set();
            const nonOpenedEditorsForBackups = new Set();
            // Ensure each backup that can be handled has an
            // associated editor.
            const restoredBackups = new Set();
            for (const unrestoredBackup of this.unrestoredBackups) {
                const canHandleUnrestoredBackup = await handler.handles(unrestoredBackup);
                if (!canHandleUnrestoredBackup) {
                    continue;
                }
                // Collect already opened editors for backup
                let hasOpenedEditorForBackup = false;
                for (const { editor } of this.editorService.getEditors(0 /* EditorsOrder.MOST_RECENTLY_ACTIVE */)) {
                    const isUnrestoredBackupOpened = handler.isOpen(unrestoredBackup, editor);
                    if (isUnrestoredBackupOpened) {
                        openedEditorsForBackups.add(editor);
                        hasOpenedEditorForBackup = true;
                    }
                }
                // Otherwise, make sure to create at least one editor
                // for the backup to show
                if (!hasOpenedEditorForBackup) {
                    nonOpenedEditorsForBackups.add(await handler.createEditor(unrestoredBackup));
                }
                // Remember as (potentially) restored
                restoredBackups.add(unrestoredBackup);
            }
            // Ensure editors are opened for each backup without editor
            // in the background without stealing focus
            if (nonOpenedEditorsForBackups.size > 0) {
                await this.editorGroupService.activeGroup.openEditors([...nonOpenedEditorsForBackups].map(nonOpenedEditorForBackup => ({
                    editor: nonOpenedEditorForBackup,
                    options: {
                        pinned: true,
                        preserveFocus: true,
                        inactive: true
                    }
                })));
                for (const nonOpenedEditorForBackup of nonOpenedEditorsForBackups) {
                    openedEditorsForBackups.add(nonOpenedEditorForBackup);
                }
            }
            // Then, resolve each opened editor to make sure the working copy
            // is loaded and the modified editor appears properly.
            // We only do that for editors that are not active in a group
            // already to prevent calling `resolve` twice!
            await async_1.Promises.settled([...openedEditorsForBackups].map(async (openedEditorForBackup) => {
                if (this.editorService.isVisible(openedEditorForBackup)) {
                    return;
                }
                return openedEditorForBackup.resolve();
            }));
            // Finally, remove all handled backups from the list
            for (const restoredBackup of restoredBackups) {
                this.unrestoredBackups.delete(restoredBackup);
            }
        }
    }
    exports.WorkingCopyBackupTracker = WorkingCopyBackupTracker;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid29ya2luZ0NvcHlCYWNrdXBUcmFja2VyLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL3NlcnZpY2VzL3dvcmtpbmdDb3B5L2NvbW1vbi93b3JraW5nQ29weUJhY2t1cFRyYWNrZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBaUJoRzs7Ozs7O09BTUc7SUFDSCxNQUFzQix3QkFBeUIsU0FBUSxzQkFBVTtRQUVoRSxZQUNvQix3QkFBbUQsRUFDbkQsa0JBQXVDLEVBQ3ZDLFVBQXVCLEVBQ3pCLGdCQUFtQyxFQUNqQyx5QkFBcUQsRUFDdkQsd0JBQW1ELEVBQ2pELGFBQTZCLEVBQy9CLGtCQUF3QztZQUV6RCxLQUFLLEVBQUUsQ0FBQztZQVRXLDZCQUF3QixHQUF4Qix3QkFBd0IsQ0FBMkI7WUFDbkQsdUJBQWtCLEdBQWxCLGtCQUFrQixDQUFxQjtZQUN2QyxlQUFVLEdBQVYsVUFBVSxDQUFhO1lBQ3pCLHFCQUFnQixHQUFoQixnQkFBZ0IsQ0FBbUI7WUFDakMsOEJBQXlCLEdBQXpCLHlCQUF5QixDQUE0QjtZQUN2RCw2QkFBd0IsR0FBeEIsd0JBQXdCLENBQTJCO1lBQ2pELGtCQUFhLEdBQWIsYUFBYSxDQUFnQjtZQUMvQix1QkFBa0IsR0FBbEIsa0JBQWtCLENBQXNCO1lBNEQxRCxxRUFBcUU7WUFDckUsd0VBQXdFO1lBQ3hFLHdDQUF3QztZQUN2QixtQ0FBOEIsR0FBRyxJQUFJLEdBQUcsRUFBd0IsQ0FBQztZQUVsRixrRUFBa0U7WUFDbEUseUVBQXlFO1lBQ3pFLHNFQUFzRTtZQUN0RSwrREFBK0Q7WUFDNUMsNEJBQXVCLEdBQUcsSUFBSSxHQUFHLEVBQTJFLENBQUM7WUFFeEgsY0FBUyxHQUFHLEtBQUssQ0FBQztZQStOMUIsWUFBWTtZQUdaLHlCQUF5QjtZQUVOLHNCQUFpQixHQUFHLElBQUksR0FBRyxFQUEwQixDQUFDO1lB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