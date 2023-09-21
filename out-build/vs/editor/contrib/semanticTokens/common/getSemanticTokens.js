/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/cancellation", "vs/base/common/errors", "vs/base/common/uri", "vs/editor/common/services/model", "vs/platform/commands/common/commands", "vs/base/common/types", "vs/editor/common/services/semanticTokensDto", "vs/editor/common/core/range", "vs/editor/common/services/languageFeatures"], function (require, exports, cancellation_1, errors_1, uri_1, model_1, commands_1, types_1, semanticTokensDto_1, range_1, languageFeatures_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$D0 = exports.$C0 = exports.$B0 = exports.$A0 = exports.$z0 = exports.$y0 = exports.$x0 = void 0;
    function $x0(v) {
        return v && !!(v.data);
    }
    exports.$x0 = $x0;
    function $y0(v) {
        return v && Array.isArray(v.edits);
    }
    exports.$y0 = $y0;
    class $z0 {
        constructor(provider, tokens, error) {
            this.provider = provider;
            this.tokens = tokens;
            this.error = error;
        }
    }
    exports.$z0 = $z0;
    function $A0(registry, model) {
        return registry.has(model);
    }
    exports.$A0 = $A0;
    function getDocumentSemanticTokensProviders(registry, model) {
        const groups = registry.orderedGroups(model);
        return (groups.length > 0 ? groups[0] : []);
    }
    async function $B0(registry, model, lastProvider, lastResultId, token) {
        const providers = getDocumentSemanticTokensProviders(registry, model);
        // Get tokens from all providers at the same time.
        const results = await Promise.all(providers.map(async (provider) => {
            let result;
            let error = null;
            try {
                result = await provider.provideDocumentSemanticTokens(model, (provider === lastProvider ? lastResultId : null), token);
            }
            catch (err) {
                error = err;
                result = null;
            }
            if (!result || (!$x0(result) && !$y0(result))) {
                result = null;
            }
            return new $z0(provider, result, error);
        }));
        // Try to return the first result with actual tokens or
        // the first result which threw an error (!!)
        for (const result of results) {
            if (result.error) {
                throw result.error;
            }
            if (result.tokens) {
                return result;
            }
        }
        // Return the first result, even if it doesn't have tokens
        if (results.length > 0) {
            return results[0];
        }
        return null;
    }
    exports.$B0 = $B0;
    function _getDocumentSemanticTokensProviderHighestGroup(registry, model) {
        const result = registry.orderedGroups(model);
        return (result.length > 0 ? result[0] : null);
    }
    class DocumentRangeSemanticTokensResult {
        constructor(provider, tokens) {
            this.provider = provider;
            this.tokens = tokens;
        }
    }
    function $C0(providers, model) {
        return providers.has(model);
    }
    exports.$C0 = $C0;
    function getDocumentRangeSemanticTokensProviders(providers, model) {
        const groups = providers.orderedGroups(model);
        return (groups.length > 0 ? groups[0] : []);
    }
    async function $D0(registry, model, range, token) {
        const providers = getDocumentRangeSemanticTokensProviders(registry, model);
        // Get tokens from all providers at the same time.
        const results = await Promise.all(providers.map(async (provider) => {
            let result;
            try {
                result = await provider.provideDocumentRangeSemanticTokens(model, range, token);
            }
            catch (err) {
                (0, errors_1.$Z)(err);
                result = null;
            }
            if (!result || !$x0(result)) {
                result = null;
            }
            return new DocumentRangeSemanticTokensResult(provider, result);
        }));
        // Try to return the first result with actual tokens
        for (const result of results) {
            if (result.tokens) {
                return result;
            }
        }
        // Return the first result, even if it doesn't have tokens
        if (results.length > 0) {
            return results[0];
        }
        return null;
    }
    exports.$D0 = $D0;
    commands_1.$Gr.registerCommand('_provideDocumentSemanticTokensLegend', async (accessor, ...args) => {
        const [uri] = args;
        (0, types_1.$tf)(uri instanceof uri_1.URI);
        const model = accessor.get(model_1.$yA).getModel(uri);
        if (!model) {
            return undefined;
        }
        const { documentSemanticTokensProvider } = accessor.get(languageFeatures_1.$hF);
        const providers = _getDocumentSemanticTokensProviderHighestGroup(documentSemanticTokensProvider, model);
        if (!providers) {
            // there is no provider => fall back to a document range semantic tokens provider
            return accessor.get(commands_1.$Fr).executeCommand('_provideDocumentRangeSemanticTokensLegend', uri);
        }
        return providers[0].getLegend();
    });
    commands_1.$Gr.registerCommand('_provideDocumentSemanticTokens', async (accessor, ...args) => {
        const [uri] = args;
        (0, types_1.$tf)(uri instanceof uri_1.URI);
        const model = accessor.get(model_1.$yA).getModel(uri);
        if (!model) {
            return undefined;
        }
        const { documentSemanticTokensProvider } = accessor.get(languageFeatures_1.$hF);
        if (!$A0(documentSemanticTokensProvider, model)) {
            // there is no provider => fall back to a document range semantic tokens provider
            return accessor.get(commands_1.$Fr).executeCommand('_provideDocumentRangeSemanticTokens', uri, model.getFullModelRange());
        }
        const r = await $B0(documentSemanticTokensProvider, model, null, null, cancellation_1.CancellationToken.None);
        if (!r) {
            return undefined;
        }
        const { provider, tokens } = r;
        if (!tokens || !$x0(tokens)) {
            return undefined;
        }
        const buff = (0, semanticTokensDto_1.$v0)({
            id: 0,
            type: 'full',
            data: tokens.data
        });
        if (tokens.resultId) {
            provider.releaseDocumentSemanticTokens(tokens.resultId);
        }
        return buff;
    });
    commands_1.$Gr.registerCommand('_provideDocumentRangeSemanticTokensLegend', async (accessor, ...args) => {
        const [uri, range] = args;
        (0, types_1.$tf)(uri instanceof uri_1.URI);
        const model = accessor.get(model_1.$yA).getModel(uri);
        if (!model) {
            return undefined;
        }
        const { documentRangeSemanticTokensProvider } = accessor.get(languageFeatures_1.$hF);
        const providers = getDocumentRangeSemanticTokensProviders(documentRangeSemanticTokensProvider, model);
        if (providers.length === 0) {
            // no providers
            return undefined;
        }
        if (providers.length === 1) {
            // straight forward case, just a single provider
            return providers[0].getLegend();
        }
        if (!range || !range_1.$ks.isIRange(range)) {
            // if no range is provided, we cannot support multiple providers
            // as we cannot fall back to the one which would give results
            // => return the first legend for backwards compatibility and print a warning
            console.warn(`provideDocumentRangeSemanticTokensLegend might be out-of-sync with provideDocumentRangeSemanticTokens unless a range argument is passed in`);
            return providers[0].getLegend();
        }
        const result = await $D0(documentRangeSemanticTokensProvider, model, range_1.$ks.lift(range), cancellation_1.CancellationToken.None);
        if (!result) {
            return undefined;
        }
        return result.provider.getLegend();
    });
    commands_1.$Gr.registerCommand('_provideDocumentRangeSemanticTokens', async (accessor, ...args) => {
        const [uri, range] = args;
        (0, types_1.$tf)(uri instanceof uri_1.URI);
        (0, types_1.$tf)(range_1.$ks.isIRange(range));
        const model = accessor.get(model_1.$yA).getModel(uri);
        if (!model) {
            return undefined;
        }
        const { documentRangeSemanticTokensProvider } = accessor.get(languageFeatures_1.$hF);
        const result = await $D0(documentRangeSemanticTokensProvider, model, range_1.$ks.lift(range), cancellation_1.CancellationToken.None);
        if (!result || !result.tokens) {
            // there is no provider or it didn't return tokens
            return undefined;
        }
        return (0, semanticTokensDto_1.$v0)({
            id: 0,
            type: 'full',
            data: result.tokens.data
        });
    });
});
//# sourceMappingURL=getSemanticTokens.js.map