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
define(["require", "exports", "vs/base/common/async", "vs/base/common/decorators", "vs/base/common/network", "vs/platform/product/common/productService", "vs/platform/sign/common/abstractSignService"], function (require, exports, async_1, decorators_1, network_1, productService_1, abstractSignService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$y2b = void 0;
    const KEY_SIZE = 32;
    const IV_SIZE = 16;
    const STEP_SIZE = KEY_SIZE + IV_SIZE;
    let $y2b = class $y2b extends abstractSignService_1.$x2b {
        constructor(f) {
            super();
            this.f = f;
        }
        c() {
            return this.j().then(vsda => {
                const v = new vsda.validator();
                return {
                    createNewMessage: arg => v.createNewMessage(arg),
                    validate: arg => v.validate(arg),
                    dispose: () => v.free(),
                };
            });
        }
        d(arg) {
            return this.j().then(vsda => vsda.sign(arg));
        }
        async j() {
            const checkInterval = new async_1.$Rg();
            let [wasm] = await Promise.all([
                this.k(),
                new Promise((resolve, reject) => {
                    require(['vsda'], resolve, reject);
                    // todo@connor4312: there seems to be a bug(?) in vscode-loader with
                    // require() not resolving in web once the script loads, so check manually
                    checkInterval.cancelAndSet(() => {
                        if (typeof vsda_web !== 'undefined') {
                            resolve();
                        }
                    }, 50);
                }).finally(() => checkInterval.dispose()),
            ]);
            const keyBytes = new TextEncoder().encode(this.f.serverLicense?.join('\n') || '');
            for (let i = 0; i + STEP_SIZE < keyBytes.length; i += STEP_SIZE) {
                const key = await crypto.subtle.importKey('raw', keyBytes.slice(i + IV_SIZE, i + IV_SIZE + KEY_SIZE), { name: 'AES-CBC' }, false, ['decrypt']);
                wasm = await crypto.subtle.decrypt({ name: 'AES-CBC', iv: keyBytes.slice(i, i + IV_SIZE) }, key, wasm);
            }
            await vsda_web.default(wasm);
            return vsda_web;
        }
        async k() {
            const response = await fetch(network_1.$2f.asBrowserUri('vsda/../vsda_bg.wasm').toString(true));
            if (!response.ok) {
                throw new Error('error loading vsda');
            }
            return response.arrayBuffer();
        }
    };
    exports.$y2b = $y2b;
    __decorate([
        decorators_1.$6g
    ], $y2b.prototype, "j", null);
    exports.$y2b = $y2b = __decorate([
        __param(0, productService_1.$kj)
    ], $y2b);
});
//# sourceMappingURL=signService.js.map