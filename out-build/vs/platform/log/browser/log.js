/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/resources", "vs/platform/log/common/log"], function (require, exports, resources_1, log_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$Z1b = exports.$Y1b = void 0;
    /**
     * Only used in browser contexts where the log files are not stored on disk
     * but in IndexedDB. A method to get all logs with their contents so that
     * CI automation can persist them.
     */
    async function $Y1b(fileService, environmentService) {
        const result = [];
        await doGetLogs(fileService, result, environmentService.logsHome, environmentService.logsHome);
        return result;
    }
    exports.$Y1b = $Y1b;
    async function doGetLogs(fileService, logs, curFolder, logsHome) {
        const stat = await fileService.resolve(curFolder);
        for (const { resource, isDirectory } of stat.children || []) {
            if (isDirectory) {
                await doGetLogs(fileService, logs, resource, logsHome);
            }
            else {
                const contents = (await fileService.readFile(resource)).value.toString();
                if (contents) {
                    const path = (0, resources_1.$kg)(logsHome, resource);
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
    class $Z1b extends log_1.$bj {
        constructor(logLevel = log_1.$8i) {
            super({ log: (level, args) => this.j(logLevelToString(level), args) }, logLevel);
        }
        j(type, args) {
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
    exports.$Z1b = $Z1b;
});
//# sourceMappingURL=log.js.map