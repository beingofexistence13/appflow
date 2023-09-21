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
define(["require", "exports", "vs/nls!vs/workbench/contrib/output/browser/logViewer", "vs/base/common/path", "vs/platform/telemetry/common/telemetry", "vs/platform/storage/common/storage", "vs/editor/common/services/textResourceConfiguration", "vs/platform/instantiation/common/instantiation", "vs/workbench/browser/parts/editor/textResourceEditor", "vs/platform/theme/common/themeService", "vs/workbench/common/editor/textResourceEditorInput", "vs/base/common/uri", "vs/editor/common/services/resolverService", "vs/workbench/services/output/common/output", "vs/workbench/services/editor/common/editorGroupsService", "vs/workbench/services/editor/common/editorService", "vs/workbench/services/textfile/common/textfiles", "vs/platform/files/common/files", "vs/platform/label/common/label", "vs/workbench/services/filesConfiguration/common/filesConfigurationService"], function (require, exports, nls_1, path_1, telemetry_1, storage_1, textResourceConfiguration_1, instantiation_1, textResourceEditor_1, themeService_1, textResourceEditorInput_1, uri_1, resolverService_1, output_1, editorGroupsService_1, editorService_1, textfiles_1, files_1, label_1, filesConfigurationService_1) {
    "use strict";
    var $nVb_1, $oVb_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$oVb = exports.$nVb = void 0;
    let $nVb = class $nVb extends textResourceEditorInput_1.$7eb {
        static { $nVb_1 = this; }
        static { this.ID = 'workbench.editorinputs.output'; }
        get typeId() {
            return $nVb_1.ID;
        }
        constructor(outputChannelDescriptor, textModelResolverService, textFileService, editorService, fileService, labelService, filesConfigurationService) {
            super(uri_1.URI.from({ scheme: output_1.$$I, path: outputChannelDescriptor.id }), (0, path_1.$ae)(outputChannelDescriptor.file.path), (0, path_1.$_d)(outputChannelDescriptor.file.path), undefined, undefined, textModelResolverService, textFileService, editorService, fileService, labelService, filesConfigurationService);
        }
    };
    exports.$nVb = $nVb;
    exports.$nVb = $nVb = $nVb_1 = __decorate([
        __param(1, resolverService_1.$uA),
        __param(2, textfiles_1.$JD),
        __param(3, editorService_1.$9C),
        __param(4, files_1.$6j),
        __param(5, label_1.$Vz),
        __param(6, filesConfigurationService_1.$yD)
    ], $nVb);
    let $oVb = class $oVb extends textResourceEditor_1.$Dvb {
        static { $oVb_1 = this; }
        static { this.LOG_VIEWER_EDITOR_ID = 'workbench.editors.logViewer'; }
        constructor(telemetryService, instantiationService, storageService, textResourceConfigurationService, themeService, editorGroupService, editorService, fileService) {
            super($oVb_1.LOG_VIEWER_EDITOR_ID, telemetryService, instantiationService, storageService, textResourceConfigurationService, themeService, editorGroupService, editorService, fileService);
        }
        Hb() {
            const options = super.Hb();
            options.wordWrap = 'off'; // all log viewers do not wrap
            options.folding = false;
            options.scrollBeyondLastLine = false;
            options.renderValidationDecorations = 'editable';
            return options;
        }
        $() {
            return (0, nls_1.localize)(0, null);
        }
    };
    exports.$oVb = $oVb;
    exports.$oVb = $oVb = $oVb_1 = __decorate([
        __param(0, telemetry_1.$9k),
        __param(1, instantiation_1.$Ah),
        __param(2, storage_1.$Vo),
        __param(3, textResourceConfiguration_1.$FA),
        __param(4, themeService_1.$gv),
        __param(5, editorGroupsService_1.$5C),
        __param(6, editorService_1.$9C),
        __param(7, files_1.$6j)
    ], $oVb);
});
//# sourceMappingURL=logViewer.js.map