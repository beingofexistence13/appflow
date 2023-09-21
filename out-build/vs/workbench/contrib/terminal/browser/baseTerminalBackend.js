/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/network", "vs/nls!vs/workbench/contrib/terminal/browser/baseTerminalBackend"], function (require, exports, event_1, lifecycle_1, network_1, nls_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.$nWb = void 0;
    class $nWb extends lifecycle_1.$kc {
        get isResponsive() { return !this.a; }
        constructor(h, j, historyService, configurationResolverService, statusBarService, m) {
            super();
            this.h = h;
            this.j = j;
            this.m = m;
            this.a = false;
            this.b = this.B(new event_1.$fd());
            this.onPtyHostConnected = this.b.event;
            this.c = this.B(new event_1.$fd());
            this.onPtyHostRestart = this.c.event;
            this.f = this.B(new event_1.$fd());
            this.onPtyHostUnresponsive = this.f.event;
            this.g = this.B(new event_1.$fd());
            this.onPtyHostResponsive = this.g.event;
            let unresponsiveStatusBarEntry;
            let statusBarAccessor;
            let hasStarted = false;
            // Attach pty host listeners
            this.B(this.h.onPtyHostExit(() => {
                this.j.error(`The terminal's pty host process exited, the connection to all terminal processes was lost`);
            }));
            this.onPtyHostConnected(() => hasStarted = true);
            this.B(this.h.onPtyHostStart(() => {
                this.j.debug(`The terminal's pty host process is starting`);
                // Only fire the _restart_ event after it has started
                if (hasStarted) {
                    this.j.trace('IPtyHostController#onPtyHostRestart');
                    this.c.fire();
                }
                statusBarAccessor?.dispose();
                this.a = false;
            }));
            this.B(this.h.onPtyHostUnresponsive(() => {
                statusBarAccessor?.dispose();
                if (!unresponsiveStatusBarEntry) {
                    unresponsiveStatusBarEntry = {
                        name: (0, nls_1.localize)(0, null),
                        text: `$(debug-disconnect) ${(0, nls_1.localize)(1, null)}`,
                        tooltip: (0, nls_1.localize)(2, null),
                        ariaLabel: (0, nls_1.localize)(3, null),
                        command: "workbench.action.terminal.restartPtyHost" /* TerminalCommandId.RestartPtyHost */,
                        kind: 'warning'
                    };
                }
                statusBarAccessor = statusBarService.addEntry(unresponsiveStatusBarEntry, 'ptyHostStatus', 0 /* StatusbarAlignment.LEFT */);
                this.a = true;
                this.f.fire();
            }));
            this.B(this.h.onPtyHostResponsive(() => {
                if (!this.a) {
                    return;
                }
                this.j.info('The pty host became responsive again');
                statusBarAccessor?.dispose();
                this.a = false;
                this.g.fire();
            }));
            this.B(this.h.onPtyHostRequestResolveVariables(async (e) => {
                // Only answer requests for this workspace
                if (e.workspaceId !== this.m.getWorkspace().id) {
                    return;
                }
                const activeWorkspaceRootUri = historyService.getLastActiveWorkspaceRoot(network_1.Schemas.file);
                const lastActiveWorkspaceRoot = activeWorkspaceRootUri ? this.m.getWorkspaceFolder(activeWorkspaceRootUri) ?? undefined : undefined;
                const resolveCalls = e.originalText.map(t => {
                    return configurationResolverService.resolveAsync(lastActiveWorkspaceRoot, t);
                });
                const result = await Promise.all(resolveCalls);
                this.h.acceptPtyHostResolvedVariables(e.requestId, result);
            }));
        }
        restartPtyHost() {
            this.h.restartPtyHost();
        }
        n(serializedState) {
            if (serializedState === undefined) {
                return undefined;
            }
            const parsedUnknown = JSON.parse(serializedState);
            if (!('version' in parsedUnknown) || !('state' in parsedUnknown) || !Array.isArray(parsedUnknown.state)) {
                this.j.warn('Could not revive serialized processes, wrong format', parsedUnknown);
                return undefined;
            }
            const parsedCrossVersion = parsedUnknown;
            if (parsedCrossVersion.version !== 1) {
                this.j.warn(`Could not revive serialized processes, wrong version "${parsedCrossVersion.version}"`, parsedCrossVersion);
                return undefined;
            }
            return parsedCrossVersion.state;
        }
        s() {
            return this.m.getWorkspace().id;
        }
    }
    exports.$nWb = $nWb;
});
//# sourceMappingURL=baseTerminalBackend.js.map