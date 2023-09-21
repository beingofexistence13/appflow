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
define(["require", "exports", "vs/base/common/platform", "vs/base/common/event", "vs/base/common/lifecycle", "vs/platform/instantiation/common/instantiation", "vs/platform/lifecycle/electron-main/lifecycleMainService"], function (require, exports, platform, event_1, lifecycle_1, instantiation_1, lifecycleMainService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$h6b = exports.$g6b = void 0;
    exports.$g6b = (0, instantiation_1.$Bh)('keyboardLayoutMainService');
    let $h6b = class $h6b extends lifecycle_1.$kc {
        constructor(lifecycleMainService) {
            super();
            this.a = this.B(new event_1.$fd());
            this.onDidChangeKeyboardLayout = this.a.event;
            this.b = null;
            this.c = null;
            // perf: automatically trigger initialize after windows
            // have opened so that we can do this work in parallel
            // to the window load.
            lifecycleMainService.when(3 /* LifecycleMainPhase.AfterWindowOpen */).then(() => this.f());
        }
        f() {
            if (!this.b) {
                this.b = this.g();
            }
            return this.b;
        }
        async g() {
            const nativeKeymapMod = await new Promise((resolve_1, reject_1) => { require(['native-keymap'], resolve_1, reject_1); });
            this.c = readKeyboardLayoutData(nativeKeymapMod);
            if (!platform.$s) {
                // See https://github.com/microsoft/vscode/issues/152840
                // Do not register the keyboard layout change listener in CI because it doesn't work
                // on the build machines and it just adds noise to the build logs.
                nativeKeymapMod.onDidChangeKeyboardLayout(() => {
                    this.c = readKeyboardLayoutData(nativeKeymapMod);
                    this.a.fire(this.c);
                });
            }
        }
        async getKeyboardLayoutData() {
            await this.f();
            return this.c;
        }
    };
    exports.$h6b = $h6b;
    exports.$h6b = $h6b = __decorate([
        __param(0, lifecycleMainService_1.$p5b)
    ], $h6b);
    function readKeyboardLayoutData(nativeKeymapMod) {
        const keyboardMapping = nativeKeymapMod.getKeyMap();
        const keyboardLayoutInfo = nativeKeymapMod.getCurrentKeyboardLayout();
        return { keyboardMapping, keyboardLayoutInfo };
    }
});
//# sourceMappingURL=keyboardLayoutMainService.js.map