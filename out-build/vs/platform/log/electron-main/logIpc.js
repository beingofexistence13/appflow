/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/map", "vs/base/common/uri", "vs/platform/log/common/log"], function (require, exports, map_1, uri_1, log_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$76b = void 0;
    class $76b {
        constructor(b) {
            this.b = b;
            this.a = new map_1.$zi();
        }
        listen(_, event, windowId) {
            switch (event) {
                case 'onDidChangeLoggers': return windowId ? this.b.getOnDidChangeLoggersEvent(windowId) : this.b.onDidChangeLoggers;
                case 'onDidChangeLogLevel': return windowId ? this.b.getOnDidChangeLogLevelEvent(windowId) : this.b.onDidChangeLogLevel;
                case 'onDidChangeVisibility': return windowId ? this.b.getOnDidChangeVisibilityEvent(windowId) : this.b.onDidChangeVisibility;
            }
            throw new Error(`Event not found: ${event}`);
        }
        async call(_, command, arg) {
            switch (command) {
                case 'createLogger':
                    this.c(uri_1.URI.revive(arg[0]), arg[1], arg[2]);
                    return;
                case 'log': return this.e(uri_1.URI.revive(arg[0]), arg[1]);
                case 'consoleLog': return this.d(arg[0], arg[1]);
                case 'setLogLevel': return (0, log_1.$7i)(arg[0]) ? this.b.setLogLevel(arg[0]) : this.b.setLogLevel(uri_1.URI.revive(arg[0]), arg[1]);
                case 'setVisibility': return this.b.setVisibility(uri_1.URI.revive(arg[0]), arg[1]);
                case 'registerLogger': return this.b.registerLogger({ ...arg[0], resource: uri_1.URI.revive(arg[0].resource) }, arg[1]);
                case 'deregisterLogger': return this.b.deregisterLogger(uri_1.URI.revive(arg[0]));
            }
            throw new Error(`Call not found: ${command}`);
        }
        c(file, options, windowId) {
            this.a.set(file, this.b.createLogger(file, options, windowId));
        }
        d(level, args) {
            let consoleFn = console.log;
            switch (level) {
                case log_1.LogLevel.Error:
                    consoleFn = console.error;
                    break;
                case log_1.LogLevel.Warning:
                    consoleFn = console.warn;
                    break;
                case log_1.LogLevel.Info:
                    consoleFn = console.info;
                    break;
            }
            consoleFn.call(console, ...args);
        }
        e(file, messages) {
            const logger = this.a.get(file);
            if (!logger) {
                throw new Error('Create the logger before logging');
            }
            for (const [level, message] of messages) {
                (0, log_1.log)(logger, level, message);
            }
        }
    }
    exports.$76b = $76b;
});
//# sourceMappingURL=logIpc.js.map