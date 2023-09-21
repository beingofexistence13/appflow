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
define(["require", "exports", "vs/nls", "vs/base/common/lifecycle", "vs/platform/workspace/common/workspaceTrust", "vs/workbench/services/environment/common/environmentService", "vs/workbench/services/extensionManagement/common/extensionManagement", "vs/workbench/services/extensions/common/extensions", "vs/workbench/services/host/browser/host"], function (require, exports, nls_1, lifecycle_1, workspaceTrust_1, environmentService_1, extensionManagement_1, extensions_1, host_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ExtensionEnablementWorkspaceTrustTransitionParticipant = void 0;
    let ExtensionEnablementWorkspaceTrustTransitionParticipant = class ExtensionEnablementWorkspaceTrustTransitionParticipant extends lifecycle_1.Disposable {
        constructor(extensionService, hostService, environmentService, extensionEnablementService, workspaceTrustEnablementService, workspaceTrustManagementService) {
            super();
            if (workspaceTrustEnablementService.isWorkspaceTrustEnabled()) {
                // The extension enablement participant will be registered only after the
                // workspace trust state has been initialized. There is no need to execute
                // the participant as part of the initialization process, as the workspace
                // trust state is initialized before starting the extension host.
                workspaceTrustManagementService.workspaceTrustInitialized.then(() => {
                    const workspaceTrustTransitionParticipant = new class {
                        async participate(trusted) {
                            if (trusted) {
                                // Untrusted -> Trusted
                                await extensionEnablementService.updateExtensionsEnablementsWhenWorkspaceTrustChanges();
                            }
                            else {
                                // Trusted -> Untrusted
                                if (environmentService.remoteAuthority) {
                                    hostService.reload();
                                }
                                else {
                                    const stopped = await extensionService.stopExtensionHosts((0, nls_1.localize)('restartExtensionHost.reason', "Restarting extension host due to workspace trust change."));
                                    await extensionEnablementService.updateExtensionsEnablementsWhenWorkspaceTrustChanges();
                                    if (stopped) {
                                        extensionService.startExtensionHosts();
                                    }
                                }
                            }
                        }
                    };
                    // Execute BEFORE the workspace trust transition completes
                    this._register(workspaceTrustManagementService.addWorkspaceTrustTransitionParticipant(workspaceTrustTransitionParticipant));
                });
            }
        }
    };
    exports.ExtensionEnablementWorkspaceTrustTransitionParticipant = ExtensionEnablementWorkspaceTrustTransitionParticipant;
    exports.ExtensionEnablementWorkspaceTrustTransitionParticipant = ExtensionEnablementWorkspaceTrustTransitionParticipant = __decorate([
        __param(0, extensions_1.IExtensionService),
        __param(1, host_1.IHostService),
        __param(2, environmentService_1.IWorkbenchEnvironmentService),
        __param(3, extensionManagement_1.IWorkbenchExtensionEnablementService),
        __param(4, workspaceTrust_1.IWorkspaceTrustEnablementService),
        __param(5, workspaceTrust_1.IWorkspaceTrustManagementService)
    ], ExtensionEnablementWorkspaceTrustTransitionParticipant);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0ZW5zaW9uRW5hYmxlbWVudFdvcmtzcGFjZVRydXN0VHJhbnNpdGlvblBhcnRpY2lwYW50LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvZXh0ZW5zaW9ucy9icm93c2VyL2V4dGVuc2lvbkVuYWJsZW1lbnRXb3Jrc3BhY2VUcnVzdFRyYW5zaXRpb25QYXJ0aWNpcGFudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUFXekYsSUFBTSxzREFBc0QsR0FBNUQsTUFBTSxzREFBdUQsU0FBUSxzQkFBVTtRQUNyRixZQUNvQixnQkFBbUMsRUFDeEMsV0FBeUIsRUFDVCxrQkFBZ0QsRUFDeEMsMEJBQWdFLEVBQ3BFLCtCQUFpRSxFQUNqRSwrQkFBaUU7WUFFbkcsS0FBSyxFQUFFLENBQUM7WUFFUixJQUFJLCtCQUErQixDQUFDLHVCQUF1QixFQUFFLEVBQUU7Z0JBQzlELHlFQUF5RTtnQkFDekUsMEVBQTBFO2dCQUMxRSwwRUFBMEU7Z0JBQzFFLGlFQUFpRTtnQkFDakUsK0JBQStCLENBQUMseUJBQXlCLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRTtvQkFDbkUsTUFBTSxtQ0FBbUMsR0FBRyxJQUFJO3dCQUMvQyxLQUFLLENBQUMsV0FBVyxDQUFDLE9BQWdCOzRCQUNqQyxJQUFJLE9BQU8sRUFBRTtnQ0FDWix1QkFBdUI7Z0NBQ3ZCLE1BQU0sMEJBQTBCLENBQUMsb0RBQW9ELEVBQUUsQ0FBQzs2QkFDeEY7aUNBQU07Z0NBQ04sdUJBQXVCO2dDQUN2QixJQUFJLGtCQUFrQixDQUFDLGVBQWUsRUFBRTtvQ0FDdkMsV0FBVyxDQUFDLE1BQU0sRUFBRSxDQUFDO2lDQUNyQjtxQ0FBTTtvQ0FDTixNQUFNLE9BQU8sR0FBRyxNQUFNLGdCQUFnQixDQUFDLGtCQUFrQixDQUFDLElBQUEsY0FBUSxFQUFDLDZCQUE2QixFQUFFLDBEQUEwRCxDQUFDLENBQUMsQ0FBQztvQ0FDL0osTUFBTSwwQkFBMEIsQ0FBQyxvREFBb0QsRUFBRSxDQUFDO29DQUN4RixJQUFJLE9BQU8sRUFBRTt3Q0FDWixnQkFBZ0IsQ0FBQyxtQkFBbUIsRUFBRSxDQUFDO3FDQUN2QztpQ0FDRDs2QkFDRDt3QkFDRixDQUFDO3FCQUNELENBQUM7b0JBRUYsMERBQTBEO29CQUMxRCxJQUFJLENBQUMsU0FBUyxDQUFDLCtCQUErQixDQUFDLHNDQUFzQyxDQUFDLG1DQUFtQyxDQUFDLENBQUMsQ0FBQztnQkFDN0gsQ0FBQyxDQUFDLENBQUM7YUFDSDtRQUNGLENBQUM7S0FDRCxDQUFBO0lBMUNZLHdIQUFzRDtxRUFBdEQsc0RBQXNEO1FBRWhFLFdBQUEsOEJBQWlCLENBQUE7UUFDakIsV0FBQSxtQkFBWSxDQUFBO1FBQ1osV0FBQSxpREFBNEIsQ0FBQTtRQUM1QixXQUFBLDBEQUFvQyxDQUFBO1FBQ3BDLFdBQUEsaURBQWdDLENBQUE7UUFDaEMsV0FBQSxpREFBZ0MsQ0FBQTtPQVB0QixzREFBc0QsQ0EwQ2xFIn0=