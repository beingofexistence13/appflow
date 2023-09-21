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
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/ui/list/listWidget", "vs/base/common/async", "vs/base/common/errors", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/numbers", "vs/base/common/strings", "vs/editor/browser/widget/embeddedCodeEditorWidget", "vs/editor/contrib/suggest/browser/suggestWidgetStatus", "vs/nls", "vs/platform/contextkey/common/contextkey", "vs/platform/instantiation/common/instantiation", "vs/platform/storage/common/storage", "vs/platform/theme/common/colorRegistry", "vs/platform/theme/common/theme", "vs/platform/theme/common/themeService", "vs/base/browser/ui/resizable/resizable", "./suggest", "./suggestWidgetDetails", "./suggestWidgetRenderer", "vs/platform/theme/browser/defaultStyles", "vs/base/browser/ui/aria/aria", "vs/base/browser/ui/codicons/codiconStyles", "vs/css!./media/suggest", "vs/editor/contrib/symbolIcons/browser/symbolIcons"], function (require, exports, dom, listWidget_1, async_1, errors_1, event_1, lifecycle_1, numbers_1, strings, embeddedCodeEditorWidget_1, suggestWidgetStatus_1, nls, contextkey_1, instantiation_1, storage_1, colorRegistry_1, theme_1, themeService_1, resizable_1, suggest_1, suggestWidgetDetails_1, suggestWidgetRenderer_1, defaultStyles_1, aria_1) {
    "use strict";
    var SuggestWidget_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SuggestContentWidget = exports.SuggestWidget = exports.editorSuggestWidgetSelectedBackground = void 0;
    /**
     * Suggest widget colors
     */
    (0, colorRegistry_1.registerColor)('editorSuggestWidget.background', { dark: colorRegistry_1.editorWidgetBackground, light: colorRegistry_1.editorWidgetBackground, hcDark: colorRegistry_1.editorWidgetBackground, hcLight: colorRegistry_1.editorWidgetBackground }, nls.localize('editorSuggestWidgetBackground', 'Background color of the suggest widget.'));
    (0, colorRegistry_1.registerColor)('editorSuggestWidget.border', { dark: colorRegistry_1.editorWidgetBorder, light: colorRegistry_1.editorWidgetBorder, hcDark: colorRegistry_1.editorWidgetBorder, hcLight: colorRegistry_1.editorWidgetBorder }, nls.localize('editorSuggestWidgetBorder', 'Border color of the suggest widget.'));
    const editorSuggestWidgetForeground = (0, colorRegistry_1.registerColor)('editorSuggestWidget.foreground', { dark: colorRegistry_1.editorForeground, light: colorRegistry_1.editorForeground, hcDark: colorRegistry_1.editorForeground, hcLight: colorRegistry_1.editorForeground }, nls.localize('editorSuggestWidgetForeground', 'Foreground color of the suggest widget.'));
    (0, colorRegistry_1.registerColor)('editorSuggestWidget.selectedForeground', { dark: colorRegistry_1.quickInputListFocusForeground, light: colorRegistry_1.quickInputListFocusForeground, hcDark: colorRegistry_1.quickInputListFocusForeground, hcLight: colorRegistry_1.quickInputListFocusForeground }, nls.localize('editorSuggestWidgetSelectedForeground', 'Foreground color of the selected entry in the suggest widget.'));
    (0, colorRegistry_1.registerColor)('editorSuggestWidget.selectedIconForeground', { dark: colorRegistry_1.quickInputListFocusIconForeground, light: colorRegistry_1.quickInputListFocusIconForeground, hcDark: colorRegistry_1.quickInputListFocusIconForeground, hcLight: colorRegistry_1.quickInputListFocusIconForeground }, nls.localize('editorSuggestWidgetSelectedIconForeground', 'Icon foreground color of the selected entry in the suggest widget.'));
    exports.editorSuggestWidgetSelectedBackground = (0, colorRegistry_1.registerColor)('editorSuggestWidget.selectedBackground', { dark: colorRegistry_1.quickInputListFocusBackground, light: colorRegistry_1.quickInputListFocusBackground, hcDark: colorRegistry_1.quickInputListFocusBackground, hcLight: colorRegistry_1.quickInputListFocusBackground }, nls.localize('editorSuggestWidgetSelectedBackground', 'Background color of the selected entry in the suggest widget.'));
    (0, colorRegistry_1.registerColor)('editorSuggestWidget.highlightForeground', { dark: colorRegistry_1.listHighlightForeground, light: colorRegistry_1.listHighlightForeground, hcDark: colorRegistry_1.listHighlightForeground, hcLight: colorRegistry_1.listHighlightForeground }, nls.localize('editorSuggestWidgetHighlightForeground', 'Color of the match highlights in the suggest widget.'));
    (0, colorRegistry_1.registerColor)('editorSuggestWidget.focusHighlightForeground', { dark: colorRegistry_1.listFocusHighlightForeground, light: colorRegistry_1.listFocusHighlightForeground, hcDark: colorRegistry_1.listFocusHighlightForeground, hcLight: colorRegistry_1.listFocusHighlightForeground }, nls.localize('editorSuggestWidgetFocusHighlightForeground', 'Color of the match highlights in the suggest widget when an item is focused.'));
    (0, colorRegistry_1.registerColor)('editorSuggestWidgetStatus.foreground', { dark: (0, colorRegistry_1.transparent)(editorSuggestWidgetForeground, .5), light: (0, colorRegistry_1.transparent)(editorSuggestWidgetForeground, .5), hcDark: (0, colorRegistry_1.transparent)(editorSuggestWidgetForeground, .5), hcLight: (0, colorRegistry_1.transparent)(editorSuggestWidgetForeground, .5) }, nls.localize('editorSuggestWidgetStatusForeground', 'Foreground color of the suggest widget status.'));
    var State;
    (function (State) {
        State[State["Hidden"] = 0] = "Hidden";
        State[State["Loading"] = 1] = "Loading";
        State[State["Empty"] = 2] = "Empty";
        State[State["Open"] = 3] = "Open";
        State[State["Frozen"] = 4] = "Frozen";
        State[State["Details"] = 5] = "Details";
    })(State || (State = {}));
    class PersistedWidgetSize {
        constructor(_service, editor) {
            this._service = _service;
            this._key = `suggestWidget.size/${editor.getEditorType()}/${editor instanceof embeddedCodeEditorWidget_1.EmbeddedCodeEditorWidget}`;
        }
        restore() {
            const raw = this._service.get(this._key, 0 /* StorageScope.PROFILE */) ?? '';
            try {
                const obj = JSON.parse(raw);
                if (dom.Dimension.is(obj)) {
                    return dom.Dimension.lift(obj);
                }
            }
            catch {
                // ignore
            }
            return undefined;
        }
        store(size) {
            this._service.store(this._key, JSON.stringify(size), 0 /* StorageScope.PROFILE */, 1 /* StorageTarget.MACHINE */);
        }
        reset() {
            this._service.remove(this._key, 0 /* StorageScope.PROFILE */);
        }
    }
    let SuggestWidget = class SuggestWidget {
        static { SuggestWidget_1 = this; }
        static { this.LOADING_MESSAGE = nls.localize('suggestWidget.loading', "Loading..."); }
        static { this.NO_SUGGESTIONS_MESSAGE = nls.localize('suggestWidget.noSuggestions', "No suggestions."); }
        constructor(editor, _storageService, _contextKeyService, _themeService, instantiationService) {
            this.editor = editor;
            this._storageService = _storageService;
            this._state = 0 /* State.Hidden */;
            this._isAuto = false;
            this._pendingLayout = new lifecycle_1.MutableDisposable();
            this._pendingShowDetails = new lifecycle_1.MutableDisposable();
            this._ignoreFocusEvents = false;
            this._forceRenderingAbove = false;
            this._explainMode = false;
            this._showTimeout = new async_1.TimeoutTimer();
            this._disposables = new lifecycle_1.DisposableStore();
            this._onDidSelect = new event_1.PauseableEmitter();
            this._onDidFocus = new event_1.PauseableEmitter();
            this._onDidHide = new event_1.Emitter();
            this._onDidShow = new event_1.Emitter();
            this.onDidSelect = this._onDidSelect.event;
            this.onDidFocus = this._onDidFocus.event;
            this.onDidHide = this._onDidHide.event;
            this.onDidShow = this._onDidShow.event;
            this._onDetailsKeydown = new event_1.Emitter();
            this.onDetailsKeyDown = this._onDetailsKeydown.event;
            this.element = new resizable_1.ResizableHTMLElement();
            this.element.domNode.classList.add('editor-widget', 'suggest-widget');
            this._contentWidget = new SuggestContentWidget(this, editor);
            this._persistedSize = new PersistedWidgetSize(_storageService, editor);
            class ResizeState {
                constructor(persistedSize, currentSize, persistHeight = false, persistWidth = false) {
                    this.persistedSize = persistedSize;
                    this.currentSize = currentSize;
                    this.persistHeight = persistHeight;
                    this.persistWidth = persistWidth;
                }
            }
            let state;
            this._disposables.add(this.element.onDidWillResize(() => {
                this._contentWidget.lockPreference();
                state = new ResizeState(this._persistedSize.restore(), this.element.size);
            }));
            this._disposables.add(this.element.onDidResize(e => {
                this._resize(e.dimension.width, e.dimension.height);
                if (state) {
                    state.persistHeight = state.persistHeight || !!e.north || !!e.south;
                    state.persistWidth = state.persistWidth || !!e.east || !!e.west;
                }
                if (!e.done) {
                    return;
                }
                if (state) {
                    // only store width or height value that have changed and also
                    // only store changes that are above a certain threshold
                    const { itemHeight, defaultSize } = this.getLayoutInfo();
                    const threshold = Math.round(itemHeight / 2);
                    let { width, height } = this.element.size;
                    if (!state.persistHeight || Math.abs(state.currentSize.height - height) <= threshold) {
                        height = state.persistedSize?.height ?? defaultSize.height;
                    }
                    if (!state.persistWidth || Math.abs(state.currentSize.width - width) <= threshold) {
                        width = state.persistedSize?.width ?? defaultSize.width;
                    }
                    this._persistedSize.store(new dom.Dimension(width, height));
                }
                // reset working state
                this._contentWidget.unlockPreference();
                state = undefined;
            }));
            this._messageElement = dom.append(this.element.domNode, dom.$('.message'));
            this._listElement = dom.append(this.element.domNode, dom.$('.tree'));
            const details = this._disposables.add(instantiationService.createInstance(suggestWidgetDetails_1.SuggestDetailsWidget, this.editor));
            details.onDidClose(this.toggleDetails, this, this._disposables);
            this._details = new suggestWidgetDetails_1.SuggestDetailsOverlay(details, this.editor);
            const applyIconStyle = () => this.element.domNode.classList.toggle('no-icons', !this.editor.getOption(117 /* EditorOption.suggest */).showIcons);
            applyIconStyle();
            const renderer = instantiationService.createInstance(suggestWidgetRenderer_1.ItemRenderer, this.editor);
            this._disposables.add(renderer);
            this._disposables.add(renderer.onDidToggleDetails(() => this.toggleDetails()));
            this._list = new listWidget_1.List('SuggestWidget', this._listElement, {
                getHeight: (_element) => this.getLayoutInfo().itemHeight,
                getTemplateId: (_element) => 'suggestion'
            }, [renderer], {
                alwaysConsumeMouseWheel: true,
                useShadows: false,
                mouseSupport: false,
                multipleSelectionSupport: false,
                accessibilityProvider: {
                    getRole: () => 'option',
                    getWidgetAriaLabel: () => nls.localize('suggest', "Suggest"),
                    getWidgetRole: () => 'listbox',
                    getAriaLabel: (item) => {
                        let label = item.textLabel;
                        if (typeof item.completion.label !== 'string') {
                            const { detail, description } = item.completion.label;
                            if (detail && description) {
                                label = nls.localize('label.full', '{0} {1}, {2}', label, detail, description);
                            }
                            else if (detail) {
                                label = nls.localize('label.detail', '{0} {1}', label, detail);
                            }
                            else if (description) {
                                label = nls.localize('label.desc', '{0}, {1}', label, description);
                            }
                        }
                        if (!item.isResolved || !this._isDetailsVisible()) {
                            return label;
                        }
                        const { documentation, detail } = item.completion;
                        const docs = strings.format('{0}{1}', detail || '', documentation ? (typeof documentation === 'string' ? documentation : documentation.value) : '');
                        return nls.localize('ariaCurrenttSuggestionReadDetails', "{0}, docs: {1}", label, docs);
                    },
                }
            });
            this._list.style((0, defaultStyles_1.getListStyles)({
                listInactiveFocusBackground: exports.editorSuggestWidgetSelectedBackground,
                listInactiveFocusOutline: colorRegistry_1.activeContrastBorder
            }));
            this._status = instantiationService.createInstance(suggestWidgetStatus_1.SuggestWidgetStatus, this.element.domNode, suggest_1.suggestWidgetStatusbarMenu);
            const applyStatusBarStyle = () => this.element.domNode.classList.toggle('with-status-bar', this.editor.getOption(117 /* EditorOption.suggest */).showStatusBar);
            applyStatusBarStyle();
            this._disposables.add(_themeService.onDidColorThemeChange(t => this._onThemeChange(t)));
            this._onThemeChange(_themeService.getColorTheme());
            this._disposables.add(this._list.onMouseDown(e => this._onListMouseDownOrTap(e)));
            this._disposables.add(this._list.onTap(e => this._onListMouseDownOrTap(e)));
            this._disposables.add(this._list.onDidChangeSelection(e => this._onListSelection(e)));
            this._disposables.add(this._list.onDidChangeFocus(e => this._onListFocus(e)));
            this._disposables.add(this.editor.onDidChangeCursorSelection(() => this._onCursorSelectionChanged()));
            this._disposables.add(this.editor.onDidChangeConfiguration(e => {
                if (e.hasChanged(117 /* EditorOption.suggest */)) {
                    applyStatusBarStyle();
                    applyIconStyle();
                }
            }));
            this._ctxSuggestWidgetVisible = suggest_1.Context.Visible.bindTo(_contextKeyService);
            this._ctxSuggestWidgetDetailsVisible = suggest_1.Context.DetailsVisible.bindTo(_contextKeyService);
            this._ctxSuggestWidgetMultipleSuggestions = suggest_1.Context.MultipleSuggestions.bindTo(_contextKeyService);
            this._ctxSuggestWidgetHasFocusedSuggestion = suggest_1.Context.HasFocusedSuggestion.bindTo(_contextKeyService);
            this._disposables.add(dom.addStandardDisposableListener(this._details.widget.domNode, 'keydown', e => {
                this._onDetailsKeydown.fire(e);
            }));
            this._disposables.add(this.editor.onMouseDown((e) => this._onEditorMouseDown(e)));
        }
        dispose() {
            this._details.widget.dispose();
            this._details.dispose();
            this._list.dispose();
            this._status.dispose();
            this._disposables.dispose();
            this._loadingTimeout?.dispose();
            this._pendingLayout.dispose();
            this._pendingShowDetails.dispose();
            this._showTimeout.dispose();
            this._contentWidget.dispose();
            this.element.dispose();
        }
        _onEditorMouseDown(mouseEvent) {
            if (this._details.widget.domNode.contains(mouseEvent.target.element)) {
                // Clicking inside details
                this._details.widget.domNode.focus();
            }
            else {
                // Clicking outside details and inside suggest
                if (this.element.domNode.contains(mouseEvent.target.element)) {
                    this.editor.focus();
                }
            }
        }
        _onCursorSelectionChanged() {
            if (this._state !== 0 /* State.Hidden */) {
                this._contentWidget.layout();
            }
        }
        _onListMouseDownOrTap(e) {
            if (typeof e.element === 'undefined' || typeof e.index === 'undefined') {
                return;
            }
            // prevent stealing browser focus from the editor
            e.browserEvent.preventDefault();
            e.browserEvent.stopPropagation();
            this._select(e.element, e.index);
        }
        _onListSelection(e) {
            if (e.elements.length) {
                this._select(e.elements[0], e.indexes[0]);
            }
        }
        _select(item, index) {
            const completionModel = this._completionModel;
            if (completionModel) {
                this._onDidSelect.fire({ item, index, model: completionModel });
                this.editor.focus();
            }
        }
        _onThemeChange(theme) {
            this._details.widget.borderWidth = (0, theme_1.isHighContrast)(theme.type) ? 2 : 1;
        }
        _onListFocus(e) {
            if (this._ignoreFocusEvents) {
                return;
            }
            if (!e.elements.length) {
                if (this._currentSuggestionDetails) {
                    this._currentSuggestionDetails.cancel();
                    this._currentSuggestionDetails = undefined;
                    this._focusedItem = undefined;
                }
                this.editor.setAriaOptions({ activeDescendant: undefined });
                this._ctxSuggestWidgetHasFocusedSuggestion.set(false);
                return;
            }
            if (!this._completionModel) {
                return;
            }
            this._ctxSuggestWidgetHasFocusedSuggestion.set(true);
            const item = e.elements[0];
            const index = e.indexes[0];
            if (item !== this._focusedItem) {
                this._currentSuggestionDetails?.cancel();
                this._currentSuggestionDetails = undefined;
                this._focusedItem = item;
                this._list.reveal(index);
                this._currentSuggestionDetails = (0, async_1.createCancelablePromise)(async (token) => {
                    const loading = (0, async_1.disposableTimeout)(() => {
                        if (this._isDetailsVisible()) {
                            this.showDetails(true);
                        }
                    }, 250);
                    const sub = token.onCancellationRequested(() => loading.dispose());
                    try {
                        return await item.resolve(token);
                    }
                    finally {
                        loading.dispose();
                        sub.dispose();
                    }
                });
                this._currentSuggestionDetails.then(() => {
                    if (index >= this._list.length || item !== this._list.element(index)) {
                        return;
                    }
                    // item can have extra information, so re-render
                    this._ignoreFocusEvents = true;
                    this._list.splice(index, 1, [item]);
                    this._list.setFocus([index]);
                    this._ignoreFocusEvents = false;
                    if (this._isDetailsVisible()) {
                        this.showDetails(false);
                    }
                    else {
                        this.element.domNode.classList.remove('docs-side');
                    }
                    this.editor.setAriaOptions({ activeDescendant: (0, suggestWidgetRenderer_1.getAriaId)(index) });
                }).catch(errors_1.onUnexpectedError);
            }
            // emit an event
            this._onDidFocus.fire({ item, index, model: this._completionModel });
        }
        _setState(state) {
            if (this._state === state) {
                return;
            }
            this._state = state;
            this.element.domNode.classList.toggle('frozen', state === 4 /* State.Frozen */);
            this.element.domNode.classList.remove('message');
            switch (state) {
                case 0 /* State.Hidden */:
                    dom.hide(this._messageElement, this._listElement, this._status.element);
                    this._details.hide(true);
                    this._status.hide();
                    this._contentWidget.hide();
                    this._ctxSuggestWidgetVisible.reset();
                    this._ctxSuggestWidgetMultipleSuggestions.reset();
                    this._ctxSuggestWidgetHasFocusedSuggestion.reset();
                    this._showTimeout.cancel();
                    this.element.domNode.classList.remove('visible');
                    this._list.splice(0, this._list.length);
                    this._focusedItem = undefined;
                    this._cappedHeight = undefined;
                    this._explainMode = false;
                    break;
                case 1 /* State.Loading */:
                    this.element.domNode.classList.add('message');
                    this._messageElement.textContent = SuggestWidget_1.LOADING_MESSAGE;
                    dom.hide(this._listElement, this._status.element);
                    dom.show(this._messageElement);
                    this._details.hide();
                    this._show();
                    this._focusedItem = undefined;
                    (0, aria_1.status)(SuggestWidget_1.LOADING_MESSAGE);
                    break;
                case 2 /* State.Empty */:
                    this.element.domNode.classList.add('message');
                    this._messageElement.textContent = SuggestWidget_1.NO_SUGGESTIONS_MESSAGE;
                    dom.hide(this._listElement, this._status.element);
                    dom.show(this._messageElement);
                    this._details.hide();
                    this._show();
                    this._focusedItem = undefined;
                    (0, aria_1.status)(SuggestWidget_1.NO_SUGGESTIONS_MESSAGE);
                    break;
                case 3 /* State.Open */:
                    dom.hide(this._messageElement);
                    dom.show(this._listElement, this._status.element);
                    this._show();
                    break;
                case 4 /* State.Frozen */:
                    dom.hide(this._messageElement);
                    dom.show(this._listElement, this._status.element);
                    this._show();
                    break;
                case 5 /* State.Details */:
                    dom.hide(this._messageElement);
                    dom.show(this._listElement, this._status.element);
                    this._details.show();
                    this._show();
                    break;
            }
        }
        _show() {
            this._status.show();
            this._contentWidget.show();
            this._layout(this._persistedSize.restore());
            this._ctxSuggestWidgetVisible.set(true);
            this._showTimeout.cancelAndSet(() => {
                this.element.domNode.classList.add('visible');
                this._onDidShow.fire(this);
            }, 100);
        }
        showTriggered(auto, delay) {
            if (this._state !== 0 /* State.Hidden */) {
                return;
            }
            this._contentWidget.setPosition(this.editor.getPosition());
            this._isAuto = !!auto;
            if (!this._isAuto) {
                this._loadingTimeout = (0, async_1.disposableTimeout)(() => this._setState(1 /* State.Loading */), delay);
            }
        }
        showSuggestions(completionModel, selectionIndex, isFrozen, isAuto, noFocus) {
            this._contentWidget.setPosition(this.editor.getPosition());
            this._loadingTimeout?.dispose();
            this._currentSuggestionDetails?.cancel();
            this._currentSuggestionDetails = undefined;
            if (this._completionModel !== completionModel) {
                this._completionModel = completionModel;
            }
            if (isFrozen && this._state !== 2 /* State.Empty */ && this._state !== 0 /* State.Hidden */) {
                this._setState(4 /* State.Frozen */);
                return;
            }
            const visibleCount = this._completionModel.items.length;
            const isEmpty = visibleCount === 0;
            this._ctxSuggestWidgetMultipleSuggestions.set(visibleCount > 1);
            if (isEmpty) {
                this._setState(isAuto ? 0 /* State.Hidden */ : 2 /* State.Empty */);
                this._completionModel = undefined;
                return;
            }
            this._focusedItem = undefined;
            // calling list.splice triggers focus event which this widget forwards. That can lead to
            // suggestions being cancelled and the widget being cleared (and hidden). All this happens
            // before revealing and focusing is done which means revealing and focusing will fail when
            // they get run.
            this._onDidFocus.pause();
            this._onDidSelect.pause();
            try {
                this._list.splice(0, this._list.length, this._completionModel.items);
                this._setState(isFrozen ? 4 /* State.Frozen */ : 3 /* State.Open */);
                this._list.reveal(selectionIndex, 0);
                this._list.setFocus(noFocus ? [] : [selectionIndex]);
            }
            finally {
                this._onDidFocus.resume();
                this._onDidSelect.resume();
            }
            this._pendingLayout.value = dom.runAtThisOrScheduleAtNextAnimationFrame(() => {
                this._pendingLayout.clear();
                this._layout(this.element.size);
                // Reset focus border
                this._details.widget.domNode.classList.remove('focused');
            });
        }
        focusSelected() {
            if (this._list.length > 0) {
                this._list.setFocus([0]);
            }
        }
        selectNextPage() {
            switch (this._state) {
                case 0 /* State.Hidden */:
                    return false;
                case 5 /* State.Details */:
                    this._details.widget.pageDown();
                    return true;
                case 1 /* State.Loading */:
                    return !this._isAuto;
                default:
                    this._list.focusNextPage();
                    return true;
            }
        }
        selectNext() {
            switch (this._state) {
                case 0 /* State.Hidden */:
                    return false;
                case 1 /* State.Loading */:
                    return !this._isAuto;
                default:
                    this._list.focusNext(1, true);
                    return true;
            }
        }
        selectLast() {
            switch (this._state) {
                case 0 /* State.Hidden */:
                    return false;
                case 5 /* State.Details */:
                    this._details.widget.scrollBottom();
                    return true;
                case 1 /* State.Loading */:
                    return !this._isAuto;
                default:
                    this._list.focusLast();
                    return true;
            }
        }
        selectPreviousPage() {
            switch (this._state) {
                case 0 /* State.Hidden */:
                    return false;
                case 5 /* State.Details */:
                    this._details.widget.pageUp();
                    return true;
                case 1 /* State.Loading */:
                    return !this._isAuto;
                default:
                    this._list.focusPreviousPage();
                    return true;
            }
        }
        selectPrevious() {
            switch (this._state) {
                case 0 /* State.Hidden */:
                    return false;
                case 1 /* State.Loading */:
                    return !this._isAuto;
                default:
                    this._list.focusPrevious(1, true);
                    return false;
            }
        }
        selectFirst() {
            switch (this._state) {
                case 0 /* State.Hidden */:
                    return false;
                case 5 /* State.Details */:
                    this._details.widget.scrollTop();
                    return true;
                case 1 /* State.Loading */:
                    return !this._isAuto;
                default:
                    this._list.focusFirst();
                    return true;
            }
        }
        getFocusedItem() {
            if (this._state !== 0 /* State.Hidden */
                && this._state !== 2 /* State.Empty */
                && this._state !== 1 /* State.Loading */
                && this._completionModel
                && this._list.getFocus().length > 0) {
                return {
                    item: this._list.getFocusedElements()[0],
                    index: this._list.getFocus()[0],
                    model: this._completionModel
                };
            }
            return undefined;
        }
        toggleDetailsFocus() {
            if (this._state === 5 /* State.Details */) {
                this._setState(3 /* State.Open */);
                this._details.widget.domNode.classList.remove('focused');
            }
            else if (this._state === 3 /* State.Open */ && this._isDetailsVisible()) {
                this._setState(5 /* State.Details */);
                this._details.widget.domNode.classList.add('focused');
            }
        }
        toggleDetails() {
            if (this._isDetailsVisible()) {
                // hide details widget
                this._pendingShowDetails.clear();
                this._ctxSuggestWidgetDetailsVisible.set(false);
                this._setDetailsVisible(false);
                this._details.hide();
                this.element.domNode.classList.remove('shows-details');
            }
            else if (((0, suggestWidgetDetails_1.canExpandCompletionItem)(this._list.getFocusedElements()[0]) || this._explainMode) && (this._state === 3 /* State.Open */ || this._state === 5 /* State.Details */ || this._state === 4 /* State.Frozen */)) {
                // show details widget (iff possible)
                this._ctxSuggestWidgetDetailsVisible.set(true);
                this._setDetailsVisible(true);
                this.showDetails(false);
            }
        }
        showDetails(loading) {
            this._pendingShowDetails.value = dom.runAtThisOrScheduleAtNextAnimationFrame(() => {
                this._pendingShowDetails.clear();
                this._details.show();
                if (loading) {
                    this._details.widget.renderLoading();
                }
                else {
                    this._details.widget.renderItem(this._list.getFocusedElements()[0], this._explainMode);
                }
                this._positionDetails();
                this.editor.focus();
                this.element.domNode.classList.add('shows-details');
            });
        }
        toggleExplainMode() {
            if (this._list.getFocusedElements()[0]) {
                this._explainMode = !this._explainMode;
                if (!this._isDetailsVisible()) {
                    this.toggleDetails();
                }
                else {
                    this.showDetails(false);
                }
            }
        }
        resetPersistedSize() {
            this._persistedSize.reset();
        }
        hideWidget() {
            this._pendingLayout.clear();
            this._pendingShowDetails.clear();
            this._loadingTimeout?.dispose();
            this._setState(0 /* State.Hidden */);
            this._onDidHide.fire(this);
            this.element.clearSashHoverState();
            // ensure that a reasonable widget height is persisted so that
            // accidential "resize-to-single-items" cases aren't happening
            const dim = this._persistedSize.restore();
            const minPersistedHeight = Math.ceil(this.getLayoutInfo().itemHeight * 4.3);
            if (dim && dim.height < minPersistedHeight) {
                this._persistedSize.store(dim.with(undefined, minPersistedHeight));
            }
        }
        isFrozen() {
            return this._state === 4 /* State.Frozen */;
        }
        _afterRender(position) {
            if (position === null) {
                if (this._isDetailsVisible()) {
                    this._details.hide(); //todo@jrieken soft-hide
                }
                return;
            }
            if (this._state === 2 /* State.Empty */ || this._state === 1 /* State.Loading */) {
                // no special positioning when widget isn't showing list
                return;
            }
            if (this._isDetailsVisible()) {
                this._details.show();
            }
            this._positionDetails();
        }
        _layout(size) {
            if (!this.editor.hasModel()) {
                return;
            }
            if (!this.editor.getDomNode()) {
                // happens when running tests
                return;
            }
            const bodyBox = dom.getClientArea(this.element.domNode.ownerDocument.body);
            const info = this.getLayoutInfo();
            if (!size) {
                size = info.defaultSize;
            }
            let height = size.height;
            let width = size.width;
            // status bar
            this._status.element.style.height = `${info.itemHeight}px`;
            if (this._state === 2 /* State.Empty */ || this._state === 1 /* State.Loading */) {
                // showing a message only
                height = info.itemHeight + info.borderHeight;
                width = info.defaultSize.width / 2;
                this.element.enableSashes(false, false, false, false);
                this.element.minSize = this.element.maxSize = new dom.Dimension(width, height);
                this._contentWidget.setPreference(2 /* ContentWidgetPositionPreference.BELOW */);
            }
            else {
                // showing items
                // width math
                const maxWidth = bodyBox.width - info.borderHeight - 2 * info.horizontalPadding;
                if (width > maxWidth) {
                    width = maxWidth;
                }
                const preferredWidth = this._completionModel ? this._completionModel.stats.pLabelLen * info.typicalHalfwidthCharacterWidth : width;
                // height math
                const fullHeight = info.statusBarHeight + this._list.contentHeight + info.borderHeight;
                const minHeight = info.itemHeight + info.statusBarHeight;
                const editorBox = dom.getDomNodePagePosition(this.editor.getDomNode());
                const cursorBox = this.editor.getScrolledVisiblePosition(this.editor.getPosition());
                const cursorBottom = editorBox.top + cursorBox.top + cursorBox.height;
                const maxHeightBelow = Math.min(bodyBox.height - cursorBottom - info.verticalPadding, fullHeight);
                const availableSpaceAbove = editorBox.top + cursorBox.top - info.verticalPadding;
                const maxHeightAbove = Math.min(availableSpaceAbove, fullHeight);
                let maxHeight = Math.min(Math.max(maxHeightAbove, maxHeightBelow) + info.borderHeight, fullHeight);
                if (height === this._cappedHeight?.capped) {
                    // Restore the old (wanted) height when the current
                    // height is capped to fit
                    height = this._cappedHeight.wanted;
                }
                if (height < minHeight) {
                    height = minHeight;
                }
                if (height > maxHeight) {
                    height = maxHeight;
                }
                const forceRenderingAboveRequiredSpace = 150;
                if (height > maxHeightBelow || (this._forceRenderingAbove && availableSpaceAbove > forceRenderingAboveRequiredSpace)) {
                    this._contentWidget.setPreference(1 /* ContentWidgetPositionPreference.ABOVE */);
                    this.element.enableSashes(true, true, false, false);
                    maxHeight = maxHeightAbove;
                }
                else {
                    this._contentWidget.setPreference(2 /* ContentWidgetPositionPreference.BELOW */);
                    this.element.enableSashes(false, true, true, false);
                    maxHeight = maxHeightBelow;
                }
                this.element.preferredSize = new dom.Dimension(preferredWidth, info.defaultSize.height);
                this.element.maxSize = new dom.Dimension(maxWidth, maxHeight);
                this.element.minSize = new dom.Dimension(220, minHeight);
                // Know when the height was capped to fit and remember
                // the wanted height for later. This is required when going
                // left to widen suggestions.
                this._cappedHeight = height === fullHeight
                    ? { wanted: this._cappedHeight?.wanted ?? size.height, capped: height }
                    : undefined;
            }
            this._resize(width, height);
        }
        _resize(width, height) {
            const { width: maxWidth, height: maxHeight } = this.element.maxSize;
            width = Math.min(maxWidth, width);
            height = Math.min(maxHeight, height);
            const { statusBarHeight } = this.getLayoutInfo();
            this._list.layout(height - statusBarHeight, width);
            this._listElement.style.height = `${height - statusBarHeight}px`;
            this.element.layout(height, width);
            this._contentWidget.layout();
            this._positionDetails();
        }
        _positionDetails() {
            if (this._isDetailsVisible()) {
                this._details.placeAtAnchor(this.element.domNode, this._contentWidget.getPosition()?.preference[0] === 2 /* ContentWidgetPositionPreference.BELOW */);
            }
        }
        getLayoutInfo() {
            const fontInfo = this.editor.getOption(50 /* EditorOption.fontInfo */);
            const itemHeight = (0, numbers_1.clamp)(this.editor.getOption(119 /* EditorOption.suggestLineHeight */) || fontInfo.lineHeight, 8, 1000);
            const statusBarHeight = !this.editor.getOption(117 /* EditorOption.suggest */).showStatusBar || this._state === 2 /* State.Empty */ || this._state === 1 /* State.Loading */ ? 0 : itemHeight;
            const borderWidth = this._details.widget.borderWidth;
            const borderHeight = 2 * borderWidth;
            return {
                itemHeight,
                statusBarHeight,
                borderWidth,
                borderHeight,
                typicalHalfwidthCharacterWidth: fontInfo.typicalHalfwidthCharacterWidth,
                verticalPadding: 22,
                horizontalPadding: 14,
                defaultSize: new dom.Dimension(430, statusBarHeight + 12 * itemHeight + borderHeight)
            };
        }
        _isDetailsVisible() {
            return this._storageService.getBoolean('expandSuggestionDocs', 0 /* StorageScope.PROFILE */, false);
        }
        _setDetailsVisible(value) {
            this._storageService.store('expandSuggestionDocs', value, 0 /* StorageScope.PROFILE */, 0 /* StorageTarget.USER */);
        }
        forceRenderingAbove() {
            if (!this._forceRenderingAbove) {
                this._forceRenderingAbove = true;
                this._layout(this._persistedSize.restore());
            }
        }
        stopForceRenderingAbove() {
            this._forceRenderingAbove = false;
        }
    };
    exports.SuggestWidget = SuggestWidget;
    exports.SuggestWidget = SuggestWidget = SuggestWidget_1 = __decorate([
        __param(1, storage_1.IStorageService),
        __param(2, contextkey_1.IContextKeyService),
        __param(3, themeService_1.IThemeService),
        __param(4, instantiation_1.IInstantiationService)
    ], SuggestWidget);
    class SuggestContentWidget {
        constructor(_widget, _editor) {
            this._widget = _widget;
            this._editor = _editor;
            this.allowEditorOverflow = true;
            this.suppressMouseDown = false;
            this._preferenceLocked = false;
            this._added = false;
            this._hidden = false;
        }
        dispose() {
            if (this._added) {
                this._added = false;
                this._editor.removeContentWidget(this);
            }
        }
        getId() {
            return 'editor.widget.suggestWidget';
        }
        getDomNode() {
            return this._widget.element.domNode;
        }
        show() {
            this._hidden = false;
            if (!this._added) {
                this._added = true;
                this._editor.addContentWidget(this);
            }
        }
        hide() {
            if (!this._hidden) {
                this._hidden = true;
                this.layout();
            }
        }
        layout() {
            this._editor.layoutContentWidget(this);
        }
        getPosition() {
            if (this._hidden || !this._position || !this._preference) {
                return null;
            }
            return {
                position: this._position,
                preference: [this._preference]
            };
        }
        beforeRender() {
            const { height, width } = this._widget.element.size;
            const { borderWidth, horizontalPadding } = this._widget.getLayoutInfo();
            return new dom.Dimension(width + 2 * borderWidth + horizontalPadding, height + 2 * borderWidth);
        }
        afterRender(position) {
            this._widget._afterRender(position);
        }
        setPreference(preference) {
            if (!this._preferenceLocked) {
                this._preference = preference;
            }
        }
        lockPreference() {
            this._preferenceLocked = true;
        }
        unlockPreference() {
            this._preferenceLocked = false;
        }
        setPosition(position) {
            this._position = position;
        }
    }
    exports.SuggestContentWidget = SuggestContentWidget;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3VnZ2VzdFdpZGdldC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL2VkaXRvci9jb250cmliL3N1Z2dlc3QvYnJvd3Nlci9zdWdnZXN0V2lkZ2V0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7Ozs7SUFtQ2hHOztPQUVHO0lBQ0gsSUFBQSw2QkFBYSxFQUFDLGdDQUFnQyxFQUFFLEVBQUUsSUFBSSxFQUFFLHNDQUFzQixFQUFFLEtBQUssRUFBRSxzQ0FBc0IsRUFBRSxNQUFNLEVBQUUsc0NBQXNCLEVBQUUsT0FBTyxFQUFFLHNDQUFzQixFQUFFLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQywrQkFBK0IsRUFBRSx5Q0FBeUMsQ0FBQyxDQUFDLENBQUM7SUFDNVEsSUFBQSw2QkFBYSxFQUFDLDRCQUE0QixFQUFFLEVBQUUsSUFBSSxFQUFFLGtDQUFrQixFQUFFLEtBQUssRUFBRSxrQ0FBa0IsRUFBRSxNQUFNLEVBQUUsa0NBQWtCLEVBQUUsT0FBTyxFQUFFLGtDQUFrQixFQUFFLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQywyQkFBMkIsRUFBRSxxQ0FBcUMsQ0FBQyxDQUFDLENBQUM7SUFDaFAsTUFBTSw2QkFBNkIsR0FBRyxJQUFBLDZCQUFhLEVBQUMsZ0NBQWdDLEVBQUUsRUFBRSxJQUFJLEVBQUUsZ0NBQWdCLEVBQUUsS0FBSyxFQUFFLGdDQUFnQixFQUFFLE1BQU0sRUFBRSxnQ0FBZ0IsRUFBRSxPQUFPLEVBQUUsZ0NBQWdCLEVBQUUsRUFBRSxHQUFHLENBQUMsUUFBUSxDQUFDLCtCQUErQixFQUFFLHlDQUF5QyxDQUFDLENBQUMsQ0FBQztJQUMxUixJQUFBLDZCQUFhLEVBQUMsd0NBQXdDLEVBQUUsRUFBRSxJQUFJLEVBQUUsNkNBQTZCLEVBQUUsS0FBSyxFQUFFLDZDQUE2QixFQUFFLE1BQU0sRUFBRSw2Q0FBNkIsRUFBRSxPQUFPLEVB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