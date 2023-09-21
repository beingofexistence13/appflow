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
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/ui/actionbar/actionViewItems", "vs/base/browser/ui/iconLabel/iconLabelHover", "vs/base/common/actions", "vs/base/common/codicons", "vs/base/common/event", "vs/base/common/lifecycle", "vs/nls", "vs/platform/actions/browser/menuEntryActionViewItem", "vs/platform/actions/browser/toolbar", "vs/platform/actions/common/actions", "vs/platform/instantiation/common/instantiation", "vs/platform/keybinding/common/keybinding", "vs/platform/quickinput/common/quickInput"], function (require, exports, dom_1, actionViewItems_1, iconLabelHover_1, actions_1, codicons_1, event_1, lifecycle_1, nls_1, menuEntryActionViewItem_1, toolbar_1, actions_2, instantiation_1, keybinding_1, quickInput_1) {
    "use strict";
    var CommandCenterCenterViewItem_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CommandCenterControl = void 0;
    let CommandCenterControl = class CommandCenterControl {
        constructor(windowTitle, hoverDelegate, instantiationService, quickInputService, keybindingService) {
            this._disposables = new lifecycle_1.DisposableStore();
            this._onDidChangeVisibility = new event_1.Emitter();
            this.onDidChangeVisibility = this._onDidChangeVisibility.event;
            this.element = document.createElement('div');
            this.element.classList.add('command-center');
            const titleToolbar = instantiationService.createInstance(toolbar_1.MenuWorkbenchToolBar, this.element, actions_2.MenuId.CommandCenter, {
                contextMenu: actions_2.MenuId.TitleBarContext,
                hiddenItemStrategy: 0 /* HiddenItemStrategy.Ignore */,
                toolbarOptions: {
                    primaryGroup: () => true,
                },
                telemetrySource: 'commandCenter',
                actionViewItemProvider: (action) => {
                    if (action instanceof actions_2.SubmenuItemAction && action.item.submenu === actions_2.MenuId.CommandCenterCenter) {
                        return instantiationService.createInstance(CommandCenterCenterViewItem, action, windowTitle, hoverDelegate, {});
                    }
                    else {
                        return (0, menuEntryActionViewItem_1.createActionViewItem)(instantiationService, action, { hoverDelegate });
                    }
                }
            });
            this._disposables.add(quickInputService.onShow(this._setVisibility.bind(this, false)));
            this._disposables.add(quickInputService.onHide(this._setVisibility.bind(this, true)));
            this._disposables.add(titleToolbar);
        }
        _setVisibility(show) {
            this.element.classList.toggle('hide', !show);
            this._onDidChangeVisibility.fire();
        }
        dispose() {
            this._disposables.dispose();
        }
    };
    exports.CommandCenterControl = CommandCenterControl;
    exports.CommandCenterControl = CommandCenterControl = __decorate([
        __param(2, instantiation_1.IInstantiationService),
        __param(3, quickInput_1.IQuickInputService),
        __param(4, keybinding_1.IKeybindingService)
    ], CommandCenterControl);
    let CommandCenterCenterViewItem = class CommandCenterCenterViewItem extends actionViewItems_1.BaseActionViewItem {
        static { CommandCenterCenterViewItem_1 = this; }
        static { this._quickOpenCommandId = 'workbench.action.quickOpenWithModes'; }
        constructor(_submenu, _windowTitle, _hoverDelegate, options, _keybindingService, _instaService) {
            super(undefined, _submenu.actions[0], options);
            this._submenu = _submenu;
            this._windowTitle = _windowTitle;
            this._hoverDelegate = _hoverDelegate;
            this._keybindingService = _keybindingService;
            this._instaService = _instaService;
        }
        render(container) {
            super.render(container);
            container.classList.add('command-center-center');
            container.classList.toggle('multiple', (this._submenu.actions.length > 1));
            const hover = this._store.add((0, iconLabelHover_1.setupCustomHover)(this._hoverDelegate, container, this.getTooltip()));
            // update label & tooltip when window title changes
            this._store.add(this._windowTitle.onDidChange(() => {
                hover.update(this.getTooltip());
            }));
            const groups = [];
            for (const action of this._submenu.actions) {
                if (action instanceof actions_1.SubmenuAction) {
                    groups.push(action.actions);
                }
                else {
                    groups.push([action]);
                }
            }
            for (let i = 0; i < groups.length; i++) {
                const group = groups[i];
                // nested toolbar
                const toolbar = this._instaService.createInstance(toolbar_1.WorkbenchToolBar, container, {
                    hiddenItemStrategy: -1 /* HiddenItemStrategy.NoHide */,
                    telemetrySource: 'commandCenterCenter',
                    actionViewItemProvider: (action, options) => {
                        options = {
                            ...options,
                            hoverDelegate: this._hoverDelegate,
                        };
                        if (action.id !== CommandCenterCenterViewItem_1._quickOpenCommandId) {
                            return (0, menuEntryActionViewItem_1.createActionViewItem)(this._instaService, action, options);
                        }
                        const that = this;
                        return this._instaService.createInstance(class CommandCenterQuickPickItem extends actionViewItems_1.BaseActionViewItem {
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
                                const label = this._getLabel();
                                const labelElement = document.createElement('span');
                                labelElement.classList.add('search-label');
                                labelElement.innerText = label;
                                (0, dom_1.reset)(container, searchIcon, labelElement);
                                const hover = this._store.add((0, iconLabelHover_1.setupCustomHover)(that._hoverDelegate, container, this.getTooltip()));
                                // update label & tooltip when window title changes
                                this._store.add(that._windowTitle.onDidChange(() => {
                                    hover.update(this.getTooltip());
                                    labelElement.innerText = this._getLabel();
                                }));
                            }
                            getTooltip() {
                                return that.getTooltip();
                            }
                            _getLabel() {
                                const { prefix, suffix } = that._windowTitle.getTitleDecorations();
                                let label = that._windowTitle.isCustomTitleFormat() ? that._windowTitle.getWindowTitle() : that._windowTitle.workspaceName;
                                if (!label) {
                                    label = (0, nls_1.localize)('label.dfl', "Search");
                                }
                                if (prefix) {
                                    label = (0, nls_1.localize)('label1', "{0} {1}", prefix, label);
                                }
                                if (suffix) {
                                    label = (0, nls_1.localize)('label2', "{0} {1}", label, suffix);
                                }
                                return label;
                            }
                        });
                    }
                });
                toolbar.setActions(group);
                this._store.add(toolbar);
            }
        }
        getTooltip() {
            // tooltip: full windowTitle
            const kb = this._keybindingService.lookupKeybinding(this.action.id)?.getLabel();
            const title = kb
                ? (0, nls_1.localize)('title', "Search {0} ({1}) \u2014 {2}", this._windowTitle.workspaceName, kb, this._windowTitle.value)
                : (0, nls_1.localize)('title2', "Search {0} \u2014 {1}", this._windowTitle.workspaceName, this._windowTitle.value);
            return title;
        }
    };
    CommandCenterCenterViewItem = CommandCenterCenterViewItem_1 = __decorate([
        __param(4, keybinding_1.IKeybindingService),
        __param(5, instantiation_1.IInstantiationService)
    ], CommandCenterCenterViewItem);
    actions_2.MenuRegistry.appendMenuItem(actions_2.MenuId.CommandCenter, {
        submenu: actions_2.MenuId.CommandCenterCenter,
        title: (0, nls_1.localize)('title3', "Command Center"),
        icon: codicons_1.Codicon.shield,
        order: 101,
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tbWFuZENlbnRlckNvbnRyb2wuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvYnJvd3Nlci9wYXJ0cy90aXRsZWJhci9jb21tYW5kQ2VudGVyQ29udHJvbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7O0lBbUJ6RixJQUFNLG9CQUFvQixHQUExQixNQUFNLG9CQUFvQjtRQVNoQyxZQUNDLFdBQXdCLEVBQ3hCLGFBQTZCLEVBQ04sb0JBQTJDLEVBQzlDLGlCQUFxQyxFQUNyQyxpQkFBcUM7WUFaekMsaUJBQVksR0FBRyxJQUFJLDJCQUFlLEVBQUUsQ0FBQztZQUVyQywyQkFBc0IsR0FBRyxJQUFJLGVBQU8sRUFBUSxDQUFDO1lBQ3JELDBCQUFxQixHQUFnQixJQUFJLENBQUMsc0JBQXNCLENBQUMsS0FBSyxDQUFDO1lBRXZFLFlBQU8sR0FBZ0IsUUFBUSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQVM3RCxJQUFJLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztZQUU3QyxNQUFNLFlBQVksR0FBRyxvQkFBb0IsQ0FBQyxjQUFjLENBQUMsOEJBQW9CLEVBQUUsSUFBSSxDQUFDLE9BQU8sRUFBRSxnQkFBTSxDQUFDLGFBQWEsRUFBRTtnQkFDbEgsV0FBVyxFQUFFLGdCQUFNLENBQUMsZUFBZTtnQkFDbkMsa0JBQWtCLG1DQUEyQjtnQkFDN0MsY0FBYyxFQUFFO29CQUNmLFlBQVksRUFBRSxHQUFHLEVBQUUsQ0FBQyxJQUFJO2lCQUN4QjtnQkFDRCxlQUFlLEVBQUUsZUFBZTtnQkFDaEMsc0JBQXNCLEVBQUUsQ0FBQyxNQUFNLEVBQUUsRUFBRTtvQkFDbEMsSUFBSSxNQUFNLFlBQVksMkJBQWlCLElBQUksTUFBTSxDQUFDLElBQUksQ0FBQyxPQUFPLEtBQUssZ0JB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