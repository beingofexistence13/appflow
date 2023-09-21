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
define(["require", "exports", "vs/nls!vs/workbench/electron-sandbox/parts/dialogs/dialogHandler", "vs/base/common/date", "vs/base/common/platform", "vs/platform/clipboard/common/clipboardService", "vs/platform/dialogs/common/dialogs", "vs/platform/log/common/log", "vs/platform/native/common/native", "vs/platform/product/common/productService", "vs/base/parts/sandbox/electron-sandbox/globals"], function (require, exports, nls_1, date_1, platform_1, clipboardService_1, dialogs_1, log_1, native_1, productService_1, globals_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$v_b = void 0;
    let $v_b = class $v_b extends dialogs_1.$pA {
        constructor(g, h, i, j) {
            super();
            this.g = g;
            this.h = h;
            this.i = i;
            this.j = j;
        }
        async prompt(prompt) {
            this.g.trace('DialogService#prompt', prompt.message);
            const buttons = this.b(prompt);
            const { response, checkboxChecked } = await this.h.showMessageBox({
                type: this.e(prompt.type),
                title: prompt.title,
                message: prompt.message,
                detail: prompt.detail,
                buttons,
                cancelId: prompt.cancelButton ? buttons.length - 1 : -1 /* Disabled */,
                checkboxLabel: prompt.checkbox?.label,
                checkboxChecked: prompt.checkbox?.checked
            });
            return this.f(prompt, response, checkboxChecked);
        }
        async confirm(confirmation) {
            this.g.trace('DialogService#confirm', confirmation.message);
            const buttons = this.a(confirmation);
            const { response, checkboxChecked } = await this.h.showMessageBox({
                type: this.e(confirmation.type) ?? 'question',
                title: confirmation.title,
                message: confirmation.message,
                detail: confirmation.detail,
                buttons,
                cancelId: buttons.length - 1,
                checkboxLabel: confirmation.checkbox?.label,
                checkboxChecked: confirmation.checkbox?.checked
            });
            return { confirmed: response === 0, checkboxChecked };
        }
        input() {
            throw new Error('Unsupported'); // we have no native API for password dialogs in Electron
        }
        async about() {
            let version = this.i.version;
            if (this.i.target) {
                version = `${version} (${this.i.target} setup)`;
            }
            else if (this.i.darwinUniversalAssetId) {
                version = `${version} (Universal)`;
            }
            const osProps = await this.h.getOSProperties();
            const detailString = (useAgo) => {
                return (0, nls_1.localize)(0, null, version, this.i.commit || 'Unknown', this.i.date ? `${this.i.date}${useAgo ? ' (' + (0, date_1.$6l)(new Date(this.i.date), true) + ')' : ''}` : 'Unknown', globals_1.$P.versions['electron'], globals_1.$P.versions['microsoft-build'], globals_1.$P.versions['chrome'], globals_1.$P.versions['node'], globals_1.$P.versions['v8'], `${osProps.type} ${osProps.arch} ${osProps.release}${platform_1.$l ? ' snap' : ''}`);
            };
            const detail = detailString(true);
            const detailToCopy = detailString(false);
            const { response } = await this.h.showMessageBox({
                type: 'info',
                message: this.i.nameLong,
                detail: `\n${detail}`,
                buttons: [
                    (0, nls_1.localize)(1, null),
                    (0, nls_1.localize)(2, null)
                ]
            });
            if (response === 0) {
                this.j.writeText(detailToCopy);
            }
        }
    };
    exports.$v_b = $v_b;
    exports.$v_b = $v_b = __decorate([
        __param(0, log_1.$5i),
        __param(1, native_1.$05b),
        __param(2, productService_1.$kj),
        __param(3, clipboardService_1.$UZ)
    ], $v_b);
});
//# sourceMappingURL=dialogHandler.js.map