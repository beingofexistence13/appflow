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
    exports.registerNavigableContainer = void 0;
    function handleFocusEventsGroup(group, handler) {
        const focusedIndices = new Set();
        return (0, lifecycle_1.combinedDisposable)(...group.map((events, index) => (0, lifecycle_1.combinedDisposable)(events.onDidFocus(() => {
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
    const NavigableContainerFocusedContextKey = new contextkey_1.RawContextKey('navigableContainerFocused', false);
    let NavigableContainerManager = class NavigableContainerManager {
        static { NavigableContainerManager_1 = this; }
        constructor(contextKeyService) {
            this.containers = new Set();
            this.focused = NavigableContainerFocusedContextKey.bindTo(contextKeyService);
            NavigableContainerManager_1.INSTANCE = this;
        }
        dispose() {
            this.containers.clear();
            this.focused.reset();
            NavigableContainerManager_1.INSTANCE = undefined;
        }
        static register(container) {
            const instance = this.INSTANCE;
            if (!instance) {
                return lifecycle_1.Disposable.None;
            }
            instance.containers.add(container);
            return (0, lifecycle_1.combinedDisposable)(handleFocusEventsGroup(container.focusNotifiers, (isFocus) => {
                if (isFocus) {
                    instance.focused.set(true);
                    instance.lastContainer = container;
                }
                else if (instance.lastContainer === container) {
                    instance.focused.set(false);
                    instance.lastContainer = undefined;
                }
            }), (0, lifecycle_1.toDisposable)(() => {
                instance.containers.delete(container);
                if (instance.lastContainer === container) {
                    instance.focused.set(false);
                    instance.lastContainer = undefined;
                }
            }));
        }
        static getActive() {
            return this.INSTANCE?.lastContainer;
        }
    };
    NavigableContainerManager = NavigableContainerManager_1 = __decorate([
        __param(0, contextkey_1.IContextKeyService)
    ], NavigableContainerManager);
    function registerNavigableContainer(container) {
        return NavigableContainerManager.register(container);
    }
    exports.registerNavigableContainer = registerNavigableContainer;
    platform_1.Registry.as(contributions_1.Extensions.Workbench)
        .registerWorkbenchContribution(NavigableContainerManager, 1 /* LifecyclePhase.Starting */);
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: 'widgetNavigation.focusPrevious',
        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
        when: contextkey_1.ContextKeyExpr.and(NavigableContainerFocusedContextKey, contextkey_1.ContextKeyExpr.or(listService_1.WorkbenchListFocusContextKey?.negate(), listService_1.WorkbenchListScrollAtTopContextKey)),
        primary: 2048 /* KeyMod.CtrlCmd */ | 16 /* KeyCode.UpArrow */,
        handler: () => {
            const activeContainer = NavigableContainerManager.getActive();
            activeContainer?.focusPreviousWidget();
        }
    });
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: 'widgetNavigation.focusNext',
        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
        when: contextkey_1.ContextKeyExpr.and(NavigableContainerFocusedContextKey, contextkey_1.ContextKeyExpr.or(listService_1.WorkbenchListFocusContextKey?.negate(), listService_1.WorkbenchListScrollAtBottomContextKey)),
        primary: 2048 /* KeyMod.CtrlCmd */ | 18 /* KeyCode.DownArrow */,
        handler: () => {
            const activeContainer = NavigableContainerManager.getActive();
            activeContainer?.focusNextWidget();
        }
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2lkZ2V0TmF2aWdhdGlvbkNvbW1hbmRzLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2Jyb3dzZXIvYWN0aW9ucy93aWRnZXROYXZpZ2F0aW9uQ29tbWFuZHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7OztJQW1DaEcsU0FBUyxzQkFBc0IsQ0FBQyxLQUFnQyxFQUFFLE9BQW1DO1FBQ3BHLE1BQU0sY0FBYyxHQUFHLElBQUksR0FBRyxFQUFVLENBQUM7UUFDekMsT0FBTyxJQUFBLDhCQUFrQixFQUFDLEdBQUcsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLE1BQU0sRUFBRSxLQUFLLEVBQUUsRUFBRSxDQUFDLElBQUEsOEJBQWtCLEVBQzNFLE1BQU0sQ0FBQyxVQUFVLENBQUMsR0FBRyxFQUFFO1lBQ3RCLElBQUksQ0FBQyxjQUFjLENBQUMsSUFBSSxFQUFFO2dCQUN6QixPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7YUFDZDtZQUNELGNBQWMsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDM0IsQ0FBQyxDQUFDLEVBQ0YsTUFBTSxDQUFDLFNBQVMsQ0FBQyxHQUFHLEVBQUU7WUFDckIsY0FBYyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUM3QixJQUFJLENBQUMsY0FBYyxDQUFDLElBQUksRUFBRTtnQkFDekIsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDO2FBQ2Y7UUFDRixDQUFDLENBQUMsQ0FDRixDQUFDLENBQUMsQ0FBQztJQUNMLENBQUM7SUFFRCxNQUFNLG1DQUFtQyxHQUFHLElBQUksMEJBQWEsQ0FBVSwyQkFBMkIsRUFBRSxLQUFLLENBQUMsQ0FBQztJQUUzRyxJQUFNLHlCQUF5QixHQUEvQixNQUFNLHlCQUF5Qjs7UUFROUIsWUFBZ0MsaUJBQXFDO1lBTHBELGVBQVUsR0FBRyxJQUFJ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