/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "child_process", "vs/base/common/codicons", "vs/base/common/path", "vs/base/common/platform", "vs/base/common/types", "vs/base/node/pfs", "vs/base/node/powershell", "vs/platform/terminal/node/terminalEnvironment", "path"], function (require, exports, cp, codicons_1, path_1, platform_1, types_1, pfs, powershell_1, terminalEnvironment_1, path_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$kr = void 0;
    let profileSources;
    let logIfWslNotInstalled = true;
    function $kr(profiles, defaultProfile, includeDetectedProfiles, configurationService, shellEnv = process.env, fsProvider, logService, variableResolver, testPwshSourcePaths) {
        fsProvider = fsProvider || {
            existsFile: pfs.SymlinkSupport.existsFile,
            readFile: pfs.Promises.readFile
        };
        if (platform_1.$i) {
            return detectAvailableWindowsProfiles(includeDetectedProfiles, fsProvider, shellEnv, logService, configurationService.getValue("terminal.integrated.useWslProfiles" /* TerminalSettingId.UseWslProfiles */) !== false, profiles && typeof profiles === 'object' ? { ...profiles } : configurationService.getValue("terminal.integrated.profiles.windows" /* TerminalSettingId.ProfilesWindows */), typeof defaultProfile === 'string' ? defaultProfile : configurationService.getValue("terminal.integrated.defaultProfile.windows" /* TerminalSettingId.DefaultProfileWindows */), testPwshSourcePaths, variableResolver);
        }
        return detectAvailableUnixProfiles(fsProvider, logService, includeDetectedProfiles, profiles && typeof profiles === 'object' ? { ...profiles } : configurationService.getValue(platform_1.$k ? "terminal.integrated.profiles.linux" /* TerminalSettingId.ProfilesLinux */ : "terminal.integrated.profiles.osx" /* TerminalSettingId.ProfilesMacOs */), typeof defaultProfile === 'string' ? defaultProfile : configurationService.getValue(platform_1.$k ? "terminal.integrated.defaultProfile.linux" /* TerminalSettingId.DefaultProfileLinux */ : "terminal.integrated.defaultProfile.osx" /* TerminalSettingId.DefaultProfileMacOs */), testPwshSourcePaths, variableResolver, shellEnv);
    }
    exports.$kr = $kr;
    async function detectAvailableWindowsProfiles(includeDetectedProfiles, fsProvider, shellEnv, logService, useWslProfiles, configProfiles, defaultProfileName, testPwshSourcePaths, variableResolver) {
        // Determine the correct System32 path. We want to point to Sysnative
        // when the 32-bit version of VS Code is running on a 64-bit machine.
        // The reason for this is because PowerShell's important PSReadline
        // module doesn't work if this is not the case. See #27915.
        const is32ProcessOn64Windows = process.env.hasOwnProperty('PROCESSOR_ARCHITEW6432');
        const system32Path = `${process.env['windir']}\\${is32ProcessOn64Windows ? 'Sysnative' : 'System32'}`;
        let useWSLexe = false;
        if ((0, terminalEnvironment_1.$hr)() >= 16299) {
            useWSLexe = true;
        }
        await initializeWindowsProfiles(testPwshSourcePaths);
        const detectedProfiles = new Map();
        // Add auto detected profiles
        if (includeDetectedProfiles) {
            detectedProfiles.set('PowerShell', {
                source: "PowerShell" /* ProfileSource.Pwsh */,
                icon: codicons_1.$Pj.terminalPowershell,
                isAutoDetected: true
            });
            detectedProfiles.set('Windows PowerShell', {
                path: `${system32Path}\\WindowsPowerShell\\v1.0\\powershell.exe`,
                icon: codicons_1.$Pj.terminalPowershell,
                isAutoDetected: true
            });
            detectedProfiles.set('Git Bash', {
                source: "Git Bash" /* ProfileSource.GitBash */,
                isAutoDetected: true
            });
            detectedProfiles.set('Command Prompt', {
                path: `${system32Path}\\cmd.exe`,
                icon: codicons_1.$Pj.terminalCmd,
                isAutoDetected: true
            });
            detectedProfiles.set('Cygwin', {
                path: [
                    { path: `${process.env['HOMEDRIVE']}\\cygwin64\\bin\\bash.exe`, isUnsafe: true },
                    { path: `${process.env['HOMEDRIVE']}\\cygwin\\bin\\bash.exe`, isUnsafe: true }
                ],
                args: ['--login'],
                isAutoDetected: true
            });
            detectedProfiles.set('bash (MSYS2)', {
                path: [
                    { path: `${process.env['HOMEDRIVE']}\\msys64\\usr\\bin\\bash.exe`, isUnsafe: true },
                ],
                args: ['--login', '-i'],
                icon: codicons_1.$Pj.terminalBash,
                isAutoDetected: true
            });
            const cmderPath = `${process.env['CMDER_ROOT'] || `${process.env['HOMEDRIVE']}\\cmder`}\\vendor\\bin\\vscode_init.cmd`;
            detectedProfiles.set('Cmder', {
                path: `${system32Path}\\cmd.exe`,
                args: ['/K', cmderPath],
                // The path is safe if it was derived from CMDER_ROOT
                requiresPath: process.env['CMDER_ROOT'] ? cmderPath : { path: cmderPath, isUnsafe: true },
                isAutoDetected: true
            });
        }
        applyConfigProfilesToMap(configProfiles, detectedProfiles);
        const resultProfiles = await transformToTerminalProfiles(detectedProfiles.entries(), defaultProfileName, fsProvider, shellEnv, logService, variableResolver);
        if (includeDetectedProfiles && useWslProfiles) {
            try {
                const result = await getWslProfiles(`${system32Path}\\${useWSLexe ? 'wsl' : 'bash'}.exe`, defaultProfileName);
                for (const wslProfile of result) {
                    if (!configProfiles || !(wslProfile.profileName in configProfiles)) {
                        resultProfiles.push(wslProfile);
                    }
                }
            }
            catch (e) {
                if (logIfWslNotInstalled) {
                    logService?.info('WSL is not installed, so could not detect WSL profiles');
                    logIfWslNotInstalled = false;
                }
            }
        }
        return resultProfiles;
    }
    async function transformToTerminalProfiles(entries, defaultProfileName, fsProvider, shellEnv = process.env, logService, variableResolver) {
        const promises = [];
        for (const [profileName, profile] of entries) {
            promises.push(getValidatedProfile(profileName, profile, defaultProfileName, fsProvider, shellEnv, logService, variableResolver));
        }
        return (await Promise.all(promises)).filter(e => !!e);
    }
    async function getValidatedProfile(profileName, profile, defaultProfileName, fsProvider, shellEnv = process.env, logService, variableResolver) {
        if (profile === null) {
            return undefined;
        }
        let originalPaths;
        let args;
        let icon = undefined;
        // use calculated values if path is not specified
        if ('source' in profile && !('path' in profile)) {
            const source = profileSources?.get(profile.source);
            if (!source) {
                return undefined;
            }
            originalPaths = source.paths;
            // if there are configured args, override the default ones
            args = profile.args || source.args;
            if (profile.icon) {
                icon = validateIcon(profile.icon);
            }
            else if (source.icon) {
                icon = source.icon;
            }
        }
        else {
            originalPaths = Array.isArray(profile.path) ? profile.path : [profile.path];
            args = platform_1.$i ? profile.args : Array.isArray(profile.args) ? profile.args : undefined;
            icon = validateIcon(profile.icon);
        }
        let paths;
        if (variableResolver) {
            // Convert to string[] for resolve
            const mapped = originalPaths.map(e => typeof e === 'string' ? e : e.path);
            const resolved = await variableResolver(mapped);
            // Convert resolved back to (T | string)[]
            paths = new Array(originalPaths.length);
            for (let i = 0; i < originalPaths.length; i++) {
                if (typeof originalPaths[i] === 'string') {
                    paths[i] = resolved[i];
                }
                else {
                    paths[i] = {
                        path: resolved[i],
                        isUnsafe: true
                    };
                }
            }
        }
        else {
            paths = originalPaths.slice();
        }
        let requiresUnsafePath;
        if (profile.requiresPath) {
            // Validate requiresPath exists
            let actualRequiredPath;
            if ((0, types_1.$jf)(profile.requiresPath)) {
                actualRequiredPath = profile.requiresPath;
            }
            else {
                actualRequiredPath = profile.requiresPath.path;
                if (profile.requiresPath.isUnsafe) {
                    requiresUnsafePath = actualRequiredPath;
                }
            }
            const result = await fsProvider.existsFile(actualRequiredPath);
            if (!result) {
                return;
            }
        }
        const validatedProfile = await validateProfilePaths(profileName, defaultProfileName, paths, fsProvider, shellEnv, args, profile.env, profile.overrideName, profile.isAutoDetected, requiresUnsafePath);
        if (!validatedProfile) {
            logService?.debug('Terminal profile not validated', profileName, originalPaths);
            return undefined;
        }
        validatedProfile.isAutoDetected = profile.isAutoDetected;
        validatedProfile.icon = icon;
        validatedProfile.color = profile.color;
        return validatedProfile;
    }
    function validateIcon(icon) {
        if (typeof icon === 'string') {
            return { id: icon };
        }
        return icon;
    }
    async function initializeWindowsProfiles(testPwshSourcePaths) {
        if (profileSources && !testPwshSourcePaths) {
            return;
        }
        const [gitBashPaths, pwshPaths] = await Promise.all([getGitBashPaths(), testPwshSourcePaths || getPowershellPaths()]);
        profileSources = new Map();
        profileSources.set("Git Bash" /* ProfileSource.GitBash */, {
            profileName: 'Git Bash',
            paths: gitBashPaths,
            args: ['--login', '-i']
        });
        profileSources.set("PowerShell" /* ProfileSource.Pwsh */, {
            profileName: 'PowerShell',
            paths: pwshPaths,
            icon: codicons_1.$Pj.terminalPowershell
        });
    }
    async function getGitBashPaths() {
        const gitDirs = new Set();
        // Look for git.exe on the PATH and use that if found. git.exe is located at
        // `<installdir>/cmd/git.exe`. This is not an unsafe location because the git executable is
        // located on the PATH which is only controlled by the user/admin.
        const gitExePath = await (0, terminalEnvironment_1.$ir)('git.exe');
        if (gitExePath) {
            const gitExeDir = (0, path_2.dirname)(gitExePath);
            gitDirs.add((0, path_2.resolve)(gitExeDir, '../..'));
        }
        function addTruthy(set, value) {
            if (value) {
                set.add(value);
            }
        }
        // Add common git install locations
        addTruthy(gitDirs, process.env['ProgramW6432']);
        addTruthy(gitDirs, process.env['ProgramFiles']);
        addTruthy(gitDirs, process.env['ProgramFiles(X86)']);
        addTruthy(gitDirs, `${process.env['LocalAppData']}\\Program`);
        const gitBashPaths = [];
        for (const gitDir of gitDirs) {
            gitBashPaths.push(`${gitDir}\\Git\\bin\\bash.exe`, `${gitDir}\\Git\\usr\\bin\\bash.exe`, `${gitDir}\\usr\\bin\\bash.exe` // using Git for Windows SDK
            );
        }
        // Add special installs that don't follow the standard directory structure
        gitBashPaths.push(`${process.env['UserProfile']}\\scoop\\apps\\git\\current\\bin\\bash.exe`);
        gitBashPaths.push(`${process.env['UserProfile']}\\scoop\\apps\\git-with-openssh\\current\\bin\\bash.exe`);
        return gitBashPaths;
    }
    async function getPowershellPaths() {
        const paths = [];
        // Add all of the different kinds of PowerShells
        for await (const pwshExe of (0, powershell_1.$ql)()) {
            paths.push(pwshExe.exePath);
        }
        return paths;
    }
    async function getWslProfiles(wslPath, defaultProfileName) {
        const profiles = [];
        const distroOutput = await new Promise((resolve, reject) => {
            // wsl.exe output is encoded in utf16le (ie. A -> 0x4100)
            cp.exec('wsl.exe -l -q', { encoding: 'utf16le', timeout: 1000 }, (err, stdout) => {
                if (err) {
                    return reject('Problem occurred when getting wsl distros');
                }
                resolve(stdout);
            });
        });
        if (!distroOutput) {
            return [];
        }
        const regex = new RegExp(/[\r?\n]/);
        const distroNames = distroOutput.split(regex).filter(t => t.trim().length > 0 && t !== '');
        for (const distroName of distroNames) {
            // Skip empty lines
            if (distroName === '') {
                continue;
            }
            // docker-desktop and docker-desktop-data are treated as implementation details of
            // Docker Desktop for Windows and therefore not exposed
            if (distroName.startsWith('docker-desktop')) {
                continue;
            }
            // Create the profile, adding the icon depending on the distro
            const profileName = `${distroName} (WSL)`;
            const profile = {
                profileName,
                path: wslPath,
                args: [`-d`, `${distroName}`],
                isDefault: profileName === defaultProfileName,
                icon: getWslIcon(distroName),
                isAutoDetected: false
            };
            // Add the profile
            profiles.push(profile);
        }
        return profiles;
    }
    function getWslIcon(distroName) {
        if (distroName.includes('Ubuntu')) {
            return codicons_1.$Pj.terminalUbuntu;
        }
        else if (distroName.includes('Debian')) {
            return codicons_1.$Pj.terminalDebian;
        }
        else {
            return codicons_1.$Pj.terminalLinux;
        }
    }
    async function detectAvailableUnixProfiles(fsProvider, logService, includeDetectedProfiles, configProfiles, defaultProfileName, testPaths, variableResolver, shellEnv) {
        const detectedProfiles = new Map();
        // Add non-quick launch profiles
        if (includeDetectedProfiles) {
            const contents = (await fsProvider.readFile('/etc/shells')).toString();
            const profiles = ((testPaths || contents.split('\n'))
                .map(e => {
                const index = e.indexOf('#');
                return index === -1 ? e : e.substring(0, index);
            })
                .filter(e => e.trim().length > 0));
            const counts = new Map();
            for (const profile of profiles) {
                let profileName = (0, path_1.$ae)(profile);
                let count = counts.get(profileName) || 0;
                count++;
                if (count > 1) {
                    profileName = `${profileName} (${count})`;
                }
                counts.set(profileName, count);
                detectedProfiles.set(profileName, { path: profile, isAutoDetected: true });
            }
        }
        applyConfigProfilesToMap(configProfiles, detectedProfiles);
        return await transformToTerminalProfiles(detectedProfiles.entries(), defaultProfileName, fsProvider, shellEnv, logService, variableResolver);
    }
    function applyConfigProfilesToMap(configProfiles, profilesMap) {
        if (!configProfiles) {
            return;
        }
        for (const [profileName, value] of Object.entries(configProfiles)) {
            if (value === null || typeof value !== 'object' || (!('path' in value) && !('source' in value))) {
                profilesMap.delete(profileName);
            }
            else {
                value.icon = value.icon || profilesMap.get(profileName)?.icon;
                profilesMap.set(profileName, value);
            }
        }
    }
    async function validateProfilePaths(profileName, defaultProfileName, potentialPaths, fsProvider, shellEnv, args, env, overrideName, isAutoDetected, requiresUnsafePath) {
        if (potentialPaths.length === 0) {
            return Promise.resolve(undefined);
        }
        const path = potentialPaths.shift();
        if (path === '') {
            return validateProfilePaths(profileName, defaultProfileName, potentialPaths, fsProvider, shellEnv, args, env, overrideName, isAutoDetected);
        }
        const isUnsafePath = typeof path !== 'string' && path.isUnsafe;
        const actualPath = typeof path === 'string' ? path : path.path;
        const profile = {
            profileName,
            path: actualPath,
            args,
            env,
            overrideName,
            isAutoDetected,
            isDefault: profileName === defaultProfileName,
            isUnsafePath,
            requiresUnsafePath
        };
        // For non-absolute paths, check if it's available on $PATH
        if ((0, path_1.$ae)(actualPath) === actualPath) {
            // The executable isn't an absolute path, try find it on the PATH
            const envPaths = shellEnv.PATH ? shellEnv.PATH.split(path_1.$ge) : undefined;
            const executable = await (0, terminalEnvironment_1.$ir)(actualPath, undefined, envPaths, undefined, fsProvider.existsFile);
            if (!executable) {
                return validateProfilePaths(profileName, defaultProfileName, potentialPaths, fsProvider, shellEnv, args);
            }
            profile.path = executable;
            profile.isFromPath = true;
            return profile;
        }
        const result = await fsProvider.existsFile((0, path_1.$7d)(actualPath));
        if (result) {
            return profile;
        }
        return validateProfilePaths(profileName, defaultProfileName, potentialPaths, fsProvider, shellEnv, args, env, overrideName, isAutoDetected);
    }
});
//# sourceMappingURL=terminalProfiles.js.map