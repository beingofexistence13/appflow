/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls", "vs/platform/actions/common/actions", "vs/platform/product/common/product", "vs/platform/dialogs/common/dialogs", "vs/platform/native/common/native", "vs/base/common/errorMessage", "vs/platform/product/common/productService"], function (require, exports, nls_1, actions_1, product_1, dialogs_1, native_1, errorMessage_1, productService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.UninstallShellScriptAction = exports.InstallShellScriptAction = void 0;
    const shellCommandCategory = { value: (0, nls_1.localize)('shellCommand', "Shell Command"), original: 'Shell Command' };
    class InstallShellScriptAction extends actions_1.Action2 {
        constructor() {
            super({
                id: 'workbench.action.installCommandLine',
                title: {
                    value: (0, nls_1.localize)('install', "Install '{0}' command in PATH", product_1.default.applicationName),
                    original: `Install \'${product_1.default.applicationName}\' command in PATH`
                },
                category: shellCommandCategory,
                f1: true
            });
        }
        async run(accessor) {
            const nativeHostService = accessor.get(native_1.INativeHostService);
            const dialogService = accessor.get(dialogs_1.IDialogService);
            const productService = accessor.get(productService_1.IProductService);
            try {
                await nativeHostService.installShellCommand();
                dialogService.info((0, nls_1.localize)('successIn', "Shell command '{0}' successfully installed in PATH.", productService.applicationName));
            }
            catch (error) {
                dialogService.error((0, errorMessage_1.toErrorMessage)(error));
            }
        }
    }
    exports.InstallShellScriptAction = InstallShellScriptAction;
    class UninstallShellScriptAction extends actions_1.Action2 {
        constructor() {
            super({
                id: 'workbench.action.uninstallCommandLine',
                title: {
                    value: (0, nls_1.localize)('uninstall', "Uninstall '{0}' command from PATH", product_1.default.applicationName),
                    original: `Uninstall \'${product_1.default.applicationName}\' command from PATH`
                },
                category: shellCommandCategory,
                f1: true
            });
        }
        async run(accessor) {
            const nativeHostService = accessor.get(native_1.INativeHostService);
            const dialogService = accessor.get(dialogs_1.IDialogService);
            const productService = accessor.get(productService_1.IProductService);
            try {
                await nativeHostService.uninstallShellCommand();
                dialogService.info((0, nls_1.localize)('successFrom', "Shell command '{0}' successfully uninstalled from PATH.", productService.applicationName));
            }
            catch (error) {
                dialogService.error((0, errorMessage_1.toErrorMessage)(error));
            }
        }
    }
    exports.UninstallShellScriptAction = UninstallShellScriptAction;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5zdGFsbEFjdGlvbnMuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvZWxlY3Ryb24tc2FuZGJveC9hY3Rpb25zL2luc3RhbGxBY3Rpb25zLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQVloRyxNQUFNLG9CQUFvQixHQUFxQixFQUFFLEtBQUssRUFBRSxJQUFBLGNBQVEsRUFBQyxjQUFjLEVBQUUsZUFBZSxDQUFDLEVBQUUsUUFBUSxFQUFFLGVBQWUsRUFBRSxDQUFDO0lBRS9ILE1BQWEsd0JBQXlCLFNBQVEsaUJBQU87UUFFcEQ7WUFDQyxLQUFLLENBQUM7Z0JBQ0wsRUFBRSxFQUFFLHFDQUFxQztnQkFDekMsS0FBSyxFQUFFO29CQUNOLEtBQUssRUFBRSxJQUFBLGNBQVEsRUFBQyxTQUFTLEVBQUUsK0JBQStCLEVBQUUsaUJBQU8sQ0FBQyxlQUFlLENBQUM7b0JBQ3BGLFFBQVEsRUFBRSxhQUFhLGlCQUFPLENBQUMsZUFBZSxvQkFBb0I7aUJBQ2xFO2dCQUNELFFBQVEsRUFBRSxvQkFBb0I7Z0JBQzlCLEVBQUUsRUFBRSxJQUFJO2FBQ1IsQ0FBQyxDQUFDO1FBQ0osQ0FBQztRQUVELEtBQUssQ0FBQyxHQUFHLENBQUMsUUFBMEI7WUFDbkMsTUFBTSxpQkFBaUIsR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLDJCQUFrQixDQUFDLENBQUM7WUFDM0QsTUFBTSxhQUFhLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQyx3QkFBYyxDQUFDLENBQUM7WUFDbkQsTUFBTSxjQUFjLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQyxnQ0FBZSxDQUFDLENBQUM7WUFFckQsSUFBSTtnQkFDSCxNQUFNLGlCQUFpQixDQUFDLG1CQUFtQixFQUFFLENBQUM7Z0JBRTlDLGFBQWEsQ0FBQyxJQUFJLENBQUMsSUFBQSxjQUFRLEVBQUMsV0FBVyxFQUFFLHFEQUFxRCxFQUFFLGNBQWMsQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDO2FBQ2pJO1lBQUMsT0FBTyxLQUFLLEVBQUU7Z0JBQ2YsYUFBYSxDQUFDLEtBQUssQ0FBQyxJQUFBLDZCQUFjLEVBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQzthQUMzQztRQUNGLENBQUM7S0FDRDtJQTNCRCw0REEyQkM7SUFFRCxNQUFhLDBCQUEyQixTQUFRLGlCQUFPO1FBRXREO1lBQ0MsS0FBSyxDQUFDO2dCQUNMLEVBQUUsRUFBRSx1Q0FBdUM7Z0JBQzNDLEtBQUssRUFBRTtvQkFDTixLQUFLLEVBQUUsSUFBQSxjQUFRLEVBQUMsV0FBVyxFQUFFLG1DQUFtQyxFQUFFLGlCQUFPLENBQUMsZUFBZSxDQUFDO29CQUMxRixRQUFRLEVBQUUsZUFBZSxpQkFBTyxDQUFDLGVBQWUsc0JBQXNCO2lCQUN0RTtnQkFDRCxRQUFRLEVBQUUsb0JBQW9CO2dCQUM5QixFQUFFLEVBQUUsSUFBSTthQUNSLENBQUMsQ0FBQztRQUNKLENBQUM7UUFFRCxLQUFLLENBQUMsR0FBRyxDQUFDLFFBQTBCO1lBQ25DLE1BQU0saUJBQWlCLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQywyQkFBa0IsQ0FBQyxDQUFDO1lBQzNELE1BQU0sYUFBYSxHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMsd0JBQWMsQ0FBQyxDQUFDO1lBQ25ELE1BQU0sY0FBYyxHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMsZ0NBQWUsQ0FBQyxDQUFDO1lBRXJELElBQUk7Z0JBQ0gsTUFBTSxpQkFBaUIsQ0FBQyxxQkFBcUIsRUFBRSxDQUFDO2dCQUVoRCxhQUFhLENBQUMsSUFBSSxDQUFDLElBQUEsY0FBUSxFQUFDLGFBQWEsRUFBRSx5REFBeUQsRUFBRSxjQUFjLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQzthQUN2STtZQUFDLE9BQU8sS0FBSyxFQUFFO2dCQUNmLGFBQWEsQ0FBQyxLQUFLLENBQUMsSUFBQSw2QkFBYyxFQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7YUFDM0M7UUFDRixDQUFDO0tBQ0Q7SUEzQkQsZ0VBMkJDIn0=