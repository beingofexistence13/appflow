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
define(["require", "exports", "vs/base/parts/ipc/node/ipc.net", "http", "fs", "vs/workbench/api/common/extHostCommands", "vs/base/common/uri", "vs/platform/log/common/log", "vs/platform/workspace/common/workspace"], function (require, exports, ipc_net_1, http, fs, extHostCommands_1, uri_1, log_1, workspace_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$rM = exports.$qM = void 0;
    class $qM {
        constructor(b, c, f) {
            this.b = b;
            this.c = c;
            this.f = f;
            this.a = http.createServer((req, res) => this.h(req, res));
            this.g().catch(err => {
                c.error(err);
                return '';
            });
        }
        get ipcHandlePath() {
            return this.f;
        }
        async g() {
            try {
                this.a.listen(this.ipcHandlePath);
                this.a.on('error', err => this.c.error(err));
            }
            catch (err) {
                this.c.error('Could not start open from terminal server.');
            }
            return this.f;
        }
        h(req, res) {
            const sendResponse = (statusCode, returnObj) => {
                res.writeHead(statusCode, { 'content-type': 'application/json' });
                res.end(JSON.stringify(returnObj || null), (err) => err && this.c.error(err)); // CodeQL [SM01524] Only the message portion of errors are passed in.
            };
            const chunks = [];
            req.setEncoding('utf8');
            req.on('data', (d) => chunks.push(d));
            req.on('end', async () => {
                try {
                    const data = JSON.parse(chunks.join(''));
                    let returnObj;
                    switch (data.type) {
                        case 'open':
                            returnObj = await this.i(data);
                            break;
                        case 'openExternal':
                            returnObj = await this.j(data);
                            break;
                        case 'status':
                            returnObj = await this.l(data);
                            break;
                        case 'extensionManagement':
                            returnObj = await this.k(data);
                            break;
                        default:
                            sendResponse(404, `Unknown message type: ${data.type}`);
                            break;
                    }
                    sendResponse(200, returnObj);
                }
                catch (e) {
                    const message = e instanceof Error ? e.message : JSON.stringify(e);
                    sendResponse(500, message);
                    this.c.error('Error while processing pipe request', e);
                }
            });
        }
        async i(data) {
            const { fileURIs, folderURIs, forceNewWindow, diffMode, mergeMode, addMode, forceReuseWindow, gotoLineMode, waitMarkerFilePath, remoteAuthority } = data;
            const urisToOpen = [];
            if (Array.isArray(folderURIs)) {
                for (const s of folderURIs) {
                    try {
                        urisToOpen.push({ folderUri: uri_1.URI.parse(s) });
                    }
                    catch (e) {
                        // ignore
                    }
                }
            }
            if (Array.isArray(fileURIs)) {
                for (const s of fileURIs) {
                    try {
                        if ((0, workspace_1.$7h)(s)) {
                            urisToOpen.push({ workspaceUri: uri_1.URI.parse(s) });
                        }
                        else {
                            urisToOpen.push({ fileUri: uri_1.URI.parse(s) });
                        }
                    }
                    catch (e) {
                        // ignore
                    }
                }
            }
            const waitMarkerFileURI = waitMarkerFilePath ? uri_1.URI.file(waitMarkerFilePath) : undefined;
            const preferNewWindow = !forceReuseWindow && !waitMarkerFileURI && !addMode;
            const windowOpenArgs = { forceNewWindow, diffMode, mergeMode, addMode, gotoLineMode, forceReuseWindow, preferNewWindow, waitMarkerFileURI, remoteAuthority };
            this.b.executeCommand('_remoteCLI.windowOpen', urisToOpen, windowOpenArgs);
        }
        async j(data) {
            for (const uriString of data.uris) {
                const uri = uri_1.URI.parse(uriString);
                const urioOpen = uri.scheme === 'file' ? uri : uriString; // workaround for #112577
                await this.b.executeCommand('_remoteCLI.openExternal', urioOpen);
            }
        }
        async k(data) {
            const toExtOrVSIX = (inputs) => inputs?.map(input => /\.vsix$/i.test(input) ? uri_1.URI.parse(input) : input);
            const commandArgs = {
                list: data.list,
                install: toExtOrVSIX(data.install),
                uninstall: toExtOrVSIX(data.uninstall),
                force: data.force
            };
            return await this.b.executeCommand('_remoteCLI.manageExtensions', commandArgs);
        }
        async l(data) {
            return await this.b.executeCommand('_remoteCLI.getSystemStatus');
        }
        dispose() {
            this.a.close();
            if (this.f && process.platform !== 'win32' && fs.existsSync(this.f)) {
                fs.unlinkSync(this.f);
            }
        }
    }
    exports.$qM = $qM;
    let $rM = class $rM extends $qM {
        constructor(commands, logService) {
            super(commands, logService, (0, ipc_net_1.$th)());
        }
    };
    exports.$rM = $rM;
    exports.$rM = $rM = __decorate([
        __param(0, extHostCommands_1.$lM),
        __param(1, log_1.$5i)
    ], $rM);
});
//# sourceMappingURL=extHostCLIServer.js.map