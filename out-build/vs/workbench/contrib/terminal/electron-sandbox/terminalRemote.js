/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/network", "vs/nls!vs/workbench/contrib/terminal/electron-sandbox/terminalRemote", "vs/platform/environment/common/environment", "vs/platform/remote/common/remoteAuthorityResolver", "vs/workbench/contrib/terminal/browser/terminalActions", "vs/workbench/services/history/common/history"], function (require, exports, network_1, nls_1, environment_1, remoteAuthorityResolver_1, terminalActions_1, history_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Aac = void 0;
    function $Aac() {
        (0, terminalActions_1.$HVb)({
            id: "workbench.action.terminal.newLocal" /* TerminalCommandId.NewLocal */,
            title: { value: (0, nls_1.localize)(0, null), original: 'Create New Integrated Terminal (Local)' },
            run: async (c, accessor) => {
                const historyService = accessor.get(history_1.$SM);
                const remoteAuthorityResolverService = accessor.get(remoteAuthorityResolver_1.$Jk);
                const nativeEnvironmentService = accessor.get(environment_1.$Jh);
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
    exports.$Aac = $Aac;
});
//# sourceMappingURL=terminalRemote.js.map