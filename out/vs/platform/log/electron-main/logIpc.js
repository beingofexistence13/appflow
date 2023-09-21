/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/map", "vs/base/common/uri", "vs/platform/log/common/log"], function (require, exports, map_1, uri_1, log_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.LoggerChannel = void 0;
    class LoggerChannel {
        constructor(loggerService) {
            this.loggerService = loggerService;
            this.loggers = new map_1.ResourceMap();
        }
        listen(_, event, windowId) {
            switch (event) {
                case 'onDidChangeLoggers': return windowId ? this.loggerService.getOnDidChangeLoggersEvent(windowId) : this.loggerService.onDidChangeLoggers;
                case 'onDidChangeLogLevel': return windowId ? this.loggerService.getOnDidChangeLogLevelEvent(windowId) : this.loggerService.onDidChangeLogLevel;
                case 'onDidChangeVisibility': return windowId ? this.loggerService.getOnDidChangeVisibilityEvent(windowId) : this.loggerService.onDidChangeVisibility;
            }
            throw new Error(`Event not found: ${event}`);
        }
        async call(_, command, arg) {
            switch (command) {
                case 'createLogger':
                    this.createLogger(uri_1.URI.revive(arg[0]), arg[1], arg[2]);
                    return;
                case 'log': return this.log(uri_1.URI.revive(arg[0]), arg[1]);
                case 'consoleLog': return this.consoleLog(arg[0], arg[1]);
                case 'setLogLevel': return (0, log_1.isLogLevel)(arg[0]) ? this.loggerService.setLogLevel(arg[0]) : this.loggerService.setLogLevel(uri_1.URI.revive(arg[0]), arg[1]);
                case 'setVisibility': return this.loggerService.setVisibility(uri_1.URI.revive(arg[0]), arg[1]);
                case 'registerLogger': return this.loggerService.registerLogger({ ...arg[0], resource: uri_1.URI.revive(arg[0].resource) }, arg[1]);
                case 'deregisterLogger': return this.loggerService.deregisterLogger(uri_1.URI.revive(arg[0]));
            }
            throw new Error(`Call not found: ${command}`);
        }
        createLogger(file, options, windowId) {
            this.loggers.set(file, this.loggerService.createLogger(file, options, windowId));
        }
        consoleLog(level, args) {
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
        log(file, messages) {
            const logger = this.loggers.get(file);
            if (!logger) {
                throw new Error('Create the logger before logging');
            }
            for (const [level, message] of messages) {
                (0, log_1.log)(logger, level, message);
            }
        }
    }
    exports.LoggerChannel = LoggerChannel;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9nSXBjLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvcGxhdGZvcm0vbG9nL2VsZWN0cm9uLW1haW4vbG9nSXBjLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQVNoRyxNQUFhLGFBQWE7UUFJekIsWUFBNkIsYUFBaUM7WUFBakMsa0JBQWEsR0FBYixhQUFhLENBQW9CO1lBRjdDLFlBQU8sR0FBRyxJQUFJLGlCQUFXLEVBQVcsQ0FBQztRQUVZLENBQUM7UUFFbkUsTUFBTSxDQUFDLENBQVUsRUFBRSxLQUFhLEVBQUUsUUFBaUI7WUFDbEQsUUFBUSxLQUFLLEVBQUU7Z0JBQ2QsS0FBSyxvQkFBb0IsQ0FBQyxDQUFDLE9BQU8sUUFBUSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLDBCQUEwQixDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLGtCQUFrQixDQUFDO2dCQUM3SSxLQUFLLHFCQUFxQixDQUFDLENBQUMsT0FBTyxRQUFRLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsMkJBQTJCLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsbUJBQW1CLENBQUM7Z0JBQ2hKLEtBQUssdUJBQXVCLENBQUMsQ0FBQyxPQUFPLFFBQVEsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyw2QkFBNkIsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxxQkFBcUIsQ0FBQzthQUN0SjtZQUNELE1BQU0sSUFBSSxLQUFLLENBQUMsb0JBQW9CLEtBQUssRUFBRSxDQUFDLENBQUM7UUFDOUMsQ0FBQztRQUVELEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBVSxFQUFFLE9BQWUsRUFBRSxHQUFTO1lBQ2hELFFBQVEsT0FBTyxFQUFFO2dCQUNoQixLQUFLLGNBQWM7b0JBQUUsSUFBSSxDQUFDLFlBQVksQ0FBQyxTQUFHLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFBQyxPQUFPO2dCQUNuRixLQUFLLEtBQUssQ0FBQyxDQUFDLE9BQU8sSUFBSSxDQUFDLEdBQUcsQ0FBQyxTQUFHLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUN4RCxLQUFLLFlBQVksQ0FBQyxDQUFDLE9BQU8sSUFBSSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQzFELEtBQUssYUFBYSxDQUFDLENBQUMsT0FBTyxJQUFBLGdCQUFVLEVBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLFdBQVcsQ0FBQyxTQUFHLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUNwSixLQUFLLGVBQWUsQ0FBQyxDQUFDLE9BQU8sSUFBSSxDQUFDLGFBQWEsQ0FBQyxhQUFhLENBQUMsU0FBRyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDMUYsS0FBSyxnQkFBZ0IsQ0FBQyxDQUFDLE9BQU8sSUFBSSxDQUFDLGFBQWEsQ0FBQyxjQUFjLENBQUMsRUFBRSxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxRQUFRLEVBQUUsU0FBRyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLEVBQUUsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDOUgsS0FBSyxrQkFBa0IsQ0FBQyxDQUFDLE9BQU8sSUFBSSxDQUFDLGFBQWEsQ0FBQyxnQkFBZ0IsQ0FBQyxTQUFHLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7YUFDeEY7WUFFRCxNQUFNLElBQUksS0FBSyxDQUFDLG1CQUFtQixPQUFPLEVBQUUsQ0FBQyxDQUFDO1FBQy9DLENBQUM7UUFFTyxZQUFZLENBQUMsSUFBUyxFQUFFLE9BQXVCLEVBQUUsUUFBNEI7WUFDcEYsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxhQUFhLENBQUMsWUFBWSxDQUFDLElBQUksRUFBRSxPQUFPLEVBQUUsUUFBUSxDQUFDLENBQUMsQ0FBQztRQUNsRixDQUFDO1FBRU8sVUFBVSxDQUFDLEtBQWUsRUFBRSxJQUFXO1lBQzlDLElBQUksU0FBUyxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUM7WUFFNUIsUUFBUSxLQUFLLEVBQUU7Z0JBQ2QsS0FBSyxjQUFRLENBQUMsS0FBSztvQkFDbEIsU0FBUyxHQUFHLE9BQU8sQ0FBQyxLQUFLLENBQUM7b0JBQzFCLE1BQU07Z0JBQ1AsS0FBSyxjQUFRLENBQUMsT0FBTztvQkFDcEIsU0FBUyxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUM7b0JBQ3pCLE1BQU07Z0JBQ1AsS0FBSyxjQUFRLENBQUMsSUFBSTtvQkFDakIsU0FBUyxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUM7b0JBQ3pCLE1BQU07YUFDUDtZQUVELFNBQVMsQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLEdBQUcsSUFBSSxDQUFDLENBQUM7UUFDbEMsQ0FBQztRQUVPLEdBQUcsQ0FBQyxJQUFTLEVBQUUsUUFBOEI7WUFDcEQsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDdEMsSUFBSSxDQUFDLE1BQU0sRUFBRTtnQkFDWixNQUFNLElBQUksS0FBSyxDQUFDLGtDQUFrQyxDQUFDLENBQUM7YUFDcEQ7WUFDRCxLQUFLLE1BQU0sQ0FBQyxLQUFLLEVBQUUsT0FBTyxDQUFDLElBQUksUUFBUSxFQUFFO2dCQUN4QyxJQUFBLFNBQUcsRUFBQyxNQUFNLEVBQUUsS0FBSyxFQUFFLE9BQU8sQ0FBQyxDQUFDO2FBQzVCO1FBQ0YsQ0FBQztLQUNEO0lBNURELHNDQTREQyJ9