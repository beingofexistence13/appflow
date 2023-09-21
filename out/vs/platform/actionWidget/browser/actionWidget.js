var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/ui/actionbar/actionbar", "vs/base/common/lifecycle", "vs/nls", "vs/platform/actionWidget/browser/actionList", "vs/platform/actions/common/actions", "vs/platform/contextkey/common/contextkey", "vs/platform/contextview/browser/contextView", "vs/platform/instantiation/common/extensions", "vs/platform/instantiation/common/instantiation", "vs/platform/theme/common/colorRegistry", "vs/css!./actionWidget"], function (require, exports, dom, actionbar_1, lifecycle_1, nls_1, actionList_1, actions_1, contextkey_1, contextView_1, extensions_1, instantiation_1, colorRegistry_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.IActionWidgetService = void 0;
    (0, colorRegistry_1.registerColor)('actionBar.toggledBackground', { dark: colorRegistry_1.inputActiveOptionBackground, light: colorRegistry_1.inputActiveOptionBackground, hcDark: colorRegistry_1.inputActiveOptionBackground, hcLight: colorRegistry_1.inputActiveOptionBackground, }, (0, nls_1.localize)('actionBar.toggledBackground', 'Background color for toggled action items in action bar.'));
    const ActionWidgetContextKeys = {
        Visible: new contextkey_1.RawContextKey('codeActionMenuVisible', false, (0, nls_1.localize)('codeActionMenuVisible', "Whether the action widget list is visible"))
    };
    exports.IActionWidgetService = (0, instantiation_1.createDecorator)('actionWidgetService');
    let ActionWidgetService = class ActionWidgetService extends lifecycle_1.Disposable {
        get isVisible() {
            return ActionWidgetContextKeys.Visible.getValue(this._contextKeyService) || false;
        }
        constructor(_contextViewService, _contextKeyService, _instantiationService) {
            super();
            this._contextViewService = _contextViewService;
            this._contextKeyService = _contextKeyService;
            this._instantiationService = _instantiationService;
            this._list = this._register(new lifecycle_1.MutableDisposable());
        }
        show(user, supportsPreview, items, delegate, anchor, container, actionBarActions) {
            const visibleContext = ActionWidgetContextKeys.Visible.bindTo(this._contextKeyService);
            const list = this._instantiationService.createInstance(actionList_1.ActionList, user, supportsPreview, items, delegate);
            this._contextViewService.showContextView({
                getAnchor: () => anchor,
                render: (container) => {
                    visibleContext.set(true);
                    return this._renderWidget(container, list, actionBarActions ?? []);
                },
                onHide: (didCancel) => {
                    visibleContext.reset();
                    this._onWidgetClosed(didCancel);
                },
            }, container, false);
        }
        acceptSelected(preview) {
            this._list.value?.acceptSelected(preview);
        }
        focusPrevious() {
            this._list?.value?.focusPrevious();
        }
        focusNext() {
            this._list?.value?.focusNext();
        }
        hide() {
            this._list.value?.hide();
            this._list.clear();
        }
        clear() {
            this._list.clear();
        }
        _renderWidget(element, list, actionBarActions) {
            const widget = document.createElement('div');
            widget.classList.add('action-widget');
            element.appendChild(widget);
            this._list.value = list;
            if (this._list.value) {
                widget.appendChild(this._list.value.domNode);
            }
            else {
                throw new Error('List has no value');
            }
            const renderDisposables = new lifecycle_1.DisposableStore();
            // Invisible div to block mouse interaction in the rest of the UI
            const menuBlock = document.createElement('div');
            const block = element.appendChild(menuBlock);
            block.classList.add('context-view-block');
            renderDisposables.add(dom.addDisposableListener(block, dom.EventType.MOUSE_DOWN, e => e.stopPropagation()));
            // Invisible div to block mouse interaction with the menu
            const pointerBlockDiv = document.createElement('div');
            const pointerBlock = element.appendChild(pointerBlockDiv);
            pointerBlock.classList.add('context-view-pointerBlock');
            // Removes block on click INSIDE widget or ANY mouse movement
            renderDisposables.add(dom.addDisposableListener(pointerBlock, dom.EventType.POINTER_MOVE, () => pointerBlock.remove()));
            renderDisposables.add(dom.addDisposableListener(pointerBlock, dom.EventType.MOUSE_DOWN, () => pointerBlock.remove()));
            // Action bar
            let actionBarWidth = 0;
            if (actionBarActions.length) {
                const actionBar = this._createActionBar('.action-widget-action-bar', actionBarActions);
                if (actionBar) {
                    widget.appendChild(actionBar.getContainer().parentElement);
                    renderDisposables.add(actionBar);
                    actionBarWidth = actionBar.getContainer().offsetWidth;
                }
            }
            const width = this._list.value?.layout(actionBarWidth);
            widget.style.width = `${width}px`;
            const focusTracker = renderDisposables.add(dom.trackFocus(element));
            renderDisposables.add(focusTracker.onDidBlur(() => this.hide()));
            return renderDisposables;
        }
        _createActionBar(className, actions) {
            if (!actions.length) {
                return undefined;
            }
            const container = dom.$(className);
            const actionBar = new actionbar_1.ActionBar(container);
            actionBar.push(actions, { icon: false, label: true });
            return actionBar;
        }
        _onWidgetClosed(didCancel) {
            this._list.value?.hide(didCancel);
        }
    };
    ActionWidgetService = __decorate([
        __param(0, contextView_1.IContextViewService),
        __param(1, contextkey_1.IContextKeyService),
        __param(2, instantiation_1.IInstantiationService)
    ], ActionWidgetService);
    (0, extensions_1.registerSingleton)(exports.IActionWidgetService, ActionWidgetService, 1 /* InstantiationType.Delayed */);
    const weight = 100 /* KeybindingWeight.EditorContrib */ + 1000;
    (0, actions_1.registerAction2)(class extends actions_1.Action2 {
        constructor() {
            super({
                id: 'hideCodeActionWidget',
                title: {
                    value: (0, nls_1.localize)('hideCodeActionWidget.title', "Hide action widget"),
                    original: 'Hide action widget'
                },
                precondition: ActionWidgetContextKeys.Visible,
                keybinding: {
                    weight,
                    primary: 9 /* KeyCode.Escape */,
                    secondary: [1024 /* KeyMod.Shift */ | 9 /* KeyCode.Escape */]
                },
            });
        }
        run(accessor) {
            accessor.get(exports.IActionWidgetService).hide();
        }
    });
    (0, actions_1.registerAction2)(class extends actions_1.Action2 {
        constructor() {
            super({
                id: 'selectPrevCodeAction',
                title: {
                    value: (0, nls_1.localize)('selectPrevCodeAction.title', "Select previous action"),
                    original: 'Select previous action'
                },
                precondition: ActionWidgetContextKeys.Visible,
                keybinding: {
                    weight,
                    primary: 16 /* KeyCode.UpArrow */,
                    secondary: [2048 /* KeyMod.CtrlCmd */ | 16 /* KeyCode.UpArrow */],
                    mac: { primary: 16 /* KeyCode.UpArrow */, secondary: [2048 /* KeyMod.CtrlCmd */ | 16 /* KeyCode.UpArrow */, 256 /* KeyMod.WinCtrl */ | 46 /* KeyCode.KeyP */] },
                }
            });
        }
        run(accessor) {
            const widgetService = accessor.get(exports.IActionWidgetService);
            if (widgetService instanceof ActionWidgetService) {
                widgetService.focusPrevious();
            }
        }
    });
    (0, actions_1.registerAction2)(class extends actions_1.Action2 {
        constructor() {
            super({
                id: 'selectNextCodeAction',
                title: {
                    value: (0, nls_1.localize)('selectNextCodeAction.title', "Select next action"),
                    original: 'Select next action'
                },
                precondition: ActionWidgetContextKeys.Visible,
                keybinding: {
                    weight,
                    primary: 18 /* KeyCode.DownArrow */,
                    secondary: [2048 /* KeyMod.CtrlCmd */ | 18 /* KeyCode.DownArrow */],
                    mac: { primary: 18 /* KeyCode.DownArrow */, secondary: [2048 /* KeyMod.CtrlCmd */ | 18 /* KeyCode.DownArrow */, 256 /* KeyMod.WinCtrl */ | 44 /* KeyCode.KeyN */] }
                }
            });
        }
        run(accessor) {
            const widgetService = accessor.get(exports.IActionWidgetService);
            if (widgetService instanceof ActionWidgetService) {
                widgetService.focusNext();
            }
        }
    });
    (0, actions_1.registerAction2)(class extends actions_1.Action2 {
        constructor() {
            super({
                id: actionList_1.acceptSelectedActionCommand,
                title: {
                    value: (0, nls_1.localize)('acceptSelected.title', "Accept selected action"),
                    original: 'Accept selected action'
                },
                precondition: ActionWidgetContextKeys.Visible,
                keybinding: {
                    weight,
                    primary: 3 /* KeyCode.Enter */,
                    secondary: [2048 /* KeyMod.CtrlCmd */ | 89 /* KeyCode.Period */],
                }
            });
        }
        run(accessor) {
            const widgetService = accessor.get(exports.IActionWidgetService);
            if (widgetService instanceof ActionWidgetService) {
                widgetService.acceptSelected();
            }
        }
    });
    (0, actions_1.registerAction2)(class extends actions_1.Action2 {
        constructor() {
            super({
                id: actionList_1.previewSelectedActionCommand,
                title: {
                    value: (0, nls_1.localize)('previewSelected.title', "Preview selected action"),
                    original: 'Preview selected action'
                },
                precondition: ActionWidgetContextKeys.Visible,
                keybinding: {
                    weight,
                    primary: 2048 /* KeyMod.CtrlCmd */ | 3 /* KeyCode.Enter */,
                }
            });
        }
        run(accessor) {
            const widgetService = accessor.get(exports.IActionWidgetService);
            if (widgetService instanceof ActionWidgetService) {
                widgetService.acceptSelected(true);
            }
        }
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWN0aW9uV2lkZ2V0LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvcGxhdGZvcm0vYWN0aW9uV2lkZ2V0L2Jyb3dzZXIvYWN0aW9uV2lkZ2V0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7SUFxQkEsSUFBQSw2QkFBYSxFQUNaLDZCQUE2QixFQUM3QixFQUFFLElBQUksRUFBRSwyQ0FBMkIsRUFBRSxLQUFLLEVBQUUsMkNBQTJCLEVBQUUsTUFBTSxFQUFFLDJDQUEyQixFQUFFLE9BQU8sRUFBRSwyQ0FBMkIsR0FBRyxFQUNySixJQUFBLGNBQVEsRUFBQyw2QkFBNkIsRUFBRSwwREFBMEQsQ0FBQyxDQUNuRyxDQUFDO0lBRUYsTUFBTSx1QkFBdUIsR0FBRztRQUMvQixPQUFPLEVBQUUsSUFBSSwwQkFBYSxDQUFVLHVCQUF1QixFQUFFLEtBQUssRUFBRSxJQUFBLGNBQVEsRUFBQyx1QkFBdUIsRUFBRSwyQ0FBMkMsQ0FBQyxDQUFDO0tBQ25KLENBQUM7SUFFVyxRQUFBLG9CQUFvQixHQUFHLElBQUEsK0JBQWUsRUFBdUIscUJBQXFCLENBQUMsQ0FBQztJQVlqRyxJQUFNLG1CQUFtQixHQUF6QixNQUFNLG1CQUFvQixTQUFRLHNCQUFVO1FBRzNDLElBQUksU0FBUztZQUNaLE9BQU8sdUJBQXVCLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsSUFBSSxLQUFLLENBQUM7UUFDbkYsQ0FBQztRQUlELFlBQ3NCLG1CQUF5RCxFQUMxRCxrQkFBdUQsRUFDcEQscUJBQTZEO1lBRXBGLEtBQUssRUFBRSxDQUFDO1lBSjhCLHdCQUFtQixHQUFuQixtQkFBbUIsQ0FBcUI7WUFDekMsdUJBQWtCLEdBQWxCLGtCQUFrQixDQUFvQjtZQUNuQywwQkFBcUIsR0FBckIscUJBQXFCLENBQXVCO1lBTHBFLFVBQUssR0FBRyxJQUFJLENBQUMsU0FBUyxD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