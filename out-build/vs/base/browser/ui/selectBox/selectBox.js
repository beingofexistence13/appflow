/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/ui/list/listWidget", "vs/base/browser/ui/selectBox/selectBoxCustom", "vs/base/browser/ui/selectBox/selectBoxNative", "vs/base/browser/ui/widget", "vs/base/common/platform", "vs/css!./selectBox"], function (require, exports, listWidget_1, selectBoxCustom_1, selectBoxNative_1, widget_1, platform_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$HQ = exports.$GQ = void 0;
    exports.$GQ = {
        ...listWidget_1.$vQ,
        selectBackground: '#3C3C3C',
        selectForeground: '#F0F0F0',
        selectBorder: '#3C3C3C',
        decoratorRightForeground: undefined,
        selectListBackground: undefined,
        selectListBorder: undefined,
        focusBorder: undefined,
    };
    class $HQ extends widget_1.$IP {
        constructor(options, selected, contextViewProvider, styles, selectBoxOptions) {
            super();
            // Default to native SelectBox for OSX unless overridden
            if (platform_1.$j && !selectBoxOptions?.useCustomDrawn) {
                this.a = new selectBoxNative_1.$FQ(options, selected, styles, selectBoxOptions);
            }
            else {
                this.a = new selectBoxCustom_1.$EQ(options, selected, contextViewProvider, styles, selectBoxOptions);
            }
            this.B(this.a);
        }
        // Public SelectBox Methods - routed through delegate interface
        get onDidSelect() {
            return this.a.onDidSelect;
        }
        setOptions(options, selected) {
            this.a.setOptions(options, selected);
        }
        select(index) {
            this.a.select(index);
        }
        setAriaLabel(label) {
            this.a.setAriaLabel(label);
        }
        focus() {
            this.a.focus();
        }
        blur() {
            this.a.blur();
        }
        setFocusable(focusable) {
            this.a.setFocusable(focusable);
        }
        render(container) {
            this.a.render(container);
        }
    }
    exports.$HQ = $HQ;
});
//# sourceMappingURL=selectBox.js.map