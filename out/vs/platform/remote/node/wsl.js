/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "os", "child_process", "vs/base/node/pfs", "path"], function (require, exports, os, cp, pfs_1, path) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.hasWSLFeatureInstalled = void 0;
    let hasWSLFeaturePromise;
    async function hasWSLFeatureInstalled(refresh = false) {
        if (hasWSLFeaturePromise === undefined || refresh) {
            hasWSLFeaturePromise = testWSLFeatureInstalled();
        }
        return hasWSLFeaturePromise;
    }
    exports.hasWSLFeatureInstalled = hasWSLFeatureInstalled;
    async function testWSLFeatureInstalled() {
        const windowsBuildNumber = getWindowsBuildNumber();
        if (windowsBuildNumber === undefined) {
            return false;
        }
        if (windowsBuildNumber >= 22000) {
            const wslExePath = getWSLExecutablePath();
            if (wslExePath) {
                return new Promise(s => {
                    cp.execFile(wslExePath, ['--status'], err => s(!err));
                });
            }
        }
        else {
            const dllPath = getLxssManagerDllPath();
            if (dllPath) {
                try {
                    if ((await pfs_1.Promises.stat(dllPath)).isFile()) {
                        return true;
                    }
                }
                catch (e) {
                }
            }
        }
        return false;
    }
    function getWindowsBuildNumber() {
        const osVersion = (/(\d+)\.(\d+)\.(\d+)/g).exec(os.release());
        if (osVersion) {
            return parseInt(osVersion[3]);
        }
        return undefined;
    }
    function getSystem32Path(subPath) {
        const systemRoot = process.env['SystemRoot'];
        if (systemRoot) {
            const is32ProcessOn64Windows = process.env.hasOwnProperty('PROCESSOR_ARCHITEW6432');
            return path.join(systemRoot, is32ProcessOn64Windows ? 'Sysnative' : 'System32', subPath);
        }
        return undefined;
    }
    function getWSLExecutablePath() {
        return getSystem32Path('wsl.exe');
    }
    /**
     * In builds < 22000 this dll inidcates that WSL is installed
     */
    function getLxssManagerDllPath() {
        return getSystem32Path('lxss\\LxssManager.dll');
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid3NsLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvcGxhdGZvcm0vcmVtb3RlL25vZGUvd3NsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQU9oRyxJQUFJLG9CQUFrRCxDQUFDO0lBRWhELEtBQUssVUFBVSxzQkFBc0IsQ0FBQyxPQUFPLEdBQUcsS0FBSztRQUMzRCxJQUFJLG9CQUFvQixLQUFLLFNBQVMsSUFBSSxPQUFPLEVBQUU7WUFDbEQsb0JBQW9CLEdBQUcsdUJBQXVCLEVBQUUsQ0FBQztTQUNqRDtRQUNELE9BQU8sb0JBQW9CLENBQUM7SUFDN0IsQ0FBQztJQUxELHdEQUtDO0lBRUQsS0FBSyxVQUFVLHVCQUF1QjtRQUNyQyxNQUFNLGtCQUFrQixHQUFHLHFCQUFxQixFQUFFLENBQUM7UUFDbkQsSUFBSSxrQkFBa0IsS0FBSyxTQUFTLEVBQUU7WUFDckMsT0FBTyxLQUFLLENBQUM7U0FDYjtRQUNELElBQUksa0JBQWtCLElBQUksS0FBSyxFQUFFO1lBQ2hDLE1BQU0sVUFBVSxHQUFHLG9CQUFvQixFQUFFLENBQUM7WUFDMUMsSUFBSSxVQUFVLEVBQUU7Z0JBQ2YsT0FBTyxJQUFJLE9BQU8sQ0FBVSxDQUFDLENBQUMsRUFBRTtvQkFDL0IsRUFBRSxDQUFDLFFBQVEsQ0FBQyxVQUFVLEVBQUUsQ0FBQyxVQUFVLENBQUMsRUFBRSxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7Z0JBQ3ZELENBQUMsQ0FBQyxDQUFDO2FBQ0g7U0FDRDthQUFNO1lBQ04sTUFBTSxPQUFPLEdBQUcscUJBQXFCLEVBQUUsQ0FBQztZQUN4QyxJQUFJLE9BQU8sRUFBRTtnQkFDWixJQUFJO29CQUNILElBQUksQ0FBQyxNQUFNLGNBQVEsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxNQUFNLEVBQUUsRUFBRTt3QkFDNUMsT0FBTyxJQUFJLENBQUM7cUJBQ1o7aUJBQ0Q7Z0JBQUMsT0FBTyxDQUFDLEVBQUU7aUJBQ1g7YUFDRDtTQUNEO1FBQ0QsT0FBTyxLQUFLLENBQUM7SUFDZCxDQUFDO0lBRUQsU0FBUyxxQkFBcUI7UUFDN0IsTUFBTSxTQUFTLEdBQUcsQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQztRQUM5RCxJQUFJLFNBQVMsRUFBRTtZQUNkLE9BQU8sUUFBUSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1NBQzlCO1FBQ0QsT0FBTyxTQUFTLENBQUM7SUFDbEIsQ0FBQztJQUVELFNBQVMsZUFBZSxDQUFDLE9BQWU7UUFDdkMsTUFBTSxVQUFVLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQztRQUM3QyxJQUFJLFVBQVUsRUFBRTtZQUNmLE1BQU0sc0JBQXNCLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxjQUFjLENBQUMsd0JBQXdCLENBQUMsQ0FBQztZQUNwRixPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLHNCQUFzQixDQUFDLENBQUMsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLFVBQVUsRUFBRSxPQUFPLENBQUMsQ0FBQztTQUN6RjtRQUNELE9BQU8sU0FBUyxDQUFDO0lBQ2xCLENBQUM7SUFFRCxTQUFTLG9CQUFvQjtRQUM1QixPQUFPLGVBQWUsQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUNuQyxDQUFDO0lBRUQ7O09BRUc7SUFDSCxTQUFTLHFCQUFxQjtRQUM3QixPQUFPLGVBQWUsQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDO0lBQ2pELENBQUMifQ==