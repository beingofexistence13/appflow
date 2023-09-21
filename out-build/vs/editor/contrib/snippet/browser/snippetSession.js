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
    var $l6_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$l6 = exports.$k6 = void 0;
    class $k6 {
        static { this.f = {
            active: textModel_1.$RC.register({ description: 'snippet-placeholder-1', stickiness: 0 /* TrackedRangeStickiness.AlwaysGrowsWhenTypingAtEdges */, className: 'snippet-placeholder' }),
            inactive: textModel_1.$RC.register({ description: 'snippet-placeholder-2', stickiness: 1 /* TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges */, className: 'snippet-placeholder' }),
            activeFinal: textModel_1.$RC.register({ description: 'snippet-placeholder-3', stickiness: 1 /* TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges */, className: 'finish-snippet-placeholder' }),
            inactiveFinal: textModel_1.$RC.register({ description: 'snippet-placeholder-4', stickiness: 1 /* TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges */, className: 'finish-snippet-placeholder' }),
        }; }
        constructor(g, h, j) {
            this.g = g;
            this.h = h;
            this.j = j;
            this.e = -1;
            this._nestingLevel = 1;
            this.d = (0, arrays_1.$xb)(h.placeholders, snippetParser_1.$A5.compareByIndex);
            this._placeholderGroupsIdx = -1;
        }
        initialize(textChange) {
            this.e = textChange.newPosition;
        }
        dispose() {
            if (this.c) {
                this.g.removeDecorations([...this.c.values()]);
            }
            this.d.length = 0;
        }
        k() {
            if (this.e === -1) {
                throw new Error(`Snippet not initialized!`);
            }
            if (this.c) {
                // already initialized
                return;
            }
            this.c = new Map();
            const model = this.g.getModel();
            this.g.changeDecorations(accessor => {
                // create a decoration for each placeholder
                for (const placeholder of this.h.placeholders) {
                    const placeholderOffset = this.h.offset(placeholder);
                    const placeholderLen = this.h.fullLen(placeholder);
                    const range = range_1.$ks.fromPositions(model.getPositionAt(this.e + placeholderOffset), model.getPositionAt(this.e + placeholderOffset + placeholderLen));
                    const options = placeholder.isFinalTabstop ? $k6.f.inactiveFinal : $k6.f.inactive;
                    const handle = accessor.addDecoration(range, options);
                    this.c.set(placeholder, handle);
                }
            });
        }
        move(fwd) {
            if (!this.g.hasModel()) {
                return [];
            }
            this.k();
            // Transform placeholder text if necessary
            if (this._placeholderGroupsIdx >= 0) {
                const operations = [];
                for (const placeholder of this.d[this._placeholderGroupsIdx]) {
                    // Check if the placeholder has a transformation
                    if (placeholder.transform) {
                        const id = this.c.get(placeholder);
                        const range = this.g.getModel().getDecorationRange(id);
                        const currentValue = this.g.getModel().getValueInRange(range);
                        const transformedValueLines = placeholder.transform.resolve(currentValue).split(/\r\n|\r|\n/);
                        // fix indentation for transformed lines
                        for (let i = 1; i < transformedValueLines.length; i++) {
                            transformedValueLines[i] = this.g.getModel().normalizeIndentation(this.j + transformedValueLines[i]);
                        }
                        operations.push(editOperation_1.$ls.replace(range, transformedValueLines.join(this.g.getModel().getEOL())));
                    }
                }
                if (operations.length > 0) {
                    this.g.executeEdits('snippet.placeholderTransform', operations);
                }
            }
            let couldSkipThisPlaceholder = false;
            if (fwd === true && this._placeholderGroupsIdx < this.d.length - 1) {
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
            const newSelections = this.g.getModel().changeDecorations(accessor => {
                const activePlaceholders = new Set();
                // change stickiness to always grow when typing at its edges
                // because these decorations represent the currently active
                // tabstop.
                // Special case #1: reaching the final tabstop
                // Special case #2: placeholders enclosing active placeholders
                const selections = [];
                for (const placeholder of this.d[this._placeholderGroupsIdx]) {
                    const id = this.c.get(placeholder);
                    const range = this.g.getModel().getDecorationRange(id);
                    selections.push(new selection_1.$ms(range.startLineNumber, range.startColumn, range.endLineNumber, range.endColumn));
                    // consider to skip this placeholder index when the decoration
                    // range is empty but when the placeholder wasn't. that's a strong
                    // hint that the placeholder has been deleted. (all placeholder must match this)
                    couldSkipThisPlaceholder = couldSkipThisPlaceholder && this.l(placeholder);
                    accessor.changeDecorationOptions(id, placeholder.isFinalTabstop ? $k6.f.activeFinal : $k6.f.active);
                    activePlaceholders.add(placeholder);
                    for (const enclosingPlaceholder of this.h.enclosingPlaceholders(placeholder)) {
                        const id = this.c.get(enclosingPlaceholder);
                        accessor.changeDecorationOptions(id, enclosingPlaceholder.isFinalTabstop ? $k6.f.activeFinal : $k6.f.active);
                        activePlaceholders.add(enclosingPlaceholder);
                    }
                }
                // change stickness to never grow when typing at its edges
                // so that in-active tabstops never grow
                for (const [placeholder, id] of this.c) {
                    if (!activePlaceholders.has(placeholder)) {
                        accessor.changeDecorationOptions(id, placeholder.isFinalTabstop ? $k6.f.inactiveFinal : $k6.f.inactive);
                    }
                }
                return selections;
            });
            return !couldSkipThisPlaceholder ? newSelections ?? [] : this.move(fwd);
        }
        l(placeholder) {
            // A placeholder is empty when it wasn't empty when authored but
            // when its tracking decoration is empty. This also applies to all
            // potential parent placeholders
            let marker = placeholder;
            while (marker) {
                if (marker instanceof snippetParser_1.$A5) {
                    const id = this.c.get(marker);
                    const range = this.g.getModel().getDecorationRange(id);
                    if (range.isEmpty() && marker.toString().length > 0) {
                        return true;
                    }
                }
                marker = marker.parent;
            }
            return false;
        }
        get isAtFirstPlaceholder() {
            return this._placeholderGroupsIdx <= 0 || this.d.length === 0;
        }
        get isAtLastPlaceholder() {
            return this._placeholderGroupsIdx === this.d.length - 1;
        }
        get hasPlaceholder() {
            return this.h.placeholders.length > 0;
        }
        /**
         * A snippet is trivial when it has no placeholder or only a final placeholder at
         * its very end
         */
        get isTrivialSnippet() {
            if (this.h.placeholders.length === 0) {
                return true;
            }
            if (this.h.placeholders.length === 1) {
                const [placeholder] = this.h.placeholders;
                if (placeholder.isFinalTabstop) {
                    if (this.h.rightMostDescendant === placeholder) {
                        return true;
                    }
                }
            }
            return false;
        }
        computePossibleSelections() {
            const result = new Map();
            for (const placeholdersWithEqualIndex of this.d) {
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
                    const id = this.c.get(placeholder);
                    const range = this.g.getModel().getDecorationRange(id);
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
            if (!this.c) {
                return undefined;
            }
            const placeholder = this.d[this._placeholderGroupsIdx][0];
            if (!placeholder?.choice) {
                return undefined;
            }
            const id = this.c.get(placeholder);
            if (!id) {
                return undefined;
            }
            const range = this.g.getModel().getDecorationRange(id);
            if (!range) {
                return undefined;
            }
            return { range, choice: placeholder.choice };
        }
        get hasChoice() {
            let result = false;
            this.h.walk(marker => {
                result = marker instanceof snippetParser_1.$B5;
                return !result;
            });
            return result;
        }
        merge(others) {
            const model = this.g.getModel();
            this._nestingLevel *= 10;
            this.g.changeDecorations(accessor => {
                // For each active placeholder take one snippet and merge it
                // in that the placeholder (can be many for `$1foo$1foo`). Because
                // everything is sorted by editor selection we can simply remove
                // elements from the beginning of the array
                for (const placeholder of this.d[this._placeholderGroupsIdx]) {
                    const nested = others.shift();
                    console.assert(nested.e !== -1);
                    console.assert(!nested.c);
                    // Massage placeholder-indicies of the nested snippet to be
                    // sorted right after the insertion point. This ensures we move
                    // through the placeholders in the correct order
                    const indexLastPlaceholder = nested.h.placeholderInfo.last.index;
                    for (const nestedPlaceholder of nested.h.placeholderInfo.all) {
                        if (nestedPlaceholder.isFinalTabstop) {
                            nestedPlaceholder.index = placeholder.index + ((indexLastPlaceholder + 1) / this._nestingLevel);
                        }
                        else {
                            nestedPlaceholder.index = placeholder.index + (nestedPlaceholder.index / this._nestingLevel);
                        }
                    }
                    this.h.replace(placeholder, nested.h.children);
                    // Remove the placeholder at which position are inserting
                    // the snippet and also remove its decoration.
                    const id = this.c.get(placeholder);
                    accessor.removeDecoration(id);
                    this.c.delete(placeholder);
                    // For each *new* placeholder we create decoration to monitor
                    // how and if it grows/shrinks.
                    for (const placeholder of nested.h.placeholders) {
                        const placeholderOffset = nested.h.offset(placeholder);
                        const placeholderLen = nested.h.fullLen(placeholder);
                        const range = range_1.$ks.fromPositions(model.getPositionAt(nested.e + placeholderOffset), model.getPositionAt(nested.e + placeholderOffset + placeholderLen));
                        const handle = accessor.addDecoration(range, $k6.f.inactive);
                        this.c.set(placeholder, handle);
                    }
                }
                // Last, re-create the placeholder groups by sorting placeholders by their index.
                this.d = (0, arrays_1.$xb)(this.h.placeholders, snippetParser_1.$A5.compareByIndex);
            });
        }
        getEnclosingRange() {
            let result;
            const model = this.g.getModel();
            for (const decorationId of this.c.values()) {
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
    exports.$k6 = $k6;
    const _defaultOptions = {
        overwriteBefore: 0,
        overwriteAfter: 0,
        adjustWhitespace: true,
        clipboardText: undefined,
        overtypingCapturer: undefined
    };
    let $l6 = $l6_1 = class $l6 {
        static adjustWhitespace(model, position, adjustIndentation, snippet, filter) {
            const line = model.getLineContent(position.lineNumber);
            const lineLeadingWhitespace = (0, strings_1.$Ce)(line, 0, position.column - 1);
            // the snippet as inserted
            let snippetTextString;
            snippet.walk(marker => {
                // all text elements that are not inside choice
                if (!(marker instanceof snippetParser_1.$y5) || marker.parent instanceof snippetParser_1.$B5) {
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
                    marker.parent.replace(marker, [new snippetParser_1.$y5(newValue)]);
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
                selection = selection_1.$ms.createWithDirection(range.startLineNumber, range.startColumn, range.endLineNumber, range.endColumn, selection.getDirection());
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
            const workspaceService = editor.invokeWithinContext(accessor => accessor.get(workspace_1.$Kh));
            const modelBasedVariableResolver = editor.invokeWithinContext(accessor => new snippetVariables_1.$e6(accessor.get(label_1.$Vz), model));
            const readClipboardText = () => clipboardText;
            // know what text the overwrite[Before|After] extensions
            // of the primary curser have selected because only when
            // secondary selections extend to the same text we can grow them
            const firstBeforeText = model.getValueInRange($l6_1.adjustSelection(model, editor.getSelection(), overwriteBefore, 0));
            const firstAfterText = model.getValueInRange($l6_1.adjustSelection(model, editor.getSelection(), 0, overwriteAfter));
            // remember the first non-whitespace column to decide if
            // `keepWhitespace` should be overruled for secondary selections
            const firstLineFirstNonWhitespace = model.getLineFirstNonWhitespaceColumn(editor.getSelection().positionLineNumber);
            // sort selections by their start position but remeber
            // the original index. that allows you to create correct
            // offset-based selection logic without changing the
            // primary selection
            const indexedSelections = editor.getSelections()
                .map((selection, idx) => ({ selection, idx }))
                .sort((a, b) => range_1.$ks.compareRangesUsingStarts(a.selection, b.selection));
            for (const { selection, idx } of indexedSelections) {
                // extend selection with the `overwriteBefore` and `overwriteAfter` and then
                // compare if this matches the extensions of the primary selection
                let extensionBefore = $l6_1.adjustSelection(model, selection, overwriteBefore, 0);
                let extensionAfter = $l6_1.adjustSelection(model, selection, 0, overwriteAfter);
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
                const snippet = new snippetParser_1.$G5().parse(template, true, enforceFinalTabstop);
                // adjust the template string to match the indentation and
                // whitespace rules of this insert location (can be different for each cursor)
                // happens when being asked for (default) or when this is a secondary
                // cursor and the leading whitespace is different
                const start = snippetSelection.getStartPosition();
                const snippetLineLeadingWhitespace = $l6_1.adjustWhitespace(model, start, adjustWhitespace || (idx > 0 && firstLineFirstNonWhitespace !== model.getLineFirstNonWhitespaceColumn(selection.positionLineNumber)), snippet);
                snippet.resolveVariables(new snippetVariables_1.$c6([
                    modelBasedVariableResolver,
                    new snippetVariables_1.$f6(readClipboardText, idx, indexedSelections.length, editor.getOption(78 /* EditorOption.multiCursorPaste */) === 'spread'),
                    new snippetVariables_1.$d6(model, selection, idx, overtypingCapturer),
                    new snippetVariables_1.$g6(model, selection, languageConfigurationService),
                    new snippetVariables_1.$h6,
                    new snippetVariables_1.$i6(workspaceService),
                    new snippetVariables_1.$j6,
                ]));
                // store snippets with the index of their originating selection.
                // that ensures the primiary cursor stays primary despite not being
                // the one with lowest start position
                edits[idx] = editOperation_1.$ls.replace(snippetSelection, snippet.toString());
                edits[idx].identifier = { major: idx, minor: 0 }; // mark the edit so only our undo edits will be used to generate end cursors
                edits[idx]._isTracked = true;
                snippets[idx] = new $k6(editor, snippet, snippetLineLeadingWhitespace);
            }
            return { edits, snippets };
        }
        static createEditsAndSnippetsFromEdits(editor, snippetEdits, enforceFinalTabstop, adjustWhitespace, clipboardText, overtypingCapturer, languageConfigurationService) {
            if (!editor.hasModel() || snippetEdits.length === 0) {
                return { edits: [], snippets: [] };
            }
            const edits = [];
            const model = editor.getModel();
            const parser = new snippetParser_1.$G5();
            const snippet = new snippetParser_1.$F5();
            // snippet variables resolver
            const resolver = new snippetVariables_1.$c6([
                editor.invokeWithinContext(accessor => new snippetVariables_1.$e6(accessor.get(label_1.$Vz), model)),
                new snippetVariables_1.$f6(() => clipboardText, 0, editor.getSelections().length, editor.getOption(78 /* EditorOption.multiCursorPaste */) === 'spread'),
                new snippetVariables_1.$d6(model, editor.getSelection(), 0, overtypingCapturer),
                new snippetVariables_1.$g6(model, editor.getSelection(), languageConfigurationService),
                new snippetVariables_1.$h6,
                new snippetVariables_1.$i6(editor.invokeWithinContext(accessor => accessor.get(workspace_1.$Kh))),
                new snippetVariables_1.$j6,
            ]);
            //
            snippetEdits = snippetEdits.sort((a, b) => range_1.$ks.compareRangesUsingStarts(a.range, b.range));
            let offset = 0;
            for (let i = 0; i < snippetEdits.length; i++) {
                const { range, template } = snippetEdits[i];
                // gaps between snippet edits are appended as text nodes. this
                // ensures placeholder-offsets are later correct
                if (i > 0) {
                    const lastRange = snippetEdits[i - 1].range;
                    const textRange = range_1.$ks.fromPositions(lastRange.getEndPosition(), range.getStartPosition());
                    const textNode = new snippetParser_1.$y5(model.getValueInRange(textRange));
                    snippet.appendChild(textNode);
                    offset += textNode.value.length;
                }
                const newNodes = parser.parseFragment(template, snippet);
                $l6_1.adjustWhitespace(model, range.getStartPosition(), true, snippet, new Set(newNodes));
                snippet.resolveVariables(resolver);
                const snippetText = snippet.toString();
                const snippetFragmentText = snippetText.slice(offset);
                offset = snippetText.length;
                // make edit
                const edit = editOperation_1.$ls.replace(range, snippetFragmentText);
                edit.identifier = { major: i, minor: 0 }; // mark the edit so only our undo edits will be used to generate end cursors
                edit._isTracked = true;
                edits.push(edit);
            }
            //
            parser.ensureFinalTabstop(snippet, enforceFinalTabstop, true);
            return {
                edits,
                snippets: [new $k6(editor, snippet, '')]
            };
        }
        constructor(e, f, g = _defaultOptions, h) {
            this.e = e;
            this.f = f;
            this.g = g;
            this.h = h;
            this.c = [];
            this.d = [];
        }
        dispose() {
            (0, lifecycle_1.$fc)(this.d);
        }
        _logInfo() {
            return `template="${this.f}", merged_templates="${this.c.join(' -> ')}"`;
        }
        insert() {
            if (!this.e.hasModel()) {
                return;
            }
            // make insert edit and start with first selections
            const { edits, snippets } = typeof this.f === 'string'
                ? $l6_1.createEditsAndSnippetsFromSelections(this.e, this.f, this.g.overwriteBefore, this.g.overwriteAfter, false, this.g.adjustWhitespace, this.g.clipboardText, this.g.overtypingCapturer, this.h)
                : $l6_1.createEditsAndSnippetsFromEdits(this.e, this.f, false, this.g.adjustWhitespace, this.g.clipboardText, this.g.overtypingCapturer, this.h);
            this.d = snippets;
            this.e.executeEdits('snippet', edits, _undoEdits => {
                // Sometimes, the text buffer will remove automatic whitespace when doing any edits,
                // so we need to look only at the undo edits relevant for us.
                // Our edits have an identifier set so that's how we can distinguish them
                const undoEdits = _undoEdits.filter(edit => !!edit.identifier);
                for (let idx = 0; idx < snippets.length; idx++) {
                    snippets[idx].initialize(undoEdits[idx].textChange);
                }
                if (this.d[0].hasPlaceholder) {
                    return this.j(true);
                }
                else {
                    return undoEdits
                        .map(edit => selection_1.$ms.fromPositions(edit.range.getEndPosition()));
                }
            });
            this.e.revealRange(this.e.getSelections()[0]);
        }
        merge(template, options = _defaultOptions) {
            if (!this.e.hasModel()) {
                return;
            }
            this.c.push([this.d[0]._nestingLevel, this.d[0]._placeholderGroupsIdx, template]);
            const { edits, snippets } = $l6_1.createEditsAndSnippetsFromSelections(this.e, template, options.overwriteBefore, options.overwriteAfter, true, options.adjustWhitespace, options.clipboardText, options.overtypingCapturer, this.h);
            this.e.executeEdits('snippet', edits, _undoEdits => {
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
                    for (const snippet of this.d) {
                        snippet.merge(snippets);
                    }
                    console.assert(snippets.length === 0);
                }
                if (this.d[0].hasPlaceholder && !isTrivialSnippet) {
                    return this.j(undefined);
                }
                else {
                    return undoEdits.map(edit => selection_1.$ms.fromPositions(edit.range.getEndPosition()));
                }
            });
        }
        next() {
            const newSelections = this.j(true);
            this.e.setSelections(newSelections);
            this.e.revealPositionInCenterIfOutsideViewport(newSelections[0].getPosition());
        }
        prev() {
            const newSelections = this.j(false);
            this.e.setSelections(newSelections);
            this.e.revealPositionInCenterIfOutsideViewport(newSelections[0].getPosition());
        }
        j(fwd) {
            const selections = [];
            for (const snippet of this.d) {
                const oneSelection = snippet.move(fwd);
                selections.push(...oneSelection);
            }
            return selections;
        }
        get isAtFirstPlaceholder() {
            return this.d[0].isAtFirstPlaceholder;
        }
        get isAtLastPlaceholder() {
            return this.d[0].isAtLastPlaceholder;
        }
        get hasPlaceholder() {
            return this.d[0].hasPlaceholder;
        }
        get hasChoice() {
            return this.d[0].hasChoice;
        }
        get activeChoice() {
            return this.d[0].activeChoice;
        }
        isSelectionWithinPlaceholders() {
            if (!this.hasPlaceholder) {
                return false;
            }
            const selections = this.e.getSelections();
            if (selections.length < this.d.length) {
                // this means we started snippet mode with N
                // selections and have M (N > M) selections.
                // So one snippet is without selection -> cancel
                return false;
            }
            const allPossibleSelections = new Map();
            for (const snippet of this.d) {
                const possibleSelections = snippet.computePossibleSelections();
                // for the first snippet find the placeholder (and its ranges)
                // that contain at least one selection. for all remaining snippets
                // the same placeholder (and their ranges) must be used.
                if (allPossibleSelections.size === 0) {
                    for (const [index, ranges] of possibleSelections) {
                        ranges.sort(range_1.$ks.compareRangesUsingStarts);
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
            selections.sort(range_1.$ks.compareRangesUsingStarts);
            for (const [index, ranges] of allPossibleSelections) {
                if (ranges.length !== selections.length) {
                    allPossibleSelections.delete(index);
                    continue;
                }
                ranges.sort(range_1.$ks.compareRangesUsingStarts);
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
            for (const snippet of this.d) {
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
    exports.$l6 = $l6;
    exports.$l6 = $l6 = $l6_1 = __decorate([
        __param(3, languageConfigurationRegistry_1.$2t)
    ], $l6);
});
//# sourceMappingURL=snippetSession.js.map