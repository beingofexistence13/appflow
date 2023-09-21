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
define(["require", "exports", "vs/nls!vs/workbench/services/workingCopy/common/workingCopyHistoryTracker", "vs/base/common/async", "vs/base/common/cancellation", "vs/base/common/lifecycle", "vs/base/common/map", "vs/platform/configuration/common/configuration", "vs/platform/undoRedo/common/undoRedo", "vs/platform/uriIdentity/common/uriIdentity", "vs/workbench/common/editor", "vs/workbench/services/path/common/pathService", "vs/workbench/services/workingCopy/common/storedFileWorkingCopy", "vs/workbench/services/workingCopy/common/workingCopyHistory", "vs/workbench/services/workingCopy/common/workingCopyService", "vs/base/common/network", "vs/workbench/common/resources", "vs/platform/workspace/common/workspace", "vs/platform/files/common/files"], function (require, exports, nls_1, async_1, cancellation_1, lifecycle_1, map_1, configuration_1, undoRedo_1, uriIdentity_1, editor_1, pathService_1, storedFileWorkingCopy_1, workingCopyHistory_1, workingCopyService_1, network_1, resources_1, workspace_1, files_1) {
    "use strict";
    var $p4b_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$p4b = void 0;
    let $p4b = class $p4b extends lifecycle_1.$kc {
        static { $p4b_1 = this; }
        static { this.a = {
            ENABLED: 'workbench.localHistory.enabled',
            SIZE_LIMIT: 'workbench.localHistory.maxFileSize',
            EXCLUDES: 'workbench.localHistory.exclude'
        }; }
        static { this.b = editor_1.$SE.registerSource('undoRedo.source', (0, nls_1.localize)(0, null)); }
        constructor(m, n, r, s, t, u, w, y) {
            super();
            this.m = m;
            this.n = n;
            this.r = r;
            this.s = s;
            this.t = t;
            this.u = u;
            this.w = w;
            this.y = y;
            this.c = this.B(new async_1.$Mg(workingCopyHistory_1.$w1b));
            this.f = this.B(new async_1.$Xg(() => {
                const matcher = this.B(new resources_1.$wD(root => this.t.getValue($p4b_1.a.EXCLUDES, { resource: root }), event => event.affectsConfiguration($p4b_1.a.EXCLUDES), this.w, this.t));
                return matcher;
            }));
            this.g = new map_1.$zi(resource => this.r.extUri.getComparisonKey(resource));
            this.h = new map_1.$zi(resource => this.r.extUri.getComparisonKey(resource));
            this.j = new map_1.$zi(resource => this.r.extUri.getComparisonKey(resource));
            this.z();
        }
        z() {
            // File Events
            this.B(this.y.onDidRunOperation(e => this.C(e)));
            // Working Copy Events
            this.B(this.m.onDidChangeContent(workingCopy => this.D(workingCopy)));
            this.B(this.m.onDidSave(e => this.G(e)));
        }
        async C(e) {
            if (!this.J(e)) {
                return; // return early for working copies we are not interested in
            }
            const source = e.resource;
            const target = e.target.resource;
            // Move working copy history entries for this file move event
            const resources = await this.n.moveEntries(source, target);
            // Make sure to track the content version of each entry that
            // was moved in our map. This ensures that a subsequent save
            // without a content change does not add a redundant entry
            // (https://github.com/microsoft/vscode/issues/145881)
            for (const resource of resources) {
                const contentVersion = this.F(resource);
                this.j.set(resource, contentVersion);
            }
        }
        D(workingCopy) {
            // Increment content version ID for resource
            const contentVersionId = this.F(workingCopy.resource);
            this.h.set(workingCopy.resource, contentVersionId + 1);
        }
        F(resource) {
            return this.h.get(resource) || 0;
        }
        G(e) {
            if (!this.I(e)) {
                return; // return early for working copies we are not interested in
            }
            const contentVersion = this.F(e.workingCopy.resource);
            if (this.j.get(e.workingCopy.resource) === contentVersion) {
                return; // return early when content version already has associated history entry
            }
            // Cancel any previous operation for this resource
            this.g.get(e.workingCopy.resource)?.dispose(true);
            // Create new cancellation token support and remember
            const cts = new cancellation_1.$pd();
            this.g.set(e.workingCopy.resource, cts);
            // Queue new operation to add to history
            this.c.queue(async () => {
                if (cts.token.isCancellationRequested) {
                    return;
                }
                const contentVersion = this.F(e.workingCopy.resource);
                // Figure out source of save operation if not provided already
                let source = e.source;
                if (!e.source) {
                    source = this.H(e);
                }
                // Add entry
                await this.n.addEntry({ resource: e.workingCopy.resource, source, timestamp: e.stat.mtime }, cts.token);
                // Remember content version as being added to history
                this.j.set(e.workingCopy.resource, contentVersion);
                if (cts.token.isCancellationRequested) {
                    return;
                }
                // Finally remove from pending operations
                this.g.delete(e.workingCopy.resource);
            });
        }
        H(e) {
            const lastStackElement = this.u.getLastElement(e.workingCopy.resource);
            if (lastStackElement) {
                if (lastStackElement.code === 'undoredo.textBufferEdit') {
                    return undefined; // ignore any unspecific stack element that resulted just from typing
                }
                return lastStackElement.label;
            }
            const allStackElements = this.u.getElements(e.workingCopy.resource);
            if (allStackElements.future.length > 0 || allStackElements.past.length > 0) {
                return $p4b_1.b;
            }
            return undefined;
        }
        I(e) {
            if (!(0, storedFileWorkingCopy_1.$ED)(e)) {
                return false; // only support working copies that are backed by stored files
            }
            return this.L(e.workingCopy.resource, e.stat);
        }
        J(e) {
            if (!e.isOperation(2 /* FileOperation.MOVE */)) {
                return false; // only interested in move operations
            }
            return this.L(e.target.resource, e.target);
        }
        L(resource, stat) {
            if (resource.scheme !== this.s.defaultUriScheme && // track history for all workspace resources
                resource.scheme !== network_1.Schemas.vscodeUserData && // track history for all settings
                resource.scheme !== network_1.Schemas.inMemory // track history for tests that use in-memory
            ) {
                return false; // do not support unknown resources
            }
            const configuredMaxFileSizeInBytes = 1024 * this.t.getValue($p4b_1.a.SIZE_LIMIT, { resource });
            if (stat.size > configuredMaxFileSizeInBytes) {
                return false; // only track files that are not too large
            }
            if (this.t.getValue($p4b_1.a.ENABLED, { resource }) === false) {
                return false; // do not track when history is disabled
            }
            // Finally check for exclude setting
            return !this.f.value.matches(resource);
        }
    };
    exports.$p4b = $p4b;
    exports.$p4b = $p4b = $p4b_1 = __decorate([
        __param(0, workingCopyService_1.$TC),
        __param(1, workingCopyHistory_1.$v1b),
        __param(2, uriIdentity_1.$Ck),
        __param(3, pathService_1.$yJ),
        __param(4, configuration_1.$8h),
        __param(5, undoRedo_1.$wu),
        __param(6, workspace_1.$Kh),
        __param(7, files_1.$6j)
    ], $p4b);
});
//# sourceMappingURL=workingCopyHistoryTracker.js.map