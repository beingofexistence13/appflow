/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/uriIpc", "vs/base/parts/ipc/common/ipc", "vs/base/parts/ipc/node/ipc.cp", "vs/base/parts/ipc/node/ipc.mp", "vs/nls", "vs/platform/environment/node/argv", "vs/platform/environment/node/environmentService", "vs/platform/log/common/log", "vs/platform/log/common/logIpc", "vs/platform/log/common/logService", "vs/platform/log/node/loggerService", "vs/platform/product/common/product", "vs/platform/terminal/common/terminal", "vs/platform/terminal/node/heartbeatService", "vs/platform/terminal/node/ptyService", "vs/base/parts/sandbox/node/electronTypes", "vs/base/common/async", "vs/base/common/lifecycle"], function (require, exports, uriIpc_1, ipc_1, ipc_cp_1, ipc_mp_1, nls_1, argv_1, environmentService_1, log_1, logIpc_1, logService_1, loggerService_1, product_1, terminal_1, heartbeatService_1, ptyService_1, electronTypes_1, async_1, lifecycle_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    startPtyHost();
    async function startPtyHost() {
        // Parse environment variables
        const startupDelay = parseInt(process.env.VSCODE_STARTUP_DELAY ?? '0');
        const simulatedLatency = parseInt(process.env.VSCODE_LATENCY ?? '0');
        const reconnectConstants = {
            graceTime: parseInt(process.env.VSCODE_RECONNECT_GRACE_TIME || '0'),
            shortGraceTime: parseInt(process.env.VSCODE_RECONNECT_SHORT_GRACE_TIME || '0'),
            scrollback: parseInt(process.env.VSCODE_RECONNECT_SCROLLBACK || '100')
        };
        // Sanitize environment
        delete process.env.VSCODE_RECONNECT_GRACE_TIME;
        delete process.env.VSCODE_RECONNECT_SHORT_GRACE_TIME;
        delete process.env.VSCODE_RECONNECT_SCROLLBACK;
        delete process.env.VSCODE_LATENCY;
        delete process.env.VSCODE_STARTUP_DELAY;
        // Delay startup if needed, this must occur before RPC is setup to avoid the channel from timing
        // out.
        if (startupDelay) {
            await (0, async_1.timeout)(startupDelay);
        }
        // Setup RPC
        const _isUtilityProcess = (0, electronTypes_1.isUtilityProcess)(process);
        let server;
        if (_isUtilityProcess) {
            server = new ipc_mp_1.Server();
        }
        else {
            server = new ipc_cp_1.Server(terminal_1.TerminalIpcChannels.PtyHost);
        }
        // Services
        const productService = { _serviceBrand: undefined, ...product_1.default };
        const environmentService = new environmentService_1.NativeEnvironmentService((0, argv_1.parseArgs)(process.argv, argv_1.OPTIONS), productService);
        const loggerService = new loggerService_1.LoggerService((0, log_1.getLogLevel)(environmentService), environmentService.logsHome);
        server.registerChannel(terminal_1.TerminalIpcChannels.Logger, new logIpc_1.LoggerChannel(loggerService, () => uriIpc_1.DefaultURITransformer));
        const logger = loggerService.createLogger('ptyhost', { name: (0, nls_1.localize)('ptyHost', "Pty Host") });
        const logService = new logService_1.LogService(logger);
        // Log developer config
        if (startupDelay) {
            logService.warn(`Pty Host startup is delayed ${startupDelay}ms`);
        }
        if (simulatedLatency) {
            logService.warn(`Pty host is simulating ${simulatedLatency}ms latency`);
        }
        const disposables = new lifecycle_1.DisposableStore();
        // Heartbeat responsiveness tracking
        const heartbeatService = new heartbeatService_1.HeartbeatService();
        server.registerChannel(terminal_1.TerminalIpcChannels.Heartbeat, ipc_1.ProxyChannel.fromService(heartbeatService, disposables));
        // Init pty service
        const ptyService = new ptyService_1.PtyService(logService, productService, reconnectConstants, simulatedLatency);
        const ptyServiceChannel = ipc_1.ProxyChannel.fromService(ptyService, disposables);
        server.registerChannel(terminal_1.TerminalIpcChannels.PtyHost, ptyServiceChannel);
        // Register a channel for direct communication via Message Port
        if (_isUtilityProcess) {
            server.registerChannel(terminal_1.TerminalIpcChannels.PtyHostWindow, ptyServiceChannel);
        }
        // Clean up
        process.once('exit', () => {
            logService.trace('Pty host exiting');
            logService.dispose();
            heartbeatService.dispose();
            ptyService.dispose();
        });
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHR5SG9zdE1haW4uanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy93b3Jrc3BhY2UvYXBwZmxvdy9zcmMvIiwic291cmNlcyI6WyJ2cy9wbGF0Zm9ybS90ZXJtaW5hbC9ub2RlL3B0eUhvc3RNYWluLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7O0lBc0JoRyxZQUFZLEVBQUUsQ0FBQztJQUVmLEtBQUssVUFBVSxZQUFZO1FBQzFCLDhCQUE4QjtRQUM5QixNQUFNLFlBQVksR0FBRyxRQUFRLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxvQkFBb0IsSUFBSSxHQUFHLENBQUMsQ0FBQztRQUN2RSxNQUFNLGdCQUFnQixHQUFHLFFBQVEsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLGNBQWMsSUFBSSxHQUFHLENBQUMsQ0FBQztRQUNyRSxNQUFNLGtCQUFrQixHQUF3QjtZQUMvQyxTQUFTLEVBQUUsUUFBUSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsMkJBQTJCLElBQUksR0FBRyxDQUFDO1lBQ25FLGNBQWMsRUFBRSxRQUFRLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxpQ0FBaUMsSUFBSSxHQUFHLENBQUM7WUFDOUUsVUFBVSxFQUFFLFFBQVEsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLDJCQUEyQixJQUFJLEtBQUssQ0FBQztTQUN0RSxDQUFDO1FBRUYsdUJBQXVCO1FBQ3ZCLE9BQU8sT0FBTyxDQUFDLEdBQUcsQ0FBQywyQkFBMkIsQ0FBQztRQUMvQyxPQUFPLE9BQU8sQ0FBQyxHQUFHLENBQUMsaUNBQWlDLENBQUM7UUFDckQsT0FBTyxPQUFPLENBQUMsR0FBRyxDQUFDLDJCQUEyQixDQUFDO1FBQy9DLE9BQU8sT0FBTyxDQUFDLEdBQUcsQ0FBQyxjQUFjLENBQUM7UUFDbEMsT0FBTyxPQUFPLENBQUMsR0FBRyxDQUFDLG9CQUFvQixDQUFDO1FBRXhDLGdHQUFnRztRQUNoRyxPQUFPO1FBQ1AsSUFBSSxZQUFZLEVBQUU7WUFD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