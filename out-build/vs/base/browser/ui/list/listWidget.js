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
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/event", "vs/base/browser/keyboardEvent", "vs/base/browser/touch", "vs/base/browser/ui/aria/aria", "vs/base/browser/ui/list/splice", "vs/base/common/arrays", "vs/base/common/async", "vs/base/common/color", "vs/base/common/decorators", "vs/base/common/event", "vs/base/common/filters", "vs/base/common/lifecycle", "vs/base/common/numbers", "vs/base/common/platform", "vs/base/common/types", "./list", "./listView", "vs/base/browser/mouseEvent", "vs/css!./list"], function (require, exports, dom_1, event_1, keyboardEvent_1, touch_1, aria_1, splice_1, arrays_1, async_1, color_1, decorators_1, event_2, filters_1, lifecycle_1, numbers_1, platform, types_1, list_1, listView_1, mouseEvent_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$wQ = exports.$vQ = exports.$uQ = exports.$tQ = exports.$sQ = exports.$rQ = exports.$qQ = exports.TypeNavigationMode = exports.$pQ = exports.$oQ = exports.$nQ = void 0;
    class TraitRenderer {
        constructor(d) {
            this.d = d;
            this.c = [];
        }
        get templateId() {
            return `template:${this.d.name}`;
        }
        renderTemplate(container) {
            return container;
        }
        renderElement(element, index, templateData) {
            const renderedElementIndex = this.c.findIndex(el => el.templateData === templateData);
            if (renderedElementIndex >= 0) {
                const rendered = this.c[renderedElementIndex];
                this.d.unrender(templateData);
                rendered.index = index;
            }
            else {
                const rendered = { index, templateData };
                this.c.push(rendered);
            }
            this.d.renderIndex(index, templateData);
        }
        splice(start, deleteCount, insertCount) {
            const rendered = [];
            for (const renderedElement of this.c) {
                if (renderedElement.index < start) {
                    rendered.push(renderedElement);
                }
                else if (renderedElement.index >= start + deleteCount) {
                    rendered.push({
                        index: renderedElement.index + insertCount - deleteCount,
                        templateData: renderedElement.templateData
                    });
                }
            }
            this.c = rendered;
        }
        renderIndexes(indexes) {
            for (const { index, templateData } of this.c) {
                if (indexes.indexOf(index) > -1) {
                    this.d.renderIndex(index, templateData);
                }
            }
        }
        disposeTemplate(templateData) {
            const index = this.c.findIndex(el => el.templateData === templateData);
            if (index < 0) {
                return;
            }
            this.c.splice(index, 1);
        }
    }
    class Trait {
        get name() { return this.h; }
        get renderer() {
            return new TraitRenderer(this);
        }
        constructor(h) {
            this.h = h;
            this.c = 0;
            this.d = [];
            this.f = [];
            this.g = new event_2.$fd();
            this.onChange = this.g.event;
        }
        splice(start, deleteCount, elements) {
            deleteCount = Math.max(0, Math.min(deleteCount, this.c - start));
            const diff = elements.length - deleteCount;
            const end = start + deleteCount;
            const sortedIndexes = [];
            let i = 0;
            while (i < this.f.length && this.f[i] < start) {
                sortedIndexes.push(this.f[i++]);
            }
            for (let j = 0; j < elements.length; j++) {
                if (elements[j]) {
                    sortedIndexes.push(j + start);
                }
            }
            while (i < this.f.length && this.f[i] >= end) {
                sortedIndexes.push(this.f[i++] + diff);
            }
            const length = this.c + diff;
            if (this.f.length > 0 && sortedIndexes.length === 0 && length > 0) {
                const first = this.f.find(index => index >= start) ?? length - 1;
                sortedIndexes.push(Math.min(first, length - 1));
            }
            this.renderer.splice(start, deleteCount, elements.length);
            this.k(sortedIndexes, sortedIndexes);
            this.c = length;
        }
        renderIndex(index, container) {
            container.classList.toggle(this.h, this.contains(index));
        }
        unrender(container) {
            container.classList.remove(this.h);
        }
        /**
         * Sets the indexes which should have this trait.
         *
         * @param indexes Indexes which should have this trait.
         * @return The old indexes which had this trait.
         */
        set(indexes, browserEvent) {
            return this.k(indexes, [...indexes].sort(numericSort), browserEvent);
        }
        k(indexes, sortedIndexes, browserEvent) {
            const result = this.d;
            const sortedResult = this.f;
            this.d = indexes;
            this.f = sortedIndexes;
            const toRender = disjunction(sortedResult, indexes);
            this.renderer.renderIndexes(toRender);
            this.g.fire({ indexes, browserEvent });
            return result;
        }
        get() {
            return this.d;
        }
        contains(index) {
            return (0, arrays_1.$ub)(this.f, index, numericSort) >= 0;
        }
        dispose() {
            (0, lifecycle_1.$fc)(this.g);
        }
    }
    __decorate([
        decorators_1.$6g
    ], Trait.prototype, "renderer", null);
    class SelectionTrait extends Trait {
        constructor(l) {
            super('selected');
            this.l = l;
        }
        renderIndex(index, container) {
            super.renderIndex(index, container);
            if (this.l) {
                if (this.contains(index)) {
                    container.setAttribute('aria-selected', 'true');
                }
                else {
                    container.setAttribute('aria-selected', 'false');
                }
            }
        }
    }
    /**
     * The TraitSpliceable is used as a util class to be able
     * to preserve traits across splice calls, given an identity
     * provider.
     */
    class TraitSpliceable {
        constructor(c, d, f) {
            this.c = c;
            this.d = d;
            this.f = f;
        }
        splice(start, deleteCount, elements) {
            if (!this.f) {
                return this.c.splice(start, deleteCount, new Array(elements.length).fill(false));
            }
            const pastElementsWithTrait = this.c.get().map(i => this.f.getId(this.d.element(i)).toString());
            if (pastElementsWithTrait.length === 0) {
                return this.c.splice(start, deleteCount, new Array(elements.length).fill(false));
            }
            const pastElementsWithTraitSet = new Set(pastElementsWithTrait);
            const elementsWithTrait = elements.map(e => pastElementsWithTraitSet.has(this.f.getId(e).toString()));
            this.c.splice(start, deleteCount, elementsWithTrait);
        }
    }
    function $nQ(e) {
        return e.tagName === 'INPUT' || e.tagName === 'TEXTAREA';
    }
    exports.$nQ = $nQ;
    function $oQ(e) {
        if (e.classList.contains('monaco-editor')) {
            return true;
        }
        if (e.classList.contains('monaco-list')) {
            return false;
        }
        if (!e.parentElement) {
            return false;
        }
        return $oQ(e.parentElement);
    }
    exports.$oQ = $oQ;
    function $pQ(e) {
        if ((e.tagName === 'A' && e.classList.contains('monaco-button')) ||
            (e.tagName === 'DIV' && e.classList.contains('monaco-button-dropdown'))) {
            return true;
        }
        if (e.classList.contains('monaco-list')) {
            return false;
        }
        if (!e.parentElement) {
            return false;
        }
        return $pQ(e.parentElement);
    }
    exports.$pQ = $pQ;
    class KeyboardController {
        get g() {
            return event_2.Event.chain(this.c.add(new event_1.$9P(this.k.domNode, 'keydown')).event, $ => $.filter(e => !$nQ(e.target))
                .map(e => new keyboardEvent_1.$jO(e)));
        }
        constructor(h, k, options) {
            this.h = h;
            this.k = k;
            this.c = new lifecycle_1.$jc();
            this.d = new lifecycle_1.$jc();
            this.f = options.multipleSelectionSupport;
            this.c.add(this.g(e => {
                switch (e.keyCode) {
                    case 3 /* KeyCode.Enter */:
                        return this.l(e);
                    case 16 /* KeyCode.UpArrow */:
                        return this.o(e);
                    case 18 /* KeyCode.DownArrow */:
                        return this.p(e);
                    case 11 /* KeyCode.PageUp */:
                        return this.q(e);
                    case 12 /* KeyCode.PageDown */:
                        return this.s(e);
                    case 9 /* KeyCode.Escape */:
                        return this.u(e);
                    case 31 /* KeyCode.KeyA */:
                        if (this.f && (platform.$j ? e.metaKey : e.ctrlKey)) {
                            this.t(e);
                        }
                }
            }));
        }
        updateOptions(optionsUpdate) {
            if (optionsUpdate.multipleSelectionSupport !== undefined) {
                this.f = optionsUpdate.multipleSelectionSupport;
            }
        }
        l(e) {
            e.preventDefault();
            e.stopPropagation();
            this.h.setSelection(this.h.getFocus(), e.browserEvent);
        }
        o(e) {
            e.preventDefault();
            e.stopPropagation();
            this.h.focusPrevious(1, false, e.browserEvent);
            const el = this.h.getFocus()[0];
            this.h.setAnchor(el);
            this.h.reveal(el);
            this.k.domNode.focus();
        }
        p(e) {
            e.preventDefault();
            e.stopPropagation();
            this.h.focusNext(1, false, e.browserEvent);
            const el = this.h.getFocus()[0];
            this.h.setAnchor(el);
            this.h.reveal(el);
            this.k.domNode.focus();
        }
        q(e) {
            e.preventDefault();
            e.stopPropagation();
            this.h.focusPreviousPage(e.browserEvent);
            const el = this.h.getFocus()[0];
            this.h.setAnchor(el);
            this.h.reveal(el);
            this.k.domNode.focus();
        }
        s(e) {
            e.preventDefault();
            e.stopPropagation();
            this.h.focusNextPage(e.browserEvent);
            const el = this.h.getFocus()[0];
            this.h.setAnchor(el);
            this.h.reveal(el);
            this.k.domNode.focus();
        }
        t(e) {
            e.preventDefault();
            e.stopPropagation();
            this.h.setSelection((0, arrays_1.$Qb)(this.h.length), e.browserEvent);
            this.h.setAnchor(undefined);
            this.k.domNode.focus();
        }
        u(e) {
            if (this.h.getSelection().length) {
                e.preventDefault();
                e.stopPropagation();
                this.h.setSelection([], e.browserEvent);
                this.h.setAnchor(undefined);
                this.k.domNode.focus();
            }
        }
        dispose() {
            this.c.dispose();
            this.d.dispose();
        }
    }
    __decorate([
        decorators_1.$6g
    ], KeyboardController.prototype, "g", null);
    var TypeNavigationMode;
    (function (TypeNavigationMode) {
        TypeNavigationMode[TypeNavigationMode["Automatic"] = 0] = "Automatic";
        TypeNavigationMode[TypeNavigationMode["Trigger"] = 1] = "Trigger";
    })(TypeNavigationMode || (exports.TypeNavigationMode = TypeNavigationMode = {}));
    var TypeNavigationControllerState;
    (function (TypeNavigationControllerState) {
        TypeNavigationControllerState[TypeNavigationControllerState["Idle"] = 0] = "Idle";
        TypeNavigationControllerState[TypeNavigationControllerState["Typing"] = 1] = "Typing";
    })(TypeNavigationControllerState || (TypeNavigationControllerState = {}));
    exports.$qQ = new class {
        mightProducePrintableCharacter(event) {
            if (event.ctrlKey || event.metaKey || event.altKey) {
                return false;
            }
            return (event.keyCode >= 31 /* KeyCode.KeyA */ && event.keyCode <= 56 /* KeyCode.KeyZ */)
                || (event.keyCode >= 21 /* KeyCode.Digit0 */ && event.keyCode <= 30 /* KeyCode.Digit9 */)
                || (event.keyCode >= 98 /* KeyCode.Numpad0 */ && event.keyCode <= 107 /* KeyCode.Numpad9 */)
                || (event.keyCode >= 85 /* KeyCode.Semicolon */ && event.keyCode <= 95 /* KeyCode.Quote */);
        }
    };
    class TypeNavigationController {
        constructor(o, p, q, s, t) {
            this.o = o;
            this.p = p;
            this.q = q;
            this.s = s;
            this.t = t;
            this.c = false;
            this.d = TypeNavigationControllerState.Idle;
            this.f = TypeNavigationMode.Automatic;
            this.g = false;
            this.h = -1;
            this.k = new lifecycle_1.$jc();
            this.l = new lifecycle_1.$jc();
            this.updateOptions(o.options);
        }
        updateOptions(options) {
            if (options.typeNavigationEnabled ?? true) {
                this.u();
            }
            else {
                this.v();
            }
            this.f = options.typeNavigationMode ?? TypeNavigationMode.Automatic;
        }
        trigger() {
            this.g = !this.g;
        }
        u() {
            if (this.c) {
                return;
            }
            let typing = false;
            const onChar = event_2.Event.chain(this.k.add(new event_1.$9P(this.p.domNode, 'keydown')).event, $ => $.filter(e => !$nQ(e.target))
                .filter(() => this.f === TypeNavigationMode.Automatic || this.g)
                .map(event => new keyboardEvent_1.$jO(event))
                .filter(e => typing || this.s(e))
                .filter(e => this.t.mightProducePrintableCharacter(e))
                .forEach(e => dom_1.$5O.stop(e, true))
                .map(event => event.browserEvent.key));
            const onClear = event_2.Event.debounce(onChar, () => null, 800, undefined, undefined, undefined, this.k);
            const onInput = event_2.Event.reduce(event_2.Event.any(onChar, onClear), (r, i) => i === null ? null : ((r || '') + i), undefined, this.k);
            onInput(this.x, this, this.k);
            onClear(this.w, this, this.k);
            onChar(() => typing = true, undefined, this.k);
            onClear(() => typing = false, undefined, this.k);
            this.c = true;
            this.g = false;
        }
        v() {
            if (!this.c) {
                return;
            }
            this.k.clear();
            this.c = false;
            this.g = false;
        }
        w() {
            const focus = this.o.getFocus();
            if (focus.length > 0 && focus[0] === this.h) {
                // List: re-announce element on typing end since typed keys will interrupt aria label of focused element
                // Do not announce if there was a focus change at the end to prevent duplication https://github.com/microsoft/vscode/issues/95961
                const ariaLabel = this.o.options.accessibilityProvider?.getAriaLabel(this.o.element(focus[0]));
                if (ariaLabel) {
                    (0, aria_1.$$P)(ariaLabel);
                }
            }
            this.h = -1;
        }
        x(word) {
            if (!word) {
                this.d = TypeNavigationControllerState.Idle;
                this.g = false;
                return;
            }
            const focus = this.o.getFocus();
            const start = focus.length > 0 ? focus[0] : 0;
            const delta = this.d === TypeNavigationControllerState.Idle ? 1 : 0;
            this.d = TypeNavigationControllerState.Typing;
            for (let i = 0; i < this.o.length; i++) {
                const index = (start + i + delta) % this.o.length;
                const label = this.q.getKeyboardNavigationLabel(this.p.element(index));
                const labelStr = label && label.toString();
                if (this.o.options.typeNavigationEnabled) {
                    if (typeof labelStr !== 'undefined') {
                        // If prefix is found, focus and return early
                        if ((0, filters_1.$yj)(word, labelStr)) {
                            this.h = start;
                            this.o.setFocus([index]);
                            this.o.reveal(index);
                            return;
                        }
                        const fuzzy = (0, filters_1.$Fj)(word, labelStr);
                        if (fuzzy) {
                            const fuzzyScore = fuzzy[0].end - fuzzy[0].start;
                            // ensures that when fuzzy matching, doesn't clash with prefix matching (1 input vs 1+ should be prefix and fuzzy respecitvely). Also makes sure that exact matches are prioritized.
                            if (fuzzyScore > 1 && fuzzy.length === 1) {
                                this.h = start;
                                this.o.setFocus([index]);
                                this.o.reveal(index);
                                return;
                            }
                        }
                    }
                }
                else if (typeof labelStr === 'undefined' || (0, filters_1.$yj)(word, labelStr)) {
                    this.h = start;
                    this.o.setFocus([index]);
                    this.o.reveal(index);
                    return;
                }
            }
        }
        dispose() {
            this.v();
            this.k.dispose();
            this.l.dispose();
        }
    }
    class DOMFocusController {
        constructor(d, f) {
            this.d = d;
            this.f = f;
            this.c = new lifecycle_1.$jc();
            const onKeyDown = event_2.Event.chain(this.c.add(new event_1.$9P(f.domNode, 'keydown')).event, $ => $
                .filter(e => !$nQ(e.target))
                .map(e => new keyboardEvent_1.$jO(e)));
            const onTab = event_2.Event.chain(onKeyDown, $ => $.filter(e => e.keyCode === 2 /* KeyCode.Tab */ && !e.ctrlKey && !e.metaKey && !e.shiftKey && !e.altKey));
            onTab(this.g, this, this.c);
        }
        g(e) {
            if (e.target !== this.f.domNode) {
                return;
            }
            const focus = this.d.getFocus();
            if (focus.length === 0) {
                return;
            }
            const focusedDomElement = this.f.domElement(focus[0]);
            if (!focusedDomElement) {
                return;
            }
            const tabIndexElement = focusedDomElement.querySelector('[tabIndex]');
            if (!tabIndexElement || !(tabIndexElement instanceof HTMLElement) || tabIndexElement.tabIndex === -1) {
                return;
            }
            const style = window.getComputedStyle(tabIndexElement);
            if (style.visibility === 'hidden' || style.display === 'none') {
                return;
            }
            e.preventDefault();
            e.stopPropagation();
            tabIndexElement.focus();
        }
        dispose() {
            this.c.dispose();
        }
    }
    function $rQ(event) {
        return platform.$j ? event.browserEvent.metaKey : event.browserEvent.ctrlKey;
    }
    exports.$rQ = $rQ;
    function $sQ(event) {
        return event.browserEvent.shiftKey;
    }
    exports.$sQ = $sQ;
    function isMouseRightClick(event) {
        return event instanceof MouseEvent && event.button === 2;
    }
    const DefaultMultipleSelectionController = {
        isSelectionSingleChangeEvent: $rQ,
        isSelectionRangeChangeEvent: $sQ
    };
    class $tQ {
        constructor(k) {
            this.k = k;
            this.f = new lifecycle_1.$jc();
            this.g = new event_2.$fd();
            this.onPointer = this.g.event;
            if (k.options.multipleSelectionSupport !== false) {
                this.c = this.k.options.multipleSelectionController || DefaultMultipleSelectionController;
            }
            this.d = typeof k.options.mouseSupport === 'undefined' || !!k.options.mouseSupport;
            if (this.d) {
                k.onMouseDown(this.s, this, this.f);
                k.onContextMenu(this.t, this, this.f);
                k.onMouseDblClick(this.v, this, this.f);
                k.onTouchStart(this.s, this, this.f);
                this.f.add(touch_1.$EP.addTarget(k.getHTMLElement()));
            }
            event_2.Event.any(k.onMouseClick, k.onMouseMiddleClick, k.onTap)(this.u, this, this.f);
        }
        updateOptions(optionsUpdate) {
            if (optionsUpdate.multipleSelectionSupport !== undefined) {
                this.c = undefined;
                if (optionsUpdate.multipleSelectionSupport) {
                    this.c = this.k.options.multipleSelectionController || DefaultMultipleSelectionController;
                }
            }
        }
        o(event) {
            if (!this.c) {
                return false;
            }
            return this.c.isSelectionSingleChangeEvent(event);
        }
        p(event) {
            if (!this.c) {
                return false;
            }
            return this.c.isSelectionRangeChangeEvent(event);
        }
        q(event) {
            return this.o(event) || this.p(event);
        }
        s(e) {
            if ($oQ(e.browserEvent.target)) {
                return;
            }
            if (document.activeElement !== e.browserEvent.target) {
                this.k.domFocus();
            }
        }
        t(e) {
            if ($nQ(e.browserEvent.target) || $oQ(e.browserEvent.target)) {
                return;
            }
            const focus = typeof e.index === 'undefined' ? [] : [e.index];
            this.k.setFocus(focus, e.browserEvent);
        }
        u(e) {
            if (!this.d) {
                return;
            }
            if ($nQ(e.browserEvent.target) || $oQ(e.browserEvent.target)) {
                return;
            }
            if (e.browserEvent.isHandledByList) {
                return;
            }
            e.browserEvent.isHandledByList = true;
            const focus = e.index;
            if (typeof focus === 'undefined') {
                this.k.setFocus([], e.browserEvent);
                this.k.setSelection([], e.browserEvent);
                this.k.setAnchor(undefined);
                return;
            }
            if (this.q(e)) {
                return this.w(e);
            }
            this.k.setFocus([focus], e.browserEvent);
            this.k.setAnchor(focus);
            if (!isMouseRightClick(e.browserEvent)) {
                this.k.setSelection([focus], e.browserEvent);
            }
            this.g.fire(e);
        }
        v(e) {
            if ($nQ(e.browserEvent.target) || $oQ(e.browserEvent.target)) {
                return;
            }
            if (this.q(e)) {
                return;
            }
            if (e.browserEvent.isHandledByList) {
                return;
            }
            e.browserEvent.isHandledByList = true;
            const focus = this.k.getFocus();
            this.k.setSelection(focus, e.browserEvent);
        }
        w(e) {
            const focus = e.index;
            let anchor = this.k.getAnchor();
            if (this.p(e)) {
                if (typeof anchor === 'undefined') {
                    const currentFocus = this.k.getFocus()[0];
                    anchor = currentFocus ?? focus;
                    this.k.setAnchor(anchor);
                }
                const min = Math.min(anchor, focus);
                const max = Math.max(anchor, focus);
                const rangeSelection = (0, arrays_1.$Qb)(min, max + 1);
                const selection = this.k.getSelection();
                const contiguousRange = getContiguousRangeContaining(disjunction(selection, [anchor]), anchor);
                if (contiguousRange.length === 0) {
                    return;
                }
                const newSelection = disjunction(rangeSelection, relativeComplement(selection, contiguousRange));
                this.k.setSelection(newSelection, e.browserEvent);
                this.k.setFocus([focus], e.browserEvent);
            }
            else if (this.o(e)) {
                const selection = this.k.getSelection();
                const newSelection = selection.filter(i => i !== focus);
                this.k.setFocus([focus]);
                this.k.setAnchor(focus);
                if (selection.length === newSelection.length) {
                    this.k.setSelection([...newSelection, focus], e.browserEvent);
                }
                else {
                    this.k.setSelection(newSelection, e.browserEvent);
                }
            }
        }
        dispose() {
            this.f.dispose();
        }
    }
    exports.$tQ = $tQ;
    class $uQ {
        constructor(c, d) {
            this.c = c;
            this.d = d;
        }
        style(styles) {
            const suffix = this.d && `.${this.d}`;
            const content = [];
            if (styles.listBackground) {
                content.push(`.monaco-list${suffix} .monaco-list-rows { background: ${styles.listBackground}; }`);
            }
            if (styles.listFocusBackground) {
                content.push(`.monaco-list${suffix}:focus .monaco-list-row.focused { background-color: ${styles.listFocusBackground}; }`);
                content.push(`.monaco-list${suffix}:focus .monaco-list-row.focused:hover { background-color: ${styles.listFocusBackground}; }`); // overwrite :hover style in this case!
            }
            if (styles.listFocusForeground) {
                content.push(`.monaco-list${suffix}:focus .monaco-list-row.focused { color: ${styles.listFocusForeground}; }`);
            }
            if (styles.listActiveSelectionBackground) {
                content.push(`.monaco-list${suffix}:focus .monaco-list-row.selected { background-color: ${styles.listActiveSelectionBackground}; }`);
                content.push(`.monaco-list${suffix}:focus .monaco-list-row.selected:hover { background-color: ${styles.listActiveSelectionBackground}; }`); // overwrite :hover style in this case!
            }
            if (styles.listActiveSelectionForeground) {
                content.push(`.monaco-list${suffix}:focus .monaco-list-row.selected { color: ${styles.listActiveSelectionForeground}; }`);
            }
            if (styles.listActiveSelectionIconForeground) {
                content.push(`.monaco-list${suffix}:focus .monaco-list-row.selected .codicon { color: ${styles.listActiveSelectionIconForeground}; }`);
            }
            if (styles.listFocusAndSelectionBackground) {
                content.push(`
				.monaco-drag-image,
				.monaco-list${suffix}:focus .monaco-list-row.selected.focused { background-color: ${styles.listFocusAndSelectionBackground}; }
			`);
            }
            if (styles.listFocusAndSelectionForeground) {
                content.push(`
				.monaco-drag-image,
				.monaco-list${suffix}:focus .monaco-list-row.selected.focused { color: ${styles.listFocusAndSelectionForeground}; }
			`);
            }
            if (styles.listInactiveFocusForeground) {
                content.push(`.monaco-list${suffix} .monaco-list-row.focused { color:  ${styles.listInactiveFocusForeground}; }`);
                content.push(`.monaco-list${suffix} .monaco-list-row.focused:hover { color:  ${styles.listInactiveFocusForeground}; }`); // overwrite :hover style in this case!
            }
            if (styles.listInactiveSelectionIconForeground) {
                content.push(`.monaco-list${suffix} .monaco-list-row.focused .codicon { color:  ${styles.listInactiveSelectionIconForeground}; }`);
            }
            if (styles.listInactiveFocusBackground) {
                content.push(`.monaco-list${suffix} .monaco-list-row.focused { background-color:  ${styles.listInactiveFocusBackground}; }`);
                content.push(`.monaco-list${suffix} .monaco-list-row.focused:hover { background-color:  ${styles.listInactiveFocusBackground}; }`); // overwrite :hover style in this case!
            }
            if (styles.listInactiveSelectionBackground) {
                content.push(`.monaco-list${suffix} .monaco-list-row.selected { background-color:  ${styles.listInactiveSelectionBackground}; }`);
                content.push(`.monaco-list${suffix} .monaco-list-row.selected:hover { background-color:  ${styles.listInactiveSelectionBackground}; }`); // overwrite :hover style in this case!
            }
            if (styles.listInactiveSelectionForeground) {
                content.push(`.monaco-list${suffix} .monaco-list-row.selected { color: ${styles.listInactiveSelectionForeground}; }`);
            }
            if (styles.listHoverBackground) {
                content.push(`.monaco-list${suffix}:not(.drop-target):not(.dragging) .monaco-list-row:hover:not(.selected):not(.focused) { background-color: ${styles.listHoverBackground}; }`);
            }
            if (styles.listHoverForeground) {
                content.push(`.monaco-list${suffix}:not(.drop-target):not(.dragging) .monaco-list-row:hover:not(.selected):not(.focused) { color:  ${styles.listHoverForeground}; }`);
            }
            /**
             * Outlines
             */
            const focusAndSelectionOutline = (0, dom_1.$pP)(styles.listFocusAndSelectionOutline, (0, dom_1.$pP)(styles.listSelectionOutline, styles.listFocusOutline ?? ''));
            if (focusAndSelectionOutline) { // default: listFocusOutline
                content.push(`.monaco-list${suffix}:focus .monaco-list-row.focused.selected { outline: 1px solid ${focusAndSelectionOutline}; outline-offset: -1px;}`);
            }
            if (styles.listFocusOutline) { // default: set
                content.push(`
				.monaco-drag-image,
				.monaco-list${suffix}:focus .monaco-list-row.focused { outline: 1px solid ${styles.listFocusOutline}; outline-offset: -1px; }
				.monaco-workbench.context-menu-visible .monaco-list${suffix}.last-focused .monaco-list-row.focused { outline: 1px solid ${styles.listFocusOutline}; outline-offset: -1px; }
			`);
            }
            const inactiveFocusAndSelectionOutline = (0, dom_1.$pP)(styles.listSelectionOutline, styles.listInactiveFocusOutline ?? '');
            if (inactiveFocusAndSelectionOutline) {
                content.push(`.monaco-list${suffix} .monaco-list-row.focused.selected { outline: 1px dotted ${inactiveFocusAndSelectionOutline}; outline-offset: -1px; }`);
            }
            if (styles.listSelectionOutline) { // default: activeContrastBorder
                content.push(`.monaco-list${suffix} .monaco-list-row.selected { outline: 1px dotted ${styles.listSelectionOutline}; outline-offset: -1px; }`);
            }
            if (styles.listInactiveFocusOutline) { // default: null
                content.push(`.monaco-list${suffix} .monaco-list-row.focused { outline: 1px dotted ${styles.listInactiveFocusOutline}; outline-offset: -1px; }`);
            }
            if (styles.listHoverOutline) { // default: activeContrastBorder
                content.push(`.monaco-list${suffix} .monaco-list-row:hover { outline: 1px dashed ${styles.listHoverOutline}; outline-offset: -1px; }`);
            }
            if (styles.listDropBackground) {
                content.push(`
				.monaco-list${suffix}.drop-target,
				.monaco-list${suffix} .monaco-list-rows.drop-target,
				.monaco-list${suffix} .monaco-list-row.drop-target { background-color: ${styles.listDropBackground} !important; color: inherit !important; }
			`);
            }
            if (styles.tableColumnsBorder) {
                content.push(`
				.monaco-table > .monaco-split-view2,
				.monaco-table > .monaco-split-view2 .monaco-sash.vertical::before,
				.monaco-workbench:not(.reduce-motion) .monaco-table:hover > .monaco-split-view2,
				.monaco-workbench:not(.reduce-motion) .monaco-table:hover > .monaco-split-view2 .monaco-sash.vertical::before {
					border-color: ${styles.tableColumnsBorder};
				}

				.monaco-workbench:not(.reduce-motion) .monaco-table > .monaco-split-view2,
				.monaco-workbench:not(.reduce-motion) .monaco-table > .monaco-split-view2 .monaco-sash.vertical::before {
					border-color: transparent;
				}
			`);
            }
            if (styles.tableOddRowsBackgroundColor) {
                content.push(`
				.monaco-table .monaco-list-row[data-parity=odd]:not(.focused):not(.selected):not(:hover) .monaco-table-tr,
				.monaco-table .monaco-list:not(:focus) .monaco-list-row[data-parity=odd].focused:not(.selected):not(:hover) .monaco-table-tr,
				.monaco-table .monaco-list:not(.focused) .monaco-list-row[data-parity=odd].focused:not(.selected):not(:hover) .monaco-table-tr {
					background-color: ${styles.tableOddRowsBackgroundColor};
				}
			`);
            }
            this.c.textContent = content.join('\n');
        }
    }
    exports.$uQ = $uQ;
    exports.$vQ = {
        listFocusBackground: '#7FB0D0',
        listActiveSelectionBackground: '#0E639C',
        listActiveSelectionForeground: '#FFFFFF',
        listActiveSelectionIconForeground: '#FFFFFF',
        listFocusAndSelectionOutline: '#90C2F9',
        listFocusAndSelectionBackground: '#094771',
        listFocusAndSelectionForeground: '#FFFFFF',
        listInactiveSelectionBackground: '#3F3F46',
        listInactiveSelectionIconForeground: '#FFFFFF',
        listHoverBackground: '#2A2D2E',
        listDropBackground: '#383B3D',
        treeIndentGuidesStroke: '#a9a9a9',
        treeInactiveIndentGuidesStroke: color_1.$Os.fromHex('#a9a9a9').transparent(0.4).toString(),
        tableColumnsBorder: color_1.$Os.fromHex('#cccccc').transparent(0.2).toString(),
        tableOddRowsBackgroundColor: color_1.$Os.fromHex('#cccccc').transparent(0.04).toString(),
        listBackground: undefined,
        listFocusForeground: undefined,
        listInactiveSelectionForeground: undefined,
        listInactiveFocusForeground: undefined,
        listInactiveFocusBackground: undefined,
        listHoverForeground: undefined,
        listFocusOutline: undefined,
        listInactiveFocusOutline: undefined,
        listSelectionOutline: undefined,
        listHoverOutline: undefined
    };
    const DefaultOptions = {
        keyboardSupport: true,
        mouseSupport: true,
        multipleSelectionSupport: true,
        dnd: {
            getDragURI() { return null; },
            onDragStart() { },
            onDragOver() { return false; },
            drop() { }
        }
    };
    // TODO@Joao: move these utils into a SortedArray class
    function getContiguousRangeContaining(range, value) {
        const index = range.indexOf(value);
        if (index === -1) {
            return [];
        }
        const result = [];
        let i = index - 1;
        while (i >= 0 && range[i] === value - (index - i)) {
            result.push(range[i--]);
        }
        result.reverse();
        i = index;
        while (i < range.length && range[i] === value + (i - index)) {
            result.push(range[i++]);
        }
        return result;
    }
    /**
     * Given two sorted collections of numbers, returns the intersection
     * between them (OR).
     */
    function disjunction(one, other) {
        const result = [];
        let i = 0, j = 0;
        while (i < one.length || j < other.length) {
            if (i >= one.length) {
                result.push(other[j++]);
            }
            else if (j >= other.length) {
                result.push(one[i++]);
            }
            else if (one[i] === other[j]) {
                result.push(one[i]);
                i++;
                j++;
                continue;
            }
            else if (one[i] < other[j]) {
                result.push(one[i++]);
            }
            else {
                result.push(other[j++]);
            }
        }
        return result;
    }
    /**
     * Given two sorted collections of numbers, returns the relative
     * complement between them (XOR).
     */
    function relativeComplement(one, other) {
        const result = [];
        let i = 0, j = 0;
        while (i < one.length || j < other.length) {
            if (i >= one.length) {
                result.push(other[j++]);
            }
            else if (j >= other.length) {
                result.push(one[i++]);
            }
            else if (one[i] === other[j]) {
                i++;
                j++;
                continue;
            }
            else if (one[i] < other[j]) {
                result.push(one[i++]);
            }
            else {
                j++;
            }
        }
        return result;
    }
    const numericSort = (a, b) => a - b;
    class PipelineRenderer {
        constructor(c, d) {
            this.c = c;
            this.d = d;
        }
        get templateId() {
            return this.c;
        }
        renderTemplate(container) {
            return this.d.map(r => r.renderTemplate(container));
        }
        renderElement(element, index, templateData, height) {
            let i = 0;
            for (const renderer of this.d) {
                renderer.renderElement(element, index, templateData[i++], height);
            }
        }
        disposeElement(element, index, templateData, height) {
            let i = 0;
            for (const renderer of this.d) {
                renderer.disposeElement?.(element, index, templateData[i], height);
                i += 1;
            }
        }
        disposeTemplate(templateData) {
            let i = 0;
            for (const renderer of this.d) {
                renderer.disposeTemplate(templateData[i++]);
            }
        }
    }
    class AccessibiltyRenderer {
        constructor(c) {
            this.c = c;
            this.templateId = 'a18n';
        }
        renderTemplate(container) {
            return container;
        }
        renderElement(element, index, container) {
            const ariaLabel = this.c.getAriaLabel(element);
            if (ariaLabel) {
                container.setAttribute('aria-label', ariaLabel);
            }
            else {
                container.removeAttribute('aria-label');
            }
            const ariaLevel = this.c.getAriaLevel && this.c.getAriaLevel(element);
            if (typeof ariaLevel === 'number') {
                container.setAttribute('aria-level', `${ariaLevel}`);
            }
            else {
                container.removeAttribute('aria-level');
            }
        }
        disposeTemplate(templateData) {
            // noop
        }
    }
    class ListViewDragAndDrop {
        constructor(c, d) {
            this.c = c;
            this.d = d;
        }
        getDragElements(element) {
            const selection = this.c.getSelectedElements();
            const elements = selection.indexOf(element) > -1 ? selection : [element];
            return elements;
        }
        getDragURI(element) {
            return this.d.getDragURI(element);
        }
        getDragLabel(elements, originalEvent) {
            if (this.d.getDragLabel) {
                return this.d.getDragLabel(elements, originalEvent);
            }
            return undefined;
        }
        onDragStart(data, originalEvent) {
            this.d.onDragStart?.(data, originalEvent);
        }
        onDragOver(data, targetElement, targetIndex, originalEvent) {
            return this.d.onDragOver(data, targetElement, targetIndex, originalEvent);
        }
        onDragLeave(data, targetElement, targetIndex, originalEvent) {
            this.d.onDragLeave?.(data, targetElement, targetIndex, originalEvent);
        }
        onDragEnd(originalEvent) {
            this.d.onDragEnd?.(originalEvent);
        }
        drop(data, targetElement, targetIndex, originalEvent) {
            this.d.drop(data, targetElement, targetIndex, originalEvent);
        }
    }
    /**
     * The {@link $wQ} is a virtual scrolling widget, built on top of the {@link $mQ}
     * widget.
     *
     * Features:
     * - Customizable keyboard and mouse support
     * - Element traits: focus, selection, achor
     * - Accessibility support
     * - Touch support
     * - Performant template-based rendering
     * - Horizontal scrolling
     * - Variable element height support
     * - Dynamic element height support
     * - Drag-and-drop support
     */
    class $wQ {
        get onDidChangeFocus() {
            return event_2.Event.map(this.g.wrapEvent(this.c.onChange), e => this.G(e), this.y);
        }
        get onDidChangeSelection() {
            return event_2.Event.map(this.g.wrapEvent(this.d.onChange), e => this.G(e), this.y);
        }
        get domId() { return this.k.domId; }
        get onDidScroll() { return this.k.onDidScroll; }
        get onMouseClick() { return this.k.onMouseClick; }
        get onMouseDblClick() { return this.k.onMouseDblClick; }
        get onMouseMiddleClick() { return this.k.onMouseMiddleClick; }
        get onPointer() { return this.w.onPointer; }
        get onMouseUp() { return this.k.onMouseUp; }
        get onMouseDown() { return this.k.onMouseDown; }
        get onMouseOver() { return this.k.onMouseOver; }
        get onMouseMove() { return this.k.onMouseMove; }
        get onMouseOut() { return this.k.onMouseOut; }
        get onTouchStart() { return this.k.onTouchStart; }
        get onTap() { return this.k.onTap; }
        /**
         * Possible context menu trigger events:
         * - ContextMenu key
         * - Shift F10
         * - Ctrl Option Shift M (macOS with VoiceOver)
         * - Mouse right click
         */
        get onContextMenu() {
            let didJustPressContextMenuKey = false;
            const fromKeyDown = event_2.Event.chain(this.y.add(new event_1.$9P(this.k.domNode, 'keydown')).event, $ => $.map(e => new keyboardEvent_1.$jO(e))
                .filter(e => didJustPressContextMenuKey = e.keyCode === 58 /* KeyCode.ContextMenu */ || (e.shiftKey && e.keyCode === 68 /* KeyCode.F10 */))
                .map(e => dom_1.$5O.stop(e, true))
                .filter(() => false));
            const fromKeyUp = event_2.Event.chain(this.y.add(new event_1.$9P(this.k.domNode, 'keyup')).event, $ => $.forEach(() => didJustPressContextMenuKey = false)
                .map(e => new keyboardEvent_1.$jO(e))
                .filter(e => e.keyCode === 58 /* KeyCode.ContextMenu */ || (e.shiftKey && e.keyCode === 68 /* KeyCode.F10 */))
                .map(e => dom_1.$5O.stop(e, true))
                .map(({ browserEvent }) => {
                const focus = this.getFocus();
                const index = focus.length ? focus[0] : undefined;
                const element = typeof index !== 'undefined' ? this.k.element(index) : undefined;
                const anchor = typeof index !== 'undefined' ? this.k.domElement(index) : this.k.domNode;
                return { index, element, anchor, browserEvent };
            }));
            const fromMouse = event_2.Event.chain(this.k.onContextMenu, $ => $.filter(_ => !didJustPressContextMenuKey)
                .map(({ element, index, browserEvent }) => ({ element, index, anchor: new mouseEvent_1.$eO(browserEvent), browserEvent })));
            return event_2.Event.any(fromKeyDown, fromKeyUp, fromMouse);
        }
        get onKeyDown() { return this.y.add(new event_1.$9P(this.k.domNode, 'keydown')).event; }
        get onKeyUp() { return this.y.add(new event_1.$9P(this.k.domNode, 'keyup')).event; }
        get onKeyPress() { return this.y.add(new event_1.$9P(this.k.domNode, 'keypress')).event; }
        get onDidFocus() { return event_2.Event.signal(this.y.add(new event_1.$9P(this.k.domNode, 'focus', true)).event); }
        get onDidBlur() { return event_2.Event.signal(this.y.add(new event_1.$9P(this.k.domNode, 'blur', true)).event); }
        constructor(A, container, virtualDelegate, renderers, B = DefaultOptions) {
            this.A = A;
            this.B = B;
            this.c = new Trait('focused');
            this.f = new Trait('anchor');
            this.g = new event_2.$nd();
            this.x = '';
            this.y = new lifecycle_1.$jc();
            this.z = new event_2.$fd();
            this.onDidDispose = this.z.event;
            const role = this.B.accessibilityProvider && this.B.accessibilityProvider.getWidgetRole ? this.B.accessibilityProvider?.getWidgetRole() : 'list';
            this.d = new SelectionTrait(role !== 'listbox');
            const baseRenderers = [this.c.renderer, this.d.renderer];
            this.u = B.accessibilityProvider;
            if (this.u) {
                baseRenderers.push(new AccessibiltyRenderer(this.u));
                this.u.onDidChangeActiveDescendant?.(this.I, this, this.y);
            }
            renderers = renderers.map(r => new PipelineRenderer(r.templateId, [...baseRenderers, r]));
            const viewOptions = {
                ...B,
                dnd: B.dnd && new ListViewDragAndDrop(this, B.dnd)
            };
            this.k = this.C(container, virtualDelegate, renderers, viewOptions);
            this.k.domNode.setAttribute('role', role);
            if (B.styleController) {
                this.q = B.styleController(this.k.domId);
            }
            else {
                const styleElement = (0, dom_1.$XO)(this.k.domNode);
                this.q = new $uQ(styleElement, this.k.domId);
            }
            this.o = new splice_1.$aQ([
                new TraitSpliceable(this.c, this.k, B.identityProvider),
                new TraitSpliceable(this.d, this.k, B.identityProvider),
                new TraitSpliceable(this.f, this.k, B.identityProvider),
                this.k
            ]);
            this.y.add(this.c);
            this.y.add(this.d);
            this.y.add(this.f);
            this.y.add(this.k);
            this.y.add(this.z);
            this.y.add(new DOMFocusController(this, this.k));
            if (typeof B.keyboardSupport !== 'boolean' || B.keyboardSupport) {
                this.v = new KeyboardController(this, this.k, B);
                this.y.add(this.v);
            }
            if (B.keyboardNavigationLabelProvider) {
                const delegate = B.keyboardNavigationDelegate || exports.$qQ;
                this.t = new TypeNavigationController(this, this.k, B.keyboardNavigationLabelProvider, B.keyboardNavigationEventFilter ?? (() => true), delegate);
                this.y.add(this.t);
            }
            this.w = this.D(B);
            this.y.add(this.w);
            this.onDidChangeFocus(this.H, this, this.y);
            this.onDidChangeSelection(this.J, this, this.y);
            if (this.u) {
                this.ariaLabel = this.u.getWidgetAriaLabel();
            }
            if (this.B.multipleSelectionSupport !== false) {
                this.k.domNode.setAttribute('aria-multiselectable', 'true');
            }
        }
        C(container, virtualDelegate, renderers, viewOptions) {
            return new listView_1.$mQ(container, virtualDelegate, renderers, viewOptions);
        }
        D(options) {
            return new $tQ(this);
        }
        updateOptions(optionsUpdate = {}) {
            this.B = { ...this.B, ...optionsUpdate };
            this.t?.updateOptions(this.B);
            if (this.B.multipleSelectionController !== undefined) {
                if (this.B.multipleSelectionSupport) {
                    this.k.domNode.setAttribute('aria-multiselectable', 'true');
                }
                else {
                    this.k.domNode.removeAttribute('aria-multiselectable');
                }
            }
            this.w.updateOptions(optionsUpdate);
            this.v?.updateOptions(optionsUpdate);
            this.k.updateOptions(optionsUpdate);
        }
        get options() {
            return this.B;
        }
        splice(start, deleteCount, elements = []) {
            if (start < 0 || start > this.k.length) {
                throw new list_1.$cQ(this.A, `Invalid start index: ${start}`);
            }
            if (deleteCount < 0) {
                throw new list_1.$cQ(this.A, `Invalid delete count: ${deleteCount}`);
            }
            if (deleteCount === 0 && elements.length === 0) {
                return;
            }
            this.g.bufferEvents(() => this.o.splice(start, deleteCount, elements));
        }
        updateWidth(index) {
            this.k.updateWidth(index);
        }
        updateElementHeight(index, size) {
            this.k.updateElementHeight(index, size, null);
        }
        rerender() {
            this.k.rerender();
        }
        element(index) {
            return this.k.element(index);
        }
        indexOf(element) {
            return this.k.indexOf(element);
        }
        get length() {
            return this.k.length;
        }
        get contentHeight() {
            return this.k.contentHeight;
        }
        get contentWidth() {
            return this.k.contentWidth;
        }
        get onDidChangeContentHeight() {
            return this.k.onDidChangeContentHeight;
        }
        get onDidChangeContentWidth() {
            return this.k.onDidChangeContentWidth;
        }
        get scrollTop() {
            return this.k.getScrollTop();
        }
        set scrollTop(scrollTop) {
            this.k.setScrollTop(scrollTop);
        }
        get scrollLeft() {
            return this.k.getScrollLeft();
        }
        set scrollLeft(scrollLeft) {
            this.k.setScrollLeft(scrollLeft);
        }
        get scrollHeight() {
            return this.k.scrollHeight;
        }
        get renderHeight() {
            return this.k.renderHeight;
        }
        get firstVisibleIndex() {
            return this.k.firstVisibleIndex;
        }
        get lastVisibleIndex() {
            return this.k.lastVisibleIndex;
        }
        get ariaLabel() {
            return this.x;
        }
        set ariaLabel(value) {
            this.x = value;
            this.k.domNode.setAttribute('aria-label', value);
        }
        domFocus() {
            this.k.domNode.focus({ preventScroll: true });
        }
        layout(height, width) {
            this.k.layout(height, width);
        }
        triggerTypeNavigation() {
            this.t?.trigger();
        }
        setSelection(indexes, browserEvent) {
            for (const index of indexes) {
                if (index < 0 || index >= this.length) {
                    throw new list_1.$cQ(this.A, `Invalid index ${index}`);
                }
            }
            this.d.set(indexes, browserEvent);
        }
        getSelection() {
            return this.d.get();
        }
        getSelectedElements() {
            return this.getSelection().map(i => this.k.element(i));
        }
        setAnchor(index) {
            if (typeof index === 'undefined') {
                this.f.set([]);
                return;
            }
            if (index < 0 || index >= this.length) {
                throw new list_1.$cQ(this.A, `Invalid index ${index}`);
            }
            this.f.set([index]);
        }
        getAnchor() {
            return (0, arrays_1.$Mb)(this.f.get(), undefined);
        }
        getAnchorElement() {
            const anchor = this.getAnchor();
            return typeof anchor === 'undefined' ? undefined : this.element(anchor);
        }
        setFocus(indexes, browserEvent) {
            for (const index of indexes) {
                if (index < 0 || index >= this.length) {
                    throw new list_1.$cQ(this.A, `Invalid index ${index}`);
                }
            }
            this.c.set(indexes, browserEvent);
        }
        focusNext(n = 1, loop = false, browserEvent, filter) {
            if (this.length === 0) {
                return;
            }
            const focus = this.c.get();
            const index = this.E(focus.length > 0 ? focus[0] + n : 0, loop, filter);
            if (index > -1) {
                this.setFocus([index], browserEvent);
            }
        }
        focusPrevious(n = 1, loop = false, browserEvent, filter) {
            if (this.length === 0) {
                return;
            }
            const focus = this.c.get();
            const index = this.F(focus.length > 0 ? focus[0] - n : 0, loop, filter);
            if (index > -1) {
                this.setFocus([index], browserEvent);
            }
        }
        async focusNextPage(browserEvent, filter) {
            let lastPageIndex = this.k.indexAt(this.k.getScrollTop() + this.k.renderHeight);
            lastPageIndex = lastPageIndex === 0 ? 0 : lastPageIndex - 1;
            const currentlyFocusedElementIndex = this.getFocus()[0];
            if (currentlyFocusedElementIndex !== lastPageIndex && (currentlyFocusedElementIndex === undefined || lastPageIndex > currentlyFocusedElementIndex)) {
                const lastGoodPageIndex = this.F(lastPageIndex, false, filter);
                if (lastGoodPageIndex > -1 && currentlyFocusedElementIndex !== lastGoodPageIndex) {
                    this.setFocus([lastGoodPageIndex], browserEvent);
                }
                else {
                    this.setFocus([lastPageIndex], browserEvent);
                }
            }
            else {
                const previousScrollTop = this.k.getScrollTop();
                let nextpageScrollTop = previousScrollTop + this.k.renderHeight;
                if (lastPageIndex > currentlyFocusedElementIndex) {
                    // scroll last page element to the top only if the last page element is below the focused element
                    nextpageScrollTop -= this.k.elementHeight(lastPageIndex);
                }
                this.k.setScrollTop(nextpageScrollTop);
                if (this.k.getScrollTop() !== previousScrollTop) {
                    this.setFocus([]);
                    // Let the scroll event listener run
                    await (0, async_1.$Hg)(0);
                    await this.focusNextPage(browserEvent, filter);
                }
            }
        }
        async focusPreviousPage(browserEvent, filter) {
            let firstPageIndex;
            const scrollTop = this.k.getScrollTop();
            if (scrollTop === 0) {
                firstPageIndex = this.k.indexAt(scrollTop);
            }
            else {
                firstPageIndex = this.k.indexAfter(scrollTop - 1);
            }
            const currentlyFocusedElementIndex = this.getFocus()[0];
            if (currentlyFocusedElementIndex !== firstPageIndex && (currentlyFocusedElementIndex === undefined || currentlyFocusedElementIndex >= firstPageIndex)) {
                const firstGoodPageIndex = this.E(firstPageIndex, false, filter);
                if (firstGoodPageIndex > -1 && currentlyFocusedElementIndex !== firstGoodPageIndex) {
                    this.setFocus([firstGoodPageIndex], browserEvent);
                }
                else {
                    this.setFocus([firstPageIndex], browserEvent);
                }
            }
            else {
                const previousScrollTop = scrollTop;
                this.k.setScrollTop(scrollTop - this.k.renderHeight);
                if (this.k.getScrollTop() !== previousScrollTop) {
                    this.setFocus([]);
                    // Let the scroll event listener run
                    await (0, async_1.$Hg)(0);
                    await this.focusPreviousPage(browserEvent, filter);
                }
            }
        }
        focusLast(browserEvent, filter) {
            if (this.length === 0) {
                return;
            }
            const index = this.F(this.length - 1, false, filter);
            if (index > -1) {
                this.setFocus([index], browserEvent);
            }
        }
        focusFirst(browserEvent, filter) {
            this.focusNth(0, browserEvent, filter);
        }
        focusNth(n, browserEvent, filter) {
            if (this.length === 0) {
                return;
            }
            const index = this.E(n, false, filter);
            if (index > -1) {
                this.setFocus([index], browserEvent);
            }
        }
        E(index, loop = false, filter) {
            for (let i = 0; i < this.length; i++) {
                if (index >= this.length && !loop) {
                    return -1;
                }
                index = index % this.length;
                if (!filter || filter(this.element(index))) {
                    return index;
                }
                index++;
            }
            return -1;
        }
        F(index, loop = false, filter) {
            for (let i = 0; i < this.length; i++) {
                if (index < 0 && !loop) {
                    return -1;
                }
                index = (this.length + (index % this.length)) % this.length;
                if (!filter || filter(this.element(index))) {
                    return index;
                }
                index--;
            }
            return -1;
        }
        getFocus() {
            return this.c.get();
        }
        getFocusedElements() {
            return this.getFocus().map(i => this.k.element(i));
        }
        reveal(index, relativeTop) {
            if (index < 0 || index >= this.length) {
                throw new list_1.$cQ(this.A, `Invalid index ${index}`);
            }
            const scrollTop = this.k.getScrollTop();
            const elementTop = this.k.elementTop(index);
            const elementHeight = this.k.elementHeight(index);
            if ((0, types_1.$nf)(relativeTop)) {
                // y = mx + b
                const m = elementHeight - this.k.renderHeight;
                this.k.setScrollTop(m * (0, numbers_1.$Hl)(relativeTop, 0, 1) + elementTop);
            }
            else {
                const viewItemBottom = elementTop + elementHeight;
                const scrollBottom = scrollTop + this.k.renderHeight;
                if (elementTop < scrollTop && viewItemBottom >= scrollBottom) {
                    // The element is already overflowing the viewport, no-op
                }
                else if (elementTop < scrollTop || (viewItemBottom >= scrollBottom && elementHeight >= this.k.renderHeight)) {
                    this.k.setScrollTop(elementTop);
                }
                else if (viewItemBottom >= scrollBottom) {
                    this.k.setScrollTop(viewItemBottom - this.k.renderHeight);
                }
            }
        }
        /**
         * Returns the relative position of an element rendered in the list.
         * Returns `null` if the element isn't *entirely* in the visible viewport.
         */
        getRelativeTop(index) {
            if (index < 0 || index >= this.length) {
                throw new list_1.$cQ(this.A, `Invalid index ${index}`);
            }
            const scrollTop = this.k.getScrollTop();
            const elementTop = this.k.elementTop(index);
            const elementHeight = this.k.elementHeight(index);
            if (elementTop < scrollTop || elementTop + elementHeight > scrollTop + this.k.renderHeight) {
                return null;
            }
            // y = mx + b
            const m = elementHeight - this.k.renderHeight;
            return Math.abs((scrollTop - elementTop) / m);
        }
        isDOMFocused() {
            return this.k.domNode === document.activeElement;
        }
        getHTMLElement() {
            return this.k.domNode;
        }
        getElementID(index) {
            return this.k.getElementDomId(index);
        }
        style(styles) {
            this.q.style(styles);
        }
        G({ indexes, browserEvent }) {
            return { indexes, elements: indexes.map(i => this.k.element(i)), browserEvent };
        }
        H() {
            const focus = this.c.get();
            this.k.domNode.classList.toggle('element-focused', focus.length > 0);
            this.I();
        }
        I() {
            const focus = this.c.get();
            if (focus.length > 0) {
                let id;
                if (this.u?.getActiveDescendantId) {
                    id = this.u.getActiveDescendantId(this.k.element(focus[0]));
                }
                this.k.domNode.setAttribute('aria-activedescendant', id || this.k.getElementDomId(focus[0]));
            }
            else {
                this.k.domNode.removeAttribute('aria-activedescendant');
            }
        }
        J() {
            const selection = this.d.get();
            this.k.domNode.classList.toggle('selection-none', selection.length === 0);
            this.k.domNode.classList.toggle('selection-single', selection.length === 1);
            this.k.domNode.classList.toggle('selection-multiple', selection.length > 1);
        }
        dispose() {
            this.z.fire();
            this.y.dispose();
            this.z.dispose();
        }
    }
    exports.$wQ = $wQ;
    __decorate([
        decorators_1.$6g
    ], $wQ.prototype, "onDidChangeFocus", null);
    __decorate([
        decorators_1.$6g
    ], $wQ.prototype, "onDidChangeSelection", null);
    __decorate([
        decorators_1.$6g
    ], $wQ.prototype, "onContextMenu", null);
    __decorate([
        decorators_1.$6g
    ], $wQ.prototype, "onKeyDown", null);
    __decorate([
        decorators_1.$6g
    ], $wQ.prototype, "onKeyUp", null);
    __decorate([
        decorators_1.$6g
    ], $wQ.prototype, "onKeyPress", null);
    __decorate([
        decorators_1.$6g
    ], $wQ.prototype, "onDidFocus", null);
    __decorate([
        decorators_1.$6g
    ], $wQ.prototype, "onDidBlur", null);
});
//# sourceMappingURL=listWidget.js.map