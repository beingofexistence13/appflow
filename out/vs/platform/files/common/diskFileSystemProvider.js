/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/arrays", "vs/base/common/async", "vs/base/common/errors", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/path", "vs/platform/files/common/watcher", "vs/platform/log/common/log"], function (require, exports, arrays_1, async_1, errors_1, event_1, lifecycle_1, path_1, watcher_1, log_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.AbstractDiskFileSystemProvider = void 0;
    class AbstractDiskFileSystemProvider extends lifecycle_1.Disposable {
        constructor(logService, options) {
            super();
            this.logService = logService;
            this.options = options;
            this._onDidChangeFile = this._register(new event_1.Emitter());
            this.onDidChangeFile = this._onDidChangeFile.event;
            this._onDidWatchError = this._register(new event_1.Emitter());
            this.onDidWatchError = this._onDidWatchError.event;
            this.universalPathsToWatch = [];
            this.universalWatchRequestDelayer = this._register(new async_1.ThrottledDelayer(0));
            this.nonRecursivePathsToWatch = [];
            this.nonRecursiveWatchRequestDelayer = this._register(new async_1.ThrottledDelayer(0));
        }
        watch(resource, opts) {
            if (opts.recursive || this.options?.watcher?.forceUniversal) {
                return this.watchUniversal(resource, opts);
            }
            return this.watchNonRecursive(resource, opts);
        }
        watchUniversal(resource, opts) {
            // Add to list of paths to watch universally
            const pathToWatch = { path: this.toFilePath(resource), excludes: opts.excludes, includes: opts.includes, recursive: opts.recursive };
            const remove = (0, arrays_1.insert)(this.universalPathsToWatch, pathToWatch);
            // Trigger update
            this.refreshUniversalWatchers();
            return (0, lifecycle_1.toDisposable)(() => {
                // Remove from list of paths to watch universally
                remove();
                // Trigger update
                this.refreshUniversalWatchers();
            });
        }
        refreshUniversalWatchers() {
            // Buffer requests for universal watching to decide on right watcher
            // that supports potentially watching more than one path at once
            this.universalWatchRequestDelayer.trigger(() => {
                return this.doRefreshUniversalWatchers();
            }).catch(error => (0, errors_1.onUnexpectedError)(error));
        }
        doRefreshUniversalWatchers() {
            // Create watcher if this is the first time
            if (!this.universalWatcher) {
                this.universalWatcher = this._register(this.createUniversalWatcher(changes => this._onDidChangeFile.fire((0, watcher_1.toFileChanges)(changes)), msg => this.onWatcherLogMessage(msg), this.logService.getLevel() === log_1.LogLevel.Trace));
                // Apply log levels dynamically
                this._register(this.logService.onDidChangeLogLevel(() => {
                    this.universalWatcher?.setVerboseLogging(this.logService.getLevel() === log_1.LogLevel.Trace);
                }));
            }
            // Adjust for polling
            const usePolling = this.options?.watcher?.recursive?.usePolling;
            if (usePolling === true) {
                for (const request of this.universalPathsToWatch) {
                    if ((0, watcher_1.isRecursiveWatchRequest)(request)) {
                        request.pollingInterval = this.options?.watcher?.recursive?.pollingInterval ?? 5000;
                    }
                }
            }
            else if (Array.isArray(usePolling)) {
                for (const request of this.universalPathsToWatch) {
                    if ((0, watcher_1.isRecursiveWatchRequest)(request)) {
                        if (usePolling.includes(request.path)) {
                            request.pollingInterval = this.options?.watcher?.recursive?.pollingInterval ?? 5000;
                        }
                    }
                }
            }
            // Ask to watch the provided paths
            return this.universalWatcher.watch(this.universalPathsToWatch);
        }
        watchNonRecursive(resource, opts) {
            // Add to list of paths to watch non-recursively
            const pathToWatch = { path: this.toFilePath(resource), excludes: opts.excludes, includes: opts.includes, recursive: false };
            const remove = (0, arrays_1.insert)(this.nonRecursivePathsToWatch, pathToWatch);
            // Trigger update
            this.refreshNonRecursiveWatchers();
            return (0, lifecycle_1.toDisposable)(() => {
                // Remove from list of paths to watch non-recursively
                remove();
                // Trigger update
                this.refreshNonRecursiveWatchers();
            });
        }
        refreshNonRecursiveWatchers() {
            // Buffer requests for nonrecursive watching to decide on right watcher
            // that supports potentially watching more than one path at once
            this.nonRecursiveWatchRequestDelayer.trigger(() => {
                return this.doRefreshNonRecursiveWatchers();
            }).catch(error => (0, errors_1.onUnexpectedError)(error));
        }
        doRefreshNonRecursiveWatchers() {
            // Create watcher if this is the first time
            if (!this.nonRecursiveWatcher) {
                this.nonRecursiveWatcher = this._register(this.createNonRecursiveWatcher(changes => this._onDidChangeFile.fire((0, watcher_1.toFileChanges)(changes)), msg => this.onWatcherLogMessage(msg), this.logService.getLevel() === log_1.LogLevel.Trace));
                // Apply log levels dynamically
                this._register(this.logService.onDidChangeLogLevel(() => {
                    this.nonRecursiveWatcher?.setVerboseLogging(this.logService.getLevel() === log_1.LogLevel.Trace);
                }));
            }
            // Ask to watch the provided paths
            return this.nonRecursiveWatcher.watch(this.nonRecursivePathsToWatch);
        }
        //#endregion
        onWatcherLogMessage(msg) {
            if (msg.type === 'error') {
                this._onDidWatchError.fire(msg.message);
            }
            this.logService[msg.type](msg.message);
        }
        toFilePath(resource) {
            return (0, path_1.normalize)(resource.fsPath);
        }
    }
    exports.AbstractDiskFileSystemProvider = AbstractDiskFileSystemProvider;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGlza0ZpbGVTeXN0ZW1Qcm92aWRlci5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3BsYXRmb3JtL2ZpbGVzL2NvbW1vbi9kaXNrRmlsZVN5c3RlbVByb3ZpZGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQW1DaEcsTUFBc0IsOEJBQStCLFNBQVEsc0JBQVU7UUFLdEUsWUFDb0IsVUFBdUIsRUFDekIsT0FBd0M7WUFFekQsS0FBSyxFQUFFLENBQUM7WUFIVyxlQUFVLEdBQVYsVUFBVSxDQUFhO1lBQ3pCLFlBQU8sR0FBUCxPQUFPLENBQWlDO1lBS3ZDLHFCQUFnQixHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxlQUFPLEVBQTBCLENBQUMsQ0FBQztZQUNuRixvQkFBZSxHQUFHLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxLQUFLLENBQUM7WUFFcEMscUJBQWdCLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLGVBQU8sRUFBVSxDQUFDLENBQUM7WUFDbkUsb0JBQWUsR0FBRyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsS0FBSyxDQUFDO1lBY3RDLDBCQUFxQixHQUE2QixFQUFFLENBQUM7WUFDckQsaUNBQTRCLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLHdCQUFnQixDQUFPLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFnRjdFLDZCQUF3QixHQUFnQyxFQUFFLENBQUM7WUFDM0Qsb0NBQStCLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLHdCQUFnQixDQUFPLENBQUMsQ0FBQyxDQUFDLENBQUM7UUF0R2pHLENBQUM7UUFRRCxLQUFLLENBQUMsUUFBYSxFQUFFLElBQW1CO1lBQ3ZDLElBQUksSUFBSSxDQUFDLFNBQVMsSUFBSSxJQUFJLENBQUMsT0FBTyxFQUFFLE9BQU8sRUFBRSxjQUFjLEVBQUU7Z0JBQzVELE9BQU8sSUFBSSxD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