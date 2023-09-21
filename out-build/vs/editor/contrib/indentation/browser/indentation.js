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
define(["require", "exports", "vs/base/common/lifecycle", "vs/base/common/strings", "vs/editor/browser/editorExtensions", "vs/editor/common/commands/shiftCommand", "vs/editor/common/core/editOperation", "vs/editor/common/core/range", "vs/editor/common/core/selection", "vs/editor/common/editorContextKeys", "vs/editor/common/languages/languageConfigurationRegistry", "vs/editor/common/services/model", "vs/editor/contrib/indentation/browser/indentUtils", "vs/nls!vs/editor/contrib/indentation/browser/indentation", "vs/platform/quickinput/common/quickInput", "vs/editor/common/core/indentation", "vs/editor/common/languages/autoIndent"], function (require, exports, lifecycle_1, strings, editorExtensions_1, shiftCommand_1, editOperation_1, range_1, selection_1, editorContextKeys_1, languageConfigurationRegistry_1, model_1, indentUtils, nls, quickInput_1, indentation_1, autoIndent_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$j9 = exports.$i9 = exports.$h9 = exports.$g9 = exports.$f9 = exports.$e9 = exports.$d9 = exports.$c9 = exports.$b9 = exports.$a9 = exports.$_8 = exports.$$8 = exports.$08 = exports.$98 = void 0;
    function $98(model, languageConfigurationService, startLineNumber, endLineNumber, inheritedIndent) {
        if (model.getLineCount() === 1 && model.getLineMaxColumn(1) === 1) {
            // Model is empty
            return [];
        }
        const indentationRules = languageConfigurationService.getLanguageConfiguration(model.getLanguageId()).indentationRules;
        if (!indentationRules) {
            return [];
        }
        endLineNumber = Math.min(endLineNumber, model.getLineCount());
        // Skip `unIndentedLinePattern` lines
        while (startLineNumber <= endLineNumber) {
            if (!indentationRules.unIndentedLinePattern) {
                break;
            }
            const text = model.getLineContent(startLineNumber);
            if (!indentationRules.unIndentedLinePattern.test(text)) {
                break;
            }
            startLineNumber++;
        }
        if (startLineNumber > endLineNumber - 1) {
            return [];
        }
        const { tabSize, indentSize, insertSpaces } = model.getOptions();
        const shiftIndent = (indentation, count) => {
            count = count || 1;
            return shiftCommand_1.$8V.shiftIndent(indentation, indentation.length + count, tabSize, indentSize, insertSpaces);
        };
        const unshiftIndent = (indentation, count) => {
            count = count || 1;
            return shiftCommand_1.$8V.unshiftIndent(indentation, indentation.length + count, tabSize, indentSize, insertSpaces);
        };
        const indentEdits = [];
        // indentation being passed to lines below
        let globalIndent;
        // Calculate indentation for the first line
        // If there is no passed-in indentation, we use the indentation of the first line as base.
        const currentLineText = model.getLineContent(startLineNumber);
        let adjustedLineContent = currentLineText;
        if (inheritedIndent !== undefined && inheritedIndent !== null) {
            globalIndent = inheritedIndent;
            const oldIndentation = strings.$Ce(currentLineText);
            adjustedLineContent = globalIndent + currentLineText.substring(oldIndentation.length);
            if (indentationRules.decreaseIndentPattern && indentationRules.decreaseIndentPattern.test(adjustedLineContent)) {
                globalIndent = unshiftIndent(globalIndent);
                adjustedLineContent = globalIndent + currentLineText.substring(oldIndentation.length);
            }
            if (currentLineText !== adjustedLineContent) {
                indentEdits.push(editOperation_1.$ls.replaceMove(new selection_1.$ms(startLineNumber, 1, startLineNumber, oldIndentation.length + 1), (0, indentation_1.$HA)(globalIndent, indentSize, insertSpaces)));
            }
        }
        else {
            globalIndent = strings.$Ce(currentLineText);
        }
        // idealIndentForNextLine doesn't equal globalIndent when there is a line matching `indentNextLinePattern`.
        let idealIndentForNextLine = globalIndent;
        if (indentationRules.increaseIndentPattern && indentationRules.increaseIndentPattern.test(adjustedLineContent)) {
            idealIndentForNextLine = shiftIndent(idealIndentForNextLine);
            globalIndent = shiftIndent(globalIndent);
        }
        else if (indentationRules.indentNextLinePattern && indentationRules.indentNextLinePattern.test(adjustedLineContent)) {
            idealIndentForNextLine = shiftIndent(idealIndentForNextLine);
        }
        startLineNumber++;
        // Calculate indentation adjustment for all following lines
        for (let lineNumber = startLineNumber; lineNumber <= endLineNumber; lineNumber++) {
            const text = model.getLineContent(lineNumber);
            const oldIndentation = strings.$Ce(text);
            const adjustedLineContent = idealIndentForNextLine + text.substring(oldIndentation.length);
            if (indentationRules.decreaseIndentPattern && indentationRules.decreaseIndentPattern.test(adjustedLineContent)) {
                idealIndentForNextLine = unshiftIndent(idealIndentForNextLine);
                globalIndent = unshiftIndent(globalIndent);
            }
            if (oldIndentation !== idealIndentForNextLine) {
                indentEdits.push(editOperation_1.$ls.replaceMove(new selection_1.$ms(lineNumber, 1, lineNumber, oldIndentation.length + 1), (0, indentation_1.$HA)(idealIndentForNextLine, indentSize, insertSpaces)));
            }
            // calculate idealIndentForNextLine
            if (indentationRules.unIndentedLinePattern && indentationRules.unIndentedLinePattern.test(text)) {
                // In reindent phase, if the line matches `unIndentedLinePattern` we inherit indentation from above lines
                // but don't change globalIndent and idealIndentForNextLine.
                continue;
            }
            else if (indentationRules.increaseIndentPattern && indentationRules.increaseIndentPattern.test(adjustedLineContent)) {
                globalIndent = shiftIndent(globalIndent);
                idealIndentForNextLine = globalIndent;
            }
            else if (indentationRules.indentNextLinePattern && indentationRules.indentNextLinePattern.test(adjustedLineContent)) {
                idealIndentForNextLine = shiftIndent(idealIndentForNextLine);
            }
            else {
                idealIndentForNextLine = globalIndent;
            }
        }
        return indentEdits;
    }
    exports.$98 = $98;
    class $08 extends editorExtensions_1.$sV {
        static { this.ID = 'editor.action.indentationToSpaces'; }
        constructor() {
            super({
                id: $08.ID,
                label: nls.localize(0, null),
                alias: 'Convert Indentation to Spaces',
                precondition: editorContextKeys_1.EditorContextKeys.writable
            });
        }
        run(accessor, editor) {
            const model = editor.getModel();
            if (!model) {
                return;
            }
            const modelOpts = model.getOptions();
            const selection = editor.getSelection();
            if (!selection) {
                return;
            }
            const command = new $i9(selection, modelOpts.tabSize);
            editor.pushUndoStop();
            editor.executeCommands(this.id, [command]);
            editor.pushUndoStop();
            model.updateOptions({
                insertSpaces: true
            });
        }
    }
    exports.$08 = $08;
    class $$8 extends editorExtensions_1.$sV {
        static { this.ID = 'editor.action.indentationToTabs'; }
        constructor() {
            super({
                id: $$8.ID,
                label: nls.localize(1, null),
                alias: 'Convert Indentation to Tabs',
                precondition: editorContextKeys_1.EditorContextKeys.writable
            });
        }
        run(accessor, editor) {
            const model = editor.getModel();
            if (!model) {
                return;
            }
            const modelOpts = model.getOptions();
            const selection = editor.getSelection();
            if (!selection) {
                return;
            }
            const command = new $j9(selection, modelOpts.tabSize);
            editor.pushUndoStop();
            editor.executeCommands(this.id, [command]);
            editor.pushUndoStop();
            model.updateOptions({
                insertSpaces: false
            });
        }
    }
    exports.$$8 = $$8;
    class $_8 extends editorExtensions_1.$sV {
        constructor(d, e, opts) {
            super(opts);
            this.d = d;
            this.e = e;
        }
        run(accessor, editor) {
            const quickInputService = accessor.get(quickInput_1.$Gq);
            const modelService = accessor.get(model_1.$yA);
            const model = editor.getModel();
            if (!model) {
                return;
            }
            const creationOpts = modelService.getCreationOptions(model.getLanguageId(), model.uri, model.isForSimpleWidget);
            const modelOpts = model.getOptions();
            const picks = [1, 2, 3, 4, 5, 6, 7, 8].map(n => ({
                id: n.toString(),
                label: n.toString(),
                // add description for tabSize value set in the configuration
                description: (n === creationOpts.tabSize && n === modelOpts.tabSize
                    ? nls.localize(2, null)
                    : n === creationOpts.tabSize
                        ? nls.localize(3, null)
                        : n === modelOpts.tabSize
                            ? nls.localize(4, null)
                            : undefined)
            }));
            // auto focus the tabSize set for the current editor
            const autoFocusIndex = Math.min(model.getOptions().tabSize - 1, 7);
            setTimeout(() => {
                quickInputService.pick(picks, { placeHolder: nls.localize(5, null), activeItem: picks[autoFocusIndex] }).then(pick => {
                    if (pick) {
                        if (model && !model.isDisposed()) {
                            const pickedVal = parseInt(pick.label, 10);
                            if (this.e) {
                                model.updateOptions({
                                    tabSize: pickedVal
                                });
                            }
                            else {
                                model.updateOptions({
                                    tabSize: pickedVal,
                                    indentSize: pickedVal,
                                    insertSpaces: this.d
                                });
                            }
                        }
                    }
                });
            }, 50 /* quick input is sensitive to being opened so soon after another */);
        }
    }
    exports.$_8 = $_8;
    class $a9 extends $_8 {
        static { this.ID = 'editor.action.indentUsingTabs'; }
        constructor() {
            super(false, false, {
                id: $a9.ID,
                label: nls.localize(6, null),
                alias: 'Indent Using Tabs',
                precondition: undefined
            });
        }
    }
    exports.$a9 = $a9;
    class $b9 extends $_8 {
        static { this.ID = 'editor.action.indentUsingSpaces'; }
        constructor() {
            super(true, false, {
                id: $b9.ID,
                label: nls.localize(7, null),
                alias: 'Indent Using Spaces',
                precondition: undefined
            });
        }
    }
    exports.$b9 = $b9;
    class $c9 extends $_8 {
        static { this.ID = 'editor.action.changeTabDisplaySize'; }
        constructor() {
            super(true, true, {
                id: $c9.ID,
                label: nls.localize(8, null),
                alias: 'Change Tab Display Size',
                precondition: undefined
            });
        }
    }
    exports.$c9 = $c9;
    class $d9 extends editorExtensions_1.$sV {
        static { this.ID = 'editor.action.detectIndentation'; }
        constructor() {
            super({
                id: $d9.ID,
                label: nls.localize(9, null),
                alias: 'Detect Indentation from Content',
                precondition: undefined
            });
        }
        run(accessor, editor) {
            const modelService = accessor.get(model_1.$yA);
            const model = editor.getModel();
            if (!model) {
                return;
            }
            const creationOpts = modelService.getCreationOptions(model.getLanguageId(), model.uri, model.isForSimpleWidget);
            model.detectIndentation(creationOpts.insertSpaces, creationOpts.tabSize);
        }
    }
    exports.$d9 = $d9;
    class $e9 extends editorExtensions_1.$sV {
        constructor() {
            super({
                id: 'editor.action.reindentlines',
                label: nls.localize(10, null),
                alias: 'Reindent Lines',
                precondition: editorContextKeys_1.EditorContextKeys.writable
            });
        }
        run(accessor, editor) {
            const languageConfigurationService = accessor.get(languageConfigurationRegistry_1.$2t);
            const model = editor.getModel();
            if (!model) {
                return;
            }
            const edits = $98(model, languageConfigurationService, 1, model.getLineCount());
            if (edits.length > 0) {
                editor.pushUndoStop();
                editor.executeEdits(this.id, edits);
                editor.pushUndoStop();
            }
        }
    }
    exports.$e9 = $e9;
    class $f9 extends editorExtensions_1.$sV {
        constructor() {
            super({
                id: 'editor.action.reindentselectedlines',
                label: nls.localize(11, null),
                alias: 'Reindent Selected Lines',
                precondition: editorContextKeys_1.EditorContextKeys.writable
            });
        }
        run(accessor, editor) {
            const languageConfigurationService = accessor.get(languageConfigurationRegistry_1.$2t);
            const model = editor.getModel();
            if (!model) {
                return;
            }
            const selections = editor.getSelections();
            if (selections === null) {
                return;
            }
            const edits = [];
            for (const selection of selections) {
                let startLineNumber = selection.startLineNumber;
                let endLineNumber = selection.endLineNumber;
                if (startLineNumber !== endLineNumber && selection.endColumn === 1) {
                    endLineNumber--;
                }
                if (startLineNumber === 1) {
                    if (startLineNumber === endLineNumber) {
                        continue;
                    }
                }
                else {
                    startLineNumber--;
                }
                const editOperations = $98(model, languageConfigurationService, startLineNumber, endLineNumber);
                edits.push(...editOperations);
            }
            if (edits.length > 0) {
                editor.pushUndoStop();
                editor.executeEdits(this.id, edits);
                editor.pushUndoStop();
            }
        }
    }
    exports.$f9 = $f9;
    class $g9 {
        constructor(edits, initialSelection) {
            this.b = initialSelection;
            this.a = [];
            this.c = null;
            for (const edit of edits) {
                if (edit.range && typeof edit.text === 'string') {
                    this.a.push(edit);
                }
            }
        }
        getEditOperations(model, builder) {
            for (const edit of this.a) {
                builder.addEditOperation(range_1.$ks.lift(edit.range), edit.text);
            }
            let selectionIsSet = false;
            if (Array.isArray(this.a) && this.a.length === 1 && this.b.isEmpty()) {
                if (this.a[0].range.startColumn === this.b.endColumn &&
                    this.a[0].range.startLineNumber === this.b.endLineNumber) {
                    selectionIsSet = true;
                    this.c = builder.trackSelection(this.b, true);
                }
                else if (this.a[0].range.endColumn === this.b.startColumn &&
                    this.a[0].range.endLineNumber === this.b.startLineNumber) {
                    selectionIsSet = true;
                    this.c = builder.trackSelection(this.b, false);
                }
            }
            if (!selectionIsSet) {
                this.c = builder.trackSelection(this.b);
            }
        }
        computeCursorState(model, helper) {
            return helper.getTrackedSelection(this.c);
        }
    }
    exports.$g9 = $g9;
    let $h9 = class $h9 {
        static { this.ID = 'editor.contrib.autoIndentOnPaste'; }
        constructor(c, d) {
            this.c = c;
            this.d = d;
            this.a = new lifecycle_1.$jc();
            this.b = new lifecycle_1.$jc();
            this.a.add(c.onDidChangeConfiguration(() => this.e()));
            this.a.add(c.onDidChangeModel(() => this.e()));
            this.a.add(c.onDidChangeModelLanguage(() => this.e()));
        }
        e() {
            // clean up
            this.b.clear();
            // we are disabled
            if (this.c.getOption(12 /* EditorOption.autoIndent */) < 4 /* EditorAutoIndentStrategy.Full */ || this.c.getOption(55 /* EditorOption.formatOnPaste */)) {
                return;
            }
            // no model
            if (!this.c.hasModel()) {
                return;
            }
            this.b.add(this.c.onDidPaste(({ range }) => {
                this.trigger(range);
            }));
        }
        trigger(range) {
            const selections = this.c.getSelections();
            if (selections === null || selections.length > 1) {
                return;
            }
            const model = this.c.getModel();
            if (!model) {
                return;
            }
            if (!model.tokenization.isCheapToTokenize(range.getStartPosition().lineNumber)) {
                return;
            }
            const autoIndent = this.c.getOption(12 /* EditorOption.autoIndent */);
            const { tabSize, indentSize, insertSpaces } = model.getOptions();
            const textEdits = [];
            const indentConverter = {
                shiftIndent: (indentation) => {
                    return shiftCommand_1.$8V.shiftIndent(indentation, indentation.length + 1, tabSize, indentSize, insertSpaces);
                },
                unshiftIndent: (indentation) => {
                    return shiftCommand_1.$8V.unshiftIndent(indentation, indentation.length + 1, tabSize, indentSize, insertSpaces);
                }
            };
            let startLineNumber = range.startLineNumber;
            while (startLineNumber <= range.endLineNumber) {
                if (this.f(model, startLineNumber)) {
                    startLineNumber++;
                    continue;
                }
                break;
            }
            if (startLineNumber > range.endLineNumber) {
                return;
            }
            let firstLineText = model.getLineContent(startLineNumber);
            if (!/\S/.test(firstLineText.substring(0, range.startColumn - 1))) {
                const indentOfFirstLine = (0, autoIndent_1.$_V)(autoIndent, model, model.getLanguageId(), startLineNumber, indentConverter, this.d);
                if (indentOfFirstLine !== null) {
                    const oldIndentation = strings.$Ce(firstLineText);
                    const newSpaceCnt = indentUtils.$78(indentOfFirstLine, tabSize);
                    const oldSpaceCnt = indentUtils.$78(oldIndentation, tabSize);
                    if (newSpaceCnt !== oldSpaceCnt) {
                        const newIndent = indentUtils.$88(newSpaceCnt, tabSize, insertSpaces);
                        textEdits.push({
                            range: new range_1.$ks(startLineNumber, 1, startLineNumber, oldIndentation.length + 1),
                            text: newIndent
                        });
                        firstLineText = newIndent + firstLineText.substr(oldIndentation.length);
                    }
                    else {
                        const indentMetadata = (0, autoIndent_1.$cW)(model, startLineNumber, this.d);
                        if (indentMetadata === 0 || indentMetadata === 8 /* IndentConsts.UNINDENT_MASK */) {
                            // we paste content into a line where only contains whitespaces
                            // after pasting, the indentation of the first line is already correct
                            // the first line doesn't match any indentation rule
                            // then no-op.
                            return;
                        }
                    }
                }
            }
            const firstLineNumber = startLineNumber;
            // ignore empty or ignored lines
            while (startLineNumber < range.endLineNumber) {
                if (!/\S/.test(model.getLineContent(startLineNumber + 1))) {
                    startLineNumber++;
                    continue;
                }
                break;
            }
            if (startLineNumber !== range.endLineNumber) {
                const virtualModel = {
                    tokenization: {
                        getLineTokens: (lineNumber) => {
                            return model.tokenization.getLineTokens(lineNumber);
                        },
                        getLanguageId: () => {
                            return model.getLanguageId();
                        },
                        getLanguageIdAtPosition: (lineNumber, column) => {
                            return model.getLanguageIdAtPosition(lineNumber, column);
                        },
                    },
                    getLineContent: (lineNumber) => {
                        if (lineNumber === firstLineNumber) {
                            return firstLineText;
                        }
                        else {
                            return model.getLineContent(lineNumber);
                        }
                    }
                };
                const indentOfSecondLine = (0, autoIndent_1.$_V)(autoIndent, virtualModel, model.getLanguageId(), startLineNumber + 1, indentConverter, this.d);
                if (indentOfSecondLine !== null) {
                    const newSpaceCntOfSecondLine = indentUtils.$78(indentOfSecondLine, tabSize);
                    const oldSpaceCntOfSecondLine = indentUtils.$78(strings.$Ce(model.getLineContent(startLineNumber + 1)), tabSize);
                    if (newSpaceCntOfSecondLine !== oldSpaceCntOfSecondLine) {
                        const spaceCntOffset = newSpaceCntOfSecondLine - oldSpaceCntOfSecondLine;
                        for (let i = startLineNumber + 1; i <= range.endLineNumber; i++) {
                            const lineContent = model.getLineContent(i);
                            const originalIndent = strings.$Ce(lineContent);
                            const originalSpacesCnt = indentUtils.$78(originalIndent, tabSize);
                            const newSpacesCnt = originalSpacesCnt + spaceCntOffset;
                            const newIndent = indentUtils.$88(newSpacesCnt, tabSize, insertSpaces);
                            if (newIndent !== originalIndent) {
                                textEdits.push({
                                    range: new range_1.$ks(i, 1, i, originalIndent.length + 1),
                                    text: newIndent
                                });
                            }
                        }
                    }
                }
            }
            if (textEdits.length > 0) {
                this.c.pushUndoStop();
                const cmd = new $g9(textEdits, this.c.getSelection());
                this.c.executeCommand('autoIndentOnPaste', cmd);
                this.c.pushUndoStop();
            }
        }
        f(model, lineNumber) {
            model.tokenization.forceTokenization(lineNumber);
            const nonWhitespaceColumn = model.getLineFirstNonWhitespaceColumn(lineNumber);
            if (nonWhitespaceColumn === 0) {
                return true;
            }
            const tokens = model.tokenization.getLineTokens(lineNumber);
            if (tokens.getCount() > 0) {
                const firstNonWhitespaceTokenIndex = tokens.findTokenIndexAtOffset(nonWhitespaceColumn);
                if (firstNonWhitespaceTokenIndex >= 0 && tokens.getStandardTokenType(firstNonWhitespaceTokenIndex) === 1 /* StandardTokenType.Comment */) {
                    return true;
                }
            }
            return false;
        }
        dispose() {
            this.a.dispose();
            this.b.dispose();
        }
    };
    exports.$h9 = $h9;
    exports.$h9 = $h9 = __decorate([
        __param(1, languageConfigurationRegistry_1.$2t)
    ], $h9);
    function getIndentationEditOperations(model, builder, tabSize, tabsToSpaces) {
        if (model.getLineCount() === 1 && model.getLineMaxColumn(1) === 1) {
            // Model is empty
            return;
        }
        let spaces = '';
        for (let i = 0; i < tabSize; i++) {
            spaces += ' ';
        }
        const spacesRegExp = new RegExp(spaces, 'gi');
        for (let lineNumber = 1, lineCount = model.getLineCount(); lineNumber <= lineCount; lineNumber++) {
            let lastIndentationColumn = model.getLineFirstNonWhitespaceColumn(lineNumber);
            if (lastIndentationColumn === 0) {
                lastIndentationColumn = model.getLineMaxColumn(lineNumber);
            }
            if (lastIndentationColumn === 1) {
                continue;
            }
            const originalIndentationRange = new range_1.$ks(lineNumber, 1, lineNumber, lastIndentationColumn);
            const originalIndentation = model.getValueInRange(originalIndentationRange);
            const newIndentation = (tabsToSpaces
                ? originalIndentation.replace(/\t/ig, spaces)
                : originalIndentation.replace(spacesRegExp, '\t'));
            builder.addEditOperation(originalIndentationRange, newIndentation);
        }
    }
    class $i9 {
        constructor(b, c) {
            this.b = b;
            this.c = c;
            this.a = null;
        }
        getEditOperations(model, builder) {
            this.a = builder.trackSelection(this.b);
            getIndentationEditOperations(model, builder, this.c, true);
        }
        computeCursorState(model, helper) {
            return helper.getTrackedSelection(this.a);
        }
    }
    exports.$i9 = $i9;
    class $j9 {
        constructor(b, c) {
            this.b = b;
            this.c = c;
            this.a = null;
        }
        getEditOperations(model, builder) {
            this.a = builder.trackSelection(this.b);
            getIndentationEditOperations(model, builder, this.c, false);
        }
        computeCursorState(model, helper) {
            return helper.getTrackedSelection(this.a);
        }
    }
    exports.$j9 = $j9;
    (0, editorExtensions_1.$AV)($h9.ID, $h9, 2 /* EditorContributionInstantiation.BeforeFirstInteraction */);
    (0, editorExtensions_1.$xV)($08);
    (0, editorExtensions_1.$xV)($$8);
    (0, editorExtensions_1.$xV)($a9);
    (0, editorExtensions_1.$xV)($b9);
    (0, editorExtensions_1.$xV)($c9);
    (0, editorExtensions_1.$xV)($d9);
    (0, editorExtensions_1.$xV)($e9);
    (0, editorExtensions_1.$xV)($f9);
});
//# sourceMappingURL=indentation.js.map