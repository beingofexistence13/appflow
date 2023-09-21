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
    var $Bvb_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Bvb = void 0;
    /**
     * An editor input to be used for untitled text buffers.
     */
    let $Bvb = class $Bvb extends textResourceEditorInput_1.$6eb {
        static { $Bvb_1 = this; }
        static { this.ID = 'workbench.editors.untitledEditorInput'; }
        get typeId() {
            return $Bvb_1.ID;
        }
        get editorId() {
            return editor_1.$HE.id;
        }
        constructor(model, textFileService, labelService, editorService, fileService, R, S, filesConfigurationService) {
            super(model.resource, undefined, editorService, textFileService, labelService, fileService, filesConfigurationService);
            this.model = model;
            this.R = R;
            this.S = S;
            this.Q = undefined;
            this.U(model);
        }
        U(model) {
            // re-emit some events from the model
            this.B(model.onDidChangeDirty(() => this.a.fire()));
            this.B(model.onDidChangeName(() => this.b.fire()));
            // a reverted untitled text editor model renders this input disposed
            this.B(model.onDidRevert(() => this.dispose()));
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
            if (!this.Q) {
                this.Q = this.model.resolve();
            }
            await this.Q;
            return this.model;
        }
        toUntyped(options) {
            const untypedInput = {
                resource: this.model.hasAssociatedFilePath ? (0, resources_1.$sg)(this.model.resource, this.R.remoteAuthority, this.S.defaultUriScheme) : this.resource,
                forceUntitled: true,
                options: {
                    override: this.editorId
                }
            };
            if (typeof options?.preserveViewState === 'number') {
                untypedInput.encoding = this.getEncoding();
                untypedInput.languageId = this.getLanguageId();
                untypedInput.contents = this.model.isModified() ? this.model.textEditorModel?.getValue() : undefined;
                untypedInput.options.viewState = (0, editor_1.$ME)(this, options.preserveViewState, this.N);
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
            if (otherInput instanceof $Bvb_1) {
                return (0, resources_1.$bg)(otherInput.resource, this.resource);
            }
            if ((0, editor_1.$QE)(otherInput)) {
                return super.matches(otherInput);
            }
            return false;
        }
        dispose() {
            this.Q = undefined;
            super.dispose();
        }
    };
    exports.$Bvb = $Bvb;
    exports.$Bvb = $Bvb = $Bvb_1 = __decorate([
        __param(1, textfiles_1.$JD),
        __param(2, label_1.$Vz),
        __param(3, editorService_1.$9C),
        __param(4, files_1.$6j),
        __param(5, environmentService_1.$hJ),
        __param(6, pathService_1.$yJ),
        __param(7, filesConfigurationService_1.$yD)
    ], $Bvb);
});
//# sourceMappingURL=untitledTextEditorInput.js.map