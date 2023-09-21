/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", "vs/base/common/async", "vs/base/common/buffer", "vs/base/common/resources", "vs/platform/files/common/files", "vs/platform/log/common/bufferLog", "vs/platform/log/common/log"], function (require, exports, async_1, buffer_1, resources_1, files_1, bufferLog_1, log_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$02b = void 0;
    const MAX_FILE_SIZE = 5 * files_1.$Ak.MB;
    let FileLogger = class FileLogger extends log_1.$$i {
        constructor(t, level, u, w) {
            super();
            this.t = t;
            this.u = u;
            this.w = w;
            this.r = 1;
            this.s = '';
            this.setLevel(level);
            this.n = new async_1.$Eg(100 /* buffer saves over a short time */);
            this.m = this.y();
        }
        async flush() {
            if (!this.s) {
                return;
            }
            await this.m;
            let content = await this.F();
            if (content.length > MAX_FILE_SIZE) {
                await this.w.writeFile(this.D(), buffer_1.$Fd.fromString(content));
                content = '';
            }
            if (this.s) {
                content += this.s;
                this.s = '';
                await this.w.writeFile(this.t, buffer_1.$Fd.fromString(content));
            }
        }
        async y() {
            try {
                await this.w.createFile(this.t);
            }
            catch (error) {
                if (error.fileOperationResult !== 3 /* FileOperationResult.FILE_MODIFIED_SINCE */) {
                    throw error;
                }
            }
        }
        g(level, message) {
            if (this.u) {
                this.s += message;
            }
            else {
                this.s += `${this.C()} [${this.G(level)}] ${message}\n`;
            }
            this.n.trigger(() => this.flush());
        }
        C() {
            const toTwoDigits = (v) => v < 10 ? `0${v}` : v;
            const toThreeDigits = (v) => v < 10 ? `00${v}` : v < 100 ? `0${v}` : v;
            const currentTime = new Date();
            return `${currentTime.getFullYear()}-${toTwoDigits(currentTime.getMonth() + 1)}-${toTwoDigits(currentTime.getDate())} ${toTwoDigits(currentTime.getHours())}:${toTwoDigits(currentTime.getMinutes())}:${toTwoDigits(currentTime.getSeconds())}.${toThreeDigits(currentTime.getMilliseconds())}`;
        }
        D() {
            this.r = this.r > 5 ? 1 : this.r;
            return (0, resources_1.$ig)((0, resources_1.$hg)(this.t), `${(0, resources_1.$fg)(this.t)}_${this.r++}`);
        }
        async F() {
            try {
                const content = await this.w.readFile(this.t);
                return content.value.toString();
            }
            catch (e) {
                return '';
            }
        }
        G(level) {
            switch (level) {
                case log_1.LogLevel.Debug: return 'debug';
                case log_1.LogLevel.Error: return 'error';
                case log_1.LogLevel.Info: return 'info';
                case log_1.LogLevel.Trace: return 'trace';
                case log_1.LogLevel.Warning: return 'warning';
            }
            return '';
        }
    };
    FileLogger = __decorate([
        __param(3, files_1.$6j)
    ], FileLogger);
    class $02b extends log_1.$dj {
        constructor(logLevel, logsHome, r) {
            super(logLevel, logsHome);
            this.r = r;
        }
        s(resource, logLevel, options) {
            const logger = new bufferLog_1.$92b(logLevel);
            (0, files_1.$zk)(resource, this.r).then(() => logger.logger = new FileLogger(resource, logger.getLevel(), !!options?.donotUseFormatters, this.r));
            return logger;
        }
    }
    exports.$02b = $02b;
});
//# sourceMappingURL=fileLog.js.map