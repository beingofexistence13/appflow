/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/platform"], function (require, exports, platform_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.arch = exports.platform = exports.env = exports.cwd = void 0;
    let safeProcess;
    // Native sandbox environment
    if (typeof platform_1.globals.vscode !== 'undefined' && typeof platform_1.globals.vscode.process !== 'undefined') {
        const sandboxProcess = platform_1.globals.vscode.process;
        safeProcess = {
            get platform() { return sandboxProcess.platform; },
            get arch() { return sandboxProcess.arch; },
            get env() { return sandboxProcess.env; },
            cwd() { return sandboxProcess.cwd(); }
        };
    }
    // Native node.js environment
    else if (typeof process !== 'undefined') {
        safeProcess = {
            get platform() { return process.platform; },
            get arch() { return process.arch; },
            get env() { return process.env; },
            cwd() { return process.env['VSCODE_CWD'] || process.cwd(); }
        };
    }
    // Web environment
    else {
        safeProcess = {
            // Supported
            get platform() { return platform_1.isWindows ? 'win32' : platform_1.isMacintosh ? 'darwin' : 'linux'; },
            get arch() { return undefined; /* arch is undefined in web */ },
            // Unsupported
            get env() { return {}; },
            cwd() { return '/'; }
        };
    }
    /**
     * Provides safe access to the `cwd` property in node.js, sandboxed or web
     * environments.
     *
     * Note: in web, this property is hardcoded to be `/`.
     *
     * @skipMangle
     */
    exports.cwd = safeProcess.cwd;
    /**
     * Provides safe access to the `env` property in node.js, sandboxed or web
     * environments.
     *
     * Note: in web, this property is hardcoded to be `{}`.
     */
    exports.env = safeProcess.env;
    /**
     * Provides safe access to the `platform` property in node.js, sandboxed or web
     * environments.
     */
    exports.platform = safeProcess.platform;
    /**
     * Provides safe access to the `arch` method in node.js, sandboxed or web
     * environments.
     * Note: `arch` is `undefined` in web
     */
    exports.arch = safeProcess.arch;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJvY2Vzcy5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL2Jhc2UvY29tbW9uL3Byb2Nlc3MudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBSWhHLElBQUksV0FBc0UsQ0FBQztJQUczRSw2QkFBNkI7SUFDN0IsSUFBSSxPQUFPLGtCQUFPLENBQUMsTUFBTSxLQUFLLFdBQVcsSUFBSSxPQUFPLGtCQUFPLENBQUMsTUFBTSxDQUFDLE9BQU8sS0FBSyxXQUFXLEVBQUU7UUFDM0YsTUFBTSxjQUFjLEdBQWlCLGtCQUFPLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQztRQUM1RCxXQUFXLEdBQUc7WUFDYixJQUFJLFFBQVEsS0FBSyxPQUFPLGNBQWMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO1lBQ2xELElBQUksSUFBSSxLQUFLLE9BQU8sY0FBYyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7WUFDMUMsSUFBSSxHQUFHLEtBQUssT0FBTyxjQUFjLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUN4QyxHQUFHLEtBQUssT0FBTyxjQUFjLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDO1NBQ3RDLENBQUM7S0FDRjtJQUVELDZCQUE2QjtTQUN4QixJQUFJLE9BQU8sT0FBTyxLQUFLLFdBQVcsRUFBRTtRQUN4QyxXQUFXLEdBQUc7WUFDYixJQUFJLFFBQVEsS0FBSyxPQUFPLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO1lBQzNDLElBQUksSUFBSSxLQUFLLE9BQU8sT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7WUFDbkMsSUFBSSxHQUFHLEtBQUssT0FBTyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUNqQyxHQUFHLEtBQUssT0FBTyxPQUFPLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxJQUFJLE9BQU8sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUM7U0FDNUQsQ0FBQztLQUNGO0lBRUQsa0JBQWtCO1NBQ2I7UUFDSixXQUFXLEdBQUc7WUFFYixZQUFZO1lBQ1osSUFBSSxRQUFRLEtBQUssT0FBTyxvQkFBUyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLHNCQUFXLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztZQUNqRixJQUFJLElBQUksS0FBSyxPQUFPLFNBQVMsQ0FBQyxDQUFDLDhCQUE4QixDQUFDLENBQUM7WUFFL0QsY0FBYztZQUNkLElBQUksR0FBRyxLQUFLLE9BQU8sRUFBRSxDQUFDLENBQUMsQ0FBQztZQUN4QixHQUFHLEtBQUssT0FBTyxHQUFHLENBQUMsQ0FBQyxDQUFDO1NBQ3JCLENBQUM7S0FDRjtJQUVEOzs7Ozs7O09BT0c7SUFDVSxRQUFBLEdBQUcsR0FBRyxXQUFXLENBQUMsR0FBRyxDQUFDO0lBRW5DOzs7OztPQUtHO0lBQ1UsUUFBQSxHQUFHLEdBQUcsV0FBVyxDQUFDLEdBQUcsQ0FBQztJQUVuQzs7O09BR0c7SUFDVSxRQUFBLFFBQVEsR0FBRyxXQUFXLENBQUMsUUFBUSxDQUFDO0lBRTdDOzs7O09BSUc7SUFDVSxRQUFBLElBQUksR0FBRyxXQUFXLENBQUMsSUFBSSxDQUFDIn0=