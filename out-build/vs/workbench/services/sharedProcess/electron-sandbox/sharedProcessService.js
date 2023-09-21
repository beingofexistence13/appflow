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
define(["require", "exports", "vs/base/parts/ipc/common/ipc.mp", "vs/base/parts/ipc/common/ipc", "vs/platform/log/common/log", "vs/base/common/lifecycle", "vs/platform/sharedProcess/common/sharedProcess", "vs/base/common/performance", "vs/base/common/async", "vs/base/parts/ipc/electron-sandbox/ipc.mp"], function (require, exports, ipc_mp_1, ipc_1, log_1, lifecycle_1, sharedProcess_1, performance_1, async_1, ipc_mp_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$7$b = void 0;
    let $7$b = class $7$b extends lifecycle_1.$kc {
        constructor(windowId, c) {
            super();
            this.windowId = windowId;
            this.c = c;
            this.b = new async_1.$Fg();
            this.a = this.f();
        }
        async f() {
            this.c.trace('Renderer->SharedProcess#connect');
            // Our performance tests show that a connection to the shared
            // process can have significant overhead to the startup time
            // of the window because the shared process could be created
            // as a result. As such, make sure we await the `Restored`
            // phase before making a connection attempt, but also add a
            // timeout to be safe against possible deadlocks.
            await Promise.race([this.b.wait(), (0, async_1.$Hg)(2000)]);
            // Acquire a message port connected to the shared process
            (0, performance_1.mark)('code/willConnectSharedProcess');
            this.c.trace('Renderer->SharedProcess#connect: before acquirePort');
            const port = await (0, ipc_mp_2.$6S)(sharedProcess_1.$x6b.request, sharedProcess_1.$x6b.response);
            (0, performance_1.mark)('code/didConnectSharedProcess');
            this.c.trace('Renderer->SharedProcess#connect: connection established');
            return this.B(new ipc_mp_1.$YS(port, `window:${this.windowId}`));
        }
        notifyRestored() {
            if (!this.b.isOpen()) {
                this.b.open();
            }
        }
        getChannel(channelName) {
            return (0, ipc_1.$hh)(this.a.then(connection => connection.getChannel(channelName)));
        }
        registerChannel(channelName, channel) {
            this.a.then(connection => connection.registerChannel(channelName, channel));
        }
        async createRawConnection() {
            // Await initialization of the shared process
            await this.a;
            // Create a new port to the shared process
            this.c.trace('Renderer->SharedProcess#createRawConnection: before acquirePort');
            const port = await (0, ipc_mp_2.$6S)(sharedProcess_1.$y6b.request, sharedProcess_1.$y6b.response);
            this.c.trace('Renderer->SharedProcess#createRawConnection: connection established');
            return port;
        }
    };
    exports.$7$b = $7$b;
    exports.$7$b = $7$b = __decorate([
        __param(1, log_1.$5i)
    ], $7$b);
});
//# sourceMappingURL=sharedProcessService.js.map