/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/actions", "vs/workbench/common/component", "vs/base/common/event", "vs/base/browser/dom", "vs/base/common/lifecycle", "vs/base/common/types"], function (require, exports, actions_1, component_1, event_1, dom_1, lifecycle_1, types_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$3T = exports.$2T = exports.$1T = void 0;
    /**
     * Composites are layed out in the sidebar and panel part of the workbench. At a time only one composite
     * can be open in the sidebar, and only one composite can be open in the panel.
     *
     * Each composite has a minimized representation that is good enough to provide some
     * information about the state of the composite data.
     *
     * The workbench will keep a composite alive after it has been created and show/hide it based on
     * user interaction. The lifecycle of a composite goes in the order create(), setVisible(true|false),
     * layout(), focus(), dispose(). During use of the workbench, a composite will often receive a setVisible,
     * layout and focus call, but only one create and dispose call.
     */
    class $1T extends component_1.$ZT {
        get onDidFocus() {
            if (!this.H) {
                this.H = this.M().onDidFocus;
            }
            return this.H.event;
        }
        I() {
            this.H?.fire();
        }
        get onDidBlur() {
            if (!this.J) {
                this.J = this.M().onDidBlur;
            }
            return this.J.event;
        }
        hasFocus() {
            return this.L;
        }
        M() {
            const container = (0, types_1.$uf)(this.getContainer());
            const focusTracker = this.B((0, dom_1.$8O)(container));
            const onDidFocus = this.H = this.B(new event_1.$fd());
            this.B(focusTracker.onDidFocus(() => {
                this.L = true;
                onDidFocus.fire();
            }));
            const onDidBlur = this.J = this.B(new event_1.$fd());
            this.B(focusTracker.onDidBlur(() => {
                this.L = false;
                onDidBlur.fire();
            }));
            return { onDidFocus, onDidBlur };
        }
        get P() { return this.O; }
        constructor(id, telemetryService, themeService, storageService) {
            super(id, themeService, storageService);
            this.t = this.B(new event_1.$fd());
            this.onTitleAreaUpdate = this.t.event;
            this.L = false;
            this.O = telemetryService;
            this.Q = false;
        }
        getTitle() {
            return undefined;
        }
        /**
         * Note: Clients should not call this method, the workbench calls this
         * method. Calling it otherwise may result in unexpected behavior.
         *
         * Called to create this composite on the provided parent. This method is only
         * called once during the lifetime of the workbench.
         * Note that DOM-dependent calculations should be performed from the setVisible()
         * call. Only then the composite will be part of the DOM.
         */
        create(parent) {
            this.R = parent;
        }
        /**
         * Returns the container this composite is being build in.
         */
        getContainer() {
            return this.R;
        }
        /**
         * Note: Clients should not call this method, the workbench calls this
         * method. Calling it otherwise may result in unexpected behavior.
         *
         * Called to indicate that the composite has become visible or hidden. This method
         * is called more than once during workbench lifecycle depending on the user interaction.
         * The composite will be on-DOM if visible is set to true and off-DOM otherwise.
         *
         * Typically this operation should be fast though because setVisible might be called many times during a session.
         * If there is a long running operation it is fine to have it running in the background asyncly and return before.
         */
        setVisible(visible) {
            if (this.Q !== !!visible) {
                this.Q = visible;
            }
        }
        /**
         * Called when this composite should receive keyboard focus.
         */
        focus() {
            // Subclasses can implement
        }
        /**
         * Update the styles of the contents of this composite.
         */
        updateStyles() {
            super.updateStyles();
        }
        /**
         *
         * @returns the action runner for this composite
         */
        getMenuIds() {
            return [];
        }
        /**
         * Returns an array of actions to show in the action bar of the composite.
         */
        getActions() {
            return [];
        }
        /**
         * Returns an array of actions to show in the action bar of the composite
         * in a less prominent way then action from getActions.
         */
        getSecondaryActions() {
            return [];
        }
        /**
         * Returns an array of actions to show in the context menu of the composite
         */
        getContextMenuActions() {
            return [];
        }
        /**
         * For any of the actions returned by this composite, provide an IActionViewItem in
         * cases where the implementor of the composite wants to override the presentation
         * of an action. Returns undefined to indicate that the action is not rendered through
         * an action item.
         */
        getActionViewItem(action) {
            return undefined;
        }
        /**
         * Provide a context to be passed to the toolbar.
         */
        getActionsContext() {
            return null;
        }
        /**
         * Returns the instance of IActionRunner to use with this composite for the
         * composite tool bar.
         */
        getActionRunner() {
            if (!this.N) {
                this.N = this.B(new actions_1.$hi());
            }
            return this.N;
        }
        /**
         * Method for composite implementors to indicate to the composite container that the title or the actions
         * of the composite have changed. Calling this method will cause the container to ask for title (getTitle())
         * and actions (getActions(), getSecondaryActions()) if the composite is visible or the next time the composite
         * gets visible.
         */
        S() {
            this.t.fire();
        }
        /**
         * Returns true if this composite is currently visible and false otherwise.
         */
        isVisible() {
            return this.Q;
        }
        /**
         * Returns the underlying composite control or `undefined` if it is not accessible.
         */
        getControl() {
            return undefined;
        }
    }
    exports.$1T = $1T;
    /**
     * A composite descriptor is a lightweight descriptor of a composite in the workbench.
     */
    class $2T {
        constructor(a, id, name, cssClass, order, requestedIndex) {
            this.a = a;
            this.id = id;
            this.name = name;
            this.cssClass = cssClass;
            this.order = order;
            this.requestedIndex = requestedIndex;
        }
        instantiate(instantiationService) {
            return instantiationService.createInstance(this.a);
        }
    }
    exports.$2T = $2T;
    class $3T extends lifecycle_1.$kc {
        constructor() {
            super(...arguments);
            this.a = this.B(new event_1.$fd());
            this.onDidRegister = this.a.event;
            this.b = this.B(new event_1.$fd());
            this.onDidDeregister = this.b.event;
            this.c = [];
        }
        f(descriptor) {
            if (this.j(descriptor.id)) {
                return;
            }
            this.c.push(descriptor);
            this.a.fire(descriptor);
        }
        g(id) {
            const descriptor = this.j(id);
            if (!descriptor) {
                return;
            }
            this.c.splice(this.c.indexOf(descriptor), 1);
            this.b.fire(descriptor);
        }
        getComposite(id) {
            return this.j(id);
        }
        h() {
            return this.c.slice(0);
        }
        j(id) {
            return this.c.find(composite => composite.id === id);
        }
    }
    exports.$3T = $3T;
});
//# sourceMappingURL=composite.js.map