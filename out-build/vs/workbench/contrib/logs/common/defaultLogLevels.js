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
define(["require", "exports", "vs/platform/log/common/log", "vs/platform/instantiation/common/instantiation", "vs/workbench/services/environment/common/environmentService", "vs/platform/files/common/files", "vs/workbench/services/configuration/common/jsonEditing", "vs/base/common/types", "vs/platform/environment/common/environmentService", "vs/platform/instantiation/common/extensions", "vs/base/common/json"], function (require, exports, log_1, instantiation_1, environmentService_1, files_1, jsonEditing_1, types_1, environmentService_2, extensions_1, json_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$CLb = void 0;
    exports.$CLb = (0, instantiation_1.$Bh)('IDefaultLogLevelsService');
    let DefaultLogLevelsService = class DefaultLogLevelsService {
        constructor(a, b, c, d, e) {
            this.a = a;
            this.b = b;
            this.c = c;
            this.d = d;
            this.e = e;
        }
        async getDefaultLogLevels() {
            const argvLogLevel = await this.h();
            return {
                default: argvLogLevel?.default ?? this.i(),
                extensions: argvLogLevel?.extensions ?? this.j()
            };
        }
        async setDefaultLogLevel(defaultLogLevel, extensionId) {
            const argvLogLevel = await this.h() ?? {};
            if (extensionId) {
                extensionId = extensionId.toLowerCase();
                const argvLogLevel = await this.h() ?? {};
                const currentDefaultLogLevel = this.f(argvLogLevel, extensionId);
                argvLogLevel.extensions = argvLogLevel.extensions ?? [];
                const extension = argvLogLevel.extensions.find(([extension]) => extension === extensionId);
                if (extension) {
                    extension[1] = defaultLogLevel;
                }
                else {
                    argvLogLevel.extensions.push([extensionId, defaultLogLevel]);
                }
                await this.g(argvLogLevel);
                const extensionLoggers = [...this.e.getRegisteredLoggers()].filter(logger => logger.extensionId && logger.extensionId.toLowerCase() === extensionId);
                for (const { resource } of extensionLoggers) {
                    if (this.e.getLogLevel(resource) === currentDefaultLogLevel) {
                        this.e.setLogLevel(resource, defaultLogLevel);
                    }
                }
            }
            else {
                const currentLogLevel = this.f(argvLogLevel);
                argvLogLevel.default = defaultLogLevel;
                await this.g(argvLogLevel);
                if (this.e.getLogLevel() === currentLogLevel) {
                    this.e.setLogLevel(defaultLogLevel);
                }
            }
        }
        f(argvLogLevels, extension) {
            if (extension) {
                const extensionLogLevel = argvLogLevels.extensions?.find(([extensionId]) => extensionId === extension);
                if (extensionLogLevel) {
                    return extensionLogLevel[1];
                }
            }
            return argvLogLevels.default ?? (0, log_1.$gj)(this.a);
        }
        async g(logLevels) {
            const logLevelsValue = [];
            if (!(0, types_1.$qf)(logLevels.default)) {
                logLevelsValue.push((0, log_1.$hj)(logLevels.default));
            }
            for (const [extension, logLevel] of logLevels.extensions ?? []) {
                logLevelsValue.push(`${extension}:${(0, log_1.$hj)(logLevel)}`);
            }
            await this.c.write(this.a.argvResource, [{ path: ['log-level'], value: logLevelsValue.length ? logLevelsValue : undefined }], true);
        }
        async h() {
            const result = { extensions: [] };
            try {
                const content = await this.b.readFile(this.a.argvResource);
                const argv = (0, json_1.$Lm)(content.value.toString());
                const logLevels = (0, types_1.$jf)(argv['log-level']) ? [argv['log-level']] : Array.isArray(argv['log-level']) ? argv['log-level'] : [];
                for (const extensionLogLevel of logLevels) {
                    const matches = environmentService_2.$8l.exec(extensionLogLevel);
                    if (matches && matches[1] && matches[2]) {
                        const logLevel = (0, log_1.$ij)(matches[2]);
                        if (!(0, types_1.$qf)(logLevel)) {
                            result.extensions?.push([matches[1].toLowerCase(), logLevel]);
                        }
                    }
                    else {
                        const logLevel = (0, log_1.$ij)(extensionLogLevel);
                        if (!(0, types_1.$qf)(logLevel)) {
                            result.default = logLevel;
                        }
                    }
                }
            }
            catch (error) {
                if ((0, files_1.$jk)(error) !== 1 /* FileOperationResult.FILE_NOT_FOUND */) {
                    this.d.error(error);
                }
            }
            return !(0, types_1.$qf)(result.default) || result.extensions?.length ? result : undefined;
        }
        i() {
            return (0, log_1.$gj)(this.a);
        }
        j() {
            const result = [];
            for (const [extension, logLevelValue] of this.a.extensionLogLevel ?? []) {
                const logLevel = (0, log_1.$ij)(logLevelValue);
                if (!(0, types_1.$qf)(logLevel)) {
                    result.push([extension, logLevel]);
                }
            }
            return result;
        }
    };
    DefaultLogLevelsService = __decorate([
        __param(0, environmentService_1.$hJ),
        __param(1, files_1.$6j),
        __param(2, jsonEditing_1.$$fb),
        __param(3, log_1.$5i),
        __param(4, log_1.$6i)
    ], DefaultLogLevelsService);
    (0, extensions_1.$mr)(exports.$CLb, DefaultLogLevelsService, 1 /* InstantiationType.Delayed */);
});
//# sourceMappingURL=defaultLogLevels.js.map