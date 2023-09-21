/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/ui/actionbar/actionbar", "vs/base/browser/ui/dropdown/dropdownActionViewItem", "vs/base/common/actions", "vs/base/common/codicons", "vs/base/common/themables", "vs/base/common/event", "vs/base/common/lifecycle", "vs/nls", "vs/css!./toolbar"], function (require, exports, actionbar_1, dropdownActionViewItem_1, actions_1, codicons_1, themables_1, event_1, lifecycle_1, nls) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ToggleMenuAction = exports.ToolBar = void 0;
    /**
     * A widget that combines an action bar for primary actions and a dropdown for secondary actions.
     */
    class ToolBar extends lifecycle_1.Disposable {
        constructor(container, contextMenuProvider, options = { orientation: 0 /* ActionsOrientation.HORIZONTAL */ }) {
            super();
            this.submenuActionViewItems = [];
            this.hasSecondaryActions = false;
            this._onDidChangeDropdownVisibility = this._register(new event_1.EventMultiplexer());
            this.onDidChangeDropdownVisibility = this._onDidChangeDropdownVisibility.event;
            this.disposables = this._register(new lifecycle_1.DisposableStore());
            this.options = options;
            this.lookupKeybindings = typeof this.options.getKeyBinding === 'function';
            this.toggleMenuAction = this._register(new ToggleMenuAction(() => this.toggleMenuActionViewItem?.show(), options.toggleMenuTitle));
            this.element = document.createElement('div');
            this.element.className = 'monaco-toolbar';
            container.appendChild(this.element);
            this.actionBar = this._register(new actionbar_1.ActionBar(this.element, {
                orientation: options.orientation,
                ariaLabel: options.ariaLabel,
                actionRunner: options.actionRunner,
                allowContextMenu: options.allowContextMenu,
                highlightToggledItems: options.highlightToggledItems,
                actionViewItemProvider: (action, viewItemOptions) => {
                    if (action.id === ToggleMenuAction.ID) {
                        this.toggleMenuActionViewItem = new dropdownActionViewItem_1.DropdownMenuActionViewItem(action, action.menuActions, contextMenuProvider, {
                            actionViewItemProvider: this.options.actionViewItemProvider,
                            actionRunner: this.actionRunner,
                            keybindingProvider: this.options.getKeyBinding,
                            classNames: themables_1.ThemeIcon.asClassNameArray(options.moreIcon ?? codicons_1.Codicon.toolBarMore),
                            anchorAlignmentProvider: this.options.anchorAlignmentProvider,
                            menuAsChild: !!this.options.renderDropdownAsChildElement,
                            skipTelemetry: this.options.skipTelemetry
                        });
                        this.toggleMenuActionViewItem.setActionContext(this.actionBar.context);
                        this.disposables.add(this._onDidChangeDropdownVisibility.add(this.toggleMenuActionViewItem.onDidChangeVisibility));
                        return this.toggleMenuActionViewItem;
                    }
                    if (options.actionViewItemProvider) {
                        const result = options.actionViewItemProvider(action, viewItemOptions);
                        if (result) {
                            return result;
                        }
                    }
                    if (action instanceof actions_1.SubmenuAction) {
                        const result = new dropdownActionViewItem_1.DropdownMenuActionViewItem(action, action.actions, contextMenuProvider, {
                            actionViewItemProvider: this.options.actionViewItemProvider,
                            actionRunner: this.actionRunner,
                            keybindingProvider: this.options.getKeyBinding,
                            classNames: action.class,
                            anchorAlignmentProvider: this.options.anchorAlignmentProvider,
                            menuAsChild: !!this.options.renderDropdownAsChildElement,
                            skipTelemetry: this.options.skipTelemetry
                        });
                        result.setActionContext(this.actionBar.context);
                        this.submenuActionViewItems.push(result);
                        this.disposables.add(this._onDidChangeDropdownVisibility.add(result.onDidChangeVisibility));
                        return result;
                    }
                    return undefined;
                }
            }));
        }
        set actionRunner(actionRunner) {
            this.actionBar.actionRunner = actionRunner;
        }
        get actionRunner() {
            return this.actionBar.actionRunner;
        }
        set context(context) {
            this.actionBar.context = context;
            this.toggleMenuActionViewItem?.setActionContext(context);
            for (const actionViewItem of this.submenuActionViewItems) {
                actionViewItem.setActionContext(context);
            }
        }
        getElement() {
            return this.element;
        }
        focus() {
            this.actionBar.focus();
        }
        getItemsWidth() {
            let itemsWidth = 0;
            for (let i = 0; i < this.actionBar.length(); i++) {
                itemsWidth += this.actionBar.getWidth(i);
            }
            return itemsWidth;
        }
        getItemAction(indexOrElement) {
            return this.actionBar.getAction(indexOrElement);
        }
        getItemWidth(index) {
            return this.actionBar.getWidth(index);
        }
        getItemsLength() {
            return this.actionBar.length();
        }
        setAriaLabel(label) {
            this.actionBar.setAriaLabel(label);
        }
        setActions(primaryActions, secondaryActions) {
            this.clear();
            const primaryActionsToSet = primaryActions ? primaryActions.slice(0) : [];
            // Inject additional action to open secondary actions if present
            this.hasSecondaryActions = !!(secondaryActions && secondaryActions.length > 0);
            if (this.hasSecondaryActions && secondaryActions) {
                this.toggleMenuAction.menuActions = secondaryActions.slice(0);
                primaryActionsToSet.push(this.toggleMenuAction);
            }
            primaryActionsToSet.forEach(action => {
                this.actionBar.push(action, { icon: true, label: false, keybinding: this.getKeybindingLabel(action) });
            });
        }
        isEmpty() {
            return this.actionBar.isEmpty();
        }
        getKeybindingLabel(action) {
            const key = this.lookupKeybindings ? this.options.getKeyBinding?.(action) : undefined;
            return key?.getLabel() ?? undefined;
        }
        clear() {
            this.submenuActionViewItems = [];
            this.disposables.clear();
            this.actionBar.clear();
        }
        dispose() {
            this.clear();
            this.disposables.dispose();
            super.dispose();
        }
    }
    exports.ToolBar = ToolBar;
    class ToggleMenuAction extends actions_1.Action {
        static { this.ID = 'toolbar.toggle.more'; }
        constructor(toggleDropdownMenu, title) {
            title = title || nls.localize('moreActions', "More Actions...");
            super(ToggleMenuAction.ID, title, undefined, true);
            this._menuActions = [];
            this.toggleDropdownMenu = toggleDropdownMenu;
        }
        async run() {
            this.toggleDropdownMenu();
        }
        get menuActions() {
            return this._menuActions;
        }
        set menuActions(actions) {
            this._menuActions = actions;
        }
    }
    exports.ToggleMenuAction = ToggleMenuAction;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidG9vbGJhci5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL2Jhc2UvYnJvd3Nlci91aS90b29sYmFyL3Rvb2xiYXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBb0NoRzs7T0FFRztJQUNILE1BQWEsT0FBUSxTQUFRLHNCQUFVO1FBY3RDLFlBQVksU0FBc0IsRUFBRSxtQkFBeUMsRUFBRSxVQUEyQixFQUFFLFdBQVcsdUNBQStCLEVBQUU7WUFDdkosS0FBSyxFQUFFLENBQUM7WUFWRCwyQkFBc0IsR0FBaUMsRUFBRSxDQUFDO1lBQzFELHdCQUFtQixHQUFZLEtBQUssQ0FBQztZQUlyQyxtQ0FBOEIsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksd0JBQWdCLEVBQVcsQ0FBQyxDQUFDO1lBQ2hGLGtDQUE2QixHQUFHLElBQUksQ0FBQyw4QkFBOEIsQ0FBQyxLQUFLLENBQUM7WUFDM0UsZ0JBQVcsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksMkJBQWUsRUFBRSxDQUFDLENBQUM7WUFLM0QsSUFBSSxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUM7WUFDdkIsSUFBSSxDQUFDLGlCQUFpQixHQUFHLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxhQUFhLEtBQUssVUFBVSxDQUFDO1lBRTFFLElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksZ0JBQWdCLENBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLHdCQUF3QixFQUFFLElBQUksRUFBRSxFQUFFLE9BQU8sQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDO1lBRW5JLElBQUksQ0FBQyxPQUFPLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUM3QyxJQUFJLENBQUMsT0FBTyxDQUFDLFNBQVMsR0FBRyxnQkFBZ0IsQ0FBQztZQUMxQyxT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