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
    var $jyb_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$jyb = exports.$iyb = void 0;
    exports.$iyb = new contextkey_1.$2i('iconSelectBoxFocus', true);
    let $jyb = class $jyb extends iconSelectBox_1.$MR {
        static { $jyb_1 = this; }
        static getFocusedWidget() {
            return $jyb_1.y;
        }
        constructor(options, contextKeyService) {
            super(options);
            exports.$iyb.bindTo(this.B(contextKeyService.createScoped(this.domNode)));
        }
        focus() {
            super.focus();
            $jyb_1.y = this;
        }
    };
    exports.$jyb = $jyb;
    exports.$jyb = $jyb = $jyb_1 = __decorate([
        __param(1, contextkey_1.$3i)
    ], $jyb);
    keybindingsRegistry_1.$Nu.registerCommandAndKeybindingRule({
        id: 'iconSelectBox.focusUp',
        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
        when: exports.$iyb,
        primary: 16 /* KeyCode.UpArrow */,
        handler: (accessor, arg2) => {
            const selectBox = $jyb.getFocusedWidget();
            if (selectBox) {
                selectBox.focusPreviousRow();
            }
        }
    });
    keybindingsRegistry_1.$Nu.registerCommandAndKeybindingRule({
        id: 'iconSelectBox.focusDown',
        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
        when: exports.$iyb,
        primary: 18 /* KeyCode.DownArrow */,
        handler: (accessor, arg2) => {
            const selectBox = $jyb.getFocusedWidget();
            if (selectBox) {
                selectBox.focusNextRow();
            }
        }
    });
    keybindingsRegistry_1.$Nu.registerCommandAndKeybindingRule({
        id: 'iconSelectBox.focusNext',
        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
        when: exports.$iyb,
        primary: 17 /* KeyCode.RightArrow */,
        handler: (accessor, arg2) => {
            const selectBox = $jyb.getFocusedWidget();
            if (selectBox) {
                selectBox.focusNext();
            }
        }
    });
    keybindingsRegistry_1.$Nu.registerCommandAndKeybindingRule({
        id: 'iconSelectBox.focusPrevious',
        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
        when: exports.$iyb,
        primary: 15 /* KeyCode.LeftArrow */,
        handler: (accessor, arg2) => {
            const selectBox = $jyb.getFocusedWidget();
            if (selectBox) {
                selectBox.focusPrevious();
            }
        }
    });
    keybindingsRegistry_1.$Nu.registerCommandAndKeybindingRule({
        id: 'iconSelectBox.selectFocused',
        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
        when: exports.$iyb,
        primary: 3 /* KeyCode.Enter */,
        handler: (accessor, arg2) => {
            const selectBox = $jyb.getFocusedWidget();
            if (selectBox) {
                selectBox.setSelection(selectBox.getFocus()[0]);
            }
        }
    });
});
//# sourceMappingURL=iconSelectBox.js.map