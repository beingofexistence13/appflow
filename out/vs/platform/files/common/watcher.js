/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/glob", "vs/base/common/lifecycle", "vs/base/common/path", "vs/base/common/platform", "vs/base/common/uri", "vs/platform/files/common/files"], function (require, exports, glob_1, lifecycle_1, path_1, platform_1, uri_1, files_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.parseWatcherPatterns = exports.normalizeWatcherPattern = exports.coalesceEvents = exports.toFileChanges = exports.AbstractUniversalWatcherClient = exports.AbstractNonRecursiveWatcherClient = exports.AbstractWatcherClient = exports.isRecursiveWatchRequest = void 0;
    function isRecursiveWatchRequest(request) {
        return request.recursive === true;
    }
    exports.isRecursiveWatchRequest = isRecursiveWatchRequest;
    class AbstractWatcherClient extends lifecycle_1.Disposable {
        static { this.MAX_RESTARTS = 5; }
        constructor(onFileChanges, onLogMessage, verboseLogging, options) {
            super();
            this.onFileChanges = onFileChanges;
            this.onLogMessage = onLogMessage;
            this.verboseLogging = verboseLogging;
            this.options = options;
            this.watcherDisposables = this._register(new lifecycle_1.MutableDisposable());
            this.requests = undefined;
            this.restartCounter = 0;
        }
        init() {
            // Associate disposables to the watcher
            const disposables = new lifecycle_1.DisposableStore();
            this.watcherDisposables.value = disposables;
            // Ask implementors to create the watcher
            this.watcher = this.createWatcher(disposables);
            this.watcher.setVerboseLogging(this.verboseLogging);
            // Wire in event handlers
            disposables.add(this.watcher.onDidChangeFile(changes => this.onFileChanges(changes)));
            disposables.add(this.watcher.onDidLogMessage(msg => this.onLogMessage(msg)));
            disposables.add(this.watcher.onDidError(error => this.onError(error)));
        }
        onError(error) {
            // Restart on error (up to N times, if enabled)
            if (this.options.restartOnError) {
                if (this.restartCounter < AbstractWatcherClient.MAX_RESTARTS && this.requests) {
                    this.error(`restarting watcher after error: ${error}`);
                    this.restart(this.requests);
                }
                else {
                    this.error(`gave up attempting to restart watcher after error: ${error}`);
                }
            }
            // Do not attempt to restart if not enabled
            else {
                this.error(error);
            }
        }
        restart(requests) {
            this.restartCounter++;
            this.init();
            this.watch(requests);
        }
        async watch(requests) {
            this.requests = requests;
            await this.watcher?.watch(requests);
        }
        async setVerboseLogging(verboseLogging) {
            this.verboseLogging = verboseLogging;
            await this.watcher?.setVerboseLogging(verboseLogging);
        }
        error(message) {
            this.onLogMessage({ type: 'error', message: `[File Watcher (${this.options.type})] ${message}` });
        }
        trace(message) {
            this.onLogMessage({ type: 'trace', message: `[File Watcher (${this.options.type})] ${message}` });
        }
        dispose() {
            // Render the watcher invalid from here
            this.watcher = undefined;
            return super.dispose();
        }
    }
    exports.AbstractWatcherClient = AbstractWatcherClient;
    class AbstractNonRecursiveWatcherClient extends AbstractWatcherClient {
        constructor(onFileChanges, onLogMessage, verboseLogging) {
            super(onFileChanges, onLogMessage, verboseLogging, { type: 'node.js', restartOnError: false });
        }
    }
    exports.AbstractNonRecursiveWatcherClient = AbstractNonRecursiveWatcherClient;
    class AbstractUniversalWatcherClient extends AbstractWatcherClient {
        constructor(onFileChanges, onLogMessage, verboseLogging) {
            super(onFileChanges, onLogMessage, verboseLogging, { type: 'universal', restartOnError: true });
        }
    }
    exports.AbstractUniversalWatcherClient = AbstractUniversalWatcherClient;
    function toFileChanges(changes) {
        return changes.map(change => ({
            type: change.type,
            resource: uri_1.URI.file(change.path)
        }));
    }
    exports.toFileChanges = toFileChanges;
    function coalesceEvents(changes) {
        // Build deltas
        const coalescer = new EventCoalescer();
        for (const event of changes) {
            coalescer.processEvent(event);
        }
        return coalescer.coalesce();
    }
    exports.coalesceEvents = coalesceEvents;
    function normalizeWatcherPattern(path, pattern) {
        // Patterns are always matched on the full absolute path
        // of the event. As such, if the pattern is not absolute
        // and is a string and does not start with a leading
        // `**`, we have to convert it to a relative pattern with
        // the given `base`
        if (typeof pattern === 'string' && !pattern.startsWith(glob_1.GLOBSTAR) && !(0, path_1.isAbsolute)(pattern)) {
            return { base: path, pattern };
        }
        return pattern;
    }
    exports.normalizeWatcherPattern = normalizeWatcherPattern;
    function parseWatcherPatterns(path, patterns) {
        const parsedPatterns = [];
        for (const pattern of patterns) {
            parsedPatterns.push((0, glob_1.parse)(normalizeWatcherPattern(path, pattern)));
        }
        return parsedPatterns;
    }
    exports.parseWatcherPatterns = parseWatcherPatterns;
    class EventCoalescer {
        constructor() {
            this.coalesced = new Set();
            this.mapPathToChange = new Map();
        }
        toKey(event) {
            if (platform_1.isLinux) {
                return event.path;
            }
            return event.path.toLowerCase(); // normalise to file system case sensitivity
        }
        processEvent(event) {
            const existingEvent = this.mapPathToChange.get(this.toKey(event));
            let keepEvent = false;
            // Event path already exists
            if (existingEvent) {
                const currentChangeType = existingEvent.type;
                const newChangeType = event.type;
                // macOS/Windows: track renames to different case
                // by keeping both CREATE and DELETE events
                if (existingEvent.path !== event.path && (event.type === 2 /* FileChangeType.DELETED */ || event.type === 1 /* FileChangeType.ADDED */)) {
                    keepEvent = true;
                }
                // Ignore CREATE followed by DELETE in one go
                else if (currentChangeType === 1 /* FileChangeType.ADDED */ && newChangeType === 2 /* FileChangeType.DELETED */) {
                    this.mapPathToChange.delete(this.toKey(event));
                    this.coalesced.delete(existingEvent);
                }
                // Flatten DELETE followed by CREATE into CHANGE
                else if (currentChangeType === 2 /* FileChangeType.DELETED */ && newChangeType === 1 /* FileChangeType.ADDED */) {
                    existingEvent.type = 0 /* FileChangeType.UPDATED */;
                }
                // Do nothing. Keep the created event
                else if (currentChangeType === 1 /* FileChangeType.ADDED */ && newChangeType === 0 /* FileChangeType.UPDATED */) { }
                // Otherwise apply change type
                else {
                    existingEvent.type = newChangeType;
                }
            }
            // Otherwise keep
            else {
                keepEvent = true;
            }
            if (keepEvent) {
                this.coalesced.add(event);
                this.mapPathToChange.set(this.toKey(event), event);
            }
        }
        coalesce() {
            const addOrChangeEvents = [];
            const deletedPaths = [];
            // This algorithm will remove all DELETE events up to the root folder
            // that got deleted if any. This ensures that we are not producing
            // DELETE events for each file inside a folder that gets deleted.
            //
            // 1.) split ADD/CHANGE and DELETED events
            // 2.) sort short deleted paths to the top
            // 3.) for each DELETE, check if there is a deleted parent and ignore the event in that case
            return Array.from(this.coalesced).filter(e => {
                if (e.type !== 2 /* FileChangeType.DELETED */) {
                    addOrChangeEvents.push(e);
                    return false; // remove ADD / CHANGE
                }
                return true; // keep DELETE
            }).sort((e1, e2) => {
                return e1.path.length - e2.path.length; // shortest path first
            }).filter(e => {
                if (deletedPaths.some(deletedPath => (0, files_1.isParent)(e.path, deletedPath, !platform_1.isLinux /* ignorecase */))) {
                    return false; // DELETE is ignored if parent is deleted already
                }
                // otherwise mark as deleted
                deletedPaths.push(e.path);
                return true;
            }).concat(addOrChangeEvents);
        }
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2F0Y2hlci5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3BsYXRmb3JtL2ZpbGVzL2NvbW1vbi93YXRjaGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQXlEaEcsU0FBZ0IsdUJBQXVCLENBQUMsT0FBc0I7UUFDN0QsT0FBTyxPQUFPLENBQUMsU0FBUyxLQUFLLElBQUksQ0FBQztJQUNuQyxDQUFDO0lBRkQsMERBRUM7SUE0RUQsTUFBc0IscUJBQXNCLFNBQVEsc0JBQVU7aUJBRXJDLGlCQUFZLEdBQUcsQ0FBQyxBQUFKLENBQUs7UUFTekMsWUFDa0IsYUFBbUQsRUFDbkQsWUFBd0MsRUFDakQsY0FBdUIsRUFDdkIsT0FHUDtZQUVELEtBQUssRUFBRSxDQUFDO1lBUlMsa0JBQWEsR0FBYixhQUFhLENBQXNDO1lBQ25ELGlCQUFZLEdBQVosWUFBWSxDQUE0QjtZQUNqRCxtQkFBYyxHQUFkLGNBQWMsQ0FBUztZQUN2QixZQUFPLEdBQVAsT0FBTyxDQUdkO1lBYmUsdUJBQWtCLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLDZCQUFpQixFQUFFLENBQUMsQ0FBQztZQUV0RSxhQUFRLEdBQWdDLFNBQVMsQ0FBQztZQUVsRCxtQkFBYyxHQUFHLENBQUMsQ0FBQztRQVkzQixDQUFDO1FBSVMsSUFBSTtZQUViLHVDQUF1QztZQUN2QyxNQUFNLFdBQVcsR0FBRyxJQUFJLDJCQUFlLEVBQUUsQ0FBQztZQUMxQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsS0FBSyxHQUFHLFdBQVcsQ0FBQztZQUU1Qyx5Q0FBeUM7WUFDekMsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLFdBQVcsQ0FBQyxDQUFDO1lBQy9DLElBQUksQ0FBQyxPQUFPLENBQUMsaUJBQWlCLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDO1lBRXBELHlCQUF5QjtZQUN6QixXQUFXLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsZUFBZSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDdEYsV0FBVyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLGVBQWUsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzdFLFdBQVcsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUN4RSxDQUFDO1FBRVMsT0FBTyxDQUFDLEtBQWE7WUFFOUIsK0NBQStDO1lBQy9DLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxjQUFjLEVBQUU7Z0JBQ2hDLElBQUksSUFBSSxDQUFDLGNBQWMsR0FBRyxxQkFBcUIsQ0FBQyxZQUFZLElBQUksSUFBSSxDQUFDLFFBQVEsRUFBRTtvQkFDOUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxtQ0FBbUMsS0FBSyxFQUFFLENBQUMsQ0FBQztvQkFDdkQsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7aUJBQzVCO3FCQUFNO29CQUNOLElBQUksQ0FBQyxLQUFLLENBQUMsc0RBQXNELEtBQUssRUFBRSxDQUFDLENBQUM7aUJBQzFFO2FBQ0Q7WUFFRCwyQ0FBMkM7aUJBQ3RDO2dCQUNKLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUM7YUFDbEI7UUFDRixDQUFDO1FBRU8sT0FBTyxDQUFDLFFBQWtDO1lBQ2pELElBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQztZQUV0QixJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7WUFDWixJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQ3RCLENBQUM7UUFFRCxLQUFLLENBQUMsS0FBSyxDQUFDLFFBQWtDO1lBQzdDLElBQUksQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFDO1lBRXpCLE1BQU0sSUFBSSxDQUFDLE9BQU8sRUFBRSxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDckMsQ0FBQztRQUVELEtBQUssQ0FBQyxpQkFBaUIsQ0FBQyxjQUF1QjtZQUM5QyxJQUFJLENBQUMsY0FBYyxHQUFHLGNBQWMsQ0FBQztZQUVyQyxNQUFNLElBQUksQ0FBQyxPQUFPLEVBQUUsaUJBQWlCLENBQUMsY0FBYyxDQUFDLENBQUM7UUFDdkQsQ0FBQztRQUVPLEtBQUssQ0FBQyxPQUFlO1lBQzVCLElBQUksQ0FBQyxZQUFZLENBQUMsRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxrQkFBa0IsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLE1BQU0sT0FBTyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQ25HLENBQUM7UUFFUyxLQUFLLENBQUMsT0FBZTtZQUM5QixJQUFJLENBQUMsWUFBWSxDQUFDLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsa0JBQWtCLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxNQUFNLE9BQU8sRUFBRSxFQUFFLENBQUMsQ0FBQztRQUNuRyxDQUFDO1FBRVEsT0FBTztZQUVmLHVDQUF1QztZQUN2QyxJQUFJLENBQUMsT0FBTyxHQUFHLFNBQVMsQ0FBQztZQUV6QixPQUFPLEtBQUssQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUN4QixDQUFDOztJQTVGRixzREE2RkM7SUFFRCxNQUFzQixpQ0FBa0MsU0FBUSxxQkFBcUI7UUFFcEYsWUFDQyxhQUFtRCxFQUNuRCxZQUF3QyxFQUN4QyxjQUF1QjtZQUV2QixLQUFLLENBQUMsYUFBYSxFQUFFLFlBQVksRUFBRSxjQUFjLEVBQUUsRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFLGNBQWMsRUFBRSxLQUFLLEVBQUUsQ0FBQyxDQUFDO1FBQ2hHLENBQUM7S0FHRDtJQVhELDhFQVdDO0lBRUQsTUFBc0IsOEJBQStCLFNBQVEscUJBQXFCO1FBRWpGLFlBQ0MsYUFBbUQsRUFDbkQsWUFBd0MsRUFDeEMsY0FBdUI7WUFFdkIsS0FBSyxDQUFDLGFBQWEsRUFBRSxZQUFZLEVBQUUsY0FBYyxFQUFFLEVBQUUsSUFBSSxFQUFFLFdBQVcsRUFBRSxjQUFjLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQztRQUNqRyxDQUFDO0tBR0Q7SUFYRCx3RUFXQztJQVlELFNBQWdCLGFBQWEsQ0FBQyxPQUEwQjtRQUN2RCxPQUFPLE9BQU8sQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQzdCLElBQUksRUFBRSxNQUFNLENBQUMsSUFBSTtZQUNqQixRQUFRLEVBQUUsU0FBRyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDO1NBQy9CLENBQUMsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztJQUxELHNDQUtDO0lBRUQsU0FBZ0IsY0FBYyxDQUFDLE9BQTBCO1FBRXhELGVBQWU7UUFDZixNQUFNLFNBQVMsR0FBRyxJQUFJLGNBQWMsRUFBRSxDQUFDO1FBQ3ZDLEtBQUssTUFBTSxLQUFLLElBQUksT0FBTyxFQUFFO1lBQzVCLFNBQVMsQ0FBQyxZQUFZLENBQUMsS0FBSyxDQUFDLENBQUM7U0FDOUI7UUFFRCxPQUFPLFNBQVMsQ0FBQyxRQUFRLEVBQUUsQ0FBQztJQUM3QixDQUFDO0lBVEQsd0NBU0M7SUFFRCxTQUFnQix1QkFBdUIsQ0FBQyxJQUFZLEVBQUUsT0FBa0M7UUFFdkYsd0RBQXdEO1FBQ3hELHdEQUF3RDtRQUN4RCxvREFBb0Q7UUFDcEQseURBQXlEO1FBQ3pELG1CQUFtQjtRQUVuQixJQUFJLE9BQU8sT0FBTyxLQUFLLFFBQVEsSUFBSSxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsZUFBUSxDQUFDLElBQUksQ0FBQyxJQUFBLGlCQUFVLEVBQUMsT0FBTyxDQUFDLEVBQUU7WUFDekYsT0FBTyxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFFLENBQUM7U0FDL0I7UUFFRCxPQUFPLE9BQU8sQ0FBQztJQUNoQixDQUFDO0lBYkQsMERBYUM7SUFFRCxTQUFnQixvQkFBb0IsQ0FBQyxJQUFZLEVBQUUsUUFBMEM7UUFDNUYsTUFBTSxjQUFjLEdBQW9CLEVBQUUsQ0FBQztRQUUzQyxLQUFLLE1BQU0sT0FBTyxJQUFJLFFBQVEsRUFBRTtZQUMvQixjQUFjLENBQUMsSUFBSSxDQUFDLElBQUEsWUFBSyxFQUFDLHVCQUF1QixDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUM7U0FDbkU7UUFFRCxPQUFPLGNBQWMsQ0FBQztJQUN2QixDQUFDO0lBUkQsb0RBUUM7SUFFRCxNQUFNLGNBQWM7UUFBcEI7WUFFa0IsY0FBUyxHQUFHLElBQUksR0FBRyxFQUFtQixDQUFDO1lBQ3ZDLG9CQUFlLEdBQUcsSUFBSSxHQUFHLEVBQTJCLENBQUM7UUF5RnZFLENBQUM7UUF2RlEsS0FBSyxDQUFDLEtBQXNCO1lBQ25DLElBQUksa0JBQU8sRUFBRTtnQkFDWixPQUFPLEtBQUssQ0FBQyxJQUFJLENBQUM7YUFDbEI7WUFFRCxPQUFPLEtBQUssQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQyw0Q0FBNEM7UUFDOUUsQ0FBQztRQUVELFlBQVksQ0FBQyxLQUFzQjtZQUNsQyxNQUFNLGFBQWEsR0FBRyxJQUFJLENBQUMsZUFBZSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7WUFFbEUsSUFBSSxTQUFTLEdBQUcsS0FBSyxDQUFDO1lBRXRCLDRCQUE0QjtZQUM1QixJQUFJLGFBQWEsRUFBRTtnQkFDbEIsTUFBTSxpQkFBaUIsR0FBRyxhQUFhLENBQUMsSUFBSSxDQUFDO2dCQUM3QyxNQUFNLGFBQWEsR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFDO2dCQUVqQyxpREFBaUQ7Z0JBQ2pELDJDQUEyQztnQkFDM0MsSUFBSSxhQUFhLENBQUMsSUFBSSxLQUFLLEtBQUssQ0FBQyxJQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxtQ0FBMkIsSUFBSSxLQUFLLENBQUMsSUFBSSxpQ0FBeUIsQ0FBQyxFQUFFO29CQUN4SCxTQUFTLEdBQUcsSUFBSSxDQUFDO2lCQUNqQjtnQkFFRCw2Q0FBNkM7cUJBQ3hDLElBQUksaUJBQWlCLGlDQUF5QixJQUFJLGFBQWEsbUNBQTJCLEVBQUU7b0JBQ2hHLElBQUksQ0FBQyxlQUFlLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztvQkFDL0MsSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsYUFBYSxDQUFDLENBQUM7aUJBQ3JDO2dCQUVELGdEQUFnRDtxQkFDM0MsSUFBSSxpQkFBaUIsbUNBQTJCLElBQUksYUFBYSxpQ0FBeUIsRUFBRTtvQkFDaEcsYUFBYSxDQUFDLElBQUksaUNBQXlCLENBQUM7aUJBQzVDO2dCQUVELHFDQUFxQztxQkFDaEMsSUFBSSxpQkFBaUIsaUNBQXlCLElBQUksYUFBYSxtQ0FBMkIsRUFBRSxHQUFHO2dCQUVwRyw4QkFBOEI7cUJBQ3pCO29CQUNKLGFBQWEsQ0FBQyxJQUFJLEdBQUcsYUFBYSxDQUFDO2lCQUNuQzthQUNEO1lBRUQsaUJBQWlCO2lCQUNaO2dCQUNKLFNBQVMsR0FBRyxJQUFJLENBQUM7YUFDakI7WUFFRCxJQUFJLFNBQVMsRUFBRTtnQkFDZCxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQztnQkFDMUIsSUFBSSxDQUFDLGVBQWUsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQzthQUNuRDtRQUNGLENBQUM7UUFFRCxRQUFRO1lBQ1AsTUFBTSxpQkFBaUIsR0FBc0IsRUFBRSxDQUFDO1lBQ2hELE1BQU0sWUFBWSxHQUFhLEVBQUUsQ0FBQztZQUVsQyxxRUFBcUU7WUFDckUsa0VBQWtFO1lBQ2xFLGlFQUFpRTtZQUNqRSxFQUFFO1lBQ0YsMENBQTBDO1lBQzFDLDBDQUEwQztZQUMxQyw0RkFBNEY7WUFDNUYsT0FBTyxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUU7Z0JBQzVDLElBQUksQ0FBQyxDQUFDLElBQUksbUNBQTJCLEVBQUU7b0JBQ3RDLGlCQUFpQixDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFFMUIsT0FBTyxLQUFLLENBQUMsQ0FBQyxzQkFBc0I7aUJBQ3BDO2dCQUVELE9BQU8sSUFBSSxDQUFDLENBQUMsY0FBYztZQUM1QixDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUU7Z0JBQ2xCLE9BQU8sRUFBRSxDQUFDLElBQUksQ0FBQyxNQUFNLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxzQkFBc0I7WUFDL0QsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFO2dCQUNiLElBQUksWUFBWSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsRUFBRSxDQUFDLElBQUEsZ0JBQVEsRUFBQyxDQUFDLENBQUMsSUFBSSxFQUFFLFdBQVcsRUFBRSxDQUFDLGtCQUFPLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxFQUFFO29CQUMvRixPQUFPLEtBQUssQ0FBQyxDQUFDLGlEQUFpRDtpQkFDL0Q7Z0JBRUQsNEJBQTRCO2dCQUM1QixZQUFZLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFFMUIsT0FBTyxJQUFJLENBQUM7WUFDYixDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsaUJBQWlCLENBQUMsQ0FBQztRQUM5QixDQUFDO0tBQ0QifQ==