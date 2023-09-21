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
    exports.$H0 = void 0;
    let $H0 = class $H0 extends lifecycle_1.$kc {
        constructor(semanticTokensStylingService, modelService, themeService, configurationService, languageFeatureDebounceService, languageFeaturesService) {
            super();
            this.a = Object.create(null);
            const register = (model) => {
                this.a[model.uri.toString()] = new ModelSemanticColoring(model, semanticTokensStylingService, themeService, languageFeatureDebounceService, languageFeaturesService);
            };
            const deregister = (model, modelSemanticColoring) => {
                modelSemanticColoring.dispose();
                delete this.a[model.uri.toString()];
            };
            const handleSettingOrThemeChange = () => {
                for (const model of modelService.getModels()) {
                    const curr = this.a[model.uri.toString()];
                    if ((0, semanticTokensConfig_1.$G0)(model, themeService, configurationService)) {
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
            this.B(modelService.onModelAdded((model) => {
                if ((0, semanticTokensConfig_1.$G0)(model, themeService, configurationService)) {
                    register(model);
                }
            }));
            this.B(modelService.onModelRemoved((model) => {
                const curr = this.a[model.uri.toString()];
                if (curr) {
                    deregister(model, curr);
                }
            }));
            this.B(configurationService.onDidChangeConfiguration(e => {
                if (e.affectsConfiguration(semanticTokensConfig_1.$F0)) {
                    handleSettingOrThemeChange();
                }
            }));
            this.B(themeService.onDidColorThemeChange(handleSettingOrThemeChange));
        }
        dispose() {
            // Dispose all watchers
            for (const watcher of Object.values(this.a)) {
                watcher.dispose();
            }
            super.dispose();
        }
    };
    exports.$H0 = $H0;
    exports.$H0 = $H0 = __decorate([
        __param(0, semanticTokensStyling_1.$E0),
        __param(1, model_1.$yA),
        __param(2, themeService_1.$gv),
        __param(3, configuration_1.$8h),
        __param(4, languageFeatureDebounce_1.$52),
        __param(5, languageFeatures_1.$hF)
    ], $H0);
    let ModelSemanticColoring = class ModelSemanticColoring extends lifecycle_1.$kc {
        static { ModelSemanticColoring_1 = this; }
        static { this.REQUEST_MIN_DELAY = 300; }
        static { this.REQUEST_MAX_DELAY = 2000; }
        constructor(model, r, themeService, languageFeatureDebounceService, languageFeaturesService) {
            super();
            this.r = r;
            this.a = false;
            this.b = model;
            this.c = languageFeaturesService.documentSemanticTokensProvider;
            this.f = languageFeatureDebounceService.for(this.c, 'DocumentSemanticTokens', { min: ModelSemanticColoring_1.REQUEST_MIN_DELAY, max: ModelSemanticColoring_1.REQUEST_MAX_DELAY });
            this.g = this.B(new async_1.$Sg(() => this.s(), ModelSemanticColoring_1.REQUEST_MIN_DELAY));
            this.h = null;
            this.j = null;
            this.m = [];
            this.n = false;
            this.B(this.b.onDidChangeContent(() => {
                if (!this.g.isScheduled()) {
                    this.g.schedule(this.f.get(this.b));
                }
            }));
            this.B(this.b.onDidChangeAttached(() => {
                if (!this.g.isScheduled()) {
                    this.g.schedule(this.f.get(this.b));
                }
            }));
            this.B(this.b.onDidChangeLanguage(() => {
                // clear any outstanding state
                if (this.h) {
                    this.h.dispose();
                    this.h = null;
                }
                if (this.j) {
                    this.j.cancel();
                    this.j = null;
                }
                this.u(null, null, null, []);
                this.g.schedule(0);
            }));
            const bindDocumentChangeListeners = () => {
                (0, lifecycle_1.$fc)(this.m);
                this.m = [];
                for (const provider of this.c.all(model)) {
                    if (typeof provider.onDidChange === 'function') {
                        this.m.push(provider.onDidChange(() => {
                            if (this.j) {
                                // there is already a request running,
                                this.n = true;
                                return;
                            }
                            this.g.schedule(0);
                        }));
                    }
                }
            };
            bindDocumentChangeListeners();
            this.B(this.c.onDidChange(() => {
                bindDocumentChangeListeners();
                this.g.schedule(this.f.get(this.b));
            }));
            this.B(themeService.onDidColorThemeChange(_ => {
                // clear out existing tokens
                this.u(null, null, null, []);
                this.g.schedule(this.f.get(this.b));
            }));
            this.g.schedule(0);
        }
        dispose() {
            if (this.h) {
                this.h.dispose();
                this.h = null;
            }
            if (this.j) {
                this.j.cancel();
                this.j = null;
            }
            (0, lifecycle_1.$fc)(this.m);
            this.m = [];
            this.u(null, null, null, []);
            this.a = true;
            super.dispose();
        }
        s() {
            if (this.j) {
                // there is already a request running, let it finish...
                return;
            }
            if (!(0, getSemanticTokens_1.$A0)(this.c, this.b)) {
                // there is no provider
                if (this.h) {
                    // there are semantic tokens set
                    this.b.tokenization.setSemanticTokens(null, false);
                }
                return;
            }
            if (!this.b.isAttachedToEditor()) {
                // this document is not visible, there is no need to fetch semantic tokens for it
                return;
            }
            const cancellationTokenSource = new cancellation_1.$pd();
            const lastProvider = this.h ? this.h.provider : null;
            const lastResultId = this.h ? this.h.resultId || null : null;
            const request = (0, getSemanticTokens_1.$B0)(this.c, this.b, lastProvider, lastResultId, cancellationTokenSource.token);
            this.j = cancellationTokenSource;
            this.n = false;
            const pendingChanges = [];
            const contentChangeListener = this.b.onDidChangeContent((e) => {
                pendingChanges.push(e);
            });
            const sw = new stopwatch_1.$bd(false);
            request.then((res) => {
                this.f.update(this.b, sw.elapsed());
                this.j = null;
                contentChangeListener.dispose();
                if (!res) {
                    this.u(null, null, null, pendingChanges);
                }
                else {
                    const { provider, tokens } = res;
                    const styling = this.r.getStyling(provider);
                    this.u(provider, tokens || null, styling, pendingChanges);
                }
            }, (err) => {
                const isExpectedError = err && (errors.$2(err) || (typeof err.message === 'string' && err.message.indexOf('busy') !== -1));
                if (!isExpectedError) {
                    errors.$Y(err);
                }
                // Semantic tokens eats up all errors and considers errors to mean that the result is temporarily not available
                // The API does not have a special error kind to express this...
                this.j = null;
                contentChangeListener.dispose();
                if (pendingChanges.length > 0 || this.n) {
                    // More changes occurred while the request was running
                    if (!this.g.isScheduled()) {
                        this.g.schedule(this.f.get(this.b));
                    }
                }
            });
        }
        static t(src, srcOffset, dest, destOffset, length) {
            // protect against overflows
            length = Math.min(length, dest.length - destOffset, src.length - srcOffset);
            for (let i = 0; i < length; i++) {
                dest[destOffset + i] = src[srcOffset + i];
            }
        }
        u(provider, tokens, styling, pendingChanges) {
            const currentResponse = this.h;
            const rescheduleIfNeeded = () => {
                if ((pendingChanges.length > 0 || this.n) && !this.g.isScheduled()) {
                    this.g.schedule(this.f.get(this.b));
                }
            };
            if (this.h) {
                this.h.dispose();
                this.h = null;
            }
            if (this.a) {
                // disposed!
                if (provider && tokens) {
                    provider.releaseDocumentSemanticTokens(tokens.resultId);
                }
                return;
            }
            if (!provider || !styling) {
                this.b.tokenization.setSemanticTokens(null, false);
                return;
            }
            if (!tokens) {
                this.b.tokenization.setSemanticTokens(null, true);
                rescheduleIfNeeded();
                return;
            }
            if ((0, getSemanticTokens_1.$y0)(tokens)) {
                if (!currentResponse) {
                    // not possible!
                    this.b.tokenization.setSemanticTokens(null, true);
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
                            this.b.tokenization.setSemanticTokens(null, true);
                            return;
                        }
                        const copyCount = srcLastStart - (edit.start + edit.deleteCount);
                        if (copyCount > 0) {
                            ModelSemanticColoring_1.t(srcData, srcLastStart - copyCount, destData, destLastStart - copyCount, copyCount);
                            destLastStart -= copyCount;
                        }
                        if (edit.data) {
                            ModelSemanticColoring_1.t(edit.data, 0, destData, destLastStart - edit.data.length, edit.data.length);
                            destLastStart -= edit.data.length;
                        }
                        srcLastStart = edit.start;
                    }
                    if (srcLastStart > 0) {
                        ModelSemanticColoring_1.t(srcData, 0, destData, 0, srcLastStart);
                    }
                    tokens = {
                        resultId: tokens.resultId,
                        data: destData
                    };
                }
            }
            if ((0, getSemanticTokens_1.$x0)(tokens)) {
                this.h = new SemanticTokensResponse(provider, tokens.resultId, tokens.data);
                const result = (0, semanticTokensProviderStyling_1.$u0)(tokens, styling, this.b.getLanguageId());
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
                this.b.tokenization.setSemanticTokens(result, true);
            }
            else {
                this.b.tokenization.setSemanticTokens(null, true);
            }
            rescheduleIfNeeded();
        }
    };
    ModelSemanticColoring = ModelSemanticColoring_1 = __decorate([
        __param(1, semanticTokensStyling_1.$E0),
        __param(2, themeService_1.$gv),
        __param(3, languageFeatureDebounce_1.$52),
        __param(4, languageFeatures_1.$hF)
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
    (0, editorFeatures_1.$$2)($H0);
});
//# sourceMappingURL=documentSemanticTokens.js.map