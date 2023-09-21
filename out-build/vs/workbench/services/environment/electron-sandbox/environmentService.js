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
define(["require", "exports", "vs/platform/environment/common/environment", "vs/platform/instantiation/common/instantiation", "vs/platform/environment/common/environmentService", "vs/base/common/decorators", "vs/base/common/network", "vs/base/common/resources"], function (require, exports, environment_1, instantiation_1, environmentService_1, decorators_1, network_1, resources_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$2$b = exports.$1$b = void 0;
    exports.$1$b = (0, instantiation_1.$Ch)(environment_1.$Ih);
    class $2$b extends environmentService_1.$9l {
        get mainPid() { return this.d.mainPid; }
        get machineId() { return this.d.machineId; }
        get remoteAuthority() { return this.d.remoteAuthority; }
        get expectsResolverExtension() { return !!this.d.remoteAuthority?.includes('+'); }
        get execPath() { return this.d.execPath; }
        get backupPath() { return this.d.backupPath; }
        get window() {
            return {
                id: this.d.windowId,
                colorScheme: this.d.colorScheme,
                maximized: this.d.maximized,
                accessibilitySupport: this.d.accessibilitySupport,
                perfMarks: this.d.perfMarks,
                isInitialStartup: this.d.isInitialStartup,
                isCodeCaching: typeof this.d.codeCachePath === 'string'
            };
        }
        get windowLogsPath() { return (0, resources_1.$ig)(this.logsHome, `window${this.d.windowId}`); }
        get logFile() { return (0, resources_1.$ig)(this.windowLogsPath, `renderer.log`); }
        get extHostLogsPath() { return (0, resources_1.$ig)(this.windowLogsPath, 'exthost'); }
        get extHostTelemetryLogFile() {
            return (0, resources_1.$ig)(this.extHostLogsPath, 'extensionTelemetry.log');
        }
        get webviewExternalEndpoint() { return `${network_1.Schemas.vscodeWebview}://{{uuid}}`; }
        get skipReleaseNotes() { return !!this.args['skip-release-notes']; }
        get skipWelcome() { return !!this.args['skip-welcome']; }
        get logExtensionHostCommunication() { return !!this.args.logExtensionHostCommunication; }
        get enableSmokeTestDriver() { return !!this.args['enable-smoke-test-driver']; }
        get extensionEnabledProposedApi() {
            if (Array.isArray(this.args['enable-proposed-api'])) {
                return this.args['enable-proposed-api'];
            }
            if ('enable-proposed-api' in this.args) {
                return [];
            }
            return undefined;
        }
        get os() { return this.d.os; }
        get filesToOpenOrCreate() { return this.d.filesToOpenOrCreate; }
        get filesToDiff() { return this.d.filesToDiff; }
        get filesToMerge() { return this.d.filesToMerge; }
        get filesToWait() { return this.d.filesToWait; }
        constructor(d, productService) {
            super(d, { homeDir: d.homeDir, tmpDir: d.tmpDir, userDataDir: d.userDataDir }, productService);
            this.d = d;
        }
    }
    exports.$2$b = $2$b;
    __decorate([
        decorators_1.$6g
    ], $2$b.prototype, "mainPid", null);
    __decorate([
        decorators_1.$6g
    ], $2$b.prototype, "machineId", null);
    __decorate([
        decorators_1.$6g
    ], $2$b.prototype, "remoteAuthority", null);
    __decorate([
        decorators_1.$6g
    ], $2$b.prototype, "expectsResolverExtension", null);
    __decorate([
        decorators_1.$6g
    ], $2$b.prototype, "execPath", null);
    __decorate([
        decorators_1.$6g
    ], $2$b.prototype, "backupPath", null);
    __decorate([
        decorators_1.$6g
    ], $2$b.prototype, "window", null);
    __decorate([
        decorators_1.$6g
    ], $2$b.prototype, "windowLogsPath", null);
    __decorate([
        decorators_1.$6g
    ], $2$b.prototype, "logFile", null);
    __decorate([
        decorators_1.$6g
    ], $2$b.prototype, "extHostLogsPath", null);
    __decorate([
        decorators_1.$6g
    ], $2$b.prototype, "extHostTelemetryLogFile", null);
    __decorate([
        decorators_1.$6g
    ], $2$b.prototype, "webviewExternalEndpoint", null);
    __decorate([
        decorators_1.$6g
    ], $2$b.prototype, "skipReleaseNotes", null);
    __decorate([
        decorators_1.$6g
    ], $2$b.prototype, "skipWelcome", null);
    __decorate([
        decorators_1.$6g
    ], $2$b.prototype, "logExtensionHostCommunication", null);
    __decorate([
        decorators_1.$6g
    ], $2$b.prototype, "enableSmokeTestDriver", null);
    __decorate([
        decorators_1.$6g
    ], $2$b.prototype, "extensionEnabledProposedApi", null);
    __decorate([
        decorators_1.$6g
    ], $2$b.prototype, "os", null);
    __decorate([
        decorators_1.$6g
    ], $2$b.prototype, "filesToOpenOrCreate", null);
    __decorate([
        decorators_1.$6g
    ], $2$b.prototype, "filesToDiff", null);
    __decorate([
        decorators_1.$6g
    ], $2$b.prototype, "filesToMerge", null);
    __decorate([
        decorators_1.$6g
    ], $2$b.prototype, "filesToWait", null);
});
//# sourceMappingURL=environmentService.js.map