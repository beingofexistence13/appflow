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
define(["require", "exports", "vs/nls!vs/workbench/services/textfile/browser/textFileService", "vs/workbench/services/textfile/common/textfiles", "vs/workbench/common/editor", "vs/workbench/services/lifecycle/common/lifecycle", "vs/platform/files/common/files", "vs/base/common/lifecycle", "vs/base/common/path", "vs/workbench/services/environment/common/environmentService", "vs/workbench/services/untitled/common/untitledTextEditorService", "vs/workbench/services/untitled/common/untitledTextEditorModel", "vs/workbench/services/textfile/common/textFileEditorModelManager", "vs/platform/instantiation/common/instantiation", "vs/base/common/network", "vs/editor/common/model/textModel", "vs/editor/common/services/model", "vs/base/common/resources", "vs/platform/dialogs/common/dialogs", "vs/base/common/buffer", "vs/editor/common/services/textResourceConfiguration", "vs/editor/common/languages/modesRegistry", "vs/workbench/services/filesConfiguration/common/filesConfigurationService", "vs/workbench/common/editor/textEditorModel", "vs/editor/browser/services/codeEditorService", "vs/workbench/services/path/common/pathService", "vs/workbench/services/workingCopy/common/workingCopyFileService", "vs/platform/uriIdentity/common/uriIdentity", "vs/platform/workspace/common/workspace", "vs/workbench/services/textfile/common/encoding", "vs/base/common/stream", "vs/editor/common/languages/language", "vs/platform/log/common/log", "vs/base/common/cancellation", "vs/workbench/services/files/common/elevatedFileService", "vs/workbench/services/decorations/common/decorations", "vs/base/common/event", "vs/base/common/codicons", "vs/platform/theme/common/colorRegistry", "vs/base/common/arrays"], function (require, exports, nls_1, textfiles_1, editor_1, lifecycle_1, files_1, lifecycle_2, path_1, environmentService_1, untitledTextEditorService_1, untitledTextEditorModel_1, textFileEditorModelManager_1, instantiation_1, network_1, textModel_1, model_1, resources_1, dialogs_1, buffer_1, textResourceConfiguration_1, modesRegistry_1, filesConfigurationService_1, textEditorModel_1, codeEditorService_1, pathService_1, workingCopyFileService_1, uriIdentity_1, workspace_1, encoding_1, stream_1, language_1, log_1, cancellation_1, elevatedFileService_1, decorations_1, event_1, codicons_1, colorRegistry_1, arrays_1) {
    "use strict";
    var $i3b_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$j3b = exports.$i3b = void 0;
    /**
     * The workbench file service implementation implements the raw file service spec and adds additional methods on top.
     */
    let $i3b = class $i3b extends lifecycle_2.$kc {
        static { $i3b_1 = this; }
        static { this.a = editor_1.$SE.registerSource('textFileCreate.source', (0, nls_1.localize)(0, null)); }
        static { this.b = editor_1.$SE.registerSource('textFileOverwrite.source', (0, nls_1.localize)(1, null)); }
        constructor(f, g, h, j, m, n, r, s, t, u, w, z, C, D, F, G, H, I) {
            super();
            this.f = f;
            this.g = g;
            this.h = h;
            this.j = j;
            this.m = m;
            this.n = n;
            this.r = r;
            this.s = s;
            this.t = t;
            this.u = u;
            this.w = w;
            this.z = z;
            this.C = C;
            this.D = D;
            this.F = F;
            this.G = G;
            this.H = H;
            this.I = I;
            this.files = this.B(this.j.createInstance(textFileEditorModelManager_1.$h3b));
            this.untitled = this.g;
            this.J();
        }
        //#region decorations
        J() {
            // Text file model decorations
            const provider = this.B(new class extends lifecycle_2.$kc {
                constructor(b) {
                    super();
                    this.b = b;
                    this.label = (0, nls_1.localize)(2, null);
                    this.a = this.B(new event_1.$fd());
                    this.onDidChange = this.a.event;
                    this.c();
                }
                c() {
                    // Creates
                    this.B(this.b.onDidResolve(({ model }) => {
                        if (model.isReadonly() || model.hasState(4 /* TextFileEditorModelState.ORPHAN */)) {
                            this.a.fire([model.resource]);
                        }
                    }));
                    // Removals: once a text file model is no longer
                    // under our control, make sure to signal this as
                    // decoration change because from this point on we
                    // have no way of updating the decoration anymore.
                    this.B(this.b.onDidRemove(modelUri => this.a.fire([modelUri])));
                    // Changes
                    this.B(this.b.onDidChangeReadonly(model => this.a.fire([model.resource])));
                    this.B(this.b.onDidChangeOrphaned(model => this.a.fire([model.resource])));
                }
                provideDecorations(uri) {
                    const model = this.b.get(uri);
                    if (!model || model.isDisposed()) {
                        return undefined;
                    }
                    const isReadonly = model.isReadonly();
                    const isOrphaned = model.hasState(4 /* TextFileEditorModelState.ORPHAN */);
                    // Readonly + Orphaned
                    if (isReadonly && isOrphaned) {
                        return {
                            color: colorRegistry_1.$Mx,
                            letter: codicons_1.$Pj.lockSmall,
                            strikethrough: true,
                            tooltip: (0, nls_1.localize)(3, null),
                        };
                    }
                    // Readonly
                    else if (isReadonly) {
                        return {
                            letter: codicons_1.$Pj.lockSmall,
                            tooltip: (0, nls_1.localize)(4, null),
                        };
                    }
                    // Orphaned
                    else if (isOrphaned) {
                        return {
                            color: colorRegistry_1.$Mx,
                            strikethrough: true,
                            tooltip: (0, nls_1.localize)(5, null),
                        };
                    }
                    return undefined;
                }
            }(this.files));
            this.B(this.I.registerDecorationsProvider(provider));
        }
        get encoding() {
            if (!this.L) {
                this.L = this.B(this.j.createInstance($j3b));
            }
            return this.L;
        }
        async read(resource, options) {
            const [bufferStream, decoder] = await this.M(resource, {
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
                encoding: decoder.detected.encoding || encoding_1.$bD,
                value: await (0, stream_1.$wd)(decoder.stream, strings => strings.join(''))
            };
        }
        async readStream(resource, options) {
            const [bufferStream, decoder] = await this.M(resource, options);
            return {
                ...bufferStream,
                encoding: decoder.detected.encoding || encoding_1.$bD,
                value: await (0, textModel_1.$JC)(decoder.stream)
            };
        }
        async M(resource, options) {
            const cts = new cancellation_1.$pd();
            // read stream raw (either buffered or unbuffered)
            let bufferStream;
            if (options?.preferUnbuffered) {
                const content = await this.f.readFile(resource, options, cts.token);
                bufferStream = {
                    ...content,
                    value: (0, buffer_1.$Td)(content.value)
                };
            }
            else {
                bufferStream = await this.f.readFileStream(resource, options, cts.token);
            }
            // read through encoding library
            try {
                const decoder = await this.N(resource, bufferStream.value, options);
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
                    throw new textfiles_1.$KD((0, nls_1.localize)(6, null), 0 /* TextFileOperationResult.FILE_IS_BINARY */, options);
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
            return this.C.create(operationsWithContents, cancellation_1.CancellationToken.None, undoInfo);
        }
        async write(resource, value, options) {
            const readable = await this.getEncodedReadable(resource, value, options);
            if (options?.writeElevated && this.H.isSupported(resource)) {
                return this.H.writeFileElevated(resource, readable, options);
            }
            return this.f.writeFile(resource, readable, options);
        }
        async getEncodedReadable(resource, value, options) {
            // check for encoding
            const { encoding, addBOM } = await this.encoding.getWriteEncoding(resource, options);
            // when encoding is standard skip encoding step
            if (encoding === encoding_1.$bD && !addBOM) {
                return typeof value === 'undefined'
                    ? undefined
                    : (0, textfiles_1.$OD)(value);
            }
            // otherwise create encoded readable
            value = value || '';
            const snapshot = typeof value === 'string' ? (0, textfiles_1.$ND)(value) : value;
            return (0, encoding_1.$lD)(snapshot, encoding, { addBOM });
        }
        async getDecodedStream(resource, value, options) {
            return (await this.N(resource, value, options)).stream;
        }
        N(resource, stream, options) {
            // read through encoding library
            return (0, encoding_1.$kD)(stream, {
                acceptTextOnly: options?.acceptTextOnly ?? false,
                guessEncoding: options?.autoGuessEncoding || this.t.getValue(resource, 'files.autoGuessEncoding'),
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
                        targetUri = await this.R(resource);
                    }
                    // Otherwise ask user
                    else {
                        targetUri = await this.s.pickFileToSave(await this.R(resource), options?.availableFileSystems);
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
                target = await this.s.pickFileToSave(await this.R(options?.suggestedTarget ?? source), options?.availableFileSystems);
            }
            if (!target) {
                return; // user canceled
            }
            // Just save if target is same as models own resource
            if ((0, resources_1.$bg)(source, target)) {
                return this.save(source, { ...options, force: true /* force to save, even if not dirty (https://github.com/microsoft/vscode/issues/99619) */ });
            }
            // If the target is different but of same identity, we
            // move the source to the target, knowing that the
            // underlying file system cannot have both and then save.
            // However, this will only work if the source exists
            // and is not orphaned, so we need to check that too.
            if (this.f.hasProvider(source) && this.D.extUri.isEqual(source, target) && (await this.f.exists(source))) {
                await this.C.move([{ file: { source, target } }], cancellation_1.CancellationToken.None);
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
            return this.O(source, target, options);
        }
        async O(source, target, options) {
            let success = false;
            // If the source is an existing text file model, we can directly
            // use that model to copy the contents to the target destination
            const textFileModel = this.files.get(source);
            if (textFileModel?.isResolved()) {
                success = await this.P(textFileModel, source, target, options);
            }
            // Otherwise if the source can be handled by the file service
            // we can simply invoke the copy() function to save as
            else if (this.f.hasProvider(source)) {
                await this.f.copy(source, target, true);
                success = true;
            }
            // Finally we simply check if we can find a editor model that
            // would give us access to the contents.
            else {
                const textModel = this.m.getModel(source);
                if (textModel) {
                    success = await this.P(textModel, source, target, options);
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
                this.G.error(error);
            }
            return target;
        }
        async P(sourceModel, source, target, options) {
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
                targetExists = await this.f.exists(target);
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
                            await this.f.del(target);
                            return this.P(sourceModel, source, target, options);
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
            if (sourceModel instanceof untitledTextEditorModel_1.$sD && sourceModel.hasAssociatedFilePath && targetExists && this.D.extUri.isEqual(target, (0, resources_1.$sg)(sourceModel.resource, this.n.remoteAuthority, this.z.defaultUriScheme))) {
                write = await this.Q(target);
            }
            else {
                write = true;
            }
            if (!write) {
                return false;
            }
            let sourceTextModel = undefined;
            if (sourceModel instanceof textEditorModel_1.$DA) {
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
                this.m.updateModel(targetTextModel, (0, textModel_1.$KC)(sourceTextModel.createSnapshot()));
                // language
                const sourceLanguageId = sourceTextModel.getLanguageId();
                const targetLanguageId = targetTextModel.getLanguageId();
                if (sourceLanguageId !== modesRegistry_1.$Yt && targetLanguageId === modesRegistry_1.$Yt) {
                    targetTextModel.setLanguage(sourceLanguageId); // only use if more specific than plain/text
                }
                // transient properties
                const sourceTransientProperties = this.w.getTransientModelProperties(sourceTextModel);
                if (sourceTransientProperties) {
                    for (const [key, value] of sourceTransientProperties) {
                        this.w.setTransientModelProperty(targetTextModel, key, value);
                    }
                }
            }
            // set source options depending on target exists or not
            if (!options?.source) {
                options = {
                    ...options,
                    source: targetExists ? $i3b_1.b : $i3b_1.a
                };
            }
            // save model
            return targetModel.save(options);
        }
        async Q(resource) {
            const { confirmed } = await this.r.confirm({
                type: 'warning',
                message: (0, nls_1.localize)(7, null, (0, resources_1.$fg)(resource)),
                detail: (0, nls_1.localize)(8, null, (0, resources_1.$fg)(resource), (0, resources_1.$fg)((0, resources_1.$hg)(resource))),
                primaryButton: (0, nls_1.localize)(9, null),
            });
            return confirmed;
        }
        async R(resource) {
            // Just take the resource as is if the file service can handle it
            if (this.f.hasProvider(resource)) {
                return resource;
            }
            const remoteAuthority = this.n.remoteAuthority;
            const defaultFilePath = await this.s.defaultFilePath();
            // Otherwise try to suggest a path that can be saved
            let suggestedFilename = undefined;
            if (resource.scheme === network_1.Schemas.untitled) {
                const model = this.untitled.get(resource);
                if (model) {
                    // Untitled with associated file path
                    if (model.hasAssociatedFilePath) {
                        return (0, resources_1.$sg)(resource, remoteAuthority, this.z.defaultUriScheme);
                    }
                    // Untitled without associated file path: use name
                    // of untitled model if it is a valid path name and
                    // figure out the file extension from the mode if any.
                    let nameCandidate;
                    if (await this.z.hasValidBasename((0, resources_1.$ig)(defaultFilePath, model.name), model.name)) {
                        nameCandidate = model.name;
                    }
                    else {
                        nameCandidate = (0, resources_1.$fg)(resource);
                    }
                    const languageId = model.getLanguageId();
                    if (languageId && languageId !== modesRegistry_1.$Yt) {
                        suggestedFilename = this.suggestFilename(languageId, nameCandidate);
                    }
                    else {
                        suggestedFilename = nameCandidate;
                    }
                }
            }
            // Fallback to basename of resource
            if (!suggestedFilename) {
                suggestedFilename = (0, resources_1.$fg)(resource);
            }
            // Try to place where last active file was if any
            // Otherwise fallback to user home
            return (0, resources_1.$ig)(defaultFilePath, suggestedFilename);
        }
        suggestFilename(languageId, untitledName) {
            const languageName = this.F.getLanguageName(languageId);
            if (!languageName) {
                return untitledName; // unknown language, so we cannot suggest a better name
            }
            const untitledExtension = (0, path_1.$be)(untitledName);
            const extensions = this.F.getExtensions(languageId);
            if (extensions.includes(untitledExtension)) {
                return untitledName; // preserve extension if it is compatible with the mode
            }
            const primaryExtension = (0, arrays_1.$Mb)(extensions);
            if (primaryExtension) {
                if (untitledExtension) {
                    return `${untitledName.substring(0, untitledName.indexOf(untitledExtension))}${primaryExtension}`;
                }
                return `${untitledName}${primaryExtension}`;
            }
            const filenames = this.F.getFilenames(languageId);
            if (filenames.includes(untitledName)) {
                return untitledName; // preserve name if it is compatible with the mode
            }
            return (0, arrays_1.$Mb)(filenames) ?? untitledName;
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
    exports.$i3b = $i3b;
    exports.$i3b = $i3b = $i3b_1 = __decorate([
        __param(0, files_1.$6j),
        __param(1, untitledTextEditorService_1.$tD),
        __param(2, lifecycle_1.$7y),
        __param(3, instantiation_1.$Ah),
        __param(4, model_1.$yA),
        __param(5, environmentService_1.$hJ),
        __param(6, dialogs_1.$oA),
        __param(7, dialogs_1.$qA),
        __param(8, textResourceConfiguration_1.$FA),
        __param(9, filesConfigurationService_1.$yD),
        __param(10, codeEditorService_1.$nV),
        __param(11, pathService_1.$yJ),
        __param(12, workingCopyFileService_1.$HD),
        __param(13, uriIdentity_1.$Ck),
        __param(14, language_1.$ct),
        __param(15, log_1.$5i),
        __param(16, elevatedFileService_1.$CD),
        __param(17, decorations_1.$Gcb)
    ], $i3b);
    let $j3b = class $j3b extends lifecycle_2.$kc {
        get b() { return this.a; }
        set b(value) { this.a = value; }
        constructor(f, g, h, j) {
            super();
            this.f = f;
            this.g = g;
            this.h = h;
            this.j = j;
            this.a = this.n();
            this.m();
        }
        m() {
            // Workspace Folder Change
            this.B(this.h.onDidChangeWorkspaceFolders(() => this.b = this.n()));
        }
        n() {
            const defaultEncodingOverrides = [];
            // Global settings
            defaultEncodingOverrides.push({ parent: this.g.userRoamingDataHome, encoding: encoding_1.$bD });
            // Workspace files (via extension and via untitled workspaces location)
            defaultEncodingOverrides.push({ extension: workspace_1.$Xh, encoding: encoding_1.$bD });
            defaultEncodingOverrides.push({ parent: this.g.untitledWorkspacesHome, encoding: encoding_1.$bD });
            // Folder Settings
            this.h.getWorkspace().folders.forEach(folder => {
                defaultEncodingOverrides.push({ parent: (0, resources_1.$ig)(folder.uri, '.vscode'), encoding: encoding_1.$bD });
            });
            return defaultEncodingOverrides;
        }
        async getWriteEncoding(resource, options) {
            const { encoding, hasBOM } = await this.getPreferredWriteEncoding(resource, options ? options.encoding : undefined);
            return { encoding, addBOM: hasBOM };
        }
        async getPreferredWriteEncoding(resource, preferredEncoding) {
            const resourceEncoding = await this.r(resource, preferredEncoding);
            return {
                encoding: resourceEncoding,
                hasBOM: resourceEncoding === encoding_1.$dD || resourceEncoding === encoding_1.$eD || resourceEncoding === encoding_1.$cD // enforce BOM for certain encodings
            };
        }
        async getPreferredReadEncoding(resource, options, detectedEncoding) {
            let preferredEncoding;
            // Encoding passed in as option
            if (options?.encoding) {
                if (detectedEncoding === encoding_1.$cD && options.encoding === encoding_1.$bD) {
                    preferredEncoding = encoding_1.$cD; // indicate the file has BOM if we are to resolve with UTF 8
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
            else if (this.f.getValue(resource, 'files.encoding') === encoding_1.$cD) {
                preferredEncoding = encoding_1.$bD; // if we did not detect UTF 8 BOM before, this can only be UTF 8 then
            }
            const encoding = await this.r(resource, preferredEncoding);
            return {
                encoding,
                hasBOM: encoding === encoding_1.$dD || encoding === encoding_1.$eD || encoding === encoding_1.$cD // enforce BOM for certain encodings
            };
        }
        async r(resource, preferredEncoding) {
            let fileEncoding;
            const override = this.s(resource);
            if (override) {
                fileEncoding = override; // encoding override always wins
            }
            else if (preferredEncoding) {
                fileEncoding = preferredEncoding; // preferred encoding comes second
            }
            else {
                fileEncoding = this.f.getValue(resource, 'files.encoding'); // and last we check for settings
            }
            if (fileEncoding !== encoding_1.$bD) {
                if (!fileEncoding || !(await (0, encoding_1.$mD)(fileEncoding))) {
                    fileEncoding = encoding_1.$bD; // the default is UTF-8
                }
            }
            return fileEncoding;
        }
        s(resource) {
            if (this.b?.length) {
                for (const override of this.b) {
                    // check if the resource is child of encoding override path
                    if (override.parent && this.j.extUri.isEqualOrParent(resource, override.parent)) {
                        return override.encoding;
                    }
                    // check if the resource extension is equal to encoding override
                    if (override.extension && (0, resources_1.$gg)(resource) === `.${override.extension}`) {
                        return override.encoding;
                    }
                }
            }
            return undefined;
        }
    };
    exports.$j3b = $j3b;
    exports.$j3b = $j3b = __decorate([
        __param(0, textResourceConfiguration_1.$FA),
        __param(1, environmentService_1.$hJ),
        __param(2, workspace_1.$Kh),
        __param(3, uriIdentity_1.$Ck)
    ], $j3b);
});
//# sourceMappingURL=textFileService.js.map