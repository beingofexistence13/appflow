/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/network", "vs/nls"], function (require, exports, event_1, lifecycle_1, network_1, nls_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.BaseTerminalBackend = void 0;
    class BaseTerminalBackend extends lifecycle_1.Disposable {
        get isResponsive() { return !this._isPtyHostUnresponsive; }
        constructor(_ptyHostController, _logService, historyService, configurationResolverService, statusBarService, _workspaceContextService) {
            super();
            this._ptyHostController = _ptyHostController;
            this._logService = _logService;
            this._workspaceContextService = _workspaceContextService;
            this._isPtyHostUnresponsive = false;
            this._onPtyHostConnected = this._register(new event_1.Emitter());
            this.onPtyHostConnected = this._onPtyHostConnected.event;
            this._onPtyHostRestart = this._register(new event_1.Emitter());
            this.onPtyHostRestart = this._onPtyHostRestart.event;
            this._onPtyHostUnresponsive = this._register(new event_1.Emitter());
            this.onPtyHostUnresponsive = this._onPtyHostUnresponsive.event;
            this._onPtyHostResponsive = this._register(new event_1.Emitter());
            this.onPtyHostResponsive = this._onPtyHostResponsive.event;
            let unresponsiveStatusBarEntry;
            let statusBarAccessor;
            let hasStarted = false;
            // Attach pty host listeners
            this._register(this._ptyHostController.onPtyHostExit(() => {
                this._logService.error(`The terminal's pty host process exited, the connection to all terminal processes was lost`);
            }));
            this.onPtyHostConnected(() => hasStarted = true);
            this._register(this._ptyHostController.onPtyHostStart(() => {
                this._logService.debug(`The terminal's pty host process is starting`);
                // Only fire the _restart_ event after it has started
                if (hasStarted) {
                    this._logService.trace('IPtyHostController#onPtyHostRestart');
                    this._onPtyHostRestart.fire();
                }
                statusBarAccessor?.dispose();
                this._isPtyHostUnresponsive = false;
            }));
            this._register(this._ptyHostController.onPtyHostUnresponsive(() => {
                statusBarAccessor?.dispose();
                if (!unresponsiveStatusBarEntry) {
                    unresponsiveStatusBarEntry = {
                        name: (0, nls_1.localize)('ptyHostStatus', 'Pty Host Status'),
                        text: `$(debug-disconnect) ${(0, nls_1.localize)('ptyHostStatus.short', 'Pty Host')}`,
                        tooltip: (0, nls_1.localize)('nonResponsivePtyHost', "The connection to the terminal's pty host process is unresponsive, terminals may stop working. Click to manually restart the pty host."),
                        ariaLabel: (0, nls_1.localize)('ptyHostStatus.ariaLabel', 'Pty Host is unresponsive'),
                        command: "workbench.action.terminal.restartPtyHost" /* TerminalCommandId.RestartPtyHost */,
                        kind: 'warning'
                    };
                }
                statusBarAccessor = statusBarService.addEntry(unresponsiveStatusBarEntry, 'ptyHostStatus', 0 /* StatusbarAlignment.LEFT */);
                this._isPtyHostUnresponsive = true;
                this._onPtyHostUnresponsive.fire();
            }));
            this._register(this._ptyHostController.onPtyHostResponsive(() => {
                if (!this._isPtyHostUnresponsive) {
                    return;
                }
                this._logService.info('The pty host became responsive again');
                statusBarAccessor?.dispose();
                this._isPtyHostUnresponsive = false;
                this._onPtyHostResponsive.fire();
            }));
            this._register(this._ptyHostController.onPtyHostRequestResolveVariables(async (e) => {
                // Only answer requests for this workspace
                if (e.workspaceId !== this._workspaceContextService.getWorkspace().id) {
                    return;
                }
                const activeWorkspaceRootUri = historyService.getLastActiveWorkspaceRoot(network_1.Schemas.file);
                const lastActiveWorkspaceRoot = activeWorkspaceRootUri ? this._workspaceContextService.getWorkspaceFolder(activeWorkspaceRootUri) ?? undefined : undefined;
                const resolveCalls = e.originalText.map(t => {
                    return configurationResolverService.resolveAsync(lastActiveWorkspaceRoot, t);
                });
                const result = await Promise.all(resolveCalls);
                this._ptyHostController.acceptPtyHostResolvedVariables(e.requestId, result);
            }));
        }
        restartPtyHost() {
            this._ptyHostController.restartPtyHost();
        }
        _deserializeTerminalState(serializedState) {
            if (serializedState === undefined) {
                return undefined;
            }
            const parsedUnknown = JSON.parse(serializedState);
            if (!('version' in parsedUnknown) || !('state' in parsedUnknown) || !Array.isArray(parsedUnknown.state)) {
                this._logService.warn('Could not revive serialized processes, wrong format', parsedUnknown);
                return undefined;
            }
            const parsedCrossVersion = parsedUnknown;
            if (parsedCrossVersion.version !== 1) {
                this._logService.warn(`Could not revive serialized processes, wrong version "${parsedCrossVersion.version}"`, parsedCrossVersion);
                return undefined;
            }
            return parsedCrossVersion.state;
        }
        _getWorkspaceId() {
            return this._workspaceContextService.getWorkspace().id;
        }
    }
    exports.BaseTerminalBackend = BaseTerminalBackend;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFzZVRlcm1pbmFsQmFja2VuZC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL3dvcmtzcGFjZS9hcHBmbG93L3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL3Rlcm1pbmFsL2Jyb3dzZXIvYmFzZVRlcm1pbmFsQmFja2VuZC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFhaEcsTUFBc0IsbUJBQW9CLFNBQVEsc0JBQVU7UUFHM0QsSUFBSSxZQUFZLEtBQWMsT0FBTyxDQUFDLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDLENBQUM7UUFXcEUsWUFDa0Isa0JBQXNDLEVBQ3BDLFdBQWdDLEVBQ25ELGNBQStCLEVBQy9CLDRCQUEyRCxFQUMzRCxnQkFBbUMsRUFDaEIsd0JBQWtEO1lBRXJFLEtBQUssRUFBRSxDQUFDO1lBUFMsdUJBQWtCLEdBQWxCLGtCQUFrQixDQUFvQjtZQUNwQyxnQkFBVyxHQUFYLFdBQVcsQ0FBcUI7WUFJaEMsNkJBQXdCLEdBQXhCLHdCQUF3QixDQUEwQjtZQW5COUQsMkJBQXNCLEdBQVksS0FBSyxDQUFDO1lBSTdCLHdCQUFtQixHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxlQUFPLEVBQVEsQ0FBQyxDQUFDO1lBQ3BFLHVCQUFrQixHQUFHLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxLQUFLLENBQUM7WUFDMUMsc0JBQWlCLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLGVBQU8sRUFBUSxDQUFDLENBQUM7WUFDbEUscUJBQWdCLEdBQUcsSUFBSSxDQUFDLGlCQUFpQixDQUFDLEtBQUssQ0FBQztZQUN0QywyQkFBc0IsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksZUFBTyxFQUFRLENBQUMsQ0FBQztZQUN2RSwwQkFBcUIsR0FBRyxJQUFJLENBQUMsc0JBQXNCLENBQUMsS0FBSyxDQUFDO1lBQ2hELHlCQUFvQixHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMs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