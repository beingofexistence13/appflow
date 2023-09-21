/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/glob", "vs/base/common/lifecycle", "vs/base/common/path", "vs/base/common/platform", "vs/base/common/uri", "vs/platform/files/common/files"], function (require, exports, glob_1, lifecycle_1, path_1, platform_1, uri_1, files_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Lp = exports.$Kp = exports.$Jp = exports.$Ip = exports.$Hp = exports.$Gp = exports.$Fp = exports.$Ep = void 0;
    function $Ep(request) {
        return request.recursive === true;
    }
    exports.$Ep = $Ep;
    class $Fp extends lifecycle_1.$kc {
        static { this.a = 5; }
        constructor(h, j, m, n) {
            super();
            this.h = h;
            this.j = j;
            this.m = m;
            this.n = n;
            this.c = this.B(new lifecycle_1.$lc());
            this.f = undefined;
            this.g = 0;
        }
        s() {
            // Associate disposables to the watcher
            const disposables = new lifecycle_1.$jc();
            this.c.value = disposables;
            // Ask implementors to create the watcher
            this.b = this.r(disposables);
            this.b.setVerboseLogging(this.m);
            // Wire in event handlers
            disposables.add(this.b.onDidChangeFile(changes => this.h(changes)));
            disposables.add(this.b.onDidLogMessage(msg => this.j(msg)));
            disposables.add(this.b.onDidError(error => this.t(error)));
        }
        t(error) {
            // Restart on error (up to N times, if enabled)
            if (this.n.restartOnError) {
                if (this.g < $Fp.a && this.f) {
                    this.w(`restarting watcher after error: ${error}`);
                    this.u(this.f);
                }
                else {
                    this.w(`gave up attempting to restart watcher after error: ${error}`);
                }
            }
            // Do not attempt to restart if not enabled
            else {
                this.w(error);
            }
        }
        u(requests) {
            this.g++;
            this.s();
            this.watch(requests);
        }
        async watch(requests) {
            this.f = requests;
            await this.b?.watch(requests);
        }
        async setVerboseLogging(verboseLogging) {
            this.m = verboseLogging;
            await this.b?.setVerboseLogging(verboseLogging);
        }
        w(message) {
            this.j({ type: 'error', message: `[File Watcher (${this.n.type})] ${message}` });
        }
        y(message) {
            this.j({ type: 'trace', message: `[File Watcher (${this.n.type})] ${message}` });
        }
        dispose() {
            // Render the watcher invalid from here
            this.b = undefined;
            return super.dispose();
        }
    }
    exports.$Fp = $Fp;
    class $Gp extends $Fp {
        constructor(onFileChanges, onLogMessage, verboseLogging) {
            super(onFileChanges, onLogMessage, verboseLogging, { type: 'node.js', restartOnError: false });
        }
    }
    exports.$Gp = $Gp;
    class $Hp extends $Fp {
        constructor(onFileChanges, onLogMessage, verboseLogging) {
            super(onFileChanges, onLogMessage, verboseLogging, { type: 'universal', restartOnError: true });
        }
    }
    exports.$Hp = $Hp;
    function $Ip(changes) {
        return changes.map(change => ({
            type: change.type,
            resource: uri_1.URI.file(change.path)
        }));
    }
    exports.$Ip = $Ip;
    function $Jp(changes) {
        // Build deltas
        const coalescer = new EventCoalescer();
        for (const event of changes) {
            coalescer.processEvent(event);
        }
        return coalescer.coalesce();
    }
    exports.$Jp = $Jp;
    function $Kp(path, pattern) {
        // Patterns are always matched on the full absolute path
        // of the event. As such, if the pattern is not absolute
        // and is a string and does not start with a leading
        // `**`, we have to convert it to a relative pattern with
        // the given `base`
        if (typeof pattern === 'string' && !pattern.startsWith(glob_1.$nj) && !(0, path_1.$8d)(pattern)) {
            return { base: path, pattern };
        }
        return pattern;
    }
    exports.$Kp = $Kp;
    function $Lp(path, patterns) {
        const parsedPatterns = [];
        for (const pattern of patterns) {
            parsedPatterns.push((0, glob_1.$rj)($Kp(path, pattern)));
        }
        return parsedPatterns;
    }
    exports.$Lp = $Lp;
    class EventCoalescer {
        constructor() {
            this.a = new Set();
            this.b = new Map();
        }
        c(event) {
            if (platform_1.$k) {
                return event.path;
            }
            return event.path.toLowerCase(); // normalise to file system case sensitivity
        }
        processEvent(event) {
            const existingEvent = this.b.get(this.c(event));
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
                    this.b.delete(this.c(event));
                    this.a.delete(existingEvent);
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
                this.a.add(event);
                this.b.set(this.c(event), event);
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
            return Array.from(this.a).filter(e => {
                if (e.type !== 2 /* FileChangeType.DELETED */) {
                    addOrChangeEvents.push(e);
                    return false; // remove ADD / CHANGE
                }
                return true; // keep DELETE
            }).sort((e1, e2) => {
                return e1.path.length - e2.path.length; // shortest path first
            }).filter(e => {
                if (deletedPaths.some(deletedPath => (0, files_1.$mk)(e.path, deletedPath, !platform_1.$k /* ignorecase */))) {
                    return false; // DELETE is ignored if parent is deleted already
                }
                // otherwise mark as deleted
                deletedPaths.push(e.path);
                return true;
            }).concat(addOrChangeEvents);
        }
    }
});
//# sourceMappingURL=watcher.js.map