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
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/ui/actionbar/actionbar", "vs/base/browser/ui/button/button", "vs/base/browser/ui/inputbox/inputBox", "vs/base/browser/ui/widget", "vs/base/common/actions", "vs/base/common/async", "vs/base/common/event", "vs/editor/contrib/find/browser/findModel", "vs/nls!vs/workbench/contrib/search/browser/searchWidget", "vs/platform/clipboard/common/clipboardService", "vs/platform/configuration/common/configuration", "vs/platform/contextkey/common/contextkey", "vs/platform/contextview/browser/contextView", "vs/platform/keybinding/common/keybinding", "vs/platform/keybinding/common/keybindingsRegistry", "vs/base/common/themables", "vs/platform/history/browser/contextScopedHistoryWidget", "vs/workbench/contrib/search/browser/searchActionsBase", "vs/workbench/contrib/search/common/constants", "vs/platform/accessibility/common/accessibility", "vs/base/common/platform", "vs/base/browser/ui/toggle/toggle", "vs/workbench/common/views", "vs/workbench/contrib/search/browser/searchIcons", "vs/workbench/contrib/searchEditor/browser/constants", "vs/platform/history/browser/historyWidgetKeybindingHint", "vs/platform/theme/browser/defaultStyles", "vs/workbench/contrib/notebook/browser/contrib/find/findFilters", "vs/platform/instantiation/common/instantiation", "vs/workbench/services/editor/common/editorService", "vs/workbench/contrib/notebook/common/notebookEditorInput", "vs/workbench/contrib/search/browser/searchFindInput"], function (require, exports, dom, actionbar_1, button_1, inputBox_1, widget_1, actions_1, async_1, event_1, findModel_1, nls, clipboardService_1, configuration_1, contextkey_1, contextView_1, keybinding_1, keybindingsRegistry_1, themables_1, contextScopedHistoryWidget_1, searchActionsBase_1, Constants, accessibility_1, platform_1, toggle_1, views_1, searchIcons_1, constants_1, historyWidgetKeybindingHint_1, defaultStyles_1, findFilters_1, instantiation_1, editorService_1, notebookEditorInput_1, searchFindInput_1) {
    "use strict";
    var $NOb_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$OOb = exports.$NOb = void 0;
    /** Specified in searchview.css */
    const SingleLineInputHeight = 26;
    class ReplaceAllAction extends actions_1.$gi {
        static { this.ID = 'search.action.replaceAll'; }
        constructor(a) {
            super(ReplaceAllAction.ID, '', themables_1.ThemeIcon.asClassName(searchIcons_1.$fNb), false);
            this.a = a;
        }
        set searchWidget(searchWidget) {
            this.a = searchWidget;
        }
        run() {
            if (this.a) {
                return this.a.triggerReplaceAll();
            }
            return Promise.resolve(null);
        }
    }
    const ctrlKeyMod = (platform_1.$j ? 256 /* KeyMod.WinCtrl */ : 2048 /* KeyMod.CtrlCmd */);
    function stopPropagationForMultiLineUpwards(event, value, textarea) {
        const isMultiline = !!value.match(/\n/);
        if (textarea && (isMultiline || textarea.clientHeight > SingleLineInputHeight) && textarea.selectionStart > 0) {
            event.stopPropagation();
            return;
        }
    }
    function stopPropagationForMultiLineDownwards(event, value, textarea) {
        const isMultiline = !!value.match(/\n/);
        if (textarea && (isMultiline || textarea.clientHeight > SingleLineInputHeight) && textarea.selectionEnd < textarea.value.length) {
            event.stopPropagation();
            return;
        }
    }
    let $NOb = class $NOb extends widget_1.$IP {
        static { $NOb_1 = this; }
        static { this.a = 134; }
        static { this.b = nls.localize(0, null); }
        static { this.c = (keyBindingService2) => {
            const kb = keyBindingService2.lookupKeybinding(ReplaceAllAction.ID);
            return (0, searchActionsBase_1.$xNb)(nls.localize(1, null), kb);
        }; }
        constructor(container, options, ab, bb, cb, db, eb, fb, gb, hb, ib) {
            super();
            this.ab = ab;
            this.bb = bb;
            this.cb = cb;
            this.db = db;
            this.eb = eb;
            this.fb = fb;
            this.gb = gb;
            this.hb = hb;
            this.ib = ib;
            this.J = false;
            this.L = null;
            this.M = this.B(new event_1.$fd());
            this.onSearchSubmit = this.M.event;
            this.N = this.B(new event_1.$fd());
            this.onSearchCancel = this.N.event;
            this.O = this.B(new event_1.$fd());
            this.onReplaceToggled = this.O.event;
            this.P = this.B(new event_1.$fd());
            this.onReplaceStateChange = this.P.event;
            this.Q = this.B(new event_1.$fd());
            this.onPreserveCaseChange = this.Q.event;
            this.R = this.B(new event_1.$fd());
            this.onReplaceValueChanged = this.R.event;
            this.S = this.B(new event_1.$fd());
            this.onReplaceAll = this.S.event;
            this.U = this.B(new event_1.$fd());
            this.onBlur = this.U.event;
            this.W = this.B(new event_1.$fd());
            this.onDidHeightChange = this.W.event;
            this.X = new event_1.$fd();
            this.onDidToggleContext = this.X.event;
            this.t = Constants.$nOb.bindTo(this.bb);
            this.g = Constants.$jOb.bindTo(this.bb);
            this.n = Constants.$kOb.bindTo(this.bb);
            const notebookOptions = options.notebookOptions ??
                {
                    isInNotebookMarkdownInput: true,
                    isInNotebookMarkdownPreview: true,
                    isInNotebookCellInput: true,
                    isInNotebookCellOutput: true
                };
            this.Z = this.B(new findFilters_1.$vob(notebookOptions.isInNotebookMarkdownInput, notebookOptions.isInNotebookMarkdownPreview, notebookOptions.isInNotebookCellInput, notebookOptions.isInNotebookCellOutput));
            this.B(this.Z.onDidChange(() => {
                if (this.searchInput instanceof searchFindInput_1.$MOb) {
                    this.searchInput.updateStyles();
                }
            }));
            this.B(this.ib.onDidEditorsChange((e) => {
                if (this.searchInput instanceof searchFindInput_1.$MOb &&
                    e.event.editor instanceof notebookEditorInput_1.$zbb &&
                    (e.event.kind === 3 /* GroupModelChangeKind.EDITOR_OPEN */ || e.event.kind === 4 /* GroupModelChangeKind.EDITOR_CLOSE */)) {
                    this.searchInput.filterVisible = this.jb();
                }
            }));
            this.y = new async_1.$Dg(500);
            this.lb(container, options);
            this.eb.onDidChangeConfiguration(e => {
                if (e.affectsConfiguration('editor.accessibilitySupport')) {
                    this.mb();
                }
            });
            this.fb.onDidChangeScreenReaderOptimized(() => this.mb());
            this.mb();
        }
        jb() {
            const editors = this.ib.editors;
            return editors.some(editor => editor instanceof notebookEditorInput_1.$zbb);
        }
        getNotebookFilters() {
            return this.Z;
        }
        focus(select = true, focusReplace = false, suppressGlobalSearchBuffer = false) {
            this.J = suppressGlobalSearchBuffer;
            if (focusReplace && this.isReplaceShown()) {
                if (this.replaceInput) {
                    this.replaceInput.focus();
                    if (select) {
                        this.replaceInput.select();
                    }
                }
            }
            else {
                if (this.searchInput) {
                    this.searchInput.focus();
                    if (select) {
                        this.searchInput.select();
                    }
                }
            }
        }
        setWidth(width) {
            this.searchInput?.inputBox.layout();
            if (this.replaceInput) {
                this.replaceInput.width = width - 28;
                this.replaceInput.inputBox.layout();
            }
        }
        clear() {
            this.searchInput?.clear();
            this.replaceInput?.setValue('');
            this.setReplaceAllActionState(false);
        }
        isReplaceShown() {
            return this.h ? !this.h.classList.contains('disabled') : false;
        }
        isReplaceActive() {
            return !!this.t.get();
        }
        getReplaceValue() {
            return this.replaceInput?.getValue() ?? '';
        }
        toggleReplace(show) {
            if (show === undefined || show !== this.isReplaceShown()) {
                this.rb();
            }
        }
        getSearchHistory() {
            return this.searchInput?.inputBox.getHistory() ?? [];
        }
        getReplaceHistory() {
            return this.replaceInput?.inputBox.getHistory() ?? [];
        }
        prependSearchHistory(history) {
            this.searchInput?.inputBox.prependHistory(history);
        }
        prependReplaceHistory(history) {
            this.replaceInput?.inputBox.prependHistory(history);
        }
        clearHistory() {
            this.searchInput?.inputBox.clearHistory();
            this.replaceInput?.inputBox.clearHistory();
        }
        showNextSearchTerm() {
            this.searchInput?.inputBox.showNextValue();
        }
        showPreviousSearchTerm() {
            this.searchInput?.inputBox.showPreviousValue();
        }
        showNextReplaceTerm() {
            this.replaceInput?.inputBox.showNextValue();
        }
        showPreviousReplaceTerm() {
            this.replaceInput?.inputBox.showPreviousValue();
        }
        searchInputHasFocus() {
            return !!this.g.get();
        }
        replaceInputHasFocus() {
            return !!this.replaceInput?.inputBox.hasFocus();
        }
        focusReplaceAllAction() {
            this.w?.focus(true);
        }
        focusRegexAction() {
            this.searchInput?.focusOnRegex();
        }
        lb(container, options) {
            this.domNode = dom.$0O(container, dom.$('.search-widget'));
            this.domNode.style.position = 'relative';
            if (!options._hideReplaceToggle) {
                this.nb(this.domNode);
            }
            this.ob(this.domNode, options);
            this.qb(this.domNode, options);
        }
        mb() {
            this.searchInput?.setFocusInputOnOptionClick(!this.fb.isScreenReaderOptimized());
        }
        nb(parent) {
            const opts = {
                buttonBackground: undefined,
                buttonBorder: undefined,
                buttonForeground: undefined,
                buttonHoverBackground: undefined,
                buttonSecondaryBackground: undefined,
                buttonSecondaryForeground: undefined,
                buttonSecondaryHoverBackground: undefined,
                buttonSeparator: undefined
            };
            this.r = this.B(new button_1.$7Q(parent, opts));
            this.r.element.setAttribute('aria-expanded', 'false');
            this.r.element.classList.add('toggle-replace-button');
            this.r.icon = searchIcons_1.$dNb;
            // TODO@joao need to dispose this listener eventually
            this.r.onDidClick(() => this.rb());
            this.r.element.title = nls.localize(2, null);
        }
        ob(parent, options) {
            const inputOptions = {
                label: nls.localize(3, null),
                validation: (value) => this.tb(value),
                placeholder: nls.localize(4, null),
                appendCaseSensitiveLabel: (0, searchActionsBase_1.$xNb)('', this.cb.lookupKeybinding(Constants.$SNb)),
                appendWholeWordsLabel: (0, searchActionsBase_1.$xNb)('', this.cb.lookupKeybinding(Constants.$TNb)),
                appendRegexLabel: (0, searchActionsBase_1.$xNb)('', this.cb.lookupKeybinding(Constants.$UNb)),
                history: options.searchHistory,
                showHistoryHint: () => (0, historyWidgetKeybindingHint_1.$L7)(this.cb),
                flexibleHeight: true,
                flexibleMaxHeight: $NOb_1.a,
                showCommonFindToggles: true,
                inputBoxStyles: options.inputBoxStyles,
                toggleStyles: options.toggleStyles
            };
            const searchInputContainer = dom.$0O(parent, dom.$('.search-container.input-box'));
            this.searchInput = this.B(new searchFindInput_1.$MOb(searchInputContainer, this.ab, inputOptions, this.bb, this.gb, this.hb, this.Z, this.jb()));
            this.searchInput.onKeyDown((keyboardEvent) => this.vb(keyboardEvent));
            this.searchInput.setValue(options.value || '');
            this.searchInput.setRegex(!!options.isRegex);
            this.searchInput.setCaseSensitive(!!options.isCaseSensitive);
            this.searchInput.setWholeWords(!!options.isWholeWords);
            this.B(this.searchInput.onCaseSensitiveKeyDown((keyboardEvent) => this.wb(keyboardEvent)));
            this.B(this.searchInput.onRegexKeyDown((keyboardEvent) => this.xb(keyboardEvent)));
            this.B(this.searchInput.inputBox.onDidChange(() => this.ub()));
            this.B(this.searchInput.inputBox.onDidHeightChange(() => this.W.fire()));
            this.B(this.onReplaceValueChanged(() => {
                this.y.trigger(() => this.replaceInput?.inputBox.addToHistory());
            }));
            this.searchInputFocusTracker = this.B(dom.$8O(this.searchInput.inputBox.inputElement));
            this.B(this.searchInputFocusTracker.onDidFocus(async () => {
                this.g.set(true);
                const useGlobalFindBuffer = this.Cb.globalFindClipboard;
                if (!this.J && useGlobalFindBuffer) {
                    const globalBufferText = await this.db.readFindText();
                    if (globalBufferText && this.L !== globalBufferText) {
                        this.searchInput?.inputBox.addToHistory();
                        this.searchInput?.setValue(globalBufferText);
                        this.searchInput?.select();
                    }
                    this.L = globalBufferText;
                }
                this.J = false;
            }));
            this.B(this.searchInputFocusTracker.onDidBlur(() => this.g.set(false)));
            this.Y = new toggle_1.$KQ({
                isChecked: false,
                title: (0, searchActionsBase_1.$xNb)(nls.localize(5, null), this.cb.lookupKeybinding(constants_1.$KOb)),
                icon: searchIcons_1.$cNb,
                ...defaultStyles_1.$m2
            });
            this.B(this.Y.onChange(() => this.pb()));
            if (options.showContextToggle) {
                this.contextLinesInput = new inputBox_1.$sR(searchInputContainer, this.ab, { type: 'number', inputBoxStyles: defaultStyles_1.$s2 });
                this.contextLinesInput.element.classList.add('context-lines-input');
                this.contextLinesInput.value = '' + (this.eb.getValue('search').searchEditor.defaultNumberOfContextLines ?? 1);
                this.B(this.contextLinesInput.onDidChange((value) => {
                    if (value !== '0') {
                        this.Y.checked = true;
                    }
                    this.pb();
                }));
                dom.$0O(searchInputContainer, this.Y.domNode);
            }
        }
        pb() {
            this.X.fire();
            if (this.contextLinesInput.value.includes('-')) {
                this.contextLinesInput.value = '0';
            }
            this.X.fire();
        }
        setContextLines(lines) {
            if (!this.contextLinesInput) {
                return;
            }
            if (lines === 0) {
                this.Y.checked = false;
            }
            else {
                this.Y.checked = true;
                this.contextLinesInput.value = '' + lines;
            }
        }
        qb(parent, options) {
            this.h = dom.$0O(parent, dom.$('.replace-container.disabled'));
            const replaceBox = dom.$0O(this.h, dom.$('.replace-input'));
            this.replaceInput = this.B(new contextScopedHistoryWidget_1.$U5(replaceBox, this.ab, {
                label: nls.localize(6, null),
                placeholder: nls.localize(7, null),
                appendPreserveCaseLabel: (0, searchActionsBase_1.$xNb)('', this.cb.lookupKeybinding(Constants.$VNb)),
                history: options.replaceHistory,
                showHistoryHint: () => (0, historyWidgetKeybindingHint_1.$L7)(this.cb),
                flexibleHeight: true,
                flexibleMaxHeight: $NOb_1.a,
                inputBoxStyles: options.inputBoxStyles,
                toggleStyles: options.toggleStyles
            }, this.bb, true));
            this.B(this.replaceInput.onDidOptionChange(viaKeyboard => {
                if (!viaKeyboard) {
                    if (this.replaceInput) {
                        this.Q.fire(this.replaceInput.getPreserveCase());
                    }
                }
            }));
            this.replaceInput.onKeyDown((keyboardEvent) => this.zb(keyboardEvent));
            this.replaceInput.setValue(options.replaceValue || '');
            this.B(this.replaceInput.inputBox.onDidChange(() => this.R.fire()));
            this.B(this.replaceInput.inputBox.onDidHeightChange(() => this.W.fire()));
            this.s = new ReplaceAllAction(this);
            this.s.label = $NOb_1.b;
            this.w = this.B(new actionbar_1.$1P(this.h));
            this.w.push([this.s], { icon: true, label: false });
            this.z(this.w.domNode, (keyboardEvent) => this.Ab(keyboardEvent));
            this.replaceInputFocusTracker = this.B(dom.$8O(this.replaceInput.inputBox.inputElement));
            this.B(this.replaceInputFocusTracker.onDidFocus(() => this.n.set(true)));
            this.B(this.replaceInputFocusTracker.onDidBlur(() => this.n.set(false)));
            this.B(this.replaceInput.onPreserveCaseKeyDown((keyboardEvent) => this.yb(keyboardEvent)));
        }
        triggerReplaceAll() {
            this.S.fire();
            return Promise.resolve(null);
        }
        rb() {
            this.h?.classList.toggle('disabled');
            if (this.isReplaceShown()) {
                this.r?.element.classList.remove(...themables_1.ThemeIcon.asClassNameArray(searchIcons_1.$dNb));
                this.r?.element.classList.add(...themables_1.ThemeIcon.asClassNameArray(searchIcons_1.$eNb));
            }
            else {
                this.r?.element.classList.remove(...themables_1.ThemeIcon.asClassNameArray(searchIcons_1.$eNb));
                this.r?.element.classList.add(...themables_1.ThemeIcon.asClassNameArray(searchIcons_1.$dNb));
            }
            this.r?.element.setAttribute('aria-expanded', this.isReplaceShown() ? 'true' : 'false');
            this.sb();
            this.O.fire();
        }
        setValue(value) {
            this.searchInput?.setValue(value);
        }
        setReplaceAllActionState(enabled) {
            if (this.s && (this.s.enabled !== enabled)) {
                this.s.enabled = enabled;
                this.s.label = enabled ? $NOb_1.c(this.cb) : $NOb_1.b;
                this.sb();
            }
        }
        sb() {
            const currentState = this.isReplaceActive();
            const newState = this.isReplaceShown() && !!this.s?.enabled;
            if (currentState !== newState) {
                this.t.set(newState);
                this.P.fire(newState);
                this.replaceInput?.inputBox.layout();
            }
        }
        tb(value) {
            if (value.length === 0) {
                return null;
            }
            if (!(this.searchInput?.getRegex())) {
                return null;
            }
            try {
                new RegExp(value, 'u');
            }
            catch (e) {
                return { content: e.message };
            }
            return null;
        }
        ub() {
            this.searchInput?.clearMessage();
            this.setReplaceAllActionState(false);
            if (this.Cb.searchOnType) {
                if (this.searchInput?.getRegex()) {
                    try {
                        const regex = new RegExp(this.searchInput.getValue(), 'ug');
                        const matchienessHeuristic = `
								~!@#$%^&*()_+
								\`1234567890-=
								qwertyuiop[]\\
								QWERTYUIOP{}|
								asdfghjkl;'
								ASDFGHJKL:"
								zxcvbnm,./
								ZXCVBNM<>? `.match(regex)?.length ?? 0;
                        const delayMultiplier = matchienessHeuristic < 50 ? 1 :
                            matchienessHeuristic < 100 ? 5 : // expressions like `.` or `\w`
                                10; // only things matching empty string
                        this.Bb(true, this.Cb.searchOnTypeDebouncePeriod * delayMultiplier);
                    }
                    catch {
                        // pass
                    }
                }
                else {
                    this.Bb(true, this.Cb.searchOnTypeDebouncePeriod);
                }
            }
        }
        vb(keyboardEvent) {
            if (keyboardEvent.equals(ctrlKeyMod | 3 /* KeyCode.Enter */)) {
                this.searchInput?.inputBox.insertAtCursor('\n');
                keyboardEvent.preventDefault();
            }
            if (keyboardEvent.equals(3 /* KeyCode.Enter */)) {
                this.searchInput?.onSearchSubmit();
                this.Bb();
                keyboardEvent.preventDefault();
            }
            else if (keyboardEvent.equals(9 /* KeyCode.Escape */)) {
                this.N.fire({ focus: true });
                keyboardEvent.preventDefault();
            }
            else if (keyboardEvent.equals(2 /* KeyCode.Tab */)) {
                if (this.isReplaceShown()) {
                    this.replaceInput?.focus();
                }
                else {
                    this.searchInput?.focusOnCaseSensitive();
                }
                keyboardEvent.preventDefault();
            }
            else if (keyboardEvent.equals(16 /* KeyCode.UpArrow */)) {
                stopPropagationForMultiLineUpwards(keyboardEvent, this.searchInput?.getValue() ?? '', this.searchInput?.domNode.querySelector('textarea') ?? null);
            }
            else if (keyboardEvent.equals(18 /* KeyCode.DownArrow */)) {
                stopPropagationForMultiLineDownwards(keyboardEvent, this.searchInput?.getValue() ?? '', this.searchInput?.domNode.querySelector('textarea') ?? null);
            }
        }
        wb(keyboardEvent) {
            if (keyboardEvent.equals(1024 /* KeyMod.Shift */ | 2 /* KeyCode.Tab */)) {
                if (this.isReplaceShown()) {
                    this.replaceInput?.focus();
                    keyboardEvent.preventDefault();
                }
            }
        }
        xb(keyboardEvent) {
            if (keyboardEvent.equals(2 /* KeyCode.Tab */)) {
                if (this.isReplaceShown()) {
                    this.replaceInput?.focusOnPreserve();
                    keyboardEvent.preventDefault();
                }
            }
        }
        yb(keyboardEvent) {
            if (keyboardEvent.equals(2 /* KeyCode.Tab */)) {
                if (this.isReplaceActive()) {
                    this.focusReplaceAllAction();
                }
                else {
                    this.U.fire();
                }
                keyboardEvent.preventDefault();
            }
            else if (keyboardEvent.equals(1024 /* KeyMod.Shift */ | 2 /* KeyCode.Tab */)) {
                this.focusRegexAction();
                keyboardEvent.preventDefault();
            }
        }
        zb(keyboardEvent) {
            if (keyboardEvent.equals(ctrlKeyMod | 3 /* KeyCode.Enter */)) {
                this.replaceInput?.inputBox.insertAtCursor('\n');
                keyboardEvent.preventDefault();
            }
            if (keyboardEvent.equals(3 /* KeyCode.Enter */)) {
                this.Bb();
                keyboardEvent.preventDefault();
            }
            else if (keyboardEvent.equals(2 /* KeyCode.Tab */)) {
                this.searchInput?.focusOnCaseSensitive();
                keyboardEvent.preventDefault();
            }
            else if (keyboardEvent.equals(1024 /* KeyMod.Shift */ | 2 /* KeyCode.Tab */)) {
                this.searchInput?.focus();
                keyboardEvent.preventDefault();
            }
            else if (keyboardEvent.equals(16 /* KeyCode.UpArrow */)) {
                stopPropagationForMultiLineUpwards(keyboardEvent, this.replaceInput?.getValue() ?? '', this.replaceInput?.domNode.querySelector('textarea') ?? null);
            }
            else if (keyboardEvent.equals(18 /* KeyCode.DownArrow */)) {
                stopPropagationForMultiLineDownwards(keyboardEvent, this.replaceInput?.getValue() ?? '', this.replaceInput?.domNode.querySelector('textarea') ?? null);
            }
        }
        Ab(keyboardEvent) {
            if (keyboardEvent.equals(1024 /* KeyMod.Shift */ | 2 /* KeyCode.Tab */)) {
                this.focusRegexAction();
                keyboardEvent.preventDefault();
            }
        }
        async Bb(triggeredOnType = false, delay = 0) {
            this.searchInput?.validate();
            if (!this.searchInput?.inputBox.isInputValid()) {
                return;
            }
            const value = this.searchInput.getValue();
            const useGlobalFindBuffer = this.Cb.globalFindClipboard;
            if (value && useGlobalFindBuffer) {
                await this.db.writeFindText(value);
            }
            this.M.fire({ triggeredOnType, delay });
        }
        getContextLines() {
            return this.Y.checked ? +this.contextLinesInput.value : 0;
        }
        modifyContextLines(increase) {
            const current = +this.contextLinesInput.value;
            const modified = current + (increase ? 1 : -1);
            this.Y.checked = modified !== 0;
            this.contextLinesInput.value = '' + modified;
        }
        toggleContextLines() {
            this.Y.checked = !this.Y.checked;
            this.pb();
        }
        dispose() {
            this.setReplaceAllActionState(false);
            super.dispose();
        }
        get Cb() {
            return this.eb.getValue('search');
        }
    };
    exports.$NOb = $NOb;
    exports.$NOb = $NOb = $NOb_1 = __decorate([
        __param(2, contextView_1.$VZ),
        __param(3, contextkey_1.$3i),
        __param(4, keybinding_1.$2D),
        __param(5, clipboardService_1.$UZ),
        __param(6, configuration_1.$8h),
        __param(7, accessibility_1.$1r),
        __param(8, contextView_1.$WZ),
        __param(9, instantiation_1.$Ah),
        __param(10, editorService_1.$9C)
    ], $NOb);
    function $OOb() {
        keybindingsRegistry_1.$Nu.registerCommandAndKeybindingRule({
            id: ReplaceAllAction.ID,
            weight: 200 /* KeybindingWeight.WorkbenchContrib */,
            when: contextkey_1.$Ii.and(Constants.$gOb, Constants.$nOb, findModel_1.$z7),
            primary: 512 /* KeyMod.Alt */ | 2048 /* KeyMod.CtrlCmd */ | 3 /* KeyCode.Enter */,
            handler: accessor => {
                const viewsService = accessor.get(views_1.$$E);
                if ((0, searchActionsBase_1.$wNb)(viewsService)) {
                    const searchView = (0, searchActionsBase_1.$yNb)(viewsService);
                    if (searchView) {
                        new ReplaceAllAction(searchView.searchAndReplaceWidget).run();
                    }
                }
            }
        });
    }
    exports.$OOb = $OOb;
});
//# sourceMappingURL=searchWidget.js.map