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
    exports.List = exports.unthemedListStyles = exports.DefaultStyleController = exports.MouseController = exports.isSelectionRangeChangeEvent = exports.isSelectionSingleChangeEvent = exports.DefaultKeyboardNavigationDelegate = exports.TypeNavigationMode = exports.isButton = exports.isMonacoEditor = exports.isInputElement = void 0;
    class TraitRenderer {
        constructor(trait) {
            this.trait = trait;
            this.renderedElements = [];
        }
        get templateId() {
            return `template:${this.trait.name}`;
        }
        renderTemplate(container) {
            return container;
        }
        renderElement(element, index, templateData) {
            const renderedElementIndex = this.renderedElements.findIndex(el => el.templateData === templateData);
            if (renderedElementIndex >= 0) {
                const rendered = this.renderedElements[renderedElementIndex];
                this.trait.unrender(templateData);
                rendered.index = index;
            }
            else {
                const rendered = { index, templateData };
                this.renderedElements.push(rendered);
            }
            this.trait.renderIndex(index, templateData);
        }
        splice(start, deleteCount, insertCount) {
            const rendered = [];
            for (const renderedElement of this.renderedElements) {
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
            this.renderedElements = rendered;
        }
        renderIndexes(indexes) {
            for (const { index, templateData } of this.renderedElements) {
                if (indexes.indexOf(index) > -1) {
                    this.trait.renderIndex(index, templateData);
                }
            }
        }
        disposeTemplate(templateData) {
            const index = this.renderedElements.findIndex(el => el.templateData === templateData);
            if (index < 0) {
                return;
            }
            this.renderedElements.splice(index, 1);
        }
    }
    class Trait {
        get name() { return this._trait; }
        get renderer() {
            return new TraitRenderer(this);
        }
        constructor(_trait) {
            this._trait = _trait;
            this.length = 0;
            this.indexes = [];
            this.sortedIndexes = [];
            this._onChange = new event_2.Emitter();
            this.onChange = this._onChange.event;
        }
        splice(start, deleteCount, elements) {
            deleteCount = Math.max(0, Math.min(deleteCount, this.length - start));
            const diff = elements.length - deleteCount;
            const end = start + deleteCount;
            const sortedIndexes = [];
            let i = 0;
            while (i < this.sortedIndexes.length && this.sortedIndexes[i] < start) {
                sortedIndexes.push(this.sortedIndexes[i++]);
            }
            for (let j = 0; j < elements.length; j++) {
                if (elements[j]) {
                    sortedIndexes.push(j + start);
                }
            }
            while (i < this.sortedIndexes.length && this.sortedIndexes[i] >= end) {
                sortedIndexes.push(this.sortedIndexes[i++] + diff);
            }
            const length = this.length + diff;
            if (this.sortedIndexes.length > 0 && sortedIndexes.length === 0 && length > 0) {
                const first = this.sortedIndexes.find(index => index >= start) ?? length - 1;
                sortedIndexes.push(Math.min(first, length - 1));
            }
            this.renderer.splice(start, deleteCount, elements.length);
            this._set(sortedIndexes, sortedIndexes);
            this.length = length;
        }
        renderIndex(index, container) {
            container.classList.toggle(this._trait, this.contains(index));
        }
        unrender(container) {
            container.classList.remove(this._trait);
        }
        /**
         * Sets the indexes which should have this trait.
         *
         * @param indexes Indexes which should have this trait.
         * @return The old indexes which had this trait.
         */
        set(indexes, browserEvent) {
            return this._set(indexes, [...indexes].sort(numericSort), browserEvent);
        }
        _set(indexes, sortedIndexes, browserEvent) {
            const result = this.indexes;
            const sortedResult = this.sortedIndexes;
            this.indexes = indexes;
            this.sortedIndexes = sortedIndexes;
            const toRender = disjunction(sortedResult, indexes);
            this.renderer.renderIndexes(toRender);
            this._onChange.fire({ indexes, browserEvent });
            return result;
        }
        get() {
            return this.indexes;
        }
        contains(index) {
            return (0, arrays_1.binarySearch)(this.sortedIndexes, index, numericSort) >= 0;
        }
        dispose() {
            (0, lifecycle_1.dispose)(this._onChange);
        }
    }
    __decorate([
        decorators_1.memoize
    ], Trait.prototype, "renderer", null);
    class SelectionTrait extends Trait {
        constructor(setAriaSelected) {
            super('selected');
            this.setAriaSelected = setAriaSelected;
        }
        renderIndex(index, container) {
            super.renderIndex(index, container);
            if (this.setAriaSelected) {
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
        constructor(trait, view, identityProvider) {
            this.trait = trait;
            this.view = view;
            this.identityProvider = identityProvider;
        }
        splice(start, deleteCount, elements) {
            if (!this.identityProvider) {
                return this.trait.splice(start, deleteCount, new Array(elements.length).fill(false));
            }
            const pastElementsWithTrait = this.trait.get().map(i => this.identityProvider.getId(this.view.element(i)).toString());
            if (pastElementsWithTrait.length === 0) {
                return this.trait.splice(start, deleteCount, new Array(elements.length).fill(false));
            }
            const pastElementsWithTraitSet = new Set(pastElementsWithTrait);
            const elementsWithTrait = elements.map(e => pastElementsWithTraitSet.has(this.identityProvider.getId(e).toString()));
            this.trait.splice(start, deleteCount, elementsWithTrait);
        }
    }
    function isInputElement(e) {
        return e.tagName === 'INPUT' || e.tagName === 'TEXTAREA';
    }
    exports.isInputElement = isInputElement;
    function isMonacoEditor(e) {
        if (e.classList.contains('monaco-editor')) {
            return true;
        }
        if (e.classList.contains('monaco-list')) {
            return false;
        }
        if (!e.parentElement) {
            return false;
        }
        return isMonacoEditor(e.parentElement);
    }
    exports.isMonacoEditor = isMonacoEditor;
    function isButton(e) {
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
        return isButton(e.parentElement);
    }
    exports.isButton = isButton;
    class KeyboardController {
        get onKeyDown() {
            return event_2.Event.chain(this.disposables.add(new event_1.DomEmitter(this.view.domNode, 'keydown')).event, $ => $.filter(e => !isInputElement(e.target))
                .map(e => new keyboardEvent_1.StandardKeyboardEvent(e)));
        }
        constructor(list, view, options) {
            this.list = list;
            this.view = view;
            this.disposables = new lifecycle_1.DisposableStore();
            this.multipleSelectionDisposables = new lifecycle_1.DisposableStore();
            this.multipleSelectionSupport = options.multipleSelectionSupport;
            this.disposables.add(this.onKeyDown(e => {
                switch (e.keyCode) {
                    case 3 /* KeyCode.Enter */:
                        return this.onEnter(e);
                    case 16 /* KeyCode.UpArrow */:
                        return this.onUpArrow(e);
                    case 18 /* KeyCode.DownArrow */:
                        return this.onDownArrow(e);
                    case 11 /* KeyCode.PageUp */:
                        return this.onPageUpArrow(e);
                    case 12 /* KeyCode.PageDown */:
                        return this.onPageDownArrow(e);
                    case 9 /* KeyCode.Escape */:
                        return this.onEscape(e);
                    case 31 /* KeyCode.KeyA */:
                        if (this.multipleSelectionSupport && (platform.isMacintosh ? e.metaKey : e.ctrlKey)) {
                            this.onCtrlA(e);
                        }
                }
            }));
        }
        updateOptions(optionsUpdate) {
            if (optionsUpdate.multipleSelectionSupport !== undefined) {
                this.multipleSelectionSupport = optionsUpdate.multipleSelectionSupport;
            }
        }
        onEnter(e) {
            e.preventDefault();
            e.stopPropagation();
            this.list.setSelection(this.list.getFocus(), e.browserEvent);
        }
        onUpArrow(e) {
            e.preventDefault();
            e.stopPropagation();
            this.list.focusPrevious(1, false, e.browserEvent);
            const el = this.list.getFocus()[0];
            this.list.setAnchor(el);
            this.list.reveal(el);
            this.view.domNode.focus();
        }
        onDownArrow(e) {
            e.preventDefault();
            e.stopPropagation();
            this.list.focusNext(1, false, e.browserEvent);
            const el = this.list.getFocus()[0];
            this.list.setAnchor(el);
            this.list.reveal(el);
            this.view.domNode.focus();
        }
        onPageUpArrow(e) {
            e.preventDefault();
            e.stopPropagation();
            this.list.focusPreviousPage(e.browserEvent);
            const el = this.list.getFocus()[0];
            this.list.setAnchor(el);
            this.list.reveal(el);
            this.view.domNode.focus();
        }
        onPageDownArrow(e) {
            e.preventDefault();
            e.stopPropagation();
            this.list.focusNextPage(e.browserEvent);
            const el = this.list.getFocus()[0];
            this.list.setAnchor(el);
            this.list.reveal(el);
            this.view.domNode.focus();
        }
        onCtrlA(e) {
            e.preventDefault();
            e.stopPropagation();
            this.list.setSelection((0, arrays_1.range)(this.list.length), e.browserEvent);
            this.list.setAnchor(undefined);
            this.view.domNode.focus();
        }
        onEscape(e) {
            if (this.list.getSelection().length) {
                e.preventDefault();
                e.stopPropagation();
                this.list.setSelection([], e.browserEvent);
                this.list.setAnchor(undefined);
                this.view.domNode.focus();
            }
        }
        dispose() {
            this.disposables.dispose();
            this.multipleSelectionDisposables.dispose();
        }
    }
    __decorate([
        decorators_1.memoize
    ], KeyboardController.prototype, "onKeyDown", null);
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
    exports.DefaultKeyboardNavigationDelegate = new class {
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
        constructor(list, view, keyboardNavigationLabelProvider, keyboardNavigationEventFilter, delegate) {
            this.list = list;
            this.view = view;
            this.keyboardNavigationLabelProvider = keyboardNavigationLabelProvider;
            this.keyboardNavigationEventFilter = keyboardNavigationEventFilter;
            this.delegate = delegate;
            this.enabled = false;
            this.state = TypeNavigationControllerState.Idle;
            this.mode = TypeNavigationMode.Automatic;
            this.triggered = false;
            this.previouslyFocused = -1;
            this.enabledDisposables = new lifecycle_1.DisposableStore();
            this.disposables = new lifecycle_1.DisposableStore();
            this.updateOptions(list.options);
        }
        updateOptions(options) {
            if (options.typeNavigationEnabled ?? true) {
                this.enable();
            }
            else {
                this.disable();
            }
            this.mode = options.typeNavigationMode ?? TypeNavigationMode.Automatic;
        }
        trigger() {
            this.triggered = !this.triggered;
        }
        enable() {
            if (this.enabled) {
                return;
            }
            let typing = false;
            const onChar = event_2.Event.chain(this.enabledDisposables.add(new event_1.DomEmitter(this.view.domNode, 'keydown')).event, $ => $.filter(e => !isInputElement(e.target))
                .filter(() => this.mode === TypeNavigationMode.Automatic || this.triggered)
                .map(event => new keyboardEvent_1.StandardKeyboardEvent(event))
                .filter(e => typing || this.keyboardNavigationEventFilter(e))
                .filter(e => this.delegate.mightProducePrintableCharacter(e))
                .forEach(e => dom_1.EventHelper.stop(e, true))
                .map(event => event.browserEvent.key));
            const onClear = event_2.Event.debounce(onChar, () => null, 800, undefined, undefined, undefined, this.enabledDisposables);
            const onInput = event_2.Event.reduce(event_2.Event.any(onChar, onClear), (r, i) => i === null ? null : ((r || '') + i), undefined, this.enabledDisposables);
            onInput(this.onInput, this, this.enabledDisposables);
            onClear(this.onClear, this, this.enabledDisposables);
            onChar(() => typing = true, undefined, this.enabledDisposables);
            onClear(() => typing = false, undefined, this.enabledDisposables);
            this.enabled = true;
            this.triggered = false;
        }
        disable() {
            if (!this.enabled) {
                return;
            }
            this.enabledDisposables.clear();
            this.enabled = false;
            this.triggered = false;
        }
        onClear() {
            const focus = this.list.getFocus();
            if (focus.length > 0 && focus[0] === this.previouslyFocused) {
                // List: re-announce element on typing end since typed keys will interrupt aria label of focused element
                // Do not announce if there was a focus change at the end to prevent duplication https://github.com/microsoft/vscode/issues/95961
                const ariaLabel = this.list.options.accessibilityProvider?.getAriaLabel(this.list.element(focus[0]));
                if (ariaLabel) {
                    (0, aria_1.alert)(ariaLabel);
                }
            }
            this.previouslyFocused = -1;
        }
        onInput(word) {
            if (!word) {
                this.state = TypeNavigationControllerState.Idle;
                this.triggered = false;
                return;
            }
            const focus = this.list.getFocus();
            const start = focus.length > 0 ? focus[0] : 0;
            const delta = this.state === TypeNavigationControllerState.Idle ? 1 : 0;
            this.state = TypeNavigationControllerState.Typing;
            for (let i = 0; i < this.list.length; i++) {
                const index = (start + i + delta) % this.list.length;
                const label = this.keyboardNavigationLabelProvider.getKeyboardNavigationLabel(this.view.element(index));
                const labelStr = label && label.toString();
                if (this.list.options.typeNavigationEnabled) {
                    if (typeof labelStr !== 'undefined') {
                        // If prefix is found, focus and return early
                        if ((0, filters_1.matchesPrefix)(word, labelStr)) {
                            this.previouslyFocused = start;
                            this.list.setFocus([index]);
                            this.list.reveal(index);
                            return;
                        }
                        const fuzzy = (0, filters_1.matchesFuzzy2)(word, labelStr);
                        if (fuzzy) {
                            const fuzzyScore = fuzzy[0].end - fuzzy[0].start;
                            // ensures that when fuzzy matching, doesn't clash with prefix matching (1 input vs 1+ should be prefix and fuzzy respecitvely). Also makes sure that exact matches are prioritized.
                            if (fuzzyScore > 1 && fuzzy.length === 1) {
                                this.previouslyFocused = start;
                                this.list.setFocus([index]);
                                this.list.reveal(index);
                                return;
                            }
                        }
                    }
                }
                else if (typeof labelStr === 'undefined' || (0, filters_1.matchesPrefix)(word, labelStr)) {
                    this.previouslyFocused = start;
                    this.list.setFocus([index]);
                    this.list.reveal(index);
                    return;
                }
            }
        }
        dispose() {
            this.disable();
            this.enabledDisposables.dispose();
            this.disposables.dispose();
        }
    }
    class DOMFocusController {
        constructor(list, view) {
            this.list = list;
            this.view = view;
            this.disposables = new lifecycle_1.DisposableStore();
            const onKeyDown = event_2.Event.chain(this.disposables.add(new event_1.DomEmitter(view.domNode, 'keydown')).event, $ => $
                .filter(e => !isInputElement(e.target))
                .map(e => new keyboardEvent_1.StandardKeyboardEvent(e)));
            const onTab = event_2.Event.chain(onKeyDown, $ => $.filter(e => e.keyCode === 2 /* KeyCode.Tab */ && !e.ctrlKey && !e.metaKey && !e.shiftKey && !e.altKey));
            onTab(this.onTab, this, this.disposables);
        }
        onTab(e) {
            if (e.target !== this.view.domNode) {
                return;
            }
            const focus = this.list.getFocus();
            if (focus.length === 0) {
                return;
            }
            const focusedDomElement = this.view.domElement(focus[0]);
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
            this.disposables.dispose();
        }
    }
    function isSelectionSingleChangeEvent(event) {
        return platform.isMacintosh ? event.browserEvent.metaKey : event.browserEvent.ctrlKey;
    }
    exports.isSelectionSingleChangeEvent = isSelectionSingleChangeEvent;
    function isSelectionRangeChangeEvent(event) {
        return event.browserEvent.shiftKey;
    }
    exports.isSelectionRangeChangeEvent = isSelectionRangeChangeEvent;
    function isMouseRightClick(event) {
        return event instanceof MouseEvent && event.button === 2;
    }
    const DefaultMultipleSelectionController = {
        isSelectionSingleChangeEvent,
        isSelectionRangeChangeEvent
    };
    class MouseController {
        constructor(list) {
            this.list = list;
            this.disposables = new lifecycle_1.DisposableStore();
            this._onPointer = new event_2.Emitter();
            this.onPointer = this._onPointer.event;
            if (list.options.multipleSelectionSupport !== false) {
                this.multipleSelectionController = this.list.options.multipleSelectionController || DefaultMultipleSelectionController;
            }
            this.mouseSupport = typeof list.options.mouseSupport === 'undefined' || !!list.options.mouseSupport;
            if (this.mouseSupport) {
                list.onMouseDown(this.onMouseDown, this, this.disposables);
                list.onContextMenu(this.onContextMenu, this, this.disposables);
                list.onMouseDblClick(this.onDoubleClick, this, this.disposables);
                list.onTouchStart(this.onMouseDown, this, this.disposables);
                this.disposables.add(touch_1.Gesture.addTarget(list.getHTMLElement()));
            }
            event_2.Event.any(list.onMouseClick, list.onMouseMiddleClick, list.onTap)(this.onViewPointer, this, this.disposables);
        }
        updateOptions(optionsUpdate) {
            if (optionsUpdate.multipleSelectionSupport !== undefined) {
                this.multipleSelectionController = undefined;
                if (optionsUpdate.multipleSelectionSupport) {
                    this.multipleSelectionController = this.list.options.multipleSelectionController || DefaultMultipleSelectionController;
                }
            }
        }
        isSelectionSingleChangeEvent(event) {
            if (!this.multipleSelectionController) {
                return false;
            }
            return this.multipleSelectionController.isSelectionSingleChangeEvent(event);
        }
        isSelectionRangeChangeEvent(event) {
            if (!this.multipleSelectionController) {
                return false;
            }
            return this.multipleSelectionController.isSelectionRangeChangeEvent(event);
        }
        isSelectionChangeEvent(event) {
            return this.isSelectionSingleChangeEvent(event) || this.isSelectionRangeChangeEvent(event);
        }
        onMouseDown(e) {
            if (isMonacoEditor(e.browserEvent.target)) {
                return;
            }
            if (document.activeElement !== e.browserEvent.target) {
                this.list.domFocus();
            }
        }
        onContextMenu(e) {
            if (isInputElement(e.browserEvent.target) || isMonacoEditor(e.browserEvent.target)) {
                return;
            }
            const focus = typeof e.index === 'undefined' ? [] : [e.index];
            this.list.setFocus(focus, e.browserEvent);
        }
        onViewPointer(e) {
            if (!this.mouseSupport) {
                return;
            }
            if (isInputElement(e.browserEvent.target) || isMonacoEditor(e.browserEvent.target)) {
                return;
            }
            if (e.browserEvent.isHandledByList) {
                return;
            }
            e.browserEvent.isHandledByList = true;
            const focus = e.index;
            if (typeof focus === 'undefined') {
                this.list.setFocus([], e.browserEvent);
                this.list.setSelection([], e.browserEvent);
                this.list.setAnchor(undefined);
                return;
            }
            if (this.isSelectionChangeEvent(e)) {
                return this.changeSelection(e);
            }
            this.list.setFocus([focus], e.browserEvent);
            this.list.setAnchor(focus);
            if (!isMouseRightClick(e.browserEvent)) {
                this.list.setSelection([focus], e.browserEvent);
            }
            this._onPointer.fire(e);
        }
        onDoubleClick(e) {
            if (isInputElement(e.browserEvent.target) || isMonacoEditor(e.browserEvent.target)) {
                return;
            }
            if (this.isSelectionChangeEvent(e)) {
                return;
            }
            if (e.browserEvent.isHandledByList) {
                return;
            }
            e.browserEvent.isHandledByList = true;
            const focus = this.list.getFocus();
            this.list.setSelection(focus, e.browserEvent);
        }
        changeSelection(e) {
            const focus = e.index;
            let anchor = this.list.getAnchor();
            if (this.isSelectionRangeChangeEvent(e)) {
                if (typeof anchor === 'undefined') {
                    const currentFocus = this.list.getFocus()[0];
                    anchor = currentFocus ?? focus;
                    this.list.setAnchor(anchor);
                }
                const min = Math.min(anchor, focus);
                const max = Math.max(anchor, focus);
                const rangeSelection = (0, arrays_1.range)(min, max + 1);
                const selection = this.list.getSelection();
                const contiguousRange = getContiguousRangeContaining(disjunction(selection, [anchor]), anchor);
                if (contiguousRange.length === 0) {
                    return;
                }
                const newSelection = disjunction(rangeSelection, relativeComplement(selection, contiguousRange));
                this.list.setSelection(newSelection, e.browserEvent);
                this.list.setFocus([focus], e.browserEvent);
            }
            else if (this.isSelectionSingleChangeEvent(e)) {
                const selection = this.list.getSelection();
                const newSelection = selection.filter(i => i !== focus);
                this.list.setFocus([focus]);
                this.list.setAnchor(focus);
                if (selection.length === newSelection.length) {
                    this.list.setSelection([...newSelection, focus], e.browserEvent);
                }
                else {
                    this.list.setSelection(newSelection, e.browserEvent);
                }
            }
        }
        dispose() {
            this.disposables.dispose();
        }
    }
    exports.MouseController = MouseController;
    class DefaultStyleController {
        constructor(styleElement, selectorSuffix) {
            this.styleElement = styleElement;
            this.selectorSuffix = selectorSuffix;
        }
        style(styles) {
            const suffix = this.selectorSuffix && `.${this.selectorSuffix}`;
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
            const focusAndSelectionOutline = (0, dom_1.asCssValueWithDefault)(styles.listFocusAndSelectionOutline, (0, dom_1.asCssValueWithDefault)(styles.listSelectionOutline, styles.listFocusOutline ?? ''));
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
            const inactiveFocusAndSelectionOutline = (0, dom_1.asCssValueWithDefault)(styles.listSelectionOutline, styles.listInactiveFocusOutline ?? '');
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
            this.styleElement.textContent = content.join('\n');
        }
    }
    exports.DefaultStyleController = DefaultStyleController;
    exports.unthemedListStyles = {
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
        treeInactiveIndentGuidesStroke: color_1.Color.fromHex('#a9a9a9').transparent(0.4).toString(),
        tableColumnsBorder: color_1.Color.fromHex('#cccccc').transparent(0.2).toString(),
        tableOddRowsBackgroundColor: color_1.Color.fromHex('#cccccc').transparent(0.04).toString(),
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
        constructor(_templateId, renderers) {
            this._templateId = _templateId;
            this.renderers = renderers;
        }
        get templateId() {
            return this._templateId;
        }
        renderTemplate(container) {
            return this.renderers.map(r => r.renderTemplate(container));
        }
        renderElement(element, index, templateData, height) {
            let i = 0;
            for (const renderer of this.renderers) {
                renderer.renderElement(element, index, templateData[i++], height);
            }
        }
        disposeElement(element, index, templateData, height) {
            let i = 0;
            for (const renderer of this.renderers) {
                renderer.disposeElement?.(element, index, templateData[i], height);
                i += 1;
            }
        }
        disposeTemplate(templateData) {
            let i = 0;
            for (const renderer of this.renderers) {
                renderer.disposeTemplate(templateData[i++]);
            }
        }
    }
    class AccessibiltyRenderer {
        constructor(accessibilityProvider) {
            this.accessibilityProvider = accessibilityProvider;
            this.templateId = 'a18n';
        }
        renderTemplate(container) {
            return container;
        }
        renderElement(element, index, container) {
            const ariaLabel = this.accessibilityProvider.getAriaLabel(element);
            if (ariaLabel) {
                container.setAttribute('aria-label', ariaLabel);
            }
            else {
                container.removeAttribute('aria-label');
            }
            const ariaLevel = this.accessibilityProvider.getAriaLevel && this.accessibilityProvider.getAriaLevel(element);
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
        constructor(list, dnd) {
            this.list = list;
            this.dnd = dnd;
        }
        getDragElements(element) {
            const selection = this.list.getSelectedElements();
            const elements = selection.indexOf(element) > -1 ? selection : [element];
            return elements;
        }
        getDragURI(element) {
            return this.dnd.getDragURI(element);
        }
        getDragLabel(elements, originalEvent) {
            if (this.dnd.getDragLabel) {
                return this.dnd.getDragLabel(elements, originalEvent);
            }
            return undefined;
        }
        onDragStart(data, originalEvent) {
            this.dnd.onDragStart?.(data, originalEvent);
        }
        onDragOver(data, targetElement, targetIndex, originalEvent) {
            return this.dnd.onDragOver(data, targetElement, targetIndex, originalEvent);
        }
        onDragLeave(data, targetElement, targetIndex, originalEvent) {
            this.dnd.onDragLeave?.(data, targetElement, targetIndex, originalEvent);
        }
        onDragEnd(originalEvent) {
            this.dnd.onDragEnd?.(originalEvent);
        }
        drop(data, targetElement, targetIndex, originalEvent) {
            this.dnd.drop(data, targetElement, targetIndex, originalEvent);
        }
    }
    /**
     * The {@link List} is a virtual scrolling widget, built on top of the {@link ListView}
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
    class List {
        get onDidChangeFocus() {
            return event_2.Event.map(this.eventBufferer.wrapEvent(this.focus.onChange), e => this.toListEvent(e), this.disposables);
        }
        get onDidChangeSelection() {
            return event_2.Event.map(this.eventBufferer.wrapEvent(this.selection.onChange), e => this.toListEvent(e), this.disposables);
        }
        get domId() { return this.view.domId; }
        get onDidScroll() { return this.view.onDidScroll; }
        get onMouseClick() { return this.view.onMouseClick; }
        get onMouseDblClick() { return this.view.onMouseDblClick; }
        get onMouseMiddleClick() { return this.view.onMouseMiddleClick; }
        get onPointer() { return this.mouseController.onPointer; }
        get onMouseUp() { return this.view.onMouseUp; }
        get onMouseDown() { return this.view.onMouseDown; }
        get onMouseOver() { return this.view.onMouseOver; }
        get onMouseMove() { return this.view.onMouseMove; }
        get onMouseOut() { return this.view.onMouseOut; }
        get onTouchStart() { return this.view.onTouchStart; }
        get onTap() { return this.view.onTap; }
        /**
         * Possible context menu trigger events:
         * - ContextMenu key
         * - Shift F10
         * - Ctrl Option Shift M (macOS with VoiceOver)
         * - Mouse right click
         */
        get onContextMenu() {
            let didJustPressContextMenuKey = false;
            const fromKeyDown = event_2.Event.chain(this.disposables.add(new event_1.DomEmitter(this.view.domNode, 'keydown')).event, $ => $.map(e => new keyboardEvent_1.StandardKeyboardEvent(e))
                .filter(e => didJustPressContextMenuKey = e.keyCode === 58 /* KeyCode.ContextMenu */ || (e.shiftKey && e.keyCode === 68 /* KeyCode.F10 */))
                .map(e => dom_1.EventHelper.stop(e, true))
                .filter(() => false));
            const fromKeyUp = event_2.Event.chain(this.disposables.add(new event_1.DomEmitter(this.view.domNode, 'keyup')).event, $ => $.forEach(() => didJustPressContextMenuKey = false)
                .map(e => new keyboardEvent_1.StandardKeyboardEvent(e))
                .filter(e => e.keyCode === 58 /* KeyCode.ContextMenu */ || (e.shiftKey && e.keyCode === 68 /* KeyCode.F10 */))
                .map(e => dom_1.EventHelper.stop(e, true))
                .map(({ browserEvent }) => {
                const focus = this.getFocus();
                const index = focus.length ? focus[0] : undefined;
                const element = typeof index !== 'undefined' ? this.view.element(index) : undefined;
                const anchor = typeof index !== 'undefined' ? this.view.domElement(index) : this.view.domNode;
                return { index, element, anchor, browserEvent };
            }));
            const fromMouse = event_2.Event.chain(this.view.onContextMenu, $ => $.filter(_ => !didJustPressContextMenuKey)
                .map(({ element, index, browserEvent }) => ({ element, index, anchor: new mouseEvent_1.StandardMouseEvent(browserEvent), browserEvent })));
            return event_2.Event.any(fromKeyDown, fromKeyUp, fromMouse);
        }
        get onKeyDown() { return this.disposables.add(new event_1.DomEmitter(this.view.domNode, 'keydown')).event; }
        get onKeyUp() { return this.disposables.add(new event_1.DomEmitter(this.view.domNode, 'keyup')).event; }
        get onKeyPress() { return this.disposables.add(new event_1.DomEmitter(this.view.domNode, 'keypress')).event; }
        get onDidFocus() { return event_2.Event.signal(this.disposables.add(new event_1.DomEmitter(this.view.domNode, 'focus', true)).event); }
        get onDidBlur() { return event_2.Event.signal(this.disposables.add(new event_1.DomEmitter(this.view.domNode, 'blur', true)).event); }
        constructor(user, container, virtualDelegate, renderers, _options = DefaultOptions) {
            this.user = user;
            this._options = _options;
            this.focus = new Trait('focused');
            this.anchor = new Trait('anchor');
            this.eventBufferer = new event_2.EventBufferer();
            this._ariaLabel = '';
            this.disposables = new lifecycle_1.DisposableStore();
            this._onDidDispose = new event_2.Emitter();
            this.onDidDispose = this._onDidDispose.event;
            const role = this._options.accessibilityProvider && this._options.accessibilityProvider.getWidgetRole ? this._options.accessibilityProvider?.getWidgetRole() : 'list';
            this.selection = new SelectionTrait(role !== 'listbox');
            const baseRenderers = [this.focus.renderer, this.selection.renderer];
            this.accessibilityProvider = _options.accessibilityProvider;
            if (this.accessibilityProvider) {
                baseRenderers.push(new AccessibiltyRenderer(this.accessibilityProvider));
                this.accessibilityProvider.onDidChangeActiveDescendant?.(this.onDidChangeActiveDescendant, this, this.disposables);
            }
            renderers = renderers.map(r => new PipelineRenderer(r.templateId, [...baseRenderers, r]));
            const viewOptions = {
                ..._options,
                dnd: _options.dnd && new ListViewDragAndDrop(this, _options.dnd)
            };
            this.view = this.createListView(container, virtualDelegate, renderers, viewOptions);
            this.view.domNode.setAttribute('role', role);
            if (_options.styleController) {
                this.styleController = _options.styleController(this.view.domId);
            }
            else {
                const styleElement = (0, dom_1.createStyleSheet)(this.view.domNode);
                this.styleController = new DefaultStyleController(styleElement, this.view.domId);
            }
            this.spliceable = new splice_1.CombinedSpliceable([
                new TraitSpliceable(this.focus, this.view, _options.identityProvider),
                new TraitSpliceable(this.selection, this.view, _options.identityProvider),
                new TraitSpliceable(this.anchor, this.view, _options.identityProvider),
                this.view
            ]);
            this.disposables.add(this.focus);
            this.disposables.add(this.selection);
            this.disposables.add(this.anchor);
            this.disposables.add(this.view);
            this.disposables.add(this._onDidDispose);
            this.disposables.add(new DOMFocusController(this, this.view));
            if (typeof _options.keyboardSupport !== 'boolean' || _options.keyboardSupport) {
                this.keyboardController = new KeyboardController(this, this.view, _options);
                this.disposables.add(this.keyboardController);
            }
            if (_options.keyboardNavigationLabelProvider) {
                const delegate = _options.keyboardNavigationDelegate || exports.DefaultKeyboardNavigationDelegate;
                this.typeNavigationController = new TypeNavigationController(this, this.view, _options.keyboardNavigationLabelProvider, _options.keyboardNavigationEventFilter ?? (() => true), delegate);
                this.disposables.add(this.typeNavigationController);
            }
            this.mouseController = this.createMouseController(_options);
            this.disposables.add(this.mouseController);
            this.onDidChangeFocus(this._onFocusChange, this, this.disposables);
            this.onDidChangeSelection(this._onSelectionChange, this, this.disposables);
            if (this.accessibilityProvider) {
                this.ariaLabel = this.accessibilityProvider.getWidgetAriaLabel();
            }
            if (this._options.multipleSelectionSupport !== false) {
                this.view.domNode.setAttribute('aria-multiselectable', 'true');
            }
        }
        createListView(container, virtualDelegate, renderers, viewOptions) {
            return new listView_1.ListView(container, virtualDelegate, renderers, viewOptions);
        }
        createMouseController(options) {
            return new MouseController(this);
        }
        updateOptions(optionsUpdate = {}) {
            this._options = { ...this._options, ...optionsUpdate };
            this.typeNavigationController?.updateOptions(this._options);
            if (this._options.multipleSelectionController !== undefined) {
                if (this._options.multipleSelectionSupport) {
                    this.view.domNode.setAttribute('aria-multiselectable', 'true');
                }
                else {
                    this.view.domNode.removeAttribute('aria-multiselectable');
                }
            }
            this.mouseController.updateOptions(optionsUpdate);
            this.keyboardController?.updateOptions(optionsUpdate);
            this.view.updateOptions(optionsUpdate);
        }
        get options() {
            return this._options;
        }
        splice(start, deleteCount, elements = []) {
            if (start < 0 || start > this.view.length) {
                throw new list_1.ListError(this.user, `Invalid start index: ${start}`);
            }
            if (deleteCount < 0) {
                throw new list_1.ListError(this.user, `Invalid delete count: ${deleteCount}`);
            }
            if (deleteCount === 0 && elements.length === 0) {
                return;
            }
            this.eventBufferer.bufferEvents(() => this.spliceable.splice(start, deleteCount, elements));
        }
        updateWidth(index) {
            this.view.updateWidth(index);
        }
        updateElementHeight(index, size) {
            this.view.updateElementHeight(index, size, null);
        }
        rerender() {
            this.view.rerender();
        }
        element(index) {
            return this.view.element(index);
        }
        indexOf(element) {
            return this.view.indexOf(element);
        }
        get length() {
            return this.view.length;
        }
        get contentHeight() {
            return this.view.contentHeight;
        }
        get contentWidth() {
            return this.view.contentWidth;
        }
        get onDidChangeContentHeight() {
            return this.view.onDidChangeContentHeight;
        }
        get onDidChangeContentWidth() {
            return this.view.onDidChangeContentWidth;
        }
        get scrollTop() {
            return this.view.getScrollTop();
        }
        set scrollTop(scrollTop) {
            this.view.setScrollTop(scrollTop);
        }
        get scrollLeft() {
            return this.view.getScrollLeft();
        }
        set scrollLeft(scrollLeft) {
            this.view.setScrollLeft(scrollLeft);
        }
        get scrollHeight() {
            return this.view.scrollHeight;
        }
        get renderHeight() {
            return this.view.renderHeight;
        }
        get firstVisibleIndex() {
            return this.view.firstVisibleIndex;
        }
        get lastVisibleIndex() {
            return this.view.lastVisibleIndex;
        }
        get ariaLabel() {
            return this._ariaLabel;
        }
        set ariaLabel(value) {
            this._ariaLabel = value;
            this.view.domNode.setAttribute('aria-label', value);
        }
        domFocus() {
            this.view.domNode.focus({ preventScroll: true });
        }
        layout(height, width) {
            this.view.layout(height, width);
        }
        triggerTypeNavigation() {
            this.typeNavigationController?.trigger();
        }
        setSelection(indexes, browserEvent) {
            for (const index of indexes) {
                if (index < 0 || index >= this.length) {
                    throw new list_1.ListError(this.user, `Invalid index ${index}`);
                }
            }
            this.selection.set(indexes, browserEvent);
        }
        getSelection() {
            return this.selection.get();
        }
        getSelectedElements() {
            return this.getSelection().map(i => this.view.element(i));
        }
        setAnchor(index) {
            if (typeof index === 'undefined') {
                this.anchor.set([]);
                return;
            }
            if (index < 0 || index >= this.length) {
                throw new list_1.ListError(this.user, `Invalid index ${index}`);
            }
            this.anchor.set([index]);
        }
        getAnchor() {
            return (0, arrays_1.firstOrDefault)(this.anchor.get(), undefined);
        }
        getAnchorElement() {
            const anchor = this.getAnchor();
            return typeof anchor === 'undefined' ? undefined : this.element(anchor);
        }
        setFocus(indexes, browserEvent) {
            for (const index of indexes) {
                if (index < 0 || index >= this.length) {
                    throw new list_1.ListError(this.user, `Invalid index ${index}`);
                }
            }
            this.focus.set(indexes, browserEvent);
        }
        focusNext(n = 1, loop = false, browserEvent, filter) {
            if (this.length === 0) {
                return;
            }
            const focus = this.focus.get();
            const index = this.findNextIndex(focus.length > 0 ? focus[0] + n : 0, loop, filter);
            if (index > -1) {
                this.setFocus([index], browserEvent);
            }
        }
        focusPrevious(n = 1, loop = false, browserEvent, filter) {
            if (this.length === 0) {
                return;
            }
            const focus = this.focus.get();
            const index = this.findPreviousIndex(focus.length > 0 ? focus[0] - n : 0, loop, filter);
            if (index > -1) {
                this.setFocus([index], browserEvent);
            }
        }
        async focusNextPage(browserEvent, filter) {
            let lastPageIndex = this.view.indexAt(this.view.getScrollTop() + this.view.renderHeight);
            lastPageIndex = lastPageIndex === 0 ? 0 : lastPageIndex - 1;
            const currentlyFocusedElementIndex = this.getFocus()[0];
            if (currentlyFocusedElementIndex !== lastPageIndex && (currentlyFocusedElementIndex === undefined || lastPageIndex > currentlyFocusedElementIndex)) {
                const lastGoodPageIndex = this.findPreviousIndex(lastPageIndex, false, filter);
                if (lastGoodPageIndex > -1 && currentlyFocusedElementIndex !== lastGoodPageIndex) {
                    this.setFocus([lastGoodPageIndex], browserEvent);
                }
                else {
                    this.setFocus([lastPageIndex], browserEvent);
                }
            }
            else {
                const previousScrollTop = this.view.getScrollTop();
                let nextpageScrollTop = previousScrollTop + this.view.renderHeight;
                if (lastPageIndex > currentlyFocusedElementIndex) {
                    // scroll last page element to the top only if the last page element is below the focused element
                    nextpageScrollTop -= this.view.elementHeight(lastPageIndex);
                }
                this.view.setScrollTop(nextpageScrollTop);
                if (this.view.getScrollTop() !== previousScrollTop) {
                    this.setFocus([]);
                    // Let the scroll event listener run
                    await (0, async_1.timeout)(0);
                    await this.focusNextPage(browserEvent, filter);
                }
            }
        }
        async focusPreviousPage(browserEvent, filter) {
            let firstPageIndex;
            const scrollTop = this.view.getScrollTop();
            if (scrollTop === 0) {
                firstPageIndex = this.view.indexAt(scrollTop);
            }
            else {
                firstPageIndex = this.view.indexAfter(scrollTop - 1);
            }
            const currentlyFocusedElementIndex = this.getFocus()[0];
            if (currentlyFocusedElementIndex !== firstPageIndex && (currentlyFocusedElementIndex === undefined || currentlyFocusedElementIndex >= firstPageIndex)) {
                const firstGoodPageIndex = this.findNextIndex(firstPageIndex, false, filter);
                if (firstGoodPageIndex > -1 && currentlyFocusedElementIndex !== firstGoodPageIndex) {
                    this.setFocus([firstGoodPageIndex], browserEvent);
                }
                else {
                    this.setFocus([firstPageIndex], browserEvent);
                }
            }
            else {
                const previousScrollTop = scrollTop;
                this.view.setScrollTop(scrollTop - this.view.renderHeight);
                if (this.view.getScrollTop() !== previousScrollTop) {
                    this.setFocus([]);
                    // Let the scroll event listener run
                    await (0, async_1.timeout)(0);
                    await this.focusPreviousPage(browserEvent, filter);
                }
            }
        }
        focusLast(browserEvent, filter) {
            if (this.length === 0) {
                return;
            }
            const index = this.findPreviousIndex(this.length - 1, false, filter);
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
            const index = this.findNextIndex(n, false, filter);
            if (index > -1) {
                this.setFocus([index], browserEvent);
            }
        }
        findNextIndex(index, loop = false, filter) {
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
        findPreviousIndex(index, loop = false, filter) {
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
            return this.focus.get();
        }
        getFocusedElements() {
            return this.getFocus().map(i => this.view.element(i));
        }
        reveal(index, relativeTop) {
            if (index < 0 || index >= this.length) {
                throw new list_1.ListError(this.user, `Invalid index ${index}`);
            }
            const scrollTop = this.view.getScrollTop();
            const elementTop = this.view.elementTop(index);
            const elementHeight = this.view.elementHeight(index);
            if ((0, types_1.isNumber)(relativeTop)) {
                // y = mx + b
                const m = elementHeight - this.view.renderHeight;
                this.view.setScrollTop(m * (0, numbers_1.clamp)(relativeTop, 0, 1) + elementTop);
            }
            else {
                const viewItemBottom = elementTop + elementHeight;
                const scrollBottom = scrollTop + this.view.renderHeight;
                if (elementTop < scrollTop && viewItemBottom >= scrollBottom) {
                    // The element is already overflowing the viewport, no-op
                }
                else if (elementTop < scrollTop || (viewItemBottom >= scrollBottom && elementHeight >= this.view.renderHeight)) {
                    this.view.setScrollTop(elementTop);
                }
                else if (viewItemBottom >= scrollBottom) {
                    this.view.setScrollTop(viewItemBottom - this.view.renderHeight);
                }
            }
        }
        /**
         * Returns the relative position of an element rendered in the list.
         * Returns `null` if the element isn't *entirely* in the visible viewport.
         */
        getRelativeTop(index) {
            if (index < 0 || index >= this.length) {
                throw new list_1.ListError(this.user, `Invalid index ${index}`);
            }
            const scrollTop = this.view.getScrollTop();
            const elementTop = this.view.elementTop(index);
            const elementHeight = this.view.elementHeight(index);
            if (elementTop < scrollTop || elementTop + elementHeight > scrollTop + this.view.renderHeight) {
                return null;
            }
            // y = mx + b
            const m = elementHeight - this.view.renderHeight;
            return Math.abs((scrollTop - elementTop) / m);
        }
        isDOMFocused() {
            return this.view.domNode === document.activeElement;
        }
        getHTMLElement() {
            return this.view.domNode;
        }
        getElementID(index) {
            return this.view.getElementDomId(index);
        }
        style(styles) {
            this.styleController.style(styles);
        }
        toListEvent({ indexes, browserEvent }) {
            return { indexes, elements: indexes.map(i => this.view.element(i)), browserEvent };
        }
        _onFocusChange() {
            const focus = this.focus.get();
            this.view.domNode.classList.toggle('element-focused', focus.length > 0);
            this.onDidChangeActiveDescendant();
        }
        onDidChangeActiveDescendant() {
            const focus = this.focus.get();
            if (focus.length > 0) {
                let id;
                if (this.accessibilityProvider?.getActiveDescendantId) {
                    id = this.accessibilityProvider.getActiveDescendantId(this.view.element(focus[0]));
                }
                this.view.domNode.setAttribute('aria-activedescendant', id || this.view.getElementDomId(focus[0]));
            }
            else {
                this.view.domNode.removeAttribute('aria-activedescendant');
            }
        }
        _onSelectionChange() {
            const selection = this.selection.get();
            this.view.domNode.classList.toggle('selection-none', selection.length === 0);
            this.view.domNode.classList.toggle('selection-single', selection.length === 1);
            this.view.domNode.classList.toggle('selection-multiple', selection.length > 1);
        }
        dispose() {
            this._onDidDispose.fire();
            this.disposables.dispose();
            this._onDidDispose.dispose();
        }
    }
    exports.List = List;
    __decorate([
        decorators_1.memoize
    ], List.prototype, "onDidChangeFocus", null);
    __decorate([
        decorators_1.memoize
    ], List.prototype, "onDidChangeSelection", null);
    __decorate([
        decorators_1.memoize
    ], List.prototype, "onContextMenu", null);
    __decorate([
        decorators_1.memoize
    ], List.prototype, "onKeyDown", null);
    __decorate([
        decorators_1.memoize
    ], List.prototype, "onKeyUp", null);
    __decorate([
        decorators_1.memoize
    ], List.prototype, "onKeyPress", null);
    __decorate([
        decorators_1.memoize
    ], List.prototype, "onDidFocus", null);
    __decorate([
        decorators_1.memoize
    ], List.prototype, "onDidBlur", null);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGlzdFdpZGdldC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL2Jhc2UvYnJvd3Nlci91aS9saXN0L2xpc3RXaWRnZXQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7O0lBd0NoRyxNQUFNLGFBQWE7UUFJbEIsWUFBb0IsS0FBZTtZQUFmLFVBQUssR0FBTCxLQUFLLENBQVU7WUFGM0IscUJBQWdCLEdBQXlCLEVBQUUsQ0FBQztRQUViLENBQUM7UUFFeEMsSUFBSSxVQUFVO1lBQ2IsT0FBTyxZQUFZLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLENBQUM7UUFDdEMsQ0FBQztRQUVELGNBQWMsQ0FBQyxTQUFzQjtZQUNwQyxPQUFPLFNBQVMsQ0FBQztRQUNsQixDQUFDO1FBRUQsYUFBYSxDQUFDLE9BQVUsRUFBRSxLQUFhLEVBQUUsWUFBZ0M7WUFDeEUsTUFBTSxvQkFBb0IsR0FBRyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsU0FBUyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLFlBQVksS0FBSyxZQUFZLENBQUMsQ0FBQztZQUVyRyxJQUFJLG9CQUFvQixJQUFJLENBQUMsRUFBRTtnQkFDOUIsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixDQUFDLG9CQUFvQixDQUFDLENBQUM7Z0JBQzdELElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLFlBQVksQ0FBQyxDQUFDO2dCQUNsQyxRQUFRLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQzthQUN2QjtpQkFBTTtnQkFDTixNQUFNLFFBQVEsR0FBRyxFQUFFLEtBQUssRUFBRSxZQUFZLEVBQUUsQ0FBQztnQkFDekMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQzthQUNyQztZQUVELElBQUksQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFD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QWMsRUFBRSxDQUFDO1lBQ25CLENBQUMsQ0FBQyxlQUFlLEVBQUUsQ0FBQztZQUNwQixJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLEVBQUUsS0FBSyxFQUFFLENBQUMsQ0FBQyxZQUFZLENBQUMsQ0FBQztZQUM5QyxNQUFNLEVBQUUsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ25DLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQ3hCLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQ3JCLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxDQUFDO1FBQzNCLENBQUM7UUFFTyxhQUFhLENBQUMsQ0FBd0I7WUFDN0MsQ0FBQyxDQUFDLGNBQWMsRUFBRSxDQUFDO1lBQ25CLENBQUMsQ0FBQyxlQUFlLEVBQUUsQ0FBQztZQUNwQixJQUFJLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLENBQUMsQ0FBQyxZQUFZLENBQUMsQ0FBQztZQUM1QyxNQUFNLEVBQUUsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ25DLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQ3hCLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQ3JCLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxDQUFDO1FBQzNCLENBQUM7UUFFTyxlQUFlLENBQUMsQ0FBd0I7WUFDL0MsQ0FBQyxDQUFDLGNBQWMsRUFBRSxDQUFDO1lBQ25CLENBQUMsQ0FBQyxlQUFlLEVBQUUsQ0FBQztZQUNwQixJQUFJLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUMsWUFBWSxDQUFDLENBQUM7WUFDeEMsTUFBTSxFQUFF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