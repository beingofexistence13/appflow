/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/uri", "vs/workbench/services/textMate/common/TMGrammarFactory", "./textMateWorkerTokenizer"], function (require, exports, uri_1, TMGrammarFactory_1, textMateWorkerTokenizer_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TextMateTokenizationWorker = exports.create = void 0;
    /**
     * Defines the worker entry point. Must be exported and named `create`.
     */
    function create(ctx, createData) {
        return new TextMateTokenizationWorker(ctx, createData);
    }
    exports.create = create;
    class TextMateTokenizationWorker {
        constructor(ctx, _createData) {
            this._createData = _createData;
            this._models = new Map();
            this._grammarCache = [];
            this._host = ctx.host;
            const grammarDefinitions = _createData.grammarDefinitions.map((def) => {
                return {
                    location: uri_1.URI.revive(def.location),
                    language: def.language,
                    scopeName: def.scopeName,
                    embeddedLanguages: def.embeddedLanguages,
                    tokenTypes: def.tokenTypes,
                    injectTo: def.injectTo,
                    balancedBracketSelectors: def.balancedBracketSelectors,
                    unbalancedBracketSelectors: def.unbalancedBracketSelectors,
                    sourceExtensionId: def.sourceExtensionId,
                };
            });
            this._grammarFactory = this._loadTMGrammarFactory(grammarDefinitions);
        }
        async _loadTMGrammarFactory(grammarDefinitions) {
            const uri = this._createData.textmateMainUri;
            const vscodeTextmate = await new Promise((resolve_1, reject_1) => { require([uri], resolve_1, reject_1); });
            const vscodeOniguruma = await new Promise((resolve_2, reject_2) => { require([this._createData.onigurumaMainUri], resolve_2, reject_2); });
            const response = await fetch(this._createData.onigurumaWASMUri);
            // Using the response directly only works if the server sets the MIME type 'application/wasm'.
            // Otherwise, a TypeError is thrown when using the streaming compiler.
            // We therefore use the non-streaming compiler :(.
            const bytes = await response.arrayBuffer();
            await vscodeOniguruma.loadWASM(bytes);
            const onigLib = Promise.resolve({
                createOnigScanner: (sources) => vscodeOniguruma.createOnigScanner(sources),
                createOnigString: (str) => vscodeOniguruma.createOnigString(str)
            });
            return new TMGrammarFactory_1.TMGrammarFactory({
                logTrace: (msg) => { },
                logError: (msg, err) => console.error(msg, err),
                readFile: (resource) => this._host.readFile(resource)
            }, grammarDefinitions, vscodeTextmate, onigLib);
        }
        // These methods are called by the renderer
        acceptNewModel(data) {
            const uri = uri_1.URI.revive(data.uri);
            const that = this;
            this._models.set(data.controllerId, new textMateWorkerTokenizer_1.TextMateWorkerTokenizer(uri, data.lines, data.EOL, data.versionId, {
                async getOrCreateGrammar(languageId, encodedLanguageId) {
                    const grammarFactory = await that._grammarFactory;
                    if (!grammarFactory) {
                        return Promise.resolve(null);
                    }
                    if (!that._grammarCache[encodedLanguageId]) {
                        that._grammarCache[encodedLanguageId] = grammarFactory.createGrammar(languageId, encodedLanguageId);
                    }
                    return that._grammarCache[encodedLanguageId];
                },
                setTokensAndStates(versionId, tokens, stateDeltas) {
                    that._host.setTokensAndStates(data.controllerId, versionId, tokens, stateDeltas);
                },
                reportTokenizationTime(timeMs, languageId, sourceExtensionId, lineLength, isRandomSample) {
                    that._host.reportTokenizationTime(timeMs, languageId, sourceExtensionId, lineLength, isRandomSample);
                },
            }, data.languageId, data.encodedLanguageId, data.maxTokenizationLineLength));
        }
        acceptModelChanged(controllerId, e) {
            this._models.get(controllerId).onEvents(e);
        }
        retokenize(controllerId, startLineNumber, endLineNumberExclusive) {
            this._models.get(controllerId).retokenize(startLineNumber, endLineNumberExclusive);
        }
        acceptModelLanguageChanged(controllerId, newLanguageId, newEncodedLanguageId) {
            this._models.get(controllerId).onLanguageId(newLanguageId, newEncodedLanguageId);
        }
        acceptRemovedModel(controllerId) {
            const model = this._models.get(controllerId);
            if (model) {
                model.dispose();
                this._models.delete(controllerId);
            }
        }
        async acceptTheme(theme, colorMap) {
            const grammarFactory = await this._grammarFactory;
            grammarFactory?.setTheme(theme, colorMap);
        }
        acceptMaxTokenizationLineLength(controllerId, value) {
            this._models.get(controllerId).acceptMaxTokenizationLineLength(value);
        }
    }
    exports.TextMateTokenizationWorker = TextMateTokenizationWorker;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGV4dE1hdGVUb2tlbml6YXRpb25Xb3JrZXIud29ya2VyLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL3NlcnZpY2VzL3RleHRNYXRlL2Jyb3dzZXIvYmFja2dyb3VuZFRva2VuaXphdGlvbi93b3JrZXIvdGV4dE1hdGVUb2tlbml6YXRpb25Xb3JrZXIud29ya2VyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQVdoRzs7T0FFRztJQUNILFNBQWdCLE1BQU0sQ0FBQyxHQUF3QyxFQUFFLFVBQXVCO1FBQ3ZGLE9BQU8sSUFBSSwwQkFBMEIsQ0FBQyxHQUFHLEVBQUUsVUFBVSxDQUFDLENBQUM7SUFDeEQsQ0FBQztJQUZELHdCQUVDO0lBaUNELE1BQWEsMEJBQTBCO1FBTXRDLFlBQ0MsR0FBd0MsRUFDdkIsV0FBd0I7WUFBeEIsZ0JBQVcsR0FBWCxXQUFXLENBQWE7WUFOekIsWUFBTyxHQUFHLElBQUksR0FBRyxFQUFzRCxDQUFDO1lBQ3hFLGtCQUFhLEdBQW9DLEVBQUUsQ0FBQztZQU9wRSxJQUFJLENBQUMsS0FBSyxHQUFHLEdBQUcsQ0FBQyxJQUFJLENBQUM7WUFDdEIsTUFBTSxrQkFBa0IsR0FBRyxXQUFXLENBQUMsa0JBQWtCLENBQUMsR0FBRyxDQUEwQixDQUFDLEdBQUcsRUFBRSxFQUFFO2dCQUM5RixPQUFPO29CQUNOLFFBQVEsRUFBRSxTQUFHLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUM7b0JBQ2xDLFFBQVEsRUFBRSxHQUFHLENBQUMsUUFBUTtvQkFDdEIsU0FBUyxFQUFFLEdBQUcsQ0FBQyxTQUFTO29CQUN4QixpQkFBaUIsRUFBRSxHQUFHLENBQUMsaUJBQWlCO29CQUN4QyxVQUFVLEVBQUUsR0FBRyxDQUFDLFVBQVU7b0JBQzFCLFFBQVEsRUFBRSxHQUFHLENBQUMsUUFBUTtvQkFDdEIsd0JBQXdCLEVB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