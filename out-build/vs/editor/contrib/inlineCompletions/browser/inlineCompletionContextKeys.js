/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/observable", "vs/base/common/strings", "vs/editor/common/core/cursorColumns", "vs/platform/contextkey/common/contextkey", "vs/base/common/lifecycle", "vs/nls!vs/editor/contrib/inlineCompletions/browser/inlineCompletionContextKeys"], function (require, exports, observable_1, strings_1, cursorColumns_1, contextkey_1, lifecycle_1, nls_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$95 = void 0;
    class $95 extends lifecycle_1.$kc {
        static { this.inlineSuggestionVisible = new contextkey_1.$2i('inlineSuggestionVisible', false, (0, nls_1.localize)(0, null)); }
        static { this.inlineSuggestionHasIndentation = new contextkey_1.$2i('inlineSuggestionHasIndentation', false, (0, nls_1.localize)(1, null)); }
        static { this.inlineSuggestionHasIndentationLessThanTabSize = new contextkey_1.$2i('inlineSuggestionHasIndentationLessThanTabSize', true, (0, nls_1.localize)(2, null)); }
        static { this.suppressSuggestions = new contextkey_1.$2i('inlineSuggestionSuppressSuggestions', undefined, (0, nls_1.localize)(3, null)); }
        constructor(a, b) {
            super();
            this.a = a;
            this.b = b;
            this.inlineCompletionVisible = $95.inlineSuggestionVisible.bindTo(this.a);
            this.inlineCompletionSuggestsIndentation = $95.inlineSuggestionHasIndentation.bindTo(this.a);
            this.inlineCompletionSuggestsIndentationLessThanTabSize = $95.inlineSuggestionHasIndentationLessThanTabSize.bindTo(this.a);
            this.suppressSuggestions = $95.suppressSuggestions.bindTo(this.a);
            this.B((0, observable_1.autorun)(reader => {
                /** @description update context key: inlineCompletionVisible, suppressSuggestions */
                const model = this.b.read(reader);
                const state = model?.state.read(reader);
                const isInlineCompletionVisible = !!state?.inlineCompletion && state?.ghostText !== undefined && !state?.ghostText.isEmpty();
                this.inlineCompletionVisible.set(isInlineCompletionVisible);
                if (state?.ghostText && state?.inlineCompletion) {
                    this.suppressSuggestions.set(state.inlineCompletion.inlineCompletion.source.inlineCompletions.suppressSuggestions);
                }
            }));
            this.B((0, observable_1.autorun)(reader => {
                /** @description update context key: inlineCompletionSuggestsIndentation, inlineCompletionSuggestsIndentationLessThanTabSize */
                const model = this.b.read(reader);
                let startsWithIndentation = false;
                let startsWithIndentationLessThanTabSize = true;
                const ghostText = model?.ghostText.read(reader);
                if (!!model?.selectedSuggestItem && ghostText && ghostText.parts.length > 0) {
                    const { column, lines } = ghostText.parts[0];
                    const firstLine = lines[0];
                    const indentationEndColumn = model.textModel.getLineIndentColumn(ghostText.lineNumber);
                    const inIndentation = column <= indentationEndColumn;
                    if (inIndentation) {
                        let firstNonWsIdx = (0, strings_1.$Be)(firstLine);
                        if (firstNonWsIdx === -1) {
                            firstNonWsIdx = firstLine.length - 1;
                        }
                        startsWithIndentation = firstNonWsIdx > 0;
                        const tabSize = model.textModel.getOptions().tabSize;
                        const visibleColumnIndentation = cursorColumns_1.$mt.visibleColumnFromColumn(firstLine, firstNonWsIdx + 1, tabSize);
                        startsWithIndentationLessThanTabSize = visibleColumnIndentation < tabSize;
                    }
                }
                this.inlineCompletionSuggestsIndentation.set(startsWithIndentation);
                this.inlineCompletionSuggestsIndentationLessThanTabSize.set(startsWithIndentationLessThanTabSize);
            }));
        }
    }
    exports.$95 = $95;
});
//# sourceMappingURL=inlineCompletionContextKeys.js.map