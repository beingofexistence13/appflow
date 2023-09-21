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
define(["require", "exports", "vs/base/common/network", "vs/base/common/platform", "vs/base/common/types", "vs/base/common/uri", "vs/nls", "vs/platform/commands/common/commands", "vs/platform/extensionManagement/common/extensionManagement", "vs/platform/extensionManagement/common/extensionManagementCLI", "vs/platform/extensionManagement/common/extensionManagementUtil", "vs/platform/instantiation/common/instantiation", "vs/platform/instantiation/common/serviceCollection", "vs/platform/label/common/label", "vs/platform/log/common/log", "vs/platform/opener/common/opener", "vs/workbench/services/environment/common/environmentService", "vs/workbench/services/extensionManagement/common/extensionManagement", "vs/workbench/services/extensions/common/extensionManifestPropertiesService"], function (require, exports, network_1, platform_1, types_1, uri_1, nls_1, commands_1, extensionManagement_1, extensionManagementCLI_1, extensionManagementUtil_1, instantiation_1, serviceCollection_1, label_1, log_1, opener_1, environmentService_1, extensionManagement_2, extensionManifestPropertiesService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    // this class contains the commands that the CLI server is reying on
    commands_1.CommandsRegistry.registerCommand('_remoteCLI.openExternal', function (accessor, uri) {
        const openerService = accessor.get(opener_1.IOpenerService);
        return openerService.open((0, types_1.isString)(uri) ? uri : uri_1.URI.revive(uri), { openExternal: true, allowTunneling: true });
    });
    commands_1.CommandsRegistry.registerCommand('_remoteCLI.windowOpen', function (accessor, toOpen, options) {
        const commandService = accessor.get(commands_1.ICommandService);
        if (!toOpen.length) {
            return commandService.executeCommand('_files.newWindow', options);
        }
        return commandService.executeCommand('_files.windowOpen', toOpen, options);
    });
    commands_1.CommandsRegistry.registerCommand('_remoteCLI.getSystemStatus', function (accessor) {
        const commandService = accessor.get(commands_1.ICommandService);
        return commandService.executeCommand('_issues.getSystemStatus');
    });
    commands_1.CommandsRegistry.registerCommand('_remoteCLI.manageExtensions', async function (accessor, args) {
        const instantiationService = accessor.get(instantiation_1.IInstantiationService);
        const extensionManagementServerService = accessor.get(extensionManagement_2.IExtensionManagementServerService);
        const remoteExtensionManagementService = extensionManagementServerService.remoteExtensionManagementServer?.extensionManagementService;
        if (!remoteExtensionManagementService) {
            return;
        }
        const lines = [];
        const logger = new class extends log_1.AbstractMessageLogger {
            log(level, message) {
                lines.push(message);
            }
        }();
        const cliService = instantiationService.createChild(new serviceCollection_1.ServiceCollection([extensionManagement_1.IExtensionManagementService, remoteExtensionManagementService])).createInstance(RemoteExtensionManagementCLI, logger);
        if (args.list) {
            await cliService.listExtensions(!!args.list.showVersions, args.list.category, undefined);
        }
        else {
            const revive = (inputs) => inputs.map(input => (0, types_1.isString)(input) ? input : uri_1.URI.revive(input));
            if (Array.isArray(args.install) && args.install.length) {
                try {
                    await cliService.installExtensions(revive(args.install), [], { isMachineScoped: true }, !!args.force);
                }
                catch (e) {
                    lines.push(e.message);
                }
            }
            if (Array.isArray(args.uninstall) && args.uninstall.length) {
                try {
                    await cliService.uninstallExtensions(revive(args.uninstall), !!args.force, undefined);
                }
                catch (e) {
                    lines.push(e.message);
                }
            }
        }
        return lines.join('\n');
    });
    let RemoteExtensionManagementCLI = class RemoteExtensionManagementCLI extends extensionManagementCLI_1.ExtensionManagementCLI {
        constructor(logger, extensionManagementService, extensionGalleryService, labelService, envService, _extensionManifestPropertiesService) {
            super(logger, extensionManagementService, extensionGalleryService);
            this._extensionManifestPropertiesService = _extensionManifestPropertiesService;
            const remoteAuthority = envService.remoteAuthority;
            this._location = remoteAuthority ? labelService.getHostLabel(network_1.Schemas.vscodeRemote, remoteAuthority) : undefined;
        }
        get location() {
            return this._location;
        }
        validateExtensionKind(manifest) {
            if (!this._extensionManifestPropertiesService.canExecuteOnWorkspace(manifest)
                // Web extensions installed on remote can be run in web worker extension host
                && !(platform_1.isWeb && this._extensionManifestPropertiesService.canExecuteOnWeb(manifest))) {
                this.logger.info((0, nls_1.localize)('cannot be installed', "Cannot install the '{0}' extension because it is declared to not run in this setup.", (0, extensionManagementUtil_1.getExtensionId)(manifest.publisher, manifest.name)));
                return false;
            }
            return true;
        }
    };
    RemoteExtensionManagementCLI = __decorate([
        __param(1, extensionManagement_1.IExtensionManagementService),
        __param(2, extensionManagement_1.IExtensionGalleryService),
        __param(3, label_1.ILabelService),
        __param(4, environmentService_1.IWorkbenchEnvironmentService),
        __param(5, extensionManifestPropertiesService_1.IExtensionManifestPropertiesService)
    ], RemoteExtensionManagementCLI);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpblRocmVhZENMSUNvbW1hbmRzLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vd29ya3NwYWNlL2FwcGZsb3cvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2FwaS9icm93c2VyL21haW5UaHJlYWRDTElDb21tYW5kcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7OztJQXVCaEcsb0VBQW9FO0lBRXBFLDJCQUFnQixDQUFDLGVBQWUsQ0FBQyx5QkFBeUIsRUFBRSxVQUFVLFFBQTBCLEVBQUUsR0FBMkI7UUFDNUgsTUFBTSxhQUFhLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQyx1QkFBYyxDQUFDLENBQUM7UUFDbkQsT0FBTyxhQUFhLENBQUMsSUFBSSxDQUFDLElBQUEsZ0JBQVEsRUFBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxTQUFHLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxFQUFFLEVBQUUsWUFBWSxFQUFFLElBQUksRUFBRSxjQUFjLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQztJQUNoSCxDQUFDLENBQUMsQ0FBQztJQUVILDJCQUFnQixDQUFDLGVBQWUsQ0FBQyx1QkFBdUIsRUFBRSxVQUFVLFFBQTBCLEVBQUUsTUFBeUIsRUFBRSxPQUEyQjtRQUNySixNQUFNLGNBQWMsR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLDBCQUFlLENBQUMsQ0FBQztRQUNyRCxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sRUFBRTtZQUNuQixPQUFPLGNBQWMsQ0FBQyxjQUFjLENBQUMsa0JBQWtCLEVBQUUsT0FBTyxDQUFDLENBQUM7U0FDbEU7UUFDRCxPQUFPLGNBQWMsQ0FBQyxjQUFjLENBQUMsbUJBQW1CLEVBQUUsTUFBTSxFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBQzVFLENBQUMsQ0FBQyxDQUFDO0lBRUgsMkJBQWdCLENBQUMsZUFBZSxDQUFDLDRCQUE0QixFQUFFLFVB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