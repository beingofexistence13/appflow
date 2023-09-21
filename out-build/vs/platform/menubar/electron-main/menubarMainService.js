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
define(["require", "exports", "vs/platform/instantiation/common/instantiation", "vs/platform/lifecycle/electron-main/lifecycleMainService", "vs/platform/log/common/log", "vs/platform/menubar/electron-main/menubar"], function (require, exports, instantiation_1, lifecycleMainService_1, log_1, menubar_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$t6b = exports.$s6b = void 0;
    exports.$s6b = (0, instantiation_1.$Bh)('menubarMainService');
    let $t6b = class $t6b {
        constructor(b, c, d) {
            this.b = b;
            this.c = c;
            this.d = d;
            this.a = this.e();
        }
        async e() {
            await this.c.when(3 /* LifecycleMainPhase.AfterWindowOpen */);
            return this.b.createInstance(menubar_1.$r6b);
        }
        async updateMenubar(windowId, menus) {
            this.d.trace('menubarService#updateMenubar', windowId);
            const menubar = await this.a;
            menubar.updateMenu(menus, windowId);
        }
    };
    exports.$t6b = $t6b;
    exports.$t6b = $t6b = __decorate([
        __param(0, instantiation_1.$Ah),
        __param(1, lifecycleMainService_1.$p5b),
        __param(2, log_1.$5i)
    ], $t6b);
});
//# sourceMappingURL=menubarMainService.js.map