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
define(["require", "exports", "vs/base/common/async", "vs/base/common/errors", "vs/base/common/lifecycle", "vs/base/common/path", "vs/base/node/pfs", "vs/platform/environment/common/environment", "vs/platform/log/common/log", "vs/platform/storage/common/storageIpc", "vs/platform/workspace/common/workspace", "vs/platform/workspaces/node/workspaces", "vs/platform/native/common/native", "vs/platform/ipc/common/mainProcessService", "vs/base/common/network"], function (require, exports, async_1, errors_1, lifecycle_1, path_1, pfs_1, environment_1, log_1, storageIpc_1, workspace_1, workspaces_1, native_1, mainProcessService_1, network_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$P7b = void 0;
    let $P7b = class $P7b extends lifecycle_1.$kc {
        constructor(a, b, c, f) {
            super();
            this.a = a;
            this.b = b;
            this.c = c;
            this.f = f;
            const scheduler = this.B(new async_1.$Sg(() => {
                this.g();
            }, 30 * 1000 /* after 30s */));
            scheduler.schedule();
        }
        async g() {
            this.b.trace('[storage cleanup]: Starting to clean up workspace storage folders for unused empty workspaces.');
            try {
                const workspaceStorageHome = this.a.workspaceStorageHome.with({ scheme: network_1.Schemas.file }).fsPath;
                const workspaceStorageFolders = await pfs_1.Promises.readdir(workspaceStorageHome);
                const storageClient = new storageIpc_1.$dAb(this.f.getChannel('storage'));
                await Promise.all(workspaceStorageFolders.map(async (workspaceStorageFolder) => {
                    const workspaceStoragePath = (0, path_1.$9d)(workspaceStorageHome, workspaceStorageFolder);
                    if (workspaceStorageFolder.length === workspaces_1.$H5b) {
                        return; // keep workspace storage for folders/workspaces that can be accessed still
                    }
                    if (workspaceStorageFolder === workspace_1.$Nh.id) {
                        return; // keep workspace storage for empty extension development workspaces
                    }
                    const windows = await this.c.getWindows();
                    if (windows.some(window => window.workspace?.id === workspaceStorageFolder)) {
                        return; // keep workspace storage for empty workspaces opened as window
                    }
                    const isStorageUsed = await storageClient.isUsed(workspaceStoragePath);
                    if (isStorageUsed) {
                        return; // keep workspace storage for empty workspaces that are in use
                    }
                    this.b.trace(`[storage cleanup]: Deleting workspace storage folder ${workspaceStorageFolder} as it seems to be an unused empty workspace.`);
                    await pfs_1.Promises.rm(workspaceStoragePath);
                }));
            }
            catch (error) {
                (0, errors_1.$Y)(error);
            }
        }
    };
    exports.$P7b = $P7b;
    exports.$P7b = $P7b = __decorate([
        __param(0, environment_1.$Jh),
        __param(1, log_1.$5i),
        __param(2, native_1.$05b),
        __param(3, mainProcessService_1.$o7b)
    ], $P7b);
});
//# sourceMappingURL=storageDataCleaner.js.map