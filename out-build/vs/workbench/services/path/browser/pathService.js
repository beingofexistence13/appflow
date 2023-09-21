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
define(["require", "exports", "vs/platform/instantiation/common/extensions", "vs/workbench/services/remote/common/remoteAgentService", "vs/workbench/services/path/common/pathService", "vs/base/common/uri", "vs/workbench/services/environment/common/environmentService", "vs/platform/workspace/common/workspace", "vs/base/common/arrays", "vs/base/common/resources"], function (require, exports, extensions_1, remoteAgentService_1, pathService_1, uri_1, environmentService_1, workspace_1, arrays_1, resources_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$e4b = void 0;
    let $e4b = class $e4b extends pathService_1.$zJ {
        constructor(remoteAgentService, environmentService, contextService) {
            super(guessLocalUserHome(environmentService, contextService), remoteAgentService, environmentService, contextService);
        }
    };
    exports.$e4b = $e4b;
    exports.$e4b = $e4b = __decorate([
        __param(0, remoteAgentService_1.$jm),
        __param(1, environmentService_1.$hJ),
        __param(2, workspace_1.$Kh)
    ], $e4b);
    function guessLocalUserHome(environmentService, contextService) {
        // In web we do not really have the concept of a "local" user home
        // but we still require it in many places as a fallback. As such,
        // we have to come up with a synthetic location derived from the
        // environment.
        const workspace = contextService.getWorkspace();
        const firstFolder = (0, arrays_1.$Mb)(workspace.folders);
        if (firstFolder) {
            return firstFolder.uri;
        }
        if (workspace.configuration) {
            return (0, resources_1.$hg)(workspace.configuration);
        }
        // This is not ideal because with a user home location of `/`, all paths
        // will potentially appear with `~/...`, but at this point we really do
        // not have any other good alternative.
        return uri_1.URI.from({
            scheme: pathService_1.$zJ.findDefaultUriScheme(environmentService, contextService),
            authority: environmentService.remoteAuthority,
            path: '/'
        });
    }
    (0, extensions_1.$mr)(pathService_1.$yJ, $e4b, 1 /* InstantiationType.Delayed */);
});
//# sourceMappingURL=pathService.js.map