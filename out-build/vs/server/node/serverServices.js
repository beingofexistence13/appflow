/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "os", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/network", "vs/base/common/path", "vs/base/node/id", "vs/base/node/pfs", "vs/base/parts/ipc/common/ipc", "vs/platform/configuration/common/configuration", "vs/platform/configuration/common/configurationService", "vs/platform/debug/common/extensionHostDebugIpc", "vs/platform/download/common/download", "vs/platform/download/common/downloadIpc", "vs/platform/environment/common/environment", "vs/platform/extensionManagement/common/extensionGalleryService", "vs/platform/extensionManagement/common/extensionManagement", "vs/platform/extensionManagement/node/extensionSignatureVerificationService", "vs/platform/extensionManagement/common/extensionManagementCLI", "vs/platform/extensionManagement/common/extensionManagementIpc", "vs/platform/extensionManagement/node/extensionManagementService", "vs/platform/files/common/files", "vs/platform/files/common/fileService", "vs/platform/files/node/diskFileSystemProvider", "vs/platform/instantiation/common/descriptors", "vs/platform/instantiation/common/instantiationService", "vs/platform/instantiation/common/serviceCollection", "vs/platform/languagePacks/common/languagePacks", "vs/platform/languagePacks/node/languagePacks", "vs/platform/log/common/log", "vs/platform/product/common/product", "vs/platform/product/common/productService", "vs/platform/request/common/request", "vs/platform/request/common/requestIpc", "vs/platform/request/node/requestService", "vs/platform/telemetry/common/commonProperties", "vs/platform/telemetry/common/telemetry", "vs/platform/telemetry/common/telemetryUtils", "vs/platform/telemetry/node/errorTelemetry", "vs/platform/terminal/common/terminal", "vs/platform/terminal/node/ptyHostService", "vs/platform/uriIdentity/common/uriIdentity", "vs/platform/uriIdentity/common/uriIdentityService", "vs/server/node/remoteAgentEnvironmentImpl", "vs/server/node/remoteFileSystemProviderServer", "vs/platform/telemetry/common/remoteTelemetryChannel", "vs/platform/telemetry/common/serverTelemetryService", "vs/server/node/remoteTerminalChannel", "vs/workbench/api/node/uriTransformer", "vs/server/node/serverEnvironmentService", "vs/workbench/contrib/terminal/common/remote/remoteTerminalChannel", "vs/workbench/services/remote/common/remoteFileSystemProviderClient", "vs/server/node/extensionHostStatusService", "vs/platform/extensionManagement/common/extensionsScannerService", "vs/server/node/extensionsScannerService", "vs/platform/extensionManagement/common/extensionsProfileScannerService", "vs/platform/userDataProfile/common/userDataProfile", "vs/platform/policy/common/policy", "vs/platform/telemetry/node/1dsAppender", "vs/platform/log/node/loggerService", "vs/platform/userDataProfile/node/userDataProfile", "vs/platform/extensionManagement/node/extensionsProfileScannerService", "vs/platform/log/common/logService", "vs/platform/log/common/logIpc", "vs/nls!vs/server/node/serverServices", "vs/server/node/remoteExtensionsScanner", "vs/platform/remote/common/remoteExtensionsScanner", "vs/platform/userDataProfile/common/userDataProfileIpc", "vs/platform/terminal/node/nodePtyHostStarter"], function (require, exports, os_1, event_1, lifecycle_1, network_1, path, id_1, pfs_1, ipc_1, configuration_1, configurationService_1, extensionHostDebugIpc_1, download_1, downloadIpc_1, environment_1, extensionGalleryService_1, extensionManagement_1, extensionSignatureVerificationService_1, extensionManagementCLI_1, extensionManagementIpc_1, extensionManagementService_1, files_1, fileService_1, diskFileSystemProvider_1, descriptors_1, instantiationService_1, serviceCollection_1, languagePacks_1, languagePacks_2, log_1, product_1, productService_1, request_1, requestIpc_1, requestService_1, commonProperties_1, telemetry_1, telemetryUtils_1, errorTelemetry_1, terminal_1, ptyHostService_1, uriIdentity_1, uriIdentityService_1, remoteAgentEnvironmentImpl_1, remoteFileSystemProviderServer_1, remoteTelemetryChannel_1, serverTelemetryService_1, remoteTerminalChannel_1, uriTransformer_1, serverEnvironmentService_1, remoteTerminalChannel_2, remoteFileSystemProviderClient_1, extensionHostStatusService_1, extensionsScannerService_1, extensionsScannerService_2, extensionsProfileScannerService_1, userDataProfile_1, policy_1, _1dsAppender_1, loggerService_1, userDataProfile_2, extensionsProfileScannerService_2, logService_1, logIpc_1, nls_1, remoteExtensionsScanner_1, remoteExtensionsScanner_2, userDataProfileIpc_1, nodePtyHostStarter_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$wN = exports.$vN = void 0;
    const eventPrefix = 'monacoworkbench';
    async function $vN(connectionToken, args, REMOTE_DATA_FOLDER, disposables) {
        const services = new serviceCollection_1.$zh();
        const socketServer = new $wN();
        const productService = { _serviceBrand: undefined, ...product_1.default };
        services.set(productService_1.$kj, productService);
        const environmentService = new serverEnvironmentService_1.$em(args, productService);
        services.set(environment_1.$Ih, environmentService);
        services.set(environment_1.$Jh, environmentService);
        const loggerService = new loggerService_1.$cN((0, log_1.$gj)(environmentService), environmentService.logsHome);
        services.set(log_1.$6i, loggerService);
        socketServer.registerChannel('logger', new logIpc_1.$2q(loggerService, (ctx) => getUriTransformer(ctx.remoteAuthority)));
        const logger = loggerService.createLogger('remoteagent', { name: (0, nls_1.localize)(0, null) });
        const logService = new logService_1.$mN(logger, [new ServerLogger((0, log_1.$gj)(environmentService))]);
        services.set(log_1.$5i, logService);
        setTimeout(() => cleanupOlderLogs(environmentService.logsHome.with({ scheme: network_1.Schemas.file }).fsPath).then(null, err => logService.error(err)), 10000);
        logService.onDidChangeLogLevel(logLevel => (0, log_1.log)(logService, logLevel, `Log level changed to ${(0, log_1.$hj)(logService.getLevel())}`));
        logService.trace(`Remote configuration data at ${REMOTE_DATA_FOLDER}`);
        logService.trace('process arguments:', environmentService.args);
        if (Array.isArray(productService.serverGreeting)) {
            logService.info(`\n\n${productService.serverGreeting.join('\n')}\n\n`);
        }
        // ExtensionHost Debug broadcast service
        socketServer.registerChannel(extensionHostDebugIpc_1.$Bn.ChannelName, new extensionHostDebugIpc_1.$Bn());
        // TODO: @Sandy @Joao need dynamic context based router
        const router = new ipc_1.$jh(ctx => ctx.clientId === 'renderer');
        // Files
        const fileService = disposables.add(new fileService_1.$Dp(logService));
        services.set(files_1.$6j, fileService);
        fileService.registerProvider(network_1.Schemas.file, disposables.add(new diskFileSystemProvider_1.$3p(logService)));
        // URI Identity
        const uriIdentityService = new uriIdentityService_1.$pr(fileService);
        services.set(uriIdentity_1.$Ck, uriIdentityService);
        // Configuration
        const configurationService = new configurationService_1.$zn(environmentService.machineSettingsResource, fileService, new policy_1.$_m(), logService);
        services.set(configuration_1.$8h, configurationService);
        // User Data Profiles
        const userDataProfilesService = new userDataProfile_2.$kN(uriIdentityService, environmentService, fileService, logService);
        services.set(userDataProfile_1.$Ek, userDataProfilesService);
        socketServer.registerChannel('userDataProfiles', new userDataProfileIpc_1.$sN(userDataProfilesService, (ctx) => getUriTransformer(ctx.remoteAuthority)));
        // Initialize
        const [, , machineId] = await Promise.all([
            configurationService.initialize(),
            userDataProfilesService.init(),
            (0, id_1.$Im)(logService.error.bind(logService))
        ]);
        const extensionHostStatusService = new extensionHostStatusService_1.$mm();
        services.set(extensionHostStatusService_1.$lm, extensionHostStatusService);
        // Request
        const requestService = new requestService_1.$Oq(configurationService, environmentService, logService, loggerService);
        services.set(request_1.$Io, requestService);
        let oneDsAppender = telemetryUtils_1.$fo;
        const isInternal = (0, telemetryUtils_1.$mo)(productService, configurationService);
        if ((0, telemetryUtils_1.$ho)(productService, environmentService)) {
            if (productService.aiConfig && productService.aiConfig.ariaKey) {
                oneDsAppender = new _1dsAppender_1.$aN(requestService, isInternal, eventPrefix, null, productService.aiConfig.ariaKey);
                disposables.add((0, lifecycle_1.$ic)(() => oneDsAppender?.flush())); // Ensure the AI appender is disposed so that it flushes remaining data
            }
            const config = {
                appenders: [oneDsAppender],
                commonProperties: (0, commonProperties_1.$0n)((0, os_1.release)(), (0, os_1.hostname)(), process.arch, productService.commit, productService.version + '-remote', machineId, isInternal, 'remoteAgent'),
                piiPaths: (0, telemetryUtils_1.$no)(environmentService)
            };
            const initialTelemetryLevelArg = environmentService.args['telemetry-level'];
            let injectedTelemetryLevel = 3 /* TelemetryLevel.USAGE */;
            // Convert the passed in CLI argument into a telemetry level for the telemetry service
            if (initialTelemetryLevelArg === 'all') {
                injectedTelemetryLevel = 3 /* TelemetryLevel.USAGE */;
            }
            else if (initialTelemetryLevelArg === 'error') {
                injectedTelemetryLevel = 2 /* TelemetryLevel.ERROR */;
            }
            else if (initialTelemetryLevelArg === 'crash') {
                injectedTelemetryLevel = 1 /* TelemetryLevel.CRASH */;
            }
            else if (initialTelemetryLevelArg !== undefined) {
                injectedTelemetryLevel = 0 /* TelemetryLevel.NONE */;
            }
            services.set(serverTelemetryService_1.$Dr, new descriptors_1.$yh(serverTelemetryService_1.$Br, [config, injectedTelemetryLevel]));
        }
        else {
            services.set(serverTelemetryService_1.$Dr, serverTelemetryService_1.$Cr);
        }
        services.set(extensionManagement_1.$Zn, new descriptors_1.$yh(extensionGalleryService_1.$6o));
        const downloadChannel = socketServer.getChannel('download', router);
        services.set(download_1.$Dn, new downloadIpc_1.$Fn(downloadChannel, () => getUriTransformer('renderer') /* TODO: @Sandy @Joao need dynamic context based router */));
        services.set(extensionsProfileScannerService_1.$kp, new descriptors_1.$yh(extensionsProfileScannerService_2.$lN));
        services.set(extensionsScannerService_1.$op, new descriptors_1.$yh(extensionsScannerService_2.$$M));
        services.set(extensionSignatureVerificationService_1.$7o, new descriptors_1.$yh(extensionSignatureVerificationService_1.$8o));
        services.set(extensionManagementService_1.$yp, new descriptors_1.$yh(extensionManagementService_1.$zp));
        const instantiationService = new instantiationService_1.$6p(services);
        services.set(languagePacks_1.$Iq, instantiationService.createInstance(languagePacks_2.$Kq));
        const ptyHostStarter = instantiationService.createInstance(nodePtyHostStarter_1.$uN, {
            graceTime: 10800000 /* ProtocolConstants.ReconnectionGraceTime */,
            shortGraceTime: 300000 /* ProtocolConstants.ReconnectionShortGraceTime */,
            scrollback: configurationService.getValue("terminal.integrated.persistentSessionScrollback" /* TerminalSettingId.PersistentSessionScrollback */) ?? 100
        });
        const ptyHostService = instantiationService.createInstance(ptyHostService_1.$lr, ptyHostStarter);
        services.set(terminal_1.$Wq, ptyHostService);
        instantiationService.invokeFunction(accessor => {
            const extensionManagementService = accessor.get(extensionManagementService_1.$yp);
            const extensionsScannerService = accessor.get(extensionsScannerService_1.$op);
            const extensionGalleryService = accessor.get(extensionManagement_1.$Zn);
            const languagePackService = accessor.get(languagePacks_1.$Iq);
            const remoteExtensionEnvironmentChannel = new remoteAgentEnvironmentImpl_1.$xr(connectionToken, environmentService, userDataProfilesService, extensionHostStatusService);
            socketServer.registerChannel('remoteextensionsenvironment', remoteExtensionEnvironmentChannel);
            const telemetryChannel = new remoteTelemetryChannel_1.$Er(accessor.get(serverTelemetryService_1.$Dr), oneDsAppender);
            socketServer.registerChannel('telemetry', telemetryChannel);
            socketServer.registerChannel(remoteTerminalChannel_2.$5M, new remoteTerminalChannel_1.$4M(environmentService, logService, ptyHostService, productService, extensionManagementService, configurationService));
            const remoteExtensionsScanner = new remoteExtensionsScanner_1.$qN(instantiationService.createInstance(extensionManagementCLI_1.$9o, logService), environmentService, userDataProfilesService, extensionsScannerService, logService, extensionGalleryService, languagePackService);
            socketServer.registerChannel(remoteExtensionsScanner_2.$pN, new remoteExtensionsScanner_1.$rN(remoteExtensionsScanner, (ctx) => getUriTransformer(ctx.remoteAuthority)));
            const remoteFileSystemChannel = new remoteFileSystemProviderServer_1.$Ar(logService, environmentService);
            socketServer.registerChannel(remoteFileSystemProviderClient_1.$9M, remoteFileSystemChannel);
            socketServer.registerChannel('request', new requestIpc_1.$Lq(accessor.get(request_1.$Io)));
            const channel = new extensionManagementIpc_1.$0o(extensionManagementService, (ctx) => getUriTransformer(ctx.remoteAuthority));
            socketServer.registerChannel('extensions', channel);
            // clean up extensions folder
            remoteExtensionsScanner.whenExtensionsReady().then(() => extensionManagementService.cleanUp());
            disposables.add(new errorTelemetry_1.default(accessor.get(telemetry_1.$9k)));
            return {
                telemetryService: accessor.get(telemetry_1.$9k)
            };
        });
        return { socketServer, instantiationService };
    }
    exports.$vN = $vN;
    const _uriTransformerCache = Object.create(null);
    function getUriTransformer(remoteAuthority) {
        if (!_uriTransformerCache[remoteAuthority]) {
            _uriTransformerCache[remoteAuthority] = (0, uriTransformer_1.$qr)(remoteAuthority);
        }
        return _uriTransformerCache[remoteAuthority];
    }
    class $wN extends ipc_1.$fh {
        constructor() {
            const emitter = new event_1.$fd();
            super(emitter.event);
            this.b = emitter;
        }
        acceptConnection(protocol, onDidClientDisconnect) {
            this.b.fire({ protocol, onDidClientDisconnect });
        }
    }
    exports.$wN = $wN;
    class ServerLogger extends log_1.$0i {
        constructor(logLevel = log_1.$8i) {
            super();
            this.setLevel(logLevel);
            this.g = Boolean(process.stdout.isTTY);
        }
        trace(message, ...args) {
            if (this.f(log_1.LogLevel.Trace)) {
                if (this.g) {
                    console.log(`\x1b[90m[${now()}]\x1b[0m`, message, ...args);
                }
                else {
                    console.log(`[${now()}]`, message, ...args);
                }
            }
        }
        debug(message, ...args) {
            if (this.f(log_1.LogLevel.Debug)) {
                if (this.g) {
                    console.log(`\x1b[90m[${now()}]\x1b[0m`, message, ...args);
                }
                else {
                    console.log(`[${now()}]`, message, ...args);
                }
            }
        }
        info(message, ...args) {
            if (this.f(log_1.LogLevel.Info)) {
                if (this.g) {
                    console.log(`\x1b[90m[${now()}]\x1b[0m`, message, ...args);
                }
                else {
                    console.log(`[${now()}]`, message, ...args);
                }
            }
        }
        warn(message, ...args) {
            if (this.f(log_1.LogLevel.Warning)) {
                if (this.g) {
                    console.warn(`\x1b[93m[${now()}]\x1b[0m`, message, ...args);
                }
                else {
                    console.warn(`[${now()}]`, message, ...args);
                }
            }
        }
        error(message, ...args) {
            if (this.f(log_1.LogLevel.Error)) {
                if (this.g) {
                    console.error(`\x1b[91m[${now()}]\x1b[0m`, message, ...args);
                }
                else {
                    console.error(`[${now()}]`, message, ...args);
                }
            }
        }
        dispose() {
            // noop
        }
        flush() {
            // noop
        }
    }
    function now() {
        const date = new Date();
        return `${twodigits(date.getHours())}:${twodigits(date.getMinutes())}:${twodigits(date.getSeconds())}`;
    }
    function twodigits(n) {
        if (n < 10) {
            return `0${n}`;
        }
        return String(n);
    }
    /**
     * Cleans up older logs, while keeping the 10 most recent ones.
     */
    async function cleanupOlderLogs(logsPath) {
        const currentLog = path.$ae(logsPath);
        const logsRoot = path.$_d(logsPath);
        const children = await pfs_1.Promises.readdir(logsRoot);
        const allSessions = children.filter(name => /^\d{8}T\d{6}$/.test(name));
        const oldSessions = allSessions.sort().filter((d) => d !== currentLog);
        const toDelete = oldSessions.slice(0, Math.max(0, oldSessions.length - 9));
        await Promise.all(toDelete.map(name => pfs_1.Promises.rm(path.$9d(logsRoot, name))));
    }
});
//# sourceMappingURL=serverServices.js.map