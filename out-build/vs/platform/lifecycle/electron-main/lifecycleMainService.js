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
define(["require", "exports", "electron", "vs/base/parts/ipc/electron-main/ipcMain", "vs/base/common/async", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/platform", "vs/base/common/process", "vs/base/common/types", "vs/platform/instantiation/common/instantiation", "vs/platform/log/common/log", "vs/platform/state/node/state", "vs/platform/environment/electron-main/environmentMainService"], function (require, exports, electron_1, ipcMain_1, async_1, event_1, lifecycle_1, platform_1, process_1, types_1, instantiation_1, log_1, state_1, environmentMainService_1) {
    "use strict";
    var $q5b_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$q5b = exports.LifecycleMainPhase = exports.ShutdownReason = exports.$p5b = void 0;
    exports.$p5b = (0, instantiation_1.$Bh)('lifecycleMainService');
    var ShutdownReason;
    (function (ShutdownReason) {
        /**
         * The application exits normally.
         */
        ShutdownReason[ShutdownReason["QUIT"] = 1] = "QUIT";
        /**
         * The application exits abnormally and is being
         * killed with an exit code (e.g. from integration
         * test run)
         */
        ShutdownReason[ShutdownReason["KILL"] = 2] = "KILL";
    })(ShutdownReason || (exports.ShutdownReason = ShutdownReason = {}));
    var LifecycleMainPhase;
    (function (LifecycleMainPhase) {
        /**
         * The first phase signals that we are about to startup.
         */
        LifecycleMainPhase[LifecycleMainPhase["Starting"] = 1] = "Starting";
        /**
         * Services are ready and first window is about to open.
         */
        LifecycleMainPhase[LifecycleMainPhase["Ready"] = 2] = "Ready";
        /**
         * This phase signals a point in time after the window has opened
         * and is typically the best place to do work that is not required
         * for the window to open.
         */
        LifecycleMainPhase[LifecycleMainPhase["AfterWindowOpen"] = 3] = "AfterWindowOpen";
        /**
         * The last phase after a window has opened and some time has passed
         * (2-5 seconds).
         */
        LifecycleMainPhase[LifecycleMainPhase["Eventually"] = 4] = "Eventually";
    })(LifecycleMainPhase || (exports.LifecycleMainPhase = LifecycleMainPhase = {}));
    let $q5b = class $q5b extends lifecycle_1.$kc {
        static { $q5b_1 = this; }
        static { this.b = 'lifecycle.quitAndRestart'; }
        get quitRequested() { return this.j; }
        get wasRestarted() { return this.m; }
        get phase() { return this.n; }
        constructor(F, G, H) {
            super();
            this.F = F;
            this.G = G;
            this.H = H;
            this.c = this.B(new event_1.$fd());
            this.onBeforeShutdown = this.c.event;
            this.f = this.B(new event_1.$fd());
            this.onWillShutdown = this.f.event;
            this.g = this.B(new event_1.$fd());
            this.onWillLoadWindow = this.g.event;
            this.h = this.B(new event_1.$fd());
            this.onBeforeCloseWindow = this.h.event;
            this.j = false;
            this.m = false;
            this.n = 1 /* LifecycleMainPhase.Starting */;
            this.r = new Set();
            this.s = 0;
            this.t = 0;
            this.u = undefined;
            this.w = undefined;
            this.y = undefined;
            this.z = new Map();
            this.C = new Map();
            this.D = undefined;
            this.I();
            this.when(2 /* LifecycleMainPhase.Ready */).then(() => this.J());
        }
        I() {
            this.m = !!this.G.getItem($q5b_1.b);
            if (this.m) {
                // remove the marker right after if found
                this.G.removeItem($q5b_1.b);
            }
        }
        J() {
            // before-quit: an event that is fired if application quit was
            // requested but before any window was closed.
            const beforeQuitListener = () => {
                if (this.j) {
                    return;
                }
                this.S('Lifecycle#app.on(before-quit)');
                this.j = true;
                // Emit event to indicate that we are about to shutdown
                this.S('Lifecycle#onBeforeShutdown.fire()');
                this.c.fire();
                // macOS: can run without any window open. in that case we fire
                // the onWillShutdown() event directly because there is no veto
                // to be expected.
                if (platform_1.$j && this.t === 0) {
                    this.L(1 /* ShutdownReason.QUIT */);
                }
            };
            electron_1.app.addListener('before-quit', beforeQuitListener);
            // window-all-closed: an event that only fires when the last window
            // was closed. We override this event to be in charge if app.quit()
            // should be called or not.
            const windowAllClosedListener = () => {
                this.S('Lifecycle#app.on(window-all-closed)');
                // Windows/Linux: we quit when all windows have closed
                // Mac: we only quit when quit was requested
                if (this.j || !platform_1.$j) {
                    electron_1.app.quit();
                }
            };
            electron_1.app.addListener('window-all-closed', windowAllClosedListener);
            // will-quit: an event that is fired after all windows have been
            // closed, but before actually quitting.
            electron_1.app.once('will-quit', e => {
                this.S('Lifecycle#app.on(will-quit) - begin');
                // Prevent the quit until the shutdown promise was resolved
                e.preventDefault();
                // Start shutdown sequence
                const shutdownPromise = this.L(1 /* ShutdownReason.QUIT */);
                // Wait until shutdown is signaled to be complete
                shutdownPromise.finally(() => {
                    this.S('Lifecycle#app.on(will-quit) - after fireOnWillShutdown');
                    // Resolve pending quit promise now without veto
                    this.O(false /* no veto */);
                    // Quit again, this time do not prevent this, since our
                    // will-quit listener is only installed "once". Also
                    // remove any listener we have that is no longer needed
                    electron_1.app.removeListener('before-quit', beforeQuitListener);
                    electron_1.app.removeListener('window-all-closed', windowAllClosedListener);
                    this.S('Lifecycle#app.on(will-quit) - calling app.quit()');
                    electron_1.app.quit();
                });
            });
        }
        L(reason) {
            if (this.y) {
                return this.y; // shutdown is already running
            }
            const logService = this.F;
            this.S('Lifecycle#onWillShutdown.fire()');
            const joiners = [];
            this.f.fire({
                reason,
                join(id, promise) {
                    logService.trace(`Lifecycle#onWillShutdown - begin '${id}'`);
                    joiners.push(promise.finally(() => {
                        logService.trace(`Lifecycle#onWillShutdown - end '${id}'`);
                    }));
                }
            });
            this.y = (async () => {
                // Settle all shutdown event joiners
                try {
                    await async_1.Promises.settled(joiners);
                }
                catch (error) {
                    this.F.error(error);
                }
                // Then, always make sure at the end
                // the state service is flushed.
                try {
                    await this.G.close();
                }
                catch (error) {
                    this.F.error(error);
                }
            })();
            return this.y;
        }
        set phase(value) {
            if (value < this.phase) {
                throw new Error('Lifecycle cannot go backwards');
            }
            if (this.n === value) {
                return;
            }
            this.S(`lifecycle (main): phase changed (value: ${value})`);
            this.n = value;
            const barrier = this.C.get(this.n);
            if (barrier) {
                barrier.open();
                this.C.delete(this.n);
            }
        }
        async when(phase) {
            if (phase <= this.n) {
                return;
            }
            let barrier = this.C.get(phase);
            if (!barrier) {
                barrier = new async_1.$Fg();
                this.C.set(phase, barrier);
            }
            await barrier.wait();
        }
        registerWindow(window) {
            const windowListeners = new lifecycle_1.$jc();
            // track window count
            this.t++;
            // Window Will Load
            windowListeners.add(window.onWillLoad(e => this.g.fire({ window, workspace: e.workspace, reason: e.reason })));
            // Window Before Closing: Main -> Renderer
            const win = (0, types_1.$uf)(window.win);
            win.on('close', e => {
                // The window already acknowledged to be closed
                const windowId = window.id;
                if (this.r.has(windowId)) {
                    this.r.delete(windowId);
                    return;
                }
                this.S(`Lifecycle#window.on('close') - window ID ${window.id}`);
                // Otherwise prevent unload and handle it from window
                e.preventDefault();
                this.unload(window, 1 /* UnloadReason.CLOSE */).then(veto => {
                    if (veto) {
                        this.r.delete(windowId);
                        return;
                    }
                    this.r.add(windowId);
                    // Fire onBeforeCloseWindow before actually closing
                    this.S(`Lifecycle#onBeforeCloseWindow.fire() - window ID ${windowId}`);
                    this.h.fire(window);
                    // No veto, close window now
                    window.close();
                });
            });
            // Window After Closing
            win.on('closed', () => {
                this.S(`Lifecycle#window.on('closed') - window ID ${window.id}`);
                // update window count
                this.t--;
                // clear window listeners
                windowListeners.dispose();
                // if there are no more code windows opened, fire the onWillShutdown event, unless
                // we are on macOS where it is perfectly fine to close the last window and
                // the application continues running (unless quit was actually requested)
                if (this.t === 0 && (!platform_1.$j || this.j)) {
                    this.L(1 /* ShutdownReason.QUIT */);
                }
            });
        }
        async reload(window, cli) {
            // Only reload when the window has not vetoed this
            const veto = await this.unload(window, 3 /* UnloadReason.RELOAD */);
            if (!veto) {
                window.reload(cli);
            }
        }
        unload(window, reason) {
            // Ensure there is only 1 unload running at the same time
            const pendingUnloadPromise = this.z.get(window.id);
            if (pendingUnloadPromise) {
                return pendingUnloadPromise;
            }
            // Start unload and remember in map until finished
            const unloadPromise = this.M(window, reason).finally(() => {
                this.z.delete(window.id);
            });
            this.z.set(window.id, unloadPromise);
            return unloadPromise;
        }
        async M(window, reason) {
            // Always allow to unload a window that is not yet ready
            if (!window.isReady) {
                return false;
            }
            this.S(`Lifecycle#unload() - window ID ${window.id}`);
            // first ask the window itself if it vetos the unload
            const windowUnloadReason = this.j ? 2 /* UnloadReason.QUIT */ : reason;
            const veto = await this.P(window, windowUnloadReason);
            if (veto) {
                this.S(`Lifecycle#unload() - veto in renderer (window ID ${window.id})`);
                return this.N(veto);
            }
            // finally if there are no vetos, unload the renderer
            await this.Q(window, windowUnloadReason);
            return false;
        }
        N(veto) {
            if (!veto) {
                return false; // no veto
            }
            // a veto resolves any pending quit with veto
            this.O(true /* veto */);
            // a veto resets the pending quit request flag
            this.j = false;
            return true; // veto
        }
        O(veto) {
            if (this.w) {
                this.w(veto);
                this.w = undefined;
                this.u = undefined;
            }
        }
        P(window, reason) {
            return new Promise(resolve => {
                const oneTimeEventToken = this.s++;
                const okChannel = `vscode:ok${oneTimeEventToken}`;
                const cancelChannel = `vscode:cancel${oneTimeEventToken}`;
                ipcMain_1.$US.once(okChannel, () => {
                    resolve(false); // no veto
                });
                ipcMain_1.$US.once(cancelChannel, () => {
                    resolve(true); // veto
                });
                window.send('vscode:onBeforeUnload', { okChannel, cancelChannel, reason });
            });
        }
        Q(window, reason) {
            return new Promise(resolve => {
                const oneTimeEventToken = this.s++;
                const replyChannel = `vscode:reply${oneTimeEventToken}`;
                ipcMain_1.$US.once(replyChannel, () => resolve());
                window.send('vscode:onWillUnload', { replyChannel, reason });
            });
        }
        quit(willRestart) {
            return this.R(willRestart).then(veto => {
                if (!veto && willRestart) {
                    // Windows: we are about to restart and as such we need to restore the original
                    // current working directory we had on startup to get the exact same startup
                    // behaviour. As such, we briefly change back to that directory and then when
                    // Code starts it will set it back to the installation directory again.
                    try {
                        if (platform_1.$i) {
                            const currentWorkingDir = (0, process_1.cwd)();
                            if (currentWorkingDir !== process.cwd()) {
                                process.chdir(currentWorkingDir);
                            }
                        }
                    }
                    catch (err) {
                        this.F.error(err);
                    }
                }
                return veto;
            });
        }
        R(willRestart) {
            this.S(`Lifecycle#quit() - begin (willRestart: ${willRestart})`);
            if (this.u) {
                this.S('Lifecycle#quit() - returning pending quit promise');
                return this.u;
            }
            // Remember if we are about to restart
            if (willRestart) {
                this.G.setItem($q5b_1.b, true);
            }
            this.u = new Promise(resolve => {
                // Store as field to access it from a window cancellation
                this.w = resolve;
                // Calling app.quit() will trigger the close handlers of each opened window
                // and only if no window vetoed the shutdown, we will get the will-quit event
                this.S('Lifecycle#quit() - calling app.quit()');
                electron_1.app.quit();
            });
            return this.u;
        }
        S(msg) {
            if (this.H.args['enable-smoke-test-driver']) {
                this.F.info(msg); // helps diagnose issues with exiting from smoke tests
            }
            else {
                this.F.trace(msg);
            }
        }
        setRelaunchHandler(handler) {
            this.D = handler;
        }
        async relaunch(options) {
            this.S('Lifecycle#relaunch()');
            const args = process.argv.slice(1);
            if (options?.addArgs) {
                args.push(...options.addArgs);
            }
            if (options?.removeArgs) {
                for (const a of options.removeArgs) {
                    const idx = args.indexOf(a);
                    if (idx >= 0) {
                        args.splice(idx, 1);
                    }
                }
            }
            const quitListener = () => {
                if (!this.D?.handleRelaunch(options)) {
                    this.S('Lifecycle#relaunch() - calling app.relaunch()');
                    electron_1.app.relaunch({ args });
                }
            };
            electron_1.app.once('quit', quitListener);
            // `app.relaunch()` does not quit automatically, so we quit first,
            // check for vetoes and then relaunch from the `app.on('quit')` event
            const veto = await this.quit(true /* will restart */);
            if (veto) {
                electron_1.app.removeListener('quit', quitListener);
            }
        }
        async kill(code) {
            this.S('Lifecycle#kill()');
            // Give main process participants a chance to orderly shutdown
            await this.L(2 /* ShutdownReason.KILL */);
            // From extension tests we have seen issues where calling app.exit()
            // with an opened window can lead to native crashes (Linux). As such,
            // we should make sure to destroy any opened window before calling
            // `app.exit()`.
            //
            // Note: Electron implements a similar logic here:
            // https://github.com/electron/electron/blob/fe5318d753637c3903e23fc1ed1b263025887b6a/spec-main/window-helpers.ts#L5
            await Promise.race([
                // Still do not block more than 1s
                (0, async_1.$Hg)(1000),
                // Destroy any opened window: we do not unload windows here because
                // there is a chance that the unload is veto'd or long running due
                // to a participant within the window. this is not wanted when we
                // are asked to kill the application.
                (async () => {
                    for (const window of electron_1.BrowserWindow.getAllWindows()) {
                        if (window && !window.isDestroyed()) {
                            let whenWindowClosed;
                            if (window.webContents && !window.webContents.isDestroyed()) {
                                whenWindowClosed = new Promise(resolve => window.once('closed', resolve));
                            }
                            else {
                                whenWindowClosed = Promise.resolve();
                            }
                            window.destroy();
                            await whenWindowClosed;
                        }
                    }
                })()
            ]);
            // Now exit either after 1s or all windows destroyed
            electron_1.app.exit(code);
        }
    };
    exports.$q5b = $q5b;
    exports.$q5b = $q5b = $q5b_1 = __decorate([
        __param(0, log_1.$5i),
        __param(1, state_1.$eN),
        __param(2, environmentMainService_1.$n5b)
    ], $q5b);
});
//# sourceMappingURL=lifecycleMainService.js.map