/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/arrays", "vs/base/common/async", "vs/base/common/errors", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/path", "vs/platform/files/common/watcher", "vs/platform/log/common/log"], function (require, exports, arrays_1, async_1, errors_1, event_1, lifecycle_1, path_1, watcher_1, log_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Mp = void 0;
    class $Mp extends lifecycle_1.$kc {
        constructor(a, b) {
            super();
            this.a = a;
            this.b = b;
            this.c = this.B(new event_1.$fd());
            this.onDidChangeFile = this.c.event;
            this.g = this.B(new event_1.$fd());
            this.onDidWatchError = this.g.event;
            this.j = [];
            this.m = this.B(new async_1.$Eg(0));
            this.w = [];
            this.y = this.B(new async_1.$Eg(0));
        }
        watch(resource, opts) {
            if (opts.recursive || this.b?.watcher?.forceUniversal) {
                return this.n(resource, opts);
            }
            return this.z(resource, opts);
        }
        n(resource, opts) {
            // Add to list of paths to watch universally
            const pathToWatch = { path: this.H(resource), excludes: opts.excludes, includes: opts.includes, recursive: opts.recursive };
            const remove = (0, arrays_1.$Sb)(this.j, pathToWatch);
            // Trigger update
            this.r();
            return (0, lifecycle_1.$ic)(() => {
                // Remove from list of paths to watch universally
                remove();
                // Trigger update
                this.r();
            });
        }
        r() {
            // Buffer requests for universal watching to decide on right watcher
            // that supports potentially watching more than one path at once
            this.m.trigger(() => {
                return this.s();
            }).catch(error => (0, errors_1.$Y)(error));
        }
        s() {
            // Create watcher if this is the first time
            if (!this.h) {
                this.h = this.B(this.t(changes => this.c.fire((0, watcher_1.$Ip)(changes)), msg => this.G(msg), this.a.getLevel() === log_1.LogLevel.Trace));
                // Apply log levels dynamically
                this.B(this.a.onDidChangeLogLevel(() => {
                    this.h?.setVerboseLogging(this.a.getLevel() === log_1.LogLevel.Trace);
                }));
            }
            // Adjust for polling
            const usePolling = this.b?.watcher?.recursive?.usePolling;
            if (usePolling === true) {
                for (const request of this.j) {
                    if ((0, watcher_1.$Ep)(request)) {
                        request.pollingInterval = this.b?.watcher?.recursive?.pollingInterval ?? 5000;
                    }
                }
            }
            else if (Array.isArray(usePolling)) {
                for (const request of this.j) {
                    if ((0, watcher_1.$Ep)(request)) {
                        if (usePolling.includes(request.path)) {
                            request.pollingInterval = this.b?.watcher?.recursive?.pollingInterval ?? 5000;
                        }
                    }
                }
            }
            // Ask to watch the provided paths
            return this.h.watch(this.j);
        }
        z(resource, opts) {
            // Add to list of paths to watch non-recursively
            const pathToWatch = { path: this.H(resource), excludes: opts.excludes, includes: opts.includes, recursive: false };
            const remove = (0, arrays_1.$Sb)(this.w, pathToWatch);
            // Trigger update
            this.C();
            return (0, lifecycle_1.$ic)(() => {
                // Remove from list of paths to watch non-recursively
                remove();
                // Trigger update
                this.C();
            });
        }
        C() {
            // Buffer requests for nonrecursive watching to decide on right watcher
            // that supports potentially watching more than one path at once
            this.y.trigger(() => {
                return this.D();
            }).catch(error => (0, errors_1.$Y)(error));
        }
        D() {
            // Create watcher if this is the first time
            if (!this.u) {
                this.u = this.B(this.F(changes => this.c.fire((0, watcher_1.$Ip)(changes)), msg => this.G(msg), this.a.getLevel() === log_1.LogLevel.Trace));
                // Apply log levels dynamically
                this.B(this.a.onDidChangeLogLevel(() => {
                    this.u?.setVerboseLogging(this.a.getLevel() === log_1.LogLevel.Trace);
                }));
            }
            // Ask to watch the provided paths
            return this.u.watch(this.w);
        }
        //#endregion
        G(msg) {
            if (msg.type === 'error') {
                this.g.fire(msg.message);
            }
            this.a[msg.type](msg.message);
        }
        H(resource) {
            return (0, path_1.$7d)(resource.fsPath);
        }
    }
    exports.$Mp = $Mp;
});
//# sourceMappingURL=diskFileSystemProvider.js.map