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
define(["require", "exports", "vs/base/common/async", "vs/base/common/lifecycle", "vs/base/common/strings", "vs/editor/browser/editorExtensions", "vs/editor/common/core/editorColorRegistry", "vs/editor/common/editorContextKeys", "vs/editor/common/model", "vs/editor/contrib/find/browser/findModel", "vs/editor/contrib/find/browser/findOptionsWidget", "vs/editor/contrib/find/browser/findState", "vs/editor/contrib/find/browser/findWidget", "vs/nls!vs/editor/contrib/find/browser/findController", "vs/platform/actions/common/actions", "vs/platform/clipboard/common/clipboardService", "vs/platform/contextkey/common/contextkey", "vs/platform/contextview/browser/contextView", "vs/platform/keybinding/common/keybinding", "vs/platform/notification/common/notification", "vs/platform/quickinput/common/quickInput", "vs/platform/storage/common/storage", "vs/platform/theme/common/themeService"], function (require, exports, async_1, lifecycle_1, strings, editorExtensions_1, editorColorRegistry_1, editorContextKeys_1, model_1, findModel_1, findOptionsWidget_1, findState_1, findWidget_1, nls, actions_1, clipboardService_1, contextkey_1, contextView_1, keybinding_1, notification_1, quickInput_1, storage_1, themeService_1) {
    "use strict";
    var $W7_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$97 = exports.$87 = exports.$77 = exports.$67 = exports.$57 = exports.$47 = exports.$37 = exports.$27 = exports.$17 = exports.$Z7 = exports.$Y7 = exports.$X7 = exports.$W7 = exports.FindStartFocusAction = exports.$V7 = void 0;
    const SEARCH_STRING_MAX_LENGTH = 524288;
    function $V7(editor, seedSearchStringFromSelection = 'single', seedSearchStringFromNonEmptySelection = false) {
        if (!editor.hasModel()) {
            return null;
        }
        const selection = editor.getSelection();
        // if selection spans multiple lines, default search string to empty
        if ((seedSearchStringFromSelection === 'single' && selection.startLineNumber === selection.endLineNumber)
            || seedSearchStringFromSelection === 'multiple') {
            if (selection.isEmpty()) {
                const wordAtPosition = editor.getConfiguredWordAtPosition(selection.getStartPosition());
                if (wordAtPosition && (false === seedSearchStringFromNonEmptySelection)) {
                    return wordAtPosition.word;
                }
            }
            else {
                if (editor.getModel().getValueLengthInRange(selection) < SEARCH_STRING_MAX_LENGTH) {
                    return editor.getModel().getValueInRange(selection);
                }
            }
        }
        return null;
    }
    exports.$V7 = $V7;
    var FindStartFocusAction;
    (function (FindStartFocusAction) {
        FindStartFocusAction[FindStartFocusAction["NoFocusChange"] = 0] = "NoFocusChange";
        FindStartFocusAction[FindStartFocusAction["FocusFindInput"] = 1] = "FocusFindInput";
        FindStartFocusAction[FindStartFocusAction["FocusReplaceInput"] = 2] = "FocusReplaceInput";
    })(FindStartFocusAction || (exports.FindStartFocusAction = FindStartFocusAction = {}));
    let $W7 = class $W7 extends lifecycle_1.$kc {
        static { $W7_1 = this; }
        static { this.ID = 'editor.contrib.findController'; }
        get editor() {
            return this.a;
        }
        static get(editor) {
            return editor.getContribution($W7_1.ID);
        }
        constructor(editor, contextKeyService, storageService, clipboardService, notificationService) {
            super();
            this.a = editor;
            this.b = findModel_1.$y7.bindTo(contextKeyService);
            this.m = contextKeyService;
            this.h = storageService;
            this.j = clipboardService;
            this.n = notificationService;
            this.f = new async_1.$Dg(500);
            this.c = this.B(new findState_1.$t7());
            this.u();
            this.B(this.c.onFindReplaceStateChange((e) => this.s(e)));
            this.g = null;
            this.B(this.a.onDidChangeModel(() => {
                const shouldRestartFind = (this.a.getModel() && this.c.isRevealed);
                this.r();
                this.c.change({
                    searchScope: null,
                    matchCase: this.h.getBoolean('editor.matchCase', 1 /* StorageScope.WORKSPACE */, false),
                    wholeWord: this.h.getBoolean('editor.wholeWord', 1 /* StorageScope.WORKSPACE */, false),
                    isRegex: this.h.getBoolean('editor.isRegex', 1 /* StorageScope.WORKSPACE */, false),
                    preserveCase: this.h.getBoolean('editor.preserveCase', 1 /* StorageScope.WORKSPACE */, false)
                }, false);
                if (shouldRestartFind) {
                    this.w({
                        forceRevealReplace: false,
                        seedSearchStringFromSelection: 'none',
                        seedSearchStringFromNonEmptySelection: false,
                        seedSearchStringFromGlobalClipboard: false,
                        shouldFocus: 0 /* FindStartFocusAction.NoFocusChange */,
                        shouldAnimate: false,
                        updateSearchScope: false,
                        loop: this.a.getOption(41 /* EditorOption.find */).loop
                    });
                }
            }));
        }
        dispose() {
            this.r();
            super.dispose();
        }
        r() {
            if (this.g) {
                this.g.dispose();
                this.g = null;
            }
        }
        s(e) {
            this.t(e);
            if (e.isRevealed) {
                if (this.c.isRevealed) {
                    this.b.set(true);
                }
                else {
                    this.b.reset();
                    this.r();
                }
            }
            if (e.searchString) {
                this.setGlobalBufferTerm(this.c.searchString);
            }
        }
        t(e) {
            if (e.isRegex) {
                this.h.store('editor.isRegex', this.c.actualIsRegex, 1 /* StorageScope.WORKSPACE */, 1 /* StorageTarget.MACHINE */);
            }
            if (e.wholeWord) {
                this.h.store('editor.wholeWord', this.c.actualWholeWord, 1 /* StorageScope.WORKSPACE */, 1 /* StorageTarget.MACHINE */);
            }
            if (e.matchCase) {
                this.h.store('editor.matchCase', this.c.actualMatchCase, 1 /* StorageScope.WORKSPACE */, 1 /* StorageTarget.MACHINE */);
            }
            if (e.preserveCase) {
                this.h.store('editor.preserveCase', this.c.actualPreserveCase, 1 /* StorageScope.WORKSPACE */, 1 /* StorageTarget.MACHINE */);
            }
        }
        u() {
            this.c.change({
                matchCase: this.h.getBoolean('editor.matchCase', 1 /* StorageScope.WORKSPACE */, this.c.matchCase),
                wholeWord: this.h.getBoolean('editor.wholeWord', 1 /* StorageScope.WORKSPACE */, this.c.wholeWord),
                isRegex: this.h.getBoolean('editor.isRegex', 1 /* StorageScope.WORKSPACE */, this.c.isRegex),
                preserveCase: this.h.getBoolean('editor.preserveCase', 1 /* StorageScope.WORKSPACE */, this.c.preserveCase)
            }, false);
        }
        isFindInputFocused() {
            return !!findModel_1.$A7.getValue(this.m);
        }
        getState() {
            return this.c;
        }
        closeFindWidget() {
            this.c.change({
                isRevealed: false,
                searchScope: null
            }, false);
            this.a.focus();
        }
        toggleCaseSensitive() {
            this.c.change({ matchCase: !this.c.matchCase }, false);
            if (!this.c.isRevealed) {
                this.highlightFindOptions();
            }
        }
        toggleWholeWords() {
            this.c.change({ wholeWord: !this.c.wholeWord }, false);
            if (!this.c.isRevealed) {
                this.highlightFindOptions();
            }
        }
        toggleRegex() {
            this.c.change({ isRegex: !this.c.isRegex }, false);
            if (!this.c.isRevealed) {
                this.highlightFindOptions();
            }
        }
        togglePreserveCase() {
            this.c.change({ preserveCase: !this.c.preserveCase }, false);
            if (!this.c.isRevealed) {
                this.highlightFindOptions();
            }
        }
        toggleSearchScope() {
            if (this.c.searchScope) {
                this.c.change({ searchScope: null }, true);
            }
            else {
                if (this.a.hasModel()) {
                    const selections = this.a.getSelections();
                    selections.map(selection => {
                        if (selection.endColumn === 1 && selection.endLineNumber > selection.startLineNumber) {
                            selection = selection.setEndPosition(selection.endLineNumber - 1, this.a.getModel().getLineMaxColumn(selection.endLineNumber - 1));
                        }
                        if (!selection.isEmpty()) {
                            return selection;
                        }
                        return null;
                    }).filter(element => !!element);
                    if (selections.length) {
                        this.c.change({ searchScope: selections }, true);
                    }
                }
            }
        }
        setSearchString(searchString) {
            if (this.c.isRegex) {
                searchString = strings.$qe(searchString);
            }
            this.c.change({ searchString: searchString }, false);
        }
        highlightFindOptions(ignoreWhenVisible = false) {
            // overwritten in subclass
        }
        async w(opts, newState) {
            this.r();
            if (!this.a.hasModel()) {
                // cannot do anything with an editor that doesn't have a model...
                return;
            }
            const stateChanges = {
                ...newState,
                isRevealed: true
            };
            if (opts.seedSearchStringFromSelection === 'single') {
                const selectionSearchString = $V7(this.a, opts.seedSearchStringFromSelection, opts.seedSearchStringFromNonEmptySelection);
                if (selectionSearchString) {
                    if (this.c.isRegex) {
                        stateChanges.searchString = strings.$qe(selectionSearchString);
                    }
                    else {
                        stateChanges.searchString = selectionSearchString;
                    }
                }
            }
            else if (opts.seedSearchStringFromSelection === 'multiple' && !opts.updateSearchScope) {
                const selectionSearchString = $V7(this.a, opts.seedSearchStringFromSelection);
                if (selectionSearchString) {
                    stateChanges.searchString = selectionSearchString;
                }
            }
            if (!stateChanges.searchString && opts.seedSearchStringFromGlobalClipboard) {
                const selectionSearchString = await this.getGlobalBufferTerm();
                if (!this.a.hasModel()) {
                    // the editor has lost its model in the meantime
                    return;
                }
                if (selectionSearchString) {
                    stateChanges.searchString = selectionSearchString;
                }
            }
            // Overwrite isReplaceRevealed
            if (opts.forceRevealReplace || stateChanges.isReplaceRevealed) {
                stateChanges.isReplaceRevealed = true;
            }
            else if (!this.b.get()) {
                stateChanges.isReplaceRevealed = false;
            }
            if (opts.updateSearchScope) {
                const currentSelections = this.a.getSelections();
                if (currentSelections.some(selection => !selection.isEmpty())) {
                    stateChanges.searchScope = currentSelections;
                }
            }
            stateChanges.loop = opts.loop;
            this.c.change(stateChanges, false);
            if (!this.g) {
                this.g = new findModel_1.$J7(this.a, this.c);
            }
        }
        start(opts, newState) {
            return this.w(opts, newState);
        }
        moveToNextMatch() {
            if (this.g) {
                this.g.moveToNextMatch();
                return true;
            }
            return false;
        }
        moveToPrevMatch() {
            if (this.g) {
                this.g.moveToPrevMatch();
                return true;
            }
            return false;
        }
        goToMatch(index) {
            if (this.g) {
                this.g.moveToMatch(index);
                return true;
            }
            return false;
        }
        replace() {
            if (this.g) {
                this.g.replace();
                return true;
            }
            return false;
        }
        replaceAll() {
            if (this.g) {
                if (this.a.getModel()?.isTooLargeForHeapOperation()) {
                    this.n.warn(nls.localize(0, null));
                    return false;
                }
                this.g.replaceAll();
                return true;
            }
            return false;
        }
        selectAllMatches() {
            if (this.g) {
                this.g.selectAllMatches();
                this.a.focus();
                return true;
            }
            return false;
        }
        async getGlobalBufferTerm() {
            if (this.a.getOption(41 /* EditorOption.find */).globalFindClipboard
                && this.a.hasModel()
                && !this.a.getModel().isTooLargeForSyncing()) {
                return this.j.readFindText();
            }
            return '';
        }
        setGlobalBufferTerm(text) {
            if (this.a.getOption(41 /* EditorOption.find */).globalFindClipboard
                && this.a.hasModel()
                && !this.a.getModel().isTooLargeForSyncing()) {
                // intentionally not awaited
                this.j.writeFindText(text);
            }
        }
    };
    exports.$W7 = $W7;
    exports.$W7 = $W7 = $W7_1 = __decorate([
        __param(1, contextkey_1.$3i),
        __param(2, storage_1.$Vo),
        __param(3, clipboardService_1.$UZ),
        __param(4, notification_1.$Yu)
    ], $W7);
    let $X7 = class $X7 extends $W7 {
        constructor(editor, C, _contextKeyService, D, F, notificationService, _storageService, clipboardService) {
            super(editor, _contextKeyService, _storageService, clipboardService, notificationService);
            this.C = C;
            this.D = D;
            this.F = F;
            this.y = null;
            this.z = null;
        }
        async w(opts, newState) {
            if (!this.y) {
                this.H();
            }
            const selection = this.a.getSelection();
            let updateSearchScope = false;
            switch (this.a.getOption(41 /* EditorOption.find */).autoFindInSelection) {
                case 'always':
                    updateSearchScope = true;
                    break;
                case 'never':
                    updateSearchScope = false;
                    break;
                case 'multiline': {
                    const isSelectionMultipleLine = !!selection && selection.startLineNumber !== selection.endLineNumber;
                    updateSearchScope = isSelectionMultipleLine;
                    break;
                }
                default:
                    break;
            }
            opts.updateSearchScope = opts.updateSearchScope || updateSearchScope;
            await super.w(opts, newState);
            if (this.y) {
                if (opts.shouldFocus === 2 /* FindStartFocusAction.FocusReplaceInput */) {
                    this.y.focusReplaceInput();
                }
                else if (opts.shouldFocus === 1 /* FindStartFocusAction.FocusFindInput */) {
                    this.y.focusFindInput();
                }
            }
        }
        highlightFindOptions(ignoreWhenVisible = false) {
            if (!this.y) {
                this.H();
            }
            if (this.c.isRevealed && !ignoreWhenVisible) {
                this.y.highlightFindOptions();
            }
            else {
                this.z.highlightFindOptions();
            }
        }
        H() {
            this.y = this.B(new findWidget_1.$T7(this.a, this, this.c, this.C, this.D, this.m, this.F, this.h, this.n));
            this.z = this.B(new findOptionsWidget_1.$K7(this.a, this.c, this.D));
        }
        saveViewState() {
            return this.y?.getViewState();
        }
        restoreViewState(state) {
            this.y?.setViewState(state);
        }
    };
    exports.$X7 = $X7;
    exports.$X7 = $X7 = __decorate([
        __param(1, contextView_1.$VZ),
        __param(2, contextkey_1.$3i),
        __param(3, keybinding_1.$2D),
        __param(4, themeService_1.$gv),
        __param(5, notification_1.$Yu),
        __param(6, storage_1.$Vo),
        __param(7, clipboardService_1.$UZ)
    ], $X7);
    exports.$Y7 = (0, editorExtensions_1.$yV)(new editorExtensions_1.$tV({
        id: findModel_1.$H7.StartFindAction,
        label: nls.localize(1, null),
        alias: 'Find',
        precondition: contextkey_1.$Ii.or(editorContextKeys_1.EditorContextKeys.focus, contextkey_1.$Ii.has('editorIsOpen')),
        kbOpts: {
            kbExpr: null,
            primary: 2048 /* KeyMod.CtrlCmd */ | 36 /* KeyCode.KeyF */,
            weight: 100 /* KeybindingWeight.EditorContrib */
        },
        menuOpts: {
            menuId: actions_1.$Ru.MenubarEditMenu,
            group: '3_find',
            title: nls.localize(2, null),
            order: 1
        }
    }));
    exports.$Y7.addImplementation(0, (accessor, editor, args) => {
        const controller = $W7.get(editor);
        if (!controller) {
            return false;
        }
        return controller.start({
            forceRevealReplace: false,
            seedSearchStringFromSelection: editor.getOption(41 /* EditorOption.find */).seedSearchStringFromSelection !== 'never' ? 'single' : 'none',
            seedSearchStringFromNonEmptySelection: editor.getOption(41 /* EditorOption.find */).seedSearchStringFromSelection === 'selection',
            seedSearchStringFromGlobalClipboard: editor.getOption(41 /* EditorOption.find */).globalFindClipboard,
            shouldFocus: 1 /* FindStartFocusAction.FocusFindInput */,
            shouldAnimate: true,
            updateSearchScope: false,
            loop: editor.getOption(41 /* EditorOption.find */).loop
        });
    });
    const findArgDescription = {
        description: 'Open a new In-Editor Find Widget.',
        args: [{
                name: 'Open a new In-Editor Find Widget args',
                schema: {
                    properties: {
                        searchString: { type: 'string' },
                        replaceString: { type: 'string' },
                        regex: { type: 'boolean' },
                        regexOverride: {
                            type: 'number',
                            description: nls.localize(3, null)
                        },
                        wholeWord: { type: 'boolean' },
                        wholeWordOverride: {
                            type: 'number',
                            description: nls.localize(4, null)
                        },
                        matchCase: { type: 'boolean' },
                        matchCaseOverride: {
                            type: 'number',
                            description: nls.localize(5, null)
                        },
                        preserveCase: { type: 'boolean' },
                        preserveCaseOverride: {
                            type: 'number',
                            description: nls.localize(6, null)
                        },
                        findInSelection: { type: 'boolean' },
                    }
                }
            }]
    };
    class $Z7 extends editorExtensions_1.$sV {
        constructor() {
            super({
                id: findModel_1.$H7.StartFindWithArgs,
                label: nls.localize(7, null),
                alias: 'Find With Arguments',
                precondition: undefined,
                kbOpts: {
                    kbExpr: null,
                    primary: 0,
                    weight: 100 /* KeybindingWeight.EditorContrib */
                },
                description: findArgDescription
            });
        }
        async run(accessor, editor, args) {
            const controller = $W7.get(editor);
            if (controller) {
                const newState = args ? {
                    searchString: args.searchString,
                    replaceString: args.replaceString,
                    isReplaceRevealed: args.replaceString !== undefined,
                    isRegex: args.isRegex,
                    // isRegexOverride: args.regexOverride,
                    wholeWord: args.matchWholeWord,
                    // wholeWordOverride: args.wholeWordOverride,
                    matchCase: args.isCaseSensitive,
                    // matchCaseOverride: args.matchCaseOverride,
                    preserveCase: args.preserveCase,
                    // preserveCaseOverride: args.preserveCaseOverride,
                } : {};
                await controller.start({
                    forceRevealReplace: false,
                    seedSearchStringFromSelection: (controller.getState().searchString.length === 0) && editor.getOption(41 /* EditorOption.find */).seedSearchStringFromSelection !== 'never' ? 'single' : 'none',
                    seedSearchStringFromNonEmptySelection: editor.getOption(41 /* EditorOption.find */).seedSearchStringFromSelection === 'selection',
                    seedSearchStringFromGlobalClipboard: true,
                    shouldFocus: 1 /* FindStartFocusAction.FocusFindInput */,
                    shouldAnimate: true,
                    updateSearchScope: args?.findInSelection || false,
                    loop: editor.getOption(41 /* EditorOption.find */).loop
                }, newState);
                controller.setGlobalBufferTerm(controller.getState().searchString);
            }
        }
    }
    exports.$Z7 = $Z7;
    class $17 extends editorExtensions_1.$sV {
        constructor() {
            super({
                id: findModel_1.$H7.StartFindWithSelection,
                label: nls.localize(8, null),
                alias: 'Find With Selection',
                precondition: undefined,
                kbOpts: {
                    kbExpr: null,
                    primary: 0,
                    mac: {
                        primary: 2048 /* KeyMod.CtrlCmd */ | 35 /* KeyCode.KeyE */,
                    },
                    weight: 100 /* KeybindingWeight.EditorContrib */
                }
            });
        }
        async run(accessor, editor) {
            const controller = $W7.get(editor);
            if (controller) {
                await controller.start({
                    forceRevealReplace: false,
                    seedSearchStringFromSelection: 'multiple',
                    seedSearchStringFromNonEmptySelection: false,
                    seedSearchStringFromGlobalClipboard: false,
                    shouldFocus: 0 /* FindStartFocusAction.NoFocusChange */,
                    shouldAnimate: true,
                    updateSearchScope: false,
                    loop: editor.getOption(41 /* EditorOption.find */).loop
                });
                controller.setGlobalBufferTerm(controller.getState().searchString);
            }
        }
    }
    exports.$17 = $17;
    class $27 extends editorExtensions_1.$sV {
        async run(accessor, editor) {
            const controller = $W7.get(editor);
            if (controller && !this.d(controller)) {
                await controller.start({
                    forceRevealReplace: false,
                    seedSearchStringFromSelection: (controller.getState().searchString.length === 0) && editor.getOption(41 /* EditorOption.find */).seedSearchStringFromSelection !== 'never' ? 'single' : 'none',
                    seedSearchStringFromNonEmptySelection: editor.getOption(41 /* EditorOption.find */).seedSearchStringFromSelection === 'selection',
                    seedSearchStringFromGlobalClipboard: true,
                    shouldFocus: 0 /* FindStartFocusAction.NoFocusChange */,
                    shouldAnimate: true,
                    updateSearchScope: false,
                    loop: editor.getOption(41 /* EditorOption.find */).loop
                });
                this.d(controller);
            }
        }
    }
    exports.$27 = $27;
    class $37 extends $27 {
        constructor() {
            super({
                id: findModel_1.$H7.NextMatchFindAction,
                label: nls.localize(9, null),
                alias: 'Find Next',
                precondition: undefined,
                kbOpts: [{
                        kbExpr: editorContextKeys_1.EditorContextKeys.focus,
                        primary: 61 /* KeyCode.F3 */,
                        mac: { primary: 2048 /* KeyMod.CtrlCmd */ | 37 /* KeyCode.KeyG */, secondary: [61 /* KeyCode.F3 */] },
                        weight: 100 /* KeybindingWeight.EditorContrib */
                    }, {
                        kbExpr: contextkey_1.$Ii.and(editorContextKeys_1.EditorContextKeys.focus, findModel_1.$A7),
                        primary: 3 /* KeyCode.Enter */,
                        weight: 100 /* KeybindingWeight.EditorContrib */
                    }]
            });
        }
        d(controller) {
            const result = controller.moveToNextMatch();
            if (result) {
                controller.editor.pushUndoStop();
                return true;
            }
            return false;
        }
    }
    exports.$37 = $37;
    class $47 extends $27 {
        constructor() {
            super({
                id: findModel_1.$H7.PreviousMatchFindAction,
                label: nls.localize(10, null),
                alias: 'Find Previous',
                precondition: undefined,
                kbOpts: [{
                        kbExpr: editorContextKeys_1.EditorContextKeys.focus,
                        primary: 1024 /* KeyMod.Shift */ | 61 /* KeyCode.F3 */,
                        mac: { primary: 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 37 /* KeyCode.KeyG */, secondary: [1024 /* KeyMod.Shift */ | 61 /* KeyCode.F3 */] },
                        weight: 100 /* KeybindingWeight.EditorContrib */
                    }, {
                        kbExpr: contextkey_1.$Ii.and(editorContextKeys_1.EditorContextKeys.focus, findModel_1.$A7),
                        primary: 1024 /* KeyMod.Shift */ | 3 /* KeyCode.Enter */,
                        weight: 100 /* KeybindingWeight.EditorContrib */
                    }
                ]
            });
        }
        d(controller) {
            return controller.moveToPrevMatch();
        }
    }
    exports.$47 = $47;
    class $57 extends editorExtensions_1.$sV {
        constructor() {
            super({
                id: findModel_1.$H7.GoToMatchFindAction,
                label: nls.localize(11, null),
                alias: 'Go to Match...',
                precondition: findModel_1.$y7
            });
            this.d = [];
        }
        run(accessor, editor, args) {
            const controller = $W7.get(editor);
            if (!controller) {
                return;
            }
            const matchesCount = controller.getState().matchesCount;
            if (matchesCount < 1) {
                const notificationService = accessor.get(notification_1.$Yu);
                notificationService.notify({
                    severity: notification_1.Severity.Warning,
                    message: nls.localize(12, null)
                });
                return;
            }
            const quickInputService = accessor.get(quickInput_1.$Gq);
            const inputBox = quickInputService.createInputBox();
            inputBox.placeholder = nls.localize(13, null, matchesCount);
            const toFindMatchIndex = (value) => {
                const index = parseInt(value);
                if (isNaN(index)) {
                    return undefined;
                }
                const matchCount = controller.getState().matchesCount;
                if (index > 0 && index <= matchCount) {
                    return index - 1; // zero based
                }
                else if (index < 0 && index >= -matchCount) {
                    return matchCount + index;
                }
                return undefined;
            };
            const updatePickerAndEditor = (value) => {
                const index = toFindMatchIndex(value);
                if (typeof index === 'number') {
                    // valid
                    inputBox.validationMessage = undefined;
                    controller.goToMatch(index);
                    const currentMatch = controller.getState().currentMatch;
                    if (currentMatch) {
                        this.j(editor, currentMatch);
                    }
                }
                else {
                    inputBox.validationMessage = nls.localize(14, null, controller.getState().matchesCount);
                    this.h(editor);
                }
            };
            inputBox.onDidChangeValue(value => {
                updatePickerAndEditor(value);
            });
            inputBox.onDidAccept(() => {
                const index = toFindMatchIndex(inputBox.value);
                if (typeof index === 'number') {
                    controller.goToMatch(index);
                    inputBox.hide();
                }
                else {
                    inputBox.validationMessage = nls.localize(15, null, controller.getState().matchesCount);
                }
            });
            inputBox.onDidHide(() => {
                this.h(editor);
                inputBox.dispose();
            });
            inputBox.show();
        }
        h(editor) {
            editor.changeDecorations(changeAccessor => {
                this.d = changeAccessor.deltaDecorations(this.d, []);
            });
        }
        j(editor, range) {
            editor.changeDecorations(changeAccessor => {
                this.d = changeAccessor.deltaDecorations(this.d, [
                    {
                        range,
                        options: {
                            description: 'find-match-quick-access-range-highlight',
                            className: 'rangeHighlight',
                            isWholeLine: true
                        }
                    },
                    {
                        range,
                        options: {
                            description: 'find-match-quick-access-range-highlight-overview',
                            overviewRuler: {
                                color: (0, themeService_1.$hv)(editorColorRegistry_1.$rB),
                                position: model_1.OverviewRulerLane.Full
                            }
                        }
                    }
                ]);
            });
        }
    }
    exports.$57 = $57;
    class $67 extends editorExtensions_1.$sV {
        async run(accessor, editor) {
            const controller = $W7.get(editor);
            if (!controller) {
                return;
            }
            const selectionSearchString = $V7(editor, 'single', false);
            if (selectionSearchString) {
                controller.setSearchString(selectionSearchString);
            }
            if (!this.d(controller)) {
                await controller.start({
                    forceRevealReplace: false,
                    seedSearchStringFromSelection: 'none',
                    seedSearchStringFromNonEmptySelection: false,
                    seedSearchStringFromGlobalClipboard: false,
                    shouldFocus: 0 /* FindStartFocusAction.NoFocusChange */,
                    shouldAnimate: true,
                    updateSearchScope: false,
                    loop: editor.getOption(41 /* EditorOption.find */).loop
                });
                this.d(controller);
            }
        }
    }
    exports.$67 = $67;
    class $77 extends $67 {
        constructor() {
            super({
                id: findModel_1.$H7.NextSelectionMatchFindAction,
                label: nls.localize(16, null),
                alias: 'Find Next Selection',
                precondition: undefined,
                kbOpts: {
                    kbExpr: editorContextKeys_1.EditorContextKeys.focus,
                    primary: 2048 /* KeyMod.CtrlCmd */ | 61 /* KeyCode.F3 */,
                    weight: 100 /* KeybindingWeight.EditorContrib */
                }
            });
        }
        d(controller) {
            return controller.moveToNextMatch();
        }
    }
    exports.$77 = $77;
    class $87 extends $67 {
        constructor() {
            super({
                id: findModel_1.$H7.PreviousSelectionMatchFindAction,
                label: nls.localize(17, null),
                alias: 'Find Previous Selection',
                precondition: undefined,
                kbOpts: {
                    kbExpr: editorContextKeys_1.EditorContextKeys.focus,
                    primary: 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 61 /* KeyCode.F3 */,
                    weight: 100 /* KeybindingWeight.EditorContrib */
                }
            });
        }
        d(controller) {
            return controller.moveToPrevMatch();
        }
    }
    exports.$87 = $87;
    exports.$97 = (0, editorExtensions_1.$yV)(new editorExtensions_1.$tV({
        id: findModel_1.$H7.StartFindReplaceAction,
        label: nls.localize(18, null),
        alias: 'Replace',
        precondition: contextkey_1.$Ii.or(editorContextKeys_1.EditorContextKeys.focus, contextkey_1.$Ii.has('editorIsOpen')),
        kbOpts: {
            kbExpr: null,
            primary: 2048 /* KeyMod.CtrlCmd */ | 38 /* KeyCode.KeyH */,
            mac: { primary: 2048 /* KeyMod.CtrlCmd */ | 512 /* KeyMod.Alt */ | 36 /* KeyCode.KeyF */ },
            weight: 100 /* KeybindingWeight.EditorContrib */
        },
        menuOpts: {
            menuId: actions_1.$Ru.MenubarEditMenu,
            group: '3_find',
            title: nls.localize(19, null),
            order: 2
        }
    }));
    exports.$97.addImplementation(0, (accessor, editor, args) => {
        if (!editor.hasModel() || editor.getOption(90 /* EditorOption.readOnly */)) {
            return false;
        }
        const controller = $W7.get(editor);
        if (!controller) {
            return false;
        }
        const currentSelection = editor.getSelection();
        const findInputFocused = controller.isFindInputFocused();
        // we only seed search string from selection when the current selection is single line and not empty,
        // + the find input is not focused
        const seedSearchStringFromSelection = !currentSelection.isEmpty()
            && currentSelection.startLineNumber === currentSelection.endLineNumber
            && (editor.getOption(41 /* EditorOption.find */).seedSearchStringFromSelection !== 'never')
            && !findInputFocused;
        /*
        * if the existing search string in find widget is empty and we don't seed search string from selection, it means the Find Input is still empty, so we should focus the Find Input instead of Replace Input.
    
        * findInputFocused true -> seedSearchStringFromSelection false, FocusReplaceInput
        * findInputFocused false, seedSearchStringFromSelection true FocusReplaceInput
        * findInputFocused false seedSearchStringFromSelection false FocusFindInput
        */
        const shouldFocus = (findInputFocused || seedSearchStringFromSelection) ?
            2 /* FindStartFocusAction.FocusReplaceInput */ : 1 /* FindStartFocusAction.FocusFindInput */;
        return controller.start({
            forceRevealReplace: true,
            seedSearchStringFromSelection: seedSearchStringFromSelection ? 'single' : 'none',
            seedSearchStringFromNonEmptySelection: editor.getOption(41 /* EditorOption.find */).seedSearchStringFromSelection === 'selection',
            seedSearchStringFromGlobalClipboard: editor.getOption(41 /* EditorOption.find */).seedSearchStringFromSelection !== 'never',
            shouldFocus: shouldFocus,
            shouldAnimate: true,
            updateSearchScope: false,
            loop: editor.getOption(41 /* EditorOption.find */).loop
        });
    });
    (0, editorExtensions_1.$AV)($W7.ID, $X7, 0 /* EditorContributionInstantiation.Eager */); // eager because it uses `saveViewState`/`restoreViewState`
    (0, editorExtensions_1.$xV)($Z7);
    (0, editorExtensions_1.$xV)($17);
    (0, editorExtensions_1.$xV)($37);
    (0, editorExtensions_1.$xV)($47);
    (0, editorExtensions_1.$xV)($57);
    (0, editorExtensions_1.$xV)($77);
    (0, editorExtensions_1.$xV)($87);
    const FindCommand = editorExtensions_1.$rV.bindToContribution($W7.get);
    (0, editorExtensions_1.$wV)(new FindCommand({
        id: findModel_1.$H7.CloseFindWidgetCommand,
        precondition: findModel_1.$y7,
        handler: x => x.closeFindWidget(),
        kbOpts: {
            weight: 100 /* KeybindingWeight.EditorContrib */ + 5,
            kbExpr: contextkey_1.$Ii.and(editorContextKeys_1.EditorContextKeys.focus, contextkey_1.$Ii.not('isComposing')),
            primary: 9 /* KeyCode.Escape */,
            secondary: [1024 /* KeyMod.Shift */ | 9 /* KeyCode.Escape */]
        }
    }));
    (0, editorExtensions_1.$wV)(new FindCommand({
        id: findModel_1.$H7.ToggleCaseSensitiveCommand,
        precondition: undefined,
        handler: x => x.toggleCaseSensitive(),
        kbOpts: {
            weight: 100 /* KeybindingWeight.EditorContrib */ + 5,
            kbExpr: editorContextKeys_1.EditorContextKeys.focus,
            primary: findModel_1.$C7.primary,
            mac: findModel_1.$C7.mac,
            win: findModel_1.$C7.win,
            linux: findModel_1.$C7.linux
        }
    }));
    (0, editorExtensions_1.$wV)(new FindCommand({
        id: findModel_1.$H7.ToggleWholeWordCommand,
        precondition: undefined,
        handler: x => x.toggleWholeWords(),
        kbOpts: {
            weight: 100 /* KeybindingWeight.EditorContrib */ + 5,
            kbExpr: editorContextKeys_1.EditorContextKeys.focus,
            primary: findModel_1.$D7.primary,
            mac: findModel_1.$D7.mac,
            win: findModel_1.$D7.win,
            linux: findModel_1.$D7.linux
        }
    }));
    (0, editorExtensions_1.$wV)(new FindCommand({
        id: findModel_1.$H7.ToggleRegexCommand,
        precondition: undefined,
        handler: x => x.toggleRegex(),
        kbOpts: {
            weight: 100 /* KeybindingWeight.EditorContrib */ + 5,
            kbExpr: editorContextKeys_1.EditorContextKeys.focus,
            primary: findModel_1.$E7.primary,
            mac: findModel_1.$E7.mac,
            win: findModel_1.$E7.win,
            linux: findModel_1.$E7.linux
        }
    }));
    (0, editorExtensions_1.$wV)(new FindCommand({
        id: findModel_1.$H7.ToggleSearchScopeCommand,
        precondition: undefined,
        handler: x => x.toggleSearchScope(),
        kbOpts: {
            weight: 100 /* KeybindingWeight.EditorContrib */ + 5,
            kbExpr: editorContextKeys_1.EditorContextKeys.focus,
            primary: findModel_1.$F7.primary,
            mac: findModel_1.$F7.mac,
            win: findModel_1.$F7.win,
            linux: findModel_1.$F7.linux
        }
    }));
    (0, editorExtensions_1.$wV)(new FindCommand({
        id: findModel_1.$H7.TogglePreserveCaseCommand,
        precondition: undefined,
        handler: x => x.togglePreserveCase(),
        kbOpts: {
            weight: 100 /* KeybindingWeight.EditorContrib */ + 5,
            kbExpr: editorContextKeys_1.EditorContextKeys.focus,
            primary: findModel_1.$G7.primary,
            mac: findModel_1.$G7.mac,
            win: findModel_1.$G7.win,
            linux: findModel_1.$G7.linux
        }
    }));
    (0, editorExtensions_1.$wV)(new FindCommand({
        id: findModel_1.$H7.ReplaceOneAction,
        precondition: findModel_1.$y7,
        handler: x => x.replace(),
        kbOpts: {
            weight: 100 /* KeybindingWeight.EditorContrib */ + 5,
            kbExpr: editorContextKeys_1.EditorContextKeys.focus,
            primary: 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 22 /* KeyCode.Digit1 */
        }
    }));
    (0, editorExtensions_1.$wV)(new FindCommand({
        id: findModel_1.$H7.ReplaceOneAction,
        precondition: findModel_1.$y7,
        handler: x => x.replace(),
        kbOpts: {
            weight: 100 /* KeybindingWeight.EditorContrib */ + 5,
            kbExpr: contextkey_1.$Ii.and(editorContextKeys_1.EditorContextKeys.focus, findModel_1.$B7),
            primary: 3 /* KeyCode.Enter */
        }
    }));
    (0, editorExtensions_1.$wV)(new FindCommand({
        id: findModel_1.$H7.ReplaceAllAction,
        precondition: findModel_1.$y7,
        handler: x => x.replaceAll(),
        kbOpts: {
            weight: 100 /* KeybindingWeight.EditorContrib */ + 5,
            kbExpr: editorContextKeys_1.EditorContextKeys.focus,
            primary: 2048 /* KeyMod.CtrlCmd */ | 512 /* KeyMod.Alt */ | 3 /* KeyCode.Enter */
        }
    }));
    (0, editorExtensions_1.$wV)(new FindCommand({
        id: findModel_1.$H7.ReplaceAllAction,
        precondition: findModel_1.$y7,
        handler: x => x.replaceAll(),
        kbOpts: {
            weight: 100 /* KeybindingWeight.EditorContrib */ + 5,
            kbExpr: contextkey_1.$Ii.and(editorContextKeys_1.EditorContextKeys.focus, findModel_1.$B7),
            primary: undefined,
            mac: {
                primary: 2048 /* KeyMod.CtrlCmd */ | 3 /* KeyCode.Enter */,
            }
        }
    }));
    (0, editorExtensions_1.$wV)(new FindCommand({
        id: findModel_1.$H7.SelectAllMatchesAction,
        precondition: findModel_1.$y7,
        handler: x => x.selectAllMatches(),
        kbOpts: {
            weight: 100 /* KeybindingWeight.EditorContrib */ + 5,
            kbExpr: editorContextKeys_1.EditorContextKeys.focus,
            primary: 512 /* KeyMod.Alt */ | 3 /* KeyCode.Enter */
        }
    }));
});
//# sourceMappingURL=findController.js.map