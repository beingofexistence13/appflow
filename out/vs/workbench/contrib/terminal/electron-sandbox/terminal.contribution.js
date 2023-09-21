/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/instantiation/common/extensions", "vs/platform/ipc/electron-sandbox/services", "vs/platform/registry/common/platform", "vs/platform/terminal/common/terminal", "vs/workbench/common/contributions", "vs/workbench/contrib/terminal/common/terminal", "vs/workbench/contrib/terminal/electron-sandbox/terminalNativeContribution", "vs/workbench/contrib/terminal/electron-sandbox/terminalProfileResolverService", "vs/workbench/contrib/terminal/electron-sandbox/localTerminalBackend"], function (require, exports, extensions_1, services_1, platform_1, terminal_1, contributions_1, terminal_2, terminalNativeContribution_1, terminalProfileResolverService_1, localTerminalBackend_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    // Register services
    (0, services_1.registerMainProcessRemoteService)(terminal_1.ILocalPtyService, terminal_1.TerminalIpcChannels.LocalPty);
    (0, extensions_1.registerSingleton)(terminal_2.ITerminalProfileResolverService, terminalProfileResolverService_1.ElectronTerminalProfileResolverService, 1 /* InstantiationType.Delayed */);
    // Register workbench contributions
    const workbenchRegistry = platform_1.Registry.as(contributions_1.Extensions.Workbench);
    // This contribution needs to be active during the Startup phase to be available when a remote resolver tries to open a local
    // terminal while connecting to the remote.
    workbenchRegistry.registerWorkbenchContribution(localTerminalBackend_1.LocalTerminalBackendContribution, 1 /* LifecyclePhase.Starting */);
    workbenchRegistry.registerWorkbenchContribution(terminalNativeContribution_1.TerminalNativeContribution, 3 /* LifecyclePhase.Restored */);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVybWluYWwuY29udHJpYnV0aW9uLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvdGVybWluYWwvZWxlY3Ryb24tc2FuZGJveC90ZXJtaW5hbC5jb250cmlidXRpb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7SUFhaEcsb0JBQW9CO0lBQ3BCLElBQUEsMkNBQWdDLEVBQUMsMkJBQWdCLEVBQUUsOEJBQW1CLENBQUMsUUFBUSxDQUFDLENBQUM7SUFDakYsSUFBQSw4QkFBaUIsRUFBQywwQ0FBK0IsRUFBRSx1RUFBc0Msb0NBQTRCLENBQUM7SUFFdEgsbUNBQW1DO0lBQ25DLE1BQU0saUJBQWlCLEdBQUcsbUJBQVEsQ0FBQyxFQUFFLENBQWtDLDBCQUFtQixDQUFDLFNBQVMsQ0FBQyxDQUFDO0lBRXRHLDZIQUE2SDtJQUM3SCwyQ0FBMkM7SUFDM0MsaUJBQWlCLENBQUMsNkJBQTZCLENBQUMsdURBQWdDLGtDQUEwQixDQUFDO0lBQzNHLGlCQUFpQixDQUFDLDZCQUE2QixDQUFDLHVEQUEwQixrQ0FBMEIsQ0FBQyJ9