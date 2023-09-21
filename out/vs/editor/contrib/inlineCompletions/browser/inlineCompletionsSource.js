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
define(["require", "exports", "vs/base/common/cancellation", "vs/base/common/filters", "vs/base/common/lifecycle", "vs/base/common/observable", "vs/editor/common/core/position", "vs/editor/common/languages", "vs/editor/common/languages/languageConfigurationRegistry", "vs/editor/common/services/languageFeatures", "vs/editor/contrib/inlineCompletions/browser/provideInlineCompletions", "vs/editor/contrib/inlineCompletions/browser/singleTextEdit"], function (require, exports, cancellation_1, filters_1, lifecycle_1, observable_1, position_1, languages_1, languageConfigurationRegistry_1, languageFeatures_1, provideInlineCompletions_1, singleTextEdit_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.InlineCompletionWithUpdatedRange = exports.UpToDateInlineCompletions = exports.InlineCompletionsSource = void 0;
    let InlineCompletionsSource = class InlineCompletionsSource extends lifecycle_1.Disposable {
        constructor(textModel, versionId, _debounceValue, languageFeaturesService, languageConfigurationService) {
            super();
            this.textModel = textModel;
            this.versionId = versionId;
            this._debounceValue = _debounceValue;
            this.languageFeaturesService = languageFeaturesService;
            this.languageConfigurationService = languageConfigurationService;
            this._updateOperation = this._register(new lifecycle_1.MutableDisposable());
            this.inlineCompletions = (0, observable_1.disposableObservableValue)('inlineCompletions', undefined);
            this.suggestWidgetInlineCompletions = (0, observable_1.disposableObservableValue)('suggestWidgetInlineCompletions', undefined);
            this._register(this.textModel.onDidChangeContent(() => {
                this._updateOperation.clear();
            }));
        }
        fetch(position, context, activeInlineCompletion) {
            const request = new UpdateRequest(position, context, this.textModel.getVersionId());
            const target = context.selectedSuggestionInfo ? this.suggestWidgetInlineCompletions : this.inlineCompletions;
            if (this._updateOperation.value?.request.satisfies(request)) {
                return this._updateOperation.value.promise;
            }
            else if (target.get()?.request.satisfies(request)) {
                return Promise.resolve(true);
            }
            const updateOngoing = !!this._updateOperation.value;
            this._updateOperation.clear();
            const source = new cancellation_1.CancellationTokenSource();
            const promise = (async () => {
                const shouldDebounce = updateOngoing || context.triggerKind === languages_1.InlineCompletionTriggerKind.Automatic;
                if (shouldDebounce) {
                    // This debounces the operation
                    await wait(this._debounceValue.get(this.textModel));
                }
                if (source.token.isCancellationRequested || this.textModel.getVersionId() !== request.versionId) {
                    return false;
                }
                const startTime = new Date();
                const updatedCompletions = await (0, provideInlineCompletions_1.provideInlineCompletions)(this.languageFeaturesService.inlineCompletionsProvider, position, this.textModel, context, source.token, this.languageConfigurationService);
                if (source.token.isCancellationRequested || this.textModel.getVersionId() !== request.versionId) {
                    return false;
                }
                const endTime = new Date();
                this._debounceValue.update(this.textModel, endTime.getTime() - startTime.getTime());
                const completions = new UpToDateInlineCompletions(updatedCompletions, request, this.textModel, this.versionId);
                if (activeInlineCompletion) {
                    const asInlineCompletion = activeInlineCompletion.toInlineCompletion(undefined);
                    if (activeInlineCompletion.canBeReused(this.textModel, position) && !updatedCompletions.has(asInlineCompletion)) {
                        completions.prepend(activeInlineCompletion.inlineCompletion, asInlineCompletion.range, true);
                    }
                }
                this._updateOperation.clear();
                (0, observable_1.transaction)(tx => {
                    /** @description Update completions with provider result */
                    target.set(completions, tx);
                });
                return true;
            })();
            const updateOperation = new UpdateOperation(request, source, promise);
            this._updateOperation.value = updateOperation;
            return promise;
        }
        clear(tx) {
            this._updateOperation.clear();
            this.inlineCompletions.set(undefined, tx);
            this.suggestWidgetInlineCompletions.set(undefined, tx);
        }
        clearSuggestWidgetInlineCompletions(tx) {
            if (this._updateOperation.value?.request.context.selectedSuggestionInfo) {
                this._updateOperation.clear();
            }
            this.suggestWidgetInlineCompletions.set(undefined, tx);
        }
        cancelUpdate() {
            this._updateOperation.clear();
        }
    };
    exports.InlineCompletionsSource = InlineCompletionsSource;
    exports.InlineCompletionsSource = InlineCompletionsSource = __decorate([
        __param(3, languageFeatures_1.ILanguageFeaturesService),
        __param(4, languageConfigurationRegistry_1.ILanguageConfigurationService)
    ], InlineCompletionsSource);
    function wait(ms, cancellationToken) {
        return new Promise(resolve => {
            let d = undefined;
            const handle = setTimeout(() => {
                if (d) {
                    d.dispose();
                }
                resolve();
            }, ms);
            if (cancellationToken) {
                d = cancellationToken.onCancellationRequested(() => {
                    clearTimeout(handle);
                    if (d) {
                        d.dispose();
                    }
                    resolve();
                });
            }
        });
    }
    class UpdateRequest {
        constructor(position, context, versionId) {
            this.position = position;
            this.context = context;
            this.versionId = versionId;
        }
        satisfies(other) {
            return this.position.equals(other.position)
                && equals(this.context.selectedSuggestionInfo, other.context.selectedSuggestionInfo, (v1, v2) => v1.equals(v2))
                && (other.context.triggerKind === languages_1.InlineCompletionTriggerKind.Automatic
                    || this.context.triggerKind === languages_1.InlineCompletionTriggerKind.Explicit)
                && this.versionId === other.versionId;
        }
    }
    function equals(v1, v2, equals) {
        if (!v1 || !v2) {
            return v1 === v2;
        }
        return equals(v1, v2);
    }
    class UpdateOperation {
        constructor(request, cancellationTokenSource, promise) {
            this.request = request;
            this.cancellationTokenSource = cancellationTokenSource;
            this.promise = promise;
        }
        dispose() {
            this.cancellationTokenSource.cancel();
        }
    }
    class UpToDateInlineCompletions {
        get inlineCompletions() { return this._inlineCompletions; }
        constructor(inlineCompletionProviderResult, request, textModel, versionId) {
            this.inlineCompletionProviderResult = inlineCompletionProviderResult;
            this.request = request;
            this.textModel = textModel;
            this.versionId = versionId;
            this._refCount = 1;
            this._prependedInlineCompletionItems = [];
            this._rangeVersionIdValue = 0;
            this._rangeVersionId = (0, observable_1.derived)(this, reader => {
                this.versionId.read(reader);
                let changed = false;
                for (const i of this._inlineCompletions) {
                    changed = changed || i._updateRange(this.textModel);
                }
                if (changed) {
                    this._rangeVersionIdValue++;
                }
                return this._rangeVersionIdValue;
            });
            const ids = textModel.deltaDecorations([], inlineCompletionProviderResult.completions.map(i => ({
                range: i.range,
                options: {
                    description: 'inline-completion-tracking-range'
                },
            })));
            this._inlineCompletions = inlineCompletionProviderResult.completions.map((i, index) => new InlineCompletionWithUpdatedRange(i, ids[index], this._rangeVersionId));
        }
        clone() {
            this._refCount++;
            return this;
        }
        dispose() {
            this._refCount--;
            if (this._refCount === 0) {
                setTimeout(() => {
                    // To fix https://github.com/microsoft/vscode/issues/188348
                    if (!this.textModel.isDisposed()) {
                        // This is just cleanup. It's ok if it happens with a delay.
                        this.textModel.deltaDecorations(this._inlineCompletions.map(i => i.decorationId), []);
                    }
                }, 0);
                this.inlineCompletionProviderResult.dispose();
                for (const i of this._prependedInlineCompletionItems) {
                    i.source.removeRef();
                }
            }
        }
        prepend(inlineCompletion, range, addRefToSource) {
            if (addRefToSource) {
                inlineCompletion.source.addRef();
            }
            const id = this.textModel.deltaDecorations([], [{
                    range,
                    options: {
                        description: 'inline-completion-tracking-range'
                    },
                }])[0];
            this._inlineCompletions.unshift(new InlineCompletionWithUpdatedRange(inlineCompletion, id, this._rangeVersionId, range));
            this._prependedInlineCompletionItems.push(inlineCompletion);
        }
    }
    exports.UpToDateInlineCompletions = UpToDateInlineCompletions;
    class InlineCompletionWithUpdatedRange {
        get forwardStable() {
            return this.inlineCompletion.source.inlineCompletions.enableForwardStability ?? false;
        }
        constructor(inlineCompletion, decorationId, rangeVersion, initialRange) {
            this.inlineCompletion = inlineCompletion;
            this.decorationId = decorationId;
            this.rangeVersion = rangeVersion;
            this.semanticId = JSON.stringify([
                this.inlineCompletion.filterText,
                this.inlineCompletion.insertText,
                this.inlineCompletion.range.getStartPosition().toString()
            ]);
            this._isValid = true;
            this._updatedRange = initialRange ?? inlineCompletion.range;
        }
        toInlineCompletion(reader) {
            return this.inlineCompletion.withRange(this._getUpdatedRange(reader));
        }
        toSingleTextEdit(reader) {
            return new singleTextEdit_1.SingleTextEdit(this._getUpdatedRange(reader), this.inlineCompletion.insertText);
        }
        isVisible(model, cursorPosition, reader) {
            const minimizedReplacement = this._toFilterTextReplacement(reader).removeCommonPrefix(model);
            if (!this._isValid
                || !this.inlineCompletion.range.getStartPosition().equals(this._getUpdatedRange(reader).getStartPosition())
                || cursorPosition.lineNumber !== minimizedReplacement.range.startLineNumber) {
                return false;
            }
            const originalValue = model.getValueInRange(minimizedReplacement.range, 1 /* EndOfLinePreference.LF */).toLowerCase();
            const filterText = minimizedReplacement.text.toLowerCase();
            const cursorPosIndex = Math.max(0, cursorPosition.column - minimizedReplacement.range.startColumn);
            let filterTextBefore = filterText.substring(0, cursorPosIndex);
            let filterTextAfter = filterText.substring(cursorPosIndex);
            let originalValueBefore = originalValue.substring(0, cursorPosIndex);
            let originalValueAfter = originalValue.substring(cursorPosIndex);
            const originalValueIndent = model.getLineIndentColumn(minimizedReplacement.range.startLineNumber);
            if (minimizedReplacement.range.startColumn <= originalValueIndent) {
                // Remove indentation
                originalValueBefore = originalValueBefore.trimStart();
                if (originalValueBefore.length === 0) {
                    originalValueAfter = originalValueAfter.trimStart();
                }
                filterTextBefore = filterTextBefore.trimStart();
                if (filterTextBefore.length === 0) {
                    filterTextAfter = filterTextAfter.trimStart();
                }
            }
            return filterTextBefore.startsWith(originalValueBefore)
                && !!(0, filters_1.matchesSubString)(originalValueAfter, filterTextAfter);
        }
        canBeReused(model, position) {
            const result = this._isValid
                && this._getUpdatedRange(undefined).containsPosition(position)
                && this.isVisible(model, position, undefined)
                && !this._isSmallerThanOriginal(undefined);
            return result;
        }
        _toFilterTextReplacement(reader) {
            return new singleTextEdit_1.SingleTextEdit(this._getUpdatedRange(reader), this.inlineCompletion.filterText);
        }
        _isSmallerThanOriginal(reader) {
            return length(this._getUpdatedRange(reader)).isBefore(length(this.inlineCompletion.range));
        }
        _getUpdatedRange(reader) {
            this.rangeVersion.read(reader); // This makes sure all the ranges are updated.
            return this._updatedRange;
        }
        _updateRange(textModel) {
            const range = textModel.getDecorationRange(this.decorationId);
            if (!range) {
                // A setValue call might flush all decorations.
                this._isValid = false;
                return true;
            }
            if (!this._updatedRange.equalsRange(range)) {
                this._updatedRange = range;
                return true;
            }
            return false;
        }
    }
    exports.InlineCompletionWithUpdatedRange = InlineCompletionWithUpdatedRange;
    function length(range) {
        if (range.startLineNumber === range.endLineNumber) {
            return new position_1.Position(1, 1 + range.endColumn - range.startColumn);
        }
        else {
            return new position_1.Position(1 + range.endLineNumber - range.startLineNumber, range.endColumn);
        }
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5saW5lQ29tcGxldGlvbnNTb3VyY2UuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9lZGl0b3IvY29udHJpYi9pbmxpbmVDb21wbGV0aW9ucy9icm93c2VyL2lubGluZUNvbXBsZXRpb25zU291cmNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQWdCekYsSUFBTSx1QkFBdUIsR0FBN0IsTUFBTSx1QkFBd0IsU0FBUSxzQkFBVTtRQUt0RCxZQUNrQixTQUFxQixFQUNyQixTQUE4QixFQUM5QixjQUEyQyxFQUNsQyx1QkFBa0UsRUFDN0QsNEJBQTRFO1lBRTNHLEtBQUssRUFBRSxDQUFDO1lBTlMsY0FBUyxHQUFULFNBQVMsQ0FBWTtZQUNyQixjQUFTLEdBQVQsU0FBUyxDQUFxQjtZQUM5QixtQkFBYyxHQUFkLGNBQWMsQ0FBNkI7WUFDakIsNEJBQXVCLEdBQXZCLHVCQUF1QixDQUEwQjtZQUM1QyxpQ0FBNEIsR0FBNUIsNEJBQTRCLENBQStCO1lBVDNGLHFCQUFnQixHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSw2QkFBaUIsRUFBbUIsQ0FBQyxDQUFDO1lBQzdFLHNCQUFpQixHQUFHLElBQUEsc0NBQXlCLEVBQXdDLG1CQUFtQixFQUFFLFNBQVMsQ0FBQyxDQUFDO1lBQ3JILG1DQUE4QixHQUFHLElBQUEsc0NBQXlCLEVBQXdDLGdDQUFnQyxFQUFFLFNBQVMsQ0FBQyxDQUFDO1lBVzlKLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxrQkFBa0IsQ0FBQyxHQUFHLEVBQUU7Z0JBQ3JELElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxLQUFLLEVBQUUsQ0FBQztZQUMvQixDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ0wsQ0FBQztRQUVNLEtBQUssQ0FBQyxRQUFrQixFQUFFLE9BQWdDLEVBQUUsc0JBQW9FO1lBQ3RJ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