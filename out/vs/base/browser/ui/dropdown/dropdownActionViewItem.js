/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls", "vs/base/browser/dom", "vs/base/browser/keyboardEvent", "vs/base/browser/ui/actionbar/actionViewItems", "vs/base/browser/ui/dropdown/dropdown", "vs/base/common/actions", "vs/base/common/codicons", "vs/base/common/themables", "vs/base/common/event", "vs/css!./dropdown"], function (require, exports, nls, dom_1, keyboardEvent_1, actionViewItems_1, dropdown_1, actions_1, codicons_1, themables_1, event_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ActionWithDropdownActionViewItem = exports.DropdownMenuActionViewItem = void 0;
    class DropdownMenuActionViewItem extends actionViewItems_1.BaseActionViewItem {
        constructor(action, menuActionsOrProvider, contextMenuProvider, options = Object.create(null)) {
            super(null, action, options);
            this.actionItem = null;
            this._onDidChangeVisibility = this._register(new event_1.Emitter());
            this.onDidChangeVisibility = this._onDidChangeVisibility.event;
            this.menuActionsOrProvider = menuActionsOrProvider;
            this.contextMenuProvider = contextMenuProvider;
            this.options = options;
            if (this.options.actionRunner) {
                this.actionRunner = this.options.actionRunner;
            }
        }
        render(container) {
            this.actionItem = container;
            const labelRenderer = (el) => {
                this.element = (0, dom_1.append)(el, (0, dom_1.$)('a.action-label'));
                let classNames = [];
                if (typeof this.options.classNames === 'string') {
                    classNames = this.options.classNames.split(/\s+/g).filter(s => !!s);
                }
                else if (this.options.classNames) {
                    classNames = this.options.classNames;
                }
                // todo@aeschli: remove codicon, should come through `this.options.classNames`
                if (!classNames.find(c => c === 'icon')) {
                    classNames.push('codicon');
                }
                this.element.classList.add(...classNames);
                this.element.setAttribute('role', 'button');
                this.element.setAttribute('aria-haspopup', 'true');
                this.element.setAttribute('aria-expanded', 'false');
                this.element.title = this._action.label || '';
                this.element.ariaLabel = this._action.label || '';
                return null;
            };
            const isActionsArray = Array.isArray(this.menuActionsOrProvider);
            const options = {
                contextMenuProvider: this.contextMenuProvider,
                labelRenderer: labelRenderer,
                menuAsChild: this.options.menuAsChild,
                actions: isActionsArray ? this.menuActionsOrProvider : undefined,
                actionProvider: isActionsArray ? undefined : this.menuActionsOrProvider,
                skipTelemetry: this.options.skipTelemetry
            };
            this.dropdownMenu = this._register(new dropdown_1.DropdownMenu(container, options));
            this._register(this.dropdownMenu.onDidChangeVisibility(visible => {
                this.element?.setAttribute('aria-expanded', `${visible}`);
                this._onDidChangeVisibility.fire(visible);
            }));
            this.dropdownMenu.menuOptions = {
                actionViewItemProvider: this.options.actionViewItemProvider,
                actionRunner: this.actionRunner,
                getKeyBinding: this.options.keybindingProvider,
                context: this._context
            };
            if (this.options.anchorAlignmentProvider) {
                const that = this;
                this.dropdownMenu.menuOptions = {
                    ...this.dropdownMenu.menuOptions,
                    get anchorAlignment() {
                        return that.options.anchorAlignmentProvider();
                    }
                };
            }
            this.updateTooltip();
            this.updateEnabled();
        }
        getTooltip() {
            let title = null;
            if (this.action.tooltip) {
                title = this.action.tooltip;
            }
            else if (this.action.label) {
                title = this.action.label;
            }
            return title ?? undefined;
        }
        setActionContext(newContext) {
            super.setActionContext(newContext);
            if (this.dropdownMenu) {
                if (this.dropdownMenu.menuOptions) {
                    this.dropdownMenu.menuOptions.context = newContext;
                }
                else {
                    this.dropdownMenu.menuOptions = { context: newContext };
                }
            }
        }
        show() {
            this.dropdownMenu?.show();
        }
        updateEnabled() {
            const disabled = !this.action.enabled;
            this.actionItem?.classList.toggle('disabled', disabled);
            this.element?.classList.toggle('disabled', disabled);
        }
    }
    exports.DropdownMenuActionViewItem = DropdownMenuActionViewItem;
    class ActionWithDropdownActionViewItem extends actionViewItems_1.ActionViewItem {
        constructor(context, action, options, contextMenuProvider) {
            super(context, action, options);
            this.contextMenuProvider = contextMenuProvider;
        }
        render(container) {
            super.render(container);
            if (this.element) {
                this.element.classList.add('action-dropdown-item');
                const menuActionsProvider = {
                    getActions: () => {
                        const actionsProvider = this.options.menuActionsOrProvider;
                        return Array.isArray(actionsProvider) ? actionsProvider : actionsProvider.getActions(); // TODO: microsoft/TypeScript#42768
                    }
                };
                const menuActionClassNames = this.options.menuActionClassNames || [];
                const separator = (0, dom_1.h)('div.action-dropdown-item-separator', [(0, dom_1.h)('div', {})]).root;
                separator.classList.toggle('prominent', menuActionClassNames.includes('prominent'));
                (0, dom_1.append)(this.element, separator);
                this.dropdownMenuActionViewItem = new DropdownMenuActionViewItem(this._register(new actions_1.Action('dropdownAction', nls.localize('moreActions', "More Actions..."))), menuActionsProvider, this.contextMenuProvider, { classNames: ['dropdown', ...themables_1.ThemeIcon.asClassNameArray(codicons_1.Codicon.dropDownButton), ...menuActionClassNames] });
                this.dropdownMenuActionViewItem.render(this.element);
                this._register((0, dom_1.addDisposableListener)(this.element, dom_1.EventType.KEY_DOWN, e => {
                    const event = new keyboardEvent_1.StandardKeyboardEvent(e);
                    let handled = false;
                    if (this.dropdownMenuActionViewItem?.isFocused() && event.equals(15 /* KeyCode.LeftArrow */)) {
                        handled = true;
                        this.dropdownMenuActionViewItem?.blur();
                        this.focus();
                    }
                    else if (this.isFocused() && event.equals(17 /* KeyCode.RightArrow */)) {
                        handled = true;
                        this.blur();
                        this.dropdownMenuActionViewItem?.focus();
                    }
                    if (handled) {
                        event.preventDefault();
                        event.stopPropagation();
                    }
                }));
            }
        }
        blur() {
            super.blur();
            this.dropdownMenuActionViewItem?.blur();
        }
        setFocusable(focusable) {
            super.setFocusable(focusable);
            this.dropdownMenuActionViewItem?.setFocusable(focusable);
        }
    }
    exports.ActionWithDropdownActionViewItem = ActionWithDropdownActionViewItem;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZHJvcGRvd25BY3Rpb25WaWV3SXRlbS5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL2Jhc2UvYnJvd3Nlci91aS9kcm9wZG93bi9kcm9wZG93bkFjdGlvblZpZXdJdGVtLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQXFDaEcsTUFBYSwwQkFBMkIsU0FBUSxvQ0FBa0I7UUFXakUsWUFDQyxNQUFlLEVBQ2YscUJBQTJELEVBQzNELG1CQUF5QyxFQUN6QyxVQUE4QyxNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQztZQUVqRSxLQUFLLENBQUMsSUFBSSxFQUFFLE1BQU0sRUFBRSxPQUFPLENBQUMsQ0FBQztZQWJ0QixlQUFVLEdBQXVCLElBQUksQ0FBQztZQUV0QywyQkFBc0IsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksZUFBTyxFQUFXLENBQUMsQ0FBQztZQUMvRCwwQkFBcUIsR0FBRyxJQUFJLENBQUMsc0JBQXNCLENBQUMsS0FBSyxDQUFDO1lBWWxFLElBQUksQ0FBQyxxQkFBcUIsR0FBRyxxQkFBcUIsQ0FBQztZQUNuRCxJQUFJLENBQUMsbUJBQW1CLEdBQUcsbUJBQW1CLENBQUM7WUFDL0MsSUFBSSxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUM7WUFFdkIsSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLFlBQVksRUFBRTtnQkFDOUIsSUFBSSxDQUFDLFlBQVksR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLFlBQVksQ0FBQzthQUM5QztRQUNGLENBQUM7UUFFUSxNQUFNLENBQUMsU0FBc0I7WUFDckMsSUFBSSxDQUFDLFVBQVUsR0FBRyxTQUFTLENBQUM7WUFFNUIsTUFBTSxhQUFhLEdBQW1CLENBQUMsRUFBZSxFQUFzQixFQUFFO2dCQUM3RSxJQUFJLENBQUMsT0FBTyxHQUFHLElBQUEsWUFBTSxFQUFDLEVBQUUsRUFBRSxJQUFBLE9BQUMsRUFBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUM7Z0JBRS9DLElBQUksVUFBVSxHQUFhLEVBQUUsQ0FBQztnQkFFOUIsSUFBSSxPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsVUFBVSxLQUFLLFFBQVEsRUFBRTtvQkFDaEQsVUFBVSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7aUJBQ3BFO3FCQUFNLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxVQUFVLEVBQUU7b0JBQ25DLFVBQVUsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQztpQkFDckM7Z0JBRUQsOEVBQThFO2dCQUM5RSxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsS0FBSyxNQUFNLENBQUMsRUFBRTtvQkFDeEMsVUFBVSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztpQkFDM0I7Z0JBRUQsSUFBSSxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLEdBQUcsVUFBVSxDQUFDLENBQUM7Z0JBRTFDLElBQUksQ0FBQyxPQUFPLENBQUMsWUFBWSxDQUFDLE1BQU0sRUFBRSxRQUFRLENBQUMsQ0FBQztnQkFDNUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxZQUFZLENBQUMsZUFBZSxFQUFFLE1BQU0sQ0FBQyxDQUFDO2dCQUNuRCxJQUFJLENBQUMsT0FBTyxDQUFDLFlBQVksQ0FBQyxlQUFlLEVBQUUsT0FBTyxDQUFDLENBQUM7Z0JBQ3BELElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxJQUFJLEVBQUUsQ0FBQztnQkFDOUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLElBQUksRUFBRSxDQUFDO2dCQUVsRCxPQUFPLElBQUksQ0FBQztZQUNiLENBQUMsQ0FBQztZQUVGLE1BQU0sY0FBYyxHQUFHLEtBQUssQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLHFCQUFxQixDQUFDLENBQUM7WUFDakUsTUFBTSxPQUFPLEdBQXlCO2dCQUNyQyxtQkFBbUIsRUFBRSxJQUFJLENBQUMsbUJBQW1CO2dCQUM3QyxhQUFhLEVBQUUsYUFBYTtnQkFDNUIsV0FBVyxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsV0FBVztnQkFDckMsT0FBTyxFQUFFLGNBQWMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLHFCQUFrQyxDQUFDLENBQUMsQ0FBQyxTQUFTO2dCQUM3RSxjQUFjLEVBQUUsY0FBYyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxxQkFBd0M7Z0JBQzFGLGFBQWEsRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLGFBQWE7YUFDekMsQ0FBQztZQUVGLElBQUksQ0FBQyxZQUFZLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLHVCQUFZLENBQUMsU0FBUyxFQUFFLE9BQU8sQ0FBQyxDQUFDLENBQUM7WUFDekUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLHFCQUFxQixDQUFDLE9BQU8sQ0FBQyxFQUFFO2dCQUNoRSxJQUFJLENBQUMsT0FBTyxFQUFFLFlBQVksQ0FBQyxlQUFlLEVBQUUsR0FBRyxPQUFPLEVBQUUsQ0FBQyxDQUFDO2dCQUMxRCxJQUFJLENBQUMsc0JBQXNCLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQzNDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFFSixJQUFJLENBQUMsWUFBWSxDQUFDLFdBQVcsR0FBRztnQkFDL0Isc0JBQXNCLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxzQkFBc0I7Z0JBQzNELFlBQVksRUFBRSxJQUFJLENBQUMsWUFBWTtnQkFDL0IsYUFBYSxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsa0JBQWtCO2dCQUM5QyxPQUFPLEVBQUUsSUFBSSxDQUFDLFFBQVE7YUFDdEIsQ0FBQztZQUVGLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyx1QkFBdUIsRUFBRTtnQkFDekMsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDO2dCQUVsQixJQUFJLENBQUMsWUFBWSxDQUFDLFdBQVcsR0FBRztvQkFDL0IsR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLFdBQVc7b0JBQ2hDLElBQUksZUFBZTt3QkFDbEIsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLHVCQUF3QixFQUFFLENBQUM7b0JBQ2hELENBQUM7aUJBQ0QsQ0FBQzthQUNGO1lBRUQsSUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFDO1lBQ3JCLElBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQztRQUN0QixDQUFDO1FBRWtCLFVBQVU7WUFDNUIsSUFBSSxLQUFLLEdBQWtCLElBQUksQ0FBQztZQUVoQyxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxFQUFFO2dCQUN4QixLQUFLLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUM7YUFDNUI7aUJBQU0sSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRTtnQkFDN0IsS0FBSyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDO2FBQzFCO1lBRUQsT0FBTyxLQUFLLElBQUksU0FBUyxDQUFDO1FBQzNCLENBQUM7UUFFUSxnQkFBZ0IsQ0FBQyxVQUFtQjtZQUM1QyxLQUFLLENBQUMsZ0JBQWdCLENBQUMsVUFBVSxDQUFDLENBQUM7WUFFbkMsSUFBSSxJQUFJLENBQUMsWUFBWSxFQUFFO2dCQUN0QixJQUFJLElBQUksQ0FBQyxZQUFZLENBQUMsV0FBVyxFQUFFO29CQUNsQyxJQUFJLENBQUMsWUFBWSxDQUFDLFdBQVcsQ0FBQyxPQUFPLEdBQUcsVUFBVSxDQUFDO2lCQUNuRDtxQkFBTTtvQkFDTixJQUFJLENBQUMsWUFBWSxDQUFDLFdBQVcsR0FBRyxFQUFFLE9BQU8sRUFBRSxVQUFVLEVBQUUsQ0FBQztpQkFDeEQ7YUFDRDtRQUNGLENBQUM7UUFFRCxJQUFJO1lBQ0gsSUFBSSxDQUFDLFlBQVksRUFBRSxJQUFJLEVBQUUsQ0FBQztRQUMzQixDQUFDO1FBRWtCLGFBQWE7WUFDL0IsTUFBTSxRQUFRLEdBQUcsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQztZQUN0QyxJQUFJLENBQUMsVUFBVSxFQUFFLFNBQVMsQ0FBQyxNQUFNLENBQUMsVUFBVSxFQUFFLFFBQVEsQ0FBQyxDQUFDO1lBQ3hELElBQUksQ0FBQyxPQUFPLEVBQUUsU0FBUyxDQUFDLE1BQU0sQ0FBQyxVQUFVLEVBQUUsUUFBUSxDQUFDLENBQUM7UUFDdEQsQ0FBQztLQUNEO0lBaklELGdFQWlJQztJQU9ELE1BQWEsZ0NBQWlDLFNBQVEsZ0NBQWM7UUFJbkUsWUFDQyxPQUFnQixFQUNoQixNQUFlLEVBQ2YsT0FBaUQsRUFDaEMsbUJBQXlDO1lBRTFELEtBQUssQ0FBQyxPQUFPLEVBQUUsTUFBTSxFQUFFLE9BQU8sQ0FBQyxDQUFDO1lBRmYsd0JBQW1CLEdBQW5CLG1CQUFtQixDQUFzQjtRQUczRCxDQUFDO1FBRVEsTUFBTSxDQUFDLFNBQXNCO1lBQ3JDLEtBQUssQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLENBQUM7WUFDeEIsSUFBSSxJQUFJLENBQUMsT0FBTyxFQUFFO2dCQUNqQixJQUFJLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsc0JBQXNCLENBQUMsQ0FBQztnQkFDbkQsTUFBTSxtQkFBbUIsR0FBRztvQkFDM0IsVUFBVSxFQUFFLEdBQUcsRUFBRTt3QkFDaEIsTUFBTSxlQUFlLEdBQThDLElBQUksQ0FBQyxPQUFRLENBQUMscUJBQXFCLENBQUM7d0JBQ3ZHLE9BQU8sS0FBSyxDQUFDLE9BQU8sQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBRSxlQUFtQyxDQUFDLFVBQVUsRUFBRSxDQUFDLENBQUMsbUNBQW1DO29CQUNqSixDQUFDO2lCQUNELENBQUM7Z0JBRUYsTUFBTSxvQkFBb0IsR0FBOEMsSUFBSSxDQUFDLE9BQVEsQ0FBQyxvQkFBb0IsSUFBSSxFQUFFLENBQUM7Z0JBQ2pILE1BQU0sU0FBUyxHQUFHLElBQUEsT0FBQyxFQUFDLG9DQUFvQyxFQUFFLENBQUMsSUFBQSxPQUFDLEVBQUMsS0FBSyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7Z0JBQy9FLFNBQVMsQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLFdBQVcsRUFBRSxvQkFBb0IsQ0FBQyxRQUFRLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQztnQkFDcEYsSUFBQSxZQUFNLEVBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxTQUFTLENBQUMsQ0FBQztnQkFFaEMsSUFBSSxDQUFDLDBCQUEwQixHQUFHLElBQUksMEJBQTBCLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLGdCQUFNLENBQUMsZ0JBQWdCLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQyxhQUFhLEVBQUUsaUJBQWlCLENBQUMsQ0FBQyxDQUFDLEVBQUUsbUJBQW1CLEVBQUUsSUFBSSxDQUFDLG1CQUFtQixFQUFFLEVBQUUsVUFBVSxFQUFFLENBQUMsVUFBVSxFQUFFLEdBQUcscUJBQVMsQ0FBQyxnQkFBZ0IsQ0FBQyxrQkFBTyxDQUFDLGNBQWMsQ0FBQyxFQUFFLEdBQUcsb0JBQW9CLENBQUMsRUFBRSxDQUFDLENBQUM7Z0JBQzVULElBQUksQ0FBQywwQkFBMEIsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO2dCQUVyRCxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUEsMkJBQXFCLEVBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxlQUFTLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQyxFQUFFO29CQUMxRSxNQUFNLEtBQUssR0FBRyxJQUFJLHFDQUFxQixDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUMzQyxJQUFJLE9BQU8sR0FBWSxLQUFLLENBQUM7b0JBQzdCLElBQUksSUFBSSxDQUFDLDBCQUEwQixFQUFFLFNBQVMsRUFBRSxJQUFJLEtBQUssQ0FBQyxNQUFNLDRCQUFtQixFQUFFO3dCQUNwRixPQUFPLEdBQUcsSUFBSSxDQUFDO3dCQUNmLElBQUksQ0FBQywwQkFBMEIsRUFBRSxJQUFJLEVBQUUsQ0FBQzt3QkFDeEMsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDO3FCQUNiO3lCQUFNLElBQUksSUFBSSxDQUFDLFNBQVMsRUFBRSxJQUFJLEtBQUssQ0FBQyxNQUFNLDZCQUFvQixFQUFFO3dCQUNoRSxPQUFPLEdBQUcsSUFBSSxDQUFDO3dCQUNmLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQzt3QkFDWixJQUFJLENBQUMsMEJBQTBCLEVBQUUsS0FBSyxFQUFFLENBQUM7cUJBQ3pDO29CQUNELElBQUksT0FBTyxFQUFFO3dCQUNaLEtBQUssQ0FBQyxjQUFjLEVBQUUsQ0FBQzt3QkFDdkIsS0FBSyxDQUFDLGVBQWUsRUFBRSxDQUFDO3FCQUN4QjtnQkFDRixDQUFDLENBQUMsQ0FBQyxDQUFDO2FBQ0o7UUFDRixDQUFDO1FBRVEsSUFBSTtZQUNaLEtBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQztZQUNiLElBQUksQ0FBQywwQkFBMEIsRUFBRSxJQUFJLEVBQUUsQ0FBQztRQUN6QyxDQUFDO1FBRVEsWUFBWSxDQUFDLFNBQWtCO1lBQ3ZDLEtBQUssQ0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDLENBQUM7WUFDOUIsSUFBSSxDQUFDLDBCQUEwQixFQUFFLFlBQVksQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUMxRCxDQUFDO0tBQ0Q7SUE3REQsNEVBNkRDIn0=