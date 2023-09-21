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
define(["require", "exports", "vs/base/common/network", "vs/base/common/lifecycle", "vs/base/common/uri", "vs/workbench/services/textfile/common/textEditorService", "vs/base/common/resources", "vs/editor/common/languages/modesRegistry", "vs/workbench/services/environment/common/environmentService", "vs/workbench/services/filesConfiguration/common/filesConfigurationService", "vs/workbench/services/path/common/pathService", "vs/workbench/services/untitled/common/untitledTextEditorInput", "vs/workbench/services/workingCopy/common/workingCopy", "vs/workbench/services/workingCopy/common/workingCopyEditorService", "vs/workbench/services/untitled/common/untitledTextEditorService"], function (require, exports, network_1, lifecycle_1, uri_1, textEditorService_1, resources_1, modesRegistry_1, environmentService_1, filesConfigurationService_1, pathService_1, untitledTextEditorInput_1, workingCopy_1, workingCopyEditorService_1, untitledTextEditorService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$vxb = exports.$uxb = void 0;
    let $uxb = class $uxb {
        constructor(a, b, c) {
            this.a = a;
            this.b = b;
            this.c = c;
        }
        canSerialize(editorInput) {
            return this.a.isHotExitEnabled && !editorInput.isDisposed();
        }
        serialize(editorInput) {
            if (!this.a.isHotExitEnabled || editorInput.isDisposed()) {
                return undefined;
            }
            const untitledTextEditorInput = editorInput;
            let resource = untitledTextEditorInput.resource;
            if (untitledTextEditorInput.model.hasAssociatedFilePath) {
                resource = (0, resources_1.$sg)(resource, this.b.remoteAuthority, this.c.defaultUriScheme); // untitled with associated file path use the local schema
            }
            // Language: only remember language if it is either specific (not text)
            // or if the language was explicitly set by the user. We want to preserve
            // this information across restarts and not set the language unless
            // this is the case.
            let languageId;
            const languageIdCandidate = untitledTextEditorInput.getLanguageId();
            if (languageIdCandidate !== modesRegistry_1.$Yt) {
                languageId = languageIdCandidate;
            }
            else if (untitledTextEditorInput.model.hasLanguageSetExplicitly) {
                languageId = languageIdCandidate;
            }
            const serialized = {
                resourceJSON: resource.toJSON(),
                modeId: languageId,
                encoding: untitledTextEditorInput.getEncoding()
            };
            return JSON.stringify(serialized);
        }
        deserialize(instantiationService, serializedEditorInput) {
            return instantiationService.invokeFunction(accessor => {
                const deserialized = JSON.parse(serializedEditorInput);
                const resource = uri_1.URI.revive(deserialized.resourceJSON);
                const languageId = deserialized.modeId;
                const encoding = deserialized.encoding;
                return accessor.get(textEditorService_1.$sxb).createTextEditor({ resource, languageId, encoding, forceUntitled: true });
            });
        }
    };
    exports.$uxb = $uxb;
    exports.$uxb = $uxb = __decorate([
        __param(0, filesConfigurationService_1.$yD),
        __param(1, environmentService_1.$hJ),
        __param(2, pathService_1.$yJ)
    ], $uxb);
    let $vxb = class $vxb extends lifecycle_1.$kc {
        constructor(workingCopyEditorService, a, b, c, f) {
            super();
            this.a = a;
            this.b = b;
            this.c = c;
            this.f = f;
            this.B(workingCopyEditorService.registerHandler(this));
        }
        handles(workingCopy) {
            return workingCopy.resource.scheme === network_1.Schemas.untitled && workingCopy.typeId === workingCopy_1.$wA;
        }
        isOpen(workingCopy, editor) {
            if (!this.handles(workingCopy)) {
                return false;
            }
            return editor instanceof untitledTextEditorInput_1.$Bvb && (0, resources_1.$bg)(workingCopy.resource, editor.resource);
        }
        createEditor(workingCopy) {
            let editorInputResource;
            // If the untitled has an associated resource,
            // ensure to restore the local resource it had
            if (this.f.isUntitledWithAssociatedResource(workingCopy.resource)) {
                editorInputResource = (0, resources_1.$sg)(workingCopy.resource, this.a.remoteAuthority, this.b.defaultUriScheme);
            }
            else {
                editorInputResource = workingCopy.resource;
            }
            return this.c.createTextEditor({ resource: editorInputResource, forceUntitled: true });
        }
    };
    exports.$vxb = $vxb;
    exports.$vxb = $vxb = __decorate([
        __param(0, workingCopyEditorService_1.$AD),
        __param(1, environmentService_1.$hJ),
        __param(2, pathService_1.$yJ),
        __param(3, textEditorService_1.$sxb),
        __param(4, untitledTextEditorService_1.$tD)
    ], $vxb);
});
//# sourceMappingURL=untitledTextEditorHandler.js.map