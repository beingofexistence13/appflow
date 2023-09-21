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
define(["require", "exports", "vs/platform/workspaces/common/workspaces", "vs/platform/ipc/common/mainProcessService", "vs/platform/instantiation/common/extensions", "vs/base/parts/ipc/common/ipc", "vs/platform/native/common/native"], function (require, exports, workspaces_1, mainProcessService_1, extensions_1, ipc_1, native_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$z_b = void 0;
    // @ts-ignore: interface is implemented via proxy
    let $z_b = class $z_b {
        constructor(mainProcessService, nativeHostService) {
            return ipc_1.ProxyChannel.toService(mainProcessService.getChannel('workspaces'), { context: nativeHostService.windowId });
        }
    };
    exports.$z_b = $z_b;
    exports.$z_b = $z_b = __decorate([
        __param(0, mainProcessService_1.$o7b),
        __param(1, native_1.$05b)
    ], $z_b);
    (0, extensions_1.$mr)(workspaces_1.$fU, $z_b, 1 /* InstantiationType.Delayed */);
});
//# sourceMappingURL=workspacesService.js.map