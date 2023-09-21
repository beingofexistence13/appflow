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
define(["require", "exports", "vs/base/common/actions", "vs/nls", "vs/platform/native/common/native", "vs/workbench/services/environment/electron-sandbox/environmentService", "vs/platform/files/common/files", "vs/base/common/resources", "vs/base/common/network"], function (require, exports, actions_1, nls, native_1, environmentService_1, files_1, resources_1, network_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.OpenExtensionLogsFolderAction = exports.OpenLogsFolderAction = void 0;
    let OpenLogsFolderAction = class OpenLogsFolderAction extends actions_1.Action {
        static { this.ID = 'workbench.action.openLogsFolder'; }
        static { this.TITLE = { value: nls.localize('openLogsFolder', "Open Logs Folder"), original: 'Open Logs Folder' }; }
        constructor(id, label, environmentService, nativeHostService) {
            super(id, label);
            this.environmentService = environmentService;
            this.nativeHostService = nativeHostService;
        }
        run() {
            return this.nativeHostService.showItemInFolder((0, resources_1.joinPath)(this.environmentService.logsHome, 'main.log').with({ scheme: network_1.Schemas.file }).fsPath);
        }
    };
    exports.OpenLogsFolderAction = OpenLogsFolderAction;
    exports.OpenLogsFolderAction = OpenLogsFolderAction = __decorate([
        __param(2, environmentService_1.INativeWorkbenchEnvironmentService),
        __param(3, native_1.INativeHostService)
    ], OpenLogsFolderAction);
    let OpenExtensionLogsFolderAction = class OpenExtensionLogsFolderAction extends actions_1.Action {
        static { this.ID = 'workbench.action.openExtensionLogsFolder'; }
        static { this.TITLE = { value: nls.localize('openExtensionLogsFolder', "Open Extension Logs Folder"), original: 'Open Extension Logs Folder' }; }
        constructor(id, label, environmentSerice, fileService, nativeHostService) {
            super(id, label);
            this.environmentSerice = environmentSerice;
            this.fileService = fileService;
            this.nativeHostService = nativeHostService;
        }
        async run() {
            const folderStat = await this.fileService.resolve(this.environmentSerice.extHostLogsPath);
            if (folderStat.children && folderStat.children[0]) {
                return this.nativeHostService.showItemInFolder(folderStat.children[0].resource.with({ scheme: network_1.Schemas.file }).fsPath);
            }
        }
    };
    exports.OpenExtensionLogsFolderAction = OpenExtensionLogsFolderAction;
    exports.OpenExtensionLogsFolderAction = OpenExtensionLogsFolderAction = __decorate([
        __param(2, environmentService_1.INativeWorkbenchEnvironmentService),
        __param(3, files_1.IFileService),
        __param(4, native_1.INativeHostService)
    ], OpenExtensionLogsFolderAction);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9nc0FjdGlvbnMuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9sb2dzL2VsZWN0cm9uLXNhbmRib3gvbG9nc0FjdGlvbnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBVXpGLElBQU0sb0JBQW9CLEdBQTFCLE1BQU0sb0JBQXFCLFNBQVEsZ0JBQU07aUJBRS9CLE9BQUUsR0FBRyxpQ0FBaUMsQUFBcEMsQ0FBcUM7aUJBQ3ZDLFVBQUssR0FBRyxFQUFFLEtBQUssRUFBRSxHQUFHLENBQUMsUUFBUSxDQUFDLGdCQUFnQixFQUFFLGtCQUFrQixDQUFDLEVBQUUsUUFBUSxFQUFFLGtCQUFrQixFQUFFLEFBQTlGLENBQStGO1FBRXBILFlBQVksRUFBVSxFQUFFLEtBQWEsRUFDaUIsa0JBQXNELEVBQ3RFLGlCQUFxQztZQUUxRSxLQUFLLENBQUMsRUFBRSxFQUFFLEtBQUssQ0FBQyxDQUFDO1lBSG9DLHVCQUFrQixHQUFsQixrQkFBa0IsQ0FBb0M7WUFDdEUsc0JBQWlCLEdBQWpCLGlCQUFpQixDQUFvQjtRQUczRSxDQUFDO1FBRVEsR0FBRztZQUNYLE9BQU8sSUFBSSxDQUFDLGlCQUFpQixDQUFDLGdCQUFnQixDQUFDLElBQUEsb0JBQVEsRUFBQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsUUFBUSxFQUFFLFVBQVUsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLE1BQU0sRUFBRSxpQkFBTyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDOUksQ0FBQzs7SUFkVyxvREFBb0I7bUNBQXBCLG9CQUFvQjtRQU05QixXQUFBLHVEQUFrQyxDQUFBO1FBQ2xDLFdBQUEsMkJBQWtCLENBQUE7T0FQUixvQkFBb0IsQ0FlaEM7SUFFTSxJQUFNLDZCQUE2QixHQUFuQyxNQUFNLDZCQUE4QixTQUFRLGdCQUFNO2lCQUV4QyxPQUFFLEdBQUcsMENBQTBDLEFBQTdDLENBQThDO2lCQUNoRCxVQUFLLEdBQUcsRUFBRSxLQUFLLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQyx5QkFBeUIsRUFBRSw0QkFBNEIsQ0FBQyxFQUFFLFFBQVEsRUFBRSw0QkFBNEIsRUFBRSxBQUEzSCxDQUE0SDtRQUVqSixZQUFZLEVBQVUsRUFBRSxLQUFhLEVBQ2lCLGlCQUFxRCxFQUMzRSxXQUF5QixFQUNuQixpQkFBcUM7WUFFMUUsS0FBSyxDQUFDLEVBQUUsRUFBRSxLQUFLLENBQUMsQ0FBQztZQUpvQyxzQkFBaUIsR0FBakIsaUJBQWlCLENBQW9DO1lBQzNFLGdCQUFXLEdBQVgsV0FBVyxDQUFjO1lBQ25CLHNCQUFpQixHQUFqQixpQkFBaUIsQ0FBb0I7UUFHM0UsQ0FBQztRQUVRLEtBQUssQ0FBQyxHQUFHO1lBQ2pCLE1BQU0sVUFBVSxHQUFHLE1BQU0sSUFBSSxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLGVBQWUsQ0FBQyxDQUFDO1lBQzFGLElBQUksVUFBVSxDQUFDLFFBQVEsSUFBSSxVQUFVLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxFQUFFO2dCQUNsRCxPQUFPLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxnQkFBZ0IsQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsRUFBRSxNQUFNLEVBQUUsaUJBQU8sQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDO2FBQ3RIO1FBQ0YsQ0FBQzs7SUFsQlcsc0VBQTZCOzRDQUE3Qiw2QkFBNkI7UUFNdkMsV0FBQSx1REFBa0MsQ0FBQTtRQUNsQyxXQUFBLG9CQUFZLENBQUE7UUFDWixXQUFBLDJCQUFrQixDQUFBO09BUlIsNkJBQTZCLENBbUJ6QyJ9