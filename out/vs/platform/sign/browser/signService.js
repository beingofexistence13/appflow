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
    exports.SignService = void 0;
    const KEY_SIZE = 32;
    const IV_SIZE = 16;
    const STEP_SIZE = KEY_SIZE + IV_SIZE;
    let SignService = class SignService extends abstractSignService_1.AbstractSignService {
        constructor(productService) {
            super();
            this.productService = productService;
        }
        getValidator() {
            return this.vsda().then(vsda => {
                const v = new vsda.validator();
                return {
                    createNewMessage: arg => v.createNewMessage(arg),
                    validate: arg => v.validate(arg),
                    dispose: () => v.free(),
                };
            });
        }
        signValue(arg) {
            return this.vsda().then(vsda => vsda.sign(arg));
        }
        async vsda() {
            const checkInterval = new async_1.IntervalTimer();
            let [wasm] = await Promise.all([
                this.getWasmBytes(),
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
            const keyBytes = new TextEncoder().encode(this.productService.serverLicense?.join('\n') || '');
            for (let i = 0; i + STEP_SIZE < keyBytes.length; i += STEP_SIZE) {
                const key = await crypto.subtle.importKey('raw', keyBytes.slice(i + IV_SIZE, i + IV_SIZE + KEY_SIZE), { name: 'AES-CBC' }, false, ['decrypt']);
                wasm = await crypto.subtle.decrypt({ name: 'AES-CBC', iv: keyBytes.slice(i, i + IV_SIZE) }, key, wasm);
            }
            await vsda_web.default(wasm);
            return vsda_web;
        }
        async getWasmBytes() {
            const response = await fetch(network_1.FileAccess.asBrowserUri('vsda/../vsda_bg.wasm').toString(true));
            if (!response.ok) {
                throw new Error('error loading vsda');
            }
            return response.arrayBuffer();
        }
    };
    exports.SignService = SignService;
    __decorate([
        decorators_1.memoize
    ], SignService.prototype, "vsda", null);
    exports.SignService = SignService = __decorate([
        __param(0, productService_1.IProductService)
    ], SignService);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2lnblNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9wbGF0Zm9ybS9zaWduL2Jyb3dzZXIvc2lnblNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBK0JoRyxNQUFNLFFBQVEsR0FBRyxFQUFFLENBQUM7SUFDcEIsTUFBTSxPQUFPLEdBQUcsRUFBRSxDQUFDO0lBQ25CLE1BQU0sU0FBUyxHQUFHLFFBQVEsR0FBRyxPQUFPLENBQUM7SUFFOUIsSUFBTSxXQUFXLEdBQWpCLE1BQU0sV0FBWSxTQUFRLHlDQUFtQjtRQUNuRCxZQUE4QyxjQUErQjtZQUM1RSxLQUFLLEVBQUUsQ0FBQztZQURxQyxtQkFBYyxHQUFkLGNBQWMsQ0FBaUI7UUFFN0UsQ0FBQztRQUNrQixZQUFZO1lBQzlCLE9BQU8sSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRTtnQkFDOUIsTUFBTSxDQUFDLEdBQUcsSUFBSSxJQUFJLENBQUMsU0FBUyxFQUFFLENBQUM7Z0JBQy9CLE9BQU87b0JBQ04sZ0JBQWdCLEVBQUUsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsZ0JBQWdCLENBQUMsR0FBRyxDQUFDO29CQUNoRCxRQUFRLEVBQUUsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQztvQkFDaEMsT0FBTyxFQUFFLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUU7aUJBQ3ZCLENBQUM7WUFDSCxDQUFDLENBQUMsQ0FBQztRQUNKLENBQUM7UUFFa0IsU0FBUyxDQUFDLEdBQVc7WUFDdkMsT0FBTyxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FB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