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
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/ui/list/listWidget", "vs/base/browser/ui/resizable/resizable", "vs/workbench/services/suggest/browser/simpleSuggestWidgetRenderer", "vs/base/common/async", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/numbers", "vs/nls", "vs/platform/instantiation/common/instantiation", "vs/editor/contrib/suggest/browser/suggestWidgetStatus", "vs/css!./media/suggest"], function (require, exports, dom, listWidget_1, resizable_1, simpleSuggestWidgetRenderer_1, async_1, event_1, lifecycle_1, numbers_1, nls_1, instantiation_1, suggestWidgetStatus_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SimpleSuggestWidget = void 0;
    const $ = dom.$;
    var State;
    (function (State) {
        State[State["Hidden"] = 0] = "Hidden";
        State[State["Loading"] = 1] = "Loading";
        State[State["Empty"] = 2] = "Empty";
        State[State["Open"] = 3] = "Open";
        State[State["Frozen"] = 4] = "Frozen";
        State[State["Details"] = 5] = "Details";
    })(State || (State = {}));
    var WidgetPositionPreference;
    (function (WidgetPositionPreference) {
        WidgetPositionPreference[WidgetPositionPreference["Above"] = 0] = "Above";
        WidgetPositionPreference[WidgetPositionPreference["Below"] = 1] = "Below";
    })(WidgetPositionPreference || (WidgetPositionPreference = {}));
    let SimpleSuggestWidget = class SimpleSuggestWidget {
        get list() { return this._list; }
        constructor(_container, _persistedSize, options, instantiationService) {
            this._container = _container;
            this._persistedSize = _persistedSize;
            this._state = 0 /* State.Hidden */;
            this._forceRenderingAbove = false;
            this._pendingLayout = new lifecycle_1.MutableDisposable();
            this._showTimeout = new async_1.TimeoutTimer();
            this._disposables = new lifecycle_1.DisposableStore();
            this._onDidSelect = new event_1.Emitter();
            this.onDidSelect = this._onDidSelect.event;
            this._onDidHide = new event_1.Emitter();
            this.onDidHide = this._onDidHide.event;
            this._onDidShow = new event_1.Emitter();
            this.onDidShow = this._onDidShow.event;
            this.element = new resizable_1.ResizableHTMLElement();
            this.element.domNode.classList.add('workbench-suggest-widget');
            this._container.appendChild(this.element.domNode);
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
                // this._preferenceLocked = true;
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
                    const { itemHeight, defaultSize } = this._getLayoutInfo();
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
                // this._preferenceLocked = false;
                state = undefined;
            }));
            const renderer = new simpleSuggestWidgetRenderer_1.SimpleSuggestWidgetItemRenderer();
            this._disposables.add(renderer);
            this._listElement = dom.append(this.element.domNode, $('.tree'));
            this._list = new listWidget_1.List('SuggestWidget', this._listElement, {
                getHeight: (_element) => this._getLayoutInfo().itemHeight,
                getTemplateId: (_element) => 'suggestion'
            }, [renderer], {
                alwaysConsumeMouseWheel: true,
                useShadows: false,
                mouseSupport: false,
                multipleSelectionSupport: false,
                accessibilityProvider: {
                    getRole: () => 'option',
                    getWidgetAriaLabel: () => (0, nls_1.localize)('suggest', "Suggest"),
                    getWidgetRole: () => 'listbox',
                    getAriaLabel: (item) => {
                        let label = item.completion.label;
                        if (typeof item.completion.label !== 'string') {
                            const { detail, description } = item.completion.label;
                            if (detail && description) {
                                label = (0, nls_1.localize)('label.full', '{0}{1}, {2}', label, detail, description);
                            }
                            else if (detail) {
                                label = (0, nls_1.localize)('label.detail', '{0}{1}', label, detail);
                            }
                            else if (description) {
                                label = (0, nls_1.localize)('label.desc', '{0}, {1}', label, description);
                            }
                        }
                        const { detail } = item.completion;
                        return (0, nls_1.localize)('ariaCurrenttSuggestionReadDetails', '{0}, docs: {1}', label, detail);
                        // if (!item.isResolved || !this._isDetailsVisible()) {
                        // 	return label;
                        // }
                        // const { documentation, detail } = item.completion;
                        // const docs = strings.format(
                        // 	'{0}{1}',
                        // 	detail || '',
                        // 	documentation ? (typeof documentation === 'string' ? documentation : documentation.value) : '');
                        // return nls.localize('ariaCurrenttSuggestionReadDetails', "{0}, docs: {1}", label, docs);
                    },
                }
            });
            if (options.statusBarMenuId) {
                this._status = instantiationService.createInstance(suggestWidgetStatus_1.SuggestWidgetStatus, this.element.domNode, options.statusBarMenuId);
                this.element.domNode.classList.toggle('with-status-bar', true);
            }
            this._disposables.add(this._list.onMouseDown(e => this._onListMouseDownOrTap(e)));
            this._disposables.add(this._list.onTap(e => this._onListMouseDownOrTap(e)));
            this._disposables.add(this._list.onDidChangeSelection(e => this._onListSelection(e)));
        }
        dispose() {
            this._disposables.dispose();
            this._status?.dispose();
            this.element.dispose();
        }
        showSuggestions(completionModel, selectionIndex, isFrozen, isAuto, cursorPosition) {
            this._cursorPosition = cursorPosition;
            // this._contentWidget.setPosition(this.editor.getPosition());
            // this._loadingTimeout?.dispose();
            // this._currentSuggestionDetails?.cancel();
            // this._currentSuggestionDetails = undefined;
            if (this._completionModel !== completionModel) {
                this._completionModel = completionModel;
            }
            if (isFrozen && this._state !== 2 /* State.Empty */ && this._state !== 0 /* State.Hidden */) {
                this._setState(4 /* State.Frozen */);
                return;
            }
            const visibleCount = this._completionModel.items.length;
            const isEmpty = visibleCount === 0;
            // this._ctxSuggestWidgetMultipleSuggestions.set(visibleCount > 1);
            if (isEmpty) {
                this._setState(isAuto ? 0 /* State.Hidden */ : 2 /* State.Empty */);
                this._completionModel = undefined;
                return;
            }
            // this._focusedItem = undefined;
            // calling list.splice triggers focus event which this widget forwards. That can lead to
            // suggestions being cancelled and the widget being cleared (and hidden). All this happens
            // before revealing and focusing is done which means revealing and focusing will fail when
            // they get run.
            // this._onDidFocus.pause();
            // this._onDidSelect.pause();
            try {
                this._list.splice(0, this._list.length, this._completionModel.items);
                this._setState(isFrozen ? 4 /* State.Frozen */ : 3 /* State.Open */);
                this._list.reveal(selectionIndex, 0);
                this._list.setFocus([selectionIndex]);
                // this._list.setFocus(noFocus ? [] : [selectionIndex]);
            }
            finally {
                // this._onDidFocus.resume();
                // this._onDidSelect.resume();
            }
            this._pendingLayout.value = dom.runAtThisOrScheduleAtNextAnimationFrame(() => {
                this._pendingLayout.clear();
                this._layout(this.element.size);
                // Reset focus border
                // this._details.widget.domNode.classList.remove('focused');
            });
        }
        setLineContext(lineContext) {
            if (this._completionModel) {
                this._completionModel.lineContext = lineContext;
            }
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
                    // dom.hide(this._messageElement, this._listElement, this._status.element);
                    dom.hide(this._listElement);
                    if (this._status) {
                        dom.hide(this._status?.element);
                    }
                    // this._details.hide(true);
                    this._status?.hide();
                    // this._contentWidget.hide();
                    // this._ctxSuggestWidgetVisible.reset();
                    // this._ctxSuggestWidgetMultipleSuggestions.reset();
                    // this._ctxSuggestWidgetHasFocusedSuggestion.reset();
                    this._showTimeout.cancel();
                    this.element.domNode.classList.remove('visible');
                    this._list.splice(0, this._list.length);
                    // this._focusedItem = undefined;
                    this._cappedHeight = undefined;
                    // this._explainMode = false;
                    break;
                case 1 /* State.Loading */:
                    this.element.domNode.classList.add('message');
                    // this._messageElement.textContent = SuggestWidget.LOADING_MESSAGE;
                    dom.hide(this._listElement);
                    if (this._status) {
                        dom.hide(this._status?.element);
                    }
                    // dom.show(this._messageElement);
                    // this._details.hide();
                    this._show();
                    // this._focusedItem = undefined;
                    break;
                case 2 /* State.Empty */:
                    this.element.domNode.classList.add('message');
                    // this._messageElement.textContent = SuggestWidget.NO_SUGGESTIONS_MESSAGE;
                    dom.hide(this._listElement);
                    if (this._status) {
                        dom.hide(this._status?.element);
                    }
                    // dom.show(this._messageElement);
                    // this._details.hide();
                    this._show();
                    // this._focusedItem = undefined;
                    break;
                case 3 /* State.Open */:
                    // dom.hide(this._messageElement);
                    dom.show(this._listElement);
                    if (this._status) {
                        dom.show(this._status?.element);
                    }
                    this._show();
                    break;
                case 4 /* State.Frozen */:
                    // dom.hide(this._messageElement);
                    dom.show(this._listElement);
                    if (this._status) {
                        dom.show(this._status?.element);
                    }
                    this._show();
                    break;
                case 5 /* State.Details */:
                    // dom.hide(this._messageElement);
                    dom.show(this._listElement);
                    if (this._status) {
                        dom.show(this._status?.element);
                    }
                    // this._details.show();
                    this._show();
                    break;
            }
        }
        _show() {
            // this._layout(this._persistedSize.restore());
            // dom.show(this.element.domNode);
            // this._onDidShow.fire();
            this._status?.show();
            // this._contentWidget.show();
            dom.show(this.element.domNode);
            this._layout(this._persistedSize.restore());
            // this._ctxSuggestWidgetVisible.set(true);
            this._showTimeout.cancelAndSet(() => {
                this.element.domNode.classList.add('visible');
                this._onDidShow.fire(this);
            }, 100);
        }
        hide() {
            this._pendingLayout.clear();
            // this._pendingShowDetails.clear();
            // this._loadingTimeout?.dispose();
            this._setState(0 /* State.Hidden */);
            this._onDidHide.fire(this);
            dom.hide(this.element.domNode);
            this.element.clearSashHoverState();
            // ensure that a reasonable widget height is persisted so that
            // accidential "resize-to-single-items" cases aren't happening
            const dim = this._persistedSize.restore();
            const minPersistedHeight = Math.ceil(this._getLayoutInfo().itemHeight * 4.3);
            if (dim && dim.height < minPersistedHeight) {
                this._persistedSize.store(dim.with(undefined, minPersistedHeight));
            }
        }
        _layout(size) {
            if (!this._cursorPosition) {
                return;
            }
            // if (!this.editor.hasModel()) {
            // 	return;
            // }
            // if (!this.editor.getDomNode()) {
            // 	// happens when running tests
            // 	return;
            // }
            const bodyBox = dom.getClientArea(document.body);
            const info = this._getLayoutInfo();
            if (!size) {
                size = info.defaultSize;
            }
            let height = size.height;
            let width = size.width;
            // status bar
            if (this._status) {
                this._status.element.style.lineHeight = `${info.itemHeight}px`;
            }
            // if (this._state === State.Empty || this._state === State.Loading) {
            // 	// showing a message only
            // 	height = info.itemHeight + info.borderHeight;
            // 	width = info.defaultSize.width / 2;
            // 	this.element.enableSashes(false, false, false, false);
            // 	this.element.minSize = this.element.maxSize = new dom.Dimension(width, height);
            // 	this._contentWidget.setPreference(ContentWidgetPositionPreference.BELOW);
            // } else {
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
            // const editorBox = dom.getDomNodePagePosition(this.editor.getDomNode());
            // const cursorBox = this.editor.getScrolledVisiblePosition(this.editor.getPosition());
            const editorBox = dom.getDomNodePagePosition(this._container);
            const cursorBox = this._cursorPosition; //this.editor.getScrolledVisiblePosition(this.editor.getPosition());
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
                this._preference = 0 /* WidgetPositionPreference.Above */;
                this.element.enableSashes(true, true, false, false);
                maxHeight = maxHeightAbove;
            }
            else {
                this._preference = 1 /* WidgetPositionPreference.Below */;
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
            // }
            this.element.domNode.style.left = `${this._cursorPosition.left}px`;
            if (this._preference === 0 /* WidgetPositionPreference.Above */) {
                this.element.domNode.style.top = `${this._cursorPosition.top - height - info.borderHeight}px`;
            }
            else {
                this.element.domNode.style.top = `${this._cursorPosition.top + this._cursorPosition.height}px`;
            }
            this._resize(width, height);
        }
        _resize(width, height) {
            const { width: maxWidth, height: maxHeight } = this.element.maxSize;
            width = Math.min(maxWidth, width);
            if (maxHeight) {
                height = Math.min(maxHeight, height);
            }
            const { statusBarHeight } = this._getLayoutInfo();
            this._list.layout(height - statusBarHeight, width);
            this._listElement.style.height = `${height - statusBarHeight}px`;
            this._listElement.style.width = `${width}px`;
            this._listElement.style.height = `${height}px`;
            this.element.layout(height, width);
            // this._positionDetails();
            // TODO: Position based on preference
        }
        _getLayoutInfo() {
            const fontInfo = {
                lineHeight: 20,
                typicalHalfwidthCharacterWidth: 10
            }; //this.editor.getOption(EditorOption.fontInfo);
            const itemHeight = (0, numbers_1.clamp)(fontInfo.lineHeight, 8, 1000);
            const statusBarHeight = 0; //!this.editor.getOption(EditorOption.suggest).showStatusBar || this._state === State.Empty || this._state === State.Loading ? 0 : itemHeight;
            const borderWidth = 1; //this._details.widget.borderWidth;
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
        _onListMouseDownOrTap(e) {
            if (typeof e.element === 'undefined' || typeof e.index === 'undefined') {
                return;
            }
            // prevent stealing browser focus from the terminal
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
            }
        }
        selectNext() {
            this._list.focusNext(1, true);
            const focus = this._list.getFocus();
            if (focus.length > 0) {
                this._list.reveal(focus[0]);
            }
            return true;
        }
        selectNextPage() {
            this._list.focusNextPage();
            const focus = this._list.getFocus();
            if (focus.length > 0) {
                this._list.reveal(focus[0]);
            }
            return true;
        }
        selectPrevious() {
            this._list.focusPrevious(1, true);
            const focus = this._list.getFocus();
            if (focus.length > 0) {
                this._list.reveal(focus[0]);
            }
            return true;
        }
        selectPreviousPage() {
            this._list.focusPreviousPage();
            const focus = this._list.getFocus();
            if (focus.length > 0) {
                this._list.reveal(focus[0]);
            }
            return true;
        }
        getFocusedItem() {
            if (this._completionModel) {
                return {
                    item: this._list.getFocusedElements()[0],
                    index: this._list.getFocus()[0],
                    model: this._completionModel
                };
            }
            return undefined;
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
    exports.SimpleSuggestWidget = SimpleSuggestWidget;
    exports.SimpleSuggestWidget = SimpleSuggestWidget = __decorate([
        __param(3, instantiation_1.IInstantiationService)
    ], SimpleSuggestWidget);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2ltcGxlU3VnZ2VzdFdpZGdldC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9zZXJ2aWNlcy9zdWdnZXN0L2Jyb3dzZXIvc2ltcGxlU3VnZ2VzdFdpZGdldC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUFtQmhHLE1BQU0sQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUM7SUFFaEIsSUFBVyxLQU9WO0lBUEQsV0FBVyxLQUFLO1FBQ2YscUNBQU0sQ0FBQTtRQUNOLHVDQUFPLENBQUE7UUFDUCxtQ0FBSyxDQUFBO1FBQ0wsaUNBQUksQ0FBQTtRQUNKLHFDQUFNLENBQUE7UUFDTix1Q0FBTyxDQUFBO0lBQ1IsQ0FBQyxFQVBVLEtBQUssS0FBTCxLQUFLLFFBT2Y7SUFjRCxJQUFXLHdCQUdWO0lBSEQsV0FBVyx3QkFBd0I7UUFDbEMseUVBQUssQ0FBQTtRQUNMLHlFQUFLLENBQUE7SUFDTixDQUFDLEVBSFUsd0JBQXdCLEtBQXhCLHdCQUF3QixRQUdsQztJQVVNLElBQU0sbUJBQW1CLEdBQXpCLE1BQU0sbUJBQW1CO1FBd0IvQixJQUFJLElBQUksS0FBaUMsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztRQUU3RCxZQUNrQixVQUF1QixFQUN2QixjQUE0QyxFQUM3RCxPQUF1QyxFQUNoQixvQkFBMkM7WUFIakQsZUFBVSxHQUFWLFVBQVUsQ0FBYTtZQUN2QixtQkFBYyxHQUFkLGNBQWMsQ0FBOEI7WUExQnRELFdBQU0sd0JBQXVCO1lBRzdCLHlCQUFvQixHQUFZLEtBQUssQ0FBQztZQUU3QixtQkFBYyxHQUFHLElBQUksNkJBQWlCLEVBQUUsQ0FBQztZQU96QyxpQkFBWSxHQUFHLElBQUksb0JBQVksRUFBRSxDQUFDO1lBQ2xDLGlCQUFZLEdBQUcsSUFBSSwyQkFBZSxFQUFFLENBQUM7WUFFckMsaUJBQVksR0FBRyxJQUFJLGVBQU8sRUFBNkIsQ0FBQztZQUNoRSxnQkFBVyxHQUFxQyxJQUFJLENBQUMsWUFBWSxDQUFDLEtBQUssQ0FBQztZQUNoRSxlQUFVLEdBQUcsSUFBSSxlQUFPLEVBQVEsQ0FBQztZQUN6QyxjQUFTLEdBQWdCLElBQUksQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDO1lBQ3ZDLGVBQVUsR0FBRyxJQUFJLGVBQU8sRUFBUSxDQUFDO1lBQ3pDLGNBQVMsR0FBZ0IsSUFBSSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUM7WUFVdkQsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLGdDQUFvQixFQUFFLENBQUM7WUFDMUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQywwQkFBMEIsQ0FBQyxDQUFDO1lBQy9ELElBQUksQ0FBQyxVQUFVLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUM7WUFFbEQsTUFBTSxXQUFXO2dCQUNoQixZQUNVLGFBQXdDLEVBQ3hDLFdBQTBCLEVBQzVCLGdCQUFnQixLQUFLLEVBQ3JCLGVBQWUsS0FBSztvQkFIbEIsa0JBQWEsR0FBYixhQUFhLENBQTJCO29CQUN4QyxnQkFBVyxHQUFYLFdBQVcsQ0FBZTtvQkFDNUIsa0JBQWEsR0FBYixhQUFhLENBQVE7b0JBQ3JCLGlCQUFZLEdBQVosWUFBWSxDQUFRO2dCQUN4QixDQUFDO2FBQ0w7WUFFRCxJQUFJLEtBQThCLENBQUM7WUFDbkMsSUFBSSxDQUFDLFlBQVksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxlQUFlLENBQUMsR0FBRyxFQUFFO2dCQUN2RCxpQ0FBaUM7Z0JBQ2pDLEtBQUssR0FBRyxJQUFJLFdBQVcsQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLE9BQU8sRUFBRSxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDM0UsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNKLElBQUksQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxFQUFFO2dCQUVsRCxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLENBQUM7Z0JBRXBELElBQUksS0FBSyxFQUFFO29CQUNWLEtBQUssQ0FBQyxhQUFhLEdBQUcsS0FBSyxDQUFDLGFBQWEsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQztvQkFDcEUsS0FBSyxDQUFDLFlBQVksR0FBRyxLQUFLLENBQUMsWUFBWSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO2lCQUNoRTtnQkFFRCxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksRUFBRTtvQkFDWixPQUFPO2lCQUNQO2dCQUVELElBQUksS0FBSyxFQUFFO29CQUNWLDhEQUE4RDtvQkFDOUQsd0RBQXdEO29CQUN4RCxNQUFNLEVBQUUsVUFBVSxFQUFFLFdBQVcsRUFBRSxHQUFHLElBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQztvQkFDMUQsTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxVQUFVLEdBQUcsQ0FBQyxDQUFDLENBQUM7b0JBQzdDLElBQUksRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUM7b0JBQzFDLElBQUksQ0FBQyxLQUFLLENBQUMsYUFBYSxJQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLFdBQVcsQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDLElBQUksU0FBUyxFQUFFO3dCQUNyRixNQUFNLEdBQUcsS0FBSyxDQUFDLGFBQWEsRUFBRSxNQUFNLElBQUksV0FBVyxDQUFDLE1BQU0sQ0FBQztxQkFDM0Q7b0JBQ0QsSUFBSSxDQUFDLEtBQUssQ0FBQyxZQUFZLElBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUMsSUFBSSxTQUFTLEVBQUU7d0JBQ2xGLEtBQUssR0FBRyxLQUFLLENBQUMsYUFBYSxFQUFFLEtBQUssSUFBSSxXQUFXLENBQUMsS0FBSyxDQUFDO3FCQUN4RDtvQkFDRCxJQUFJLENBQUMsY0FBYyxDQUFDLEtBQUssQ0FBQyxJQUFJLEdBQUcsQ0FBQyxTQUFTLENBQUMsS0FBSyxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUM7aUJBQzVEO2dCQUVELHNCQUFzQjtnQkFDdEIsa0NBQWtDO2dCQUNsQyxLQUFLLEdBQUcsU0FBUyxDQUFDO1lBQ25CLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFFSixNQUFNLFFBQVEsR0FBRyxJQUFJLDZEQUErQixFQUFFLENBQUM7WUFDdkQsSUFBSSxDQUFDLFlBQVksQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDaEMsSUFBSSxDQUFDLFlBQVksR0FBRyxHQUFHLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO1lBQ2pFLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxpQkFBSSxDQUFDLGVBQWUsRUFBRSxJQUFJLENBQUMsWUFBWSxFQUFFO2dCQUN6RCxTQUFTLEVBQUUsQ0FBQyxRQUE4QixFQUFVLEVBQUUsQ0FBQyxJQUFJLENBQUMsY0FBYyxFQUFFLENBQUMsVUFBVTtnQkFDdkYsYUFBYSxFQUFFLENBQUMsUUFBOEIsRUFBVSxFQUFFLENBQUMsWUFBWTthQUN2RSxFQUFFLENBQUMsUUFBUSxDQUFDLEVBQUU7Z0JBQ2QsdUJBQXVCLEVBQUUsSUFBSTtnQkFDN0IsVUFBVSxFQUFFLEtBQUs7Z0JBQ2pCLFlBQVksRUFBRSxLQUFLO2dCQUNuQix3QkFBd0IsRUFBRSxLQUFLO2dCQUMvQixxQkFBcUIsRUFBRTtvQkFDdEIsT0FBTyxFQUFFLEdBQUcsRUFBRSxDQUFDLFFBQVE7b0JBQ3ZCLGtCQUFrQixFQUFFLEdBQUcsRUFBRSxDQUFDLElBQUEsY0FBUSxFQUFDLFNBQVMsRUFBRSxTQUFTLENBQUM7b0JBQ3hELGFBQWEsRUFBRSxHQUFHLEVBQUUsQ0FBQyxTQUFTO29CQUM5QixZQUFZLEVBQUUsQ0FBQyxJQUEwQixFQUFFLEVBQUU7d0JBQzVDLElBQUksS0FBSyxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDO3dCQUNsQyxJQUFJLE9BQU8sSUFBSSxDQUFDLFVBQVUsQ0FBQyxLQUFLLEtBQUssUUFBUSxFQUFFOzRCQUM5QyxNQUFNLEVBQUUsTUFBTSxFQUFFLFdBQVcsRUFBRSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDOzRCQUN0RCxJQUFJLE1BQU0sSUFBSSxXQUFXLEVBQUU7Z0NBQzFCLEtBQUssR0FBRyxJQUFBLGNBQVEsRUFBQyxZQUFZLEVBQUUsYUFBYSxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUUsV0FBVyxDQUFDLENBQUM7NkJBQzFFO2lDQUFNLElBQUksTUFBTSxFQUFFO2dDQUNsQixLQUFLLEdBQUcsSUFBQSxjQUFRLEVBQUMsY0FBYyxFQUFFLFFBQVEsRUFBRSxLQUFLLEVBQUUsTUFBTSxDQUFDLENBQUM7NkJBQzFEO2lDQUFNLElBQUksV0FBVyxFQUFFO2dDQUN2QixLQUFLLEdBQUcsSUFBQSxjQUFRLEVBQUMsWUFBWSxFQUFFLFVBQVUsRUFBRSxLQUFLLEVBQUUsV0FBVyxDQUFDLENBQUM7NkJBQy9EO3lCQUNEO3dCQUVELE1BQU0sRUFBRSxNQUFNLEVBQUUsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDO3dCQUVuQyxPQUFPLElBQUEsY0FBUSxFQUFDLG1DQUFtQyxFQUFFLGdCQUFnQixFQUFFLEtBQUssRUFBRSxNQUFNLENBQUMsQ0FBQzt3QkFFdEYsdURBQXVEO3dCQUN2RCxpQkFBaUI7d0JBQ2pCLElBQUk7d0JBRUoscURBQXFEO3dCQUNyRCwrQkFBK0I7d0JBQy9CLGFBQWE7d0JBQ2IsaUJBQWlCO3dCQUNqQixvR0FBb0c7d0JBRXBHLDJGQUEyRjtvQkFDNUYsQ0FBQztpQkFDRDthQUNELENBQUMsQ0FBQztZQUVILElBQUksT0FBTyxDQUFDLGVBQWUsRUFBRTtnQkFDNUIsSUFBSSxDQUFDLE9BQU8sR0FBRyxvQkFBb0IsQ0FBQyxjQUFjLENBQUMseUNBQW1CLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLEVBQUUsT0FBTyxDQUFDLGVBQWUsQ0FBQyxDQUFDO2dCQUN2SCxJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLGlCQUFpQixFQUFFLElBQUksQ0FBQyxDQUFDO2FBQy9EO1lBRUQsSUFBSSxDQUFDLFlBQVksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMscUJBQXFCLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ2xGLElBQUksQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLHFCQUFxQixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUM1RSxJQUFJLENBQUMsWUFBWSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLG9CQUFvQixDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUN2RixDQUFDO1FBRUQsT0FBTztZQUNOLElBQUksQ0FBQyxZQUFZLENBQUMsT0FBTyxFQUFFLENBQUM7WUFDNUIsSUFBSSxDQUFDLE9BQU8sRUFBRSxPQUFPLEVBQUUsQ0FBQztZQUN4QixJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBQ3hCLENBQUM7UUFJRCxlQUFlLENBQUMsZUFBc0MsRUFBRSxjQUFzQixFQUFFLFFBQWlCLEVBQUUsTUFBZSxFQUFFLGNBQTZEO1lBQ2hMLElBQUksQ0FBQyxlQUFlLEdBQUcsY0FBYyxDQUFDO1lBRXRDLDhEQUE4RDtZQUM5RCxtQ0FBbUM7WUFFbkMsNENBQTRDO1lBQzVDLDhDQUE4QztZQUU5QyxJQUFJLElBQUksQ0FBQyxnQkFBZ0IsS0FBSyxlQUFlLEVBQUU7Z0JBQzlDLElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxlQUFlLENBQUM7YUFDeEM7WUFFRCxJQUFJLFFBQVEsSUFBSSxJQUFJLENBQUMsTUFBTSx3QkFBZ0IsSUFBSSxJQUFJLENBQUMsTUFBTSx5QkFBaUIsRUFBRTtnQkFDNUUsSUFBSSxDQUFDLFNBQVMsc0JBQWMsQ0FBQztnQkFDN0IsT0FBTzthQUNQO1lBRUQsTUFBTSxZQUFZLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUM7WUFDeEQsTUFBTSxPQUFPLEdBQUcsWUFBWSxLQUFLLENBQUMsQ0FBQztZQUNuQyxtRUFBbUU7WUFFbkUsSUFBSSxPQUFPLEVBQUU7Z0JBQ1osSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxzQkFBYyxDQUFDLG9CQUFZLENBQUMsQ0FBQztnQkFDcEQsSUFBSSxDQUFDLGdCQUFnQixHQUFHLFNBQVMsQ0FBQztnQkFDbEMsT0FBTzthQUNQO1lBRUQsaUNBQWlDO1lBRWpDLHdGQUF3RjtZQUN4RiwwRkFBMEY7WUFDMUYsMEZBQTBGO1lBQzFGLGdCQUFnQjtZQUNoQiw0QkFBNEI7WUFDNUIsNkJBQTZCO1lBQzdCLElBQUk7Z0JBQ0gsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxLQUFLLENBQUMsQ0FBQztnQkFDckUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxzQkFBYyxDQUFDLG1CQUFXLENBQUMsQ0FBQztnQkFDckQsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsY0FBYyxFQUFFLENBQUMsQ0FBQyxDQUFDO2dCQUNyQyxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUM7Z0JBQ3RDLHdEQUF3RDthQUN4RDtvQkFBUztnQkFDVCw2QkFBNkI7Z0JBQzdCLDhCQUE4QjthQUM5QjtZQUVELElBQUksQ0FBQyxjQUFjLENBQUMsS0FBSyxHQUFHLEdBQUcsQ0FBQyx1Q0FBdUMsQ0FBQyxHQUFHLEVBQUU7Z0JBQzVFLElBQUksQ0FBQyxjQUFjLENBQUMsS0FBSyxFQUFFLENBQUM7Z0JBQzVCLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFDaEMscUJBQXFCO2dCQUNyQiw0REFBNEQ7WUFDN0QsQ0FBQyxDQUFDLENBQUM7UUFDSixDQUFDO1FBRUQsY0FBYyxDQUFDLFdBQXdCO1lBQ3RDLElBQUksSUFBSSxDQUFDLGdCQUFnQixFQUFFO2dCQUMxQixJQUFJLENBQUMsZ0JBQWdCLENBQUMsV0FBVyxHQUFHLFdBQVcsQ0FBQzthQUNoRDtRQUNGLENBQUM7UUFFTyxTQUFTLENBQUMsS0FBWTtZQUU3QixJQUFJLElBQUksQ0FBQyxNQUFNLEtBQUssS0FBSyxFQUFFO2dCQUMxQixPQUFPO2FBQ1A7WUFDRCxJQUFJLENBQUMsTUFBTSxHQUFHLEtBQUssQ0FBQztZQUVwQixJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLFFBQVEsRUFBRSxLQUFLLHlCQUFpQixDQUFDLENBQUM7WUFDeEUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUVqRCxRQUFRLEtBQUssRUFBRTtnQkFDZDtvQkFDQywyRUFBMkU7b0JBQzNFLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDO29CQUM1QixJQUFJLElBQUksQ0FBQyxPQUFPLEVBQUU7d0JBQ2pCLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxPQUFPLENBQUMsQ0FBQztxQkFDaEM7b0JBQ0QsNEJBQTRCO29CQUM1QixJQUFJLENBQUMsT0FBTyxFQUFFLElBQUksRUFBRSxDQUFDO29CQUNyQiw4QkFBOEI7b0JBQzlCLHlDQUF5QztvQkFDekMscURBQXFEO29CQUNyRCxzREFBc0Q7b0JBQ3RELElBQUksQ0FBQyxZQUFZLENBQUMsTUFBTSxFQUFFLENBQUM7b0JBQzNCLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLENBQUM7b0JBQ2pELElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDO29CQUN4QyxpQ0FBaUM7b0JBQ2pDLElBQUksQ0FBQyxhQUFhLEdBQUcsU0FBUyxDQUFDO29CQUMvQiw2QkFBNkI7b0JBQzdCLE1BQU07Z0JBQ1A7b0JBQ0MsSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQztvQkFDOUMsb0VBQW9FO29CQUNwRSxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQztvQkFDNUIsSUFBSSxJQUFJLENBQUMsT0FBTyxFQUFFO3dCQUNqQixHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsT0FBTyxDQUFDLENBQUM7cUJBQ2hDO29CQUNELGtDQUFrQztvQkFDbEMsd0JBQXdCO29CQUN4QixJQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7b0JBQ2IsaUNBQWlDO29CQUNqQyxNQUFNO2dCQUNQO29CQUNDLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLENBQUM7b0JBQzlDLDJFQUEyRTtvQkFDM0UsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUM7b0JBQzVCLElBQUksSUFBSSxDQUFDLE9BQU8sRUFBRTt3QkFDakIsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLE9BQU8sQ0FBQyxDQUFDO3FCQUNoQztvQkFDRCxrQ0FBa0M7b0JBQ2xDLHdCQUF3QjtvQkFDeEIsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDO29CQUNiLGlDQUFpQztvQkFDakMsTUFBTTtnQkFDUDtvQkFDQyxrQ0FBa0M7b0JBQ2xDLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDO29CQUM1QixJQUFJLElBQUksQ0FBQyxPQUFPLEVBQUU7d0JBQ2pCLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxPQUFPLENBQUMsQ0FBQztxQkFDaEM7b0JBQ0QsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDO29CQUNiLE1BQU07Z0JBQ1A7b0JBQ0Msa0NBQWtDO29CQUNsQyxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQztvQkFDNUIsSUFBSSxJQUFJLENBQUMsT0FBTyxFQUFFO3dCQUNqQixHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsT0FBTyxDQUFDLENBQUM7cUJBQ2hDO29CQUNELElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQztvQkFDYixNQUFNO2dCQUNQO29CQUNDLGtDQUFrQztvQkFDbEMsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUM7b0JBQzVCLElBQUksSUFBSSxDQUFDLE9BQU8sRUFBRTt3QkFDakIsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLE9BQU8sQ0FBQyxDQUFDO3FCQUNoQztvQkFDRCx3QkFBd0I7b0JBQ3hCLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQztvQkFDYixNQUFNO2FBQ1A7UUFDRixDQUFDO1FBRU8sS0FBSztZQUNaLCtDQUErQztZQUMvQyxrQ0FBa0M7WUFDbEMsMEJBQTBCO1lBRzFCLElBQUksQ0FBQyxPQUFPLEVBQUUsSUFBSSxFQUFFLENBQUM7WUFDckIsOEJBQThCO1lBQzlCLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUMvQixJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQztZQUM1QywyQ0FBMkM7WUFFM0MsSUFBSSxDQUFDLFlBQVksQ0FBQyxZQUFZLENBQUMsR0FBRyxFQUFFO2dCQUNuQyxJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxDQUFDO2dCQUM5QyxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUM1QixDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFDVCxDQUFDO1FBRUQsSUFBSTtZQUNILElBQUksQ0FBQyxjQUFjLENBQUMsS0FBSyxFQUFFLENBQUM7WUFDNUIsb0NBQW9DO1lBQ3BDLG1DQUFtQztZQUVuQyxJQUFJLENBQUMsU0FBUyxzQkFBYyxDQUFDO1lBQzdCLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQzNCLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUMvQixJQUFJLENBQUMsT0FBTyxDQUFDLG1CQUFtQixFQUFFLENBQUM7WUFDbkMsOERBQThEO1lBQzlELDhEQUE4RDtZQUM5RCxNQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDLE9BQU8sRUFBRSxDQUFDO1lBQzFDLE1BQU0sa0JBQWtCLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsY0FBYyxFQUFFLENBQUMsVUFBVSxHQUFHLEdBQUcsQ0FBQyxDQUFDO1lBQzdFLElBQUksR0FBRyxJQUFJLEdBQUcsQ0FBQyxNQUFNLEdBQUcsa0JBQWtCLEVBQUU7Z0JBQzNDLElBQUksQ0FBQyxjQUFjLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLGtCQUFrQixDQUFDLENBQUMsQ0FBQzthQUNuRTtRQUNGLENBQUM7UUFFTyxPQUFPLENBQUMsSUFBK0I7WUFDOUMsSUFBSSxDQUFDLElBQUksQ0FBQyxlQUFlLEVBQUU7Z0JBQzFCLE9BQU87YUFDUDtZQUNELGlDQUFpQztZQUNqQyxXQUFXO1lBQ1gsSUFBSTtZQUNKLG1DQUFtQztZQUNuQyxpQ0FBaUM7WUFDakMsV0FBVztZQUNYLElBQUk7WUFFSixNQUFNLE9BQU8sR0FBRyxHQUFHLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUNqRCxNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsY0FBYyxFQUFFLENBQUM7WUFFbkMsSUFBSSxDQUFDLElBQUksRUFBRTtnQkFDVixJQUFJLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQzthQUN4QjtZQUVELElBQUksTUFBTSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUM7WUFDekIsSUFBSSxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQztZQUV2QixhQUFhO1lBQ2IsSUFBSSxJQUFJLENBQUMsT0FBTyxFQUFFO2dCQUNqQixJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsVUFBVSxHQUFHLEdBQUcsSUFBSSxDQUFDLFVBQVUsSUFBSSxDQUFDO2FBQy9EO1lBRUQsc0VBQXNFO1lBQ3RFLDZCQUE2QjtZQUM3QixpREFBaUQ7WUFDakQsdUNBQXVDO1lBQ3ZDLDBEQUEwRDtZQUMxRCxtRkFBbUY7WUFDbkYsNkVBQTZFO1lBRTdFLFdBQVc7WUFDWCxnQkFBZ0I7WUFFaEIsYUFBYTtZQUNiLE1BQU0sUUFBUSxHQUFHLE9BQU8sQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLFlBQVksR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDLGlCQUFpQixDQUFDO1lBQ2hGLElBQUksS0FBSyxHQUFHLFFBQVEsRUFBRTtnQkFDckIsS0FBSyxHQUFHLFFBQVEsQ0FBQzthQUNqQjtZQUNELE1BQU0sY0FBYyxHQUFHLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLEtBQUssQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDLDhCQUE4QixDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUM7WUFFbkksY0FBYztZQUNkLE1BQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxlQUFlLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxhQUFhLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQztZQUN2RixNQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQyxlQUFlLENBQUM7WUFDekQsMEVBQTBFO1lBQzFFLHVGQUF1RjtZQUN2RixNQUFNLFNBQVMsR0FBRyxHQUFHLENBQUMsc0JBQXNCLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1lBQzlELE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxlQUFlLENBQUMsQ0FBQyxvRUFBb0U7WUFDNUcsTUFBTSxZQUFZLEdBQUcsU0FBUyxDQUFDLEdBQUcsR0FBRyxTQUFTLENBQUMsR0FBRyxHQUFHLFNBQVMsQ0FBQyxNQUFNLENBQUM7WUFDdEUsTUFBTSxjQUFjLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsTUFBTSxHQUFHLFlBQVksR0FBRyxJQUFJLENBQUMsZUFBZSxFQUFFLFVBQVUsQ0FBQyxDQUFDO1lBQ2xHLE1BQU0sbUJBQW1CLEdBQUcsU0FBUyxDQUFDLEdBQUcsR0FBRyxTQUFTLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQyxlQUFlLENBQUM7WUFDakYsTUFBTSxjQUFjLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxtQkFBbUIsRUFBRSxVQUFVLENBQUMsQ0FBQztZQUNqRSxJQUFJLFNBQVMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsY0FBYyxFQUFFLGNBQWMsQ0FBQyxHQUFHLElBQUksQ0FBQyxZQUFZLEVBQUUsVUFBVSxDQUFDLENBQUM7WUFFbkcsSUFBSSxNQUFNLEtBQUssSUFBSSxDQUFDLGFBQWEsRUFBRSxNQUFNLEVBQUU7Z0JBQzFDLG1EQUFtRDtnQkFDbkQsMEJBQTBCO2dCQUMxQixNQUFNLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxNQUFNLENBQUM7YUFDbkM7WUFFRCxJQUFJLE1BQU0sR0FBRyxTQUFTLEVBQUU7Z0JBQ3ZCLE1BQU0sR0FBRyxTQUFTLENBQUM7YUFDbkI7WUFDRCxJQUFJLE1BQU0sR0FBRyxTQUFTLEVBQUU7Z0JBQ3ZCLE1BQU0sR0FBRyxTQUFTLENBQUM7YUFDbkI7WUFFRCxNQUFNLGdDQUFnQyxHQUFHLEdBQUcsQ0FBQztZQUM3QyxJQUFJLE1BQU0sR0FBRyxjQUFjLElBQUksQ0FBQyxJQUFJLENBQUMsb0JBQW9CLElBQUksbUJBQW1CLEdBQUcsZ0NBQWdDLENBQUMsRUFBRTtnQkFDckgsSUFBSSxDQUFDLFdBQVcseUNBQWlDLENBQUM7Z0JBQ2xELElBQUksQ0FBQyxPQUFPLENBQUMsWUFBWSxDQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDO2dCQUNwRCxTQUFTLEdBQUcsY0FBYyxDQUFDO2FBQzNCO2lCQUFNO2dCQUNOLElBQUksQ0FBQyxXQUFXLHlDQUFpQyxDQUFDO2dCQUNsRCxJQUFJLENBQUMsT0FBTyxDQUFDLFlBQVksQ0FBQyxLQUFLLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxLQUFLLENBQUMsQ0FBQztnQkFDcEQsU0FBUyxHQUFHLGNBQWMsQ0FBQzthQUMzQjtZQUNELElBQUksQ0FBQyxPQUFPLENBQUMsYUFBYSxHQUFHLElBQUksR0FBRyxDQUFDLFNBQVMsQ0FBQyxjQUFjLEVBQUUsSUFBSSxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUN4RixJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sR0FBRyxJQUFJLEdBQUcsQ0FBQyxTQUFTLENBQUMsUUFBUSxFQUFFLFNBQVMsQ0FBQyxDQUFDO1lBQzlELElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxHQUFHLElBQUksR0FBRyxDQUFDLFNBQVMsQ0FBQyxHQUFHLEVBQUUsU0FBUyxDQUFDLENBQUM7WUFFekQsc0RBQXNEO1lBQ3RELDJEQUEyRDtZQUMzRCw2QkFBNkI7WUFDN0IsSUFBSSxDQUFDLGFBQWEsR0FBRyxNQUFNLEtBQUssVUFBVTtnQkFDekMsQ0FBQyxDQUFDLEVBQUUsTUFBTSxFQUFFLElBQUksQ0FBQyxhQUFhLEVBQUUsTUFBTSxJQUFJLElBQUksQ0FBQyxNQUFNLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRTtnQkFDdkUsQ0FBQyxDQUFDLFNBQVMsQ0FBQztZQUNiLElBQUk7WUFDSixJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsSUFBSSxHQUFHLEdBQUcsSUFBSSxDQUFDLGVBQWUsQ0FBQyxJQUFJLElBQUksQ0FBQztZQUNuRSxJQUFJLElBQUksQ0FBQyxXQUFXLDJDQUFtQyxFQUFFO2dCQUN4RCxJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsR0FBRyxHQUFHLEdBQUcsSUFBSSxDQUFDLGVBQWUsQ0FBQyxHQUFHLEdBQUcsTUFBTSxHQUFHLElBQUksQ0FBQyxZQUFZLElBQUksQ0FBQzthQUM5RjtpQkFBTTtnQkFDTixJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsR0FBRyxHQUFHLEdBQUcsSUFBSSxDQUFDLGVBQWUsQ0FBQyxHQUFHLEdBQUcsSUFBSSxDQUFDLGVBQWUsQ0FBQyxNQUFNLElBQUksQ0FBQzthQUMvRjtZQUNELElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLE1BQU0sQ0FBQyxDQUFDO1FBQzdCLENBQUM7UUFFTyxPQUFPLENBQUMsS0FBYSxFQUFFLE1BQWM7WUFDNUMsTUFBTSxFQUFFLEtBQUssRUFBRSxRQUFRLEVBQUUsTUFBTSxFQUFFLFNBQVMsRUFBRSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDO1lBQ3BFLEtBQUssR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRSxLQUFLLENBQUMsQ0FBQztZQUNsQyxJQUFJLFNBQVMsRUFBRTtnQkFDZCxNQUFNLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxTQUFTLEVBQUUsTUFBTSxDQUFDLENBQUM7YUFDckM7WUFFRCxNQUFNLEVBQUUsZUFBZSxFQUFFLEdBQUcsSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFDO1lBQ2xELElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLE1BQU0sR0FBRyxlQUFlLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFDbkQsSUFBSSxDQUFDLFlBQVksQ0FBQyxLQUFLLENBQUMsTUFBTSxHQUFHLEdBQUcsTUFBTSxHQUFHLGVBQWUsSUFBSSxDQUFDO1lBRWpFLElBQUksQ0FBQyxZQUFZLENBQUMsS0FBSyxDQUFDLEtBQUssR0FBRyxHQUFHLEtBQUssSUFBSSxDQUFDO1lBQzdDLElBQUksQ0FBQyxZQUFZLENBQUMsS0FBSyxDQUFDLE1BQU0sR0FBRyxHQUFHLE1BQU0sSUFBSSxDQUFDO1lBQy9DLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLE1BQU0sRUFBRSxLQUFLLENBQUMsQ0FBQztZQUVuQywyQkFBMkI7WUFDM0IscUNBQXFDO1FBQ3RDLENBQUM7UUFFTyxjQUFjO1lBQ3JCLE1BQU0sUUFBUSxHQUFHO2dCQUNoQixVQUFVLEVBQUUsRUFBRTtnQkFDZCw4QkFBOEIsRUFBRSxFQUFFO2FBQ2xDLENBQUMsQ0FBQywrQ0FBK0M7WUFDbEQsTUFBTSxVQUFVLEdBQUcsSUFBQSxlQUFLLEVBQUMsUUFBUSxDQUFDLFVBQVUsRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFDdkQsTUFBTSxlQUFlLEdBQUcsQ0FBQyxDQUFDLENBQUMsOElBQThJO1lBQ3pLLE1BQU0sV0FBVyxHQUFHLENBQUMsQ0FBQyxDQUFDLG1DQUFtQztZQUMxRCxNQUFNLFlBQVksR0FBRyxDQUFDLEdBQUcsV0FBVyxDQUFDO1lBRXJDLE9BQU87Z0JBQ04sVUFBVTtnQkFDVixlQUFlO2dCQUNmLFdBQVc7Z0JBQ1gsWUFBWTtnQkFDWiw4QkFBOEIsRUFBRSxRQUFRLENBQUMsOEJBQThCO2dCQUN2RSxlQUFlLEVBQUUsRUFBRTtnQkFDbkIsaUJBQWlCLEVBQUUsRUFBRTtnQkFDckIsV0FBVyxFQUFFLElBQUksR0FBRyxDQUFDLFNBQVMsQ0FBQyxHQUFHLEVBQUUsZUFBZSxHQUFHLEVBQUUsR0FBRyxVQUFVLEdBQUcsWUFBWSxDQUFDO2FBQ3JGLENBQUM7UUFDSCxDQUFDO1FBRU8scUJBQXFCLENBQUMsQ0FBa0Y7WUFDL0csSUFBSSxPQUFPLENBQUMsQ0FBQyxPQUFPLEtBQUssV0FBVyxJQUFJLE9BQU8sQ0FBQyxDQUFDLEtBQUssS0FBSyxXQUFXLEVBQUU7Z0JBQ3ZFLE9BQU87YUFDUDtZQUVELG1EQUFtRDtZQUNuRCxDQUFDLENBQUMsWUFBWSxDQUFDLGNBQWMsRUFBRSxDQUFDO1lBQ2hDLENBQUMsQ0FBQyxZQUFZLENBQUMsZUFBZSxFQUFFLENBQUM7WUFFakMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUNsQyxDQUFDO1FBRU8sZ0JBQWdCLENBQUMsQ0FBbUM7WUFDM0QsSUFBSSxDQUFDLENBQUMsUUFBUSxDQUFDLE1BQU0sRUFBRTtnQkFDdEIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQzthQUMxQztRQUNGLENBQUM7UUFFTyxPQUFPLENBQUMsSUFBMEIsRUFBRSxLQUFhO1lBQ3hELE1BQU0sZUFBZSxHQUFHLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQztZQUM5QyxJQUFJLGVBQWUsRUFBRTtnQkFDcEIsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxlQUFlLEVBQUUsQ0FBQyxDQUFDO2FBQ2hFO1FBQ0YsQ0FBQztRQUVELFVBQVU7WUFDVCxJQUFJLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFDOUIsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLEVBQUUsQ0FBQztZQUNwQyxJQUFJLEtBQUssQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO2dCQUNyQixJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQzthQUM1QjtZQUNELE9BQU8sSUFBSSxDQUFDO1FBQ2IsQ0FBQztRQUVELGNBQWM7WUFDYixJQUFJLENBQUMsS0FBSyxDQUFDLGFBQWEsRUFBRSxDQUFDO1lBQzNCLE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxFQUFFLENBQUM7WUFDcEMsSUFBSSxLQUFLLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtnQkFDckIsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7YUFDNUI7WUFDRCxPQUFPLElBQUksQ0FBQztRQUNiLENBQUM7UUFFRCxjQUFjO1lBQ2IsSUFBSSxDQUFDLEtBQUssQ0FBQyxhQUFhLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDO1lBQ2xDLE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxFQUFFLENBQUM7WUFDcEMsSUFBSSxLQUFLLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtnQkFDckIsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7YUFDNUI7WUFDRCxPQUFPLElBQUksQ0FBQztRQUNiLENBQUM7UUFFRCxrQkFBa0I7WUFDakIsSUFBSSxDQUFDLEtBQUssQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO1lBQy9CLE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxFQUFFLENBQUM7WUFDcEMsSUFBSSxLQUFLLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtnQkFDckIsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7YUFDNUI7WUFDRCxPQUFPLElBQUksQ0FBQztRQUNiLENBQUM7UUFFRCxjQUFjO1lBQ2IsSUFBSSxJQUFJLENBQUMsZ0JBQWdCLEVBQUU7Z0JBQzFCLE9BQU87b0JBQ04sSUFBSSxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsa0JBQWtCLEVBQUUsQ0FBQyxDQUFDLENBQUM7b0JBQ3hDLEtBQUssRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUMsQ0FBQztvQkFDL0IsS0FBSyxFQUFFLElBQUksQ0FBQyxnQkFBZ0I7aUJBQzVCLENBQUM7YUFDRjtZQUNELE9BQU8sU0FBUyxDQUFDO1FBQ2xCLENBQUM7UUFFRCxtQkFBbUI7WUFDbEIsSUFBSSxDQUFDLElBQUksQ0FBQyxvQkFBb0IsRUFBRTtnQkFDL0IsSUFBSSxDQUFDLG9CQUFvQixHQUFHLElBQUksQ0FBQztnQkFDakMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUM7YUFDNUM7UUFDRixDQUFDO1FBRUQsdUJBQXVCO1lBQ3RCLElBQUksQ0FBQyxvQkFBb0IsR0FBRyxLQUFLLENBQUM7UUFDbkMsQ0FBQztLQUNELENBQUE7SUF2aUJZLGtEQUFtQjtrQ0FBbkIsbUJBQW1CO1FBOEI3QixXQUFBLHFDQUFxQixDQUFBO09BOUJYLG1CQUFtQixDQXVpQi9CIn0=