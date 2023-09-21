/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/ui/actionbar/actionbar", "vs/base/browser/ui/button/button", "vs/base/browser/ui/countBadge/countBadge", "vs/base/browser/ui/progressbar/progressbar", "vs/base/common/cancellation", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/severity", "vs/base/common/types", "vs/nls", "vs/platform/quickinput/common/quickInput", "vs/platform/quickinput/browser/quickInputBox", "vs/platform/quickinput/browser/quickInputList", "vs/platform/quickinput/browser/quickInput"], function (require, exports, dom, actionbar_1, button_1, countBadge_1, progressbar_1, cancellation_1, event_1, lifecycle_1, severity_1, types_1, nls_1, quickInput_1, quickInputBox_1, quickInputList_1, quickInput_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.QuickInputController = void 0;
    const $ = dom.$;
    class QuickInputController extends lifecycle_1.Disposable {
        static { this.MAX_WIDTH = 600; } // Max total width of quick input widget
        constructor(options, themeService) {
            super();
            this.options = options;
            this.themeService = themeService;
            this.enabled = true;
            this.onDidAcceptEmitter = this._register(new event_1.Emitter());
            this.onDidCustomEmitter = this._register(new event_1.Emitter());
            this.onDidTriggerButtonEmitter = this._register(new event_1.Emitter());
            this.keyMods = { ctrlCmd: false, alt: false };
            this.controller = null;
            this.onShowEmitter = this._register(new event_1.Emitter());
            this.onShow = this.onShowEmitter.event;
            this.onHideEmitter = this._register(new event_1.Emitter());
            this.onHide = this.onHideEmitter.event;
            this.backButton = quickInput_2.backButton;
            this.idPrefix = options.idPrefix;
            this.parentElement = options.container;
            this.styles = options.styles;
            this.registerKeyModsListeners();
        }
        registerKeyModsListeners() {
            const listener = (e) => {
                this.keyMods.ctrlCmd = e.ctrlKey || e.metaKey;
                this.keyMods.alt = e.altKey;
            };
            this._register(dom.addDisposableListener(window, dom.EventType.KEY_DOWN, listener, true));
            this._register(dom.addDisposableListener(window, dom.EventType.KEY_UP, listener, true));
            this._register(dom.addDisposableListener(window, dom.EventType.MOUSE_DOWN, listener, true));
        }
        getUI() {
            if (this.ui) {
                return this.ui;
            }
            const container = dom.append(this.parentElement, $('.quick-input-widget.show-file-icons'));
            container.tabIndex = -1;
            container.style.display = 'none';
            const styleSheet = dom.createStyleSheet(container);
            const titleBar = dom.append(container, $('.quick-input-titlebar'));
            const actionBarOption = this.options.hoverDelegate ? { hoverDelegate: this.options.hoverDelegate } : undefined;
            const leftActionBar = this._register(new actionbar_1.ActionBar(titleBar, actionBarOption));
            leftActionBar.domNode.classList.add('quick-input-left-action-bar');
            const title = dom.append(titleBar, $('.quick-input-title'));
            const rightActionBar = this._register(new actionbar_1.ActionBar(titleBar, actionBarOption));
            rightActionBar.domNode.classList.add('quick-input-right-action-bar');
            const headerContainer = dom.append(container, $('.quick-input-header'));
            const checkAll = dom.append(headerContainer, $('input.quick-input-check-all'));
            checkAll.type = 'checkbox';
            checkAll.setAttribute('aria-label', (0, nls_1.localize)('quickInput.checkAll', "Toggle all checkboxes"));
            this._register(dom.addStandardDisposableListener(checkAll, dom.EventType.CHANGE, e => {
                const checked = checkAll.checked;
                list.setAllVisibleChecked(checked);
            }));
            this._register(dom.addDisposableListener(checkAll, dom.EventType.CLICK, e => {
                if (e.x || e.y) { // Avoid 'click' triggered by 'space'...
                    inputBox.setFocus();
                }
            }));
            const description2 = dom.append(headerContainer, $('.quick-input-description'));
            const inputContainer = dom.append(headerContainer, $('.quick-input-and-message'));
            const filterContainer = dom.append(inputContainer, $('.quick-input-filter'));
            const inputBox = this._register(new quickInputBox_1.QuickInputBox(filterContainer, this.styles.inputBox, this.styles.toggle));
            inputBox.setAttribute('aria-describedby', `${this.idPrefix}message`);
            const visibleCountContainer = dom.append(filterContainer, $('.quick-input-visible-count'));
            visibleCountContainer.setAttribute('aria-live', 'polite');
            visibleCountContainer.setAttribute('aria-atomic', 'true');
            const visibleCount = new countBadge_1.CountBadge(visibleCountContainer, { countFormat: (0, nls_1.localize)({ key: 'quickInput.visibleCount', comment: ['This tells the user how many items are shown in a list of items to select from. The items can be anything. Currently not visible, but read by screen readers.'] }, "{0} Results") }, this.styles.countBadge);
            const countContainer = dom.append(filterContainer, $('.quick-input-count'));
            countContainer.setAttribute('aria-live', 'polite');
            const count = new countBadge_1.CountBadge(countContainer, { countFormat: (0, nls_1.localize)({ key: 'quickInput.countSelected', comment: ['This tells the user how many items are selected in a list of items to select from. The items can be anything.'] }, "{0} Selected") }, this.styles.countBadge);
            const okContainer = dom.append(headerContainer, $('.quick-input-action'));
            const ok = this._register(new button_1.Button(okContainer, this.styles.button));
            ok.label = (0, nls_1.localize)('ok', "OK");
            this._register(ok.onDidClick(e => {
                this.onDidAcceptEmitter.fire();
            }));
            const customButtonContainer = dom.append(headerContainer, $('.quick-input-action'));
            const customButton = this._register(new button_1.Button(customButtonContainer, this.styles.button));
            customButton.label = (0, nls_1.localize)('custom', "Custom");
            this._register(customButton.onDidClick(e => {
                this.onDidCustomEmitter.fire();
            }));
            const message = dom.append(inputContainer, $(`#${this.idPrefix}message.quick-input-message`));
            const progressBar = this._register(new progressbar_1.ProgressBar(container, this.styles.progressBar));
            progressBar.getContainer().classList.add('quick-input-progress');
            const widget = dom.append(container, $('.quick-input-html-widget'));
            widget.tabIndex = -1;
            const description1 = dom.append(container, $('.quick-input-description'));
            const listId = this.idPrefix + 'list';
            const list = this._register(new quickInputList_1.QuickInputList(container, listId, this.options, this.themeService));
            inputBox.setAttribute('aria-controls', listId);
            this._register(list.onDidChangeFocus(() => {
                inputBox.setAttribute('aria-activedescendant', list.getActiveDescendant() ?? '');
            }));
            this._register(list.onChangedAllVisibleChecked(checked => {
                checkAll.checked = checked;
            }));
            this._register(list.onChangedVisibleCount(c => {
                visibleCount.setCount(c);
            }));
            this._register(list.onChangedCheckedCount(c => {
                count.setCount(c);
            }));
            this._register(list.onLeave(() => {
                // Defer to avoid the input field reacting to the triggering key.
                setTimeout(() => {
                    inputBox.setFocus();
                    if (this.controller instanceof quickInput_2.QuickPick && this.controller.canSelectMany) {
                        list.clearFocus();
                    }
                }, 0);
            }));
            const focusTracker = dom.trackFocus(container);
            this._register(focusTracker);
            this._register(dom.addDisposableListener(container, dom.EventType.FOCUS, e => {
                // Ignore focus events within container
                if (dom.isAncestor(e.relatedTarget, container)) {
                    return;
                }
                this.previousFocusElement = e.relatedTarget instanceof HTMLElement ? e.relatedTarget : undefined;
            }, true));
            this._register(focusTracker.onDidBlur(() => {
                if (!this.getUI().ignoreFocusOut && !this.options.ignoreFocusOut()) {
                    this.hide(quickInput_1.QuickInputHideReason.Blur);
                }
                this.previousFocusElement = undefined;
            }));
            this._register(dom.addDisposableListener(container, dom.EventType.FOCUS, (e) => {
                inputBox.setFocus();
            }));
            // TODO: Turn into commands instead of handling KEY_DOWN
            this._register(dom.addStandardDisposableListener(container, dom.EventType.KEY_DOWN, (event) => {
                if (dom.isAncestor(event.target, widget)) {
                    return; // Ignore event if target is inside widget to allow the widget to handle the event.
                }
                switch (event.keyCode) {
                    case 3 /* KeyCode.Enter */:
                        dom.EventHelper.stop(event, true);
                        if (this.enabled) {
                            this.onDidAcceptEmitter.fire();
                        }
                        break;
                    case 9 /* KeyCode.Escape */:
                        dom.EventHelper.stop(event, true);
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
                            if (this.getUI().list.isDisplayed()) {
                                selectors.push('.monaco-list');
                            }
                            // focus links if there are any
                            if (this.getUI().message) {
                                selectors.push('.quick-input-message a');
                            }
                            if (this.getUI().widget) {
                                if (dom.isAncestor(event.target, this.getUI().widget)) {
                                    // let the widget control tab
                                    break;
                                }
                                selectors.push('.quick-input-html-widget');
                            }
                            const stops = container.querySelectorAll(selectors.join(', '));
                            if (event.shiftKey && event.target === stops[0]) {
                                // Clear the focus from the list in order to allow
                                // screen readers to read operations in the input box.
                                dom.EventHelper.stop(event, true);
                                list.clearFocus();
                            }
                            else if (!event.shiftKey && dom.isAncestor(event.target, stops[stops.length - 1])) {
                                dom.EventHelper.stop(event, true);
                                stops[0].focus();
                            }
                        }
                        break;
                    case 10 /* KeyCode.Space */:
                        if (event.ctrlKey) {
                            dom.EventHelper.stop(event, true);
                            this.getUI().list.toggleHover();
                        }
                        break;
                }
            }));
            this.ui = {
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
                onDidAccept: this.onDidAcceptEmitter.event,
                onDidCustom: this.onDidCustomEmitter.event,
                onDidTriggerButton: this.onDidTriggerButtonEmitter.event,
                ignoreFocusOut: false,
                keyMods: this.keyMods,
                show: controller => this.show(controller),
                hide: () => this.hide(),
                setVisibilities: visibilities => this.setVisibilities(visibilities),
                setEnabled: enabled => this.setEnabled(enabled),
                setContextKey: contextKey => this.options.setContextKey(contextKey),
                linkOpenerDelegate: content => this.options.linkOpenerDelegate(content)
            };
            this.updateStyles();
            return this.ui;
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
                        (0, lifecycle_1.dispose)(disposables);
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
        setValidationOnInput(input, validationResult) {
            if (validationResult && (0, types_1.isString)(validationResult)) {
                input.severity = severity_1.default.Error;
                input.validationMessage = validationResult;
            }
            else if (validationResult && !(0, types_1.isString)(validationResult)) {
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
                                this.setValidationOnInput(input, result);
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
                            if (!result || (!(0, types_1.isString)(result) && result.severity !== severity_1.default.Error)) {
                                resolve(value);
                                input.hide();
                            }
                            else if (value === validationValue) {
                                this.setValidationOnInput(input, result);
                            }
                        });
                    }),
                    token.onCancellationRequested(() => {
                        input.hide();
                    }),
                    input.onDidHide(() => {
                        (0, lifecycle_1.dispose)(disposables);
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
            const ui = this.getUI();
            return new quickInput_2.QuickPick(ui);
        }
        createInputBox() {
            const ui = this.getUI();
            return new quickInput_2.InputBox(ui);
        }
        createQuickWidget() {
            const ui = this.getUI();
            return new quickInput_2.QuickWidget(ui);
        }
        show(controller) {
            const ui = this.getUI();
            this.onShowEmitter.fire();
            const oldController = this.controller;
            this.controller = controller;
            oldController?.didHide();
            this.setEnabled(true);
            ui.leftActionBar.clear();
            ui.title.textContent = '';
            ui.description1.textContent = '';
            ui.description2.textContent = '';
            dom.reset(ui.widget);
            ui.rightActionBar.clear();
            ui.checkAll.checked = false;
            // ui.inputBox.value = ''; Avoid triggering an event.
            ui.inputBox.placeholder = '';
            ui.inputBox.password = false;
            ui.inputBox.showDecoration(severity_1.default.Ignore);
            ui.visibleCount.setCount(0);
            ui.count.setCount(0);
            dom.reset(ui.message);
            ui.progressBar.stop();
            ui.list.setElements([]);
            ui.list.matchOnDescription = false;
            ui.list.matchOnDetail = false;
            ui.list.matchOnLabel = true;
            ui.list.sortByLabel = true;
            ui.ignoreFocusOut = false;
            ui.inputBox.toggles = undefined;
            const backKeybindingLabel = this.options.backKeybindingLabel();
            quickInput_2.backButton.tooltip = backKeybindingLabel ? (0, nls_1.localize)('quickInput.backWithKeybinding', "Back ({0})", backKeybindingLabel) : (0, nls_1.localize)('quickInput.back', "Back");
            ui.container.style.display = '';
            this.updateLayout();
            ui.inputBox.setFocus();
        }
        setVisibilities(visibilities) {
            const ui = this.getUI();
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
            this.updateLayout(); // TODO
        }
        setEnabled(enabled) {
            if (enabled !== this.enabled) {
                this.enabled = enabled;
                for (const item of this.getUI().leftActionBar.viewItems) {
                    item.action.enabled = enabled;
                }
                for (const item of this.getUI().rightActionBar.viewItems) {
                    item.action.enabled = enabled;
                }
                this.getUI().checkAll.disabled = !enabled;
                this.getUI().inputBox.enabled = enabled;
                this.getUI().ok.enabled = enabled;
                this.getUI().list.enabled = enabled;
            }
        }
        hide(reason) {
            const controller = this.controller;
            if (!controller) {
                return;
            }
            const focusChanged = !dom.isAncestor(document.activeElement, this.ui?.container ?? null);
            this.controller = null;
            this.onHideEmitter.fire();
            this.getUI().container.style.display = 'none';
            if (!focusChanged) {
                let currentElement = this.previousFocusElement;
                while (currentElement && !currentElement.offsetParent) {
                    currentElement = currentElement.parentElement ?? undefined;
                }
                if (currentElement?.offsetParent) {
                    currentElement.focus();
                    this.previousFocusElement = undefined;
                }
                else {
                    this.options.returnFocus();
                }
            }
            controller.didHide(reason);
        }
        focus() {
            if (this.isDisplayed()) {
                const ui = this.getUI();
                if (ui.inputBox.enabled) {
                    ui.inputBox.setFocus();
                }
                else {
                    ui.list.domFocus();
                }
            }
        }
        toggle() {
            if (this.isDisplayed() && this.controller instanceof quickInput_2.QuickPick && this.controller.canSelectMany) {
                this.getUI().list.toggleCheckbox();
            }
        }
        navigate(next, quickNavigate) {
            if (this.isDisplayed() && this.getUI().list.isDisplayed()) {
                this.getUI().list.focus(next ? quickInputList_1.QuickInputListFocus.Next : quickInputList_1.QuickInputListFocus.Previous);
                if (quickNavigate && this.controller instanceof quickInput_2.QuickPick) {
                    this.controller.quickNavigate = quickNavigate;
                }
            }
        }
        async accept(keyMods = { alt: false, ctrlCmd: false }) {
            // When accepting the item programmatically, it is important that
            // we update `keyMods` either from the provided set or unset it
            // because the accept did not happen from mouse or keyboard
            // interaction on the list itself
            this.keyMods.alt = keyMods.alt;
            this.keyMods.ctrlCmd = keyMods.ctrlCmd;
            this.onDidAcceptEmitter.fire();
        }
        async back() {
            this.onDidTriggerButtonEmitter.fire(this.backButton);
        }
        async cancel() {
            this.hide();
        }
        layout(dimension, titleBarOffset) {
            this.dimension = dimension;
            this.titleBarOffset = titleBarOffset;
            this.updateLayout();
        }
        updateLayout() {
            if (this.ui && this.isDisplayed()) {
                this.ui.container.style.top = `${this.titleBarOffset}px`;
                const style = this.ui.container.style;
                const width = Math.min(this.dimension.width * 0.62 /* golden cut */, QuickInputController.MAX_WIDTH);
                style.width = width + 'px';
                style.marginLeft = '-' + (width / 2) + 'px';
                this.ui.inputBox.layout();
                this.ui.list.layout(this.dimension && this.dimension.height * 0.4);
            }
        }
        applyStyles(styles) {
            this.styles = styles;
            this.updateStyles();
        }
        updateStyles() {
            if (this.ui) {
                const { quickInputTitleBackground, quickInputBackground, quickInputForeground, widgetBorder, widgetShadow, } = this.styles.widget;
                this.ui.titleBar.style.backgroundColor = quickInputTitleBackground ?? '';
                this.ui.container.style.backgroundColor = quickInputBackground ?? '';
                this.ui.container.style.color = quickInputForeground ?? '';
                this.ui.container.style.border = widgetBorder ? `1px solid ${widgetBorder}` : '';
                this.ui.container.style.boxShadow = widgetShadow ? `0 0 8px 2px ${widgetShadow}` : '';
                this.ui.list.style(this.styles.list);
                const content = [];
                if (this.styles.pickerGroup.pickerGroupBorder) {
                    content.push(`.quick-input-list .quick-input-list-entry { border-top-color:  ${this.styles.pickerGroup.pickerGroupBorder}; }`);
                }
                if (this.styles.pickerGroup.pickerGroupForeground) {
                    content.push(`.quick-input-list .quick-input-list-separator { color:  ${this.styles.pickerGroup.pickerGroupForeground}; }`);
                }
                if (this.styles.pickerGroup.pickerGroupForeground) {
                    content.push(`.quick-input-list .quick-input-list-separator-as-item { color: var(--vscode-descriptionForeground); }`);
                }
                if (this.styles.keybindingLabel.keybindingLabelBackground ||
                    this.styles.keybindingLabel.keybindingLabelBorder ||
                    this.styles.keybindingLabel.keybindingLabelBottomBorder ||
                    this.styles.keybindingLabel.keybindingLabelShadow ||
                    this.styles.keybindingLabel.keybindingLabelForeground) {
                    content.push('.quick-input-list .monaco-keybinding > .monaco-keybinding-key {');
                    if (this.styles.keybindingLabel.keybindingLabelBackground) {
                        content.push(`background-color: ${this.styles.keybindingLabel.keybindingLabelBackground};`);
                    }
                    if (this.styles.keybindingLabel.keybindingLabelBorder) {
                        // Order matters here. `border-color` must come before `border-bottom-color`.
                        content.push(`border-color: ${this.styles.keybindingLabel.keybindingLabelBorder};`);
                    }
                    if (this.styles.keybindingLabel.keybindingLabelBottomBorder) {
                        content.push(`border-bottom-color: ${this.styles.keybindingLabel.keybindingLabelBottomBorder};`);
                    }
                    if (this.styles.keybindingLabel.keybindingLabelShadow) {
                        content.push(`box-shadow: inset 0 -1px 0 ${this.styles.keybindingLabel.keybindingLabelShadow};`);
                    }
                    if (this.styles.keybindingLabel.keybindingLabelForeground) {
                        content.push(`color: ${this.styles.keybindingLabel.keybindingLabelForeground};`);
                    }
                    content.push('}');
                }
                const newStyles = content.join('\n');
                if (newStyles !== this.ui.styleSheet.textContent) {
                    this.ui.styleSheet.textContent = newStyles;
                }
            }
        }
        isDisplayed() {
            return this.ui && this.ui.container.style.display !== 'none';
        }
    }
    exports.QuickInputController = QuickInputController;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicXVpY2tJbnB1dENvbnRyb2xsZXIuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9wbGF0Zm9ybS9xdWlja2lucHV0L2Jyb3dzZXIvcXVpY2tJbnB1dENvbnRyb2xsZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBc0JoRyxNQUFNLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDO0lBRWhCLE1BQWEsb0JBQXFCLFNBQVEsc0JBQVU7aUJBQzNCLGNBQVMsR0FBRyxHQUFHLEFBQU4sQ0FBTyxHQUFDLHdDQUF3QztRQXlCakYsWUFBb0IsT0FBMkIsRUFDN0IsWUFBMkI7WUFDNUMsS0FBSyxFQUFFLENBQUM7WUFGVyxZQUFPLEdBQVAsT0FBTyxDQUFvQjtZQUM3QixpQkFBWSxHQUFaLFlBQVksQ0FBZTtZQXBCckMsWUFBTyxHQUFHLElBQUksQ0FBQztZQUNOLHVCQUFrQixHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxlQUFPLEVBQVEsQ0FBQyxDQUFDO1lBQ3pELHVCQUFrQixHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxlQUFPLEVBQVEsQ0FBQyxDQUFDO1lBQ3pELDhCQUF5QixHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxlQUFPLEVBQXFCLENBQUMsQ0FBQztZQUN0RixZQUFPLEdBQXdCLEVBQUUsT0FBTyxFQUFFLEtBQUssRUFBRSxHQUFHLEVBQUUsS0FBSyxFQUFFLENBQUM7WUFFOUQsZUFBVSxHQUF1QixJQUFJLENBQUM7WUFLdEMsa0JBQWEsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksZUFBTyxFQUFRLENBQUMsQ0FBQztZQUNuRCxXQUFNLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUM7WUFFbkMsa0JBQWEsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksZUFBTyxFQUFRLENBQUMsQ0FB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