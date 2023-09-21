/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/ui/aria/aria", "vs/base/browser/ui/toggle/toggle", "vs/base/browser/ui/sash/sash", "vs/base/browser/ui/widget", "vs/base/common/async", "vs/base/common/codicons", "vs/base/common/errors", "vs/base/common/lifecycle", "vs/base/common/platform", "vs/base/common/strings", "vs/editor/common/core/range", "vs/editor/contrib/find/browser/findModel", "vs/nls!vs/editor/contrib/find/browser/findWidget", "vs/platform/history/browser/contextScopedHistoryWidget", "vs/platform/history/browser/historyWidgetKeybindingHint", "vs/platform/theme/common/colorRegistry", "vs/platform/theme/common/iconRegistry", "vs/platform/theme/common/themeService", "vs/base/common/themables", "vs/platform/theme/common/theme", "vs/base/common/types", "vs/platform/theme/browser/defaultStyles", "vs/css!./findWidget"], function (require, exports, dom, aria_1, toggle_1, sash_1, widget_1, async_1, codicons_1, errors_1, lifecycle_1, platform, strings, range_1, findModel_1, nls, contextScopedHistoryWidget_1, historyWidgetKeybindingHint_1, colorRegistry_1, iconRegistry_1, themeService_1, themables_1, theme_1, types_1, defaultStyles_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$U7 = exports.$T7 = exports.$S7 = exports.$R7 = exports.$Q7 = exports.$P7 = exports.$O7 = exports.$N7 = exports.$M7 = void 0;
    const findSelectionIcon = (0, iconRegistry_1.$9u)('find-selection', codicons_1.$Pj.selection, nls.localize(0, null));
    const findCollapsedIcon = (0, iconRegistry_1.$9u)('find-collapsed', codicons_1.$Pj.chevronRight, nls.localize(1, null));
    const findExpandedIcon = (0, iconRegistry_1.$9u)('find-expanded', codicons_1.$Pj.chevronDown, nls.localize(2, null));
    exports.$M7 = (0, iconRegistry_1.$9u)('find-replace', codicons_1.$Pj.replace, nls.localize(3, null));
    exports.$N7 = (0, iconRegistry_1.$9u)('find-replace-all', codicons_1.$Pj.replaceAll, nls.localize(4, null));
    exports.$O7 = (0, iconRegistry_1.$9u)('find-previous-match', codicons_1.$Pj.arrowUp, nls.localize(5, null));
    exports.$P7 = (0, iconRegistry_1.$9u)('find-next-match', codicons_1.$Pj.arrowDown, nls.localize(6, null));
    const NLS_FIND_DIALOG_LABEL = nls.localize(7, null);
    const NLS_FIND_INPUT_LABEL = nls.localize(8, null);
    const NLS_FIND_INPUT_PLACEHOLDER = nls.localize(9, null);
    const NLS_PREVIOUS_MATCH_BTN_LABEL = nls.localize(10, null);
    const NLS_NEXT_MATCH_BTN_LABEL = nls.localize(11, null);
    const NLS_TOGGLE_SELECTION_FIND_TITLE = nls.localize(12, null);
    const NLS_CLOSE_BTN_LABEL = nls.localize(13, null);
    const NLS_REPLACE_INPUT_LABEL = nls.localize(14, null);
    const NLS_REPLACE_INPUT_PLACEHOLDER = nls.localize(15, null);
    const NLS_REPLACE_BTN_LABEL = nls.localize(16, null);
    const NLS_REPLACE_ALL_BTN_LABEL = nls.localize(17, null);
    const NLS_TOGGLE_REPLACE_MODE_BTN_LABEL = nls.localize(18, null);
    const NLS_MATCHES_COUNT_LIMIT_TITLE = nls.localize(19, null, findModel_1.$I7);
    exports.$Q7 = nls.localize(20, null);
    exports.$R7 = nls.localize(21, null);
    const FIND_WIDGET_INITIAL_WIDTH = 419;
    const PART_WIDTH = 275;
    const FIND_INPUT_AREA_WIDTH = PART_WIDTH - 54;
    let MAX_MATCHES_COUNT_WIDTH = 69;
    // let FIND_ALL_CONTROLS_WIDTH = 17/** Find Input margin-left */ + (MAX_MATCHES_COUNT_WIDTH + 3 + 1) /** Match Results */ + 23 /** Button */ * 4 + 2/** sash */;
    const FIND_INPUT_AREA_HEIGHT = 33; // The height of Find Widget when Replace Input is not visible.
    const ctrlEnterReplaceAllWarningPromptedKey = 'ctrlEnterReplaceAll.windows.donotask';
    const ctrlKeyMod = (platform.$j ? 256 /* KeyMod.WinCtrl */ : 2048 /* KeyMod.CtrlCmd */);
    class $S7 {
        constructor(afterLineNumber) {
            this.afterLineNumber = afterLineNumber;
            this.heightInPx = FIND_INPUT_AREA_HEIGHT;
            this.suppressMouseDown = false;
            this.domNode = document.createElement('div');
            this.domNode.className = 'dock-find-viewzone';
        }
    }
    exports.$S7 = $S7;
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
    class $T7 extends widget_1.$IP {
        static { this.a = 'editor.contrib.findWidget'; }
        constructor(codeEditor, controller, state, contextViewProvider, keybindingService, contextKeyService, themeService, storageService, notificationService) {
            super();
            this.y = null;
            this.qb = [];
            this.b = codeEditor;
            this.g = controller;
            this.c = state;
            this.h = contextViewProvider;
            this.n = keybindingService;
            this.r = contextKeyService;
            this.s = storageService;
            this.t = notificationService;
            this.Z = !!storageService.getBoolean(ctrlEnterReplaceAllWarningPromptedKey, 0 /* StorageScope.PROFILE */);
            this.W = false;
            this.X = false;
            this.Y = false;
            this.hb = new async_1.$Dg(500);
            this.B((0, lifecycle_1.$ic)(() => this.hb.cancel()));
            this.B(this.c.onFindReplaceStateChange((e) => this.ib(e)));
            this.Eb();
            this.pb();
            this.wb();
            this.J.inputBox.layout();
            this.B(this.b.onDidChangeConfiguration((e) => {
                if (e.hasChanged(90 /* EditorOption.readOnly */)) {
                    if (this.b.getOption(90 /* EditorOption.readOnly */)) {
                        // Hide replace part if editor becomes read only
                        this.c.change({ isReplaceRevealed: false }, false);
                    }
                    this.pb();
                }
                if (e.hasChanged(143 /* EditorOption.layoutInfo */)) {
                    this.wb();
                }
                if (e.hasChanged(2 /* EditorOption.accessibilitySupport */)) {
                    this.Fb();
                }
                if (e.hasChanged(41 /* EditorOption.find */)) {
                    const supportLoop = this.b.getOption(41 /* EditorOption.find */).loop;
                    this.c.change({ loop: supportLoop }, false);
                    const addExtraSpaceOnTop = this.b.getOption(41 /* EditorOption.find */).addExtraSpaceOnTop;
                    if (addExtraSpaceOnTop && !this.db) {
                        this.db = new $S7(0);
                        this.ub();
                    }
                    if (!addExtraSpaceOnTop && this.db) {
                        this.vb();
                    }
                }
            }));
            this.Fb();
            this.B(this.b.onDidChangeCursorSelection(() => {
                if (this.W) {
                    this.ob();
                }
            }));
            this.B(this.b.onDidFocusEditorWidget(async () => {
                if (this.W) {
                    const globalBufferTerm = await this.g.getGlobalBufferTerm();
                    if (globalBufferTerm && globalBufferTerm !== this.c.searchString) {
                        this.c.change({ searchString: globalBufferTerm }, false);
                        this.J.select();
                    }
                }
            }));
            this.ab = findModel_1.$A7.bindTo(contextKeyService);
            this.$ = this.B(dom.$8O(this.J.inputBox.inputElement));
            this.B(this.$.onDidFocus(() => {
                this.ab.set(true);
                this.zb();
            }));
            this.B(this.$.onDidBlur(() => {
                this.ab.set(false);
            }));
            this.cb = findModel_1.$B7.bindTo(contextKeyService);
            this.bb = this.B(dom.$8O(this.L.inputBox.inputElement));
            this.B(this.bb.onDidFocus(() => {
                this.cb.set(true);
                this.zb();
            }));
            this.B(this.bb.onDidBlur(() => {
                this.cb.set(false);
            }));
            this.b.addOverlayWidget(this);
            if (this.b.getOption(41 /* EditorOption.find */).addExtraSpaceOnTop) {
                this.db = new $S7(0); // Put it before the first line then users can scroll beyond the first line.
            }
            this.B(this.b.onDidChangeModel(() => {
                if (!this.W) {
                    return;
                }
                this.eb = undefined;
            }));
            this.B(this.b.onDidScrollChange((e) => {
                if (e.scrollTopChanged) {
                    this.tb();
                    return;
                }
                // for other scroll changes, layout the viewzone in next tick to avoid ruining current rendering.
                setTimeout(() => {
                    this.tb();
                }, 0);
            }));
        }
        // ----- IOverlayWidget API
        getId() {
            return $T7.a;
        }
        getDomNode() {
            return this.w;
        }
        getPosition() {
            if (this.W) {
                return {
                    preference: 0 /* OverlayWidgetPositionPreference.TOP_RIGHT_CORNER */
                };
            }
            return null;
        }
        // ----- React to state changes
        ib(e) {
            if (e.searchString) {
                try {
                    this.Y = true;
                    this.J.setValue(this.c.searchString);
                }
                finally {
                    this.Y = false;
                }
                this.pb();
            }
            if (e.replaceString) {
                this.L.inputBox.value = this.c.replaceString;
            }
            if (e.isRevealed) {
                if (this.c.isRevealed) {
                    this.rb();
                }
                else {
                    this.sb(true);
                }
            }
            if (e.isReplaceRevealed) {
                if (this.c.isReplaceRevealed) {
                    if (!this.b.getOption(90 /* EditorOption.readOnly */) && !this.X) {
                        this.X = true;
                        this.L.width = dom.$HO(this.J.domNode);
                        this.pb();
                        this.L.inputBox.layout();
                    }
                }
                else {
                    if (this.X) {
                        this.X = false;
                        this.pb();
                    }
                }
            }
            if ((e.isRevealed || e.isReplaceRevealed) && (this.c.isRevealed || this.c.isReplaceRevealed)) {
                if (this.yb()) {
                    this.ub();
                }
            }
            if (e.isRegex) {
                this.J.setRegex(this.c.isRegex);
            }
            if (e.wholeWord) {
                this.J.setWholeWords(this.c.wholeWord);
            }
            if (e.matchCase) {
                this.J.setCaseSensitive(this.c.matchCase);
            }
            if (e.preserveCase) {
                this.L.setPreserveCase(this.c.preserveCase);
            }
            if (e.searchScope) {
                if (this.c.searchScope) {
                    this.Q.checked = true;
                }
                else {
                    this.Q.checked = false;
                }
                this.ob();
            }
            if (e.searchString || e.matchesCount || e.matchesPosition) {
                const showRedOutline = (this.c.searchString.length > 0 && this.c.matchesCount === 0);
                this.w.classList.toggle('no-results', showRedOutline);
                this.mb();
                this.pb();
            }
            if (e.searchString || e.currentMatch) {
                this.tb();
            }
            if (e.updateHistory) {
                this.jb();
            }
            if (e.loop) {
                this.pb();
            }
        }
        jb() {
            this.hb.trigger(this.lb.bind(this)).then(undefined, errors_1.$Y);
        }
        lb() {
            if (this.c.searchString) {
                this.J.inputBox.addToHistory();
            }
            if (this.c.replaceString) {
                this.L.inputBox.addToHistory();
            }
        }
        mb() {
            this.N.style.minWidth = MAX_MATCHES_COUNT_WIDTH + 'px';
            if (this.c.matchesCount >= findModel_1.$I7) {
                this.N.title = NLS_MATCHES_COUNT_LIMIT_TITLE;
            }
            else {
                this.N.title = '';
            }
            // remove previous content
            if (this.N.firstChild) {
                this.N.removeChild(this.N.firstChild);
            }
            let label;
            if (this.c.matchesCount > 0) {
                let matchesCount = String(this.c.matchesCount);
                if (this.c.matchesCount >= findModel_1.$I7) {
                    matchesCount += '+';
                }
                let matchesPosition = String(this.c.matchesPosition);
                if (matchesPosition === '0') {
                    matchesPosition = '?';
                }
                label = strings.$ne(exports.$Q7, matchesPosition, matchesCount);
            }
            else {
                label = exports.$R7;
            }
            this.N.appendChild(document.createTextNode(label));
            (0, aria_1.$$P)(this.nb(label, this.c.currentMatch, this.c.searchString));
            MAX_MATCHES_COUNT_WIDTH = Math.max(MAX_MATCHES_COUNT_WIDTH, this.N.clientWidth);
        }
        // ----- actions
        nb(label, currentMatch, searchString) {
            if (label === exports.$R7) {
                return searchString === ''
                    ? nls.localize(22, null, label)
                    : nls.localize(23, null, label, searchString);
            }
            if (currentMatch) {
                const ariaLabel = nls.localize(24, null, label, searchString, currentMatch.startLineNumber + ':' + currentMatch.startColumn);
                const model = this.b.getModel();
                if (model && (currentMatch.startLineNumber <= model.getLineCount()) && (currentMatch.startLineNumber >= 1)) {
                    const lineContent = model.getLineContent(currentMatch.startLineNumber);
                    return `${lineContent}, ${ariaLabel}`;
                }
                return ariaLabel;
            }
            return nls.localize(25, null, label, searchString);
        }
        /**
         * If 'selection find' is ON we should not disable the button (its function is to cancel 'selection find').
         * If 'selection find' is OFF we enable the button only if there is a selection.
         */
        ob() {
            const selection = this.b.getSelection();
            const isSelection = selection ? (selection.startLineNumber !== selection.endLineNumber || selection.startColumn !== selection.endColumn) : false;
            const isChecked = this.Q.checked;
            if (this.W && (isChecked || isSelection)) {
                this.Q.enable();
            }
            else {
                this.Q.disable();
            }
        }
        pb() {
            this.J.setEnabled(this.W);
            this.L.setEnabled(this.W && this.X);
            this.ob();
            this.R.setEnabled(this.W);
            const findInputIsNonEmpty = (this.c.searchString.length > 0);
            const matchesCount = this.c.matchesCount ? true : false;
            this.O.setEnabled(this.W && findInputIsNonEmpty && matchesCount && this.c.canNavigateBack());
            this.P.setEnabled(this.W && findInputIsNonEmpty && matchesCount && this.c.canNavigateForward());
            this.S.setEnabled(this.W && this.X && findInputIsNonEmpty);
            this.U.setEnabled(this.W && this.X && findInputIsNonEmpty);
            this.w.classList.toggle('replaceToggled', this.X);
            this.M.setExpanded(this.X);
            const canReplace = !this.b.getOption(90 /* EditorOption.readOnly */);
            this.M.setEnabled(this.W && canReplace);
        }
        rb() {
            this.qb.forEach(e => {
                clearTimeout(e);
            });
            this.qb = [];
            if (!this.W) {
                this.W = true;
                const selection = this.b.getSelection();
                switch (this.b.getOption(41 /* EditorOption.find */).autoFindInSelection) {
                    case 'always':
                        this.Q.checked = true;
                        break;
                    case 'never':
                        this.Q.checked = false;
                        break;
                    case 'multiline': {
                        const isSelectionMultipleLine = !!selection && selection.startLineNumber !== selection.endLineNumber;
                        this.Q.checked = isSelectionMultipleLine;
                        break;
                    }
                    default:
                        break;
                }
                this.wb();
                this.pb();
                this.qb.push(setTimeout(() => {
                    this.w.classList.add('visible');
                    this.w.setAttribute('aria-hidden', 'false');
                }, 0));
                // validate query again as it's being dismissed when we hide the find widget.
                this.qb.push(setTimeout(() => {
                    this.J.validate();
                }, 200));
                this.b.layoutOverlayWidget(this);
                let adjustEditorScrollTop = true;
                if (this.b.getOption(41 /* EditorOption.find */).seedSearchStringFromSelection && selection) {
                    const domNode = this.b.getDomNode();
                    if (domNode) {
                        const editorCoords = dom.$FO(domNode);
                        const startCoords = this.b.getScrolledVisiblePosition(selection.getStartPosition());
                        const startLeft = editorCoords.left + (startCoords ? startCoords.left : 0);
                        const startTop = startCoords ? startCoords.top : 0;
                        if (this.db && startTop < this.db.heightInPx) {
                            if (selection.endLineNumber > selection.startLineNumber) {
                                adjustEditorScrollTop = false;
                            }
                            const leftOfFindWidget = dom.$CO(this.w).left;
                            if (startLeft > leftOfFindWidget) {
                                adjustEditorScrollTop = false;
                            }
                            const endCoords = this.b.getScrolledVisiblePosition(selection.getEndPosition());
                            const endLeft = editorCoords.left + (endCoords ? endCoords.left : 0);
                            if (endLeft > leftOfFindWidget) {
                                adjustEditorScrollTop = false;
                            }
                        }
                    }
                }
                this.ub(adjustEditorScrollTop);
            }
        }
        sb(focusTheEditor) {
            this.qb.forEach(e => {
                clearTimeout(e);
            });
            this.qb = [];
            if (this.W) {
                this.W = false;
                this.pb();
                this.w.classList.remove('visible');
                this.w.setAttribute('aria-hidden', 'true');
                this.J.clearMessage();
                if (focusTheEditor) {
                    this.b.focus();
                }
                this.b.layoutOverlayWidget(this);
                this.vb();
            }
        }
        tb(targetScrollTop) {
            const addExtraSpaceOnTop = this.b.getOption(41 /* EditorOption.find */).addExtraSpaceOnTop;
            if (!addExtraSpaceOnTop) {
                this.vb();
                return;
            }
            if (!this.W) {
                return;
            }
            const viewZone = this.db;
            if (this.eb !== undefined || !viewZone) {
                return;
            }
            this.b.changeViewZones((accessor) => {
                viewZone.heightInPx = this.xb();
                this.eb = accessor.addZone(viewZone);
                // scroll top adjust to make sure the editor doesn't scroll when adding viewzone at the beginning.
                this.b.setScrollTop(targetScrollTop || this.b.getScrollTop() + viewZone.heightInPx);
            });
        }
        ub(adjustScroll = true) {
            if (!this.W) {
                return;
            }
            const addExtraSpaceOnTop = this.b.getOption(41 /* EditorOption.find */).addExtraSpaceOnTop;
            if (!addExtraSpaceOnTop) {
                return;
            }
            if (this.db === undefined) {
                this.db = new $S7(0);
            }
            const viewZone = this.db;
            this.b.changeViewZones((accessor) => {
                if (this.eb !== undefined) {
                    // the view zone already exists, we need to update the height
                    const newHeight = this.xb();
                    if (newHeight === viewZone.heightInPx) {
                        return;
                    }
                    const scrollAdjustment = newHeight - viewZone.heightInPx;
                    viewZone.heightInPx = newHeight;
                    accessor.layoutZone(this.eb);
                    if (adjustScroll) {
                        this.b.setScrollTop(this.b.getScrollTop() + scrollAdjustment);
                    }
                    return;
                }
                else {
                    let scrollAdjustment = this.xb();
                    // if the editor has top padding, factor that into the zone height
                    scrollAdjustment -= this.b.getOption(83 /* EditorOption.padding */).top;
                    if (scrollAdjustment <= 0) {
                        return;
                    }
                    viewZone.heightInPx = scrollAdjustment;
                    this.eb = accessor.addZone(viewZone);
                    if (adjustScroll) {
                        this.b.setScrollTop(this.b.getScrollTop() + scrollAdjustment);
                    }
                }
            });
        }
        vb() {
            this.b.changeViewZones((accessor) => {
                if (this.eb !== undefined) {
                    accessor.removeZone(this.eb);
                    this.eb = undefined;
                    if (this.db) {
                        this.b.setScrollTop(this.b.getScrollTop() - this.db.heightInPx);
                        this.db = undefined;
                    }
                }
            });
        }
        wb() {
            if (!this.W) {
                return;
            }
            if (!dom.$mO(this.w)) {
                // the widget is not in the DOM
                return;
            }
            const layoutInfo = this.b.getLayoutInfo();
            const editorContentWidth = layoutInfo.contentWidth;
            if (editorContentWidth <= 0) {
                // for example, diff view original editor
                this.w.classList.add('hiddenEditor');
                return;
            }
            else if (this.w.classList.contains('hiddenEditor')) {
                this.w.classList.remove('hiddenEditor');
            }
            const editorWidth = layoutInfo.width;
            const minimapWidth = layoutInfo.minimap.minimapWidth;
            let collapsedFindWidget = false;
            let reducedFindWidget = false;
            let narrowFindWidget = false;
            if (this.gb) {
                const widgetWidth = dom.$HO(this.w);
                if (widgetWidth > FIND_WIDGET_INITIAL_WIDTH) {
                    // as the widget is resized by users, we may need to change the max width of the widget as the editor width changes.
                    this.w.style.maxWidth = `${editorWidth - 28 - minimapWidth - 15}px`;
                    this.L.width = dom.$HO(this.J.domNode);
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
            this.w.classList.toggle('collapsed-find-widget', collapsedFindWidget);
            this.w.classList.toggle('narrow-find-widget', narrowFindWidget);
            this.w.classList.toggle('reduced-find-widget', reducedFindWidget);
            if (!narrowFindWidget && !collapsedFindWidget) {
                // the minimal left offset of findwidget is 15px.
                this.w.style.maxWidth = `${editorWidth - 28 - minimapWidth - 15}px`;
            }
            this.J.layout({ collapsedFindWidget, narrowFindWidget, reducedFindWidget });
            if (this.gb) {
                const findInputWidth = this.J.inputBox.element.clientWidth;
                if (findInputWidth > 0) {
                    this.L.width = findInputWidth;
                }
            }
            else if (this.X) {
                this.L.width = dom.$HO(this.J.domNode);
            }
        }
        xb() {
            let totalheight = 0;
            // find input margin top
            totalheight += 4;
            // find input height
            totalheight += this.J.inputBox.height + 2 /** input box border */;
            if (this.X) {
                // replace input margin
                totalheight += 4;
                totalheight += this.L.inputBox.height + 2 /** input box border */;
            }
            // margin bottom
            totalheight += 4;
            return totalheight;
        }
        yb() {
            const totalHeight = this.xb();
            if (this.y !== null && this.y === totalHeight) {
                return false;
            }
            this.y = totalHeight;
            this.w.style.height = `${totalHeight}px`;
            return true;
        }
        // ----- Public
        focusFindInput() {
            this.J.select();
            // Edge browser requires focus() in addition to select()
            this.J.focus();
        }
        focusReplaceInput() {
            this.L.select();
            // Edge browser requires focus() in addition to select()
            this.L.focus();
        }
        highlightFindOptions() {
            this.J.highlightFindOptions();
        }
        zb() {
            if (!this.b.hasModel()) {
                return;
            }
            if (this.Q.checked) {
                const selections = this.b.getSelections();
                selections.map(selection => {
                    if (selection.endColumn === 1 && selection.endLineNumber > selection.startLineNumber) {
                        selection = selection.setEndPosition(selection.endLineNumber - 1, this.b.getModel().getLineMaxColumn(selection.endLineNumber - 1));
                    }
                    const currentMatch = this.c.currentMatch;
                    if (selection.startLineNumber !== selection.endLineNumber) {
                        if (!range_1.$ks.equalsRange(selection, currentMatch)) {
                            return selection;
                        }
                    }
                    return null;
                }).filter(element => !!element);
                if (selections.length) {
                    this.c.change({ searchScope: selections }, true);
                }
            }
        }
        Ab(e) {
            // on linux, middle key does pasting.
            if (e.middleButton) {
                e.stopPropagation();
            }
        }
        Bb(e) {
            if (e.equals(ctrlKeyMod | 3 /* KeyCode.Enter */)) {
                if (this.n.dispatchEvent(e, e.target)) {
                    e.preventDefault();
                    return;
                }
                else {
                    this.J.inputBox.insertAtCursor('\n');
                    e.preventDefault();
                    return;
                }
            }
            if (e.equals(2 /* KeyCode.Tab */)) {
                if (this.X) {
                    this.L.focus();
                }
                else {
                    this.J.focusOnCaseSensitive();
                }
                e.preventDefault();
                return;
            }
            if (e.equals(2048 /* KeyMod.CtrlCmd */ | 18 /* KeyCode.DownArrow */)) {
                this.b.focus();
                e.preventDefault();
                return;
            }
            if (e.equals(16 /* KeyCode.UpArrow */)) {
                return stopPropagationForMultiLineUpwards(e, this.J.getValue(), this.J.domNode.querySelector('textarea'));
            }
            if (e.equals(18 /* KeyCode.DownArrow */)) {
                return stopPropagationForMultiLineDownwards(e, this.J.getValue(), this.J.domNode.querySelector('textarea'));
            }
        }
        Cb(e) {
            if (e.equals(ctrlKeyMod | 3 /* KeyCode.Enter */)) {
                if (this.n.dispatchEvent(e, e.target)) {
                    e.preventDefault();
                    return;
                }
                else {
                    if (platform.$i && platform.$m && !this.Z) {
                        // this is the first time when users press Ctrl + Enter to replace all
                        this.t.info(nls.localize(26, null));
                        this.Z = true;
                        this.s.store(ctrlEnterReplaceAllWarningPromptedKey, true, 0 /* StorageScope.PROFILE */, 0 /* StorageTarget.USER */);
                    }
                    this.L.inputBox.insertAtCursor('\n');
                    e.preventDefault();
                    return;
                }
            }
            if (e.equals(2 /* KeyCode.Tab */)) {
                this.J.focusOnCaseSensitive();
                e.preventDefault();
                return;
            }
            if (e.equals(1024 /* KeyMod.Shift */ | 2 /* KeyCode.Tab */)) {
                this.J.focus();
                e.preventDefault();
                return;
            }
            if (e.equals(2048 /* KeyMod.CtrlCmd */ | 18 /* KeyCode.DownArrow */)) {
                this.b.focus();
                e.preventDefault();
                return;
            }
            if (e.equals(16 /* KeyCode.UpArrow */)) {
                return stopPropagationForMultiLineUpwards(e, this.L.inputBox.value, this.L.inputBox.element.querySelector('textarea'));
            }
            if (e.equals(18 /* KeyCode.DownArrow */)) {
                return stopPropagationForMultiLineDownwards(e, this.L.inputBox.value, this.L.inputBox.element.querySelector('textarea'));
            }
        }
        // ----- sash
        getVerticalSashLeft(_sash) {
            return 0;
        }
        // ----- initialization
        Db(actionId) {
            const kb = this.n.lookupKeybinding(actionId);
            if (!kb) {
                return '';
            }
            return ` (${kb.getLabel()})`;
        }
        Eb() {
            const flexibleHeight = true;
            const flexibleWidth = true;
            // Find input
            this.J = this.B(new contextScopedHistoryWidget_1.$T5(null, this.h, {
                width: FIND_INPUT_AREA_WIDTH,
                label: NLS_FIND_INPUT_LABEL,
                placeholder: NLS_FIND_INPUT_PLACEHOLDER,
                appendCaseSensitiveLabel: this.Db(findModel_1.$H7.ToggleCaseSensitiveCommand),
                appendWholeWordsLabel: this.Db(findModel_1.$H7.ToggleWholeWordCommand),
                appendRegexLabel: this.Db(findModel_1.$H7.ToggleRegexCommand),
                validation: (value) => {
                    if (value.length === 0 || !this.J.getRegex()) {
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
                showHistoryHint: () => (0, historyWidgetKeybindingHint_1.$L7)(this.n),
                inputBoxStyles: defaultStyles_1.$s2,
                toggleStyles: defaultStyles_1.$m2
            }, this.r));
            this.J.setRegex(!!this.c.isRegex);
            this.J.setCaseSensitive(!!this.c.matchCase);
            this.J.setWholeWords(!!this.c.wholeWord);
            this.B(this.J.onKeyDown((e) => this.Bb(e)));
            this.B(this.J.inputBox.onDidChange(() => {
                if (this.Y) {
                    return;
                }
                this.c.change({ searchString: this.J.getValue() }, true);
            }));
            this.B(this.J.onDidOptionChange(() => {
                this.c.change({
                    isRegex: this.J.getRegex(),
                    wholeWord: this.J.getWholeWords(),
                    matchCase: this.J.getCaseSensitive()
                }, true);
            }));
            this.B(this.J.onCaseSensitiveKeyDown((e) => {
                if (e.equals(1024 /* KeyMod.Shift */ | 2 /* KeyCode.Tab */)) {
                    if (this.X) {
                        this.L.focus();
                        e.preventDefault();
                    }
                }
            }));
            this.B(this.J.onRegexKeyDown((e) => {
                if (e.equals(2 /* KeyCode.Tab */)) {
                    if (this.X) {
                        this.L.focusOnPreserve();
                        e.preventDefault();
                    }
                }
            }));
            this.B(this.J.inputBox.onDidHeightChange((e) => {
                if (this.yb()) {
                    this.ub();
                }
            }));
            if (platform.$k) {
                this.B(this.J.onMouseDown((e) => this.Ab(e)));
            }
            this.N = document.createElement('div');
            this.N.className = 'matchesCount';
            this.mb();
            // Previous button
            this.O = this.B(new $U7({
                label: NLS_PREVIOUS_MATCH_BTN_LABEL + this.Db(findModel_1.$H7.PreviousMatchFindAction),
                icon: exports.$O7,
                onTrigger: () => {
                    (0, types_1.$uf)(this.b.getAction(findModel_1.$H7.PreviousMatchFindAction)).run().then(undefined, errors_1.$Y);
                }
            }));
            // Next button
            this.P = this.B(new $U7({
                label: NLS_NEXT_MATCH_BTN_LABEL + this.Db(findModel_1.$H7.NextMatchFindAction),
                icon: exports.$P7,
                onTrigger: () => {
                    (0, types_1.$uf)(this.b.getAction(findModel_1.$H7.NextMatchFindAction)).run().then(undefined, errors_1.$Y);
                }
            }));
            const findPart = document.createElement('div');
            findPart.className = 'find-part';
            findPart.appendChild(this.J.domNode);
            const actionsContainer = document.createElement('div');
            actionsContainer.className = 'find-actions';
            findPart.appendChild(actionsContainer);
            actionsContainer.appendChild(this.N);
            actionsContainer.appendChild(this.O.domNode);
            actionsContainer.appendChild(this.P.domNode);
            // Toggle selection button
            this.Q = this.B(new toggle_1.$KQ({
                icon: findSelectionIcon,
                title: NLS_TOGGLE_SELECTION_FIND_TITLE + this.Db(findModel_1.$H7.ToggleSearchScopeCommand),
                isChecked: false,
                inputActiveOptionBackground: (0, colorRegistry_1.$pv)(colorRegistry_1.$Rv),
                inputActiveOptionBorder: (0, colorRegistry_1.$pv)(colorRegistry_1.$Pv),
                inputActiveOptionForeground: (0, colorRegistry_1.$pv)(colorRegistry_1.$Sv),
            }));
            this.B(this.Q.onChange(() => {
                if (this.Q.checked) {
                    if (this.b.hasModel()) {
                        const selections = this.b.getSelections();
                        selections.map(selection => {
                            if (selection.endColumn === 1 && selection.endLineNumber > selection.startLineNumber) {
                                selection = selection.setEndPosition(selection.endLineNumber - 1, this.b.getModel().getLineMaxColumn(selection.endLineNumber - 1));
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
                else {
                    this.c.change({ searchScope: null }, true);
                }
            }));
            actionsContainer.appendChild(this.Q.domNode);
            // Close button
            this.R = this.B(new $U7({
                label: NLS_CLOSE_BTN_LABEL + this.Db(findModel_1.$H7.CloseFindWidgetCommand),
                icon: iconRegistry_1.$_u,
                onTrigger: () => {
                    this.c.change({ isRevealed: false, searchScope: null }, false);
                },
                onKeyDown: (e) => {
                    if (e.equals(2 /* KeyCode.Tab */)) {
                        if (this.X) {
                            if (this.S.isEnabled()) {
                                this.S.focus();
                            }
                            else {
                                this.b.focus();
                            }
                            e.preventDefault();
                        }
                    }
                }
            }));
            // Replace input
            this.L = this.B(new contextScopedHistoryWidget_1.$U5(null, undefined, {
                label: NLS_REPLACE_INPUT_LABEL,
                placeholder: NLS_REPLACE_INPUT_PLACEHOLDER,
                appendPreserveCaseLabel: this.Db(findModel_1.$H7.TogglePreserveCaseCommand),
                history: [],
                flexibleHeight,
                flexibleWidth,
                flexibleMaxHeight: 118,
                showHistoryHint: () => (0, historyWidgetKeybindingHint_1.$L7)(this.n),
                inputBoxStyles: defaultStyles_1.$s2,
                toggleStyles: defaultStyles_1.$m2
            }, this.r, true));
            this.L.setPreserveCase(!!this.c.preserveCase);
            this.B(this.L.onKeyDown((e) => this.Cb(e)));
            this.B(this.L.inputBox.onDidChange(() => {
                this.c.change({ replaceString: this.L.inputBox.value }, false);
            }));
            this.B(this.L.inputBox.onDidHeightChange((e) => {
                if (this.X && this.yb()) {
                    this.ub();
                }
            }));
            this.B(this.L.onDidOptionChange(() => {
                this.c.change({
                    preserveCase: this.L.getPreserveCase()
                }, true);
            }));
            this.B(this.L.onPreserveCaseKeyDown((e) => {
                if (e.equals(2 /* KeyCode.Tab */)) {
                    if (this.O.isEnabled()) {
                        this.O.focus();
                    }
                    else if (this.P.isEnabled()) {
                        this.P.focus();
                    }
                    else if (this.Q.enabled) {
                        this.Q.focus();
                    }
                    else if (this.R.isEnabled()) {
                        this.R.focus();
                    }
                    e.preventDefault();
                }
            }));
            // Replace one button
            this.S = this.B(new $U7({
                label: NLS_REPLACE_BTN_LABEL + this.Db(findModel_1.$H7.ReplaceOneAction),
                icon: exports.$M7,
                onTrigger: () => {
                    this.g.replace();
                },
                onKeyDown: (e) => {
                    if (e.equals(1024 /* KeyMod.Shift */ | 2 /* KeyCode.Tab */)) {
                        this.R.focus();
                        e.preventDefault();
                    }
                }
            }));
            // Replace all button
            this.U = this.B(new $U7({
                label: NLS_REPLACE_ALL_BTN_LABEL + this.Db(findModel_1.$H7.ReplaceAllAction),
                icon: exports.$N7,
                onTrigger: () => {
                    this.g.replaceAll();
                }
            }));
            const replacePart = document.createElement('div');
            replacePart.className = 'replace-part';
            replacePart.appendChild(this.L.domNode);
            const replaceActionsContainer = document.createElement('div');
            replaceActionsContainer.className = 'replace-actions';
            replacePart.appendChild(replaceActionsContainer);
            replaceActionsContainer.appendChild(this.S.domNode);
            replaceActionsContainer.appendChild(this.U.domNode);
            // Toggle replace button
            this.M = this.B(new $U7({
                label: NLS_TOGGLE_REPLACE_MODE_BTN_LABEL,
                className: 'codicon toggle left',
                onTrigger: () => {
                    this.c.change({ isReplaceRevealed: !this.X }, false);
                    if (this.X) {
                        this.L.width = dom.$HO(this.J.domNode);
                        this.L.inputBox.layout();
                    }
                    this.ub();
                }
            }));
            this.M.setExpanded(this.X);
            // Widget
            this.w = document.createElement('div');
            this.w.className = 'editor-widget find-widget';
            this.w.setAttribute('aria-hidden', 'true');
            this.w.ariaLabel = NLS_FIND_DIALOG_LABEL;
            this.w.role = 'dialog';
            // We need to set this explicitly, otherwise on IE11, the width inheritence of flex doesn't work.
            this.w.style.width = `${FIND_WIDGET_INITIAL_WIDTH}px`;
            this.w.appendChild(this.M.domNode);
            this.w.appendChild(findPart);
            this.w.appendChild(this.R.domNode);
            this.w.appendChild(replacePart);
            this.fb = new sash_1.$aR(this.w, this, { orientation: 0 /* Orientation.VERTICAL */, size: 2 });
            this.gb = false;
            let originalWidth = FIND_WIDGET_INITIAL_WIDTH;
            this.B(this.fb.onDidStart(() => {
                originalWidth = dom.$HO(this.w);
            }));
            this.B(this.fb.onDidChange((evt) => {
                this.gb = true;
                const width = originalWidth + evt.startX - evt.currentX;
                if (width < FIND_WIDGET_INITIAL_WIDTH) {
                    // narrow down the find widget should be handled by CSS.
                    return;
                }
                const maxWidth = parseFloat(dom.$zO(this.w).maxWidth) || 0;
                if (width > maxWidth) {
                    return;
                }
                this.w.style.width = `${width}px`;
                if (this.X) {
                    this.L.width = dom.$HO(this.J.domNode);
                }
                this.J.inputBox.layout();
                this.yb();
            }));
            this.B(this.fb.onDidReset(() => {
                // users double click on the sash
                const currentWidth = dom.$HO(this.w);
                if (currentWidth < FIND_WIDGET_INITIAL_WIDTH) {
                    // The editor is narrow and the width of the find widget is controlled fully by CSS.
                    return;
                }
                let width = FIND_WIDGET_INITIAL_WIDTH;
                if (!this.gb || currentWidth === FIND_WIDGET_INITIAL_WIDTH) {
                    // 1. never resized before, double click should maximizes it
                    // 2. users resized it already but its width is the same as default
                    const layoutInfo = this.b.getLayoutInfo();
                    width = layoutInfo.width - 28 - layoutInfo.minimap.minimapWidth - 15;
                    this.gb = true;
                }
                else {
                    /**
                     * no op, the find widget should be shrinked to its default size.
                     */
                }
                this.w.style.width = `${width}px`;
                if (this.X) {
                    this.L.width = dom.$HO(this.J.domNode);
                }
                this.J.inputBox.layout();
            }));
        }
        Fb() {
            const value = this.b.getOption(2 /* EditorOption.accessibilitySupport */);
            this.J.setFocusInputOnOptionClick(value !== 2 /* AccessibilitySupport.Enabled */);
        }
        getViewState() {
            let widgetViewZoneVisible = false;
            if (this.db && this.eb) {
                widgetViewZoneVisible = this.db.heightInPx > this.b.getScrollTop();
            }
            return {
                widgetViewZoneVisible,
                scrollTop: this.b.getScrollTop()
            };
        }
        setViewState(state) {
            if (!state) {
                return;
            }
            if (state.widgetViewZoneVisible) {
                // we should add the view zone
                this.tb(state.scrollTop);
            }
        }
    }
    exports.$T7 = $T7;
    class $U7 extends widget_1.$IP {
        constructor(opts) {
            super();
            this.a = opts;
            let className = 'button';
            if (this.a.className) {
                className = className + ' ' + this.a.className;
            }
            if (this.a.icon) {
                className = className + ' ' + themables_1.ThemeIcon.asClassName(this.a.icon);
            }
            this.b = document.createElement('div');
            this.b.title = this.a.label;
            this.b.tabIndex = 0;
            this.b.className = className;
            this.b.setAttribute('role', 'button');
            this.b.setAttribute('aria-label', this.a.label);
            this.f(this.b, (e) => {
                this.a.onTrigger();
                e.preventDefault();
            });
            this.z(this.b, (e) => {
                if (e.equals(10 /* KeyCode.Space */) || e.equals(3 /* KeyCode.Enter */)) {
                    this.a.onTrigger();
                    e.preventDefault();
                    return;
                }
                this.a.onKeyDown?.(e);
            });
        }
        get domNode() {
            return this.b;
        }
        isEnabled() {
            return (this.b.tabIndex >= 0);
        }
        focus() {
            this.b.focus();
        }
        setEnabled(enabled) {
            this.b.classList.toggle('disabled', !enabled);
            this.b.setAttribute('aria-disabled', String(!enabled));
            this.b.tabIndex = enabled ? 0 : -1;
        }
        setExpanded(expanded) {
            this.b.setAttribute('aria-expanded', String(!!expanded));
            if (expanded) {
                this.b.classList.remove(...themables_1.ThemeIcon.asClassNameArray(findCollapsedIcon));
                this.b.classList.add(...themables_1.ThemeIcon.asClassNameArray(findExpandedIcon));
            }
            else {
                this.b.classList.remove(...themables_1.ThemeIcon.asClassNameArray(findExpandedIcon));
                this.b.classList.add(...themables_1.ThemeIcon.asClassNameArray(findCollapsedIcon));
            }
        }
    }
    exports.$U7 = $U7;
    // theming
    (0, themeService_1.$mv)((theme, collector) => {
        const addBackgroundColorRule = (selector, color) => {
            if (color) {
                collector.addRule(`.monaco-editor ${selector} { background-color: ${color}; }`);
            }
        };
        addBackgroundColorRule('.findMatch', theme.getColor(colorRegistry_1.$Tw));
        addBackgroundColorRule('.currentFindMatch', theme.getColor(colorRegistry_1.$Sw));
        addBackgroundColorRule('.findScope', theme.getColor(colorRegistry_1.$Uw));
        const widgetBackground = theme.getColor(colorRegistry_1.$Aw);
        addBackgroundColorRule('.find-widget', widgetBackground);
        const widgetShadowColor = theme.getColor(colorRegistry_1.$Kv);
        if (widgetShadowColor) {
            collector.addRule(`.monaco-editor .find-widget { box-shadow: 0 0 8px 2px ${widgetShadowColor}; }`);
        }
        const widgetBorderColor = theme.getColor(colorRegistry_1.$Lv);
        if (widgetBorderColor) {
            collector.addRule(`.monaco-editor .find-widget { border-left: 1px solid ${widgetBorderColor}; border-right: 1px solid ${widgetBorderColor}; border-bottom: 1px solid ${widgetBorderColor}; }`);
        }
        const findMatchHighlightBorder = theme.getColor(colorRegistry_1.$Ww);
        if (findMatchHighlightBorder) {
            collector.addRule(`.monaco-editor .findMatch { border: 1px ${(0, theme_1.$ev)(theme.type) ? 'dotted' : 'solid'} ${findMatchHighlightBorder}; box-sizing: border-box; }`);
        }
        const findMatchBorder = theme.getColor(colorRegistry_1.$Vw);
        if (findMatchBorder) {
            collector.addRule(`.monaco-editor .currentFindMatch { border: 2px solid ${findMatchBorder}; padding: 1px; box-sizing: border-box; }`);
        }
        const findRangeHighlightBorder = theme.getColor(colorRegistry_1.$Xw);
        if (findRangeHighlightBorder) {
            collector.addRule(`.monaco-editor .findScope { border: 1px ${(0, theme_1.$ev)(theme.type) ? 'dashed' : 'solid'} ${findRangeHighlightBorder}; }`);
        }
        const hcBorder = theme.getColor(colorRegistry_1.$Av);
        if (hcBorder) {
            collector.addRule(`.monaco-editor .find-widget { border: 1px solid ${hcBorder}; }`);
        }
        const foreground = theme.getColor(colorRegistry_1.$Bw);
        if (foreground) {
            collector.addRule(`.monaco-editor .find-widget { color: ${foreground}; }`);
        }
        const error = theme.getColor(colorRegistry_1.$wv);
        if (error) {
            collector.addRule(`.monaco-editor .find-widget.no-results .matchesCount { color: ${error}; }`);
        }
        const resizeBorderBackground = theme.getColor(colorRegistry_1.$Dw);
        if (resizeBorderBackground) {
            collector.addRule(`.monaco-editor .find-widget .monaco-sash { background-color: ${resizeBorderBackground}; }`);
        }
        else {
            const border = theme.getColor(colorRegistry_1.$Cw);
            if (border) {
                collector.addRule(`.monaco-editor .find-widget .monaco-sash { background-color: ${border}; }`);
            }
        }
        // Action bars
        const toolbarHoverBackgroundColor = theme.getColor(colorRegistry_1.$dy);
        if (toolbarHoverBackgroundColor) {
            collector.addRule(`
		.monaco-editor .find-widget .button:not(.disabled):hover,
		.monaco-editor .find-widget .codicon-find-selection:hover {
			background-color: ${toolbarHoverBackgroundColor} !important;
		}
	`);
        }
        // This rule is used to override the outline color for synthetic-focus find input.
        const focusOutline = theme.getColor(colorRegistry_1.$zv);
        if (focusOutline) {
            collector.addRule(`.monaco-editor .find-widget .monaco-inputbox.synthetic-focus { outline-color: ${focusOutline}; }`);
        }
    });
});
//# sourceMappingURL=findWidget.js.map