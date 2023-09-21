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
define(["require", "exports", "vs/nls!vs/workbench/contrib/files/browser/workspaceWatcher", "vs/base/common/lifecycle", "vs/base/common/uri", "vs/platform/configuration/common/configuration", "vs/platform/workspace/common/workspace", "vs/base/common/map", "vs/platform/notification/common/notification", "vs/platform/opener/common/opener", "vs/base/common/path", "vs/platform/uriIdentity/common/uriIdentity", "vs/workbench/services/host/browser/host", "vs/workbench/services/files/common/files"], function (require, exports, nls_1, lifecycle_1, uri_1, configuration_1, workspace_1, map_1, notification_1, opener_1, path_1, uriIdentity_1, host_1, files_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$9Lb = void 0;
    let $9Lb = class $9Lb extends lifecycle_1.$kc {
        constructor(b, c, f, g, h, j, m) {
            super();
            this.b = b;
            this.c = c;
            this.f = f;
            this.g = g;
            this.h = h;
            this.j = j;
            this.m = m;
            this.a = new map_1.$zi(resource => this.j.extUri.getComparisonKey(resource));
            this.n();
            this.z();
        }
        n() {
            this.B(this.f.onDidChangeWorkspaceFolders(e => this.r(e)));
            this.B(this.f.onDidChangeWorkbenchState(() => this.s()));
            this.B(this.c.onDidChangeConfiguration(e => this.t(e)));
            this.B(this.b.onDidWatchError(error => this.u(error)));
        }
        r(e) {
            // Removed workspace: Unwatch
            for (const removed of e.removed) {
                this.y(removed);
            }
            // Added workspace: Watch
            for (const added of e.added) {
                this.w(added);
            }
        }
        s() {
            this.z();
        }
        t(e) {
            if (e.affectsConfiguration('files.watcherExclude') || e.affectsConfiguration('files.watcherInclude')) {
                this.z();
            }
        }
        u(error) {
            const msg = error.toString();
            // Detect if we run into ENOSPC issues
            if (msg.indexOf('ENOSPC') >= 0) {
                this.g.prompt(notification_1.Severity.Warning, (0, nls_1.localize)(0, null), [{
                        label: (0, nls_1.localize)(1, null),
                        run: () => this.h.open(uri_1.URI.parse('https://go.microsoft.com/fwlink/?linkid=867693'))
                    }], {
                    sticky: true,
                    neverShowAgain: { id: 'ignoreEnospcError', isSecondary: true, scope: notification_1.NeverShowAgainScope.WORKSPACE }
                });
            }
            // Detect when the watcher throws an error unexpectedly
            else if (msg.indexOf('EUNKNOWN') >= 0) {
                this.g.prompt(notification_1.Severity.Warning, (0, nls_1.localize)(2, null), [{
                        label: (0, nls_1.localize)(3, null),
                        run: () => this.m.reload()
                    }], {
                    sticky: true,
                    priority: notification_1.NotificationPriority.SILENT // reduce potential spam since we don't really know how often this fires
                });
            }
        }
        w(workspace) {
            // Compute the watcher exclude rules from configuration
            const excludes = [];
            const config = this.c.getValue({ resource: workspace.uri });
            if (config.files?.watcherExclude) {
                for (const key in config.files.watcherExclude) {
                    if (config.files.watcherExclude[key] === true) {
                        excludes.push(key);
                    }
                }
            }
            const pathsToWatch = new map_1.$zi(uri => this.j.extUri.getComparisonKey(uri));
            // Add the workspace as path to watch
            pathsToWatch.set(workspace.uri, workspace.uri);
            // Compute additional includes from configuration
            if (config.files?.watcherInclude) {
                for (const includePath of config.files.watcherInclude) {
                    if (!includePath) {
                        continue;
                    }
                    // Absolute: verify a child of the workspace
                    if ((0, path_1.$8d)(includePath)) {
                        const candidate = uri_1.URI.file(includePath).with({ scheme: workspace.uri.scheme });
                        if (this.j.extUri.isEqualOrParent(candidate, workspace.uri)) {
                            pathsToWatch.set(candidate, candidate);
                        }
                    }
                    // Relative: join against workspace folder
                    else {
                        const candidate = workspace.toResource(includePath);
                        pathsToWatch.set(candidate, candidate);
                    }
                }
            }
            // Watch all paths as instructed
            const disposables = new lifecycle_1.$jc();
            for (const [, pathToWatch] of pathsToWatch) {
                disposables.add(this.b.watch(pathToWatch, { recursive: true, excludes }));
            }
            this.a.set(workspace.uri, disposables);
        }
        y(workspace) {
            if (this.a.has(workspace.uri)) {
                (0, lifecycle_1.$fc)(this.a.get(workspace.uri));
                this.a.delete(workspace.uri);
            }
        }
        z() {
            // Unwatch all first
            this.C();
            // Watch each workspace folder
            for (const folder of this.f.getWorkspace().folders) {
                this.w(folder);
            }
        }
        C() {
            for (const [, disposable] of this.a) {
                disposable.dispose();
            }
            this.a.clear();
        }
        dispose() {
            super.dispose();
            this.C();
        }
    };
    exports.$9Lb = $9Lb;
    exports.$9Lb = $9Lb = __decorate([
        __param(0, files_1.$okb),
        __param(1, configuration_1.$8h),
        __param(2, workspace_1.$Kh),
        __param(3, notification_1.$Yu),
        __param(4, opener_1.$NT),
        __param(5, uriIdentity_1.$Ck),
        __param(6, host_1.$VT)
    ], $9Lb);
});
//# sourceMappingURL=workspaceWatcher.js.map