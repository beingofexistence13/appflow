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
    var ViewportSemanticTokensContribution_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ViewportSemanticTokensContribution = void 0;
    let ViewportSemanticTokensContribution = class ViewportSemanticTokensContribution extends lifecycle_1.Disposable {
        static { ViewportSemanticTokensContribution_1 = this; }
        static { this.ID = 'editor.contrib.viewportSemanticTokens'; }
        static get(editor) {
            return editor.getContribution(ViewportSemanticTokensContribution_1.ID);
        }
        constructor(editor, _semanticTokensStylingService, _themeService, _configurationService, languageFeatureDebounceService, languageFeaturesService) {
            super();
            this._semanticTokensStylingService = _semanticTokensStylingService;
            this._themeService = _themeService;
            this._configurationService = _configurationService;
            this._editor = editor;
            this._provider = languageFeaturesService.documentRangeSemanticTokensProvider;
            this._debounceInformation = languageFeatureDebounceService.for(this._provider, 'DocumentRangeSemanticTokens', { min: 100, max: 500 });
            this._tokenizeViewport = this._register(new async_1.RunOnceScheduler(() => this._tokenizeViewportNow(), 100));
            this._outstandingRequests = [];
            const scheduleTokenizeViewport = () => {
                if (this._editor.hasModel()) {
                    this._tokenizeViewport.schedule(this._debounceInformation.get(this._editor.getModel()));
                }
            };
            this._register(this._editor.onDidScrollChange(() => {
                scheduleTokenizeViewport();
            }));
            this._register(this._editor.onDidChangeModel(() => {
                this._cancelAll();
                scheduleTokenizeViewport();
            }));
            this._register(this._editor.onDidChangeModelContent((e) => {
                this._cancelAll();
                scheduleTokenizeViewport();
            }));
            this._register(this._provider.onDidChange(() => {
                this._cancelAll();
                scheduleTokenizeViewport();
            }));
            this._register(this._configurationService.onDidChangeConfiguration(e => {
                if (e.affectsConfiguration(semanticTokensConfig_1.SEMANTIC_HIGHLIGHTING_SETTING_ID)) {
                    this._cancelAll();
                    scheduleTokenizeViewport();
                }
            }));
            this._register(this._themeService.onDidColorThemeChange(() => {
                this._cancelAll();
                scheduleTokenizeViewport();
            }));
            scheduleTokenizeViewport();
        }
        _cancelAll() {
            for (const request of this._outstandingRequests) {
                request.cancel();
            }
            this._outstandingRequests = [];
        }
        _removeOutstandingRequest(req) {
            for (let i = 0, len = this._outstandingRequests.length; i < len; i++) {
                if (this._outstandingRequests[i] === req) {
                    this._outstandingRequests.splice(i, 1);
                    return;
                }
            }
        }
        _tokenizeViewportNow() {
            if (!this._editor.hasModel()) {
                return;
            }
            const model = this._editor.getModel();
            if (model.tokenization.hasCompleteSemanticTokens()) {
                return;
            }
            if (!(0, semanticTokensConfig_1.isSemanticColoringEnabled)(model, this._themeService, this._configurationService)) {
                if (model.tokenization.hasSomeSemanticTokens()) {
                    model.tokenization.setSemanticTokens(null, false);
                }
                return;
            }
            if (!(0, getSemanticTokens_1.hasDocumentRangeSemanticTokensProvider)(this._provider, model)) {
                if (model.tokenization.hasSomeSemanticTokens()) {
                    model.tokenization.setSemanticTokens(null, false);
                }
                return;
            }
            const visibleRanges = this._editor.getVisibleRangesPlusViewportAboveBelow();
            this._outstandingRequests = this._outstandingRequests.concat(visibleRanges.map(range => this._requestRange(model, range)));
        }
        _requestRange(model, range) {
            const requestVersionId = model.getVersionId();
            const request = (0, async_1.createCancelablePromise)(token => Promise.resolve((0, getSemanticTokens_1.getDocumentRangeSemanticTokens)(this._provider, model, range, token)));
            const sw = new stopwatch_1.StopWatch(false);
            request.then((r) => {
                this._debounceInformation.update(model, sw.elapsed());
                if (!r || !r.tokens || model.isDisposed() || model.getVersionId() !== requestVersionId) {
                    return;
                }
                const { provider, tokens: result } = r;
                const styling = this._semanticTokensStylingService.getStyling(provider);
                model.tokenization.setPartialSemanticTokens(range, (0, semanticTokensProviderStyling_1.toMultilineTokens2)(result, styling, model.getLanguageId()));
            }).then(() => this._removeOutstandingRequest(request), () => this._removeOutstandingRequest(request));
            return request;
        }
    };
    exports.ViewportSemanticTokensContribution = ViewportSemanticTokensContribution;
    exports.ViewportSemanticTokensContribution = ViewportSemanticTokensContribution = ViewportSemanticTokensContribution_1 = __decorate([
        __param(1, semanticTokensStyling_1.ISemanticTokensStylingService),
        __param(2, themeService_1.IThemeService),
        __param(3, configuration_1.IConfigurationService),
        __param(4, languageFeatureDebounce_1.ILanguageFeatureDebounceService),
        __param(5, languageFeatures_1.ILanguageFeaturesService)
    ], ViewportSemanticTokensContribution);
    (0, editorExtensions_1.registerEditorContribution)(ViewportSemanticTokensContribution.ID, ViewportSemanticTokensContribution, 1 /* EditorContributionInstantiation.AfterFirstRender */);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmlld3BvcnRTZW1hbnRpY1Rva2Vucy5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL2VkaXRvci9jb250cmliL3NlbWFudGljVG9rZW5zL2Jyb3dzZXIvdmlld3BvcnRTZW1hbnRpY1Rva2Vucy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7O0lBcUJ6RixJQUFNLGtDQUFrQyxHQUF4QyxNQUFNLGtDQUFtQyxTQUFRLHNCQUFVOztpQkFFMUMsT0FBRSxHQUFHLHVDQUF1QyxBQUExQyxDQUEyQztRQUU3RCxNQUFNLENBQUMsR0FBRyxDQUFDLE1BQW1CO1lBQ3BDLE9BQU8sTUFBTSxDQUFDLGVBQWUsQ0FBcUMsb0NBQWtDLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDMUcsQ0FBQztRQVFELFlBQ0MsTUFBbUIsRUFDNkIsNkJBQTRELEVBQzVFLGFBQTRCLEVBQ3BCLHFCQUE0QyxFQUNuRCw4QkFBK0QsRUFDdEUsdUJBQWlEO1lBRTNFLEtBQUssRUFBRSxDQUFDO1lBTndDLGtDQUE2QixHQUE3Qiw2QkFBNkIsQ0FBK0I7WUFDNUUsa0JBQWEsR0FBYixhQUFhLENBQWU7WUFDcEIsMEJBQXFCLEdBQXJCLHFCQUFxQixDQUF1QjtZQUtwRixJQUFJLENBQUMsT0FBTyxHQUFHLE1BQU0sQ0FBQztZQUN0QixJQUFJLENBQUMsU0FBUyxHQUFHLHVCQUF1QixDQUFDLG1DQUFtQyxDQUFDO1lBQzdFLElBQUksQ0FBQyxvQkFBb0IsR0FBRyw4QkFBOEIsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSw2QkFBNkIsRUFBRSxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFDLENBQUM7WUFDdEksSUFBSSxDQUFDLGlCQUFpQixHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSx3QkFBZ0IsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsb0JBQW9CLEVBQUUsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO1lBQ3RHLElBQUksQ0FBQyxvQkFBb0IsR0FBRyxFQUFFLENBQUM7WUFDL0IsTUFBTSx3QkFBd0IsR0FBRyxHQUFHLEVBQUU7Z0JBQ3JDLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLEVBQUUsRUFBRTtvQkFDNUIsSUFBSSxDQUFDLGlCQUFpQixDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsb0JBQW9CLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQyxDQUFDO2lCQUN4RjtZQUNGLENBQUMsQ0FBQztZQUNGLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxpQkFBaUIsQ0FBQyxHQUFHLEVBQUU7Z0JBQ2xELHdCQUF3QixFQUFFLENBQUM7WUFDNUIsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNKLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxHQUFHLEVBQUU7Z0JBQ2pELElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQztnQkFDbEIsd0JBQXdCLEVBQUUsQ0FBQztZQUM1QixDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ0osSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLHVCQUF1QixDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUU7Z0JBQ3pELElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQztnQkFDbEIsd0JBQXdCLEVBQUUsQ0FBQztZQUM1QixDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ0osSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLFdBQVcsQ0FBQyxHQUFHLEVBQUU7Z0JBQzlDLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQztnQkFDbEIsd0JBQXdCLEVBQUUsQ0FBQztZQUM1QixDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ0osSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMscUJBQXFCLENBQUMsd0JBQXdCLENBQUMsQ0FBQyxDQUFDLEVBQUU7Z0JBQ3RFLElBQUksQ0FBQyxDQUFDLG9CQUFvQixDQUFDLHVEQUFnQyxDQUFDLEVBQUU7b0JBQzdELElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQztvQkFDbEIsd0JBQXdCLEVBQUUsQ0FBQztpQkFDM0I7WUFDRixDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ0osSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLHFCQUFxQixDQUFDLEdBQUcsRUFBRTtnQkFDNUQsSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDO2dCQUNsQix3QkFBd0IsRUFBRSxDQUFDO1lBQzVCLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDSix3QkFBd0IsRUFBRSxDQUFDO1FBQzVCLENBQUM7UUFFTyxVQUFVO1lBQ2pCLEtBQUssTUFBTSxPQUFPLElBQUksSUFBSSxDQUFDLG9CQUFvQixFQUFFO2dCQUNoRCxPQUFPLENBQUMsTUFBTSxFQUFFLENBQUM7YUFDakI7WUFDRCxJQUFJLENBQUMsb0JBQW9CLEdBQUcsRUFBRSxDQUFDO1FBQ2hDLENBQUM7UUFFTyx5QkFBeUIsQ0FBQyxHQUEyQjtZQUM1RCxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxHQUFHLEdBQUcsSUFBSSxDQUFDLG9CQUFvQixDQUFDLE1BQU0sRUFBRSxDQUFDLEdBQUcsR0FBRyxFQUFFLENBQUMsRUFBRSxFQUFFO2dCQUNyRSxJQUFJLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDLENBQUMsS0FBSyxHQUFHLEVBQUU7b0JBQ3pDLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO29CQUN2QyxPQUFPO2lCQUNQO2FBQ0Q7UUFDRixDQUFDO1FBRU8sb0JBQW9CO1lBQzNCLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsRUFBRSxFQUFFO2dCQUM3QixPQUFPO2FBQ1A7WUFDRCxNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsRUFBRSxDQUFDO1lBQ3RDLElBQUksS0FBSyxDQUFDLFlBQVksQ0FBQyx5QkFBeUIsRUFBRSxFQUFFO2dCQUNuRCxPQUFPO2FBQ1A7WUFDRCxJQUFJLENBQUMsSUFBQSxnREFBeUIsRUFBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLGFBQWEsRUFBRSxJQUFJLENBQUMscUJBQXFCLENBQUMsRUFBRTtnQkFDdEYsSUFBSSxLQUFLLENBQUMsWUFBWSxDQUFDLHFCQUFxQixFQUFFLEVBQUU7b0JBQy9DLEtBQUssQ0FBQyxZQUFZLENBQUMsaUJBQWlCLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFDO2lCQUNsRDtnQkFDRCxPQUFPO2FBQ1A7WUFDRCxJQUFJLENBQUMsSUFBQSwwREFBc0MsRUFBQyxJQUFJLENBQUMsU0FBUyxFQUFFLEtBQUssQ0FBQyxFQUFFO2dCQUNuRSxJQUFJLEtBQUssQ0FBQyxZQUFZLENBQUMscUJBQXFCLEVBQUUsRUFBRTtvQkFDL0MsS0FBSyxDQUFDLFlBQVksQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLENBQUM7aUJBQ2xEO2dCQUNELE9BQU87YUFDUDtZQUNELE1BQU0sYUFBYSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsc0NBQXNDLEVBQUUsQ0FBQztZQUU1RSxJQUFJLENBQUMsb0JBQW9CLEdBQUcsSUFBSSxDQUFDLG9CQUFvQixDQUFDLE1BQU0sQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzVILENBQUM7UUFFTyxhQUFhLENBQUMsS0FBaUIsRUFBRSxLQUFZO1lBQ3BELE1BQU0sZ0JBQWdCLEdBQUcsS0FBSyxDQUFDLFlBQVksRUFBRSxDQUFDO1lBQzlDLE1BQU0sT0FBTyxHQUFHLElBQUEsK0JBQXVCLEVBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLElBQUEsa0RBQThCLEVBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUN2SSxNQUFNLEVBQUUsR0FBRyxJQUFJLHFCQUFTLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDaEMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFO2dCQUNsQixJQUFJLENBQUMsb0JBQW9CLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRSxFQUFFLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQztnQkFDdEQsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxNQUFNLElBQUksS0FBSyxDQUFDLFVBQVUsRUFBRSxJQUFJLEtBQUssQ0FBQyxZQUFZLEVBQUUsS0FBSyxnQkFBZ0IsRUFBRTtvQkFDdkYsT0FBTztpQkFDUDtnQkFDRCxNQUFNLEVBQUUsUUFBUSxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsR0FBRyxDQUFDLENBQUM7Z0JBQ3ZDLE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyw2QkFBNkIsQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDLENBQUM7Z0JBQ3hFLEtBQUssQ0FBQyxZQUFZLENBQUMsd0JBQXdCLENBQUMsS0FBSyxFQUFFLElBQUEsa0RBQWtCLEVBQUMsTUFBTSxFQUFFLE9BQU8sRUFBRSxLQUFLLENBQUMsYUFBYSxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ2hILENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMseUJBQXlCLENBQUMsT0FBTyxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLHlCQUF5QixDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7WUFDdEcsT0FBTyxPQUFPLENBQUM7UUFDaEIsQ0FBQzs7SUFwSFcsZ0ZBQWtDO2lEQUFsQyxrQ0FBa0M7UUFnQjVDLFdBQUEscURBQTZCLENBQUE7UUFDN0IsV0FBQSw0QkFBYSxDQUFBO1FBQ2IsV0FBQSxxQ0FBcUIsQ0FBQTtRQUNyQixXQUFBLHlEQUErQixDQUFBO1FBQy9CLFdBQUEsMkNBQXdCLENBQUE7T0FwQmQsa0NBQWtDLENBcUg5QztJQUVELElBQUEsNkNBQTBCLEVBQUMsa0NBQWtDLENBQUMsRUFBRSxFQUFFLGtDQUFrQywyREFBbUQsQ0FBQyJ9