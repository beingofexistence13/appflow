/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/network", "vs/nls", "vs/platform/environment/common/environment", "vs/platform/remote/common/remoteAuthorityResolver", "vs/workbench/contrib/terminal/browser/terminalActions", "vs/workbench/services/history/common/history"], function (require, exports, network_1, nls_1, environment_1, remoteAuthorityResolver_1, terminalActions_1, history_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.registerRemoteContributions = void 0;
    function registerRemoteContributions() {
        (0, terminalActions_1.registerTerminalAction)({
            id: "workbench.action.terminal.newLocal" /* TerminalCommandId.NewLocal */,
            title: { value: (0, nls_1.localize)('workbench.action.terminal.newLocal', "Create New Integrated Terminal (Local)"), original: 'Create New Integrated Terminal (Local)' },
            run: async (c, accessor) => {
                const historyService = accessor.get(history_1.IHistoryService);
                const remoteAuthorityResolverService = accessor.get(remoteAuthorityResolver_1.IRemoteAuthorityResolverService);
                const nativeEnvironmentService = accessor.get(environment_1.INativeEnvironmentService);
                let cwd;
                try {
                    const activeWorkspaceRootUri = historyService.getLastActiveWorkspaceRoot(network_1.Schemas.vscodeRemote);
                    if (activeWorkspaceRootUri) {
                        const canonicalUri = await remoteAuthorityResolverService.getCanonicalURI(activeWorkspaceRootUri);
                        if (canonicalUri.scheme === network_1.Schemas.file) {
                            cwd = canonicalUri;
                        }
                    }
                }
                catch { }
                if (!cwd) {
                    cwd = nativeEnvironmentService.userHome;
                }
                const instance = await c.service.createTerminal({ cwd });
                if (!instance) {
                    return Promise.resolve(undefined);
                }
                c.service.setActiveInstance(instance);
                return c.groupService.showPanel(true);
            }
        });
    }
    exports.registerRemoteContributions = registerRemoteContributions;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVybWluYWxSZW1vdGUuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi90ZXJtaW5hbC9lbGVjdHJvbi1zYW5kYm94L3Rlcm1pbmFsUmVtb3RlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQVdoRyxTQUFnQiwyQkFBMkI7UUFDMUMsSUFBQSx3Q0FBc0IsRUFBQztZQUN0QixFQUFFLHVFQUE0QjtZQUM5QixLQUFLLEVBQUUsRUFBRSxLQUFLLEVBQUUsSUFBQSxjQUFRLEVBQUMsb0NBQW9DLEVBQUUsd0NBQXdDLENBQUMsRUFBRSxRQUFRLEVBQUUsd0NBQXdDLEVBQUU7WUFDOUosR0FBRyxFQUFFLEtBQUssRUFBRSxDQUFDLEVBQUUsUUFBUSxFQUFFLEVBQUU7Z0JBQzFCLE1BQU0sY0FBYyxHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMseUJBQWUsQ0FBQyxDQUFDO2dCQUNyRCxNQUFNLDhCQUE4QixHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMseURBQStCLENBQUMsQ0FBQztnQkFDckYsTUFBTSx3QkFBd0IsR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLHVDQUF5QixDQUFDLENBQUM7Z0JBQ3pFLElBQUksR0FBb0IsQ0FBQztnQkFDekIsSUFBSTtvQkFDSCxNQUFNLHNCQUFzQixHQUFHLGNBQWMsQ0FBQywwQkFBMEIsQ0FBQyxpQkFBTyxDQUFDLFlBQVksQ0FBQyxDQUFDO29CQUMvRixJQUFJLHNCQUFzQixFQUFFO3dCQUMzQixNQUFNLFlBQVksR0FBRyxNQUFNLDhCQUE4QixDQUFDLGVBQWUsQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDO3dCQUNsRyxJQUFJLFlBQVksQ0FBQyxNQUFNLEtBQUssaUJBQU8sQ0FBQyxJQUFJLEVBQUU7NEJBQ3pDLEdBQUcsR0FBRyxZQUFZLENBQUM7eUJBQ25CO3FCQUNEO2lCQUNEO2dCQUFDLE1BQU0sR0FBRztnQkFDWCxJQUFJLENBQUMsR0FBRyxFQUFFO29CQUNULEdBQUcsR0FBRyx3QkFBd0IsQ0FBQyxRQUFRLENBQUM7aUJBQ3hDO2dCQUNELE1BQU0sUUFBUSxHQUFHLE1BQU0sQ0FBQyxDQUFDLE9BQU8sQ0FBQyxjQUFjLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxDQUFDO2dCQUN6RCxJQUFJLENBQUMsUUFBUSxFQUFFO29CQUNkLE9BQU8sT0FBTyxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQztpQkFDbEM7Z0JBRUQsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxpQkFBaUIsQ0FBQyxRQUFRLENBQUMsQ0FBQztnQkFDdEMsT0FBTyxDQUFDLENBQUMsWUFBWSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUN2QyxDQUFDO1NBQ0QsQ0FBQyxDQUFDO0lBQ0osQ0FBQztJQTlCRCxrRUE4QkMifQ==