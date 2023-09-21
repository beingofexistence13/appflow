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
define(["require", "exports", "vs/base/common/arrays", "vs/base/common/lifecycle", "vs/base/common/strings", "vs/editor/common/core/editOperation", "vs/editor/common/core/range", "vs/editor/common/core/selection", "vs/editor/common/languages/languageConfigurationRegistry", "vs/editor/common/model/textModel", "vs/platform/label/common/label", "vs/platform/workspace/common/workspace", "./snippetParser", "./snippetVariables", "vs/css!./snippetSession"], function (require, exports, arrays_1, lifecycle_1, strings_1, editOperation_1, range_1, selection_1, languageConfigurationRegistry_1, textModel_1, label_1, workspace_1, snippetParser_1, snippetVariables_1) {
    "use strict";
    var SnippetSession_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SnippetSession = exports.OneSnippet = void 0;
    class OneSnippet {
        static { this._decor = {
            active: textModel_1.ModelDecorationOptions.register({ description: 'snippet-placeholder-1', stickiness: 0 /* TrackedRangeStickiness.AlwaysGrowsWhenTypingAtEdges */, className: 'snippet-placeholder' }),
            inactive: textModel_1.ModelDecorationOptions.register({ description: 'snippet-placeholder-2', stickiness: 1 /* TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges */, className: 'snippet-placeholder' }),
            activeFinal: textModel_1.ModelDecorationOptions.register({ description: 'snippet-placeholder-3', stickiness: 1 /* TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges */, className: 'finish-snippet-placeholder' }),
            inactiveFinal: textModel_1.ModelDecorationOptions.register({ description: 'snippet-placeholder-4', stickiness: 1 /* TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges */, className: 'finish-snippet-placeholder' }),
        }; }
        constructor(_editor, _snippet, _snippetLineLeadingWhitespace) {
            this._editor = _editor;
            this._snippet = _snippet;
            this._snippetLineLeadingWhitespace = _snippetLineLeadingWhitespace;
            this._offset = -1;
            this._nestingLevel = 1;
            this._placeholderGroups = (0, arrays_1.groupBy)(_snippet.placeholders, snippetParser_1.Placeholder.compareByIndex);
            this._placeholderGroupsIdx = -1;
        }
        initialize(textChange) {
            this._offset = textChange.newPosition;
        }
        dispose() {
            if (this._placeholderDecorations) {
                this._editor.removeDecorations([...this._placeholderDecorations.values()]);
            }
            this._placeholderGroups.length = 0;
        }
        _initDecorations() {
            if (this._offset === -1) {
                throw new Error(`Snippet not initialized!`);
            }
            if (this._placeholderDecorations) {
                // already initialized
                return;
            }
            this._placeholderDecorations = new Map();
            const model = this._editor.getModel();
            this._editor.changeDecorations(accessor => {
                // create a decoration for each placeholder
                for (const placeholder of this._snippet.placeholders) {
                    const placeholderOffset = this._snippet.offset(placeholder);
                    const placeholderLen = this._snippet.fullLen(placeholder);
                    const range = range_1.Range.fromPositions(model.getPositionAt(this._offset + placeholderOffset), model.getPositionAt(this._offset + placeholderOffset + placeholderLen));
                    const options = placeholder.isFinalTabstop ? OneSnippet._decor.inactiveFinal : OneSnippet._decor.inactive;
                    const handle = accessor.addDecoration(range, options);
                    this._placeholderDecorations.set(placeholder, handle);
                }
            });
        }
        move(fwd) {
            if (!this._editor.hasModel()) {
                return [];
            }
            this._initDecorations();
            // Transform placeholder text if necessary
            if (this._placeholderGroupsIdx >= 0) {
                const operations = [];
                for (const placeholder of this._placeholderGroups[this._placeholderGroupsIdx]) {
                    // Check if the placeholder has a transformation
                    if (placeholder.transform) {
                        const id = this._placeholderDecorations.get(placeholder);
                        const range = this._editor.getModel().getDecorationRange(id);
                        const currentValue = this._editor.getModel().getValueInRange(range);
                        const transformedValueLines = placeholder.transform.resolve(currentValue).split(/\r\n|\r|\n/);
                        // fix indentation for transformed lines
                        for (let i = 1; i < transformedValueLines.length; i++) {
                            transformedValueLines[i] = this._editor.getModel().normalizeIndentation(this._snippetLineLeadingWhitespace + transformedValueLines[i]);
                        }
                        operations.push(editOperation_1.EditOperation.replace(range, transformedValueLines.join(this._editor.getModel().getEOL())));
                    }
                }
                if (operations.length > 0) {
                    this._editor.executeEdits('snippet.placeholderTransform', operations);
                }
            }
            let couldSkipThisPlaceholder = false;
            if (fwd === true && this._placeholderGroupsIdx < this._placeholderGroups.length - 1) {
                this._placeholderGroupsIdx += 1;
                couldSkipThisPlaceholder = true;
            }
            else if (fwd === false && this._placeholderGroupsIdx > 0) {
                this._placeholderGroupsIdx -= 1;
                couldSkipThisPlaceholder = true;
            }
            else {
                // the selection of the current placeholder might
                // not acurate any more -> simply restore it
            }
            const newSelections = this._editor.getModel().changeDecorations(accessor => {
                const activePlaceholders = new Set();
                // change stickiness to always grow when typing at its edges
                // because these decorations represent the currently active
                // tabstop.
                // Special case #1: reaching the final tabstop
                // Special case #2: placeholders enclosing active placeholders
                const selections = [];
                for (const placeholder of this._placeholderGroups[this._placeholderGroupsIdx]) {
                    const id = this._placeholderDecorations.get(placeholder);
                    const range = this._editor.getModel().getDecorationRange(id);
                    selections.push(new selection_1.Selection(range.startLineNumber, range.startColumn, range.endLineNumber, range.endColumn));
                    // consider to skip this placeholder index when the decoration
                    // range is empty but when the placeholder wasn't. that's a strong
                    // hint that the placeholder has been deleted. (all placeholder must match this)
                    couldSkipThisPlaceholder = couldSkipThisPlaceholder && this._hasPlaceholderBeenCollapsed(placeholder);
                    accessor.changeDecorationOptions(id, placeholder.isFinalTabstop ? OneSnippet._decor.activeFinal : OneSnippet._decor.active);
                    activePlaceholders.add(placeholder);
                    for (const enclosingPlaceholder of this._snippet.enclosingPlaceholders(placeholder)) {
                        const id = this._placeholderDecorations.get(enclosingPlaceholder);
                        accessor.changeDecorationOptions(id, enclosingPlaceholder.isFinalTabstop ? OneSnippet._decor.activeFinal : OneSnippet._decor.active);
                        activePlaceholders.add(enclosingPlaceholder);
                    }
                }
                // change stickness to never grow when typing at its edges
                // so that in-active tabstops never grow
                for (const [placeholder, id] of this._placeholderDecorations) {
                    if (!activePlaceholders.has(placeholder)) {
                        accessor.changeDecorationOptions(id, placeholder.isFinalTabstop ? OneSnippet._decor.inactiveFinal : OneSnippet._decor.inactive);
                    }
                }
                return selections;
            });
            return !couldSkipThisPlaceholder ? newSelections ?? [] : this.move(fwd);
        }
        _hasPlaceholderBeenCollapsed(placeholder) {
            // A placeholder is empty when it wasn't empty when authored but
            // when its tracking decoration is empty. This also applies to all
            // potential parent placeholders
            let marker = placeholder;
            while (marker) {
                if (marker instanceof snippetParser_1.Placeholder) {
                    const id = this._placeholderDecorations.get(marker);
                    const range = this._editor.getModel().getDecorationRange(id);
                    if (range.isEmpty() && marker.toString().length > 0) {
                        return true;
                    }
                }
                marker = marker.parent;
            }
            return false;
        }
        get isAtFirstPlaceholder() {
            return this._placeholderGroupsIdx <= 0 || this._placeholderGroups.length === 0;
        }
        get isAtLastPlaceholder() {
            return this._placeholderGroupsIdx === this._placeholderGroups.length - 1;
        }
        get hasPlaceholder() {
            return this._snippet.placeholders.length > 0;
        }
        /**
         * A snippet is trivial when it has no placeholder or only a final placeholder at
         * its very end
         */
        get isTrivialSnippet() {
            if (this._snippet.placeholders.length === 0) {
                return true;
            }
            if (this._snippet.placeholders.length === 1) {
                const [placeholder] = this._snippet.placeholders;
                if (placeholder.isFinalTabstop) {
                    if (this._snippet.rightMostDescendant === placeholder) {
                        return true;
                    }
                }
            }
            return false;
        }
        computePossibleSelections() {
            const result = new Map();
            for (const placeholdersWithEqualIndex of this._placeholderGroups) {
                let ranges;
                for (const placeholder of placeholdersWithEqualIndex) {
                    if (placeholder.isFinalTabstop) {
                        // ignore those
                        break;
                    }
                    if (!ranges) {
                        ranges = [];
                        result.set(placeholder.index, ranges);
                    }
                    const id = this._placeholderDecorations.get(placeholder);
                    const range = this._editor.getModel().getDecorationRange(id);
                    if (!range) {
                        // one of the placeholder lost its decoration and
                        // therefore we bail out and pretend the placeholder
                        // (with its mirrors) doesn't exist anymore.
                        result.delete(placeholder.index);
                        break;
                    }
                    ranges.push(range);
                }
            }
            return result;
        }
        get activeChoice() {
            if (!this._placeholderDecorations) {
                return undefined;
            }
            const placeholder = this._placeholderGroups[this._placeholderGroupsIdx][0];
            if (!placeholder?.choice) {
                return undefined;
            }
            const id = this._placeholderDecorations.get(placeholder);
            if (!id) {
                return undefined;
            }
            const range = this._editor.getModel().getDecorationRange(id);
            if (!range) {
                return undefined;
            }
            return { range, choice: placeholder.choice };
        }
        get hasChoice() {
            let result = false;
            this._snippet.walk(marker => {
                result = marker instanceof snippetParser_1.Choice;
                return !result;
            });
            return result;
        }
        merge(others) {
            const model = this._editor.getModel();
            this._nestingLevel *= 10;
            this._editor.changeDecorations(accessor => {
                // For each active placeholder take one snippet and merge it
                // in that the placeholder (can be many for `$1foo$1foo`). Because
                // everything is sorted by editor selection we can simply remove
                // elements from the beginning of the array
                for (const placeholder of this._placeholderGroups[this._placeholderGroupsIdx]) {
                    const nested = others.shift();
                    console.assert(nested._offset !== -1);
                    console.assert(!nested._placeholderDecorations);
                    // Massage placeholder-indicies of the nested snippet to be
                    // sorted right after the insertion point. This ensures we move
                    // through the placeholders in the correct order
                    const indexLastPlaceholder = nested._snippet.placeholderInfo.last.index;
                    for (const nestedPlaceholder of nested._snippet.placeholderInfo.all) {
                        if (nestedPlaceholder.isFinalTabstop) {
                            nestedPlaceholder.index = placeholder.index + ((indexLastPlaceholder + 1) / this._nestingLevel);
                        }
                        else {
                            nestedPlaceholder.index = placeholder.index + (nestedPlaceholder.index / this._nestingLevel);
                        }
                    }
                    this._snippet.replace(placeholder, nested._snippet.children);
                    // Remove the placeholder at which position are inserting
                    // the snippet and also remove its decoration.
                    const id = this._placeholderDecorations.get(placeholder);
                    accessor.removeDecoration(id);
                    this._placeholderDecorations.delete(placeholder);
                    // For each *new* placeholder we create decoration to monitor
                    // how and if it grows/shrinks.
                    for (const placeholder of nested._snippet.placeholders) {
                        const placeholderOffset = nested._snippet.offset(placeholder);
                        const placeholderLen = nested._snippet.fullLen(placeholder);
                        const range = range_1.Range.fromPositions(model.getPositionAt(nested._offset + placeholderOffset), model.getPositionAt(nested._offset + placeholderOffset + placeholderLen));
                        const handle = accessor.addDecoration(range, OneSnippet._decor.inactive);
                        this._placeholderDecorations.set(placeholder, handle);
                    }
                }
                // Last, re-create the placeholder groups by sorting placeholders by their index.
                this._placeholderGroups = (0, arrays_1.groupBy)(this._snippet.placeholders, snippetParser_1.Placeholder.compareByIndex);
            });
        }
        getEnclosingRange() {
            let result;
            const model = this._editor.getModel();
            for (const decorationId of this._placeholderDecorations.values()) {
                const placeholderRange = model.getDecorationRange(decorationId) ?? undefined;
                if (!result) {
                    result = placeholderRange;
                }
                else {
                    result = result.plusRange(placeholderRange);
                }
            }
            return result;
        }
    }
    exports.OneSnippet = OneSnippet;
    const _defaultOptions = {
        overwriteBefore: 0,
        overwriteAfter: 0,
        adjustWhitespace: true,
        clipboardText: undefined,
        overtypingCapturer: undefined
    };
    let SnippetSession = SnippetSession_1 = class SnippetSession {
        static adjustWhitespace(model, position, adjustIndentation, snippet, filter) {
            const line = model.getLineContent(position.lineNumber);
            const lineLeadingWhitespace = (0, strings_1.getLeadingWhitespace)(line, 0, position.column - 1);
            // the snippet as inserted
            let snippetTextString;
            snippet.walk(marker => {
                // all text elements that are not inside choice
                if (!(marker instanceof snippetParser_1.Text) || marker.parent instanceof snippetParser_1.Choice) {
                    return true;
                }
                // check with filter (iff provided)
                if (filter && !filter.has(marker)) {
                    return true;
                }
                const lines = marker.value.split(/\r\n|\r|\n/);
                if (adjustIndentation) {
                    // adjust indentation of snippet test
                    // -the snippet-start doesn't get extra-indented (lineLeadingWhitespace), only normalized
                    // -all N+1 lines get extra-indented and normalized
                    // -the text start get extra-indented and normalized when following a linebreak
                    const offset = snippet.offset(marker);
                    if (offset === 0) {
                        // snippet start
                        lines[0] = model.normalizeIndentation(lines[0]);
                    }
                    else {
                        // check if text start is after a linebreak
                        snippetTextString = snippetTextString ?? snippet.toString();
                        const prevChar = snippetTextString.charCodeAt(offset - 1);
                        if (prevChar === 10 /* CharCode.LineFeed */ || prevChar === 13 /* CharCode.CarriageReturn */) {
                            lines[0] = model.normalizeIndentation(lineLeadingWhitespace + lines[0]);
                        }
                    }
                    for (let i = 1; i < lines.length; i++) {
                        lines[i] = model.normalizeIndentation(lineLeadingWhitespace + lines[i]);
                    }
                }
                const newValue = lines.join(model.getEOL());
                if (newValue !== marker.value) {
                    marker.parent.replace(marker, [new snippetParser_1.Text(newValue)]);
                    snippetTextString = undefined;
                }
                return true;
            });
            return lineLeadingWhitespace;
        }
        static adjustSelection(model, selection, overwriteBefore, overwriteAfter) {
            if (overwriteBefore !== 0 || overwriteAfter !== 0) {
                // overwrite[Before|After] is compute using the position, not the whole
                // selection. therefore we adjust the selection around that position
                const { positionLineNumber, positionColumn } = selection;
                const positionColumnBefore = positionColumn - overwriteBefore;
                const positionColumnAfter = positionColumn + overwriteAfter;
                const range = model.validateRange({
                    startLineNumber: positionLineNumber,
                    startColumn: positionColumnBefore,
                    endLineNumber: positionLineNumber,
                    endColumn: positionColumnAfter
                });
                selection = selection_1.Selection.createWithDirection(range.startLineNumber, range.startColumn, range.endLineNumber, range.endColumn, selection.getDirection());
            }
            return selection;
        }
        static createEditsAndSnippetsFromSelections(editor, template, overwriteBefore, overwriteAfter, enforceFinalTabstop, adjustWhitespace, clipboardText, overtypingCapturer, languageConfigurationService) {
            const edits = [];
            const snippets = [];
            if (!editor.hasModel()) {
                return { edits, snippets };
            }
            const model = editor.getModel();
            const workspaceService = editor.invokeWithinContext(accessor => accessor.get(workspace_1.IWorkspaceContextService));
            const modelBasedVariableResolver = editor.invokeWithinContext(accessor => new snippetVariables_1.ModelBasedVariableResolver(accessor.get(label_1.ILabelService), model));
            const readClipboardText = () => clipboardText;
            // know what text the overwrite[Before|After] extensions
            // of the primary curser have selected because only when
            // secondary selections extend to the same text we can grow them
            const firstBeforeText = model.getValueInRange(SnippetSession_1.adjustSelection(model, editor.getSelection(), overwriteBefore, 0));
            const firstAfterText = model.getValueInRange(SnippetSession_1.adjustSelection(model, editor.getSelection(), 0, overwriteAfter));
            // remember the first non-whitespace column to decide if
            // `keepWhitespace` should be overruled for secondary selections
            const firstLineFirstNonWhitespace = model.getLineFirstNonWhitespaceColumn(editor.getSelection().positionLineNumber);
            // sort selections by their start position but remeber
            // the original index. that allows you to create correct
            // offset-based selection logic without changing the
            // primary selection
            const indexedSelections = editor.getSelections()
                .map((selection, idx) => ({ selection, idx }))
                .sort((a, b) => range_1.Range.compareRangesUsingStarts(a.selection, b.selection));
            for (const { selection, idx } of indexedSelections) {
                // extend selection with the `overwriteBefore` and `overwriteAfter` and then
                // compare if this matches the extensions of the primary selection
                let extensionBefore = SnippetSession_1.adjustSelection(model, selection, overwriteBefore, 0);
                let extensionAfter = SnippetSession_1.adjustSelection(model, selection, 0, overwriteAfter);
                if (firstBeforeText !== model.getValueInRange(extensionBefore)) {
                    extensionBefore = selection;
                }
                if (firstAfterText !== model.getValueInRange(extensionAfter)) {
                    extensionAfter = selection;
                }
                // merge the before and after selection into one
                const snippetSelection = selection
                    .setStartPosition(extensionBefore.startLineNumber, extensionBefore.startColumn)
                    .setEndPosition(extensionAfter.endLineNumber, extensionAfter.endColumn);
                const snippet = new snippetParser_1.SnippetParser().parse(template, true, enforceFinalTabstop);
                // adjust the template string to match the indentation and
                // whitespace rules of this insert location (can be different for each cursor)
                // happens when being asked for (default) or when this is a secondary
                // cursor and the leading whitespace is different
                const start = snippetSelection.getStartPosition();
                const snippetLineLeadingWhitespace = SnippetSession_1.adjustWhitespace(model, start, adjustWhitespace || (idx > 0 && firstLineFirstNonWhitespace !== model.getLineFirstNonWhitespaceColumn(selection.positionLineNumber)), snippet);
                snippet.resolveVariables(new snippetVariables_1.CompositeSnippetVariableResolver([
                    modelBasedVariableResolver,
                    new snippetVariables_1.ClipboardBasedVariableResolver(readClipboardText, idx, indexedSelections.length, editor.getOption(78 /* EditorOption.multiCursorPaste */) === 'spread'),
                    new snippetVariables_1.SelectionBasedVariableResolver(model, selection, idx, overtypingCapturer),
                    new snippetVariables_1.CommentBasedVariableResolver(model, selection, languageConfigurationService),
                    new snippetVariables_1.TimeBasedVariableResolver,
                    new snippetVariables_1.WorkspaceBasedVariableResolver(workspaceService),
                    new snippetVariables_1.RandomBasedVariableResolver,
                ]));
                // store snippets with the index of their originating selection.
                // that ensures the primiary cursor stays primary despite not being
                // the one with lowest start position
                edits[idx] = editOperation_1.EditOperation.replace(snippetSelection, snippet.toString());
                edits[idx].identifier = { major: idx, minor: 0 }; // mark the edit so only our undo edits will be used to generate end cursors
                edits[idx]._isTracked = true;
                snippets[idx] = new OneSnippet(editor, snippet, snippetLineLeadingWhitespace);
            }
            return { edits, snippets };
        }
        static createEditsAndSnippetsFromEdits(editor, snippetEdits, enforceFinalTabstop, adjustWhitespace, clipboardText, overtypingCapturer, languageConfigurationService) {
            if (!editor.hasModel() || snippetEdits.length === 0) {
                return { edits: [], snippets: [] };
            }
            const edits = [];
            const model = editor.getModel();
            const parser = new snippetParser_1.SnippetParser();
            const snippet = new snippetParser_1.TextmateSnippet();
            // snippet variables resolver
            const resolver = new snippetVariables_1.CompositeSnippetVariableResolver([
                editor.invokeWithinContext(accessor => new snippetVariables_1.ModelBasedVariableResolver(accessor.get(label_1.ILabelService), model)),
                new snippetVariables_1.ClipboardBasedVariableResolver(() => clipboardText, 0, editor.getSelections().length, editor.getOption(78 /* EditorOption.multiCursorPaste */) === 'spread'),
                new snippetVariables_1.SelectionBasedVariableResolver(model, editor.getSelection(), 0, overtypingCapturer),
                new snippetVariables_1.CommentBasedVariableResolver(model, editor.getSelection(), languageConfigurationService),
                new snippetVariables_1.TimeBasedVariableResolver,
                new snippetVariables_1.WorkspaceBasedVariableResolver(editor.invokeWithinContext(accessor => accessor.get(workspace_1.IWorkspaceContextService))),
                new snippetVariables_1.RandomBasedVariableResolver,
            ]);
            //
            snippetEdits = snippetEdits.sort((a, b) => range_1.Range.compareRangesUsingStarts(a.range, b.range));
            let offset = 0;
            for (let i = 0; i < snippetEdits.length; i++) {
                const { range, template } = snippetEdits[i];
                // gaps between snippet edits are appended as text nodes. this
                // ensures placeholder-offsets are later correct
                if (i > 0) {
                    const lastRange = snippetEdits[i - 1].range;
                    const textRange = range_1.Range.fromPositions(lastRange.getEndPosition(), range.getStartPosition());
                    const textNode = new snippetParser_1.Text(model.getValueInRange(textRange));
                    snippet.appendChild(textNode);
                    offset += textNode.value.length;
                }
                const newNodes = parser.parseFragment(template, snippet);
                SnippetSession_1.adjustWhitespace(model, range.getStartPosition(), true, snippet, new Set(newNodes));
                snippet.resolveVariables(resolver);
                const snippetText = snippet.toString();
                const snippetFragmentText = snippetText.slice(offset);
                offset = snippetText.length;
                // make edit
                const edit = editOperation_1.EditOperation.replace(range, snippetFragmentText);
                edit.identifier = { major: i, minor: 0 }; // mark the edit so only our undo edits will be used to generate end cursors
                edit._isTracked = true;
                edits.push(edit);
            }
            //
            parser.ensureFinalTabstop(snippet, enforceFinalTabstop, true);
            return {
                edits,
                snippets: [new OneSnippet(editor, snippet, '')]
            };
        }
        constructor(_editor, _template, _options = _defaultOptions, _languageConfigurationService) {
            this._editor = _editor;
            this._template = _template;
            this._options = _options;
            this._languageConfigurationService = _languageConfigurationService;
            this._templateMerges = [];
            this._snippets = [];
        }
        dispose() {
            (0, lifecycle_1.dispose)(this._snippets);
        }
        _logInfo() {
            return `template="${this._template}", merged_templates="${this._templateMerges.join(' -> ')}"`;
        }
        insert() {
            if (!this._editor.hasModel()) {
                return;
            }
            // make insert edit and start with first selections
            const { edits, snippets } = typeof this._template === 'string'
                ? SnippetSession_1.createEditsAndSnippetsFromSelections(this._editor, this._template, this._options.overwriteBefore, this._options.overwriteAfter, false, this._options.adjustWhitespace, this._options.clipboardText, this._options.overtypingCapturer, this._languageConfigurationService)
                : SnippetSession_1.createEditsAndSnippetsFromEdits(this._editor, this._template, false, this._options.adjustWhitespace, this._options.clipboardText, this._options.overtypingCapturer, this._languageConfigurationService);
            this._snippets = snippets;
            this._editor.executeEdits('snippet', edits, _undoEdits => {
                // Sometimes, the text buffer will remove automatic whitespace when doing any edits,
                // so we need to look only at the undo edits relevant for us.
                // Our edits have an identifier set so that's how we can distinguish them
                const undoEdits = _undoEdits.filter(edit => !!edit.identifier);
                for (let idx = 0; idx < snippets.length; idx++) {
                    snippets[idx].initialize(undoEdits[idx].textChange);
                }
                if (this._snippets[0].hasPlaceholder) {
                    return this._move(true);
                }
                else {
                    return undoEdits
                        .map(edit => selection_1.Selection.fromPositions(edit.range.getEndPosition()));
                }
            });
            this._editor.revealRange(this._editor.getSelections()[0]);
        }
        merge(template, options = _defaultOptions) {
            if (!this._editor.hasModel()) {
                return;
            }
            this._templateMerges.push([this._snippets[0]._nestingLevel, this._snippets[0]._placeholderGroupsIdx, template]);
            const { edits, snippets } = SnippetSession_1.createEditsAndSnippetsFromSelections(this._editor, template, options.overwriteBefore, options.overwriteAfter, true, options.adjustWhitespace, options.clipboardText, options.overtypingCapturer, this._languageConfigurationService);
            this._editor.executeEdits('snippet', edits, _undoEdits => {
                // Sometimes, the text buffer will remove automatic whitespace when doing any edits,
                // so we need to look only at the undo edits relevant for us.
                // Our edits have an identifier set so that's how we can distinguish them
                const undoEdits = _undoEdits.filter(edit => !!edit.identifier);
                for (let idx = 0; idx < snippets.length; idx++) {
                    snippets[idx].initialize(undoEdits[idx].textChange);
                }
                // Trivial snippets have no placeholder or are just the final placeholder. That means they
                // are just text insertions and we don't need to merge the nested snippet into the existing
                // snippet
                const isTrivialSnippet = snippets[0].isTrivialSnippet;
                if (!isTrivialSnippet) {
                    for (const snippet of this._snippets) {
                        snippet.merge(snippets);
                    }
                    console.assert(snippets.length === 0);
                }
                if (this._snippets[0].hasPlaceholder && !isTrivialSnippet) {
                    return this._move(undefined);
                }
                else {
                    return undoEdits.map(edit => selection_1.Selection.fromPositions(edit.range.getEndPosition()));
                }
            });
        }
        next() {
            const newSelections = this._move(true);
            this._editor.setSelections(newSelections);
            this._editor.revealPositionInCenterIfOutsideViewport(newSelections[0].getPosition());
        }
        prev() {
            const newSelections = this._move(false);
            this._editor.setSelections(newSelections);
            this._editor.revealPositionInCenterIfOutsideViewport(newSelections[0].getPosition());
        }
        _move(fwd) {
            const selections = [];
            for (const snippet of this._snippets) {
                const oneSelection = snippet.move(fwd);
                selections.push(...oneSelection);
            }
            return selections;
        }
        get isAtFirstPlaceholder() {
            return this._snippets[0].isAtFirstPlaceholder;
        }
        get isAtLastPlaceholder() {
            return this._snippets[0].isAtLastPlaceholder;
        }
        get hasPlaceholder() {
            return this._snippets[0].hasPlaceholder;
        }
        get hasChoice() {
            return this._snippets[0].hasChoice;
        }
        get activeChoice() {
            return this._snippets[0].activeChoice;
        }
        isSelectionWithinPlaceholders() {
            if (!this.hasPlaceholder) {
                return false;
            }
            const selections = this._editor.getSelections();
            if (selections.length < this._snippets.length) {
                // this means we started snippet mode with N
                // selections and have M (N > M) selections.
                // So one snippet is without selection -> cancel
                return false;
            }
            const allPossibleSelections = new Map();
            for (const snippet of this._snippets) {
                const possibleSelections = snippet.computePossibleSelections();
                // for the first snippet find the placeholder (and its ranges)
                // that contain at least one selection. for all remaining snippets
                // the same placeholder (and their ranges) must be used.
                if (allPossibleSelections.size === 0) {
                    for (const [index, ranges] of possibleSelections) {
                        ranges.sort(range_1.Range.compareRangesUsingStarts);
                        for (const selection of selections) {
                            if (ranges[0].containsRange(selection)) {
                                allPossibleSelections.set(index, []);
                                break;
                            }
                        }
                    }
                }
                if (allPossibleSelections.size === 0) {
                    // return false if we couldn't associate a selection to
                    // this (the first) snippet
                    return false;
                }
                // add selections from 'this' snippet so that we know all
                // selections for this placeholder
                allPossibleSelections.forEach((array, index) => {
                    array.push(...possibleSelections.get(index));
                });
            }
            // sort selections (and later placeholder-ranges). then walk both
            // arrays and make sure the placeholder-ranges contain the corresponding
            // selection
            selections.sort(range_1.Range.compareRangesUsingStarts);
            for (const [index, ranges] of allPossibleSelections) {
                if (ranges.length !== selections.length) {
                    allPossibleSelections.delete(index);
                    continue;
                }
                ranges.sort(range_1.Range.compareRangesUsingStarts);
                for (let i = 0; i < ranges.length; i++) {
                    if (!ranges[i].containsRange(selections[i])) {
                        allPossibleSelections.delete(index);
                        continue;
                    }
                }
            }
            // from all possible selections we have deleted those
            // that don't match with the current selection. if we don't
            // have any left, we don't have a selection anymore
            return allPossibleSelections.size > 0;
        }
        getEnclosingRange() {
            let result;
            for (const snippet of this._snippets) {
                const snippetRange = snippet.getEnclosingRange();
                if (!result) {
                    result = snippetRange;
                }
                else {
                    result = result.plusRange(snippetRange);
                }
            }
            return result;
        }
    };
    exports.SnippetSession = SnippetSession;
    exports.SnippetSession = SnippetSession = SnippetSession_1 = __decorate([
        __param(3, languageConfigurationRegistry_1.ILanguageConfigurationService)
    ], SnippetSession);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic25pcHBldFNlc3Npb24uanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9lZGl0b3IvY29udHJpYi9zbmlwcGV0L2Jyb3dzZXIvc25pcHBldFNlc3Npb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7OztJQXVCaEcsTUFBYSxVQUFVO2lCQVFFLFdBQU0sR0FBRztZQUNoQyxNQUFNLEVBQUUsa0NBQXNCLENBQUMsUUFBUSxDQUFDLEVBQUUsV0FBVyxFQUFFLHVCQUF1QixFQUFFLFVBQVUsNkRBQXFELEVBQUUsU0FBUyxFQUFFLHFCQUFxQixFQUFFLENBQUM7WUFDcEwsUUFBUSxFQUFFLGtDQUFzQixDQUFDLFFBQVEsQ0FBQyxFQUFFLFdBQVcsRUFBRSx1QkFBdUIsRUFBRSxVQUFVLDREQUFvRCxFQUFFLFNBQVMsRUFBRSxxQkFBcUIsRUFBRSxDQUFDO1lBQ3JMLFdBQVcsRUFBRSxrQ0FBc0IsQ0FBQyxRQUFRLENBQUMsRUFBRSxXQUFXLEVBQUUsdUJBQXVCLEVBQUUsVUFBVSw0REFBb0QsRUFBRSxTQUFTLEVBQUUsNEJBQTRCLEVBQUUsQ0FBQztZQUMvTCxhQUFhLEVBQUUsa0NBQXNCLENBQUMsUUFBUSxDQUFDLEVBQUUsV0FBVyxFQUFFLHVCQUF1QixFQUFFLFVBQVUsNERBQW9ELEVBQUUsU0FBUyxFQUFFLDRCQUE0QixFQUFFLENBQUM7U0FDak0sQUFMNkIsQ0FLNUI7UUFFRixZQUNrQixPQUEwQixFQUMxQixRQUF5QixFQUN6Qiw2QkFBcUM7WUFGckMsWUFBTyxHQUFQLE9BQU8sQ0FBbUI7WUFDMUIsYUFBUSxHQUFSLFFBQVEsQ0FBaUI7WUFDekIsa0NBQTZCLEdBQTdCLDZCQUE2QixDQUFRO1lBZC9DLFlBQU8sR0FBVyxDQUFDLENBQUMsQ0FBQztZQUU3QixrQkFBYSxHQUFXLENBQUMsQ0FBQztZQWN6QixJQUFJLENBQUMsa0JBQWtCLEdB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