/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/keyboardEvent", "vs/base/browser/ui/toggle/toggle", "vs/base/common/actions", "vs/base/common/arrays", "vs/base/common/async", "vs/base/common/codicons", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/platform", "vs/base/common/severity", "vs/base/common/themables", "vs/nls", "vs/platform/quickinput/common/quickInput", "./quickInputList", "./quickInputUtils", "vs/css!./media/quickInput"], function (require, exports, dom, keyboardEvent_1, toggle_1, actions_1, arrays_1, async_1, codicons_1, event_1, lifecycle_1, platform_1, severity_1, themables_1, nls_1, quickInput_1, quickInputList_1, quickInputUtils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.QuickWidget = exports.InputBox = exports.QuickPick = exports.backButton = void 0;
    exports.backButton = {
        iconClass: themables_1.ThemeIcon.asClassName(codicons_1.Codicon.quickInputBack),
        tooltip: (0, nls_1.localize)('quickInput.back', "Back"),
        handle: -1 // TODO
    };
    class QuickInput extends lifecycle_1.Disposable {
        static { this.noPromptMessage = (0, nls_1.localize)('inputModeEntry', "Press 'Enter' to confirm your input or 'Escape' to cancel"); }
        constructor(ui) {
            super();
            this.ui = ui;
            this._widgetUpdated = false;
            this.visible = false;
            this._enabled = true;
            this._busy = false;
            this._ignoreFocusOut = false;
            this._buttons = [];
            this.buttonsUpdated = false;
            this._toggles = [];
            this.togglesUpdated = false;
            this.noValidationMessage = QuickInput.noPromptMessage;
            this._severity = severity_1.default.Ignore;
            this.onDidTriggerButtonEmitter = this._register(new event_1.Emitter());
            this.onDidHideEmitter = this._register(new event_1.Emitter());
            this.onDisposeEmitter = this._register(new event_1.Emitter());
            this.visibleDisposables = this._register(new lifecycle_1.DisposableStore());
            this.onDidTriggerButton = this.onDidTriggerButtonEmitter.event;
            this.onDidHide = this.onDidHideEmitter.event;
            this.onDispose = this.onDisposeEmitter.event;
        }
        get title() {
            return this._title;
        }
        set title(title) {
            this._title = title;
            this.update();
        }
        get description() {
            return this._description;
        }
        set description(description) {
            this._description = description;
            this.update();
        }
        get widget() {
            return this._widget;
        }
        set widget(widget) {
            if (!(widget instanceof HTMLElement)) {
                return;
            }
            if (this._widget !== widget) {
                this._widget = widget;
                this._widgetUpdated = true;
                this.update();
            }
        }
        get step() {
            return this._steps;
        }
        set step(step) {
            this._steps = step;
            this.update();
        }
        get totalSteps() {
            return this._totalSteps;
        }
        set totalSteps(totalSteps) {
            this._totalSteps = totalSteps;
            this.update();
        }
        get enabled() {
            return this._enabled;
        }
        set enabled(enabled) {
            this._enabled = enabled;
            this.update();
        }
        get contextKey() {
            return this._contextKey;
        }
        set contextKey(contextKey) {
            this._contextKey = contextKey;
            this.update();
        }
        get busy() {
            return this._busy;
        }
        set busy(busy) {
            this._busy = busy;
            this.update();
        }
        get ignoreFocusOut() {
            return this._ignoreFocusOut;
        }
        set ignoreFocusOut(ignoreFocusOut) {
            const shouldUpdate = this._ignoreFocusOut !== ignoreFocusOut && !platform_1.isIOS;
            this._ignoreFocusOut = ignoreFocusOut && !platform_1.isIOS;
            if (shouldUpdate) {
                this.update();
            }
        }
        get buttons() {
            return this._buttons;
        }
        set buttons(buttons) {
            this._buttons = buttons;
            this.buttonsUpdated = true;
            this.update();
        }
        get toggles() {
            return this._toggles;
        }
        set toggles(toggles) {
            this._toggles = toggles ?? [];
            this.togglesUpdated = true;
            this.update();
        }
        get validationMessage() {
            return this._validationMessage;
        }
        set validationMessage(validationMessage) {
            this._validationMessage = validationMessage;
            this.update();
        }
        get severity() {
            return this._severity;
        }
        set severity(severity) {
            this._severity = severity;
            this.update();
        }
        show() {
            if (this.visible) {
                return;
            }
            this.visibleDisposables.add(this.ui.onDidTriggerButton(button => {
                if (this.buttons.indexOf(button) !== -1) {
                    this.onDidTriggerButtonEmitter.fire(button);
                }
            }));
            this.ui.show(this);
            // update properties in the controller that get reset in the ui.show() call
            this.visible = true;
            // This ensures the message/prompt gets rendered
            this._lastValidationMessage = undefined;
            // This ensures the input box has the right severity applied
            this._lastSeverity = undefined;
            if (this.buttons.length) {
                // if there are buttons, the ui.show() clears them out of the UI so we should
                // rerender them.
                this.buttonsUpdated = true;
            }
            if (this.toggles.length) {
                // if there are toggles, the ui.show() clears them out of the UI so we should
                // rerender them.
                this.togglesUpdated = true;
            }
            this.update();
        }
        hide() {
            if (!this.visible) {
                return;
            }
            this.ui.hide();
        }
        didHide(reason = quickInput_1.QuickInputHideReason.Other) {
            this.visible = false;
            this.visibleDisposables.clear();
            this.onDidHideEmitter.fire({ reason });
        }
        update() {
            if (!this.visible) {
                return;
            }
            const title = this.getTitle();
            if (title && this.ui.title.textContent !== title) {
                this.ui.title.textContent = title;
            }
            else if (!title && this.ui.title.innerHTML !== '&nbsp;') {
                this.ui.title.innerText = '\u00a0';
            }
            const description = this.getDescription();
            if (this.ui.description1.textContent !== description) {
                this.ui.description1.textContent = description;
            }
            if (this.ui.description2.textContent !== description) {
                this.ui.description2.textContent = description;
            }
            if (this._widgetUpdated) {
                this._widgetUpdated = false;
                if (this._widget) {
                    dom.reset(this.ui.widget, this._widget);
                }
                else {
                    dom.reset(this.ui.widget);
                }
            }
            if (this.busy && !this.busyDelay) {
                this.busyDelay = new async_1.TimeoutTimer();
                this.busyDelay.setIfNotSet(() => {
                    if (this.visible) {
                        this.ui.progressBar.infinite();
                    }
                }, 800);
            }
            if (!this.busy && this.busyDelay) {
                this.ui.progressBar.stop();
                this.busyDelay.cancel();
                this.busyDelay = undefined;
            }
            if (this.buttonsUpdated) {
                this.buttonsUpdated = false;
                this.ui.leftActionBar.clear();
                const leftButtons = this.buttons.filter(button => button === exports.backButton);
                this.ui.leftActionBar.push(leftButtons.map((button, index) => {
                    const action = new actions_1.Action(`id-${index}`, '', button.iconClass || (0, quickInputUtils_1.getIconClass)(button.iconPath), true, async () => {
                        this.onDidTriggerButtonEmitter.fire(button);
                    });
                    action.tooltip = button.tooltip || '';
                    return action;
                }), { icon: true, label: false });
                this.ui.rightActionBar.clear();
                const rightButtons = this.buttons.filter(button => button !== exports.backButton);
                this.ui.rightActionBar.push(rightButtons.map((button, index) => {
                    const action = new actions_1.Action(`id-${index}`, '', button.iconClass || (0, quickInputUtils_1.getIconClass)(button.iconPath), true, async () => {
                        this.onDidTriggerButtonEmitter.fire(button);
                    });
                    action.tooltip = button.tooltip || '';
                    return action;
                }), { icon: true, label: false });
            }
            if (this.togglesUpdated) {
                this.togglesUpdated = false;
                // HACK: Filter out toggles here that are not concrete Toggle objects. This is to workaround
                // a layering issue as quick input's interface is in common but Toggle is in browser and
                // it requires a HTMLElement on its interface
                const concreteToggles = this.toggles?.filter(opts => opts instanceof toggle_1.Toggle) ?? [];
                this.ui.inputBox.toggles = concreteToggles;
            }
            this.ui.ignoreFocusOut = this.ignoreFocusOut;
            this.ui.setEnabled(this.enabled);
            this.ui.setContextKey(this.contextKey);
            const validationMessage = this.validationMessage || this.noValidationMessage;
            if (this._lastValidationMessage !== validationMessage) {
                this._lastValidationMessage = validationMessage;
                dom.reset(this.ui.message);
                (0, quickInputUtils_1.renderQuickInputDescription)(validationMessage, this.ui.message, {
                    callback: (content) => {
                        this.ui.linkOpenerDelegate(content);
                    },
                    disposables: this.visibleDisposables,
                });
            }
            if (this._lastSeverity !== this.severity) {
                this._lastSeverity = this.severity;
                this.showMessageDecoration(this.severity);
            }
        }
        getTitle() {
            if (this.title && this.step) {
                return `${this.title} (${this.getSteps()})`;
            }
            if (this.title) {
                return this.title;
            }
            if (this.step) {
                return this.getSteps();
            }
            return '';
        }
        getDescription() {
            return this.description || '';
        }
        getSteps() {
            if (this.step && this.totalSteps) {
                return (0, nls_1.localize)('quickInput.steps', "{0}/{1}", this.step, this.totalSteps);
            }
            if (this.step) {
                return String(this.step);
            }
            return '';
        }
        showMessageDecoration(severity) {
            this.ui.inputBox.showDecoration(severity);
            if (severity !== severity_1.default.Ignore) {
                const styles = this.ui.inputBox.stylesForType(severity);
                this.ui.message.style.color = styles.foreground ? `${styles.foreground}` : '';
                this.ui.message.style.backgroundColor = styles.background ? `${styles.background}` : '';
                this.ui.message.style.border = styles.border ? `1px solid ${styles.border}` : '';
                this.ui.message.style.marginBottom = '-2px';
            }
            else {
                this.ui.message.style.color = '';
                this.ui.message.style.backgroundColor = '';
                this.ui.message.style.border = '';
                this.ui.message.style.marginBottom = '';
            }
        }
        dispose() {
            this.hide();
            this.onDisposeEmitter.fire();
            super.dispose();
        }
    }
    class QuickPick extends QuickInput {
        constructor() {
            super(...arguments);
            this._value = '';
            this.onDidChangeValueEmitter = this._register(new event_1.Emitter());
            this.onWillAcceptEmitter = this._register(new event_1.Emitter());
            this.onDidAcceptEmitter = this._register(new event_1.Emitter());
            this.onDidCustomEmitter = this._register(new event_1.Emitter());
            this._items = [];
            this.itemsUpdated = false;
            this._canSelectMany = false;
            this._canAcceptInBackground = false;
            this._matchOnDescription = false;
            this._matchOnDetail = false;
            this._matchOnLabel = true;
            this._matchOnLabelMode = 'fuzzy';
            this._sortByLabel = true;
            this._autoFocusOnList = true;
            this._keepScrollPosition = false;
            this._itemActivation = quickInput_1.ItemActivation.FIRST;
            this._activeItems = [];
            this.activeItemsUpdated = false;
            this.activeItemsToConfirm = [];
            this.onDidChangeActiveEmitter = this._register(new event_1.Emitter());
            this._selectedItems = [];
            this.selectedItemsUpdated = false;
            this.selectedItemsToConfirm = [];
            this.onDidChangeSelectionEmitter = this._register(new event_1.Emitter());
            this.onDidTriggerItemButtonEmitter = this._register(new event_1.Emitter());
            this.onDidTriggerSeparatorButtonEmitter = this._register(new event_1.Emitter());
            this.valueSelectionUpdated = true;
            this._ok = 'default';
            this._customButton = false;
            this.filterValue = (value) => value;
            this.onDidChangeValue = this.onDidChangeValueEmitter.event;
            this.onWillAccept = this.onWillAcceptEmitter.event;
            this.onDidAccept = this.onDidAcceptEmitter.event;
            this.onDidCustom = this.onDidCustomEmitter.event;
            this.onDidChangeActive = this.onDidChangeActiveEmitter.event;
            this.onDidChangeSelection = this.onDidChangeSelectionEmitter.event;
            this.onDidTriggerItemButton = this.onDidTriggerItemButtonEmitter.event;
            this.onDidTriggerSeparatorButton = this.onDidTriggerSeparatorButtonEmitter.event;
        }
        static { this.DEFAULT_ARIA_LABEL = (0, nls_1.localize)('quickInputBox.ariaLabel', "Type to narrow down results."); }
        get quickNavigate() {
            return this._quickNavigate;
        }
        set quickNavigate(quickNavigate) {
            this._quickNavigate = quickNavigate;
            this.update();
        }
        get value() {
            return this._value;
        }
        set value(value) {
            this.doSetValue(value);
        }
        doSetValue(value, skipUpdate) {
            if (this._value !== value) {
                this._value = value;
                if (!skipUpdate) {
                    this.update();
                }
                if (this.visible) {
                    const didFilter = this.ui.list.filter(this.filterValue(this._value));
                    if (didFilter) {
                        this.trySelectFirst();
                    }
                }
                this.onDidChangeValueEmitter.fire(this._value);
            }
        }
        set ariaLabel(ariaLabel) {
            this._ariaLabel = ariaLabel;
            this.update();
        }
        get ariaLabel() {
            return this._ariaLabel;
        }
        get placeholder() {
            return this._placeholder;
        }
        set placeholder(placeholder) {
            this._placeholder = placeholder;
            this.update();
        }
        get items() {
            return this._items;
        }
        get scrollTop() {
            return this.ui.list.scrollTop;
        }
        set scrollTop(scrollTop) {
            this.ui.list.scrollTop = scrollTop;
        }
        set items(items) {
            this._items = items;
            this.itemsUpdated = true;
            this.update();
        }
        get canSelectMany() {
            return this._canSelectMany;
        }
        set canSelectMany(canSelectMany) {
            this._canSelectMany = canSelectMany;
            this.update();
        }
        get canAcceptInBackground() {
            return this._canAcceptInBackground;
        }
        set canAcceptInBackground(canAcceptInBackground) {
            this._canAcceptInBackground = canAcceptInBackground;
        }
        get matchOnDescription() {
            return this._matchOnDescription;
        }
        set matchOnDescription(matchOnDescription) {
            this._matchOnDescription = matchOnDescription;
            this.update();
        }
        get matchOnDetail() {
            return this._matchOnDetail;
        }
        set matchOnDetail(matchOnDetail) {
            this._matchOnDetail = matchOnDetail;
            this.update();
        }
        get matchOnLabel() {
            return this._matchOnLabel;
        }
        set matchOnLabel(matchOnLabel) {
            this._matchOnLabel = matchOnLabel;
            this.update();
        }
        get matchOnLabelMode() {
            return this._matchOnLabelMode;
        }
        set matchOnLabelMode(matchOnLabelMode) {
            this._matchOnLabelMode = matchOnLabelMode;
            this.update();
        }
        get sortByLabel() {
            return this._sortByLabel;
        }
        set sortByLabel(sortByLabel) {
            this._sortByLabel = sortByLabel;
            this.update();
        }
        get autoFocusOnList() {
            return this._autoFocusOnList;
        }
        set autoFocusOnList(autoFocusOnList) {
            this._autoFocusOnList = autoFocusOnList;
            this.update();
        }
        get keepScrollPosition() {
            return this._keepScrollPosition;
        }
        set keepScrollPosition(keepScrollPosition) {
            this._keepScrollPosition = keepScrollPosition;
        }
        get itemActivation() {
            return this._itemActivation;
        }
        set itemActivation(itemActivation) {
            this._itemActivation = itemActivation;
        }
        get activeItems() {
            return this._activeItems;
        }
        set activeItems(activeItems) {
            this._activeItems = activeItems;
            this.activeItemsUpdated = true;
            this.update();
        }
        get selectedItems() {
            return this._selectedItems;
        }
        set selectedItems(selectedItems) {
            this._selectedItems = selectedItems;
            this.selectedItemsUpdated = true;
            this.update();
        }
        get keyMods() {
            if (this._quickNavigate) {
                // Disable keyMods when quick navigate is enabled
                // because in this model the interaction is purely
                // keyboard driven and Ctrl/Alt are typically
                // pressed and hold during this interaction.
                return quickInput_1.NO_KEY_MODS;
            }
            return this.ui.keyMods;
        }
        set valueSelection(valueSelection) {
            this._valueSelection = valueSelection;
            this.valueSelectionUpdated = true;
            this.update();
        }
        get customButton() {
            return this._customButton;
        }
        set customButton(showCustomButton) {
            this._customButton = showCustomButton;
            this.update();
        }
        get customLabel() {
            return this._customButtonLabel;
        }
        set customLabel(label) {
            this._customButtonLabel = label;
            this.update();
        }
        get customHover() {
            return this._customButtonHover;
        }
        set customHover(hover) {
            this._customButtonHover = hover;
            this.update();
        }
        get ok() {
            return this._ok;
        }
        set ok(showOkButton) {
            this._ok = showOkButton;
            this.update();
        }
        inputHasFocus() {
            return this.visible ? this.ui.inputBox.hasFocus() : false;
        }
        focusOnInput() {
            this.ui.inputBox.setFocus();
        }
        get hideInput() {
            return !!this._hideInput;
        }
        set hideInput(hideInput) {
            this._hideInput = hideInput;
            this.update();
        }
        get hideCountBadge() {
            return !!this._hideCountBadge;
        }
        set hideCountBadge(hideCountBadge) {
            this._hideCountBadge = hideCountBadge;
            this.update();
        }
        get hideCheckAll() {
            return !!this._hideCheckAll;
        }
        set hideCheckAll(hideCheckAll) {
            this._hideCheckAll = hideCheckAll;
            this.update();
        }
        trySelectFirst() {
            if (this.autoFocusOnList) {
                if (!this.canSelectMany) {
                    this.ui.list.focus(quickInputList_1.QuickInputListFocus.First);
                }
            }
        }
        show() {
            if (!this.visible) {
                this.visibleDisposables.add(this.ui.inputBox.onDidChange(value => {
                    this.doSetValue(value, true /* skip update since this originates from the UI */);
                }));
                this.visibleDisposables.add(this.ui.inputBox.onMouseDown(event => {
                    if (!this.autoFocusOnList) {
                        this.ui.list.clearFocus();
                    }
                }));
                this.visibleDisposables.add((this._hideInput ? this.ui.list : this.ui.inputBox).onKeyDown((event) => {
                    switch (event.keyCode) {
                        case 18 /* KeyCode.DownArrow */:
                            this.ui.list.focus(quickInputList_1.QuickInputListFocus.Next);
                            if (this.canSelectMany) {
                                this.ui.list.domFocus();
                            }
                            dom.EventHelper.stop(event, true);
                            break;
                        case 16 /* KeyCode.UpArrow */:
                            if (this.ui.list.getFocusedElements().length) {
                                this.ui.list.focus(quickInputList_1.QuickInputListFocus.Previous);
                            }
                            else {
                                this.ui.list.focus(quickInputList_1.QuickInputListFocus.Last);
                            }
                            if (this.canSelectMany) {
                                this.ui.list.domFocus();
                            }
                            dom.EventHelper.stop(event, true);
                            break;
                        case 12 /* KeyCode.PageDown */:
                            this.ui.list.focus(quickInputList_1.QuickInputListFocus.NextPage);
                            if (this.canSelectMany) {
                                this.ui.list.domFocus();
                            }
                            dom.EventHelper.stop(event, true);
                            break;
                        case 11 /* KeyCode.PageUp */:
                            this.ui.list.focus(quickInputList_1.QuickInputListFocus.PreviousPage);
                            if (this.canSelectMany) {
                                this.ui.list.domFocus();
                            }
                            dom.EventHelper.stop(event, true);
                            break;
                        case 17 /* KeyCode.RightArrow */:
                            if (!this._canAcceptInBackground) {
                                return; // needs to be enabled
                            }
                            if (!this.ui.inputBox.isSelectionAtEnd()) {
                                return; // ensure input box selection at end
                            }
                            if (this.activeItems[0]) {
                                this._selectedItems = [this.activeItems[0]];
                                this.onDidChangeSelectionEmitter.fire(this.selectedItems);
                                this.handleAccept(true);
                            }
                            break;
                        case 14 /* KeyCode.Home */:
                            if ((event.ctrlKey || event.metaKey) && !event.shiftKey && !event.altKey) {
                                this.ui.list.focus(quickInputList_1.QuickInputListFocus.First);
                                dom.EventHelper.stop(event, true);
                            }
                            break;
                        case 13 /* KeyCode.End */:
                            if ((event.ctrlKey || event.metaKey) && !event.shiftKey && !event.altKey) {
                                this.ui.list.focus(quickInputList_1.QuickInputListFocus.Last);
                                dom.EventHelper.stop(event, true);
                            }
                            break;
                    }
                }));
                this.visibleDisposables.add(this.ui.onDidAccept(() => {
                    if (this.canSelectMany) {
                        // if there are no checked elements, it means that an onDidChangeSelection never fired to overwrite
                        // `_selectedItems`. In that case, we should emit one with an empty array to ensure that
                        // `.selectedItems` is up to date.
                        if (!this.ui.list.getCheckedElements().length) {
                            this._selectedItems = [];
                            this.onDidChangeSelectionEmitter.fire(this.selectedItems);
                        }
                    }
                    else if (this.activeItems[0]) {
                        // For single-select, we set `selectedItems` to the item that was accepted.
                        this._selectedItems = [this.activeItems[0]];
                        this.onDidChangeSelectionEmitter.fire(this.selectedItems);
                    }
                    this.handleAccept(false);
                }));
                this.visibleDisposables.add(this.ui.onDidCustom(() => {
                    this.onDidCustomEmitter.fire();
                }));
                this.visibleDisposables.add(this.ui.list.onDidChangeFocus(focusedItems => {
                    if (this.activeItemsUpdated) {
                        return; // Expect another event.
                    }
                    if (this.activeItemsToConfirm !== this._activeItems && (0, arrays_1.equals)(focusedItems, this._activeItems, (a, b) => a === b)) {
                        return;
                    }
                    this._activeItems = focusedItems;
                    this.onDidChangeActiveEmitter.fire(focusedItems);
                }));
                this.visibleDisposables.add(this.ui.list.onDidChangeSelection(({ items: selectedItems, event }) => {
                    if (this.canSelectMany) {
                        if (selectedItems.length) {
                            this.ui.list.setSelectedElements([]);
                        }
                        return;
                    }
                    if (this.selectedItemsToConfirm !== this._selectedItems && (0, arrays_1.equals)(selectedItems, this._selectedItems, (a, b) => a === b)) {
                        return;
                    }
                    this._selectedItems = selectedItems;
                    this.onDidChangeSelectionEmitter.fire(selectedItems);
                    if (selectedItems.length) {
                        this.handleAccept(event instanceof MouseEvent && event.button === 1 /* mouse middle click */);
                    }
                }));
                this.visibleDisposables.add(this.ui.list.onChangedCheckedElements(checkedItems => {
                    if (!this.canSelectMany) {
                        return;
                    }
                    if (this.selectedItemsToConfirm !== this._selectedItems && (0, arrays_1.equals)(checkedItems, this._selectedItems, (a, b) => a === b)) {
                        return;
                    }
                    this._selectedItems = checkedItems;
                    this.onDidChangeSelectionEmitter.fire(checkedItems);
                }));
                this.visibleDisposables.add(this.ui.list.onButtonTriggered(event => this.onDidTriggerItemButtonEmitter.fire(event)));
                this.visibleDisposables.add(this.ui.list.onSeparatorButtonTriggered(event => this.onDidTriggerSeparatorButtonEmitter.fire(event)));
                this.visibleDisposables.add(this.registerQuickNavigation());
                this.valueSelectionUpdated = true;
            }
            super.show(); // TODO: Why have show() bubble up while update() trickles down?
        }
        handleAccept(inBackground) {
            // Figure out veto via `onWillAccept` event
            let veto = false;
            this.onWillAcceptEmitter.fire({ veto: () => veto = true });
            // Continue with `onDidAccept` if no veto
            if (!veto) {
                this.onDidAcceptEmitter.fire({ inBackground });
            }
        }
        registerQuickNavigation() {
            return dom.addDisposableListener(this.ui.container, dom.EventType.KEY_UP, e => {
                if (this.canSelectMany || !this._quickNavigate) {
                    return;
                }
                const keyboardEvent = new keyboardEvent_1.StandardKeyboardEvent(e);
                const keyCode = keyboardEvent.keyCode;
                // Select element when keys are pressed that signal it
                const quickNavKeys = this._quickNavigate.keybindings;
                const wasTriggerKeyPressed = quickNavKeys.some(k => {
                    const chords = k.getChords();
                    if (chords.length > 1) {
                        return false;
                    }
                    if (chords[0].shiftKey && keyCode === 4 /* KeyCode.Shift */) {
                        if (keyboardEvent.ctrlKey || keyboardEvent.altKey || keyboardEvent.metaKey) {
                            return false; // this is an optimistic check for the shift key being used to navigate back in quick input
                        }
                        return true;
                    }
                    if (chords[0].altKey && keyCode === 6 /* KeyCode.Alt */) {
                        return true;
                    }
                    if (chords[0].ctrlKey && keyCode === 5 /* KeyCode.Ctrl */) {
                        return true;
                    }
                    if (chords[0].metaKey && keyCode === 57 /* KeyCode.Meta */) {
                        return true;
                    }
                    return false;
                });
                if (wasTriggerKeyPressed) {
                    if (this.activeItems[0]) {
                        this._selectedItems = [this.activeItems[0]];
                        this.onDidChangeSelectionEmitter.fire(this.selectedItems);
                        this.handleAccept(false);
                    }
                    // Unset quick navigate after press. It is only valid once
                    // and should not result in any behaviour change afterwards
                    // if the picker remains open because there was no active item
                    this._quickNavigate = undefined;
                }
            });
        }
        update() {
            if (!this.visible) {
                return;
            }
            // store the scrollTop before it is reset
            const scrollTopBefore = this.keepScrollPosition ? this.scrollTop : 0;
            const hasDescription = !!this.description;
            const visibilities = {
                title: !!this.title || !!this.step || !!this.buttons.length,
                description: hasDescription,
                checkAll: this.canSelectMany && !this._hideCheckAll,
                checkBox: this.canSelectMany,
                inputBox: !this._hideInput,
                progressBar: !this._hideInput || hasDescription,
                visibleCount: true,
                count: this.canSelectMany && !this._hideCountBadge,
                ok: this.ok === 'default' ? this.canSelectMany : this.ok,
                list: true,
                message: !!this.validationMessage,
                customButton: this.customButton
            };
            this.ui.setVisibilities(visibilities);
            super.update();
            if (this.ui.inputBox.value !== this.value) {
                this.ui.inputBox.value = this.value;
            }
            if (this.valueSelectionUpdated) {
                this.valueSelectionUpdated = false;
                this.ui.inputBox.select(this._valueSelection && { start: this._valueSelection[0], end: this._valueSelection[1] });
            }
            if (this.ui.inputBox.placeholder !== (this.placeholder || '')) {
                this.ui.inputBox.placeholder = (this.placeholder || '');
            }
            let ariaLabel = this.ariaLabel;
            // Only set aria label to the input box placeholder if we actually have an input box.
            if (!ariaLabel && visibilities.inputBox) {
                ariaLabel = this.placeholder || QuickPick.DEFAULT_ARIA_LABEL;
                // If we have a title, include it in the aria label.
                if (this.title) {
                    ariaLabel += ` - ${this.title}`;
                }
            }
            if (this.ui.list.ariaLabel !== ariaLabel) {
                this.ui.list.ariaLabel = ariaLabel ?? null;
            }
            this.ui.list.matchOnDescription = this.matchOnDescription;
            this.ui.list.matchOnDetail = this.matchOnDetail;
            this.ui.list.matchOnLabel = this.matchOnLabel;
            this.ui.list.matchOnLabelMode = this.matchOnLabelMode;
            this.ui.list.sortByLabel = this.sortByLabel;
            if (this.itemsUpdated) {
                this.itemsUpdated = false;
                this.ui.list.setElements(this.items);
                this.ui.list.filter(this.filterValue(this.ui.inputBox.value));
                this.ui.checkAll.checked = this.ui.list.getAllVisibleChecked();
                this.ui.visibleCount.setCount(this.ui.list.getVisibleCount());
                this.ui.count.setCount(this.ui.list.getCheckedCount());
                switch (this._itemActivation) {
                    case quickInput_1.ItemActivation.NONE:
                        this._itemActivation = quickInput_1.ItemActivation.FIRST; // only valid once, then unset
                        break;
                    case quickInput_1.ItemActivation.SECOND:
                        this.ui.list.focus(quickInputList_1.QuickInputListFocus.Second);
                        this._itemActivation = quickInput_1.ItemActivation.FIRST; // only valid once, then unset
                        break;
                    case quickInput_1.ItemActivation.LAST:
                        this.ui.list.focus(quickInputList_1.QuickInputListFocus.Last);
                        this._itemActivation = quickInput_1.ItemActivation.FIRST; // only valid once, then unset
                        break;
                    default:
                        this.trySelectFirst();
                        break;
                }
            }
            if (this.ui.container.classList.contains('show-checkboxes') !== !!this.canSelectMany) {
                if (this.canSelectMany) {
                    this.ui.list.clearFocus();
                }
                else {
                    this.trySelectFirst();
                }
            }
            if (this.activeItemsUpdated) {
                this.activeItemsUpdated = false;
                this.activeItemsToConfirm = this._activeItems;
                this.ui.list.setFocusedElements(this.activeItems);
                if (this.activeItemsToConfirm === this._activeItems) {
                    this.activeItemsToConfirm = null;
                }
            }
            if (this.selectedItemsUpdated) {
                this.selectedItemsUpdated = false;
                this.selectedItemsToConfirm = this._selectedItems;
                if (this.canSelectMany) {
                    this.ui.list.setCheckedElements(this.selectedItems);
                }
                else {
                    this.ui.list.setSelectedElements(this.selectedItems);
                }
                if (this.selectedItemsToConfirm === this._selectedItems) {
                    this.selectedItemsToConfirm = null;
                }
            }
            this.ui.customButton.label = this.customLabel || '';
            this.ui.customButton.element.title = this.customHover || '';
            if (!visibilities.inputBox) {
                // we need to move focus into the tree to detect keybindings
                // properly when the input box is not visible (quick nav)
                this.ui.list.domFocus();
                // Focus the first element in the list if multiselect is enabled
                if (this.canSelectMany) {
                    this.ui.list.focus(quickInputList_1.QuickInputListFocus.First);
                }
            }
            // Set the scroll position to what it was before updating the items
            if (this.keepScrollPosition) {
                this.scrollTop = scrollTopBefore;
            }
        }
    }
    exports.QuickPick = QuickPick;
    class InputBox extends QuickInput {
        constructor() {
            super(...arguments);
            this._value = '';
            this.valueSelectionUpdated = true;
            this._password = false;
            this.onDidValueChangeEmitter = this._register(new event_1.Emitter());
            this.onDidAcceptEmitter = this._register(new event_1.Emitter());
            this.onDidChangeValue = this.onDidValueChangeEmitter.event;
            this.onDidAccept = this.onDidAcceptEmitter.event;
        }
        get value() {
            return this._value;
        }
        set value(value) {
            this._value = value || '';
            this.update();
        }
        set valueSelection(valueSelection) {
            this._valueSelection = valueSelection;
            this.valueSelectionUpdated = true;
            this.update();
        }
        get placeholder() {
            return this._placeholder;
        }
        set placeholder(placeholder) {
            this._placeholder = placeholder;
            this.update();
        }
        get password() {
            return this._password;
        }
        set password(password) {
            this._password = password;
            this.update();
        }
        get prompt() {
            return this._prompt;
        }
        set prompt(prompt) {
            this._prompt = prompt;
            this.noValidationMessage = prompt
                ? (0, nls_1.localize)('inputModeEntryDescription', "{0} (Press 'Enter' to confirm or 'Escape' to cancel)", prompt)
                : QuickInput.noPromptMessage;
            this.update();
        }
        show() {
            if (!this.visible) {
                this.visibleDisposables.add(this.ui.inputBox.onDidChange(value => {
                    if (value === this.value) {
                        return;
                    }
                    this._value = value;
                    this.onDidValueChangeEmitter.fire(value);
                }));
                this.visibleDisposables.add(this.ui.onDidAccept(() => this.onDidAcceptEmitter.fire()));
                this.valueSelectionUpdated = true;
            }
            super.show();
        }
        update() {
            if (!this.visible) {
                return;
            }
            this.ui.container.classList.remove('hidden-input');
            const visibilities = {
                title: !!this.title || !!this.step || !!this.buttons.length,
                description: !!this.description || !!this.step,
                inputBox: true,
                message: true,
                progressBar: true
            };
            this.ui.setVisibilities(visibilities);
            super.update();
            if (this.ui.inputBox.value !== this.value) {
                this.ui.inputBox.value = this.value;
            }
            if (this.valueSelectionUpdated) {
                this.valueSelectionUpdated = false;
                this.ui.inputBox.select(this._valueSelection && { start: this._valueSelection[0], end: this._valueSelection[1] });
            }
            if (this.ui.inputBox.placeholder !== (this.placeholder || '')) {
                this.ui.inputBox.placeholder = (this.placeholder || '');
            }
            if (this.ui.inputBox.password !== this.password) {
                this.ui.inputBox.password = this.password;
            }
        }
    }
    exports.InputBox = InputBox;
    class QuickWidget extends QuickInput {
        update() {
            if (!this.visible) {
                return;
            }
            const visibilities = {
                title: !!this.title || !!this.step || !!this.buttons.length,
                description: !!this.description || !!this.step
            };
            this.ui.setVisibilities(visibilities);
            super.update();
        }
    }
    exports.QuickWidget = QuickWidget;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicXVpY2tJbnB1dC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3BsYXRmb3JtL3F1aWNraW5wdXQvYnJvd3Nlci9xdWlja0lucHV0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQXdFbkYsUUFBQSxVQUFVLEdBQUc7UUFDekIsU0FBUyxFQUFFLHFCQUFTLENBQUMsV0FBVyxDQUFDLGtCQUFPLENBQUMsY0FBYyxDQUFDO1FBQ3hELE9BQU8sRUFBRSxJQUFBLGNBQVEsRUFBQyxpQkFBaUIsRUFBRSxNQUFNLENBQUM7UUFDNUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxDQUFDLE9BQU87S0FDbEIsQ0FBQztJQXVERixNQUFNLFVBQVcsU0FBUSxzQkFBVTtpQkFDUixvQkFBZSxHQUFHLElBQUEsY0FBUSxFQUFDLGdCQUFnQixFQUFFLDJEQUEyRCxDQUFDLEFBQTFGLENBQTJGO1FBOEJwSSxZQUNXLEVBQWdCO1lBRTFCLEtBQUssRUFBRSxDQUFDO1lBRkUsT0FBRSxHQUFGLEVBQUUsQ0FBYztZQTFCbkIsbUJBQWMsR0FBRyxLQUFLLENBQUM7WUFHckIsWUFBTyxHQUFHLEtBQUssQ0FBQztZQUNsQixhQUFRLEdBQUcsSUFBSSxDQUFDO1lBRWhCLFVBQUssR0FBRyxLQUFLLENBQUM7WUFDZCxvQkFBZSxHQUFHLEtBQUssQ0FBQztZQUN4QixhQUFRLEdBQXdCLEVBQUUsQ0FBQztZQUNuQyxtQkFBYyxHQUFHLEtBQUssQ0FBQztZQUN2QixhQUFRLEdBQXdCLEVBQUUsQ0FBQztZQUNuQyxtQkFBYyxHQUFHLEtBQUssQ0FBQztZQUNyQix3QkFBbUIsR0FBRyxVQUFVLENBQUMsZUFBZSxDQUFDO1lBR25ELGNBQVMsR0FBYSxrQkFBUSxDQUFDLE1BQU0sQ0FBQztZQUU3Qiw4QkFBeUIsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksZUFBTyxFQUFxQixDQUFDLENBQUM7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