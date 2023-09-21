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
define(["require", "exports", "vs/base/browser/ui/aria/aria", "vs/base/common/async", "vs/base/common/keyCodes", "vs/base/common/lifecycle", "vs/editor/browser/editorExtensions", "vs/editor/common/cursor/cursorMoveCommands", "vs/editor/common/core/range", "vs/editor/common/core/selection", "vs/editor/common/editorContextKeys", "vs/editor/contrib/find/browser/findController", "vs/nls!vs/editor/contrib/multicursor/browser/multicursor", "vs/platform/actions/common/actions", "vs/platform/contextkey/common/contextkey", "vs/editor/common/services/languageFeatures", "vs/editor/contrib/wordHighlighter/browser/highlightDecorations", "vs/platform/instantiation/common/instantiation"], function (require, exports, aria_1, async_1, keyCodes_1, lifecycle_1, editorExtensions_1, cursorMoveCommands_1, range_1, selection_1, editorContextKeys_1, findController_1, nls, actions_1, contextkey_1, languageFeatures_1, highlightDecorations_1, instantiation_1) {
    "use strict";
    var $g0_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$i0 = exports.$h0 = exports.$g0 = exports.$f0 = exports.$e0 = exports.$d0 = exports.$c0 = exports.$b0 = exports.$a0 = exports.$_9 = exports.$$9 = exports.$09 = exports.$99 = exports.$89 = exports.$79 = void 0;
    function announceCursorChange(previousCursorState, cursorState) {
        const cursorDiff = cursorState.filter(cs => !previousCursorState.find(pcs => pcs.equals(cs)));
        if (cursorDiff.length >= 1) {
            const cursorPositions = cursorDiff.map(cs => `line ${cs.viewState.position.lineNumber} column ${cs.viewState.position.column}`).join(', ');
            const msg = cursorDiff.length === 1 ? nls.localize(0, null, cursorPositions) : nls.localize(1, null, cursorPositions);
            (0, aria_1.$_P)(msg);
        }
    }
    class $79 extends editorExtensions_1.$sV {
        constructor() {
            super({
                id: 'editor.action.insertCursorAbove',
                label: nls.localize(2, null),
                alias: 'Add Cursor Above',
                precondition: undefined,
                kbOpts: {
                    kbExpr: editorContextKeys_1.EditorContextKeys.editorTextFocus,
                    primary: 2048 /* KeyMod.CtrlCmd */ | 512 /* KeyMod.Alt */ | 16 /* KeyCode.UpArrow */,
                    linux: {
                        primary: 1024 /* KeyMod.Shift */ | 512 /* KeyMod.Alt */ | 16 /* KeyCode.UpArrow */,
                        secondary: [2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 16 /* KeyCode.UpArrow */]
                    },
                    weight: 100 /* KeybindingWeight.EditorContrib */
                },
                menuOpts: {
                    menuId: actions_1.$Ru.MenubarSelectionMenu,
                    group: '3_multi',
                    title: nls.localize(3, null),
                    order: 2
                }
            });
        }
        run(accessor, editor, args) {
            if (!editor.hasModel()) {
                return;
            }
            let useLogicalLine = true;
            if (args && args.logicalLine === false) {
                useLogicalLine = false;
            }
            const viewModel = editor._getViewModel();
            if (viewModel.cursorConfig.readOnly) {
                return;
            }
            viewModel.model.pushStackElement();
            const previousCursorState = viewModel.getCursorStates();
            viewModel.setCursorStates(args.source, 3 /* CursorChangeReason.Explicit */, cursorMoveCommands_1.$6V.addCursorUp(viewModel, previousCursorState, useLogicalLine));
            viewModel.revealTopMostCursor(args.source);
            announceCursorChange(previousCursorState, viewModel.getCursorStates());
        }
    }
    exports.$79 = $79;
    class $89 extends editorExtensions_1.$sV {
        constructor() {
            super({
                id: 'editor.action.insertCursorBelow',
                label: nls.localize(4, null),
                alias: 'Add Cursor Below',
                precondition: undefined,
                kbOpts: {
                    kbExpr: editorContextKeys_1.EditorContextKeys.editorTextFocus,
                    primary: 2048 /* KeyMod.CtrlCmd */ | 512 /* KeyMod.Alt */ | 18 /* KeyCode.DownArrow */,
                    linux: {
                        primary: 1024 /* KeyMod.Shift */ | 512 /* KeyMod.Alt */ | 18 /* KeyCode.DownArrow */,
                        secondary: [2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 18 /* KeyCode.DownArrow */]
                    },
                    weight: 100 /* KeybindingWeight.EditorContrib */
                },
                menuOpts: {
                    menuId: actions_1.$Ru.MenubarSelectionMenu,
                    group: '3_multi',
                    title: nls.localize(5, null),
                    order: 3
                }
            });
        }
        run(accessor, editor, args) {
            if (!editor.hasModel()) {
                return;
            }
            let useLogicalLine = true;
            if (args && args.logicalLine === false) {
                useLogicalLine = false;
            }
            const viewModel = editor._getViewModel();
            if (viewModel.cursorConfig.readOnly) {
                return;
            }
            viewModel.model.pushStackElement();
            const previousCursorState = viewModel.getCursorStates();
            viewModel.setCursorStates(args.source, 3 /* CursorChangeReason.Explicit */, cursorMoveCommands_1.$6V.addCursorDown(viewModel, previousCursorState, useLogicalLine));
            viewModel.revealBottomMostCursor(args.source);
            announceCursorChange(previousCursorState, viewModel.getCursorStates());
        }
    }
    exports.$89 = $89;
    class InsertCursorAtEndOfEachLineSelected extends editorExtensions_1.$sV {
        constructor() {
            super({
                id: 'editor.action.insertCursorAtEndOfEachLineSelected',
                label: nls.localize(6, null),
                alias: 'Add Cursors to Line Ends',
                precondition: undefined,
                kbOpts: {
                    kbExpr: editorContextKeys_1.EditorContextKeys.editorTextFocus,
                    primary: 1024 /* KeyMod.Shift */ | 512 /* KeyMod.Alt */ | 39 /* KeyCode.KeyI */,
                    weight: 100 /* KeybindingWeight.EditorContrib */
                },
                menuOpts: {
                    menuId: actions_1.$Ru.MenubarSelectionMenu,
                    group: '3_multi',
                    title: nls.localize(7, null),
                    order: 4
                }
            });
        }
        d(selection, model, result) {
            if (selection.isEmpty()) {
                return;
            }
            for (let i = selection.startLineNumber; i < selection.endLineNumber; i++) {
                const currentLineMaxColumn = model.getLineMaxColumn(i);
                result.push(new selection_1.$ms(i, currentLineMaxColumn, i, currentLineMaxColumn));
            }
            if (selection.endColumn > 1) {
                result.push(new selection_1.$ms(selection.endLineNumber, selection.endColumn, selection.endLineNumber, selection.endColumn));
            }
        }
        run(accessor, editor) {
            if (!editor.hasModel()) {
                return;
            }
            const model = editor.getModel();
            const selections = editor.getSelections();
            const viewModel = editor._getViewModel();
            const previousCursorState = viewModel.getCursorStates();
            const newSelections = [];
            selections.forEach((sel) => this.d(sel, model, newSelections));
            if (newSelections.length > 0) {
                editor.setSelections(newSelections);
            }
            announceCursorChange(previousCursorState, viewModel.getCursorStates());
        }
    }
    class InsertCursorAtEndOfLineSelected extends editorExtensions_1.$sV {
        constructor() {
            super({
                id: 'editor.action.addCursorsToBottom',
                label: nls.localize(8, null),
                alias: 'Add Cursors To Bottom',
                precondition: undefined
            });
        }
        run(accessor, editor) {
            if (!editor.hasModel()) {
                return;
            }
            const selections = editor.getSelections();
            const lineCount = editor.getModel().getLineCount();
            const newSelections = [];
            for (let i = selections[0].startLineNumber; i <= lineCount; i++) {
                newSelections.push(new selection_1.$ms(i, selections[0].startColumn, i, selections[0].endColumn));
            }
            const viewModel = editor._getViewModel();
            const previousCursorState = viewModel.getCursorStates();
            if (newSelections.length > 0) {
                editor.setSelections(newSelections);
            }
            announceCursorChange(previousCursorState, viewModel.getCursorStates());
        }
    }
    class InsertCursorAtTopOfLineSelected extends editorExtensions_1.$sV {
        constructor() {
            super({
                id: 'editor.action.addCursorsToTop',
                label: nls.localize(9, null),
                alias: 'Add Cursors To Top',
                precondition: undefined
            });
        }
        run(accessor, editor) {
            if (!editor.hasModel()) {
                return;
            }
            const selections = editor.getSelections();
            const newSelections = [];
            for (let i = selections[0].startLineNumber; i >= 1; i--) {
                newSelections.push(new selection_1.$ms(i, selections[0].startColumn, i, selections[0].endColumn));
            }
            const viewModel = editor._getViewModel();
            const previousCursorState = viewModel.getCursorStates();
            if (newSelections.length > 0) {
                editor.setSelections(newSelections);
            }
            announceCursorChange(previousCursorState, viewModel.getCursorStates());
        }
    }
    class $99 {
        constructor(selections, revealRange, revealScrollType) {
            this.selections = selections;
            this.revealRange = revealRange;
            this.revealScrollType = revealScrollType;
        }
    }
    exports.$99 = $99;
    class $09 {
        static create(editor, findController) {
            if (!editor.hasModel()) {
                return null;
            }
            const findState = findController.getState();
            // Find widget owns entirely what we search for if:
            //  - focus is not in the editor (i.e. it is in the find widget)
            //  - and the search widget is visible
            //  - and the search string is non-empty
            if (!editor.hasTextFocus() && findState.isRevealed && findState.searchString.length > 0) {
                // Find widget owns what is searched for
                return new $09(editor, findController, false, findState.searchString, findState.wholeWord, findState.matchCase, null);
            }
            // Otherwise, the selection gives the search text, and the find widget gives the search settings
            // The exception is the find state disassociation case: when beginning with a single, collapsed selection
            let isDisconnectedFromFindController = false;
            let wholeWord;
            let matchCase;
            const selections = editor.getSelections();
            if (selections.length === 1 && selections[0].isEmpty()) {
                isDisconnectedFromFindController = true;
                wholeWord = true;
                matchCase = true;
            }
            else {
                wholeWord = findState.wholeWord;
                matchCase = findState.matchCase;
            }
            // Selection owns what is searched for
            const s = editor.getSelection();
            let searchText;
            let currentMatch = null;
            if (s.isEmpty()) {
                // selection is empty => expand to current word
                const word = editor.getConfiguredWordAtPosition(s.getStartPosition());
                if (!word) {
                    return null;
                }
                searchText = word.word;
                currentMatch = new selection_1.$ms(s.startLineNumber, word.startColumn, s.startLineNumber, word.endColumn);
            }
            else {
                searchText = editor.getModel().getValueInRange(s).replace(/\r\n/g, '\n');
            }
            return new $09(editor, findController, isDisconnectedFromFindController, searchText, wholeWord, matchCase, currentMatch);
        }
        constructor(a, findController, isDisconnectedFromFindController, searchText, wholeWord, matchCase, currentMatch) {
            this.a = a;
            this.findController = findController;
            this.isDisconnectedFromFindController = isDisconnectedFromFindController;
            this.searchText = searchText;
            this.wholeWord = wholeWord;
            this.matchCase = matchCase;
            this.currentMatch = currentMatch;
        }
        addSelectionToNextFindMatch() {
            if (!this.a.hasModel()) {
                return null;
            }
            const nextMatch = this.b();
            if (!nextMatch) {
                return null;
            }
            const allSelections = this.a.getSelections();
            return new $99(allSelections.concat(nextMatch), nextMatch, 0 /* ScrollType.Smooth */);
        }
        moveSelectionToNextFindMatch() {
            if (!this.a.hasModel()) {
                return null;
            }
            const nextMatch = this.b();
            if (!nextMatch) {
                return null;
            }
            const allSelections = this.a.getSelections();
            return new $99(allSelections.slice(0, allSelections.length - 1).concat(nextMatch), nextMatch, 0 /* ScrollType.Smooth */);
        }
        b() {
            if (!this.a.hasModel()) {
                return null;
            }
            if (this.currentMatch) {
                const result = this.currentMatch;
                this.currentMatch = null;
                return result;
            }
            this.findController.highlightFindOptions();
            const allSelections = this.a.getSelections();
            const lastAddedSelection = allSelections[allSelections.length - 1];
            const nextMatch = this.a.getModel().findNextMatch(this.searchText, lastAddedSelection.getEndPosition(), false, this.matchCase, this.wholeWord ? this.a.getOption(129 /* EditorOption.wordSeparators */) : null, false);
            if (!nextMatch) {
                return null;
            }
            return new selection_1.$ms(nextMatch.range.startLineNumber, nextMatch.range.startColumn, nextMatch.range.endLineNumber, nextMatch.range.endColumn);
        }
        addSelectionToPreviousFindMatch() {
            if (!this.a.hasModel()) {
                return null;
            }
            const previousMatch = this.c();
            if (!previousMatch) {
                return null;
            }
            const allSelections = this.a.getSelections();
            return new $99(allSelections.concat(previousMatch), previousMatch, 0 /* ScrollType.Smooth */);
        }
        moveSelectionToPreviousFindMatch() {
            if (!this.a.hasModel()) {
                return null;
            }
            const previousMatch = this.c();
            if (!previousMatch) {
                return null;
            }
            const allSelections = this.a.getSelections();
            return new $99(allSelections.slice(0, allSelections.length - 1).concat(previousMatch), previousMatch, 0 /* ScrollType.Smooth */);
        }
        c() {
            if (!this.a.hasModel()) {
                return null;
            }
            if (this.currentMatch) {
                const result = this.currentMatch;
                this.currentMatch = null;
                return result;
            }
            this.findController.highlightFindOptions();
            const allSelections = this.a.getSelections();
            const lastAddedSelection = allSelections[allSelections.length - 1];
            const previousMatch = this.a.getModel().findPreviousMatch(this.searchText, lastAddedSelection.getStartPosition(), false, this.matchCase, this.wholeWord ? this.a.getOption(129 /* EditorOption.wordSeparators */) : null, false);
            if (!previousMatch) {
                return null;
            }
            return new selection_1.$ms(previousMatch.range.startLineNumber, previousMatch.range.startColumn, previousMatch.range.endLineNumber, previousMatch.range.endColumn);
        }
        selectAll(searchScope) {
            if (!this.a.hasModel()) {
                return [];
            }
            this.findController.highlightFindOptions();
            const editorModel = this.a.getModel();
            if (searchScope) {
                return editorModel.findMatches(this.searchText, searchScope, false, this.matchCase, this.wholeWord ? this.a.getOption(129 /* EditorOption.wordSeparators */) : null, false, 1073741824 /* Constants.MAX_SAFE_SMALL_INTEGER */);
            }
            return editorModel.findMatches(this.searchText, true, false, this.matchCase, this.wholeWord ? this.a.getOption(129 /* EditorOption.wordSeparators */) : null, false, 1073741824 /* Constants.MAX_SAFE_SMALL_INTEGER */);
        }
    }
    exports.$09 = $09;
    class $$9 extends lifecycle_1.$kc {
        static { this.ID = 'editor.contrib.multiCursorController'; }
        static get(editor) {
            return editor.getContribution($$9.ID);
        }
        constructor(editor) {
            super();
            this.f = this.B(new lifecycle_1.$jc());
            this.a = editor;
            this.b = false;
            this.c = null;
        }
        dispose() {
            this.h();
            super.dispose();
        }
        g(findController) {
            if (!this.c) {
                // Create a new session
                const session = $09.create(this.a, findController);
                if (!session) {
                    return;
                }
                this.c = session;
                const newState = { searchString: this.c.searchText };
                if (this.c.isDisconnectedFromFindController) {
                    newState.wholeWordOverride = 1 /* FindOptionOverride.True */;
                    newState.matchCaseOverride = 1 /* FindOptionOverride.True */;
                    newState.isRegexOverride = 2 /* FindOptionOverride.False */;
                }
                findController.getState().change(newState, false);
                this.f.add(this.a.onDidChangeCursorSelection((e) => {
                    if (this.b) {
                        return;
                    }
                    this.h();
                }));
                this.f.add(this.a.onDidBlurEditorText(() => {
                    this.h();
                }));
                this.f.add(findController.getState().onFindReplaceStateChange((e) => {
                    if (e.matchCase || e.wholeWord) {
                        this.h();
                    }
                }));
            }
        }
        h() {
            this.f.clear();
            if (this.c && this.c.isDisconnectedFromFindController) {
                const newState = {
                    wholeWordOverride: 0 /* FindOptionOverride.NotSet */,
                    matchCaseOverride: 0 /* FindOptionOverride.NotSet */,
                    isRegexOverride: 0 /* FindOptionOverride.NotSet */,
                };
                this.c.findController.getState().change(newState, false);
            }
            this.c = null;
        }
        n(selections) {
            this.b = true;
            this.a.setSelections(selections);
            this.b = false;
        }
        t(model, selection) {
            if (!selection.isEmpty()) {
                return selection;
            }
            const word = this.a.getConfiguredWordAtPosition(selection.getStartPosition());
            if (!word) {
                return selection;
            }
            return new selection_1.$ms(selection.startLineNumber, word.startColumn, selection.startLineNumber, word.endColumn);
        }
        u(result) {
            if (!result) {
                return;
            }
            this.n(result.selections);
            if (result.revealRange) {
                this.a.revealRangeInCenterIfOutsideViewport(result.revealRange, result.revealScrollType);
            }
        }
        getSession(findController) {
            return this.c;
        }
        addSelectionToNextFindMatch(findController) {
            if (!this.a.hasModel()) {
                return;
            }
            if (!this.c) {
                // If there are multiple cursors, handle the case where they do not all select the same text.
                const allSelections = this.a.getSelections();
                if (allSelections.length > 1) {
                    const findState = findController.getState();
                    const matchCase = findState.matchCase;
                    const selectionsContainSameText = modelRangesContainSameText(this.a.getModel(), allSelections, matchCase);
                    if (!selectionsContainSameText) {
                        const model = this.a.getModel();
                        const resultingSelections = [];
                        for (let i = 0, len = allSelections.length; i < len; i++) {
                            resultingSelections[i] = this.t(model, allSelections[i]);
                        }
                        this.a.setSelections(resultingSelections);
                        return;
                    }
                }
            }
            this.g(findController);
            if (this.c) {
                this.u(this.c.addSelectionToNextFindMatch());
            }
        }
        addSelectionToPreviousFindMatch(findController) {
            this.g(findController);
            if (this.c) {
                this.u(this.c.addSelectionToPreviousFindMatch());
            }
        }
        moveSelectionToNextFindMatch(findController) {
            this.g(findController);
            if (this.c) {
                this.u(this.c.moveSelectionToNextFindMatch());
            }
        }
        moveSelectionToPreviousFindMatch(findController) {
            this.g(findController);
            if (this.c) {
                this.u(this.c.moveSelectionToPreviousFindMatch());
            }
        }
        selectAll(findController) {
            if (!this.a.hasModel()) {
                return;
            }
            let matches = null;
            const findState = findController.getState();
            // Special case: find widget owns entirely what we search for if:
            // - focus is not in the editor (i.e. it is in the find widget)
            // - and the search widget is visible
            // - and the search string is non-empty
            // - and we're searching for a regex
            if (findState.isRevealed && findState.searchString.length > 0 && findState.isRegex) {
                const editorModel = this.a.getModel();
                if (findState.searchScope) {
                    matches = editorModel.findMatches(findState.searchString, findState.searchScope, findState.isRegex, findState.matchCase, findState.wholeWord ? this.a.getOption(129 /* EditorOption.wordSeparators */) : null, false, 1073741824 /* Constants.MAX_SAFE_SMALL_INTEGER */);
                }
                else {
                    matches = editorModel.findMatches(findState.searchString, true, findState.isRegex, findState.matchCase, findState.wholeWord ? this.a.getOption(129 /* EditorOption.wordSeparators */) : null, false, 1073741824 /* Constants.MAX_SAFE_SMALL_INTEGER */);
                }
            }
            else {
                this.g(findController);
                if (!this.c) {
                    return;
                }
                matches = this.c.selectAll(findState.searchScope);
            }
            if (matches.length > 0) {
                const editorSelection = this.a.getSelection();
                // Have the primary cursor remain the one where the action was invoked
                for (let i = 0, len = matches.length; i < len; i++) {
                    const match = matches[i];
                    const intersection = match.range.intersectRanges(editorSelection);
                    if (intersection) {
                        // bingo!
                        matches[i] = matches[0];
                        matches[0] = match;
                        break;
                    }
                }
                this.n(matches.map(m => new selection_1.$ms(m.range.startLineNumber, m.range.startColumn, m.range.endLineNumber, m.range.endColumn)));
            }
        }
        selectAllUsingSelections(selections) {
            if (selections.length > 0) {
                this.n(selections);
            }
        }
    }
    exports.$$9 = $$9;
    class $_9 extends editorExtensions_1.$sV {
        run(accessor, editor) {
            const multiCursorController = $$9.get(editor);
            if (!multiCursorController) {
                return;
            }
            const viewModel = editor._getViewModel();
            if (viewModel) {
                const previousCursorState = viewModel.getCursorStates();
                const findController = findController_1.$W7.get(editor);
                if (findController) {
                    this.d(multiCursorController, findController);
                }
                else {
                    const newFindController = accessor.get(instantiation_1.$Ah).createInstance(findController_1.$W7, editor);
                    this.d(multiCursorController, newFindController);
                    newFindController.dispose();
                }
                announceCursorChange(previousCursorState, viewModel.getCursorStates());
            }
        }
    }
    exports.$_9 = $_9;
    class $a0 extends $_9 {
        constructor() {
            super({
                id: 'editor.action.addSelectionToNextFindMatch',
                label: nls.localize(10, null),
                alias: 'Add Selection To Next Find Match',
                precondition: undefined,
                kbOpts: {
                    kbExpr: editorContextKeys_1.EditorContextKeys.focus,
                    primary: 2048 /* KeyMod.CtrlCmd */ | 34 /* KeyCode.KeyD */,
                    weight: 100 /* KeybindingWeight.EditorContrib */
                },
                menuOpts: {
                    menuId: actions_1.$Ru.MenubarSelectionMenu,
                    group: '3_multi',
                    title: nls.localize(11, null),
                    order: 5
                }
            });
        }
        d(multiCursorController, findController) {
            multiCursorController.addSelectionToNextFindMatch(findController);
        }
    }
    exports.$a0 = $a0;
    class $b0 extends $_9 {
        constructor() {
            super({
                id: 'editor.action.addSelectionToPreviousFindMatch',
                label: nls.localize(12, null),
                alias: 'Add Selection To Previous Find Match',
                precondition: undefined,
                menuOpts: {
                    menuId: actions_1.$Ru.MenubarSelectionMenu,
                    group: '3_multi',
                    title: nls.localize(13, null),
                    order: 6
                }
            });
        }
        d(multiCursorController, findController) {
            multiCursorController.addSelectionToPreviousFindMatch(findController);
        }
    }
    exports.$b0 = $b0;
    class $c0 extends $_9 {
        constructor() {
            super({
                id: 'editor.action.moveSelectionToNextFindMatch',
                label: nls.localize(14, null),
                alias: 'Move Last Selection To Next Find Match',
                precondition: undefined,
                kbOpts: {
                    kbExpr: editorContextKeys_1.EditorContextKeys.focus,
                    primary: (0, keyCodes_1.$vq)(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 2048 /* KeyMod.CtrlCmd */ | 34 /* KeyCode.KeyD */),
                    weight: 100 /* KeybindingWeight.EditorContrib */
                }
            });
        }
        d(multiCursorController, findController) {
            multiCursorController.moveSelectionToNextFindMatch(findController);
        }
    }
    exports.$c0 = $c0;
    class $d0 extends $_9 {
        constructor() {
            super({
                id: 'editor.action.moveSelectionToPreviousFindMatch',
                label: nls.localize(15, null),
                alias: 'Move Last Selection To Previous Find Match',
                precondition: undefined
            });
        }
        d(multiCursorController, findController) {
            multiCursorController.moveSelectionToPreviousFindMatch(findController);
        }
    }
    exports.$d0 = $d0;
    class $e0 extends $_9 {
        constructor() {
            super({
                id: 'editor.action.selectHighlights',
                label: nls.localize(16, null),
                alias: 'Select All Occurrences of Find Match',
                precondition: undefined,
                kbOpts: {
                    kbExpr: editorContextKeys_1.EditorContextKeys.focus,
                    primary: 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 42 /* KeyCode.KeyL */,
                    weight: 100 /* KeybindingWeight.EditorContrib */
                },
                menuOpts: {
                    menuId: actions_1.$Ru.MenubarSelectionMenu,
                    group: '3_multi',
                    title: nls.localize(17, null),
                    order: 7
                }
            });
        }
        d(multiCursorController, findController) {
            multiCursorController.selectAll(findController);
        }
    }
    exports.$e0 = $e0;
    class $f0 extends $_9 {
        constructor() {
            super({
                id: 'editor.action.changeAll',
                label: nls.localize(18, null),
                alias: 'Change All Occurrences',
                precondition: contextkey_1.$Ii.and(editorContextKeys_1.EditorContextKeys.writable, editorContextKeys_1.EditorContextKeys.editorTextFocus),
                kbOpts: {
                    kbExpr: editorContextKeys_1.EditorContextKeys.editorTextFocus,
                    primary: 2048 /* KeyMod.CtrlCmd */ | 60 /* KeyCode.F2 */,
                    weight: 100 /* KeybindingWeight.EditorContrib */
                },
                contextMenuOpts: {
                    group: '1_modification',
                    order: 1.2
                }
            });
        }
        d(multiCursorController, findController) {
            multiCursorController.selectAll(findController);
        }
    }
    exports.$f0 = $f0;
    class SelectionHighlighterState {
        constructor(c, d, f, g, prevState) {
            this.c = c;
            this.d = d;
            this.f = f;
            this.g = g;
            this.a = this.c.getVersionId();
            this.b = null;
            if (prevState
                && this.c === prevState.c
                && this.d === prevState.d
                && this.f === prevState.f
                && this.g === prevState.g
                && this.a === prevState.a) {
                this.b = prevState.b;
            }
        }
        findMatches() {
            if (this.b === null) {
                this.b = this.c.findMatches(this.d, true, false, this.f, this.g, false).map(m => m.range);
                this.b.sort(range_1.$ks.compareRangesUsingStarts);
            }
            return this.b;
        }
    }
    let $g0 = class $g0 extends lifecycle_1.$kc {
        static { $g0_1 = this; }
        static { this.ID = 'editor.contrib.selectionHighlighter'; }
        constructor(editor, h) {
            super();
            this.h = h;
            this.a = editor;
            this.b = editor.getOption(107 /* EditorOption.selectionHighlight */);
            this.c = editor.createDecorationsCollection();
            this.f = this.B(new async_1.$Sg(() => this.n(), 300));
            this.g = null;
            this.B(editor.onDidChangeConfiguration((e) => {
                this.b = editor.getOption(107 /* EditorOption.selectionHighlight */);
            }));
            this.B(editor.onDidChangeCursorSelection((e) => {
                if (!this.b) {
                    // Early exit if nothing needs to be done!
                    // Leave some form of early exit check here if you wish to continue being a cursor position change listener ;)
                    return;
                }
                if (e.selection.isEmpty()) {
                    if (e.reason === 3 /* CursorChangeReason.Explicit */) {
                        if (this.g) {
                            // no longer valid
                            this.u(null);
                        }
                        this.f.schedule();
                    }
                    else {
                        this.u(null);
                    }
                }
                else {
                    this.n();
                }
            }));
            this.B(editor.onDidChangeModel((e) => {
                this.u(null);
            }));
            this.B(editor.onDidChangeModelContent((e) => {
                if (this.b) {
                    this.f.schedule();
                }
            }));
            const findController = findController_1.$W7.get(editor);
            if (findController) {
                this.B(findController.getState().onFindReplaceStateChange((e) => {
                    this.n();
                }));
            }
            this.f.schedule();
        }
        n() {
            this.u($g0_1.t(this.g, this.b, this.a));
        }
        static t(oldState, isEnabled, editor) {
            if (!isEnabled) {
                return null;
            }
            if (!editor.hasModel()) {
                return null;
            }
            const s = editor.getSelection();
            if (s.startLineNumber !== s.endLineNumber) {
                // multiline forbidden for perf reasons
                return null;
            }
            const multiCursorController = $$9.get(editor);
            if (!multiCursorController) {
                return null;
            }
            const findController = findController_1.$W7.get(editor);
            if (!findController) {
                return null;
            }
            let r = multiCursorController.getSession(findController);
            if (!r) {
                const allSelections = editor.getSelections();
                if (allSelections.length > 1) {
                    const findState = findController.getState();
                    const matchCase = findState.matchCase;
                    const selectionsContainSameText = modelRangesContainSameText(editor.getModel(), allSelections, matchCase);
                    if (!selectionsContainSameText) {
                        return null;
                    }
                }
                r = $09.create(editor, findController);
            }
            if (!r) {
                return null;
            }
            if (r.currentMatch) {
                // This is an empty selection
                // Do not interfere with semantic word highlighting in the no selection case
                return null;
            }
            if (/^[ \t]+$/.test(r.searchText)) {
                // whitespace only selection
                return null;
            }
            if (r.searchText.length > 200) {
                // very long selection
                return null;
            }
            // TODO: better handling of this case
            const findState = findController.getState();
            const caseSensitive = findState.matchCase;
            // Return early if the find widget shows the exact same matches
            if (findState.isRevealed) {
                let findStateSearchString = findState.searchString;
                if (!caseSensitive) {
                    findStateSearchString = findStateSearchString.toLowerCase();
                }
                let mySearchString = r.searchText;
                if (!caseSensitive) {
                    mySearchString = mySearchString.toLowerCase();
                }
                if (findStateSearchString === mySearchString && r.matchCase === findState.matchCase && r.wholeWord === findState.wholeWord && !findState.isRegex) {
                    return null;
                }
            }
            return new SelectionHighlighterState(editor.getModel(), r.searchText, r.matchCase, r.wholeWord ? editor.getOption(129 /* EditorOption.wordSeparators */) : null, oldState);
        }
        u(newState) {
            this.g = newState;
            if (!this.g) {
                this.c.clear();
                return;
            }
            if (!this.a.hasModel()) {
                return;
            }
            const model = this.a.getModel();
            if (model.isTooLargeForTokenization()) {
                // the file is too large, so searching word under cursor in the whole document would be blocking the UI.
                return;
            }
            const allMatches = this.g.findMatches();
            const selections = this.a.getSelections();
            selections.sort(range_1.$ks.compareRangesUsingStarts);
            // do not overlap with selection (issue #64 and #512)
            const matches = [];
            for (let i = 0, j = 0, len = allMatches.length, lenJ = selections.length; i < len;) {
                const match = allMatches[i];
                if (j >= lenJ) {
                    // finished all editor selections
                    matches.push(match);
                    i++;
                }
                else {
                    const cmp = range_1.$ks.compareRangesUsingStarts(match, selections[j]);
                    if (cmp < 0) {
                        // match is before sel
                        if (selections[j].isEmpty() || !range_1.$ks.areIntersecting(match, selections[j])) {
                            matches.push(match);
                        }
                        i++;
                    }
                    else if (cmp > 0) {
                        // sel is before match
                        j++;
                    }
                    else {
                        // sel is equal to match
                        i++;
                        j++;
                    }
                }
            }
            const hasSemanticHighlights = this.h.documentHighlightProvider.has(model) && this.a.getOption(80 /* EditorOption.occurrencesHighlight */);
            const decorations = matches.map(r => {
                return {
                    range: r,
                    options: (0, highlightDecorations_1.$69)(hasSemanticHighlights)
                };
            });
            this.c.set(decorations);
        }
        dispose() {
            this.u(null);
            super.dispose();
        }
    };
    exports.$g0 = $g0;
    exports.$g0 = $g0 = $g0_1 = __decorate([
        __param(1, languageFeatures_1.$hF)
    ], $g0);
    function modelRangesContainSameText(model, ranges, matchCase) {
        const selectedText = getValueInRange(model, ranges[0], !matchCase);
        for (let i = 1, len = ranges.length; i < len; i++) {
            const range = ranges[i];
            if (range.isEmpty()) {
                return false;
            }
            const thisSelectedText = getValueInRange(model, range, !matchCase);
            if (selectedText !== thisSelectedText) {
                return false;
            }
        }
        return true;
    }
    function getValueInRange(model, range, toLowerCase) {
        const text = model.getValueInRange(range);
        return (toLowerCase ? text.toLowerCase() : text);
    }
    class $h0 extends editorExtensions_1.$sV {
        constructor() {
            super({
                id: 'editor.action.focusNextCursor',
                label: nls.localize(19, null),
                description: {
                    description: nls.localize(20, null),
                    args: [],
                },
                alias: 'Focus Next Cursor',
                precondition: undefined
            });
        }
        run(accessor, editor, args) {
            if (!editor.hasModel()) {
                return;
            }
            const viewModel = editor._getViewModel();
            if (viewModel.cursorConfig.readOnly) {
                return;
            }
            viewModel.model.pushStackElement();
            const previousCursorState = Array.from(viewModel.getCursorStates());
            const firstCursor = previousCursorState.shift();
            if (!firstCursor) {
                return;
            }
            previousCursorState.push(firstCursor);
            viewModel.setCursorStates(args.source, 3 /* CursorChangeReason.Explicit */, previousCursorState);
            viewModel.revealPrimaryCursor(args.source, true);
            announceCursorChange(previousCursorState, viewModel.getCursorStates());
        }
    }
    exports.$h0 = $h0;
    class $i0 extends editorExtensions_1.$sV {
        constructor() {
            super({
                id: 'editor.action.focusPreviousCursor',
                label: nls.localize(21, null),
                description: {
                    description: nls.localize(22, null),
                    args: [],
                },
                alias: 'Focus Previous Cursor',
                precondition: undefined
            });
        }
        run(accessor, editor, args) {
            if (!editor.hasModel()) {
                return;
            }
            const viewModel = editor._getViewModel();
            if (viewModel.cursorConfig.readOnly) {
                return;
            }
            viewModel.model.pushStackElement();
            const previousCursorState = Array.from(viewModel.getCursorStates());
            const firstCursor = previousCursorState.pop();
            if (!firstCursor) {
                return;
            }
            previousCursorState.unshift(firstCursor);
            viewModel.setCursorStates(args.source, 3 /* CursorChangeReason.Explicit */, previousCursorState);
            viewModel.revealPrimaryCursor(args.source, true);
            announceCursorChange(previousCursorState, viewModel.getCursorStates());
        }
    }
    exports.$i0 = $i0;
    (0, editorExtensions_1.$AV)($$9.ID, $$9, 4 /* EditorContributionInstantiation.Lazy */);
    (0, editorExtensions_1.$AV)($g0.ID, $g0, 1 /* EditorContributionInstantiation.AfterFirstRender */);
    (0, editorExtensions_1.$xV)($79);
    (0, editorExtensions_1.$xV)($89);
    (0, editorExtensions_1.$xV)(InsertCursorAtEndOfEachLineSelected);
    (0, editorExtensions_1.$xV)($a0);
    (0, editorExtensions_1.$xV)($b0);
    (0, editorExtensions_1.$xV)($c0);
    (0, editorExtensions_1.$xV)($d0);
    (0, editorExtensions_1.$xV)($e0);
    (0, editorExtensions_1.$xV)($f0);
    (0, editorExtensions_1.$xV)(InsertCursorAtEndOfLineSelected);
    (0, editorExtensions_1.$xV)(InsertCursorAtTopOfLineSelected);
    (0, editorExtensions_1.$xV)($h0);
    (0, editorExtensions_1.$xV)($i0);
});
//# sourceMappingURL=multicursor.js.map