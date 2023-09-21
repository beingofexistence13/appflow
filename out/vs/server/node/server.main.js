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
    const args = (0, argv_1.parseArgs)(process.argv.slice(2), serverEnvironmentService_1.serverOptions, errorReporter);
    const REMOTE_DATA_FOLDER = args['server-data-dir'] || process.env['VSCODE_AGENT_FOLDER'] || (0, path_1.join)(os.homedir(), product_1.default.serverDataFolderName || '.vscode-remote');
    const USER_DATA_PATH = args['user-data-dir'] || (0, path_1.join)(REMOTE_DATA_FOLDER, 'data');
    const APP_SETTINGS_HOME = (0, path_1.join)(USER_DATA_PATH, 'User');
    const GLOBAL_STORAGE_HOME = (0, path_1.join)(APP_SETTINGS_HOME, 'globalStorage');
    const LOCAL_HISTORY_HOME = (0, path_1.join)(APP_SETTINGS_HOME, 'History');
    const MACHINE_SETTINGS_HOME = (0, path_1.join)(USER_DATA_PATH, 'Machine');
    const APP_ROOT = (0, path_1.dirname)(network_1.FileAccess.asFileUri('').fsPath);
    const BUILTIN_EXTENSIONS_FOLDER_PATH = (0, path_1.join)(APP_ROOT, 'extensions');
    args['user-data-dir'] = USER_DATA_PATH;
    args['builtin-extensions-dir'] = BUILTIN_EXTENSIONS_FOLDER_PATH;
    args['extensions-dir'] = args['extensions-dir'] || (0, path_1.join)(REMOTE_DATA_FOLDER, 'extensions');
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
        (0, remoteExtensionHostAgentCli_1.run)(args, REMOTE_DATA_FOLDER, serverEnvironmentService_1.serverOptions);
    }
    exports.spawnCli = spawnCli;
    /**
     * invoked by server-main.js
     */
    function createServer(address) {
        return (0, remoteExtensionHostAgentServer_1.createServer)(address, args, REMOTE_DATA_FOLDER);
    }
    exports.createServer = createServer;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VydmVyLm1haW4uanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9zZXJ2ZXIvbm9kZS9zZXJ2ZXIubWFpbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFlaEcsSUFBSSxDQUFDLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxDQUFDO0lBQzlCLE1BQU8sQ0FBQywwQkFBMEIsR0FBRyx3QkFBVyxDQUFDLEdBQUcsRUFBRSxDQUFDO0lBRTdELE1BQU0sYUFBYSxHQUFrQjtRQUNwQyxnQkFBZ0IsRUFBRSxDQUFDLEVBQVUsRUFBRSxTQUFpQixFQUFFLEVBQUU7WUFDbkQsT0FBTyxDQUFDLEtBQUssQ0FBQyxXQUFXLEVBQUUsMkNBQTJDLFNBQVMsR0FBRyxDQUFDLENBQUM7UUFDckYsQ0FBQztRQUNELFlBQVksRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFO1lBQ3BCLE9BQU8sQ0FBQyxLQUFLLENBQUMsb0JBQW9CLEVBQUUsNkJBQTZCLENBQUMsQ0FBQztRQUNwRSxDQUFDO1FBQ0QsZUFBZSxFQUFFLENBQUMsRUFBVSxFQUFFLEVBQUU7WUFDL0IsT0FBTyxDQUFDLEtBQUssQ0FBQyxvQkFBb0IsRUFBRSw4QkFBOEIsQ0FBQyxDQUFDO1FBQ3JFLENBQUM7UUFDRCxrQkFBa0IsRUFBRSxDQUFDLGdCQUF3QixFQUFFLE9BQU8sRUFBRSxFQUFFO1lBQ3pELE9BQU8sQ0FBQyxJQUFJLENBQUMsV0FBVyxnQkFBZ0Isb0JBQW9CLE9BQU8sRUFBRSxDQUFDLENBQUM7UUFDeEUsQ0FBQztLQUNELENBQUM7SUFFRixNQUFNLElBQUksR0FBRyxJQUFBLGdCQUFTLEVBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUUsd0NBQWEsRUFBRSxhQUFhLENBQUMsQ0FBQztJQUU1RSxNQUFNLGtCQUFrQixHQUFHLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLE9BQU8sQ0FBQyxHQUFHLENBQUMscUJBQXFCLENBQUMsSUFBSSxJQUFBLFdBQUksRUFBQyxFQUFFLENBQUMsT0FBTyxFQUFFLEVBQUUsaUJBQU8sQ0FBQyxvQkFBb0IsSUFBSSxnQkFBZ0IsQ0FBQyxDQUFDO0lBQ2pLLE1BQU0sY0FBYyxHQUFHLElBQUksQ0FBQyxlQUFlLENBQUMsSUFBSSxJQUFBLFdBQUksRUFBQyxrQkFBa0IsRUFBRSxNQUFNLENBQUMsQ0FBQztJQUNqRixNQUFNLGlCQUFpQixHQUFHLElBQUEsV0FBSSxFQUFDLGNBQWMsRUFBRSxNQUFNLENBQUMsQ0FBQztJQUN2RCxNQUFNLG1CQUFtQixHQUFHLElBQUEsV0FBSSxFQUFDLGlCQUFpQixFQUFFLGVBQWUsQ0FBQyxDQUFDO0lBQ3JFLE1BQU0sa0JBQWtCLEdBQUcsSUFBQSxXQUFJLEVBQUMsaUJBQWlCLEVBQUUsU0FBUyxDQUFDLENBQUM7SUFDOUQsTUFBTSxxQkFBcUIsR0FBRyxJQUFBLFdBQUksRUFBQyxjQUFjLEVBQUUsU0FBUyxDQUFDLENBQUM7SUFDOUQsTUFBTSxRQUFRLEdBQUcsSUFBQSxjQUFPLEVBQUMsb0JBQVUsQ0FBQyxTQUFTLENBQUMsRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDMUQsTUFBTSw4QkFBOEIsR0FBRyxJQUFBLFdBQUksRUFBQyxRQUFRLEVBQUUsWUFBWSxDQUFDLENBQUM7SUFDcEUsSUFBSSxDQUFDLGVBQWUsQ0FBQyxHQUFHLGNBQWMsQ0FBQztJQUN2QyxJQUFJLENBQUMsd0JBQXdCLENBQUMsR0FBRyw4QkFBOEIsQ0FBQztJQUNoRSxJQUFJLENBQUMsZ0JBQWdCLENBQUMsR0FBRyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxJQUFBLFdBQUksRUFBQyxrQkFBa0IsRUFBRSxZQUFZLENBQUMsQ0FBQztJQUUxRixDQUFDLGtCQUFrQixFQUFFLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxFQUFFLGNBQWMsRUFBRSxpQkFBaUIsRUFBRSxxQkFBcUIsRUFBRSxtQkFBbUIsRUFBRSxrQkFBa0IsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsRUFBRTtRQUMzSixJQUFJO1lBQ0gsSUFBSSxDQUFDLEVBQUUsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLEVBQUU7Z0JBQ3RCLEVBQUUsQ0FBQyxTQUFTLENBQUMsQ0FBQyxFQUFFLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxDQUFDLENBQUM7YUFDakM7U0FDRDtRQUFDLE9BQU8sR0FBRyxFQUFFO1lBQUUsT0FBTyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztTQUFFO0lBQ3RDLENBQUMsQ0FBQyxDQUFDO0lBRUg7O09BRUc7SUFDSCxTQUFnQixRQUFRO1FBQ3ZCLElBQUEsaUNBQU0sRUFBQyxJQUFJLEVBQUUsa0JBQWtCLEVBQUUsd0NBQWEsQ0FBQyxDQUFDO0lBQ2pELENBQUM7SUFGRCw0QkFFQztJQUVEOztPQUVHO0lBQ0gsU0FBZ0IsWUFBWSxDQUFDLE9BQXdDO1FBQ3BFLE9BQU8sSUFBQSw2Q0FBYyxFQUFDLE9BQU8sRUFBRSxJQUFJLEVBQUUsa0JBQWtCLENBQUMsQ0FBQztJQUMxRCxDQUFDO0lBRkQsb0NBRUMifQ==