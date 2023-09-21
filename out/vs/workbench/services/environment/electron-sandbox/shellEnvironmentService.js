/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/instantiation/common/instantiation", "vs/base/parts/sandbox/electron-sandbox/globals", "vs/platform/instantiation/common/extensions"], function (require, exports, instantiation_1, globals_1, extensions_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ShellEnvironmentService = exports.IShellEnvironmentService = void 0;
    exports.IShellEnvironmentService = (0, instantiation_1.createDecorator)('shellEnvironmentService');
    class ShellEnvironmentService {
        getShellEnv() {
            return globals_1.process.shellEnv();
        }
    }
    exports.ShellEnvironmentService = ShellEnvironmentService;
    (0, extensions_1.registerSingleton)(exports.IShellEnvironmentService, ShellEnvironmentService, 1 /* InstantiationType.Delayed */);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2hlbGxFbnZpcm9ubWVudFNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvc2VydmljZXMvZW52aXJvbm1lbnQvZWxlY3Ryb24tc2FuZGJveC9zaGVsbEVudmlyb25tZW50U2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFPbkYsUUFBQSx3QkFBd0IsR0FBRyxJQUFBLCtCQUFlLEVBQTJCLHlCQUF5QixDQUFDLENBQUM7SUFTN0csTUFBYSx1QkFBdUI7UUFJbkMsV0FBVztZQUNWLE9BQU8saUJBQU8sQ0FBQyxRQUFRLEVBQUUsQ0FBQztRQUMzQixDQUFDO0tBQ0Q7SUFQRCwwREFPQztJQUVELElBQUEsOEJBQWlCLEVBQUMsZ0NBQXdCLEVBQUUsdUJBQXVCLG9DQUE0QixDQUFDIn0=