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
    var LifecycleMainService_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.LifecycleMainService = exports.LifecycleMainPhase = exports.ShutdownReason = exports.ILifecycleMainService = void 0;
    exports.ILifecycleMainService = (0, instantiation_1.createDecorator)('lifecycleMainService');
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
    let LifecycleMainService = class LifecycleMainService extends lifecycle_1.Disposable {
        static { LifecycleMainService_1 = this; }
        static { this.QUIT_AND_RESTART_KEY = 'lifecycle.quitAndRestart'; }
        get quitRequested() { return this._quitRequested; }
        get wasRestarted() { return this._wasRestarted; }
        get phase() { return this._phase; }
        constructor(logService, stateService, environmentMainService) {
            super();
            this.logService = logService;
            this.stateService = stateService;
            this.environmentMainService = environmentMainService;
            this._onBeforeShutdown = this._register(new event_1.Emitter());
            this.onBeforeShutdown = this._onBeforeShutdown.event;
            this._onWillShutdown = this._register(new event_1.Emitter());
            this.onWillShutdown = this._onWillShutdown.event;
            this._onWillLoadWindow = this._register(new event_1.Emitter());
            this.onWillLoadWindow = this._onWillLoadWindow.event;
            this._onBeforeCloseWindow = this._register(new event_1.Emitter());
            this.onBeforeCloseWindow = this._onBeforeCloseWindow.event;
            this._quitRequested = false;
            this._wasRestarted = false;
            this._phase = 1 /* LifecycleMainPhase.Starting */;
            this.windowToCloseRequest = new Set();
            this.oneTimeListenerTokenGenerator = 0;
            this.windowCounter = 0;
            this.pendingQuitPromise = undefined;
            this.pendingQuitPromiseResolve = undefined;
            this.pendingWillShutdownPromise = undefined;
            this.mapWindowIdToPendingUnload = new Map();
            this.phaseWhen = new Map();
            this.relaunchHandler = undefined;
            this.resolveRestarted();
            this.when(2 /* LifecycleMainPhase.Ready */).then(() => this.registerListeners());
        }
        resolveRestarted() {
            this._wasRestarted = !!this.stateService.getItem(LifecycleMainService_1.QUIT_AND_RESTART_KEY);
            if (this._wasRestarted) {
                // remove the marker right after if found
                this.stateService.removeItem(LifecycleMainService_1.QUIT_AND_RESTART_KEY);
            }
        }
        registerListeners() {
            // before-quit: an event that is fired if application quit was
            // requested but before any window was closed.
            const beforeQuitListener = () => {
                if (this._quitRequested) {
                    return;
                }
                this.trace('Lifecycle#app.on(before-quit)');
                this._quitRequested = true;
                // Emit event to indicate that we are about to shutdown
                this.trace('Lifecycle#onBeforeShutdown.fire()');
                this._onBeforeShutdown.fire();
                // macOS: can run without any window open. in that case we fire
                // the onWillShutdown() event directly because there is no veto
                // to be expected.
                if (platform_1.isMacintosh && this.windowCounter === 0) {
                    this.fireOnWillShutdown(1 /* ShutdownReason.QUIT */);
                }
            };
            electron_1.app.addListener('before-quit', beforeQuitListener);
            // window-all-closed: an event that only fires when the last window
            // was closed. We override this event to be in charge if app.quit()
            // should be called or not.
            const windowAllClosedListener = () => {
                this.trace('Lifecycle#app.on(window-all-closed)');
                // Windows/Linux: we quit when all windows have closed
                // Mac: we only quit when quit was requested
                if (this._quitRequested || !platform_1.isMacintosh) {
                    electron_1.app.quit();
                }
            };
            electron_1.app.addListener('window-all-closed', windowAllClosedListener);
            // will-quit: an event that is fired after all windows have been
            // closed, but before actually quitting.
            electron_1.app.once('will-quit', e => {
                this.trace('Lifecycle#app.on(will-quit) - begin');
                // Prevent the quit until the shutdown promise was resolved
                e.preventDefault();
                // Start shutdown sequence
                const shutdownPromise = this.fireOnWillShutdown(1 /* ShutdownReason.QUIT */);
                // Wait until shutdown is signaled to be complete
                shutdownPromise.finally(() => {
                    this.trace('Lifecycle#app.on(will-quit) - after fireOnWillShutdown');
                    // Resolve pending quit promise now without veto
                    this.resolvePendingQuitPromise(false /* no veto */);
                    // Quit again, this time do not prevent this, since our
                    // will-quit listener is only installed "once". Also
                    // remove any listener we have that is no longer needed
                    electron_1.app.removeListener('before-quit', beforeQuitListener);
                    electron_1.app.removeListener('window-all-closed', windowAllClosedListener);
                    this.trace('Lifecycle#app.on(will-quit) - calling app.quit()');
                    electron_1.app.quit();
                });
            });
        }
        fireOnWillShutdown(reason) {
            if (this.pendingWillShutdownPromise) {
                return this.pendingWillShutdownPromise; // shutdown is already running
            }
            const logService = this.logService;
            this.trace('Lifecycle#onWillShutdown.fire()');
            const joiners = [];
            this._onWillShutdown.fire({
                reason,
                join(id, promise) {
                    logService.trace(`Lifecycle#onWillShutdown - begin '${id}'`);
                    joiners.push(promise.finally(() => {
                        logService.trace(`Lifecycle#onWillShutdown - end '${id}'`);
                    }));
                }
            });
            this.pendingWillShutdownPromise = (async () => {
                // Settle all shutdown event joiners
                try {
                    await async_1.Promises.settled(joiners);
                }
                catch (error) {
                    this.logService.error(error);
                }
                // Then, always make sure at the end
                // the state service is flushed.
                try {
                    await this.stateService.close();
                }
                catch (error) {
                    this.logService.error(error);
                }
            })();
            return this.pendingWillShutdownPromise;
        }
        set phase(value) {
            if (value < this.phase) {
                throw new Error('Lifecycle cannot go backwards');
            }
            if (this._phase === value) {
                return;
            }
            this.trace(`lifecycle (main): phase changed (value: ${value})`);
            this._phase = value;
            const barrier = this.phaseWhen.get(this._phase);
            if (barrier) {
                barrier.open();
                this.phaseWhen.delete(this._phase);
            }
        }
        async when(phase) {
            if (phase <= this._phase) {
                return;
            }
            let barrier = this.phaseWhen.get(phase);
            if (!barrier) {
                barrier = new async_1.Barrier();
                this.phaseWhen.set(phase, barrier);
            }
            await barrier.wait();
        }
        registerWindow(window) {
            const windowListeners = new lifecycle_1.DisposableStore();
            // track window count
            this.windowCounter++;
            // Window Will Load
            windowListeners.add(window.onWillLoad(e => this._onWillLoadWindow.fire({ window, workspace: e.workspace, reason: e.reason })));
            // Window Before Closing: Main -> Renderer
            const win = (0, types_1.assertIsDefined)(window.win);
            win.on('close', e => {
                // The window already acknowledged to be closed
                const windowId = window.id;
                if (this.windowToCloseRequest.has(windowId)) {
                    this.windowToCloseRequest.delete(windowId);
                    return;
                }
                this.trace(`Lifecycle#window.on('close') - window ID ${window.id}`);
                // Otherwise prevent unload and handle it from window
                e.preventDefault();
                this.unload(window, 1 /* UnloadReason.CLOSE */).then(veto => {
                    if (veto) {
                        this.windowToCloseRequest.delete(windowId);
                        return;
                    }
                    this.windowToCloseRequest.add(windowId);
                    // Fire onBeforeCloseWindow before actually closing
                    this.trace(`Lifecycle#onBeforeCloseWindow.fire() - window ID ${windowId}`);
                    this._onBeforeCloseWindow.fire(window);
                    // No veto, close window now
                    window.close();
                });
            });
            // Window After Closing
            win.on('closed', () => {
                this.trace(`Lifecycle#window.on('closed') - window ID ${window.id}`);
                // update window count
                this.windowCounter--;
                // clear window listeners
                windowListeners.dispose();
                // if there are no more code windows opened, fire the onWillShutdown event, unless
                // we are on macOS where it is perfectly fine to close the last window and
                // the application continues running (unless quit was actually requested)
                if (this.windowCounter === 0 && (!platform_1.isMacintosh || this._quitRequested)) {
                    this.fireOnWillShutdown(1 /* ShutdownReason.QUIT */);
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
            const pendingUnloadPromise = this.mapWindowIdToPendingUnload.get(window.id);
            if (pendingUnloadPromise) {
                return pendingUnloadPromise;
            }
            // Start unload and remember in map until finished
            const unloadPromise = this.doUnload(window, reason).finally(() => {
                this.mapWindowIdToPendingUnload.delete(window.id);
            });
            this.mapWindowIdToPendingUnload.set(window.id, unloadPromise);
            return unloadPromise;
        }
        async doUnload(window, reason) {
            // Always allow to unload a window that is not yet ready
            if (!window.isReady) {
                return false;
            }
            this.trace(`Lifecycle#unload() - window ID ${window.id}`);
            // first ask the window itself if it vetos the unload
            const windowUnloadReason = this._quitRequested ? 2 /* UnloadReason.QUIT */ : reason;
            const veto = await this.onBeforeUnloadWindowInRenderer(window, windowUnloadReason);
            if (veto) {
                this.trace(`Lifecycle#unload() - veto in renderer (window ID ${window.id})`);
                return this.handleWindowUnloadVeto(veto);
            }
            // finally if there are no vetos, unload the renderer
            await this.onWillUnloadWindowInRenderer(window, windowUnloadReason);
            return false;
        }
        handleWindowUnloadVeto(veto) {
            if (!veto) {
                return false; // no veto
            }
            // a veto resolves any pending quit with veto
            this.resolvePendingQuitPromise(true /* veto */);
            // a veto resets the pending quit request flag
            this._quitRequested = false;
            return true; // veto
        }
        resolvePendingQuitPromise(veto) {
            if (this.pendingQuitPromiseResolve) {
                this.pendingQuitPromiseResolve(veto);
                this.pendingQuitPromiseResolve = undefined;
                this.pendingQuitPromise = undefined;
            }
        }
        onBeforeUnloadWindowInRenderer(window, reason) {
            return new Promise(resolve => {
                const oneTimeEventToken = this.oneTimeListenerTokenGenerator++;
                const okChannel = `vscode:ok${oneTimeEventToken}`;
                const cancelChannel = `vscode:cancel${oneTimeEventToken}`;
                ipcMain_1.validatedIpcMain.once(okChannel, () => {
                    resolve(false); // no veto
                });
                ipcMain_1.validatedIpcMain.once(cancelChannel, () => {
                    resolve(true); // veto
                });
                window.send('vscode:onBeforeUnload', { okChannel, cancelChannel, reason });
            });
        }
        onWillUnloadWindowInRenderer(window, reason) {
            return new Promise(resolve => {
                const oneTimeEventToken = this.oneTimeListenerTokenGenerator++;
                const replyChannel = `vscode:reply${oneTimeEventToken}`;
                ipcMain_1.validatedIpcMain.once(replyChannel, () => resolve());
                window.send('vscode:onWillUnload', { replyChannel, reason });
            });
        }
        quit(willRestart) {
            return this.doQuit(willRestart).then(veto => {
                if (!veto && willRestart) {
                    // Windows: we are about to restart and as such we need to restore the original
                    // current working directory we had on startup to get the exact same startup
                    // behaviour. As such, we briefly change back to that directory and then when
                    // Code starts it will set it back to the installation directory again.
                    try {
                        if (platform_1.isWindows) {
                            const currentWorkingDir = (0, process_1.cwd)();
                            if (currentWorkingDir !== process.cwd()) {
                                process.chdir(currentWorkingDir);
                            }
                        }
                    }
                    catch (err) {
                        this.logService.error(err);
                    }
                }
                return veto;
            });
        }
        doQuit(willRestart) {
            this.trace(`Lifecycle#quit() - begin (willRestart: ${willRestart})`);
            if (this.pendingQuitPromise) {
                this.trace('Lifecycle#quit() - returning pending quit promise');
                return this.pendingQuitPromise;
            }
            // Remember if we are about to restart
            if (willRestart) {
                this.stateService.setItem(LifecycleMainService_1.QUIT_AND_RESTART_KEY, true);
            }
            this.pendingQuitPromise = new Promise(resolve => {
                // Store as field to access it from a window cancellation
                this.pendingQuitPromiseResolve = resolve;
                // Calling app.quit() will trigger the close handlers of each opened window
                // and only if no window vetoed the shutdown, we will get the will-quit event
                this.trace('Lifecycle#quit() - calling app.quit()');
                electron_1.app.quit();
            });
            return this.pendingQuitPromise;
        }
        trace(msg) {
            if (this.environmentMainService.args['enable-smoke-test-driver']) {
                this.logService.info(msg); // helps diagnose issues with exiting from smoke tests
            }
            else {
                this.logService.trace(msg);
            }
        }
        setRelaunchHandler(handler) {
            this.relaunchHandler = handler;
        }
        async relaunch(options) {
            this.trace('Lifecycle#relaunch()');
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
                if (!this.relaunchHandler?.handleRelaunch(options)) {
                    this.trace('Lifecycle#relaunch() - calling app.relaunch()');
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
            this.trace('Lifecycle#kill()');
            // Give main process participants a chance to orderly shutdown
            await this.fireOnWillShutdown(2 /* ShutdownReason.KILL */);
            // From extension tests we have seen issues where calling app.exit()
            // with an opened window can lead to native crashes (Linux). As such,
            // we should make sure to destroy any opened window before calling
            // `app.exit()`.
            //
            // Note: Electron implements a similar logic here:
            // https://github.com/electron/electron/blob/fe5318d753637c3903e23fc1ed1b263025887b6a/spec-main/window-helpers.ts#L5
            await Promise.race([
                // Still do not block more than 1s
                (0, async_1.timeout)(1000),
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
    exports.LifecycleMainService = LifecycleMainService;
    exports.LifecycleMainService = LifecycleMainService = LifecycleMainService_1 = __decorate([
        __param(0, log_1.ILogService),
        __param(1, state_1.IStateService),
        __param(2, environmentMainService_1.IEnvironmentMainService)
    ], LifecycleMainService);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGlmZWN5Y2xlTWFpblNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9wbGF0Zm9ybS9saWZlY3ljbGUvZWxlY3Ryb24tbWFpbi9saWZlY3ljbGVNYWluU2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7O0lBa0JuRixRQUFBLHFCQUFxQixHQUFHLElBQUEsK0JBQWUsRUFBd0Isc0JBQXNCLENBQUMsQ0FBQztJQW9CcEcsSUFBa0IsY0FhakI7SUFiRCxXQUFrQixjQUFjO1FBRS9COztXQUVHO1FBQ0gsbURBQVEsQ0FBQTtRQUVSOzs7O1dBSUc7UUFDSCxtREFBSSxDQUFBO0lBQ0wsQ0FBQyxFQWJpQixjQUFjLDhCQUFkLGNBQWMsUUFhL0I7SUE2SEQsSUFBa0Isa0JBd0JqQjtJQXhCRCxXQUFrQixrQkFBa0I7UUFFbkM7O1dBRUc7UUFDSCxtRUFBWSxDQUFBO1FBRVo7O1dBRUc7UUFDSCw2REFBUyxDQUFBO1FBRVQ7Ozs7V0FJRztRQUNILGlGQUFtQixDQUFBO1FBRW5COzs7V0FHRztRQUNILHVFQUFjLENBQUE7SUFDZixDQUFDLEVBeEJpQixrQkFBa0Isa0NBQWxCLGtCQUFrQixRQXdCbkM7SUFFTSxJQUFNLG9CQUFvQixHQUExQixNQUFNLG9CQUFxQixTQUFRLHNCQUFVOztpQkFJM0IseUJBQW9CLEdBQUcsMEJBQTBCLEFBQTdCLENBQThCO1FBZTFFLElBQUksYUFBYSxLQUFjLE9BQU8sSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUM7UUFHNUQsSUFBSSxZQUFZLEtBQWMsT0FBTyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQztRQUcxRCxJQUFJLEtBQUssS0FBeUIsT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztRQWlCdkQsWUFDYyxVQUF3QyxFQUN0QyxZQUE0QyxFQUNsQyxzQkFBZ0U7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