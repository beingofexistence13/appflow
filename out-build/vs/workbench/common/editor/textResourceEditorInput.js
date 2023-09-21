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
    var $7eb_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$7eb = exports.$6eb = void 0;
    /**
     * The base class for all editor inputs that open in text editors.
     */
    let $6eb = class $6eb extends resourceEditorInput_1.$xbb {
        constructor(resource, preferredResource, N, O, labelService, fileService, filesConfigurationService) {
            super(resource, preferredResource, labelService, fileService, filesConfigurationService);
            this.N = N;
            this.O = O;
        }
        save(group, options) {
            // If this is neither an `untitled` resource, nor a resource
            // we can handle with the file service, we can only "Save As..."
            if (this.resource.scheme !== network_1.Schemas.untitled && !this.m.hasProvider(this.resource)) {
                return this.saveAs(group, options);
            }
            // Normal save
            return this.P(options, false, group);
        }
        saveAs(group, options) {
            return this.P(options, true, group);
        }
        async P(options, saveAs, group) {
            // Save / Save As
            let target;
            if (saveAs) {
                target = await this.O.saveAs(this.resource, undefined, { ...options, suggestedTarget: this.preferredResource });
            }
            else {
                target = await this.O.save(this.resource, options);
            }
            if (!target) {
                return undefined; // save cancelled
            }
            return { resource: target };
        }
        async revert(group, options) {
            await this.O.revert(this.resource, options);
        }
    };
    exports.$6eb = $6eb;
    exports.$6eb = $6eb = __decorate([
        __param(2, editorService_1.$9C),
        __param(3, textfiles_1.$JD),
        __param(4, label_1.$Vz),
        __param(5, files_1.$6j),
        __param(6, filesConfigurationService_1.$yD)
    ], $6eb);
    /**
     * A read-only text editor input whos contents are made of the provided resource that points to an existing
     * code editor model.
     */
    let $7eb = class $7eb extends $6eb {
        static { $7eb_1 = this; }
        static { this.ID = 'workbench.editors.resourceEditorInput'; }
        get typeId() {
            return $7eb_1.ID;
        }
        get editorId() {
            return editor_1.$HE.id;
        }
        constructor(resource, S, U, W, X, Y, textFileService, editorService, fileService, labelService, filesConfigurationService) {
            super(resource, undefined, editorService, textFileService, labelService, fileService, filesConfigurationService);
            this.S = S;
            this.U = U;
            this.W = W;
            this.X = X;
            this.Y = Y;
            this.Q = undefined;
            this.R = undefined;
        }
        getName() {
            return this.S || super.getName();
        }
        setName(name) {
            if (this.S !== name) {
                this.S = name;
                this.b.fire();
            }
        }
        getDescription() {
            return this.U;
        }
        setDescription(description) {
            if (this.U !== description) {
                this.U = description;
                this.b.fire();
            }
        }
        setLanguageId(languageId, source) {
            this.setPreferredLanguageId(languageId);
            this.Q?.setLanguageId(languageId, source);
        }
        setPreferredLanguageId(languageId) {
            this.W = languageId;
        }
        setPreferredContents(contents) {
            this.X = contents;
        }
        async resolve() {
            // Unset preferred contents and language after resolving
            // once to prevent these properties to stick. We still
            // want the user to change the language in the editor
            // and want to show updated contents (if any) in future
            // `resolve` calls.
            const preferredContents = this.X;
            const preferredLanguageId = this.W;
            this.X = undefined;
            this.W = undefined;
            if (!this.R) {
                this.R = this.Y.createModelReference(this.resource);
            }
            const ref = await this.R;
            // Ensure the resolved model is of expected type
            const model = ref.object;
            if (!(model instanceof textResourceEditorModel_1.$5eb)) {
                ref.dispose();
                this.R = undefined;
                throw new Error(`Unexpected model for TextResourceEditorInput: ${this.resource}`);
            }
            this.Q = model;
            // Set contents and language if preferred
            if (typeof preferredContents === 'string' || typeof preferredLanguageId === 'string') {
                model.updateTextEditorModel(typeof preferredContents === 'string' ? (0, textModel_1.$IC)(preferredContents) : undefined, preferredLanguageId);
            }
            return model;
        }
        matches(otherInput) {
            if (this === otherInput) {
                return true;
            }
            if (otherInput instanceof $7eb_1) {
                return (0, resources_1.$bg)(otherInput.resource, this.resource);
            }
            if ((0, editor_1.$NE)(otherInput)) {
                return super.matches(otherInput);
            }
            return false;
        }
        dispose() {
            if (this.R) {
                this.R.then(ref => ref.dispose());
                this.R = undefined;
            }
            this.Q = undefined;
            super.dispose();
        }
    };
    exports.$7eb = $7eb;
    exports.$7eb = $7eb = $7eb_1 = __decorate([
        __param(5, resolverService_1.$uA),
        __param(6, textfiles_1.$JD),
        __param(7, editorService_1.$9C),
        __param(8, files_1.$6j),
        __param(9, label_1.$Vz),
        __param(10, filesConfigurationService_1.$yD)
    ], $7eb);
});
//# sourceMappingURL=textResourceEditorInput.js.map