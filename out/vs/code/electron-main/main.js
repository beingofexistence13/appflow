/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "electron", "fs", "vs/base/common/uri", "vs/base/common/arrays", "vs/base/common/async", "vs/base/common/errorMessage", "vs/base/common/errors", "vs/base/common/extpath", "vs/base/common/functional", "vs/base/common/labels", "vs/base/common/network", "vs/base/common/path", "vs/base/common/performance", "vs/base/common/platform", "vs/base/common/process", "vs/base/common/strings", "vs/base/node/pfs", "vs/base/parts/ipc/common/ipc", "vs/base/parts/ipc/node/ipc.net", "vs/code/electron-main/app", "vs/nls", "vs/platform/configuration/common/configuration", "vs/platform/configuration/common/configurationService", "vs/platform/diagnostics/node/diagnosticsService", "vs/platform/environment/electron-main/environmentMainService", "vs/platform/environment/node/argvHelper", "vs/platform/environment/node/wait", "vs/platform/files/common/files", "vs/platform/files/common/fileService", "vs/platform/files/node/diskFileSystemProvider", "vs/platform/instantiation/common/descriptors", "vs/platform/instantiation/common/instantiationService", "vs/platform/instantiation/common/serviceCollection", "vs/platform/lifecycle/electron-main/lifecycleMainService", "vs/platform/log/common/bufferLog", "vs/platform/log/common/log", "vs/platform/product/common/product", "vs/platform/product/common/productService", "vs/platform/protocol/electron-main/protocol", "vs/platform/protocol/electron-main/protocolMainService", "vs/platform/tunnel/common/tunnel", "vs/platform/tunnel/node/tunnelService", "vs/platform/request/common/request", "vs/platform/request/electron-main/requestMainService", "vs/platform/sign/common/sign", "vs/platform/sign/node/signService", "vs/platform/state/node/state", "vs/platform/telemetry/common/telemetryUtils", "vs/platform/theme/electron-main/themeMainService", "vs/platform/userDataProfile/electron-main/userDataProfile", "vs/platform/policy/common/policy", "vs/platform/policy/node/nativePolicyService", "vs/platform/policy/common/filePolicyService", "vs/base/common/lifecycle", "vs/platform/uriIdentity/common/uriIdentity", "vs/platform/uriIdentity/common/uriIdentityService", "vs/platform/log/electron-main/loggerService", "vs/platform/log/common/logService", "vs/platform/dialogs/common/dialogs", "vs/platform/state/node/stateService", "vs/platform/userData/common/fileUserDataProvider", "vs/platform/update/common/update.config.contribution"], function (require, exports, electron_1, fs_1, uri_1, arrays_1, async_1, errorMessage_1, errors_1, extpath_1, functional_1, labels_1, network_1, path_1, performance_1, platform_1, process_1, strings_1, pfs_1, ipc_1, ipc_net_1, app_1, nls_1, configuration_1, configurationService_1, diagnosticsService_1, environmentMainService_1, argvHelper_1, wait_1, files_1, fileService_1, diskFileSystemProvider_1, descriptors_1, instantiationService_1, serviceCollection_1, lifecycleMainService_1, bufferLog_1, log_1, product_1, productService_1, protocol_1, protocolMainService_1, tunnel_1, tunnelService_1, request_1, requestMainService_1, sign_1, signService_1, state_1, telemetryUtils_1, themeMainService_1, userDataProfile_1, policy_1, nativePolicyService_1, filePolicyService_1, lifecycle_1, uriIdentity_1, uriIdentityService_1, loggerService_1, logService_1, dialogs_1, stateService_1, fileUserDataProvider_1) {
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
                this.startup();
            }
            catch (error) {
                console.error(error.message);
                electron_1.app.exit(1);
            }
        }
        async startup() {
            // Set the error handler early enough so that we are not getting the
            // default electron error dialog popping up
            (0, errors_1.setUnexpectedErrorHandler)(err => console.error(err));
            // Create services
            const [instantiationService, instanceEnvironment, environmentMainService, configurationService, stateMainService, bufferLogService, productService, userDataProfilesMainService] = this.createServices();
            try {
                // Init services
                try {
                    await this.initServices(environmentMainService, userDataProfilesMainService, configurationService, stateMainService, productService);
                }
                catch (error) {
                    // Show a dialog for errors that can be resolved by the user
                    this.handleStartupDataDirError(environmentMainService, productService, error);
                    throw error;
                }
                // Startup
                await instantiationService.invokeFunction(async (accessor) => {
                    const logService = accessor.get(log_1.ILogService);
                    const lifecycleMainService = accessor.get(lifecycleMainService_1.ILifecycleMainService);
                    const fileService = accessor.get(files_1.IFileService);
                    const loggerService = accessor.get(log_1.ILoggerService);
                    // Create the main IPC server by trying to be the server
                    // If this throws an error it means we are not the first
                    // instance of VS Code running and so we would quit.
                    const mainProcessNodeIpcServer = await this.claimInstance(logService, environmentMainService, lifecycleMainService, instantiationService, productService, true);
                    // Write a lockfile to indicate an instance is running
                    // (https://github.com/microsoft/vscode/issues/127861#issuecomment-877417451)
                    pfs_1.Promises.writeFile(environmentMainService.mainLockfile, String(process.pid)).catch(err => {
                        logService.warn(`app#startup(): Error writing main lockfile: ${err.stack}`);
                    });
                    // Delay creation of spdlog for perf reasons (https://github.com/microsoft/vscode/issues/72906)
                    bufferLogService.logger = loggerService.createLogger('main', { name: (0, nls_1.localize)('mainLog', "Main") });
                    // Lifecycle
                    (0, functional_1.once)(lifecycleMainService.onWillShutdown)(evt => {
                        fileService.dispose();
                        configurationService.dispose();
                        evt.join('instanceLockfile', pfs_1.Promises.unlink(environmentMainService.mainLockfile).catch(() => { }));
                    });
                    return instantiationService.createInstance(app_1.CodeApplication, mainProcessNodeIpcServer, instanceEnvironment).startup();
                });
            }
            catch (error) {
                instantiationService.invokeFunction(this.quit, error);
            }
        }
        createServices() {
            const services = new serviceCollection_1.ServiceCollection();
            const disposables = new lifecycle_1.DisposableStore();
            process.once('exit', () => disposables.dispose());
            // Product
            const productService = { _serviceBrand: undefined, ...product_1.default };
            services.set(productService_1.IProductService, productService);
            // Environment
            const environmentMainService = new environmentMainService_1.EnvironmentMainService(this.resolveArgs(), productService);
            const instanceEnvironment = this.patchEnvironment(environmentMainService); // Patch `process.env` with the instance's environment
            services.set(environmentMainService_1.IEnvironmentMainService, environmentMainService);
            // Logger
            const loggerService = new loggerService_1.LoggerMainService((0, log_1.getLogLevel)(environmentMainService), environmentMainService.logsHome);
            services.set(loggerService_1.ILoggerMainService, loggerService);
            // Log: We need to buffer the spdlog logs until we are sure
            // we are the only instance running, otherwise we'll have concurrent
            // log file access on Windows (https://github.com/microsoft/vscode/issues/41218)
            const bufferLogger = new bufferLog_1.BufferLogger(loggerService.getLogLevel());
            const logService = disposables.add(new logService_1.LogService(bufferLogger, [new log_1.ConsoleMainLogger(loggerService.getLogLevel())]));
            services.set(log_1.ILogService, logService);
            // Files
            const fileService = new fileService_1.FileService(logService);
            services.set(files_1.IFileService, fileService);
            const diskFileSystemProvider = new diskFileSystemProvider_1.DiskFileSystemProvider(logService);
            fileService.registerProvider(network_1.Schemas.file, diskFileSystemProvider);
            // URI Identity
            const uriIdentityService = new uriIdentityService_1.UriIdentityService(fileService);
            services.set(uriIdentity_1.IUriIdentityService, uriIdentityService);
            // State
            const stateService = new stateService_1.StateService(1 /* SaveStrategy.DELAYED */, environmentMainService, logService, fileService);
            services.set(state_1.IStateReadService, stateService);
            services.set(state_1.IStateService, stateService);
            // User Data Profiles
            const userDataProfilesMainService = new userDataProfile_1.UserDataProfilesMainService(stateService, uriIdentityService, environmentMainService, fileService, logService);
            services.set(userDataProfile_1.IUserDataProfilesMainService, userDataProfilesMainService);
            // Use FileUserDataProvider for user data to
            // enable atomic read / write operations.
            fileService.registerProvider(network_1.Schemas.vscodeUserData, new fileUserDataProvider_1.FileUserDataProvider(network_1.Schemas.file, diskFileSystemProvider, network_1.Schemas.vscodeUserData, userDataProfilesMainService, uriIdentityService, logService));
            // Policy
            const policyService = platform_1.isWindows && productService.win32RegValueName ? disposables.add(new nativePolicyService_1.NativePolicyService(logService, productService.win32RegValueName))
                : environmentMainService.policyFile ? disposables.add(new filePolicyService_1.FilePolicyService(environmentMainService.policyFile, fileService, logService))
                    : new policy_1.NullPolicyService();
            services.set(policy_1.IPolicyService, policyService);
            // Configuration
            const configurationService = new configurationService_1.ConfigurationService(userDataProfilesMainService.defaultProfile.settingsResource, fileService, policyService, logService);
            services.set(configuration_1.IConfigurationService, configurationService);
            // Lifecycle
            services.set(lifecycleMainService_1.ILifecycleMainService, new descriptors_1.SyncDescriptor(lifecycleMainService_1.LifecycleMainService, undefined, false));
            // Request
            services.set(request_1.IRequestService, new descriptors_1.SyncDescriptor(requestMainService_1.RequestMainService, undefined, true));
            // Themes
            services.set(themeMainService_1.IThemeMainService, new descriptors_1.SyncDescriptor(themeMainService_1.ThemeMainService));
            // Signing
            services.set(sign_1.ISignService, new descriptors_1.SyncDescriptor(signService_1.SignService, undefined, false /* proxied to other processes */));
            // Tunnel
            services.set(tunnel_1.ITunnelService, new descriptors_1.SyncDescriptor(tunnelService_1.TunnelService));
            // Protocol (instantiated early and not using sync descriptor for security reasons)
            services.set(protocol_1.IProtocolMainService, new protocolMainService_1.ProtocolMainService(environmentMainService, userDataProfilesMainService, logService));
            return [new instantiationService_1.InstantiationService(services, true), instanceEnvironment, environmentMainService, configurationService, stateService, bufferLogger, productService, userDataProfilesMainService];
        }
        patchEnvironment(environmentMainService) {
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
        async initServices(environmentMainService, userDataProfilesMainService, configurationService, stateService, productService) {
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
        async claimInstance(logService, environmentMainService, lifecycleMainService, instantiationService, productService, retry) {
            // Try to setup a server for running. If that succeeds it means
            // we are the first instance to startup. Otherwise it is likely
            // that another instance is already running.
            let mainProcessNodeIpcServer;
            try {
                (0, performance_1.mark)('code/willStartMainServer');
                mainProcessNodeIpcServer = await (0, ipc_net_1.serve)(environmentMainService.mainIPCHandle);
                (0, performance_1.mark)('code/didStartMainServer');
                (0, functional_1.once)(lifecycleMainService.onWillShutdown)(() => mainProcessNodeIpcServer.dispose());
            }
            catch (error) {
                // Handle unexpected errors (the only expected error is EADDRINUSE that
                // indicates another instance of VS Code is running)
                if (error.code !== 'EADDRINUSE') {
                    // Show a dialog for errors that can be resolved by the user
                    this.handleStartupDataDirError(environmentMainService, productService, error);
                    // Any other runtime error is just printed to the console
                    throw error;
                }
                // there's a running instance, let's connect to it
                let client;
                try {
                    client = await (0, ipc_net_1.connect)(environmentMainService.mainIPCHandle, 'main');
                }
                catch (error) {
                    // Handle unexpected connection errors by showing a dialog to the user
                    if (!retry || platform_1.isWindows || error.code !== 'ECONNREFUSED') {
                        if (error.code === 'EPERM') {
                            this.showStartupWarningDialog((0, nls_1.localize)('secondInstanceAdmin', "Another instance of {0} is already running as administrator.", productService.nameShort), (0, nls_1.localize)('secondInstanceAdminDetail', "Please close the other instance and try again."), productService);
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
                    return this.claimInstance(logService, environmentMainService, lifecycleMainService, instantiationService, productService, false);
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
                        this.showStartupWarningDialog((0, nls_1.localize)('secondInstanceNoResponse', "Another instance of {0} is running but not responding", productService.nameShort), (0, nls_1.localize)('secondInstanceNoResponseDetail', "Please close all other instances and try again."), productService);
                    }, 10000);
                }
                const otherInstanceLaunchMainService = ipc_1.ProxyChannel.toService(client.getChannel('launch'), { disableMarshalling: true });
                const otherInstanceDiagnosticsMainService = ipc_1.ProxyChannel.toService(client.getChannel('diagnostics'), { disableMarshalling: true });
                // Process Info
                if (environmentMainService.args.status) {
                    return instantiationService.invokeFunction(async () => {
                        const diagnosticsService = new diagnosticsService_1.DiagnosticsService(telemetryUtils_1.NullTelemetryService, productService);
                        const mainDiagnostics = await otherInstanceDiagnosticsMainService.getMainDiagnostics();
                        const remoteDiagnostics = await otherInstanceDiagnosticsMainService.getRemoteDiagnostics({ includeProcesses: true, includeWorkspaceMetadata: true });
                        const diagnostics = await diagnosticsService.getDiagnostics(mainDiagnostics, remoteDiagnostics);
                        console.log(diagnostics);
                        throw new errors_1.ExpectedError();
                    });
                }
                // Windows: allow to set foreground
                if (platform_1.isWindows) {
                    await this.windowsAllowSetForegroundWindow(otherInstanceLaunchMainService, logService);
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
                throw new errors_1.ExpectedError('Sent env to running instance. Terminating...');
            }
            // Print --status usage info
            if (environmentMainService.args.status) {
                console.log((0, nls_1.localize)('statusWarning', "Warning: The --status argument can only be used if {0} is already running. Please run it again after {0} has started.", productService.nameShort));
                throw new errors_1.ExpectedError('Terminating...');
            }
            // Set the VSCODE_PID variable here when we are sure we are the first
            // instance to startup. Otherwise we would wrongly overwrite the PID
            process.env['VSCODE_PID'] = String(process.pid);
            return mainProcessNodeIpcServer;
        }
        handleStartupDataDirError(environmentMainService, productService, error) {
            if (error.code === 'EACCES' || error.code === 'EPERM') {
                const directories = (0, arrays_1.coalesce)([environmentMainService.userDataPath, environmentMainService.extensionsPath, ipc_net_1.XDG_RUNTIME_DIR]).map(folder => (0, labels_1.getPathLabel)(uri_1.URI.file(folder), { os: platform_1.OS, tildify: environmentMainService }));
                this.showStartupWarningDialog((0, nls_1.localize)('startupDataDirError', "Unable to write program user data."), (0, nls_1.localize)('startupUserDataAndExtensionsDirErrorDetail', "{0}\n\nPlease make sure the following directories are writeable:\n\n{1}", (0, errorMessage_1.toErrorMessage)(error), directories.join('\n')), productService);
            }
        }
        showStartupWarningDialog(message, detail, productService) {
            // use sync variant here because we likely exit after this method
            // due to startup issues and otherwise the dialog seems to disappear
            // https://github.com/microsoft/vscode/issues/104493
            electron_1.dialog.showMessageBoxSync((0, dialogs_1.massageMessageBoxOptions)({
                type: 'warning',
                buttons: [(0, nls_1.localize)({ key: 'close', comment: ['&& denotes a mnemonic'] }, "&&Close")],
                message,
                detail
            }, productService).options);
        }
        async windowsAllowSetForegroundWindow(launchMainService, logService) {
            if (platform_1.isWindows) {
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
        quit(accessor, reason) {
            const logService = accessor.get(log_1.ILogService);
            const lifecycleMainService = accessor.get(lifecycleMainService_1.ILifecycleMainService);
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
        resolveArgs() {
            // Parse arguments
            const args = this.validatePaths((0, argvHelper_1.parseMainProcessArgv)(process.argv));
            // If we are started with --wait create a random temporary file
            // and pass it over to the starting instance. We can use this file
            // to wait for it to be deleted to monitor that the edited file
            // is closed and then exit the waiting process.
            //
            // Note: we are not doing this if the wait marker has been already
            // added as argument. This can happen if VS Code was started from CLI.
            if (args.wait && !args.waitMarkerFilePath) {
                const waitMarkerFilePath = (0, wait_1.createWaitMarkerFileSync)(args.verbose);
                if (waitMarkerFilePath) {
                    (0, argvHelper_1.addArg)(process.argv, '--waitMarkerFilePath', waitMarkerFilePath);
                    args.waitMarkerFilePath = waitMarkerFilePath;
                }
            }
            return args;
        }
        validatePaths(args) {
            // Track URLs if they're going to be used
            if (args['open-url']) {
                args._urls = args._;
                args._ = [];
            }
            // Normalize paths and watch out for goto line mode
            if (!args['remote']) {
                const paths = this.doValidatePaths(args._, args.goto);
                args._ = paths;
            }
            return args;
        }
        doValidatePaths(args, gotoLineMode) {
            const currentWorkingDir = (0, process_1.cwd)();
            const result = args.map(arg => {
                let pathCandidate = String(arg);
                let parsedPath = undefined;
                if (gotoLineMode) {
                    parsedPath = (0, extpath_1.parseLineAndColumnAware)(pathCandidate);
                    pathCandidate = parsedPath.path;
                }
                if (pathCandidate) {
                    pathCandidate = this.preparePath(currentWorkingDir, pathCandidate);
                }
                const sanitizedFilePath = (0, extpath_1.sanitizeFilePath)(pathCandidate, currentWorkingDir);
                const filePathBasename = (0, path_1.basename)(sanitizedFilePath);
                if (filePathBasename /* can be empty if code is opened on root */ && !(0, extpath_1.isValidBasename)(filePathBasename)) {
                    return null; // do not allow invalid file names
                }
                if (gotoLineMode && parsedPath) {
                    parsedPath.path = sanitizedFilePath;
                    return this.toPath(parsedPath);
                }
                return sanitizedFilePath;
            });
            const caseInsensitive = platform_1.isWindows || platform_1.isMacintosh;
            const distinctPaths = (0, arrays_1.distinct)(result, path => path && caseInsensitive ? path.toLowerCase() : (path || ''));
            return (0, arrays_1.coalesce)(distinctPaths);
        }
        preparePath(cwd, path) {
            // Trim trailing quotes
            if (platform_1.isWindows) {
                path = (0, strings_1.rtrim)(path, '"'); // https://github.com/microsoft/vscode/issues/1498
            }
            // Trim whitespaces
            path = (0, strings_1.trim)((0, strings_1.trim)(path, ' '), '\t');
            if (platform_1.isWindows) {
                // Resolve the path against cwd if it is relative
                path = (0, path_1.resolve)(cwd, path);
                // Trim trailing '.' chars on Windows to prevent invalid file names
                path = (0, strings_1.rtrim)(path, '.');
            }
            return path;
        }
        toPath(pathWithLineAndCol) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL2NvZGUvZWxlY3Ryb24tbWFpbi9tYWluLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7O0lBdUVoRzs7Ozs7OztPQU9HO0lBQ0gsTUFBTSxRQUFRO1FBRWIsSUFBSTtZQUNILElBQUk7Z0JBQ0gsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDO2FBQ2Y7WUFBQyxPQUFPLEtBQUssRUFBRTtnQkFDZixPQUFPLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQztnQkFDN0IsY0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQzthQUNaO1FBQ0YsQ0FBQztRQUVPLEtBQUssQ0FBQyxPQUFPO1lBRXBCLG9FQUFvRTtZQUNwRSwyQ0FBMkM7WUFDM0MsSUFBQSxrQ0FBeUIsRUFBQyxHQUFHLENBQUMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUVyRCxrQkFBa0I7WUFDbEIsTUFBTSxDQUFDLG9CQUFvQixFQUFFLG1CQUFtQixFQUFFLHNCQUFzQixFQUFFLG9CQUFvQixFQUFFLGdCQUFnQixFQUFFLGdCQUFnQixFQUFFLGNBQWMsRUFBRSwyQkFBMkIsQ0FBQyxHQUFHLElBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQztZQUV6TSxJQUFJO2dCQUVILGdCQUFnQjtnQkFDaEIsSUFBSTtvQkFDSCxNQUFNLElBQUksQ0FBQyxZQUFZLENBQUMsc0JBQXNCLEVBQUUsMkJBQTJCLEVBQUUsb0JBQW9CLEVBQUUsZ0JBQWdCLEVBQUUsY0FBYyxDQUFDLENBQUM7aUJBQ3JJO2dCQUFDLE9BQU8sS0FBSyxFQUFFO29CQUVmLDREQUE0RDtvQkFDNUQsSUFBSSxDQUFDLHlCQUF5QixDQUFDLHNCQUFzQixFQUFFLGNBQWMsRUFBRSxLQUFLLENBQUMsQ0FBQztvQkFF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