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
define(["require", "exports", "vs/platform/instantiation/common/extensions", "vs/workbench/services/remote/common/remoteAgentService", "vs/workbench/services/environment/electron-sandbox/environmentService", "vs/workbench/services/path/common/pathService", "vs/platform/workspace/common/workspace"], function (require, exports, extensions_1, remoteAgentService_1, environmentService_1, pathService_1, workspace_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$P_b = void 0;
    let $P_b = class $P_b extends pathService_1.$zJ {
        constructor(remoteAgentService, environmentService, contextService) {
            super(environmentService.userHome, remoteAgentService, environmentService, contextService);
        }
    };
    exports.$P_b = $P_b;
    exports.$P_b = $P_b = __decorate([
        __param(0, remoteAgentService_1.$jm),
        __param(1, environmentService_1.$1$b),
        __param(2, workspace_1.$Kh)
    ], $P_b);
    (0, extensions_1.$mr)(pathService_1.$yJ, $P_b, 1 /* InstantiationType.Delayed */);
});
//# sourceMappingURL=pathService.js.map