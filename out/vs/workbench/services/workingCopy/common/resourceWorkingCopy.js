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
    exports.ResourceWorkingCopy = void 0;
    let ResourceWorkingCopy = class ResourceWorkingCopy extends lifecycle_1.Disposable {
        constructor(resource, fileService) {
            super();
            this.resource = resource;
            this.fileService = fileService;
            //#region Orphaned Tracking
            this._onDidChangeOrphaned = this._register(new event_1.Emitter());
            this.onDidChangeOrphaned = this._onDidChangeOrphaned.event;
            this.orphaned = false;
            //#endregion
            //#region Dispose
            this._onWillDispose = this._register(new event_1.Emitter());
            this.onWillDispose = this._onWillDispose.event;
            this.disposed = false;
            this._register(this.fileService.onDidFilesChange(e => this.onDidFilesChange(e)));
        }
        isOrphaned() {
            return this.orphaned;
        }
        async onDidFilesChange(e) {
            let fileEventImpactsUs = false;
            let newInOrphanModeGuess;
            // If we are currently orphaned, we check if the file was added back
            if (this.orphaned) {
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
            if (fileEventImpactsUs && this.orphaned !== newInOrphanModeGuess) {
                let newInOrphanModeValidated = false;
                if (newInOrphanModeGuess) {
                    // We have received reports of users seeing delete events even though the file still
                    // exists (network shares issue: https://github.com/microsoft/vscode/issues/13665).
                    // Since we do not want to mark the working copy as orphaned, we have to check if the
                    // file is really gone and not just a faulty file event.
                    await (0, async_1.timeout)(100, cancellation_1.CancellationToken.None);
                    if (this.isDisposed()) {
                        newInOrphanModeValidated = true;
                    }
                    else {
                        const exists = await this.fileService.exists(this.resource);
                        newInOrphanModeValidated = !exists;
                    }
                }
                if (this.orphaned !== newInOrphanModeValidated && !this.isDisposed()) {
                    this.setOrphaned(newInOrphanModeValidated);
                }
            }
        }
        setOrphaned(orphaned) {
            if (this.orphaned !== orphaned) {
                this.orphaned = orphaned;
                this._onDidChangeOrphaned.fire();
            }
        }
        isDisposed() {
            return this.disposed;
        }
        dispose() {
            // State
            this.disposed = true;
            this.orphaned = false;
            // Event
            this._onWillDispose.fire();
            super.dispose();
        }
        //#endregion
        //#region Modified Tracking
        isModified() {
            return this.isDirty();
        }
    };
    exports.ResourceWorkingCopy = ResourceWorkingCopy;
    exports.ResourceWorkingCopy = ResourceWorkingCopy = __decorate([
        __param(1, files_1.IFileService)
    ], ResourceWorkingCopy);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVzb3VyY2VXb3JraW5nQ29weS5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9zZXJ2aWNlcy93b3JraW5nQ29weS9jb21tb24vcmVzb3VyY2VXb3JraW5nQ29weS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUFzQ3pGLElBQWUsbUJBQW1CLEdBQWxDLE1BQWUsbUJBQW9CLFNBQVEsc0JBQVU7UUFFM0QsWUFDVSxRQUFhLEVBQ1IsV0FBNEM7WUFFMUQsS0FBSyxFQUFFLENBQUM7WUFIQyxhQUFRLEdBQVIsUUFBUSxDQUFLO1lBQ1csZ0JBQVcsR0FBWCxXQUFXLENBQWM7WUFPM0QsMkJBQTJCO1lBRVYseUJBQW9CLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLGVBQU8sRUFBUSxDQUFDLENBQUM7WUFDbkUsd0JBQW1CLEdBQUcsSUFBSSxDQUFDLG9CQUFvQixDQUFDLEtBQUssQ0FBQztZQUV2RCxhQUFRLEdBQUcsS0FBSyxDQUFDO1lBNER6QixZQUFZO1lBR1osaUJBQWlCO1lBRUEsbUJBQWMsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksZUFBTyxFQUFRLENBQUMsQ0FBQztZQUM3RCxrQkFBYSxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUMsS0FBSyxDQUFDO1lBRTNDLGFBQVEsR0FBRyxLQUFLLENBQUM7WUE1RXhCLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDbEYsQ0FBQztRQVNELFVBQVU7WUFDVCxPQUFPLElBQUksQ0FBQyxRQUFRLENBQUM7UUFDdEIsQ0FBQztRQUVPLEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFtQjtZQUNq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