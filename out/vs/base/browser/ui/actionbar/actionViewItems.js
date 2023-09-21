/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/browser", "vs/base/browser/dnd", "vs/base/browser/dom", "vs/base/browser/touch", "vs/base/browser/ui/iconLabel/iconLabelHover", "vs/base/browser/ui/selectBox/selectBox", "vs/base/common/actions", "vs/base/common/lifecycle", "vs/base/common/platform", "vs/base/common/types", "vs/nls", "vs/css!./actionbar"], function (require, exports, browser_1, dnd_1, dom_1, touch_1, iconLabelHover_1, selectBox_1, actions_1, lifecycle_1, platform, types, nls) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SelectActionViewItem = exports.ActionViewItem = exports.BaseActionViewItem = void 0;
    class BaseActionViewItem extends lifecycle_1.Disposable {
        get action() {
            return this._action;
        }
        constructor(context, action, options = {}) {
            super();
            this.options = options;
            this._context = context || this;
            this._action = action;
            if (action instanceof actions_1.Action) {
                this._register(action.onDidChange(event => {
                    if (!this.element) {
                        // we have not been rendered yet, so there
                        // is no point in updating the UI
                        return;
                    }
                    this.handleActionChangeEvent(event);
                }));
            }
        }
        handleActionChangeEvent(event) {
            if (event.enabled !== undefined) {
                this.updateEnabled();
            }
            if (event.checked !== undefined) {
                this.updateChecked();
            }
            if (event.class !== undefined) {
                this.updateClass();
            }
            if (event.label !== undefined) {
                this.updateLabel();
                this.updateTooltip();
            }
            if (event.tooltip !== undefined) {
                this.updateTooltip();
            }
        }
        get actionRunner() {
            if (!this._actionRunner) {
                this._actionRunner = this._register(new actions_1.ActionRunner());
            }
            return this._actionRunner;
        }
        set actionRunner(actionRunner) {
            this._actionRunner = actionRunner;
        }
        isEnabled() {
            return this._action.enabled;
        }
        setActionContext(newContext) {
            this._context = newContext;
        }
        render(container) {
            const element = this.element = container;
            this._register(touch_1.Gesture.addTarget(container));
            const enableDragging = this.options && this.options.draggable;
            if (enableDragging) {
                container.draggable = true;
                if (browser_1.isFirefox) {
                    // Firefox: requires to set a text data transfer to get going
                    this._register((0, dom_1.addDisposableListener)(container, dom_1.EventType.DRAG_START, e => e.dataTransfer?.setData(dnd_1.DataTransfers.TEXT, this._action.label)));
                }
            }
            this._register((0, dom_1.addDisposableListener)(element, touch_1.EventType.Tap, e => this.onClick(e, true))); // Preserve focus on tap #125470
            this._register((0, dom_1.addDisposableListener)(element, dom_1.EventType.MOUSE_DOWN, e => {
                if (!enableDragging) {
                    dom_1.EventHelper.stop(e, true); // do not run when dragging is on because that would disable it
                }
                if (this._action.enabled && e.button === 0) {
                    element.classList.add('active');
                }
            }));
            if (platform.isMacintosh) {
                // macOS: allow to trigger the button when holding Ctrl+key and pressing the
                // main mouse button. This is for scenarios where e.g. some interaction forces
                // the Ctrl+key to be pressed and hold but the user still wants to interact
                // with the actions (for example quick access in quick navigation mode).
                this._register((0, dom_1.addDisposableListener)(element, dom_1.EventType.CONTEXT_MENU, e => {
                    if (e.button === 0 && e.ctrlKey === true) {
                        this.onClick(e);
                    }
                }));
            }
            this._register((0, dom_1.addDisposableListener)(element, dom_1.EventType.CLICK, e => {
                dom_1.EventHelper.stop(e, true);
                // menus do not use the click event
                if (!(this.options && this.options.isMenu)) {
                    this.onClick(e);
                }
            }));
            this._register((0, dom_1.addDisposableListener)(element, dom_1.EventType.DBLCLICK, e => {
                dom_1.EventHelper.stop(e, true);
            }));
            [dom_1.EventType.MOUSE_UP, dom_1.EventType.MOUSE_OUT].forEach(event => {
                this._register((0, dom_1.addDisposableListener)(element, event, e => {
                    dom_1.EventHelper.stop(e);
                    element.classList.remove('active');
                }));
            });
        }
        onClick(event, preserveFocus = false) {
            dom_1.EventHelper.stop(event, true);
            const context = types.isUndefinedOrNull(this._context) ? this.options?.useEventAsContext ? event : { preserveFocus } : this._context;
            this.actionRunner.run(this._action, context);
        }
        // Only set the tabIndex on the element once it is about to get focused
        // That way this element wont be a tab stop when it is not needed #106441
        focus() {
            if (this.element) {
                this.element.tabIndex = 0;
                this.element.focus();
                this.element.classList.add('focused');
            }
        }
        isFocused() {
            return !!this.element?.classList.contains('focused');
        }
        blur() {
            if (this.element) {
                this.element.blur();
                this.element.tabIndex = -1;
                this.element.classList.remove('focused');
            }
        }
        setFocusable(focusable) {
            if (this.element) {
                this.element.tabIndex = focusable ? 0 : -1;
            }
        }
        get trapsArrowNavigation() {
            return false;
        }
        updateEnabled() {
            // implement in subclass
        }
        updateLabel() {
            // implement in subclass
        }
        getTooltip() {
            return this.action.tooltip;
        }
        updateTooltip() {
            if (!this.element) {
                return;
            }
            const title = this.getTooltip() ?? '';
            this.updateAriaLabel();
            if (!this.options.hoverDelegate) {
                this.element.title = title;
            }
            else {
                this.element.title = '';
                if (!this.customHover) {
                    this.customHover = (0, iconLabelHover_1.setupCustomHover)(this.options.hoverDelegate, this.element, title);
                    this._store.add(this.customHover);
                }
                else {
                    this.customHover.update(title);
                }
            }
        }
        updateAriaLabel() {
            if (this.element) {
                const title = this.getTooltip() ?? '';
                this.element.setAttribute('aria-label', title);
            }
        }
        updateClass() {
            // implement in subclass
        }
        updateChecked() {
            // implement in subclass
        }
        dispose() {
            if (this.element) {
                this.element.remove();
                this.element = undefined;
            }
            this._context = undefined;
            super.dispose();
        }
    }
    exports.BaseActionViewItem = BaseActionViewItem;
    class ActionViewItem extends BaseActionViewItem {
        constructor(context, action, options) {
            super(context, action, options);
            this.options = options;
            this.options.icon = options.icon !== undefined ? options.icon : false;
            this.options.label = options.label !== undefined ? options.label : true;
            this.cssClass = '';
        }
        render(container) {
            super.render(container);
            if (this.element) {
                this.label = (0, dom_1.append)(this.element, (0, dom_1.$)('a.action-label'));
            }
            if (this.label) {
                this.label.setAttribute('role', this.getDefaultAriaRole());
            }
            if (this.options.label && this.options.keybinding && this.element) {
                (0, dom_1.append)(this.element, (0, dom_1.$)('span.keybinding')).textContent = this.options.keybinding;
            }
            this.updateClass();
            this.updateLabel();
            this.updateTooltip();
            this.updateEnabled();
            this.updateChecked();
        }
        getDefaultAriaRole() {
            if (this._action.id === actions_1.Separator.ID) {
                return 'presentation'; // A separator is a presentation item
            }
            else {
                if (this.options.isMenu) {
                    return 'menuitem';
                }
                else {
                    return 'button';
                }
            }
        }
        // Only set the tabIndex on the element once it is about to get focused
        // That way this element wont be a tab stop when it is not needed #106441
        focus() {
            if (this.label) {
                this.label.tabIndex = 0;
                this.label.focus();
            }
        }
        isFocused() {
            return !!this.label && this.label?.tabIndex === 0;
        }
        blur() {
            if (this.label) {
                this.label.tabIndex = -1;
            }
        }
        setFocusable(focusable) {
            if (this.label) {
                this.label.tabIndex = focusable ? 0 : -1;
            }
        }
        updateLabel() {
            if (this.options.label && this.label) {
                this.label.textContent = this.action.label;
            }
        }
        getTooltip() {
            let title = null;
            if (this.action.tooltip) {
                title = this.action.tooltip;
            }
            else if (!this.options.label && this.action.label && this.options.icon) {
                title = this.action.label;
                if (this.options.keybinding) {
                    title = nls.localize({ key: 'titleLabel', comment: ['action title', 'action keybinding'] }, "{0} ({1})", title, this.options.keybinding);
                }
            }
            return title ?? undefined;
        }
        updateClass() {
            if (this.cssClass && this.label) {
                this.label.classList.remove(...this.cssClass.split(' '));
            }
            if (this.options.icon) {
                this.cssClass = this.action.class;
                if (this.label) {
                    this.label.classList.add('codicon');
                    if (this.cssClass) {
                        this.label.classList.add(...this.cssClass.split(' '));
                    }
                }
                this.updateEnabled();
            }
            else {
                this.label?.classList.remove('codicon');
            }
        }
        updateEnabled() {
            if (this.action.enabled) {
                if (this.label) {
                    this.label.removeAttribute('aria-disabled');
                    this.label.classList.remove('disabled');
                }
                this.element?.classList.remove('disabled');
            }
            else {
                if (this.label) {
                    this.label.setAttribute('aria-disabled', 'true');
                    this.label.classList.add('disabled');
                }
                this.element?.classList.add('disabled');
            }
        }
        updateAriaLabel() {
            if (this.label) {
                const title = this.getTooltip() ?? '';
                this.label.setAttribute('aria-label', title);
            }
        }
        updateChecked() {
            if (this.label) {
                if (this.action.checked !== undefined) {
                    this.label.classList.toggle('checked', this.action.checked);
                    this.label.setAttribute('aria-checked', this.action.checked ? 'true' : 'false');
                    this.label.setAttribute('role', 'checkbox');
                }
                else {
                    this.label.classList.remove('checked');
                    this.label.setAttribute('aria-checked', '');
                    this.label.setAttribute('role', this.getDefaultAriaRole());
                }
            }
        }
    }
    exports.ActionViewItem = ActionViewItem;
    class SelectActionViewItem extends BaseActionViewItem {
        constructor(ctx, action, options, selected, contextViewProvider, styles, selectBoxOptions) {
            super(ctx, action);
            this.selectBox = new selectBox_1.SelectBox(options, selected, contextViewProvider, styles, selectBoxOptions);
            this.selectBox.setFocusable(false);
            this._register(this.selectBox);
            this.registerListeners();
        }
        setOptions(options, selected) {
            this.selectBox.setOptions(options, selected);
        }
        select(index) {
            this.selectBox.select(index);
        }
        registerListeners() {
            this._register(this.selectBox.onDidSelect(e => this.runAction(e.selected, e.index)));
        }
        runAction(option, index) {
            this.actionRunner.run(this._action, this.getActionContext(option, index));
        }
        getActionContext(option, index) {
            return option;
        }
        setFocusable(focusable) {
            this.selectBox.setFocusable(focusable);
        }
        focus() {
            this.selectBox?.focus();
        }
        blur() {
            this.selectBox?.blur();
        }
        render(container) {
            this.selectBox.render(container);
        }
    }
    exports.SelectActionViewItem = SelectActionViewItem;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWN0aW9uVmlld0l0ZW1zLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvYmFzZS9icm93c2VyL3VpL2FjdGlvbmJhci9hY3Rpb25WaWV3SXRlbXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBMEJoRyxNQUFhLGtCQUFtQixTQUFRLHNCQUFVO1FBU2pELElBQUksTUFBTTtZQUNULE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQztRQUNyQixDQUFDO1FBSUQsWUFBWSxPQUFnQixFQUFFLE1BQWUsRUFBWSxVQUFzQyxFQUFFO1lBQ2hHLEtBQUssRUFBRSxDQUFDO1lBRGdELFlBQU8sR0FBUCxPQUFPLENBQWlDO1lBR2hHLElBQUksQ0FBQyxRQUFRLEdBQUcsT0FBTyxJQUFJLElBQUksQ0FBQztZQUNoQyxJQUFJLENBQUMsT0FBTyxHQUFHLE1BQU0sQ0FBQztZQUV0QixJQUFJLE1BQU0sWUFBWSxnQkFBTSxFQUFFO2dCQUM3QixJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLEVBQUU7b0JBQ3pDLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFO3dCQUNsQiwwQ0FBMEM7d0JBQzFDLGlDQUFpQzt3QkFDakMsT0FBTztxQkFDUDtvQkFFRCxJQUFJLENBQUMsdUJBQXVCLENBQUMsS0FBSyxDQUFDLENBQUM7Z0JBQ3JDLENBQUMsQ0FBQyxDQUFDLENBQUM7YUFDSjtRQUNGLENBQUM7UUFFTyx1QkFBdUIsQ0FBQyxLQUF5QjtZQUN4RCxJQUFJLEtBQUssQ0FBQyxPQUFPLEtBQUssU0FBUyxFQUFFO2dCQUNoQyxJQUFJLENBQUMsYUFBYSxFQUFFLENBQUM7YUFDckI7WUFFRCxJQUFJLEtBQUssQ0FBQyxPQUFPLEtBQUssU0FBUyxFQUFFO2dCQUNoQyxJQUFJLENBQUMsYUFBYSxFQUFFLENBQUM7YUFDckI7WUFFRCxJQUFJ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