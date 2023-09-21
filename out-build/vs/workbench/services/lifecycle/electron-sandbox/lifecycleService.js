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
define(["require", "exports", "vs/platform/lifecycle/common/lifecycle", "vs/workbench/services/lifecycle/common/lifecycle", "vs/platform/storage/common/storage", "vs/base/parts/sandbox/electron-sandbox/globals", "vs/platform/log/common/log", "vs/workbench/services/lifecycle/common/lifecycleService", "vs/platform/instantiation/common/extensions", "vs/platform/native/common/native", "vs/base/common/async", "vs/base/common/errorMessage", "vs/base/common/cancellation"], function (require, exports, lifecycle_1, lifecycle_2, storage_1, globals_1, log_1, lifecycleService_1, extensions_1, native_1, async_1, errorMessage_1, cancellation_1) {
    "use strict";
    var $D_b_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$D_b = void 0;
    let $D_b = class $D_b extends lifecycleService_1.$qU {
        static { $D_b_1 = this; }
        static { this.w = 5000; }
        static { this.y = 800; }
        constructor(z, storageService, logService) {
            super(logService, storageService);
            this.z = z;
            this.C();
        }
        C() {
            const windowId = this.z.windowId;
            // Main side indicates that window is about to unload, check for vetos
            globals_1.$M.on('vscode:onBeforeUnload', async (event, reply) => {
                this.s.trace(`[lifecycle] onBeforeUnload (reason: ${reply.reason})`);
                // trigger onBeforeShutdown events and veto collecting
                const veto = await this.D(reply.reason);
                // veto: cancel unload
                if (veto) {
                    this.s.trace('[lifecycle] onBeforeUnload prevented via veto');
                    // Indicate as event
                    this.h.fire();
                    globals_1.$M.send(reply.cancelChannel, windowId);
                }
                // no veto: allow unload
                else {
                    this.s.trace('[lifecycle] onBeforeUnload continues without veto');
                    this.r = reply.reason;
                    globals_1.$M.send(reply.okChannel, windowId);
                }
            });
            // Main side indicates that we will indeed shutdown
            globals_1.$M.on('vscode:onWillUnload', async (event, reply) => {
                this.s.trace(`[lifecycle] onWillUnload (reason: ${reply.reason})`);
                // trigger onWillShutdown events and joining
                await this.G(reply.reason);
                // trigger onDidShutdown event now that we know we will quit
                this.f.fire();
                // acknowledge to main side
                globals_1.$M.send(reply.replyChannel, windowId);
            });
        }
        async D(reason) {
            const logService = this.s;
            const vetos = [];
            const pendingVetos = new Set();
            let finalVeto = undefined;
            let finalVetoId = undefined;
            // before-shutdown event with veto support
            this.b.fire({
                reason,
                veto(value, id) {
                    vetos.push(value);
                    // Log any veto instantly
                    if (value === true) {
                        logService.info(`[lifecycle]: Shutdown was prevented (id: ${id})`);
                    }
                    // Track promise completion
                    else if (value instanceof Promise) {
                        pendingVetos.add(id);
                        value.then(veto => {
                            if (veto === true) {
                                logService.info(`[lifecycle]: Shutdown was prevented (id: ${id})`);
                            }
                        }).finally(() => pendingVetos.delete(id));
                    }
                },
                finalVeto(value, id) {
                    if (!finalVeto) {
                        finalVeto = value;
                        finalVetoId = id;
                    }
                    else {
                        throw new Error(`[lifecycle]: Final veto is already defined (id: ${id})`);
                    }
                }
            });
            const longRunningBeforeShutdownWarning = (0, async_1.$Ig)(() => {
                logService.warn(`[lifecycle] onBeforeShutdown is taking a long time, pending operations: ${Array.from(pendingVetos).join(', ')}`);
            }, $D_b_1.w);
            try {
                // First: run list of vetos in parallel
                let veto = await (0, lifecycle_1.$w3b)(vetos, error => this.F(error, reason));
                if (veto) {
                    return veto;
                }
                // Second: run the final veto if defined
                if (finalVeto) {
                    try {
                        pendingVetos.add(finalVetoId);
                        veto = await finalVeto();
                        if (veto) {
                            logService.info(`[lifecycle]: Shutdown was prevented by final veto (id: ${finalVetoId})`);
                        }
                    }
                    catch (error) {
                        veto = true; // treat error as veto
                        this.F(error, reason);
                    }
                }
                return veto;
            }
            finally {
                longRunningBeforeShutdownWarning.dispose();
            }
        }
        F(error, reason) {
            this.s.error(`[lifecycle]: Error during before-shutdown phase (error: ${(0, errorMessage_1.$mi)(error)})`);
            this.g.fire({ reason, error });
        }
        async G(reason) {
            const joiners = [];
            const pendingJoiners = new Set();
            const cts = new cancellation_1.$pd();
            this.c.fire({
                reason,
                token: cts.token,
                joiners: () => Array.from(pendingJoiners.values()),
                join(promise, joiner) {
                    joiners.push(promise);
                    // Track promise completion
                    pendingJoiners.add(joiner);
                    promise.finally(() => pendingJoiners.delete(joiner));
                },
                force: () => {
                    cts.dispose(true);
                }
            });
            const longRunningWillShutdownWarning = (0, async_1.$Ig)(() => {
                this.s.warn(`[lifecycle] onWillShutdown is taking a long time, pending operations: ${Array.from(pendingJoiners).map(joiner => joiner.id).join(', ')}`);
            }, $D_b_1.y);
            try {
                await (0, async_1.$vg)(async_1.Promises.settled(joiners), cts.token);
            }
            catch (error) {
                this.s.error(`[lifecycle]: Error during will-shutdown phase (error: ${(0, errorMessage_1.$mi)(error)})`); // this error will not prevent the shutdown
            }
            finally {
                longRunningWillShutdownWarning.dispose();
            }
        }
        shutdown() {
            return this.z.closeWindow();
        }
    };
    exports.$D_b = $D_b;
    exports.$D_b = $D_b = $D_b_1 = __decorate([
        __param(0, native_1.$05b),
        __param(1, storage_1.$Vo),
        __param(2, log_1.$5i)
    ], $D_b);
    (0, extensions_1.$mr)(lifecycle_2.$7y, $D_b, 0 /* InstantiationType.Eager */);
});
//# sourceMappingURL=lifecycleService.js.map