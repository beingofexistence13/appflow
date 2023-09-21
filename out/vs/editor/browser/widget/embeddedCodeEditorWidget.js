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
define(["require", "exports", "vs/base/common/objects", "vs/editor/browser/services/codeEditorService", "vs/editor/browser/widget/codeEditorWidget", "vs/editor/browser/widget/diffEditor/diffEditorWidget", "vs/editor/common/languages/languageConfigurationRegistry", "vs/editor/common/services/languageFeatures", "vs/platform/accessibility/common/accessibility", "vs/platform/audioCues/browser/audioCueService", "vs/platform/commands/common/commands", "vs/platform/contextkey/common/contextkey", "vs/platform/instantiation/common/instantiation", "vs/platform/notification/common/notification", "vs/platform/progress/common/progress", "vs/platform/theme/common/themeService"], function (require, exports, objects, codeEditorService_1, codeEditorWidget_1, diffEditorWidget_1, languageConfigurationRegistry_1, languageFeatures_1, accessibility_1, audioCueService_1, commands_1, contextkey_1, instantiation_1, notification_1, progress_1, themeService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.EmbeddedDiffEditorWidget = exports.EmbeddedCodeEditorWidget = void 0;
    let EmbeddedCodeEditorWidget = class EmbeddedCodeEditorWidget extends codeEditorWidget_1.CodeEditorWidget {
        constructor(domElement, options, codeEditorWidgetOptions, parentEditor, instantiationService, codeEditorService, commandService, contextKeyService, themeService, notificationService, accessibilityService, languageConfigurationService, languageFeaturesService) {
            super(domElement, { ...parentEditor.getRawOptions(), overflowWidgetsDomNode: parentEditor.getOverflowWidgetsDomNode() }, codeEditorWidgetOptions, instantiationService, codeEditorService, commandService, contextKeyService, themeService, notificationService, accessibilityService, languageConfigurationService, languageFeaturesService);
            this._parentEditor = parentEditor;
            this._overwriteOptions = options;
            // Overwrite parent's options
            super.updateOptions(this._overwriteOptions);
            this._register(parentEditor.onDidChangeConfiguration((e) => this._onParentConfigurationChanged(e)));
        }
        getParentEditor() {
            return this._parentEditor;
        }
        _onParentConfigurationChanged(e) {
            super.updateOptions(this._parentEditor.getRawOptions());
            super.updateOptions(this._overwriteOptions);
        }
        updateOptions(newOptions) {
            objects.mixin(this._overwriteOptions, newOptions, true);
            super.updateOptions(this._overwriteOptions);
        }
    };
    exports.EmbeddedCodeEditorWidget = EmbeddedCodeEditorWidget;
    exports.EmbeddedCodeEditorWidget = EmbeddedCodeEditorWidget = __decorate([
        __param(4, instantiation_1.IInstantiationService),
        __param(5, codeEditorService_1.ICodeEditorService),
        __param(6, commands_1.ICommandService),
        __param(7, contextkey_1.IContextKeyService),
        __param(8, themeService_1.IThemeService),
        __param(9, notification_1.INotificationService),
        __param(10, accessibility_1.IAccessibilityService),
        __param(11, languageConfigurationRegistry_1.ILanguageConfigurationService),
        __param(12, languageFeatures_1.ILanguageFeaturesService)
    ], EmbeddedCodeEditorWidget);
    let EmbeddedDiffEditorWidget = class EmbeddedDiffEditorWidget extends diffEditorWidget_1.DiffEditorWidget {
        constructor(domElement, options, codeEditorWidgetOptions, parentEditor, contextKeyService, instantiationService, codeEditorService, audioCueService, editorProgressService) {
            super(domElement, parentEditor.getRawOptions(), codeEditorWidgetOptions, contextKeyService, instantiationService, codeEditorService, audioCueService, editorProgressService);
            this._parentEditor = parentEditor;
            this._overwriteOptions = options;
            // Overwrite parent's options
            super.updateOptions(this._overwriteOptions);
            this._register(parentEditor.onDidChangeConfiguration(e => this._onParentConfigurationChanged(e)));
        }
        getParentEditor() {
            return this._parentEditor;
        }
        _onParentConfigurationChanged(e) {
            super.updateOptions(this._parentEditor.getRawOptions());
            super.updateOptions(this._overwriteOptions);
        }
        updateOptions(newOptions) {
            objects.mixin(this._overwriteOptions, newOptions, true);
            super.updateOptions(this._overwriteOptions);
        }
    };
    exports.EmbeddedDiffEditorWidget = EmbeddedDiffEditorWidget;
    exports.EmbeddedDiffEditorWidget = EmbeddedDiffEditorWidget = __decorate([
        __param(4, contextkey_1.IContextKeyService),
        __param(5, instantiation_1.IInstantiationService),
        __param(6, codeEditorService_1.ICodeEditorService),
        __param(7, audioCueService_1.IAudioCueService),
        __param(8, progress_1.IEditorProgressService)
    ], EmbeddedDiffEditorWidget);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZW1iZWRkZWRDb2RlRWRpdG9yV2lkZ2V0LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvZWRpdG9yL2Jyb3dzZXIvd2lkZ2V0L2VtYmVkZGVkQ29kZUVkaXRvcldpZGdldC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUFtQnpGLElBQU0sd0JBQXdCLEdBQTlCLE1BQU0sd0JBQXlCLFNBQVEsbUNBQWdCO1FBSzdELFlBQ0MsVUFBdUIsRUFDdkIsT0FBdUIsRUFDdkIsdUJBQWlELEVBQ2pELFlBQXlCLEVBQ0Ysb0JBQTJDLEVBQzlDLGlCQUFxQyxFQUN4QyxjQUErQixFQUM1QixpQkFBcUMsRUFDMUMsWUFBMkIsRUFDcEIsbUJBQXlDLEVBQ3hDLG9CQUEyQyxFQUNuQyw0QkFBMkQsRUFDaEUsdUJBQWlEO1lBRTNFLEtBQUssQ0FBQyxVQUFVLEVBQUUsRUFBRSxHQUFHLFlBQVksQ0FBQyxhQUFhLEVBQUUsRUFBRSxzQkFBc0IsRUFBRSxZQUFZLENBQUMseUJBQXlCLEVBQUUsRUFBRSxFQUFFLHVCQUF1QixFQUFFLG9CQUFvQixFQUFFLGlCQUFpQixFQUFFLGNBQWMsRUFBRSxpQkFBaUIsRUFBRSxZQUFZLEVBQUUsbUJBQW1CLEVBQUUsb0JBQW9CLEVBQUUsNEJBQTRCLEVBQUUsdUJBQXVCLENBQUMsQ0FBQztZQUU5VSxJQUFJLENBQUMsYUFBYSxHQUFHLFlBQVksQ0FBQztZQUNsQyxJQUFJLENBQUMsaUJBQWlCLEdBQUcsT0FBTyxDQUFDO1lBRWpDLDZCQUE2QjtZQUM3QixLQUFLLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO1lBRTVDLElBQUksQ0FBQyxTQUFTLENBQUMsWUFBWSxDQUFDLHdCQUF3QixDQUFDLENBQUMsQ0FBNEIsRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLDZCQUE2QixDQUFDLENBQUMsQ0FB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