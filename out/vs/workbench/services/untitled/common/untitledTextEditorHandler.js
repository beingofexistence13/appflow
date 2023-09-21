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
define(["require", "exports", "vs/base/common/network", "vs/base/common/lifecycle", "vs/base/common/uri", "vs/workbench/services/textfile/common/textEditorService", "vs/base/common/resources", "vs/editor/common/languages/modesRegistry", "vs/workbench/services/environment/common/environmentService", "vs/workbench/services/filesConfiguration/common/filesConfigurationService", "vs/workbench/services/path/common/pathService", "vs/workbench/services/untitled/common/untitledTextEditorInput", "vs/workbench/services/workingCopy/common/workingCopy", "vs/workbench/services/workingCopy/common/workingCopyEditorService", "vs/workbench/services/untitled/common/untitledTextEditorService"], function (require, exports, network_1, lifecycle_1, uri_1, textEditorService_1, resources_1, modesRegistry_1, environmentService_1, filesConfigurationService_1, pathService_1, untitledTextEditorInput_1, workingCopy_1, workingCopyEditorService_1, untitledTextEditorService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.UntitledTextEditorWorkingCopyEditorHandler = exports.UntitledTextEditorInputSerializer = void 0;
    let UntitledTextEditorInputSerializer = class UntitledTextEditorInputSerializer {
        constructor(filesConfigurationService, environmentService, pathService) {
            this.filesConfigurationService = filesConfigurationService;
            this.environmentService = environmentService;
            this.pathService = pathService;
        }
        canSerialize(editorInput) {
            return this.filesConfigurationService.isHotExitEnabled && !editorInput.isDisposed();
        }
        serialize(editorInput) {
            if (!this.filesConfigurationService.isHotExitEnabled || editorInput.isDisposed()) {
                return undefined;
            }
            const untitledTextEditorInput = editorInput;
            let resource = untitledTextEditorInput.resource;
            if (untitledTextEditorInput.model.hasAssociatedFilePath) {
                resource = (0, resources_1.toLocalResource)(resource, this.environmentService.remoteAuthority, this.pathService.defaultUriScheme); // untitled with associated file path use the local schema
            }
            // Language: only remember language if it is either specific (not text)
            // or if the language was explicitly set by the user. We want to preserve
            // this information across restarts and not set the language unless
            // this is the case.
            let languageId;
            const languageIdCandidate = untitledTextEditorInput.getLanguageId();
            if (languageIdCandidate !== modesRegistry_1.PLAINTEXT_LANGUAGE_ID) {
                languageId = languageIdCandidate;
            }
            else if (untitledTextEditorInput.model.hasLanguageSetExplicitly) {
                languageId = languageIdCandidate;
            }
            const serialized = {
                resourceJSON: resource.toJSON(),
                modeId: languageId,
                encoding: untitledTextEditorInput.getEncoding()
            };
            return JSON.stringify(serialized);
        }
        deserialize(instantiationService, serializedEditorInput) {
            return instantiationService.invokeFunction(accessor => {
                const deserialized = JSON.parse(serializedEditorInput);
                const resource = uri_1.URI.revive(deserialized.resourceJSON);
                const languageId = deserialized.modeId;
                const encoding = deserialized.encoding;
                return accessor.get(textEditorService_1.ITextEditorService).createTextEditor({ resource, languageId, encoding, forceUntitled: true });
            });
        }
    };
    exports.UntitledTextEditorInputSerializer = UntitledTextEditorInputSerializer;
    exports.UntitledTextEditorInputSerializer = UntitledTextEditorInputSerializer = __decorate([
        __param(0, filesConfigurationService_1.IFilesConfigurationService),
        __param(1, environmentService_1.IWorkbenchEnvironmentService),
        __param(2, pathService_1.IPathService)
    ], UntitledTextEditorInputSerializer);
    let UntitledTextEditorWorkingCopyEditorHandler = class UntitledTextEditorWorkingCopyEditorHandler extends lifecycle_1.Disposable {
        constructor(workingCopyEditorService, environmentService, pathService, textEditorService, untitledTextEditorService) {
            super();
            this.environmentService = environmentService;
            this.pathService = pathService;
            this.textEditorService = textEditorService;
            this.untitledTextEditorService = untitledTextEditorService;
            this._register(workingCopyEditorService.registerHandler(this));
        }
        handles(workingCopy) {
            return workingCopy.resource.scheme === network_1.Schemas.untitled && workingCopy.typeId === workingCopy_1.NO_TYPE_ID;
        }
        isOpen(workingCopy, editor) {
            if (!this.handles(workingCopy)) {
                return false;
            }
            return editor instanceof untitledTextEditorInput_1.UntitledTextEditorInput && (0, resources_1.isEqual)(workingCopy.resource, editor.resource);
        }
        createEditor(workingCopy) {
            let editorInputResource;
            // If the untitled has an associated resource,
            // ensure to restore the local resource it had
            if (this.untitledTextEditorService.isUntitledWithAssociatedResource(workingCopy.resource)) {
                editorInputResource = (0, resources_1.toLocalResource)(workingCopy.resource, this.environmentService.remoteAuthority, this.pathService.defaultUriScheme);
            }
            else {
                editorInputResource = workingCopy.resource;
            }
            return this.textEditorService.createTextEditor({ resource: editorInputResource, forceUntitled: true });
        }
    };
    exports.UntitledTextEditorWorkingCopyEditorHandler = UntitledTextEditorWorkingCopyEditorHandler;
    exports.UntitledTextEditorWorkingCopyEditorHandler = UntitledTextEditorWorkingCopyEditorHandler = __decorate([
        __param(0, workingCopyEditorService_1.IWorkingCopyEditorService),
        __param(1, environmentService_1.IWorkbenchEnvironmentService),
        __param(2, pathService_1.IPathService),
        __param(3, textEditorService_1.ITextEditorService),
        __param(4, untitledTextEditorService_1.IUntitledTextEditorService)
    ], UntitledTextEditorWorkingCopyEditorHandler);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidW50aXRsZWRUZXh0RWRpdG9ySGFuZGxlci5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9zZXJ2aWNlcy91bnRpdGxlZC9jb21tb24vdW50aXRsZWRUZXh0RWRpdG9ySGFuZGxlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUEwQnpGLElBQU0saUNBQWlDLEdBQXZDLE1BQU0saUNBQWlDO1FBRTdDLFlBQzhDLHlCQUFxRCxFQUNuRCxrQkFBZ0QsRUFDaEUsV0FBeUI7WUFGWCw4QkFBeUIsR0FBekIseUJBQXlCLENBQTRCO1lBQ25ELHVCQUFrQixHQUFsQixrQkFBa0IsQ0FBOEI7WUFDaEUsZ0JBQVcsR0FBWCxXQUFXLENBQWM7UUFDckQsQ0FBQztRQUVMLFlBQVksQ0FBQyxXQUF3QjtZQUNwQyxPQUFPLElBQUksQ0FBQyx5QkFBeUIsQ0FBQyxnQkFBZ0IsSUFBSSxDQUFDLFdBQVcsQ0FBQyxVQUFVLEVBQUUsQ0FBQztRQUNyRixDQUFDO1FBRUQsU0FBUyxDQUFDLFdBQXdCO1lBQ2pDLElBQUksQ0FBQyxJQUFJLENBQUMseUJBQXlCLENBQUMsZ0JBQWdCLElBQUksV0FBVyxDQUFDLFVBQVUsRUFBRSxFQUFFO2dCQUNqRixPQUFPLFNBQVMsQ0FBQzthQUNqQjtZQUVELE1BQU0sdUJBQXVCLEdBQUcsV0FBc0MsQ0FBQztZQUV2RSxJQUFJLFFBQVEsR0FBRyx1QkFBdUIsQ0FBQyxRQUFRLENBQUM7WUFDaEQsSUFBSSx1QkFBdUIsQ0FBQyxLQUFLLENBQUMscUJBQXFCLEVBQUU7Z0JBQ3hELFFBQVEsR0FBRyxJQUFBLDJCQUFlLEVBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxlQUFlLEVBQUUsSUFBSSxDQUFDLFdBQVcsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUMsMERBQTBEO2FBQzVLO1lBRUQsdUVB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