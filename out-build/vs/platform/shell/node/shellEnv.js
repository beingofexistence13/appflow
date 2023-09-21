/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "child_process", "vs/base/common/path", "vs/nls!vs/platform/shell/node/shellEnv", "vs/base/common/cancellation", "vs/base/common/errorMessage", "vs/base/common/errors", "vs/base/common/platform", "vs/base/common/uuid", "vs/base/node/shell", "vs/platform/environment/node/argvHelper", "vs/base/common/async", "vs/base/common/numbers"], function (require, exports, child_process_1, path_1, nls_1, cancellation_1, errorMessage_1, errors_1, platform_1, uuid_1, shell_1, argvHelper_1, async_1, numbers_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Ml = void 0;
    let unixShellEnvPromise = undefined;
    /**
     * Resolves the shell environment by spawning a shell. This call will cache
     * the shell spawning so that subsequent invocations use that cached result.
     *
     * Will throw an error if:
     * - we hit a timeout of `MAX_SHELL_RESOLVE_TIME`
     * - any other error from spawning a shell to figure out the environment
     */
    async function $Ml(configurationService, logService, args, env) {
        // Skip if --force-disable-user-env
        if (args['force-disable-user-env']) {
            logService.trace('resolveShellEnv(): skipped (--force-disable-user-env)');
            return {};
        }
        // Skip on windows
        else if (platform_1.$i) {
            logService.trace('resolveShellEnv(): skipped (Windows)');
            return {};
        }
        // Skip if running from CLI already
        else if ((0, argvHelper_1.$Gl)(env) && !args['force-user-env']) {
            logService.trace('resolveShellEnv(): skipped (VSCODE_CLI is set)');
            return {};
        }
        // Otherwise resolve (macOS, Linux)
        else {
            if ((0, argvHelper_1.$Gl)(env)) {
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
                    const cts = new cancellation_1.$pd();
                    let timeoutValue = 10000; // default to 10 seconds
                    const configuredTimeoutValue = configurationService.getValue('application.shellEnvironmentResolutionTimeout');
                    if (typeof configuredTimeoutValue === 'number') {
                        timeoutValue = (0, numbers_1.$Hl)(configuredTimeoutValue, 1, 120) * 1000 /* convert from seconds */;
                    }
                    // Give up resolving shell env after some time
                    const timeout = setTimeout(() => {
                        cts.dispose(true);
                        reject(new Error((0, nls_1.localize)(0, null)));
                    }, timeoutValue);
                    // Resolve shell env and handle errors
                    try {
                        resolve(await doResolveUnixShellEnv(logService, cts.token));
                    }
                    catch (error) {
                        if (!(0, errors_1.$2)(error) && !cts.token.isCancellationRequested) {
                            reject(new Error((0, nls_1.localize)(1, null, (0, errorMessage_1.$mi)(error))));
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
    exports.$Ml = $Ml;
    async function doResolveUnixShellEnv(logService, token) {
        const runAsNode = process.env['ELECTRON_RUN_AS_NODE'];
        logService.trace('getUnixShellEnvironment#runAsNode', runAsNode);
        const noAttach = process.env['ELECTRON_NO_ATTACH_CONSOLE'];
        logService.trace('getUnixShellEnvironment#noAttach', noAttach);
        const mark = (0, uuid_1.$4f)().replace(/-/g, '').substr(0, 12);
        const regex = new RegExp(mark + '({.*})' + mark);
        const env = {
            ...process.env,
            ELECTRON_RUN_AS_NODE: '1',
            ELECTRON_NO_ATTACH_CONSOLE: '1',
            VSCODE_RESOLVING_ENVIRONMENT: '1'
        };
        logService.trace('getUnixShellEnvironment#env', env);
        const systemShellUnix = await (0, shell_1.$wl)(platform_1.OS, env);
        logService.trace('getUnixShellEnvironment#shell', systemShellUnix);
        return new Promise((resolve, reject) => {
            if (token.isCancellationRequested) {
                return reject(new errors_1.$3());
            }
            // handle popular non-POSIX shells
            const name = (0, path_1.$ae)(systemShellUnix);
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
                return reject(new errors_1.$3());
            });
            child.on('error', err => {
                logService.error('getUnixShellEnvironment#errorChildProcess', (0, errorMessage_1.$mi)(err));
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
                    return reject(new Error((0, nls_1.localize)(2, null, code, signal)));
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
                    logService.error('getUnixShellEnvironment#errorCaught', (0, errorMessage_1.$mi)(err));
                    reject(err);
                }
            });
        });
    }
});
//# sourceMappingURL=shellEnv.js.map