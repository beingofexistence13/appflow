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
define(["require", "exports", "vs/workbench/common/editor", "vs/workbench/common/editor/textResourceEditorInput", "vs/workbench/services/textfile/common/textfiles", "vs/platform/label/common/label", "vs/workbench/services/editor/common/editorService", "vs/platform/files/common/files", "vs/base/common/resources", "vs/workbench/services/environment/common/environmentService", "vs/workbench/services/path/common/pathService", "vs/workbench/services/filesConfiguration/common/filesConfigurationService"], function (require, exports, editor_1, textResourceEditorInput_1, textfiles_1, label_1, editorService_1, files_1, resources_1, environmentService_1, pathService_1, filesConfigurationService_1) {
    "use strict";
    var UntitledTextEditorInput_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.UntitledTextEditorInput = void 0;
    /**
     * An editor input to be used for untitled text buffers.
     */
    let UntitledTextEditorInput = class UntitledTextEditorInput extends textResourceEditorInput_1.AbstractTextResourceEditorInput {
        static { UntitledTextEditorInput_1 = this; }
        static { this.ID = 'workbench.editors.untitledEditorInput'; }
        get typeId() {
            return UntitledTextEditorInput_1.ID;
        }
        get editorId() {
            return editor_1.DEFAULT_EDITOR_ASSOCIATION.id;
        }
        constructor(model, textFileService, labelService, editorService, fileService, environmentService, pathService, filesConfigurationService) {
            super(model.resource, undefined, editorService, textFileService, labelService, fileService, filesConfigurationService);
            this.model = model;
            this.environmentService = environmentService;
            this.pathService = pathService;
            this.modelResolve = undefined;
            this.registerModelListeners(model);
        }
        registerModelListeners(model) {
            // re-emit some events from the model
            this._register(model.onDidChangeDirty(() => this._onDidChangeDirty.fire()));
            this._register(model.onDidChangeName(() => this._onDidChangeLabel.fire()));
            // a reverted untitled text editor model renders this input disposed
            this._register(model.onDidRevert(() => this.dispose()));
        }
        getName() {
            return this.model.name;
        }
        getDescription(verbosity = 1 /* Verbosity.MEDIUM */) {
            // Without associated path: only use if name and description differ
            if (!this.model.hasAssociatedFilePath) {
                const descriptionCandidate = this.resource.path;
                if (descriptionCandidate !== this.getName()) {
                    return descriptionCandidate;
                }
                return undefined;
            }
            // With associated path: delegate to parent
            return super.getDescription(verbosity);
        }
        getTitle(verbosity) {
            // Without associated path: check if name and description differ to decide
            // if description should appear besides the name to distinguish better
            if (!this.model.hasAssociatedFilePath) {
                const name = this.getName();
                const description = this.getDescription();
                if (description && description !== name) {
                    return `${name} • ${description}`;
                }
                return name;
            }
            // With associated path: delegate to parent
            return super.getTitle(verbosity);
        }
        isDirty() {
            return this.model.isDirty();
        }
        getEncoding() {
            return this.model.getEncoding();
        }
        setEncoding(encoding, mode /* ignored, we only have Encode */) {
            return this.model.setEncoding(encoding);
        }
        setLanguageId(languageId, source) {
            this.model.setLanguageId(languageId, source);
        }
        getLanguageId() {
            return this.model.getLanguageId();
        }
        async resolve() {
            if (!this.modelResolve) {
                this.modelResolve = this.model.resolve();
            }
            await this.modelResolve;
            return this.model;
        }
        toUntyped(options) {
            const untypedInput = {
                resource: this.model.hasAssociatedFilePath ? (0, resources_1.toLocalResource)(this.model.resource, this.environmentService.remoteAuthority, this.pathService.defaultUriScheme) : this.resource,
                forceUntitled: true,
                options: {
                    override: this.editorId
                }
            };
            if (typeof options?.preserveViewState === 'number') {
                untypedInput.encoding = this.getEncoding();
                untypedInput.languageId = this.getLanguageId();
                untypedInput.contents = this.model.isModified() ? this.model.textEditorModel?.getValue() : undefined;
                untypedInput.options.viewState = (0, editor_1.findViewStateForEditor)(this, options.preserveViewState, this.editorService);
                if (typeof untypedInput.contents === 'string' && !this.model.hasAssociatedFilePath) {
                    // Given how generic untitled resources in the system are, we
                    // need to be careful not to set our resource into the untyped
                    // editor if we want to transport contents too, because of
                    // issue https://github.com/microsoft/vscode/issues/140898
                    // The workaround is to simply remove the resource association
                    // if we have contents and no associated resource.
                    // In that case we can ensure that a new untitled resource is
                    // being created and the contents can be restored properly.
                    untypedInput.resource = undefined;
                }
            }
            return untypedInput;
        }
        matches(otherInput) {
            if (this === otherInput) {
                return true;
            }
            if (otherInput instanceof UntitledTextEditorInput_1) {
                return (0, resources_1.isEqual)(otherInput.resource, this.resource);
            }
            if ((0, editor_1.isUntitledResourceEditorInput)(otherInput)) {
                return super.matches(otherInput);
            }
            return false;
        }
        dispose() {
            this.modelResolve = undefined;
            super.dispose();
        }
    };
    exports.UntitledTextEditorInput = UntitledTextEditorInput;
    exports.UntitledTextEditorInput = UntitledTextEditorInput = UntitledTextEditorInput_1 = __decorate([
        __param(1, textfiles_1.ITextFileService),
        __param(2, label_1.ILabelService),
        __param(3, editorService_1.IEditorService),
        __param(4, files_1.IFileService),
        __param(5, environmentService_1.IWorkbenchEnvironmentService),
        __param(6, pathService_1.IPathService),
        __param(7, filesConfigurationService_1.IFilesConfigurationService)
    ], UntitledTextEditorInput);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidW50aXRsZWRUZXh0RWRpdG9ySW5wdXQuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvc2VydmljZXMvdW50aXRsZWQvY29tbW9uL3VudGl0bGVkVGV4dEVkaXRvcklucHV0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7Ozs7SUFpQmhHOztPQUVHO0lBQ0ksSUFBTSx1QkFBdUIsR0FBN0IsTUFBTSx1QkFBd0IsU0FBUSx5REFBK0I7O2lCQUUzRCxPQUFFLEdBQVcsdUNBQXVDLEFBQWxELENBQW1EO1FBRXJFLElBQWEsTUFBTTtZQUNsQixPQUFPLHlCQUF1QixDQUFDLEVBQUUsQ0FBQztRQUNuQyxDQUFDO1FBRUQsSUFBYSxRQUFRO1lBQ3BCLE9BQU8sbUNBQTBCLENBQUMsRUFBRSxDQUFDO1FBQ3RDLENBQUM7UUFJRCxZQUNVLEtBQStCLEVBQ3RCLGVBQWlDLEVBQ3BDLFlBQTJCLEVBQzFCLGFBQTZCLEVBQy9CLFdBQXlCLEVBQ1Qsa0JBQWlFLEVBQ2pGLFdBQTBDLEVBQzVCLHlCQUFxRDtZQUVqRixLQUFLLENBQUMsS0FBSyxDQUFDLFFBQVEsRUFBRSxTQUFTLEVBQUUsYUFBYSxFQUFFLGVBQWUsRUFBRSxZQUFZLEVBQUUsV0FBVyxFQUFFLHlCQUF5QixDQUFDLENBQUM7WUFUOUcsVUFBSyxHQUFMLEtBQUssQ0FBMEI7WUFLTyx1QkFBa0IsR0FBbEIsa0JBQWtCLENBQThCO1lBQ2hFLGdCQUFXLEdBQVgsV0FBVyxDQUFjO1lBVGpELGlCQUFZLEdBQThCLFNBQVMsQ0FBQztZQWMzRCxJQUFJLENBQUMsc0JBQXNCLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDcEMsQ0FBQztRQUVPLHNCQUFzQixDQUFDLEtBQStCO1lBRTdELHFDQUFxQztZQUNyQyxJQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxHQUFH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