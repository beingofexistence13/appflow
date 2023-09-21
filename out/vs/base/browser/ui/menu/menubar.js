/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/browser", "vs/base/browser/dom", "vs/base/browser/keyboardEvent", "vs/base/browser/mouseEvent", "vs/base/browser/touch", "vs/base/browser/ui/menu/menu", "vs/base/common/actions", "vs/base/common/arrays", "vs/base/common/async", "vs/base/common/codicons", "vs/base/common/themables", "vs/base/common/event", "vs/base/common/keyCodes", "vs/base/common/lifecycle", "vs/base/common/platform", "vs/base/common/strings", "vs/nls", "vs/css!./menubar"], function (require, exports, browser, DOM, keyboardEvent_1, mouseEvent_1, touch_1, menu_1, actions_1, arrays_1, async_1, codicons_1, themables_1, event_1, keyCodes_1, lifecycle_1, platform_1, strings, nls) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MenuBar = void 0;
    const $ = DOM.$;
    var MenubarState;
    (function (MenubarState) {
        MenubarState[MenubarState["HIDDEN"] = 0] = "HIDDEN";
        MenubarState[MenubarState["VISIBLE"] = 1] = "VISIBLE";
        MenubarState[MenubarState["FOCUSED"] = 2] = "FOCUSED";
        MenubarState[MenubarState["OPEN"] = 3] = "OPEN";
    })(MenubarState || (MenubarState = {}));
    class MenuBar extends lifecycle_1.Disposable {
        static { this.OVERFLOW_INDEX = -1; }
        constructor(container, options, menuStyle) {
            super();
            this.container = container;
            this.options = options;
            this.menuStyle = menuStyle;
            // Input-related
            this._mnemonicsInUse = false;
            this.openedViaKeyboard = false;
            this.awaitingAltRelease = false;
            this.ignoreNextMouseUp = false;
            this.updatePending = false;
            this.numMenusShown = 0;
            this.overflowLayoutScheduled = undefined;
            this.container.setAttribute('role', 'menubar');
            if (this.isCompact) {
                this.container.classList.add('compact');
            }
            this.menus = [];
            this.mnemonics = new Map();
            this._focusState = MenubarState.VISIBLE;
            this._onVisibilityChange = this._register(new event_1.Emitter());
            this._onFocusStateChange = this._register(new event_1.Emitter());
            this.createOverflowMenu();
            this.menuUpdater = this._register(new async_1.RunOnceScheduler(() => this.update(), 200));
            this.actionRunner = this.options.actionRunner ?? this._register(new actions_1.ActionRunner());
            this._register(this.actionRunner.onWillRun(() => {
                this.setUnfocusedState();
            }));
            this._register(DOM.ModifierKeyEmitter.getInstance().event(this.onModifierKeyToggled, this));
            this._register(DOM.addDisposableListener(this.container, DOM.EventType.KEY_DOWN, (e) => {
                const event = new keyboardEvent_1.StandardKeyboardEvent(e);
                let eventHandled = true;
                const key = !!e.key ? e.key.toLocaleLowerCase() : '';
                const tabNav = platform_1.isMacintosh && !this.isCompact;
                if (event.equals(15 /* KeyCode.LeftArrow */) || (tabNav && event.equals(2 /* KeyCode.Tab */ | 1024 /* KeyMod.Shift */))) {
                    this.focusPrevious();
                }
                else if (event.equals(17 /* KeyCode.RightArrow */) || (tabNav && event.equals(2 /* KeyCode.Tab */))) {
                    this.focusNext();
                }
                else if (event.equals(9 /* KeyCode.Escape */) && this.isFocused && !this.isOpen) {
                    this.setUnfocusedState();
                }
                else if (!this.isOpen && !event.ctrlKey && this.options.enableMnemonics && this.mnemonicsInUse && this.mnemonics.has(key)) {
                    const menuIndex = this.mnemonics.get(key);
                    this.onMenuTriggered(menuIndex, false);
                }
                else {
                    eventHandled = false;
                }
                // Never allow default tab behavior when not compact
                if (!this.isCompact && (event.equals(2 /* KeyCode.Tab */ | 1024 /* KeyMod.Shift */) || event.equals(2 /* KeyCode.Tab */))) {
                    event.preventDefault();
                }
                if (eventHandled) {
                    event.preventDefault();
                    event.stopPropagation();
                }
            }));
            this._register(DOM.addDisposableListener(window, DOM.EventType.MOUSE_DOWN, () => {
                // This mouse event is outside the menubar so it counts as a focus out
                if (this.isFocused) {
                    this.setUnfocusedState();
                }
            }));
            this._register(DOM.addDisposableListener(this.container, DOM.EventType.FOCUS_IN, (e) => {
                const event = e;
                if (event.relatedTarget) {
                    if (!this.container.contains(event.relatedTarget)) {
                        this.focusToReturn = event.relatedTarget;
                    }
                }
            }));
            this._register(DOM.addDisposableListener(this.container, DOM.EventType.FOCUS_OUT, (e) => {
                const event = e;
                // We are losing focus and there is no related target, e.g. webview case
                if (!event.relatedTarget) {
                    this.setUnfocusedState();
                }
                // We are losing focus and there is a target, reset focusToReturn value as not to redirect
                else if (event.relatedTarget && !this.container.contains(event.relatedTarget)) {
                    this.focusToReturn = undefined;
                    this.setUnfocusedState();
                }
            }));
            this._register(DOM.addDisposableListener(window, DOM.EventType.KEY_DOWN, (e) => {
                if (!this.options.enableMnemonics || !e.altKey || e.ctrlKey || e.defaultPrevented) {
                    return;
                }
                const key = e.key.toLocaleLowerCase();
                if (!this.mnemonics.has(key)) {
                    return;
                }
                this.mnemonicsInUse = true;
                this.updateMnemonicVisibility(true);
                const menuIndex = this.mnemonics.get(key);
                this.onMenuTriggered(menuIndex, false);
            }));
            this.setUnfocusedState();
        }
        push(arg) {
            const menus = (0, arrays_1.asArray)(arg);
            menus.forEach((menuBarMenu) => {
                const menuIndex = this.menus.length;
                const cleanMenuLabel = (0, menu_1.cleanMnemonic)(menuBarMenu.label);
                const mnemonicMatches = menu_1.MENU_MNEMONIC_REGEX.exec(menuBarMenu.label);
                // Register mnemonics
                if (mnemonicMatches) {
                    const mnemonic = !!mnemonicMatches[1] ? mnemonicMatches[1] : mnemonicMatches[3];
                    this.registerMnemonic(this.menus.length, mnemonic);
                }
                if (this.isCompact) {
                    this.menus.push(menuBarMenu);
                }
                else {
                    const buttonElement = $('div.menubar-menu-button', { 'role': 'menuitem', 'tabindex': -1, 'aria-label': cleanMenuLabel, 'aria-haspopup': true });
                    const titleElement = $('div.menubar-menu-title', { 'role': 'none', 'aria-hidden': true });
                    buttonElement.appendChild(titleElement);
                    this.container.insertBefore(buttonElement, this.overflowMenu.buttonElement);
                    this.updateLabels(titleElement, buttonElement, menuBarMenu.label);
                    this._register(DOM.addDisposableListener(buttonElement, DOM.EventType.KEY_UP, (e) => {
                        const event = new keyboardEvent_1.StandardKeyboardEvent(e);
                        let eventHandled = true;
                        if ((event.equals(18 /* KeyCode.DownArrow */) || event.equals(3 /* KeyCode.Enter */)) && !this.isOpen) {
                            this.focusedMenu = { index: menuIndex };
                            this.openedViaKeyboard = true;
                            this.focusState = MenubarState.OPEN;
                        }
                        else {
                            eventHandled = false;
                        }
                        if (eventHandled) {
                            event.preventDefault();
                            event.stopPropagation();
                        }
                    }));
                    this._register(touch_1.Gesture.addTarget(buttonElement));
                    this._register(DOM.addDisposableListener(buttonElement, touch_1.EventType.Tap, (e) => {
                        // Ignore this touch if the menu is touched
                        if (this.isOpen && this.focusedMenu && this.focusedMenu.holder && DOM.isAncestor(e.initialTarget, this.focusedMenu.holder)) {
                            return;
                        }
                        this.ignoreNextMouseUp = false;
                        this.onMenuTriggered(menuIndex, true);
                        e.preventDefault();
                        e.stopPropagation();
                    }));
                    this._register(DOM.addDisposableListener(buttonElement, DOM.EventType.MOUSE_DOWN, (e) => {
                        // Ignore non-left-click
                        const mouseEvent = new mouseEvent_1.StandardMouseEvent(e);
                        if (!mouseEvent.leftButton) {
                            e.preventDefault();
                            return;
                        }
                        if (!this.isOpen) {
                            // Open the menu with mouse down and ignore the following mouse up event
                            this.ignoreNextMouseUp = true;
                            this.onMenuTriggered(menuIndex, true);
                        }
                        else {
                            this.ignoreNextMouseUp = false;
                        }
                        e.preventDefault();
                        e.stopPropagation();
                    }));
                    this._register(DOM.addDisposableListener(buttonElement, DOM.EventType.MOUSE_UP, (e) => {
                        if (e.defaultPrevented) {
                            return;
                        }
                        if (!this.ignoreNextMouseUp) {
                            if (this.isFocused) {
                                this.onMenuTriggered(menuIndex, true);
                            }
                        }
                        else {
                            this.ignoreNextMouseUp = false;
                        }
                    }));
                    this._register(DOM.addDisposableListener(buttonElement, DOM.EventType.MOUSE_ENTER, () => {
                        if (this.isOpen && !this.isCurrentMenu(menuIndex)) {
                            buttonElement.focus();
                            this.cleanupCustomMenu();
                            this.showCustomMenu(menuIndex, false);
                        }
                        else if (this.isFocused && !this.isOpen) {
                            this.focusedMenu = { index: menuIndex };
                            buttonElement.focus();
                        }
                    }));
                    this.menus.push({
                        label: menuBarMenu.label,
                        actions: menuBarMenu.actions,
                        buttonElement: buttonElement,
                        titleElement: titleElement
                    });
                }
            });
        }
        createOverflowMenu() {
            const label = this.isCompact ? nls.localize('mAppMenu', 'Application Menu') : nls.localize('mMore', 'More');
            const buttonElement = $('div.menubar-menu-button', { 'role': 'menuitem', 'tabindex': this.isCompact ? 0 : -1, 'aria-label': label, 'aria-haspopup': true });
            const titleElement = $('div.menubar-menu-title.toolbar-toggle-more' + themables_1.ThemeIcon.asCSSSelector(codicons_1.Codicon.menuBarMore), { 'role': 'none', 'aria-hidden': true });
            buttonElement.appendChild(titleElement);
            this.container.appendChild(buttonElement);
            buttonElement.style.visibility = 'hidden';
            this._register(DOM.addDisposableListener(buttonElement, DOM.EventType.KEY_UP, (e) => {
                const event = new keyboardEvent_1.StandardKeyboardEvent(e);
                let eventHandled = true;
                const triggerKeys = [3 /* KeyCode.Enter */];
                if (!this.isCompact) {
                    triggerKeys.push(18 /* KeyCode.DownArrow */);
                }
                else {
                    triggerKeys.push(10 /* KeyCode.Space */);
                    if (this.options.compactMode === menu_1.Direction.Right) {
                        triggerKeys.push(17 /* KeyCode.RightArrow */);
                    }
                    else if (this.options.compactMode === menu_1.Direction.Left) {
                        triggerKeys.push(15 /* KeyCode.LeftArrow */);
                    }
                }
                if ((triggerKeys.some(k => event.equals(k)) && !this.isOpen)) {
                    this.focusedMenu = { index: MenuBar.OVERFLOW_INDEX };
                    this.openedViaKeyboard = true;
                    this.focusState = MenubarState.OPEN;
                }
                else {
                    eventHandled = false;
                }
                if (eventHandled) {
                    event.preventDefault();
                    event.stopPropagation();
                }
            }));
            this._register(touch_1.Gesture.addTarget(buttonElement));
            this._register(DOM.addDisposableListener(buttonElement, touch_1.EventType.Tap, (e) => {
                // Ignore this touch if the menu is touched
                if (this.isOpen && this.focusedMenu && this.focusedMenu.holder && DOM.isAncestor(e.initialTarget, this.focusedMenu.holder)) {
                    return;
                }
                this.ignoreNextMouseUp = false;
                this.onMenuTriggered(MenuBar.OVERFLOW_INDEX, true);
                e.preventDefault();
                e.stopPropagation();
            }));
            this._register(DOM.addDisposableListener(buttonElement, DOM.EventType.MOUSE_DOWN, (e) => {
                // Ignore non-left-click
                const mouseEvent = new mouseEvent_1.StandardMouseEvent(e);
                if (!mouseEvent.leftButton) {
                    e.preventDefault();
                    return;
                }
                if (!this.isOpen) {
                    // Open the menu with mouse down and ignore the following mouse up event
                    this.ignoreNextMouseUp = true;
                    this.onMenuTriggered(MenuBar.OVERFLOW_INDEX, true);
                }
                else {
                    this.ignoreNextMouseUp = false;
                }
                e.preventDefault();
                e.stopPropagation();
            }));
            this._register(DOM.addDisposableListener(buttonElement, DOM.EventType.MOUSE_UP, (e) => {
                if (e.defaultPrevented) {
                    return;
                }
                if (!this.ignoreNextMouseUp) {
                    if (this.isFocused) {
                        this.onMenuTriggered(MenuBar.OVERFLOW_INDEX, true);
                    }
                }
                else {
                    this.ignoreNextMouseUp = false;
                }
            }));
            this._register(DOM.addDisposableListener(buttonElement, DOM.EventType.MOUSE_ENTER, () => {
                if (this.isOpen && !this.isCurrentMenu(MenuBar.OVERFLOW_INDEX)) {
                    this.overflowMenu.buttonElement.focus();
                    this.cleanupCustomMenu();
                    this.showCustomMenu(MenuBar.OVERFLOW_INDEX, false);
                }
                else if (this.isFocused && !this.isOpen) {
                    this.focusedMenu = { index: MenuBar.OVERFLOW_INDEX };
                    buttonElement.focus();
                }
            }));
            this.overflowMenu = {
                buttonElement: buttonElement,
                titleElement: titleElement,
                label: 'More',
                actions: []
            };
        }
        updateMenu(menu) {
            const menuToUpdate = this.menus.filter(menuBarMenu => menuBarMenu.label === menu.label);
            if (menuToUpdate && menuToUpdate.length) {
                menuToUpdate[0].actions = menu.actions;
            }
        }
        dispose() {
            super.dispose();
            this.menus.forEach(menuBarMenu => {
                menuBarMenu.titleElement?.remove();
                menuBarMenu.buttonElement?.remove();
            });
            this.overflowMenu.titleElement.remove();
            this.overflowMenu.buttonElement.remove();
            (0, lifecycle_1.dispose)(this.overflowLayoutScheduled);
            this.overflowLayoutScheduled = undefined;
        }
        blur() {
            this.setUnfocusedState();
        }
        getWidth() {
            if (!this.isCompact && this.menus) {
                const left = this.menus[0].buttonElement.getBoundingClientRect().left;
                const right = this.hasOverflow ? this.overflowMenu.buttonElement.getBoundingClientRect().right : this.menus[this.menus.length - 1].buttonElement.getBoundingClientRect().right;
                return right - left;
            }
            return 0;
        }
        getHeight() {
            return this.container.clientHeight;
        }
        toggleFocus() {
            if (!this.isFocused && this.options.visibility !== 'hidden') {
                this.mnemonicsInUse = true;
                this.focusedMenu = { index: this.numMenusShown > 0 ? 0 : MenuBar.OVERFLOW_INDEX };
                this.focusState = MenubarState.FOCUSED;
            }
            else if (!this.isOpen) {
                this.setUnfocusedState();
            }
        }
        updateOverflowAction() {
            if (!this.menus || !this.menus.length) {
                return;
            }
            const overflowMenuOnlyClass = 'overflow-menu-only';
            // Remove overflow only restriction to allow the most space
            this.container.classList.toggle(overflowMenuOnlyClass, false);
            const sizeAvailable = this.container.offsetWidth;
            let currentSize = 0;
            let full = this.isCompact;
            const prevNumMenusShown = this.numMenusShown;
            this.numMenusShown = 0;
            const showableMenus = this.menus.filter(menu => menu.buttonElement !== undefined && menu.titleElement !== undefined);
            for (const menuBarMenu of showableMenus) {
                if (!full) {
                    const size = menuBarMenu.buttonElement.offsetWidth;
                    if (currentSize + size > sizeAvailable) {
                        full = true;
                    }
                    else {
                        currentSize += size;
                        this.numMenusShown++;
                        if (this.numMenusShown > prevNumMenusShown) {
                            menuBarMenu.buttonElement.style.visibility = 'visible';
                        }
                    }
                }
                if (full) {
                    menuBarMenu.buttonElement.style.visibility = 'hidden';
                }
            }
            // If below minimium menu threshold, show the overflow menu only as hamburger menu
            if (this.numMenusShown - 1 <= showableMenus.length / 2) {
                for (const menuBarMenu of showableMenus) {
                    menuBarMenu.buttonElement.style.visibility = 'hidden';
                }
                full = true;
                this.numMenusShown = 0;
                currentSize = 0;
            }
            // Overflow
            if (this.isCompact) {
                this.overflowMenu.actions = [];
                for (let idx = this.numMenusShown; idx < this.menus.length; idx++) {
                    this.overflowMenu.actions.push(new actions_1.SubmenuAction(`menubar.submenu.${this.menus[idx].label}`, this.menus[idx].label, this.menus[idx].actions || []));
                }
                const compactMenuActions = this.options.getCompactMenuActions?.();
                if (compactMenuActions && compactMenuActions.length) {
                    this.overflowMenu.actions.push(new actions_1.Separator());
                    this.overflowMenu.actions.push(...compactMenuActions);
                }
                this.overflowMenu.buttonElement.style.visibility = 'visible';
            }
            else if (full) {
                // Can't fit the more button, need to remove more menus
                while (currentSize + this.overflowMenu.buttonElement.offsetWidth > sizeAvailable && this.numMenusShown > 0) {
                    this.numMenusShown--;
                    const size = showableMenus[this.numMenusShown].buttonElement.offsetWidth;
                    showableMenus[this.numMenusShown].buttonElement.style.visibility = 'hidden';
                    currentSize -= size;
                }
                this.overflowMenu.actions = [];
                for (let idx = this.numMenusShown; idx < showableMenus.length; idx++) {
                    this.overflowMenu.actions.push(new actions_1.SubmenuAction(`menubar.submenu.${showableMenus[idx].label}`, showableMenus[idx].label, showableMenus[idx].actions || []));
                }
                if (this.overflowMenu.buttonElement.nextElementSibling !== showableMenus[this.numMenusShown].buttonElement) {
                    this.overflowMenu.buttonElement.remove();
                    this.container.insertBefore(this.overflowMenu.buttonElement, showableMenus[this.numMenusShown].buttonElement);
                }
                this.overflowMenu.buttonElement.style.visibility = 'visible';
            }
            else {
                this.overflowMenu.buttonElement.remove();
                this.container.appendChild(this.overflowMenu.buttonElement);
                this.overflowMenu.buttonElement.style.visibility = 'hidden';
            }
            // If we are only showing the overflow, add this class to avoid taking up space
            this.container.classList.toggle(overflowMenuOnlyClass, this.numMenusShown === 0);
        }
        updateLabels(titleElement, buttonElement, label) {
            const cleanMenuLabel = (0, menu_1.cleanMnemonic)(label);
            // Update the button label to reflect mnemonics
            if (this.options.enableMnemonics) {
                const cleanLabel = strings.escape(label);
                // This is global so reset it
                menu_1.MENU_ESCAPED_MNEMONIC_REGEX.lastIndex = 0;
                let escMatch = menu_1.MENU_ESCAPED_MNEMONIC_REGEX.exec(cleanLabel);
                // We can't use negative lookbehind so we match our negative and skip
                while (escMatch && escMatch[1]) {
                    escMatch = menu_1.MENU_ESCAPED_MNEMONIC_REGEX.exec(cleanLabel);
                }
                const replaceDoubleEscapes = (str) => str.replace(/&amp;&amp;/g, '&amp;');
                if (escMatch) {
                    titleElement.innerText = '';
                    titleElement.append(strings.ltrim(replaceDoubleEscapes(cleanLabel.substr(0, escMatch.index)), ' '), $('mnemonic', { 'aria-hidden': 'true' }, escMatch[3]), strings.rtrim(replaceDoubleEscapes(cleanLabel.substr(escMatch.index + escMatch[0].length)), ' '));
                }
                else {
                    titleElement.innerText = replaceDoubleEscapes(cleanLabel).trim();
                }
            }
            else {
                titleElement.innerText = cleanMenuLabel.replace(/&&/g, '&');
            }
            const mnemonicMatches = menu_1.MENU_MNEMONIC_REGEX.exec(label);
            // Register mnemonics
            if (mnemonicMatches) {
                const mnemonic = !!mnemonicMatches[1] ? mnemonicMatches[1] : mnemonicMatches[3];
                if (this.options.enableMnemonics) {
                    buttonElement.setAttribute('aria-keyshortcuts', 'Alt+' + mnemonic.toLocaleLowerCase());
                }
                else {
                    buttonElement.removeAttribute('aria-keyshortcuts');
                }
            }
        }
        update(options) {
            if (options) {
                this.options = options;
            }
            // Don't update while using the menu
            if (this.isFocused) {
                this.updatePending = true;
                return;
            }
            this.menus.forEach(menuBarMenu => {
                if (!menuBarMenu.buttonElement || !menuBarMenu.titleElement) {
                    return;
                }
                this.updateLabels(menuBarMenu.titleElement, menuBarMenu.buttonElement, menuBarMenu.label);
            });
            if (!this.overflowLayoutScheduled) {
                this.overflowLayoutScheduled = DOM.scheduleAtNextAnimationFrame(() => {
                    this.updateOverflowAction();
                    this.overflowLayoutScheduled = undefined;
                });
            }
            this.setUnfocusedState();
        }
        registerMnemonic(menuIndex, mnemonic) {
            this.mnemonics.set(mnemonic.toLocaleLowerCase(), menuIndex);
        }
        hideMenubar() {
            if (this.container.style.display !== 'none') {
                this.container.style.display = 'none';
                this._onVisibilityChange.fire(false);
            }
        }
        showMenubar() {
            if (this.container.style.display !== 'flex') {
                this.container.style.display = 'flex';
                this._onVisibilityChange.fire(true);
                this.updateOverflowAction();
            }
        }
        get focusState() {
            return this._focusState;
        }
        set focusState(value) {
            if (this._focusState >= MenubarState.FOCUSED && value < MenubarState.FOCUSED) {
                // Losing focus, update the menu if needed
                if (this.updatePending) {
                    this.menuUpdater.schedule();
                    this.updatePending = false;
                }
            }
            if (value === this._focusState) {
                return;
            }
            const isVisible = this.isVisible;
            const isOpen = this.isOpen;
            const isFocused = this.isFocused;
            this._focusState = value;
            switch (value) {
                case MenubarState.HIDDEN:
                    if (isVisible) {
                        this.hideMenubar();
                    }
                    if (isOpen) {
                        this.cleanupCustomMenu();
                    }
                    if (isFocused) {
                        this.focusedMenu = undefined;
                        if (this.focusToReturn) {
                            this.focusToReturn.focus();
                            this.focusToReturn = undefined;
                        }
                    }
                    break;
                case MenubarState.VISIBLE:
                    if (!isVisible) {
                        this.showMenubar();
                    }
                    if (isOpen) {
                        this.cleanupCustomMenu();
                    }
                    if (isFocused) {
                        if (this.focusedMenu) {
                            if (this.focusedMenu.index === MenuBar.OVERFLOW_INDEX) {
                                this.overflowMenu.buttonElement.blur();
                            }
                            else {
                                this.menus[this.focusedMenu.index].buttonElement?.blur();
                            }
                        }
                        this.focusedMenu = undefined;
                        if (this.focusToReturn) {
                            this.focusToReturn.focus();
                            this.focusToReturn = undefined;
                        }
                    }
                    break;
                case MenubarState.FOCUSED:
                    if (!isVisible) {
                        this.showMenubar();
                    }
                    if (isOpen) {
                        this.cleanupCustomMenu();
                    }
                    if (this.focusedMenu) {
                        if (this.focusedMenu.index === MenuBar.OVERFLOW_INDEX) {
                            this.overflowMenu.buttonElement.focus();
                        }
                        else {
                            this.menus[this.focusedMenu.index].buttonElement?.focus();
                        }
                    }
                    break;
                case MenubarState.OPEN:
                    if (!isVisible) {
                        this.showMenubar();
                    }
                    if (this.focusedMenu) {
                        this.showCustomMenu(this.focusedMenu.index, this.openedViaKeyboard);
                    }
                    break;
            }
            this._focusState = value;
            this._onFocusStateChange.fire(this.focusState >= MenubarState.FOCUSED);
        }
        get isVisible() {
            return this.focusState >= MenubarState.VISIBLE;
        }
        get isFocused() {
            return this.focusState >= MenubarState.FOCUSED;
        }
        get isOpen() {
            return this.focusState >= MenubarState.OPEN;
        }
        get hasOverflow() {
            return this.isCompact || this.numMenusShown < this.menus.length;
        }
        get isCompact() {
            return this.options.compactMode !== undefined;
        }
        setUnfocusedState() {
            if (this.options.visibility === 'toggle' || this.options.visibility === 'hidden') {
                this.focusState = MenubarState.HIDDEN;
            }
            else if (this.options.visibility === 'classic' && browser.isFullscreen()) {
                this.focusState = MenubarState.HIDDEN;
            }
            else {
                this.focusState = MenubarState.VISIBLE;
            }
            this.ignoreNextMouseUp = false;
            this.mnemonicsInUse = false;
            this.updateMnemonicVisibility(false);
        }
        focusPrevious() {
            if (!this.focusedMenu || this.numMenusShown === 0) {
                return;
            }
            let newFocusedIndex = (this.focusedMenu.index - 1 + this.numMenusShown) % this.numMenusShown;
            if (this.focusedMenu.index === MenuBar.OVERFLOW_INDEX) {
                newFocusedIndex = this.numMenusShown - 1;
            }
            else if (this.focusedMenu.index === 0 && this.hasOverflow) {
                newFocusedIndex = MenuBar.OVERFLOW_INDEX;
            }
            if (newFocusedIndex === this.focusedMenu.index) {
                return;
            }
            if (this.isOpen) {
                this.cleanupCustomMenu();
                this.showCustomMenu(newFocusedIndex);
            }
            else if (this.isFocused) {
                this.focusedMenu.index = newFocusedIndex;
                if (newFocusedIndex === MenuBar.OVERFLOW_INDEX) {
                    this.overflowMenu.buttonElement.focus();
                }
                else {
                    this.menus[newFocusedIndex].buttonElement?.focus();
                }
            }
        }
        focusNext() {
            if (!this.focusedMenu || this.numMenusShown === 0) {
                return;
            }
            let newFocusedIndex = (this.focusedMenu.index + 1) % this.numMenusShown;
            if (this.focusedMenu.index === MenuBar.OVERFLOW_INDEX) {
                newFocusedIndex = 0;
            }
            else if (this.focusedMenu.index === this.numMenusShown - 1) {
                newFocusedIndex = MenuBar.OVERFLOW_INDEX;
            }
            if (newFocusedIndex === this.focusedMenu.index) {
                return;
            }
            if (this.isOpen) {
                this.cleanupCustomMenu();
                this.showCustomMenu(newFocusedIndex);
            }
            else if (this.isFocused) {
                this.focusedMenu.index = newFocusedIndex;
                if (newFocusedIndex === MenuBar.OVERFLOW_INDEX) {
                    this.overflowMenu.buttonElement.focus();
                }
                else {
                    this.menus[newFocusedIndex].buttonElement?.focus();
                }
            }
        }
        updateMnemonicVisibility(visible) {
            if (this.menus) {
                this.menus.forEach(menuBarMenu => {
                    if (menuBarMenu.titleElement && menuBarMenu.titleElement.children.length) {
                        const child = menuBarMenu.titleElement.children.item(0);
                        if (child) {
                            child.style.textDecoration = (this.options.alwaysOnMnemonics || visible) ? 'underline' : '';
                        }
                    }
                });
            }
        }
        get mnemonicsInUse() {
            return this._mnemonicsInUse;
        }
        set mnemonicsInUse(value) {
            this._mnemonicsInUse = value;
        }
        get shouldAltKeyFocus() {
            if (platform_1.isMacintosh) {
                return false;
            }
            if (!this.options.disableAltFocus) {
                return true;
            }
            if (this.options.visibility === 'toggle') {
                return true;
            }
            return false;
        }
        get onVisibilityChange() {
            return this._onVisibilityChange.event;
        }
        get onFocusStateChange() {
            return this._onFocusStateChange.event;
        }
        onMenuTriggered(menuIndex, clicked) {
            if (this.isOpen) {
                if (this.isCurrentMenu(menuIndex)) {
                    this.setUnfocusedState();
                }
                else {
                    this.cleanupCustomMenu();
                    this.showCustomMenu(menuIndex, this.openedViaKeyboard);
                }
            }
            else {
                this.focusedMenu = { index: menuIndex };
                this.openedViaKeyboard = !clicked;
                this.focusState = MenubarState.OPEN;
            }
        }
        onModifierKeyToggled(modifierKeyStatus) {
            const allModifiersReleased = !modifierKeyStatus.altKey && !modifierKeyStatus.ctrlKey && !modifierKeyStatus.shiftKey && !modifierKeyStatus.metaKey;
            if (this.options.visibility === 'hidden') {
                return;
            }
            // Prevent alt-key default if the menu is not hidden and we use alt to focus
            if (modifierKeyStatus.event && this.shouldAltKeyFocus) {
                if (keyCodes_1.ScanCodeUtils.toEnum(modifierKeyStatus.event.code) === 159 /* ScanCode.AltLeft */) {
                    modifierKeyStatus.event.preventDefault();
                }
            }
            // Alt key pressed while menu is focused. This should return focus away from the menubar
            if (this.isFocused && modifierKeyStatus.lastKeyPressed === 'alt' && modifierKeyStatus.altKey) {
                this.setUnfocusedState();
                this.mnemonicsInUse = false;
                this.awaitingAltRelease = true;
            }
            // Clean alt key press and release
            if (allModifiersReleased && modifierKeyStatus.lastKeyPressed === 'alt' && modifierKeyStatus.lastKeyReleased === 'alt') {
                if (!this.awaitingAltRelease) {
                    if (!this.isFocused && this.shouldAltKeyFocus) {
                        this.mnemonicsInUse = true;
                        this.focusedMenu = { index: this.numMenusShown > 0 ? 0 : MenuBar.OVERFLOW_INDEX };
                        this.focusState = MenubarState.FOCUSED;
                    }
                    else if (!this.isOpen) {
                        this.setUnfocusedState();
                    }
                }
            }
            // Alt key released
            if (!modifierKeyStatus.altKey && modifierKeyStatus.lastKeyReleased === 'alt') {
                this.awaitingAltRelease = false;
            }
            if (this.options.enableMnemonics && this.menus && !this.isOpen) {
                this.updateMnemonicVisibility((!this.awaitingAltRelease && modifierKeyStatus.altKey) || this.mnemonicsInUse);
            }
        }
        isCurrentMenu(menuIndex) {
            if (!this.focusedMenu) {
                return false;
            }
            return this.focusedMenu.index === menuIndex;
        }
        cleanupCustomMenu() {
            if (this.focusedMenu) {
                // Remove focus from the menus first
                if (this.focusedMenu.index === MenuBar.OVERFLOW_INDEX) {
                    this.overflowMenu.buttonElement.focus();
                }
                else {
                    this.menus[this.focusedMenu.index].buttonElement?.focus();
                }
                if (this.focusedMenu.holder) {
                    this.focusedMenu.holder.parentElement?.classList.remove('open');
                    this.focusedMenu.holder.remove();
                }
                this.focusedMenu.widget?.dispose();
                this.focusedMenu = { index: this.focusedMenu.index };
            }
        }
        showCustomMenu(menuIndex, selectFirst = true) {
            const actualMenuIndex = menuIndex >= this.numMenusShown ? MenuBar.OVERFLOW_INDEX : menuIndex;
            const customMenu = actualMenuIndex === MenuBar.OVERFLOW_INDEX ? this.overflowMenu : this.menus[actualMenuIndex];
            if (!customMenu.actions || !customMenu.buttonElement || !customMenu.titleElement) {
                return;
            }
            const menuHolder = $('div.menubar-menu-items-holder', { 'title': '' });
            customMenu.buttonElement.classList.add('open');
            const titleBoundingRect = customMenu.titleElement.getBoundingClientRect();
            const titleBoundingRectZoom = DOM.getDomNodeZoomLevel(customMenu.titleElement);
            if (this.options.compactMode === menu_1.Direction.Right) {
                menuHolder.style.top = `${titleBoundingRect.top}px`;
                menuHolder.style.left = `${titleBoundingRect.left + this.container.clientWidth}px`;
            }
            else if (this.options.compactMode === menu_1.Direction.Left) {
                menuHolder.style.top = `${titleBoundingRect.top}px`;
                menuHolder.style.right = `${this.container.clientWidth}px`;
                menuHolder.style.left = 'auto';
            }
            else {
                menuHolder.style.top = `${titleBoundingRect.bottom * titleBoundingRectZoom}px`;
                menuHolder.style.left = `${titleBoundingRect.left * titleBoundingRectZoom}px`;
            }
            customMenu.buttonElement.appendChild(menuHolder);
            const menuOptions = {
                getKeyBinding: this.options.getKeybinding,
                actionRunner: this.actionRunner,
                enableMnemonics: this.options.alwaysOnMnemonics || (this.mnemonicsInUse && this.options.enableMnemonics),
                ariaLabel: customMenu.buttonElement.getAttribute('aria-label') ?? undefined,
                expandDirection: this.isCompact ? this.options.compactMode : menu_1.Direction.Right,
                useEventAsContext: true
            };
            const menuWidget = this._register(new menu_1.Menu(menuHolder, customMenu.actions, menuOptions, this.menuStyle));
            this._register(menuWidget.onDidCancel(() => {
                this.focusState = MenubarState.FOCUSED;
            }));
            if (actualMenuIndex !== menuIndex) {
                menuWidget.trigger(menuIndex - this.numMenusShown);
            }
            else {
                menuWidget.focus(selectFirst);
            }
            this.focusedMenu = {
                index: actualMenuIndex,
                holder: menuHolder,
                widget: menuWidget
            };
        }
    }
    exports.MenuBar = MenuBar;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVudWJhci5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL2Jhc2UvYnJvd3Nlci91aS9tZW51L21lbnViYXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBc0JoRyxNQUFNLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDO0lBdUJoQixJQUFLLFlBS0o7SUFMRCxXQUFLLFlBQVk7UUFDaEIsbURBQU0sQ0FBQTtRQUNOLHFEQUFPLENBQUE7UUFDUCxxREFBTyxDQUFBO1FBQ1AsK0NBQUksQ0FBQTtJQUNMLENBQUMsRUFMSSxZQUFZLEtBQVosWUFBWSxRQUtoQjtJQUVELE1BQWEsT0FBUSxTQUFRLHNCQUFVO2lCQUV0QixtQkFBYyxHQUFXLENBQUMsQ0FBQyxBQUFiLENBQWM7UUFnQzVDLFlBQW9CLFNBQXNCLEVBQVUsT0FBd0IsRUFBVSxTQUFzQjtZQUMzRyxLQUFLLEVBQUUsQ0FBQztZQURXLGNBQVMsR0FBVCxTQUFTLENBQWE7WUFBVSxZQUFPLEdBQVAsT0FBTyxDQUFpQjtZQUFVLGNBQVMsR0FBVCxTQUFTLENBQWE7WUFqQjVHLGdCQUFnQjtZQUNSLG9CQUFlLEdBQVksS0FBSyxDQUFDO1lBQ2pDLHNCQUFpQixHQUFZLEtBQUssQ0FBQztZQUNuQyx1QkFBa0IsR0FBWSxLQUFLLENBQUM7WUFDcEMsc0JBQWlCLEdBQVksS0FBSyxDQUFDO1lBR25DLGtCQUFhLEdBQVksS0FBSyxDQUFDO1lBTy9CLGtCQUFhLEdBQVcsQ0FBQyxDQUFDO1lBQzFCLDRCQUF1QixHQUE0QixTQUFTLENBQUM7WUFLcEUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxZQUFZLENBQUMsTUFBTSxFQUFFLFNBQVMsQ0FBQyxDQUFDO1lBQy9DLElBQUksSUFBSSxDQUFDLFNBQVMsRUFBRTtnQkFDbkIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FB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