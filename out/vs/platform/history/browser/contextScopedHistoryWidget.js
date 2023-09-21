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
define(["require", "exports", "vs/base/browser/ui/findinput/findInput", "vs/base/browser/ui/findinput/replaceInput", "vs/base/browser/ui/inputbox/inputBox", "vs/platform/contextkey/common/contextkey", "vs/platform/keybinding/common/keybindingsRegistry", "vs/nls", "vs/base/common/lifecycle"], function (require, exports, findInput_1, replaceInput_1, inputBox_1, contextkey_1, keybindingsRegistry_1, nls_1, lifecycle_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ContextScopedReplaceInput = exports.ContextScopedFindInput = exports.ContextScopedHistoryInputBox = exports.registerAndCreateHistoryNavigationContext = exports.historyNavigationVisible = void 0;
    exports.historyNavigationVisible = new contextkey_1.RawContextKey('suggestWidgetVisible', false, (0, nls_1.localize)('suggestWidgetVisible', "Whether suggestion are visible"));
    const HistoryNavigationWidgetFocusContext = 'historyNavigationWidgetFocus';
    const HistoryNavigationForwardsEnablementContext = 'historyNavigationForwardsEnabled';
    const HistoryNavigationBackwardsEnablementContext = 'historyNavigationBackwardsEnabled';
    let lastFocusedWidget = undefined;
    const widgets = [];
    function registerAndCreateHistoryNavigationContext(scopedContextKeyService, widget) {
        if (widgets.includes(widget)) {
            throw new Error('Cannot register the same widget multiple times');
        }
        widgets.push(widget);
        const disposableStore = new lifecycle_1.DisposableStore();
        const historyNavigationWidgetFocus = new contextkey_1.RawContextKey(HistoryNavigationWidgetFocusContext, false).bindTo(scopedContextKeyService);
        const historyNavigationForwardsEnablement = new contextkey_1.RawContextKey(HistoryNavigationForwardsEnablementContext, true).bindTo(scopedContextKeyService);
        const historyNavigationBackwardsEnablement = new contextkey_1.RawContextKey(HistoryNavigationBackwardsEnablementContext, true).bindTo(scopedContextKeyService);
        const onDidFocus = () => {
            historyNavigationWidgetFocus.set(true);
            lastFocusedWidget = widget;
        };
        const onDidBlur = () => {
            historyNavigationWidgetFocus.set(false);
            if (lastFocusedWidget === widget) {
                lastFocusedWidget = undefined;
            }
        };
        // Check for currently being focused
        if (widget.element === document.activeElement) {
            onDidFocus();
        }
        disposableStore.add(widget.onDidFocus(() => onDidFocus()));
        disposableStore.add(widget.onDidBlur(() => onDidBlur()));
        disposableStore.add((0, lifecycle_1.toDisposable)(() => {
            widgets.splice(widgets.indexOf(widget), 1);
            onDidBlur();
        }));
        return {
            historyNavigationForwardsEnablement,
            historyNavigationBackwardsEnablement,
            dispose() {
                disposableStore.dispose();
            }
        };
    }
    exports.registerAndCreateHistoryNavigationContext = registerAndCreateHistoryNavigationContext;
    let ContextScopedHistoryInputBox = class ContextScopedHistoryInputBox extends inputBox_1.HistoryInputBox {
        constructor(container, contextViewProvider, options, contextKeyService) {
            super(container, contextViewProvider, options);
            const scopedContextKeyService = this._register(contextKeyService.createScoped(this.element));
            this._register(registerAndCreateHistoryNavigationContext(scopedContextKeyService, this));
        }
    };
    exports.ContextScopedHistoryInputBox = ContextScopedHistoryInputBox;
    exports.ContextScopedHistoryInputBox = ContextScopedHistoryInputBox = __decorate([
        __param(3, contextkey_1.IContextKeyService)
    ], ContextScopedHistoryInputBox);
    let ContextScopedFindInput = class ContextScopedFindInput extends findInput_1.FindInput {
        constructor(container, contextViewProvider, options, contextKeyService) {
            super(container, contextViewProvider, options);
            const scopedContextKeyService = this._register(contextKeyService.createScoped(this.inputBox.element));
            this._register(registerAndCreateHistoryNavigationContext(scopedContextKeyService, this.inputBox));
        }
    };
    exports.ContextScopedFindInput = ContextScopedFindInput;
    exports.ContextScopedFindInput = ContextScopedFindInput = __decorate([
        __param(3, contextkey_1.IContextKeyService)
    ], ContextScopedFindInput);
    let ContextScopedReplaceInput = class ContextScopedReplaceInput extends replaceInput_1.ReplaceInput {
        constructor(container, contextViewProvider, options, contextKeyService, showReplaceOptions = false) {
            super(container, contextViewProvider, showReplaceOptions, options);
            const scopedContextKeyService = this._register(contextKeyService.createScoped(this.inputBox.element));
            this._register(registerAndCreateHistoryNavigationContext(scopedContextKeyService, this.inputBox));
        }
    };
    exports.ContextScopedReplaceInput = ContextScopedReplaceInput;
    exports.ContextScopedReplaceInput = ContextScopedReplaceInput = __decorate([
        __param(3, contextkey_1.IContextKeyService)
    ], ContextScopedReplaceInput);
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: 'history.showPrevious',
        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
        when: contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.has(HistoryNavigationWidgetFocusContext), contextkey_1.ContextKeyExpr.equals(HistoryNavigationBackwardsEnablementContext, true), contextkey_1.ContextKeyExpr.not('isComposing'), exports.historyNavigationVisible.isEqualTo(false)),
        primary: 16 /* KeyCode.UpArrow */,
        secondary: [512 /* KeyMod.Alt */ | 16 /* KeyCode.UpArrow */],
        handler: (accessor) => {
            lastFocusedWidget?.showPreviousValue();
        }
    });
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: 'history.showNext',
        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
        when: contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.has(HistoryNavigationWidgetFocusContext), contextkey_1.ContextKeyExpr.equals(HistoryNavigationForwardsEnablementContext, true), contextkey_1.ContextKeyExpr.not('isComposing'), exports.historyNavigationVisible.isEqualTo(false)),
        primary: 18 /* KeyCode.DownArrow */,
        secondary: [512 /* KeyMod.Alt */ | 18 /* KeyCode.DownArrow */],
        handler: (accessor) => {
            lastFocusedWidget?.showNextValue();
        }
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29udGV4dFNjb3BlZEhpc3RvcnlXaWRnZXQuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9wbGF0Zm9ybS9oaXN0b3J5L2Jyb3dzZXIvY29udGV4dFNjb3BlZEhpc3RvcnlXaWRnZXQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBYW5GLFFBQUEsd0JBQXdCLEdBQUcsSUFBSSwwQkFBYSxDQUFVLHNCQUFzQixFQUFFLEtBQUssRUFBRSxJQUFBLGNBQVEsRUFBQyxzQkFBc0IsRUFBRSxnQ0FBZ0MsQ0FBQyxDQUFDLENBQUM7SUFFdEssTUFBTSxtQ0FBbUMsR0FBRyw4QkFBOEIsQ0FBQztJQUMzRSxNQUFNLDBDQUEwQyxHQUFHLGtDQUFrQyxDQUFDO0lBQ3RGLE1BQU0sMkNBQTJDLEdBQUcsbUNBQW1DLENBQUM7SUFPeEYsSUFBSSxpQkFBaUIsR0FBeUMsU0FBUyxDQUFDO0lBQ3hFLE1BQU0sT0FBTyxHQUErQixFQUFFLENBQUM7SUFFL0MsU0FBZ0IseUNBQXlDLENBQUMsdUJBQTJDLEVBQUUsTUFBZ0M7UUFDdEksSUFBSSxPQUFPLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxFQUFFO1lBQzdCLE1BQU0sSUFBSSxLQUFLLENBQUMsZ0RBQWdELENBQUMsQ0FBQztTQUNsRTtRQUVELE9BQU8sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDckIsTUFBTSxlQUFlLEdBQUcsSUFBSSwyQkFBZSxFQUFFLENBQUM7UUFDOUMsTUFBTSw0QkFBNEIsR0FBRyxJQUFJLDBCQUFhLENBQVUsbUNBQW1DLEVBQUUsS0FBSyxDQUFDLENBQUMsTUFBTSxDQUFDLHVCQUF1QixDQUFDLENBQUM7UUFDNUksTUFBTSxtQ0FBbUMsR0FBRyxJQUFJLDBCQUFhLENBQVUsMENBQTBDLEVBQUUsSUFBSSxDQUFDLENBQUMsTUFBTSxDQUFDLHVCQUF1QixDQUFD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