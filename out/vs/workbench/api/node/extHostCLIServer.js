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
    exports.CLIServer = exports.CLIServerBase = void 0;
    class CLIServerBase {
        constructor(_commands, logService, _ipcHandlePath) {
            this._commands = _commands;
            this.logService = logService;
            this._ipcHandlePath = _ipcHandlePath;
            this._server = http.createServer((req, res) => this.onRequest(req, res));
            this.setup().catch(err => {
                logService.error(err);
                return '';
            });
        }
        get ipcHandlePath() {
            return this._ipcHandlePath;
        }
        async setup() {
            try {
                this._server.listen(this.ipcHandlePath);
                this._server.on('error', err => this.logService.error(err));
            }
            catch (err) {
                this.logService.error('Could not start open from terminal server.');
            }
            return this._ipcHandlePath;
        }
        onRequest(req, res) {
            const sendResponse = (statusCode, returnObj) => {
                res.writeHead(statusCode, { 'content-type': 'application/json' });
                res.end(JSON.stringify(returnObj || null), (err) => err && this.logService.error(err)); // CodeQL [SM01524] Only the message portion of errors are passed in.
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
                            returnObj = await this.open(data);
                            break;
                        case 'openExternal':
                            returnObj = await this.openExternal(data);
                            break;
                        case 'status':
                            returnObj = await this.getStatus(data);
                            break;
                        case 'extensionManagement':
                            returnObj = await this.manageExtensions(data);
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
                    this.logService.error('Error while processing pipe request', e);
                }
            });
        }
        async open(data) {
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
                        if ((0, workspace_1.hasWorkspaceFileExtension)(s)) {
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
            this._commands.executeCommand('_remoteCLI.windowOpen', urisToOpen, windowOpenArgs);
        }
        async openExternal(data) {
            for (const uriString of data.uris) {
                const uri = uri_1.URI.parse(uriString);
                const urioOpen = uri.scheme === 'file' ? uri : uriString; // workaround for #112577
                await this._commands.executeCommand('_remoteCLI.openExternal', urioOpen);
            }
        }
        async manageExtensions(data) {
            const toExtOrVSIX = (inputs) => inputs?.map(input => /\.vsix$/i.test(input) ? uri_1.URI.parse(input) : input);
            const commandArgs = {
                list: data.list,
                install: toExtOrVSIX(data.install),
                uninstall: toExtOrVSIX(data.uninstall),
                force: data.force
            };
            return await this._commands.executeCommand('_remoteCLI.manageExtensions', commandArgs);
        }
        async getStatus(data) {
            return await this._commands.executeCommand('_remoteCLI.getSystemStatus');
        }
        dispose() {
            this._server.close();
            if (this._ipcHandlePath && process.platform !== 'win32' && fs.existsSync(this._ipcHandlePath)) {
                fs.unlinkSync(this._ipcHandlePath);
            }
        }
    }
    exports.CLIServerBase = CLIServerBase;
    let CLIServer = class CLIServer extends CLIServerBase {
        constructor(commands, logService) {
            super(commands, logService, (0, ipc_net_1.createRandomIPCHandle)());
        }
    };
    exports.CLIServer = CLIServer;
    exports.CLIServer = CLIServer = __decorate([
        __param(0, extHostCommands_1.IExtHostCommands),
        __param(1, log_1.ILogService)
    ], CLIServer);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0SG9zdENMSVNlcnZlci5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9hcGkvbm9kZS9leHRIb3N0Q0xJU2VydmVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQWdEaEcsTUFBYSxhQUFhO1FBR3pCLFlBQ2tCLFNBQTRCLEVBQzVCLFVBQXVCLEVBQ3ZCLGNBQXNCO1lBRnRCLGNBQVMsR0FBVCxTQUFTLENBQW1CO1lBQzVCLGVBQVUsR0FBVixVQUFVLENBQWE7WUFDdkIsbUJBQWMsR0FBZCxjQUFjLENBQVE7WUFFdkMsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUN6RSxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxFQUFFO2dCQUN4QixVQUFVLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO2dCQUN0QixPQUFPLEVBQUUsQ0FBQztZQUNYLENBQUMsQ0FBQyxDQUFDO1FBQ0osQ0FBQztRQUVELElBQVcsYUFBYTtZQUN2QixPQUFPLElBQUksQ0FBQyxjQUFjLENBQUM7UUFDNUIsQ0FBQztRQUVPLEtBQUssQ0FBQyxLQUFLO1lBQ2xCLElBQUk7Z0JBQ0gsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDO2dCQUN4QyxJQUFJLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxPQUFPLEVBQUUsR0FBRyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO2FBQzVEO1lBQUMsT0FBTyxHQUFHLEVBQUU7Z0JBQ2IsSUFBSSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsNENBQTRDLENBQUMsQ0FBQzthQUNwRTtZQUVELE9BQU8sSUFBSSxDQUFDLGNBQWMsQ0FBQztRQUM1QixDQUFDO1FBRU8sU0FBUyxDQUFDLEdBQXlCLEVBQUUsR0FBd0I7WUFDcEUsTUFBTSxZQUFZLEdBQUcsQ0FBQyxVQUFrQixFQUFFLFNBQTZCLEVBQUUsRUFBRTtnQkFDMUUsR0FBRyxDQUFDLFNBQVMsQ0FBQyxVQUFVLEVBQUUsRUFBRSxjQUFjLEVBQUUsa0JBQWtCLEVBQUUsQ0FBQyxDQUFDO2dCQUNsRSxHQUFHLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsU0FBUyxJQUFJLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBUyxFQUFFLEVBQUUsQ0FBQyxHQUFHLElBQUksSUFBSSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLHFFQUFxRTtZQUNwSyxDQUFDLENBQUM7WUFFRixNQUFNLE1BQU0sR0FBYSxFQUFFLENBQUM7WUFDNUIsR0FBRyxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUN4QixHQUFHLENBQUMsRUFBRSxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQVMsRUFBRSxFQUFFLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzlDLEdBQUcsQ0FBQyxFQUFFLENBQUMsS0FBSyxFQUFFLEtBQUssSUFBSSxFQUFFO2dCQUN4QixJQUFJO29CQUNILE1BQU0sSUFBSSxHQUFzQixJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztvQkFDNUQsSUFBSSxTQUE2QixDQUFDO29CQUNsQyxRQUFRLElBQUksQ0FBQyxJQUFJLEVBQUU7d0JBQ2xCLEtBQUssTUFBTTs0QkFDVixTQUFTLEdBQUcsTUFBTSxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDOzRCQUNsQyxNQUFNO3dCQUNQLEtBQUssY0FBYzs0QkFDbEIsU0FBUyxHQUFHLE1BQU0sSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsQ0FBQzs0QkFDMUMsTUFBTTt3QkFDUCxLQUFLLFFBQVE7NEJBQ1osU0FBUyxHQUFHLE1BQU0sSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQzs0QkFDdkMsTUFBTTt3QkFDUCxLQUFLLHFCQUFxQjs0QkFDekIsU0FBUyxHQUFHLE1BQU0sSUFBSSxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxDQUFDOzRCQUM5QyxNQUFNO3dCQUNQOzRCQUNDLFlBQVksQ0FBQyxHQUFHLEVBQUUseUJBQXlCLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDOzRCQUN4RCxNQUFNO3FCQUNQO29CQUNELFlBQVksQ0FBQyxHQUFHLEVBQUUsU0FBUyxDQUFDLENBQUM7aUJBQzdCO2dCQUFDLE9BQU8sQ0FBQyxFQUFFO29CQUNYLE1BQU0sT0FBTyxHQUFHLENBQUMsWUFBWSxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBQ25FLFlBQVksQ0FBQyxHQUFHLEVBQUUsT0FBTyxDQUFDLENBQUM7b0JBQzNCLElBQUksQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLHFDQUFxQyxFQUFFLENBQUMsQ0FBQyxDQUFDO2lCQUNoRTtZQUNGLENBQUMsQ0FBQyxDQUFDO1FBQ0osQ0FBQztRQUVPLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBeUI7WUFDM0MsTUFBTSxFQUFFLFFBQVEsRUFBRSxVQUFVLEVBQUUsY0FBYyxFQUFFLFFBQVEsRUFBRSxTQUFTLEVBQUUsT0FBTyxFQUFFLGdCQUFnQixFQUFFLFlBQVksRUFBRSxrQkFBa0IsRUFBRSxlQUFlLEVBQUUsR0FBRyxJQUFJLENBQUM7WUFDekosTUFBTSxVQUFVLEdBQXNCLEVBQUUsQ0FBQztZQUN6QyxJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLEVBQUU7Z0JBQzlCLEtBQUssTUFBTSxDQUFDLElBQUksVUFBVSxFQUFFO29CQUMzQixJQUFJO3dCQUNILFVBQVUsQ0FBQyxJQUFJLENBQUMsRUFBRSxTQUFTLEVBQUUsU0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7cUJBQzdDO29CQUFDLE9BQU8sQ0FBQyxFQUFFO3dCQUNYLFNBQVM7cUJBQ1Q7aUJBQ0Q7YUFDRDtZQUNELElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsRUFBRTtnQkFDNUIsS0FBSyxNQUFNLENBQUMsSUFBSSxRQUFRLEVBQUU7b0JBQ3pCLElBQUk7d0JBQ0gsSUFBSSxJQUFBLHFDQUF5QixFQUFDLENBQUMsQ0FBQyxFQUFFOzRCQUNqQyxVQUFVLENBQUMsSUFBSSxDQUFDLEVBQUUsWUFBWSxFQUFFLFNBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO3lCQUNoRDs2QkFBTTs0QkFDTixVQUFVLENBQUMsSUFBSSxDQUFDLEVBQUUsT0FBTyxFQUFFLFNBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO3lCQUMzQztxQkFDRDtvQkFBQyxPQUFPLENBQUMsRUFBRTt3QkFDWCxTQUFTO3FCQUNUO2lCQUNEO2FBQ0Q7WUFDRCxNQUFNLGlCQUFpQixHQUFHLGtCQUFrQixDQUFDLENBQUMsQ0FBQyxTQUFHLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQztZQUN4RixNQUFNLGVBQWUsR0FBRyxDQUFDLGdCQUFnQixJQUFJLENBQUMsaUJBQWlCLElBQUksQ0FBQyxPQUFPLENBQUM7WUFDNUUsTUFBTSxjQUFjLEdBQXVCLEVBQUUsY0FBYyxFQUFFLFFBQVEsRUFBRSxTQUFTLEVBQUUsT0FBTyxFQUFFLFlBQVksRUFBRSxnQkFBZ0IsRUFBRSxlQUFlLEVBQUUsaUJBQWlCLEVBQUUsZUFBZSxFQUFFLENBQUM7WUFDakwsSUFBSSxDQUFDLFNBQVMsQ0FBQyxjQUFjLENBQUMsdUJBQXVCLEVBQUUsVUFBVSxFQUFFLGNBQWMsQ0FBQyxDQUFDO1FBQ3BGLENBQUM7UUFFTyxLQUFLLENBQUMsWUFBWSxDQUFDLElBQWlDO1lBQzNELEtBQUssTUFBTSxTQUFTLElBQUksSUFBSSxDQUFDLElBQUksRUFBRTtnQkFDbEMsTUFBTSxHQUFHLEdBQUcsU0FBRyxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsQ0FBQztnQkFDakMsTUFBTSxRQUFRLEdBQUcsR0FBRyxDQUFDLE1BQU0sS0FBSyxNQUFNLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMseUJBQXlCO2dCQUNuRixNQUFNLElBQUksQ0FBQyxTQUFTLENBQUMsY0FBYyxDQUFDLHlCQUF5QixFQUFFLFFBQVEsQ0FBQyxDQUFDO2FBQ3pFO1FBQ0YsQ0FBQztRQUVPLEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFpQztZQUMvRCxNQUFNLFdBQVcsR0FBRyxDQUFDLE1BQTRCLEVBQUUsRUFBRSxDQUFDLE1BQU0sRUFBRSxHQUFHLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFHLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUM5SCxNQUFNLFdBQVcsR0FBRztnQkFDbkIsSUFBSSxFQUFFLElBQUksQ0FBQyxJQUFJO2dCQUNmLE9BQU8sRUFBRSxXQUFXLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQztnQkFDbEMsU0FBUyxFQUFFLFdBQVcsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDO2dCQUN0QyxLQUFLLEVBQUUsSUFBSSxDQUFDLEtBQUs7YUFDakIsQ0FBQztZQUNGLE9BQU8sTUFBTSxJQUFJLENBQUMsU0FBUyxDQUFDLGNBQWMsQ0FBcUIsNkJBQTZCLEVBQUUsV0FBVyxDQUFDLENBQUM7UUFDNUcsQ0FBQztRQUVPLEtBQUssQ0FBQyxTQUFTLENBQUMsSUFBb0I7WUFDM0MsT0FBTyxNQUFNLElBQUksQ0FBQyxTQUFTLENBQUMsY0FBYyxDQUFxQiw0QkFBNEIsQ0FBQyxDQUFDO1FBQzlGLENBQUM7UUFFRCxPQUFPO1lBQ04sSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsQ0FBQztZQUVyQixJQUFJLElBQUksQ0FBQyxjQUFjLElBQUksT0FBTyxDQUFDLFFBQVEsS0FBSyxPQUFPLElBQUksRUFBRSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLEVBQUU7Z0JBQzlGLEVBQUUsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDO2FBQ25DO1FBQ0YsQ0FBQztLQUNEO0lBbElELHNDQWtJQztJQUVNLElBQU0sU0FBUyxHQUFmLE1BQU0sU0FBVSxTQUFRLGFBQWE7UUFDM0MsWUFDbUIsUUFBMEIsRUFDL0IsVUFBdUI7WUFFcEMsS0FBSyxDQUFDLFFBQVEsRUFBRSxVQUFVLEVBQUUsSUFBQSwrQkFBcUIsR0FBRSxDQUFDLENBQUM7UUFDdEQsQ0FBQztLQUNELENBQUE7SUFQWSw4QkFBUzt3QkFBVCxTQUFTO1FBRW5CLFdBQUEsa0NBQWdCLENBQUE7UUFDaEIsV0FBQSxpQkFBVyxDQUFBO09BSEQsU0FBUyxDQU9yQiJ9