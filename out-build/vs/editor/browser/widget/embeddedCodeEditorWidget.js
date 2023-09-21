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
    exports.$x3 = exports.$w3 = void 0;
    let $w3 = class $w3 extends codeEditorWidget_1.$uY {
        constructor(domElement, options, codeEditorWidgetOptions, parentEditor, instantiationService, codeEditorService, commandService, contextKeyService, themeService, notificationService, accessibilityService, languageConfigurationService, languageFeaturesService) {
            super(domElement, { ...parentEditor.getRawOptions(), overflowWidgetsDomNode: parentEditor.getOverflowWidgetsDomNode() }, codeEditorWidgetOptions, instantiationService, codeEditorService, commandService, contextKeyService, themeService, notificationService, accessibilityService, languageConfigurationService, languageFeaturesService);
            this.kb = parentEditor;
            this.cc = options;
            // Overwrite parent's options
            super.updateOptions(this.cc);
            this.B(parentEditor.onDidChangeConfiguration((e) => this.dc(e)));
        }
        getParentEditor() {
            return this.kb;
        }
        dc(e) {
            super.updateOptions(this.kb.getRawOptions());
            super.updateOptions(this.cc);
        }
        updateOptions(newOptions) {
            objects.$Ym(this.cc, newOptions, true);
            super.updateOptions(this.cc);
        }
    };
    exports.$w3 = $w3;
    exports.$w3 = $w3 = __decorate([
        __param(4, instantiation_1.$Ah),
        __param(5, codeEditorService_1.$nV),
        __param(6, commands_1.$Fr),
        __param(7, contextkey_1.$3i),
        __param(8, themeService_1.$gv),
        __param(9, notification_1.$Yu),
        __param(10, accessibility_1.$1r),
        __param(11, languageConfigurationRegistry_1.$2t),
        __param(12, languageFeatures_1.$hF)
    ], $w3);
    let $x3 = class $x3 extends diffEditorWidget_1.$6Z {
        constructor(domElement, options, codeEditorWidgetOptions, parentEditor, contextKeyService, instantiationService, codeEditorService, audioCueService, editorProgressService) {
            super(domElement, parentEditor.getRawOptions(), codeEditorWidgetOptions, contextKeyService, instantiationService, codeEditorService, audioCueService, editorProgressService);
            this.Z = parentEditor;
            this.ab = options;
            // Overwrite parent's options
            super.updateOptions(this.ab);
            this.B(parentEditor.onDidChangeConfiguration(e => this.bb(e)));
        }
        getParentEditor() {
            return this.Z;
        }
        bb(e) {
            super.updateOptions(this.Z.getRawOptions());
            super.updateOptions(this.ab);
        }
        updateOptions(newOptions) {
            objects.$Ym(this.ab, newOptions, true);
            super.updateOptions(this.ab);
        }
    };
    exports.$x3 = $x3;
    exports.$x3 = $x3 = __decorate([
        __param(4, contextkey_1.$3i),
        __param(5, instantiation_1.$Ah),
        __param(6, codeEditorService_1.$nV),
        __param(7, audioCueService_1.$sZ),
        __param(8, progress_1.$7u)
    ], $x3);
});
//# sourceMappingURL=embeddedCodeEditorWidget.js.map