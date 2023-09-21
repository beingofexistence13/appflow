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
define(["require", "exports", "vs/workbench/common/editor", "vs/workbench/common/editor/resourceEditorInput", "vs/workbench/services/textfile/common/textfiles", "vs/workbench/services/editor/common/editorService", "vs/platform/files/common/files", "vs/platform/label/common/label", "vs/base/common/network", "vs/base/common/resources", "vs/editor/common/services/resolverService", "vs/workbench/common/editor/textResourceEditorModel", "vs/editor/common/model/textModel", "vs/workbench/services/filesConfiguration/common/filesConfigurationService"], function (require, exports, editor_1, resourceEditorInput_1, textfiles_1, editorService_1, files_1, label_1, network_1, resources_1, resolverService_1, textResourceEditorModel_1, textModel_1, filesConfigurationService_1) {
    "use strict";
    var TextResourceEditorInput_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TextResourceEditorInput = exports.AbstractTextResourceEditorInput = void 0;
    /**
     * The base class for all editor inputs that open in text editors.
     */
    let AbstractTextResourceEditorInput = class AbstractTextResourceEditorInput extends resourceEditorInput_1.AbstractResourceEditorInput {
        constructor(resource, preferredResource, editorService, textFileService, labelService, fileService, filesConfigurationService) {
            super(resource, preferredResource, labelService, fileService, filesConfigurationService);
            this.editorService = editorService;
            this.textFileService = textFileService;
        }
        save(group, options) {
            // If this is neither an `untitled` resource, nor a resource
            // we can handle with the file service, we can only "Save As..."
            if (this.resource.scheme !== network_1.Schemas.untitled && !this.fileService.hasProvider(this.resource)) {
                return this.saveAs(group, options);
            }
            // Normal save
            return this.doSave(options, false, group);
        }
        saveAs(group, options) {
            return this.doSave(options, true, group);
        }
        async doSave(options, saveAs, group) {
            // Save / Save As
            let target;
            if (saveAs) {
                target = await this.textFileService.saveAs(this.resource, undefined, { ...options, suggestedTarget: this.preferredResource });
            }
            else {
                target = await this.textFileService.save(this.resource, options);
            }
            if (!target) {
                return undefined; // save cancelled
            }
            return { resource: target };
        }
        async revert(group, options) {
            await this.textFileService.revert(this.resource, options);
        }
    };
    exports.AbstractTextResourceEditorInput = AbstractTextResourceEditorInput;
    exports.AbstractTextResourceEditorInput = AbstractTextResourceEditorInput = __decorate([
        __param(2, editorService_1.IEditorService),
        __param(3, textfiles_1.ITextFileService),
        __param(4, label_1.ILabelService),
        __param(5, files_1.IFileService),
        __param(6, filesConfigurationService_1.IFilesConfigurationService)
    ], AbstractTextResourceEditorInput);
    /**
     * A read-only text editor input whos contents are made of the provided resource that points to an existing
     * code editor model.
     */
    let TextResourceEditorInput = class TextResourceEditorInput extends AbstractTextResourceEditorInput {
        static { TextResourceEditorInput_1 = this; }
        static { this.ID = 'workbench.editors.resourceEditorInput'; }
        get typeId() {
            return TextResourceEditorInput_1.ID;
        }
        get editorId() {
            return editor_1.DEFAULT_EDITOR_ASSOCIATION.id;
        }
        constructor(resource, name, description, preferredLanguageId, preferredContents, textModelResolverService, textFileService, editorService, fileService, labelService, filesConfigurationService) {
            super(resource, undefined, editorService, textFileService, labelService, fileService, filesConfigurationService);
            this.name = name;
            this.description = description;
            this.preferredLanguageId = preferredLanguageId;
            this.preferredContents = preferredContents;
            this.textModelResolverService = textModelResolverService;
            this.cachedModel = undefined;
            this.modelReference = undefined;
        }
        getName() {
            return this.name || super.getName();
        }
        setName(name) {
            if (this.name !== name) {
                this.name = name;
                this._onDidChangeLabel.fire();
            }
        }
        getDescription() {
            return this.description;
        }
        setDescription(description) {
            if (this.description !== description) {
                this.description = description;
                this._onDidChangeLabel.fire();
            }
        }
        setLanguageId(languageId, source) {
            this.setPreferredLanguageId(languageId);
            this.cachedModel?.setLanguageId(languageId, source);
        }
        setPreferredLanguageId(languageId) {
            this.preferredLanguageId = languageId;
        }
        setPreferredContents(contents) {
            this.preferredContents = contents;
        }
        async resolve() {
            // Unset preferred contents and language after resolving
            // once to prevent these properties to stick. We still
            // want the user to change the language in the editor
            // and want to show updated contents (if any) in future
            // `resolve` calls.
            const preferredContents = this.preferredContents;
            const preferredLanguageId = this.preferredLanguageId;
            this.preferredContents = undefined;
            this.preferredLanguageId = undefined;
            if (!this.modelReference) {
                this.modelReference = this.textModelResolverService.createModelReference(this.resource);
            }
            const ref = await this.modelReference;
            // Ensure the resolved model is of expected type
            const model = ref.object;
            if (!(model instanceof textResourceEditorModel_1.TextResourceEditorModel)) {
                ref.dispose();
                this.modelReference = undefined;
                throw new Error(`Unexpected model for TextResourceEditorInput: ${this.resource}`);
            }
            this.cachedModel = model;
            // Set contents and language if preferred
            if (typeof preferredContents === 'string' || typeof preferredLanguageId === 'string') {
                model.updateTextEditorModel(typeof preferredContents === 'string' ? (0, textModel_1.createTextBufferFactory)(preferredContents) : undefined, preferredLanguageId);
            }
            return model;
        }
        matches(otherInput) {
            if (this === otherInput) {
                return true;
            }
            if (otherInput instanceof TextResourceEditorInput_1) {
                return (0, resources_1.isEqual)(otherInput.resource, this.resource);
            }
            if ((0, editor_1.isResourceEditorInput)(otherInput)) {
                return super.matches(otherInput);
            }
            return false;
        }
        dispose() {
            if (this.modelReference) {
                this.modelReference.then(ref => ref.dispose());
                this.modelReference = undefined;
            }
            this.cachedModel = undefined;
            super.dispose();
        }
    };
    exports.TextResourceEditorInput = TextResourceEditorInput;
    exports.TextResourceEditorInput = TextResourceEditorInput = TextResourceEditorInput_1 = __decorate([
        __param(5, resolverService_1.ITextModelService),
        __param(6, textfiles_1.ITextFileService),
        __param(7, editorService_1.IEditorService),
        __param(8, files_1.IFileService),
        __param(9, label_1.ILabelService),
        __param(10, filesConfigurationService_1.IFilesConfigurationService)
    ], TextResourceEditorInput);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGV4dFJlc291cmNlRWRpdG9ySW5wdXQuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29tbW9uL2VkaXRvci90ZXh0UmVzb3VyY2VFZGl0b3JJbnB1dC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7O0lBa0JoRzs7T0FFRztJQUNJLElBQWUsK0JBQStCLEdBQTlDLE1BQWUsK0JBQWdDLFNBQVEsaURBQTJCO1FBRXhGLFlBQ0MsUUFBYSxFQUNiLGlCQUFrQyxFQUNDLGFBQTZCLEVBQzNCLGVBQWlDLEVBQ3ZELFlBQTJCLEVBQzVCLFdBQXlCLEVBQ1gseUJBQXFEO1lBRWpGLEtBQUssQ0FBQyxRQUFRLEVBQUUsaUJBQWlCLEVBQUUsWUFBWSxFQUFFLFdBQVcsRUFBRSx5QkFBeUIsQ0FBQyxDQUFDO1lBTnRELGtCQUFhLEdBQWIsYUFBYSxDQUFnQjtZQUMzQixvQkFBZSxHQUFmLGVBQWUsQ0FBa0I7UUFNdkUsQ0FBQztRQUVRLElBQUksQ0FBQyxLQUFzQixFQUFFLE9BQThCO1lBRW5FLDREQUE0RDtZQUM1RCxnRUFBZ0U7WUFDaEUsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sS0FBSyxpQkFBTyxDQUFDLFFBQVEsSUFBSSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsRUFBRTtnQkFDOUYsT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRSxPQUFPLENBQUMsQ0FBQzthQUNuQztZQUVELGNBQWM7WUFDZCxPQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxFQUFFLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQztRQUMzQyxDQUFDO1FBRVEsTUFBTSxDQUFDLEtBQXNCLEVBQUUsT0FBOEI7WUFDckUsT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8s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