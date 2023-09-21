/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "os", "fs", "vs/base/common/network", "vs/server/node/remoteExtensionHostAgentCli", "vs/server/node/remoteExtensionHostAgentServer", "vs/platform/environment/node/argv", "vs/base/common/path", "perf_hooks", "vs/server/node/serverEnvironmentService", "vs/platform/product/common/product", "vs/base/common/performance"], function (require, exports, os, fs, network_1, remoteExtensionHostAgentCli_1, remoteExtensionHostAgentServer_1, argv_1, path_1, perf_hooks_1, serverEnvironmentService_1, product_1, perf) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.createServer = exports.spawnCli = void 0;
    perf.mark('code/server/codeLoaded');
    global.vscodeServerCodeLoadedTime = perf_hooks_1.performance.now();
    const errorReporter = {
        onMultipleValues: (id, usedValue) => {
            console.error(`Option '${id}' can only be defined once. Using value ${usedValue}.`);
        },
        onEmptyValue: (id) => {
            console.error(`Ignoring option '${id}': Value must not be empty.`);
        },
        onUnknownOption: (id) => {
            console.error(`Ignoring option '${id}': not supported for server.`);
        },
        onDeprecatedOption: (deprecatedOption, message) => {
            console.warn(`Option '${deprecatedOption}' is deprecated: ${message}`);
        }
    };
    const args = (0, argv_1.$zl)(process.argv.slice(2), serverEnvironmentService_1.$cm, errorReporter);
    const REMOTE_DATA_FOLDER = args['server-data-dir'] || process.env['VSCODE_AGENT_FOLDER'] || (0, path_1.$9d)(os.homedir(), product_1.default.serverDataFolderName || '.vscode-remote');
    const USER_DATA_PATH = args['user-data-dir'] || (0, path_1.$9d)(REMOTE_DATA_FOLDER, 'data');
    const APP_SETTINGS_HOME = (0, path_1.$9d)(USER_DATA_PATH, 'User');
    const GLOBAL_STORAGE_HOME = (0, path_1.$9d)(APP_SETTINGS_HOME, 'globalStorage');
    const LOCAL_HISTORY_HOME = (0, path_1.$9d)(APP_SETTINGS_HOME, 'History');
    const MACHINE_SETTINGS_HOME = (0, path_1.$9d)(USER_DATA_PATH, 'Machine');
    const APP_ROOT = (0, path_1.$_d)(network_1.$2f.asFileUri('').fsPath);
    const BUILTIN_EXTENSIONS_FOLDER_PATH = (0, path_1.$9d)(APP_ROOT, 'extensions');
    args['user-data-dir'] = USER_DATA_PATH;
    args['builtin-extensions-dir'] = BUILTIN_EXTENSIONS_FOLDER_PATH;
    args['extensions-dir'] = args['extensions-dir'] || (0, path_1.$9d)(REMOTE_DATA_FOLDER, 'extensions');
    [REMOTE_DATA_FOLDER, args['extensions-dir'], USER_DATA_PATH, APP_SETTINGS_HOME, MACHINE_SETTINGS_HOME, GLOBAL_STORAGE_HOME, LOCAL_HISTORY_HOME].forEach(f => {
        try {
            if (!fs.existsSync(f)) {
                fs.mkdirSync(f, { mode: 0o700 });
            }
        }
        catch (err) {
            console.error(err);
        }
    });
    /**
     * invoked by server-main.js
     */
    function spawnCli() {
        (0, remoteExtensionHostAgentCli_1.run)(args, REMOTE_DATA_FOLDER, serverEnvironmentService_1.$cm);
    }
    exports.spawnCli = spawnCli;
    /**
     * invoked by server-main.js
     */
    function createServer(address) {
        return (0, remoteExtensionHostAgentServer_1.$AN)(address, args, REMOTE_DATA_FOLDER);
    }
    exports.createServer = createServer;
});
//# sourceMappingURL=server.main.js.map