/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/browser", "vs/base/browser/touch", "vs/base/browser/dom", "vs/base/browser/keyboardEvent", "vs/base/browser/mouseEvent", "vs/base/browser/ui/actionbar/actionbar", "vs/base/browser/ui/actionbar/actionViewItems", "vs/base/browser/ui/contextview/contextview", "vs/base/browser/ui/scrollbar/scrollableElement", "vs/base/common/actions", "vs/base/common/async", "vs/base/common/codicons", "vs/base/common/themables", "vs/base/common/iconLabels", "vs/base/common/lifecycle", "vs/base/common/platform", "vs/base/common/strings"], function (require, exports, browser_1, touch_1, dom_1, keyboardEvent_1, mouseEvent_1, actionbar_1, actionViewItems_1, contextview_1, scrollableElement_1, actions_1, async_1, codicons_1, themables_1, iconLabels_1, lifecycle_1, platform_1, strings) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$AR = exports.$zR = exports.$yR = exports.$xR = exports.Direction = exports.$wR = exports.$vR = void 0;
    exports.$vR = /\(&([^\s&])\)|(^|[^&])&([^\s&])/;
    exports.$wR = /(&amp;)?(&amp;)([^\s&])/g;
    var Direction;
    (function (Direction) {
        Direction[Direction["Right"] = 0] = "Right";
        Direction[Direction["Left"] = 1] = "Left";
    })(Direction || (exports.Direction = Direction = {}));
    exports.$xR = {
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
    class $yR extends actionbar_1.$1P {
        constructor(container, actions, options, Z) {
            container.classList.add('monaco-menu-container');
            container.setAttribute('role', 'presentation');
            const menuElement = document.createElement('div');
            menuElement.classList.add('monaco-menu');
            menuElement.setAttribute('role', 'presentation');
            super(menuElement, {
                orientation: 1 /* ActionsOrientation.VERTICAL */,
                actionViewItemProvider: action => this.fb(action, options, parentData),
                context: options.context,
                actionRunner: options.actionRunner,
                ariaLabel: options.ariaLabel,
                ariaRole: 'menu',
                focusOnlyEnabledItems: true,
                triggerKeys: { keys: [3 /* KeyCode.Enter */, ...(platform_1.$j || platform_1.$k ? [10 /* KeyCode.Space */] : [])], keyDown: true }
            });
            this.Z = Z;
            this.X = menuElement;
            this.z.tabIndex = 0;
            this.U = this.B(new lifecycle_1.$jc());
            this.ab(container, Z);
            this.B(touch_1.$EP.addTarget(menuElement));
            (0, dom_1.$nO)(menuElement, dom_1.$3O.KEY_DOWN, (e) => {
                const event = new keyboardEvent_1.$jO(e);
                // Stop tab navigation of menus
                if (event.equals(2 /* KeyCode.Tab */)) {
                    e.preventDefault();
                }
            });
            if (options.enableMnemonics) {
                this.U.add((0, dom_1.$nO)(menuElement, dom_1.$3O.KEY_DOWN, (e) => {
                    const key = e.key.toLocaleLowerCase();
                    if (this.S.has(key)) {
                        dom_1.$5O.stop(e, true);
                        const actions = this.S.get(key);
                        if (actions.length === 1) {
                            if (actions[0] instanceof SubmenuMenuActionViewItem && actions[0].container) {
                                this.cb(actions[0].container);
                            }
                            actions[0].onClick(e);
                        }
                        if (actions.length > 1) {
                            const action = actions.shift();
                            if (action && action.container) {
                                this.cb(action.container);
                                actions.push(action);
                            }
                            this.S.set(key, actions);
                        }
                    }
                }));
            }
            if (platform_1.$k) {
                this.B((0, dom_1.$nO)(menuElement, dom_1.$3O.KEY_DOWN, e => {
                    const event = new keyboardEvent_1.$jO(e);
                    if (event.equals(14 /* KeyCode.Home */) || event.equals(11 /* KeyCode.PageUp */)) {
                        this.t = this.viewItems.length - 1;
                        this.O();
                        dom_1.$5O.stop(e, true);
                    }
                    else if (event.equals(13 /* KeyCode.End */) || event.equals(12 /* KeyCode.PageDown */)) {
                        this.t = 0;
                        this.P();
                        dom_1.$5O.stop(e, true);
                    }
                }));
            }
            this.B((0, dom_1.$nO)(this.domNode, dom_1.$3O.MOUSE_OUT, e => {
                const relatedTarget = e.relatedTarget;
                if (!(0, dom_1.$NO)(relatedTarget, this.domNode)) {
                    this.t = undefined;
                    this.Q();
                    e.stopPropagation();
                }
            }));
            this.B((0, dom_1.$nO)(this.z, dom_1.$3O.MOUSE_OVER, e => {
                let target = e.target;
                if (!target || !(0, dom_1.$NO)(target, this.z) || target === this.z) {
                    return;
                }
                while (target.parentElement !== this.z && target.parentElement !== null) {
                    target = target.parentElement;
                }
                if (target.classList.contains('action-item')) {
                    const lastFocusedItem = this.t;
                    this.db(target);
                    if (lastFocusedItem !== this.t) {
                        this.Q();
                    }
                }
            }));
            // Support touch on actions list to focus items (needed for submenus)
            this.B(touch_1.$EP.addTarget(this.z));
            this.B((0, dom_1.$nO)(this.z, touch_1.EventType.Tap, e => {
                let target = e.initialTarget;
                if (!target || !(0, dom_1.$NO)(target, this.z) || target === this.z) {
                    return;
                }
                while (target.parentElement !== this.z && target.parentElement !== null) {
                    target = target.parentElement;
                }
                if (target.classList.contains('action-item')) {
                    const lastFocusedItem = this.t;
                    this.db(target);
                    if (lastFocusedItem !== this.t) {
                        this.Q();
                    }
                }
            }));
            const parentData = {
                parent: this
            };
            this.S = new Map();
            // Scroll Logic
            this.W = this.B(new scrollableElement_1.$UP(menuElement, {
                alwaysConsumeMouseWheel: true,
                horizontal: 2 /* ScrollbarVisibility.Hidden */,
                vertical: 3 /* ScrollbarVisibility.Visible */,
                verticalScrollbarSize: 7,
                handleMouseWheel: true,
                useShadows: true
            }));
            const scrollElement = this.W.getDomNode();
            scrollElement.style.position = '';
            this.bb(scrollElement, Z);
            // Support scroll on menu drag
            this.B((0, dom_1.$nO)(menuElement, touch_1.EventType.Change, e => {
                dom_1.$5O.stop(e, true);
                const scrollTop = this.W.getScrollPosition().scrollTop;
                this.W.setScrollPosition({ scrollTop: scrollTop - e.translationY });
            }));
            this.B((0, dom_1.$nO)(scrollElement, dom_1.$3O.MOUSE_UP, e => {
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
            container.appendChild(this.W.getDomNode());
            this.W.scanDomNode();
            this.viewItems.filter(item => !(item instanceof MenuSeparatorActionViewItem)).forEach((item, index, array) => {
                item.updatePositionInSet(index + 1, array.length);
            });
        }
        ab(container, style) {
            if (!this.Y) {
                if ((0, dom_1.$TO)(container)) {
                    this.Y = (0, dom_1.$XO)(container);
                }
                else {
                    if (!$yR.globalStyleSheet) {
                        $yR.globalStyleSheet = (0, dom_1.$XO)();
                    }
                    this.Y = $yR.globalStyleSheet;
                }
            }
            this.Y.textContent = getMenuWidgetCSS(style, (0, dom_1.$TO)(container));
        }
        bb(scrollElement, style) {
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
            return this.W.getDomNode();
        }
        get onScroll() {
            return this.W.onScroll;
        }
        get scrollOffset() {
            return this.X.scrollTop;
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
        cb(element) {
            const lastFocusedItem = this.t;
            this.db(element);
            if (lastFocusedItem !== this.t) {
                this.Q();
            }
        }
        db(element) {
            for (let i = 0; i < this.z.children.length; i++) {
                const elem = this.z.children[i];
                if (element === elem) {
                    this.t = i;
                    break;
                }
            }
        }
        Q(fromRight) {
            super.Q(fromRight, true, true);
            if (typeof this.t !== 'undefined') {
                // Workaround for #80047 caused by an issue in chromium
                // https://bugs.chromium.org/p/chromium/issues/detail?id=414283
                // When that's fixed, just call this.scrollableElement.scanDomNode()
                this.W.setScrollPosition({
                    scrollTop: Math.round(this.X.scrollTop)
                });
            }
        }
        fb(action, options, parentData) {
            if (action instanceof actions_1.$ii) {
                return new MenuSeparatorActionViewItem(options.context, action, { icon: true }, this.Z);
            }
            else if (action instanceof actions_1.$ji) {
                const menuActionViewItem = new SubmenuMenuActionViewItem(action, action.actions, parentData, { ...options, submenuIds: new Set([...(options.submenuIds || []), action.id]) }, this.Z);
                if (options.enableMnemonics) {
                    const mnemonic = menuActionViewItem.getMnemonic();
                    if (mnemonic && menuActionViewItem.isEnabled()) {
                        let actionViewItems = [];
                        if (this.S.has(mnemonic)) {
                            actionViewItems = this.S.get(mnemonic);
                        }
                        actionViewItems.push(menuActionViewItem);
                        this.S.set(mnemonic, actionViewItems);
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
                const menuActionViewItem = new BaseMenuActionViewItem(options.context, action, menuItemOptions, this.Z);
                if (options.enableMnemonics) {
                    const mnemonic = menuActionViewItem.getMnemonic();
                    if (mnemonic && menuActionViewItem.isEnabled()) {
                        let actionViewItems = [];
                        if (this.S.has(mnemonic)) {
                            actionViewItems = this.S.get(mnemonic);
                        }
                        actionViewItems.push(menuActionViewItem);
                        this.S.set(mnemonic, actionViewItems);
                    }
                }
                return menuActionViewItem;
            }
        }
    }
    exports.$yR = $yR;
    class BaseMenuActionViewItem extends actionViewItems_1.$MQ {
        constructor(ctx, action, options, H) {
            options.isMenu = true;
            super(action, action, options);
            this.H = H;
            this.m = options;
            this.m.icon = options.icon !== undefined ? options.icon : false;
            this.m.label = options.label !== undefined ? options.label : true;
            this.y = '';
            // Set mnemonic
            if (this.m.label && options.enableMnemonics) {
                const label = this.action.label;
                if (label) {
                    const matches = exports.$vR.exec(label);
                    if (matches) {
                        this.s = (!!matches[1] ? matches[1] : matches[3]).toLocaleLowerCase();
                    }
                }
            }
            // Add mouse up listener later to avoid accidental clicks
            this.h = new async_1.$Sg(() => {
                if (!this.element) {
                    return;
                }
                this.B((0, dom_1.$nO)(this.element, dom_1.$3O.MOUSE_UP, e => {
                    // removed default prevention as it conflicts
                    // with BaseActionViewItem #101537
                    // add back if issues arise and link new issue
                    dom_1.$5O.stop(e, true);
                    // See https://developer.mozilla.org/en-US/Add-ons/WebExtensions/Interact_with_the_clipboard
                    // > Writing to the clipboard
                    // > You can use the "cut" and "copy" commands without any special
                    // permission if you are using them in a short-lived event handler
                    // for a user action (for example, a click handler).
                    // => to get the Copy and Paste context menu actions working on Firefox,
                    // there should be no timeout here
                    if (browser_1.$5N) {
                        const mouseEvent = new mouseEvent_1.$eO(e);
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
                this.B((0, dom_1.$nO)(this.element, dom_1.$3O.CONTEXT_MENU, e => {
                    dom_1.$5O.stop(e, true);
                }));
            }, 100);
            this.B(this.h);
        }
        render(container) {
            super.render(container);
            if (!this.element) {
                return;
            }
            this.container = container;
            this.g = (0, dom_1.$0O)(this.element, (0, dom_1.$)('a.action-menu-item'));
            if (this._action.id === actions_1.$ii.ID) {
                // A separator is a presentation item
                this.g.setAttribute('role', 'presentation');
            }
            else {
                this.g.setAttribute('role', 'menuitem');
                if (this.s) {
                    this.g.setAttribute('aria-keyshortcuts', `${this.s}`);
                }
            }
            this.r = (0, dom_1.$0O)(this.g, (0, dom_1.$)('span.menu-item-check' + themables_1.ThemeIcon.asCSSSelector(codicons_1.$Pj.menuSelection)));
            this.r.setAttribute('role', 'none');
            this.n = (0, dom_1.$0O)(this.g, (0, dom_1.$)('span.action-label'));
            if (this.m.label && this.m.keybinding) {
                (0, dom_1.$0O)(this.g, (0, dom_1.$)('span.keybinding')).textContent = this.m.keybinding;
            }
            // Adds mouse up listener to actually run the action
            this.h.schedule();
            this.F();
            this.w();
            this.C();
            this.u();
            this.G();
            this.O();
        }
        blur() {
            super.blur();
            this.O();
        }
        focus() {
            super.focus();
            this.g?.focus();
            this.O();
        }
        updatePositionInSet(pos, setSize) {
            if (this.g) {
                this.g.setAttribute('aria-posinset', `${pos}`);
                this.g.setAttribute('aria-setsize', `${setSize}`);
            }
        }
        w() {
            if (!this.n) {
                return;
            }
            if (this.m.label) {
                (0, dom_1.$lO)(this.n);
                let label = (0, iconLabels_1.$Tj)(this.action.label);
                if (label) {
                    const cleanLabel = $zR(label);
                    if (!this.m.enableMnemonics) {
                        label = cleanLabel;
                    }
                    this.n.setAttribute('aria-label', cleanLabel.replace(/&&/g, '&'));
                    const matches = exports.$vR.exec(label);
                    if (matches) {
                        label = strings.$pe(label);
                        // This is global, reset it
                        exports.$wR.lastIndex = 0;
                        let escMatch = exports.$wR.exec(label);
                        // We can't use negative lookbehind so if we match our negative and skip
                        while (escMatch && escMatch[1]) {
                            escMatch = exports.$wR.exec(label);
                        }
                        const replaceDoubleEscapes = (str) => str.replace(/&amp;&amp;/g, '&amp;');
                        if (escMatch) {
                            this.n.append(strings.$ue(replaceDoubleEscapes(label.substr(0, escMatch.index)), ' '), (0, dom_1.$)('u', { 'aria-hidden': 'true' }, escMatch[3]), strings.$ve(replaceDoubleEscapes(label.substr(escMatch.index + escMatch[0].length)), ' '));
                        }
                        else {
                            this.n.innerText = replaceDoubleEscapes(label).trim();
                        }
                        this.g?.setAttribute('aria-keyshortcuts', (!!matches[1] ? matches[1] : matches[3]).toLocaleLowerCase());
                    }
                    else {
                        this.n.innerText = label.replace(/&&/g, '&').trim();
                    }
                }
            }
        }
        C() {
            // menus should function like native menus and they do not have tooltips
        }
        F() {
            if (this.y && this.g) {
                this.g.classList.remove(...this.y.split(' '));
            }
            if (this.m.icon && this.n) {
                this.y = this.action.class || '';
                this.n.classList.add('icon');
                if (this.y) {
                    this.n.classList.add(...this.y.split(' '));
                }
                this.u();
            }
            else if (this.n) {
                this.n.classList.remove('icon');
            }
        }
        u() {
            if (this.action.enabled) {
                if (this.element) {
                    this.element.classList.remove('disabled');
                    this.element.removeAttribute('aria-disabled');
                }
                if (this.g) {
                    this.g.classList.remove('disabled');
                    this.g.removeAttribute('aria-disabled');
                    this.g.tabIndex = 0;
                }
            }
            else {
                if (this.element) {
                    this.element.classList.add('disabled');
                    this.element.setAttribute('aria-disabled', 'true');
                }
                if (this.g) {
                    this.g.classList.add('disabled');
                    this.g.setAttribute('aria-disabled', 'true');
                }
            }
        }
        G() {
            if (!this.g) {
                return;
            }
            const checked = this.action.checked;
            this.g.classList.toggle('checked', !!checked);
            if (checked !== undefined) {
                this.g.setAttribute('role', 'menuitemcheckbox');
                this.g.setAttribute('aria-checked', checked ? 'true' : 'false');
            }
            else {
                this.g.setAttribute('role', 'menuitem');
                this.g.setAttribute('aria-checked', '');
            }
        }
        getMnemonic() {
            return this.s;
        }
        O() {
            const isSelected = this.element && this.element.classList.contains('focused');
            const fgColor = isSelected && this.H.selectionForegroundColor ? this.H.selectionForegroundColor : this.H.foregroundColor;
            const bgColor = isSelected && this.H.selectionBackgroundColor ? this.H.selectionBackgroundColor : undefined;
            const outline = isSelected && this.H.selectionBorderColor ? `1px solid ${this.H.selectionBorderColor}` : '';
            const outlineOffset = isSelected && this.H.selectionBorderColor ? `-1px` : '';
            if (this.g) {
                this.g.style.color = fgColor ?? '';
                this.g.style.backgroundColor = bgColor ?? '';
                this.g.style.outline = outline;
                this.g.style.outlineOffset = outlineOffset;
            }
            if (this.r) {
                this.r.style.color = fgColor ?? '';
            }
        }
    }
    class SubmenuMenuActionViewItem extends BaseMenuActionViewItem {
        constructor(action, Z, ab, bb, menuStyles) {
            super(action, action, bb, menuStyles);
            this.Z = Z;
            this.ab = ab;
            this.bb = bb;
            this.P = null;
            this.S = this.B(new lifecycle_1.$jc());
            this.U = false;
            this.Y = bb && bb.expandDirection !== undefined ? bb.expandDirection : Direction.Right;
            this.W = new async_1.$Sg(() => {
                if (this.U) {
                    this.db(false);
                    this.fb(false);
                }
            }, 250);
            this.X = new async_1.$Sg(() => {
                if (this.element && (!(0, dom_1.$NO)((0, dom_1.$VO)(), this.element) && this.ab.submenu === this.P)) {
                    this.ab.parent.focus(false);
                    this.db(true);
                }
            }, 750);
        }
        render(container) {
            super.render(container);
            if (!this.element) {
                return;
            }
            if (this.g) {
                this.g.classList.add('monaco-submenu-item');
                this.g.tabIndex = 0;
                this.g.setAttribute('aria-haspopup', 'true');
                this.gb('false');
                this.R = (0, dom_1.$0O)(this.g, (0, dom_1.$)('span.submenu-indicator' + themables_1.ThemeIcon.asCSSSelector(codicons_1.$Pj.menuSubmenu)));
                this.R.setAttribute('aria-hidden', 'true');
            }
            this.B((0, dom_1.$nO)(this.element, dom_1.$3O.KEY_UP, e => {
                const event = new keyboardEvent_1.$jO(e);
                if (event.equals(17 /* KeyCode.RightArrow */) || event.equals(3 /* KeyCode.Enter */)) {
                    dom_1.$5O.stop(e, true);
                    this.fb(true);
                }
            }));
            this.B((0, dom_1.$nO)(this.element, dom_1.$3O.KEY_DOWN, e => {
                const event = new keyboardEvent_1.$jO(e);
                if ((0, dom_1.$VO)() === this.g) {
                    if (event.equals(17 /* KeyCode.RightArrow */) || event.equals(3 /* KeyCode.Enter */)) {
                        dom_1.$5O.stop(e, true);
                    }
                }
            }));
            this.B((0, dom_1.$nO)(this.element, dom_1.$3O.MOUSE_OVER, e => {
                if (!this.U) {
                    this.U = true;
                    this.W.schedule();
                }
            }));
            this.B((0, dom_1.$nO)(this.element, dom_1.$3O.MOUSE_LEAVE, e => {
                this.U = false;
            }));
            this.B((0, dom_1.$nO)(this.element, dom_1.$3O.FOCUS_OUT, e => {
                if (this.element && !(0, dom_1.$NO)((0, dom_1.$VO)(), this.element)) {
                    this.X.schedule();
                }
            }));
            this.B(this.ab.parent.onScroll(() => {
                if (this.ab.submenu === this.P) {
                    this.ab.parent.focus(false);
                    this.db(true);
                }
            }));
        }
        u() {
            // override on submenu entry
            // native menus do not observe enablement on sumbenus
            // we mimic that behavior
        }
        open(selectFirst) {
            this.db(false);
            this.fb(selectFirst);
        }
        onClick(e) {
            // stop clicking from trying to run an action
            dom_1.$5O.stop(e, true);
            this.db(false);
            this.fb(true);
        }
        db(force) {
            if (this.ab.submenu && (force || (this.ab.submenu !== this.P))) {
                // disposal may throw if the submenu has already been removed
                try {
                    this.ab.submenu.dispose();
                }
                catch { }
                this.ab.submenu = undefined;
                this.gb('false');
                if (this.Q) {
                    this.S.clear();
                    this.Q = undefined;
                }
            }
        }
        eb(windowDimensions, submenu, entry, expandDirection) {
            const ret = { top: 0, left: 0 };
            // Start with horizontal
            ret.left = (0, contextview_1.$4P)(windowDimensions.width, submenu.width, { position: expandDirection === Direction.Right ? 0 /* LayoutAnchorPosition.Before */ : 1 /* LayoutAnchorPosition.After */, offset: entry.left, size: entry.width });
            // We don't have enough room to layout the menu fully, so we are overlapping the menu
            if (ret.left >= entry.left && ret.left < entry.left + entry.width) {
                if (entry.left + 10 + submenu.width <= windowDimensions.width) {
                    ret.left = entry.left + 10;
                }
                entry.top += 10;
                entry.height = 0;
            }
            // Now that we have a horizontal position, try layout vertically
            ret.top = (0, contextview_1.$4P)(windowDimensions.height, submenu.height, { position: 0 /* LayoutAnchorPosition.Before */, offset: entry.top, size: 0 });
            // We didn't have enough room below, but we did above, so we shift down to align the menu
            if (ret.top + submenu.height === entry.top && ret.top + entry.height + submenu.height <= windowDimensions.height) {
                ret.top += entry.height;
            }
            return ret;
        }
        fb(selectFirstItem = true) {
            if (!this.element) {
                return;
            }
            if (!this.ab.submenu) {
                this.gb('true');
                this.Q = (0, dom_1.$0O)(this.element, (0, dom_1.$)('div.monaco-submenu'));
                this.Q.classList.add('menubar-menu-items-holder', 'context-view');
                // Set the top value of the menu container before construction
                // This allows the menu constructor to calculate the proper max height
                const computedStyles = getComputedStyle(this.ab.parent.domNode);
                const paddingTop = parseFloat(computedStyles.paddingTop || '0') || 0;
                // this.submenuContainer.style.top = `${this.element.offsetTop - this.parentData.parent.scrollOffset - paddingTop}px`;
                this.Q.style.zIndex = '1';
                this.Q.style.position = 'fixed';
                this.Q.style.top = '0';
                this.Q.style.left = '0';
                this.ab.submenu = new $yR(this.Q, this.Z.length ? this.Z : [new actions_1.$ki()], this.bb, this.H);
                // layout submenu
                const entryBox = this.element.getBoundingClientRect();
                const entryBoxUpdated = {
                    top: entryBox.top - paddingTop,
                    left: entryBox.left,
                    height: entryBox.height + 2 * paddingTop,
                    width: entryBox.width
                };
                const viewBox = this.Q.getBoundingClientRect();
                const { top, left } = this.eb(new dom_1.$BO(window.innerWidth, window.innerHeight), dom_1.$BO.lift(viewBox), entryBoxUpdated, this.Y);
                // subtract offsets caused by transform parent
                this.Q.style.left = `${left - viewBox.left}px`;
                this.Q.style.top = `${top - viewBox.top}px`;
                this.S.add((0, dom_1.$nO)(this.Q, dom_1.$3O.KEY_UP, e => {
                    const event = new keyboardEvent_1.$jO(e);
                    if (event.equals(15 /* KeyCode.LeftArrow */)) {
                        dom_1.$5O.stop(e, true);
                        this.ab.parent.focus();
                        this.db(true);
                    }
                }));
                this.S.add((0, dom_1.$nO)(this.Q, dom_1.$3O.KEY_DOWN, e => {
                    const event = new keyboardEvent_1.$jO(e);
                    if (event.equals(15 /* KeyCode.LeftArrow */)) {
                        dom_1.$5O.stop(e, true);
                    }
                }));
                this.S.add(this.ab.submenu.onDidCancel(() => {
                    this.ab.parent.focus();
                    this.db(true);
                }));
                this.ab.submenu.focus(selectFirstItem);
                this.P = this.ab.submenu;
            }
            else {
                this.ab.submenu.focus(false);
            }
        }
        gb(value) {
            if (this.g) {
                this.g?.setAttribute('aria-expanded', value);
            }
        }
        O() {
            super.O();
            const isSelected = this.element && this.element.classList.contains('focused');
            const fgColor = isSelected && this.H.selectionForegroundColor ? this.H.selectionForegroundColor : this.H.foregroundColor;
            if (this.R) {
                this.R.style.color = fgColor ?? '';
            }
        }
        dispose() {
            super.dispose();
            this.X.dispose();
            if (this.P) {
                this.P.dispose();
                this.P = null;
            }
            if (this.Q) {
                this.Q = undefined;
            }
        }
    }
    class MenuSeparatorActionViewItem extends actionViewItems_1.$NQ {
        constructor(context, action, options, b) {
            super(context, action, options);
            this.b = b;
        }
        render(container) {
            super.render(container);
            if (this.H) {
                this.H.style.borderBottomColor = this.b.separatorColor ? `${this.b.separatorColor}` : '';
            }
        }
    }
    function $zR(label) {
        const regex = exports.$vR;
        const matches = regex.exec(label);
        if (!matches) {
            return label;
        }
        const mnemonicInText = !matches[1];
        return label.replace(regex, mnemonicInText ? '$2$3' : '').trim();
    }
    exports.$zR = $zR;
    function $AR(c) {
        const fontCharacter = (0, codicons_1.$Nj)()[c.id];
        return `.codicon-${c.id}:before { content: '\\${fontCharacter.toString(16)}'; }`;
    }
    exports.$AR = $AR;
    function getMenuWidgetCSS(style, isForShadowDom) {
        let result = /* css */ `
.monaco-menu {
	font-size: 13px;
	border-radius: 5px;
	min-width: 160px;
}

${$AR(codicons_1.$Pj.menuSelection)}
${$AR(codicons_1.$Pj.menuSubmenu)}

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
//# sourceMappingURL=menu.js.map