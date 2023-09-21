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
define(["require", "exports", "vs/nls", "vs/base/common/date", "vs/base/common/platform", "vs/platform/clipboard/common/clipboardService", "vs/platform/dialogs/common/dialogs", "vs/platform/log/common/log", "vs/platform/native/common/native", "vs/platform/product/common/productService", "vs/base/parts/sandbox/electron-sandbox/globals"], function (require, exports, nls_1, date_1, platform_1, clipboardService_1, dialogs_1, log_1, native_1, productService_1, globals_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.NativeDialogHandler = void 0;
    let NativeDialogHandler = class NativeDialogHandler extends dialogs_1.AbstractDialogHandler {
        constructor(logService, nativeHostService, productService, clipboardService) {
            super();
            this.logService = logService;
            this.nativeHostService = nativeHostService;
            this.productService = productService;
            this.clipboardService = clipboardService;
        }
        async prompt(prompt) {
            this.logService.trace('DialogService#prompt', prompt.message);
            const buttons = this.getPromptButtons(prompt);
            const { response, checkboxChecked } = await this.nativeHostService.showMessageBox({
                type: this.getDialogType(prompt.type),
                title: prompt.title,
                message: prompt.message,
                detail: prompt.detail,
                buttons,
                cancelId: prompt.cancelButton ? buttons.length - 1 : -1 /* Disabled */,
                checkboxLabel: prompt.checkbox?.label,
                checkboxChecked: prompt.checkbox?.checked
            });
            return this.getPromptResult(prompt, response, checkboxChecked);
        }
        async confirm(confirmation) {
            this.logService.trace('DialogService#confirm', confirmation.message);
            const buttons = this.getConfirmationButtons(confirmation);
            const { response, checkboxChecked } = await this.nativeHostService.showMessageBox({
                type: this.getDialogType(confirmation.type) ?? 'question',
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
            let version = this.productService.version;
            if (this.productService.target) {
                version = `${version} (${this.productService.target} setup)`;
            }
            else if (this.productService.darwinUniversalAssetId) {
                version = `${version} (Universal)`;
            }
            const osProps = await this.nativeHostService.getOSProperties();
            const detailString = (useAgo) => {
                return (0, nls_1.localize)({ key: 'aboutDetail', comment: ['Electron, Chromium, Node.js and V8 are product names that need no translation'] }, "Version: {0}\nCommit: {1}\nDate: {2}\nElectron: {3}\nElectronBuildId: {4}\nChromium: {5}\nNode.js: {6}\nV8: {7}\nOS: {8}", version, this.productService.commit || 'Unknown', this.productService.date ? `${this.productService.date}${useAgo ? ' (' + (0, date_1.fromNow)(new Date(this.productService.date), true) + ')' : ''}` : 'Unknown', globals_1.process.versions['electron'], globals_1.process.versions['microsoft-build'], globals_1.process.versions['chrome'], globals_1.process.versions['node'], globals_1.process.versions['v8'], `${osProps.type} ${osProps.arch} ${osProps.release}${platform_1.isLinuxSnap ? ' snap' : ''}`);
            };
            const detail = detailString(true);
            const detailToCopy = detailString(false);
            const { response } = await this.nativeHostService.showMessageBox({
                type: 'info',
                message: this.productService.nameLong,
                detail: `\n${detail}`,
                buttons: [
                    (0, nls_1.localize)({ key: 'copy', comment: ['&& denotes a mnemonic'] }, "&&Copy"),
                    (0, nls_1.localize)('okButton', "OK")
                ]
            });
            if (response === 0) {
                this.clipboardService.writeText(detailToCopy);
            }
        }
    };
    exports.NativeDialogHandler = NativeDialogHandler;
    exports.NativeDialogHandler = NativeDialogHandler = __decorate([
        __param(0, log_1.ILogService),
        __param(1, native_1.INativeHostService),
        __param(2, productService_1.IProductService),
        __param(3, clipboardService_1.IClipboardService)
    ], NativeDialogHandler);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGlhbG9nSGFuZGxlci5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9lbGVjdHJvbi1zYW5kYm94L3BhcnRzL2RpYWxvZ3MvZGlhbG9nSGFuZGxlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUFZekYsSUFBTSxtQkFBbUIsR0FBekIsTUFBTSxtQkFBb0IsU0FBUSwrQkFBcUI7UUFFN0QsWUFDK0IsVUFBdUIsRUFDaEIsaUJBQXFDLEVBQ3hDLGNBQStCLEVBQzdCLGdCQUFtQztZQUV2RSxLQUFLLEVBQUUsQ0FBQztZQUxzQixlQUFVLEdBQVYsVUFBVSxDQUFhO1lBQ2hCLHNCQUFpQixHQUFqQixpQkFBaUIsQ0FBb0I7WUFDeEMsbUJBQWMsR0FBZCxjQUFjLENBQWlCO1lBQzdCLHFCQUFnQixHQUFoQixnQkFBZ0IsQ0FBbUI7UUFHeEUsQ0FBQztRQUVELEtBQUssQ0FBQyxNQUFNLENBQUksTUFBa0I7WUFDakMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsc0JBQXNCLEVBQUUsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBRTlELE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUU5QyxNQUFNLEVBQUUsUUFBUSxFQUFFLGVBQWUsRUFBRSxHQUFHLE1BQU0sSUFBSSxDQUFDLGlCQUFpQixDQUFDLGNBQWMsQ0FBQztnQkFDakYsSUFBSSxFQUFFLElBQUksQ0FBQyxhQUFhLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQztnQkFDckMsS0FBSyxFQUFFLE1BQU0sQ0FBQyxLQUFLO2dCQUNuQixPQUFPLEVBQUUsTUFBTSxDQUFDLE9BQU87Z0JBQ3ZCLE1BQU0sRUFBRSxNQUFNLENBQUMsTUFBTTtnQkFDckIsT0FBTztnQkFDUCxRQUFRLEVBQUUsTUFBTSxDQUFDLFlBQVks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