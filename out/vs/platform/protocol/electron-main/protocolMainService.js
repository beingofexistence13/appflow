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
define(["require", "exports", "electron", "vs/base/common/lifecycle", "vs/base/common/network", "vs/base/common/path", "vs/base/common/platform", "vs/base/common/ternarySearchTree", "vs/base/common/uri", "vs/base/common/uuid", "vs/base/parts/ipc/electron-main/ipcMain", "vs/platform/environment/common/environment", "vs/platform/log/common/log", "vs/platform/userDataProfile/common/userDataProfile"], function (require, exports, electron_1, lifecycle_1, network_1, path_1, platform_1, ternarySearchTree_1, uri_1, uuid_1, ipcMain_1, environment_1, log_1, userDataProfile_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ProtocolMainService = void 0;
    let ProtocolMainService = class ProtocolMainService extends lifecycle_1.Disposable {
        constructor(environmentService, userDataProfilesService, logService) {
            super();
            this.environmentService = environmentService;
            this.logService = logService;
            this.validRoots = ternarySearchTree_1.TernarySearchTree.forPaths(!platform_1.isLinux);
            this.validExtensions = new Set(['.svg', '.png', '.jpg', '.jpeg', '.gif', '.bmp', '.webp']); // https://github.com/microsoft/vscode/issues/119384
            // Define an initial set of roots we allow loading from
            // - appRoot	: all files installed as part of the app
            // - extensions : all files shipped from extensions
            // - storage    : all files in global and workspace storage (https://github.com/microsoft/vscode/issues/116735)
            this.addValidFileRoot(environmentService.appRoot);
            this.addValidFileRoot(environmentService.extensionsPath);
            this.addValidFileRoot(userDataProfilesService.defaultProfile.globalStorageHome.with({ scheme: network_1.Schemas.file }).fsPath);
            this.addValidFileRoot(environmentService.workspaceStorageHome.with({ scheme: network_1.Schemas.file }).fsPath);
            // Handle protocols
            this.handleProtocols();
        }
        handleProtocols() {
            const { defaultSession } = electron_1.session;
            // Register vscode-file:// handler
            defaultSession.protocol.registerFileProtocol(network_1.Schemas.vscodeFileResource, (request, callback) => this.handleResourceRequest(request, callback));
            // Block any file:// access
            defaultSession.protocol.interceptFileProtocol(network_1.Schemas.file, (request, callback) => this.handleFileRequest(request, callback));
            // Cleanup
            this._register((0, lifecycle_1.toDisposable)(() => {
                defaultSession.protocol.unregisterProtocol(network_1.Schemas.vscodeFileResource);
                defaultSession.protocol.uninterceptProtocol(network_1.Schemas.file);
            }));
        }
        addValidFileRoot(root) {
            // Pass to `normalize` because we later also do the
            // same for all paths to check against.
            const normalizedRoot = (0, path_1.normalize)(root);
            if (!this.validRoots.get(normalizedRoot)) {
                this.validRoots.set(normalizedRoot, true);
                return (0, lifecycle_1.toDisposable)(() => this.validRoots.delete(normalizedRoot));
            }
            return lifecycle_1.Disposable.None;
        }
        //#region file://
        handleFileRequest(request, callback) {
            const uri = uri_1.URI.parse(request.url);
            this.logService.error(`Refused to load resource ${uri.fsPath} from ${network_1.Schemas.file}: protocol (original URL: ${request.url})`);
            return callback({ error: -3 /* ABORTED */ });
        }
        //#endregion
        //#region vscode-file://
        handleResourceRequest(request, callback) {
            const path = this.requestToNormalizedFilePath(request);
            let headers;
            if (this.environmentService.crossOriginIsolated) {
                if ((0, path_1.basename)(path) === 'workbench.html' || (0, path_1.basename)(path) === 'workbench-dev.html') {
                    headers = network_1.COI.CoopAndCoep;
                }
                else {
                    headers = network_1.COI.getHeadersFromQuery(request.url);
                }
            }
            // first check by validRoots
            if (this.validRoots.findSubstr(path)) {
                return callback({ path, headers });
            }
            // then check by validExtensions
            if (this.validExtensions.has((0, path_1.extname)(path).toLowerCase())) {
                return callback({ path });
            }
            // finally block to load the resource
            this.logService.error(`${network_1.Schemas.vscodeFileResource}: Refused to load resource ${path} from ${network_1.Schemas.vscodeFileResource}: protocol (original URL: ${request.url})`);
            return callback({ error: -3 /* ABORTED */ });
        }
        requestToNormalizedFilePath(request) {
            // 1.) Use `URI.parse()` util from us to convert the raw
            //     URL into our URI.
            const requestUri = uri_1.URI.parse(request.url);
            // 2.) Use `FileAccess.asFileUri` to convert back from a
            //     `vscode-file:` URI to a `file:` URI.
            const unnormalizedFileUri = network_1.FileAccess.uriToFileUri(requestUri);
            // 3.) Strip anything from the URI that could result in
            //     relative paths (such as "..") by using `normalize`
            return (0, path_1.normalize)(unnormalizedFileUri.fsPath);
        }
        //#endregion
        //#region IPC Object URLs
        createIPCObjectUrl() {
            let obj = undefined;
            // Create unique URI
            const resource = uri_1.URI.from({
                scheme: 'vscode',
                path: (0, uuid_1.generateUuid)()
            });
            // Install IPC handler
            const channel = resource.toString();
            const handler = async () => obj;
            ipcMain_1.validatedIpcMain.handle(channel, handler);
            this.logService.trace(`IPC Object URL: Registered new channel ${channel}.`);
            return {
                resource,
                update: updatedObj => obj = updatedObj,
                dispose: () => {
                    this.logService.trace(`IPC Object URL: Removed channel ${channel}.`);
                    ipcMain_1.validatedIpcMain.removeHandler(channel);
                }
            };
        }
    };
    exports.ProtocolMainService = ProtocolMainService;
    exports.ProtocolMainService = ProtocolMainService = __decorate([
        __param(0, environment_1.INativeEnvironmentService),
        __param(1, userDataProfile_1.IUserDataProfilesService),
        __param(2, log_1.ILogService)
    ], ProtocolMainService);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJvdG9jb2xNYWluU2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3BsYXRmb3JtL3Byb3RvY29sL2VsZWN0cm9uLW1haW4vcHJvdG9jb2xNYWluU2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUFrQnpGLElBQU0sbUJBQW1CLEdBQXpCLE1BQU0sbUJBQW9CLFNBQVEsc0JBQVU7UUFPbEQsWUFDNEIsa0JBQThELEVBQy9ELHVCQUFpRCxFQUM5RCxVQUF3QztZQUVyRCxLQUFLLEVBQUUsQ0FBQztZQUpvQyx1QkFBa0IsR0FBbEIsa0JBQWtCLENBQTJCO1lBRTNELGVBQVUsR0FBVixVQUFVLENBQWE7WUFOckMsZUFBVSxHQUFHLHFDQUFpQixDQUFDLFFBQVEsQ0FBVSxDQUFDLGtCQUFPLENBQUMsQ0FBQztZQUMzRCxvQkFBZSxHQUFHLElBQUksR0FBRyxDQUFDLENBQUMsTUFBTSxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLG9EQUFvRDtZQVMzSix1REFBdUQ7WUFDdkQscURBQXFEO1lBQ3JELG1EQUFtRDtZQUNuRCwrR0FBK0c7WUFDL0csSUFBSSxDQUFDLGdCQUFnQixDQUFDLGtCQUFrQixDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQ2xELElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxrQkFBa0IsQ0FBQyxjQUFjLENBQUMsQ0FBQztZQUN6RCxJQUFJLENBQUMsZ0JBQWdCLENBQUMsdUJBQXVCLENBQUMsY0FBYyxDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQyxFQUFFLE1BQU0sRUFBRSxpQkFBTyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDdEgsSUFBSSxDQUFDLGdCQUFnQixDQUFDLGtCQUFr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