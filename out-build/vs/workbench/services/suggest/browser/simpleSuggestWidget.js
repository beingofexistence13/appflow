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
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/ui/list/listWidget", "vs/base/browser/ui/resizable/resizable", "vs/workbench/services/suggest/browser/simpleSuggestWidgetRenderer", "vs/base/common/async", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/numbers", "vs/nls!vs/workbench/services/suggest/browser/simpleSuggestWidget", "vs/platform/instantiation/common/instantiation", "vs/editor/contrib/suggest/browser/suggestWidgetStatus", "vs/css!./media/suggest"], function (require, exports, dom, listWidget_1, resizable_1, simpleSuggestWidgetRenderer_1, async_1, event_1, lifecycle_1, numbers_1, nls_1, instantiation_1, suggestWidgetStatus_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Iib = void 0;
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
    let $Iib = class $Iib {
        get list() { return this.i; }
        constructor(p, q, options, instantiationService) {
            this.p = p;
            this.q = q;
            this.a = 0 /* State.Hidden */;
            this.d = false;
            this.g = new lifecycle_1.$lc();
            this.k = new async_1.$Qg();
            this.l = new lifecycle_1.$jc();
            this.m = new event_1.$fd();
            this.onDidSelect = this.m.event;
            this.n = new event_1.$fd();
            this.onDidHide = this.n.event;
            this.o = new event_1.$fd();
            this.onDidShow = this.o.event;
            this.element = new resizable_1.$ZR();
            this.element.domNode.classList.add('workbench-suggest-widget');
            this.p.appendChild(this.element.domNode);
            class ResizeState {
                constructor(persistedSize, currentSize, persistHeight = false, persistWidth = false) {
                    this.persistedSize = persistedSize;
                    this.currentSize = currentSize;
                    this.persistHeight = persistHeight;
                    this.persistWidth = persistWidth;
                }
            }
            let state;
            this.l.add(this.element.onDidWillResize(() => {
                // this._preferenceLocked = true;
                state = new ResizeState(this.q.restore(), this.element.size);
            }));
            this.l.add(this.element.onDidResize(e => {
                this.v(e.dimension.width, e.dimension.height);
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
                    const { itemHeight, defaultSize } = this.w();
                    const threshold = Math.round(itemHeight / 2);
                    let { width, height } = this.element.size;
                    if (!state.persistHeight || Math.abs(state.currentSize.height - height) <= threshold) {
                        height = state.persistedSize?.height ?? defaultSize.height;
                    }
                    if (!state.persistWidth || Math.abs(state.currentSize.width - width) <= threshold) {
                        width = state.persistedSize?.width ?? defaultSize.width;
                    }
                    this.q.store(new dom.$BO(width, height));
                }
                // reset working state
                // this._preferenceLocked = false;
                state = undefined;
            }));
            const renderer = new simpleSuggestWidgetRenderer_1.$Hib();
            this.l.add(renderer);
            this.h = dom.$0O(this.element.domNode, $('.tree'));
            this.i = new listWidget_1.$wQ('SuggestWidget', this.h, {
                getHeight: (_element) => this.w().itemHeight,
                getTemplateId: (_element) => 'suggestion'
            }, [renderer], {
                alwaysConsumeMouseWheel: true,
                useShadows: false,
                mouseSupport: false,
                multipleSelectionSupport: false,
                accessibilityProvider: {
                    getRole: () => 'option',
                    getWidgetAriaLabel: () => (0, nls_1.localize)(0, null),
                    getWidgetRole: () => 'listbox',
                    getAriaLabel: (item) => {
                        let label = item.completion.label;
                        if (typeof item.completion.label !== 'string') {
                            const { detail, description } = item.completion.label;
                            if (detail && description) {
                                label = (0, nls_1.localize)(1, null, label, detail, description);
                            }
                            else if (detail) {
                                label = (0, nls_1.localize)(2, null, label, detail);
                            }
                            else if (description) {
                                label = (0, nls_1.localize)(3, null, label, description);
                            }
                        }
                        const { detail } = item.completion;
                        return (0, nls_1.localize)(4, null, label, detail);
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
                this.j = instantiationService.createInstance(suggestWidgetStatus_1.$t6, this.element.domNode, options.statusBarMenuId);
                this.element.domNode.classList.toggle('with-status-bar', true);
            }
            this.l.add(this.i.onMouseDown(e => this.x(e)));
            this.l.add(this.i.onTap(e => this.x(e)));
            this.l.add(this.i.onDidChangeSelection(e => this.y(e)));
        }
        dispose() {
            this.l.dispose();
            this.j?.dispose();
            this.element.dispose();
        }
        showSuggestions(completionModel, selectionIndex, isFrozen, isAuto, cursorPosition) {
            this.r = cursorPosition;
            // this._contentWidget.setPosition(this.editor.getPosition());
            // this._loadingTimeout?.dispose();
            // this._currentSuggestionDetails?.cancel();
            // this._currentSuggestionDetails = undefined;
            if (this.b !== completionModel) {
                this.b = completionModel;
            }
            if (isFrozen && this.a !== 2 /* State.Empty */ && this.a !== 0 /* State.Hidden */) {
                this.s(4 /* State.Frozen */);
                return;
            }
            const visibleCount = this.b.items.length;
            const isEmpty = visibleCount === 0;
            // this._ctxSuggestWidgetMultipleSuggestions.set(visibleCount > 1);
            if (isEmpty) {
                this.s(isAuto ? 0 /* State.Hidden */ : 2 /* State.Empty */);
                this.b = undefined;
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
                this.i.splice(0, this.i.length, this.b.items);
                this.s(isFrozen ? 4 /* State.Frozen */ : 3 /* State.Open */);
                this.i.reveal(selectionIndex, 0);
                this.i.setFocus([selectionIndex]);
                // this._list.setFocus(noFocus ? [] : [selectionIndex]);
            }
            finally {
                // this._onDidFocus.resume();
                // this._onDidSelect.resume();
            }
            this.g.value = dom.$uO(() => {
                this.g.clear();
                this.u(this.element.size);
                // Reset focus border
                // this._details.widget.domNode.classList.remove('focused');
            });
        }
        setLineContext(lineContext) {
            if (this.b) {
                this.b.lineContext = lineContext;
            }
        }
        s(state) {
            if (this.a === state) {
                return;
            }
            this.a = state;
            this.element.domNode.classList.toggle('frozen', state === 4 /* State.Frozen */);
            this.element.domNode.classList.remove('message');
            switch (state) {
                case 0 /* State.Hidden */:
                    // dom.hide(this._messageElement, this._listElement, this._status.element);
                    dom.$eP(this.h);
                    if (this.j) {
                        dom.$eP(this.j?.element);
                    }
                    // this._details.hide(true);
                    this.j?.hide();
                    // this._contentWidget.hide();
                    // this._ctxSuggestWidgetVisible.reset();
                    // this._ctxSuggestWidgetMultipleSuggestions.reset();
                    // this._ctxSuggestWidgetHasFocusedSuggestion.reset();
                    this.k.cancel();
                    this.element.domNode.classList.remove('visible');
                    this.i.splice(0, this.i.length);
                    // this._focusedItem = undefined;
                    this.c = undefined;
                    // this._explainMode = false;
                    break;
                case 1 /* State.Loading */:
                    this.element.domNode.classList.add('message');
                    // this._messageElement.textContent = SuggestWidget.LOADING_MESSAGE;
                    dom.$eP(this.h);
                    if (this.j) {
                        dom.$eP(this.j?.element);
                    }
                    // dom.show(this._messageElement);
                    // this._details.hide();
                    this.t();
                    // this._focusedItem = undefined;
                    break;
                case 2 /* State.Empty */:
                    this.element.domNode.classList.add('message');
                    // this._messageElement.textContent = SuggestWidget.NO_SUGGESTIONS_MESSAGE;
                    dom.$eP(this.h);
                    if (this.j) {
                        dom.$eP(this.j?.element);
                    }
                    // dom.show(this._messageElement);
                    // this._details.hide();
                    this.t();
                    // this._focusedItem = undefined;
                    break;
                case 3 /* State.Open */:
                    // dom.hide(this._messageElement);
                    dom.$dP(this.h);
                    if (this.j) {
                        dom.$dP(this.j?.element);
                    }
                    this.t();
                    break;
                case 4 /* State.Frozen */:
                    // dom.hide(this._messageElement);
                    dom.$dP(this.h);
                    if (this.j) {
                        dom.$dP(this.j?.element);
                    }
                    this.t();
                    break;
                case 5 /* State.Details */:
                    // dom.hide(this._messageElement);
                    dom.$dP(this.h);
                    if (this.j) {
                        dom.$dP(this.j?.element);
                    }
                    // this._details.show();
                    this.t();
                    break;
            }
        }
        t() {
            // this._layout(this._persistedSize.restore());
            // dom.show(this.element.domNode);
            // this._onDidShow.fire();
            this.j?.show();
            // this._contentWidget.show();
            dom.$dP(this.element.domNode);
            this.u(this.q.restore());
            // this._ctxSuggestWidgetVisible.set(true);
            this.k.cancelAndSet(() => {
                this.element.domNode.classList.add('visible');
                this.o.fire(this);
            }, 100);
        }
        hide() {
            this.g.clear();
            // this._pendingShowDetails.clear();
            // this._loadingTimeout?.dispose();
            this.s(0 /* State.Hidden */);
            this.n.fire(this);
            dom.$eP(this.element.domNode);
            this.element.clearSashHoverState();
            // ensure that a reasonable widget height is persisted so that
            // accidential "resize-to-single-items" cases aren't happening
            const dim = this.q.restore();
            const minPersistedHeight = Math.ceil(this.w().itemHeight * 4.3);
            if (dim && dim.height < minPersistedHeight) {
                this.q.store(dim.with(undefined, minPersistedHeight));
            }
        }
        u(size) {
            if (!this.r) {
                return;
            }
            // if (!this.editor.hasModel()) {
            // 	return;
            // }
            // if (!this.editor.getDomNode()) {
            // 	// happens when running tests
            // 	return;
            // }
            const bodyBox = dom.$AO(document.body);
            const info = this.w();
            if (!size) {
                size = info.defaultSize;
            }
            let height = size.height;
            let width = size.width;
            // status bar
            if (this.j) {
                this.j.element.style.lineHeight = `${info.itemHeight}px`;
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
            const preferredWidth = this.b ? this.b.stats.pLabelLen * info.typicalHalfwidthCharacterWidth : width;
            // height math
            const fullHeight = info.statusBarHeight + this.i.contentHeight + info.borderHeight;
            const minHeight = info.itemHeight + info.statusBarHeight;
            // const editorBox = dom.getDomNodePagePosition(this.editor.getDomNode());
            // const cursorBox = this.editor.getScrolledVisiblePosition(this.editor.getPosition());
            const editorBox = dom.$FO(this.p);
            const cursorBox = this.r; //this.editor.getScrolledVisiblePosition(this.editor.getPosition());
            const cursorBottom = editorBox.top + cursorBox.top + cursorBox.height;
            const maxHeightBelow = Math.min(bodyBox.height - cursorBottom - info.verticalPadding, fullHeight);
            const availableSpaceAbove = editorBox.top + cursorBox.top - info.verticalPadding;
            const maxHeightAbove = Math.min(availableSpaceAbove, fullHeight);
            let maxHeight = Math.min(Math.max(maxHeightAbove, maxHeightBelow) + info.borderHeight, fullHeight);
            if (height === this.c?.capped) {
                // Restore the old (wanted) height when the current
                // height is capped to fit
                height = this.c.wanted;
            }
            if (height < minHeight) {
                height = minHeight;
            }
            if (height > maxHeight) {
                height = maxHeight;
            }
            const forceRenderingAboveRequiredSpace = 150;
            if (height > maxHeightBelow || (this.d && availableSpaceAbove > forceRenderingAboveRequiredSpace)) {
                this.f = 0 /* WidgetPositionPreference.Above */;
                this.element.enableSashes(true, true, false, false);
                maxHeight = maxHeightAbove;
            }
            else {
                this.f = 1 /* WidgetPositionPreference.Below */;
                this.element.enableSashes(false, true, true, false);
                maxHeight = maxHeightBelow;
            }
            this.element.preferredSize = new dom.$BO(preferredWidth, info.defaultSize.height);
            this.element.maxSize = new dom.$BO(maxWidth, maxHeight);
            this.element.minSize = new dom.$BO(220, minHeight);
            // Know when the height was capped to fit and remember
            // the wanted height for later. This is required when going
            // left to widen suggestions.
            this.c = height === fullHeight
                ? { wanted: this.c?.wanted ?? size.height, capped: height }
                : undefined;
            // }
            this.element.domNode.style.left = `${this.r.left}px`;
            if (this.f === 0 /* WidgetPositionPreference.Above */) {
                this.element.domNode.style.top = `${this.r.top - height - info.borderHeight}px`;
            }
            else {
                this.element.domNode.style.top = `${this.r.top + this.r.height}px`;
            }
            this.v(width, height);
        }
        v(width, height) {
            const { width: maxWidth, height: maxHeight } = this.element.maxSize;
            width = Math.min(maxWidth, width);
            if (maxHeight) {
                height = Math.min(maxHeight, height);
            }
            const { statusBarHeight } = this.w();
            this.i.layout(height - statusBarHeight, width);
            this.h.style.height = `${height - statusBarHeight}px`;
            this.h.style.width = `${width}px`;
            this.h.style.height = `${height}px`;
            this.element.layout(height, width);
            // this._positionDetails();
            // TODO: Position based on preference
        }
        w() {
            const fontInfo = {
                lineHeight: 20,
                typicalHalfwidthCharacterWidth: 10
            }; //this.editor.getOption(EditorOption.fontInfo);
            const itemHeight = (0, numbers_1.$Hl)(fontInfo.lineHeight, 8, 1000);
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
                defaultSize: new dom.$BO(430, statusBarHeight + 12 * itemHeight + borderHeight)
            };
        }
        x(e) {
            if (typeof e.element === 'undefined' || typeof e.index === 'undefined') {
                return;
            }
            // prevent stealing browser focus from the terminal
            e.browserEvent.preventDefault();
            e.browserEvent.stopPropagation();
            this.z(e.element, e.index);
        }
        y(e) {
            if (e.elements.length) {
                this.z(e.elements[0], e.indexes[0]);
            }
        }
        z(item, index) {
            const completionModel = this.b;
            if (completionModel) {
                this.m.fire({ item, index, model: completionModel });
            }
        }
        selectNext() {
            this.i.focusNext(1, true);
            const focus = this.i.getFocus();
            if (focus.length > 0) {
                this.i.reveal(focus[0]);
            }
            return true;
        }
        selectNextPage() {
            this.i.focusNextPage();
            const focus = this.i.getFocus();
            if (focus.length > 0) {
                this.i.reveal(focus[0]);
            }
            return true;
        }
        selectPrevious() {
            this.i.focusPrevious(1, true);
            const focus = this.i.getFocus();
            if (focus.length > 0) {
                this.i.reveal(focus[0]);
            }
            return true;
        }
        selectPreviousPage() {
            this.i.focusPreviousPage();
            const focus = this.i.getFocus();
            if (focus.length > 0) {
                this.i.reveal(focus[0]);
            }
            return true;
        }
        getFocusedItem() {
            if (this.b) {
                return {
                    item: this.i.getFocusedElements()[0],
                    index: this.i.getFocus()[0],
                    model: this.b
                };
            }
            return undefined;
        }
        forceRenderingAbove() {
            if (!this.d) {
                this.d = true;
                this.u(this.q.restore());
            }
        }
        stopForceRenderingAbove() {
            this.d = false;
        }
    };
    exports.$Iib = $Iib;
    exports.$Iib = $Iib = __decorate([
        __param(3, instantiation_1.$Ah)
    ], $Iib);
});
//# sourceMappingURL=simpleSuggestWidget.js.map