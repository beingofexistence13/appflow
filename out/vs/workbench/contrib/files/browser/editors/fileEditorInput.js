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
define(["require", "exports", "vs/workbench/common/editor", "vs/workbench/common/editor/textResourceEditorInput", "vs/workbench/common/editor/binaryEditorModel", "vs/platform/files/common/files", "vs/workbench/services/textfile/common/textfiles", "vs/platform/instantiation/common/instantiation", "vs/base/common/lifecycle", "vs/editor/common/services/resolverService", "vs/workbench/contrib/files/common/files", "vs/platform/label/common/label", "vs/workbench/services/filesConfiguration/common/filesConfigurationService", "vs/workbench/services/editor/common/editorService", "vs/base/common/resources", "vs/base/common/event", "vs/base/common/network", "vs/editor/common/model/textModel", "vs/workbench/services/path/common/pathService", "vs/editor/common/services/textResourceConfiguration", "vs/platform/configuration/common/configuration"], function (require, exports, editor_1, textResourceEditorInput_1, binaryEditorModel_1, files_1, textfiles_1, instantiation_1, lifecycle_1, resolverService_1, files_2, label_1, filesConfigurationService_1, editorService_1, resources_1, event_1, network_1, textModel_1, pathService_1, textResourceConfiguration_1, configuration_1) {
    "use strict";
    var FileEditorInput_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.FileEditorInput = void 0;
    var ForceOpenAs;
    (function (ForceOpenAs) {
        ForceOpenAs[ForceOpenAs["None"] = 0] = "None";
        ForceOpenAs[ForceOpenAs["Text"] = 1] = "Text";
        ForceOpenAs[ForceOpenAs["Binary"] = 2] = "Binary";
    })(ForceOpenAs || (ForceOpenAs = {}));
    /**
     * A file editor input is the input type for the file editor of file system resources.
     */
    let FileEditorInput = FileEditorInput_1 = class FileEditorInput extends textResourceEditorInput_1.AbstractTextResourceEditorInput {
        get typeId() {
            return files_2.FILE_EDITOR_INPUT_ID;
        }
        get editorId() {
            return editor_1.DEFAULT_EDITOR_ASSOCIATION.id;
        }
        get capabilities() {
            let capabilities = 32 /* EditorInputCapabilities.CanSplitInGroup */;
            if (this.model) {
                if (this.model.isReadonly()) {
                    capabilities |= 2 /* EditorInputCapabilities.Readonly */;
                }
            }
            else {
                if (this.fileService.hasProvider(this.resource)) {
                    if (this.filesConfigurationService.isReadonly(this.resource)) {
                        capabilities |= 2 /* EditorInputCapabilities.Readonly */;
                    }
                }
                else {
                    capabilities |= 4 /* EditorInputCapabilities.Untitled */;
                }
            }
            if (!(capabilities & 2 /* EditorInputCapabilities.Readonly */)) {
                capabilities |= 128 /* EditorInputCapabilities.CanDropIntoEditor */;
            }
            return capabilities;
        }
        constructor(resource, preferredResource, preferredName, preferredDescription, preferredEncoding, preferredLanguageId, preferredContents, instantiationService, textFileService, textModelResolverService, labelService, fileService, filesConfigurationService, editorService, pathService, textResourceConfigurationService) {
            super(resource, preferredResource, editorService, textFileService, labelService, fileService, filesConfigurationService);
            this.instantiationService = instantiationService;
            this.textModelResolverService = textModelResolverService;
            this.pathService = pathService;
            this.textResourceConfigurationService = textResourceConfigurationService;
            this.forceOpenAs = 0 /* ForceOpenAs.None */;
            this.model = undefined;
            this.cachedTextFileModelReference = undefined;
            this.modelListeners = this._register(new lifecycle_1.DisposableStore());
            this.model = this.textFileService.files.get(resource);
            if (preferredName) {
                this.setPreferredName(preferredName);
            }
            if (preferredDescription) {
                this.setPreferredDescription(preferredDescription);
            }
            if (preferredEncoding) {
                this.setPreferredEncoding(preferredEncoding);
            }
            if (preferredLanguageId) {
                this.setPreferredLanguageId(preferredLanguageId);
            }
            if (typeof preferredContents === 'string') {
                this.setPreferredContents(preferredContents);
            }
            // Attach to model that matches our resource once created
            this._register(this.textFileService.files.onDidCreate(model => this.onDidCreateTextFileModel(model)));
            // If a file model already exists, make sure to wire it in
            if (this.model) {
                this.registerModelListeners(this.model);
            }
        }
        onDidCreateTextFileModel(model) {
            // Once the text file model is created, we keep it inside
            // the input to be able to implement some methods properly
            if ((0, resources_1.isEqual)(model.resource, this.resource)) {
                this.model = model;
                this.registerModelListeners(model);
            }
        }
        registerModelListeners(model) {
            // Clear any old
            this.modelListeners.clear();
            // re-emit some events from the model
            this.modelListeners.add(model.onDidChangeDirty(() => this._onDidChangeDirty.fire()));
            this.modelListeners.add(model.onDidChangeReadonly(() => this._onDidChangeCapabilities.fire()));
            // important: treat save errors as potential dirty change because
            // a file that is in save conflict or error will report dirty even
            // if auto save is turned on.
            this.modelListeners.add(model.onDidSaveError(() => this._onDidChangeDirty.fire()));
            // remove model association once it gets disposed
            this.modelListeners.add(event_1.Event.once(model.onWillDispose)(() => {
                this.modelListeners.clear();
                this.model = undefined;
            }));
        }
        getName() {
            return this.preferredName || super.getName();
        }
        setPreferredName(name) {
            if (!this.allowLabelOverride()) {
                return; // block for specific schemes we consider to be owning
            }
            if (this.preferredName !== name) {
                this.preferredName = name;
                this._onDidChangeLabel.fire();
            }
        }
        allowLabelOverride() {
            return this.resource.scheme !== this.pathService.defaultUriScheme &&
                this.resource.scheme !== network_1.Schemas.vscodeUserData &&
                this.resource.scheme !== network_1.Schemas.file &&
                this.resource.scheme !== network_1.Schemas.vscodeRemote;
        }
        getPreferredName() {
            return this.preferredName;
        }
        isReadonly() {
            return this.model ? this.model.isReadonly() : this.filesConfigurationService.isReadonly(this.resource);
        }
        getDescription(verbosity) {
            return this.preferredDescription || super.getDescription(verbosity);
        }
        setPreferredDescription(description) {
            if (!this.allowLabelOverride()) {
                return; // block for specific schemes we consider to be owning
            }
            if (this.preferredDescription !== description) {
                this.preferredDescription = description;
                this._onDidChangeLabel.fire();
            }
        }
        getPreferredDescription() {
            return this.preferredDescription;
        }
        getEncoding() {
            if (this.model) {
                return this.model.getEncoding();
            }
            return this.preferredEncoding;
        }
        getPreferredEncoding() {
            return this.preferredEncoding;
        }
        async setEncoding(encoding, mode) {
            this.setPreferredEncoding(encoding);
            return this.model?.setEncoding(encoding, mode);
        }
        setPreferredEncoding(encoding) {
            this.preferredEncoding = encoding;
            // encoding is a good hint to open the file as text
            this.setForceOpenAsText();
        }
        getLanguageId() {
            if (this.model) {
                return this.model.getLanguageId();
            }
            return this.preferredLanguageId;
        }
        getPreferredLanguageId() {
            return this.preferredLanguageId;
        }
        setLanguageId(languageId, source) {
            this.setPreferredLanguageId(languageId);
            this.model?.setLanguageId(languageId, source);
        }
        setPreferredLanguageId(languageId) {
            this.preferredLanguageId = languageId;
            // languages are a good hint to open the file as text
            this.setForceOpenAsText();
        }
        setPreferredContents(contents) {
            this.preferredContents = contents;
            // contents is a good hint to open the file as text
            this.setForceOpenAsText();
        }
        setForceOpenAsText() {
            this.forceOpenAs = 1 /* ForceOpenAs.Text */;
        }
        setForceOpenAsBinary() {
            this.forceOpenAs = 2 /* ForceOpenAs.Binary */;
        }
        isDirty() {
            return !!(this.model?.isDirty());
        }
        isSaving() {
            if (this.model?.hasState(0 /* TextFileEditorModelState.SAVED */) || this.model?.hasState(3 /* TextFileEditorModelState.CONFLICT */) || this.model?.hasState(5 /* TextFileEditorModelState.ERROR */)) {
                return false; // require the model to be dirty and not in conflict or error state
            }
            // Note: currently not checking for ModelState.PENDING_SAVE for a reason
            // because we currently miss an event for this state change on editors
            // and it could result in bad UX where an editor can be closed even though
            // it shows up as dirty and has not finished saving yet.
            if (this.filesConfigurationService.getAutoSaveMode() === 1 /* AutoSaveMode.AFTER_SHORT_DELAY */) {
                return true; // a short auto save is configured, treat this as being saved
            }
            return super.isSaving();
        }
        prefersEditorPane(editorPanes) {
            if (this.forceOpenAs === 2 /* ForceOpenAs.Binary */) {
                return editorPanes.find(editorPane => editorPane.typeId === files_2.BINARY_FILE_EDITOR_ID);
            }
            return editorPanes.find(editorPane => editorPane.typeId === files_2.TEXT_FILE_EDITOR_ID);
        }
        resolve(options) {
            // Resolve as binary
            if (this.forceOpenAs === 2 /* ForceOpenAs.Binary */) {
                return this.doResolveAsBinary();
            }
            // Resolve as text
            return this.doResolveAsText(options);
        }
        async doResolveAsText(options) {
            try {
                // Unset preferred contents after having applied it once
                // to prevent this property to stick. We still want future
                // `resolve` calls to fetch the contents from disk.
                const preferredContents = this.preferredContents;
                this.preferredContents = undefined;
                // Resolve resource via text file service and only allow
                // to open binary files if we are instructed so
                await this.textFileService.files.resolve(this.resource, {
                    languageId: this.preferredLanguageId,
                    encoding: this.preferredEncoding,
                    contents: typeof preferredContents === 'string' ? (0, textModel_1.createTextBufferFactory)(preferredContents) : undefined,
                    reload: { async: true },
                    allowBinary: this.forceOpenAs === 1 /* ForceOpenAs.Text */,
                    reason: 1 /* TextFileResolveReason.EDITOR */,
                    limits: this.ensureLimits(options)
                });
                // This is a bit ugly, because we first resolve the model and then resolve a model reference. the reason being that binary
                // or very large files do not resolve to a text file model but should be opened as binary files without text. First calling into
                // resolve() ensures we are not creating model references for these kind of resources.
                // In addition we have a bit of payload to take into account (encoding, reload) that the text resolver does not handle yet.
                if (!this.cachedTextFileModelReference) {
                    this.cachedTextFileModelReference = await this.textModelResolverService.createModelReference(this.resource);
                }
                const model = this.cachedTextFileModelReference.object;
                // It is possible that this input was disposed before the model
                // finished resolving. As such, we need to make sure to dispose
                // the model reference to not leak it.
                if (this.isDisposed()) {
                    this.disposeModelReference();
                }
                return model;
            }
            catch (error) {
                // Handle binary files with binary model
                if (error.textFileOperationResult === 0 /* TextFileOperationResult.FILE_IS_BINARY */) {
                    return this.doResolveAsBinary();
                }
                // Bubble any other error up
                throw error;
            }
        }
        ensureLimits(options) {
            if (options?.limits) {
                return options.limits; // respect passed in limits if any
            }
            // We want to determine the large file configuration based on the best defaults
            // for the resource but also respecting user settings. We only apply user settings
            // if explicitly configured by the user. Otherwise we pick the best limit for the
            // resource scheme.
            const defaultSizeLimit = (0, files_1.getLargeFileConfirmationLimit)(this.resource);
            let configuredSizeLimit = undefined;
            const configuredSizeLimitMb = this.textResourceConfigurationService.inspect(this.resource, null, 'workbench.editorLargeFileConfirmation');
            if ((0, configuration_1.isConfigured)(configuredSizeLimitMb)) {
                configuredSizeLimit = configuredSizeLimitMb.value * files_1.ByteSize.MB; // normalize to MB
            }
            return {
                size: configuredSizeLimit ?? defaultSizeLimit
            };
        }
        async doResolveAsBinary() {
            const model = this.instantiationService.createInstance(binaryEditorModel_1.BinaryEditorModel, this.preferredResource, this.getName());
            await model.resolve();
            return model;
        }
        isResolved() {
            return !!this.model;
        }
        async rename(group, target) {
            return {
                editor: {
                    resource: target,
                    encoding: this.getEncoding(),
                    options: {
                        viewState: (0, editor_1.findViewStateForEditor)(this, group, this.editorService)
                    }
                }
            };
        }
        toUntyped(options) {
            const untypedInput = {
                resource: this.preferredResource,
                forceFile: true,
                options: {
                    override: this.editorId
                }
            };
            if (typeof options?.preserveViewState === 'number') {
                untypedInput.encoding = this.getEncoding();
                untypedInput.languageId = this.getLanguageId();
                untypedInput.contents = (() => {
                    const model = this.textFileService.files.get(this.resource);
                    if (model?.isDirty() && !model.textEditorModel.isTooLargeForHeapOperation()) {
                        return model.textEditorModel.getValue(); // only if dirty and not too large
                    }
                    return undefined;
                })();
                untypedInput.options = {
                    ...untypedInput.options,
                    viewState: (0, editor_1.findViewStateForEditor)(this, options.preserveViewState, this.editorService)
                };
            }
            return untypedInput;
        }
        matches(otherInput) {
            if (this === otherInput) {
                return true;
            }
            if (otherInput instanceof FileEditorInput_1) {
                return (0, resources_1.isEqual)(otherInput.resource, this.resource);
            }
            if ((0, editor_1.isResourceEditorInput)(otherInput)) {
                return super.matches(otherInput);
            }
            return false;
        }
        dispose() {
            // Model
            this.model = undefined;
            // Model reference
            this.disposeModelReference();
            super.dispose();
        }
        disposeModelReference() {
            (0, lifecycle_1.dispose)(this.cachedTextFileModelReference);
            this.cachedTextFileModelReference = undefined;
        }
    };
    exports.FileEditorInput = FileEditorInput;
    exports.FileEditorInput = FileEditorInput = FileEditorInput_1 = __decorate([
        __param(7, instantiation_1.IInstantiationService),
        __param(8, textfiles_1.ITextFileService),
        __param(9, resolverService_1.ITextModelService),
        __param(10, label_1.ILabelService),
        __param(11, files_1.IFileService),
        __param(12, filesConfigurationService_1.IFilesConfigurationService),
        __param(13, editorService_1.IEditorService),
        __param(14, pathService_1.IPathService),
        __param(15, textResourceConfiguration_1.ITextResourceConfigurationService)
    ], FileEditorInput);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmlsZUVkaXRvcklucHV0LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvZmlsZXMvYnJvd3Nlci9lZGl0b3JzL2ZpbGVFZGl0b3JJbnB1dC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7O0lBMEJoRyxJQUFXLFdBSVY7SUFKRCxXQUFXLFdBQVc7UUFDckIsNkNBQUksQ0FBQTtRQUNKLDZDQUFJLENBQUE7UUFDSixpREFBTSxDQUFBO0lBQ1AsQ0FBQyxFQUpVLFdBQVcsS0FBWCxXQUFXLFFBSXJCO0lBRUQ7O09BRUc7SUFDSSxJQUFNLGVBQWUsdUJBQXJCLE1BQU0sZUFBZ0IsU0FBUSx5REFBK0I7UUFFbkUsSUFBYSxNQUFNO1lBQ2xCLE9BQU8sNEJBQW9CLENBQUM7UUFDN0IsQ0FBQztRQUVELElBQWEsUUFBUTtZQUNwQixPQUFPLG1DQUEwQixDQUFDLEVBQUUsQ0FBQztRQUN0QyxDQUFDO1FBRUQsSUFBYSxZQUFZO1lBQ3hCLElBQUksWUFBWSxtREFBMEMsQ0FBQztZQUUzRCxJQUFJLElBQUksQ0FBQyxLQUFLLEVBQUU7Z0JBQ2YsSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLFVBQVUsRUFBRSxFQUFFO29CQUM1QixZQUFZLDRDQUFvQyxDQUFDO2lCQUNqRDthQUNEO2lCQUFNO2dCQUNOLElBQUksSUFBSSxDQUFDLFdBQVcsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxFQUFFO29CQUNoRCxJQUFJLElBQUksQ0FBQyx5QkFBeUIsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxFQUFFO3dCQUM3RCxZQUFZLDRDQUFvQyxDQUFDO3FCQUNqRDtpQkFDRDtxQkFBTTtvQkFDTixZQUFZLDRDQUFvQyxDQUFDO2lCQUNqRDthQUNEO1lBRUQsSUFBSSxDQUFDLENBQUMsWUFBWSwyQ0FB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