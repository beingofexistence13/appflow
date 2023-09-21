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
define(["require", "exports", "vs/nls!vs/server/node/serverEnvironmentService", "vs/platform/environment/node/environmentService", "vs/platform/environment/node/argv", "vs/platform/instantiation/common/instantiation", "vs/platform/environment/common/environment", "vs/base/common/decorators"], function (require, exports, nls, environmentService_1, argv_1, instantiation_1, environment_1, decorators_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$em = exports.$dm = exports.$cm = void 0;
    exports.$cm = {
        /* ----- server setup ----- */
        'host': { type: 'string', cat: 'o', args: 'ip-address', description: nls.localize(0, null) },
        'port': { type: 'string', cat: 'o', args: 'port | port range', description: nls.localize(1, null) },
        'socket-path': { type: 'string', cat: 'o', args: 'path', description: nls.localize(2, null) },
        'connection-token': { type: 'string', cat: 'o', args: 'token', deprecates: ['connectionToken'], description: nls.localize(3, null) },
        'connection-token-file': { type: 'string', cat: 'o', args: 'path', deprecates: ['connection-secret', 'connectionTokenFile'], description: nls.localize(4, null) },
        'without-connection-token': { type: 'boolean', cat: 'o', description: nls.localize(5, null) },
        'disable-websocket-compression': { type: 'boolean' },
        'print-startup-performance': { type: 'boolean' },
        'print-ip-address': { type: 'boolean' },
        'accept-server-license-terms': { type: 'boolean', cat: 'o', description: nls.localize(6, null) },
        'server-data-dir': { type: 'string', cat: 'o', description: nls.localize(7, null) },
        'telemetry-level': { type: 'string', cat: 'o', args: 'level', description: nls.localize(8, null) },
        /* ----- vs code options ---	-- */
        'user-data-dir': argv_1.$yl['user-data-dir'],
        'enable-smoke-test-driver': argv_1.$yl['enable-smoke-test-driver'],
        'disable-telemetry': argv_1.$yl['disable-telemetry'],
        'disable-workspace-trust': argv_1.$yl['disable-workspace-trust'],
        'file-watcher-polling': { type: 'string', deprecates: ['fileWatcherPolling'] },
        'log': argv_1.$yl['log'],
        'logsPath': argv_1.$yl['logsPath'],
        'force-disable-user-env': argv_1.$yl['force-disable-user-env'],
        /* ----- vs code web options ----- */
        'folder': { type: 'string', deprecationMessage: 'No longer supported. Folder needs to be provided in the browser URL or with `default-folder`.' },
        'workspace': { type: 'string', deprecationMessage: 'No longer supported. Workspace needs to be provided in the browser URL or with `default-workspace`.' },
        'default-folder': { type: 'string', description: nls.localize(9, null) },
        'default-workspace': { type: 'string', description: nls.localize(10, null) },
        'enable-sync': { type: 'boolean' },
        'github-auth': { type: 'string' },
        'use-test-resolver': { type: 'boolean' },
        /* ----- extension management ----- */
        'extensions-dir': argv_1.$yl['extensions-dir'],
        'extensions-download-dir': argv_1.$yl['extensions-download-dir'],
        'builtin-extensions-dir': argv_1.$yl['builtin-extensions-dir'],
        'install-extension': argv_1.$yl['install-extension'],
        'install-builtin-extension': argv_1.$yl['install-builtin-extension'],
        'uninstall-extension': argv_1.$yl['uninstall-extension'],
        'list-extensions': argv_1.$yl['list-extensions'],
        'locate-extension': argv_1.$yl['locate-extension'],
        'show-versions': argv_1.$yl['show-versions'],
        'category': argv_1.$yl['category'],
        'force': argv_1.$yl['force'],
        'do-not-sync': argv_1.$yl['do-not-sync'],
        'pre-release': argv_1.$yl['pre-release'],
        'start-server': { type: 'boolean', cat: 'e', description: nls.localize(11, null) },
        /* ----- remote development options ----- */
        'enable-remote-auto-shutdown': { type: 'boolean' },
        'remote-auto-shutdown-without-delay': { type: 'boolean' },
        'use-host-proxy': { type: 'boolean' },
        'without-browser-env-var': { type: 'boolean' },
        /* ----- server cli ----- */
        'help': argv_1.$yl['help'],
        'version': argv_1.$yl['version'],
        'locate-shell-integration-path': argv_1.$yl['locate-shell-integration-path'],
        'compatibility': { type: 'string' },
        _: argv_1.$yl['_']
    };
    exports.$dm = (0, instantiation_1.$Ch)(environment_1.$Ih);
    class $em extends environmentService_1.$_l {
        get userRoamingDataHome() { return this.appSettingsHome; }
        get args() { return super.args; }
    }
    exports.$em = $em;
    __decorate([
        decorators_1.$6g
    ], $em.prototype, "userRoamingDataHome", null);
});
//# sourceMappingURL=serverEnvironmentService.js.map