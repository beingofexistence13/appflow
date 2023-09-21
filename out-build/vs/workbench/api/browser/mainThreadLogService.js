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
define(["require", "exports", "vs/workbench/services/extensions/common/extHostCustomers", "vs/platform/log/common/log", "vs/base/common/lifecycle", "vs/workbench/api/common/extHost.protocol", "vs/base/common/uri", "vs/platform/commands/common/commands", "vs/platform/environment/common/environment"], function (require, exports, extHostCustomers_1, log_1, lifecycle_1, extHost_protocol_1, uri_1, commands_1, environment_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$xkb = void 0;
    let $xkb = class $xkb {
        constructor(extHostContext, b) {
            this.b = b;
            this.a = new lifecycle_1.$jc();
            const proxy = extHostContext.getProxy(extHost_protocol_1.$2J.ExtHostLogLevelServiceShape);
            this.a.add(b.onDidChangeLogLevel(arg => {
                if ((0, log_1.$7i)(arg)) {
                    proxy.$setLogLevel(arg);
                }
                else {
                    proxy.$setLogLevel(arg[1], arg[0]);
                }
            }));
        }
        $log(file, messages) {
            const logger = this.b.getLogger(uri_1.URI.revive(file));
            if (!logger) {
                throw new Error('Create the logger before logging');
            }
            for (const [level, message] of messages) {
                (0, log_1.log)(logger, level, message);
            }
        }
        async $createLogger(file, options) {
            this.b.createLogger(uri_1.URI.revive(file), options);
        }
        async $registerLogger(logResource) {
            this.b.registerLogger({
                ...logResource,
                resource: uri_1.URI.revive(logResource.resource)
            });
        }
        async $deregisterLogger(resource) {
            this.b.deregisterLogger(uri_1.URI.revive(resource));
        }
        async $setVisibility(resource, visible) {
            this.b.setVisibility(uri_1.URI.revive(resource), visible);
        }
        $flush(file) {
            const logger = this.b.getLogger(uri_1.URI.revive(file));
            if (!logger) {
                throw new Error('Create the logger before flushing');
            }
            logger.flush();
        }
        dispose() {
            this.a.dispose();
        }
    };
    exports.$xkb = $xkb;
    exports.$xkb = $xkb = __decorate([
        (0, extHostCustomers_1.$jbb)(extHost_protocol_1.$1J.MainThreadLogger),
        __param(1, log_1.$6i)
    ], $xkb);
    // --- Internal commands to improve extension test runs
    commands_1.$Gr.registerCommand('_extensionTests.setLogLevel', function (accessor, level) {
        const loggerService = accessor.get(log_1.$6i);
        const environmentService = accessor.get(environment_1.$Ih);
        if (environmentService.isExtensionDevelopment && !!environmentService.extensionTestsLocationURI) {
            const logLevel = (0, log_1.$ij)(level);
            if (logLevel !== undefined) {
                loggerService.setLogLevel(logLevel);
            }
        }
    });
    commands_1.$Gr.registerCommand('_extensionTests.getLogLevel', function (accessor) {
        const logService = accessor.get(log_1.$5i);
        return (0, log_1.$hj)(logService.getLevel());
    });
});
//# sourceMappingURL=mainThreadLogService.js.map