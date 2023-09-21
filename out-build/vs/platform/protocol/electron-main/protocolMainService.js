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
    exports.$e7b = void 0;
    let $e7b = class $e7b extends lifecycle_1.$kc {
        constructor(c, userDataProfilesService, f) {
            super();
            this.c = c;
            this.f = f;
            this.a = ternarySearchTree_1.$Hh.forPaths(!platform_1.$k);
            this.b = new Set(['.svg', '.png', '.jpg', '.jpeg', '.gif', '.bmp', '.webp']); // https://github.com/microsoft/vscode/issues/119384
            // Define an initial set of roots we allow loading from
            // - appRoot	: all files installed as part of the app
            // - extensions : all files shipped from extensions
            // - storage    : all files in global and workspace storage (https://github.com/microsoft/vscode/issues/116735)
            this.addValidFileRoot(c.appRoot);
            this.addValidFileRoot(c.extensionsPath);
            this.addValidFileRoot(userDataProfilesService.defaultProfile.globalStorageHome.with({ scheme: network_1.Schemas.file }).fsPath);
            this.addValidFileRoot(c.workspaceStorageHome.with({ scheme: network_1.Schemas.file }).fsPath);
            // Handle protocols
            this.g();
        }
        g() {
            const { defaultSession } = electron_1.session;
            // Register vscode-file:// handler
            defaultSession.protocol.registerFileProtocol(network_1.Schemas.vscodeFileResource, (request, callback) => this.j(request, callback));
            // Block any file:// access
            defaultSession.protocol.interceptFileProtocol(network_1.Schemas.file, (request, callback) => this.h(request, callback));
            // Cleanup
            this.B((0, lifecycle_1.$ic)(() => {
                defaultSession.protocol.unregisterProtocol(network_1.Schemas.vscodeFileResource);
                defaultSession.protocol.uninterceptProtocol(network_1.Schemas.file);
            }));
        }
        addValidFileRoot(root) {
            // Pass to `normalize` because we later also do the
            // same for all paths to check against.
            const normalizedRoot = (0, path_1.$7d)(root);
            if (!this.a.get(normalizedRoot)) {
                this.a.set(normalizedRoot, true);
                return (0, lifecycle_1.$ic)(() => this.a.delete(normalizedRoot));
            }
            return lifecycle_1.$kc.None;
        }
        //#region file://
        h(request, callback) {
            const uri = uri_1.URI.parse(request.url);
            this.f.error(`Refused to load resource ${uri.fsPath} from ${network_1.Schemas.file}: protocol (original URL: ${request.url})`);
            return callback({ error: -3 /* ABORTED */ });
        }
        //#endregion
        //#region vscode-file://
        j(request, callback) {
            const path = this.m(request);
            let headers;
            if (this.c.crossOriginIsolated) {
                if ((0, path_1.$ae)(path) === 'workbench.html' || (0, path_1.$ae)(path) === 'workbench-dev.html') {
                    headers = network_1.COI.CoopAndCoep;
                }
                else {
                    headers = network_1.COI.getHeadersFromQuery(request.url);
                }
            }
            // first check by validRoots
            if (this.a.findSubstr(path)) {
                return callback({ path, headers });
            }
            // then check by validExtensions
            if (this.b.has((0, path_1.$be)(path).toLowerCase())) {
                return callback({ path });
            }
            // finally block to load the resource
            this.f.error(`${network_1.Schemas.vscodeFileResource}: Refused to load resource ${path} from ${network_1.Schemas.vscodeFileResource}: protocol (original URL: ${request.url})`);
            return callback({ error: -3 /* ABORTED */ });
        }
        m(request) {
            // 1.) Use `URI.parse()` util from us to convert the raw
            //     URL into our URI.
            const requestUri = uri_1.URI.parse(request.url);
            // 2.) Use `FileAccess.asFileUri` to convert back from a
            //     `vscode-file:` URI to a `file:` URI.
            const unnormalizedFileUri = network_1.$2f.uriToFileUri(requestUri);
            // 3.) Strip anything from the URI that could result in
            //     relative paths (such as "..") by using `normalize`
            return (0, path_1.$7d)(unnormalizedFileUri.fsPath);
        }
        //#endregion
        //#region IPC Object URLs
        createIPCObjectUrl() {
            let obj = undefined;
            // Create unique URI
            const resource = uri_1.URI.from({
                scheme: 'vscode',
                path: (0, uuid_1.$4f)()
            });
            // Install IPC handler
            const channel = resource.toString();
            const handler = async () => obj;
            ipcMain_1.$US.handle(channel, handler);
            this.f.trace(`IPC Object URL: Registered new channel ${channel}.`);
            return {
                resource,
                update: updatedObj => obj = updatedObj,
                dispose: () => {
                    this.f.trace(`IPC Object URL: Removed channel ${channel}.`);
                    ipcMain_1.$US.removeHandler(channel);
                }
            };
        }
    };
    exports.$e7b = $e7b;
    exports.$e7b = $e7b = __decorate([
        __param(0, environment_1.$Jh),
        __param(1, userDataProfile_1.$Ek),
        __param(2, log_1.$5i)
    ], $e7b);
});
//# sourceMappingURL=protocolMainService.js.map