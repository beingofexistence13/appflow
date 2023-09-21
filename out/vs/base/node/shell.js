/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "os", "vs/base/common/platform", "vs/base/node/powershell", "vs/base/node/processes"], function (require, exports, os_1, platform, powershell_1, processes) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getSystemShell = void 0;
    /**
     * Gets the detected default shell for the _system_, not to be confused with VS Code's _default_
     * shell that the terminal uses by default.
     * @param os The platform to detect the shell of.
     */
    async function getSystemShell(os, env) {
        if (os === 1 /* platform.OperatingSystem.Windows */) {
            if (platform.isWindows) {
                return getSystemShellWindows();
            }
            // Don't detect Windows shell when not on Windows
            return processes.getWindowsShell(env);
        }
        return getSystemShellUnixLike(os, env);
    }
    exports.getSystemShell = getSystemShell;
    let _TERMINAL_DEFAULT_SHELL_UNIX_LIKE = null;
    function getSystemShellUnixLike(os, env) {
        // Only use $SHELL for the current OS
        if (platform.isLinux && os === 2 /* platform.OperatingSystem.Macintosh */ || platform.isMacintosh && os === 3 /* platform.OperatingSystem.Linux */) {
            return '/bin/bash';
        }
        if (!_TERMINAL_DEFAULT_SHELL_UNIX_LIKE) {
            let unixLikeTerminal;
            if (platform.isWindows) {
                unixLikeTerminal = '/bin/bash'; // for WSL
            }
            else {
                unixLikeTerminal = env['SHELL'];
                if (!unixLikeTerminal) {
                    try {
                        // It's possible for $SHELL to be unset, this API reads /etc/passwd. See https://github.com/github/codespaces/issues/1639
                        // Node docs: "Throws a SystemError if a user has no username or homedir."
                        unixLikeTerminal = (0, os_1.userInfo)().shell;
                    }
                    catch (err) { }
                }
                if (!unixLikeTerminal) {
                    unixLikeTerminal = 'sh';
                }
                // Some systems have $SHELL set to /bin/false which breaks the terminal
                if (unixLikeTerminal === '/bin/false') {
                    unixLikeTerminal = '/bin/bash';
                }
            }
            _TERMINAL_DEFAULT_SHELL_UNIX_LIKE = unixLikeTerminal;
        }
        return _TERMINAL_DEFAULT_SHELL_UNIX_LIKE;
    }
    let _TERMINAL_DEFAULT_SHELL_WINDOWS = null;
    async function getSystemShellWindows() {
        if (!_TERMINAL_DEFAULT_SHELL_WINDOWS) {
            _TERMINAL_DEFAULT_SHELL_WINDOWS = (await (0, powershell_1.getFirstAvailablePowerShellInstallation)()).exePath;
        }
        return _TERMINAL_DEFAULT_SHELL_WINDOWS;
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2hlbGwuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9iYXNlL25vZGUvc2hlbGwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBT2hHOzs7O09BSUc7SUFDSSxLQUFLLFVBQVUsY0FBYyxDQUFDLEVBQTRCLEVBQUUsR0FBaUM7UUFDbkcsSUFBSSxFQUFFLDZDQUFxQyxFQUFFO1lBQzVDLElBQUksUUFBUSxDQUFDLFNBQVMsRUFBRTtnQkFDdkIsT0FBTyxxQkFBcUIsRUFBRSxDQUFDO2FBQy9CO1lBQ0QsaURBQWlEO1lBQ2pELE9BQU8sU0FBUyxDQUFDLGVBQWUsQ0FBQyxHQUFHLENBQUMsQ0FBQztTQUN0QztRQUVELE9BQU8sc0JBQXNCLENBQUMsRUFBRSxFQUFFLEdBQUcsQ0FBQyxDQUFDO0lBQ3hDLENBQUM7SUFWRCx3Q0FVQztJQUVELElBQUksaUNBQWlDLEdBQWtCLElBQUksQ0FBQztJQUM1RCxTQUFTLHNCQUFzQixDQUFDLEVBQTRCLEVBQUUsR0FBaUM7UUFDOUYscUNBQXFDO1FBQ3JDLElBQUksUUFBUSxDQUFDLE9BQU8sSUFBSSxFQUFFLCtDQUF1QyxJQUFJLFFBQVEsQ0FBQyxXQUFXLElBQUksRUFBRSwyQ0FBbUMsRUFBRTtZQUNuSSxPQUFPLFdBQVcsQ0FBQztTQUNuQjtRQUVELElBQUksQ0FBQyxpQ0FBaUMsRUFBRTtZQUN2QyxJQUFJLGdCQUFvQyxDQUFDO1lBQ3pDLElBQUksUUFBUSxDQUFDLFNBQVMsRUFBRTtnQkFDdkIsZ0JBQWdCLEdBQUcsV0FBVyxDQUFDLENBQUMsVUFBVTthQUMxQztpQkFBTTtnQkFDTixnQkFBZ0IsR0FBRyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUM7Z0JBRWhDLElBQUksQ0FBQyxnQkFBZ0IsRUFBRTtvQkFDdEIsSUFBSTt3QkFDSCx5SEFBeUg7d0JBQ3pILDBFQUEwRTt3QkFDMUUsZ0JBQWdCLEdBQUcsSUFBQSxhQUFRLEdBQUUsQ0FBQyxLQUFLLENBQUM7cUJBQ3BDO29CQUFDLE9BQU8sR0FBRyxFQUFFLEdBQUc7aUJBQ2pCO2dCQUVELElBQUksQ0FBQyxnQkFBZ0IsRUFBRTtvQkFDdEIsZ0JBQWdCLEdBQUcsSUFBSSxDQUFDO2lCQUN4QjtnQkFFRCx1RUFBdUU7Z0JBQ3ZFLElBQUksZ0JBQWdCLEtBQUssWUFBWSxFQUFFO29CQUN0QyxnQkFBZ0IsR0FBRyxXQUFXLENBQUM7aUJBQy9CO2FBQ0Q7WUFDRCxpQ0FBaUMsR0FBRyxnQkFBZ0IsQ0FBQztTQUNyRDtRQUNELE9BQU8saUNBQWlDLENBQUM7SUFDMUMsQ0FBQztJQUVELElBQUksK0JBQStCLEdBQWtCLElBQUksQ0FBQztJQUMxRCxLQUFLLFVBQVUscUJBQXFCO1FBQ25DLElBQUksQ0FBQywrQkFBK0IsRUFBRTtZQUNyQywrQkFBK0IsR0FBRyxDQUFDLE1BQU0sSUFBQSxvREFBdUMsR0FBRSxDQUFFLENBQUMsT0FBTyxDQUFDO1NBQzdGO1FBQ0QsT0FBTywrQkFBK0IsQ0FBQztJQUN4QyxDQUFDIn0=