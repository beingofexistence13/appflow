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
    exports.$N5 = exports.$M5 = exports.$L5 = void 0;
    let $L5 = class $L5 extends lifecycle_1.$kc {
        constructor(b, c, f, g, h) {
            super();
            this.b = b;
            this.c = c;
            this.f = f;
            this.g = g;
            this.h = h;
            this.a = this.B(new lifecycle_1.$lc());
            this.inlineCompletions = (0, observable_1.disposableObservableValue)('inlineCompletions', undefined);
            this.suggestWidgetInlineCompletions = (0, observable_1.disposableObservableValue)('suggestWidgetInlineCompletions', undefined);
            this.B(this.b.onDidChangeContent(() => {
                this.a.clear();
            }));
        }
        fetch(position, context, activeInlineCompletion) {
            const request = new UpdateRequest(position, context, this.b.getVersionId());
            const target = context.selectedSuggestionInfo ? this.suggestWidgetInlineCompletions : this.inlineCompletions;
            if (this.a.value?.request.satisfies(request)) {
                return this.a.value.promise;
            }
            else if (target.get()?.request.satisfies(request)) {
                return Promise.resolve(true);
            }
            const updateOngoing = !!this.a.value;
            this.a.clear();
            const source = new cancellation_1.$pd();
            const promise = (async () => {
                const shouldDebounce = updateOngoing || context.triggerKind === languages_1.InlineCompletionTriggerKind.Automatic;
                if (shouldDebounce) {
                    // This debounces the operation
                    await wait(this.f.get(this.b));
                }
                if (source.token.isCancellationRequested || this.b.getVersionId() !== request.versionId) {
                    return false;
                }
                const startTime = new Date();
                const updatedCompletions = await (0, provideInlineCompletions_1.$H5)(this.g.inlineCompletionsProvider, position, this.b, context, source.token, this.h);
                if (source.token.isCancellationRequested || this.b.getVersionId() !== request.versionId) {
                    return false;
                }
                const endTime = new Date();
                this.f.update(this.b, endTime.getTime() - startTime.getTime());
                const completions = new $M5(updatedCompletions, request, this.b, this.c);
                if (activeInlineCompletion) {
                    const asInlineCompletion = activeInlineCompletion.toInlineCompletion(undefined);
                    if (activeInlineCompletion.canBeReused(this.b, position) && !updatedCompletions.has(asInlineCompletion)) {
                        completions.prepend(activeInlineCompletion.inlineCompletion, asInlineCompletion.range, true);
                    }
                }
                this.a.clear();
                (0, observable_1.transaction)(tx => {
                    /** @description Update completions with provider result */
                    target.set(completions, tx);
                });
                return true;
            })();
            const updateOperation = new UpdateOperation(request, source, promise);
            this.a.value = updateOperation;
            return promise;
        }
        clear(tx) {
            this.a.clear();
            this.inlineCompletions.set(undefined, tx);
            this.suggestWidgetInlineCompletions.set(undefined, tx);
        }
        clearSuggestWidgetInlineCompletions(tx) {
            if (this.a.value?.request.context.selectedSuggestionInfo) {
                this.a.clear();
            }
            this.suggestWidgetInlineCompletions.set(undefined, tx);
        }
        cancelUpdate() {
            this.a.clear();
        }
    };
    exports.$L5 = $L5;
    exports.$L5 = $L5 = __decorate([
        __param(3, languageFeatures_1.$hF),
        __param(4, languageConfigurationRegistry_1.$2t)
    ], $L5);
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
    class $M5 {
        get inlineCompletions() { return this.a; }
        constructor(g, request, h, j) {
            this.g = g;
            this.request = request;
            this.h = h;
            this.j = j;
            this.b = 1;
            this.c = [];
            this.e = 0;
            this.f = (0, observable_1.derived)(this, reader => {
                this.j.read(reader);
                let changed = false;
                for (const i of this.a) {
                    changed = changed || i._updateRange(this.h);
                }
                if (changed) {
                    this.e++;
                }
                return this.e;
            });
            const ids = h.deltaDecorations([], g.completions.map(i => ({
                range: i.range,
                options: {
                    description: 'inline-completion-tracking-range'
                },
            })));
            this.a = g.completions.map((i, index) => new $N5(i, ids[index], this.f));
        }
        clone() {
            this.b++;
            return this;
        }
        dispose() {
            this.b--;
            if (this.b === 0) {
                setTimeout(() => {
                    // To fix https://github.com/microsoft/vscode/issues/188348
                    if (!this.h.isDisposed()) {
                        // This is just cleanup. It's ok if it happens with a delay.
                        this.h.deltaDecorations(this.a.map(i => i.decorationId), []);
                    }
                }, 0);
                this.g.dispose();
                for (const i of this.c) {
                    i.source.removeRef();
                }
            }
        }
        prepend(inlineCompletion, range, addRefToSource) {
            if (addRefToSource) {
                inlineCompletion.source.addRef();
            }
            const id = this.h.deltaDecorations([], [{
                    range,
                    options: {
                        description: 'inline-completion-tracking-range'
                    },
                }])[0];
            this.a.unshift(new $N5(inlineCompletion, id, this.f, range));
            this.c.push(inlineCompletion);
        }
    }
    exports.$M5 = $M5;
    class $N5 {
        get forwardStable() {
            return this.inlineCompletion.source.inlineCompletions.enableForwardStability ?? false;
        }
        constructor(inlineCompletion, decorationId, c, initialRange) {
            this.inlineCompletion = inlineCompletion;
            this.decorationId = decorationId;
            this.c = c;
            this.semanticId = JSON.stringify([
                this.inlineCompletion.filterText,
                this.inlineCompletion.insertText,
                this.inlineCompletion.range.getStartPosition().toString()
            ]);
            this.b = true;
            this.a = initialRange ?? inlineCompletion.range;
        }
        toInlineCompletion(reader) {
            return this.inlineCompletion.withRange(this.g(reader));
        }
        toSingleTextEdit(reader) {
            return new singleTextEdit_1.$v5(this.g(reader), this.inlineCompletion.insertText);
        }
        isVisible(model, cursorPosition, reader) {
            const minimizedReplacement = this.e(reader).removeCommonPrefix(model);
            if (!this.b
                || !this.inlineCompletion.range.getStartPosition().equals(this.g(reader).getStartPosition())
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
                && !!(0, filters_1.$Aj)(originalValueAfter, filterTextAfter);
        }
        canBeReused(model, position) {
            const result = this.b
                && this.g(undefined).containsPosition(position)
                && this.isVisible(model, position, undefined)
                && !this.f(undefined);
            return result;
        }
        e(reader) {
            return new singleTextEdit_1.$v5(this.g(reader), this.inlineCompletion.filterText);
        }
        f(reader) {
            return length(this.g(reader)).isBefore(length(this.inlineCompletion.range));
        }
        g(reader) {
            this.c.read(reader); // This makes sure all the ranges are updated.
            return this.a;
        }
        _updateRange(textModel) {
            const range = textModel.getDecorationRange(this.decorationId);
            if (!range) {
                // A setValue call might flush all decorations.
                this.b = false;
                return true;
            }
            if (!this.a.equalsRange(range)) {
                this.a = range;
                return true;
            }
            return false;
        }
    }
    exports.$N5 = $N5;
    function length(range) {
        if (range.startLineNumber === range.endLineNumber) {
            return new position_1.$js(1, 1 + range.endColumn - range.startColumn);
        }
        else {
            return new position_1.$js(1 + range.endLineNumber - range.startLineNumber, range.endColumn);
        }
    }
});
//# sourceMappingURL=inlineCompletionsSource.js.map