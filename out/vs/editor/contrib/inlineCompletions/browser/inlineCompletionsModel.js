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
define(["require", "exports", "vs/base/common/arraysFind", "vs/base/common/errors", "vs/base/common/lifecycle", "vs/base/common/observable", "vs/base/common/types", "vs/editor/common/core/editOperation", "vs/editor/common/core/position", "vs/editor/common/core/range", "vs/editor/common/languages", "vs/editor/common/languages/languageConfigurationRegistry", "vs/editor/contrib/inlineCompletions/browser/ghostText", "vs/editor/contrib/inlineCompletions/browser/inlineCompletionsSource", "vs/editor/contrib/inlineCompletions/browser/utils", "vs/editor/contrib/snippet/browser/snippetController2", "vs/platform/commands/common/commands", "vs/platform/instantiation/common/instantiation"], function (require, exports, arraysFind_1, errors_1, lifecycle_1, observable_1, types_1, editOperation_1, position_1, range_1, languages_1, languageConfigurationRegistry_1, ghostText_1, inlineCompletionsSource_1, utils_1, snippetController2_1, commands_1, instantiation_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.InlineCompletionsModel = exports.VersionIdChangeReason = void 0;
    var VersionIdChangeReason;
    (function (VersionIdChangeReason) {
        VersionIdChangeReason[VersionIdChangeReason["Undo"] = 0] = "Undo";
        VersionIdChangeReason[VersionIdChangeReason["Redo"] = 1] = "Redo";
        VersionIdChangeReason[VersionIdChangeReason["AcceptWord"] = 2] = "AcceptWord";
        VersionIdChangeReason[VersionIdChangeReason["Other"] = 3] = "Other";
    })(VersionIdChangeReason || (exports.VersionIdChangeReason = VersionIdChangeReason = {}));
    let InlineCompletionsModel = class InlineCompletionsModel extends lifecycle_1.Disposable {
        get isAcceptingPartially() { return this._isAcceptingPartially; }
        constructor(textModel, selectedSuggestItem, cursorPosition, textModelVersionId, _debounceValue, _suggestPreviewEnabled, _suggestPreviewMode, _inlineSuggestMode, _enabled, _instantiationService, _commandService, _languageConfigurationService) {
            super();
            this.textModel = textModel;
            this.selectedSuggestItem = selectedSuggestItem;
            this.cursorPosition = cursorPosition;
            this.textModelVersionId = textModelVersionId;
            this._debounceValue = _debounceValue;
            this._suggestPreviewEnabled = _suggestPreviewEnabled;
            this._suggestPreviewMode = _suggestPreviewMode;
            this._inlineSuggestMode = _inlineSuggestMode;
            this._enabled = _enabled;
            this._instantiationService = _instantiationService;
            this._commandService = _commandService;
            this._languageConfigurationService = _languageConfigurationService;
            this._source = this._register(this._instantiationService.createInstance(inlineCompletionsSource_1.InlineCompletionsSource, this.textModel, this.textModelVersionId, this._debounceValue));
            this._isActive = (0, observable_1.observableValue)(this, false);
            this._forceUpdate = (0, observable_1.observableSignal)('forceUpdate');
            // We use a semantic id to keep the same inline completion selected even if the provider reorders the completions.
            this._selectedInlineCompletionId = (0, observable_1.observableValue)(this, undefined);
            this._isAcceptingPartially = false;
            this._preserveCurrentCompletionReasons = new Set([
                VersionIdChangeReason.Redo,
                VersionIdChangeReason.Undo,
                VersionIdChangeReason.AcceptWord,
            ]);
            this._fetchInlineCompletions = (0, observable_1.derivedHandleChanges)({
                owner: this,
                createEmptyChangeSummary: () => ({
                    preserveCurrentCompletion: false,
                    inlineCompletionTriggerKind: languages_1.InlineCompletionTriggerKind.Automatic
                }),
                handleChange: (ctx, changeSummary) => {
                    /** @description fetch inline completions */
                    if (ctx.didChange(this.textModelVersionId) && this._preserveCurrentCompletionReasons.has(ctx.change)) {
                        changeSummary.preserveCurrentCompletion = true;
                    }
                    else if (ctx.didChange(this._forceUpdate)) {
                        changeSummary.inlineCompletionTriggerKind = ctx.change;
                    }
                    return true;
                },
            }, (reader, changeSummary) => {
                this._forceUpdate.read(reader);
                const shouldUpdate = (this._enabled.read(reader) && this.selectedSuggestItem.read(reader)) || this._isActive.read(reader);
                if (!shouldUpdate) {
                    this._source.cancelUpdate();
                    return undefined;
                }
                this.textModelVersionId.read(reader); // Refetch on text change
                const itemToPreserveCandidate = this.selectedInlineCompletion.get();
                const itemToPreserve = changeSummary.preserveCurrentCompletion || itemToPreserveCandidate?.forwardStable
                    ? itemToPreserveCandidate : undefined;
                const suggestWidgetInlineCompletions = this._source.suggestWidgetInlineCompletions.get();
                const suggestItem = this.selectedSuggestItem.read(reader);
                if (suggestWidgetInlineCompletions && !suggestItem) {
                    const inlineCompletions = this._source.inlineCompletions.get();
                    (0, observable_1.transaction)(tx => {
                        /** @description Seed inline completions with (newer) suggest widget inline completions */
                        if (inlineCompletions && suggestWidgetInlineCompletions.request.versionId > inlineCompletions.request.versionId) {
                            this._source.inlineCompletions.set(suggestWidgetInlineCompletions.clone(), tx);
                        }
                        this._source.clearSuggestWidgetInlineCompletions(tx);
                    });
                }
                const cursorPosition = this.cursorPosition.read(reader);
                const context = {
                    triggerKind: changeSummary.inlineCompletionTriggerKind,
                    selectedSuggestionInfo: suggestItem?.toSelectedSuggestionInfo(),
                };
                return this._source.fetch(cursorPosition, context, itemToPreserve);
            });
            this._filteredInlineCompletionItems = (0, observable_1.derived)(this, reader => {
                const c = this._source.inlineCompletions.read(reader);
                if (!c) {
                    return [];
                }
                const cursorPosition = this.cursorPosition.read(reader);
                const filteredCompletions = c.inlineCompletions.filter(c => c.isVisible(this.textModel, cursorPosition, reader));
                return filteredCompletions;
            });
            this.selectedInlineCompletionIndex = (0, observable_1.derived)(this, (reader) => {
                const selectedInlineCompletionId = this._selectedInlineCompletionId.read(reader);
                const filteredCompletions = this._filteredInlineCompletionItems.read(reader);
                const idx = this._selectedInlineCompletionId === undefined ? -1
                    : filteredCompletions.findIndex(v => v.semanticId === selectedInlineCompletionId);
                if (idx === -1) {
                    // Reset the selection so that the selection does not jump back when it appears again
                    this._selectedInlineCompletionId.set(undefined, undefined);
                    return 0;
                }
                return idx;
            });
            this.selectedInlineCompletion = (0, observable_1.derived)(this, (reader) => {
                const filteredCompletions = this._filteredInlineCompletionItems.read(reader);
                const idx = this.selectedInlineCompletionIndex.read(reader);
                return filteredCompletions[idx];
            });
            this.lastTriggerKind = this._source.inlineCompletions.map(v => /** @description lastTriggerKind */ v?.request.context.triggerKind);
            this.inlineCompletionsCount = (0, observable_1.derived)(this, reader => {
                if (this.lastTriggerKind.read(reader) === languages_1.InlineCompletionTriggerKind.Explicit) {
                    return this._filteredInlineCompletionItems.read(reader).length;
                }
                else {
                    return undefined;
                }
            });
            this.state = (0, observable_1.derivedOpts)({
                owner: this,
                equalityComparer: (a, b) => {
                    if (!a || !b) {
                        return a === b;
                    }
                    return (0, ghostText_1.ghostTextOrReplacementEquals)(a.ghostText, b.ghostText)
                        && a.inlineCompletion === b.inlineCompletion
                        && a.suggestItem === b.suggestItem;
                }
            }, (reader) => {
                const model = this.textModel;
                const suggestItem = this.selectedSuggestItem.read(reader);
                if (suggestItem) {
                    const suggestCompletion = suggestItem.toSingleTextEdit().removeCommonPrefix(model);
                    const augmentedCompletion = this._computeAugmentedCompletion(suggestCompletion, reader);
                    const isSuggestionPreviewEnabled = this._suggestPreviewEnabled.read(reader);
                    if (!isSuggestionPreviewEnabled && !augmentedCompletion) {
                        return undefined;
                    }
                    const edit = augmentedCompletion?.edit ?? suggestCompletion;
                    const editPreviewLength = augmentedCompletion ? augmentedCompletion.edit.text.length - suggestCompletion.text.length : 0;
                    const mode = this._suggestPreviewMode.read(reader);
                    const cursor = this.cursorPosition.read(reader);
                    const newGhostText = edit.computeGhostText(model, mode, cursor, editPreviewLength);
                    // Show an invisible ghost text to reserve space
                    const ghostText = newGhostText ?? new ghostText_1.GhostText(edit.range.endLineNumber, []);
                    return { ghostText, inlineCompletion: augmentedCompletion?.completion, suggestItem };
                }
                else {
                    if (!this._isActive.read(reader)) {
                        return undefined;
                    }
                    const item = this.selectedInlineCompletion.read(reader);
                    if (!item) {
                        return undefined;
                    }
                    const replacement = item.toSingleTextEdit(reader);
                    const mode = this._inlineSuggestMode.read(reader);
                    const cursor = this.cursorPosition.read(reader);
                    const ghostText = replacement.computeGhostText(model, mode, cursor);
                    return ghostText ? { ghostText, inlineCompletion: item, suggestItem: undefined } : undefined;
                }
            });
            this.ghostText = (0, observable_1.derivedOpts)({
                owner: this,
                equalityComparer: ghostText_1.ghostTextOrReplacementEquals
            }, reader => {
                const v = this.state.read(reader);
                if (!v) {
                    return undefined;
                }
                return v.ghostText;
            });
            this._register((0, observable_1.recomputeInitiallyAndOnChange)(this._fetchInlineCompletions));
            let lastItem = undefined;
            this._register((0, observable_1.autorun)(reader => {
                /** @description call handleItemDidShow */
                const item = this.state.read(reader);
                const completion = item?.inlineCompletion;
                if (completion?.semanticId !== lastItem?.semanticId) {
                    lastItem = completion;
                    if (completion) {
                        const i = completion.inlineCompletion;
                        const src = i.source;
                        src.provider.handleItemDidShow?.(src.inlineCompletions, i.sourceInlineCompletion, i.insertText);
                    }
                }
            }));
        }
        async trigger(tx) {
            this._isActive.set(true, tx);
            await this._fetchInlineCompletions.get();
        }
        async triggerExplicitly(tx) {
            (0, observable_1.subtransaction)(tx, tx => {
                this._isActive.set(true, tx);
                this._forceUpdate.trigger(tx, languages_1.InlineCompletionTriggerKind.Explicit);
            });
            await this._fetchInlineCompletions.get();
        }
        stop(tx) {
            (0, observable_1.subtransaction)(tx, tx => {
                this._isActive.set(false, tx);
                this._source.clear(tx);
            });
        }
        _computeAugmentedCompletion(suggestCompletion, reader) {
            const model = this.textModel;
            const suggestWidgetInlineCompletions = this._source.suggestWidgetInlineCompletions.read(reader);
            const candidateInlineCompletions = suggestWidgetInlineCompletions
                ? suggestWidgetInlineCompletions.inlineCompletions
                : [this.selectedInlineCompletion.read(reader)].filter(types_1.isDefined);
            const augmentedCompletion = (0, arraysFind_1.mapFindFirst)(candidateInlineCompletions, completion => {
                let r = completion.toSingleTextEdit(reader);
                r = r.removeCommonPrefix(model, range_1.Range.fromPositions(r.range.getStartPosition(), suggestCompletion.range.getEndPosition()));
                return r.augments(suggestCompletion) ? { edit: r, completion } : undefined;
            });
            return augmentedCompletion;
        }
        async _deltaSelectedInlineCompletionIndex(delta) {
            await this.triggerExplicitly();
            const completions = this._filteredInlineCompletionItems.get() || [];
            if (completions.length > 0) {
                const newIdx = (this.selectedInlineCompletionIndex.get() + delta + completions.length) % completions.length;
                this._selectedInlineCompletionId.set(completions[newIdx].semanticId, undefined);
            }
            else {
                this._selectedInlineCompletionId.set(undefined, undefined);
            }
        }
        async next() {
            await this._deltaSelectedInlineCompletionIndex(1);
        }
        async previous() {
            await this._deltaSelectedInlineCompletionIndex(-1);
        }
        async accept(editor) {
            if (editor.getModel() !== this.textModel) {
                throw new errors_1.BugIndicatingError();
            }
            const state = this.state.get();
            if (!state || state.ghostText.isEmpty() || !state.inlineCompletion) {
                return;
            }
            const completion = state.inlineCompletion.toInlineCompletion(undefined);
            editor.pushUndoStop();
            if (completion.snippetInfo) {
                editor.executeEdits('inlineSuggestion.accept', [
                    editOperation_1.EditOperation.replaceMove(completion.range, ''),
                    ...completion.additionalTextEdits
                ]);
                editor.setPosition(completion.snippetInfo.range.getStartPosition());
                snippetController2_1.SnippetController2.get(editor)?.insert(completion.snippetInfo.snippet, { undoStopBefore: false });
            }
            else {
                editor.executeEdits('inlineSuggestion.accept', [
                    editOperation_1.EditOperation.replaceMove(completion.range, completion.insertText),
                    ...completion.additionalTextEdits
                ]);
            }
            if (completion.command) {
                // Make sure the completion list will not be disposed.
                completion.source.addRef();
            }
            // Reset before invoking the command, since the command might cause a follow up trigger.
            (0, observable_1.transaction)(tx => {
                this._source.clear(tx);
                // Potentially, isActive will get set back to true by the typing or accept inline suggest event
                // if automatic inline suggestions are enabled.
                this._isActive.set(false, tx);
            });
            if (completion.command) {
                await this._commandService
                    .executeCommand(completion.command.id, ...(completion.command.arguments || []))
                    .then(undefined, errors_1.onUnexpectedExternalError);
                completion.source.removeRef();
            }
        }
        async acceptNextWord(editor) {
            await this._acceptNext(editor, (pos, text) => {
                const langId = this.textModel.getLanguageIdAtPosition(pos.lineNumber, pos.column);
                const config = this._languageConfigurationService.getLanguageConfiguration(langId);
                const wordRegExp = new RegExp(config.wordDefinition.source, config.wordDefinition.flags.replace('g', ''));
                const m1 = text.match(wordRegExp);
                let acceptUntilIndexExclusive = 0;
                if (m1 && m1.index !== undefined) {
                    if (m1.index === 0) {
                        acceptUntilIndexExclusive = m1[0].length;
                    }
                    else {
                        acceptUntilIndexExclusive = m1.index;
                    }
                }
                else {
                    acceptUntilIndexExclusive = text.length;
                }
                const wsRegExp = /\s+/g;
                const m2 = wsRegExp.exec(text);
                if (m2 && m2.index !== undefined) {
                    if (m2.index + m2[0].length < acceptUntilIndexExclusive) {
                        acceptUntilIndexExclusive = m2.index + m2[0].length;
                    }
                }
                return acceptUntilIndexExclusive;
            });
        }
        async acceptNextLine(editor) {
            await this._acceptNext(editor, (pos, text) => {
                const m = text.match(/\n/);
                if (m && m.index !== undefined) {
                    return m.index + 1;
                }
                return text.length;
            });
        }
        async _acceptNext(editor, getAcceptUntilIndex) {
            if (editor.getModel() !== this.textModel) {
                throw new errors_1.BugIndicatingError();
            }
            const state = this.state.get();
            if (!state || state.ghostText.isEmpty() || !state.inlineCompletion) {
                return;
            }
            const ghostText = state.ghostText;
            const completion = state.inlineCompletion.toInlineCompletion(undefined);
            if (completion.snippetInfo || completion.filterText !== completion.insertText) {
                // not in WYSIWYG mode, partial commit might change completion, thus it is not supported
                await this.accept(editor);
                return;
            }
            const firstPart = ghostText.parts[0];
            const position = new position_1.Position(ghostText.lineNumber, firstPart.column);
            const line = firstPart.lines.join('\n');
            const acceptUntilIndexExclusive = getAcceptUntilIndex(position, line);
            if (acceptUntilIndexExclusive === line.length && ghostText.parts.length === 1) {
                this.accept(editor);
                return;
            }
            const partialText = line.substring(0, acceptUntilIndexExclusive);
            this._isAcceptingPartially = true;
            try {
                editor.pushUndoStop();
                editor.executeEdits('inlineSuggestion.accept', [
                    editOperation_1.EditOperation.replace(range_1.Range.fromPositions(position), partialText),
                ]);
                const length = (0, utils_1.lengthOfText)(partialText);
                editor.setPosition((0, utils_1.addPositions)(position, length));
            }
            finally {
                this._isAcceptingPartially = false;
            }
            if (completion.source.provider.handlePartialAccept) {
                const acceptedRange = range_1.Range.fromPositions(completion.range.getStartPosition(), (0, utils_1.addPositions)(position, (0, utils_1.lengthOfText)(partialText)));
                // This assumes that the inline completion and the model use the same EOL style.
                const text = editor.getModel().getValueInRange(acceptedRange, 1 /* EndOfLinePreference.LF */);
                completion.source.provider.handlePartialAccept(completion.source.inlineCompletions, completion.sourceInlineCompletion, text.length);
            }
        }
        handleSuggestAccepted(item) {
            const itemEdit = item.toSingleTextEdit().removeCommonPrefix(this.textModel);
            const augmentedCompletion = this._computeAugmentedCompletion(itemEdit, undefined);
            if (!augmentedCompletion) {
                return;
            }
            const inlineCompletion = augmentedCompletion.completion.inlineCompletion;
            inlineCompletion.source.provider.handlePartialAccept?.(inlineCompletion.source.inlineCompletions, inlineCompletion.sourceInlineCompletion, itemEdit.text.length);
        }
    };
    exports.InlineCompletionsModel = InlineCompletionsModel;
    exports.InlineCompletionsModel = InlineCompletionsModel = __decorate([
        __param(9, instantiation_1.IInstantiationService),
        __param(10, commands_1.ICommandService),
        __param(11, languageConfigurationRegistry_1.ILanguageConfigurationService)
    ], InlineCompletionsModel);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5saW5lQ29tcGxldGlvbnNNb2RlbC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL2VkaXRvci9jb250cmliL2lubGluZUNvbXBsZXRpb25zL2Jyb3dzZXIvaW5saW5lQ29tcGxldGlvbnNNb2RlbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUF3QmhHLElBQVkscUJBS1g7SUFMRCxXQUFZLHFCQUFxQjtRQUNoQyxpRUFBSSxDQUFBO1FBQ0osaUVBQUksQ0FBQTtRQUNKLDZFQUFVLENBQUE7UUFDVixtRUFBSyxDQUFBO0lBQ04sQ0FBQyxFQUxXLHFCQUFxQixxQ0FBckIscUJBQXFCLFFBS2hDO0lBRU0sSUFBTSxzQkFBc0IsR0FBNUIsTUFBTSxzQkFBdUIsU0FBUSxzQkFBVTtRQVNyRCxJQUFXLG9CQUFvQixLQUFLLE9BQU8sSUFBSSxDQUFDLHFCQUFxQixDQUFDLENBQUMsQ0FBQztRQUV4RSxZQUNpQixTQUFxQixFQUNyQixtQkFBNkQsRUFDN0QsY0FBcUMsRUFDckMsa0JBQThELEVBQzdELGNBQTJDLEVBQzNDLHNCQUE0QyxFQUM1QyxtQkFBdUUsRUFDdkUsa0JBQXNFLEVBQ3RFLFFBQThCLEVBQ3hCLHFCQUE2RCxFQUNuRSxlQUFpRCxFQUNuQyw2QkFBNkU7WUFFNUcsS0FBSyxFQUFFLENBQUM7WUFiUSxjQUFTLEdBQVQsU0FBUyxDQUFZO1lBQ3JCLHdCQUFtQixHQUFuQixtQkFBbUIsQ0FBMEM7WUFDN0QsbUJBQWMsR0FBZCxjQUFjLENBQXVCO1lBQ3JDLHVCQUFrQixHQUFsQixrQkFBa0IsQ0FBNEM7WUFDN0QsbUJBQWMsR0FBZCxjQUFjLENBQTZCO1lBQzNDLDJCQUFzQixHQUF0QixzQkFBc0IsQ0FBc0I7WUFDNUMsd0JBQW1CLEdBQW5CLG1CQUFtQixDQUFvRDtZQUN2RSx1QkFBa0IsR0FBbEIsa0JBQWtCLENBQW9EO1lBQ3RF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