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
define(["require", "exports", "vs/nls!vs/workbench/services/textfile/electron-sandbox/nativeTextFileService", "vs/workbench/services/textfile/browser/textFileService", "vs/workbench/services/textfile/common/textfiles", "vs/platform/instantiation/common/extensions", "vs/platform/files/common/files", "vs/editor/common/services/textResourceConfiguration", "vs/workbench/services/untitled/common/untitledTextEditorService", "vs/workbench/services/lifecycle/common/lifecycle", "vs/platform/instantiation/common/instantiation", "vs/editor/common/services/model", "vs/workbench/services/environment/electron-sandbox/environmentService", "vs/platform/dialogs/common/dialogs", "vs/workbench/services/filesConfiguration/common/filesConfigurationService", "vs/editor/browser/services/codeEditorService", "vs/workbench/services/path/common/pathService", "vs/workbench/services/workingCopy/common/workingCopyFileService", "vs/platform/uriIdentity/common/uriIdentity", "vs/editor/common/languages/language", "vs/workbench/services/files/common/elevatedFileService", "vs/platform/log/common/log", "vs/base/common/async", "vs/workbench/services/decorations/common/decorations"], function (require, exports, nls_1, textFileService_1, textfiles_1, extensions_1, files_1, textResourceConfiguration_1, untitledTextEditorService_1, lifecycle_1, instantiation_1, model_1, environmentService_1, dialogs_1, filesConfigurationService_1, codeEditorService_1, pathService_1, workingCopyFileService_1, uriIdentity_1, language_1, elevatedFileService_1, log_1, async_1, decorations_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$x_b = void 0;
    let $x_b = class $x_b extends textFileService_1.$i3b {
        constructor(fileService, untitledTextEditorService, lifecycleService, instantiationService, modelService, environmentService, dialogService, fileDialogService, textResourceConfigurationService, filesConfigurationService, codeEditorService, pathService, workingCopyFileService, uriIdentityService, languageService, elevatedFileService, logService, decorationsService) {
            super(fileService, untitledTextEditorService, lifecycleService, instantiationService, modelService, environmentService, dialogService, fileDialogService, textResourceConfigurationService, filesConfigurationService, codeEditorService, pathService, workingCopyFileService, uriIdentityService, languageService, logService, elevatedFileService, decorationsService);
            this.n = environmentService;
            this.S();
        }
        S() {
            // Lifecycle
            this.h.onWillShutdown(event => event.join(this.U(), { id: 'join.textFiles', label: (0, nls_1.localize)(0, null) }));
        }
        async U() {
            let modelsPendingToSave;
            // As long as models are pending to be saved, we prolong the shutdown
            // until that has happened to ensure we are not shutting down in the
            // middle of writing to the file
            // (https://github.com/microsoft/vscode/issues/116600)
            while ((modelsPendingToSave = this.files.models.filter(model => model.hasState(2 /* TextFileEditorModelState.PENDING_SAVE */))).length > 0) {
                await async_1.Promises.settled(modelsPendingToSave.map(model => model.joinState(2 /* TextFileEditorModelState.PENDING_SAVE */)));
            }
        }
        async read(resource, options) {
            // ensure platform limits are applied
            options = this.W(options);
            return super.read(resource, options);
        }
        async readStream(resource, options) {
            // ensure platform limits are applied
            options = this.W(options);
            return super.readStream(resource, options);
        }
        W(options) {
            let ensuredOptions;
            if (!options) {
                ensuredOptions = Object.create(null);
            }
            else {
                ensuredOptions = options;
            }
            let ensuredLimits;
            if (!ensuredOptions.limits) {
                ensuredLimits = Object.create(null);
                ensuredOptions = {
                    ...ensuredOptions,
                    limits: ensuredLimits
                };
            }
            else {
                ensuredLimits = ensuredOptions.limits;
            }
            return ensuredOptions;
        }
    };
    exports.$x_b = $x_b;
    exports.$x_b = $x_b = __decorate([
        __param(0, files_1.$6j),
        __param(1, untitledTextEditorService_1.$tD),
        __param(2, lifecycle_1.$7y),
        __param(3, instantiation_1.$Ah),
        __param(4, model_1.$yA),
        __param(5, environmentService_1.$1$b),
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
    ], $x_b);
    (0, extensions_1.$mr)(textfiles_1.$JD, $x_b, 0 /* InstantiationType.Eager */);
});
//# sourceMappingURL=nativeTextFileService.js.map