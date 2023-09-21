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
    exports.$hdc = void 0;
    let $hdc = class $hdc extends extHostTerminalService_1.$Gbc {
        constructor(extHostCommands, extHostRpc) {
            super(true, extHostCommands, extHostRpc);
        }
        createTerminal(name, shellPath, shellArgs) {
            return this.createTerminalFromOptions({ name, shellPath, shellArgs });
        }
        createTerminalFromOptions(options, internalOptions) {
            const terminal = new extHostTerminalService_1.$Fbc(this.a, (0, uuid_1.$4f)(), options, options.name);
            this.f.push(terminal);
            terminal.create(options, this.R(options, internalOptions));
            return terminal.value;
        }
    };
    exports.$hdc = $hdc;
    exports.$hdc = $hdc = __decorate([
        __param(0, extHostCommands_1.$lM),
        __param(1, extHostRpcService_1.$2L)
    ], $hdc);
});
//# sourceMappingURL=extHostTerminalService.js.map