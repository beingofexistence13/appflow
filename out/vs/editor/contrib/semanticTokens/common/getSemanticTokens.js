/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/cancellation", "vs/base/common/errors", "vs/base/common/uri", "vs/editor/common/services/model", "vs/platform/commands/common/commands", "vs/base/common/types", "vs/editor/common/services/semanticTokensDto", "vs/editor/common/core/range", "vs/editor/common/services/languageFeatures"], function (require, exports, cancellation_1, errors_1, uri_1, model_1, commands_1, types_1, semanticTokensDto_1, range_1, languageFeatures_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getDocumentRangeSemanticTokens = exports.hasDocumentRangeSemanticTokensProvider = exports.getDocumentSemanticTokens = exports.hasDocumentSemanticTokensProvider = exports.DocumentSemanticTokensResult = exports.isSemanticTokensEdits = exports.isSemanticTokens = void 0;
    function isSemanticTokens(v) {
        return v && !!(v.data);
    }
    exports.isSemanticTokens = isSemanticTokens;
    function isSemanticTokensEdits(v) {
        return v && Array.isArray(v.edits);
    }
    exports.isSemanticTokensEdits = isSemanticTokensEdits;
    class DocumentSemanticTokensResult {
        constructor(provider, tokens, error) {
            this.provider = provider;
            this.tokens = tokens;
            this.error = error;
        }
    }
    exports.DocumentSemanticTokensResult = DocumentSemanticTokensResult;
    function hasDocumentSemanticTokensProvider(registry, model) {
        return registry.has(model);
    }
    exports.hasDocumentSemanticTokensProvider = hasDocumentSemanticTokensProvider;
    function getDocumentSemanticTokensProviders(registry, model) {
        const groups = registry.orderedGroups(model);
        return (groups.length > 0 ? groups[0] : []);
    }
    async function getDocumentSemanticTokens(registry, model, lastProvider, lastResultId, token) {
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
            if (!result || (!isSemanticTokens(result) && !isSemanticTokensEdits(result))) {
                result = null;
            }
            return new DocumentSemanticTokensResult(provider, result, error);
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
    exports.getDocumentSemanticTokens = getDocumentSemanticTokens;
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
    function hasDocumentRangeSemanticTokensProvider(providers, model) {
        return providers.has(model);
    }
    exports.hasDocumentRangeSemanticTokensProvider = hasDocumentRangeSemanticTokensProvider;
    function getDocumentRangeSemanticTokensProviders(providers, model) {
        const groups = providers.orderedGroups(model);
        return (groups.length > 0 ? groups[0] : []);
    }
    async function getDocumentRangeSemanticTokens(registry, model, range, token) {
        const providers = getDocumentRangeSemanticTokensProviders(registry, model);
        // Get tokens from all providers at the same time.
        const results = await Promise.all(providers.map(async (provider) => {
            let result;
            try {
                result = await provider.provideDocumentRangeSemanticTokens(model, range, token);
            }
            catch (err) {
                (0, errors_1.onUnexpectedExternalError)(err);
                result = null;
            }
            if (!result || !isSemanticTokens(result)) {
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
    exports.getDocumentRangeSemanticTokens = getDocumentRangeSemanticTokens;
    commands_1.CommandsRegistry.registerCommand('_provideDocumentSemanticTokensLegend', async (accessor, ...args) => {
        const [uri] = args;
        (0, types_1.assertType)(uri instanceof uri_1.URI);
        const model = accessor.get(model_1.IModelService).getModel(uri);
        if (!model) {
            return undefined;
        }
        const { documentSemanticTokensProvider } = accessor.get(languageFeatures_1.ILanguageFeaturesService);
        const providers = _getDocumentSemanticTokensProviderHighestGroup(documentSemanticTokensProvider, model);
        if (!providers) {
            // there is no provider => fall back to a document range semantic tokens provider
            return accessor.get(commands_1.ICommandService).executeCommand('_provideDocumentRangeSemanticTokensLegend', uri);
        }
        return providers[0].getLegend();
    });
    commands_1.CommandsRegistry.registerCommand('_provideDocumentSemanticTokens', async (accessor, ...args) => {
        const [uri] = args;
        (0, types_1.assertType)(uri instanceof uri_1.URI);
        const model = accessor.get(model_1.IModelService).getModel(uri);
        if (!model) {
            return undefined;
        }
        const { documentSemanticTokensProvider } = accessor.get(languageFeatures_1.ILanguageFeaturesService);
        if (!hasDocumentSemanticTokensProvider(documentSemanticTokensProvider, model)) {
            // there is no provider => fall back to a document range semantic tokens provider
            return accessor.get(commands_1.ICommandService).executeCommand('_provideDocumentRangeSemanticTokens', uri, model.getFullModelRange());
        }
        const r = await getDocumentSemanticTokens(documentSemanticTokensProvider, model, null, null, cancellation_1.CancellationToken.None);
        if (!r) {
            return undefined;
        }
        const { provider, tokens } = r;
        if (!tokens || !isSemanticTokens(tokens)) {
            return undefined;
        }
        const buff = (0, semanticTokensDto_1.encodeSemanticTokensDto)({
            id: 0,
            type: 'full',
            data: tokens.data
        });
        if (tokens.resultId) {
            provider.releaseDocumentSemanticTokens(tokens.resultId);
        }
        return buff;
    });
    commands_1.CommandsRegistry.registerCommand('_provideDocumentRangeSemanticTokensLegend', async (accessor, ...args) => {
        const [uri, range] = args;
        (0, types_1.assertType)(uri instanceof uri_1.URI);
        const model = accessor.get(model_1.IModelService).getModel(uri);
        if (!model) {
            return undefined;
        }
        const { documentRangeSemanticTokensProvider } = accessor.get(languageFeatures_1.ILanguageFeaturesService);
        const providers = getDocumentRangeSemanticTokensProviders(documentRangeSemanticTokensProvider, model);
        if (providers.length === 0) {
            // no providers
            return undefined;
        }
        if (providers.length === 1) {
            // straight forward case, just a single provider
            return providers[0].getLegend();
        }
        if (!range || !range_1.Range.isIRange(range)) {
            // if no range is provided, we cannot support multiple providers
            // as we cannot fall back to the one which would give results
            // => return the first legend for backwards compatibility and print a warning
            console.warn(`provideDocumentRangeSemanticTokensLegend might be out-of-sync with provideDocumentRangeSemanticTokens unless a range argument is passed in`);
            return providers[0].getLegend();
        }
        const result = await getDocumentRangeSemanticTokens(documentRangeSemanticTokensProvider, model, range_1.Range.lift(range), cancellation_1.CancellationToken.None);
        if (!result) {
            return undefined;
        }
        return result.provider.getLegend();
    });
    commands_1.CommandsRegistry.registerCommand('_provideDocumentRangeSemanticTokens', async (accessor, ...args) => {
        const [uri, range] = args;
        (0, types_1.assertType)(uri instanceof uri_1.URI);
        (0, types_1.assertType)(range_1.Range.isIRange(range));
        const model = accessor.get(model_1.IModelService).getModel(uri);
        if (!model) {
            return undefined;
        }
        const { documentRangeSemanticTokensProvider } = accessor.get(languageFeatures_1.ILanguageFeaturesService);
        const result = await getDocumentRangeSemanticTokens(documentRangeSemanticTokensProvider, model, range_1.Range.lift(range), cancellation_1.CancellationToken.None);
        if (!result || !result.tokens) {
            // there is no provider or it didn't return tokens
            return undefined;
        }
        return (0, semanticTokensDto_1.encodeSemanticTokensDto)({
            id: 0,
            type: 'full',
            data: result.tokens.data
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2V0U2VtYW50aWNUb2tlbnMuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9lZGl0b3IvY29udHJpYi9zZW1hbnRpY1Rva2Vucy9jb21tb24vZ2V0U2VtYW50aWNUb2tlbnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBZ0JoRyxTQUFnQixnQkFBZ0IsQ0FBQyxDQUF1QztRQUN2RSxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBa0IsQ0FBRSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQzFDLENBQUM7SUFGRCw0Q0FFQztJQUVELFNBQWdCLHFCQUFxQixDQUFDLENBQXVDO1FBQzVFLE9BQU8sQ0FBQyxJQUFJLEtBQUssQ0FBQyxPQUFPLENBQXVCLENBQUUsQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUMzRCxDQUFDO0lBRkQsc0RBRUM7SUFFRCxNQUFhLDRCQUE0QjtRQUN4QyxZQUNpQixRQUF3QyxFQUN4QyxNQUFtRCxFQUNuRCxLQUFVO1lBRlYsYUFBUSxHQUFSLFFBQVEsQ0FBZ0M7WUFDeEMsV0FBTSxHQUFOLE1BQU0sQ0FBNkM7WUFDbkQsVUFBSyxHQUFMLEtBQUssQ0FBSztRQUN2QixDQUFDO0tBQ0w7SUFORCxvRUFNQztJQUVELFNBQWdCLGlDQUFpQyxDQUFDLFFBQWlFLEVBQUUsS0FBaUI7UUFDckksT0FBTyxRQUFRLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQzVCLENBQUM7SUFGRCw4RUFFQztJQUVELFNBQVMsa0NBQWtDLENBQUMsUUFBaUUsRUFBRSxLQUFpQjtRQUMvSCxNQUFNLE1BQU0sR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQzdDLE9BQU8sQ0FBQyxNQUFNLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFF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