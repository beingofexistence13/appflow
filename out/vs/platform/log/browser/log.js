/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/resources", "vs/platform/log/common/log"], function (require, exports, resources_1, log_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ConsoleLogInAutomationLogger = exports.getLogs = void 0;
    /**
     * Only used in browser contexts where the log files are not stored on disk
     * but in IndexedDB. A method to get all logs with their contents so that
     * CI automation can persist them.
     */
    async function getLogs(fileService, environmentService) {
        const result = [];
        await doGetLogs(fileService, result, environmentService.logsHome, environmentService.logsHome);
        return result;
    }
    exports.getLogs = getLogs;
    async function doGetLogs(fileService, logs, curFolder, logsHome) {
        const stat = await fileService.resolve(curFolder);
        for (const { resource, isDirectory } of stat.children || []) {
            if (isDirectory) {
                await doGetLogs(fileService, logs, resource, logsHome);
            }
            else {
                const contents = (await fileService.readFile(resource)).value.toString();
                if (contents) {
                    const path = (0, resources_1.relativePath)(logsHome, resource);
                    if (path) {
                        logs.push({ relativePath: path, contents });
                    }
                }
            }
        }
    }
    function logLevelToString(level) {
        switch (level) {
            case log_1.LogLevel.Trace: return 'trace';
            case log_1.LogLevel.Debug: return 'debug';
            case log_1.LogLevel.Info: return 'info';
            case log_1.LogLevel.Warning: return 'warn';
            case log_1.LogLevel.Error: return 'error';
        }
        return 'info';
    }
    /**
     * A logger that is used when VSCode is running in the web with
     * an automation such as playwright. We expect a global codeAutomationLog
     * to be defined that we can use to log to.
     */
    class ConsoleLogInAutomationLogger extends log_1.AdapterLogger {
        constructor(logLevel = log_1.DEFAULT_LOG_LEVEL) {
            super({ log: (level, args) => this.consoleLog(logLevelToString(level), args) }, logLevel);
        }
        consoleLog(type, args) {
            const automatedWindow = window;
            if (typeof automatedWindow.codeAutomationLog === 'function') {
                try {
                    automatedWindow.codeAutomationLog(type, args);
                }
                catch (err) {
                    // see https://github.com/microsoft/vscode-test-web/issues/69
                    console.error('Problems writing to codeAutomationLog', err);
                }
            }
        }
    }
    exports.ConsoleLogInAutomationLogger = ConsoleLogInAutomationLogger;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9nLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvcGxhdGZvcm0vbG9nL2Jyb3dzZXIvbG9nLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQWtCaEc7Ozs7T0FJRztJQUNJLEtBQUssVUFBVSxPQUFPLENBQUMsV0FBeUIsRUFBRSxrQkFBdUM7UUFDL0YsTUFBTSxNQUFNLEdBQWUsRUFBRSxDQUFDO1FBRTlCLE1BQU0sU0FBUyxDQUFDLFdBQVcsRUFBRSxNQUFNLEVBQUUsa0JBQWtCLENBQUMsUUFBUSxFQUFFLGtCQUFrQixDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBRS9GLE9BQU8sTUFBTSxDQUFDO0lBQ2YsQ0FBQztJQU5ELDBCQU1DO0lBRUQsS0FBSyxVQUFVLFNBQVMsQ0FBQyxXQUF5QixFQUFFLElBQWdCLEVBQUUsU0FBYyxFQUFFLFFBQWE7UUFDbEcsTUFBTSxJQUFJLEdBQUcsTUFBTSxXQUFXLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBRWxELEtBQUssTUFBTSxFQUFFLFFBQVEsRUFBRSxXQUFXLEVBQUUsSUFBSSxJQUFJLENBQUMsUUFBUSxJQUFJLEVBQUUsRUFBRTtZQUM1RCxJQUFJLFdBQVcsRUFBRTtnQkFDaEIsTUFBTSxTQUFTLENBQUMsV0FBVyxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUUsUUFBUSxDQUFDLENBQUM7YUFDdkQ7aUJBQU07Z0JBQ04sTUFBTSxRQUFRLEdBQUcsQ0FBQyxNQUFNLFdBQVcsQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsUUFBUSxFQUFFLENBQUM7Z0JBQ3pFLElBQUksUUFBUSxFQUFFO29CQUNiLE1BQU0sSUFBSSxHQUFHLElBQUEsd0JBQVksRUFBQyxRQUFRLEVBQUUsUUFBUSxDQUFDLENBQUM7b0JBQzlDLElBQUksSUFBSSxFQUFFO3dCQUNULElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxZQUFZLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBRSxDQUFDLENBQUM7cUJBQzVDO2lCQUNEO2FBQ0Q7U0FDRDtJQUNGLENBQUM7SUFFRCxTQUFTLGdCQUFnQixDQUFDLEtBQWU7UUFDeEMsUUFBUSxLQUFLLEVBQUU7WUFDZCxLQUFLLGNBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxPQUFPLE9BQU8sQ0FBQztZQUNwQyxLQUFLLGNBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxPQUFPLE9BQU8sQ0FBQztZQUNwQyxLQUFLLGNBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxPQUFPLE1BQU0sQ0FBQztZQUNsQyxLQUFLLGNBQVEsQ0FBQyxPQUFPLENBQUMsQ0FBQyxPQUFPLE1BQU0sQ0FBQztZQUNyQyxLQUFLLGNBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxPQUFPLE9BQU8sQ0FBQztTQUNwQztRQUNELE9BQU8sTUFBTSxDQUFDO0lBQ2YsQ0FBQztJQUVEOzs7O09BSUc7SUFDSCxNQUFhLDRCQUE2QixTQUFRLG1CQUFhO1FBSTlELFlBQVksV0FBcUIsdUJBQWlCO1lBQ2pELEtBQUssQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLEtBQUssRUFBRSxJQUFJLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsZ0JBQWdCLENBQUMsS0FBSyxDQUFDLEVBQUUsSUFBSSxDQUFDLEVBQUUsRUFBRSxRQUFRLENBQUMsQ0FBQztRQUMzRixDQUFDO1FBRU8sVUFBVSxDQUFDLElBQVksRUFBRSxJQUFXO1lBQzNDLE1BQU0sZUFBZSxHQUFHLE1BQXFDLENBQUM7WUFDOUQsSUFBSSxPQUFPLGVBQWUsQ0FBQyxpQkFBaUIsS0FBSyxVQUFVLEVBQUU7Z0JBQzVELElBQUk7b0JBQ0gsZUFBZSxDQUFDLGlCQUFpQixDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQztpQkFDOUM7Z0JBQUMsT0FBTyxHQUFHLEVBQUU7b0JBQ2IsNkRBQTZEO29CQUM3RCxPQUFPLENBQUMsS0FBSyxDQUFDLHVDQUF1QyxFQUFFLEdBQUcsQ0FBQyxDQUFDO2lCQUM1RDthQUNEO1FBQ0YsQ0FBQztLQUNEO0lBbkJELG9FQW1CQyJ9