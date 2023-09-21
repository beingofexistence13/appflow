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
    exports.$Bac = void 0;
    let $Bac = class $Bac extends lifecycle_1.$kc {
        constructor(a, b, remoteAgentService, nativeHostService) {
            super();
            this.a = a;
            this.b = b;
            globals_1.$M.on('vscode:openFiles', (_, request) => { this.f(request); });
            this.B(nativeHostService.onDidResumeOS(() => this.c()));
            this.b.setNativeDelegate({
                getWindowCount: () => nativeHostService.getWindowCount()
            });
            const connection = remoteAgentService.getConnection();
            if (connection && connection.remoteAuthority) {
                (0, terminalRemote_1.$Aac)();
            }
        }
        c() {
            for (const instance of this.b.instances) {
                instance.xterm?.forceRedraw();
            }
        }
        async f(request) {
            // if the request to open files is coming in from the integrated terminal (identified though
            // the termProgram variable) and we are instructed to wait for editors close, wait for the
            // marker file to get deleted and then focus back to the integrated terminal.
            if (request.termProgram === 'vscode' && request.filesToWait) {
                const waitMarkerFileUri = uri_1.URI.revive(request.filesToWait.waitMarkerFileUri);
                await this.g(waitMarkerFileUri);
                // Focus active terminal
                this.b.activeInstance?.focus();
            }
        }
        g(path) {
            // Complete when wait marker file is deleted
            return new Promise(resolve => {
                let running = false;
                const interval = setInterval(async () => {
                    if (!running) {
                        running = true;
                        const exists = await this.a.exists(path);
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
    exports.$Bac = $Bac;
    exports.$Bac = $Bac = __decorate([
        __param(0, files_1.$6j),
        __param(1, terminal_1.$Mib),
        __param(2, remoteAgentService_1.$jm),
        __param(3, native_1.$05b)
    ], $Bac);
});
//# sourceMappingURL=terminalNativeContribution.js.map