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
define(["require", "exports", "vs/base/common/lifecycle", "vs/base/common/network", "vs/base/parts/ipc/node/ipc.cp", "vs/platform/environment/common/environment", "vs/platform/environment/node/environmentService"], function (require, exports, lifecycle_1, network_1, ipc_cp_1, environment_1, environmentService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$uN = void 0;
    let $uN = class $uN extends lifecycle_1.$kc {
        constructor(a, b) {
            super();
            this.a = a;
            this.b = b;
        }
        start() {
            const opts = {
                serverName: 'Pty Host',
                args: ['--type=ptyHost', '--logsPath', this.b.logsHome.with({ scheme: network_1.Schemas.file }).fsPath],
                env: {
                    VSCODE_AMD_ENTRYPOINT: 'vs/platform/terminal/node/ptyHostMain',
                    VSCODE_PIPE_LOGGING: 'true',
                    VSCODE_VERBOSE_LOGGING: 'true',
                    VSCODE_RECONNECT_GRACE_TIME: this.a.graceTime,
                    VSCODE_RECONNECT_SHORT_GRACE_TIME: this.a.shortGraceTime,
                    VSCODE_RECONNECT_SCROLLBACK: this.a.scrollback
                }
            };
            const ptyHostDebug = (0, environmentService_1.$am)(this.b.args, this.b.isBuilt);
            if (ptyHostDebug) {
                if (ptyHostDebug.break && ptyHostDebug.port) {
                    opts.debugBrk = ptyHostDebug.port;
                }
                else if (!ptyHostDebug.break && ptyHostDebug.port) {
                    opts.debug = ptyHostDebug.port;
                }
            }
            const client = new ipc_cp_1.$Sp(network_1.$2f.asFileUri('bootstrap-fork').fsPath, opts);
            const store = new lifecycle_1.$jc();
            store.add(client);
            return {
                client,
                store,
                onDidProcessExit: client.onDidProcessExit
            };
        }
    };
    exports.$uN = $uN;
    exports.$uN = $uN = __decorate([
        __param(1, environment_1.$Ih)
    ], $uN);
});
//# sourceMappingURL=nodePtyHostStarter.js.map