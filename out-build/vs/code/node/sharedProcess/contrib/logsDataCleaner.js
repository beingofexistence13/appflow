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
define(["require", "exports", "vs/base/common/async", "vs/base/common/errors", "vs/base/common/lifecycle", "vs/base/common/network", "vs/base/common/path", "vs/base/common/resources", "vs/base/node/pfs", "vs/platform/environment/common/environment", "vs/platform/log/common/log"], function (require, exports, async_1, errors_1, lifecycle_1, network_1, path_1, resources_1, pfs_1, environment_1, log_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$O7b = void 0;
    let $O7b = class $O7b extends lifecycle_1.$kc {
        constructor(a, b) {
            super();
            this.a = a;
            this.b = b;
            const scheduler = this.B(new async_1.$Sg(() => {
                this.c();
            }, 10 * 1000 /* after 10s */));
            scheduler.schedule();
        }
        async c() {
            this.b.trace('[logs cleanup]: Starting to clean up old logs.');
            try {
                const currentLog = (0, resources_1.$fg)(this.a.logsHome);
                const logsRoot = (0, resources_1.$hg)(this.a.logsHome.with({ scheme: network_1.Schemas.file })).fsPath;
                const logFiles = await pfs_1.Promises.readdir(logsRoot);
                const allSessions = logFiles.filter(logFile => /^\d{8}T\d{6}$/.test(logFile));
                const oldSessions = allSessions.sort().filter(session => session !== currentLog);
                const sessionsToDelete = oldSessions.slice(0, Math.max(0, oldSessions.length - 9));
                if (sessionsToDelete.length > 0) {
                    this.b.trace(`[logs cleanup]: Removing log folders '${sessionsToDelete.join(', ')}'`);
                    await Promise.all(sessionsToDelete.map(sessionToDelete => pfs_1.Promises.rm((0, path_1.$9d)(logsRoot, sessionToDelete))));
                }
            }
            catch (error) {
                (0, errors_1.$Y)(error);
            }
        }
    };
    exports.$O7b = $O7b;
    exports.$O7b = $O7b = __decorate([
        __param(0, environment_1.$Ih),
        __param(1, log_1.$5i)
    ], $O7b);
});
//# sourceMappingURL=logsDataCleaner.js.map