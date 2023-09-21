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
define(["require", "exports", "vs/platform/workspace/common/workspace", "vs/workbench/services/configuration/common/jsonEditing", "vs/platform/workspaces/common/workspaces", "vs/platform/commands/common/commands", "vs/platform/notification/common/notification", "vs/platform/files/common/files", "vs/workbench/services/environment/common/environmentService", "vs/platform/dialogs/common/dialogs", "vs/workbench/services/textfile/common/textfiles", "vs/workbench/services/host/browser/host", "vs/workbench/services/workspaces/browser/abstractWorkspaceEditingService", "vs/workbench/services/workspaces/common/workspaceEditing", "vs/platform/instantiation/common/extensions", "vs/platform/uriIdentity/common/uriIdentity", "vs/platform/workspace/common/workspaceTrust", "vs/workbench/services/configuration/common/configuration", "vs/platform/userDataProfile/common/userDataProfile", "vs/workbench/services/userDataProfile/common/userDataProfile"], function (require, exports, workspace_1, jsonEditing_1, workspaces_1, commands_1, notification_1, files_1, environmentService_1, dialogs_1, textfiles_1, host_1, abstractWorkspaceEditingService_1, workspaceEditing_1, extensions_1, uriIdentity_1, workspaceTrust_1, configuration_1, userDataProfile_1, userDataProfile_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$93b = void 0;
    let $93b = class $93b extends abstractWorkspaceEditingService_1.$83b {
        constructor(jsonEditingService, contextService, configurationService, notificationService, commandService, fileService, textFileService, workspacesService, environmentService, fileDialogService, dialogService, hostService, uriIdentityService, workspaceTrustManagementService, userDataProfilesService, userDataProfileService) {
            super(jsonEditingService, contextService, configurationService, notificationService, commandService, fileService, textFileService, workspacesService, environmentService, fileDialogService, dialogService, hostService, uriIdentityService, workspaceTrustManagementService, userDataProfilesService, userDataProfileService);
        }
        async enterWorkspace(workspaceUri) {
            const result = await this.A(workspaceUri);
            if (result) {
                // Open workspace in same window
                await this.m.openWindow([{ workspaceUri }], { forceReuseWindow: true });
            }
        }
    };
    exports.$93b = $93b;
    exports.$93b = $93b = __decorate([
        __param(0, jsonEditing_1.$$fb),
        __param(1, workspace_1.$Kh),
        __param(2, configuration_1.$mE),
        __param(3, notification_1.$Yu),
        __param(4, commands_1.$Fr),
        __param(5, files_1.$6j),
        __param(6, textfiles_1.$JD),
        __param(7, workspaces_1.$fU),
        __param(8, environmentService_1.$hJ),
        __param(9, dialogs_1.$qA),
        __param(10, dialogs_1.$oA),
        __param(11, host_1.$VT),
        __param(12, uriIdentity_1.$Ck),
        __param(13, workspaceTrust_1.$$z),
        __param(14, userDataProfile_1.$Ek),
        __param(15, userDataProfile_2.$CJ)
    ], $93b);
    (0, extensions_1.$mr)(workspaceEditing_1.$pU, $93b, 1 /* InstantiationType.Delayed */);
});
//# sourceMappingURL=workspaceEditingService.js.map