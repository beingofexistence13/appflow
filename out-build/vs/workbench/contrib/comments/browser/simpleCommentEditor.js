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
define(["require", "exports", "vs/editor/browser/editorExtensions", "vs/editor/browser/services/codeEditorService", "vs/editor/browser/widget/codeEditorWidget", "vs/platform/contextkey/common/contextkey", "vs/platform/instantiation/common/instantiation", "vs/platform/commands/common/commands", "vs/workbench/contrib/codeEditor/browser/menuPreventer", "vs/editor/contrib/contextmenu/browser/contextmenu", "vs/editor/contrib/suggest/browser/suggestController", "vs/editor/contrib/snippet/browser/snippetController2", "vs/workbench/contrib/snippets/browser/tabCompletion", "vs/platform/theme/common/themeService", "vs/platform/notification/common/notification", "vs/platform/accessibility/common/accessibility", "vs/workbench/contrib/comments/common/commentContextKeys", "vs/editor/common/languages/languageConfigurationRegistry", "vs/editor/common/services/languageFeatures"], function (require, exports, editorExtensions_1, codeEditorService_1, codeEditorWidget_1, contextkey_1, instantiation_1, commands_1, menuPreventer_1, contextmenu_1, suggestController_1, snippetController2_1, tabCompletion_1, themeService_1, notification_1, accessibility_1, commentContextKeys_1, languageConfigurationRegistry_1, languageFeatures_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$smb = exports.$rmb = void 0;
    exports.$rmb = new contextkey_1.$2i('commentEditorFocused', false);
    let $smb = class $smb extends codeEditorWidget_1.$uY {
        constructor(domElement, options, scopedContextKeyService, parentThread, instantiationService, codeEditorService, commandService, themeService, notificationService, accessibilityService, languageConfigurationService, languageFeaturesService) {
            const codeEditorWidgetOptions = {
                contributions: [
                    { id: menuPreventer_1.$0lb.ID, ctor: menuPreventer_1.$0lb, instantiation: 2 /* EditorContributionInstantiation.BeforeFirstInteraction */ },
                    { id: contextmenu_1.$X6.ID, ctor: contextmenu_1.$X6, instantiation: 2 /* EditorContributionInstantiation.BeforeFirstInteraction */ },
                    { id: suggestController_1.$G6.ID, ctor: suggestController_1.$G6, instantiation: 0 /* EditorContributionInstantiation.Eager */ },
                    { id: snippetController2_1.$05.ID, ctor: snippetController2_1.$05, instantiation: 4 /* EditorContributionInstantiation.Lazy */ },
                    { id: tabCompletion_1.$qmb.ID, ctor: tabCompletion_1.$qmb, instantiation: 0 /* EditorContributionInstantiation.Eager */ }, // eager because it needs to define a context key
                ]
            };
            super(domElement, options, codeEditorWidgetOptions, instantiationService, codeEditorService, commandService, scopedContextKeyService, themeService, notificationService, accessibilityService, languageConfigurationService, languageFeaturesService);
            this.cc = exports.$rmb.bindTo(scopedContextKeyService);
            this.dc = commentContextKeys_1.CommentContextKeys.commentIsEmpty.bindTo(scopedContextKeyService);
            this.dc.set(!this.getModel()?.getValueLength());
            this.kb = parentThread;
            this.B(this.onDidFocusEditorWidget(_ => this.cc.set(true)));
            this.B(this.onDidChangeModelContent(e => this.dc.set(!this.getModel()?.getValueLength())));
            this.B(this.onDidBlurEditorWidget(_ => this.cc.reset()));
        }
        getParentThread() {
            return this.kb;
        }
        ec() {
            return editorExtensions_1.EditorExtensionsRegistry.getEditorActions();
        }
        static getEditorOptions(configurationService) {
            return {
                wordWrap: 'on',
                glyphMargin: false,
                lineNumbers: 'off',
                folding: false,
                selectOnLineNumbers: false,
                scrollbar: {
                    vertical: 'visible',
                    verticalScrollbarSize: 14,
                    horizontal: 'auto',
                    useShadows: true,
                    verticalHasArrows: false,
                    horizontalHasArrows: false
                },
                overviewRulerLanes: 2,
                lineDecorationsWidth: 0,
                scrollBeyondLastLine: false,
                renderLineHighlight: 'none',
                fixedOverflowWidgets: true,
                acceptSuggestionOnEnter: 'smart',
                minimap: {
                    enabled: false
                },
                autoClosingBrackets: configurationService.getValue('editor.autoClosingBrackets'),
                quickSuggestions: false,
                accessibilitySupport: configurationService.getValue('editor.accessibilitySupport'),
            };
        }
    };
    exports.$smb = $smb;
    exports.$smb = $smb = __decorate([
        __param(4, instantiation_1.$Ah),
        __param(5, codeEditorService_1.$nV),
        __param(6, commands_1.$Fr),
        __param(7, themeService_1.$gv),
        __param(8, notification_1.$Yu),
        __param(9, accessibility_1.$1r),
        __param(10, languageConfigurationRegistry_1.$2t),
        __param(11, languageFeatures_1.$hF)
    ], $smb);
});
//# sourceMappingURL=simpleCommentEditor.js.map