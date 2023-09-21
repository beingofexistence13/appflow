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
define(["require", "exports", "vs/workbench/services/textfile/common/textfiles", "vs/workbench/services/lifecycle/common/lifecycle", "vs/base/common/lifecycle", "vs/base/common/arrays", "vs/workbench/services/host/browser/host", "vs/workbench/services/editor/common/editorService", "vs/base/common/async", "vs/editor/browser/services/codeEditorService", "vs/workbench/services/filesConfiguration/common/filesConfigurationService", "vs/workbench/contrib/files/common/files", "vs/base/common/network", "vs/workbench/services/untitled/common/untitledTextEditorInput", "vs/workbench/services/workingCopy/common/workingCopyEditorService", "vs/workbench/common/editor"], function (require, exports, textfiles_1, lifecycle_1, lifecycle_2, arrays_1, host_1, editorService_1, async_1, codeEditorService_1, filesConfigurationService_1, files_1, network_1, untitledTextEditorInput_1, workingCopyEditorService_1, editor_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TextFileEditorTracker = void 0;
    let TextFileEditorTracker = class TextFileEditorTracker extends lifecycle_2.Disposable {
        constructor(editorService, textFileService, lifecycleService, hostService, codeEditorService, filesConfigurationService, workingCopyEditorService) {
            super();
            this.editorService = editorService;
            this.textFileService = textFileService;
            this.lifecycleService = lifecycleService;
            this.hostService = hostService;
            this.codeEditorService = codeEditorService;
            this.filesConfigurationService = filesConfigurationService;
            this.workingCopyEditorService = workingCopyEditorService;
            //#region Text File: Ensure every dirty text and untitled file is opened in an editor
            this.ensureDirtyFilesAreOpenedWorker = this._register(new async_1.RunOnceWorker(units => this.ensureDirtyTextFilesAreOpened(units), this.getDirtyTextFileTrackerDelay()));
            this.registerListeners();
        }
        registerListeners() {
            // Ensure dirty text file and untitled models are always opened as editors
            this._register(this.textFileService.files.onDidChangeDirty(model => this.ensureDirtyFilesAreOpenedWorker.work(model.resource)));
            this._register(this.textFileService.files.onDidSaveError(model => this.ensureDirtyFilesAreOpenedWorker.work(model.resource)));
            this._register(this.textFileService.untitled.onDidChangeDirty(model => this.ensureDirtyFilesAreOpenedWorker.work(model.resource)));
            // Update visible text file editors when focus is gained
            this._register(this.hostService.onDidChangeFocus(hasFocus => hasFocus ? this.reloadVisibleTextFileEditors() : undefined));
            // Lifecycle
            this._register(this.lifecycleService.onDidShutdown(() => this.dispose()));
        }
        getDirtyTextFileTrackerDelay() {
            return 800; // encapsulated in a method for tests to override
        }
        ensureDirtyTextFilesAreOpened(resources) {
            this.doEnsureDirtyTextFilesAreOpened((0, arrays_1.distinct)(resources.filter(resource => {
                if (!this.textFileService.isDirty(resource)) {
                    return false; // resource must be dirty
                }
                const fileModel = this.textFileService.files.get(resource);
                if (fileModel?.hasState(2 /* TextFileEditorModelState.PENDING_SAVE */)) {
                    return false; // resource must not be pending to save
                }
                if (resource.scheme !== network_1.Schemas.untitled && this.filesConfigurationService.getAutoSaveMode() === 1 /* AutoSaveMode.AFTER_SHORT_DELAY */ && !fileModel?.hasState(5 /* TextFileEditorModelState.ERROR */)) {
                    // leave models auto saved after short delay unless
                    // the save resulted in an error and not for untitled
                    // that are not auto-saved anyway
                    return false;
                }
                if (this.editorService.isOpened({ resource, typeId: resource.scheme === network_1.Schemas.untitled ? untitledTextEditorInput_1.UntitledTextEditorInput.ID : files_1.FILE_EDITOR_INPUT_ID, editorId: editor_1.DEFAULT_EDITOR_ASSOCIATION.id })) {
                    return false; // model must not be opened already as file (fast check via editor type)
                }
                const model = fileModel ?? this.textFileService.untitled.get(resource);
                if (model && this.workingCopyEditorService.findEditor(model)) {
                    return false; // model must not be opened already as file (slower check via working copy)
                }
                return true;
            }), resource => resource.toString()));
        }
        doEnsureDirtyTextFilesAreOpened(resources) {
            if (!resources.length) {
                return;
            }
            this.editorService.openEditors(resources.map(resource => ({
                resource,
                options: { inactive: true, pinned: true, preserveFocus: true }
            })));
        }
        //#endregion
        //#region Window Focus Change: Update visible code editors when focus is gained that have a known text file model
        reloadVisibleTextFileEditors() {
            // the window got focus and we use this as a hint that files might have been changed outside
            // of this window. since file events can be unreliable, we queue a load for models that
            // are visible in any editor. since this is a fast operation in the case nothing has changed,
            // we tolerate the additional work.
            (0, arrays_1.distinct)((0, arrays_1.coalesce)(this.codeEditorService.listCodeEditors()
                .map(codeEditor => {
                const resource = codeEditor.getModel()?.uri;
                if (!resource) {
                    return undefined;
                }
                const model = this.textFileService.files.get(resource);
                if (!model || model.isDirty() || !model.isResolved()) {
                    return undefined;
                }
                return model;
            })), model => model.resource.toString()).forEach(model => this.textFileService.files.resolve(model.resource, { reload: { async: true } }));
        }
    };
    exports.TextFileEditorTracker = TextFileEditorTracker;
    exports.TextFileEditorTracker = TextFileEditorTracker = __decorate([
        __param(0, editorService_1.IEditorService),
        __param(1, textfiles_1.ITextFileService),
        __param(2, lifecycle_1.ILifecycleService),
        __param(3, host_1.IHostService),
        __param(4, codeEditorService_1.ICodeEditorService),
        __param(5, filesConfigurationService_1.IFilesConfigurationService),
        __param(6, workingCopyEditorService_1.IWorkingCopyEditorService)
    ], TextFileEditorTracker);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGV4dEZpbGVFZGl0b3JUcmFja2VyLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvZmlsZXMvYnJvd3Nlci9lZGl0b3JzL3RleHRGaWxlRWRpdG9yVHJhY2tlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUFtQnpGLElBQU0scUJBQXFCLEdBQTNCLE1BQU0scUJBQXNCLFNBQVEsc0JBQVU7UUFFcEQsWUFDaUIsYUFBOEMsRUFDNUMsZUFBa0QsRUFDakQsZ0JBQW9ELEVBQ3pELFdBQTBDLEVBQ3BDLGlCQUFzRCxFQUM5Qyx5QkFBc0UsRUFDdkUsd0JBQW9FO1lBRS9GLEtBQUssRUFBRSxDQUFDO1lBUnlCLGtCQUFhLEdBQWIsYUFBYSxDQUFnQjtZQUMzQixvQkFBZSxHQUFmLGVBQWUsQ0FBa0I7WUFDaEMscUJBQWdCLEdBQWhCLGdCQUFnQixDQUFtQjtZQUN4QyxnQkFBVyxHQUFYLFdBQVcsQ0FBYztZQUNuQixzQkFBaUIsR0FBakIsaUJBQWlCLENBQW9CO1lBQzdCLDhCQUF5QixHQUF6Qix5QkFBeUIsQ0FBNEI7WUFDdEQsNkJBQXdCLEdBQXhCLHdCQUF3QixDQUEyQjtZQXFCaEcscUZBQXFGO1lBRXBFLG9DQUErQixHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxxQkFBYSxDQUFNLEtBQUssQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLDZCQUE2QixDQUFDLEtBQUssQ0FBQyxFQUFFLElBQUksQ0FBQyw0QkFBNEIsRUFBRSxDQUFDLENBQUMsQ0FBQztZQW5CbEwsSUFBSSxDQUFDLGlCQUFpQixFQUFFLENBQUM7UUFDMUIsQ0FBQztRQUVPLGlCQUFpQjtZQUV4QiwwRUFBMEU7WUFDMUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQywrQkFBK0IsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNoSSxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsS0FBSyxDQUFDLGNBQWMsQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQywrQkFBK0IsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUM5SCxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsUUFBUSxDQUFDLGdCQUFnQixDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLCtCQUErQixDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBRW5JLHdEQUF3RDtZQUN4RCxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsZ0JBQWdCLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyw0QkFBNEIsRUFBRSxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDO1lBRTFILFlBQVk7WUFDWixJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxhQUFhLENBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUMsQ0FBQztRQUMzRSxDQUFDO1FBTVMsNEJBQTRCO1lBQ3JDLE9BQU8sR0FBRyxDQUFDLENBQUMsaURBQWlEO1FBQzlELENBQUM7UUFFTyw2QkFBNkIsQ0FBQyxTQUFnQjtZQUNyRCxJQUFJLENBQUMsK0JBQStCLENBQUMsSUFBQSxpQkFBUSxFQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLEVBQUU7Z0JBQ3pFLElBQUksQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsRUFBRTtvQkFDNUMsT0FBTyxLQUFLLENBQUMsQ0FBQyx5QkFBeUI7aUJBQ3ZDO2dCQUVELE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxlQUFlLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQztnQkFDM0QsSUFBSSxTQUFTLEVBQUUsUUFBUSwrQ0FBdUMsRUFBRTtvQkFDL0QsT0FBTyxLQUFLLENBQUMsQ0FBQyx1Q0FBdUM7aUJBQ3JEO2dCQUVELElBQUksUUFBUSxDQUFDLE1BQU0sS0FBSyxpQkFBTyxDQUFDLFFBQVEsSUFBSSxJQUFJLENBQUMseUJBQXlCLENBQUMsZUFBZSxFQUFFLDJDQUFtQyxJQUFJLENBQUMsU0FBUyxFQUFFLFFBQVEsd0NBQWdDLEVBQUU7b0JBQ3hMLG1EQUFtRDtvQkFDbkQscURBQXFEO29CQUNyRCxpQ0FBaUM7b0JBQ2pDLE9BQU8sS0FBSyxDQUFDO2lCQUNiO2dCQUVELElBQUksSUFBSSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsRUFBRSxRQUFRLEVBQUUsTUFBTSxFQUFFLFFBQVEsQ0FBQyxNQUFNLEtBQUssaUJBQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLGlEQUF1QixDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsNEJBQW9CLEVBQUUsUUFBUSxFQUFFLG1DQUEwQixDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUU7b0JBQ3pMLE9BQU8sS0FBSyxDQUFDLENBQUMsd0VBQXdFO2lCQUN0RjtnQkFFRCxNQUFNLEtBQUssR0FBRyxTQUFTLElBQUksSUFBSSxDQUFDLGVBQWUsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDO2dCQUN2RSxJQUFJLEtBQUssSUFBSSxJQUFJLENBQUMsd0JBQXdCLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxFQUFFO29CQUM3RCxPQUFPLEtBQUssQ0FBQyxDQUFDLDJFQUEyRTtpQkFDekY7Z0JBRUQsT0FBTyxJQUFJLENBQUM7WUFDYixDQUFDLENBQUMsRUFBRSxRQUFRLENBQUMsRUFBRSxDQUFDLFFBQVEsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDdkMsQ0FBQztRQUVPLCtCQUErQixDQUFDLFNBQWdCO1lBQ3ZELElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxFQUFFO2dCQUN0QixPQUFPO2FBQ1A7WUFFRCxJQUFJLENBQUMsYUFBYSxDQUFDLFdBQVcsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsQ0FBQztnQkFDekQsUUFBUTtnQkFDUixPQUFPLEVBQUUsRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUUsYUFBYSxFQUFFLElBQUksRUFBRTthQUM5RCxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ04sQ0FBQztRQUVELFlBQVk7UUFFWixpSEFBaUg7UUFFekcsNEJBQTRCO1lBQ25DLDRGQUE0RjtZQUM1Rix1RkFBdUY7WUFDdkYsNkZBQTZGO1lBQzdGLG1DQUFtQztZQUNuQyxJQUFBLGlCQUFRLEVBQ1AsSUFBQSxpQkFBUSxFQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxlQUFlLEVBQUU7aUJBQy9DLEdBQUcsQ0FBQyxVQUFVLENBQUMsRUFBRTtnQkFDakIsTUFBTSxRQUFRLEdBQUcsVUFBVSxDQUFDLFFBQVEsRUFBRSxFQUFFLEdBQUcsQ0FBQztnQkFDNUMsSUFBSSxDQUFDLFFBQVEsRUFBRTtvQkFDZCxPQUFPLFNBQVMsQ0FBQztpQkFDakI7Z0JBRUQsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLGVBQWUsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDO2dCQUN2RCxJQUFJLENBQUMsS0FBSyxJQUFJLEtBQUssQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxVQUFVLEVBQUUsRUFBRTtvQkFDckQsT0FBTyxTQUFTLENBQUM7aUJBQ2pCO2dCQUVELE9BQU8sS0FBSyxDQUFDO1lBQ2QsQ0FBQyxDQUFDLENBQUMsRUFDSixLQUFLLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsUUFBUSxFQUFFLENBQ2xDLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxRQUFRLEVBQUUsRUFBRSxNQUFNLEVBQUUsRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDckcsQ0FBQztLQUdELENBQUE7SUE3R1ksc0RBQXFCO29DQUFyQixxQkFBcUI7UUFHL0IsV0FBQSw4QkFBYyxDQUFBO1FBQ2QsV0FBQSw0QkFBZ0IsQ0FBQTtRQUNoQixXQUFBLDZCQUFpQixDQUFBO1FBQ2pCLFdBQUEsbUJBQVksQ0FBQTtRQUNaLFdBQUEsc0NBQWtCLENBQUE7UUFDbEIsV0FBQSxzREFBMEIsQ0FBQTtRQUMxQixXQUFBLG9EQUF5QixDQUFBO09BVGYscUJBQXFCLENBNkdqQyJ9