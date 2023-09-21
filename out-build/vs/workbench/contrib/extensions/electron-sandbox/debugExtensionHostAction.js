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
define(["require", "exports", "vs/base/common/actions", "vs/base/common/ports", "vs/nls!vs/workbench/contrib/extensions/electron-sandbox/debugExtensionHostAction", "vs/platform/dialogs/common/dialogs", "vs/platform/native/common/native", "vs/platform/product/common/productService", "vs/workbench/contrib/debug/common/debug", "vs/workbench/services/extensions/common/extensions"], function (require, exports, actions_1, ports_1, nls, dialogs_1, native_1, productService_1, debug_1, extensions_1) {
    "use strict";
    var $rac_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$rac = void 0;
    let $rac = class $rac extends actions_1.$gi {
        static { $rac_1 = this; }
        static { this.ID = 'workbench.extensions.action.debugExtensionHost'; }
        static { this.LABEL = nls.localize(0, null); }
        static { this.CSS_CLASS = 'debug-extension-host'; }
        constructor(a, b, c, f, g) {
            super($rac_1.ID, $rac_1.LABEL, $rac_1.CSS_CLASS);
            this.a = a;
            this.b = b;
            this.c = c;
            this.f = f;
            this.g = g;
        }
        async run() {
            const inspectPorts = await this.f.getInspectPorts(1 /* ExtensionHostKind.LocalProcess */, false);
            if (inspectPorts.length === 0) {
                const res = await this.c.confirm({
                    message: nls.localize(1, null),
                    detail: nls.localize(2, null, this.g.nameLong),
                    primaryButton: nls.localize(3, null)
                });
                if (res.confirmed) {
                    await this.b.relaunch({ addArgs: [`--inspect-extensions=${(0, ports_1.$JS)()}`] });
                }
                return;
            }
            if (inspectPorts.length > 1) {
                // TODO
                console.warn(`There are multiple extension hosts available for debugging. Picking the first one...`);
            }
            return this.a.startDebugging(undefined, {
                type: 'node',
                name: nls.localize(4, null),
                request: 'attach',
                port: inspectPorts[0]
            });
        }
    };
    exports.$rac = $rac;
    exports.$rac = $rac = $rac_1 = __decorate([
        __param(0, debug_1.$nH),
        __param(1, native_1.$05b),
        __param(2, dialogs_1.$oA),
        __param(3, extensions_1.$MF),
        __param(4, productService_1.$kj)
    ], $rac);
});
//# sourceMappingURL=debugExtensionHostAction.js.map