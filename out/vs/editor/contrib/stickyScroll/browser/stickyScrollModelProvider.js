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
define(["require", "exports", "vs/base/common/lifecycle", "vs/editor/common/services/languageFeatures", "vs/editor/contrib/documentSymbols/browser/outlineModel", "vs/base/common/async", "vs/editor/contrib/folding/browser/folding", "vs/editor/contrib/folding/browser/syntaxRangeProvider", "vs/editor/contrib/folding/browser/indentRangeProvider", "vs/editor/common/languages/languageConfigurationRegistry", "vs/base/common/errors", "vs/editor/contrib/stickyScroll/browser/stickyScrollElement", "vs/base/common/iterator"], function (require, exports, lifecycle_1, languageFeatures_1, outlineModel_1, async_1, folding_1, syntaxRangeProvider_1, indentRangeProvider_1, languageConfigurationRegistry_1, errors_1, stickyScrollElement_1, iterator_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.StickyModelProvider = void 0;
    var ModelProvider;
    (function (ModelProvider) {
        ModelProvider["OUTLINE_MODEL"] = "outlineModel";
        ModelProvider["FOLDING_PROVIDER_MODEL"] = "foldingProviderModel";
        ModelProvider["INDENTATION_MODEL"] = "indentationModel";
    })(ModelProvider || (ModelProvider = {}));
    var Status;
    (function (Status) {
        Status[Status["VALID"] = 0] = "VALID";
        Status[Status["INVALID"] = 1] = "INVALID";
        Status[Status["CANCELED"] = 2] = "CANCELED";
    })(Status || (Status = {}));
    let StickyModelProvider = class StickyModelProvider extends lifecycle_1.Disposable {
        constructor(_editor, _languageConfigurationService, _languageFeaturesService, defaultModel) {
            super();
            this._editor = _editor;
            this._languageConfigurationService = _languageConfigurationService;
            this._languageFeaturesService = _languageFeaturesService;
            this._modelProviders = [];
            this._modelPromise = null;
            this._updateScheduler = this._register(new async_1.Delayer(300));
            this._updateOperation = this._register(new lifecycle_1.DisposableStore());
            const stickyModelFromCandidateOutlineProvider = new StickyModelFromCandidateOutlineProvider(_languageFeaturesService);
            const stickyModelFromSyntaxFoldingProvider = new StickyModelFromCandidateSyntaxFoldingProvider(this._editor, _languageFeaturesService);
            const stickyModelFromIndentationFoldingProvider = new StickyModelFromCandidateIndentationFoldingProvider(this._editor, _languageConfigurationService);
            switch (defaultModel) {
                case ModelProvider.OUTLINE_MODEL:
                    this._modelProviders.push(stickyModelFromCandidateOutlineProvider);
                    this._modelProviders.push(stickyModelFromSyntaxFoldingProvider);
                    this._modelProviders.push(stickyModelFromIndentationFoldingProvider);
                    break;
                case ModelProvider.FOLDING_PROVIDER_MODEL:
                    this._modelProviders.push(stickyModelFromSyntaxFoldingProvider);
                    this._modelProviders.push(stickyModelFromIndentationFoldingProvider);
                    break;
                case ModelProvider.INDENTATION_MODEL:
                    this._modelProviders.push(stickyModelFromIndentationFoldingProvider);
                    break;
            }
        }
        _cancelModelPromise() {
            if (this._modelPromise) {
                this._modelPromise.cancel();
                this._modelPromise = null;
            }
        }
        async update(textModel, textModelVersionId, token) {
            this._updateOperation.clear();
            this._updateOperation.add({
                dispose: () => {
                    this._cancelModelPromise();
                    this._updateScheduler.cancel();
                }
            });
            this._cancelModelPromise();
            return await this._updateScheduler.trigger(async () => {
                for (const modelProvider of this._modelProviders) {
                    const { statusPromise, modelPromise } = modelProvider.computeStickyModel(textModel, textModelVersionId, token);
                    this._modelPromise = modelPromise;
                    const status = await statusPromise;
                    if (this._modelPromise !== modelPromise) {
                        return null;
                    }
                    switch (status) {
                        case Status.CANCELED:
                            this._updateOperation.clear();
                            return null;
                        case Status.VALID:
                            return modelProvider.stickyModel;
                    }
                }
                return null;
            }).catch((error) => {
                (0, errors_1.onUnexpectedError)(error);
                return null;
            });
        }
    };
    exports.StickyModelProvider = StickyModelProvider;
    exports.StickyModelProvider = StickyModelProvider = __decorate([
        __param(1, languageConfigurationRegistry_1.ILanguageConfigurationService),
        __param(2, languageFeatures_1.ILanguageFeaturesService)
    ], StickyModelProvider);
    class StickyModelCandidateProvider {
        constructor() {
            this._stickyModel = null;
        }
        get stickyModel() {
            return this._stickyModel;
        }
        _invalid() {
            this._stickyModel = null;
            return Status.INVALID;
        }
        computeStickyModel(textModel, modelVersionId, token) {
            if (token.isCancellationRequested || !this.isProviderValid(textModel)) {
                return { statusPromise: this._invalid(), modelPromise: null };
            }
            const providerModelPromise = (0, async_1.createCancelablePromise)(token => this.createModelFromProvider(textModel, modelVersionId, token));
            return {
                statusPromise: providerModelPromise.then(providerModel => {
                    if (!this.isModelValid(providerModel)) {
                        return this._invalid();
                    }
                    if (token.isCancellationRequested) {
                        return Status.CANCELED;
                    }
                    this._stickyModel = this.createStickyModel(textModel, modelVersionId, token, providerModel);
                    return Status.VALID;
                }).then(undefined, (err) => {
                    (0, errors_1.onUnexpectedError)(err);
                    return Status.CANCELED;
                }),
                modelPromise: providerModelPromise
            };
        }
        /**
         * Method which checks whether the model returned by the provider is valid and can be used to compute a sticky model.
         * This method by default returns true.
         * @param model model returned by the provider
         * @returns boolean indicating whether the model is valid
         */
        isModelValid(model) {
            return true;
        }
        /**
         * Method which checks whether the provider is valid before applying it to find the provider model.
         * This method by default returns true.
         * @param textModel text-model of the editor
         * @returns boolean indicating whether the provider is valid
         */
        isProviderValid(textModel) {
            return true;
        }
    }
    let StickyModelFromCandidateOutlineProvider = class StickyModelFromCandidateOutlineProvider extends StickyModelCandidateProvider {
        constructor(_languageFeaturesService) {
            super();
            this._languageFeaturesService = _languageFeaturesService;
        }
        get provider() {
            return this._languageFeaturesService.documentSymbolProvider;
        }
        createModelFromProvider(textModel, modelVersionId, token) {
            return outlineModel_1.OutlineModel.create(this._languageFeaturesService.documentSymbolProvider, textModel, token);
        }
        createStickyModel(textModel, modelVersionId, token, model) {
            const { stickyOutlineElement, providerID } = this._stickyModelFromOutlineModel(model, this._stickyModel?.outlineProviderId);
            return new stickyScrollElement_1.StickyModel(textModel.uri, modelVersionId, stickyOutlineElement, providerID);
        }
        isModelValid(model) {
            return model && model.children.size > 0;
        }
        _stickyModelFromOutlineModel(outlineModel, preferredProvider) {
            let outlineElements;
            // When several possible outline providers
            if (iterator_1.Iterable.first(outlineModel.children.values()) instanceof outlineModel_1.OutlineGroup) {
                const provider = iterator_1.Iterable.find(outlineModel.children.values(), outlineGroupOfModel => outlineGroupOfModel.id === preferredProvider);
                if (provider) {
                    outlineElements = provider.children;
                }
                else {
                    let tempID = '';
                    let maxTotalSumOfRanges = -1;
                    let optimalOutlineGroup = undefined;
                    for (const [_key, outlineGroup] of outlineModel.children.entries()) {
                        const totalSumRanges = this._findSumOfRangesOfGroup(outlineGroup);
                        if (totalSumRanges > maxTotalSumOfRanges) {
                            optimalOutlineGroup = outlineGroup;
                            maxTotalSumOfRanges = totalSumRanges;
                            tempID = outlineGroup.id;
                        }
                    }
                    preferredProvider = tempID;
                    outlineElements = optimalOutlineGroup.children;
                }
            }
            else {
                outlineElements = outlineModel.children;
            }
            const stickyChildren = [];
            const outlineElementsArray = Array.from(outlineElements.values()).sort((element1, element2) => {
                const range1 = new stickyScrollElement_1.StickyRange(element1.symbol.range.startLineNumber, element1.symbol.range.endLineNumber);
                const range2 = new stickyScrollElement_1.StickyRange(element2.symbol.range.startLineNumber, element2.symbol.range.endLineNumber);
                return this._comparator(range1, range2);
            });
            for (const outlineElement of outlineElementsArray) {
                stickyChildren.push(this._stickyModelFromOutlineElement(outlineElement, outlineElement.symbol.selectionRange.startLineNumber));
            }
            const stickyOutlineElement = new stickyScrollElement_1.StickyElement(undefined, stickyChildren, undefined);
            return {
                stickyOutlineElement: stickyOutlineElement,
                providerID: preferredProvider
            };
        }
        _stickyModelFromOutlineElement(outlineElement, previousStartLine) {
            const children = [];
            for (const child of outlineElement.children.values()) {
                if (child.symbol.selectionRange.startLineNumber !== child.symbol.range.endLineNumber) {
                    if (child.symbol.selectionRange.startLineNumber !== previousStartLine) {
                        children.push(this._stickyModelFromOutlineElement(child, child.symbol.selectionRange.startLineNumber));
                    }
                    else {
                        for (const subchild of child.children.values()) {
                            children.push(this._stickyModelFromOutlineElement(subchild, child.symbol.selectionRange.startLineNumber));
                        }
                    }
                }
            }
            children.sort((child1, child2) => this._comparator(child1.range, child2.range));
            const range = new stickyScrollElement_1.StickyRange(outlineElement.symbol.selectionRange.startLineNumber, outlineElement.symbol.range.endLineNumber);
            return new stickyScrollElement_1.StickyElement(range, children, undefined);
        }
        _comparator(range1, range2) {
            if (range1.startLineNumber !== range2.startLineNumber) {
                return range1.startLineNumber - range2.startLineNumber;
            }
            else {
                return range2.endLineNumber - range1.endLineNumber;
            }
        }
        _findSumOfRangesOfGroup(outline) {
            let res = 0;
            for (const child of outline.children.values()) {
                res += this._findSumOfRangesOfGroup(child);
            }
            if (outline instanceof outlineModel_1.OutlineElement) {
                return res + outline.symbol.range.endLineNumber - outline.symbol.selectionRange.startLineNumber;
            }
            else {
                return res;
            }
        }
    };
    StickyModelFromCandidateOutlineProvider = __decorate([
        __param(0, languageFeatures_1.ILanguageFeaturesService)
    ], StickyModelFromCandidateOutlineProvider);
    class StickyModelFromCandidateFoldingProvider extends StickyModelCandidateProvider {
        constructor(editor) {
            super();
            this._foldingLimitReporter = new folding_1.RangesLimitReporter(editor);
        }
        createStickyModel(textModel, modelVersionId, token, model) {
            const foldingElement = this._fromFoldingRegions(model);
            return new stickyScrollElement_1.StickyModel(textModel.uri, modelVersionId, foldingElement, undefined);
        }
        isModelValid(model) {
            return model !== null;
        }
        _fromFoldingRegions(foldingRegions) {
            const length = foldingRegions.length;
            const orderedStickyElements = [];
            // The root sticky outline element
            const stickyOutlineElement = new stickyScrollElement_1.StickyElement(undefined, [], undefined);
            for (let i = 0; i < length; i++) {
                // Finding the parent index of the current range
                const parentIndex = foldingRegions.getParentIndex(i);
                let parentNode;
                if (parentIndex !== -1) {
                    // Access the reference of the parent node
                    parentNode = orderedStickyElements[parentIndex];
                }
                else {
                    // In that case the parent node is the root node
                    parentNode = stickyOutlineElement;
                }
                const child = new stickyScrollElement_1.StickyElement(new stickyScrollElement_1.StickyRange(foldingRegions.getStartLineNumber(i), foldingRegions.getEndLineNumber(i) + 1), [], parentNode);
                parentNode.children.push(child);
                orderedStickyElements.push(child);
            }
            return stickyOutlineElement;
        }
    }
    let StickyModelFromCandidateIndentationFoldingProvider = class StickyModelFromCandidateIndentationFoldingProvider extends StickyModelFromCandidateFoldingProvider {
        constructor(editor, _languageConfigurationService) {
            super(editor);
            this._languageConfigurationService = _languageConfigurationService;
        }
        get provider() {
            return null;
        }
        createModelFromProvider(textModel, modelVersionId, token) {
            const provider = new indentRangeProvider_1.IndentRangeProvider(textModel, this._languageConfigurationService, this._foldingLimitReporter);
            return provider.compute(token);
        }
    };
    StickyModelFromCandidateIndentationFoldingProvider = __decorate([
        __param(1, languageConfigurationRegistry_1.ILanguageConfigurationService)
    ], StickyModelFromCandidateIndentationFoldingProvider);
    let StickyModelFromCandidateSyntaxFoldingProvider = class StickyModelFromCandidateSyntaxFoldingProvider extends StickyModelFromCandidateFoldingProvider {
        constructor(editor, _languageFeaturesService) {
            super(editor);
            this._languageFeaturesService = _languageFeaturesService;
        }
        get provider() {
            return this._languageFeaturesService.foldingRangeProvider;
        }
        isProviderValid(textModel) {
            const selectedProviders = folding_1.FoldingController.getFoldingRangeProviders(this._languageFeaturesService, textModel);
            return selectedProviders.length > 0;
        }
        createModelFromProvider(textModel, modelVersionId, token) {
            const selectedProviders = folding_1.FoldingController.getFoldingRangeProviders(this._languageFeaturesService, textModel);
            const provider = new syntaxRangeProvider_1.SyntaxRangeProvider(textModel, selectedProviders, () => this.createModelFromProvider(textModel, modelVersionId, token), this._foldingLimitReporter, undefined);
            return provider.compute(token);
        }
    };
    StickyModelFromCandidateSyntaxFoldingProvider = __decorate([
        __param(1, languageFeatures_1.ILanguageFeaturesService)
    ], StickyModelFromCandidateSyntaxFoldingProvider);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RpY2t5U2Nyb2xsTW9kZWxQcm92aWRlci5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL2VkaXRvci9jb250cmliL3N0aWNreVNjcm9sbC9icm93c2VyL3N0aWNreVNjcm9sbE1vZGVsUHJvdmlkZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBb0JoRyxJQUFLLGFBSUo7SUFKRCxXQUFLLGFBQWE7UUFDakIsK0NBQThCLENBQUE7UUFDOUIsZ0VBQStDLENBQUE7UUFDL0MsdURBQXNDLENBQUE7SUFDdkMsQ0FBQyxFQUpJLGFBQWEsS0FBYixhQUFhLFFBSWpCO0lBRUQsSUFBSyxNQUlKO0lBSkQsV0FBSyxNQUFNO1FBQ1YscUNBQUssQ0FBQTtRQUNMLHlDQUFPLENBQUE7UUFDUCwyQ0FBUSxDQUFBO0lBQ1QsQ0FBQyxFQUpJLE1BQU0sS0FBTixNQUFNLFFBSVY7SUFjTSxJQUFNLG1CQUFtQixHQUF6QixNQUFNLG1CQUFvQixTQUFRLHNCQUFVO1FBT2xELFlBQ2tCLE9BQW9CLEVBQ04sNkJBQXFFLEVBQzFFLHdCQUEyRCxFQUNyRixZQUFvQjtZQUVwQixLQUFLLEVBQUUsQ0FBQztZQUxTLFlBQU8sR0FBUCxPQUFPLENBQWE7WUFDRyxrQ0FBNkIsR0FBN0IsNkJBQTZCLENBQStCO1lBQ2pFLDZCQUF3QixHQUF4Qix3QkFBd0IsQ0FBMEI7WUFSOUUsb0JBQWUsR0FBeUMsRUFBRSxDQUFDO1lBQzNELGtCQUFhLEdBQXlDLElBQUksQ0FBQztZQUMzRCxxQkFBZ0IsR0FBZ0MsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLGVBQU8sQ0FBcUIsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUM1RixxQkFBZ0IsR0FBb0IsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLDJCQUFlLEVBQUUsQ0FBQyxDQUFDO1lBVTFGLE1BQU0sdUNBQXVDLEdBQUcsSUFBSSx1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