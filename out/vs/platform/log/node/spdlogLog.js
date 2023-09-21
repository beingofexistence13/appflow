/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/files/common/files", "vs/platform/log/common/log"], function (require, exports, files_1, log_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SpdLogLogger = void 0;
    var SpdLogLevel;
    (function (SpdLogLevel) {
        SpdLogLevel[SpdLogLevel["Trace"] = 0] = "Trace";
        SpdLogLevel[SpdLogLevel["Debug"] = 1] = "Debug";
        SpdLogLevel[SpdLogLevel["Info"] = 2] = "Info";
        SpdLogLevel[SpdLogLevel["Warning"] = 3] = "Warning";
        SpdLogLevel[SpdLogLevel["Error"] = 4] = "Error";
        SpdLogLevel[SpdLogLevel["Critical"] = 5] = "Critical";
        SpdLogLevel[SpdLogLevel["Off"] = 6] = "Off";
    })(SpdLogLevel || (SpdLogLevel = {}));
    async function createSpdLogLogger(name, logfilePath, filesize, filecount, donotUseFormatters) {
        // Do not crash if spdlog cannot be loaded
        try {
            const _spdlog = await new Promise((resolve_1, reject_1) => { require(['@vscode/spdlog'], resolve_1, reject_1); });
            _spdlog.setFlushOn(SpdLogLevel.Trace);
            const logger = await _spdlog.createAsyncRotatingLogger(name, logfilePath, filesize, filecount);
            if (donotUseFormatters) {
                logger.clearFormatters();
            }
            else {
                logger.setPattern('%Y-%m-%d %H:%M:%S.%e [%l] %v');
            }
            return logger;
        }
        catch (e) {
            console.error(e);
        }
        return null;
    }
    function log(logger, level, message) {
        switch (level) {
            case log_1.LogLevel.Trace:
                logger.trace(message);
                break;
            case log_1.LogLevel.Debug:
                logger.debug(message);
                break;
            case log_1.LogLevel.Info:
                logger.info(message);
                break;
            case log_1.LogLevel.Warning:
                logger.warn(message);
                break;
            case log_1.LogLevel.Error:
                logger.error(message);
                break;
            case log_1.LogLevel.Off: /* do nothing */ break;
            default: throw new Error(`Invalid log level ${level}`);
        }
    }
    function setLogLevel(logger, level) {
        switch (level) {
            case log_1.LogLevel.Trace:
                logger.setLevel(SpdLogLevel.Trace);
                break;
            case log_1.LogLevel.Debug:
                logger.setLevel(SpdLogLevel.Debug);
                break;
            case log_1.LogLevel.Info:
                logger.setLevel(SpdLogLevel.Info);
                break;
            case log_1.LogLevel.Warning:
                logger.setLevel(SpdLogLevel.Warning);
                break;
            case log_1.LogLevel.Error:
                logger.setLevel(SpdLogLevel.Error);
                break;
            case log_1.LogLevel.Off:
                logger.setLevel(SpdLogLevel.Off);
                break;
            default: throw new Error(`Invalid log level ${level}`);
        }
    }
    class SpdLogLogger extends log_1.AbstractMessageLogger {
        constructor(name, filepath, rotating, donotUseFormatters, level) {
            super();
            this.buffer = [];
            this.setLevel(level);
            this._loggerCreationPromise = this._createSpdLogLogger(name, filepath, rotating, donotUseFormatters);
            this._register(this.onDidChangeLogLevel(level => {
                if (this._logger) {
                    setLogLevel(this._logger, level);
                }
            }));
        }
        async _createSpdLogLogger(name, filepath, rotating, donotUseFormatters) {
            const filecount = rotating ? 6 : 1;
            const filesize = (30 / filecount) * files_1.ByteSize.MB;
            const logger = await createSpdLogLogger(name, filepath, filesize, filecount, donotUseFormatters);
            if (logger) {
                this._logger = logger;
                setLogLevel(this._logger, this.getLevel());
                for (const { level, message } of this.buffer) {
                    log(this._logger, level, message);
                }
                this.buffer = [];
            }
        }
        log(level, message) {
            if (this._logger) {
                log(this._logger, level, message);
            }
            else if (this.getLevel() <= level) {
                this.buffer.push({ level, message });
            }
        }
        flush() {
            if (this._logger) {
                this._logger.flush();
            }
            else {
                this._loggerCreationPromise.then(() => this.flush());
            }
        }
        dispose() {
            if (this._logger) {
                this.disposeLogger();
            }
            else {
                this._loggerCreationPromise.then(() => this.disposeLogger());
            }
        }
        disposeLogger() {
            if (this._logger) {
                this._logger.drop();
                this._logger = undefined;
            }
        }
    }
    exports.SpdLogLogger = SpdLogLogger;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3BkbG9nTG9nLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvcGxhdGZvcm0vbG9nL25vZGUvc3BkbG9nTG9nLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQU1oRyxJQUFLLFdBUUo7SUFSRCxXQUFLLFdBQVc7UUFDZiwrQ0FBSyxDQUFBO1FBQ0wsK0NBQUssQ0FBQTtRQUNMLDZDQUFJLENBQUE7UUFDSixtREFBTyxDQUFBO1FBQ1AsK0NBQUssQ0FBQTtRQUNMLHFEQUFRLENBQUE7UUFDUiwyQ0FBRyxDQUFBO0lBQ0osQ0FBQyxFQVJJLFdBQVcsS0FBWCxXQUFXLFFBUWY7SUFFRCxLQUFLLFVBQVUsa0JBQWtCLENBQUMsSUFBWSxFQUFFLFdBQW1CLEVBQUUsUUFBZ0IsRUFBRSxTQUFpQixFQUFFLGtCQUEyQjtRQUNwSSwwQ0FBMEM7UUFDMUMsSUFBSTtZQUNILE1BQU0sT0FBTyxHQUFHLHNEQUFhLGdCQUFnQiwyQkFBQyxDQUFDO1lBQy9DLE9BQU8sQ0FBQyxVQUFVLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQ3RDLE1BQU0sTUFBTSxHQUFHLE1BQU0sT0FBTyxDQUFDLHlCQUF5QixDQUFDLElBQUksRUFBRSxXQUFXLEVBQUUsUUFBUSxFQUFFLFNBQVMsQ0FBQyxDQUFDO1lBQy9GLElBQUksa0JBQWtCLEVBQUU7Z0JBQ3ZCLE1BQU0sQ0FBQyxlQUFlLEVBQUUsQ0FBQzthQUN6QjtpQkFBTTtnQkFDTixNQUFNLENBQUMsVUFBVSxDQUFDLDhCQUE4QixDQUFDLENBQUM7YUFDbEQ7WUFDRCxPQUFPLE1BQU0sQ0FBQztTQUNkO1FBQUMsT0FBTyxDQUFDLEVBQUU7WUFDWCxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1NBQ2pCO1FBQ0QsT0FBTyxJQUFJLENBQUM7SUFDYixDQUFDO0lBT0QsU0FBUyxHQUFHLENBQUMsTUFBcUIs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