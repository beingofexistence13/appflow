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
define(["require", "exports", "vs/base/common/async", "vs/base/common/lifecycle", "vs/editor/browser/editorExtensions", "vs/editor/contrib/semanticTokens/common/getSemanticTokens", "vs/editor/contrib/semanticTokens/common/semanticTokensConfig", "vs/editor/common/services/semanticTokensProviderStyling", "vs/platform/configuration/common/configuration", "vs/platform/theme/common/themeService", "vs/editor/common/services/languageFeatureDebounce", "vs/base/common/stopwatch", "vs/editor/common/services/languageFeatures", "vs/editor/common/services/semanticTokensStyling"], function (require, exports, async_1, lifecycle_1, editorExtensions_1, getSemanticTokens_1, semanticTokensConfig_1, semanticTokensProviderStyling_1, configuration_1, themeService_1, languageFeatureDebounce_1, stopwatch_1, languageFeatures_1, semanticTokensStyling_1) {
    "use strict";
    var $I0_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$I0 = void 0;
    let $I0 = class $I0 extends lifecycle_1.$kc {
        static { $I0_1 = this; }
        static { this.ID = 'editor.contrib.viewportSemanticTokens'; }
        static get(editor) {
            return editor.getContribution($I0_1.ID);
        }
        constructor(editor, h, j, m, languageFeatureDebounceService, languageFeaturesService) {
            super();
            this.h = h;
            this.j = j;
            this.m = m;
            this.a = editor;
            this.b = languageFeaturesService.documentRangeSemanticTokensProvider;
            this.c = languageFeatureDebounceService.for(this.b, 'DocumentRangeSemanticTokens', { min: 100, max: 500 });
            this.f = this.B(new async_1.$Sg(() => this.t(), 100));
            this.g = [];
            const scheduleTokenizeViewport = () => {
                if (this.a.hasModel()) {
                    this.f.schedule(this.c.get(this.a.getModel()));
                }
            };
            this.B(this.a.onDidScrollChange(() => {
                scheduleTokenizeViewport();
            }));
            this.B(this.a.onDidChangeModel(() => {
                this.n();
                scheduleTokenizeViewport();
            }));
            this.B(this.a.onDidChangeModelContent((e) => {
                this.n();
                scheduleTokenizeViewport();
            }));
            this.B(this.b.onDidChange(() => {
                this.n();
                scheduleTokenizeViewport();
            }));
            this.B(this.m.onDidChangeConfiguration(e => {
                if (e.affectsConfiguration(semanticTokensConfig_1.$F0)) {
                    this.n();
                    scheduleTokenizeViewport();
                }
            }));
            this.B(this.j.onDidColorThemeChange(() => {
                this.n();
                scheduleTokenizeViewport();
            }));
            scheduleTokenizeViewport();
        }
        n() {
            for (const request of this.g) {
                request.cancel();
            }
            this.g = [];
        }
        s(req) {
            for (let i = 0, len = this.g.length; i < len; i++) {
                if (this.g[i] === req) {
                    this.g.splice(i, 1);
                    return;
                }
            }
        }
        t() {
            if (!this.a.hasModel()) {
                return;
            }
            const model = this.a.getModel();
            if (model.tokenization.hasCompleteSemanticTokens()) {
                return;
            }
            if (!(0, semanticTokensConfig_1.$G0)(model, this.j, this.m)) {
                if (model.tokenization.hasSomeSemanticTokens()) {
                    model.tokenization.setSemanticTokens(null, false);
                }
                return;
            }
            if (!(0, getSemanticTokens_1.$C0)(this.b, model)) {
                if (model.tokenization.hasSomeSemanticTokens()) {
                    model.tokenization.setSemanticTokens(null, false);
                }
                return;
            }
            const visibleRanges = this.a.getVisibleRangesPlusViewportAboveBelow();
            this.g = this.g.concat(visibleRanges.map(range => this.u(model, range)));
        }
        u(model, range) {
            const requestVersionId = model.getVersionId();
            const request = (0, async_1.$ug)(token => Promise.resolve((0, getSemanticTokens_1.$D0)(this.b, model, range, token)));
            const sw = new stopwatch_1.$bd(false);
            request.then((r) => {
                this.c.update(model, sw.elapsed());
                if (!r || !r.tokens || model.isDisposed() || model.getVersionId() !== requestVersionId) {
                    return;
                }
                const { provider, tokens: result } = r;
                const styling = this.h.getStyling(provider);
                model.tokenization.setPartialSemanticTokens(range, (0, semanticTokensProviderStyling_1.$u0)(result, styling, model.getLanguageId()));
            }).then(() => this.s(request), () => this.s(request));
            return request;
        }
    };
    exports.$I0 = $I0;
    exports.$I0 = $I0 = $I0_1 = __decorate([
        __param(1, semanticTokensStyling_1.$E0),
        __param(2, themeService_1.$gv),
        __param(3, configuration_1.$8h),
        __param(4, languageFeatureDebounce_1.$52),
        __param(5, languageFeatures_1.$hF)
    ], $I0);
    (0, editorExtensions_1.$AV)($I0.ID, $I0, 1 /* EditorContributionInstantiation.AfterFirstRender */);
});
//# sourceMappingURL=viewportSemanticTokens.js.map