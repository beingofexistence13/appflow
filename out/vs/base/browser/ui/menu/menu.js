/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/browser", "vs/base/browser/touch", "vs/base/browser/dom", "vs/base/browser/keyboardEvent", "vs/base/browser/mouseEvent", "vs/base/browser/ui/actionbar/actionbar", "vs/base/browser/ui/actionbar/actionViewItems", "vs/base/browser/ui/contextview/contextview", "vs/base/browser/ui/scrollbar/scrollableElement", "vs/base/common/actions", "vs/base/common/async", "vs/base/common/codicons", "vs/base/common/themables", "vs/base/common/iconLabels", "vs/base/common/lifecycle", "vs/base/common/platform", "vs/base/common/strings"], function (require, exports, browser_1, touch_1, dom_1, keyboardEvent_1, mouseEvent_1, actionbar_1, actionViewItems_1, contextview_1, scrollableElement_1, actions_1, async_1, codicons_1, themables_1, iconLabels_1, lifecycle_1, platform_1, strings) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.formatRule = exports.cleanMnemonic = exports.Menu = exports.unthemedMenuStyles = exports.Direction = exports.MENU_ESCAPED_MNEMONIC_REGEX = exports.MENU_MNEMONIC_REGEX = void 0;
    exports.MENU_MNEMONIC_REGEX = /\(&([^\s&])\)|(^|[^&])&([^\s&])/;
    exports.MENU_ESCAPED_MNEMONIC_REGEX = /(&amp;)?(&amp;)([^\s&])/g;
    var Direction;
    (function (Direction) {
        Direction[Direction["Right"] = 0] = "Right";
        Direction[Direction["Left"] = 1] = "Left";
    })(Direction || (exports.Direction = Direction = {}));
    exports.unthemedMenuStyles = {
        shadowColor: undefined,
        borderColor: undefined,
        foregroundColor: undefined,
        backgroundColor: undefined,
        selectionForegroundColor: undefined,
        selectionBackgroundColor: undefined,
        selectionBorderColor: undefined,
        separatorColor: undefined,
        scrollbarShadow: undefined,
        scrollbarSliderBackground: undefined,
        scrollbarSliderHoverBackground: undefined,
        scrollbarSliderActiveBackground: undefined
    };
    class Menu extends actionbar_1.ActionBar {
        constructor(container, actions, options, menuStyles) {
            container.classList.add('monaco-menu-container');
            container.setAttribute('role', 'presentation');
            const menuElement = document.createElement('div');
            menuElement.classList.add('monaco-menu');
            menuElement.setAttribute('role', 'presentation');
            super(menuElement, {
                orientation: 1 /* ActionsOrientation.VERTICAL */,
                actionViewItemProvider: action => this.doGetActionViewItem(action, options, parentData),
                context: options.context,
                actionRunner: options.actionRunner,
                ariaLabel: options.ariaLabel,
                ariaRole: 'menu',
                focusOnlyEnabledItems: true,
                triggerKeys: { keys: [3 /* KeyCode.Enter */, ...(platform_1.isMacintosh || platform_1.isLinux ? [10 /* KeyCode.Space */] : [])], keyDown: true }
            });
            this.menuStyles = menuStyles;
            this.menuElement = menuElement;
            this.actionsList.tabIndex = 0;
            this.menuDisposables = this._register(new lifecycle_1.DisposableStore());
            this.initializeOrUpdateStyleSheet(container, menuStyles);
            this._register(touch_1.Gesture.addTarget(menuElement));
            (0, dom_1.addDisposableListener)(menuElement, dom_1.EventType.KEY_DOWN, (e) => {
                const event = new keyboardEvent_1.StandardKeyboardEvent(e);
                // Stop tab navigation of menus
                if (event.equals(2 /* KeyCode.Tab */)) {
                    e.preventDefault();
                }
            });
            if (options.enableMnemonics) {
                this.menuDisposables.add((0, dom_1.addDisposableListener)(menuElement, dom_1.EventType.KEY_DOWN, (e) => {
                    const key = e.key.toLocaleLowerCase();
                    if (this.mnemonics.has(key)) {
                        dom_1.EventHelper.stop(e, true);
                        const actions = this.mnemonics.get(key);
                        if (actions.length === 1) {
                            if (actions[0] instanceof SubmenuMenuActionViewItem && actions[0].container) {
                                this.focusItemByElement(actions[0].container);
                            }
                            actions[0].onClick(e);
                        }
                        if (actions.length > 1) {
                            const action = actions.shift();
                            if (action && action.container) {
                                this.focusItemByElement(action.container);
                                actions.push(action);
                            }
                            this.mnemonics.set(key, actions);
                        }
                    }
                }));
            }
            if (platform_1.isLinux) {
                this._register((0, dom_1.addDisposableListener)(menuElement, dom_1.EventType.KEY_DOWN, e => {
                    const event = new keyboardEvent_1.StandardKeyboardEvent(e);
                    if (event.equals(14 /* KeyCode.Home */) || event.equals(11 /* KeyCode.PageUp */)) {
                        this.focusedItem = this.viewItems.length - 1;
                        this.focusNext();
                        dom_1.EventHelper.stop(e, true);
                    }
                    else if (event.equals(13 /* KeyCode.End */) || event.equals(12 /* KeyCode.PageDown */)) {
                        this.focusedItem = 0;
                        this.focusPrevious();
                        dom_1.EventHelper.stop(e, true);
                    }
                }));
            }
            this._register((0, dom_1.addDisposableListener)(this.domNode, dom_1.EventType.MOUSE_OUT, e => {
                const relatedTarget = e.relatedTarget;
                if (!(0, dom_1.isAncestor)(relatedTarget, this.domNode)) {
                    this.focusedItem = undefined;
                    this.updateFocus();
                    e.stopPropagation();
                }
            }));
            this._register((0, dom_1.addDisposableListener)(this.actionsList, dom_1.EventType.MOUSE_OVER, e => {
                let target = e.target;
                if (!target || !(0, dom_1.isAncestor)(target, this.actionsList) || target === this.actionsList) {
                    return;
                }
                while (target.parentElement !== this.actionsList && target.parentElement !== null) {
                    target = target.parentElement;
                }
                if (target.classList.contains('action-item')) {
                    const lastFocusedItem = this.focusedItem;
                    this.setFocusedItem(target);
                    if (lastFocusedItem !== this.focusedItem) {
                        this.updateFocus();
                    }
                }
            }));
            // Support touch on actions list to focus items (needed for submenus)
            this._register(touch_1.Gesture.addTarget(this.actionsList));
            this._register((0, dom_1.addDisposableListener)(this.actionsList, touch_1.EventType.Tap, e => {
                let target = e.initialTarget;
                if (!target || !(0, dom_1.isAncestor)(target, this.actionsList) || target === this.actionsList) {
                    return;
                }
                while (target.parentElement !== this.actionsList && target.parentElement !== null) {
                    target = target.parentElement;
                }
                if (target.classList.contains('action-item')) {
                    const lastFocusedItem = this.focusedItem;
                    this.setFocusedItem(target);
                    if (lastFocusedItem !== this.focusedItem) {
                        this.updateFocus();
                    }
                }
            }));
            const parentData = {
                parent: this
            };
            this.mnemonics = new Map();
            // Scroll Logic
            this.scrollableElement = this._register(new scrollableElement_1.DomScrollableElement(menuElement, {
                alwaysConsumeMouseWheel: true,
                horizontal: 2 /* ScrollbarVisibility.Hidden */,
                vertical: 3 /* ScrollbarVisibility.Visible */,
                verticalScrollbarSize: 7,
                handleMouseWheel: true,
                useShadows: true
            }));
            const scrollElement = this.scrollableElement.getDomNode();
            scrollElement.style.position = '';
            this.styleScrollElement(scrollElement, menuStyles);
            // Support scroll on menu drag
            this._register((0, dom_1.addDisposableListener)(menuElement, touch_1.EventType.Change, e => {
                dom_1.EventHelper.stop(e, true);
                const scrollTop = this.scrollableElement.getScrollPosition().scrollTop;
                this.scrollableElement.setScrollPosition({ scrollTop: scrollTop - e.translationY });
            }));
            this._register((0, dom_1.addDisposableListener)(scrollElement, dom_1.EventType.MOUSE_UP, e => {
                // Absorb clicks in menu dead space https://github.com/microsoft/vscode/issues/63575
                // We do this on the scroll element so the scroll bar doesn't dismiss the menu either
                e.preventDefault();
            }));
            menuElement.style.maxHeight = `${Math.max(10, window.innerHeight - container.getBoundingClientRect().top - 35)}px`;
            actions = actions.filter(a => {
                if (options.submenuIds?.has(a.id)) {
                    console.warn(`Found submenu cycle: ${a.id}`);
                    return false;
                }
                return true;
            });
            this.push(actions, { icon: true, label: true, isMenu: true });
            container.appendChild(this.scrollableElement.getDomNode());
            this.scrollableElement.scanDomNode();
            this.viewItems.filter(item => !(item instanceof MenuSeparatorActionViewItem)).forEach((item, index, array) => {
                item.updatePositionInSet(index + 1, array.length);
            });
        }
        initializeOrUpdateStyleSheet(container, style) {
            if (!this.styleSheet) {
                if ((0, dom_1.isInShadowDOM)(container)) {
                    this.styleSheet = (0, dom_1.createStyleSheet)(container);
                }
                else {
                    if (!Menu.globalStyleSheet) {
                        Menu.globalStyleSheet = (0, dom_1.createStyleSheet)();
                    }
                    this.styleSheet = Menu.globalStyleSheet;
                }
            }
            this.styleSheet.textContent = getMenuWidgetCSS(style, (0, dom_1.isInShadowDOM)(container));
        }
        styleScrollElement(scrollElement, style) {
            const fgColor = style.foregroundColor ?? '';
            const bgColor = style.backgroundColor ?? '';
            const border = style.borderColor ? `1px solid ${style.borderColor}` : '';
            const borderRadius = '5px';
            const shadow = style.shadowColor ? `0 2px 8px ${style.shadowColor}` : '';
            scrollElement.style.outline = border;
            scrollElement.style.borderRadius = borderRadius;
            scrollElement.style.color = fgColor;
            scrollElement.style.backgroundColor = bgColor;
            scrollElement.style.boxShadow = shadow;
        }
        getContainer() {
            return this.scrollableElement.getDomNode();
        }
        get onScroll() {
            return this.scrollableElement.onScroll;
        }
        get scrollOffset() {
            return this.menuElement.scrollTop;
        }
        trigger(index) {
            if (index <= this.viewItems.length && index >= 0) {
                const item = this.viewItems[index];
                if (item instanceof SubmenuMenuActionViewItem) {
                    super.focus(index);
                    item.open(true);
                }
                else if (item instanceof BaseMenuActionViewItem) {
                    super.run(item._action, item._context);
                }
                else {
                    return;
                }
            }
        }
        focusItemByElement(element) {
            const lastFocusedItem = this.focusedItem;
            this.setFocusedItem(element);
            if (lastFocusedItem !== this.focusedItem) {
                this.updateFocus();
            }
        }
        setFocusedItem(element) {
            for (let i = 0; i < this.actionsList.children.length; i++) {
                const elem = this.actionsList.children[i];
                if (element === elem) {
                    this.focusedItem = i;
                    break;
                }
            }
        }
        updateFocus(fromRight) {
            super.updateFocus(fromRight, true, true);
            if (typeof this.focusedItem !== 'undefined') {
                // Workaround for #80047 caused by an issue in chromium
                // https://bugs.chromium.org/p/chromium/issues/detail?id=414283
                // When that's fixed, just call this.scrollableElement.scanDomNode()
                this.scrollableElement.setScrollPosition({
                    scrollTop: Math.round(this.menuElement.scrollTop)
                });
            }
        }
        doGetActionViewItem(action, options, parentData) {
            if (action instanceof actions_1.Separator) {
                return new MenuSeparatorActionViewItem(options.context, action, { icon: true }, this.menuStyles);
            }
            else if (action instanceof actions_1.SubmenuAction) {
                const menuActionViewItem = new SubmenuMenuActionViewItem(action, action.actions, parentData, { ...options, submenuIds: new Set([...(options.submenuIds || []), action.id]) }, this.menuStyles);
                if (options.enableMnemonics) {
                    const mnemonic = menuActionViewItem.getMnemonic();
                    if (mnemonic && menuActionViewItem.isEnabled()) {
                        let actionViewItems = [];
                        if (this.mnemonics.has(mnemonic)) {
                            actionViewItems = this.mnemonics.get(mnemonic);
                        }
                        actionViewItems.push(menuActionViewItem);
                        this.mnemonics.set(mnemonic, actionViewItems);
                    }
                }
                return menuActionViewItem;
            }
            else {
                const menuItemOptions = { enableMnemonics: options.enableMnemonics, useEventAsContext: options.useEventAsContext };
                if (options.getKeyBinding) {
                    const keybinding = options.getKeyBinding(action);
                    if (keybinding) {
                        const keybindingLabel = keybinding.getLabel();
                        if (keybindingLabel) {
                            menuItemOptions.keybinding = keybindingLabel;
                        }
                    }
                }
                const menuActionViewItem = new BaseMenuActionViewItem(options.context, action, menuItemOptions, this.menuStyles);
                if (options.enableMnemonics) {
                    const mnemonic = menuActionViewItem.getMnemonic();
                    if (mnemonic && menuActionViewItem.isEnabled()) {
                        let actionViewItems = [];
                        if (this.mnemonics.has(mnemonic)) {
                            actionViewItems = this.mnemonics.get(mnemonic);
                        }
                        actionViewItems.push(menuActionViewItem);
                        this.mnemonics.set(mnemonic, actionViewItems);
                    }
                }
                return menuActionViewItem;
            }
        }
    }
    exports.Menu = Menu;
    class BaseMenuActionViewItem extends actionViewItems_1.BaseActionViewItem {
        constructor(ctx, action, options, menuStyle) {
            options.isMenu = true;
            super(action, action, options);
            this.menuStyle = menuStyle;
            this.options = options;
            this.options.icon = options.icon !== undefined ? options.icon : false;
            this.options.label = options.label !== undefined ? options.label : true;
            this.cssClass = '';
            // Set mnemonic
            if (this.options.label && options.enableMnemonics) {
                const label = this.action.label;
                if (label) {
                    const matches = exports.MENU_MNEMONIC_REGEX.exec(label);
                    if (matches) {
                        this.mnemonic = (!!matches[1] ? matches[1] : matches[3]).toLocaleLowerCase();
                    }
                }
            }
            // Add mouse up listener later to avoid accidental clicks
            this.runOnceToEnableMouseUp = new async_1.RunOnceScheduler(() => {
                if (!this.element) {
                    return;
                }
                this._register((0, dom_1.addDisposableListener)(this.element, dom_1.EventType.MOUSE_UP, e => {
                    // removed default prevention as it conflicts
                    // with BaseActionViewItem #101537
                    // add back if issues arise and link new issue
                    dom_1.EventHelper.stop(e, true);
                    // See https://developer.mozilla.org/en-US/Add-ons/WebExtensions/Interact_with_the_clipboard
                    // > Writing to the clipboard
                    // > You can use the "cut" and "copy" commands without any special
                    // permission if you are using them in a short-lived event handler
                    // for a user action (for example, a click handler).
                    // => to get the Copy and Paste context menu actions working on Firefox,
                    // there should be no timeout here
                    if (browser_1.isFirefox) {
                        const mouseEvent = new mouseEvent_1.StandardMouseEvent(e);
                        // Allowing right click to trigger the event causes the issue described below,
                        // but since the solution below does not work in FF, we must disable right click
                        if (mouseEvent.rightButton) {
                            return;
                        }
                        this.onClick(e);
                    }
                    // In all other cases, set timeout to allow context menu cancellation to trigger
                    // otherwise the action will destroy the menu and a second context menu
                    // will still trigger for right click.
                    else {
                        setTimeout(() => {
                            this.onClick(e);
                        }, 0);
                    }
                }));
                this._register((0, dom_1.addDisposableListener)(this.element, dom_1.EventType.CONTEXT_MENU, e => {
                    dom_1.EventHelper.stop(e, true);
                }));
            }, 100);
            this._register(this.runOnceToEnableMouseUp);
        }
        render(container) {
            super.render(container);
            if (!this.element) {
                return;
            }
            this.container = container;
            this.item = (0, dom_1.append)(this.element, (0, dom_1.$)('a.action-menu-item'));
            if (this._action.id === actions_1.Separator.ID) {
                // A separator is a presentation item
                this.item.setAttribute('role', 'presentation');
            }
            else {
                this.item.setAttribute('role', 'menuitem');
                if (this.mnemonic) {
                    this.item.setAttribute('aria-keyshortcuts', `${this.mnemonic}`);
                }
            }
            this.check = (0, dom_1.append)(this.item, (0, dom_1.$)('span.menu-item-check' + themables_1.ThemeIcon.asCSSSelector(codicons_1.Codicon.menuSelection)));
            this.check.setAttribute('role', 'none');
            this.label = (0, dom_1.append)(this.item, (0, dom_1.$)('span.action-label'));
            if (this.options.label && this.options.keybinding) {
                (0, dom_1.append)(this.item, (0, dom_1.$)('span.keybinding')).textContent = this.options.keybinding;
            }
            // Adds mouse up listener to actually run the action
            this.runOnceToEnableMouseUp.schedule();
            this.updateClass();
            this.updateLabel();
            this.updateTooltip();
            this.updateEnabled();
            this.updateChecked();
            this.applyStyle();
        }
        blur() {
            super.blur();
            this.applyStyle();
        }
        focus() {
            super.focus();
            this.item?.focus();
            this.applyStyle();
        }
        updatePositionInSet(pos, setSize) {
            if (this.item) {
                this.item.setAttribute('aria-posinset', `${pos}`);
                this.item.setAttribute('aria-setsize', `${setSize}`);
            }
        }
        updateLabel() {
            if (!this.label) {
                return;
            }
            if (this.options.label) {
                (0, dom_1.clearNode)(this.label);
                let label = (0, iconLabels_1.stripIcons)(this.action.label);
                if (label) {
                    const cleanLabel = cleanMnemonic(label);
                    if (!this.options.enableMnemonics) {
                        label = cleanLabel;
                    }
                    this.label.setAttribute('aria-label', cleanLabel.replace(/&&/g, '&'));
                    const matches = exports.MENU_MNEMONIC_REGEX.exec(label);
                    if (matches) {
                        label = strings.escape(label);
                        // This is global, reset it
                        exports.MENU_ESCAPED_MNEMONIC_REGEX.lastIndex = 0;
                        let escMatch = exports.MENU_ESCAPED_MNEMONIC_REGEX.exec(label);
                        // We can't use negative lookbehind so if we match our negative and skip
                        while (escMatch && escMatch[1]) {
                            escMatch = exports.MENU_ESCAPED_MNEMONIC_REGEX.exec(label);
                        }
                        const replaceDoubleEscapes = (str) => str.replace(/&amp;&amp;/g, '&amp;');
                        if (escMatch) {
                            this.label.append(strings.ltrim(replaceDoubleEscapes(label.substr(0, escMatch.index)), ' '), (0, dom_1.$)('u', { 'aria-hidden': 'true' }, escMatch[3]), strings.rtrim(replaceDoubleEscapes(label.substr(escMatch.index + escMatch[0].length)), ' '));
                        }
                        else {
                            this.label.innerText = replaceDoubleEscapes(label).trim();
                        }
                        this.item?.setAttribute('aria-keyshortcuts', (!!matches[1] ? matches[1] : matches[3]).toLocaleLowerCase());
                    }
                    else {
                        this.label.innerText = label.replace(/&&/g, '&').trim();
                    }
                }
            }
        }
        updateTooltip() {
            // menus should function like native menus and they do not have tooltips
        }
        updateClass() {
            if (this.cssClass && this.item) {
                this.item.classList.remove(...this.cssClass.split(' '));
            }
            if (this.options.icon && this.label) {
                this.cssClass = this.action.class || '';
                this.label.classList.add('icon');
                if (this.cssClass) {
                    this.label.classList.add(...this.cssClass.split(' '));
                }
                this.updateEnabled();
            }
            else if (this.label) {
                this.label.classList.remove('icon');
            }
        }
        updateEnabled() {
            if (this.action.enabled) {
                if (this.element) {
                    this.element.classList.remove('disabled');
                    this.element.removeAttribute('aria-disabled');
                }
                if (this.item) {
                    this.item.classList.remove('disabled');
                    this.item.removeAttribute('aria-disabled');
                    this.item.tabIndex = 0;
                }
            }
            else {
                if (this.element) {
                    this.element.classList.add('disabled');
                    this.element.setAttribute('aria-disabled', 'true');
                }
                if (this.item) {
                    this.item.classList.add('disabled');
                    this.item.setAttribute('aria-disabled', 'true');
                }
            }
        }
        updateChecked() {
            if (!this.item) {
                return;
            }
            const checked = this.action.checked;
            this.item.classList.toggle('checked', !!checked);
            if (checked !== undefined) {
                this.item.setAttribute('role', 'menuitemcheckbox');
                this.item.setAttribute('aria-checked', checked ? 'true' : 'false');
            }
            else {
                this.item.setAttribute('role', 'menuitem');
                this.item.setAttribute('aria-checked', '');
            }
        }
        getMnemonic() {
            return this.mnemonic;
        }
        applyStyle() {
            const isSelected = this.element && this.element.classList.contains('focused');
            const fgColor = isSelected && this.menuStyle.selectionForegroundColor ? this.menuStyle.selectionForegroundColor : this.menuStyle.foregroundColor;
            const bgColor = isSelected && this.menuStyle.selectionBackgroundColor ? this.menuStyle.selectionBackgroundColor : undefined;
            const outline = isSelected && this.menuStyle.selectionBorderColor ? `1px solid ${this.menuStyle.selectionBorderColor}` : '';
            const outlineOffset = isSelected && this.menuStyle.selectionBorderColor ? `-1px` : '';
            if (this.item) {
                this.item.style.color = fgColor ?? '';
                this.item.style.backgroundColor = bgColor ?? '';
                this.item.style.outline = outline;
                this.item.style.outlineOffset = outlineOffset;
            }
            if (this.check) {
                this.check.style.color = fgColor ?? '';
            }
        }
    }
    class SubmenuMenuActionViewItem extends BaseMenuActionViewItem {
        constructor(action, submenuActions, parentData, submenuOptions, menuStyles) {
            super(action, action, submenuOptions, menuStyles);
            this.submenuActions = submenuActions;
            this.parentData = parentData;
            this.submenuOptions = submenuOptions;
            this.mysubmenu = null;
            this.submenuDisposables = this._register(new lifecycle_1.DisposableStore());
            this.mouseOver = false;
            this.expandDirection = submenuOptions && submenuOptions.expandDirection !== undefined ? submenuOptions.expandDirection : Direction.Right;
            this.showScheduler = new async_1.RunOnceScheduler(() => {
                if (this.mouseOver) {
                    this.cleanupExistingSubmenu(false);
                    this.createSubmenu(false);
                }
            }, 250);
            this.hideScheduler = new async_1.RunOnceScheduler(() => {
                if (this.element && (!(0, dom_1.isAncestor)((0, dom_1.getActiveElement)(), this.element) && this.parentData.submenu === this.mysubmenu)) {
                    this.parentData.parent.focus(false);
                    this.cleanupExistingSubmenu(true);
                }
            }, 750);
        }
        render(container) {
            super.render(container);
            if (!this.element) {
                return;
            }
            if (this.item) {
                this.item.classList.add('monaco-submenu-item');
                this.item.tabIndex = 0;
                this.item.setAttribute('aria-haspopup', 'true');
                this.updateAriaExpanded('false');
                this.submenuIndicator = (0, dom_1.append)(this.item, (0, dom_1.$)('span.submenu-indicator' + themables_1.ThemeIcon.asCSSSelector(codicons_1.Codicon.menuSubmenu)));
                this.submenuIndicator.setAttribute('aria-hidden', 'true');
            }
            this._register((0, dom_1.addDisposableListener)(this.element, dom_1.EventType.KEY_UP, e => {
                const event = new keyboardEvent_1.StandardKeyboardEvent(e);
                if (event.equals(17 /* KeyCode.RightArrow */) || event.equals(3 /* KeyCode.Enter */)) {
                    dom_1.EventHelper.stop(e, true);
                    this.createSubmenu(true);
                }
            }));
            this._register((0, dom_1.addDisposableListener)(this.element, dom_1.EventType.KEY_DOWN, e => {
                const event = new keyboardEvent_1.StandardKeyboardEvent(e);
                if ((0, dom_1.getActiveElement)() === this.item) {
                    if (event.equals(17 /* KeyCode.RightArrow */) || event.equals(3 /* KeyCode.Enter */)) {
                        dom_1.EventHelper.stop(e, true);
                    }
                }
            }));
            this._register((0, dom_1.addDisposableListener)(this.element, dom_1.EventType.MOUSE_OVER, e => {
                if (!this.mouseOver) {
                    this.mouseOver = true;
                    this.showScheduler.schedule();
                }
            }));
            this._register((0, dom_1.addDisposableListener)(this.element, dom_1.EventType.MOUSE_LEAVE, e => {
                this.mouseOver = false;
            }));
            this._register((0, dom_1.addDisposableListener)(this.element, dom_1.EventType.FOCUS_OUT, e => {
                if (this.element && !(0, dom_1.isAncestor)((0, dom_1.getActiveElement)(), this.element)) {
                    this.hideScheduler.schedule();
                }
            }));
            this._register(this.parentData.parent.onScroll(() => {
                if (this.parentData.submenu === this.mysubmenu) {
                    this.parentData.parent.focus(false);
                    this.cleanupExistingSubmenu(true);
                }
            }));
        }
        updateEnabled() {
            // override on submenu entry
            // native menus do not observe enablement on sumbenus
            // we mimic that behavior
        }
        open(selectFirst) {
            this.cleanupExistingSubmenu(false);
            this.createSubmenu(selectFirst);
        }
        onClick(e) {
            // stop clicking from trying to run an action
            dom_1.EventHelper.stop(e, true);
            this.cleanupExistingSubmenu(false);
            this.createSubmenu(true);
        }
        cleanupExistingSubmenu(force) {
            if (this.parentData.submenu && (force || (this.parentData.submenu !== this.mysubmenu))) {
                // disposal may throw if the submenu has already been removed
                try {
                    this.parentData.submenu.dispose();
                }
                catch { }
                this.parentData.submenu = undefined;
                this.updateAriaExpanded('false');
                if (this.submenuContainer) {
                    this.submenuDisposables.clear();
                    this.submenuContainer = undefined;
                }
            }
        }
        calculateSubmenuMenuLayout(windowDimensions, submenu, entry, expandDirection) {
            const ret = { top: 0, left: 0 };
            // Start with horizontal
            ret.left = (0, contextview_1.layout)(windowDimensions.width, submenu.width, { position: expandDirection === Direction.Right ? 0 /* LayoutAnchorPosition.Before */ : 1 /* LayoutAnchorPosition.After */, offset: entry.left, size: entry.width });
            // We don't have enough room to layout the menu fully, so we are overlapping the menu
            if (ret.left >= entry.left && ret.left < entry.left + entry.width) {
                if (entry.left + 10 + submenu.width <= windowDimensions.width) {
                    ret.left = entry.left + 10;
                }
                entry.top += 10;
                entry.height = 0;
            }
            // Now that we have a horizontal position, try layout vertically
            ret.top = (0, contextview_1.layout)(windowDimensions.height, submenu.height, { position: 0 /* LayoutAnchorPosition.Before */, offset: entry.top, size: 0 });
            // We didn't have enough room below, but we did above, so we shift down to align the menu
            if (ret.top + submenu.height === entry.top && ret.top + entry.height + submenu.height <= windowDimensions.height) {
                ret.top += entry.height;
            }
            return ret;
        }
        createSubmenu(selectFirstItem = true) {
            if (!this.element) {
                return;
            }
            if (!this.parentData.submenu) {
                this.updateAriaExpanded('true');
                this.submenuContainer = (0, dom_1.append)(this.element, (0, dom_1.$)('div.monaco-submenu'));
                this.submenuContainer.classList.add('menubar-menu-items-holder', 'context-view');
                // Set the top value of the menu container before construction
                // This allows the menu constructor to calculate the proper max height
                const computedStyles = getComputedStyle(this.parentData.parent.domNode);
                const paddingTop = parseFloat(computedStyles.paddingTop || '0') || 0;
                // this.submenuContainer.style.top = `${this.element.offsetTop - this.parentData.parent.scrollOffset - paddingTop}px`;
                this.submenuContainer.style.zIndex = '1';
                this.submenuContainer.style.position = 'fixed';
                this.submenuContainer.style.top = '0';
                this.submenuContainer.style.left = '0';
                this.parentData.submenu = new Menu(this.submenuContainer, this.submenuActions.length ? this.submenuActions : [new actions_1.EmptySubmenuAction()], this.submenuOptions, this.menuStyle);
                // layout submenu
                const entryBox = this.element.getBoundingClientRect();
                const entryBoxUpdated = {
                    top: entryBox.top - paddingTop,
                    left: entryBox.left,
                    height: entryBox.height + 2 * paddingTop,
                    width: entryBox.width
                };
                const viewBox = this.submenuContainer.getBoundingClientRect();
                const { top, left } = this.calculateSubmenuMenuLayout(new dom_1.Dimension(window.innerWidth, window.innerHeight), dom_1.Dimension.lift(viewBox), entryBoxUpdated, this.expandDirection);
                // subtract offsets caused by transform parent
                this.submenuContainer.style.left = `${left - viewBox.left}px`;
                this.submenuContainer.style.top = `${top - viewBox.top}px`;
                this.submenuDisposables.add((0, dom_1.addDisposableListener)(this.submenuContainer, dom_1.EventType.KEY_UP, e => {
                    const event = new keyboardEvent_1.StandardKeyboardEvent(e);
                    if (event.equals(15 /* KeyCode.LeftArrow */)) {
                        dom_1.EventHelper.stop(e, true);
                        this.parentData.parent.focus();
                        this.cleanupExistingSubmenu(true);
                    }
                }));
                this.submenuDisposables.add((0, dom_1.addDisposableListener)(this.submenuContainer, dom_1.EventType.KEY_DOWN, e => {
                    const event = new keyboardEvent_1.StandardKeyboardEvent(e);
                    if (event.equals(15 /* KeyCode.LeftArrow */)) {
                        dom_1.EventHelper.stop(e, true);
                    }
                }));
                this.submenuDisposables.add(this.parentData.submenu.onDidCancel(() => {
                    this.parentData.parent.focus();
                    this.cleanupExistingSubmenu(true);
                }));
                this.parentData.submenu.focus(selectFirstItem);
                this.mysubmenu = this.parentData.submenu;
            }
            else {
                this.parentData.submenu.focus(false);
            }
        }
        updateAriaExpanded(value) {
            if (this.item) {
                this.item?.setAttribute('aria-expanded', value);
            }
        }
        applyStyle() {
            super.applyStyle();
            const isSelected = this.element && this.element.classList.contains('focused');
            const fgColor = isSelected && this.menuStyle.selectionForegroundColor ? this.menuStyle.selectionForegroundColor : this.menuStyle.foregroundColor;
            if (this.submenuIndicator) {
                this.submenuIndicator.style.color = fgColor ?? '';
            }
        }
        dispose() {
            super.dispose();
            this.hideScheduler.dispose();
            if (this.mysubmenu) {
                this.mysubmenu.dispose();
                this.mysubmenu = null;
            }
            if (this.submenuContainer) {
                this.submenuContainer = undefined;
            }
        }
    }
    class MenuSeparatorActionViewItem extends actionViewItems_1.ActionViewItem {
        constructor(context, action, options, menuStyles) {
            super(context, action, options);
            this.menuStyles = menuStyles;
        }
        render(container) {
            super.render(container);
            if (this.label) {
                this.label.style.borderBottomColor = this.menuStyles.separatorColor ? `${this.menuStyles.separatorColor}` : '';
            }
        }
    }
    function cleanMnemonic(label) {
        const regex = exports.MENU_MNEMONIC_REGEX;
        const matches = regex.exec(label);
        if (!matches) {
            return label;
        }
        const mnemonicInText = !matches[1];
        return label.replace(regex, mnemonicInText ? '$2$3' : '').trim();
    }
    exports.cleanMnemonic = cleanMnemonic;
    function formatRule(c) {
        const fontCharacter = (0, codicons_1.getCodiconFontCharacters)()[c.id];
        return `.codicon-${c.id}:before { content: '\\${fontCharacter.toString(16)}'; }`;
    }
    exports.formatRule = formatRule;
    function getMenuWidgetCSS(style, isForShadowDom) {
        let result = /* css */ `
.monaco-menu {
	font-size: 13px;
	border-radius: 5px;
	min-width: 160px;
}

${formatRule(codicons_1.Codicon.menuSelection)}
${formatRule(codicons_1.Codicon.menuSubmenu)}

.monaco-menu .monaco-action-bar {
	text-align: right;
	overflow: hidden;
	white-space: nowrap;
}

.monaco-menu .monaco-action-bar .actions-container {
	display: flex;
	margin: 0 auto;
	padding: 0;
	width: 100%;
	justify-content: flex-end;
}

.monaco-menu .monaco-action-bar.vertical .actions-container {
	display: inline-block;
}

.monaco-menu .monaco-action-bar.reverse .actions-container {
	flex-direction: row-reverse;
}

.monaco-menu .monaco-action-bar .action-item {
	cursor: pointer;
	display: inline-block;
	transition: transform 50ms ease;
	position: relative;  /* DO NOT REMOVE - this is the key to preventing the ghosting icon bug in Chrome 42 */
}

.monaco-menu .monaco-action-bar .action-item.disabled {
	cursor: default;
}

.monaco-menu .monaco-action-bar.animated .action-item.active {
	transform: scale(1.272019649, 1.272019649); /* 1.272019649 = √φ */
}

.monaco-menu .monaco-action-bar .action-item .icon,
.monaco-menu .monaco-action-bar .action-item .codicon {
	display: inline-block;
}

.monaco-menu .monaco-action-bar .action-item .codicon {
	display: flex;
	align-items: center;
}

.monaco-menu .monaco-action-bar .action-label {
	font-size: 11px;
	margin-right: 4px;
}

.monaco-menu .monaco-action-bar .action-item.disabled .action-label,
.monaco-menu .monaco-action-bar .action-item.disabled .action-label:hover {
	color: var(--vscode-disabledForeground);
}

/* Vertical actions */

.monaco-menu .monaco-action-bar.vertical {
	text-align: left;
}

.monaco-menu .monaco-action-bar.vertical .action-item {
	display: block;
}

.monaco-menu .monaco-action-bar.vertical .action-label.separator {
	display: block;
	border-bottom: 1px solid var(--vscode-menu-separatorBackground);
	padding-top: 1px;
	padding: 30px;
}

.monaco-menu .secondary-actions .monaco-action-bar .action-label {
	margin-left: 6px;
}

/* Action Items */
.monaco-menu .monaco-action-bar .action-item.select-container {
	overflow: hidden; /* somehow the dropdown overflows its container, we prevent it here to not push */
	flex: 1;
	max-width: 170px;
	min-width: 60px;
	display: flex;
	align-items: center;
	justify-content: center;
	margin-right: 10px;
}

.monaco-menu .monaco-action-bar.vertical {
	margin-left: 0;
	overflow: visible;
}

.monaco-menu .monaco-action-bar.vertical .actions-container {
	display: block;
}

.monaco-menu .monaco-action-bar.vertical .action-item {
	padding: 0;
	transform: none;
	display: flex;
}

.monaco-menu .monaco-action-bar.vertical .action-item.active {
	transform: none;
}

.monaco-menu .monaco-action-bar.vertical .action-menu-item {
	flex: 1 1 auto;
	display: flex;
	height: 2em;
	align-items: center;
	position: relative;
	margin: 0 4px;
	border-radius: 4px;
}

.monaco-menu .monaco-action-bar.vertical .action-menu-item:hover .keybinding,
.monaco-menu .monaco-action-bar.vertical .action-menu-item:focus .keybinding {
	opacity: unset;
}

.monaco-menu .monaco-action-bar.vertical .action-label {
	flex: 1 1 auto;
	text-decoration: none;
	padding: 0 1em;
	background: none;
	font-size: 12px;
	line-height: 1;
}

.monaco-menu .monaco-action-bar.vertical .keybinding,
.monaco-menu .monaco-action-bar.vertical .submenu-indicator {
	display: inline-block;
	flex: 2 1 auto;
	padding: 0 1em;
	text-align: right;
	font-size: 12px;
	line-height: 1;
}

.monaco-menu .monaco-action-bar.vertical .submenu-indicator {
	height: 100%;
}

.monaco-menu .monaco-action-bar.vertical .submenu-indicator.codicon {
	font-size: 16px !important;
	display: flex;
	align-items: center;
}

.monaco-menu .monaco-action-bar.vertical .submenu-indicator.codicon::before {
	margin-left: auto;
	margin-right: -20px;
}

.monaco-menu .monaco-action-bar.vertical .action-item.disabled .keybinding,
.monaco-menu .monaco-action-bar.vertical .action-item.disabled .submenu-indicator {
	opacity: 0.4;
}

.monaco-menu .monaco-action-bar.vertical .action-label:not(.separator) {
	display: inline-block;
	box-sizing: border-box;
	margin: 0;
}

.monaco-menu .monaco-action-bar.vertical .action-item {
	position: static;
	overflow: visible;
}

.monaco-menu .monaco-action-bar.vertical .action-item .monaco-submenu {
	position: absolute;
}

.monaco-menu .monaco-action-bar.vertical .action-label.separator {
	width: 100%;
	height: 0px !important;
	opacity: 1;
}

.monaco-menu .monaco-action-bar.vertical .action-label.separator.text {
	padding: 0.7em 1em 0.1em 1em;
	font-weight: bold;
	opacity: 1;
}

.monaco-menu .monaco-action-bar.vertical .action-label:hover {
	color: inherit;
}

.monaco-menu .monaco-action-bar.vertical .menu-item-check {
	position: absolute;
	visibility: hidden;
	width: 1em;
	height: 100%;
}

.monaco-menu .monaco-action-bar.vertical .action-menu-item.checked .menu-item-check {
	visibility: visible;
	display: flex;
	align-items: center;
	justify-content: center;
}

/* Context Menu */

.context-view.monaco-menu-container {
	outline: 0;
	border: none;
	animation: fadeIn 0.083s linear;
	-webkit-app-region: no-drag;
}

.context-view.monaco-menu-container :focus,
.context-view.monaco-menu-container .monaco-action-bar.vertical:focus,
.context-view.monaco-menu-container .monaco-action-bar.vertical :focus {
	outline: 0;
}

.hc-black .context-view.monaco-menu-container,
.hc-light .context-view.monaco-menu-container,
:host-context(.hc-black) .context-view.monaco-menu-container,
:host-context(.hc-light) .context-view.monaco-menu-container {
	box-shadow: none;
}

.hc-black .monaco-menu .monaco-action-bar.vertical .action-item.focused,
.hc-light .monaco-menu .monaco-action-bar.vertical .action-item.focused,
:host-context(.hc-black) .monaco-menu .monaco-action-bar.vertical .action-item.focused,
:host-context(.hc-light) .monaco-menu .monaco-action-bar.vertical .action-item.focused {
	background: none;
}

/* Vertical Action Bar Styles */

.monaco-menu .monaco-action-bar.vertical {
	padding: 4px 0;
}

.monaco-menu .monaco-action-bar.vertical .action-menu-item {
	height: 2em;
}

.monaco-menu .monaco-action-bar.vertical .action-label:not(.separator),
.monaco-menu .monaco-action-bar.vertical .keybinding {
	font-size: inherit;
	padding: 0 2em;
}

.monaco-menu .monaco-action-bar.vertical .menu-item-check {
	font-size: inherit;
	width: 2em;
}

.monaco-menu .monaco-action-bar.vertical .action-label.separator {
	font-size: inherit;
	margin: 5px 0 !important;
	padding: 0;
	border-radius: 0;
}

.linux .monaco-menu .monaco-action-bar.vertical .action-label.separator,
:host-context(.linux) .monaco-menu .monaco-action-bar.vertical .action-label.separator {
	margin-left: 0;
	margin-right: 0;
}

.monaco-menu .monaco-action-bar.vertical .submenu-indicator {
	font-size: 60%;
	padding: 0 1.8em;
}

.linux .monaco-menu .monaco-action-bar.vertical .submenu-indicator,
:host-context(.linux) .monaco-menu .monaco-action-bar.vertical .submenu-indicator {
	height: 100%;
	mask-size: 10px 10px;
	-webkit-mask-size: 10px 10px;
}

.monaco-menu .action-item {
	cursor: default;
}`;
        if (isForShadowDom) {
            // Only define scrollbar styles when used inside shadow dom,
            // otherwise leave their styling to the global workbench styling.
            result += `
			/* Arrows */
			.monaco-scrollable-element > .scrollbar > .scra {
				cursor: pointer;
				font-size: 11px !important;
			}

			.monaco-scrollable-element > .visible {
				opacity: 1;

				/* Background rule added for IE9 - to allow clicks on dom node */
				background:rgba(0,0,0,0);

				transition: opacity 100ms linear;
			}
			.monaco-scrollable-element > .invisible {
				opacity: 0;
				pointer-events: none;
			}
			.monaco-scrollable-element > .invisible.fade {
				transition: opacity 800ms linear;
			}

			/* Scrollable Content Inset Shadow */
			.monaco-scrollable-element > .shadow {
				position: absolute;
				display: none;
			}
			.monaco-scrollable-element > .shadow.top {
				display: block;
				top: 0;
				left: 3px;
				height: 3px;
				width: 100%;
			}
			.monaco-scrollable-element > .shadow.left {
				display: block;
				top: 3px;
				left: 0;
				height: 100%;
				width: 3px;
			}
			.monaco-scrollable-element > .shadow.top-left-corner {
				display: block;
				top: 0;
				left: 0;
				height: 3px;
				width: 3px;
			}
		`;
            // Scrollbars
            const scrollbarShadowColor = style.scrollbarShadow;
            if (scrollbarShadowColor) {
                result += `
				.monaco-scrollable-element > .shadow.top {
					box-shadow: ${scrollbarShadowColor} 0 6px 6px -6px inset;
				}

				.monaco-scrollable-element > .shadow.left {
					box-shadow: ${scrollbarShadowColor} 6px 0 6px -6px inset;
				}

				.monaco-scrollable-element > .shadow.top.left {
					box-shadow: ${scrollbarShadowColor} 6px 6px 6px -6px inset;
				}
			`;
            }
            const scrollbarSliderBackgroundColor = style.scrollbarSliderBackground;
            if (scrollbarSliderBackgroundColor) {
                result += `
				.monaco-scrollable-element > .scrollbar > .slider {
					background: ${scrollbarSliderBackgroundColor};
				}
			`;
            }
            const scrollbarSliderHoverBackgroundColor = style.scrollbarSliderHoverBackground;
            if (scrollbarSliderHoverBackgroundColor) {
                result += `
				.monaco-scrollable-element > .scrollbar > .slider:hover {
					background: ${scrollbarSliderHoverBackgroundColor};
				}
			`;
            }
            const scrollbarSliderActiveBackgroundColor = style.scrollbarSliderActiveBackground;
            if (scrollbarSliderActiveBackgroundColor) {
                result += `
				.monaco-scrollable-element > .scrollbar > .slider.active {
					background: ${scrollbarSliderActiveBackgroundColor};
				}
			`;
            }
        }
        return result;
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVudS5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL2Jhc2UvYnJvd3Nlci91aS9tZW51L21lbnUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBd0JuRixRQUFBLG1CQUFtQixHQUFHLGlDQUFpQyxDQUFDO0lBQ3hELFFBQUEsMkJBQTJCLEdBQUcsMEJBQTBCLENBQUM7SUFJdEUsSUFBWSxTQUdYO0lBSEQsV0FBWSxTQUFTO1FBQ3BCLDJDQUFLLENBQUE7UUFDTCx5Q0FBSSxDQUFBO0lBQ0wsQ0FBQyxFQUhXLFNBQVMseUJBQVQsU0FBUyxRQUdwQjtJQThCWSxRQUFBLGtCQUFrQixHQUFnQjtRQUM5QyxXQUFXLEVBQUUsU0FBUztRQUN0QixXQUFXLEVBQUUsU0FBUztRQUN0QixlQUFlLEVBQUUsU0FBUztRQUMxQixlQUFlLEVBQUUsU0FBUztRQUMxQix3QkFBd0IsRUFBRSxTQUFTO1FBQ25DLHdCQUF3QixFQUFFLFNBQVM7UUFDbkMsb0JBQW9CLEVBQUUsU0FBUztRQUMvQixjQUFjLEVBQUUsU0FBUztRQUN6QixlQUFlLEVBQUUsU0FBUztRQUMxQix5QkFBeUIsRUFBRSxTQUFTO1FBQ3BDLDhCQUE4QixFQUFFLFNBQVM7UUFDekMsK0JBQStCLEVBQUUsU0FBUztLQUMxQyxDQUFDO0lBT0YsTUFBYSxJQUFLLFNBQVEscUJBQVM7UUFRbEMsWUFBWSxTQUFzQixFQUFFLE9BQStCLEVBQUUsT0FBcUIsRUFBbUIsVUFBdUI7WUFDbkksU0FBUyxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsdUJBQXVCLENBQUMsQ0FBQztZQUNqRCxTQUFTLENBQUMsWUFBWSxDQUFDLE1BQU0sRUFBRSxjQUFjLENBQUMsQ0FBQztZQUMvQyxNQUFNLFdBQVcsR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQ2xELFdBQVcsQ0FBQyxTQUFTLENBQUMsR0FB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