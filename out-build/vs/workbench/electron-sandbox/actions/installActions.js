/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls!vs/workbench/electron-sandbox/actions/installActions", "vs/platform/actions/common/actions", "vs/platform/product/common/product", "vs/platform/dialogs/common/dialogs", "vs/platform/native/common/native", "vs/base/common/errorMessage", "vs/platform/product/common/productService"], function (require, exports, nls_1, actions_1, product_1, dialogs_1, native_1, errorMessage_1, productService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$u_b = exports.$t_b = void 0;
    const shellCommandCategory = { value: (0, nls_1.localize)(0, null), original: 'Shell Command' };
    class $t_b extends actions_1.$Wu {
        constructor() {
            super({
                id: 'workbench.action.installCommandLine',
                title: {
                    value: (0, nls_1.localize)(1, null, product_1.default.applicationName),
                    original: `Install \'${product_1.default.applicationName}\' command in PATH`
                },
                category: shellCommandCategory,
                f1: true
            });
        }
        async run(accessor) {
            const nativeHostService = accessor.get(native_1.$05b);
            const dialogService = accessor.get(dialogs_1.$oA);
            const productService = accessor.get(productService_1.$kj);
            try {
                await nativeHostService.installShellCommand();
                dialogService.info((0, nls_1.localize)(2, null, productService.applicationName));
            }
            catch (error) {
                dialogService.error((0, errorMessage_1.$mi)(error));
            }
        }
    }
    exports.$t_b = $t_b;
    class $u_b extends actions_1.$Wu {
        constructor() {
            super({
                id: 'workbench.action.uninstallCommandLine',
                title: {
                    value: (0, nls_1.localize)(3, null, product_1.default.applicationName),
                    original: `Uninstall \'${product_1.default.applicationName}\' command from PATH`
                },
                category: shellCommandCategory,
                f1: true
            });
        }
        async run(accessor) {
            const nativeHostService = accessor.get(native_1.$05b);
            const dialogService = accessor.get(dialogs_1.$oA);
            const productService = accessor.get(productService_1.$kj);
            try {
                await nativeHostService.uninstallShellCommand();
                dialogService.info((0, nls_1.localize)(4, null, productService.applicationName));
            }
            catch (error) {
                dialogService.error((0, errorMessage_1.$mi)(error));
            }
        }
    }
    exports.$u_b = $u_b;
});
//# sourceMappingURL=installActions.js.map