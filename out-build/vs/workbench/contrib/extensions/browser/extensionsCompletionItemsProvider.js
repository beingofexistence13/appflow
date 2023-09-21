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
define(["require", "exports", "vs/nls!vs/workbench/contrib/extensions/browser/extensionsCompletionItemsProvider", "vs/base/common/json", "vs/base/common/lifecycle", "vs/platform/extensionManagement/common/extensionManagement", "vs/editor/common/core/range", "vs/editor/common/services/languageFeatures"], function (require, exports, nls_1, json_1, lifecycle_1, extensionManagement_1, range_1, languageFeatures_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$9Ub = void 0;
    let $9Ub = class $9Ub extends lifecycle_1.$kc {
        constructor(a, languageFeaturesService) {
            super();
            this.a = a;
            this.B(languageFeaturesService.completionProvider.register({ language: 'jsonc', pattern: '**/settings.json' }, {
                _debugDisplayName: 'extensionsCompletionProvider',
                provideCompletionItems: async (model, position, _context, token) => {
                    const getWordRangeAtPosition = (model, position) => {
                        const wordAtPosition = model.getWordAtPosition(position);
                        return wordAtPosition ? new range_1.$ks(position.lineNumber, wordAtPosition.startColumn, position.lineNumber, wordAtPosition.endColumn) : null;
                    };
                    const location = (0, json_1.$Km)(model.getValue(), model.getOffsetAt(position));
                    const range = getWordRangeAtPosition(model, position) ?? range_1.$ks.fromPositions(position, position);
                    // extensions.supportUntrustedWorkspaces
                    if (location.path[0] === 'extensions.supportUntrustedWorkspaces' && location.path.length === 2 && location.isAtPropertyKey) {
                        let alreadyConfigured = [];
                        try {
                            alreadyConfigured = Object.keys((0, json_1.$Lm)(model.getValue())['extensions.supportUntrustedWorkspaces']);
                        }
                        catch (e) { /* ignore error */ }
                        return { suggestions: await this.b(alreadyConfigured, range) };
                    }
                    return { suggestions: [] };
                }
            }));
        }
        async b(alreadyConfigured, range) {
            const suggestions = [];
            const installedExtensions = (await this.a.getInstalled()).filter(e => e.manifest.main);
            const proposedExtensions = installedExtensions.filter(e => alreadyConfigured.indexOf(e.identifier.id) === -1);
            if (proposedExtensions.length) {
                suggestions.push(...proposedExtensions.map(e => {
                    const text = `"${e.identifier.id}": {\n\t"supported": true,\n\t"version": "${e.manifest.version}"\n},`;
                    return { label: e.identifier.id, kind: 13 /* CompletionItemKind.Value */, insertText: text, filterText: text, range };
                }));
            }
            else {
                const text = '"vscode.csharp": {\n\t"supported": true,\n\t"version": "0.0.0"\n},';
                suggestions.push({ label: (0, nls_1.localize)(0, null), kind: 13 /* CompletionItemKind.Value */, insertText: text, filterText: text, range });
            }
            return suggestions;
        }
    };
    exports.$9Ub = $9Ub;
    exports.$9Ub = $9Ub = __decorate([
        __param(0, extensionManagement_1.$2n),
        __param(1, languageFeatures_1.$hF)
    ], $9Ub);
});
//# sourceMappingURL=extensionsCompletionItemsProvider.js.map