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
define(["require", "exports", "vs/editor/common/languages/languageConfigurationRegistry", "vs/editor/common/services/model", "vs/editor/common/services/modelService", "vs/editor/common/languages/language", "vs/editor/common/services/textResourceConfiguration", "vs/platform/configuration/common/configuration", "vs/platform/instantiation/common/extensions", "vs/platform/undoRedo/common/undoRedo", "vs/workbench/services/path/common/pathService"], function (require, exports, languageConfigurationRegistry_1, model_1, modelService_1, language_1, textResourceConfiguration_1, configuration_1, extensions_1, undoRedo_1, pathService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$5yb = void 0;
    let $5yb = class $5yb extends modelService_1.$4yb {
        constructor(configurationService, resourcePropertiesService, undoRedoService, languageConfigurationService, languageService, Q) {
            super(configurationService, resourcePropertiesService, undoRedoService, languageService, languageConfigurationService);
            this.Q = Q;
        }
        N(resource) {
            return (super.N(resource)
                || resource.scheme === this.Q.defaultUriScheme);
        }
    };
    exports.$5yb = $5yb;
    exports.$5yb = $5yb = __decorate([
        __param(0, configuration_1.$8h),
        __param(1, textResourceConfiguration_1.$GA),
        __param(2, undoRedo_1.$wu),
        __param(3, languageConfigurationRegistry_1.$2t),
        __param(4, language_1.$ct),
        __param(5, pathService_1.$yJ)
    ], $5yb);
    (0, extensions_1.$mr)(model_1.$yA, $5yb, 1 /* InstantiationType.Delayed */);
});
//# sourceMappingURL=modelService.js.map