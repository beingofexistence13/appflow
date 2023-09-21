/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/ui/actionbar/actionbar", "vs/base/browser/ui/dropdown/dropdownActionViewItem", "vs/base/common/actions", "vs/base/common/codicons", "vs/base/common/themables", "vs/base/common/event", "vs/base/common/lifecycle", "vs/nls!vs/base/browser/ui/toolbar/toolbar", "vs/css!./toolbar"], function (require, exports, actionbar_1, dropdownActionViewItem_1, actions_1, codicons_1, themables_1, event_1, lifecycle_1, nls) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$7R = exports.$6R = void 0;
    /**
     * A widget that combines an action bar for primary actions and a dropdown for secondary actions.
     */
    class $6R extends lifecycle_1.$kc {
        constructor(container, contextMenuProvider, options = { orientation: 0 /* ActionsOrientation.HORIZONTAL */ }) {
            super();
            this.r = [];
            this.s = false;
            this.w = this.B(new event_1.$ld());
            this.onDidChangeDropdownVisibility = this.w.event;
            this.y = this.B(new lifecycle_1.$jc());
            this.f = options;
            this.t = typeof this.f.getKeyBinding === 'function';
            this.m = this.B(new $7R(() => this.n?.show(), options.toggleMenuTitle));
            this.u = document.createElement('div');
            this.u.className = 'monaco-toolbar';
            container.appendChild(this.u);
            this.j = this.B(new actionbar_1.$1P(this.u, {
                orientation: options.orientation,
                ariaLabel: options.ariaLabel,
                actionRunner: options.actionRunner,
                allowContextMenu: options.allowContextMenu,
                highlightToggledItems: options.highlightToggledItems,
                actionViewItemProvider: (action, viewItemOptions) => {
                    if (action.id === $7R.ID) {
                        this.n = new dropdownActionViewItem_1.$CR(action, action.menuActions, contextMenuProvider, {
                            actionViewItemProvider: this.f.actionViewItemProvider,
                            actionRunner: this.actionRunner,
                            keybindingProvider: this.f.getKeyBinding,
                            classNames: themables_1.ThemeIcon.asClassNameArray(options.moreIcon ?? codicons_1.$Pj.toolBarMore),
                            anchorAlignmentProvider: this.f.anchorAlignmentProvider,
                            menuAsChild: !!this.f.renderDropdownAsChildElement,
                            skipTelemetry: this.f.skipTelemetry
                        });
                        this.n.setActionContext(this.j.context);
                        this.y.add(this.w.add(this.n.onDidChangeVisibility));
                        return this.n;
                    }
                    if (options.actionViewItemProvider) {
                        const result = options.actionViewItemProvider(action, viewItemOptions);
                        if (result) {
                            return result;
                        }
                    }
                    if (action instanceof actions_1.$ji) {
                        const result = new dropdownActionViewItem_1.$CR(action, action.actions, contextMenuProvider, {
                            actionViewItemProvider: this.f.actionViewItemProvider,
                            actionRunner: this.actionRunner,
                            keybindingProvider: this.f.getKeyBinding,
                            classNames: action.class,
                            anchorAlignmentProvider: this.f.anchorAlignmentProvider,
                            menuAsChild: !!this.f.renderDropdownAsChildElement,
                            skipTelemetry: this.f.skipTelemetry
                        });
                        result.setActionContext(this.j.context);
                        this.r.push(result);
                        this.y.add(this.w.add(result.onDidChangeVisibility));
                        return result;
                    }
                    return undefined;
                }
            }));
        }
        set actionRunner(actionRunner) {
            this.j.actionRunner = actionRunner;
        }
        get actionRunner() {
            return this.j.actionRunner;
        }
        set context(context) {
            this.j.context = context;
            this.n?.setActionContext(context);
            for (const actionViewItem of this.r) {
                actionViewItem.setActionContext(context);
            }
        }
        getElement() {
            return this.u;
        }
        focus() {
            this.j.focus();
        }
        getItemsWidth() {
            let itemsWidth = 0;
            for (let i = 0; i < this.j.length(); i++) {
                itemsWidth += this.j.getWidth(i);
            }
            return itemsWidth;
        }
        getItemAction(indexOrElement) {
            return this.j.getAction(indexOrElement);
        }
        getItemWidth(index) {
            return this.j.getWidth(index);
        }
        getItemsLength() {
            return this.j.length();
        }
        setAriaLabel(label) {
            this.j.setAriaLabel(label);
        }
        setActions(primaryActions, secondaryActions) {
            this.C();
            const primaryActionsToSet = primaryActions ? primaryActions.slice(0) : [];
            // Inject additional action to open secondary actions if present
            this.s = !!(secondaryActions && secondaryActions.length > 0);
            if (this.s && secondaryActions) {
                this.m.menuActions = secondaryActions.slice(0);
                primaryActionsToSet.push(this.m);
            }
            primaryActionsToSet.forEach(action => {
                this.j.push(action, { icon: true, label: false, keybinding: this.z(action) });
            });
        }
        isEmpty() {
            return this.j.isEmpty();
        }
        z(action) {
            const key = this.t ? this.f.getKeyBinding?.(action) : undefined;
            return key?.getLabel() ?? undefined;
        }
        C() {
            this.r = [];
            this.y.clear();
            this.j.clear();
        }
        dispose() {
            this.C();
            this.y.dispose();
            super.dispose();
        }
    }
    exports.$6R = $6R;
    class $7R extends actions_1.$gi {
        static { this.ID = 'toolbar.toggle.more'; }
        constructor(toggleDropdownMenu, title) {
            title = title || nls.localize(0, null);
            super($7R.ID, title, undefined, true);
            this.a = [];
            this.b = toggleDropdownMenu;
        }
        async run() {
            this.b();
        }
        get menuActions() {
            return this.a;
        }
        set menuActions(actions) {
            this.a = actions;
        }
    }
    exports.$7R = $7R;
});
//# sourceMappingURL=toolbar.js.map