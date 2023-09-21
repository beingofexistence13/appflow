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
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/keyboardEvent", "vs/base/browser/ui/actionbar/actionbar", "vs/base/browser/ui/iconLabel/iconLabel", "vs/base/browser/ui/keybindingLabel/keybindingLabel", "vs/base/common/arrays", "vs/base/common/async", "vs/base/common/comparers", "vs/base/common/decorators", "vs/base/common/errors", "vs/base/common/event", "vs/base/common/iconLabels", "vs/base/common/lifecycle", "vs/base/common/platform", "vs/base/common/strings", "vs/nls", "vs/platform/quickinput/browser/quickInputUtils", "vs/base/common/lazy", "vs/base/common/uri", "vs/platform/theme/common/theme", "vs/css!./media/quickInput"], function (require, exports, dom, keyboardEvent_1, actionbar_1, iconLabel_1, keybindingLabel_1, arrays_1, async_1, comparers_1, decorators_1, errors_1, event_1, iconLabels_1, lifecycle_1, platform, strings_1, nls_1, quickInputUtils_1, lazy_1, uri_1, theme_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.QuickInputList = exports.QuickInputListFocus = void 0;
    const $ = dom.$;
    class ListElement {
        constructor(mainItem, previous, index, hasCheckbox, fireButtonTriggered, fireSeparatorButtonTriggered, onCheckedEmitter) {
            // state will get updated later
            this._checked = false;
            this._hidden = false;
            this.hasCheckbox = hasCheckbox;
            this.index = index;
            this.fireButtonTriggered = fireButtonTriggered;
            this.fireSeparatorButtonTriggered = fireSeparatorButtonTriggered;
            this._onChecked = onCheckedEmitter;
            this.onChecked = hasCheckbox
                ? event_1.Event.map(event_1.Event.filter(this._onChecked.event, e => e.listElement === this), e => e.checked)
                : event_1.Event.None;
            if (mainItem.type === 'separator') {
                this._separator = mainItem;
            }
            else {
                this.item = mainItem;
                if (previous && previous.type === 'separator' && !previous.buttons) {
                    this._separator = previous;
                }
                this.saneDescription = this.item.description;
                this.saneDetail = this.item.detail;
                this._labelHighlights = this.item.highlights?.label;
                this._descriptionHighlights = this.item.highlights?.description;
                this._detailHighlights = this.item.highlights?.detail;
                this.saneTooltip = this.item.tooltip;
            }
            this._init = new lazy_1.Lazy(() => {
                const saneLabel = mainItem.label ?? '';
                const saneSortLabel = (0, iconLabels_1.parseLabelWithIcons)(saneLabel).text.trim();
                const saneAriaLabel = mainItem.ariaLabel || [saneLabel, this.saneDescription, this.saneDetail]
                    .map(s => (0, iconLabels_1.getCodiconAriaLabel)(s))
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
            return this._init.value.saneLabel;
        }
        get saneSortLabel() {
            return this._init.value.saneSortLabel;
        }
        get saneAriaLabel() {
            return this._init.value.saneAriaLabel;
        }
        // #endregion
        // #region Getters and Setters
        get element() {
            return this._element;
        }
        set element(value) {
            this._element = value;
        }
        get hidden() {
            return this._hidden;
        }
        set hidden(value) {
            this._hidden = value;
        }
        get checked() {
            return this._checked;
        }
        set checked(value) {
            if (value !== this._checked) {
                this._checked = value;
                this._onChecked.fire({ listElement: this, checked: value });
            }
        }
        get separator() {
            return this._separator;
        }
        set separator(value) {
            this._separator = value;
        }
        get labelHighlights() {
            return this._labelHighlights;
        }
        set labelHighlights(value) {
            this._labelHighlights = value;
        }
        get descriptionHighlights() {
            return this._descriptionHighlights;
        }
        set descriptionHighlights(value) {
            this._descriptionHighlights = value;
        }
        get detailHighlights() {
            return this._detailHighlights;
        }
        set detailHighlights(value) {
            this._detailHighlights = value;
        }
    }
    class ListElementRenderer {
        static { this.ID = 'listelement'; }
        constructor(themeService) {
            this.themeService = themeService;
        }
        get templateId() {
            return ListElementRenderer.ID;
        }
        renderTemplate(container) {
            const data = Object.create(null);
            data.toDisposeElement = [];
            data.toDisposeTemplate = [];
            data.entry = dom.append(container, $('.quick-input-list-entry'));
            // Checkbox
            const label = dom.append(data.entry, $('label.quick-input-list-label'));
            data.toDisposeTemplate.push(dom.addStandardDisposableListener(label, dom.EventType.CLICK, e => {
                if (!data.checkbox.offsetParent) { // If checkbox not visible:
                    e.preventDefault(); // Prevent toggle of checkbox when it is immediately shown afterwards. #91740
                }
            }));
            data.checkbox = dom.append(label, $('input.quick-input-list-checkbox'));
            data.checkbox.type = 'checkbox';
            data.toDisposeTemplate.push(dom.addStandardDisposableListener(data.checkbox, dom.EventType.CHANGE, e => {
                data.element.checked = data.checkbox.checked;
            }));
            // Rows
            const rows = dom.append(label, $('.quick-input-list-rows'));
            const row1 = dom.append(rows, $('.quick-input-list-row'));
            const row2 = dom.append(rows, $('.quick-input-list-row'));
            // Label
            data.label = new iconLabel_1.IconLabel(row1, { supportHighlights: true, supportDescriptionHighlights: true, supportIcons: true });
            data.toDisposeTemplate.push(data.label);
            data.icon = dom.prepend(data.label.element, $('.quick-input-list-icon'));
            // Keybinding
            const keybindingContainer = dom.append(row1, $('.quick-input-list-entry-keybinding'));
            data.keybinding = new keybindingLabel_1.KeybindingLabel(keybindingContainer, platform.OS);
            // Detail
            const detailContainer = dom.append(row2, $('.quick-input-list-label-meta'));
            data.detail = new iconLabel_1.IconLabel(detailContainer, { supportHighlights: true, supportIcons: true });
            data.toDisposeTemplate.push(data.detail);
            // Separator
            data.separator = dom.append(data.entry, $('.quick-input-list-separator'));
            // Actions
            data.actionBar = new actionbar_1.ActionBar(data.entry);
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
                const icon = (0, theme_1.isDark)(this.themeService.getColorTheme().type) ? element.item.iconPath.dark : (element.item.iconPath.light ?? element.item.iconPath.dark);
                const iconUrl = uri_1.URI.revive(icon);
                data.icon.className = 'quick-input-list-icon';
                data.icon.style.backgroundImage = dom.asCSSUrl(iconUrl);
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
                    let cssClasses = button.iconClass || (button.iconPath ? (0, quickInputUtils_1.getIconClass)(button.iconPath) : undefined);
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
            data.toDisposeElement = (0, lifecycle_1.dispose)(data.toDisposeElement);
            data.actionBar.clear();
        }
        disposeTemplate(data) {
            data.toDisposeElement = (0, lifecycle_1.dispose)(data.toDisposeElement);
            data.toDisposeTemplate = (0, lifecycle_1.dispose)(data.toDisposeTemplate);
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
    class QuickInputList {
        constructor(parent, id, options, themeService) {
            this.parent = parent;
            this.options = options;
            this.inputElements = [];
            this.elements = [];
            this.elementsToIndexes = new Map();
            this.matchOnDescription = false;
            this.matchOnDetail = false;
            this.matchOnLabel = true;
            this.matchOnLabelMode = 'fuzzy';
            this.matchOnMeta = true;
            this.sortByLabel = true;
            this._onChangedAllVisibleChecked = new event_1.Emitter();
            this.onChangedAllVisibleChecked = this._onChangedAllVisibleChecked.event;
            this._onChangedCheckedCount = new event_1.Emitter();
            this.onChangedCheckedCount = this._onChangedCheckedCount.event;
            this._onChangedVisibleCount = new event_1.Emitter();
            this.onChangedVisibleCount = this._onChangedVisibleCount.event;
            this._onChangedCheckedElements = new event_1.Emitter();
            this.onChangedCheckedElements = this._onChangedCheckedElements.event;
            this._onButtonTriggered = new event_1.Emitter();
            this.onButtonTriggered = this._onButtonTriggered.event;
            this._onSeparatorButtonTriggered = new event_1.Emitter();
            this.onSeparatorButtonTriggered = this._onSeparatorButtonTriggered.event;
            this._onKeyDown = new event_1.Emitter();
            this.onKeyDown = this._onKeyDown.event;
            this._onLeave = new event_1.Emitter();
            this.onLeave = this._onLeave.event;
            this._listElementChecked = new event_1.Emitter();
            this._fireCheckedEvents = true;
            this.elementDisposables = [];
            this.disposables = [];
            this.id = id;
            this.container = dom.append(this.parent, $('.quick-input-list'));
            const delegate = new ListElementDelegate();
            const accessibilityProvider = new QuickInputAccessibilityProvider();
            this.list = options.createList('QuickInput', this.container, delegate, [new ListElementRenderer(themeService)], {
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
            this.list.getHTMLElement().id = id;
            this.disposables.push(this.list);
            this.disposables.push(this.list.onKeyDown(e => {
                const event = new keyboardEvent_1.StandardKeyboardEvent(e);
                switch (event.keyCode) {
                    case 10 /* KeyCode.Space */:
                        this.toggleCheckbox();
                        break;
                    case 31 /* KeyCode.KeyA */:
                        if (platform.isMacintosh ? e.metaKey : e.ctrlKey) {
                            this.list.setFocus((0, arrays_1.range)(this.list.length));
                        }
                        break;
                    case 16 /* KeyCode.UpArrow */: {
                        const focus1 = this.list.getFocus();
                        if (focus1.length === 1 && focus1[0] === 0) {
                            this._onLeave.fire();
                        }
                        break;
                    }
                    case 18 /* KeyCode.DownArrow */: {
                        const focus2 = this.list.getFocus();
                        if (focus2.length === 1 && focus2[0] === this.list.length - 1) {
                            this._onLeave.fire();
                        }
                        break;
                    }
                }
                this._onKeyDown.fire(event);
            }));
            this.disposables.push(this.list.onMouseDown(e => {
                if (e.browserEvent.button !== 2) {
                    // Works around / fixes #64350.
                    e.browserEvent.preventDefault();
                }
            }));
            this.disposables.push(dom.addDisposableListener(this.container, dom.EventType.CLICK, e => {
                if (e.x || e.y) { // Avoid 'click' triggered by 'space' on checkbox.
                    this._onLeave.fire();
                }
            }));
            this.disposables.push(this.list.onMouseMiddleClick(e => {
                this._onLeave.fire();
            }));
            this.disposables.push(this.list.onContextMenu(e => {
                if (typeof e.index === 'number') {
                    e.browserEvent.preventDefault();
                    // we want to treat a context menu event as
                    // a gesture to open the item at the index
                    // since we do not have any context menu
                    // this enables for example macOS to Ctrl-
                    // click on an item to open it.
                    this.list.setSelection([e.index]);
                }
            }));
            if (options.hoverDelegate) {
                const delayer = new async_1.ThrottledDelayer(options.hoverDelegate.delay);
                // onMouseOver triggers every time a new element has been moused over
                // even if it's on the same list item.
                this.disposables.push(this.list.onMouseOver(async (e) => {
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
                        dom.isAncestor(e.browserEvent.relatedTarget, e.element?.element)) {
                        return;
                    }
                    try {
                        await delayer.trigger(async () => {
                            if (e.element) {
                                this.showHover(e.element);
                            }
                        });
                    }
                    catch (e) {
                        // Ignore cancellation errors due to mouse out
                        if (!(0, errors_1.isCancellationError)(e)) {
                            throw e;
                        }
                    }
                }));
                this.disposables.push(this.list.onMouseOut(e => {
                    // onMouseOut triggers every time a new element has been moused over
                    // even if it's on the same list item. We only want one event, so we
                    // check if the mouse is still over the same element.
                    if (dom.isAncestor(e.browserEvent.relatedTarget, e.element?.element)) {
                        return;
                    }
                    delayer.cancel();
                }));
                this.disposables.push(delayer);
            }
            this.disposables.push(this._listElementChecked.event(_ => this.fireCheckedEvents()));
            this.disposables.push(this._onChangedAllVisibleChecked, this._onChangedCheckedCount, this._onChangedVisibleCount, this._onChangedCheckedElements, this._onButtonTriggered, this._onSeparatorButtonTriggered, this._onLeave, this._onKeyDown);
        }
        get onDidChangeFocus() {
            return event_1.Event.map(this.list.onDidChangeFocus, e => e.elements.map(e => e.item));
        }
        get onDidChangeSelection() {
            return event_1.Event.map(this.list.onDidChangeSelection, e => ({ items: e.elements.map(e => e.item), event: e.browserEvent }));
        }
        get scrollTop() {
            return this.list.scrollTop;
        }
        set scrollTop(scrollTop) {
            this.list.scrollTop = scrollTop;
        }
        get ariaLabel() {
            return this.list.getHTMLElement().ariaLabel;
        }
        set ariaLabel(label) {
            this.list.getHTMLElement().ariaLabel = label;
        }
        getAllVisibleChecked() {
            return this.allVisibleChecked(this.elements, false);
        }
        allVisibleChecked(elements, whenNoneVisible = true) {
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
            const elements = this.elements;
            for (let i = 0, n = elements.length; i < n; i++) {
                if (elements[i].checked) {
                    count++;
                }
            }
            return count;
        }
        getVisibleCount() {
            let count = 0;
            const elements = this.elements;
            for (let i = 0, n = elements.length; i < n; i++) {
                if (!elements[i].hidden) {
                    count++;
                }
            }
            return count;
        }
        setAllVisibleChecked(checked) {
            try {
                this._fireCheckedEvents = false;
                this.elements.forEach(element => {
                    if (!element.hidden) {
                        element.checked = checked;
                    }
                });
            }
            finally {
                this._fireCheckedEvents = true;
                this.fireCheckedEvents();
            }
        }
        setElements(inputElements) {
            this.elementDisposables = (0, lifecycle_1.dispose)(this.elementDisposables);
            const fireButtonTriggered = (event) => this.fireButtonTriggered(event);
            const fireSeparatorButtonTriggered = (event) => this.fireSeparatorButtonTriggered(event);
            this.inputElements = inputElements;
            const elementsToIndexes = new Map();
            const hasCheckbox = this.parent.classList.contains('show-checkboxes');
            this.elements = inputElements.reduce((result, item, index) => {
                const previous = index > 0 ? inputElements[index - 1] : undefined;
                if (item.type === 'separator') {
                    if (!item.buttons) {
                        // This separator will be rendered as a part of the list item
                        return result;
                    }
                }
                const element = new ListElement(item, previous, index, hasCheckbox, fireButtonTriggered, fireSeparatorButtonTriggered, this._listElementChecked);
                const resultIndex = result.length;
                result.push(element);
                elementsToIndexes.set(element.item ?? element.separator, resultIndex);
                return result;
            }, []);
            this.elementsToIndexes = elementsToIndexes;
            this.list.splice(0, this.list.length); // Clear focus and selection first, sending the events when the list is empty.
            this.list.splice(0, this.list.length, this.elements);
            this._onChangedVisibleCount.fire(this.elements.length);
        }
        getElementsCount() {
            return this.inputElements.length;
        }
        getFocusedElements() {
            return this.list.getFocusedElements()
                .map(e => e.item);
        }
        setFocusedElements(items) {
            this.list.setFocus(items
                .filter(item => this.elementsToIndexes.has(item))
                .map(item => this.elementsToIndexes.get(item)));
            if (items.length > 0) {
                const focused = this.list.getFocus()[0];
                if (typeof focused === 'number') {
                    this.list.reveal(focused);
                }
            }
        }
        getActiveDescendant() {
            return this.list.getHTMLElement().getAttribute('aria-activedescendant');
        }
        getSelectedElements() {
            return this.list.getSelectedElements()
                .map(e => e.item);
        }
        setSelectedElements(items) {
            this.list.setSelection(items
                .filter(item => this.elementsToIndexes.has(item))
                .map(item => this.elementsToIndexes.get(item)));
        }
        getCheckedElements() {
            return this.elements.filter(e => e.checked)
                .map(e => e.item)
                .filter(e => !!e);
        }
        setCheckedElements(items) {
            try {
                this._fireCheckedEvents = false;
                const checked = new Set();
                for (const item of items) {
                    checked.add(item);
                }
                for (const element of this.elements) {
                    element.checked = checked.has(element.item);
                }
            }
            finally {
                this._fireCheckedEvents = true;
                this.fireCheckedEvents();
            }
        }
        set enabled(value) {
            this.list.getHTMLElement().style.pointerEvents = value ? '' : 'none';
        }
        focus(what) {
            if (!this.list.length) {
                return;
            }
            if (what === QuickInputListFocus.Second && this.list.length < 2) {
                what = QuickInputListFocus.First;
            }
            switch (what) {
                case QuickInputListFocus.First:
                    this.list.scrollTop = 0;
                    this.list.focusFirst(undefined, (e) => !!e.item);
                    break;
                case QuickInputListFocus.Second:
                    this.list.scrollTop = 0;
                    this.list.focusNth(1, undefined, (e) => !!e.item);
                    break;
                case QuickInputListFocus.Last:
                    this.list.scrollTop = this.list.scrollHeight;
                    this.list.focusLast(undefined, (e) => !!e.item);
                    break;
                case QuickInputListFocus.Next: {
                    this.list.focusNext(undefined, true, undefined, (e) => !!e.item);
                    const index = this.list.getFocus()[0];
                    if (index !== 0 && !this.elements[index - 1].item && this.list.firstVisibleIndex > index - 1) {
                        this.list.reveal(index - 1);
                    }
                    break;
                }
                case QuickInputListFocus.Previous: {
                    this.list.focusPrevious(undefined, true, undefined, (e) => !!e.item);
                    const index = this.list.getFocus()[0];
                    if (index !== 0 && !this.elements[index - 1].item && this.list.firstVisibleIndex > index - 1) {
                        this.list.reveal(index - 1);
                    }
                    break;
                }
                case QuickInputListFocus.NextPage:
                    this.list.focusNextPage(undefined, (e) => !!e.item);
                    break;
                case QuickInputListFocus.PreviousPage:
                    this.list.focusPreviousPage(undefined, (e) => !!e.item);
                    break;
            }
            const focused = this.list.getFocus()[0];
            if (typeof focused === 'number') {
                this.list.reveal(focused);
            }
        }
        clearFocus() {
            this.list.setFocus([]);
        }
        domFocus() {
            this.list.domFocus();
        }
        /**
         * Disposes of the hover and shows a new one for the given index if it has a tooltip.
         * @param element The element to show the hover for
         */
        showHover(element) {
            if (this.options.hoverDelegate === undefined) {
                return;
            }
            if (this._lastHover && !this._lastHover.isDisposed) {
                this.options.hoverDelegate.onDidHideHover?.();
                this._lastHover?.dispose();
            }
            if (!element.element || !element.saneTooltip) {
                return;
            }
            this._lastHover = this.options.hoverDelegate.showHover({
                content: element.saneTooltip,
                target: element.element,
                linkHandler: (url) => {
                    this.options.linkOpenerDelegate(url);
                },
                showPointer: true,
                container: this.container,
                hoverPosition: 1 /* HoverPosition.RIGHT */
            }, false);
        }
        layout(maxHeight) {
            this.list.getHTMLElement().style.maxHeight = maxHeight ? `${
            // Make sure height aligns with list item heights
            Math.floor(maxHeight / 44) * 44
                // Add some extra height so that it's clear there's more to scroll
                + 6}px` : '';
            this.list.layout();
        }
        filter(query) {
            if (!(this.sortByLabel || this.matchOnLabel || this.matchOnDescription || this.matchOnDetail)) {
                this.list.layout();
                return false;
            }
            const queryWithWhitespace = query;
            query = query.trim();
            // Reset filtering
            if (!query || !(this.matchOnLabel || this.matchOnDescription || this.matchOnDetail)) {
                this.elements.forEach(element => {
                    element.labelHighlights = undefined;
                    element.descriptionHighlights = undefined;
                    element.detailHighlights = undefined;
                    element.hidden = false;
                    const previous = element.index && this.inputElements[element.index - 1];
                    if (element.item) {
                        element.separator = previous && previous.type === 'separator' && !previous.buttons ? previous : undefined;
                    }
                });
            }
            // Filter by value (since we support icons in labels, use $(..) aware fuzzy matching)
            else {
                let currentSeparator;
                this.elements.forEach(element => {
                    let labelHighlights;
                    if (this.matchOnLabelMode === 'fuzzy') {
                        labelHighlights = this.matchOnLabel ? (0, iconLabels_1.matchesFuzzyIconAware)(query, (0, iconLabels_1.parseLabelWithIcons)(element.saneLabel)) ?? undefined : undefined;
                    }
                    else {
                        labelHighlights = this.matchOnLabel ? matchesContiguousIconAware(queryWithWhitespace, (0, iconLabels_1.parseLabelWithIcons)(element.saneLabel)) ?? undefined : undefined;
                    }
                    const descriptionHighlights = this.matchOnDescription ? (0, iconLabels_1.matchesFuzzyIconAware)(query, (0, iconLabels_1.parseLabelWithIcons)(element.saneDescription || '')) ?? undefined : undefined;
                    const detailHighlights = this.matchOnDetail ? (0, iconLabels_1.matchesFuzzyIconAware)(query, (0, iconLabels_1.parseLabelWithIcons)(element.saneDetail || '')) ?? undefined : undefined;
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
                        const previous = element.index && this.inputElements[element.index - 1];
                        currentSeparator = previous && previous.type === 'separator' ? previous : currentSeparator;
                        if (currentSeparator && !element.hidden) {
                            element.separator = currentSeparator;
                            currentSeparator = undefined;
                        }
                    }
                });
            }
            const shownElements = this.elements.filter(element => !element.hidden);
            // Sort by value
            if (this.sortByLabel && query) {
                const normalizedSearchValue = query.toLowerCase();
                shownElements.sort((a, b) => {
                    return compareEntries(a, b, normalizedSearchValue);
                });
            }
            this.elementsToIndexes = shownElements.reduce((map, element, index) => {
                map.set(element.item ?? element.separator, index);
                return map;
            }, new Map());
            this.list.splice(0, this.list.length, shownElements);
            this.list.setFocus([]);
            this.list.layout();
            this._onChangedAllVisibleChecked.fire(this.getAllVisibleChecked());
            this._onChangedVisibleCount.fire(shownElements.length);
            return true;
        }
        toggleCheckbox() {
            try {
                this._fireCheckedEvents = false;
                const elements = this.list.getFocusedElements();
                const allChecked = this.allVisibleChecked(elements);
                for (const element of elements) {
                    element.checked = !allChecked;
                }
            }
            finally {
                this._fireCheckedEvents = true;
                this.fireCheckedEvents();
            }
        }
        display(display) {
            this.container.style.display = display ? '' : 'none';
        }
        isDisplayed() {
            return this.container.style.display !== 'none';
        }
        dispose() {
            this.elementDisposables = (0, lifecycle_1.dispose)(this.elementDisposables);
            this.disposables = (0, lifecycle_1.dispose)(this.disposables);
        }
        fireCheckedEvents() {
            if (this._fireCheckedEvents) {
                this._onChangedAllVisibleChecked.fire(this.getAllVisibleChecked());
                this._onChangedCheckedCount.fire(this.getCheckedCount());
                this._onChangedCheckedElements.fire(this.getCheckedElements());
            }
        }
        fireButtonTriggered(event) {
            this._onButtonTriggered.fire(event);
        }
        fireSeparatorButtonTriggered(event) {
            this._onSeparatorButtonTriggered.fire(event);
        }
        style(styles) {
            this.list.style(styles);
        }
        toggleHover() {
            const element = this.list.getFocusedElements()[0];
            if (!element?.saneTooltip) {
                return;
            }
            // if there's a hover already, hide it (toggle off)
            if (this._lastHover && !this._lastHover.isDisposed) {
                this._lastHover.dispose();
                return;
            }
            // If there is no hover, show it (toggle on)
            const focused = this.list.getFocusedElements()[0];
            if (!focused) {
                return;
            }
            this.showHover(focused);
            const store = new lifecycle_1.DisposableStore();
            store.add(this.list.onDidChangeFocus(e => {
                if (e.indexes.length) {
                    this.showHover(e.elements[0]);
                }
            }));
            if (this._lastHover) {
                store.add(this._lastHover);
            }
            this._toggleHover = store;
            this.elementDisposables.push(this._toggleHover);
        }
    }
    exports.QuickInputList = QuickInputList;
    __decorate([
        decorators_1.memoize
    ], QuickInputList.prototype, "onDidChangeFocus", null);
    __decorate([
        decorators_1.memoize
    ], QuickInputList.prototype, "onDidChangeSelection", null);
    function matchesContiguousIconAware(query, target) {
        const { text, iconOffsets } = target;
        // Return early if there are no icon markers in the word to match against
        if (!iconOffsets || iconOffsets.length === 0) {
            return matchesContiguous(query, text);
        }
        // Trim the word to match against because it could have leading
        // whitespace now if the word started with an icon
        const wordToMatchAgainstWithoutIconsTrimmed = (0, strings_1.ltrim)(text, ' ');
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
        return (0, comparers_1.compareAnything)(elementA.saneSortLabel, elementB.saneSortLabel, lookFor);
    }
    class QuickInputAccessibilityProvider {
        getWidgetAriaLabel() {
            return (0, nls_1.localize)('quickInput', "Quick Input");
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicXVpY2tJbnB1dExpc3QuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9wbGF0Zm9ybS9xdWlja2lucHV0L2Jyb3dzZXIvcXVpY2tJbnB1dExpc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7O0lBb0NoRyxNQUFNLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDO0lBMkJoQixNQUFNLFdBQVc7UUF3QmhCLFlBQ0MsUUFBdUIsRUFDdkIsUUFBbUMsRUFDbkMsS0FBYSxFQUNiLFdBQW9CLEVBQ3BCLG1CQUErRSxFQUMvRSw0QkFBNkUsRUFDN0UsZ0JBQTBFO1lBbkIzRSwrQkFBK0I7WUFDdkIsYUFBUSxHQUFZLEtBQUssQ0FBQztZQUMxQixZQUFPLEdBQVksS0FBSyxDQUFDO1lBbUJoQyxJQUFJLENBQUMsV0FBVyxHQUFHLFdBQVcsQ0FBQztZQUMvQixJQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQztZQUNuQixJQUFJLENBQUMsbUJBQW1CLEdBQUcsbUJBQW1CLENBQUM7WUFDL0MsSUFBSSxDQUFDLDRCQUE0QixHQUFHLDRCQUE0QixDQUFDO1lBQ2pFLElBQUksQ0FBQyxVQUFVLEdBQUcsZ0JBQWdCLENBQUM7WUFDbkMsSUFBSSxDQUFDLFNBQVMsR0FBRyxXQUFXO2dCQUMzQixDQUFDLENBQUMsYUFBSyxDQUFDLEdBQUcsQ0FBQyxhQUFLLENBQUMsTUFBTSxDQUFrRCxJQUFJLENBQUMsVUFBVSxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxXQUFXLEtBQUssSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDO2dCQUM5SSxDQUFDLENBQUMsYUFBSyxDQUFDLElBQUksQ0FBQztZQUVkLElBQUksUUFBUSxDQUFDLElBQUksS0FBSyxXQUFXLEVBQUU7Z0JBQ2xD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