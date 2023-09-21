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
define(["require", "exports", "vs/base/common/event", "vs/base/common/lifecycle", "vs/workbench/services/workingCopy/common/workingCopyService", "vs/base/common/cancellation", "vs/base/common/async", "vs/platform/log/common/log", "vs/workbench/services/workingCopy/common/workingCopyBackup", "vs/base/common/stream"], function (require, exports, event_1, lifecycle_1, workingCopyService_1, cancellation_1, async_1, log_1, workingCopyBackup_1, stream_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$9rb = void 0;
    let $9rb = class $9rb extends lifecycle_1.$kc {
        get model() { return this.a; }
        //#endregion
        constructor(typeId, resource, name, hasAssociatedFilePath, j, m, n, r, workingCopyService, s, t) {
            super();
            this.typeId = typeId;
            this.resource = resource;
            this.name = name;
            this.hasAssociatedFilePath = hasAssociatedFilePath;
            this.j = j;
            this.m = m;
            this.n = n;
            this.r = r;
            this.s = s;
            this.t = t;
            this.capabilities = this.j ? 2 /* WorkingCopyCapabilities.Untitled */ | 4 /* WorkingCopyCapabilities.Scratchpad */ : 2 /* WorkingCopyCapabilities.Untitled */;
            this.a = undefined;
            //#region Events
            this.b = this.B(new event_1.$fd());
            this.onDidChangeContent = this.b.event;
            this.c = this.B(new event_1.$fd());
            this.onDidChangeDirty = this.c.event;
            this.f = this.B(new event_1.$fd());
            this.onDidSave = this.f.event;
            this.g = this.B(new event_1.$fd());
            this.onDidRevert = this.g.event;
            this.h = this.B(new event_1.$fd());
            this.onWillDispose = this.h.event;
            //#region Dirty/Modified
            this.u = this.hasAssociatedFilePath || Boolean(this.m && this.m.markModified !== false);
            // Make known to working copy service
            this.B(workingCopyService.registerWorkingCopy(this));
        }
        isDirty() {
            return this.u && !this.j; // Scratchpad working copies are never dirty
        }
        isModified() {
            return this.u;
        }
        w(modified) {
            if (this.u === modified) {
                return;
            }
            this.u = modified;
            if (!this.j) {
                this.c.fire();
            }
        }
        //#endregion
        //#region Resolve
        async resolve() {
            this.D('resolve()');
            if (this.isResolved()) {
                this.D('resolve() - exit (already resolved)');
                // return early if the untitled file working copy is already
                // resolved assuming that the contents have meanwhile changed
                // in the underlying model. we only resolve untitled once.
                return;
            }
            let untitledContents;
            // Check for backups or use initial value or empty
            const backup = await this.s.resolve(this);
            if (backup) {
                this.D('resolve() - with backup');
                untitledContents = backup.value;
            }
            else if (this.m?.value) {
                this.D('resolve() - with initial contents');
                untitledContents = this.m.value;
            }
            else {
                this.D('resolve() - empty');
                untitledContents = (0, stream_1.$Ad)();
            }
            // Create model
            await this.y(untitledContents);
            // Untitled associated to file path are modified right away as well as untitled with content
            this.w(this.hasAssociatedFilePath || !!backup || Boolean(this.m && this.m.markModified !== false));
            // If we have initial contents, make sure to emit this
            // as the appropriate events to the outside.
            if (!!backup || this.m) {
                this.b.fire();
            }
        }
        async y(contents) {
            this.D('doCreateModel()');
            // Create model and dispose it when we get disposed
            this.a = this.B(await this.n.createModel(this.resource, contents, cancellation_1.CancellationToken.None));
            // Model listeners
            this.z(this.a);
        }
        z(model) {
            // Content Change
            this.B(model.onDidChangeContent(e => this.C(e)));
            // Lifecycle
            this.B(model.onWillDispose(() => this.dispose()));
        }
        C(e) {
            // Mark the untitled file working copy as non-modified once its
            // in case provided by the change event and in case we do not
            // have an associated path set
            if (!this.hasAssociatedFilePath && e.isInitial) {
                this.w(false);
            }
            // Turn modified otherwise
            else {
                this.w(true);
            }
            // Emit as general content change event
            this.b.fire();
        }
        isResolved() {
            return !!this.model;
        }
        //#endregion
        //#region Backup
        get backupDelay() {
            return this.model?.configuration?.backupDelay;
        }
        async backup(token) {
            let content = undefined;
            // Make sure to check whether this working copy has been
            // resolved or not and fallback to the initial value -
            // if any - to prevent backing up an unresolved working
            // copy and loosing the initial value.
            if (this.isResolved()) {
                content = await (0, async_1.$vg)(this.model.snapshot(token), token);
            }
            else if (this.m) {
                content = this.m.value;
            }
            return { content };
        }
        //#endregion
        //#region Save
        async save(options) {
            this.D('save()');
            const result = await this.r(this, options);
            // Emit Save Event
            if (result) {
                this.f.fire({ reason: options?.reason, source: options?.source });
            }
            return result;
        }
        //#endregion
        //#region Revert
        async revert() {
            this.D('revert()');
            // No longer modified
            this.w(false);
            // Emit as event
            this.g.fire();
            // A reverted untitled file working copy is invalid
            // because it has no actual source on disk to revert to.
            // As such we dispose the model.
            this.dispose();
        }
        //#endregion
        dispose() {
            this.D('dispose()');
            this.h.fire();
            super.dispose();
        }
        D(msg) {
            this.t.trace(`[untitled file working copy] ${msg}`, this.resource.toString(), this.typeId);
        }
    };
    exports.$9rb = $9rb;
    exports.$9rb = $9rb = __decorate([
        __param(8, workingCopyService_1.$TC),
        __param(9, workingCopyBackup_1.$EA),
        __param(10, log_1.$5i)
    ], $9rb);
});
//# sourceMappingURL=untitledFileWorkingCopy.js.map