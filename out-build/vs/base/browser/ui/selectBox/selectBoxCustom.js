/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/event", "vs/base/browser/keyboardEvent", "vs/base/browser/markdownRenderer", "vs/base/browser/ui/list/listWidget", "vs/base/common/arrays", "vs/base/common/event", "vs/base/common/keyCodes", "vs/base/common/lifecycle", "vs/base/common/platform", "vs/nls!vs/base/browser/ui/selectBox/selectBoxCustom", "vs/css!./selectBoxCustom"], function (require, exports, dom, event_1, keyboardEvent_1, markdownRenderer_1, listWidget_1, arrays, event_2, keyCodes_1, lifecycle_1, platform_1, nls_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$EQ = void 0;
    const $ = dom.$;
    const SELECT_OPTION_ENTRY_TEMPLATE_ID = 'selectOption.entry.template';
    class SelectListRenderer {
        get templateId() { return SELECT_OPTION_ENTRY_TEMPLATE_ID; }
        renderTemplate(container) {
            const data = Object.create(null);
            data.root = container;
            data.text = dom.$0O(container, $('.option-text'));
            data.detail = dom.$0O(container, $('.option-detail'));
            data.decoratorRight = dom.$0O(container, $('.option-decorator-right'));
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
    class $EQ extends lifecycle_1.$kc {
        static { this.a = 32; }
        static { this.b = 2; }
        static { this.c = 3; }
        constructor(options, selected, contextViewProvider, styles, selectBoxOptions) {
            super();
            this.m = [];
            this.F = 0;
            this.H = false;
            this.J = false;
            this.M = false; // for dev purposes only
            this.f = false;
            this.s = styles;
            this.g = selectBoxOptions || Object.create(null);
            if (typeof this.g.minBottomMargin !== 'number') {
                this.g.minBottomMargin = $EQ.a;
            }
            else if (this.g.minBottomMargin < 0) {
                this.g.minBottomMargin = 0;
            }
            this.h = document.createElement('select');
            // Use custom CSS vars for padding calculation
            this.h.className = 'monaco-select-box monaco-select-box-dropdown-padding';
            if (typeof this.g.ariaLabel === 'string') {
                this.h.setAttribute('aria-label', this.g.ariaLabel);
            }
            if (typeof this.g.ariaDescription === 'string') {
                this.h.setAttribute('aria-description', this.g.ariaDescription);
            }
            this.r = new event_2.$fd();
            this.B(this.r);
            this.O();
            this.N(contextViewProvider);
            this.n = selected || 0;
            if (options) {
                this.setOptions(options, selected);
            }
            this.Q();
        }
        // IDelegate - List renderer
        getHeight() {
            return 22;
        }
        getTemplateId() {
            return SELECT_OPTION_ENTRY_TEMPLATE_ID;
        }
        N(contextViewProvider) {
            // SetUp ContextView container to hold select Dropdown
            this.u = contextViewProvider;
            this.w = dom.$('.monaco-select-box-dropdown-container');
            // Use custom CSS vars for padding calculation (shared with parent select)
            this.w.classList.add('monaco-select-box-dropdown-padding');
            // Setup container for select option details
            this.I = dom.$0O(this.w, $('.select-box-details-pane'));
            // Create span flex box item/div we can measure and control
            const widthControlOuterDiv = dom.$0O(this.w, $('.select-box-dropdown-container-width-control'));
            const widthControlInnerDiv = dom.$0O(widthControlOuterDiv, $('.width-control-div'));
            this.D = document.createElement('span');
            this.D.className = 'option-text-width-control';
            dom.$0O(widthControlInnerDiv, this.D);
            // Always default to below position
            this.G = 0 /* AnchorPosition.BELOW */;
            // Inline stylesheet for themes
            this.y = dom.$XO(this.w);
            // Prevent dragging of dropdown #114329
            this.w.setAttribute('draggable', 'true');
            this.B(dom.$nO(this.w, dom.$3O.DRAG_START, (e) => {
                dom.$5O.stop(e, true);
            }));
        }
        O() {
            // Parent native select keyboard listeners
            this.B(dom.$oO(this.h, 'change', (e) => {
                this.n = e.target.selectedIndex;
                this.r.fire({
                    index: e.target.selectedIndex,
                    selected: e.target.value
                });
                if (!!this.m[this.n] && !!this.m[this.n].text) {
                    this.h.title = this.m[this.n].text;
                }
            }));
            // Have to implement both keyboard and mouse controllers to handle disabled options
            // Intercept mouse events to override normal select actions on parents
            this.B(dom.$nO(this.h, dom.$3O.CLICK, (e) => {
                dom.$5O.stop(e);
                if (this.f) {
                    this.X(true);
                }
                else {
                    this.W();
                }
            }));
            this.B(dom.$nO(this.h, dom.$3O.MOUSE_DOWN, (e) => {
                dom.$5O.stop(e);
            }));
            // Intercept touch events
            // The following implementation is slightly different from the mouse event handlers above.
            // Use the following helper variable, otherwise the list flickers.
            let listIsVisibleOnTouchStart;
            this.B(dom.$nO(this.h, 'touchstart', (e) => {
                listIsVisibleOnTouchStart = this.f;
            }));
            this.B(dom.$nO(this.h, 'touchend', (e) => {
                dom.$5O.stop(e);
                if (listIsVisibleOnTouchStart) {
                    this.X(true);
                }
                else {
                    this.W();
                }
            }));
            // Intercept keyboard handling
            this.B(dom.$nO(this.h, dom.$3O.KEY_DOWN, (e) => {
                const event = new keyboardEvent_1.$jO(e);
                let showDropDown = false;
                // Create and drop down select list on keyboard select
                if (platform_1.$j) {
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
                    this.W();
                    dom.$5O.stop(e, true);
                }
            }));
        }
        get onDidSelect() {
            return this.r.event;
        }
        setOptions(options, selected) {
            if (!arrays.$sb(this.m, options)) {
                this.m = options;
                this.h.options.length = 0;
                this.H = false;
                this.L = undefined;
                this.m.forEach((option, index) => {
                    this.h.add(this.U(option.text, index, option.isDisabled));
                    if (typeof option.description === 'string') {
                        this.H = true;
                    }
                });
            }
            if (selected !== undefined) {
                this.select(selected);
                // Set current = selected since this is not necessarily a user exit
                this.F = this.n;
            }
        }
        P() {
            // Mirror options in drop-down
            // Populate select list for non-native select mode
            this.z?.splice(0, this.z.length, this.m);
        }
        select(index) {
            if (index >= 0 && index < this.m.length) {
                this.n = index;
            }
            else if (index > this.m.length - 1) {
                // Adjust index to end of list
                // This could make client out of sync with the select
                this.select(this.m.length - 1);
            }
            else if (this.n < 0) {
                this.n = 0;
            }
            this.h.selectedIndex = this.n;
            if (!!this.m[this.n] && !!this.m[this.n].text) {
                this.h.title = this.m[this.n].text;
            }
        }
        setAriaLabel(label) {
            this.g.ariaLabel = label;
            this.h.setAttribute('aria-label', this.g.ariaLabel);
        }
        focus() {
            if (this.h) {
                this.h.tabIndex = 0;
                this.h.focus();
            }
        }
        blur() {
            if (this.h) {
                this.h.tabIndex = -1;
                this.h.blur();
            }
        }
        setFocusable(focusable) {
            this.h.tabIndex = focusable ? 0 : -1;
        }
        render(container) {
            this.j = container;
            container.classList.add('select-container');
            container.appendChild(this.h);
            this.R();
        }
        Q() {
            const content = [];
            // Style non-native select mode
            if (this.s.listFocusBackground) {
                content.push(`.monaco-select-box-dropdown-container > .select-box-dropdown-list-container .monaco-list .monaco-list-row.focused { background-color: ${this.s.listFocusBackground} !important; }`);
            }
            if (this.s.listFocusForeground) {
                content.push(`.monaco-select-box-dropdown-container > .select-box-dropdown-list-container .monaco-list .monaco-list-row.focused { color: ${this.s.listFocusForeground} !important; }`);
            }
            if (this.s.decoratorRightForeground) {
                content.push(`.monaco-select-box-dropdown-container > .select-box-dropdown-list-container .monaco-list .monaco-list-row:not(.focused) .option-decorator-right { color: ${this.s.decoratorRightForeground}; }`);
            }
            if (this.s.selectBackground && this.s.selectBorder && this.s.selectBorder !== this.s.selectBackground) {
                content.push(`.monaco-select-box-dropdown-container { border: 1px solid ${this.s.selectBorder} } `);
                content.push(`.monaco-select-box-dropdown-container > .select-box-details-pane.border-top { border-top: 1px solid ${this.s.selectBorder} } `);
                content.push(`.monaco-select-box-dropdown-container > .select-box-details-pane.border-bottom { border-bottom: 1px solid ${this.s.selectBorder} } `);
            }
            else if (this.s.selectListBorder) {
                content.push(`.monaco-select-box-dropdown-container > .select-box-details-pane.border-top { border-top: 1px solid ${this.s.selectListBorder} } `);
                content.push(`.monaco-select-box-dropdown-container > .select-box-details-pane.border-bottom { border-bottom: 1px solid ${this.s.selectListBorder} } `);
            }
            // Hover foreground - ignore for disabled options
            if (this.s.listHoverForeground) {
                content.push(`.monaco-select-box-dropdown-container > .select-box-dropdown-list-container .monaco-list .monaco-list-row:not(.option-disabled):not(.focused):hover { color: ${this.s.listHoverForeground} !important; }`);
            }
            // Hover background - ignore for disabled options
            if (this.s.listHoverBackground) {
                content.push(`.monaco-select-box-dropdown-container > .select-box-dropdown-list-container .monaco-list .monaco-list-row:not(.option-disabled):not(.focused):hover { background-color: ${this.s.listHoverBackground} !important; }`);
            }
            // Match quick input outline styles - ignore for disabled options
            if (this.s.listFocusOutline) {
                content.push(`.monaco-select-box-dropdown-container > .select-box-dropdown-list-container .monaco-list .monaco-list-row.focused { outline: 1.6px dotted ${this.s.listFocusOutline} !important; outline-offset: -1.6px !important; }`);
            }
            if (this.s.listHoverOutline) {
                content.push(`.monaco-select-box-dropdown-container > .select-box-dropdown-list-container .monaco-list .monaco-list-row:not(.option-disabled):not(.focused):hover { outline: 1.6px dashed ${this.s.listHoverOutline} !important; outline-offset: -1.6px !important; }`);
            }
            // Clear list styles on focus and on hover for disabled options
            content.push(`.monaco-select-box-dropdown-container > .select-box-dropdown-list-container .monaco-list .monaco-list-row.option-disabled.focused { background-color: transparent !important; color: inherit !important; outline: none !important; }`);
            content.push(`.monaco-select-box-dropdown-container > .select-box-dropdown-list-container .monaco-list .monaco-list-row.option-disabled:hover { background-color: transparent !important; color: inherit !important; outline: none !important; }`);
            this.y.textContent = content.join('\n');
        }
        R() {
            const background = this.s.selectBackground ?? '';
            const foreground = this.s.selectForeground ?? '';
            const border = this.s.selectBorder ?? '';
            this.h.style.backgroundColor = background;
            this.h.style.color = foreground;
            this.h.style.borderColor = border;
        }
        S() {
            const background = this.s.selectBackground ?? '';
            const listBackground = dom.$pP(this.s.selectListBackground, background);
            this.C.style.backgroundColor = listBackground;
            this.I.style.backgroundColor = listBackground;
            const optionsBorder = this.s.focusBorder ?? '';
            this.w.style.outlineColor = optionsBorder;
            this.w.style.outlineOffset = '-1px';
            this.z.style(this.s);
        }
        U(value, index, disabled) {
            const option = document.createElement('option');
            option.value = value;
            option.text = value;
            option.disabled = !!disabled;
            return option;
        }
        // ContextView dropdown methods
        W() {
            this.I.innerText = '';
            if (!this.u || this.f) {
                return;
            }
            // Lazily create and populate list only at open, moved from constructor
            this.cb(this.w);
            this.P();
            // This allows us to flip the position based on measurement
            // Set drop-down position above/below from required height and margins
            // If pre-layout cannot fit at least one option do not show drop-down
            this.u.showContextView({
                getAnchor: () => this.h,
                render: (container) => this.Y(container, true),
                layout: () => {
                    this.ab();
                },
                onHide: () => {
                    this.w.classList.remove('visible');
                    this.h.classList.remove('synthetic-focus');
                },
                anchorPosition: this.G
            }, this.g.optionsAsChildren ? this.j : undefined);
            // Hide so we can relay out
            this.f = true;
            this.X(false);
            this.u.showContextView({
                getAnchor: () => this.h,
                render: (container) => this.Y(container),
                layout: () => this.ab(),
                onHide: () => {
                    this.w.classList.remove('visible');
                    this.h.classList.remove('synthetic-focus');
                },
                anchorPosition: this.G
            }, this.g.optionsAsChildren ? this.j : undefined);
            // Track initial selection the case user escape, blur
            this.F = this.n;
            this.f = true;
            this.h.setAttribute('aria-expanded', 'true');
        }
        X(focusSelect) {
            if (!this.u || !this.f) {
                return;
            }
            this.f = false;
            this.h.setAttribute('aria-expanded', 'false');
            if (focusSelect) {
                this.h.focus();
            }
            this.u.hideContextView();
        }
        Y(container, preLayoutPosition) {
            container.appendChild(this.w);
            // Pre-Layout allows us to change position
            this.ab(preLayoutPosition);
            return {
                dispose: () => {
                    // contextView will dispose itself if moving from one View to another
                    try {
                        container.removeChild(this.w); // remove to take out the CSS rules we add
                    }
                    catch (error) {
                        // Ignore, removed already by change of focus
                    }
                }
            };
        }
        // Iterate over detailed descriptions, find max height
        Z() {
            let maxDetailsPaneHeight = 0;
            this.m.forEach((_option, index) => {
                this.hb(index);
                if (this.I.offsetHeight > maxDetailsPaneHeight) {
                    maxDetailsPaneHeight = this.I.offsetHeight;
                }
            });
            return maxDetailsPaneHeight;
        }
        ab(preLayoutPosition) {
            // Avoid recursion from layout called in onListFocus
            if (this.J) {
                return false;
            }
            // Layout ContextView drop down select list and container
            // Have to manage our vertical overflow, sizing, position below or above
            // Position has to be determined and set prior to contextView instantiation
            if (this.z) {
                // Make visible to enable measurements
                this.w.classList.add('visible');
                const selectPosition = dom.$FO(this.h);
                const styles = getComputedStyle(this.h);
                const verticalPadding = parseFloat(styles.getPropertyValue('--dropdown-padding-top')) + parseFloat(styles.getPropertyValue('--dropdown-padding-bottom'));
                const maxSelectDropDownHeightBelow = (window.innerHeight - selectPosition.top - selectPosition.height - (this.g.minBottomMargin || 0));
                const maxSelectDropDownHeightAbove = (selectPosition.top - $EQ.b);
                // Determine optimal width - min(longest option), opt(parent select, excluding margins), max(ContextView controlled)
                const selectWidth = this.h.offsetWidth;
                const selectMinWidth = this.bb(this.D);
                const selectOptimalWidth = Math.max(selectMinWidth, Math.round(selectWidth)).toString() + 'px';
                this.w.style.width = selectOptimalWidth;
                // Get initial list height and determine space above and below
                this.z.getHTMLElement().style.height = '';
                this.z.layout();
                let listHeight = this.z.contentHeight;
                if (this.H && this.L === undefined) {
                    this.L = this.Z();
                }
                const maxDetailsPaneHeight = this.H ? this.L : 0;
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
                        || selectPosition.top < $EQ.b
                        || ((maxVisibleOptionsBelow < 1) && (maxVisibleOptionsAbove < 1))) {
                        // Indicate we cannot open
                        return false;
                    }
                    // Determine if we have to flip up
                    // Always show complete list items - never more than Max available vertical height
                    if (maxVisibleOptionsBelow < $EQ.c
                        && maxVisibleOptionsAbove > maxVisibleOptionsBelow
                        && this.m.length > maxVisibleOptionsBelow) {
                        this.G = 1 /* AnchorPosition.ABOVE */;
                        this.w.removeChild(this.C);
                        this.w.removeChild(this.I);
                        this.w.appendChild(this.I);
                        this.w.appendChild(this.C);
                        this.I.classList.remove('border-top');
                        this.I.classList.add('border-bottom');
                    }
                    else {
                        this.G = 0 /* AnchorPosition.BELOW */;
                        this.w.removeChild(this.C);
                        this.w.removeChild(this.I);
                        this.w.appendChild(this.C);
                        this.w.appendChild(this.I);
                        this.I.classList.remove('border-bottom');
                        this.I.classList.add('border-top');
                    }
                    // Do full layout on showSelectDropDown only
                    return true;
                }
                // Check if select out of viewport or cutting into status bar
                if ((selectPosition.top + selectPosition.height) > (window.innerHeight - 22)
                    || selectPosition.top < $EQ.b
                    || (this.G === 0 /* AnchorPosition.BELOW */ && maxVisibleOptionsBelow < 1)
                    || (this.G === 1 /* AnchorPosition.ABOVE */ && maxVisibleOptionsAbove < 1)) {
                    // Cannot properly layout, close and hide
                    this.X(true);
                    return false;
                }
                // SetUp list dimensions and layout - account for container padding
                // Use position to check above or below available space
                if (this.G === 0 /* AnchorPosition.BELOW */) {
                    if (this.f && maxVisibleOptionsBelow + maxVisibleOptionsAbove < 1) {
                        // If drop-down is visible, must be doing a DOM re-layout, hide since we don't fit
                        // Hide drop-down, hide contextview, focus on parent select
                        this.X(true);
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
                this.z.layout(listHeight);
                this.z.domFocus();
                // Finally set focus on selected item
                if (this.z.length > 0) {
                    this.z.setFocus([this.n || 0]);
                    this.z.reveal(this.z.getFocus()[0] || 0);
                }
                if (this.H) {
                    // Leave the selectDropDownContainer to size itself according to children (list + details) - #57447
                    this.z.getHTMLElement().style.height = (listHeight + verticalPadding) + 'px';
                    this.w.style.height = '';
                }
                else {
                    this.w.style.height = (listHeight + verticalPadding) + 'px';
                }
                this.hb(this.n);
                this.w.style.width = selectOptimalWidth;
                // Maintain focus outline on parent select as well as list container - tabindex for focus
                this.C.setAttribute('tabindex', '0');
                this.h.classList.add('synthetic-focus');
                this.w.classList.add('synthetic-focus');
                return true;
            }
            else {
                return false;
            }
        }
        bb(container) {
            let elementWidth = 0;
            if (container) {
                let longest = 0;
                let longestLength = 0;
                this.m.forEach((option, index) => {
                    const detailLength = !!option.detail ? option.detail.length : 0;
                    const rightDecoratorLength = !!option.decoratorRight ? option.decoratorRight.length : 0;
                    const len = option.text.length + detailLength + rightDecoratorLength;
                    if (len > longestLength) {
                        longest = index;
                        longestLength = len;
                    }
                });
                container.textContent = this.m[longest].text + (!!this.m[longest].decoratorRight ? (this.m[longest].decoratorRight + ' ') : '');
                elementWidth = dom.$HO(container);
            }
            return elementWidth;
        }
        cb(parent) {
            // If we have already constructive list on open, skip
            if (this.z) {
                return;
            }
            // SetUp container for list
            this.C = dom.$0O(parent, $('.select-box-dropdown-list-container'));
            this.t = new SelectListRenderer();
            this.z = new listWidget_1.$wQ('SelectBoxCustom', this.C, this, [this.t], {
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
                    getWidgetAriaLabel: () => (0, nls_1.localize)(0, null),
                    getRole: () => platform_1.$j ? '' : 'option',
                    getWidgetRole: () => 'listbox'
                }
            });
            if (this.g.ariaLabel) {
                this.z.ariaLabel = this.g.ariaLabel;
            }
            // SetUp list keyboard controller - control navigation, disabled items, focus
            const onKeyDown = this.B(new event_1.$9P(this.C, 'keydown'));
            const onSelectDropDownKeyDown = event_2.Event.chain(onKeyDown.event, $ => $.filter(() => this.z.length > 0)
                .map(e => new keyboardEvent_1.$jO(e)));
            this.B(event_2.Event.chain(onSelectDropDownKeyDown, $ => $.filter(e => e.keyCode === 3 /* KeyCode.Enter */))(this.jb, this));
            this.B(event_2.Event.chain(onSelectDropDownKeyDown, $ => $.filter(e => e.keyCode === 2 /* KeyCode.Tab */))(this.jb, this)); // Tab should behave the same as enter, #79339
            this.B(event_2.Event.chain(onSelectDropDownKeyDown, $ => $.filter(e => e.keyCode === 9 /* KeyCode.Escape */))(this.ib, this));
            this.B(event_2.Event.chain(onSelectDropDownKeyDown, $ => $.filter(e => e.keyCode === 16 /* KeyCode.UpArrow */))(this.lb, this));
            this.B(event_2.Event.chain(onSelectDropDownKeyDown, $ => $.filter(e => e.keyCode === 18 /* KeyCode.DownArrow */))(this.kb, this));
            this.B(event_2.Event.chain(onSelectDropDownKeyDown, $ => $.filter(e => e.keyCode === 12 /* KeyCode.PageDown */))(this.nb, this));
            this.B(event_2.Event.chain(onSelectDropDownKeyDown, $ => $.filter(e => e.keyCode === 11 /* KeyCode.PageUp */))(this.mb, this));
            this.B(event_2.Event.chain(onSelectDropDownKeyDown, $ => $.filter(e => e.keyCode === 14 /* KeyCode.Home */))(this.ob, this));
            this.B(event_2.Event.chain(onSelectDropDownKeyDown, $ => $.filter(e => e.keyCode === 13 /* KeyCode.End */))(this.pb, this));
            this.B(event_2.Event.chain(onSelectDropDownKeyDown, $ => $.filter(e => (e.keyCode >= 21 /* KeyCode.Digit0 */ && e.keyCode <= 56 /* KeyCode.KeyZ */) || (e.keyCode >= 85 /* KeyCode.Semicolon */ && e.keyCode <= 113 /* KeyCode.NumpadDivide */)))(this.qb, this));
            // SetUp list mouse controller - control navigation, disabled items, focus
            this.B(dom.$nO(this.z.getHTMLElement(), dom.$3O.POINTER_UP, e => this.db(e)));
            this.B(this.z.onMouseOver(e => typeof e.index !== 'undefined' && this.z.setFocus([e.index])));
            this.B(this.z.onDidChangeFocus(e => this.gb(e)));
            this.B(dom.$nO(this.w, dom.$3O.FOCUS_OUT, e => {
                if (!this.f || dom.$NO(e.relatedTarget, this.w)) {
                    return;
                }
                this.eb();
            }));
            this.z.getHTMLElement().setAttribute('aria-label', this.g.ariaLabel || '');
            this.z.getHTMLElement().setAttribute('aria-expanded', 'true');
            this.S();
        }
        // List methods
        // List mouse controller - active exit, select option, fire onDidSelect if change, return focus to parent select
        // Also takes in touchend events
        db(e) {
            if (!this.z.length) {
                return;
            }
            dom.$5O.stop(e);
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
            if (index >= 0 && index < this.m.length && !disabled) {
                this.n = index;
                this.select(this.n);
                this.z.setFocus([this.n]);
                this.z.reveal(this.z.getFocus()[0]);
                // Only fire if selection change
                if (this.n !== this.F) {
                    // Set current = selected
                    this.F = this.n;
                    this.r.fire({
                        index: this.h.selectedIndex,
                        selected: this.m[this.n].text
                    });
                    if (!!this.m[this.n] && !!this.m[this.n].text) {
                        this.h.title = this.m[this.n].text;
                    }
                }
                this.X(true);
            }
        }
        // List Exit - passive - implicit no selection change, hide drop-down
        eb() {
            if (this.M) {
                return;
            }
            if (this.n !== this.F) {
                // Reset selected to current if no change
                this.select(this.F);
            }
            this.X(false);
        }
        fb(text, actionHandler) {
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
            const rendered = (0, markdownRenderer_1.$zQ)({ value: text, supportThemeIcons: true }, { actionHandler });
            rendered.element.classList.add('select-box-description-markdown');
            cleanRenderedMarkdown(rendered.element);
            return rendered.element;
        }
        // List Focus Change - passive - update details pane with newly focused element's data
        gb(e) {
            // Skip during initial layout
            if (!this.f || !this.H) {
                return;
            }
            this.hb(e.indexes[0]);
        }
        hb(selectedIndex) {
            this.I.innerText = '';
            const option = this.m[selectedIndex];
            const description = option?.description ?? '';
            const descriptionIsMarkdown = option?.descriptionIsMarkdown ?? false;
            if (description) {
                if (descriptionIsMarkdown) {
                    const actionHandler = option.descriptionMarkdownActionHandler;
                    this.I.appendChild(this.fb(description, actionHandler));
                }
                else {
                    this.I.innerText = description;
                }
                this.I.style.display = 'block';
            }
            else {
                this.I.style.display = 'none';
            }
            // Avoid recursion
            this.J = true;
            this.u.layout();
            this.J = false;
        }
        // List keyboard controller
        // List exit - active - hide ContextView dropdown, reset selection, return focus to parent select
        ib(e) {
            dom.$5O.stop(e);
            // Reset selection to value when opened
            this.select(this.F);
            this.X(true);
        }
        // List exit - active - hide ContextView dropdown, return focus to parent select, fire onDidSelect if change
        jb(e) {
            dom.$5O.stop(e);
            // Only fire if selection change
            if (this.n !== this.F) {
                this.F = this.n;
                this.r.fire({
                    index: this.h.selectedIndex,
                    selected: this.m[this.n].text
                });
                if (!!this.m[this.n] && !!this.m[this.n].text) {
                    this.h.title = this.m[this.n].text;
                }
            }
            this.X(true);
        }
        // List navigation - have to handle a disabled option (jump over)
        kb(e) {
            if (this.n < this.m.length - 1) {
                dom.$5O.stop(e, true);
                // Skip disabled options
                const nextOptionDisabled = this.m[this.n + 1].isDisabled;
                if (nextOptionDisabled && this.m.length > this.n + 2) {
                    this.n += 2;
                }
                else if (nextOptionDisabled) {
                    return;
                }
                else {
                    this.n++;
                }
                // Set focus/selection - only fire event when closing drop-down or on blur
                this.select(this.n);
                this.z.setFocus([this.n]);
                this.z.reveal(this.z.getFocus()[0]);
            }
        }
        lb(e) {
            if (this.n > 0) {
                dom.$5O.stop(e, true);
                // Skip disabled options
                const previousOptionDisabled = this.m[this.n - 1].isDisabled;
                if (previousOptionDisabled && this.n > 1) {
                    this.n -= 2;
                }
                else {
                    this.n--;
                }
                // Set focus/selection - only fire event when closing drop-down or on blur
                this.select(this.n);
                this.z.setFocus([this.n]);
                this.z.reveal(this.z.getFocus()[0]);
            }
        }
        mb(e) {
            dom.$5O.stop(e);
            this.z.focusPreviousPage();
            // Allow scrolling to settle
            setTimeout(() => {
                this.n = this.z.getFocus()[0];
                // Shift selection down if we land on a disabled option
                if (this.m[this.n].isDisabled && this.n < this.m.length - 1) {
                    this.n++;
                    this.z.setFocus([this.n]);
                }
                this.z.reveal(this.n);
                this.select(this.n);
            }, 1);
        }
        nb(e) {
            dom.$5O.stop(e);
            this.z.focusNextPage();
            // Allow scrolling to settle
            setTimeout(() => {
                this.n = this.z.getFocus()[0];
                // Shift selection up if we land on a disabled option
                if (this.m[this.n].isDisabled && this.n > 0) {
                    this.n--;
                    this.z.setFocus([this.n]);
                }
                this.z.reveal(this.n);
                this.select(this.n);
            }, 1);
        }
        ob(e) {
            dom.$5O.stop(e);
            if (this.m.length < 2) {
                return;
            }
            this.n = 0;
            if (this.m[this.n].isDisabled && this.n > 1) {
                this.n++;
            }
            this.z.setFocus([this.n]);
            this.z.reveal(this.n);
            this.select(this.n);
        }
        pb(e) {
            dom.$5O.stop(e);
            if (this.m.length < 2) {
                return;
            }
            this.n = this.m.length - 1;
            if (this.m[this.n].isDisabled && this.n > 1) {
                this.n--;
            }
            this.z.setFocus([this.n]);
            this.z.reveal(this.n);
            this.select(this.n);
        }
        // Mimic option first character navigation of native select
        qb(e) {
            const ch = keyCodes_1.KeyCodeUtils.toString(e.keyCode);
            let optionIndex = -1;
            for (let i = 0; i < this.m.length - 1; i++) {
                optionIndex = (i + this.n + 1) % this.m.length;
                if (this.m[optionIndex].text.charAt(0).toUpperCase() === ch && !this.m[optionIndex].isDisabled) {
                    this.select(optionIndex);
                    this.z.setFocus([optionIndex]);
                    this.z.reveal(this.z.getFocus()[0]);
                    dom.$5O.stop(e);
                    break;
                }
            }
        }
        dispose() {
            this.X(false);
            super.dispose();
        }
    }
    exports.$EQ = $EQ;
});
//# sourceMappingURL=selectBoxCustom.js.map