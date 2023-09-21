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
    exports.FileLoggerService = void 0;
    const MAX_FILE_SIZE = 5 * files_1.ByteSize.MB;
    let FileLogger = class FileLogger extends log_1.AbstractMessageLogger {
        constructor(resource, level, donotUseFormatters, fileService) {
            super();
            this.resource = resource;
            this.donotUseFormatters = donotUseFormatters;
            this.fileService = fileService;
            this.backupIndex = 1;
            this.buffer = '';
            this.setLevel(level);
            this.flushDelayer = new async_1.ThrottledDelayer(100 /* buffer saves over a short time */);
            this.initializePromise = this.initialize();
        }
        async flush() {
            if (!this.buffer) {
                return;
            }
            await this.initializePromise;
            let content = await this.loadContent();
            if (content.length > MAX_FILE_SIZE) {
                await this.fileService.writeFile(this.getBackupResource(), buffer_1.VSBuffer.fromString(content));
                content = '';
            }
            if (this.buffer) {
                content += this.buffer;
                this.buffer = '';
                await this.fileService.writeFile(this.resource, buffer_1.VSBuffer.fromString(content));
            }
        }
        async initialize() {
            try {
                await this.fileService.createFile(this.resource);
            }
            catch (error) {
                if (error.fileOperationResult !== 3 /* FileOperationResult.FILE_MODIFIED_SINCE */) {
                    throw error;
                }
            }
        }
        log(level, message) {
            if (this.donotUseFormatters) {
                this.buffer += message;
            }
            else {
                this.buffer += `${this.getCurrentTimestamp()} [${this.stringifyLogLevel(level)}] ${message}\n`;
            }
            this.flushDelayer.trigger(() => this.flush());
        }
        getCurrentTimestamp() {
            const toTwoDigits = (v) => v < 10 ? `0${v}` : v;
            const toThreeDigits = (v) => v < 10 ? `00${v}` : v < 100 ? `0${v}` : v;
            const currentTime = new Date();
            return `${currentTime.getFullYear()}-${toTwoDigits(currentTime.getMonth() + 1)}-${toTwoDigits(currentTime.getDate())} ${toTwoDigits(currentTime.getHours())}:${toTwoDigits(currentTime.getMinutes())}:${toTwoDigits(currentTime.getSeconds())}.${toThreeDigits(currentTime.getMilliseconds())}`;
        }
        getBackupResource() {
            this.backupIndex = this.backupIndex > 5 ? 1 : this.backupIndex;
            return (0, resources_1.joinPath)((0, resources_1.dirname)(this.resource), `${(0, resources_1.basename)(this.resource)}_${this.backupIndex++}`);
        }
        async loadContent() {
            try {
                const content = await this.fileService.readFile(this.resource);
                return content.value.toString();
            }
            catch (e) {
                return '';
            }
        }
        stringifyLogLevel(level) {
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
        __param(3, files_1.IFileService)
    ], FileLogger);
    class FileLoggerService extends log_1.AbstractLoggerService {
        constructor(logLevel, logsHome, fileService) {
            super(logLevel, logsHome);
            this.fileService = fileService;
        }
        doCreateLogger(resource, logLevel, options) {
            const logger = new bufferLog_1.BufferLogger(logLevel);
            (0, files_1.whenProviderRegistered)(resource, this.fileService).then(() => logger.logger = new FileLogger(resource, logger.getLevel(), !!options?.donotUseFormatters, this.fileService));
            return logger;
        }
    }
    exports.FileLoggerService = FileLoggerService;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmlsZUxvZy5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3BsYXRmb3JtL2xvZy9jb21tb24vZmlsZUxvZy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUFVaEcsTUFBTSxhQUFhLEdBQUcsQ0FBQyxHQUFHLGdCQUFRLENBQUMsRUFBRSxDQUFDO0lBRXRDLElBQU0sVUFBVSxHQUFoQixNQUFNLFVBQVcsU0FBUSwyQkFBcUI7UUFPN0MsWUFDa0IsUUFBYSxFQUM5QixLQUFlLEVBQ0Usa0JBQTJCLEVBQzlCLFdBQTBDO1lBRXhELEtBQUssRUFBRSxDQUFDO1lBTFMsYUFBUSxHQUFSLFFBQVEsQ0FBSztZQUViLHVCQUFrQixHQUFsQixrQkFBa0IsQ0FBUztZQUNiLGdCQUFXLEdBQVgsV0FBVyxDQUFjO1lBUGpELGdCQUFXLEdBQVcsQ0FBQyxDQUFDO1lBQ3hCLFdBQU0sR0FBVyxFQUFFLENBQUM7WUFTM0IsSUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUNyQixJQUFJLENBQUMsWUFBWSxHQUFHLElBQUksd0JBQWdCLENBQU8sR0FBRyxDQUFDLG9DQUFvQyxDQUFDLENBQUM7WUFDekYsSUFBSSxDQUFDLGlCQUFpQixHQUFHLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQztRQUM1QyxDQUFDO1FBRVEsS0FBSyxDQUFDLEtBQUs7WUFDbkIsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUU7Z0JBQ2pCLE9BQU87YUFDUDtZQUNELE1BQU0sSUFBSSxDQUFDLGlCQUFpQixDQUFDO1lBQzdCLElBQUksT0FBTyxHQUFHLE1BQU0sSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDO1lBQ3ZDLElBQUksT0FBTyxDQUFDLE1BQU0sR0FBRyxhQUFhLEVBQUU7Z0JBQ25DLE1BQU0sSUFBSSxDQUFDLFdBQVcsQ0FBQyxTQUFTLENBQUMsSUFBSSxD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