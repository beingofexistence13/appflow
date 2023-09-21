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
    exports.DefaultDocumentColorProvider = void 0;
    class DefaultDocumentColorProvider {
        constructor(modelService, languageConfigurationService) {
            this._editorWorkerClient = new editorWorkerService_1.EditorWorkerClient(modelService, false, 'editorWorkerService', languageConfigurationService);
        }
        async provideDocumentColors(model, _token) {
            return this._editorWorkerClient.computeDefaultDocumentColors(model.uri);
        }
        provideColorPresentations(_model, colorInfo, _token) {
            const range = colorInfo.range;
            const colorFromInfo = colorInfo.color;
            const alpha = colorFromInfo.alpha;
            const color = new color_1.Color(new color_1.RGBA(Math.round(255 * colorFromInfo.red), Math.round(255 * colorFromInfo.green), Math.round(255 * colorFromInfo.blue), alpha));
            const rgb = alpha ? color_1.Color.Format.CSS.formatRGB(color) : color_1.Color.Format.CSS.formatRGBA(color);
            const hsl = alpha ? color_1.Color.Format.CSS.formatHSL(color) : color_1.Color.Format.CSS.formatHSLA(color);
            const hex = alpha ? color_1.Color.Format.CSS.formatHex(color) : color_1.Color.Format.CSS.formatHexA(color);
            const colorPresentations = [];
            colorPresentations.push({ label: rgb, textEdit: { range: range, text: rgb } });
            colorPresentations.push({ label: hsl, textEdit: { range: range, text: hsl } });
            colorPresentations.push({ label: hex, textEdit: { range: range, text: hex } });
            return colorPresentations;
        }
    }
    exports.DefaultDocumentColorProvider = DefaultDocumentColorProvider;
    let DefaultDocumentColorProviderFeature = class DefaultDocumentColorProviderFeature extends lifecycle_1.Disposable {
        constructor(_modelService, _languageConfigurationService, _languageFeaturesService) {
            super();
            this._register(_languageFeaturesService.colorProvider.register('*', new DefaultDocumentColorProvider(_modelService, _languageConfigurationService)));
        }
    };
    DefaultDocumentColorProviderFeature = __decorate([
        __param(0, model_1.IModelService),
        __param(1, languageConfigurationRegistry_1.ILanguageConfigurationService),
        __param(2, languageFeatures_1.ILanguageFeaturesService)
    ], DefaultDocumentColorProviderFeature);
    (0, editorFeatures_1.registerEditorFeature)(DefaultDocumentColorProviderFeature);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVmYXVsdERvY3VtZW50Q29sb3JQcm92aWRlci5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL2VkaXRvci9jb250cmliL2NvbG9yUGlja2VyL2Jyb3dzZXIvZGVmYXVsdERvY3VtZW50Q29sb3JQcm92aWRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUFhaEcsTUFBYSw0QkFBNEI7UUFJeEMsWUFDQyxZQUEyQixFQUMzQiw0QkFBMkQ7WUFFM0QsSUFBSSxDQUFDLG1CQUFtQixHQUFHLElBQUksd0NBQWtCLENBQUMsWUFBWSxFQUFFLEtBQUssRUFBRSxxQkFBcUIsRUFBRSw0QkFBNEIsQ0FBQyxDQUFDO1FBQzdILENBQUM7UUFFRCxLQUFLLENBQUMscUJBQXFCLENBQUMsS0FBaUIsRUFBRSxNQUF5QjtZQUN2RSxPQUFPLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyw0QkFBNEIsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDekUsQ0FBQztRQUVELHlCQUF5QixDQUFDLE1BQWtCLEVBQUUsU0FBNEIsRUFBRSxNQUF5QjtZQUNwRyxNQUFNLEtBQUssR0FBRyxTQUFTLENBQUMsS0FBSyxDQUFDO1lBQzlCLE1BQU0sYUFBYSxHQUFXLFNBQVMsQ0FBQyxLQUFLLENBQUM7WUFDOUMsTUFBTSxLQUFLLEdBQUcsYUFBYSxDQUFDLEtBQUssQ0FBQztZQUNsQyxNQUFNLEtBQUssR0FBRyxJQUFJLGFBQUssQ0FBQyxJQUFJLFlBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsR0FBRyxhQUFhLENBQUMsR0FBRyxDQUFDLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLEdBQUcsYUFBYSxDQUFDLEtBQUssQ0FBQyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxHQUFHLGFBQWEsQ0FBQyxJQUFJLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDO1lBRTNKLE1BQU0sR0FBRyxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMsYUFBSyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxhQUFLLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDM0YsTUFBTSxHQUFHLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQyxhQUFLLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLGFBQUssQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUMzRixNQUFNLEdBQUcsR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDLGFBQUssQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsYUFBSyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBRTNGLE1BQU0sa0JBQWtCLEdBQXlCLEVBQUUsQ0FBQztZQUNwRCxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsRUFBRSxLQUFLLEVBQUUsR0FBRyxFQUFFLFFBQVEsRUFBRSxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLEdBQUcsRUFBRSxFQUFFLENBQUMsQ0FBQztZQUMvRSxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsRUFBRSxLQUFLLEVBQUUsR0FBRyxFQUFFLFFBQVEsRUFBRSxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLEdBQUcsRUFBRSxFQUFFLENBQUMsQ0FBQztZQUMvRSxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsRUFBRSxLQUFLLEVBQUUsR0FBRyxFQUFFLFFBQVEsRUFBRSxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLEdBQUcsRUFBRSxFQUFFLENBQUMsQ0FBQztZQUMvRSxPQUFPLGtCQUFrQixDQUFDO1FBQzNCLENBQUM7S0FDRDtJQS9CRCxvRUErQkM7SUFFRCxJQUFNLG1DQUFtQyxHQUF6QyxNQUFNLG1DQUFvQyxTQUFRLHNCQUFVO1FBQzNELFlBQ2dCLGFBQTRCLEVBQ1osNkJBQTRELEVBQ2pFLHdCQUFrRDtZQUU1RSxLQUFLLEVBQUUsQ0FBQztZQUNSLElBQUksQ0FBQyxTQUFTLENBQUMsd0JBQXdCLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxHQUFHLEVBQUUsSUFBSSw0QkFBNEIsQ0FBQyxhQUFhLEVBQUUsNkJBQTZCLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDdEosQ0FBQztLQUNELENBQUE7SUFUSyxtQ0FBbUM7UUFFdEMsV0FBQSxxQkFBYSxDQUFBO1FBQ2IsV0FBQSw2REFBNkIsQ0FBQTtRQUM3QixXQUFBLDJDQUF3QixDQUFBO09BSnJCLG1DQUFtQyxDQVN4QztJQUVELElBQUEsc0NBQXFCLEVBQUMsbUNBQW1DLENBQUMsQ0FBQyJ9