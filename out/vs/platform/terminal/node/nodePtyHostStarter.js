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
define(["require", "exports", "vs/base/common/lifecycle", "vs/base/common/network", "vs/base/parts/ipc/node/ipc.cp", "vs/platform/environment/common/environment", "vs/platform/environment/node/environmentService"], function (require, exports, lifecycle_1, network_1, ipc_cp_1, environment_1, environmentService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.NodePtyHostStarter = void 0;
    let NodePtyHostStarter = class NodePtyHostStarter extends lifecycle_1.Disposable {
        constructor(_reconnectConstants, _environmentService) {
            super();
            this._reconnectConstants = _reconnectConstants;
            this._environmentService = _environmentService;
        }
        start() {
            const opts = {
                serverName: 'Pty Host',
                args: ['--type=ptyHost', '--logsPath', this._environmentService.logsHome.with({ scheme: network_1.Schemas.file }).fsPath],
                env: {
                    VSCODE_AMD_ENTRYPOINT: 'vs/platform/terminal/node/ptyHostMain',
                    VSCODE_PIPE_LOGGING: 'true',
                    VSCODE_VERBOSE_LOGGING: 'true',
                    VSCODE_RECONNECT_GRACE_TIME: this._reconnectConstants.graceTime,
                    VSCODE_RECONNECT_SHORT_GRACE_TIME: this._reconnectConstants.shortGraceTime,
                    VSCODE_RECONNECT_SCROLLBACK: this._reconnectConstants.scrollback
                }
            };
            const ptyHostDebug = (0, environmentService_1.parsePtyHostDebugPort)(this._environmentService.args, this._environmentService.isBuilt);
            if (ptyHostDebug) {
                if (ptyHostDebug.break && ptyHostDebug.port) {
                    opts.debugBrk = ptyHostDebug.port;
                }
                else if (!ptyHostDebug.break && ptyHostDebug.port) {
                    opts.debug = ptyHostDebug.port;
                }
            }
            const client = new ipc_cp_1.Client(network_1.FileAccess.asFileUri('bootstrap-fork').fsPath, opts);
            const store = new lifecycle_1.DisposableStore();
            store.add(client);
            return {
                client,
                store,
                onDidProcessExit: client.onDidProcessExit
            };
        }
    };
    exports.NodePtyHostStarter = NodePtyHostStarter;
    exports.NodePtyHostStarter = NodePtyHostStarter = __decorate([
        __param(1, environment_1.IEnvironmentService)
    ], NodePtyHostStarter);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm9kZVB0eUhvc3RTdGFydGVyLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvcGxhdGZvcm0vdGVybWluYWwvbm9kZS9ub2RlUHR5SG9zdFN0YXJ0ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBVXpGLElBQU0sa0JBQWtCLEdBQXhCLE1BQU0sa0JBQW1CLFNBQVEsc0JBQVU7UUFDakQsWUFDa0IsbUJBQXdDLEVBQ25CLG1CQUE4QztZQUVwRixLQUFLLEVBQUUsQ0FBQztZQUhTLHdCQUFtQixHQUFuQixtQkFBbUIsQ0FBcUI7WUFDbkIsd0JBQW1CLEdBQW5CLG1CQUFtQixDQUEyQjtRQUdyRixDQUFDO1FBRUQsS0FBSztZQUNKLE1BQU0sSUFBSSxHQUFnQjtnQkFDekIsVUFBVSxFQUFFLFVBQVU7Z0JBQ3RCLElBQUksRUFBRSxDQUFDLGdCQUFnQixFQUFFLFlBQVksRUFBRSxJQUFJLENBQUMsbUJBQW1CLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxFQUFFLE1BQU0sRUFBRSxpQkFBTyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDO2dCQUMvRyxHQUFHLEVBQUU7b0JBQ0oscUJBQXFCLEVBQUUsdUNBQXVDO29CQUM5RCxtQkFBbUIsRUFBRSxNQUFNO29CQUMzQixzQkFBc0IsRUFBRSxNQUFNO29CQUM5QiwyQkFBMkIsRUFBRSxJQUFJLENBQUMsbUJBQW1CLENBQUMsU0FBUztvQkFDL0QsaUNBQWlDLEVBQUUsSUFBSSxDQUFDLG1CQUFtQixDQUFDLGNBQWM7b0JBQzFFLDJCQUEyQixFQUFFLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxVQUFVO2lCQUNoRTthQUNELENBQUM7WUFFRixNQUFNLFlBQVksR0FBRyxJQUFBLDBDQUFxQixFQUFDLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLG1CQUFtQixDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQzVHLElBQUksWUFBWSxFQUFFO2dCQUNqQixJQUFJLFlBQVksQ0FBQyxLQUFLLElBQUksWUFBWSxDQUFDLElBQUksRUFBRTtvQkFDNUMsSUFBSSxDQUFDLFFBQVEsR0FBRyxZQUFZLENBQUMsSUFBSSxDQUFDO2lCQUNsQztxQkFBTSxJQUFJLENBQUMsWUFBWSxDQUFDLEtBQUssSUFBSSxZQUFZLENBQUMsSUFBSSxFQUFFO29CQUNwRCxJQUFJLENBQUMsS0FBSyxHQUFHLFlBQVksQ0FBQyxJQUFJLENBQUM7aUJBQy9CO2FBQ0Q7WUFFRCxNQUFNLE1BQU0sR0FBRyxJQUFJLGVBQU0sQ0FBQyxvQkFBVSxDQUFDLFNBQVMsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsQ0FBQztZQUUvRSxNQUFNLEtBQUssR0FBRyxJQUFJLDJCQUFlLEVBQUUsQ0FBQztZQUNwQyxLQUFLLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBRWxCLE9BQU87Z0JBQ04sTUFBTTtnQkFDTixLQUFLO2dCQUNMLGdCQUFnQixFQUFFLE1BQU0sQ0FBQyxnQkFBZ0I7YUFDekMsQ0FBQztRQUNILENBQUM7S0FDRCxDQUFBO0lBMUNZLGdEQUFrQjtpQ0FBbEIsa0JBQWtCO1FBRzVCLFdBQUEsaUNBQW1CLENBQUE7T0FIVCxrQkFBa0IsQ0EwQzlCIn0=