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
    exports.$R0 = void 0;
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
    let $R0 = class $R0 extends lifecycle_1.$kc {
        constructor(g, _languageConfigurationService, _languageFeaturesService, defaultModel) {
            super();
            this.g = g;
            this._languageConfigurationService = _languageConfigurationService;
            this._languageFeaturesService = _languageFeaturesService;
            this.a = [];
            this.b = null;
            this.c = this.B(new async_1.$Dg(300));
            this.f = this.B(new lifecycle_1.$jc());
            const stickyModelFromCandidateOutlineProvider = new StickyModelFromCandidateOutlineProvider(_languageFeaturesService);
            const stickyModelFromSyntaxFoldingProvider = new StickyModelFromCandidateSyntaxFoldingProvider(this.g, _languageFeaturesService);
            const stickyModelFromIndentationFoldingProvider = new StickyModelFromCandidateIndentationFoldingProvider(this.g, _languageConfigurationService);
            switch (defaultModel) {
                case ModelProvider.OUTLINE_MODEL:
                    this.a.push(stickyModelFromCandidateOutlineProvider);
                    this.a.push(stickyModelFromSyntaxFoldingProvider);
                    this.a.push(stickyModelFromIndentationFoldingProvider);
                    break;
                case ModelProvider.FOLDING_PROVIDER_MODEL:
                    this.a.push(stickyModelFromSyntaxFoldingProvider);
                    this.a.push(stickyModelFromIndentationFoldingProvider);
                    break;
                case ModelProvider.INDENTATION_MODEL:
                    this.a.push(stickyModelFromIndentationFoldingProvider);
                    break;
            }
        }
        h() {
            if (this.b) {
                this.b.cancel();
                this.b = null;
            }
        }
        async update(textModel, textModelVersionId, token) {
            this.f.clear();
            this.f.add({
                dispose: () => {
                    this.h();
                    this.c.cancel();
                }
            });
            this.h();
            return await this.c.trigger(async () => {
                for (const modelProvider of this.a) {
                    const { statusPromise, modelPromise } = modelProvider.computeStickyModel(textModel, textModelVersionId, token);
                    this.b = modelPromise;
                    const status = await statusPromise;
                    if (this.b !== modelPromise) {
                        return null;
                    }
                    switch (status) {
                        case Status.CANCELED:
                            this.f.clear();
                            return null;
                        case Status.VALID:
                            return modelProvider.stickyModel;
                    }
                }
                return null;
            }).catch((error) => {
                (0, errors_1.$Y)(error);
                return null;
            });
        }
    };
    exports.$R0 = $R0;
    exports.$R0 = $R0 = __decorate([
        __param(1, languageConfigurationRegistry_1.$2t),
        __param(2, languageFeatures_1.$hF)
    ], $R0);
    class StickyModelCandidateProvider {
        constructor() {
            this.a = null;
        }
        get stickyModel() {
            return this.a;
        }
        b() {
            this.a = null;
            return Status.INVALID;
        }
        computeStickyModel(textModel, modelVersionId, token) {
            if (token.isCancellationRequested || !this.d(textModel)) {
                return { statusPromise: this.b(), modelPromise: null };
            }
            const providerModelPromise = (0, async_1.$ug)(token => this.e(textModel, modelVersionId, token));
            return {
                statusPromise: providerModelPromise.then(providerModel => {
                    if (!this.c(providerModel)) {
                        return this.b();
                    }
                    if (token.isCancellationRequested) {
                        return Status.CANCELED;
                    }
                    this.a = this.f(textModel, modelVersionId, token, providerModel);
                    return Status.VALID;
                }).then(undefined, (err) => {
                    (0, errors_1.$Y)(err);
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
        c(model) {
            return true;
        }
        /**
         * Method which checks whether the provider is valid before applying it to find the provider model.
         * This method by default returns true.
         * @param textModel text-model of the editor
         * @returns boolean indicating whether the provider is valid
         */
        d(textModel) {
            return true;
        }
    }
    let StickyModelFromCandidateOutlineProvider = class StickyModelFromCandidateOutlineProvider extends StickyModelCandidateProvider {
        constructor(g) {
            super();
            this.g = g;
        }
        get provider() {
            return this.g.documentSymbolProvider;
        }
        e(textModel, modelVersionId, token) {
            return outlineModel_1.$Q8.create(this.g.documentSymbolProvider, textModel, token);
        }
        f(textModel, modelVersionId, token, model) {
            const { stickyOutlineElement, providerID } = this.l(model, this.a?.outlineProviderId);
            return new stickyScrollElement_1.$Q0(textModel.uri, modelVersionId, stickyOutlineElement, providerID);
        }
        c(model) {
            return model && model.children.size > 0;
        }
        l(outlineModel, preferredProvider) {
            let outlineElements;
            // When several possible outline providers
            if (iterator_1.Iterable.first(outlineModel.children.values()) instanceof outlineModel_1.$P8) {
                const provider = iterator_1.Iterable.find(outlineModel.children.values(), outlineGroupOfModel => outlineGroupOfModel.id === preferredProvider);
                if (provider) {
                    outlineElements = provider.children;
                }
                else {
                    let tempID = '';
                    let maxTotalSumOfRanges = -1;
                    let optimalOutlineGroup = undefined;
                    for (const [_key, outlineGroup] of outlineModel.children.entries()) {
                        const totalSumRanges = this.o(outlineGroup);
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
                const range1 = new stickyScrollElement_1.$O0(element1.symbol.range.startLineNumber, element1.symbol.range.endLineNumber);
                const range2 = new stickyScrollElement_1.$O0(element2.symbol.range.startLineNumber, element2.symbol.range.endLineNumber);
                return this.n(range1, range2);
            });
            for (const outlineElement of outlineElementsArray) {
                stickyChildren.push(this.m(outlineElement, outlineElement.symbol.selectionRange.startLineNumber));
            }
            const stickyOutlineElement = new stickyScrollElement_1.$P0(undefined, stickyChildren, undefined);
            return {
                stickyOutlineElement: stickyOutlineElement,
                providerID: preferredProvider
            };
        }
        m(outlineElement, previousStartLine) {
            const children = [];
            for (const child of outlineElement.children.values()) {
                if (child.symbol.selectionRange.startLineNumber !== child.symbol.range.endLineNumber) {
                    if (child.symbol.selectionRange.startLineNumber !== previousStartLine) {
                        children.push(this.m(child, child.symbol.selectionRange.startLineNumber));
                    }
                    else {
                        for (const subchild of child.children.values()) {
                            children.push(this.m(subchild, child.symbol.selectionRange.startLineNumber));
                        }
                    }
                }
            }
            children.sort((child1, child2) => this.n(child1.range, child2.range));
            const range = new stickyScrollElement_1.$O0(outlineElement.symbol.selectionRange.startLineNumber, outlineElement.symbol.range.endLineNumber);
            return new stickyScrollElement_1.$P0(range, children, undefined);
        }
        n(range1, range2) {
            if (range1.startLineNumber !== range2.startLineNumber) {
                return range1.startLineNumber - range2.startLineNumber;
            }
            else {
                return range2.endLineNumber - range1.endLineNumber;
            }
        }
        o(outline) {
            let res = 0;
            for (const child of outline.children.values()) {
                res += this.o(child);
            }
            if (outline instanceof outlineModel_1.$O8) {
                return res + outline.symbol.range.endLineNumber - outline.symbol.selectionRange.startLineNumber;
            }
            else {
                return res;
            }
        }
    };
    StickyModelFromCandidateOutlineProvider = __decorate([
        __param(0, languageFeatures_1.$hF)
    ], StickyModelFromCandidateOutlineProvider);
    class StickyModelFromCandidateFoldingProvider extends StickyModelCandidateProvider {
        constructor(editor) {
            super();
            this.g = new folding_1.$A8(editor);
        }
        f(textModel, modelVersionId, token, model) {
            const foldingElement = this.k(model);
            return new stickyScrollElement_1.$Q0(textModel.uri, modelVersionId, foldingElement, undefined);
        }
        c(model) {
            return model !== null;
        }
        k(foldingRegions) {
            const length = foldingRegions.length;
            const orderedStickyElements = [];
            // The root sticky outline element
            const stickyOutlineElement = new stickyScrollElement_1.$P0(undefined, [], undefined);
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
                const child = new stickyScrollElement_1.$P0(new stickyScrollElement_1.$O0(foldingRegions.getStartLineNumber(i), foldingRegions.getEndLineNumber(i) + 1), [], parentNode);
                parentNode.children.push(child);
                orderedStickyElements.push(child);
            }
            return stickyOutlineElement;
        }
    }
    let StickyModelFromCandidateIndentationFoldingProvider = class StickyModelFromCandidateIndentationFoldingProvider extends StickyModelFromCandidateFoldingProvider {
        constructor(editor, l) {
            super(editor);
            this.l = l;
        }
        get provider() {
            return null;
        }
        e(textModel, modelVersionId, token) {
            const provider = new indentRangeProvider_1.$p8(textModel, this.l, this.g);
            return provider.compute(token);
        }
    };
    StickyModelFromCandidateIndentationFoldingProvider = __decorate([
        __param(1, languageConfigurationRegistry_1.$2t)
    ], StickyModelFromCandidateIndentationFoldingProvider);
    let StickyModelFromCandidateSyntaxFoldingProvider = class StickyModelFromCandidateSyntaxFoldingProvider extends StickyModelFromCandidateFoldingProvider {
        constructor(editor, l) {
            super(editor);
            this.l = l;
        }
        get provider() {
            return this.l.foldingRangeProvider;
        }
        d(textModel) {
            const selectedProviders = folding_1.$z8.getFoldingRangeProviders(this.l, textModel);
            return selectedProviders.length > 0;
        }
        e(textModel, modelVersionId, token) {
            const selectedProviders = folding_1.$z8.getFoldingRangeProviders(this.l, textModel);
            const provider = new syntaxRangeProvider_1.$x8(textModel, selectedProviders, () => this.e(textModel, modelVersionId, token), this.g, undefined);
            return provider.compute(token);
        }
    };
    StickyModelFromCandidateSyntaxFoldingProvider = __decorate([
        __param(1, languageFeatures_1.$hF)
    ], StickyModelFromCandidateSyntaxFoldingProvider);
});
//# sourceMappingURL=stickyScrollModelProvider.js.map