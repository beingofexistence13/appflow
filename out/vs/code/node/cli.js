/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "child_process", "fs", "os", "vs/base/common/event", "vs/base/common/path", "vs/base/common/platform", "vs/base/common/ports", "vs/base/node/pfs", "vs/base/node/ports", "vs/platform/files/node/watcher/nodejs/nodejsWatcherLib", "vs/platform/environment/node/argv", "vs/platform/environment/node/argvHelper", "vs/platform/environment/node/stdin", "vs/platform/environment/node/wait", "vs/platform/product/common/product", "vs/base/common/cancellation", "vs/base/common/extpath", "vs/platform/profiling/common/profiling", "vs/base/common/network", "vs/base/common/process", "vs/base/node/unc", "vs/base/common/uri"], function (require, exports, child_process_1, fs_1, os_1, event_1, path_1, platform_1, ports_1, pfs_1, ports_2, nodejsWatcherLib_1, argv_1, argvHelper_1, stdin_1, wait_1, product_1, cancellation_1, extpath_1, profiling_1, network_1, process_1, unc_1, uri_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.main = void 0;
    function shouldSpawnCliProcess(argv) {
        return !!argv['install-source']
            || !!argv['list-extensions']
            || !!argv['install-extension']
            || !!argv['uninstall-extension']
            || !!argv['locate-extension']
            || !!argv['telemetry'];
    }
    async function main(argv) {
        let args;
        try {
            args = (0, argvHelper_1.parseCLIProcessArgv)(argv);
        }
        catch (err) {
            console.error(err.message);
            return;
        }
        for (const subcommand of argv_1.NATIVE_CLI_COMMANDS) {
            if (args[subcommand]) {
                if (!product_1.default.tunnelApplicationName) {
                    console.error(`'${subcommand}' command not supported in ${product_1.default.applicationName}`);
                    return;
                }
                const tunnelArgs = argv.slice(argv.indexOf(subcommand) + 1); // all arguments behind `tunnel`
                return new Promise((resolve, reject) => {
                    let tunnelProcess;
                    const stdio = ['ignore', 'pipe', 'pipe'];
                    if (process.env['VSCODE_DEV']) {
                        tunnelProcess = (0, child_process_1.spawn)('cargo', ['run', '--', subcommand, ...tunnelArgs], { cwd: (0, path_1.join)(getAppRoot(), 'cli'), stdio });
                    }
                    else {
                        const appPath = process.platform === 'darwin'
                            // ./Contents/MacOS/Electron => ./Contents/Resources/app/bin/code-tunnel-insiders
                            ? (0, path_1.join)((0, path_1.dirname)((0, path_1.dirname)(process.execPath)), 'Resources', 'app')
                            : (0, path_1.dirname)(process.execPath);
                        const tunnelCommand = (0, path_1.join)(appPath, 'bin', `${product_1.default.tunnelApplicationName}${platform_1.isWindows ? '.exe' : ''}`);
                        tunnelProcess = (0, child_process_1.spawn)(tunnelCommand, [subcommand, ...tunnelArgs], { cwd: (0, process_1.cwd)(), stdio });
                    }
                    tunnelProcess.stdout.pipe(process.stdout);
                    tunnelProcess.stderr.pipe(process.stderr);
                    tunnelProcess.on('exit', resolve);
                    tunnelProcess.on('error', reject);
                });
            }
        }
        // Help
        if (args.help) {
            const executable = `${product_1.default.applicationName}${platform_1.isWindows ? '.exe' : ''}`;
            console.log((0, argv_1.buildHelpMessage)(product_1.default.nameLong, executable, product_1.default.version, argv_1.OPTIONS));
        }
        // Version Info
        else if (args.version) {
            console.log((0, argv_1.buildVersionMessage)(product_1.default.version, product_1.default.commit));
        }
        // Shell integration
        else if (args['locate-shell-integration-path']) {
            let file;
            switch (args['locate-shell-integration-path']) {
                // Usage: `[[ "$TERM_PROGRAM" == "vscode" ]] && . "$(code --locate-shell-integration-path bash)"`
                case 'bash':
                    file = 'shellIntegration-bash.sh';
                    break;
                // Usage: `if ($env:TERM_PROGRAM -eq "vscode") { . "$(code --locate-shell-integration-path pwsh)" }`
                case 'pwsh':
                    file = 'shellIntegration.ps1';
                    break;
                // Usage: `[[ "$TERM_PROGRAM" == "vscode" ]] && . "$(code --locate-shell-integration-path zsh)"`
                case 'zsh':
                    file = 'shellIntegration-rc.zsh';
                    break;
                // Usage: `string match -q "$TERM_PROGRAM" "vscode"; and . (code --locate-shell-integration-path fish)`
                case 'fish':
                    file = 'fish_xdg_data/fish/vendor_conf.d/shellIntegration.fish';
                    break;
                default: throw new Error('Error using --locate-shell-integration-path: Invalid shell type');
            }
            console.log((0, path_1.join)(getAppRoot(), 'out', 'vs', 'workbench', 'contrib', 'terminal', 'browser', 'media', file));
        }
        // Extensions Management
        else if (shouldSpawnCliProcess(args)) {
            const cli = await new Promise((resolve, reject) => require(['vs/code/node/cliProcessMain'], resolve, reject));
            await cli.main(args);
            return;
        }
        // Write File
        else if (args['file-write']) {
            const source = args._[0];
            const target = args._[1];
            // Windows: set the paths as allowed UNC paths given
            // they are explicitly provided by the user as arguments
            if (platform_1.isWindows) {
                for (const path of [source, target]) {
                    if ((0, extpath_1.isUNC)(path)) {
                        (0, unc_1.addUNCHostToAllowlist)(uri_1.URI.file(path).authority);
                    }
                }
            }
            // Validate
            if (!source || !target || source === target || // make sure source and target are provided and are not the same
                !(0, path_1.isAbsolute)(source) || !(0, path_1.isAbsolute)(target) || // make sure both source and target are absolute paths
                !(0, fs_1.existsSync)(source) || !(0, fs_1.statSync)(source).isFile() || // make sure source exists as file
                !(0, fs_1.existsSync)(target) || !(0, fs_1.statSync)(target).isFile() // make sure target exists as file
            ) {
                throw new Error('Using --file-write with invalid arguments.');
            }
            try {
                // Check for readonly status and chmod if so if we are told so
                let targetMode = 0;
                let restoreMode = false;
                if (!!args['file-chmod']) {
                    targetMode = (0, fs_1.statSync)(target).mode;
                    if (!(targetMode & 0o200 /* File mode indicating writable by owner */)) {
                        (0, fs_1.chmodSync)(target, targetMode | 0o200);
                        restoreMode = true;
                    }
                }
                // Write source to target
                const data = (0, fs_1.readFileSync)(source);
                if (platform_1.isWindows) {
                    // On Windows we use a different strategy of saving the file
                    // by first truncating the file and then writing with r+ mode.
                    // This helps to save hidden files on Windows
                    // (see https://github.com/microsoft/vscode/issues/931) and
                    // prevent removing alternate data streams
                    // (see https://github.com/microsoft/vscode/issues/6363)
                    (0, fs_1.truncateSync)(target, 0);
                    (0, pfs_1.writeFileSync)(target, data, { flag: 'r+' });
                }
                else {
                    (0, pfs_1.writeFileSync)(target, data);
                }
                // Restore previous mode as needed
                if (restoreMode) {
                    (0, fs_1.chmodSync)(target, targetMode);
                }
            }
            catch (error) {
                error.message = `Error using --file-write: ${error.message}`;
                throw error;
            }
        }
        // Just Code
        else {
            const env = {
                ...process.env,
                'ELECTRON_NO_ATTACH_CONSOLE': '1'
            };
            delete env['ELECTRON_RUN_AS_NODE'];
            const processCallbacks = [];
            if (args.verbose) {
                env['ELECTRON_ENABLE_LOGGING'] = '1';
            }
            if (args.verbose || args.status) {
                processCallbacks.push(async (child) => {
                    child.stdout?.on('data', (data) => console.log(data.toString('utf8').trim()));
                    child.stderr?.on('data', (data) => console.log(data.toString('utf8').trim()));
                    await event_1.Event.toPromise(event_1.Event.fromNodeEventEmitter(child, 'exit'));
                });
            }
            const hasReadStdinArg = args._.some(a => a === '-');
            if (hasReadStdinArg) {
                // remove the "-" argument when we read from stdin
                args._ = args._.filter(a => a !== '-');
                argv = argv.filter(a => a !== '-');
            }
            let stdinFilePath;
            if ((0, stdin_1.hasStdinWithoutTty)()) {
                // Read from stdin: we require a single "-" argument to be passed in order to start reading from
                // stdin. We do this because there is no reliable way to find out if data is piped to stdin. Just
                // checking for stdin being connected to a TTY is not enough (https://github.com/microsoft/vscode/issues/40351)
                if (hasReadStdinArg) {
                    stdinFilePath = (0, stdin_1.getStdinFilePath)();
                    // returns a file path where stdin input is written into (write in progress).
                    try {
                        await (0, stdin_1.readFromStdin)(stdinFilePath, !!args.verbose); // throws error if file can not be written
                        // Make sure to open tmp file
                        (0, argvHelper_1.addArg)(argv, stdinFilePath);
                        // Enable --wait to get all data and ignore adding this to history
                        (0, argvHelper_1.addArg)(argv, '--wait');
                        (0, argvHelper_1.addArg)(argv, '--skip-add-to-recently-opened');
                        args.wait = true;
                        console.log(`Reading from stdin via: ${stdinFilePath}`);
                    }
                    catch (e) {
                        console.log(`Failed to create file to read via stdin: ${e.toString()}`);
                        stdinFilePath = undefined;
                    }
                }
                else {
                    // If the user pipes data via stdin but forgot to add the "-" argument, help by printing a message
                    // if we detect that data flows into via stdin after a certain timeout.
                    processCallbacks.push(_ => (0, stdin_1.stdinDataListener)(1000).then(dataReceived => {
                        if (dataReceived) {
                            if (platform_1.isWindows) {
                                console.log(`Run with '${product_1.default.applicationName} -' to read output from another program (e.g. 'echo Hello World | ${product_1.default.applicationName} -').`);
                            }
                            else {
                                console.log(`Run with '${product_1.default.applicationName} -' to read from stdin (e.g. 'ps aux | grep code | ${product_1.default.applicationName} -').`);
                            }
                        }
                    }));
                }
            }
            const isMacOSBigSurOrNewer = platform_1.isMacintosh && (0, os_1.release)() > '20.0.0';
            // If we are started with --wait create a random temporary file
            // and pass it over to the starting instance. We can use this file
            // to wait for it to be deleted to monitor that the edited file
            // is closed and then exit the waiting process.
            let waitMarkerFilePath;
            if (args.wait) {
                waitMarkerFilePath = (0, wait_1.createWaitMarkerFileSync)(args.verbose);
                if (waitMarkerFilePath) {
                    (0, argvHelper_1.addArg)(argv, '--waitMarkerFilePath', waitMarkerFilePath);
                }
                // When running with --wait, we want to continue running CLI process
                // until either:
                // - the wait marker file has been deleted (e.g. when closing the editor)
                // - the launched process terminates (e.g. due to a crash)
                processCallbacks.push(async (child) => {
                    let childExitPromise;
                    if (isMacOSBigSurOrNewer) {
                        // On Big Sur, we resolve the following promise only when the child,
                        // i.e. the open command, exited with a signal or error. Otherwise, we
                        // wait for the marker file to be deleted or for the child to error.
                        childExitPromise = new Promise(resolve => {
                            // Only resolve this promise if the child (i.e. open) exited with an error
                            child.on('exit', (code, signal) => {
                                if (code !== 0 || signal) {
                                    resolve();
                                }
                            });
                        });
                    }
                    else {
                        // On other platforms, we listen for exit in case the child exits before the
                        // marker file is deleted.
                        childExitPromise = event_1.Event.toPromise(event_1.Event.fromNodeEventEmitter(child, 'exit'));
                    }
                    try {
                        await Promise.race([
                            (0, pfs_1.whenDeleted)(waitMarkerFilePath),
                            event_1.Event.toPromise(event_1.Event.fromNodeEventEmitter(child, 'error')),
                            childExitPromise
                        ]);
                    }
                    finally {
                        if (stdinFilePath) {
                            (0, fs_1.unlinkSync)(stdinFilePath); // Make sure to delete the tmp stdin file if we have any
                        }
                    }
                });
            }
            // If we have been started with `--prof-startup` we need to find free ports to profile
            // the main process, the renderer, and the extension host. We also disable v8 cached data
            // to get better profile traces. Last, we listen on stdout for a signal that tells us to
            // stop profiling.
            if (args['prof-startup']) {
                const portMain = await (0, ports_2.findFreePort)((0, ports_1.randomPort)(), 10, 3000);
                const portRenderer = await (0, ports_2.findFreePort)(portMain + 1, 10, 3000);
                const portExthost = await (0, ports_2.findFreePort)(portRenderer + 1, 10, 3000);
                // fail the operation when one of the ports couldn't be acquired.
                if (portMain * portRenderer * portExthost === 0) {
                    throw new Error('Failed to find free ports for profiler. Make sure to shutdown all instances of the editor first.');
                }
                const filenamePrefix = (0, extpath_1.randomPath)((0, os_1.homedir)(), 'prof');
                (0, argvHelper_1.addArg)(argv, `--inspect-brk=${portMain}`);
                (0, argvHelper_1.addArg)(argv, `--remote-debugging-port=${portRenderer}`);
                (0, argvHelper_1.addArg)(argv, `--inspect-brk-extensions=${portExthost}`);
                (0, argvHelper_1.addArg)(argv, `--prof-startup-prefix`, filenamePrefix);
                (0, argvHelper_1.addArg)(argv, `--no-cached-data`);
                (0, pfs_1.writeFileSync)(filenamePrefix, argv.slice(-6).join('|'));
                processCallbacks.push(async (_child) => {
                    class Profiler {
                        static async start(name, filenamePrefix, opts) {
                            const profiler = await new Promise((resolve_1, reject_1) => { require(['v8-inspect-profiler'], resolve_1, reject_1); });
                            let session;
                            try {
                                session = await profiler.startProfiling(opts);
                            }
                            catch (err) {
                                console.error(`FAILED to start profiling for '${name}' on port '${opts.port}'`);
                            }
                            return {
                                async stop() {
                                    if (!session) {
                                        return;
                                    }
                                    let suffix = '';
                                    const result = await session.stop();
                                    if (!process.env['VSCODE_DEV']) {
                                        // when running from a not-development-build we remove
                                        // absolute filenames because we don't want to reveal anything
                                        // about users. We also append the `.txt` suffix to make it
                                        // easier to attach these files to GH issues
                                        result.profile = profiling_1.Utils.rewriteAbsolutePaths(result.profile, 'piiRemoved');
                                        suffix = '.txt';
                                    }
                                    (0, pfs_1.writeFileSync)(`${filenamePrefix}.${name}.cpuprofile${suffix}`, JSON.stringify(result.profile, undefined, 4));
                                }
                            };
                        }
                    }
                    try {
                        // load and start profiler
                        const mainProfileRequest = Profiler.start('main', filenamePrefix, { port: portMain });
                        const extHostProfileRequest = Profiler.start('extHost', filenamePrefix, { port: portExthost, tries: 300 });
                        const rendererProfileRequest = Profiler.start('renderer', filenamePrefix, {
                            port: portRenderer,
                            tries: 200,
                            target: function (targets) {
                                return targets.filter(target => {
                                    if (!target.webSocketDebuggerUrl) {
                                        return false;
                                    }
                                    if (target.type === 'page') {
                                        return target.url.indexOf('workbench/workbench.html') > 0 || target.url.indexOf('workbench/workbench-dev.html') > 0;
                                    }
                                    else {
                                        return true;
                                    }
                                })[0];
                            }
                        });
                        const main = await mainProfileRequest;
                        const extHost = await extHostProfileRequest;
                        const renderer = await rendererProfileRequest;
                        // wait for the renderer to delete the
                        // marker file
                        await (0, pfs_1.whenDeleted)(filenamePrefix);
                        // stop profiling
                        await main.stop();
                        await renderer.stop();
                        await extHost.stop();
                        // re-create the marker file to signal that profiling is done
                        (0, pfs_1.writeFileSync)(filenamePrefix, '');
                    }
                    catch (e) {
                        console.error('Failed to profile startup. Make sure to quit Code first.');
                    }
                });
            }
            const options = {
                detached: true,
                env
            };
            if (!args.verbose) {
                options['stdio'] = 'ignore';
            }
            let child;
            if (!isMacOSBigSurOrNewer) {
                if (!args.verbose && args.status) {
                    options['stdio'] = ['ignore', 'pipe', 'ignore']; // restore ability to see output when --status is used
                }
                // We spawn process.execPath directly
                child = (0, child_process_1.spawn)(process.execPath, argv.slice(2), options);
            }
            else {
                // On Big Sur, we spawn using the open command to obtain behavior
                // similar to if the app was launched from the dock
                // https://github.com/microsoft/vscode/issues/102975
                // The following args are for the open command itself, rather than for VS Code:
                // -n creates a new instance.
                //    Without -n, the open command re-opens the existing instance as-is.
                // -g starts the new instance in the background.
                //    Later, Electron brings the instance to the foreground.
                //    This way, Mac does not automatically try to foreground the new instance, which causes
                //    focusing issues when the new instance only sends data to a previous instance and then closes.
                const spawnArgs = ['-n', '-g'];
                // -a opens the given application.
                spawnArgs.push('-a', process.execPath); // -a: opens a specific application
                if (args.verbose || args.status) {
                    spawnArgs.push('--wait-apps'); // `open --wait-apps`: blocks until the launched app is closed (even if they were already running)
                    // The open command only allows for redirecting stderr and stdout to files,
                    // so we make it redirect those to temp files, and then use a logger to
                    // redirect the file output to the console
                    for (const outputType of args.verbose ? ['stdout', 'stderr'] : ['stdout']) {
                        // Tmp file to target output to
                        const tmpName = (0, extpath_1.randomPath)((0, os_1.tmpdir)(), `code-${outputType}`);
                        (0, pfs_1.writeFileSync)(tmpName, '');
                        spawnArgs.push(`--${outputType}`, tmpName);
                        // Listener to redirect content to stdout/stderr
                        processCallbacks.push(async (child) => {
                            try {
                                const stream = outputType === 'stdout' ? process.stdout : process.stderr;
                                const cts = new cancellation_1.CancellationTokenSource();
                                child.on('close', () => {
                                    // We must dispose the token to stop watching,
                                    // but the watcher might still be reading data.
                                    setTimeout(() => cts.dispose(true), 200);
                                });
                                await (0, nodejsWatcherLib_1.watchFileContents)(tmpName, chunk => stream.write(chunk), () => { }, cts.token);
                            }
                            finally {
                                (0, fs_1.unlinkSync)(tmpName);
                            }
                        });
                    }
                }
                for (const e in env) {
                    // Ignore the _ env var, because the open command
                    // ignores it anyway.
                    // Pass the rest of the env vars in to fix
                    // https://github.com/microsoft/vscode/issues/134696.
                    if (e !== '_') {
                        spawnArgs.push('--env');
                        spawnArgs.push(`${e}=${env[e]}`);
                    }
                }
                spawnArgs.push('--args', ...argv.slice(2)); // pass on our arguments
                if (env['VSCODE_DEV']) {
                    // If we're in development mode, replace the . arg with the
                    // vscode source arg. Because the OSS app isn't bundled,
                    // it needs the full vscode source arg to launch properly.
                    const curdir = '.';
                    const launchDirIndex = spawnArgs.indexOf(curdir);
                    if (launchDirIndex !== -1) {
                        spawnArgs[launchDirIndex] = (0, path_1.resolve)(curdir);
                    }
                }
                // We already passed over the env variables
                // using the --env flags, so we can leave them out here.
                // Also, we don't need to pass env._, which is different from argv._
                child = (0, child_process_1.spawn)('open', spawnArgs, { ...options, env: {} });
            }
            return Promise.all(processCallbacks.map(callback => callback(child)));
        }
    }
    exports.main = main;
    function getAppRoot() {
        return (0, path_1.dirname)(network_1.FileAccess.asFileUri('').fsPath);
    }
    function eventuallyExit(code) {
        setTimeout(() => process.exit(code), 0);
    }
    main(process.argv)
        .then(() => eventuallyExit(0))
        .then(null, err => {
        console.error(err.message || err.stack || err);
        eventuallyExit(1);
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvY29kZS9ub2RlL2NsaS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUEyQmhHLFNBQVMscUJBQXFCLENBQUMsSUFBc0I7UUFDcEQsT0FBTyxDQUFDLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDO2VBQzNCLENBQUMsQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUM7ZUFDekIsQ0FBQyxDQUFDLElBQUksQ0FBQyxtQkFBbUIsQ0FBQztlQUMzQixDQUFDLENBQUMsSUFBSSxDQUFDLHFCQUFxQixDQUFDO2VBQzdCLENBQUMsQ0FBQyxJQUFJLENBQUMsa0JBQWtCLENBQUM7ZUFDMUIsQ0FBQyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQztJQUN6QixDQUFDO0lBTU0sS0FBSyxVQUFVLElBQUksQ0FBQyxJQUFjO1FBQ3hDLElBQUksSUFBc0IsQ0FBQztRQUUzQixJQUFJO1lBQ0gsSUFBSSxHQUFHLElBQUEsZ0NBQW1CLEVBQUMsSUFBSSxDQUFDLENBQUM7U0FDakM7UUFBQyxPQUFPLEdBQUcsRUFBRTtZQUNiLE9BQU8sQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQzNCLE9BQU87U0FDUDtRQUVELEtBQUssTUFBTSxVQUFVLElBQUksMEJBQW1CLEVBQUU7WUFDN0MsSUFBSSxJQUFJLENBQUMsVUFBVSxDQUFDLEVBQUU7Z0JBQ3JCLElBQUksQ0FBQyxpQkFBTyxDQUFDLHFCQUFxQixFQUFFO29CQUNuQyxPQUFPLENBQUMsS0FBSyxDQUFDLElBQUksVUFBVSw4QkFBOEIsaUJBQU8sQ0FBQyxlQUFlLEVBQUUsQ0FBQyxDQUFDO29CQUNyRixPQUFPO2lCQUNQO2dCQUNELE1BQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLGdDQUFnQztnQkFDN0YsT0FBTyxJQUFJLE9BQU8sQ0FBQyxDQUFDLE9BQU8sRUFBRSxNQUFNLEVBQUUsRUFBRTtvQkFDdEMsSUFBSSxhQUEyQixDQUFDO29CQUNoQyxNQUFNLEtBQUssR0FBaUIsQ0FBQyxRQUFRLEVBQUUsTUFBTSxFQUFFLE1BQU0sQ0FBQyxDQUFDO29CQUN2RCxJQUFJLE9BQU8sQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLEVBQUU7d0JBQzlCLGFBQWEsR0FBRyxJQUFBLHFCQUFLLEVBQUMsT0FBTyxFQUFFLENBQUMsS0FBSyxFQUFFLElBQUksRUFBRSxVQUFVLEVBQUUsR0FBRyxVQUFVLENBQUMsRUFBRSxFQUFFLEdBQUcsRUFBRSxJQUFBLFdBQUksRUFBQyxVQUFVLEVBQUUsRUFBRSxLQUFLLENBQUMsRUFBRSxLQUFLLEVBQUUsQ0FBQyxDQUFDO3FCQUNwSDt5QkFBTTt3QkFDTixNQUFNLE9BQU8sR0FBRyxPQUFPLENBQUMsUUFBUSxLQUFLLFFBQVE7NEJBQzVDLGlGQUFpRjs0QkFDakYsQ0FBQyxDQUFDLElBQUEsV0FBSSxFQUFDLElBQUEsY0FBTyxFQUFDLElBQUEsY0FBTyxFQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQyxFQUFFLFdBQVcsRUFBRSxLQUFLLENBQUM7NEJBQzlELENBQUMsQ0FBQyxJQUFBLGNBQU8sRUFBQyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUM7d0JBQzdCLE1BQU0sYUFBYSxHQUFHLElBQUEsV0FBSSxFQUFDLE9BQU8sRUFBRSxLQUFLLEVBQUUsR0FBRyxpQkFBTyxDQUFDLHFCQUFxQixHQUFHLG9CQUFTLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQzt3QkFDekcsYUFBYSxHQUFHLElBQUEscUJBQUssRUFBQyxhQUFhLEVBQUUsQ0FBQyxVQUFVLEVBQUUsR0FBRyxVQUFVLENBQUMsRUFBRSxFQUFFLEdBQUcsRUFBRSxJQUFBLGFBQUcsR0FBRSxFQUFFLEtBQUssRUFBRSxDQUFDLENBQUM7cUJBQ3pGO29CQUVELGFBQWEsQ0FBQyxNQUFPLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQztvQkFDM0MsYUFBYSxDQUFDLE1BQU8sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDO29CQUMzQyxhQUFhLENBQUMsRUFBRSxDQUFDLE1BQU0sRUFBRSxPQUFPLENBQUMsQ0FBQztvQkFDbEMsYUFBYSxDQUFDLEVBQUUsQ0FBQyxPQUFPLEVBQUUsTUFBTSxDQUFDLENBQUM7Z0JBQ25DLENBQUMsQ0FBQyxDQUFDO2FBQ0g7U0FDRDtRQUVELE9BQU87UUFDUCxJQUFJLElBQUksQ0FBQyxJQUFJLEVBQUU7WUFDZCxNQUFNLFVBQVUsR0FBRyxHQUFHLGlCQUFPLENBQUMsZUFBZSxHQUFHLG9CQUFTLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUM7WUFDMUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFBLHVCQUFnQixFQUFDLGlCQUFPLENBQUMsUUFBUSxFQUFFLFVBQVUsRUFBRSxpQkFBTyxDQUFDLE9BQU8sRUFBRSxjQUFPLENBQUMsQ0FBQyxDQUFDO1NBQ3RGO1FBRUQsZUFBZTthQUNWLElBQUksSUFBSSxDQUFDLE9BQU8sRUFBRTtZQUN0QixPQUFPLENBQUMsR0FBRyxDQUFDLElBQUEsMEJBQW1CLEVBQUMsaUJBQU8sQ0FBQyxPQUFPLEVBQUUsaUJBQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO1NBQ2xFO1FBRUQsb0JBQW9CO2FBQ2YsSUFBSSxJQUFJLENBQUMsK0JBQStCLENBQUMsRUFBRTtZQUMvQyxJQUFJLElBQVksQ0FBQztZQUNqQixRQUFRLElBQUksQ0FBQywrQkFBK0IsQ0FBQyxFQUFFO2dCQUM5QyxpR0FBaUc7Z0JBQ2pHLEtBQUssTUFBTTtvQkFBRSxJQUFJLEdBQUcsMEJBQTBCLENBQUM7b0JBQUMsTUFBTTtnQkFDdEQsb0dBQW9HO2dCQUNwRyxLQUFLLE1BQU07b0JBQUUsSUFBSSxHQUFHLHNCQUFzQixDQUFDO29CQUFDLE1BQU07Z0JBQ2xELGdHQUFnRztnQkFDaEcsS0FBSyxLQUFLO29CQUFFLElBQUksR0FBRyx5QkFBeUIsQ0FBQztvQkFBQyxNQUFNO2dCQUNwRCx1R0FBdUc7Z0JBQ3ZHLEtBQUssTUFBTTtvQkFBRSxJQUFJLEdBQUcsd0RBQXdELENBQUM7b0JBQUMsTUFBTTtnQkFDcEYsT0FBTyxDQUFDLENBQUMsTUFBTSxJQUFJLEtBQUssQ0FBQyxpRUFBaUUsQ0FBQyxDQUFDO2FBQzVGO1lBQ0QsT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFBLFdBQUksRUFBQyxVQUFVLEVBQUUsRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLFdBQVcsRUFBRSxTQUFTLEVBQUUsVUFBVSxFQUFFLFNBQVMsRUFBRSxPQUFPLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQztTQUMzRztRQUVELHdCQUF3QjthQUNuQixJQUFJLHFCQUFxQixDQUFDLElBQUksQ0FBQyxFQUFFO1lBQ3JDLE1BQU0sR0FBRyxHQUFHLE1BQU0sSUFBSSxPQUFPLENBQVcsQ0FBQyxPQUFPLEVBQUUsTUFBTSxFQUFFLEVBQUUsQ0FBQyxPQUFPLENBQUMsQ0FBQyw2QkFBNkIsQ0FBQyxFQUFFLE9BQU8sRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDO1lBQ3hILE1BQU0sR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUVyQixPQUFPO1NBQ1A7UUFFRCxhQUFhO2FBQ1IsSUFBSSxJQUFJLENBQUMsWUFBWSxDQUFDLEVBQUU7WUFDNUIsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUN6QixNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBRXpCLG9EQUFvRDtZQUNwRCx3REFBd0Q7WUFDeEQsSUFBSSxvQkFBUyxFQUFFO2dCQUNkLEtBQUssTUFBTSxJQUFJLElBQUksQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDLEVBQUU7b0JBQ3BDLElBQUksSUFBQSxlQUFLLEVBQUMsSUFBSSxDQUFDLEVBQUU7d0JBQ2hCLElBQUEsMkJBQXFCLEVBQUMsU0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQztxQkFDaEQ7aUJBQ0Q7YUFDRDtZQUVELFdBQVc7WUFDWCxJQUNDLENBQUMsTUFBTSxJQUFJLENBQUMsTUFBTSxJQUFJLE1BQU0sS0FBSyxNQUFNLElBQU8sZ0VBQWdFO2dCQUM5RyxDQUFDLElBQUEsaUJBQVUsRUFBQyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUEsaUJBQVUsRUFBQyxNQUFNLENBQUMsSUFBTSxzREFBc0Q7Z0JBQ3RHLENBQUMsSUFBQSxlQUFVLEVBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFBLGFBQVEsRUFBQyxNQUFNLENBQUMsQ0FBQyxNQUFNLEVBQUUsSUFBSSxrQ0FBa0M7Z0JBQ3ZGLENBQUMsSUFBQSxlQUFVLEVBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFBLGFBQVEsRUFBQyxNQUFNLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBRSxrQ0FBa0M7Y0FDcEY7Z0JBQ0QsTUFBTSxJQUFJLEtBQUssQ0FBQyw0Q0FBNEMsQ0FBQyxDQUFDO2FBQzlEO1lBRUQsSUFBSTtnQkFFSCw4REFBOEQ7Z0JBQzlELElBQUksVUFBVSxHQUFXLENBQUMsQ0FBQztnQkFDM0IsSUFBSSxXQUFXLEdBQUcsS0FBSyxDQUFDO2dCQUN4QixJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLEVBQUU7b0JBQ3pCLFVBQVUsR0FBRyxJQUFBLGFBQVEsRUFBQyxNQUFNLENBQUMsQ0FBQyxJQUFJLENBQUM7b0JBQ25DLElBQUksQ0FBQyxDQUFDLFVBQVUsR0FBRyxLQUFLLENBQUMsNENBQTRDLENBQUMsRUFBRTt3QkFDdkUsSUFBQSxjQUFTLEVBQUMsTUFBTSxFQUFFLFVBQVUsR0FBRyxLQUFLLENBQUMsQ0FBQzt3QkFDdEMsV0FBVyxHQUFHLElBQUksQ0FBQztxQkFDbkI7aUJBQ0Q7Z0JBRUQseUJBQXlCO2dCQUN6QixNQUFNLElBQUksR0FBRyxJQUFBLGlCQUFZLEVBQUMsTUFBTSxDQUFDLENBQUM7Z0JBQ2xDLElBQUksb0JBQVMsRUFBRTtvQkFDZCw0REFBNEQ7b0JBQzVELDhEQUE4RDtvQkFDOUQsNkNBQTZDO29CQUM3QywyREFBMkQ7b0JBQzNELDBDQUEwQztvQkFDMUMsd0RBQXdEO29CQUN4RCxJQUFBLGlCQUFZLEVBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxDQUFDO29CQUN4QixJQUFBLG1CQUFhLEVBQUMsTUFBTSxFQUFFLElBQUksRUFBRSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDO2lCQUM1QztxQkFBTTtvQkFDTixJQUFBLG1CQUFhLEVBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFDO2lCQUM1QjtnQkFFRCxrQ0FBa0M7Z0JBQ2xDLElBQUksV0FBVyxFQUFFO29CQUNoQixJQUFBLGNBQVMsRUFBQyxNQUFNLEVBQUUsVUFBVSxDQUFDLENBQUM7aUJBQzlCO2FBQ0Q7WUFBQyxPQUFPLEtBQUssRUFBRTtnQkFDZixLQUFLLENBQUMsT0FBTyxHQUFHLDZCQUE2QixLQUFLLENBQUMsT0FBTyxFQUFFLENBQUM7Z0JBQzdELE1BQU0sS0FBSyxDQUFDO2FBQ1o7U0FDRDtRQUVELFlBQVk7YUFDUDtZQUNKLE1BQU0sR0FBRyxHQUF3QjtnQkFDaEMsR0FBRyxPQUFPLENBQUMsR0FBRztnQkFDZCw0QkFBNEIsRUFBRSxHQUFHO2FBQ2pDLENBQUM7WUFFRixPQUFPLEdBQUcsQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDO1lBRW5DLE1BQU0sZ0JBQWdCLEdBQStDLEVBQUUsQ0FBQztZQUV4RSxJQUFJLElBQUksQ0FBQyxPQUFPLEVBQUU7Z0JBQ2pCLEdBQUcsQ0FBQyx5QkFBeUIsQ0FBQyxHQUFHLEdBQUcsQ0FBQzthQUNyQztZQUVELElBQUksSUFBSSxDQUFDLE9BQU8sSUFBSSxJQUFJLENBQUMsTUFBTSxFQUFFO2dCQUNoQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFDLEtBQUssRUFBQyxFQUFFO29CQUNuQyxLQUFLLENBQUMsTUFBTSxFQUFFLEVBQUUsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxJQUFZLEVBQUUsRUFBRSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUM7b0JBQ3RGLEtBQUssQ0FBQyxNQUFNLEVBQUUsRUFBRSxDQUFDLE1BQU0sRUFBRSxDQUFDLElBQVksRUFBRSxFQUFFLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQztvQkFFdEYsTUFBTSxhQUFLLENBQUMsU0FBUyxDQUFDLGFBQUssQ0FBQyxvQkFBb0IsQ0FBQyxLQUFLLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQztnQkFDbEUsQ0FBQyxDQUFDLENBQUM7YUFDSDtZQUVELE1BQU0sZUFBZSxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDO1lBQ3BELElBQUksZUFBZSxFQUFFO2dCQUNwQixrREFBa0Q7Z0JBQ2xELElBQUksQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUM7Z0JBQ3ZDLElBQUksR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDO2FBQ25DO1lBRUQsSUFBSSxhQUFpQyxDQUFDO1lBQ3RDLElBQUksSUFBQSwwQkFBa0IsR0FBRSxFQUFFO2dCQUV6QixnR0FBZ0c7Z0JBQ2hHLGlHQUFpRztnQkFDakcsK0dBQStHO2dCQUUvRyxJQUFJLGVBQWUsRUFBRTtvQkFDcEIsYUFBYSxHQUFHLElBQUEsd0JBQWdCLEdBQUUsQ0FBQztvQkFFbkMsNkVBQTZFO29CQUM3RSxJQUFJO3dCQUNILE1BQU0sSUFBQSxxQkFBYSxFQUFDLGFBQWEsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsMENBQTBDO3dCQUU5Riw2QkFBNkI7d0JBQzdCLElBQUEsbUJBQU0sRUFBQyxJQUFJLEVBQUUsYUFBYSxDQUFDLENBQUM7d0JBRTVCLGtFQUFrRTt3QkFDbEUsSUFBQSxtQkFBTSxFQUFDLElBQUksRUFBRSxRQUFRLENBQUMsQ0FBQzt3QkFDdkIsSUFBQSxtQkFBTSxFQUFDLElBQUksRUFBRSwrQkFBK0IsQ0FBQyxDQUFDO3dCQUM5QyxJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQzt3QkFFakIsT0FBTyxDQUFDLEdBQUcsQ0FBQywyQkFBMkIsYUFBYSxFQUFFLENBQUMsQ0FBQztxQkFDeEQ7b0JBQUMsT0FBTyxDQUFDLEVBQUU7d0JBQ1gsT0FBTyxDQUFDLEdBQUcsQ0FBQyw0Q0FBNEMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxFQUFFLENBQUMsQ0FBQzt3QkFDeEUsYUFBYSxHQUFHLFNBQVMsQ0FBQztxQkFDMUI7aUJBQ0Q7cUJBQU07b0JBRU4sa0dBQWtHO29CQUNsRyx1RUFBdUU7b0JBQ3ZFLGdCQUFnQixDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUEseUJBQWlCLEVBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxFQUFFO3dCQUN0RSxJQUFJLFlBQVksRUFBRTs0QkFDakIsSUFBSSxvQkFBUyxFQUFFO2dDQUNkLE9BQU8sQ0FBQyxHQUFHLENBQUMsYUFBYSxpQkFBTyxDQUFDLGVBQWUscUVBQXFFLGlCQUFPLENBQUMsZUFBZSxPQUFPLENBQUMsQ0FBQzs2QkFDcko7aUNBQU07Z0NBQ04sT0FBTyxDQUFDLEdBQUcsQ0FBQyxhQUFhLGlCQUFPLENBQUMsZUFBZSxzREFBc0QsaUJBQU8sQ0FBQyxlQUFlLE9BQU8sQ0FBQyxDQUFDOzZCQUN0STt5QkFDRDtvQkFDRixDQUFDLENBQUMsQ0FBQyxDQUFDO2lCQUNKO2FBQ0Q7WUFFRCxNQUFNLG9CQUFvQixHQUFHLHNCQUFXLElBQUksSUFBQSxZQUFPLEdBQUUsR0FBRyxRQUFRLENBQUM7WUFFakUsK0RBQStEO1lBQy9ELGtFQUFrRTtZQUNsRSwrREFBK0Q7WUFDL0QsK0NBQStDO1lBQy9DLElBQUksa0JBQXNDLENBQUM7WUFDM0MsSUFBSSxJQUFJLENBQUMsSUFBSSxFQUFFO2dCQUNkLGtCQUFrQixHQUFHLElBQUEsK0JBQXdCLEVBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO2dCQUM1RCxJQUFJLGtCQUFrQixFQUFFO29CQUN2QixJQUFBLG1CQUFNLEVBQUMsSUFBSSxFQUFFLHNCQUFzQixFQUFFLGtCQUFrQixDQUFDLENBQUM7aUJBQ3pEO2dCQUVELG9FQUFvRTtnQkFDcEUsZ0JBQWdCO2dCQUNoQix5RUFBeUU7Z0JBQ3pFLDBEQUEwRDtnQkFDMUQsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBQyxLQUFLLEVBQUMsRUFBRTtvQkFDbkMsSUFBSSxnQkFBZ0IsQ0FBQztvQkFDckIsSUFBSSxvQkFBb0IsRUFBRTt3QkFDekIsb0VBQW9FO3dCQUNwRSxzRUFBc0U7d0JBQ3RFLG9FQUFvRTt3QkFDcEUsZ0JBQWdCLEdBQUcsSUFBSSxPQUFPLENBQU8sT0FBTyxDQUFDLEVBQUU7NEJBQzlDLDBFQUEwRTs0QkFDMUUsS0FBSyxDQUFDLEVBQUUsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxJQUFJLEVBQUUsTUFBTSxFQUFFLEVBQUU7Z0NBQ2pDLElBQUksSUFBSSxLQUFLLENBQUMsSUFBSSxNQUFNLEVBQUU7b0NBQ3pCLE9BQU8sRUFBRSxDQUFDO2lDQUNWOzRCQUNGLENBQUMsQ0FBQyxDQUFDO3dCQUNKLENBQUMsQ0FBQyxDQUFDO3FCQUNIO3lCQUFNO3dCQUNOLDRFQUE0RTt3QkFDNUUsMEJBQTBCO3dCQUMxQixnQkFBZ0IsR0FBRyxhQUFLLENBQUMsU0FBUyxDQUFDLGFBQUssQ0FBQyxvQkFBb0IsQ0FBQyxLQUFLLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQztxQkFDOUU7b0JBQ0QsSUFBSTt3QkFDSCxNQUFNLE9BQU8sQ0FBQyxJQUFJLENBQUM7NEJBQ2xCLElBQUEsaUJBQVcsRUFBQyxrQkFBbUIsQ0FBQzs0QkFDaEMsYUFBSyxDQUFDLFNBQVMsQ0FBQyxhQUFLLENBQUMsb0JBQW9CLENBQUMsS0FBSyxFQUFFLE9BQU8sQ0FBQyxDQUFDOzRCQUMzRCxnQkFBZ0I7eUJBQ2hCLENBQUMsQ0FBQztxQkFDSDs0QkFBUzt3QkFDVCxJQUFJLGFBQWEsRUFBRTs0QkFDbEIsSUFBQSxlQUFVLEVBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQyx3REFBd0Q7eUJBQ25GO3FCQUNEO2dCQUNGLENBQUMsQ0FBQyxDQUFDO2FBQ0g7WUFFRCxzRkFBc0Y7WUFDdEYseUZBQXlGO1lBQ3pGLHdGQUF3RjtZQUN4RixrQkFBa0I7WUFDbEIsSUFBSSxJQUFJLENBQUMsY0FBYyxDQUFDLEVBQUU7Z0JBQ3pCLE1BQU0sUUFBUSxHQUFHLE1BQU0sSUFBQSxvQkFBWSxFQUFDLElBQUEsa0JBQVUsR0FBRSxFQUFFLEVBQUUsRUFBRSxJQUFJLENBQUMsQ0FBQztnQkFDNUQsTUFBTSxZQUFZLEdBQUcsTUFBTSxJQUFBLG9CQUFZLEVBQUMsUUFBUSxHQUFHLENBQUMsRUFBRSxFQUFFLEVBQUUsSUFBSSxDQUFDLENBQUM7Z0JBQ2hFLE1BQU0sV0FBVyxHQUFHLE1BQU0sSUFBQSxvQkFBWSxFQUFDLFlBQVksR0FBRyxDQUFDLEVBQUUsRUFBRSxFQUFFLElBQUksQ0FBQyxDQUFDO2dCQUVuRSxpRUFBaUU7Z0JBQ2pFLElBQUksUUFBUSxHQUFHLFlBQVksR0FBRyxXQUFXLEtBQUssQ0FBQyxFQUFFO29CQUNoRCxNQUFNLElBQUksS0FBSyxDQUFDLGtHQUFrRyxDQUFDLENBQUM7aUJBQ3BIO2dCQUVELE1BQU0sY0FBYyxHQUFHLElBQUEsb0JBQVUsRUFBQyxJQUFBLFlBQU8sR0FBRSxFQUFFLE1BQU0sQ0FBQyxDQUFDO2dCQUVyRCxJQUFBLG1CQUFNLEVBQUMsSUFBSSxFQUFFLGlCQUFpQixRQUFRLEVBQUUsQ0FBQyxDQUFDO2dCQUMxQyxJQUFBLG1CQUFNLEVBQUMsSUFBSSxFQUFFLDJCQUEyQixZQUFZLEVBQUUsQ0FBQyxDQUFDO2dCQUN4RCxJQUFBLG1CQUFNLEVBQUMsSUFBSSxFQUFFLDRCQUE0QixXQUFXLEVBQUUsQ0FBQyxDQUFDO2dCQUN4RCxJQUFBLG1CQUFNLEVBQUMsSUFBSSxFQUFFLHVCQUF1QixFQUFFLGNBQWMsQ0FBQyxDQUFDO2dCQUN0RCxJQUFBLG1CQUFNLEVBQUMsSUFBSSxFQUFFLGtCQUFrQixDQUFDLENBQUM7Z0JBRWpDLElBQUEsbUJBQWEsRUFBQyxjQUFjLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO2dCQUV4RCxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFDLE1BQU0sRUFBQyxFQUFFO29CQUVwQyxNQUFNLFFBQVE7d0JBQ2IsTUFBTSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsSUFBWSxFQUFFLGNBQXNCLEVBQUUsSUFBOEU7NEJBQ3RJLE1BQU0sUUFBUSxHQUFHLHNEQUFhLHFCQUFxQiwyQkFBQyxDQUFDOzRCQUVyRCxJQUFJLE9BQXlCLENBQUM7NEJBQzlCLElBQUk7Z0NBQ0gsT0FBTyxHQUFHLE1BQU0sUUFBUSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsQ0FBQzs2QkFDOUM7NEJBQUMsT0FBTyxHQUFHLEVBQUU7Z0NBQ2IsT0FBTyxDQUFDLEtBQUssQ0FBQyxrQ0FBa0MsSUFBSSxjQUFjLElBQUksQ0FBQyxJQUFJLEdBQUcsQ0FBQyxDQUFDOzZCQUNoRjs0QkFFRCxPQUFPO2dDQUNOLEtBQUssQ0FBQyxJQUFJO29DQUNULElBQUksQ0FBQyxPQUFPLEVBQUU7d0NBQ2IsT0FBTztxQ0FDUDtvQ0FDRCxJQUFJLE1BQU0sR0FBRyxFQUFFLENBQUM7b0NBQ2hCLE1BQU0sTUFBTSxHQUFHLE1BQU0sT0FBTyxDQUFDLElBQUksRUFBRSxDQUFDO29DQUNwQyxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsRUFBRTt3Q0FDL0Isc0RBQXNEO3dDQUN0RCw4REFBOEQ7d0NBQzlELDJEQUEyRDt3Q0FDM0QsNENBQTRDO3dDQUM1QyxNQUFNLENBQUMsT0FBTyxHQUFHLGlCQUFLLENBQUMsb0JBQW9CLENBQUMsTUFBTSxDQUFDLE9BQU8sRUFBRSxZQUFZLENBQUMsQ0FBQzt3Q0FDMUUsTUFBTSxHQUFHLE1BQU0sQ0FBQztxQ0FDaEI7b0NBRUQsSUFBQSxtQkFBYSxFQUFDLEdBQUcsY0FBYyxJQUFJLElBQUksY0FBYyxNQUFNLEVBQUUsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxPQUFPLEVBQUUsU0FBUyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0NBQzlHLENBQUM7NkJBQ0QsQ0FBQzt3QkFDSCxDQUFDO3FCQUNEO29CQUVELElBQUk7d0JBQ0gsMEJBQTBCO3dCQUMxQixNQUFNLGtCQUFrQixHQUFHLFFBQVEsQ0FBQyxLQUFLLENBQUMsTUFBTSxFQUFFLGNBQWMsRUFBRSxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUUsQ0FBQyxDQUFDO3dCQUN0RixNQUFNLHFCQUFxQixHQUFHLFFBQVEsQ0FBQyxLQUFLLENBQUMsU0FBUyxFQUFFLGNBQWMsRUFBRSxFQUFFLElBQUksRUFBRSxXQUFXLEVBQUUsS0FBSyxFQUFFLEdBQUcsRUFBRSxDQUFDLENBQUM7d0JBQzNHLE1BQU0sc0JBQXNCLEdBQUcsUUFBUSxDQUFDLEtBQUssQ0FBQyxVQUFVLEVBQUUsY0FBYyxFQUFFOzRCQUN6RSxJQUFJLEVBQUUsWUFBWTs0QkFDbEIsS0FBSyxFQUFFLEdBQUc7NEJBQ1YsTUFBTSxFQUFFLFVBQVUsT0FBTztnQ0FDeEIsT0FBTyxPQUFPLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxFQUFFO29DQUM5QixJQUFJLENBQUMsTUFBTSxDQUFDLG9CQUFvQixFQUFFO3dDQUNqQyxPQUFPLEtBQUssQ0FBQztxQ0FDYjtvQ0FDRCxJQUFJLE1BQU0sQ0FBQyxJQUFJLEtBQUssTUFBTSxFQUFFO3dDQUMzQixPQUFPLE1BQU0sQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLDBCQUEwQixDQUFDLEdBQUcsQ0FBQyxJQUFJLE1BQU0sQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLDhCQUE4QixDQUFDLEdBQUcsQ0FBQyxDQUFDO3FDQUNwSDt5Q0FBTTt3Q0FDTixPQUFPLElBQUksQ0FBQztxQ0FDWjtnQ0FDRixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQzs0QkFDUCxDQUFDO3lCQUNELENBQUMsQ0FBQzt3QkFFSCxNQUFNLElBQUksR0FBRyxNQUFNLGtCQUFrQixDQUFDO3dCQUN0QyxNQUFNLE9BQU8sR0FBRyxNQUFNLHFCQUFxQixDQUFDO3dCQUM1QyxNQUFNLFFBQVEsR0FBRyxNQUFNLHNCQUFzQixDQUFDO3dCQUU5QyxzQ0FBc0M7d0JBQ3RDLGNBQWM7d0JBQ2QsTUFBTSxJQUFBLGlCQUFXLEVBQUMsY0FBYyxDQUFDLENBQUM7d0JBRWxDLGlCQUFpQjt3QkFDakIsTUFBTSxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7d0JBQ2xCLE1BQU0sUUFBUSxDQUFDLElBQUksRUFBRSxDQUFDO3dCQUN0QixNQUFNLE9BQU8sQ0FBQyxJQUFJLEVBQUUsQ0FBQzt3QkFFckIsNkRBQTZEO3dCQUM3RCxJQUFBLG1CQUFhLEVBQUMsY0FBYyxFQUFFLEVBQUUsQ0FBQyxDQUFDO3FCQUVsQztvQkFBQyxPQUFPLENBQUMsRUFBRTt3QkFDWCxPQUFPLENBQUMsS0FBSyxDQUFDLDBEQUEwRCxDQUFDLENBQUM7cUJBQzFFO2dCQUNGLENBQUMsQ0FBQyxDQUFDO2FBQ0g7WUFFRCxNQUFNLE9BQU8sR0FBaUI7Z0JBQzdCLFFBQVEsRUFBRSxJQUFJO2dCQUNkLEdBQUc7YUFDSCxDQUFDO1lBRUYsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUU7Z0JBQ2xCLE9BQU8sQ0FBQyxPQUFPLENBQUMsR0FBRyxRQUFRLENBQUM7YUFDNUI7WUFFRCxJQUFJLEtBQW1CLENBQUM7WUFDeEIsSUFBSSxDQUFDLG9CQUFvQixFQUFFO2dCQUMxQixJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sSUFBSSxJQUFJLENBQUMsTUFBTSxFQUFFO29CQUNqQyxPQUFPLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxRQUFRLEVBQUUsTUFBTSxFQUFFLFFBQVEsQ0FBQyxDQUFDLENBQUMsc0RBQXNEO2lCQUN2RztnQkFFRCxxQ0FBcUM7Z0JBQ3JDLEtBQUssR0FBRyxJQUFBLHFCQUFLLEVBQUMsT0FBTyxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFLE9BQU8sQ0FBQyxDQUFDO2FBQ3hEO2lCQUFNO2dCQUNOLGlFQUFpRTtnQkFDakUsbURBQW1EO2dCQUNuRCxvREFBb0Q7Z0JBRXBELCtFQUErRTtnQkFDL0UsNkJBQTZCO2dCQUM3Qix3RUFBd0U7Z0JBQ3hFLGdEQUFnRDtnQkFDaEQsNERBQTREO2dCQUM1RCwyRkFBMkY7Z0JBQzNGLG1HQUFtRztnQkFDbkcsTUFBTSxTQUFTLEdBQUcsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7Z0JBQy9CLGtDQUFrQztnQkFDbEMsU0FBUyxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsbUNBQW1DO2dCQUUzRSxJQUFJLElBQUksQ0FBQyxPQUFPLElBQUksSUFBSSxDQUFDLE1BQU0sRUFBRTtvQkFDaEMsU0FBUyxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDLGtHQUFrRztvQkFFakksMkVBQTJFO29CQUMzRSx1RUFBdUU7b0JBQ3ZFLDBDQUEwQztvQkFDMUMsS0FBSyxNQUFNLFVBQVUsSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsRUFBRTt3QkFFMUUsK0JBQStCO3dCQUMvQixNQUFNLE9BQU8sR0FBRyxJQUFBLG9CQUFVLEVBQUMsSUFBQSxXQUFNLEdBQUUsRUFBRSxRQUFRLFVBQVUsRUFBRSxDQUFDLENBQUM7d0JBQzNELElBQUEsbUJBQWEsRUFBQyxPQUFPLEVBQUUsRUFBRSxDQUFDLENBQUM7d0JBQzNCLFNBQVMsQ0FBQyxJQUFJLENBQUMsS0FBSyxVQUFVLEVBQUUsRUFBRSxPQUFPLENBQUMsQ0FBQzt3QkFFM0MsZ0RBQWdEO3dCQUNoRCxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFDLEtBQUssRUFBQyxFQUFFOzRCQUNuQyxJQUFJO2dDQUNILE1BQU0sTUFBTSxHQUFHLFVBQVUsS0FBSyxRQUFRLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUM7Z0NBRXpFLE1BQU0sR0FBRyxHQUFHLElBQUksc0NBQXVCLEVBQUUsQ0FBQztnQ0FDMUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxPQUFPLEVBQUUsR0FBRyxFQUFFO29DQUN0Qiw4Q0FBOEM7b0NBQzlDLCtDQUErQztvQ0FDL0MsVUFBVSxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUM7Z0NBQzFDLENBQUMsQ0FBQyxDQUFDO2dDQUNILE1BQU0sSUFBQSxvQ0FBaUIsRUFBQyxPQUFPLEVBQUUsS0FBSyxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxFQUFFLEdBQUcsRUFBRSxHQUFnQixDQUFDLEVBQUUsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDOzZCQUNsRztvQ0FBUztnQ0FDVCxJQUFBLGVBQVUsRUFBQyxPQUFPLENBQUMsQ0FBQzs2QkFDcEI7d0JBQ0YsQ0FBQyxDQUFDLENBQUM7cUJBQ0g7aUJBQ0Q7Z0JBRUQsS0FBSyxNQUFNLENBQUMsSUFBSSxHQUFHLEVBQUU7b0JBQ3BCLGlEQUFpRDtvQkFDakQscUJBQXFCO29CQUNyQiwwQ0FBMEM7b0JBQzFDLHFEQUFxRDtvQkFDckQsSUFBSSxDQUFDLEtBQUssR0FBRyxFQUFFO3dCQUNkLFNBQVMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7d0JBQ3hCLFNBQVMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztxQkFDakM7aUJBQ0Q7Z0JBRUQsU0FBUyxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyx3QkFBd0I7Z0JBRXBFLElBQUksR0FBRyxDQUFDLFlBQVksQ0FBQyxFQUFFO29CQUN0QiwyREFBMkQ7b0JBQzNELHdEQUF3RDtvQkFDeEQsMERBQTBEO29CQUMxRCxNQUFNLE1BQU0sR0FBRyxHQUFHLENBQUM7b0JBQ25CLE1BQU0sY0FBYyxHQUFHLFNBQVMsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUM7b0JBQ2pELElBQUksY0FBYyxLQUFLLENBQUMsQ0FBQyxFQUFFO3dCQUMxQixTQUFTLENBQUMsY0FBYyxDQUFDLEdBQUcsSUFBQSxjQUFPLEVBQUMsTUFBTSxDQUFDLENBQUM7cUJBQzVDO2lCQUNEO2dCQUVELDJDQUEyQztnQkFDM0Msd0RBQXdEO2dCQUN4RCxvRUFBb0U7Z0JBQ3BFLEtBQUssR0FBRyxJQUFBLHFCQUFLLEVBQUMsTUFBTSxFQUFFLFNBQVMsRUFBRSxFQUFFLEdBQUcsT0FBTyxFQUFFLEdBQUcsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDO2FBQzFEO1lBRUQsT0FBTyxPQUFPLENBQUMsR0FBRyxDQUFDLGdCQUFnQixDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7U0FDdEU7SUFDRixDQUFDO0lBN2NELG9CQTZjQztJQUVELFNBQVMsVUFBVTtRQUNsQixPQUFPLElBQUEsY0FBTyxFQUFDLG9CQUFVLENBQUMsU0FBUyxDQUFDLEVBQUUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQ2pELENBQUM7SUFFRCxTQUFTLGNBQWMsQ0FBQyxJQUFZO1FBQ25DLFVBQVUsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0lBQ3pDLENBQUM7SUFFRCxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQztTQUNoQixJQUFJLENBQUMsR0FBRyxFQUFFLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyxDQUFDO1NBQzdCLElBQUksQ0FBQyxJQUFJLEVBQUUsR0FBRyxDQUFDLEVBQUU7UUFDakIsT0FBTyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsT0FBTyxJQUFJLEdBQUcsQ0FBQyxLQUFLLElBQUksR0FBRyxDQUFDLENBQUM7UUFDL0MsY0FBYyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ25CLENBQUMsQ0FBQyxDQUFDIn0=