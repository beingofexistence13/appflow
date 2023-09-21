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
define(["require", "exports", "vs/base/common/platform", "vs/nls!vs/workbench/services/preferences/browser/keybindingsEditorInput", "vs/platform/instantiation/common/instantiation", "vs/workbench/common/editor/editorInput", "vs/workbench/services/preferences/browser/keybindingsEditorModel"], function (require, exports, platform_1, nls, instantiation_1, editorInput_1, keybindingsEditorModel_1) {
    "use strict";
    var $Dyb_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Dyb = void 0;
    let $Dyb = class $Dyb extends editorInput_1.$tA {
        static { $Dyb_1 = this; }
        static { this.ID = 'workbench.input.keybindings'; }
        constructor(instantiationService) {
            super();
            this.searchOptions = null;
            this.resource = undefined;
            this.keybindingsModel = instantiationService.createInstance(keybindingsEditorModel_1.$Cyb, platform_1.OS);
        }
        get typeId() {
            return $Dyb_1.ID;
        }
        getName() {
            return nls.localize(0, null);
        }
        async resolve() {
            return this.keybindingsModel;
        }
        matches(otherInput) {
            return otherInput instanceof $Dyb_1;
        }
        dispose() {
            this.keybindingsModel.dispose();
            super.dispose();
        }
    };
    exports.$Dyb = $Dyb;
    exports.$Dyb = $Dyb = $Dyb_1 = __decorate([
        __param(0, instantiation_1.$Ah)
    ], $Dyb);
});
//# sourceMappingURL=keybindingsEditorInput.js.map