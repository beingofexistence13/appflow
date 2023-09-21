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
define(["require", "exports", "vs/base/common/lifecycle", "vs/base/common/uri", "vs/workbench/services/textfile/common/textEditorService", "vs/base/common/resources", "vs/workbench/services/workingCopy/common/workingCopy", "vs/workbench/services/workingCopy/common/workingCopyEditorService", "vs/platform/files/common/files"], function (require, exports, lifecycle_1, uri_1, textEditorService_1, resources_1, workingCopy_1, workingCopyEditorService_1, files_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.FileEditorWorkingCopyEditorHandler = exports.FileEditorInputSerializer = void 0;
    class FileEditorInputSerializer {
        canSerialize(editorInput) {
            return true;
        }
        serialize(editorInput) {
            const fileEditorInput = editorInput;
            const resource = fileEditorInput.resource;
            const preferredResource = fileEditorInput.preferredResource;
            const serializedFileEditorInput = {
                resourceJSON: resource.toJSON(),
                preferredResourceJSON: (0, resources_1.isEqual)(resource, preferredResource) ? undefined : preferredResource,
                name: fileEditorInput.getPreferredName(),
                description: fileEditorInput.getPreferredDescription(),
                encoding: fileEditorInput.getEncoding(),
                modeId: fileEditorInput.getPreferredLanguageId() // only using the preferred user associated language here if available to not store redundant data
            };
            return JSON.stringify(serializedFileEditorInput);
        }
        deserialize(instantiationService, serializedEditorInput) {
            return instantiationService.invokeFunction(accessor => {
                const serializedFileEditorInput = JSON.parse(serializedEditorInput);
                const resource = uri_1.URI.revive(serializedFileEditorInput.resourceJSON);
                const preferredResource = uri_1.URI.revive(serializedFileEditorInput.preferredResourceJSON);
                const name = serializedFileEditorInput.name;
                const description = serializedFileEditorInput.description;
                const encoding = serializedFileEditorInput.encoding;
                const languageId = serializedFileEditorInput.modeId;
                const fileEditorInput = accessor.get(textEditorService_1.ITextEditorService).createTextEditor({ resource, label: name, description, encoding, languageId, forceFile: true });
                if (preferredResource) {
                    fileEditorInput.setPreferredResource(preferredResource);
                }
                return fileEditorInput;
            });
        }
    }
    exports.FileEditorInputSerializer = FileEditorInputSerializer;
    let FileEditorWorkingCopyEditorHandler = class FileEditorWorkingCopyEditorHandler extends lifecycle_1.Disposable {
        constructor(workingCopyEditorService, textEditorService, fileService) {
            super();
            this.textEditorService = textEditorService;
            this.fileService = fileService;
            this._register(workingCopyEditorService.registerHandler(this));
        }
        handles(workingCopy) {
            return workingCopy.typeId === workingCopy_1.NO_TYPE_ID && this.fileService.canHandleResource(workingCopy.resource);
        }
        handlesSync(workingCopy) {
            return workingCopy.typeId === workingCopy_1.NO_TYPE_ID && this.fileService.hasProvider(workingCopy.resource);
        }
        isOpen(workingCopy, editor) {
            if (!this.handlesSync(workingCopy)) {
                return false;
            }
            // Naturally it would make sense here to check for `instanceof FileEditorInput`
            // but because some custom editors also leverage text file based working copies
            // we need to do a weaker check by only comparing for the resource
            return (0, resources_1.isEqual)(workingCopy.resource, editor.resource);
        }
        createEditor(workingCopy) {
            return this.textEditorService.createTextEditor({ resource: workingCopy.resource, forceFile: true });
        }
    };
    exports.FileEditorWorkingCopyEditorHandler = FileEditorWorkingCopyEditorHandler;
    exports.FileEditorWorkingCopyEditorHandler = FileEditorWorkingCopyEditorHandler = __decorate([
        __param(0, workingCopyEditorService_1.IWorkingCopyEditorService),
        __param(1, textEditorService_1.ITextEditorService),
        __param(2, files_1.IFileService)
    ], FileEditorWorkingCopyEditorHandler);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmlsZUVkaXRvckhhbmRsZXIuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9maWxlcy9icm93c2VyL2VkaXRvcnMvZmlsZUVkaXRvckhhbmRsZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBd0JoRyxNQUFhLHlCQUF5QjtRQUVyQyxZQUFZLENBQUMsV0FBd0I7WUFDcEMsT0FBTyxJQUFJLENBQUM7UUFDYixDQUFDO1FBRUQsU0FBUyxDQUFDLFdBQXdCO1lBQ2pDLE1BQU0sZUFBZSxHQUFHLFdBQThCLENBQUM7WUFDdkQsTUFBTSxRQUFRLEdBQUcsZUFBZSxDQUFDLFFBQVEsQ0FBQztZQUMxQyxNQUFNLGlCQUFpQixHQUFHLGVBQWUsQ0FBQyxpQkFBaUIsQ0FBQztZQUM1RCxNQUFNLHlCQUF5QixHQUErQjtnQkFDN0QsWUFBWSxFQUFFLFFBQVEsQ0FBQyxNQUFNLEVBQUU7Z0JBQy9CLHFCQUFxQixFQUFFLElBQUEsbUJBQU8sRUFBQyxRQUFRLEVBQUUsaUJBQWlCLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxpQkFBaUI7Z0JBQzNGLElBQUksRUFBRSxlQUFlLENBQUMsZ0JBQWdCLEVBQUU7Z0JBQ3hDLFdBQVcsRUFBRSxlQUFlLENBQUMsdUJBQXVCLEVBQUU7Z0JBQ3RELFFBQVEsRUFBRSxlQUFlLENBQUMsV0FBVyxFQUFFO2dCQUN2QyxNQUFNLEVBQUUsZUFBZSxDQUFDLHNCQUFzQixFQUFFLENBQUMsa0dBQWtHO2FBQ25KLENBQUM7WUFFRixPQUFPLElBQUksQ0FBQyxTQUFTLENBQUMseUJBQXlCLENBQUMsQ0FBQztRQUNsRCxDQUFDO1FBRUQsV0FBVyxDQUFDLG9CQUEyQyxFQUFFLHFCQUE2QjtZQUNyRixPQUFPLG9CQUFvQixDQUFDLGNBQWMsQ0FBQyxRQUFRLENBQUMsRUFBRTtnQkFDckQsTUFBTSx5QkFBeUIsR0FBK0IsSUFBSSxDQUFDLEtBQUssQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDO2dCQUNoRyxNQUFNLFFBQVEsR0FBRyxTQUFHLENBQUMsTUFBTSxDQUFDLHlCQUF5QixDQUFDLFlBQVksQ0FBQyxDQUFDO2dCQUNwRSxNQUFNLGlCQUFpQixHQUFHLFNBQUcsQ0FBQyxNQUFNLENBQUMseUJBQXlCLENBQUMscUJBQXFCLENBQUMsQ0FBQztnQkFDdEYsTUFBTSxJQUFJLEdBQUcseUJBQXlCLENBQUMsSUFBSSxDQUFDO2dCQUM1QyxNQUFNLFdBQVcsR0FBRyx5QkFBeUIsQ0FBQyxXQUFXLENBQUM7Z0JBQzFELE1BQU0sUUFBUSxHQUFHLHlCQUF5QixDQUFDLFFBQVEsQ0FBQztnQkFDcEQsTUFBTSxVQUFVLEdBQUcseUJBQXlCLENBQUMsTUFBTSxDQUFDO2dCQUVwRCxNQUFNLGVBQWUsR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLHNDQUFrQixDQUFDLENBQUMsZ0JBQWdCLENBQUMsRUFBRSxRQUFRLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxXQUFXLEVBQUUsUUFBUSxFQUFFLFVBQVUsRUFBRSxTQUFTLEVBQUUsSUFBSSxFQUFFLENBQW9CLENBQUM7Z0JBQzVLLElBQUksaUJBQWlCLEVBQUU7b0JBQ3RCLGVBQWUsQ0FBQyxvQkFBb0IsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO2lCQUN4RDtnQkFFRCxPQUFPLGVBQWUsQ0FBQztZQUN4QixDQUFDLENBQUMsQ0FBQztRQUNKLENBQUM7S0FDRDtJQXhDRCw4REF3Q0M7SUFFTSxJQUFNLGtDQUFrQyxHQUF4QyxNQUFNLGtDQUFtQyxTQUFRLHNCQUFVO1FBRWpFLFlBQzRCLHdCQUFtRCxFQUN6QyxpQkFBcUMsRUFDM0MsV0FBeUI7WUFFeEQsS0FBSyxFQUFFLENBQUM7WUFINkIsc0JBQWlCLEdBQWpCLGlCQUFpQixDQUFvQjtZQUMzQyxnQkFBVyxHQUFYLFdBQVcsQ0FBYztZQUl4RCxJQUFJLENBQUMsU0FBUyxDQUFDLHdCQUF3QixDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1FBQ2hFLENBQUM7UUFFRCxPQUFPLENBQUMsV0FBbUM7WUFDMUMsT0FBTyxXQUFXLENBQUMsTUFBTSxLQUFLLHdCQUFVLElBQUksSUFBSSxDQUFDLFdBQVcsQ0FBQyxpQkFBaUIsQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDdEcsQ0FBQztRQUVPLFdBQVcsQ0FBQyxXQUFtQztZQUN0RCxPQUFPLFdBQVcsQ0FBQyxNQUFNLEtBQUssd0JBQVUsSUFBSSxJQUFJLENBQUMsV0FBVyxDQUFDLFdBQVcsQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDaEcsQ0FBQztRQUVELE1BQU0sQ0FBQyxXQUFtQyxFQUFFLE1BQW1CO1lBQzlELElBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLFdBQVcsQ0FBQyxFQUFFO2dCQUNuQyxPQUFPLEtBQUssQ0FBQzthQUNiO1lBRUQsK0VBQStFO1lBQy9FLCtFQUErRTtZQUMvRSxrRUFBa0U7WUFFbEUsT0FBTyxJQUFBLG1CQUFPLEVBQUMsV0FBVyxDQUFDLFFBQVEsRUFBRSxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDdkQsQ0FBQztRQUVELFlBQVksQ0FBQyxXQUFtQztZQUMvQyxPQUFPLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxnQkFBZ0IsQ0FBQyxFQUFFLFFBQVEsRUFBRSxXQUFXLENBQUMsUUFBUSxFQUFFLFNBQVMsRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDO1FBQ3JHLENBQUM7S0FDRCxDQUFBO0lBbkNZLGdGQUFrQztpREFBbEMsa0NBQWtDO1FBRzVDLFdBQUEsb0RBQXlCLENBQUE7UUFDekIsV0FBQSxzQ0FBa0IsQ0FBQTtRQUNsQixXQUFBLG9CQUFZLENBQUE7T0FMRixrQ0FBa0MsQ0FtQzlDIn0=