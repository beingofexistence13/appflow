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
define(["require", "exports", "vs/base/common/async", "vs/base/common/lifecycle", "vs/base/common/strings", "vs/editor/browser/editorExtensions", "vs/editor/common/core/editorColorRegistry", "vs/editor/common/editorContextKeys", "vs/editor/common/model", "vs/editor/contrib/find/browser/findModel", "vs/editor/contrib/find/browser/findOptionsWidget", "vs/editor/contrib/find/browser/findState", "vs/editor/contrib/find/browser/findWidget", "vs/nls", "vs/platform/actions/common/actions", "vs/platform/clipboard/common/clipboardService", "vs/platform/contextkey/common/contextkey", "vs/platform/contextview/browser/contextView", "vs/platform/keybinding/common/keybinding", "vs/platform/notification/common/notification", "vs/platform/quickinput/common/quickInput", "vs/platform/storage/common/storage", "vs/platform/theme/common/themeService"], function (require, exports, async_1, lifecycle_1, strings, editorExtensions_1, editorColorRegistry_1, editorContextKeys_1, model_1, findModel_1, findOptionsWidget_1, findState_1, findWidget_1, nls, actions_1, clipboardService_1, contextkey_1, contextView_1, keybinding_1, notification_1, quickInput_1, storage_1, themeService_1) {
    "use strict";
    var CommonFindController_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.StartFindReplaceAction = exports.PreviousSelectionMatchFindAction = exports.NextSelectionMatchFindAction = exports.SelectionMatchFindAction = exports.MoveToMatchFindAction = exports.PreviousMatchFindAction = exports.NextMatchFindAction = exports.MatchFindAction = exports.StartFindWithSelectionAction = exports.StartFindWithArgsAction = exports.StartFindAction = exports.FindController = exports.CommonFindController = exports.FindStartFocusAction = exports.getSelectionSearchString = void 0;
    const SEARCH_STRING_MAX_LENGTH = 524288;
    function getSelectionSearchString(editor, seedSearchStringFromSelection = 'single', seedSearchStringFromNonEmptySelection = false) {
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
    exports.getSelectionSearchString = getSelectionSearchString;
    var FindStartFocusAction;
    (function (FindStartFocusAction) {
        FindStartFocusAction[FindStartFocusAction["NoFocusChange"] = 0] = "NoFocusChange";
        FindStartFocusAction[FindStartFocusAction["FocusFindInput"] = 1] = "FocusFindInput";
        FindStartFocusAction[FindStartFocusAction["FocusReplaceInput"] = 2] = "FocusReplaceInput";
    })(FindStartFocusAction || (exports.FindStartFocusAction = FindStartFocusAction = {}));
    let CommonFindController = class CommonFindController extends lifecycle_1.Disposable {
        static { CommonFindController_1 = this; }
        static { this.ID = 'editor.contrib.findController'; }
        get editor() {
            return this._editor;
        }
        static get(editor) {
            return editor.getContribution(CommonFindController_1.ID);
        }
        constructor(editor, contextKeyService, storageService, clipboardService, notificationService) {
            super();
            this._editor = editor;
            this._findWidgetVisible = findModel_1.CONTEXT_FIND_WIDGET_VISIBLE.bindTo(contextKeyService);
            this._contextKeyService = contextKeyService;
            this._storageService = storageService;
            this._clipboardService = clipboardService;
            this._notificationService = notificationService;
            this._updateHistoryDelayer = new async_1.Delayer(500);
            this._state = this._register(new findState_1.FindReplaceState());
            this.loadQueryState();
            this._register(this._state.onFindReplaceStateChange((e) => this._onStateChanged(e)));
            this._model = null;
            this._register(this._editor.onDidChangeModel(() => {
                const shouldRestartFind = (this._editor.getModel() && this._state.isRevealed);
                this.disposeModel();
                this._state.change({
                    searchScope: null,
                    matchCase: this._storageService.getBoolean('editor.matchCase', 1 /* StorageScope.WORKSPACE */, false),
                    wholeWord: this._storageService.getBoolean('editor.wholeWord', 1 /* StorageScope.WORKSPACE */, false),
                    isRegex: this._storageService.getBoolean('editor.isRegex', 1 /* StorageScope.WORKSPACE */, false),
                    preserveCase: this._storageService.getBoolean('editor.preserveCase', 1 /* StorageScope.WORKSPACE */, false)
                }, false);
                if (shouldRestartFind) {
                    this._start({
                        forceRevealReplace: false,
                        seedSearchStringFromSelection: 'none',
                        seedSearchStringFromNonEmptySelection: false,
                        seedSearchStringFromGlobalClipboard: false,
                        shouldFocus: 0 /* FindStartFocusAction.NoFocusChange */,
                        shouldAnimate: false,
                        updateSearchScope: false,
                        loop: this._editor.getOption(41 /* EditorOption.find */).loop
                    });
                }
            }));
        }
        dispose() {
            this.disposeModel();
            super.dispose();
        }
        disposeModel() {
            if (this._model) {
                this._model.dispose();
                this._model = null;
            }
        }
        _onStateChanged(e) {
            this.saveQueryState(e);
            if (e.isRevealed) {
                if (this._state.isRevealed) {
                    this._findWidgetVisible.set(true);
                }
                else {
                    this._findWidgetVisible.reset();
                    this.disposeModel();
                }
            }
            if (e.searchString) {
                this.setGlobalBufferTerm(this._state.searchString);
            }
        }
        saveQueryState(e) {
            if (e.isRegex) {
                this._storageService.store('editor.isRegex', this._state.actualIsRegex, 1 /* StorageScope.WORKSPACE */, 1 /* StorageTarget.MACHINE */);
            }
            if (e.wholeWord) {
                this._storageService.store('editor.wholeWord', this._state.actualWholeWord, 1 /* StorageScope.WORKSPACE */, 1 /* StorageTarget.MACHINE */);
            }
            if (e.matchCase) {
                this._storageService.store('editor.matchCase', this._state.actualMatchCase, 1 /* StorageScope.WORKSPACE */, 1 /* StorageTarget.MACHINE */);
            }
            if (e.preserveCase) {
                this._storageService.store('editor.preserveCase', this._state.actualPreserveCase, 1 /* StorageScope.WORKSPACE */, 1 /* StorageTarget.MACHINE */);
            }
        }
        loadQueryState() {
            this._state.change({
                matchCase: this._storageService.getBoolean('editor.matchCase', 1 /* StorageScope.WORKSPACE */, this._state.matchCase),
                wholeWord: this._storageService.getBoolean('editor.wholeWord', 1 /* StorageScope.WORKSPACE */, this._state.wholeWord),
                isRegex: this._storageService.getBoolean('editor.isRegex', 1 /* StorageScope.WORKSPACE */, this._state.isRegex),
                preserveCase: this._storageService.getBoolean('editor.preserveCase', 1 /* StorageScope.WORKSPACE */, this._state.preserveCase)
            }, false);
        }
        isFindInputFocused() {
            return !!findModel_1.CONTEXT_FIND_INPUT_FOCUSED.getValue(this._contextKeyService);
        }
        getState() {
            return this._state;
        }
        closeFindWidget() {
            this._state.change({
                isRevealed: false,
                searchScope: null
            }, false);
            this._editor.focus();
        }
        toggleCaseSensitive() {
            this._state.change({ matchCase: !this._state.matchCase }, false);
            if (!this._state.isRevealed) {
                this.highlightFindOptions();
            }
        }
        toggleWholeWords() {
            this._state.change({ wholeWord: !this._state.wholeWord }, false);
            if (!this._state.isRevealed) {
                this.highlightFindOptions();
            }
        }
        toggleRegex() {
            this._state.change({ isRegex: !this._state.isRegex }, false);
            if (!this._state.isRevealed) {
                this.highlightFindOptions();
            }
        }
        togglePreserveCase() {
            this._state.change({ preserveCase: !this._state.preserveCase }, false);
            if (!this._state.isRevealed) {
                this.highlightFindOptions();
            }
        }
        toggleSearchScope() {
            if (this._state.searchScope) {
                this._state.change({ searchScope: null }, true);
            }
            else {
                if (this._editor.hasModel()) {
                    const selections = this._editor.getSelections();
                    selections.map(selection => {
                        if (selection.endColumn === 1 && selection.endLineNumber > selection.startLineNumber) {
                            selection = selection.setEndPosition(selection.endLineNumber - 1, this._editor.getModel().getLineMaxColumn(selection.endLineNumber - 1));
                        }
                        if (!selection.isEmpty()) {
                            return selection;
                        }
                        return null;
                    }).filter(element => !!element);
                    if (selections.length) {
                        this._state.change({ searchScope: selections }, true);
                    }
                }
            }
        }
        setSearchString(searchString) {
            if (this._state.isRegex) {
                searchString = strings.escapeRegExpCharacters(searchString);
            }
            this._state.change({ searchString: searchString }, false);
        }
        highlightFindOptions(ignoreWhenVisible = false) {
            // overwritten in subclass
        }
        async _start(opts, newState) {
            this.disposeModel();
            if (!this._editor.hasModel()) {
                // cannot do anything with an editor that doesn't have a model...
                return;
            }
            const stateChanges = {
                ...newState,
                isRevealed: true
            };
            if (opts.seedSearchStringFromSelection === 'single') {
                const selectionSearchString = getSelectionSearchString(this._editor, opts.seedSearchStringFromSelection, opts.seedSearchStringFromNonEmptySelection);
                if (selectionSearchString) {
                    if (this._state.isRegex) {
                        stateChanges.searchString = strings.escapeRegExpCharacters(selectionSearchString);
                    }
                    else {
                        stateChanges.searchString = selectionSearchString;
                    }
                }
            }
            else if (opts.seedSearchStringFromSelection === 'multiple' && !opts.updateSearchScope) {
                const selectionSearchString = getSelectionSearchString(this._editor, opts.seedSearchStringFromSelection);
                if (selectionSearchString) {
                    stateChanges.searchString = selectionSearchString;
                }
            }
            if (!stateChanges.searchString && opts.seedSearchStringFromGlobalClipboard) {
                const selectionSearchString = await this.getGlobalBufferTerm();
                if (!this._editor.hasModel()) {
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
            else if (!this._findWidgetVisible.get()) {
                stateChanges.isReplaceRevealed = false;
            }
            if (opts.updateSearchScope) {
                const currentSelections = this._editor.getSelections();
                if (currentSelections.some(selection => !selection.isEmpty())) {
                    stateChanges.searchScope = currentSelections;
                }
            }
            stateChanges.loop = opts.loop;
            this._state.change(stateChanges, false);
            if (!this._model) {
                this._model = new findModel_1.FindModelBoundToEditorModel(this._editor, this._state);
            }
        }
        start(opts, newState) {
            return this._start(opts, newState);
        }
        moveToNextMatch() {
            if (this._model) {
                this._model.moveToNextMatch();
                return true;
            }
            return false;
        }
        moveToPrevMatch() {
            if (this._model) {
                this._model.moveToPrevMatch();
                return true;
            }
            return false;
        }
        goToMatch(index) {
            if (this._model) {
                this._model.moveToMatch(index);
                return true;
            }
            return false;
        }
        replace() {
            if (this._model) {
                this._model.replace();
                return true;
            }
            return false;
        }
        replaceAll() {
            if (this._model) {
                if (this._editor.getModel()?.isTooLargeForHeapOperation()) {
                    this._notificationService.warn(nls.localize('too.large.for.replaceall', "The file is too large to perform a replace all operation."));
                    return false;
                }
                this._model.replaceAll();
                return true;
            }
            return false;
        }
        selectAllMatches() {
            if (this._model) {
                this._model.selectAllMatches();
                this._editor.focus();
                return true;
            }
            return false;
        }
        async getGlobalBufferTerm() {
            if (this._editor.getOption(41 /* EditorOption.find */).globalFindClipboard
                && this._editor.hasModel()
                && !this._editor.getModel().isTooLargeForSyncing()) {
                return this._clipboardService.readFindText();
            }
            return '';
        }
        setGlobalBufferTerm(text) {
            if (this._editor.getOption(41 /* EditorOption.find */).globalFindClipboard
                && this._editor.hasModel()
                && !this._editor.getModel().isTooLargeForSyncing()) {
                // intentionally not awaited
                this._clipboardService.writeFindText(text);
            }
        }
    };
    exports.CommonFindController = CommonFindController;
    exports.CommonFindController = CommonFindController = CommonFindController_1 = __decorate([
        __param(1, contextkey_1.IContextKeyService),
        __param(2, storage_1.IStorageService),
        __param(3, clipboardService_1.IClipboardService),
        __param(4, notification_1.INotificationService)
    ], CommonFindController);
    let FindController = class FindController extends CommonFindController {
        constructor(editor, _contextViewService, _contextKeyService, _keybindingService, _themeService, notificationService, _storageService, clipboardService) {
            super(editor, _contextKeyService, _storageService, clipboardService, notificationService);
            this._contextViewService = _contextViewService;
            this._keybindingService = _keybindingService;
            this._themeService = _themeService;
            this._widget = null;
            this._findOptionsWidget = null;
        }
        async _start(opts, newState) {
            if (!this._widget) {
                this._createFindWidget();
            }
            const selection = this._editor.getSelection();
            let updateSearchScope = false;
            switch (this._editor.getOption(41 /* EditorOption.find */).autoFindInSelection) {
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
            await super._start(opts, newState);
            if (this._widget) {
                if (opts.shouldFocus === 2 /* FindStartFocusAction.FocusReplaceInput */) {
                    this._widget.focusReplaceInput();
                }
                else if (opts.shouldFocus === 1 /* FindStartFocusAction.FocusFindInput */) {
                    this._widget.focusFindInput();
                }
            }
        }
        highlightFindOptions(ignoreWhenVisible = false) {
            if (!this._widget) {
                this._createFindWidget();
            }
            if (this._state.isRevealed && !ignoreWhenVisible) {
                this._widget.highlightFindOptions();
            }
            else {
                this._findOptionsWidget.highlightFindOptions();
            }
        }
        _createFindWidget() {
            this._widget = this._register(new findWidget_1.FindWidget(this._editor, this, this._state, this._contextViewService, this._keybindingService, this._contextKeyService, this._themeService, this._storageService, this._notificationService));
            this._findOptionsWidget = this._register(new findOptionsWidget_1.FindOptionsWidget(this._editor, this._state, this._keybindingService));
        }
        saveViewState() {
            return this._widget?.getViewState();
        }
        restoreViewState(state) {
            this._widget?.setViewState(state);
        }
    };
    exports.FindController = FindController;
    exports.FindController = FindController = __decorate([
        __param(1, contextView_1.IContextViewService),
        __param(2, contextkey_1.IContextKeyService),
        __param(3, keybinding_1.IKeybindingService),
        __param(4, themeService_1.IThemeService),
        __param(5, notification_1.INotificationService),
        __param(6, storage_1.IStorageService),
        __param(7, clipboardService_1.IClipboardService)
    ], FindController);
    exports.StartFindAction = (0, editorExtensions_1.registerMultiEditorAction)(new editorExtensions_1.MultiEditorAction({
        id: findModel_1.FIND_IDS.StartFindAction,
        label: nls.localize('startFindAction', "Find"),
        alias: 'Find',
        precondition: contextkey_1.ContextKeyExpr.or(editorContextKeys_1.EditorContextKeys.focus, contextkey_1.ContextKeyExpr.has('editorIsOpen')),
        kbOpts: {
            kbExpr: null,
            primary: 2048 /* KeyMod.CtrlCmd */ | 36 /* KeyCode.KeyF */,
            weight: 100 /* KeybindingWeight.EditorContrib */
        },
        menuOpts: {
            menuId: actions_1.MenuId.MenubarEditMenu,
            group: '3_find',
            title: nls.localize({ key: 'miFind', comment: ['&& denotes a mnemonic'] }, "&&Find"),
            order: 1
        }
    }));
    exports.StartFindAction.addImplementation(0, (accessor, editor, args) => {
        const controller = CommonFindController.get(editor);
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
                            description: nls.localize('actions.find.isRegexOverride', 'Overrides "Use Regular Expression" flag.\nThe flag will not be saved for the future.\n0: Do Nothing\n1: True\n2: False')
                        },
                        wholeWord: { type: 'boolean' },
                        wholeWordOverride: {
                            type: 'number',
                            description: nls.localize('actions.find.wholeWordOverride', 'Overrides "Match Whole Word" flag.\nThe flag will not be saved for the future.\n0: Do Nothing\n1: True\n2: False')
                        },
                        matchCase: { type: 'boolean' },
                        matchCaseOverride: {
                            type: 'number',
                            description: nls.localize('actions.find.matchCaseOverride', 'Overrides "Math Case" flag.\nThe flag will not be saved for the future.\n0: Do Nothing\n1: True\n2: False')
                        },
                        preserveCase: { type: 'boolean' },
                        preserveCaseOverride: {
                            type: 'number',
                            description: nls.localize('actions.find.preserveCaseOverride', 'Overrides "Preserve Case" flag.\nThe flag will not be saved for the future.\n0: Do Nothing\n1: True\n2: False')
                        },
                        findInSelection: { type: 'boolean' },
                    }
                }
            }]
    };
    class StartFindWithArgsAction extends editorExtensions_1.EditorAction {
        constructor() {
            super({
                id: findModel_1.FIND_IDS.StartFindWithArgs,
                label: nls.localize('startFindWithArgsAction', "Find With Arguments"),
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
            const controller = CommonFindController.get(editor);
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
    exports.StartFindWithArgsAction = StartFindWithArgsAction;
    class StartFindWithSelectionAction extends editorExtensions_1.EditorAction {
        constructor() {
            super({
                id: findModel_1.FIND_IDS.StartFindWithSelection,
                label: nls.localize('startFindWithSelectionAction', "Find With Selection"),
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
            const controller = CommonFindController.get(editor);
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
    exports.StartFindWithSelectionAction = StartFindWithSelectionAction;
    class MatchFindAction extends editorExtensions_1.EditorAction {
        async run(accessor, editor) {
            const controller = CommonFindController.get(editor);
            if (controller && !this._run(controller)) {
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
                this._run(controller);
            }
        }
    }
    exports.MatchFindAction = MatchFindAction;
    class NextMatchFindAction extends MatchFindAction {
        constructor() {
            super({
                id: findModel_1.FIND_IDS.NextMatchFindAction,
                label: nls.localize('findNextMatchAction', "Find Next"),
                alias: 'Find Next',
                precondition: undefined,
                kbOpts: [{
                        kbExpr: editorContextKeys_1.EditorContextKeys.focus,
                        primary: 61 /* KeyCode.F3 */,
                        mac: { primary: 2048 /* KeyMod.CtrlCmd */ | 37 /* KeyCode.KeyG */, secondary: [61 /* KeyCode.F3 */] },
                        weight: 100 /* KeybindingWeight.EditorContrib */
                    }, {
                        kbExpr: contextkey_1.ContextKeyExpr.and(editorContextKeys_1.EditorContextKeys.focus, findModel_1.CONTEXT_FIND_INPUT_FOCUSED),
                        primary: 3 /* KeyCode.Enter */,
                        weight: 100 /* KeybindingWeight.EditorContrib */
                    }]
            });
        }
        _run(controller) {
            const result = controller.moveToNextMatch();
            if (result) {
                controller.editor.pushUndoStop();
                return true;
            }
            return false;
        }
    }
    exports.NextMatchFindAction = NextMatchFindAction;
    class PreviousMatchFindAction extends MatchFindAction {
        constructor() {
            super({
                id: findModel_1.FIND_IDS.PreviousMatchFindAction,
                label: nls.localize('findPreviousMatchAction', "Find Previous"),
                alias: 'Find Previous',
                precondition: undefined,
                kbOpts: [{
                        kbExpr: editorContextKeys_1.EditorContextKeys.focus,
                        primary: 1024 /* KeyMod.Shift */ | 61 /* KeyCode.F3 */,
                        mac: { primary: 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 37 /* KeyCode.KeyG */, secondary: [1024 /* KeyMod.Shift */ | 61 /* KeyCode.F3 */] },
                        weight: 100 /* KeybindingWeight.EditorContrib */
                    }, {
                        kbExpr: contextkey_1.ContextKeyExpr.and(editorContextKeys_1.EditorContextKeys.focus, findModel_1.CONTEXT_FIND_INPUT_FOCUSED),
                        primary: 1024 /* KeyMod.Shift */ | 3 /* KeyCode.Enter */,
                        weight: 100 /* KeybindingWeight.EditorContrib */
                    }
                ]
            });
        }
        _run(controller) {
            return controller.moveToPrevMatch();
        }
    }
    exports.PreviousMatchFindAction = PreviousMatchFindAction;
    class MoveToMatchFindAction extends editorExtensions_1.EditorAction {
        constructor() {
            super({
                id: findModel_1.FIND_IDS.GoToMatchFindAction,
                label: nls.localize('findMatchAction.goToMatch', "Go to Match..."),
                alias: 'Go to Match...',
                precondition: findModel_1.CONTEXT_FIND_WIDGET_VISIBLE
            });
            this._highlightDecorations = [];
        }
        run(accessor, editor, args) {
            const controller = CommonFindController.get(editor);
            if (!controller) {
                return;
            }
            const matchesCount = controller.getState().matchesCount;
            if (matchesCount < 1) {
                const notificationService = accessor.get(notification_1.INotificationService);
                notificationService.notify({
                    severity: notification_1.Severity.Warning,
                    message: nls.localize('findMatchAction.noResults', "No matches. Try searching for something else.")
                });
                return;
            }
            const quickInputService = accessor.get(quickInput_1.IQuickInputService);
            const inputBox = quickInputService.createInputBox();
            inputBox.placeholder = nls.localize('findMatchAction.inputPlaceHolder', "Type a number to go to a specific match (between 1 and {0})", matchesCount);
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
                        this.addDecorations(editor, currentMatch);
                    }
                }
                else {
                    inputBox.validationMessage = nls.localize('findMatchAction.inputValidationMessage', "Please type a number between 1 and {0}", controller.getState().matchesCount);
                    this.clearDecorations(editor);
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
                    inputBox.validationMessage = nls.localize('findMatchAction.inputValidationMessage', "Please type a number between 1 and {0}", controller.getState().matchesCount);
                }
            });
            inputBox.onDidHide(() => {
                this.clearDecorations(editor);
                inputBox.dispose();
            });
            inputBox.show();
        }
        clearDecorations(editor) {
            editor.changeDecorations(changeAccessor => {
                this._highlightDecorations = changeAccessor.deltaDecorations(this._highlightDecorations, []);
            });
        }
        addDecorations(editor, range) {
            editor.changeDecorations(changeAccessor => {
                this._highlightDecorations = changeAccessor.deltaDecorations(this._highlightDecorations, [
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
                                color: (0, themeService_1.themeColorFromId)(editorColorRegistry_1.overviewRulerRangeHighlight),
                                position: model_1.OverviewRulerLane.Full
                            }
                        }
                    }
                ]);
            });
        }
    }
    exports.MoveToMatchFindAction = MoveToMatchFindAction;
    class SelectionMatchFindAction extends editorExtensions_1.EditorAction {
        async run(accessor, editor) {
            const controller = CommonFindController.get(editor);
            if (!controller) {
                return;
            }
            const selectionSearchString = getSelectionSearchString(editor, 'single', false);
            if (selectionSearchString) {
                controller.setSearchString(selectionSearchString);
            }
            if (!this._run(controller)) {
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
                this._run(controller);
            }
        }
    }
    exports.SelectionMatchFindAction = SelectionMatchFindAction;
    class NextSelectionMatchFindAction extends SelectionMatchFindAction {
        constructor() {
            super({
                id: findModel_1.FIND_IDS.NextSelectionMatchFindAction,
                label: nls.localize('nextSelectionMatchFindAction', "Find Next Selection"),
                alias: 'Find Next Selection',
                precondition: undefined,
                kbOpts: {
                    kbExpr: editorContextKeys_1.EditorContextKeys.focus,
                    primary: 2048 /* KeyMod.CtrlCmd */ | 61 /* KeyCode.F3 */,
                    weight: 100 /* KeybindingWeight.EditorContrib */
                }
            });
        }
        _run(controller) {
            return controller.moveToNextMatch();
        }
    }
    exports.NextSelectionMatchFindAction = NextSelectionMatchFindAction;
    class PreviousSelectionMatchFindAction extends SelectionMatchFindAction {
        constructor() {
            super({
                id: findModel_1.FIND_IDS.PreviousSelectionMatchFindAction,
                label: nls.localize('previousSelectionMatchFindAction', "Find Previous Selection"),
                alias: 'Find Previous Selection',
                precondition: undefined,
                kbOpts: {
                    kbExpr: editorContextKeys_1.EditorContextKeys.focus,
                    primary: 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 61 /* KeyCode.F3 */,
                    weight: 100 /* KeybindingWeight.EditorContrib */
                }
            });
        }
        _run(controller) {
            return controller.moveToPrevMatch();
        }
    }
    exports.PreviousSelectionMatchFindAction = PreviousSelectionMatchFindAction;
    exports.StartFindReplaceAction = (0, editorExtensions_1.registerMultiEditorAction)(new editorExtensions_1.MultiEditorAction({
        id: findModel_1.FIND_IDS.StartFindReplaceAction,
        label: nls.localize('startReplace', "Replace"),
        alias: 'Replace',
        precondition: contextkey_1.ContextKeyExpr.or(editorContextKeys_1.EditorContextKeys.focus, contextkey_1.ContextKeyExpr.has('editorIsOpen')),
        kbOpts: {
            kbExpr: null,
            primary: 2048 /* KeyMod.CtrlCmd */ | 38 /* KeyCode.KeyH */,
            mac: { primary: 2048 /* KeyMod.CtrlCmd */ | 512 /* KeyMod.Alt */ | 36 /* KeyCode.KeyF */ },
            weight: 100 /* KeybindingWeight.EditorContrib */
        },
        menuOpts: {
            menuId: actions_1.MenuId.MenubarEditMenu,
            group: '3_find',
            title: nls.localize({ key: 'miReplace', comment: ['&& denotes a mnemonic'] }, "&&Replace"),
            order: 2
        }
    }));
    exports.StartFindReplaceAction.addImplementation(0, (accessor, editor, args) => {
        if (!editor.hasModel() || editor.getOption(90 /* EditorOption.readOnly */)) {
            return false;
        }
        const controller = CommonFindController.get(editor);
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
    (0, editorExtensions_1.registerEditorContribution)(CommonFindController.ID, FindController, 0 /* EditorContributionInstantiation.Eager */); // eager because it uses `saveViewState`/`restoreViewState`
    (0, editorExtensions_1.registerEditorAction)(StartFindWithArgsAction);
    (0, editorExtensions_1.registerEditorAction)(StartFindWithSelectionAction);
    (0, editorExtensions_1.registerEditorAction)(NextMatchFindAction);
    (0, editorExtensions_1.registerEditorAction)(PreviousMatchFindAction);
    (0, editorExtensions_1.registerEditorAction)(MoveToMatchFindAction);
    (0, editorExtensions_1.registerEditorAction)(NextSelectionMatchFindAction);
    (0, editorExtensions_1.registerEditorAction)(PreviousSelectionMatchFindAction);
    const FindCommand = editorExtensions_1.EditorCommand.bindToContribution(CommonFindController.get);
    (0, editorExtensions_1.registerEditorCommand)(new FindCommand({
        id: findModel_1.FIND_IDS.CloseFindWidgetCommand,
        precondition: findModel_1.CONTEXT_FIND_WIDGET_VISIBLE,
        handler: x => x.closeFindWidget(),
        kbOpts: {
            weight: 100 /* KeybindingWeight.EditorContrib */ + 5,
            kbExpr: contextkey_1.ContextKeyExpr.and(editorContextKeys_1.EditorContextKeys.focus, contextkey_1.ContextKeyExpr.not('isComposing')),
            primary: 9 /* KeyCode.Escape */,
            secondary: [1024 /* KeyMod.Shift */ | 9 /* KeyCode.Escape */]
        }
    }));
    (0, editorExtensions_1.registerEditorCommand)(new FindCommand({
        id: findModel_1.FIND_IDS.ToggleCaseSensitiveCommand,
        precondition: undefined,
        handler: x => x.toggleCaseSensitive(),
        kbOpts: {
            weight: 100 /* KeybindingWeight.EditorContrib */ + 5,
            kbExpr: editorContextKeys_1.EditorContextKeys.focus,
            primary: findModel_1.ToggleCaseSensitiveKeybinding.primary,
            mac: findModel_1.ToggleCaseSensitiveKeybinding.mac,
            win: findModel_1.ToggleCaseSensitiveKeybinding.win,
            linux: findModel_1.ToggleCaseSensitiveKeybinding.linux
        }
    }));
    (0, editorExtensions_1.registerEditorCommand)(new FindCommand({
        id: findModel_1.FIND_IDS.ToggleWholeWordCommand,
        precondition: undefined,
        handler: x => x.toggleWholeWords(),
        kbOpts: {
            weight: 100 /* KeybindingWeight.EditorContrib */ + 5,
            kbExpr: editorContextKeys_1.EditorContextKeys.focus,
            primary: findModel_1.ToggleWholeWordKeybinding.primary,
            mac: findModel_1.ToggleWholeWordKeybinding.mac,
            win: findModel_1.ToggleWholeWordKeybinding.win,
            linux: findModel_1.ToggleWholeWordKeybinding.linux
        }
    }));
    (0, editorExtensions_1.registerEditorCommand)(new FindCommand({
        id: findModel_1.FIND_IDS.ToggleRegexCommand,
        precondition: undefined,
        handler: x => x.toggleRegex(),
        kbOpts: {
            weight: 100 /* KeybindingWeight.EditorContrib */ + 5,
            kbExpr: editorContextKeys_1.EditorContextKeys.focus,
            primary: findModel_1.ToggleRegexKeybinding.primary,
            mac: findModel_1.ToggleRegexKeybinding.mac,
            win: findModel_1.ToggleRegexKeybinding.win,
            linux: findModel_1.ToggleRegexKeybinding.linux
        }
    }));
    (0, editorExtensions_1.registerEditorCommand)(new FindCommand({
        id: findModel_1.FIND_IDS.ToggleSearchScopeCommand,
        precondition: undefined,
        handler: x => x.toggleSearchScope(),
        kbOpts: {
            weight: 100 /* KeybindingWeight.EditorContrib */ + 5,
            kbExpr: editorContextKeys_1.EditorContextKeys.focus,
            primary: findModel_1.ToggleSearchScopeKeybinding.primary,
            mac: findModel_1.ToggleSearchScopeKeybinding.mac,
            win: findModel_1.ToggleSearchScopeKeybinding.win,
            linux: findModel_1.ToggleSearchScopeKeybinding.linux
        }
    }));
    (0, editorExtensions_1.registerEditorCommand)(new FindCommand({
        id: findModel_1.FIND_IDS.TogglePreserveCaseCommand,
        precondition: undefined,
        handler: x => x.togglePreserveCase(),
        kbOpts: {
            weight: 100 /* KeybindingWeight.EditorContrib */ + 5,
            kbExpr: editorContextKeys_1.EditorContextKeys.focus,
            primary: findModel_1.TogglePreserveCaseKeybinding.primary,
            mac: findModel_1.TogglePreserveCaseKeybinding.mac,
            win: findModel_1.TogglePreserveCaseKeybinding.win,
            linux: findModel_1.TogglePreserveCaseKeybinding.linux
        }
    }));
    (0, editorExtensions_1.registerEditorCommand)(new FindCommand({
        id: findModel_1.FIND_IDS.ReplaceOneAction,
        precondition: findModel_1.CONTEXT_FIND_WIDGET_VISIBLE,
        handler: x => x.replace(),
        kbOpts: {
            weight: 100 /* KeybindingWeight.EditorContrib */ + 5,
            kbExpr: editorContextKeys_1.EditorContextKeys.focus,
            primary: 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 22 /* KeyCode.Digit1 */
        }
    }));
    (0, editorExtensions_1.registerEditorCommand)(new FindCommand({
        id: findModel_1.FIND_IDS.ReplaceOneAction,
        precondition: findModel_1.CONTEXT_FIND_WIDGET_VISIBLE,
        handler: x => x.replace(),
        kbOpts: {
            weight: 100 /* KeybindingWeight.EditorContrib */ + 5,
            kbExpr: contextkey_1.ContextKeyExpr.and(editorContextKeys_1.EditorContextKeys.focus, findModel_1.CONTEXT_REPLACE_INPUT_FOCUSED),
            primary: 3 /* KeyCode.Enter */
        }
    }));
    (0, editorExtensions_1.registerEditorCommand)(new FindCommand({
        id: findModel_1.FIND_IDS.ReplaceAllAction,
        precondition: findModel_1.CONTEXT_FIND_WIDGET_VISIBLE,
        handler: x => x.replaceAll(),
        kbOpts: {
            weight: 100 /* KeybindingWeight.EditorContrib */ + 5,
            kbExpr: editorContextKeys_1.EditorContextKeys.focus,
            primary: 2048 /* KeyMod.CtrlCmd */ | 512 /* KeyMod.Alt */ | 3 /* KeyCode.Enter */
        }
    }));
    (0, editorExtensions_1.registerEditorCommand)(new FindCommand({
        id: findModel_1.FIND_IDS.ReplaceAllAction,
        precondition: findModel_1.CONTEXT_FIND_WIDGET_VISIBLE,
        handler: x => x.replaceAll(),
        kbOpts: {
            weight: 100 /* KeybindingWeight.EditorContrib */ + 5,
            kbExpr: contextkey_1.ContextKeyExpr.and(editorContextKeys_1.EditorContextKeys.focus, findModel_1.CONTEXT_REPLACE_INPUT_FOCUSED),
            primary: undefined,
            mac: {
                primary: 2048 /* KeyMod.CtrlCmd */ | 3 /* KeyCode.Enter */,
            }
        }
    }));
    (0, editorExtensions_1.registerEditorCommand)(new FindCommand({
        id: findModel_1.FIND_IDS.SelectAllMatchesAction,
        precondition: findModel_1.CONTEXT_FIND_WIDGET_VISIBLE,
        handler: x => x.selectAllMatches(),
        kbOpts: {
            weight: 100 /* KeybindingWeight.EditorContrib */ + 5,
            kbExpr: editorContextKeys_1.EditorContextKeys.focus,
            primary: 512 /* KeyMod.Alt */ | 3 /* KeyCode.Enter */
        }
    }));
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmluZENvbnRyb2xsZXIuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9lZGl0b3IvY29udHJpYi9maW5kL2Jyb3dzZXIvZmluZENvbnRyb2xsZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7OztJQThCaEcsTUFBTSx3QkFBd0IsR0FBRyxNQUFNLENBQUM7SUFFeEMsU0FBZ0Isd0JBQXdCLENBQUMsTUFBbUIsRUFBRSxnQ0FBdUQsUUFBUSxFQUFFLHdDQUFpRCxLQUFLO1FBQ3BMLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxFQUFFLEVBQUU7WUFDdkIsT0FBTyxJQUFJLENBQUM7U0FDWjtRQUVELE1BQU0sU0FBUyxHQUFHLE1BQU0sQ0FBQyxZQUFZLEVBQUUsQ0FBQztRQUN4QyxvRUFBb0U7UUFFcEUsSUFBSSxDQUFDLDZCQUE2QixLQUFLLFFBQVEsSUFBSSxTQUFTLENBQUMsZUFBZSxLQUFLLFNBQVMsQ0FBQyxhQUFhLENBQUM7ZUFDckcsNkJBQTZCLEtBQUssVUFBVSxFQUFFO1lBQ2pELElBQUksU0FBUyxDQUFDLE9BQU8sRUFBRSxFQUFFO2dCQUN4QixNQUFNLGNBQWMsR0FBRyxNQUFNLENBQUMsMkJBQTJCLENBQUMsU0FBUyxDQUFDLGdCQUFnQixFQUFFLENBQUMsQ0FBQztnQkFDeEYsSUFBSSxjQUFjLElBQUksQ0FBQyxLQUFLLEtBQUsscUNBQXFDLENBQUMsRUFBRTtvQkFDeEUsT0FBTyxjQUFjLENBQUMsSUFBSSxDQUFDO2lCQUMzQjthQUNEO2lCQUFNO2dCQUNOLElBQUksTUFBTSxDQUFDLFFBQVEsRUFBRSxDQUFDLHFCQUFxQixDQUFDLFNBQVMsQ0FBQyxHQUFHLHdCQUF3QixFQUFFO29CQUNsRixPQUFPLE1BQU0sQ0FBQyxRQUFRLEVBQUUsQ0FBQyxlQUFlLENBQUMsU0FBUyxDQUFDLENBQUM7aUJBQ3BEO2FBQ0Q7U0FDRDtRQUVELE9BQU8sSUFBSSxDQUFDO0lBQ2IsQ0FBQztJQXZCRCw0REF1QkM7SUFFRCxJQUFrQixvQkFJakI7SUFKRCxXQUFrQixvQkFBb0I7UUFDckMsaUZBQWEsQ0FBQTtRQUNiLG1GQUFjLENBQUE7UUFDZCx5RkFBaUIsQ0FBQTtJQUNsQixDQUFDLEVBSmlCLG9CQUFvQixvQ0FBcEIsb0JBQW9CLFFBSXJDO0lBdUJNLElBQU0sb0JBQW9CLEdBQTFCLE1BQU0sb0JBQXFCLFNBQVEsc0JBQVU7O2lCQUU1QixPQUFFLEdBQUcsK0JBQStCLEFBQWxDLENBQW1DO1FBWTVELElBQUksTUFBTTtZQUNULE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQztRQUNyQixDQUFDO1FBRU0sTUFBTSxDQUFDLEdBQUcsQ0FBQyxNQUFtQjtZQUNwQyxPQUFPLE1BQU0sQ0FBQyxlQUFlLENBQXVCLHNCQUFvQixDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQzlFLENBQUM7UUFFRCxZQUNDLE1BQW1CLEVBQ0MsaUJBQXFDLEVBQ3hDLGNBQStCLEVBQzdCLGdCQUFtQyxFQUNoQyxtQkFBeUM7WUFFL0QsS0FBSyxFQUFFLENBQUM7WUFDUixJQUFJLENBQUMsT0FBTyxHQUFHLE1BQU0sQ0FBQztZQUN0QixJQUFJLENBQUMsa0JBQWtCLEdBQUcsdUNBQTJCLENBQUMsTUFBTSxDQUFDLGlCQUFpQixDQUFDLENBQUM7WUFDaEYsSUFBSSxDQUFDLGtCQUFrQixHQUFHLGlCQUFpQixDQUFDO1lBQzVDLElBQUksQ0FBQyxlQUFlLEdBQUcsY0FBYyxDQUFDO1lBQ3RDLElBQUksQ0FBQyxpQkFBaUIsR0FBRyxnQkFBZ0IsQ0FBQztZQUMxQyxJQUFJLENBQUMsb0JBQW9CLEdBQUcsbUJBQW1CLENBQUM7WUFFaEQsSUFBSSxDQUFDLHFCQUFxQixHQUFHLElBQUksZUFBTyxDQUFPLEdBQUcsQ0FBQyxDQUFDO1lBQ3BELElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLDRCQUFnQixFQUFFLENBQUMsQ0FBQztZQUNyRCxJQUFJLENBQUMsY0FBYyxFQUFFLENBQUM7WUFDdEIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLHdCQUF3QixDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUVyRixJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQztZQUVuQixJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsZ0JBQWdCLENBQUMsR0FBRyxFQUFFO2dCQUNqRCxNQUFNLGlCQUFpQixHQUFHLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLEVBQUUsSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxDQUFDO2dCQUU5RSxJQUFJLENBQUMsWUFBWSxFQUFFLENBQUM7Z0JBRXBCLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDO29CQUNsQixXQUFXLEVBQUUsSUFBSTtvQkFDakIsU0FBUyxFQUFFLElBQUksQ0FBQyxlQUFlLENBQUMsVUFBVSxDQUFDLGtCQUFrQixrQ0FBMEIsS0FBSyxDQUFDO29CQUM3RixTQUFTLEVBQUUsSUFBSSxDQUFDLGVBQWUsQ0FBQyxVQUFVLENBQUMsa0JBQWtCLGtDQUEwQixLQUFLLENBQUM7b0JBQzdGLE9BQU8sRUFBRSxJQUFJLENBQUMsZUFBZSxDQUFDLFVBQVUsQ0FBQyxnQkFBZ0Isa0NBQTBCLEtBQUssQ0FBQztvQkFDekYsWUFBWSxFQUFFLElBQUksQ0FBQyxlQUFlLENBQUMsVUFBVSxDQUFDLHFCQUFxQixrQ0FBMEIsS0FBSyxDQUFDO2lCQUNuRyxFQUFFLEtBQUssQ0FBQyxDQUFDO2dCQUVWLElBQUksaUJBQWlCLEVBQUU7b0JBQ3RCLElBQUksQ0FBQyxNQUFNLENBQUM7d0JBQ1gsa0JBQWtCLEVBQUUsS0FBSzt3QkFDekIsNkJBQTZCLEVBQUUsTUFBTTt3QkFDckMscUNBQXFDLEVBQUUsS0FBSzt3QkFDNUMsbUNBQW1DLEVBQUUsS0FBSzt3QkFDMUMsV0FBVyw0Q0FBb0M7d0JBQy9DLGFBQWEsRUFBRSxLQUFLO3dCQUNwQixpQkFBaUIsRUFBRSxLQUFLO3dCQUN4QixJQUFJLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxTQUFTLDRCQUFtQixDQUFDLElBQUk7cUJBQ3BELENBQUMsQ0FBQztpQkFDSDtZQUNGLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDTCxDQUFDO1FBRWUsT0FBTztZQUN0QixJQUFJLENBQUMsWUFBWSxFQUFFLENBQUM7WUFDcEIsS0FBSyxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBQ2pCLENBQUM7UUFFTyxZQUFZO1lBQ25CLElBQUksSUFBSSxDQUFDLE1BQU0sRUFBRTtnQkFDaEIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLEVBQUUsQ0FBQztnQkFDdEIsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUM7YUFDbkI7UUFDRixDQUFDO1FBRU8sZUFBZSxDQUFDLENBQStCO1lBQ3RELElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFFdkIsSUFBSSxDQUFDLENBQUMsVUFBVSxFQUFFO2dCQUNqQixJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsVUFBVSxFQUFFO29CQUMzQixJQUFJLENBQUMsa0JBQWtCLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO2lCQUNsQztxQkFBTTtvQkFDTixJQUFJLENBQUMsa0JBQWtCLENBQUMsS0FBSyxFQUFFLENBQUM7b0JBQ2hDLElBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQztpQkFDcEI7YUFDRDtZQUNELElBQUksQ0FBQyxDQUFDLFlBQVksRUFBRTtnQkFDbkIsSUFBSSxDQUFDLG1CQUFtQixDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsWUFBWSxDQUFDLENBQUM7YUFDbkQ7UUFDRixDQUFDO1FBRU8sY0FBYyxDQUFDLENBQStCO1lBQ3JELElBQUksQ0FBQyxDQUFDLE9BQU8sRUFBRTtnQkFDZCxJQUFJLENBQUMsZUFBZSxDQUFDLEtBQUssQ0FBQyxnQkFBZ0IsRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLGFBQWEsZ0VBQWdELENBQUM7YUFDdkg7WUFDRCxJQUFJLENBQUMsQ0FBQyxTQUFTLEVBQUU7Z0JBQ2hCLElBQUksQ0FBQyxlQUFlLENBQUMsS0FBSyxDQUFDLGtCQUFrQixFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsZUFBZSxnRUFBZ0QsQ0FBQzthQUMzSDtZQUNELElBQUksQ0FBQyxDQUFDLFNBQVMsRUFBRTtnQkFDaEIsSUFBSSxDQUFDLGVBQWUsQ0FBQyxLQUFLLENBQUMsa0JBQWtCLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxlQUFlLGdFQUFnRCxDQUFDO2FBQzNIO1lBQ0QsSUFBSSxDQUFDLENBQUMsWUFBWSxFQUFFO2dCQUNuQixJQUFJLENBQUMsZUFBZSxDQUFDLEtBQUssQ0FBQyxxQkFBcUIsRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLGtCQUFrQixnRUFBZ0QsQ0FBQzthQUNqSTtRQUNGLENBQUM7UUFFTyxjQUFjO1lBQ3JCLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDO2dCQUNsQixTQUFTLEVBQUUsSUFBSSxDQUFDLGVBQWUsQ0FBQyxVQUFVLENBQUMsa0JBQWtCLGtDQUEwQixJQUFJLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQztnQkFDN0csU0FBUyxFQUFFLElBQUksQ0FBQyxlQUFlLENBQUMsVUFBVSxDQUFDLGtCQUFrQixrQ0FBMEIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUM7Z0JBQzdHLE9BQU8sRUFBRSxJQUFJLENBQUMsZUFBZSxDQUFDLFVBQVUsQ0FBQyxnQkFBZ0Isa0NBQTBCLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDO2dCQUN2RyxZQUFZLEVBQUUsSUFBSSxDQUFDLGVBQWUsQ0FBQyxVQUFVLENBQUMscUJBQXFCLGtDQUEwQixJQUFJLENBQUMsTUFBTSxDQUFDLFlBQVksQ0FBQzthQUN0SCxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQ1gsQ0FBQztRQUVNLGtCQUFrQjtZQUN4QixPQUFPLENBQUMsQ0FBQyxzQ0FBMEIsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLENBQUM7UUFDdkUsQ0FBQztRQUVNLFFBQVE7WUFDZCxPQUFPLElBQUksQ0FBQyxNQUFNLENBQUM7UUFDcEIsQ0FBQztRQUVNLGVBQWU7WUFDckIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUM7Z0JBQ2xCLFVBQVUsRUFBRSxLQUFLO2dCQUNqQixXQUFXLEVBQUUsSUFBSTthQUNqQixFQUFFLEtBQUssQ0FBQyxDQUFDO1lBQ1YsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUN0QixDQUFDO1FBRU0sbUJBQW1CO1lBQ3pCLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLEVBQUUsU0FBUyxFQUFFLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxTQUFTLEVBQUUsRUFBRSxLQUFLLENBQUMsQ0FBQztZQUNqRSxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxVQUFVLEVBQUU7Z0JBQzVCLElBQUksQ0FBQyxvQkFBb0IsRUFBRSxDQUFDO2FBQzVCO1FBQ0YsQ0FBQztRQUVNLGdCQUFnQjtZQUN0QixJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxFQUFFLFNBQVMsRUFBRSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsU0FBUyxFQUFFLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFDakUsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsVUFBVSxFQUFFO2dCQUM1QixJQUFJLENBQUMsb0JBQW9CLEVBQUUsQ0FBQzthQUM1QjtRQUNGLENBQUM7UUFFTSxXQUFXO1lBQ2pCLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLEVBQUUsT0FBTyxFQUFFLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLEVBQUUsRUFBRSxLQUFLLENBQUMsQ0FBQztZQUM3RCxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxVQUFVLEVBQUU7Z0JBQzVCLElBQUksQ0FBQyxvQkFBb0IsRUFBRSxDQUFDO2FBQzVCO1FBQ0YsQ0FBQztRQUVNLGtCQUFrQjtZQUN4QixJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxFQUFFLFlBQVksRUFBRSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsWUFBWSxFQUFFLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFDdkUsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsVUFBVSxFQUFFO2dCQUM1QixJQUFJLENBQUMsb0JBQW9CLEVBQUUsQ0FBQzthQUM1QjtRQUNGLENBQUM7UUFFTSxpQkFBaUI7WUFDdkIsSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLFdBQVcsRUFBRTtnQkFDNUIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsRUFBRSxXQUFXLEVBQUUsSUFBSSxFQUFFLEVBQUUsSUFBSSxDQUFDLENBQUM7YUFDaEQ7aUJBQU07Z0JBQ04sSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsRUFBRSxFQUFFO29CQUM1QixNQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLGFBQWEsRUFBRSxDQUFDO29CQUNoRCxVQUFVLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxFQUFFO3dCQUMxQixJQUFJLFNBQVMsQ0FBQyxTQUFTLEtBQUssQ0FBQyxJQUFJLFNBQVMsQ0FBQyxhQUFhLEdBQUcsU0FBUyxDQUFDLGVBQWUsRUFBRTs0QkFDckYsU0FBUyxHQUFHLFNBQVMsQ0FBQyxjQUFjLENBQ25DLFNBQVMsQ0FBQyxhQUFhLEdBQUcsQ0FBQyxFQUMzQixJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsRUFBRyxDQUFDLGdCQUFnQixDQUFDLFNBQVMsQ0FBQyxhQUFhLEdBQUcsQ0FBQyxDQUFDLENBQ3RFLENBQUM7eUJBQ0Y7d0JBQ0QsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLEVBQUUsRUFBRTs0QkFDekIsT0FBTyxTQUFTLENBQUM7eUJBQ2pCO3dCQUNELE9BQU8sSUFBSSxDQUFDO29CQUNiLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQztvQkFFaEMsSUFBSSxVQUFVLENBQUMsTUFBTSxFQUFFO3dCQUN0QixJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxFQUFFLFdBQVcsRUFBRSxVQUFVLEVBQUUsRUFBRSxJQUFJLENBQUMsQ0FBQztxQkFDdEQ7aUJBQ0Q7YUFDRDtRQUNGLENBQUM7UUFFTSxlQUFlLENBQUMsWUFBb0I7WUFDMUMsSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sRUFBRTtnQkFDeEIsWUFBWSxHQUFHLE9BQU8sQ0FBQyxzQkFBc0IsQ0FBQyxZQUFZLENBQUMsQ0FBQzthQUM1RDtZQUNELElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLEVBQUUsWUFBWSxFQUFFLFlBQVksRUFBRSxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQzNELENBQUM7UUFFTSxvQkFBb0IsQ0FBQyxvQkFBNkIsS0FBSztZQUM3RCwwQkFBMEI7UUFDM0IsQ0FBQztRQUVTLEtBQUssQ0FBQyxNQUFNLENBQUMsSUFBdUIsRUFBRSxRQUErQjtZQUM5RSxJQUFJLENBQUMsWUFBWSxFQUFFLENBQUM7WUFFcEIsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxFQUFFLEVBQUU7Z0JBQzdCLGlFQUFpRTtnQkFDakUsT0FBTzthQUNQO1lBRUQsTUFBTSxZQUFZLEdBQXlCO2dCQUMxQyxHQUFHLFFBQVE7Z0JBQ1gsVUFBVSxFQUFFLElBQUk7YUFDaEIsQ0FBQztZQUVGLElBQUksSUFBSSxDQUFDLDZCQUE2QixLQUFLLFFBQVEsRUFBRTtnQkFDcEQsTUFBTSxxQkFBcUIsR0FBRyx3QkFBd0IsQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyw2QkFBNkIsRUFBRSxJQUFJLENBQUMscUNBQXFDLENBQUMsQ0FBQztnQkFDckosSUFBSSxxQkFBcUIsRUFBRTtvQkFDMUIsSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sRUFBRTt3QkFDeEIsWUFBWSxDQUFDLFlBQVksR0FBRyxPQUFPLENBQUMsc0JBQXNCLENBQUMscUJBQXFCLENBQUMsQ0FBQztxQkFDbEY7eUJBQU07d0JBQ04sWUFBWSxDQUFDLFlBQVksR0FBRyxxQkFBcUIsQ0FBQztxQkFDbEQ7aUJBQ0Q7YUFDRDtpQkFBTSxJQUFJLElBQUksQ0FBQyw2QkFBNkIsS0FBSyxVQUFVLElBQUksQ0FBQyxJQUFJLENBQUMsaUJBQWlCLEVBQUU7Z0JBQ3hGLE1BQU0scUJBQXFCLEdBQUcsd0JBQXdCLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsNkJBQTZCLENBQUMsQ0FBQztnQkFDekcsSUFBSSxxQkFBcUIsRUFBRTtvQkFDMUIsWUFBWSxDQUFDLFlBQVksR0FBRyxxQkFBcUIsQ0FBQztpQkFDbEQ7YUFDRDtZQUVELElBQUksQ0FBQyxZQUFZLENBQUMsWUFBWSxJQUFJLElBQUksQ0FBQyxtQ0FBbUMsRUFBRTtnQkFDM0UsTUFBTSxxQkFBcUIsR0FBRyxNQUFNLElBQUksQ0FBQyxtQkFBbUIsRUFBRSxDQUFDO2dCQUUvRCxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLEVBQUUsRUFBRTtvQkFDN0IsZ0RBQWdEO29CQUNoRCxPQUFPO2lCQUNQO2dCQUVELElBQUkscUJBQXFCLEVBQUU7b0JBQzFCLFlBQVksQ0FBQyxZQUFZLEdBQUcscUJBQXFCLENBQUM7aUJBQ2xEO2FBQ0Q7WUFFRCw4QkFBOEI7WUFDOUIsSUFBSSxJQUFJLENBQUMsa0JBQWtCLElBQUksWUFBWSxDQUFDLGlCQUFpQixFQUFFO2dCQUM5RCxZQUFZLENBQUMsaUJBQWlCLEdBQUcsSUFBSSxDQUFDO2FBQ3RDO2lCQUFNLElBQUksQ0FBQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsR0FBRyxFQUFFLEVBQUU7Z0JBQzFDLFlBQVksQ0FBQyxpQkFBaUIsR0FBRyxLQUFLLENBQUM7YUFDdkM7WUFFRCxJQUFJLElBQUksQ0FBQyxpQkFBaUIsRUFBRTtnQkFDM0IsTUFBTSxpQkFBaUIsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLGFBQWEsRUFBRSxDQUFDO2dCQUN2RCxJQUFJLGlCQUFpQixDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsRUFBRSxDQUFDLENBQUMsU0FBUyxDQUFDLE9BQU8sRUFBRSxDQUFDLEVBQUU7b0JBQzlELFlBQVksQ0FBQyxXQUFXLEdBQUcsaUJBQWlCLENBQUM7aUJBQzdDO2FBQ0Q7WUFFRCxZQUFZLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUM7WUFFOUIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsWUFBWSxFQUFFLEtBQUssQ0FBQyxDQUFDO1lBRXhDLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFO2dCQUNqQixJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksdUNBQTJCLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7YUFDekU7UUFDRixDQUFDO1FBRU0sS0FBSyxDQUFDLElBQXVCLEVBQUUsUUFBK0I7WUFDcEUsT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxRQUFRLENBQUMsQ0FBQztRQUNwQyxDQUFDO1FBRU0sZUFBZTtZQUNyQixJQUFJLElBQUksQ0FBQyxNQUFNLEVBQUU7Z0JBQ2hCLElBQUksQ0FBQyxNQUFNLENBQUMsZUFBZSxFQUFFLENBQUM7Z0JBQzlCLE9BQU8sSUFBSSxDQUFDO2FBQ1o7WUFDRCxPQUFPLEtBQUssQ0FBQztRQUNkLENBQUM7UUFFTSxlQUFlO1lBQ3JCLElBQUksSUFBSSxDQUFDLE1BQU0sRUFBRTtnQkFDaEIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxlQUFlLEVBQUUsQ0FBQztnQkFDOUIsT0FBTyxJQUFJLENBQUM7YUFDWjtZQUNELE9BQU8sS0FBSyxDQUFDO1FBQ2QsQ0FBQztRQUVNLFNBQVMsQ0FBQyxLQUFhO1lBQzdCLElBQUksSUFBSSxDQUFDLE1BQU0sRUFBRTtnQkFDaEIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLENBQUM7Z0JBQy9CLE9BQU8sSUFBSSxDQUFDO2FBQ1o7WUFDRCxPQUFPLEtBQUssQ0FBQztRQUNkLENBQUM7UUFFTSxPQUFPO1lBQ2IsSUFBSSxJQUFJLENBQUMsTUFBTSxFQUFFO2dCQUNoQixJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sRUFBRSxDQUFDO2dCQUN0QixPQUFPLElBQUksQ0FBQzthQUNaO1lBQ0QsT0FBTyxLQUFLLENBQUM7UUFDZCxDQUFDO1FBRU0sVUFBVTtZQUNoQixJQUFJLElBQUksQ0FBQyxNQUFNLEVBQUU7Z0JBQ2hCLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLEVBQUUsRUFBRSwwQkFBMEIsRUFBRSxFQUFFO29CQUMxRCxJQUFJLENBQUMsb0JBQW9CLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsMEJBQTBCLEVBQUUsMkRBQTJELENBQUMsQ0FBQyxDQUFDO29CQUN0SSxPQUFPLEtBQUssQ0FBQztpQkFDYjtnQkFDRCxJQUFJLENBQUMsTUFBTSxDQUFDLFVBQVUsRUFBRSxDQUFDO2dCQUN6QixPQUFPLElBQUksQ0FBQzthQUNaO1lBQ0QsT0FBTyxLQUFLLENBQUM7UUFDZCxDQUFDO1FBRU0sZ0JBQWdCO1lBQ3RCLElBQUksSUFBSSxDQUFDLE1BQU0sRUFBRTtnQkFDaEIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO2dCQUMvQixJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxDQUFDO2dCQUNyQixPQUFPLElBQUksQ0FBQzthQUNaO1lBQ0QsT0FBTyxLQUFLLENBQUM7UUFDZCxDQUFDO1FBRU0sS0FBSyxDQUFDLG1CQUFtQjtZQUMvQixJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsU0FBUyw0QkFBbUIsQ0FBQyxtQkFBbUI7bUJBQzdELElBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxFQUFFO21CQUN2QixDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxFQUFFLENBQUMsb0JBQW9CLEVBQUUsRUFDakQ7Z0JBQ0QsT0FBTyxJQUFJLENBQUMsaUJBQWlCLENBQUMsWUFBWSxFQUFFLENBQUM7YUFDN0M7WUFDRCxPQUFPLEVBQUUsQ0FBQztRQUNYLENBQUM7UUFFTSxtQkFBbUIsQ0FBQyxJQUFZO1lBQ3RDLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxTQUFTLDRCQUFtQixDQUFDLG1CQUFtQjttQkFDN0QsSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLEVBQUU7bUJBQ3ZCLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLEVBQUUsQ0FBQyxvQkFBb0IsRUFBRSxFQUNqRDtnQkFDRCw0QkFBNEI7Z0JBQzVCLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLENBQUM7YUFDM0M7UUFDRixDQUFDOztJQXpWVyxvREFBb0I7bUNBQXBCLG9CQUFvQjtRQXdCOUIsV0FBQSwrQkFBa0IsQ0FBQTtRQUNsQixXQUFBLHlCQUFlLENBQUE7UUFDZixXQUFBLG9DQUFpQixDQUFBO1FBQ2pCLFdBQUEsbUNBQW9CLENBQUE7T0EzQlYsb0JBQW9CLENBMFZoQztJQUVNLElBQU0sY0FBYyxHQUFwQixNQUFNLGNBQWUsU0FBUSxvQkFBb0I7UUFLdkQsWUFDQyxNQUFtQixFQUNtQixtQkFBd0MsRUFDMUQsa0JBQXNDLEVBQ3JCLGtCQUFzQyxFQUMzQyxhQUE0QixFQUN0QyxtQkFBeUMsRUFDOUMsZUFBZ0MsRUFDOUIsZ0JBQW1DO1lBRXRELEtBQUssQ0FBQyxNQUFNLEVBQUUsa0JBQWtCLEVBQUUsZUFBZSxFQUFFLGdCQUFnQixFQUFFLG1CQUFtQixDQUFDLENBQUM7WUFScEQsd0JBQW1CLEdBQW5CLG1CQUFtQixDQUFxQjtZQUV6Qyx1QkFBa0IsR0FBbEIsa0JBQWtCLENBQW9CO1lBQzNDLGtCQUFhLEdBQWIsYUFBYSxDQUFlO1lBTTVELElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDO1lBQ3BCLElBQUksQ0FBQyxrQkFBa0IsR0FBRyxJQUFJLENBQUM7UUFDaEMsQ0FBQztRQUVrQixLQUFLLENBQUMsTUFBTSxDQUFDLElBQXVCLEVBQUUsUUFBK0I7WUFDdkYsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUU7Z0JBQ2xCLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO2FBQ3pCO1lBRUQsTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxZQUFZLEVBQUUsQ0FBQztZQUM5QyxJQUFJLGlCQUFpQixHQUFHLEtBQUssQ0FBQztZQUU5QixRQUFRLElBQUksQ0FBQyxPQUFPLENBQUMsU0FBUyw0QkFBbUIsQ0FBQyxtQkFBbUIsRUFBRTtnQkFDdEUsS0FBSyxRQUFRO29CQUNaLGlCQUFpQixHQUFHLElBQUksQ0FBQztvQkFDekIsTUFBTTtnQkFDUCxLQUFLLE9BQU87b0JBQ1gsaUJBQWlCLEdBQUcsS0FBSyxDQUFDO29CQUMxQixNQUFNO2dCQUNQLEtBQUssV0FBVyxDQUFDLENBQUM7b0JBQ2pCLE1BQU0sdUJBQXVCLEdBQUcsQ0FBQyxDQUFDLFNBQVMsSUFBSSxTQUFTLENBQUMsZUFBZSxLQUFLLFNBQVMsQ0FBQyxhQUFhLENBQUM7b0JBQ3JHLGlCQUFpQixHQUFHLHVCQUF1QixDQUFDO29CQUM1QyxNQUFNO2lCQUNOO2dCQUNEO29CQUNDLE1BQU07YUFDUDtZQUVELElBQUksQ0FBQyxpQkFBaUIsR0FBRyxJQUFJLENBQUMsaUJBQWlCLElBQUksaUJBQWlCLENBQUM7WUFFckUsTUFBTSxLQUFLLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxRQUFRLENBQUMsQ0FBQztZQUVuQyxJQUFJLElBQUksQ0FBQyxPQUFPLEVBQUU7Z0JBQ2pCLElBQUksSUFBSSxDQUFDLFdBQVcsbURBQTJDLEVBQUU7b0JBQ2hFLElBQUksQ0FBQyxPQUFPLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztpQkFDakM7cUJBQU0sSUFBSSxJQUFJLENBQUMsV0FBVyxnREFBd0MsRUFBRTtvQkFDcEUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxjQUFjLEVBQUUsQ0FBQztpQkFDOUI7YUFDRDtRQUNGLENBQUM7UUFFZSxvQkFBb0IsQ0FBQyxvQkFBNkIsS0FBSztZQUN0RSxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRTtnQkFDbEIsSUFBSSxDQUFDLGlCQUFpQixFQUFFLENBQUM7YUFDekI7WUFDRCxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsVUFBVSxJQUFJLENBQUMsaUJBQWlCLEVBQUU7Z0JBQ2pELElBQUksQ0FBQyxPQUFRLENBQUMsb0JBQW9CLEVBQUUsQ0FBQzthQUNyQztpQkFBTTtnQkFDTixJQUFJLENBQUMsa0JBQW1CLENBQUMsb0JBQW9CLEVBQUUsQ0FBQzthQUNoRDtRQUNGLENBQUM7UUFFTyxpQkFBaUI7WUFDeEIsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksdUJBQVUsQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxtQkFBbUIsRUFBRSxJQUFJLENBQUMsa0JBQWtCLEVBQUUsSUFBSSxDQUFDLGtCQUFrQixFQUFFLElBQUksQ0FBQyxhQUFhLEVBQUUsSUFBSSxDQUFDLGVBQWUsRUFBRSxJQUFJLENBQUMsb0JBQW9CLENBQUMsQ0FBQyxDQUFDO1lBQ2hPLElBQUksQ0FBQyxrQkFBa0IsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUkscUNBQWlCLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLENBQUM7UUFDckgsQ0FBQztRQUVELGFBQWE7WUFDWixPQUFPLElBQUksQ0FBQyxPQUFPLEVBQUUsWUFBWSxFQUFFLENBQUM7UUFDckMsQ0FBQztRQUVELGdCQUFnQixDQUFDLEtBQVU7WUFDMUIsSUFBSSxDQUFDLE9BQU8sRUFBRSxZQUFZLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDbkMsQ0FBQztLQUNELENBQUE7SUFoRlksd0NBQWM7NkJBQWQsY0FBYztRQU94QixXQUFBLGlDQUFtQixDQUFBO1FBQ25CLFdBQUEsK0JBQWtCLENBQUE7UUFDbEIsV0FBQSwrQkFBa0IsQ0FBQTtRQUNsQixXQUFBLDRCQUFhLENBQUE7UUFDYixXQUFBLG1DQUFvQixDQUFBO1FBQ3BCLFdBQUEseUJBQWUsQ0FBQTtRQUNmLFdBQUEsb0NBQWlCLENBQUE7T0FiUCxjQUFjLENBZ0YxQjtJQUVZLFFBQUEsZUFBZSxHQUFHLElBQUEsNENBQXlCLEVBQUMsSUFBSSxvQ0FBaUIsQ0FBQztRQUM5RSxFQUFFLEVBQUUsb0JBQVEsQ0FBQyxlQUFlO1FBQzVCLEtBQUssRUFBRSxHQUFHLENBQUMsUUFBUSxDQUFDLGlCQUFpQixFQUFFLE1BQU0sQ0FBQztRQUM5QyxLQUFLLEVBQUUsTUFBTTtRQUNiLFlBQVksRUFBRSwyQkFBYyxDQUFDLEVBQUUsQ0FBQyxxQ0FBaUIsQ0FBQyxLQUFLLEVBQUUsMkJBQWMsQ0FBQyxHQUFHLENBQUMsY0FBYyxDQUFDLENBQUM7UUFDNUYsTUFBTSxFQUFFO1lBQ1AsTUFBTSxFQUFFLElBQUk7WUFDWixPQUFPLEVBQUUsaURBQTZCO1lBQ3RDLE1BQU0sMENBQWdDO1NBQ3RDO1FBQ0QsUUFBUSxFQUFFO1lBQ1QsTUFBTSxFQUFFLGdCQUFNLENBQUMsZUFBZTtZQUM5QixLQUFLLEVBQUUsUUFBUTtZQUNmLEtBQUssRUFBRSxHQUFHLENBQUMsUUFBUSxDQUFDLEVBQUUsR0FBRyxFQUFFLFFBQVEsRUFBRSxPQUFPLEVBQUUsQ0FBQyx1QkFBdUIsQ0FBQyxFQUFFLEVBQUUsUUFBUSxDQUFDO1lBQ3BGLEtBQUssRUFBRSxDQUFDO1NBQ1I7S0FDRCxDQUFDLENBQUMsQ0FBQztJQUVKLHVCQUFlLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxFQUFFLENBQUMsUUFBMEIsRUFBRSxNQUFtQixFQUFFLElBQVMsRUFBMkIsRUFBRTtRQUM1SCxNQUFNLFVBQVUsR0FBRyxvQkFBb0IsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDcEQsSUFBSSxDQUFDLFVBQVUsRUFBRTtZQUNoQixPQUFPLEtBQUssQ0FBQztTQUNiO1FBQ0QsT0FBTyxVQUFVLENBQUMsS0FBSyxDQUFDO1lBQ3ZCLGtCQUFrQixFQUFFLEtBQUs7WUFDekIsNkJBQTZCLEVBQUUsTUFBTSxDQUFDLFNBQVMsNEJBQW1CLENBQUMsNkJBQTZCLEtBQUssT0FBTyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLE1BQU07WUFDaEkscUNBQXFDLEVBQUUsTUFBTSxDQUFDLFNBQVMsNEJBQW1CLENBQUMsNkJBQTZCLEtBQUssV0FBVztZQUN4SCxtQ0FBbUMsRUFBRSxNQUFNLENBQUMsU0FBUyw0QkFBbUIsQ0FBQyxtQkFBbUI7WUFDNUYsV0FBVyw2Q0FBcUM7WUFDaEQsYUFBYSxFQUFFLElBQUk7WUFDbkIsaUJBQWlCLEVBQUUsS0FBSztZQUN4QixJQUFJLEVBQUUsTUFBTSxDQUFDLFNBQVMsNEJBQW1CLENBQUMsSUFBSTtTQUM5QyxDQUFDLENBQUM7SUFDSixDQUFDLENBQUMsQ0FBQztJQUVILE1BQU0sa0JBQWtCLEdBQUc7UUFDMUIsV0FBVyxFQUFFLG1DQUFtQztRQUNoRCxJQUFJLEVBQUUsQ0FBQztnQkFDTixJQUFJLEVBQUUsdUNBQXVDO2dCQUM3QyxNQUFNLEVBQUU7b0JBQ1AsVUFBVSxFQUFFO3dCQUNYLFlBQVksRUFBRSxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUU7d0JBQ2hDLGFBQWEsRUFBRSxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUU7d0JBQ2pDLEtBQUssRUFBRSxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUU7d0JBQzFCLGFBQWEsRUFBRTs0QkFDZCxJQUFJLEVBQUUsUUFBUTs0QkFDZCxXQUFXLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQyw4QkFBOEIsRUFBRSx3SEFBd0gsQ0FBQzt5QkFDbkw7d0JBQ0QsU0FBUyxFQUFFLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRTt3QkFDOUIsaUJBQWlCLEVBQUU7NEJBQ2xCLElBQUksRUFBRSxRQUFROzRCQUNkLFdBQVcsRUFBRSxHQUFHLENBQUMsUUFBUSxDQUFDLGdDQUFnQyxFQUFFLGtIQUFrSCxDQUFDO3lCQUMvSzt3QkFDRCxTQUFTLEVBQUUsRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFO3dCQUM5QixpQkFBaUIsRUFBRTs0QkFDbEIsSUFBSSxFQUFFLFFBQVE7NEJBQ2QsV0FBVyxFQUFFLEdBQUcsQ0FBQyxRQUFRLENBQUMsZ0NBQWdDLEVBQUUsMkdBQTJHLENBQUM7eUJBQ3hLO3dCQUNELFlBQVksRUFBRSxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUU7d0JBQ2pDLG9CQUFvQixFQUFFOzRCQUNyQixJQUFJLEVBQUUsUUFBUTs0QkFDZCxXQUFXLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQyxtQ0FBbUMsRUFBRSwrR0FBK0csQ0FBQzt5QkFDL0s7d0JBQ0QsZUFBZSxFQUFFLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRTtxQkFDcEM7aUJBQ0Q7YUFDRCxDQUFDO0tBQ08sQ0FBQztJQUVYLE1BQWEsdUJBQXdCLFNBQVEsK0JBQVk7UUFFeEQ7WUFDQyxLQUFLLENBQUM7Z0JBQ0wsRUFBRSxFQUFFLG9CQUFRLENBQUMsaUJBQWlCO2dCQUM5QixLQUFLLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQyx5QkFBeUIsRUFBRSxxQkFBcUIsQ0FBQztnQkFDckUsS0FBSyxFQUFFLHFCQUFxQjtnQkFDNUIsWUFBWSxFQUFFLFNBQVM7Z0JBQ3ZCLE1BQU0sRUFBRTtvQkFDUCxNQUFNLEVBQUUsSUFBSTtvQkFDWixPQUFPLEVBQUUsQ0FBQztvQkFDVixNQUFNLDBDQUFnQztpQkFDdEM7Z0JBQ0QsV0FBVyxFQUFFLGtCQUFrQjthQUMvQixDQUFDLENBQUM7UUFDSixDQUFDO1FBRU0sS0FBSyxDQUFDLEdBQUcsQ0FBQyxRQUFpQyxFQUFFLE1BQW1CLEVBQUUsSUFBMEI7WUFDbEcsTUFBTSxVQUFVLEdBQUcsb0JBQW9CLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQ3BELElBQUksVUFBVSxFQUFFO2dCQUNmLE1BQU0sUUFBUSxHQUF5QixJQUFJLENBQUMsQ0FBQyxDQUFDO29CQUM3QyxZQUFZLEVBQUUsSUFBSSxDQUFDLFlBQVk7b0JBQy9CLGFBQWEsRUFBRSxJQUFJLENBQUMsYUFBYTtvQkFDakMsaUJBQWlCLEVBQUUsSUFBSSxDQUFDLGFBQWEsS0FBSyxTQUFTO29CQUNuRCxPQUFPLEVBQUUsSUFBSSxDQUFDLE9BQU87b0JBQ3JCLHVDQUF1QztvQkFDdkMsU0FBUyxFQUFFLElBQUksQ0FBQyxjQUFjO29CQUM5Qiw2Q0FBNkM7b0JBQzdDLFNBQVMsRUFBRSxJQUFJLENBQUMsZUFBZTtvQkFDL0IsNkNBQTZDO29CQUM3QyxZQUFZLEVBQUUsSUFBSSxDQUFDLFlBQVk7b0JBQy9CLG1EQUFtRDtpQkFDbkQsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDO2dCQUVQLE1BQU0sVUFBVSxDQUFDLEtBQUssQ0FBQztvQkFDdEIsa0JBQWtCLEVBQUUsS0FBSztvQkFDekIsNkJBQTZCLEVBQUUsQ0FBQyxVQUFVLENBQUMsUUFBUSxFQUFFLENBQUMsWUFBWSxDQUFDLE1BQU0sS0FBSyxDQUFDLENBQUMsSUFBSSxNQUFNLENBQUMsU0FBUyw0QkFBbUIsQ0FBQyw2QkFBNkIsS0FBSyxPQUFPLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsTUFBTTtvQkFDckwscUNBQXFDLEVBQUUsTUFBTSxDQUFDLFNBQVMsNEJBQW1CLENBQUMsNkJBQTZCLEtBQUssV0FBVztvQkFDeEgsbUNBQW1DLEVBQUUsSUFBSTtvQkFDekMsV0FBVyw2Q0FBcUM7b0JBQ2hELGFBQWEsRUFBRSxJQUFJO29CQUNuQixpQkFBaUIsRUFBRSxJQUFJLEVBQUUsZUFBZSxJQUFJLEtBQUs7b0JBQ2pELElBQUksRUFBRSxNQUFNLENBQUMsU0FBUyw0QkFBbUIsQ0FBQyxJQUFJO2lCQUM5QyxFQUFFLFFBQVEsQ0FBQyxDQUFDO2dCQUViLFVBQVUsQ0FBQyxtQkFBbUIsQ0FBQyxVQUFVLENBQUMsUUFBUSxFQUFFLENBQUMsWUFBWSxDQUFDLENBQUM7YUFDbkU7UUFDRixDQUFDO0tBQ0Q7SUFoREQsMERBZ0RDO0lBRUQsTUFBYSw0QkFBNkIsU0FBUSwrQkFBWTtRQUU3RDtZQUNDLEtBQUssQ0FBQztnQkFDTCxFQUFFLEVBQUUsb0JBQVEsQ0FBQyxzQkFBc0I7Z0JBQ25DLEtBQUssRUFBRSxHQUFHLENBQUMsUUFBUSxDQUFDLDhCQUE4QixFQUFFLHFCQUFxQixDQUFDO2dCQUMxRSxLQUFLLEVBQUUscUJBQXFCO2dCQUM1QixZQUFZLEVBQUUsU0FBUztnQkFDdkIsTUFBTSxFQUFFO29CQUNQLE1BQU0sRUFBRSxJQUFJO29CQUNaLE9BQU8sRUFBRSxDQUFDO29CQUNWLEdBQUcsRUFBRTt3QkFDSixPQUFPLEVBQUUsaURBQTZCO3FCQUN0QztvQkFDRCxNQUFNLDBDQUFnQztpQkFDdEM7YUFDRCxDQUFDLENBQUM7UUFDSixDQUFDO1FBRU0sS0FBSyxDQUFDLEdBQUcsQ0FBQyxRQUFpQyxFQUFFLE1BQW1CO1lBQ3RFLE1BQU0sVUFBVSxHQUFHLG9CQUFvQixDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUNwRCxJQUFJLFVBQVUsRUFBRTtnQkFDZixNQUFNLFVBQVUsQ0FBQyxLQUFLLENBQUM7b0JBQ3RCLGtCQUFrQixFQUFFLEtBQUs7b0JBQ3pCLDZCQUE2QixFQUFFLFVBQVU7b0JBQ3pDLHFDQUFxQyxFQUFFLEtBQUs7b0JBQzVDLG1DQUFtQyxFQUFFLEtBQUs7b0JBQzFDLFdBQVcsNENBQW9DO29CQUMvQyxhQUFhLEVBQUUsSUFBSTtvQkFDbkIsaUJBQWlCLEVBQUUsS0FBSztvQkFDeEIsSUFBSSxFQUFFLE1BQU0sQ0FBQyxTQUFTLDRCQUFtQixDQUFDLElBQUk7aUJBQzlDLENBQUMsQ0FBQztnQkFFSCxVQUFVLENBQUMsbUJBQW1CLENBQUMsVUFBVSxDQUFDLFFBQVEsRUFBRSxDQUFDLFlBQVksQ0FBQyxDQUFDO2FBQ25FO1FBQ0YsQ0FBQztLQUNEO0lBcENELG9FQW9DQztJQUNELE1BQXNCLGVBQWdCLFNBQVEsK0JBQVk7UUFDbEQsS0FBSyxDQUFDLEdBQUcsQ0FBQyxRQUFpQyxFQUFFLE1BQW1CO1lBQ3RFLE1BQU0sVUFBVSxHQUFHLG9CQUFvQixDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUNwRCxJQUFJLFVBQVUsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLEVBQUU7Z0JBQ3pDLE1BQU0sVUFBVSxDQUFDLEtBQUssQ0FBQztvQkFDdEIsa0JBQWtCLEVBQUUsS0FBSztvQkFDekIsNkJBQTZCLEVBQUUsQ0FBQyxVQUFVLENBQUMsUUFBUSxFQUFFLENBQUMsWUFBWSxDQUFDLE1BQU0sS0FBSyxDQUFDLENBQUMsSUFBSSxNQUFNLENBQUMsU0FBUyw0QkFBbUIsQ0FBQyw2QkFBNkIsS0FBSyxPQUFPLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsTUFBTTtvQkFDckwscUNBQXFDLEVBQUUsTUFBTSxDQUFDLFNBQVMsNEJBQW1CLENBQUMsNkJBQTZCLEtBQUssV0FBVztvQkFDeEgsbUNBQW1DLEVBQUUsSUFBSTtvQkFDekMsV0FBVyw0Q0FBb0M7b0JBQy9DLGFBQWEsRUFBRSxJQUFJO29CQUNuQixpQkFBaUIsRUFBRSxLQUFLO29CQUN4QixJQUFJLEVBQUUsTUFBTSxDQUFDLFNBQVMsNEJBQW1CLENBQUMsSUFBSTtpQkFDOUMsQ0FBQyxDQUFDO2dCQUNILElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7YUFDdEI7UUFDRixDQUFDO0tBR0Q7SUFuQkQsMENBbUJDO0lBRUQsTUFBYSxtQkFBb0IsU0FBUSxlQUFlO1FBRXZEO1lBQ0MsS0FBSyxDQUFDO2dCQUNMLEVBQUUsRUFBRSxvQkFBUSxDQUFDLG1CQUFtQjtnQkFDaEMsS0FBSyxFQUFFLEdBQUcsQ0FBQyxRQUFRLENBQUMscUJBQXFCLEVBQUUsV0FBVyxDQUFDO2dCQUN2RCxLQUFLLEVBQUUsV0FBVztnQkFDbEIsWUFBWSxFQUFFLFNBQVM7Z0JBQ3ZCLE1BQU0sRUFBRSxDQUFDO3dCQUNSLE1BQU0sRUFBRSxxQ0FBaUIsQ0FBQyxLQUFLO3dCQUMvQixPQUFPLHFCQUFZO3dCQUNuQixHQUFHLEVBQUUsRUFBRSxPQUFPLEVBQUUsaURBQTZCLEVBQUUsU0FBUyxFQUFFLHFCQUFZLEVBQUU7d0JBQ3hFLE1BQU0sMENBQWdDO3FCQUN0QyxFQUFFO3dCQUNGLE1BQU0sRUFBRSwyQkFBYyxDQUFDLEdBQUcsQ0FBQyxxQ0FBaUIsQ0FBQyxLQUFLLEVBQUUsc0NBQTBCLENBQUM7d0JBQy9FLE9BQU8sdUJBQWU7d0JBQ3RCLE1BQU0sMENBQWdDO3FCQUN0QyxDQUFDO2FBQ0YsQ0FBQyxDQUFDO1FBQ0osQ0FBQztRQUVTLElBQUksQ0FBQyxVQUFnQztZQUM5QyxNQUFNLE1BQU0sR0FBRyxVQUFVLENBQUMsZUFBZSxFQUFFLENBQUM7WUFDNUMsSUFBSSxNQUFNLEVBQUU7Z0JBQ1gsVUFBVSxDQUFDLE1BQU0sQ0FBQyxZQUFZLEVBQUUsQ0FBQztnQkFDakMsT0FBTyxJQUFJLENBQUM7YUFDWjtZQUVELE9BQU8sS0FBSyxDQUFDO1FBQ2QsQ0FBQztLQUNEO0lBOUJELGtEQThCQztJQUdELE1BQWEsdUJBQXdCLFNBQVEsZUFBZTtRQUUzRDtZQUNDLEtBQUssQ0FBQztnQkFDTCxFQUFFLEVBQUUsb0JBQVEsQ0FBQyx1QkFBdUI7Z0JBQ3BDLEtBQUssRUFBRSxHQUFHLENBQUMsUUFBUSxDQUFDLHlCQUF5QixFQUFFLGVBQWUsQ0FBQztnQkFDL0QsS0FBSyxFQUFFLGVBQWU7Z0JBQ3RCLFlBQVksRUFBRSxTQUFTO2dCQUN2QixNQUFNLEVBQUUsQ0FBQzt3QkFDUixNQUFNLEVBQUUscUNBQWlCLENBQUMsS0FBSzt3QkFDL0IsT0FBTyxFQUFFLDZDQUF5Qjt3QkFDbEMsR0FBRyxFQUFFLEVBQUUsT0FBTyxFQUFFLG1EQUE2Qix3QkFBZSxFQUFFLFNBQVMsRUFBRSxDQUFDLDZDQUF5QixDQUFDLEVBQUU7d0JBQ3RHLE1BQU0sMENBQWdDO3FCQUN0QyxFQUFFO3dCQUNGLE1BQU0sRUFBRSwyQkFBYyxDQUFDLEdBQUcsQ0FBQyxxQ0FBaUIsQ0FBQyxLQUFLLEVBQUUsc0NBQTBCLENBQUM7d0JBQy9FLE9BQU8sRUFBRSwrQ0FBNEI7d0JBQ3JDLE1BQU0sMENBQWdDO3FCQUN0QztpQkFDQTthQUNELENBQUMsQ0FBQztRQUNKLENBQUM7UUFFUyxJQUFJLENBQUMsVUFBZ0M7WUFDOUMsT0FBTyxVQUFVLENBQUMsZUFBZSxFQUFFLENBQUM7UUFDckMsQ0FBQztLQUNEO0lBekJELDBEQXlCQztJQUVELE1BQWEscUJBQXNCLFNBQVEsK0JBQVk7UUFHdEQ7WUFDQyxLQUFLLENBQUM7Z0JBQ0wsRUFBRSxFQUFFLG9CQUFRLENBQUMsbUJBQW1CO2dCQUNoQyxLQUFLLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQywyQkFBMkIsRUFBRSxnQkFBZ0IsQ0FBQztnQkFDbEUsS0FBSyxFQUFFLGdCQUFnQjtnQkFDdkIsWUFBWSxFQUFFLHVDQUEyQjthQUN6QyxDQUFDLENBQUM7WUFQSSwwQkFBcUIsR0FBYSxFQUFFLENBQUM7UUFRN0MsQ0FBQztRQUVNLEdBQUcsQ0FBQyxRQUEwQixFQUFFLE1BQW1CLEVBQUUsSUFBUztZQUNwRSxNQUFNLFVBQVUsR0FBRyxvQkFBb0IsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDcEQsSUFBSSxDQUFDLFVBQVUsRUFBRTtnQkFDaEIsT0FBTzthQUNQO1lBRUQsTUFBTSxZQUFZLEdBQUcsVUFBVSxDQUFDLFFBQVEsRUFBRSxDQUFDLFlBQVksQ0FBQztZQUN4RCxJQUFJLFlBQVksR0FBRyxDQUFDLEVBQUU7Z0JBQ3JCLE1BQU0sbUJBQW1CLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQyxtQ0FBb0IsQ0FBQyxDQUFDO2dCQUMvRCxtQkFBbUIsQ0FBQyxNQUFNLENBQUM7b0JBQzFCLFFBQVEsRUFBRSx1QkFBUSxDQUFDLE9BQU87b0JBQzFCLE9BQU8sRUFBRSxHQUFHLENBQUMsUUFBUSxDQUFDLDJCQUEyQixFQUFFLCtDQUErQyxDQUFDO2lCQUNuRyxDQUFDLENBQUM7Z0JBQ0gsT0FBTzthQUNQO1lBRUQsTUFBTSxpQkFBaUIsR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLCtCQUFrQixDQUFDLENBQUM7WUFDM0QsTUFBTSxRQUFRLEdBQUcsaUJBQWlCLENBQUMsY0FBYyxFQUFFLENBQUM7WUFDcEQsUUFBUSxDQUFDLFdBQVcsR0FBRyxHQUFHLENBQUMsUUFBUSxDQUFDLGtDQUFrQyxFQUFFLDZEQUE2RCxFQUFFLFlBQVksQ0FBQyxDQUFDO1lBRXJKLE1BQU0sZ0JBQWdCLEdBQUcsQ0FBQyxLQUFhLEVBQXNCLEVBQUU7Z0JBQzlELE1BQU0sS0FBSyxHQUFHLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQztnQkFDOUIsSUFBSSxLQUFLLENBQUMsS0FBSyxDQUFDLEVBQUU7b0JBQ2pCLE9BQU8sU0FBUyxDQUFDO2lCQUNqQjtnQkFFRCxNQUFNLFVBQVUsR0FBRyxVQUFVLENBQUMsUUFBUSxFQUFFLENBQUMsWUFBWSxDQUFDO2dCQUN0RCxJQUFJLEtBQUssR0FBRyxDQUFDLElBQUksS0FBSyxJQUFJLFVBQVUsRUFBRTtvQkFDckMsT0FBTyxLQUFLLEdBQUcsQ0FBQyxDQUFDLENBQUMsYUFBYTtpQkFDL0I7cUJBQU0sSUFBSSxLQUFLLEdBQUcsQ0FBQyxJQUFJLEtBQUssSUFBSSxDQUFDLFVBQVUsRUFBRTtvQkFDN0MsT0FBTyxVQUFVLEdBQUcsS0FBSyxDQUFDO2lCQUMxQjtnQkFFRCxPQUFPLFNBQVMsQ0FBQztZQUNsQixDQUFDLENBQUM7WUFFRixNQUFNLHFCQUFxQixHQUFHLENBQUMsS0FBYSxFQUFFLEVBQUU7Z0JBQy9DLE1BQU0sS0FBSyxHQUFHLGdCQUFnQixDQUFDLEtBQUssQ0FBQyxDQUFDO2dCQUN0QyxJQUFJLE9BQU8sS0FBSyxLQUFLLFFBQVEsRUFBRTtvQkFDOUIsUUFBUTtvQkFDUixRQUFRLENBQUMsaUJBQWlCLEdBQUcsU0FBUyxDQUFDO29CQUN2QyxVQUFVLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxDQUFDO29CQUM1QixNQUFNLFlBQVksR0FBRyxVQUFVLENBQUMsUUFBUSxFQUFFLENBQUMsWUFBWSxDQUFDO29CQUN4RCxJQUFJLFlBQVksRUFBRTt3QkFDakIsSUFBSSxDQUFDLGNBQWMsQ0FBQyxNQUFNLEVBQUUsWUFBWSxDQUFDLENBQUM7cUJBQzFDO2lCQUNEO3FCQUFNO29CQUNOLFFBQVEsQ0FBQyxpQkFBaUIsR0FBRyxHQUFHLENBQUMsUUFBUSxDQUFDLHdDQUF3QyxFQUFFLHdDQUF3QyxFQUFFLFVBQVUsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxZQUFZLENBQUMsQ0FBQztvQkFDbEssSUFBSSxDQUFDLGdCQUFnQixDQUFDLE1BQU0sQ0FBQyxDQUFDO2lCQUM5QjtZQUNGLENBQUMsQ0FBQztZQUNGLFFBQVEsQ0FBQyxnQkFBZ0IsQ0FBQyxLQUFLLENBQUMsRUFBRTtnQkFDakMscUJBQXFCLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDOUIsQ0FBQyxDQUFDLENBQUM7WUFFSCxRQUFRLENBQUMsV0FBVyxDQUFDLEdBQUcsRUFBRTtnQkFDekIsTUFBTSxLQUFLLEdBQUcsZ0JBQWdCLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDO2dCQUMvQyxJQUFJLE9BQU8sS0FBSyxLQUFLLFFBQVEsRUFBRTtvQkFDOUIsVUFBVSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQztvQkFDNUIsUUFBUSxDQUFDLElBQUksRUFBRSxDQUFDO2lCQUNoQjtxQkFBTTtvQkFDTixRQUFRLENBQUMsaUJBQWlCLEdBQUcsR0FBRyxDQUFDLFFBQVEsQ0FBQyx3Q0FBd0MsRUFBRSx3Q0FBd0MsRUFBRSxVQUFVLENBQUMsUUFBUSxFQUFFLENBQUMsWUFBWSxDQUFDLENBQUM7aUJBQ2xLO1lBQ0YsQ0FBQyxDQUFDLENBQUM7WUFFSCxRQUFRLENBQUMsU0FBUyxDQUFDLEdBQUcsRUFBRTtnQkFDdkIsSUFBSSxDQUFDLGdCQUFnQixDQUFDLE1BQU0sQ0FBQyxDQUFDO2dCQUM5QixRQUFRLENBQUMsT0FBTyxFQUFFLENBQUM7WUFDcEIsQ0FBQyxDQUFDLENBQUM7WUFFSCxRQUFRLENBQUMsSUFBSSxFQUFFLENBQUM7UUFDakIsQ0FBQztRQUVPLGdCQUFnQixDQUFDLE1BQW1CO1lBQzNDLE1BQU0sQ0FBQyxpQkFBaUIsQ0FBQyxjQUFjLENBQUMsRUFBRTtnQkFDekMsSUFBSSxDQUFDLHFCQUFxQixHQUFHLGNBQWMsQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMscUJBQXFCLEVBQUUsRUFBRSxDQUFDLENBQUM7WUFDOUYsQ0FBQyxDQUFDLENBQUM7UUFDSixDQUFDO1FBRU8sY0FBYyxDQUFDLE1BQW1CLEVBQUUsS0FBYTtZQUN4RCxNQUFNLENBQUMsaUJBQWlCLENBQUMsY0FBYyxDQUFDLEVBQUU7Z0JBQ3pDLElBQUksQ0FBQyxxQkFBcUIsR0FBRyxjQUFjLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLHFCQUFxQixFQUFFO29CQUN4Rjt3QkFDQyxLQUFLO3dCQUNMLE9BQU8sRUFBRTs0QkFDUixXQUFXLEVBQUUseUNBQXlDOzRCQUN0RCxTQUFTLEVBQUUsZ0JBQWdCOzRCQUMzQixXQUFXLEVBQUUsSUFBSTt5QkFDakI7cUJBQ0Q7b0JBQ0Q7d0JBQ0MsS0FBSzt3QkFDTCxPQUFPLEVBQUU7NEJBQ1IsV0FBVyxFQUFFLGtEQUFrRDs0QkFDL0QsYUFBYSxFQUFFO2dDQUNkLEtBQUssRUFBRSxJQUFBLCtCQUFnQixFQUFDLGlEQUEyQixDQUFDO2dDQUNwRCxRQUFRLEVBQUUseUJBQWlCLENBQUMsSUFBSTs2QkFDaEM7eUJBQ0Q7cUJBQ0Q7aUJBQ0QsQ0FBQyxDQUFDO1lBQ0osQ0FBQyxDQUFDLENBQUM7UUFDSixDQUFDO0tBQ0Q7SUFuSEQsc0RBbUhDO0lBRUQsTUFBc0Isd0JBQXlCLFNBQVEsK0JBQVk7UUFDM0QsS0FBSyxDQUFDLEdBQUcsQ0FBQyxRQUFpQyxFQUFFLE1BQW1CO1lBQ3RFLE1BQU0sVUFBVSxHQUFHLG9CQUFvQixDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUNwRCxJQUFJLENBQUMsVUFBVSxFQUFFO2dCQUNoQixPQUFPO2FBQ1A7WUFFRCxNQUFNLHFCQUFxQixHQUFHLHdCQUF3QixDQUFDLE1BQU0sRUFBRSxRQUFRLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFDaEYsSUFBSSxxQkFBcUIsRUFBRTtnQkFDMUIsVUFBVSxDQUFDLGVBQWUsQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDO2FBQ2xEO1lBQ0QsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLEVBQUU7Z0JBQzNCLE1BQU0sVUFBVSxDQUFDLEtBQUssQ0FBQztvQkFDdEIsa0JBQWtCLEVBQUUsS0FBSztvQkFDekIsNkJBQTZCLEVBQUUsTUFBTTtvQkFDckMscUNBQXFDLEVBQUUsS0FBSztvQkFDNUMsbUNBQW1DLEVBQUUsS0FBSztvQkFDMUMsV0FBVyw0Q0FBb0M7b0JBQy9DLGFBQWEsRUFBRSxJQUFJO29CQUNuQixpQkFBaUIsRUFBRSxLQUFLO29CQUN4QixJQUFJLEVBQUUsTUFBTSxDQUFDLFNBQVMsNEJBQW1CLENBQUMsSUFBSTtpQkFDOUMsQ0FBQyxDQUFDO2dCQUNILElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7YUFDdEI7UUFDRixDQUFDO0tBR0Q7SUEzQkQsNERBMkJDO0lBRUQsTUFBYSw0QkFBNkIsU0FBUSx3QkFBd0I7UUFFekU7WUFDQyxLQUFLLENBQUM7Z0JBQ0wsRUFBRSxFQUFFLG9CQUFRLENBQUMsNEJBQTRCO2dCQUN6QyxLQUFLLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQyw4QkFBOEIsRUFBRSxxQkFBcUIsQ0FBQztnQkFDMUUsS0FBSyxFQUFFLHFCQUFxQjtnQkFDNUIsWUFBWSxFQUFFLFNBQVM7Z0JBQ3ZCLE1BQU0sRUFBRTtvQkFDUCxNQUFNLEVBQUUscUNBQWlCLENBQUMsS0FBSztvQkFDL0IsT0FBTyxFQUFFLCtDQUEyQjtvQkFDcEMsTUFBTSwwQ0FBZ0M7aUJBQ3RDO2FBQ0QsQ0FBQyxDQUFDO1FBQ0osQ0FBQztRQUVTLElBQUksQ0FBQyxVQUFnQztZQUM5QyxPQUFPLFVBQVUsQ0FBQyxlQUFlLEVBQUUsQ0FBQztRQUNyQyxDQUFDO0tBQ0Q7SUFuQkQsb0VBbUJDO0lBRUQsTUFBYSxnQ0FBaUMsU0FBUSx3QkFBd0I7UUFFN0U7WUFDQyxLQUFLLENBQUM7Z0JBQ0wsRUFBRSxFQUFFLG9CQUFRLENBQUMsZ0NBQWdDO2dCQUM3QyxLQUFLLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQyxrQ0FBa0MsRUFBRSx5QkFBeUIsQ0FBQztnQkFDbEYsS0FBSyxFQUFFLHlCQUF5QjtnQkFDaEMsWUFBWSxFQUFFLFNBQVM7Z0JBQ3ZCLE1BQU0sRUFBRTtvQkFDUCxNQUFNLEVBQUUscUNBQWlCLENBQUMsS0FBSztvQkFDL0IsT0FBTyxFQUFFLG1EQUE2QixzQkFBYTtvQkFDbkQsTUFBTSwwQ0FBZ0M7aUJBQ3RDO2FBQ0QsQ0FBQyxDQUFDO1FBQ0osQ0FBQztRQUVTLElBQUksQ0FBQyxVQUFnQztZQUM5QyxPQUFPLFVBQVUsQ0FBQyxlQUFlLEVBQUUsQ0FBQztRQUNyQyxDQUFDO0tBQ0Q7SUFuQkQsNEVBbUJDO0lBRVksUUFBQSxzQkFBc0IsR0FBRyxJQUFBLDRDQUF5QixFQUFDLElBQUksb0NBQWlCLENBQUM7UUFDckYsRUFBRSxFQUFFLG9CQUFRLENBQUMsc0JBQXNCO1FBQ25DLEtBQUssRUFBRSxHQUFHLENBQUMsUUFBUSxDQUFDLGNBQWMsRUFBRSxTQUFTLENBQUM7UUFDOUMsS0FBSyxFQUFFLFNBQVM7UUFDaEIsWUFBWSxFQUFFLDJCQUFjLENBQUMsRUFBRSxDQUFDLHFDQUFpQixDQUFDLEtBQUssRUFBRSwyQkFBYyxDQUFDLEdBQUcsQ0FBQyxjQUFjLENBQUMsQ0FBQztRQUM1RixNQUFNLEVBQUU7WUFDUCxNQUFNLEVBQUUsSUFBSTtZQUNaLE9BQU8sRUFBRSxpREFBNkI7WUFDdEMsR0FBRyxFQUFFLEVBQUUsT0FBTyxFQUFFLGdEQUEyQix3QkFBZSxFQUFFO1lBQzVELE1BQU0sMENBQWdDO1NBQ3RDO1FBQ0QsUUFBUSxFQUFFO1lBQ1QsTUFBTSxFQUFFLGdCQUFNLENBQUMsZUFBZTtZQUM5QixLQUFLLEVBQUUsUUFBUTtZQUNmLEtBQUssRUFBRSxHQUFHLENBQUMsUUFBUSxDQUFDLEVBQUUsR0FBRyxFQUFFLFdBQVcsRUFBRSxPQUFPLEVBQUUsQ0FBQyx1QkFBdUIsQ0FBQyxFQUFFLEVBQUUsV0FBVyxDQUFDO1lBQzFGLEtBQUssRUFBRSxDQUFDO1NBQ1I7S0FDRCxDQUFDLENBQUMsQ0FBQztJQUVKLDhCQUFzQixDQUFDLGlCQUFpQixDQUFDLENBQUMsRUFBRSxDQUFDLFFBQTBCLEVBQUUsTUFBbUIsRUFBRSxJQUFTLEVBQTJCLEVBQUU7UUFDbkksSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLEVBQUUsSUFBSSxNQUFNLENBQUMsU0FBUyxnQ0FBdUIsRUFBRTtZQUNsRSxPQUFPLEtBQUssQ0FBQztTQUNiO1FBQ0QsTUFBTSxVQUFVLEdBQUcsb0JBQW9CLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ3BELElBQUksQ0FBQyxVQUFVLEVBQUU7WUFDaEIsT0FBTyxLQUFLLENBQUM7U0FDYjtRQUVELE1BQU0sZ0JBQWdCLEdBQUcsTUFBTSxDQUFDLFlBQVksRUFBRSxDQUFDO1FBQy9DLE1BQU0sZ0JBQWdCLEdBQUcsVUFBVSxDQUFDLGtCQUFrQixFQUFFLENBQUM7UUFDekQscUdBQXFHO1FBQ3JHLGtDQUFrQztRQUNsQyxNQUFNLDZCQUE2QixHQUFHLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxFQUFFO2VBQzdELGdCQUFnQixDQUFDLGVBQWUsS0FBSyxnQkFBZ0IsQ0FBQyxhQUFhO2VBQ25FLENBQUMsTUFBTSxDQUFDLFNBQVMsNEJBQW1CLENBQUMsNkJBQTZCLEtBQUssT0FBTyxDQUFDO2VBQy9FLENBQUMsZ0JBQWdCLENBQUM7UUFDdEI7Ozs7OztVQU1FO1FBQ0YsTUFBTSxXQUFXLEdBQUcsQ0FBQyxnQkFBZ0IsSUFBSSw2QkFBNkIsQ0FBQyxDQUFDLENBQUM7MkRBQ2pDLENBQUMsNENBQW9DLENBQUM7UUFFOUUsT0FBTyxVQUFVLENBQUMsS0FBSyxDQUFDO1lBQ3ZCLGtCQUFrQixFQUFFLElBQUk7WUFDeEIsNkJBQTZCLEVBQUUsNkJBQTZCLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsTUFBTTtZQUNoRixxQ0FBcUMsRUFBRSxNQUFNLENBQUMsU0FBUyw0QkFBbUIsQ0FBQyw2QkFBNkIsS0FBSyxXQUFXO1lBQ3hILG1DQUFtQyxFQUFFLE1BQU0sQ0FBQyxTQUFTLDRCQUFtQixDQUFDLDZCQUE2QixLQUFLLE9BQU87WUFDbEgsV0FBVyxFQUFFLFdBQVc7WUFDeEIsYUFBYSxFQUFFLElBQUk7WUFDbkIsaUJBQWlCLEVBQUUsS0FBSztZQUN4QixJQUFJLEVBQUUsTUFBTSxDQUFDLFNBQVMsNEJBQW1CLENBQUMsSUFBSTtTQUM5QyxDQUFDLENBQUM7SUFDSixDQUFDLENBQUMsQ0FBQztJQUVILElBQUEsNkNBQTBCLEVBQUMsb0JBQW9CLENBQUMsRUFBRSxFQUFFLGNBQWMsZ0RBQXdDLENBQUMsQ0FBQywyREFBMkQ7SUFFdkssSUFBQSx1Q0FBb0IsRUFBQyx1QkFBdUIsQ0FBQyxDQUFDO0lBQzlDLElBQUEsdUNBQW9CLEVBQUMsNEJBQTRCLENBQUMsQ0FBQztJQUNuRCxJQUFBLHVDQUFvQixFQUFDLG1CQUFtQixDQUFDLENBQUM7SUFDMUMsSUFBQSx1Q0FBb0IsRUFBQyx1QkFBdUIsQ0FBQyxDQUFDO0lBQzlDLElBQUEsdUNBQW9CLEVBQUMscUJBQXFCLENBQUMsQ0FBQztJQUM1QyxJQUFBLHVDQUFvQixFQUFDLDRCQUE0QixDQUFDLENBQUM7SUFDbkQsSUFBQSx1Q0FBb0IsRUFBQyxnQ0FBZ0MsQ0FBQyxDQUFDO0lBRXZELE1BQU0sV0FBVyxHQUFHLGdDQUFhLENBQUMsa0JBQWtCLENBQXVCLG9CQUFvQixDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBRXJHLElBQUEsd0NBQXFCLEVBQUMsSUFBSSxXQUFXLENBQUM7UUFDckMsRUFBRSxFQUFFLG9CQUFRLENBQUMsc0JBQXNCO1FBQ25DLFlBQVksRUFBRSx1Q0FBMkI7UUFDekMsT0FBTyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLGVBQWUsRUFBRTtRQUNqQyxNQUFNLEVBQUU7WUFDUCxNQUFNLEVBQUUsMkNBQWlDLENBQUM7WUFDMUMsTUFBTSxFQUFFLDJCQUFjLENBQUMsR0FBRyxDQUFDLHFDQUFpQixDQUFDLEtBQUssRUFBRSwyQkFBYyxDQUFDLEdBQUcsQ0FBQyxhQUFhLENBQUMsQ0FBQztZQUN0RixPQUFPLHdCQUFnQjtZQUN2QixTQUFTLEVBQUUsQ0FBQyxnREFBNkIsQ0FBQztTQUMxQztLQUNELENBQUMsQ0FBQyxDQUFDO0lBRUosSUFBQSx3Q0FBcUIsRUFBQyxJQUFJLFdBQVcsQ0FBQztRQUNyQyxFQUFFLEVBQUUsb0JBQVEsQ0FBQywwQkFBMEI7UUFDdkMsWUFBWSxFQUFFLFNBQVM7UUFDdkIsT0FBTyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLG1CQUFtQixFQUFFO1FBQ3JDLE1BQU0sRUFBRTtZQUNQLE1BQU0sRUFBRSwyQ0FBaUMsQ0FBQztZQUMxQyxNQUFNLEVBQUUscUNBQWlCLENBQUMsS0FBSztZQUMvQixPQUFPLEVBQUUseUNBQTZCLENBQUMsT0FBTztZQUM5QyxHQUFHLEVBQUUseUNBQTZCLENBQUMsR0FBRztZQUN0QyxHQUFHLEVBQUUseUNBQTZCLENBQUMsR0FBRztZQUN0QyxLQUFLLEVBQUUseUNBQTZCLENBQUMsS0FBSztTQUMxQztLQUNELENBQUMsQ0FBQyxDQUFDO0lBRUosSUFBQSx3Q0FBcUIsRUFBQyxJQUFJLFdBQVcsQ0FBQztRQUNyQyxFQUFFLEVBQUUsb0JBQVEsQ0FBQyxzQkFBc0I7UUFDbkMsWUFBWSxFQUFFLFNBQVM7UUFDdkIsT0FBTyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLGdCQUFnQixFQUFFO1FBQ2xDLE1BQU0sRUFBRTtZQUNQLE1BQU0sRUFBRSwyQ0FBaUMsQ0FBQztZQUMxQyxNQUFNLEVBQUUscUNBQWlCLENBQUMsS0FBSztZQUMvQixPQUFPLEVBQUUscUNBQXlCLENBQUMsT0FBTztZQUMxQyxHQUFHLEVBQUUscUNBQXlCLENBQUMsR0FBRztZQUNsQyxHQUFHLEVBQUUscUNBQXlCLENBQUMsR0FBRztZQUNsQyxLQUFLLEVBQUUscUNBQXlCLENBQUMsS0FBSztTQUN0QztLQUNELENBQUMsQ0FBQyxDQUFDO0lBRUosSUFBQSx3Q0FBcUIsRUFBQyxJQUFJLFdBQVcsQ0FBQztRQUNyQyxFQUFFLEVBQUUsb0JBQVEsQ0FBQyxrQkFBa0I7UUFDL0IsWUFBWSxFQUFFLFNBQVM7UUFDdkIsT0FBTyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLFdBQVcsRUFBRTtRQUM3QixNQUFNLEVBQUU7WUFDUCxNQUFNLEVBQUUsMkNBQWlDLENBQUM7WUFDMUMsTUFBTSxFQUFFLHFDQUFpQixDQUFDLEtBQUs7WUFDL0IsT0FBTyxFQUFFLGlDQUFxQixDQUFDLE9BQU87WUFDdEMsR0FBRyxFQUFFLGlDQUFxQixDQUFDLEdBQUc7WUFDOUIsR0FBRyxFQUFFLGlDQUFxQixDQUFDLEdBQUc7WUFDOUIsS0FBSyxFQUFFLGlDQUFxQixDQUFDLEtBQUs7U0FDbEM7S0FDRCxDQUFDLENBQUMsQ0FBQztJQUVKLElBQUEsd0NBQXFCLEVBQUMsSUFBSSxXQUFXLENBQUM7UUFDckMsRUFBRSxFQUFFLG9CQUFRLENBQUMsd0JBQXdCO1FBQ3JDLFlBQVksRUFBRSxTQUFTO1FBQ3ZCLE9BQU8sRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxpQkFBaUIsRUFBRTtRQUNuQyxNQUFNLEVBQUU7WUFDUCxNQUFNLEVBQUUsMkNBQWlDLENBQUM7WUFDMUMsTUFBTSxFQUFFLHFDQUFpQixDQUFDLEtBQUs7WUFDL0IsT0FBTyxFQUFFLHVDQUEyQixDQUFDLE9BQU87WUFDNUMsR0FBRyxFQUFFLHVDQUEyQixDQUFDLEdBQUc7WUFDcEMsR0FBRyxFQUFFLHVDQUEyQixDQUFDLEdBQUc7WUFDcEMsS0FBSyxFQUFFLHVDQUEyQixDQUFDLEtBQUs7U0FDeEM7S0FDRCxDQUFDLENBQUMsQ0FBQztJQUVKLElBQUEsd0NBQXFCLEVBQUMsSUFBSSxXQUFXLENBQUM7UUFDckMsRUFBRSxFQUFFLG9CQUFRLENBQUMseUJBQXlCO1FBQ3RDLFlBQVksRUFBRSxTQUFTO1FBQ3ZCLE9BQU8sRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxrQkFBa0IsRUFBRTtRQUNwQyxNQUFNLEVBQUU7WUFDUCxNQUFNLEVBQUUsMkNBQWlDLENBQUM7WUFDMUMsTUFBTSxFQUFFLHFDQUFpQixDQUFDLEtBQUs7WUFDL0IsT0FBTyxFQUFFLHdDQUE0QixDQUFDLE9BQU87WUFDN0MsR0FBRyxFQUFFLHdDQUE0QixDQUFDLEdBQUc7WUFDckMsR0FBRyxFQUFFLHdDQUE0QixDQUFDLEdBQUc7WUFDckMsS0FBSyxFQUFFLHdDQUE0QixDQUFDLEtBQUs7U0FDekM7S0FDRCxDQUFDLENBQUMsQ0FBQztJQUVKLElBQUEsd0NBQXFCLEVBQUMsSUFBSSxXQUFXLENBQUM7UUFDckMsRUFBRSxFQUFFLG9CQUFRLENBQUMsZ0JBQWdCO1FBQzdCLFlBQVksRUFBRSx1Q0FBMkI7UUFDekMsT0FBTyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLE9BQU8sRUFBRTtRQUN6QixNQUFNLEVBQUU7WUFDUCxNQUFNLEVBQUUsMkNBQWlDLENBQUM7WUFDMUMsTUFBTSxFQUFFLHFDQUFpQixDQUFDLEtBQUs7WUFDL0IsT0FBTyxFQUFFLG1EQUE2QiwwQkFBaUI7U0FDdkQ7S0FDRCxDQUFDLENBQUMsQ0FBQztJQUVKLElBQUEsd0NBQXFCLEVBQUMsSUFBSSxXQUFXLENBQUM7UUFDckMsRUFBRSxFQUFFLG9CQUFRLENBQUMsZ0JBQWdCO1FBQzdCLFlBQVksRUFBRSx1Q0FBMkI7UUFDekMsT0FBTyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLE9BQU8sRUFBRTtRQUN6QixNQUFNLEVBQUU7WUFDUCxNQUFNLEVBQUUsMkNBQWlDLENBQUM7WUFDMUMsTUFBTSxFQUFFLDJCQUFjLENBQUMsR0FBRyxDQUFDLHFDQUFpQixDQUFDLEtBQUssRUFBRSx5Q0FBNkIsQ0FBQztZQUNsRixPQUFPLHVCQUFlO1NBQ3RCO0tBQ0QsQ0FBQyxDQUFDLENBQUM7SUFFSixJQUFBLHdDQUFxQixFQUFDLElBQUksV0FBVyxDQUFDO1FBQ3JDLEVBQUUsRUFBRSxvQkFBUSxDQUFDLGdCQUFnQjtRQUM3QixZQUFZLEVBQUUsdUNBQTJCO1FBQ3pDLE9BQU8sRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxVQUFVLEVBQUU7UUFDNUIsTUFBTSxFQUFFO1lBQ1AsTUFBTSxFQUFFLDJDQUFpQyxDQUFDO1lBQzFDLE1BQU0sRUFBRSxxQ0FBaUIsQ0FBQyxLQUFLO1lBQy9CLE9BQU8sRUFBRSxnREFBMkIsd0JBQWdCO1NBQ3BEO0tBQ0QsQ0FBQyxDQUFDLENBQUM7SUFFSixJQUFBLHdDQUFxQixFQUFDLElBQUksV0FBVyxDQUFDO1FBQ3JDLEVBQUUsRUFBRSxvQkFBUSxDQUFDLGdCQUFnQjtRQUM3QixZQUFZLEVBQUUsdUNBQTJCO1FBQ3pDLE9BQU8sRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxVQUFVLEVBQUU7UUFDNUIsTUFBTSxFQUFFO1lBQ1AsTUFBTSxFQUFFLDJDQUFpQyxDQUFDO1lBQzFDLE1BQU0sRUFBRSwyQkFBYyxDQUFDLEdBQUcsQ0FBQyxxQ0FBaUIsQ0FBQyxLQUFLLEVBQUUseUNBQTZCLENBQUM7WUFDbEYsT0FBTyxFQUFFLFNBQVM7WUFDbEIsR0FBRyxFQUFFO2dCQUNKLE9BQU8sRUFBRSxpREFBOEI7YUFDdkM7U0FDRDtLQUNELENBQUMsQ0FBQyxDQUFDO0lBRUosSUFBQSx3Q0FBcUIsRUFBQyxJQUFJLFdBQVcsQ0FBQztRQUNyQyxFQUFFLEVBQUUsb0JBQVEsQ0FBQyxzQkFBc0I7UUFDbkMsWUFBWSxFQUFFLHVDQUEyQjtRQUN6QyxPQUFPLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsZ0JBQWdCLEVBQUU7UUFDbEMsTUFBTSxFQUFFO1lBQ1AsTUFBTSxFQUFFLDJDQUFpQyxDQUFDO1lBQzFDLE1BQU0sRUFBRSxxQ0FBaUIsQ0FBQyxLQUFLO1lBQy9CLE9BQU8sRUFBRSw0Q0FBMEI7U0FDbkM7S0FDRCxDQUFDLENBQUMsQ0FBQyJ9