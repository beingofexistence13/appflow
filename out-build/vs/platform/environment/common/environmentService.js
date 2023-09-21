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
define(["require", "exports", "vs/base/common/date", "vs/base/common/decorators", "vs/base/common/network", "vs/base/common/path", "vs/base/common/process", "vs/base/common/resources", "vs/base/common/uri"], function (require, exports, date_1, decorators_1, network_1, path_1, process_1, resources_1, uri_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$$l = exports.$0l = exports.$9l = exports.$8l = void 0;
    exports.$8l = /^([^.]+\..+):(.+)$/;
    class $9l {
        get appRoot() { return (0, path_1.$_d)(network_1.$2f.asFileUri('').fsPath); }
        get userHome() { return uri_1.URI.file(this.b.homeDir); }
        get userDataPath() { return this.b.userDataDir; }
        get appSettingsHome() { return uri_1.URI.file((0, path_1.$9d)(this.userDataPath, 'User')); }
        get tmpDir() { return uri_1.URI.file(this.b.tmpDir); }
        get cacheHome() { return uri_1.URI.file(this.userDataPath); }
        get stateResource() { return (0, resources_1.$ig)(this.appSettingsHome, 'globalStorage', 'storage.json'); }
        get userRoamingDataHome() { return this.appSettingsHome.with({ scheme: network_1.Schemas.vscodeUserData }); }
        get userDataSyncHome() { return (0, resources_1.$ig)(this.appSettingsHome, 'sync'); }
        get logsHome() {
            if (!this.args.logsPath) {
                const key = (0, date_1.$7l)(new Date()).replace(/-|:|\.\d+Z$/g, '');
                this.args.logsPath = (0, path_1.$9d)(this.userDataPath, 'logs', key);
            }
            return uri_1.URI.file(this.args.logsPath);
        }
        get sync() { return this.args.sync; }
        get machineSettingsResource() { return (0, resources_1.$ig)(uri_1.URI.file((0, path_1.$9d)(this.userDataPath, 'Machine')), 'settings.json'); }
        get workspaceStorageHome() { return (0, resources_1.$ig)(this.appSettingsHome, 'workspaceStorage'); }
        get localHistoryHome() { return (0, resources_1.$ig)(this.appSettingsHome, 'History'); }
        get keyboardLayoutResource() { return (0, resources_1.$ig)(this.userRoamingDataHome, 'keyboardLayout.json'); }
        get argvResource() {
            const vscodePortable = process_1.env['VSCODE_PORTABLE'];
            if (vscodePortable) {
                return uri_1.URI.file((0, path_1.$9d)(vscodePortable, 'argv.json'));
            }
            return (0, resources_1.$ig)(this.userHome, this.c.dataFolderName, 'argv.json');
        }
        get isExtensionDevelopment() { return !!this.args.extensionDevelopmentPath; }
        get untitledWorkspacesHome() { return uri_1.URI.file((0, path_1.$9d)(this.userDataPath, 'Workspaces')); }
        get builtinExtensionsPath() {
            const cliBuiltinExtensionsDir = this.args['builtin-extensions-dir'];
            if (cliBuiltinExtensionsDir) {
                return (0, path_1.$0d)(cliBuiltinExtensionsDir);
            }
            return (0, path_1.$7d)((0, path_1.$9d)(network_1.$2f.asFileUri('').fsPath, '..', 'extensions'));
        }
        get extensionsDownloadLocation() {
            const cliExtensionsDownloadDir = this.args['extensions-download-dir'];
            if (cliExtensionsDownloadDir) {
                return uri_1.URI.file((0, path_1.$0d)(cliExtensionsDownloadDir));
            }
            return uri_1.URI.file((0, path_1.$9d)(this.userDataPath, 'CachedExtensionVSIXs'));
        }
        get extensionsPath() {
            const cliExtensionsDir = this.args['extensions-dir'];
            if (cliExtensionsDir) {
                return (0, path_1.$0d)(cliExtensionsDir);
            }
            const vscodeExtensions = process_1.env['VSCODE_EXTENSIONS'];
            if (vscodeExtensions) {
                return vscodeExtensions;
            }
            const vscodePortable = process_1.env['VSCODE_PORTABLE'];
            if (vscodePortable) {
                return (0, path_1.$9d)(vscodePortable, 'extensions');
            }
            return (0, resources_1.$ig)(this.userHome, this.c.dataFolderName, 'extensions').fsPath;
        }
        get extensionDevelopmentLocationURI() {
            const extensionDevelopmentPaths = this.args.extensionDevelopmentPath;
            if (Array.isArray(extensionDevelopmentPaths)) {
                return extensionDevelopmentPaths.map(extensionDevelopmentPath => {
                    if (/^[^:/?#]+?:\/\//.test(extensionDevelopmentPath)) {
                        return uri_1.URI.parse(extensionDevelopmentPath);
                    }
                    return uri_1.URI.file((0, path_1.$7d)(extensionDevelopmentPath));
                });
            }
            return undefined;
        }
        get extensionDevelopmentKind() {
            return this.args.extensionDevelopmentKind?.map(kind => kind === 'ui' || kind === 'workspace' || kind === 'web' ? kind : 'workspace');
        }
        get extensionTestsLocationURI() {
            const extensionTestsPath = this.args.extensionTestsPath;
            if (extensionTestsPath) {
                if (/^[^:/?#]+?:\/\//.test(extensionTestsPath)) {
                    return uri_1.URI.parse(extensionTestsPath);
                }
                return uri_1.URI.file((0, path_1.$7d)(extensionTestsPath));
            }
            return undefined;
        }
        get disableExtensions() {
            if (this.args['disable-extensions']) {
                return true;
            }
            const disableExtensions = this.args['disable-extension'];
            if (disableExtensions) {
                if (typeof disableExtensions === 'string') {
                    return [disableExtensions];
                }
                if (Array.isArray(disableExtensions) && disableExtensions.length > 0) {
                    return disableExtensions;
                }
            }
            return false;
        }
        get debugExtensionHost() { return $0l(this.args, this.isBuilt); }
        get debugRenderer() { return !!this.args.debugRenderer; }
        get isBuilt() { return !process_1.env['VSCODE_DEV']; }
        get verbose() { return !!this.args.verbose; }
        get logLevel() { return this.args.log?.find(entry => !exports.$8l.test(entry)); }
        get extensionLogLevel() {
            const result = [];
            for (const entry of this.args.log || []) {
                const matches = exports.$8l.exec(entry);
                if (matches && matches[1] && matches[2]) {
                    result.push([matches[1], matches[2]]);
                }
            }
            return result.length ? result : undefined;
        }
        get serviceMachineIdResource() { return (0, resources_1.$ig)(uri_1.URI.file(this.userDataPath), 'machineid'); }
        get crashReporterId() { return this.args['crash-reporter-id']; }
        get crashReporterDirectory() { return this.args['crash-reporter-directory']; }
        get disableTelemetry() { return !!this.args['disable-telemetry']; }
        get disableWorkspaceTrust() { return !!this.args['disable-workspace-trust']; }
        get useInMemorySecretStorage() { return !!this.args['use-inmemory-secretstorage']; }
        get policyFile() {
            if (this.args['__enable-file-policy']) {
                const vscodePortable = process_1.env['VSCODE_PORTABLE'];
                if (vscodePortable) {
                    return uri_1.URI.file((0, path_1.$9d)(vscodePortable, 'policy.json'));
                }
                return (0, resources_1.$ig)(this.userHome, this.c.dataFolderName, 'policy.json');
            }
            return undefined;
        }
        get continueOn() {
            return this.args['continueOn'];
        }
        set continueOn(value) {
            this.args['continueOn'] = value;
        }
        get args() { return this.a; }
        constructor(a, b, c) {
            this.a = a;
            this.b = b;
            this.c = c;
            this.editSessionId = this.args['editSessionId'];
        }
    }
    exports.$9l = $9l;
    __decorate([
        decorators_1.$6g
    ], $9l.prototype, "appRoot", null);
    __decorate([
        decorators_1.$6g
    ], $9l.prototype, "userHome", null);
    __decorate([
        decorators_1.$6g
    ], $9l.prototype, "userDataPath", null);
    __decorate([
        decorators_1.$6g
    ], $9l.prototype, "appSettingsHome", null);
    __decorate([
        decorators_1.$6g
    ], $9l.prototype, "tmpDir", null);
    __decorate([
        decorators_1.$6g
    ], $9l.prototype, "cacheHome", null);
    __decorate([
        decorators_1.$6g
    ], $9l.prototype, "stateResource", null);
    __decorate([
        decorators_1.$6g
    ], $9l.prototype, "userRoamingDataHome", null);
    __decorate([
        decorators_1.$6g
    ], $9l.prototype, "userDataSyncHome", null);
    __decorate([
        decorators_1.$6g
    ], $9l.prototype, "sync", null);
    __decorate([
        decorators_1.$6g
    ], $9l.prototype, "machineSettingsResource", null);
    __decorate([
        decorators_1.$6g
    ], $9l.prototype, "workspaceStorageHome", null);
    __decorate([
        decorators_1.$6g
    ], $9l.prototype, "localHistoryHome", null);
    __decorate([
        decorators_1.$6g
    ], $9l.prototype, "keyboardLayoutResource", null);
    __decorate([
        decorators_1.$6g
    ], $9l.prototype, "argvResource", null);
    __decorate([
        decorators_1.$6g
    ], $9l.prototype, "isExtensionDevelopment", null);
    __decorate([
        decorators_1.$6g
    ], $9l.prototype, "untitledWorkspacesHome", null);
    __decorate([
        decorators_1.$6g
    ], $9l.prototype, "builtinExtensionsPath", null);
    __decorate([
        decorators_1.$6g
    ], $9l.prototype, "extensionsPath", null);
    __decorate([
        decorators_1.$6g
    ], $9l.prototype, "extensionDevelopmentLocationURI", null);
    __decorate([
        decorators_1.$6g
    ], $9l.prototype, "extensionDevelopmentKind", null);
    __decorate([
        decorators_1.$6g
    ], $9l.prototype, "extensionTestsLocationURI", null);
    __decorate([
        decorators_1.$6g
    ], $9l.prototype, "debugExtensionHost", null);
    __decorate([
        decorators_1.$6g
    ], $9l.prototype, "logLevel", null);
    __decorate([
        decorators_1.$6g
    ], $9l.prototype, "extensionLogLevel", null);
    __decorate([
        decorators_1.$6g
    ], $9l.prototype, "serviceMachineIdResource", null);
    __decorate([
        decorators_1.$6g
    ], $9l.prototype, "disableTelemetry", null);
    __decorate([
        decorators_1.$6g
    ], $9l.prototype, "disableWorkspaceTrust", null);
    __decorate([
        decorators_1.$6g
    ], $9l.prototype, "useInMemorySecretStorage", null);
    __decorate([
        decorators_1.$6g
    ], $9l.prototype, "policyFile", null);
    function $0l(args, isBuilt) {
        return $$l(args['inspect-extensions'], args['inspect-brk-extensions'], 5870, isBuilt, args.debugId, args.extensionEnvironment);
    }
    exports.$0l = $0l;
    function $$l(debugArg, debugBrkArg, defaultBuildPort, isBuilt, debugId, environmentString) {
        const portStr = debugBrkArg || debugArg;
        const port = Number(portStr) || (!isBuilt ? defaultBuildPort : null);
        const brk = port ? Boolean(!!debugBrkArg) : false;
        let env;
        if (environmentString) {
            try {
                env = JSON.parse(environmentString);
            }
            catch {
                // ignore
            }
        }
        return { port, break: brk, debugId, env };
    }
    exports.$$l = $$l;
});
//# sourceMappingURL=environmentService.js.map