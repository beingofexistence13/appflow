/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "child_process", "vs/base/common/path", "vs/nls", "vs/base/common/cancellation", "vs/base/common/errorMessage", "vs/base/common/errors", "vs/base/common/platform", "vs/base/common/uuid", "vs/base/node/shell", "vs/platform/environment/node/argvHelper", "vs/base/common/async", "vs/base/common/numbers"], function (require, exports, child_process_1, path_1, nls_1, cancellation_1, errorMessage_1, errors_1, platform_1, uuid_1, shell_1, argvHelper_1, async_1, numbers_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getResolvedShellEnv = void 0;
    let unixShellEnvPromise = undefined;
    /**
     * Resolves the shell environment by spawning a shell. This call will cache
     * the shell spawning so that subsequent invocations use that cached result.
     *
     * Will throw an error if:
     * - we hit a timeout of `MAX_SHELL_RESOLVE_TIME`
     * - any other error from spawning a shell to figure out the environment
     */
    async function getResolvedShellEnv(configurationService, logService, args, env) {
        // Skip if --force-disable-user-env
        if (args['force-disable-user-env']) {
            logService.trace('resolveShellEnv(): skipped (--force-disable-user-env)');
            return {};
        }
        // Skip on windows
        else if (platform_1.isWindows) {
            logService.trace('resolveShellEnv(): skipped (Windows)');
            return {};
        }
        // Skip if running from CLI already
        else if ((0, argvHelper_1.isLaunchedFromCli)(env) && !args['force-user-env']) {
            logService.trace('resolveShellEnv(): skipped (VSCODE_CLI is set)');
            return {};
        }
        // Otherwise resolve (macOS, Linux)
        else {
            if ((0, argvHelper_1.isLaunchedFromCli)(env)) {
                logService.trace('resolveShellEnv(): running (--force-user-env)');
            }
            else {
                logService.trace('resolveShellEnv(): running (macOS/Linux)');
            }
            // Call this only once and cache the promise for
            // subsequent calls since this operation can be
            // expensive (spawns a process).
            if (!unixShellEnvPromise) {
                unixShellEnvPromise = async_1.Promises.withAsyncBody(async (resolve, reject) => {
                    const cts = new cancellation_1.CancellationTokenSource();
                    let timeoutValue = 10000; // default to 10 seconds
                    const configuredTimeoutValue = configurationService.getValue('application.shellEnvironmentResolutionTimeout');
                    if (typeof configuredTimeoutValue === 'number') {
                        timeoutValue = (0, numbers_1.clamp)(configuredTimeoutValue, 1, 120) * 1000 /* convert from seconds */;
                    }
                    // Give up resolving shell env after some time
                    const timeout = setTimeout(() => {
                        cts.dispose(true);
                        reject(new Error((0, nls_1.localize)('resolveShellEnvTimeout', "Unable to resolve your shell environment in a reasonable time. Please review your shell configuration and restart.")));
                    }, timeoutValue);
                    // Resolve shell env and handle errors
                    try {
                        resolve(await doResolveUnixShellEnv(logService, cts.token));
                    }
                    catch (error) {
                        if (!(0, errors_1.isCancellationError)(error) && !cts.token.isCancellationRequested) {
                            reject(new Error((0, nls_1.localize)('resolveShellEnvError', "Unable to resolve your shell environment: {0}", (0, errorMessage_1.toErrorMessage)(error))));
                        }
                        else {
                            resolve({});
                        }
                    }
                    finally {
                        clearTimeout(timeout);
                        cts.dispose();
                    }
                });
            }
            return unixShellEnvPromise;
        }
    }
    exports.getResolvedShellEnv = getResolvedShellEnv;
    async function doResolveUnixShellEnv(logService, token) {
        const runAsNode = process.env['ELECTRON_RUN_AS_NODE'];
        logService.trace('getUnixShellEnvironment#runAsNode', runAsNode);
        const noAttach = process.env['ELECTRON_NO_ATTACH_CONSOLE'];
        logService.trace('getUnixShellEnvironment#noAttach', noAttach);
        const mark = (0, uuid_1.generateUuid)().replace(/-/g, '').substr(0, 12);
        const regex = new RegExp(mark + '({.*})' + mark);
        const env = {
            ...process.env,
            ELECTRON_RUN_AS_NODE: '1',
            ELECTRON_NO_ATTACH_CONSOLE: '1',
            VSCODE_RESOLVING_ENVIRONMENT: '1'
        };
        logService.trace('getUnixShellEnvironment#env', env);
        const systemShellUnix = await (0, shell_1.getSystemShell)(platform_1.OS, env);
        logService.trace('getUnixShellEnvironment#shell', systemShellUnix);
        return new Promise((resolve, reject) => {
            if (token.isCancellationRequested) {
                return reject(new errors_1.CancellationError());
            }
            // handle popular non-POSIX shells
            const name = (0, path_1.basename)(systemShellUnix);
            let command, shellArgs;
            const extraArgs = (process.versions['electron'] && process.versions['microsoft-build']) ? '--ms-enable-electron-run-as-node' : '';
            if (/^pwsh(-preview)?$/.test(name)) {
                // Older versions of PowerShell removes double quotes sometimes so we use "double single quotes" which is how
                // you escape single quotes inside of a single quoted string.
                command = `& '${process.execPath}' ${extraArgs} -p '''${mark}'' + JSON.stringify(process.env) + ''${mark}'''`;
                shellArgs = ['-Login', '-Command'];
            }
            else if (name === 'nu') { // nushell requires ^ before quoted path to treat it as a command
                command = `^'${process.execPath}' ${extraArgs} -p '"${mark}" + JSON.stringify(process.env) + "${mark}"'`;
                shellArgs = ['-i', '-l', '-c'];
            }
            else {
                command = `'${process.execPath}' ${extraArgs} -p '"${mark}" + JSON.stringify(process.env) + "${mark}"'`;
                if (name === 'tcsh' || name === 'csh') {
                    shellArgs = ['-ic'];
                }
                else {
                    shellArgs = ['-i', '-l', '-c'];
                }
            }
            logService.trace('getUnixShellEnvironment#spawn', JSON.stringify(shellArgs), command);
            const child = (0, child_process_1.spawn)(systemShellUnix, [...shellArgs, command], {
                detached: true,
                stdio: ['ignore', 'pipe', 'pipe'],
                env
            });
            token.onCancellationRequested(() => {
                child.kill();
                return reject(new errors_1.CancellationError());
            });
            child.on('error', err => {
                logService.error('getUnixShellEnvironment#errorChildProcess', (0, errorMessage_1.toErrorMessage)(err));
                reject(err);
            });
            const buffers = [];
            child.stdout.on('data', b => buffers.push(b));
            const stderr = [];
            child.stderr.on('data', b => stderr.push(b));
            child.on('close', (code, signal) => {
                const raw = Buffer.concat(buffers).toString('utf8');
                logService.trace('getUnixShellEnvironment#raw', raw);
                const stderrStr = Buffer.concat(stderr).toString('utf8');
                if (stderrStr.trim()) {
                    logService.trace('getUnixShellEnvironment#stderr', stderrStr);
                }
                if (code || signal) {
                    return reject(new Error((0, nls_1.localize)('resolveShellEnvExitError', "Unexpected exit code from spawned shell (code {0}, signal {1})", code, signal)));
                }
                const match = regex.exec(raw);
                const rawStripped = match ? match[1] : '{}';
                try {
                    const env = JSON.parse(rawStripped);
                    if (runAsNode) {
                        env['ELECTRON_RUN_AS_NODE'] = runAsNode;
                    }
                    else {
                        delete env['ELECTRON_RUN_AS_NODE'];
                    }
                    if (noAttach) {
                        env['ELECTRON_NO_ATTACH_CONSOLE'] = noAttach;
                    }
                    else {
                        delete env['ELECTRON_NO_ATTACH_CONSOLE'];
                    }
                    delete env['VSCODE_RESOLVING_ENVIRONMENT'];
                    // https://github.com/microsoft/vscode/issues/22593#issuecomment-336050758
                    delete env['XDG_RUNTIME_DIR'];
                    logService.trace('getUnixShellEnvironment#result', env);
                    resolve(env);
                }
                catch (err) {
                    logService.error('getUnixShellEnvironment#errorCaught', (0, errorMessage_1.toErrorMessage)(err));
                    reject(err);
                }
            });
        });
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2hlbGxFbnYuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9wbGF0Zm9ybS9zaGVsbC9ub2RlL3NoZWxsRW52LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQWtCaEcsSUFBSSxtQkFBbUIsR0FBNEMsU0FBUyxDQUFDO0lBRTdFOzs7Ozs7O09BT0c7SUFDSSxLQUFLLFVBQVUsbUJBQW1CLENBQUMsb0JBQTJDLEVBQUUsVUFBdUIsRUFBRSxJQUFzQixFQUFFLEdBQXdCO1FBRS9KLG1DQUFtQztRQUNuQyxJQUFJLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxFQUFFO1lBQ25DLFVBQVUsQ0FBQyxLQUFLLENBQUMsdURBQXVELENBQUMsQ0FBQztZQUUxRSxPQUFPLEVBQUUsQ0FBQztTQUNWO1FBRUQsa0JBQWtCO2FBQ2IsSUFBSSxvQkFBUyxFQUFFO1lBQ25CLFVBQVUsQ0FBQyxLQUFLLENBQUMsc0NBQXNDLENBQUMsQ0FBQztZQUV6RCxPQUFPLEVBQUUsQ0FBQztTQUNWO1FBRUQsbUNBQW1DO2FBQzlCLElBQUksSUFBQSw4QkFBaUIsRUFBQyxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxFQUFFO1lBQzNELFVBQVUsQ0FBQyxLQUFLLENBQUMsZ0RBQWdELENBQUMsQ0FBQztZQUVuRSxPQUFPLEVBQUUsQ0FBQztTQUNWO1FBRUQsbUNBQW1DO2FBQzlCO1lBQ0osSUFBSSxJQUFBLDhCQUFpQixFQUFDLEdBQUcsQ0FBQyxFQUFFO2dCQUMzQixVQUFVLENBQUMsS0FBSyxDQUFDLCtDQUErQyxDQUFDLENBQUM7YUFDbEU7aUJBQU07Z0JBQ04sVUFBVSxDQUFDLEtBQUssQ0FBQywwQ0FBMEMsQ0FBQyxDQUFDO2FBQzdEO1lBRUQsZ0RBQWdEO1lBQ2hELCtDQUErQztZQUMvQyxnQ0FBZ0M7WUFDaEMsSUFBSSxDQUFDLG1CQUFtQixFQUFFO2dC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