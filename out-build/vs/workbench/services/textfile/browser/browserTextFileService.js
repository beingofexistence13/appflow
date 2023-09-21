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
define(["require", "exports", "vs/workbench/services/textfile/browser/textFileService", "vs/workbench/services/textfile/common/textfiles", "vs/platform/instantiation/common/extensions", "vs/workbench/services/environment/common/environmentService", "vs/editor/browser/services/codeEditorService", "vs/editor/common/services/model", "vs/editor/common/languages/language", "vs/editor/common/services/textResourceConfiguration", "vs/platform/dialogs/common/dialogs", "vs/platform/files/common/files", "vs/platform/instantiation/common/instantiation", "vs/platform/log/common/log", "vs/workbench/services/files/common/elevatedFileService", "vs/workbench/services/filesConfiguration/common/filesConfigurationService", "vs/workbench/services/lifecycle/common/lifecycle", "vs/workbench/services/path/common/pathService", "vs/workbench/services/untitled/common/untitledTextEditorService", "vs/platform/uriIdentity/common/uriIdentity", "vs/workbench/services/workingCopy/common/workingCopyFileService", "vs/workbench/services/decorations/common/decorations"], function (require, exports, textFileService_1, textfiles_1, extensions_1, environmentService_1, codeEditorService_1, model_1, language_1, textResourceConfiguration_1, dialogs_1, files_1, instantiation_1, log_1, elevatedFileService_1, filesConfigurationService_1, lifecycle_1, pathService_1, untitledTextEditorService_1, uriIdentity_1, workingCopyFileService_1, decorations_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$k3b = void 0;
    let $k3b = class $k3b extends textFileService_1.$i3b {
        constructor(fileService, untitledTextEditorService, lifecycleService, instantiationService, modelService, environmentService, dialogService, fileDialogService, textResourceConfigurationService, filesConfigurationService, codeEditorService, pathService, workingCopyFileService, uriIdentityService, languageService, elevatedFileService, logService, decorationsService) {
            super(fileService, untitledTextEditorService, lifecycleService, instantiationService, modelService, environmentService, dialogService, fileDialogService, textResourceConfigurationService, filesConfigurationService, codeEditorService, pathService, workingCopyFileService, uriIdentityService, languageService, logService, elevatedFileService, decorationsService);
            this.y();
        }
        y() {
            // Lifecycle
            this.B(this.h.onBeforeShutdown(event => event.veto(this.S(), 'veto.textFiles')));
        }
        S() {
            if (this.files.models.some(model => model.hasState(2 /* TextFileEditorModelState.PENDING_SAVE */))) {
                return true; // files are pending to be saved: veto (as there is no support for long running operations on shutdown)
            }
            return false;
        }
    };
    exports.$k3b = $k3b;
    exports.$k3b = $k3b = __decorate([
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
        __param(15, elevatedFileService_1.$CD),
        __param(16, log_1.$5i),
        __param(17, decorations_1.$Gcb)
    ], $k3b);
    (0, extensions_1.$mr)(textfiles_1.$JD, $k3b, 0 /* InstantiationType.Eager */);
});
//# sourceMappingURL=browserTextFileService.js.map