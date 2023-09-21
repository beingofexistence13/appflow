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
define(["require", "exports", "vs/base/parts/sandbox/electron-sandbox/globals", "vs/base/common/uri", "vs/platform/files/common/files", "vs/workbench/contrib/terminal/electron-sandbox/terminalRemote", "vs/workbench/services/remote/common/remoteAgentService", "vs/platform/native/common/native", "vs/base/common/lifecycle", "vs/workbench/contrib/terminal/browser/terminal"], function (require, exports, globals_1, uri_1, files_1, terminalRemote_1, remoteAgentService_1, native_1, lifecycle_1, terminal_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TerminalNativeContribution = void 0;
    let TerminalNativeContribution = class TerminalNativeContribution extends lifecycle_1.Disposable {
        constructor(_fileService, _terminalService, remoteAgentService, nativeHostService) {
            super();
            this._fileService = _fileService;
            this._terminalService = _terminalService;
            globals_1.ipcRenderer.on('vscode:openFiles', (_, request) => { this._onOpenFileRequest(request); });
            this._register(nativeHostService.onDidResumeOS(() => this._onOsResume()));
            this._terminalService.setNativeDelegate({
                getWindowCount: () => nativeHostService.getWindowCount()
            });
            const connection = remoteAgentService.getConnection();
            if (connection && connection.remoteAuthority) {
                (0, terminalRemote_1.registerRemoteContributions)();
            }
        }
        _onOsResume() {
            for (const instance of this._terminalService.instances) {
                instance.xterm?.forceRedraw();
            }
        }
        async _onOpenFileRequest(request) {
            // if the request to open files is coming in from the integrated terminal (identified though
            // the termProgram variable) and we are instructed to wait for editors close, wait for the
            // marker file to get deleted and then focus back to the integrated terminal.
            if (request.termProgram === 'vscode' && request.filesToWait) {
                const waitMarkerFileUri = uri_1.URI.revive(request.filesToWait.waitMarkerFileUri);
                await this._whenFileDeleted(waitMarkerFileUri);
                // Focus active terminal
                this._terminalService.activeInstance?.focus();
            }
        }
        _whenFileDeleted(path) {
            // Complete when wait marker file is deleted
            return new Promise(resolve => {
                let running = false;
                const interval = setInterval(async () => {
                    if (!running) {
                        running = true;
                        const exists = await this._fileService.exists(path);
                        running = false;
                        if (!exists) {
                            clearInterval(interval);
                            resolve(undefined);
                        }
                    }
                }, 1000);
            });
        }
    };
    exports.TerminalNativeContribution = TerminalNativeContribution;
    exports.TerminalNativeContribution = TerminalNativeContribution = __decorate([
        __param(0, files_1.IFileService),
        __param(1, terminal_1.ITerminalService),
        __param(2, remoteAgentService_1.IRemoteAgentService),
        __param(3, native_1.INativeHostService)
    ], TerminalNativeContribution);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVybWluYWxOYXRpdmVDb250cmlidXRpb24uanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi90ZXJtaW5hbC9lbGVjdHJvbi1zYW5kYm94L3Rlcm1pbmFsTmF0aXZlQ29udHJpYnV0aW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQWF6RixJQUFNLDBCQUEwQixHQUFoQyxNQUFNLDBCQUEyQixTQUFRLHNCQUFVO1FBR3pELFlBQ2dDLFlBQTBCLEVBQ3RCLGdCQUFrQyxFQUNoRCxrQkFBdUMsRUFDeEMsaUJBQXFDO1lBRXpELEtBQUssRUFBRSxDQUFDO1lBTHVCLGlCQUFZLEdBQVosWUFBWSxDQUFjO1lBQ3RCLHFCQUFnQixHQUFoQixnQkFBZ0IsQ0FBa0I7WUFNckUscUJBQVcsQ0FBQyxFQUFFLENBQUMsa0JBQWtCLEVBQUUsQ0FBQyxDQUFVLEVBQUUsT0FBK0IsRUFBRSxFQUFFLEdBQUcsSUFBSSxDQUFDLGtCQUFrQixDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDM0gsSUFBSSxDQUFDLFNBQVMsQ0FBQyxpQkFBaUIsQ0FBQyxhQUFhLENBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUUxRSxJQUFJLENBQUMsZ0JBQWdCLENBQUMsaUJBQWlCLENBQUM7Z0JBQ3ZDLGNBQWMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxpQkFBaUIsQ0FBQyxjQUFjLEVBQUU7YUFDeEQsQ0FBQyxDQUFDO1lBRUgsTUFBTSxVQUFVLEdBQUcsa0JBQWtCLENBQUMsYUFBYSxFQUFFLENBQUM7WUFDdEQsSUFBSSxVQUFVLElBQUksVUFBVSxDQUFDLGVBQWUsRUFBRTtnQkFDN0MsSUFBQSw0Q0FBMkIsR0FBRSxDQUFDO2FBQzlCO1FBQ0YsQ0FBQztRQUVPLFdBQVc7WUFDbEIsS0FBSyxNQUFNLFFBQVEsSUFBSSxJQUFJLENBQUMsZ0JBQWdCLENBQUMsU0FBUyxFQUFFO2dCQUN2RCxRQUFRLENBQUMsS0FBSyxFQUFFLFdBQVcsRUFBRSxDQUFDO2FBQzlCO1FBQ0YsQ0FBQztRQUVPLEtBQUssQ0FBQyxrQkFBa0IsQ0FBQyxPQUErQjtZQUMvRCw0RkFBNEY7WUFDNUYsMEZBQTBGO1lBQzFGLDZFQUE2RTtZQUM3RSxJQUFJLE9BQU8sQ0FBQyxXQUFXLEtBQUssUUFBUSxJQUFJLE9BQU8sQ0FBQyxXQUFXLEVBQUU7Z0JBQzVELE1BQU0saUJBQWlCLEdBQUcsU0FBRyxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDLGlCQUFpQixDQUFDLENBQUM7Z0JBQzVFLE1BQU0sSUFBSSxDQUFDLGdCQUFnQixDQUFDLGlCQUFpQixDQUFDLENBQUM7Z0JBRS9DLHdCQUF3QjtnQkFDeEIsSUFBSSxDQUFDLGdCQUFnQixDQUFDLGNBQWMsRUFBRSxLQUFLLEVBQUUsQ0FBQzthQUM5QztRQUNGLENBQUM7UUFFTyxnQkFBZ0IsQ0FBQyxJQUFTO1lBQ2pDLDRDQUE0QztZQUM1QyxPQUFPLElBQUksT0FBTyxDQUFPLE9BQU8sQ0FBQyxFQUFFO2dCQUNsQyxJQUFJLE9BQU8sR0FBRyxLQUFLLENBQUM7Z0JBQ3BCLE1BQU0sUUFBUSxHQUFHLFdBQVcsQ0FBQyxLQUFLLElBQUksRUFBRTtvQkFDdkMsSUFBSSxDQUFDLE9BQU8sRUFBRTt3QkFDYixPQUFPLEdBQUcsSUFBSSxDQUFDO3dCQUNmLE1BQU0sTUFBTSxHQUFHLE1BQU0sSUFBSSxDQUFDLFlBQVksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7d0JBQ3BELE9BQU8sR0FBRyxLQUFLLENBQUM7d0JBRWhCLElBQUksQ0FBQyxNQUFNLEVBQUU7NEJBQ1osYUFBYSxDQUFDLFFBQVEsQ0FBQyxDQUFDOzRCQUN4QixPQUFPLENBQUMsU0FBUyxDQUFDLENBQUM7eUJBQ25CO3FCQUNEO2dCQUNGLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQztZQUNWLENBQUMsQ0FBQyxDQUFDO1FBQ0osQ0FBQztLQUNELENBQUE7SUE3RFksZ0VBQTBCO3lDQUExQiwwQkFBMEI7UUFJcEMsV0FBQSxvQkFBWSxDQUFBO1FBQ1osV0FBQSwyQkFBZ0IsQ0FBQTtRQUNoQixXQUFBLHdDQUFtQixDQUFBO1FBQ25CLFdBQUEsMkJBQWtCLENBQUE7T0FQUiwwQkFBMEIsQ0E2RHRDIn0=