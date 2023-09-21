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
define(["require", "exports", "vs/base/common/uuid", "vs/workbench/api/common/extHostRpcService", "vs/workbench/api/common/extHostTerminalService", "vs/workbench/api/common/extHostCommands"], function (require, exports, uuid_1, extHostRpcService_1, extHostTerminalService_1, extHostCommands_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ExtHostTerminalService = void 0;
    let ExtHostTerminalService = class ExtHostTerminalService extends extHostTerminalService_1.BaseExtHostTerminalService {
        constructor(extHostCommands, extHostRpc) {
            super(true, extHostCommands, extHostRpc);
        }
        createTerminal(name, shellPath, shellArgs) {
            return this.createTerminalFromOptions({ name, shellPath, shellArgs });
        }
        createTerminalFromOptions(options, internalOptions) {
            const terminal = new extHostTerminalService_1.ExtHostTerminal(this._proxy, (0, uuid_1.generateUuid)(), options, options.name);
            this._terminals.push(terminal);
            terminal.create(options, this._serializeParentTerminal(options, internalOptions));
            return terminal.value;
        }
    };
    exports.ExtHostTerminalService = ExtHostTerminalService;
    exports.ExtHostTerminalService = ExtHostTerminalService = __decorate([
        __param(0, extHostCommands_1.IExtHostCommands),
        __param(1, extHostRpcService_1.IExtHostRpcService)
    ], ExtHostTerminalService);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0SG9zdFRlcm1pbmFsU2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9hcGkvbm9kZS9leHRIb3N0VGVybWluYWxTZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQVF6RixJQUFNLHNCQUFzQixHQUE1QixNQUFNLHNCQUF1QixTQUFRLG1EQUEwQjtRQUVyRSxZQUNtQixlQUFpQyxFQUMvQixVQUE4QjtZQUVsRCxLQUFLLENBQUMsSUFBSSxFQUFFLGVBQWUsRUFBRSxVQUFVLENBQUMsQ0FBQztRQUMxQyxDQUFDO1FBRU0sY0FBYyxDQUFDLElBQWEsRUFBRSxTQUFrQixFQUFFLFNBQTZCO1lBQ3JGLE9BQU8sSUFBSSxDQUFDLHlCQUF5QixDQUFDLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRSxTQUFTLEVBQUUsQ0FBQyxDQUFDO1FBQ3ZFLENBQUM7UUFFTSx5QkFBeUIsQ0FBQyxPQUErQixFQUFFLGVBQTBDO1lBQzNHLE1BQU0sUUFBUSxHQUFHLElBQUksd0NBQWUsQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLElBQUEsbUJBQVksR0FBRSxFQUFFLE9BQU8sRUFBRSxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDekYsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDL0IsUUFBUSxDQUFDLE1BQU0sQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLHdCQUF3QixDQUFDLE9BQU8sRUFBRSxlQUFlLENBQUMsQ0FBQyxDQUFDO1lBQ2xGLE9BQU8sUUFBUSxDQUFDLEtBQUssQ0FBQztRQUN2QixDQUFDO0tBQ0QsQ0FBQTtJQW5CWSx3REFBc0I7cUNBQXRCLHNCQUFzQjtRQUdoQyxXQUFBLGtDQUFnQixDQUFBO1FBQ2hCLFdBQUEsc0NBQWtCLENBQUE7T0FKUixzQkFBc0IsQ0FtQmxDIn0=