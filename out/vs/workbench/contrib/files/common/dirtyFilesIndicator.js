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
define(["require", "exports", "vs/nls", "vs/workbench/contrib/files/common/files", "vs/workbench/services/lifecycle/common/lifecycle", "vs/base/common/lifecycle", "vs/workbench/services/activity/common/activity", "vs/workbench/services/workingCopy/common/workingCopyService", "vs/workbench/services/filesConfiguration/common/filesConfigurationService"], function (require, exports, nls, files_1, lifecycle_1, lifecycle_2, activity_1, workingCopyService_1, filesConfigurationService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.DirtyFilesIndicator = void 0;
    let DirtyFilesIndicator = class DirtyFilesIndicator extends lifecycle_2.Disposable {
        constructor(lifecycleService, activityService, workingCopyService, filesConfigurationService) {
            super();
            this.lifecycleService = lifecycleService;
            this.activityService = activityService;
            this.workingCopyService = workingCopyService;
            this.filesConfigurationService = filesConfigurationService;
            this.badgeHandle = this._register(new lifecycle_2.MutableDisposable());
            this.lastKnownDirtyCount = 0;
            this.updateActivityBadge();
            this.registerListeners();
        }
        registerListeners() {
            // Working copy dirty indicator
            this._register(this.workingCopyService.onDidChangeDirty(workingCopy => this.onWorkingCopyDidChangeDirty(workingCopy)));
            // Lifecycle
            this.lifecycleService.onDidShutdown(() => this.dispose());
        }
        onWorkingCopyDidChangeDirty(workingCopy) {
            const gotDirty = workingCopy.isDirty();
            if (gotDirty && !(workingCopy.capabilities & 2 /* WorkingCopyCapabilities.Untitled */) && this.filesConfigurationService.getAutoSaveMode() === 1 /* AutoSaveMode.AFTER_SHORT_DELAY */) {
                return; // do not indicate dirty of working copies that are auto saved after short delay
            }
            if (gotDirty || this.lastKnownDirtyCount > 0) {
                this.updateActivityBadge();
            }
        }
        updateActivityBadge() {
            const dirtyCount = this.lastKnownDirtyCount = this.workingCopyService.dirtyCount;
            // Indicate dirty count in badge if any
            if (dirtyCount > 0) {
                this.badgeHandle.value = this.activityService.showViewContainerActivity(files_1.VIEWLET_ID, {
                    badge: new activity_1.NumberBadge(dirtyCount, num => num === 1 ? nls.localize('dirtyFile', "1 unsaved file") : nls.localize('dirtyFiles', "{0} unsaved files", dirtyCount)),
                    clazz: 'explorer-viewlet-label'
                });
            }
            else {
                this.badgeHandle.clear();
            }
        }
    };
    exports.DirtyFilesIndicator = DirtyFilesIndicator;
    exports.DirtyFilesIndicator = DirtyFilesIndicator = __decorate([
        __param(0, lifecycle_1.ILifecycleService),
        __param(1, activity_1.IActivityService),
        __param(2, workingCopyService_1.IWorkingCopyService),
        __param(3, filesConfigurationService_1.IFilesConfigurationService)
    ], DirtyFilesIndicator);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGlydHlGaWxlc0luZGljYXRvci5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL2ZpbGVzL2NvbW1vbi9kaXJ0eUZpbGVzSW5kaWNhdG9yLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQVl6RixJQUFNLG1CQUFtQixHQUF6QixNQUFNLG1CQUFvQixTQUFRLHNCQUFVO1FBS2xELFlBQ29CLGdCQUFvRCxFQUNyRCxlQUFrRCxFQUMvQyxrQkFBd0QsRUFDakQseUJBQXNFO1lBRWxHLEtBQUssRUFBRSxDQUFDO1lBTDRCLHFCQUFnQixHQUFoQixnQkFBZ0IsQ0FBbUI7WUFDcEMsb0JBQWUsR0FBZixlQUFlLENBQWtCO1lBQzlCLHVCQUFrQixHQUFsQixrQkFBa0IsQ0FBcUI7WUFDaEMsOEJBQXlCLEdBQXpCLHlCQUF5QixDQUE0QjtZQVJsRixnQkFBVyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSw2QkFBaUIsRUFBRSxDQUFDLENBQUM7WUFFL0Qsd0JBQW1CLEdBQUcsQ0FBQyxDQUFDO1lBVS9CLElBQUksQ0FBQyxtQkFBbUIsRUFBRSxDQUFDO1lBRTNCLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO1FBQzFCLENBQUM7UUFFTyxpQkFBaUI7WUFFeEIsK0JBQStCO1lBQy9CLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLGdCQUFnQixDQUFDLFdBQVcsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLDJCQUEyQixDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUV2SCxZQUFZO1lBQ1osSUFBSSxDQUFDLGdCQUFnQixDQUFDLGFBQWEsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQztRQUMzRCxDQUFDO1FBRU8sMkJBQTJCLENBQUMsV0FBeUI7WUFDNUQsTUFBTSxRQUFRLEdBQUcsV0FBVyxDQUFDLE9BQU8sRUFBRSxDQUFDO1lBQ3ZDLElBQUksUUFBUSxJQUFJLENBQUMsQ0FBQyxXQUFXLENBQUMsWUFBWSwyQ0FBbUMsQ0FBQyxJQUFJLElBQUksQ0FBQyx5QkFBeUIsQ0FBQyxlQUFlLEVBQUUsMkNBQW1DLEVBQUU7Z0JBQ3RLLE9BQU8sQ0FBQyxnRkFBZ0Y7YUFDeEY7WUFFRCxJQUFJLFFBQVEsSUFBSSxJQUFJLENBQUMsbUJBQW1CLEdBQUcsQ0FBQyxFQUFFO2dCQUM3QyxJQUFJLENBQUMsbUJBQW1CLEVBQUUsQ0FBQzthQUMzQjtRQUNGLENBQUM7UUFFTyxtQkFBbUI7WUFDMUIsTUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLG1CQUFtQixHQUFHLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxVQUFVLENBQUM7WUFFakYsdUNBQXVDO1lBQ3ZDLElBQUksVUFBVSxHQUFHLENBQUMsRUFBRTtnQkFDbkIsSUFBSSxDQUFDLFdBQVcsQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLGVBQWUsQ0FBQyx5QkFBeUIsQ0FDdEUsa0JBQVUsRUFDVjtvQkFDQyxLQUFLLEVBQUUsSUFBSSxzQkFBVyxDQUFDLFVBQVUsRUFBRSxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsV0FBVyxFQUFFLGdCQUFnQixDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsWUFBWSxFQUFFLG1CQUFtQixFQUFFLFVBQVUsQ0FBQyxDQUFDO29CQUNoSyxLQUFLLEVBQUUsd0JBQXdCO2lCQUMvQixDQUNELENBQUM7YUFDRjtpQkFBTTtnQkFDTixJQUFJLENBQUMsV0FBVyxDQUFDLEtBQUssRUFBRSxDQUFDO2FBQ3pCO1FBQ0YsQ0FBQztLQUNELENBQUE7SUF0RFksa0RBQW1CO2tDQUFuQixtQkFBbUI7UUFNN0IsV0FBQSw2QkFBaUIsQ0FBQTtRQUNqQixXQUFBLDJCQUFnQixDQUFBO1FBQ2hCLFdBQUEsd0NBQW1CLENBQUE7UUFDbkIsV0FBQSxzREFBMEIsQ0FBQTtPQVRoQixtQkFBbUIsQ0FzRC9CIn0=