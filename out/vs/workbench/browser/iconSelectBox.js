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
define(["require", "exports", "vs/base/browser/ui/icons/iconSelectBox", "vs/platform/contextkey/common/contextkey", "vs/platform/keybinding/common/keybindingsRegistry"], function (require, exports, iconSelectBox_1, contextkey_1, keybindingsRegistry_1) {
    "use strict";
    var WorkbenchIconSelectBox_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.WorkbenchIconSelectBox = exports.WorkbenchIconSelectBoxFocusContextKey = void 0;
    exports.WorkbenchIconSelectBoxFocusContextKey = new contextkey_1.RawContextKey('iconSelectBoxFocus', true);
    let WorkbenchIconSelectBox = class WorkbenchIconSelectBox extends iconSelectBox_1.IconSelectBox {
        static { WorkbenchIconSelectBox_1 = this; }
        static getFocusedWidget() {
            return WorkbenchIconSelectBox_1.focusedWidget;
        }
        constructor(options, contextKeyService) {
            super(options);
            exports.WorkbenchIconSelectBoxFocusContextKey.bindTo(this._register(contextKeyService.createScoped(this.domNode)));
        }
        focus() {
            super.focus();
            WorkbenchIconSelectBox_1.focusedWidget = this;
        }
    };
    exports.WorkbenchIconSelectBox = WorkbenchIconSelectBox;
    exports.WorkbenchIconSelectBox = WorkbenchIconSelectBox = WorkbenchIconSelectBox_1 = __decorate([
        __param(1, contextkey_1.IContextKeyService)
    ], WorkbenchIconSelectBox);
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: 'iconSelectBox.focusUp',
        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
        when: exports.WorkbenchIconSelectBoxFocusContextKey,
        primary: 16 /* KeyCode.UpArrow */,
        handler: (accessor, arg2) => {
            const selectBox = WorkbenchIconSelectBox.getFocusedWidget();
            if (selectBox) {
                selectBox.focusPreviousRow();
            }
        }
    });
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: 'iconSelectBox.focusDown',
        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
        when: exports.WorkbenchIconSelectBoxFocusContextKey,
        primary: 18 /* KeyCode.DownArrow */,
        handler: (accessor, arg2) => {
            const selectBox = WorkbenchIconSelectBox.getFocusedWidget();
            if (selectBox) {
                selectBox.focusNextRow();
            }
        }
    });
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: 'iconSelectBox.focusNext',
        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
        when: exports.WorkbenchIconSelectBoxFocusContextKey,
        primary: 17 /* KeyCode.RightArrow */,
        handler: (accessor, arg2) => {
            const selectBox = WorkbenchIconSelectBox.getFocusedWidget();
            if (selectBox) {
                selectBox.focusNext();
            }
        }
    });
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: 'iconSelectBox.focusPrevious',
        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
        when: exports.WorkbenchIconSelectBoxFocusContextKey,
        primary: 15 /* KeyCode.LeftArrow */,
        handler: (accessor, arg2) => {
            const selectBox = WorkbenchIconSelectBox.getFocusedWidget();
            if (selectBox) {
                selectBox.focusPrevious();
            }
        }
    });
    keybindingsRegistry_1.KeybindingsRegistry.registerCommandAndKeybindingRule({
        id: 'iconSelectBox.selectFocused',
        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
        when: exports.WorkbenchIconSelectBoxFocusContextKey,
        primary: 3 /* KeyCode.Enter */,
        handler: (accessor, arg2) => {
            const selectBox = WorkbenchIconSelectBox.getFocusedWidget();
            if (selectBox) {
                selectBox.setSelection(selectBox.getFocus()[0]);
            }
        }
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaWNvblNlbGVjdEJveC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9icm93c2VyL2ljb25TZWxlY3RCb3gudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7OztJQU9uRixRQUFBLHFDQUFxQyxHQUFHLElBQUksMEJBQWEsQ0FBVSxvQkFBb0IsRUFBRSxJQUFJLENBQUMsQ0FBQztJQUVyRyxJQUFNLHNCQUFzQixHQUE1QixNQUFNLHNCQUF1QixTQUFRLDZCQUFhOztRQUd4RCxNQUFNLENBQUMsZ0JBQWdCO1lBQ3RCLE9BQU8sd0JBQXNCLENBQUMsYUFBYSxDQUFDO1FBQzdDLENBQUM7UUFFRCxZQUNDLE9BQThCLEVBQ1YsaUJBQXFDO1lBRXpELEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUNmLDZDQUFxQyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLGlCQUFpQixDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzVHLENBQUM7UUFFUSxLQUFLO1lBQ2IsS0FBSyxDQUFDLEtBQUssRUFBRSxDQUFDO1lBQ2Qsd0JBQXNCLENBQUMsYUFBYSxHQUFHLElBQUksQ0FBQztRQUM3QyxDQUFDO0tBRUQsQ0FBQTtJQXBCWSx3REFBc0I7cUNBQXRCLHNCQUFzQjtRQVNoQyxXQUFBLCtCQUFrQixDQUFBO09BVFIsc0JBQXNCLENBb0JsQztJQUVELHlDQUFtQixDQUFDLGdDQUFnQyxDQUFDO1FBQ3BELEVBQUUsRUFBRSx1QkFBdUI7UUFDM0IsTUFBTSw2Q0FBbUM7UUFDekMsSUFBSSxFQUFFLDZDQUFxQztRQUMzQyxPQUFPLDBCQUFpQjtRQUN4QixPQUFPLEVBQUUsQ0FBQyxRQUFRLEVBQUUsSUFBSSxFQUFFLEVBQUU7WUFDM0IsTUFBTSxTQUFTLEdBQUcsc0JBQXNCLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztZQUM1RCxJQUFJLFNBQVMsRUFBRTtnQkFDZCxTQUFTLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQzthQUM3QjtRQUNGLENBQUM7S0FDRCxDQUFDLENBQUM7SUFFSCx5Q0FBbUIsQ0FBQyxnQ0FBZ0MsQ0FBQztRQUNwRCxFQUFFLEVBQUUseUJBQXlCO1FBQzdCLE1BQU0sNkNBQW1DO1FBQ3pDLElBQUksRUFBRSw2Q0FBcUM7UUFDM0MsT0FBTyw0QkFBbUI7UUFDMUIsT0FBTyxFQUFFLENBQUMsUUFBUSxFQUFFLElBQUksRUFBRSxFQUFFO1lBQzNCLE1BQU0sU0FBUyxHQUFHLHNCQUFzQixDQUFDLGdCQUFnQixFQUFFLENBQUM7WUFDNUQsSUFBSSxTQUFTLEVBQUU7Z0JBQ2QsU0FBUyxDQUFDLFlBQVksRUFBRSxDQUFDO2FBQ3pCO1FBQ0YsQ0FBQztLQUNELENBQUMsQ0FBQztJQUVILHlDQUFtQixDQUFDLGdDQUFnQyxDQUFDO1FBQ3BELEVBQUUsRUFBRSx5QkFBeUI7UUFDN0IsTUFBTSw2Q0FBbUM7UUFDekMsSUFBSSxFQUFFLDZDQUFxQztRQUMzQyxPQUFPLDZCQUFvQjtRQUMzQixPQUFPLEVBQUUsQ0FBQyxRQUFRLEVBQUUsSUFBSSxFQUFFLEVBQUU7WUFDM0IsTUFBTSxTQUFTLEdBQUcsc0JBQXNCLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztZQUM1RCxJQUFJLFNBQVMsRUFBRTtnQkFDZCxTQUFTLENBQUMsU0FBUyxFQUFFLENBQUM7YUFDdEI7UUFDRixDQUFDO0tBQ0QsQ0FBQyxDQUFDO0lBRUgseUNBQW1CLENBQUMsZ0NBQWdDLENBQUM7UUFDcEQsRUFBRSxFQUFFLDZCQUE2QjtRQUNqQyxNQUFNLDZDQUFtQztRQUN6QyxJQUFJLEVBQUUsNkNBQXFDO1FBQzNDLE9BQU8sNEJBQW1CO1FBQzFCLE9BQU8sRUFBRSxDQUFDLFFBQVEsRUFBRSxJQUFJLEVBQUUsRUFBRTtZQUMzQixNQUFNLFNBQVMsR0FBRyxzQkFBc0IsQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO1lBQzVELElBQUksU0FBUyxFQUFFO2dCQUNkLFNBQVMsQ0FBQyxhQUFhLEVBQUUsQ0FBQzthQUMxQjtRQUNGLENBQUM7S0FDRCxDQUFDLENBQUM7SUFFSCx5Q0FBbUIsQ0FBQyxnQ0FBZ0MsQ0FBQztRQUNwRCxFQUFFLEVBQUUsNkJBQTZCO1FBQ2pDLE1BQU0sNkNBQW1DO1FBQ3pDLElBQUksRUFBRSw2Q0FBcUM7UUFDM0MsT0FBTyx1QkFBZTtRQUN0QixPQUFPLEVBQUUsQ0FBQyxRQUFRLEVBQUUsSUFBSSxFQUFFLEVBQUU7WUFDM0IsTUFBTSxTQUFTLEdBQUcsc0JBQXNCLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztZQUM1RCxJQUFJLFNBQVMsRUFBRTtnQkFDZCxTQUFTLENBQUMsWUFBWSxDQUFDLFNBQVMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2FBQ2hEO1FBQ0YsQ0FBQztLQUNELENBQUMsQ0FBQyJ9