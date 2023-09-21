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
define(["require", "exports", "vs/base/common/decorators", "vs/base/common/path", "vs/base/common/platform", "vs/base/parts/ipc/node/ipc.net", "vs/platform/environment/common/environment", "vs/platform/environment/node/environmentService", "vs/platform/instantiation/common/instantiation"], function (require, exports, decorators_1, path_1, platform_1, ipc_net_1, environment_1, environmentService_1, instantiation_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$o5b = exports.$n5b = void 0;
    exports.$n5b = (0, instantiation_1.$Ch)(environment_1.$Ih);
    class $o5b extends environmentService_1.$_l {
        constructor() {
            super(...arguments);
            this.d = {};
        }
        get cachedLanguagesPath() { return (0, path_1.$9d)(this.userDataPath, 'clp'); }
        get backupHome() { return (0, path_1.$9d)(this.userDataPath, 'Backups'); }
        get mainIPCHandle() { return (0, ipc_net_1.$uh)(this.userDataPath, 'main', this.c.version); }
        get mainLockfile() { return (0, path_1.$9d)(this.userDataPath, 'code.lock'); }
        get disableUpdates() { return !!this.args['disable-updates']; }
        get crossOriginIsolated() { return !!this.args['enable-coi']; }
        get codeCachePath() { return process.env['VSCODE_CODE_CACHE_PATH'] || undefined; }
        get useCodeCache() { return !!this.codeCachePath; }
        unsetSnapExportedVariables() {
            if (!platform_1.$k) {
                return;
            }
            for (const key in process.env) {
                if (key.endsWith('_VSCODE_SNAP_ORIG')) {
                    const originalKey = key.slice(0, -17); // Remove the _VSCODE_SNAP_ORIG suffix
                    if (this.d[originalKey]) {
                        continue;
                    }
                    // Preserve the original value in case the snap env is re-entered
                    if (process.env[originalKey]) {
                        this.d[originalKey] = process.env[originalKey];
                    }
                    // Copy the original value from before entering the snap env if available,
                    // if not delete the env variable.
                    if (process.env[key]) {
                        process.env[originalKey] = process.env[key];
                    }
                    else {
                        delete process.env[originalKey];
                    }
                }
            }
        }
        restoreSnapExportedVariables() {
            if (!platform_1.$k) {
                return;
            }
            for (const key in this.d) {
                process.env[key] = this.d[key];
                delete this.d[key];
            }
        }
    }
    exports.$o5b = $o5b;
    __decorate([
        decorators_1.$6g
    ], $o5b.prototype, "cachedLanguagesPath", null);
    __decorate([
        decorators_1.$6g
    ], $o5b.prototype, "backupHome", null);
    __decorate([
        decorators_1.$6g
    ], $o5b.prototype, "mainIPCHandle", null);
    __decorate([
        decorators_1.$6g
    ], $o5b.prototype, "mainLockfile", null);
    __decorate([
        decorators_1.$6g
    ], $o5b.prototype, "disableUpdates", null);
    __decorate([
        decorators_1.$6g
    ], $o5b.prototype, "crossOriginIsolated", null);
    __decorate([
        decorators_1.$6g
    ], $o5b.prototype, "codeCachePath", null);
    __decorate([
        decorators_1.$6g
    ], $o5b.prototype, "useCodeCache", null);
});
//# sourceMappingURL=environmentMainService.js.map