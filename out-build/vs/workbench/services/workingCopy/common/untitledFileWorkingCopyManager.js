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
define(["require", "exports", "vs/base/common/lifecycle", "vs/base/common/uri", "vs/workbench/services/workingCopy/common/untitledFileWorkingCopy", "vs/base/common/event", "vs/base/common/network", "vs/workbench/services/workingCopy/common/workingCopyService", "vs/platform/label/common/label", "vs/platform/log/common/log", "vs/workbench/services/workingCopy/common/workingCopyBackup", "vs/platform/files/common/files", "vs/workbench/services/workingCopy/common/abstractFileWorkingCopyManager", "vs/base/common/map"], function (require, exports, lifecycle_1, uri_1, untitledFileWorkingCopy_1, event_1, network_1, workingCopyService_1, label_1, log_1, workingCopyBackup_1, files_1, abstractFileWorkingCopyManager_1, map_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$0rb = void 0;
    let $0rb = class $0rb extends abstractFileWorkingCopyManager_1.$7rb {
        constructor(w, y, z, fileService, C, logService, workingCopyBackupService, D) {
            super(fileService, logService, workingCopyBackupService);
            this.w = w;
            this.y = y;
            this.z = z;
            this.C = C;
            this.D = D;
            //#region Events
            this.s = this.B(new event_1.$fd());
            this.onDidChangeDirty = this.s.event;
            this.t = this.B(new event_1.$fd());
            this.onWillDispose = this.t.event;
            //#endregion
            this.u = new map_1.$zi();
        }
        async resolve(options) {
            const workingCopy = this.F(options);
            await workingCopy.resolve();
            return workingCopy;
        }
        F(options = Object.create(null)) {
            const massagedOptions = this.G(options);
            // Return existing instance if asked for it
            if (massagedOptions.untitledResource) {
                const existingWorkingCopy = this.get(massagedOptions.untitledResource);
                if (existingWorkingCopy) {
                    return existingWorkingCopy;
                }
            }
            // Create new instance otherwise
            return this.H(massagedOptions);
        }
        G(options) {
            const massagedOptions = Object.create(null);
            // Handle associated resource
            if (options.associatedResource) {
                massagedOptions.untitledResource = uri_1.URI.from({
                    scheme: network_1.Schemas.untitled,
                    authority: options.associatedResource.authority,
                    fragment: options.associatedResource.fragment,
                    path: options.associatedResource.path,
                    query: options.associatedResource.query
                });
                massagedOptions.associatedResource = options.associatedResource;
            }
            // Handle untitled resource
            else {
                if (options.untitledResource?.scheme === network_1.Schemas.untitled) {
                    massagedOptions.untitledResource = options.untitledResource;
                }
                massagedOptions.isScratchpad = options.isScratchpad;
            }
            // Take over initial value
            massagedOptions.contents = options.contents;
            return massagedOptions;
        }
        H(options) {
            // Create a new untitled resource if none is provided
            let untitledResource = options.untitledResource;
            if (!untitledResource) {
                let counter = 1;
                do {
                    untitledResource = uri_1.URI.from({
                        scheme: network_1.Schemas.untitled,
                        path: options.isScratchpad ? `Scratchpad-${counter}` : `Untitled-${counter}`,
                        query: this.w ?
                            `typeId=${this.w}` : // distinguish untitled resources among others by encoding the `typeId` as query param
                            undefined // keep untitled resources for text files as they are (when `typeId === ''`)
                    });
                    counter++;
                } while (this.j(untitledResource));
            }
            // Create new working copy with provided options
            const workingCopy = new untitledFileWorkingCopy_1.$9rb(this.w, untitledResource, this.C.getUriBasenameLabel(untitledResource), !!options.associatedResource, !!options.isScratchpad, options.contents, this.y, this.z, this.D, this.h, this.g);
            // Register
            this.I(workingCopy);
            return workingCopy;
        }
        I(workingCopy) {
            // Install working copy listeners
            const workingCopyListeners = new lifecycle_1.$jc();
            workingCopyListeners.add(workingCopy.onDidChangeDirty(() => this.s.fire(workingCopy)));
            workingCopyListeners.add(workingCopy.onWillDispose(() => this.t.fire(workingCopy)));
            // Keep for disposal
            this.u.set(workingCopy.resource, workingCopyListeners);
            // Add to cache
            this.m(workingCopy.resource, workingCopy);
            // If the working copy is dirty right from the beginning,
            // make sure to emit this as an event
            if (workingCopy.isDirty()) {
                this.s.fire(workingCopy);
            }
        }
        n(resource) {
            const removed = super.n(resource);
            // Dispose any existing working copy listeners
            const workingCopyListener = this.u.get(resource);
            if (workingCopyListener) {
                (0, lifecycle_1.$fc)(workingCopyListener);
                this.u.delete(resource);
            }
            return removed;
        }
        //#endregion
        //#region Lifecycle
        dispose() {
            super.dispose();
            // Dispose the working copy change listeners
            (0, lifecycle_1.$fc)(this.u.values());
            this.u.clear();
        }
    };
    exports.$0rb = $0rb;
    exports.$0rb = $0rb = __decorate([
        __param(3, files_1.$6j),
        __param(4, label_1.$Vz),
        __param(5, log_1.$5i),
        __param(6, workingCopyBackup_1.$EA),
        __param(7, workingCopyService_1.$TC)
    ], $0rb);
});
//# sourceMappingURL=untitledFileWorkingCopyManager.js.map