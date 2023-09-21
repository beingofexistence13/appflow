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
    exports.EnvironmentMainService = exports.IEnvironmentMainService = void 0;
    exports.IEnvironmentMainService = (0, instantiation_1.refineServiceDecorator)(environment_1.IEnvironmentService);
    class EnvironmentMainService extends environmentService_1.NativeEnvironmentService {
        constructor() {
            super(...arguments);
            this._snapEnv = {};
        }
        get cachedLanguagesPath() { return (0, path_1.join)(this.userDataPath, 'clp'); }
        get backupHome() { return (0, path_1.join)(this.userDataPath, 'Backups'); }
        get mainIPCHandle() { return (0, ipc_net_1.createStaticIPCHandle)(this.userDataPath, 'main', this.productService.version); }
        get mainLockfile() { return (0, path_1.join)(this.userDataPath, 'code.lock'); }
        get disableUpdates() { return !!this.args['disable-updates']; }
        get crossOriginIsolated() { return !!this.args['enable-coi']; }
        get codeCachePath() { return process.env['VSCODE_CODE_CACHE_PATH'] || undefined; }
        get useCodeCache() { return !!this.codeCachePath; }
        unsetSnapExportedVariables() {
            if (!platform_1.isLinux) {
                return;
            }
            for (const key in process.env) {
                if (key.endsWith('_VSCODE_SNAP_ORIG')) {
                    const originalKey = key.slice(0, -17); // Remove the _VSCODE_SNAP_ORIG suffix
                    if (this._snapEnv[originalKey]) {
                        continue;
                    }
                    // Preserve the original value in case the snap env is re-entered
                    if (process.env[originalKey]) {
                        this._snapEnv[originalKey] = process.env[originalKey];
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
            if (!platform_1.isLinux) {
                return;
            }
            for (const key in this._snapEnv) {
                process.env[key] = this._snapEnv[key];
                delete this._snapEnv[key];
            }
        }
    }
    exports.EnvironmentMainService = EnvironmentMainService;
    __decorate([
        decorators_1.memoize
    ], EnvironmentMainService.prototype, "cachedLanguagesPath", null);
    __decorate([
        decorators_1.memoize
    ], EnvironmentMainService.prototype, "backupHome", null);
    __decorate([
        decorators_1.memoize
    ], EnvironmentMainService.prototype, "mainIPCHandle", null);
    __decorate([
        decorators_1.memoize
    ], EnvironmentMainService.prototype, "mainLockfile", null);
    __decorate([
        decorators_1.memoize
    ], EnvironmentMainService.prototype, "disableUpdates", null);
    __decorate([
        decorators_1.memoize
    ], EnvironmentMainService.prototype, "crossOriginIsolated", null);
    __decorate([
        decorators_1.memoize
    ], EnvironmentMainService.prototype, "codeCachePath", null);
    __decorate([
        decorators_1.memoize
    ], EnvironmentMainService.prototype, "useCodeCache", null);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZW52aXJvbm1lbnRNYWluU2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3BsYXRmb3JtL2Vudmlyb25tZW50L2VsZWN0cm9uLW1haW4vZW52aXJvbm1lbnRNYWluU2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7SUFVbkYsUUFBQSx1QkFBdUIsR0FBRyxJQUFBLHNDQUFzQixFQUErQyxpQ0FBbUIsQ0FBQyxDQUFDO0lBNkJqSSxNQUFhLHNCQUF1QixTQUFRLDZDQUF3QjtRQUFwRTs7WUFFUyxhQUFRLEdBQTJCLEVBQUUsQ0FBQztRQTREL0MsQ0FBQztRQXpEQSxJQUFJLG1CQUFtQixLQUFhLE9BQU8sSUFBQSxXQUFJLEVBQUMsSUFBSSxDQUFDLFlBQVksRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFHNUUsSUFBSSxVQUFVLEtBQWEsT0FBTyxJQUFBLFdBQUksRUFBQyxJQUFJLENBQUMsWUFBWSxFQUFFLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUd2RSxJQUFJLGFBQWEsS0FBYSxPQUFPLElBQUEsK0JBQXFCLEVBQUMsSUFBSSxDQUFDLFlBQVksRUFBRSxNQUFNLEVBQUUsSUFBSSxDQUFDLGNBQWMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFHckgsSUFBSSxZQUFZLEtBQWEsT0FBTyxJQUFBLFdBQUksRUFBQyxJQUFJLENBQUMsWUFBWSxFQUFFLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUczRSxJQUFJLGNBQWMsS0FBYyxPQUFPLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLENBQUMsQ0FBQyxDQUFDO1FBR3hFLElBQUksbUJBQW1CLEtBQWMsT0FBTyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFHeEUsSUFBSSxhQUFhLEtBQXlCLE9BQU8sT0FBTyxDQUFDLEdBQUcsQ0FBQyx3QkFBd0IsQ0FBQyxJQUFJLFNBQVMsQ0FBQyxDQUFDLENBQUM7UUFHdEcsSUFBSSxZQUFZLEtBQWMsT0FBTyxDQUFDLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUM7UUFFNUQsMEJBQTBCO1lBQ3pCLElBQUksQ0FBQyxrQkFBTyxFQUFFO2dCQUNiLE9BQU87YUFDUDtZQUNELEtBQUssTUFBTSxHQUFHLElBQUksT0FBTyxDQUFDLEdBQUcsRUFBRTtnQkFDOUIsSUFBSSxHQUFHLENBQUMsUUFBUSxDQUFDLG1CQUFtQixDQUFDLEVBQUU7b0JBQ3RDLE1BQU0sV0FBVyxHQUFHLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxzQ0FBc0M7b0JBQzdFLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUMsRUFBRTt3QkFDL0IsU0FBUztxQkFDVDtvQkFDRCxpRUFBaUU7b0JBQ2pFLElBQUksT0FBTyxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsRUFBRTt3QkFDN0IsSUFBSSxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUMsR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBRSxDQUFDO3FCQUN2RDtvQkFDRCwwRUFBMEU7b0JBQzFFLGtDQUFrQztvQkFDbEMsSUFBSSxPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUFFO3dCQUNyQixPQUFPLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7cUJBQzVDO3lCQUFNO3dCQUNOLE9BQU8sT0FBTyxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsQ0FBQztxQkFDaEM7aUJBQ0Q7YUFDRDtRQUNGLENBQUM7UUFFRCw0QkFBNEI7WUFDM0IsSUFBSSxDQUFDLGtCQUFPLEVBQUU7Z0JBQ2IsT0FBTzthQUNQO1lBQ0QsS0FBSyxNQUFNLEdBQUcsSUFBSSxJQUFJLENBQUMsUUFBUSxFQUFFO2dCQUNoQyxPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUM7Z0JBQ3RDLE9BQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQzthQUMxQjtRQUNGLENBQUM7S0FDRDtJQTlERCx3REE4REM7SUF6REE7UUFEQyxvQkFBTztxRUFDb0U7SUFHNUU7UUFEQyxvQkFBTzs0REFDK0Q7SUFHdkU7UUFEQyxvQkFBTzsrREFDNkc7SUFHckg7UUFEQyxvQkFBTzs4REFDbUU7SUFHM0U7UUFEQyxvQkFBTztnRUFDZ0U7SUFHeEU7UUFEQyxvQkFBTztxRUFDZ0U7SUFHeEU7UUFEQyxvQkFBTzsrREFDOEY7SUFHdEc7UUFEQyxvQkFBTzs4REFDb0QifQ==