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
define(["require", "exports", "vs/workbench/api/common/extHostConsoleForwarder", "vs/workbench/api/common/extHostInitDataService", "vs/workbench/api/common/extHostRpcService"], function (require, exports, extHostConsoleForwarder_1, extHostInitDataService_1, extHostRpcService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$jfc = void 0;
    let $jfc = class $jfc extends extHostConsoleForwarder_1.$cdc {
        constructor(extHostRpc, initData) {
            super(extHostRpc, initData);
        }
        f(method, original, args) {
            original.apply(console, args);
        }
    };
    exports.$jfc = $jfc;
    exports.$jfc = $jfc = __decorate([
        __param(0, extHostRpcService_1.$2L),
        __param(1, extHostInitDataService_1.$fM)
    ], $jfc);
});
//# sourceMappingURL=extHostConsoleForwarder.js.map