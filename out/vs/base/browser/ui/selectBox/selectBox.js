/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/ui/list/listWidget", "vs/base/browser/ui/selectBox/selectBoxCustom", "vs/base/browser/ui/selectBox/selectBoxNative", "vs/base/browser/ui/widget", "vs/base/common/platform", "vs/css!./selectBox"], function (require, exports, listWidget_1, selectBoxCustom_1, selectBoxNative_1, widget_1, platform_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SelectBox = exports.unthemedSelectBoxStyles = void 0;
    exports.unthemedSelectBoxStyles = {
        ...listWidget_1.unthemedListStyles,
        selectBackground: '#3C3C3C',
        selectForeground: '#F0F0F0',
        selectBorder: '#3C3C3C',
        decoratorRightForeground: undefined,
        selectListBackground: undefined,
        selectListBorder: undefined,
        focusBorder: undefined,
    };
    class SelectBox extends widget_1.Widget {
        constructor(options, selected, contextViewProvider, styles, selectBoxOptions) {
            super();
            // Default to native SelectBox for OSX unless overridden
            if (platform_1.isMacintosh && !selectBoxOptions?.useCustomDrawn) {
                this.selectBoxDelegate = new selectBoxNative_1.SelectBoxNative(options, selected, styles, selectBoxOptions);
            }
            else {
                this.selectBoxDelegate = new selectBoxCustom_1.SelectBoxList(options, selected, contextViewProvider, styles, selectBoxOptions);
            }
            this._register(this.selectBoxDelegate);
        }
        // Public SelectBox Methods - routed through delegate interface
        get onDidSelect() {
            return this.selectBoxDelegate.onDidSelect;
        }
        setOptions(options, selected) {
            this.selectBoxDelegate.setOptions(options, selected);
        }
        select(index) {
            this.selectBoxDelegate.select(index);
        }
        setAriaLabel(label) {
            this.selectBoxDelegate.setAriaLabel(label);
        }
        focus() {
            this.selectBoxDelegate.focus();
        }
        blur() {
            this.selectBoxDelegate.blur();
        }
        setFocusable(focusable) {
            this.selectBoxDelegate.setFocusable(focusable);
        }
        render(container) {
            this.selectBoxDelegate.render(container);
        }
    }
    exports.SelectBox = SelectBox;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VsZWN0Qm94LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvYmFzZS9icm93c2VyL3VpL3NlbGVjdEJveC9zZWxlY3RCb3gudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBNkRuRixRQUFBLHVCQUF1QixHQUFxQjtRQUN4RCxHQUFHLCtCQUFrQjtRQUNyQixnQkFBZ0IsRUFBRSxTQUFTO1FBQzNCLGdCQUFnQixFQUFFLFNBQVM7UUFDM0IsWUFBWSxFQUFFLFNBQVM7UUFDdkIsd0JBQXdCLEVBQUUsU0FBUztRQUNuQyxvQkFBb0IsRUFBRSxTQUFTO1FBQy9CLGdCQUFnQixFQUFFLFNBQVM7UUFDM0IsV0FBVyxFQUFFLFNBQVM7S0FDdEIsQ0FBQztJQU9GLE1BQWEsU0FBVSxTQUFRLGVBQU07UUFHcEMsWUFBWSxPQUE0QixFQUFFLFFBQWdCLEVBQUUsbUJBQXlDLEVBQUUsTUFBd0IsRUFBRSxnQkFBb0M7WUFDcEssS0FBSyxFQUFFLENBQUM7WUFFUix3REFBd0Q7WUFDeEQsSUFBSSxzQkFBVyxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsY0FBYyxFQUFFO2dCQUNyRCxJQUFJLENBQUMsaUJBQWlCLEdBQUcsSUFBSSxpQ0FBZSxDQUFDLE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSxFQUFFLGdCQUFnQixDQUFDLENBQUM7YUFDMUY7aUJBQU07Z0JBQ04sSUFBSSxDQUFDLGlCQUFpQixHQUFHLElBQUksK0JBQWEsQ0FBQyxPQUFPLEVBQUUsUUFBUSxFQUFFLG1CQUFtQixFQUFFLE1BQU0sRUFBRSxnQkFBZ0IsQ0FBQyxDQUFDO2FBQzdHO1lBRUQsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsQ0FBQztRQUN4QyxDQUFDO1FBRUQsK0RBQStEO1FBRS9ELElBQUksV0FBVztZQUNkLE9BQU8sSUFBSSxDQUFDLGlCQUFpQixDQUFDLFdBQVcsQ0FBQztRQUMzQyxDQUFDO1FBRUQsVUFBVSxDQUFDLE9BQTRCLEVBQUUsUUFBaUI7WUFDekQsSUFBSSxDQUFDLGlCQUFpQixDQUFDLFVBQVUsQ0FBQyxPQUFPLEVBQUUsUUFBUSxDQUFDLENBQUM7UUFDdEQsQ0FBQztRQUVELE1BQU0sQ0FBQyxLQUFhO1lBQ25CLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDdEMsQ0FBQztRQUVELFlBQVksQ0FBQyxLQUFhO1lBQ3pCLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxZQUFZLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDNUMsQ0FBQztRQUVELEtBQUs7WUFDSixJQUFJLENBQUMsaUJBQWlCLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDaEMsQ0FBQztRQUVELElBQUk7WUFDSCxJQUFJLENBQUMsaUJBQWlCLENBQUMsSUFBSSxFQUFFLENBQUM7UUFDL0IsQ0FBQztRQUVELFlBQVksQ0FBQyxTQUFrQjtZQUM5QixJQUFJLENBQUMsaUJBQWlCLENBQUMsWUFBWSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQ2hELENBQUM7UUFFRCxNQUFNLENBQUMsU0FBc0I7WUFDNUIsSUFBSSxDQUFDLGlCQUFpQixDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUMxQyxDQUFDO0tBQ0Q7SUFqREQsOEJBaURDIn0=