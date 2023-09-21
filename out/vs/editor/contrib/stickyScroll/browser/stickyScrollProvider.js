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
define(["require", "exports", "vs/base/common/lifecycle", "vs/editor/common/services/languageFeatures", "vs/base/common/cancellation", "vs/base/common/async", "vs/base/common/arrays", "vs/base/common/event", "vs/editor/common/languages/languageConfigurationRegistry", "vs/editor/contrib/stickyScroll/browser/stickyScrollModelProvider"], function (require, exports, lifecycle_1, languageFeatures_1, cancellation_1, async_1, arrays_1, event_1, languageConfigurationRegistry_1, stickyScrollModelProvider_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.StickyLineCandidateProvider = exports.StickyLineCandidate = void 0;
    class StickyLineCandidate {
        constructor(startLineNumber, endLineNumber, nestingDepth) {
            this.startLineNumber = startLineNumber;
            this.endLineNumber = endLineNumber;
            this.nestingDepth = nestingDepth;
        }
    }
    exports.StickyLineCandidate = StickyLineCandidate;
    let StickyLineCandidateProvider = class StickyLineCandidateProvider extends lifecycle_1.Disposable {
        static { this.ID = 'store.contrib.stickyScrollController'; }
        constructor(editor, _languageFeaturesService, _languageConfigurationService) {
            super();
            this._languageFeaturesService = _languageFeaturesService;
            this._languageConfigurationService = _languageConfigurationService;
            this._onDidChangeStickyScroll = this._register(new event_1.Emitter());
            this.onDidChangeStickyScroll = this._onDidChangeStickyScroll.event;
            this._options = null;
            this._model = null;
            this._cts = null;
            this._stickyModelProvider = null;
            this._editor = editor;
            this._sessionStore = this._register(new lifecycle_1.DisposableStore());
            this._updateSoon = this._register(new async_1.RunOnceScheduler(() => this.update(), 50));
            this._register(this._editor.onDidChangeConfiguration(e => {
                if (e.hasChanged(114 /* EditorOption.stickyScroll */)) {
                    this.readConfiguration();
                }
            }));
            this.readConfiguration();
        }
        readConfiguration() {
            this._stickyModelProvider = null;
            this._sessionStore.clear();
            this._options = this._editor.getOption(114 /* EditorOption.stickyScroll */);
            if (!this._options.enabled) {
                return;
            }
            this._stickyModelProvider = this._sessionStore.add(new stickyScrollModelProvider_1.StickyModelProvider(this._editor, this._languageConfigurationService, this._languageFeaturesService, this._options.defaultModel));
            this._sessionStore.add(this._editor.onDidChangeModel(() => {
                // We should not show an old model for a different file, it will always be wrong.
                // So we clear the model here immediately and then trigger an update.
                this._model = null;
                this._onDidChangeStickyScroll.fire();
                this.update();
            }));
            this._sessionStore.add(this._editor.onDidChangeHiddenAreas(() => this.update()));
            this._sessionStore.add(this._editor.onDidChangeModelContent(() => this._updateSoon.schedule()));
            this._sessionStore.add(this._languageFeaturesService.documentSymbolProvider.onDidChange(() => this.update()));
            this.update();
        }
        getVersionId() {
            return this._model?.version;
        }
        async update() {
            this._cts?.dispose(true);
            this._cts = new cancellation_1.CancellationTokenSource();
            await this.updateStickyModel(this._cts.token);
            this._onDidChangeStickyScroll.fire();
        }
        async updateStickyModel(token) {
            if (!this._editor.hasModel() || !this._stickyModelProvider || this._editor.getModel().isTooLargeForTokenization()) {
                this._model = null;
                return;
            }
            const textModel = this._editor.getModel();
            const modelVersionId = textModel.getVersionId();
            const model = await this._stickyModelProvider.update(textModel, modelVersionId, token);
            if (token.isCancellationRequested) {
                // the computation was canceled, so do not overwrite the model
                return;
            }
            this._model = model;
        }
        updateIndex(index) {
            if (index === -1) {
                index = 0;
            }
            else if (index < 0) {
                index = -index - 2;
            }
            return index;
        }
        getCandidateStickyLinesIntersectingFromStickyModel(range, outlineModel, result, depth, lastStartLineNumber) {
            if (outlineModel.children.length === 0) {
                return;
            }
            let lastLine = lastStartLineNumber;
            const childrenStartLines = [];
            for (let i = 0; i < outlineModel.children.length; i++) {
                const child = outlineModel.children[i];
                if (child.range) {
                    childrenStartLines.push(child.range.startLineNumber);
                }
            }
            const lowerBound = this.updateIndex((0, arrays_1.binarySearch)(childrenStartLines, range.startLineNumber, (a, b) => { return a - b; }));
            const upperBound = this.updateIndex((0, arrays_1.binarySearch)(childrenStartLines, range.startLineNumber + depth, (a, b) => { return a - b; }));
            for (let i = lowerBound; i <= upperBound; i++) {
                const child = outlineModel.children[i];
                if (!child) {
                    return;
                }
                if (child.range) {
                    const childStartLine = child.range.startLineNumber;
                    const childEndLine = child.range.endLineNumber;
                    if (range.startLineNumber <= childEndLine + 1 && childStartLine - 1 <= range.endLineNumber && childStartLine !== lastLine) {
                        lastLine = childStartLine;
                        result.push(new StickyLineCandidate(childStartLine, childEndLine - 1, depth + 1));
                        this.getCandidateStickyLinesIntersectingFromStickyModel(range, child, result, depth + 1, childStartLine);
                    }
                }
                else {
                    this.getCandidateStickyLinesIntersectingFromStickyModel(range, child, result, depth, lastStartLineNumber);
                }
            }
        }
        getCandidateStickyLinesIntersecting(range) {
            if (!this._model?.element) {
                return [];
            }
            let stickyLineCandidates = [];
            this.getCandidateStickyLinesIntersectingFromStickyModel(range, this._model.element, stickyLineCandidates, 0, -1);
            const hiddenRanges = this._editor._getViewModel()?.getHiddenAreas();
            if (hiddenRanges) {
                for (const hiddenRange of hiddenRanges) {
                    stickyLineCandidates = stickyLineCandidates.filter(stickyLine => !(stickyLine.startLineNumber >= hiddenRange.startLineNumber && stickyLine.endLineNumber <= hiddenRange.endLineNumber + 1));
                }
            }
            return stickyLineCandidates;
        }
    };
    exports.StickyLineCandidateProvider = StickyLineCandidateProvider;
    exports.StickyLineCandidateProvider = StickyLineCandidateProvider = __decorate([
        __param(1, languageFeatures_1.ILanguageFeaturesService),
        __param(2, languageConfigurationRegistry_1.ILanguageConfigurationService)
    ], StickyLineCandidateProvider);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RpY2t5U2Nyb2xsUHJvdmlkZXIuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9lZGl0b3IvY29udHJpYi9zdGlja3lTY3JvbGwvYnJvd3Nlci9zdGlja3lTY3JvbGxQcm92aWRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUFlaEcsTUFBYSxtQkFBbUI7UUFDL0IsWUFDaUIsZUFBdUIsRUFDdkIsYUFBcUIsRUFDckIsWUFBb0I7WUFGcEIsb0JBQWUsR0FBZixlQUFlLENBQVE7WUFDdkIsa0JBQWEsR0FBYixhQUFhLENBQVE7WUFDckIsaUJBQVksR0FBWixZQUFZLENBQVE7UUFDakMsQ0FBQztLQUNMO0lBTkQsa0RBTUM7SUFZTSxJQUFNLDJCQUEyQixHQUFqQyxNQUFNLDJCQUE0QixTQUFRLHNCQUFVO2lCQUUxQyxPQUFFLEdBQUcsc0NBQXNDLEFBQXpDLENBQTBDO1FBYzVELFlBQ0MsTUFBbUIsRUFDTyx3QkFBbUUsRUFDOUQsNkJBQTZFO1lBRTVHLEtBQUssRUFBRSxDQUFDO1lBSG1DLDZCQUF3QixHQUF4Qix3QkFBd0IsQ0FBMEI7WUFDN0Msa0NBQTZCLEdBQTdCLDZCQUE2QixDQUErQjtZQWY1Riw2QkFBd0IsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksZUFBTyxFQUFRLENBQUMsQ0FBQztZQUNoRSw0QkFBdUIsR0FBRyxJQUFJLENBQUMsd0JBQXdCLENBQUMsS0FBSyxDQUFDO1lBTXRFLGFBQVEsR0FBMEQsSUFBSSxDQUFDO1lBQ3ZFLFdBQU0sR0FBdUIsSUFBSSxDQUFDO1lBQ2xDLFNBQUksR0FBbUMsSUFBSSxDQUFDO1lBQzVDLHlCQUFvQixHQUFnQyxJQUFJLENBQUM7WUFRaEUsSUFBSSxDQUFDLE9BQU8sR0FBRyxNQUFNLENBQUM7WUFDdEIsSUFBSSxDQUFDLGFBQWEsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFD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