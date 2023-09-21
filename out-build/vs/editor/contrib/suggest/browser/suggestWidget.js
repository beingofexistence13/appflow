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
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/ui/list/listWidget", "vs/base/common/async", "vs/base/common/errors", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/numbers", "vs/base/common/strings", "vs/editor/browser/widget/embeddedCodeEditorWidget", "vs/editor/contrib/suggest/browser/suggestWidgetStatus", "vs/nls!vs/editor/contrib/suggest/browser/suggestWidget", "vs/platform/contextkey/common/contextkey", "vs/platform/instantiation/common/instantiation", "vs/platform/storage/common/storage", "vs/platform/theme/common/colorRegistry", "vs/platform/theme/common/theme", "vs/platform/theme/common/themeService", "vs/base/browser/ui/resizable/resizable", "./suggest", "./suggestWidgetDetails", "./suggestWidgetRenderer", "vs/platform/theme/browser/defaultStyles", "vs/base/browser/ui/aria/aria", "vs/base/browser/ui/codicons/codiconStyles", "vs/css!./media/suggest", "vs/editor/contrib/symbolIcons/browser/symbolIcons"], function (require, exports, dom, listWidget_1, async_1, errors_1, event_1, lifecycle_1, numbers_1, strings, embeddedCodeEditorWidget_1, suggestWidgetStatus_1, nls, contextkey_1, instantiation_1, storage_1, colorRegistry_1, theme_1, themeService_1, resizable_1, suggest_1, suggestWidgetDetails_1, suggestWidgetRenderer_1, defaultStyles_1, aria_1) {
    "use strict";
    var $C6_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$D6 = exports.$C6 = exports.$B6 = void 0;
    /**
     * Suggest widget colors
     */
    (0, colorRegistry_1.$sv)('editorSuggestWidget.background', { dark: colorRegistry_1.$Aw, light: colorRegistry_1.$Aw, hcDark: colorRegistry_1.$Aw, hcLight: colorRegistry_1.$Aw }, nls.localize(0, null));
    (0, colorRegistry_1.$sv)('editorSuggestWidget.border', { dark: colorRegistry_1.$Cw, light: colorRegistry_1.$Cw, hcDark: colorRegistry_1.$Cw, hcLight: colorRegistry_1.$Cw }, nls.localize(1, null));
    const editorSuggestWidgetForeground = (0, colorRegistry_1.$sv)('editorSuggestWidget.foreground', { dark: colorRegistry_1.$xw, light: colorRegistry_1.$xw, hcDark: colorRegistry_1.$xw, hcLight: colorRegistry_1.$xw }, nls.localize(2, null));
    (0, colorRegistry_1.$sv)('editorSuggestWidget.selectedForeground', { dark: colorRegistry_1.$6x, light: colorRegistry_1.$6x, hcDark: colorRegistry_1.$6x, hcLight: colorRegistry_1.$6x }, nls.localize(3, null));
    (0, colorRegistry_1.$sv)('editorSuggestWidget.selectedIconForeground', { dark: colorRegistry_1.$7x, light: colorRegistry_1.$7x, hcDark: colorRegistry_1.$7x, hcLight: colorRegistry_1.$7x }, nls.localize(4, null));
    exports.$B6 = (0, colorRegistry_1.$sv)('editorSuggestWidget.selectedBackground', { dark: colorRegistry_1.$8x, light: colorRegistry_1.$8x, hcDark: colorRegistry_1.$8x, hcLight: colorRegistry_1.$8x }, nls.localize(5, null));
    (0, colorRegistry_1.$sv)('editorSuggestWidget.highlightForeground', { dark: colorRegistry_1.$Jx, light: colorRegistry_1.$Jx, hcDark: colorRegistry_1.$Jx, hcLight: colorRegistry_1.$Jx }, nls.localize(6, null));
    (0, colorRegistry_1.$sv)('editorSuggestWidget.focusHighlightForeground', { dark: colorRegistry_1.$Kx, light: colorRegistry_1.$Kx, hcDark: colorRegistry_1.$Kx, hcLight: colorRegistry_1.$Kx }, nls.localize(7, null));
    (0, colorRegistry_1.$sv)('editorSuggestWidgetStatus.foreground', { dark: (0, colorRegistry_1.$1y)(editorSuggestWidgetForeground, .5), light: (0, colorRegistry_1.$1y)(editorSuggestWidgetForeground, .5), hcDark: (0, colorRegistry_1.$1y)(editorSuggestWidgetForeground, .5), hcLight: (0, colorRegistry_1.$1y)(editorSuggestWidgetForeground, .5) }, nls.localize(8, null));
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
        constructor(b, editor) {
            this.b = b;
            this.a = `suggestWidget.size/${editor.getEditorType()}/${editor instanceof embeddedCodeEditorWidget_1.$w3}`;
        }
        restore() {
            const raw = this.b.get(this.a, 0 /* StorageScope.PROFILE */) ?? '';
            try {
                const obj = JSON.parse(raw);
                if (dom.$BO.is(obj)) {
                    return dom.$BO.lift(obj);
                }
            }
            catch {
                // ignore
            }
            return undefined;
        }
        store(size) {
            this.b.store(this.a, JSON.stringify(size), 0 /* StorageScope.PROFILE */, 1 /* StorageTarget.MACHINE */);
        }
        reset() {
            this.b.remove(this.a, 0 /* StorageScope.PROFILE */);
        }
    }
    let $C6 = class $C6 {
        static { $C6_1 = this; }
        static { this.a = nls.localize(9, null); }
        static { this.b = nls.localize(10, null); }
        constructor(I, J, _contextKeyService, _themeService, instantiationService) {
            this.I = I;
            this.J = J;
            this.c = 0 /* State.Hidden */;
            this.d = false;
            this.g = new lifecycle_1.$lc();
            this.h = new lifecycle_1.$lc();
            this.k = false;
            this.n = false;
            this.o = false;
            this.B = new async_1.$Qg();
            this.C = new lifecycle_1.$jc();
            this.D = new event_1.$id();
            this.E = new event_1.$id();
            this.F = new event_1.$fd();
            this.G = new event_1.$fd();
            this.onDidSelect = this.D.event;
            this.onDidFocus = this.E.event;
            this.onDidHide = this.F.event;
            this.onDidShow = this.G.event;
            this.H = new event_1.$fd();
            this.onDetailsKeyDown = this.H.event;
            this.element = new resizable_1.$ZR();
            this.element.domNode.classList.add('editor-widget', 'suggest-widget');
            this.v = new $D6(this, I);
            this.w = new PersistedWidgetSize(J, I);
            class ResizeState {
                constructor(persistedSize, currentSize, persistHeight = false, persistWidth = false) {
                    this.persistedSize = persistedSize;
                    this.currentSize = currentSize;
                    this.persistHeight = persistHeight;
                    this.persistWidth = persistWidth;
                }
            }
            let state;
            this.C.add(this.element.onDidWillResize(() => {
                this.v.lockPreference();
                state = new ResizeState(this.w.restore(), this.element.size);
            }));
            this.C.add(this.element.onDidResize(e => {
                this.U(e.dimension.width, e.dimension.height);
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
                    this.w.store(new dom.$BO(width, height));
                }
                // reset working state
                this.v.unlockPreference();
                state = undefined;
            }));
            this.p = dom.$0O(this.element.domNode, dom.$('.message'));
            this.q = dom.$0O(this.element.domNode, dom.$('.tree'));
            const details = this.C.add(instantiationService.createInstance(suggestWidgetDetails_1.$v6, this.I));
            details.onDidClose(this.toggleDetails, this, this.C);
            this.u = new suggestWidgetDetails_1.$w6(details, this.I);
            const applyIconStyle = () => this.element.domNode.classList.toggle('no-icons', !this.I.getOption(117 /* EditorOption.suggest */).showIcons);
            applyIconStyle();
            const renderer = instantiationService.createInstance(suggestWidgetRenderer_1.$A6, this.I);
            this.C.add(renderer);
            this.C.add(renderer.onDidToggleDetails(() => this.toggleDetails()));
            this.r = new listWidget_1.$wQ('SuggestWidget', this.q, {
                getHeight: (_element) => this.getLayoutInfo().itemHeight,
                getTemplateId: (_element) => 'suggestion'
            }, [renderer], {
                alwaysConsumeMouseWheel: true,
                useShadows: false,
                mouseSupport: false,
                multipleSelectionSupport: false,
                accessibilityProvider: {
                    getRole: () => 'option',
                    getWidgetAriaLabel: () => nls.localize(11, null),
                    getWidgetRole: () => 'listbox',
                    getAriaLabel: (item) => {
                        let label = item.textLabel;
                        if (typeof item.completion.label !== 'string') {
                            const { detail, description } = item.completion.label;
                            if (detail && description) {
                                label = nls.localize(12, null, label, detail, description);
                            }
                            else if (detail) {
                                label = nls.localize(13, null, label, detail);
                            }
                            else if (description) {
                                label = nls.localize(14, null, label, description);
                            }
                        }
                        if (!item.isResolved || !this.W()) {
                            return label;
                        }
                        const { documentation, detail } = item.completion;
                        const docs = strings.$ne('{0}{1}', detail || '', documentation ? (typeof documentation === 'string' ? documentation : documentation.value) : '');
                        return nls.localize(15, null, label, docs);
                    },
                }
            });
            this.r.style((0, defaultStyles_1.$A2)({
                listInactiveFocusBackground: exports.$B6,
                listInactiveFocusOutline: colorRegistry_1.$Bv
            }));
            this.s = instantiationService.createInstance(suggestWidgetStatus_1.$t6, this.element.domNode, suggest_1.$W5);
            const applyStatusBarStyle = () => this.element.domNode.classList.toggle('with-status-bar', this.I.getOption(117 /* EditorOption.suggest */).showStatusBar);
            applyStatusBarStyle();
            this.C.add(_themeService.onDidColorThemeChange(t => this.P(t)));
            this.P(_themeService.getColorTheme());
            this.C.add(this.r.onMouseDown(e => this.M(e)));
            this.C.add(this.r.onTap(e => this.M(e)));
            this.C.add(this.r.onDidChangeSelection(e => this.N(e)));
            this.C.add(this.r.onDidChangeFocus(e => this.Q(e)));
            this.C.add(this.I.onDidChangeCursorSelection(() => this.L()));
            this.C.add(this.I.onDidChangeConfiguration(e => {
                if (e.hasChanged(117 /* EditorOption.suggest */)) {
                    applyStatusBarStyle();
                    applyIconStyle();
                }
            }));
            this.x = suggest_1.$V5.Visible.bindTo(_contextKeyService);
            this.y = suggest_1.$V5.DetailsVisible.bindTo(_contextKeyService);
            this.z = suggest_1.$V5.MultipleSuggestions.bindTo(_contextKeyService);
            this.A = suggest_1.$V5.HasFocusedSuggestion.bindTo(_contextKeyService);
            this.C.add(dom.$oO(this.u.widget.domNode, 'keydown', e => {
                this.H.fire(e);
            }));
            this.C.add(this.I.onMouseDown((e) => this.K(e)));
        }
        dispose() {
            this.u.widget.dispose();
            this.u.dispose();
            this.r.dispose();
            this.s.dispose();
            this.C.dispose();
            this.f?.dispose();
            this.g.dispose();
            this.h.dispose();
            this.B.dispose();
            this.v.dispose();
            this.element.dispose();
        }
        K(mouseEvent) {
            if (this.u.widget.domNode.contains(mouseEvent.target.element)) {
                // Clicking inside details
                this.u.widget.domNode.focus();
            }
            else {
                // Clicking outside details and inside suggest
                if (this.element.domNode.contains(mouseEvent.target.element)) {
                    this.I.focus();
                }
            }
        }
        L() {
            if (this.c !== 0 /* State.Hidden */) {
                this.v.layout();
            }
        }
        M(e) {
            if (typeof e.element === 'undefined' || typeof e.index === 'undefined') {
                return;
            }
            // prevent stealing browser focus from the editor
            e.browserEvent.preventDefault();
            e.browserEvent.stopPropagation();
            this.O(e.element, e.index);
        }
        N(e) {
            if (e.elements.length) {
                this.O(e.elements[0], e.indexes[0]);
            }
        }
        O(item, index) {
            const completionModel = this.l;
            if (completionModel) {
                this.D.fire({ item, index, model: completionModel });
                this.I.focus();
            }
        }
        P(theme) {
            this.u.widget.borderWidth = (0, theme_1.$ev)(theme.type) ? 2 : 1;
        }
        Q(e) {
            if (this.k) {
                return;
            }
            if (!e.elements.length) {
                if (this.i) {
                    this.i.cancel();
                    this.i = undefined;
                    this.j = undefined;
                }
                this.I.setAriaOptions({ activeDescendant: undefined });
                this.A.set(false);
                return;
            }
            if (!this.l) {
                return;
            }
            this.A.set(true);
            const item = e.elements[0];
            const index = e.indexes[0];
            if (item !== this.j) {
                this.i?.cancel();
                this.i = undefined;
                this.j = item;
                this.r.reveal(index);
                this.i = (0, async_1.$ug)(async (token) => {
                    const loading = (0, async_1.$Ig)(() => {
                        if (this.W()) {
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
                this.i.then(() => {
                    if (index >= this.r.length || item !== this.r.element(index)) {
                        return;
                    }
                    // item can have extra information, so re-render
                    this.k = true;
                    this.r.splice(index, 1, [item]);
                    this.r.setFocus([index]);
                    this.k = false;
                    if (this.W()) {
                        this.showDetails(false);
                    }
                    else {
                        this.element.domNode.classList.remove('docs-side');
                    }
                    this.I.setAriaOptions({ activeDescendant: (0, suggestWidgetRenderer_1.$z6)(index) });
                }).catch(errors_1.$Y);
            }
            // emit an event
            this.E.fire({ item, index, model: this.l });
        }
        R(state) {
            if (this.c === state) {
                return;
            }
            this.c = state;
            this.element.domNode.classList.toggle('frozen', state === 4 /* State.Frozen */);
            this.element.domNode.classList.remove('message');
            switch (state) {
                case 0 /* State.Hidden */:
                    dom.$eP(this.p, this.q, this.s.element);
                    this.u.hide(true);
                    this.s.hide();
                    this.v.hide();
                    this.x.reset();
                    this.z.reset();
                    this.A.reset();
                    this.B.cancel();
                    this.element.domNode.classList.remove('visible');
                    this.r.splice(0, this.r.length);
                    this.j = undefined;
                    this.m = undefined;
                    this.o = false;
                    break;
                case 1 /* State.Loading */:
                    this.element.domNode.classList.add('message');
                    this.p.textContent = $C6_1.a;
                    dom.$eP(this.q, this.s.element);
                    dom.$dP(this.p);
                    this.u.hide();
                    this.S();
                    this.j = undefined;
                    (0, aria_1.$_P)($C6_1.a);
                    break;
                case 2 /* State.Empty */:
                    this.element.domNode.classList.add('message');
                    this.p.textContent = $C6_1.b;
                    dom.$eP(this.q, this.s.element);
                    dom.$dP(this.p);
                    this.u.hide();
                    this.S();
                    this.j = undefined;
                    (0, aria_1.$_P)($C6_1.b);
                    break;
                case 3 /* State.Open */:
                    dom.$eP(this.p);
                    dom.$dP(this.q, this.s.element);
                    this.S();
                    break;
                case 4 /* State.Frozen */:
                    dom.$eP(this.p);
                    dom.$dP(this.q, this.s.element);
                    this.S();
                    break;
                case 5 /* State.Details */:
                    dom.$eP(this.p);
                    dom.$dP(this.q, this.s.element);
                    this.u.show();
                    this.S();
                    break;
            }
        }
        S() {
            this.s.show();
            this.v.show();
            this.T(this.w.restore());
            this.x.set(true);
            this.B.cancelAndSet(() => {
                this.element.domNode.classList.add('visible');
                this.G.fire(this);
            }, 100);
        }
        showTriggered(auto, delay) {
            if (this.c !== 0 /* State.Hidden */) {
                return;
            }
            this.v.setPosition(this.I.getPosition());
            this.d = !!auto;
            if (!this.d) {
                this.f = (0, async_1.$Ig)(() => this.R(1 /* State.Loading */), delay);
            }
        }
        showSuggestions(completionModel, selectionIndex, isFrozen, isAuto, noFocus) {
            this.v.setPosition(this.I.getPosition());
            this.f?.dispose();
            this.i?.cancel();
            this.i = undefined;
            if (this.l !== completionModel) {
                this.l = completionModel;
            }
            if (isFrozen && this.c !== 2 /* State.Empty */ && this.c !== 0 /* State.Hidden */) {
                this.R(4 /* State.Frozen */);
                return;
            }
            const visibleCount = this.l.items.length;
            const isEmpty = visibleCount === 0;
            this.z.set(visibleCount > 1);
            if (isEmpty) {
                this.R(isAuto ? 0 /* State.Hidden */ : 2 /* State.Empty */);
                this.l = undefined;
                return;
            }
            this.j = undefined;
            // calling list.splice triggers focus event which this widget forwards. That can lead to
            // suggestions being cancelled and the widget being cleared (and hidden). All this happens
            // before revealing and focusing is done which means revealing and focusing will fail when
            // they get run.
            this.E.pause();
            this.D.pause();
            try {
                this.r.splice(0, this.r.length, this.l.items);
                this.R(isFrozen ? 4 /* State.Frozen */ : 3 /* State.Open */);
                this.r.reveal(selectionIndex, 0);
                this.r.setFocus(noFocus ? [] : [selectionIndex]);
            }
            finally {
                this.E.resume();
                this.D.resume();
            }
            this.g.value = dom.$uO(() => {
                this.g.clear();
                this.T(this.element.size);
                // Reset focus border
                this.u.widget.domNode.classList.remove('focused');
            });
        }
        focusSelected() {
            if (this.r.length > 0) {
                this.r.setFocus([0]);
            }
        }
        selectNextPage() {
            switch (this.c) {
                case 0 /* State.Hidden */:
                    return false;
                case 5 /* State.Details */:
                    this.u.widget.pageDown();
                    return true;
                case 1 /* State.Loading */:
                    return !this.d;
                default:
                    this.r.focusNextPage();
                    return true;
            }
        }
        selectNext() {
            switch (this.c) {
                case 0 /* State.Hidden */:
                    return false;
                case 1 /* State.Loading */:
                    return !this.d;
                default:
                    this.r.focusNext(1, true);
                    return true;
            }
        }
        selectLast() {
            switch (this.c) {
                case 0 /* State.Hidden */:
                    return false;
                case 5 /* State.Details */:
                    this.u.widget.scrollBottom();
                    return true;
                case 1 /* State.Loading */:
                    return !this.d;
                default:
                    this.r.focusLast();
                    return true;
            }
        }
        selectPreviousPage() {
            switch (this.c) {
                case 0 /* State.Hidden */:
                    return false;
                case 5 /* State.Details */:
                    this.u.widget.pageUp();
                    return true;
                case 1 /* State.Loading */:
                    return !this.d;
                default:
                    this.r.focusPreviousPage();
                    return true;
            }
        }
        selectPrevious() {
            switch (this.c) {
                case 0 /* State.Hidden */:
                    return false;
                case 1 /* State.Loading */:
                    return !this.d;
                default:
                    this.r.focusPrevious(1, true);
                    return false;
            }
        }
        selectFirst() {
            switch (this.c) {
                case 0 /* State.Hidden */:
                    return false;
                case 5 /* State.Details */:
                    this.u.widget.scrollTop();
                    return true;
                case 1 /* State.Loading */:
                    return !this.d;
                default:
                    this.r.focusFirst();
                    return true;
            }
        }
        getFocusedItem() {
            if (this.c !== 0 /* State.Hidden */
                && this.c !== 2 /* State.Empty */
                && this.c !== 1 /* State.Loading */
                && this.l
                && this.r.getFocus().length > 0) {
                return {
                    item: this.r.getFocusedElements()[0],
                    index: this.r.getFocus()[0],
                    model: this.l
                };
            }
            return undefined;
        }
        toggleDetailsFocus() {
            if (this.c === 5 /* State.Details */) {
                this.R(3 /* State.Open */);
                this.u.widget.domNode.classList.remove('focused');
            }
            else if (this.c === 3 /* State.Open */ && this.W()) {
                this.R(5 /* State.Details */);
                this.u.widget.domNode.classList.add('focused');
            }
        }
        toggleDetails() {
            if (this.W()) {
                // hide details widget
                this.h.clear();
                this.y.set(false);
                this.X(false);
                this.u.hide();
                this.element.domNode.classList.remove('shows-details');
            }
            else if (((0, suggestWidgetDetails_1.$u6)(this.r.getFocusedElements()[0]) || this.o) && (this.c === 3 /* State.Open */ || this.c === 5 /* State.Details */ || this.c === 4 /* State.Frozen */)) {
                // show details widget (iff possible)
                this.y.set(true);
                this.X(true);
                this.showDetails(false);
            }
        }
        showDetails(loading) {
            this.h.value = dom.$uO(() => {
                this.h.clear();
                this.u.show();
                if (loading) {
                    this.u.widget.renderLoading();
                }
                else {
                    this.u.widget.renderItem(this.r.getFocusedElements()[0], this.o);
                }
                this.V();
                this.I.focus();
                this.element.domNode.classList.add('shows-details');
            });
        }
        toggleExplainMode() {
            if (this.r.getFocusedElements()[0]) {
                this.o = !this.o;
                if (!this.W()) {
                    this.toggleDetails();
                }
                else {
                    this.showDetails(false);
                }
            }
        }
        resetPersistedSize() {
            this.w.reset();
        }
        hideWidget() {
            this.g.clear();
            this.h.clear();
            this.f?.dispose();
            this.R(0 /* State.Hidden */);
            this.F.fire(this);
            this.element.clearSashHoverState();
            // ensure that a reasonable widget height is persisted so that
            // accidential "resize-to-single-items" cases aren't happening
            const dim = this.w.restore();
            const minPersistedHeight = Math.ceil(this.getLayoutInfo().itemHeight * 4.3);
            if (dim && dim.height < minPersistedHeight) {
                this.w.store(dim.with(undefined, minPersistedHeight));
            }
        }
        isFrozen() {
            return this.c === 4 /* State.Frozen */;
        }
        _afterRender(position) {
            if (position === null) {
                if (this.W()) {
                    this.u.hide(); //todo@jrieken soft-hide
                }
                return;
            }
            if (this.c === 2 /* State.Empty */ || this.c === 1 /* State.Loading */) {
                // no special positioning when widget isn't showing list
                return;
            }
            if (this.W()) {
                this.u.show();
            }
            this.V();
        }
        T(size) {
            if (!this.I.hasModel()) {
                return;
            }
            if (!this.I.getDomNode()) {
                // happens when running tests
                return;
            }
            const bodyBox = dom.$AO(this.element.domNode.ownerDocument.body);
            const info = this.getLayoutInfo();
            if (!size) {
                size = info.defaultSize;
            }
            let height = size.height;
            let width = size.width;
            // status bar
            this.s.element.style.height = `${info.itemHeight}px`;
            if (this.c === 2 /* State.Empty */ || this.c === 1 /* State.Loading */) {
                // showing a message only
                height = info.itemHeight + info.borderHeight;
                width = info.defaultSize.width / 2;
                this.element.enableSashes(false, false, false, false);
                this.element.minSize = this.element.maxSize = new dom.$BO(width, height);
                this.v.setPreference(2 /* ContentWidgetPositionPreference.BELOW */);
            }
            else {
                // showing items
                // width math
                const maxWidth = bodyBox.width - info.borderHeight - 2 * info.horizontalPadding;
                if (width > maxWidth) {
                    width = maxWidth;
                }
                const preferredWidth = this.l ? this.l.stats.pLabelLen * info.typicalHalfwidthCharacterWidth : width;
                // height math
                const fullHeight = info.statusBarHeight + this.r.contentHeight + info.borderHeight;
                const minHeight = info.itemHeight + info.statusBarHeight;
                const editorBox = dom.$FO(this.I.getDomNode());
                const cursorBox = this.I.getScrolledVisiblePosition(this.I.getPosition());
                const cursorBottom = editorBox.top + cursorBox.top + cursorBox.height;
                const maxHeightBelow = Math.min(bodyBox.height - cursorBottom - info.verticalPadding, fullHeight);
                const availableSpaceAbove = editorBox.top + cursorBox.top - info.verticalPadding;
                const maxHeightAbove = Math.min(availableSpaceAbove, fullHeight);
                let maxHeight = Math.min(Math.max(maxHeightAbove, maxHeightBelow) + info.borderHeight, fullHeight);
                if (height === this.m?.capped) {
                    // Restore the old (wanted) height when the current
                    // height is capped to fit
                    height = this.m.wanted;
                }
                if (height < minHeight) {
                    height = minHeight;
                }
                if (height > maxHeight) {
                    height = maxHeight;
                }
                const forceRenderingAboveRequiredSpace = 150;
                if (height > maxHeightBelow || (this.n && availableSpaceAbove > forceRenderingAboveRequiredSpace)) {
                    this.v.setPreference(1 /* ContentWidgetPositionPreference.ABOVE */);
                    this.element.enableSashes(true, true, false, false);
                    maxHeight = maxHeightAbove;
                }
                else {
                    this.v.setPreference(2 /* ContentWidgetPositionPreference.BELOW */);
                    this.element.enableSashes(false, true, true, false);
                    maxHeight = maxHeightBelow;
                }
                this.element.preferredSize = new dom.$BO(preferredWidth, info.defaultSize.height);
                this.element.maxSize = new dom.$BO(maxWidth, maxHeight);
                this.element.minSize = new dom.$BO(220, minHeight);
                // Know when the height was capped to fit and remember
                // the wanted height for later. This is required when going
                // left to widen suggestions.
                this.m = height === fullHeight
                    ? { wanted: this.m?.wanted ?? size.height, capped: height }
                    : undefined;
            }
            this.U(width, height);
        }
        U(width, height) {
            const { width: maxWidth, height: maxHeight } = this.element.maxSize;
            width = Math.min(maxWidth, width);
            height = Math.min(maxHeight, height);
            const { statusBarHeight } = this.getLayoutInfo();
            this.r.layout(height - statusBarHeight, width);
            this.q.style.height = `${height - statusBarHeight}px`;
            this.element.layout(height, width);
            this.v.layout();
            this.V();
        }
        V() {
            if (this.W()) {
                this.u.placeAtAnchor(this.element.domNode, this.v.getPosition()?.preference[0] === 2 /* ContentWidgetPositionPreference.BELOW */);
            }
        }
        getLayoutInfo() {
            const fontInfo = this.I.getOption(50 /* EditorOption.fontInfo */);
            const itemHeight = (0, numbers_1.$Hl)(this.I.getOption(119 /* EditorOption.suggestLineHeight */) || fontInfo.lineHeight, 8, 1000);
            const statusBarHeight = !this.I.getOption(117 /* EditorOption.suggest */).showStatusBar || this.c === 2 /* State.Empty */ || this.c === 1 /* State.Loading */ ? 0 : itemHeight;
            const borderWidth = this.u.widget.borderWidth;
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
        W() {
            return this.J.getBoolean('expandSuggestionDocs', 0 /* StorageScope.PROFILE */, false);
        }
        X(value) {
            this.J.store('expandSuggestionDocs', value, 0 /* StorageScope.PROFILE */, 0 /* StorageTarget.USER */);
        }
        forceRenderingAbove() {
            if (!this.n) {
                this.n = true;
                this.T(this.w.restore());
            }
        }
        stopForceRenderingAbove() {
            this.n = false;
        }
    };
    exports.$C6 = $C6;
    exports.$C6 = $C6 = $C6_1 = __decorate([
        __param(1, storage_1.$Vo),
        __param(2, contextkey_1.$3i),
        __param(3, themeService_1.$gv),
        __param(4, instantiation_1.$Ah)
    ], $C6);
    class $D6 {
        constructor(g, h) {
            this.g = g;
            this.h = h;
            this.allowEditorOverflow = true;
            this.suppressMouseDown = false;
            this.c = false;
            this.d = false;
            this.f = false;
        }
        dispose() {
            if (this.d) {
                this.d = false;
                this.h.removeContentWidget(this);
            }
        }
        getId() {
            return 'editor.widget.suggestWidget';
        }
        getDomNode() {
            return this.g.element.domNode;
        }
        show() {
            this.f = false;
            if (!this.d) {
                this.d = true;
                this.h.addContentWidget(this);
            }
        }
        hide() {
            if (!this.f) {
                this.f = true;
                this.layout();
            }
        }
        layout() {
            this.h.layoutContentWidget(this);
        }
        getPosition() {
            if (this.f || !this.a || !this.b) {
                return null;
            }
            return {
                position: this.a,
                preference: [this.b]
            };
        }
        beforeRender() {
            const { height, width } = this.g.element.size;
            const { borderWidth, horizontalPadding } = this.g.getLayoutInfo();
            return new dom.$BO(width + 2 * borderWidth + horizontalPadding, height + 2 * borderWidth);
        }
        afterRender(position) {
            this.g._afterRender(position);
        }
        setPreference(preference) {
            if (!this.c) {
                this.b = preference;
            }
        }
        lockPreference() {
            this.c = true;
        }
        unlockPreference() {
            this.c = false;
        }
        setPosition(position) {
            this.a = position;
        }
    }
    exports.$D6 = $D6;
});
//# sourceMappingURL=suggestWidget.js.map