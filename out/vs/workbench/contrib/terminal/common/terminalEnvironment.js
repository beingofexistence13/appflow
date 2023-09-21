/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/path", "vs/base/common/uri", "vs/base/common/processes", "vs/base/common/platform", "vs/platform/terminal/common/terminalEnvironment", "vs/base/common/types"], function (require, exports, path, uri_1, processes_1, platform_1, terminalEnvironment_1, types_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getWorkspaceForTerminal = exports.preparePathForShell = exports.createTerminalEnvironment = exports.createVariableResolver = exports.getCwd = exports.getLangEnvVariable = exports.shouldSetLangEnvVariable = exports.addTerminalEnvironmentKeys = exports.mergeEnvironments = void 0;
    function mergeEnvironments(parent, other) {
        if (!other) {
            return;
        }
        // On Windows apply the new values ignoring case, while still retaining
        // the case of the original key.
        if (platform_1.isWindows) {
            for (const configKey in other) {
                let actualKey = configKey;
                for (const envKey in parent) {
                    if (configKey.toLowerCase() === envKey.toLowerCase()) {
                        actualKey = envKey;
                        break;
                    }
                }
                const value = other[configKey];
                if (value !== undefined) {
                    _mergeEnvironmentValue(parent, actualKey, value);
                }
            }
        }
        else {
            Object.keys(other).forEach((key) => {
                const value = other[key];
                if (value !== undefined) {
                    _mergeEnvironmentValue(parent, key, value);
                }
            });
        }
    }
    exports.mergeEnvironments = mergeEnvironments;
    function _mergeEnvironmentValue(env, key, value) {
        if (typeof value === 'string') {
            env[key] = value;
        }
        else {
            delete env[key];
        }
    }
    function addTerminalEnvironmentKeys(env, version, locale, detectLocale) {
        env['TERM_PROGRAM'] = 'vscode';
        if (version) {
            env['TERM_PROGRAM_VERSION'] = version;
        }
        if (shouldSetLangEnvVariable(env, detectLocale)) {
            env['LANG'] = getLangEnvVariable(locale);
        }
        env['COLORTERM'] = 'truecolor';
    }
    exports.addTerminalEnvironmentKeys = addTerminalEnvironmentKeys;
    function mergeNonNullKeys(env, other) {
        if (!other) {
            return;
        }
        for (const key of Object.keys(other)) {
            const value = other[key];
            if (value !== undefined && value !== null) {
                env[key] = value;
            }
        }
    }
    async function resolveConfigurationVariables(variableResolver, env) {
        await Promise.all(Object.entries(env).map(async ([key, value]) => {
            if (typeof value === 'string') {
                try {
                    env[key] = await variableResolver(value);
                }
                catch (e) {
                    env[key] = value;
                }
            }
        }));
        return env;
    }
    function shouldSetLangEnvVariable(env, detectLocale) {
        if (detectLocale === 'on') {
            return true;
        }
        if (detectLocale === 'auto') {
            const lang = env['LANG'];
            return !lang || (lang.search(/\.UTF\-8$/) === -1 && lang.search(/\.utf8$/) === -1 && lang.search(/\.euc.+/) === -1);
        }
        return false; // 'off'
    }
    exports.shouldSetLangEnvVariable = shouldSetLangEnvVariable;
    function getLangEnvVariable(locale) {
        const parts = locale ? locale.split('-') : [];
        const n = parts.length;
        if (n === 0) {
            // Fallback to en_US if the locale is unknown
            return 'en_US.UTF-8';
        }
        if (n === 1) {
            // The local may only contain the language, not the variant, if this is the case guess the
            // variant such that it can be used as a valid $LANG variable. The language variant chosen
            // is the original and/or most prominent with help from
            // https://stackoverflow.com/a/2502675/1156119
            // The list of locales was generated by running `locale -a` on macOS
            const languageVariants = {
                af: 'ZA',
                am: 'ET',
                be: 'BY',
                bg: 'BG',
                ca: 'ES',
                cs: 'CZ',
                da: 'DK',
                // de: 'AT',
                // de: 'CH',
                de: 'DE',
                el: 'GR',
                // en: 'AU',
                // en: 'CA',
                // en: 'GB',
                // en: 'IE',
                // en: 'NZ',
                en: 'US',
                es: 'ES',
                et: 'EE',
                eu: 'ES',
                fi: 'FI',
                // fr: 'BE',
                // fr: 'CA',
                // fr: 'CH',
                fr: 'FR',
                he: 'IL',
                hr: 'HR',
                hu: 'HU',
                hy: 'AM',
                is: 'IS',
                // it: 'CH',
                it: 'IT',
                ja: 'JP',
                kk: 'KZ',
                ko: 'KR',
                lt: 'LT',
                // nl: 'BE',
                nl: 'NL',
                no: 'NO',
                pl: 'PL',
                pt: 'BR',
                // pt: 'PT',
                ro: 'RO',
                ru: 'RU',
                sk: 'SK',
                sl: 'SI',
                sr: 'YU',
                sv: 'SE',
                tr: 'TR',
                uk: 'UA',
                zh: 'CN',
            };
            if (parts[0] in languageVariants) {
                parts.push(languageVariants[parts[0]]);
            }
        }
        else {
            // Ensure the variant is uppercase to be a valid $LANG
            parts[1] = parts[1].toUpperCase();
        }
        return parts.join('_') + '.UTF-8';
    }
    exports.getLangEnvVariable = getLangEnvVariable;
    async function getCwd(shell, userHome, variableResolver, root, customCwd, logService) {
        if (shell.cwd) {
            const unresolved = (typeof shell.cwd === 'object') ? shell.cwd.fsPath : shell.cwd;
            const resolved = await _resolveCwd(unresolved, variableResolver);
            return (0, terminalEnvironment_1.sanitizeCwd)(resolved || unresolved);
        }
        let cwd;
        if (!shell.ignoreConfigurationCwd && customCwd) {
            if (variableResolver) {
                customCwd = await _resolveCwd(customCwd, variableResolver, logService);
            }
            if (customCwd) {
                if (path.isAbsolute(customCwd)) {
                    cwd = customCwd;
                }
                else if (root) {
                    cwd = path.join(root.fsPath, customCwd);
                }
            }
        }
        // If there was no custom cwd or it was relative with no workspace
        if (!cwd) {
            cwd = root ? root.fsPath : userHome || '';
        }
        return (0, terminalEnvironment_1.sanitizeCwd)(cwd);
    }
    exports.getCwd = getCwd;
    async function _resolveCwd(cwd, variableResolver, logService) {
        if (variableResolver) {
            try {
                return await variableResolver(cwd);
            }
            catch (e) {
                logService?.error('Could not resolve terminal cwd', e);
                return undefined;
            }
        }
        return cwd;
    }
    function createVariableResolver(lastActiveWorkspace, env, configurationResolverService) {
        if (!configurationResolverService) {
            return undefined;
        }
        return (str) => configurationResolverService.resolveWithEnvironment(env, lastActiveWorkspace, str);
    }
    exports.createVariableResolver = createVariableResolver;
    async function createTerminalEnvironment(shellLaunchConfig, envFromConfig, variableResolver, version, detectLocale, baseEnv) {
        // Create a terminal environment based on settings, launch config and permissions
        const env = {};
        if (shellLaunchConfig.strictEnv) {
            // strictEnv is true, only use the requested env (ignoring null entries)
            mergeNonNullKeys(env, shellLaunchConfig.env);
        }
        else {
            // Merge process env with the env from config and from shellLaunchConfig
            mergeNonNullKeys(env, baseEnv);
            const allowedEnvFromConfig = { ...envFromConfig };
            // Resolve env vars from config and shell
            if (variableResolver) {
                if (allowedEnvFromConfig) {
                    await resolveConfigurationVariables(variableResolver, allowedEnvFromConfig);
                }
                if (shellLaunchConfig.env) {
                    await resolveConfigurationVariables(variableResolver, shellLaunchConfig.env);
                }
            }
            // Sanitize the environment, removing any undesirable VS Code and Electron environment
            // variables
            (0, processes_1.sanitizeProcessEnvironment)(env, 'VSCODE_IPC_HOOK_CLI');
            // Merge config (settings) and ShellLaunchConfig environments
            mergeEnvironments(env, allowedEnvFromConfig);
            mergeEnvironments(env, shellLaunchConfig.env);
            // Adding other env keys necessary to create the process
            addTerminalEnvironmentKeys(env, version, platform_1.language, detectLocale);
        }
        return env;
    }
    exports.createTerminalEnvironment = createTerminalEnvironment;
    /**
     * Takes a path and returns the properly escaped path to send to a given shell. On Windows, this
     * included trying to prepare the path for WSL if needed.
     *
     * @param originalPath The path to be escaped and formatted.
     * @param executable The executable off the shellLaunchConfig.
     * @param title The terminal's title.
     * @param shellType The type of shell the path is being sent to.
     * @param backend The backend for the terminal.
     * @param isWindowsFrontend Whether the frontend is Windows, this is only exposed for injection via
     * tests.
     * @returns An escaped version of the path to be execuded in the terminal.
     */
    async function preparePathForShell(resource, executable, title, shellType, backend, os, isWindowsFrontend = platform_1.isWindows) {
        let originalPath;
        if ((0, types_1.isString)(resource)) {
            originalPath = resource;
        }
        else {
            originalPath = resource.fsPath;
            // Apply backend OS-specific formatting to the path since URI.fsPath uses the frontend's OS
            if (isWindowsFrontend && os !== 1 /* OperatingSystem.Windows */) {
                originalPath = originalPath.replace(/\\/g, '\/');
            }
            else if (!isWindowsFrontend && os === 1 /* OperatingSystem.Windows */) {
                originalPath = originalPath.replace(/\//g, '\\');
            }
        }
        if (!executable) {
            return originalPath;
        }
        const hasSpace = originalPath.includes(' ');
        const hasParens = originalPath.includes('(') || originalPath.includes(')');
        const pathBasename = path.basename(executable, '.exe');
        const isPowerShell = pathBasename === 'pwsh' ||
            title === 'pwsh' ||
            pathBasename === 'powershell' ||
            title === 'powershell';
        if (isPowerShell && (hasSpace || originalPath.includes('\''))) {
            return `& '${originalPath.replace(/'/g, '\'\'')}'`;
        }
        if (hasParens && isPowerShell) {
            return `& '${originalPath}'`;
        }
        if (os === 1 /* OperatingSystem.Windows */) {
            // 17063 is the build number where wsl path was introduced.
            // Update Windows uriPath to be executed in WSL.
            if (shellType !== undefined) {
                if (shellType === "gitbash" /* WindowsShellType.GitBash */) {
                    return (0, terminalEnvironment_1.escapeNonWindowsPath)(originalPath.replace(/\\/g, '/'));
                }
                else if (shellType === "wsl" /* WindowsShellType.Wsl */) {
                    return backend?.getWslPath(originalPath, 'win-to-unix') || originalPath;
                }
                else if (hasSpace) {
                    return `"${originalPath}"`;
                }
                return originalPath;
            }
            const lowerExecutable = executable.toLowerCase();
            if (lowerExecutable.includes('wsl') || (lowerExecutable.includes('bash.exe') && !lowerExecutable.toLowerCase().includes('git'))) {
                return backend?.getWslPath(originalPath, 'win-to-unix') || originalPath;
            }
            else if (hasSpace) {
                return `"${originalPath}"`;
            }
            return originalPath;
        }
        return (0, terminalEnvironment_1.escapeNonWindowsPath)(originalPath);
    }
    exports.preparePathForShell = preparePathForShell;
    function getWorkspaceForTerminal(cwd, workspaceContextService, historyService) {
        const cwdUri = typeof cwd === 'string' ? uri_1.URI.parse(cwd) : cwd;
        let workspaceFolder = cwdUri ? workspaceContextService.getWorkspaceFolder(cwdUri) ?? undefined : undefined;
        if (!workspaceFolder) {
            // fallback to last active workspace if cwd is not available or it is not in workspace
            // TOOD: last active workspace is known to be unreliable, we should remove this fallback eventually
            const activeWorkspaceRootUri = historyService.getLastActiveWorkspaceRoot();
            workspaceFolder = activeWorkspaceRootUri ? workspaceContextService.getWorkspaceFolder(activeWorkspaceRootUri) ?? undefined : undefined;
        }
        return workspaceFolder;
    }
    exports.getWorkspaceForTerminal = getWorkspaceForTerminal;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVybWluYWxFbnZpcm9ubWVudC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL3Rlcm1pbmFsL2NvbW1vbi90ZXJtaW5hbEVudmlyb25tZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQWtCaEcsU0FBZ0IsaUJBQWlCLENBQUMsTUFBMkIsRUFBRSxLQUF1QztRQUNyRyxJQUFJLENBQUMsS0FBSyxFQUFFO1lBQ1gsT0FBTztTQUNQO1FBRUQsdUVBQXVFO1FBQ3ZFLGdDQUFnQztRQUNoQyxJQUFJLG9CQUFTLEVBQUU7WUFDZCxLQUFLLE1BQU0sU0FBUyxJQUFJLEtBQUssRUFBRTtnQkFDOUIsSUFBSSxTQUFTLEdBQUcsU0FBUyxDQUFDO2dCQUMxQixLQUFLLE1BQU0sTUFBTSxJQUFJLE1BQU0sRUFBRTtvQkFDNUIsSUFBSSxTQUFTLENBQUMsV0FBVyxFQUFFLEtBQUssTUFBTSxDQUFDLFdBQVcsRUFBRSxFQUFFO3dCQUNyRCxTQUFTLEdBQUcsTUFBTSxDQUFDO3dCQUNuQixNQUFNO3FCQUNOO2lCQUNEO2dCQUNELE1BQU0sS0FBSyxHQUFHLEtBQUssQ0FBQyxTQUFTLENBQUMsQ0FBQztnQkFDL0IsSUFBSSxLQUFLLEtBQUssU0FBUyxFQUFFO29CQUN4QixzQkFBc0IsQ0FBQyxNQUFNLEVBQUUsU0FBUyxFQUFFLEtBQUssQ0FBQyxDQUFDO2lCQUNqRDthQUNEO1NBQ0Q7YUFBTTtZQUNOLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsR0FBRyxFQUFFLEVBQUU7Z0JBQ2xDLE1BQU0sS0FBSyxHQUFHLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztnQkFDekIsSUFBSSxLQUFLLEtBQUssU0FBUyxFQUFFO29CQUN4QixzQkFBc0IsQ0FBQyxNQUFNLEVBQUUsR0FBRyxFQUFFLEtBQUss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