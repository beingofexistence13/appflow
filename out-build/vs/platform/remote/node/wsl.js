/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "os", "child_process", "vs/base/node/pfs", "path"], function (require, exports, os, cp, pfs_1, path) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$a6b = void 0;
    let hasWSLFeaturePromise;
    async function $a6b(refresh = false) {
        if (hasWSLFeaturePromise === undefined || refresh) {
            hasWSLFeaturePromise = testWSLFeatureInstalled();
        }
        return hasWSLFeaturePromise;
    }
    exports.$a6b = $a6b;
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
//# sourceMappingURL=wsl.js.map