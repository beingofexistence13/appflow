/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/keyboardEvent", "vs/base/browser/ui/toggle/toggle", "vs/base/common/actions", "vs/base/common/arrays", "vs/base/common/async", "vs/base/common/codicons", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/platform", "vs/base/common/severity", "vs/base/common/themables", "vs/nls!vs/platform/quickinput/browser/quickInput", "vs/platform/quickinput/common/quickInput", "./quickInputList", "./quickInputUtils", "vs/css!./media/quickInput"], function (require, exports, dom, keyboardEvent_1, toggle_1, actions_1, arrays_1, async_1, codicons_1, event_1, lifecycle_1, platform_1, severity_1, themables_1, nls_1, quickInput_1, quickInputList_1, quickInputUtils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$EAb = exports.$DAb = exports.$CAb = exports.$BAb = void 0;
    exports.$BAb = {
        iconClass: themables_1.ThemeIcon.asClassName(codicons_1.$Pj.quickInputBack),
        tooltip: (0, nls_1.localize)(0, null),
        handle: -1 // TODO
    };
    class QuickInput extends lifecycle_1.$kc {
        static { this.c = (0, nls_1.localize)(1, null); }
        constructor(R) {
            super();
            this.R = R;
            this.j = false;
            this.r = false;
            this.s = true;
            this.u = false;
            this.w = false;
            this.y = [];
            this.z = false;
            this.C = [];
            this.D = false;
            this.F = QuickInput.c;
            this.I = severity_1.default.Ignore;
            this.L = this.B(new event_1.$fd());
            this.M = this.B(new event_1.$fd());
            this.N = this.B(new event_1.$fd());
            this.O = this.B(new lifecycle_1.$jc());
            this.onDidTriggerButton = this.L.event;
            this.onDidHide = this.M.event;
            this.onDispose = this.N.event;
        }
        get title() {
            return this.f;
        }
        set title(title) {
            this.f = title;
            this.S();
        }
        get description() {
            return this.g;
        }
        set description(description) {
            this.g = description;
            this.S();
        }
        get widget() {
            return this.h;
        }
        set widget(widget) {
            if (!(widget instanceof HTMLElement)) {
                return;
            }
            if (this.h !== widget) {
                this.h = widget;
                this.j = true;
                this.S();
            }
        }
        get step() {
            return this.m;
        }
        set step(step) {
            this.m = step;
            this.S();
        }
        get totalSteps() {
            return this.n;
        }
        set totalSteps(totalSteps) {
            this.n = totalSteps;
            this.S();
        }
        get enabled() {
            return this.s;
        }
        set enabled(enabled) {
            this.s = enabled;
            this.S();
        }
        get contextKey() {
            return this.t;
        }
        set contextKey(contextKey) {
            this.t = contextKey;
            this.S();
        }
        get busy() {
            return this.u;
        }
        set busy(busy) {
            this.u = busy;
            this.S();
        }
        get ignoreFocusOut() {
            return this.w;
        }
        set ignoreFocusOut(ignoreFocusOut) {
            const shouldUpdate = this.w !== ignoreFocusOut && !platform_1.$q;
            this.w = ignoreFocusOut && !platform_1.$q;
            if (shouldUpdate) {
                this.S();
            }
        }
        get buttons() {
            return this.y;
        }
        set buttons(buttons) {
            this.y = buttons;
            this.z = true;
            this.S();
        }
        get toggles() {
            return this.C;
        }
        set toggles(toggles) {
            this.C = toggles ?? [];
            this.D = true;
            this.S();
        }
        get validationMessage() {
            return this.G;
        }
        set validationMessage(validationMessage) {
            this.G = validationMessage;
            this.S();
        }
        get severity() {
            return this.I;
        }
        set severity(severity) {
            this.I = severity;
            this.S();
        }
        show() {
            if (this.r) {
                return;
            }
            this.O.add(this.R.onDidTriggerButton(button => {
                if (this.buttons.indexOf(button) !== -1) {
                    this.L.fire(button);
                }
            }));
            this.R.show(this);
            // update properties in the controller that get reset in the ui.show() call
            this.r = true;
            // This ensures the message/prompt gets rendered
            this.H = undefined;
            // This ensures the input box has the right severity applied
            this.J = undefined;
            if (this.buttons.length) {
                // if there are buttons, the ui.show() clears them out of the UI so we should
                // rerender them.
                this.z = true;
            }
            if (this.toggles.length) {
                // if there are toggles, the ui.show() clears them out of the UI so we should
                // rerender them.
                this.D = true;
            }
            this.S();
        }
        hide() {
            if (!this.r) {
                return;
            }
            this.R.hide();
        }
        didHide(reason = quickInput_1.QuickInputHideReason.Other) {
            this.r = false;
            this.O.clear();
            this.M.fire({ reason });
        }
        S() {
            if (!this.r) {
                return;
            }
            const title = this.U();
            if (title && this.R.title.textContent !== title) {
                this.R.title.textContent = title;
            }
            else if (!title && this.R.title.innerHTML !== '&nbsp;') {
                this.R.title.innerText = '\u00a0';
            }
            const description = this.W();
            if (this.R.description1.textContent !== description) {
                this.R.description1.textContent = description;
            }
            if (this.R.description2.textContent !== description) {
                this.R.description2.textContent = description;
            }
            if (this.j) {
                this.j = false;
                if (this.h) {
                    dom.$_O(this.R.widget, this.h);
                }
                else {
                    dom.$_O(this.R.widget);
                }
            }
            if (this.busy && !this.Q) {
                this.Q = new async_1.$Qg();
                this.Q.setIfNotSet(() => {
                    if (this.r) {
                        this.R.progressBar.infinite();
                    }
                }, 800);
            }
            if (!this.busy && this.Q) {
                this.R.progressBar.stop();
                this.Q.cancel();
                this.Q = undefined;
            }
            if (this.z) {
                this.z = false;
                this.R.leftActionBar.clear();
                const leftButtons = this.buttons.filter(button => button === exports.$BAb);
                this.R.leftActionBar.push(leftButtons.map((button, index) => {
                    const action = new actions_1.$gi(`id-${index}`, '', button.iconClass || (0, quickInputUtils_1.$zAb)(button.iconPath), true, async () => {
                        this.L.fire(button);
                    });
                    action.tooltip = button.tooltip || '';
                    return action;
                }), { icon: true, label: false });
                this.R.rightActionBar.clear();
                const rightButtons = this.buttons.filter(button => button !== exports.$BAb);
                this.R.rightActionBar.push(rightButtons.map((button, index) => {
                    const action = new actions_1.$gi(`id-${index}`, '', button.iconClass || (0, quickInputUtils_1.$zAb)(button.iconPath), true, async () => {
                        this.L.fire(button);
                    });
                    action.tooltip = button.tooltip || '';
                    return action;
                }), { icon: true, label: false });
            }
            if (this.D) {
                this.D = false;
                // HACK: Filter out toggles here that are not concrete Toggle objects. This is to workaround
                // a layering issue as quick input's interface is in common but Toggle is in browser and
                // it requires a HTMLElement on its interface
                const concreteToggles = this.toggles?.filter(opts => opts instanceof toggle_1.$KQ) ?? [];
                this.R.inputBox.toggles = concreteToggles;
            }
            this.R.ignoreFocusOut = this.ignoreFocusOut;
            this.R.setEnabled(this.enabled);
            this.R.setContextKey(this.contextKey);
            const validationMessage = this.validationMessage || this.F;
            if (this.H !== validationMessage) {
                this.H = validationMessage;
                dom.$_O(this.R.message);
                (0, quickInputUtils_1.$AAb)(validationMessage, this.R.message, {
                    callback: (content) => {
                        this.R.linkOpenerDelegate(content);
                    },
                    disposables: this.O,
                });
            }
            if (this.J !== this.severity) {
                this.J = this.severity;
                this.Y(this.severity);
            }
        }
        U() {
            if (this.title && this.step) {
                return `${this.title} (${this.X()})`;
            }
            if (this.title) {
                return this.title;
            }
            if (this.step) {
                return this.X();
            }
            return '';
        }
        W() {
            return this.description || '';
        }
        X() {
            if (this.step && this.totalSteps) {
                return (0, nls_1.localize)(2, null, this.step, this.totalSteps);
            }
            if (this.step) {
                return String(this.step);
            }
            return '';
        }
        Y(severity) {
            this.R.inputBox.showDecoration(severity);
            if (severity !== severity_1.default.Ignore) {
                const styles = this.R.inputBox.stylesForType(severity);
                this.R.message.style.color = styles.foreground ? `${styles.foreground}` : '';
                this.R.message.style.backgroundColor = styles.background ? `${styles.background}` : '';
                this.R.message.style.border = styles.border ? `1px solid ${styles.border}` : '';
                this.R.message.style.marginBottom = '-2px';
            }
            else {
                this.R.message.style.color = '';
                this.R.message.style.backgroundColor = '';
                this.R.message.style.border = '';
                this.R.message.style.marginBottom = '';
            }
        }
        dispose() {
            this.hide();
            this.N.fire();
            super.dispose();
        }
    }
    class $CAb extends QuickInput {
        constructor() {
            super(...arguments);
            this.$ = '';
            this.cb = this.B(new event_1.$fd());
            this.db = this.B(new event_1.$fd());
            this.eb = this.B(new event_1.$fd());
            this.fb = this.B(new event_1.$fd());
            this.gb = [];
            this.hb = false;
            this.ib = false;
            this.jb = false;
            this.kb = false;
            this.lb = false;
            this.mb = true;
            this.nb = 'fuzzy';
            this.ob = true;
            this.pb = true;
            this.qb = false;
            this.rb = quickInput_1.ItemActivation.FIRST;
            this.sb = [];
            this.tb = false;
            this.ub = [];
            this.vb = this.B(new event_1.$fd());
            this.wb = [];
            this.xb = false;
            this.yb = [];
            this.zb = this.B(new event_1.$fd());
            this.Ab = this.B(new event_1.$fd());
            this.Bb = this.B(new event_1.$fd());
            this.Db = true;
            this.Eb = 'default';
            this.Fb = false;
            this.filterValue = (value) => value;
            this.onDidChangeValue = this.cb.event;
            this.onWillAccept = this.db.event;
            this.onDidAccept = this.eb.event;
            this.onDidCustom = this.fb.event;
            this.onDidChangeActive = this.vb.event;
            this.onDidChangeSelection = this.zb.event;
            this.onDidTriggerItemButton = this.Ab.event;
            this.onDidTriggerSeparatorButton = this.Bb.event;
        }
        static { this.Z = (0, nls_1.localize)(3, null); }
        get quickNavigate() {
            return this.Ib;
        }
        set quickNavigate(quickNavigate) {
            this.Ib = quickNavigate;
            this.S();
        }
        get value() {
            return this.$;
        }
        set value(value) {
            this.Mb(value);
        }
        Mb(value, skipUpdate) {
            if (this.$ !== value) {
                this.$ = value;
                if (!skipUpdate) {
                    this.S();
                }
                if (this.r) {
                    const didFilter = this.R.list.filter(this.filterValue(this.$));
                    if (didFilter) {
                        this.Ob();
                    }
                }
                this.cb.fire(this.$);
            }
        }
        set ariaLabel(ariaLabel) {
            this.ab = ariaLabel;
            this.S();
        }
        get ariaLabel() {
            return this.ab;
        }
        get placeholder() {
            return this.bb;
        }
        set placeholder(placeholder) {
            this.bb = placeholder;
            this.S();
        }
        get items() {
            return this.gb;
        }
        get Nb() {
            return this.R.list.scrollTop;
        }
        set Nb(scrollTop) {
            this.R.list.scrollTop = scrollTop;
        }
        set items(items) {
            this.gb = items;
            this.hb = true;
            this.S();
        }
        get canSelectMany() {
            return this.ib;
        }
        set canSelectMany(canSelectMany) {
            this.ib = canSelectMany;
            this.S();
        }
        get canAcceptInBackground() {
            return this.jb;
        }
        set canAcceptInBackground(canAcceptInBackground) {
            this.jb = canAcceptInBackground;
        }
        get matchOnDescription() {
            return this.kb;
        }
        set matchOnDescription(matchOnDescription) {
            this.kb = matchOnDescription;
            this.S();
        }
        get matchOnDetail() {
            return this.lb;
        }
        set matchOnDetail(matchOnDetail) {
            this.lb = matchOnDetail;
            this.S();
        }
        get matchOnLabel() {
            return this.mb;
        }
        set matchOnLabel(matchOnLabel) {
            this.mb = matchOnLabel;
            this.S();
        }
        get matchOnLabelMode() {
            return this.nb;
        }
        set matchOnLabelMode(matchOnLabelMode) {
            this.nb = matchOnLabelMode;
            this.S();
        }
        get sortByLabel() {
            return this.ob;
        }
        set sortByLabel(sortByLabel) {
            this.ob = sortByLabel;
            this.S();
        }
        get autoFocusOnList() {
            return this.pb;
        }
        set autoFocusOnList(autoFocusOnList) {
            this.pb = autoFocusOnList;
            this.S();
        }
        get keepScrollPosition() {
            return this.qb;
        }
        set keepScrollPosition(keepScrollPosition) {
            this.qb = keepScrollPosition;
        }
        get itemActivation() {
            return this.rb;
        }
        set itemActivation(itemActivation) {
            this.rb = itemActivation;
        }
        get activeItems() {
            return this.sb;
        }
        set activeItems(activeItems) {
            this.sb = activeItems;
            this.tb = true;
            this.S();
        }
        get selectedItems() {
            return this.wb;
        }
        set selectedItems(selectedItems) {
            this.wb = selectedItems;
            this.xb = true;
            this.S();
        }
        get keyMods() {
            if (this.Ib) {
                // Disable keyMods when quick navigate is enabled
                // because in this model the interaction is purely
                // keyboard driven and Ctrl/Alt are typically
                // pressed and hold during this interaction.
                return quickInput_1.$Dq;
            }
            return this.R.keyMods;
        }
        set valueSelection(valueSelection) {
            this.Cb = valueSelection;
            this.Db = true;
            this.S();
        }
        get customButton() {
            return this.Fb;
        }
        set customButton(showCustomButton) {
            this.Fb = showCustomButton;
            this.S();
        }
        get customLabel() {
            return this.Gb;
        }
        set customLabel(label) {
            this.Gb = label;
            this.S();
        }
        get customHover() {
            return this.Hb;
        }
        set customHover(hover) {
            this.Hb = hover;
            this.S();
        }
        get ok() {
            return this.Eb;
        }
        set ok(showOkButton) {
            this.Eb = showOkButton;
            this.S();
        }
        inputHasFocus() {
            return this.r ? this.R.inputBox.hasFocus() : false;
        }
        focusOnInput() {
            this.R.inputBox.setFocus();
        }
        get hideInput() {
            return !!this.Jb;
        }
        set hideInput(hideInput) {
            this.Jb = hideInput;
            this.S();
        }
        get hideCountBadge() {
            return !!this.Kb;
        }
        set hideCountBadge(hideCountBadge) {
            this.Kb = hideCountBadge;
            this.S();
        }
        get hideCheckAll() {
            return !!this.Lb;
        }
        set hideCheckAll(hideCheckAll) {
            this.Lb = hideCheckAll;
            this.S();
        }
        Ob() {
            if (this.autoFocusOnList) {
                if (!this.canSelectMany) {
                    this.R.list.focus(quickInputList_1.QuickInputListFocus.First);
                }
            }
        }
        show() {
            if (!this.r) {
                this.O.add(this.R.inputBox.onDidChange(value => {
                    this.Mb(value, true /* skip update since this originates from the UI */);
                }));
                this.O.add(this.R.inputBox.onMouseDown(event => {
                    if (!this.autoFocusOnList) {
                        this.R.list.clearFocus();
                    }
                }));
                this.O.add((this.Jb ? this.R.list : this.R.inputBox).onKeyDown((event) => {
                    switch (event.keyCode) {
                        case 18 /* KeyCode.DownArrow */:
                            this.R.list.focus(quickInputList_1.QuickInputListFocus.Next);
                            if (this.canSelectMany) {
                                this.R.list.domFocus();
                            }
                            dom.$5O.stop(event, true);
                            break;
                        case 16 /* KeyCode.UpArrow */:
                            if (this.R.list.getFocusedElements().length) {
                                this.R.list.focus(quickInputList_1.QuickInputListFocus.Previous);
                            }
                            else {
                                this.R.list.focus(quickInputList_1.QuickInputListFocus.Last);
                            }
                            if (this.canSelectMany) {
                                this.R.list.domFocus();
                            }
                            dom.$5O.stop(event, true);
                            break;
                        case 12 /* KeyCode.PageDown */:
                            this.R.list.focus(quickInputList_1.QuickInputListFocus.NextPage);
                            if (this.canSelectMany) {
                                this.R.list.domFocus();
                            }
                            dom.$5O.stop(event, true);
                            break;
                        case 11 /* KeyCode.PageUp */:
                            this.R.list.focus(quickInputList_1.QuickInputListFocus.PreviousPage);
                            if (this.canSelectMany) {
                                this.R.list.domFocus();
                            }
                            dom.$5O.stop(event, true);
                            break;
                        case 17 /* KeyCode.RightArrow */:
                            if (!this.jb) {
                                return; // needs to be enabled
                            }
                            if (!this.R.inputBox.isSelectionAtEnd()) {
                                return; // ensure input box selection at end
                            }
                            if (this.activeItems[0]) {
                                this.wb = [this.activeItems[0]];
                                this.zb.fire(this.selectedItems);
                                this.Pb(true);
                            }
                            break;
                        case 14 /* KeyCode.Home */:
                            if ((event.ctrlKey || event.metaKey) && !event.shiftKey && !event.altKey) {
                                this.R.list.focus(quickInputList_1.QuickInputListFocus.First);
                                dom.$5O.stop(event, true);
                            }
                            break;
                        case 13 /* KeyCode.End */:
                            if ((event.ctrlKey || event.metaKey) && !event.shiftKey && !event.altKey) {
                                this.R.list.focus(quickInputList_1.QuickInputListFocus.Last);
                                dom.$5O.stop(event, true);
                            }
                            break;
                    }
                }));
                this.O.add(this.R.onDidAccept(() => {
                    if (this.canSelectMany) {
                        // if there are no checked elements, it means that an onDidChangeSelection never fired to overwrite
                        // `_selectedItems`. In that case, we should emit one with an empty array to ensure that
                        // `.selectedItems` is up to date.
                        if (!this.R.list.getCheckedElements().length) {
                            this.wb = [];
                            this.zb.fire(this.selectedItems);
                        }
                    }
                    else if (this.activeItems[0]) {
                        // For single-select, we set `selectedItems` to the item that was accepted.
                        this.wb = [this.activeItems[0]];
                        this.zb.fire(this.selectedItems);
                    }
                    this.Pb(false);
                }));
                this.O.add(this.R.onDidCustom(() => {
                    this.fb.fire();
                }));
                this.O.add(this.R.list.onDidChangeFocus(focusedItems => {
                    if (this.tb) {
                        return; // Expect another event.
                    }
                    if (this.ub !== this.sb && (0, arrays_1.$sb)(focusedItems, this.sb, (a, b) => a === b)) {
                        return;
                    }
                    this.sb = focusedItems;
                    this.vb.fire(focusedItems);
                }));
                this.O.add(this.R.list.onDidChangeSelection(({ items: selectedItems, event }) => {
                    if (this.canSelectMany) {
                        if (selectedItems.length) {
                            this.R.list.setSelectedElements([]);
                        }
                        return;
                    }
                    if (this.yb !== this.wb && (0, arrays_1.$sb)(selectedItems, this.wb, (a, b) => a === b)) {
                        return;
                    }
                    this.wb = selectedItems;
                    this.zb.fire(selectedItems);
                    if (selectedItems.length) {
                        this.Pb(event instanceof MouseEvent && event.button === 1 /* mouse middle click */);
                    }
                }));
                this.O.add(this.R.list.onChangedCheckedElements(checkedItems => {
                    if (!this.canSelectMany) {
                        return;
                    }
                    if (this.yb !== this.wb && (0, arrays_1.$sb)(checkedItems, this.wb, (a, b) => a === b)) {
                        return;
                    }
                    this.wb = checkedItems;
                    this.zb.fire(checkedItems);
                }));
                this.O.add(this.R.list.onButtonTriggered(event => this.Ab.fire(event)));
                this.O.add(this.R.list.onSeparatorButtonTriggered(event => this.Bb.fire(event)));
                this.O.add(this.Qb());
                this.Db = true;
            }
            super.show(); // TODO: Why have show() bubble up while update() trickles down?
        }
        Pb(inBackground) {
            // Figure out veto via `onWillAccept` event
            let veto = false;
            this.db.fire({ veto: () => veto = true });
            // Continue with `onDidAccept` if no veto
            if (!veto) {
                this.eb.fire({ inBackground });
            }
        }
        Qb() {
            return dom.$nO(this.R.container, dom.$3O.KEY_UP, e => {
                if (this.canSelectMany || !this.Ib) {
                    return;
                }
                const keyboardEvent = new keyboardEvent_1.$jO(e);
                const keyCode = keyboardEvent.keyCode;
                // Select element when keys are pressed that signal it
                const quickNavKeys = this.Ib.keybindings;
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
                        this.wb = [this.activeItems[0]];
                        this.zb.fire(this.selectedItems);
                        this.Pb(false);
                    }
                    // Unset quick navigate after press. It is only valid once
                    // and should not result in any behaviour change afterwards
                    // if the picker remains open because there was no active item
                    this.Ib = undefined;
                }
            });
        }
        S() {
            if (!this.r) {
                return;
            }
            // store the scrollTop before it is reset
            const scrollTopBefore = this.keepScrollPosition ? this.Nb : 0;
            const hasDescription = !!this.description;
            const visibilities = {
                title: !!this.title || !!this.step || !!this.buttons.length,
                description: hasDescription,
                checkAll: this.canSelectMany && !this.Lb,
                checkBox: this.canSelectMany,
                inputBox: !this.Jb,
                progressBar: !this.Jb || hasDescription,
                visibleCount: true,
                count: this.canSelectMany && !this.Kb,
                ok: this.ok === 'default' ? this.canSelectMany : this.ok,
                list: true,
                message: !!this.validationMessage,
                customButton: this.customButton
            };
            this.R.setVisibilities(visibilities);
            super.S();
            if (this.R.inputBox.value !== this.value) {
                this.R.inputBox.value = this.value;
            }
            if (this.Db) {
                this.Db = false;
                this.R.inputBox.select(this.Cb && { start: this.Cb[0], end: this.Cb[1] });
            }
            if (this.R.inputBox.placeholder !== (this.placeholder || '')) {
                this.R.inputBox.placeholder = (this.placeholder || '');
            }
            let ariaLabel = this.ariaLabel;
            // Only set aria label to the input box placeholder if we actually have an input box.
            if (!ariaLabel && visibilities.inputBox) {
                ariaLabel = this.placeholder || $CAb.Z;
                // If we have a title, include it in the aria label.
                if (this.title) {
                    ariaLabel += ` - ${this.title}`;
                }
            }
            if (this.R.list.ariaLabel !== ariaLabel) {
                this.R.list.ariaLabel = ariaLabel ?? null;
            }
            this.R.list.matchOnDescription = this.matchOnDescription;
            this.R.list.matchOnDetail = this.matchOnDetail;
            this.R.list.matchOnLabel = this.matchOnLabel;
            this.R.list.matchOnLabelMode = this.matchOnLabelMode;
            this.R.list.sortByLabel = this.sortByLabel;
            if (this.hb) {
                this.hb = false;
                this.R.list.setElements(this.items);
                this.R.list.filter(this.filterValue(this.R.inputBox.value));
                this.R.checkAll.checked = this.R.list.getAllVisibleChecked();
                this.R.visibleCount.setCount(this.R.list.getVisibleCount());
                this.R.count.setCount(this.R.list.getCheckedCount());
                switch (this.rb) {
                    case quickInput_1.ItemActivation.NONE:
                        this.rb = quickInput_1.ItemActivation.FIRST; // only valid once, then unset
                        break;
                    case quickInput_1.ItemActivation.SECOND:
                        this.R.list.focus(quickInputList_1.QuickInputListFocus.Second);
                        this.rb = quickInput_1.ItemActivation.FIRST; // only valid once, then unset
                        break;
                    case quickInput_1.ItemActivation.LAST:
                        this.R.list.focus(quickInputList_1.QuickInputListFocus.Last);
                        this.rb = quickInput_1.ItemActivation.FIRST; // only valid once, then unset
                        break;
                    default:
                        this.Ob();
                        break;
                }
            }
            if (this.R.container.classList.contains('show-checkboxes') !== !!this.canSelectMany) {
                if (this.canSelectMany) {
                    this.R.list.clearFocus();
                }
                else {
                    this.Ob();
                }
            }
            if (this.tb) {
                this.tb = false;
                this.ub = this.sb;
                this.R.list.setFocusedElements(this.activeItems);
                if (this.ub === this.sb) {
                    this.ub = null;
                }
            }
            if (this.xb) {
                this.xb = false;
                this.yb = this.wb;
                if (this.canSelectMany) {
                    this.R.list.setCheckedElements(this.selectedItems);
                }
                else {
                    this.R.list.setSelectedElements(this.selectedItems);
                }
                if (this.yb === this.wb) {
                    this.yb = null;
                }
            }
            this.R.customButton.label = this.customLabel || '';
            this.R.customButton.element.title = this.customHover || '';
            if (!visibilities.inputBox) {
                // we need to move focus into the tree to detect keybindings
                // properly when the input box is not visible (quick nav)
                this.R.list.domFocus();
                // Focus the first element in the list if multiselect is enabled
                if (this.canSelectMany) {
                    this.R.list.focus(quickInputList_1.QuickInputListFocus.First);
                }
            }
            // Set the scroll position to what it was before updating the items
            if (this.keepScrollPosition) {
                this.Nb = scrollTopBefore;
            }
        }
    }
    exports.$CAb = $CAb;
    class $DAb extends QuickInput {
        constructor() {
            super(...arguments);
            this.Z = '';
            this.ab = true;
            this.cb = false;
            this.eb = this.B(new event_1.$fd());
            this.fb = this.B(new event_1.$fd());
            this.onDidChangeValue = this.eb.event;
            this.onDidAccept = this.fb.event;
        }
        get value() {
            return this.Z;
        }
        set value(value) {
            this.Z = value || '';
            this.S();
        }
        set valueSelection(valueSelection) {
            this.$ = valueSelection;
            this.ab = true;
            this.S();
        }
        get placeholder() {
            return this.bb;
        }
        set placeholder(placeholder) {
            this.bb = placeholder;
            this.S();
        }
        get password() {
            return this.cb;
        }
        set password(password) {
            this.cb = password;
            this.S();
        }
        get prompt() {
            return this.db;
        }
        set prompt(prompt) {
            this.db = prompt;
            this.F = prompt
                ? (0, nls_1.localize)(4, null, prompt)
                : QuickInput.c;
            this.S();
        }
        show() {
            if (!this.r) {
                this.O.add(this.R.inputBox.onDidChange(value => {
                    if (value === this.value) {
                        return;
                    }
                    this.Z = value;
                    this.eb.fire(value);
                }));
                this.O.add(this.R.onDidAccept(() => this.fb.fire()));
                this.ab = true;
            }
            super.show();
        }
        S() {
            if (!this.r) {
                return;
            }
            this.R.container.classList.remove('hidden-input');
            const visibilities = {
                title: !!this.title || !!this.step || !!this.buttons.length,
                description: !!this.description || !!this.step,
                inputBox: true,
                message: true,
                progressBar: true
            };
            this.R.setVisibilities(visibilities);
            super.S();
            if (this.R.inputBox.value !== this.value) {
                this.R.inputBox.value = this.value;
            }
            if (this.ab) {
                this.ab = false;
                this.R.inputBox.select(this.$ && { start: this.$[0], end: this.$[1] });
            }
            if (this.R.inputBox.placeholder !== (this.placeholder || '')) {
                this.R.inputBox.placeholder = (this.placeholder || '');
            }
            if (this.R.inputBox.password !== this.password) {
                this.R.inputBox.password = this.password;
            }
        }
    }
    exports.$DAb = $DAb;
    class $EAb extends QuickInput {
        S() {
            if (!this.r) {
                return;
            }
            const visibilities = {
                title: !!this.title || !!this.step || !!this.buttons.length,
                description: !!this.description || !!this.step
            };
            this.R.setVisibilities(visibilities);
            super.S();
        }
    }
    exports.$EAb = $EAb;
});
//# sourceMappingURL=quickInput.js.map