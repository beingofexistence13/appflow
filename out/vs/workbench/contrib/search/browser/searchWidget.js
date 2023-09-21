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
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/ui/actionbar/actionbar", "vs/base/browser/ui/button/button", "vs/base/browser/ui/inputbox/inputBox", "vs/base/browser/ui/widget", "vs/base/common/actions", "vs/base/common/async", "vs/base/common/event", "vs/editor/contrib/find/browser/findModel", "vs/nls", "vs/platform/clipboard/common/clipboardService", "vs/platform/configuration/common/configuration", "vs/platform/contextkey/common/contextkey", "vs/platform/contextview/browser/contextView", "vs/platform/keybinding/common/keybinding", "vs/platform/keybinding/common/keybindingsRegistry", "vs/base/common/themables", "vs/platform/history/browser/contextScopedHistoryWidget", "vs/workbench/contrib/search/browser/searchActionsBase", "vs/workbench/contrib/search/common/constants", "vs/platform/accessibility/common/accessibility", "vs/base/common/platform", "vs/base/browser/ui/toggle/toggle", "vs/workbench/common/views", "vs/workbench/contrib/search/browser/searchIcons", "vs/workbench/contrib/searchEditor/browser/constants", "vs/platform/history/browser/historyWidgetKeybindingHint", "vs/platform/theme/browser/defaultStyles", "vs/workbench/contrib/notebook/browser/contrib/find/findFilters", "vs/platform/instantiation/common/instantiation", "vs/workbench/services/editor/common/editorService", "vs/workbench/contrib/notebook/common/notebookEditorInput", "vs/workbench/contrib/search/browser/searchFindInput"], function (require, exports, dom, actionbar_1, button_1, inputBox_1, widget_1, actions_1, async_1, event_1, findModel_1, nls, clipboardService_1, configuration_1, contextkey_1, contextView_1, keybinding_1, keybindingsRegistry_1, themables_1, contextScopedHistoryWidget_1, searchActionsBase_1, Constants, accessibility_1, platform_1, toggle_1, views_1, searchIcons_1, constants_1, historyWidgetKeybindingHint_1, defaultStyles_1, findFilters_1, instantiation_1, editorService_1, notebookEditorInput_1, searchFindInput_1) {
    "use strict";
    var SearchWidget_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.registerContributions = exports.SearchWidget = void 0;
    /** Specified in searchview.css */
    const SingleLineInputHeight = 26;
    class ReplaceAllAction extends actions_1.Action {
        static { this.ID = 'search.action.replaceAll'; }
        constructor(_searchWidget) {
            super(ReplaceAllAction.ID, '', themables_1.ThemeIcon.asClassName(searchIcons_1.searchReplaceAllIcon), false);
            this._searchWidget = _searchWidget;
        }
        set searchWidget(searchWidget) {
            this._searchWidget = searchWidget;
        }
        run() {
            if (this._searchWidget) {
                return this._searchWidget.triggerReplaceAll();
            }
            return Promise.resolve(null);
        }
    }
    const ctrlKeyMod = (platform_1.isMacintosh ? 256 /* KeyMod.WinCtrl */ : 2048 /* KeyMod.CtrlCmd */);
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
    let SearchWidget = class SearchWidget extends widget_1.Widget {
        static { SearchWidget_1 = this; }
        static { this.INPUT_MAX_HEIGHT = 134; }
        static { this.REPLACE_ALL_DISABLED_LABEL = nls.localize('search.action.replaceAll.disabled.label', "Replace All (Submit Search to Enable)"); }
        static { this.REPLACE_ALL_ENABLED_LABEL = (keyBindingService2) => {
            const kb = keyBindingService2.lookupKeybinding(ReplaceAllAction.ID);
            return (0, searchActionsBase_1.appendKeyBindingLabel)(nls.localize('search.action.replaceAll.enabled.label', "Replace All"), kb);
        }; }
        constructor(container, options, contextViewService, contextKeyService, keybindingService, clipboardServce, configurationService, accessibilityService, contextMenuService, instantiationService, editorService) {
            super();
            this.contextViewService = contextViewService;
            this.contextKeyService = contextKeyService;
            this.keybindingService = keybindingService;
            this.clipboardServce = clipboardServce;
            this.configurationService = configurationService;
            this.accessibilityService = accessibilityService;
            this.contextMenuService = contextMenuService;
            this.instantiationService = instantiationService;
            this.editorService = editorService;
            this.ignoreGlobalFindBufferOnNextFocus = false;
            this.previousGlobalFindBufferValue = null;
            this._onSearchSubmit = this._register(new event_1.Emitter());
            this.onSearchSubmit = this._onSearchSubmit.event;
            this._onSearchCancel = this._register(new event_1.Emitter());
            this.onSearchCancel = this._onSearchCancel.event;
            this._onReplaceToggled = this._register(new event_1.Emitter());
            this.onReplaceToggled = this._onReplaceToggled.event;
            this._onReplaceStateChange = this._register(new event_1.Emitter());
            this.onReplaceStateChange = this._onReplaceStateChange.event;
            this._onPreserveCaseChange = this._register(new event_1.Emitter());
            this.onPreserveCaseChange = this._onPreserveCaseChange.event;
            this._onReplaceValueChanged = this._register(new event_1.Emitter());
            this.onReplaceValueChanged = this._onReplaceValueChanged.event;
            this._onReplaceAll = this._register(new event_1.Emitter());
            this.onReplaceAll = this._onReplaceAll.event;
            this._onBlur = this._register(new event_1.Emitter());
            this.onBlur = this._onBlur.event;
            this._onDidHeightChange = this._register(new event_1.Emitter());
            this.onDidHeightChange = this._onDidHeightChange.event;
            this._onDidToggleContext = new event_1.Emitter();
            this.onDidToggleContext = this._onDidToggleContext.event;
            this.replaceActive = Constants.ReplaceActiveKey.bindTo(this.contextKeyService);
            this.searchInputBoxFocused = Constants.SearchInputBoxFocusedKey.bindTo(this.contextKeyService);
            this.replaceInputBoxFocused = Constants.ReplaceInputBoxFocusedKey.bindTo(this.contextKeyService);
            const notebookOptions = options.notebookOptions ??
                {
                    isInNotebookMarkdownInput: true,
                    isInNotebookMarkdownPreview: true,
                    isInNotebookCellInput: true,
                    isInNotebookCellOutput: true
                };
            this._notebookFilters = this._register(new findFilters_1.NotebookFindFilters(notebookOptions.isInNotebookMarkdownInput, notebookOptions.isInNotebookMarkdownPreview, notebookOptions.isInNotebookCellInput, notebookOptions.isInNotebookCellOutput));
            this._register(this._notebookFilters.onDidChange(() => {
                if (this.searchInput instanceof searchFindInput_1.SearchFindInput) {
                    this.searchInput.updateStyles();
                }
            }));
            this._register(this.editorService.onDidEditorsChange((e) => {
                if (this.searchInput instanceof searchFindInput_1.SearchFindInput &&
                    e.event.editor instanceof notebookEditorInput_1.NotebookEditorInput &&
                    (e.event.kind === 3 /* GroupModelChangeKind.EDITOR_OPEN */ || e.event.kind === 4 /* GroupModelChangeKind.EDITOR_CLOSE */)) {
                    this.searchInput.filterVisible = this._hasNotebookOpen();
                }
            }));
            this._replaceHistoryDelayer = new async_1.Delayer(500);
            this.render(container, options);
            this.configurationService.onDidChangeConfiguration(e => {
                if (e.affectsConfiguration('editor.accessibilitySupport')) {
                    this.updateAccessibilitySupport();
                }
            });
            this.accessibilityService.onDidChangeScreenReaderOptimized(() => this.updateAccessibilitySupport());
            this.updateAccessibilitySupport();
        }
        _hasNotebookOpen() {
            const editors = this.editorService.editors;
            return editors.some(editor => editor instanceof notebookEditorInput_1.NotebookEditorInput);
        }
        getNotebookFilters() {
            return this._notebookFilters;
        }
        focus(select = true, focusReplace = false, suppressGlobalSearchBuffer = false) {
            this.ignoreGlobalFindBufferOnNextFocus = suppressGlobalSearchBuffer;
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
            return this.replaceContainer ? !this.replaceContainer.classList.contains('disabled') : false;
        }
        isReplaceActive() {
            return !!this.replaceActive.get();
        }
        getReplaceValue() {
            return this.replaceInput?.getValue() ?? '';
        }
        toggleReplace(show) {
            if (show === undefined || show !== this.isReplaceShown()) {
                this.onToggleReplaceButton();
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
            return !!this.searchInputBoxFocused.get();
        }
        replaceInputHasFocus() {
            return !!this.replaceInput?.inputBox.hasFocus();
        }
        focusReplaceAllAction() {
            this.replaceActionBar?.focus(true);
        }
        focusRegexAction() {
            this.searchInput?.focusOnRegex();
        }
        render(container, options) {
            this.domNode = dom.append(container, dom.$('.search-widget'));
            this.domNode.style.position = 'relative';
            if (!options._hideReplaceToggle) {
                this.renderToggleReplaceButton(this.domNode);
            }
            this.renderSearchInput(this.domNode, options);
            this.renderReplaceInput(this.domNode, options);
        }
        updateAccessibilitySupport() {
            this.searchInput?.setFocusInputOnOptionClick(!this.accessibilityService.isScreenReaderOptimized());
        }
        renderToggleReplaceButton(parent) {
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
            this.toggleReplaceButton = this._register(new button_1.Button(parent, opts));
            this.toggleReplaceButton.element.setAttribute('aria-expanded', 'false');
            this.toggleReplaceButton.element.classList.add('toggle-replace-button');
            this.toggleReplaceButton.icon = searchIcons_1.searchHideReplaceIcon;
            // TODO@joao need to dispose this listener eventually
            this.toggleReplaceButton.onDidClick(() => this.onToggleReplaceButton());
            this.toggleReplaceButton.element.title = nls.localize('search.replace.toggle.button.title', "Toggle Replace");
        }
        renderSearchInput(parent, options) {
            const inputOptions = {
                label: nls.localize('label.Search', 'Search: Type Search Term and press Enter to search'),
                validation: (value) => this.validateSearchInput(value),
                placeholder: nls.localize('search.placeHolder', "Search"),
                appendCaseSensitiveLabel: (0, searchActionsBase_1.appendKeyBindingLabel)('', this.keybindingService.lookupKeybinding(Constants.ToggleCaseSensitiveCommandId)),
                appendWholeWordsLabel: (0, searchActionsBase_1.appendKeyBindingLabel)('', this.keybindingService.lookupKeybinding(Constants.ToggleWholeWordCommandId)),
                appendRegexLabel: (0, searchActionsBase_1.appendKeyBindingLabel)('', this.keybindingService.lookupKeybinding(Constants.ToggleRegexCommandId)),
                history: options.searchHistory,
                showHistoryHint: () => (0, historyWidgetKeybindingHint_1.showHistoryKeybindingHint)(this.keybindingService),
                flexibleHeight: true,
                flexibleMaxHeight: SearchWidget_1.INPUT_MAX_HEIGHT,
                showCommonFindToggles: true,
                inputBoxStyles: options.inputBoxStyles,
                toggleStyles: options.toggleStyles
            };
            const searchInputContainer = dom.append(parent, dom.$('.search-container.input-box'));
            this.searchInput = this._register(new searchFindInput_1.SearchFindInput(searchInputContainer, this.contextViewService, inputOptions, this.contextKeyService, this.contextMenuService, this.instantiationService, this._notebookFilters, this._hasNotebookOpen()));
            this.searchInput.onKeyDown((keyboardEvent) => this.onSearchInputKeyDown(keyboardEvent));
            this.searchInput.setValue(options.value || '');
            this.searchInput.setRegex(!!options.isRegex);
            this.searchInput.setCaseSensitive(!!options.isCaseSensitive);
            this.searchInput.setWholeWords(!!options.isWholeWords);
            this._register(this.searchInput.onCaseSensitiveKeyDown((keyboardEvent) => this.onCaseSensitiveKeyDown(keyboardEvent)));
            this._register(this.searchInput.onRegexKeyDown((keyboardEvent) => this.onRegexKeyDown(keyboardEvent)));
            this._register(this.searchInput.inputBox.onDidChange(() => this.onSearchInputChanged()));
            this._register(this.searchInput.inputBox.onDidHeightChange(() => this._onDidHeightChange.fire()));
            this._register(this.onReplaceValueChanged(() => {
                this._replaceHistoryDelayer.trigger(() => this.replaceInput?.inputBox.addToHistory());
            }));
            this.searchInputFocusTracker = this._register(dom.trackFocus(this.searchInput.inputBox.inputElement));
            this._register(this.searchInputFocusTracker.onDidFocus(async () => {
                this.searchInputBoxFocused.set(true);
                const useGlobalFindBuffer = this.searchConfiguration.globalFindClipboard;
                if (!this.ignoreGlobalFindBufferOnNextFocus && useGlobalFindBuffer) {
                    const globalBufferText = await this.clipboardServce.readFindText();
                    if (globalBufferText && this.previousGlobalFindBufferValue !== globalBufferText) {
                        this.searchInput?.inputBox.addToHistory();
                        this.searchInput?.setValue(globalBufferText);
                        this.searchInput?.select();
                    }
                    this.previousGlobalFindBufferValue = globalBufferText;
                }
                this.ignoreGlobalFindBufferOnNextFocus = false;
            }));
            this._register(this.searchInputFocusTracker.onDidBlur(() => this.searchInputBoxFocused.set(false)));
            this.showContextToggle = new toggle_1.Toggle({
                isChecked: false,
                title: (0, searchActionsBase_1.appendKeyBindingLabel)(nls.localize('showContext', "Toggle Context Lines"), this.keybindingService.lookupKeybinding(constants_1.ToggleSearchEditorContextLinesCommandId)),
                icon: searchIcons_1.searchShowContextIcon,
                ...defaultStyles_1.defaultToggleStyles
            });
            this._register(this.showContextToggle.onChange(() => this.onContextLinesChanged()));
            if (options.showContextToggle) {
                this.contextLinesInput = new inputBox_1.InputBox(searchInputContainer, this.contextViewService, { type: 'number', inputBoxStyles: defaultStyles_1.defaultInputBoxStyles });
                this.contextLinesInput.element.classList.add('context-lines-input');
                this.contextLinesInput.value = '' + (this.configurationService.getValue('search').searchEditor.defaultNumberOfContextLines ?? 1);
                this._register(this.contextLinesInput.onDidChange((value) => {
                    if (value !== '0') {
                        this.showContextToggle.checked = true;
                    }
                    this.onContextLinesChanged();
                }));
                dom.append(searchInputContainer, this.showContextToggle.domNode);
            }
        }
        onContextLinesChanged() {
            this._onDidToggleContext.fire();
            if (this.contextLinesInput.value.includes('-')) {
                this.contextLinesInput.value = '0';
            }
            this._onDidToggleContext.fire();
        }
        setContextLines(lines) {
            if (!this.contextLinesInput) {
                return;
            }
            if (lines === 0) {
                this.showContextToggle.checked = false;
            }
            else {
                this.showContextToggle.checked = true;
                this.contextLinesInput.value = '' + lines;
            }
        }
        renderReplaceInput(parent, options) {
            this.replaceContainer = dom.append(parent, dom.$('.replace-container.disabled'));
            const replaceBox = dom.append(this.replaceContainer, dom.$('.replace-input'));
            this.replaceInput = this._register(new contextScopedHistoryWidget_1.ContextScopedReplaceInput(replaceBox, this.contextViewService, {
                label: nls.localize('label.Replace', 'Replace: Type replace term and press Enter to preview'),
                placeholder: nls.localize('search.replace.placeHolder', "Replace"),
                appendPreserveCaseLabel: (0, searchActionsBase_1.appendKeyBindingLabel)('', this.keybindingService.lookupKeybinding(Constants.TogglePreserveCaseId)),
                history: options.replaceHistory,
                showHistoryHint: () => (0, historyWidgetKeybindingHint_1.showHistoryKeybindingHint)(this.keybindingService),
                flexibleHeight: true,
                flexibleMaxHeight: SearchWidget_1.INPUT_MAX_HEIGHT,
                inputBoxStyles: options.inputBoxStyles,
                toggleStyles: options.toggleStyles
            }, this.contextKeyService, true));
            this._register(this.replaceInput.onDidOptionChange(viaKeyboard => {
                if (!viaKeyboard) {
                    if (this.replaceInput) {
                        this._onPreserveCaseChange.fire(this.replaceInput.getPreserveCase());
                    }
                }
            }));
            this.replaceInput.onKeyDown((keyboardEvent) => this.onReplaceInputKeyDown(keyboardEvent));
            this.replaceInput.setValue(options.replaceValue || '');
            this._register(this.replaceInput.inputBox.onDidChange(() => this._onReplaceValueChanged.fire()));
            this._register(this.replaceInput.inputBox.onDidHeightChange(() => this._onDidHeightChange.fire()));
            this.replaceAllAction = new ReplaceAllAction(this);
            this.replaceAllAction.label = SearchWidget_1.REPLACE_ALL_DISABLED_LABEL;
            this.replaceActionBar = this._register(new actionbar_1.ActionBar(this.replaceContainer));
            this.replaceActionBar.push([this.replaceAllAction], { icon: true, label: false });
            this.onkeydown(this.replaceActionBar.domNode, (keyboardEvent) => this.onReplaceActionbarKeyDown(keyboardEvent));
            this.replaceInputFocusTracker = this._register(dom.trackFocus(this.replaceInput.inputBox.inputElement));
            this._register(this.replaceInputFocusTracker.onDidFocus(() => this.replaceInputBoxFocused.set(true)));
            this._register(this.replaceInputFocusTracker.onDidBlur(() => this.replaceInputBoxFocused.set(false)));
            this._register(this.replaceInput.onPreserveCaseKeyDown((keyboardEvent) => this.onPreserveCaseKeyDown(keyboardEvent)));
        }
        triggerReplaceAll() {
            this._onReplaceAll.fire();
            return Promise.resolve(null);
        }
        onToggleReplaceButton() {
            this.replaceContainer?.classList.toggle('disabled');
            if (this.isReplaceShown()) {
                this.toggleReplaceButton?.element.classList.remove(...themables_1.ThemeIcon.asClassNameArray(searchIcons_1.searchHideReplaceIcon));
                this.toggleReplaceButton?.element.classList.add(...themables_1.ThemeIcon.asClassNameArray(searchIcons_1.searchShowReplaceIcon));
            }
            else {
                this.toggleReplaceButton?.element.classList.remove(...themables_1.ThemeIcon.asClassNameArray(searchIcons_1.searchShowReplaceIcon));
                this.toggleReplaceButton?.element.classList.add(...themables_1.ThemeIcon.asClassNameArray(searchIcons_1.searchHideReplaceIcon));
            }
            this.toggleReplaceButton?.element.setAttribute('aria-expanded', this.isReplaceShown() ? 'true' : 'false');
            this.updateReplaceActiveState();
            this._onReplaceToggled.fire();
        }
        setValue(value) {
            this.searchInput?.setValue(value);
        }
        setReplaceAllActionState(enabled) {
            if (this.replaceAllAction && (this.replaceAllAction.enabled !== enabled)) {
                this.replaceAllAction.enabled = enabled;
                this.replaceAllAction.label = enabled ? SearchWidget_1.REPLACE_ALL_ENABLED_LABEL(this.keybindingService) : SearchWidget_1.REPLACE_ALL_DISABLED_LABEL;
                this.updateReplaceActiveState();
            }
        }
        updateReplaceActiveState() {
            const currentState = this.isReplaceActive();
            const newState = this.isReplaceShown() && !!this.replaceAllAction?.enabled;
            if (currentState !== newState) {
                this.replaceActive.set(newState);
                this._onReplaceStateChange.fire(newState);
                this.replaceInput?.inputBox.layout();
            }
        }
        validateSearchInput(value) {
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
        onSearchInputChanged() {
            this.searchInput?.clearMessage();
            this.setReplaceAllActionState(false);
            if (this.searchConfiguration.searchOnType) {
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
                        this.submitSearch(true, this.searchConfiguration.searchOnTypeDebouncePeriod * delayMultiplier);
                    }
                    catch {
                        // pass
                    }
                }
                else {
                    this.submitSearch(true, this.searchConfiguration.searchOnTypeDebouncePeriod);
                }
            }
        }
        onSearchInputKeyDown(keyboardEvent) {
            if (keyboardEvent.equals(ctrlKeyMod | 3 /* KeyCode.Enter */)) {
                this.searchInput?.inputBox.insertAtCursor('\n');
                keyboardEvent.preventDefault();
            }
            if (keyboardEvent.equals(3 /* KeyCode.Enter */)) {
                this.searchInput?.onSearchSubmit();
                this.submitSearch();
                keyboardEvent.preventDefault();
            }
            else if (keyboardEvent.equals(9 /* KeyCode.Escape */)) {
                this._onSearchCancel.fire({ focus: true });
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
        onCaseSensitiveKeyDown(keyboardEvent) {
            if (keyboardEvent.equals(1024 /* KeyMod.Shift */ | 2 /* KeyCode.Tab */)) {
                if (this.isReplaceShown()) {
                    this.replaceInput?.focus();
                    keyboardEvent.preventDefault();
                }
            }
        }
        onRegexKeyDown(keyboardEvent) {
            if (keyboardEvent.equals(2 /* KeyCode.Tab */)) {
                if (this.isReplaceShown()) {
                    this.replaceInput?.focusOnPreserve();
                    keyboardEvent.preventDefault();
                }
            }
        }
        onPreserveCaseKeyDown(keyboardEvent) {
            if (keyboardEvent.equals(2 /* KeyCode.Tab */)) {
                if (this.isReplaceActive()) {
                    this.focusReplaceAllAction();
                }
                else {
                    this._onBlur.fire();
                }
                keyboardEvent.preventDefault();
            }
            else if (keyboardEvent.equals(1024 /* KeyMod.Shift */ | 2 /* KeyCode.Tab */)) {
                this.focusRegexAction();
                keyboardEvent.preventDefault();
            }
        }
        onReplaceInputKeyDown(keyboardEvent) {
            if (keyboardEvent.equals(ctrlKeyMod | 3 /* KeyCode.Enter */)) {
                this.replaceInput?.inputBox.insertAtCursor('\n');
                keyboardEvent.preventDefault();
            }
            if (keyboardEvent.equals(3 /* KeyCode.Enter */)) {
                this.submitSearch();
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
        onReplaceActionbarKeyDown(keyboardEvent) {
            if (keyboardEvent.equals(1024 /* KeyMod.Shift */ | 2 /* KeyCode.Tab */)) {
                this.focusRegexAction();
                keyboardEvent.preventDefault();
            }
        }
        async submitSearch(triggeredOnType = false, delay = 0) {
            this.searchInput?.validate();
            if (!this.searchInput?.inputBox.isInputValid()) {
                return;
            }
            const value = this.searchInput.getValue();
            const useGlobalFindBuffer = this.searchConfiguration.globalFindClipboard;
            if (value && useGlobalFindBuffer) {
                await this.clipboardServce.writeFindText(value);
            }
            this._onSearchSubmit.fire({ triggeredOnType, delay });
        }
        getContextLines() {
            return this.showContextToggle.checked ? +this.contextLinesInput.value : 0;
        }
        modifyContextLines(increase) {
            const current = +this.contextLinesInput.value;
            const modified = current + (increase ? 1 : -1);
            this.showContextToggle.checked = modified !== 0;
            this.contextLinesInput.value = '' + modified;
        }
        toggleContextLines() {
            this.showContextToggle.checked = !this.showContextToggle.checked;
            this.onContextLinesChanged();
        }
        dispose() {
            this.setReplaceAllActionState(false);
            super.dispose();
        }
        get searchConfiguration() {
            return this.configurationService.getValue('search');
        }
    };
    exports.SearchWidget = SearchWidget;
    exports.SearchWidget = SearchWidget = SearchWidget_1 = __decorate([
        __param(2, contextView_1.IContextViewService),
        __param(3, contextkey_1.IContextKeyService),
        __param(4, keybinding_1.IKeybindingService),
        __param(5, clipboardService_1.IClipboardService),
        __param(6, configuration_1.IConfigurationService),
        __param(7, accessibility_1.IAccessibilityService),
        __param(8, contextView_1.IContextMenuService),
        __param(9, instantiation_1.IInstantiationService),
        __param(10, editorService_1.IEditorService)
    ], SearchWidget);
    function registerContributions() {
        keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
            id: ReplaceAllAction.ID,
            weight: 200 /* KeybindingWeight.WorkbenchContrib */,
            when: contextkey_1.ContextKeyExpr.and(Constants.SearchViewVisibleKey, Constants.ReplaceActiveKey, findModel_1.CONTEXT_FIND_WIDGET_NOT_VISIBLE),
            primary: 512 /* KeyMod.Alt */ | 2048 /* KeyMod.CtrlCmd */ | 3 /* KeyCode.Enter */,
            handler: accessor => {
                const viewsService = accessor.get(views_1.IViewsService);
                if ((0, searchActionsBase_1.isSearchViewFocused)(viewsService)) {
                    const searchView = (0, searchActionsBase_1.getSearchView)(viewsService);
                    if (searchView) {
                        new ReplaceAllAction(searchView.searchAndReplaceWidget).run();
                    }
                }
            }
        });
    }
    exports.registerContributions = registerContributions;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VhcmNoV2lkZ2V0LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvc2VhcmNoL2Jyb3dzZXIvc2VhcmNoV2lkZ2V0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7Ozs7SUEwQ2hHLGtDQUFrQztJQUNsQyxNQUFNLHFCQUFxQixHQUFHLEVBQUUsQ0FBQztJQXlCakMsTUFBTSxnQkFBaUIsU0FBUSxnQkFBTTtpQkFFcEIsT0FBRSxHQUFXLDBCQUEwQixDQUFDO1FBRXhELFlBQW9CLGFBQTJCO1lBQzlDLEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLHFCQUFTLENBQUMsV0FBVyxDQUFDLGtDQUFvQixDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFEaEUsa0JBQWEsR0FBYixhQUFhLENBQWM7UUFFL0MsQ0FBQztRQUVELElBQUksWUFBWSxDQUFDLFlBQTBCO1lBQzFDLElBQUksQ0FBQyxhQUFhLEdBQUcsWUFBWSxDQUFDO1FBQ25DLENBQUM7UUFFUSxHQUFHO1lBQ1gsSUFBSSxJQUFJLENBQUMsYUFBYSxFQUFFO2dCQUN2QixPQUFPLElBQUksQ0FBQyxhQUFhLENBQUMsaUJBQWlCLEVBQUUsQ0FBQzthQUM5QztZQUNELE9BQU8sT0FBTyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUM5QixDQUFDOztJQUdGLE1BQU0sVUFBVSxHQUFHLENBQUMsc0JBQVcsQ0FBQyxDQUFDLDBCQUFnQixDQUFDLDBCQUFlLENBQUMsQ0FBQztJQUVuRSxTQUFTLGtDQUFrQyxDQUFDLEtBQXFCLEVBQUUsS0FBYSxFQUFFLFFBQW9DO1FBQ3JILE1BQU0sV0FBVyxHQUFHLENBQUMsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3hDLElBQUksUUFBUSxJQUFJLENBQUMs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