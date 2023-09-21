/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/keyboardEvent", "vs/base/browser/ui/actionbar/actionViewItems", "vs/base/common/actions", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/types", "vs/css!./actionbar"], function (require, exports, DOM, keyboardEvent_1, actionViewItems_1, actions_1, event_1, lifecycle_1, types) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$2P = exports.$1P = exports.ActionsOrientation = void 0;
    var ActionsOrientation;
    (function (ActionsOrientation) {
        ActionsOrientation[ActionsOrientation["HORIZONTAL"] = 0] = "HORIZONTAL";
        ActionsOrientation[ActionsOrientation["VERTICAL"] = 1] = "VERTICAL";
    })(ActionsOrientation || (exports.ActionsOrientation = ActionsOrientation = {}));
    class $1P extends lifecycle_1.$kc {
        constructor(container, options = {}) {
            super();
            this.g = this.B(new lifecycle_1.$jc());
            this.r = this.B(new lifecycle_1.$sc());
            // Trigger Key Tracking
            this.w = false;
            this.y = true;
            this.C = this.B(new event_1.$fd());
            this.onDidBlur = this.C.event;
            this.D = this.B(new event_1.$fd({ onWillAddFirstListener: () => this.F = true }));
            this.onDidCancel = this.D.event;
            this.F = false;
            this.G = this.B(new event_1.$fd());
            this.onDidRun = this.G.event;
            this.H = this.B(new event_1.$fd());
            this.onWillRun = this.H.event;
            this.b = options;
            this.j = options.context ?? null;
            this.m = this.b.orientation ?? 0 /* ActionsOrientation.HORIZONTAL */;
            this.n = {
                keyDown: this.b.triggerKeys?.keyDown ?? false,
                keys: this.b.triggerKeys?.keys ?? [3 /* KeyCode.Enter */, 10 /* KeyCode.Space */]
            };
            if (this.b.actionRunner) {
                this.f = this.b.actionRunner;
            }
            else {
                this.f = new actions_1.$hi();
                this.g.add(this.f);
            }
            this.g.add(this.f.onDidRun(e => this.G.fire(e)));
            this.g.add(this.f.onWillRun(e => this.H.fire(e)));
            this.viewItems = [];
            this.t = undefined;
            this.domNode = document.createElement('div');
            this.domNode.className = 'monaco-action-bar';
            if (options.animated !== false) {
                this.domNode.classList.add('animated');
            }
            let previousKeys;
            let nextKeys;
            switch (this.m) {
                case 0 /* ActionsOrientation.HORIZONTAL */:
                    previousKeys = [15 /* KeyCode.LeftArrow */];
                    nextKeys = [17 /* KeyCode.RightArrow */];
                    break;
                case 1 /* ActionsOrientation.VERTICAL */:
                    previousKeys = [16 /* KeyCode.UpArrow */];
                    nextKeys = [18 /* KeyCode.DownArrow */];
                    this.domNode.className += ' vertical';
                    break;
            }
            this.B(DOM.$nO(this.domNode, DOM.$3O.KEY_DOWN, e => {
                const event = new keyboardEvent_1.$jO(e);
                let eventHandled = true;
                const focusedItem = typeof this.t === 'number' ? this.viewItems[this.t] : undefined;
                if (previousKeys && (event.equals(previousKeys[0]) || event.equals(previousKeys[1]))) {
                    eventHandled = this.P();
                }
                else if (nextKeys && (event.equals(nextKeys[0]) || event.equals(nextKeys[1]))) {
                    eventHandled = this.O();
                }
                else if (event.equals(9 /* KeyCode.Escape */) && this.F) {
                    this.D.fire();
                }
                else if (event.equals(14 /* KeyCode.Home */)) {
                    eventHandled = this.M();
                }
                else if (event.equals(13 /* KeyCode.End */)) {
                    eventHandled = this.N();
                }
                else if (event.equals(2 /* KeyCode.Tab */) && focusedItem instanceof actionViewItems_1.$MQ && focusedItem.trapsArrowNavigation) {
                    eventHandled = this.O();
                }
                else if (this.J(event)) {
                    // Staying out of the else branch even if not triggered
                    if (this.n.keyDown) {
                        this.R(event);
                    }
                    else {
                        this.w = true;
                    }
                }
                else {
                    eventHandled = false;
                }
                if (eventHandled) {
                    event.preventDefault();
                    event.stopPropagation();
                }
            }));
            this.B(DOM.$nO(this.domNode, DOM.$3O.KEY_UP, e => {
                const event = new keyboardEvent_1.$jO(e);
                // Run action on Enter/Space
                if (this.J(event)) {
                    if (!this.n.keyDown && this.w) {
                        this.w = false;
                        this.R(event);
                    }
                    event.preventDefault();
                    event.stopPropagation();
                }
                // Recompute focused item
                else if (event.equals(2 /* KeyCode.Tab */) || event.equals(1024 /* KeyMod.Shift */ | 2 /* KeyCode.Tab */)) {
                    this.L();
                }
            }));
            this.u = this.B(DOM.$8O(this.domNode));
            this.B(this.u.onDidBlur(() => {
                if (DOM.$VO() === this.domNode || !DOM.$NO(DOM.$VO(), this.domNode)) {
                    this.C.fire();
                    this.s = this.t;
                    this.t = undefined;
                    this.w = false;
                }
            }));
            this.B(this.u.onDidFocus(() => this.L()));
            this.z = document.createElement('ul');
            this.z.className = 'actions-container';
            if (this.b.highlightToggledItems) {
                this.z.classList.add('highlight-toggled');
            }
            this.z.setAttribute('role', this.b.ariaRole || 'toolbar');
            if (this.b.ariaLabel) {
                this.z.setAttribute('aria-label', this.b.ariaLabel);
            }
            this.domNode.appendChild(this.z);
            container.appendChild(this.domNode);
        }
        I() {
            if (this.length() >= 2) {
                this.z.setAttribute('role', this.b.ariaRole || 'toolbar');
            }
            else {
                this.z.setAttribute('role', 'presentation');
            }
        }
        setAriaLabel(label) {
            if (label) {
                this.z.setAttribute('aria-label', label);
            }
            else {
                this.z.removeAttribute('aria-label');
            }
        }
        // Some action bars should not be focusable at times
        // When an action bar is not focusable make sure to make all the elements inside it not focusable
        // When an action bar is focusable again, make sure the first item can be focused
        setFocusable(focusable) {
            this.y = focusable;
            if (this.y) {
                const firstEnabled = this.viewItems.find(vi => vi instanceof actionViewItems_1.$MQ && vi.isEnabled());
                if (firstEnabled instanceof actionViewItems_1.$MQ) {
                    firstEnabled.setFocusable(true);
                }
            }
            else {
                this.viewItems.forEach(vi => {
                    if (vi instanceof actionViewItems_1.$MQ) {
                        vi.setFocusable(false);
                    }
                });
            }
        }
        J(event) {
            let ret = false;
            this.n.keys.forEach(keyCode => {
                ret = ret || event.equals(keyCode);
            });
            return ret;
        }
        L() {
            for (let i = 0; i < this.z.children.length; i++) {
                const elem = this.z.children[i];
                if (DOM.$NO(DOM.$VO(), elem)) {
                    this.t = i;
                    break;
                }
            }
        }
        get context() {
            return this.j;
        }
        set context(context) {
            this.j = context;
            this.viewItems.forEach(i => i.setActionContext(context));
        }
        get actionRunner() {
            return this.f;
        }
        set actionRunner(actionRunner) {
            this.f = actionRunner;
            // when setting a new `IActionRunner` make sure to dispose old listeners and
            // start to forward events from the new listener
            this.g.clear();
            this.g.add(this.f.onDidRun(e => this.G.fire(e)));
            this.g.add(this.f.onWillRun(e => this.H.fire(e)));
            this.viewItems.forEach(item => item.actionRunner = actionRunner);
        }
        getContainer() {
            return this.domNode;
        }
        hasAction(action) {
            return this.viewItems.findIndex(candidate => candidate.action.id === action.id) !== -1;
        }
        getAction(indexOrElement) {
            // by index
            if (typeof indexOrElement === 'number') {
                return this.viewItems[indexOrElement]?.action;
            }
            // by element
            if (indexOrElement instanceof HTMLElement) {
                while (indexOrElement.parentElement !== this.z) {
                    if (!indexOrElement.parentElement) {
                        return undefined;
                    }
                    indexOrElement = indexOrElement.parentElement;
                }
                for (let i = 0; i < this.z.childNodes.length; i++) {
                    if (this.z.childNodes[i] === indexOrElement) {
                        return this.viewItems[i].action;
                    }
                }
            }
            return undefined;
        }
        push(arg, options = {}) {
            const actions = Array.isArray(arg) ? arg : [arg];
            let index = types.$nf(options.index) ? options.index : null;
            actions.forEach((action) => {
                const actionViewItemElement = document.createElement('li');
                actionViewItemElement.className = 'action-item';
                actionViewItemElement.setAttribute('role', 'presentation');
                let item;
                const viewItemOptions = { hoverDelegate: this.b.hoverDelegate, ...options };
                if (this.b.actionViewItemProvider) {
                    item = this.b.actionViewItemProvider(action, viewItemOptions);
                }
                if (!item) {
                    item = new actionViewItems_1.$NQ(this.context, action, viewItemOptions);
                }
                // Prevent native context menu on actions
                if (!this.b.allowContextMenu) {
                    this.r.set(item, DOM.$nO(actionViewItemElement, DOM.$3O.CONTEXT_MENU, (e) => {
                        DOM.$5O.stop(e, true);
                    }));
                }
                item.actionRunner = this.f;
                item.setActionContext(this.context);
                item.render(actionViewItemElement);
                if (this.y && item instanceof actionViewItems_1.$MQ && this.viewItems.length === 0) {
                    // We need to allow for the first enabled item to be focused on using tab navigation #106441
                    item.setFocusable(true);
                }
                if (index === null || index < 0 || index >= this.z.children.length) {
                    this.z.appendChild(actionViewItemElement);
                    this.viewItems.push(item);
                }
                else {
                    this.z.insertBefore(actionViewItemElement, this.z.children[index]);
                    this.viewItems.splice(index, 0, item);
                    index++;
                }
            });
            if (typeof this.t === 'number') {
                // After a clear actions might be re-added to simply toggle some actions. We should preserve focus #97128
                this.focus(this.t);
            }
            this.I();
        }
        getWidth(index) {
            if (index >= 0 && index < this.z.children.length) {
                const item = this.z.children.item(index);
                if (item) {
                    return item.clientWidth;
                }
            }
            return 0;
        }
        getHeight(index) {
            if (index >= 0 && index < this.z.children.length) {
                const item = this.z.children.item(index);
                if (item) {
                    return item.clientHeight;
                }
            }
            return 0;
        }
        pull(index) {
            if (index >= 0 && index < this.viewItems.length) {
                this.z.removeChild(this.z.childNodes[index]);
                this.r.deleteAndDispose(this.viewItems[index]);
                (0, lifecycle_1.$fc)(this.viewItems.splice(index, 1));
                this.I();
            }
        }
        clear() {
            if (this.isEmpty()) {
                return;
            }
            this.viewItems = (0, lifecycle_1.$fc)(this.viewItems);
            this.r.clearAndDisposeAll();
            DOM.$lO(this.z);
            this.I();
        }
        length() {
            return this.viewItems.length;
        }
        isEmpty() {
            return this.viewItems.length === 0;
        }
        focus(arg) {
            let selectFirst = false;
            let index = undefined;
            if (arg === undefined) {
                selectFirst = true;
            }
            else if (typeof arg === 'number') {
                index = arg;
            }
            else if (typeof arg === 'boolean') {
                selectFirst = arg;
            }
            if (selectFirst && typeof this.t === 'undefined') {
                const firstEnabled = this.viewItems.findIndex(item => item.isEnabled());
                // Focus the first enabled item
                this.t = firstEnabled === -1 ? undefined : firstEnabled;
                this.Q(undefined, undefined, true);
            }
            else {
                if (index !== undefined) {
                    this.t = index;
                }
                this.Q(undefined, undefined, true);
            }
        }
        M() {
            this.t = this.length() - 1;
            return this.O(true);
        }
        N() {
            this.t = 0;
            return this.P(true);
        }
        O(forceLoop) {
            if (typeof this.t === 'undefined') {
                this.t = this.viewItems.length - 1;
            }
            else if (this.viewItems.length <= 1) {
                return false;
            }
            const startIndex = this.t;
            let item;
            do {
                if (!forceLoop && this.b.preventLoopNavigation && this.t + 1 >= this.viewItems.length) {
                    this.t = startIndex;
                    return false;
                }
                this.t = (this.t + 1) % this.viewItems.length;
                item = this.viewItems[this.t];
            } while (this.t !== startIndex && ((this.b.focusOnlyEnabledItems && !item.isEnabled()) || item.action.id === actions_1.$ii.ID));
            this.Q();
            return true;
        }
        P(forceLoop) {
            if (typeof this.t === 'undefined') {
                this.t = 0;
            }
            else if (this.viewItems.length <= 1) {
                return false;
            }
            const startIndex = this.t;
            let item;
            do {
                this.t = this.t - 1;
                if (this.t < 0) {
                    if (!forceLoop && this.b.preventLoopNavigation) {
                        this.t = startIndex;
                        return false;
                    }
                    this.t = this.viewItems.length - 1;
                }
                item = this.viewItems[this.t];
            } while (this.t !== startIndex && ((this.b.focusOnlyEnabledItems && !item.isEnabled()) || item.action.id === actions_1.$ii.ID));
            this.Q(true);
            return true;
        }
        Q(fromRight, preventScroll, forceFocus = false) {
            if (typeof this.t === 'undefined') {
                this.z.focus({ preventScroll });
            }
            if (this.s !== undefined && this.s !== this.t) {
                this.viewItems[this.s]?.blur();
            }
            const actionViewItem = this.t !== undefined && this.viewItems[this.t];
            if (actionViewItem) {
                let focusItem = true;
                if (!types.$xf(actionViewItem.focus)) {
                    focusItem = false;
                }
                if (this.b.focusOnlyEnabledItems && types.$xf(actionViewItem.isEnabled) && !actionViewItem.isEnabled()) {
                    focusItem = false;
                }
                if (actionViewItem.action.id === actions_1.$ii.ID) {
                    focusItem = false;
                }
                if (!focusItem) {
                    this.z.focus({ preventScroll });
                    this.s = undefined;
                }
                else if (forceFocus || this.s !== this.t) {
                    actionViewItem.focus(fromRight);
                    this.s = this.t;
                }
            }
        }
        R(event) {
            if (typeof this.t === 'undefined') {
                return; //nothing to focus
            }
            // trigger action
            const actionViewItem = this.viewItems[this.t];
            if (actionViewItem instanceof actionViewItems_1.$MQ) {
                const context = (actionViewItem._context === null || actionViewItem._context === undefined) ? event : actionViewItem._context;
                this.run(actionViewItem._action, context);
            }
        }
        async run(action, context) {
            await this.f.run(action, context);
        }
        dispose() {
            this.j = undefined;
            this.viewItems = (0, lifecycle_1.$fc)(this.viewItems);
            this.getContainer().remove();
            super.dispose();
        }
    }
    exports.$1P = $1P;
    function $2P(actions) {
        if (!actions.length) {
            return actions;
        }
        // Clean up leading separators
        let firstIndexOfAction = -1;
        for (let i = 0; i < actions.length; i++) {
            if (actions[i].id === actions_1.$ii.ID) {
                continue;
            }
            firstIndexOfAction = i;
            break;
        }
        if (firstIndexOfAction === -1) {
            return [];
        }
        actions = actions.slice(firstIndexOfAction);
        // Clean up trailing separators
        for (let h = actions.length - 1; h >= 0; h--) {
            const isSeparator = actions[h].id === actions_1.$ii.ID;
            if (isSeparator) {
                actions.splice(h, 1);
            }
            else {
                break;
            }
        }
        // Clean up separator duplicates
        let foundAction = false;
        for (let k = actions.length - 1; k >= 0; k--) {
            const isSeparator = actions[k].id === actions_1.$ii.ID;
            if (isSeparator && !foundAction) {
                actions.splice(k, 1);
            }
            else if (!isSeparator) {
                foundAction = true;
            }
            else if (isSeparator) {
                foundAction = false;
            }
        }
        return actions;
    }
    exports.$2P = $2P;
});
//# sourceMappingURL=actionbar.js.map