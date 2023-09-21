/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "fs", "vs/base/common/path", "vs/base/common/uri", "vs/workbench/api/common/extHostStoragePaths", "vs/base/common/lifecycle", "vs/base/common/network", "vs/base/common/async", "vs/base/node/pfs"], function (require, exports, fs, path, uri_1, extHostStoragePaths_1, lifecycle_1, network_1, async_1, pfs_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ExtensionStoragePaths = void 0;
    class ExtensionStoragePaths extends extHostStoragePaths_1.ExtensionStoragePaths {
        constructor() {
            super(...arguments);
            this._workspaceStorageLock = null;
        }
        async _getWorkspaceStorageURI(storageName) {
            const workspaceStorageURI = await super._getWorkspaceStorageURI(storageName);
            if (workspaceStorageURI.scheme !== network_1.Schemas.file) {
                return workspaceStorageURI;
            }
            if (this._environment.skipWorkspaceStorageLock) {
                this._logService.info(`Skipping acquiring lock for ${workspaceStorageURI.fsPath}.`);
                return workspaceStorageURI;
            }
            const workspaceStorageBase = workspaceStorageURI.fsPath;
            let attempt = 0;
            do {
                let workspaceStoragePath;
                if (attempt === 0) {
                    workspaceStoragePath = workspaceStorageBase;
                }
                else {
                    workspaceStoragePath = (/[/\\]$/.test(workspaceStorageBase)
                        ? `${workspaceStorageBase.substr(0, workspaceStorageBase.length - 1)}-${attempt}`
                        : `${workspaceStorageBase}-${attempt}`);
                }
                await mkdir(workspaceStoragePath);
                const lockfile = path.join(workspaceStoragePath, 'vscode.lock');
                const lock = await tryAcquireLock(this._logService, lockfile, false);
                if (lock) {
                    this._workspaceStorageLock = lock;
                    process.on('exit', () => {
                        lock.dispose();
                    });
                    return uri_1.URI.file(workspaceStoragePath);
                }
                attempt++;
            } while (attempt < 10);
            // just give up
            return workspaceStorageURI;
        }
        onWillDeactivateAll() {
            // the lock will be released soon
            this._workspaceStorageLock?.setWillRelease(6000);
        }
    }
    exports.ExtensionStoragePaths = ExtensionStoragePaths;
    async function mkdir(dir) {
        try {
            await pfs_1.Promises.stat(dir);
            return;
        }
        catch {
            // doesn't exist, that's OK
        }
        try {
            await pfs_1.Promises.mkdir(dir, { recursive: true });
        }
        catch {
        }
    }
    const MTIME_UPDATE_TIME = 1000; // 1s
    const STALE_LOCK_TIME = 10 * 60 * 1000; // 10 minutes
    class Lock extends lifecycle_1.Disposable {
        constructor(logService, filename) {
            super();
            this.logService = logService;
            this.filename = filename;
            this._timer = this._register(new async_1.IntervalTimer());
            this._timer.cancelAndSet(async () => {
                const contents = await readLockfileContents(logService, filename);
                if (!contents || contents.pid !== process.pid) {
                    // we don't hold the lock anymore ...
                    logService.info(`Lock '${filename}': The lock was lost unexpectedly.`);
                    this._timer.cancel();
                }
                try {
                    await pfs_1.Promises.utimes(filename, new Date(), new Date());
                }
                catch (err) {
                    logService.error(err);
                    logService.info(`Lock '${filename}': Could not update mtime.`);
                }
            }, MTIME_UPDATE_TIME);
        }
        dispose() {
            super.dispose();
            try {
                fs.unlinkSync(this.filename);
            }
            catch (err) { }
        }
        async setWillRelease(timeUntilReleaseMs) {
            this.logService.info(`Lock '${this.filename}': Marking the lockfile as scheduled to be released in ${timeUntilReleaseMs} ms.`);
            try {
                const contents = {
                    pid: process.pid,
                    willReleaseAt: Date.now() + timeUntilReleaseMs
                };
                await pfs_1.Promises.writeFile(this.filename, JSON.stringify(contents), { flag: 'w' });
            }
            catch (err) {
                this.logService.error(err);
            }
        }
    }
    /**
     * Attempt to acquire a lock on a directory.
     * This does not use the real `flock`, but uses a file.
     * @returns a disposable if the lock could be acquired or null if it could not.
     */
    async function tryAcquireLock(logService, filename, isSecondAttempt) {
        try {
            const contents = {
                pid: process.pid,
                willReleaseAt: 0
            };
            await pfs_1.Promises.writeFile(filename, JSON.stringify(contents), { flag: 'wx' });
        }
        catch (err) {
            logService.error(err);
        }
        // let's see if we got the lock
        const contents = await readLockfileContents(logService, filename);
        if (!contents || contents.pid !== process.pid) {
            // we didn't get the lock
            if (isSecondAttempt) {
                logService.info(`Lock '${filename}': Could not acquire lock, giving up.`);
                return null;
            }
            logService.info(`Lock '${filename}': Could not acquire lock, checking if the file is stale.`);
            return checkStaleAndTryAcquireLock(logService, filename);
        }
        // we got the lock
        logService.info(`Lock '${filename}': Lock acquired.`);
        return new Lock(logService, filename);
    }
    /**
     * @returns 0 if the pid cannot be read
     */
    async function readLockfileContents(logService, filename) {
        let contents;
        try {
            contents = await pfs_1.Promises.readFile(filename);
        }
        catch (err) {
            // cannot read the file
            logService.error(err);
            return null;
        }
        try {
            return JSON.parse(String(contents));
        }
        catch (err) {
            // cannot parse the file
            logService.error(err);
            return null;
        }
    }
    /**
     * @returns 0 if the mtime cannot be read
     */
    async function readmtime(logService, filename) {
        let stats;
        try {
            stats = await pfs_1.Promises.stat(filename);
        }
        catch (err) {
            // cannot read the file stats to check if it is stale or not
            logService.error(err);
            return 0;
        }
        return stats.mtime.getTime();
    }
    function processExists(pid) {
        try {
            process.kill(pid, 0); // throws an exception if the process doesn't exist anymore.
            return true;
        }
        catch (e) {
            return false;
        }
    }
    async function checkStaleAndTryAcquireLock(logService, filename) {
        const contents = await readLockfileContents(logService, filename);
        if (!contents) {
            logService.info(`Lock '${filename}': Could not read pid of lock holder.`);
            return tryDeleteAndAcquireLock(logService, filename);
        }
        if (contents.willReleaseAt) {
            let timeUntilRelease = contents.willReleaseAt - Date.now();
            if (timeUntilRelease < 5000) {
                if (timeUntilRelease > 0) {
                    logService.info(`Lock '${filename}': The lockfile is scheduled to be released in ${timeUntilRelease} ms.`);
                }
                else {
                    logService.info(`Lock '${filename}': The lockfile is scheduled to have been released.`);
                }
                while (timeUntilRelease > 0) {
                    await (0, async_1.timeout)(Math.min(100, timeUntilRelease));
                    const mtime = await readmtime(logService, filename);
                    if (mtime === 0) {
                        // looks like the lock was released
                        return tryDeleteAndAcquireLock(logService, filename);
                    }
                    timeUntilRelease = contents.willReleaseAt - Date.now();
                }
                return tryDeleteAndAcquireLock(logService, filename);
            }
        }
        if (!processExists(contents.pid)) {
            logService.info(`Lock '${filename}': The pid ${contents.pid} appears to be gone.`);
            return tryDeleteAndAcquireLock(logService, filename);
        }
        const mtime1 = await readmtime(logService, filename);
        const elapsed1 = Date.now() - mtime1;
        if (elapsed1 <= STALE_LOCK_TIME) {
            // the lock does not look stale
            logService.info(`Lock '${filename}': The lock does not look stale, elapsed: ${elapsed1} ms, giving up.`);
            return null;
        }
        // the lock holder updates the mtime every 1s.
        // let's give it a chance to update the mtime
        // in case of a wake from sleep or something similar
        logService.info(`Lock '${filename}': The lock looks stale, waiting for 2s.`);
        await (0, async_1.timeout)(2000);
        const mtime2 = await readmtime(logService, filename);
        const elapsed2 = Date.now() - mtime2;
        if (elapsed2 <= STALE_LOCK_TIME) {
            // the lock does not look stale
            logService.info(`Lock '${filename}': The lock does not look stale, elapsed: ${elapsed2} ms, giving up.`);
            return null;
        }
        // the lock looks stale
        logService.info(`Lock '${filename}': The lock looks stale even after waiting for 2s.`);
        return tryDeleteAndAcquireLock(logService, filename);
    }
    async function tryDeleteAndAcquireLock(logService, filename) {
        logService.info(`Lock '${filename}': Deleting a stale lock.`);
        try {
            await pfs_1.Promises.unlink(filename);
        }
        catch (err) {
            // cannot delete the file
            // maybe the file is already deleted
        }
        return tryAcquireLock(logService, filename, true);
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0SG9zdFN0b3JhZ2VQYXRocy5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9hcGkvbm9kZS9leHRIb3N0U3RvcmFnZVBhdGhzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQVloRyxNQUFhLHFCQUFzQixTQUFRLDJDQUEyQjtRQUF0RTs7WUFFUywwQkFBcUIsR0FBZ0IsSUFBSSxDQUFDO1FBa0RuRCxDQUFDO1FBaERtQixLQUFLLENBQUMsdUJBQXVCLENBQUMsV0FBbUI7WUFDbkUsTUFBTSxtQkFBbUIsR0FBRyxNQUFNLEtBQUssQ0FBQyx1QkFBdUIsQ0FBQyxXQUFXLENBQUMsQ0FBQztZQUM3RSxJQUFJLG1CQUFtQixDQUFDLE1BQU0sS0FBSyxpQkFBTyxDQUFDLElBQUksRUFBRTtnQkFDaEQsT0FBTyxtQkFBbUIsQ0FBQzthQUMzQjtZQUVELElBQUksSUFBSSxDQUFDLFlBQVksQ0FBQyx3QkFBd0IsRUFBRTtnQkFDL0MsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsK0JBQStCLG1CQUFtQixDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUM7Z0JBQ3BGLE9BQU8sbUJBQW1CLENBQUM7YUFDM0I7WUFFRCxNQUFNLG9CQUFvQixHQUFHLG1CQUFtQixDQUFDLE1BQU0sQ0FBQztZQUN4RCxJQUFJLE9BQU8sR0FBRyxDQUFDLENBQUM7WUFDaEIsR0FBRztnQkFDRixJQUFJLG9CQUE0QixDQUFDO2dCQUNqQyxJQUFJLE9BQU8sS0FBSyxDQUFDLEVBQUU7b0JBQ2xCLG9CQUFvQixHQUFHLG9CQUFvQixDQUFDO2lCQUM1QztxQkFBTTtvQkFDTixvQkFBb0IsR0FBRyxDQUN0QixRQUFRLENBQUMsSUFBSSxDQUFDLG9CQUFvQixDQUFDO3dCQUNsQyxDQUFDLENBQUMsR0FBRyxvQkFBb0IsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLG9CQUFv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