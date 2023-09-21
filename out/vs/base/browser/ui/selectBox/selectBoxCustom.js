/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/event", "vs/base/browser/keyboardEvent", "vs/base/browser/markdownRenderer", "vs/base/browser/ui/list/listWidget", "vs/base/common/arrays", "vs/base/common/event", "vs/base/common/keyCodes", "vs/base/common/lifecycle", "vs/base/common/platform", "vs/nls", "vs/css!./selectBoxCustom"], function (require, exports, dom, event_1, keyboardEvent_1, markdownRenderer_1, listWidget_1, arrays, event_2, keyCodes_1, lifecycle_1, platform_1, nls_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SelectBoxList = void 0;
    const $ = dom.$;
    const SELECT_OPTION_ENTRY_TEMPLATE_ID = 'selectOption.entry.template';
    class SelectListRenderer {
        get templateId() { return SELECT_OPTION_ENTRY_TEMPLATE_ID; }
        renderTemplate(container) {
            const data = Object.create(null);
            data.root = container;
            data.text = dom.append(container, $('.option-text'));
            data.detail = dom.append(container, $('.option-detail'));
            data.decoratorRight = dom.append(container, $('.option-decorator-right'));
            return data;
        }
        renderElement(element, index, templateData) {
            const data = templateData;
            const text = element.text;
            const detail = element.detail;
            const decoratorRight = element.decoratorRight;
            const isDisabled = element.isDisabled;
            data.text.textContent = text;
            data.detail.textContent = !!detail ? detail : '';
            data.decoratorRight.innerText = !!decoratorRight ? decoratorRight : '';
            // pseudo-select disabled option
            if (isDisabled) {
                data.root.classList.add('option-disabled');
            }
            else {
                // Make sure we do class removal from prior template rendering
                data.root.classList.remove('option-disabled');
            }
        }
        disposeTemplate(_templateData) {
            // noop
        }
    }
    class SelectBoxList extends lifecycle_1.Disposable {
        static { this.DEFAULT_DROPDOWN_MINIMUM_BOTTOM_MARGIN = 32; }
        static { this.DEFAULT_DROPDOWN_MINIMUM_TOP_MARGIN = 2; }
        static { this.DEFAULT_MINIMUM_VISIBLE_OPTIONS = 3; }
        constructor(options, selected, contextViewProvider, styles, selectBoxOptions) {
            super();
            this.options = [];
            this._currentSelection = 0;
            this._hasDetails = false;
            this._skipLayout = false;
            this._sticky = false; // for dev purposes only
            this._isVisible = false;
            this.styles = styles;
            this.selectBoxOptions = selectBoxOptions || Object.create(null);
            if (typeof this.selectBoxOptions.minBottomMargin !== 'number') {
                this.selectBoxOptions.minBottomMargin = SelectBoxList.DEFAULT_DROPDOWN_MINIMUM_BOTTOM_MARGIN;
            }
            else if (this.selectBoxOptions.minBottomMargin < 0) {
                this.selectBoxOptions.minBottomMargin = 0;
            }
            this.selectElement = document.createElement('select');
            // Use custom CSS vars for padding calculation
            this.selectElement.className = 'monaco-select-box monaco-select-box-dropdown-padding';
            if (typeof this.selectBoxOptions.ariaLabel === 'string') {
                this.selectElement.setAttribute('aria-label', this.selectBoxOptions.ariaLabel);
            }
            if (typeof this.selectBoxOptions.ariaDescription === 'string') {
                this.selectElement.setAttribute('aria-description', this.selectBoxOptions.ariaDescription);
            }
            this._onDidSelect = new event_2.Emitter();
            this._register(this._onDidSelect);
            this.registerListeners();
            this.constructSelectDropDown(contextViewProvider);
            this.selected = selected || 0;
            if (options) {
                this.setOptions(options, selected);
            }
            this.initStyleSheet();
        }
        // IDelegate - List renderer
        getHeight() {
            return 22;
        }
        getTemplateId() {
            return SELECT_OPTION_ENTRY_TEMPLATE_ID;
        }
        constructSelectDropDown(contextViewProvider) {
            // SetUp ContextView container to hold select Dropdown
            this.contextViewProvider = contextViewProvider;
            this.selectDropDownContainer = dom.$('.monaco-select-box-dropdown-container');
            // Use custom CSS vars for padding calculation (shared with parent select)
            this.selectDropDownContainer.classList.add('monaco-select-box-dropdown-padding');
            // Setup container for select option details
            this.selectionDetailsPane = dom.append(this.selectDropDownContainer, $('.select-box-details-pane'));
            // Create span flex box item/div we can measure and control
            const widthControlOuterDiv = dom.append(this.selectDropDownContainer, $('.select-box-dropdown-container-width-control'));
            const widthControlInnerDiv = dom.append(widthControlOuterDiv, $('.width-control-div'));
            this.widthControlElement = document.createElement('span');
            this.widthControlElement.className = 'option-text-width-control';
            dom.append(widthControlInnerDiv, this.widthControlElement);
            // Always default to below position
            this._dropDownPosition = 0 /* AnchorPosition.BELOW */;
            // Inline stylesheet for themes
            this.styleElement = dom.createStyleSheet(this.selectDropDownContainer);
            // Prevent dragging of dropdown #114329
            this.selectDropDownContainer.setAttribute('draggable', 'true');
            this._register(dom.addDisposableListener(this.selectDropDownContainer, dom.EventType.DRAG_START, (e) => {
                dom.EventHelper.stop(e, true);
            }));
        }
        registerListeners() {
            // Parent native select keyboard listeners
            this._register(dom.addStandardDisposableListener(this.selectElement, 'change', (e) => {
                this.selected = e.target.selectedIndex;
                this._onDidSelect.fire({
                    index: e.target.selectedIndex,
                    selected: e.target.value
                });
                if (!!this.options[this.selected] && !!this.options[this.selected].text) {
                    this.selectElement.title = this.options[this.selected].text;
                }
            }));
            // Have to implement both keyboard and mouse controllers to handle disabled options
            // Intercept mouse events to override normal select actions on parents
            this._register(dom.addDisposableListener(this.selectElement, dom.EventType.CLICK, (e) => {
                dom.EventHelper.stop(e);
                if (this._isVisible) {
                    this.hideSelectDropDown(true);
                }
                else {
                    this.showSelectDropDown();
                }
            }));
            this._register(dom.addDisposableListener(this.selectElement, dom.EventType.MOUSE_DOWN, (e) => {
                dom.EventHelper.stop(e);
            }));
            // Intercept touch events
            // The following implementation is slightly different from the mouse event handlers above.
            // Use the following helper variable, otherwise the list flickers.
            let listIsVisibleOnTouchStart;
            this._register(dom.addDisposableListener(this.selectElement, 'touchstart', (e) => {
                listIsVisibleOnTouchStart = this._isVisible;
            }));
            this._register(dom.addDisposableListener(this.selectElement, 'touchend', (e) => {
                dom.EventHelper.stop(e);
                if (listIsVisibleOnTouchStart) {
                    this.hideSelectDropDown(true);
                }
                else {
                    this.showSelectDropDown();
                }
            }));
            // Intercept keyboard handling
            this._register(dom.addDisposableListener(this.selectElement, dom.EventType.KEY_DOWN, (e) => {
                const event = new keyboardEvent_1.StandardKeyboardEvent(e);
                let showDropDown = false;
                // Create and drop down select list on keyboard select
                if (platform_1.isMacintosh) {
                    if (event.keyCode === 18 /* KeyCode.DownArrow */ || event.keyCode === 16 /* KeyCode.UpArrow */ || event.keyCode === 10 /* KeyCode.Space */ || event.keyCode === 3 /* KeyCode.Enter */) {
                        showDropDown = true;
                    }
                }
                else {
                    if (event.keyCode === 18 /* KeyCode.DownArrow */ && event.altKey || event.keyCode === 16 /* KeyCode.UpArrow */ && event.altKey || event.keyCode === 10 /* KeyCode.Space */ || event.keyCode === 3 /* KeyCode.Enter */) {
                        showDropDown = true;
                    }
                }
                if (showDropDown) {
                    this.showSelectDropDown();
                    dom.EventHelper.stop(e, true);
                }
            }));
        }
        get onDidSelect() {
            return this._onDidSelect.event;
        }
        setOptions(options, selected) {
            if (!arrays.equals(this.options, options)) {
                this.options = options;
                this.selectElement.options.length = 0;
                this._hasDetails = false;
                this._cachedMaxDetailsHeight = undefined;
                this.options.forEach((option, index) => {
                    this.selectElement.add(this.createOption(option.text, index, option.isDisabled));
                    if (typeof option.description === 'string') {
                        this._hasDetails = true;
                    }
                });
            }
            if (selected !== undefined) {
                this.select(selected);
                // Set current = selected since this is not necessarily a user exit
                this._currentSelection = this.selected;
            }
        }
        setOptionsList() {
            // Mirror options in drop-down
            // Populate select list for non-native select mode
            this.selectList?.splice(0, this.selectList.length, this.options);
        }
        select(index) {
            if (index >= 0 && index < this.options.length) {
                this.selected = index;
            }
            else if (index > this.options.length - 1) {
                // Adjust index to end of list
                // This could make client out of sync with the select
                this.select(this.options.length - 1);
            }
            else if (this.selected < 0) {
                this.selected = 0;
            }
            this.selectElement.selectedIndex = this.selected;
            if (!!this.options[this.selected] && !!this.options[this.selected].text) {
                this.selectElement.title = this.options[this.selected].text;
            }
        }
        setAriaLabel(label) {
            this.selectBoxOptions.ariaLabel = label;
            this.selectElement.setAttribute('aria-label', this.selectBoxOptions.ariaLabel);
        }
        focus() {
            if (this.selectElement) {
                this.selectElement.tabIndex = 0;
                this.selectElement.focus();
            }
        }
        blur() {
            if (this.selectElement) {
                this.selectElement.tabIndex = -1;
                this.selectElement.blur();
            }
        }
        setFocusable(focusable) {
            this.selectElement.tabIndex = focusable ? 0 : -1;
        }
        render(container) {
            this.container = container;
            container.classList.add('select-container');
            container.appendChild(this.selectElement);
            this.styleSelectElement();
        }
        initStyleSheet() {
            const content = [];
            // Style non-native select mode
            if (this.styles.listFocusBackground) {
                content.push(`.monaco-select-box-dropdown-container > .select-box-dropdown-list-container .monaco-list .monaco-list-row.focused { background-color: ${this.styles.listFocusBackground} !important; }`);
            }
            if (this.styles.listFocusForeground) {
                content.push(`.monaco-select-box-dropdown-container > .select-box-dropdown-list-container .monaco-list .monaco-list-row.focused { color: ${this.styles.listFocusForeground} !important; }`);
            }
            if (this.styles.decoratorRightForeground) {
                content.push(`.monaco-select-box-dropdown-container > .select-box-dropdown-list-container .monaco-list .monaco-list-row:not(.focused) .option-decorator-right { color: ${this.styles.decoratorRightForeground}; }`);
            }
            if (this.styles.selectBackground && this.styles.selectBorder && this.styles.selectBorder !== this.styles.selectBackground) {
                content.push(`.monaco-select-box-dropdown-container { border: 1px solid ${this.styles.selectBorder} } `);
                content.push(`.monaco-select-box-dropdown-container > .select-box-details-pane.border-top { border-top: 1px solid ${this.styles.selectBorder} } `);
                content.push(`.monaco-select-box-dropdown-container > .select-box-details-pane.border-bottom { border-bottom: 1px solid ${this.styles.selectBorder} } `);
            }
            else if (this.styles.selectListBorder) {
                content.push(`.monaco-select-box-dropdown-container > .select-box-details-pane.border-top { border-top: 1px solid ${this.styles.selectListBorder} } `);
                content.push(`.monaco-select-box-dropdown-container > .select-box-details-pane.border-bottom { border-bottom: 1px solid ${this.styles.selectListBorder} } `);
            }
            // Hover foreground - ignore for disabled options
            if (this.styles.listHoverForeground) {
                content.push(`.monaco-select-box-dropdown-container > .select-box-dropdown-list-container .monaco-list .monaco-list-row:not(.option-disabled):not(.focused):hover { color: ${this.styles.listHoverForeground} !important; }`);
            }
            // Hover background - ignore for disabled options
            if (this.styles.listHoverBackground) {
                content.push(`.monaco-select-box-dropdown-container > .select-box-dropdown-list-container .monaco-list .monaco-list-row:not(.option-disabled):not(.focused):hover { background-color: ${this.styles.listHoverBackground} !important; }`);
            }
            // Match quick input outline styles - ignore for disabled options
            if (this.styles.listFocusOutline) {
                content.push(`.monaco-select-box-dropdown-container > .select-box-dropdown-list-container .monaco-list .monaco-list-row.focused { outline: 1.6px dotted ${this.styles.listFocusOutline} !important; outline-offset: -1.6px !important; }`);
            }
            if (this.styles.listHoverOutline) {
                content.push(`.monaco-select-box-dropdown-container > .select-box-dropdown-list-container .monaco-list .monaco-list-row:not(.option-disabled):not(.focused):hover { outline: 1.6px dashed ${this.styles.listHoverOutline} !important; outline-offset: -1.6px !important; }`);
            }
            // Clear list styles on focus and on hover for disabled options
            content.push(`.monaco-select-box-dropdown-container > .select-box-dropdown-list-container .monaco-list .monaco-list-row.option-disabled.focused { background-color: transparent !important; color: inherit !important; outline: none !important; }`);
            content.push(`.monaco-select-box-dropdown-container > .select-box-dropdown-list-container .monaco-list .monaco-list-row.option-disabled:hover { background-color: transparent !important; color: inherit !important; outline: none !important; }`);
            this.styleElement.textContent = content.join('\n');
        }
        styleSelectElement() {
            const background = this.styles.selectBackground ?? '';
            const foreground = this.styles.selectForeground ?? '';
            const border = this.styles.selectBorder ?? '';
            this.selectElement.style.backgroundColor = background;
            this.selectElement.style.color = foreground;
            this.selectElement.style.borderColor = border;
        }
        styleList() {
            const background = this.styles.selectBackground ?? '';
            const listBackground = dom.asCssValueWithDefault(this.styles.selectListBackground, background);
            this.selectDropDownListContainer.style.backgroundColor = listBackground;
            this.selectionDetailsPane.style.backgroundColor = listBackground;
            const optionsBorder = this.styles.focusBorder ?? '';
            this.selectDropDownContainer.style.outlineColor = optionsBorder;
            this.selectDropDownContainer.style.outlineOffset = '-1px';
            this.selectList.style(this.styles);
        }
        createOption(value, index, disabled) {
            const option = document.createElement('option');
            option.value = value;
            option.text = value;
            option.disabled = !!disabled;
            return option;
        }
        // ContextView dropdown methods
        showSelectDropDown() {
            this.selectionDetailsPane.innerText = '';
            if (!this.contextViewProvider || this._isVisible) {
                return;
            }
            // Lazily create and populate list only at open, moved from constructor
            this.createSelectList(this.selectDropDownContainer);
            this.setOptionsList();
            // This allows us to flip the position based on measurement
            // Set drop-down position above/below from required height and margins
            // If pre-layout cannot fit at least one option do not show drop-down
            this.contextViewProvider.showContextView({
                getAnchor: () => this.selectElement,
                render: (container) => this.renderSelectDropDown(container, true),
                layout: () => {
                    this.layoutSelectDropDown();
                },
                onHide: () => {
                    this.selectDropDownContainer.classList.remove('visible');
                    this.selectElement.classList.remove('synthetic-focus');
                },
                anchorPosition: this._dropDownPosition
            }, this.selectBoxOptions.optionsAsChildren ? this.container : undefined);
            // Hide so we can relay out
            this._isVisible = true;
            this.hideSelectDropDown(false);
            this.contextViewProvider.showContextView({
                getAnchor: () => this.selectElement,
                render: (container) => this.renderSelectDropDown(container),
                layout: () => this.layoutSelectDropDown(),
                onHide: () => {
                    this.selectDropDownContainer.classList.remove('visible');
                    this.selectElement.classList.remove('synthetic-focus');
                },
                anchorPosition: this._dropDownPosition
            }, this.selectBoxOptions.optionsAsChildren ? this.container : undefined);
            // Track initial selection the case user escape, blur
            this._currentSelection = this.selected;
            this._isVisible = true;
            this.selectElement.setAttribute('aria-expanded', 'true');
        }
        hideSelectDropDown(focusSelect) {
            if (!this.contextViewProvider || !this._isVisible) {
                return;
            }
            this._isVisible = false;
            this.selectElement.setAttribute('aria-expanded', 'false');
            if (focusSelect) {
                this.selectElement.focus();
            }
            this.contextViewProvider.hideContextView();
        }
        renderSelectDropDown(container, preLayoutPosition) {
            container.appendChild(this.selectDropDownContainer);
            // Pre-Layout allows us to change position
            this.layoutSelectDropDown(preLayoutPosition);
            return {
                dispose: () => {
                    // contextView will dispose itself if moving from one View to another
                    try {
                        container.removeChild(this.selectDropDownContainer); // remove to take out the CSS rules we add
                    }
                    catch (error) {
                        // Ignore, removed already by change of focus
                    }
                }
            };
        }
        // Iterate over detailed descriptions, find max height
        measureMaxDetailsHeight() {
            let maxDetailsPaneHeight = 0;
            this.options.forEach((_option, index) => {
                this.updateDetail(index);
                if (this.selectionDetailsPane.offsetHeight > maxDetailsPaneHeight) {
                    maxDetailsPaneHeight = this.selectionDetailsPane.offsetHeight;
                }
            });
            return maxDetailsPaneHeight;
        }
        layoutSelectDropDown(preLayoutPosition) {
            // Avoid recursion from layout called in onListFocus
            if (this._skipLayout) {
                return false;
            }
            // Layout ContextView drop down select list and container
            // Have to manage our vertical overflow, sizing, position below or above
            // Position has to be determined and set prior to contextView instantiation
            if (this.selectList) {
                // Make visible to enable measurements
                this.selectDropDownContainer.classList.add('visible');
                const selectPosition = dom.getDomNodePagePosition(this.selectElement);
                const styles = getComputedStyle(this.selectElement);
                const verticalPadding = parseFloat(styles.getPropertyValue('--dropdown-padding-top')) + parseFloat(styles.getPropertyValue('--dropdown-padding-bottom'));
                const maxSelectDropDownHeightBelow = (window.innerHeight - selectPosition.top - selectPosition.height - (this.selectBoxOptions.minBottomMargin || 0));
                const maxSelectDropDownHeightAbove = (selectPosition.top - SelectBoxList.DEFAULT_DROPDOWN_MINIMUM_TOP_MARGIN);
                // Determine optimal width - min(longest option), opt(parent select, excluding margins), max(ContextView controlled)
                const selectWidth = this.selectElement.offsetWidth;
                const selectMinWidth = this.setWidthControlElement(this.widthControlElement);
                const selectOptimalWidth = Math.max(selectMinWidth, Math.round(selectWidth)).toString() + 'px';
                this.selectDropDownContainer.style.width = selectOptimalWidth;
                // Get initial list height and determine space above and below
                this.selectList.getHTMLElement().style.height = '';
                this.selectList.layout();
                let listHeight = this.selectList.contentHeight;
                if (this._hasDetails && this._cachedMaxDetailsHeight === undefined) {
                    this._cachedMaxDetailsHeight = this.measureMaxDetailsHeight();
                }
                const maxDetailsPaneHeight = this._hasDetails ? this._cachedMaxDetailsHeight : 0;
                const minRequiredDropDownHeight = listHeight + verticalPadding + maxDetailsPaneHeight;
                const maxVisibleOptionsBelow = ((Math.floor((maxSelectDropDownHeightBelow - verticalPadding - maxDetailsPaneHeight) / this.getHeight())));
                const maxVisibleOptionsAbove = ((Math.floor((maxSelectDropDownHeightAbove - verticalPadding - maxDetailsPaneHeight) / this.getHeight())));
                // If we are only doing pre-layout check/adjust position only
                // Calculate vertical space available, flip up if insufficient
                // Use reflected padding on parent select, ContextView style
                // properties not available before DOM attachment
                if (preLayoutPosition) {
                    // Check if select moved out of viewport , do not open
                    // If at least one option cannot be shown, don't open the drop-down or hide/remove if open
                    if ((selectPosition.top + selectPosition.height) > (window.innerHeight - 22)
                        || selectPosition.top < SelectBoxList.DEFAULT_DROPDOWN_MINIMUM_TOP_MARGIN
                        || ((maxVisibleOptionsBelow < 1) && (maxVisibleOptionsAbove < 1))) {
                        // Indicate we cannot open
                        return false;
                    }
                    // Determine if we have to flip up
                    // Always show complete list items - never more than Max available vertical height
                    if (maxVisibleOptionsBelow < SelectBoxList.DEFAULT_MINIMUM_VISIBLE_OPTIONS
                        && maxVisibleOptionsAbove > maxVisibleOptionsBelow
                        && this.options.length > maxVisibleOptionsBelow) {
                        this._dropDownPosition = 1 /* AnchorPosition.ABOVE */;
                        this.selectDropDownContainer.removeChild(this.selectDropDownListContainer);
                        this.selectDropDownContainer.removeChild(this.selectionDetailsPane);
                        this.selectDropDownContainer.appendChild(this.selectionDetailsPane);
                        this.selectDropDownContainer.appendChild(this.selectDropDownListContainer);
                        this.selectionDetailsPane.classList.remove('border-top');
                        this.selectionDetailsPane.classList.add('border-bottom');
                    }
                    else {
                        this._dropDownPosition = 0 /* AnchorPosition.BELOW */;
                        this.selectDropDownContainer.removeChild(this.selectDropDownListContainer);
                        this.selectDropDownContainer.removeChild(this.selectionDetailsPane);
                        this.selectDropDownContainer.appendChild(this.selectDropDownListContainer);
                        this.selectDropDownContainer.appendChild(this.selectionDetailsPane);
                        this.selectionDetailsPane.classList.remove('border-bottom');
                        this.selectionDetailsPane.classList.add('border-top');
                    }
                    // Do full layout on showSelectDropDown only
                    return true;
                }
                // Check if select out of viewport or cutting into status bar
                if ((selectPosition.top + selectPosition.height) > (window.innerHeight - 22)
                    || selectPosition.top < SelectBoxList.DEFAULT_DROPDOWN_MINIMUM_TOP_MARGIN
                    || (this._dropDownPosition === 0 /* AnchorPosition.BELOW */ && maxVisibleOptionsBelow < 1)
                    || (this._dropDownPosition === 1 /* AnchorPosition.ABOVE */ && maxVisibleOptionsAbove < 1)) {
                    // Cannot properly layout, close and hide
                    this.hideSelectDropDown(true);
                    return false;
                }
                // SetUp list dimensions and layout - account for container padding
                // Use position to check above or below available space
                if (this._dropDownPosition === 0 /* AnchorPosition.BELOW */) {
                    if (this._isVisible && maxVisibleOptionsBelow + maxVisibleOptionsAbove < 1) {
                        // If drop-down is visible, must be doing a DOM re-layout, hide since we don't fit
                        // Hide drop-down, hide contextview, focus on parent select
                        this.hideSelectDropDown(true);
                        return false;
                    }
                    // Adjust list height to max from select bottom to margin (default/minBottomMargin)
                    if (minRequiredDropDownHeight > maxSelectDropDownHeightBelow) {
                        listHeight = (maxVisibleOptionsBelow * this.getHeight());
                    }
                }
                else {
                    if (minRequiredDropDownHeight > maxSelectDropDownHeightAbove) {
                        listHeight = (maxVisibleOptionsAbove * this.getHeight());
                    }
                }
                // Set adjusted list height and relayout
                this.selectList.layout(listHeight);
                this.selectList.domFocus();
                // Finally set focus on selected item
                if (this.selectList.length > 0) {
                    this.selectList.setFocus([this.selected || 0]);
                    this.selectList.reveal(this.selectList.getFocus()[0] || 0);
                }
                if (this._hasDetails) {
                    // Leave the selectDropDownContainer to size itself according to children (list + details) - #57447
                    this.selectList.getHTMLElement().style.height = (listHeight + verticalPadding) + 'px';
                    this.selectDropDownContainer.style.height = '';
                }
                else {
                    this.selectDropDownContainer.style.height = (listHeight + verticalPadding) + 'px';
                }
                this.updateDetail(this.selected);
                this.selectDropDownContainer.style.width = selectOptimalWidth;
                // Maintain focus outline on parent select as well as list container - tabindex for focus
                this.selectDropDownListContainer.setAttribute('tabindex', '0');
                this.selectElement.classList.add('synthetic-focus');
                this.selectDropDownContainer.classList.add('synthetic-focus');
                return true;
            }
            else {
                return false;
            }
        }
        setWidthControlElement(container) {
            let elementWidth = 0;
            if (container) {
                let longest = 0;
                let longestLength = 0;
                this.options.forEach((option, index) => {
                    const detailLength = !!option.detail ? option.detail.length : 0;
                    const rightDecoratorLength = !!option.decoratorRight ? option.decoratorRight.length : 0;
                    const len = option.text.length + detailLength + rightDecoratorLength;
                    if (len > longestLength) {
                        longest = index;
                        longestLength = len;
                    }
                });
                container.textContent = this.options[longest].text + (!!this.options[longest].decoratorRight ? (this.options[longest].decoratorRight + ' ') : '');
                elementWidth = dom.getTotalWidth(container);
            }
            return elementWidth;
        }
        createSelectList(parent) {
            // If we have already constructive list on open, skip
            if (this.selectList) {
                return;
            }
            // SetUp container for list
            this.selectDropDownListContainer = dom.append(parent, $('.select-box-dropdown-list-container'));
            this.listRenderer = new SelectListRenderer();
            this.selectList = new listWidget_1.List('SelectBoxCustom', this.selectDropDownListContainer, this, [this.listRenderer], {
                useShadows: false,
                verticalScrollMode: 3 /* ScrollbarVisibility.Visible */,
                keyboardSupport: false,
                mouseSupport: false,
                accessibilityProvider: {
                    getAriaLabel: element => {
                        let label = element.text;
                        if (element.detail) {
                            label += `. ${element.detail}`;
                        }
                        if (element.decoratorRight) {
                            label += `. ${element.decoratorRight}`;
                        }
                        if (element.description) {
                            label += `. ${element.description}`;
                        }
                        return label;
                    },
                    getWidgetAriaLabel: () => (0, nls_1.localize)({ key: 'selectBox', comment: ['Behave like native select dropdown element.'] }, "Select Box"),
                    getRole: () => platform_1.isMacintosh ? '' : 'option',
                    getWidgetRole: () => 'listbox'
                }
            });
            if (this.selectBoxOptions.ariaLabel) {
                this.selectList.ariaLabel = this.selectBoxOptions.ariaLabel;
            }
            // SetUp list keyboard controller - control navigation, disabled items, focus
            const onKeyDown = this._register(new event_1.DomEmitter(this.selectDropDownListContainer, 'keydown'));
            const onSelectDropDownKeyDown = event_2.Event.chain(onKeyDown.event, $ => $.filter(() => this.selectList.length > 0)
                .map(e => new keyboardEvent_1.StandardKeyboardEvent(e)));
            this._register(event_2.Event.chain(onSelectDropDownKeyDown, $ => $.filter(e => e.keyCode === 3 /* KeyCode.Enter */))(this.onEnter, this));
            this._register(event_2.Event.chain(onSelectDropDownKeyDown, $ => $.filter(e => e.keyCode === 2 /* KeyCode.Tab */))(this.onEnter, this)); // Tab should behave the same as enter, #79339
            this._register(event_2.Event.chain(onSelectDropDownKeyDown, $ => $.filter(e => e.keyCode === 9 /* KeyCode.Escape */))(this.onEscape, this));
            this._register(event_2.Event.chain(onSelectDropDownKeyDown, $ => $.filter(e => e.keyCode === 16 /* KeyCode.UpArrow */))(this.onUpArrow, this));
            this._register(event_2.Event.chain(onSelectDropDownKeyDown, $ => $.filter(e => e.keyCode === 18 /* KeyCode.DownArrow */))(this.onDownArrow, this));
            this._register(event_2.Event.chain(onSelectDropDownKeyDown, $ => $.filter(e => e.keyCode === 12 /* KeyCode.PageDown */))(this.onPageDown, this));
            this._register(event_2.Event.chain(onSelectDropDownKeyDown, $ => $.filter(e => e.keyCode === 11 /* KeyCode.PageUp */))(this.onPageUp, this));
            this._register(event_2.Event.chain(onSelectDropDownKeyDown, $ => $.filter(e => e.keyCode === 14 /* KeyCode.Home */))(this.onHome, this));
            this._register(event_2.Event.chain(onSelectDropDownKeyDown, $ => $.filter(e => e.keyCode === 13 /* KeyCode.End */))(this.onEnd, this));
            this._register(event_2.Event.chain(onSelectDropDownKeyDown, $ => $.filter(e => (e.keyCode >= 21 /* KeyCode.Digit0 */ && e.keyCode <= 56 /* KeyCode.KeyZ */) || (e.keyCode >= 85 /* KeyCode.Semicolon */ && e.keyCode <= 113 /* KeyCode.NumpadDivide */)))(this.onCharacter, this));
            // SetUp list mouse controller - control navigation, disabled items, focus
            this._register(dom.addDisposableListener(this.selectList.getHTMLElement(), dom.EventType.POINTER_UP, e => this.onPointerUp(e)));
            this._register(this.selectList.onMouseOver(e => typeof e.index !== 'undefined' && this.selectList.setFocus([e.index])));
            this._register(this.selectList.onDidChangeFocus(e => this.onListFocus(e)));
            this._register(dom.addDisposableListener(this.selectDropDownContainer, dom.EventType.FOCUS_OUT, e => {
                if (!this._isVisible || dom.isAncestor(e.relatedTarget, this.selectDropDownContainer)) {
                    return;
                }
                this.onListBlur();
            }));
            this.selectList.getHTMLElement().setAttribute('aria-label', this.selectBoxOptions.ariaLabel || '');
            this.selectList.getHTMLElement().setAttribute('aria-expanded', 'true');
            this.styleList();
        }
        // List methods
        // List mouse controller - active exit, select option, fire onDidSelect if change, return focus to parent select
        // Also takes in touchend events
        onPointerUp(e) {
            if (!this.selectList.length) {
                return;
            }
            dom.EventHelper.stop(e);
            const target = e.target;
            if (!target) {
                return;
            }
            // Check our mouse event is on an option (not scrollbar)
            if (target.classList.contains('slider')) {
                return;
            }
            const listRowElement = target.closest('.monaco-list-row');
            if (!listRowElement) {
                return;
            }
            const index = Number(listRowElement.getAttribute('data-index'));
            const disabled = listRowElement.classList.contains('option-disabled');
            // Ignore mouse selection of disabled options
            if (index >= 0 && index < this.options.length && !disabled) {
                this.selected = index;
                this.select(this.selected);
                this.selectList.setFocus([this.selected]);
                this.selectList.reveal(this.selectList.getFocus()[0]);
                // Only fire if selection change
                if (this.selected !== this._currentSelection) {
                    // Set current = selected
                    this._currentSelection = this.selected;
                    this._onDidSelect.fire({
                        index: this.selectElement.selectedIndex,
                        selected: this.options[this.selected].text
                    });
                    if (!!this.options[this.selected] && !!this.options[this.selected].text) {
                        this.selectElement.title = this.options[this.selected].text;
                    }
                }
                this.hideSelectDropDown(true);
            }
        }
        // List Exit - passive - implicit no selection change, hide drop-down
        onListBlur() {
            if (this._sticky) {
                return;
            }
            if (this.selected !== this._currentSelection) {
                // Reset selected to current if no change
                this.select(this._currentSelection);
            }
            this.hideSelectDropDown(false);
        }
        renderDescriptionMarkdown(text, actionHandler) {
            const cleanRenderedMarkdown = (element) => {
                for (let i = 0; i < element.childNodes.length; i++) {
                    const child = element.childNodes.item(i);
                    const tagName = child.tagName && child.tagName.toLowerCase();
                    if (tagName === 'img') {
                        element.removeChild(child);
                    }
                    else {
                        cleanRenderedMarkdown(child);
                    }
                }
            };
            const rendered = (0, markdownRenderer_1.renderMarkdown)({ value: text, supportThemeIcons: true }, { actionHandler });
            rendered.element.classList.add('select-box-description-markdown');
            cleanRenderedMarkdown(rendered.element);
            return rendered.element;
        }
        // List Focus Change - passive - update details pane with newly focused element's data
        onListFocus(e) {
            // Skip during initial layout
            if (!this._isVisible || !this._hasDetails) {
                return;
            }
            this.updateDetail(e.indexes[0]);
        }
        updateDetail(selectedIndex) {
            this.selectionDetailsPane.innerText = '';
            const option = this.options[selectedIndex];
            const description = option?.description ?? '';
            const descriptionIsMarkdown = option?.descriptionIsMarkdown ?? false;
            if (description) {
                if (descriptionIsMarkdown) {
                    const actionHandler = option.descriptionMarkdownActionHandler;
                    this.selectionDetailsPane.appendChild(this.renderDescriptionMarkdown(description, actionHandler));
                }
                else {
                    this.selectionDetailsPane.innerText = description;
                }
                this.selectionDetailsPane.style.display = 'block';
            }
            else {
                this.selectionDetailsPane.style.display = 'none';
            }
            // Avoid recursion
            this._skipLayout = true;
            this.contextViewProvider.layout();
            this._skipLayout = false;
        }
        // List keyboard controller
        // List exit - active - hide ContextView dropdown, reset selection, return focus to parent select
        onEscape(e) {
            dom.EventHelper.stop(e);
            // Reset selection to value when opened
            this.select(this._currentSelection);
            this.hideSelectDropDown(true);
        }
        // List exit - active - hide ContextView dropdown, return focus to parent select, fire onDidSelect if change
        onEnter(e) {
            dom.EventHelper.stop(e);
            // Only fire if selection change
            if (this.selected !== this._currentSelection) {
                this._currentSelection = this.selected;
                this._onDidSelect.fire({
                    index: this.selectElement.selectedIndex,
                    selected: this.options[this.selected].text
                });
                if (!!this.options[this.selected] && !!this.options[this.selected].text) {
                    this.selectElement.title = this.options[this.selected].text;
                }
            }
            this.hideSelectDropDown(true);
        }
        // List navigation - have to handle a disabled option (jump over)
        onDownArrow(e) {
            if (this.selected < this.options.length - 1) {
                dom.EventHelper.stop(e, true);
                // Skip disabled options
                const nextOptionDisabled = this.options[this.selected + 1].isDisabled;
                if (nextOptionDisabled && this.options.length > this.selected + 2) {
                    this.selected += 2;
                }
                else if (nextOptionDisabled) {
                    return;
                }
                else {
                    this.selected++;
                }
                // Set focus/selection - only fire event when closing drop-down or on blur
                this.select(this.selected);
                this.selectList.setFocus([this.selected]);
                this.selectList.reveal(this.selectList.getFocus()[0]);
            }
        }
        onUpArrow(e) {
            if (this.selected > 0) {
                dom.EventHelper.stop(e, true);
                // Skip disabled options
                const previousOptionDisabled = this.options[this.selected - 1].isDisabled;
                if (previousOptionDisabled && this.selected > 1) {
                    this.selected -= 2;
                }
                else {
                    this.selected--;
                }
                // Set focus/selection - only fire event when closing drop-down or on blur
                this.select(this.selected);
                this.selectList.setFocus([this.selected]);
                this.selectList.reveal(this.selectList.getFocus()[0]);
            }
        }
        onPageUp(e) {
            dom.EventHelper.stop(e);
            this.selectList.focusPreviousPage();
            // Allow scrolling to settle
            setTimeout(() => {
                this.selected = this.selectList.getFocus()[0];
                // Shift selection down if we land on a disabled option
                if (this.options[this.selected].isDisabled && this.selected < this.options.length - 1) {
                    this.selected++;
                    this.selectList.setFocus([this.selected]);
                }
                this.selectList.reveal(this.selected);
                this.select(this.selected);
            }, 1);
        }
        onPageDown(e) {
            dom.EventHelper.stop(e);
            this.selectList.focusNextPage();
            // Allow scrolling to settle
            setTimeout(() => {
                this.selected = this.selectList.getFocus()[0];
                // Shift selection up if we land on a disabled option
                if (this.options[this.selected].isDisabled && this.selected > 0) {
                    this.selected--;
                    this.selectList.setFocus([this.selected]);
                }
                this.selectList.reveal(this.selected);
                this.select(this.selected);
            }, 1);
        }
        onHome(e) {
            dom.EventHelper.stop(e);
            if (this.options.length < 2) {
                return;
            }
            this.selected = 0;
            if (this.options[this.selected].isDisabled && this.selected > 1) {
                this.selected++;
            }
            this.selectList.setFocus([this.selected]);
            this.selectList.reveal(this.selected);
            this.select(this.selected);
        }
        onEnd(e) {
            dom.EventHelper.stop(e);
            if (this.options.length < 2) {
                return;
            }
            this.selected = this.options.length - 1;
            if (this.options[this.selected].isDisabled && this.selected > 1) {
                this.selected--;
            }
            this.selectList.setFocus([this.selected]);
            this.selectList.reveal(this.selected);
            this.select(this.selected);
        }
        // Mimic option first character navigation of native select
        onCharacter(e) {
            const ch = keyCodes_1.KeyCodeUtils.toString(e.keyCode);
            let optionIndex = -1;
            for (let i = 0; i < this.options.length - 1; i++) {
                optionIndex = (i + this.selected + 1) % this.options.length;
                if (this.options[optionIndex].text.charAt(0).toUpperCase() === ch && !this.options[optionIndex].isDisabled) {
                    this.select(optionIndex);
                    this.selectList.setFocus([optionIndex]);
                    this.selectList.reveal(this.selectList.getFocus()[0]);
                    dom.EventHelper.stop(e);
                    break;
                }
            }
        }
        dispose() {
            this.hideSelectDropDown(false);
            super.dispose();
        }
    }
    exports.SelectBoxList = SelectBoxList;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VsZWN0Qm94Q3VzdG9tLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvYmFzZS9icm93c2VyL3VpL3NlbGVjdEJveC9zZWxlY3RCb3hDdXN0b20udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBcUJoRyxNQUFNLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDO0lBRWhCLE1BQU0sK0JBQStCLEdBQUcsNkJBQTZCLENBQUM7SUFTdEUsTUFBTSxrQkFBa0I7UUFFdkIsSUFBSSxVQUFVLEtBQWEsT0FBTywrQkFBK0IsQ0FBQyxDQUFDLENBQUM7UUFFcEUsY0FBYyxDQUFDLFNBQXNCO1lBQ3BDLE1BQU0sSUFBSSxHQUE0QixNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQzFELElBQUksQ0FBQyxJQUFJLEdBQUcsU0FBUyxDQUFDO1lBQ3RCLElBQUksQ0FBQyxJQUFJLEdBQUcsR0FBRyxDQUFDLE1BQU0sQ0FBQyxTQUFTLEVBQUUsQ0FBQyxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUM7WUFDckQsSUFBSSxDQUFDLE1BQU0sR0FBRyxHQUFHLENBQUMsTUFBTSxDQUFDLFNBQVMsRUFBRSxDQUFDLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDO1lBQ3pELElBQUksQ0FBQyxjQUFjLEdBQUcsR0FBRyxDQUFDLE1BQU0sQ0FBQyxTQUFTLEVBQUUsQ0FBQyxDQUFDLHlCQUF5QixDQUFDLENBQUMsQ0FBQztZQUUxRSxPQUFPLElBQUksQ0FBQztRQUNiLENBQUM7UUFFRCxhQUFhLENBQUMsT0FBMEIsRUFBRSxLQUFhLEVBQUUsWUFBcUM7WUFDN0YsTUFBTSxJQUFJLEdBQTRCLFlBQVksQ0FBQztZQUVuRCxNQUFNLElBQUksR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDO1lBQzFCLE1BQU0sTUFBTSxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUM7WUFD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QUFJLENBQUMsU0FBUyxDQUFDLGFBQUssQ0FBQyxLQUFLLENBQUMsdUJBQXVCLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLE9BQU8sMkJBQW1CLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQztZQUM1SCxJQUFJLENBQUMsU0FBUyxDQUFDLGFBQUssQ0FBQyxLQUFLLENBQUMsdUJBQXVCLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLE9BQU8sNkJBQW9CLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQztZQUM5SCxJQUFJLENBQUMsU0FBUyxDQUFDLGFBQUssQ0FBQyxLQUFLLENBQUMsdUJBQXVCLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLE9BQU8sK0JBQXNCLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQztZQUNsSSxJQUFJLENBQUMsU0FBUyxDQUFDLGFBQUssQ0FBQyxLQUFLLENBQUMsdUJBQXVCLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLE9BQU8sOEJBQXFCLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQztZQUNoSSxJQUFJLENBQUMsU0FBUyxDQUFDLGFBQUssQ0FBQyxLQUFLLENBQUMsdUJBQXVCLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFD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