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
define(["require", "exports", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/map", "vs/base/common/async", "vs/platform/files/common/files", "vs/platform/log/common/log", "vs/workbench/services/workingCopy/common/workingCopyBackup"], function (require, exports, event_1, lifecycle_1, map_1, async_1, files_1, log_1, workingCopyBackup_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$7rb = void 0;
    let $7rb = class $7rb extends lifecycle_1.$kc {
        constructor(f, g, h) {
            super();
            this.f = f;
            this.g = g;
            this.h = h;
            this.a = this.B(new event_1.$fd());
            this.onDidCreate = this.a.event;
            this.b = new map_1.$zi();
            this.c = new map_1.$zi();
        }
        j(resource) {
            return this.b.has(resource);
        }
        m(resource, workingCopy) {
            const knownWorkingCopy = this.get(resource);
            if (knownWorkingCopy === workingCopy) {
                return; // already cached
            }
            // Add to our working copy map
            this.b.set(resource, workingCopy);
            // Update our dispose listener to remove it on dispose
            this.c.get(resource)?.dispose();
            this.c.set(resource, workingCopy.onWillDispose(() => this.n(resource)));
            // Signal creation event
            this.a.fire(workingCopy);
        }
        n(resource) {
            // Dispose any existing listener
            const disposeListener = this.c.get(resource);
            if (disposeListener) {
                (0, lifecycle_1.$fc)(disposeListener);
                this.c.delete(resource);
            }
            // Remove from our working copy map
            return this.b.delete(resource);
        }
        //#region Get / Get all
        get workingCopies() {
            return [...this.b.values()];
        }
        get(resource) {
            return this.b.get(resource);
        }
        //#endregion
        //#region Lifecycle
        dispose() {
            super.dispose();
            // Clear working copy caches
            //
            // Note: we are not explicitly disposing the working copies
            // known to the manager because this can have unwanted side
            // effects such as backups getting discarded once the working
            // copy unregisters. We have an explicit `destroy`
            // for that purpose (https://github.com/microsoft/vscode/pull/123555)
            //
            this.b.clear();
            // Dispose the dispose listeners
            (0, lifecycle_1.$fc)(this.c.values());
            this.c.clear();
        }
        async destroy() {
            // Make sure all dirty working copies are saved to disk
            try {
                await async_1.Promises.settled(this.workingCopies.map(async (workingCopy) => {
                    if (workingCopy.isDirty()) {
                        await this.r(workingCopy);
                    }
                }));
            }
            catch (error) {
                this.g.error(error);
            }
            // Dispose all working copies
            (0, lifecycle_1.$fc)(this.b.values());
            // Finally dispose manager
            this.dispose();
        }
        async r(workingCopy) {
            // First try regular save
            let saveSuccess = false;
            try {
                saveSuccess = await workingCopy.save();
            }
            catch (error) {
                // Ignore
            }
            // Then fallback to backup if that exists
            if (!saveSuccess || workingCopy.isDirty()) {
                const backup = await this.h.resolve(workingCopy);
                if (backup) {
                    await this.f.writeFile(workingCopy.resource, backup.value, { unlock: true });
                }
            }
        }
    };
    exports.$7rb = $7rb;
    exports.$7rb = $7rb = __decorate([
        __param(0, files_1.$6j),
        __param(1, log_1.$5i),
        __param(2, workingCopyBackup_1.$EA)
    ], $7rb);
});
//# sourceMappingURL=abstractFileWorkingCopyManager.js.map