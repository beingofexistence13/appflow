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
define(["require", "exports", "vs/platform/contextkey/common/contextkey", "vs/platform/keybinding/common/keybindingsRegistry", "vs/platform/list/browser/listService", "vs/base/common/lifecycle", "vs/platform/registry/common/platform", "vs/workbench/common/contributions"], function (require, exports, contextkey_1, keybindingsRegistry_1, listService_1, lifecycle_1, platform_1, contributions_1) {
    "use strict";
    var NavigableContainerManager_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Cmb = void 0;
    function handleFocusEventsGroup(group, handler) {
        const focusedIndices = new Set();
        return (0, lifecycle_1.$hc)(...group.map((events, index) => (0, lifecycle_1.$hc)(events.onDidFocus(() => {
            if (!focusedIndices.size) {
                handler(true);
            }
            focusedIndices.add(index);
        }), events.onDidBlur(() => {
            focusedIndices.delete(index);
            if (!focusedIndices.size) {
                handler(false);
            }
        }))));
    }
    const NavigableContainerFocusedContextKey = new contextkey_1.$2i('navigableContainerFocused', false);
    let NavigableContainerManager = class NavigableContainerManager {
        static { NavigableContainerManager_1 = this; }
        constructor(contextKeyService) {
            this.b = new Set();
            this.d = NavigableContainerFocusedContextKey.bindTo(contextKeyService);
            NavigableContainerManager_1.a = this;
        }
        dispose() {
            this.b.clear();
            this.d.reset();
            NavigableContainerManager_1.a = undefined;
        }
        static register(container) {
            const instance = this.a;
            if (!instance) {
                return lifecycle_1.$kc.None;
            }
            instance.b.add(container);
            return (0, lifecycle_1.$hc)(handleFocusEventsGroup(container.focusNotifiers, (isFocus) => {
                if (isFocus) {
                    instance.d.set(true);
                    instance.c = container;
                }
                else if (instance.c === container) {
                    instance.d.set(false);
                    instance.c = undefined;
                }
            }), (0, lifecycle_1.$ic)(() => {
                instance.b.delete(container);
                if (instance.c === container) {
                    instance.d.set(false);
                    instance.c = undefined;
                }
            }));
        }
        static getActive() {
            return this.a?.c;
        }
    };
    NavigableContainerManager = NavigableContainerManager_1 = __decorate([
        __param(0, contextkey_1.$3i)
    ], NavigableContainerManager);
    function $Cmb(container) {
        return NavigableContainerManager.register(container);
    }
    exports.$Cmb = $Cmb;
    platform_1.$8m.as(contributions_1.Extensions.Workbench)
        .registerWorkbenchContribution(NavigableContainerManager, 1 /* LifecyclePhase.Starting */);
    keybindingsRegistry_1.$Nu.registerCommandAndKeybindingRule({
        id: 'widgetNavigation.focusPrevious',
        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
        when: contextkey_1.$Ii.and(NavigableContainerFocusedContextKey, contextkey_1.$Ii.or(listService_1.$e4?.negate(), listService_1.$a4)),
        primary: 2048 /* KeyMod.CtrlCmd */ | 16 /* KeyCode.UpArrow */,
        handler: () => {
            const activeContainer = NavigableContainerManager.getActive();
            activeContainer?.focusPreviousWidget();
        }
    });
    keybindingsRegistry_1.$Nu.registerCommandAndKeybindingRule({
        id: 'widgetNavigation.focusNext',
        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
        when: contextkey_1.$Ii.and(NavigableContainerFocusedContextKey, contextkey_1.$Ii.or(listService_1.$e4?.negate(), listService_1.$b4)),
        primary: 2048 /* KeyMod.CtrlCmd */ | 18 /* KeyCode.DownArrow */,
        handler: () => {
            const activeContainer = NavigableContainerManager.getActive();
            activeContainer?.focusNextWidget();
        }
    });
});
//# sourceMappingURL=widgetNavigationCommands.js.map