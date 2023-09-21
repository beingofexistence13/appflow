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
define(["require", "exports", "vs/base/common/resources", "vs/nls!vs/workbench/contrib/editSessions/common/editSessionsLogService", "vs/platform/environment/common/environment", "vs/platform/log/common/log", "vs/workbench/contrib/editSessions/common/editSessions"], function (require, exports, resources_1, nls_1, environment_1, log_1, editSessions_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$a1b = void 0;
    let $a1b = class $a1b extends log_1.$0i {
        constructor(loggerService, environmentService) {
            super();
            this.g = this.B(loggerService.createLogger((0, resources_1.$ig)(environmentService.logsHome, `${editSessions_1.$$Zb}.log`), { id: editSessions_1.$$Zb, name: (0, nls_1.localize)(0, null) }));
        }
        trace(message, ...args) {
            this.g.trace(message, ...args);
        }
        debug(message, ...args) {
            this.g.debug(message, ...args);
        }
        info(message, ...args) {
            this.g.info(message, ...args);
        }
        warn(message, ...args) {
            this.g.warn(message, ...args);
        }
        error(message, ...args) {
            this.g.error(message, ...args);
        }
        flush() {
            this.g.flush();
        }
    };
    exports.$a1b = $a1b;
    exports.$a1b = $a1b = __decorate([
        __param(0, log_1.$6i),
        __param(1, environment_1.$Ih)
    ], $a1b);
});
//# sourceMappingURL=editSessionsLogService.js.map