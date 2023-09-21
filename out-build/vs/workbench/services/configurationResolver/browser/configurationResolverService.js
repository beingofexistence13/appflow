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
define(["require", "exports", "vs/platform/commands/common/commands", "vs/platform/configuration/common/configuration", "vs/platform/instantiation/common/extensions", "vs/platform/label/common/label", "vs/platform/quickinput/common/quickInput", "vs/platform/workspace/common/workspace", "vs/workbench/services/configurationResolver/browser/baseConfigurationResolverService", "vs/workbench/services/configurationResolver/common/configurationResolver", "vs/workbench/services/editor/common/editorService", "vs/workbench/services/extensions/common/extensions", "vs/workbench/services/path/common/pathService"], function (require, exports, commands_1, configuration_1, extensions_1, label_1, quickInput_1, workspace_1, baseConfigurationResolverService_1, configurationResolver_1, editorService_1, extensions_2, pathService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$z4b = void 0;
    let $z4b = class $z4b extends baseConfigurationResolverService_1.$y4b {
        constructor(editorService, configurationService, commandService, workspaceContextService, quickInputService, labelService, pathService, extensionService) {
            super({ getAppRoot: () => undefined, getExecPath: () => undefined }, Promise.resolve(Object.create(null)), editorService, configurationService, commandService, workspaceContextService, quickInputService, labelService, pathService, extensionService);
        }
    };
    exports.$z4b = $z4b;
    exports.$z4b = $z4b = __decorate([
        __param(0, editorService_1.$9C),
        __param(1, configuration_1.$8h),
        __param(2, commands_1.$Fr),
        __param(3, workspace_1.$Kh),
        __param(4, quickInput_1.$Gq),
        __param(5, label_1.$Vz),
        __param(6, pathService_1.$yJ),
        __param(7, extensions_2.$MF)
    ], $z4b);
    (0, extensions_1.$mr)(configurationResolver_1.$NM, $z4b, 1 /* InstantiationType.Delayed */);
});
//# sourceMappingURL=configurationResolverService.js.map