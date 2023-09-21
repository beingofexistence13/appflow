/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "os", "vs/base/common/network", "vs/base/common/objects", "vs/base/common/path", "vs/base/common/platform", "vs/base/common/process", "vs/base/common/strings", "vs/base/common/types", "vs/base/node/pfs", "vs/platform/terminal/common/environmentVariable", "vs/platform/terminal/common/environmentVariableShared", "vs/platform/terminal/common/environmentVariableCollection"], function (require, exports, os, network_1, objects_1, path, platform_1, process, strings_1, types_1, pfs, environmentVariable_1, environmentVariableShared_1, environmentVariableCollection_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getShellIntegrationInjection = exports.findExecutable = exports.getWindowsBuildNumber = void 0;
    function getWindowsBuildNumber() {
        const osVersion = (/(\d+)\.(\d+)\.(\d+)/g).exec(os.release());
        let buildNumber = 0;
        if (osVersion && osVersion.length === 4) {
            buildNumber = parseInt(osVersion[3]);
        }
        return buildNumber;
    }
    exports.getWindowsBuildNumber = getWindowsBuildNumber;
    async function findExecutable(command, cwd, paths, env = process.env, exists = pfs.Promises.exists) {
        // If we have an absolute path then we take it.
        if (path.isAbsolute(command)) {
            return await exists(command) ? command : undefined;
        }
        if (cwd === undefined) {
            cwd = process.cwd();
        }
        const dir = path.dirname(command);
        if (dir !== '.') {
            // We have a directory and the directory is relative (see above). Make the path absolute
            // to the current working directory.
            const fullPath = path.join(cwd, command);
            return await exists(fullPath) ? fullPath : undefined;
        }
        const envPath = (0, objects_1.getCaseInsensitive)(env, 'PATH');
        if (paths === undefined && (0, types_1.isString)(envPath)) {
            paths = envPath.split(path.delimiter);
        }
        // No PATH environment. Make path absolute to the cwd.
        if (paths === undefined || paths.length === 0) {
            const fullPath = path.join(cwd, command);
            return await exists(fullPath) ? fullPath : undefined;
        }
        // We have a simple file name. We get the path variable from the env
        // and try to find the executable on the path.
        for (const pathEntry of paths) {
            // The path entry is absolute.
            let fullPath;
            if (path.isAbsolute(pathEntry)) {
                fullPath = path.join(pathEntry, command);
            }
            else {
                fullPath = path.join(cwd, pathEntry, command);
            }
            if (await exists(fullPath)) {
                return fullPath;
            }
            if (platform_1.isWindows) {
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
        const fullPath = path.join(cwd, command);
        return await exists(fullPath) ? fullPath : undefined;
    }
    exports.findExecutable = findExecutable;
    /**
     * For a given shell launch config, returns arguments to replace and an optional environment to
     * mixin to the SLC's environment to enable shell integration. This must be run within the context
     * that creates the process to ensure accuracy. Returns undefined if shell integration cannot be
     * enabled.
     */
    function getShellIntegrationInjection(shellLaunchConfig, options, env, logService, productService) {
        // Shell integration arg injection is disabled when:
        // - The global setting is disabled
        // - There is no executable (not sure what script to run)
        // - The terminal is used by a feature like tasks or debugging
        const useWinpty = platform_1.isWindows && (!options.windowsEnableConpty || getWindowsBuildNumber() < 18309);
        if (!options.shellIntegration.enabled || !shellLaunchConfig.executable || shellLaunchConfig.isFeatureTerminal || shellLaunchConfig.hideFromUser || shellLaunchConfig.ignoreShellIntegration || useWinpty) {
            return undefined;
        }
        const originalArgs = shellLaunchConfig.args;
        const shell = process.platform === 'win32' ? path.basename(shellLaunchConfig.executable).toLowerCase() : path.basename(shellLaunchConfig.executable);
        const appRoot = path.dirname(network_1.FileAccess.asFileUri('').fsPath);
        let newArgs;
        const envMixin = {
            'VSCODE_INJECTION': '1'
        };
        if (options.shellIntegration.nonce) {
            envMixin['VSCODE_NONCE'] = options.shellIntegration.nonce;
        }
        // Windows
        if (platform_1.isWindows) {
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
                newArgs[newArgs.length - 1] = (0, strings_1.format)(newArgs[newArgs.length - 1], appRoot, '');
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
                newArgs[newArgs.length - 1] = (0, strings_1.format)(newArgs[newArgs.length - 1], appRoot);
                return { newArgs, envMixin };
            }
            case 'fish': {
                // The injection mechanism used for fish is to add a custom dir to $XDG_DATA_DIRS which
                // is similar to $ZDOTDIR in zsh but contains a list of directories to run from.
                const oldDataDirs = env?.XDG_DATA_DIRS ?? '/usr/local/share:/usr/share';
                const newDataDir = path.join(appRoot, 'out/vs/workbench/contrib/terminal/browser/media/fish_xdg_data');
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
                newArgs[newArgs.length - 1] = (0, strings_1.format)(newArgs[newArgs.length - 1], appRoot, '');
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
                newArgs[newArgs.length - 1] = (0, strings_1.format)(newArgs[newArgs.length - 1], appRoot);
                // Move .zshrc into $ZDOTDIR as the way to activate the script
                let username;
                try {
                    username = os.userInfo().username;
                }
                catch {
                    username = 'unknown';
                }
                const zdotdir = path.join(os.tmpdir(), `${username}-${productService.applicationName}-zsh`);
                envMixin['ZDOTDIR'] = zdotdir;
                const userZdotdir = env?.ZDOTDIR ?? os.homedir() ?? `~`;
                envMixin['USER_ZDOTDIR'] = userZdotdir;
                const filesToCopy = [];
                filesToCopy.push({
                    source: path.join(appRoot, 'out/vs/workbench/contrib/terminal/browser/media/shellIntegration-rc.zsh'),
                    dest: path.join(zdotdir, '.zshrc')
                });
                filesToCopy.push({
                    source: path.join(appRoot, 'out/vs/workbench/contrib/terminal/browser/media/shellIntegration-profile.zsh'),
                    dest: path.join(zdotdir, '.zprofile')
                });
                filesToCopy.push({
                    source: path.join(appRoot, 'out/vs/workbench/contrib/terminal/browser/media/shellIntegration-env.zsh'),
                    dest: path.join(zdotdir, '.zshenv')
                });
                filesToCopy.push({
                    source: path.join(appRoot, 'out/vs/workbench/contrib/terminal/browser/media/shellIntegration-login.zsh'),
                    dest: path.join(zdotdir, '.zlogin')
                });
                return { newArgs, envMixin, filesToCopy };
            }
        }
        logService.warn(`Shell integration cannot be enabled for executable "${shellLaunchConfig.executable}" and args`, shellLaunchConfig.args);
        return undefined;
    }
    exports.getShellIntegrationInjection = getShellIntegrationInjection;
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
        if (platform_1.isMacintosh && options.environmentVariableCollections) {
            // Deserialize and merge
            const deserialized = (0, environmentVariableShared_1.deserializeEnvironmentVariableCollections)(options.environmentVariableCollections);
            const merged = new environmentVariableCollection_1.MergedEnvironmentVariableCollection(deserialized);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVybWluYWxFbnZpcm9ubWVudC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3BsYXRmb3JtL3Rlcm1pbmFsL25vZGUvdGVybWluYWxFbnZpcm9ubWVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFrQmhHLFNBQWdCLHFCQUFxQjtRQUNwQyxNQUFNLFNBQVMsR0FBRyxDQUFDLHNCQUFzQixDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDO1FBQzlELElBQUksV0FBVyxHQUFXLENBQUMsQ0FBQztRQUM1QixJQUFJLFNBQVMsSUFBSSxTQUFTLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtZQUN4QyxXQUFXLEdBQUcsUUFBUSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1NBQ3JDO1FBQ0QsT0FBTyxXQUFXLENBQUM7SUFDcEIsQ0FBQztJQVBELHNEQU9DO0lBRU0sS0FBSyxVQUFVLGNBQWMsQ0FBQyxPQUFlLEVBQUUsR0FBWSxFQUFFLEtBQWdCLEVBQUUsTUFBMkIsT0FBTyxDQUFDLEdBQTBCLEVBQUUsU0FBNkMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxNQUFNO1FBQ3BOLCtDQUErQztRQUMvQyxJQUFJLElBQUksQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLEVBQUU7WUFDN0IsT0FBTyxNQUFNLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUM7U0FDbkQ7UUFDRCxJQUFJLEdBQUcsS0FBSyxTQUFTLEVBQUU7WUFDdEIsR0FBRyxHQUFHLE9BQU8sQ0FBQyxHQUFHLEVBQUUsQ0FBQztTQUNwQjtRQUNELE1BQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDbEMsSUFBSSxHQUFHLEtBQUssR0FB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