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
define(["require", "exports", "vs/base/browser/ui/button/button", "vs/base/common/actions", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/themables", "vs/nls", "vs/platform/actions/common/actions", "vs/platform/contextkey/common/contextkey", "vs/platform/contextview/browser/contextView", "vs/platform/keybinding/common/keybinding", "vs/platform/telemetry/common/telemetry"], function (require, exports, button_1, actions_1, event_1, lifecycle_1, themables_1, nls_1, actions_2, contextkey_1, contextView_1, keybinding_1, telemetry_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MenuWorkbenchButtonBar = void 0;
    let MenuWorkbenchButtonBar = class MenuWorkbenchButtonBar extends button_1.ButtonBar {
        constructor(container, menuId, options, menuService, contextKeyService, contextMenuService, keybindingService, telemetryService) {
            super(container);
            this._store = new lifecycle_1.DisposableStore();
            this._onDidChangeMenuItems = new event_1.Emitter();
            this.onDidChangeMenuItems = this._onDidChangeMenuItems.event;
            const menu = menuService.createMenu(menuId, contextKeyService);
            this._store.add(menu);
            const actionRunner = this._store.add(new actions_1.ActionRunner());
            if (options?.telemetrySource) {
                actionRunner.onDidRun(e => {
                    telemetryService.publicLog2('workbenchActionExecuted', { id: e.action.id, from: options.telemetrySource });
                }, undefined, this._store);
            }
            const conifgProvider = options?.buttonConfigProvider ?? (() => ({ showLabel: true }));
            const update = () => {
                this.clear();
                const actions = menu
                    .getActions({ renderShortTitle: true })
                    .flatMap(entry => entry[1]);
                for (let i = 0; i < actions.length; i++) {
                    const secondary = i > 0;
                    const actionOrSubmenu = actions[i];
                    let action;
                    let btn;
                    if (actionOrSubmenu instanceof actions_2.SubmenuItemAction && actionOrSubmenu.actions.length > 0) {
                        const [first, ...rest] = actionOrSubmenu.actions;
                        action = first;
                        btn = this.addButtonWithDropdown({
                            secondary: conifgProvider(action)?.isSecondary ?? secondary,
                            actionRunner,
                            actions: rest,
                            contextMenuProvider: contextMenuService,
                        });
                    }
                    else {
                        action = actionOrSubmenu;
                        btn = this.addButton({
                            secondary: conifgProvider(action)?.isSecondary ?? secondary,
                        });
                    }
                    btn.enabled = action.enabled;
                    btn.element.classList.add('default-colors');
                    if (conifgProvider(action)?.showLabel ?? true) {
                        btn.label = action.label;
                    }
                    else {
                        btn.element.classList.add('monaco-text-button');
                    }
                    if (conifgProvider(action)?.showIcon && themables_1.ThemeIcon.isThemeIcon(action.item.icon)) {
                        btn.icon = action.item.icon;
                    }
                    const kb = keybindingService.lookupKeybinding(action.id);
                    if (kb) {
                        btn.element.title = (0, nls_1.localize)('labelWithKeybinding', "{0} ({1})", action.label, kb.getLabel());
                    }
                    else {
                        btn.element.title = action.label;
                    }
                    btn.onDidClick(async () => {
                        actionRunner.run(action);
                    });
                }
                this._onDidChangeMenuItems.fire(this);
            };
            this._store.add(menu.onDidChange(update));
            update();
        }
        dispose() {
            this._onDidChangeMenuItems.dispose();
            this._store.dispose();
            super.dispose();
        }
    };
    exports.MenuWorkbenchButtonBar = MenuWorkbenchButtonBar;
    exports.MenuWorkbenchButtonBar = MenuWorkbenchButtonBar = __decorate([
        __param(3, actions_2.IMenuService),
        __param(4, contextkey_1.IContextKeyService),
        __param(5, contextView_1.IContextMenuService),
        __param(6, keybinding_1.IKeybindingService),
        __param(7, telemetry_1.ITelemetryService)
    ], MenuWorkbenchButtonBar);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnV0dG9uYmFyLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvcGxhdGZvcm0vYWN0aW9ucy9icm93c2VyL2J1dHRvbmJhci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUF5QnpGLElBQU0sc0JBQXNCLEdBQTVCLE1BQU0sc0JBQXVCLFNBQVEsa0JBQVM7UUFPcEQsWUFDQyxTQUFzQixFQUN0QixNQUFjLEVBQ2QsT0FBbUQsRUFDckMsV0FBeUIsRUFDbkIsaUJBQXFDLEVBQ3BDLGtCQUF1QyxFQUN4QyxpQkFBcUMsRUFDdEMsZ0JBQW1DO1lBRXRELEtBQUssQ0FBQyxTQUFTLENBQUMsQ0FBQztZQWZELFdBQU0sR0FBRyxJQUFJLDJCQUFlLEVBQUUsQ0FBQztZQUUvQiwwQkFBcUIsR0FBRyxJQUFJLGVBQU8sRUFBUSxDQUFDO1lBQ3BELHlCQUFvQixHQUFnQixJQUFJLENBQUMscUJBQXFCLENBQUMsS0FBSyxDQUFDO1lBYzdFLE1BQU0sSUFBSSxHQUFHLFdBQVcsQ0FBQyxVQUFVLENBQUMsTUFBTSxFQUFFLGlCQUFpQixDQUFDLENBQUM7WUFDL0QsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7WUFFdEIsTUFBTSxZQUFZLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsSUFBSSxzQkFBWSxFQUFFLENBQUMsQ0FBQztZQUN6RCxJQUFJLE9BQU8sRUFBRSxlQUFlLEVBQUU7Z0JBQzdCLFlBQVksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLEVBQUU7b0JBQ3pCLGdCQUFnQixDQUFDLFVBQVUsQ0FDMUIseUJBQXlCLEVBQ3pCLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQyxNQUFNLENBQUMsRUFBRSxFQUFFLElBQUksRUFBRSxPQUFPLENBQUMsZUFBZ0IsRUFBRSxDQUNuRCxDQUFDO2dCQUNILENB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