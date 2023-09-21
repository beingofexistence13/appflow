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
define(["require", "exports", "vs/base/common/async", "vs/base/common/cancellation", "vs/base/common/event", "vs/base/common/lifecycle", "vs/platform/files/common/files"], function (require, exports, async_1, cancellation_1, event_1, lifecycle_1, files_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$DD = void 0;
    let $DD = class $DD extends lifecycle_1.$kc {
        constructor(resource, a) {
            super();
            this.resource = resource;
            this.a = a;
            //#region Orphaned Tracking
            this.b = this.B(new event_1.$fd());
            this.onDidChangeOrphaned = this.b.event;
            this.c = false;
            //#endregion
            //#region Dispose
            this.h = this.B(new event_1.$fd());
            this.onWillDispose = this.h.event;
            this.j = false;
            this.B(this.a.onDidFilesChange(e => this.f(e)));
        }
        isOrphaned() {
            return this.c;
        }
        async f(e) {
            let fileEventImpactsUs = false;
            let newInOrphanModeGuess;
            // If we are currently orphaned, we check if the file was added back
            if (this.c) {
                const fileWorkingCopyResourceAdded = e.contains(this.resource, 1 /* FileChangeType.ADDED */);
                if (fileWorkingCopyResourceAdded) {
                    newInOrphanModeGuess = false;
                    fileEventImpactsUs = true;
                }
            }
            // Otherwise we check if the file was deleted
            else {
                const fileWorkingCopyResourceDeleted = e.contains(this.resource, 2 /* FileChangeType.DELETED */);
                if (fileWorkingCopyResourceDeleted) {
                    newInOrphanModeGuess = true;
                    fileEventImpactsUs = true;
                }
            }
            if (fileEventImpactsUs && this.c !== newInOrphanModeGuess) {
                let newInOrphanModeValidated = false;
                if (newInOrphanModeGuess) {
                    // We have received reports of users seeing delete events even though the file still
                    // exists (network shares issue: https://github.com/microsoft/vscode/issues/13665).
                    // Since we do not want to mark the working copy as orphaned, we have to check if the
                    // file is really gone and not just a faulty file event.
                    await (0, async_1.$Hg)(100, cancellation_1.CancellationToken.None);
                    if (this.isDisposed()) {
                        newInOrphanModeValidated = true;
                    }
                    else {
                        const exists = await this.a.exists(this.resource);
                        newInOrphanModeValidated = !exists;
                    }
                }
                if (this.c !== newInOrphanModeValidated && !this.isDisposed()) {
                    this.g(newInOrphanModeValidated);
                }
            }
        }
        g(orphaned) {
            if (this.c !== orphaned) {
                this.c = orphaned;
                this.b.fire();
            }
        }
        isDisposed() {
            return this.j;
        }
        dispose() {
            // State
            this.j = true;
            this.c = false;
            // Event
            this.h.fire();
            super.dispose();
        }
        //#endregion
        //#region Modified Tracking
        isModified() {
            return this.isDirty();
        }
    };
    exports.$DD = $DD;
    exports.$DD = $DD = __decorate([
        __param(1, files_1.$6j)
    ], $DD);
});
//# sourceMappingURL=resourceWorkingCopy.js.map