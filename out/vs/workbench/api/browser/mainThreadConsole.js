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
define(["require", "exports", "vs/workbench/services/extensions/common/extHostCustomers", "vs/workbench/api/common/extHost.protocol", "vs/platform/environment/common/environment", "vs/base/common/console", "vs/workbench/services/extensions/common/remoteConsoleUtil", "vs/workbench/services/extensions/common/extensionDevOptions", "vs/platform/log/common/log"], function (require, exports, extHostCustomers_1, extHost_protocol_1, environment_1, console_1, remoteConsoleUtil_1, extensionDevOptions_1, log_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MainThreadConsole = void 0;
    let MainThreadConsole = class MainThreadConsole {
        constructor(_extHostContext, _environmentService, _logService) {
            this._environmentService = _environmentService;
            this._logService = _logService;
            const devOpts = (0, extensionDevOptions_1.parseExtensionDevOptions)(this._environmentService);
            this._isExtensionDevTestFromCli = devOpts.isExtensionDevTestFromCli;
        }
        dispose() {
            //
        }
        $logExtensionHostMessage(entry) {
            if (this._isExtensionDevTestFromCli) {
                // If running tests from cli, log to the log service everything
                (0, remoteConsoleUtil_1.logRemoteEntry)(this._logService, entry);
            }
            else {
                // Log to the log service only errors and log everything to local console
                (0, remoteConsoleUtil_1.logRemoteEntryIfError)(this._logService, entry, 'Extension Host');
                (0, console_1.log)(entry, 'Extension Host');
            }
        }
    };
    exports.MainThreadConsole = MainThreadConsole;
    exports.MainThreadConsole = MainThreadConsole = __decorate([
        (0, extHostCustomers_1.extHostNamedCustomer)(extHost_protocol_1.MainContext.MainThreadConsole),
        __param(1, environment_1.IEnvironmentService),
        __param(2, log_1.ILogService)
    ], MainThreadConsole);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpblRocmVhZENvbnNvbGUuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvYXBpL2Jyb3dzZXIvbWFpblRocmVhZENvbnNvbGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBV3pGLElBQU0saUJBQWlCLEdBQXZCLE1BQU0saUJBQWlCO1FBSTdCLFlBQ0MsZUFBZ0MsRUFDTSxtQkFBd0MsRUFDaEQsV0FBd0I7WUFEaEIsd0JBQW1CLEdBQW5CLG1CQUFtQixDQUFxQjtZQUNoRCxnQkFBVyxHQUFYLFdBQVcsQ0FBYTtZQUV0RCxNQUFNLE9BQU8sR0FBRyxJQUFBLDhDQUF3QixFQUFDLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDO1lBQ25FLElBQUksQ0FBQywwQkFBMEIsR0FBRyxPQUFPLENBQUMseUJBQXlCLENBQUM7UUFDckUsQ0FBQztRQUVELE9BQU87WUFDTixFQUFFO1FBQ0gsQ0FBQztRQUVELHdCQUF3QixDQUFDLEtBQXdCO1lBQ2hELElBQUksSUFBSSxDQUFDLDBCQUEwQixFQUFFO2dCQUNwQywrREFBK0Q7Z0JBQy9ELElBQUEsa0NBQWMsRUFBQyxJQUFJLENBQUMsV0FBVyxFQUFFLEtBQUssQ0FBQyxDQUFDO2FBQ3hDO2lCQUFNO2dCQUNOLHlFQUF5RTtnQkFDekUsSUFBQSx5Q0FBcUIsRUFBQyxJQUFJLENBQUMsV0FBVyxFQUFFLEtBQUssRUFBRSxnQkFBZ0IsQ0FBQyxDQUFDO2dCQUNqRSxJQUFBLGFBQUcsRUFBQyxLQUFLLEVBQUUsZ0JBQWdCLENBQUMsQ0FBQzthQUM3QjtRQUNGLENBQUM7S0FDRCxDQUFBO0lBM0JZLDhDQUFpQjtnQ0FBakIsaUJBQWlCO1FBRDdCLElBQUEsdUNBQW9CLEVBQUMsOEJBQVcsQ0FBQyxpQkFBaUIsQ0FBQztRQU9qRCxXQUFBLGlDQUFtQixDQUFBO1FBQ25CLFdBQUEsaUJBQVcsQ0FBQTtPQVBELGlCQUFpQixDQTJCN0IifQ==