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
    var NativeLifecycleService_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.NativeLifecycleService = void 0;
    let NativeLifecycleService = class NativeLifecycleService extends lifecycleService_1.AbstractLifecycleService {
        static { NativeLifecycleService_1 = this; }
        static { this.BEFORE_SHUTDOWN_WARNING_DELAY = 5000; }
        static { this.WILL_SHUTDOWN_WARNING_DELAY = 800; }
        constructor(nativeHostService, storageService, logService) {
            super(logService, storageService);
            this.nativeHostService = nativeHostService;
            this.registerListeners();
        }
        registerListeners() {
            const windowId = this.nativeHostService.windowId;
            // Main side indicates that window is about to unload, check for vetos
            globals_1.ipcRenderer.on('vscode:onBeforeUnload', async (event, reply) => {
                this.logService.trace(`[lifecycle] onBeforeUnload (reason: ${reply.reason})`);
                // trigger onBeforeShutdown events and veto collecting
                const veto = await this.handleBeforeShutdown(reply.reason);
                // veto: cancel unload
                if (veto) {
                    this.logService.trace('[lifecycle] onBeforeUnload prevented via veto');
                    // Indicate as event
                    this._onShutdownVeto.fire();
                    globals_1.ipcRenderer.send(reply.cancelChannel, windowId);
                }
                // no veto: allow unload
                else {
                    this.logService.trace('[lifecycle] onBeforeUnload continues without veto');
                    this.shutdownReason = reply.reason;
                    globals_1.ipcRenderer.send(reply.okChannel, windowId);
                }
            });
            // Main side indicates that we will indeed shutdown
            globals_1.ipcRenderer.on('vscode:onWillUnload', async (event, reply) => {
                this.logService.trace(`[lifecycle] onWillUnload (reason: ${reply.reason})`);
                // trigger onWillShutdown events and joining
                await this.handleWillShutdown(reply.reason);
                // trigger onDidShutdown event now that we know we will quit
                this._onDidShutdown.fire();
                // acknowledge to main side
                globals_1.ipcRenderer.send(reply.replyChannel, windowId);
            });
        }
        async handleBeforeShutdown(reason) {
            const logService = this.logService;
            const vetos = [];
            const pendingVetos = new Set();
            let finalVeto = undefined;
            let finalVetoId = undefined;
            // before-shutdown event with veto support
            this._onBeforeShutdown.fire({
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
            const longRunningBeforeShutdownWarning = (0, async_1.disposableTimeout)(() => {
                logService.warn(`[lifecycle] onBeforeShutdown is taking a long time, pending operations: ${Array.from(pendingVetos).join(', ')}`);
            }, NativeLifecycleService_1.BEFORE_SHUTDOWN_WARNING_DELAY);
            try {
                // First: run list of vetos in parallel
                let veto = await (0, lifecycle_1.handleVetos)(vetos, error => this.handleBeforeShutdownError(error, reason));
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
                        this.handleBeforeShutdownError(error, reason);
                    }
                }
                return veto;
            }
            finally {
                longRunningBeforeShutdownWarning.dispose();
            }
        }
        handleBeforeShutdownError(error, reason) {
            this.logService.error(`[lifecycle]: Error during before-shutdown phase (error: ${(0, errorMessage_1.toErrorMessage)(error)})`);
            this._onBeforeShutdownError.fire({ reason, error });
        }
        async handleWillShutdown(reason) {
            const joiners = [];
            const pendingJoiners = new Set();
            const cts = new cancellation_1.CancellationTokenSource();
            this._onWillShutdown.fire({
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
            const longRunningWillShutdownWarning = (0, async_1.disposableTimeout)(() => {
                this.logService.warn(`[lifecycle] onWillShutdown is taking a long time, pending operations: ${Array.from(pendingJoiners).map(joiner => joiner.id).join(', ')}`);
            }, NativeLifecycleService_1.WILL_SHUTDOWN_WARNING_DELAY);
            try {
                await (0, async_1.raceCancellation)(async_1.Promises.settled(joiners), cts.token);
            }
            catch (error) {
                this.logService.error(`[lifecycle]: Error during will-shutdown phase (error: ${(0, errorMessage_1.toErrorMessage)(error)})`); // this error will not prevent the shutdown
            }
            finally {
                longRunningWillShutdownWarning.dispose();
            }
        }
        shutdown() {
            return this.nativeHostService.closeWindow();
        }
    };
    exports.NativeLifecycleService = NativeLifecycleService;
    exports.NativeLifecycleService = NativeLifecycleService = NativeLifecycleService_1 = __decorate([
        __param(0, native_1.INativeHostService),
        __param(1, storage_1.IStorageService),
        __param(2, log_1.ILogService)
    ], NativeLifecycleService);
    (0, extensions_1.registerSingleton)(lifecycle_2.ILifecycleService, NativeLifecycleService, 0 /* InstantiationType.Eager */);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGlmZWN5Y2xlU2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9zZXJ2aWNlcy9saWZlY3ljbGUvZWxlY3Ryb24tc2FuZGJveC9saWZlY3ljbGVTZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7Ozs7SUFjekYsSUFBTSxzQkFBc0IsR0FBNUIsTUFBTSxzQkFBdUIsU0FBUSwyQ0FBd0I7O2lCQUUzQyxrQ0FBNkIsR0FBRyxJQUFJLEFBQVAsQ0FBUTtpQkFDckMsZ0NBQTJCLEdBQUcsR0FBRyxBQUFOLENBQU87UUFFMUQsWUFDc0MsaUJBQXFDLEVBQ3pELGNBQStCLEVBQ25DLFVBQXVCO1lBRXBDLEtBQUssQ0FBQyxVQUFVLEVBQUUsY0FBYyxDQUFDLENBQUM7WUFKRyxzQkFBaUIsR0FBakIsaUJBQWlCLENBQW9CO1lBTTFFLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO1FBQzFCLENBQUM7UUFFTyxpQkFBaUI7WUFDeEIsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLGlCQUFpQixDQUFDLFFBQVEsQ0FBQztZQUVqRCxzRUFBc0U7WUFDdEUscUJBQVcsQ0FBQyxFQUFFLENBQUMsdUJBQXVCLEVBQUUsS0FBSyxFQUFFLEtBQWMsRUFBRSxLQUEyRSxFQUFFLEVBQUU7Z0JBQzdJLElBQUksQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLHVDQUF1QyxLQUFLLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQztnQkFFOUUsc0RBQXNEO2dCQUN0RCxNQUFNLElBQUksR0FBRyxNQUFNLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUM7Z0JBRTNELHNCQUFzQjtnQkFDdEIsSUFBSSxJQUFJLEVBQUU7b0JBQ1QsSUFBSSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsK0NBQStDLENBQUMsQ0FB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