/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/files/common/files", "vs/platform/log/common/log"], function (require, exports, files_1, log_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$bN = void 0;
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
    class $bN extends log_1.$$i {
        constructor(name, filepath, rotating, donotUseFormatters, level) {
            super();
            this.m = [];
            this.setLevel(level);
            this.n = this.s(name, filepath, rotating, donotUseFormatters);
            this.B(this.onDidChangeLogLevel(level => {
                if (this.r) {
                    setLogLevel(this.r, level);
                }
            }));
        }
        async s(name, filepath, rotating, donotUseFormatters) {
            const filecount = rotating ? 6 : 1;
            const filesize = (30 / filecount) * files_1.$Ak.MB;
            const logger = await createSpdLogLogger(name, filepath, filesize, filecount, donotUseFormatters);
            if (logger) {
                this.r = logger;
                setLogLevel(this.r, this.getLevel());
                for (const { level, message } of this.m) {
                    log(this.r, level, message);
                }
                this.m = [];
            }
        }
        g(level, message) {
            if (this.r) {
                log(this.r, level, message);
            }
            else if (this.getLevel() <= level) {
                this.m.push({ level, message });
            }
        }
        flush() {
            if (this.r) {
                this.r.flush();
            }
            else {
                this.n.then(() => this.flush());
            }
        }
        dispose() {
            if (this.r) {
                this.u();
            }
            else {
                this.n.then(() => this.u());
            }
        }
        u() {
            if (this.r) {
                this.r.drop();
                this.r = undefined;
            }
        }
    }
    exports.$bN = $bN;
});
//# sourceMappingURL=spdlogLog.js.map