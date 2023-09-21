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
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/keyboardEvent", "vs/base/browser/ui/actionbar/actionbar", "vs/base/browser/ui/iconLabel/iconLabel", "vs/base/browser/ui/keybindingLabel/keybindingLabel", "vs/base/common/arrays", "vs/base/common/async", "vs/base/common/comparers", "vs/base/common/decorators", "vs/base/common/errors", "vs/base/common/event", "vs/base/common/iconLabels", "vs/base/common/lifecycle", "vs/base/common/platform", "vs/base/common/strings", "vs/nls!vs/platform/quickinput/browser/quickInputList", "vs/platform/quickinput/browser/quickInputUtils", "vs/base/common/lazy", "vs/base/common/uri", "vs/platform/theme/common/theme", "vs/css!./media/quickInput"], function (require, exports, dom, keyboardEvent_1, actionbar_1, iconLabel_1, keybindingLabel_1, arrays_1, async_1, comparers_1, decorators_1, errors_1, event_1, iconLabels_1, lifecycle_1, platform, strings_1, nls_1, quickInputUtils_1, lazy_1, uri_1, theme_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$FAb = exports.QuickInputListFocus = void 0;
    const $ = dom.$;
    class ListElement {
        constructor(mainItem, previous, index, hasCheckbox, fireButtonTriggered, fireSeparatorButtonTriggered, onCheckedEmitter) {
            // state will get updated later
            this.d = false;
            this.f = false;
            this.hasCheckbox = hasCheckbox;
            this.index = index;
            this.fireButtonTriggered = fireButtonTriggered;
            this.fireSeparatorButtonTriggered = fireSeparatorButtonTriggered;
            this.m = onCheckedEmitter;
            this.onChecked = hasCheckbox
                ? event_1.Event.map(event_1.Event.filter(this.m.event, e => e.listElement === this), e => e.checked)
                : event_1.Event.None;
            if (mainItem.type === 'separator') {
                this.l = mainItem;
            }
            else {
                this.item = mainItem;
                if (previous && previous.type === 'separator' && !previous.buttons) {
                    this.l = previous;
                }
                this.saneDescription = this.item.description;
                this.saneDetail = this.item.detail;
                this.h = this.item.highlights?.label;
                this.j = this.item.highlights?.description;
                this.k = this.item.highlights?.detail;
                this.saneTooltip = this.item.tooltip;
            }
            this.c = new lazy_1.$T(() => {
                const saneLabel = mainItem.label ?? '';
                const saneSortLabel = (0, iconLabels_1.$Vj)(saneLabel).text.trim();
                const saneAriaLabel = mainItem.ariaLabel || [saneLabel, this.saneDescription, this.saneDetail]
                    .map(s => (0, iconLabels_1.$Uj)(s))
                    .filter(s => !!s)
                    .join(', ');
                return {
                    saneLabel,
                    saneSortLabel,
                    saneAriaLabel
                };
            });
        }
        // #region Lazy Getters
        get saneLabel() {
            return this.c.value.saneLabel;
        }
        get saneSortLabel() {
            return this.c.value.saneSortLabel;
        }
        get saneAriaLabel() {
            return this.c.value.saneAriaLabel;
        }
        // #endregion
        // #region Getters and Setters
        get element() {
            return this.g;
        }
        set element(value) {
            this.g = value;
        }
        get hidden() {
            return this.f;
        }
        set hidden(value) {
            this.f = value;
        }
        get checked() {
            return this.d;
        }
        set checked(value) {
            if (value !== this.d) {
                this.d = value;
                this.m.fire({ listElement: this, checked: value });
            }
        }
        get separator() {
            return this.l;
        }
        set separator(value) {
            this.l = value;
        }
        get labelHighlights() {
            return this.h;
        }
        set labelHighlights(value) {
            this.h = value;
        }
        get descriptionHighlights() {
            return this.j;
        }
        set descriptionHighlights(value) {
            this.j = value;
        }
        get detailHighlights() {
            return this.k;
        }
        set detailHighlights(value) {
            this.k = value;
        }
    }
    class ListElementRenderer {
        static { this.ID = 'listelement'; }
        constructor(c) {
            this.c = c;
        }
        get templateId() {
            return ListElementRenderer.ID;
        }
        renderTemplate(container) {
            const data = Object.create(null);
            data.toDisposeElement = [];
            data.toDisposeTemplate = [];
            data.entry = dom.$0O(container, $('.quick-input-list-entry'));
            // Checkbox
            const label = dom.$0O(data.entry, $('label.quick-input-list-label'));
            data.toDisposeTemplate.push(dom.$oO(label, dom.$3O.CLICK, e => {
                if (!data.checkbox.offsetParent) { // If checkbox not visible:
                    e.preventDefault(); // Prevent toggle of checkbox when it is immediately shown afterwards. #91740
                }
            }));
            data.checkbox = dom.$0O(label, $('input.quick-input-list-checkbox'));
            data.checkbox.type = 'checkbox';
            data.toDisposeTemplate.push(dom.$oO(data.checkbox, dom.$3O.CHANGE, e => {
                data.element.checked = data.checkbox.checked;
            }));
            // Rows
            const rows = dom.$0O(label, $('.quick-input-list-rows'));
            const row1 = dom.$0O(rows, $('.quick-input-list-row'));
            const row2 = dom.$0O(rows, $('.quick-input-list-row'));
            // Label
            data.label = new iconLabel_1.$KR(row1, { supportHighlights: true, supportDescriptionHighlights: true, supportIcons: true });
            data.toDisposeTemplate.push(data.label);
            data.icon = dom.$$O(data.label.element, $('.quick-input-list-icon'));
            // Keybinding
            const keybindingContainer = dom.$0O(row1, $('.quick-input-list-entry-keybinding'));
            data.keybinding = new keybindingLabel_1.$TR(keybindingContainer, platform.OS);
            // Detail
            const detailContainer = dom.$0O(row2, $('.quick-input-list-label-meta'));
            data.detail = new iconLabel_1.$KR(detailContainer, { supportHighlights: true, supportIcons: true });
            data.toDisposeTemplate.push(data.detail);
            // Separator
            data.separator = dom.$0O(data.entry, $('.quick-input-list-separator'));
            // Actions
            data.actionBar = new actionbar_1.$1P(data.entry);
            data.actionBar.domNode.classList.add('quick-input-list-entry-action-bar');
            data.toDisposeTemplate.push(data.actionBar);
            return data;
        }
        renderElement(element, index, data) {
            data.element = element;
            element.element = data.entry ?? undefined;
            const mainItem = element.item ? element.item : element.separator;
            data.checkbox.checked = element.checked;
            data.toDisposeElement.push(element.onChecked(checked => data.checkbox.checked = checked));
            const { labelHighlights, descriptionHighlights, detailHighlights } = element;
            if (element.item?.iconPath) {
                const icon = (0, theme_1.$fv)(this.c.getColorTheme().type) ? element.item.iconPath.dark : (element.item.iconPath.light ?? element.item.iconPath.dark);
                const iconUrl = uri_1.URI.revive(icon);
                data.icon.className = 'quick-input-list-icon';
                data.icon.style.backgroundImage = dom.$nP(iconUrl);
            }
            else {
                data.icon.style.backgroundImage = '';
                data.icon.className = element.item?.iconClass ? `quick-input-list-icon ${element.item.iconClass}` : '';
            }
            // Label
            const options = {
                matches: labelHighlights || [],
                descriptionTitle: element.saneDescription,
                descriptionMatches: descriptionHighlights || [],
                labelEscapeNewLines: true
            };
            if (mainItem.type !== 'separator') {
                options.extraClasses = mainItem.iconClasses;
                options.italic = mainItem.italic;
                options.strikethrough = mainItem.strikethrough;
                data.entry.classList.remove('quick-input-list-separator-as-item');
            }
            else {
                data.entry.classList.add('quick-input-list-separator-as-item');
            }
            data.label.setLabel(element.saneLabel, element.saneDescription, options);
            // Keybinding
            data.keybinding.set(mainItem.type === 'separator' ? undefined : mainItem.keybinding);
            // Detail
            if (element.saneDetail) {
                data.detail.element.style.display = '';
                data.detail.setLabel(element.saneDetail, undefined, {
                    matches: detailHighlights,
                    title: element.saneDetail,
                    labelEscapeNewLines: true
                });
            }
            else {
                data.detail.element.style.display = 'none';
            }
            // Separator
            if (element.item && element.separator && element.separator.label) {
                data.separator.textContent = element.separator.label;
                data.separator.style.display = '';
            }
            else {
                data.separator.style.display = 'none';
            }
            data.entry.classList.toggle('quick-input-list-separator-border', !!element.separator);
            // Actions
            const buttons = mainItem.buttons;
            if (buttons && buttons.length) {
                data.actionBar.push(buttons.map((button, index) => {
                    let cssClasses = button.iconClass || (button.iconPath ? (0, quickInputUtils_1.$zAb)(button.iconPath) : undefined);
                    if (button.alwaysVisible) {
                        cssClasses = cssClasses ? `${cssClasses} always-visible` : 'always-visible';
                    }
                    return {
                        id: `id-${index}`,
                        class: cssClasses,
                        enabled: true,
                        label: '',
                        tooltip: button.tooltip || '',
                        run: () => {
                            mainItem.type !== 'separator'
                                ? element.fireButtonTriggered({
                                    button,
                                    item: mainItem
                                })
                                : element.fireSeparatorButtonTriggered({
                                    button,
                                    separator: mainItem
                                });
                        }
                    };
                }), { icon: true, label: false });
                data.entry.classList.add('has-actions');
            }
            else {
                data.entry.classList.remove('has-actions');
            }
        }
        disposeElement(element, index, data) {
            data.toDisposeElement = (0, lifecycle_1.$fc)(data.toDisposeElement);
            data.actionBar.clear();
        }
        disposeTemplate(data) {
            data.toDisposeElement = (0, lifecycle_1.$fc)(data.toDisposeElement);
            data.toDisposeTemplate = (0, lifecycle_1.$fc)(data.toDisposeTemplate);
        }
    }
    class ListElementDelegate {
        getHeight(element) {
            if (!element.item) {
                // must be a separator
                return 24;
            }
            return element.saneDetail ? 44 : 22;
        }
        getTemplateId(element) {
            return ListElementRenderer.ID;
        }
    }
    var QuickInputListFocus;
    (function (QuickInputListFocus) {
        QuickInputListFocus[QuickInputListFocus["First"] = 1] = "First";
        QuickInputListFocus[QuickInputListFocus["Second"] = 2] = "Second";
        QuickInputListFocus[QuickInputListFocus["Last"] = 3] = "Last";
        QuickInputListFocus[QuickInputListFocus["Next"] = 4] = "Next";
        QuickInputListFocus[QuickInputListFocus["Previous"] = 5] = "Previous";
        QuickInputListFocus[QuickInputListFocus["NextPage"] = 6] = "NextPage";
        QuickInputListFocus[QuickInputListFocus["PreviousPage"] = 7] = "PreviousPage";
    })(QuickInputListFocus || (exports.QuickInputListFocus = QuickInputListFocus = {}));
    class $FAb {
        constructor(B, id, C, themeService) {
            this.B = B;
            this.C = C;
            this.f = [];
            this.g = [];
            this.h = new Map();
            this.matchOnDescription = false;
            this.matchOnDetail = false;
            this.matchOnLabel = true;
            this.matchOnLabelMode = 'fuzzy';
            this.matchOnMeta = true;
            this.sortByLabel = true;
            this.j = new event_1.$fd();
            this.onChangedAllVisibleChecked = this.j.event;
            this.k = new event_1.$fd();
            this.onChangedCheckedCount = this.k.event;
            this.l = new event_1.$fd();
            this.onChangedVisibleCount = this.l.event;
            this.m = new event_1.$fd();
            this.onChangedCheckedElements = this.m.event;
            this.o = new event_1.$fd();
            this.onButtonTriggered = this.o.event;
            this.p = new event_1.$fd();
            this.onSeparatorButtonTriggered = this.p.event;
            this.q = new event_1.$fd();
            this.onKeyDown = this.q.event;
            this.r = new event_1.$fd();
            this.onLeave = this.r.event;
            this.t = new event_1.$fd();
            this.u = true;
            this.v = [];
            this.w = [];
            this.id = id;
            this.c = dom.$0O(this.B, $('.quick-input-list'));
            const delegate = new ListElementDelegate();
            const accessibilityProvider = new QuickInputAccessibilityProvider();
            this.d = C.createList('QuickInput', this.c, delegate, [new ListElementRenderer(themeService)], {
                identityProvider: {
                    getId: element => {
                        // always prefer item over separator because if item is defined, it must be the main item type
                        // always prefer a defined id if one was specified and use label as a fallback
                        return element.item?.id
                            ?? element.item?.label
                            ?? element.separator?.id
                            ?? element.separator?.label
                            ?? '';
                    }
                },
                setRowLineHeight: false,
                multipleSelectionSupport: false,
                horizontalScrolling: false,
                accessibilityProvider
            });
            this.d.getHTMLElement().id = id;
            this.w.push(this.d);
            this.w.push(this.d.onKeyDown(e => {
                const event = new keyboardEvent_1.$jO(e);
                switch (event.keyCode) {
                    case 10 /* KeyCode.Space */:
                        this.toggleCheckbox();
                        break;
                    case 31 /* KeyCode.KeyA */:
                        if (platform.$j ? e.metaKey : e.ctrlKey) {
                            this.d.setFocus((0, arrays_1.$Qb)(this.d.length));
                        }
                        break;
                    case 16 /* KeyCode.UpArrow */: {
                        const focus1 = this.d.getFocus();
                        if (focus1.length === 1 && focus1[0] === 0) {
                            this.r.fire();
                        }
                        break;
                    }
                    case 18 /* KeyCode.DownArrow */: {
                        const focus2 = this.d.getFocus();
                        if (focus2.length === 1 && focus2[0] === this.d.length - 1) {
                            this.r.fire();
                        }
                        break;
                    }
                }
                this.q.fire(event);
            }));
            this.w.push(this.d.onMouseDown(e => {
                if (e.browserEvent.button !== 2) {
                    // Works around / fixes #64350.
                    e.browserEvent.preventDefault();
                }
            }));
            this.w.push(dom.$nO(this.c, dom.$3O.CLICK, e => {
                if (e.x || e.y) { // Avoid 'click' triggered by 'space' on checkbox.
                    this.r.fire();
                }
            }));
            this.w.push(this.d.onMouseMiddleClick(e => {
                this.r.fire();
            }));
            this.w.push(this.d.onContextMenu(e => {
                if (typeof e.index === 'number') {
                    e.browserEvent.preventDefault();
                    // we want to treat a context menu event as
                    // a gesture to open the item at the index
                    // since we do not have any context menu
                    // this enables for example macOS to Ctrl-
                    // click on an item to open it.
                    this.d.setSelection([e.index]);
                }
            }));
            if (C.hoverDelegate) {
                const delayer = new async_1.$Eg(C.hoverDelegate.delay);
                // onMouseOver triggers every time a new element has been moused over
                // even if it's on the same list item.
                this.w.push(this.d.onMouseOver(async (e) => {
                    // If we hover over an anchor element, we don't want to show the hover because
                    // the anchor may have a tooltip that we want to show instead.
                    if (e.browserEvent.target instanceof HTMLAnchorElement) {
                        delayer.cancel();
                        return;
                    }
                    if (
                    // anchors are an exception as called out above so we skip them here
                    !(e.browserEvent.relatedTarget instanceof HTMLAnchorElement) &&
                        // check if the mouse is still over the same element
                        dom.$NO(e.browserEvent.relatedTarget, e.element?.element)) {
                        return;
                    }
                    try {
                        await delayer.trigger(async () => {
                            if (e.element) {
                                this.E(e.element);
                            }
                        });
                    }
                    catch (e) {
                        // Ignore cancellation errors due to mouse out
                        if (!(0, errors_1.$2)(e)) {
                            throw e;
                        }
                    }
                }));
                this.w.push(this.d.onMouseOut(e => {
                    // onMouseOut triggers every time a new element has been moused over
                    // even if it's on the same list item. We only want one event, so we
                    // check if the mouse is still over the same element.
                    if (dom.$NO(e.browserEvent.relatedTarget, e.element?.element)) {
                        return;
                    }
                    delayer.cancel();
                }));
                this.w.push(delayer);
            }
            this.w.push(this.t.event(_ => this.F()));
            this.w.push(this.j, this.k, this.l, this.m, this.o, this.p, this.r, this.q);
        }
        get onDidChangeFocus() {
            return event_1.Event.map(this.d.onDidChangeFocus, e => e.elements.map(e => e.item));
        }
        get onDidChangeSelection() {
            return event_1.Event.map(this.d.onDidChangeSelection, e => ({ items: e.elements.map(e => e.item), event: e.browserEvent }));
        }
        get scrollTop() {
            return this.d.scrollTop;
        }
        set scrollTop(scrollTop) {
            this.d.scrollTop = scrollTop;
        }
        get ariaLabel() {
            return this.d.getHTMLElement().ariaLabel;
        }
        set ariaLabel(label) {
            this.d.getHTMLElement().ariaLabel = label;
        }
        getAllVisibleChecked() {
            return this.D(this.g, false);
        }
        D(elements, whenNoneVisible = true) {
            for (let i = 0, n = elements.length; i < n; i++) {
                const element = elements[i];
                if (!element.hidden) {
                    if (!element.checked) {
                        return false;
                    }
                    else {
                        whenNoneVisible = true;
                    }
                }
            }
            return whenNoneVisible;
        }
        getCheckedCount() {
            let count = 0;
            const elements = this.g;
            for (let i = 0, n = elements.length; i < n; i++) {
                if (elements[i].checked) {
                    count++;
                }
            }
            return count;
        }
        getVisibleCount() {
            let count = 0;
            const elements = this.g;
            for (let i = 0, n = elements.length; i < n; i++) {
                if (!elements[i].hidden) {
                    count++;
                }
            }
            return count;
        }
        setAllVisibleChecked(checked) {
            try {
                this.u = false;
                this.g.forEach(element => {
                    if (!element.hidden) {
                        element.checked = checked;
                    }
                });
            }
            finally {
                this.u = true;
                this.F();
            }
        }
        setElements(inputElements) {
            this.v = (0, lifecycle_1.$fc)(this.v);
            const fireButtonTriggered = (event) => this.G(event);
            const fireSeparatorButtonTriggered = (event) => this.H(event);
            this.f = inputElements;
            const elementsToIndexes = new Map();
            const hasCheckbox = this.B.classList.contains('show-checkboxes');
            this.g = inputElements.reduce((result, item, index) => {
                const previous = index > 0 ? inputElements[index - 1] : undefined;
                if (item.type === 'separator') {
                    if (!item.buttons) {
                        // This separator will be rendered as a part of the list item
                        return result;
                    }
                }
                const element = new ListElement(item, previous, index, hasCheckbox, fireButtonTriggered, fireSeparatorButtonTriggered, this.t);
                const resultIndex = result.length;
                result.push(element);
                elementsToIndexes.set(element.item ?? element.separator, resultIndex);
                return result;
            }, []);
            this.h = elementsToIndexes;
            this.d.splice(0, this.d.length); // Clear focus and selection first, sending the events when the list is empty.
            this.d.splice(0, this.d.length, this.g);
            this.l.fire(this.g.length);
        }
        getElementsCount() {
            return this.f.length;
        }
        getFocusedElements() {
            return this.d.getFocusedElements()
                .map(e => e.item);
        }
        setFocusedElements(items) {
            this.d.setFocus(items
                .filter(item => this.h.has(item))
                .map(item => this.h.get(item)));
            if (items.length > 0) {
                const focused = this.d.getFocus()[0];
                if (typeof focused === 'number') {
                    this.d.reveal(focused);
                }
            }
        }
        getActiveDescendant() {
            return this.d.getHTMLElement().getAttribute('aria-activedescendant');
        }
        getSelectedElements() {
            return this.d.getSelectedElements()
                .map(e => e.item);
        }
        setSelectedElements(items) {
            this.d.setSelection(items
                .filter(item => this.h.has(item))
                .map(item => this.h.get(item)));
        }
        getCheckedElements() {
            return this.g.filter(e => e.checked)
                .map(e => e.item)
                .filter(e => !!e);
        }
        setCheckedElements(items) {
            try {
                this.u = false;
                const checked = new Set();
                for (const item of items) {
                    checked.add(item);
                }
                for (const element of this.g) {
                    element.checked = checked.has(element.item);
                }
            }
            finally {
                this.u = true;
                this.F();
            }
        }
        set enabled(value) {
            this.d.getHTMLElement().style.pointerEvents = value ? '' : 'none';
        }
        focus(what) {
            if (!this.d.length) {
                return;
            }
            if (what === QuickInputListFocus.Second && this.d.length < 2) {
                what = QuickInputListFocus.First;
            }
            switch (what) {
                case QuickInputListFocus.First:
                    this.d.scrollTop = 0;
                    this.d.focusFirst(undefined, (e) => !!e.item);
                    break;
                case QuickInputListFocus.Second:
                    this.d.scrollTop = 0;
                    this.d.focusNth(1, undefined, (e) => !!e.item);
                    break;
                case QuickInputListFocus.Last:
                    this.d.scrollTop = this.d.scrollHeight;
                    this.d.focusLast(undefined, (e) => !!e.item);
                    break;
                case QuickInputListFocus.Next: {
                    this.d.focusNext(undefined, true, undefined, (e) => !!e.item);
                    const index = this.d.getFocus()[0];
                    if (index !== 0 && !this.g[index - 1].item && this.d.firstVisibleIndex > index - 1) {
                        this.d.reveal(index - 1);
                    }
                    break;
                }
                case QuickInputListFocus.Previous: {
                    this.d.focusPrevious(undefined, true, undefined, (e) => !!e.item);
                    const index = this.d.getFocus()[0];
                    if (index !== 0 && !this.g[index - 1].item && this.d.firstVisibleIndex > index - 1) {
                        this.d.reveal(index - 1);
                    }
                    break;
                }
                case QuickInputListFocus.NextPage:
                    this.d.focusNextPage(undefined, (e) => !!e.item);
                    break;
                case QuickInputListFocus.PreviousPage:
                    this.d.focusPreviousPage(undefined, (e) => !!e.item);
                    break;
            }
            const focused = this.d.getFocus()[0];
            if (typeof focused === 'number') {
                this.d.reveal(focused);
            }
        }
        clearFocus() {
            this.d.setFocus([]);
        }
        domFocus() {
            this.d.domFocus();
        }
        /**
         * Disposes of the hover and shows a new one for the given index if it has a tooltip.
         * @param element The element to show the hover for
         */
        E(element) {
            if (this.C.hoverDelegate === undefined) {
                return;
            }
            if (this.z && !this.z.isDisposed) {
                this.C.hoverDelegate.onDidHideHover?.();
                this.z?.dispose();
            }
            if (!element.element || !element.saneTooltip) {
                return;
            }
            this.z = this.C.hoverDelegate.showHover({
                content: element.saneTooltip,
                target: element.element,
                linkHandler: (url) => {
                    this.C.linkOpenerDelegate(url);
                },
                showPointer: true,
                container: this.c,
                hoverPosition: 1 /* HoverPosition.RIGHT */
            }, false);
        }
        layout(maxHeight) {
            this.d.getHTMLElement().style.maxHeight = maxHeight ? `${
            // Make sure height aligns with list item heights
            Math.floor(maxHeight / 44) * 44
                // Add some extra height so that it's clear there's more to scroll
                + 6}px` : '';
            this.d.layout();
        }
        filter(query) {
            if (!(this.sortByLabel || this.matchOnLabel || this.matchOnDescription || this.matchOnDetail)) {
                this.d.layout();
                return false;
            }
            const queryWithWhitespace = query;
            query = query.trim();
            // Reset filtering
            if (!query || !(this.matchOnLabel || this.matchOnDescription || this.matchOnDetail)) {
                this.g.forEach(element => {
                    element.labelHighlights = undefined;
                    element.descriptionHighlights = undefined;
                    element.detailHighlights = undefined;
                    element.hidden = false;
                    const previous = element.index && this.f[element.index - 1];
                    if (element.item) {
                        element.separator = previous && previous.type === 'separator' && !previous.buttons ? previous : undefined;
                    }
                });
            }
            // Filter by value (since we support icons in labels, use $(..) aware fuzzy matching)
            else {
                let currentSeparator;
                this.g.forEach(element => {
                    let labelHighlights;
                    if (this.matchOnLabelMode === 'fuzzy') {
                        labelHighlights = this.matchOnLabel ? (0, iconLabels_1.$Wj)(query, (0, iconLabels_1.$Vj)(element.saneLabel)) ?? undefined : undefined;
                    }
                    else {
                        labelHighlights = this.matchOnLabel ? matchesContiguousIconAware(queryWithWhitespace, (0, iconLabels_1.$Vj)(element.saneLabel)) ?? undefined : undefined;
                    }
                    const descriptionHighlights = this.matchOnDescription ? (0, iconLabels_1.$Wj)(query, (0, iconLabels_1.$Vj)(element.saneDescription || '')) ?? undefined : undefined;
                    const detailHighlights = this.matchOnDetail ? (0, iconLabels_1.$Wj)(query, (0, iconLabels_1.$Vj)(element.saneDetail || '')) ?? undefined : undefined;
                    if (labelHighlights || descriptionHighlights || detailHighlights) {
                        element.labelHighlights = labelHighlights;
                        element.descriptionHighlights = descriptionHighlights;
                        element.detailHighlights = detailHighlights;
                        element.hidden = false;
                    }
                    else {
                        element.labelHighlights = undefined;
                        element.descriptionHighlights = undefined;
                        element.detailHighlights = undefined;
                        element.hidden = element.item ? !element.item.alwaysShow : true;
                    }
                    // Ensure separators are filtered out first before deciding if we need to bring them back
                    if (element.item) {
                        element.separator = undefined;
                    }
                    else if (element.separator) {
                        element.hidden = true;
                    }
                    // we can show the separator unless the list gets sorted by match
                    if (!this.sortByLabel) {
                        const previous = element.index && this.f[element.index - 1];
                        currentSeparator = previous && previous.type === 'separator' ? previous : currentSeparator;
                        if (currentSeparator && !element.hidden) {
                            element.separator = currentSeparator;
                            currentSeparator = undefined;
                        }
                    }
                });
            }
            const shownElements = this.g.filter(element => !element.hidden);
            // Sort by value
            if (this.sortByLabel && query) {
                const normalizedSearchValue = query.toLowerCase();
                shownElements.sort((a, b) => {
                    return compareEntries(a, b, normalizedSearchValue);
                });
            }
            this.h = shownElements.reduce((map, element, index) => {
                map.set(element.item ?? element.separator, index);
                return map;
            }, new Map());
            this.d.splice(0, this.d.length, shownElements);
            this.d.setFocus([]);
            this.d.layout();
            this.j.fire(this.getAllVisibleChecked());
            this.l.fire(shownElements.length);
            return true;
        }
        toggleCheckbox() {
            try {
                this.u = false;
                const elements = this.d.getFocusedElements();
                const allChecked = this.D(elements);
                for (const element of elements) {
                    element.checked = !allChecked;
                }
            }
            finally {
                this.u = true;
                this.F();
            }
        }
        display(display) {
            this.c.style.display = display ? '' : 'none';
        }
        isDisplayed() {
            return this.c.style.display !== 'none';
        }
        dispose() {
            this.v = (0, lifecycle_1.$fc)(this.v);
            this.w = (0, lifecycle_1.$fc)(this.w);
        }
        F() {
            if (this.u) {
                this.j.fire(this.getAllVisibleChecked());
                this.k.fire(this.getCheckedCount());
                this.m.fire(this.getCheckedElements());
            }
        }
        G(event) {
            this.o.fire(event);
        }
        H(event) {
            this.p.fire(event);
        }
        style(styles) {
            this.d.style(styles);
        }
        toggleHover() {
            const element = this.d.getFocusedElements()[0];
            if (!element?.saneTooltip) {
                return;
            }
            // if there's a hover already, hide it (toggle off)
            if (this.z && !this.z.isDisposed) {
                this.z.dispose();
                return;
            }
            // If there is no hover, show it (toggle on)
            const focused = this.d.getFocusedElements()[0];
            if (!focused) {
                return;
            }
            this.E(focused);
            const store = new lifecycle_1.$jc();
            store.add(this.d.onDidChangeFocus(e => {
                if (e.indexes.length) {
                    this.E(e.elements[0]);
                }
            }));
            if (this.z) {
                store.add(this.z);
            }
            this.A = store;
            this.v.push(this.A);
        }
    }
    exports.$FAb = $FAb;
    __decorate([
        decorators_1.$6g
    ], $FAb.prototype, "onDidChangeFocus", null);
    __decorate([
        decorators_1.$6g
    ], $FAb.prototype, "onDidChangeSelection", null);
    function matchesContiguousIconAware(query, target) {
        const { text, iconOffsets } = target;
        // Return early if there are no icon markers in the word to match against
        if (!iconOffsets || iconOffsets.length === 0) {
            return matchesContiguous(query, text);
        }
        // Trim the word to match against because it could have leading
        // whitespace now if the word started with an icon
        const wordToMatchAgainstWithoutIconsTrimmed = (0, strings_1.$ue)(text, ' ');
        const leadingWhitespaceOffset = text.length - wordToMatchAgainstWithoutIconsTrimmed.length;
        // match on value without icon
        const matches = matchesContiguous(query, wordToMatchAgainstWithoutIconsTrimmed);
        // Map matches back to offsets with icon and trimming
        if (matches) {
            for (const match of matches) {
                const iconOffset = iconOffsets[match.start + leadingWhitespaceOffset] /* icon offsets at index */ + leadingWhitespaceOffset /* overall leading whitespace offset */;
                match.start += iconOffset;
                match.end += iconOffset;
            }
        }
        return matches;
    }
    function matchesContiguous(word, wordToMatchAgainst) {
        const matchIndex = wordToMatchAgainst.toLowerCase().indexOf(word.toLowerCase());
        if (matchIndex !== -1) {
            return [{ start: matchIndex, end: matchIndex + word.length }];
        }
        return null;
    }
    function compareEntries(elementA, elementB, lookFor) {
        const labelHighlightsA = elementA.labelHighlights || [];
        const labelHighlightsB = elementB.labelHighlights || [];
        if (labelHighlightsA.length && !labelHighlightsB.length) {
            return -1;
        }
        if (!labelHighlightsA.length && labelHighlightsB.length) {
            return 1;
        }
        if (labelHighlightsA.length === 0 && labelHighlightsB.length === 0) {
            return 0;
        }
        return (0, comparers_1.$iq)(elementA.saneSortLabel, elementB.saneSortLabel, lookFor);
    }
    class QuickInputAccessibilityProvider {
        getWidgetAriaLabel() {
            return (0, nls_1.localize)(0, null);
        }
        getAriaLabel(element) {
            return element.separator?.label
                ? `${element.saneAriaLabel}, ${element.separator.label}`
                : element.saneAriaLabel;
        }
        getWidgetRole() {
            return 'listbox';
        }
        getRole(element) {
            return element.hasCheckbox ? 'checkbox' : 'option';
        }
        isChecked(element) {
            if (!element.hasCheckbox) {
                return undefined;
            }
            return {
                value: element.checked,
                onDidChange: element.onChecked
            };
        }
    }
});
//# sourceMappingURL=quickInputList.js.map