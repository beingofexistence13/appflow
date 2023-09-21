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
define(["require", "exports", "vs/workbench/services/textfile/browser/textFileService", "vs/workbench/services/textfile/common/textfiles", "vs/platform/instantiation/common/extensions", "vs/workbench/services/environment/common/environmentService", "vs/editor/browser/services/codeEditorService", "vs/editor/common/services/model", "vs/editor/common/languages/language", "vs/editor/common/services/textResourceConfiguration", "vs/platform/dialogs/common/dialogs", "vs/platform/files/common/files", "vs/platform/instantiation/common/instantiation", "vs/platform/log/common/log", "vs/workbench/services/files/common/elevatedFileService", "vs/workbench/services/filesConfiguration/common/filesConfigurationService", "vs/workbench/services/lifecycle/common/lifecycle", "vs/workbench/services/path/common/pathService", "vs/workbench/services/untitled/common/untitledTextEditorService", "vs/platform/uriIdentity/common/uriIdentity", "vs/workbench/services/workingCopy/common/workingCopyFileService", "vs/workbench/services/decorations/common/decorations"], function (require, exports, textFileService_1, textfiles_1, extensions_1, environmentService_1, codeEditorService_1, model_1, language_1, textResourceConfiguration_1, dialogs_1, files_1, instantiation_1, log_1, elevatedFileService_1, filesConfigurationService_1, lifecycle_1, pathService_1, untitledTextEditorService_1, uriIdentity_1, workingCopyFileService_1, decorations_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.BrowserTextFileService = void 0;
    let BrowserTextFileService = class BrowserTextFileService extends textFileService_1.AbstractTextFileService {
        constructor(fileService, untitledTextEditorService, lifecycleService, instantiationService, modelService, environmentService, dialogService, fileDialogService, textResourceConfigurationService, filesConfigurationService, codeEditorService, pathService, workingCopyFileService, uriIdentityService, languageService, elevatedFileService, logService, decorationsService) {
            super(fileService, untitledTextEditorService, lifecycleService, instantiationService, modelService, environmentService, dialogService, fileDialogService, textResourceConfigurationService, filesConfigurationService, codeEditorService, pathService, workingCopyFileService, uriIdentityService, languageService, logService, elevatedFileService, decorationsService);
            this.registerListeners();
        }
        registerListeners() {
            // Lifecycle
            this._register(this.lifecycleService.onBeforeShutdown(event => event.veto(this.onBeforeShutdown(), 'veto.textFiles')));
        }
        onBeforeShutdown() {
            if (this.files.models.some(model => model.hasState(2 /* TextFileEditorModelState.PENDING_SAVE */))) {
                return true; // files are pending to be saved: veto (as there is no support for long running operations on shutdown)
            }
            return false;
        }
    };
    exports.BrowserTextFileService = BrowserTextFileService;
    exports.BrowserTextFileService = BrowserTextFileService = __decorate([
        __param(0, files_1.IFileService),
        __param(1, untitledTextEditorService_1.IUntitledTextEditorService),
        __param(2, lifecycle_1.ILifecycleService),
        __param(3, instantiation_1.IInstantiationService),
        __param(4, model_1.IModelService),
        __param(5, environmentService_1.IWorkbenchEnvironmentService),
        __param(6, dialogs_1.IDialogService),
        __param(7, dialogs_1.IFileDialogService),
        __param(8, textResourceConfiguration_1.ITextResourceConfigurationService),
        __param(9, filesConfigurationService_1.IFilesConfigurationService),
        __param(10, codeEditorService_1.ICodeEditorService),
        __param(11, pathService_1.IPathService),
        __param(12, workingCopyFileService_1.IWorkingCopyFileService),
        __param(13, uriIdentity_1.IUriIdentityService),
        __param(14, language_1.ILanguageService),
        __param(15, elevatedFileService_1.IElevatedFileService),
        __param(16, log_1.ILogService),
        __param(17, decorations_1.IDecorationsService)
    ], BrowserTextFileService);
    (0, extensions_1.registerSingleton)(textfiles_1.ITextFileService, BrowserTextFileService, 0 /* InstantiationType.Eager */);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnJvd3NlclRleHRGaWxlU2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9zZXJ2aWNlcy90ZXh0ZmlsZS9icm93c2VyL2Jyb3dzZXJUZXh0RmlsZVNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBdUJ6RixJQUFNLHNCQUFzQixHQUE1QixNQUFNLHNCQUF1QixTQUFRLHlDQUF1QjtRQUVsRSxZQUNlLFdBQXlCLEVBQ1gseUJBQXFELEVBQzlELGdCQUFtQyxFQUMvQixvQkFBMkMsRUFDbkQsWUFBMkIsRUFDWixrQkFBZ0QsRUFDOUQsYUFBNkIsRUFDekIsaUJBQXFDLEVBQ3RCLGdDQUFtRSxFQUMxRSx5QkFBcUQsRUFDN0QsaUJBQXFDLEVBQzNDLFdBQXlCLEVBQ2Qsc0JBQStDLEVBQ25ELGtCQUF1QyxFQUMxQyxlQUFpQyxFQUM3QixtQkFBeUMsRUFDbEQsVUFBdUIsRUFDZixrQkFBdUM7WUFFNUQsS0FBSyxDQUFDLFdBQVcsRUFBRSx5QkFBeUIsRUFBRSxnQkFBZ0IsRUFBRSxvQkFBb0IsRUFBRSxZQUFZLEVBQUUsa0JBQWtCLEVBQUUsYUFBYSxFQUFFLGlCQUFpQixFQUFFLGdDQUFnQyxFQUFFLHlCQUF5QixFQUFFLGlCQUFpQixFQUFFLFdBQVcsRUFBRSxzQkFBc0IsRUFBRSxrQkFBa0IsRUFBRSxlQUFlLEVBQUUsVUFBVSxFQUFFLG1CQUFtQixFQUFFLGtCQUFrQixDQUFDLENBQUM7WUFFelcsSUFBSSxDQUFDLGlCQUFpQixFQUFFLENBQUM7UUFDMUIsQ0FBQztRQUVPLGlCQUFpQjtZQUV4QixZQUFZO1lBQ1osSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsZ0JBQWdCLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxFQUFFLGdCQUFnQixDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3hILENBQUM7UUFFTyxnQkFBZ0I7WUFDdkIsSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsUUFBUSwrQ0FBdUMsQ0FBQyxFQUFFO2dCQUMzRixPQUFPLElBQUksQ0FBQyxDQUFDLHVHQUF1RzthQUNwSDtZQUVELE9BQU8sS0FBSyxDQUFDO1FBQ2QsQ0FBQztLQUNELENBQUE7SUF4Q1ksd0RBQXNCO3FDQUF0QixzQkFBc0I7UUFHaEMsV0FBQSxvQkFBWSxDQUFBO1FBQ1osV0FBQSxzREFBMEIsQ0FBQTtRQUMxQixXQUFBLDZCQUFpQixDQUFBO1FBQ2pCLFdBQUEscUNBQXFCLENBQUE7UUFDckIsV0FBQSxxQkFBYSxDQUFBO1FBQ2IsV0FBQSxpREFBNEIsQ0FBQTtRQUM1QixXQUFBLHdCQUFjLENBQUE7UUFDZCxXQUFBLDRCQUFrQixDQUFBO1FBQ2xCLFdBQUEsNkRBQWlDLENBQUE7UUFDakMsV0FBQSxzREFBMEIsQ0FBQTtRQUMxQixZQUFBLHNDQUFrQixDQUFBO1FBQ2xCLFlBQUEsMEJBQVksQ0FBQTtRQUNaLFlBQUEsZ0RBQXVCLENBQUE7UUFDdkIsWUFBQSxpQ0FBbUIsQ0FBQTtRQUNuQixZQUFBLDJCQUFnQixDQUFBO1FBQ2hCLFlBQUEsMENBQW9CLENBQUE7UUFDcEIsWUFBQSxpQkFBVyxDQUFBO1FBQ1gsWUFBQSxpQ0FBbUIsQ0FBQTtPQXBCVCxzQkFBc0IsQ0F3Q2xDO0lBRUQsSUFBQSw4QkFBaUIsRUFBQyw0QkFBZ0IsRUFBRSxzQkFBc0Isa0NBQTBCLENBQUMifQ==