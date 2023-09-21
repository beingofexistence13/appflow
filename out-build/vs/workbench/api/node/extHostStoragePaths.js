/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "fs", "vs/base/common/path", "vs/base/common/uri", "vs/workbench/api/common/extHostStoragePaths", "vs/base/common/lifecycle", "vs/base/common/network", "vs/base/common/async", "vs/base/node/pfs"], function (require, exports, fs, path, uri_1, extHostStoragePaths_1, lifecycle_1, network_1, async_1, pfs_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Ydc = void 0;
    class $Ydc extends extHostStoragePaths_1.$Dbc {
        constructor() {
            super(...arguments);
            this.i = null;
        }
        async g(storageName) {
            const workspaceStorageURI = await super.g(storageName);
            if (workspaceStorageURI.scheme !== network_1.Schemas.file) {
                return workspaceStorageURI;
            }
            if (this.b.skipWorkspaceStorageLock) {
                this.d.info(`Skipping acquiring lock for ${workspaceStorageURI.fsPath}.`);
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
                const lockfile = path.$9d(workspaceStoragePath, 'vscode.lock');
                const lock = await tryAcquireLock(this.d, lockfile, false);
                if (lock) {
                    this.i = lock;
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
            this.i?.setWillRelease(6000);
        }
    }
    exports.$Ydc = $Ydc;
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
    class Lock extends lifecycle_1.$kc {
        constructor(b, c) {
            super();
            this.b = b;
            this.c = c;
            this.a = this.B(new async_1.$Rg());
            this.a.cancelAndSet(async () => {
                const contents = await readLockfileContents(b, c);
                if (!contents || contents.pid !== process.pid) {
                    // we don't hold the lock anymore ...
                    b.info(`Lock '${c}': The lock was lost unexpectedly.`);
                    this.a.cancel();
                }
                try {
                    await pfs_1.Promises.utimes(c, new Date(), new Date());
                }
                catch (err) {
                    b.error(err);
                    b.info(`Lock '${c}': Could not update mtime.`);
                }
            }, MTIME_UPDATE_TIME);
        }
        dispose() {
            super.dispose();
            try {
                fs.unlinkSync(this.c);
            }
            catch (err) { }
        }
        async setWillRelease(timeUntilReleaseMs) {
            this.b.info(`Lock '${this.c}': Marking the lockfile as scheduled to be released in ${timeUntilReleaseMs} ms.`);
            try {
                const contents = {
                    pid: process.pid,
                    willReleaseAt: Date.now() + timeUntilReleaseMs
                };
                await pfs_1.Promises.writeFile(this.c, JSON.stringify(contents), { flag: 'w' });
            }
            catch (err) {
                this.b.error(err);
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
                    await (0, async_1.$Hg)(Math.min(100, timeUntilRelease));
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
        await (0, async_1.$Hg)(2000);
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
//# sourceMappingURL=extHostStoragePaths.js.map