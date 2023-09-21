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
define(["require", "exports", "vs/base/common/lifecycle", "vs/base/common/uri", "vs/workbench/services/textfile/common/textEditorService", "vs/base/common/resources", "vs/workbench/services/workingCopy/common/workingCopy", "vs/workbench/services/workingCopy/common/workingCopyEditorService", "vs/platform/files/common/files"], function (require, exports, lifecycle_1, uri_1, textEditorService_1, resources_1, workingCopy_1, workingCopyEditorService_1, files_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$_Lb = exports.$$Lb = void 0;
    class $$Lb {
        canSerialize(editorInput) {
            return true;
        }
        serialize(editorInput) {
            const fileEditorInput = editorInput;
            const resource = fileEditorInput.resource;
            const preferredResource = fileEditorInput.preferredResource;
            const serializedFileEditorInput = {
                resourceJSON: resource.toJSON(),
                preferredResourceJSON: (0, resources_1.$bg)(resource, preferredResource) ? undefined : preferredResource,
                name: fileEditorInput.getPreferredName(),
                description: fileEditorInput.getPreferredDescription(),
                encoding: fileEditorInput.getEncoding(),
                modeId: fileEditorInput.getPreferredLanguageId() // only using the preferred user associated language here if available to not store redundant data
            };
            return JSON.stringify(serializedFileEditorInput);
        }
        deserialize(instantiationService, serializedEditorInput) {
            return instantiationService.invokeFunction(accessor => {
                const serializedFileEditorInput = JSON.parse(serializedEditorInput);
                const resource = uri_1.URI.revive(serializedFileEditorInput.resourceJSON);
                const preferredResource = uri_1.URI.revive(serializedFileEditorInput.preferredResourceJSON);
                const name = serializedFileEditorInput.name;
                const description = serializedFileEditorInput.description;
                const encoding = serializedFileEditorInput.encoding;
                const languageId = serializedFileEditorInput.modeId;
                const fileEditorInput = accessor.get(textEditorService_1.$sxb).createTextEditor({ resource, label: name, description, encoding, languageId, forceFile: true });
                if (preferredResource) {
                    fileEditorInput.setPreferredResource(preferredResource);
                }
                return fileEditorInput;
            });
        }
    }
    exports.$$Lb = $$Lb;
    let $_Lb = class $_Lb extends lifecycle_1.$kc {
        constructor(workingCopyEditorService, a, b) {
            super();
            this.a = a;
            this.b = b;
            this.B(workingCopyEditorService.registerHandler(this));
        }
        handles(workingCopy) {
            return workingCopy.typeId === workingCopy_1.$wA && this.b.canHandleResource(workingCopy.resource);
        }
        c(workingCopy) {
            return workingCopy.typeId === workingCopy_1.$wA && this.b.hasProvider(workingCopy.resource);
        }
        isOpen(workingCopy, editor) {
            if (!this.c(workingCopy)) {
                return false;
            }
            // Naturally it would make sense here to check for `instanceof FileEditorInput`
            // but because some custom editors also leverage text file based working copies
            // we need to do a weaker check by only comparing for the resource
            return (0, resources_1.$bg)(workingCopy.resource, editor.resource);
        }
        createEditor(workingCopy) {
            return this.a.createTextEditor({ resource: workingCopy.resource, forceFile: true });
        }
    };
    exports.$_Lb = $_Lb;
    exports.$_Lb = $_Lb = __decorate([
        __param(0, workingCopyEditorService_1.$AD),
        __param(1, textEditorService_1.$sxb),
        __param(2, files_1.$6j)
    ], $_Lb);
});
//# sourceMappingURL=fileEditorHandler.js.map