/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "os", "vs/base/common/path", "vs/base/node/pfs"], function (require, exports, os, path, pfs) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getFirstAvailablePowerShellInstallation = exports.enumeratePowerShellInstallations = void 0;
    // This is required, since parseInt("7-preview") will return 7.
    const IntRegex = /^\d+$/;
    const PwshMsixRegex = /^Microsoft.PowerShell_.*/;
    const PwshPreviewMsixRegex = /^Microsoft.PowerShellPreview_.*/;
    var Arch;
    (function (Arch) {
        Arch[Arch["x64"] = 0] = "x64";
        Arch[Arch["x86"] = 1] = "x86";
        Arch[Arch["ARM"] = 2] = "ARM";
    })(Arch || (Arch = {}));
    let processArch;
    switch (process.arch) {
        case 'ia32':
            processArch = 1 /* Arch.x86 */;
            break;
        case 'arm':
        case 'arm64':
            processArch = 2 /* Arch.ARM */;
            break;
        default:
            processArch = 0 /* Arch.x64 */;
            break;
    }
    /*
    Currently, here are the values for these environment variables on their respective archs:
    
    On x86 process on x86:
    PROCESSOR_ARCHITECTURE is X86
    PROCESSOR_ARCHITEW6432 is undefined
    
    On x86 process on x64:
    PROCESSOR_ARCHITECTURE is X86
    PROCESSOR_ARCHITEW6432 is AMD64
    
    On x64 process on x64:
    PROCESSOR_ARCHITECTURE is AMD64
    PROCESSOR_ARCHITEW6432 is undefined
    
    On ARM process on ARM:
    PROCESSOR_ARCHITECTURE is ARM64
    PROCESSOR_ARCHITEW6432 is undefined
    
    On x86 process on ARM:
    PROCESSOR_ARCHITECTURE is X86
    PROCESSOR_ARCHITEW6432 is ARM64
    
    On x64 process on ARM:
    PROCESSOR_ARCHITECTURE is ARM64
    PROCESSOR_ARCHITEW6432 is undefined
    */
    let osArch;
    if (process.env['PROCESSOR_ARCHITEW6432']) {
        osArch = process.env['PROCESSOR_ARCHITEW6432'] === 'ARM64'
            ? 2 /* Arch.ARM */
            : 0 /* Arch.x64 */;
    }
    else if (process.env['PROCESSOR_ARCHITECTURE'] === 'ARM64') {
        osArch = 2 /* Arch.ARM */;
    }
    else if (process.env['PROCESSOR_ARCHITECTURE'] === 'X86') {
        osArch = 1 /* Arch.x86 */;
    }
    else {
        osArch = 0 /* Arch.x64 */;
    }
    class PossiblePowerShellExe {
        constructor(exePath, displayName, knownToExist) {
            this.exePath = exePath;
            this.displayName = displayName;
            this.knownToExist = knownToExist;
        }
        async exists() {
            if (this.knownToExist === undefined) {
                this.knownToExist = await pfs.SymlinkSupport.existsFile(this.exePath);
            }
            return this.knownToExist;
        }
    }
    function getProgramFilesPath({ useAlternateBitness = false } = {}) {
        if (!useAlternateBitness) {
            // Just use the native system bitness
            return process.env.ProgramFiles || null;
        }
        // We might be a 64-bit process looking for 32-bit program files
        if (processArch === 0 /* Arch.x64 */) {
            return process.env['ProgramFiles(x86)'] || null;
        }
        // We might be a 32-bit process looking for 64-bit program files
        if (osArch === 0 /* Arch.x64 */) {
            return process.env.ProgramW6432 || null;
        }
        // We're a 32-bit process on 32-bit Windows, there is no other Program Files dir
        return null;
    }
    async function findPSCoreWindowsInstallation({ useAlternateBitness = false, findPreview = false } = {}) {
        const programFilesPath = getProgramFilesPath({ useAlternateBitness });
        if (!programFilesPath) {
            return null;
        }
        const powerShellInstallBaseDir = path.join(programFilesPath, 'PowerShell');
        // Ensure the base directory exists
        if (!await pfs.SymlinkSupport.existsDirectory(powerShellInstallBaseDir)) {
            return null;
        }
        let highestSeenVersion = -1;
        let pwshExePath = null;
        for (const item of await pfs.Promises.readdir(powerShellInstallBaseDir)) {
            let currentVersion = -1;
            if (findPreview) {
                // We are looking for something like "7-preview"
                // Preview dirs all have dashes in them
                const dashIndex = item.indexOf('-');
                if (dashIndex < 0) {
                    continue;
                }
                // Verify that the part before the dash is an integer
                // and that the part after the dash is "preview"
                const intPart = item.substring(0, dashIndex);
                if (!IntRegex.test(intPart) || item.substring(dashIndex + 1) !== 'preview') {
                    continue;
                }
                currentVersion = parseInt(intPart, 10);
            }
            else {
                // Search for a directory like "6" or "7"
                if (!IntRegex.test(item)) {
                    continue;
                }
                currentVersion = parseInt(item, 10);
            }
            // Ensure we haven't already seen a higher version
            if (currentVersion <= highestSeenVersion) {
                continue;
            }
            // Now look for the file
            const exePath = path.join(powerShellInstallBaseDir, item, 'pwsh.exe');
            if (!await pfs.SymlinkSupport.existsFile(exePath)) {
                continue;
            }
            pwshExePath = exePath;
            highestSeenVersion = currentVersion;
        }
        if (!pwshExePath) {
            return null;
        }
        const bitness = programFilesPath.includes('x86') ? ' (x86)' : '';
        const preview = findPreview ? ' Preview' : '';
        return new PossiblePowerShellExe(pwshExePath, `PowerShell${preview}${bitness}`, true);
    }
    async function findPSCoreMsix({ findPreview } = {}) {
        // We can't proceed if there's no LOCALAPPDATA path
        if (!process.env.LOCALAPPDATA) {
            return null;
        }
        // Find the base directory for MSIX application exe shortcuts
        const msixAppDir = path.join(process.env.LOCALAPPDATA, 'Microsoft', 'WindowsApps');
        if (!await pfs.SymlinkSupport.existsDirectory(msixAppDir)) {
            return null;
        }
        // Define whether we're looking for the preview or the stable
        const { pwshMsixDirRegex, pwshMsixName } = findPreview
            ? { pwshMsixDirRegex: PwshPreviewMsixRegex, pwshMsixName: 'PowerShell Preview (Store)' }
            : { pwshMsixDirRegex: PwshMsixRegex, pwshMsixName: 'PowerShell (Store)' };
        // We should find only one such application, so return on the first one
        for (const subdir of await pfs.Promises.readdir(msixAppDir)) {
            if (pwshMsixDirRegex.test(subdir)) {
                const pwshMsixPath = path.join(msixAppDir, subdir, 'pwsh.exe');
                return new PossiblePowerShellExe(pwshMsixPath, pwshMsixName);
            }
        }
        // If we find nothing, return null
        return null;
    }
    function findPSCoreDotnetGlobalTool() {
        const dotnetGlobalToolExePath = path.join(os.homedir(), '.dotnet', 'tools', 'pwsh.exe');
        return new PossiblePowerShellExe(dotnetGlobalToolExePath, '.NET Core PowerShell Global Tool');
    }
    function findWinPS() {
        const winPSPath = path.join(process.env.windir, processArch === 1 /* Arch.x86 */ && osArch !== 1 /* Arch.x86 */ ? 'SysNative' : 'System32', 'WindowsPowerShell', 'v1.0', 'powershell.exe');
        return new PossiblePowerShellExe(winPSPath, 'Windows PowerShell', true);
    }
    /**
     * Iterates through all the possible well-known PowerShell installations on a machine.
     * Returned values may not exist, but come with an .exists property
     * which will check whether the executable exists.
     */
    async function* enumerateDefaultPowerShellInstallations() {
        // Find PSCore stable first
        let pwshExe = await findPSCoreWindowsInstallation();
        if (pwshExe) {
            yield pwshExe;
        }
        // Windows may have a 32-bit pwsh.exe
        pwshExe = await findPSCoreWindowsInstallation({ useAlternateBitness: true });
        if (pwshExe) {
            yield pwshExe;
        }
        // Also look for the MSIX/UWP installation
        pwshExe = await findPSCoreMsix();
        if (pwshExe) {
            yield pwshExe;
        }
        // Look for the .NET global tool
        // Some older versions of PowerShell have a bug in this where startup will fail,
        // but this is fixed in newer versions
        pwshExe = findPSCoreDotnetGlobalTool();
        if (pwshExe) {
            yield pwshExe;
        }
        // Look for PSCore preview
        pwshExe = await findPSCoreWindowsInstallation({ findPreview: true });
        if (pwshExe) {
            yield pwshExe;
        }
        // Find a preview MSIX
        pwshExe = await findPSCoreMsix({ findPreview: true });
        if (pwshExe) {
            yield pwshExe;
        }
        // Look for pwsh-preview with the opposite bitness
        pwshExe = await findPSCoreWindowsInstallation({ useAlternateBitness: true, findPreview: true });
        if (pwshExe) {
            yield pwshExe;
        }
        // Finally, get Windows PowerShell
        pwshExe = findWinPS();
        if (pwshExe) {
            yield pwshExe;
        }
    }
    /**
     * Iterates through PowerShell installations on the machine according
     * to configuration passed in through the constructor.
     * PowerShell items returned by this object are verified
     * to exist on the filesystem.
     */
    async function* enumeratePowerShellInstallations() {
        // Get the default PowerShell installations first
        for await (const defaultPwsh of enumerateDefaultPowerShellInstallations()) {
            if (await defaultPwsh.exists()) {
                yield defaultPwsh;
            }
        }
    }
    exports.enumeratePowerShellInstallations = enumeratePowerShellInstallations;
    /**
    * Returns the first available PowerShell executable found in the search order.
    */
    async function getFirstAvailablePowerShellInstallation() {
        for await (const pwsh of enumeratePowerShellInstallations()) {
            return pwsh;
        }
        return null;
    }
    exports.getFirstAvailablePowerShellInstallation = getFirstAvailablePowerShellInstallation;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG93ZXJzaGVsbC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL2Jhc2Uvbm9kZS9wb3dlcnNoZWxsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQU1oRywrREFBK0Q7SUFDL0QsTUFBTSxRQUFRLEdBQVcsT0FBTyxDQUFDO0lBRWpDLE1BQU0sYUFBYSxHQUFXLDBCQUEwQixDQUFDO0lBQ3pELE1BQU0sb0JBQW9CLEdBQVcsaUNBQWlDLENBQUM7SUFFdkUsSUFBVyxJQUlWO0lBSkQsV0FBVyxJQUFJO1FBQ2QsNkJBQUcsQ0FBQTtRQUNILDZCQUFHLENBQUE7UUFDSCw2QkFBRyxDQUFBO0lBQ0osQ0FBQyxFQUpVLElBQUksS0FBSixJQUFJLFFBSWQ7SUFFRCxJQUFJLFdBQWlCLENBQUM7SUFDdEIsUUFBUSxPQUFPLENBQUMsSUFBSSxFQUFFO1FBQ3JCLEtBQUssTUFBTTtZQUNWLFdBQVcsbUJBQVcsQ0FBQztZQUN2QixNQUFNO1FBQ1AsS0FBSyxLQUFLLENBQUM7UUFDWCxLQUFLLE9BQU87WUFDWCxXQUFXLG1CQUFXLENBQUM7WUFDdkIsTUFBTTtRQUNQO1lBQ0MsV0FBVyxtQkFBVyxDQUFDO1lBQ3ZCLE1BQU07S0FDUDtJQUVEOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztNQTBCRTtJQUNGLElBQUksTUFBWSxDQUFDO0lBQ2pCLElBQUksT0FBTyxDQUFDLEdBQUcsQ0FBQyx3QkFBd0IsQ0FBQyxFQUFFO1FBQzFDLE1BQU0sR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLHdCQUF3QixDQUFDLEtBQUssT0FBTztZQUN6RCxDQUFDO1lBQ0QsQ0FBQyxpQkFBUyxDQUFDO0tBQ1o7U0FBTSxJQUFJLE9BQU8sQ0FBQyxHQUFHLENBQUMsd0JBQXdCLENBQUMsS0FBSyxPQUFPLEVBQUU7UUFDN0QsTUFBTSxtQkFBVyxDQUFDO0tBQ2xCO1NBQU0sSUFBSSxPQUFPLENBQUMsR0FBRyxDQUFDLHdCQUF3QixDQUFDLEtBQUssS0FBSyxFQUFFO1FBQzNELE1BQU0sbUJBQVcsQ0FBQztLQUNsQjtTQUFNO1FBQ04sTUFBTSxtQkFBVyxDQUFDO0tBQ2xCO0lBV0QsTUFBTSxxQkFBcUI7UUFDMUIsWUFDaUIsT0FBZSxFQUNmLFdBQW1CLEVBQzNCLFlBQXNCO1lBRmQsWUFBTyxHQUFQLE9BQU8sQ0FBUTtZQUNmLGdCQUFXLEdBQVgsV0FBVyxDQUFRO1lBQzNCLGlCQUFZLEdBQVosWUFBWSxDQUFVO1FBQUksQ0FBQztRQUU3QixLQUFLLENBQUMsTUFBTTtZQUNsQixJQUFJLElBQUksQ0FBQyxZQUFZLEtBQUssU0FBUyxFQUFFO2dCQUNwQyxJQUFJLENBQUMsWUFBWSxHQUFHLE1BQU0sR0FBRyxDQUFDLGNBQWMsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO2FBQ3RFO1lBQ0QsT0FBTyxJQUFJLENBQUMsWUFBWSxDQUFDO1FBQzFCLENBQUM7S0FDRDtJQUVELFNBQVMsbUJBQW1CLENBQzNCLEVBQUUsbUJBQW1CLEdBQUcsS0FBSyxLQUF3QyxFQUFFO1FBRXZFLElBQUksQ0FBQyxtQkFBbUIsRUFBRTtZQUN6QixxQ0FBcUM7WUFDckMsT0FBTyxPQUFPLENBQUMsR0FBRyxDQUFDLFlBQVksSUFBSSxJQUFJLENBQUM7U0FDeEM7UUFFRCxnRUFBZ0U7UUFDaEUsSUFBSSxXQUFXLHFCQUFhLEVBQUU7WUFDN0IsT0FBTyxPQUFPLENBQUMsR0FBRyxDQUFDLG1CQUFtQixDQUFDLElBQUksSUFBSSxDQUFDO1NBQ2hEO1FBRUQsZ0VBQWdFO1FBQ2hFLElBQUksTUFBTSxxQkFBYSxFQUFFO1lBQ3hCLE9BQU8sT0FBTyxDQUFDLEdBQUcsQ0FBQyxZQUFZLElBQUksSUFBSSxDQUFDO1NBQ3hDO1FBRUQsZ0ZBQWdGO1FBQ2hGLE9BQU8sSUFBSSxDQUFDO0lBQ2IsQ0FBQztJQUVELEtBQUssVUFBVSw2QkFBNkIsQ0FDM0MsRUFBRSxtQkFBbUIsR0FBRyxLQUFLLEVBQUUsV0FBVyxHQUFHLEtBQUssS0FDVSxFQUFFO1FBRTlELE1BQU0sZ0JBQWdCLEdBQUcsbUJBQW1CLENBQUMsRUFBRSxtQkFBbUIsRUFBRSxDQUFDLENBQUM7UUFDdEUsSUFBSSxDQUFDLGdCQUFnQixFQUFFO1lBQ3RCLE9BQU8sSUFBSSxDQUFDO1NBQ1o7UUFFRCxNQUFNLHdCQUF3QixHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsWUFBWSxDQUFDLENBQUM7UUFFM0UsbUNBQW1DO1FBQ25DLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxjQUFjLENBQUMsZUFBZSxDQUFDLHdCQUF3QixDQUFDLEVBQUU7WUFDeEUsT0FBTyxJQUFJLENBQUM7U0FDWjtRQUVELElBQUksa0JBQWtCLEdBQVcsQ0FBQyxDQUFDLENBQUM7UUFDcEMsSUFBSSxXQUFXLEdBQWtCLElBQUksQ0FBQztRQUN0QyxLQUFLLE1BQU0sSUFBSSxJQUFJLE1BQU0sR0FBRyxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsd0JBQXdCLENBQUMsRUFBRTtZQUV4RSxJQUFJLGNBQWMsR0FBVyxDQUFDLENBQUMsQ0FBQztZQUNoQyxJQUFJLFdBQVcsRUFBRTtnQkFDaEIsZ0RBQWdEO2dCQUVoRCx1Q0FBdUM7Z0JBQ3ZDLE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUM7Z0JBQ3BDLElBQUksU0FBUyxHQUFHLENBQUMsRUFBRTtvQkFDbEIsU0FBUztpQkFDVDtnQkFFRCxxREFBcUQ7Z0JBQ3JELGdEQUFnRDtnQkFDaEQsTUFBTSxPQUFPLEdBQVcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLEVBQUUsU0FBUyxDQUFDLENBQUM7Z0JBQ3JELElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLElBQUksQ0FBQyxTQUFTLENBQUMsU0FBUyxHQUFHLENBQUMsQ0FBQyxLQUFLLFNBQVMsRUFBRTtvQkFDM0UsU0FBUztpQkFDVDtnQkFFRCxjQUFjLEdBQUcsUUFBUSxDQUFDLE9BQU8sRUFBRSxFQUFFLENBQUMsQ0FBQzthQUN2QztpQkFBTTtnQkFDTix5Q0FBeUM7Z0JBQ3pDLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFO29CQUN6QixTQUFTO2lCQUNUO2dCQUVELGNBQWMsR0FBRyxRQUFRLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQyxDQUFDO2FBQ3BDO1lBRUQsa0RBQWtEO1lBQ2xELElBQUksY0FBYyxJQUFJLGtCQUFrQixFQUFFO2dCQUN6QyxTQUFTO2FBQ1Q7WUFFRCx3QkFBd0I7WUFDeEIsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyx3QkFBd0IsRUFBRSxJQUFJLEVBQUUsVUFBVSxDQUFDLENBQUM7WUFDdEUsSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLGNBQWMsQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLEVBQUU7Z0JBQ2xELFNBQVM7YUFDVDtZQUVELFdBQVcsR0FBRyxPQUFPLENBQUM7WUFDdEIsa0JBQWtCLEdBQUcsY0FBYyxDQUFDO1NBQ3BDO1FBRUQsSUFBSSxDQUFDLFdBQVcsRUFBRTtZQUNqQixPQUFPLElBQUksQ0FBQztTQUNaO1FBRUQsTUFBTSxPQUFPLEdBQVcsZ0JBQWdCLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztRQUN6RSxNQUFNLE9BQU8sR0FBVyxXQUFXLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDO1FBRXRELE9BQU8sSUFBSSxxQkFBcUIsQ0FBQyxXQUFXLEVBQUUsYUFBYSxPQUFPLEdBQUcsT0FBTyxFQUFFLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDdkYsQ0FBQztJQUVELEtBQUssVUFBVSxjQUFjLENBQUMsRUFBRSxXQUFXLEtBQWdDLEVBQUU7UUFDNUUsbURBQW1EO1FBQ25ELElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLFlBQVksRUFBRTtZQUM5QixPQUFPLElBQUksQ0FBQztTQUNaO1FBRUQsNkRBQTZEO1FBQzdELE1BQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxZQUFZLEVBQUUsV0FBVyxFQUFFLGFBQWEsQ0FBQyxDQUFDO1FBRW5GLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxjQUFjLENBQUMsZUFBZSxDQUFDLFVBQVUsQ0FBQyxFQUFFO1lBQzFELE9BQU8sSUFBSSxDQUFDO1NBQ1o7UUFFRCw2REFBNkQ7UUFDN0QsTUFBTSxFQUFFLGdCQUFnQixFQUFFLFlBQVksRUFBRSxHQUFHLFdBQVc7WUFDckQsQ0FBQyxDQUFDLEVBQUUsZ0JBQWdCLEVBQUUsb0JBQW9CLEVBQUUsWUFBWSxFQUFFLDRCQUE0QixFQUFFO1lBQ3hGLENBQUMsQ0FBQyxFQUFFLGdCQUFnQixFQUFFLGFBQWEsRUFBRSxZQUFZLEVBQUUsb0JBQW9CLEVBQUUsQ0FBQztRQUUzRSx1RUFBdUU7UUFDdkUsS0FBSyxNQUFNLE1BQU0sSUFBSSxNQUFNLEdBQUcsQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxFQUFFO1lBQzVELElBQUksZ0JBQWdCLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUFFO2dCQUNsQyxNQUFNLFlBQVksR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxNQUFNLEVBQUUsVUFBVSxDQUFDLENBQUM7Z0JBQy9ELE9BQU8sSUFBSSxxQkFBcUIsQ0FBQyxZQUFZLEVBQUUsWUFBWSxDQUFDLENBQUM7YUFDN0Q7U0FDRDtRQUVELGtDQUFrQztRQUNsQyxPQUFPLElBQUksQ0FBQztJQUNiLENBQUM7SUFFRCxTQUFTLDBCQUEwQjtRQUNsQyxNQUFNLHVCQUF1QixHQUFXLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLE9BQU8sRUFBRSxFQUFFLFNBQVMsRUFBRSxPQUFPLEVBQUUsVUFBVSxDQUFDLENBQUM7UUFFaEcsT0FBTyxJQUFJLHFCQUFxQixDQUFDLHVCQUF1QixFQUFFLGtDQUFrQyxDQUFDLENBQUM7SUFDL0YsQ0FBQztJQUVELFNBQVMsU0FBUztRQUNqQixNQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUMxQixPQUFPLENBQUMsR0FBRyxDQUFDLE1BQU8sRUFDbkIsV0FBVyxxQkFBYSxJQUFJLE1BQU0scUJBQWEsQ0FBQyxDQUFDLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxVQUFVLEVBQzFFLG1CQUFtQixFQUFFLE1BQU0sRUFBRSxnQkFBZ0IsQ0FBQyxDQUFDO1FBRWhELE9BQU8sSUFBSSxxQkFBcUIsQ0FBQyxTQUFTLEVBQUUsb0JBQW9CLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDekUsQ0FBQztJQUVEOzs7O09BSUc7SUFDSCxLQUFLLFNBQVMsQ0FBQyxDQUFDLHVDQUF1QztRQUN0RCwyQkFBMkI7UUFDM0IsSUFBSSxPQUFPLEdBQUcsTUFBTSw2QkFBNkIsRUFBRSxDQUFDO1FBQ3BELElBQUksT0FBTyxFQUFFO1lBQ1osTUFBTSxPQUFPLENBQUM7U0FDZDtRQUVELHFDQUFxQztRQUNyQyxPQUFPLEdBQUcsTUFBTSw2QkFBNkIsQ0FBQyxFQUFFLG1CQUFtQixFQUFFLElBQUksRUFBRSxDQUFDLENBQUM7UUFDN0UsSUFBSSxPQUFPLEVBQUU7WUFDWixNQUFNLE9BQU8sQ0FBQztTQUNkO1FBRUQsMENBQTBDO1FBQzFDLE9BQU8sR0FBRyxNQUFNLGNBQWMsRUFBRSxDQUFDO1FBQ2pDLElBQUksT0FBTyxFQUFFO1lBQ1osTUFBTSxPQUFPLENBQUM7U0FDZDtRQUVELGdDQUFnQztRQUNoQyxnRkFBZ0Y7UUFDaEYsc0NBQXNDO1FBQ3RDLE9BQU8sR0FBRywwQkFBMEIsRUFBRSxDQUFDO1FBQ3ZDLElBQUksT0FBTyxFQUFFO1lBQ1osTUFBTSxPQUFPLENBQUM7U0FDZDtRQUVELDBCQUEwQjtRQUMxQixPQUFPLEdBQUcsTUFBTSw2QkFBNkIsQ0FBQyxFQUFFLFdBQVcsRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDO1FBQ3JFLElBQUksT0FBTyxFQUFFO1lBQ1osTUFBTSxPQUFPLENBQUM7U0FDZDtRQUVELHNCQUFzQjtRQUN0QixPQUFPLEdBQUcsTUFBTSxjQUFjLENBQUMsRUFBRSxXQUFXLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQztRQUN0RCxJQUFJLE9BQU8sRUFBRTtZQUNaLE1BQU0sT0FBTyxDQUFDO1NBQ2Q7UUFFRCxrREFBa0Q7UUFDbEQsT0FBTyxHQUFHLE1BQU0sNkJBQTZCLENBQUMsRUFBRSxtQkFBbUIsRUFBRSxJQUFJLEVBQUUsV0FBVyxFQUFFLElBQUksRUFBRSxDQUFDLENBQUM7UUFDaEcsSUFBSSxPQUFPLEVBQUU7WUFDWixNQUFNLE9BQU8sQ0FBQztTQUNkO1FBRUQsa0NBQWtDO1FBQ2xDLE9BQU8sR0FBRyxTQUFTLEVBQUUsQ0FBQztRQUN0QixJQUFJLE9BQU8sRUFBRTtZQUNaLE1BQU0sT0FBTyxDQUFDO1NBQ2Q7SUFDRixDQUFDO0lBRUQ7Ozs7O09BS0c7SUFDSSxLQUFLLFNBQVMsQ0FBQyxDQUFDLGdDQUFnQztRQUN0RCxpREFBaUQ7UUFDakQsSUFBSSxLQUFLLEVBQUUsTUFBTSxXQUFXLElBQUksdUNBQXVDLEVBQUUsRUFBRTtZQUMxRSxJQUFJLE1BQU0sV0FBVyxDQUFDLE1BQU0sRUFBRSxFQUFFO2dCQUMvQixNQUFNLFdBQVcsQ0FBQzthQUNsQjtTQUNEO0lBQ0YsQ0FBQztJQVBELDRFQU9DO0lBRUQ7O01BRUU7SUFDSyxLQUFLLFVBQVUsdUNBQXVDO1FBQzVELElBQUksS0FBSyxFQUFFLE1BQU0sSUFBSSxJQUFJLGdDQUFnQyxFQUFFLEVBQUU7WUFDNUQsT0FBTyxJQUFJLENBQUM7U0FDWjtRQUNELE9BQU8sSUFBSSxDQUFDO0lBQ2IsQ0FBQztJQUxELDBGQUtDIn0=