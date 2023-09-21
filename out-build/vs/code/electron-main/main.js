/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "electron", "fs", "vs/base/common/uri", "vs/base/common/arrays", "vs/base/common/async", "vs/base/common/errorMessage", "vs/base/common/errors", "vs/base/common/extpath", "vs/base/common/functional", "vs/base/common/labels", "vs/base/common/network", "vs/base/common/path", "vs/base/common/performance", "vs/base/common/platform", "vs/base/common/process", "vs/base/common/strings", "vs/base/node/pfs", "vs/base/parts/ipc/common/ipc", "vs/base/parts/ipc/node/ipc.net", "vs/code/electron-main/app", "vs/nls!vs/code/electron-main/main", "vs/platform/configuration/common/configuration", "vs/platform/configuration/common/configurationService", "vs/platform/diagnostics/node/diagnosticsService", "vs/platform/environment/electron-main/environmentMainService", "vs/platform/environment/node/argvHelper", "vs/platform/environment/node/wait", "vs/platform/files/common/files", "vs/platform/files/common/fileService", "vs/platform/files/node/diskFileSystemProvider", "vs/platform/instantiation/common/descriptors", "vs/platform/instantiation/common/instantiationService", "vs/platform/instantiation/common/serviceCollection", "vs/platform/lifecycle/electron-main/lifecycleMainService", "vs/platform/log/common/bufferLog", "vs/platform/log/common/log", "vs/platform/product/common/product", "vs/platform/product/common/productService", "vs/platform/protocol/electron-main/protocol", "vs/platform/protocol/electron-main/protocolMainService", "vs/platform/tunnel/common/tunnel", "vs/platform/tunnel/node/tunnelService", "vs/platform/request/common/request", "vs/platform/request/electron-main/requestMainService", "vs/platform/sign/common/sign", "vs/platform/sign/node/signService", "vs/platform/state/node/state", "vs/platform/telemetry/common/telemetryUtils", "vs/platform/theme/electron-main/themeMainService", "vs/platform/userDataProfile/electron-main/userDataProfile", "vs/platform/policy/common/policy", "vs/platform/policy/node/nativePolicyService", "vs/platform/policy/common/filePolicyService", "vs/base/common/lifecycle", "vs/platform/uriIdentity/common/uriIdentity", "vs/platform/uriIdentity/common/uriIdentityService", "vs/platform/log/electron-main/loggerService", "vs/platform/log/common/logService", "vs/platform/dialogs/common/dialogs", "vs/platform/state/node/stateService", "vs/platform/userData/common/fileUserDataProvider", "vs/platform/update/common/update.config.contribution"], function (require, exports, electron_1, fs_1, uri_1, arrays_1, async_1, errorMessage_1, errors_1, extpath_1, functional_1, labels_1, network_1, path_1, performance_1, platform_1, process_1, strings_1, pfs_1, ipc_1, ipc_net_1, app_1, nls_1, configuration_1, configurationService_1, diagnosticsService_1, environmentMainService_1, argvHelper_1, wait_1, files_1, fileService_1, diskFileSystemProvider_1, descriptors_1, instantiationService_1, serviceCollection_1, lifecycleMainService_1, bufferLog_1, log_1, product_1, productService_1, protocol_1, protocolMainService_1, tunnel_1, tunnelService_1, request_1, requestMainService_1, sign_1, signService_1, state_1, telemetryUtils_1, themeMainService_1, userDataProfile_1, policy_1, nativePolicyService_1, filePolicyService_1, lifecycle_1, uriIdentity_1, uriIdentityService_1, loggerService_1, logService_1, dialogs_1, stateService_1, fileUserDataProvider_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * The main VS Code entry point.
     *
     * Note: This class can exist more than once for example when VS Code is already
     * running and a second instance is started from the command line. It will always
     * try to communicate with an existing instance to prevent that 2 VS Code instances
     * are running at the same time.
     */
    class CodeMain {
        main() {
            try {
                this.a();
            }
            catch (error) {
                console.error(error.message);
                electron_1.app.exit(1);
            }
        }
        async a() {
            // Set the error handler early enough so that we are not getting the
            // default electron error dialog popping up
            (0, errors_1.setUnexpectedErrorHandler)(err => console.error(err));
            // Create services
            const [instantiationService, instanceEnvironment, environmentMainService, configurationService, stateMainService, bufferLogService, productService, userDataProfilesMainService] = this.b();
            try {
                // Init services
                try {
                    await this.d(environmentMainService, userDataProfilesMainService, configurationService, stateMainService, productService);
                }
                catch (error) {
                    // Show a dialog for errors that can be resolved by the user
                    this.f(environmentMainService, productService, error);
                    throw error;
                }
                // Startup
                await instantiationService.invokeFunction(async (accessor) => {
                    const logService = accessor.get(log_1.$5i);
                    const lifecycleMainService = accessor.get(lifecycleMainService_1.$p5b);
                    const fileService = accessor.get(files_1.$6j);
                    const loggerService = accessor.get(log_1.$6i);
                    // Create the main IPC server by trying to be the server
                    // If this throws an error it means we are not the first
                    // instance of VS Code running and so we would quit.
                    const mainProcessNodeIpcServer = await this.e(logService, environmentMainService, lifecycleMainService, instantiationService, productService, true);
                    // Write a lockfile to indicate an instance is running
                    // (https://github.com/microsoft/vscode/issues/127861#issuecomment-877417451)
                    pfs_1.Promises.writeFile(environmentMainService.mainLockfile, String(process.pid)).catch(err => {
                        logService.warn(`app#startup(): Error writing main lockfile: ${err.stack}`);
                    });
                    // Delay creation of spdlog for perf reasons (https://github.com/microsoft/vscode/issues/72906)
                    bufferLogService.logger = loggerService.createLogger('main', { name: (0, nls_1.localize)(0, null) });
                    // Lifecycle
                    (0, functional_1.$bb)(lifecycleMainService.onWillShutdown)(evt => {
                        fileService.dispose();
                        configurationService.dispose();
                        evt.join('instanceLockfile', pfs_1.Promises.unlink(environmentMainService.mainLockfile).catch(() => { }));
                    });
                    return instantiationService.createInstance(app_1.$c7b, mainProcessNodeIpcServer, instanceEnvironment).startup();
                });
            }
            catch (error) {
                instantiationService.invokeFunction(this.i, error);
            }
        }
        b() {
            const services = new serviceCollection_1.$zh();
            const disposables = new lifecycle_1.$jc();
            process.once('exit', () => disposables.dispose());
            // Product
            const productService = { _serviceBrand: undefined, ...product_1.default };
            services.set(productService_1.$kj, productService);
            // Environment
            const environmentMainService = new environmentMainService_1.$o5b(this.j(), productService);
            const instanceEnvironment = this.c(environmentMainService); // Patch `process.env` with the instance's environment
            services.set(environmentMainService_1.$n5b, environmentMainService);
            // Logger
            const loggerService = new loggerService_1.$v6b((0, log_1.$gj)(environmentMainService), environmentMainService.logsHome);
            services.set(loggerService_1.$u6b, loggerService);
            // Log: We need to buffer the spdlog logs until we are sure
            // we are the only instance running, otherwise we'll have concurrent
            // log file access on Windows (https://github.com/microsoft/vscode/issues/41218)
            const bufferLogger = new bufferLog_1.$92b(loggerService.getLogLevel());
            const logService = disposables.add(new logService_1.$mN(bufferLogger, [new log_1.$_i(loggerService.getLogLevel())]));
            services.set(log_1.$5i, logService);
            // Files
            const fileService = new fileService_1.$Dp(logService);
            services.set(files_1.$6j, fileService);
            const diskFileSystemProvider = new diskFileSystemProvider_1.$3p(logService);
            fileService.registerProvider(network_1.Schemas.file, diskFileSystemProvider);
            // URI Identity
            const uriIdentityService = new uriIdentityService_1.$pr(fileService);
            services.set(uriIdentity_1.$Ck, uriIdentityService);
            // State
            const stateService = new stateService_1.$hN(1 /* SaveStrategy.DELAYED */, environmentMainService, logService, fileService);
            services.set(state_1.$dN, stateService);
            services.set(state_1.$eN, stateService);
            // User Data Profiles
            const userDataProfilesMainService = new userDataProfile_1.$w5b(stateService, uriIdentityService, environmentMainService, fileService, logService);
            services.set(userDataProfile_1.$v5b, userDataProfilesMainService);
            // Use FileUserDataProvider for user data to
            // enable atomic read / write operations.
            fileService.registerProvider(network_1.Schemas.vscodeUserData, new fileUserDataProvider_1.$n7b(network_1.Schemas.file, diskFileSystemProvider, network_1.Schemas.vscodeUserData, userDataProfilesMainService, uriIdentityService, logService));
            // Policy
            const policyService = platform_1.$i && productService.win32RegValueName ? disposables.add(new nativePolicyService_1.$l7b(logService, productService.win32RegValueName))
                : environmentMainService.policyFile ? disposables.add(new filePolicyService_1.$m7b(environmentMainService.policyFile, fileService, logService))
                    : new policy_1.$_m();
            services.set(policy_1.$0m, policyService);
            // Configuration
            const configurationService = new configurationService_1.$zn(userDataProfilesMainService.defaultProfile.settingsResource, fileService, policyService, logService);
            services.set(configuration_1.$8h, configurationService);
            // Lifecycle
            services.set(lifecycleMainService_1.$p5b, new descriptors_1.$yh(lifecycleMainService_1.$q5b, undefined, false));
            // Request
            services.set(request_1.$Io, new descriptors_1.$yh(requestMainService_1.$j7b, undefined, true));
            // Themes
            services.set(themeMainService_1.$$5b, new descriptors_1.$yh(themeMainService_1.$_5b));
            // Signing
            services.set(sign_1.$Wk, new descriptors_1.$yh(signService_1.$k7b, undefined, false /* proxied to other processes */));
            // Tunnel
            services.set(tunnel_1.$Wz, new descriptors_1.$yh(tunnelService_1.$h7b));
            // Protocol (instantiated early and not using sync descriptor for security reasons)
            services.set(protocol_1.$e6b, new protocolMainService_1.$e7b(environmentMainService, userDataProfilesMainService, logService));
            return [new instantiationService_1.$6p(services, true), instanceEnvironment, environmentMainService, configurationService, stateService, bufferLogger, productService, userDataProfilesMainService];
        }
        c(environmentMainService) {
            const instanceEnvironment = {
                VSCODE_IPC_HOOK: environmentMainService.mainIPCHandle
            };
            ['VSCODE_NLS_CONFIG', 'VSCODE_PORTABLE'].forEach(key => {
                const value = process.env[key];
                if (typeof value === 'string') {
                    instanceEnvironment[key] = value;
                }
            });
            Object.assign(process.env, instanceEnvironment);
            return instanceEnvironment;
        }
        async d(environmentMainService, userDataProfilesMainService, configurationService, stateService, productService) {
            await async_1.Promises.settled([
                // Environment service (paths)
                Promise.all([
                    environmentMainService.extensionsPath,
                    environmentMainService.codeCachePath,
                    environmentMainService.logsHome.with({ scheme: network_1.Schemas.file }).fsPath,
                    userDataProfilesMainService.defaultProfile.globalStorageHome.with({ scheme: network_1.Schemas.file }).fsPath,
                    environmentMainService.workspaceStorageHome.with({ scheme: network_1.Schemas.file }).fsPath,
                    environmentMainService.localHistoryHome.with({ scheme: network_1.Schemas.file }).fsPath,
                    environmentMainService.backupHome
                ].map(path => path ? pfs_1.Promises.mkdir(path, { recursive: true }) : undefined)),
                // State service
                stateService.init(),
                // Configuration service
                configurationService.initialize()
            ]);
            // Initialize user data profiles after initializing the state
            userDataProfilesMainService.init();
        }
        async e(logService, environmentMainService, lifecycleMainService, instantiationService, productService, retry) {
            // Try to setup a server for running. If that succeeds it means
            // we are the first instance to startup. Otherwise it is likely
            // that another instance is already running.
            let mainProcessNodeIpcServer;
            try {
                (0, performance_1.mark)('code/willStartMainServer');
                mainProcessNodeIpcServer = await (0, ipc_net_1.$wh)(environmentMainService.mainIPCHandle);
                (0, performance_1.mark)('code/didStartMainServer');
                (0, functional_1.$bb)(lifecycleMainService.onWillShutdown)(() => mainProcessNodeIpcServer.dispose());
            }
            catch (error) {
                // Handle unexpected errors (the only expected error is EADDRINUSE that
                // indicates another instance of VS Code is running)
                if (error.code !== 'EADDRINUSE') {
                    // Show a dialog for errors that can be resolved by the user
                    this.f(environmentMainService, productService, error);
                    // Any other runtime error is just printed to the console
                    throw error;
                }
                // there's a running instance, let's connect to it
                let client;
                try {
                    client = await (0, ipc_net_1.$xh)(environmentMainService.mainIPCHandle, 'main');
                }
                catch (error) {
                    // Handle unexpected connection errors by showing a dialog to the user
                    if (!retry || platform_1.$i || error.code !== 'ECONNREFUSED') {
                        if (error.code === 'EPERM') {
                            this.g((0, nls_1.localize)(1, null, productService.nameShort), (0, nls_1.localize)(2, null), productService);
                        }
                        throw error;
                    }
                    // it happens on Linux and OS X that the pipe is left behind
                    // let's delete it, since we can't connect to it and then
                    // retry the whole thing
                    try {
                        (0, fs_1.unlinkSync)(environmentMainService.mainIPCHandle);
                    }
                    catch (error) {
                        logService.warn('Could not delete obsolete instance handle', error);
                        throw error;
                    }
                    return this.e(logService, environmentMainService, lifecycleMainService, instantiationService, productService, false);
                }
                // Tests from CLI require to be the only instance currently
                if (environmentMainService.extensionTestsLocationURI && !environmentMainService.debugExtensionHost.break) {
                    const msg = `Running extension tests from the command line is currently only supported if no other instance of ${productService.nameShort} is running.`;
                    logService.error(msg);
                    client.dispose();
                    throw new Error(msg);
                }
                // Show a warning dialog after some timeout if it takes long to talk to the other instance
                // Skip this if we are running with --wait where it is expected that we wait for a while.
                // Also skip when gathering diagnostics (--status) which can take a longer time.
                let startupWarningDialogHandle = undefined;
                if (!environmentMainService.args.wait && !environmentMainService.args.status) {
                    startupWarningDialogHandle = setTimeout(() => {
                        this.g((0, nls_1.localize)(3, null, productService.nameShort), (0, nls_1.localize)(4, null), productService);
                    }, 10000);
                }
                const otherInstanceLaunchMainService = ipc_1.ProxyChannel.toService(client.getChannel('launch'), { disableMarshalling: true });
                const otherInstanceDiagnosticsMainService = ipc_1.ProxyChannel.toService(client.getChannel('diagnostics'), { disableMarshalling: true });
                // Process Info
                if (environmentMainService.args.status) {
                    return instantiationService.invokeFunction(async () => {
                        const diagnosticsService = new diagnosticsService_1.$wr(telemetryUtils_1.$bo, productService);
                        const mainDiagnostics = await otherInstanceDiagnosticsMainService.getMainDiagnostics();
                        const remoteDiagnostics = await otherInstanceDiagnosticsMainService.getRemoteDiagnostics({ includeProcesses: true, includeWorkspaceMetadata: true });
                        const diagnostics = await diagnosticsService.getDiagnostics(mainDiagnostics, remoteDiagnostics);
                        console.log(diagnostics);
                        throw new errors_1.$$();
                    });
                }
                // Windows: allow to set foreground
                if (platform_1.$i) {
                    await this.h(otherInstanceLaunchMainService, logService);
                }
                // Send environment over...
                logService.trace('Sending env to running instance...');
                await otherInstanceLaunchMainService.start(environmentMainService.args, process.env);
                // Cleanup
                client.dispose();
                // Now that we started, make sure the warning dialog is prevented
                if (startupWarningDialogHandle) {
                    clearTimeout(startupWarningDialogHandle);
                }
                throw new errors_1.$$('Sent env to running instance. Terminating...');
            }
            // Print --status usage info
            if (environmentMainService.args.status) {
                console.log((0, nls_1.localize)(5, null, productService.nameShort));
                throw new errors_1.$$('Terminating...');
            }
            // Set the VSCODE_PID variable here when we are sure we are the first
            // instance to startup. Otherwise we would wrongly overwrite the PID
            process.env['VSCODE_PID'] = String(process.pid);
            return mainProcessNodeIpcServer;
        }
        f(environmentMainService, productService, error) {
            if (error.code === 'EACCES' || error.code === 'EPERM') {
                const directories = (0, arrays_1.$Fb)([environmentMainService.userDataPath, environmentMainService.extensionsPath, ipc_net_1.$sh]).map(folder => (0, labels_1.$eA)(uri_1.URI.file(folder), { os: platform_1.OS, tildify: environmentMainService }));
                this.g((0, nls_1.localize)(6, null), (0, nls_1.localize)(7, null, (0, errorMessage_1.$mi)(error), directories.join('\n')), productService);
            }
        }
        g(message, detail, productService) {
            // use sync variant here because we likely exit after this method
            // due to startup issues and otherwise the dialog seems to disappear
            // https://github.com/microsoft/vscode/issues/104493
            electron_1.dialog.showMessageBoxSync((0, dialogs_1.$sA)({
                type: 'warning',
                buttons: [(0, nls_1.localize)(8, null)],
                message,
                detail
            }, productService).options);
        }
        async h(launchMainService, logService) {
            if (platform_1.$i) {
                const processId = await launchMainService.getMainProcessId();
                logService.trace('Sending some foreground love to the running instance:', processId);
                try {
                    (await new Promise((resolve_1, reject_1) => { require(['windows-foreground-love'], resolve_1, reject_1); })).allowSetForegroundWindow(processId);
                }
                catch (error) {
                    logService.error(error);
                }
            }
        }
        i(accessor, reason) {
            const logService = accessor.get(log_1.$5i);
            const lifecycleMainService = accessor.get(lifecycleMainService_1.$p5b);
            let exitCode = 0;
            if (reason) {
                if (reason.isExpected) {
                    if (reason.message) {
                        logService.trace(reason.message);
                    }
                }
                else {
                    exitCode = 1; // signal error to the outside
                    if (reason.stack) {
                        logService.error(reason.stack);
                    }
                    else {
                        logService.error(`Startup error: ${reason.toString()}`);
                    }
                }
            }
            lifecycleMainService.kill(exitCode);
        }
        //#region Command line arguments utilities
        j() {
            // Parse arguments
            const args = this.k((0, argvHelper_1.$Dl)(process.argv));
            // If we are started with --wait create a random temporary file
            // and pass it over to the starting instance. We can use this file
            // to wait for it to be deleted to monitor that the edited file
            // is closed and then exit the waiting process.
            //
            // Note: we are not doing this if the wait marker has been already
            // added as argument. This can happen if VS Code was started from CLI.
            if (args.wait && !args.waitMarkerFilePath) {
                const waitMarkerFilePath = (0, wait_1.$d7b)(args.verbose);
                if (waitMarkerFilePath) {
                    (0, argvHelper_1.$Fl)(process.argv, '--waitMarkerFilePath', waitMarkerFilePath);
                    args.waitMarkerFilePath = waitMarkerFilePath;
                }
            }
            return args;
        }
        k(args) {
            // Track URLs if they're going to be used
            if (args['open-url']) {
                args._urls = args._;
                args._ = [];
            }
            // Normalize paths and watch out for goto line mode
            if (!args['remote']) {
                const paths = this.l(args._, args.goto);
                args._ = paths;
            }
            return args;
        }
        l(args, gotoLineMode) {
            const currentWorkingDir = (0, process_1.cwd)();
            const result = args.map(arg => {
                let pathCandidate = String(arg);
                let parsedPath = undefined;
                if (gotoLineMode) {
                    parsedPath = (0, extpath_1.$Pf)(pathCandidate);
                    pathCandidate = parsedPath.path;
                }
                if (pathCandidate) {
                    pathCandidate = this.m(currentWorkingDir, pathCandidate);
                }
                const sanitizedFilePath = (0, extpath_1.$Kf)(pathCandidate, currentWorkingDir);
                const filePathBasename = (0, path_1.$ae)(sanitizedFilePath);
                if (filePathBasename /* can be empty if code is opened on root */ && !(0, extpath_1.$Gf)(filePathBasename)) {
                    return null; // do not allow invalid file names
                }
                if (gotoLineMode && parsedPath) {
                    parsedPath.path = sanitizedFilePath;
                    return this.n(parsedPath);
                }
                return sanitizedFilePath;
            });
            const caseInsensitive = platform_1.$i || platform_1.$j;
            const distinctPaths = (0, arrays_1.$Kb)(result, path => path && caseInsensitive ? path.toLowerCase() : (path || ''));
            return (0, arrays_1.$Fb)(distinctPaths);
        }
        m(cwd, path) {
            // Trim trailing quotes
            if (platform_1.$i) {
                path = (0, strings_1.$ve)(path, '"'); // https://github.com/microsoft/vscode/issues/1498
            }
            // Trim whitespaces
            path = (0, strings_1.$te)((0, strings_1.$te)(path, ' '), '\t');
            if (platform_1.$i) {
                // Resolve the path against cwd if it is relative
                path = (0, path_1.$0d)(cwd, path);
                // Trim trailing '.' chars on Windows to prevent invalid file names
                path = (0, strings_1.$ve)(path, '.');
            }
            return path;
        }
        n(pathWithLineAndCol) {
            const segments = [pathWithLineAndCol.path];
            if (typeof pathWithLineAndCol.line === 'number') {
                segments.push(String(pathWithLineAndCol.line));
            }
            if (typeof pathWithLineAndCol.column === 'number') {
                segments.push(String(pathWithLineAndCol.column));
            }
            return segments.join(':');
        }
    }
    // Main Startup
    const code = new CodeMain();
    code.main();
});
//# sourceMappingURL=main.js.map