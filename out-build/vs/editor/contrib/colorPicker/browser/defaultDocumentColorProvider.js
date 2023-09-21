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
define(["require", "exports", "vs/base/common/color", "vs/editor/browser/services/editorWorkerService", "vs/editor/common/services/model", "vs/editor/common/languages/languageConfigurationRegistry", "vs/base/common/lifecycle", "vs/editor/common/services/languageFeatures", "vs/editor/common/editorFeatures"], function (require, exports, color_1, editorWorkerService_1, model_1, languageConfigurationRegistry_1, lifecycle_1, languageFeatures_1, editorFeatures_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$a3 = void 0;
    class $a3 {
        constructor(modelService, languageConfigurationService) {
            this.a = new editorWorkerService_1.$02(modelService, false, 'editorWorkerService', languageConfigurationService);
        }
        async provideDocumentColors(model, _token) {
            return this.a.computeDefaultDocumentColors(model.uri);
        }
        provideColorPresentations(_model, colorInfo, _token) {
            const range = colorInfo.range;
            const colorFromInfo = colorInfo.color;
            const alpha = colorFromInfo.alpha;
            const color = new color_1.$Os(new color_1.$Ls(Math.round(255 * colorFromInfo.red), Math.round(255 * colorFromInfo.green), Math.round(255 * colorFromInfo.blue), alpha));
            const rgb = alpha ? color_1.$Os.Format.CSS.formatRGB(color) : color_1.$Os.Format.CSS.formatRGBA(color);
            const hsl = alpha ? color_1.$Os.Format.CSS.formatHSL(color) : color_1.$Os.Format.CSS.formatHSLA(color);
            const hex = alpha ? color_1.$Os.Format.CSS.formatHex(color) : color_1.$Os.Format.CSS.formatHexA(color);
            const colorPresentations = [];
            colorPresentations.push({ label: rgb, textEdit: { range: range, text: rgb } });
            colorPresentations.push({ label: hsl, textEdit: { range: range, text: hsl } });
            colorPresentations.push({ label: hex, textEdit: { range: range, text: hex } });
            return colorPresentations;
        }
    }
    exports.$a3 = $a3;
    let DefaultDocumentColorProviderFeature = class DefaultDocumentColorProviderFeature extends lifecycle_1.$kc {
        constructor(_modelService, _languageConfigurationService, _languageFeaturesService) {
            super();
            this.B(_languageFeaturesService.colorProvider.register('*', new $a3(_modelService, _languageConfigurationService)));
        }
    };
    DefaultDocumentColorProviderFeature = __decorate([
        __param(0, model_1.$yA),
        __param(1, languageConfigurationRegistry_1.$2t),
        __param(2, languageFeatures_1.$hF)
    ], DefaultDocumentColorProviderFeature);
    (0, editorFeatures_1.$$2)(DefaultDocumentColorProviderFeature);
});
//# sourceMappingURL=defaultDocumentColorProvider.js.map