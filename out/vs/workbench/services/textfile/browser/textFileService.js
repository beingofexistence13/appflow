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
define(["require", "exports", "vs/nls", "vs/workbench/services/textfile/common/textfiles", "vs/workbench/common/editor", "vs/workbench/services/lifecycle/common/lifecycle", "vs/platform/files/common/files", "vs/base/common/lifecycle", "vs/base/common/path", "vs/workbench/services/environment/common/environmentService", "vs/workbench/services/untitled/common/untitledTextEditorService", "vs/workbench/services/untitled/common/untitledTextEditorModel", "vs/workbench/services/textfile/common/textFileEditorModelManager", "vs/platform/instantiation/common/instantiation", "vs/base/common/network", "vs/editor/common/model/textModel", "vs/editor/common/services/model", "vs/base/common/resources", "vs/platform/dialogs/common/dialogs", "vs/base/common/buffer", "vs/editor/common/services/textResourceConfiguration", "vs/editor/common/languages/modesRegistry", "vs/workbench/services/filesConfiguration/common/filesConfigurationService", "vs/workbench/common/editor/textEditorModel", "vs/editor/browser/services/codeEditorService", "vs/workbench/services/path/common/pathService", "vs/workbench/services/workingCopy/common/workingCopyFileService", "vs/platform/uriIdentity/common/uriIdentity", "vs/platform/workspace/common/workspace", "vs/workbench/services/textfile/common/encoding", "vs/base/common/stream", "vs/editor/common/languages/language", "vs/platform/log/common/log", "vs/base/common/cancellation", "vs/workbench/services/files/common/elevatedFileService", "vs/workbench/services/decorations/common/decorations", "vs/base/common/event", "vs/base/common/codicons", "vs/platform/theme/common/colorRegistry", "vs/base/common/arrays"], function (require, exports, nls_1, textfiles_1, editor_1, lifecycle_1, files_1, lifecycle_2, path_1, environmentService_1, untitledTextEditorService_1, untitledTextEditorModel_1, textFileEditorModelManager_1, instantiation_1, network_1, textModel_1, model_1, resources_1, dialogs_1, buffer_1, textResourceConfiguration_1, modesRegistry_1, filesConfigurationService_1, textEditorModel_1, codeEditorService_1, pathService_1, workingCopyFileService_1, uriIdentity_1, workspace_1, encoding_1, stream_1, language_1, log_1, cancellation_1, elevatedFileService_1, decorations_1, event_1, codicons_1, colorRegistry_1, arrays_1) {
    "use strict";
    var AbstractTextFileService_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.EncodingOracle = exports.AbstractTextFileService = void 0;
    /**
     * The workbench file service implementation implements the raw file service spec and adds additional methods on top.
     */
    let AbstractTextFileService = class AbstractTextFileService extends lifecycle_2.Disposable {
        static { AbstractTextFileService_1 = this; }
        static { this.TEXTFILE_SAVE_CREATE_SOURCE = editor_1.SaveSourceRegistry.registerSource('textFileCreate.source', (0, nls_1.localize)('textFileCreate.source', "File Created")); }
        static { this.TEXTFILE_SAVE_REPLACE_SOURCE = editor_1.SaveSourceRegistry.registerSource('textFileOverwrite.source', (0, nls_1.localize)('textFileOverwrite.source', "File Replaced")); }
        constructor(fileService, untitledTextEditorService, lifecycleService, instantiationService, modelService, environmentService, dialogService, fileDialogService, textResourceConfigurationService, filesConfigurationService, codeEditorService, pathService, workingCopyFileService, uriIdentityService, languageService, logService, elevatedFileService, decorationsService) {
            super();
            this.fileService = fileService;
            this.untitledTextEditorService = untitledTextEditorService;
            this.lifecycleService = lifecycleService;
            this.instantiationService = instantiationService;
            this.modelService = modelService;
            this.environmentService = environmentService;
            this.dialogService = dialogService;
            this.fileDialogService = fileDialogService;
            this.textResourceConfigurationService = textResourceConfigurationService;
            this.filesConfigurationService = filesConfigurationService;
            this.codeEditorService = codeEditorService;
            this.pathService = pathService;
            this.workingCopyFileService = workingCopyFileService;
            this.uriIdentityService = uriIdentityService;
            this.languageService = languageService;
            this.logService = logService;
            this.elevatedFileService = elevatedFileService;
            this.decorationsService = decorationsService;
            this.files = this._register(this.instantiationService.createInstance(textFileEditorModelManager_1.TextFileEditorModelManager));
            this.untitled = this.untitledTextEditorService;
            this.provideDecorations();
        }
        //#region decorations
        provideDecorations() {
            // Text file model decorations
            const provider = this._register(new class extends lifecycle_2.Disposable {
                constructor(files) {
                    super();
                    this.files = files;
                    this.label = (0, nls_1.localize)('textFileModelDecorations', "Text File Model Decorations");
                    this._onDidChange = this._register(new event_1.Emitter());
                    this.onDidChange = this._onDidChange.event;
                    this.registerListeners();
                }
                registerListeners() {
                    // Creates
                    this._register(this.files.onDidResolve(({ model }) => {
                        if (model.isReadonly() || model.hasState(4 /* TextFileEditorModelState.ORPHAN */)) {
                            this._onDidChange.fire([model.resource]);
                        }
                    }));
                    // Removals: once a text file model is no longer
                    // under our control, make sure to signal this as
                    // decoration change because from this point on we
                    // have no way of updating the decoration anymore.
                    this._register(this.files.onDidRemove(modelUri => this._onDidChange.fire([modelUri])));
                    // Changes
                    this._register(this.files.onDidChangeReadonly(model => this._onDidChange.fire([model.resource])));
                    this._register(this.files.onDidChangeOrphaned(model => this._onDidChange.fire([model.resource])));
                }
                provideDecorations(uri) {
                    const model = this.files.get(uri);
                    if (!model || model.isDisposed()) {
                        return undefined;
                    }
                    const isReadonly = model.isReadonly();
                    const isOrphaned = model.hasState(4 /* TextFileEditorModelState.ORPHAN */);
                    // Readonly + Orphaned
                    if (isReadonly && isOrphaned) {
                        return {
                            color: colorRegistry_1.listErrorForeground,
                            letter: codicons_1.Codicon.lockSmall,
                            strikethrough: true,
                            tooltip: (0, nls_1.localize)('readonlyAndDeleted', "Deleted, Read-only"),
                        };
                    }
                    // Readonly
                    else if (isReadonly) {
                        return {
                            letter: codicons_1.Codicon.lockSmall,
                            tooltip: (0, nls_1.localize)('readonly', "Read-only"),
                        };
                    }
                    // Orphaned
                    else if (isOrphaned) {
                        return {
                            color: colorRegistry_1.listErrorForeground,
                            strikethrough: true,
                            tooltip: (0, nls_1.localize)('deleted', "Deleted"),
                        };
                    }
                    return undefined;
                }
            }(this.files));
            this._register(this.decorationsService.registerDecorationsProvider(provider));
        }
        get encoding() {
            if (!this._encoding) {
                this._encoding = this._register(this.instantiationService.createInstance(EncodingOracle));
            }
            return this._encoding;
        }
        async read(resource, options) {
            const [bufferStream, decoder] = await this.doRead(resource, {
                ...options,
                // optimization: since we know that the caller does not
                // care about buffering, we indicate this to the reader.
                // this reduces all the overhead the buffered reading
                // has (open, read, close) if the provider supports
                // unbuffered reading.
                preferUnbuffered: true
            });
            return {
                ...bufferStream,
                encoding: decoder.detected.encoding || encoding_1.UTF8,
                value: await (0, stream_1.consumeStream)(decoder.stream, strings => strings.join(''))
            };
        }
        async readStream(resource, options) {
            const [bufferStream, decoder] = await this.doRead(resource, options);
            return {
                ...bufferStream,
                encoding: decoder.detected.encoding || encoding_1.UTF8,
                value: await (0, textModel_1.createTextBufferFactoryFromStream)(decoder.stream)
            };
        }
        async doRead(resource, options) {
            const cts = new cancellation_1.CancellationTokenSource();
            // read stream raw (either buffered or unbuffered)
            let bufferStream;
            if (options?.preferUnbuffered) {
                const content = await this.fileService.readFile(resource, options, cts.token);
                bufferStream = {
                    ...content,
                    value: (0, buffer_1.bufferToStream)(content.value)
                };
            }
            else {
                bufferStream = await this.fileService.readFileStream(resource, options, cts.token);
            }
            // read through encoding library
            try {
                const decoder = await this.doGetDecodedStream(resource, bufferStream.value, options);
                return [bufferStream, decoder];
            }
            catch (error) {
                // Make sure to cancel reading on error to
                // stop file service activity as soon as
                // possible. When for example a large binary
                // file is read we want to cancel the read
                // instantly.
                // Refs:
                // - https://github.com/microsoft/vscode/issues/138805
                // - https://github.com/microsoft/vscode/issues/132771
                cts.dispose(true);
                // special treatment for streams that are binary
                if (error.decodeStreamErrorKind === 1 /* DecodeStreamErrorKind.STREAM_IS_BINARY */) {
                    throw new textfiles_1.TextFileOperationError((0, nls_1.localize)('fileBinaryError', "File seems to be binary and cannot be opened as text"), 0 /* TextFileOperationResult.FILE_IS_BINARY */, options);
                }
                // re-throw any other error as it is
                else {
                    throw error;
                }
            }
        }
        async create(operations, undoInfo) {
            const operationsWithContents = await Promise.all(operations.map(async (operation) => {
                const contents = await this.getEncodedReadable(operation.resource, operation.value);
                return {
                    resource: operation.resource,
                    contents,
                    overwrite: operation.options?.overwrite
                };
            }));
            return this.workingCopyFileService.create(operationsWithContents, cancellation_1.CancellationToken.None, undoInfo);
        }
        async write(resource, value, options) {
            const readable = await this.getEncodedReadable(resource, value, options);
            if (options?.writeElevated && this.elevatedFileService.isSupported(resource)) {
                return this.elevatedFileService.writeFileElevated(resource, readable, options);
            }
            return this.fileService.writeFile(resource, readable, options);
        }
        async getEncodedReadable(resource, value, options) {
            // check for encoding
            const { encoding, addBOM } = await this.encoding.getWriteEncoding(resource, options);
            // when encoding is standard skip encoding step
            if (encoding === encoding_1.UTF8 && !addBOM) {
                return typeof value === 'undefined'
                    ? undefined
                    : (0, textfiles_1.toBufferOrReadable)(value);
            }
            // otherwise create encoded readable
            value = value || '';
            const snapshot = typeof value === 'string' ? (0, textfiles_1.stringToSnapshot)(value) : value;
            return (0, encoding_1.toEncodeReadable)(snapshot, encoding, { addBOM });
        }
        async getDecodedStream(resource, value, options) {
            return (await this.doGetDecodedStream(resource, value, options)).stream;
        }
        doGetDecodedStream(resource, stream, options) {
            // read through encoding library
            return (0, encoding_1.toDecodeStream)(stream, {
                acceptTextOnly: options?.acceptTextOnly ?? false,
                guessEncoding: options?.autoGuessEncoding || this.textResourceConfigurationService.getValue(resource, 'files.autoGuessEncoding'),
                overwriteEncoding: async (detectedEncoding) => {
                    const { encoding } = await this.encoding.getPreferredReadEncoding(resource, options, detectedEncoding ?? undefined);
                    return encoding;
                }
            });
        }
        //#endregion
        //#region save
        async save(resource, options) {
            // Untitled
            if (resource.scheme === network_1.Schemas.untitled) {
                const model = this.untitled.get(resource);
                if (model) {
                    let targetUri;
                    // Untitled with associated file path don't need to prompt
                    if (model.hasAssociatedFilePath) {
                        targetUri = await this.suggestSavePath(resource);
                    }
                    // Otherwise ask user
                    else {
                        targetUri = await this.fileDialogService.pickFileToSave(await this.suggestSavePath(resource), options?.availableFileSystems);
                    }
                    // Save as if target provided
                    if (targetUri) {
                        return this.saveAs(resource, targetUri, options);
                    }
                }
            }
            // File
            else {
                const model = this.files.get(resource);
                if (model) {
                    return await model.save(options) ? resource : undefined;
                }
            }
            return undefined;
        }
        async saveAs(source, target, options) {
            // Get to target resource
            if (!target) {
                target = await this.fileDialogService.pickFileToSave(await this.suggestSavePath(options?.suggestedTarget ?? source), options?.availableFileSystems);
            }
            if (!target) {
                return; // user canceled
            }
            // Just save if target is same as models own resource
            if ((0, resources_1.isEqual)(source, target)) {
                return this.save(source, { ...options, force: true /* force to save, even if not dirty (https://github.com/microsoft/vscode/issues/99619) */ });
            }
            // If the target is different but of same identity, we
            // move the source to the target, knowing that the
            // underlying file system cannot have both and then save.
            // However, this will only work if the source exists
            // and is not orphaned, so we need to check that too.
            if (this.fileService.hasProvider(source) && this.uriIdentityService.extUri.isEqual(source, target) && (await this.fileService.exists(source))) {
                await this.workingCopyFileService.move([{ file: { source, target } }], cancellation_1.CancellationToken.None);
                // At this point we don't know whether we have a
                // model for the source or the target URI so we
                // simply try to save with both resources.
                const success = await this.save(source, options);
                if (!success) {
                    await this.save(target, options);
                }
                return target;
            }
            // Do it
            return this.doSaveAs(source, target, options);
        }
        async doSaveAs(source, target, options) {
            let success = false;
            // If the source is an existing text file model, we can directly
            // use that model to copy the contents to the target destination
            const textFileModel = this.files.get(source);
            if (textFileModel?.isResolved()) {
                success = await this.doSaveAsTextFile(textFileModel, source, target, options);
            }
            // Otherwise if the source can be handled by the file service
            // we can simply invoke the copy() function to save as
            else if (this.fileService.hasProvider(source)) {
                await this.fileService.copy(source, target, true);
                success = true;
            }
            // Finally we simply check if we can find a editor model that
            // would give us access to the contents.
            else {
                const textModel = this.modelService.getModel(source);
                if (textModel) {
                    success = await this.doSaveAsTextFile(textModel, source, target, options);
                }
            }
            if (!success) {
                return undefined;
            }
            // Revert the source
            try {
                await this.revert(source);
            }
            catch (error) {
                // It is possible that reverting the source fails, for example
                // when a remote is disconnected and we cannot read it anymore.
                // However, this should not interrupt the "Save As" flow, so
                // we gracefully catch the error and just log it.
                this.logService.error(error);
            }
            return target;
        }
        async doSaveAsTextFile(sourceModel, source, target, options) {
            // Find source encoding if any
            let sourceModelEncoding = undefined;
            const sourceModelWithEncodingSupport = sourceModel;
            if (typeof sourceModelWithEncodingSupport.getEncoding === 'function') {
                sourceModelEncoding = sourceModelWithEncodingSupport.getEncoding();
            }
            // Prefer an existing model if it is already resolved for the given target resource
            let targetExists = false;
            let targetModel = this.files.get(target);
            if (targetModel?.isResolved()) {
                targetExists = true;
            }
            // Otherwise create the target file empty if it does not exist already and resolve it from there
            else {
                targetExists = await this.fileService.exists(target);
                // create target file adhoc if it does not exist yet
                if (!targetExists) {
                    await this.create([{ resource: target, value: '' }]);
                }
                try {
                    targetModel = await this.files.resolve(target, { encoding: sourceModelEncoding });
                }
                catch (error) {
                    // if the target already exists and was not created by us, it is possible
                    // that we cannot resolve the target as text model if it is binary or too
                    // large. in that case we have to delete the target file first and then
                    // re-run the operation.
                    if (targetExists) {
                        if (error.textFileOperationResult === 0 /* TextFileOperationResult.FILE_IS_BINARY */ ||
                            error.fileOperationResult === 7 /* FileOperationResult.FILE_TOO_LARGE */) {
                            await this.fileService.del(target);
                            return this.doSaveAsTextFile(sourceModel, source, target, options);
                        }
                    }
                    throw error;
                }
            }
            // Confirm to overwrite if we have an untitled file with associated file where
            // the file actually exists on disk and we are instructed to save to that file
            // path. This can happen if the file was created after the untitled file was opened.
            // See https://github.com/microsoft/vscode/issues/67946
            let write;
            if (sourceModel instanceof untitledTextEditorModel_1.UntitledTextEditorModel && sourceModel.hasAssociatedFilePath && targetExists && this.uriIdentityService.extUri.isEqual(target, (0, resources_1.toLocalResource)(sourceModel.resource, this.environmentService.remoteAuthority, this.pathService.defaultUriScheme))) {
                write = await this.confirmOverwrite(target);
            }
            else {
                write = true;
            }
            if (!write) {
                return false;
            }
            let sourceTextModel = undefined;
            if (sourceModel instanceof textEditorModel_1.BaseTextEditorModel) {
                if (sourceModel.isResolved()) {
                    sourceTextModel = sourceModel.textEditorModel ?? undefined;
                }
            }
            else {
                sourceTextModel = sourceModel;
            }
            let targetTextModel = undefined;
            if (targetModel.isResolved()) {
                targetTextModel = targetModel.textEditorModel;
            }
            // take over model value, encoding and language (only if more specific) from source model
            if (sourceTextModel && targetTextModel) {
                // encoding
                targetModel.updatePreferredEncoding(sourceModelEncoding);
                // content
                this.modelService.updateModel(targetTextModel, (0, textModel_1.createTextBufferFactoryFromSnapshot)(sourceTextModel.createSnapshot()));
                // language
                const sourceLanguageId = sourceTextModel.getLanguageId();
                const targetLanguageId = targetTextModel.getLanguageId();
                if (sourceLanguageId !== modesRegistry_1.PLAINTEXT_LANGUAGE_ID && targetLanguageId === modesRegistry_1.PLAINTEXT_LANGUAGE_ID) {
                    targetTextModel.setLanguage(sourceLanguageId); // only use if more specific than plain/text
                }
                // transient properties
                const sourceTransientProperties = this.codeEditorService.getTransientModelProperties(sourceTextModel);
                if (sourceTransientProperties) {
                    for (const [key, value] of sourceTransientProperties) {
                        this.codeEditorService.setTransientModelProperty(targetTextModel, key, value);
                    }
                }
            }
            // set source options depending on target exists or not
            if (!options?.source) {
                options = {
                    ...options,
                    source: targetExists ? AbstractTextFileService_1.TEXTFILE_SAVE_REPLACE_SOURCE : AbstractTextFileService_1.TEXTFILE_SAVE_CREATE_SOURCE
                };
            }
            // save model
            return targetModel.save(options);
        }
        async confirmOverwrite(resource) {
            const { confirmed } = await this.dialogService.confirm({
                type: 'warning',
                message: (0, nls_1.localize)('confirmOverwrite', "'{0}' already exists. Do you want to replace it?", (0, resources_1.basename)(resource)),
                detail: (0, nls_1.localize)('irreversible', "A file or folder with the name '{0}' already exists in the folder '{1}'. Replacing it will overwrite its current contents.", (0, resources_1.basename)(resource), (0, resources_1.basename)((0, resources_1.dirname)(resource))),
                primaryButton: (0, nls_1.localize)({ key: 'replaceButtonLabel', comment: ['&& denotes a mnemonic'] }, "&&Replace"),
            });
            return confirmed;
        }
        async suggestSavePath(resource) {
            // Just take the resource as is if the file service can handle it
            if (this.fileService.hasProvider(resource)) {
                return resource;
            }
            const remoteAuthority = this.environmentService.remoteAuthority;
            const defaultFilePath = await this.fileDialogService.defaultFilePath();
            // Otherwise try to suggest a path that can be saved
            let suggestedFilename = undefined;
            if (resource.scheme === network_1.Schemas.untitled) {
                const model = this.untitled.get(resource);
                if (model) {
                    // Untitled with associated file path
                    if (model.hasAssociatedFilePath) {
                        return (0, resources_1.toLocalResource)(resource, remoteAuthority, this.pathService.defaultUriScheme);
                    }
                    // Untitled without associated file path: use name
                    // of untitled model if it is a valid path name and
                    // figure out the file extension from the mode if any.
                    let nameCandidate;
                    if (await this.pathService.hasValidBasename((0, resources_1.joinPath)(defaultFilePath, model.name), model.name)) {
                        nameCandidate = model.name;
                    }
                    else {
                        nameCandidate = (0, resources_1.basename)(resource);
                    }
                    const languageId = model.getLanguageId();
                    if (languageId && languageId !== modesRegistry_1.PLAINTEXT_LANGUAGE_ID) {
                        suggestedFilename = this.suggestFilename(languageId, nameCandidate);
                    }
                    else {
                        suggestedFilename = nameCandidate;
                    }
                }
            }
            // Fallback to basename of resource
            if (!suggestedFilename) {
                suggestedFilename = (0, resources_1.basename)(resource);
            }
            // Try to place where last active file was if any
            // Otherwise fallback to user home
            return (0, resources_1.joinPath)(defaultFilePath, suggestedFilename);
        }
        suggestFilename(languageId, untitledName) {
            const languageName = this.languageService.getLanguageName(languageId);
            if (!languageName) {
                return untitledName; // unknown language, so we cannot suggest a better name
            }
            const untitledExtension = (0, path_1.extname)(untitledName);
            const extensions = this.languageService.getExtensions(languageId);
            if (extensions.includes(untitledExtension)) {
                return untitledName; // preserve extension if it is compatible with the mode
            }
            const primaryExtension = (0, arrays_1.firstOrDefault)(extensions);
            if (primaryExtension) {
                if (untitledExtension) {
                    return `${untitledName.substring(0, untitledName.indexOf(untitledExtension))}${primaryExtension}`;
                }
                return `${untitledName}${primaryExtension}`;
            }
            const filenames = this.languageService.getFilenames(languageId);
            if (filenames.includes(untitledName)) {
                return untitledName; // preserve name if it is compatible with the mode
            }
            return (0, arrays_1.firstOrDefault)(filenames) ?? untitledName;
        }
        //#endregion
        //#region revert
        async revert(resource, options) {
            // Untitled
            if (resource.scheme === network_1.Schemas.untitled) {
                const model = this.untitled.get(resource);
                if (model) {
                    return model.revert(options);
                }
            }
            // File
            else {
                const model = this.files.get(resource);
                if (model && (model.isDirty() || options?.force)) {
                    return model.revert(options);
                }
            }
        }
        //#endregion
        //#region dirty
        isDirty(resource) {
            const model = resource.scheme === network_1.Schemas.untitled ? this.untitled.get(resource) : this.files.get(resource);
            if (model) {
                return model.isDirty();
            }
            return false;
        }
    };
    exports.AbstractTextFileService = AbstractTextFileService;
    exports.AbstractTextFileService = AbstractTextFileService = AbstractTextFileService_1 = __decorate([
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
        __param(15, log_1.ILogService),
        __param(16, elevatedFileService_1.IElevatedFileService),
        __param(17, decorations_1.IDecorationsService)
    ], AbstractTextFileService);
    let EncodingOracle = class EncodingOracle extends lifecycle_2.Disposable {
        get encodingOverrides() { return this._encodingOverrides; }
        set encodingOverrides(value) { this._encodingOverrides = value; }
        constructor(textResourceConfigurationService, environmentService, contextService, uriIdentityService) {
            super();
            this.textResourceConfigurationService = textResourceConfigurationService;
            this.environmentService = environmentService;
            this.contextService = contextService;
            this.uriIdentityService = uriIdentityService;
            this._encodingOverrides = this.getDefaultEncodingOverrides();
            this.registerListeners();
        }
        registerListeners() {
            // Workspace Folder Change
            this._register(this.contextService.onDidChangeWorkspaceFolders(() => this.encodingOverrides = this.getDefaultEncodingOverrides()));
        }
        getDefaultEncodingOverrides() {
            const defaultEncodingOverrides = [];
            // Global settings
            defaultEncodingOverrides.push({ parent: this.environmentService.userRoamingDataHome, encoding: encoding_1.UTF8 });
            // Workspace files (via extension and via untitled workspaces location)
            defaultEncodingOverrides.push({ extension: workspace_1.WORKSPACE_EXTENSION, encoding: encoding_1.UTF8 });
            defaultEncodingOverrides.push({ parent: this.environmentService.untitledWorkspacesHome, encoding: encoding_1.UTF8 });
            // Folder Settings
            this.contextService.getWorkspace().folders.forEach(folder => {
                defaultEncodingOverrides.push({ parent: (0, resources_1.joinPath)(folder.uri, '.vscode'), encoding: encoding_1.UTF8 });
            });
            return defaultEncodingOverrides;
        }
        async getWriteEncoding(resource, options) {
            const { encoding, hasBOM } = await this.getPreferredWriteEncoding(resource, options ? options.encoding : undefined);
            return { encoding, addBOM: hasBOM };
        }
        async getPreferredWriteEncoding(resource, preferredEncoding) {
            const resourceEncoding = await this.getEncodingForResource(resource, preferredEncoding);
            return {
                encoding: resourceEncoding,
                hasBOM: resourceEncoding === encoding_1.UTF16be || resourceEncoding === encoding_1.UTF16le || resourceEncoding === encoding_1.UTF8_with_bom // enforce BOM for certain encodings
            };
        }
        async getPreferredReadEncoding(resource, options, detectedEncoding) {
            let preferredEncoding;
            // Encoding passed in as option
            if (options?.encoding) {
                if (detectedEncoding === encoding_1.UTF8_with_bom && options.encoding === encoding_1.UTF8) {
                    preferredEncoding = encoding_1.UTF8_with_bom; // indicate the file has BOM if we are to resolve with UTF 8
                }
                else {
                    preferredEncoding = options.encoding; // give passed in encoding highest priority
                }
            }
            // Encoding detected
            else if (typeof detectedEncoding === 'string') {
                preferredEncoding = detectedEncoding;
            }
            // Encoding configured
            else if (this.textResourceConfigurationService.getValue(resource, 'files.encoding') === encoding_1.UTF8_with_bom) {
                preferredEncoding = encoding_1.UTF8; // if we did not detect UTF 8 BOM before, this can only be UTF 8 then
            }
            const encoding = await this.getEncodingForResource(resource, preferredEncoding);
            return {
                encoding,
                hasBOM: encoding === encoding_1.UTF16be || encoding === encoding_1.UTF16le || encoding === encoding_1.UTF8_with_bom // enforce BOM for certain encodings
            };
        }
        async getEncodingForResource(resource, preferredEncoding) {
            let fileEncoding;
            const override = this.getEncodingOverride(resource);
            if (override) {
                fileEncoding = override; // encoding override always wins
            }
            else if (preferredEncoding) {
                fileEncoding = preferredEncoding; // preferred encoding comes second
            }
            else {
                fileEncoding = this.textResourceConfigurationService.getValue(resource, 'files.encoding'); // and last we check for settings
            }
            if (fileEncoding !== encoding_1.UTF8) {
                if (!fileEncoding || !(await (0, encoding_1.encodingExists)(fileEncoding))) {
                    fileEncoding = encoding_1.UTF8; // the default is UTF-8
                }
            }
            return fileEncoding;
        }
        getEncodingOverride(resource) {
            if (this.encodingOverrides?.length) {
                for (const override of this.encodingOverrides) {
                    // check if the resource is child of encoding override path
                    if (override.parent && this.uriIdentityService.extUri.isEqualOrParent(resource, override.parent)) {
                        return override.encoding;
                    }
                    // check if the resource extension is equal to encoding override
                    if (override.extension && (0, resources_1.extname)(resource) === `.${override.extension}`) {
                        return override.encoding;
                    }
                }
            }
            return undefined;
        }
    };
    exports.EncodingOracle = EncodingOracle;
    exports.EncodingOracle = EncodingOracle = __decorate([
        __param(0, textResourceConfiguration_1.ITextResourceConfigurationService),
        __param(1, environmentService_1.IWorkbenchEnvironmentService),
        __param(2, workspace_1.IWorkspaceContextService),
        __param(3, uriIdentity_1.IUriIdentityService)
    ], EncodingOracle);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGV4dEZpbGVTZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL3NlcnZpY2VzL3RleHRmaWxlL2Jyb3dzZXIvdGV4dEZpbGVTZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7Ozs7SUE0Q2hHOztPQUVHO0lBQ0ksSUFBZSx1QkFBdUIsR0FBdEMsTUFBZSx1QkFBd0IsU0FBUSxzQkFBVTs7aUJBSXZDLGdDQUEyQixHQUFHLDJCQUFrQixDQUFDLGNBQWMsQ0FBQyx1QkFBdUIsRUFBRSxJQUFBLGNBQVEsRUFBQyx1QkFBdUIsRUFBRSxjQUFjLENBQUMsQ0FBQyxBQUFoSCxDQUFpSDtpQkFDNUksaUNBQTRCLEdBQUcsMkJBQWtCLENBQUMsY0FBYyxDQUFDLDBCQUEwQixFQUFFLElBQUEsY0FBUSxFQUFDLDBCQUEwQixFQUFFLGVBQWUsQ0FBQyxDQUFDLEFBQXZILENBQXdIO1FBTTVLLFlBQ2UsV0FBNEMsRUFDOUIseUJBQTZELEVBQ3RFLGdCQUFzRCxFQUNsRCxvQkFBOEQsRUFDdEUsWUFBNEMsRUFDN0Isa0JBQW1FLEVBQ2pGLGFBQThDLEVBQzFDLGlCQUFzRCxFQUN2QyxnQ0FBc0YsRUFDN0YseUJBQXdFLEVBQ2hGLGlCQUFzRCxFQUM1RCxXQUEwQyxFQUMvQixzQkFBZ0UsRUFDcEUsa0JBQXdELEVBQzNELGVBQWtELEVBQ3ZELFVBQTBDLEVBQ2pDLG1CQUEwRCxFQUMzRCxrQkFBd0Q7WUFFN0UsS0FBSyxFQUFFLENBQUM7WUFuQnlCLGdCQUFXLEdBQVgsV0FBVyxDQUFjO1lBQ3RCLDhCQUF5QixHQUF6Qix5QkFBeUIsQ0FBNEI7WUFDbkQscUJBQWdCLEdBQWhCLGdCQUFnQixDQUFtQjtZQUMvQix5QkFBb0IsR0FBcEIsb0JBQW9CLENBQXVCO1lBQ3JELGlCQUFZLEdBQVosWUFBWSxDQUFlO1lBQ1YsdUJBQWtC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