/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/uriIpc", "vs/base/parts/ipc/common/ipc", "vs/base/parts/ipc/node/ipc.cp", "vs/base/parts/ipc/node/ipc.mp", "vs/nls!vs/platform/terminal/node/ptyHostMain", "vs/platform/environment/node/argv", "vs/platform/environment/node/environmentService", "vs/platform/log/common/log", "vs/platform/log/common/logIpc", "vs/platform/log/common/logService", "vs/platform/log/node/loggerService", "vs/platform/product/common/product", "vs/platform/terminal/common/terminal", "vs/platform/terminal/node/heartbeatService", "vs/platform/terminal/node/ptyService", "vs/base/parts/sandbox/node/electronTypes", "vs/base/common/async", "vs/base/common/lifecycle"], function (require, exports, uriIpc_1, ipc_1, ipc_cp_1, ipc_mp_1, nls_1, argv_1, environmentService_1, log_1, logIpc_1, logService_1, loggerService_1, product_1, terminal_1, heartbeatService_1, ptyService_1, electronTypes_1, async_1, lifecycle_1) {
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
            await (0, async_1.$Hg)(startupDelay);
        }
        // Setup RPC
        const _isUtilityProcess = (0, electronTypes_1.$7S)(process);
        let server;
        if (_isUtilityProcess) {
            server = new ipc_mp_1.$8S();
        }
        else {
            server = new ipc_cp_1.$Rp(terminal_1.TerminalIpcChannels.PtyHost);
        }
        // Services
        const productService = { _serviceBrand: undefined, ...product_1.default };
        const environmentService = new environmentService_1.$_l((0, argv_1.$zl)(process.argv, argv_1.$yl), productService);
        const loggerService = new loggerService_1.$cN((0, log_1.$gj)(environmentService), environmentService.logsHome);
        server.registerChannel(terminal_1.TerminalIpcChannels.Logger, new logIpc_1.$2q(loggerService, () => uriIpc_1.$Cm));
        const logger = loggerService.createLogger('ptyhost', { name: (0, nls_1.localize)(0, null) });
        const logService = new logService_1.$mN(logger);
        // Log developer config
        if (startupDelay) {
            logService.warn(`Pty Host startup is delayed ${startupDelay}ms`);
        }
        if (simulatedLatency) {
            logService.warn(`Pty host is simulating ${simulatedLatency}ms latency`);
        }
        const disposables = new lifecycle_1.$jc();
        // Heartbeat responsiveness tracking
        const heartbeatService = new heartbeatService_1.$P$b();
        server.registerChannel(terminal_1.TerminalIpcChannels.Heartbeat, ipc_1.ProxyChannel.fromService(heartbeatService, disposables));
        // Init pty service
        const ptyService = new ptyService_1.$T$b(logService, productService, reconnectConstants, simulatedLatency);
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
//# sourceMappingURL=ptyHostMain.js.map