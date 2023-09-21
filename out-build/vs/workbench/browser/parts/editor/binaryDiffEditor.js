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
define(["require", "exports", "vs/nls!vs/workbench/browser/parts/editor/binaryDiffEditor", "vs/workbench/common/editor", "vs/platform/telemetry/common/telemetry", "vs/platform/theme/common/themeService", "vs/workbench/browser/parts/editor/sideBySideEditor", "vs/platform/instantiation/common/instantiation", "vs/workbench/browser/parts/editor/binaryEditor", "vs/platform/storage/common/storage", "vs/platform/configuration/common/configuration", "vs/editor/common/services/textResourceConfiguration", "vs/workbench/services/editor/common/editorGroupsService", "vs/workbench/services/editor/common/editorService"], function (require, exports, nls_1, editor_1, telemetry_1, themeService_1, sideBySideEditor_1, instantiation_1, binaryEditor_1, storage_1, configuration_1, textResourceConfiguration_1, editorGroupsService_1, editorService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Kvb = void 0;
    /**
     * An implementation of editor for diffing binary files like images or videos.
     */
    let $Kvb = class $Kvb extends sideBySideEditor_1.$dub {
        static { this.ID = editor_1.$KE; }
        constructor(telemetryService, instantiationService, themeService, storageService, configurationService, textResourceConfigurationService, editorService, editorGroupService) {
            super(telemetryService, instantiationService, themeService, storageService, configurationService, textResourceConfigurationService, editorService, editorGroupService);
        }
        getMetadata() {
            const primary = this.getPrimaryEditorPane();
            const secondary = this.getSecondaryEditorPane();
            if (primary instanceof binaryEditor_1.$Jvb && secondary instanceof binaryEditor_1.$Jvb) {
                return (0, nls_1.localize)(0, null, secondary.getMetadata(), primary.getMetadata());
            }
            return undefined;
        }
    };
    exports.$Kvb = $Kvb;
    exports.$Kvb = $Kvb = __decorate([
        __param(0, telemetry_1.$9k),
        __param(1, instantiation_1.$Ah),
        __param(2, themeService_1.$gv),
        __param(3, storage_1.$Vo),
        __param(4, configuration_1.$8h),
        __param(5, textResourceConfiguration_1.$FA),
        __param(6, editorService_1.$9C),
        __param(7, editorGroupsService_1.$5C)
    ], $Kvb);
});
//# sourceMappingURL=binaryDiffEditor.js.map