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
define(["require", "exports", "vs/base/common/lifecycle", "vs/base/common/strings", "vs/editor/browser/editorExtensions", "vs/editor/common/commands/shiftCommand", "vs/editor/common/core/editOperation", "vs/editor/common/core/range", "vs/editor/common/core/selection", "vs/editor/common/editorContextKeys", "vs/editor/common/languages/languageConfigurationRegistry", "vs/editor/common/services/model", "vs/editor/contrib/indentation/browser/indentUtils", "vs/nls", "vs/platform/quickinput/common/quickInput", "vs/editor/common/core/indentation", "vs/editor/common/languages/autoIndent"], function (require, exports, lifecycle_1, strings, editorExtensions_1, shiftCommand_1, editOperation_1, range_1, selection_1, editorContextKeys_1, languageConfigurationRegistry_1, model_1, indentUtils, nls, quickInput_1, indentation_1, autoIndent_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.IndentationToTabsCommand = exports.IndentationToSpacesCommand = exports.AutoIndentOnPaste = exports.AutoIndentOnPasteCommand = exports.ReindentSelectedLinesAction = exports.ReindentLinesAction = exports.DetectIndentation = exports.ChangeTabDisplaySize = exports.IndentUsingSpaces = exports.IndentUsingTabs = exports.ChangeIndentationSizeAction = exports.IndentationToTabsAction = exports.IndentationToSpacesAction = exports.getReindentEditOperations = void 0;
    function getReindentEditOperations(model, languageConfigurationService, startLineNumber, endLineNumber, inheritedIndent) {
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
            return shiftCommand_1.ShiftCommand.shiftIndent(indentation, indentation.length + count, tabSize, indentSize, insertSpaces);
        };
        const unshiftIndent = (indentation, count) => {
            count = count || 1;
            return shiftCommand_1.ShiftCommand.unshiftIndent(indentation, indentation.length + count, tabSize, indentSize, insertSpaces);
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
            const oldIndentation = strings.getLeadingWhitespace(currentLineText);
            adjustedLineContent = globalIndent + currentLineText.substring(oldIndentation.length);
            if (indentationRules.decreaseIndentPattern && indentationRules.decreaseIndentPattern.test(adjustedLineContent)) {
                globalIndent = unshiftIndent(globalIndent);
                adjustedLineContent = globalIndent + currentLineText.substring(oldIndentation.length);
            }
            if (currentLineText !== adjustedLineContent) {
                indentEdits.push(editOperation_1.EditOperation.replaceMove(new selection_1.Selection(startLineNumber, 1, startLineNumber, oldIndentation.length + 1), (0, indentation_1.normalizeIndentation)(globalIndent, indentSize, insertSpaces)));
            }
        }
        else {
            globalIndent = strings.getLeadingWhitespace(currentLineText);
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
            const oldIndentation = strings.getLeadingWhitespace(text);
            const adjustedLineContent = idealIndentForNextLine + text.substring(oldIndentation.length);
            if (indentationRules.decreaseIndentPattern && indentationRules.decreaseIndentPattern.test(adjustedLineContent)) {
                idealIndentForNextLine = unshiftIndent(idealIndentForNextLine);
                globalIndent = unshiftIndent(globalIndent);
            }
            if (oldIndentation !== idealIndentForNextLine) {
                indentEdits.push(editOperation_1.EditOperation.replaceMove(new selection_1.Selection(lineNumber, 1, lineNumber, oldIndentation.length + 1), (0, indentation_1.normalizeIndentation)(idealIndentForNextLine, indentSize, insertSpaces)));
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
    exports.getReindentEditOperations = getReindentEditOperations;
    class IndentationToSpacesAction extends editorExtensions_1.EditorAction {
        static { this.ID = 'editor.action.indentationToSpaces'; }
        constructor() {
            super({
                id: IndentationToSpacesAction.ID,
                label: nls.localize('indentationToSpaces', "Convert Indentation to Spaces"),
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
            const command = new IndentationToSpacesCommand(selection, modelOpts.tabSize);
            editor.pushUndoStop();
            editor.executeCommands(this.id, [command]);
            editor.pushUndoStop();
            model.updateOptions({
                insertSpaces: true
            });
        }
    }
    exports.IndentationToSpacesAction = IndentationToSpacesAction;
    class IndentationToTabsAction extends editorExtensions_1.EditorAction {
        static { this.ID = 'editor.action.indentationToTabs'; }
        constructor() {
            super({
                id: IndentationToTabsAction.ID,
                label: nls.localize('indentationToTabs', "Convert Indentation to Tabs"),
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
            const command = new IndentationToTabsCommand(selection, modelOpts.tabSize);
            editor.pushUndoStop();
            editor.executeCommands(this.id, [command]);
            editor.pushUndoStop();
            model.updateOptions({
                insertSpaces: false
            });
        }
    }
    exports.IndentationToTabsAction = IndentationToTabsAction;
    class ChangeIndentationSizeAction extends editorExtensions_1.EditorAction {
        constructor(insertSpaces, displaySizeOnly, opts) {
            super(opts);
            this.insertSpaces = insertSpaces;
            this.displaySizeOnly = displaySizeOnly;
        }
        run(accessor, editor) {
            const quickInputService = accessor.get(quickInput_1.IQuickInputService);
            const modelService = accessor.get(model_1.IModelService);
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
                    ? nls.localize('configuredTabSize', "Configured Tab Size")
                    : n === creationOpts.tabSize
                        ? nls.localize('defaultTabSize', "Default Tab Size")
                        : n === modelOpts.tabSize
                            ? nls.localize('currentTabSize', "Current Tab Size")
                            : undefined)
            }));
            // auto focus the tabSize set for the current editor
            const autoFocusIndex = Math.min(model.getOptions().tabSize - 1, 7);
            setTimeout(() => {
                quickInputService.pick(picks, { placeHolder: nls.localize({ key: 'selectTabWidth', comment: ['Tab corresponds to the tab key'] }, "Select Tab Size for Current File"), activeItem: picks[autoFocusIndex] }).then(pick => {
                    if (pick) {
                        if (model && !model.isDisposed()) {
                            const pickedVal = parseInt(pick.label, 10);
                            if (this.displaySizeOnly) {
                                model.updateOptions({
                                    tabSize: pickedVal
                                });
                            }
                            else {
                                model.updateOptions({
                                    tabSize: pickedVal,
                                    indentSize: pickedVal,
                                    insertSpaces: this.insertSpaces
                                });
                            }
                        }
                    }
                });
            }, 50 /* quick input is sensitive to being opened so soon after another */);
        }
    }
    exports.ChangeIndentationSizeAction = ChangeIndentationSizeAction;
    class IndentUsingTabs extends ChangeIndentationSizeAction {
        static { this.ID = 'editor.action.indentUsingTabs'; }
        constructor() {
            super(false, false, {
                id: IndentUsingTabs.ID,
                label: nls.localize('indentUsingTabs', "Indent Using Tabs"),
                alias: 'Indent Using Tabs',
                precondition: undefined
            });
        }
    }
    exports.IndentUsingTabs = IndentUsingTabs;
    class IndentUsingSpaces extends ChangeIndentationSizeAction {
        static { this.ID = 'editor.action.indentUsingSpaces'; }
        constructor() {
            super(true, false, {
                id: IndentUsingSpaces.ID,
                label: nls.localize('indentUsingSpaces', "Indent Using Spaces"),
                alias: 'Indent Using Spaces',
                precondition: undefined
            });
        }
    }
    exports.IndentUsingSpaces = IndentUsingSpaces;
    class ChangeTabDisplaySize extends ChangeIndentationSizeAction {
        static { this.ID = 'editor.action.changeTabDisplaySize'; }
        constructor() {
            super(true, true, {
                id: ChangeTabDisplaySize.ID,
                label: nls.localize('changeTabDisplaySize', "Change Tab Display Size"),
                alias: 'Change Tab Display Size',
                precondition: undefined
            });
        }
    }
    exports.ChangeTabDisplaySize = ChangeTabDisplaySize;
    class DetectIndentation extends editorExtensions_1.EditorAction {
        static { this.ID = 'editor.action.detectIndentation'; }
        constructor() {
            super({
                id: DetectIndentation.ID,
                label: nls.localize('detectIndentation', "Detect Indentation from Content"),
                alias: 'Detect Indentation from Content',
                precondition: undefined
            });
        }
        run(accessor, editor) {
            const modelService = accessor.get(model_1.IModelService);
            const model = editor.getModel();
            if (!model) {
                return;
            }
            const creationOpts = modelService.getCreationOptions(model.getLanguageId(), model.uri, model.isForSimpleWidget);
            model.detectIndentation(creationOpts.insertSpaces, creationOpts.tabSize);
        }
    }
    exports.DetectIndentation = DetectIndentation;
    class ReindentLinesAction extends editorExtensions_1.EditorAction {
        constructor() {
            super({
                id: 'editor.action.reindentlines',
                label: nls.localize('editor.reindentlines', "Reindent Lines"),
                alias: 'Reindent Lines',
                precondition: editorContextKeys_1.EditorContextKeys.writable
            });
        }
        run(accessor, editor) {
            const languageConfigurationService = accessor.get(languageConfigurationRegistry_1.ILanguageConfigurationService);
            const model = editor.getModel();
            if (!model) {
                return;
            }
            const edits = getReindentEditOperations(model, languageConfigurationService, 1, model.getLineCount());
            if (edits.length > 0) {
                editor.pushUndoStop();
                editor.executeEdits(this.id, edits);
                editor.pushUndoStop();
            }
        }
    }
    exports.ReindentLinesAction = ReindentLinesAction;
    class ReindentSelectedLinesAction extends editorExtensions_1.EditorAction {
        constructor() {
            super({
                id: 'editor.action.reindentselectedlines',
                label: nls.localize('editor.reindentselectedlines', "Reindent Selected Lines"),
                alias: 'Reindent Selected Lines',
                precondition: editorContextKeys_1.EditorContextKeys.writable
            });
        }
        run(accessor, editor) {
            const languageConfigurationService = accessor.get(languageConfigurationRegistry_1.ILanguageConfigurationService);
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
                const editOperations = getReindentEditOperations(model, languageConfigurationService, startLineNumber, endLineNumber);
                edits.push(...editOperations);
            }
            if (edits.length > 0) {
                editor.pushUndoStop();
                editor.executeEdits(this.id, edits);
                editor.pushUndoStop();
            }
        }
    }
    exports.ReindentSelectedLinesAction = ReindentSelectedLinesAction;
    class AutoIndentOnPasteCommand {
        constructor(edits, initialSelection) {
            this._initialSelection = initialSelection;
            this._edits = [];
            this._selectionId = null;
            for (const edit of edits) {
                if (edit.range && typeof edit.text === 'string') {
                    this._edits.push(edit);
                }
            }
        }
        getEditOperations(model, builder) {
            for (const edit of this._edits) {
                builder.addEditOperation(range_1.Range.lift(edit.range), edit.text);
            }
            let selectionIsSet = false;
            if (Array.isArray(this._edits) && this._edits.length === 1 && this._initialSelection.isEmpty()) {
                if (this._edits[0].range.startColumn === this._initialSelection.endColumn &&
                    this._edits[0].range.startLineNumber === this._initialSelection.endLineNumber) {
                    selectionIsSet = true;
                    this._selectionId = builder.trackSelection(this._initialSelection, true);
                }
                else if (this._edits[0].range.endColumn === this._initialSelection.startColumn &&
                    this._edits[0].range.endLineNumber === this._initialSelection.startLineNumber) {
                    selectionIsSet = true;
                    this._selectionId = builder.trackSelection(this._initialSelection, false);
                }
            }
            if (!selectionIsSet) {
                this._selectionId = builder.trackSelection(this._initialSelection);
            }
        }
        computeCursorState(model, helper) {
            return helper.getTrackedSelection(this._selectionId);
        }
    }
    exports.AutoIndentOnPasteCommand = AutoIndentOnPasteCommand;
    let AutoIndentOnPaste = class AutoIndentOnPaste {
        static { this.ID = 'editor.contrib.autoIndentOnPaste'; }
        constructor(editor, _languageConfigurationService) {
            this.editor = editor;
            this._languageConfigurationService = _languageConfigurationService;
            this.callOnDispose = new lifecycle_1.DisposableStore();
            this.callOnModel = new lifecycle_1.DisposableStore();
            this.callOnDispose.add(editor.onDidChangeConfiguration(() => this.update()));
            this.callOnDispose.add(editor.onDidChangeModel(() => this.update()));
            this.callOnDispose.add(editor.onDidChangeModelLanguage(() => this.update()));
        }
        update() {
            // clean up
            this.callOnModel.clear();
            // we are disabled
            if (this.editor.getOption(12 /* EditorOption.autoIndent */) < 4 /* EditorAutoIndentStrategy.Full */ || this.editor.getOption(55 /* EditorOption.formatOnPaste */)) {
                return;
            }
            // no model
            if (!this.editor.hasModel()) {
                return;
            }
            this.callOnModel.add(this.editor.onDidPaste(({ range }) => {
                this.trigger(range);
            }));
        }
        trigger(range) {
            const selections = this.editor.getSelections();
            if (selections === null || selections.length > 1) {
                return;
            }
            const model = this.editor.getModel();
            if (!model) {
                return;
            }
            if (!model.tokenization.isCheapToTokenize(range.getStartPosition().lineNumber)) {
                return;
            }
            const autoIndent = this.editor.getOption(12 /* EditorOption.autoIndent */);
            const { tabSize, indentSize, insertSpaces } = model.getOptions();
            const textEdits = [];
            const indentConverter = {
                shiftIndent: (indentation) => {
                    return shiftCommand_1.ShiftCommand.shiftIndent(indentation, indentation.length + 1, tabSize, indentSize, insertSpaces);
                },
                unshiftIndent: (indentation) => {
                    return shiftCommand_1.ShiftCommand.unshiftIndent(indentation, indentation.length + 1, tabSize, indentSize, insertSpaces);
                }
            };
            let startLineNumber = range.startLineNumber;
            while (startLineNumber <= range.endLineNumber) {
                if (this.shouldIgnoreLine(model, startLineNumber)) {
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
                const indentOfFirstLine = (0, autoIndent_1.getGoodIndentForLine)(autoIndent, model, model.getLanguageId(), startLineNumber, indentConverter, this._languageConfigurationService);
                if (indentOfFirstLine !== null) {
                    const oldIndentation = strings.getLeadingWhitespace(firstLineText);
                    const newSpaceCnt = indentUtils.getSpaceCnt(indentOfFirstLine, tabSize);
                    const oldSpaceCnt = indentUtils.getSpaceCnt(oldIndentation, tabSize);
                    if (newSpaceCnt !== oldSpaceCnt) {
                        const newIndent = indentUtils.generateIndent(newSpaceCnt, tabSize, insertSpaces);
                        textEdits.push({
                            range: new range_1.Range(startLineNumber, 1, startLineNumber, oldIndentation.length + 1),
                            text: newIndent
                        });
                        firstLineText = newIndent + firstLineText.substr(oldIndentation.length);
                    }
                    else {
                        const indentMetadata = (0, autoIndent_1.getIndentMetadata)(model, startLineNumber, this._languageConfigurationService);
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
                const indentOfSecondLine = (0, autoIndent_1.getGoodIndentForLine)(autoIndent, virtualModel, model.getLanguageId(), startLineNumber + 1, indentConverter, this._languageConfigurationService);
                if (indentOfSecondLine !== null) {
                    const newSpaceCntOfSecondLine = indentUtils.getSpaceCnt(indentOfSecondLine, tabSize);
                    const oldSpaceCntOfSecondLine = indentUtils.getSpaceCnt(strings.getLeadingWhitespace(model.getLineContent(startLineNumber + 1)), tabSize);
                    if (newSpaceCntOfSecondLine !== oldSpaceCntOfSecondLine) {
                        const spaceCntOffset = newSpaceCntOfSecondLine - oldSpaceCntOfSecondLine;
                        for (let i = startLineNumber + 1; i <= range.endLineNumber; i++) {
                            const lineContent = model.getLineContent(i);
                            const originalIndent = strings.getLeadingWhitespace(lineContent);
                            const originalSpacesCnt = indentUtils.getSpaceCnt(originalIndent, tabSize);
                            const newSpacesCnt = originalSpacesCnt + spaceCntOffset;
                            const newIndent = indentUtils.generateIndent(newSpacesCnt, tabSize, insertSpaces);
                            if (newIndent !== originalIndent) {
                                textEdits.push({
                                    range: new range_1.Range(i, 1, i, originalIndent.length + 1),
                                    text: newIndent
                                });
                            }
                        }
                    }
                }
            }
            if (textEdits.length > 0) {
                this.editor.pushUndoStop();
                const cmd = new AutoIndentOnPasteCommand(textEdits, this.editor.getSelection());
                this.editor.executeCommand('autoIndentOnPaste', cmd);
                this.editor.pushUndoStop();
            }
        }
        shouldIgnoreLine(model, lineNumber) {
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
            this.callOnDispose.dispose();
            this.callOnModel.dispose();
        }
    };
    exports.AutoIndentOnPaste = AutoIndentOnPaste;
    exports.AutoIndentOnPaste = AutoIndentOnPaste = __decorate([
        __param(1, languageConfigurationRegistry_1.ILanguageConfigurationService)
    ], AutoIndentOnPaste);
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
            const originalIndentationRange = new range_1.Range(lineNumber, 1, lineNumber, lastIndentationColumn);
            const originalIndentation = model.getValueInRange(originalIndentationRange);
            const newIndentation = (tabsToSpaces
                ? originalIndentation.replace(/\t/ig, spaces)
                : originalIndentation.replace(spacesRegExp, '\t'));
            builder.addEditOperation(originalIndentationRange, newIndentation);
        }
    }
    class IndentationToSpacesCommand {
        constructor(selection, tabSize) {
            this.selection = selection;
            this.tabSize = tabSize;
            this.selectionId = null;
        }
        getEditOperations(model, builder) {
            this.selectionId = builder.trackSelection(this.selection);
            getIndentationEditOperations(model, builder, this.tabSize, true);
        }
        computeCursorState(model, helper) {
            return helper.getTrackedSelection(this.selectionId);
        }
    }
    exports.IndentationToSpacesCommand = IndentationToSpacesCommand;
    class IndentationToTabsCommand {
        constructor(selection, tabSize) {
            this.selection = selection;
            this.tabSize = tabSize;
            this.selectionId = null;
        }
        getEditOperations(model, builder) {
            this.selectionId = builder.trackSelection(this.selection);
            getIndentationEditOperations(model, builder, this.tabSize, false);
        }
        computeCursorState(model, helper) {
            return helper.getTrackedSelection(this.selectionId);
        }
    }
    exports.IndentationToTabsCommand = IndentationToTabsCommand;
    (0, editorExtensions_1.registerEditorContribution)(AutoIndentOnPaste.ID, AutoIndentOnPaste, 2 /* EditorContributionInstantiation.BeforeFirstInteraction */);
    (0, editorExtensions_1.registerEditorAction)(IndentationToSpacesAction);
    (0, editorExtensions_1.registerEditorAction)(IndentationToTabsAction);
    (0, editorExtensions_1.registerEditorAction)(IndentUsingTabs);
    (0, editorExtensions_1.registerEditorAction)(IndentUsingSpaces);
    (0, editorExtensions_1.registerEditorAction)(ChangeTabDisplaySize);
    (0, editorExtensions_1.registerEditorAction)(DetectIndentation);
    (0, editorExtensions_1.registerEditorAction)(ReindentLinesAction);
    (0, editorExtensions_1.registerEditorAction)(ReindentSelectedLinesAction);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZW50YXRpb24uanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9lZGl0b3IvY29udHJpYi9pbmRlbnRhdGlvbi9icm93c2VyL2luZGVudGF0aW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQXlCaEcsU0FBZ0IseUJBQXlCLENBQUMsS0FBaUIsRUFBRSw0QkFBMkQsRUFBRSxlQUF1QixFQUFFLGFBQXFCLEVBQUUsZUFBd0I7UUFDak0sSUFBSSxLQUFLLENBQUMsWUFBWSxFQUFFLEtBQUssQ0FBQyxJQUFJLEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLEVBQUU7WUFDbEUsaUJBQWlCO1lBQ2pCLE9BQU8sRUFBRSxDQUFDO1NBQ1Y7UUFFRCxNQUFNLGdCQUFnQixHQUFHLDRCQUE0QixDQUFDLHdCQUF3QixDQUFDLEtBQUssQ0FBQyxhQUFhLEVBQUUsQ0FBQyxDQUFDLGdCQUFnQixDQUFDO1FBQ3ZILElBQUksQ0FBQyxnQkFBZ0IsRUFBRTtZQUN0QixPQUFPLEVBQUUsQ0FBQztTQUNWO1FBRUQsYUFBYSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsYUFBYSxFQUFFLEtBQUssQ0FBQyxZQUFZLEVBQUUsQ0FBQyxDQUFDO1FBRTlELHFDQUFxQztRQUNyQyxPQUFPLGVBQWUsSUFBSSxhQUFhLEVBQUU7WUFDeEMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLHFCQUFxQixFQUFFO2dCQUM1QyxNQUFNO2FBQ047WUFFRCxNQUFNLElBQUksR0FBRyxLQUFLLENBQUMsY0FBYyxDQUFDLGVBQWUsQ0FBQyxDQUFDO1lBQ25ELElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxxQkFBcUIsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUU7Z0JBQ3ZELE1BQU07YUFDTjtZQUVELGVBQWUsRUFBRSxDQUFDO1NBQ2xCO1FBRUQsSUFBSSxl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