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
define(["require", "exports", "vs/nls", "vs/base/common/json", "vs/base/common/lifecycle", "vs/platform/extensionManagement/common/extensionManagement", "vs/editor/common/core/range", "vs/editor/common/services/languageFeatures"], function (require, exports, nls_1, json_1, lifecycle_1, extensionManagement_1, range_1, languageFeatures_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ExtensionsCompletionItemsProvider = void 0;
    let ExtensionsCompletionItemsProvider = class ExtensionsCompletionItemsProvider extends lifecycle_1.Disposable {
        constructor(extensionManagementService, languageFeaturesService) {
            super();
            this.extensionManagementService = extensionManagementService;
            this._register(languageFeaturesService.completionProvider.register({ language: 'jsonc', pattern: '**/settings.json' }, {
                _debugDisplayName: 'extensionsCompletionProvider',
                provideCompletionItems: async (model, position, _context, token) => {
                    const getWordRangeAtPosition = (model, position) => {
                        const wordAtPosition = model.getWordAtPosition(position);
                        return wordAtPosition ? new range_1.Range(position.lineNumber, wordAtPosition.startColumn, position.lineNumber, wordAtPosition.endColumn) : null;
                    };
                    const location = (0, json_1.getLocation)(model.getValue(), model.getOffsetAt(position));
                    const range = getWordRangeAtPosition(model, position) ?? range_1.Range.fromPositions(position, position);
                    // extensions.supportUntrustedWorkspaces
                    if (location.path[0] === 'extensions.supportUntrustedWorkspaces' && location.path.length === 2 && location.isAtPropertyKey) {
                        let alreadyConfigured = [];
                        try {
                            alreadyConfigured = Object.keys((0, json_1.parse)(model.getValue())['extensions.supportUntrustedWorkspaces']);
                        }
                        catch (e) { /* ignore error */ }
                        return { suggestions: await this.provideSupportUntrustedWorkspacesExtensionProposals(alreadyConfigured, range) };
                    }
                    return { suggestions: [] };
                }
            }));
        }
        async provideSupportUntrustedWorkspacesExtensionProposals(alreadyConfigured, range) {
            const suggestions = [];
            const installedExtensions = (await this.extensionManagementService.getInstalled()).filter(e => e.manifest.main);
            const proposedExtensions = installedExtensions.filter(e => alreadyConfigured.indexOf(e.identifier.id) === -1);
            if (proposedExtensions.length) {
                suggestions.push(...proposedExtensions.map(e => {
                    const text = `"${e.identifier.id}": {\n\t"supported": true,\n\t"version": "${e.manifest.version}"\n},`;
                    return { label: e.identifier.id, kind: 13 /* CompletionItemKind.Value */, insertText: text, filterText: text, range };
                }));
            }
            else {
                const text = '"vscode.csharp": {\n\t"supported": true,\n\t"version": "0.0.0"\n},';
                suggestions.push({ label: (0, nls_1.localize)('exampleExtension', "Example"), kind: 13 /* CompletionItemKind.Value */, insertText: text, filterText: text, range });
            }
            return suggestions;
        }
    };
    exports.ExtensionsCompletionItemsProvider = ExtensionsCompletionItemsProvider;
    exports.ExtensionsCompletionItemsProvider = ExtensionsCompletionItemsProvider = __decorate([
        __param(0, extensionManagement_1.IExtensionManagementService),
        __param(1, languageFeatures_1.ILanguageFeaturesService)
    ], ExtensionsCompletionItemsProvider);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0ZW5zaW9uc0NvbXBsZXRpb25JdGVtc1Byb3ZpZGVyLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvZXh0ZW5zaW9ucy9icm93c2VyL2V4dGVuc2lvbnNDb21wbGV0aW9uSXRlbXNQcm92aWRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUFlekYsSUFBTSxpQ0FBaUMsR0FBdkMsTUFBTSxpQ0FBa0MsU0FBUSxzQkFBVTtRQUNoRSxZQUMrQywwQkFBdUQsRUFDM0UsdUJBQWlEO1lBRTNFLEtBQUssRUFBRSxDQUFDO1lBSHNDLCtCQUEwQixHQUExQiwwQkFBMEIsQ0FBNkI7WUFLckcsSUFBSSxDQUFDLFNBQVMsQ0FBQyx1QkFBdUIsQ0FBQyxrQkFBa0IsQ0FBQyxRQUFRLENBQUMsRUFBRSxRQUFRLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxrQkFBa0IsRUFBRSxFQUFFO2dCQUN0SCxpQkFBaUIsRUFBRSw4QkFBOEI7Z0JBQ2pELHNCQUFzQixFQUFFLEtBQUssRUFBRSxLQUFpQixFQUFFLFFBQWtCLEVBQUUsUUFBMkIsRUFBRSxLQUF3QixFQUEyQixFQUFFO29CQUN2SixNQUFNLHNCQUFzQixHQUFHLENBQUMsS0FBaUIsRUFBRSxRQUFrQixFQUFnQixFQUFFO3dCQUN0RixNQUFNLGNBQWMsR0FBRyxLQUFLLENBQUMsaUJBQWlCLENBQUMsUUFBUSxDQUFDLENBQUM7d0JBQ3pELE9BQU8sY0FBYyxDQUFDLENBQUMsQ0FBQyxJQUFJLGFBQUssQ0FBQyxRQUFRLENBQUMsVUFBVSxFQUFFLGNBQWMsQ0FBQyxXQUFXLEVBQUUsUUFBUSxDQUFDLFVBQVUsRUFBRSxjQUFjLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztvQkFDMUksQ0FBQyxDQUFDO29CQUVGLE1BQU0sUUFBUSxHQUFH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