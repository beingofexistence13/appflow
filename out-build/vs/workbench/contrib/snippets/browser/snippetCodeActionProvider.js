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
define(["require", "exports", "vs/base/common/lifecycle", "vs/editor/common/core/selection", "vs/editor/common/services/languageFeatures", "vs/editor/contrib/codeAction/common/types", "vs/nls!vs/workbench/contrib/snippets/browser/snippetCodeActionProvider", "vs/platform/configuration/common/configuration", "vs/platform/instantiation/common/instantiation", "vs/workbench/contrib/snippets/browser/commands/fileTemplateSnippets", "vs/workbench/contrib/snippets/browser/commands/surroundWithSnippet", "./snippets"], function (require, exports, lifecycle_1, selection_1, languageFeatures_1, types_1, nls_1, configuration_1, instantiation_1, fileTemplateSnippets_1, surroundWithSnippet_1, snippets_1) {
    "use strict";
    var SurroundWithSnippetCodeActionProvider_1, FileTemplateCodeActionProvider_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$nYb = void 0;
    let SurroundWithSnippetCodeActionProvider = class SurroundWithSnippetCodeActionProvider {
        static { SurroundWithSnippetCodeActionProvider_1 = this; }
        static { this.a = 4; }
        static { this.b = {
            kind: types_1.$v1.SurroundWith.value,
            title: surroundWithSnippet_1.$mYb.options.title.value,
            command: {
                id: surroundWithSnippet_1.$mYb.options.id,
                title: surroundWithSnippet_1.$mYb.options.title.value,
            },
        }; }
        constructor(c) {
            this.c = c;
        }
        async provideCodeActions(model, range) {
            if (range.isEmpty()) {
                return undefined;
            }
            const position = selection_1.$ms.isISelection(range) ? range.getPosition() : range.getStartPosition();
            const snippets = await (0, surroundWithSnippet_1.$lYb)(this.c, model, position, false);
            if (!snippets.length) {
                return undefined;
            }
            const actions = [];
            for (const snippet of snippets) {
                if (actions.length >= SurroundWithSnippetCodeActionProvider_1.a) {
                    actions.push(SurroundWithSnippetCodeActionProvider_1.b);
                    break;
                }
                actions.push({
                    title: (0, nls_1.localize)(0, null, snippet.name),
                    kind: types_1.$v1.SurroundWith.value,
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
        __param(0, snippets_1.$amb)
    ], SurroundWithSnippetCodeActionProvider);
    let FileTemplateCodeActionProvider = class FileTemplateCodeActionProvider {
        static { FileTemplateCodeActionProvider_1 = this; }
        static { this.a = 4; }
        static { this.b = {
            title: (0, nls_1.localize)(1, null),
            kind: types_1.$v1.SurroundWith.value,
            command: {
                id: fileTemplateSnippets_1.$bFb.Id,
                title: ''
            }
        }; }
        constructor(c) {
            this.c = c;
            this.providedCodeActionKinds = [types_1.$v1.SurroundWith.value];
        }
        async provideCodeActions(model) {
            if (model.getValueLength() !== 0) {
                return undefined;
            }
            const snippets = await this.c.getSnippets(model.getLanguageId(), { fileTemplateSnippets: true, includeNoPrefixSnippets: true });
            const actions = [];
            for (const snippet of snippets) {
                if (actions.length >= FileTemplateCodeActionProvider_1.a) {
                    actions.push(FileTemplateCodeActionProvider_1.b);
                    break;
                }
                actions.push({
                    title: (0, nls_1.localize)(2, null, snippet.name),
                    kind: types_1.$v1.SurroundWith.value,
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
        __param(0, snippets_1.$amb)
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
    let $nYb = class $nYb {
        constructor(instantiationService, languageFeaturesService, configService) {
            this.a = new lifecycle_1.$jc();
            const setting = 'editor.snippets.codeActions.enabled';
            const sessionStore = new lifecycle_1.$jc();
            const update = () => {
                sessionStore.clear();
                if (configService.getValue(setting)) {
                    sessionStore.add(languageFeaturesService.codeActionProvider.register('*', instantiationService.createInstance(SurroundWithSnippetCodeActionProvider)));
                    sessionStore.add(languageFeaturesService.codeActionProvider.register('*', instantiationService.createInstance(FileTemplateCodeActionProvider)));
                }
            };
            update();
            this.a.add(configService.onDidChangeConfiguration(e => e.affectsConfiguration(setting) && update()));
            this.a.add(sessionStore);
        }
        dispose() {
            this.a.dispose();
        }
    };
    exports.$nYb = $nYb;
    exports.$nYb = $nYb = __decorate([
        __param(0, instantiation_1.$Ah),
        __param(1, languageFeatures_1.$hF),
        __param(2, configuration_1.$8h)
    ], $nYb);
});
//# sourceMappingURL=snippetCodeActionProvider.js.map