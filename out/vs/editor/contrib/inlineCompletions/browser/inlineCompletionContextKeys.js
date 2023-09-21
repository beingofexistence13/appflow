/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/observable", "vs/base/common/strings", "vs/editor/common/core/cursorColumns", "vs/platform/contextkey/common/contextkey", "vs/base/common/lifecycle", "vs/nls"], function (require, exports, observable_1, strings_1, cursorColumns_1, contextkey_1, lifecycle_1, nls_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.InlineCompletionContextKeys = void 0;
    class InlineCompletionContextKeys extends lifecycle_1.Disposable {
        static { this.inlineSuggestionVisible = new contextkey_1.RawContextKey('inlineSuggestionVisible', false, (0, nls_1.localize)('inlineSuggestionVisible', "Whether an inline suggestion is visible")); }
        static { this.inlineSuggestionHasIndentation = new contextkey_1.RawContextKey('inlineSuggestionHasIndentation', false, (0, nls_1.localize)('inlineSuggestionHasIndentation', "Whether the inline suggestion starts with whitespace")); }
        static { this.inlineSuggestionHasIndentationLessThanTabSize = new contextkey_1.RawContextKey('inlineSuggestionHasIndentationLessThanTabSize', true, (0, nls_1.localize)('inlineSuggestionHasIndentationLessThanTabSize', "Whether the inline suggestion starts with whitespace that is less than what would be inserted by tab")); }
        static { this.suppressSuggestions = new contextkey_1.RawContextKey('inlineSuggestionSuppressSuggestions', undefined, (0, nls_1.localize)('suppressSuggestions', "Whether suggestions should be suppressed for the current suggestion")); }
        constructor(contextKeyService, model) {
            super();
            this.contextKeyService = contextKeyService;
            this.model = model;
            this.inlineCompletionVisible = InlineCompletionContextKeys.inlineSuggestionVisible.bindTo(this.contextKeyService);
            this.inlineCompletionSuggestsIndentation = InlineCompletionContextKeys.inlineSuggestionHasIndentation.bindTo(this.contextKeyService);
            this.inlineCompletionSuggestsIndentationLessThanTabSize = InlineCompletionContextKeys.inlineSuggestionHasIndentationLessThanTabSize.bindTo(this.contextKeyService);
            this.suppressSuggestions = InlineCompletionContextKeys.suppressSuggestions.bindTo(this.contextKeyService);
            this._register((0, observable_1.autorun)(reader => {
                /** @description update context key: inlineCompletionVisible, suppressSuggestions */
                const model = this.model.read(reader);
                const state = model?.state.read(reader);
                const isInlineCompletionVisible = !!state?.inlineCompletion && state?.ghostText !== undefined && !state?.ghostText.isEmpty();
                this.inlineCompletionVisible.set(isInlineCompletionVisible);
                if (state?.ghostText && state?.inlineCompletion) {
                    this.suppressSuggestions.set(state.inlineCompletion.inlineCompletion.source.inlineCompletions.suppressSuggestions);
                }
            }));
            this._register((0, observable_1.autorun)(reader => {
                /** @description update context key: inlineCompletionSuggestsIndentation, inlineCompletionSuggestsIndentationLessThanTabSize */
                const model = this.model.read(reader);
                let startsWithIndentation = false;
                let startsWithIndentationLessThanTabSize = true;
                const ghostText = model?.ghostText.read(reader);
                if (!!model?.selectedSuggestItem && ghostText && ghostText.parts.length > 0) {
                    const { column, lines } = ghostText.parts[0];
                    const firstLine = lines[0];
                    const indentationEndColumn = model.textModel.getLineIndentColumn(ghostText.lineNumber);
                    const inIndentation = column <= indentationEndColumn;
                    if (inIndentation) {
                        let firstNonWsIdx = (0, strings_1.firstNonWhitespaceIndex)(firstLine);
                        if (firstNonWsIdx === -1) {
                            firstNonWsIdx = firstLine.length - 1;
                        }
                        startsWithIndentation = firstNonWsIdx > 0;
                        const tabSize = model.textModel.getOptions().tabSize;
                        const visibleColumnIndentation = cursorColumns_1.CursorColumns.visibleColumnFromColumn(firstLine, firstNonWsIdx + 1, tabSize);
                        startsWithIndentationLessThanTabSize = visibleColumnIndentation < tabSize;
                    }
                }
                this.inlineCompletionSuggestsIndentation.set(startsWithIndentation);
                this.inlineCompletionSuggestsIndentationLessThanTabSize.set(startsWithIndentationLessThanTabSize);
            }));
        }
    }
    exports.InlineCompletionContextKeys = InlineCompletionContextKeys;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5saW5lQ29tcGxldGlvbkNvbnRleHRLZXlzLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvZWRpdG9yL2NvbnRyaWIvaW5saW5lQ29tcGxldGlvbnMvYnJvd3Nlci9pbmxpbmVDb21wbGV0aW9uQ29udGV4dEtleXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBVWhHLE1BQWEsMkJBQTRCLFNBQVEsc0JBQVU7aUJBQ25DLDRCQUF1QixHQUFHLElBQUksMEJBQWEsQ0FBVSx5QkFBeUIsRUFBRSxLQUFLLEVBQUUsSUFBQSxjQUFRLEVBQUMseUJBQXlCLEVBQUUseUNBQXlDLENBQUMsQ0FBQyxBQUEvSSxDQUFnSjtpQkFDdkssbUNBQThCLEdBQUcsSUFBSSwwQkFBYSxDQUFVLGdDQUFnQyxFQUFFLEtBQUssRUFBRSxJQUFBLGNBQVEsRUFBQyxnQ0FBZ0MsRUFBRSxzREFBc0QsQ0FBQyxDQUFDLEFBQTFLLENBQTJLO2lCQUN6TSxrREFBNkMsR0FBRyxJQUFJLDBCQUFhLENBQVUsK0NBQStDLEVBQUUsSUFBSSxFQUFFLElBQUEsY0FBUSxFQUFDLCtDQUErQyxFQUFFLHNHQUFzRyxDQUFDLENBQUMsQUFBdlAsQ0FBd1A7aUJBQ3JTLHdCQUFtQixHQUFHLElBQUksMEJBQWEsQ0FBc0IscUNBQXFDLEVBQUUsU0FBUyxFQUFFLElBQUEsY0FBUSxFQUFDLHFCQUFxQixFQUFFLHFFQUFxRSxDQUFDLENBQUMsQUFBbk0sQ0FBb007UUFPOU8sWUFDa0IsaUJBQXFDLEVBQ3JDLEtBQXNEO1lBRXZFLEtBQUssRUFBRSxDQUFDO1lBSFMsc0JBQWlCLEdBQWpCLGlCQUFpQixDQUFvQjtZQUNyQyxVQUFLLEdBQUwsS0FBSyxDQUFpRDtZQVB4RCw0QkFBdUIsR0FBRywyQkFBMkIsQ0FBQyx1QkFBdUIsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLENBQUM7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