/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/instantiation/common/extensions", "vs/platform/ipc/electron-sandbox/services", "vs/platform/registry/common/platform", "vs/platform/terminal/common/terminal", "vs/workbench/common/contributions", "vs/workbench/contrib/terminal/common/terminal", "vs/workbench/contrib/terminal/electron-sandbox/terminalNativeContribution", "vs/workbench/contrib/terminal/electron-sandbox/terminalProfileResolverService", "vs/workbench/contrib/terminal/electron-sandbox/localTerminalBackend"], function (require, exports, extensions_1, services_1, platform_1, terminal_1, contributions_1, terminal_2, terminalNativeContribution_1, terminalProfileResolverService_1, localTerminalBackend_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    // Register services
    (0, services_1.$z7b)(terminal_1.$Yq, terminal_1.TerminalIpcChannels.LocalPty);
    (0, extensions_1.$mr)(terminal_2.$EM, terminalProfileResolverService_1.$Cac, 1 /* InstantiationType.Delayed */);
    // Register workbench contributions
    const workbenchRegistry = platform_1.$8m.as(contributions_1.Extensions.Workbench);
    // This contribution needs to be active during the Startup phase to be available when a remote resolver tries to open a local
    // terminal while connecting to the remote.
    workbenchRegistry.registerWorkbenchContribution(localTerminalBackend_1.$Eac, 1 /* LifecyclePhase.Starting */);
    workbenchRegistry.registerWorkbenchContribution(terminalNativeContribution_1.$Bac, 3 /* LifecyclePhase.Restored */);
});
//# sourceMappingURL=terminal.contribution.js.map