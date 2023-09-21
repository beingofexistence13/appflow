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
define(["require", "exports", "vs/base/common/lifecycle", "vs/platform/keyboardLayout/common/keyboardLayout", "vs/base/common/event", "vs/base/common/platform", "vs/platform/ipc/common/mainProcessService", "vs/base/parts/ipc/common/ipc", "vs/platform/instantiation/common/instantiation"], function (require, exports, lifecycle_1, keyboardLayout_1, event_1, platform_1, mainProcessService_1, ipc_1, instantiation_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$0$b = exports.$9$b = void 0;
    exports.$9$b = (0, instantiation_1.$Bh)('nativeKeyboardLayoutService');
    let $0$b = class $0$b extends lifecycle_1.$kc {
        constructor(mainProcessService) {
            super();
            this.c = this.B(new event_1.$fd());
            this.onDidChangeKeyboardLayout = this.c.event;
            this.f = ipc_1.ProxyChannel.toService(mainProcessService.getChannel('keyboardLayout'));
            this.g = null;
            this.h = null;
            this.j = null;
            this.B(this.f.onDidChangeKeyboardLayout(async ({ keyboardLayoutInfo, keyboardMapping }) => {
                await this.initialize();
                if (keyboardMappingEquals(this.h, keyboardMapping)) {
                    // the mappings are equal
                    return;
                }
                this.h = keyboardMapping;
                this.j = keyboardLayoutInfo;
                this.c.fire();
            }));
        }
        initialize() {
            if (!this.g) {
                this.g = this.m();
            }
            return this.g;
        }
        async m() {
            const keyboardLayoutData = await this.f.getKeyboardLayoutData();
            const { keyboardLayoutInfo, keyboardMapping } = keyboardLayoutData;
            this.h = keyboardMapping;
            this.j = keyboardLayoutInfo;
        }
        getRawKeyboardMapping() {
            return this.h;
        }
        getCurrentKeyboardLayout() {
            return this.j;
        }
    };
    exports.$0$b = $0$b;
    exports.$0$b = $0$b = __decorate([
        __param(0, mainProcessService_1.$o7b)
    ], $0$b);
    function keyboardMappingEquals(a, b) {
        if (platform_1.OS === 1 /* OperatingSystem.Windows */) {
            return (0, keyboardLayout_1.$Xyb)(a, b);
        }
        return (0, keyboardLayout_1.$Yyb)(a, b);
    }
});
//# sourceMappingURL=nativeKeyboardLayoutService.js.map