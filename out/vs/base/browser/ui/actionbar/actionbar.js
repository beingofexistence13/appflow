/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/keyboardEvent", "vs/base/browser/ui/actionbar/actionViewItems", "vs/base/common/actions", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/types", "vs/css!./actionbar"], function (require, exports, DOM, keyboardEvent_1, actionViewItems_1, actions_1, event_1, lifecycle_1, types) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.prepareActions = exports.ActionBar = exports.ActionsOrientation = void 0;
    var ActionsOrientation;
    (function (ActionsOrientation) {
        ActionsOrientation[ActionsOrientation["HORIZONTAL"] = 0] = "HORIZONTAL";
        ActionsOrientation[ActionsOrientation["VERTICAL"] = 1] = "VERTICAL";
    })(ActionsOrientation || (exports.ActionsOrientation = ActionsOrientation = {}));
    class ActionBar extends lifecycle_1.Disposable {
        constructor(container, options = {}) {
            super();
            this._actionRunnerDisposables = this._register(new lifecycle_1.DisposableStore());
            this.viewItemDisposables = this._register(new lifecycle_1.DisposableMap());
            // Trigger Key Tracking
            this.triggerKeyDown = false;
            this.focusable = true;
            this._onDidBlur = this._register(new event_1.Emitter());
            this.onDidBlur = this._onDidBlur.event;
            this._onDidCancel = this._register(new event_1.Emitter({ onWillAddFirstListener: () => this.cancelHasListener = true }));
            this.onDidCancel = this._onDidCancel.event;
            this.cancelHasListener = false;
            this._onDidRun = this._register(new event_1.Emitter());
            this.onDidRun = this._onDidRun.event;
            this._onWillRun = this._register(new event_1.Emitter());
            this.onWillRun = this._onWillRun.event;
            this.options = options;
            this._context = options.context ?? null;
            this._orientation = this.options.orientation ?? 0 /* ActionsOrientation.HORIZONTAL */;
            this._triggerKeys = {
                keyDown: this.options.triggerKeys?.keyDown ?? false,
                keys: this.options.triggerKeys?.keys ?? [3 /* KeyCode.Enter */, 10 /* KeyCode.Space */]
            };
            if (this.options.actionRunner) {
                this._actionRunner = this.options.actionRunner;
            }
            else {
                this._actionRunner = new actions_1.ActionRunner();
                this._actionRunnerDisposables.add(this._actionRunner);
            }
            this._actionRunnerDisposables.add(this._actionRunner.onDidRun(e => this._onDidRun.fire(e)));
            this._actionRunnerDisposables.add(this._actionRunner.onWillRun(e => this._onWillRun.fire(e)));
            this.viewItems = [];
            this.focusedItem = undefined;
            this.domNode = document.createElement('div');
            this.domNode.className = 'monaco-action-bar';
            if (options.animated !== false) {
                this.domNode.classList.add('animated');
            }
            let previousKeys;
            let nextKeys;
            switch (this._orientation) {
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
            this._register(DOM.addDisposableListener(this.domNode, DOM.EventType.KEY_DOWN, e => {
                const event = new keyboardEvent_1.StandardKeyboardEvent(e);
                let eventHandled = true;
                const focusedItem = typeof this.focusedItem === 'number' ? this.viewItems[this.focusedItem] : undefined;
                if (previousKeys && (event.equals(previousKeys[0]) || event.equals(previousKeys[1]))) {
                    eventHandled = this.focusPrevious();
                }
                else if (nextKeys && (event.equals(nextKeys[0]) || event.equals(nextKeys[1]))) {
                    eventHandled = this.focusNext();
                }
                else if (event.equals(9 /* KeyCode.Escape */) && this.cancelHasListener) {
                    this._onDidCancel.fire();
                }
                else if (event.equals(14 /* KeyCode.Home */)) {
                    eventHandled = this.focusFirst();
                }
                else if (event.equals(13 /* KeyCode.End */)) {
                    eventHandled = this.focusLast();
                }
                else if (event.equals(2 /* KeyCode.Tab */) && focusedItem instanceof actionViewItems_1.BaseActionViewItem && focusedItem.trapsArrowNavigation) {
                    eventHandled = this.focusNext();
                }
                else if (this.isTriggerKeyEvent(event)) {
                    // Staying out of the else branch even if not triggered
                    if (this._triggerKeys.keyDown) {
                        this.doTrigger(event);
                    }
                    else {
                        this.triggerKeyDown = true;
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
            this._register(DOM.addDisposableListener(this.domNode, DOM.EventType.KEY_UP, e => {
                const event = new keyboardEvent_1.StandardKeyboardEvent(e);
                // Run action on Enter/Space
                if (this.isTriggerKeyEvent(event)) {
                    if (!this._triggerKeys.keyDown && this.triggerKeyDown) {
                        this.triggerKeyDown = false;
                        this.doTrigger(event);
                    }
                    event.preventDefault();
                    event.stopPropagation();
                }
                // Recompute focused item
                else if (event.equals(2 /* KeyCode.Tab */) || event.equals(1024 /* KeyMod.Shift */ | 2 /* KeyCode.Tab */)) {
                    this.updateFocusedItem();
                }
            }));
            this.focusTracker = this._register(DOM.trackFocus(this.domNode));
            this._register(this.focusTracker.onDidBlur(() => {
                if (DOM.getActiveElement() === this.domNode || !DOM.isAncestor(DOM.getActiveElement(), this.domNode)) {
                    this._onDidBlur.fire();
                    this.previouslyFocusedItem = this.focusedItem;
                    this.focusedItem = undefined;
                    this.triggerKeyDown = false;
                }
            }));
            this._register(this.focusTracker.onDidFocus(() => this.updateFocusedItem()));
            this.actionsList = document.createElement('ul');
            this.actionsList.className = 'actions-container';
            if (this.options.highlightToggledItems) {
                this.actionsList.classList.add('highlight-toggled');
            }
            this.actionsList.setAttribute('role', this.options.ariaRole || 'toolbar');
            if (this.options.ariaLabel) {
                this.actionsList.setAttribute('aria-label', this.options.ariaLabel);
            }
            this.domNode.appendChild(this.actionsList);
            container.appendChild(this.domNode);
        }
        refreshRole() {
            if (this.length() >= 2) {
                this.actionsList.setAttribute('role', this.options.ariaRole || 'toolbar');
            }
            else {
                this.actionsList.setAttribute('role', 'presentation');
            }
        }
        setAriaLabel(label) {
            if (label) {
                this.actionsList.setAttribute('aria-label', label);
            }
            else {
                this.actionsList.removeAttribute('aria-label');
            }
        }
        // Some action bars should not be focusable at times
        // When an action bar is not focusable make sure to make all the elements inside it not focusable
        // When an action bar is focusable again, make sure the first item can be focused
        setFocusable(focusable) {
            this.focusable = focusable;
            if (this.focusable) {
                const firstEnabled = this.viewItems.find(vi => vi instanceof actionViewItems_1.BaseActionViewItem && vi.isEnabled());
                if (firstEnabled instanceof actionViewItems_1.BaseActionViewItem) {
                    firstEnabled.setFocusable(true);
                }
            }
            else {
                this.viewItems.forEach(vi => {
                    if (vi instanceof actionViewItems_1.BaseActionViewItem) {
                        vi.setFocusable(false);
                    }
                });
            }
        }
        isTriggerKeyEvent(event) {
            let ret = false;
            this._triggerKeys.keys.forEach(keyCode => {
                ret = ret || event.equals(keyCode);
            });
            return ret;
        }
        updateFocusedItem() {
            for (let i = 0; i < this.actionsList.children.length; i++) {
                const elem = this.actionsList.children[i];
                if (DOM.isAncestor(DOM.getActiveElement(), elem)) {
                    this.focusedItem = i;
                    break;
                }
            }
        }
        get context() {
            return this._context;
        }
        set context(context) {
            this._context = context;
            this.viewItems.forEach(i => i.setActionContext(context));
        }
        get actionRunner() {
            return this._actionRunner;
        }
        set actionRunner(actionRunner) {
            this._actionRunner = actionRunner;
            // when setting a new `IActionRunner` make sure to dispose old listeners and
            // start to forward events from the new listener
            this._actionRunnerDisposables.clear();
            this._actionRunnerDisposables.add(this._actionRunner.onDidRun(e => this._onDidRun.fire(e)));
            this._actionRunnerDisposables.add(this._actionRunner.onWillRun(e => this._onWillRun.fire(e)));
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
                while (indexOrElement.parentElement !== this.actionsList) {
                    if (!indexOrElement.parentElement) {
                        return undefined;
                    }
                    indexOrElement = indexOrElement.parentElement;
                }
                for (let i = 0; i < this.actionsList.childNodes.length; i++) {
                    if (this.actionsList.childNodes[i] === indexOrElement) {
                        return this.viewItems[i].action;
                    }
                }
            }
            return undefined;
        }
        push(arg, options = {}) {
            const actions = Array.isArray(arg) ? arg : [arg];
            let index = types.isNumber(options.index) ? options.index : null;
            actions.forEach((action) => {
                const actionViewItemElement = document.createElement('li');
                actionViewItemElement.className = 'action-item';
                actionViewItemElement.setAttribute('role', 'presentation');
                let item;
                const viewItemOptions = { hoverDelegate: this.options.hoverDelegate, ...options };
                if (this.options.actionViewItemProvider) {
                    item = this.options.actionViewItemProvider(action, viewItemOptions);
                }
                if (!item) {
                    item = new actionViewItems_1.ActionViewItem(this.context, action, viewItemOptions);
                }
                // Prevent native context menu on actions
                if (!this.options.allowContextMenu) {
                    this.viewItemDisposables.set(item, DOM.addDisposableListener(actionViewItemElement, DOM.EventType.CONTEXT_MENU, (e) => {
                        DOM.EventHelper.stop(e, true);
                    }));
                }
                item.actionRunner = this._actionRunner;
                item.setActionContext(this.context);
                item.render(actionViewItemElement);
                if (this.focusable && item instanceof actionViewItems_1.BaseActionViewItem && this.viewItems.length === 0) {
                    // We need to allow for the first enabled item to be focused on using tab navigation #106441
                    item.setFocusable(true);
                }
                if (index === null || index < 0 || index >= this.actionsList.children.length) {
                    this.actionsList.appendChild(actionViewItemElement);
                    this.viewItems.push(item);
                }
                else {
                    this.actionsList.insertBefore(actionViewItemElement, this.actionsList.children[index]);
                    this.viewItems.splice(index, 0, item);
                    index++;
                }
            });
            if (typeof this.focusedItem === 'number') {
                // After a clear actions might be re-added to simply toggle some actions. We should preserve focus #97128
                this.focus(this.focusedItem);
            }
            this.refreshRole();
        }
        getWidth(index) {
            if (index >= 0 && index < this.actionsList.children.length) {
                const item = this.actionsList.children.item(index);
                if (item) {
                    return item.clientWidth;
                }
            }
            return 0;
        }
        getHeight(index) {
            if (index >= 0 && index < this.actionsList.children.length) {
                const item = this.actionsList.children.item(index);
                if (item) {
                    return item.clientHeight;
                }
            }
            return 0;
        }
        pull(index) {
            if (index >= 0 && index < this.viewItems.length) {
                this.actionsList.removeChild(this.actionsList.childNodes[index]);
                this.viewItemDisposables.deleteAndDispose(this.viewItems[index]);
                (0, lifecycle_1.dispose)(this.viewItems.splice(index, 1));
                this.refreshRole();
            }
        }
        clear() {
            if (this.isEmpty()) {
                return;
            }
            this.viewItems = (0, lifecycle_1.dispose)(this.viewItems);
            this.viewItemDisposables.clearAndDisposeAll();
            DOM.clearNode(this.actionsList);
            this.refreshRole();
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
            if (selectFirst && typeof this.focusedItem === 'undefined') {
                const firstEnabled = this.viewItems.findIndex(item => item.isEnabled());
                // Focus the first enabled item
                this.focusedItem = firstEnabled === -1 ? undefined : firstEnabled;
                this.updateFocus(undefined, undefined, true);
            }
            else {
                if (index !== undefined) {
                    this.focusedItem = index;
                }
                this.updateFocus(undefined, undefined, true);
            }
        }
        focusFirst() {
            this.focusedItem = this.length() - 1;
            return this.focusNext(true);
        }
        focusLast() {
            this.focusedItem = 0;
            return this.focusPrevious(true);
        }
        focusNext(forceLoop) {
            if (typeof this.focusedItem === 'undefined') {
                this.focusedItem = this.viewItems.length - 1;
            }
            else if (this.viewItems.length <= 1) {
                return false;
            }
            const startIndex = this.focusedItem;
            let item;
            do {
                if (!forceLoop && this.options.preventLoopNavigation && this.focusedItem + 1 >= this.viewItems.length) {
                    this.focusedItem = startIndex;
                    return false;
                }
                this.focusedItem = (this.focusedItem + 1) % this.viewItems.length;
                item = this.viewItems[this.focusedItem];
            } while (this.focusedItem !== startIndex && ((this.options.focusOnlyEnabledItems && !item.isEnabled()) || item.action.id === actions_1.Separator.ID));
            this.updateFocus();
            return true;
        }
        focusPrevious(forceLoop) {
            if (typeof this.focusedItem === 'undefined') {
                this.focusedItem = 0;
            }
            else if (this.viewItems.length <= 1) {
                return false;
            }
            const startIndex = this.focusedItem;
            let item;
            do {
                this.focusedItem = this.focusedItem - 1;
                if (this.focusedItem < 0) {
                    if (!forceLoop && this.options.preventLoopNavigation) {
                        this.focusedItem = startIndex;
                        return false;
                    }
                    this.focusedItem = this.viewItems.length - 1;
                }
                item = this.viewItems[this.focusedItem];
            } while (this.focusedItem !== startIndex && ((this.options.focusOnlyEnabledItems && !item.isEnabled()) || item.action.id === actions_1.Separator.ID));
            this.updateFocus(true);
            return true;
        }
        updateFocus(fromRight, preventScroll, forceFocus = false) {
            if (typeof this.focusedItem === 'undefined') {
                this.actionsList.focus({ preventScroll });
            }
            if (this.previouslyFocusedItem !== undefined && this.previouslyFocusedItem !== this.focusedItem) {
                this.viewItems[this.previouslyFocusedItem]?.blur();
            }
            const actionViewItem = this.focusedItem !== undefined && this.viewItems[this.focusedItem];
            if (actionViewItem) {
                let focusItem = true;
                if (!types.isFunction(actionViewItem.focus)) {
                    focusItem = false;
                }
                if (this.options.focusOnlyEnabledItems && types.isFunction(actionViewItem.isEnabled) && !actionViewItem.isEnabled()) {
                    focusItem = false;
                }
                if (actionViewItem.action.id === actions_1.Separator.ID) {
                    focusItem = false;
                }
                if (!focusItem) {
                    this.actionsList.focus({ preventScroll });
                    this.previouslyFocusedItem = undefined;
                }
                else if (forceFocus || this.previouslyFocusedItem !== this.focusedItem) {
                    actionViewItem.focus(fromRight);
                    this.previouslyFocusedItem = this.focusedItem;
                }
            }
        }
        doTrigger(event) {
            if (typeof this.focusedItem === 'undefined') {
                return; //nothing to focus
            }
            // trigger action
            const actionViewItem = this.viewItems[this.focusedItem];
            if (actionViewItem instanceof actionViewItems_1.BaseActionViewItem) {
                const context = (actionViewItem._context === null || actionViewItem._context === undefined) ? event : actionViewItem._context;
                this.run(actionViewItem._action, context);
            }
        }
        async run(action, context) {
            await this._actionRunner.run(action, context);
        }
        dispose() {
            this._context = undefined;
            this.viewItems = (0, lifecycle_1.dispose)(this.viewItems);
            this.getContainer().remove();
            super.dispose();
        }
    }
    exports.ActionBar = ActionBar;
    function prepareActions(actions) {
        if (!actions.length) {
            return actions;
        }
        // Clean up leading separators
        let firstIndexOfAction = -1;
        for (let i = 0; i < actions.length; i++) {
            if (actions[i].id === actions_1.Separator.ID) {
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
            const isSeparator = actions[h].id === actions_1.Separator.ID;
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
            const isSeparator = actions[k].id === actions_1.Separator.ID;
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
    exports.prepareActions = prepareActions;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWN0aW9uYmFyLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvYmFzZS9icm93c2VyL3VpL2FjdGlvbmJhci9hY3Rpb25iYXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBMkJoRyxJQUFrQixrQkFHakI7SUFIRCxXQUFrQixrQkFBa0I7UUFDbkMsdUVBQVUsQ0FBQTtRQUNWLG1FQUFRLENBQUE7SUFDVCxDQUFDLEVBSGlCLGtCQUFrQixrQ0FBbEIsa0JBQWtCLFFBR25DO0lBZ0NELE1BQWEsU0FBVSxTQUFRLHNCQUFVO1FBMEN4QyxZQUFZLFNBQXNCLEVBQUUsVUFBNkIsRUFBRTtZQUNsRSxLQUFLLEVBQUUsQ0FBQztZQXRDUSw2QkFBd0IsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksMkJBQWUsRUFBRSxDQUFDLENBQUM7WUFVakUsd0JBQW1CLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLHlCQUFhLEVBQW1CLENBQUMsQ0FBQztZQUs1Rix1QkFBdUI7WUFDZixtQkFBYyxHQUFZLEtBQUssQ0FBQztZQUVoQyxjQUFTLEdBQVksSUFBSSxDQUFDO1lBTWpCLGVBQVUsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksZUFBTyxFQUFRLENBQUMsQ0FBQztZQUN6RCxjQUFTLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUM7WUFFMUIsaUJBQVksR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksZUFBTyxDQUFPLEVBQUUsc0JBQXNCLEVBQUUsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLGlCQUFpQixHQUFHLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQztZQUMxSCxnQkFBVyxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsS0FBSyxDQUFDO1lBQ3ZDLHNCQUFpQixHQUFHLEtBQUssQ0FBQztZQUVqQixjQUFTLEdBQUcsSUFB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