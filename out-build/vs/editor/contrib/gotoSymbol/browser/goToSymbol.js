/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/arrays", "vs/base/common/cancellation", "vs/base/common/errors", "vs/editor/browser/editorExtensions", "vs/editor/common/services/languageFeatures", "vs/editor/contrib/gotoSymbol/browser/referencesModel"], function (require, exports, arrays_1, cancellation_1, errors_1, editorExtensions_1, languageFeatures_1, referencesModel_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$T4 = exports.$S4 = exports.$R4 = exports.$Q4 = exports.$P4 = void 0;
    async function getLocationLinks(model, position, registry, provide) {
        const provider = registry.ordered(model);
        // get results
        const promises = provider.map((provider) => {
            return Promise.resolve(provide(provider, model, position)).then(undefined, err => {
                (0, errors_1.$Z)(err);
                return undefined;
            });
        });
        const values = await Promise.all(promises);
        return (0, arrays_1.$Fb)(values.flat());
    }
    function $P4(registry, model, position, token) {
        return getLocationLinks(model, position, registry, (provider, model, position) => {
            return provider.provideDefinition(model, position, token);
        });
    }
    exports.$P4 = $P4;
    function $Q4(registry, model, position, token) {
        return getLocationLinks(model, position, registry, (provider, model, position) => {
            return provider.provideDeclaration(model, position, token);
        });
    }
    exports.$Q4 = $Q4;
    function $R4(registry, model, position, token) {
        return getLocationLinks(model, position, registry, (provider, model, position) => {
            return provider.provideImplementation(model, position, token);
        });
    }
    exports.$R4 = $R4;
    function $S4(registry, model, position, token) {
        return getLocationLinks(model, position, registry, (provider, model, position) => {
            return provider.provideTypeDefinition(model, position, token);
        });
    }
    exports.$S4 = $S4;
    function $T4(registry, model, position, compact, token) {
        return getLocationLinks(model, position, registry, async (provider, model, position) => {
            const result = await provider.provideReferences(model, position, { includeDeclaration: true }, token);
            if (!compact || !result || result.length !== 2) {
                return result;
            }
            const resultWithoutDeclaration = await provider.provideReferences(model, position, { includeDeclaration: false }, token);
            if (resultWithoutDeclaration && resultWithoutDeclaration.length === 1) {
                return resultWithoutDeclaration;
            }
            return result;
        });
    }
    exports.$T4 = $T4;
    // -- API commands ----
    async function _sortedAndDeduped(callback) {
        const rawLinks = await callback();
        const model = new referencesModel_1.$B4(rawLinks, '');
        const modelLinks = model.references.map(ref => ref.link);
        model.dispose();
        return modelLinks;
    }
    (0, editorExtensions_1.$vV)('_executeDefinitionProvider', (accessor, model, position) => {
        const languageFeaturesService = accessor.get(languageFeatures_1.$hF);
        const promise = $P4(languageFeaturesService.definitionProvider, model, position, cancellation_1.CancellationToken.None);
        return _sortedAndDeduped(() => promise);
    });
    (0, editorExtensions_1.$vV)('_executeTypeDefinitionProvider', (accessor, model, position) => {
        const languageFeaturesService = accessor.get(languageFeatures_1.$hF);
        const promise = $S4(languageFeaturesService.typeDefinitionProvider, model, position, cancellation_1.CancellationToken.None);
        return _sortedAndDeduped(() => promise);
    });
    (0, editorExtensions_1.$vV)('_executeDeclarationProvider', (accessor, model, position) => {
        const languageFeaturesService = accessor.get(languageFeatures_1.$hF);
        const promise = $Q4(languageFeaturesService.declarationProvider, model, position, cancellation_1.CancellationToken.None);
        return _sortedAndDeduped(() => promise);
    });
    (0, editorExtensions_1.$vV)('_executeReferenceProvider', (accessor, model, position) => {
        const languageFeaturesService = accessor.get(languageFeatures_1.$hF);
        const promise = $T4(languageFeaturesService.referenceProvider, model, position, false, cancellation_1.CancellationToken.None);
        return _sortedAndDeduped(() => promise);
    });
    (0, editorExtensions_1.$vV)('_executeImplementationProvider', (accessor, model, position) => {
        const languageFeaturesService = accessor.get(languageFeatures_1.$hF);
        const promise = $R4(languageFeaturesService.implementationProvider, model, position, cancellation_1.CancellationToken.None);
        return _sortedAndDeduped(() => promise);
    });
});
//# sourceMappingURL=goToSymbol.js.map