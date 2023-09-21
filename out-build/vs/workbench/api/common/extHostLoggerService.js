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
define(["require", "exports", "vs/platform/log/common/log", "vs/workbench/api/common/extHost.protocol", "vs/workbench/api/common/extHostInitDataService", "vs/workbench/api/common/extHostRpcService", "vs/base/common/uri", "vs/base/common/marshalling"], function (require, exports, log_1, extHost_protocol_1, extHostInitDataService_1, extHostRpcService_1, uri_1, marshalling_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$bdc = void 0;
    let $bdc = class $bdc extends log_1.$dj {
        constructor(rpc, initData) {
            super(initData.logLevel, initData.logsLocation, initData.loggers.map(logger => (0, marshalling_1.$$g)(logger)));
            this.r = rpc.getProxy(extHost_protocol_1.$1J.MainThreadLogger);
        }
        $setLogLevel(logLevel, resource) {
            if (resource) {
                this.setLogLevel(uri_1.URI.revive(resource), logLevel);
            }
            else {
                this.setLogLevel(logLevel);
            }
        }
        setVisibility(resource, visibility) {
            super.setVisibility(resource, visibility);
            this.r.$setVisibility(resource, visibility);
        }
        s(resource, logLevel, options) {
            return new Logger(this.r, resource, logLevel, options);
        }
    };
    exports.$bdc = $bdc;
    exports.$bdc = $bdc = __decorate([
        __param(0, extHostRpcService_1.$2L),
        __param(1, extHostInitDataService_1.$fM)
    ], $bdc);
    class Logger extends log_1.$$i {
        constructor(r, s, logLevel, loggerOptions) {
            super(loggerOptions?.logLevel === 'always');
            this.r = r;
            this.s = s;
            this.m = false;
            this.n = [];
            this.setLevel(logLevel);
            this.r.$createLogger(s, loggerOptions)
                .then(() => {
                this.u(this.n);
                this.m = true;
            });
        }
        g(level, message) {
            const messages = [[level, message]];
            if (this.m) {
                this.u(messages);
            }
            else {
                this.n.push(...messages);
            }
        }
        u(messages) {
            this.r.$log(this.s, messages);
        }
        flush() {
            this.r.$flush(this.s);
        }
    }
});
//# sourceMappingURL=extHostLoggerService.js.map