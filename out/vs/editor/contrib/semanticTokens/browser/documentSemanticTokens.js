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
define(["require", "exports", "vs/base/common/lifecycle", "vs/base/common/errors", "vs/editor/common/services/model", "vs/platform/configuration/common/configuration", "vs/base/common/async", "vs/base/common/cancellation", "vs/platform/theme/common/themeService", "vs/editor/common/services/semanticTokensProviderStyling", "vs/editor/contrib/semanticTokens/common/getSemanticTokens", "vs/editor/common/services/languageFeatureDebounce", "vs/base/common/stopwatch", "vs/editor/common/services/languageFeatures", "vs/editor/common/services/semanticTokensStyling", "vs/editor/common/editorFeatures", "vs/editor/contrib/semanticTokens/common/semanticTokensConfig"], function (require, exports, lifecycle_1, errors, model_1, configuration_1, async_1, cancellation_1, themeService_1, semanticTokensProviderStyling_1, getSemanticTokens_1, languageFeatureDebounce_1, stopwatch_1, languageFeatures_1, semanticTokensStyling_1, editorFeatures_1, semanticTokensConfig_1) {
    "use strict";
    var ModelSemanticColoring_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.DocumentSemanticTokensFeature = void 0;
    let DocumentSemanticTokensFeature = class DocumentSemanticTokensFeature extends lifecycle_1.Disposable {
        constructor(semanticTokensStylingService, modelService, themeService, configurationService, languageFeatureDebounceService, languageFeaturesService) {
            super();
            this._watchers = Object.create(null);
            const register = (model) => {
                this._watchers[model.uri.toString()] = new ModelSemanticColoring(model, semanticTokensStylingService, themeService, languageFeatureDebounceService, languageFeaturesService);
            };
            const deregister = (model, modelSemanticColoring) => {
                modelSemanticColoring.dispose();
                delete this._watchers[model.uri.toString()];
            };
            const handleSettingOrThemeChange = () => {
                for (const model of modelService.getModels()) {
                    const curr = this._watchers[model.uri.toString()];
                    if ((0, semanticTokensConfig_1.isSemanticColoringEnabled)(model, themeService, configurationService)) {
                        if (!curr) {
                            register(model);
                        }
                    }
                    else {
                        if (curr) {
                            deregister(model, curr);
                        }
                    }
                }
            };
            this._register(modelService.onModelAdded((model) => {
                if ((0, semanticTokensConfig_1.isSemanticColoringEnabled)(model, themeService, configurationService)) {
                    register(model);
                }
            }));
            this._register(modelService.onModelRemoved((model) => {
                const curr = this._watchers[model.uri.toString()];
                if (curr) {
                    deregister(model, curr);
                }
            }));
            this._register(configurationService.onDidChangeConfiguration(e => {
                if (e.affectsConfiguration(semanticTokensConfig_1.SEMANTIC_HIGHLIGHTING_SETTING_ID)) {
                    handleSettingOrThemeChange();
                }
            }));
            this._register(themeService.onDidColorThemeChange(handleSettingOrThemeChange));
        }
        dispose() {
            // Dispose all watchers
            for (const watcher of Object.values(this._watchers)) {
                watcher.dispose();
            }
            super.dispose();
        }
    };
    exports.DocumentSemanticTokensFeature = DocumentSemanticTokensFeature;
    exports.DocumentSemanticTokensFeature = DocumentSemanticTokensFeature = __decorate([
        __param(0, semanticTokensStyling_1.ISemanticTokensStylingService),
        __param(1, model_1.IModelService),
        __param(2, themeService_1.IThemeService),
        __param(3, configuration_1.IConfigurationService),
        __param(4, languageFeatureDebounce_1.ILanguageFeatureDebounceService),
        __param(5, languageFeatures_1.ILanguageFeaturesService)
    ], DocumentSemanticTokensFeature);
    let ModelSemanticColoring = class ModelSemanticColoring extends lifecycle_1.Disposable {
        static { ModelSemanticColoring_1 = this; }
        static { this.REQUEST_MIN_DELAY = 300; }
        static { this.REQUEST_MAX_DELAY = 2000; }
        constructor(model, _semanticTokensStylingService, themeService, languageFeatureDebounceService, languageFeaturesService) {
            super();
            this._semanticTokensStylingService = _semanticTokensStylingService;
            this._isDisposed = false;
            this._model = model;
            this._provider = languageFeaturesService.documentSemanticTokensProvider;
            this._debounceInformation = languageFeatureDebounceService.for(this._provider, 'DocumentSemanticTokens', { min: ModelSemanticColoring_1.REQUEST_MIN_DELAY, max: ModelSemanticColoring_1.REQUEST_MAX_DELAY });
            this._fetchDocumentSemanticTokens = this._register(new async_1.RunOnceScheduler(() => this._fetchDocumentSemanticTokensNow(), ModelSemanticColoring_1.REQUEST_MIN_DELAY));
            this._currentDocumentResponse = null;
            this._currentDocumentRequestCancellationTokenSource = null;
            this._documentProvidersChangeListeners = [];
            this._providersChangedDuringRequest = false;
            this._register(this._model.onDidChangeContent(() => {
                if (!this._fetchDocumentSemanticTokens.isScheduled()) {
                    this._fetchDocumentSemanticTokens.schedule(this._debounceInformation.get(this._model));
                }
            }));
            this._register(this._model.onDidChangeAttached(() => {
                if (!this._fetchDocumentSemanticTokens.isScheduled()) {
                    this._fetchDocumentSemanticTokens.schedule(this._debounceInformation.get(this._model));
                }
            }));
            this._register(this._model.onDidChangeLanguage(() => {
                // clear any outstanding state
                if (this._currentDocumentResponse) {
                    this._currentDocumentResponse.dispose();
                    this._currentDocumentResponse = null;
                }
                if (this._currentDocumentRequestCancellationTokenSource) {
                    this._currentDocumentRequestCancellationTokenSource.cancel();
                    this._currentDocumentRequestCancellationTokenSource = null;
                }
                this._setDocumentSemanticTokens(null, null, null, []);
                this._fetchDocumentSemanticTokens.schedule(0);
            }));
            const bindDocumentChangeListeners = () => {
                (0, lifecycle_1.dispose)(this._documentProvidersChangeListeners);
                this._documentProvidersChangeListeners = [];
                for (const provider of this._provider.all(model)) {
                    if (typeof provider.onDidChange === 'function') {
                        this._documentProvidersChangeListeners.push(provider.onDidChange(() => {
                            if (this._currentDocumentRequestCancellationTokenSource) {
                                // there is already a request running,
                                this._providersChangedDuringRequest = true;
                                return;
                            }
                            this._fetchDocumentSemanticTokens.schedule(0);
                        }));
                    }
                }
            };
            bindDocumentChangeListeners();
            this._register(this._provider.onDidChange(() => {
                bindDocumentChangeListeners();
                this._fetchDocumentSemanticTokens.schedule(this._debounceInformation.get(this._model));
            }));
            this._register(themeService.onDidColorThemeChange(_ => {
                // clear out existing tokens
                this._setDocumentSemanticTokens(null, null, null, []);
                this._fetchDocumentSemanticTokens.schedule(this._debounceInformation.get(this._model));
            }));
            this._fetchDocumentSemanticTokens.schedule(0);
        }
        dispose() {
            if (this._currentDocumentResponse) {
                this._currentDocumentResponse.dispose();
                this._currentDocumentResponse = null;
            }
            if (this._currentDocumentRequestCancellationTokenSource) {
                this._currentDocumentRequestCancellationTokenSource.cancel();
                this._currentDocumentRequestCancellationTokenSource = null;
            }
            (0, lifecycle_1.dispose)(this._documentProvidersChangeListeners);
            this._documentProvidersChangeListeners = [];
            this._setDocumentSemanticTokens(null, null, null, []);
            this._isDisposed = true;
            super.dispose();
        }
        _fetchDocumentSemanticTokensNow() {
            if (this._currentDocumentRequestCancellationTokenSource) {
                // there is already a request running, let it finish...
                return;
            }
            if (!(0, getSemanticTokens_1.hasDocumentSemanticTokensProvider)(this._provider, this._model)) {
                // there is no provider
                if (this._currentDocumentResponse) {
                    // there are semantic tokens set
                    this._model.tokenization.setSemanticTokens(null, false);
                }
                return;
            }
            if (!this._model.isAttachedToEditor()) {
                // this document is not visible, there is no need to fetch semantic tokens for it
                return;
            }
            const cancellationTokenSource = new cancellation_1.CancellationTokenSource();
            const lastProvider = this._currentDocumentResponse ? this._currentDocumentResponse.provider : null;
            const lastResultId = this._currentDocumentResponse ? this._currentDocumentResponse.resultId || null : null;
            const request = (0, getSemanticTokens_1.getDocumentSemanticTokens)(this._provider, this._model, lastProvider, lastResultId, cancellationTokenSource.token);
            this._currentDocumentRequestCancellationTokenSource = cancellationTokenSource;
            this._providersChangedDuringRequest = false;
            const pendingChanges = [];
            const contentChangeListener = this._model.onDidChangeContent((e) => {
                pendingChanges.push(e);
            });
            const sw = new stopwatch_1.StopWatch(false);
            request.then((res) => {
                this._debounceInformation.update(this._model, sw.elapsed());
                this._currentDocumentRequestCancellationTokenSource = null;
                contentChangeListener.dispose();
                if (!res) {
                    this._setDocumentSemanticTokens(null, null, null, pendingChanges);
                }
                else {
                    const { provider, tokens } = res;
                    const styling = this._semanticTokensStylingService.getStyling(provider);
                    this._setDocumentSemanticTokens(provider, tokens || null, styling, pendingChanges);
                }
            }, (err) => {
                const isExpectedError = err && (errors.isCancellationError(err) || (typeof err.message === 'string' && err.message.indexOf('busy') !== -1));
                if (!isExpectedError) {
                    errors.onUnexpectedError(err);
                }
                // Semantic tokens eats up all errors and considers errors to mean that the result is temporarily not available
                // The API does not have a special error kind to express this...
                this._currentDocumentRequestCancellationTokenSource = null;
                contentChangeListener.dispose();
                if (pendingChanges.length > 0 || this._providersChangedDuringRequest) {
                    // More changes occurred while the request was running
                    if (!this._fetchDocumentSemanticTokens.isScheduled()) {
                        this._fetchDocumentSemanticTokens.schedule(this._debounceInformation.get(this._model));
                    }
                }
            });
        }
        static _copy(src, srcOffset, dest, destOffset, length) {
            // protect against overflows
            length = Math.min(length, dest.length - destOffset, src.length - srcOffset);
            for (let i = 0; i < length; i++) {
                dest[destOffset + i] = src[srcOffset + i];
            }
        }
        _setDocumentSemanticTokens(provider, tokens, styling, pendingChanges) {
            const currentResponse = this._currentDocumentResponse;
            const rescheduleIfNeeded = () => {
                if ((pendingChanges.length > 0 || this._providersChangedDuringRequest) && !this._fetchDocumentSemanticTokens.isScheduled()) {
                    this._fetchDocumentSemanticTokens.schedule(this._debounceInformation.get(this._model));
                }
            };
            if (this._currentDocumentResponse) {
                this._currentDocumentResponse.dispose();
                this._currentDocumentResponse = null;
            }
            if (this._isDisposed) {
                // disposed!
                if (provider && tokens) {
                    provider.releaseDocumentSemanticTokens(tokens.resultId);
                }
                return;
            }
            if (!provider || !styling) {
                this._model.tokenization.setSemanticTokens(null, false);
                return;
            }
            if (!tokens) {
                this._model.tokenization.setSemanticTokens(null, true);
                rescheduleIfNeeded();
                return;
            }
            if ((0, getSemanticTokens_1.isSemanticTokensEdits)(tokens)) {
                if (!currentResponse) {
                    // not possible!
                    this._model.tokenization.setSemanticTokens(null, true);
                    return;
                }
                if (tokens.edits.length === 0) {
                    // nothing to do!
                    tokens = {
                        resultId: tokens.resultId,
                        data: currentResponse.data
                    };
                }
                else {
                    let deltaLength = 0;
                    for (const edit of tokens.edits) {
                        deltaLength += (edit.data ? edit.data.length : 0) - edit.deleteCount;
                    }
                    const srcData = currentResponse.data;
                    const destData = new Uint32Array(srcData.length + deltaLength);
                    let srcLastStart = srcData.length;
                    let destLastStart = destData.length;
                    for (let i = tokens.edits.length - 1; i >= 0; i--) {
                        const edit = tokens.edits[i];
                        if (edit.start > srcData.length) {
                            styling.warnInvalidEditStart(currentResponse.resultId, tokens.resultId, i, edit.start, srcData.length);
                            // The edits are invalid and there's no way to recover
                            this._model.tokenization.setSemanticTokens(null, true);
                            return;
                        }
                        const copyCount = srcLastStart - (edit.start + edit.deleteCount);
                        if (copyCount > 0) {
                            ModelSemanticColoring_1._copy(srcData, srcLastStart - copyCount, destData, destLastStart - copyCount, copyCount);
                            destLastStart -= copyCount;
                        }
                        if (edit.data) {
                            ModelSemanticColoring_1._copy(edit.data, 0, destData, destLastStart - edit.data.length, edit.data.length);
                            destLastStart -= edit.data.length;
                        }
                        srcLastStart = edit.start;
                    }
                    if (srcLastStart > 0) {
                        ModelSemanticColoring_1._copy(srcData, 0, destData, 0, srcLastStart);
                    }
                    tokens = {
                        resultId: tokens.resultId,
                        data: destData
                    };
                }
            }
            if ((0, getSemanticTokens_1.isSemanticTokens)(tokens)) {
                this._currentDocumentResponse = new SemanticTokensResponse(provider, tokens.resultId, tokens.data);
                const result = (0, semanticTokensProviderStyling_1.toMultilineTokens2)(tokens, styling, this._model.getLanguageId());
                // Adjust incoming semantic tokens
                if (pendingChanges.length > 0) {
                    // More changes occurred while the request was running
                    // We need to:
                    // 1. Adjust incoming semantic tokens
                    // 2. Request them again
                    for (const change of pendingChanges) {
                        for (const area of result) {
                            for (const singleChange of change.changes) {
                                area.applyEdit(singleChange.range, singleChange.text);
                            }
                        }
                    }
                }
                this._model.tokenization.setSemanticTokens(result, true);
            }
            else {
                this._model.tokenization.setSemanticTokens(null, true);
            }
            rescheduleIfNeeded();
        }
    };
    ModelSemanticColoring = ModelSemanticColoring_1 = __decorate([
        __param(1, semanticTokensStyling_1.ISemanticTokensStylingService),
        __param(2, themeService_1.IThemeService),
        __param(3, languageFeatureDebounce_1.ILanguageFeatureDebounceService),
        __param(4, languageFeatures_1.ILanguageFeaturesService)
    ], ModelSemanticColoring);
    class SemanticTokensResponse {
        constructor(provider, resultId, data) {
            this.provider = provider;
            this.resultId = resultId;
            this.data = data;
        }
        dispose() {
            this.provider.releaseDocumentSemanticTokens(this.resultId);
        }
    }
    (0, editorFeatures_1.registerEditorFeature)(DocumentSemanticTokensFeature);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZG9jdW1lbnRTZW1hbnRpY1Rva2Vucy5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL2VkaXRvci9jb250cmliL3NlbWFudGljVG9rZW5zL2Jyb3dzZXIvZG9jdW1lbnRTZW1hbnRpY1Rva2Vucy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7O0lBc0J6RixJQUFNLDZCQUE2QixHQUFuQyxNQUFNLDZCQUE4QixTQUFRLHNCQUFVO1FBSTVELFlBQ2dDLDRCQUEyRCxFQUMzRSxZQUEyQixFQUMzQixZQUEyQixFQUNuQixvQkFBMkMsRUFDakMsOEJBQStELEVBQ3RFLHVCQUFpRDtZQUUzRSxLQUFLLEVBQUUsQ0FBQztZQUNSLElBQUksQ0FBQyxTQUFTLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUVyQyxNQUFNLFFBQVEsR0FBRyxDQUFDLEtBQWlCLEVBQUUsRUFBRTtnQkFDdEMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRSxDQUFDLEdBQUcsSUFBSSxxQkFBcUIsQ0FBQyxLQUFLLEVBQUUsNEJBQTRCLEVBQUUsWUFBWSxFQUFFLDhCQUE4QixFQUFFLHVCQUF1QixDQUFDLENBQUM7WUFDOUssQ0FBQyxDQUFDO1lBQ0YsTUFBTSxVQUFVLEdBQUcsQ0FBQyxLQUFpQixFQUFFLHFCQUE0QyxFQUFFLEVBQUU7Z0JBQ3RGLHFCQUFxQixDQUFDLE9BQU8sRUFBRSxDQUFDO2dCQUNoQyxPQUFPLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDO1lBQzdDLENBQUMsQ0FBQztZQUNGLE1BQU0sMEJBQTBCLEdBQUcsR0FBRyxFQUFFO2dCQUN2QyxLQUFLLE1BQU0sS0FBSyxJQUFJLFlBQVksQ0FBQyxTQUFTLEVBQUUsRUFBRTtv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