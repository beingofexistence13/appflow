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
    exports.SimpleCommentEditor = exports.ctxCommentEditorFocused = void 0;
    exports.ctxCommentEditorFocused = new contextkey_1.RawContextKey('commentEditorFocused', false);
    let SimpleCommentEditor = class SimpleCommentEditor extends codeEditorWidget_1.CodeEditorWidget {
        constructor(domElement, options, scopedContextKeyService, parentThread, instantiationService, codeEditorService, commandService, themeService, notificationService, accessibilityService, languageConfigurationService, languageFeaturesService) {
            const codeEditorWidgetOptions = {
                contributions: [
                    { id: menuPreventer_1.MenuPreventer.ID, ctor: menuPreventer_1.MenuPreventer, instantiation: 2 /* EditorContributionInstantiation.BeforeFirstInteraction */ },
                    { id: contextmenu_1.ContextMenuController.ID, ctor: contextmenu_1.ContextMenuController, instantiation: 2 /* EditorContributionInstantiation.BeforeFirstInteraction */ },
                    { id: suggestController_1.SuggestController.ID, ctor: suggestController_1.SuggestController, instantiation: 0 /* EditorContributionInstantiation.Eager */ },
                    { id: snippetController2_1.SnippetController2.ID, ctor: snippetController2_1.SnippetController2, instantiation: 4 /* EditorContributionInstantiation.Lazy */ },
                    { id: tabCompletion_1.TabCompletionController.ID, ctor: tabCompletion_1.TabCompletionController, instantiation: 0 /* EditorContributionInstantiation.Eager */ }, // eager because it needs to define a context key
                ]
            };
            super(domElement, options, codeEditorWidgetOptions, instantiationService, codeEditorService, commandService, scopedContextKeyService, themeService, notificationService, accessibilityService, languageConfigurationService, languageFeaturesService);
            this._commentEditorFocused = exports.ctxCommentEditorFocused.bindTo(scopedContextKeyService);
            this._commentEditorEmpty = commentContextKeys_1.CommentContextKeys.commentIsEmpty.bindTo(scopedContextKeyService);
            this._commentEditorEmpty.set(!this.getModel()?.getValueLength());
            this._parentThread = parentThread;
            this._register(this.onDidFocusEditorWidget(_ => this._commentEditorFocused.set(true)));
            this._register(this.onDidChangeModelContent(e => this._commentEditorEmpty.set(!this.getModel()?.getValueLength())));
            this._register(this.onDidBlurEditorWidget(_ => this._commentEditorFocused.reset()));
        }
        getParentThread() {
            return this._parentThread;
        }
        _getActions() {
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
    exports.SimpleCommentEditor = SimpleCommentEditor;
    exports.SimpleCommentEditor = SimpleCommentEditor = __decorate([
        __param(4, instantiation_1.IInstantiationService),
        __param(5, codeEditorService_1.ICodeEditorService),
        __param(6, commands_1.ICommandService),
        __param(7, themeService_1.IThemeService),
        __param(8, notification_1.INotificationService),
        __param(9, accessibility_1.IAccessibilityService),
        __param(10, languageConfigurationRegistry_1.ILanguageConfigurationService),
        __param(11, languageFeatures_1.ILanguageFeaturesService)
    ], SimpleCommentEditor);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2ltcGxlQ29tbWVudEVkaXRvci5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL2NvbW1lbnRzL2Jyb3dzZXIvc2ltcGxlQ29tbWVudEVkaXRvci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUF5Qm5GLFFBQUEsdUJBQXVCLEdBQUcsSUFBSSwwQkFBYSxDQUFVLHNCQUFzQixFQUFFLEtBQUssQ0FBQyxDQUFDO0lBRzFGLElBQU0sbUJBQW1CLEdBQXpCLE1BQU0sbUJBQW9CLFNBQVEsbUNBQWdCO1FBS3hELFlBQ0MsVUFBdUIsRUFDdkIsT0FBdUIsRUFDdkIsdUJBQTJDLEVBQzNDLFlBQWtDLEVBQ1gsb0JBQTJDLEVBQzlDLGlCQUFxQyxFQUN4QyxjQUErQixFQUNqQyxZQUEyQixFQUNwQixtQkFBeUMsRUFDeEMsb0JBQTJDLEVBQ25DLDRCQUEyRCxFQUNoRSx1QkFBaUQ7WUFFM0UsTUFBTSx1QkFBdUIsR0FBNkI7Z0JBQ3pELGFBQWEsRUFBb0M7b0JBQ2hELEVBQUUsRUFBRSxFQUFFLDZCQUFhLENBQUMsRUFBRSxFQUFFLElBQUksRUFBRSw2QkFBYSxFQUFFLGFBQWEsZ0VBQXdELEVBQUU7b0JBQ3BILEVBQUUsRUFBRSxFQUFFLG1DQUFxQixDQUFDLEVBQUUsRUFBRSxJQUFJLEVBQUUsbUNBQXFCLEVBQUUsYUFBYSxnRUFBd0QsRUFBRTtvQkFDcEksRUFBRSxFQUFFLEVBQUUscUNBQWlCLENBQUMsRUFBRSxFQUFFLElBQUksRUFBRSxxQ0FBaUIsRUFBRSxhQUFhLCtDQUF1QyxFQUFFO29CQUMzRyxFQUFFLEVBQUUsRUFBRSx1Q0FBa0IsQ0FBQyxFQUFFLEVBQUUsSUFBSSxFQUFFLHVDQUFrQixFQUFFLGFBQWEsOENBQXNDLEVBQUU7b0JBQzVHLEVBQUUsRUFBRSxFQUFFLHVDQUF1QixDQUFDLEVBQUUsRUFB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