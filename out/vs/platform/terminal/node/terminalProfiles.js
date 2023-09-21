/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "child_process", "vs/base/common/codicons", "vs/base/common/path", "vs/base/common/platform", "vs/base/common/types", "vs/base/node/pfs", "vs/base/node/powershell", "vs/platform/terminal/node/terminalEnvironment", "path"], function (require, exports, cp, codicons_1, path_1, platform_1, types_1, pfs, powershell_1, terminalEnvironment_1, path_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.detectAvailableProfiles = void 0;
    let profileSources;
    let logIfWslNotInstalled = true;
    function detectAvailableProfiles(profiles, defaultProfile, includeDetectedProfiles, configurationService, shellEnv = process.env, fsProvider, logService, variableResolver, testPwshSourcePaths) {
        fsProvider = fsProvider || {
            existsFile: pfs.SymlinkSupport.existsFile,
            readFile: pfs.Promises.readFile
        };
        if (platform_1.isWindows) {
            return detectAvailableWindowsProfiles(includeDetectedProfiles, fsProvider, shellEnv, logService, configurationService.getValue("terminal.integrated.useWslProfiles" /* TerminalSettingId.UseWslProfiles */) !== false, profiles && typeof profiles === 'object' ? { ...profiles } : configurationService.getValue("terminal.integrated.profiles.windows" /* TerminalSettingId.ProfilesWindows */), typeof defaultProfile === 'string' ? defaultProfile : configurationService.getValue("terminal.integrated.defaultProfile.windows" /* TerminalSettingId.DefaultProfileWindows */), testPwshSourcePaths, variableResolver);
        }
        return detectAvailableUnixProfiles(fsProvider, logService, includeDetectedProfiles, profiles && typeof profiles === 'object' ? { ...profiles } : configurationService.getValue(platform_1.isLinux ? "terminal.integrated.profiles.linux" /* TerminalSettingId.ProfilesLinux */ : "terminal.integrated.profiles.osx" /* TerminalSettingId.ProfilesMacOs */), typeof defaultProfile === 'string' ? defaultProfile : configurationService.getValue(platform_1.isLinux ? "terminal.integrated.defaultProfile.linux" /* TerminalSettingId.DefaultProfileLinux */ : "terminal.integrated.defaultProfile.osx" /* TerminalSettingId.DefaultProfileMacOs */), testPwshSourcePaths, variableResolver, shellEnv);
    }
    exports.detectAvailableProfiles = detectAvailableProfiles;
    async function detectAvailableWindowsProfiles(includeDetectedProfiles, fsProvider, shellEnv, logService, useWslProfiles, configProfiles, defaultProfileName, testPwshSourcePaths, variableResolver) {
        // Determine the correct System32 path. We want to point to Sysnative
        // when the 32-bit version of VS Code is running on a 64-bit machine.
        // The reason for this is because PowerShell's important PSReadline
        // module doesn't work if this is not the case. See #27915.
        const is32ProcessOn64Windows = process.env.hasOwnProperty('PROCESSOR_ARCHITEW6432');
        const system32Path = `${process.env['windir']}\\${is32ProcessOn64Windows ? 'Sysnative' : 'System32'}`;
        let useWSLexe = false;
        if ((0, terminalEnvironment_1.getWindowsBuildNumber)() >= 16299) {
            useWSLexe = true;
        }
        await initializeWindowsProfiles(testPwshSourcePaths);
        const detectedProfiles = new Map();
        // Add auto detected profiles
        if (includeDetectedProfiles) {
            detectedProfiles.set('PowerShell', {
                source: "PowerShell" /* ProfileSource.Pwsh */,
                icon: codicons_1.Codicon.terminalPowershell,
                isAutoDetected: true
            });
            detectedProfiles.set('Windows PowerShell', {
                path: `${system32Path}\\WindowsPowerShell\\v1.0\\powershell.exe`,
                icon: codicons_1.Codicon.terminalPowershell,
                isAutoDetected: true
            });
            detectedProfiles.set('Git Bash', {
                source: "Git Bash" /* ProfileSource.GitBash */,
                isAutoDetected: true
            });
            detectedProfiles.set('Command Prompt', {
                path: `${system32Path}\\cmd.exe`,
                icon: codicons_1.Codicon.terminalCmd,
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
                icon: codicons_1.Codicon.terminalBash,
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
            args = platform_1.isWindows ? profile.args : Array.isArray(profile.args) ? profile.args : undefined;
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
            if ((0, types_1.isString)(profile.requiresPath)) {
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
            icon: codicons_1.Codicon.terminalPowershell
        });
    }
    async function getGitBashPaths() {
        const gitDirs = new Set();
        // Look for git.exe on the PATH and use that if found. git.exe is located at
        // `<installdir>/cmd/git.exe`. This is not an unsafe location because the git executable is
        // located on the PATH which is only controlled by the user/admin.
        const gitExePath = await (0, terminalEnvironment_1.findExecutable)('git.exe');
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
        for await (const pwshExe of (0, powershell_1.enumeratePowerShellInstallations)()) {
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
            return codicons_1.Codicon.terminalUbuntu;
        }
        else if (distroName.includes('Debian')) {
            return codicons_1.Codicon.terminalDebian;
        }
        else {
            return codicons_1.Codicon.terminalLinux;
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
                let profileName = (0, path_1.basename)(profile);
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
        if ((0, path_1.basename)(actualPath) === actualPath) {
            // The executable isn't an absolute path, try find it on the PATH
            const envPaths = shellEnv.PATH ? shellEnv.PATH.split(path_1.delimiter) : undefined;
            const executable = await (0, terminalEnvironment_1.findExecutable)(actualPath, undefined, envPaths, undefined, fsProvider.existsFile);
            if (!executable) {
                return validateProfilePaths(profileName, defaultProfileName, potentialPaths, fsProvider, shellEnv, args);
            }
            profile.path = executable;
            profile.isFromPath = true;
            return profile;
        }
        const result = await fsProvider.existsFile((0, path_1.normalize)(actualPath));
        if (result) {
            return profile;
        }
        return validateProfilePaths(profileName, defaultProfileName, potentialPaths, fsProvider, shellEnv, args, env, overrideName, isAutoDetected);
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVybWluYWxQcm9maWxlcy5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3BsYXRmb3JtL3Rlcm1pbmFsL25vZGUvdGVybWluYWxQcm9maWxlcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFpQmhHLElBQUksY0FBa0UsQ0FBQztJQUN2RSxJQUFJLG9CQUFvQixHQUFZLElBQUksQ0FBQztJQUV6QyxTQUFnQix1QkFBdUIsQ0FDdEMsUUFBaUIsRUFDakIsY0FBdUIsRUFDdkIsdUJBQWdDLEVBQ2hDLG9CQUEyQyxFQUMzQyxXQUErQixPQUFPLENBQUMsR0FBRyxFQUMxQyxVQUF3QixFQUN4QixVQUF3QixFQUN4QixnQkFBd0QsRUFDeEQsbUJBQThCO1FBRTlCLFVBQVUsR0FBRyxVQUFVLElBQUk7WUFDMUIsVUFBVSxFQUFFLEdBQUcsQ0FBQyxjQUFjLENBQUMsVUFBVTtZQUN6QyxRQUFRLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQyxRQUFRO1NBQy9CLENBQUM7UUFDRixJQUFJLG9CQUFTLEVBQUU7WUFDZCxPQUFPLDhCQUE4QixDQUNwQyx1QkFBdUIsRUFDdkIsVUFBVSxFQUNWLFFBQVEsRUFDUixVQUFVLEVBQ1Ysb0JBQW9CLENBQUMsUUFBUSw2RUFBa0MsS0FBSyxLQUFLLEVBQ3pFLFFBQVEsSUFBSSxPQUFPLFFBQVEsS0FBSyxRQUFRLENBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxRQUFRLEVBQUUsQ0FBQyxDQUFDLENBQUMsb0JBQW9CLENBQUMsUUFBUSxnRkFBa0YsRUFDNUssT0FBTyxjQUFjLEtBQUssUUFBUSxDQUFDLENBQUMsQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLG9CQUFvQixDQUFDLFFBQVEsNEZBQWlELEVBQ3BJLG1CQUFtQixFQUNuQixnQkFBZ0IsQ0FDaEIsQ0FBQztTQUNGO1FBQ0QsT0FBTywyQkFBMkIsQ0FDakMsVUFBVSxFQUNWLFVBQVUsRUFDVix1QkFBdUIsRUFDdkIsUUFBUSxJQUFJLE9BQU8sUUFBUSxLQUFLLFFBQVEsQ0FBQyxDQUFDLENBQUMsRUFBRSxHQUFHLFFBQVEsRUFBRSxDQUFDLENBQUMsQ0FBQyxvQkFBb0IsQ0FBQyxRQUFRLENBQWdELGtCQUFPLENBQUMsQ0FBQyw0RUFBaUMsQ0FBQyx5RUFBZ0MsQ0FBQyxFQUN0TixPQUFPLGNBQWMsS0FBSyxRQUFRLENBQUMsQ0FBQyxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUMsb0JBQW9CLENBQUMsUUFBUSxDQUFTLGtCQUFPLENBQUMsQ0FBQyx3RkFBdUMsQ0FBQyxxRkFBc0MsQ0FBQyxFQUNwTCxtQkFBbUIsRUFDbkIsZ0JBQWdCLEVBQ2hCLFFBQVEsQ0FDUixDQUFDO0lBQ0gsQ0FBQztJQXRDRCwwREFzQ0M7SUFFRCxLQUFLLFVBQVUsOEJBQThCLENBQzVDLHVCQUFnQyxFQUNoQyxVQUF1QixFQUN2QixRQUE0QixFQUM1QixVQUF3QixFQUN4QixjQUF3QixFQUN4QixjQUE4RCxFQUM5RCxrQkFBMkIsRUFDM0IsbUJBQThCLEVBQzlCLGdCQUF3RDtRQUV4RCxxRUFBcUU7UUFDckUscUVBQXFFO1FBQ3JFLG1FQUFtRTtRQUNuRSwyREFBMkQ7UUFDM0QsTUFBTSxzQkFBc0IsR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLGNBQWMsQ0FBQyx3QkFBd0IsQ0FBQyxDQUFDO1FBQ3BGLE1BQU0sWUFBWSxHQUFHLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsS0FBSyxzQkFBc0IsQ0FBQyxDQUFDLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxVQUFVLEVBQUUsQ0FBQztRQUV0RyxJQUFJLFNBQVMsR0FBRyxLQUFLLENBQUM7UUFFdEIsSUFBSSxJQUFBLDJDQUFxQixHQUFFLElBQUksS0FBSyxFQUFFO1lBQ3JDLFNBQVMsR0FBRyxJQUFJLENBQUM7U0FDakI7UUFFRCxNQUFNLHlCQUF5QixDQUFDLG1CQUFtQixDQUFDLENBQUM7UUFFckQsTUFBTSxnQkFBZ0IsR0FBNEMsSUFBSSxHQUFHLEVBQUUsQ0FBQztRQUU1RSw2QkFBNkI7UUFDN0IsSUFBSSx1QkFBdUIsRUFBRTtZQUM1QixnQkFBZ0IsQ0FBQyxHQUFHLENBQUMsWUFBWSxFQUFFO2dCQUNsQyxNQUFNLHVDQUFvQjtnQkFDMUIsSUFBSSxFQUFFLGtCQUFPLENBQUMsa0JBQWtCO2dCQUNoQyxjQUFjLEVBQUUsSUFBSTthQUNwQixDQUFDLENBQUM7WUFDSCxnQkFBZ0IsQ0FBQyxHQUFHLENBQUMsb0JBQW9CLEVBQUU7Z0JBQzFDLElBQUksRUFBRSxHQUFHLFlBQVksMkNBQTJDO2dCQUNoRSxJQUFJLEVBQUUsa0JBQU8sQ0FBQyxrQkFBa0I7Z0JBQ2hDLGNBQWMsRUFBRSxJQUFJO2FBQ3BCLENBQUMsQ0FBQztZQUNILGdCQUFnQixDQUFDLEdBQUcsQ0FBQyxVQUFVLEVBQUU7Z0JBQ2hDLE1BQU0sd0NBQXVCO2dCQUM3QixjQUFjLEVBQUUsSUFBSTthQUNwQixDQUFDLENBQUM7WUFDSCxnQkFBZ0IsQ0FBQyxHQUFHLENBQUMsZ0JBQWdCLEVBQUU7Z0JBQ3RDLElBQUksRUFBRSxHQUFHLFlBQVksV0FBVztnQkFDaEMsSUFBSSxFQUFFLGtCQUFPLENBQUMsV0FBVztnQkFDekIsY0FBYyxFQUFFLElBQUk7YUFDcEIsQ0FBQyxDQUFDO1lBQ0gsZ0JBQWdCLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRTtnQkFDOUIsSUFBSSxFQUFFO29CQUNMLEVBQUUsSUFBSSxFQUFFLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsMkJBQTJCLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBRTtvQkFDaEYsRUFBRSxJQUFJLEVBQUUsR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQyx5QkFBeUIsRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFFO2lCQUM5RTtnQkFDRCxJQUFJLEVBQUUsQ0FBQyxTQUFTLENBQUM7Z0JBQ2pCLGNBQWMsRUFBRSxJQUFJO2FBQ3BCLENBQUMsQ0FBQztZQUNILGdCQUFnQixDQUFDLEdBQUcsQ0FBQyxjQUFjLEVBQUU7Z0JBQ3BDLElBQUksRUFBRTtvQkFDTCxFQUFFLElBQUksRUFBRSxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDLDhCQUE4QixFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUU7aUJBQ25GO2dCQUNELElBQUksRUFBRSxDQUFDLFNBQVMsRUFBRSxJQUFJLENBQUM7Z0JBQ3ZCLElBQUksRUFBRSxrQkFBTyxDQUFDLFlBQVk7Z0JBQzFCLGNBQWMsRUFBRSxJQUFJO2FBQ3BCLENBQUMsQ0FBQztZQUNILE1BQU0sU0FBUyxHQUFHLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsSUFBSSxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDLFNBQVMsZ0NBQWdDLENBQUM7WUFDdkgsZ0JBQWdCLENBQUMsR0FBRyxDQUFDLE9BQU8sRUFBRTtnQkFDN0IsSUFBSSxFQUFFLEdBQUcsWUFBWSxXQUFXO2dCQUNoQyxJQUFJLEVBQUUsQ0FBQyxJQUFJLEVBQUUsU0FBUyxDQUFDO2dCQUN2QixxREFBcUQ7Z0JBQ3JELFlBQVksRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFFO2dCQUN6RixjQUFjLEVBQUUsSUFBSTthQUNwQixDQUFDLENBQUM7U0FDSDtRQUVELHdCQUF3QixDQUFDLGNBQWMsRUFBRSxnQkFBZ0IsQ0FBQyxDQUFDO1FBRTNELE1BQU0sY0FBYyxHQUF1QixNQUFNLDJCQUEyQixDQUFDLGdCQUFnQixDQUFDLE9BQU8sRUFBRSxFQUFFLGtCQUFrQixFQUFFLFVBQVUsRUFBRSxRQUFRLEVBQUUsVUFBVSxFQUFFLGdCQUFnQixDQUFDLENBQUM7UUFFakwsSUFBSSx1QkFBdUIsSUFBSSxjQUFjLEVBQUU7WUFDOUMsSUFBSTtnQkFDSCxNQUFNLE1BQU0sR0FBRyxNQUFNLGNBQWMsQ0FBQyxHQUFHLFlBQVksS0FBSyxTQUFTLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsTUFBTSxNQUFNLEVBQUUsa0JBQWtCLENBQUMsQ0FBQztnQkFDOUcsS0FBSyxNQUFNLFVBQVUsSUFBSSxNQUFNLEVBQUU7b0JBQ2hDLElBQUksQ0FBQyxjQUFjLElBQUksQ0FBQyxDQUFDLFVBQVUsQ0FBQyxXQUFXLElBQUksY0FBYyxDQUFDLEVBQUU7d0JBQ25FLGNBQWMsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7cUJBQ2hDO2lCQUNEO2FBQ0Q7WUFBQyxPQUFPLENBQUMsRUFBRTtnQkFDWCxJQUFJLG9CQUFvQixFQUFFO29CQUN6QixVQUFVLEVBQUUsSUFBSSxDQUFDLHdEQUF3RCxDQUFDLENBQUM7b0JBQzNFLG9CQUFvQixHQUFHLEtBQUssQ0FBQztpQkFDN0I7YUFDRDtTQUNEO1FBRUQsT0FBTyxjQUFjLENBQUM7SUFDdkIsQ0FBQztJQUVELEtBQUssVUFBVSwyQkFBMkIsQ0FDekMsT0FBK0QsRUFDL0Qsa0JBQXNDLEVBQ3RDLFVBQXVCLEVBQ3ZCLFdBQStCLE9BQU8sQ0FBQyxHQUFHLEVBQzFDLFVBQXdCLEVBQ3hCLGdCQUF3RDtRQUV4RCxNQUFNLFFBQVEsR0FBNEMsRUFBRSxDQUFDO1FBQzdELEtBQUssTUFBTSxDQUFDLFdBQVcsRUFBRSxPQUFPLENBQUMsSUFBSSxPQUFPLEVBQUU7WUFDN0MsUUFBUSxDQUFDLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxXQUFXLEVBQUUsT0FBTyxFQUFFLGtCQUFrQixFQUFFLFVBQVUsRUFBRSxRQUFRLEVBQUUsVUFBVSxFQUFFLGdCQUFnQixDQUFDLENBQUMsQ0FBQztTQUNqSTtRQUNELE9BQU8sQ0FBQyxNQUFNLE9BQU8sQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUF1QixDQUFDO0lBQzdFLENBQUM7SUFFRCxLQUFLLFVBQVUsbUJBQW1CLENBQ2pDLFdBQW1CLEVBQ25CLE9BQW1DLEVBQ25DLGtCQUFzQyxFQUN0QyxVQUF1QixFQUN2QixXQUErQixPQUFPLENBQUMsR0FBRyxFQUMxQyxVQUF3QixFQUN4QixnQkFBd0Q7UUFFeEQsSUFBSSxPQUFPLEtBQUssSUFBSSxFQUFFO1lBQ3JCLE9BQU8sU0FBUyxDQUFDO1NBQ2pCO1FBQ0QsSUFBSSxhQUErQyxDQUFDO1FBQ3BELElBQUksSUFBbUMsQ0FBQztRQUN4QyxJQUFJLElBQUksR0FBNEQsU0FBUyxDQUFDO1FBQzlFLGlEQUFpRDtRQUNqRCxJQUFJLFFBQVEsSUFBSSxPQUFPLElBQUksQ0FBQyxDQUFDLE1BQU0sSUFBSSxPQUFPLENBQUMsRUFBRTtZQUNoRCxNQUFNLE1BQU0sR0FBRyxjQUFjLEVBQUUsR0FBRyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUNuRCxJQUFJLENBQUMsTUFBTSxFQUFFO2dCQUNaLE9BQU8sU0FBUyxDQUFDO2FBQ2pCO1lBQ0QsYUFBYSxHQUFHLE1BQU0sQ0FBQyxLQUFLLENBQUM7WUFFN0IsMERBQTBEO1lBQzFELElBQUksR0FBRyxPQUFPLENBQUMsSUFBSSxJQUFJLE1BQU0sQ0FBQyxJQUFJLENBQUM7WUFDbkMsSUFBSSxPQUFPLENBQUMsSUFBSSxFQUFFO2dCQUNqQixJQUFJLEdBQUcsWUFBWSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQzthQUNsQztpQkFBTSxJQUFJLE1BQU0sQ0FBQyxJQUFJLEVBQUU7Z0JBQ3ZCLElBQUksR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDO2FBQ25CO1NBQ0Q7YUFBTTtZQUNOLGFBQWEsR0FBRyxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDNUUsSUFBSSxHQUFHLG9CQUFTLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUM7WUFDekYsSUFBSSxHQUFHLFlBQVksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7U0FDbEM7UUFFRCxJQUFJLEtBQXVDLENBQUM7UUFDNUMsSUFBSSxnQkFBZ0IsRUFBRTtZQUNyQixrQ0FBa0M7WUFDbEMsTUFBTSxNQUFNLEdBQUcsYUFBYSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxLQUFLLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUM7WUFFMUUsTUFBTSxRQUFRLEdBQUcsTUFBTSxnQkFBZ0IsQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUNoRCwwQ0FBMEM7WUFDMUMsS0FBSyxHQUFHLElBQUksS0FBSyxDQUFDLGFBQWEsQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUN4QyxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsYUFBYSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtnQkFDOUMsSUFBSSxPQUFPLGFBQWEsQ0FBQyxDQUFDLENBQUMsS0FBSyxRQUFRLEVBQUU7b0JBQ3pDLEtBQUssQ0FBQyxDQUFDLENBQUMsR0FBRyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUM7aUJBQ3ZCO3FCQUFNO29CQUNOLEtBQUssQ0FBQyxDQUFDLENBQUMsR0FBRzt3QkFDVixJQUFJLEVBQUUsUUFBUSxDQUFDLENBQUMsQ0FBQzt3QkFDakIsUUFBUSxFQUFFLElBQUk7cUJBQ2QsQ0FBQztpQkFDRjthQUNEO1NBQ0Q7YUFBTTtZQUNOLEtBQUssR0FBRyxhQUFhLENBQUMsS0FBSyxFQUFFLENBQUM7U0FDOUI7UUFFRCxJQUFJLGtCQUFzQyxDQUFDO1FBQzNDLElBQUksT0FBTyxDQUFDLFlBQVksRUFBRTtZQUN6QiwrQkFBK0I7WUFDL0IsSUFBSSxrQkFBMEIsQ0FBQztZQUMvQixJQUFJLElBQUEsZ0JBQVEsRUFBQyxPQUFPLENBQUMsWUFBWSxDQUFDLEVBQUU7Z0JBQ25DLGtCQUFrQixHQUFHLE9BQU8sQ0FBQyxZQUFZLENBQUM7YUFDMUM7aUJBQU07Z0JBQ04sa0JBQWtCLEdBQUcsT0FBTyxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUM7Z0JBQy9DLElBQUksT0FBTyxDQUFDLFlBQVksQ0FBQyxRQUFRLEVBQUU7b0JBQ2xDLGtCQUFrQixHQUFHLGtCQUFrQixDQUFDO2lCQUN4QzthQUNEO1lBQ0QsTUFBTSxNQUFNLEdBQUcsTUFBTSxVQUFVLENBQUMsVUFBVSxDQUFDLGtCQUFrQixDQUFDLENBQUM7WUFDL0QsSUFBSSxDQUFDLE1BQU0sRUFBRTtnQkFDWixPQUFPO2FBQ1A7U0FDRDtRQUVELE1BQU0sZ0JBQWdCLEdBQUcsTUFBTSxvQkFBb0IsQ0FBQyxXQUFXLEVBQUUsa0JBQWtCLEVBQUUsS0FBSyxFQUFFLFVBQVUsRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFFLE9BQU8sQ0FBQyxHQUFHLEVBQUUsT0FBTyxDQUFDLFlBQVksRUFBRSxPQUFPLENBQUMsY0FBYyxFQUFFLGtCQUFrQixDQUFDLENBQUM7UUFDdk0sSUFBSSxDQUFDLGdCQUFnQixFQUFFO1lBQ3RCLFVBQVUsRUFBRSxLQUFLLENBQUMsZ0NBQWdDLEVBQUUsV0FBVyxFQUFFLGFBQWEsQ0FBQyxDQUFDO1lBQ2hGLE9BQU8sU0FBUyxDQUFDO1NBQ2pCO1FBRUQsZ0JBQWdCLENBQUMsY0FBYyxHQUFHLE9BQU8sQ0FBQyxjQUFjLENBQUM7UUFDekQsZ0JBQWdCLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQztRQUM3QixnQkFBZ0IsQ0FBQyxLQUFLLEdBQUcsT0FBTyxDQUFDLEtBQUssQ0FBQztRQUN2QyxPQUFPLGdCQUFnQixDQUFDO0lBQ3pCLENBQUM7SUFFRCxTQUFTLFlBQVksQ0FBQyxJQUF1QztRQUM1RCxJQUFJLE9BQU8sSUFBSSxLQUFLLFFBQVEsRUFBRTtZQUM3QixPQUFPLEVBQUUsRUFBRSxFQUFFLElBQUksRUFBRSxDQUFDO1NBQ3BCO1FBQ0QsT0FBTyxJQUFJLENBQUM7SUFDYixDQUFDO0lBRUQsS0FBSyxVQUFVLHlCQUF5QixDQUFDLG1CQUE4QjtRQUN0RSxJQUFJLGNBQWMsSUFBSSxDQUFDLG1CQUFtQixFQUFFO1lBQzNDLE9BQU87U0FDUDtRQUVELE1BQU0sQ0FBQyxZQUFZLEVBQUUsU0FBUyxDQUFDLEdBQUcsTUFBTSxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsZUFBZSxFQUFFLEVBQUUsbUJBQW1CLElBQUksa0JBQWtCLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFFdEgsY0FBYyxHQUFHLElBQUksR0FBRyxFQUFFLENBQUM7UUFDM0IsY0FBYyxDQUFDLEdBQUcseUNBQ007WUFDdkIsV0FBVyxFQUFFLFVBQVU7WUFDdkIsS0FBSyxFQUFFLFlBQVk7WUFDbkIsSUFBSSxFQUFFLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQztTQUN2QixDQUFDLENBQUM7UUFDSCxjQUFjLENBQUMsR0FBRyx3Q0FBcUI7WUFDdEMsV0FBVyxFQUFFLFlBQVk7WUFDekIsS0FBSyxFQUFFLFNBQVM7WUFDaEIsSUFBSSxFQUFFLGtCQUFPLENBQUMsa0JBQWtCO1NBQ2hDLENBQUMsQ0FBQztJQUNKLENBQUM7SUFFRCxLQUFLLFVBQVUsZUFBZTtRQUM3QixNQUFNLE9BQU8sR0FBZ0IsSUFBSSxHQUFHLEVBQUUsQ0FBQztRQUV2Qyw0RUFBNEU7UUFDNUUsMkZBQTJGO1FBQzNGLGtFQUFrRTtRQUNsRSxNQUFNLFVBQVUsR0FBRyxNQUFNLElBQUEsb0NBQWMsRUFBQyxTQUFTLENBQUMsQ0FBQztRQUNuRCxJQUFJLFVBQVUsRUFBRTtZQUNmLE1BQU0sU0FBUyxHQUFHLElBQUEsY0FBTyxFQUFDLFVBQVUsQ0FBQyxDQUFDO1lBQ3RDLE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBQSxjQUFPLEVBQUMsU0FBUyxFQUFFLE9BQU8sQ0FBQyxDQUFDLENBQUM7U0FDekM7UUFDRCxTQUFTLFNBQVMsQ0FBSSxHQUFXLEVBQUUsS0FBb0I7WUFDdEQsSUFBSSxLQUFLLEVBQUU7Z0JBQ1YsR0FBRyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQzthQUNmO1FBQ0YsQ0FBQztRQUVELG1DQUFtQztRQUNuQyxTQUFTLENBQUMsT0FBTyxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQztRQUNoRCxTQUFTLENBQUMsT0FBTyxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQztRQUNoRCxTQUFTLENBQUMsT0FBTyxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsbUJBQW1CLENBQUMsQ0FBQyxDQUFDO1FBQ3JELFNBQVMsQ0FBQyxPQUFPLEVBQUUsR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLGNBQWMsQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUU5RCxNQUFNLFlBQVksR0FBYSxFQUFFLENBQUM7UUFDbEMsS0FBSyxNQUFNLE1BQU0sSUFBSSxPQUFPLEVBQUU7WUFDN0IsWUFBWSxDQUFDLElBQUksQ0FDaEIsR0FBRyxNQUFNLHNCQUFzQixFQUMvQixHQUFHLE1BQU0sMkJBQTJCLEVBQ3BDLEdBQUcsTUFBTSxzQkFBc0IsQ0FBQyw0QkFBNEI7YUFDNUQsQ0FBQztTQUNGO1FBRUQsMEVBQTBFO1FBQzFFLFlBQVksQ0FBQyxJQUFJLENBQUMsR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLGFBQWEsQ0FBQyw0Q0FBNEMsQ0FBQyxDQUFDO1FBQzdGLFlBQVksQ0FBQyxJQUFJLENBQUMsR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLGFBQWEsQ0FBQyx5REFBeUQsQ0FBQyxDQUFDO1FBRTFHLE9BQU8sWUFBWSxDQUFDO0lBQ3JCLENBQUM7SUFFRCxLQUFLLFVBQVUsa0JBQWtCO1FBQ2hDLE1BQU0sS0FBSyxHQUFhLEVBQUUsQ0FBQztRQUMzQixnREFBZ0Q7UUFDaEQsSUFBSSxLQUFLLEVBQUUsTUFBTSxPQUFPLElBQUksSUFBQSw2Q0FBZ0MsR0FBRSxFQUFFO1lBQy9ELEtBQUssQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1NBQzVCO1FBQ0QsT0FBTyxLQUFLLENBQUM7SUFDZCxDQUFDO0lBRUQsS0FBSyxVQUFVLGNBQWMsQ0FBQyxPQUFlLEVBQUUsa0JBQXNDO1FBQ3BGLE1BQU0sUUFBUSxHQUF1QixFQUFFLENBQUM7UUFDeEMsTUFBTSxZQUFZLEdBQUcsTUFBTSxJQUFJLE9BQU8sQ0FBUyxDQUFDLE9BQU8sRUFBRSxNQUFNLEVBQUUsRUFBRTtZQUNsRSx5REFBeUQ7WUFDekQsRUFBRSxDQUFDLElBQUksQ0FBQyxlQUFlLEVBQUUsRUFBRSxRQUFRLEVBQUUsU0FBUyxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsRUFBRSxDQUFDLEdBQUcsRUFBRSxNQUFNLEVBQUUsRUFBRTtnQkFDaEYsSUFBSSxHQUFHLEVBQUU7b0JBQ1IsT0FBTyxNQUFNLENBQUMsMkNBQTJDLENBQUMsQ0FBQztpQkFDM0Q7Z0JBQ0QsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQ2pCLENBQUMsQ0FBQyxDQUFDO1FBQ0osQ0FBQyxDQUFDLENBQUM7UUFDSCxJQUFJLENBQUMsWUFBWSxFQUFFO1lBQ2xCLE9BQU8sRUFBRSxDQUFDO1NBQ1Y7UUFDRCxNQUFNLEtBQUssR0FBRyxJQUFJLE1BQU0sQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUNwQyxNQUFNLFdBQVcsR0FBRyxZQUFZLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQztRQUMzRixLQUFLLE1BQU0sVUFBVSxJQUFJLFdBQVcsRUFBRTtZQUNyQyxtQkFBbUI7WUFDbkIsSUFBSSxVQUFVLEtBQUssRUFBRSxFQUFFO2dCQUN0QixTQUFTO2FBQ1Q7WUFFRCxrRkFBa0Y7WUFDbEYsdURBQXVEO1lBQ3ZELElBQUksVUFBVSxDQUFDLFVBQVUsQ0FBQyxnQkFBZ0IsQ0FBQyxFQUFFO2dCQUM1QyxTQUFTO2FBQ1Q7WUFFRCw4REFBOEQ7WUFDOUQsTUFBTSxXQUFXLEdBQUcsR0FBRyxVQUFVLFFBQVEsQ0FBQztZQUMxQyxNQUFNLE9BQU8sR0FBcUI7Z0JBQ2pDLFdBQVc7Z0JBQ1gsSUFBSSxFQUFFLE9BQU87Z0JBQ2IsSUFBSSxFQUFFLENBQUMsSUFBSSxFQUFFLEdBQUcsVUFBVSxFQUFFLENBQUM7Z0JBQzdCLFNBQVMsRUFBRSxXQUFXLEtBQUssa0JBQWtCO2dCQUM3QyxJQUFJLEVBQUUsVUFBVSxDQUFDLFVBQVUsQ0FBQztnQkFDNUIsY0FBYyxFQUFFLEtBQUs7YUFDckIsQ0FBQztZQUNGLGtCQUFrQjtZQUNsQixRQUFRLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1NBQ3ZCO1FBQ0QsT0FBTyxRQUFRLENBQUM7SUFDakIsQ0FBQztJQUVELFNBQVMsVUFBVSxDQUFDLFVBQWtCO1FBQ3JDLElBQUksVUFBVSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsRUFBRTtZQUNsQyxPQUFPLGtCQUFPLENBQUMsY0FBYyxDQUFDO1NBQzlCO2FBQU0sSUFBSSxVQUFVLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxFQUFFO1lBQ3pDLE9BQU8sa0JBQU8sQ0FBQyxjQUFjLENBQUM7U0FDOUI7YUFBTTtZQUNOLE9BQU8sa0JBQU8sQ0FBQyxhQUFhLENBQUM7U0FDN0I7SUFDRixDQUFDO0lBRUQsS0FBSyxVQUFVLDJCQUEyQixDQUN6QyxVQUF1QixFQUN2QixVQUF3QixFQUN4Qix1QkFBaUMsRUFDakMsY0FBOEQsRUFDOUQsa0JBQTJCLEVBQzNCLFNBQW9CLEVBQ3BCLGdCQUF3RCxFQUN4RCxRQUE2QjtRQUU3QixNQUFNLGdCQUFnQixHQUE0QyxJQUFJLEdBQUcsRUFBRSxDQUFDO1FBRTVFLGdDQUFnQztRQUNoQyxJQUFJLHVCQUF1QixFQUFFO1lBQzVCLE1BQU0sUUFBUSxHQUFHLENBQUMsTUFBTSxVQUFVLENBQUMsUUFBUSxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUM7WUFDdkUsTUFBTSxRQUFRLEdBQUcsQ0FDaEIsQ0FBQyxTQUFTLElBQUksUUFBUSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztpQkFDakMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFO2dCQUNSLE1BQU0sS0FBSyxHQUFHLENBQUMsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUM7Z0JBQzdCLE9BQU8sS0FBSyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDO1lBQ2pELENBQUMsQ0FBQztpQkFDRCxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUNsQyxDQUFDO1lBQ0YsTUFBTSxNQUFNLEdBQXdCLElBQUksR0FBRyxFQUFFLENBQUM7WUFDOUMsS0FBSyxNQUFNLE9BQU8sSUFBSSxRQUFRLEVBQUU7Z0JBQy9CLElBQUksV0FBVyxHQUFHLElBQUEsZUFBUSxFQUFDLE9BQU8sQ0FBQyxDQUFDO2dCQUNwQyxJQUFJLEtBQUssR0FBRyxNQUFNLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFDekMsS0FBSyxFQUFFLENBQUM7Z0JBQ1IsSUFBSSxLQUFLLEdBQUcsQ0FBQyxFQUFFO29CQUNkLFdBQVcsR0FBRyxHQUFHLFdBQVcsS0FBSyxLQUFLLEdBQUcsQ0FBQztpQkFDMUM7Z0JBQ0QsTUFBTSxDQUFDLEdBQUcsQ0FBQyxXQUFXLEVBQUUsS0FBSyxDQUFDLENBQUM7Z0JBQy9CLGdCQUFnQixDQUFDLEdBQUcsQ0FBQyxXQUFXLEVBQUUsRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFFLGNBQWMsRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDO2FBQzNFO1NBQ0Q7UUFFRCx3QkFBd0IsQ0FBQyxjQUFjLEVBQUUsZ0JBQWdCLENBQUMsQ0FBQztRQUUzRCxPQUFPLE1BQU0sMkJBQTJCLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxFQUFFLEVBQUUsa0JBQWtCLEVBQUUsVUFBVSxFQUFFLFFBQVEsRUFBRSxVQUFVLEVBQUUsZ0JBQWdCLENBQUMsQ0FBQztJQUM5SSxDQUFDO0lBRUQsU0FBUyx3QkFBd0IsQ0FBQyxjQUF5RSxFQUFFLFdBQW9EO1FBQ2hLLElBQUksQ0FBQyxjQUFjLEVBQUU7WUFDcEIsT0FBTztTQUNQO1FBQ0QsS0FBSyxNQUFNLENBQUMsV0FBVyxFQUFFLEtBQUssQ0FBQyxJQUFJLE1BQU0sQ0FBQyxPQUFPLENBQUMsY0FBYyxDQUFDLEVBQUU7WUFDbEUsSUFBSSxLQUFLLEtBQUssSUFBSSxJQUFJLE9BQU8sS0FBSyxLQUFLLFFBQVEsSUFBSSxDQUFDLENBQUMsQ0FBQyxNQUFNLElBQUksS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLFFBQVEsSUFBSSxLQUFLLENBQUMsQ0FBQyxFQUFFO2dCQUNoRyxXQUFXLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxDQUFDO2FBQ2hDO2lCQUFNO2dCQUNOLEtBQUssQ0FBQyxJQUFJLEdBQUcsS0FBSyxDQUFDLElBQUksSUFBSSxXQUFXLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQyxFQUFFLElBQUksQ0FBQztnQkFDOUQsV0FBVyxDQUFDLEdBQUcsQ0FBQyxXQUFXLEVBQUUsS0FBSyxDQUFDLENBQUM7YUFDcEM7U0FDRDtJQUNGLENBQUM7SUFFRCxLQUFLLFVBQVUsb0JBQW9CLENBQUMsV0FBbUIsRUFBRSxrQkFBc0MsRUFBRSxjQUFnRCxFQUFFLFVBQXVCLEVBQUUsUUFBNEIsRUFBRSxJQUF3QixFQUFFLEdBQTBCLEVBQUUsWUFBc0IsRUFBRSxjQUF3QixFQUFFLGtCQUEyQjtRQUM1VSxJQUFJLGNBQWMsQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO1lBQ2hDLE9BQU8sT0FBTyxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQztTQUNsQztRQUNELE1BQU0sSUFBSSxHQUFHLGNBQWMsQ0FBQyxLQUFLLEVBQUcsQ0FBQztRQUNyQyxJQUFJLElBQUksS0FBSyxFQUFFLEVBQUU7WUFDaEIsT0FBTyxvQkFBb0IsQ0FBQyxXQUFXLEVBQUUsa0JBQWtCLEVBQUUsY0FBYyxFQUFFLFVBQVUsRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFFLEdBQUcsRUFBRSxZQUFZLEVBQUUsY0FBYyxDQUFDLENBQUM7U0FDNUk7UUFDRCxNQUFNLFlBQVksR0FBRyxPQUFPLElBQUksS0FBSyxRQUFRLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQztRQUMvRCxNQUFNLFVBQVUsR0FBRyxPQUFPLElBQUksS0FBSyxRQUFRLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQztRQUUvRCxNQUFNLE9BQU8sR0FBcUI7WUFDakMsV0FBVztZQUNYLElBQUksRUFBRSxVQUFVO1lBQ2hCLElBQUk7WUFDSixHQUFHO1lBQ0gsWUFBWTtZQUNaLGNBQWM7WUFDZCxTQUFTLEVBQUUsV0FBVyxLQUFLLGtCQUFrQjtZQUM3QyxZQUFZO1lBQ1osa0JBQWtCO1NBQ2xCLENBQUM7UUFFRiwyREFBMkQ7UUFDM0QsSUFBSSxJQUFBLGVBQVEsRUFBQyxVQUFVLENBQUMsS0FBSyxVQUFVLEVBQUU7WUFDeEMsaUVBQWlFO1lBQ2pFLE1BQU0sUUFBUSxHQUF5QixRQUFRLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxnQkFBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQztZQUNsRyxNQUFNLFVBQVUsR0FBRyxNQUFNLElBQUEsb0NBQWMsRUFBQyxVQUFVLEVBQUUsU0FBUyxFQUFFLFFBQVEsRUFBRSxTQUFTLEVBQUUsVUFBVSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1lBQzNHLElBQUksQ0FBQyxVQUFVLEVBQUU7Z0JBQ2hCLE9BQU8sb0JBQW9CLENBQUMsV0FBVyxFQUFFLGtCQUFrQixFQUFFLGNBQWMsRUFBRSxVQUFVLEVBQUUsUUFBUSxFQUFFLElBQUksQ0FBQyxDQUFDO2FBQ3pHO1lBQ0QsT0FBTyxDQUFDLElBQUksR0FBRyxVQUFVLENBQUM7WUFDMUIsT0FBTyxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUM7WUFDMUIsT0FBTyxPQUFPLENBQUM7U0FDZjtRQUVELE1BQU0sTUFBTSxHQUFHLE1BQU0sVUFBVSxDQUFDLFVBQVUsQ0FBQyxJQUFBLGdCQUFTLEVBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQztRQUNsRSxJQUFJLE1BQU0sRUFBRTtZQUNYLE9BQU8sT0FBTyxDQUFDO1NBQ2Y7UUFFRCxPQUFPLG9CQUFvQixDQUFDLFdBQVcsRUFBRSxrQkFBa0IsRUFBRSxjQUFjLEVBQUUsVUFBVSxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUUsR0FBRyxFQUFFLFlBQVksRUFBRSxjQUFjLENBQUMsQ0FBQztJQUM3SSxDQUFDIn0=