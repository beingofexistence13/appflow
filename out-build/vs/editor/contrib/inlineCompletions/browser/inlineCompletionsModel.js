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
    exports.$K6 = exports.VersionIdChangeReason = void 0;
    var VersionIdChangeReason;
    (function (VersionIdChangeReason) {
        VersionIdChangeReason[VersionIdChangeReason["Undo"] = 0] = "Undo";
        VersionIdChangeReason[VersionIdChangeReason["Redo"] = 1] = "Redo";
        VersionIdChangeReason[VersionIdChangeReason["AcceptWord"] = 2] = "AcceptWord";
        VersionIdChangeReason[VersionIdChangeReason["Other"] = 3] = "Other";
    })(VersionIdChangeReason || (exports.VersionIdChangeReason = VersionIdChangeReason = {}));
    let $K6 = class $K6 extends lifecycle_1.$kc {
        get isAcceptingPartially() { return this.n; }
        constructor(textModel, selectedSuggestItem, cursorPosition, textModelVersionId, s, t, u, w, y, z, C, D) {
            super();
            this.textModel = textModel;
            this.selectedSuggestItem = selectedSuggestItem;
            this.cursorPosition = cursorPosition;
            this.textModelVersionId = textModelVersionId;
            this.s = s;
            this.t = t;
            this.u = u;
            this.w = w;
            this.y = y;
            this.z = z;
            this.C = C;
            this.D = D;
            this.f = this.B(this.z.createInstance(inlineCompletionsSource_1.$L5, this.textModel, this.textModelVersionId, this.s));
            this.g = (0, observable_1.observableValue)(this, false);
            this.h = (0, observable_1.observableSignal)('forceUpdate');
            // We use a semantic id to keep the same inline completion selected even if the provider reorders the completions.
            this.j = (0, observable_1.observableValue)(this, undefined);
            this.n = false;
            this.F = new Set([
                VersionIdChangeReason.Redo,
                VersionIdChangeReason.Undo,
                VersionIdChangeReason.AcceptWord,
            ]);
            this.G = (0, observable_1.derivedHandleChanges)({
                owner: this,
                createEmptyChangeSummary: () => ({
                    preserveCurrentCompletion: false,
                    inlineCompletionTriggerKind: languages_1.InlineCompletionTriggerKind.Automatic
                }),
                handleChange: (ctx, changeSummary) => {
                    /** @description fetch inline completions */
                    if (ctx.didChange(this.textModelVersionId) && this.F.has(ctx.change)) {
                        changeSummary.preserveCurrentCompletion = true;
                    }
                    else if (ctx.didChange(this.h)) {
                        changeSummary.inlineCompletionTriggerKind = ctx.change;
                    }
                    return true;
                },
            }, (reader, changeSummary) => {
                this.h.read(reader);
                const shouldUpdate = (this.y.read(reader) && this.selectedSuggestItem.read(reader)) || this.g.read(reader);
                if (!shouldUpdate) {
                    this.f.cancelUpdate();
                    return undefined;
                }
                this.textModelVersionId.read(reader); // Refetch on text change
                const itemToPreserveCandidate = this.selectedInlineCompletion.get();
                const itemToPreserve = changeSummary.preserveCurrentCompletion || itemToPreserveCandidate?.forwardStable
                    ? itemToPreserveCandidate : undefined;
                const suggestWidgetInlineCompletions = this.f.suggestWidgetInlineCompletions.get();
                const suggestItem = this.selectedSuggestItem.read(reader);
                if (suggestWidgetInlineCompletions && !suggestItem) {
                    const inlineCompletions = this.f.inlineCompletions.get();
                    (0, observable_1.transaction)(tx => {
                        /** @description Seed inline completions with (newer) suggest widget inline completions */
                        if (inlineCompletions && suggestWidgetInlineCompletions.request.versionId > inlineCompletions.request.versionId) {
                            this.f.inlineCompletions.set(suggestWidgetInlineCompletions.clone(), tx);
                        }
                        this.f.clearSuggestWidgetInlineCompletions(tx);
                    });
                }
                const cursorPosition = this.cursorPosition.read(reader);
                const context = {
                    triggerKind: changeSummary.inlineCompletionTriggerKind,
                    selectedSuggestionInfo: suggestItem?.toSelectedSuggestionInfo(),
                };
                return this.f.fetch(cursorPosition, context, itemToPreserve);
            });
            this.H = (0, observable_1.derived)(this, reader => {
                const c = this.f.inlineCompletions.read(reader);
                if (!c) {
                    return [];
                }
                const cursorPosition = this.cursorPosition.read(reader);
                const filteredCompletions = c.inlineCompletions.filter(c => c.isVisible(this.textModel, cursorPosition, reader));
                return filteredCompletions;
            });
            this.selectedInlineCompletionIndex = (0, observable_1.derived)(this, (reader) => {
                const selectedInlineCompletionId = this.j.read(reader);
                const filteredCompletions = this.H.read(reader);
                const idx = this.j === undefined ? -1
                    : filteredCompletions.findIndex(v => v.semanticId === selectedInlineCompletionId);
                if (idx === -1) {
                    // Reset the selection so that the selection does not jump back when it appears again
                    this.j.set(undefined, undefined);
                    return 0;
                }
                return idx;
            });
            this.selectedInlineCompletion = (0, observable_1.derived)(this, (reader) => {
                const filteredCompletions = this.H.read(reader);
                const idx = this.selectedInlineCompletionIndex.read(reader);
                return filteredCompletions[idx];
            });
            this.lastTriggerKind = this.f.inlineCompletions.map(v => /** @description lastTriggerKind */ v?.request.context.triggerKind);
            this.inlineCompletionsCount = (0, observable_1.derived)(this, reader => {
                if (this.lastTriggerKind.read(reader) === languages_1.InlineCompletionTriggerKind.Explicit) {
                    return this.H.read(reader).length;
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
                    return (0, ghostText_1.$t5)(a.ghostText, b.ghostText)
                        && a.inlineCompletion === b.inlineCompletion
                        && a.suggestItem === b.suggestItem;
                }
            }, (reader) => {
                const model = this.textModel;
                const suggestItem = this.selectedSuggestItem.read(reader);
                if (suggestItem) {
                    const suggestCompletion = suggestItem.toSingleTextEdit().removeCommonPrefix(model);
                    const augmentedCompletion = this.I(suggestCompletion, reader);
                    const isSuggestionPreviewEnabled = this.t.read(reader);
                    if (!isSuggestionPreviewEnabled && !augmentedCompletion) {
                        return undefined;
                    }
                    const edit = augmentedCompletion?.edit ?? suggestCompletion;
                    const editPreviewLength = augmentedCompletion ? augmentedCompletion.edit.text.length - suggestCompletion.text.length : 0;
                    const mode = this.u.read(reader);
                    const cursor = this.cursorPosition.read(reader);
                    const newGhostText = edit.computeGhostText(model, mode, cursor, editPreviewLength);
                    // Show an invisible ghost text to reserve space
                    const ghostText = newGhostText ?? new ghostText_1.$q5(edit.range.endLineNumber, []);
                    return { ghostText, inlineCompletion: augmentedCompletion?.completion, suggestItem };
                }
                else {
                    if (!this.g.read(reader)) {
                        return undefined;
                    }
                    const item = this.selectedInlineCompletion.read(reader);
                    if (!item) {
                        return undefined;
                    }
                    const replacement = item.toSingleTextEdit(reader);
                    const mode = this.w.read(reader);
                    const cursor = this.cursorPosition.read(reader);
                    const ghostText = replacement.computeGhostText(model, mode, cursor);
                    return ghostText ? { ghostText, inlineCompletion: item, suggestItem: undefined } : undefined;
                }
            });
            this.ghostText = (0, observable_1.derivedOpts)({
                owner: this,
                equalityComparer: ghostText_1.$t5
            }, reader => {
                const v = this.state.read(reader);
                if (!v) {
                    return undefined;
                }
                return v.ghostText;
            });
            this.B((0, observable_1.recomputeInitiallyAndOnChange)(this.G));
            let lastItem = undefined;
            this.B((0, observable_1.autorun)(reader => {
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
            this.g.set(true, tx);
            await this.G.get();
        }
        async triggerExplicitly(tx) {
            (0, observable_1.subtransaction)(tx, tx => {
                this.g.set(true, tx);
                this.h.trigger(tx, languages_1.InlineCompletionTriggerKind.Explicit);
            });
            await this.G.get();
        }
        stop(tx) {
            (0, observable_1.subtransaction)(tx, tx => {
                this.g.set(false, tx);
                this.f.clear(tx);
            });
        }
        I(suggestCompletion, reader) {
            const model = this.textModel;
            const suggestWidgetInlineCompletions = this.f.suggestWidgetInlineCompletions.read(reader);
            const candidateInlineCompletions = suggestWidgetInlineCompletions
                ? suggestWidgetInlineCompletions.inlineCompletions
                : [this.selectedInlineCompletion.read(reader)].filter(types_1.$rf);
            const augmentedCompletion = (0, arraysFind_1.$pb)(candidateInlineCompletions, completion => {
                let r = completion.toSingleTextEdit(reader);
                r = r.removeCommonPrefix(model, range_1.$ks.fromPositions(r.range.getStartPosition(), suggestCompletion.range.getEndPosition()));
                return r.augments(suggestCompletion) ? { edit: r, completion } : undefined;
            });
            return augmentedCompletion;
        }
        async J(delta) {
            await this.triggerExplicitly();
            const completions = this.H.get() || [];
            if (completions.length > 0) {
                const newIdx = (this.selectedInlineCompletionIndex.get() + delta + completions.length) % completions.length;
                this.j.set(completions[newIdx].semanticId, undefined);
            }
            else {
                this.j.set(undefined, undefined);
            }
        }
        async next() {
            await this.J(1);
        }
        async previous() {
            await this.J(-1);
        }
        async accept(editor) {
            if (editor.getModel() !== this.textModel) {
                throw new errors_1.$ab();
            }
            const state = this.state.get();
            if (!state || state.ghostText.isEmpty() || !state.inlineCompletion) {
                return;
            }
            const completion = state.inlineCompletion.toInlineCompletion(undefined);
            editor.pushUndoStop();
            if (completion.snippetInfo) {
                editor.executeEdits('inlineSuggestion.accept', [
                    editOperation_1.$ls.replaceMove(completion.range, ''),
                    ...completion.additionalTextEdits
                ]);
                editor.setPosition(completion.snippetInfo.range.getStartPosition());
                snippetController2_1.$05.get(editor)?.insert(completion.snippetInfo.snippet, { undoStopBefore: false });
            }
            else {
                editor.executeEdits('inlineSuggestion.accept', [
                    editOperation_1.$ls.replaceMove(completion.range, completion.insertText),
                    ...completion.additionalTextEdits
                ]);
            }
            if (completion.command) {
                // Make sure the completion list will not be disposed.
                completion.source.addRef();
            }
            // Reset before invoking the command, since the command might cause a follow up trigger.
            (0, observable_1.transaction)(tx => {
                this.f.clear(tx);
                // Potentially, isActive will get set back to true by the typing or accept inline suggest event
                // if automatic inline suggestions are enabled.
                this.g.set(false, tx);
            });
            if (completion.command) {
                await this.C
                    .executeCommand(completion.command.id, ...(completion.command.arguments || []))
                    .then(undefined, errors_1.$Z);
                completion.source.removeRef();
            }
        }
        async acceptNextWord(editor) {
            await this.L(editor, (pos, text) => {
                const langId = this.textModel.getLanguageIdAtPosition(pos.lineNumber, pos.column);
                const config = this.D.getLanguageConfiguration(langId);
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
            await this.L(editor, (pos, text) => {
                const m = text.match(/\n/);
                if (m && m.index !== undefined) {
                    return m.index + 1;
                }
                return text.length;
            });
        }
        async L(editor, getAcceptUntilIndex) {
            if (editor.getModel() !== this.textModel) {
                throw new errors_1.$ab();
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
            const position = new position_1.$js(ghostText.lineNumber, firstPart.column);
            const line = firstPart.lines.join('\n');
            const acceptUntilIndexExclusive = getAcceptUntilIndex(position, line);
            if (acceptUntilIndexExclusive === line.length && ghostText.parts.length === 1) {
                this.accept(editor);
                return;
            }
            const partialText = line.substring(0, acceptUntilIndexExclusive);
            this.n = true;
            try {
                editor.pushUndoStop();
                editor.executeEdits('inlineSuggestion.accept', [
                    editOperation_1.$ls.replace(range_1.$ks.fromPositions(position), partialText),
                ]);
                const length = (0, utils_1.$p5)(partialText);
                editor.setPosition((0, utils_1.$o5)(position, length));
            }
            finally {
                this.n = false;
            }
            if (completion.source.provider.handlePartialAccept) {
                const acceptedRange = range_1.$ks.fromPositions(completion.range.getStartPosition(), (0, utils_1.$o5)(position, (0, utils_1.$p5)(partialText)));
                // This assumes that the inline completion and the model use the same EOL style.
                const text = editor.getModel().getValueInRange(acceptedRange, 1 /* EndOfLinePreference.LF */);
                completion.source.provider.handlePartialAccept(completion.source.inlineCompletions, completion.sourceInlineCompletion, text.length);
            }
        }
        handleSuggestAccepted(item) {
            const itemEdit = item.toSingleTextEdit().removeCommonPrefix(this.textModel);
            const augmentedCompletion = this.I(itemEdit, undefined);
            if (!augmentedCompletion) {
                return;
            }
            const inlineCompletion = augmentedCompletion.completion.inlineCompletion;
            inlineCompletion.source.provider.handlePartialAccept?.(inlineCompletion.source.inlineCompletions, inlineCompletion.sourceInlineCompletion, itemEdit.text.length);
        }
    };
    exports.$K6 = $K6;
    exports.$K6 = $K6 = __decorate([
        __param(9, instantiation_1.$Ah),
        __param(10, commands_1.$Fr),
        __param(11, languageConfigurationRegistry_1.$2t)
    ], $K6);
});
//# sourceMappingURL=inlineCompletionsModel.js.map