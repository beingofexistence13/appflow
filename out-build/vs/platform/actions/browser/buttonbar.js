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
define(["require", "exports", "vs/base/browser/ui/button/button", "vs/base/common/actions", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/themables", "vs/nls!vs/platform/actions/browser/buttonbar", "vs/platform/actions/common/actions", "vs/platform/contextkey/common/contextkey", "vs/platform/contextview/browser/contextView", "vs/platform/keybinding/common/keybinding", "vs/platform/telemetry/common/telemetry"], function (require, exports, button_1, actions_1, event_1, lifecycle_1, themables_1, nls_1, actions_2, contextkey_1, contextView_1, keybinding_1, telemetry_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$qqb = void 0;
    let $qqb = class $qqb extends button_1.$0Q {
        constructor(container, menuId, options, menuService, contextKeyService, contextMenuService, keybindingService, telemetryService) {
            super(container);
            this.f = new lifecycle_1.$jc();
            this.g = new event_1.$fd();
            this.onDidChangeMenuItems = this.g.event;
            const menu = menuService.createMenu(menuId, contextKeyService);
            this.f.add(menu);
            const actionRunner = this.f.add(new actions_1.$hi());
            if (options?.telemetrySource) {
                actionRunner.onDidRun(e => {
                    telemetryService.publicLog2('workbenchActionExecuted', { id: e.action.id, from: options.telemetrySource });
                }, undefined, this.f);
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
                    if (actionOrSubmenu instanceof actions_2.$Uu && actionOrSubmenu.actions.length > 0) {
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
                        btn.element.title = (0, nls_1.localize)(0, null, action.label, kb.getLabel());
                    }
                    else {
                        btn.element.title = action.label;
                    }
                    btn.onDidClick(async () => {
                        actionRunner.run(action);
                    });
                }
                this.g.fire(this);
            };
            this.f.add(menu.onDidChange(update));
            update();
        }
        dispose() {
            this.g.dispose();
            this.f.dispose();
            super.dispose();
        }
    };
    exports.$qqb = $qqb;
    exports.$qqb = $qqb = __decorate([
        __param(3, actions_2.$Su),
        __param(4, contextkey_1.$3i),
        __param(5, contextView_1.$WZ),
        __param(6, keybinding_1.$2D),
        __param(7, telemetry_1.$9k)
    ], $qqb);
});
//# sourceMappingURL=buttonbar.js.map