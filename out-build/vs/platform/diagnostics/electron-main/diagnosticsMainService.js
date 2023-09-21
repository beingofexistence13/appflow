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
define(["require", "exports", "electron", "vs/base/parts/ipc/electron-main/ipcMain", "vs/base/common/cancellation", "vs/platform/instantiation/common/instantiation", "vs/platform/windows/electron-main/windows", "vs/platform/workspace/common/workspace", "vs/platform/workspaces/electron-main/workspacesManagementMainService", "vs/base/common/types", "vs/platform/log/common/log", "vs/platform/utilityProcess/electron-main/utilityProcess"], function (require, exports, electron_1, ipcMain_1, cancellation_1, instantiation_1, windows_1, workspace_1, workspacesManagementMainService_1, types_1, log_1, utilityProcess_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Y5b = exports.$X5b = exports.ID = void 0;
    exports.ID = 'diagnosticsMainService';
    exports.$X5b = (0, instantiation_1.$Bh)(exports.ID);
    let $Y5b = class $Y5b {
        constructor(a, b, c) {
            this.a = a;
            this.b = b;
            this.c = c;
        }
        async getRemoteDiagnostics(options) {
            const windows = this.a.getWindows();
            const diagnostics = await Promise.all(windows.map(async (window) => {
                const remoteAuthority = window.remoteAuthority;
                if (!remoteAuthority) {
                    return undefined;
                }
                const replyChannel = `vscode:getDiagnosticInfoResponse${window.id}`;
                const args = {
                    includeProcesses: options.includeProcesses,
                    folders: options.includeWorkspaceMetadata ? await this.f(window) : undefined
                };
                return new Promise(resolve => {
                    window.sendWhenReady('vscode:getDiagnosticInfo', cancellation_1.CancellationToken.None, { replyChannel, args });
                    ipcMain_1.$US.once(replyChannel, (_, data) => {
                        // No data is returned if getting the connection fails.
                        if (!data) {
                            resolve({ hostName: remoteAuthority, errorMessage: `Unable to resolve connection to '${remoteAuthority}'.` });
                        }
                        resolve(data);
                    });
                    setTimeout(() => {
                        resolve({ hostName: remoteAuthority, errorMessage: `Connection to '${remoteAuthority}' could not be established` });
                    }, 5000);
                });
            }));
            return diagnostics.filter((x) => !!x);
        }
        async getMainDiagnostics() {
            this.c.trace('Received request for main process info from other instance.');
            const windows = [];
            for (const window of electron_1.BrowserWindow.getAllWindows()) {
                const codeWindow = this.a.getWindowById(window.id);
                if (codeWindow) {
                    windows.push(await this.d(codeWindow));
                }
                else {
                    windows.push(this.e(window));
                }
            }
            const pidToNames = [];
            for (const { pid, name } of utilityProcess_1.$U5b.getAll()) {
                pidToNames.push({ pid, name });
            }
            return {
                mainPID: process.pid,
                mainArguments: process.argv.slice(1),
                windows,
                pidToNames,
                screenReader: !!electron_1.app.accessibilitySupportEnabled,
                gpuFeatureStatus: electron_1.app.getGPUFeatureStatus()
            };
        }
        async d(window) {
            const folderURIs = await this.f(window);
            const win = (0, types_1.$uf)(window.win);
            return this.e(win, folderURIs, window.remoteAuthority);
        }
        e(window, folderURIs = [], remoteAuthority) {
            return {
                id: window.id,
                pid: window.webContents.getOSProcessId(),
                title: window.getTitle(),
                folderURIs,
                remoteAuthority
            };
        }
        async f(window) {
            const folderURIs = [];
            const workspace = window.openedWorkspace;
            if ((0, workspace_1.$Lh)(workspace)) {
                folderURIs.push(workspace.uri);
            }
            else if ((0, workspace_1.$Qh)(workspace)) {
                const resolvedWorkspace = await this.b.resolveLocalWorkspace(workspace.configPath); // workspace folders can only be shown for local (resolved) workspaces
                if (resolvedWorkspace) {
                    const rootFolders = resolvedWorkspace.folders;
                    rootFolders.forEach(root => {
                        folderURIs.push(root.uri);
                    });
                }
            }
            return folderURIs;
        }
    };
    exports.$Y5b = $Y5b;
    exports.$Y5b = $Y5b = __decorate([
        __param(0, windows_1.$B5b),
        __param(1, workspacesManagementMainService_1.$S5b),
        __param(2, log_1.$5i)
    ], $Y5b);
});
//# sourceMappingURL=diagnosticsMainService.js.map