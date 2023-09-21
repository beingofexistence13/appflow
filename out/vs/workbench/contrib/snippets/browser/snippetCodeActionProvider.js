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
define(["require", "exports", "vs/base/common/lifecycle", "vs/editor/common/core/selection", "vs/editor/common/services/languageFeatures", "vs/editor/contrib/codeAction/common/types", "vs/nls", "vs/platform/configuration/common/configuration", "vs/platform/instantiation/common/instantiation", "vs/workbench/contrib/snippets/browser/commands/fileTemplateSnippets", "vs/workbench/contrib/snippets/browser/commands/surroundWithSnippet", "./snippets"], function (require, exports, lifecycle_1, selection_1, languageFeatures_1, types_1, nls_1, configuration_1, instantiation_1, fileTemplateSnippets_1, surroundWithSnippet_1, snippets_1) {
    "use strict";
    var SurroundWithSnippetCodeActionProvider_1, FileTemplateCodeActionProvider_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SnippetCodeActions = void 0;
    let SurroundWithSnippetCodeActionProvider = class SurroundWithSnippetCodeActionProvider {
        static { SurroundWithSnippetCodeActionProvider_1 = this; }
        static { this._MAX_CODE_ACTIONS = 4; }
        static { this._overflowCommandCodeAction = {
            kind: types_1.CodeActionKind.SurroundWith.value,
            title: surroundWithSnippet_1.SurroundWithSnippetEditorAction.options.title.value,
            command: {
                id: surroundWithSnippet_1.SurroundWithSnippetEditorAction.options.id,
                title: surroundWithSnippet_1.SurroundWithSnippetEditorAction.options.title.value,
            },
        }; }
        constructor(_snippetService) {
            this._snippetService = _snippetService;
        }
        async provideCodeActions(model, range) {
            if (range.isEmpty()) {
                return undefined;
            }
            const position = selection_1.Selection.isISelection(range) ? range.getPosition() : range.getStartPosition();
            const snippets = await (0, surroundWithSnippet_1.getSurroundableSnippets)(this._snippetService, model, position, false);
            if (!snippets.length) {
                return undefined;
            }
            const actions = [];
            for (const snippet of snippets) {
                if (actions.length >= SurroundWithSnippetCodeActionProvider_1._MAX_CODE_ACTIONS) {
                    actions.push(SurroundWithSnippetCodeActionProvider_1._overflowCommandCodeAction);
                    break;
                }
                actions.push({
                    title: (0, nls_1.localize)('codeAction', "Surround With: {0}", snippet.name),
                    kind: types_1.CodeActionKind.SurroundWith.value,
                    edit: asWorkspaceEdit(model, range, snippet)
                });
            }
            return {
                actions,
                dispose() { }
            };
        }
    };
    SurroundWithSnippetCodeActionProvider = SurroundWithSnippetCodeActionProvider_1 = __decorate([
        __param(0, snippets_1.ISnippetsService)
    ], SurroundWithSnippetCodeActionProvider);
    let FileTemplateCodeActionProvider = class FileTemplateCodeActionProvider {
        static { FileTemplateCodeActionProvider_1 = this; }
        static { this._MAX_CODE_ACTIONS = 4; }
        static { this._overflowCommandCodeAction = {
            title: (0, nls_1.localize)('overflow.start.title', 'Start with Snippet'),
            kind: types_1.CodeActionKind.SurroundWith.value,
            command: {
                id: fileTemplateSnippets_1.ApplyFileSnippetAction.Id,
                title: ''
            }
        }; }
        constructor(_snippetService) {
            this._snippetService = _snippetService;
            this.providedCodeActionKinds = [types_1.CodeActionKind.SurroundWith.value];
        }
        async provideCodeActions(model) {
            if (model.getValueLength() !== 0) {
                return undefined;
            }
            const snippets = await this._snippetService.getSnippets(model.getLanguageId(), { fileTemplateSnippets: true, includeNoPrefixSnippets: true });
            const actions = [];
            for (const snippet of snippets) {
                if (actions.length >= FileTemplateCodeActionProvider_1._MAX_CODE_ACTIONS) {
                    actions.push(FileTemplateCodeActionProvider_1._overflowCommandCodeAction);
                    break;
                }
                actions.push({
                    title: (0, nls_1.localize)('title', 'Start with: {0}', snippet.name),
                    kind: types_1.CodeActionKind.SurroundWith.value,
                    edit: asWorkspaceEdit(model, model.getFullModelRange(), snippet)
                });
            }
            return {
                actions,
                dispose() { }
            };
        }
    };
    FileTemplateCodeActionProvider = FileTemplateCodeActionProvider_1 = __decorate([
        __param(0, snippets_1.ISnippetsService)
    ], FileTemplateCodeActionProvider);
    function asWorkspaceEdit(model, range, snippet) {
        return {
            edits: [{
                    versionId: model.getVersionId(),
                    resource: model.uri,
                    textEdit: {
                        range,
                        text: snippet.body,
                        insertAsSnippet: true,
                    }
                }]
        };
    }
    let SnippetCodeActions = class SnippetCodeActions {
        constructor(instantiationService, languageFeaturesService, configService) {
            this._store = new lifecycle_1.DisposableStore();
            const setting = 'editor.snippets.codeActions.enabled';
            const sessionStore = new lifecycle_1.DisposableStore();
            const update = () => {
                sessionStore.clear();
                if (configService.getValue(setting)) {
                    sessionStore.add(languageFeaturesService.codeActionProvider.register('*', instantiationService.createInstance(SurroundWithSnippetCodeActionProvider)));
                    sessionStore.add(languageFeaturesService.codeActionProvider.register('*', instantiationService.createInstance(FileTemplateCodeActionProvider)));
                }
            };
            update();
            this._store.add(configService.onDidChangeConfiguration(e => e.affectsConfiguration(setting) && update()));
            this._store.add(sessionStore);
        }
        dispose() {
            this._store.dispose();
        }
    };
    exports.SnippetCodeActions = SnippetCodeActions;
    exports.SnippetCodeActions = SnippetCodeActions = __decorate([
        __param(0, instantiation_1.IInstantiationService),
        __param(1, languageFeatures_1.ILanguageFeaturesService),
        __param(2, configuration_1.IConfigurationService)
    ], SnippetCodeActions);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic25pcHBldENvZGVBY3Rpb25Qcm92aWRlci5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL3NuaXBwZXRzL2Jyb3dzZXIvc25pcHBldENvZGVBY3Rpb25Qcm92aWRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7O0lBa0JoRyxJQUFNLHFDQUFxQyxHQUEzQyxNQUFNLHFDQUFxQzs7aUJBRWxCLHNCQUFpQixHQUFHLENBQUMsQUFBSixDQUFLO2lCQUV0QiwrQkFBMEIsR0FBZTtZQUNoRSxJQUFJLEVBQUUsc0JBQWMsQ0FBQyxZQUFZLENBQUMsS0FBSztZQUN2QyxLQUFLLEVBQUUscURBQStCLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxLQUFLO1lBQzFELE9BQU8sRUFBRTtnQkFDUixFQUFFLEVBQUUscURBQStCLENBQUMsT0FBTyxDQUFDLEVBQUU7Z0JBQzlDLEtBQUssRUFBRSxxREFBK0IsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLEtBQUs7YUFDMUQ7U0FDRCxBQVBpRCxDQU9oRDtRQUVGLFlBQStDLGVBQWlDO1lBQWpDLG9CQUFlLEdBQWYsZUFBZSxDQUFrQjtRQUFJLENBQUM7UUFFckYsS0FBSyxDQUFDLGtCQUFrQixDQUFDLEtBQWlCLEVBQUUsS0FBd0I7WUFFbkUsSUFBSSxLQUFLLENBQUMsT0FBTyxFQUFFLEVBQUU7Z0JBQ3BCLE9BQU8sU0FBUyxDQUFDO2FBQ2pCO1lBRUQsTUFBTSxRQUFRLEdBQUcscUJBQVMsQ0FBQyxZQUFZLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLGdCQUFnQixFQUFFLENBQUM7WUFDaEcsTUFBTSxRQUFRLEdBQUcsTUFBTSxJQUFBLDZDQUF1QixFQUFDLElBQUksQ0FBQyxlQUFl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