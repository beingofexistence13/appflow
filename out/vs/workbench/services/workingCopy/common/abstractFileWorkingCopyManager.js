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
    exports.BaseFileWorkingCopyManager = void 0;
    let BaseFileWorkingCopyManager = class BaseFileWorkingCopyManager extends lifecycle_1.Disposable {
        constructor(fileService, logService, workingCopyBackupService) {
            super();
            this.fileService = fileService;
            this.logService = logService;
            this.workingCopyBackupService = workingCopyBackupService;
            this._onDidCreate = this._register(new event_1.Emitter());
            this.onDidCreate = this._onDidCreate.event;
            this.mapResourceToWorkingCopy = new map_1.ResourceMap();
            this.mapResourceToDisposeListener = new map_1.ResourceMap();
        }
        has(resource) {
            return this.mapResourceToWorkingCopy.has(resource);
        }
        add(resource, workingCopy) {
            const knownWorkingCopy = this.get(resource);
            if (knownWorkingCopy === workingCopy) {
                return; // already cached
            }
            // Add to our working copy map
            this.mapResourceToWorkingCopy.set(resource, workingCopy);
            // Update our dispose listener to remove it on dispose
            this.mapResourceToDisposeListener.get(resource)?.dispose();
            this.mapResourceToDisposeListener.set(resource, workingCopy.onWillDispose(() => this.remove(resource)));
            // Signal creation event
            this._onDidCreate.fire(workingCopy);
        }
        remove(resource) {
            // Dispose any existing listener
            const disposeListener = this.mapResourceToDisposeListener.get(resource);
            if (disposeListener) {
                (0, lifecycle_1.dispose)(disposeListener);
                this.mapResourceToDisposeListener.delete(resource);
            }
            // Remove from our working copy map
            return this.mapResourceToWorkingCopy.delete(resource);
        }
        //#region Get / Get all
        get workingCopies() {
            return [...this.mapResourceToWorkingCopy.values()];
        }
        get(resource) {
            return this.mapResourceToWorkingCopy.get(resource);
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
            this.mapResourceToWorkingCopy.clear();
            // Dispose the dispose listeners
            (0, lifecycle_1.dispose)(this.mapResourceToDisposeListener.values());
            this.mapResourceToDisposeListener.clear();
        }
        async destroy() {
            // Make sure all dirty working copies are saved to disk
            try {
                await async_1.Promises.settled(this.workingCopies.map(async (workingCopy) => {
                    if (workingCopy.isDirty()) {
                        await this.saveWithFallback(workingCopy);
                    }
                }));
            }
            catch (error) {
                this.logService.error(error);
            }
            // Dispose all working copies
            (0, lifecycle_1.dispose)(this.mapResourceToWorkingCopy.values());
            // Finally dispose manager
            this.dispose();
        }
        async saveWithFallback(workingCopy) {
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
                const backup = await this.workingCopyBackupService.resolve(workingCopy);
                if (backup) {
                    await this.fileService.writeFile(workingCopy.resource, backup.value, { unlock: true });
                }
            }
        }
    };
    exports.BaseFileWorkingCopyManager = BaseFileWorkingCopyManager;
    exports.BaseFileWorkingCopyManager = BaseFileWorkingCopyManager = __decorate([
        __param(0, files_1.IFileService),
        __param(1, log_1.ILogService),
        __param(2, workingCopyBackup_1.IWorkingCopyBackupService)
    ], BaseFileWorkingCopyManager);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWJzdHJhY3RGaWxlV29ya2luZ0NvcHlNYW5hZ2VyLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL3NlcnZpY2VzL3dvcmtpbmdDb3B5L2NvbW1vbi9hYnN0cmFjdEZpbGVXb3JraW5nQ29weU1hbmFnZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBMkN6RixJQUFlLDBCQUEwQixHQUF6QyxNQUFlLDBCQUEyRixTQUFRLHNCQUFVO1FBUWxJLFlBQ2UsV0FBNEMsRUFDN0MsVUFBMEMsRUFDNUIsd0JBQXNFO1lBRWpHLEtBQUssRUFBRSxDQUFDO1lBSnlCLGdCQUFXLEdBQVgsV0FBVyxDQUFjO1lBQzFCLGVBQVUsR0FBVixVQUFVLENBQWE7WUFDVCw2QkFBd0IsR0FBeEIsd0JBQXdCLENBQTJCO1lBVGpGLGlCQUFZLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLGVBQU8sRUFBSyxDQUFDLENBQUM7WUFDeEQsZ0JBQVcsR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLEtBQUssQ0FBQztZQUU5Qiw2QkFBd0IsR0FBRyxJQUFJLGlCQUFXLEVBQUssQ0FBQztZQUNoRCxpQ0FBNEIsR0FBRyxJQUFJLGlCQUFXLEVBQWUsQ0FBQztRQVEvRSxDQUFDO1FBRVMsR0FBRyxDQUFDLFFBQWE7WUFDMUIsT0FBTyxJQUFJLENBQUMsd0JBQXdCLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQ3BELENBQUM7UUFFUyxHQUFHLENBQUMsUUFBYSxFQUFFLFdBQWM7WUFDMUMsTUFBTSxnQkFBZ0IsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQzVDLElBQUksZ0JBQWdCLEtBQUssV0FBVyxFQUFFO2dCQUNyQyxPQUFPLENBQUMsaUJBQWlCO2FBQ3pCO1lBRUQsOEJBQThCO1lBQzlCLElBQUksQ0FB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