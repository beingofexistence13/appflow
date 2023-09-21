/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "os", "vs/base/common/network", "vs/base/common/objects", "vs/base/common/path", "vs/base/common/platform", "vs/base/common/process", "vs/base/common/strings", "vs/base/common/types", "vs/base/node/pfs", "vs/platform/terminal/common/environmentVariable", "vs/platform/terminal/common/environmentVariableShared", "vs/platform/terminal/common/environmentVariableCollection"], function (require, exports, os, network_1, objects_1, path, platform_1, process, strings_1, types_1, pfs, environmentVariable_1, environmentVariableShared_1, environmentVariableCollection_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$jr = exports.$ir = exports.$hr = void 0;
    function $hr() {
        const osVersion = (/(\d+)\.(\d+)\.(\d+)/g).exec(os.release());
        let buildNumber = 0;
        if (osVersion && osVersion.length === 4) {
            buildNumber = parseInt(osVersion[3]);
        }
        return buildNumber;
    }
    exports.$hr = $hr;
    async function $ir(command, cwd, paths, env = process.env, exists = pfs.Promises.exists) {
        // If we have an absolute path then we take it.
        if (path.$8d(command)) {
            return await exists(command) ? command : undefined;
        }
        if (cwd === undefined) {
            cwd = process.cwd();
        }
        const dir = path.$_d(command);
        if (dir !== '.') {
            // We have a directory and the directory is relative (see above). Make the path absolute
            // to the current working directory.
            const fullPath = path.$9d(cwd, command);
            return await exists(fullPath) ? fullPath : undefined;
        }
        const envPath = (0, objects_1.$3m)(env, 'PATH');
        if (paths === undefined && (0, types_1.$jf)(envPath)) {
            paths = envPath.split(path.$ge);
        }
        // No PATH environment. Make path absolute to the cwd.
        if (paths === undefined || paths.length === 0) {
            const fullPath = path.$9d(cwd, command);
            return await exists(fullPath) ? fullPath : undefined;
        }
        // We have a simple file name. We get the path variable from the env
        // and try to find the executable on the path.
        for (const pathEntry of paths) {
            // The path entry is absolute.
            let fullPath;
            if (path.$8d(pathEntry)) {
                fullPath = path.$9d(pathEntry, command);
            }
            else {
                fullPath = path.$9d(cwd, pathEntry, command);
            }
            if (await exists(fullPath)) {
                return fullPath;
            }
            if (platform_1.$i) {
                let withExtension = fullPath + '.com';
                if (await exists(withExtension)) {
                    return withExtension;
                }
                withExtension = fullPath + '.exe';
                if (await exists(withExtension)) {
                    return withExtension;
                }
            }
        }
        const fullPath = path.$9d(cwd, command);
        return await exists(fullPath) ? fullPath : undefined;
    }
    exports.$ir = $ir;
    /**
     * For a given shell launch config, returns arguments to replace and an optional environment to
     * mixin to the SLC's environment to enable shell integration. This must be run within the context
     * that creates the process to ensure accuracy. Returns undefined if shell integration cannot be
     * enabled.
     */
    function $jr(shellLaunchConfig, options, env, logService, productService) {
        // Shell integration arg injection is disabled when:
        // - The global setting is disabled
        // - There is no executable (not sure what script to run)
        // - The terminal is used by a feature like tasks or debugging
        const useWinpty = platform_1.$i && (!options.windowsEnableConpty || $hr() < 18309);
        if (!options.shellIntegration.enabled || !shellLaunchConfig.executable || shellLaunchConfig.isFeatureTerminal || shellLaunchConfig.hideFromUser || shellLaunchConfig.ignoreShellIntegration || useWinpty) {
            return undefined;
        }
        const originalArgs = shellLaunchConfig.args;
        const shell = process.$3d === 'win32' ? path.$ae(shellLaunchConfig.executable).toLowerCase() : path.$ae(shellLaunchConfig.executable);
        const appRoot = path.$_d(network_1.$2f.asFileUri('').fsPath);
        let newArgs;
        const envMixin = {
            'VSCODE_INJECTION': '1'
        };
        if (options.shellIntegration.nonce) {
            envMixin['VSCODE_NONCE'] = options.shellIntegration.nonce;
        }
        // Windows
        if (platform_1.$i) {
            if (shell === 'pwsh.exe' || shell === 'powershell.exe') {
                if (!originalArgs || arePwshImpliedArgs(originalArgs)) {
                    newArgs = shellIntegrationArgs.get(ShellIntegrationExecutable.WindowsPwsh);
                }
                else if (arePwshLoginArgs(originalArgs)) {
                    newArgs = shellIntegrationArgs.get(ShellIntegrationExecutable.WindowsPwshLogin);
                }
                if (!newArgs) {
                    return undefined;
                }
                newArgs = [...newArgs]; // Shallow clone the array to avoid setting the default array
                newArgs[newArgs.length - 1] = (0, strings_1.$ne)(newArgs[newArgs.length - 1], appRoot, '');
                // TODO: Uncomment when suggestEnabled is ready for use
                // if (options.shellIntegration.suggestEnabled) {
                // 	envMixin['VSCODE_SUGGEST'] = '1';
                // }
                return { newArgs, envMixin };
            }
            logService.warn(`Shell integration cannot be enabled for executable "${shellLaunchConfig.executable}" and args`, shellLaunchConfig.args);
            return undefined;
        }
        // Linux & macOS
        switch (shell) {
            case 'bash': {
                if (!originalArgs || originalArgs.length === 0) {
                    newArgs = shellIntegrationArgs.get(ShellIntegrationExecutable.Bash);
                }
                else if (areZshBashLoginArgs(originalArgs)) {
                    envMixin['VSCODE_SHELL_LOGIN'] = '1';
                    addEnvMixinPathPrefix(options, envMixin);
                    newArgs = shellIntegrationArgs.get(ShellIntegrationExecutable.Bash);
                }
                if (!newArgs) {
                    return undefined;
                }
                newArgs = [...newArgs]; // Shallow clone the array to avoid setting the default array
                newArgs[newArgs.length - 1] = (0, strings_1.$ne)(newArgs[newArgs.length - 1], appRoot);
                return { newArgs, envMixin };
            }
            case 'fish': {
                // The injection mechanism used for fish is to add a custom dir to $XDG_DATA_DIRS which
                // is similar to $ZDOTDIR in zsh but contains a list of directories to run from.
                const oldDataDirs = env?.XDG_DATA_DIRS ?? '/usr/local/share:/usr/share';
                const newDataDir = path.$9d(appRoot, 'out/vs/workbench/contrib/terminal/browser/media/fish_xdg_data');
                envMixin['XDG_DATA_DIRS'] = `${oldDataDirs}:${newDataDir}`;
                addEnvMixinPathPrefix(options, envMixin);
                return { newArgs: undefined, envMixin };
            }
            case 'pwsh': {
                if (!originalArgs || arePwshImpliedArgs(originalArgs)) {
                    newArgs = shellIntegrationArgs.get(ShellIntegrationExecutable.Pwsh);
                }
                else if (arePwshLoginArgs(originalArgs)) {
                    newArgs = shellIntegrationArgs.get(ShellIntegrationExecutable.PwshLogin);
                }
                if (!newArgs) {
                    return undefined;
                }
                // TODO: Uncomment when suggestEnabled is ready for use
                // if (options.shellIntegration.suggestEnabled) {
                // 	envMixin['VSCODE_SUGGEST'] = '1';
                // }
                newArgs = [...newArgs]; // Shallow clone the array to avoid setting the default array
                newArgs[newArgs.length - 1] = (0, strings_1.$ne)(newArgs[newArgs.length - 1], appRoot, '');
                return { newArgs, envMixin };
            }
            case 'zsh': {
                if (!originalArgs || originalArgs.length === 0) {
                    newArgs = shellIntegrationArgs.get(ShellIntegrationExecutable.Zsh);
                }
                else if (areZshBashLoginArgs(originalArgs)) {
                    newArgs = shellIntegrationArgs.get(ShellIntegrationExecutable.ZshLogin);
                    addEnvMixinPathPrefix(options, envMixin);
                }
                else if (originalArgs === shellIntegrationArgs.get(ShellIntegrationExecutable.Zsh) || originalArgs === shellIntegrationArgs.get(ShellIntegrationExecutable.ZshLogin)) {
                    newArgs = originalArgs;
                }
                if (!newArgs) {
                    return undefined;
                }
                newArgs = [...newArgs]; // Shallow clone the array to avoid setting the default array
                newArgs[newArgs.length - 1] = (0, strings_1.$ne)(newArgs[newArgs.length - 1], appRoot);
                // Move .zshrc into $ZDOTDIR as the way to activate the script
                let username;
                try {
                    username = os.userInfo().username;
                }
                catch {
                    username = 'unknown';
                }
                const zdotdir = path.$9d(os.tmpdir(), `${username}-${productService.applicationName}-zsh`);
                envMixin['ZDOTDIR'] = zdotdir;
                const userZdotdir = env?.ZDOTDIR ?? os.homedir() ?? `~`;
                envMixin['USER_ZDOTDIR'] = userZdotdir;
                const filesToCopy = [];
                filesToCopy.push({
                    source: path.$9d(appRoot, 'out/vs/workbench/contrib/terminal/browser/media/shellIntegration-rc.zsh'),
                    dest: path.$9d(zdotdir, '.zshrc')
                });
                filesToCopy.push({
                    source: path.$9d(appRoot, 'out/vs/workbench/contrib/terminal/browser/media/shellIntegration-profile.zsh'),
                    dest: path.$9d(zdotdir, '.zprofile')
                });
                filesToCopy.push({
                    source: path.$9d(appRoot, 'out/vs/workbench/contrib/terminal/browser/media/shellIntegration-env.zsh'),
                    dest: path.$9d(zdotdir, '.zshenv')
                });
                filesToCopy.push({
                    source: path.$9d(appRoot, 'out/vs/workbench/contrib/terminal/browser/media/shellIntegration-login.zsh'),
                    dest: path.$9d(zdotdir, '.zlogin')
                });
                return { newArgs, envMixin, filesToCopy };
            }
        }
        logService.warn(`Shell integration cannot be enabled for executable "${shellLaunchConfig.executable}" and args`, shellLaunchConfig.args);
        return undefined;
    }
    exports.$jr = $jr;
    /**
     * On macOS the profile calls path_helper which adds a bunch of standard bin directories to the
     * beginning of the PATH. This causes significant problems for the environment variable
     * collection API as the custom paths added to the end will now be somewhere in the middle of
     * the PATH. To combat this, VSCODE_PATH_PREFIX is used to re-apply any prefix after the profile
     * has run. This will cause duplication in the PATH but should fix the issue.
     *
     * See #99878 for more information.
     */
    function addEnvMixinPathPrefix(options, envMixin) {
        if (platform_1.$j && options.environmentVariableCollections) {
            // Deserialize and merge
            const deserialized = (0, environmentVariableShared_1.$fr)(options.environmentVariableCollections);
            const merged = new environmentVariableCollection_1.$gr(deserialized);
            // Get all prepend PATH entries
            const pathEntry = merged.getVariableMap({ workspaceFolder: options.workspaceFolder }).get('PATH');
            const prependToPath = [];
            if (pathEntry) {
                for (const mutator of pathEntry) {
                    if (mutator.type === environmentVariable_1.EnvironmentVariableMutatorType.Prepend) {
                        prependToPath.push(mutator.value);
                    }
                }
            }
            // Add to the environment mixin to be applied in the shell integration script
            if (prependToPath.length > 0) {
                envMixin['VSCODE_PATH_PREFIX'] = prependToPath.join('');
            }
        }
    }
    var ShellIntegrationExecutable;
    (function (ShellIntegrationExecutable) {
        ShellIntegrationExecutable["WindowsPwsh"] = "windows-pwsh";
        ShellIntegrationExecutable["WindowsPwshLogin"] = "windows-pwsh-login";
        ShellIntegrationExecutable["Pwsh"] = "pwsh";
        ShellIntegrationExecutable["PwshLogin"] = "pwsh-login";
        ShellIntegrationExecutable["Zsh"] = "zsh";
        ShellIntegrationExecutable["ZshLogin"] = "zsh-login";
        ShellIntegrationExecutable["Bash"] = "bash";
    })(ShellIntegrationExecutable || (ShellIntegrationExecutable = {}));
    const shellIntegrationArgs = new Map();
    // The try catch swallows execution policy errors in the case of the archive distributable
    shellIntegrationArgs.set(ShellIntegrationExecutable.WindowsPwsh, ['-noexit', '-command', 'try { . \"{0}\\out\\vs\\workbench\\contrib\\terminal\\browser\\media\\shellIntegration.ps1\" } catch {}{1}']);
    shellIntegrationArgs.set(ShellIntegrationExecutable.WindowsPwshLogin, ['-l', '-noexit', '-command', 'try { . \"{0}\\out\\vs\\workbench\\contrib\\terminal\\browser\\media\\shellIntegration.ps1\" } catch {}{1}']);
    shellIntegrationArgs.set(ShellIntegrationExecutable.Pwsh, ['-noexit', '-command', '. "{0}/out/vs/workbench/contrib/terminal/browser/media/shellIntegration.ps1"{1}']);
    shellIntegrationArgs.set(ShellIntegrationExecutable.PwshLogin, ['-l', '-noexit', '-command', '. "{0}/out/vs/workbench/contrib/terminal/browser/media/shellIntegration.ps1"']);
    shellIntegrationArgs.set(ShellIntegrationExecutable.Zsh, ['-i']);
    shellIntegrationArgs.set(ShellIntegrationExecutable.ZshLogin, ['-il']);
    shellIntegrationArgs.set(ShellIntegrationExecutable.Bash, ['--init-file', '{0}/out/vs/workbench/contrib/terminal/browser/media/shellIntegration-bash.sh']);
    const loginArgs = ['-login', '-l'];
    const pwshImpliedArgs = ['-nol', '-nologo'];
    function arePwshLoginArgs(originalArgs) {
        if (typeof originalArgs === 'string') {
            return loginArgs.includes(originalArgs.toLowerCase());
        }
        else {
            return originalArgs.length === 1 && loginArgs.includes(originalArgs[0].toLowerCase()) ||
                (originalArgs.length === 2 &&
                    (((loginArgs.includes(originalArgs[0].toLowerCase())) || loginArgs.includes(originalArgs[1].toLowerCase())))
                    && ((pwshImpliedArgs.includes(originalArgs[0].toLowerCase())) || pwshImpliedArgs.includes(originalArgs[1].toLowerCase())));
        }
    }
    function arePwshImpliedArgs(originalArgs) {
        if (typeof originalArgs === 'string') {
            return pwshImpliedArgs.includes(originalArgs.toLowerCase());
        }
        else {
            return originalArgs.length === 0 || originalArgs?.length === 1 && pwshImpliedArgs.includes(originalArgs[0].toLowerCase());
        }
    }
    function areZshBashLoginArgs(originalArgs) {
        return originalArgs === 'string' && loginArgs.includes(originalArgs.toLowerCase())
            || typeof originalArgs !== 'string' && originalArgs.length === 1 && loginArgs.includes(originalArgs[0].toLowerCase());
    }
});
//# sourceMappingURL=terminalEnvironment.js.map