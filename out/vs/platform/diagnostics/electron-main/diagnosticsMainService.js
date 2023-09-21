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
    exports.DiagnosticsMainService = exports.IDiagnosticsMainService = exports.ID = void 0;
    exports.ID = 'diagnosticsMainService';
    exports.IDiagnosticsMainService = (0, instantiation_1.createDecorator)(exports.ID);
    let DiagnosticsMainService = class DiagnosticsMainService {
        constructor(windowsMainService, workspacesManagementMainService, logService) {
            this.windowsMainService = windowsMainService;
            this.workspacesManagementMainService = workspacesManagementMainService;
            this.logService = logService;
        }
        async getRemoteDiagnostics(options) {
            const windows = this.windowsMainService.getWindows();
            const diagnostics = await Promise.all(windows.map(async (window) => {
                const remoteAuthority = window.remoteAuthority;
                if (!remoteAuthority) {
                    return undefined;
                }
                const replyChannel = `vscode:getDiagnosticInfoResponse${window.id}`;
                const args = {
                    includeProcesses: options.includeProcesses,
                    folders: options.includeWorkspaceMetadata ? await this.getFolderURIs(window) : undefined
                };
                return new Promise(resolve => {
                    window.sendWhenReady('vscode:getDiagnosticInfo', cancellation_1.CancellationToken.None, { replyChannel, args });
                    ipcMain_1.validatedIpcMain.once(replyChannel, (_, data) => {
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
            this.logService.trace('Received request for main process info from other instance.');
            const windows = [];
            for (const window of electron_1.BrowserWindow.getAllWindows()) {
                const codeWindow = this.windowsMainService.getWindowById(window.id);
                if (codeWindow) {
                    windows.push(await this.codeWindowToInfo(codeWindow));
                }
                else {
                    windows.push(this.browserWindowToInfo(window));
                }
            }
            const pidToNames = [];
            for (const { pid, name } of utilityProcess_1.UtilityProcess.getAll()) {
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
        async codeWindowToInfo(window) {
            const folderURIs = await this.getFolderURIs(window);
            const win = (0, types_1.assertIsDefined)(window.win);
            return this.browserWindowToInfo(win, folderURIs, window.remoteAuthority);
        }
        browserWindowToInfo(window, folderURIs = [], remoteAuthority) {
            return {
                id: window.id,
                pid: window.webContents.getOSProcessId(),
                title: window.getTitle(),
                folderURIs,
                remoteAuthority
            };
        }
        async getFolderURIs(window) {
            const folderURIs = [];
            const workspace = window.openedWorkspace;
            if ((0, workspace_1.isSingleFolderWorkspaceIdentifier)(workspace)) {
                folderURIs.push(workspace.uri);
            }
            else if ((0, workspace_1.isWorkspaceIdentifier)(workspace)) {
                const resolvedWorkspace = await this.workspacesManagementMainService.resolveLocalWorkspace(workspace.configPath); // workspace folders can only be shown for local (resolved) workspaces
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
    exports.DiagnosticsMainService = DiagnosticsMainService;
    exports.DiagnosticsMainService = DiagnosticsMainService = __decorate([
        __param(0, windows_1.IWindowsMainService),
        __param(1, workspacesManagementMainService_1.IWorkspacesManagementMainService),
        __param(2, log_1.ILogService)
    ], DiagnosticsMainService);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGlhZ25vc3RpY3NNYWluU2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3BsYXRmb3JtL2RpYWdub3N0aWNzL2VsZWN0cm9uLW1haW4vZGlhZ25vc3RpY3NNYWluU2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUFnQm5GLFFBQUEsRUFBRSxHQUFHLHdCQUF3QixDQUFDO0lBQzlCLFFBQUEsdUJBQXVCLEdBQUcsSUFBQSwrQkFBZSxFQUEwQixVQUFFLENBQUMsQ0FBQztJQWE3RSxJQUFNLHNCQUFzQixHQUE1QixNQUFNLHNCQUFzQjtRQUlsQyxZQUN1QyxrQkFBdUMsRUFDMUIsK0JBQWlFLEVBQ3RGLFVBQXVCO1lBRmYsdUJBQWtCLEdBQWxCLGtCQUFrQixDQUFxQjtZQUMxQixvQ0FBK0IsR0FBL0IsK0JBQStCLENBQWtDO1lBQ3RGLGVBQVUsR0FBVixVQUFVLENBQWE7UUFDbEQsQ0FBQztRQUVMLEtBQUssQ0FBQyxvQkFBb0IsQ0FBQyxPQUFpQztZQUMzRCxNQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsa0JBQWtCLENBQUMsVUFBVSxFQUFFLENBQUM7WUFDckQsTUFBTSxXQUFXLEdBQWdFLE1BQU0sT0FBTyxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEtBQUssRUFBQyxNQUFNLEVBQUMsRUFBRTtnQkFDN0gsTUFBTSxlQUFlLEdBQUcsTUFBTSxDQUFDLGVBQWUsQ0FBQztnQkFDL0MsSUFBSSxDQUFDLGVBQWUsRUFBRTtvQkFDckIsT0FBTyxTQUFTLENBQUM7aUJBQ2pCO2dCQUVELE1BQU0sWUFBWSxHQUFHLG1DQUFtQyxNQUFNLENBQUMsRUFBRSxFQUFFLENBQUM7Z0JBQ3BFLE1BQU0sSUFBSSxHQUEyQjtvQkFDcEMsZ0JBQWdCLEVBQUUsT0FBTyxDQUFDLGdCQUFnQjtvQkFDMUMsT0FBTyxFQUFF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