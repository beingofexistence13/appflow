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
    var $ULb_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$ULb = void 0;
    var ForceOpenAs;
    (function (ForceOpenAs) {
        ForceOpenAs[ForceOpenAs["None"] = 0] = "None";
        ForceOpenAs[ForceOpenAs["Text"] = 1] = "Text";
        ForceOpenAs[ForceOpenAs["Binary"] = 2] = "Binary";
    })(ForceOpenAs || (ForceOpenAs = {}));
    /**
     * A file editor input is the input type for the file editor of file system resources.
     */
    let $ULb = $ULb_1 = class $ULb extends textResourceEditorInput_1.$6eb {
        get typeId() {
            return files_2.$8db;
        }
        get editorId() {
            return editor_1.$HE.id;
        }
        get capabilities() {
            let capabilities = 32 /* EditorInputCapabilities.CanSplitInGroup */;
            if (this.Y) {
                if (this.Y.isReadonly()) {
                    capabilities |= 2 /* EditorInputCapabilities.Readonly */;
                }
            }
            else {
                if (this.m.hasProvider(this.resource)) {
                    if (this.n.isReadonly(this.resource)) {
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
        constructor(resource, preferredResource, preferredName, preferredDescription, preferredEncoding, preferredLanguageId, preferredContents, ab, textFileService, bb, labelService, fileService, filesConfigurationService, editorService, cb, db) {
            super(resource, preferredResource, editorService, textFileService, labelService, fileService, filesConfigurationService);
            this.ab = ab;
            this.bb = bb;
            this.cb = cb;
            this.db = db;
            this.X = 0 /* ForceOpenAs.None */;
            this.Y = undefined;
            this.Z = undefined;
            this.$ = this.B(new lifecycle_1.$jc());
            this.Y = this.O.files.get(resource);
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
            this.B(this.O.files.onDidCreate(model => this.eb(model)));
            // If a file model already exists, make sure to wire it in
            if (this.Y) {
                this.fb(this.Y);
            }
        }
        eb(model) {
            // Once the text file model is created, we keep it inside
            // the input to be able to implement some methods properly
            if ((0, resources_1.$bg)(model.resource, this.resource)) {
                this.Y = model;
                this.fb(model);
            }
        }
        fb(model) {
            // Clear any old
            this.$.clear();
            // re-emit some events from the model
            this.$.add(model.onDidChangeDirty(() => this.a.fire()));
            this.$.add(model.onDidChangeReadonly(() => this.f.fire()));
            // important: treat save errors as potential dirty change because
            // a file that is in save conflict or error will report dirty even
            // if auto save is turned on.
            this.$.add(model.onDidSaveError(() => this.a.fire()));
            // remove model association once it gets disposed
            this.$.add(event_1.Event.once(model.onWillDispose)(() => {
                this.$.clear();
                this.Y = undefined;
            }));
        }
        getName() {
            return this.Q || super.getName();
        }
        setPreferredName(name) {
            if (!this.gb()) {
                return; // block for specific schemes we consider to be owning
            }
            if (this.Q !== name) {
                this.Q = name;
                this.b.fire();
            }
        }
        gb() {
            return this.resource.scheme !== this.cb.defaultUriScheme &&
                this.resource.scheme !== network_1.Schemas.vscodeUserData &&
                this.resource.scheme !== network_1.Schemas.file &&
                this.resource.scheme !== network_1.Schemas.vscodeRemote;
        }
        getPreferredName() {
            return this.Q;
        }
        isReadonly() {
            return this.Y ? this.Y.isReadonly() : this.n.isReadonly(this.resource);
        }
        getDescription(verbosity) {
            return this.R || super.getDescription(verbosity);
        }
        setPreferredDescription(description) {
            if (!this.gb()) {
                return; // block for specific schemes we consider to be owning
            }
            if (this.R !== description) {
                this.R = description;
                this.b.fire();
            }
        }
        getPreferredDescription() {
            return this.R;
        }
        getEncoding() {
            if (this.Y) {
                return this.Y.getEncoding();
            }
            return this.S;
        }
        getPreferredEncoding() {
            return this.S;
        }
        async setEncoding(encoding, mode) {
            this.setPreferredEncoding(encoding);
            return this.Y?.setEncoding(encoding, mode);
        }
        setPreferredEncoding(encoding) {
            this.S = encoding;
            // encoding is a good hint to open the file as text
            this.setForceOpenAsText();
        }
        getLanguageId() {
            if (this.Y) {
                return this.Y.getLanguageId();
            }
            return this.U;
        }
        getPreferredLanguageId() {
            return this.U;
        }
        setLanguageId(languageId, source) {
            this.setPreferredLanguageId(languageId);
            this.Y?.setLanguageId(languageId, source);
        }
        setPreferredLanguageId(languageId) {
            this.U = languageId;
            // languages are a good hint to open the file as text
            this.setForceOpenAsText();
        }
        setPreferredContents(contents) {
            this.W = contents;
            // contents is a good hint to open the file as text
            this.setForceOpenAsText();
        }
        setForceOpenAsText() {
            this.X = 1 /* ForceOpenAs.Text */;
        }
        setForceOpenAsBinary() {
            this.X = 2 /* ForceOpenAs.Binary */;
        }
        isDirty() {
            return !!(this.Y?.isDirty());
        }
        isSaving() {
            if (this.Y?.hasState(0 /* TextFileEditorModelState.SAVED */) || this.Y?.hasState(3 /* TextFileEditorModelState.CONFLICT */) || this.Y?.hasState(5 /* TextFileEditorModelState.ERROR */)) {
                return false; // require the model to be dirty and not in conflict or error state
            }
            // Note: currently not checking for ModelState.PENDING_SAVE for a reason
            // because we currently miss an event for this state change on editors
            // and it could result in bad UX where an editor can be closed even though
            // it shows up as dirty and has not finished saving yet.
            if (this.n.getAutoSaveMode() === 1 /* AutoSaveMode.AFTER_SHORT_DELAY */) {
                return true; // a short auto save is configured, treat this as being saved
            }
            return super.isSaving();
        }
        prefersEditorPane(editorPanes) {
            if (this.X === 2 /* ForceOpenAs.Binary */) {
                return editorPanes.find(editorPane => editorPane.typeId === files_2.$9db);
            }
            return editorPanes.find(editorPane => editorPane.typeId === files_2.$7db);
        }
        resolve(options) {
            // Resolve as binary
            if (this.X === 2 /* ForceOpenAs.Binary */) {
                return this.jb();
            }
            // Resolve as text
            return this.hb(options);
        }
        async hb(options) {
            try {
                // Unset preferred contents after having applied it once
                // to prevent this property to stick. We still want future
                // `resolve` calls to fetch the contents from disk.
                const preferredContents = this.W;
                this.W = undefined;
                // Resolve resource via text file service and only allow
                // to open binary files if we are instructed so
                await this.O.files.resolve(this.resource, {
                    languageId: this.U,
                    encoding: this.S,
                    contents: typeof preferredContents === 'string' ? (0, textModel_1.$IC)(preferredContents) : undefined,
                    reload: { async: true },
                    allowBinary: this.X === 1 /* ForceOpenAs.Text */,
                    reason: 1 /* TextFileResolveReason.EDITOR */,
                    limits: this.ib(options)
                });
                // This is a bit ugly, because we first resolve the model and then resolve a model reference. the reason being that binary
                // or very large files do not resolve to a text file model but should be opened as binary files without text. First calling into
                // resolve() ensures we are not creating model references for these kind of resources.
                // In addition we have a bit of payload to take into account (encoding, reload) that the text resolver does not handle yet.
                if (!this.Z) {
                    this.Z = await this.bb.createModelReference(this.resource);
                }
                const model = this.Z.object;
                // It is possible that this input was disposed before the model
                // finished resolving. As such, we need to make sure to dispose
                // the model reference to not leak it.
                if (this.isDisposed()) {
                    this.kb();
                }
                return model;
            }
            catch (error) {
                // Handle binary files with binary model
                if (error.textFileOperationResult === 0 /* TextFileOperationResult.FILE_IS_BINARY */) {
                    return this.jb();
                }
                // Bubble any other error up
                throw error;
            }
        }
        ib(options) {
            if (options?.limits) {
                return options.limits; // respect passed in limits if any
            }
            // We want to determine the large file configuration based on the best defaults
            // for the resource but also respecting user settings. We only apply user settings
            // if explicitly configured by the user. Otherwise we pick the best limit for the
            // resource scheme.
            const defaultSizeLimit = (0, files_1.$Bk)(this.resource);
            let configuredSizeLimit = undefined;
            const configuredSizeLimitMb = this.db.inspect(this.resource, null, 'workbench.editorLargeFileConfirmation');
            if ((0, configuration_1.$_h)(configuredSizeLimitMb)) {
                configuredSizeLimit = configuredSizeLimitMb.value * files_1.$Ak.MB; // normalize to MB
            }
            return {
                size: configuredSizeLimit ?? defaultSizeLimit
            };
        }
        async jb() {
            const model = this.ab.createInstance(binaryEditorModel_1.$Fvb, this.preferredResource, this.getName());
            await model.resolve();
            return model;
        }
        isResolved() {
            return !!this.Y;
        }
        async rename(group, target) {
            return {
                editor: {
                    resource: target,
                    encoding: this.getEncoding(),
                    options: {
                        viewState: (0, editor_1.$ME)(this, group, this.N)
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
                    const model = this.O.files.get(this.resource);
                    if (model?.isDirty() && !model.textEditorModel.isTooLargeForHeapOperation()) {
                        return model.textEditorModel.getValue(); // only if dirty and not too large
                    }
                    return undefined;
                })();
                untypedInput.options = {
                    ...untypedInput.options,
                    viewState: (0, editor_1.$ME)(this, options.preserveViewState, this.N)
                };
            }
            return untypedInput;
        }
        matches(otherInput) {
            if (this === otherInput) {
                return true;
            }
            if (otherInput instanceof $ULb_1) {
                return (0, resources_1.$bg)(otherInput.resource, this.resource);
            }
            if ((0, editor_1.$NE)(otherInput)) {
                return super.matches(otherInput);
            }
            return false;
        }
        dispose() {
            // Model
            this.Y = undefined;
            // Model reference
            this.kb();
            super.dispose();
        }
        kb() {
            (0, lifecycle_1.$fc)(this.Z);
            this.Z = undefined;
        }
    };
    exports.$ULb = $ULb;
    exports.$ULb = $ULb = $ULb_1 = __decorate([
        __param(7, instantiation_1.$Ah),
        __param(8, textfiles_1.$JD),
        __param(9, resolverService_1.$uA),
        __param(10, label_1.$Vz),
        __param(11, files_1.$6j),
        __param(12, filesConfigurationService_1.$yD),
        __param(13, editorService_1.$9C),
        __param(14, pathService_1.$yJ),
        __param(15, textResourceConfiguration_1.$FA)
    ], $ULb);
});
//# sourceMappingURL=fileEditorInput.js.map