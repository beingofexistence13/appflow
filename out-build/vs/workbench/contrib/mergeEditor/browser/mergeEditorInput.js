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
define(["require", "exports", "vs/base/common/assert", "vs/base/common/observable", "vs/base/common/resources", "vs/base/common/types", "vs/nls!vs/workbench/contrib/mergeEditor/browser/mergeEditorInput", "vs/platform/configuration/common/configuration", "vs/platform/files/common/files", "vs/platform/instantiation/common/instantiation", "vs/platform/label/common/label", "vs/workbench/common/editor", "vs/workbench/common/editor/textResourceEditorInput", "vs/workbench/contrib/mergeEditor/browser/mergeEditorInputModel", "vs/workbench/contrib/mergeEditor/browser/telemetry", "vs/workbench/services/editor/common/editorService", "vs/workbench/services/filesConfiguration/common/filesConfigurationService", "vs/workbench/services/textfile/common/textfiles"], function (require, exports, assert_1, observable_1, resources_1, types_1, nls_1, configuration_1, files_1, instantiation_1, label_1, editor_1, textResourceEditorInput_1, mergeEditorInputModel_1, telemetry_1, editorService_1, filesConfigurationService_1, textfiles_1) {
    "use strict";
    var $hkb_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$hkb = exports.$gkb = void 0;
    class $gkb {
        constructor(uri, title, detail, description) {
            this.uri = uri;
            this.title = title;
            this.detail = detail;
            this.description = description;
        }
    }
    exports.$gkb = $gkb;
    let $hkb = class $hkb extends textResourceEditorInput_1.$6eb {
        static { $hkb_1 = this; }
        static { this.ID = 'mergeEditor.Input'; }
        get R() {
            return this.U.getValue('mergeEditor.useWorkingCopy') ?? false;
        }
        constructor(base, input1, input2, result, S, editorService, textFileService, labelService, fileService, U, filesConfigurationService) {
            super(result, undefined, editorService, textFileService, labelService, fileService, filesConfigurationService);
            this.base = base;
            this.input1 = input1;
            this.input2 = input2;
            this.result = result;
            this.S = S;
            this.U = U;
            this.closeHandler = {
                showConfirm: () => this.Q?.shouldConfirmClose() ?? false,
                confirm: async (editors) => {
                    (0, assert_1.$xc)(() => editors.every(e => e.editor instanceof $hkb_1));
                    const inputModels = editors.map(e => e.editor.Q).filter(types_1.$rf);
                    return await this.Q.confirmClose(inputModels);
                },
            };
            this.W = this.S.createInstance(this.R
                ? mergeEditorInputModel_1.$ekb
                : mergeEditorInputModel_1.$fkb, this.S.createInstance(telemetry_1.$Gjb));
        }
        dispose() {
            super.dispose();
        }
        get typeId() {
            return $hkb_1.ID;
        }
        get editorId() {
            return editor_1.$HE.id;
        }
        get capabilities() {
            let capabilities = super.capabilities | 256 /* EditorInputCapabilities.MultipleEditors */;
            if (this.R) {
                capabilities |= 4 /* EditorInputCapabilities.Untitled */;
            }
            return capabilities;
        }
        getName() {
            return (0, nls_1.localize)(0, null, super.getName());
        }
        async resolve() {
            if (!this.Q) {
                const inputModel = this.B(await this.W.createInputModel({
                    base: this.base,
                    input1: this.input1,
                    input2: this.input2,
                    result: this.result,
                }));
                this.Q = inputModel;
                this.B((0, observable_1.autorun)(reader => {
                    /** @description fire dirty event */
                    inputModel.isDirty.read(reader);
                    this.a.fire();
                }));
                await this.Q.model.onInitialized;
            }
            return this.Q;
        }
        async accept() {
            await this.Q?.accept();
        }
        async save(group, options) {
            await this.Q?.save(options);
            return undefined;
        }
        toUntyped() {
            return {
                input1: { resource: this.input1.uri, label: this.input1.title, description: this.input1.description, detail: this.input1.detail },
                input2: { resource: this.input2.uri, label: this.input2.title, description: this.input2.description, detail: this.input2.detail },
                base: { resource: this.base },
                result: { resource: this.result },
                options: {
                    override: this.typeId
                }
            };
        }
        matches(otherInput) {
            if (this === otherInput) {
                return true;
            }
            if (otherInput instanceof $hkb_1) {
                return (0, resources_1.$bg)(this.base, otherInput.base)
                    && (0, resources_1.$bg)(this.input1.uri, otherInput.input1.uri)
                    && (0, resources_1.$bg)(this.input2.uri, otherInput.input2.uri)
                    && (0, resources_1.$bg)(this.result, otherInput.result);
            }
            if ((0, editor_1.$RE)(otherInput)) {
                return (this.editorId === otherInput.options?.override || otherInput.options?.override === undefined)
                    && (0, resources_1.$bg)(this.base, otherInput.base.resource)
                    && (0, resources_1.$bg)(this.input1.uri, otherInput.input1.resource)
                    && (0, resources_1.$bg)(this.input2.uri, otherInput.input2.resource)
                    && (0, resources_1.$bg)(this.result, otherInput.result.resource);
            }
            return false;
        }
        async revert(group, options) {
            return this.Q?.revert(options);
        }
        // ---- FileEditorInput
        isDirty() {
            return this.Q?.isDirty.get() ?? false;
        }
        setLanguageId(languageId, source) {
            this.Q?.model.setLanguageId(languageId, source);
        }
    };
    exports.$hkb = $hkb;
    exports.$hkb = $hkb = $hkb_1 = __decorate([
        __param(4, instantiation_1.$Ah),
        __param(5, editorService_1.$9C),
        __param(6, textfiles_1.$JD),
        __param(7, label_1.$Vz),
        __param(8, files_1.$6j),
        __param(9, configuration_1.$8h),
        __param(10, filesConfigurationService_1.$yD)
    ], $hkb);
});
//# sourceMappingURL=mergeEditorInput.js.map