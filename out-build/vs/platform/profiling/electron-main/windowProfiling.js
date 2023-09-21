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
define(["require", "exports", "vs/base/common/async", "vs/platform/log/common/log"], function (require, exports, async_1, log_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$b6b = void 0;
    let $b6b = class $b6b {
        constructor(a, b, c) {
            this.a = a;
            this.b = b;
            this.c = c;
        }
        async inspect(duration) {
            await this.d();
            const inspector = this.a.webContents.debugger;
            await inspector.sendCommand('Profiler.start');
            this.c.warn('[perf] profiling STARTED', this.b);
            await (0, async_1.$Hg)(duration);
            const data = await inspector.sendCommand('Profiler.stop');
            this.c.warn('[perf] profiling DONE', this.b);
            await this.e();
            return data.profile;
        }
        async d() {
            const inspector = this.a.webContents.debugger;
            inspector.attach();
            await inspector.sendCommand('Profiler.enable');
        }
        async e() {
            const inspector = this.a.webContents.debugger;
            await inspector.sendCommand('Profiler.disable');
            inspector.detach();
        }
    };
    exports.$b6b = $b6b;
    exports.$b6b = $b6b = __decorate([
        __param(2, log_1.$5i)
    ], $b6b);
});
//# sourceMappingURL=windowProfiling.js.map