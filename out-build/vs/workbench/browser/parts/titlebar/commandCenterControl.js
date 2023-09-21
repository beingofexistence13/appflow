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
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/ui/actionbar/actionViewItems", "vs/base/browser/ui/iconLabel/iconLabelHover", "vs/base/common/actions", "vs/base/common/codicons", "vs/base/common/event", "vs/base/common/lifecycle", "vs/nls!vs/workbench/browser/parts/titlebar/commandCenterControl", "vs/platform/actions/browser/menuEntryActionViewItem", "vs/platform/actions/browser/toolbar", "vs/platform/actions/common/actions", "vs/platform/instantiation/common/instantiation", "vs/platform/keybinding/common/keybinding", "vs/platform/quickinput/common/quickInput"], function (require, exports, dom_1, actionViewItems_1, iconLabelHover_1, actions_1, codicons_1, event_1, lifecycle_1, nls_1, menuEntryActionViewItem_1, toolbar_1, actions_2, instantiation_1, keybinding_1, quickInput_1) {
    "use strict";
    var CommandCenterCenterViewItem_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$O4b = void 0;
    let $O4b = class $O4b {
        constructor(windowTitle, hoverDelegate, instantiationService, quickInputService, keybindingService) {
            this.a = new lifecycle_1.$jc();
            this.b = new event_1.$fd();
            this.onDidChangeVisibility = this.b.event;
            this.element = document.createElement('div');
            this.element.classList.add('command-center');
            const titleToolbar = instantiationService.createInstance(toolbar_1.$M6, this.element, actions_2.$Ru.CommandCenter, {
                contextMenu: actions_2.$Ru.TitleBarContext,
                hiddenItemStrategy: 0 /* HiddenItemStrategy.Ignore */,
                toolbarOptions: {
                    primaryGroup: () => true,
                },
                telemetrySource: 'commandCenter',
                actionViewItemProvider: (action) => {
                    if (action instanceof actions_2.$Uu && action.item.submenu === actions_2.$Ru.CommandCenterCenter) {
                        return instantiationService.createInstance(CommandCenterCenterViewItem, action, windowTitle, hoverDelegate, {});
                    }
                    else {
                        return (0, menuEntryActionViewItem_1.$F3)(instantiationService, action, { hoverDelegate });
                    }
                }
            });
            this.a.add(quickInputService.onShow(this.c.bind(this, false)));
            this.a.add(quickInputService.onHide(this.c.bind(this, true)));
            this.a.add(titleToolbar);
        }
        c(show) {
            this.element.classList.toggle('hide', !show);
            this.b.fire();
        }
        dispose() {
            this.a.dispose();
        }
    };
    exports.$O4b = $O4b;
    exports.$O4b = $O4b = __decorate([
        __param(2, instantiation_1.$Ah),
        __param(3, quickInput_1.$Gq),
        __param(4, keybinding_1.$2D)
    ], $O4b);
    let CommandCenterCenterViewItem = class CommandCenterCenterViewItem extends actionViewItems_1.$MQ {
        static { CommandCenterCenterViewItem_1 = this; }
        static { this.a = 'workbench.action.quickOpenWithModes'; }
        constructor(b, c, g, options, h, n) {
            super(undefined, b.actions[0], options);
            this.b = b;
            this.c = c;
            this.g = g;
            this.h = h;
            this.n = n;
        }
        render(container) {
            super.render(container);
            container.classList.add('command-center-center');
            container.classList.toggle('multiple', (this.b.actions.length > 1));
            const hover = this.q.add((0, iconLabelHover_1.$ZP)(this.g, container, this.z()));
            // update label & tooltip when window title changes
            this.q.add(this.c.onDidChange(() => {
                hover.update(this.z());
            }));
            const groups = [];
            for (const action of this.b.actions) {
                if (action instanceof actions_1.$ji) {
                    groups.push(action.actions);
                }
                else {
                    groups.push([action]);
                }
            }
            for (let i = 0; i < groups.length; i++) {
                const group = groups[i];
                // nested toolbar
                const toolbar = this.n.createInstance(toolbar_1.$L6, container, {
                    hiddenItemStrategy: -1 /* HiddenItemStrategy.NoHide */,
                    telemetrySource: 'commandCenterCenter',
                    actionViewItemProvider: (action, options) => {
                        options = {
                            ...options,
                            hoverDelegate: this.g,
                        };
                        if (action.id !== CommandCenterCenterViewItem_1.a) {
                            return (0, menuEntryActionViewItem_1.$F3)(this.n, action, options);
                        }
                        const that = this;
                        return this.n.createInstance(class CommandCenterQuickPickItem extends actionViewItems_1.$MQ {
                            constructor() {
                                super(undefined, action, options);
                            }
                            render(container) {
                                super.render(container);
                                container.classList.toggle('command-center-quick-pick');
                                const action = this.action;
                                // icon (search)
                                const searchIcon = document.createElement('span');
                                searchIcon.className = action.class ?? '';
                                searchIcon.classList.add('search-icon');
                                // label: just workspace name and optional decorations
                                const label = this.b();
                                const labelElement = document.createElement('span');
                                labelElement.classList.add('search-label');
                                labelElement.innerText = label;
                                (0, dom_1.$_O)(container, searchIcon, labelElement);
                                const hover = this.q.add((0, iconLabelHover_1.$ZP)(that.g, container, this.z()));
                                // update label & tooltip when window title changes
                                this.q.add(that.c.onDidChange(() => {
                                    hover.update(this.z());
                                    labelElement.innerText = this.b();
                                }));
                            }
                            z() {
                                return that.z();
                            }
                            b() {
                                const { prefix, suffix } = that.c.getTitleDecorations();
                                let label = that.c.isCustomTitleFormat() ? that.c.getWindowTitle() : that.c.workspaceName;
                                if (!label) {
                                    label = (0, nls_1.localize)(0, null);
                                }
                                if (prefix) {
                                    label = (0, nls_1.localize)(1, null, prefix, label);
                                }
                                if (suffix) {
                                    label = (0, nls_1.localize)(2, null, label, suffix);
                                }
                                return label;
                            }
                        });
                    }
                });
                toolbar.setActions(group);
                this.q.add(toolbar);
            }
        }
        z() {
            // tooltip: full windowTitle
            const kb = this.h.lookupKeybinding(this.action.id)?.getLabel();
            const title = kb
                ? (0, nls_1.localize)(3, null, this.c.workspaceName, kb, this.c.value)
                : (0, nls_1.localize)(4, null, this.c.workspaceName, this.c.value);
            return title;
        }
    };
    CommandCenterCenterViewItem = CommandCenterCenterViewItem_1 = __decorate([
        __param(4, keybinding_1.$2D),
        __param(5, instantiation_1.$Ah)
    ], CommandCenterCenterViewItem);
    actions_2.$Tu.appendMenuItem(actions_2.$Ru.CommandCenter, {
        submenu: actions_2.$Ru.CommandCenterCenter,
        title: (0, nls_1.localize)(5, null),
        icon: codicons_1.$Pj.shield,
        order: 101,
    });
});
//# sourceMappingURL=commandCenterControl.js.map