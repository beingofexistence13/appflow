/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/lifecycle", "vs/base/common/cancellation", "vs/base/common/async"], function (require, exports, lifecycle_1, cancellation_1, async_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$k4b = void 0;
    /**
     * The working copy backup tracker deals with:
     * - restoring backups that exist
     * - creating backups for modified working copies
     * - deleting backups for saved working copies
     * - handling backups on shutdown
     */
    class $k4b extends lifecycle_1.$kc {
        constructor(a, b, c, f, g, h, j, m) {
            super();
            this.a = a;
            this.b = b;
            this.c = c;
            this.f = f;
            this.g = g;
            this.h = h;
            this.j = j;
            this.m = m;
            // A map from working copy to a version ID we compute on each content
            // change. This version ID allows to e.g. ask if a backup for a specific
            // content has been made before closing.
            this.u = new Map();
            // A map of scheduled pending backup operations for working copies
            // Given https://github.com/microsoft/vscode/issues/158038, we explicitly
            // do not store `IWorkingCopy` but the identifier in the map, since it
            // looks like GC is not running for the working copy otherwise.
            this.w = new Map();
            this.y = false;
            //#endregion
            //#region Backup Restorer
            this.Q = new Set();
            this.R = this.W();
            this.S = false;
            // Fill in initial modified working copies
            for (const workingCopy of this.b.modifiedWorkingCopies) {
                this.z(workingCopy);
            }
            this.n();
        }
        n() {
            // Working Copy events
            this.B(this.b.onDidRegister(workingCopy => this.z(workingCopy)));
            this.B(this.b.onDidUnregister(workingCopy => this.C(workingCopy)));
            this.B(this.b.onDidChangeDirty(workingCopy => this.D(workingCopy)));
            this.B(this.b.onDidChangeContent(workingCopy => this.F(workingCopy)));
            // Lifecycle
            this.B(this.f.onBeforeShutdown(event => event.finalVeto(() => this.r(event.reason), 'veto.backups')));
            this.B(this.f.onWillShutdown(() => this.s()));
            // Once a handler registers, restore backups
            this.B(this.h.onDidRegisterHandler(handler => this.X(handler)));
        }
        s() {
            // Here we know that we will shutdown. Any backup operation that is
            // already scheduled or being scheduled from this moment on runs
            // at the risk of corrupting a backup because the backup operation
            // might terminate at any given time now. As such, we need to disable
            // this tracker from performing more backups by cancelling pending
            // operations and suspending the tracker without resuming.
            this.O();
            this.P();
        }
        //#region Backup Creator
        // Delay creation of backups when content changes to avoid too much
        // load on the backup service when the user is typing into the editor
        // Since we always schedule a backup, even when auto save is on, we
        // have different scheduling delays based on auto save. This helps to
        // avoid a (not critical but also not really wanted) race between saving
        // (after 1s per default) and making a backup of the working copy.
        static { this.t = {
            [0 /* AutoSaveMode.OFF */]: 1000,
            [3 /* AutoSaveMode.ON_FOCUS_CHANGE */]: 1000,
            [4 /* AutoSaveMode.ON_WINDOW_CHANGE */]: 1000,
            [1 /* AutoSaveMode.AFTER_SHORT_DELAY */]: 2000,
            [2 /* AutoSaveMode.AFTER_LONG_DELAY */]: 1000
        }; }
        z(workingCopy) {
            if (this.y) {
                this.c.warn(`[backup tracker] suspended, ignoring register event`, workingCopy.resource.toString(), workingCopy.typeId);
                return;
            }
            if (workingCopy.isModified()) {
                this.G(workingCopy);
            }
        }
        C(workingCopy) {
            // Remove from content version map
            this.u.delete(workingCopy);
            // Check suspended
            if (this.y) {
                this.c.warn(`[backup tracker] suspended, ignoring unregister event`, workingCopy.resource.toString(), workingCopy.typeId);
                return;
            }
            // Discard backup
            this.J(workingCopy);
        }
        D(workingCopy) {
            if (this.y) {
                this.c.warn(`[backup tracker] suspended, ignoring dirty change event`, workingCopy.resource.toString(), workingCopy.typeId);
                return;
            }
            if (workingCopy.isDirty()) {
                this.G(workingCopy);
            }
            else {
                this.J(workingCopy);
            }
        }
        F(workingCopy) {
            // Increment content version ID
            const contentVersionId = this.I(workingCopy);
            this.u.set(workingCopy, contentVersionId + 1);
            // Check suspended
            if (this.y) {
                this.c.warn(`[backup tracker] suspended, ignoring content change event`, workingCopy.resource.toString(), workingCopy.typeId);
                return;
            }
            // Schedule backup for modified working copies
            if (workingCopy.isModified()) {
                // this listener will make sure that the backup is
                // pushed out for as long as the user is still changing
                // the content of the working copy.
                this.G(workingCopy);
            }
        }
        G(workingCopy) {
            // Clear any running backup operation
            this.M(workingCopy);
            this.c.trace(`[backup tracker] scheduling backup`, workingCopy.resource.toString(), workingCopy.typeId);
            // Schedule new backup
            const workingCopyIdentifier = { resource: workingCopy.resource, typeId: workingCopy.typeId };
            const cts = new cancellation_1.$pd();
            const handle = setTimeout(async () => {
                if (cts.token.isCancellationRequested) {
                    return;
                }
                // Backup if modified
                if (workingCopy.isModified()) {
                    this.c.trace(`[backup tracker] creating backup`, workingCopy.resource.toString(), workingCopy.typeId);
                    try {
                        const backup = await workingCopy.backup(cts.token);
                        if (cts.token.isCancellationRequested) {
                            return;
                        }
                        if (workingCopy.isModified()) {
                            this.c.trace(`[backup tracker] storing backup`, workingCopy.resource.toString(), workingCopy.typeId);
                            await this.a.backup(workingCopy, backup.content, this.I(workingCopy), backup.meta, cts.token);
                        }
                    }
                    catch (error) {
                        this.c.error(error);
                    }
                }
                // Clear disposable unless we got canceled which would
                // indicate another operation has started meanwhile
                if (!cts.token.isCancellationRequested) {
                    this.N(workingCopyIdentifier);
                }
            }, this.H(workingCopy));
            // Keep in map for disposal as needed
            this.w.set(workingCopyIdentifier, {
                cancel: () => {
                    this.c.trace(`[backup tracker] clearing pending backup creation`, workingCopy.resource.toString(), workingCopy.typeId);
                    cts.cancel();
                },
                disposable: (0, lifecycle_1.$ic)(() => {
                    cts.dispose();
                    clearTimeout(handle);
                })
            });
        }
        H(workingCopy) {
            if (typeof workingCopy.backupDelay === 'number') {
                return workingCopy.backupDelay; // respect working copy override
            }
            let autoSaveMode = this.g.getAutoSaveMode();
            if (workingCopy.capabilities & 2 /* WorkingCopyCapabilities.Untitled */) {
                autoSaveMode = 0 /* AutoSaveMode.OFF */; // auto-save is never on for untitled working copies
            }
            return $k4b.t[autoSaveMode];
        }
        I(workingCopy) {
            return this.u.get(workingCopy) || 0;
        }
        J(workingCopy) {
            // Clear any running backup operation
            this.M(workingCopy);
            // Schedule backup discard asap
            const workingCopyIdentifier = { resource: workingCopy.resource, typeId: workingCopy.typeId };
            const cts = new cancellation_1.$pd();
            this.L(workingCopyIdentifier, cts);
            // Keep in map for disposal as needed
            this.w.set(workingCopyIdentifier, {
                cancel: () => {
                    this.c.trace(`[backup tracker] clearing pending backup discard`, workingCopy.resource.toString(), workingCopy.typeId);
                    cts.cancel();
                },
                disposable: cts
            });
        }
        async L(workingCopyIdentifier, cts) {
            this.c.trace(`[backup tracker] discarding backup`, workingCopyIdentifier.resource.toString(), workingCopyIdentifier.typeId);
            // Discard backup
            try {
                await this.a.discardBackup(workingCopyIdentifier, cts.token);
            }
            catch (error) {
                this.c.error(error);
            }
            // Clear disposable unless we got canceled which would
            // indicate another operation has started meanwhile
            if (!cts.token.isCancellationRequested) {
                this.N(workingCopyIdentifier);
            }
        }
        M(workingCopy) {
            // Given a working copy we want to find the matching
            // identifier in our pending operations map because
            // we cannot use the working copy directly, as the
            // identifier might have different object identity.
            let workingCopyIdentifier = undefined;
            for (const [identifier] of this.w) {
                if (identifier.resource.toString() === workingCopy.resource.toString() && identifier.typeId === workingCopy.typeId) {
                    workingCopyIdentifier = identifier;
                    break;
                }
            }
            if (workingCopyIdentifier) {
                this.N(workingCopyIdentifier, { cancel: true });
            }
        }
        N(workingCopyIdentifier, options) {
            const pendingBackupOperation = this.w.get(workingCopyIdentifier);
            if (!pendingBackupOperation) {
                return;
            }
            if (options?.cancel) {
                pendingBackupOperation.cancel();
            }
            pendingBackupOperation.disposable.dispose();
            this.w.delete(workingCopyIdentifier);
        }
        O() {
            for (const [, operation] of this.w) {
                operation.cancel();
                operation.disposable.dispose();
            }
            this.w.clear();
        }
        P() {
            this.y = true;
            return { resume: () => this.y = false };
        }
        get U() { return this.S; }
        async W() {
            // Wait for resolving backups until we are restored to reduce startup pressure
            await this.f.when(3 /* LifecyclePhase.Restored */);
            // Remember each backup that needs to restore
            for (const backup of await this.a.getBackups()) {
                this.Q.add(backup);
            }
            this.S = true;
        }
        async X(handler) {
            // Wait for backups to be resolved
            await this.R;
            // Figure out already opened editors for backups vs
            // non-opened.
            const openedEditorsForBackups = new Set();
            const nonOpenedEditorsForBackups = new Set();
            // Ensure each backup that can be handled has an
            // associated editor.
            const restoredBackups = new Set();
            for (const unrestoredBackup of this.Q) {
                const canHandleUnrestoredBackup = await handler.handles(unrestoredBackup);
                if (!canHandleUnrestoredBackup) {
                    continue;
                }
                // Collect already opened editors for backup
                let hasOpenedEditorForBackup = false;
                for (const { editor } of this.j.getEditors(0 /* EditorsOrder.MOST_RECENTLY_ACTIVE */)) {
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
                await this.m.activeGroup.openEditors([...nonOpenedEditorsForBackups].map(nonOpenedEditorForBackup => ({
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
                if (this.j.isVisible(openedEditorForBackup)) {
                    return;
                }
                return openedEditorForBackup.resolve();
            }));
            // Finally, remove all handled backups from the list
            for (const restoredBackup of restoredBackups) {
                this.Q.delete(restoredBackup);
            }
        }
    }
    exports.$k4b = $k4b;
});
//# sourceMappingURL=workingCopyBackupTracker.js.map