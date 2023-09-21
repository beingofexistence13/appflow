/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/ui/aria/aria", "vs/base/browser/ui/toggle/toggle", "vs/base/browser/ui/sash/sash", "vs/base/browser/ui/widget", "vs/base/common/async", "vs/base/common/codicons", "vs/base/common/errors", "vs/base/common/lifecycle", "vs/base/common/platform", "vs/base/common/strings", "vs/editor/common/core/range", "vs/editor/contrib/find/browser/findModel", "vs/nls", "vs/platform/history/browser/contextScopedHistoryWidget", "vs/platform/history/browser/historyWidgetKeybindingHint", "vs/platform/theme/common/colorRegistry", "vs/platform/theme/common/iconRegistry", "vs/platform/theme/common/themeService", "vs/base/common/themables", "vs/platform/theme/common/theme", "vs/base/common/types", "vs/platform/theme/browser/defaultStyles", "vs/css!./findWidget"], function (require, exports, dom, aria_1, toggle_1, sash_1, widget_1, async_1, codicons_1, errors_1, lifecycle_1, platform, strings, range_1, findModel_1, nls, contextScopedHistoryWidget_1, historyWidgetKeybindingHint_1, colorRegistry_1, iconRegistry_1, themeService_1, themables_1, theme_1, types_1, defaultStyles_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SimpleButton = exports.FindWidget = exports.FindWidgetViewZone = exports.NLS_NO_RESULTS = exports.NLS_MATCHES_LOCATION = exports.findNextMatchIcon = exports.findPreviousMatchIcon = exports.findReplaceAllIcon = exports.findReplaceIcon = void 0;
    const findSelectionIcon = (0, iconRegistry_1.registerIcon)('find-selection', codicons_1.Codicon.selection, nls.localize('findSelectionIcon', 'Icon for \'Find in Selection\' in the editor find widget.'));
    const findCollapsedIcon = (0, iconRegistry_1.registerIcon)('find-collapsed', codicons_1.Codicon.chevronRight, nls.localize('findCollapsedIcon', 'Icon to indicate that the editor find widget is collapsed.'));
    const findExpandedIcon = (0, iconRegistry_1.registerIcon)('find-expanded', codicons_1.Codicon.chevronDown, nls.localize('findExpandedIcon', 'Icon to indicate that the editor find widget is expanded.'));
    exports.findReplaceIcon = (0, iconRegistry_1.registerIcon)('find-replace', codicons_1.Codicon.replace, nls.localize('findReplaceIcon', 'Icon for \'Replace\' in the editor find widget.'));
    exports.findReplaceAllIcon = (0, iconRegistry_1.registerIcon)('find-replace-all', codicons_1.Codicon.replaceAll, nls.localize('findReplaceAllIcon', 'Icon for \'Replace All\' in the editor find widget.'));
    exports.findPreviousMatchIcon = (0, iconRegistry_1.registerIcon)('find-previous-match', codicons_1.Codicon.arrowUp, nls.localize('findPreviousMatchIcon', 'Icon for \'Find Previous\' in the editor find widget.'));
    exports.findNextMatchIcon = (0, iconRegistry_1.registerIcon)('find-next-match', codicons_1.Codicon.arrowDown, nls.localize('findNextMatchIcon', 'Icon for \'Find Next\' in the editor find widget.'));
    const NLS_FIND_DIALOG_LABEL = nls.localize('label.findDialog', "Find / Replace");
    const NLS_FIND_INPUT_LABEL = nls.localize('label.find', "Find");
    const NLS_FIND_INPUT_PLACEHOLDER = nls.localize('placeholder.find', "Find");
    const NLS_PREVIOUS_MATCH_BTN_LABEL = nls.localize('label.previousMatchButton', "Previous Match");
    const NLS_NEXT_MATCH_BTN_LABEL = nls.localize('label.nextMatchButton', "Next Match");
    const NLS_TOGGLE_SELECTION_FIND_TITLE = nls.localize('label.toggleSelectionFind', "Find in Selection");
    const NLS_CLOSE_BTN_LABEL = nls.localize('label.closeButton', "Close");
    const NLS_REPLACE_INPUT_LABEL = nls.localize('label.replace', "Replace");
    const NLS_REPLACE_INPUT_PLACEHOLDER = nls.localize('placeholder.replace', "Replace");
    const NLS_REPLACE_BTN_LABEL = nls.localize('label.replaceButton', "Replace");
    const NLS_REPLACE_ALL_BTN_LABEL = nls.localize('label.replaceAllButton', "Replace All");
    const NLS_TOGGLE_REPLACE_MODE_BTN_LABEL = nls.localize('label.toggleReplaceButton', "Toggle Replace");
    const NLS_MATCHES_COUNT_LIMIT_TITLE = nls.localize('title.matchesCountLimit', "Only the first {0} results are highlighted, but all find operations work on the entire text.", findModel_1.MATCHES_LIMIT);
    exports.NLS_MATCHES_LOCATION = nls.localize('label.matchesLocation', "{0} of {1}");
    exports.NLS_NO_RESULTS = nls.localize('label.noResults', "No results");
    const FIND_WIDGET_INITIAL_WIDTH = 419;
    const PART_WIDTH = 275;
    const FIND_INPUT_AREA_WIDTH = PART_WIDTH - 54;
    let MAX_MATCHES_COUNT_WIDTH = 69;
    // let FIND_ALL_CONTROLS_WIDTH = 17/** Find Input margin-left */ + (MAX_MATCHES_COUNT_WIDTH + 3 + 1) /** Match Results */ + 23 /** Button */ * 4 + 2/** sash */;
    const FIND_INPUT_AREA_HEIGHT = 33; // The height of Find Widget when Replace Input is not visible.
    const ctrlEnterReplaceAllWarningPromptedKey = 'ctrlEnterReplaceAll.windows.donotask';
    const ctrlKeyMod = (platform.isMacintosh ? 256 /* KeyMod.WinCtrl */ : 2048 /* KeyMod.CtrlCmd */);
    class FindWidgetViewZone {
        constructor(afterLineNumber) {
            this.afterLineNumber = afterLineNumber;
            this.heightInPx = FIND_INPUT_AREA_HEIGHT;
            this.suppressMouseDown = false;
            this.domNode = document.createElement('div');
            this.domNode.className = 'dock-find-viewzone';
        }
    }
    exports.FindWidgetViewZone = FindWidgetViewZone;
    function stopPropagationForMultiLineUpwards(event, value, textarea) {
        const isMultiline = !!value.match(/\n/);
        if (textarea && isMultiline && textarea.selectionStart > 0) {
            event.stopPropagation();
            return;
        }
    }
    function stopPropagationForMultiLineDownwards(event, value, textarea) {
        const isMultiline = !!value.match(/\n/);
        if (textarea && isMultiline && textarea.selectionEnd < textarea.value.length) {
            event.stopPropagation();
            return;
        }
    }
    class FindWidget extends widget_1.Widget {
        static { this.ID = 'editor.contrib.findWidget'; }
        constructor(codeEditor, controller, state, contextViewProvider, keybindingService, contextKeyService, themeService, storageService, notificationService) {
            super();
            this._cachedHeight = null;
            this._revealTimeouts = [];
            this._codeEditor = codeEditor;
            this._controller = controller;
            this._state = state;
            this._contextViewProvider = contextViewProvider;
            this._keybindingService = keybindingService;
            this._contextKeyService = contextKeyService;
            this._storageService = storageService;
            this._notificationService = notificationService;
            this._ctrlEnterReplaceAllWarningPrompted = !!storageService.getBoolean(ctrlEnterReplaceAllWarningPromptedKey, 0 /* StorageScope.PROFILE */);
            this._isVisible = false;
            this._isReplaceVisible = false;
            this._ignoreChangeEvent = false;
            this._updateHistoryDelayer = new async_1.Delayer(500);
            this._register((0, lifecycle_1.toDisposable)(() => this._updateHistoryDelayer.cancel()));
            this._register(this._state.onFindReplaceStateChange((e) => this._onStateChanged(e)));
            this._buildDomNode();
            this._updateButtons();
            this._tryUpdateWidgetWidth();
            this._findInput.inputBox.layout();
            this._register(this._codeEditor.onDidChangeConfiguration((e) => {
                if (e.hasChanged(90 /* EditorOption.readOnly */)) {
                    if (this._codeEditor.getOption(90 /* EditorOption.readOnly */)) {
                        // Hide replace part if editor becomes read only
                        this._state.change({ isReplaceRevealed: false }, false);
                    }
                    this._updateButtons();
                }
                if (e.hasChanged(143 /* EditorOption.layoutInfo */)) {
                    this._tryUpdateWidgetWidth();
                }
                if (e.hasChanged(2 /* EditorOption.accessibilitySupport */)) {
                    this.updateAccessibilitySupport();
                }
                if (e.hasChanged(41 /* EditorOption.find */)) {
                    const supportLoop = this._codeEditor.getOption(41 /* EditorOption.find */).loop;
                    this._state.change({ loop: supportLoop }, false);
                    const addExtraSpaceOnTop = this._codeEditor.getOption(41 /* EditorOption.find */).addExtraSpaceOnTop;
                    if (addExtraSpaceOnTop && !this._viewZone) {
                        this._viewZone = new FindWidgetViewZone(0);
                        this._showViewZone();
                    }
                    if (!addExtraSpaceOnTop && this._viewZone) {
                        this._removeViewZone();
                    }
                }
            }));
            this.updateAccessibilitySupport();
            this._register(this._codeEditor.onDidChangeCursorSelection(() => {
                if (this._isVisible) {
                    this._updateToggleSelectionFindButton();
                }
            }));
            this._register(this._codeEditor.onDidFocusEditorWidget(async () => {
                if (this._isVisible) {
                    const globalBufferTerm = await this._controller.getGlobalBufferTerm();
                    if (globalBufferTerm && globalBufferTerm !== this._state.searchString) {
                        this._state.change({ searchString: globalBufferTerm }, false);
                        this._findInput.select();
                    }
                }
            }));
            this._findInputFocused = findModel_1.CONTEXT_FIND_INPUT_FOCUSED.bindTo(contextKeyService);
            this._findFocusTracker = this._register(dom.trackFocus(this._findInput.inputBox.inputElement));
            this._register(this._findFocusTracker.onDidFocus(() => {
                this._findInputFocused.set(true);
                this._updateSearchScope();
            }));
            this._register(this._findFocusTracker.onDidBlur(() => {
                this._findInputFocused.set(false);
            }));
            this._replaceInputFocused = findModel_1.CONTEXT_REPLACE_INPUT_FOCUSED.bindTo(contextKeyService);
            this._replaceFocusTracker = this._register(dom.trackFocus(this._replaceInput.inputBox.inputElement));
            this._register(this._replaceFocusTracker.onDidFocus(() => {
                this._replaceInputFocused.set(true);
                this._updateSearchScope();
            }));
            this._register(this._replaceFocusTracker.onDidBlur(() => {
                this._replaceInputFocused.set(false);
            }));
            this._codeEditor.addOverlayWidget(this);
            if (this._codeEditor.getOption(41 /* EditorOption.find */).addExtraSpaceOnTop) {
                this._viewZone = new FindWidgetViewZone(0); // Put it before the first line then users can scroll beyond the first line.
            }
            this._register(this._codeEditor.onDidChangeModel(() => {
                if (!this._isVisible) {
                    return;
                }
                this._viewZoneId = undefined;
            }));
            this._register(this._codeEditor.onDidScrollChange((e) => {
                if (e.scrollTopChanged) {
                    this._layoutViewZone();
                    return;
                }
                // for other scroll changes, layout the viewzone in next tick to avoid ruining current rendering.
                setTimeout(() => {
                    this._layoutViewZone();
                }, 0);
            }));
        }
        // ----- IOverlayWidget API
        getId() {
            return FindWidget.ID;
        }
        getDomNode() {
            return this._domNode;
        }
        getPosition() {
            if (this._isVisible) {
                return {
                    preference: 0 /* OverlayWidgetPositionPreference.TOP_RIGHT_CORNER */
                };
            }
            return null;
        }
        // ----- React to state changes
        _onStateChanged(e) {
            if (e.searchString) {
                try {
                    this._ignoreChangeEvent = true;
                    this._findInput.setValue(this._state.searchString);
                }
                finally {
                    this._ignoreChangeEvent = false;
                }
                this._updateButtons();
            }
            if (e.replaceString) {
                this._replaceInput.inputBox.value = this._state.replaceString;
            }
            if (e.isRevealed) {
                if (this._state.isRevealed) {
                    this._reveal();
                }
                else {
                    this._hide(true);
                }
            }
            if (e.isReplaceRevealed) {
                if (this._state.isReplaceRevealed) {
                    if (!this._codeEditor.getOption(90 /* EditorOption.readOnly */) && !this._isReplaceVisible) {
                        this._isReplaceVisible = true;
                        this._replaceInput.width = dom.getTotalWidth(this._findInput.domNode);
                        this._updateButtons();
                        this._replaceInput.inputBox.layout();
                    }
                }
                else {
                    if (this._isReplaceVisible) {
                        this._isReplaceVisible = false;
                        this._updateButtons();
                    }
                }
            }
            if ((e.isRevealed || e.isReplaceRevealed) && (this._state.isRevealed || this._state.isReplaceRevealed)) {
                if (this._tryUpdateHeight()) {
                    this._showViewZone();
                }
            }
            if (e.isRegex) {
                this._findInput.setRegex(this._state.isRegex);
            }
            if (e.wholeWord) {
                this._findInput.setWholeWords(this._state.wholeWord);
            }
            if (e.matchCase) {
                this._findInput.setCaseSensitive(this._state.matchCase);
            }
            if (e.preserveCase) {
                this._replaceInput.setPreserveCase(this._state.preserveCase);
            }
            if (e.searchScope) {
                if (this._state.searchScope) {
                    this._toggleSelectionFind.checked = true;
                }
                else {
                    this._toggleSelectionFind.checked = false;
                }
                this._updateToggleSelectionFindButton();
            }
            if (e.searchString || e.matchesCount || e.matchesPosition) {
                const showRedOutline = (this._state.searchString.length > 0 && this._state.matchesCount === 0);
                this._domNode.classList.toggle('no-results', showRedOutline);
                this._updateMatchesCount();
                this._updateButtons();
            }
            if (e.searchString || e.currentMatch) {
                this._layoutViewZone();
            }
            if (e.updateHistory) {
                this._delayedUpdateHistory();
            }
            if (e.loop) {
                this._updateButtons();
            }
        }
        _delayedUpdateHistory() {
            this._updateHistoryDelayer.trigger(this._updateHistory.bind(this)).then(undefined, errors_1.onUnexpectedError);
        }
        _updateHistory() {
            if (this._state.searchString) {
                this._findInput.inputBox.addToHistory();
            }
            if (this._state.replaceString) {
                this._replaceInput.inputBox.addToHistory();
            }
        }
        _updateMatchesCount() {
            this._matchesCount.style.minWidth = MAX_MATCHES_COUNT_WIDTH + 'px';
            if (this._state.matchesCount >= findModel_1.MATCHES_LIMIT) {
                this._matchesCount.title = NLS_MATCHES_COUNT_LIMIT_TITLE;
            }
            else {
                this._matchesCount.title = '';
            }
            // remove previous content
            if (this._matchesCount.firstChild) {
                this._matchesCount.removeChild(this._matchesCount.firstChild);
            }
            let label;
            if (this._state.matchesCount > 0) {
                let matchesCount = String(this._state.matchesCount);
                if (this._state.matchesCount >= findModel_1.MATCHES_LIMIT) {
                    matchesCount += '+';
                }
                let matchesPosition = String(this._state.matchesPosition);
                if (matchesPosition === '0') {
                    matchesPosition = '?';
                }
                label = strings.format(exports.NLS_MATCHES_LOCATION, matchesPosition, matchesCount);
            }
            else {
                label = exports.NLS_NO_RESULTS;
            }
            this._matchesCount.appendChild(document.createTextNode(label));
            (0, aria_1.alert)(this._getAriaLabel(label, this._state.currentMatch, this._state.searchString));
            MAX_MATCHES_COUNT_WIDTH = Math.max(MAX_MATCHES_COUNT_WIDTH, this._matchesCount.clientWidth);
        }
        // ----- actions
        _getAriaLabel(label, currentMatch, searchString) {
            if (label === exports.NLS_NO_RESULTS) {
                return searchString === ''
                    ? nls.localize('ariaSearchNoResultEmpty', "{0} found", label)
                    : nls.localize('ariaSearchNoResult', "{0} found for '{1}'", label, searchString);
            }
            if (currentMatch) {
                const ariaLabel = nls.localize('ariaSearchNoResultWithLineNum', "{0} found for '{1}', at {2}", label, searchString, currentMatch.startLineNumber + ':' + currentMatch.startColumn);
                const model = this._codeEditor.getModel();
                if (model && (currentMatch.startLineNumber <= model.getLineCount()) && (currentMatch.startLineNumber >= 1)) {
                    const lineContent = model.getLineContent(currentMatch.startLineNumber);
                    return `${lineContent}, ${ariaLabel}`;
                }
                return ariaLabel;
            }
            return nls.localize('ariaSearchNoResultWithLineNumNoCurrentMatch', "{0} found for '{1}'", label, searchString);
        }
        /**
         * If 'selection find' is ON we should not disable the button (its function is to cancel 'selection find').
         * If 'selection find' is OFF we enable the button only if there is a selection.
         */
        _updateToggleSelectionFindButton() {
            const selection = this._codeEditor.getSelection();
            const isSelection = selection ? (selection.startLineNumber !== selection.endLineNumber || selection.startColumn !== selection.endColumn) : false;
            const isChecked = this._toggleSelectionFind.checked;
            if (this._isVisible && (isChecked || isSelection)) {
                this._toggleSelectionFind.enable();
            }
            else {
                this._toggleSelectionFind.disable();
            }
        }
        _updateButtons() {
            this._findInput.setEnabled(this._isVisible);
            this._replaceInput.setEnabled(this._isVisible && this._isReplaceVisible);
            this._updateToggleSelectionFindButton();
            this._closeBtn.setEnabled(this._isVisible);
            const findInputIsNonEmpty = (this._state.searchString.length > 0);
            const matchesCount = this._state.matchesCount ? true : false;
            this._prevBtn.setEnabled(this._isVisible && findInputIsNonEmpty && matchesCount && this._state.canNavigateBack());
            this._nextBtn.setEnabled(this._isVisible && findInputIsNonEmpty && matchesCount && this._state.canNavigateForward());
            this._replaceBtn.setEnabled(this._isVisible && this._isReplaceVisible && findInputIsNonEmpty);
            this._replaceAllBtn.setEnabled(this._isVisible && this._isReplaceVisible && findInputIsNonEmpty);
            this._domNode.classList.toggle('replaceToggled', this._isReplaceVisible);
            this._toggleReplaceBtn.setExpanded(this._isReplaceVisible);
            const canReplace = !this._codeEditor.getOption(90 /* EditorOption.readOnly */);
            this._toggleReplaceBtn.setEnabled(this._isVisible && canReplace);
        }
        _reveal() {
            this._revealTimeouts.forEach(e => {
                clearTimeout(e);
            });
            this._revealTimeouts = [];
            if (!this._isVisible) {
                this._isVisible = true;
                const selection = this._codeEditor.getSelection();
                switch (this._codeEditor.getOption(41 /* EditorOption.find */).autoFindInSelection) {
                    case 'always':
                        this._toggleSelectionFind.checked = true;
                        break;
                    case 'never':
                        this._toggleSelectionFind.checked = false;
                        break;
                    case 'multiline': {
                        const isSelectionMultipleLine = !!selection && selection.startLineNumber !== selection.endLineNumber;
                        this._toggleSelectionFind.checked = isSelectionMultipleLine;
                        break;
                    }
                    default:
                        break;
                }
                this._tryUpdateWidgetWidth();
                this._updateButtons();
                this._revealTimeouts.push(setTimeout(() => {
                    this._domNode.classList.add('visible');
                    this._domNode.setAttribute('aria-hidden', 'false');
                }, 0));
                // validate query again as it's being dismissed when we hide the find widget.
                this._revealTimeouts.push(setTimeout(() => {
                    this._findInput.validate();
                }, 200));
                this._codeEditor.layoutOverlayWidget(this);
                let adjustEditorScrollTop = true;
                if (this._codeEditor.getOption(41 /* EditorOption.find */).seedSearchStringFromSelection && selection) {
                    const domNode = this._codeEditor.getDomNode();
                    if (domNode) {
                        const editorCoords = dom.getDomNodePagePosition(domNode);
                        const startCoords = this._codeEditor.getScrolledVisiblePosition(selection.getStartPosition());
                        const startLeft = editorCoords.left + (startCoords ? startCoords.left : 0);
                        const startTop = startCoords ? startCoords.top : 0;
                        if (this._viewZone && startTop < this._viewZone.heightInPx) {
                            if (selection.endLineNumber > selection.startLineNumber) {
                                adjustEditorScrollTop = false;
                            }
                            const leftOfFindWidget = dom.getTopLeftOffset(this._domNode).left;
                            if (startLeft > leftOfFindWidget) {
                                adjustEditorScrollTop = false;
                            }
                            const endCoords = this._codeEditor.getScrolledVisiblePosition(selection.getEndPosition());
                            const endLeft = editorCoords.left + (endCoords ? endCoords.left : 0);
                            if (endLeft > leftOfFindWidget) {
                                adjustEditorScrollTop = false;
                            }
                        }
                    }
                }
                this._showViewZone(adjustEditorScrollTop);
            }
        }
        _hide(focusTheEditor) {
            this._revealTimeouts.forEach(e => {
                clearTimeout(e);
            });
            this._revealTimeouts = [];
            if (this._isVisible) {
                this._isVisible = false;
                this._updateButtons();
                this._domNode.classList.remove('visible');
                this._domNode.setAttribute('aria-hidden', 'true');
                this._findInput.clearMessage();
                if (focusTheEditor) {
                    this._codeEditor.focus();
                }
                this._codeEditor.layoutOverlayWidget(this);
                this._removeViewZone();
            }
        }
        _layoutViewZone(targetScrollTop) {
            const addExtraSpaceOnTop = this._codeEditor.getOption(41 /* EditorOption.find */).addExtraSpaceOnTop;
            if (!addExtraSpaceOnTop) {
                this._removeViewZone();
                return;
            }
            if (!this._isVisible) {
                return;
            }
            const viewZone = this._viewZone;
            if (this._viewZoneId !== undefined || !viewZone) {
                return;
            }
            this._codeEditor.changeViewZones((accessor) => {
                viewZone.heightInPx = this._getHeight();
                this._viewZoneId = accessor.addZone(viewZone);
                // scroll top adjust to make sure the editor doesn't scroll when adding viewzone at the beginning.
                this._codeEditor.setScrollTop(targetScrollTop || this._codeEditor.getScrollTop() + viewZone.heightInPx);
            });
        }
        _showViewZone(adjustScroll = true) {
            if (!this._isVisible) {
                return;
            }
            const addExtraSpaceOnTop = this._codeEditor.getOption(41 /* EditorOption.find */).addExtraSpaceOnTop;
            if (!addExtraSpaceOnTop) {
                return;
            }
            if (this._viewZone === undefined) {
                this._viewZone = new FindWidgetViewZone(0);
            }
            const viewZone = this._viewZone;
            this._codeEditor.changeViewZones((accessor) => {
                if (this._viewZoneId !== undefined) {
                    // the view zone already exists, we need to update the height
                    const newHeight = this._getHeight();
                    if (newHeight === viewZone.heightInPx) {
                        return;
                    }
                    const scrollAdjustment = newHeight - viewZone.heightInPx;
                    viewZone.heightInPx = newHeight;
                    accessor.layoutZone(this._viewZoneId);
                    if (adjustScroll) {
                        this._codeEditor.setScrollTop(this._codeEditor.getScrollTop() + scrollAdjustment);
                    }
                    return;
                }
                else {
                    let scrollAdjustment = this._getHeight();
                    // if the editor has top padding, factor that into the zone height
                    scrollAdjustment -= this._codeEditor.getOption(83 /* EditorOption.padding */).top;
                    if (scrollAdjustment <= 0) {
                        return;
                    }
                    viewZone.heightInPx = scrollAdjustment;
                    this._viewZoneId = accessor.addZone(viewZone);
                    if (adjustScroll) {
                        this._codeEditor.setScrollTop(this._codeEditor.getScrollTop() + scrollAdjustment);
                    }
                }
            });
        }
        _removeViewZone() {
            this._codeEditor.changeViewZones((accessor) => {
                if (this._viewZoneId !== undefined) {
                    accessor.removeZone(this._viewZoneId);
                    this._viewZoneId = undefined;
                    if (this._viewZone) {
                        this._codeEditor.setScrollTop(this._codeEditor.getScrollTop() - this._viewZone.heightInPx);
                        this._viewZone = undefined;
                    }
                }
            });
        }
        _tryUpdateWidgetWidth() {
            if (!this._isVisible) {
                return;
            }
            if (!dom.isInDOM(this._domNode)) {
                // the widget is not in the DOM
                return;
            }
            const layoutInfo = this._codeEditor.getLayoutInfo();
            const editorContentWidth = layoutInfo.contentWidth;
            if (editorContentWidth <= 0) {
                // for example, diff view original editor
                this._domNode.classList.add('hiddenEditor');
                return;
            }
            else if (this._domNode.classList.contains('hiddenEditor')) {
                this._domNode.classList.remove('hiddenEditor');
            }
            const editorWidth = layoutInfo.width;
            const minimapWidth = layoutInfo.minimap.minimapWidth;
            let collapsedFindWidget = false;
            let reducedFindWidget = false;
            let narrowFindWidget = false;
            if (this._resized) {
                const widgetWidth = dom.getTotalWidth(this._domNode);
                if (widgetWidth > FIND_WIDGET_INITIAL_WIDTH) {
                    // as the widget is resized by users, we may need to change the max width of the widget as the editor width changes.
                    this._domNode.style.maxWidth = `${editorWidth - 28 - minimapWidth - 15}px`;
                    this._replaceInput.width = dom.getTotalWidth(this._findInput.domNode);
                    return;
                }
            }
            if (FIND_WIDGET_INITIAL_WIDTH + 28 + minimapWidth >= editorWidth) {
                reducedFindWidget = true;
            }
            if (FIND_WIDGET_INITIAL_WIDTH + 28 + minimapWidth - MAX_MATCHES_COUNT_WIDTH >= editorWidth) {
                narrowFindWidget = true;
            }
            if (FIND_WIDGET_INITIAL_WIDTH + 28 + minimapWidth - MAX_MATCHES_COUNT_WIDTH >= editorWidth + 50) {
                collapsedFindWidget = true;
            }
            this._domNode.classList.toggle('collapsed-find-widget', collapsedFindWidget);
            this._domNode.classList.toggle('narrow-find-widget', narrowFindWidget);
            this._domNode.classList.toggle('reduced-find-widget', reducedFindWidget);
            if (!narrowFindWidget && !collapsedFindWidget) {
                // the minimal left offset of findwidget is 15px.
                this._domNode.style.maxWidth = `${editorWidth - 28 - minimapWidth - 15}px`;
            }
            this._findInput.layout({ collapsedFindWidget, narrowFindWidget, reducedFindWidget });
            if (this._resized) {
                const findInputWidth = this._findInput.inputBox.element.clientWidth;
                if (findInputWidth > 0) {
                    this._replaceInput.width = findInputWidth;
                }
            }
            else if (this._isReplaceVisible) {
                this._replaceInput.width = dom.getTotalWidth(this._findInput.domNode);
            }
        }
        _getHeight() {
            let totalheight = 0;
            // find input margin top
            totalheight += 4;
            // find input height
            totalheight += this._findInput.inputBox.height + 2 /** input box border */;
            if (this._isReplaceVisible) {
                // replace input margin
                totalheight += 4;
                totalheight += this._replaceInput.inputBox.height + 2 /** input box border */;
            }
            // margin bottom
            totalheight += 4;
            return totalheight;
        }
        _tryUpdateHeight() {
            const totalHeight = this._getHeight();
            if (this._cachedHeight !== null && this._cachedHeight === totalHeight) {
                return false;
            }
            this._cachedHeight = totalHeight;
            this._domNode.style.height = `${totalHeight}px`;
            return true;
        }
        // ----- Public
        focusFindInput() {
            this._findInput.select();
            // Edge browser requires focus() in addition to select()
            this._findInput.focus();
        }
        focusReplaceInput() {
            this._replaceInput.select();
            // Edge browser requires focus() in addition to select()
            this._replaceInput.focus();
        }
        highlightFindOptions() {
            this._findInput.highlightFindOptions();
        }
        _updateSearchScope() {
            if (!this._codeEditor.hasModel()) {
                return;
            }
            if (this._toggleSelectionFind.checked) {
                const selections = this._codeEditor.getSelections();
                selections.map(selection => {
                    if (selection.endColumn === 1 && selection.endLineNumber > selection.startLineNumber) {
                        selection = selection.setEndPosition(selection.endLineNumber - 1, this._codeEditor.getModel().getLineMaxColumn(selection.endLineNumber - 1));
                    }
                    const currentMatch = this._state.currentMatch;
                    if (selection.startLineNumber !== selection.endLineNumber) {
                        if (!range_1.Range.equalsRange(selection, currentMatch)) {
                            return selection;
                        }
                    }
                    return null;
                }).filter(element => !!element);
                if (selections.length) {
                    this._state.change({ searchScope: selections }, true);
                }
            }
        }
        _onFindInputMouseDown(e) {
            // on linux, middle key does pasting.
            if (e.middleButton) {
                e.stopPropagation();
            }
        }
        _onFindInputKeyDown(e) {
            if (e.equals(ctrlKeyMod | 3 /* KeyCode.Enter */)) {
                if (this._keybindingService.dispatchEvent(e, e.target)) {
                    e.preventDefault();
                    return;
                }
                else {
                    this._findInput.inputBox.insertAtCursor('\n');
                    e.preventDefault();
                    return;
                }
            }
            if (e.equals(2 /* KeyCode.Tab */)) {
                if (this._isReplaceVisible) {
                    this._replaceInput.focus();
                }
                else {
                    this._findInput.focusOnCaseSensitive();
                }
                e.preventDefault();
                return;
            }
            if (e.equals(2048 /* KeyMod.CtrlCmd */ | 18 /* KeyCode.DownArrow */)) {
                this._codeEditor.focus();
                e.preventDefault();
                return;
            }
            if (e.equals(16 /* KeyCode.UpArrow */)) {
                return stopPropagationForMultiLineUpwards(e, this._findInput.getValue(), this._findInput.domNode.querySelector('textarea'));
            }
            if (e.equals(18 /* KeyCode.DownArrow */)) {
                return stopPropagationForMultiLineDownwards(e, this._findInput.getValue(), this._findInput.domNode.querySelector('textarea'));
            }
        }
        _onReplaceInputKeyDown(e) {
            if (e.equals(ctrlKeyMod | 3 /* KeyCode.Enter */)) {
                if (this._keybindingService.dispatchEvent(e, e.target)) {
                    e.preventDefault();
                    return;
                }
                else {
                    if (platform.isWindows && platform.isNative && !this._ctrlEnterReplaceAllWarningPrompted) {
                        // this is the first time when users press Ctrl + Enter to replace all
                        this._notificationService.info(nls.localize('ctrlEnter.keybindingChanged', 'Ctrl+Enter now inserts line break instead of replacing all. You can modify the keybinding for editor.action.replaceAll to override this behavior.'));
                        this._ctrlEnterReplaceAllWarningPrompted = true;
                        this._storageService.store(ctrlEnterReplaceAllWarningPromptedKey, true, 0 /* StorageScope.PROFILE */, 0 /* StorageTarget.USER */);
                    }
                    this._replaceInput.inputBox.insertAtCursor('\n');
                    e.preventDefault();
                    return;
                }
            }
            if (e.equals(2 /* KeyCode.Tab */)) {
                this._findInput.focusOnCaseSensitive();
                e.preventDefault();
                return;
            }
            if (e.equals(1024 /* KeyMod.Shift */ | 2 /* KeyCode.Tab */)) {
                this._findInput.focus();
                e.preventDefault();
                return;
            }
            if (e.equals(2048 /* KeyMod.CtrlCmd */ | 18 /* KeyCode.DownArrow */)) {
                this._codeEditor.focus();
                e.preventDefault();
                return;
            }
            if (e.equals(16 /* KeyCode.UpArrow */)) {
                return stopPropagationForMultiLineUpwards(e, this._replaceInput.inputBox.value, this._replaceInput.inputBox.element.querySelector('textarea'));
            }
            if (e.equals(18 /* KeyCode.DownArrow */)) {
                return stopPropagationForMultiLineDownwards(e, this._replaceInput.inputBox.value, this._replaceInput.inputBox.element.querySelector('textarea'));
            }
        }
        // ----- sash
        getVerticalSashLeft(_sash) {
            return 0;
        }
        // ----- initialization
        _keybindingLabelFor(actionId) {
            const kb = this._keybindingService.lookupKeybinding(actionId);
            if (!kb) {
                return '';
            }
            return ` (${kb.getLabel()})`;
        }
        _buildDomNode() {
            const flexibleHeight = true;
            const flexibleWidth = true;
            // Find input
            this._findInput = this._register(new contextScopedHistoryWidget_1.ContextScopedFindInput(null, this._contextViewProvider, {
                width: FIND_INPUT_AREA_WIDTH,
                label: NLS_FIND_INPUT_LABEL,
                placeholder: NLS_FIND_INPUT_PLACEHOLDER,
                appendCaseSensitiveLabel: this._keybindingLabelFor(findModel_1.FIND_IDS.ToggleCaseSensitiveCommand),
                appendWholeWordsLabel: this._keybindingLabelFor(findModel_1.FIND_IDS.ToggleWholeWordCommand),
                appendRegexLabel: this._keybindingLabelFor(findModel_1.FIND_IDS.ToggleRegexCommand),
                validation: (value) => {
                    if (value.length === 0 || !this._findInput.getRegex()) {
                        return null;
                    }
                    try {
                        // use `g` and `u` which are also used by the TextModel search
                        new RegExp(value, 'gu');
                        return null;
                    }
                    catch (e) {
                        return { content: e.message };
                    }
                },
                flexibleHeight,
                flexibleWidth,
                flexibleMaxHeight: 118,
                showCommonFindToggles: true,
                showHistoryHint: () => (0, historyWidgetKeybindingHint_1.showHistoryKeybindingHint)(this._keybindingService),
                inputBoxStyles: defaultStyles_1.defaultInputBoxStyles,
                toggleStyles: defaultStyles_1.defaultToggleStyles
            }, this._contextKeyService));
            this._findInput.setRegex(!!this._state.isRegex);
            this._findInput.setCaseSensitive(!!this._state.matchCase);
            this._findInput.setWholeWords(!!this._state.wholeWord);
            this._register(this._findInput.onKeyDown((e) => this._onFindInputKeyDown(e)));
            this._register(this._findInput.inputBox.onDidChange(() => {
                if (this._ignoreChangeEvent) {
                    return;
                }
                this._state.change({ searchString: this._findInput.getValue() }, true);
            }));
            this._register(this._findInput.onDidOptionChange(() => {
                this._state.change({
                    isRegex: this._findInput.getRegex(),
                    wholeWord: this._findInput.getWholeWords(),
                    matchCase: this._findInput.getCaseSensitive()
                }, true);
            }));
            this._register(this._findInput.onCaseSensitiveKeyDown((e) => {
                if (e.equals(1024 /* KeyMod.Shift */ | 2 /* KeyCode.Tab */)) {
                    if (this._isReplaceVisible) {
                        this._replaceInput.focus();
                        e.preventDefault();
                    }
                }
            }));
            this._register(this._findInput.onRegexKeyDown((e) => {
                if (e.equals(2 /* KeyCode.Tab */)) {
                    if (this._isReplaceVisible) {
                        this._replaceInput.focusOnPreserve();
                        e.preventDefault();
                    }
                }
            }));
            this._register(this._findInput.inputBox.onDidHeightChange((e) => {
                if (this._tryUpdateHeight()) {
                    this._showViewZone();
                }
            }));
            if (platform.isLinux) {
                this._register(this._findInput.onMouseDown((e) => this._onFindInputMouseDown(e)));
            }
            this._matchesCount = document.createElement('div');
            this._matchesCount.className = 'matchesCount';
            this._updateMatchesCount();
            // Previous button
            this._prevBtn = this._register(new SimpleButton({
                label: NLS_PREVIOUS_MATCH_BTN_LABEL + this._keybindingLabelFor(findModel_1.FIND_IDS.PreviousMatchFindAction),
                icon: exports.findPreviousMatchIcon,
                onTrigger: () => {
                    (0, types_1.assertIsDefined)(this._codeEditor.getAction(findModel_1.FIND_IDS.PreviousMatchFindAction)).run().then(undefined, errors_1.onUnexpectedError);
                }
            }));
            // Next button
            this._nextBtn = this._register(new SimpleButton({
                label: NLS_NEXT_MATCH_BTN_LABEL + this._keybindingLabelFor(findModel_1.FIND_IDS.NextMatchFindAction),
                icon: exports.findNextMatchIcon,
                onTrigger: () => {
                    (0, types_1.assertIsDefined)(this._codeEditor.getAction(findModel_1.FIND_IDS.NextMatchFindAction)).run().then(undefined, errors_1.onUnexpectedError);
                }
            }));
            const findPart = document.createElement('div');
            findPart.className = 'find-part';
            findPart.appendChild(this._findInput.domNode);
            const actionsContainer = document.createElement('div');
            actionsContainer.className = 'find-actions';
            findPart.appendChild(actionsContainer);
            actionsContainer.appendChild(this._matchesCount);
            actionsContainer.appendChild(this._prevBtn.domNode);
            actionsContainer.appendChild(this._nextBtn.domNode);
            // Toggle selection button
            this._toggleSelectionFind = this._register(new toggle_1.Toggle({
                icon: findSelectionIcon,
                title: NLS_TOGGLE_SELECTION_FIND_TITLE + this._keybindingLabelFor(findModel_1.FIND_IDS.ToggleSearchScopeCommand),
                isChecked: false,
                inputActiveOptionBackground: (0, colorRegistry_1.asCssVariable)(colorRegistry_1.inputActiveOptionBackground),
                inputActiveOptionBorder: (0, colorRegistry_1.asCssVariable)(colorRegistry_1.inputActiveOptionBorder),
                inputActiveOptionForeground: (0, colorRegistry_1.asCssVariable)(colorRegistry_1.inputActiveOptionForeground),
            }));
            this._register(this._toggleSelectionFind.onChange(() => {
                if (this._toggleSelectionFind.checked) {
                    if (this._codeEditor.hasModel()) {
                        const selections = this._codeEditor.getSelections();
                        selections.map(selection => {
                            if (selection.endColumn === 1 && selection.endLineNumber > selection.startLineNumber) {
                                selection = selection.setEndPosition(selection.endLineNumber - 1, this._codeEditor.getModel().getLineMaxColumn(selection.endLineNumber - 1));
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
                else {
                    this._state.change({ searchScope: null }, true);
                }
            }));
            actionsContainer.appendChild(this._toggleSelectionFind.domNode);
            // Close button
            this._closeBtn = this._register(new SimpleButton({
                label: NLS_CLOSE_BTN_LABEL + this._keybindingLabelFor(findModel_1.FIND_IDS.CloseFindWidgetCommand),
                icon: iconRegistry_1.widgetClose,
                onTrigger: () => {
                    this._state.change({ isRevealed: false, searchScope: null }, false);
                },
                onKeyDown: (e) => {
                    if (e.equals(2 /* KeyCode.Tab */)) {
                        if (this._isReplaceVisible) {
                            if (this._replaceBtn.isEnabled()) {
                                this._replaceBtn.focus();
                            }
                            else {
                                this._codeEditor.focus();
                            }
                            e.preventDefault();
                        }
                    }
                }
            }));
            // Replace input
            this._replaceInput = this._register(new contextScopedHistoryWidget_1.ContextScopedReplaceInput(null, undefined, {
                label: NLS_REPLACE_INPUT_LABEL,
                placeholder: NLS_REPLACE_INPUT_PLACEHOLDER,
                appendPreserveCaseLabel: this._keybindingLabelFor(findModel_1.FIND_IDS.TogglePreserveCaseCommand),
                history: [],
                flexibleHeight,
                flexibleWidth,
                flexibleMaxHeight: 118,
                showHistoryHint: () => (0, historyWidgetKeybindingHint_1.showHistoryKeybindingHint)(this._keybindingService),
                inputBoxStyles: defaultStyles_1.defaultInputBoxStyles,
                toggleStyles: defaultStyles_1.defaultToggleStyles
            }, this._contextKeyService, true));
            this._replaceInput.setPreserveCase(!!this._state.preserveCase);
            this._register(this._replaceInput.onKeyDown((e) => this._onReplaceInputKeyDown(e)));
            this._register(this._replaceInput.inputBox.onDidChange(() => {
                this._state.change({ replaceString: this._replaceInput.inputBox.value }, false);
            }));
            this._register(this._replaceInput.inputBox.onDidHeightChange((e) => {
                if (this._isReplaceVisible && this._tryUpdateHeight()) {
                    this._showViewZone();
                }
            }));
            this._register(this._replaceInput.onDidOptionChange(() => {
                this._state.change({
                    preserveCase: this._replaceInput.getPreserveCase()
                }, true);
            }));
            this._register(this._replaceInput.onPreserveCaseKeyDown((e) => {
                if (e.equals(2 /* KeyCode.Tab */)) {
                    if (this._prevBtn.isEnabled()) {
                        this._prevBtn.focus();
                    }
                    else if (this._nextBtn.isEnabled()) {
                        this._nextBtn.focus();
                    }
                    else if (this._toggleSelectionFind.enabled) {
                        this._toggleSelectionFind.focus();
                    }
                    else if (this._closeBtn.isEnabled()) {
                        this._closeBtn.focus();
                    }
                    e.preventDefault();
                }
            }));
            // Replace one button
            this._replaceBtn = this._register(new SimpleButton({
                label: NLS_REPLACE_BTN_LABEL + this._keybindingLabelFor(findModel_1.FIND_IDS.ReplaceOneAction),
                icon: exports.findReplaceIcon,
                onTrigger: () => {
                    this._controller.replace();
                },
                onKeyDown: (e) => {
                    if (e.equals(1024 /* KeyMod.Shift */ | 2 /* KeyCode.Tab */)) {
                        this._closeBtn.focus();
                        e.preventDefault();
                    }
                }
            }));
            // Replace all button
            this._replaceAllBtn = this._register(new SimpleButton({
                label: NLS_REPLACE_ALL_BTN_LABEL + this._keybindingLabelFor(findModel_1.FIND_IDS.ReplaceAllAction),
                icon: exports.findReplaceAllIcon,
                onTrigger: () => {
                    this._controller.replaceAll();
                }
            }));
            const replacePart = document.createElement('div');
            replacePart.className = 'replace-part';
            replacePart.appendChild(this._replaceInput.domNode);
            const replaceActionsContainer = document.createElement('div');
            replaceActionsContainer.className = 'replace-actions';
            replacePart.appendChild(replaceActionsContainer);
            replaceActionsContainer.appendChild(this._replaceBtn.domNode);
            replaceActionsContainer.appendChild(this._replaceAllBtn.domNode);
            // Toggle replace button
            this._toggleReplaceBtn = this._register(new SimpleButton({
                label: NLS_TOGGLE_REPLACE_MODE_BTN_LABEL,
                className: 'codicon toggle left',
                onTrigger: () => {
                    this._state.change({ isReplaceRevealed: !this._isReplaceVisible }, false);
                    if (this._isReplaceVisible) {
                        this._replaceInput.width = dom.getTotalWidth(this._findInput.domNode);
                        this._replaceInput.inputBox.layout();
                    }
                    this._showViewZone();
                }
            }));
            this._toggleReplaceBtn.setExpanded(this._isReplaceVisible);
            // Widget
            this._domNode = document.createElement('div');
            this._domNode.className = 'editor-widget find-widget';
            this._domNode.setAttribute('aria-hidden', 'true');
            this._domNode.ariaLabel = NLS_FIND_DIALOG_LABEL;
            this._domNode.role = 'dialog';
            // We need to set this explicitly, otherwise on IE11, the width inheritence of flex doesn't work.
            this._domNode.style.width = `${FIND_WIDGET_INITIAL_WIDTH}px`;
            this._domNode.appendChild(this._toggleReplaceBtn.domNode);
            this._domNode.appendChild(findPart);
            this._domNode.appendChild(this._closeBtn.domNode);
            this._domNode.appendChild(replacePart);
            this._resizeSash = new sash_1.Sash(this._domNode, this, { orientation: 0 /* Orientation.VERTICAL */, size: 2 });
            this._resized = false;
            let originalWidth = FIND_WIDGET_INITIAL_WIDTH;
            this._register(this._resizeSash.onDidStart(() => {
                originalWidth = dom.getTotalWidth(this._domNode);
            }));
            this._register(this._resizeSash.onDidChange((evt) => {
                this._resized = true;
                const width = originalWidth + evt.startX - evt.currentX;
                if (width < FIND_WIDGET_INITIAL_WIDTH) {
                    // narrow down the find widget should be handled by CSS.
                    return;
                }
                const maxWidth = parseFloat(dom.getComputedStyle(this._domNode).maxWidth) || 0;
                if (width > maxWidth) {
                    return;
                }
                this._domNode.style.width = `${width}px`;
                if (this._isReplaceVisible) {
                    this._replaceInput.width = dom.getTotalWidth(this._findInput.domNode);
                }
                this._findInput.inputBox.layout();
                this._tryUpdateHeight();
            }));
            this._register(this._resizeSash.onDidReset(() => {
                // users double click on the sash
                const currentWidth = dom.getTotalWidth(this._domNode);
                if (currentWidth < FIND_WIDGET_INITIAL_WIDTH) {
                    // The editor is narrow and the width of the find widget is controlled fully by CSS.
                    return;
                }
                let width = FIND_WIDGET_INITIAL_WIDTH;
                if (!this._resized || currentWidth === FIND_WIDGET_INITIAL_WIDTH) {
                    // 1. never resized before, double click should maximizes it
                    // 2. users resized it already but its width is the same as default
                    const layoutInfo = this._codeEditor.getLayoutInfo();
                    width = layoutInfo.width - 28 - layoutInfo.minimap.minimapWidth - 15;
                    this._resized = true;
                }
                else {
                    /**
                     * no op, the find widget should be shrinked to its default size.
                     */
                }
                this._domNode.style.width = `${width}px`;
                if (this._isReplaceVisible) {
                    this._replaceInput.width = dom.getTotalWidth(this._findInput.domNode);
                }
                this._findInput.inputBox.layout();
            }));
        }
        updateAccessibilitySupport() {
            const value = this._codeEditor.getOption(2 /* EditorOption.accessibilitySupport */);
            this._findInput.setFocusInputOnOptionClick(value !== 2 /* AccessibilitySupport.Enabled */);
        }
        getViewState() {
            let widgetViewZoneVisible = false;
            if (this._viewZone && this._viewZoneId) {
                widgetViewZoneVisible = this._viewZone.heightInPx > this._codeEditor.getScrollTop();
            }
            return {
                widgetViewZoneVisible,
                scrollTop: this._codeEditor.getScrollTop()
            };
        }
        setViewState(state) {
            if (!state) {
                return;
            }
            if (state.widgetViewZoneVisible) {
                // we should add the view zone
                this._layoutViewZone(state.scrollTop);
            }
        }
    }
    exports.FindWidget = FindWidget;
    class SimpleButton extends widget_1.Widget {
        constructor(opts) {
            super();
            this._opts = opts;
            let className = 'button';
            if (this._opts.className) {
                className = className + ' ' + this._opts.className;
            }
            if (this._opts.icon) {
                className = className + ' ' + themables_1.ThemeIcon.asClassName(this._opts.icon);
            }
            this._domNode = document.createElement('div');
            this._domNode.title = this._opts.label;
            this._domNode.tabIndex = 0;
            this._domNode.className = className;
            this._domNode.setAttribute('role', 'button');
            this._domNode.setAttribute('aria-label', this._opts.label);
            this.onclick(this._domNode, (e) => {
                this._opts.onTrigger();
                e.preventDefault();
            });
            this.onkeydown(this._domNode, (e) => {
                if (e.equals(10 /* KeyCode.Space */) || e.equals(3 /* KeyCode.Enter */)) {
                    this._opts.onTrigger();
                    e.preventDefault();
                    return;
                }
                this._opts.onKeyDown?.(e);
            });
        }
        get domNode() {
            return this._domNode;
        }
        isEnabled() {
            return (this._domNode.tabIndex >= 0);
        }
        focus() {
            this._domNode.focus();
        }
        setEnabled(enabled) {
            this._domNode.classList.toggle('disabled', !enabled);
            this._domNode.setAttribute('aria-disabled', String(!enabled));
            this._domNode.tabIndex = enabled ? 0 : -1;
        }
        setExpanded(expanded) {
            this._domNode.setAttribute('aria-expanded', String(!!expanded));
            if (expanded) {
                this._domNode.classList.remove(...themables_1.ThemeIcon.asClassNameArray(findCollapsedIcon));
                this._domNode.classList.add(...themables_1.ThemeIcon.asClassNameArray(findExpandedIcon));
            }
            else {
                this._domNode.classList.remove(...themables_1.ThemeIcon.asClassNameArray(findExpandedIcon));
                this._domNode.classList.add(...themables_1.ThemeIcon.asClassNameArray(findCollapsedIcon));
            }
        }
    }
    exports.SimpleButton = SimpleButton;
    // theming
    (0, themeService_1.registerThemingParticipant)((theme, collector) => {
        const addBackgroundColorRule = (selector, color) => {
            if (color) {
                collector.addRule(`.monaco-editor ${selector} { background-color: ${color}; }`);
            }
        };
        addBackgroundColorRule('.findMatch', theme.getColor(colorRegistry_1.editorFindMatchHighlight));
        addBackgroundColorRule('.currentFindMatch', theme.getColor(colorRegistry_1.editorFindMatch));
        addBackgroundColorRule('.findScope', theme.getColor(colorRegistry_1.editorFindRangeHighlight));
        const widgetBackground = theme.getColor(colorRegistry_1.editorWidgetBackground);
        addBackgroundColorRule('.find-widget', widgetBackground);
        const widgetShadowColor = theme.getColor(colorRegistry_1.widgetShadow);
        if (widgetShadowColor) {
            collector.addRule(`.monaco-editor .find-widget { box-shadow: 0 0 8px 2px ${widgetShadowColor}; }`);
        }
        const widgetBorderColor = theme.getColor(colorRegistry_1.widgetBorder);
        if (widgetBorderColor) {
            collector.addRule(`.monaco-editor .find-widget { border-left: 1px solid ${widgetBorderColor}; border-right: 1px solid ${widgetBorderColor}; border-bottom: 1px solid ${widgetBorderColor}; }`);
        }
        const findMatchHighlightBorder = theme.getColor(colorRegistry_1.editorFindMatchHighlightBorder);
        if (findMatchHighlightBorder) {
            collector.addRule(`.monaco-editor .findMatch { border: 1px ${(0, theme_1.isHighContrast)(theme.type) ? 'dotted' : 'solid'} ${findMatchHighlightBorder}; box-sizing: border-box; }`);
        }
        const findMatchBorder = theme.getColor(colorRegistry_1.editorFindMatchBorder);
        if (findMatchBorder) {
            collector.addRule(`.monaco-editor .currentFindMatch { border: 2px solid ${findMatchBorder}; padding: 1px; box-sizing: border-box; }`);
        }
        const findRangeHighlightBorder = theme.getColor(colorRegistry_1.editorFindRangeHighlightBorder);
        if (findRangeHighlightBorder) {
            collector.addRule(`.monaco-editor .findScope { border: 1px ${(0, theme_1.isHighContrast)(theme.type) ? 'dashed' : 'solid'} ${findRangeHighlightBorder}; }`);
        }
        const hcBorder = theme.getColor(colorRegistry_1.contrastBorder);
        if (hcBorder) {
            collector.addRule(`.monaco-editor .find-widget { border: 1px solid ${hcBorder}; }`);
        }
        const foreground = theme.getColor(colorRegistry_1.editorWidgetForeground);
        if (foreground) {
            collector.addRule(`.monaco-editor .find-widget { color: ${foreground}; }`);
        }
        const error = theme.getColor(colorRegistry_1.errorForeground);
        if (error) {
            collector.addRule(`.monaco-editor .find-widget.no-results .matchesCount { color: ${error}; }`);
        }
        const resizeBorderBackground = theme.getColor(colorRegistry_1.editorWidgetResizeBorder);
        if (resizeBorderBackground) {
            collector.addRule(`.monaco-editor .find-widget .monaco-sash { background-color: ${resizeBorderBackground}; }`);
        }
        else {
            const border = theme.getColor(colorRegistry_1.editorWidgetBorder);
            if (border) {
                collector.addRule(`.monaco-editor .find-widget .monaco-sash { background-color: ${border}; }`);
            }
        }
        // Action bars
        const toolbarHoverBackgroundColor = theme.getColor(colorRegistry_1.toolbarHoverBackground);
        if (toolbarHoverBackgroundColor) {
            collector.addRule(`
		.monaco-editor .find-widget .button:not(.disabled):hover,
		.monaco-editor .find-widget .codicon-find-selection:hover {
			background-color: ${toolbarHoverBackgroundColor} !important;
		}
	`);
        }
        // This rule is used to override the outline color for synthetic-focus find input.
        const focusOutline = theme.getColor(colorRegistry_1.focusBorder);
        if (focusOutline) {
            collector.addRule(`.monaco-editor .find-widget .monaco-inputbox.synthetic-focus { outline-color: ${focusOutline}; }`);
        }
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmluZFdpZGdldC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL2VkaXRvci9jb250cmliL2ZpbmQvYnJvd3Nlci9maW5kV2lkZ2V0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQTJDaEcsTUFBTSxpQkFBaUIsR0FBRyxJQUFBLDJCQUFZLEVBQUMsZ0JBQWdCLEVBQUUsa0JBQU8sQ0FBQyxTQUFTLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQyxtQkFBbUIsRUFBRSwyREFBMkQsQ0FBQyxDQUFDLENBQUM7SUFDNUssTUFBTSxpQkFBaUIsR0FBRyxJQUFBLDJCQUFZLEVBQUMsZ0JBQWdCLEVBQUUsa0JBQU8sQ0FBQyxZQUFZLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQyxtQkFBbUIsRUFBRSw0REFBNEQsQ0FBQyxDQUFDLENBQUM7SUFDaEwsTUFBTSxnQkFBZ0IsR0FBRyxJQUFBLDJCQUFZLEVBQUMsZUFBZSxFQUFFLGtCQUFPLENBQUMsV0FBVyxFQUFFLEdBQUcsQ0FBQyxRQUFRLENBQUMsa0JBQWtCLEVBQUUsMkRBQTJELENBQUMsQ0FBQyxDQUFDO0lBRTlKLFFBQUEsZUFBZSxHQUFHLElBQUEsMkJBQVksRUFBQyxjQUFjLEVBQUUsa0JBQU8sQ0FBQyxPQUFPLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQyxpQkFBaUIsRUFBRSxpREFBaUQsQ0FBQyxDQUFDLENBQUM7SUFDcEosUUFBQSxrQkFBa0IsR0FBRyxJQUFBLDJCQUFZLEVBQUMsa0JBQWtCLEVBQUUsa0JBQU8sQ0FBQyxVQUFVLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQyxvQkFBb0IsRUFBRSxxREFBcUQsQ0FBQyxDQUFDLENBQUM7SUFDckssUUFBQSxxQkFBcUIsR0FBRyxJQUFBLDJCQUFZLEVBQUMscUJBQXFCLEVBQUUsa0JBQU8sQ0FBQyxPQUFPLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQyx1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