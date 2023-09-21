/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/ui/actionbar/actionbar", "vs/base/browser/ui/button/button", "vs/base/browser/ui/countBadge/countBadge", "vs/base/browser/ui/progressbar/progressbar", "vs/base/common/cancellation", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/severity", "vs/base/common/types", "vs/nls!vs/platform/quickinput/browser/quickInputController", "vs/platform/quickinput/common/quickInput", "vs/platform/quickinput/browser/quickInputBox", "vs/platform/quickinput/browser/quickInputList", "vs/platform/quickinput/browser/quickInput"], function (require, exports, dom, actionbar_1, button_1, countBadge_1, progressbar_1, cancellation_1, event_1, lifecycle_1, severity_1, types_1, nls_1, quickInput_1, quickInputBox_1, quickInputList_1, quickInput_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$GAb = void 0;
    const $ = dom.$;
    class $GAb extends lifecycle_1.$kc {
        static { this.a = 600; } // Max total width of quick input widget
        constructor(F, G) {
            super();
            this.F = F;
            this.G = G;
            this.j = true;
            this.m = this.B(new event_1.$fd());
            this.n = this.B(new event_1.$fd());
            this.r = this.B(new event_1.$fd());
            this.s = { ctrlCmd: false, alt: false };
            this.t = null;
            this.z = this.B(new event_1.$fd());
            this.onShow = this.z.event;
            this.C = this.B(new event_1.$fd());
            this.onHide = this.C.event;
            this.backButton = quickInput_2.$BAb;
            this.b = F.idPrefix;
            this.u = F.container;
            this.w = F.styles;
            this.H();
        }
        H() {
            const listener = (e) => {
                this.s.ctrlCmd = e.ctrlKey || e.metaKey;
                this.s.alt = e.altKey;
            };
            this.B(dom.$nO(window, dom.$3O.KEY_DOWN, listener, true));
            this.B(dom.$nO(window, dom.$3O.KEY_UP, listener, true));
            this.B(dom.$nO(window, dom.$3O.MOUSE_DOWN, listener, true));
        }
        I() {
            if (this.f) {
                return this.f;
            }
            const container = dom.$0O(this.u, $('.quick-input-widget.show-file-icons'));
            container.tabIndex = -1;
            container.style.display = 'none';
            const styleSheet = dom.$XO(container);
            const titleBar = dom.$0O(container, $('.quick-input-titlebar'));
            const actionBarOption = this.F.hoverDelegate ? { hoverDelegate: this.F.hoverDelegate } : undefined;
            const leftActionBar = this.B(new actionbar_1.$1P(titleBar, actionBarOption));
            leftActionBar.domNode.classList.add('quick-input-left-action-bar');
            const title = dom.$0O(titleBar, $('.quick-input-title'));
            const rightActionBar = this.B(new actionbar_1.$1P(titleBar, actionBarOption));
            rightActionBar.domNode.classList.add('quick-input-right-action-bar');
            const headerContainer = dom.$0O(container, $('.quick-input-header'));
            const checkAll = dom.$0O(headerContainer, $('input.quick-input-check-all'));
            checkAll.type = 'checkbox';
            checkAll.setAttribute('aria-label', (0, nls_1.localize)(0, null));
            this.B(dom.$oO(checkAll, dom.$3O.CHANGE, e => {
                const checked = checkAll.checked;
                list.setAllVisibleChecked(checked);
            }));
            this.B(dom.$nO(checkAll, dom.$3O.CLICK, e => {
                if (e.x || e.y) { // Avoid 'click' triggered by 'space'...
                    inputBox.setFocus();
                }
            }));
            const description2 = dom.$0O(headerContainer, $('.quick-input-description'));
            const inputContainer = dom.$0O(headerContainer, $('.quick-input-and-message'));
            const filterContainer = dom.$0O(inputContainer, $('.quick-input-filter'));
            const inputBox = this.B(new quickInputBox_1.$yAb(filterContainer, this.w.inputBox, this.w.toggle));
            inputBox.setAttribute('aria-describedby', `${this.b}message`);
            const visibleCountContainer = dom.$0O(filterContainer, $('.quick-input-visible-count'));
            visibleCountContainer.setAttribute('aria-live', 'polite');
            visibleCountContainer.setAttribute('aria-atomic', 'true');
            const visibleCount = new countBadge_1.$nR(visibleCountContainer, { countFormat: (0, nls_1.localize)(1, null) }, this.w.countBadge);
            const countContainer = dom.$0O(filterContainer, $('.quick-input-count'));
            countContainer.setAttribute('aria-live', 'polite');
            const count = new countBadge_1.$nR(countContainer, { countFormat: (0, nls_1.localize)(2, null) }, this.w.countBadge);
            const okContainer = dom.$0O(headerContainer, $('.quick-input-action'));
            const ok = this.B(new button_1.$7Q(okContainer, this.w.button));
            ok.label = (0, nls_1.localize)(3, null);
            this.B(ok.onDidClick(e => {
                this.m.fire();
            }));
            const customButtonContainer = dom.$0O(headerContainer, $('.quick-input-action'));
            const customButton = this.B(new button_1.$7Q(customButtonContainer, this.w.button));
            customButton.label = (0, nls_1.localize)(4, null);
            this.B(customButton.onDidClick(e => {
                this.n.fire();
            }));
            const message = dom.$0O(inputContainer, $(`#${this.b}message.quick-input-message`));
            const progressBar = this.B(new progressbar_1.$YR(container, this.w.progressBar));
            progressBar.getContainer().classList.add('quick-input-progress');
            const widget = dom.$0O(container, $('.quick-input-html-widget'));
            widget.tabIndex = -1;
            const description1 = dom.$0O(container, $('.quick-input-description'));
            const listId = this.b + 'list';
            const list = this.B(new quickInputList_1.$FAb(container, listId, this.F, this.G));
            inputBox.setAttribute('aria-controls', listId);
            this.B(list.onDidChangeFocus(() => {
                inputBox.setAttribute('aria-activedescendant', list.getActiveDescendant() ?? '');
            }));
            this.B(list.onChangedAllVisibleChecked(checked => {
                checkAll.checked = checked;
            }));
            this.B(list.onChangedVisibleCount(c => {
                visibleCount.setCount(c);
            }));
            this.B(list.onChangedCheckedCount(c => {
                count.setCount(c);
            }));
            this.B(list.onLeave(() => {
                // Defer to avoid the input field reacting to the triggering key.
                setTimeout(() => {
                    inputBox.setFocus();
                    if (this.t instanceof quickInput_2.$CAb && this.t.canSelectMany) {
                        list.clearFocus();
                    }
                }, 0);
            }));
            const focusTracker = dom.$8O(container);
            this.B(focusTracker);
            this.B(dom.$nO(container, dom.$3O.FOCUS, e => {
                // Ignore focus events within container
                if (dom.$NO(e.relatedTarget, container)) {
                    return;
                }
                this.D = e.relatedTarget instanceof HTMLElement ? e.relatedTarget : undefined;
            }, true));
            this.B(focusTracker.onDidBlur(() => {
                if (!this.I().ignoreFocusOut && !this.F.ignoreFocusOut()) {
                    this.hide(quickInput_1.QuickInputHideReason.Blur);
                }
                this.D = undefined;
            }));
            this.B(dom.$nO(container, dom.$3O.FOCUS, (e) => {
                inputBox.setFocus();
            }));
            // TODO: Turn into commands instead of handling KEY_DOWN
            this.B(dom.$oO(container, dom.$3O.KEY_DOWN, (event) => {
                if (dom.$NO(event.target, widget)) {
                    return; // Ignore event if target is inside widget to allow the widget to handle the event.
                }
                switch (event.keyCode) {
                    case 3 /* KeyCode.Enter */:
                        dom.$5O.stop(event, true);
                        if (this.j) {
                            this.m.fire();
                        }
                        break;
                    case 9 /* KeyCode.Escape */:
                        dom.$5O.stop(event, true);
                        this.hide(quickInput_1.QuickInputHideReason.Gesture);
                        break;
                    case 2 /* KeyCode.Tab */:
                        if (!event.altKey && !event.ctrlKey && !event.metaKey) {
                            // detect only visible actions
                            const selectors = [
                                '.quick-input-list .monaco-action-bar .always-visible',
                                '.quick-input-list-entry:hover .monaco-action-bar',
                                '.monaco-list-row.focused .monaco-action-bar'
                            ];
                            if (container.classList.contains('show-checkboxes')) {
                                selectors.push('input');
                            }
                            else {
                                selectors.push('input[type=text]');
                            }
                            if (this.I().list.isDisplayed()) {
                                selectors.push('.monaco-list');
                            }
                            // focus links if there are any
                            if (this.I().message) {
                                selectors.push('.quick-input-message a');
                            }
                            if (this.I().widget) {
                                if (dom.$NO(event.target, this.I().widget)) {
                                    // let the widget control tab
                                    break;
                                }
                                selectors.push('.quick-input-html-widget');
                            }
                            const stops = container.querySelectorAll(selectors.join(', '));
                            if (event.shiftKey && event.target === stops[0]) {
                                // Clear the focus from the list in order to allow
                                // screen readers to read operations in the input box.
                                dom.$5O.stop(event, true);
                                list.clearFocus();
                            }
                            else if (!event.shiftKey && dom.$NO(event.target, stops[stops.length - 1])) {
                                dom.$5O.stop(event, true);
                                stops[0].focus();
                            }
                        }
                        break;
                    case 10 /* KeyCode.Space */:
                        if (event.ctrlKey) {
                            dom.$5O.stop(event, true);
                            this.I().list.toggleHover();
                        }
                        break;
                }
            }));
            this.f = {
                container,
                styleSheet,
                leftActionBar,
                titleBar,
                title,
                description1,
                description2,
                widget,
                rightActionBar,
                checkAll,
                inputContainer,
                filterContainer,
                inputBox,
                visibleCountContainer,
                visibleCount,
                countContainer,
                count,
                okContainer,
                ok,
                message,
                customButtonContainer,
                customButton,
                list,
                progressBar,
                onDidAccept: this.m.event,
                onDidCustom: this.n.event,
                onDidTriggerButton: this.r.event,
                ignoreFocusOut: false,
                keyMods: this.s,
                show: controller => this.L(controller),
                hide: () => this.hide(),
                setVisibilities: visibilities => this.M(visibilities),
                setEnabled: enabled => this.N(enabled),
                setContextKey: contextKey => this.F.setContextKey(contextKey),
                linkOpenerDelegate: content => this.F.linkOpenerDelegate(content)
            };
            this.Q();
            return this.f;
        }
        pick(picks, options = {}, token = cancellation_1.CancellationToken.None) {
            return new Promise((doResolve, reject) => {
                let resolve = (result) => {
                    resolve = doResolve;
                    options.onKeyMods?.(input.keyMods);
                    doResolve(result);
                };
                if (token.isCancellationRequested) {
                    resolve(undefined);
                    return;
                }
                const input = this.createQuickPick();
                let activeItem;
                const disposables = [
                    input,
                    input.onDidAccept(() => {
                        if (input.canSelectMany) {
                            resolve(input.selectedItems.slice());
                            input.hide();
                        }
                        else {
                            const result = input.activeItems[0];
                            if (result) {
                                resolve(result);
                                input.hide();
                            }
                        }
                    }),
                    input.onDidChangeActive(items => {
                        const focused = items[0];
                        if (focused && options.onDidFocus) {
                            options.onDidFocus(focused);
                        }
                    }),
                    input.onDidChangeSelection(items => {
                        if (!input.canSelectMany) {
                            const result = items[0];
                            if (result) {
                                resolve(result);
                                input.hide();
                            }
                        }
                    }),
                    input.onDidTriggerItemButton(event => options.onDidTriggerItemButton && options.onDidTriggerItemButton({
                        ...event,
                        removeItem: () => {
                            const index = input.items.indexOf(event.item);
                            if (index !== -1) {
                                const items = input.items.slice();
                                const removed = items.splice(index, 1);
                                const activeItems = input.activeItems.filter(activeItem => activeItem !== removed[0]);
                                const keepScrollPositionBefore = input.keepScrollPosition;
                                input.keepScrollPosition = true;
                                input.items = items;
                                if (activeItems) {
                                    input.activeItems = activeItems;
                                }
                                input.keepScrollPosition = keepScrollPositionBefore;
                            }
                        }
                    })),
                    input.onDidTriggerSeparatorButton(event => options.onDidTriggerSeparatorButton?.(event)),
                    input.onDidChangeValue(value => {
                        if (activeItem && !value && (input.activeItems.length !== 1 || input.activeItems[0] !== activeItem)) {
                            input.activeItems = [activeItem];
                        }
                    }),
                    token.onCancellationRequested(() => {
                        input.hide();
                    }),
                    input.onDidHide(() => {
                        (0, lifecycle_1.$fc)(disposables);
                        resolve(undefined);
                    }),
                ];
                input.title = options.title;
                input.canSelectMany = !!options.canPickMany;
                input.placeholder = options.placeHolder;
                input.ignoreFocusOut = !!options.ignoreFocusLost;
                input.matchOnDescription = !!options.matchOnDescription;
                input.matchOnDetail = !!options.matchOnDetail;
                input.matchOnLabel = (options.matchOnLabel === undefined) || options.matchOnLabel; // default to true
                input.autoFocusOnList = (options.autoFocusOnList === undefined) || options.autoFocusOnList; // default to true
                input.quickNavigate = options.quickNavigate;
                input.hideInput = !!options.hideInput;
                input.contextKey = options.contextKey;
                input.busy = true;
                Promise.all([picks, options.activeItem])
                    .then(([items, _activeItem]) => {
                    activeItem = _activeItem;
                    input.busy = false;
                    input.items = items;
                    if (input.canSelectMany) {
                        input.selectedItems = items.filter(item => item.type !== 'separator' && item.picked);
                    }
                    if (activeItem) {
                        input.activeItems = [activeItem];
                    }
                });
                input.show();
                Promise.resolve(picks).then(undefined, err => {
                    reject(err);
                    input.hide();
                });
            });
        }
        J(input, validationResult) {
            if (validationResult && (0, types_1.$jf)(validationResult)) {
                input.severity = severity_1.default.Error;
                input.validationMessage = validationResult;
            }
            else if (validationResult && !(0, types_1.$jf)(validationResult)) {
                input.severity = validationResult.severity;
                input.validationMessage = validationResult.content;
            }
            else {
                input.severity = severity_1.default.Ignore;
                input.validationMessage = undefined;
            }
        }
        input(options = {}, token = cancellation_1.CancellationToken.None) {
            return new Promise((resolve) => {
                if (token.isCancellationRequested) {
                    resolve(undefined);
                    return;
                }
                const input = this.createInputBox();
                const validateInput = options.validateInput || (() => Promise.resolve(undefined));
                const onDidValueChange = event_1.Event.debounce(input.onDidChangeValue, (last, cur) => cur, 100);
                let validationValue = options.value || '';
                let validation = Promise.resolve(validateInput(validationValue));
                const disposables = [
                    input,
                    onDidValueChange(value => {
                        if (value !== validationValue) {
                            validation = Promise.resolve(validateInput(value));
                            validationValue = value;
                        }
                        validation.then(result => {
                            if (value === validationValue) {
                                this.J(input, result);
                            }
                        });
                    }),
                    input.onDidAccept(() => {
                        const value = input.value;
                        if (value !== validationValue) {
                            validation = Promise.resolve(validateInput(value));
                            validationValue = value;
                        }
                        validation.then(result => {
                            if (!result || (!(0, types_1.$jf)(result) && result.severity !== severity_1.default.Error)) {
                                resolve(value);
                                input.hide();
                            }
                            else if (value === validationValue) {
                                this.J(input, result);
                            }
                        });
                    }),
                    token.onCancellationRequested(() => {
                        input.hide();
                    }),
                    input.onDidHide(() => {
                        (0, lifecycle_1.$fc)(disposables);
                        resolve(undefined);
                    }),
                ];
                input.title = options.title;
                input.value = options.value || '';
                input.valueSelection = options.valueSelection;
                input.prompt = options.prompt;
                input.placeholder = options.placeHolder;
                input.password = !!options.password;
                input.ignoreFocusOut = !!options.ignoreFocusLost;
                input.show();
            });
        }
        createQuickPick() {
            const ui = this.I();
            return new quickInput_2.$CAb(ui);
        }
        createInputBox() {
            const ui = this.I();
            return new quickInput_2.$DAb(ui);
        }
        createQuickWidget() {
            const ui = this.I();
            return new quickInput_2.$EAb(ui);
        }
        L(controller) {
            const ui = this.I();
            this.z.fire();
            const oldController = this.t;
            this.t = controller;
            oldController?.didHide();
            this.N(true);
            ui.leftActionBar.clear();
            ui.title.textContent = '';
            ui.description1.textContent = '';
            ui.description2.textContent = '';
            dom.$_O(ui.widget);
            ui.rightActionBar.clear();
            ui.checkAll.checked = false;
            // ui.inputBox.value = ''; Avoid triggering an event.
            ui.inputBox.placeholder = '';
            ui.inputBox.password = false;
            ui.inputBox.showDecoration(severity_1.default.Ignore);
            ui.visibleCount.setCount(0);
            ui.count.setCount(0);
            dom.$_O(ui.message);
            ui.progressBar.stop();
            ui.list.setElements([]);
            ui.list.matchOnDescription = false;
            ui.list.matchOnDetail = false;
            ui.list.matchOnLabel = true;
            ui.list.sortByLabel = true;
            ui.ignoreFocusOut = false;
            ui.inputBox.toggles = undefined;
            const backKeybindingLabel = this.F.backKeybindingLabel();
            quickInput_2.$BAb.tooltip = backKeybindingLabel ? (0, nls_1.localize)(5, null, backKeybindingLabel) : (0, nls_1.localize)(6, null);
            ui.container.style.display = '';
            this.P();
            ui.inputBox.setFocus();
        }
        M(visibilities) {
            const ui = this.I();
            ui.title.style.display = visibilities.title ? '' : 'none';
            ui.description1.style.display = visibilities.description && (visibilities.inputBox || visibilities.checkAll) ? '' : 'none';
            ui.description2.style.display = visibilities.description && !(visibilities.inputBox || visibilities.checkAll) ? '' : 'none';
            ui.checkAll.style.display = visibilities.checkAll ? '' : 'none';
            ui.inputContainer.style.display = visibilities.inputBox ? '' : 'none';
            ui.filterContainer.style.display = visibilities.inputBox ? '' : 'none';
            ui.visibleCountContainer.style.display = visibilities.visibleCount ? '' : 'none';
            ui.countContainer.style.display = visibilities.count ? '' : 'none';
            ui.okContainer.style.display = visibilities.ok ? '' : 'none';
            ui.customButtonContainer.style.display = visibilities.customButton ? '' : 'none';
            ui.message.style.display = visibilities.message ? '' : 'none';
            ui.progressBar.getContainer().style.display = visibilities.progressBar ? '' : 'none';
            ui.list.display(!!visibilities.list);
            ui.container.classList.toggle('show-checkboxes', !!visibilities.checkBox);
            ui.container.classList.toggle('hidden-input', !visibilities.inputBox && !visibilities.description);
            this.P(); // TODO
        }
        N(enabled) {
            if (enabled !== this.j) {
                this.j = enabled;
                for (const item of this.I().leftActionBar.viewItems) {
                    item.action.enabled = enabled;
                }
                for (const item of this.I().rightActionBar.viewItems) {
                    item.action.enabled = enabled;
                }
                this.I().checkAll.disabled = !enabled;
                this.I().inputBox.enabled = enabled;
                this.I().ok.enabled = enabled;
                this.I().list.enabled = enabled;
            }
        }
        hide(reason) {
            const controller = this.t;
            if (!controller) {
                return;
            }
            const focusChanged = !dom.$NO(document.activeElement, this.f?.container ?? null);
            this.t = null;
            this.C.fire();
            this.I().container.style.display = 'none';
            if (!focusChanged) {
                let currentElement = this.D;
                while (currentElement && !currentElement.offsetParent) {
                    currentElement = currentElement.parentElement ?? undefined;
                }
                if (currentElement?.offsetParent) {
                    currentElement.focus();
                    this.D = undefined;
                }
                else {
                    this.F.returnFocus();
                }
            }
            controller.didHide(reason);
        }
        focus() {
            if (this.S()) {
                const ui = this.I();
                if (ui.inputBox.enabled) {
                    ui.inputBox.setFocus();
                }
                else {
                    ui.list.domFocus();
                }
            }
        }
        toggle() {
            if (this.S() && this.t instanceof quickInput_2.$CAb && this.t.canSelectMany) {
                this.I().list.toggleCheckbox();
            }
        }
        navigate(next, quickNavigate) {
            if (this.S() && this.I().list.isDisplayed()) {
                this.I().list.focus(next ? quickInputList_1.QuickInputListFocus.Next : quickInputList_1.QuickInputListFocus.Previous);
                if (quickNavigate && this.t instanceof quickInput_2.$CAb) {
                    this.t.quickNavigate = quickNavigate;
                }
            }
        }
        async accept(keyMods = { alt: false, ctrlCmd: false }) {
            // When accepting the item programmatically, it is important that
            // we update `keyMods` either from the provided set or unset it
            // because the accept did not happen from mouse or keyboard
            // interaction on the list itself
            this.s.alt = keyMods.alt;
            this.s.ctrlCmd = keyMods.ctrlCmd;
            this.m.fire();
        }
        async back() {
            this.r.fire(this.backButton);
        }
        async cancel() {
            this.hide();
        }
        layout(dimension, titleBarOffset) {
            this.g = dimension;
            this.h = titleBarOffset;
            this.P();
        }
        P() {
            if (this.f && this.S()) {
                this.f.container.style.top = `${this.h}px`;
                const style = this.f.container.style;
                const width = Math.min(this.g.width * 0.62 /* golden cut */, $GAb.a);
                style.width = width + 'px';
                style.marginLeft = '-' + (width / 2) + 'px';
                this.f.inputBox.layout();
                this.f.list.layout(this.g && this.g.height * 0.4);
            }
        }
        applyStyles(styles) {
            this.w = styles;
            this.Q();
        }
        Q() {
            if (this.f) {
                const { quickInputTitleBackground, quickInputBackground, quickInputForeground, widgetBorder, widgetShadow, } = this.w.widget;
                this.f.titleBar.style.backgroundColor = quickInputTitleBackground ?? '';
                this.f.container.style.backgroundColor = quickInputBackground ?? '';
                this.f.container.style.color = quickInputForeground ?? '';
                this.f.container.style.border = widgetBorder ? `1px solid ${widgetBorder}` : '';
                this.f.container.style.boxShadow = widgetShadow ? `0 0 8px 2px ${widgetShadow}` : '';
                this.f.list.style(this.w.list);
                const content = [];
                if (this.w.pickerGroup.pickerGroupBorder) {
                    content.push(`.quick-input-list .quick-input-list-entry { border-top-color:  ${this.w.pickerGroup.pickerGroupBorder}; }`);
                }
                if (this.w.pickerGroup.pickerGroupForeground) {
                    content.push(`.quick-input-list .quick-input-list-separator { color:  ${this.w.pickerGroup.pickerGroupForeground}; }`);
                }
                if (this.w.pickerGroup.pickerGroupForeground) {
                    content.push(`.quick-input-list .quick-input-list-separator-as-item { color: var(--vscode-descriptionForeground); }`);
                }
                if (this.w.keybindingLabel.keybindingLabelBackground ||
                    this.w.keybindingLabel.keybindingLabelBorder ||
                    this.w.keybindingLabel.keybindingLabelBottomBorder ||
                    this.w.keybindingLabel.keybindingLabelShadow ||
                    this.w.keybindingLabel.keybindingLabelForeground) {
                    content.push('.quick-input-list .monaco-keybinding > .monaco-keybinding-key {');
                    if (this.w.keybindingLabel.keybindingLabelBackground) {
                        content.push(`background-color: ${this.w.keybindingLabel.keybindingLabelBackground};`);
                    }
                    if (this.w.keybindingLabel.keybindingLabelBorder) {
                        // Order matters here. `border-color` must come before `border-bottom-color`.
                        content.push(`border-color: ${this.w.keybindingLabel.keybindingLabelBorder};`);
                    }
                    if (this.w.keybindingLabel.keybindingLabelBottomBorder) {
                        content.push(`border-bottom-color: ${this.w.keybindingLabel.keybindingLabelBottomBorder};`);
                    }
                    if (this.w.keybindingLabel.keybindingLabelShadow) {
                        content.push(`box-shadow: inset 0 -1px 0 ${this.w.keybindingLabel.keybindingLabelShadow};`);
                    }
                    if (this.w.keybindingLabel.keybindingLabelForeground) {
                        content.push(`color: ${this.w.keybindingLabel.keybindingLabelForeground};`);
                    }
                    content.push('}');
                }
                const newStyles = content.join('\n');
                if (newStyles !== this.f.styleSheet.textContent) {
                    this.f.styleSheet.textContent = newStyles;
                }
            }
        }
        S() {
            return this.f && this.f.container.style.display !== 'none';
        }
    }
    exports.$GAb = $GAb;
});
//# sourceMappingURL=quickInputController.js.map