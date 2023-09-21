/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/editor/common/languageFeatureRegistry", "vs/editor/common/services/languageFeatures", "vs/platform/instantiation/common/extensions"], function (require, exports, languageFeatureRegistry_1, languageFeatures_1, extensions_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$oBb = void 0;
    class $oBb {
        constructor() {
            this.referenceProvider = new languageFeatureRegistry_1.$dF(this.b.bind(this));
            this.renameProvider = new languageFeatureRegistry_1.$dF(this.b.bind(this));
            this.codeActionProvider = new languageFeatureRegistry_1.$dF(this.b.bind(this));
            this.definitionProvider = new languageFeatureRegistry_1.$dF(this.b.bind(this));
            this.typeDefinitionProvider = new languageFeatureRegistry_1.$dF(this.b.bind(this));
            this.declarationProvider = new languageFeatureRegistry_1.$dF(this.b.bind(this));
            this.implementationProvider = new languageFeatureRegistry_1.$dF(this.b.bind(this));
            this.documentSymbolProvider = new languageFeatureRegistry_1.$dF(this.b.bind(this));
            this.inlayHintsProvider = new languageFeatureRegistry_1.$dF(this.b.bind(this));
            this.colorProvider = new languageFeatureRegistry_1.$dF(this.b.bind(this));
            this.codeLensProvider = new languageFeatureRegistry_1.$dF(this.b.bind(this));
            this.documentFormattingEditProvider = new languageFeatureRegistry_1.$dF(this.b.bind(this));
            this.documentRangeFormattingEditProvider = new languageFeatureRegistry_1.$dF(this.b.bind(this));
            this.onTypeFormattingEditProvider = new languageFeatureRegistry_1.$dF(this.b.bind(this));
            this.signatureHelpProvider = new languageFeatureRegistry_1.$dF(this.b.bind(this));
            this.hoverProvider = new languageFeatureRegistry_1.$dF(this.b.bind(this));
            this.documentHighlightProvider = new languageFeatureRegistry_1.$dF(this.b.bind(this));
            this.selectionRangeProvider = new languageFeatureRegistry_1.$dF(this.b.bind(this));
            this.foldingRangeProvider = new languageFeatureRegistry_1.$dF(this.b.bind(this));
            this.linkProvider = new languageFeatureRegistry_1.$dF(this.b.bind(this));
            this.inlineCompletionsProvider = new languageFeatureRegistry_1.$dF(this.b.bind(this));
            this.completionProvider = new languageFeatureRegistry_1.$dF(this.b.bind(this));
            this.linkedEditingRangeProvider = new languageFeatureRegistry_1.$dF(this.b.bind(this));
            this.inlineValuesProvider = new languageFeatureRegistry_1.$dF(this.b.bind(this));
            this.evaluatableExpressionProvider = new languageFeatureRegistry_1.$dF(this.b.bind(this));
            this.documentRangeSemanticTokensProvider = new languageFeatureRegistry_1.$dF(this.b.bind(this));
            this.documentSemanticTokensProvider = new languageFeatureRegistry_1.$dF(this.b.bind(this));
            this.documentOnDropEditProvider = new languageFeatureRegistry_1.$dF(this.b.bind(this));
            this.documentPasteEditProvider = new languageFeatureRegistry_1.$dF(this.b.bind(this));
            this.mappedEditsProvider = new languageFeatureRegistry_1.$dF(this.b.bind(this));
        }
        setNotebookTypeResolver(resolver) {
            this.a = resolver;
        }
        b(uri) {
            return this.a?.(uri);
        }
    }
    exports.$oBb = $oBb;
    (0, extensions_1.$mr)(languageFeatures_1.$hF, $oBb, 1 /* InstantiationType.Delayed */);
});
//# sourceMappingURL=languageFeaturesService.js.map