/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", "vs/base/common/async", "vs/base/browser/dom", "vs/platform/contextview/browser/contextView", "vs/base/common/lifecycle", "vs/platform/theme/common/colorRegistry", "vs/nls", "vs/platform/instantiation/common/instantiation", "vs/platform/history/browser/contextScopedHistoryWidget", "vs/platform/contextkey/common/contextkey", "vs/base/common/codicons", "vs/platform/keybinding/common/keybinding", "vs/platform/history/browser/historyWidgetKeybindingHint", "vs/platform/actions/common/actions", "vs/platform/actions/browser/toolbar", "vs/platform/actions/browser/menuEntryActionViewItem", "vs/base/browser/ui/widget", "vs/base/common/event", "vs/platform/theme/browser/defaultStyles"], function (require, exports, async_1, DOM, contextView_1, lifecycle_1, colorRegistry_1, nls_1, instantiation_1, contextScopedHistoryWidget_1, contextkey_1, codicons_1, keybinding_1, historyWidgetKeybindingHint_1, actions_1, toolbar_1, menuEntryActionViewItem_1, widget_1, event_1, defaultStyles_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.FilterWidget = exports.viewFilterSubmenu = void 0;
    const viewFilterMenu = new actions_1.MenuId('menu.view.filter');
    exports.viewFilterSubmenu = new actions_1.MenuId('submenu.view.filter');
    actions_1.MenuRegistry.appendMenuItem(viewFilterMenu, {
        submenu: exports.viewFilterSubmenu,
        title: (0, nls_1.localize)('more filters', "More Filters..."),
        group: 'navigation',
        icon: codicons_1.Codicon.filter,
    });
    class MoreFiltersActionViewItem extends menuEntryActionViewItem_1.SubmenuEntryActionViewItem {
        constructor() {
            super(...arguments);
            this._checked = false;
        }
        set checked(checked) {
            if (this._checked !== checked) {
                this._checked = checked;
                this.updateChecked();
            }
        }
        updateChecked() {
            if (this.element) {
                this.element.classList.toggle('checked', this._checked);
            }
        }
        render(container) {
            super.render(container);
            this.updateChecked();
        }
    }
    let FilterWidget = class FilterWidget extends widget_1.Widget {
        get onDidFocus() { return this.focusTracker.onDidFocus; }
        get onDidBlur() { return this.focusTracker.onDidBlur; }
        constructor(options, instantiationService, contextViewService, contextKeyService, keybindingService) {
            super();
            this.options = options;
            this.instantiationService = instantiationService;
            this.contextViewService = contextViewService;
            this.keybindingService = keybindingService;
            this._onDidChangeFilterText = this._register(new event_1.Emitter());
            this.onDidChangeFilterText = this._onDidChangeFilterText.event;
            this.isMoreFiltersChecked = false;
            this.delayedFilterUpdate = new async_1.Delayer(400);
            this._register((0, lifecycle_1.toDisposable)(() => this.delayedFilterUpdate.cancel()));
            if (options.focusContextKey) {
                this.focusContextKey = new contextkey_1.RawContextKey(options.focusContextKey, false).bindTo(contextKeyService);
            }
            this.element = DOM.$('.viewpane-filter');
            [this.filterInputBox, this.focusTracker] = this.createInput(this.element);
            this._register(this.filterInputBox);
            this._register(this.focusTracker);
            const controlsContainer = DOM.append(this.element, DOM.$('.viewpane-filter-controls'));
            this.filterBadge = this.createBadge(controlsContainer);
            this.toolbar = this._register(this.createToolBar(controlsContainer));
            this.adjustInputBox();
        }
        hasFocus() {
            return this.filterInputBox.hasFocus();
        }
        focus() {
            this.filterInputBox.focus();
        }
        blur() {
            this.filterInputBox.blur();
        }
        updateBadge(message) {
            this.filterBadge.classList.toggle('hidden', !message);
            this.filterBadge.textContent = message || '';
            this.adjustInputBox();
        }
        setFilterText(filterText) {
            this.filterInputBox.value = filterText;
        }
        getFilterText() {
            return this.filterInputBox.value;
        }
        getHistory() {
            return this.filterInputBox.getHistory();
        }
        layout(width) {
            this.element.parentElement?.classList.toggle('grow', width > 700);
            this.element.classList.toggle('small', width < 400);
            this.adjustInputBox();
        }
        checkMoreFilters(checked) {
            this.isMoreFiltersChecked = checked;
            if (this.moreFiltersActionViewItem) {
                this.moreFiltersActionViewItem.checked = checked;
            }
        }
        createInput(container) {
            const inputBox = this._register(this.instantiationService.createInstance(contextScopedHistoryWidget_1.ContextScopedHistoryInputBox, container, this.contextViewService, {
                placeholder: this.options.placeholder,
                ariaLabel: this.options.ariaLabel,
                history: this.options.history || [],
                showHistoryHint: () => (0, historyWidgetKeybindingHint_1.showHistoryKeybindingHint)(this.keybindingService),
                inputBoxStyles: defaultStyles_1.defaultInputBoxStyles
            }));
            if (this.options.text) {
                inputBox.value = this.options.text;
            }
            this._register(inputBox.onDidChange(filter => this.delayedFilterUpdate.trigger(() => this.onDidInputChange(inputBox))));
            this._register(DOM.addStandardDisposableListener(inputBox.inputElement, DOM.EventType.KEY_DOWN, (e) => this.onInputKeyDown(e, inputBox)));
            this._register(DOM.addStandardDisposableListener(container, DOM.EventType.KEY_DOWN, this.handleKeyboardEvent));
            this._register(DOM.addStandardDisposableListener(container, DOM.EventType.KEY_UP, this.handleKeyboardEvent));
            this._register(DOM.addStandardDisposableListener(inputBox.inputElement, DOM.EventType.CLICK, (e) => {
                e.stopPropagation();
                e.preventDefault();
            }));
            const focusTracker = this._register(DOM.trackFocus(inputBox.inputElement));
            if (this.focusContextKey) {
                this._register(focusTracker.onDidFocus(() => this.focusContextKey.set(true)));
                this._register(focusTracker.onDidBlur(() => this.focusContextKey.set(false)));
                this._register((0, lifecycle_1.toDisposable)(() => this.focusContextKey.reset()));
            }
            return [inputBox, focusTracker];
        }
        createBadge(container) {
            const filterBadge = DOM.append(container, DOM.$('.viewpane-filter-badge.hidden'));
            filterBadge.style.backgroundColor = (0, colorRegistry_1.asCssVariable)(colorRegistry_1.badgeBackground);
            filterBadge.style.color = (0, colorRegistry_1.asCssVariable)(colorRegistry_1.badgeForeground);
            filterBadge.style.border = `1px solid ${(0, colorRegistry_1.asCssVariable)(colorRegistry_1.contrastBorder)}`;
            return filterBadge;
        }
        createToolBar(container) {
            return this.instantiationService.createInstance(toolbar_1.MenuWorkbenchToolBar, container, viewFilterMenu, {
                hiddenItemStrategy: -1 /* HiddenItemStrategy.NoHide */,
                actionViewItemProvider: (action) => {
                    if (action instanceof actions_1.SubmenuItemAction && action.item.submenu.id === exports.viewFilterSubmenu.id) {
                        this.moreFiltersActionViewItem = this.instantiationService.createInstance(MoreFiltersActionViewItem, action, undefined);
                        this.moreFiltersActionViewItem.checked = this.isMoreFiltersChecked;
                        return this.moreFiltersActionViewItem;
                    }
                    return undefined;
                }
            });
        }
        onDidInputChange(inputbox) {
            inputbox.addToHistory();
            this._onDidChangeFilterText.fire(inputbox.value);
        }
        adjustInputBox() {
            this.filterInputBox.inputElement.style.paddingRight = this.element.classList.contains('small') || this.filterBadge.classList.contains('hidden') ? '25px' : '150px';
        }
        // Action toolbar is swallowing some keys for action items which should not be for an input box
        handleKeyboardEvent(event) {
            if (event.equals(10 /* KeyCode.Space */)
                || event.equals(15 /* KeyCode.LeftArrow */)
                || event.equals(17 /* KeyCode.RightArrow */)) {
                event.stopPropagation();
            }
        }
        onInputKeyDown(event, filterInputBox) {
            let handled = false;
            if (event.equals(2 /* KeyCode.Tab */) && !this.toolbar.isEmpty()) {
                this.toolbar.focus();
                handled = true;
            }
            if (handled) {
                event.stopPropagation();
                event.preventDefault();
            }
        }
    };
    exports.FilterWidget = FilterWidget;
    exports.FilterWidget = FilterWidget = __decorate([
        __param(1, instantiation_1.IInstantiationService),
        __param(2, contextView_1.IContextViewService),
        __param(3, contextkey_1.IContextKeyService),
        __param(4, keybinding_1.IKeybindingService)
    ], FilterWidget);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmlld0ZpbHRlci5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9icm93c2VyL3BhcnRzL3ZpZXdzL3ZpZXdGaWx0ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBeUJoRyxNQUFNLGNBQWMsR0FBRyxJQUFJLGdCQUFNLENBQUMsa0JBQWtCLENBQUMsQ0FBQztJQUN6QyxRQUFBLGlCQUFpQixHQUFHLElBQUksZ0JBQU0sQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDO0lBQ25FLHNCQUFZLENBQUMsY0FBYyxDQUFDLGNBQWMsRUFBRTtRQUMzQyxPQUFPLEVBQUUseUJBQWlCO1FBQzFCLEtBQUssRUFBRSxJQUFBLGNBQVEsRUFBQyxjQUFjLEVBQUUsaUJBQWlCLENBQUM7UUFDbEQsS0FBSyxFQUFFLFlBQVk7UUFDbkIsSUFBSSxFQUFFLGtCQUFPLENBQUMsTUFBTTtLQUNwQixDQUFDLENBQUM7SUFFSCxNQUFNLHlCQUEwQixTQUFRLG9EQUEwQjtRQUFsRTs7WUFFUyxhQUFRLEdBQVksS0FBSyxDQUFDO1FBbUJuQyxDQUFDO1FBbEJBLElBQUksT0FBTyxDQUFDLE9BQWdCO1lBQzNCLElBQUksSUFBSSxDQUFDLFFBQVEsS0FBSyxPQUFPLEVBQUU7Z0JBQzlCLElBQUksQ0FBQyxRQUFRLEdBQUcsT0FBTyxDQUFDO2dCQUN4QixJQUFJLENBQUMsYUFBYSxFQUFFLENBQUM7YUFDckI7UUFDRixDQUFDO1FBRWtCLGFBQWE7WUFDL0IsSUFBSSxJQUFJLENBQUMsT0FBTyxFQUFFO2dCQUNqQixJQUFJLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQzthQUN4RDtRQUNGLENBQUM7UUFFUSxNQUFNLENBQUMsU0FBc0I7WUFDckMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxT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