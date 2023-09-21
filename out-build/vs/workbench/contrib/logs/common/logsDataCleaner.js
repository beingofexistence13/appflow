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
define(["require", "exports", "vs/base/common/lifecycle", "vs/platform/files/common/files", "vs/base/common/resources", "vs/workbench/services/environment/common/environmentService", "vs/workbench/services/lifecycle/common/lifecycle", "vs/base/common/async"], function (require, exports, lifecycle_1, files_1, resources_1, environmentService_1, lifecycle_2, async_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$R4b = void 0;
    let $R4b = class $R4b extends lifecycle_1.$kc {
        constructor(a, b, c) {
            super();
            this.a = a;
            this.b = b;
            this.c = c;
            this.f();
        }
        f() {
            let handle = setTimeout(async () => {
                handle = undefined;
                const stat = await this.b.resolve((0, resources_1.$hg)(this.a.logsHome));
                if (stat.children) {
                    const currentLog = (0, resources_1.$fg)(this.a.logsHome);
                    const allSessions = stat.children.filter(stat => stat.isDirectory && /^\d{8}T\d{6}$/.test(stat.name));
                    const oldSessions = allSessions.sort().filter((d, i) => d.name !== currentLog);
                    const toDelete = oldSessions.slice(0, Math.max(0, oldSessions.length - 49));
                    async_1.Promises.settled(toDelete.map(stat => this.b.del(stat.resource, { recursive: true })));
                }
            }, 10 * 1000);
            this.c.onWillShutdown(() => {
                if (handle) {
                    clearTimeout(handle);
                    handle = undefined;
                }
            });
        }
    };
    exports.$R4b = $R4b;
    exports.$R4b = $R4b = __decorate([
        __param(0, environmentService_1.$hJ),
        __param(1, files_1.$6j),
        __param(2, lifecycle_2.$7y)
    ], $R4b);
});
//# sourceMappingURL=logsDataCleaner.js.map