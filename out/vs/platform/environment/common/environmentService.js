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
    exports.parseDebugParams = exports.parseExtensionHostDebugPort = exports.AbstractNativeEnvironmentService = exports.EXTENSION_IDENTIFIER_WITH_LOG_REGEX = void 0;
    exports.EXTENSION_IDENTIFIER_WITH_LOG_REGEX = /^([^.]+\..+):(.+)$/;
    class AbstractNativeEnvironmentService {
        get appRoot() { return (0, path_1.dirname)(network_1.FileAccess.asFileUri('').fsPath); }
        get userHome() { return uri_1.URI.file(this.paths.homeDir); }
        get userDataPath() { return this.paths.userDataDir; }
        get appSettingsHome() { return uri_1.URI.file((0, path_1.join)(this.userDataPath, 'User')); }
        get tmpDir() { return uri_1.URI.file(this.paths.tmpDir); }
        get cacheHome() { return uri_1.URI.file(this.userDataPath); }
        get stateResource() { return (0, resources_1.joinPath)(this.appSettingsHome, 'globalStorage', 'storage.json'); }
        get userRoamingDataHome() { return this.appSettingsHome.with({ scheme: network_1.Schemas.vscodeUserData }); }
        get userDataSyncHome() { return (0, resources_1.joinPath)(this.appSettingsHome, 'sync'); }
        get logsHome() {
            if (!this.args.logsPath) {
                const key = (0, date_1.toLocalISOString)(new Date()).replace(/-|:|\.\d+Z$/g, '');
                this.args.logsPath = (0, path_1.join)(this.userDataPath, 'logs', key);
            }
            return uri_1.URI.file(this.args.logsPath);
        }
        get sync() { return this.args.sync; }
        get machineSettingsResource() { return (0, resources_1.joinPath)(uri_1.URI.file((0, path_1.join)(this.userDataPath, 'Machine')), 'settings.json'); }
        get workspaceStorageHome() { return (0, resources_1.joinPath)(this.appSettingsHome, 'workspaceStorage'); }
        get localHistoryHome() { return (0, resources_1.joinPath)(this.appSettingsHome, 'History'); }
        get keyboardLayoutResource() { return (0, resources_1.joinPath)(this.userRoamingDataHome, 'keyboardLayout.json'); }
        get argvResource() {
            const vscodePortable = process_1.env['VSCODE_PORTABLE'];
            if (vscodePortable) {
                return uri_1.URI.file((0, path_1.join)(vscodePortable, 'argv.json'));
            }
            return (0, resources_1.joinPath)(this.userHome, this.productService.dataFolderName, 'argv.json');
        }
        get isExtensionDevelopment() { return !!this.args.extensionDevelopmentPath; }
        get untitledWorkspacesHome() { return uri_1.URI.file((0, path_1.join)(this.userDataPath, 'Workspaces')); }
        get builtinExtensionsPath() {
            const cliBuiltinExtensionsDir = this.args['builtin-extensions-dir'];
            if (cliBuiltinExtensionsDir) {
                return (0, path_1.resolve)(cliBuiltinExtensionsDir);
            }
            return (0, path_1.normalize)((0, path_1.join)(network_1.FileAccess.asFileUri('').fsPath, '..', 'extensions'));
        }
        get extensionsDownloadLocation() {
            const cliExtensionsDownloadDir = this.args['extensions-download-dir'];
            if (cliExtensionsDownloadDir) {
                return uri_1.URI.file((0, path_1.resolve)(cliExtensionsDownloadDir));
            }
            return uri_1.URI.file((0, path_1.join)(this.userDataPath, 'CachedExtensionVSIXs'));
        }
        get extensionsPath() {
            const cliExtensionsDir = this.args['extensions-dir'];
            if (cliExtensionsDir) {
                return (0, path_1.resolve)(cliExtensionsDir);
            }
            const vscodeExtensions = process_1.env['VSCODE_EXTENSIONS'];
            if (vscodeExtensions) {
                return vscodeExtensions;
            }
            const vscodePortable = process_1.env['VSCODE_PORTABLE'];
            if (vscodePortable) {
                return (0, path_1.join)(vscodePortable, 'extensions');
            }
            return (0, resources_1.joinPath)(this.userHome, this.productService.dataFolderName, 'extensions').fsPath;
        }
        get extensionDevelopmentLocationURI() {
            const extensionDevelopmentPaths = this.args.extensionDevelopmentPath;
            if (Array.isArray(extensionDevelopmentPaths)) {
                return extensionDevelopmentPaths.map(extensionDevelopmentPath => {
                    if (/^[^:/?#]+?:\/\//.test(extensionDevelopmentPath)) {
                        return uri_1.URI.parse(extensionDevelopmentPath);
                    }
                    return uri_1.URI.file((0, path_1.normalize)(extensionDevelopmentPath));
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
                return uri_1.URI.file((0, path_1.normalize)(extensionTestsPath));
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
        get debugExtensionHost() { return parseExtensionHostDebugPort(this.args, this.isBuilt); }
        get debugRenderer() { return !!this.args.debugRenderer; }
        get isBuilt() { return !process_1.env['VSCODE_DEV']; }
        get verbose() { return !!this.args.verbose; }
        get logLevel() { return this.args.log?.find(entry => !exports.EXTENSION_IDENTIFIER_WITH_LOG_REGEX.test(entry)); }
        get extensionLogLevel() {
            const result = [];
            for (const entry of this.args.log || []) {
                const matches = exports.EXTENSION_IDENTIFIER_WITH_LOG_REGEX.exec(entry);
                if (matches && matches[1] && matches[2]) {
                    result.push([matches[1], matches[2]]);
                }
            }
            return result.length ? result : undefined;
        }
        get serviceMachineIdResource() { return (0, resources_1.joinPath)(uri_1.URI.file(this.userDataPath), 'machineid'); }
        get crashReporterId() { return this.args['crash-reporter-id']; }
        get crashReporterDirectory() { return this.args['crash-reporter-directory']; }
        get disableTelemetry() { return !!this.args['disable-telemetry']; }
        get disableWorkspaceTrust() { return !!this.args['disable-workspace-trust']; }
        get useInMemorySecretStorage() { return !!this.args['use-inmemory-secretstorage']; }
        get policyFile() {
            if (this.args['__enable-file-policy']) {
                const vscodePortable = process_1.env['VSCODE_PORTABLE'];
                if (vscodePortable) {
                    return uri_1.URI.file((0, path_1.join)(vscodePortable, 'policy.json'));
                }
                return (0, resources_1.joinPath)(this.userHome, this.productService.dataFolderName, 'policy.json');
            }
            return undefined;
        }
        get continueOn() {
            return this.args['continueOn'];
        }
        set continueOn(value) {
            this.args['continueOn'] = value;
        }
        get args() { return this._args; }
        constructor(_args, paths, productService) {
            this._args = _args;
            this.paths = paths;
            this.productService = productService;
            this.editSessionId = this.args['editSessionId'];
        }
    }
    exports.AbstractNativeEnvironmentService = AbstractNativeEnvironmentService;
    __decorate([
        decorators_1.memoize
    ], AbstractNativeEnvironmentService.prototype, "appRoot", null);
    __decorate([
        decorators_1.memoize
    ], AbstractNativeEnvironmentService.prototype, "userHome", null);
    __decorate([
        decorators_1.memoize
    ], AbstractNativeEnvironmentService.prototype, "userDataPath", null);
    __decorate([
        decorators_1.memoize
    ], AbstractNativeEnvironmentService.prototype, "appSettingsHome", null);
    __decorate([
        decorators_1.memoize
    ], AbstractNativeEnvironmentService.prototype, "tmpDir", null);
    __decorate([
        decorators_1.memoize
    ], AbstractNativeEnvironmentService.prototype, "cacheHome", null);
    __decorate([
        decorators_1.memoize
    ], AbstractNativeEnvironmentService.prototype, "stateResource", null);
    __decorate([
        decorators_1.memoize
    ], AbstractNativeEnvironmentService.prototype, "userRoamingDataHome", null);
    __decorate([
        decorators_1.memoize
    ], AbstractNativeEnvironmentService.prototype, "userDataSyncHome", null);
    __decorate([
        decorators_1.memoize
    ], AbstractNativeEnvironmentService.prototype, "sync", null);
    __decorate([
        decorators_1.memoize
    ], AbstractNativeEnvironmentService.prototype, "machineSettingsResource", null);
    __decorate([
        decorators_1.memoize
    ], AbstractNativeEnvironmentService.prototype, "workspaceStorageHome", null);
    __decorate([
        decorators_1.memoize
    ], AbstractNativeEnvironmentService.prototype, "localHistoryHome", null);
    __decorate([
        decorators_1.memoize
    ], AbstractNativeEnvironmentService.prototype, "keyboardLayoutResource", null);
    __decorate([
        decorators_1.memoize
    ], AbstractNativeEnvironmentService.prototype, "argvResource", null);
    __decorate([
        decorators_1.memoize
    ], AbstractNativeEnvironmentService.prototype, "isExtensionDevelopment", null);
    __decorate([
        decorators_1.memoize
    ], AbstractNativeEnvironmentService.prototype, "untitledWorkspacesHome", null);
    __decorate([
        decorators_1.memoize
    ], AbstractNativeEnvironmentService.prototype, "builtinExtensionsPath", null);
    __decorate([
        decorators_1.memoize
    ], AbstractNativeEnvironmentService.prototype, "extensionsPath", null);
    __decorate([
        decorators_1.memoize
    ], AbstractNativeEnvironmentService.prototype, "extensionDevelopmentLocationURI", null);
    __decorate([
        decorators_1.memoize
    ], AbstractNativeEnvironmentService.prototype, "extensionDevelopmentKind", null);
    __decorate([
        decorators_1.memoize
    ], AbstractNativeEnvironmentService.prototype, "extensionTestsLocationURI", null);
    __decorate([
        decorators_1.memoize
    ], AbstractNativeEnvironmentService.prototype, "debugExtensionHost", null);
    __decorate([
        decorators_1.memoize
    ], AbstractNativeEnvironmentService.prototype, "logLevel", null);
    __decorate([
        decorators_1.memoize
    ], AbstractNativeEnvironmentService.prototype, "extensionLogLevel", null);
    __decorate([
        decorators_1.memoize
    ], AbstractNativeEnvironmentService.prototype, "serviceMachineIdResource", null);
    __decorate([
        decorators_1.memoize
    ], AbstractNativeEnvironmentService.prototype, "disableTelemetry", null);
    __decorate([
        decorators_1.memoize
    ], AbstractNativeEnvironmentService.prototype, "disableWorkspaceTrust", null);
    __decorate([
        decorators_1.memoize
    ], AbstractNativeEnvironmentService.prototype, "useInMemorySecretStorage", null);
    __decorate([
        decorators_1.memoize
    ], AbstractNativeEnvironmentService.prototype, "policyFile", null);
    function parseExtensionHostDebugPort(args, isBuilt) {
        return parseDebugParams(args['inspect-extensions'], args['inspect-brk-extensions'], 5870, isBuilt, args.debugId, args.extensionEnvironment);
    }
    exports.parseExtensionHostDebugPort = parseExtensionHostDebugPort;
    function parseDebugParams(debugArg, debugBrkArg, defaultBuildPort, isBuilt, debugId, environmentString) {
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
    exports.parseDebugParams = parseDebugParams;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZW52aXJvbm1lbnRTZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvcGxhdGZvcm0vZW52aXJvbm1lbnQvY29tbW9uL2Vudmlyb25tZW50U2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7SUFhbkYsUUFBQSxtQ0FBbUMsR0FBRyxvQkFBb0IsQ0FBQztJQXlCeEUsTUFBc0IsZ0NBQWdDO1FBS3JELElBQUksT0FBTyxLQUFhLE9BQU8sSUFBQSxjQUFPLEVBQUMsb0JBQVUsQ0FBQyxTQUFTLENBQUMsRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBRzFFLElBQUksUUFBUSxLQUFVLE9BQU8sU0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUc1RCxJQUFJLFlBQVksS0FBYSxPQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQztRQUc3RCxJQUFJLGVBQWUsS0FBVSxPQUFPLFNBQUcsQ0FBQyxJQUFJLENBQUMsSUFBQSxXQUFJLEVBQUMsSUFBSSxDQUFDLFlBQVksRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUdoRixJQUFJLE1BQU0sS0FBVSxPQUFPLFNBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFHekQsSUFBSSxTQUFTLEtBQVUsT0FBTyxTQUFHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFHNUQsSUFBSSxhQUFhLEtBQVUsT0FBTyxJQUFBLG9CQUFRLEVBQUMsSUFBSSxDQUFDLGVBQWUsRUFBRSxlQUFlLEVBQUUsY0FBYyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FB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